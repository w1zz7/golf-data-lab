"use client";

/**
 * AppErrorBoundary — contains a crashing app to its own window.
 *
 * Without a boundary, a single component throw (e.g. a data-not-ready race in
 * the WillBB terminal) unmounts the whole React tree and Next.js shows the
 * full-screen "Application error: a client-side exception has occurred." With
 * this boundary the failure is scoped to one window: the rest of the desktop
 * keeps working and the user gets a period-correct Win98 error dialog with a
 * one-click "Try again" that remounts just that app.
 *
 * React error boundaries must be class components — there is no hook
 * equivalent for getDerivedStateFromError / componentDidCatch.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  /** Window/app label, surfaced in the dialog ("WillBB Markets Terminal"). */
  label?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  /** Bumped on "Try again" to force a fresh mount of the subtree. */
  resetKey: number;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to the console for debugging; never rethrow.
    // eslint-disable-next-line no-console
    console.error(`[AppErrorBoundary${this.props.label ? ` · ${this.props.label}` : ""}]`, error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState((s) => ({ hasError: false, error: null, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="w-full h-full flex items-center justify-center p-4 overflow-auto"
          style={{ background: "#c0c0c0", fontFamily: "'Tahoma', 'Segoe UI', sans-serif" }}
        >
          <div
            style={{
              background: "#c0c0c0",
              border: "2px solid",
              borderTopColor: "#ffffff",
              borderLeftColor: "#ffffff",
              borderRightColor: "#404040",
              borderBottomColor: "#404040",
              maxWidth: 420,
              width: "100%",
              boxShadow: "1px 1px 0 #808080",
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center px-2 py-1"
              style={{ background: "linear-gradient(90deg,#000080,#1084d0)", color: "#fff", fontSize: 12, fontWeight: 700 }}
            >
              {this.props.label ?? "Application"} — Error
            </div>
            <div className="p-4" style={{ fontSize: 13, color: "#000" }}>
              <div className="flex items-start gap-3 mb-3">
                <div
                  aria-hidden
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: 32, height: 32, borderRadius: "50%", background: "#d8000c", color: "#fff", fontWeight: 900, fontSize: 22, lineHeight: 1 }}
                >
                  ×
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    This window ran into a problem.
                  </div>
                  <div style={{ color: "#333", lineHeight: 1.4 }}>
                    The rest of the desktop is still working. You can try
                    reopening this app, or refresh the page.
                  </div>
                </div>
              </div>
              <div
                className="flex gap-2 justify-end mt-4 pt-3"
                style={{ borderTop: "1px solid #808080" }}
              >
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-1"
                  style={{
                    background: "#c0c0c0",
                    border: "2px solid",
                    borderTopColor: "#ffffff",
                    borderLeftColor: "#ffffff",
                    borderRightColor: "#404040",
                    borderBottomColor: "#404040",
                    fontSize: 12,
                    cursor: "pointer",
                    minWidth: 88,
                  }}
                >
                  Try again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-1"
                  style={{
                    background: "#c0c0c0",
                    border: "2px solid",
                    borderTopColor: "#ffffff",
                    borderLeftColor: "#ffffff",
                    borderRightColor: "#404040",
                    borderBottomColor: "#404040",
                    fontSize: 12,
                    cursor: "pointer",
                    minWidth: 88,
                  }}
                >
                  Refresh page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // The resetKey forces React to discard the old (crashed) subtree and mount
    // a fresh one when the user clicks "Try again".
    return <div key={this.state.resetKey} className="w-full h-full">{this.props.children}</div>;
  }
}
