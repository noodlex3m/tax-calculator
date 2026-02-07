import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import newsData from "../data/newsData";
import "./News.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Skeleton from "./Skeleton";

function News() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("Всі");
	const [articles, setArticles] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Імітуємо затримку в 1000 мілісекунд (1 секунду)
		const timer = setTimeout(() => {
			setArticles(newsData); // Дані прийшли
			setIsLoading(false); // Завантаження завершено
		}, 1000);
		// Очищуємо таймер при розмонтуванні компонента
		return () => clearTimeout(timer);
	}, []);

	const filteredNews = articles.filter((article) => {
		// 1. Перевірка категорії
		const matchesCategory =
			selectedCategory === "Всі" || article.category === selectedCategory;
		// 2. Перевірка пошуку
		const matchesSearch =
			article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
			article.fullText.toLowerCase().includes(searchTerm.toLowerCase());
		// 3. Повертаємо true, тільки якщо ОБИДВІ умови виконуються
		return matchesCategory && matchesSearch;
	});
	const sortedNews = [...filteredNews].sort((a, b) => {
		const dateA = a.date.split(".").reverse().join("-");
		const dateB = b.date.split(".").reverse().join("-");
		return new Date(dateB) - new Date(dateA);
	});

	const allCategories = newsData.map((item) => item.category);
	const uniqueCategories = ["Всі", ...new Set(allCategories)];

	return (
		<div className="news-container">
			<Helmet>
				<title>Новини податкового законодавства ФОП 2026 — Tax.Serh.One</title>
				<meta
					name="description"
					content="Актуальні новини для ФОП: зміни в податках, нові рахунки ЄСВ, ліміти доходів та роз'яснення законодавства. Будьте в курсі змін!"
				/>
				<link rel="canonical" href="https://tax.serh.one/news" />
			</Helmet>
			<h1>Останні Новини</h1>
			<input
				type="text"
				placeholder="Пошук"
				className="search-bar"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
			<div className="category-filters">
				{uniqueCategories.map((category) => (
					<button
						key={category}
						className={`filter-btn ${
							selectedCategory === category ? "active" : ""
						}`}
						onClick={() => setSelectedCategory(category)}
					>
						{category}
					</button>
				))}
			</div>
			<div className="news-list">
				{isLoading
					? [...Array(6)].map((_, index) => (
							<div key={index} className="news-card">
								{/* 1. Категорія (маленька кнопка) */}
								<Skeleton width="80px" height="25px" />

								{/* 2. Заголовок (великий рядок) */}
								<h3 style={{ marginTop: "10px", marginBottom: "10px" }}>
									<Skeleton width="100%" height="28px" />
								</h3>

								{/* 3. Опис (кілька рядків тексту) */}
								<div style={{ marginBottom: "15px" }}>
									<Skeleton width="100%" height="16px" />
									<Skeleton width="90%" height="16px" />
									<Skeleton width="40%" height="16px" />
								</div>

								{/* 4. Дата (маленький текст внизу) */}
								<Skeleton width="100px" height="16px" />
							</div>
						))
					: // 📦 А тут повертаємо СПРАВЖНІ дані (як було раніше)
						sortedNews.map((article) => (
							<Link
								key={article.id}
								to={`/news/${article.id}`}
								className="news-card-link"
							>
								<div className="news-card">
									<span className="news-category">{article.category}</span>
									<h3>{article.title}</h3>
									<p>{article.summary}</p>
									<span className="news-date">{article.date}</span>
								</div>
							</Link>
						))}
			</div>
		</div>
	);
}

export default News;
