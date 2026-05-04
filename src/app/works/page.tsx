import { getProjects } from "@/lib/notion";
import BackNav from "@/components/layout/BackNav";
import ProjectsList from "@/components/home/ProjectsList";

export default async function WorksIndexPage() {
  const projects = await getProjects();

  return (
    <main>
      <BackNav trail="works" />
      <div className="mx-auto max-w-[1100px] px-6 py-16 md:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm">
          / works {String(projects.length).padStart(2, "0")}
        </p>
        <h1 className="mt-4 text-3xl font-light tracking-tight text-foreground-strong md:text-5xl">
          혼자 만든 것
        </h1>
        <p className="mt-4 max-w-[600px] text-base font-light text-foreground-soft md:text-lg">
          치료는 길고 공격적이었다. 마침 ai란 게 생겨나서 하나 하나 물어가며 필요한 것들을 만들었다.
        </p>
      </div>
      <ProjectsList projects={projects} />
    </main>
  );
}
