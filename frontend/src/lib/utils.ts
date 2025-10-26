import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the object detection API base URL from environment variables
 * Falls back to localhost:8000 if not configured
 */
export function getDetectionApiUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  return (
    process.env.NEXT_PUBLIC_OBJECT_DETECTION_API_URL || "http://localhost:8000"
  );
}
