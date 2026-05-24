import { useState, useEffect } from "react";
import "./News.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Skeleton from "./Skeleton";

// 🔥 МАГІЯ FIREBASE
import { db } from "../firebase";
import { collection, getDocs, query } from "firebase/firestore";

function News() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("Всі");

	// Нові стани для реальних хмарних даних
	const [articles, setArticles] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// 📥 ЗАВАНТАЖЕННЯ НОВИН З ХМАРИ (БЕЗПЕЧНИЙ ВАРІАНТ)
	useEffect(() => {
		const fetchNews = async () => {
			try {
				setIsLoading(true);

				// Запитуємо ВСІ новини без примусового серверного сортування
				const q = query(collection(db, "news"));
				const querySnapshot = await getDocs(q);

				const newsData = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				// 🔥 Сортуємо локально в клієнті. Навіть якщо createdAt десь немає, додаток не впаде!
				newsData.sort(
					(a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
				);

				setArticles(newsData);
			} catch (err) {
				console.error("Помилка завантаження новин з Firebase:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchNews();
	}, []);

	// ФІЛЬТРАЦІЯ
	const filteredNews = articles.filter((article) => {
		const matchesCategory =
			selectedCategory === "Всі" || article.category === selectedCategory;

		const matchesSearch =
			article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			article.content?.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesCategory && matchesSearch;
	});

	return (
		<div className="news-container">
			<Helmet>
				<title>Податкові новини для ФОП 2026 | Tax.Serh.One</title>
				<meta
					name="description"
					content="Актуальні новини законодавства, зміни ставок єдиного податку, ЄСВ та військового збору в Україні."
				/>
			</Helmet>

			<div className="news-header-section">
				<h1>Податковий вісник</h1>
				<p>Оперативні зміни в законодавстві, аналітика та роз'яснення ПКУ</p>
			</div>

			<div className="search-filter-wrapper">
				<input
					type="text"
					placeholder="Пошук новин за ключовими словами..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="auth-input news-search"
				/>
			</div>

			<div className="category-tabs">
				{["Всі", "Податки", "Законодавство", "Звітність"].map((category) => (
					<button
						key={category}
						className={`category-tab-btn ${
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
								<Skeleton width="80px" height="25px" />
								<h3 style={{ marginTop: "10px", marginBottom: "10px" }}>
									<Skeleton width="100%" height="28px" />
								</h3>
								<div style={{ marginBottom: "15px" }}>
									<Skeleton width="100%" height="16px" />
									<Skeleton width="90%" height="16px" />
									<Skeleton width="40%" height="16px" />
								</div>
								<Skeleton width="100px" height="16px" />
							</div>
						))
					: filteredNews.map((article) => (
							<Link
								key={article.id}
								to={`/news/${article.id}`}
								className="news-card-link"
							>
								<article className="news-card">
									<span className="news-category-badge">
										{article.category}
									</span>
									<h3>{article.title}</h3>
									<p>{article.summary}</p>
									<div className="news-card-footer">
										<span className="news-date">📅 {article.date}</span>
										<span className="read-more">Читати далі →</span>
									</div>
								</article>
							</Link>
						))}
			</div>

			{!isLoading && filteredNews.length === 0 && (
				<div className="no-results">
					🔍 За вашим запитом новин не знайдено. Спробуйте змінити фільтр.
				</div>
			)}
		</div>
	);
}

export default News;
