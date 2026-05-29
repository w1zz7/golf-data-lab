"use client";

/**
 * Route-level error boundary (Next.js App Router).
 *
 * Catches any render/runtime error that escapes the per-window
 * AppErrorBoundary — e.g. a crash in the boot sequence or the desktop shell
 * itself, before any window is open. Instead of the bare browser
 * "Application error: a client-side exception has occurred" screen, the
 * visitor gets a recoverable Win98-styled dialog.
 */

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        background: "#008080",
        fontFamily: "'Tahoma', 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          background: "#c0c0c0",
          border: "2px solid",
          borderTopColor: "#ffffff",
          borderLeftColor: "#ffffff",
          borderRightColor: "#404040",
          borderBottomColor: "#404040",
          maxWidth: 460,
          width: "100%",
          boxShadow: "2px 2px 0 #000",
        }}
      >
        <div
          className="flex items-center px-2 py-1"
          style={{
            background: "linear-gradient(90deg,#000080,#1084d0)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          willOS: Unexpected Error
        </div>
        <div className="p-5" style={{ fontSize: 13, color: "#000" }}>
          <div className="flex items-start gap-3 mb-4">
            <div
              aria-hidden
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#d8000c",
                color: "#fff",
                fontWeight: 900,
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              ×
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                Something went wrong while loading.
              </div>
              <div style={{ color: "#333", lineHeight: 1.45 }}>
                The desktop hit an unexpected error. You can try to recover, or
                reload the page to start fresh.
              </div>
            </div>
          </div>
          <div
            className="flex gap-2 justify-end pt-3"
            style={{ borderTop: "1px solid #808080" }}
          >
            <button
              onClick={reset}
              className="px-4 py-1"
              style={btnStyle}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-1"
              style={btnStyle}
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "#c0c0c0",
  border: "2px solid",
  borderTopColor: "#ffffff",
  borderLeftColor: "#ffffff",
  borderRightColor: "#404040",
  borderBottomColor: "#404040",
  fontSize: 12,
  cursor: "pointer",
  minWidth: 90,
};
