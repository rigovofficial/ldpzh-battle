"use client";

import { useState } from "react";
import type { Board, Match, Fighter, Track } from "@/lib/types";

export default function TracksTab({
  boards,
  matches,
  fighters,
  tracks,
  setTracks,
}: {
  boards: Board[];
  matches: Match[];
  fighters: Fighter[];
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
}) {
  const [filterBoardId, setFilterBoardId] = useState<string>("");

  // Новый трек: селекты
  const [newBoardId, setNewBoardId] = useState<string>("");
  const [newMatchId, setNewMatchId] = useState<string>("");
  const [newFighterId, setNewFighterId] = useState<string>("");
  const [newUrl, setNewUrl] = useState<string>("");

  const boardMatches = filterBoardId
    ? matches.filter((m) => m.boardId === filterBoardId)
    : matches;

  const visibleTracks = filterBoardId
    ? tracks.filter((t) => {
        const m = matches.find((x) => x.id === t.matchId);
        return m?.boardId === filterBoardId;
      })
    : tracks;

  function updateTrack(id: string, patch: Partial<Track>) {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }

  function removeTrack(id: string) {
    if (!confirm("Удалить трек?")) return;
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }

  // Список бойцов, участвующих в конкретном матче
  function fightersInMatch(matchId: string): Fighter[] {
    const m = matches.find((x) => x.id === matchId);
    if (!m) return [];
    const ids = m.teams.flatMap((t) => t.fighterIds);
    return fighters.filter((f) => ids.includes(f.id));
  }

  // Список матчей, в которых участвует конкретный боец
  function matchesForFighter(fighterId: string, boardId: string): Match[] {
    return matches.filter(
      (m) =>
        m.boardId === boardId &&
        m.teams.some((t) => t.fighterIds.includes(fighterId))
    );
  }

  const boardOptions = boards;

  function addTrack() {
    if (!newBoardId || !newMatchId || !newFighterId || !newUrl.trim()) {
      alert("Заполни сетку, матч, бойца и URL");
      return;
    }
    setTracks((prev) => [
      ...prev,
      {
        id: "t_" + Date.now(),
        matchId: newMatchId,
        fighterId: newFighterId,
        url: newUrl.trim(),
        isPublished: false,
        score: null,
      },
    ]);
    setNewUrl("");
    setNewFighterId("");
  }

  function nameOf(fid: string) {
    return fighters.find((f) => f.id === fid)?.name ?? "?";
  }

  function matchLabel(matchId: string) {
    const m = matches.find((x) => x.id === matchId);
    if (!m) return matchId;
    return `R${m.round}·M${m.position}${m.isFire ? " 🔥" : ""}${
      m.isFinal ? " 🏆" : ""
    }`;
  }

  return (
    <div>
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">
        Все треки ({tracks.length})
      </h3>
      <p className="text-[#9aa0a6] text-xs mb-4">
        Публичные треки видны всем. Скрытые — только тебе и автору. Публикуй
        треки, когда все сданы и раунд закрыт.
      </p>

      {/* Фильтр по сетке */}
      <div className="flex gap-2 items-center mb-4 flex-wrap">
        <span className="text-xs text-[#9aa0a6]">Фильтр:</span>
        <button
          onClick={() => setFilterBoardId("")}
          className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-colors ${
            filterBoardId === ""
              ? "bg-[#8b0033] text-white border-[#00a3ff]"
              : "bg-[#1d1d27] text-[#f5f5f5] border-transparent hover:border-[#333]"
          }`}
        >
          Все сетки
        </button>
        {boards.map((b) => (
          <button
            key={b.id}
            onClick={() => setFilterBoardId(b.id)}
            className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-colors ${
              filterBoardId === b.id
                ? "bg-[#8b0033] text-white border-[#00a3ff]"
                : "bg-[#1d1d27] text-[#f5f5f5] border-transparent hover:border-[#333]"
            }`}
          >
            {b.title}
          </button>
        ))}
      </div>

      {visibleTracks.length === 0 ? (
        <div className="bg-[#1d1d27] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic mb-4">
          Треков пока нет.
        </div>
      ) : (
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-[#9aa0a6] text-[11px] uppercase tracking-widest">
                <th className="text-left py-2 pr-3 font-semibold">Боец</th>
                <th className="text-left py-2 pr-3 font-semibold">Матч</th>
                <th className="text-left py-2 pr-3 font-semibold">URL</th>
                <th className="text-left py-2 pr-3 font-semibold">Балл</th>
                <th className="text-left py-2 pr-3 font-semibold">Опубл.</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visibleTracks.map((t) => (
                <tr key={t.id} className="border-t border-[#2a2a36]">
                  <td className="py-2 pr-3">{nameOf(t.fighterId)}</td>
                  <td className="py-2 pr-3 text-xs text-[#9aa0a6] font-mono">
                    {matchLabel(t.matchId)}
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="url"
                      value={t.url}
                      onChange={(e) =>
                        updateTrack(t.id, { url: e.target.value })
                      }
                      className="w-full min-w-[240px] bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      value={t.score ?? ""}
                      placeholder="—"
                      onChange={(e) =>
                        updateTrack(t.id, {
                          score:
                            e.target.value === "" ? null : +e.target.value,
                        })
                      }
                      className="w-16 bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="checkbox"
                      checked={t.isPublished}
                      onChange={(e) =>
                        updateTrack(t.id, { isPublished: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#35d07f]"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <button
                      onClick={() => removeTrack(t.id)}
                      title="Удалить"
                      className="bg-transparent text-[#ff2b2b] border border-[#ff2b2b] w-7 h-7 rounded-md cursor-pointer text-xs hover:bg-[#ff2b2b] hover:text-white transition-colors"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-[#2a2a36] pt-4">
        <h4 className="text-[#00a3ff] text-xs uppercase tracking-widest mb-3">
          Добавить трек вручную
        </h4>

        <div className="flex gap-2 flex-wrap items-start">
          <select
            value={newBoardId}
            onChange={(e) => {
              setNewBoardId(e.target.value);
              setNewMatchId("");
              setNewFighterId("");
            }}
            className="bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-2 text-xs outline-none focus:border-[#00a3ff]"
          >
            <option value="">— сетка —</option>
            {boardOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>

          <select
            value={newMatchId}
            disabled={!newBoardId}
            onChange={(e) => {
              setNewMatchId(e.target.value);
              setNewFighterId("");
            }}
            className="bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-2 text-xs outline-none focus:border-[#00a3ff] disabled:opacity-40"
          >
            <option value="">— матч —</option>
            {matches
              .filter((m) => m.boardId === newBoardId)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  R{m.round}·M{m.position}
                  {m.isFire ? " 🔥" : ""}
                  {m.isFinal ? " 🏆" : ""}
                </option>
              ))}
          </select>

          <select
            value={newFighterId}
            disabled={!newMatchId}
            onChange={(e) => setNewFighterId(e.target.value)}
            className="bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-2 text-xs outline-none focus:border-[#00a3ff] disabled:opacity-40"
          >
            <option value="">— боец —</option>
            {fightersInMatch(newMatchId).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://soundcloud.com/..."
            className="flex-1 min-w-[200px] bg-[#1d1d27] text-white border border-[#333] rounded-md px-3 py-2 text-xs outline-none focus:border-[#00a3ff]"
          />

          <button
            onClick={addTrack}
            className="bg-[#8b0033] text-white font-bold px-4 py-2 rounded-lg cursor-pointer border-none hover:opacity-90 text-xs"
          >
            + Добавить
          </button>
        </div>
      </div>
    </div>
  );
}