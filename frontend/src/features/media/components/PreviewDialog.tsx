"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, ExternalLink, Play } from "lucide-react";

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

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{media.label || "Media Preview"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Media Container */}
          <div className="w-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
            {isVideoFile ? (
              <div className="w-full">
                {!videoError ? (
                  <video
                    src={media.url}
                    className="w-full h-auto max-h-[60vh] object-contain"
                    controls
                    autoPlay
                    poster={media.thumbnailUrl}
                    onError={() => onVideoError?.()}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 bg-gray-200">
                    <Play className="h-16 w-16 text-gray-400 mb-2" />
                    <p className="text-gray-500">Video not available</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full flex items-center justify-center">
                {!imageError ? (
                  <Image
                    src={media.url}
                    alt={media.label || "Media preview"}
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-[60vh] object-contain"
                    onError={() => onImageError?.()}
                  />
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
                <p className="font-semibold text-gray-700">Description</p>
                <p className="text-gray-600">{media.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-700">Type</p>
                <p className="text-gray-600">
                  {isVideoFile ? "Video" : "Image"}
                </p>
              </div>

              {media.width && media.height && (
                <div>
                  <p className="font-semibold text-gray-700">Dimensions</p>
                  <p className="text-gray-600">
                    {media.width} × {media.height}
                  </p>
                </div>
              )}

              {media.fileSize && (
                <div>
                  <p className="font-semibold text-gray-700">File Size</p>
                  <p className="text-gray-600">
                    {formatFileSize(media.fileSize)}
                  </p>
                </div>
              )}

              <div>
                <p className="font-semibold text-gray-700">IPFS ID</p>
                <p className="text-gray-600 truncate font-mono text-xs">
                  {media.id}
                </p>
              </div>
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex gap-2 pt-4 border-t">
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
