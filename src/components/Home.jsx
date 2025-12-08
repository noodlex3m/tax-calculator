import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./Home.css";

function Home() {
	return (
		<div className="home-container">
			<Helmet>
				<title>Все про податки ФОП — Tax.Serh.One</title>
				<meta
					name="description"
					content="Розрахуйте єдиний податок та ЄСВ для 1, 2 та 3 групи ФОП. Актуальні ставки 2025 року."
				/>
				<link rel="canonical" href="https://tax.serh.one/calculator" />
			</Helmet>
			<section className="hero-section">
				<h1>Податковий помічник ФОП</h1>
				<p>
					Зручний інструмент для розрахунку податків, актуальні новини та
					відповіді на поширені запитання для підприємців України.
				</p>
				<Link to="/calculator" className="cta-button">
					Розрахувати податки
				</Link>
			</section>

			<section className="features-section">
				<div className="feature-card">
					<h3>🧮 Калькулятор</h3>
					<p>
						Швидкий розрахунок єдиного податку, ЄСВ та військового збору на 2025
						рік.
					</p>
					<Link to="/calculator">Перейти &rarr;</Link>
				</div>

				<div className="feature-card">
					<h3>❓ FAQ</h3>
					<p>
						Відповіді на найпопулярніші питання щодо ведення ФОП, звітністі та
						термінів.
					</p>
					<Link to="/faq">Читати &rarr;</Link>
				</div>

				<div className="feature-card">
					<h3>📰 Новини</h3>
					<p>
						Останні зміни в законодавстві та корисні статті для вашого бізнесу.
					</p>
					<Link to="/news">Переглянути &rarr;</Link>
				</div>
			</section>
		</div>
	);
}

export default Home;
