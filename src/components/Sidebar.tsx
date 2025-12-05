"use client";

type SidebarProps = {
  selected: "dashboard" | "quiz" | "events";
  onSelect: (value: "dashboard" | "quiz" | "events") => void;
};

const items: { key: "dashboard" | "quiz" | "events"; label: string }[] = [
  { key: "dashboard", label: "대시보드" },
  { key: "quiz", label: "퀴즈" },
  { key: "events", label: "이벤트" },
];

export function Sidebar({ selected, onSelect }: SidebarProps) {
  return (
    <aside className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
              selected === item.key
                ? "bg-neutral-900 text-white"
                : "text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
