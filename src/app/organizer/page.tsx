"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { SpotlightCard, CountUp, FastPassModal } from "@/components/ui/react-bits";
import { CampusGrid } from "@/components/ui/CampusGrid";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { StoredRegistration } from "@/server/db/repository";
import { Order } from "@/types";

export default function OrganizerDashboardPage() {
  const [activeTab, setActiveTab] = useState<"registrations" | "orders">("registrations");

  // Telemetry Metrics State
  const [telemetry, setTelemetry] = useState<{
    totalRevenue: number;
    totalRegistrations: number;
    checkedInCount: number;
    activeEventsCount: number;
  }>({
    totalRevenue: 3480,
    totalRegistrations: 418,
    checkedInCount: 3,
    activeEventsCount: 5,
  });

  // Astropods AI Insights State
  const [aiInsights, setAiInsights] = useState<{
    summary: string;
    salesTrends: string;
    recommendations: string[];
    generatedAt: string;
  } | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Registrations Grid State (Feature B)
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);
  const [selectedFastPass, setSelectedFastPass] = useState<StoredRegistration | null>(null);

  // Orders Grid State (Feature C)
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Fetch Telemetry Stats
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/organizer/dashboard", {
        headers: { "x-campushub-role": "organizer" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json.data) {
          const d = json.data;
          setTelemetry({
            totalRevenue: d.totalRevenue ?? 3480,
            totalRegistrations: d.totalRegistrations ?? 418,
            checkedInCount: d.checkedInCount ?? 3,
            activeEventsCount: d.activeEventsCount ?? 5,
          });
        }
      }
    } catch {
      // non-fatal
    }
  }, []);

  // Fetch Scoped Registrations (Feature B)
  const fetchRegistrations = useCallback(async () => {
    setLoadingRegistrations(true);
    setRegistrationsError(null);
    try {
      const res = await fetch("/api/organizer/registrations", {
        headers: { "x-campushub-role": "organizer" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load registrations`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRegistrations(json.data);
      } else {
        throw new Error("Invalid registrations payload");
      }
    } catch (err) {
      setRegistrationsError(err instanceof Error ? err.message : "Failed to load registrations");
    } finally {
      setLoadingRegistrations(false);
    }
  }, []);

  // Fetch Scoped Orders (Feature C)
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const res = await fetch("/api/organizer/orders", {
        headers: { "x-campushub-role": "organizer" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load orders`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      } else {
        throw new Error("Invalid orders payload");
      }
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    fetchRegistrations();
    fetchOrders();
  }, [fetchTelemetry, fetchRegistrations, fetchOrders]);

  // Toggle Gate Check-in
  const handleToggleCheckIn = useCallback(async (registrationId: string) => {
    try {
      const res = await fetch("/api/organizer/registrations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-campushub-role": "organizer",
        },
        body: JSON.stringify({ registrationId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated = json.data as StoredRegistration;
          setRegistrations((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r))
          );
          fetchTelemetry();
        }
      }
    } catch {
      // non-fatal
    }
  }, [fetchTelemetry]);

  // Generate AI Insights
  const handleFetchInsights = async () => {
    setIsGeneratingInsights(true);
    setInsightsError(null);
    try {
      const res = await fetch("/api/ai/organizer-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-campushub-role": "organizer",
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load organizer insights");
      }
      setAiInsights(json.data);
    } catch (err) {
      setInsightsError(err instanceof Error ? err.message : "Error loading AI insights");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // FEATURE B: REGISTRATIONS COLUMN DEFS
  const registrationColumnDefs = useMemo<ColDef<StoredRegistration>[]>(() => {
    return [
      {
        headerName: "Student",
        field: "studentName",
        minWidth: 190,
        flex: 2,
        cellRenderer: (params: ICellRendererParams<StoredRegistration>) => {
          const reg = params.data;
          return (
            <div className="py-1">
              <div className="font-bold text-on-surface text-xs">{reg?.studentName || "Student"}</div>
              <div className="text-[10px] font-mono text-outline">{reg?.studentId || "—"}</div>
            </div>
          );
        },
      },
      {
        headerName: "Student Email",
        field: "studentEmail",
        minWidth: 200,
        flex: 2,
        cellRenderer: (params: ICellRendererParams<StoredRegistration>) => {
          const email = params.value;
          if (!email) return <span className="text-outline text-xs">—</span>;
          return (
            <div className="py-1">
              <a
                href={`mailto:${email}`}
                className="text-xs text-primary hover:underline truncate block"
              >
                {email}
              </a>
            </div>
          );
        },
      },
      {
        headerName: "Event",
        field: "eventTitle",
        minWidth: 220,
        flex: 2,
        cellRenderer: (params: ICellRendererParams<StoredRegistration>) => {
          const title = params.value || "Campus Event";
          const loc = params.data?.eventLocation || "";
          return (
            <div className="py-1">
              <div className="font-semibold text-on-surface text-xs truncate">{title}</div>
              {loc && <div className="text-[10px] text-outline truncate">{loc}</div>}
            </div>
          );
        },
      },
      {
        headerName: "Registration Date",
        field: "createdAt",
        minWidth: 160,
        flex: 1,
        valueFormatter: (params) => {
          if (!params.value) return "Just now";
          try {
            return new Date(params.value).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          } catch {
            return String(params.value);
          }
        },
      },
      {
        headerName: "Ticket Tier",
        field: "planName",
        minWidth: 160,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<StoredRegistration>) => {
          const plan = params.value || "General Pass";
          const price = params.data?.planPrice ?? 0;
          return (
            <div className="py-1 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-mono font-bold truncate">
                {plan}
              </span>
              <span className="text-[10px] font-mono font-bold text-outline">
                {price === 0 ? "FREE" : `$${price.toFixed(2)}`}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Payment Status",
        field: "status",
        minWidth: 140,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<StoredRegistration>) => {
          const status = params.value;
          const isConfirmed = status === "CONFIRMED";
          const isPending = status === "PENDING_PAYMENT";
          return (
            <div className="py-1">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                  isConfirmed
                    ? "bg-secondary-container text-on-secondary-fixed"
                    : isPending
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{isConfirmed ? "Paid" : isPending ? "Pending" : "Cancelled"}</span>
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Gate Check-In",
        field: "checkedIn",
        minWidth: 150,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<StoredRegistration>) => {
          const checkedIn = Boolean(params.value);
          const reg = params.data;
          if (!reg) return null;
          return (
            <div className="py-1">
              <button
                type="button"
                onClick={() => handleToggleCheckIn(reg.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 ${
                  checkedIn
                    ? "bg-secondary-container text-on-secondary-fixed shadow-2xs hover:bg-secondary-container/80"
                    : "bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface border border-outline-variant/40"
                }`}
              >
                <span className="material-symbols-outlined text-xs">
                  {checkedIn ? "check_circle" : "radio_button_unchecked"}
                </span>
                <span>{checkedIn ? "Checked In" : "Unchecked"}</span>
              </button>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        minWidth: 110,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<StoredRegistration>) => {
          const reg = params.data;
          if (!reg) return null;
          return (
            <div className="py-1">
              <button
                type="button"
                onClick={() => setSelectedFastPass(reg)}
                className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-headline font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                title="View Dynamic QR FastPass"
              >
                <span className="material-symbols-outlined text-xs">qr_code_2</span>
                <span>FastPass</span>
              </button>
            </div>
          );
        },
      },
    ];
  }, [handleToggleCheckIn]);

  // FEATURE C: ORDERS COLUMN DEFS
  const orderColumnDefs = useMemo<ColDef<Order>[]>(() => {
    return [
      {
        headerName: "Order ID",
        field: "orderNumber",
        minWidth: 150,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<Order>) => {
          const num = params.value || params.data?.id || "—";
          return (
            <div className="py-1 font-mono font-bold text-xs text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-outline">receipt</span>
              <span>{num}</span>
            </div>
          );
        },
      },
      {
        headerName: "Customer",
        field: "studentName",
        minWidth: 180,
        flex: 2,
        cellRenderer: (params: ICellRendererParams<Order>) => {
          const ord = params.data;
          return (
            <div className="py-1">
              <div className="font-bold text-on-surface text-xs">{ord?.studentName || "Customer"}</div>
              <div className="text-[10px] font-mono text-outline">{ord?.studentId || ord?.studentEmail || "—"}</div>
            </div>
          );
        },
      },
      {
        headerName: "Order Date",
        field: "createdAt",
        minWidth: 150,
        flex: 1,
        valueFormatter: (params) => {
          if (!params.value) return "Just now";
          try {
            return new Date(params.value).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          } catch {
            return String(params.value);
          }
        },
      },
      {
        headerName: "Items",
        field: "items",
        minWidth: 220,
        flex: 2,
        valueGetter: (params) => {
          const items = params.data?.items;
          if (!Array.isArray(items) || items.length === 0) return "No items";
          return items.map((i) => `${i.name || "Product"} × ${i.quantity}`).join(", ");
        },
        cellRenderer: (params: ICellRendererParams<Order>) => {
          const items = params.data?.items || [];
          if (items.length === 0) return <span className="text-outline text-xs">No items</span>;
          const summary = items.map((i) => `${i.name || "Item"} (×${i.quantity})`).join(", ");
          return (
            <div className="py-1">
              <div className="text-xs text-on-surface truncate font-medium" title={summary}>
                {summary}
              </div>
              <div className="text-[10px] text-outline font-mono">
                {items.reduce((s, it) => s + it.quantity, 0)} total pcs
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Total Amount",
        field: "total",
        minWidth: 130,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<Order>) => {
          const val = params.value ?? 0;
          const cur = params.data?.currency || "USD";
          return (
            <div className="py-1 font-mono font-extrabold text-xs text-primary">
              ${Number(val).toFixed(2)} <span className="text-[10px] text-outline font-normal">{cur}</span>
            </div>
          );
        },
      },
      {
        headerName: "Payment Status",
        field: "paymentStatus",
        minWidth: 140,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<Order>) => {
          const pStatus = params.value || "PENDING";
          const isComp = pStatus === "COMPLETED";
          const isPend = pStatus === "PENDING";
          return (
            <div className="py-1">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                  isComp
                    ? "bg-secondary-container text-on-secondary-fixed"
                    : isPend
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{pStatus}</span>
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Fulfillment Status",
        field: "status",
        minWidth: 150,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<Order>) => {
          const st = params.value || "pending";
          const isReady = st === "ready_for_pickup" || st === "delivered";
          return (
            <div className="py-1">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isReady
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {st.replace(/_/g, " ")}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        minWidth: 120,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<Order>) => {
          const ord = params.data;
          if (!ord) return null;
          return (
            <div className="py-1">
              <button
                type="button"
                onClick={() => setViewingOrder(ord)}
                className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                title="View order details and locker PIN"
              >
                <span className="material-symbols-outlined text-xs text-primary">visibility</span>
                <span>Details</span>
              </button>
            </div>
          );
        },
      },
    ];
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary font-label mb-1">
            <span className="material-symbols-outlined text-[16px]">monitoring</span>
            <span>Real-Time Campus Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
            Dashboard &amp; Telemetry
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Live turnstile velocity, student registration rosters, and smart locker dispatches powered by AG Grid.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/organizer/events"
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>New Event</span>
          </Link>
          <Link
            href="/organizer/scanner"
            className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-base text-primary">qr_code_scanner</span>
            <span>Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* 1. Telemetry Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
              Passes Issued
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">confirmation_number</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-headline">
            <CountUp to={telemetry.totalRegistrations} durationMs={1200} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+18% from last week</span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
              Turnstile Velocity
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container/40 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">speed</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-headline flex items-baseline gap-1">
            <CountUp to={3.4} decimals={1} durationMs={1200} />
            <span className="text-sm font-mono text-outline">sec/scan</span>
          </div>
          <div className="text-xs text-on-surface-variant font-mono">
            {telemetry.checkedInCount} verified check-ins
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
              Lockers Filled
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">lock</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-headline">
            <CountUp to={84} durationMs={1200} />%
          </div>
          <div className="text-xs text-on-surface-variant font-mono">
            42 of 50 smart slots occupied
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
              Authoritative Treasury
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container/40 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">payments</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-headline">
            $<CountUp to={telemetry.totalRevenue} durationMs={1200} />
          </div>
          <div className="text-xs text-on-surface-variant font-mono">
            Excludes pending &amp; cancelled
          </div>
        </SpotlightCard>
      </div>

      {/* AI Copilot Insights Card */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">psychology</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-on-surface">
                Astropods AI Organizer Copilot
              </h2>
              <p className="text-xs text-on-surface-variant">
                Synthesizes attendance patterns, velocity bottlenecks, and inventory stockouts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFetchInsights}
            disabled={isGeneratingInsights}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm">
              {isGeneratingInsights ? "progress_activity" : "auto_fix_high"}
            </span>
            <span>
              {isGeneratingInsights ? "Analyzing Telemetry..." : "Generate Copilot Insights"}
            </span>
          </button>
        </div>

        {insightsError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs">
            {insightsError}
          </div>
        )}

        {aiInsights ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
            <div className="lg:col-span-7 p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20 space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono block">
                  Executive Telemetry Summary
                </span>
                <p className="text-xs text-on-surface leading-relaxed mt-1">{aiInsights.summary}</p>
              </div>
              <div className="pt-2 border-t border-outline-variant/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-mono block">
                  Merchandise &amp; Ticket Sales Trends
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">{aiInsights.salesTrends}</p>
              </div>
            </div>

            <div className="lg:col-span-5 p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary font-mono block">
                Actionable Recommendations
              </span>
              <ul className="space-y-2">
                {aiInsights.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-on-surface flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary-container/60 text-secondary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{rec}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 text-[10px] text-outline border-t border-outline-variant/20">
                Authoritative financials computed by CampusHub backend • Excludes pending &amp; cancelled transactions.
              </div>
            </div>
          </div>
        ) : (
          !insightsError && (
            <div className="text-center py-4 text-xs text-on-surface-variant">
              Click &quot;Generate Copilot Insights&quot; to synthesize attendance patterns and merchandise conversions.
            </div>
          )
        )}
      </div>

      {/* 2. Management Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/organizer/events"
          className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 hover:shadow-xs transition-all group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-xl">edit_calendar</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-1">
              <span>Event Manager &amp; Editor</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Edit dates, AI pitch, venue logistics, and zero-conflict schedule checks.
            </p>
          </div>
        </Link>

        <Link
          href="/organizer/tickets"
          className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 hover:shadow-xs transition-all group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-xl">confirmation_number</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-1">
              <span>Passes &amp; Ticket Tiers</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Configure free student tier, VIP pass pricing, and rolling QR intervals.
            </p>
          </div>
        </Link>

        <Link
          href="/organizer/lockers"
          className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 hover:shadow-xs transition-all group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-xl">inventory_2</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-1">
              <span>Smart Locker Queue</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Dispatch official collegiate merch to Union &amp; Moffitt smart lockers.
            </p>
          </div>
        </Link>
      </div>

      {/* 3. ORGANIZER DATA TABLES WITH AG GRID COMMUNITY */}
      <div className="space-y-4">
        {/* Navigation Tabs between Registrations and Orders */}
        <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("registrations")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-headline flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "registrations"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            <span>Attendee Registrations ({registrations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-headline flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>Merchandise Orders ({orders.length})</span>
          </button>
        </div>

        {/* FEATURE B: REGISTRATIONS TABLE */}
        {activeTab === "registrations" && (
          <CampusGrid<StoredRegistration>
            title="Attendee Roster &amp; Live Gate Check-Ins"
            subtitle="Monitor student RSVPs, verify authorized payment records, toggle live gate check-in, or inspect rolling FastPass QR codes."
            rowData={registrations}
            columnDefs={registrationColumnDefs}
            loading={loadingRegistrations}
            error={registrationsError}
            onRefresh={() => {
              fetchRegistrations();
              fetchTelemetry();
            }}
            exportFileName="campushub-attendees.csv"
            getRowId={(params) => params.data.id}
            paginationPageSize={10}
            height={480}
          />
        )}

        {/* FEATURE C: ORDERS TABLE */}
        {activeTab === "orders" && (
          <CampusGrid<Order>
            title="Merchandise Purchases &amp; Locker Dispatches"
            subtitle="Authoritative financial records calculated by CampusHub backend. Inspect payment capture, order fulfillment status, and smart locker pins."
            rowData={orders}
            columnDefs={orderColumnDefs}
            loading={loadingOrders}
            error={ordersError}
            onRefresh={() => {
              fetchOrders();
              fetchTelemetry();
            }}
            exportFileName="campushub-orders.csv"
            getRowId={(params) => params.data.id}
            paginationPageSize={10}
            height={480}
          />
        )}
      </div>

      {/* FASTPASS MODAL FOR REGISTRATIONS */}
      {selectedFastPass && (
        <FastPassModal
          isOpen={true}
          onClose={() => setSelectedFastPass(null)}
          title={selectedFastPass.eventTitle}
          subtitle={`${selectedFastPass.eventDate} • ${selectedFastPass.eventTime}`}
          passCode={selectedFastPass.passCode || selectedFastPass.id}
          studentName={selectedFastPass.studentName}
          studentId={selectedFastPass.studentId}
          location={selectedFastPass.eventLocation}
          badgeLabel={selectedFastPass.planName}
        />
      )}

      {/* ORDER DETAILS MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-6 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs text-primary font-bold">
                  {viewingOrder.orderNumber}
                </span>
                <h2 className="text-xl font-black font-headline text-on-surface mt-1">
                  Order Details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="text-outline hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface-container-low text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-outline block">Customer</span>
                <span className="font-bold text-on-surface">{viewingOrder.studentName}</span>
                <span className="block text-[11px] text-outline font-mono">{viewingOrder.studentEmail}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-outline block">Fulfillment</span>
                <span className="font-bold text-on-surface capitalize">
                  {viewingOrder.fulfillmentMethod || "Campus Pickup"}
                </span>
                {viewingOrder.fulfillmentLocation && (
                  <span className="block text-[11px] text-primary font-mono font-bold">
                    {viewingOrder.fulfillmentLocation}
                  </span>
                )}
              </div>
            </div>

            {/* Smart Locker PIN Banner */}
            {viewingOrder.pickupPassCode && (
              <div className="p-3 rounded-2xl bg-secondary-container/40 border border-secondary/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">pin</span>
                  <span className="font-bold text-on-secondary-fixed">Pickup / Locker PIN:</span>
                </div>
                <span className="font-mono font-black text-sm tracking-widest text-secondary">
                  {viewingOrder.pickupPassCode}
                </span>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-outline block">
                Purchased Items
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {viewingOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-on-surface">{item.name || "Item"}</span>
                      {item.size && (
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-outline font-mono">
                          Size: {item.size}
                        </span>
                      )}
                      <p className="text-[11px] text-outline">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-mono font-bold text-on-surface">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Authoritative Financial Breakdown */}
            <div className="pt-2 border-t border-outline-variant/20 space-y-1 text-xs">
              <div className="flex justify-between text-outline">
                <span>Subtotal</span>
                <span className="font-mono">${Number(viewingOrder.subtotal || 0).toFixed(2)}</span>
              </div>
              {Number(viewingOrder.shipping) > 0 && (
                <div className="flex justify-between text-outline">
                  <span>Shipping</span>
                  <span className="font-mono">${Number(viewingOrder.shipping).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-on-surface text-sm pt-1 border-t border-outline-variant/15">
                <span>Total (Authoritative)</span>
                <span className="font-mono text-primary">${Number(viewingOrder.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
