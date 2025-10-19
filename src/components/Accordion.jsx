import { useState } from "react";

function Accordion() {
	const faqData = [
		{
			id: 1,
			question: "Як подати декларацію ФОП?",
			answer:
				"Декларацію можна подати онлайн через Електронний кабінет платника податків, особисто платником податків або уповноваженою на це особою",
		},
		{
			id: 2,
			question: "Які терміни сплати ЄСВ?",
			answer:
				"ЄСВ сплачується щоквартально, до 20-го числа місяця, що настає за кварталом.",
		},
		{
			id: 3,
			question: "Що таке 3 група єдиного податку?",
			answer:
				"Це група для ФОП, які можуть мати дохід до 1167 МЗП на рік і сплачують 5% (без ПДВ) або 3% (з ПДВ).",
		},
	];
	const [selectedId, setSelectedId] = useState(null);
	return (
		<div className="accordion">
			<h2>Поширені питання (FAQ)</h2>
			{faqData.map((item) => (
				<div key={item.id} className="accordion-item">
					<h3
						onClick={() => {
							const newSelectedId = selectedId === item.id ? null : item.id;
							setSelectedId(newSelectedId);
						}}
					>
						{item.question}
					</h3>
					{selectedId === item.id && <p>{item.answer}</p>}
				</div>
			))}
		</div>
	);
}

export default Accordion;
