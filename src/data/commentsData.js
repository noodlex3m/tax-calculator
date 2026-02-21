const commentsData = [
	{
		id: "cmt_1",
		postId: "1", // ID статті "tax-changes-2026"
		content:
			"Дуже корисна стаття, дякую! Чи відомо щось про зміни лімітів для 2 групи?",
		author: {
			id: "user_101",
			username: "Олександр",
			role: "user",
		},
		createdAt: "2026-02-21T10:00:00Z",
		parentId: null,
		likesCount: 5,
		dislikesCount: 0,
		userHasLiked: false,
		userHasDisliked: false,
	},
	{
		id: "cmt_2",
		postId: "1",
		content:
			"Поки що ліміти залишаються без змін, чекаємо офіційного роз'яснення.",
		author: {
			id: "user_1",
			username: "Serhii (Admin)",
			role: "admin",
		},
		createdAt: "2026-02-21T10:30:00Z",
		parentId: "cmt_1", // Вказує, що це відповідь на cmt_1
		likesCount: 12,
		dislikesCount: 0,
		userHasLiked: true,
		userHasDisliked: false,
	},
];

export default commentsData;
