import React, { useState } from "react";
import "./Comments.css";

const Comments = ({ comments }) => {
	// Створюємо стан для тексту нового коментаря
	const [newCommentText, setNewCommentText] = useState("");
	const [commentList, setCommentList] = useState(comments); // Створюємо стан для коментарів
	const [editingCommentId, setEditingCommentId] = useState(null); // ID коментаря, який редагується
	const [editingText, setEditingText] = useState(""); // Текст коментаря, який редагується

	const handleEditStart = (comment) => {
		setEditingCommentId(comment.id);
		setEditingText(comment.content);
	};

	const handleEditSave = (id) => {
		setCommentList((prevComments) =>
			prevComments.map((comment) => {
				if (comment.id === id) {
					return {
						...comment,
						content: editingText,
					};
				}
				return comment;
			}),
		);
		setEditingCommentId(null);
		setEditingText("");
	};

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
					// Перевіряємо, чи стоїть вже лайк/дизлайк від нас
					const isLiked = comment.userHasLiked;
					const isDisliked = comment.userHasDisliked;

					return {
						...comment,
						// Якщо лайк вже стояв — забираємо (-1), якщо ні — додаємо (+1)
						likesCount: isLiked
							? comment.likesCount - 1
							: comment.likesCount + 1,
						userHasLiked: !isLiked, // Змінюємо стан на протилежний
						// Якщо ми ставимо лайк, а стояв дизлайк - знімаємо його
						dislikesCount:
							!isLiked && isDisliked
								? comment.dislikesCount - 1
								: comment.dislikesCount,
						userHasDisliked: !isLiked && isDisliked ? false : isDisliked,
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
					// Перевіряємо, чи стоїть вже лайк/дизлайк від нас
					const isLiked = comment.userHasLiked;
					const isDisliked = comment.userHasDisliked;

					return {
						...comment,
						// Якщо дизлайк вже стояв — забираємо (-1), якщо ні — додаємо (+1)
						dislikesCount: isDisliked
							? comment.dislikesCount - 1
							: comment.dislikesCount + 1,
						userHasDisliked: !isDisliked, // Змінюємо стан на протилежний
						// Якщо ми ставимо дизлайк, а стояв лайк - знімаємо його
						likesCount:
							!isDisliked && isLiked
								? comment.likesCount - 1
								: comment.likesCount,
						userHasLiked: !isDisliked && isLiked ? false : isLiked,
					};
				}
				return comment; // Повертаємо без змін, якщо це не наш коментар
			}),
		);
	};

	const handleDeleteComment = (id) => {
		setCommentList((prevComments) =>
			prevComments.filter((comment) => comment.id !== id),
		);
	};

	return (
		<section className="comments-panel">
			<header className="comments-header">
				<h2>Коментарі</h2>
				<div className="comments-meta">{comments.length} Коментарів</div>
			</header>

			{/* Форма для нового коментаря */}
			<div className="composer">
				<div className="comment-avatar">S</div>
				<div className="composer-body" style={{ flex: 1 }}>
					<textarea
						id="newComment"
						className="comment-input"
						placeholder="Приєднатися до обговорення…"
						rows="3"
						value={newCommentText}
						onChange={(event) => setNewCommentText(event.target.value)}
					></textarea>
					<div className="composer-controls">
						<button
							className="comment-submit-btn"
							onClick={handleAddComment}
							disabled={!newCommentText.trim()}
						>
							✈️ Опублікувати
						</button>
					</div>
				</div>
			</div>

			{/* Список коментарів */}
			<ul className="comments-list">
				{commentList.map((comment) => (
					<li key={comment.id} className="comment-card">
						<div className="comment-author">
							{comment.author.username}
							<span className="comment-date">
								{new Date(comment.createdAt).toLocaleString("uk-UA")}
							</span>
						</div>
						{editingCommentId === comment.id ? (
							<textarea
								className="comment-input"
								value={editingText}
								onChange={(e) => setEditingText(e.target.value)}
							></textarea>
						) : (
							<p className="comment-text">{comment.content}</p>
						)}
						<div className="comment-actions">
							<button
								onClick={() => handleLike(comment.id)}
								className={`comment-action-btn ${
									comment.userHasLiked ? "active" : ""
								}`}
							>
								👍 {comment.likesCount}
							</button>
							<button
								onClick={() => handleDislike(comment.id)}
								className={`comment-action-btn ${
									comment.userHasDisliked ? "active" : ""
								}`}
							>
								👎 {comment.dislikesCount}
							</button>

							{comment.author.id === "user_me" && (
								<div className="comment-author-actions">
									{editingCommentId === comment.id ? (
										<>
											<button
												onClick={() => handleEditSave(comment.id)}
												className="comment-save-btn"
											>
												💾 Зберегти
											</button>
											<button
												onClick={() => setEditingCommentId(null)}
												className="comment-cancel-btn"
											>
												❌ Скасувати
											</button>
										</>
									) : (
										<>
											<button
												onClick={() => handleEditStart(comment)}
												className="comment-edit-btn"
											>
												✏️ Редагувати
											</button>
											<button
												onClick={() => handleDeleteComment(comment.id)}
												className="comment-delete-btn"
											>
												🗑️ Видалити
											</button>
										</>
									)}
								</div>
							)}
						</div>
					</li>
				))}
			</ul>
		</section>
	);
};

export default Comments;
