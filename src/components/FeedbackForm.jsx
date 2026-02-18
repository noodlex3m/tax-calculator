import { useState } from "react";
import "./FeedbackForm.css";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

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

	const [isSubmitting, setIsSubmitting] = useState(false);

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

		// Якщо є помилки — зупиняємось
		if (Object.keys(errors).length > 0) {
			setErrorData(errors);
			return;
		}

		// 1. Вмикаємо режим завантаження (блокуємо кнопку)
		setIsSubmitting(true);

		// 2. Відправляємо дані через EmailJS
		emailjs
			.send(
				import.meta.env.VITE_SERVICE_ID, // Твій Service ID
				import.meta.env.VITE_TEMPLATE_ID, // Твій Template ID
				formData, // Дані з форми (вони підставляться в {{...}})
				import.meta.env.VITE_PUBLIC_KEY, // Твій Public Key
			)
			.then(
				() => {
					// УСПІХ: Цей код виконається, якщо лист пішов
					console.log("Успішно відправлено!");

					// Очищаємо форму
					setFormData({
						name: "",
						email: "",
						userType: "",
						topicOfTheAppeal: "",
						message: "",
					});

					// Показуємо повідомлення
					toast.success("Дякуємо! Ваше повідомлення успішно відправлено.");

					// Розблокуємо кнопку
					setIsSubmitting(false);
				},
				(error) => {
					// ПОМИЛКА: Цей код виконається, якщо щось пішло не так
					console.error("Помилка відправки:", error);

					toast.error("Сталася помилка при відправці. Спробуйте пізніше.");

					// Розблокуємо кнопку, щоб можна було спробувати ще раз
					setIsSubmitting(false);
				},
			);
	};

	return (
		<div className="feedback-form">
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

				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Відправка..." : "Відправити"}
				</button>
			</form>
		</div>
	);
};

export default FeedbackForm;
