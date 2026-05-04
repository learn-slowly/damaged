"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, isTouchDevice } from "@/lib/motion";

export function useMagnetic<T extends HTMLElement = HTMLDivElement>(
  strength = 6
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return;
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    let tx = 0;
    let ty = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      tx = Math.max(-1, Math.min(1, dx)) * strength;
      ty = Math.max(-1, Math.min(1, dy)) * strength;
      schedule();
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      schedule();
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
        rafId = 0;
      });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.style.transition = "transform 200ms cubic-bezier(.2,.8,.2,1)";

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = "";
      el.style.transition = "";
    };
  }, [strength]);

  return ref;
}
