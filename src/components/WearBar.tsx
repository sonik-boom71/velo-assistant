import { wearLevel } from "@/lib/calc";

const FILL: Record<string, string> = {
  ok: "bg-wear-ok",
  warn: "bg-wear-warn",
  over: "bg-wear-over",
};

/**
 * The signal element: a segmented wear scale, like a chain/cassette wear
 * gauge. Fills left → right, colour green → yellow → red by overall wear.
 */
export function WearBar({
  pct,
  segments = 24,
}: {
  pct: number;
  segments?: number;
}) {
  const level = wearLevel(pct);
  const color = FILL[level];
  const filled =
    pct > 1 ? segments : Math.round(Math.min(Math.max(pct, 0), 1) * segments);

  return (
    <div className="flex h-2.5 w-full gap-[2px]" aria-hidden>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 rounded-[1px] ${i < filled ? color : "bg-asphalt-700"}`}
        />
      ))}
    </div>
  );
}
