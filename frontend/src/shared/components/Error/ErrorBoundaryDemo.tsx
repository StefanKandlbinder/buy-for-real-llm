"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ErrorBoundary, {
  useErrorHandler,
} from "@/shared/components/Error/ErrorBoundary";
import { useErrorReporting } from "@/shared/components/Error/ErrorProvider";
import { AlertTriangle, Bug, WifiOff } from "lucide-react";

// Component that intentionally throws an error
function ErrorThrowingComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error("This is a test error thrown by ErrorThrowingComponent!");
  }
  return (
    <div className="text-green-600">✅ Component rendered successfully!</div>
  );
}

export function ErrorBoundaryDemo() {
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const { reportError, reportWarning, reportInfo } = useErrorReporting();
  const manualErrorHandler = useErrorHandler();

  const simulateNetworkError = () => {
    const networkError = new Error("Failed to fetch data from server");
    reportError(networkError, "Network request simulation");
  };

  const simulateValidationError = () => {
    const validationError = new Error("Validation failed: Email is required");
    reportError(validationError, "Form validation");
  };

  const simulateFileUploadError = () => {
    const fileError = new Error("File too large: Maximum size is 10MB");
    reportError(fileError, "File upload attempt");
  };

  const simulateUnauthorizedError = () => {
    const authError = new Error("UNAUTHORIZED: Please sign in to continue");
    reportError(authError, "Protected resource access");
  };

  const testManualErrorHandler = () => {
    const testError = new Error("Manual error handler test");
    manualErrorHandler(testError);
  };

  const showWarning = () => {
    reportWarning("This is a warning message", "Demo warning context");
  };

  const showInfo = () => {
    reportInfo("This is an info message", "Demo info context");
  };

  const simulateAsyncError = async () => {
    try {
      // Simulate an async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Async operation failed")), 1000);
      });
    } catch (error) {
      if (error instanceof Error) {
        reportError(error, "Async operation simulation");
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            ErrorBoundary Demo
          </CardTitle>
          <CardDescription>
            Test different error scenarios and see how the ErrorBoundary handles
            them with toast notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* React Error Boundary Test */}
          <div className="space-y-2">
            <h3 className="font-semibold">React Error Boundary Test</h3>
            <p className="text-sm text-muted-foreground">
              This tests React component errors that get caught by the
              ErrorBoundary.
            </p>
            <ErrorBoundary>
              <div className="p-4 border rounded-lg">
                <ErrorThrowingComponent shouldError={shouldThrowError} />
              </div>
            </ErrorBoundary>
            <Button
              onClick={() => setShouldThrowError(!shouldThrowError)}
              variant={shouldThrowError ? "destructive" : "default"}
            >
              {shouldThrowError ? "Fix Component" : "Break Component"}
            </Button>
          </div>

          {/* Manual Error Reporting Tests */}
          <div className="space-y-2">
            <h3 className="font-semibold">Manual Error Reporting</h3>
            <p className="text-sm text-muted-foreground">
              Test different types of errors with contextual toast messages.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={simulateNetworkError}
                variant="outline"
                size="sm"
              >
                <WifiOff className="w-4 h-4 mr-2" />
                Network Error
              </Button>
              <Button
                onClick={simulateValidationError}
                variant="outline"
                size="sm"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Validation Error
              </Button>
              <Button
                onClick={simulateFileUploadError}
                variant="outline"
                size="sm"
              >
                File Upload Error
              </Button>
              <Button
                onClick={simulateUnauthorizedError}
                variant="outline"
                size="sm"
              >
                Auth Error
              </Button>
              <Button
                onClick={testManualErrorHandler}
                variant="outline"
                size="sm"
              >
                Manual Handler
              </Button>
              <Button onClick={simulateAsyncError} variant="outline" size="sm">
                Async Error
              </Button>
            </div>
          </div>

          {/* Other Notification Types */}
          <div className="space-y-2">
            <h3 className="font-semibold">Other Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Test warning and info notifications.
            </p>
            <div className="flex gap-2">
              <Button onClick={showWarning} variant="outline" size="sm">
                Show Warning
              </Button>
              <Button onClick={showInfo} variant="outline" size="sm">
                Show Info
              </Button>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="space-y-2">
            <h3 className="font-semibold">Usage in Your Components</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <code className="block p-2 bg-muted rounded text-xs">
                {`// Import the hook
import { useErrorReporting } from "@/components/ErrorProvider";

// Use in component
const { reportError } = useErrorReporting();

// Report errors with context
try {
  await someOperation();
} catch (error) {
  reportError(error, "Context description");
}`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
