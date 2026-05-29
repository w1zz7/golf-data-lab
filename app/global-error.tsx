"use client";

/**
 * Global error boundary — the absolute last resort, catching errors thrown in
 * the root layout itself (where app/error.tsx cannot reach). Must render its
 * own <html>/<body>. Kept dependency-free and inline-styled so it works even
 * if app chunks failed to load.
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#008080",
          fontFamily: "'Tahoma', 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            background: "#c0c0c0",
            border: "2px solid #ffffff",
            borderRightColor: "#404040",
            borderBottomColor: "#404040",
            maxWidth: 460,
            width: "90%",
            boxShadow: "2px 2px 0 #000",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg,#000080,#1084d0)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              padding: "4px 8px",
            }}
          >
            willOS — System Error
          </div>
          <div style={{ padding: 20, fontSize: 13, color: "#000" }}>
            <p style={{ fontWeight: 700, marginTop: 0 }}>
              The page failed to load.
            </p>
            <p style={{ color: "#333", lineHeight: 1.45 }}>
              An unexpected error occurred. Please reload to try again.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={reset} style={btn}>
                Try again
              </button>
              <button onClick={() => window.location.reload()} style={btn}>
                Reload
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

const btn: React.CSSProperties = {
  background: "#c0c0c0",
  border: "2px solid #ffffff",
  borderRightColor: "#404040",
  borderBottomColor: "#404040",
  fontSize: 12,
  cursor: "pointer",
  minWidth: 90,
  padding: "4px 16px",
};
