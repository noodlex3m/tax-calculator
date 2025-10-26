import React from "react";

function AccordionItem({ item, isActive, onToggle }) {
	return (
		<div className={`accordion-item ${isActive ? "active" : ""}`}>
			<div className="item-header" onClick={onToggle}>
				<span className="item-category">{item.category}</span>
				<h3>{item.question}</h3>
				<span className="item-icon">{isActive ? "-" : "+"}</span>
			</div>
			{isActive && (
				<div className="item-content">
					<p>
						<strong>Коротка відповідь:</strong> {item.shortAnswer}
					</p>
					<p>
						<strong>Повна відповідь:</strong> {item.fullAnswer}
					</p>
				</div>
			)}
		</div>
	);
}

export default AccordionItem;
