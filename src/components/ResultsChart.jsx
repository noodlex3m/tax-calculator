import React, { useContext } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { ThemeContext } from "../context/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend);

function ResultsChart({ taxAmount, esvAmount, militaryTaxAmount, netProfit }) {
	const { theme } = useContext(ThemeContext);

	const isDark = theme === "dark";
	const textColor = isDark ? "#ffffff" : "#213547";
	const borderColor = isDark ? "#2d2d2d" : "#ffffff";

	const data = {
		labels: ["Чистий дохід", "Єдиний податок / ПДФО", "ЄСВ", "Військовий збір"],
		datasets: [
			{
				label: "Сума (грн)",
				data: [netProfit, taxAmount, esvAmount, militaryTaxAmount],
				backgroundColor: ["#4caf50", "#ff9800", "#9c27b0"],
				borderColor: borderColor,
				borderWidth: 2,
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: "bottom",
				labels: {
					color: textColor,
					font: {
						size: 14,
						family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
					},
					padding: 20,
				},
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						let label = context.label || "";
						if (label) {
							label += ": ";
						}
						if (context.parsed !== null) {
							label += new Intl.NumberFormat("uk-UA", {
								style: "currency",
								currency: "UAH",
							}).format(context.parsed);
						}
						return label;
					},
				},
			},
		},
	};
	return (
		<div style={{ maxWidth: "400px", margin: "2rem auto" }}>
			<Pie data={data} options={options} />
		</div>
	);
}

export default ResultsChart;
