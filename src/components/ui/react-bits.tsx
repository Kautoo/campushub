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
 * 7. STITCH UI KIT: FAST-PASS NFC / QR MODAL
 * Reusable verified pass modal for events, smart lockers, and student ID
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
  passCode = "CH-8821-94A",
  studentName = "Alex Rivera",
  studentId = "#STU-882194",
  location = "Huang Engineering Center • Gate B",
  badgeLabel = "ACTIVE ENTRY PASS",
}: FastPassModalProps) {
  const [addedToWallet, setAddedToWallet] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#131b2e]/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-[2rem] border border-[#c4c8b7]/40 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Olive/Navy Header */}
        <div className="bg-gradient-to-br from-[#131b2e] via-[#1e2942] to-[#283044] p-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#c1ee78]/15 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c1ee78]/20 text-[#c1ee78] text-[10px] font-bold uppercase tracking-widest mb-2 border border-[#c1ee78]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c1ee78] animate-pulse" />
                {badgeLabel}
              </span>
              <h3 className="font-headline font-extrabold text-xl leading-tight">
                {title}
              </h3>
              <p className="text-xs text-[#c1ee78] font-mono mt-1">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* QR & NFC Body */}
        <div className="p-6 flex flex-col items-center">
          <div className="p-5 bg-[#faf8ff] rounded-3xl border-2 border-dashed border-[#4b671b]/30 mb-4 relative group">
            <div className="w-44 h-44 bg-white rounded-2xl p-3 flex flex-col items-center justify-center border border-[#c4c8b7]/40 shadow-inner">
              <span
                className="material-symbols-outlined text-[#131b2e] text-[128px] leading-none select-none"
                style={{ fontVariationSettings: "'wght' 300" }}
              >
                qr_code_2
              </span>
            </div>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#c1ee78] text-[#121f00] font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap">
              NFC + Optical Ready
            </span>
          </div>

          <p className="font-mono text-sm font-bold text-[#131b2e] tracking-widest mt-2">
            {passCode}
          </p>
          <p className="text-xs text-[#44483b] mt-1 text-center">{location}</p>

          <div className="w-full mt-5 p-3.5 rounded-2xl bg-[#f2f3ff] border border-[#c4c8b7]/30 flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#75796a]">
                Verified Holder
              </p>
              <p className="font-bold text-[#131b2e] mt-0.5">{studentName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#75796a]">
                Institutional ID
              </p>
              <p className="font-mono font-bold text-[#4b671b] mt-0.5">
                {studentId}
              </p>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mt-5">
            <button
              type="button"
              onClick={() => setAddedToWallet(true)}
              className={cn(
                "py-3 px-4 rounded-xl font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all",
                addedToWallet
                  ? "bg-[#c1ee78] text-[#121f00]"
                  : "bg-[#131b2e] text-white hover:bg-[#283044]"
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
              className="py-3 px-4 rounded-xl bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] font-headline font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

