import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Register = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const { register } = useAuth();
	const navigate = useNavigate();

	const handleRegister = async (e) => {
		e.preventDefault();
		setError("");

		try {
			await register(email, password, name);
			navigate("/dashboard");
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="auth-container">
			<h2>Реєстрація</h2>
			
			{error && <div className="auth-error">{error}</div>}
			
			<form className="auth-form" onSubmit={handleRegister}>
				<input
					type="text"
					className="auth-input"
					placeholder="Ваше ім'я"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
				<input
					type="email"
					className="auth-input"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					className="auth-input"
					placeholder="Пароль"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button type="submit" className="auth-submit-btn">
					Зареєструватися
				</button>
			</form>
			<div className="auth-links">
				<p>Вже є акаунт? <Link to="/login">Увійти</Link></p>
			</div>
		</div>
	);
};

export default Register;
