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
			<div className="auth-warning" style={{ marginBottom: "2rem", textAlign: "center", borderColor: "#059669", backgroundColor: "rgba(5, 150, 105, 0.05)", color: "#059669" }}>
				<strong style={{ fontSize: "1.1rem", color: "#059669" }}>✅ Довідник КВЕД повністю верифіковано з ПКУ 2026</strong>
				<p style={{ marginTop: "0.5rem", marginBottom: 0, color: "var(--text-color)" }}>
					Базу даних КВЕД-2010 повністю звірено з <strong>п. 291.4, п. 291.5 та п. 291.7 ст. 291 Податкового кодексу України (ПКУ)</strong>.
				</p>
				<p style={{ marginTop: "0.5rem", marginBottom: 0, fontSize: "0.85rem", color: "var(--text-color)" }}>
					<em>Довідник містить усі <strong>{kvedData.length}</strong> КВЕДів з автоматичним розрахунком дозволених груп спрощеної системи (1, 2, 3 групи ФОП) та детальним описом встановлених законодавством обмежень (у тому числі для підакцизних товарів, фінансового посередництва, ювелірних виробів та оренди нерухомості).</em>
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
