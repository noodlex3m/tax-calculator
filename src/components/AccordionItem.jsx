import React from "react";

function AccordionItem({ item, isActive, onToggle }) {
	return (
		<div className="accordion-item">
			<h3 onClick={onToggle}>{item.question}</h3>
			{isActive && <p>{item.answer}</p>}
		</div>
	);
}

export default AccordionItem;
