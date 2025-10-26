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
