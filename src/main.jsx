import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<HelmetProvider>
			<ThemeProvider>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ThemeProvider>
		</HelmetProvider>
	</React.StrictMode>
);
