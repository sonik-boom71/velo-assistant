import type { MaintenanceComponent } from "./types";

/* ------------------------------------------------------------------ */
/* Maintenance                                                         */
/* ------------------------------------------------------------------ */

export type WearLevel = "ok" | "warn" | "over";

export function wearKm(c: MaintenanceComponent, totalKm: number): number {
  return Math.max(0, totalKm - c.installedAtKm);
}

export function wearPct(c: MaintenanceComponent, totalKm: number): number {
  if (c.intervalKm <= 0) return 0;
  return wearKm(c, totalKm) / c.intervalKm;
}

/** km left until the interval is reached (negative = overdue) */
export function remainingKm(c: MaintenanceComponent, totalKm: number): number {
  return c.installedAtKm + c.intervalKm - totalKm;
}

// green <70%, yellow 70–100%, red >100%
export function wearLevel(pct: number): WearLevel {
  if (pct > 1) return "over";
  if (pct >= 0.7) return "warn";
  return "ok";
}

/** Suggested replacement interval (km) from a component name. */
export function presetInterval(name: string): number {
  const n = name.toLowerCase();
  if (/цеп/.test(n)) return 3000;
  if (/кассет/.test(n)) return 9000;
  if (/колод/.test(n)) return 1500;
  if (/тормоз/.test(n)) return 1500;
  if (/покрыш|шина|резин/.test(n)) return 4000;
  if (/трос/.test(n)) return 6000;
  if (/лент|обмотк/.test(n)) return 5000;
  if (/цеп|звезд/.test(n)) return 3000;
  return 3000;
}

export const COMPONENT_SUGGESTIONS = [
  "Цепь",
  "Кассета",
  "Колодки передние",
  "Колодки задние",
  "Покрышка передняя",
  "Покрышка задняя",
  "Тросики",
  "Лента руля",
];

/* ------------------------------------------------------------------ */
/* Nutrition & water                                                   */
/* ------------------------------------------------------------------ */

export type Intensity = "low" | "medium" | "high";

export interface NutritionInput {
  distanceKm: number;
  speedKmh: number;
  tempC: number;
  intensity: Intensity;
}

export interface NutritionResult {
  durationH: number;
  waterPerH: number; // ml/h
  carbsPerH: number; // g/h
  totalWaterMl: number;
  totalCarbsG: number;
  drinkIntervalMin: number;
  drinkPerIntervalMl: number;
  foodEveryKm: number;
  foodItems: number;
}

const CARBS_PER_H: Record<Intensity, number> = { low: 30, medium: 60, high: 90 };
const GEL_CARBS_G = 25; // typical gel / bar serving
const DRINK_INTERVAL_MIN = 15;

export function computeNutrition(i: NutritionInput): NutritionResult | null {
  if (i.distanceKm <= 0 || i.speedKmh <= 0) return null;

  const durationH = i.distanceKm / i.speedKmh;
  const waterPerH = 500 + 150 * Math.max(0, (i.tempC - 20) / 5);
  const carbsPerH = CARBS_PER_H[i.intensity];

  const totalWaterMl = waterPerH * durationH;
  const totalCarbsG = carbsPerH * durationH;

  const drinkPerIntervalMl = waterPerH * (DRINK_INTERVAL_MIN / 60);
  const foodItems = totalCarbsG / GEL_CARBS_G;
  const foodEveryKm = foodItems > 0 ? i.distanceKm / foodItems : 0;

  return {
    durationH,
    waterPerH,
    carbsPerH,
    totalWaterMl,
    totalCarbsG,
    drinkIntervalMin: DRINK_INTERVAL_MIN,
    drinkPerIntervalMl,
    foodEveryKm,
    foodItems,
  };
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export const fmtInt = (n: number): string =>
  Math.round(n).toLocaleString("ru-RU");

export function fmtKm(n: number): string {
  return fmtInt(n);
}

export function fmtDuration(hours: number): string {
  const total = Math.round(hours * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m} мин`;
  return `${h} ч ${m.toString().padStart(2, "0")} мин`;
}

export function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
