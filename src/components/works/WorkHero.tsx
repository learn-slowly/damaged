import Image from "next/image";
import { type NotionProject } from "@/lib/notion";
import BreathingType from "@/components/shared/BreathingType";

export default function WorkHero({ project }: { project: NotionProject }) {
  return (
    <header className="relative">
      {project.screenshot && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-card-bg md:aspect-[21/9]">
          <Image
            src={project.screenshot}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
        </div>
      )}

      <div className="mx-auto mt-12 max-w-[800px] px-6 md:mt-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-foreground-mute md:text-sm">
          / works
        </p>
        <h1 className="mt-4 text-3xl tracking-tight text-foreground-strong md:text-5xl">
          <BreathingType baseWeight={300} weightAmp={20}>{project.title}</BreathingType>
        </h1>

        <dl className="mt-8 grid grid-cols-1 gap-y-3 font-mono text-xs uppercase tracking-widest text-foreground-mute md:grid-cols-[80px_1fr] md:gap-y-2 md:text-sm">
          {project.role && (
            <>
              <dt>/ role</dt>
              <dd className="text-foreground-soft normal-case tracking-normal">{project.role}</dd>
            </>
          )}
          {project.period && (
            <>
              <dt>/ period</dt>
              <dd className="text-foreground-soft normal-case tracking-normal">{project.period}</dd>
            </>
          )}
          {project.tags?.length > 0 && (
            <>
              <dt>/ tags</dt>
              <dd className="flex flex-wrap gap-2 text-foreground-soft normal-case tracking-normal">
                {project.tags.map((t) => (
                  <span key={t} className="rounded border border-card-border px-2 py-0.5 text-xs">
                    {t}
                  </span>
                ))}
              </dd>
            </>
          )}
        </dl>

        {project.description && (
          <p className="mt-10 max-w-[680px] text-lg font-light leading-relaxed text-foreground md:text-xl">
            {project.description}
          </p>
        )}
      </div>
    </header>
  );
}
