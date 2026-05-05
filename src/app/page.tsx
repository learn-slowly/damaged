import Hero from "@/components/home/Hero";
import Story from "@/components/home/Story";
import Together from "@/components/home/Together";
import ProjectsList from "@/components/home/ProjectsList";
import PhotosTeaser from "@/components/home/PhotosTeaser";
import Closing from "@/components/home/Closing";
import { getProjects, getPhotos } from "@/lib/notion";

export default async function Home() {
  const [projects, chapters] = await Promise.all([getProjects(), getPhotos()]);

  return (
    <main>
      <Hero />
      <Story />
      <ProjectsList projects={projects} />
      <Together />
      <PhotosTeaser chapters={chapters} />
      <Closing />
    </main>
  );
}
