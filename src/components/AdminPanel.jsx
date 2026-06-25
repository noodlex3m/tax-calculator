import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./AdminPanel.css";

// 🔥 ІМПОРТИ FIREBASE ТА АВТОРИЗАЦІЇ
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import kvedData from "../data/kvedData";
import { objectTypes } from "../data/objectTypesData";
import TaxCalendar from "./TaxCalendar";
import { toast } from "react-hot-toast";

const AdminPanel = () => {
	const { user, loading } = useAuth(); // Отримуємо поточного юзера та статус завантаження
	const [activeTab, setActiveTab] = useState("news");
	const [newsMode, setNewsMode] = useState("visual");
	const [faqMode, setFaqMode] = useState("visual");

	// Стани для форми новин
	const [newsTitle, setNewsTitle] = useState("");
	const [newsCategory, setNewsCategory] = useState("Податки");
	const [customNewsCategory, setCustomNewsCategory] = useState("");
	const [showCustomNewsInput, setShowCustomNewsInput] = useState(false);
	const [newsSummary, setNewsSummary] = useState("");
	const [newsContent, setNewsContent] = useState("");
	const [publishToTelegram, setPublishToTelegram] = useState(true);

	// Стани для форми FAQ
	const [faqQuestion, setFaqQuestion] = useState("");
	const [faqCategory, setFaqCategory] = useState("Загальні");
	const [customFaqCategory, setCustomFaqCategory] = useState("");
	const [showCustomFaqInput, setShowCustomFaqInput] = useState(false);
	const [faqShortAnswer, setFaqShortAnswer] = useState("");
	const [faqFullAnswer, setFaqFullAnswer] = useState("");

	// 👤 СТАНИ ДЛЯ УПРАВЛІННЯ КОРИСТУВАЧАМИ ТА ФОП
	const [fops, setFops] = useState([]);
	const [registeredUsers, setRegisteredUsers] = useState([]);
	const [isFopsLoading, setIsFopsLoading] = useState(false);
	const [fopSearchQuery, setFopSearchQuery] = useState("");
	const [fopFilterStatus, setFopFilterStatus] = useState("all");

	// Стан для модальних вікон
	const [showFopModal, setShowFopModal] = useState(false);
	const [editingFop, setEditingFop] = useState(null);
	const [showCalendarModal, setShowCalendarModal] = useState(false);
	const [selectedFopForCalendar, setSelectedFopForCalendar] = useState(null);

	// Стан для форми ФОП
	const defaultFopForm = {
		fopName: "",
		rnokpp: "",
		citizenship: "Україна",
		address: "",
		phone: "",
		taxSystem: "Спрощена система",
		taxGroup: "3 група",
		taxRate: "5% (без ПДВ)",
		isVatPayer: "Ні",
		esvBenefit: "Немає пільги",
		employeesCount: 0,
		esvNumber: "",
		kvedsList: [],
		selectedObjects: [],
		activityAddresses: "",
		ibanAccounts: "",
		notes: "",
		email: "",
		consentGiven: true,
		consentTimestamp: new Date().toISOString()
	};
	const [fopForm, setFopForm] = useState(defaultFopForm);
	const [kvedSearchQuery, setKvedSearchQuery] = useState("");
	const [kvedSearchResults, setKvedSearchResults] = useState([]);
	const [objectSearchQuery, setObjectSearchQuery] = useState("");
	const [objectSearchResults, setObjectSearchResults] = useState([]);

	// 👤 ФУНКЦІЇ ДЛЯ УПРАВЛІННЯ КОРИСТУВАЧАМИ ТА ФОП
	const fetchFopsAndUsers = async () => {
		setIsFopsLoading(true);
		try {
			// 1. Читаємо ФОП з userProfiles
			const fopsSnap = await getDocs(collection(db, "userProfiles"));
			const fetchedFops = [];
			fopsSnap.forEach((doc) => {
				fetchedFops.push({
					id: doc.id,
					...doc.data()
				});
			});
			setFops(fetchedFops);

			// 2. Читаємо користувачів з users
			const usersSnap = await getDocs(collection(db, "users"));
			const fetchedUsers = [];
			usersSnap.forEach((doc) => {
				fetchedUsers.push(doc.data());
			});
			setRegisteredUsers(fetchedUsers);
		} catch (err) {
			console.error("Помилка завантаження даних адмінки:", err);
			toast.error("Не вдалося завантажити списки ФОП та користувачів");
		} finally {
			setIsFopsLoading(false);
		}
	};

	useEffect(() => {
		if (activeTab === "users") {
			fetchFopsAndUsers();
		}
	}, [activeTab]);

	const updateFopFormField = (field, value) => {
		setFopForm(prev => {
			const updated = { ...prev, [field]: value };
			
			// Адаптація полів згідно з ПКУ
			if (field === "taxSystem") {
				if (value === "Загальна система") {
					updated.taxGroup = "Загальна система / Не застосовується";
					updated.taxRate = "Не застосовується";
					updated.isVatPayer = "Ні";
				} else if (value === "Спрощена система") {
					updated.taxGroup = "3 група";
					updated.taxRate = "5% (без ПДВ)";
					updated.isVatPayer = "Ні";
				}
			} else if (field === "taxGroup") {
				if (value === "1 група" || value === "2 група") {
					updated.taxRate = "Фіксована ставка";
					updated.isVatPayer = "Ні";
				} else if (value === "3 група") {
					updated.taxRate = "5% (без ПДВ)";
					updated.isVatPayer = "Ні";
				}
			} else if (field === "taxRate") {
				if (value === "3% (з ПДВ)") {
					updated.isVatPayer = "Так";
				} else if (value === "5% (без ПДВ)") {
					updated.isVatPayer = "Ні";
				}
			}
			return updated;
		});
	};

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
		if (fopForm.kvedsList.some((k) => k.code === kved.code)) {
			toast.error("Цей КВЕД вже додано!");
			return;
		}
		const newKved = {
			code: kved.code,
			name: kved.name,
			isMain: fopForm.kvedsList.length === 0,
		};
		setFopForm(prev => ({
			...prev,
			kvedsList: [...prev.kvedsList, newKved]
		}));
		setKvedSearchQuery("");
		setKvedSearchResults([]);
		toast.success(`КВЕД ${kved.code} додано!`);
	};

	const removeKved = (code) => {
		const updatedList = fopForm.kvedsList.filter((k) => k.code !== code);
		if (fopForm.kvedsList.find((k) => k.code === code)?.isMain && updatedList.length > 0) {
			const newMainIdx = updatedList.findIndex(k => !k.isMain);
			if (newMainIdx !== -1) {
				updatedList[newMainIdx].isMain = true;
			}
		}
		setFopForm(prev => ({
			...prev,
			kvedsList: updatedList
		}));
		toast.success("КВЕД вилучено!");
	};

	const setMainKved = (code) => {
		const updatedList = fopForm.kvedsList.map((k) => ({
			...k,
			isMain: k.code === code,
		}));
		setFopForm(prev => ({
			...prev,
			kvedsList: updatedList
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
		setFopForm(prev => ({
			...prev,
			selectedObjects: [...prev.selectedObjects, newObj]
		}));
		setObjectSearchQuery("");
		setObjectSearchResults([]);
		toast.success(`Об'єкт "${objType.name}" додано!`);
	};

	const updateObjectField = (id, field, value) => {
		const updatedList = fopForm.selectedObjects.map((obj) => {
			if (obj.id === id) {
				return { ...obj, [field]: value };
			}
			return obj;
		});
		setFopForm(prev => ({
			...prev,
			selectedObjects: updatedList
		}));
	};

	const removeObject = (id) => {
		const updatedList = fopForm.selectedObjects.filter((obj) => obj.id !== id);
		setFopForm(prev => ({
			...prev,
			selectedObjects: updatedList
		}));
		toast.success("Об'єкт вилучено!");
	};

	const handleSaveFop = async (e) => {
		e.preventDefault();
		
		const mainKvedObj = (fopForm.kvedsList || []).find((k) => k.isMain);
		const mainKved = mainKvedObj ? mainKvedObj.code : "";
		const otherKveds = (fopForm.kvedsList || [])
			.filter((k) => !k.isMain)
			.map((k) => k.code)
			.join(", ");

		const taxObjects = (fopForm.selectedObjects || [])
			.map((o) => o.customName || o.typeName)
			.filter(Boolean)
			.join(", ");

		let legacyUsesRro = "Не використовується";
		const rroCountVal = Number(fopForm.rroCount || 0);
		const prroCountVal = Number(fopForm.prroCount || 0);
		if (rroCountVal > 0 && prroCountVal > 0) {
			legacyUsesRro = "РРО та ПРРО";
		} else if (rroCountVal > 0) {
			legacyUsesRro = "РРО (класичний касовий апарат)";
		} else if (prroCountVal > 0) {
			legacyUsesRro = "ПРРО (програмний касовий апарат)";
		}

		const dataToSave = {
			...fopForm,
			mainKved,
			otherKveds,
			taxObjects,
			usesRro: legacyUsesRro,
			rroCount: rroCountVal,
			prroCount: prroCountVal,
			employeesCount: Number(fopForm.employeesCount || 0),
			updatedAt: new Date().toISOString()
		};

		try {
			let docId = editingFop ? editingFop.id : null;
			
			if (!docId) {
				let linkedUid = null;
				if (fopForm.email) {
					const matchedUser = registeredUsers.find(
						u => u.email.toLowerCase() === fopForm.email.toLowerCase()
					);
					if (matchedUser) {
						linkedUid = matchedUser.uid;
					}
				}
				
				if (linkedUid) {
					docId = linkedUid;
					const exists = fops.some(f => f.id === linkedUid);
					if (exists) {
						if (!window.confirm(`Користувач із поштою ${fopForm.email} вже має картку ФОП. Перезаписати її?`)) {
							return;
						}
					}
				} else if (fopForm.email) {
					docId = `offline_${fopForm.email.replace(/[@.]/g, "_")}`;
				} else {
					docId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
				}
			}

			await setDoc(doc(db, "userProfiles", docId), dataToSave);
			toast.success(editingFop ? "Дані ФОП успішно оновлено! 💾" : "Нову картку ФОП створено! 🚀");
			setShowFopModal(false);
			setEditingFop(null);
			setFopForm(defaultFopForm);
			fetchFopsAndUsers();
		} catch (err) {
			console.error("Помилка збереження картки ФОП:", err);
			toast.error("Не вдалося зберегти дані ФОП");
		}
	};

	const handleDeleteFop = async (fopId, fopName) => {
		if (!window.confirm(`Ви впевнені, що хочете остаточно видалити облікову картку ФОП "${fopName || fopId}"?`)) {
			return;
		}
		try {
			await deleteDoc(doc(db, "userProfiles", fopId));
			toast.success("Облікову картку ФОП видалено!");
			fetchFopsAndUsers();
		} catch (err) {
			console.error("Помилка видалення:", err);
			toast.error("Не вдалося видалити картку ФОП");
		}
	};

	const handleLinkFopToUser = async (fop, userUid) => {
		const matchedUser = registeredUsers.find(u => u.uid === userUid);
		if (!matchedUser) return;
		
		if (!window.confirm(`Прив'язати картку ФОП "${fop.fopName || fop.id}" до користувача ${matchedUser.email}? Дані будуть перенесені під його акаунт.`)) {
			return;
		}
		
		try {
			const updatedData = {
				...fop,
				email: matchedUser.email,
				updatedAt: new Date().toISOString()
			};
			
			if (fop.id !== userUid) {
				await setDoc(doc(db, "userProfiles", userUid), updatedData);
				await deleteDoc(doc(db, "userProfiles", fop.id));
			} else {
				await updateDoc(doc(db, "userProfiles", userUid), { email: matchedUser.email });
			}
			
			toast.success("Картку ФОП успішно прив'язано до акаунта!");
			fetchFopsAndUsers();
		} catch (err) {
			console.error("Помилка прив'язки:", err);
			toast.error("Не вдалося прив'язати картку до користувача");
		}
	};

	const openEditFopModal = (fop) => {
		setEditingFop(fop);
		setFopForm({
			fopName: fop.fopName || "",
			rnokpp: fop.rnokpp || "",
			citizenship: fop.citizenship || "Україна",
			address: fop.address || "",
			phone: fop.phone || "",
			taxSystem: fop.taxSystem || "Спрощена система",
			taxGroup: fop.taxGroup || "3 група",
			taxRate: fop.taxRate || "5% (без ПДВ)",
			isVatPayer: fop.isVatPayer || "Ні",
			esvBenefit: fop.esvBenefit || "Немає пільги",
			employeesCount: fop.employeesCount || 0,
			esvNumber: fop.esvNumber || "",
			kvedsList: fop.kvedsList || [],
			selectedObjects: fop.selectedObjects || [],
			activityAddresses: fop.activityAddresses || "",
			ibanAccounts: fop.ibanAccounts || "",
			notes: fop.notes || "",
			email: fop.email || "",
			consentGiven: fop.consentGiven !== undefined ? fop.consentGiven : true,
			consentTimestamp: fop.consentTimestamp || new Date().toISOString()
		});
		setShowFopModal(true);
	};

	const openCreateFopModal = () => {
		setEditingFop(null);
		setFopForm(defaultFopForm);
		setShowFopModal(true);
	};

	const openCalendarModal = (fop) => {
		setSelectedFopForCalendar(fop);
		setShowCalendarModal(true);
	};

	// Модулі редактора (кнопки форматування)
	const modules = {
		toolbar: [
			[{ header: [1, 2, false] }],
			["bold", "italic", "underline", "strike"],
			[{ list: "ordered" }, { list: "bullet" }],
			["clean"],
		],
	};

	// 🔐 ПЕРЕВІРКА ДОСТУПУ (ЩИТ АДМІНІСТРАТОРА)
	if (loading) {
		return (
			<div
				style={{ textAlign: "center", marginTop: "3rem", fontWeight: "bold" }}
			>
				Завантаження системи безпеки...
			</div>
		);
	}

	if (!user || !user.isAdmin) {
		return (
			<div
				style={{
					textAlign: "center",
					marginTop: "5rem",
					padding: "2rem",
					color: "var(--error-color, red)",
				}}
			>
				<h2>⛔️ Доступ обмежено</h2>
				<p>
					Ця сторінка доступна виключно для адміністратора сайту tax.serh.one
				</p>
			</div>
		);
	}

	// 📢 ВІДПРАВКА ПРЕВ'Ю СТАТТІ В TELEGRAM-КАНАЛ
	const sendTelegramMessage = async (articleId, title, summary) => {
		const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
		const chatId = import.meta.env.VITE_TELEGRAM_CHANNEL_CHAT_ID;

		if (!token || !chatId) {
			console.warn("Telegram токен або Chat ID не налаштовані в .env!");
			return;
		}

		// Для MarkdownV2 треба екранувати спеціальні символи
		// Символи, що підлягають екрануванню: _, *, [, ], ( , ), ~, `, >, #, +, -, =, |, {, }, ., !
		const escapeMarkdown = (text) => {
			if (!text) return "";
			return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
		};

		const escapedTitle = escapeMarkdown(title);
		const escapedSummary = escapeMarkdown(summary);
		const articleUrl = `https://tax.serh.one/news/${articleId}`;
		const escapedUrl = escapeMarkdown(articleUrl);

		const text = `📰 *${escapedTitle}*\n\n${escapedSummary}\n\n🔗 [Читати на сайті](${escapedUrl})`;

		try {
			const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					chat_id: chatId,
					text: text,
					parse_mode: "MarkdownV2",
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.description || `Помилка API: ${response.statusText}`);
			}

			console.log("Пост успішно надіслано в Telegram-канал!");
		} catch (err) {
			console.error("Не вдалося надіслати пост у Telegram:", err);
		}
	};

	// 📰 ПУБЛІКАЦІЯ НОВИНИ В FIRESTORE
	const handleNewsSubmit = async (e) => {
		e.preventDefault();
		if (!newsContent.trim())
			return alert("Текст новини не може бути порожнім!");

		const finalCategory = newsCategory === "NEW_CATEGORY" ? customNewsCategory.trim() : newsCategory;
		if (!finalCategory)
			return alert("Категорія не може бути порожньою!");

		try {
			// Додаємо документ у колекцію "news"
			const docRef = await addDoc(collection(db, "news"), {
				title: newsTitle,
				category: finalCategory,
				summary: newsSummary,
				content: newsContent, // Зберігаємо як готовий HTML-рядок із тегами
				date: new Date().toLocaleDateString("uk-UA"),
				createdAt: new Date().toISOString(),
			});

			alert("🎉 Новину успішно опубліковано на сайті!");

			// Якщо чекбокс увімкнений, надсилаємо в Telegram
			if (publishToTelegram) {
				await sendTelegramMessage(docRef.id, newsTitle, newsSummary);
			}

			// Очищення форми
			setNewsTitle("");
			setNewsSummary("");
			setNewsContent("");
			setCustomNewsCategory("");
			setShowCustomNewsInput(false);
			setNewsCategory("Податки");
		} catch (err) {
			console.error("Помилка публікації новини:", err);
			alert("Помилка сервера. Не вдалося зберегти новину.");
		}
	};

	// ❓ ПУБЛІКАЦІЯ FAQ В FIRESTORE
	const handleFaqSubmit = async (e) => {
		e.preventDefault();
		if (!faqFullAnswer.trim())
			return alert("Повна відповідь не може бути порожньою!");

		const finalCategory = faqCategory === "NEW_CATEGORY" ? customFaqCategory.trim() : faqCategory;
		if (!finalCategory)
			return alert("Категорія не може бути порожньою!");

		try {
			// Додаємо документ у колекцію "faqs"
			await addDoc(collection(db, "faqs"), {
				question: faqQuestion,
				category: finalCategory,
				shortAnswer: faqShortAnswer,
				fullAnswer: faqFullAnswer, // HTML-рядок
				createdAt: new Date().toISOString(),
			});

			alert("🎉 Запитання FAQ успішно додано до бази знань!");

			// Очищення форми
			setFaqQuestion("");
			setFaqShortAnswer("");
			setFaqFullAnswer("");
			setCustomFaqCategory("");
			setShowCustomFaqInput(false);
			setFaqCategory("Загальні");
		} catch (err) {
			console.error("Помилка додавання FAQ:", err);
			alert("Помилка сервера. Не вдалося зберегти запитання.");
		}
	};

	return (
		<div className="admin-panel-container">
			<div className="admin-header-section">
				<h1>🛡️ Панель керування</h1>
				<p className="admin-subtitle">Управління публікаціями новин та довідника FAQ на tax.serh.one</p>
			</div>

			{/* Перемикач вкладок */}
			<div className="admin-tabs">
				<button
					type="button"
					onClick={() => setActiveTab("news")}
					className={`admin-tab-btn ${activeTab === "news" ? "active" : ""}`}
				>
					📰 Додати новину
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("faq")}
					className={`admin-tab-btn ${activeTab === "faq" ? "active" : ""}`}
				>
					❓ Додати FAQ
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("users")}
					className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
				>
					👤 Управління ФОП
				</button>
			</div>

			{/* ФОРМА НОВИН */}
			{activeTab === "news" && (
				<form onSubmit={handleNewsSubmit} className="admin-form">
					<div className="admin-form-group">
						<label>Заголовок новини</label>
						<input
							type="text"
							className="admin-input-field"
							value={newsTitle}
							onChange={(e) => setNewsTitle(e.target.value)}
							placeholder="Введіть яскравий заголовок новини..."
							required
						/>
					</div>

					<div className="admin-form-group">
						<label>Категорія</label>
						<select
							className="admin-input-field"
							value={newsCategory}
							onChange={(e) => {
								const val = e.target.value;
								setNewsCategory(val);
								if (val === "NEW_CATEGORY") {
									setShowCustomNewsInput(true);
								} else {
									setShowCustomNewsInput(false);
								}
							}}
						>
							<option value="Податки">Податки</option>
							<option value="Законодавство">Законодавство</option>
							<option value="Звітність">Звітність</option>
							<option value="NEW_CATEGORY">➕ Створити нову категорію...</option>
						</select>

						{showCustomNewsInput && (
							<input
								type="text"
								className="admin-input-field"
								value={customNewsCategory}
								onChange={(e) => setCustomNewsCategory(e.target.value)}
								placeholder="Введіть назву нової категорії..."
								required
								style={{ marginTop: "0.5rem" }}
							/>
						)}
					</div>

					<div className="admin-form-group">
						<label>Короткий опис (для картки прев'ю)</label>
						<textarea
							className="admin-input-field"
							rows="2"
							value={newsSummary}
							onChange={(e) => setNewsSummary(e.target.value)}
							placeholder="Короткий зміст статті для залучення читачів..."
							required
						/>
					</div>

					<div className="admin-form-group">
						<div className="editor-header">
							<label>Повний текст новини</label>
							<div className="editor-mode-toggle">
								<button
									type="button"
									className={`editor-mode-btn ${newsMode === "visual" ? "active" : ""}`}
									onClick={() => setNewsMode("visual")}
								>
									✍️ Редактор
								</button>
								<button
									type="button"
									className={`editor-mode-btn ${newsMode === "code" ? "active" : ""}`}
									onClick={() => setNewsMode("code")}
								>
									💻 HTML Код
								</button>
							</div>
						</div>
						<div className="quill-editor-wrapper">
							{newsMode === "visual" ? (
								<ReactQuill
									theme="snow"
									value={newsContent}
									onChange={setNewsContent}
									modules={modules}
									placeholder="Напишіть текст новини тут, виділяйте слова для форматування..."
								/>
							) : (
								<textarea
									className="admin-code-editor"
									value={newsContent}
									onChange={(e) => setNewsContent(e.target.value)}
									placeholder="<p>Введіть ваш HTML-код тут...</p>"
									rows="12"
								/>
							)}
						</div>
					</div>

					<div className="admin-checkbox-group">
						<input
							type="checkbox"
							id="publishToTelegram"
							checked={publishToTelegram}
							onChange={(e) => setPublishToTelegram(e.target.checked)}
						/>
						<label htmlFor="publishToTelegram">
							📢 Автоматично опублікувати новину в Telegram-канал @taxuse
						</label>
					</div>

					<button type="submit" className="admin-action-btn">
						📰 Опублікувати новину
					</button>
				</form>
			)}

			{/* ФОРМА FAQ */}
			{activeTab === "faq" && (
				<form onSubmit={handleFaqSubmit} className="admin-form">
					<div className="admin-form-group">
						<label>Запитання</label>
						<input
							type="text"
							className="admin-input-field"
							value={faqQuestion}
							onChange={(e) => setFaqQuestion(e.target.value)}
							placeholder="Введіть формулювання поширеного питання..."
							required
						/>
					</div>

					<div className="admin-form-group">
						<label>Категорія</label>
						<select
							className="admin-input-field"
							value={faqCategory}
							onChange={(e) => {
								const val = e.target.value;
								setFaqCategory(val);
								if (val === "NEW_CATEGORY") {
									setShowCustomFaqInput(true);
								} else {
									setShowCustomFaqInput(false);
								}
							}}
						>
							<option value="Загальні">Загальні</option>
							<option value="ЄСВ">ЄСВ</option>
							<option value="ЄП">ЄП</option>
							<option value="Декларації">Декларації</option>
							<option value="NEW_CATEGORY">➕ Створити нову категорію...</option>
						</select>

						{showCustomFaqInput && (
							<input
								type="text"
								className="admin-input-field"
								value={customFaqCategory}
								onChange={(e) => setCustomFaqCategory(e.target.value)}
								placeholder="Введіть назву нової категорії..."
								required
								style={{ marginTop: "0.5rem" }}
							/>
						)}
					</div>

					<div className="admin-form-group">
						<label>Коротка відповідь</label>
						<input
							type="text"
							className="admin-input-field"
							value={faqShortAnswer}
							onChange={(e) => setFaqShortAnswer(e.target.value)}
							placeholder="Коротке резюме відповіді в один рядок..."
							required
						/>
					</div>

					<div className="admin-form-group">
						<div className="editor-header">
							<label>Повна розгорнута відповідь</label>
							<div className="editor-mode-toggle">
								<button
									type="button"
									className={`editor-mode-btn ${faqMode === "visual" ? "active" : ""}`}
									onClick={() => setFaqMode("visual")}
								>
									✍️ Редактор
								</button>
								<button
									type="button"
									className={`editor-mode-btn ${faqMode === "code" ? "active" : ""}`}
									onClick={() => setFaqMode("code")}
								>
									💻 HTML Код
								</button>
							</div>
						</div>
						<div className="quill-editor-wrapper">
							{faqMode === "visual" ? (
								<ReactQuill
									theme="snow"
									value={faqFullAnswer}
									onChange={setFaqFullAnswer}
									modules={modules}
									placeholder="Напишіть детальну відповідь з посиланням на статті ПКУ..."
								/>
							) : (
								<textarea
									className="admin-code-editor"
									value={faqFullAnswer}
									onChange={(e) => setFaqFullAnswer(e.target.value)}
									placeholder="<p>Введіть ваш HTML-код тут...</p>"
									rows="12"
								/>
							)}
						</div>
					</div>

					<button type="submit" className="admin-action-btn">
						❓ Опублікувати FAQ
					</button>
				</form>
			)}

			{/* 👤 Вкладка управління ФОП */}
			{activeTab === "users" && (
				<div className="admin-users-section animate-fadeIn">
					<div className="admin-actions-bar">
						<div className="search-filter-group">
							<input
								type="text"
								placeholder="🔍 Пошук за назвою ФОП, РНОКПП або email..."
								value={fopSearchQuery}
								onChange={(e) => setFopSearchQuery(e.target.value)}
								className="admin-search-input"
							/>
							<select
								value={fopFilterStatus}
								onChange={(e) => setFopFilterStatus(e.target.value)}
								className="admin-filter-select"
							>
								<option value="all">Усі ФОП</option>
								<option value="linked">🔗 Прив'язані</option>
								<option value="offline">👤 Офлайн (гості)</option>
							</select>
						</div>
						<button
							onClick={openCreateFopModal}
							className="admin-add-fop-btn"
						>
							➕ Створити нову картку ФОП
						</button>
					</div>

					{isFopsLoading ? (
						<div className="admin-loading-spinner">Завантаження даних...</div>
					) : (
						<div className="admin-table-container">
							<table className="admin-data-table">
								<thead>
									<tr>
										<th>ФОП / РНОКПП</th>
										<th>Контакти / Email</th>
										<th>Система оподаткування</th>
										<th>Статус зв'язку</th>
										<th>Дії</th>
									</tr>
								</thead>
								<tbody>
									{fops
										.filter((fop) => {
											const search = fopSearchQuery.toLowerCase();
											const nameMatches = (fop.fopName || "").toLowerCase().includes(search);
											const rnokppMatches = (fop.rnokpp || "").includes(search);
											const emailMatches = (fop.email || "").toLowerCase().includes(search);
											
											if (!nameMatches && !rnokppMatches && !emailMatches) return false;
											
											if (fopFilterStatus === "linked") {
												return !fop.id.startsWith("guest_") && !fop.id.startsWith("offline_");
											}
											if (fopFilterStatus === "offline") {
												return fop.id.startsWith("guest_") || fop.id.startsWith("offline_");
											}
											return true;
										})
										.map((fop) => {
											const isOffline = fop.id.startsWith("guest_") || fop.id.startsWith("offline_");
											return (
												<tr key={fop.id}>
													<td>
														<div className="fop-name-cell">{fop.fopName || "Не вказано"}</div>
														<div className="fop-rnokpp-cell">РНОКПП: {fop.rnokpp || "—"}</div>
													</td>
													<td>
														<div className="fop-email-cell">{fop.email || "—"}</div>
														<div className="fop-phone-cell">{fop.phone || "—"}</div>
													</td>
													<td>
														<div className="fop-tax-cell">
															{fop.taxSystem === "Спрощена система" ? `${fop.taxGroup}, ${fop.taxRate}` : "Загальна система"}
														</div>
													</td>
													<td>
														{isOffline ? (
															<span className="badge badge-offline">👤 Офлайн (гість)</span>
														) : (
															<span className="badge badge-linked">🔗 Прив'язано</span>
														)}
													</td>
													<td className="actions-cell">
														<button
															onClick={() => openEditFopModal(fop)}
															className="action-btn edit-btn"
															title="Редагувати картку ФОП"
														>
															✏️ Редагувати
														</button>
														<button
															onClick={() => openCalendarModal(fop)}
															className="action-btn calendar-btn"
															title="Податковий календар"
														>
															📅 Календар
														</button>
														{isOffline && (
															<div className="link-user-dropdown-wrapper">
																<select
																	onChange={(e) => {
																		if (e.target.value) {
																			handleLinkFopToUser(fop, e.target.value);
																			e.target.value = "";
																		}
																	}}
																	className="action-select link-select"
																	defaultValue=""
																>
																	<option value="" disabled>🔗 Прив'язати...</option>
																	{registeredUsers
																		.filter(ru => !fops.some(f => f.id === ru.uid))
																		.map(ru => (
																			<option key={ru.uid} value={ru.uid}>
																				{ru.email} ({ru.name})
																			</option>
																		))
																	}
																</select>
															</div>
														)}
														<button
															onClick={() => handleDeleteFop(fop.id, fop.fopName)}
															className="action-btn delete-btn"
															title="Видалити"
														>
															❌ Видалити
														</button>
													</td>
												</tr>
											);
										})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			{/* МОДАЛЬНЕ ВІКНО СТВОРЕННЯ / РЕДАГУВАННЯ ФОП */}
			{showFopModal && (
				<div className="admin-modal-overlay">
					<div className="admin-modal-container">
						<div className="admin-modal-header">
							<h2>{editingFop ? "✏️ Редагувати картку ФОП" : "➕ Створити нову картку ФОП"}</h2>
							<button
								onClick={() => setShowFopModal(false)}
								className="close-modal-btn"
							>
								✕
							</button>
						</div>
						<form onSubmit={handleSaveFop} className="admin-modal-form">
							{/* КЛЮЧОВІ РЕЄСТРАЦІЙНІ ДАНІ */}
							<div className="form-section-title">📌 Основні дані ФОП</div>
							<div className="form-grid-2">
								<div className="form-group">
									<label>Прізвище, ім'я та по батькові (ФОП)</label>
									<input
										type="text"
										className="admin-input-field"
										value={fopForm.fopName}
										onChange={(e) => updateFopFormField("fopName", e.target.value)}
										placeholder="Наприклад: Шевченко Тарас Григорович"
										required
									/>
								</div>
								<div className="form-group">
									<label>Податковий номер (РНОКПП)</label>
									<input
										type="text"
										className="admin-input-field"
										maxLength={10}
										value={fopForm.rnokpp}
										onChange={(e) => updateFopFormField("rnokpp", e.target.value.replace(/\D/g, ""))}
										placeholder="10 цифр"
										required
									/>
								</div>
								<div className="form-group">
									<label>Електронна пошта (для зв'язку/лінкування)</label>
									<input
										type="email"
										className="admin-input-field"
										value={fopForm.email}
										onChange={(e) => updateFopFormField("email", e.target.value)}
										placeholder="Пошта користувача (необов'язково)"
									/>
								</div>
								<div className="form-group">
									<label>Контактний телефон</label>
									<input
										type="text"
										className="admin-input-field"
										value={fopForm.phone}
										onChange={(e) => updateFopFormField("phone", e.target.value)}
										placeholder="Телефон"
									/>
								</div>
								<div className="form-group">
									<label>Громадянство</label>
									<input
										type="text"
										className="admin-input-field"
										value={fopForm.citizenship}
										onChange={(e) => updateFopFormField("citizenship", e.target.value)}
										placeholder="Громадянство"
									/>
								</div>
								<div className="form-group">
									<label>Податкова адреса (місце проживання)</label>
									<input
										type="text"
										className="admin-input-field"
										value={fopForm.address}
										onChange={(e) => updateFopFormField("address", e.target.value)}
										placeholder="Повна адреса за реєстрацією"
									/>
								</div>
							</div>

							{/* СИСТЕМА ОПОДАТКУВАННЯ */}
							<div className="form-section-title">📊 Параметри оподаткування (ПКУ)</div>
							<div className="form-grid-3">
								<div className="form-group">
									<label>Система оподаткування</label>
									<select
										className="admin-input-field"
										value={fopForm.taxSystem}
										onChange={(e) => updateFopFormField("taxSystem", e.target.value)}
									>
										<option value="Спрощена система">Спрощена система</option>
										<option value="Загальна система">Загальна система</option>
									</select>
								</div>
								<div className="form-group">
									<label>Група платника ЄП</label>
									<select
										className="admin-input-field"
										value={fopForm.taxGroup}
										onChange={(e) => updateFopFormField("taxGroup", e.target.value)}
										disabled={fopForm.taxSystem === "Загальна система"}
									>
										<option value="1 група">1 група</option>
										<option value="2 група">2 група</option>
										<option value="3 група">3 група</option>
										<option value="Загальна система / Не застосовується">Загальна система / Не застосовується</option>
									</select>
								</div>
								<div className="form-group">
									<label>Ставка податку</label>
									<select
										className="admin-input-field"
										value={fopForm.taxRate}
										onChange={(e) => updateFopFormField("taxRate", e.target.value)}
										disabled={fopForm.taxSystem === "Загальна система"}
									>
										{fopForm.taxGroup === "1 група" || fopForm.taxGroup === "2 група" ? (
											<option value="Фіксована ставка">Фіксована ставка</option>
										) : (
											<>
												<option value="5% (без ПДВ)">5% (без ПДВ)</option>
												<option value="3% (з ПДВ)">3% (з ПДВ)</option>
											</>
										)}
										<option value="Не застосовується">Не застосовується</option>
									</select>
								</div>
							</div>

							<div className="form-grid-3">
								<div className="form-group">
									<label>Платник ПДВ</label>
									<select
										className="admin-input-field"
										value={fopForm.isVatPayer}
										onChange={(e) => updateFopFormField("isVatPayer", e.target.value)}
									>
										<option value="Ні">Ні</option>
										<option value="Так">Так</option>
									</select>
								</div>
								<div className="form-group">
									<label>Пільга по ЄСВ (пенсіонер/інвалід)</label>
									<select
										className="admin-input-field"
										value={fopForm.esvBenefit}
										onChange={(e) => updateFopFormField("esvBenefit", e.target.value)}
									>
										<option value="Немає пільги">Немає пільги</option>
										<option value="Пенсіонер за віком">Пенсіонер за віком</option>
										<option value="Особа з інвалідністю">Особа з інвалідністю</option>
										<option value="Інші підстави">Інші підстави</option>
									</select>
								</div>
								<div className="form-group">
									<label>Кількість найманих працівників</label>
									<input
										type="number"
										min="0"
										className="admin-input-field"
										value={fopForm.employeesCount}
										onChange={(e) => updateFopFormField("employeesCount", parseInt(e.target.value) || 0)}
									/>
								</div>
							</div>

							{/* КВЕДИ ТА РРО */}
							<div className="form-section-title">💼 Види діяльності (КВЕД) та РРО</div>
							<div className="kved-manager-wrapper">
								<div className="kved-search-row">
									<input
										type="text"
										placeholder="Пошук КВЕД за кодом або назвою..."
										value={kvedSearchQuery}
										onChange={handleKvedSearchChange}
										className="admin-input-field"
									/>
									{kvedSearchResults.length > 0 && (
										<ul className="kved-dropdown">
											{kvedSearchResults.map((k) => (
												<li key={k.code} onClick={() => addKved(k)}>
													<strong>{k.code}</strong> — {k.name}
												</li>
											))}
										</ul>
									)}
								</div>
								<div className="kved-badge-container">
									{fopForm.kvedsList.map((kved) => (
										<span key={kved.code} className={`kved-badge ${kved.isMain ? 'main' : ''}`}>
											<span className="kved-badge-text" onClick={() => setMainKved(kved.code)}>
												{kved.code} {kved.isMain ? '★' : ''}
											</span>
											<button type="button" onClick={() => removeKved(kved.code)} className="remove-kved-btn">✕</button>
										</span>
									))}
								</div>
							</div>

							<div className="form-grid-3" style={{ marginTop: "1rem" }}>
								<div className="form-group">
									<label>Класний РРО (апарати)</label>
									<input
										type="number"
										min="0"
										className="admin-input-field"
										value={fopForm.rroCount}
										onChange={(e) => updateFopFormField("rroCount", parseInt(e.target.value) || 0)}
									/>
								</div>
								<div className="form-group">
									<label>Програмний РРО (ПРРО)</label>
									<input
										type="number"
										min="0"
										className="admin-input-field"
										value={fopForm.prroCount}
										onChange={(e) => updateFopFormField("prroCount", parseInt(e.target.value) || 0)}
									/>
								</div>
								<div className="form-group">
									<label>Реєстраційний номер ЄСВ</label>
									<input
										type="text"
										className="admin-input-field"
										value={fopForm.esvNumber}
										onChange={(e) => updateFopFormField("esvNumber", e.target.value)}
										placeholder="Код платника ЄСВ"
									/>
								</div>
							</div>

							{/* ОБ'ЄКТИ 20-ОПП */}
							<div className="form-section-title">🏠 Об'єкти оподаткування (Форма 20-ОПП)</div>
							<div className="objects-manager-wrapper">
								<div className="object-search-row">
									<input
										type="text"
										placeholder="Пошук типу об'єкта (наприклад: магазин, офіс, склад)..."
										value={objectSearchQuery}
										onChange={handleObjectSearchChange}
										className="admin-input-field"
									/>
									{objectSearchResults.length > 0 && (
										<ul className="object-dropdown">
											{objectSearchResults.map((obj) => (
												<li key={obj.code} onClick={() => addObject(obj)}>
													<strong>Код {obj.code}</strong> — {obj.name}
												</li>
											))}
										</ul>
									)}
								</div>
								{fopForm.selectedObjects && fopForm.selectedObjects.length > 0 && (
									<div className="objects-list">
										{fopForm.selectedObjects.map((obj) => (
											<div key={obj.id} className="object-item-row">
												<div className="obj-title">
													<span>Код {obj.code} — {obj.typeName}</span>
													<button type="button" onClick={() => removeObject(obj.id)} className="remove-obj-btn">✕</button>
												</div>
												<div className="obj-inputs">
													<input
														type="text"
														placeholder="Назва об'єкта (наприклад: Магазин солодощів)"
														value={obj.customName}
														onChange={(e) => updateObjectField(obj.id, "customName", e.target.value)}
														className="admin-input-field"
													/>
													<input
														type="text"
														placeholder="Адреса розташування об'єкта"
														value={obj.address}
														onChange={(e) => updateObjectField(obj.id, "address", e.target.value)}
														className="admin-input-field"
													/>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* ДОДАТКОВІ РЕКВІЗИТИ */}
							<div className="form-section-title">🔑 Додаткова інформація</div>
							<div className="form-group">
								<label>Адреси здійснення господарської діяльності</label>
								<input
									type="text"
									className="admin-input-field"
									value={fopForm.activityAddresses}
									onChange={(e) => updateFopFormField("activityAddresses", e.target.value)}
									placeholder="Вкажіть населені пункти, ринки, магазини тощо..."
								/>
							</div>
							<div className="form-group" style={{ marginTop: "1rem" }}>
								<label>Банківські рахунки (IBAN)</label>
								<textarea
									className="admin-input-field"
									rows="2"
									value={fopForm.ibanAccounts}
									onChange={(e) => updateFopFormField("ibanAccounts", e.target.value)}
									placeholder="Введіть рахунки IBAN (кожен з нового рядка)..."
								/>
							</div>
							<div className="form-group" style={{ marginTop: "1rem" }}>
								<label>Адміністративні нотатки (для власних поміток)</label>
								<textarea
									className="admin-input-field"
									rows="2"
									value={fopForm.notes}
									onChange={(e) => updateFopFormField("notes", e.target.value)}
									placeholder="Будь-які замітки про ФОП..."
								/>
							</div>

							<div className="admin-modal-footer">
								<button
									type="button"
									onClick={() => setShowFopModal(false)}
									className="admin-cancel-btn"
								>
									Скасувати
								</button>
								<button type="submit" className="admin-save-btn">
									💾 Зберегти дані ФОП
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* МОДАЛЬНЕ ВІКНО КАЛЕНДАРЯ ФОП */}
			{showCalendarModal && selectedFopForCalendar && (
				<div className="admin-modal-overlay">
					<div className="admin-modal-container calendar-modal">
						<div className="admin-modal-header">
							<h2>📅 Календар дій ФОП: {selectedFopForCalendar.fopName}</h2>
							<button
								onClick={() => {
									setShowCalendarModal(false);
									setSelectedFopForCalendar(null);
									fetchFopsAndUsers();
								}}
								className="close-modal-btn"
							>
								✕
							</button>
						</div>
						<div className="admin-modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
							<TaxCalendar
								fopDocId={selectedFopForCalendar.id}
								defaultProfile={selectedFopForCalendar}
								embedded={true}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminPanel;
