import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
	return (
		<div style={{ textAlign: "center", padding: "4rem 2rem" }}>
			<h1 style={{ fontSize: "6rem", marginBottom: "0", color: "#535bf2" }}>
				404
			</h1>
			<h2 style={{ fontSize: "2rem", marginTop: "0" }}>
				Упс! Сторінку не знайдено.
			</h2>
			<p style={{ color: "#ccc", marginBottom: "2rem", fontSize: "1.2rem" }}>
				Здається, ви заблукали. Такої сторінки не існує або вона була видалена.
			</p>
			<Link
				to="/"
				style={{
					display: "inline-block",
					backgroundColor: "#535bf2",
					color: "white",
					padding: "0.8rem 2rem",
					borderRadius: "6px",
					textDecoration: "none",
					fontWeight: "bold",
					transition: "background-color 0.2s",
				}}
				onMouseOver={(e) => (e.target.style.backgroundColor = "#434acf")}
				onMouseOut={(e) => (e.target.style.backgroundColor = "#535bf2")}
			>
				На Головну
			</Link>
		</div>
	);
}

export default NotFound;
