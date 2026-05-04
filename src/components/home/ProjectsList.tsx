"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { type NotionProject } from "@/lib/notion";
import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";

export default function ProjectsList({ projects }: { projects: NotionProject[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const setRef = useScrollRevealMultiple(0.2);

  const hoveredProject = projects.find((p) => p.id === hovered);

  return (
    <section className="relative flex min-h-screen flex-col px-6 py-32">
      <p className="reveal mb-16 font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm" ref={setRef(0)}>
        / works {String(projects.length).padStart(2, "0")}
      </p>

      <div className="relative mx-auto w-full max-w-[1100px]">
        {/* hover 미리보기 (데스크톱만, sticky 우측) */}
        <div className="pointer-events-none fixed right-12 top-1/2 hidden -translate-y-1/2 transition-opacity duration-500 md:block">
          {hoveredProject?.screenshot && (
            <div className="relative aspect-[16/10] w-[360px] overflow-hidden rounded-lg border border-card-border bg-card-bg">
              <Image
                src={hoveredProject.screenshot}
                alt={hoveredProject.title}
                fill
                sizes="360px"
                className="object-cover object-top"
              />
            </div>
          )}
        </div>

        <ul className="divide-y divide-card-border">
          {projects.map((p, i) => (
            <li
              key={p.id}
              ref={setRef(i + 1)}
              className="reveal group"
              style={{ transitionDelay: `${(i + 1) * 80}ms` }}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered((h) => (h === p.id ? null : h))}
            >
              <Link
                href={`/works/${p.slug}`}
                className="grid grid-cols-[40px_1fr_auto] items-baseline gap-6 py-6 transition-colors duration-300 hover:bg-card-bg/30 md:grid-cols-[60px_1fr_200px_auto] md:gap-10"
              >
                <span className="font-mono text-xs text-foreground-mute md:text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl font-light tracking-tight text-foreground-strong group-hover:text-accent-amber md:text-2xl">
                    {p.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm font-light text-foreground-soft md:hidden">
                    {p.description}
                  </p>
                </div>
                <p className="hidden truncate text-sm font-light text-foreground-soft md:block">
                  {p.description}
                </p>
                <span className="font-mono text-xs uppercase tracking-widest text-foreground-mute group-hover:text-accent-amber">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
