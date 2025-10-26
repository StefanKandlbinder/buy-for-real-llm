"use client";

import { useMutation } from "@tanstack/react-query";
import { DetectedObject } from "@/lib/image-utils";
import { toast } from "sonner";
import { getDetectionApiUrl } from "@/lib/utils";

type DetectionMutationContext = {
  loadingToast: string | number;
};

async function detectObjectsApi(
  imageBase64: string
): Promise<DetectedObject[]> {
  const response = await fetch(getDetectionApiUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3-vl-8b",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              },
            },
            {
              type: "text",
              text: 'Detect all sunglasses in this image and return a JSON array with this format: [{"label": "object_name", "confidence": 0.95, "bbox": [x1, y1, x2, y2]}]. Return normalized bounding boxes in the range of 0 and 1. Return ONLY the JSON array, no other text.',
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: -1,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No response from detection model");
  }

  // Parse the JSON response
  try {
    const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const objects = JSON.parse(jsonStr) as Array<{
      label?: string;
      confidence?: number;
      bbox?: [number, number, number, number];
    }>;

    return Array.isArray(objects)
      ? objects.map((obj) => ({
          label: obj.label ?? "Unknown",
          confidence: obj.confidence ?? 0,
          bbox: obj.bbox ?? [0, 0, 1, 1],
        }))
      : [];
  } catch (error) {
    console.error("Failed to parse detection response:", content, error);
    throw new Error("Failed to parse detection results");
  }
}

export function useDetectedObjects() {
  return useMutation<DetectedObject[], Error, string, DetectionMutationContext>(
    {
      mutationFn: detectObjectsApi,
      onMutate: async () => {
        const loadingToast = toast.loading("Scanning image...");
        return { loadingToast };
      },
      onSuccess: (_data, _variables, context) => {
        if (context?.loadingToast !== undefined) {
          toast.dismiss(context.loadingToast);
        }
      },
      onError: (error, _variables, context) => {
        if (context?.loadingToast !== undefined) {
          toast.error(error.message || "Detection failed", {
            id: context.loadingToast,
          });
        } else {
          toast.error(error.message || "Detection failed");
        }
      },
    }
  );
}

// Backwards-compatible alias (temporary)
export const useDetectObjects = useDetectedObjects;
