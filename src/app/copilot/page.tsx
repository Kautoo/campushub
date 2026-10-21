"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  SpotlightCard,
  FastPassModal,
  AnimatedContent,
  GlideSelect,
  PromptBar,
  ThoughtLine,
  LatticeLoader,
  type PromptBarSendMeta,
} from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";
import {
  Attachment01Icon,
  Calendar03Icon,
  ChartLineData01Icon,
  File02Icon,
  Globe02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";

/* ============================================================================
 * GRADE POINT SCALE & CGPA ENGINE
 * ============================================================================ */
const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

const GRADE_OPTIONS = Object.keys(GRADE_POINTS).map((g) => ({
  value: g,
  label: `${g} (${GRADE_POINTS[g].toFixed(1)})`,
  tag: `${GRADE_POINTS[g].toFixed(1)} pts`,
}));

export interface CourseRow {
  id: string;
  code: string;
  title: string;
  units: number;
  grade: string;
}

const INITIAL_COURSES: CourseRow[] = [
  {
    id: "c1",
    code: "CS 229",
    title: "Machine Learning",
    units: 4,
    grade: "A",
  },
  {
    id: "c2",
    code: "DESIGN 101",
    title: "Spatial & Haptic Systems",
    units: 4,
    grade: "A",
  },
  {
    id: "c3",
    code: "EE 263",
    title: "Intro to Linear Dynamical Systems",
    units: 3,
    grade: "A-",
  },
  {
    id: "c4",
    code: "ECON 102B",
    title: "Applied Econometrics",
    units: 4,
    grade: "B+",
  },
  {
    id: "c5",
    code: "ENGR 145",
    title: "Technology Entrepreneurship",
    units: 3,
    grade: "A",
  },
];

export interface CgpaSummaryData {
  semesterUnits: number;
  semesterPoints: number;
  semesterGpa: number;
  priorUnits: number;
  priorGpa: number;
  cumulativeUnits: number;
  cumulativeGpa: number;
  courses: CourseRow[];
  targetGpa?: number;
  requiredNextGpa?: number;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  modelName?: string;
  effortLevel?: string;
  attachments?: string[];
  working?: boolean;
  steps?: string[];
  cgpaData?: CgpaSummaryData;
  codeBlock?: { language: string; code: string };
  recommendations?: {
    id: string;
    fitScore: string;
    title: string;
    timeWindow: string;
    location: string;
    conflictNote: string;
  }[];
}

function computeCgpaStats(
  courses: CourseRow[],
  priorGpa: number,
  priorUnits: number,
  targetCgpa = 3.95
): CgpaSummaryData {
  let semesterUnits = 0;
  let semesterPoints = 0;
  for (const c of courses) {
    const u = Math.max(0, Number(c.units) || 0);
    const gp = GRADE_POINTS[c.grade] ?? 4.0;
    semesterUnits += u;
    semesterPoints += u * gp;
  }
  const semesterGpa = semesterUnits > 0 ? semesterPoints / semesterUnits : 0;
  const totalPriorPoints = priorGpa * priorUnits;
  const cumulativeUnits = priorUnits + semesterUnits;
  const cumulativeGpa =
    cumulativeUnits > 0
      ? (totalPriorPoints + semesterPoints) / cumulativeUnits
      : semesterGpa;

  const neededSemesterPoints =
    targetCgpa * cumulativeUnits - totalPriorPoints;
  const requiredNextGpa =
    semesterUnits > 0 ? neededSemesterPoints / semesterUnits : 0;

  return {
    semesterUnits,
    semesterPoints,
    semesterGpa,
    priorUnits,
    priorGpa,
    cumulativeUnits,
    cumulativeGpa,
    courses,
    targetGpa: targetCgpa,
    requiredNextGpa,
  };
}

/**
 * Parses natural language course/grade mentions such as:
 * "A in CS229 (4 units), B+ in ECON102 (3 credits)" or "4 units A, 3 units B+"
 */
function parseCoursesFromPrompt(prompt: string): CourseRow[] | null {
  const parsed: CourseRow[] = [];
  const regex =
    /\b([A-DF][+-]?)\s+(?:in|for)?\s*([A-Z]{2,6}\s*\d{1,3}[A-Z]?)\s*(?:\(?(\d+)\s*(?:units?|credits?|cr|u)\)?)?/gi;
  let match: RegExpExecArray | null;
  let idx = 1;
  while ((match = regex.exec(prompt)) !== null) {
    const grade = match[1].toUpperCase();
    const code = match[2].toUpperCase().replace(/\s+/g, " ");
    const units = match[3] ? parseInt(match[3], 10) : 4;
    if (GRADE_POINTS[grade] !== undefined) {
      parsed.push({
        id: `parsed_${idx++}`,
        code,
        title: `Parsed Course ${code}`,
        units,
        grade,
      });
    }
  }

  if (parsed.length > 0) return parsed;

  // Also check pattern: "CS 229 (4 units) A-" or "CS229: A (4u)"
  const altRegex =
    /\b([A-Z]{2,6}\s*\d{1,3}[A-Z]?)\s*(?:\(?(\d+)\s*(?:units?|credits?|u)\)?)?\s*[:=-]?\s*\b([A-DF][+-]?)\b/gi;
  while ((match = altRegex.exec(prompt)) !== null) {
    const code = match[1].toUpperCase().replace(/\s+/g, " ");
    const units = match[2] ? parseInt(match[2], 10) : 4;
    const grade = match[3].toUpperCase();
    if (GRADE_POINTS[grade] !== undefined) {
      parsed.push({
        id: `parsed_alt_${idx++}`,
        code,
        title: `Course ${code}`,
        units,
        grade,
      });
    }
  }

  return parsed.length > 0 ? parsed : null;
}

/**
 * Safe arithmetic expression evaluator if a student asks a direct math calculation
 */
function tryEvaluateMath(prompt: string): string | null {
  const cleaned = prompt
    .replace(/what is|calculate|compute|solve|evaluate|equals|\?/gi, "")
    .trim();
  if (!/^[0-9+\-*/().^\s%]+$/.test(cleaned) || cleaned.length < 3) {
    return null;
  }
  try {
    const jsExpr = cleaned.replace(/\^/g, "**");
    const result = Function(`"use strict"; return (${jsExpr});`)();
    if (typeof result === "number" && Number.isFinite(result)) {
      return `${cleaned} = ${Number(result.toFixed(6))}`;
    }
  } catch {
    return null;
  }
  return null;
}

const PROMPT_SOURCES = [
  {
    key: "files",
    name: "Syllabus & Transcripts",
    description: "Upload PDF syllabus or registrar grade report",
    icon: Attachment01Icon,
    attach: true,
  },
  {
    key: "grades",
    name: "CGPA & Grade Ledger",
    description: "Sync current 3.92 GPA & 78 completed units",
    icon: ChartLineData01Icon,
  },
  {
    key: "web",
    name: "Campus Web & Registrar",
    description: "Live Stanford courses, rooms & events",
    icon: Globe02Icon,
  },
  {
    key: "docs",
    name: "Lecture Notes & Labs",
    description: "CS 229, DESIGN 101, EE 263 notes",
    icon: File02Icon,
  },
  {
    key: "mail",
    name: "Faculty & Club Mail",
    description: "Draft emails to professors or club leads",
    icon: Mail01Icon,
  },
  {
    key: "calendar",
    name: "Canvas & Google Cal",
    description: "24.5h free blocks & exam shield",
    icon: Calendar03Icon,
  },
];

const PROMPT_COMMANDS = [
  {
    key: "cgpa",
    name: "/cgpa",
    description: "Calculate semester GPA, cumulative CGPA & target grades",
  },
  {
    key: "schedule",
    name: "/schedule",
    description: "Find conflict-free study rooms, events & locker pickups",
  },
  {
    key: "explain",
    name: "/explain",
    description: "Step-by-step walkthrough of any STEM, CS, or Econ topic",
  },
  {
    key: "summarize",
    name: "/summarize",
    description: "Turn lecture notes or readings into high-yield bullet points",
  },
  {
    key: "tasks",
    name: "/tasks",
    description: "Generate a prioritized midterm & p-set study checklist",
  },
];

const PROMPT_MODELS = [
  { key: "horizon-pro", name: "Horizon 3.5 Pro", tag: "Academic + Math" },
  { key: "horizon-flash", name: "Horizon Flash", tag: "Instant" },
  { key: "deepseek-r1", name: "Campus Reasoning R1", tag: "Deep STEM" },
];

export default function AICopilotPage() {
  const [courses, setCourses] = useState<CourseRow[]>(INITIAL_COURSES);
  const [priorGpa, setPriorGpa] = useState<number>(3.92);
  const [priorUnits, setPriorUnits] = useState<number>(78);
  const [targetCgpa, setTargetCgpa] = useState<number>(3.95);
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseUnits, setNewCourseUnits] = useState("4");
  const [newCourseGrade, setNewCourseGrade] = useState("A");

  const [busy, setBusy] = useState(false);
  const [activeEffort, setActiveEffort] = useState("High");
  const [activePassRec, setActivePassRec] = useState<{
    title: string;
    timeWindow: string;
    location: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"chat" | "calculator" | "split">(
    "chat"
  );

  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const liveCgpa = computeCgpaStats(courses, priorGpa, priorUnits, targetCgpa);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg_welcome",
      role: "assistant",
      modelName: "Horizon 3.5 Pro",
      effortLevel: "High",
      timestamp: "Synced with Registrar & Canvas LMS",
      working: false,
      steps: [
        "Verified Stanford SSO profile: Alex Rivera (#STU-882194)",
        "Loaded 78 completed units (3.92 prior CGPA) + 5 Autumn courses (18 units)",
        "Indexed 24.5h free windows, Green Library telemetry & Smart Locker #B-04",
      ],
      text: "Welcome back, Alex! I'm your **CampusHub Academic & Life AI**. You can ask me **anything**—calculate your **Semester GPA & Cumulative CGPA** (`/cgpa`), solve **CS 229 / Math / Coding** problems, draft emails to faculty, or find quiet study rooms and events between your lectures.",
      cgpaData: liveCgpa,
      recommendations: [
        {
          id: "rec_init_1",
          fitScore: "99% Schedule Match",
          title: "AI & Robotics Symposium '25 — Keynote + Quadruped Demo",
          timeWindow: "Friday, Oct 24 • 4:00 PM – 6:30 PM (Zero Conflicts)",
          location: "Huang Engineering Amphitheater",
          conflictNote: "Fits cleanly after CS 229 Lecture • 142 peers attending",
        },
      ],
    },
  ]);

  const clearPendingTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const buildResponseForPrompt = (
    rawText: string,
    currentCourses: CourseRow[]
  ): {
    traceSteps: string[];
    replyText: string;
    cgpaData?: CgpaSummaryData;
    codeBlock?: { language: string; code: string };
    recommendations?: CopilotMessage["recommendations"];
  } => {
    const lower = rawText.toLowerCase();

    // 1. Check if the student is asking about CGPA / GPA / Grades / Units / Target GPA
    if (
      lower.includes("cgpa") ||
      lower.includes("gpa") ||
      lower.includes("grade") ||
      lower.includes("credit") ||
      lower.includes("semester") ||
      lower.includes("dean")
    ) {
      const parsedCourses = parseCoursesFromPrompt(rawText);
      const activeList = parsedCourses || currentCourses;
      if (parsedCourses) {
        setCourses(parsedCourses);
      }

      // Check if user specified a custom prior GPA or target GPA
      const targetMatch = rawText.match(/target\s*(?:cgpa|gpa)?\s*(?:of|to)?\s*(\d\.\d{1,2})/i);
      const effectiveTarget = targetMatch
        ? parseFloat(targetMatch[1])
        : targetCgpa;

      const summary = computeCgpaStats(
        activeList,
        priorGpa,
        priorUnits,
        effectiveTarget
      );

      const delta = summary.cumulativeGpa - summary.priorGpa;
      const deltaStr =
        delta >= 0 ? `+${delta.toFixed(3)}` : `${delta.toFixed(3)}`;

      return {
        traceSteps: [
          `Parsed ${activeList.length} courses (${summary.semesterUnits} Autumn quarter units)`,
          `Computed quality points: ${summary.semesterPoints.toFixed(1)} pts ÷ ${summary.semesterUnits} units = ${summary.semesterGpa.toFixed(2)} Semester GPA`,
          `Combined with prior ledger (${summary.priorGpa.toFixed(2)} GPA × ${summary.priorUnits} units) → ${summary.cumulativeGpa.toFixed(2)} CGPA`,
          `Evaluated Dean's Honors threshold & target ${effectiveTarget.toFixed(2)} CGPA trajectory`,
        ],
        replyText:
          `Here is your complete **Semester GPA & Cumulative CGPA Breakdown**:\n\n` +
          `• **Current Term GPA (${summary.semesterUnits} units):** **${summary.semesterGpa.toFixed(2)} / 4.00** (${summary.semesterPoints.toFixed(1)} quality points)\n` +
          `• **Updated Cumulative CGPA (${summary.cumulativeUnits} total units):** **${summary.cumulativeGpa.toFixed(2)} / 4.00** (${deltaStr} vs prior ${summary.priorGpa.toFixed(2)})\n` +
          `• **Academic Standing:** ${
            summary.semesterGpa >= 3.7
              ? "Dean's Honors List Eligible ★"
              : "Good Academic Standing"
          }\n` +
          `• **Target ${effectiveTarget.toFixed(2)} CGPA Advisory:** ${
            summary.requiredNextGpa && summary.requiredNextGpa <= 4.0
              ? `You need at least a **${Math.max(0, summary.requiredNextGpa).toFixed(2)} term GPA** this quarter to reach ${effectiveTarget.toFixed(2)}. Converting **ECON 102B (4u)** from **B+ (3.3)** to **A- (3.7)** adds **+1.6 quality points** and lifts your term GPA to **3.92**!`
              : `Since the maximum 4.00 scale caps single-quarter gains, maintaining a **3.95+ term GPA** over the next 2 quarters will smoothly cross **${effectiveTarget.toFixed(2)}**.`
          }`,
        cgpaData: summary,
      };
    }

    // 2. Check if the student typed a direct math expression
    const mathAns = tryEvaluateMath(rawText);
    if (mathAns) {
      return {
        traceSteps: [
          "Parsed symbolic & numerical expression",
          "Verified operator precedence & floating-point precision",
          "Formatted exact academic result",
        ],
        replyText: `**Calculation Result:**\n\`${mathAns}\`\n\nNeed me to plot this function, compute its derivative/integral, or plug it into your lab report?`,
      };
    }

    // 3. Check for CS / Machine Learning / Coding / Explain queries
    if (
      lower.includes("/explain") ||
      lower.includes("svm") ||
      lower.includes("kernel") ||
      lower.includes("gradient") ||
      lower.includes("python") ||
      lower.includes("code") ||
      lower.includes("algorithm") ||
      lower.includes("cs 229") ||
      lower.includes("cs229") ||
      lower.includes("linear")
    ) {
      return {
        traceSteps: [
          "Cross-referenced CS 229 Autumn Lecture Notes (Support Vector Machines & Kernels)",
          "Formulated intuition + mathematical dual objective",
          "Generated runnable NumPy / Python reference snippet",
        ],
        replyText:
          `**Concept Walkthrough — Kernel Trick & RBF Support Vector Machines (CS 229):**\n\n` +
          `1. **Core Intuition:** When data isn't linearly separable in $\\mathbb{R}^d$, we map features via $\\phi(x)$ into a higher-dimensional space where a linear hyperplane separates the classes.\n` +
          `2. **The Kernel Trick:** Instead of computing $\\phi(x)$ explicitly (which can be infinite-dimensional), we compute the inner product $K(x, z) = \\langle \\phi(x), \\phi(z) \\rangle$ directly.\n` +
          `3. **Gaussian RBF Kernel:** $K(x, z) = \\exp\\left(-\\frac{\\|x - z\\|^2}{2\\sigma^2}\\right)$ measures similarity based on Euclidean distance.`,
        codeBlock: {
          language: "python",
          code: `import numpy as np

def rbf_kernel(X1: np.ndarray, X2: np.ndarray, sigma: float = 1.0) -> np.ndarray:
    """Compute Gaussian RBF Kernel Gram Matrix for CS 229 P-Set."""
    sq_dists = np.sum(X1**2, axis=1, keepdims=True) + np.sum(X2**2, axis=1) - 2 * (X1 @ X2.T)
    return np.exp(-sq_dists / (2 * sigma**2))`,
        },
      };
    }

    // 4. Check for Study Rooms / Quiet Spaces / Schedule / Locker queries
    if (
      lower.includes("/schedule") ||
      lower.includes("study") ||
      lower.includes("quiet") ||
      lower.includes("room") ||
      lower.includes("locker") ||
      lower.includes("free")
    ) {
      return {
        traceSteps: [
          "Scanned Google Calendar & Canvas LMS for today's free windows",
          "Queried live acoustic & Wi-Fi occupancy telemetry across Green Library & Huang",
          "Checked Tresidder Union Hub A Smart Locker #B-04 status",
        ],
        replyText:
          `I analyzed your schedule and live campus telemetry:\n\n` +
          `• **Next Free Window:** Today **2:30 PM – 4:30 PM** (120 mins between DESIGN 101 and IEEE Robotics Lab).\n` +
          `• **Quietest Study Space Right Now:** **Green Library 4F Quiet Commons** is at **38 dB** with **68% desks available** (Desk #18 has dual 100W USB-C power).\n` +
          `• **Smart Locker Pickup:** Your Campus Store order is ready at **Tresidder Union Hub A (#B-04, PIN: 8492)**—only a 3-minute walk along your route.`,
        recommendations: [
          {
            id: `rec_study_${Date.now()}`,
            fitScore: "98% Focus Match",
            title: "Green Library 4F — Acoustic Study Desk #18",
            timeWindow: "Today, 2:30 PM – 4:30 PM (38 dB Whisper Quiet)",
            location: "Green Library East Wing • 4th Floor",
            conflictNote: "Dual 100W USB-C power • Zero exam conflicts",
          },
          {
            id: `rec_locker_${Date.now()}`,
            fitScore: "99% Route Match",
            title: "Smart Locker #B-04 Express Pickup (PIN: 8492)",
            timeWindow: "3 min detour before Green Library",
            location: "Tresidder Student Union — West Concourse",
            conflictNote: "Heavyweight Archival Hoodie waiting inside",
          },
        ],
      };
    }

    // 5. Check for /summarize or /tasks or exam prep
    if (
      lower.includes("/summarize") ||
      lower.includes("/tasks") ||
      lower.includes("exam") ||
      lower.includes("midterm") ||
      lower.includes("plan")
    ) {
      return {
        traceSteps: [
          "Checked upcoming Canvas LMS deadlines (CS 229 P-Set #4, EE 263 Midterm)",
          "Allocated high-focus blocks into your 24.5h weekly free windows",
          "Generated prioritized action plan with active recall milestones",
        ],
        replyText:
          `Here is your **High-Yield Midterm & Problem Set Action Plan**:\n\n` +
          `1. **Today (2:30 PM – 4:30 PM • Green Library 4F):** Complete **CS 229 Problem Set #4 Q1–Q2** (Kernel ridge regression proofs).\n` +
          `2. **Tonight (8:00 PM – 9:30 PM • Room 402 Flash Jam):** Join 6 classmates from your CS 229 section to verify coding outputs.\n` +
          `3. **Thursday (1:30 PM – 3:30 PM):** Review **EE 263 Matrix Exponential & Least Squares** practice midterm (weighted 25% of grade).\n` +
          `4. **Friday (4:00 PM):** Reward break at **AI & Robotics Symposium '25** (Huang Amphitheater).`,
      };
    }

    // 6. General-purpose intelligent academic & campus response for any other question
    return {
      traceSteps: [
        `Analyzed query: "${rawText.slice(0, 60)}${rawText.length > 60 ? "…" : ""}"`,
        "Synthesized academic knowledge base, Stanford syllabus context & campus telemetry",
        "Formatted structured response with actionable next steps",
      ],
      replyText:
        `Here's a structured breakdown for **"${rawText}"**:\n\n` +
        `• **Direct Answer & Academic Context:** Based on your B.S. Computer Science & Interaction Design track (current **3.92 CGPA** across **78 units**), I can help you break this down into first principles, mathematical proofs, runnable code, or a tailored study schedule.\n` +
        `• **Pro Tip:** Try typing \`/cgpa\` or *"Calculate my CGPA if I get A in CS 229 (4u) and A- in EE 263 (3u)"* to run live grade simulations, \`/explain\` for deep STEM walkthroughs, or use the **Interactive CGPA Simulator** on the left to test how each course grade affects your cumulative standing!`,
    };
  };

  const handleSendPrompt = (
    text: string,
    meta: PromptBarSendMeta = {
      attachments: [],
      model: PROMPT_MODELS[0],
      effort: activeEffort,
    }
  ) => {
    clearPendingTimers();
    const userMsg: CopilotMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      text,
      timestamp: "Just now",
      attachments: meta.attachments,
    };

    const aiMsgId = `ai_${Date.now() + 1}`;
    const result = buildResponseForPrompt(text, courses);

    const initialAiMsg: CopilotMessage = {
      id: aiMsgId,
      role: "assistant",
      text: "",
      timestamp: `${meta.model?.name || "Horizon 3.5 Pro"} • ${
        meta.effort || "High"
      } Effort`,
      modelName: meta.model?.name || "Horizon 3.5 Pro",
      effortLevel: meta.effort || "High",
      working: true,
      steps: [result.traceSteps[0]],
    };

    setBusy(true);
    setMessages((prev) => [...prev, userMsg, initialAiMsg]);

    // Stepwise ThoughtLine trace progression
    result.traceSteps.slice(1).forEach((stepText, idx) => {
      const t = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, steps: [...(m.steps || []), stepText] }
              : m
          )
        );
      }, (idx + 1) * 420);
      timersRef.current.push(t);
    });

    // Final settle
    const finishTimer = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                working: false,
                text: result.replyText,
                cgpaData: result.cgpaData,
                codeBlock: result.codeBlock,
                recommendations: result.recommendations,
              }
            : m
        )
      );
      setBusy(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 80);
    }, result.traceSteps.length * 420 + 250);

    timersRef.current.push(finishTimer);
  };

  const handleStopStreaming = () => {
    clearPendingTimers();
    setBusy(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.working
          ? {
              ...m,
              working: false,
              text:
                m.text ||
                "Generation stopped by user. Ask another question or refine your prompt below.",
            }
          : m
      )
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim()) {
      handleSendPrompt(q.trim(), {
        attachments: [],
        model: PROMPT_MODELS[0],
        effort: "High",
      });
    }
    return () => clearPendingTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCourseCode.trim().toUpperCase() || `COURSE ${courses.length + 1}`;
    const units = Math.max(1, Math.min(8, parseInt(newCourseUnits, 10) || 4));
    const next: CourseRow = {
      id: `custom_${Date.now()}`,
      code,
      title: "Custom Semester Course",
      units,
      grade: newCourseGrade,
    };
    setCourses((prev) => [...prev, next]);
    setNewCourseCode("");
  };

  const handleSimulateCgpaInChat = () => {
    setViewMode("chat");
    const courseSummary = courses
      .map((c) => `${c.grade} in ${c.code} (${c.units} units)`)
      .join(", ");
    handleSendPrompt(
      `Calculate my semester GPA and cumulative CGPA with: ${courseSummary} (Target CGPA: ${targetCgpa.toFixed(
        2
      )})`,
      {
        attachments: ["Transcript_Autumn25.pdf"],
        model: PROMPT_MODELS[0],
        effort: activeEffort,
      }
    );
  };

  const renderCalculator = (inSplit = false) => (
    <div className="space-y-6">
      {/* LIVE INTERACTIVE CGPA & SEMESTER GPA CALCULATOR */}
      <SpotlightCard className="bg-surface-container-lowest rounded-[2.25rem] border border-outline-variant/40 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
              Interactive Registrar Grade Simulator
            </span>
            <h2 className="text-xl font-extrabold font-headline text-on-surface mt-0.5">
              Live CGPA & Term Calculator
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-mono font-extrabold">
            4.00 SCALE
          </span>
        </div>

        {/* Top Dual Telemetry KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-[#131b2e] text-white">
            <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-container block">
              Semester GPA ({liveCgpa.semesterUnits}u)
            </span>
            <p className="text-3xl font-extrabold font-money text-white mt-1 tabular-nums">
              {liveCgpa.semesterGpa.toFixed(2)}
            </p>
            <span className="text-[11px] text-secondary-container font-medium">
              {liveCgpa.semesterPoints.toFixed(1)} Quality Pts
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary-container/45 border border-primary/25">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
              Cumulative CGPA ({liveCgpa.cumulativeUnits}u)
            </span>
            <p className="text-3xl font-extrabold font-money text-on-surface mt-1 tabular-nums">
              {liveCgpa.cumulativeGpa.toFixed(2)}
            </p>
            <span className="text-[11px] text-primary font-bold">
              {liveCgpa.cumulativeGpa >= priorGpa ? "↑" : "↓"} Prior:{" "}
              {priorGpa.toFixed(2)} ({priorUnits}u)
            </span>
          </div>
        </div>

        {/* Target Goal Progress Meter */}
        <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-primary">
                stars
              </span>
              Target Cumulative CGPA
            </span>
            <span className="font-money font-bold text-primary">
              {liveCgpa.cumulativeGpa.toFixed(2)} / {targetCgpa.toFixed(2)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-outline-variant/30 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (liveCgpa.cumulativeGpa / targetCgpa) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Prior Academic Record Inputs */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <label className="text-[10px] font-mono uppercase text-outline block">
              Prior CGPA
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              value={priorGpa}
              onChange={(e) =>
                setPriorGpa(
                  Math.max(0, Math.min(4.0, parseFloat(e.target.value) || 0))
                )
              }
              className="w-full bg-transparent font-money font-bold text-xs text-on-surface focus:outline-none mt-0.5"
            />
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <label className="text-[10px] font-mono uppercase text-outline block">
              Prior Units
            </label>
            <input
              type="number"
              min="0"
              max="250"
              value={priorUnits}
              onChange={(e) =>
                setPriorUnits(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-full bg-transparent font-money font-bold text-xs text-on-surface focus:outline-none mt-0.5"
            />
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <label className="text-[10px] font-mono uppercase text-primary font-bold block">
              Target CGPA
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              value={targetCgpa}
              onChange={(e) =>
                setTargetCgpa(
                  Math.max(0, Math.min(4.0, parseFloat(e.target.value) || 0))
                )
              }
              className="w-full bg-transparent font-money font-bold text-xs text-primary focus:outline-none mt-0.5"
            />
          </div>
        </div>

        {/* Course List with GlideSelect Grade Picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-outline px-1">
            <span>Course & Units</span>
            <span>Expected Grade</span>
          </div>

          {courses.map((course) => (
            <div
              key={course.id}
              className="p-2.5 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-on-surface">
                    {course.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-container-highest text-[10px] font-mono font-semibold text-on-surface-variant">
                    {course.units}u
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {course.title}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <GlideSelect
                  options={GRADE_OPTIONS}
                  value={course.grade}
                  onChange={(val) =>
                    setCourses((prev) =>
                      prev.map((c) =>
                        c.id === course.id ? { ...c, grade: val } : c
                      )
                    )
                  }
                  ariaLabel={`Grade for ${course.code}`}
                  size="sm"
                  menuWidth={150}
                  align="right"
                />
                <button
                  type="button"
                  onClick={() =>
                    setCourses((prev) =>
                      prev.filter((c) => c.id !== course.id)
                    )
                  }
                  className="w-7 h-7 rounded-lg hover:bg-error-container hover:text-on-error-container text-outline flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove course"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    close
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Course Row */}
        <form
          onSubmit={handleAddCourse}
          className="pt-2 border-t border-outline-variant/25 flex items-center gap-2"
        >
          <input
            type="text"
            value={newCourseCode}
            onChange={(e) => setNewCourseCode(e.target.value)}
            placeholder="Course (e.g. MATH 51)"
            className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
          />
          <input
            type="number"
            min="1"
            max="8"
            value={newCourseUnits}
            onChange={(e) => setNewCourseUnits(e.target.value)}
            className="w-14 px-2.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono font-bold text-center text-on-surface focus:outline-none"
            title="Units"
          />
          <GlideSelect
            options={GRADE_OPTIONS}
            value={newCourseGrade}
            onChange={(val) => setNewCourseGrade(val)}
            ariaLabel="New course grade"
            size="sm"
            menuWidth={145}
            align="right"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-on-surface hover:bg-primary text-surface text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            + Add
          </button>
        </form>

        {/* Send to AI Copilot for Strategy */}
        <button
          type="button"
          onClick={handleSimulateCgpaInChat}
          className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">
            chat
          </span>
          <span>Analyze in AI Academic Chat & Generate Study Roadmap</span>
        </button>
      </SpotlightCard>

      {!inSplit && (
        <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 shadow-xs space-y-3.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
            What-If Projections
          </span>
          <h3 className="text-base font-extrabold font-headline text-on-surface">
            Registrar Honors & Target Requirements
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            With your current course load of {liveCgpa.semesterUnits} units, scoring all A&apos;s yields a term GPA of 4.00, raising your cumulative CGPA to{" "}
            {((priorGpa * priorUnits + 4.0 * liveCgpa.semesterUnits) / (priorUnits + liveCgpa.semesterUnits)).toFixed(2)}.
          </p>
          <button
            type="button"
            onClick={() => setViewMode("chat")}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Return to AI Academic Chat</span>
            <span className="material-symbols-outlined text-[14px]">
              arrow_forward
            </span>
          </button>
        </div>
      )}
    </div>
  );

  const renderChat = (inSplit = false) => (
    <div className="flex flex-col bg-surface-container-lowest rounded-[2.25rem] border border-outline-variant/40 shadow-md overflow-hidden">
      {/* Top Stream Status Header */}
      <div className="p-4 sm:px-6 border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#131b2e] text-secondary-container flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold font-headline text-on-surface">
                CampusHub Neural Assistant
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-mono font-bold">
                PRO 3.5
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Type <code className="font-mono text-primary font-bold">@</code> for syllabus/transcript,{" "}
              <code className="font-mono text-primary font-bold">/</code> for commands (<code className="font-mono">/cgpa</code>, <code className="font-mono">/explain</code>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode !== "calculator" && (
            <button
              type="button"
              onClick={() => setViewMode("calculator")}
              className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-secondary-container/50 border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">
                calculate
              </span>
              <span>CGPA Tool ({liveCgpa.cumulativeGpa.toFixed(2)})</span>
            </button>
          )}

          <LatticeLoader
            status={busy ? "working" : "done"}
            label="Synthesizing"
            doneLabel="Done in"
            pattern="orbit"
            grid={3}
            shape="round"
            color="#4b671b"
            doneColor="#4b671b"
            cellSize={5}
            gap={2}
            fontSize={11}
            showTimer
          />
        </div>
      </div>

      {/* Messages Stream */}
      <div
        className={`p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar ${
          inSplit ? "max-h-[620px]" : "max-h-[680px]"
        }`}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.role === "user"
                ? "flex flex-col items-end"
                : "flex flex-col items-start"
            }
          >
            <div className="flex items-center gap-2 mb-1.5 px-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-outline">
                {msg.role === "user"
                  ? "Alex Rivera (#STU-882194)"
                  : msg.timestamp}
              </span>
            </div>

            <div
              className={
                msg.role === "user"
                  ? "max-w-xl rounded-3xl rounded-tr-sm bg-on-surface text-surface px-5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-xs"
                  : "w-full rounded-3xl rounded-tl-sm bg-surface-container-low border border-outline-variant/35 p-5 sm:p-6 text-xs sm:text-sm text-on-surface leading-relaxed space-y-4"
              }
            >
              {/* User Attachment Chips */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {msg.attachments.map((file, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-white/15 text-[11px] font-mono"
                    >
                      📎 {file}
                    </span>
                  ))}
                </div>
              )}

              {/* REACT BITS THOUGHTLINE FOR AI MESSAGES */}
              {msg.role === "assistant" && msg.steps && (
                <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40">
                  <ThoughtLine
                    working={Boolean(msg.working)}
                    steps={msg.steps}
                    label="Reasoning across Registrar & course ledger…"
                    doneLabel="Thought for"
                    glyph="sparkle"
                    color="#131b2e"
                    glyphColor="#4b671b"
                    fontSize={13}
                    breathPeriod={1.5}
                    breathDepth={0.45}
                    settleDuration={350}
                    settleBlur={2}
                    collapsible
                    collapseOnSettle={false}
                    showTimer
                  />
                </div>
              )}

              {/* Main Message Text */}
              {msg.text && (
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.text.split("**").map((part, index) =>
                    index % 2 === 1 ? (
                      <strong
                        key={index}
                        className={
                          msg.role === "user"
                            ? "font-extrabold text-secondary-container"
                            : "font-extrabold text-on-surface"
                        }
                      >
                        {part}
                      </strong>
                    ) : (
                      <span key={index}>{part}</span>
                    )
                  )}
                </div>
              )}

              {/* Optional CGPA Breakdown Card inside AI Response */}
              {msg.cgpaData && (
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-primary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                      Calculated Term & Cumulative GPA
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-mono font-bold">
                      OFFICIAL 4.0 SCALE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-surface-container-low">
                      <span className="text-[10px] font-mono text-outline block">
                        Term Units
                      </span>
                      <span className="text-base font-extrabold font-money text-on-surface">
                        {msg.cgpaData.semesterUnits}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low">
                      <span className="text-[10px] font-mono text-outline block">
                        Term GPA
                      </span>
                      <span className="text-base font-extrabold font-money text-primary">
                        {msg.cgpaData.semesterGpa.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low">
                      <span className="text-[10px] font-mono text-outline block">
                        Total Units
                      </span>
                      <span className="text-base font-extrabold font-money text-on-surface">
                        {msg.cgpaData.cumulativeUnits}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-secondary-container/40">
                      <span className="text-[10px] font-mono text-primary font-bold block">
                        New CGPA
                      </span>
                      <span className="text-base font-extrabold font-money text-primary">
                        {msg.cgpaData.cumulativeGpa.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {msg.cgpaData.courses && msg.cgpaData.courses.length > 0 && (
                    <div className="pt-2 border-t border-outline-variant/30 space-y-1">
                      {msg.cgpaData.courses.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between text-xs py-0.5"
                        >
                          <span className="font-mono text-on-surface font-semibold">
                            {c.code} ({c.units}u)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] font-mono font-bold text-primary">
                            {c.grade} ({GRADE_POINTS[c.grade]?.toFixed(1) ?? "4.0"})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Code Snippet Block */}
              {msg.codeBlock && (
                <div className="rounded-2xl bg-[#131b2e] text-[#eaedff] p-4 text-xs font-mono overflow-x-auto border border-outline-variant/30">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] uppercase text-outline">
                    <span>{msg.codeBlock.language}</span>
                    <span>Runnable Solution</span>
                  </div>
                  <pre>
                    <code>{msg.codeBlock.code}</code>
                  </pre>
                </div>
              )}

              {/* Synced Study Recommendations */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                    AI Calendar & Pass Actions
                  </span>
                  {msg.recommendations.map((rec) => (
                    <SpotlightCard
                      key={rec.id}
                      className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-primary font-bold">
                          {rec.fitScore} • {rec.timeWindow}
                        </span>
                        <h3 className="text-xs font-bold text-on-surface">
                          {rec.title}
                        </h3>
                        <p className="text-xs text-on-surface-variant">
                          {rec.location} • {rec.conflictNote}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setActivePassRec({
                            title: rec.title,
                            timeWindow: rec.timeWindow,
                            location: rec.location,
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          qr_code_2
                        </span>
                        <span>Sync & Pass</span>
                      </button>
                    </SpotlightCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* 1-Click Suggestion Chips above PromptBar */}
      <div className="px-4 py-2.5 bg-surface-container-low/40 border-t border-outline-variant/25 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono uppercase text-outline shrink-0 font-bold">
          Quick Prompts:
        </span>
        {[
          {
            label: "🧮 Compute GPA for CS 229 & EE 263",
            prompt:
              "Calculate my CGPA if I get A in CS 229 (4u), A in DESIGN 101 (4u), and A- in EE 263 (3u)",
          },
          {
            label: "🧠 Explain SVM Kernel Trick",
            prompt:
              "/explain How does the Gaussian RBF Kernel trick work in CS 229 Support Vector Machines? Include Python code.",
          },
          {
            label: "📋 Midterm & P-Set Plan",
            prompt:
              "/tasks Build a prioritized study plan for my CS 229 Problem Set #4 and EE 263 Midterm this week.",
          },
          {
            label: "🤫 Quiet Study Desks & Lockers",
            prompt:
              "/schedule Where is the quietest library study desk right now and can I pick up Smart Locker #B-04 on the way?",
          },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() =>
              handleSendPrompt(item.prompt, {
                attachments: [],
                model: PROMPT_MODELS[0],
                effort: activeEffort,
              })
            }
            className="px-3 py-1 rounded-full bg-surface-container hover:bg-secondary-container/50 border border-outline-variant/30 text-[11px] font-bold text-on-surface shrink-0 transition-all cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Bottom React Bits PromptBar */}
      <div className="p-4 sm:p-5 bg-surface-container-low/70 border-t border-outline-variant/30">
        <PromptBar
          placeholder="Ask anything — e.g. '/cgpa', 'Calculate my GPA if I get A in CS 229 and B+ in ECON 102', or '/explain SVM kernels'…"
          sources={PROMPT_SOURCES}
          commands={PROMPT_COMMANDS}
          models={PROMPT_MODELS}
          defaultModel="horizon-pro"
          efforts={["Low", "Medium", "High", "Extra", "Max"]}
          defaultEffort="High"
          onEffortChange={(eff) => setActiveEffort(eff)}
          busy={busy}
          onSend={(text, meta) => handleSendPrompt(text, meta)}
          onStop={handleStopStreaming}
          onAttach={() => "Autumn25_Transcript_Rivera.pdf"}
          onDictate={() =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve(
                    "Calculate my CGPA if I earn an A in CS 229 and an A in DESIGN 101 this quarter."
                  ),
                1100
              )
            )
          }
          background="#131b2e"
          color="#faf8ff"
          menuBackground="#1e2942"
          sparkColor="#c1ee78"
          sparkBoost={1.2}
          width={960}
          radius={20}
          maxRows={5}
          className="w-full"
        />
      </div>
    </div>
  );

  return (
    <main className="relative pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. UNIFIED WORKSPACE HERO HEADER WITH INTEGRATED MODE SWITCHER */}
      <PageHero
        titleLead="Ask anything, calculate"
        titleHighlight="your CGPA"
        titleTrail="& master your quarter."
        description="Calculate semester & cumulative GPA, solve STEM and coding problems, summarize course lectures, or discover conflict-free campus study rooms."
        actions={
          <div className="glass-pill p-1.5 rounded-2xl border border-outline-variant/35 shadow-2xs inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("chat")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-headline flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === "chat"
                  ? "bg-primary text-on-primary shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                chat
              </span>
              <span>AI Academic Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("calculator")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-headline flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === "calculator"
                  ? "bg-primary text-on-primary shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                calculate
              </span>
              <span>CGPA Simulator</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-mono font-extrabold">
                {liveCgpa.cumulativeGpa.toFixed(2)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`hidden lg:flex px-3.5 py-2 rounded-xl text-xs font-bold font-headline items-center gap-2 transition-all cursor-pointer ${
                viewMode === "split"
                  ? "bg-primary text-on-primary shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                splitscreen
              </span>
              <span>Split View</span>
            </button>
          </div>
        }
      />

      {/* 2. DYNAMIC CONTENT CONTAINER BASED ON VIEW MODE */}
      <AnimatedContent
        distance={32}
        direction="vertical"
        duration={0.65}
        ease="power3.out"
        trigger="mount"
      >
        {viewMode === "chat" && (
          <div className="max-w-5xl mx-auto w-full">
            {renderChat(false)}
          </div>
        )}

        {viewMode === "calculator" && (
          <div className="max-w-5xl mx-auto w-full">
            {renderCalculator(false)}
          </div>
        )}

        {viewMode === "split" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">{renderCalculator(true)}</div>
            <div className="lg:col-span-7">{renderChat(true)}</div>
          </div>
        )}
      </AnimatedContent>

      <FastPassModal
        isOpen={Boolean(activePassRec)}
        onClose={() => setActivePassRec(null)}
        title={activePassRec?.title}
        subtitle={activePassRec?.timeWindow}
        location={activePassRec?.location}
        badgeLabel="AI COPILOT SYNCED PASS"
      />
    </main>
  );
}
