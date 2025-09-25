"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

/** tiny util so we don't depend on "@/lib/utils" */
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

export function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <RadixDialog.Portal>{children}</RadixDialog.Portal>;
}

export const DialogClose = RadixDialog.Close;

export function DialogOverlay(props: React.ComponentPropsWithoutRef<"div">) {
  return (
    <RadixDialog.Overlay
      {...props}
      className={cn(
        "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm",
        props.className
      )}
    />
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <RadixDialog.Content
        {...props}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2",
          "rounded-xl border border-white/10 bg-[#101010] p-4 text-neutral-100 shadow-xl",
          "focus:outline-none",
          className
        )}
      >
        {children}
      </RadixDialog.Content>
    </DialogPortal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("mb-3 flex flex-col space-y-1 text-left", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("mt-4 flex items-center justify-end gap-2", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h3">) {
  return (
    <RadixDialog.Title
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <RadixDialog.Description
      className={cn("text-sm text-neutral-400", className)}
      {...props}
    />
  );
}
