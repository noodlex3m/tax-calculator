import { useState } from "react";

function TaxCalculator() {
	const [income, setIncome] = useState("");
	const [taxSystem, setTaxSystem] = useState("");
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
		</>
	);
}

export default TaxCalculator;
