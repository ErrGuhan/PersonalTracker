"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getNextRoute, getPrevRoute } from "@/lib/navigation";

interface TouchCoords {
  x: number;
  y: number;
  time: number;
}

const INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input",
  "textarea",
  "select",
  "[role='button']",
  "[role='slider']",
  "[role='dialog']",
  "[role='tab']",
  "[data-no-swipe]",
  ".no-swipe",
  ".circular-progress",
].join(", ");

const MIN_HORIZONTAL_DISTANCE = 70;   // minimum px to qualify as a swipe
const MIN_VELOCITY = 0.25;            // px / ms
const HORIZONTAL_DOMINANCE_RATIO = 1.4; // deltaX must dominate deltaY
const NAVIGATION_LOCK_MS = 400;       // prevent double triggers
const DRAG_RESISTANCE = 0.25;         // visual drag follows finger at 25% of actual movement

/**
 * Attaches a deterministic horizontal swipe gesture listener to containerRef.
 * Guaranteed to NEVER interfere with vertical scrolling or interactive elements.
 *
 * Visual feedback: content follows finger at DRAG_RESISTANCE scale during drag,
 * snaps back on cancel, navigates on sufficient gesture.
 * All visual transforms are applied directly to the DOM element — no React state
 * updates on touchmove, so zero unnecessary rerenders.
 */
export function useSwipeNavigation(containerRef: React.RefObject<HTMLElement | null>) {
  const router = useRouter();
  const pathname = usePathname();
  const startRef = useRef<TouchCoords | null>(null);
  const isLockedRef = useRef(false);
  const isVerticalScrollRef = useRef(false);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number>(0);

  // Apply translateX directly via DOM style — no React re-renders during drag
  const applyTranslate = useCallback((el: HTMLElement, x: number) => {
    el.style.transform = x !== 0
      ? `translate3d(${x}px, 0, 0)`
      : "";
    el.classList.toggle("is-dragging", x !== 0);
  }, []);

  const resetTranslate = useCallback((el: HTMLElement) => {
    // Restore transition so snap-back is smooth
    el.style.transition = "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.transform = "";
    el.classList.remove("is-dragging");
    // Remove transition override after snap-back completes
    setTimeout(() => {
      el.style.transition = "";
    }, 250);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isLockedRef.current) return;
    if (e.touches.length !== 1) return;

    // 1. Exclusion: ignore touches on interactive controls
    const target = e.target as HTMLElement | null;
    if (target && target.closest(INTERACTIVE_SELECTOR)) {
      startRef.current = null;
      return;
    }

    const touch = e.touches[0];
    startRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    isVerticalScrollRef.current = false;
    isDraggingRef.current = false;

    // Disable transition during drag for raw finger-follow
    const el = containerRef.current;
    if (el) el.style.transition = "none";
  }, [containerRef]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startRef.current || isVerticalScrollRef.current) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startRef.current.x;
    const deltaY = touch.clientY - startRef.current.y;

    // 2. Vertical scroll priority — if vertical motion dominates, cancel swipe
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isVerticalScrollRef.current = true;
      // Reset visual state if we started dragging
      if (isDraggingRef.current) {
        const el = containerRef.current;
        if (el) resetTranslate(el);
      }
      startRef.current = null;
      return;
    }

    // 3. Apply visual drag feedback — batched via rAF, no setState
    if (Math.abs(deltaX) > 8) {
      isDraggingRef.current = true;
      const visualOffset = Math.round(deltaX * DRAG_RESISTANCE);
      const el = containerRef.current;
      if (el) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          applyTranslate(el, visualOffset);
        });
      }
    }
  }, [containerRef, applyTranslate, resetTranslate]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const el = containerRef.current;

    // Always reset visual state on touch end
    if (el) resetTranslate(el);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    isDraggingRef.current = false;

    if (!startRef.current || isVerticalScrollRef.current || isLockedRef.current) {
      startRef.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startRef.current.x;
    const deltaY = touch.clientY - startRef.current.y;
    const deltaTime = Math.max(1, Date.now() - startRef.current.time);
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const velocityX = absX / deltaTime;

    startRef.current = null;

    // 4. Validation: horizontal dominance + threshold
    if (absX < MIN_HORIZONTAL_DISTANCE) return;
    if (absX < absY * HORIZONTAL_DOMINANCE_RATIO) return;

    // 5. Either reasonable velocity (quick flick) or substantial travel distance
    if (velocityX < MIN_VELOCITY && absX < 120) return;

    // 6. Determine target route
    let targetRoute: string | null = null;
    if (deltaX < 0) {
      targetRoute = getNextRoute(pathname); // Swipe Left → Next
    } else {
      targetRoute = getPrevRoute(pathname); // Swipe Right → Previous
    }

    if (targetRoute && targetRoute !== pathname) {
      // 7. Atomic lock — prevents duplicate multi-page skips
      isLockedRef.current = true;
      router.push(targetRoute);

      setTimeout(() => {
        isLockedRef.current = false;
      }, NAVIGATION_LOCK_MS);
    }
  }, [pathname, router, containerRef, resetTranslate]);

  useEffect(() => {
    // Prefetch adjacent routes so swiping renders instantaneously
    const next = getNextRoute(pathname);
    const prev = getPrevRoute(pathname);
    if (next) router.prefetch(next);
    if (prev) router.prefetch(prev);
  }, [pathname, router]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Attach passive listeners — maximum native scroll performance
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, handleTouchStart, handleTouchMove, handleTouchEnd]);
}
