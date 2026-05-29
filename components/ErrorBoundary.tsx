"use client";

/**
 * Generic render-error boundary with a caller-supplied fallback.
 *
 * Unlike the window-chrome AppErrorBoundary (which shows a Win98 error dialog
 * + retry), this is a bare boundary for wrapping fragile subtrees — most
 * importantly the WebGL 3D scenes. If a <Canvas> throws (lost GPU context,
 * post-processing failure on a weak driver, etc.) the whole boot/page would
 * otherwise white-screen with "a client-side exception has occurred." With
 * this boundary the subtree degrades to a static fallback and the rest of the
 * experience continues.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Rendered in place of the children once they throw. */
  fallback?: ReactNode;
  /** Optional label for the console breadcrumb. */
  label?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(
      `[ErrorBoundary${this.props.label ? ` · ${this.props.label}` : ""}]`,
      error,
      info.componentStack
    );
  }

  render() {
    if (this.state.hasError) return <>{this.props.fallback ?? null}</>;
    return this.props.children;
  }
}
