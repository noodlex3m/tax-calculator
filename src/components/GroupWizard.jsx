import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { TAX_CONSTANTS } from "../utils/taxConstants";
import { toast } from "react-hot-toast";
import "./GroupWizard.css";

const GroupWizard = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [isSaving, setIsSaving] = useState(false);

	const [answers, setAnswers] = useState({
		clients: "",
		activityType: "",
		employeeCount: "",
		expectedIncome: "",
		rentalLimits: "",
	});

	const totalSteps = answers.activityType === "rental_large" ? 5 : 4;

	const handleSelectOption = (field, value) => {
		setAnswers((prev) => {
			const updated = { ...prev, [field]: value };
			// Reset rental limits if they switch away from rental activity
			if (field === "activityType" && value !== "rental_large") {
				updated.rentalLimits = "";
			}
			return updated;
		});
	};

	const handleNext = () => {
		if (currentStep === 1 && !answers.clients) return;
		if (currentStep === 2 && !answers.activityType) return;
		if (currentStep === 3 && !answers.employeeCount) return;
		if (currentStep === 4 && answers.activityType === "rental_large" && !answers.rentalLimits) {
			setCurrentStep(5);
			return;
		}
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1);
		} else {
			setCurrentStep(totalSteps + 1); // Triggers results page
		}
	};

	const handlePrev = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleRestart = () => {
		setAnswers({
			clients: "",
			activityType: "",
			employeeCount: "",
			expectedIncome: "",
			rentalLimits: "",
		});
		setCurrentStep(1);
	};

	// Розрахунок результату на основі ПКУ
	const evaluateRecommendedGroup = () => {
		const reasons = [];
		const disqualified = {
			group1: false,
			group2: false,
			group3: false,
			general: false,
		};

		// 1. Перевірка на заборонені ПКУ види діяльності
		if (answers.activityType === "prohibited") {
			disqualified.group1 = true;
			disqualified.group2 = true;
			disqualified.group3 = true;
			reasons.push(
				"Спрощена система заборонена для обраного виду діяльності (підакцизні товари, паливо, ювелірка, видобуток копалин, фінпосередництво тощо) відповідно до ст. 291 ПКУ.",
			);
			return { group: "Загальна система", reasons, disqualified };
		}

		// 2. Перевірка лімітів оренди нерухомості (форма 20-ОПП та ст. 291)
		if (
			answers.activityType === "rental_large" &&
			answers.rentalLimits === "exceeds_limits"
		) {
			disqualified.group1 = true;
			disqualified.group2 = true;
			disqualified.group3 = true;
			reasons.push(
				"Здача нерухомості в оренду перевищує дозволені норми для спрощеної системи (понад 400 кв.м житлової або понад 900 кв.м комерційної площі).",
			);
			return { group: "Загальна система", reasons, disqualified };
		}

		// 3. Перевірка річного ліміту доходу
		if (answers.expectedIncome === "over_10_09") {
			disqualified.group1 = true;
			disqualified.group2 = true;
			disqualified.group3 = true;
			reasons.push(
				"Очікуваний річний дохід перевищує максимальний ліміт спрощеної системи у 2026 році (1167 МЗП ≈ 10.09 млн грн).",
			);
			return { group: "Загальна система", reasons, disqualified };
		}

		// 4. Перевірка ліміту доходу за групами ФОП
		if (answers.expectedIncome === "under_10_09") {
			disqualified.group1 = true;
			disqualified.group2 = true;
			reasons.push(
				"Дохід перевищує ліміти для 1-ї групи (1.44 млн грн) та 2-ї групи (7.21 млн грн), тому дозволена лише 3-тя група.",
			);
		} else if (answers.expectedIncome === "under_7_21") {
			disqualified.group1 = true;
			reasons.push(
				"Дохід перевищує річний ліміт для 1-ї групи (1.44 млн грн), але повністю вкладається у ліміт 2-ї групи.",
			);
		}

		// 5. Перевірка за найманими працівниками
		if (answers.employeeCount === "unlimited") {
			disqualified.group1 = true;
			disqualified.group2 = true;
			reasons.push(
				"Наявність понад 10 найманих працівників заборонена на 1-й та 2-й групах.",
			);
		} else if (answers.employeeCount === "up_to_10") {
			disqualified.group1 = true;
			reasons.push("Наймання працівників повністю заборонено для ФОП 1-ї групи.");
		}

		// 6. Валідація за категоріями клієнтів (ст. 291 ПКУ)
		if (
			answers.clients === "general_businesses" ||
			answers.clients === "foreign" ||
			answers.clients === "all"
		) {
			if (
				answers.activityType === "it_freelance" ||
				answers.activityType === "rental_large"
			) {
				disqualified.group1 = true;
				disqualified.group2 = true;
				reasons.push(
					"ФОП 2-ї групи заборонено надавати послуги (включаючи IT, консалтинг, оренду) іноземним компаніям (експорт послуг/ЗЕД) або українським компаніям на загальній системі оподаткування.",
				);
			}
		}

		// 7. Валідація за видом діяльності
		if (answers.activityType === "trade_catering") {
			disqualified.group1 = true;
			reasons.push(
				"Інтернет-торгівля, магазини та громадське харчування заборонені на 1-й групі (дозволено лише торгівлю на ринках).",
			);
		} else if (answers.activityType === "it_freelance") {
			disqualified.group1 = true;
			reasons.push(
				"ІТ-послуги, фріланс, маркетинг та консалтинг не входять до переліку побутових послуг 1-ї групи.",
			);
		} else if (answers.activityType === "rental_large") {
			disqualified.group1 = true;
			reasons.push("Оренда нерухомості повністю заборонена на 1-й групі.");
		}

		// Вибір оптимальної дозволеної групи
		if (!disqualified.group1) {
			return { group: "1 група", reasons, disqualified };
		} else if (!disqualified.group2) {
			return { group: "2 група", reasons, disqualified };
		} else if (!disqualified.group3) {
			return { group: "3 група", reasons, disqualified };
		} else {
			return { group: "Загальна система", reasons, disqualified };
		}
	};

	const evaluation = evaluateRecommendedGroup();

	// Перехід до калькулятора з пресетом групи
	const handleGoToCalculator = () => {
		const groupParam =
			evaluation.group === "1 група"
				? "1"
				: evaluation.group === "2 група"
					? "2"
					: evaluation.group === "3 група"
						? "3"
						: "general";
		navigate(`/calculator?group=${groupParam}`);
	};

	// Збереження в облікову картку авторизованого користувача
	const handleSaveToProfile = async () => {
		if (!user) return;
		setIsSaving(true);
		try {
			const docRef = doc(db, "userProfiles", user.uid);
			const taxSystem =
				evaluation.group === "Загальна система"
					? "Загальна система"
					: "Спрощена система";
			const taxGroup =
				evaluation.group === "Загальна система"
					? "Загальна система / Не застосовується"
					: evaluation.group;
			const taxRate =
				evaluation.group === "1 група" || evaluation.group === "2 група"
					? "Фіксована ставка"
					: evaluation.group === "3 група"
						? "5% (без ПДВ)"
						: "Не застосовується";

			let employees = 0;
			if (answers.employeeCount === "up_to_10") employees = 5;
			if (answers.employeeCount === "unlimited") employees = 15;

			const updatePayload = {
				taxSystem,
				taxGroup,
				taxRate,
				employeesCount: employees,
				isVatPayer: "Ні",
				updatedAt: new Date().toISOString(),
			};

			await setDoc(docRef, updatePayload, { merge: true });
			toast.success("Рекомендовані податкові параметри збережено у ваш Кабінет! 💾");
			navigate("/dashboard");
		} catch (error) {
			console.error("Помилка збереження результату в картку:", error);
			toast.error("Не вдалося зберегти налаштування.");
		} finally {
			setIsSaving(false);
		}
	};

	const getStepProgress = () => {
		return Math.min(100, Math.round(((currentStep - 1) / totalSteps) * 100));
	};

	return (
		<div className="wizard-container animate-fadeIn">
			{currentStep <= totalSteps ? (
				<div className="wizard-card">
					{/* Progress Indicator */}
					<div className="wizard-progress-bar-container">
						<div
							className="wizard-progress-fill"
							style={{ width: `${getStepProgress()}%` }}
						></div>
					</div>
					<div className="wizard-step-header">
						<span className="wizard-step-badge">
							Крок {currentStep} з {totalSteps}
						</span>
						<h2>🧭 Гід з вибору групи ФОП</h2>
						<p>
							Дайте відповіді на кілька простих запитань для підбору оптимальної
							системи оподаткування.
						</p>
					</div>

					{/* STEP 1: CLIENTS */}
					{currentStep === 1 && (
						<div className="wizard-step-content">
							<h3>Хто ваші майбутні клієнти та замовники?</h3>
							<div className="wizard-options-grid">
								<button
									type="button"
									onClick={() => handleSelectOption("clients", "population")}
									className={`wizard-option-card ${
										answers.clients === "population" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">👥</span>
									<span className="option-title">Виключно населення</span>
									<span className="option-desc">
										Продаж товарів або надання побутових послуг звичайним громадянам
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("clients", "simplified_fops")}
									className={`wizard-option-card ${
										answers.clients === "simplified_fops" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🏢</span>
									<span className="option-title">ФОП та фірми на єдиному податку</span>
									<span className="option-desc">
										Співпраця з іншими українськими підприємцями на спрощеній системі
									</span>
								</button>
								<button
									type="button"
									onClick={() =>
										handleSelectOption("clients", "general_businesses")
									}
									className={`wizard-option-card ${
										answers.clients === "general_businesses" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🏭</span>
									<span className="option-title">Компанії на загальній системі</span>
									<span className="option-desc">
										Надання послуг великим українським підприємствам на ПДВ чи ПДФО
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("clients", "foreign")}
									className={`wizard-option-card ${
										answers.clients === "foreign" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🌍</span>
									<span className="option-title">Іноземні клієнти (Експорт/ЗЕД)</span>
									<span className="option-desc">
										Робота на міжнародному ринку (наприклад, IT-експорт, Upwork, App Store)
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("clients", "all")}
									className={`wizard-option-card ${
										answers.clients === "all" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🔄</span>
									<span className="option-title">Усі категорії без обмежень</span>
									<span className="option-desc">
										Планується максимальна робота з усіма контрагентами та ЗЕД
									</span>
								</button>
							</div>
						</div>
					)}

					{/* STEP 2: ACTIVITY TYPE */}
					{currentStep === 2 && (
						<div className="wizard-step-content">
							<h3>Який основний вид бізнесу ви плануєте вести?</h3>
							<div className="wizard-options-grid">
								<button
									type="button"
									onClick={() => handleSelectOption("activityType", "retail_market")}
									className={`wizard-option-card ${
										answers.activityType === "retail_market" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🎪</span>
									<span className="option-title">Ринки або побутпослуги</span>
									<span className="option-desc">
										Роздрібна торгівля з лотків на ринках або особисте надання побутових послуг
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("activityType", "trade_catering")}
									className={`wizard-option-card ${
										answers.activityType === "trade_catering" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🛒</span>
									<span className="option-title">Торгівля, громадське харчування</span>
									<span className="option-desc">
										Магазини, кав'ярні, ресторани, виробництво товарів або інтернет-торгівля
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("activityType", "it_freelance")}
									className={`wizard-option-card ${
										answers.activityType === "it_freelance" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">💻</span>
									<span className="option-title">IT, фріланс, консалтинг</span>
									<span className="option-desc">
										Розробка ПЗ, тестування, дизайн, маркетинг, копірайтинг або консультації
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("activityType", "rental_large")}
									className={`wizard-option-card ${
										answers.activityType === "rental_large" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🔑</span>
									<span className="option-title">Оренда нерухомості</span>
									<span className="option-desc">
										Здача в оренду комерційних площ, складів, квартир чи іншої нерухомості
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("activityType", "prohibited")}
									className={`wizard-option-card ${
										answers.activityType === "prohibited" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🚫</span>
									<span className="option-title">Специфічна комерція</span>
									<span className="option-desc">
										Продаж алкоголю/тютюну, пального, ювелірних виробів або обмін валют
									</span>
								</button>
							</div>
						</div>
					)}

					{/* STEP 3: EMPLOYEES */}
					{currentStep === 3 && (
						<div className="wizard-step-content">
							<h3>Чи плануєте ви наймати найманих працівників?</h3>
							<div className="wizard-options-grid">
								<button
									type="button"
									onClick={() => handleSelectOption("employeeCount", "none")}
									className={`wizard-option-card ${
										answers.employeeCount === "none" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">👤</span>
									<span className="option-title">Працюватиму самостійно</span>
									<span className="option-desc">
										Жодного найманого працівника в штаті (0 осіб)
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("employeeCount", "up_to_10")}
									className={`wizard-option-card ${
										answers.employeeCount === "up_to_10" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">👨‍👩‍👧‍👦</span>
									<span className="option-title">Команда до 10 працівників</span>
									<span className="option-desc">
										Маленький штат (наприклад, офіціанти в кафе чи продавці в магазинах)
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("employeeCount", "unlimited")}
									className={`wizard-option-card ${
										answers.employeeCount === "unlimited" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🚀</span>
									<span className="option-title">Понад 10 найманих працівників</span>
									<span className="option-desc">
										Планується великий бізнес без законодавчих обмежень щодо штату
									</span>
								</button>
							</div>
						</div>
					)}

					{/* STEP 4: EXPECTED INCOME */}
					{currentStep === 4 && answers.activityType !== "rental_large" && (
						<div className="wizard-step-content">
							<h3>Який очікуваний річний дохід вашого бізнесу?</h3>
							<div className="wizard-options-grid">
								<button
									type="button"
									onClick={() => handleSelectOption("expectedIncome", "under_1_44")}
									className={`wizard-option-card ${
										answers.expectedIncome === "under_1_44" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🪙</span>
									<span className="option-title">До 1.44 млн грн</span>
									<span className="option-desc">
										Малий бізнес (до 167 мінімальних зарплат на 2026 рік)
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("expectedIncome", "under_7_21")}
									className={`wizard-option-card ${
										answers.expectedIncome === "under_7_21" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">💵</span>
									<span className="option-title">До 7.21 млн грн</span>
									<span className="option-desc">
										Середній бізнес (до 834 мінімальних зарплат на 2026 рік)
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("expectedIncome", "under_10_09")}
									className={`wizard-option-card ${
										answers.expectedIncome === "under_10_09" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">💰</span>
									<span className="option-title">До 10.09 млн грн</span>
									<span className="option-desc">
										Динамічний бізнес (до 1167 мінімальних зарплат на 2026 рік)
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("expectedIncome", "over_10_09")}
									className={`wizard-option-card ${
										answers.expectedIncome === "over_10_09" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">💎</span>
									<span className="option-title">Понад 10.09 млн грн</span>
									<span className="option-desc">
										Великі обороти без обмежень єдиного податку
									</span>
								</button>
							</div>
						</div>
					)}

					{/* STEP 4 & 5 RENTAL SPECIFIC FLOW */}
					{currentStep === 4 && answers.activityType === "rental_large" && (
						<div className="wizard-step-content">
							<h3>Які загальні площі нерухомості плануєте здавати в оренду?</h3>
							<div className="wizard-options-grid">
								<button
									type="button"
									onClick={() => handleSelectOption("rentalLimits", "within_limits")}
									className={`wizard-option-card ${
										answers.rentalLimits === "within_limits" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🏢</span>
									<span className="option-title">В межах норми ПКУ</span>
									<span className="option-desc">
										Житлова площа до 400 кв.м та некомерційні площі до 900 кв.м
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("rentalLimits", "exceeds_limits")}
									className={`wizard-option-card ${
										answers.rentalLimits === "exceeds_limits" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🏗️</span>
									<span className="option-title">Перевищує ліміти оренди</span>
									<span className="option-desc">
										Понад 400 кв.м житлової або понад 900 кв.м комерційної/складської нерухомості
									</span>
								</button>
							</div>
						</div>
					)}

					{currentStep === 5 && answers.activityType === "rental_large" && (
						<div className="wizard-step-content">
							<h3>Який очікуваний річний дохід вашого бізнесу?</h3>
							<div className="wizard-options-grid">
								<button
									type="button"
									onClick={() => handleSelectOption("expectedIncome", "under_1_44")}
									className={`wizard-option-card ${
										answers.expectedIncome === "under_1_44" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">🪙</span>
									<span className="option-title">До 1.44 млн грн</span>
									<span className="option-desc">
										Малий бізнес (до 167 мінімальних зарплат на 2026 рік)
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("expectedIncome", "under_7_21")}
									className={`wizard-option-card ${
										answers.expectedIncome === "under_7_21" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">💵</span>
									<span className="option-title">До 7.21 млн грн</span>
									<span className="option-desc">
										Середній бізнес (до 834 мінімальних зарплат на 2026 рік)
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("expectedIncome", "under_10_09")}
									className={`wizard-option-card ${
										answers.expectedIncome === "under_10_09" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">💰</span>
									<span className="option-title">До 10.09 млн грн</span>
									<span className="option-desc">
										Динамічний бізнес (до 1167 мінімальних зарплат на 2026 рік)
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleSelectOption("expectedIncome", "over_10_09")}
									className={`wizard-option-card ${
										answers.expectedIncome === "over_10_09" ? "selected" : ""
									}`}
								>
									<span className="option-emoji">💎</span>
									<span className="option-title">Понад 10.09 млн грн</span>
									<span className="option-desc">
										Великі обороти без обмежень єдиного податку
									</span>
								</button>
							</div>
						</div>
					)}

					{/* Actions Footer */}
					<div className="wizard-footer-actions">
						<button
							type="button"
							className="wizard-back-btn"
							onClick={handlePrev}
							disabled={currentStep === 1}
						>
							⬅️ Назад
						</button>
						<button
							type="button"
							className="wizard-next-btn"
							onClick={handleNext}
							disabled={
								(currentStep === 1 && !answers.clients) ||
								(currentStep === 2 && !answers.activityType) ||
								(currentStep === 3 && !answers.employeeCount) ||
								(currentStep === 4 &&
									answers.activityType === "rental_large" &&
									!answers.rentalLimits) ||
								(currentStep === 4 &&
									answers.activityType !== "rental_large" &&
									!answers.expectedIncome) ||
								(currentStep === 5 && !answers.expectedIncome)
							}
						>
							{currentStep === totalSteps ? "📊 Отримати результат" : "Далі ➡️"}
						</button>
					</div>
				</div>
			) : (
				/* RESULTS SCREEN */
				<div className="wizard-results-card">
					<div className="results-badge">💡 Результат підбору ФОП</div>
					<h2>Рекомендована система:</h2>
					<div className="recommended-group-box animate-fadeIn">
						<span className="result-system-name">
							{evaluation.group === "Загальна система"
								? "Загальна система оподаткування"
								: `Спрощена система: ФОП ${evaluation.group}`}
						</span>
						<p className="result-main-desc">
							{evaluation.group === "1 група" &&
								"Найкраще підходить для індивідуальної торгівлі на ринках та надання дрібних побутових послуг особисто."}
							{evaluation.group === "2 група" &&
								"Оптимальна група для виробництва, торгівлі в магазинах чи інтернеті, кав'ярень, а також надання послуг іншим спрощенцям та населенню."}
							{evaluation.group === "3 група" &&
								"Універсальна преміум-група. Ідеально підходить для ІТ-сфери, фрілансу, експорту послуг за кордон (ЗЕД) та співпраці з будь-якими контрагентами."}
							{evaluation.group === "Загальна система" &&
								"Класична система. Необхідна у випадку перевищення оборотів у 10 млн грн, великої оренди або ведення видів діяльності, які повністю заборонені на єдиному податку."}
						</p>
					</div>

					{/* LEGAL REASONS */}
					{evaluation.reasons.length > 0 && (
						<div className="results-reasons-section">
							<h3>⚖️ Аналіз та відповідність нормам ПКУ:</h3>
							<ul className="reasons-bullet-list">
								{evaluation.reasons.map((r, idx) => (
									<li key={idx} className="reason-bullet-item">
										<span className="reason-icon">ℹ️</span>
										<span className="reason-text">{r}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* TAXES ESTIMATION 2026 */}
					<div className="results-taxes-box">
						<h3>💰 Щомісячні податкові зобов'язання (на 2026 рік):</h3>
						<div className="taxes-grid">
							{evaluation.group === "1 група" && (
								<>
									<div className="tax-grid-row">
										<span>Єдиний податок (10% ПМ):</span>
										<strong>{TAX_CONSTANTS.LIVING_WAGE * 0.1} ₴/міс</strong>
									</div>
									<div className="tax-grid-row">
										<span>ЄСВ (22% від МЗП):</span>
										<strong>{(TAX_CONSTANTS.MIN_SALARY * 0.22).toFixed(2)} ₴/міс</strong>
									</div>
									<div className="tax-grid-row">
										<span>Військовий збір (10% від МЗП):</span>
										<strong>{(TAX_CONSTANTS.MIN_SALARY * 0.1).toFixed(2)} ₴/міс</strong>
									</div>
								</>
							)}
							{evaluation.group === "2 група" && (
								<>
									<div className="tax-grid-row">
										<span>Єдиний податок (20% МЗП):</span>
										<strong>{TAX_CONSTANTS.MIN_SALARY * 0.2} ₴/міс</strong>
									</div>
									<div className="tax-grid-row">
										<span>ЄСВ (22% від МЗП):</span>
										<strong>{(TAX_CONSTANTS.MIN_SALARY * 0.22).toFixed(2)} ₴/міс</strong>
									</div>
									<div className="tax-grid-row">
										<span>Військовий збір (10% від МЗП):</span>
										<strong>{(TAX_CONSTANTS.MIN_SALARY * 0.1).toFixed(2)} ₴/міс</strong>
									</div>
								</>
							)}
							{evaluation.group === "3 група" && (
								<>
									<div className="tax-grid-row">
										<span>Єдиний податок:</span>
										<strong>5% від отриманого доходу</strong>
									</div>
									<div className="tax-grid-row">
										<span>ЄСВ (22% від МЗП):</span>
										<strong>{(TAX_CONSTANTS.MIN_SALARY * 0.22).toFixed(2)} ₴/міс</strong>
									</div>
									<div className="tax-grid-row">
										<span>Військовий збір:</span>
										<strong>1% від отриманого доходу</strong>
									</div>
								</>
							)}
							{evaluation.group === "Загальна система" && (
								<>
									<div className="tax-grid-row">
										<span>ПДФО (податок на доходи):</span>
										<strong>18% від чистого прибутку</strong>
									</div>
									<div className="tax-grid-row">
										<span>Військовий збір (ВЗ):</span>
										<strong>5% від чистого прибутку</strong>
									</div>
									<div className="tax-grid-row">
										<span>ЄСВ (22%):</span>
										<strong>22% від чистого прибутку (мін. {(TAX_CONSTANTS.MIN_SALARY * 0.22).toFixed(2)} ₴)</strong>
									</div>
								</>
							)}
						</div>
						<small className="taxes-footnote">
							* Зверніть увагу: на період воєнного стану сплата ЄСВ за себе є добровільною, але для нарахування страхового стажу рекомендується здійснювати щомісячні платежі.
						</small>
					</div>

					{/* ACTIONS FOOTER */}
					<div className="results-actions-container">
						<button
							type="button"
							className="wizard-restart-btn"
							onClick={handleRestart}
						>
							🔄 Пройти тест заново
						</button>
						<div className="results-main-action-buttons">
							<button
								type="button"
								className="wizard-calc-preset-btn"
								onClick={handleGoToCalculator}
							>
								🧮 Розрахувати дохід на калькуляторі
							</button>
							{user && (
								<button
									type="button"
									className="wizard-save-profile-btn"
									disabled={isSaving}
									onClick={handleSaveToProfile}
								>
									{isSaving ? "Збереження..." : "💾 Записати в картку ФОП"}
								</button>
							)}
						</div>
					</div>

					{/* DISCLAIMER BOX */}
					<div className="auth-warning" style={{ marginTop: "2rem" }}>
						<strong>⚠️ Важливе застереження (Disclaimer)</strong>
						<p style={{ marginTop: "0.5rem", marginBottom: 0, fontSize: "0.9rem" }}>
							Цей помічник створено виключно для інформаційних та навчальних цілей на
							основі норм Податкового кодексу України (ПКУ) станом на 2026 рік. Податкове
							законодавство постійно змінюється, а державні органи можуть давати
							індивідуальні роз'яснення. Перед остаточним обранням та реєстрацією групи ФОП
							рекомендуємо проконсультуватися з фаховим бухгалтером або звернутися за
							офіційним роз'ясненням до вашої ДПС.
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default GroupWizard;
