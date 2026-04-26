import Hero from "@/components/Hero";
import Story from "@/components/Story";
import Projects from "@/components/Projects";
import Together from "@/components/Together";
import Photos from "@/components/Photos";
import Closing from "@/components/Closing";
import { getProjects, getPhotos } from "@/lib/notion";

export const revalidate = 3600;

export default async function Home() {
  const [projects, photoChapters] = await Promise.all([getProjects(), getPhotos()]);

  return (
    <main>
      <Hero />
      <Story />
      <Projects projects={projects} />
      <Together />
      <Photos chapters={photoChapters} />
      <Closing />
    </main>
  );
}
