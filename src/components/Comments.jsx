import React, { useEffect, useState } from "react";
import "./Comments.css";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

// 🔥 МАГІЯ FIREBASE
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
	collection,
	addDoc,
	query,
	where,
	onSnapshot,
	deleteDoc,
	doc,
	updateDoc,
} from "firebase/firestore";

// Валідатор (залишається без змін)
const validateComment = (text) => {
	const bannedWords = ["спам", "реклама", "лайка", "дурень", "ідіот"];
	const hasBadWords = bannedWords.some((word) =>
		text.toLowerCase().includes(word),
	);
	return hasBadWords
		? "Коментар містить заборонені слова і не може бути опублікований."
		: null;
};

// Компонент приймає articleId, щоб знати, до якої статті ці коментарі!
const Comments = ({ articleId }) => {
	// 1. Отримуємо поточного користувача
	const { user } = useAuth();

	const [commentList, setCommentList] = useState([]);
	const [sortBy, setSortBy] = useState("newest");

	// 2. ЧИТАННЯ З БАЗИ (В РЕАЛЬНОМУ ЧАСІ)
	useEffect(() => {
		if (!articleId) return;

		// Шукаємо коментарі тільки для поточної статті
		const q = query(
			collection(db, "comments"),
			where("articleId", "==", String(articleId)),
		);

		// onSnapshot - автоматично оновлює дані, коли хтось додає новий коментар
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const commentsData = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setCommentList(commentsData);
		});

		// Відключаємо слухача, коли користувач йде зі сторінки
		return () => unsubscribe();
	}, [articleId]);

	// 3. ДОДАВАННЯ КОМЕНТАРЯ В БАЗУ
	const handleAddComment = async (text, parentId = null) => {
		// Якщо не авторизований - повертаємо помилку
		if (!user) {
			return {
				error: "Будь ласка, увійдіть в кабінет, щоб залишити коментар.",
			};
		}

		if (!text.trim()) return;

		const validationError = validateComment(text);
		if (validationError) return { error: validationError };

		try {
			await addDoc(collection(db, "comments"), {
				articleId: String(articleId),
				content: text,
				parentId: parentId,
				author: {
					id: user.uid,
					username: user.name,
				},
				createdAt: new Date().toISOString(),
				likesCount: 0,
				dislikesCount: 0,
			});
		} catch (err) {
			console.error("Помилка додавання коментаря:", err);
			return { error: "Не вдалося зберегти коментар." };
		}
	};

	// 4. ВИДАЛЕННЯ З БАЗИ
	const handleDelete = async (id) => {
		if (window.confirm("Ви впевнені, що хочете видалити цей коментар?")) {
			try {
				await deleteDoc(doc(db, "comments", id));
			} catch (err) {
				console.error("Помилка видалення:", err);
			}
		}
	};

	// 5. РЕДАГУВАННЯ В БАЗІ
	const handleEdit = async (id, newText) => {
		const validationError = validateComment(newText);
		if (validationError) return { error: validationError };

		try {
			await updateDoc(doc(db, "comments", id), {
				content: newText,
			});
		} catch (err) {
			console.error("Помилка редагування:", err);
			return { error: "Не вдалося оновити." };
		}
	};

	// Прості лайки (поки без перевірки на унікальність, для прикладу)
	const handleLike = async (id) => {
		if (!user) return alert("Увійдіть, щоб оцінити!");
		const comment = commentList.find((c) => c.id === id);
		if (comment) {
			await updateDoc(doc(db, "comments", id), {
				likesCount: (comment.likesCount || 0) + 1,
			});
		}
	};

	const handleDislike = async (id) => {
		if (!user) return alert("Увійдіть, щоб оцінити!");
		const comment = commentList.find((c) => c.id === id);
		if (comment) {
			await updateDoc(doc(db, "comments", id), {
				dislikesCount: (comment.dislikesCount || 0) + 1,
			});
		}
	};

	const mainComments = commentList.filter((c) => c.parentId === null);

	const sortedComments = [...mainComments].sort((a, b) => {
		if (sortBy === "newest") {
			return new Date(b.createdAt) - new Date(a.createdAt);
		}
		if (sortBy === "oldest") {
			return new Date(a.createdAt) - new Date(b.createdAt);
		}
		if (sortBy === "popular") {
			return (b.likesCount || 0) - (a.likesCount || 0);
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

			<div className="main-composer-wrapper" style={{ marginBottom: "2rem" }}>
				<CommentForm onSubmit={(text) => handleAddComment(text, null)} />
			</div>

			<ul className="comments-list">
				{sortedComments.map((comment) => (
					<CommentItem
						key={comment.id}
						comment={comment}
						replies={commentList.filter((c) => c.parentId === comment.id)}
						onAddComment={handleAddComment}
						onLike={handleLike}
						onDislike={handleDislike}
						onDelete={handleDelete}
						onEdit={handleEdit}
					/>
				))}
			</ul>
		</section>
	);
};

export default Comments;
