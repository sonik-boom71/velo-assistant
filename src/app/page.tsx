"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/storage";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  LAST_NUTRITION_KEY,
  type NutritionSnapshot,
} from "@/lib/nutritionSnapshot";
import {
  wearPct,
  wearLevel,
  remainingKm,
  fmtInt,
  fmtKm,
  fmtDuration,
} from "@/lib/calc";
import { WearBar } from "@/components/WearBar";
import { DataIO } from "@/components/DataIO";
import { IconChevron } from "@/components/Icons";

export default function Dashboard() {
  const { data, setData } = useAppData();
  const total = data.bike.totalMileageKm;

  return (
    <div className="space-y-4">
      <MileagePanel
        name={data.bike.name}
        total={total}
        onAddKm={(km) =>
          setData((d) => ({
            ...d,
            bike: {
              ...d.bike,
              totalMileageKm: Math.max(0, d.bike.totalMileageKm + km),
            },
          }))
        }
        onSet={(name, mileage) =>
          setData((d) => ({
            ...d,
            bike: { name, totalMileageKm: Math.max(0, mileage) },
          }))
        }
      />

      <MaintenanceSummary />
      <ChecklistSummary />
      <NutritionSummary />
      <BudgetSummary />

      <section className="space-y-2 pt-2">
        <h2 className="label">Данные</h2>
        <DataIO />
        <p className="text-center text-[11px] text-asphalt-500">
          Всё хранится только в этом браузере. Экспортируйте для бэкапа.
        </p>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MileagePanel({
  name,
  total,
  onAddKm,
  onSet,
}: {
  name: string;
  total: number;
  onAddKm: (km: number) => void;
  onSet: (name: string, mileage: number) => void;
}) {
  const [add, setAdd] = useState("");
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftKm, setDraftKm] = useState(String(total));

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const km = Number(add);
    if (!km || km <= 0) return;
    onAddKm(km);
    setAdd("");
  };

  return (
    <section className="card overflow-hidden">
      <div className="relative h-48 w-full bg-asphalt-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bike.jpg"
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-asphalt-950 via-asphalt-950/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-asphalt-200">
              {name}
            </div>
            <div className="font-mono tnum text-4xl leading-none text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.85)]">
              {fmtKm(total)}
              <span className="text-lg text-asphalt-200"> км</span>
            </div>
          </div>
          <button
            onClick={() => {
              setDraftName(name);
              setDraftKm(String(total));
              setEditing((v) => !v);
            }}
            className="btn-line btn-sm border-asphalt-500 bg-asphalt-950/40 backdrop-blur"
          >
            {editing ? "Закрыть" : "Изменить"}
          </button>
        </div>
      </div>

      <div className="p-4">

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="label mb-1">Название велосипеда</label>
              <input
                className="field"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>
            <div>
              <label className="label mb-1">Текущий пробег, км</label>
              <input
                type="number"
                inputMode="numeric"
                className="field-num"
                value={draftKm}
                onChange={(e) => setDraftKm(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                onSet(draftName.trim() || "Мой велосипед", Number(draftKm) || 0);
                setEditing(false);
              }}
              className="btn-primary w-full"
            >
              Сохранить
            </button>
          </div>
        ) : (
          <form onSubmit={submitAdd} className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              className="field-num"
              placeholder="+ км за поездку"
              value={add}
              onChange={(e) => setAdd(e.target.value)}
            />
            <button type="submit" className="btn-primary shrink-0">
              Добавить
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function SummaryCard({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="card block p-4 transition-colors hover:border-asphalt-700">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="label">{title}</h2>
        <IconChevron
          width={16}
          height={16}
          className="-rotate-90 text-asphalt-500"
        />
      </div>
      {children}
    </Link>
  );
}

function MaintenanceSummary() {
  const { data } = useAppData();
  const total = data.bike.totalMileageKm;
  const top = [...data.components]
    .sort((a, b) => wearPct(b, total) - wearPct(a, total))
    .slice(0, 3);
  const attention = data.components.filter(
    (c) => wearLevel(wearPct(c, total)) !== "ok",
  ).length;

  return (
    <SummaryCard href="/maintenance" title="Журнал ТО">
      {data.components.length === 0 ? (
        <p className="text-sm text-asphalt-400">
          Нет компонентов — добавьте, чтобы следить за износом.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="font-mono tnum text-sm text-asphalt-300">
            <span
              className={attention > 0 ? "text-wear-warn" : "text-wear-ok"}
            >
              {attention}
            </span>{" "}
            из {data.components.length} требуют внимания
          </div>
          <ul className="space-y-2">
            {top.map((c) => {
              const pct = wearPct(c, total);
              const left = remainingKm(c, total);
              return (
                <li key={c.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-asphalt-200">{c.name}</span>
                    <span className="font-mono tnum text-asphalt-400">
                      {left >= 0
                        ? `${fmtKm(left)} км`
                        : `−${fmtKm(-left)} км`}
                    </span>
                  </div>
                  <WearBar pct={pct} segments={18} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </SummaryCard>
  );
}

function ChecklistSummary() {
  const { data } = useAppData();
  return (
    <SummaryCard href="/checklist" title="Чек-лист">
      <div className="flex flex-wrap gap-2">
        {data.checklistTemplates.map((t) => (
          <span
            key={t.id}
            className="rounded-sm border border-asphalt-700 px-2.5 py-1 text-xs text-asphalt-300"
          >
            {t.name}{" "}
            <span className="font-mono tnum text-asphalt-500">
              {t.items.length}
            </span>
          </span>
        ))}
        {data.checklistTemplates.length === 0 && (
          <span className="text-sm text-asphalt-400">Нет шаблонов</span>
        )}
      </div>
    </SummaryCard>
  );
}

function NutritionSummary() {
  const [last] = useLocalStorage<NutritionSnapshot | null>(
    LAST_NUTRITION_KEY,
    null,
  );
  return (
    <SummaryCard href="/nutrition" title="Питание и вода">
      {!last ? (
        <p className="text-sm text-asphalt-400">
          Рассчитайте воду и углеводы для поездки.
        </p>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono tnum text-sm text-asphalt-300">
              {fmtKm(last.distanceKm)} км · {fmtDuration(last.durationH)}
            </div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wide text-asphalt-500">
              последний расчёт
            </div>
          </div>
          <div className="text-right font-mono tnum text-sm">
            <div className="text-asphalt-100">
              {fmtInt(last.totalWaterMl)}{" "}
              <span className="text-asphalt-500">мл</span>
            </div>
            <div className="text-asphalt-100">
              {fmtInt(last.totalCarbsG)}{" "}
              <span className="text-asphalt-500">г</span>
            </div>
          </div>
        </div>
      )}
    </SummaryCard>
  );
}

function BudgetSummary() {
  const { data } = useAppData();
  let spent = 0,
    wishlist = 0;
  for (const b of data.budgetItems) {
    if (b.status === "installed") spent += b.priceUah;
    else if (b.status === "wishlist") wishlist += b.priceUah;
  }
  return (
    <SummaryCard href="/budget" title="Бюджет">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="font-mono tnum text-lg text-asphalt-100">
            {fmtInt(spent)} <span className="text-sm text-asphalt-500">₴</span>
          </div>
          <div className="text-[10px] uppercase tracking-wide text-asphalt-400">
            потрачено
          </div>
        </div>
        <div>
          <div className="font-mono tnum text-lg text-lime">
            {fmtInt(wishlist)} <span className="text-sm text-lime/60">₴</span>
          </div>
          <div className="text-[10px] uppercase tracking-wide text-asphalt-400">
            вишлист
          </div>
        </div>
      </div>
    </SummaryCard>
  );
}
