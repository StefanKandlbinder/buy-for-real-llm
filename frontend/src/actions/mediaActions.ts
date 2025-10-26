"use server";

import { pinata } from "@/lib/config";
import { api } from "@/trpc/server/server";
import { revalidateMedia } from "./revalidate";

export async function uploadMediaAction(formData: FormData) {
  const file = formData.get("file") as File;
  const thumbnail = formData.get("thumbnail") as File | null;
  const groupId = Number(formData.get("groupId"));
  const label = formData.get("label") as string;
  const description = formData.get("description") as string;
  const isActiveRaw = formData.get("isActive");
  const isActive =
    isActiveRaw === null ? true : String(isActiveRaw) !== "false";

  // Get dimensions from form data (extracted on client side)
  const width = formData.get("width")
    ? Number(formData.get("width"))
    : undefined;
  const height = formData.get("height")
    ? Number(formData.get("height"))
    : undefined;

  // Get file size from form data
  const fileSize = formData.get("fileSize")
    ? Number(formData.get("fileSize"))
    : undefined;

  if (!file || !groupId) {
    return { error: "File and group ID are required." };
  }

  // Unified size limit in MB across client and server (default 50MB)
  const maxSizeMB = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "50");
  const maxSizeInBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      error: `File size exceeds the ${maxSizeMB}MB limit. Your file is ${Math.round(
        file.size / (1024 * 1024)
      )}MB.`,
    };
  }

  // Determine media type based on file type
  const isVideo = file.type.startsWith("video/");
  const mediaType = isVideo ? "video" : "image";

  try {
    // Upload main file
    const { cid, id } = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(cid);

    // Upload thumbnail if available (for videos)
    let thumbnailId: string | undefined;
    let thumbnailUrl: string | undefined;
    if (thumbnail && isVideo) {
      try {
        const { id: thumbId, cid: thumbCid } = await pinata.upload.public.file(
          thumbnail
        );
        thumbnailId = thumbId;
        // Convert thumbnail CID to gateway URL
        thumbnailUrl = await pinata.gateways.public.convert(thumbCid);
      } catch (thumbError) {
        console.error("Failed to upload thumbnail:", thumbError);
        // Continue without thumbnail if upload fails
      }
    }

    const newMedia = await api.media.createImage({
      id: id,
      url,
      label,
      description,
      groupId,
      mediaType,
      width,
      height,
      fileSize,
      isActive,
      thumbnailId,
      thumbnailUrl,
    });

    // Revalidate all media-related data
    await revalidateMedia();

    return newMedia;
  } catch (error) {
    console.error("Upload failed", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Upload failed: ${message}` };
  }
}
