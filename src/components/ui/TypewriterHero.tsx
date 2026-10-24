"use client";

import React, { useState, useEffect } from "react";
import { useIntro } from "@/context/IntroContext";
import { cn } from "@/lib/utils";

const LEAD_TEXT = "The art of ";
const HIGHLIGHT_TEXT = "every gathering ";
const TRAIL_TEXT = "on campus.";
const FULL_TEXT = LEAD_TEXT + HIGHLIGHT_TEXT + TRAIL_TEXT;

export function TypewriterHero() {
  const { stage, setStage, replayIntro } = useIntro();
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (stage !== "typing") {
      setCharIndex(FULL_TEXT.length);
      return;
    }

    setCharIndex(0);
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setCharIndex(index);
      if (index >= FULL_TEXT.length) {
        clearInterval(interval);
        // Stage transition: text finishes typing -> slide down navbar
        setTimeout(() => {
          setStage("navbar");
          // Stage transition: navbar in place -> bloom the rest of the stage
          setTimeout(() => {
            setStage("complete");
          }, 380);
        }, 220);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [stage, setStage]);

  // Derive visible portions
  const isTypingActive = stage === "typing";
  const currentLead = isTypingActive
    ? FULL_TEXT.slice(0, Math.min(charIndex, LEAD_TEXT.length))
    : LEAD_TEXT;

  const currentHighlight = isTypingActive
    ? charIndex > LEAD_TEXT.length
      ? FULL_TEXT.slice(
          LEAD_TEXT.length,
          Math.min(charIndex, LEAD_TEXT.length + HIGHLIGHT_TEXT.length)
        )
      : ""
    : HIGHLIGHT_TEXT;

  const currentTrail = isTypingActive
    ? charIndex > LEAD_TEXT.length + HIGHLIGHT_TEXT.length
      ? FULL_TEXT.slice(LEAD_TEXT.length + HIGHLIGHT_TEXT.length, charIndex)
      : ""
    : TRAIL_TEXT;

  return (
    <div className="relative inline-block">
      <h1 className="font-extrabold tracking-tight text-on-surface font-headline leading-[1.08] text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4">
        <span>{currentLead}</span>
        {currentHighlight && (
          <span className="font-editorial italic font-normal text-primary px-1">
            {currentHighlight}
          </span>
        )}
        <span>{currentTrail}</span>
        {isTypingActive && (
          <span
            aria-hidden="true"
            className="inline-block w-[3px] md:w-[4px] h-[0.85em] ml-1.5 bg-primary rounded-full align-middle animate-pulse shadow-[0_0_8px_rgba(75,103,27,0.7)]"
          />
        )}
      </h1>
    </div>
  );
}

