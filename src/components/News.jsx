import React from "react";
import newsData from "../data/newData";
import "./News.css";
import { Link } from "react-router-dom";

function News() {
	return (
		<div className="news-container">
			<h1>Останні Новини</h1>
			<div className="news-list">
				{newsData.map((article) => (
					<Link>
						<div key={article.id} className="news-card">
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
