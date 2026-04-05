import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyCETpVDvF3zvEIThsVkAkYWKHJ2SmndMZU",
	authDomain: "tax-calculator-dbead.firebaseapp.com",
	projectId: "tax-calculator-dbead",
	storageBucket: "tax-calculator-dbead.firebasestorage.app",
	messagingSenderId: "980826599598",
	appId: "1:980826599598:web:c4e4f3393b6b755497fd3f",
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);

// Експортуємо інструменти для авторизації та бази даних
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
