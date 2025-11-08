import { Routes, Route, Link } from "react-router-dom";
import Accordion from "./components/Accordion";
import "./App.css";
import TaxCalculator from "./components/TaxCalculator";
import News from "./components/News";
import ArticlePage from "./components/ArticlePage";

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
