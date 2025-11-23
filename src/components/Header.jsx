import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const closeMenu = () => {
		setIsMenuOpen(false);
	};

	return (
		<header className="site-header">
			<div className="header-container">
				<Link to="/" className="logo" onClick={closeMenu}>
					Tax.Serh.One
				</Link>
				<div
					className={`burger-icon ${isMenuOpen ? "open" : ""}`}
					onClick={toggleMenu}
				>
					<span></span>
					<span></span>
					<span></span>
				</div>

				<nav className={`main-nav ${isMenuOpen ? "active" : ""}`}>
					<NavLink to="/" onClick={closeMenu}>
						Головна
					</NavLink>
					<NavLink to="/faq" onClick={closeMenu}>
						Запитання
					</NavLink>
					<NavLink to="/calculator" onClick={closeMenu}>
						Калькулятор
					</NavLink>
					<NavLink to="/news" onClick={closeMenu}>
						Новини
					</NavLink>
				</nav>
			</div>
		</header>
	);
}

export default Header;
