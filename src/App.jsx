import { Routes, Route } from "react-router-dom";
import Accordion from "./components/Accordion";
import "./App.css";
import TaxCalculator from "./components/TaxCalculator";
import News from "./components/News";
import ArticlePage from "./components/ArticlePage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import NotFound from "./components/NotFound";

function App() {
	return (
		<>
			<Header />
			<main className="main-content">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/faq" element={<Accordion />} />
					<Route path="/calculator" element={<TaxCalculator />} />
					<Route path="/news/:id" element={<ArticlePage />} />
					<Route path="/news" element={<News />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</main>
			<Footer />
		</>
	);
}

export default App;
