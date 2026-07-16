"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "@/components/ErrorState";
import { clearFocusTubeStorage } from "@/lib/storage";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: null };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || "Unknown error",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Lumen error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  handleReset = () => {
    clearFocusTubeStorage();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={this.props.fallbackTitle ?? "Something unexpected happened"}
          description={
            this.state.errorMessage
              ? `${this.state.errorMessage} Try refreshing. Reset clears local settings only — subscriptions stay in Firebase.`
              : "Lumen encountered an error. Try refreshing the page. Your subscriptions are stored in Firebase."
          }
          onRetry={this.handleRetry}
          resetLabel="Reset app data"
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
