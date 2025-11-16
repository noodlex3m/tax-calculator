import { Routes, Route } from "react-router-dom";
import Accordion from "./components/Accordion";
import "./App.css";
import TaxCalculator from "./components/TaxCalculator";
import News from "./components/News";
import ArticlePage from "./components/ArticlePage";
import Header from "./components/Header";
import Footer from "./components/Footer";

function Home() {
	return <h2>Вітаємо на сайті!</h2>;
}

function App() {
	return (
		<>
			<Header />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/faq" element={<Accordion />} />
				<Route path="/calculator" element={<TaxCalculator />} />
				<Route path="/news/:id" element={<ArticlePage />} />
				<Route path="/news" element={<News />} />
			</Routes>
			<Footer />
		</>
	);
}

export default App;
