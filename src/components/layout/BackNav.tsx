import Link from "next/link";

export default function BackNav({ trail }: { trail?: string }) {
  return (
    <div className="sticky top-0 z-30 border-b border-card-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute hover:text-accent-amber md:text-sm">
          / damaged{trail ? ` / ${trail}` : ""}
        </Link>
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute hover:text-accent-amber md:text-sm">
          ← back
        </Link>
      </div>
    </div>
  );
}
