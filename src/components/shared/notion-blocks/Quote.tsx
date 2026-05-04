import { richText } from "./index";

export default function Quote({ block }: { block: any }) {
  const rt = block.quote?.rich_text ?? [];
  return (
    <blockquote className="my-10 border-l-2 border-accent-amber pl-6 text-base font-light italic leading-[1.85] text-foreground-soft md:text-lg">
      {richText(rt)}
    </blockquote>
  );
}
