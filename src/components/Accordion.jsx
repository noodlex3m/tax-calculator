import "./Accordion.css";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import AccordionItem from "./AccordionItem";
import faqData from "../data/faqData";

function Accordion() {
	const [selectedId, setSelectedId] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("Всі");

	const filteredFaq = faqData
		.filter((item) => {
			if (selectedCategory === "Всі") {
				return true;
			}
			return item.category === selectedCategory;
		})
		.filter((item) => {
			const searchTermLower = searchTerm.toLowerCase();
			return (
				item.question.toLowerCase().includes(searchTermLower) ||
				item.shortAnswer.toLowerCase().includes(searchTermLower) ||
				item.fullAnswer.toLowerCase().includes(searchTermLower) ||
				item.category.toLowerCase().includes(searchTermLower)
			);
		});

	const allCategories = faqData.map((item) => item.category);
	const uniqueCategories = ["Всі", ...new Set(allCategories)];

	return (
		<div className="accordion">
			<Helmet>
				<title>Поширені питання з оподаткування — Tax.Serh.One</title>
				<meta
					name="description"
					content="Розрахуйте єдиний податок та ЄСВ для 1, 2 та 3 групи ФОП. Актуальні ставки 2025 року."
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
			{filteredFaq.map((item) => (
				<AccordionItem
					key={item.id}
					item={item}
					isActive={selectedId === item.id}
					onToggle={() => {
						const newSelectedId = selectedId === item.id ? null : item.id;
						setSelectedId(newSelectedId);
					}}
				/>
			))}
		</div>
	);
}

export default Accordion;
