import { notFound } from "next/navigation";
import { getPhotos, chapterSlug } from "@/lib/notion";
import BackNav from "@/components/layout/BackNav";
import ChapterHero from "@/components/photos/ChapterHero";
import ChapterGrid from "@/components/photos/ChapterGrid";
import ChapterPager from "@/components/photos/ChapterPager";

export async function generateStaticParams() {
  const chapters = await getPhotos();
  return chapters.map((c) => ({ chapter: chapterSlug(c.chapter) }));
}

export default async function PhotoChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: slug } = await params;
  const chapters = await getPhotos();
  const idx = chapters.findIndex((c) => chapterSlug(c.chapter) === slug);
  if (idx === -1) notFound();
  const chapter = chapters[idx];
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  return (
    <main>
      <BackNav trail="photos" />
      <ChapterHero chapter={chapter} />
      <ChapterGrid photos={chapter.photos} />
      <ChapterPager prev={prev} next={next} />
    </main>
  );
}
