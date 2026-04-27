"use client";

import { useEffect, useState } from "react";
import { type NotionPhoto, type PhotoChapter } from "@/lib/notion";
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

interface ViewerState {
  chapterIdx: number;
  photoIdx: number;
}

function Lightbox({
  chapters,
  state,
  onClose,
  onNavigate,
}: {
  chapters: PhotoChapter[];
  state: ViewerState;
  onClose: () => void;
  onNavigate: (delta: number) => void;
}) {
  const photos = chapters[state.chapterIdx].photos;
  const photo = photos[state.photoIdx];
  const cap = caption(photo.date, photo.location);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onNavigate(-1);
      else if (e.key === "ArrowRight") onNavigate(1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center text-2xl font-light text-foreground hover:text-foreground-strong"
      >
        ×
      </button>
      {state.photoIdx > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(-1);
          }}
          aria-label="이전 사진"
          className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-3xl font-light text-foreground hover:text-foreground-strong"
        >
          ‹
        </button>
      )}
      {state.photoIdx < photos.length - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(1);
          }}
          aria-label="다음 사진"
          className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-3xl font-light text-foreground hover:text-foreground-strong"
        >
          ›
        </button>
      )}
      <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-12">
        <img
          src={photo.imageUrl}
          alt={photo.title || photo.description || ""}
          className="h-full w-full cursor-zoom-out object-contain"
        />
      </div>
      {cap && (
        <div className="pb-6 text-center text-xs font-light text-accent">
          {cap}
        </div>
      )}
    </div>
  );
}

export default function Photos({ chapters }: PhotosProps) {
  const titleRef = useScrollReveal<HTMLHeadingElement>(0.3);
  const setRef = useScrollRevealMultiple(0.3);
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  let revealIndex = 0;
  const nextRef = () => setRef(revealIndex++);

  const navigate = (delta: number) => {
    setViewer((v) => {
      if (!v) return v;
      const photos = chapters[v.chapterIdx].photos;
      const next = v.photoIdx + delta;
      if (next < 0 || next >= photos.length) return v;
      return { ...v, photoIdx: next };
    });
  };

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
        {chapters.map(({ chapter, photos }, chapterIdx) => {
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
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                {photos.map((photo, photoIdx) => (
                  <figure
                    key={photo.id}
                    ref={nextRef()}
                    className="reveal mb-10 break-inside-avoid"
                  >
                    <button
                      type="button"
                      onClick={() => setViewer({ chapterIdx, photoIdx })}
                      className="block w-full cursor-zoom-in overflow-hidden rounded-lg bg-card-bg transition-opacity hover:opacity-90"
                      aria-label={`${photo.title || "사진"} 크게 보기`}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title || photo.description || ""}
                        className="block h-auto w-full"
                        loading="lazy"
                      />
                    </button>
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

      {viewer && (
        <Lightbox
          chapters={chapters}
          state={viewer}
          onClose={() => setViewer(null)}
          onNavigate={navigate}
        />
      )}
    </section>
  );
}
