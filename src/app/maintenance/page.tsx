"use client";

import { useState } from "react";
import { useAppData, uid } from "@/lib/storage";
import type { MaintenanceComponent } from "@/lib/types";
import {
  wearKm,
  wearPct,
  wearLevel,
  remainingKm,
  presetInterval,
  COMPONENT_SUGGESTIONS,
  fmtKm,
  fmtInt,
  fmtDate,
} from "@/lib/calc";
import { WearBar } from "@/components/WearBar";
import { IconPlus, IconX, IconHistory, IconChevron } from "@/components/Icons";

const LEVEL_CHIP: Record<string, string> = {
  ok: "bg-wear-ok/15 text-wear-ok",
  warn: "bg-wear-warn/15 text-wear-warn",
  over: "bg-wear-over/15 text-wear-over",
};
const LEVEL_LABEL: Record<string, string> = {
  ok: "В норме",
  warn: "Скоро",
  over: "Замена",
};

export default function MaintenancePage() {
  const { data, setData } = useAppData();
  const total = data.bike.totalMileageKm;
  const [adding, setAdding] = useState(false);

  const replace = (id: string) => {
    const c = data.components.find((x) => x.id === id);
    if (!c) return;
    if (!confirm(`Отметить «${c.name}» как заменённое?`)) return;
    const now = new Date().toISOString();
    setData((d) => ({
      ...d,
      components: d.components.map((x) =>
        x.id !== id
          ? x
          : {
              ...x,
              history: [
                ...x.history,
                {
                  replacedAtKm: d.bike.totalMileageKm,
                  date: now,
                  lifespanKm: Math.max(0, d.bike.totalMileageKm - x.installedAtKm),
                },
              ],
              installedAtKm: d.bike.totalMileageKm,
              installedAt: now,
            },
      ),
    }));
  };

  const setInterval = (id: string, km: number) =>
    setData((d) => ({
      ...d,
      components: d.components.map((x) =>
        x.id === id ? { ...x, intervalKm: km } : x,
      ),
    }));

  const remove = (id: string) => {
    if (!confirm("Удалить компонент со всей историей?")) return;
    setData((d) => ({
      ...d,
      components: d.components.filter((x) => x.id !== id),
    }));
  };

  const sorted = [...data.components].sort(
    (a, b) => wearPct(b, total) - wearPct(a, total),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-asphalt-100">Журнал ТО</h1>
        <button
          onClick={() => setAdding((v) => !v)}
          className="btn-primary btn-sm"
        >
          <IconPlus width={15} height={15} /> Компонент
        </button>
      </div>

      {adding && (
        <AddForm
          total={total}
          onAdd={(c) => {
            setData((d) => ({ ...d, components: [...d.components, c] }));
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {sorted.length === 0 ? (
        <div className="card p-6 text-center text-sm text-asphalt-400">
          Пока нет компонентов. Добавьте цепь, колодки или покрышки, чтобы
          отслеживать износ.
        </div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((c) => (
            <ComponentCard
              key={c.id}
              c={c}
              total={total}
              onReplace={() => replace(c.id)}
              onSetInterval={(km) => setInterval(c.id, km)}
              onRemove={() => remove(c.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ComponentCard({
  c,
  total,
  onReplace,
  onSetInterval,
  onRemove,
}: {
  c: MaintenanceComponent;
  total: number;
  onReplace: () => void;
  onSetInterval: (km: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pct = wearPct(c, total);
  const level = wearLevel(pct);
  const used = wearKm(c, total);
  const left = remainingKm(c, total);

  return (
    <li className="card overflow-hidden">
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[15px] font-medium text-asphalt-100">
            {c.name}
          </span>
          <span className={`chip ${LEVEL_CHIP[level]}`}>
            {LEVEL_LABEL[level]}
          </span>
        </div>

        <WearBar pct={pct} />

        <div className="flex items-end justify-between">
          <div className="font-mono tnum text-sm text-asphalt-300">
            <span className="text-asphalt-100">{fmtKm(used)}</span>
            <span className="text-asphalt-500"> / {fmtKm(c.intervalKm)} км</span>
          </div>
          <div className="font-mono tnum text-lg leading-none text-asphalt-100">
            {Math.round(pct * 100)}
            <span className="text-asphalt-500">%</span>
          </div>
        </div>

        <div className="font-mono tnum text-xs text-asphalt-400">
          {left >= 0
            ? `осталось ${fmtKm(left)} км`
            : `просрочено на ${fmtKm(-left)} км`}
        </div>

        <div className="flex gap-2">
          <button onClick={onReplace} className="btn-primary btn-sm flex-1">
            Заменено
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn-line btn-sm"
          >
            <IconHistory width={15} height={15} />
            История ({c.history.length})
            <IconChevron
              width={14}
              height={14}
              className={open ? "rotate-180 transition-transform" : "transition-transform"}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-asphalt-800 bg-asphalt-900/40 p-4">
          <div>
            <label className="label mb-1">Интервал замены, км</label>
            <input
              type="number"
              inputMode="numeric"
              className="field-num"
              value={c.intervalKm}
              min={1}
              onChange={(e) =>
                onSetInterval(Math.max(1, Number(e.target.value) || 1))
              }
            />
          </div>

          <div>
            <label className="label mb-2">История замен</label>
            {c.history.length === 0 ? (
              <p className="text-xs text-asphalt-500">
                Установлено {fmtDate(c.installedAt)} на {fmtKm(c.installedAtKm)}{" "}
                км. Замен пока не было.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {c.history.map((h, i) => {
                  const span =
                    h.lifespanKm ??
                    (i > 0
                      ? h.replacedAtKm - c.history[i - 1].replacedAtKm
                      : undefined);
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-sm bg-asphalt-850 px-3 py-2 text-xs"
                    >
                      <span className="text-asphalt-300">{fmtDate(h.date)}</span>
                      <span className="font-mono tnum text-asphalt-400">
                        {span !== undefined ? `прошло ${fmtInt(span)} км` : "—"}
                        <span className="text-asphalt-600">
                          {" "}
                          @ {fmtKm(h.replacedAtKm)} км
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button onClick={onRemove} className="btn-danger btn-sm w-full">
            <IconX width={15} height={15} /> Удалить компонент
          </button>
        </div>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */

function AddForm({
  total,
  onAdd,
  onCancel,
}: {
  total: number;
  onAdd: (c: MaintenanceComponent) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [installedAtKm, setInstalledAtKm] = useState(String(total));
  const [intervalKm, setIntervalKm] = useState("3000");
  const [intervalTouched, setIntervalTouched] = useState(false);

  const onNameChange = (v: string) => {
    setName(v);
    if (!intervalTouched) setIntervalKm(String(presetInterval(v)));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: uid(),
      name: name.trim(),
      installedAtKm: Math.max(0, Number(installedAtKm) || 0),
      intervalKm: Math.max(1, Number(intervalKm) || 1),
      installedAt: new Date().toISOString(),
      history: [],
    });
  };

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <div>
        <label className="label mb-1">Название</label>
        <input
          className="field"
          list="component-suggestions"
          placeholder="Цепь, колодки, покрышка…"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
        />
        <datalist id="component-suggestions">
          {COMPONENT_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label mb-1">Установлено на, км</label>
          <input
            type="number"
            inputMode="numeric"
            className="field-num"
            value={installedAtKm}
            onChange={(e) => setInstalledAtKm(e.target.value)}
          />
        </div>
        <div>
          <label className="label mb-1">Интервал, км</label>
          <input
            type="number"
            inputMode="numeric"
            className="field-num"
            value={intervalKm}
            onChange={(e) => {
              setIntervalTouched(true);
              setIntervalKm(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">
          Сохранить
        </button>
        <button type="button" onClick={onCancel} className="btn-line">
          Отмена
        </button>
      </div>
    </form>
  );
}
