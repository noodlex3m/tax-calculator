// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	updateProfile,
	GoogleAuthProvider,
	signInWithPopup,
} from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true); // Важливо для Firebase

	// Відстеження стану авторизації (Firebase автоматично пам'ятає сесію)
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			if (currentUser) {
				// Користувач увійшов
				setIsAuthenticated(true);
				setUser({
					uid: currentUser.uid,
					email: currentUser.email,
					name: currentUser.displayName || "Користувач",
					photoURL: currentUser.photoURL,
				});
			} else {
				// Користувач вийшов
				setIsAuthenticated(false);
				setUser(null);
			}
			setLoading(false); // Завершили перевірку сесії
		});

		// Відписуємось від прослуховування при демонтажі компонента
		return () => unsubscribe();
	}, []);

	// Реєстрація через Email та Пароль
	const register = async (email, password, name) => {
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);
			// Додаємо ім'я до профілю Firebase
			await updateProfile(userCredential.user, {
				displayName: name,
			});
			// onAuthStateChanged автоматично оновить стан user
		} catch (error) {
			console.error("Помилка реєстрації:", error.message);
			throw new Error(
				"Не вдалося зареєструватися. Можливо, такий email вже існує або пароль надто простий.",
			);
		}
	};

	// Вхід через Email та Пароль
	const login = async (email, password) => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
			// onAuthStateChanged автоматично оновить стан user
		} catch (error) {
			console.error("Помилка входу:", error.message);
			throw new Error("Невірний email або пароль.");
		}
	};

	// Вхід через Google
	const loginWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		try {
			await signInWithPopup(auth, provider);
			// onAuthStateChanged автоматично оновить стан user
		} catch (error) {
			console.error("Помилка входу через Google:", error.message);
			throw new Error("Не вдалося увійти через Google.");
		}
	};

	// Вихід з акаунту
	const logout = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error("Помилка при виході:", error.message);
		}
	};

	// Оновлення профілю (для сторінки Налаштування)
	const updateUser = async (updatedData) => {
		if (!auth.currentUser) return;
		try {
			await updateProfile(auth.currentUser, {
				displayName: updatedData.name,
				// email оновлюється окремим методом у Firebase (потребує переавторизації),
				// тому поки що оновлюємо лише ім'я
			});
			// Оновлюємо локальний стан, щоб UI миттєво відреагував
			setUser((prev) => ({ ...prev, name: updatedData.name }));
		} catch (error) {
			console.error("Помилка оновлення профілю:", error.message);
			throw new Error("Не вдалося оновити профіль.");
		}
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				user,
				loading,
				register,
				login,
				loginWithGoogle,
				logout,
				updateUser,
			}}
		>
			{/* Не рендеримо додаток, поки Firebase не перевірить сесію */}
			{!loading && children}
		</AuthContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
