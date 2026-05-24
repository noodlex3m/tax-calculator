import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./AdminPanel.css";

// 🔥 ІМПОРТИ FIREBASE ТА АВТОРИЗАЦІЇ
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const AdminPanel = () => {
	const { user, loading } = useAuth(); // Отримуємо поточного юзера та статус завантаження
	const [activeTab, setActiveTab] = useState("news");
	const [newsMode, setNewsMode] = useState("visual");
	const [faqMode, setFaqMode] = useState("visual");

	// Стани для форми новин
	const [newsTitle, setNewsTitle] = useState("");
	const [newsCategory, setNewsCategory] = useState("Податки");
	const [newsSummary, setNewsSummary] = useState("");
	const [newsContent, setNewsContent] = useState("");

	// Стани для форми FAQ
	const [faqQuestion, setFaqQuestion] = useState("");
	const [faqCategory, setFaqCategory] = useState("Загальні");
	const [faqShortAnswer, setFaqShortAnswer] = useState("");
	const [faqFullAnswer, setFaqFullAnswer] = useState("");

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

	// 📰 ПУБЛІКАЦІЯ НОВИНИ В FIRESTORE
	const handleNewsSubmit = async (e) => {
		e.preventDefault();
		if (!newsContent.trim())
			return alert("Текст новини не може бути порожнім!");

		try {
			// Додаємо документ у колекцію "news"
			await addDoc(collection(db, "news"), {
				title: newsTitle,
				category: newsCategory,
				summary: newsSummary,
				content: newsContent, // Зберігаємо як готовий HTML-рядок із тегами
				date: new Date().toLocaleDateString("uk-UA"),
				createdAt: new Date().toISOString(),
			});

			alert("🎉 Новину успішно опубліковано на сайті!");

			// Очищення форми
			setNewsTitle("");
			setNewsSummary("");
			setNewsContent("");
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

		try {
			// Додаємо документ у колекцію "faqs"
			await addDoc(collection(db, "faqs"), {
				question: faqQuestion,
				category: faqCategory,
				shortAnswer: faqShortAnswer,
				fullAnswer: faqFullAnswer, // HTML-рядок
				createdAt: new Date().toISOString(),
			});

			alert("🎉 Запитання FAQ успішно додано до бази знань!");

			// Очищення форми
			setFaqQuestion("");
			setFaqShortAnswer("");
			setFaqFullAnswer("");
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
							onChange={(e) => setNewsCategory(e.target.value)}
						>
							<option value="Податки">Податки</option>
							<option value="Законодавство">Законодавство</option>
							<option value="Звітність">Звітність</option>
						</select>
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
							onChange={(e) => setFaqCategory(e.target.value)}
						>
							<option value="Загальні">Загальні</option>
							<option value="ЄСВ">ЄСВ</option>
							<option value="ЄП">ЄП</option>
							<option value="Декларації">Декларації</option>
						</select>
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
		</div>
	);
};

export default AdminPanel;
