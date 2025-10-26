"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Download,
  Edit,
  Trash2,
  ExternalLink,
  Play,
  ToggleLeft,
  ToggleRight,
  Eye,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatFileSize } from "@/lib/formatting";
import { useConfirm } from "@/shared/components/ConfirmDialog";
import { useMedia } from "@/features/media/hooks/useMedia";
import { PreviewDialog } from "@/features/media/components/PreviewDialog";

type MediaCardProps = {
  media: {
    id: string;
    url: string;
    label?: string;
    description?: string;
    mediaType?: string;
    isActive?: boolean;
    width?: number | undefined;
    height?: number | undefined;
    fileSize?: number | undefined;
    thumbnailId?: string; // IPFS ID of video thumbnail
    thumbnailUrl?: string; // Gateway URL of video thumbnail
  };
  onDownload?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewOnIPFS?: () => void;
};

export function MediaCard({
  media,
  onDownload,
  onEdit,
  onDelete,
  onViewOnIPFS,
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const confirm = useConfirm();
  const { updateMutation } = useMedia();

  // Use the mediaType from the database, with fallback to URL detection
  const isVideoFile =
    media.mediaType === "video" ||
    (() => {
      const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
      const lowerUrl = media.url.toLowerCase();
      return videoExtensions.some((ext) => lowerUrl.includes(ext));
    })();

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement("a");
      link.href = media.url;
      link.download = media.label || "download";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewOnIPFS = () => {
    if (onViewOnIPFS) {
      onViewOnIPFS();
    } else {
      window.open(media.url, "_blank");
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete "${media.label || "this media"}"?`,
      description: "This action cannot be undone.",
      confirmText: "Delete",
      destructive: true,
    });
    if (ok) onDelete?.();
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent>
        {/* Media Preview */}
        <div
          className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setPreviewOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Open media preview"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setPreviewOpen(true);
            }
          }}
        >
          {isVideoFile ? (
            // Video display - show thumbnail if available
            media.thumbnailId ? (
              // Display thumbnail image
              <>
                {!imageError ? (
                  <Image
                    src={media.thumbnailUrl || ""}
                    alt={`${media.label || "Media"} thumbnail`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Play className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <Play className="h-6 w-6 text-white opacity-40" />
                </div>
              </>
            ) : (
              // Fallback: show play icon
              <div className="w-full h-full relative flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20" />
                <Play className="h-12 w-12 text-white z-10" />
              </div>
            )
          ) : (
            // Image display
            <>
              {!imageError ? (
                <Image
                  src={media.url}
                  alt={media.label || "Media"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Image not available</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Media Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-sm font-medium truncate">
                    {media.label || "Untitled"}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{media.label || "Untitled"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPreviewOpen(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewOnIPFS}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on IPFS
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateMutation.mutate({
                      id: media.id,
                      isActive: !(media.isActive ?? true),
                    })
                  }
                >
                  {media.isActive === false ? (
                    <>
                      <ToggleRight className="h-4 w-4 mr-2" /> Activate
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-2" /> Deactivate
                    </>
                  )}
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {media.description && (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-gray-500 truncate">
                  {media.description}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{media.description}</p>
              </TooltipContent>
            </Tooltip>
          )}

          <div className="flex justify-between flex-col gap-3">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {isVideoFile ? "Video" : "Image"}
              </Badge>
              {media.isActive === false && (
                <Badge variant="destructive" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>

            {/* Display dimensions and file size if available */}
            <div className="text-xs  space-y-1">
              {media.width && media.height && (
                <div>
                  {media.width} × {media.height}
                </div>
              )}
              {media.fileSize && <div>{formatFileSize(media.fileSize)}</div>}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Preview Dialog */}
      <PreviewDialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        media={media}
        isVideoFile={isVideoFile}
        imageError={imageError}
        videoError={videoError}
        onImageError={() => setImageError(true)}
        onVideoError={() => setVideoError(true)}
        onDownload={handleDownload}
        onViewOnIPFS={handleViewOnIPFS}
      />
    </Card>
  );
}
