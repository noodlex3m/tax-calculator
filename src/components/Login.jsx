import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
	// Локальний стан для збереження введеного імені
	const [userName, setUserName] = useState("");

	// Отримуємо функцію login з контексту
	const { login } = useAuth();

	// Інструмент для перенаправлення на інші сторінки
	const navigate = useNavigate();

	const handleLogin = (e) => {
		e.preventDefault(); // Зупиняємо перезавантаження сторінки при відправці форми

		// Викликаємо логін і передаємо об'єкт з ім'ям (використовуємо правильну змінну userName)
		login({ user: userName });

		// Одразу перекидаємо користувача в кабінет
		navigate("/dashboard");
	};

	return (
		<div style={{ padding: "2rem", maxWidth: "400px", margin: "0, auto" }}>
			<h2>Вхід в Особистий кабінет</h2>
			<form
				onSubmit={handleLogin}
				style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
			>
				<input
					type="text"
					placeholder="Ваше ім'я"
					value={userName}
					onChange={(e) => setUserName(e.target.value)}
					required
					style={{
						padding: "0.8rem",
						borderRadius: "4px",
						border: "1px solid #ccc",
					}}
				/>
				<button type="submit" style={{ padding: "0.8rem", cursor: "pointer" }}>
					Увійти
				</button>
			</form>
		</div>
	);
};

export default Login;
