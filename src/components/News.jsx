import React from "react";
import newsData from "../data/newsData";
import "./News.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function News() {
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
			<div className="news-list">
				{newsData.map((article) => (
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
