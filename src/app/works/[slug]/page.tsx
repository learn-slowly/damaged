import { notFound } from "next/navigation";
import { getProjects, getProject, getProjectBlocks } from "@/lib/notion";
import BackNav from "@/components/layout/BackNav";
import WorkHero from "@/components/works/WorkHero";
import WorkBody from "@/components/works/WorkBody";
import WorkPager from "@/components/works/WorkPager";
import SwipeNav from "@/components/works/SwipeNav";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const project = await getProject(slug);
  if (!project) notFound();

  const [blocks, allProjects] = await Promise.all([
    getProjectBlocks(project.id),
    getProjects(),
  ]);

  const idx = allProjects.findIndex((p) => p.id === project.id);
  const prev = idx > 0 ? allProjects[idx - 1] : null;
  const next = idx < allProjects.length - 1 ? allProjects[idx + 1] : null;

  return (
    <SwipeNav
      prevHref={prev ? `/works/${prev.slug}` : null}
      nextHref={next ? `/works/${next.slug}` : null}
    >
      <main>
        <BackNav trail="works" />
        <WorkHero project={project} />
        <WorkBody blocks={blocks} externalUrl={project.url} />
        <WorkPager prev={prev} next={next} />
      </main>
    </SwipeNav>
  );
}
