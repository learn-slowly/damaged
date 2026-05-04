import { richText } from "./index";

export default function Code({ block }: { block: any }) {
  const rt = block.code?.rich_text ?? [];
  const language = block.code?.language ?? "";
  return (
    <pre className="my-8 overflow-x-auto rounded-lg border border-card-border bg-card-bg p-4 font-mono text-sm text-foreground-soft">
      {language && (
        <div className="mb-2 text-xs uppercase tracking-widest text-foreground-mute">
          / {language}
        </div>
      )}
      <code>{richText(rt)}</code>
    </pre>
  );
}
