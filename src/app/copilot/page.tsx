"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AIAssistantInterface } from "@/components/ui/ai-assistant-interface";

function CopilotChatInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20 flex-1 flex flex-col items-center">
      <AIAssistantInterface initialQuery={initialQuery} />
    </main>
  );
}

export default function CopilotPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-surface">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CopilotChatInner />
    </Suspense>
  );
}
