import { describe, it, test, expect } from "vitest";
import { calculateNetProfit, calculateTaxes } from "./taxLogic";
import { LIMITS, CALCULATED_CONSTANTS } from "./taxConstants";

describe("Калькулятор податків (taxLogic)", () => {
	// Тест 1: Чистий прибуток
	it("правильно рахує чистий прибуток (Дохід - Витрати)", () => {
		const income = 1000;
		const expenses = 400;
		const result = calculateNetProfit(income, expenses);
		expect(result).toBe(600);
	});

	// Тест 2: 3 група (стандарт)
	it("правильно рахує 5% для 3 групи (без перевищення)", () => {
		const system = "simplified";
		const group = "3";
		const income = 10000;
		const expenses = 0;
		const result = calculateTaxes(system, group, income, expenses);
		expect(result.yearly.tax).toBe(500);
	});

	// Тест 3: Загальна система
	it("правильно рахує 18% для загальної системи (Дохід - Витрати)", () => {
		const system = "general";
		const group = "";
		const income = 10000;
		const expenses = 2000;
		const result = calculateTaxes(system, group, income, expenses);
		expect(result.yearly.tax).toBe(1440);
	});

	// Тест 4: 3 група (перевищення)
	it("правильно рахує податок при перевищенні ліміту (3 група)", () => {
		const limit = LIMITS["3"];
		const excessAmount = 100; // 100 грн понад ліміт
		const income = limit + excessAmount;

		const result = calculateTaxes("simplified", "3", income, 0);

		// Перевіряємо повну суму: (Ліміт * 5%) + (Перевищення * 15%)
		expect(result.yearly.tax + result.yearly.excess).toBe(
			limit * 0.05 + excessAmount * 0.15,
		);
	});
	test("правильно рахує фіксований податок для 2 групи", () => {
		const result = calculateTaxes("simplified", "2", 5000, 0);
		expect(result.monthly.tax).toBe(CALCULATED_CONSTANTS.GROUP_2_TAX);
	});
});
