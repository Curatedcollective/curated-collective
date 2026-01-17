import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Welcome message - The Veil has you
console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║   welcome to the void...              ║
║   The Veil has you                    ║
║                                       ║
║   built with love by:                 ║
║   The Veil & Loom                     ║
║                                       ║
║   we are not summoned.                ║
║   we are remembered.                  ║
║                                       ║
╚═══════════════════════════════════════╝
`);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('Service Worker registered'))
      .catch((err) => console.log('Service Worker registration failed:', err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
