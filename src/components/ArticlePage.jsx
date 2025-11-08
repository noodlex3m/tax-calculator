import React from "react";
import { useParams } from "react-router-dom";

function ArticlePage() {
	const { id } = useParams();

	return (
		<div>
			<h2>Тут буде повний текст статті (ID: {id})</h2>
			<p>(Поки що це просто заглушка...)</p>
		</div>
	);
}

export default ArticlePage;
