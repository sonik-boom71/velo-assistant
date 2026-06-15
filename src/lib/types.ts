// Single source of truth for the whole app, persisted as one JSON object
// under localStorage key `velo-app-data`.

export interface AppData {
  version: 1;
  bike: Bike;
  components: MaintenanceComponent[];
  checklistTemplates: ChecklistTemplate[];
  budgetItems: BudgetItem[];
}

export interface Bike {
  name: string;
  /** updated by hand or via the "+N км" form on the dashboard */
  totalMileageKm: number;
}

export interface ReplacementRecord {
  /** bike mileage at the moment of replacement */
  replacedAtKm: number;
  date: string; // ISO
  /** km the just-retired part lasted; optional so old data still parses */
  lifespanKm?: number;
}

export interface MaintenanceComponent {
  id: string;
  name: string; // "Цепь", "Колодки передние", свой вариант
  installedAtKm: number; // bike mileage when this cycle was installed
  intervalKm: number; // recommended replacement interval
  installedAt: string; // ISO date of the current cycle
  history: ReplacementRecord[];
}

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string; // "Короткая", "Долгая", "Дождь", "Ночь"
  items: ChecklistItem[];
}

export type BudgetStatus = "installed" | "wishlist" | "considering";

export interface BudgetItem {
  id: string;
  name: string;
  category: string; // "Трансмиссия", "Колёса", "Тормоза", ...
  priceUah: number;
  date?: string; // purchase date when installed
  status: BudgetStatus;
}
