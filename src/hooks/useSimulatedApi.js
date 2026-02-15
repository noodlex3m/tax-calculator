import { useState, useEffect } from "react";
import newsData from "../data/newsData";

export function useSimulatedApi(request) {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		setIsLoading(true);

		const timer = setTimeout(() => {
			const isError = Math.random() < 0.2;

			if (isError) {
				setError("Вибачте, сталася помилка завантаження!");
				setIsLoading(false);
			} else {
				setError(null);
				if (Array.isArray(request)) {
					setData(request);
				} else {
					const foundArticle = newsData.find(
						(item) => item.id === Number(request),
					);
					setData(foundArticle);
				}

				setIsLoading(false);
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [request]);
	return { data, isLoading, error };
}
