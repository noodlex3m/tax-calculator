import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";

import { lazy, Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

const TaxCalculator = lazy(() => import("./components/TaxCalculator"));
const News = lazy(() => import("./components/News"));
const Faq = lazy(() => import("./components/Faq"));
const ArticlePage = lazy(() => import("./components/ArticlePage"));
const NotFound = lazy(() => import("./components/NotFound"));

function App() {
	return (
		<>
			<Header />
			<main className="main-content">
				<Suspense fallback={<div className="loading">Завантаження...</div>}>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/faq" element={<Faq />} />
						<Route path="/calculator" element={<TaxCalculator />} />
						<Route path="/news/:id" element={<ArticlePage />} />
						<Route path="/news" element={<News />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</Suspense>
			</main>
			<Footer />
		</>
	);
}

export default App;
