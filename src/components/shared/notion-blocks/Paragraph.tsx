import { richText } from "./index";

export default function Paragraph({ block }: { block: any }) {
  const rt = block.paragraph?.rich_text ?? [];
  if (rt.length === 0) return <p className="h-4" aria-hidden="true" />;
  return (
    <p className="text-base font-light leading-[1.85] text-foreground md:text-lg">
      {richText(rt)}
    </p>
  );
}
