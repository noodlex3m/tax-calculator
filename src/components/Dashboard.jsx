import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
	const { user, logout } = useAuth();
	const [history, setHistory] = useState([]);

	useEffect(() => {
		// 1. Беремо дані з localStorage за ключем "taxHistory"
		const savedHistory = localStorage.getItem("taxHistory");

		// 2. Перевіряємо, чи є дані
		if (savedHistory) {
			// 3. Перетворюємо текст savedHistory назад у JavaScript-масив
			const parsedHistory = JSON.parse(savedHistory);
			// 4. Записуємо отриманий масив у змінну history (перевертаємо, щоб нові були зверху)
			setHistory([...parsedHistory].reverse());
		}
	}, []);

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
									{new Date(item.date).toLocaleString("uk-UA", {
										day: "2-digit",
										month: "long",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</div>
								<div className="history-details">
									<div className="history-item">
										<span>Дохід:</span>
										<strong>
											{Number(item.income).toLocaleString("uk-UA")} ₴
										</strong>
									</div>
									<div className="history-item">
										<span>Єдиний податок:</span>
										<strong>
											{Number(item.tax).toLocaleString("uk-UA")} ₴
										</strong>
									</div>
									<div className="history-item">
										<span>ЄСВ:</span>
										<strong>
											{Number(item.social).toLocaleString("uk-UA")} ₴
										</strong>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
