import React from "react";

function LimitIndicator({ currentIncome, limit }) {
	if (!limit || !currentIncome) return null;

	const percentage = Math.min((currentIncome / limit) * 100, 100);

	let progressBarColor = "#00e676";
	if (percentage > 80) progressBarColor = "#ff9800";
	if (percentage >= 100) progressBarColor = "#f44336";

	const formatMoney = (amount) => new Intl.NumberFormat("uk-UA").format(amount);

	return (
		<div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: "0.5rem",
					fontSize: "0.85rem",
					color: "var(--text-secondary)",
					gap: "1rem", // 👈 ДОДАНО: гарантований відступ між текстом
				}}
			>
				<span>Дохід: {formatMoney(currentIncome)} грн</span>
				<span>Ліміт: {formatMoney(limit)} грн</span>
			</div>

			<div
				style={{
					height: "8px",
					width: "100%",
					backgroundColor: "var(--bg-input)",
					borderRadius: "4px",
					overflow: "hidden",
					border: "1px solid var(--border-color)",
				}}
			>
				<div
					style={{
						height: "100%",
						width: `${percentage}%`,
						backgroundColor: progressBarColor,
						transition: "width 0.5s ease-in-out, background-color 0.3s",
					}}
				></div>
			</div>

			{percentage >= 100 && (
				<p
					style={{
						color: "#f44336",
						fontSize: "0.85rem",
						marginTop: "0.5rem",
						fontWeight: "bold",
					}}
				>
					⚠️ Увага! Ви перевищили ліміт доходу для Вашої групи.
				</p>
			)}
		</div>
	);
}

export default LimitIndicator;
