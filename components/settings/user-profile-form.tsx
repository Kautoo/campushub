"use client";

import { useActionState, useState } from "react";
import { Button } from "@heroui/react";
import { updateUserProfile, type SettingsState } from "@/app/actions/settings";
import { Badge } from "@/components/ui/badge";

const PRESET_ICONS = [
  { icon: "person", label: "Default" },
  { icon: "school", label: "Collegiate" },
  { icon: "workspace_premium", label: "Executive" },
  { icon: "shield_person", label: "Admin" },
  { icon: "terminal", label: "Tech" },
  { icon: "palette", label: "Creative" },
  { icon: "sports_esports", label: "Esports" },
  { icon: "bolt", label: "Kinetic" },
];

export function UserProfileForm({
  user,
}: {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateUserProfile,
    null,
  );
  const [selectedIcon, setSelectedIcon] = useState(user.image ?? "person");
  const [name, setName] = useState(user.name ?? "");

  const initials = (name || user.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 pb-4">
        <div>
          <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
            Personal Identity
          </span>
          <h3 className="text-headline-sm font-bold text-on-surface mt-0.5">
            Personal Account &amp; Profile Information
          </h3>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Update your display name and avatar icon across the dashboard workspace.
          </p>
        </div>
        <Badge tone="teal" icon="verified_user">
          Active Session
        </Badge>
      </div>

      <form action={action} className="space-y-6">
        <input type="hidden" name="image" value={selectedIcon} />

        {/* Current Avatar & Name Preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-low/80 border border-outline-variant/40">
          <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-headline-sm shadow-xs shrink-0">
            {selectedIcon && !selectedIcon.startsWith("http") ? (
              <span className="material-symbols-outlined text-[28px]">
                {selectedIcon}
              </span>
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-headline-sm font-bold text-on-surface truncate">
              {name || "Campus Member"}
            </h4>
            <p className="text-body-sm text-on-surface-variant truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Avatar Icon Selector */}
        <div className="space-y-2">
          <label className="text-label-md font-semibold text-on-surface block">
            Choose Profile Avatar Icon:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_ICONS.map((preset) => {
              const isSelected = selectedIcon === preset.icon;
              return (
                <button
                  key={preset.icon}
                  type="button"
                  onClick={() => setSelectedIcon(preset.icon)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-label-sm font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary-fixed/60 text-primary font-bold shadow-2xs ring-1 ring-primary/40"
                      : "border-outline-variant/60 bg-surface-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {preset.icon}
                  </span>
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-label-md font-semibold text-on-surface">
              Display Name
            </span>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Wong"
              className="focus-aura mt-1.5 h-11 w-full rounded-xl border border-outline-variant/70 bg-surface-low px-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest transition-colors"
            />
          </label>

          <label className="block">
            <span className="text-label-md font-semibold text-on-surface">
              Account Email (Read-Only)
            </span>
            <input
              type="email"
              disabled
              value={user.email}
              className="mt-1.5 h-11 w-full rounded-xl border border-outline-variant/40 bg-surface-container px-4 text-body-md text-on-surface-variant/80 cursor-not-allowed outline-none font-mono text-sm"
            />
          </label>
        </div>

        {state?.error ? (
          <div className="rounded-xl border border-error/30 bg-error-container p-3 text-body-sm text-on-error-container flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{state.error}</span>
          </div>
        ) : null}

        {state?.ok ? (
          <div className="rounded-xl border border-success/30 bg-success-container p-3 text-body-sm text-success flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              check_circle
            </span>
            <span>{state.ok}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            isDisabled={pending}
            className="h-11 rounded-full px-7 text-label-md font-semibold shadow-xs"
          >
            {pending ? "Saving Changes…" : "Save Profile Details"}
          </Button>
        </div>
      </form>
    </section>
  );
}
