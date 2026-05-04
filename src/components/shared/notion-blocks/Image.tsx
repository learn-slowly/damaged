import Image from "next/image";
import { richText } from "./index";

export default function NotionImage({ block }: { block: any }) {
  const img = block.image;
  const url = img?.type === "external" ? img.external.url : img?.file?.url;
  if (!url) return null;
  const caption = img.caption ?? [];

  return (
    <figure className="my-10 -mx-6 md:mx-0">
      <div className="relative w-full overflow-hidden rounded-lg bg-card-bg">
        <Image
          src={url}
          alt={caption.map((c: any) => c.plain_text).join("") || ""}
          width={1280}
          height={720}
          className="h-auto w-full object-contain"
          sizes="(max-width: 768px) 100vw, 720px"
        />
      </div>
      {caption.length > 0 && (
        <figcaption className="mt-3 text-center text-xs font-light text-foreground-mute md:text-sm">
          {richText(caption)}
        </figcaption>
      )}
    </figure>
  );
}
