"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { type PhotoChapter, chapterSlug } from "@/lib/notion";
import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";
import KenBurns from "@/components/shared/KenBurns";

export default function PhotosTeaser({ chapters }: { chapters: PhotoChapter[] }) {
  const heroChapters = chapters.filter((c) => c.heroPhoto?.isHero).slice(0, 2);
  const fallbackHero = heroChapters.length === 0 ? chapters.slice(0, 1) : [];
  const featured = [...heroChapters, ...fallbackHero];
  const featuredIds = new Set(featured.map((c) => c.chapter));
  const rest = chapters.filter((c) => !featuredIds.has(c.chapter));

  const [hovered, setHovered] = useState<string | null>(null);
  const setRef = useScrollRevealMultiple(0.2);

  const splitChapter = (label: string) => {
    const m = label.match(/^(\d+)\s+(.+)$/);
    return m ? { number: m[1], title: m[2] } : { number: "", title: label };
  };

  const introLines = [
    "빨리 가지 못하므로, 자주 멈춰섰고,",
    "멀리 가지 못하므로, 한 번 더 뒤돌아 봤다.",
    "그렇게 주운 것들이다.",
  ];

  return (
    <section className="relative px-0 py-32">
      <div className="px-6 mb-16">
        <p className="reveal mb-10 font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm" ref={setRef(0)}>
          / photos {String(chapters.length).padStart(2, "0")}
        </p>
        <div className="max-w-[650px] space-y-3">
          {introLines.map((line, i) => (
            <p
              key={i}
              ref={setRef(i + 1) as any}
              className="reveal text-lg font-light leading-relaxed text-foreground md:text-xl"
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* 풀블리드 히어로 챕터 */}
      <div className="space-y-2">
        {featured.map((c, i) => {
          const { number, title } = splitChapter(c.chapter);
          return (
            <Link
              key={c.chapter}
              href={`/photos/${chapterSlug(c.chapter)}`}
              ref={setRef(introLines.length + 1 + i) as any}
              className="reveal group relative block h-[80vh] w-full overflow-hidden"
              style={{ transitionDelay: `${(introLines.length + 1 + i) * 100}ms` }}
            >
              <KenBurns src={c.heroPhoto.imageUrl} alt={c.heroPhoto.title || c.chapter} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
              <div className="absolute bottom-12 left-6 right-6 md:left-12">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-foreground-mute md:text-sm">
                  / chapter {number}
                </p>
                <h3 className="mt-3 text-3xl font-light tracking-tight text-foreground-strong md:text-5xl">
                  {title}
                </h3>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-accent-amber group-hover:underline">
                  {c.photos.length}장 →
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 나머지 챕터 리스트 */}
      <div className="relative mx-auto mt-16 w-full max-w-[1100px] px-6">
        <div className="pointer-events-none fixed right-12 top-1/2 hidden -translate-y-1/2 transition-opacity duration-500 md:block">
          {hovered &&
            (() => {
              const c = rest.find((c) => c.chapter === hovered);
              if (!c?.heroPhoto?.imageUrl) return null;
              return (
                <div className="relative aspect-[3/4] w-[280px] overflow-hidden rounded-lg border border-card-border bg-card-bg">
                  <Image src={c.heroPhoto.imageUrl} alt={c.chapter} fill sizes="280px" className="object-cover" />
                </div>
              );
            })()}
        </div>

        <ul className="divide-y divide-card-border">
          {rest.map((c, i) => {
            const { number, title } = splitChapter(c.chapter);
            return (
              <li
                key={c.chapter}
                ref={setRef(introLines.length + featured.length + 1 + i) as any}
                className="reveal group"
                style={{ transitionDelay: `${(introLines.length + featured.length + 1 + i) * 80}ms` }}
                onMouseEnter={() => setHovered(c.chapter)}
                onMouseLeave={() => setHovered((h) => (h === c.chapter ? null : h))}
              >
                <Link
                  href={`/photos/${chapterSlug(c.chapter)}`}
                  className="grid grid-cols-[40px_1fr_auto] items-baseline gap-6 py-6 transition-colors duration-300 hover:bg-card-bg/30 md:grid-cols-[60px_1fr_120px_auto] md:gap-10"
                >
                  <span className="font-mono text-xs text-foreground-mute md:text-sm">{number}</span>
                  <h3 className="text-xl font-light tracking-tight text-foreground-strong group-hover:text-accent-amber md:text-2xl">
                    {title}
                  </h3>
                  <p className="hidden font-mono text-xs uppercase tracking-widest text-foreground-mute md:block">
                    {c.photos.length}장
                  </p>
                  <span className="font-mono text-xs uppercase tracking-widest text-foreground-mute group-hover:text-accent-amber">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
