"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/react-bits";

interface ScanLog {
  id: string;
  timestamp: string;
  studentName: string;
  studentId: string;
  passCode: string;
  tier: string;
  status: "Validated" | "Duplicate Attempt";
}

const INITIAL_LOGS: ScanLog[] = [
  {
    id: "scan_1",
    timestamp: "17:02:14",
    studentName: "Alex Rivera",
    studentId: "#STU-882194",
    passCode: "CH-8821-94A-QR",
    tier: "VIP Keynote + Flight Demo",
    status: "Validated",
  },
  {
    id: "scan_2",
    timestamp: "17:01:48",
    studentName: "Maya Lin",
    studentId: "#STU-881029",
    passCode: "CH-8810-29M-QR",
    tier: "Student General Admission",
    status: "Validated",
  },
  {
    id: "scan_3",
    timestamp: "16:58:30",
    studentName: "Unknown Device",
    studentId: "#STU-882194",
    passCode: "CH-8821-94A-OLD",
    tier: "Expired Token (30s timeout)",
    status: "Duplicate Attempt",
  },
];

export default function OrganizerScannerPage() {
  const [manualCode, setManualCode] = useState("");
  const [logs, setLogs] = useState<ScanLog[]>(INITIAL_LOGS);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [activeMessage, setActiveMessage] = useState("");

  const handleSimulateScan = () => {
    setScanState("scanning");
    setTimeout(() => {
      const newScan: ScanLog = {
        id: `scan_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        studentName: "Jordan Hayes",
        studentId: `#STU-${Math.floor(Math.random() * 899999 + 100000)}`,
        passCode: `CH-${Math.floor(Math.random() * 8999 + 1000)}-QR`,
        tier: "Student General Admission",
        status: "Validated",
      };
      setLogs((prev) => [newScan, ...prev]);
      setScanState("success");
      setActiveMessage("Pass Validated • Turnstile Gate Unlocked");
      setTimeout(() => setScanState("idle"), 2400);
    }, 750);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const newScan: ScanLog = {
      id: `scan_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      studentName: "Manual Verification",
      studentId: "#STU-OFFICER",
      passCode: manualCode.toUpperCase().trim(),
      tier: "Attendant Manual Overwrite",
      status: "Validated",
    };
    setLogs((prev) => [newScan, ...prev]);
    setManualCode("");
    setScanState("success");
    setActiveMessage(`Code ${newScan.passCode} Verified ✓`);
    setTimeout(() => setScanState("idle"), 2400);
  };

  const verifiedCount = logs.filter((l) => l.status === "Validated").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary font-label mb-1">
            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
            <span>Turnstile &amp; Event Gate Controls</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
            Gate Turnstile Scanner
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Real-time optical scanner reticle, SHA-256 rolling token validator, and manual pass lookup.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>GATE B PROCTOR ACTIVE</span>
          </span>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Viewfinder Camera Simulator */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold font-headline text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">center_focus_strong</span>
                <span>Optical Camera Viewfinder</span>
              </h2>
              <span className="text-[10px] font-mono text-outline">FPS: 60.0 • 1080p</span>
            </div>

            {/* Viewfinder Frame */}
            <div className="w-full aspect-[4/3] rounded-2xl bg-neutral-950 relative overflow-hidden flex flex-col items-center justify-center border-2 border-primary/40 shadow-inner">
              {/* Scanline grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

              {/* Reticle */}
              <div className="w-44 h-44 border border-primary/70 rounded-2xl relative flex items-center justify-center">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#c1ee78] rounded-tl" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#c1ee78] rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#c1ee78] rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#c1ee78] rounded-br" />
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#c1ee78] to-transparent animate-bounce shadow-[0_0_12px_#c1ee78]" />
              </div>

              {/* Status Overlay */}
              <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono font-bold text-white/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SENSOR: READY
                </span>
                <span>TOTAL CHECKED: {verifiedCount}</span>
              </div>

              {scanState === "success" && (
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-2xs flex items-center justify-center animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-white text-on-surface shadow-xl flex items-center gap-2 font-headline font-bold text-xs">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                    <span>{activeMessage}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Trigger Button */}
            <button
              type="button"
              onClick={handleSimulateScan}
              disabled={scanState === "scanning"}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">
                {scanState === "scanning" ? "sync" : "qr_code_scanner"}
              </span>
              <span>
                {scanState === "scanning" ? "Validating Cryptographic Token…" : "Simulate Live Student QR Scan"}
              </span>
            </button>
          </div>

          {/* Manual Code Fallback Form */}
          <form
            onSubmit={handleManualSubmit}
            className="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 space-y-3"
          >
            <h3 className="font-headline font-bold text-xs text-on-surface">
              Manual Pass Lookup (Damaged Screen / Offline)
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter pass code (e.g. CH-8821-94A-QR)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2 rounded-xl bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-fixed font-headline font-bold text-xs transition-colors disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Scan Logs Feed */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold font-headline text-on-surface">
                Live Gate Validation Stream
              </h2>
              <span className="text-[11px] font-mono text-primary font-bold">
                {logs.length} Scans Today
              </span>
            </div>

            <div className="space-y-2.5">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface">{log.studentName}</span>
                      <span className="font-mono text-[10px] text-outline">{log.studentId}</span>
                    </div>
                    <div className="text-[11px] text-on-surface-variant font-mono">
                      {log.passCode} • {log.tier}
                    </div>
                    <div className="text-[10px] text-outline font-mono">{log.timestamp}</div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                      log.status === "Validated"
                        ? "bg-secondary-container text-on-secondary-fixed"
                        : "bg-error-container text-on-error-container"
                    }`}
                  >
                    {log.status === "Validated" ? "Cleared ✓" : "Flagged ⚠️"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

