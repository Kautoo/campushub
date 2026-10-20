/**
 * CampusHub - Site Configuration & Application Metadata
 */

export const siteConfig = {
  name: "CampusHub",
  description: "Campus commerce and fundraising platform for student organizations and university communities.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    github: "https://github.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;

