import { useState, useEffect } from "react";

export function useSimulatedApi(dataToFetch) {
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
				setData(dataToFetch);
				setIsLoading(false);
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [dataToFetch]);
	return { data, isLoading, error };
}
