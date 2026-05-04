import Paragraph from "./Paragraph";
import Heading from "./Heading";
import NotionImage from "./Image";
import Quote from "./Quote";
import Code from "./Code";
import List from "./List";
import Embed from "./Embed";

export default function NotionBlocks({ blocks }: { blocks: any[] }) {
  // 인접한 같은 종류 list block은 하나의 List로 묶음
  const grouped: Array<{ type: string; items: any[] }> = [];
  for (const b of blocks) {
    const t = b.type;
    if (t === "bulleted_list_item" || t === "numbered_list_item") {
      const last = grouped[grouped.length - 1];
      if (last && last.type === t) {
        last.items.push(b);
        continue;
      }
      grouped.push({ type: t, items: [b] });
    } else {
      grouped.push({ type: t, items: [b] });
    }
  }

  return (
    <div className="prose-notion space-y-6 max-w-[680px]">
      {grouped.map((g, i) => {
        const b = g.items[0];
        switch (g.type) {
          case "paragraph":
            return <Paragraph key={i} block={b} />;
          case "heading_1":
          case "heading_2":
          case "heading_3":
            return <Heading key={i} block={b} />;
          case "image":
            return <NotionImage key={i} block={b} />;
          case "quote":
            return <Quote key={i} block={b} />;
          case "code":
            return <Code key={i} block={b} />;
          case "bulleted_list_item":
          case "numbered_list_item":
            return <List key={i} type={g.type} items={g.items} />;
          case "embed":
          case "video":
          case "bookmark":
            return <Embed key={i} block={b} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

export function richText(rt: any[]): React.ReactNode {
  if (!rt) return null;
  return rt.map((t: any, i: number) => {
    let node: React.ReactNode = t.plain_text;
    const ann = t.annotations ?? {};
    if (ann.code) node = <code className="rounded bg-card-bg px-1.5 py-0.5 font-mono text-[0.9em]">{node}</code>;
    if (ann.bold) node = <strong className="font-medium text-foreground-strong">{node}</strong>;
    if (ann.italic) node = <em>{node}</em>;
    if (ann.underline) node = <u>{node}</u>;
    if (ann.strikethrough) node = <s>{node}</s>;
    if (t.href) node = <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-accent underline-offset-4 hover:underline">{node}</a>;
    return <span key={i}>{node}</span>;
  });
}
