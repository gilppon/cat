import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import { stopMusic } from "./lib/sfx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary
      gameName="Pets Harbor"
      accent="#0ea5e9"
      saveKeys={["PETS_HARBOR_SAVE_V1", "PETS_HARBOR_MUTED"]}
      onCrash={() => stopMusic()}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>
);
