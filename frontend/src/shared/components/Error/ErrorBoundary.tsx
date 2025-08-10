"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
    hasError: boolean;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showToast?: boolean;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Show toast notification if enabled (default: true)
    if (this.props.showToast !== false) {
      this.showErrorToast(error);
    }
  }

  private showErrorToast = (error: Error) => {
    const getErrorMessage = (error: Error) => {
      // Handle common React errors
      if (error.message.includes("ChunkLoadError")) {
        return "Failed to load application resources. Please refresh the page.";
      }
      if (error.message.includes("Loading chunk")) {
        return "Failed to load part of the application. Please refresh the page.";
      }
      if (error.message.includes("NetworkError")) {
        return "Network error occurred. Please check your connection.";
      }
      if (error.message.includes("Cannot read properties of undefined")) {
        return "Application encountered an unexpected data structure.";
      }
      if (error.message.includes("Cannot read properties of null")) {
        return "Application tried to access unavailable data.";
      }
      if (error.message.includes("is not a function")) {
        return "Application encountered a compatibility issue.";
      }

      // For development, show more details
      if (process.env.NODE_ENV === "development") {
        return `Error: ${error.message}`;
      }

      // Generic fallback for production
      return "An unexpected error occurred in the application.";
    };

    const errorMessage = getErrorMessage(error);

    toast.error(errorMessage, {
      description:
        "The page will automatically recover, or you can refresh manually.",
      duration: 8000,
      action: {
        label: "Refresh Page",
        onClick: () => window.location.reload(),
      },
    });
  };

  private resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
            hasError={this.state.hasError}
          />
        );
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Default fallback component
function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center space-y-4 border rounded-lg bg-background">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Something went wrong
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          This component encountered an error and couldn&apos;t render properly.
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="text-xs text-muted-foreground/80 text-left max-w-md">
            <summary className="cursor-pointer font-medium">
              Error Details
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={resetError}
          className="flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Try Again
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="flex items-center gap-1"
        >
          <Home className="w-3 h-3" />
          Go Home
        </Button>
      </div>
    </div>
  );
}

export default ErrorBoundary;

// Hook for easier usage
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error("Manual error report:", error, errorInfo);

    const errorMessage = error.message.includes("Network")
      ? "Network error occurred. Please check your connection."
      : "An error occurred. Please try again.";

    toast.error(errorMessage, {
      description: "If the problem persists, please refresh the page.",
      action: {
        label: "Refresh",
        onClick: () => window.location.reload(),
      },
    });
  }, []);
}
