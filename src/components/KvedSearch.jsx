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
				<strong style={{ fontSize: "1.1rem" }}>🚧 Довідник КВЕД: Верифікація спрощеної системи оподаткування</strong>
				<p style={{ marginTop: "0.5rem", marginBottom: 0, color: "var(--text-muted)" }}>
					Довідник містить усі <strong>{kvedData.length}</strong> КВЕДів. Дозволені групи єдиного податку розраховані автоматично на основі ст. 291 ПКУ (включаючи обмеження щодо підакцизних товарів, ювелірних виробів, оренди та фінансового посередництва).
				</p>
				<p style={{ marginTop: "0.5rem", marginBottom: 0, fontSize: "0.85rem", color: "var(--text-color)" }}>
					<em>Увага: податкове законодавство динамічно змінюється та має приховані нюанси. 
					Наприклад, з 1 січня 2022 року набрав чинності Закон «Про електронні комунікації», через який ФОП, які постачають електронні комунікаційні послуги та доступ до інтернету (КВЕДи розділу 61), втратили право на спрощену систему відповідно до останніх роз'яснень ДПС (ЗІР, категорія 107.01.01). 
					База постійно оновлюється. Якщо ви знайшли неточність — напишіть нам у вкладку «Зв'язок»!</em>
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
