import NotionBlocks from "@/components/shared/notion-blocks";

export default function WorkBody({ blocks, externalUrl }: { blocks: any[]; externalUrl?: string }) {
  if (blocks.length === 0 && !externalUrl) return null;

  return (
    <article className="mx-auto mt-16 max-w-[800px] px-6 md:mt-24">
      {blocks.length > 0 && <NotionBlocks blocks={blocks} />}

      {externalUrl && (
        <div className="mt-16 border-t border-card-border pt-10">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm">
            / live site
          </p>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-block text-xl font-light tracking-tight text-foreground-strong hover:text-accent-amber md:text-2xl"
          >
            {externalUrl.replace(/^https?:\/\//, "")}
            <span className="ml-2 font-mono text-base text-accent-amber transition-transform group-hover:translate-x-1 inline-block">→</span>
          </a>
        </div>
      )}
    </article>
  );
}
