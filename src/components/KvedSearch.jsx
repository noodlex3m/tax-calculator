import React, { useState } from "react";
import kvedData from "../data/kvedData";
import "./KvedSearch.css";

const KvedSearch = () => {
	const [searchTerm, setSearchTerm] = useState("");

	const filteredKveds = kvedData.filter((kved) => {
		const matchesName = kved.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesCode = kved.code.includes(searchTerm);
		return matchesName || matchesCode;
	});

	return (
		<div className="kved-container">
			<div className="auth-warning" style={{ marginBottom: "2rem", textAlign: "center" }}>
				<strong style={{ fontSize: "1.1rem" }}>🚧 Довідник КВЕД у процесі наповнення та перевірки</strong>
				<p style={{ marginTop: "0.5rem", marginBottom: 0, color: "var(--text-muted)" }}>
					Станом на зараз довідник налічує <strong>{kvedData.length}</strong> КВЕДів. 
				</p>
				<p style={{ marginTop: "0.5rem", marginBottom: 0, fontSize: "0.85rem", color: "var(--text-color)" }}>
					<em>Увага: інформація щодо дозволених груп Єдиного податку наразі верифікується згідно з ПКУ. 
					Наприклад, здійснення діяльності з продажу підакцизних товарів (таких як легкові автомобілі за КВЕД 45.11) 
					забороняє перебування на 1-3 групах ЄП відповідно до п.п. 3 п.п. 291.5.1 ст. 291 ПКУ.</em>
				</p>
			</div>
			<h2>📚 Довідник КВЕД</h2>
			<p className="kved-subtitle">
				Знайдіть потрібний вид діяльності за кодом або назвою. Дізнайтеся, чи
				дозволений він для вашої групи Єдиного податку.
			</p>

			<input
				type="text"
				placeholder="Введіть код (наприклад, 01.11) або назву..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="auth-input kved-search-input"
			/>

			<ul className="kved-list">
				{filteredKveds.slice(0, 15).map((kved) => (
					<li key={kved.code} className="kved-card">
						<div className="kved-card-header">
							<span className="kved-code-badge">{kved.code}</span>
							{kved.name}
						</div>

						<div className="kved-meta">
							<span className="kved-level-badge">
								{kved.type === "section"
									? "Секція"
									: kved.type === "division"
										? "Розділ"
										: kved.type === "group"
											? "Група"
											: "Клас"}
							</span>

							{kved.allowedSimplifiedGroups &&
								kved.allowedSimplifiedGroups.length > 0 && (
									<span className="kved-groups-badge">
										Групи ФОП: {kved.allowedSimplifiedGroups.join(", ")}
									</span>
								)}
						</div>

						{kved.restrictions && (
							<div className="kved-restrictions">
								<strong>⚠️ Обмеження:</strong> {kved.restrictions}
							</div>
						)}
					</li>
				))}

				{filteredKveds.length === 0 && (
					<li className="kved-empty">За вашим запитом нічого не знайдено 🕵️‍♂️</li>
				)}
			</ul>
		</div>
	);
};

export default KvedSearch;
