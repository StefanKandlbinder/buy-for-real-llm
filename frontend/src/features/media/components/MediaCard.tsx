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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfirm } from "@/shared/components/ConfirmDialog";
import { useMedia } from "@/features/media/hooks/useMedia";

type MediaCardProps = {
  media: {
    id: string;
    url: string;
    label?: string;
    description?: string;
    mediaType?: string;
    isActive?: boolean;
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
        <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-gray-100">
          {isVideoFile ? (
            // Video display
            <div className="w-full h-full relative">
              {!videoError ? (
                <video
                  src={media.url}
                  className="w-full h-full object-cover rounded-lg"
                  controls
                  onError={() => setVideoError(true)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Video not available</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Image display
            <>
              {!imageError ? (
                <Image
                  src={media.url}
                  alt={media.label || "Media"}
                  fill
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
        </div>
      </CardContent>
    </Card>
  );
}
