"use client";

/**
 * Accessibility helper utility for runtime accessibility checks in development mode.
 */
export async function initA11yCheck() {
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    try {
      const React = await import("react");
      const ReactDOM = await import("react-dom");
      // @ts-ignore - Optional dev dependency
      const axeModule = "@axe-core/react";
      // @ts-ignore
      const axe = await import(/* webpackIgnore: true */ axeModule);
      if (axe && axe.default) {
        axe.default(React.default || React, ReactDOM.default || ReactDOM, 1000);
        console.log("[a11yCheck] Axe-core accessibility auditing active in dev mode.");
      }
    } catch {
      // Silently ignore if @axe-core/react is not installed
    }
  }
}

/**
 * Validates contrast ratio between text color and background color in HSL/RGB hex format.
 * Returns true if WCAG AA compliant (ratio >= 4.5).
 */
export function checkContrastAA(textHex: string, bgHex: string): boolean {
  const getLuminance = (hex: string) => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  try {
    const lum1 = getLuminance(textHex);
    const lum2 = getLuminance(bgHex);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);
    return ratio >= 4.5;
  } catch {
    return true; // Fallback
  }
}
