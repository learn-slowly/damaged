"use client";

import { useEffect } from "react";
import Image from "next/image";
import { type NotionPhoto } from "@/lib/notion";

interface Props {
  photos: NotionPhoto[];
  index: number;
  onClose: () => void;
  onNavigate: (delta: number) => void;
}

function caption(date: string, location: string) {
  const formatDate = (iso: string) => {
    if (!iso) return "";
    const [y, m] = iso.split("-");
    return m ? `${y}. ${parseInt(m, 10)}.` : y;
  };
  return [formatDate(date), location].filter(Boolean).join(" ");
}

export default function Lightbox({ photos, index, onClose, onNavigate }: Props) {
  const photo = photos[index];

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

  if (!photo) return null;
  const cap = caption(photo.date, photo.location);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
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

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
        aria-label="이전"
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-3xl font-light text-foreground hover:text-foreground-strong md:left-8"
      >
        ←
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
        aria-label="다음"
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-3xl font-light text-foreground hover:text-foreground-strong md:right-8"
      >
        →
      </button>

      <div className="relative flex flex-1 items-center justify-center p-12" onClick={(e) => e.stopPropagation()}>
        <Image
          src={photo.imageUrl}
          alt={photo.title || ""}
          width={1600}
          height={1200}
          className="max-h-full max-w-full object-contain"
          sizes="100vw"
        />
      </div>

      {(photo.title || cap) && (
        <div className="px-6 pb-6 text-center font-light text-foreground-soft" onClick={(e) => e.stopPropagation()}>
          {photo.title && <p className="text-base md:text-lg">{photo.title}</p>}
          {cap && <p className="mt-1 font-mono text-xs uppercase tracking-widest text-foreground-mute">{cap}</p>}
        </div>
      )}
    </div>
  );
}
