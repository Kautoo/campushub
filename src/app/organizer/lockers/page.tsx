"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/react-bits";

interface LockerDispatch {
  id: string;
  lockerNumber: string;
  zone: string;
  studentName: string;
  studentId: string;
  itemName: string;
  pinCode: string;
  status: "Ready for Pickup" | "Collected" | "Awaiting Stacking";
  expiresIn: string;
}

const INITIAL_LOCKERS: LockerDispatch[] = [
  {
    id: "LCK-01",
    lockerNumber: "A-12",
    zone: "MLK Student Union (Zone A)",
    studentName: "Liam Vance",
    studentId: "#STU-874410",
    itemName: "Heavyweight Archival Hoodie (L)",
    pinCode: "882-901",
    status: "Ready for Pickup",
    expiresIn: "01h 42m",
  },
  {
    id: "LCK-02",
    lockerNumber: "A-14",
    zone: "MLK Student Union (Zone A)",
    studentName: "Chloe Park",
    studentId: "#STU-890312",
    itemName: "Field Notebook 3-Pack + Sticker Sheet",
    pinCode: "441-209",
    status: "Ready for Pickup",
    expiresIn: "01h 15m",
  },
  {
    id: "LCK-03",
    lockerNumber: "B-04",
    zone: "Moffitt Library (Zone B)",
    studentName: "Alex Rivera",
    studentId: "#STU-882194",
    itemName: "Collegiate Hydro Flask 32oz",
    pinCode: "109-882",
    status: "Collected",
    expiresIn: "Completed",
  },
  {
    id: "LCK-04",
    lockerNumber: "C-08",
    zone: "Soda Hall Courtyard (Zone C)",
    studentName: "Maya Lin",
    studentId: "#STU-881029",
    itemName: "IEEE Chapter Hackathon Build Kit",
    pinCode: "931-404",
    status: "Awaiting Stacking",
    expiresIn: "Queue 28m",
  },
];

export default function OrganizerLockersPage() {
  const [lockers, setLockers] = useState<LockerDispatch[]>(INITIAL_LOCKERS);
  const [selectedZone, setSelectedZone] = useState("all");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleToggleStatus = (id: string) => {
    setLockers((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const nextStatus =
            l.status === "Ready for Pickup"
              ? "Collected"
              : l.status === "Collected"
              ? "Awaiting Stacking"
              : "Ready for Pickup";
          return { ...l, status: nextStatus };
        }
        return l;
      })
    );
    setSuccessToast("Locker compartment status updated");
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const filtered = lockers.filter((l) => {
    if (selectedZone === "all") return true;
    return l.zone.includes(selectedZone);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary font-label mb-1">
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            <span>2-Hour Physical Locker Fulfillment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
            Smart Locker &amp; Merch Queue
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage smart locker compartments, 6-digit student PIN dispatches, and 24/7 NFC pickup turnstiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/shop"
            className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-base text-primary">storefront</span>
            <span>View Student Merch</span>
          </Link>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-secondary-container/40 border border-secondary/30 text-on-secondary-fixed text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Zone Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
              Zone A • MLK Student Union
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-on-surface font-headline">
            18 / 24 <span className="text-xs font-normal text-outline">Filled</span>
          </div>
          <p className="text-xs text-secondary font-semibold">Average pickup time: 38 mins</p>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
              Zone B • Moffitt Library
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-on-surface font-headline">
            12 / 16 <span className="text-xs font-normal text-outline">Filled</span>
          </div>
          <p className="text-xs text-on-surface-variant">Ground Floor 24/7 Vestibule</p>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
              Zone C • Soda Hall
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-on-surface font-headline">
            6 / 12 <span className="text-xs font-normal text-outline">Filled</span>
          </div>
          <p className="text-xs text-on-surface-variant">Engineering Courtyard Locker</p>
        </SpotlightCard>
      </div>

      {/* Compartments Queue Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold font-headline text-on-surface">
              Active Smart Locker Dispatches
            </h2>
            <p className="text-xs text-on-surface-variant">
              When students order collegiate gear, 2-hour smart lockers dispense their packages automatically.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex rounded-xl bg-surface-container-low p-1 border border-outline-variant/30 text-xs">
            <button
              type="button"
              onClick={() => setSelectedZone("all")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                selectedZone === "all"
                  ? "bg-surface-container-lowest text-on-surface shadow-2xs"
                  : "text-outline hover:text-on-surface"
              }`}
            >
              All Zones
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone("Zone A")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                selectedZone === "Zone A"
                  ? "bg-secondary-container text-on-secondary-fixed shadow-2xs"
                  : "text-outline hover:text-on-surface"
              }`}
            >
              Zone A
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone("Zone B")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                selectedZone === "Zone B"
                  ? "bg-secondary-container text-on-secondary-fixed shadow-2xs"
                  : "text-outline hover:text-on-surface"
              }`}
            >
              Zone B
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 text-outline font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Locker ID</th>
                <th className="pb-3 px-3">Student</th>
                <th className="pb-3 px-3">Merch Item</th>
                <th className="pb-3 px-3">Access PIN</th>
                <th className="pb-3 px-3">Window</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-surface-container-low/50 transition-colors"
                >
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-extrabold text-sm text-primary px-2.5 py-1 rounded-lg bg-surface-container">
                      #{l.lockerNumber}
                    </span>
                    <span className="block text-[10px] text-outline mt-1">{l.zone}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-on-surface">{l.studentName}</div>
                    <div className="text-[10px] font-mono text-outline">{l.studentId}</div>
                  </td>
                  <td className="py-3.5 px-3 font-medium text-on-surface">{l.itemName}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/30">
                      {l.pinCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-outline">
                    {l.expiresIn}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(l.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 ${
                        l.status === "Ready for Pickup"
                          ? "bg-secondary-container text-on-secondary-fixed shadow-2xs"
                          : l.status === "Collected"
                          ? "bg-surface-container-low text-outline border border-outline-variant/40"
                          : "bg-primary text-on-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {l.status === "Collected" ? "check" : "sync"}
                      </span>
                      <span>{l.status}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

