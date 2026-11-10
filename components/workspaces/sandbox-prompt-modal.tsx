"use client";

import { Button } from "@heroui/react";
import { createDemoSandbox } from "@/app/actions/auth";

export function SandboxPromptModal({
  isOpen,
  onClose,
  title = "Showcase Workspace is Protected",
  description = "The Tech Society organization is a read-only showcase template so every campus evaluator explores a pristine, populated environment.",
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sandbox-prompt-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-outline-variant/60 bg-surface-lowest p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Top Icon + Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-warning-container text-warning flex items-center justify-center shrink-0 border border-warning/30 shadow-xs">
            <span className="material-symbols-outlined text-[26px]">
              lock_reset
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container text-label-sm font-semibold border border-secondary/25">
            <span className="material-symbols-outlined text-[13px] text-secondary">
              science
            </span>
            <span>Private Sandbox Feature</span>
          </div>
          <h3
            id="sandbox-prompt-title"
            className="text-headline-md font-bold text-on-surface tracking-tight"
          >
            {title}
          </h3>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            {description}
          </p>
        </div>

        {/* Value Callout Box */}
        <div className="rounded-2xl border border-outline-variant/45 bg-surface-low p-4 space-y-2.5 text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-2 text-on-surface font-semibold text-label-md">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              check_circle
            </span>
            <span>What happens in your private sandbox:</span>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-xs leading-relaxed text-on-surface-variant">
            <li>Clones all baseline events, tiers, and 12 products automatically.</li>
            <li>Full edit access: drag-and-drop in Bryntum, edit prices in AG Grid.</li>
            <li>Isolated public storefront (<code className="font-mono text-[11px] bg-surface-lowest px-1 rounded">/demo?org=sandbox-...</code>).</li>
            <li>Zero risk of overwriting or corrupting shared demo data.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onPress={onClose}
            className="w-full sm:w-auto h-11 rounded-full px-5 text-label-md font-semibold text-on-surface-variant hover:text-on-surface"
          >
            Keep Exploring Showcase
          </Button>

          <form action={createDemoSandbox} className="w-full sm:w-auto">
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto h-11 rounded-full px-6 text-label-md font-bold shadow-xs flex items-center justify-center gap-2 bg-primary text-on-primary hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">
                rocket_launch
              </span>
              <span>Launch Private Sandbox</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
