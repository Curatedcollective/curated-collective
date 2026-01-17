import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Emergency: Unregister any service workers causing loading hang
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Unregistered service worker:', registration);
    }
  });
}

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

createRoot(document.getElementById("root")!).render(<App />);
