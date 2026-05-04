import { richText } from "./index";

export default function List({ type, items }: { type: string; items: any[] }) {
  const Tag = type === "numbered_list_item" ? "ol" : "ul";
  const cls =
    type === "numbered_list_item"
      ? "list-decimal pl-6 space-y-2 text-base font-light leading-[1.85] text-foreground md:text-lg marker:text-foreground-mute"
      : "list-disc pl-6 space-y-2 text-base font-light leading-[1.85] text-foreground md:text-lg marker:text-foreground-mute";

  return (
    <Tag className={cls}>
      {items.map((b, i) => {
        const rt = b[type]?.rich_text ?? [];
        return <li key={i}>{richText(rt)}</li>;
      })}
    </Tag>
  );
}
