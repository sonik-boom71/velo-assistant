"use client";

import { useEffect, useState } from "react";
import {
  computeNutrition,
  fmtDuration,
  fmtInt,
  type Intensity,
} from "@/lib/calc";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  LAST_NUTRITION_KEY,
  type NutritionSnapshot,
} from "@/lib/nutritionSnapshot";

const INTENSITIES: { value: Intensity; label: string; hint: string }[] = [
  { value: "low", label: "Низкая", hint: "30 г/ч" },
  { value: "medium", label: "Средняя", hint: "60 г/ч" },
  { value: "high", label: "Высокая", hint: "90 г/ч" },
];

export default function NutritionPage() {
  const [distance, setDistance] = useState("50");
  const [speed, setSpeed] = useState("25");
  const [temp, setTemp] = useState("22");
  const [intensity, setIntensity] = useState<Intensity>("medium");

  const [, setLast] = useLocalStorage<NutritionSnapshot | null>(
    LAST_NUTRITION_KEY,
    null,
  );

  const result = computeNutrition({
    distanceKm: Number(distance) || 0,
    speedKmh: Number(speed) || 0,
    tempC: Number(temp) || 0,
    intensity,
  });

  // remember the last valid calculation for the dashboard
  useEffect(() => {
    if (!result) return;
    setLast({
      distanceKm: Number(distance) || 0,
      durationH: result.durationH,
      totalWaterMl: result.totalWaterMl,
      totalCarbsG: result.totalCarbsG,
      at: new Date().toISOString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distance, speed, temp, intensity]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-asphalt-100">Питание и вода</h1>

      <div className="card space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <NumField
            label="Дистанция, км"
            value={distance}
            onChange={setDistance}
          />
          <NumField
            label="Скорость, км/ч"
            value={speed}
            onChange={setSpeed}
          />
        </div>
        <NumField
          label="Температура, °C"
          value={temp}
          onChange={setTemp}
          allowNegative
        />

        <div>
          <span className="label mb-2">Интенсивность</span>
          <div className="grid grid-cols-3 gap-2">
            {INTENSITIES.map((it) => (
              <button
                key={it.value}
                onClick={() => setIntensity(it.value)}
                className={`flex flex-col items-center rounded-sm border px-2 py-2 transition-colors ${
                  intensity === it.value
                    ? "border-lime text-lime"
                    : "border-asphalt-700 text-asphalt-300 hover:border-asphalt-500"
                }`}
              >
                <span className="text-sm font-medium">{it.label}</span>
                <span className="font-mono tnum text-[10px] text-asphalt-500">
                  {it.hint}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {!result ? (
        <p className="text-sm text-asphalt-400">
          Укажите дистанцию и скорость больше нуля.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat
              big={fmtDuration(result.durationH)}
              label="в пути"
            />
            <Stat
              big={fmtInt(result.totalWaterMl)}
              unit="мл"
              label="вода всего"
            />
            <Stat
              big={fmtInt(result.totalCarbsG)}
              unit="г"
              label="углеводы"
            />
          </div>

          <div className="card divide-y divide-asphalt-800">
            <Rec
              title="Пить"
              body={`каждые ${result.drinkIntervalMin} мин по ${fmtInt(
                result.drinkPerIntervalMl,
              )} мл`}
              sub={`${fmtInt(result.waterPerH)} мл/ч`}
            />
            <Rec
              title="Гель / батончик"
              body={
                result.foodEveryKm > 0
                  ? `каждые ${fmtInt(result.foodEveryKm)} км (~25 г углеводов)`
                  : "не требуется"
              }
              sub={`${fmtInt(result.carbsPerH)} г/ч · всего ≈ ${Math.ceil(
                result.foodItems,
              )} шт`}
            />
          </div>

          <p className="text-center text-[11px] text-asphalt-500">
            Расчёт не сохраняется — это справочный калькулятор.
          </p>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function NumField({
  label,
  value,
  onChange,
  allowNegative,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allowNegative?: boolean;
}) {
  return (
    <div>
      <label className="label mb-1">{label}</label>
      <input
        type="number"
        inputMode={allowNegative ? "text" : "decimal"}
        className="field-num"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Stat({
  big,
  unit,
  label,
}: {
  big: string;
  unit?: string;
  label: string;
}) {
  return (
    <div className="card p-3 text-center">
      <div className="font-mono tnum text-xl leading-tight text-asphalt-100">
        {big}
        {unit && <span className="text-sm text-asphalt-500"> {unit}</span>}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.1em] text-asphalt-400">
        {label}
      </div>
    </div>
  );
}

function Rec({
  title,
  body,
  sub,
}: {
  title: string;
  body: string;
  sub: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div>
        <div className="text-[11px] uppercase tracking-[0.1em] text-lime">
          {title}
        </div>
        <div className="text-asphalt-100">{body}</div>
      </div>
      <div className="shrink-0 font-mono tnum text-right text-xs text-asphalt-400">
        {sub}
      </div>
    </div>
  );
}
