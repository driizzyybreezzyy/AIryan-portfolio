import { Component, type ReactNode } from "react";

/* Error boundary for the WebGL canvases. If a three.js renderer fails to create
   a context (rare hardware/driver cases, locked-down browsers), we render a
   graceful fallback instead of crashing the whole page. */
export default class CanvasBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Swallow — the canvas is decorative/enhancement; the page works without it.
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}
