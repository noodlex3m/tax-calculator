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
}) => {
	const [isReplying, setIsReplying] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const handleReplySubmit = (text) => {
		onAddComment(text, comment.id);
		setIsReplying(false);
	};

	const handleEditSubmit = (text) => {
		onEdit(comment.id, text);
		setIsEditing(false);
	};

	return (
		<li className="comment-card">
			<div className="comment-author">
				{comment.author.username}
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
				<p className="comment-text">{comment.content}</p>
			)}

			<div className="comment-actions">
				<button
					onClick={() => setIsReplying(!isReplying)}
					className="comment-action-btn"
				>
					💬 Відповісти
				</button>
				<button
					onClick={() => onLike(comment.id)}
					className={`comment-action-btn ${
						comment.userHasLiked ? "active" : ""
					}`}
				>
					👍 {comment.likesCount}
				</button>
				<button
					onClick={() => onDislike(comment.id)}
					className={`comment-action-btn ${
						comment.userHasDisliked ? "active" : ""
					}`}
				>
					👎 {comment.dislikesCount}
				</button>

				{comment.author.id === "user_me" && (
					<div className="comment-author-actions">
						{!isEditing && (
							<button
								onClick={() => setIsEditing(true)}
								className="comment-edit-btn"
							>
								✏️ Редагувати
							</button>
						)}
						<button
							onClick={() => onDelete(comment.id)}
							className="comment-delete-btn"
						>
							🗑️ Видалити
						</button>
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
							replies={[]} // For depth 1 we don't pass deeply nested replies yet. We will compute this in Comments.js
							onAddComment={onAddComment}
							onLike={onLike}
							onDislike={onDislike}
							onDelete={onDelete}
							onEdit={onEdit}
						/>
					))}
				</ul>
			)}
		</li>
	);
};

export default CommentItem;
