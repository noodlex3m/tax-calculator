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

	// Тест 3: Загальна система (ПДФО, ВЗ та ЄСВ)
	it("правильно рахує ПДФО, Військовий збір та ЄСВ для загальної системи", () => {
		const system = "general";
		const group = "";

		// 1. Випадок з низьким прибутком (ЄСВ обмежується мінімумом)
		const resultLow = calculateTaxes(system, group, 10000, 2000);
		expect(resultLow.yearly.tax).toBe(8000 * 0.18); // 1440
		expect(resultLow.yearly.military).toBe(8000 * 0.05); // 400
		expect(resultLow.monthly.esv).toBe(CALCULATED_CONSTANTS.ESV); // 1902.34

		// 2. Випадок з дуже високим прибутком (ЄСВ обмежується максимумом)
		const resultHigh = calculateTaxes(system, group, 10000000, 0);
		expect(resultHigh.yearly.tax).toBe(1800000);
		expect(resultHigh.yearly.military).toBe(500000);
		expect(resultHigh.monthly.esv).toBe(38046.80);
		expect(resultHigh.yearly.esv).toBe(38046.80 * 12); // 456561.60

		// 3. Випадок без прибутку (ЄСВ, ПДФО та ВЗ дорівнюють 0)
		const resultZero = calculateTaxes(system, group, 1000, 2000);
		expect(resultZero.yearly.tax).toBe(0);
		expect(resultZero.yearly.military).toBe(0);
		expect(resultZero.yearly.esv).toBe(0);
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

	// Тест 6: Пільги зі сплати ЄСВ
	test("встановлює ЄСВ в 0 при наявності пільги (для спрощеної та загальної систем)", () => {
		// Спрощена система з пільгою
		const resultSimplified = calculateTaxes("simplified", "3", 50000, 0, "Пенсіонер за віком");
		expect(resultSimplified.yearly.esv).toBe(0);
		expect(resultSimplified.monthly.esv).toBe(0);

		// Загальна система з пільгою
		const resultGeneral = calculateTaxes("general", "", 100000, 10000, "Особа з інвалідністю");
		expect(resultGeneral.yearly.esv).toBe(0);
		expect(resultGeneral.monthly.esv).toBe(0);
	});
});
