"use client";

import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";

const lines = [
  "2016년, 33살, 왼쪽 유방암.",
  "2022년, 오른쪽 유방암.",
  "2024년, 양측 갑상선암.",
  "2025년, 다시 왼쪽.",
  "",
  "BRCA 2 유전자 변이가 있다고 했다.",
  "많은 것을 잘라냈지만,",
  "손상된 유전자는 떼어낼 수도 없었다.",
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
