"use client";

import { useEffect, useState } from "react";
import BreathingType from "@/components/shared/BreathingType";

export default function Hero() {
  const [showAlive, setShowAlive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowAlive(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <p className="absolute right-6 top-6 font-mono text-xs uppercase tracking-[0.2em] text-foreground-mute md:text-sm">
        / 백아형 · seoul · 2026
      </p>

      <h1 className="text-7xl tracking-tight text-foreground-strong md:text-[10rem]">
        <BreathingType>damaged.</BreathingType>
      </h1>

      <p
        className={`mt-6 text-lg font-light text-accent-amber transition-opacity duration-[1500ms] md:text-xl ${
          showAlive ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!showAlive}
      >
        but alive.
      </p>

      <div className="absolute bottom-12 animate-bounce text-foreground-mute" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
