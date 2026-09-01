"use client";

import { HTMLAttributes } from "react";

interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

/**
 * Screen-reader only text utility component following WCAG standards.
 * Visually hides content while keeping it accessible to screen readers.
 */
export default function VisuallyHidden({ children, className = "", ...props }: VisuallyHiddenProps) {
  return (
    <span
      className={`sr-only ${className}`}
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      }}
      {...props}
    >
      {children}
    </span>
  );
}
