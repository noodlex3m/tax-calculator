import { useState } from "react";
import "./FeedbackForm.css";

const FeedbackForm = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		userType: "",
		topicOfTheAppeal: "",
		message: "",
	});

	const [errorData, setErrorData] = useState({
		name: "",
		email: "",
		userType: "",
		topicOfTheAppeal: "",
		message: "",
	});

	const newErrors = {};

	const validateForm = () => {
		if (!formData.name.trim()) {
			newErrors.name = "Ім'я є обов'язковим";
		}
		if (!formData.email.trim()) {
			newErrors.email = "Email є обов'язковим";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Введіть коректний Email";
		}
		if (!formData.userType) {
			newErrors.userType = "Тип користувача є обов'язковим";
		}
		if (!formData.topicOfTheAppeal) {
			newErrors.topicOfTheAppeal = "Тема звернення є обов'язковою";
		}
		if (!formData.message.trim()) {
			newErrors.message = "Повідомлення є обов'язковим";
		}
		setErrorData(newErrors);
		return newErrors;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const errors = validateForm();
		if (Object.keys(errors).length > 0) {
			setErrorData(errors);
			return;
		}
		console.log("Form Data Submitted:", formData);
		// Очищення форми після успішної відправки (імітація)
		setFormData({
			name: "",
			email: "",
			userType: "",
			topicOfTheAppeal: "",
			message: "",
		});
		alert("Дякуємо! Ваше повідомлення відправлено (demo).");
	};
	return (
		<div className="feedback-form">
			<div
				style={{
					backgroundColor: "rgba(255, 193, 7, 0.1)",
					border: "1px solid #ffc107",
					color: "#ffc107",
					padding: "1rem",
					borderRadius: "8px",
					marginBottom: "1.5rem",
					textAlign: "center",
				}}
			>
				🛠️ <strong>Увага!</strong> Ця форма знаходиться в розробці. Функціонал
				відправки повідомлень поки що не активний.
			</div>
			<form action="" onSubmit={handleSubmit}>
				<label htmlFor="name">Ім'я</label>
				<input
					type="text"
					id="name"
					name="name"
					value={formData.name}
					onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					className={errorData.name ? "error-border" : ""}
				/>
				{errorData.name && <p className="error">{errorData.name}</p>}
				<label htmlFor="email">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					value={formData.email}
					onChange={(e) => setFormData({ ...formData, email: e.target.value })}
					className={errorData.email ? "error-border" : ""}
				/>
				{errorData.email && <p className="error">{errorData.email}</p>}
				<label htmlFor="userType">Тип користувача</label>
				<select
					name="userType"
					id="userType"
					value={formData.userType}
					onChange={(e) =>
						setFormData({ ...formData, userType: e.target.value })
					}
					className={errorData.userType ? "error-border" : ""}
				>
					<option value="">-- Оберіть тип користувача --</option>
					<option value="fop">ФОП</option>
					<option value="citizen">Громадянин</option>
					<option value="other">Інше</option>
				</select>
				{errorData.userType && <p className="error">{errorData.userType}</p>}
				<label htmlFor="topicOfTheAppeal">Тема звернення</label>
				<select
					name="topicOfTheAppeal"
					id="topicOfTheAppeal"
					value={formData.topicOfTheAppeal}
					onChange={(e) =>
						setFormData({ ...formData, topicOfTheAppeal: e.target.value })
					}
					className={errorData.topicOfTheAppeal ? "error-border" : ""}
				>
					<option value="">-- Оберіть тему звернення --</option>
					<option value="error">Помилка</option>
					<option value="suggestion">Пропозиція</option>
					<option value="other">Інше</option>
				</select>
				{errorData.topicOfTheAppeal && (
					<p className="error">{errorData.topicOfTheAppeal}</p>
				)}
				<label htmlFor="message">Повідомлення</label>
				<textarea
					id="message"
					name="message"
					value={formData.message}
					onChange={(e) =>
						setFormData({ ...formData, message: e.target.value })
					}
					className={errorData.message ? "error-border" : ""}
				></textarea>
				{errorData.message && <p className="error">{errorData.message}</p>}
				<button type="submit">Відправити</button>
			</form>
		</div>
	);
};

export default FeedbackForm;
