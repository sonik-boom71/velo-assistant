import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconGauge(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="m13.4 10.6 4-4" />
      <path d="M4.5 18a9 9 0 1 1 15 0" />
    </svg>
  );
}

export function IconWrench(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L4 16.8 7.2 20l5.3-5.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.3-.6-.6-2.3 2.5-2.7Z" />
    </svg>
  );
}

export function IconChecklist(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="m3 7 1.5 1.5L7 6" />
      <path d="m3 14 1.5 1.5L7 13" />
      <path d="M11 7.5h10" />
      <path d="M11 14.5h10" />
    </svg>
  );
}

export function IconDroplet(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3.2 6.5 10a6 6 0 1 0 11 0L12 3.2Z" />
    </svg>
  );
}

export function IconTag(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3 11.5V4.5A1.5 1.5 0 0 1 4.5 3h7l9.5 9.5a1.5 1.5 0 0 1 0 2.1l-6.9 6.9a1.5 1.5 0 0 1-2.1 0L3 11.5Z" />
      <path d="M7.5 7.5h.01" />
    </svg>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconX(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconHistory(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 4v4h4" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

export function IconChevron(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconDownload(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function IconUpload(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 17V5" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 21h14" />
    </svg>
  );
}
