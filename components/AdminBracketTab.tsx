"use client";

import { useState, useEffect } from "react";
import type { Match, Fighter, Bracket } from "@/lib/types";

export default function AdminBracketTab({
  matches, fighters, brackets, activeBracket, setMatches, setFighters, setBrackets, setActiveBracket
}: any) {
  const maxRound = matches.length ? Math.max(...matches.filter((m: any) => m.bracketId === activeBracket).map((m: any) => m.round), 1) : 1;

  function createBracket(type: "classic" | "free") {
    const name = prompt("Название сетки (например, 'Сезон 2'):");
    if (!name) return;
    let size = 0;
    if (type === "classic") {
      const input = prompt("Участников (4, 8, 16, 32):");
      if (!input) return;
      size = parseInt(input);
      if (![4, 8, 16, 32].includes(size)) return alert("Только 4, 8, 16 или 32");
    }
    const newBracketId = crypto.randomUUID();
    const newBracket = { id: newBracketId, name, type };
    const newFighters: any[] = [];
    const newMatches: any[] = [];

    if (type === "classic") {
      for (let i = 0; i < size; i++) newFighters.push({ id: `f_${Date.now()}_${i}`, name: `Слот ${i+1}`, userId: null, prevScore: 0, totalScore: 0, bracketId: newBracketId });
      const rounds = Math.round(Math.log2(size));
      for (let r = 1; r <= rounds; r++) {
        const count = size / Math.pow(2, r);
        for (let i = 1; i <= count; i++) {
          newMatches.push({ id: `m_${Date.now()}_${r}_${i}`, round: r, index: i, fighter1: null, fighter2: null, isCompleted: false, isBettingOpen: false, isTracksOpen: false, isFinal: r === rounds, odds1: 1.2, odds2: 1.2, score1: null, score2: null, winner: null, bracketId: newBracketId });
        }
      }
      newFighters.forEach((f, idx) => {
        const match = newMatches[Math.floor(idx / 2)];
        if (idx % 2 === 0) match.fighter1 = f.id; else match.fighter2 = f.id;
      });
    } else {
      newMatches.push({ id: `m_${Date.now()}_1_1`, round: 1, index: 1, fighter1: null, fighter2: null, isCompleted: false, isBettingOpen: false, isTracksOpen: false, isFinal: false, odds1: 1.2, odds2: 1.2, score1: null, score2: null, winner: null, bracketId: newBracketId });
    }
    setBrackets([...brackets, newBracket]);
    setFighters([...fighters, ...newFighters]);
    setMatches([...matches, ...newMatches]);
    setActiveBracket(newBracketId);
  }

  function deleteBracket(id: string) {
    if (!confirm("Удалить сетку и все её матчи?")) return;
    setBrackets(brackets.filter((b: any) => b.id !== id));
    setFighters(fighters.filter((f: any) => f.bracketId !== id));
    setMatches(matches.filter((m: any) => m.bracketId !== id));
    if (activeBracket === id) setActiveBracket(brackets.find((b: any) => b.id !== id)?.id || "");
  }

  function updateMatch(id: string, patch: any) { setMatches((prev: any) => prev.map((m: any) => (m.id === id ? { ...m, ...patch } : m))); }

  return (
    <div>
      <div className="flex gap-4 mb-6 items-center flex-wrap">
        <select value={activeBracket} onChange={(e: any) => setActiveBracket(e.target.value)} className="bg-[#1d1d27] text-white p-2 rounded font-bold border border-[#333]">
          {brackets.map((b: any) => <option key={b.id} value={b.id}>{b.name} ({b.type === 'classic' ? 'Классика' : 'Свободная'})</option>)}
        </select>
        <button onClick={() => createBracket("classic")} className="bg-[#00a3ff] text-[#002233] px-4 py-2 rounded font-bold">+ Классическая</button>
        <button onClick={() => createBracket("free")} className="bg-[#ffb020] text-[#2a1c00] px-4 py-2 rounded font-bold">+ Свободная</button>
        <button onClick={() => deleteBracket(activeBracket)} className="bg-[#ff2b2b] text-white px-4 py-2 rounded font-bold ml-auto">Удалить сетку</button>
      </div>

      <div className="grid gap-4 items-start" style={{ gridTemplateColumns: `repeat(${maxRound}, minmax(230px, 1fr))` }}>
        {Array.from({ length: maxRound }, (_, i) => i + 1).map((r) => {
          const roundMatches = matches.filter((m: any) => m.bracketId === activeBracket && m.round === r).sort((a: any, b: any) => a.index - b.index);
          return (
            <div key={r}>
              <div className="text-[10px] uppercase tracking-widest text-[#9aa0a6] mb-2 font-bold">Раунд {r}</div>
              <div className="flex flex-col gap-3">
                {roundMatches.map((m: any) => (
                  <div key={m.id} className="bg-[#1d1d27] border border-[#2a2a36] rounded p-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] text-[#9aa0a6]">Матч {m.index}</span>
                      <button onClick={() => { if(confirm("Удалить матч?")) setMatches((prev:any) => prev.filter((x:any) => x.id !== m.id)) }} className="text-[#ff2b2b] text-[10px]">🗑</button>
                    </div>
                    <FighterRow match={m} slot={1} fighters={fighters.filter((f:any) => f.bracketId === activeBracket)} onUpdate={(p: any) => updateMatch(m.id, p)} onSetWinner={() => updateMatch(m.id, { winner: m.fighter1 })} setFighters={setFighters} activeBracket={activeBracket} />
                    <FighterRow match={m} slot={2} fighters={fighters.filter((f:any) => f.bracketId === activeBracket)} onUpdate={(p: any) => updateMatch(m.id, p)} onSetWinner={() => updateMatch(m.id, { winner: m.fighter2 })} setFighters={setFighters} activeBracket={activeBracket} />
                    <div className="flex gap-1 mt-2">
                      <button onClick={() => {
                        if (!m.winner || !m.fighter1 || !m.fighter2) return;
                        const nextMatch = matches.find((x: any) => x.bracketId === activeBracket && x.round === m.round + 1 && x.index === Math.ceil(m.index / 2));
                        if (nextMatch) {
                          const slot = m.index % 2 === 1 ? "fighter1" : "fighter2";
                          setMatches((prev:any) => prev.map((x:any) => x.id === nextMatch.id ? {...x, [slot]: m.winner} : x));
                        }
                        updateMatch(m.id, { isCompleted: true });
                      }} className="text-[10px] bg-[#35d07f] text-[#062a16] font-bold px-2 py-1 rounded w-full">✓ Завершить и дальше</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <label className="flex items-center gap-1 text-[9px] text-[#ccc]"><input type="checkbox" checked={m.isCompleted} onChange={(e:any) => updateMatch(m.id, { isCompleted: e.target.checked })} /> Завершён</label>
                      <label className="flex items-center gap-1 text-[9px] text-[#ff4500]"><input type="checkbox" checked={m.isFinal} onChange={(e:any) => updateMatch(m.id, { isFinal: e.target.checked })} /> 🔥 Финал</label>
                      <label className="flex items-center gap-1 text-[9px] text-[#35d07f]"><input type="checkbox" checked={m.isBettingOpen} onChange={(e:any) => updateMatch(m.id, { isBettingOpen: e.target.checked })} /> Ставки</label>
                      <label className="flex items-center gap-1 text-[9px] text-[#00a3ff]"><input type="checkbox" checked={m.isTracksOpen} onChange={(e:any) => updateMatch(m.id, { isTracksOpen: e.target.checked })} /> Треки</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => {
        const nextIndex = matches.filter((m:any) => m.bracketId === activeBracket && m.round === 1).length + 1;
        setMatches((prev:any) => [...prev, { id: `m_${Date.now()}`, round: 1, index: nextIndex, fighter1: null, fighter2: null, isCompleted: false, isBettingOpen: false, isTracksOpen: false, isFinal: false, odds1: 1.2, odds2: 1.2, score1: null, score2: null, winner: null, bracketId: activeBracket }]);
      }} className="mt-4 bg-[#8b0033] text-white px-4 py-2 rounded text-sm font-bold">+ Добавить матч (для свободной сетки)</button>
    </div>
  );
}

function FighterRow({ match, slot, fighters, onUpdate, onSetWinner, setFighters, activeBracket }: any) {
  const fid = slot === 1 ? match.fighter1 : match.fighter2;
  const f = fid ? fighters.find((x: any) => x.id === fid) : null;
  const isWinner = fid != null && match.winner === fid;
  const [local, setLocal] = useState(f?.name ?? "");

  useEffect(() => { setLocal(f?.name ?? ""); }, [fid]);

  function commit() {
    const v = local.trim();
    if (!v) return onUpdate(slot === 1 ? { fighter1: null } : { fighter2: null });
    if (f && f.name === v) return;
    const existing = fighters.find((x: any) => x.name.toLowerCase() === v.toLowerCase());
    if (existing) return onUpdate(slot === 1 ? { fighter1: existing.id } : { fighter2: existing.id });
    const newId = "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    setFighters((prev:any) => [...prev, { id: newId, name: v, userId: null, prevScore: 0, totalScore: 0, bracketId: activeBracket }]);
    onUpdate(slot === 1 ? { fighter1: newId } : { fighter2: newId });
  }

  return (
    <div className={`flex gap-1 items-center p-1 rounded mb-1 ${isWinner ? "border border-[#35d07f] bg-[rgba(53,208,127,0.1)]" : "bg-[#14141c]"}`}>
      <input type="text" value={local} onChange={(e:any) => setLocal(e.target.value)} onBlur={commit} onKeyDown={(e:any) => e.key === "Enter" && (e.target as any).blur()} className="flex-1 bg-[#1d1d27] text-white text-xs px-2 py-1 rounded" />
      <input type="number" value={(slot === 1 ? match.score1 : match.score2) ?? ""} onChange={(e:any) => onUpdate(slot === 1 ? { score1: e.target.value === "" ? null : +e.target.value } : { score2: e.target.value === "" ? null : +e.target.value })} className="w-10 bg-[#1d1d27] text-white text-xs px-1 py-1 rounded text-center" />
      <button onClick={onSetWinner} className={`w-6 h-6 rounded ${isWinner ? "bg-[#35d07f] text-black" : "bg-[#1d1d27] text-[#ccc]"}`}>🏆</button>
    </div>
  );
}