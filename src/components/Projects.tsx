"use client";

import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import { useScrollReveal, useScrollRevealMultiple } from "@/hooks/useScrollReveal";

const introLines = [
  "치료는 길고 공격적이었다.",
  "아프니 집에서라도 활동을 해야했다.",
  "마침 ai란게 생겨나서",
  "하나 하나 물어가며 필요한 것들을 만들었다.",
];

export default function Projects() {
  const titleRef = useScrollReveal<HTMLHeadingElement>(0.3);
  const setIntroRef = useScrollRevealMultiple(0.3);
  const setCardRef = useScrollRevealMultiple(0.3);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <div className="max-w-[650px] space-y-4 mb-16">
        <h2
          ref={titleRef}
          className="reveal text-sm font-light uppercase tracking-widest text-accent mb-8"
        >
          혼자 만든 것
        </h2>
        {introLines.map((line, i) => (
          <p
            key={i}
            ref={setIntroRef(i)}
            className="reveal text-lg font-light leading-relaxed md:text-xl"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            {line}
          </p>
        ))}
      </div>
      <div className="grid w-full max-w-[1000px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <div
            key={project.id}
            ref={setCardRef(i)}
            className="reveal"
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </section>
  );
}
