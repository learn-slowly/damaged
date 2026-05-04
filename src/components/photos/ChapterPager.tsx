import Link from "next/link";
import { type PhotoChapter, chapterSlug } from "@/lib/notion";
import MagneticHover from "@/components/shared/MagneticHover";

function splitLabel(label: string) {
  const m = label.match(/^(\d+)\s+(.+)$/);
  return m ? { number: m[1], title: m[2] } : { number: "", title: label };
}

export default function ChapterPager({
  prev,
  next,
}: {
  prev: PhotoChapter | null;
  next: PhotoChapter | null;
}) {
  return (
    <nav className="mx-auto mt-16 grid max-w-[1100px] grid-cols-2 gap-4 border-t border-card-border px-6 py-12 md:mt-24">
      <div>
        {prev && (
          <MagneticHover strength={4}>
            <Link href={`/photos/${chapterSlug(prev.chapter)}`} className="group block">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute">← prev chapter</p>
              <p className="mt-2 text-base font-light text-foreground-soft group-hover:text-accent-amber md:text-lg">
                {splitLabel(prev.chapter).title}
              </p>
            </Link>
          </MagneticHover>
        )}
      </div>
      <div className="text-right">
        {next && (
          <MagneticHover strength={4}>
            <Link href={`/photos/${chapterSlug(next.chapter)}`} className="group block">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute">next chapter →</p>
              <p className="mt-2 text-base font-light text-foreground-soft group-hover:text-accent-amber md:text-lg">
                {splitLabel(next.chapter).title}
              </p>
            </Link>
          </MagneticHover>
        )}
      </div>
    </nav>
  );
}
