import { type CSSProperties } from "react";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster({ theme = "system", ...props }: ToasterProps) {
  return (
    <SonnerToaster
      theme={theme}
      data-slot="toaster"
      className="toaster group font-sans"
      style={
        {
          "--normal-bg": "var(--color-popover)",
          "--normal-text": "var(--color-popover-foreground)",
          "--normal-border": "var(--color-border)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-md border border-border bg-popover text-popover-foreground shadow-md",
          description: "text-muted-foreground",
          actionButton:
            "rounded-md bg-primary px-2 text-primary-foreground text-xs font-medium",
          cancelButton:
            "rounded-md bg-muted px-2 text-muted-foreground text-xs font-medium",
          error: "border-destructive/40",
        },
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
export type { ToasterProps } from "sonner";
