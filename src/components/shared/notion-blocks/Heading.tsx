import { richText } from "./index";

export default function Heading({ block }: { block: any }) {
  const level = block.type as "heading_1" | "heading_2" | "heading_3";
  const rt = block[level]?.rich_text ?? [];
  const cls = {
    heading_1: "text-2xl font-light text-foreground-strong md:text-3xl",
    heading_2: "text-xl font-light text-foreground-strong md:text-2xl",
    heading_3: "text-lg font-light text-foreground-strong md:text-xl",
  }[level];
  const Tag = ({ heading_1: "h2", heading_2: "h3", heading_3: "h4" } as const)[level];
  return <Tag className={`${cls} mt-12 mb-4 tracking-tight`}>{richText(rt)}</Tag>;
}
