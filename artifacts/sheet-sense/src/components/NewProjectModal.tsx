/**
 * NewProjectModal — dialog for creating a named project before entering the workspace.
 *
 * The project is created on the server immediately on submit. On success the
 * user is navigated to /projects/:id where they can upload their first dataset.
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import * as Dialog from "@radix-ui/react-dialog";
import { X, FolderPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/context";
import { apiPost } from "@/lib/api";
import type { ActiveProject } from "@/store/ProjectContext";

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  const { t } = useLocale();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus name field when modal opens
  useEffect(() => {
    if (open) {
      setName("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || creating) return;

    setCreating(true);
    try {
      const project = await apiPost<ActiveProject>("/api/projects", {
        name: trimmed,
      });
      onClose();
      navigate(`/projects/${project.id}`);
    } catch {
      toast.error(t.dashboard.createError);
    } finally {
      setCreating(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open && !creating) onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content
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
          {/* Close button */}
          <Dialog.Close
            disabled={creating}
            className="absolute top-4 end-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            aria-label={t.common.cancel}
          >
            <X className="w-4 h-4" />
          </Dialog.Close>

          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">
                {t.dashboard.createProject}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                {t.dashboard.newProjectSub}
              </Dialog.Description>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="project-name"
                className="text-sm font-medium text-foreground"
              >
                {t.dashboard.projectNameLabel}
                <span className="text-destructive ms-0.5">*</span>
              </label>
              <input
                ref={inputRef}
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.dashboard.projectNamePlaceholder}
                maxLength={100}
                disabled={creating}
                className={cn(
                  "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors",
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={creating}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={!name.trim() || creating}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
                  "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {creating ? t.dashboard.creating : t.dashboard.createProject}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
