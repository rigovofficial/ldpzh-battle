import type { Season } from "@/lib/types";
import { seasonTypeLabel, seasonStatusLabel } from "@/lib/labels";

export default function SeasonHeader({ season }: { season: Season }) {
  const badgeCls =
    season.type === "official"
      ? "bg-[#c39b00] text-[#1a1400]"
      : "bg-[#555] text-[#eee]";

  return (
    <div className="flex items-center gap-4 mb-6 p-4 bg-[#14141c] border border-[#1d1d27] rounded-2xl flex-wrap">
      <h2 className="text-2xl font-black tracking-wide m-0">
        {season.title}, сезон {season.number}
      </h2>
      <span
        className={`text-[11px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full ${badgeCls}`}
      >
        {seasonTypeLabel[season.type]}
      </span>
      <span className="text-[#9aa0a6] text-xs ml-auto">
        Участников: {season.slots} · {seasonStatusLabel[season.status] ?? season.status}
      </span>
    </div>
  );
}