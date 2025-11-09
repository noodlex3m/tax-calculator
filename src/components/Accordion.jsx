import "./Accordion.css";
import { useState } from "react";
import AccordionItem from "./AccordionItem";
import faqData from "../data/faqData";

function Accordion() {
	const [selectedId, setSelectedId] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");

	const filteredFaq = faqData.filter(
		(item) =>
			item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.shortAnswer.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.fullAnswer.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.category.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="accordion">
			<h2>Поширені питання (FAQ)</h2>
			<input
				type="text"
				placeholder="Пошук за ключовими словами..."
				className="search-bar"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
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
