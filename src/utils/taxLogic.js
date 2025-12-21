import { TAX_CONSTANTS, CALCULATED_CONSTANTS, LIMITS } from "./taxConstants";

export function calculateNetProfit(income, expenses) {
	const numIncome = parseFloat(income) || 0;
	const numExpenses = parseFloat(expenses) || 0;
	return numIncome - numExpenses;
}

export function calculateTaxes(system, group, income, expenses) {
	const numIncome = parseFloat(income) || 0;

	let tax = 0;
	let esv = CALCULATED_CONSTANTS.ESV;
	let militaryTax = 0;
	let excessTax = 0; // Податок з перевищення

	if (system === "simplified") {
		// 1. Спочатку рахуємо перевищення ліміту (спільна логіка для 1, 2, 3 груп)
		const currentLimit = LIMITS[group]; // Беремо ліміт для поточної групи

		if (currentLimit && numIncome > currentLimit) {
			const excessAmount = numIncome - currentLimit;
			excessTax = excessAmount * TAX_CONSTANTS.EXCESS_TAX_RATE; // 15%
		}

		// 2. Рахуємо основний податок та ВЗ залежно від групи
		if (group === "1") {
			tax = CALCULATED_CONSTANTS.GROUP_1_TAX;
			militaryTax = CALCULATED_CONSTANTS.MILITARY_TAX_FIXED;
		} else if (group === "2") {
			tax = CALCULATED_CONSTANTS.GROUP_2_TAX;
			militaryTax = CALCULATED_CONSTANTS.MILITARY_TAX_FIXED;
		} else if (group === "3") {
			// Для 3 групи податок платиться тільки в межах ліміту
			// Якщо є перевищення, то 5% береться з ліміту, а решта обкладається 15% (вже пораховано вище)
			const incomeForBaseTax = numIncome > LIMITS[3] ? LIMITS[3] : numIncome;

			tax = incomeForBaseTax * TAX_CONSTANTS.GROUP_3_TAX_RATE;
			militaryTax = numIncome * TAX_CONSTANTS.MILITARY_TAX_RATE_GROUP_3;
		}
	} else if (system === "general") {
		// Логіка для загальної системи
		const numExpenses = parseFloat(expenses) || 0;
		const netProfit = numIncome - numExpenses;

		if (netProfit > 0) {
			tax = netProfit * TAX_CONSTANTS.GENERAL_TAX_RATE; // 18%
			militaryTax = netProfit * TAX_CONSTANTS.MILITARY_TAX_RATE_GENERAL; // 5%
		}
	}

	// --- Normalization ---
	// We need to support both Monthly and Yearly views.
	// Some taxes are fixed per month (Group 1, 2), others are calculated yearly (Group 3, General).

	let monthly = {};
	let yearly = {};

	// 1. ESV (ЄСВ) - Usually minimal fixed amount per month
	monthly.esv = esv;
	yearly.esv = esv * 12;

	// 2. Main Tax (ЄП or ПДФО) & Military Tax (ВЗ)
	if (system === "simplified" && (group === "1" || group === "2")) {
		// Fixed monthly rates
		monthly.tax = tax;
		yearly.tax = tax * 12;

		monthly.military = militaryTax;
		yearly.military = militaryTax * 12;
	} else {
		// Calculated based on Yearly Income (Group 3, General)
		// We assume 'tax' and 'militaryTax' calculated above are for the YEAR (based on input income)
		yearly.tax = tax;
		monthly.tax = tax / 12;

		yearly.military = militaryTax;
		monthly.military = militaryTax / 12;
	}

	// 3. Excess Tax (Податок з перевищення) - Always yearly event
	yearly.excess = excessTax;
	monthly.excess = excessTax / 12; // Averaged for month view

	// 4. Totals
	monthly.total = monthly.tax + monthly.esv + monthly.military + monthly.excess;
	yearly.total = yearly.tax + yearly.esv + yearly.military + yearly.excess;

	return {
		monthly,
		yearly,
	};
}

export function isMinIncomeForVat(income) {
	return parseFloat(income) > TAX_CONSTANTS.MIN_INCOME_FOR_VAT;
}
