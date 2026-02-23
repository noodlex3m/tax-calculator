# 🇺🇦 Tax.Serh.One — Калькулятор податків ФОП 2026

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Netlify Status](https://api.netlify.com/api/v1/badges/b5b5b5b5-b5b5-b5b5-b5b5-b5b5b5b5b5b5/deploy-status)

> **[UA]** Калькулятор ФОП на загальній та спрощеній (1, 2 та 3 групи) системі оподаткування. Актуальні ліміти та ставки на 2026 рік.
>
> **[EN]** Calculations for individual entrepreneurs on the general and simplified (groups 1, 2, and 3) taxation systems within Ukraine. Updated with 2026 limits and rates.

🔗 **Live Demo:** [tax.serh.one](https://tax.serh.one/)

![Tax Calculator Shortcut](https://raw.githubusercontent.com/noodlex3m/tax-calculator/main/public/screenshot.png)

---

## 🚀 Основний функціонал (Features)

Проєкт надає такі можливості:

- ✅ **Розрахунок податків 2026:**
  - Єдиний податок (ЄП), ЄСВ, Військовий збір (ВЗ).
  - Підтримка всіх груп ФОП та загальної системи.
- 📧 **Зворотний зв'язок (New):**
  - Реальна відправка повідомлень автору без серверної частини (Serverless).
  - Миттєві сповіщення про статус відправки (Toast notifications).
- ⚠️ **Система попереджень:**
  - Автоматична перевірка лімітів доходу.
  - Попередження про обов'язкову реєстрацію ПДВ.
- 📰 **Новини та законодавство:**
  - Розділ новин з пошуком та фільтрацією.
  - Імітація API запитів та Skeleton Loading для кращого UX.
- 📱 **PWA (Progressive Web App):**
  - Можливість встановлення як додаток на телефон/ПК.
  - Робота офлайн.
- 💾 **Персоналізація:**
  - Збереження історії розрахунків (LocalStorage).
  - **Темна (Dark Mode)** та Світла теми.

---

## 🛠 Технологічний стек (Tech Stack)

### Frontend

- **Framework:** React 19, Vite
- **Routing:** React Router DOM v7
- **State/UX:** React Helmet Async, React Hot Toast
- **Visuals:** Chart.js + React-Chartjs-2

### Backend & Integrations

- **Email Service:** EmailJS (відправка листів через клієнтську частину)
- **Deployment:** Netlify (CI/CD, Environment Variables)
- **PWA:** Vite PWA Plugin

### Testing

- **Unit Testing:** Vitest

---

## 💻 Як запустити проєкт (Installation)

1.  **Клонуйте репозиторій:**

    ```bash
    git clone https://github.com/noodlex3m/tax-calculator.git
    cd tax-calculator
    ```

2.  **Встановіть залежності:**

    ```bash
    npm install
    ```

3.  **Налаштуйте змінні середовища:**
    Створіть файл `.env` у корені проєкту та додайте ключі для EmailJS (отримайте їх на [emailjs.com](https://www.emailjs.com/)):

    ```env
    VITE_SERVICE_ID=your_service_id
    VITE_TEMPLATE_ID=your_template_id
    VITE_PUBLIC_KEY=your_public_key
    ```

4.  **Запустіть режим розробки:**
    ```bash
    npm run dev
    ```
    Відкрийте [http://localhost:5173](http://localhost:5173) у вашому браузері.

---

## 🔮 Плани розвитку (Future Roadmap)

Мета проєкту: Створення повноцінної платформи через інтеграцію з API податкової служби («Електронний кабінет»).

- [ ] **Система коментарів (Frontend UI):**
  - [x] відображення списку коментарів (з датою та часом)
  - [x] лайки та дизлайки (взаємовиключні)
  - [x] деревовидні відповіді на коментарі
  - [x] створення, редагування та видалення _власних_ коментарів
  - [ ] сортування (новіші / старіші / популярні)
- [ ] **Інтеграція з Базою Даних (Backend):**
  - [ ] збереження коментарів у БД (напр., Firebase або Supabase)
  - [ ] авторизація користувачів (Google / Email)
- [ ] **Модерація та Адміністрування:**
  - [ ] автоматичний фільтр заборонених слів
  - [ ] видалення будь-якого коментаря адміністратором
  - [ ] премодерація (статус "Очікує перевірки")
  - [ ] блокування (бан) порушників

- [ ] **Особистий кабінет користувача:**
  - Меню, Профіль, Налаштування
  - Моя каса (Продаж, Z-звіт, Х-звіт)
  - Управління ПРРО (Касири, Каси, Товари, Склад)
  - Календар (Податковий, РРО)

- [ ] **API відкритої частини Електронного кабінету:**
  - Реєстр платників єдиного податку
  - Реєстр платників ПДВ
- [ ] **API приватної частини:**
  - Подання звітності
  - Перегляд розрахунків з бюджетом

---

## 👤 Автор

**Serhii Trishchuk**

- GitHub: [noodlex3m](https://github.com/noodlex3m)
- Website: [serh.one](https://serh.one/)

---

This project is open-source and available under the [MIT License](LICENSE).
