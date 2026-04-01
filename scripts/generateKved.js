// scripts/generateKved.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseKved = (item) => {
	const code = item.code || "";
	const name = item.name || "";

	let type = "";
	let parent = null;

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
	let allowedGroups = [2, 3];

	// --- БІЗНЕС-ЛОГІКА ---
	if (code === "69.20") {
		restrictions =
			"⚠️ Для 2-ї групи дозволено лише надання послуг платникам ЄП або населенню.";
	}
	if (code === "69.10") {
		restrictions =
			"⚠️ Адвокатська діяльність часто вимагає переходу на 3-тю групу або Загальну систему.";
	}
	if (code.startsWith("64") || code.startsWith("65") || code.startsWith("66")) {
		allowedGroups = [];
		restrictions =
			"⛔️ Фінансове посередництво та страхування заборонені на Єдиному податку.";
	}
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

const run = () => {
	try {
		console.log("⏳ Читаємо локальний файл kved_raw.json...");

		// Шлях до нашого локального файлу-джерела
		const rawPath = path.join(__dirname, "kved_raw.json");
		const rawData = JSON.parse(fs.readFileSync(rawPath, "utf8"));

		console.log(`📥 Отримано ${rawData.length} сирих записів. Аналізуємо...`);

		const formattedData = rawData.map(parseKved);

		const outputContent = `// Цей файл згенеровано автоматично скриптом scripts/generateKved.js
// Джерело даних: Локальний реєстр ДК 009:2010

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
			`✅ Магія відбулася! Успішно збережено ${formattedData.length} КВЕДів у src/data/kvedData.jsx`,
		);
	} catch (error) {
		console.error(
			"❌ Сталася помилка під час виконання скрипта:",
			error.message,
		);
	}
};

run();
