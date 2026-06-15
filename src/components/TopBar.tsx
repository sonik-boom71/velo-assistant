"use client";

import { useAppData } from "@/lib/storage";
import { fmtKm } from "@/lib/calc";

export function TopBar() {
  const { data } = useAppData();
  return (
    <header className="sticky top-0 z-20 border-b border-asphalt-800 bg-asphalt-950/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-lime">
            Велоассистент
          </div>
          <div className="truncate text-sm text-asphalt-200">
            {data.bike.name}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono tnum text-xl leading-none text-asphalt-100">
            {fmtKm(data.bike.totalMileageKm)}
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-asphalt-400">
            км пробег
          </div>
        </div>
      </div>
    </header>
  );
}
