import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error(error);
    if (window.__sentry) window.__sentry.captureException(error);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ maxWidth: 520, margin: "20vh auto", padding: 24, fontFamily: "system-ui, sans-serif", textAlign: "center", color: "#1E1D2F" }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ marginBottom: 16 }}>Please refresh the page. If it keeps happening, email us and we will sort it out.</p>
        <button onClick={() => window.location.reload()} style={{ padding: "10px 18px", borderRadius: 999, background: "#1E1D2F", color: "#FAEEEE", border: 0, cursor: "pointer" }}>
          Refresh
        </button>
      </div>
    );
  }
}

// Optional error reporting: only loaded when VITE_SENTRY_DSN is set.
if (import.meta.env.VITE_SENTRY_DSN) {
  import("@sentry/react")
    .then((Sentry) => {
      Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, environment: "production", tracesSampleRate: 0 });
      window.__sentry = Sentry;
    })
    .catch(() => {});
}

createRoot(document.getElementById("app-root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
