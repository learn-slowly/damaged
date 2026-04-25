"use client";

import { type NotionPhoto } from "@/lib/notion";
import { useScrollReveal, useScrollRevealMultiple } from "@/hooks/useScrollReveal";

const introLines = [
  "빨리 가지 못하므로, 자주 멈춰섰고,",
  "멀리 가지 못하므로, 한 번 더 뒤돌아 봤다.",
  "그렇게 주운 것들이다.",
];

interface PhotosProps {
  photos: NotionPhoto[];
}

export default function Photos({ photos }: PhotosProps) {
  const titleRef = useScrollReveal<HTMLHeadingElement>(0.3);
  const setRef = useScrollRevealMultiple(0.3);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <div className="max-w-[650px] space-y-4 mb-16">
        <h2
          ref={titleRef}
          className="reveal text-sm font-light uppercase tracking-widest text-accent mb-8"
        >
          멈추는 것
        </h2>
        {introLines.map((line, i) => (
          <p
            key={i}
            ref={setRef(i)}
            className="reveal text-lg font-light leading-relaxed md:text-xl"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            {line}
          </p>
        ))}
      </div>
      {photos.length > 0 && (
        <div className="grid w-full max-w-[1000px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              ref={setRef(introLines.length + i)}
              className="reveal aspect-square overflow-hidden rounded-lg bg-card-bg"
              style={{ transitionDelay: `${(introLines.length + i) * 150}ms` }}
            >
              <img
                src={photo.imageUrl}
                alt={photo.title || photo.description || ""}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
