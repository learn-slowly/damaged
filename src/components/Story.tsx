"use client";

import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";

const lines = [
  "10년 동안 여섯 번 수술대에 올랐다.",
  "떼어낼 수 있는 건 다 떼어냈는데,",
  "원인은 유전자에 있었다.",
  "",
  "그 사이에 코드를 짜기 시작했다.",
  "코드를 읽을 줄 모른 채로.",
];

export default function Story() {
  const setRef = useScrollRevealMultiple(0.3);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-[650px] space-y-4">
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
      </div>
    </section>
  );
}
