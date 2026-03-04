import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupAxiosInterceptors } from "./lib/axios-interceptor";

// Setup global axios error handling
setupAxiosInterceptors();

createRoot(document.getElementById("root")!).render(<App />);
