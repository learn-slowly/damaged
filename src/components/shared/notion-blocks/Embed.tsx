export default function Embed({ block }: { block: any }) {
  const url =
    block.embed?.url ?? block.video?.external?.url ?? block.bookmark?.url ?? "";
  if (!url) return null;

  // YouTube embed
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) {
    return (
      <div className="my-10 aspect-video w-full overflow-hidden rounded-lg bg-card-bg">
        <iframe
          src={`https://www.youtube.com/embed/${yt[1]}`}
          title="YouTube video"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // bookmark / 일반 링크
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-10 block rounded-lg border border-card-border bg-card-bg p-4 text-sm text-accent transition-colors hover:border-accent-amber"
    >
      / {url.replace(/^https?:\/\//, "")}
    </a>
  );
}
