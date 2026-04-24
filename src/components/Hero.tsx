"use client";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-light tracking-wide text-foreground-strong md:text-8xl">
        damaged.
      </h1>
      <p className="mt-4 text-lg font-light text-accent">백아형</p>
      <div className="absolute bottom-12 animate-bounce text-accent">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
