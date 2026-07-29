/**
 * ConfirmDialog — reusable destructive-action confirmation modal.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={open}
 *     title="Delete Dataset?"
 *     description="This action cannot be undone after the undo period expires."
 *     confirmLabel="Delete"
 *     onConfirm={handleDelete}
 *     onCancel={() => setOpen(false)}
 *   />
 */

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description = "This action cannot be undone after the undo period expires.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <AlertDialog.Portal>
        {/* Overlay */}
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content */}
        <AlertDialog.Content
          className={cn(
            "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          )}
        >
          <AlertDialog.Title className="text-base font-semibold text-foreground">
            {title}
          </AlertDialog.Title>

          {description && (
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              {description}
            </AlertDialog.Description>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <AlertDialog.Cancel asChild>
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-colors"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
