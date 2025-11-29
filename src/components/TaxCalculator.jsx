import { useState, useEffect } from "react";
import {
	calculateTaxes,
	isIncomeOverLimit,
	calculateNetProfit,
	isMinIncomeForVat,
} from "../utils/taxLogic";
import { CALCULATED_CONSTANTS } from "../utils/taxConstants";
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

	const formattedNetProfit = formatMoney(netProfit);

	function handleSubmit(e) {
		e.preventDefault();
		const incomeToUse = taxSystem === "general" ? grossIncomeAmount : income;
		const result = calculateTaxes(
			taxSystem,
			taxGroup,
			incomeToUse,
			expenseAmount
		);
		setTaxResult(result);

		const newRecord = {
			id: Date.now(),
			date: new Date().toLocaleDateString(),
			system: taxSystem === "simplified" ? "Спрощена" : "Загальна",
			group: taxGroup,
			income: incomeToUse,
			total: result.totalAmount,
		};
		setHistory((prev) => [newRecord, ...prev]);
	}

	return (
		<div className="calculator-container">
			<form onSubmit={handleSubmit}>
				<h1>Калькулятор податів ФОП на 2025 рік</h1>
				<fieldset>
					<legend>Оберіть систему оподаткування</legend>
					<div>
						<input
							type="radio"
							id="general"
							name="system"
							value="general"
							checked={taxSystem === "general"}
							onChange={(e) => setTaxSystem(e.target.value)}
						/>
						<label htmlFor="general">Загальна</label>
					</div>
					<div>
						<input
							type="radio"
							id="simplified"
							name="system"
							value="simplified"
							checked={taxSystem === "simplified"}
							onChange={(e) => setTaxSystem(e.target.value)}
						/>
						<label htmlFor="simplified">Спрощена</label>
					</div>
				</fieldset>
				{taxSystem === "simplified" && (
					<>
						<fieldset>
							<legend>Оберіть групу єдиного податку</legend>
							<select
								value={taxGroup}
								onChange={(e) => setTaxGroup(e.target.value)}
							>
								<option value="" disabled>
									-- Оберіть групу --
								</option>
								<option value="1">I група</option>
								<option value="2">II група</option>
								<option value="3">III група 5%</option>
								<option value="" disabled>
									III група 3% з ПДВ
								</option>
							</select>
						</fieldset>
						{taxGroup === "3" && (
							<fieldset>
								<legend>Вкажіть орієнтовну суму доходу для 3-ї групи</legend>
								<input
									type="number"
									id="income"
									value={income}
									onChange={(e) => setIncome(e.target.value)}
									className={isIncomeOverLimit(income) ? "over-limit" : ""}
								/>
								{isIncomeOverLimit(income) && (
									<div className="warning-text">
										<p>
											Увага: обсяг доходу перевищує{" "}
											{formatMoney(CALCULATED_CONSTANTS.INCOME_LIMIT_GROUP_3)}
										</p>
									</div>
								)}
							</fieldset>
						)}
					</>
				)}
				{taxSystem === "general" && (
					<fieldset>
						<legend>Відображення доходів та витрат</legend>
						<div id="grossIncome">
							<label htmlFor="incomeAmount">Сума одержаного доходу: </label>
							<input
								type="number"
								id="incomeAmount"
								value={grossIncomeAmount}
								onChange={(e) => setGrossIncomeAmount(e.target.value)}
								className={
									isMinIncomeForVat(grossIncomeAmount) ? "over-limit" : ""
								}
							/>
						</div>
						<div id="expenses">
							<label htmlFor="expenseAmount">
								Вартість документально підтверджених витрат:
							</label>
							<input
								type="number"
								id="expenseAmount"
								value={expenseAmount}
								onChange={(e) => setExpenseAmount(e.target.value)}
							/>
						</div>
						<div id="netProfit">
							<p>Сума чистого оподатковуваного доходу: {formattedNetProfit}</p>
						</div>
						{isMinIncomeForVat(grossIncomeAmount) && (
							<div className="warning-text">
								<p>
									Увага: якщо протягом останніх 12 календарних місяців дохід
									перевищує 1 млн. &#8372; &rarr; необхідно зареєструватися
									платником ПДВ
								</p>
							</div>
						)}
					</fieldset>
				)}
				<button type="submit" className="calculate-btn">
					Розрахувати
				</button>
			</form>
			{taxResult && (
				<div className="results-block">
					<h3>Результати розрахунку (на місяць):</h3>
					<p>
						Єдиний соціальний внесок (ЄСВ): {formatMoney(taxResult.esvAmount)}
					</p>

					{taxSystem === "general" && (
						<p>Податок на доходи (ПДФО): {formatMoney(taxResult.taxAmount)}</p>
					)}

					{taxSystem === "simplified" && (
						<>
							<p>Єдиний податок (ЄП): {formatMoney(taxResult.taxAmount)}</p>
							{taxResult.excessTaxAmount > 0 && (
								<p className="excess-tax">
									ЄП до суми перевищення обсягу доходу (15%):
									<span> {formatMoney(taxResult.excessTaxAmount)}</span>
								</p>
							)}
						</>
					)}
					<p>
						Військовий збір (ВЗ): {formatMoney(taxResult.militaryTaxAmount)}
					</p>

					<hr />
					<h4>Разом до сплати: {formatMoney(taxResult.totalAmount)}</h4>
					{history.length > 0 && (
						<div className="history-block">
							<h3>📜 Історія розрахунків</h3>
							<button
								onClick={() => setHistory([])}
								className="clear-history-btn"
							>
								Очистити
							</button>
							<ul>
								{history.map((item) => (
									<li key={item.id}>
										<strong>{item.date}</strong> — {item.system}
										{item.group && ` (${item.group} група)`}:{" "}
										<b>{formatMoney(item.total)}</b>
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
