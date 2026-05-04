"use client";

import Image from "next/image";
import { useState } from "react";
import { type NotionPhoto } from "@/lib/notion";
import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";
import Lightbox from "./Lightbox";

export default function ChapterGrid({ photos }: { photos: NotionPhoto[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const setRef = useScrollRevealMultiple(0.05);

  const navigate = (delta: number) => {
    setOpenIdx((i) => {
      if (i === null) return i;
      const n = i + delta;
      if (n < 0) return photos.length - 1;
      if (n >= photos.length) return 0;
      return n;
    });
  };

  return (
    <>
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
        <div className="columns-1 gap-3 sm:columns-2 md:columns-3 lg:columns-4">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              ref={setRef(i) as any}
              className="reveal mb-3 block w-full break-inside-avoid overflow-hidden rounded-md bg-card-bg transition-transform hover:scale-[1.01]"
              style={{ transitionDelay: `${i * 40}ms` }}
              onClick={() => setOpenIdx(i)}
            >
              <Image
                src={photo.imageUrl}
                alt={photo.title || ""}
                width={800}
                height={1000}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="h-auto w-full"
              />
            </button>
          ))}
        </div>
      </div>

      {openIdx !== null && (
        <Lightbox
          photos={photos}
          index={openIdx}
          onClose={() => setOpenIdx(null)}
          onNavigate={navigate}
        />
      )}
    </>
  );
}
