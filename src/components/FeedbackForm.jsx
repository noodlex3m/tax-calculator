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

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(formData);
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
				/>
				<label htmlFor="email">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					value={formData.email}
					onChange={(e) => setFormData({ ...formData, email: e.target.value })}
				/>
				<label htmlFor="userType">Тип користувача</label>
				<select
					name="userType"
					id="userType"
					value={formData.userType}
					onChange={(e) =>
						setFormData({ ...formData, userType: e.target.value })
					}
				>
					<option value="">-- Оберіть тип користувача --</option>
					<option value="fop">ФОП</option>
					<option value="citizen">Громадянин</option>
					<option value="other">Інше</option>
				</select>
				<label htmlFor="topicOfTheAppeal">Тема звернення</label>
				<select
					name="topicOfTheAppeal"
					id="topicOfTheAppeal"
					value={formData.topicOfTheAppeal}
					onChange={(e) =>
						setFormData({ ...formData, topicOfTheAppeal: e.target.value })
					}
				>
					<option value="">-- Оберіть тему звернення --</option>
					<option value="error">Помилка</option>
					<option value="suggestion">Пропозиція</option>
					<option value="other">Інше</option>
				</select>
				<label htmlFor="message">Повідомлення</label>
				<textarea
					id="message"
					name="message"
					value={formData.message}
					onChange={(e) =>
						setFormData({ ...formData, message: e.target.value })
					}
				></textarea>
				<button type="submit">Відправити</button>
			</form>
		</div>
	);
};

export default FeedbackForm;
