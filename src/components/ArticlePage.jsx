import React from "react";
import { Link, useParams } from "react-router-dom";
import newsData from "../data/newsData";
import { Helmet } from "react-helmet-async";

import "./News.css";

function ArticlePage() {
	const { id } = useParams();

	const article = newsData.find((article) => article.id === Number(id));

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
