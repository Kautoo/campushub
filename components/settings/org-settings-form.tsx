"use client";

import { useActionState } from "react";
import { Button } from "@heroui/react";
import {
  updateOrgSettings,
  resetDemoCatalog,
  type SettingsState,
} from "@/app/actions/settings";
import { useState, useTransition } from "react";
import { SectionHeader } from "@/components/ui/primitives";

export type OrgRow = {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  settings: Record<string, unknown> | null;
};

export function OrgSettingsForm({ org }: { org: OrgRow }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateOrgSettings,
    null,
  );
  const [resetPending, startReset] = useTransition();
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const gateways = (org.settings?.gateways ?? {}) as {
    paypal?: boolean;
  };

  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <SectionHeader
        icon="tune"
        title="Organization profile"
        subtitle="Name, description, currency, and payment gateway"
      />
      <form action={action} className="mt-6 grid gap-space-md md:grid-cols-2">
        <label className="block">
          <span className="font-label-md text-label-md text-on-surface">Name</span>
          <input
            name="name"
            required
            defaultValue={org.name}
            className="focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-lowest px-space-md font-body-md text-body-md text-on-surface outline-none"
          />
        </label>
        <label className="block">
          <span className="font-label-md text-label-md text-on-surface">Currency</span>
          <select
            name="currency"
            defaultValue={org.currency}
            className="focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-lowest px-space-md font-body-md text-body-md text-on-surface"
          >
            <option value="MYR">MYR — Malaysian Ringgit</option>
            <option value="USD">USD — US Dollar</option>
            <option value="SGD">SGD — Singapore Dollar</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="font-label-md text-label-md text-on-surface">Description</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={org.description ?? ""}
            className="focus-aura mt-1 w-full rounded-lg border border-outline-variant bg-surface-lowest px-space-md py-3 font-body-md text-body-md text-on-surface outline-none"
          />
        </label>

        {/* Stitch toggle rows — wired to updateOrgSettings gateway fields */}
        <div className="md:col-span-2 flex flex-col divide-y divide-outline-variant rounded-xl border border-outline-variant">
          <label className="flex items-center justify-between gap-space-md px-space-md py-space-md cursor-pointer">
            <span className="flex flex-col">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                PayPal gateway
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Enable PayPal checkout on the storefront
              </span>
            </span>
            <input
              type="checkbox"
              name="paypal_gateway"
              defaultChecked={gateways.paypal ?? false}
              className="h-5 w-5 accent-[var(--st-secondary)]"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 md:col-span-2">
          <Button
            type="submit"
            variant="primary"
            isDisabled={pending}
            className="h-11 rounded-full px-6 text-label-lg"
          >
            {pending ? "Saving…" : "Save settings"}
          </Button>
          {state?.ok ? (
            <p className="text-body-sm text-success">{state.ok}</p>
          ) : null}
          {state?.error ? (
            <p className="text-body-sm text-error">{state.error}</p>
          ) : null}
        </div>

        <div className="md:col-span-2 pt-5 border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-body-md font-bold text-on-surface">
              Demo Catalog Recovery Tool
            </h4>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Restores all products and events to active publication status if modified during public evaluations.
            </p>
            {resetMsg ? (
              <p className="text-xs text-success font-semibold mt-1">{resetMsg}</p>
            ) : null}
          </div>
          <button
            type="button"
            disabled={resetPending}
            onClick={() => {
              startReset(async () => {
                const res = await resetDemoCatalog();
                setResetMsg(res?.ok ?? res?.error ?? "Catalog refreshed.");
                setTimeout(() => setResetMsg(null), 4000);
              });
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-lowest px-3.5 text-label-sm font-semibold text-on-surface hover:bg-surface-low transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              restore
            </span>
            <span>{resetPending ? "Restoring…" : "Restore Demo Catalog"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
