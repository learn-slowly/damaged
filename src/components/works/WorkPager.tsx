import Link from "next/link";
import MagneticHover from "@/components/shared/MagneticHover";
import { type NotionProject } from "@/lib/notion";

export default function WorkPager({ prev, next }: { prev: NotionProject | null; next: NotionProject | null }) {
  return (
    <nav className="mx-auto mt-24 grid max-w-[800px] grid-cols-2 gap-4 border-t border-card-border px-6 py-12 md:mt-32">
      <div>
        {prev && (
          <MagneticHover strength={4}>
            <Link href={`/works/${prev.slug}`} className="group block">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute">
                ← prev
              </p>
              <p className="mt-2 text-base font-light text-foreground-soft group-hover:text-accent-amber md:text-lg">
                {prev.title}
              </p>
            </Link>
          </MagneticHover>
        )}
      </div>
      <div className="text-right">
        {next && (
          <MagneticHover strength={4}>
            <Link href={`/works/${next.slug}`} className="group block">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute">
                next →
              </p>
              <p className="mt-2 text-base font-light text-foreground-soft group-hover:text-accent-amber md:text-lg">
                {next.title}
              </p>
            </Link>
          </MagneticHover>
        )}
      </div>
    </nav>
  );
}
