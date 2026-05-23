import { Component } from "react";
import { C } from "../design/tokens.js";

export default class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            height: "100%",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: C.bg,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: C.dark, marginBottom: 8 }}>App konnte nicht starten</div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 16 }}>
            {this.state.error?.message || "Unbekannter Fehler"}
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: C.blue,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Seite neu laden
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
