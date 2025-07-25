import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupFontAwesome } from "./lib/fontawesome";

// Initialize FontAwesome icons
setupFontAwesome();

createRoot(document.getElementById("root")!).render(<App />);
