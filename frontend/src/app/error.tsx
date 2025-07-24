"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error for debugging
    console.error("Application error:", error);

    // Create a meaningful error message
    const getErrorMessage = (error: Error) => {
      // Handle common error types
      if (error.message.includes("UNAUTHORIZED")) {
        return "You need to sign in to access this resource.";
      }
      if (error.message.includes("FORBIDDEN")) {
        return "You don't have permission to access this resource.";
      }
      if (error.message.includes("NOT_FOUND")) {
        return "The requested resource could not be found.";
      }
      if (error.message.includes("CONFLICT")) {
        return "There was a conflict with your request. Please try again.";
      }
      if (error.message.includes("INTERNAL_SERVER_ERROR")) {
        return "Something went wrong on our end. Please try again later.";
      }
      if (error.message.includes("BAD_REQUEST")) {
        return "There was an issue with your request. Please check your input.";
      }
      if (error.message.includes("TIMEOUT")) {
        return "The request timed out. Please check your connection and try again.";
      }
      if (error.message.includes("Failed to fetch")) {
        return "Network error. Please check your internet connection.";
      }

      // Return a sanitized version of the original error message
      return error.message || "An unexpected error occurred.";
    };

    const errorMessage = getErrorMessage(error);

    // Show error toast with action buttons
    toast.error(errorMessage, {
      description: error.digest
        ? `Error ID: ${error.digest}`
        : "Please try refreshing the page or contact support if the issue persists.",
      duration: 10000, // 10 seconds
      action: {
        label: "Retry",
        onClick: () => reset(),
      },
    });
  }, [error, reset]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="text-muted-foreground max-w-md">
          We encountered an unexpected error. Don't worry, our team has been
          notified and we're working to fix it.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/80 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={reset} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
