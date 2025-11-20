import { TAX_CONSTANTS_2025, CALCULATED_CONSTANTS } from './taxConstants';

export function calculateTaxes(system, group, income, expenses) {
  const numIncome = parseFloat(income) || 0;
  const numExpenses = parseFloat(expenses) || 0;
  
  let tax = 0;
  let esv = CALCULATED_CONSTANTS.ESV;
  let militaryTax = 0;
  let excessTax = 0;
  let totalAmount = 0;

  if (system === "simplified") {
    if (group === "3") {
      if (numIncome > CALCULATED_CONSTANTS.INCOME_LIMIT_GROUP_3) {
        const excess = numIncome - CALCULATED_CONSTANTS.INCOME_LIMIT_GROUP_3;
        excessTax = excess * TAX_CONSTANTS_2025.GROUP_3_EXCESS_TAX_RATE;
        tax = CALCULATED_CONSTANTS.INCOME_LIMIT_GROUP_3 * TAX_CONSTANTS_2025.GROUP_3_TAX_RATE;
      } else {
        tax = numIncome * TAX_CONSTANTS_2025.GROUP_3_TAX_RATE;
      }
      militaryTax = numIncome * TAX_CONSTANTS_2025.MILITARY_TAX_RATE_GROUP_3;
    } else if (group === "2") {
      tax = CALCULATED_CONSTANTS.GROUP_2_TAX;
      militaryTax = CALCULATED_CONSTANTS.MILITARY_TAX_FIXED;
    } else if (group === "1") {
      tax = CALCULATED_CONSTANTS.GROUP_1_TAX;
      militaryTax = CALCULATED_CONSTANTS.MILITARY_TAX_FIXED;
    }
  } else if (system === "general") {
    const netProfit = numIncome - numExpenses;
    if (netProfit > 0) {
      tax = netProfit * TAX_CONSTANTS_2025.GENERAL_TAX_RATE;
      militaryTax = netProfit * TAX_CONSTANTS_2025.MILITARY_TAX_RATE_GENERAL;
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

export function isIncomeOverLimit(income) {
    return parseFloat(income) > CALCULATED_CONSTANTS.INCOME_LIMIT_GROUP_3;
}

export function calculateNetProfit(income, expenses) {
    const gross = parseFloat(income) || 0;
    const exp = parseFloat(expenses) || 0;
    return gross - exp;
}
