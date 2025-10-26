"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  ExternalLink,
  Play,
  Wand2,
  Loader2,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getDetectionColor } from "@/lib/detection-colors";
import { formatFileSize } from "@/lib/formatting";
import {
  captureVideoFrame,
  imageUrlToBase64,
  DetectedObject,
} from "@/lib/image-utils";
import { ObjectDetectionOverlay } from "./ObjectDetectionOverlay";
import { useDetectObjects } from "../hooks/useDetectObjects";
import { toast } from "sonner";

type PreviewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  media: {
    id: string;
    url: string;
    label?: string;
    description?: string;
    mediaType?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    thumbnailUrl?: string;
  };
  isVideoFile: boolean;
  imageError: boolean;
  videoError: boolean;
  onImageError?: () => void;
  onVideoError?: () => void;
  onDownload: () => void;
  onViewOnIPFS: () => void;
};

export function PreviewDialog({
  isOpen,
  onClose,
  media,
  isVideoFile,
  imageError,
  videoError,
  onImageError,
  onVideoError,
  onDownload,
  onViewOnIPFS,
}: PreviewDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [mediaDimensions, setMediaDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [visibleObjects, setVisibleObjects] = useState<string[]>([]);
  const [debugBase64, setDebugBase64] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const clearDetections = () => {
    setDetectedObjects([]);
    setVisibleObjects([]);
    setShowDebug(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setDetectedObjects([]);
      setVisibleObjects([]);
      setMediaDimensions({ width: 0, height: 0 });
      setDebugBase64(null);
      setShowDebug(false);
    }
  }, [isOpen]);

  const detectMutation = useDetectObjects();

  const handleScan = async () => {
    try {
      let imageBase64: string;

      if (isVideoFile && videoRef.current) {
        const video = videoRef.current;
        try {
          // Pause playback to ensure a stable frame
          video.pause();
        } catch {}

        // Ensure metadata is loaded so dimensions are available
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          await new Promise<void>((resolve) => {
            const onLoaded = () => resolve();
            video.addEventListener("loadeddata", onLoaded, { once: true });
          });
        }

        // Wait one animation frame to guarantee paint is updated after pause
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve())
        );

        const frame = captureVideoFrame(video);
        if (!frame) {
          throw new Error("Failed to capture video frame");
        }
        imageBase64 = frame;
        setMediaDimensions({
          width: video.videoWidth,
          height: video.videoHeight,
        });
      } else if (imageRef.current) {
        imageBase64 = await imageUrlToBase64(media.url);
        setMediaDimensions({
          width: imageRef.current.width,
          height: imageRef.current.height,
        });
      } else {
        throw new Error("No media element available");
      }

      // Store for debug overlay
      setDebugBase64(imageBase64);
      setShowDebug(false);

      setDetectedObjects([]);

      detectMutation.mutate(imageBase64, {
        onSuccess: (objects) => {
          setDetectedObjects(objects);
          // Initialize all objects as visible
          setVisibleObjects(objects.map((_, idx) => idx.toString()));

          if (objects.length === 0) {
            toast.info("No objects detected in the image");
          } else {
            toast.success(`Detected ${objects.length} object(s)`);
          }
        },
        onError: (error) => {
          let errorMessage = "Detection failed";

          if (error instanceof Error) {
            errorMessage = error.message;
            // Special handling for CORS errors
            if (
              errorMessage.includes("CORS") ||
              errorMessage.includes("SecurityError") ||
              errorMessage.includes("Tainted")
            ) {
              errorMessage =
                "Cannot scan this media. The media source doesn't allow canvas capture. Try downloading the file to your device and re-uploading it.";
            }
          }

          toast.error(errorMessage);
          setDetectedObjects([]);
        },
      });
    } catch (error) {
      console.error("Object detection error:", error);
      let errorMessage = "Detection failed";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setDetectedObjects([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{media.label || "Media Preview"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Media Container */}
          <div className="flex items-center justify-center">
            {isVideoFile ? (
              <div className="w-full relative">
                {!videoError ? (
                  <>
                    <video
                      ref={videoRef}
                      src={media.url}
                      className="w-full h-auto max-h-[60vh] rounded-lg"
                      controls
                      poster={media.thumbnailUrl}
                      crossOrigin="anonymous"
                      onError={() => onVideoError?.()}
                      onSeeking={clearDetections}
                      onSeeked={clearDetections}
                      onPlay={clearDetections}
                      width={media.width}
                      height={media.height}
                    />
                    {debugBase64 && (
                      <div className="absolute top-2 right-2 z-30 pointer-events-auto flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setShowDebug((v) => !v)}
                          title={
                            showDebug
                              ? "Hide debug overlay"
                              : "Show debug overlay"
                          }
                        >
                          {showDebug ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                    {showDebug && debugBase64 && (
                      <div className="absolute inset-0 z-20">
                        <div className="absolute inset-0 bg-black/50 rounded-lg" />
                        <Image
                          src={debugBase64}
                          alt="Debug image"
                          fill
                          className="absolute inset-0 w-full h-full object-contain rounded-lg hue-rotate-180"
                        />
                      </div>
                    )}
                    {detectedObjects.length > 0 &&
                      mediaDimensions.width > 0 && (
                        <ObjectDetectionOverlay
                          objects={detectedObjects}
                          visibleObjects={visibleObjects}
                        />
                      )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 bg-gray-200">
                    <Play className="h-16 w-16 text-gray-400 mb-2" />
                    <p className="text-gray-500">Video not available</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full flex items-center justify-center relative">
                {!imageError ? (
                  <>
                    <Image
                      ref={imageRef}
                      src={media.url}
                      alt={media.label || "Media preview"}
                      width={media.width}
                      height={media.height}
                      className="rounded-lg"
                      crossOrigin="anonymous"
                      onError={() => onImageError?.()}
                    />
                    {debugBase64 && (
                      <div className="absolute top-2 right-2 z-30 pointer-events-auto flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setShowDebug((v) => !v)}
                          title={
                            showDebug
                              ? "Hide debug overlay"
                              : "Show debug overlay"
                          }
                        >
                          {showDebug ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                    {showDebug && debugBase64 && (
                      <div className="absolute inset-0 z-20">
                        <div className="absolute inset-0 bg-black/50 rounded-lg" />
                        <Image
                          src={debugBase64}
                          alt="Debug base64"
                          fill
                          className="absolute inset-0 w-full h-full object-contain rounded-lg hue-rotate-180"
                        />
                      </div>
                    )}
                    {detectedObjects.length > 0 &&
                      mediaDimensions.width > 0 && (
                        <ObjectDetectionOverlay
                          objects={detectedObjects}
                          visibleObjects={visibleObjects}
                        />
                      )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 bg-gray-200">
                    <ExternalLink className="h-16 w-16 text-gray-400 mb-2" />
                    <p className="text-gray-500">Image not available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-sm">
            {media.description && (
              <div>
                <p className="font-semibold ">Description</p>
                <p className="">{media.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold ">Type</p>
                <p className="">{isVideoFile ? "Video" : "Image"}</p>
              </div>

              {media.width && media.height && (
                <div>
                  <p className="font-semibold">Dimensions</p>
                  <p className="">
                    {media.width} × {media.height}
                  </p>
                </div>
              )}

              {media.fileSize && (
                <div>
                  <p className="font-semibold">File Size</p>
                  <p className="">{formatFileSize(media.fileSize)}</p>
                </div>
              )}

              <div>
                <p className="font-semibold ">IPFS ID</p>
                <p className="truncate font-mono text-xs">{media.id}</p>
              </div>
            </div>

            {detectedObjects.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold">
                  Detected Objects ({detectedObjects.length})
                </p>
                <ToggleGroup
                  type="multiple"
                  value={visibleObjects}
                  onValueChange={setVisibleObjects}
                  spacing={2}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  {detectedObjects.map((obj, idx) => {
                    const isVisible = visibleObjects.includes(idx.toString());
                    const color = getDetectionColor(idx);
                    return (
                      <ToggleGroupItem
                        key={idx}
                        value={idx.toString()}
                        aria-label={`Toggle object ${obj.label}`}
                        className="text-xs px-2.5 py-0.5"
                        style={{
                          backgroundColor: isVisible ? color : undefined,
                          borderColor: !isVisible ? color : undefined,
                          color: isVisible ? "#ffffff" : color,
                        }}
                      >
                        {isVisible ? (
                          <Check className="h-3.5 w-3.5 mr-1" />
                        ) : (
                          <Check className="h-3.5 w-3.5 mr-1" />
                        )}
                        {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
                      </ToggleGroupItem>
                    );
                  })}
                </ToggleGroup>
              </div>
            )}
          </div>

          {/* Dialog Actions */}
          <div className="flex gap-2 pt-4 border-t flex-wrap">
            <Button
              variant="default"
              size="sm"
              onClick={handleScan}
              disabled={detectMutation.isPending || imageError || videoError}
            >
              {detectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Scan
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={onViewOnIPFS}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View on IPFS
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
