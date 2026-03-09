import { createContext, useContext, useState, useEffect } from "react";

// Створюємо контекст
const AuthContext = createContext();

// Створюємо провайдер
export const AuthProvider = ({ children }) => {
	// зберігаємо наші локальні стани
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// Ініціалізація при завантаженні
	useEffect(() => {
		const storedAuth = localStorage.getItem("taxUser");
		if (storedAuth) {
			const { isAuthenticated, user } = JSON.parse(storedAuth);
			setIsAuthenticated(isAuthenticated);
			setUser(user);
		}
		setLoading(false);
	}, []);

	const login = (user) => {
		setIsAuthenticated(true);
		setUser(user);
		localStorage.setItem(
			"taxUser",
			JSON.stringify({ isAuthenticated: true, user }),
		);
	};

	const logout = () => {
		setIsAuthenticated(false);
		setUser(null);
		localStorage.removeItem("taxUser");
	};

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, user, login, logout, loading }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
