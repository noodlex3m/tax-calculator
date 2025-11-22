import { useState } from "react";
import { calculateTaxes, isIncomeOverLimit, calculateNetProfit } from "../utils/taxLogic";
import { CALCULATED_CONSTANTS } from "../utils/taxConstants";
import "./TaxCalculator.css";

function TaxCalculator() {
	const [income, setIncome] = useState("");
	const [taxSystem, setTaxSystem] = useState("");
	const [taxGroup, setTaxGroup] = useState("");
	const [grossIncomeAmount, setGrossIncomeAmount] = useState("");
	const [expenseAmount, setExpenseAmount] = useState("");
	const [taxResult, setTaxResult] = useState(null);

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
		const result = calculateTaxes(taxSystem, taxGroup, incomeToUse, expenseAmount);
		setTaxResult(result);
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
										<p>Увага: обсяг доходу перевищує {formatMoney(CALCULATED_CONSTANTS.INCOME_LIMIT_GROUP_3)}</p>
									</div>
								)}
							</fieldset>
						)}
					</>
				)}
				{taxSystem === "general" && (
					<fieldset>
						<legend>
							Відображення доходів та витрат від провадження господарської
							діяльності
						</legend>
						<div id="grossIncome">
							<label htmlFor="incomeAmount">Сума одержаного доходу: </label>
							<input
								type="number"
								id="incomeAmount"
								value={grossIncomeAmount}
								onChange={(e) => setGrossIncomeAmount(e.target.value)}
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
						Єдиний Соціальний Внесок (ЄСВ): {formatMoney(taxResult.esvAmount)}
					</p>

					{taxSystem === "general" && (
						<p>Податок на доходи (ПДФО): {formatMoney(taxResult.taxAmount)}</p>
					)}

					{taxSystem === "simplified" && (
						<>
							<p>Єдиний податок: {formatMoney(taxResult.taxAmount)}</p>
							{taxResult.excessTaxAmount > 0 && (
								<p className="excess-tax">
									Податок із суми перевищення (15%):
									<span> {formatMoney(taxResult.excessTaxAmount)}</span>
								</p>
							)}
						</>
					)}
					<p>Військовий збір: {formatMoney(taxResult.militaryTaxAmount)}</p>

					<hr />
					<h4>Разом до сплати: {formatMoney(taxResult.totalAmount)}</h4>
				</div>
			)}
		</div>
	);
}

export default TaxCalculator;
