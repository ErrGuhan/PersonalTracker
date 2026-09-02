"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { AssistantMessage } from "@/lib/ai/types";

interface AiAssistantWidgetProps {
  messages: AssistantMessage[];
  loading: boolean;
  onSendMessage: (msg: string) => void;
}

const CHIPS = [
  "Why am I tired?",
  "Should I train today?",
  "How was my recovery?",
  "Build My Day",
  "Improve my sleep",
  "Analyze my progress",
  "Make tomorrow easier",
];

export default function AiAssistantWidget({
  messages,
  loading,
  onSendMessage,
}: AiAssistantWidgetProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleChipClick = (chip: string) => {
    if (loading) return;
    onSendMessage(chip);
  };

  return (
    <section className="glass-panel rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden flex flex-col h-[520px] shadow-2xl">
      {/* Glow backdrop */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between relative z-10 bg-surface-container-high/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(76,215,246,0.3)] font-bold text-sm">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">Personal Health Intelligence</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-on-surface-variant font-mono">
              Telemetry Context Loaded · Non-clinical Assistant
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-on-surface-variant">
          READY
        </span>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2.5 border-b border-white/5 overflow-x-auto no-scrollbar flex items-center gap-2 relative z-10 bg-surface-container/30">
        <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider shrink-0">
          PROMPTS:
        </span>
        {CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-on-surface-variant hover:text-white transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 relative z-10 text-xs sm:text-sm"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <span className="material-symbols-outlined text-primary text-4xl">
              smart_toy
            </span>
            <p className="text-sm font-bold text-white">
              I&apos;ve analyzed your recent health and recovery telemetry.
            </p>
            <p className="text-xs text-on-surface-variant max-w-sm">
              Ask about your sleep debt, readiness for physical training, or how to structure today&apos;s cognitive capacity.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl leading-relaxed ${
                    isUser
                      ? "bg-primary text-slate-950 font-medium rounded-tr-sm shadow-[0_0_15px_rgba(76,215,246,0.3)]"
                      : "bg-surface-container-high/90 border border-white/10 text-on-surface rounded-tl-sm shadow-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Evidence tag if provided */}
                  {msg.evidence && msg.evidence.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-[10px] font-mono text-on-surface-variant/80">
                      {msg.evidence.join(" · ")}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant/70 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </motion.div>
            );
          })
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs font-mono text-primary py-2"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>Analyzing your recent telemetry and patterns...</span>
          </motion.div>
        )}
      </div>

      {/* Input Field Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 border-t border-white/5 bg-surface-container/60 relative z-10 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your assistant about recovery, sleep, or training..."
          className="flex-1 bg-surface-container-high/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-on-surface-variant/60 outline-none focus:border-primary/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(76,215,246,0.4)] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <span className="material-symbols-outlined text-base">send</span>
        </button>
      </form>
    </section>
  );
}
