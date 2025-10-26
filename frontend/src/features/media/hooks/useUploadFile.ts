"use client";

import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { useState } from "react";
import { useMedia } from "./useMedia";
import { getMediaDimensions, extractVideoThumbnail } from "@/lib/image-utils";

export function useUploadFile() {
  const { createMutation } = useMedia();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Unified size limit in MB across client and server (default 50MB)
  const maxFileSizeMB = parseInt(
    process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "50"
  );
  const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSizeBytes) {
      return `File size exceeds the ${maxFileSizeMB}MB limit. Your file is ${Math.round(
        file.size / (1024 * 1024)
      )}MB.`;
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

    // Extract dimensions from the file
    const dimensions = await getMediaDimensions(file);

    const isVideo = file.type.startsWith("video/");
    let thumbnailFile: File | null = null;

    // Generate thumbnail for videos
    if (isVideo) {
      thumbnailFile = await extractVideoThumbnail(file);
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("groupId", String(group.id));
    formData.set("label", label || file.name);
    formData.set("description", description || "");
    formData.set("isActive", String(isActive));

    // Add thumbnail to form data if available
    if (thumbnailFile) {
      formData.set("thumbnail", thumbnailFile);
    }

    // Add dimensions to form data if available
    if (dimensions) {
      formData.set("width", String(dimensions.width));
      formData.set("height", String(dimensions.height));
    }

    // Add file size to form data
    formData.set("fileSize", String(file.size));

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
    maxFileSizeMB,
  };
}
