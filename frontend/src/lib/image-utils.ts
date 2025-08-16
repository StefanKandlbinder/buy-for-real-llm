/**
 * Utility functions for extracting image and video dimensions
 */

export interface MediaDimensions {
  width: number;
  height: number;
}

/**
 * Extract dimensions from an image file
 */
export function getImageDimensions(file: File): Promise<MediaDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image for dimension extraction"));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Extract dimensions from a video file
 */
export function getVideoDimensions(file: File): Promise<MediaDimensions> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
      });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      reject(new Error("Failed to load video for dimension extraction"));
    };
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Extract dimensions from any media file (image or video)
 */
export async function getMediaDimensions(file: File): Promise<MediaDimensions | null> {
  try {
    if (file.type.startsWith("image/")) {
      return await getImageDimensions(file);
    } else if (file.type.startsWith("video/")) {
      return await getVideoDimensions(file);
    }
    return null;
  } catch (error) {
    console.warn("Failed to extract dimensions:", error);
    return null;
  }
}
