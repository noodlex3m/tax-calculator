import { useState, useEffect } from "react";
import "./ThemeToggle.css";

function ThemeToggle() {
	const [theme, setTheme] = useState(() => {
		const savedTheme = localStorage.getItem("site-item");
		if (
			!savedTheme &&
			window.matchMedia("(prefers-color-scheme: light)").matches
		) {
			return "light";
		}
		return savedTheme || "dark";
	});

	useEffect(() => {
		document.body.setAttribute("data-theme", theme);
		localStorage.setItem("site-theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	return (
		<button
			className="theme-toggle-btn"
			onClick={toggleTheme}
			title="Змінити тему"
			aria-label="Змінити тему"
		>
			{theme === "dark" ? "☀️" : "🌙"}
		</button>
	);
}
export default ThemeToggle;
