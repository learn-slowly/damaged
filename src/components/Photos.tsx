"use client";

import { type PhotoChapter } from "@/lib/notion";
import { useScrollReveal, useScrollRevealMultiple } from "@/hooks/useScrollReveal";

const introLines = [
  "빨리 가지 못하므로, 자주 멈춰섰고,",
  "멀리 가지 못하므로, 한 번 더 뒤돌아 봤다.",
  "그렇게 주운 것들이다.",
];

interface PhotosProps {
  chapters: PhotoChapter[];
}

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m] = iso.split("-");
  return m ? `${y}. ${parseInt(m, 10)}.` : y;
}

function splitChapter(label: string) {
  const match = label.match(/^(\d+)\s+(.+)$/);
  return match ? { number: match[1], title: match[2] } : { number: "", title: label };
}

function caption(date: string, location: string) {
  const d = formatDate(date);
  return [d, location].filter(Boolean).join(" ");
}

export default function Photos({ chapters }: PhotosProps) {
  const titleRef = useScrollReveal<HTMLHeadingElement>(0.3);
  const setRef = useScrollRevealMultiple(0.3);

  let revealIndex = 0;
  const nextRef = () => setRef(revealIndex++);

  return (
    <section className="flex flex-col items-center px-6 py-24">
      <div className="max-w-[650px] space-y-4 mb-24">
        <h2
          ref={titleRef}
          className="reveal text-sm font-light uppercase tracking-widest text-accent mb-8"
        >
          멈추는 것
        </h2>
        {introLines.map((line, i) => (
          <p
            key={i}
            ref={nextRef()}
            className="reveal text-lg font-light leading-relaxed md:text-xl"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            {line}
          </p>
        ))}
      </div>

      <div className="w-full max-w-[1000px] space-y-32">
        {chapters.map(({ chapter, photos }) => {
          const { number, title } = splitChapter(chapter);
          return (
            <div key={chapter} className="space-y-8">
              <div ref={nextRef()} className="reveal flex items-baseline gap-4">
                <span className="text-sm font-light tracking-widest text-accent">
                  {number}
                </span>
                <h3 className="text-xl font-light text-foreground-strong md:text-2xl">
                  {title}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((photo) => (
                  <figure key={photo.id} ref={nextRef()} className="reveal">
                    <div className="aspect-square overflow-hidden rounded-lg bg-card-bg">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title || photo.description || ""}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {caption(photo.date, photo.location) && (
                      <figcaption className="mt-2 text-xs font-light text-accent">
                        {caption(photo.date, photo.location)}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
