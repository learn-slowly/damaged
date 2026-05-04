"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface Props {
  src: string;
  alt: string;
  /** 9000ms 한 사이클 기본 */
  duration?: number;
  className?: string;
  priority?: boolean;
}

export default function KenBurns({ src, alt, duration = 9000, className = "", priority = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const start = performance.now();
    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirY = Math.random() > 0.5 ? 1 : -1;

    const tick = (now: number) => {
      const t = ((now - start) % duration) / duration; // 0..1
      const phase = (1 - Math.cos(2 * Math.PI * t)) / 2; // 0..1
      const scale = 1.06 + 0.04 * phase; // 1.06..1.10
      const px = dirX * 1.5 * (phase - 0.5) * 2; // -1.5..+1.5 %
      const py = dirY * 1.0 * (phase - 0.5) * 2;
      el.style.transform = `scale(${scale.toFixed(4)}) translate(${px.toFixed(2)}%, ${py.toFixed(2)}%)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [duration]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="relative h-full w-full">
        <div
          ref={ref}
          className="absolute inset-0"
          style={{ transform: "scale(1.06)" }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
