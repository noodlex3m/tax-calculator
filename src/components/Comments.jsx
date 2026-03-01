import React, { useEffect, useState, useMemo } from "react";
import "./Comments.css";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

const Comments = ({ comments = [] }) => {
	const [commentList, setCommentList] = useState(() => {
		try {
			const saved = localStorage.getItem("comments");
			return saved ? JSON.parse(saved) : comments;
		} catch (_err) {
			void _err;
			return comments;
		}
	});

	const [sortBy, setSortBy] = useState("newest");

	useEffect(() => {
		localStorage.setItem("comments", JSON.stringify(commentList));
	}, [commentList]);

	const handleAddComment = (text, parentId = null) => {
		// Якщо текст порожній (або лише пробіли) — нічого не робимо
		if (!text.trim()) return;

		// 1. Створюємо список заборонених слів
		const bannedWords = ["спам", "реклама", "лайка", "дурень", "ідіот"];

		// 2. Перевіряємо текст коментаря на наявність хоча б одного забороненого слова
		const hasBadWords = bannedWords.some((word) =>
			text.toLowerCase().includes(word),
		);

		if (hasBadWords) {
			// Повертаємо об'єкт з помилкою замість alert
			return {
				error:
					"Ваш коментар містить заборонені слова і не може бути опублікований!",
			};
		}

		// Якщо заборонених слів немає - продовжуємо створювати коментар
		const newComment = {
			id: `cmt_${Date.now()}`,
			postId: "1",
			content: text,
			author: {
				id: "user_me",
				username: "Гість",
				role: "user",
			},
			createdAt: new Date().toISOString(),
			parentId,
			likesCount: 0,
			dislikesCount: 0,
			userHasLiked: false,
			userHasDisliked: false,
		};

		setCommentList((prevComments) => [...prevComments, newComment]);
	};

	const handleEdit = (id, newText) => {
		const bannedWords = ["спам", "реклама", "лайка", "дурень", "ідіот"];
		const hasBadWords = bannedWords.some((word) =>
			newText.toLowerCase().includes(word),
		);

		if (hasBadWords) {
			return { error: "Змінений коментар містить заборонені слова!" };
		}

		setCommentList((prevComments) =>
			prevComments.map((comment) =>
				comment.id === id ? { ...comment, content: newText } : comment,
			),
		);
	};

	const handleLike = (id) => {
		setCommentList((prevComments) =>
			prevComments.map((comment) => {
				if (comment.id === id) {
					const isLiked = comment.userHasLiked;
					const isDisliked = comment.userHasDisliked;

					return {
						...comment,
						likesCount: isLiked
							? comment.likesCount - 1
							: comment.likesCount + 1,
						userHasLiked: !isLiked,
						dislikesCount:
							!isLiked && isDisliked
								? comment.dislikesCount - 1
								: comment.dislikesCount,
						userHasDisliked: !isLiked && isDisliked ? false : isDisliked,
					};
				}
				return comment;
			}),
		);
	};

	const handleDislike = (id) => {
		setCommentList((prevComments) =>
			prevComments.map((comment) => {
				if (comment.id === id) {
					const isLiked = comment.userHasLiked;
					const isDisliked = comment.userHasDisliked;

					return {
						...comment,
						dislikesCount: isDisliked
							? comment.dislikesCount - 1
							: comment.dislikesCount + 1,
						userHasDisliked: !isDisliked,
						likesCount:
							!isDisliked && isLiked
								? comment.likesCount - 1
								: comment.likesCount,
						userHasLiked: !isDisliked && isLiked ? false : isLiked,
					};
				}
				return comment;
			}),
		);
	};

	const handleDeleteComment = (id) => {
		// Обережно: видалення батьківського коментаря має видаляти і його відповіді
		// Але поки напишемо просте видалення, згодом можна додати рекурсивне.
		setCommentList((prevComments) =>
			prevComments.filter((comment) => comment.id !== id),
		);
	};

	// --- Логіка перетворення плоского списку в деревооб'єкт (Tree Structure) ---
	const buildCommentTree = (commentsFlatList) => {
		if (!Array.isArray(commentsFlatList) || commentsFlatList.length === 0)
			return [];

		const tree = [];
		const lookup = {};

		// Спочатку заносимо всі коментарі у словник для швидкого доступу
		commentsFlatList.forEach((comment) => {
			lookup[comment.id] = { ...comment, replies: [] };
		});

		// Потім проходимось і розподіляємо відповідей по їхнім "батькам"
		commentsFlatList.forEach((comment) => {
			if (comment.parentId) {
				// Якщо є parentId, і такий parent існує - додаємо у його replies
				if (lookup[comment.parentId]) {
					lookup[comment.parentId].replies.push(lookup[comment.id]);
				}
			} else {
				// Якщо parentId немає (або null) - це коментар верхнього рівня
				tree.push(lookup[comment.id]);
			}
		});

		return tree;
	};

	const commentTree = useMemo(
		() => buildCommentTree(commentList),
		[commentList],
	);

	// 👇 Магія сортування тут
	const sortedComments = [...commentTree].sort((a, b) => {
		if (sortBy === "newest") {
			return new Date(b.createdAt) - new Date(a.createdAt);
		}
		if (sortBy === "oldest") {
			return new Date(a.createdAt) - new Date(b.createdAt);
		}
		if (sortBy === "popular") {
			return b.likesCount - a.likesCount;
		}
		return 0;
	});

	return (
		<section className="comments-panel">
			<header className="comments-header">
				<div className="header-top">
					<h2>Коментарі</h2>
					<div className="comments-meta">{commentList.length} Коментарів</div>
				</div>

				{/* 👇 Випадаючий список для сортування */}
				<div className="sort-controls">
					<label htmlFor="sort-select">Сортувати:</label>
					<select
						id="sort-select"
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value)}
						className="sort-select"
					>
						<option value="newest">Найновіші</option>
						<option value="oldest">Найстаріші</option>
						<option value="popular">Популярні</option>
					</select>
				</div>
			</header>

			{/* Форма головного рівня (без parentId) */}
			<div className="main-composer-wrapper" style={{ marginBottom: "2rem" }}>
				<CommentForm onSubmit={(text) => handleAddComment(text, null)} />
			</div>

			<ul className="comments-list">
				{sortedComments.map((comment) => (
					<CommentItem
						key={comment.id}
						comment={comment}
						replies={comment.replies}
						onAddComment={handleAddComment}
						onLike={handleLike}
						onDislike={handleDislike}
						onDelete={handleDeleteComment}
						onEdit={handleEdit}
					/>
				))}
			</ul>
		</section>
	);
};

export default Comments;
