"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlideSelect, SpotlightCard } from "@/components/ui/react-bits";

export default function OrganizerEventsEditorPage() {
  const [eventTitle, setEventTitle] = useState(
    "Autonomous Drone Swarm & Neural SLAM Workshop"
  );
  const [eventPitch, setEventPitch] = useState(
    "Hands-on flight controller tuning, onboard vision inference, and live flight cage demos at Huang Basement. Free boba for first 50 RSVPs."
  );
  const [eventCategory, setEventCategory] = useState("Tech & AI");
  const [eventDate, setEventDate] = useState("2025-11-14");
  const [eventTime, setEventTime] = useState("17:00");
  const [eventEndTime, setEventEndTime] = useState("20:00");
  const [eventVenue, setEventVenue] = useState(
    "Huang Engineering Amphitheater (Cap: 250)"
  );
  const [aiTone, setAiTone] = useState<"editorial" | "technical" | "urgent">(
    "editorial"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAiPolish = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (aiTone === "editorial") {
        setEventPitch(
          "Hosted by the IEEE Robotics & AI Society: Join 150+ student builders for live autonomous flight cage trials, onboard CUDA vision workshops, and late-night boba networking under Huang Amphitheater."
        );
      } else if (aiTone === "technical") {
        setEventPitch(
          "Hands-on embedded systems workshop covering PX4 flight controller tuning, stereo Neural SLAM with TensorRT onboard Jetson Orin Nano, and Kalman filter sensor fusion benchmarks."
        );
      } else {
        setEventPitch(
          "⚠️ Limited 50-pass lab capacity: Autonomous flight cage access and free collegiate build kits for verified RSVPs only. Doors lock promptly at 17:15."
        );
      }
      setIsGenerating(false);
    }, 700);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary font-label mb-1">
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>Event Management &amp; Publishing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
            Event Manager &amp; Editor
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Configure poster details, verify zero university timetable clashes, and polish copy with AI.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/organizer/tickets"
            className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-base text-primary">confirmation_number</span>
            <span>Configure Tickets</span>
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-secondary-container/40 border border-secondary/30 text-on-secondary-fixed text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
          <span>Event details and academic conflict verification saved successfully!</span>
        </div>
      )}

      {/* Editor Form & Live Preview Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor Fields */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Event Identity */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold font-headline text-on-surface">
                1. Event Identity &amp; Classification
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-outline text-[10px] font-mono font-bold">
                CORE DETAILS
              </span>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                Event Title
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-sm font-bold text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Category
                </label>
                <GlideSelect
                  className="w-full"
                  options={[
                    { value: "Tech & AI", label: "Tech & AI", tag: "STEM" },
                    { value: "Design & Culture", label: "Design & Culture", tag: "Arts" },
                    { value: "Sports & Wellness", label: "Sports & Wellness", tag: "Active" },
                    { value: "Venture & Pitch", label: "Venture & Pitch", tag: "Startups" },
                  ]}
                  value={eventCategory}
                  onChange={(val) => setEventCategory(val)}
                  ariaLabel="Event Category"
                  menuWidth={220}
                  size="lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Start / End Time
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-1/2 px-2.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface"
                  />
                  <span className="text-outline text-xs">–</span>
                  <input
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-1/2 px-2.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                Campus Venue &amp; Room
              </label>
              <input
                type="text"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Section 2: AI Copywriting Polish */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold font-headline text-on-surface">
                  2. Event Pitch &amp; AI Copy Assistant
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Generate high-conversion student invitations with campus tone presets.
                </p>
              </div>

              {/* Tone Selector */}
              <div className="flex rounded-xl bg-surface-container-low p-1 border border-outline-variant/30 text-xs">
                {(["editorial", "technical", "urgent"] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setAiTone(tone)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                      aiTone === tone
                        ? "bg-secondary-container text-on-secondary-fixed shadow-2xs"
                        : "text-outline hover:text-on-surface"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                rows={4}
                value={eventPitch}
                onChange={(e) => setEventPitch(e.target.value)}
                className="w-full p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface leading-relaxed focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-outline font-mono">
                {eventPitch.length} characters • Tone: {aiTone}
              </span>
              <button
                type="button"
                onClick={handleAiPolish}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-fixed font-headline font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm text-secondary">auto_awesome</span>
                <span>{isGenerating ? "Polishing with AI..." : "Enhance Pitch"}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Academic Conflict Verification */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-lg">verified_user</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline font-bold text-xs text-on-surface">
                Campus Registrar Schedule Sync: Cleared ✓
              </h3>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Zero conflicts with CS / EE Midterm schedules on {eventDate}. Projected student attendance capacity index: 94%.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Poster Card & Publishing Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Switch Card */}
          <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
            <h3 className="font-headline font-bold text-sm text-on-surface">
              Publishing State
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/25">
              <div>
                <span className="font-bold text-xs block text-on-surface">
                  {isPublished ? "Live on Campus Feed" : "Draft (Unlisted)"}
                </span>
                <span className="text-[10px] text-outline block">
                  {isPublished ? "Visible to all students" : "Only organizers can preview"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isPublished ? "bg-primary" : "bg-outline-variant"
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform absolute top-0.5 ${
                    isPublished ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2 text-xs text-on-surface-variant">
              <div className="flex justify-between py-1 border-b border-outline-variant/15">
                <span>Direct URL</span>
                <span className="font-mono text-primary font-semibold">/events/swarm-slam</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/15">
                <span>Fast-Pass Mode</span>
                <span className="font-semibold text-on-surface">Dynamic rolling QR</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Gate Staff</span>
                <span className="font-semibold text-on-surface">2 Turnstiles</span>
              </div>
            </div>
          </div>

          {/* Live Mobile Card Preview */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline block">
              Live Student View Preview
            </span>
            <SpotlightCard className="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-mono font-bold">
                  {eventCategory}
                </span>
                <span className="text-[10px] font-mono text-outline font-semibold">
                  {eventDate} • {eventTime}
                </span>
              </div>

              <h3 className="font-headline font-extrabold text-base text-on-surface leading-snug">
                {eventTitle}
              </h3>

              <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                {eventPitch}
              </p>

              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <span className="text-[11px] text-outline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span>Amphitheater</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-primary text-on-primary font-headline font-bold text-[11px]">
                  RSVP Fast-Pass
                </span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </form>
    </div>
  );
}

