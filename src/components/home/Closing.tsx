"use client";

import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";

const monologue: { text: string; serif?: boolean }[] = [
  { text: "누구나 다른 형태로 살아간다" },
  { text: "living with damage", serif: true },
  { text: "나 역시 그럴 뿐이다" },
];

export default function Closing() {
  const setRef = useScrollRevealMultiple(0.3);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-32">
      {/* 한 호흡 어둠 — 본문 위 빈 공간 */}
      <div className="h-[20vh]" aria-hidden="true" />

      {/* 본문 (B 다큐 모놀로그) */}
      <div className="max-w-[600px] space-y-3 text-center">
        {monologue.map((line, i) => (
          <p
            key={i}
            ref={setRef(i)}
            className={`reveal text-lg font-light leading-relaxed text-foreground md:text-xl ${
              line.serif ? "font-serif" : ""
            }`}
            style={{ transitionDelay: `${i * 200}ms` }}
          >
            {line.text}
          </p>
        ))}
      </div>

      {/* 한 박자 정지 */}
      <div className="h-[10vh]" aria-hidden="true" />

      {/* 메타 (C 키네틱 폴리시) */}
      <div
        ref={setRef(monologue.length)}
        className="reveal flex flex-col items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm"
        style={{ transitionDelay: `${monologue.length * 200 + 400}ms` }}
      >
        <p>/ end of file</p>
        <p>
          <a href="mailto:redoutk@gmail.com" className="hover:text-accent-amber">redoutk@gmail.com</a>
          {" · "}
          damaged.kr
          {" · "}
          2026
        </p>
      </div>
    </section>
  );
}
