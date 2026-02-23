import React, { useState } from "react";

const Comments = ({ comments }) => {
	// Створюємо стан для тексту нового коментаря
	const [newCommentText, setNewCommentText] = useState("");
	const [commentList, setCommentList] = useState(comments); // Створюємо стан для коментарів
	const handleAddComment = () => {
		// Якщо текст порожній (або лише пробіли) — нічого не робимо
		if (!newCommentText.trim()) return;
		// Створюємо новий об'єкт коментаря
		const newComment = {
			id: `cmt_${Date.now()}`, // Генеруємо тимчасовий унікальний ID
			postId: "1",
			content: newCommentText,
			author: {
				id: "user_me",
				username: "Гість", // Поки що будемо Гістем
				role: "user",
			},
			createdAt: new Date().toISOString(), // Поточна дата
			parentId: null,
			likesCount: 0,
			dislikesCount: 0,
			userHasLiked: false,
			userHasDisliked: false,
		};

		setCommentList((prevComments) => [...prevComments, newComment]); // Додаємо новий коментар до списку

		// Очищаємо поле вводу
		setNewCommentText("");
	};

	const handleLike = (id) => {
		setCommentList((prevComments) =>
			prevComments.map((comment) => {
				// Шукаємо коментар, на який клікнули
				if (comment.id === id) {
					// Перевіряємо, чи стоїть вже лайк від нас
					const isLiked = comment.userHasLiked;
					return {
						...comment,
						// Якщо лайк вже стояв — забираємо (-1), якщо ні — додаємо (+1)
						likesCount: isLiked
							? comment.likesCount - 1
							: comment.likesCount + 1,
						userHasLiked: !isLiked, // Змінюємо стан на протилежний
					};
				}
				return comment; // Повертаємо без змін, якщо це не наш коментар
			}),
		);
	};

	const handleDislike = (id) => {
		setCommentList((prevComments) =>
			prevComments.map((comment) => {
				// Шукаємо коментар, на який клікнули
				if (comment.id === id) {
					// Перевіряємо, чи стоїть вже лайк від нас
					const isDisliked = comment.userHasDisliked;
					return {
						...comment,
						// Якщо лайк вже стояв — забираємо (-1), якщо ні — додаємо (+1)
						dislikesCount: isDisliked
							? comment.dislikesCount - 1
							: comment.dislikesCount + 1,
						userHasDisliked: !isDisliked, // Змінюємо стан на протилежний
					};
				}
				return comment; // Повертаємо без змін, якщо це не наш коментар
			}),
		);
	};

	return (
		<section
			className="comments-panel"
			style={{
				marginTop: "3rem",
				borderTop: "1px solid #eee",
				paddingTop: "2rem",
			}}
		>
			<header className="comments-header" style={{ marginBottom: "1.5rem" }}>
				<h2>Коментарі</h2>
				<div className="comments-meta">{comments.length} Коментарів</div>
			</header>

			{/* Форма для нового коментаря */}
			<div
				className="composer"
				style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}
			>
				<div
					className="avatar"
					style={{
						width: "40px",
						height: "40px",
						background: "var(--bg-input)",
						border: "1px solid var(--border-color)",
						borderRadius: "50%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					S
				</div>
				<div className="composer-body" style={{ flex: 1 }}>
					<textarea
						id="newComment"
						placeholder="Приєднатися до обговорення…"
						rows="3"
						value={newCommentText}
						onChange={(event) => setNewCommentText(event.target.value)}
						style={{
							width: "100%",
							padding: "0.5rem",
							borderRadius: "8px",
							background: "var(--bg-input)",
							color: "var(--text-main)",
							border: "1px solid var(--border-color)",
						}}
					></textarea>
					<div
						className="composer-controls"
						style={{
							display: "flex",
							justifyContent: "flex-end",
							gap: "1rem",
							marginTop: "0.5rem",
						}}
					>
						<button className="btn" onClick={handleAddComment}>
							Опублікувати
						</button>
					</div>
				</div>
			</div>

			{/* Список коментарів */}
			<ul className="comments-list" style={{ listStyle: "none", padding: 0 }}>
				{commentList.map((comment) => (
					<li
						key={comment.id}
						style={{
							marginBottom: "1.5rem",
							background: "var(--bg-card)",
							border: "1px solid var(--border-color)",
							padding: "1rem",
							borderRadius: "8px",
						}}
					>
						<div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
							{comment.author.username}
							<span
								style={{
									fontSize: "0.8rem",
									color: "var(--text-secondary)",
									marginLeft: "0.5rem",
								}}
							>
								{new Date(comment.createdAt).toLocaleString("uk-UA")}
							</span>
						</div>
						<p style={{ margin: 0 }}>{comment.content}</p>
						<div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
							<button
								onClick={() => handleLike(comment.id)}
								style={{
									background: "transparent",
									border: "none",
									cursor: "pointer",
									color: comment.userHasLiked
										? "var(--primary-color)"
										: "var(--text-secondary)",
									padding: "0",
									display: "inline-flex",
									alignItems: "center",
									gap: "0.25rem",
									fontSize: "0.95rem",
									fontWeight: "500",
									transition: "color 0.2s ease",
								}}
							>
								👍 {comment.likesCount}
							</button>
							<button
								onClick={() => handleDislike(comment.id)}
								style={{
									background: "transparent",
									border: "none",
									cursor: "pointer",
									color: comment.userHasDisliked
										? "var(--primary-color)"
										: "var(--text-secondary)",
									padding: "0",
									display: "inline-flex",
									alignItems: "center",
									gap: "0.25rem",
									fontSize: "0.95rem",
									fontWeight: "500",
									transition: "color 0.2s ease",
								}}
							>
								👎 {comment.dislikesCount}
							</button>
						</div>
					</li>
				))}
			</ul>
		</section>
	);
};

export default Comments;
