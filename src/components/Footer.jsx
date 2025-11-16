import React from "react";
import "./Footer.css";

function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="site-footer">
			<div className="footer-container">
				<p>© {year} Tax.Serh.One. Всі права захищено.</p>
				<div className="social-links">
					<a
						href="https://t.me/taxuse"
						target="_blank"
						rel="noopener noreferrer"
					>
						Telegram Канал
					</a>
					<a
						href="https://github.com/noodlex3m/tax-calculator"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub
					</a>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
