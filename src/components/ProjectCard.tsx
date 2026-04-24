"use client";

import { type Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const Wrapper = project.url ? "a" : "div";
  const linkProps = project.url
    ? { href: project.url, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className="group block overflow-hidden rounded-lg border border-card-border bg-card-bg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20"
    >
      <div className="aspect-video w-full bg-[#111] overflow-hidden">
        <img
          src={project.screenshot}
          alt={project.title}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <h3 className="text-base font-medium text-foreground-strong">
          {project.title}
        </h3>
        <p className="mt-1 text-sm font-light text-foreground">
          {project.description}
        </p>
        {project.url && (
          <p className="mt-2 text-xs text-accent group-hover:underline">
            {project.url.replace(/^https?:\/\//, "")}
          </p>
        )}
      </div>
    </Wrapper>
  );
}
