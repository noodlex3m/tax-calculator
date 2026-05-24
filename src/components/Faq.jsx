import "./Faq.css";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import FaqItem from "./FaqItem";
import faqData from "../data/faqData";

// 🔥 МІГРАЦІЯ НА FIREBASE
import { db } from "../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

function Faq() {
	const [faqList, setFaqList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedId, setSelectedId] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("Всі");

	// 1. ЗАВАНТАЖЕННЯ ДАНИХ З FIREBASE ЗІ СТАТИЧНИМ FALLBACK
	useEffect(() => {
		const q = query(collection(db, "faqs"));
		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const items = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				// Якщо в Firestore ще немає даних, використовуємо локальний fallback
				if (items.length === 0) {
					setFaqList(faqData);
				} else {
					// Сортуємо за часом створення, якщо поле існує
					const sortedItems = [...items].sort((a, b) => {
						if (a.createdAt && b.createdAt) {
							return new Date(a.createdAt) - new Date(b.createdAt);
						}
						return 0;
					});
					setFaqList(sortedItems);
				}
				setLoading(false);
			},
			(error) => {
				console.error("Помилка завантаження FAQ з Firestore, використовуємо fallback:", error);
				setFaqList(faqData);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, []);

	const filteredFaq = faqList
		.filter((item) => {
			if (selectedCategory === "Всі") {
				return true;
			}
			return item.category === selectedCategory;
		})
		.filter((item) => {
			const searchTermLower = searchTerm.toLowerCase();
			const questionMatch = item.question?.toLowerCase().includes(searchTermLower) || false;
			const shortAnswerMatch = item.shortAnswer?.toLowerCase().includes(searchTermLower) || false;
			const fullAnswerMatch = item.fullAnswer?.toLowerCase().includes(searchTermLower) || false;
			const categoryMatch = item.category?.toLowerCase().includes(searchTermLower) || false;
			return questionMatch || shortAnswerMatch || fullAnswerMatch || categoryMatch;
		});

	const allCategories = faqList.map((item) => item.category);
	const uniqueCategories = ["Всі", ...new Set(allCategories)];

	return (
		<div className="faq-container">
			<Helmet>
				<title>Поширені питання з оподаткування — Tax.Serh.One</title>
				<meta
					name="description"
					content="Повний довідник поширених питань (FAQ) з оподаткування ФОП. Відповіді на запитання щодо лімітів, єдиного податку та ЄСВ."
				/>
				<link rel="canonical" href="https://tax.serh.one/faq" />
			</Helmet>
			<h2>Поширені питання (FAQ)</h2>
			<input
				type="text"
				placeholder="Пошук за ключовими словами..."
				className="search-bar"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
			<div className="category-filters">
				{uniqueCategories.map((category) => (
					<button
						key={category}
						className={`filter-btn ${
							selectedCategory === category ? "active" : ""
						}`}
						onClick={() => setSelectedCategory(category)}
					>
						{category}
					</button>
				))}
			</div>

			{loading ? (
				<div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
					Завантаження довідника FAQ...
				</div>
			) : (
				filteredFaq.map((item) => (
					<FaqItem
						key={item.id}
						item={item}
						isActive={selectedId === item.id}
						onToggle={() => {
							const newSelectedId = selectedId === item.id ? null : item.id;
							setSelectedId(newSelectedId);
						}}
					/>
				))
			)}

			{filteredFaq.length === 0 && !loading && (
				<div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
					За вашим запитом нічого не знайдено 🕵️‍♂️
				</div>
			)}
		</div>
	);
}

export default Faq;
