import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
	return (
		<header className="site-header">
			<div className="header-container">
				<Link to="/" className="logo">
					Tax.Serh.One
				</Link>
				<nav className="main-nav">
					<NavLink to="/">Головна</NavLink>
					<NavLink to="/faq">Поширені Питання (FAQ)</NavLink>
					<NavLink to="/calculator">Калькулятор</NavLink>
					<NavLink to="/news">Новини</NavLink>
				</nav>
			</div>
		</header>
	);
}

export default Header;
