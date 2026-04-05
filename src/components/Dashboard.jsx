import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

// НОВІ ІМПОРТИ ДЛЯ FIREBASE
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const Dashboard = () => {
	const { user, logout, updateUser } = useAuth();
	const [history, setHistory] = useState([]);
	const [activeTab, setActiveTab] = useState("history");

	const [editName, setEditName] = useState(user?.name || "");
	const [editEmail, setEditEmail] = useState(user?.email || "");
	const [editPassword, setEditPassword] = useState("");
	const [profileMessage, setProfileMessage] = useState("");
	const [profileError, setProfileError] = useState("");

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

	// 🔥 МАГІЯ FIREBASE: Читання з бази даних
	useEffect(() => {
		const fetchHistoryFromFirebase = async () => {
			if (!user) return; // Якщо немає користувача, не робимо запит

			try {
				// Створюємо запит: шукаємо лише ті документи, де userId співпадає з нашим
				const q = query(
					collection(db, "calculations"),
					where("userId", "==", user.uid),
				);

				// Виконуємо запит
				const querySnapshot = await getDocs(q);
				const fetchedHistory = [];

				// Перебираємо отримані документи
				querySnapshot.forEach((doc) => {
					fetchedHistory.push(doc.data());
				});

				// Сортуємо від найновіших до найстаріших
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
		</div>
	);
};

export default Dashboard;
