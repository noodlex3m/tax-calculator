import { useState } from "react";
import {
	calculateTaxes,
	calculateNetProfit,
	isMinIncomeForVat,
} from "../utils/taxLogic";
import ResultsChart from "./ResultsChart";
import LimitIndicator from "./LimitIndicator";
import { LIMITS } from "../utils/taxConstants";
import { Helmet } from "react-helmet-async";
import TaxAdvice from "./TaxAdvice";
import "./TaxCalculator.css";

// НОВІ ІМПОРТИ ДЛЯ FIREBASE
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function TaxCalculator() {
	// Отримуємо поточного користувача
	const { user } = useAuth();

	const [income, setIncome] = useState("");
	const [taxSystem, setTaxSystem] = useState("");
	const [taxGroup, setTaxGroup] = useState("");
	const [grossIncomeAmount, setGrossIncomeAmount] = useState("");
	const [expenseAmount, setExpenseAmount] = useState("");
	const [taxResult, setTaxResult] = useState(null);



	const netProfit = calculateNetProfit(grossIncomeAmount, expenseAmount);

	const formatter = new Intl.NumberFormat("uk-UA", {
		style: "currency",
		currency: "UAH",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	const formatMoney = (amount) => formatter.format(amount);

	const handleKeyDown = (e) => {
		if (["-", "+", "e", "E"].includes(e.key)) {
			e.preventDefault();
		}
	};

	async function handleSubmit(e) {
		e.preventDefault();
		const incomeToUse = taxSystem === "general" ? grossIncomeAmount : income;

		if (!incomeToUse) return;

		const result = calculateTaxes(
			taxSystem,
			taxGroup,
			incomeToUse,
			expenseAmount,
		);
		setTaxResult(result);

		const newItem = {
			date: new Date().toISOString(),
			system:
				taxSystem === "general" ? "Загальна" : `Спрощена (${taxGroup} гр.)`,
			income: parseFloat(incomeToUse),
			tax: result.yearly.tax + (result.yearly.excess || 0),
			esv: result.yearly.esv,
			military: result.yearly.military || 0,
			total: result.yearly.total,
		};

		// 🔥 МАГІЯ FIREBASE: Зберігаємо в базу даних, якщо користувач авторизований
		if (user) {
			try {
				// addDoc автоматично створює колекцію "calculations" і новий документ
				await addDoc(collection(db, "calculations"), {
					...newItem,
					userId: user.uid, // Прив'язуємо розрахунок до конкретної людини
				});
				console.log("Успішно збережено в Firestore!");
			} catch (error) {
				console.error("Помилка збереження в базу:", error);
			}
		}
	}

	const incomeForChart =
		taxSystem === "general" ? netProfit : parseFloat(income) || 0;

	const cleanIncome = taxResult ? incomeForChart - taxResult.yearly.total : 0;

	return (
		<div className="calculator-container">
			<Helmet>
				<title>Калькулятор податків ФОП 2026 — Tax.Serh.One</title>
				<meta
					name="description"
					content="Розрахуйте єдиний податок та ЄСВ для 1, 2 та 3 групи ФОП. Актуальні ставки 2026 року."
				/>
				<link rel="canonical" href="https://tax.serh.one/calculator" />
			</Helmet>
			<form onSubmit={handleSubmit}>
				<h1>Калькулятор податків ФОП на 2026 рік</h1>

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
					<h3>📊 Результати розрахунку</h3>

					<div className="results-table-container">
						<table className="results-table">
							<thead>
								<tr>
									<th>Податок</th>
									<th>За місяць</th>
									<th>За рік</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>ЄСВ</td>
									<td>{formatMoney(taxResult.monthly.esv)}</td>
									<td>{formatMoney(taxResult.yearly.esv)}</td>
								</tr>
								<tr>
									<td>
										{taxSystem === "general" ? "ПДФО (18%)" : "Єдиний податок"}
									</td>
									<td>{formatMoney(taxResult.monthly.tax)}</td>
									<td>{formatMoney(taxResult.yearly.tax)}</td>
								</tr>
								<tr>
									<td>Військовий збір</td>
									<td>{formatMoney(taxResult.monthly.military)}</td>
									<td>{formatMoney(taxResult.yearly.military)}</td>
								</tr>
								{taxResult.yearly.excess > 0 && (
									<tr className="excess-row">
										<td>⚠️ ЄП з перевищення</td>
										<td>{formatMoney(taxResult.monthly.excess)}</td>
										<td>{formatMoney(taxResult.yearly.excess)}</td>
									</tr>
								)}
								<tr className="total-row">
									<td>РАЗОМ до сплати</td>
									<td>{formatMoney(taxResult.monthly.total)}</td>
									<td>{formatMoney(taxResult.yearly.total)}</td>
								</tr>
							</tbody>
						</table>
					</div>

					<ResultsChart
						taxAmount={taxResult.yearly.tax + taxResult.yearly.excess}
						esvAmount={taxResult.yearly.esv}
						militaryTaxAmount={taxResult.yearly.military}
						netProfit={cleanIncome}
					/>

					<TaxAdvice
						taxSystem={taxSystem}
						taxGroup={taxGroup}
						income={grossIncomeAmount}
						isExcess={taxResult.yearly.excess > 0}
					/>
				</div>
			)}
		</div>
	);
}

export default TaxCalculator;
