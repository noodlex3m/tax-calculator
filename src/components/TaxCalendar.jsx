import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { TAX_CONSTANTS } from "../utils/taxConstants";
import { toast } from "react-hot-toast";
import "./TaxCalendar.css";

const TaxCalendar = ({ embedded = false, defaultProfile = null }) => {
	const { user } = useAuth();
	
	// Tax configuration states
	const [taxSystem, setTaxSystem] = useState("Спрощена система");
	const [taxGroup, setTaxGroup] = useState("3 группа");
	const [isVatPayer, setIsVatPayer] = useState(false);
	const [hasEsvBenefit, setHasEsvBenefit] = useState(false);
	const [hasEmployees, setHasEmployees] = useState(false);
	
	// Completed deadlines tracking state
	const [completedDeadlines, setCompletedDeadlines] = useState([]);
	const [isSaving, setIsSaving] = useState(false);
	const [activeMonthFilter, setActiveMonthFilter] = useState("all");

	// Pre-populate if embedded or defaultProfile is provided
	useEffect(() => {
		const applyProfileData = (profile) => {
			if (!profile) return;
			setTaxSystem(profile.taxSystem || "Спрощена система");
			
			// Handle legacy or specific taxGroup names
			const group = profile.taxGroup || "3 група";
			if (group.includes("1")) setTaxGroup("1 група");
			else if (group.includes("2")) setTaxGroup("2 група");
			else if (group.includes("3")) setTaxGroup("3 група");
			else setTaxGroup("Загальна система");

			setIsVatPayer(profile.isVatPayer === "Так" || !!profile.isVatPayer && profile.isVatPayer !== "Ні");
			setHasEsvBenefit(profile.esvBenefit && profile.esvBenefit !== "Немає пільги");
			setHasEmployees(Number(profile.employeesCount) > 0);

			if (profile.completedDeadlines) {
				setCompletedDeadlines(profile.completedDeadlines);
			}
		};

		if (defaultProfile) {
			applyProfileData(defaultProfile);
		} else if (user) {
			// Fetch profile directly from database if logged in and not passed as prop
			const fetchProfile = async () => {
				try {
					const docRef = doc(db, "userProfiles", user.uid);
					const docSnap = await getDoc(docRef);
					if (docSnap.exists()) {
						applyProfileData(docSnap.data());
					}
				} catch (error) {
					console.error("Помилка завантаження профілю для календаря:", error);
				}
			};
			fetchProfile();
		}
	}, [user, defaultProfile]);

	// Fetch completed deadlines from local storage for guests
	useEffect(() => {
		if (!user) {
			const saved = localStorage.getItem("tax_completed_deadlines");
			if (saved) {
				try {
					setCompletedDeadlines(JSON.parse(saved));
				} catch (e) {
					console.error(e);
				}
			}
		}
	}, [user]);

	// Reactive constraint check for simplified system dropdowns
	useEffect(() => {
		if (taxSystem === "Загальна система") {
			setTaxGroup("Загальна система");
		} else if (taxSystem === "Спрощена система" && taxGroup === "Загальна система") {
			setTaxGroup("3 група");
		}
	}, [taxSystem, taxGroup]);

	// Completing a deadline helper
	const toggleDeadline = async (deadlineId) => {
		const updated = completedDeadlines.includes(deadlineId)
			? completedDeadlines.filter(id => id !== deadlineId)
			: [...completedDeadlines, deadlineId];
		
		setCompletedDeadlines(updated);

		if (user) {
			setIsSaving(true);
			try {
				const docRef = doc(db, "userProfiles", user.uid);
				await setDoc(docRef, { completedDeadlines: updated }, { merge: true });
				toast.success("Статус дедлайну синхронізовано у вашому кабінеті! 💾");
			} catch (error) {
				console.error("Не вдалося зберегти позначку дедлайну:", error);
				toast.error("Не вдалося зберегти статус дедлайну.");
			} finally {
				setIsSaving(false);
			}
		} else {
			localStorage.setItem("tax_completed_deadlines", JSON.stringify(updated));
			toast.success("Статус дедлайну збережено локально! 💻");
		}
	};

	// 2026 Tax calendar deadlines database
	const getDeadlinesList = () => {
		const list = [];
		const minEsvText = (TAX_CONSTANTS.MIN_SALARY * 0.22).toFixed(2);
		
		// 1. MONTHLY DEADLINES FOR EMPLOYEES (Salary Taxes)
		if (hasEmployees) {
			const months = [
				{ name: "Січень", num: 1 },
				{ name: "Лютий", num: 2 },
				{ name: "Березень", num: 3 },
				{ name: "Квітень", num: 4 },
				{ name: "Травень", num: 5 },
				{ name: "Червень", num: 6 },
				{ name: "Липень", num: 7 },
				{ name: "Серпень", num: 8 },
				{ name: "Вересень", num: 9 },
				{ name: "Жовтень", num: 10 },
				{ name: "Листопад", num: 11 },
				{ name: "Грудень", num: 12 },
			];
			months.forEach(m => {
				list.push({
					id: `2026-${m.num}-salary-taxes`,
					month: m.num,
					day: 30, // Сплата податків із зарплати до 30 числа місяця
					dateStr: `30 ${m.name.toLowerCase()} 2026`,
					type: "payment",
					title: `Сплата податків за найманих працівників (${m.name})`,
					desc: `Обов'язкова сплата ПДФО (18%), Військового збору (5%) та нарахувань ЄСВ (22%) з виплачених зарплат за попередній місяць.`,
					category: "salary"
				});
			});
		}

		// 2. MONTHLY DEADLINES FOR VAT (VAT Declaration and Payment)
		if (isVatPayer) {
			const months = [
				{ name: "Січень", num: 1, prevName: "Грудень 2025" },
				{ name: "Лютий", num: 2, prevName: "Січень" },
				{ name: "Березень", num: 3, prevName: "Лютий" },
				{ name: "Квітень", num: 4, prevName: "Березень" },
				{ name: "Травень", num: 5, prevName: "Квітень" },
				{ name: "Червень", num: 6, prevName: "Травень" },
				{ name: "Липень", num: 7, prevName: "Червень" },
				{ name: "Серпень", num: 8, prevName: "Липень" },
				{ name: "Вересень", num: 9, prevName: "Серпень" },
				{ name: "Жовтень", num: 10, prevName: "Вересень" },
				{ name: "Листопад", num: 11, prevName: "Жовтень" },
				{ name: "Грудень", num: 12, prevName: "Листопад" },
			];
			months.forEach(m => {
				list.push({
					id: `2026-${m.num}-vat-decl`,
					month: m.num,
					day: 20,
					dateStr: `20 ${m.name.toLowerCase()} 2026`,
					type: "report",
					title: `Подання декларації з ПДВ за ${m.prevName}`,
					desc: `Обов'язкова щомісячна декларація з ПДВ для зареєстрованих платників податку.`,
					category: "vat"
				});
				list.push({
					id: `2026-${m.num}-vat-pay`,
					month: m.num,
					day: 30,
					dateStr: `30 ${m.name.toLowerCase()} 2026`,
					type: "payment",
					title: `Сплата податку на додану вартість (ПДВ) за ${m.prevName}`,
					desc: `Остаточний розрахунок та сплата ПДВ за підсумками попереднього звітного місяця.`,
					category: "vat"
				});
			});
		}

		// 3. GROUP 1 & 2 MONTHLY SINGLE TAX (Єдиний податок)
		if (taxSystem === "Спрощена система" && (taxGroup === "1 група" || taxGroup === "2 група")) {
			const epRateText = taxGroup === "1 група" ? "302.80 ₴" : "1729.40 ₴"; // 10% ПМ / 20% МЗП
			const months = [
				{ name: "Січень", num: 1 },
				{ name: "Лютий", num: 2 },
				{ name: "Березень", num: 3 },
				{ name: "Квітень", num: 4 },
				{ name: "Травень", num: 5 },
				{ name: "Червень", num: 6 },
				{ name: "Липень", num: 7 },
				{ name: "Серпень", num: 8 },
				{ name: "Вересень", num: 9 },
				{ name: "Жовтень", num: 10 },
				{ name: "Листопад", num: 11 },
				{ name: "Грудень", num: 12 },
			];
			months.forEach(m => {
				list.push({
					id: `2026-${m.num}-single-tax`,
					month: m.num,
					day: 20,
					dateStr: `20 ${m.name.toLowerCase()} 2026`,
					type: "payment",
					title: `Сплата єдиного податку за ${m.name} (${taxGroup})`,
					desc: `Авансовий платіж з єдиного податку за поточний місяць. Фіксована ставка для вашої групи: ${epRateText} (а також військовий збір 10% від МЗП = 864.70 ₴/міс).`,
					category: "single_tax"
				});
			});

			// Annual Declaration for Group 1 & 2
			list.push({
				id: `2026-annual-decl-g12`,
				month: 3,
				day: 1,
				dateStr: `01 березня 2026`,
				type: "report",
				title: `Річна декларація платника Єдиного податку за 2025 рік`,
				desc: `Подання річного звіту про отримані доходи на спрощеній системі (1 або 2 група) за минулий 2025 рік.`,
				category: "single_tax"
			});
		}

		// 4. QUARTERLY SINGLE TAX FOR GROUP 3 (Єдиний податок 3 група)
		if (taxSystem === "Спрощена система" && taxGroup === "3 група") {
			// Q1
			list.push({
				id: `2026-q1-ep-decl`,
				month: 5,
				day: 11,
				dateStr: `11 травня 2026`,
				type: "report",
				title: `Подання декларації платника Єдиного податку за I квартал`,
				desc: `Подання щоквартальної декларації про доходи ФОП 3-ї групи за січень-березень 2026 року.`,
				category: "single_tax"
			});
			list.push({
				id: `2026-q1-ep-pay`,
				month: 5,
				day: 20,
				dateStr: `20 травня 2026`,
				type: "payment",
				title: `Сплата Єдиного податку та ВЗ (1%) за I квартал`,
				desc: `Сплата єдиного податку (5% або 3% з ПДВ) та 1% військового збору від квартального доходу.`,
				category: "single_tax"
			});
			// Q2
			list.push({
				id: `2026-q2-ep-decl`,
				month: 8,
				day: 10,
				dateStr: `10 серпня 2026`,
				type: "report",
				title: `Подання декларації платника Єдиного податку за II квартал (Півріччя)`,
				desc: `Подання квартальної декларації з єдиного податку за півріччя 2026 року.`,
				category: "single_tax"
			});
			list.push({
				id: `2026-q2-ep-pay`,
				month: 8,
				day: 19,
				dateStr: `19 серпня 2026`,
				type: "payment",
				title: `Сплата Єдиного податку та ВЗ (1%) за II квартал`,
				desc: `Розрахунок та сплата податків (ЄП та 1% ВЗ) за підсумками другого кварталу.`,
				category: "single_tax"
			});
			// Q3
			list.push({
				id: `2026-q3-ep-decl`,
				month: 11,
				day: 9,
				dateStr: `09 листопада 2026`,
				type: "report",
				title: `Подання декларації платника Єдиного податку за III квартал (9 місяців)`,
				desc: `Подання декларації про доходи за наростаючим підсумком за 9 місяців 2026 року.`,
				category: "single_tax"
			});
			list.push({
				id: `2026-q3-ep-pay`,
				month: 11,
				day: 19,
				dateStr: `19 листопада 2026`,
				type: "payment",
				title: `Сплата Єдиного податку та ВЗ (1%) за III квартал`,
				desc: `Сплата податків (ЄП та 1% ВЗ) за підсумками третього кварталу.`,
				category: "single_tax"
			});
			// Q4 / Annual (due early 2027)
			list.push({
				id: `2026-q4-ep-decl`,
				month: 2,
				day: 9,
				dateStr: `09 лютого 2027 (прогноз)`,
				type: "report",
				title: `Річна декларація платника Єдиного податку за IV квартал / 2026 рік`,
				desc: `Подання фінальної річної декларації з єдиного податку за весь 2026 рік.`,
				category: "single_tax"
			});
			list.push({
				id: `2026-q4-ep-pay`,
				month: 2,
				day: 19,
				dateStr: `19 лютого 2027 (прогноз)`,
				type: "payment",
				title: `Сплата Єдиного податку та ВЗ (1%) за IV квартал`,
				desc: `Остаточна сплата податків за підсумками четвертого кварталу року.`,
				category: "single_tax"
			});
		}

		// 5. QUARTERLY UNIFIED SOCIAL CONTRIBUTION (ЄСВ за себе - для всіх крім пільговиків)
		if (!hasEsvBenefit) {
			list.push({
				id: `2026-q1-esv`,
				month: 4,
				day: 19,
				dateStr: `19 квітня 2026`,
				type: "payment",
				title: `Сплата ЄСВ за себе за I квартал`,
				desc: `Обов'язковий платіж з соціального внеску. Сума: 3 місяці × ${minEsvText} ₴ = ${(TAX_CONSTANTS.MIN_SALARY * 0.22 * 3).toFixed(2)} ₴.`,
				category: "esv"
			});
			list.push({
				id: `2026-q2-esv`,
				month: 7,
				day: 20,
				dateStr: `20 липня 2026`,
				type: "payment",
				title: `Сплата ЄСВ за себе за II квартал`,
				desc: `Обов'язковий платіж з соціального внеску за другий квартал. Сума: ${(TAX_CONSTANTS.MIN_SALARY * 0.22 * 3).toFixed(2)} ₴.`,
				category: "esv"
			});
			list.push({
				id: `2026-q3-esv`,
				month: 10,
				day: 19,
				dateStr: `19 жовтня 2026`,
				type: "payment",
				title: `Сплата ЄСВ за себе за III квартал`,
				desc: `Обов'язковий платіж з соціального внеску за третій квартал. Сума: ${(TAX_CONSTANTS.MIN_SALARY * 0.22 * 3).toFixed(2)} ₴.`,
				category: "esv"
			});
			list.push({
				id: `2026-q4-esv`,
				month: 1,
				day: 19,
				dateStr: `19 січня 2027 (прогноз)`,
				type: "payment",
				title: `Сплата ЄСВ за себе за IV квартал`,
				desc: `Остаточна сплата соціального внеску за четвертий квартал. Сума: ${(TAX_CONSTANTS.MIN_SALARY * 0.22 * 3).toFixed(2)} ₴.`,
				category: "esv"
			});
		}

		// 6. QUARTERLY UNIFIED REPORT FOR EMPLOYEES (Об'єднана звітність)
		if (hasEmployees) {
			list.push({
				id: `2026-q1-salary-report`,
				month: 5,
				day: 11,
				dateStr: `11 травня 2026`,
				type: "report",
				title: `Подання Об'єднаного звіту з ПДФО та ЄСВ за I квартал`,
				desc: `Подання щоквартального податкового розрахунку сум доходу, нарахованого (сплаченого) на користь платників податків — фізичних осіб за перші 3 місяці року.`,
				category: "salary"
			});
			list.push({
				id: `2026-q2-salary-report`,
				month: 8,
				day: 10,
				dateStr: `10 серпня 2026`,
				type: "report",
				title: `Подання Об'єднаного звіту з ПДФО та ЄСВ за II квартал`,
				desc: `Подання щоквартальної об'єднаної звітності за другий квартал року.`,
				category: "salary"
			});
			list.push({
				id: `2026-q3-salary-report`,
				month: 11,
				day: 9,
				dateStr: `09 листопада 2026`,
				type: "report",
				title: `Подання Об'єднаного звіту з ПДФО та ЄСВ за III квартал`,
				desc: `Подання щоквартальної об'єднаної звітності за третій квартал року.`,
				category: "salary"
			});
			list.push({
				id: `2026-q4-salary-report`,
				month: 2,
				day: 9,
				dateStr: `09 лютого 2027 (прогноз)`,
				type: "report",
				title: `Подання Об'єднаного звіту з ПДФО та ЄСВ за IV квартал`,
				desc: `Подання об'єднаного квартального звіту з ПДФО/ЄСВ за четвертий квартал року.`,
				category: "salary"
			});
		}

		// 7. GENERAL SYSTEM SPECIFIC DEADLINES
		if (taxSystem === "Загальна система") {
			// Advance payments PIT
			list.push({
				id: `2026-general-pit-adv1`,
				month: 4,
				day: 20,
				dateStr: `20 квітня 2026`,
				type: "payment",
				title: `Сплата авансового платежу з ПДФО за I квартал`,
				desc: `Авансовий внесок з ПДФО (18%) від фактично отриманого прибутку за січень-березень.`,
				category: "general_tax"
			});
			list.push({
				id: `2026-general-pit-adv2`,
				month: 7,
				day: 20,
				dateStr: `20 липня 2026`,
				type: "payment",
				title: `Сплата авансового платежу з ПДФО за II квартал`,
				desc: `Авансовий платіж з ПДФО (18%) від фактичного прибутку за другий квартал.`,
				category: "general_tax"
			});
			list.push({
				id: `2026-general-pit-adv3`,
				month: 10,
				day: 20,
				dateStr: `20 жовтня 2026`,
				type: "payment",
				title: `Сплата авансового платежу з ПДФО за III квартал`,
				desc: `Авансовий платіж з ПДФО (18%) від фактичного прибутку за третій квартал.`,
				category: "general_tax"
			});

			// Annual Income Declaration
			list.push({
				id: `2026-general-annual-decl`,
				month: 5,
				day: 1,
				dateStr: `01 травня 2026`,
				type: "report",
				title: `Подання Декларації про майновий стан і доходи за 2025 рік`,
				desc: `Річна звітність для ФОП на загальній системі про всі отримані чисті прибутки за попередній звітний рік.`,
				category: "general_tax"
			});
		}

		// Sorting list by month then by day
		return list.sort((a, b) => {
			if (a.month !== b.month) return a.month - b.month;
			return a.day - b.day;
		});
	};

	const allDeadlines = getDeadlinesList();
	const filteredDeadlines = activeMonthFilter === "all"
		? allDeadlines
		: allDeadlines.filter(d => d.month === parseInt(activeMonthFilter));

	const monthsNames = [
		{ name: "Всі місяці", val: "all" },
		{ name: "Січень", val: "1" },
		{ name: "Лютий", val: "2" },
		{ name: "Березень", val: "3" },
		{ name: "Квітень", val: "4" },
		{ name: "Травень", val: "5" },
		{ name: "Червень", val: "6" },
		{ name: "Липень", val: "7" },
		{ name: "Серпень", val: "8" },
		{ name: "Вересень", val: "9" },
		{ name: "Жовтень", val: "10" },
		{ name: "Листопад", val: "11" },
		{ name: "Грудень", val: "12" },
	];

	return (
		<div className={`tax-calendar-wrapper ${embedded ? "embedded" : "animate-fadeIn"}`}>
			{!embedded && (
				<div className="calendar-header-section">
					<h2>📅 Персональний податковий календар на 2026 рік</h2>
					<p>
						Дізнайтеся всі важливі дедлайни щодо подання податкової звітності та сплати обов'язкових
						платежів для вашого бізнесу із можливістю відзначати виконані завдання.
					</p>
				</div>
			)}

			{/* CONFIGURATION BAR FOR GUESTS / PREVIEW */}
			<div className="calendar-config-bar">
				<div className="config-grid">
					<div className="form-group">
						<label>Система оподаткування</label>
						<select
							className="auth-input select-input"
							value={taxSystem}
							onChange={(e) => setTaxSystem(e.target.value)}
						>
							<option value="Спрощена система">Спрощена система</option>
							<option value="Загальна система">Загальна система</option>
						</select>
					</div>

					{taxSystem === "Спрощена система" && (
						<div className="form-group">
							<label>Група платника</label>
							<select
								className="auth-input select-input"
								value={taxGroup}
								onChange={(e) => setTaxGroup(e.target.value)}
							>
								<option value="1 група">1 група</option>
								<option value="2 група">2 група</option>
								<option value="3 група">3 група</option>
							</select>
						</div>
					)}

					<div className="form-group checkbox-toggles">
						<label className="toggle-label">
							<input
								type="checkbox"
								checked={isVatPayer}
								onChange={(e) => setIsVatPayer(e.target.checked)}
							/>
							<span>Платник ПДВ</span>
						</label>
						<label className="toggle-label">
							<input
								type="checkbox"
								checked={hasEsvBenefit}
								onChange={(e) => setHasEsvBenefit(e.target.checked)}
							/>
							<span>Пільга з ЄСВ</span>
						</label>
						<label className="toggle-label">
							<input
								type="checkbox"
								checked={hasEmployees}
								onChange={(e) => setHasEmployees(e.target.checked)}
							/>
							<span>Наймані працівники</span>
						</label>
					</div>
				</div>
			</div>

			{/* MONTHS FILTERS */}
			<div className="month-filters-container">
				{monthsNames.map(m => (
					<button
						key={m.val}
						type="button"
						className={`month-filter-btn ${activeMonthFilter === m.val ? "active" : ""}`}
						onClick={() => setActiveMonthFilter(m.val)}
					>
						{m.name}
					</button>
				))}
			</div>

			{/* TIMELINE LIST */}
			<div className="timeline-container">
				{filteredDeadlines.length === 0 ? (
					<div className="empty-state">
						<p>Подій або дедлайнів за обраний період немає 🏖️</p>
					</div>
				) : (
					<div className="timeline-list">
						{filteredDeadlines.map((item) => {
							const isCompleted = completedDeadlines.includes(item.id);
							return (
								<div
									key={item.id}
									className={`timeline-card ${item.type} ${isCompleted ? "completed" : ""}`}
								>
									<div className="timeline-badge-column">
										<span className={`type-badge ${item.type}`}>
											{item.type === "payment" ? "💵 Сплата" : "📋 Звіт"}
										</span>
										<span className="deadline-date-number">{item.day}</span>
										<span className="deadline-month-text">
											{monthsNames.find(m => m.val === String(item.month))?.name.substring(0, 3)}
										</span>
									</div>

									<div className="timeline-content-column">
										<div className="timeline-content-header">
											<h4>{item.title}</h4>
											<span className="date-badge">{item.dateStr}</span>
										</div>
										<p>{item.desc}</p>
										<div className="timeline-card-actions">
											<button
												type="button"
												className={`complete-toggle-btn ${isCompleted ? "completed" : ""}`}
												onClick={() => toggleDeadline(item.id)}
												disabled={isSaving}
											>
												{isCompleted ? "✅ Сплачено / Подано" : "🔔 Позначити як виконано"}
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default TaxCalendar;
