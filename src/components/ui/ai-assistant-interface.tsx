"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Mic,
  ArrowUp,
  Plus,
  FileText,
  Code,
  BookOpen,
  PenTool,
  BrainCircuit,
  Sparkles,
  User,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AIAssistantMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  files?: string[];
  thought?: string;
  citations?: { title: string; url: string; badge?: string }[];
  actionLink?: { label: string; href: string };
}

interface AIAssistantInterfaceProps {
  initialQuery?: string;
}

export function AIAssistantInterface({ initialQuery = "" }: AIAssistantInterfaceProps) {
  const [inputValue, setInputValue] = useState(initialQuery);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [deepResearchEnabled, setDeepResearchEnabled] = useState(false);
  const [reasonEnabled, setReasonEnabled] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showUploadAnimation, setShowUploadAnimation] = useState(false);
  const [activeCommandCategory, setActiveCommandCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIAssistantMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commandSuggestions = {
    learn: [
      "Explain the Big Bang theory",
      "How does photosynthesis work?",
      "What are black holes?",
      "Explain quantum computing",
      "How does the human brain work?",
    ],
    code: [
      "Create a React component for a todo list",
      "Write a Python function to sort a list",
      "How to implement authentication in Next.js",
      "Explain async/await in JavaScript",
      "Create a CSS animation for a button",
    ],
    write: [
      "Write a professional email to a professor",
      "Create a project proposal for our campus club",
      "Draft a blog post about student hackathons",
      "Write a creative story about late-night coding",
      "Create a social media post for campus events",
    ],
  };

  const campusQuickPrompts = [
    { label: "🎟️ Fast-Pass Dynamic QR", query: "How do Fast-Pass dynamic QR codes work on campus?" },
    { label: "⚡ Tech Events This Week", query: "What hackathons and tech events are scheduled on campus this week?" },
    { label: "📦 2-Hour Smart Lockers", query: "How does 2-hour smart locker pickup work for student merch?" },
    { label: "🎓 Target CGPA Guide", query: "Can you help me calculate what grades I need to hit a 3.8 cumulative GPA?" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialQuery.trim() && messages.length === 0) {
      handleSendPrompt(initialQuery.trim());
    }
  }, [initialQuery]);

  const handleUploadFile = () => {
    setShowUploadAnimation(true);
    setTimeout(() => {
      const fileName = `Syllabus_Notes_${Math.floor(Math.random() * 89 + 10)}.pdf`;
      setUploadedFiles((prev) => [...prev, fileName]);
      setShowUploadAnimation(false);
    }, 1200);
  };

  const handleCommandSelect = (command: string) => {
    setInputValue(command);
    setActiveCommandCategory(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const generateAIResponse = (query: string): AIAssistantMessage => {
    const qLower = query.toLowerCase();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (qLower.includes("pass") || qLower.includes("qr") || qLower.includes("rsvp")) {
      return {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        content:
          "CampusHub Dynamic Fast-Passes generate cryptographic rolling QR tokens refreshed every 30 seconds to prevent ticket duplication. Once you RSVP to any symposium or club event, your ticket is instantly vaulted to your Apple Wallet / Google Wallet pass stream and synchronized with turnstile gate scanners.",
        timestamp: time,
        thought: reasonEnabled
          ? "Analyzed campus ticketing protocol • Verified HMAC-SHA256 rotative token validity • Confirmed wallet pass integration."
          : undefined,
        citations: [
          { title: "Student Pass Vault", url: "/account", badge: "Live Pass" },
          { title: "Gate Turnstiles", url: "/events", badge: "Docs" },
        ],
        actionLink: { label: "View My Passes", href: "/account" },
      };
    }

    if (qLower.includes("hackathon") || qLower.includes("tech") || qLower.includes("event")) {
      return {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        content:
          "There are 4 major gatherings scheduled this week:\n\n1. **Autonomous Drone Swarm & Neural SLAM** — Fri 5:00 PM @ Huang Amphitheater\n2. **CalHacks AI Build Night** — Fri 7:00 PM @ Hearst Mining\n3. **Autonomous Robotics Showcase** — Sat 10:00 AM @ Bechtel Center\n4. **Founders Pitch & Boba** — Tue 6:30 PM @ MLK Student Union\n\nAll events feature instant RSVP with 1-click Fast-Pass entry.",
        timestamp: time,
        thought: deepResearchEnabled
          ? "Queried campus society calendars • Cross-referenced verified club listings • Retrieved live attendance capacities."
          : undefined,
        citations: [
          { title: "Campus Events Directory", url: "/events", badge: "Calendar" },
          { title: "Clubs Directory", url: "/clubs", badge: "Clubs" },
        ],
        actionLink: { label: "Explore All Events", href: "/events" },
      };
    }

    if (qLower.includes("locker") || qLower.includes("merch") || qLower.includes("shop")) {
      return {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        content:
          "Smart Lockers are located at **MLK Student Union (Zone A)**, **Moffitt Library (Zone B)**, and **Soda Hall Courtyard (Zone C)**. When you order official collegiate merch, items are stocked within 2 hours. You'll receive a one-time 6-digit PIN and NFC tap code to open your designated locker 24/7.",
        timestamp: time,
        citations: [
          { title: "Official Merch Store", url: "/shop", badge: "Store" },
        ],
        actionLink: { label: "Shop Campus Gear", href: "/shop" },
      };
    }

    if (qLower.includes("gpa") || qLower.includes("grade") || qLower.includes("cgpa")) {
      return {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        content:
          "To target a **3.80+ Cumulative GPA**, maintain an 'A' grade average across your core technical units (4 units per course = 16.0 grade points). You can simulate your semester targets and review grading curves directly in your Student Portal.",
        timestamp: time,
        thought: reasonEnabled
          ? "Evaluated university grading curve (A=4.0, A-=3.7, B+=3.3) • Computed weighted unit distributions."
          : undefined,
        actionLink: { label: "Open Student Dashboard", href: "/account" },
      };
    }

    return {
      id: `ai_${Date.now()}`,
      sender: "assistant",
      content: `I've analyzed your question: "${query}". \n\nCampusHub Copilot is connected to campus schedules, student societies, and smart lockers. Whether you need help drafting research questions, studying assignments, or discovering campus events, I'm here 24/7.`,
      timestamp: time,
      thought: reasonEnabled
        ? `Reasoning step: synthesized user prompt • checked campus knowledge graph • formatted response.`
        : undefined,
    };
  };

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: AIAssistantMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      content: promptText,
      timestamp: time,
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setUploadedFiles([]);
    setIsTyping(true);

    fetch("/api/ai/event-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: promptText }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data?.answer) {
          const sources = (json.data.sources || []).map((s: string) => ({
            title: s,
            url: "/events",
            badge: json.data.verified ? "Verified Registry" : "Registry",
          }));
          const aiMsg: AIAssistantMessage = {
            id: `ai_${Date.now()}`,
            sender: "assistant",
            content: json.data.answer,
            timestamp: time,
            thought: reasonEnabled
              ? "Queried CampusHub event registry • Checked official timetable and venue clearance."
              : undefined,
            citations: sources.length > 0 ? sources : undefined,
            actionLink: { label: "View Campus Events", href: "/events" },
          };
          setMessages((prev) => [...prev, aiMsg]);
        } else {
          let errorContent = json?.error || "Unable to process inquiry at this time.";
          if (json?.code === "PROVIDER_UNAVAILABLE") {
            errorContent = "⚠️ Astropods AI Gateway is unconfigured or unavailable. Set ASTROPODS_API_KEY in .env.local to enable live AI assistance.";
          } else if (json?.code === "RATE_LIMIT_EXCEEDED") {
            errorContent = "⚠️ Astropods AI request rate limit exceeded. Please wait a moment and try again.";
          } else if (json?.code === "VALIDATION_ERROR") {
            errorContent = "⚠️ Please provide a valid question of at least 2 characters.";
          }

          const errorMsg: AIAssistantMessage = {
            id: `ai_err_${Date.now()}`,
            sender: "assistant",
            content: errorContent,
            timestamp: time,
            actionLink: { label: "View Published Events", href: "/events" },
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      })
      .catch((err) => {
        const errorMsg: AIAssistantMessage = {
          id: `ai_err_${Date.now()}`,
          sender: "assistant",
          content: `⚠️ Network error connecting to AI Copilot service: ${err instanceof Error ? err.message : "Service unreachable"}.`,
          timestamp: time,
          actionLink: { label: "Browse Events", href: "/events" },
        };
        setMessages((prev) => [...prev, errorMsg]);
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  const handleSendMessage = () => {
    handleSendPrompt(inputValue);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputValue("");
    setUploadedFiles([]);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="w-full flex flex-col items-center text-on-surface font-body">
      {!hasMessages ? (
        /* Empty State / Starter View */
        <div className="w-full max-w-3xl flex flex-col items-center">
          {/* Animated Logo with Academic Horizon Olive/Lime Palette */}
          <div className="mb-4 w-14 h-14 relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 200 200"
              width="100%"
              height="100%"
              className="w-full h-full"
            >
              <g clipPath="url(#cs_clip_1_ellipse-12)">
                <mask
                  id="cs_mask_1_ellipse-12"
                  style={{ maskType: "alpha" }}
                  width="200"
                  height="200"
                  x="0"
                  y="0"
                  maskUnits="userSpaceOnUse"
                >
                  <path
                    fill="#fff"
                    fillRule="evenodd"
                    d="M100 150c27.614 0 50-22.386 50-50s-22.386-50-50-50-50 22.386-50 50 22.386 50 50 50zm0 50c55.228 0 100-44.772 100-100S155.228 0 100 0 0 44.772 0 100s44.772 100 100 100z"
                    clipRule="evenodd"
                  />
                </mask>
                <g mask="url(#cs_mask_1_ellipse-12)">
                  <path fill="#fff" d="M200 0H0v200h200V0z" />
                  <path
                    fill="#4b671b"
                    fillOpacity="0.25"
                    d="M200 0H0v200h200V0z"
                  />
                  <g
                    filter="url(#filter0_f_844_2811)"
                    className="animate-gradient"
                  >
                    <path fill="#4b671b" d="M110 32H18v68h92V32z" />
                    <path fill="#223600" d="M188-24H15v98h173v-98z" />
                    <path fill="#83a350" d="M175 70H5v156h170V70z" />
                    <path fill="#c1ee78" d="M230 51H100v103h130V51z" />
                  </g>
                </g>
              </g>
              <defs>
                <filter
                  id="filter0_f_844_2811"
                  width="385"
                  height="410"
                  x="-75"
                  y="-104"
                  colorInterpolationFilters="sRGB"
                  filterUnits="userSpaceOnUse"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    result="effect1_foregroundBlur_844_2811"
                    stdDeviation="40"
                  />
                </filter>
                <clipPath id="cs_clip_1_ellipse-12">
                  <path fill="#fff" d="M0 0H200V200H0z" />
                </clipPath>
              </defs>
              <g
                style={{ mixBlendMode: "overlay" }}
                mask="url(#cs_mask_1_ellipse-12)"
              >
                <path
                  fill="gray"
                  stroke="transparent"
                  d="M200 0H0v200h200V0z"
                  filter="url(#cs_noise_1_ellipse-12)"
                />
              </g>
              <defs>
                <filter
                  id="cs_noise_1_ellipse-12"
                  width="100%"
                  height="100%"
                  x="0%"
                  y="0%"
                  filterUnits="objectBoundingBox"
                >
                  <feTurbulence
                    baseFrequency="0.6"
                    numOctaves="5"
                    result="out1"
                    seed="4"
                  />
                  <feComposite
                    in="out1"
                    in2="SourceGraphic"
                    operator="in"
                    result="out2"
                  />
                  <feBlend
                    in="SourceGraphic"
                    in2="out2"
                    mode="overlay"
                    result="out3"
                  />
                </filter>
              </defs>
            </svg>
          </div>

          {/* Welcome Message synced with Academic Horizon Headline & Serif Italic */}
          <div className="mb-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-headline mb-2">
                Ready to{" "}
                <span className="font-editorial italic font-normal text-primary">
                  assist you
                </span>
              </h1>
              <p className="text-on-surface-variant max-w-md text-xs sm:text-sm leading-relaxed">
                Ask about upcoming hackathons, course timetables, dynamic passes, or explore suggestions below.
              </p>
            </motion.div>
          </div>

          {/* Quick Prompts Pills */}
          <div className="w-full flex flex-wrap gap-2 justify-center mb-5 max-w-2xl">
            {campusQuickPrompts.map((cp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendPrompt(cp.query)}
                className="text-xs bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/35 rounded-full px-3.5 py-1.5 transition-all text-on-surface-variant hover:text-on-surface shadow-2xs cursor-pointer font-medium"
              >
                {cp.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xs overflow-hidden mb-5">
            <div className="p-4">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask CampusHub Copilot anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="w-full text-on-surface text-sm sm:text-base outline-none placeholder:text-outline bg-transparent font-medium"
              />
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="px-4 pb-2.5">
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 bg-surface-container-low py-1 px-2.5 rounded-lg border border-outline-variant/30 text-xs text-on-surface font-mono"
                    >
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>{file}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setUploadedFiles((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="text-outline hover:text-on-surface ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controls Bar */}
            <div className="px-4 py-2.5 flex items-center justify-between border-t border-outline-variant/20 bg-surface-container-low/30">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSearchEnabled(!searchEnabled)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer",
                    searchEnabled
                      ? "bg-secondary-container text-on-secondary-fixed border border-secondary/25"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeepResearchEnabled(!deepResearchEnabled)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer",
                    deepResearchEnabled
                      ? "bg-secondary-container text-on-secondary-fixed border border-secondary/25"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={
                      deepResearchEnabled ? "text-primary font-bold" : "text-outline"
                    }
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                  </svg>
                  <span>Deep Research</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReasonEnabled(!reasonEnabled)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer",
                    reasonEnabled
                      ? "bg-secondary-container text-on-secondary-fixed border border-secondary/25"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Reason</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Microphone input"
                  className="p-1.5 text-outline hover:text-on-surface transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  aria-label="Send prompt"
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer shadow-xs",
                    inputValue.trim()
                      ? "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container"
                      : "bg-surface-container text-outline cursor-not-allowed"
                  )}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Upload File Row */}
            <div className="px-4 py-2 border-t border-outline-variant/15 bg-surface-container-low/50">
              <button
                type="button"
                onClick={handleUploadFile}
                className="flex items-center gap-2 text-on-surface-variant text-xs hover:text-on-surface transition-colors cursor-pointer font-medium"
              >
                {showUploadAnimation ? (
                  <motion.div
                    className="flex space-x-1"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-primary rounded-full"
                        variants={{
                          hidden: { opacity: 0, y: 4 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                              duration: 0.4,
                              repeat: Infinity,
                              repeatType: "mirror",
                              delay: i * 0.1,
                            },
                          },
                        }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <Plus className="w-3.5 h-3.5 text-primary" />
                )}
                <span>Attach syllabus, course notes, or PDF</span>
              </button>
            </div>
          </div>

          {/* Command Categories (Learn, Code, Write) */}
          <div className="w-full grid grid-cols-3 gap-3 mb-4">
            <CommandButton
              icon={<BookOpen className="w-4 h-4" />}
              label="Learn"
              isActive={activeCommandCategory === "learn"}
              onClick={() =>
                setActiveCommandCategory(
                  activeCommandCategory === "learn" ? null : "learn"
                )
              }
            />
            <CommandButton
              icon={<Code className="w-4 h-4" />}
              label="Code"
              isActive={activeCommandCategory === "code"}
              onClick={() =>
                setActiveCommandCategory(
                  activeCommandCategory === "code" ? null : "code"
                )
              }
            />
            <CommandButton
              icon={<PenTool className="w-4 h-4" />}
              label="Write"
              isActive={activeCommandCategory === "write"}
              onClick={() =>
                setActiveCommandCategory(
                  activeCommandCategory === "write" ? null : "write"
                )
              }
            />
          </div>

          {/* Command Suggestions Drawer */}
          <AnimatePresence>
            {activeCommandCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full mb-6 overflow-hidden"
              >
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
                  <div className="p-3 border-b border-outline-variant/20 bg-surface-container-low/60">
                    <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider font-label">
                      {activeCommandCategory === "learn"
                        ? "Learning Suggestions"
                        : activeCommandCategory === "code"
                        ? "Coding Suggestions"
                        : "Writing Suggestions"}
                    </h3>
                  </div>
                  <ul className="divide-y divide-outline-variant/15">
                    {commandSuggestions[
                      activeCommandCategory as keyof typeof commandSuggestions
                    ].map((suggestion, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleCommandSelect(suggestion)}
                        className="p-3 hover:bg-surface-container-low cursor-pointer transition-colors duration-75 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          {activeCommandCategory === "learn" ? (
                            <BookOpen className="w-4 h-4 text-primary" />
                          ) : activeCommandCategory === "code" ? (
                            <Code className="w-4 h-4 text-primary" />
                          ) : (
                            <PenTool className="w-4 h-4 text-primary" />
                          )}
                          <span className="text-xs sm:text-sm text-on-surface-variant group-hover:text-primary">
                            {suggestion}
                          </span>
                        </div>
                        <ArrowUp className="w-3.5 h-3.5 text-outline group-hover:text-primary rotate-45 transition-transform" />
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Active Conversation Stream View */
        <div className="w-full max-w-3xl flex flex-col justify-between">
          {/* Subtle Top Reset Bar */}
          <div className="w-full pb-4 flex items-center justify-between border-b border-outline-variant/20 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono font-bold text-on-surface">
                Copilot Discussion
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/30 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Message Bubbles */}
          <div className="space-y-6 pb-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3.5",
                  msg.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.sender === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1 border border-primary/20 shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-xl rounded-2xl p-4 transition-all shadow-xs",
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-br-xs"
                      : "bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-bl-xs"
                  )}
                >
                  {/* Attached files in user message */}
                  {msg.files && msg.files.length > 0 && (
                    <div className="mb-2.5 flex flex-wrap gap-1.5">
                      {msg.files.map((file, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/20 text-xs font-mono"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{file}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reasoning Thought Collapsible */}
                  {msg.thought && (
                    <div className="mb-3 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant font-mono flex items-start gap-2">
                      <BrainCircuit className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{msg.thought}</span>
                    </div>
                  )}

                  {/* Message content */}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-body">
                    {msg.content}
                  </div>

                  {/* Citations & Links */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex flex-wrap gap-2">
                      {msg.citations.map((c, i) => (
                        <Link
                          key={i}
                          href={c.url}
                          className="inline-flex items-center gap-1.5 text-xs bg-surface-container-low border border-outline-variant/30 hover:border-primary px-2.5 py-1 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="font-semibold">{c.title}</span>
                          <ExternalLink className="w-3 h-3 text-outline" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Action link */}
                  {msg.actionLink && (
                    <div className="mt-3">
                      <Link
                        href={msg.actionLink.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container transition-colors shadow-2xs"
                      >
                        <span>{msg.actionLink.label}</span>
                        <ArrowUp className="w-3.5 h-3.5 rotate-45" />
                      </Link>
                    </div>
                  )}

                  {/* Message Footer */}
                  <div
                    className={cn(
                      "mt-2.5 flex items-center justify-between text-[10px]",
                      msg.sender === "user" ? "text-white/80" : "text-outline"
                    )}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.sender === "assistant" && (
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-on-surface inline-flex items-center gap-1 ml-3 transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-secondary" />
                            <span className="text-secondary font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-1 font-semibold text-xs shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl rounded-bl-xs p-4 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Pinned Bottom Input Bar */}
          <div className="sticky bottom-4 w-full bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-lg overflow-hidden mt-4">
            <div className="p-3">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask follow-up question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="w-full text-on-surface text-sm outline-none placeholder:text-outline bg-transparent font-medium"
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 bg-surface-container-low py-0.5 px-2 rounded-lg border border-outline-variant/30 text-xs text-on-surface font-mono"
                  >
                    <FileText className="w-3 h-3 text-primary" />
                    <span>{file}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setUploadedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="text-outline hover:text-on-surface ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="px-3 py-2 flex items-center justify-between border-t border-outline-variant/20 bg-surface-container-low/40">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSearchEnabled(!searchEnabled)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors",
                    searchEnabled
                      ? "bg-secondary-container text-on-secondary-fixed"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  )}
                >
                  <Search className="w-3 h-3" />
                  <span>Search</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReasonEnabled(!reasonEnabled)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors",
                    reasonEnabled
                      ? "bg-secondary-container text-on-secondary-fixed"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  )}
                >
                  <BrainCircuit className="w-3 h-3" />
                  <span>Reason</span>
                </button>
                <button
                  type="button"
                  onClick={handleUploadFile}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Attach</span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer",
                  inputValue.trim()
                    ? "bg-primary text-on-primary hover:bg-primary-container"
                    : "bg-surface-container text-outline cursor-not-allowed"
                )}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CommandButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function CommandButton({ icon, label, isActive, onClick }: CommandButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border transition-all cursor-pointer",
        isActive
          ? "bg-secondary-container/40 border-secondary/40 text-on-secondary-fixed shadow-2xs font-bold"
          : "bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant/60 text-on-surface shadow-2xs"
      )}
    >
      <div className={isActive ? "text-primary" : "text-outline"}>{icon}</div>
      <span className="text-xs sm:text-sm font-headline font-bold">{label}</span>
    </motion.button>
  );
}
