import React, { useContext } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { ThemeContext } from "../context/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend);

function ResultsChart({ taxAmount, esvAmount, militaryTaxAmount, netProfit }) {
	const { theme } = useContext(ThemeContext);

	const isDark = theme === "dark";
	const borderColor = isDark ? "#2d2d2d" : "#ffffff";

	const valNetProfit = Math.max(0, parseFloat(netProfit) || 0);
	const valTax = Math.max(0, parseFloat(taxAmount) || 0);
	const valEsv = Math.max(0, parseFloat(esvAmount) || 0);
	const valMilitary = Math.max(0, parseFloat(militaryTaxAmount) || 0);

	const data = {
		labels: ["Чистий дохід", "Єдиний податок / ПДФО", "ЄСВ", "Військовий збір"],
		datasets: [
			{
				label: "Сума (грн)",
				data: [valNetProfit, valTax, valEsv, valMilitary],
				backgroundColor: ["#10b981", "#ff9800", "#ef4444", "#3b82f6"],
				borderColor: borderColor,
				borderWidth: 2,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: true,
		plugins: {
			legend: {
				display: false, // Приховуємо вбудовану легенду Chart.js для уникнення обрізання на мобільних
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

	const formatMoney = (amount) =>
		new Intl.NumberFormat("uk-UA", {
			style: "currency",
			currency: "UAH",
			maximumFractionDigits: 0,
		}).format(amount);

	return (
		<div className="chart-wrapper">
			<div className="pie-chart-container">
				<Pie data={data} options={options} />
			</div>
			
			<div className="chart-html-legend">
				<div className="chart-legend-item">
					<span className="legend-dot net"></span>
					<span className="legend-label">Чистий дохід:</span>
					<strong className="legend-value">{formatMoney(valNetProfit)}</strong>
				</div>
				<div className="chart-legend-item">
					<span className="legend-dot tax-main"></span>
					<span className="legend-label">Податок (ЄП / ПДФО):</span>
					<strong className="legend-value">{formatMoney(valTax)}</strong>
				</div>
				<div className="chart-legend-item">
					<span className="legend-dot esv"></span>
					<span className="legend-label">ЄСВ:</span>
					<strong className="legend-value">{formatMoney(valEsv)}</strong>
				</div>
				<div className="chart-legend-item">
					<span className="legend-dot military"></span>
					<span className="legend-label">Військовий збір:</span>
					<strong className="legend-value">{formatMoney(valMilitary)}</strong>
				</div>
			</div>
		</div>
	);
}

export default ResultsChart;
