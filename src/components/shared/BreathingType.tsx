"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** 호흡 주기(ms). 기본 5000 */
  period?: number;
  /** wght 변동 진폭. 기본 25 (예: 300↔325) */
  weightAmp?: number;
  /** 베이스 wght. 기본 300 */
  baseWeight?: number;
  /** letter-spacing 진폭(em). 기본 0.005 */
  trackingAmp?: number;
}

export default function BreathingType({
  children,
  className = "",
  period = 5000,
  weightAmp = 25,
  baseWeight = 300,
  trackingAmp = 0.005,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = ((now - start) % period) / period; // 0..1
      const phase = (1 - Math.cos(2 * Math.PI * t)) / 2; // 0..1 부드러운
      const w = baseWeight + weightAmp * phase;
      const ls = (trackingAmp * (phase - 0.5) * 2).toFixed(4); // -amp..+amp
      el.style.fontVariationSettings = `"wght" ${w.toFixed(1)}`;
      el.style.letterSpacing = `${ls}em`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [period, weightAmp, baseWeight, trackingAmp]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariationSettings: `"wght" ${baseWeight}` }}
    >
      {children}
    </span>
  );
}
