import React, { useState, useEffect } from "react";
import { TAX_CONSTANTS } from "../utils/taxConstants";
import { toast } from "react-hot-toast";
import "./SalaryCalculator.css";

const SalaryCalculator = ({ embedded = false, defaultEmployees = 0 }) => {
	const [salaryInput, setSalaryInput] = useState("20000");
	const [isHandicap, setIsHandicap] = useState(false);
	const [useTaxCredit, setUseTaxCredit] = useState(false);
	const [isMainJob, setIsMainJob] = useState(true);
	const [employeesCount, setEmployeesCount] = useState(defaultEmployees || 1);

	// Sync with props if they change
	useEffect(() => {
		if (defaultEmployees > 0) {
			setEmployeesCount(defaultEmployees);
		}
	}, [defaultEmployees]);

	// Constants
	const MIN_SALARY = TAX_CONSTANTS.MIN_SALARY; // 8647
	const LIVING_WAGE = TAX_CONSTANTS.LIVING_WAGE; // 3328
	const TAX_CREDIT_LIMIT = 4660; // Граничний дохід для ПСП
	const TAX_CREDIT_AMOUNT = 1664; // Розмір базової ПСП (50% від ПМ)
	const PIT_RATE = TAX_CONSTANTS.GENERAL_TAX_RATE; // 18%
	const MILITARY_RATE = TAX_CONSTANTS.EMPLOYEE_MILITARY_TAX_RATE; // 5%
	const ESV_RATE = TAX_CONSTANTS.ESV_RATE; // 22%
	const HANDICAP_ESV_RATE = 0.0841; // 8.41%

	// Parse numeric value safely
	const grossSalary = Math.max(0, parseFloat(salaryInput) || 0);

	// Auto-toggle tax credit eligibility warning
	useEffect(() => {
		if (grossSalary > TAX_CREDIT_LIMIT && useTaxCredit) {
			setUseTaxCredit(false);
			toast.error(`ПСП застосовується лише при зарплаті до ${TAX_CREDIT_LIMIT} ₴!`);
		}
	}, [grossSalary, useTaxCredit]);

	// Payroll calculations
	const appliedTaxCredit = (useTaxCredit && grossSalary <= TAX_CREDIT_LIMIT) ? TAX_CREDIT_AMOUNT : 0;
	const pitBasis = Math.max(0, grossSalary - appliedTaxCredit);
	const pitAmount = pitBasis * PIT_RATE;
	const militaryAmount = grossSalary * MILITARY_RATE;
	const netSalary = grossSalary - pitAmount - militaryAmount;

	// ESV calculation (considering minimum contribution rule for main job)
	const currentEsvRate = isHandicap ? HANDICAP_ESV_RATE : ESV_RATE;
	let esvAmount = grossSalary * currentEsvRate;

	// Minimum insurance contribution rule (doesn't apply to disabled workers or non-main jobs)
	const isMinEsvApplied = isMainJob && !isHandicap && grossSalary > 0 && grossSalary < MIN_SALARY;
	if (isMinEsvApplied) {
		esvAmount = MIN_SALARY * ESV_RATE; // 1902.34 UAH
	}

	const totalEmployerCost = grossSalary + esvAmount;

	// Multiplication for multiple employees
	const totalGross = grossSalary * employeesCount;
	const totalPit = pitAmount * employeesCount;
	const totalMilitary = militaryAmount * employeesCount;
	const totalNet = netSalary * employeesCount;
	const totalEsv = esvAmount * employeesCount;
	const totalCost = totalEmployerCost * employeesCount;

	// Calculating UI percentage distribution for SVG visual bar
	const totalBreakdownCost = Math.max(1, totalEmployerCost);
	const netPercent = (netSalary / totalBreakdownCost) * 100;
	const taxPercent = ((pitAmount + militaryAmount) / totalBreakdownCost) * 100;
	const esvPercent = (esvAmount / totalBreakdownCost) * 100;

	return (
		<div className={`salary-calculator-wrapper ${embedded ? "embedded" : "animate-fadeIn"}`}>
			{!embedded && (
				<div className="salary-header-section">
					<h2>💼 Розрахунок заробітної плати та податків</h2>
					<p>
						Зручний помічник для розрахунку чистих виплат працівникам, ПДФО, військового збору
						та нарахування ЄСВ згідно з податковими нормами України на 2026 рік.
					</p>
				</div>
			)}

			<div className="salary-calculator-grid">
				{/* INPUTS COLUMN */}
				<div className="salary-inputs-card">
					<h3>⚙️ Параметри нарахування</h3>

					{/* Employees Count if embedded or FOP has multiple */}
					<div className="salary-form-group">
						<label htmlFor="employees-count">Кількість найманих працівників</label>
						<div className="employees-counter">
							<button
								type="button"
								onClick={() => setEmployeesCount(prev => Math.max(1, prev - 1))}
								className="counter-btn"
							>
								➖
							</button>
							<input
								id="employees-count"
								type="number"
								min="1"
								value={employeesCount}
								onChange={(e) => setEmployeesCount(Math.max(1, parseInt(e.target.value) || 1))}
								className="counter-input"
							/>
							<button
								type="button"
								onClick={() => setEmployeesCount(prev => prev + 1)}
								className="counter-btn"
							>
								➕
							</button>
						</div>
					</div>

					<div className="salary-form-group">
						<label htmlFor="gross-salary-input">
							Нарахований оклад (брудною зарплатою), ₴
						</label>
						<input
							id="gross-salary-input"
							type="number"
							className="auth-input salary-num-input"
							value={salaryInput}
							onChange={(e) => setSalaryInput(e.target.value)}
							placeholder="Введіть суму окладу..."
							min="0"
						/>
						<input
							type="range"
							min={MIN_SALARY}
							max="100000"
							step="500"
							value={grossSalary > 100000 ? 100000 : Math.max(MIN_SALARY, grossSalary)}
							onChange={(e) => setSalaryInput(e.target.value)}
							className="salary-slider"
						/>
						<div className="slider-labels">
							<span>МЗП ({MIN_SALARY} ₴)</span>
							<span>100 000 ₴</span>
						</div>
					</div>

					<div className="salary-checkbox-grid">
						<label className={`salary-checkbox-card ${isMainJob ? "checked" : ""}`}>
							<input
								type="checkbox"
								checked={isMainJob}
								onChange={(e) => setIsMainJob(e.target.checked)}
							/>
							<span className="checkbox-icon">🏢</span>
							<div className="checkbox-text">
								<strong>Основне місце роботи</strong>
								<small>Застосовується вимога сплати ЄСВ не менше мінімального внеску</small>
							</div>
						</label>

						<label className={`salary-checkbox-card ${isHandicap ? "checked" : ""}`}>
							<input
								type="checkbox"
								checked={isHandicap}
								onChange={(e) => setIsHandicap(e.target.checked)}
							/>
							<span className="checkbox-icon">♿</span>
							<div className="checkbox-text">
								<strong>Працівник має інвалідність</strong>
								<small>Ставка нарахування ЄСВ знижується до пільгових {HANDICAP_ESV_RATE * 100}%</small>
							</div>
						</label>

						<label
							className={`salary-checkbox-card ${useTaxCredit ? "checked" : ""} ${
								grossSalary > TAX_CREDIT_LIMIT ? "disabled" : ""
							}`}
						>
							<input
								type="checkbox"
								checked={useTaxCredit}
								disabled={grossSalary > TAX_CREDIT_LIMIT}
								onChange={(e) => setUseTaxCredit(e.target.checked)}
							/>
							<span className="checkbox-icon">🏷️</span>
							<div className="checkbox-text">
								<strong>Застосувати ПСП</strong>
								<small>
									Знижує базу оподаткування ПДФО на {TAX_CREDIT_AMOUNT} ₴ (доступно до {TAX_CREDIT_LIMIT} ₴)
								</small>
							</div>
						</label>
					</div>

					{isMinEsvApplied && (
						<div className="salary-info-alert">
							<strong>💡 Мінімальна гарантія ЄСВ:</strong> Оскільки оклад менший за мінімальну
							зарплату ({MIN_SALARY} ₴) за основним місцем роботи, ЄСВ нараховується на рівні
							мінімального страхового внеску: <strong>{MIN_SALARY} ₴ × {ESV_RATE * 100}% = {(MIN_SALARY * ESV_RATE).toFixed(2)} ₴</strong>.
						</div>
					)}
				</div>

				{/* RESULTS COLUMN */}
				<div className="salary-results-card">
					<h3>📊 Розрахунок витрат {employeesCount > 1 && `(загалом за ${employeesCount} ос.)`}</h3>

					<div className="salary-result-primary">
						<span className="primary-label">Всього витрат роботодавця:</span>
						<span className="primary-value">
							{totalCost.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴
						</span>
					</div>

					{/* Visual Distribution Bar */}
					<div className="visual-distribution-bar">
						<div
							className="bar-segment net"
							style={{ width: `${netPercent}%` }}
							title={`Виплата працівнику: ${netPercent.toFixed(1)}%`}
						></div>
						<div
							className="bar-segment taxes"
							style={{ width: `${taxPercent}%` }}
							title={`Податки із зарплати: ${taxPercent.toFixed(1)}%`}
						></div>
						<div
							className="bar-segment esv"
							style={{ width: `${esvPercent}%` }}
							title={`Нарахування ЄСВ: ${esvPercent.toFixed(1)}%`}
						></div>
					</div>
					<div className="visual-distribution-legend">
						<span className="legend-item"><span className="dot net"></span>На руки</span>
						<span className="legend-item"><span className="dot taxes"></span>Податки із ЗП</span>
						<span className="legend-item"><span className="dot esv"></span>ЄСВ роботодавця</span>
					</div>

					{/* DETAILED GRID */}
					<div className="salary-details-grid">
						<div className="details-section">
							<h4>📥 Виплати працівнику:</h4>
							<div className="details-row">
								<span>Нарахований оклад (Брудно):</span>
								<strong>
									{totalGross.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴
								</strong>
							</div>
							<div className="details-row tax-deduction">
								<span>Утримано ПДФО (18%):</span>
								<span>
									- {totalPit.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴
								</span>
							</div>
							<div className="details-row tax-deduction">
								<span>Утримано Військовий збір (5%):</span>
								<span>
									- {totalMilitary.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴
								</span>
							</div>
							<div className="details-row highlight">
								<span>Виплата «на руки» (Чисто):</span>
								<strong>
									{totalNet.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴
								</strong>
							</div>
						</div>

						<div className="details-section">
							<h4>🏢 Нарахування на фонд оплати праці:</h4>
							<div className="details-row">
								<span>
									ЄСВ роботодавця ({currentEsvRate * 100}%):
									{isMinEsvApplied && <small className="alert-badge">мін. внесок</small>}
								</span>
								<strong>
									+ {totalEsv.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴
								</strong>
							</div>
						</div>

						<div className="details-section total-tax-burden">
							<div className="details-row">
								<span>Сукупне податкове навантаження:</span>
								<strong>
									{((totalPit + totalMilitary + totalEsv) / (totalGross || 1) * 100).toFixed(1)}%
								</strong>
							</div>
							<div className="details-row">
								<span>Всього податків до бюджету:</span>
								<strong>
									{(totalPit + totalMilitary + totalEsv).toLocaleString("uk-UA", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}{" "}
									₴
								</strong>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SalaryCalculator;
