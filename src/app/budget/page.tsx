"use client";

import { useMemo, useState } from "react";
import { useAppData, uid } from "@/lib/storage";
import type { BudgetItem, BudgetStatus } from "@/lib/types";
import { fmtInt, fmtDate } from "@/lib/calc";
import { IconPlus, IconX } from "@/components/Icons";

const CATEGORIES = [
  "Трансмиссия",
  "Колёса",
  "Тормоза",
  "Аксессуары",
  "Одежда",
  "Инструменты",
];

const STATUS_LABEL: Record<BudgetStatus, string> = {
  installed: "Установлено",
  wishlist: "В вишлисте",
  considering: "Рассматриваю",
};
const STATUS_CHIP: Record<BudgetStatus, string> = {
  installed: "bg-lime/15 text-lime",
  wishlist: "bg-asphalt-700 text-asphalt-200",
  considering: "bg-asphalt-800 text-asphalt-400",
};

type SortKey = "price-desc" | "price-asc" | "name" | "date";

export default function BudgetPage() {
  const { data, setData } = useAppData();
  const [adding, setAdding] = useState(false);
  const [catFilter, setCatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("price-desc");

  const totals = useMemo(() => {
    let spent = 0,
      wishlist = 0,
      considering = 0;
    for (const b of data.budgetItems) {
      if (b.status === "installed") spent += b.priceUah;
      else if (b.status === "wishlist") wishlist += b.priceUah;
      else considering += b.priceUah;
    }
    return { spent, wishlist, considering };
  }, [data.budgetItems]);

  const visible = useMemo(() => {
    let list = data.budgetItems.filter(
      (b) =>
        (catFilter === "all" || b.category === catFilter) &&
        (statusFilter === "all" || b.status === statusFilter),
    );
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.priceUah - b.priceUah;
        case "name":
          return a.name.localeCompare(b.name, "ru");
        case "date":
          return (b.date ?? "").localeCompare(a.date ?? "");
        case "price-desc":
        default:
          return b.priceUah - a.priceUah;
      }
    });
    return list;
  }, [data.budgetItems, catFilter, statusFilter, sort]);

  const setStatus = (id: string, status: BudgetStatus) =>
    setData((d) => ({
      ...d,
      budgetItems: d.budgetItems.map((b) =>
        b.id !== id
          ? b
          : {
              ...b,
              status,
              date:
                status === "installed"
                  ? b.date ?? new Date().toISOString()
                  : b.date,
            },
      ),
    }));

  const remove = (id: string) =>
    setData((d) => ({
      ...d,
      budgetItems: d.budgetItems.filter((b) => b.id !== id),
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-asphalt-100">Бюджет</h1>
        <button
          onClick={() => setAdding((v) => !v)}
          className="btn-primary btn-sm"
        >
          <IconPlus width={15} height={15} /> Позиция
        </button>
      </div>

      {/* summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3">
          <div className="font-mono tnum text-xl text-asphalt-100">
            {fmtInt(totals.spent)}
            <span className="text-sm text-asphalt-500"> ₴</span>
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.1em] text-asphalt-400">
            Всего потрачено
          </div>
        </div>
        <div className="card p-3">
          <div className="font-mono tnum text-xl text-lime">
            {fmtInt(totals.wishlist)}
            <span className="text-sm text-lime/60"> ₴</span>
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.1em] text-asphalt-400">
            Вишлист на сумму
          </div>
        </div>
      </div>

      {adding && (
        <AddForm
          onAdd={(b) => {
            setData((d) => ({ ...d, budgetItems: [...d.budgetItems, b] }));
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* filters */}
      <div className="grid grid-cols-3 gap-2">
        <Select value={catFilter} onChange={setCatFilter}>
          <option value="all">Все категории</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={setStatusFilter}>
          <option value="all">Все статусы</option>
          <option value="installed">Установлено</option>
          <option value="wishlist">В вишлисте</option>
          <option value="considering">Рассматриваю</option>
        </Select>
        <Select value={sort} onChange={(v) => setSort(v as SortKey)}>
          <option value="price-desc">Цена ↓</option>
          <option value="price-asc">Цена ↑</option>
          <option value="name">Название</option>
          <option value="date">Дата</option>
        </Select>
      </div>

      {visible.length === 0 ? (
        <div className="card p-6 text-center text-sm text-asphalt-400">
          {data.budgetItems.length === 0
            ? "Пока нет позиций. Добавьте апгрейд или покупку."
            : "Ничего не найдено по фильтрам."}
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((b) => (
            <li key={b.id} className="card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[15px] text-asphalt-100">
                    {b.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-asphalt-400">
                    <span>{b.category}</span>
                    {b.date && (
                      <span className="font-mono tnum text-asphalt-500">
                        {fmtDate(b.date)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono tnum text-asphalt-100">
                    {fmtInt(b.priceUah)}{" "}
                    <span className="text-asphalt-500">₴</span>
                  </div>
                  <span className={`chip mt-1 ${STATUS_CHIP[b.status]}`}>
                    {STATUS_LABEL[b.status]}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                {b.status !== "installed" && (
                  <button
                    onClick={() => setStatus(b.id, "installed")}
                    className="btn-primary btn-sm flex-1"
                  >
                    Куплено
                  </button>
                )}
                <Select
                  value={b.status}
                  onChange={(v) => setStatus(b.id, v as BudgetStatus)}
                  className="flex-1"
                >
                  <option value="installed">Установлено</option>
                  <option value="wishlist">В вишлисте</option>
                  <option value="considering">Рассматриваю</option>
                </Select>
                <button
                  onClick={() => remove(b.id)}
                  className="btn-line btn-sm shrink-0 px-2"
                  aria-label="Удалить"
                >
                  <IconX width={16} height={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Select({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`field appearance-none bg-asphalt-900 px-2 py-2 text-sm ${className}`}
    >
      {children}
    </select>
  );
}

function AddForm({
  onAdd,
  onCancel,
}: {
  onAdd: (b: BudgetItem) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<BudgetStatus>("wishlist");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: uid(),
      name: name.trim(),
      category,
      priceUah: Math.max(0, Number(price) || 0),
      status,
      date: status === "installed" ? new Date().toISOString() : undefined,
    });
  };

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <div>
        <label className="label mb-1">Название</label>
        <input
          className="field"
          placeholder="Что покупаем"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label mb-1">Категория</label>
          <Select value={category} onChange={setCategory}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="label mb-1">Цена, ₴</label>
          <input
            type="number"
            inputMode="numeric"
            className="field-num"
            placeholder="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label mb-1">Статус</label>
        <Select value={status} onChange={(v) => setStatus(v as BudgetStatus)}>
          <option value="wishlist">В вишлисте</option>
          <option value="considering">Рассматриваю</option>
          <option value="installed">Установлено</option>
        </Select>
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
