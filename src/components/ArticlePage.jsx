import { Link, useParams } from "react-router-dom";
import newsData from "../data/newsData";
import { Helmet } from "react-helmet-async";
import Skeleton from "./Skeleton";
import "./News.css";
import { useSimulatedApi } from "../hooks/useSimulatedApi";

function ArticlePage() {
	const { id } = useParams();
	const { data: article, isLoading } = useSimulatedApi(
		newsData.find((item) => item.id === Number(id)),
	);

	// 👇 БЛОК ЗАВАНТАЖЕННЯ (SKELETON)
	if (isLoading) {
		return (
			<div className="article-container">
				<Helmet>
					<title>Завантаження...</title>
				</Helmet>
				{/* Імітуємо заголовок */}
				<h1>
					<Skeleton width="70%" height="40px" />
				</h1>
				{/* Імітуємо дату та категорію */}
				<div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
					<Skeleton width="100px" height="24px" />
					<Skeleton width="120px" height="24px" />
				</div>
				{/* Імітуємо текст статті (кілька ліній) */}
				<div className="article-fulltext" style={{ marginTop: "2rem" }}>
					<Skeleton width="100%" height="20px" />
					<Skeleton width="95%" height="20px" />
					<Skeleton width="90%" height="20px" />
					<Skeleton width="100%" height="20px" />
				</div>
			</div>
		);
	}

	// 👇 БЛОК ПОМИЛКИ (якщо статті немає)
	if (!article) {
		return (
			<div className="article-container" style={{ textAlign: "center" }}>
				<Helmet>
					<title>Статтю не знайдено — Tax.Serh.One</title>
					<meta name="robots" content="noindex" />
				</Helmet>
				<h2>Статтю не знайдено</h2>
				<p>Вибачте, але запитувана стаття не існує.</p>
				<Link to="/news" className="back-link">
					&larr; Назад до новин
				</Link>
			</div>
		);
	}

	// 👇 БЛОК НОРМАЛЬНОЇ СТАТТІ
	return (
		<div className="article-container">
			<Helmet>
				<title>{article.title} — Tax.Serh.One</title>
				<meta name="description" content={article.summary} />

				<link
					rel="canonical"
					href={`https://tax.serh.one/news/${article.id}`}
				/>

				<meta property="og:title" content={article.title} />
				<meta property="og:description" content={article.summary} />
				<meta property="og:type" content="article" />
				<meta
					property="og:url"
					content={`https://tax.serh.one/news/${article.id}`}
				/>
			</Helmet>

			<Link to="/news" className="back-link">
				&larr; Назад до новин
			</Link>

			<span className="news-category">{article.category}</span>
			<h1>{article.title}</h1>
			<span className="news-date">{article.date}</span>

			<div className="article-fulltext" style={{ whiteSpace: "pre-wrap" }}>
				{article.fullText}
			</div>
		</div>
	);
}

export default ArticlePage;
