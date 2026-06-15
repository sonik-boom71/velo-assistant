"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconGauge,
  IconWrench,
  IconChecklist,
  IconDroplet,
  IconTag,
} from "./Icons";

const ITEMS = [
  { href: "/", label: "Сводка", Icon: IconGauge },
  { href: "/maintenance", label: "ТО", Icon: IconWrench },
  { href: "/checklist", label: "Чек-лист", Icon: IconChecklist },
  { href: "/nutrition", label: "Питание", Icon: IconDroplet },
  { href: "/budget", label: "Бюджет", Icon: IconTag },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-asphalt-800 bg-asphalt-900">
      <div className="mx-auto flex max-w-md">
        {ITEMS.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium uppercase tracking-wide transition-colors ${
                active
                  ? "text-lime"
                  : "text-asphalt-400 hover:text-asphalt-200"
              }`}
            >
              <Icon width={21} height={21} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
