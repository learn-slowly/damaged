import Link from "next/link";
import Image from "next/image";
import { getPhotos, chapterSlug } from "@/lib/notion";
import BackNav from "@/components/layout/BackNav";

export default async function PhotosIndexPage() {
  const chapters = await getPhotos();

  return (
    <main>
      <BackNav trail="photos" />
      <div className="mx-auto max-w-[1100px] px-6 py-16 md:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm">
          / photos {String(chapters.length).padStart(2, "0")}
        </p>
        <h1 className="mt-4 text-3xl font-light tracking-tight text-foreground-strong md:text-5xl">
          그렇게 주운 것들
        </h1>
        <p className="mt-4 max-w-[600px] text-base font-light text-foreground-soft md:text-lg">
          빨리 가지 못하므로, 자주 멈춰섰고, 멀리 가지 못하므로, 한 번 더 뒤돌아 봤다.
        </p>
      </div>

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-2 md:grid-cols-3">
        {chapters.map((c) => {
          const m = c.chapter.match(/^(\d+)\s+(.+)$/);
          const number = m?.[1] ?? "";
          const title = m?.[2] ?? c.chapter;
          return (
            <Link
              key={c.chapter}
              href={`/photos/${chapterSlug(c.chapter)}`}
              className="group block overflow-hidden rounded-md border border-card-border bg-card-bg transition-all hover:border-accent-amber"
            >
              {c.heroPhoto?.imageUrl && (
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={c.heroPhoto.imageUrl}
                    alt={c.chapter}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute">
                  / chapter {number} · {c.photos.length}장
                </p>
                <h3 className="mt-2 text-lg font-light tracking-tight text-foreground-strong group-hover:text-accent-amber md:text-xl">
                  {title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
