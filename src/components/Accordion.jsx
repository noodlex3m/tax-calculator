import "./Accordion.css";
import { useState } from "react";
import AccordionItem from "./AccordionItem";
import faqData from "../data/faqData";

function Accordion() {
	const [selectedId, setSelectedId] = useState(null);
	return (
		<div className="accordion">
			<h2>Поширені питання (FAQ)</h2>
			{faqData.map((item) => (
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
