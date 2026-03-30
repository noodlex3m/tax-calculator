import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Login = () => {
	// Локальний стан для збереження введеного імені
	const [userName, setUserName] = useState("");

	// Отримуємо функцію login з контексту
	const { login } = useAuth();

	// Інструмент для перенаправлення на інші сторінки
	const navigate = useNavigate();

	const handleLogin = (e) => {
		e.preventDefault(); 
		// Передаємо ім'я у властивості "name", щоб воно співпадало з тим, що очікує Dashboard ({user?.name})
		login({ name: userName });
		navigate("/dashboard");
	};

	return (
		<div className="auth-container">
			<h2>Вхід в Кабінет</h2>
			<form className="auth-form" onSubmit={handleLogin}>
				<input
					type="text"
					className="auth-input"
					placeholder="Ваше ім'я"
					value={userName}
					onChange={(e) => setUserName(e.target.value)}
					required
				/>
				<button type="submit" className="auth-submit-btn">
					Увійти
				</button>
			</form>
			<div className="auth-links">
				<p>Немає акаунту? <Link to="/register">Зареєструватися</Link></p>
			</div>
		</div>
	);
};

export default Login;
