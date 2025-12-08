import {
	TAX_CONSTANTS_2025,
	CALCULATED_CONSTANTS,
	LIMITS,
} from "./taxConstants";

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
	let totalAmount = 0;

	if (system === "simplified") {
		// 1. Спочатку рахуємо перевищення ліміту (спільна логіка для 1, 2, 3 груп)
		const currentLimit = LIMITS[group]; // Беремо ліміт для поточної групи

		if (currentLimit && numIncome > currentLimit) {
			const excessAmount = numIncome - currentLimit;
			excessTax = excessAmount * TAX_CONSTANTS_2025.EXCESS_TAX_RATE; // 15%
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

			tax = incomeForBaseTax * TAX_CONSTANTS_2025.GROUP_3_TAX_RATE;
			militaryTax = numIncome * TAX_CONSTANTS_2025.MILITARY_TAX_RATE_GROUP_3;
		}
	} else if (system === "general") {
		// Логіка для загальної системи
		const numExpenses = parseFloat(expenses) || 0;
		const netProfit = numIncome - numExpenses;

		if (netProfit > 0) {
			tax = netProfit * TAX_CONSTANTS_2025.GENERAL_TAX_RATE; // 18%
			militaryTax = netProfit * TAX_CONSTANTS_2025.MILITARY_TAX_RATE_GENERAL; // 5%
		}
	}

	totalAmount = tax + esv + militaryTax + excessTax;

	return {
		taxAmount: tax,
		esvAmount: esv,
		militaryTaxAmount: militaryTax,
		excessTaxAmount: excessTax,
		totalAmount: totalAmount,
	};
}

export function isMinIncomeForVat(income) {
	return parseFloat(income) > TAX_CONSTANTS_2025.MIN_INCOME_FOR_VAT;
}
