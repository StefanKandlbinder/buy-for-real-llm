"use client";

import React, { createContext, useContext } from "react";
import { toast } from "sonner";

type ErrorContextType = {
  reportError: (error: Error, context?: string) => void;
  reportWarning: (message: string, context?: string) => void;
  reportInfo: (message: string, context?: string) => void;
};

const ErrorContext = createContext<ErrorContextType | null>(null);

type ErrorProviderProps = {
  children: React.ReactNode;
};

export function ErrorProvider({ children }: ErrorProviderProps) {
  const reportError = React.useCallback((error: Error, context?: string) => {
    console.error(
      "Manual error report:",
      error,
      context ? { context } : undefined
    );

    // Create user-friendly error message
    const getErrorMessage = (error: Error) => {
      // API/Network errors
      if (error.message.includes("Failed to fetch")) {
        return "Network error. Please check your internet connection.";
      }
      if (error.message.includes("UNAUTHORIZED")) {
        return "You need to sign in to continue.";
      }
      if (error.message.includes("FORBIDDEN")) {
        return "You don't have permission to perform this action.";
      }
      if (error.message.includes("NOT_FOUND")) {
        return "The requested resource was not found.";
      }
      if (error.message.includes("TIMEOUT")) {
        return "Request timed out. Please try again.";
      }

      // Validation errors
      if (error.message.includes("validation")) {
        return "Please check your input and try again.";
      }

      // File upload errors
      if (error.message.includes("File too large")) {
        return "File is too large. Please choose a smaller file.";
      }
      if (error.message.includes("Invalid file type")) {
        return "File type not supported. Please choose a different file.";
      }

      // Generic fallback
      return error.message || "An unexpected error occurred.";
    };

    const errorMessage = getErrorMessage(error);
    const description = context
      ? `Context: ${context}`
      : "Please try again or contact support if the issue persists.";

    toast.error(errorMessage, {
      description,
      duration: 8000,
      action: {
        label: "Retry",
        onClick: () => window.location.reload(),
      },
    });
  }, []);

  const reportWarning = React.useCallback(
    (message: string, context?: string) => {
      console.warn("Warning:", message, context ? { context } : undefined);

      toast.warning(message, {
        description: context,
        duration: 5000,
      });
    },
    []
  );

  const reportInfo = React.useCallback((message: string, context?: string) => {
    console.info("Info:", message, context ? { context } : undefined);

    toast.info(message, {
      description: context,
      duration: 4000,
    });
  }, []);

  const value: ErrorContextType = {
    reportError,
    reportWarning,
    reportInfo,
  };

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
}

export function useErrorReporting() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrorReporting must be used within an ErrorProvider");
  }
  return context;
}

// Hook for easier error handling in async operations
export function useAsyncErrorHandler() {
  const { reportError } = useErrorReporting();

  return React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (asyncFn: () => Promise<any>, context?: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return async (...args: any[]) => {
        try {
          return await asyncFn();
        } catch (error) {
          if (error instanceof Error) {
            reportError(error, context);
          } else {
            reportError(new Error(String(error)), context);
          }
          throw error; // Re-throw so calling code can handle it too
        }
      };
    },
    [reportError]
  );
}
