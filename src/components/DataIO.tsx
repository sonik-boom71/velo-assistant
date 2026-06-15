"use client";

import { useRef, useState } from "react";
import { useAppData, normalizeAppData } from "@/lib/storage";
import { IconDownload, IconUpload } from "./Icons";

export function DataIO() {
  const { data, setData } = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `velo-app-data-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = normalizeAppData(JSON.parse(text));
      if (!confirm("Импорт заменит все текущие данные. Продолжить?")) return;
      setData(parsed);
      setMsg("Данные импортированы");
    } catch {
      setMsg("Не удалось прочитать файл");
    } finally {
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={exportData} className="btn-line flex-1">
          <IconDownload width={16} height={16} /> Экспорт
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="btn-line flex-1"
        >
          <IconUpload width={16} height={16} /> Импорт
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importData(f);
            e.target.value = "";
          }}
        />
      </div>
      {msg && <p className="text-center text-xs text-lime">{msg}</p>}
    </div>
  );
}
