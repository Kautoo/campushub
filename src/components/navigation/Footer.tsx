"use client";

import React from "react";
import DoodleCrewFooter from "@/components/ui/doodle-crew-footer";

export function Footer() {
  return (
    <DoodleCrewFooter
      wordmark="CAMPUSHUB"
      brand="CampusHub"
      blurb="The unified campus network. Live hackathon passes, 2-hour smart locker merch, recognized societies, and AI-synced college life."
      tagline="A hand-drawn world for the creators, night owls and builders on campus."
      copyright="© 2026 CampusHub Platform. All rights reserved."
      preset="auto"
      palette={{
        background: "var(--color-surface, #faf8ff)",
        ink: "var(--color-on-surface, #131b2e)",
        accent: "var(--color-primary, #4b671b)",
      }}
      fontFamily='"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      serifFamily='"Instrument Serif", "Iowan Old Style", Georgia, serif'
      className="border-t border-outline-variant/30 mt-16"
      columns={[
        {
          title: "Discovery",
          links: [
            { label: "Explore Campus", href: "/" },
            { label: "Campus Events", href: "/events" },
            { label: "Clubs Directory", href: "/clubs" },
            { label: "Smart Lockers", href: "/shop" },
          ],
        },
        {
          title: "Experiences",
          links: [
            { label: "Pass Generator", href: "/account" },
            { label: "AI Copilot", href: "/copilot" },
            { label: "Merch Vault", href: "/shop" },
            { label: "Fast-Pass Scanner", href: "/account" },
          ],
        },
        {
          title: "Student Life",
          links: [
            { label: "Discord Community", href: "#" },
            { label: "Late-Night Hackathons", href: "/events" },
            { label: "Student Union", href: "#" },
            { label: "Safety & Turnstiles", href: "#" },
          ],
        },
        {
          title: "Ecosystem",
          links: [
            { label: "Organizer Hub", href: "/organizer" },
            { label: "System Status", href: "#" },
            { label: "Developer API", href: "#" },
            { label: "Contact Us", href: "#" },
          ],
        },
      ]}
      actions={[
        {
          label: "Claim Fast-Pass",
          href: "/account",
          icon: "sandwich",
          variant: "outline",
        },
        {
          label: "Ask Copilot",
          href: "/copilot",
          icon: "bolt",
          variant: "solid",
        },
      ]}
    />
  );
}

export default Footer;
