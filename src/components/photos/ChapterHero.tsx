import { type PhotoChapter } from "@/lib/notion";
import KenBurns from "@/components/shared/KenBurns";

export default function ChapterHero({ chapter }: { chapter: PhotoChapter }) {
  const m = chapter.chapter.match(/^(\d+)\s+(.+)$/);
  const number = m?.[1] ?? "";
  const title = m?.[2] ?? chapter.chapter;

  return (
    <header className="relative h-[90vh] w-full overflow-hidden">
      {chapter.heroPhoto?.imageUrl && (
        <KenBurns
          src={chapter.heroPhoto.imageUrl}
          alt={chapter.heroPhoto.title || chapter.chapter}
          className="absolute inset-0"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      <div className="absolute bottom-12 left-6 right-6 mx-auto max-w-[1100px] md:bottom-20 md:left-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-foreground-soft md:text-sm">
          / chapter {number}
        </p>
        <h1 className="mt-3 text-4xl font-light tracking-tight text-foreground-strong md:text-6xl">
          {title}
        </h1>
        {chapter.intro && (
          <p className="mt-6 max-w-[600px] text-base font-light leading-relaxed text-foreground-soft md:text-lg">
            {chapter.intro}
          </p>
        )}
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-foreground-mute md:text-sm">
          {chapter.photos.length}장
        </p>
      </div>
    </header>
  );
}
