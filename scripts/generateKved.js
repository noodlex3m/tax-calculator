// scripts/generateKved.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Визначаємо __dirname для ES модулів
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. "Сирі" дані (імітація відкритого реєстру найпопулярніших ФОП)
const rawData = [
	// Торгівля (Секція G)
	{
		code: "G",
		name: "Оптова та роздрібна торгівля; ремонт автотранспортних засобів і мотоциклів",
	},
	{
		code: "47",
		name: "Роздрібна торгівля, крім торгівлі автотранспортними засобами та мотоциклами",
	},
	{ code: "47.1", name: "Роздрібна торгівля в неспеціалізованих магазинах" },
	{
		code: "47.11",
		name: "Роздрібна торгівля в неспеціалізованих магазинах переважно продуктами харчування",
	},
	{ code: "47.9", name: "Роздрібна торгівля поза магазинами" },
	{
		code: "47.91",
		name: "Роздрібна торгівля, що здійснюється фірмами поштового замовлення або через Інтернет",
	},

	// IT та зв'язок (Секція J)
	{ code: "J", name: "Інформація та телекомунікації" },
	{
		code: "62",
		name: "Комп'ютерне програмування, консультування та пов'язана з ними діяльність",
	},
	{
		code: "62.0",
		name: "Комп'ютерне програмування, консультування та пов'язана з ними діяльність",
	},
	{ code: "62.01", name: "Комп'ютерне програмування" },
	{ code: "62.02", name: "Консультування з питань інформатизації" },
	{ code: "62.03", name: "Діяльність із керування комп'ютерним устаткованням" },
	{
		code: "62.09",
		name: "Інша діяльність у сфері інформаційних технологій і комп'ютерних систем",
	},
	{ code: "63", name: "Надання інформаційних послуг" },
	{
		code: "63.1",
		name: "Оброблення даних, розміщення інформації на веб-вузлах і пов'язана з ними діяльність",
	},
	{
		code: "63.11",
		name: "Оброблення даних, розміщення інформації на веб-вузлах і пов'язана з ними діяльність",
	},

	// Професійна діяльність (Секція M)
	{ code: "M", name: "Професійна, наукова та технічна діяльність" },
	{ code: "69", name: "Діяльність у сферах права та бухгалтерського обліку" },
	{ code: "69.10", name: "Діяльність у сфері права" },
	{
		code: "69.20",
		name: "Діяльність у сфері бухгалтерського обліку й аудиту; консультування з питань оподаткування",
	},
	{ code: "73", name: "Рекламна діяльність і дослідження кон'юнктури ринку" },
	{ code: "73.11", name: "Рекламні агентства" },

	// Послуги (Секція S)
	{ code: "S", name: "Надання інших видів послуг" },
	{ code: "96", name: "Надання інших індивідуальних послуг" },
	{ code: "96.02", name: "Надання послуг перукарнями та салонами краси" },
];

// 2. Функція-трансформатор
const parseKved = (item) => {
	let type = "";
	let parent = null;

	// Визначаємо тип та батьківський рівень за довжиною коду
	if (item.code.match(/^[A-U]$/)) {
		type = "section";
	} else if (item.code.match(/^\d{2}$/)) {
		type = "division";
		if (item.code.startsWith("4")) parent = "G";
		if (item.code.startsWith("6")) parent = "J";
		if (item.code.startsWith("7")) parent = "M";
		if (item.code.startsWith("9")) parent = "S";
	} else if (item.code.match(/^\d{2}\.\d$/)) {
		type = "group";
		parent = item.code.split(".")[0];
	} else if (item.code.match(/^\d{2}\.\d{2}$/)) {
		type = "class";
		parent = item.code.slice(0, 4);
	}

	let restrictions = null;
	let allowedGroups = [2, 3]; // За замовчуванням дозволяємо 2 та 3 групам

	// Додаємо специфічні податкові обмеження (логіка бізнесу)
	if (item.code === "69.20") {
		restrictions =
			"⚠️ Для 2-ї групи дозволено лише надання послуг платникам ЄП або населенню.";
	}
	if (item.code === "69.10") {
		restrictions =
			"⚠️ Адвокатська діяльність часто вимагає переходу на 3-тю групу або Загальну систему.";
	}

	return {
		code: item.code,
		parent: parent,
		type: type,
		name: item.name,
		isGeneralTaxSystem: true,
		allowedSimplifiedGroups: allowedGroups,
		restrictions: restrictions,
	};
};

console.log("🛠 Починаємо парсинг та аналіз КВЕДів...");
const formattedData = rawData.map(parseKved);

// 3. Генерація коду для React
const outputContent = `// Цей файл згенеровано автоматично за допомогою скрипта scripts/generateKved.js
// Будь ласка, не редагуйте його вручну! Усі зміни робіть у скрипті-генераторі.

const kvedData = ${JSON.stringify(formattedData, null, 4)};

export default kvedData;
`;

// 4. Запис у файл kvedData.jsx
const outputPath = path.join(__dirname, "..", "src", "data", "kvedData.jsx");
fs.writeFileSync(outputPath, outputContent, "utf8");

console.log(`✅ Успішно згенеровано ${formattedData.length} КВЕДів!`);
console.log(`📂 Файл збережено за адресою: src/data/kvedData.jsx`);
