"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import AnimatedContent, { type AnimatedContentProps } from "./AnimatedContent";
import FadeContent, { type FadeContentProps } from "./FadeContent";
import GlideSelect, {
  type GlideSelectProps,
  type GlideSelectOption,
} from "./GlideSelect";
import Lanyard, { type LanyardProps } from "./Lanyard";
import PromptBar, {
  type PromptBarProps,
  type PromptBarSendMeta,
  type PromptBarSource,
  type PromptBarCommand,
  type PromptBarModel,
} from "./PromptBar";
import ThoughtLine, { type ThoughtLineProps } from "./ThoughtLine";
import LatticeLoader, { type LatticeLoaderProps } from "./LatticeLoader";

export {
  AnimatedContent,
  FadeContent,
  GlideSelect,
  Lanyard,
  PromptBar,
  ThoughtLine,
  LatticeLoader,
};
export type {
  AnimatedContentProps,
  FadeContentProps,
  GlideSelectProps,
  GlideSelectOption,
  LanyardProps,
  PromptBarProps,
  PromptBarSendMeta,
  PromptBarSource,
  PromptBarCommand,
  PromptBarModel,
  ThoughtLineProps,
  LatticeLoaderProps,
};

/* ============================================================================
 * 1. REACT BITS: SPOTLIGHT CARD
 * Tracks cursor position and projects a radial Academic Horizon lime/olive glow
 * ============================================================================ */
