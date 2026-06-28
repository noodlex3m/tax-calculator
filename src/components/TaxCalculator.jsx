import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
	calculateTaxes,
	calculateNetProfit,
	isMinIncomeForVat,
} from "../utils/taxLogic";
import ResultsChart from "./ResultsChart";
import LimitIndicator from "./LimitIndicator";
import { LIMITS } from "../utils/taxConstants";
import TaxAdvice from "./TaxAdvice";
import "./TaxCalculator.css";

// НОВІ ІМПОРТИ ДЛЯ FIREBASE
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";

function TaxCalculator() {
	// Отримуємо поточного користувача
	const { user } = useAuth();

	const [income, setIncome] = useState("");
	const [taxSystem, setTaxSystem] = useState("simplified");
	const [taxGroup, setTaxGroup] = useState("");
	const [grossIncomeAmount, setGrossIncomeAmount] = useState("");
	const [expenseAmount, setExpenseAmount] = useState("");
	const [taxResult, setTaxResult] = useState(null);
	const [esvBenefit, setEsvBenefit] = useState("Немає пільги");

	const [searchParams] = useSearchParams();

	// Завантаження пільги ЄСВ з облікової картки ФОП (якщо користувач авторизований)
	useEffect(() => {
		const loadUserProfile = async () => {
			if (!user) return;
			try {
				const docRef = doc(db, "userProfiles", user.uid);
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					const data = docSnap.data();
					if (data.esvBenefit) {
						setEsvBenefit(data.esvBenefit);
					}
				}
			} catch (error) {
				console.error("Помилка завантаження профілю в калькуляторі:", error);
			}
		};

		loadUserProfile();
	}, [user]);

	// Пресет налаштувань групи ФОП з Гіда (URL Query Params)
	useEffect(() => {
		const group = searchParams.get("group");
		if (group) {
			if (group === "general") {
				setTaxSystem("general");
				setTaxResult(null);
			} else if (["1", "2", "3"].includes(group)) {
				setTaxSystem("simplified");
				setTaxGroup(group);
				setTaxResult(null);
			}
		}
	}, [searchParams]);

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
			esvBenefit,
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
			esvBenefit: esvBenefit,
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

	const cleanIncome = taxResult ? Math.max(0, incomeForChart - taxResult.yearly.total) : 0;

	// Розрахунок відсотків для смуги розподілу в UI
	const totalBasis = Math.max(1, incomeForChart);
	const taxVal = taxResult ? taxResult.yearly.tax + (taxResult.yearly.excess || 0) : 0;
	const esvVal = taxResult ? taxResult.yearly.esv : 0;
	const milVal = taxResult ? taxResult.yearly.military || 0 : 0;

	const netPercent = (cleanIncome / totalBasis) * 100;
	const taxPercent = (taxVal / totalBasis) * 100;
	const esvPercent = (esvVal / totalBasis) * 100;
	const milPercent = (milVal / totalBasis) * 100;

	return (
		<div className="calculator-container-modern">
			<title>Калькулятор податків ФОП 2026 — Tax.Serh.One</title>
			<meta
				name="description"
				content="Розрахуйте єдиний податок та ЄСВ для 1, 2 та 3 групи ФОП. Актуальні ставки 2026 року."
			/>
			<link rel="canonical" href="https://tax.serh.one/calculator" />

			<div className="salary-header-section animate-fadeIn">
				<h2>🧮 Калькулятор податків ФОП</h2>
				<p>
					Сучасний інструмент для швидкого та точного розрахунку єдиного податку, ПДФО, ЄСВ та військового збору для підприємців на 2026 рік.
				</p>
			</div>

			<div className="tax-calculator-grid animate-fadeIn">
				{/* ЛІВА КОЛОНКА: НАЛАШТУВАННЯ */}
				<div className="salary-inputs-card">
					<h3>⚙️ Параметри розрахунку</h3>
					<form onSubmit={handleSubmit}>
						
						{/* Сегментований вибір системи оподаткування */}
						<div className="salary-form-group">
							<label>Система оподаткування</label>
							<div className="system-selector-tabs">
								<button
									type="button"
									className={`system-tab-btn ${taxSystem === "simplified" ? "active" : ""}`}
									onClick={() => {
										setTaxSystem("simplified");
										setTaxResult(null);
									}}
								>
									<span className="tab-icon">📄</span>
									<div className="tab-info">
										<strong>Спрощена система</strong>
										<small>Єдиний податок + фіксований ЄСВ</small>
									</div>
								</button>
								<button
									type="button"
									className={`system-tab-btn ${taxSystem === "general" ? "active" : ""}`}
									onClick={() => {
										setTaxSystem("general");
										setTaxResult(null);
									}}
								>
									<span className="tab-icon">🏢</span>
									<div className="tab-info">
										<strong>Загальна система</strong>
										<small>18% ПДФО + 5% ВЗ + 22% ЄСВ з прибутку</small>
									</div>
								</button>
							</div>
						</div>

						{/* Спрощена система: Вибір групи та річного доходу */}
						{taxSystem === "simplified" && (
							<>
								<div className="salary-form-group">
									<label>Оберіть групу ФОП</label>
									<div className="group-cards-grid">
										<button
											type="button"
											className={`group-card-btn ${taxGroup === "1" ? "active" : ""}`}
											onClick={() => {
												setTaxGroup("1");
												setTaxResult(null);
											}}
										>
											<div className="group-card-header">
												<span className="group-badge">І група</span>
												<span className="group-rate">до 10% ПМ</span>
											</div>
											<div className="group-card-details">
												<span>Ліміт: {formatMoney(LIMITS["1"]).replace(",00", "")}</span>
												<small>Побутові послуги, торгівля на ринках</small>
											</div>
										</button>

										<button
											type="button"
											className={`group-card-btn ${taxGroup === "2" ? "active" : ""}`}
											onClick={() => {
												setTaxGroup("2");
												setTaxResult(null);
											}}
										>
											<div className="group-card-header">
												<span className="group-badge">ІІ група</span>
												<span className="group-rate">до 20% МЗП</span>
											</div>
											<div className="group-card-details">
												<span>Ліміт: {formatMoney(LIMITS["2"]).replace(",00", "")}</span>
												<small>Надання послуг, виробництво, ресторанна сфера</small>
											</div>
										</button>

										<button
											type="button"
											className={`group-card-btn ${taxGroup === "3" ? "active" : ""}`}
											onClick={() => {
												setTaxGroup("3");
												setTaxResult(null);
											}}
										>
											<div className="group-card-header">
												<span className="group-badge">ІІІ група</span>
												<span className="group-rate">5% від доходу</span>
											</div>
											<div className="group-card-details">
												<span>Ліміт: {formatMoney(LIMITS["3"]).replace(",00", "")}</span>
												<small>Будь-які види діяльності, сфера IT, послуги</small>
											</div>
										</button>
									</div>
								</div>

								<div className="salary-form-group">
									<label htmlFor="simplified-income">Вкажіть орієнтовний річний дохід, ₴</label>
									<input
										id="simplified-income"
										type="number"
										className="auth-input salary-num-input"
										value={income}
										onChange={(e) => {
											setIncome(e.target.value);
											setTaxResult(null);
										}}
										placeholder="Наприклад: 500000"
										onKeyDown={handleKeyDown}
										min="0"
									/>
									{taxGroup && (
										<>
											<input
												type="range"
												min="1000"
												max={LIMITS[taxGroup]}
												step="5000"
												value={parseFloat(income) > LIMITS[taxGroup] ? LIMITS[taxGroup] : (parseFloat(income) || 0)}
												onChange={(e) => {
													setIncome(e.target.value);
													setTaxResult(null);
												}}
												className="salary-slider"
											/>
											<div className="slider-labels">
												<span>1 000 ₴</span>
												<span>Ліміт ({formatMoney(LIMITS[taxGroup]).replace(",00", "")})</span>
											</div>
										</>
									)}

									{taxGroup && income && (
										<LimitIndicator
											currentIncome={parseFloat(income)}
											limit={LIMITS[taxGroup]}
										/>
									)}
								</div>
							</>
						)}

						{/* Загальна система: Доходи та витрати */}
						{taxSystem === "general" && (
							<>
								<div className="salary-form-group">
									<label htmlFor="incomeAmount">Сума річного доходу (брутто), ₴</label>
									{isMinIncomeForVat(grossIncomeAmount) && (
										<div className="salary-info-alert vat-warning">
											<strong>⚠️ ПДВ:</strong> Оскільки дохід перевищує 1 млн. грн., ви зобов’язані зареєструватися як платник ПДВ.
										</div>
									)}
									<input
										type="number"
										id="incomeAmount"
										className="auth-input salary-num-input"
										value={grossIncomeAmount}
										onChange={(e) => {
											setGrossIncomeAmount(e.target.value);
											setTaxResult(null);
										}}
										placeholder="Введіть суму доходу..."
										onKeyDown={handleKeyDown}
										min="0"
									/>
								</div>

								<div className="salary-form-group">
									<label htmlFor="expenseAmount">Сума витрат за рік, ₴</label>
									<input
										type="number"
										id="expenseAmount"
										className="auth-input salary-num-input"
										value={expenseAmount}
										onChange={(e) => {
											setExpenseAmount(e.target.value);
											setTaxResult(null);
										}}
										placeholder="Введіть суму витрат..."
										onKeyDown={handleKeyDown}
										min="0"
									/>
								</div>

								<div className="general-net-profit-card">
									<span className="net-profit-label">Річний чистий дохід (прибуток):</span>
									<strong className="net-profit-value">{formatMoney(netProfit)}</strong>
								</div>
							</>
						)}

						{/* Пільги зі сплати ЄСВ */}
						<div className="salary-form-group" style={{ marginTop: "1.5rem" }}>
							<label>Пільги зі сплати ЄСВ (звільнення за себе)</label>
							<div className="benefit-selector-grid">
								<label className={`benefit-checkbox-card ${esvBenefit === "Немає пільги" ? "checked" : ""}`}>
									<input
										type="radio"
										name="esvBenefit"
										value="Немає пільги"
										checked={esvBenefit === "Немає пільги"}
										onChange={(e) => {
											setEsvBenefit(e.target.value);
											setTaxResult(null);
										}}
									/>
									<span className="checkbox-icon">💼</span>
									<div className="checkbox-text">
										<strong>Немає пільги</strong>
										<small>Сплата на загальних підставах</small>
									</div>
								</label>

								<label className={`benefit-checkbox-card ${esvBenefit === "Пенсіонер за віком" ? "checked" : ""}`}>
									<input
										type="radio"
										name="esvBenefit"
										value="Пенсіонер за віком"
										checked={esvBenefit === "Пенсіонер за віком"}
										onChange={(e) => {
											setEsvBenefit(e.target.value);
											setTaxResult(null);
										}}
									/>
									<span className="checkbox-icon">👴</span>
									<div className="checkbox-text">
										<strong>Пенсіонер за віком</strong>
										<small>Звільнення відповідно до ч. 4 ст. 4 Закону про ЄСВ</small>
									</div>
								</label>

								<label className={`benefit-checkbox-card ${esvBenefit === "Особа з інвалідністю" ? "checked" : ""}`}>
									<input
										type="radio"
										name="esvBenefit"
										value="Особа з інвалідністю"
										checked={esvBenefit === "Особа з інвалідністю"}
										onChange={(e) => {
											setEsvBenefit(e.target.value);
											setTaxResult(null);
										}}
									/>
									<span className="checkbox-icon">♿</span>
									<div className="checkbox-text">
										<strong>Особа з інвалідністю</strong>
										<small>Звільнення від сплати ЄСВ за себе</small>
									</div>
								</label>

								<label className={`benefit-checkbox-card ${esvBenefit === "Офіційно працевлаштований" ? "checked" : ""}`}>
									<input
										type="radio"
										name="esvBenefit"
										value="Офіційно працевлаштований"
										checked={esvBenefit === "Офіційно працевлаштований"}
										onChange={(e) => {
											setEsvBenefit(e.target.value);
											setTaxResult(null);
										}}
									/>
									<span className="checkbox-icon">🏢</span>
									<div className="checkbox-text">
										<strong>Офіційно працевлаштований</strong>
										<small>За умови сплати ЄСВ роботодавцем не менше мінімуму</small>
									</div>
								</label>

								<label className={`benefit-checkbox-card ${esvBenefit === "Військовослужбовець / Мобілізований" ? "checked" : ""}`}>
									<input
										type="radio"
										name="esvBenefit"
										value="Військовослужбовець / Мобілізований"
										checked={esvBenefit === "Військовослужбовець / Мобілізований"}
										onChange={(e) => {
											setEsvBenefit(e.target.value);
											setTaxResult(null);
										}}
									/>
									<span className="checkbox-icon">🎖️</span>
									<div className="checkbox-text">
										<strong>Військовослужбовець / Мобілізований</strong>
										<small>Звільнення від сплати на період воєнного стану</small>
									</div>
								</label>
							</div>

							{esvBenefit === "Офіційно працевлаштований" && (
								<div className="salary-info-alert text-muted" style={{ marginTop: "1rem" }}>
									<strong>💡 Звільнення при працевлаштуванні:</strong> ФОП звільняються від сплати ЄСВ за себе за місяці, коли роботодавець сплатив за них внесок у розмірі <strong>не меншому за мінімальний страховий внесок</strong>. Якщо внесок роботодавця був менший (наприклад, робота на півставки), ви маєте право добровільно доплатити ЄСВ до мінімального внеску.
								</div>
							)}
						</div>

						<button type="submit" className="calculate-btn" disabled={taxSystem === "simplified" && !taxGroup} style={{ marginTop: "2rem" }}>
							Розрахувати податки 📊
						</button>
					</form>
				</div>

				{/* ПРАВА КОЛОНКА: РЕЗУЛЬТАТИ */}
				<div className="salary-results-card">
					<h3>📊 Звіт про податки та відрахування</h3>
					
					{taxResult ? (
						<div className="results-block-modern animate-fadeIn">
							<div className="salary-result-primary">
								<span className="primary-label">Всього податків до сплати за рік:</span>
								<span className="primary-value">
									{formatMoney(taxResult.yearly.total)}
								</span>
							</div>

							{/* Смуга розподілу річного доходу */}
							<div className="visual-distribution-bar">
								<div
									className="bar-segment net"
									style={{ width: `${netPercent}%` }}
									title={`Чистий прибуток: ${netPercent.toFixed(1)}%`}
								></div>
								<div
									className="bar-segment taxes"
									style={{ width: `${taxPercent}%` }}
									title={`Податки: ${taxPercent.toFixed(1)}%`}
								></div>
								<div
									className="bar-segment esv"
									style={{ width: `${esvPercent}%` }}
									title={`ЄСВ: ${esvPercent.toFixed(1)}%`}
								></div>
								<div
									className="bar-segment military"
									style={{ width: `${milPercent}%` }}
									title={`Військовий збір: ${milPercent.toFixed(1)}%`}
								></div>
							</div>
							<div className="visual-distribution-legend">
								<span className="legend-item"><span className="dot net"></span>Чистий дохід</span>
								<span className="legend-item"><span className="dot taxes"></span>Податки</span>
								<span className="legend-item"><span className="dot esv"></span>ЄСВ</span>
								<span className="legend-item"><span className="dot military"></span>Військовий збір</span>
							</div>

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
											<td>ЄСВ (соціальний внесок)</td>
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
												<td>⚠️ ЄП з перевищення (15%)</td>
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
					) : (
						<div className="results-placeholder-card">
							<div className="placeholder-icon">🧮</div>
							<h4>Готовий до розрахунку</h4>
							<p>
								Оберіть параметри діяльності та вкажіть суму річного доходу ліворуч, після чого натисніть кнопку <strong>"Розрахувати податки"</strong>.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default TaxCalculator;
