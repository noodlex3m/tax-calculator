import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Офіційне джерело (Єдиний державний веб-портал відкритих даних)
const url = "https://data.gov.ua/dataset/f8a741b9-af17-48e2-8178-8e161c244549/resource/878a36b5-31af-4c36-86e6-5dbf432e9331/download/kved.json";
const outputPath = path.resolve(__dirname, "../src/data/kvedData.jsx");

// Відомі обмеження, які ми вже прописували раніше:
const customRules = {
    "69.10": { restrictions: "⚠️ Адвокатська діяльність часто вимагає переходу на 3-тю групу або Загальну систему." },
    "69.20": { restrictions: "⚠️ Для 2-ї групи дозволено лише надання послуг платникам ЄП або населенню." },
    "64": { allowedSimplifiedGroups: [], restrictions: "⛔️ Фінансове посередництво та страхування заборонені на Єдиному податку." },
    "64.19": { allowedSimplifiedGroups: [], restrictions: "⛔️ Фінансове посередництво та страхування заборонені на Єдиному податку." },
    "92": { allowedSimplifiedGroups: [], restrictions: "⛔️ Організація азартних ігор та лотерей заборонена на Єдиному податку." },
    "92.00": { allowedSimplifiedGroups: [], restrictions: "⛔️ Організація азартних ігор та лотерей заборонена на Єдиному податку." },
    "45.11": { allowedSimplifiedGroups: [], restrictions: "⛔️ Продаж підакцизних товарів (у т.ч. легкові автомобілі) заборонено на Єдиному податку." },
};

async function run() {
    console.log("Завантаження офіційного КВЕД-2010 з data.gov.ua...");
    const res = await fetch(url);
    const rawData = await res.json();

    const formattedData = rawData.map(item => {
        // Урядові JSON файли часто мають зайві пробіли або символи \n у ключах
        const cleanItem = {};
        for (const [k, v] of Object.entries(item)) {
            cleanItem[k.trim()] = v;
        }

        let type, code, parent = null;

        if (cleanItem["Код класу"]) {
            type = "class";
            code = cleanItem["Код класу"];
            parent = cleanItem["Код групи"];
        } else if (cleanItem["Код групи"]) {
            type = "group";
            code = cleanItem["Код групи"];
            parent = cleanItem["Код розділу"];
        } else if (cleanItem["Код розділу"]) {
            type = "division";
            code = cleanItem["Код розділу"];
            parent = cleanItem["Код секції"];
        } else if (cleanItem["Код секції"]) {
            type = "section";
            code = cleanItem["Код секції"];
            parent = null;
        }

        // Застосовуємо правила податків
        let allowedSimplifiedGroups = [2, 3];
        let restrictions = null;

        if (customRules[code]) {
            if (customRules[code].allowedSimplifiedGroups !== undefined) {
                allowedSimplifiedGroups = customRules[code].allowedSimplifiedGroups;
            }
            if (customRules[code].restrictions !== undefined) {
                restrictions = customRules[code].restrictions;
            }
        }

        // Додаткове глобальне правило: Секція K (Фінансова діяльність) заборонена для ЄП
        if (cleanItem["Код секції"] === "K" && !customRules[code]) {
            restrictions = "⛔️ Фінансове посередництво та страхування заборонені на Єдиному податку.";
            allowedSimplifiedGroups = [];
        }

        return {
            code,
            parent,
            type,
            name: cleanItem["Назва"],
            isGeneralTaxSystem: true,
            allowedSimplifiedGroups,
            restrictions
        };
    });

    const fileContent = `// Цей файл згенеровано автоматично скриптом scripts/generateKvedFromGov.js
// Джерело: Офіційний портал відкритих даних (data.gov.ua)
// Містить повний класифікатор ДК 009:2010 (${formattedData.length} елементів)

const kvedData = ${JSON.stringify(formattedData, null, 4)};

export default kvedData;
`;

    fs.writeFileSync(outputPath, fileContent, "utf-8");
    console.log(`Успішно згенеровано ${formattedData.length} КВЕДів у файлі ${outputPath}`);
}

run().catch(console.error);
