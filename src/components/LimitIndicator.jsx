import React from "react";

function LimitIndicator({ currentIncome, limit }) {
	if (!limit || !currentIncome) return null;

	const percentage = Math.min((currentIncome / limit) * 100, 100);

	let color = "#00e676";
	if (percentage > 80) color = "#ff9800";
	if (percentage >= 100) color = "#f44446";

	const formatMoney = (amount) => new Intl.NumberFormat("uk-UA").format(amount);

	return (
		<div style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: "0.5rem",
					fontSize: "0.9rem",
					color: "#ccc",
				}}
			>
				<span>Поточний дохід: {formatMoney(currentIncome)} грн</span>
				<span>Ліміт: {formatMoney(limit)} грн</span>
			</div>

			<div
				style={{
					height: "10px",
					width: "100%",
					backgroundColor: "#444",
					borderRadius: "5px",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						height: "100%",
						width: `${percentage}%`,
						backgroundColor: color,
						transition: "width 0.5s ease-in-out, background-color 0.3s",
					}}
				></div>
			</div>

			{percentage >= 100 && (
				<p
					style={{ color: "#f44336", fontSize: "0.85rem", marginTop: "0.5rem" }}
				>
					⚠️ Увага! Ви перевищили ліміт доходу для вашої групи.
				</p>
			)}
		</div>
	);
}

export default LimitIndicator;
