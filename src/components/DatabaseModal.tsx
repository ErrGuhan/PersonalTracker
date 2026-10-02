"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  X,
  Server,
  HardDrive,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  checkDbHealth,
  getActiveSupabaseConfig,
  saveCustomCredentials,
  clearCustomCredentials,
  hasCustomCredentials,
  DbStatusInfo,
} from "@/lib/dbConnection";

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export default function DatabaseModal({ isOpen, onClose, onSuccess }: DatabaseModalProps) {
  const [config, setConfig] = useState(getActiveSupabaseConfig());
  const [status, setStatus] = useState<DbStatusInfo | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [customActive, setCustomActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getActiveSupabaseConfig();
      setConfig(cfg);
      setCustomActive(hasCustomCredentials());
      checkDbHealth().then(setStatus);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleTestAndSave() {
    setTesting(true);
    try {
      const result = await checkDbHealth(config.url);
      setStatus(result);
      if (result.status === "connected") {
        saveCustomCredentials(config.url, config.key);
        setCustomActive(true);
        if (onSuccess) onSuccess("Connected to Supabase database!");
      } else {
        saveCustomCredentials(config.url, config.key);
        setCustomActive(true);
      }
    } catch {
      // error handled inside checkDbHealth
    } finally {
      setTesting(false);
    }
  }

  function handleReset() {
    clearCustomCredentials();
    setCustomActive(false);
    const def = getActiveSupabaseConfig();
    setConfig(def);
    checkDbHealth().then(setStatus);
    if (onSuccess) onSuccess("Reset database connection to defaults");
  }

  async function handleCopySchema() {
    try {
      const res = await fetch("/api/db/schema");
      const sql = await res.text();
      await navigator.clipboard.writeText(sql);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 3000);
      if (onSuccess) onSuccess("Copied supabase/schema.sql to clipboard!");
    } catch (err) {
      console.error("Failed to copy schema:", err);
    }
  }

  const isConnected = status?.status === "connected";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg rounded-2xl bg-[#1c2028] border border-white/10 shadow-2xl p-6 text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Database & Cloud Sync</h2>
              <p className="text-xs text-slate-400 font-mono">Backend connection diagnostics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Banner */}
        <div
          className={`p-4 rounded-xl border flex flex-col gap-2 ${
            isConnected
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/25 text-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <HardDrive className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider">
                {isConnected ? "Cloud Database Connected" : "Local Storage Mode Active"}
              </span>
            </div>
            {status?.latencyMs !== undefined && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10">
                {status.latencyMs}ms
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {status?.message || "Diagnosing connection..."}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-1">
            <Server className="w-3 h-3" />
            <span>Host: {status?.host || "checking..."}</span>
          </div>
        </div>

        {/* Resilience Explanation */}
        {!isConnected && (
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-0.5">Zero Data Loss Architecture</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All metrics, workouts, meals, hydration, and habits are stored in your browser's persistent local database. If your Supabase free tier project is paused or unconfigured, the app works 100% offline with zero lag.
              </p>
            </div>
          </div>
        )}

        {/* Configuration Inputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">Supabase Project URL</label>
            {customActive && (
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                Custom URL Active
              </span>
            )}
          </div>
          <input
            type="text"
            value={config.url}
            onChange={(e) => setConfig((prev) => ({ ...prev, url: e.target.value }))}
            placeholder="https://your-project.supabase.co"
            className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />

          <label className="text-xs font-semibold text-slate-200 block">Supabase Anon Key</label>
          <input
            type="password"
            value={config.key}
            onChange={(e) => setConfig((prev) => ({ ...prev, key: e.target.value }))}
            placeholder="eyJhbGciOi... or sb_publishable_..."
            className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleTestAndSave}
            disabled={testing}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
            {testing ? "Testing Connection..." : "Test & Connect"}
          </button>

          {customActive && (
            <button
              onClick={handleReset}
              className="py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* SQL Schema Copy Section */}
        <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Supabase Setup Guide</span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-medium"
            >
              Supabase Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Need to set up a new project or rebuild tables? Copy the complete schema SQL and run it in the Supabase SQL Editor:
          </p>
          <button
            onClick={handleCopySchema}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copiedSchema ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Schema SQL Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy Complete Schema (schema.sql)</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
