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
  const [rollingTimer, setRollingTimer] = useState(28);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setRollingTimer((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const publicVerificationUrl = `https://campushub.edu/events?pass=${encodeURIComponent(
    passCode
  )}&student=${encodeURIComponent(studentName)}`;

  const handleSimulateScan = () => {
    setScanStatus("scanning");
    setTimeout(() => {
      setScanStatus("verified");
      setCheckedInCount((prev) => prev + 1);
    }, 850);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#131b2e]/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] max-h-[92vh] flex flex-col bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ticket Header */}
        <div className="bg-gradient-to-br from-[#131b2e] via-[#1a243b] to-[#2c3d18] p-5 text-white relative overflow-hidden shrink-0">
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-[#c1ee78]/15 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start relative z-10 mb-3">
            <div className="pr-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c1ee78]/20 text-[#c1ee78] text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-[#c1ee78]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c1ee78] animate-pulse" />
                {badgeLabel}
              </span>
              <h3 className="font-headline font-extrabold text-lg leading-tight line-clamp-1">
                {title}
              </h3>
              <p className="text-[11px] text-[#c1ee78] font-mono mt-0.5">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close pass modal"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="relative z-10 grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("pass")}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                activeTab === "pass"
                  ? "bg-[#c1ee78] text-[#121f00] shadow-xs"
                  : "text-white/70 hover:text-white"
              )}
            >
              <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
              <span>Fast-Pass</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("attendant")}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                activeTab === "attendant"
                  ? "bg-[#c1ee78] text-[#121f00] shadow-xs"
                  : "text-white/70 hover:text-white"
              )}
            >
              <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
              <span>Turnstile Mode</span>
            </button>
          </div>
        </div>

        {/* Perforated Ticket Notches Divider */}
        <div className="relative flex items-center justify-between -my-2.5 z-20 pointer-events-none">
          <div className="w-4 h-6 bg-[#131b2e]/65 rounded-r-full border-r border-t border-b border-outline-variant/30" />
          <div className="flex-1 border-b-2 border-dashed border-outline-variant/40 mx-2" />
          <div className="w-4 h-6 bg-[#131b2e]/65 rounded-l-full border-l border-t border-b border-outline-variant/30" />
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto max-h-[calc(92vh-180px)] p-5 flex flex-col items-center">
          {/* Tab 1: Dynamic Student QR Pass */}
          {activeTab === "pass" && (
            <div className="w-full flex flex-col items-center">
              {/* Rolling QR Pass Display */}
              <div className="p-3 bg-surface-container-low rounded-2xl border border-primary/20 mb-2 relative group flex flex-col items-center">
                <div className="w-40 h-40 bg-white rounded-xl p-2 flex flex-col items-center justify-center border border-outline-variant/40 shadow-inner relative overflow-hidden">
                  <span
                    className="material-symbols-outlined text-[#131b2e] text-[136px] leading-none select-none"
                    style={{ fontVariationSettings: "'wght' 300" }}
                  >
                    qr_code_2
                  </span>
                  {/* Center Shield Stamp */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-lg bg-[#131b2e] border-2 border-[#c1ee78] flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[#c1ee78] text-base">
                        school
                      </span>
                    </div>
                  </div>
                </div>
                {/* 30s Countdown Pill */}
                <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>Rolling QR • Token refreshes in {rollingTimer}s</span>
                </div>
              </div>

              <p className="font-mono text-xs font-extrabold text-on-surface tracking-wider mt-1">
                {passCode}
              </p>
              <p className="text-[11px] text-on-surface-variant text-center mt-0.5">
                {location}
              </p>

              {/* Verified Holder Card */}
              <div className="w-full mt-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    Passholder
                  </p>
                  <p className="font-bold text-on-surface mt-0.5">{studentName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    Student ID
                  </p>
                  <p className="font-mono font-bold text-primary mt-0.5">
                    {studentId}
                  </p>
                </div>
              </div>

              {/* Dual Mode Camera Info */}
              <div className="w-full mt-2.5 p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25 text-[11px] text-on-surface-variant flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">verified</span>
                  <span>Instant NFC &amp; Turnstile Ready</span>
                </span>
                <a
                  href={publicVerificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-mono font-bold text-[10px]"
                >
                  Verify ↗
                </a>
              </div>

              {/* Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setAddedToWallet(true)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs",
                    addedToWallet
                      ? "bg-secondary-container text-on-secondary-fixed"
                      : "bg-on-surface text-surface hover:bg-on-surface/90"
                  )}
                >
                  <span className="material-symbols-outlined text-sm">
                    {addedToWallet ? "check_circle" : "account_balance_wallet"}
                  </span>
                  <span>{addedToWallet ? "Added ✓" : "Add to Wallet"}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Turnstile Scanner (Attendant Mode) */}
          {activeTab === "attendant" && (
            <div className="w-full flex flex-col items-center">
              {/* Scanner Reticle Frame */}
              <div className="w-full aspect-[16/10] rounded-2xl bg-neutral-950 relative overflow-hidden flex flex-col items-center justify-center border border-primary/40 shadow-inner">
                {/* Laser scan line */}
                <div className="w-36 h-36 border border-primary/60 rounded-xl relative flex items-center justify-center">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#c1ee78] rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#c1ee78] rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#c1ee78] rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#c1ee78] rounded-br" />
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#c1ee78] to-transparent animate-bounce shadow-[0_0_8px_#c1ee78]" />
                </div>

                {/* HUD Top Bar */}
                <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[9px] font-mono font-bold text-white/80">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    GATE B SCANNER
                  </span>
                  <span>CHECKED IN: {checkedInCount}</span>
                </div>
              </div>

              {/* Scan Feedback */}
              {scanStatus === "verified" ? (
                <div className="w-full mt-3 p-3 rounded-xl bg-secondary-container/25 border border-secondary/40 text-left animate-in fade-in space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-headline font-bold text-xs text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                      Validated Pass
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed">
                      #00{checkedInCount}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-on-surface">
                    {studentName} • {studentId}
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-mono">
                    Tier: General Student • Turnstile Unlocked ✓
                  </p>
                </div>
              ) : (
                <div className="w-full mt-3 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center text-xs text-on-surface-variant">
                  Point camera at student Dynamic QR or simulate below.
                </div>
              )}

              {/* Controls */}
              <div className="w-full grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  disabled={scanStatus === "scanning"}
                  className="py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">
                    {scanStatus === "scanning" ? "sync" : "center_focus_strong"}
                  </span>
                  <span>
                    {scanStatus === "scanning"
                      ? "Verifying…"
                      : scanStatus === "verified"
                      ? "Next Pass"
                      : "Simulate Scan"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("pass")}
                  className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs transition-colors"
                >
                  Show My Pass
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

