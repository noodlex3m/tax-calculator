import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

// НОВІ ІМПОРТИ ДЛЯ FIREBASE (ОПТИМІЗОВАНО)
import { db } from "../firebase";
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	getDoc,
	setDoc,
	deleteDoc,
} from "firebase/firestore";
import PersonalDataConsent from "./PersonalDataConsent";
import { toast } from "react-hot-toast";
import kvedData from "../data/kvedData";
import { objectTypes } from "../data/objectTypesData";

const Dashboard = () => {
	const { user, logout, updateUser } = useAuth();
	const [history, setHistory] = useState([]);
	const [activeTab, setActiveTab] = useState("history");

	const [editName, setEditName] = useState(user?.name || "");
	const [editEmail, setEditEmail] = useState(user?.email || "");
	const [editPassword, setEditPassword] = useState("");
	const [profileMessage, setProfileMessage] = useState("");
	const [profileError, setProfileError] = useState("");

	// Стан для розширеної облікової картки ФОП (персональні дані)
	const [profileData, setProfileData] = useState({
		fopName: "",
		rnokpp: "",
		citizenship: "Україна",
		address: "",
		phone: "",
		taxSystem: "Спрощена система",
		taxGroup: "3 група",
		taxRate: "5%",
		isVatPayer: "Ні",
		esvBenefit: "Немає пільги",
		employeesCount: 0,
		esvNumber: "",
		mainKved: "",
		otherKveds: "",
		kvedsList: [],
		selectedObjects: [],
		rroCount: 0,
		prroCount: 0,
		activityAddresses: "",
		ibanAccounts: "",
		notes: "",
		consentGiven: false,
		consentTimestamp: "",
	});
	const [isProfileDataLoading, setIsProfileDataLoading] = useState(true);
	const [isSavingProfileData, setIsSavingProfileData] = useState(false);

	useEffect(() => {
		if (user) {
			setEditName(user.name || "");
			setEditEmail(user.email || "");
		}
	}, [user]);

	const handleProfileUpdate = (e) => {
		e.preventDefault();
		setProfileMessage("");
		setProfileError("");

		try {
			updateUser({ name: editName, email: editEmail });
			setProfileMessage("✅ Профіль успішно оновлено!");
			setEditPassword("");
		} catch (err) {
			console.error("Profile update error:", err);
			setProfileError("❌ Помилка при оновленні профілю.");
		}
	};

	// 🔥 МАГІЯ FIREBASE: Читання історії розрахунків з бази даних
	useEffect(() => {
		const fetchHistoryFromFirebase = async () => {
			if (!user) return;

			try {
				const q = query(
					collection(db, "calculations"),
					where("userId", "==", user.uid),
				);

				const querySnapshot = await getDocs(q);
				const fetchedHistory = [];

				querySnapshot.forEach((doc) => {
					fetchedHistory.push(doc.data());
				});

				fetchedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
				setHistory(fetchedHistory);
			} catch (error) {
				console.error("Помилка завантаження історії:", error);
			}
		};

		if (activeTab === "history") {
			fetchHistoryFromFirebase();
		}
	}, [user, activeTab]);

	// 🔥 МАГІЯ FIREBASE: Читання розширеної облікової картки ФОП
	useEffect(() => {
		const fetchProfileData = async () => {
			if (!user) return;
			setIsProfileDataLoading(true);
			try {
				const docRef = doc(db, "userProfiles", user.uid);
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					const data = docSnap.data();
					
					// Міграція КВЕДів з рядків у структурований масив
					if (!data.kvedsList || !Array.isArray(data.kvedsList)) {
						const list = [];
						if (data.mainKved) {
							const matched = kvedData.find(k => k.code === data.mainKved);
							list.push({
								code: data.mainKved,
								name: matched ? matched.name : "Основний вид діяльності",
								isMain: true
							});
						}
						if (data.otherKveds) {
							const codes = data.otherKveds.split(",").map(c => c.trim()).filter(Boolean);
							codes.forEach(c => {
								if (c !== data.mainKved && !list.some(k => k.code === c)) {
									const matched = kvedData.find(k => k.code === c);
									list.push({
										code: c,
										name: matched ? matched.name : "Додатковий вид діяльності",
										isMain: false
									});
								}
							});
						}
						data.kvedsList = list;
					}
					
					// Міграція об'єктів 20-ОПП з рядків у структурований масив
					if (!data.selectedObjects || !Array.isArray(data.selectedObjects)) {
						const list = [];
						if (data.taxObjects) {
							const names = data.taxObjects.split(",").map(n => n.trim()).filter(Boolean);
							names.forEach((n, idx) => {
								let code = "321"; // Дефолт: МАГАЗИН
								let typeName = "МАГАЗИН";
								const lowerN = n.toLowerCase();
								if (lowerN.includes("офіс") || lowerN.includes("контор")) {
									code = "283";
									typeName = "КОНТОРА";
								} else if (lowerN.includes("склад") || lowerN.includes("комор")) {
									code = "267";
									typeName = "КОМОРА";
								} else if (lowerN.includes("кіоск")) {
									code = "2";
									typeName = "КІОСК";
								} else if (lowerN.includes("аптек")) {
									code = "47";
									typeName = "АПТЕКА";
								}
								list.push({
									id: `legacy-${idx}-${Date.now()}`,
									code,
									typeName,
									customName: n,
									address: ""
								});
							});
						}
						data.selectedObjects = list;
					}
					
					// Міграція платника ПДВ
					if (data.isVatPayer === undefined) {
						data.isVatPayer = (data.taxRate && (data.taxRate.includes("3%") || data.taxRate.includes("з ПДВ"))) ? "Так" : "Ні";
					}
					
					// Міграція кількості РРО/ПРРО
					if (data.rroCount === undefined) {
						data.rroCount = (data.usesRro && data.usesRro.includes("класичний")) ? 1 : 0;
					}
					if (data.prroCount === undefined) {
						data.prroCount = (data.usesRro && data.usesRro.includes("програмний")) ? 1 : 0;
					}
					
					// Міграція пільг ЄСВ
					if (data.esvBenefit === undefined) {
						data.esvBenefit = "Немає пільги";
					}

					// Завантаження кількості працівників
					if (data.employeesCount === undefined) {
						data.employeesCount = 0;
					}
					
					setProfileData(data);
				} else {
					setProfileData({
						fopName: "",
						rnokpp: "",
						citizenship: "Україна",
						address: "",
						phone: "",
						taxSystem: "Спрощена система",
						taxGroup: "3 група",
						taxRate: "5%",
						isVatPayer: "Ні",
						esvBenefit: "Немає пільги",
						employeesCount: 0,
						esvNumber: "",
						mainKved: "",
						otherKveds: "",
						kvedsList: [],
						selectedObjects: [],
						rroCount: 0,
						prroCount: 0,
						activityAddresses: "",
						ibanAccounts: "",
						notes: "",
						consentGiven: false,
						consentTimestamp: "",
					});
				}
			} catch (error) {
				console.error("Помилка при завантаженні облікових даних:", error);
				toast.error("Не вдалося завантажити облікові дані");
			} finally {
				setIsProfileDataLoading(false);
			}
		};

		if (activeTab === "account") {
			fetchProfileData();
		}
	}, [user, activeTab]);

	// Реактивна синхронізація параметрів оподаткування згідно з ПКУ
	useEffect(() => {
		let changed = false;
		const updated = { ...profileData };

		if (profileData.taxSystem === "Загальна система") {
			if (profileData.taxGroup !== "Загальна система / Не застосовується") {
				updated.taxGroup = "Загальна система / Не застосовується";
				changed = true;
			}
			if (profileData.taxRate !== "Не застосовується") {
				updated.taxRate = "Не застосовується";
				changed = true;
			}
		} else if (profileData.taxSystem === "Спрощена система") {
			if (profileData.taxGroup === "Загальна система / Не застосовується") {
				updated.taxGroup = "3 група";
				changed = true;
			}

			if (updated.taxGroup === "1 група" || updated.taxGroup === "2 група") {
				if (profileData.taxRate !== "Фіксована ставка") {
					updated.taxRate = "Фіксована ставка";
					changed = true;
				}
				if (profileData.isVatPayer !== "Ні") {
					updated.isVatPayer = "Ні";
					changed = true;
				}
			} else if (updated.taxGroup === "3 група") {
				if (profileData.taxRate === "Фіксована ставка" || profileData.taxRate === "Не застосовується") {
					updated.taxRate = "5% (без ПДВ)";
					changed = true;
				}

				if (updated.taxRate === "3% (з ПДВ)") {
					if (profileData.isVatPayer !== "Так") {
						updated.isVatPayer = "Так";
						changed = true;
					}
				} else if (updated.taxRate === "5% (без ПДВ)") {
					if (profileData.isVatPayer !== "Ні") {
						updated.isVatPayer = "Ні";
						changed = true;
					}
				}
			}
		}

		// Валідація кількості найманих працівників відповідно до групи ФОП
		if (updated.taxGroup === "1 група") {
			if (profileData.employeesCount !== 0) {
				updated.employeesCount = 0;
				changed = true;
			}
		} else if (updated.taxGroup === "2 група") {
			if (profileData.employeesCount > 10) {
				updated.employeesCount = 10;
				changed = true;
				toast.error("На 2-й групі дозволено не більше 10 найманих працівників!");
			}
		}

		if (changed) {
			setProfileData(updated);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profileData.taxSystem, profileData.taxGroup, profileData.taxRate, profileData.employeesCount]);

	// Стан для інтерактивного вибору КВЕД та Об'єктів
	const [kvedSearchQuery, setKvedSearchQuery] = useState("");
	const [kvedSearchResults, setKvedSearchResults] = useState([]);
	const [objectSearchQuery, setObjectSearchQuery] = useState("");
	const [objectSearchResults, setObjectSearchResults] = useState([]);

	const handleKvedSearchChange = (e) => {
		const query = e.target.value;
		setKvedSearchQuery(query);
		if (!query.trim()) {
			setKvedSearchResults([]);
			return;
		}

		const filtered = kvedData.filter(
			(k) =>
				k.code.includes(query) ||
				k.name.toLowerCase().includes(query.toLowerCase()),
		);
		setKvedSearchResults(filtered.slice(0, 10));
	};

	const addKved = (kved) => {
		if (profileData.kvedsList.some((k) => k.code === kved.code)) {
			toast.error("Цей КВЕД вже додано!");
			return;
		}

		const newKved = {
			code: kved.code,
			name: kved.name,
			isMain: profileData.kvedsList.length === 0,
		};

		setProfileData((prev) => ({
			...prev,
			kvedsList: [...prev.kvedsList, newKved],
		}));
		setKvedSearchQuery("");
		setKvedSearchResults([]);
		toast.success(`КВЕД ${kved.code} додано!`);
	};

	const removeKved = (code) => {
		const updatedList = profileData.kvedsList.filter((k) => k.code !== code);
		if (profileData.kvedsList.find((k) => k.code === code)?.isMain && updatedList.length > 0) {
			// Find first non-main and set as main
			const newMainIdx = updatedList.findIndex(k => !k.isMain);
			if (newMainIdx !== -1) {
				updatedList[newMainIdx].isMain = true;
			}
		}

		setProfileData((prev) => ({
			...prev,
			kvedsList: updatedList,
		}));
		toast.success("КВЕД вилучено!");
	};

	const setMainKved = (code) => {
		const updatedList = profileData.kvedsList.map((k) => ({
			...k,
			isMain: k.code === code,
		}));
		setProfileData((prev) => ({
			...prev,
			kvedsList: updatedList,
		}));
		toast.success(`КВЕД ${code} встановлено як основний!`);
	};

	const handleObjectSearchChange = (e) => {
		const query = e.target.value;
		setObjectSearchQuery(query);
		if (!query.trim()) {
			setObjectSearchResults([]);
			return;
		}

		const filtered = objectTypes.filter(
			(obj) =>
				obj.code.includes(query) ||
				obj.name.toLowerCase().includes(query.toLowerCase()),
		);
		setObjectSearchResults(filtered.slice(0, 10));
	};

	const addObject = (objType) => {
		const newObj = {
			id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			code: objType.code,
			typeName: objType.name,
			customName: objType.name,
			address: "",
		};

		setProfileData((prev) => ({
			...prev,
			selectedObjects: [...prev.selectedObjects, newObj],
		}));
		setObjectSearchQuery("");
		setObjectSearchResults([]);
		toast.success(`Об'єкт "${objType.name}" додано!`);
	};

	const updateObjectField = (id, field, value) => {
		const updatedList = profileData.selectedObjects.map((obj) => {
			if (obj.id === id) {
				return { ...obj, [field]: value };
			}
			return obj;
		});

		setProfileData((prev) => ({
			...prev,
			selectedObjects: updatedList,
		}));
	};

	const removeObject = (id) => {
		const updatedList = profileData.selectedObjects.filter((obj) => obj.id !== id);
		setProfileData((prev) => ({
			...prev,
			selectedObjects: updatedList,
		}));
		toast.success("Об'єкт вилучено!");
	};

	// Запис згоди на обробку персональних даних
	const handleAcceptConsent = async () => {
		if (!user) return;
		setIsSavingProfileData(true);
		try {
			const updated = {
				...profileData,
				consentGiven: true,
				consentTimestamp: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			const docRef = doc(db, "userProfiles", user.uid);
			await setDoc(docRef, updated);
			setProfileData(updated);
			toast.success("Облікову картку ФОП активовано! 🚀");
		} catch (error) {
			console.error("Помилка збереження згоди:", error);
			toast.error("Не вдалося зберегти згоду");
		} finally {
			setIsSavingProfileData(false);
		}
	};

	// Збереження даних картки ФОП в БД
	const handleSaveProfileData = async (e) => {
		e.preventDefault();
		if (!user) return;
		setIsSavingProfileData(true);
		try {
			// Створення сумісних рядків для старих полів
			const mainKvedObj = (profileData.kvedsList || []).find((k) => k.isMain);
			const mainKved = mainKvedObj ? mainKvedObj.code : "";
			const otherKveds = (profileData.kvedsList || [])
				.filter((k) => !k.isMain)
				.map((k) => k.code)
				.join(", ");

			const taxObjects = (profileData.selectedObjects || [])
				.map((o) => o.customName || o.typeName)
				.filter(Boolean)
				.join(", ");

			let legacyUsesRro = "Не використовується";
			if (Number(profileData.rroCount) > 0 && Number(profileData.prroCount) > 0) {
				legacyUsesRro = "РРО та ПРРО";
			} else if (Number(profileData.rroCount) > 0) {
				legacyUsesRro = "РРО (класичний касовий апарат)";
			} else if (Number(profileData.prroCount) > 0) {
				legacyUsesRro = "ПРРО (програмний касовий апарат)";
			}

			const updated = {
				...profileData,
				mainKved,
				otherKveds,
				taxObjects,
				usesRro: legacyUsesRro,
				updatedAt: new Date().toISOString(),
			};
			const docRef = doc(db, "userProfiles", user.uid);
			await setDoc(docRef, updated);
			setProfileData(updated);
			toast.success("Облікові дані ФОП збережено в хмарі! 💾");
		} catch (error) {
			console.error("Помилка збереження картки ФОП:", error);
			toast.error("Не вдалося зберегти дані");
		} finally {
			setIsSavingProfileData(false);
		}
	};

	// Видалення всіх облікових даних (Право на забуття)
	const handleDeleteProfileData = async () => {
		if (!user) return;

		const confirmDelete = window.confirm(
			"⚠️ УВАГА! Ви дійсно бажаєте видалити всі облікові дані та відкликати згоду на обробку ПД з хмари Firestore?",
		);

		if (!confirmDelete) return;

		setIsSavingProfileData(true);
		try {
			const docRef = doc(db, "userProfiles", user.uid);
			await deleteDoc(docRef);

			setProfileData({
				fopName: "",
				rnokpp: "",
				citizenship: "Україна",
				address: "",
				phone: "",
				taxSystem: "Спрощена система",
				taxGroup: "3 група",
				taxRate: "5%",
				isVatPayer: "Ні",
				esvBenefit: "Немає пільги",
				employeesCount: 0,
				esvNumber: "",
				mainKved: "",
				otherKveds: "",
				kvedsList: [],
				selectedObjects: [],
				rroCount: 0,
				prroCount: 0,
				activityAddresses: "",
				ibanAccounts: "",
				notes: "",
				consentGiven: false,
				consentTimestamp: "",
			});

			toast.success("Всі персональні дані видалено з хмари! 🚫");
		} catch (error) {
			console.error("Помилка видалення облікових даних:", error);
			toast.error("Не вдалося видалити дані");
		} finally {
			setIsSavingProfileData(false);
		}
	};

	return (
		<div className="dashboard-container">
			<div className="dashboard-header">
				<div>
					<h1>Особистий кабінет</h1>
					<p
						style={{ marginTop: "0.5rem", color: "var(--text-muted, #64748b)" }}
					>
						Ласкаво просимо, <strong>{user?.name}</strong>!
					</p>
				</div>
				<button className="dashboard-logout-btn" onClick={logout}>
					Вийти з акаунту
				</button>
			</div>

			<div className="dashboard-tabs">
				<button
					className={activeTab === "history" ? "tab-btn active" : "tab-btn"}
					onClick={() => setActiveTab("history")}
				>
					Історія
				</button>
				<button
					className={activeTab === "profile" ? "tab-btn active" : "tab-btn"}
					onClick={() => setActiveTab("profile")}
				>
					Мій профіль
				</button>
				<button
					className={activeTab === "account" ? "tab-btn active" : "tab-btn"}
					onClick={() => setActiveTab("account")}
				>
					Облікова картка ФОП
				</button>
			</div>

			{activeTab === "history" && (
				<div className="history-section">
					<h2>Історія розрахунків</h2>

					{history.length === 0 ? (
						<div className="empty-state">
							<p>Ви ще не робили розрахунків 🧮</p>
						</div>
					) : (
						<div className="history-grid">
							{history.map((item, index) => (
								<div className="history-card" key={index}>
									<div className="history-date">
										📅{" "}
										{isNaN(new Date(item.date).getTime())
											? item.date
											: new Date(item.date).toLocaleString("uk-UA", {
													day: "2-digit",
													month: "long",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
									</div>
									<div className="history-details">
										<div className="history-item">
											<span>Система:</span>
											<strong>{item.system}</strong>
										</div>
										<div className="history-item">
											<span>Введений дохід:</span>
											<strong>
												{Number(item.income).toLocaleString("uk-UA")} ₴
											</strong>
										</div>
										<div className="history-item">
											<span>Податок (ЄП / ПДФО):</span>
											<strong>
												{item.tax !== undefined
													? Number(item.tax).toLocaleString("uk-UA")
													: "Невідомо"}{" "}
												₴
											</strong>
										</div>
										<div className="history-item">
											<span>ЄСВ:</span>
											<strong>
												{item.esv !== undefined
													? Number(item.esv).toLocaleString("uk-UA")
													: "Невідомо"}{" "}
												₴
											</strong>
										</div>
										<div className="history-item">
											<span>ВЗ (Військовий Збір):</span>
											<strong>
												{item.military !== undefined
													? Number(item.military).toLocaleString("uk-UA")
													: "Невідомо"}{" "}
												₴
											</strong>
										</div>
										<div
											className="history-item"
											style={{
												borderTop: "1px dashed var(--border-color)",
												paddingTop: "0.5rem",
											}}
										>
											<span>Разом до сплати:</span>
											<strong>
												{item.total !== undefined
													? Number(item.total).toLocaleString("uk-UA")
													: "Невідомо"}{" "}
												₴
											</strong>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{activeTab === "profile" && (
				<div className="profile-section">
					<div className="profile-header-card">
						<div className="profile-avatar">
							{user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
						</div>
						<div className="profile-info-text">
							<h2>{user?.name || "Користувач"}</h2>
							<p>{user?.email || "Email не вказано"}</p>
						</div>
					</div>

					<form className="profile-form" onSubmit={handleProfileUpdate}>
						<h3>Налаштування акаунту</h3>

						{profileMessage && (
							<div
								className="auth-warning"
								style={{
									color: "green",
									borderColor: "green",
									backgroundColor: "rgba(0,128,0,0.1)",
								}}
							>
								{profileMessage}
							</div>
						)}
						{profileError && <div className="auth-error">{profileError}</div>}

						<div className="form-group">
							<label>Ім'я</label>
							<input
								type="text"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								className="auth-input"
								required
							/>
						</div>
						<div className="form-group">
							<label>Email адреса</label>
							<input
								type="email"
								value={editEmail}
								onChange={(e) => setEditEmail(e.target.value)}
								className="auth-input"
								required
							/>
						</div>
						<div className="form-group">
							<label>Новий пароль</label>
							<input
								type="password"
								value={editPassword}
								onChange={(e) => setEditPassword(e.target.value)}
								className="auth-input"
								placeholder="Залиште пустим, якщо не змінюєте..."
							/>
							<small className="hint-text">
								Ми поки що не зберігаємо паролі в базі даних (у розробці).
							</small>
						</div>

						<button type="submit" className="auth-submit-btn">
							Зберегти зміни
						</button>
					</form>
				</div>
			)}

			{activeTab === "account" && (
				<div className="account-data-section">
					{isProfileDataLoading ? (
						<div className="empty-state animate-fadeIn">
							<p>Завантаження облікової картки з хмари... ⏳</p>
						</div>
					) : !profileData.consentGiven ? (
						<PersonalDataConsent
							onAccept={handleAcceptConsent}
							isAccepting={isSavingProfileData}
						/>
					) : (
						<form
							className="account-form animate-fadeIn"
							onSubmit={handleSaveProfileData}
						>
							<div className="account-form-header">
								<h2>📇 Облікова картка ФОП</h2>
								<p>
									Ці дані використовуються для спрощення розрахунків та кращої
									взаємодії з податковим калькулятором.
								</p>
							</div>

							{/* ГРУПА 1: РЕЄСТРАЦІЙНІ ДАНІ */}
							<div className="form-grid-section">
								<h3>📌 1. Ідентифікаційні та реєстраційні дані ФОП</h3>
								<div className="form-row">
									<div className="form-group">
										<label>Прізвище, ім'я та по батькові (ФОП)</label>
										<input
											type="text"
											className="auth-input"
											value={profileData.fopName}
											onChange={(e) =>
												setProfileData({
													...profileData,
													fopName: e.target.value,
												})
											}
											placeholder="Наприклад: Шевченко Тарас Григорович"
										/>
									</div>
									<div className="form-group">
										<label>Податковий номер (РНОКПП / ІПН)</label>
										<input
											type="text"
											className="auth-input"
											maxLength={10}
											value={profileData.rnokpp}
											onChange={(e) =>
												setProfileData({
													...profileData,
													rnokpp: e.target.value.replace(/\D/g, ""),
												})
											}
											placeholder="10 цифр податкового номера"
										/>
									</div>
								</div>
								<div className="form-row">
									<div className="form-group">
										<label>Громадянство</label>
										<input
											type="text"
											className="auth-input"
											value={profileData.citizenship}
											onChange={(e) =>
												setProfileData({
													...profileData,
													citizenship: e.target.value,
												})
											}
											placeholder="Наприклад: Україна"
										/>
									</div>
									<div className="form-group">
										<label>Контактний телефон</label>
										<input
											type="text"
											className="auth-input"
											value={profileData.phone}
											onChange={(e) =>
												setProfileData({
													...profileData,
													phone: e.target.value,
												})
											}
											placeholder="Наприклад: +38(050)-123-45-67"
										/>
									</div>
								</div>
								<div className="form-group full-width">
									<label>
										Адреса реєстрації (місцезнаходження за паспортом)
									</label>
									<textarea
										className="auth-input text-area-input"
										rows={2}
										value={profileData.address}
										onChange={(e) =>
											setProfileData({
												...profileData,
												address: e.target.value,
											})
										}
										placeholder="Повна адреса з поштовим індексом..."
									/>
								</div>
							</div>

							{/* ГРУПА 2: ПОДАТКОВІ РЕКВІЗИТИ */}
							<div className="form-grid-section">
								<h3>💼 2. Параметри оподаткування (Єдиний податок & ЄСВ)</h3>
								<div className="form-row">
									<div className="form-group">
										<label>Система оподаткування</label>
										<select
											className="auth-input"
											value={profileData.taxSystem}
											onChange={(e) =>
												setProfileData({
													...profileData,
													taxSystem: e.target.value,
												})
											}
										>
											<option value="Спрощена система">Спрощена система</option>
											<option value="Загальна система">Загальна система</option>
										</select>
									</div>
									<div className="form-group">
										<label>Група єдиного податку</label>
										<select
											className="auth-input"
											value={profileData.taxGroup}
											disabled={profileData.taxSystem === "Загальна система"}
											onChange={(e) =>
												setProfileData({
													...profileData,
													taxGroup: e.target.value,
												})
											}
										>
											{profileData.taxSystem === "Загальна система" ? (
												<option value="Загальна система / Не застосовується">
													Загальна система / Не застосовується
												</option>
											) : (
												<>
													<option value="1 група">1 група</option>
													<option value="2 група">2 група</option>
													<option value="3 група">3 група</option>
												</>
											)}
										</select>
									</div>
								</div>
								<div className="form-row">
									<div className="form-group">
										<label>Ставка податку (%)</label>
										<select
											className="auth-input"
											value={profileData.taxRate}
											disabled={
												profileData.taxSystem === "Загальна система" ||
												profileData.taxGroup === "1 група" ||
												profileData.taxGroup === "2 група"
											}
											onChange={(e) =>
												setProfileData({
													...profileData,
													taxRate: e.target.value,
												})
											}
										>
											{profileData.taxSystem === "Загальна система" ? (
												<option value="Не застосовується">Не застосовується</option>
											) : profileData.taxGroup === "1 група" ||
											  profileData.taxGroup === "2 група" ? (
												<option value="Фіксована ставка">
													Фіксована ставка ст. 293 ПКУ
												</option>
											) : (
												<>
													<option value="5% (без ПДВ)">5% (без ПДВ)</option>
													<option value="3% (з ПДВ)">3% (з ПДВ)</option>
												</>
											)}
										</select>
									</div>
									<div className="form-group">
										<label>Платник ПДВ</label>
										<select
											className="auth-input"
											value={profileData.isVatPayer}
											disabled={profileData.taxSystem === "Спрощена система"}
											onChange={(e) =>
												setProfileData({
													...profileData,
													isVatPayer: e.target.value,
												})
											}
										>
											<option value="Ні">Ні</option>
											<option value="Так">Так</option>
										</select>
									</div>
								</div>
								<div className="form-row">
									<div className="form-group">
										<label>Пільга зі сплати ЄСВ (звільнення за себе)</label>
										<select
											className="auth-input"
											value={profileData.esvBenefit}
											onChange={(e) =>
												setProfileData({
													...profileData,
													esvBenefit: e.target.value,
												})
											}
										>
											<option value="Немає пільги">
												Немає пільги (сплата на загальних підставах)
											</option>
											<option value="Пенсіонер за віком">
												Пенсіонер за віком (звільнення відповідно до ч. 4 ст. 4
												Закону про ЄСВ)
											</option>
											<option value="Особа з інвалідністю">
												Особа з інвалідністю (звільнення від сплати)
											</option>
											<option value="Офіційно працевлаштований">
												Офіційно працевлаштований (якщо роботодавець сплачує ЄСВ
												не менше мінімуму)
											</option>
											<option value="Військовослужбовець / Мобілізований">
												Військовослужбовець / Мобілізований на період воєнного
												стану
											</option>
										</select>
									</div>
									<div className="form-group">
										<label>Наймані працівники (кількість)</label>
										<input
											type="number"
											className="auth-input"
											min={0}
											max={profileData.taxGroup === "2 група" ? 10 : undefined}
											disabled={profileData.taxGroup === "1 група"}
											value={profileData.employeesCount}
											onChange={(e) =>
												setProfileData({
													...profileData,
													employeesCount: Math.max(0, parseInt(e.target.value) || 0),
												})
											}
											placeholder={
												profileData.taxGroup === "1 група"
													? "Заборонено наймати"
													: profileData.taxGroup === "2 група"
														? "Не більше 10 осіб"
														: "Кількість працівників"
											}
										/>
									</div>
								</div>
							</div>

							{/* ГРУПА 3: КВЕДИ ТА ОБ'ЄКТИ */}
							<div className="form-grid-section">
								<h3>📊 3. Види діяльності (КВЕД) та Господарські об'єкти</h3>

								{/* КВЕД Реєстр */}
								<div className="form-group full-width kved-registry-group">
									<label>
										📋 Зареєстровані КВЕДи (оберіть один як основний)
									</label>

									{(profileData.kvedsList || []).length === 0 ? (
										<div className="kveds-empty-notice">
											КВЕДи ще не обрано. Знайдіть та додайте їх через пошук нижче.
										</div>
									) : (
										<div className="kveds-selected-list">
											{profileData.kvedsList.map((kved) => (
												<div
													key={kved.code}
													className={`kved-selected-item ${
														kved.isMain ? "main-active" : ""
													}`}
												>
													<div className="kved-item-meta">
														<input
															type="radio"
															name="mainKvedRadio"
															checked={kved.isMain}
															onChange={() => setMainKved(kved.code)}
															id={`kved-radio-${kved.code}`}
															className="kved-main-radio"
														/>
														<label
															htmlFor={`kved-radio-${kved.code}`}
															className="kved-item-label"
														>
															<span className="kved-code-badge">{kved.code}</span>
															<span className="kved-name-text">{kved.name}</span>
														</label>
													</div>
													<div className="kved-item-actions">
														{kved.isMain && (
															<span className="main-kved-label">Основний</span>
														)}
														<button
															type="button"
															onClick={() => removeKved(kved.code)}
															className="kved-remove-btn"
															title="Вилучити КВЕД"
														>
															❌
														</button>
													</div>
												</div>
											))}
										</div>
									)}

									{/* Пошук КВЕДів */}
									<div className="kved-search-wrapper" style={{ marginTop: "1rem" }}>
										<input
											type="text"
											className="auth-input kved-registry-search"
											placeholder="Пошук КВЕД за кодом або назвою для додавання..."
											value={kvedSearchQuery}
											onChange={handleKvedSearchChange}
										/>
										{kvedSearchResults.length > 0 && (
											<ul className="kved-search-results-dropdown">
												{kvedSearchResults.map((kved) => (
													<li
														key={kved.code}
														onClick={() => addKved(kved)}
														className="kved-result-dropdown-item"
													>
														<span className="result-code">{kved.code}</span>
														<span className="result-name">{kved.name}</span>
													</li>
												))}
											</ul>
										)}
									</div>
								</div>

								{/* РРО та ПРРО Кількісний облік */}
								<div className="form-row">
									<div className="form-group">
										<label>Кількість класичних РРО</label>
										<input
											type="number"
											className="auth-input"
											min={0}
											value={profileData.rroCount}
											onChange={(e) =>
												setProfileData({
													...profileData,
													rroCount: Math.max(0, parseInt(e.target.value) || 0),
												})
											}
										/>
									</div>
									<div className="form-group">
										<label>Кількість програмних ПРРО</label>
										<input
											type="number"
											className="auth-input"
											min={0}
											value={profileData.prroCount}
											onChange={(e) =>
												setProfileData({
													...profileData,
													prroCount: Math.max(0, parseInt(e.target.value) || 0),
												})
											}
										/>
									</div>
								</div>

								{/* Адреси провадження діяльності */}
								<div className="form-group full-width">
									<label>Адреси провадження господарської діяльності</label>
									<textarea
										className="auth-input text-area-input"
										rows={2}
										value={profileData.activityAddresses}
										onChange={(e) =>
											setProfileData({
												...profileData,
												activityAddresses: e.target.value,
											})
										}
										placeholder="Повна адреса (місто, вулиця) або 'Територія України' для інтернет-торгівлі..."
									/>
								</div>

								{/* Господарські об'єкти (20-ОПП) */}
								<div className="form-group full-width object-registry-group">
									<label>
										🏠 Господарські об'єкти оподаткування (форма 20-ОПП)
									</label>

									{(profileData.selectedObjects || []).length === 0 ? (
										<div className="objects-empty-notice">
											Об'єкти оподаткування ще не додано. Скористайтеся пошуком нижче.
										</div>
									) : (
										<div className="objects-selected-list">
											{profileData.selectedObjects.map((obj) => (
												<div key={obj.id} className="object-selected-card">
													<div className="object-card-header">
														<span className="object-type-badge">
															{obj.code} - {obj.typeName}
														</span>
														<button
															type="button"
															onClick={() => removeObject(obj.id)}
															className="object-remove-btn"
														>
															❌
														</button>
													</div>
													<div className="object-card-inputs">
														<div className="form-group">
															<label>Власна назва об'єкта (для ідентифікації)</label>
															<input
																type="text"
																className="auth-input object-card-input"
																value={obj.customName}
																placeholder="Наприклад: Магазин одягу 'Стиль'"
																onChange={(e) =>
																	updateObjectField(
																		obj.id,
																		"customName",
																		e.target.value,
																	)
																}
															/>
														</div>
														<div className="form-group">
															<label>Фактична адреса розташування об'єкта</label>
															<input
																type="text"
																className="auth-input object-card-input"
																value={obj.address}
																placeholder="Наприклад: м. Чернівці, вул. Головна, 15"
																onChange={(e) =>
																	updateObjectField(
																		obj.id,
																		"address",
																		e.target.value,
																	)
																}
															/>
														</div>
													</div>
												</div>
											))}
										</div>
									)}

									{/* Пошук об'єктів */}
									<div className="object-search-wrapper" style={{ marginTop: "1rem" }}>
										<input
											type="text"
											className="auth-input object-registry-search"
											placeholder="Пошук типу об'єкта за номером або назвою (наприклад: 321 або Магазин)..."
											value={objectSearchQuery}
											onChange={handleObjectSearchChange}
										/>
										{objectSearchResults.length > 0 && (
											<ul className="object-search-results-dropdown">
												{objectSearchResults.map((obj) => (
													<li
														key={obj.code}
														onClick={() => addObject(obj)}
														className="object-result-dropdown-item"
													>
														<span className="result-code">{obj.code}</span>
														<span className="result-name">{obj.name}</span>
													</li>
												))}
											</ul>
										)}
									</div>
								</div>
							</div>

							{/* ГРУПА 4: БАНКІВСЬКІ РЕКВІЗИТИ ТА ІНШЕ */}
							<div className="form-grid-section">
								<h3>💳 4. Банківські реквізити (IBAN) та Додатково</h3>
								<div className="form-group full-width">
									<label>Рахунки IBAN (Банк, номер рахунку, валюта)</label>
									<textarea
										className="auth-input text-area-input"
										rows={3}
										value={profileData.ibanAccounts}
										onChange={(e) =>
											setProfileData({
												...profileData,
												ibanAccounts: e.target.value,
											})
										}
										placeholder="АТ 'УНІВЕРСАЛ БАНК', IBAN: UA193220010000026002313331034..."
									/>
								</div>
								<div className="form-group full-width">
									<label>
										Додаткові примітки / Особливий режим оподаткування
									</label>
									<textarea
										className="auth-input text-area-input"
										rows={2}
										value={profileData.notes}
										onChange={(e) =>
											setProfileData({ ...profileData, notes: e.target.value })
										}
										placeholder="Особливості обліку, пільги тощо..."
									/>
								</div>
							</div>

							{/* КНОПКИ ДІЙ */}
							<div className="account-actions-footer">
								<button
									type="submit"
									disabled={isSavingProfileData}
									className="auth-submit-btn account-save-btn"
								>
									{isSavingProfileData
										? "Збереження..."
										: "💾 Зберегти картку ФОП"}
								</button>
								<button
									type="button"
									disabled={isSavingProfileData}
									onClick={handleDeleteProfileData}
									className="account-delete-btn"
								>
									🚫 Видалити всі дані
								</button>
							</div>
						</form>
					)}
				</div>
			)}
		</div>
	);
};

export default Dashboard;
