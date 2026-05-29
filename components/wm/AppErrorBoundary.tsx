"use client";

/**
 * AppErrorBoundary — contains a crashing app to its own window, and tries to
 * self-heal first.
 *
 * Without a boundary, a single component throw (e.g. a data-not-ready race in
 * the WillBB terminal) unmounts the whole React tree and Next.js shows the
 * full-screen "Application error: a client-side exception has occurred." This
 * boundary scopes the failure to one window AND auto-recovers: a transient
 * crash (data wasn't ready on mount) just remounts the subtree a couple times
 * behind a subtle "Reconnecting" placeholder, so the user never sees an error
 * dialog. Only a crash that keeps reproducing after the retries surfaces the
 * period-correct Win98 dialog with a manual "Try again".
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
  /** Bumped on retry to force a fresh mount of the subtree. */
  resetKey: number;
}

const MAX_AUTO_RETRIES = 2;
const AUTO_RETRY_DELAY_MS = 800;

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetKey: 0 };
  private autoRetries = 0;
  private retryTimer: number | null = null;

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(
      `[AppErrorBoundary${this.props.label ? ` · ${this.props.label}` : ""}]`,
      error,
      info.componentStack
    );
    // Self-heal transient errors: remount the subtree after a short delay.
    // Most terminal crashes are mount-time data races that vanish on retry.
    if (this.autoRetries < MAX_AUTO_RETRIES) {
      this.autoRetries += 1;
      if (this.retryTimer != null) window.clearTimeout(this.retryTimer);
      this.retryTimer = window.setTimeout(() => {
        this.setState((s) => ({ hasError: false, resetKey: s.resetKey + 1 }));
      }, AUTO_RETRY_DELAY_MS);
    }
  }

  componentWillUnmount() {
    if (this.retryTimer != null) window.clearTimeout(this.retryTimer);
  }

  private handleRetry = () => {
    this.autoRetries = 0; // a manual retry earns a fresh batch of auto-retries
    this.setState((s) => ({ hasError: false, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      // Still within the auto-retry budget — show a quiet placeholder instead
      // of the alarming dialog while we remount behind the scenes.
      if (this.autoRetries < MAX_AUTO_RETRIES) {
        return (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "#0a0d12", color: "#9793b0", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}
          >
            <span style={{ opacity: 0.8 }}>Reconnecting…</span>
          </div>
        );
      }
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
              {this.props.label ?? "Application"} · Error
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
                  style={btnStyle}
                >
                  Try again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-1"
                  style={btnStyle}
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
    // a fresh one on retry.
    return <div key={this.state.resetKey} className="w-full h-full">{this.props.children}</div>;
  }
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
  minWidth: 88,
};
