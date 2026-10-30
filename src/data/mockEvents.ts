export interface EventPlan {
  id: string;
  code: string;
  name: string;
  price: number;
  badge?: string;
  description: string;
  perks: string[];
}

export interface CampusEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category:
    | "Athletics & Fun Runs"
    | "Green & Community"
    | "Tech & Hackathons"
    | "Workshops & Design"
    | "E-Sports"
    | "Tech & AI"
    | "General";
  date: string;
  month: string;
  dayNumber: number;
  dayOfWeek: string;
  fullDayName: string;
  time: string;
  location: string;
  venueHref: string;
  organizer: string;
  isFree: boolean;
  totalCapacity: number;
  registeredCount: number;
  image: string;
  plans: EventPlan[];
  hasTeeSize?: boolean;
  status?: "DRAFT" | "PUBLISHED" | "CLOSED";
  slug?: string;
  organizationId?: string;
  createdBy?: string;
  currency?: string;
}

export const CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: "neon_fun_run_5k",
    title: "Neon 5K Campus Fun Run & Night Lights",
    subtitle: "Illuminated evening campus loop with live DJ pacers & glow kits",
    description:
      "Join 1,200+ students running the dusk loop through Main Quad, Memorial Arch, and Lake Lagunita. Select your entry plan below—choose Plan A for the race shirt only, Plan B for the full shirt + finisher medal + acai recovery bundle, or Plan C to volunteer.",
    category: "Athletics & Fun Runs",
    date: "Saturday, Nov 8, 2025",
    month: "NOV",
    dayNumber: 8,
    dayOfWeek: "SAT",
    fullDayName: "Saturday",
    time: "6:30 PM PST",
    location: "Main Quad Archway → Lake Lagunita Loop",
    venueHref: "/map",
    organizer: "Stanford Running Club & ASSU Wellness Guild",
    isFree: false,
    totalCapacity: 1200,
    registeredCount: 1016,
    image:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: true,
    status: "PUBLISHED",
    slug: "neon-5k-campus-fun-run",
    organizationId: "org_engineering",
    createdBy: "usr_organizer_sarah",
    currency: "USD",
    plans: [
      {
        id: "plan_a",
        code: "PLAN A",
        name: "Runner Tech Tee Only",
        price: 12,
        description:
          "Official moisture-wicking neon tech shirt, custom race bib & timing chip.",
        perks: [
          "Collegiate Dry-Fit Neon Runner Tee",
          "Custom Name Race Bib & RFID Timing",
          "Course Hydration & Electrolyte Gels",
        ],
      },
      {
        id: "plan_b",
        code: "PLAN B",
        name: "Tech Tee + Finisher Medal + Acai Bowl",
        price: 22,
        badge: "Most Popular",
        description:
          "Full race kit with heavyweight die-cast finisher medal & post-run acai bowl.",
        perks: [
          "Collegiate Dry-Fit Neon Runner Tee",
          "Heavyweight Die-Cast 2025 Finisher Medal",
          "LED Pulse Glow Wristband & Headlamp",
          "Post-Run Organic Acai Bowl Voucher",
        ],
      },
      {
        id: "plan_c",
        code: "PLAN C",
        name: "Volunteer Course Marshall",
        price: 0,
        badge: "Free Crew",
        description:
          "Support runners at hydration stations, earn service hours & get crew gear.",
        perks: [
          "Free Hi-Vis Volunteer Crew Vest",
          "4 Certified Community Service Hours",
          "Post-Race Finish Line Dinner Access",
        ],
      },
    ],
  },
  {
    id: "sunday_plogging_cleanup",
    title: "Sunday Campus Plogging & Eco Trail Cleanup",
    subtitle: "Community morning jog & litter cleanup • Eco kits & fresh bagels included",
    description:
      "A zero-waste Swedish fitness tradition combining a relaxed 4K morning jog with trail restoration around Lake Lagunita. Completely free for all students with biodegradable gloves, reusable tote bags, and hot bagels at the finish.",
    category: "Green & Community",
    date: "Sunday, Nov 9, 2025",
    month: "NOV",
    dayNumber: 9,
    dayOfWeek: "SUN",
    fullDayName: "Sunday",
    time: "8:30 AM PST",
    location: "Lake Lagunita Trailhead • Boathouse Dock",
    venueHref: "/map",
    organizer: "Students for Sustainable Stanford (SSS)",
    isFree: true,
    totalCapacity: 350,
    registeredCount: 284,
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: false,
    status: "PUBLISHED",
    slug: "sunday-campus-plogging",
    organizationId: "org_sustainable",
    createdBy: "usr_organizer_elena",
    currency: "USD",
    plans: [
      {
        id: "plan_free_plog",
        code: "COMMUNITY PASS",
        name: "Free Community Plogger Registration",
        price: 0,
        badge: "100% Free",
        description:
          "All cleanup gear and breakfast refreshments sponsored by the Sustainability Fund.",
        perks: [
          "Biodegradable Gloves & Grabber Tool",
          "CampusHub Heavyweight Organic Canvas Tote",
          "Fresh Bagels & Cold Brew Coffee",
          "3 Certified Sustainability Service Hours",
        ],
      },
    ],
  },
  {
    id: "treehacks_autumn_2025",
    title: "TreeHacks Autumn Hackathon & AI Showcase",
    subtitle: "36 hours of engineering, $50,000 prize pool & hardware lab loaners",
    description:
      "California's flagship collegiate hackathon. Build frontier robotics agents, spatial interfaces, and climate hardware. Free admission for verified students with 6 catered meals, GPU compute credits, and hardware loaners.",
    category: "Tech & Hackathons",
    date: "Friday, Nov 14, 2025",
    month: "NOV",
    dayNumber: 14,
    dayOfWeek: "FRI",
    fullDayName: "Friday",
    time: "5:00 PM PST",
    location: "Huang Engineering Amphitheater & Atrium",
    venueHref: "/map",
    organizer: "Stanford ACM & IEEE Student Chapter",
    isFree: true,
    totalCapacity: 800,
    registeredCount: 742,
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: true,
    status: "PUBLISHED",
    slug: "treehacks-autumn-2025",
    organizationId: "org_engineering",
    createdBy: "usr_organizer_sarah",
    currency: "USD",
    plans: [
      {
        id: "plan_hacker",
        code: "HACKER RSVP",
        name: "Verified Student Hacker Pass (Solo or Team)",
        price: 0,
        badge: "Free Admission",
        description:
          "Full 36-hour building access, GPU credits, hardware lab loaners, and meals.",
        perks: [
          "36-Hour Lab Access & $250 Cloud GPU Credits",
          "All 6 Catered Meals + Espresso Bar",
          "Exclusive TreeHacks Archival Hoodie",
          "Hardware Bench Loaners (Jetson, Quest 3, LiDAR)",
        ],
      },
    ],
  },
  {
    id: "figma_ai_masterclass",
    title: "Figma Design Systems & AI Prototyping Studio",
    subtitle: "Hands-on studio critique on multi-brand tokens & generative interfaces",
    description:
      "Led by visiting staff product designers from Linear and Apple. Bring your laptop for a deep dive into design token architecture, physics-based micro-interactions, and live portfolio reviews.",
    category: "Workshops & Design",
    date: "Wednesday, Nov 19, 2025",
    month: "NOV",
    dayNumber: 19,
    dayOfWeek: "WED",
    fullDayName: "Wednesday",
    time: "5:30 PM PST",
    location: "d.school Studio 2 • Building 550",
    venueHref: "/map",
    organizer: "Stanford UX & Design Association",
    isFree: true,
    totalCapacity: 120,
    registeredCount: 114,
    image:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: false,
    status: "PUBLISHED",
    slug: "figma-ai-masterclass",
    organizationId: "org_arts",
    createdBy: "usr_organizer_marcus",
    currency: "USD",
    plans: [
      {
        id: "plan_workshop_free",
        code: "STUDIO SEAT",
        name: "Free Studio Seat & Figma Kit",
        price: 0,
        badge: "Free RSVP",
        description:
          "Includes starter design system file and 1-on-1 portfolio review session.",
        perks: [
          "Reserved Studio Desk & Figma Token Library",
          "1-on-1 Portfolio Critique with Industry Mentors",
          "Complimentary Matcha & Artisanal Pastries",
        ],
      },
    ],
  },
  {
    id: "esports_championship_2025",
    title: "Stanford Collegiate E-Sports LAN Invitational",
    subtitle: "Valorant & Rocket League grand finals with live stage & player jerseys",
    description:
      "Annual intercollegiate LAN arena battle inside Tresidder Grand Ballroom. Choose Plan A for general spectator seating with pizza & drinks, or Plan B for a competitor tournament slot with a custom gamertag jersey and medal.",
    category: "E-Sports",
    date: "Saturday, Nov 22, 2025",
    month: "NOV",
    dayNumber: 22,
    dayOfWeek: "SAT",
    fullDayName: "Saturday",
    time: "1:00 PM PST",
    location: "Tresidder Student Union Grand Ballroom",
    venueHref: "/map",
    organizer: "Stanford Gaming & E-Sports Guild",
    isFree: false,
    totalCapacity: 450,
    registeredCount: 388,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: true,
    status: "PUBLISHED",
    slug: "esports-autumn-invitational",
    organizationId: "org_sae",
    createdBy: "usr_organizer_sarah",
    currency: "USD",
    plans: [
      {
        id: "plan_esports_a",
        code: "PLAN A",
        name: "Spectator Arena Pass + Pizza & Drinks",
        price: 8,
        description:
          "All-day mainstage viewing, 2 artisan pizza slices & energy drink voucher.",
        perks: [
          "Reserved Mainstage Spectator Seating",
          "2 Slices Artisan Pizza + Energy Drink",
          "Hardware Raffle Ticket (Keyboards & Mice)",
        ],
      },
      {
        id: "plan_esports_b",
        code: "PLAN B",
        name: "Competitor Slot + Custom Jersey + Medal",
        price: 18,
        badge: "Player Kit",
        description:
          "Tournament roster entry with custom sublimated jersey & commemorative medal.",
        perks: [
          "240Hz LAN Tournament Station Access",
          "Custom Sublimated Team Jersey",
          "Die-Cast Mechanical Keycap Finisher Medal",
          "$5,000 Prize Pool Eligibility",
        ],
      },
    ],
  },
];
