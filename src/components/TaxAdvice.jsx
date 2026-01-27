import React from "react";
import { GROUP_DETAILS } from "../data/taxDetails";
import "./TaxAdvice.css";

const TaxAdvice = ({ taxSystem, taxGroup, income, isExcess }) => {
	const detailsKey = taxSystem === "simplified" ? taxGroup : "general";

	const details = GROUP_DETAILS[detailsKey];

	if (!details) return null;

	return (
		<div className="tax-advice-container">
			{/* 1. БЛОК РИЗИКІВ (Показуємо відкрито, якщо є проблема) */}
			{isExcess && details.risks?.excess_limit && (
				<div className="advice-alert advice-danger">
					<strong>🚨 УВАГА:</strong> {details.risks.excess_limit}
				</div>
			)}

			{/* Ризик для загальної системи (ПДВ > 1 млн) */}
			{taxSystem === "general" &&
				parseFloat(income) > 1000000 &&
				details.risks?.vat_mandatory && (
					<div className="advice-alert advice-warning">
						<strong>⚠️ ПДВ:</strong> {details.risks.vat_mandatory}
					</div>
				)}

			{/* 2. БЛОК КОРИСНОЇ ІНФОРМАЦІЇ (Схований у details) */}
			<details className="advice-details">
				<summary>ℹ️ Довідка та календар для {details.title}</summary>

				<div className="advice-content">
					{/* Поширені помилки (якщо є) */}
					{details.commonErrors?.map((error) => (
						<div key={error.id} className="advice-note">
							<strong>{error.title}:</strong> {error.text}
						</div>
					))}

					{/* Календар */}
					<div className="advice-section">
						<h4>📅 Календар підприємця</h4>
						<ul>
							<li>
								<strong>Звіти:</strong> {details.calendar.report}
							</li>
							<li>
								<strong>Сплата податку:</strong> {details.calendar.taxPayment}
							</li>
							<li>
								<strong>Сплата ЄСВ:</strong> {details.calendar.esvPayment}
							</li>
						</ul>
					</div>

					{/* Військовий збір */}
					{details.militaryTax && (
						<div className="advice-section">
							<h4>🎖️ Військовий збір</h4>
							<p>{details.militaryTax.description}</p>
							<p>
								<strong>Сплата:</strong> {details.militaryTax.payment}
							</p>
							{details.militaryTax.notes && (
								<ul>
									{details.militaryTax.notes.map((note, idx) => (
										<li key={idx}>{note}</li>
									))}
								</ul>
							)}
						</div>
					)}

					{/* Дозволи/Заборони */}
					<div className="advice-section">
						<h4>📋 Діяльність</h4>
						<p>
							✅ <strong>Дозволено:</strong> {details.activities.allowed}
						</p>
						{details.employees && (
							<p>
								👥 <strong>Працівники:</strong> {details.employees}
							</p>
						)}
						<p>
							🚫 <strong>Заборонено:</strong> {details.activities.forbidden}
						</p>
					</div>
				</div>
			</details>
		</div>
	);
};

export default TaxAdvice;
