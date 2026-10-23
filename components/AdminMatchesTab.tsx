"use client";

import type { Match, Fighter } from "@/lib/types";

export default function AdminMatchesTab({ 
  matches, fighters, draftActiveBracket, setDraftMatches, onResolveBets
}: {
  matches: Match[]; fighters: Fighter[]; draftActiveBracket: string;
  setDraftMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  onResolveBets: (matchId: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-2">Все матчи (активная сетка)</h3>
      
      {matches.filter(m => m.bracketId === draftActiveBracket).sort((a, b) => a.round - b.round || a.index - b.index).map((m) => (
        <div key={m.id} className="bg-[#1d1d27] border border-[#2a2a36] rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm">Раунд {m.round} · Матч {m.index}</span>
            <div className="flex gap-2 items-center">
              <label className="flex items-center gap-1 text-xs text-[#ccc]">
                <input type="checkbox" checked={m.isCompleted} onChange={(e) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, isCompleted: e.target.checked} : x))} /> 
                Завершён
              </label>
              {m.isCompleted && m.winner && !m.pointsAwarded && (
                <button 
                  onClick={() => onResolveBets(m.id)} 
                  className="bg-[#ffb020] text-[#2a1c00] px-3 py-1 rounded text-xs font-bold hover:opacity-90 animate-pulse"
                >
                  💰 Рассчитать ставки
                </button>
              )}
              {m.pointsAwarded && (
                <span className="text-xs text-[#35d07f] font-bold">✓ Ставки рассчитаны</span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#9aa0a6]">Балл 1</span>
              <input type="number" value={m.score1 ?? ""} onChange={(e) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, score1: e.target.value === "" ? null : +e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#9aa0a6]">Балл 2</span>
              <input type="number" value={m.score2 ?? ""} onChange={(e) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, score2: e.target.value === "" ? null : +e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#9aa0a6]">Кэф 1</span>
              <input type="number" step="0.01" value={m.odds1} onChange={(e) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, odds1: +e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#9aa0a6]">Кэф 2</span>
              <input type="number" step="0.01" value={m.odds2} onChange={(e) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, odds2: +e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select 
              value={m.winner ?? ""} 
              onChange={(e) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, winner: e.target.value || null} : x))} 
              className="flex-1 bg-[#14141c] text-white text-xs px-2 py-1.5 rounded border border-[#333]"
            >
              <option value="">— Победитель не выбран —</option>
              {m.fighter1 && <option value={m.fighter1}>{fighters.find(f => f.id === m.fighter1)?.name || m.fighter1}</option>}
              {m.fighter2 && <option value={m.fighter2}>{fighters.find(f => f.id === m.fighter2)?.name || m.fighter2}</option>}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}