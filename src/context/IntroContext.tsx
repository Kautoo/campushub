"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export type IntroStage = "typing" | "navbar" | "complete";

interface IntroContextType {
  stage: IntroStage;
  setStage: (stage: IntroStage) => void;
  isIntroActive: boolean;
  replayIntro: () => void;
}

const IntroContext = createContext<IntroContextType>({
  stage: "complete",
  setStage: () => {},
  isIntroActive: false,
  replayIntro: () => {},
});

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [stage, setStage] = useState<IntroStage>("complete");

  useEffect(() => {
    // Only run the cinematic typewriter sequence on the home page ('/')
    if (pathname === "/") {
      const alreadyPlayed = sessionStorage.getItem("campushub_intro_played");
      if (!alreadyPlayed) {
        setStage("typing");
        sessionStorage.setItem("campushub_intro_played", "true");
      } else {
        setStage("complete");
      }
    } else {
      setStage("complete");
    }
  }, [pathname]);

  const replayIntro = () => {
    setStage("typing");
  };

  const isIntroActive = stage !== "complete";

  return (
    <IntroContext.Provider value={{ stage, setStage, isIntroActive, replayIntro }}>
      {children}
    </IntroContext.Provider>
  );
}

export const useIntro = () => useContext(IntroContext);

