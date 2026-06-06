import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="site-footer">
			<div className="footer-container">
				<div className="footer-columns">
					<div className="footer-column about">
						<h4>Tax.Serh.One</h4>
						<p>Сучасний та безкоштовний податковий помічник для українських підприємців. Розрахунки актуальні на 2026 рік.</p>
					</div>
					<div className="footer-column links">
						<h4>Інструменти</h4>
						<ul>
							<li><Link to="/calculator">Калькулятор податків</Link></li>
							<li><Link to="/salary">Калькулятор зарплати</Link></li>
							<li><Link to="/calendar">Податковий календар</Link></li>
							<li><Link to="/kved">Пошук КВЕД</Link></li>
							<li><Link to="/wizard">Гід по групах</Link></li>
						</ul>
					</div>
					<div className="footer-column links">
						<h4>Ресурси</h4>
						<ul>
							<li><Link to="/faq">База знань (FAQ)</Link></li>
							<li><Link to="/news">Податкові новини</Link></li>
							<li><Link to="/feedback">Зворотний зв'язок</Link></li>
						</ul>
					</div>
					<div className="footer-column contacts">
						<h4>Контакти & Соцмережі</h4>
						<ul className="social-links-list">
							<li>
								<a href="https://t.me/taxuse" target="_blank" rel="noopener noreferrer">
									📢 Telegram-канал
								</a>
							</li>
							<li>
								<a href="https://github.com/noodlex3m/tax-calculator" target="_blank" rel="noopener noreferrer">
									💻 GitHub репозиторій
								</a>
							</li>
							<li>
								<a href="mailto:noodlex3m@gmail.com">
									✉️ noodlex3m@gmail.com
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="footer-bottom">
					<p>© {year} Tax.Serh.One. Всі права захищено. Створено Тріщуком Сергієм.</p>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
