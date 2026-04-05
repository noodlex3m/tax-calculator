import React, { useState } from "react";
import CommentForm from "./CommentForm";

const CommentItem = ({
	comment,
	replies,
	onAddComment,
	onLike,
	onDislike,
	onDelete,
	onEdit,
	currentUser, // 👈 Отримуємо поточного юзера
}) => {
	const [isReplying, setIsReplying] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	// 👇 ЛОГІКА ДОСТУПУ
	const isAuthor = currentUser?.uid === comment.author.id;
	const isAdmin = currentUser?.isAdmin;
	const canEdit = isAuthor; // Тільки автор може редагувати свій текст
	const canDelete = isAuthor || isAdmin; // Видалити може автор АБО адмін

	const handleReplySubmit = (text) => {
		const result = onAddComment(text, comment.id);
		if (result && result.error) return result;
		setIsReplying(false);
	};

	const handleEditSubmit = (text) => {
		const result = onEdit(comment.id, text);
		if (result && result.error) return result;
		setIsEditing(false);
	};

	return (
		<li className="comment-card">
			<div className="comment-author">
				{comment.author.username}
				{/* Якщо це адмін, додаємо бейдж */}
				{comment.author.username.includes("Admin") ||
				(comment.author.id === currentUser?.uid && isAdmin) ? (
					<span
						style={{
							marginLeft: "8px",
							background: "var(--primary-color)",
							color: "white",
							padding: "2px 6px",
							borderRadius: "4px",
							fontSize: "0.7rem",
						}}
					>
						Admin
					</span>
				) : null}
				<span className="comment-date">
					{new Date(comment.createdAt).toLocaleString("uk-UA")}
				</span>
			</div>

			{isEditing ? (
				<CommentForm
					initialValue={comment.content}
					submitLabel="Зберегти"
					onSubmit={handleEditSubmit}
					onCancel={() => setIsEditing(false)}
					autoFocus
				/>
			) : (
				<div className="comment-text">{comment.content}</div>
			)}

			<div className="comment-actions">
				<button
					onClick={() => setIsReplying(!isReplying)}
					className="comment-action-btn"
				>
					↩️ Відповісти
				</button>
				<button
					onClick={() => onLike(comment.id)}
					className="comment-action-btn"
				>
					👍 {comment.likesCount || 0}
				</button>
				<button
					onClick={() => onDislike(comment.id)}
					className="comment-action-btn"
				>
					👎 {comment.dislikesCount || 0}
				</button>

				{/* 👇 Розумні кнопки дій */}
				{(canEdit || canDelete) && (
					<div className="comment-author-actions">
						{canEdit && !isEditing && (
							<button
								onClick={() => setIsEditing(true)}
								className="comment-edit-btn"
							>
								✏️ Редагувати
							</button>
						)}
						{canDelete && (
							<button
								onClick={() => onDelete(comment.id)}
								className="comment-delete-btn"
							>
								🗑️ Видалити
							</button>
						)}
					</div>
				)}
			</div>

			{isReplying && (
				<div className="reply-form-container">
					<CommentForm
						onSubmit={handleReplySubmit}
						submitLabel="Відповісти"
						onCancel={() => setIsReplying(false)}
						autoFocus
					/>
				</div>
			)}

			{replies && replies.length > 0 && (
				<ul className="comments-list comment-replies">
					{replies.map((reply) => (
						<CommentItem
							key={reply.id}
							comment={reply}
							replies={[]}
							onAddComment={onAddComment}
							onLike={onLike}
							onDislike={onDislike}
							onDelete={onDelete}
							onEdit={onEdit}
							currentUser={currentUser} // 👈 Передаємо юзера далі у відповіді
						/>
					))}
				</ul>
			)}
		</li>
	);
};

export default CommentItem;
