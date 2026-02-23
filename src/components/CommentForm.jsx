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

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!text.trim()) return;
		onSubmit(text);
		setText("");
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="composer"
			style={{ marginBottom: "1rem" }}
		>
			<div className="comment-avatar">S</div>
			<div className="composer-body" style={{ flex: 1 }}>
				<textarea
					id="newComment"
					className="comment-input"
					placeholder={placeholder}
					rows="3"
					value={text}
					onChange={(event) => setText(event.target.value)}
					autoFocus={autoFocus}
				></textarea>
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
