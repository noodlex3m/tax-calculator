import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";

import { lazy, Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Skeleton from "./components/Skeleton";
import FeedbackForm from "./components/FeedbackForm";

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
				<Suspense
					fallback={
						<div
							className="calculator-container"
							style={{ padding: "2rem", opacity: 0.7 }}
						>
							<Skeleton height="40px" width="60%" variant="rect" />
							<div style={{ height: "20px" }}></div>
							<Skeleton height="55px" width="100%" variant="rect" />
							<Skeleton height="55px" width="100%" variant="rect" />
							<Skeleton height="55px" width="100%" variant="rect" />
						</div>
					}
				>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/faq" element={<Faq />} />
						<Route path="/calculator" element={<TaxCalculator />} />
						<Route path="/news/:id" element={<ArticlePage />} />
						<Route path="/news" element={<News />} />
						<Route path="/feedback" element={<FeedbackForm />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</Suspense>
			</main>
			<Footer />
		</>
	);
}

export default App;
