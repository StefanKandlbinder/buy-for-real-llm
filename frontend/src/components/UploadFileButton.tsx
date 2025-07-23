"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useUploadFile } from "@/hooks/file/useUploadFile";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

export default function UploadFileButton({ group }: { group: NestedGroup }) {
  const [file, setFile] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploading, reset } = useUploadFile();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target?.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    reset(); // Clear any previous errors

    // Auto-upload when file is selected
    await uploadFile(selectedFile, group);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        onClick={handleButtonClick}
        disabled={uploading}
        className="w-full"
        variant="outline"
        size="sm"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </>
        )}
      </Button>
    </div>
  );
}
