"use client";

import { useMagnetic } from "@/hooks/useMagnetic";

export default function MagneticHover({
  children,
  strength = 6,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useMagnetic<HTMLDivElement>(strength);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
