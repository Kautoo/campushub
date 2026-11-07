"use client";

import { useActionState } from "react";
import { Button } from "@heroui/react";
import {
  updateOrgSettings,
  type SettingsState,
} from "@/app/actions/settings";
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
  const gateways = (org.settings?.gateways ?? {}) as {
    paypal?: boolean;
  };

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-lowest p-6">
      <SectionHeader
        icon="tune"
        title="Organization profile"
        subtitle="Name, description, currency, and payment gateway"
      />
      <form action={action} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-label-md text-ink">Name</span>
          <input
            name="name"
            required
            defaultValue={org.name}
            className="focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-low px-4 text-body-md text-ink outline-none"
          />
        </label>
        <label className="block">
          <span className="text-label-md text-ink">Currency</span>
          <select
            name="currency"
            defaultValue={org.currency}
            className="focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-low px-4 text-body-md text-ink"
          >
            <option value="MYR">MYR — Malaysian Ringgit</option>
            <option value="USD">USD — US Dollar</option>
            <option value="SGD">SGD — Singapore Dollar</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-label-md text-ink">Description</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={org.description ?? ""}
            className="focus-aura mt-1 w-full rounded-lg border border-outline-variant bg-surface-low px-4 py-3 text-body-md text-ink outline-none"
          />
        </label>
        <label className="flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            name="paypal_gateway"
            defaultChecked={gateways.paypal ?? false}
            className="h-4 w-4 accent-[var(--st-primary)]"
          />
          <span className="text-body-md text-ink">
            Enable PayPal gateway on storefront checkout
          </span>
        </label>

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
      </form>
    </section>
  );
}
