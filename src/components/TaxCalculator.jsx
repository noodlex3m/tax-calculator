import { useState } from "react";

function TaxCalculator() {
	const [income, setIncome] = useState("");
	const [taxSystem, setTaxSystem] = useState("");
	const [taxGroup, setTaxGroup] = useState("");
	const [grossIncomeAmount, setGrossIncomeAmount] = useState("");
	const [expenseAmount, setExpenseAmount] = useState("");

	const netProfit = (() => {
		const gross = parseFloat(grossIncomeAmount) || 0;
		const expenses = parseFloat(expenseAmount) || 0;
		return gross - expenses;
	})();

	const formattedNetProfit = new Intl.NumberFormat("uk-UA", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(netProfit);

	return (
		<>
			<form action="#">
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
				<fieldset>
					<legend>Вкажіть орієнтовний дохід за рік</legend>
					<input
						type="number"
						id="income"
						value={income}
						onChange={(e) => setIncome(e.target.value)}
					/>
				</fieldset>
			</form>
			<p>Ви ввели: {income}</p>
			<p>Обрана система оподаткування: {taxSystem}</p>
			<p>Обрана група: {taxGroup}</p>
		</>
	);
}

export default TaxCalculator;
