"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { useUploadFile } from "@/hooks/file/useUploadFile";
import { Loader2, Upload } from "lucide-react";

const addFileSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, { message: "File is required" }),
  label: z.string().optional(),
  description: z.string().optional(),
});

type AddFileDialogProps = {
  group: NestedGroup;
  triggerButton?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AddFileDialog({
  group,
  triggerButton,
  open,
  onOpenChange,
}: AddFileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const controlledOpen = open !== undefined ? open : isOpen;
  const controlledSetOpen = onOpenChange || setIsOpen;
  const [fileValidationError, setFileValidationError] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading, error, reset, validateFile, maxFileSizeKB } =
    useUploadFile();

  const form = useForm<z.infer<typeof addFileSchema>>({
    resolver: zodResolver(addFileSchema),
    defaultValues: {
      file: undefined,
      label: undefined,
      description: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof addFileSchema>) => {
    if (!values.file) return;

    // Clear any previous validation errors
    setFileValidationError(null);

    try {
      reset();
      await uploadFile(values.file, group, values.label, values.description);
      setIsOpen(false);
      form.reset();
    } catch {
      // error handled in hook
    }
  };

  const handleFileChange = (file: File | undefined) => {
    if (file) {
      const validationError = validateFile(file);
      setFileValidationError(validationError);
    } else {
      setFileValidationError(null);
    }
  };

  return (
    <Dialog
      open={controlledOpen}
      onOpenChange={(open) => {
        controlledSetOpen(open);
        if (!open) {
          form.reset();
          reset();
          setFileValidationError(null);
        }
      }}
    >
      {!open && (
        <DialogTrigger asChild>
          {triggerButton || (
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Select a file (max {maxFileSizeKB}KB) and optionally provide a label
            and description.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                        handleFileChange(file);
                      }}
                    />
                  </FormControl>
                  {fileValidationError && (
                    <p className="text-destructive text-sm mt-1">
                      {fileValidationError}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Beach Sunset" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Taken in Hawaii, 2023"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={uploading || !!fileValidationError}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </DialogFooter>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddFileDialog;
