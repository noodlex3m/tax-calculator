import { useState, useEffect } from "react";

// Хук приймає дані, які ми хочемо "імітувати" (dataToFetch)
export function useSimulatedApi(dataToFetch) {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Кожного разу, коли змінюються вхідні дані, починаємо завантаження
		setIsLoading(true);

		const timer = setTimeout(() => {
			// 1. Встановлюємо дані (використовуй setData і dataToFetch)
			setData(dataToFetch);
			// 2. Вимикаємо завантаження
			setIsLoading(false);
		}, 1000);

		return () => clearTimeout(timer);
	}, [dataToFetch]); // Перезапускаємо ефект, якщо вхідні дані змінилися

	// Повертаємо об'єкт, щоб компоненти могли його використати
	return { data, isLoading };
}
