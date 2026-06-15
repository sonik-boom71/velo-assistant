// The calculator itself is stateless, but the dashboard shows the last result.
// We keep just a small snapshot under its own key, separate from AppData.

export const LAST_NUTRITION_KEY = "velo-last-nutrition";

export interface NutritionSnapshot {
  distanceKm: number;
  durationH: number;
  totalWaterMl: number;
  totalCarbsG: number;
  at: string; // ISO
}
