"use client";

import type { Board } from "@/lib/types";

export default function BoardTabs({
  boards,
  activeId,
  onChange,
}: {
  boards: Board[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  if (boards.length <= 1) return null;

  return (
    <div className="flex gap-1.5 flex-wrap mb-4">
      {boards.map((b) => (
        <button
          key={b.id}
          onClick={() => onChange(b.id)}
          className={`px-3.5 py-2 rounded-lg cursor-pointer text-[13px] border transition-colors ${
            activeId === b.id
              ? "bg-[#8b0033] text-white border-[#00a3ff]"
              : "bg-[#1d1d27] text-[#f5f5f5] border-transparent hover:border-[#333]"
          }`}
        >
          {b.title}
          {b.status === "archived" && (
            <span className="ml-1.5 text-[10px] opacity-60">архив</span>
          )}
        </button>
      ))}
    </div>
  );
}