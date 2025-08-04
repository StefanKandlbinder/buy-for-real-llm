"use server";

import { pinata } from "@/lib/config";
import { api } from "@/trpc/server/server";
import { revalidateMedia } from "./revalidate";

export async function uploadMediaAction(formData: FormData) {
  const file = formData.get("file") as File;
  const groupId = Number(formData.get("groupId"));
  const label = formData.get("label") as string;
  const description = formData.get("description") as string;

  if (!file || !groupId) {
    return { error: "File and group ID are required." };
  }

  // Check file size limit using environment variable
  const maxSizeKB = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_KB || "300");
  const maxSizeInBytes = maxSizeKB * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      error: `File size exceeds the ${maxSizeKB}KB limit. Your file is ${Math.round(
        file.size / 1024
      )}KB.`,
    };
  }

  try {
    const { cid, id } = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(cid);

    const newMedia = await api.media.createImage({
      id: id,
      url,
      label,
      description,
      groupId,
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
