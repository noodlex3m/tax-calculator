import React from "react";
import { Link, useParams } from "react-router-dom";
import newsData from "../data/newsData";
import { Helmet } from "react-helmet-async";

import "./News.css";

function ArticlePage() {
	const { id } = useParams();

	const article = newsData.find((article) => article.id === Number(id));

	if (!article) {
		return (
			<>
				<h2>Статтю не знайдено</h2>
				<Link to="/news" className="back-link">
					&larr; Назад до новин
				</Link>
			</>
		);
	}

	return (
		<div className="article-container">
			<Helmet>
				<title>{article.title} — Tax.Serh.One</title>
				<meta name="description" content={article.summary} />
				<link
					rel="canonical"
					href={`https://tax.serh.one/news/${article.id}`}
				/>
			</Helmet>
			<Link to="/news" className="back-link">
				&larr; Назад до новин
			</Link>
			<span className="news-category">{article.category}</span>
			<h1>{article.title}</h1>
			<span className="news-date">{article.date}</span>
			<p className="article-fulltext">{article.fullText}</p>
		</div>
	);
}

export default ArticlePage;
