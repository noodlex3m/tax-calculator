import { useState } from "react";

function TaxCalculator() {
	const [income, setIncome] = useState("");
	const [taxSystem, setTaxSystem] = useState("");
	const [taxGroup, setTaxGroup] = useState("");
	const [grossIncomeAmount, setGrossIncomeAmount] = useState("");
	const [expenseAmount, setExpenseAmount] = useState("");
	const [taxResult, setTaxResult] = useState(null);

	const netProfit = (() => {
		const gross = parseFloat(grossIncomeAmount) || 0;
		const expenses = parseFloat(expenseAmount) || 0;
		return gross - expenses;
	})();

	const formattedNetProfit = new Intl.NumberFormat("uk-UA", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(netProfit);

	function handleSubmit(e) {
		e.preventDefault();

		const numIncome = parseFloat(income) || 0;

		let tax = 0;
		let esv = 2200;
		let militaryTax = 0;

		if (taxSystem === "simplified") {
			if (taxGroup === "3") {
				tax = numIncome * 0.05;
				militaryTax = numIncome * 0.01;
			} else if (taxGroup === "2") {
				tax = 1400;
			} else if (taxGroup === "1") {
				tax = 302.8;
			}
		} else if (taxSystem === "general") {
			if (netProfit > 0) {
				tax = netProfit * 0.18;
				militaryTax = netProfit * 0.05;
			}
		}
		setTaxResult({
			taxAmount: tax,
			esvAmount: esv,
			militaryTaxAmount: militaryTax,
			totalAmount: tax + esv + militaryTax,
		});
	}

	return (
		<>
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
								<legend>
									Вкажіть орієнтовну суму доходу для 3-ї групи за рік
								</legend>
								<input
									type="number"
									id="income"
									value={income}
									onChange={(e) => setIncome(e.target.value)}
								/>
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
				<button type="submit">Розрахувати</button>
			</form>
			{taxResult && (
				<div className="results">
					<h3>Результати розрахунку (на місяць):</h3>
					<p>
						Єдиний Соціальний Внесок (ЄСВ): {taxResult.esvAmount.toFixed(2)} грн
					</p>

					{taxSystem === "general" && (
						<>
							<p>
								Податок на доходи (ПДФО): {taxResult.taxAmount.toFixed(2)} грн
							</p>
							<p>
								Військовий збір: {taxResult.militaryTaxAmount.toFixed(2)} грн
							</p>
						</>
					)}

					{taxSystem === "simplified" && (
						<>
							<p>Єдиний податок: {taxResult.taxAmount.toFixed(2)} грн</p>
							<p>
								Військовий збір: {taxResult.militaryTaxAmount.toFixed(2)} грн
							</p>
						</>
					)}

					<hr />
					<h4>Разом до сплати: {taxResult.totalAmount.toFixed(2)} грн</h4>
				</div>
			)}
		</>
	);
}

export default TaxCalculator;
