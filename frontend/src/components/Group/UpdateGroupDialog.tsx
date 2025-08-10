"use client";

import { useEffect, useMemo, useState } from "react";
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
import { updateGroupSchema } from "@/trpc/server/routers/groups/validation";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

type TUpdateGroupDialogProps = {
  group: NestedGroup;
  allGroups?: NestedGroup[];
  updateGroupMutation: (values: z.infer<typeof updateGroupSchema>) => void;
  triggerButton?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function UpdateGroupDialog({
  group,
  allGroups,
  updateGroupMutation,
  triggerButton,
  open,
  onOpenChange,
}: TUpdateGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const controlledOpen = open !== undefined ? open : isOpen;
  const controlledSetOpen = onOpenChange || setIsOpen;

  const updateSchema = z.object({
    name: z
      .string()
      .min(3, { message: "Group name must be at least 3 characters." }),
    parentId: z.number().nullish().optional(),
  });

  const form = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: group.name,
      parentId: group.parent_id ?? null,
    },
  });

  useEffect(() => {
    if (controlledOpen) {
      form.reset({ name: group.name, parentId: group.parent_id ?? null });
    }
  }, [controlledOpen, group, form]);

  // Compute invalid parent ids: the current group and all its descendants
  const invalidParentIds = useMemo(() => {
    if (!allGroups) return new Set<number>();
    const currentIdString = String(group.id);
    const invalid = new Set<number>([group.id]);
    for (const g of allGroups) {
      const pathParts = String(g.path).split("->");
      if (pathParts.includes(currentIdString)) {
        invalid.add(g.id);
      }
    }
    return invalid;
  }, [allGroups, group.id]);

  function onSubmit(values: z.infer<typeof updateSchema>) {
    updateGroupMutation({
      id: group.id as number,
      name: values.name,
      parentId: values.parentId ?? null,
    });
    controlledSetOpen(false);
  }

  return (
    <Dialog
      open={controlledOpen}
      onOpenChange={(next) => {
        controlledSetOpen(next);
        if (!next) {
          form.reset({ name: group.name });
        }
      }}
    >
      {!open && triggerButton && (
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Group</DialogTitle>
          <DialogDescription>
            Edit the group. Click save when you&apos;re done.
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
                      placeholder="e.g., New name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {allGroups && (
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
                      value={
                        field.value === null || field.value === undefined
                          ? "null"
                          : String(field.value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                        {allGroups
                          .filter((g) => !invalidParentIds.has(g.id))
                          .map((g: NestedGroup) => (
                            <SelectItem key={g.id} value={String(g.id)}>
                              {g.name}
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
