import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState(() => {
		const savedTheme = localStorage.getItem("site-theme");
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
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};