export interface SpotlightCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
  as?: React.ElementType;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(193, 238, 120, 0.24)",
  onMouseMove,
  style,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPosition({ x, y });
    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
    onMouseMove?.(e);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      style={style}
      className={cn("spotlight-card relative overflow-hidden transition-all duration-300 hover:shadow-md", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* ============================================================================
 * 2. REACT BITS: TILTED CARD
 * Smooth 3D perspective tilt on hover
 * ============================================================================ */
export interface TiltedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  maxTilt?: number;
  scaleOnHover?: number;
}

export function TiltedCard({
  children,
  className,
  maxTilt = 4,
  scaleOnHover = 1.01,
  ...props
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(
    "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateY = ((x - midX) / midX) * maxTilt;
    const rotateX = -((y - midY) / midY) * maxTilt;
    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
        2
      )}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, 1)`
    );
  };

  const handleMouseLeave = () => {
    setTransform(
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
    );
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={cn("will-change-transform", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* ============================================================================
 * 3. REACT BITS: BLUR TEXT
 * Animated word/character blur-in reveal
 * ============================================================================ */
export interface BlurTextProps {
  text: string;
  className?: string;
  delayStepMs?: number;
}

export function BlurText({
  text,
  className,
  delayStepMs = 45,
}: BlurTextProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const words = text.split(" ");

  return (
    <span className={cn("inline-flex flex-wrap gap-x-[0.26em]", className)}>
      {words.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          style={{
            transitionDelay: `${idx * delayStepMs}ms`,
          }}
          className={cn(
            "inline-block transition-all duration-700 ease-out",
            mounted
              ? "opacity-100 blur-0 translate-y-0"
              : "opacity-0 blur-md translate-y-2"
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

/* ============================================================================
 * 4. REACT BITS: SHINY TEXT
 * Shimmering badge or headline text
 * ============================================================================ */
export function ShinyText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("react-bits-shiny inline-block", className)}>
      {children}
    </span>
  );
}

/* ============================================================================
 * 5. REACT BITS: COUNT UP
 * Smoothly animates numbers on mount
 * ============================================================================ */
export interface CountUpProps {
  to: number;
  from?: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: boolean;
  className?: string;
}

export function CountUp({
  to,
  from = 0,
  durationMs = 900,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = true,
  className,
}: CountUpProps) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    let startTime: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (to - from) * eased);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [to, from, durationMs]);

  const formatted = value.toFixed(decimals);
  const display = separator
    ? Number(formatted).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : formatted;

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ============================================================================
 * 6. REACT BITS: MAGNET WRAPPER
 * Magnetic attraction wrapper for interactive buttons
 * ============================================================================ */
export function Magnet({
  children,
  className,
  strength = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    setOffset({ x: dx * strength, y: dy * strength });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      style={{
        transform: `translate3d(${offset.x.toFixed(1)}px, ${offset.y.toFixed(
          1
        )}px, 0)`,
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={cn("inline-block", className)}
    >
      {children}
    </div>
  );
}

/* ============================================================================
 * 7. STITCH UI KIT: FAST-PASS DUAL-MODE DYNAMIC QR PASS & ATTENDANT SCANNER
 * Reusable verified pass modal with dual behaviour:
 * - Normal phone camera: opens public student verification & event registration form
 * - CampusHub Attendant Scanner: records verified event attendance on-chain
 * ============================================================================ */
export interface FastPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  passCode?: string;
  studentName?: string;
  studentId?: string;
  location?: string;
  badgeLabel?: string;
}

export function FastPassModal({
  isOpen,
  onClose,
  title = "AI & Robotics Symposium '25",
  subtitle = "OCT 24, 2025 • 4:00 PM",
  passCode = "CH-8821-94A-QR",
  studentName = "Alex Rivera",
  studentId = "#STU-882194",
  location = "Huang Engineering Center • Gate B",
  badgeLabel = "ACTIVE ENTRY PASS",
}: FastPassModalProps) {
  const [activeTab, setActiveTab] = useState<"pass" | "attendant">("pass");
  const [addedToWallet, setAddedToWallet] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "verified">("idle");
  const [checkedInCount, setCheckedInCount] = useState(142);

  if (!isOpen) return null;

  const publicVerificationUrl = `https://campushub.edu/events?pass=${encodeURIComponent(
    passCode
  )}&student=${encodeURIComponent(studentName)}`;

  const handleSimulateScan = () => {
    setScanStatus("scanning");
    setTimeout(() => {
      setScanStatus("verified");
      setCheckedInCount((prev) => prev + 1);
    }, 1100);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#131b2e]/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-[2.25rem] border border-outline-variant/40 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Olive/Navy Header */}
        <div className="bg-gradient-to-br from-[#131b2e] via-[#1e2942] to-[#283814] p-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#c1ee78]/15 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start relative z-10 mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c1ee78]/20 text-[#c1ee78] text-[10px] font-bold uppercase tracking-widest mb-1.5 border border-[#c1ee78]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c1ee78] animate-pulse" />
                {badgeLabel}
              </span>
              <h3 className="font-headline font-extrabold text-xl leading-tight">
                {title}
              </h3>
              <p className="text-xs text-[#c1ee78] font-mono mt-0.5">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="relative z-10 grid grid-cols-2 p-1 rounded-xl bg-black/30 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("pass")}
              className={cn(
                "py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                activeTab === "pass"
                  ? "bg-[#c1ee78] text-[#121f00] shadow-xs"
                  : "text-white/70 hover:text-white"
              )}
            >
              <span className="material-symbols-outlined text-sm">qr_code_2</span>
              <span>My Dynamic QR Pass</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("attendant")}
              className={cn(
                "py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                activeTab === "attendant"
                  ? "bg-[#c1ee78] text-[#121f00] shadow-xs"
                  : "text-white/70 hover:text-white"
              )}
            >
              <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
              <span>Attendant Scanner Mode</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Dynamic Student QR Pass */}
        {activeTab === "pass" && (
          <div className="p-6 flex flex-col items-center">
            {/* High-res Optical QR Pass Frame */}
            <div className="p-4 bg-surface-container-low rounded-3xl border-2 border-dashed border-primary/30 mb-3 relative group">
              <div className="w-48 h-48 bg-white rounded-2xl p-3 flex flex-col items-center justify-center border border-outline-variant/40 shadow-inner relative overflow-hidden">
                <span
                  className="material-symbols-outlined text-[#131b2e] text-[156px] leading-none select-none"
                  style={{ fontVariationSettings: "'wght' 300" }}
                >
                  qr_code_2
                </span>
                {/* Center CampusHub shield stamp */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-[#131b2e] border-2 border-[#c1ee78] flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[#c1ee78] text-xl">
                      school
                    </span>
                  </div>
                </div>
              </div>
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-on-primary font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap">
                CampusHub Dynamic QR • SHA-256
              </span>
            </div>

            <p className="font-mono text-sm font-extrabold text-on-surface tracking-widest mt-2">
              {passCode}
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5 text-center">{location}</p>

            {/* Smart Dual-Mode Behavior Explainer Banner */}
            <div className="w-full mt-4 p-3 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 space-y-2 text-left">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                </div>
                <div className="text-[11px] leading-snug">
                  <span className="font-bold text-on-surface">Normal Phone Camera: </span>
                  <span className="text-on-surface-variant">
                    Scans direct to verified event RSVP &amp; registration form.
                  </span>
                  <a
                    href={publicVerificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline font-mono font-bold text-[10px] mt-0.5"
                  >
                    Test normal camera link ↗
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1 border-t border-outline-variant/20">
                <div className="w-6 h-6 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-sm">badge</span>
                </div>
                <div className="text-[11px] leading-snug">
                  <span className="font-bold text-on-surface">CampusHub Attendant Scanner: </span>
                  <span className="text-on-surface-variant">
                    Event staff scan instantly logs confirmed attendance.
                  </span>
                </div>
              </div>
            </div>

            {/* Holder Metadata */}
            <div className="w-full mt-3 p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  Verified Holder
                </p>
                <p className="font-bold text-on-surface mt-0.5">{studentName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  Institutional ID
                </p>
                <p className="font-mono font-bold text-primary mt-0.5">
                  {studentId}
                </p>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => setAddedToWallet(true)}
                className={cn(
                  "py-3 px-4 rounded-xl font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all",
                  addedToWallet
                    ? "bg-secondary-container text-on-secondary-fixed"
                    : "bg-on-surface text-surface hover:bg-on-surface/90"
                )}
              >
                <span className="material-symbols-outlined text-base">
                  {addedToWallet ? "check_circle" : "account_balance_wallet"}
                </span>
                {addedToWallet ? "Added to Wallet" : "Apple / Google Wallet"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: CampusHub Attendant Scanner (Staff Mode) */}
        {activeTab === "attendant" && (
          <div className="p-6 flex flex-col items-center">
            {/* Viewfinder / Camera Simulation */}
            <div className="w-full aspect-[4/3] rounded-3xl bg-neutral-950 relative overflow-hidden flex flex-col items-center justify-center border-2 border-primary/40 shadow-inner">
              {/* Subtle camera video scanline */}
              <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

              {/* Viewfinder Target Reticle */}
              <div className="w-44 h-44 border-2 border-primary/80 rounded-2xl relative flex items-center justify-center">
                {/* Target Corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-secondary-container rounded-tl" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-secondary-container rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-secondary-container rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-secondary-container rounded-br" />

                {/* Laser scan line animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#c1ee78] to-transparent animate-bounce shadow-[0_0_12px_#c1ee78]" />
              </div>

              {/* Attendant HUD Overlay */}
              <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono font-bold text-white/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  PROCTOR GATE B • OPTICAL SCANNER
                </span>
                <span>LATENCY: 12ms</span>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono font-bold text-white/80">
                <span>CHECKED IN: {checkedInCount}</span>
                <span>SECURITY: SHA-256 OK</span>
              </div>
            </div>

            {/* Verification Status Feedback Card */}
            {scanStatus === "verified" ? (
              <div className="w-full mt-4 p-4 rounded-2xl bg-secondary-container/30 border border-secondary/40 text-left animate-in fade-in zoom-in-95 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-xl font-bold">
                      check_circle
                    </span>
                    <span className="font-headline font-extrabold text-xs text-on-surface uppercase tracking-wide">
                      Attendance Logged &amp; Verified
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed">
                    ENTRY #00{checkedInCount}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-outline-variant/30">
                  <div>
                    <span className="text-[10px] text-outline font-mono block">ATTENDEE</span>
                    <span className="font-bold text-on-surface">{studentName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline font-mono block">INSTITUTION ID</span>
                    <span className="font-mono font-bold text-primary">{studentId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline font-mono block">TIER &amp; KIT</span>
                    <span className="font-bold text-on-surface">Tee Size M + Medal Granted</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline font-mono block">LEDGER STATUS</span>
                    <span className="font-mono text-emerald-600 font-bold">Confirmed ✓</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full mt-4 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center text-xs text-on-surface-variant">
                Align student QR pass in the reticle or click simulate below.
              </div>
            )}

            {/* Scanner Controls */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={scanStatus === "scanning"}
                className="py-3 px-4 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">
                  {scanStatus === "scanning" ? "sync" : "center_focus_strong"}
                </span>
                {scanStatus === "scanning"
                  ? "Verifying Token…"
                  : scanStatus === "verified"
                  ? "Scan Next Attendee"
                  : "Simulate Gate Check-In"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pass")}
                className="py-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs transition-colors"
              >
                Back to Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

