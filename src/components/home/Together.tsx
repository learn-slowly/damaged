"use client";

import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";

const lines = [
  "혼자 만들 수 있다는 걸 알았다.",
  "그 다음 질문은 하나였다.",
  '"이걸 다른 사람도 할 수 있게 하려면?"',
];

export default function Together() {
  const setRef = useScrollRevealMultiple(0.3);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6">
      <p className="reveal mb-12 font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm" ref={setRef(0)}>
        / together
      </p>
      <div className="max-w-[650px] space-y-4">
        {lines.map((line, i) => (
          <p
            key={i}
            ref={setRef(i + 1)}
            className="reveal text-lg font-light leading-relaxed text-foreground md:text-xl"
            style={{ transitionDelay: `${(i + 1) * 100}ms` }}
          >
            {line}
          </p>
        ))}
        <div
          ref={setRef(lines.length + 1)}
          className="reveal pt-12"
          style={{ transitionDelay: `${(lines.length + 1) * 100}ms` }}
        >
          <a
            href="https://handson.ai.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-block rounded-lg border border-card-border bg-card-bg px-8 py-6 transition-all duration-300 hover:border-accent-amber hover:shadow-lg hover:shadow-black/30"
          >
            <p className="text-xl font-light tracking-tight text-foreground-strong">손에 잡히는 미래</p>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-accent-amber">
              handson.ai.kr →
            </p>
          </a>
        </div>
      </div>
    </section>
  );
}
