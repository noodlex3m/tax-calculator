// scripts/generateKved.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Посилання на відкритий JSON-файл КВЕДів на GitHub
// (Один із багатьох публічних архівів відкритих даних України)
const DATA_URL =
	"https://raw.githubusercontent.com/BohdanBila/kved-json/master/kved.json";

const parseKved = (item) => {
	// У різних базах ключі можуть відрізнятися, тому робимо універсальну перевірку
	const code = item.code || item.classCode || item.id || "";
	const name = item.name || item.className || item.title || "";

	let type = "";
	let parent = null;

	// Визначаємо рівень вкладеності за форматом коду
	if (code.match(/^[A-U]$/)) {
		type = "section";
	} else if (code.match(/^\d{2}$/)) {
		type = "division";
	} else if (code.match(/^\d{2}\.\d$/)) {
		type = "group";
		parent = code.split(".")[0];
	} else if (code.match(/^\d{2}\.\d{2}$/)) {
		type = "class";
		parent = code.slice(0, 4);
	}

	let restrictions = null;
	let allowedGroups = [2, 3]; // За замовчуванням дозволяємо 2 та 3 групам

	// --- БІЗНЕС-ЛОГІКА (ПОДАТКОВІ ОБМЕЖЕННЯ) ---
	if (code === "69.20") {
		restrictions =
			"⚠️ Для 2-ї групи дозволено лише надання послуг платникам ЄП або населенню.";
	}
	if (code === "69.10") {
		restrictions =
			"⚠️ Адвокатська діяльність часто вимагає переходу на 3-тю групу або Загальну систему.";
	}

	// Блокуємо фінансове посередництво та страхування (розділи 64, 65, 66)
	if (code.startsWith("64") || code.startsWith("65") || code.startsWith("66")) {
		allowedGroups = [];
		restrictions =
			"⛔️ Фінансове посередництво та страхування заборонені на Єдиному податку.";
	}

	// Блокуємо азартні ігри (розділ 92)
	if (code.startsWith("92")) {
		allowedGroups = [];
		restrictions =
			"⛔️ Організація азартних ігор та лотерей заборонена на Єдиному податку.";
	}

	return {
		code,
		parent,
		type,
		name,
		isGeneralTaxSystem: true,
		allowedSimplifiedGroups: allowedGroups,
		restrictions,
	};
};

const run = async () => {
	try {
		console.log(
			"⏳ Читаємо дані з локального архіву (src/data/rawKveds.json)...",
		);

		const inputPath = path.join(__dirname, "..", "src", "data", "rawKveds.json");
		const fileText = fs.readFileSync(inputPath, "utf-8");
		const dataArray = JSON.parse(fileText);

		console.log(
			`📥 Отримано ${dataArray.length} сирих записів. Аналізуємо та додаємо податкові правила...`,
		);

		// Фільтруємо і трансформуємо
		const formattedData = dataArray
			.filter((item) => item.code || item.classCode || item.id) // Відкидаємо пусті рядки
			.map(parseKved);

		// Генеруємо вміст файлу
		const outputContent = `// Цей файл згенеровано автоматично скриптом scripts/generateKved.js
// Джерело даних: Локальний архів (реплікація ДК 009:2010)

const kvedData = ${JSON.stringify(formattedData, null, 4)};

export default kvedData;
`;

		const outputPath = path.join(
			__dirname,
			"..",
			"src",
			"data",
			"kvedData.jsx",
		);
		fs.writeFileSync(outputPath, outputContent, "utf8");

		console.log(
			`✅ Магія відбулася! Успішно збережено ${formattedData.length} структурованих КВЕДів у src/data/kvedData.jsx`,
		);
	} catch (error) {
		console.error(
			"❌ Сталася помилка під час виконання скрипта:",
			error.message,
		);
	}
};

run();
