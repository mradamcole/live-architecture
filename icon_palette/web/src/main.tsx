import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionProvider } from "@live-architecture/motion";
import "@live-architecture/motion/tokens.css";
import { App } from "./demo/App";
import "./styles/panels.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionProvider>
      <App />
    </MotionProvider>
  </StrictMode>,
);
