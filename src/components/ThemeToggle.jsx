import React, { useContext } from "react";
import "./ThemeToggle.css";
import { ThemeContext } from "../context/ThemeContext";

function ThemeToggle() {
	const { theme, toggleTheme } = useContext(ThemeContext);

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
