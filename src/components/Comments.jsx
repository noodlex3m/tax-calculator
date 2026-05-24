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

const Comments = ({ articleId }) => {
	// 1. Отримуємо поточного користувача
	const { user } = useAuth();

	const [commentList, setCommentList] = useState([]);
	const [sortBy, setSortBy] = useState("newest");
	const [isBanned, setIsBanned] = useState(false); // 🔥 Новий стан для бану
	const [bannedUsersList, setBannedUsersList] = useState([]); // 🔥 Список усіх забанених (тільки для адміна)

	// 2. ЧИТАННЯ З БАЗИ КОМЕНТАРІВ (В РЕАЛЬНОМУ ЧАСІ)
	useEffect(() => {
		if (!articleId) return;

		const q = query(
			collection(db, "comments"),
			where("articleId", "==", String(articleId)),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const commentsData = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setCommentList(commentsData);
		});

		return () => unsubscribe();
	}, [articleId]);

	// 🔥 3. ПЕРЕВІРКА НА БАН ПОТОЧНОГО КОРИСТУВАЧА
	useEffect(() => {
		if (!user) {
			setIsBanned(false);
			return;
		}

		const q = query(
			collection(db, "bannedUsers"),
			where("userId", "==", user.uid),
		);

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				setIsBanned(!snapshot.empty);
			},
			(err) => {
				console.error("Помилка перевірки статусу блокування:", err);
			}
		);

		return () => unsubscribe();
	}, [user]);

	// 🔥 3.1 ЗАВАНТАЖЕННЯ СПИСКУ ЗАБЛОКОВАНИХ (ТІЛЬКИ ДЛЯ АДМІНІСТРАТОРА)
	useEffect(() => {
		if (!user || !user.isAdmin) {
			setBannedUsersList([]);
			return;
		}

		const unsubscribe = onSnapshot(
			collection(db, "bannedUsers"),
			(snapshot) => {
				const list = snapshot.docs.map((doc) => ({
					id: doc.id,
					userId: doc.data().userId,
				}));
				setBannedUsersList(list);
			},
			(err) => {
				console.error("Помилка завантаження списку заблокованих:", err);
			}
		);

		return () => unsubscribe();
	}, [user]);

	// 4. ДОДАВАННЯ КОМЕНТАРЯ В БАЗУ
	const handleAddComment = async (text, parentId = null) => {
		if (!user) {
			return {
				error: "Будь ласка, увійдіть в кабінет, щоб залишити коментар.",
			};
		}

		// 🔥 Захист на рівні функції відправки
		if (isBanned) {
			return {
				error: "Ви заблоковані адміністратором і не можете залишати коментарі.",
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
				likedBy: [],
				dislikedBy: [],
			});
		} catch (err) {
			console.error("Помилка додавання коментаря:", err);
			return { error: "Не вдалося зберегти коментар." };
		}
	};

	// 5. ВИДАЛЕННЯ З БАЗИ
	const handleDelete = async (id) => {
		if (window.confirm("Ви впевнені, що хочете видалити цей коментар?")) {
			try {
				await deleteDoc(doc(db, "comments", id));
			} catch (err) {
				console.error("Помилка видалення:", err);
			}
		}
	};

	// 6. РЕДАГУВАННЯ В БАЗІ
	const handleEdit = async (id, newText) => {
		if (isBanned) return { error: "Дія заборонена." };

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

	// 7. ЛОГІКА БЛОКУВАННЯ КОРИСТУВАЧА АДМІНІСТРАТОРОМ
	const handleBlockUser = async (commentId) => {
		const targetComment = commentList.find((c) => c.id === commentId);
		if (!targetComment) return;

		const targetUid = targetComment.author.id;
		const targetUsername = targetComment.author.username;

		if (
			window.confirm(
				`Ви впевнені, що хочете заблокувати користувача ${targetUsername}?`,
			)
		) {
			try {
				await addDoc(collection(db, "bannedUsers"), {
					userId: targetUid,
					username: targetUsername,
					bannedAt: new Date().toISOString(),
					bannedBy: user.uid,
				});

				alert(`Користувача ${targetUsername} успішно заблоковано!`);
			} catch (err) {
				console.error("Помилка при блокуванні користувача:", err);
				alert("Не вдалося заблокувати користувача.");
			}
		}
	};

	// 🔥 7.1 ЛОГІКА РОЗБЛОКУВАННЯ КОРИСТУВАЧА АДМІНІСТРАТОРОМ
	const handleUnblockUser = async (targetUid) => {
		const banDoc = bannedUsersList.find((b) => b.userId === targetUid);
		if (!banDoc) return;

		if (
			window.confirm(
				"Ви впевнені, що хочете розблокувати цього користувача?",
			)
		) {
			try {
				await deleteDoc(doc(db, "bannedUsers", banDoc.id));
				alert("Користувача успішно розблоковано!");
			} catch (err) {
				console.error("Помилка при розблокуванні користувача:", err);
				alert("Не вдалося розблокувати користувача.");
			}
		}
	};

	// Прості лайки/дизлайки (без змін)
	const handleLike = async (id) => {
		if (!user) return alert("Увійдіть, щоб оцінити!");
		if (isBanned) return;
		const comment = commentList.find((c) => c.id === id);
		if (comment) {
			await updateDoc(doc(db, "comments", id), {
				likesCount: (comment.likesCount || 0) + 1,
			});
		}
	};

	const handleDislike = async (id) => {
		if (!user) return alert("Увійдіть, щоб оцінити!");
		if (isBanned) return;
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

			{/* 🔥 Замість форми вводу показуємо попередження, якщо юзер у бані */}
			<div className="main-composer-wrapper" style={{ marginBottom: "2rem" }}>
				{isBanned ? (
					<div
						className="auth-error"
						style={{ textAlign: "center", fontWeight: "bold" }}
					>
						🚫 Ваш акаунт заблоковано адміністратором за порушення правил
						дискусії. Доступ до написання коментарів обмежено.
					</div>
				) : (
					<CommentForm onSubmit={(text) => handleAddComment(text, null)} />
				)}
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
						currentUser={user}
						onBlock={handleBlockUser}
						bannedUsersList={bannedUsersList}
						onUnblock={handleUnblockUser}
					/>
				))}
			</ul>
		</section>
	);
};

export default Comments;
