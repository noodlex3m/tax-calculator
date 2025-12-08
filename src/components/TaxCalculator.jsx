import { useState, useEffect } from "react";
import {
	calculateTaxes,
	calculateNetProfit,
	isMinIncomeForVat,
} from "../utils/taxLogic";
import ResultsChart from "./ResultsChart";
import LimitIndicator from "./LimitIndicator";
import { LIMITS } from "../utils/taxConstants";
import "./TaxCalculator.css";

function TaxCalculator() {
	const [income, setIncome] = useState("");
	const [taxSystem, setTaxSystem] = useState("");
	const [taxGroup, setTaxGroup] = useState("");
	const [grossIncomeAmount, setGrossIncomeAmount] = useState("");
	const [expenseAmount, setExpenseAmount] = useState("");
	const [taxResult, setTaxResult] = useState(null);

	const [history, setHistory] = useState(() => {
		const saved = localStorage.getItem("taxHistory");
		return saved ? JSON.parse(saved) : [];
	});

	useEffect(() => {
		localStorage.setItem("taxHistory", JSON.stringify(history));
	}, [history]);

	const netProfit = calculateNetProfit(grossIncomeAmount, expenseAmount);

	const formatter = new Intl.NumberFormat("uk-UA", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	const formatMoney = (amount) => `${formatter.format(amount)} грн.`;

	const handleKeyDown = (e) => {
		if (["-", "+", "e", "E"].includes(e.key)) {
			e.preventDefault();
		}
	};

	function handleSubmit(e) {
		e.preventDefault();
		const incomeToUse = taxSystem === "general" ? grossIncomeAmount : income;

		if (!incomeToUse) return;

		const result = calculateTaxes(
			taxSystem,
			taxGroup,
			incomeToUse,
			expenseAmount
		);
		setTaxResult(result);

		const newItem = {
			date: new Date().toLocaleDateString(),
			system:
				taxSystem === "general" ? "Загальна" : `Спрощена (${taxGroup} гр.)`,
			income: parseFloat(incomeToUse),
			total: result.totalAmount,
		};
		setHistory((prev) => [newItem, ...prev].slice(0, 5));
	}

	const incomeForChart =
		taxSystem === "general" ? netProfit : parseFloat(income) || 0;

	const cleanIncome = taxResult ? incomeForChart - taxResult.totalAmount : 0;

	return (
		<div className="calculator-container">
			<form onSubmit={handleSubmit}>
				<h1>Калькулятор податків ФОП на 2025 рік</h1>

				<fieldset>
					<legend>Оберіть систему оподаткування</legend>
					<div>
						<input
							type="radio"
							id="simplified"
							name="system"
							value="simplified"
							checked={taxSystem === "simplified"}
							onChange={(e) => {
								setTaxSystem(e.target.value);
								setTaxResult(null);
							}}
						/>
						<label htmlFor="simplified">Спрощена</label>
					</div>
					<div>
						<input
							type="radio"
							id="general"
							name="system"
							value="general"
							checked={taxSystem === "general"}
							onChange={(e) => {
								setTaxSystem(e.target.value);
								setTaxResult(null);
							}}
						/>
						<label htmlFor="general">Загальна</label>
					</div>
				</fieldset>

				{taxSystem === "simplified" && (
					<>
						<fieldset>
							<legend>Оберіть групу</legend>
							<select
								value={taxGroup}
								onChange={(e) => setTaxGroup(e.target.value)}
							>
								<option value="">-- Оберіть групу --</option>
								<option value="1">I група</option>
								<option value="2">II група</option>
								<option value="3">III група 5%</option>
							</select>
						</fieldset>

						<fieldset>
							<legend>Вкажіть орієнтовний дохід за рік</legend>
							<input
								type="number"
								value={income}
								onChange={(e) => setIncome(e.target.value)}
								placeholder="Наприклад: 500000"
								onKeyDown={handleKeyDown}
							/>

							{taxGroup && income && (
								<LimitIndicator
									currentIncome={parseFloat(income)}
									limit={LIMITS[taxGroup]}
								/>
							)}
						</fieldset>
					</>
				)}

				{taxSystem === "general" && (
					<fieldset>
						<legend>Доходи та витрати</legend>
						<div id="grossIncome">
							<label htmlFor="incomeAmount">Сума доходу:</label>
							{isMinIncomeForVat(grossIncomeAmount) && (
								<div className="warning-text">
									<p>
										Увага: якщо дохід сукупно перевищує 1 млн. грн., така особа
										зобов’язана зареєструватися як платник ПДВ
									</p>
								</div>
							)}
							<input
								type="number"
								id="incomeAmount"
								value={grossIncomeAmount}
								onChange={(e) => setGrossIncomeAmount(e.target.value)}
								onKeyDown={handleKeyDown}
							/>
						</div>
						<div id="expenses">
							<label htmlFor="expenseAmount">Сума витрат:</label>
							<input
								type="number"
								id="expenseAmount"
								value={expenseAmount}
								onChange={(e) => setExpenseAmount(e.target.value)}
								onKeyDown={handleKeyDown}
							/>
						</div>
						<div id="netProfit" style={{ marginTop: "1rem" }}>
							<p>
								Чистий дохід: <strong>{formatMoney(netProfit)}</strong>
							</p>
						</div>
					</fieldset>
				)}

				<button type="submit" className="calculate-btn">
					Розрахувати
				</button>
			</form>

			{taxResult && (
				<div className="results-block">
					<h3>Результати (місяць):</h3>

					<p>
						Єдиний Соціальний Внесок (ЄСВ):{" "}
						<strong>{formatMoney(taxResult.esvAmount)}</strong>
					</p>

					{taxSystem === "general" && (
						<p>
							Податок на доходи (ПДФО):{" "}
							<strong>{formatMoney(taxResult.taxAmount)}</strong>
						</p>
					)}

					{taxSystem === "simplified" && (
						<>
							<p>
								Єдиний податок:{" "}
								<strong>{formatMoney(taxResult.taxAmount)}</strong>
							</p>
							{taxResult.excessTaxAmount > 0 && (
								<p className="excess-tax">
									Податок з перевищення (15%):
									<span> {formatMoney(taxResult.excessTaxAmount)}</span>
								</p>
							)}
						</>
					)}

					<p>
						Військовий збір:{" "}
						<strong>{formatMoney(taxResult.militaryTaxAmount)}</strong>
					</p>

					<hr />
					<h4>Разом до сплати: {formatMoney(taxResult.totalAmount)}</h4>

					<ResultsChart
						taxAmount={taxResult.taxAmount + (taxResult.excessTaxAmount || 0)}
						esvAmount={taxResult.esvAmount}
						militaryTaxAmount={taxResult.militaryTaxAmount}
						netProfit={cleanIncome}
					/>

					{history.length > 0 && (
						<div className="history-block">
							<h3>📜 Історія</h3>
							<button
								onClick={() => setHistory([])}
								className="clear-history-btn"
							>
								Очистити
							</button>
							<ul>
								{history.map((item, index) => (
									<li key={index}>
										<span>
											{item.date} | {item.system}
										</span>
										<strong> {formatMoney(item.total)}</strong>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default TaxCalculator;
