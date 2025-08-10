"use client";

import { useEffect, useState } from "react";
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
import { updateGroupSchema } from "@/trpc/server/routers/groups/validation";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

type TUpdateGroupDialogProps = {
  group: NestedGroup;
  updateGroupMutation: (values: z.infer<typeof updateGroupSchema>) => void;
  triggerButton?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function UpdateGroupDialog({
  group,
  updateGroupMutation,
  triggerButton,
  open,
  onOpenChange,
}: TUpdateGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const controlledOpen = open !== undefined ? open : isOpen;
  const controlledSetOpen = onOpenChange || setIsOpen;

  const nameOnlySchema = z.object({
    name: z
      .string()
      .min(3, { message: "Group name must be at least 3 characters." }),
  });

  const form = useForm<z.infer<typeof nameOnlySchema>>({
    resolver: zodResolver(nameOnlySchema),
    defaultValues: {
      name: group.name,
    },
  });

  useEffect(() => {
    if (controlledOpen) {
      form.reset({ name: group.name });
    }
  }, [controlledOpen, group, form]);

  function onSubmit(values: z.infer<typeof nameOnlySchema>) {
    updateGroupMutation({ id: group.id as number, name: values.name });
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
            Edit the group name. Click save when you&apos;re done.
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
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
