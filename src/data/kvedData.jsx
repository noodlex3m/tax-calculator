// Цей файл згенеровано автоматично скриптом scripts/generateKved.js
// Джерело даних: Локальний реєстр ДК 009:2010

const kvedData = [
    {
        "code": "A",
        "parent": null,
        "type": "section",
        "name": "Сільське господарство, лісове господарство та рибне господарство",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "01",
        "parent": null,
        "type": "division",
        "name": "Сільське господарство, мисливство та надання пов'язаних із ними послуг",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "01.1",
        "parent": "01",
        "type": "group",
        "name": "Вирощування однорічних і дворічних культур",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "01.11",
        "parent": "01.1",
        "type": "class",
        "name": "Вирощування зернових культур (крім рису), бобових культур і насіння олійних культур",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "01.12",
        "parent": "01.1",
        "type": "class",
        "name": "Вирощування рису",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "G",
        "parent": null,
        "type": "section",
        "name": "Оптова та роздрібна торгівля; ремонт автотранспортних засобів і мотоциклів",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "45",
        "parent": null,
        "type": "division",
        "name": "Оптова та роздрібна торгівля автотранспортними засобами та мотоциклами, їх ремонт",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "45.20",
        "parent": "45.2",
        "type": "class",
        "name": "Технічне обслуговування та ремонт автотранспортних засобів",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "47",
        "parent": null,
        "type": "division",
        "name": "Роздрібна торгівля, крім торгівлі автотранспортними засобами та мотоциклами",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "47.1",
        "parent": "47",
        "type": "group",
        "name": "Роздрібна торгівля в неспеціалізованих магазинах",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "47.11",
        "parent": "47.1",
        "type": "class",
        "name": "Роздрібна торгівля в неспеціалізованих магазинах переважно продуктами харчування",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "47.9",
        "parent": "47",
        "type": "group",
        "name": "Роздрібна торгівля поза магазинами",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "47.91",
        "parent": "47.9",
        "type": "class",
        "name": "Роздрібна торгівля, що здійснюється фірмами поштового замовлення або через мережу Інтернет",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "J",
        "parent": null,
        "type": "section",
        "name": "Інформація та телекомунікації",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "62",
        "parent": null,
        "type": "division",
        "name": "Комп'ютерне програмування, консультування та пов'язана з ними діяльність",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "62.01",
        "parent": "62.0",
        "type": "class",
        "name": "Комп'ютерне програмування",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "62.02",
        "parent": "62.0",
        "type": "class",
        "name": "Консультування з питань інформатизації",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "62.03",
        "parent": "62.0",
        "type": "class",
        "name": "Діяльність із керування комп'ютерним устаткованням",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "63",
        "parent": null,
        "type": "division",
        "name": "Надання інформаційних послуг",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "63.11",
        "parent": "63.1",
        "type": "class",
        "name": "Оброблення даних, розміщення інформації на веб-вузлах і пов'язана з ними діяльність",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "M",
        "parent": null,
        "type": "section",
        "name": "Професійна, наукова та технічна діяльність",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "69",
        "parent": null,
        "type": "division",
        "name": "Діяльність у сферах права та бухгалтерського обліку",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "69.10",
        "parent": "69.1",
        "type": "class",
        "name": "Діяльність у сфері права",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": "⚠️ Адвокатська діяльність часто вимагає переходу на 3-тю групу або Загальну систему."
    },
    {
        "code": "69.20",
        "parent": "69.2",
        "type": "class",
        "name": "Діяльність у сфері бухгалтерського обліку й аудиту; консультування з питань оподаткування",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": "⚠️ Для 2-ї групи дозволено лише надання послуг платникам ЄП або населенню."
    },
    {
        "code": "70.22",
        "parent": "70.2",
        "type": "class",
        "name": "Консультування з питань комерційної діяльності й керування",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "73.11",
        "parent": "73.1",
        "type": "class",
        "name": "Рекламні агентства",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "S",
        "parent": null,
        "type": "section",
        "name": "Надання інших видів послуг",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "96",
        "parent": null,
        "type": "division",
        "name": "Надання інших індивідуальних послуг",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "96.02",
        "parent": "96.0",
        "type": "class",
        "name": "Надання послуг перукарнями та салонами краси",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "K",
        "parent": null,
        "type": "section",
        "name": "Фінансова та страхова діяльність",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "64",
        "parent": null,
        "type": "division",
        "name": "Надання фінансових послуг, крім страхування та пенсійного забезпечення",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [],
        "restrictions": "⛔️ Фінансове посередництво та страхування заборонені на Єдиному податку."
    },
    {
        "code": "64.19",
        "parent": "64.1",
        "type": "class",
        "name": "Інші види грошового посередництва",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [],
        "restrictions": "⛔️ Фінансове посередництво та страхування заборонені на Єдиному податку."
    },
    {
        "code": "R",
        "parent": null,
        "type": "section",
        "name": "Мистецтво, спорт, розваги та відпочинок",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [
            2,
            3
        ],
        "restrictions": null
    },
    {
        "code": "92",
        "parent": null,
        "type": "division",
        "name": "Діяльність із забезпечення азартними іграми",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [],
        "restrictions": "⛔️ Організація азартних ігор та лотерей заборонена на Єдиному податку."
    },
    {
        "code": "92.00",
        "parent": "92.0",
        "type": "class",
        "name": "Діяльність із забезпечення азартними іграми",
        "isGeneralTaxSystem": true,
        "allowedSimplifiedGroups": [],
        "restrictions": "⛔️ Організація азартних ігор та лотерей заборонена на Єдиному податку."
    }
];

export default kvedData;
