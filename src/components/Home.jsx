import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

function Home() {
	const { isAuthenticated } = useAuth();

	return (
		<div className="home-container">
			<title>Все про податки ФОП — Tax.Serh.One</title>
			<meta
				name="description"
				content="Розрахуйте єдиний податок, ЄСВ, військовий збір та зарплату для ФОП 1, 2 та 3 групи. Актуальні ліміти та ставки на 2026 рік."
			/>
			<link rel="canonical" href="https://tax.serh.one/" />
			
			<section className="hero-section">
				<h1>Податковий помічник ФОП</h1>
				<p>
					Сучасна екосистема для українських підприємців: розрахунок податків та зарплат, 
					персональний календар звітів, швидкий пошук КВЕД та корисні новини.
				</p>
				<Link to="/calculator" className="cta-button">
					Розрахувати податки
				</Link>
			</section>

			<section className="features-section">
				<div className="feature-card">
					<h3>🧮 Калькулятор ФОП</h3>
					<p>
						Швидкий розрахунок єдиного податку, ЄСВ та військового збору на 2026 рік 
						для спрощеної та загальної систем оподаткування.
					</p>
					<Link to="/calculator">Перейти &rarr;</Link>
				</div>

				<div className="feature-card">
					<h3>💼 Калькулятор зарплати</h3>
					<p>
						Повний розрахунок чистих виплат найманим працівникам, ПДФО, військового збору 
						та ЄСВ роботодавця з урахуванням мінімальних гарантій та максимальної бази.
					</p>
					<Link to="/salary">Розрахувати &rarr;</Link>
				</div>

				<div className="feature-card">
					<h3>📅 Податковий календар</h3>
					<p>
						Персональний графік подання декларацій та сплати податків на 2026 рік, 
						адаптований під параметри вашої групи ФОП.
					</p>
					<Link to="/calendar">Дивитись календар &rarr;</Link>
				</div>

				<div className="feature-card">
					<h3>🧭 Гід по групах</h3>
					<p>
						Покроковий інтерактивний помічник, який допоможе проаналізувати діяльність 
						та обрати найбільш вигідну групу оподаткування.
					</p>
					<Link to="/wizard">Пройти тест &rarr;</Link>
				</div>

				<div className="feature-card">
					<h3>🔍 Пошук КВЕД</h3>
					<p>
						Зручний та швидкий пошук кодів видів економічної діяльності з підказками 
						та автоматичною перевіркою обмежень для єдиного податку.
					</p>
					<Link to="/kved">Шукати КВЕД &rarr;</Link>
				</div>

				<div className="feature-card">
					<h3>👤 Особистий кабінет</h3>
					<p>
						Автоматичне налаштування калькуляторів, синхронізація дедлайн-календаря 
						та збереження розрахунків безпосередньо у вашому профілі ФОП.
					</p>
					{isAuthenticated ? (
						<Link to="/dashboard">До кабінету &rarr;</Link>
					) : (
						<Link to="/login">Увійти &rarr;</Link>
					)}
				</div>
			</section>
		</div>
	);
}

export default Home;
