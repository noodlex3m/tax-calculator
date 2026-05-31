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
		esvNumber: "",
		mainKved: "",
		otherKveds: "",
		taxObjects: "",
		usesRro: "Не використовується",
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
					setProfileData(docSnap.data());
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
						esvNumber: "",
						mainKved: "",
						otherKveds: "",
						taxObjects: "",
						usesRro: "Не використовується",
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
			const updated = {
				...profileData,
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
				esvNumber: "",
				mainKved: "",
				otherKveds: "",
				taxObjects: "",
				usesRro: "Не використовується",
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
									взаємодії з адміном.
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
											onChange={(e) =>
												setProfileData({
													...profileData,
													taxGroup: e.target.value,
												})
											}
										>
											<option value="1 група">1 група</option>
											<option value="2 група">2 група</option>
											<option value="3 група">3 група</option>
											<option value="Загальна система / Не застосовується">
												Загальна система / Не застосовується
											</option>
										</select>
									</div>
								</div>
								<div className="form-row">
									<div className="form-group">
										<label>Ставка податку (%)</label>
										<select
											className="auth-input"
											value={profileData.taxRate}
											onChange={(e) =>
												setProfileData({
													...profileData,
													taxRate: e.target.value,
												})
											}
										>
											<option value="1%">1%</option>
											<option value="2%">2%</option>
											<option value="3%">3% (з ПДВ)</option>
											<option value="5%">5% (без ПДВ)</option>
											<option value="15%">15% (для перевищення ліміту)</option>
											<option value="Не застосовується">
												Не застосовується
											</option>
										</select>
									</div>
									<div className="form-group">
										<label>Реєстраційний номер платника ЄСВ</label>
										<input
											type="text"
											className="auth-input"
											value={profileData.esvNumber}
											onChange={(e) =>
												setProfileData({
													...profileData,
													esvNumber: e.target.value,
												})
											}
											placeholder="Номер платника єдиного внеску"
										/>
									</div>
								</div>
							</div>

							{/* ГРУПА 3: КВЕДИ ТА ОБ'ЄКТИ */}
							<div className="form-grid-section">
								<h3>📊 3. Види діяльності (КВЕД) та Об'єкти оподаткування</h3>
								<div className="form-row">
									<div className="form-group">
										<label>Основний КВЕД</label>
										<input
											type="text"
											className="auth-input"
											value={profileData.mainKved}
											onChange={(e) =>
												setProfileData({
													...profileData,
													mainKved: e.target.value,
												})
											}
											placeholder="Код основного КВЕД (наприклад: 47.91)"
										/>
									</div>
									<div className="form-group">
										<label>Застосування РРО/ПРРО</label>
										<select
											className="auth-input"
											value={profileData.usesRro}
											onChange={(e) =>
												setProfileData({
													...profileData,
													usesRro: e.target.value,
												})
											}
										>
											<option value="Не використовується">
												Не використовується
											</option>
											<option value="РРО (класичний касовий апарат)">
												РРО (класичний)
											</option>
											<option value="ПРРО (програмний касовий апарат)">
												ПРРО (програмний)
											</option>
										</select>
									</div>
								</div>
								<div className="form-group full-width">
									<label>Інші КВЕДи (через кому або списком)</label>
									<textarea
										className="auth-input text-area-input"
										rows={2}
										value={profileData.otherKveds}
										onChange={(e) =>
											setProfileData({
												...profileData,
												otherKveds: e.target.value,
											})
										}
										placeholder="Наприклад: 62.01, 63.12, 70.22..."
									/>
								</div>
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
										placeholder="Фактичні адреси здійснення бізнесу..."
									/>
								</div>
								<div className="form-group full-width">
									<label>
										Господарські об'єкти оподаткування (форма 20-ОПП)
									</label>
									<input
										type="text"
										className="auth-input"
										value={profileData.taxObjects}
										onChange={(e) =>
											setProfileData({
												...profileData,
												taxObjects: e.target.value,
											})
										}
										placeholder="Наприклад: Офіс 24, Інтернет-магазин, Склад"
									/>
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
										placeholder="АТ 'ПРИВАТБАНК', IBAN: UA993052990000026001234567890..."
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
