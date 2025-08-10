"use client";

import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { useState } from "react";
import { useMedia } from "./useMedia";

export function useUploadFile() {
  const { createMutation } = useMedia();
  const [validationError, setValidationError] = useState<string | null>(null);

  // For video uploads, we use a larger default limit
  const maxFileSizeKB = parseInt(
    process.env.NEXT_PUBLIC_MAX_FILE_SIZE_KB || "51200" // 50MB default
  );
  const maxFileSizeBytes = maxFileSizeKB * 1024;

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSizeBytes) {
      return `File size exceeds the ${Math.round(
        maxFileSizeKB / 1024
      )}MB limit. Your file is ${Math.round(file.size / (1024 * 1024))}MB.`;
    }
    return null;
  };

  const uploadFile = async (
    file: File,
    group: NestedGroup,
    label?: string,
    description?: string,
    isActive: boolean = true
  ) => {
    // Client-side validation
    const validationErr = validateFile(file);
    if (validationErr) {
      setValidationError(validationErr);
      throw new Error(validationErr);
    }

    setValidationError(null);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("groupId", String(group.id));
    formData.set("label", label || file.name);
    formData.set("description", description || "");
    formData.set("isActive", String(isActive));

    return createMutation.mutateAsync(formData);
  };

  const reset = () => {
    setValidationError(null);
    createMutation.reset();
  };

  return {
    uploadFile,
    uploading: createMutation.isPending,
    error: createMutation.error?.message || validationError,
    reset,
    validateFile,
    maxFileSizeKB: Math.round(maxFileSizeKB / 1024), // Return in MB for display
  };
}
