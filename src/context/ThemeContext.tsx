"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ThemeContextProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accentColor, setAccentColor] = useState<string>("#06b6d4"); // default cyan

  // Load persisted preferences
  useEffect(() => {
    const storedTheme = localStorage.getItem("lifesync-theme") as "dark" | "light" | null;
    const storedAccent = localStorage.getItem("lifesync-accent");
    if (storedTheme) setTheme(storedTheme);
    if (storedAccent) setAccentColor(storedAccent);
  }, []);

  // Persist changes
  useEffect(() => {
    localStorage.setItem("lifesync-theme", theme);
    localStorage.setItem("lifesync-accent", accentColor);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, accentColor]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
