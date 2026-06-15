"use client";

import React, { createContext, useContext } from "react";
import type { AppData } from "./types";
import { useLocalStorage } from "./useLocalStorage";

export const STORAGE_KEY = "velo-app-data";

export const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const item = (label: string) => ({ id: uid(), label });

export const DEFAULT_APP_DATA: AppData = {
  version: 1,
  bike: { name: "Мой велосипед", totalMileageKm: 0 },
  components: [],
  checklistTemplates: [
    {
      id: "tpl-short",
      name: "Короткая",
      items: [
        { id: "tpl-short-1", label: "Насос" },
        { id: "tpl-short-2", label: "Мультитул" },
        { id: "tpl-short-3", label: "Запасная камера" },
        { id: "tpl-short-4", label: "Телефон" },
      ],
    },
    {
      id: "tpl-long",
      name: "Долгая",
      items: [
        { id: "tpl-long-1", label: "Насос" },
        { id: "tpl-long-2", label: "Мультитул" },
        { id: "tpl-long-3", label: "Запасная камера" },
        { id: "tpl-long-4", label: "Аптечка" },
        { id: "tpl-long-5", label: "Телефон" },
        { id: "tpl-long-6", label: "Вода" },
        { id: "tpl-long-7", label: "Еда" },
      ],
    },
    {
      id: "tpl-rain",
      name: "Дождь",
      items: [
        { id: "tpl-rain-1", label: "Насос" },
        { id: "tpl-rain-2", label: "Мультитул" },
        { id: "tpl-rain-3", label: "Запасная камера" },
        { id: "tpl-rain-4", label: "Телефон" },
        { id: "tpl-rain-5", label: "Дождевик" },
      ],
    },
    {
      id: "tpl-night",
      name: "Ночь",
      items: [
        { id: "tpl-night-1", label: "Насос" },
        { id: "tpl-night-2", label: "Мультитул" },
        { id: "tpl-night-3", label: "Запасная камера" },
        { id: "tpl-night-4", label: "Телефон" },
        { id: "tpl-night-5", label: "Передний фонарь" },
        { id: "tpl-night-6", label: "Задний фонарь" },
      ],
    },
  ],
  budgetItems: [],
};

/** Merge a parsed (possibly partial / imported) payload onto the defaults. */
export function normalizeAppData(raw: unknown): AppData {
  if (!raw || typeof raw !== "object") return DEFAULT_APP_DATA;
  const r = raw as Partial<AppData>;
  return {
    version: 1,
    bike: {
      name: r.bike?.name ?? DEFAULT_APP_DATA.bike.name,
      totalMileageKm: Number(r.bike?.totalMileageKm) || 0,
    },
    components: Array.isArray(r.components) ? r.components : [],
    checklistTemplates: Array.isArray(r.checklistTemplates)
      ? r.checklistTemplates
      : DEFAULT_APP_DATA.checklistTemplates,
    budgetItems: Array.isArray(r.budgetItems) ? r.budgetItems : [],
  };
}

interface AppDataCtx {
  data: AppData;
  setData: (next: AppData | ((prev: AppData) => AppData)) => void;
  hydrated: boolean;
}

const Ctx = createContext<AppDataCtx | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData, hydrated] = useLocalStorage<AppData>(
    STORAGE_KEY,
    DEFAULT_APP_DATA,
  );
  return (
    <Ctx.Provider value={{ data, setData, hydrated }}>{children}</Ctx.Provider>
  );
}

export function useAppData(): AppDataCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppData must be used inside <AppDataProvider>");
  return ctx;
}
