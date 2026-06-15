"use client";

import { useMemo, useState } from "react";
import { useAppData, uid } from "@/lib/storage";
import type { ChecklistTemplate } from "@/lib/types";
import { IconPlus, IconX } from "@/components/Icons";

type Mode = "run" | "edit";

export default function ChecklistPage() {
  const { data, setData } = useAppData();
  const templates = data.checklistTemplates;

  const [mode, setMode] = useState<Mode>("run");
  const [selectedId, setSelectedId] = useState<string>(
    templates[0]?.id ?? "",
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const selected = useMemo<ChecklistTemplate | undefined>(
    () => templates.find((t) => t.id === selectedId) ?? templates[0],
    [templates, selectedId],
  );

  /* ---- template mutations ---- */
  const update = (fn: (list: ChecklistTemplate[]) => ChecklistTemplate[]) =>
    setData((d) => ({ ...d, checklistTemplates: fn(d.checklistTemplates) }));

  const renameTemplate = (id: string, name: string) =>
    update((list) => list.map((t) => (t.id === id ? { ...t, name } : t)));

  const addItem = (id: string) =>
    update((list) =>
      list.map((t) =>
        t.id === id
          ? { ...t, items: [...t.items, { id: uid(), label: "" }] }
          : t,
      ),
    );

  const updateItem = (tid: string, iid: string, label: string) =>
    update((list) =>
      list.map((t) =>
        t.id === tid
          ? {
              ...t,
              items: t.items.map((i) =>
                i.id === iid ? { ...i, label } : i,
              ),
            }
          : t,
      ),
    );

  const deleteItem = (tid: string, iid: string) =>
    update((list) =>
      list.map((t) =>
        t.id === tid
          ? { ...t, items: t.items.filter((i) => i.id !== iid) }
          : t,
      ),
    );

  const addBlankTemplate = () => {
    const t: ChecklistTemplate = { id: uid(), name: "Новый шаблон", items: [] };
    update((list) => [...list, t]);
    setSelectedId(t.id);
  };

  const duplicateTemplate = (id: string) => {
    const src = templates.find((t) => t.id === id);
    if (!src) return;
    const copy: ChecklistTemplate = {
      id: uid(),
      name: `${src.name} (копия)`,
      items: src.items.map((i) => ({ id: uid(), label: i.label })),
    };
    update((list) => [...list, copy]);
    setSelectedId(copy.id);
  };

  const deleteTemplate = (id: string) => {
    if (!confirm("Удалить шаблон?")) return;
    update((list) => list.filter((t) => t.id !== id));
    if (selectedId === id) setSelectedId(templates[0]?.id ?? "");
  };

  /* ---- run mode helpers ---- */
  const doneCount = selected
    ? selected.items.filter((i) => checked[i.id]).length
    : 0;
  const resetChecks = () => setChecked({});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-asphalt-100">Чек-лист</h1>
        <div className="flex rounded-sm border border-asphalt-700 p-0.5">
          {(["run", "edit"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-[2px] px-3 py-1 text-xs font-medium transition-colors ${
                mode === m
                  ? "bg-lime text-asphalt-950"
                  : "text-asphalt-300 hover:text-asphalt-100"
              }`}
            >
              {m === "run" ? "Перед выездом" : "Шаблоны"}
            </button>
          ))}
        </div>
      </div>

      {/* template selector */}
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSelectedId(t.id);
              if (mode === "run") setChecked({});
            }}
            className={`rounded-sm border px-3 py-1.5 text-sm transition-colors ${
              selected?.id === t.id
                ? "border-lime text-lime"
                : "border-asphalt-700 text-asphalt-300 hover:border-asphalt-500"
            }`}
          >
            {t.name}
          </button>
        ))}
        {mode === "edit" && (
          <button
            onClick={addBlankTemplate}
            className="inline-flex items-center gap-1 rounded-sm border border-dashed border-asphalt-600 px-3 py-1.5 text-sm text-asphalt-300 hover:border-asphalt-400 hover:text-asphalt-100"
          >
            <IconPlus width={15} height={15} /> Шаблон
          </button>
        )}
      </div>

      {!selected ? (
        <p className="text-sm text-asphalt-400">Нет шаблонов.</p>
      ) : mode === "run" ? (
        <RunMode
          template={selected}
          checked={checked}
          setChecked={setChecked}
          done={doneCount}
          onReset={resetChecks}
        />
      ) : (
        <EditMode
          template={selected}
          onRename={renameTemplate}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
          onDuplicate={duplicateTemplate}
          onDelete={deleteTemplate}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function RunMode({
  template,
  checked,
  setChecked,
  done,
  onReset,
}: {
  template: ChecklistTemplate;
  checked: Record<string, boolean>;
  setChecked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  done: number;
  onReset: () => void;
}) {
  const total = template.items.length;
  const allDone = total > 0 && done === total;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono tnum text-sm text-asphalt-300">
          {done} / {total} собрано
        </span>
        <button onClick={onReset} className="btn-line btn-sm">
          Сбросить
        </button>
      </div>

      {total === 0 ? (
        <p className="text-sm text-asphalt-400">В шаблоне нет пунктов.</p>
      ) : (
        <ul className="space-y-2">
          {template.items.map((i) => {
            const on = !!checked[i.id];
            return (
              <li key={i.id}>
                <button
                  onClick={() =>
                    setChecked((c) => ({ ...c, [i.id]: !c[i.id] }))
                  }
                  className={`flex w-full items-center gap-3 rounded-sm border px-3 py-3 text-left transition-colors ${
                    on
                      ? "border-lime/40 bg-lime/5"
                      : "border-asphalt-800 bg-asphalt-850 hover:border-asphalt-700"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border ${
                      on
                        ? "border-lime bg-lime text-asphalt-950"
                        : "border-asphalt-600"
                    }`}
                  >
                    {on && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path
                          d="m5 13 4 4 10-10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`text-[15px] ${
                      on ? "text-asphalt-400 line-through" : "text-asphalt-100"
                    }`}
                  >
                    {i.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {allDone && (
        <div className="rounded-sm border border-lime/40 bg-lime/10 px-3 py-2 text-center text-sm font-medium text-lime">
          Всё собрано — поехали
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function EditMode({
  template,
  onRename,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onDuplicate,
  onDelete,
}: {
  template: ChecklistTemplate;
  onRename: (id: string, name: string) => void;
  onAddItem: (id: string) => void;
  onUpdateItem: (tid: string, iid: string, label: string) => void;
  onDeleteItem: (tid: string, iid: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="card space-y-4 p-4">
      <div>
        <label className="label mb-1">Название шаблона</label>
        <input
          className="field"
          value={template.name}
          onChange={(e) => onRename(template.id, e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="label">Пункты</label>
        {template.items.map((i) => (
          <div key={i.id} className="flex items-center gap-2">
            <input
              className="field"
              value={i.label}
              placeholder="Название пункта"
              onChange={(e) => onUpdateItem(template.id, i.id, e.target.value)}
            />
            <button
              onClick={() => onDeleteItem(template.id, i.id)}
              className="btn-line btn-sm shrink-0 px-2"
              aria-label="Удалить пункт"
            >
              <IconX width={16} height={16} />
            </button>
          </div>
        ))}
        <button
          onClick={() => onAddItem(template.id)}
          className="btn-line btn-sm w-full"
        >
          <IconPlus width={15} height={15} /> Добавить пункт
        </button>
      </div>

      <div className="flex gap-2 border-t border-asphalt-800 pt-3">
        <button
          onClick={() => onDuplicate(template.id)}
          className="btn-ghost btn-sm flex-1"
        >
          Дублировать
        </button>
        <button
          onClick={() => onDelete(template.id)}
          className="btn-danger btn-sm flex-1"
        >
          Удалить шаблон
        </button>
      </div>
    </div>
  );
}
