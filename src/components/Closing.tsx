"use client";

import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";

const lines = [
  "손상됐지만, 살아가야 한다.",
  "유한한 것은, 모두가 동일하다.",
  "그저 살아가야 하는 것도.",
  "",
  "— damaged",
];

export default function Closing() {
  const setRef = useScrollRevealMultiple(0.3);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-[650px] space-y-4 text-center">
        {lines.map((line, i) =>
          line === "" ? (
            <div key={i} className="h-8" />
          ) : (
            <p
              key={i}
              ref={setRef(i)}
              className="reveal text-lg font-light leading-relaxed md:text-xl"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {line}
            </p>
          )
        )}
        <div
          ref={setRef(lines.length)}
          className="reveal pt-16"
          style={{ transitionDelay: `${lines.length * 100}ms` }}
        >
          <a
            href="mailto:redoutk@gmail.com"
            className="text-sm font-light text-accent transition-colors hover:text-foreground-strong"
          >
            redoutk@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
