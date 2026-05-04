"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { prefersReducedMotion, isTouchDevice } from "@/lib/motion";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
