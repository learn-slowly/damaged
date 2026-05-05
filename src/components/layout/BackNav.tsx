"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BackNav({ trail }: { trail?: string }) {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="sticky top-0 z-30 border-b border-card-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute hover:text-accent-amber md:text-sm">
          / damaged{trail ? ` / ${trail}` : ""}
        </Link>
        <button
          type="button"
          onClick={goBack}
          className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute hover:text-accent-amber md:text-sm cursor-pointer"
        >
          ← back
        </button>
      </div>
    </div>
  );
}
