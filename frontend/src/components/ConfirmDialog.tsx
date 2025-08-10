"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type ConfirmContextValue = {
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm(): ConfirmContextValue["confirm"] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmDialog");
  }
  return ctx.confirm;
}

export function ConfirmDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | undefined>();

  const reset = () => {
    setOpen(false);
    setOptions(undefined);
    resolverRef.current = null;
  };

  const resolve = useCallback((value: boolean) => {
    if (resolverRef.current) {
      resolverRef.current(value);
    }
    reset();
  }, []);

  const confirm = useCallback((opts?: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolvePromise) => {
      resolverRef.current = resolvePromise;
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const confirmText =
    options?.confirmText ?? (options?.destructive ? "Delete" : "Confirm");
  const cancelText = options?.cancelText ?? "Cancel";
  const title = options?.title ?? "Are you sure?";
  const description = options?.description ?? "This action cannot be undone.";

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={(o) => !o && resolve(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => resolve(false)}>
              {cancelText}
            </Button>
            <Button
              variant={options?.destructive ? "destructive" : "default"}
              onClick={() => resolve(true)}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
