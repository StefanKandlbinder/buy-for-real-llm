"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertGroupSchema } from "@/trpc/server/routers/groups/validation";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

type AddGroupDialogProps = {
  groups: NestedGroup[];
  createGroupMutation: (values: z.infer<typeof insertGroupSchema>) => void;
  triggerButton?: React.ReactNode;
  defaultParentId?: number | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AddGroupDialog({
  groups,
  createGroupMutation,
  triggerButton,
  defaultParentId,
  open,
  onOpenChange,
}: AddGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const controlledOpen = open !== undefined ? open : isOpen;
  const controlledSetOpen = onOpenChange || setIsOpen;

  const form = useForm<z.infer<typeof insertGroupSchema>>({
    resolver: zodResolver(insertGroupSchema),
    defaultValues: {
      parentId: defaultParentId ?? null,
    },
  });

  function onSubmit(values: z.infer<typeof insertGroupSchema>) {
    // Use the defaultParentId if provided, otherwise use the form value
    const parentId =
      defaultParentId !== undefined ? defaultParentId : values.parentId ?? null;
    createGroupMutation({ ...values, parentId });
    controlledSetOpen(false);
    form.reset();
  }

  return (
    <Dialog
      open={controlledOpen}
      onOpenChange={(open) => {
        controlledSetOpen(open);
        if (!open) {
          form.reset();
        }
      }}
    >
      {!open && (
        <DialogTrigger asChild>
          {triggerButton || <Button>Add Group</Button>}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Enter a name for your new group. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Vacation Photos"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {defaultParentId === undefined && (
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Group</FormLabel>
                    <Select
                      onValueChange={(val) =>
                        field.onChange(val === "null" ? null : Number(val))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                        {groups.map((group: NestedGroup) => (
                          <SelectItem key={group.id} value={String(group.id)}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
