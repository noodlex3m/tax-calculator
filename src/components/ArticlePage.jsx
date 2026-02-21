import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Skeleton from "./Skeleton";
import "./News.css";
import { useSimulatedApi } from "../hooks/useSimulatedApi";
import Comments from "./Comments";
import commentsData from "../data/commentsData";

function ArticlePage() {
	const { id } = useParams();
	const { data: article, isLoading, error } = useSimulatedApi(id);

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

	// 👇 БЛОК СИСТЕМНОЇ ПОМИЛКИ (Server Error)
	if (error) {
		return (
			<div
				className="article-container"
				style={{ textAlign: "center", color: "red" }}
			>
				<Helmet>
					<title>Помилка — Tax.Serh.One</title>
				</Helmet>
				<h2>Ой, халепа! 💥</h2>
				<p>{error}</p>
				<p style={{ color: "#666", fontSize: "0.9rem" }}>
					Спробуйте оновити сторінку.
				</p>
				<Link to="/news" className="back-link">
					&larr; Повернутися до новин
				</Link>
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
			<br></br>
			<div className="comments-form">
				<div
					style={{
						backgroundColor: "rgba(255, 193, 7, 0.1)",
						border: "1px solid #ffc107",
						color: "#ffc107",
						padding: "1rem",
						borderRadius: "8px",
						marginBottom: "1.5rem",
						textAlign: "center",
					}}
				>
					🛠️ <strong>Увага!</strong> Розділ коментарів знаходиться в стадії
					розробки.
				</div>
			</div>
			<Comments comments={commentsData.filter((c) => c.postId === id)} />
		</div>
	);
}

export default ArticlePage;
