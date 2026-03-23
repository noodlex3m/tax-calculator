import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
	const { user, logout } = useAuth();
	return (
		<div style={{ padding: "2rem" }}>
			<h1>Особистий кабінет</h1>
			<p>
				Ласкаво просимо, {user.user}! Цю сторінку бачать лише авторизовані
				користувачі.
			</p>
			<button onClick={logout}>Вийти</button>
		</div>
	);
};

export default Dashboard;
