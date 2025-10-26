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
export async function getMediaDimensions(
  file: File
): Promise<MediaDimensions | null> {
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

/**
 * Extract the first frame from a video file and convert it to an image
 * @param videoFile The video file to extract the thumbnail from
 * @returns A File object containing the thumbnail image, or null if extraction fails
 */
export async function extractVideoThumbnail(
  videoFile: File
): Promise<File | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(null);
      return;
    }

    video.crossOrigin = "anonymous";
    video.preload = "auto";
    video.muted = true; // prevent autoplay issues

    const timeout = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 10000);

    const cleanup = () => {
      clearTimeout(timeout);
      video.remove();
      URL.revokeObjectURL(video.src);
    };

    const captureFrame = () => {
      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (canvas.width === 0 || canvas.height === 0) {
          cleanup();
          resolve(null);
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) {
              const baseName = videoFile.name.replace(/\.[^/.]+$/, "");
              const thumbnailFile = new File([blob], `${baseName}_thumb.jpg`, {
                type: "image/jpeg",
              });
              resolve(thumbnailFile);
            } else {
              resolve(null);
            }
          },
          "image/jpeg",
          0.8
        );
      } catch (err) {
        console.error("Error capturing video frame:", err);
        cleanup();
        resolve(null);
      }
    };

    video.addEventListener(
      "loadeddata",
      () => {
        // Ensure the first frame is available
        video.currentTime = 0;
        requestAnimationFrame(captureFrame);
      },
      { once: true }
    );

    video.addEventListener(
      "error",
      () => {
        console.error("Error loading video for thumbnail extraction");
        cleanup();
        resolve(null);
      },
      { once: true }
    );

    const url = URL.createObjectURL(videoFile);
    video.src = url;
    video.load();
  });
}

/**
 * Resize image data to maximum 768px while maintaining aspect ratio
 */
function resizeImageData(
  imageData: HTMLCanvasElement,
  maxSize: number = 1000
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return imageData.toDataURL("image/jpeg", 0.9);
  }

  let { width, height } = imageData;

  // Calculate new dimensions maintaining aspect ratio
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(imageData, 0, 0, width, height);

  console.info("Resized image: ", width, height);

  return canvas.toDataURL("image/jpeg", 0.9);
}

/**
 * Capture the current frame from a video element and return as base64 (resized to max 768px)
 */
export function captureVideoFrame(
  videoElement: HTMLVideoElement
): string | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  if (canvas.width === 0 || canvas.height === 0) return null;

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  try {
    return resizeImageData(canvas);
  } catch (error) {
    if (error instanceof DOMException && error.name === "SecurityError") {
      throw new Error(
        "Cannot capture video frame: Video source must have CORS enabled. Try hosting the video on a CORS-enabled server."
      );
    }
    throw error;
  }
}

/**
 * Convert an image URL to base64 (resized to max 768px)
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        // Resize the image data
        try {
          const resizedBase64 = resizeImageData(canvas);
          resolve(resizedBase64);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () =>
        reject(new Error("Failed to load image for resizing"));

      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Cannot access image: Image source must have CORS enabled."
      );
    }
    throw error;
  }
}

export type DetectedObject = {
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
};
