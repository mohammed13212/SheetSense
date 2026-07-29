/**
 * ErrorBoundary — catches unexpected render errors and shows a recovery screen.
 *
 * Place this as close to the root as possible, inside providers so theme tokens
 * resolve, but outside all pages so any crash is caught.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { BarChart2, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // During Vite HMR in development the i18n context module is briefly
    // invalidated, causing a transient "useLocale must be used inside
    // <LocaleProvider>" throw. This is not a real app error — skip it so
    // the boundary doesn't get stuck on a phantom error screen.
    if (import.meta.env.DEV && error.message.includes("LocaleProvider")) {
      return { hasError: false };
    }
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    // Navigate to root and reload so all React state is cleared
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background text-foreground px-4 gap-6">
          <div className="bg-primary p-3 rounded-xl text-primary-foreground shadow-md">
            <BarChart2 className="w-8 h-8" />
          </div>
          <div className="text-center space-y-2 max-w-sm">
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An unexpected error occurred. Your data is safe — click below to reload the app.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
