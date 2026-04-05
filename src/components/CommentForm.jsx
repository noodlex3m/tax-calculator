import React, { useState } from "react";

const CommentForm = ({
	onSubmit,
	placeholder = "Приєднатися до обговорення…",
	initialValue = "",
	autoFocus = false,
	submitLabel = "Опублікувати",
	onCancel,
}) => {
	const [text, setText] = useState(initialValue);
	const [error, setError] = useState(null); // Додаємо стан помилки

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!text.trim()) return;

		const result = await onSubmit(text);

		if (result && result.error) {
			setError(result.error);
		} else {
			setText("");
			setError(null);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="composer"
			style={{ marginBottom: "1rem" }}
		>
			<div className="comment-avatar">S</div>
			<div className="composer-body">
				<textarea
					id="newComment"
					className="comment-input"
					placeholder={placeholder}
					rows="3"
					value={text}
					onChange={(event) => {
						setText(event.target.value);
						if (error) setError(null); // Очищаємо помилку при введенні нового тексту
					}}
					autoFocus={autoFocus}
				></textarea>

				{/* Відображення тексту помилки, якщо вона є */}
				{error && (
					<div
						className="comment-error"
						style={{
							color: "red",
							fontSize: "0.875rem",
							marginTop: "0.25rem",
							marginBottom: "0.5rem",
							fontWeight: "bold",
						}}
					>
						⚠️ {error}
					</div>
				)}

				<div className="composer-controls">
					{onCancel && (
						<button
							type="button"
							onClick={onCancel}
							className="comment-cancel-btn"
						>
							❌ Скасувати
						</button>
					)}
					<button
						type="submit"
						className="comment-submit-btn"
						disabled={!text.trim()}
					>
						✈️ {submitLabel}
					</button>
				</div>
			</div>
		</form>
	);
};

export default CommentForm;
