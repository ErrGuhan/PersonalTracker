"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = "connecting" | "connected" | "error";

export default function ConnectionStatus() {
  const [status, setStatus] = useState<Status>("connecting");

  useEffect(() => {
    // Lightweight connectivity check — just check if Supabase URL responds
    supabase
      .from("health_metrics")
      .select("id", { count: "exact", head: true })
      .limit(0)
      .then(({ error }) => {
        setStatus(error ? "error" : "connected");
      });
  }, []);

  if (status === "connecting") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{ background: "rgba(134,147,151,0.1)", border: "1px solid rgba(134,147,151,0.2)" }}>
        <div className="w-1.5 h-1.5 rounded-full bg-outline animate-pulse" />
        <span className="label-caps" style={{ fontSize: 9, color: "#869397" }}>CONNECTING</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{ background: "rgba(255,180,171,0.1)", border: "1px solid rgba(255,180,171,0.2)" }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#ffb4ab" }} />
        <span className="label-caps" style={{ fontSize: 9, color: "#ffb4ab" }}>DB ERROR</span>
      </div>
    );
  }

  return (
    <div className="badge-live" style={{ fontSize: 9, padding: "2px 8px" }}>
      SUPABASE LIVE
    </div>
  );
}
