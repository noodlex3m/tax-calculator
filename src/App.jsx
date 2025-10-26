import { Routes, Route, Link } from "react-router-dom";
import Accordion from "./components/Accordion";
import "./App.css";

const News = () => {
	return <h2>Останні Новини</h2>;
};

function TaxCalculator() {
	return <h2>Тут буде Податковий Калькулятор</h2>;
}

function Home() {
	return <h2>Вітаємо на сайті!</h2>;
}

function App() {
	return (
		<>
			<nav>
				<Link to="/">Головна</Link>
				<Link to="/faq">Поширені Питання (FAQ)</Link>
				<Link to="/calculator">Калькулятор</Link>
				<Link to="/news">Новини</Link>
			</nav>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/faq" element={<Accordion />} />
				<Route path="/calculator" element={<TaxCalculator />} />
				<Route path="/news" element={<News />} />
			</Routes>
		</>
	);
}

export default App;
