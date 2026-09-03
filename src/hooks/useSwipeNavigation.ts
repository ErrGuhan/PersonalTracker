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

const MIN_HORIZONTAL_DISTANCE = 70; // minimum px to qualify as a swipe
const MIN_VELOCITY = 0.25; // px / ms
const HORIZONTAL_DOMINANCE_RATIO = 1.4; // deltaX must dominate deltaY
const NAVIGATION_LOCK_MS = 400; // prevent double triggers

/**
 * Attaches a deterministic horizontal swipe gesture listener to containerRef.
 * Guaranteed to NEVER interfere with vertical scrolling or interactive elements.
 */
export function useSwipeNavigation(containerRef: React.RefObject<HTMLElement | null>) {
  const router = useRouter();
  const pathname = usePathname();
  const startRef = useRef<TouchCoords | null>(null);
  const isLockedRef = useRef(false);
  const isVerticalScrollRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isLockedRef.current) return;
    if (e.touches.length !== 1) return;

    // 1. Exclusion check: ignore touches on interactive controls
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
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startRef.current || isVerticalScrollRef.current) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startRef.current.x;
    const deltaY = touch.clientY - startRef.current.y;

    // 2. Vertical scroll priority: if vertical travel dominates, cancel horizontal gesture
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isVerticalScrollRef.current = true;
      startRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
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

    // 3. Validation: horizontal dominance
    if (absX < MIN_HORIZONTAL_DISTANCE) return;
    if (absX < absY * HORIZONTAL_DOMINANCE_RATIO) return;

    // 4. Either reasonable velocity (quick flick) or substantial travel distance
    if (velocityX < MIN_VELOCITY && absX < 120) return;

    // 5. Determine target route based on gesture direction
    let targetRoute: string | null = null;
    if (deltaX < 0) {
      // Swiping Left -> Navigate Next
      targetRoute = getNextRoute(pathname);
    } else {
      // Swiping Right -> Navigate Previous
      targetRoute = getPrevRoute(pathname);
    }

    if (targetRoute && targetRoute !== pathname) {
      // 6. Atomic lock to prevent duplicate multi-page skips
      isLockedRef.current = true;
      router.push(targetRoute);

      setTimeout(() => {
        isLockedRef.current = false;
      }, NAVIGATION_LOCK_MS);
    }
  }, [pathname, router]);

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

    // Attach passive listeners for maximum native scroll performance
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [containerRef, handleTouchStart, handleTouchMove, handleTouchEnd]);
}

