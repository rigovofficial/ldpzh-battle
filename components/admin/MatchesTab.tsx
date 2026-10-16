"use client";

import { useState } from "react";
import type { Board, Match, Fighter } from "@/lib/types";
import { matchStatusLabel } from "@/lib/labels";

export default function MatchesTab({
  boards,
  matches,
  fighters,
  setMatches,
}: {
  boards: Board[];
  matches: Match[];
  fighters: Fighter[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
}) {
  const [activeBoardId, setActiveBoardId] = useState<string>(
    boards[0]?.id ?? ""
  );

  const activeBoard = boards.find((b) => b.id === activeBoardId);
  const boardMatches = matches
    .filter((m) => m.boardId === activeBoardId)
    .sort((a, b) =>
      a.round !== b.round ? a.round - b.round : a.position - b.position
    );

  function update(id: string, patch: Partial<Match>) {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }

  function removeMatch(id: string) {
    if (!confirm("Удалить матч?")) return;
    setMatches((prev) => prev.filter((m) => m.id !== id));
  }

  function addMatch() {
    const roundStr = prompt("Раунд (число):", "1");
    if (!roundStr) return;
    const round = parseInt(roundStr, 10);
    if (!round || round < 1) return alert("Неверный раунд");

    const inRound = boardMatches.filter((m) => m.round === round);
    const position =
      inRound.length > 0 ? Math.max(...inRound.map((m) => m.position)) + 1 : 1;

    const id = `m_${activeBoardId}_${Date.now()}`;
    const newMatch: Match = {
      id,
      boardId: activeBoardId,
      round,
      position,
      teams: [
        { name: null, fighterIds: [] },
        { name: null, fighterIds: [] },
      ],
      isFire: false,
      isFinal: false,
      status: "pending",
      odds1: 2.0,
      odds2: 2.0,
      score1: null,
      score2: null,
      winnerTeam: null,
    };
    setMatches((prev) => [...prev, newMatch]);
  }

  function addTeamFighter(matchId: string, teamIdx: 0 | 1, fighterId: string) {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const teams = JSON.parse(JSON.stringify(m.teams)) as Match["teams"];
        if (!teams[teamIdx].fighterIds.includes(fighterId)) {
          teams[teamIdx].fighterIds.push(fighterId);
        }
        return { ...m, teams };
      })
    );
  }

  function removeTeamFighter(
    matchId: string,
    teamIdx: 0 | 1,
    fighterId: string
  ) {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const teams = JSON.parse(JSON.stringify(m.teams)) as Match["teams"];
        teams[teamIdx].fighterIds = teams[teamIdx].fighterIds.filter(
          (id) => id !== fighterId
        );
        return { ...m, teams };
      })
    );
  }

  function setTeamName(matchId: string, teamIdx: 0 | 1, name: string) {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const teams = JSON.parse(JSON.stringify(m.teams)) as Match["teams"];
        teams[teamIdx].name = name || null;
        return { ...m, teams };
      })
    );
  }

  function generateOdds(matchId: string) {
    // «Весёлая» генерация: два рандомных числа в диапазоне 1.01–15 с уклоном к малым
    function rand() {
      let x = Math.random();
      x = x * x; // квадрат делает малые вероятнее
      const v = 1.01 + x * (15 - 1.01);
      return Math.round(v * 100) / 100;
    }
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, odds1: rand(), odds2: rand() } : m
      )
    );
  }

  if (boards.length === 0) {
    return (
      <div className="text-center py-16 text-[#9aa0a6] italic">
        Сначала создай сетку во вкладке «Сетки».
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-3">
        Редактор матчей
      </h3>

      <div className="flex gap-2 flex-wrap mb-4">
        <span className="text-xs text-[#9aa0a6] self-center">Сетка:</span>
        {boards.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBoardId(b.id)}
            className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-colors ${
              activeBoardId === b.id
                ? "bg-[#8b0033] text-white border-[#00a3ff]"
                : "bg-[#1d1d27] text-[#f5f5f5] border-transparent hover:border-[#333]"
            }`}
          >
            {b.title}
          </button>
        ))}
      </div>

      {activeBoard && (
        <>
          <div className="text-[#9aa0a6] text-xs mb-4">
            Матчей в сетке: {boardMatches.length}
          </div>

          <div className="flex flex-col gap-3 mb-4">
            {boardMatches.map((m) => (
              <MatchEditor
                key={m.id}
                match={m}
                fighters={fighters}
                onUpdate={(patch) => update(m.id, patch)}
                onRemove={() => removeMatch(m.id)}
                onAddFighter={(teamIdx, fid) =>
                  addTeamFighter(m.id, teamIdx, fid)
                }
                onRemoveFighter={(teamIdx, fid) =>
                  removeTeamFighter(m.id, teamIdx, fid)
                }
                onSetTeamName={(teamIdx, name) =>
                  setTeamName(m.id, teamIdx, name)
                }
                onGenerateOdds={() => generateOdds(m.id)}
              />
            ))}
          </div>

          <button
            onClick={addMatch}
            className="bg-[#8b0033] text-white font-bold px-4 py-2.5 rounded-lg cursor-pointer border-none hover:opacity-90"
          >
            + Добавить матч
          </button>
        </>
      )}
    </div>
  );
}

function MatchEditor({
  match,
  fighters,
  onUpdate,
  onRemove,
  onAddFighter,
  onRemoveFighter,
  onSetTeamName,
  onGenerateOdds,
}: {
  match: Match;
  fighters: Fighter[];
  onUpdate: (patch: Partial<Match>) => void;
  onRemove: () => void;
  onAddFighter: (teamIdx: 0 | 1, fighterId: string) => void;
  onRemoveFighter: (teamIdx: 0 | 1, fighterId: string) => void;
  onSetTeamName: (teamIdx: 0 | 1, name: string) => void;
  onGenerateOdds: () => void;
}) {
  const borderCls = match.isFire
    ? "border-2 border-[#ff6a00]"
    : match.isFinal
    ? "border-2 border-[#ffd166]"
    : "border border-[#2a2a36]";

  return (
    <div className={`bg-[#1d1d27] rounded-xl p-4 ${borderCls}`}>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm">
            Раунд {match.round} · Матч {match.position}
          </span>
          <span className="text-[#666] font-mono text-[10px]">
            {match.id}
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={match.isFire}
              onChange={(e) => onUpdate({ isFire: e.target.checked })}
              className="w-3.5 h-3.5 accent-[#ff6a00]"
            />
            🔥 Fire
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={match.isFinal}
              onChange={(e) => onUpdate({ isFinal: e.target.checked })}
              className="w-3.5 h-3.5 accent-[#ffd166]"
            />
            🏆 Финал
          </label>
        </div>
        <button
          onClick={onRemove}
          className="bg-transparent text-[#ff2b2b] border border-[#ff2b2b] px-2.5 py-1 rounded-md text-xs cursor-pointer hover:bg-[#ff2b2b] hover:text-white transition-colors"
        >
          🗑 Удалить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TeamEditor
          teamIdx={0}
          team={match.teams[0]}
          odd={match.odds1}
          score={match.score1}
          fighters={fighters}
          isWinner={match.winnerTeam === 0}
          onUpdateOdd={(v) => onUpdate({ odds1: v })}
          onUpdateScore={(v) => onUpdate({ score1: v })}
          onSetName={(name) => onSetTeamName(0, name)}
          onAddFighter={(fid) => onAddFighter(0, fid)}
          onRemoveFighter={(fid) => onRemoveFighter(0, fid)}
          onMarkWinner={() =>
            onUpdate({
              winnerTeam: match.winnerTeam === 0 ? null : 0,
            })
          }
        />
        <TeamEditor
          teamIdx={1}
          team={match.teams[1]}
          odd={match.odds2}
          score={match.score2}
          fighters={fighters}
          isWinner={match.winnerTeam === 1}
          onUpdateOdd={(v) => onUpdate({ odds2: v })}
          onUpdateScore={(v) => onUpdate({ score2: v })}
          onSetName={(name) => onSetTeamName(1, name)}
          onAddFighter={(fid) => onAddFighter(1, fid)}
          onRemoveFighter={(fid) => onRemoveFighter(1, fid)}
          onMarkWinner={() =>
            onUpdate({
              winnerTeam: match.winnerTeam === 1 ? null : 1,
            })
          }
        />
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#9aa0a6] uppercase tracking-widest">
            Статус
          </span>
          <select
            value={match.status}
            onChange={(e) =>
              onUpdate({ status: e.target.value as Match["status"] })
            }
            className="bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
          >
            <option value="pending">Ожидание</option>
            <option value="betting_open">Ставки открыты</option>
            <option value="tracks_open">Приём треков</option>
            <option value="judging">Судейство</option>
            <option value="completed">Завершён</option>
          </select>
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-[#9aa0a6] uppercase tracking-widest">
            Кэфы (авто/ручные)
          </span>
          <div className="flex gap-2">
            <button
              onClick={onGenerateOdds}
              className="text-[11px] px-2.5 py-1 rounded-md bg-[#8b0033] text-white border-none cursor-pointer hover:opacity-90"
            >
              🎲 Сгенерить оба
            </button>
            <span className="text-[#666] text-xs self-center">
              текущие: {match.odds1.toFixed(2)} / {match.odds2.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamEditor({
  teamIdx,
  team,
  odd,
  score,
  fighters,
  isWinner,
  onUpdateOdd,
  onUpdateScore,
  onSetName,
  onAddFighter,
  onRemoveFighter,
  onMarkWinner,
}: {
  teamIdx: 0 | 1;
  team: Match["teams"][0];
  odd: number;
  score: number | null;
  fighters: Fighter[];
  isWinner: boolean;
  onUpdateOdd: (v: number) => void;
  onUpdateScore: (v: number | null) => void;
  onSetName: (name: string) => void;
  onAddFighter: (fid: string) => void;
  onRemoveFighter: (fid: string) => void;
  onMarkWinner: () => void;
}) {
  const availableFighters = fighters.filter(
    (f) => !team.fighterIds.includes(f.id)
  );

  return (
    <div
      className={`rounded-lg p-3 border ${
        isWinner
          ? "border-[#35d07f] bg-[rgba(53,208,127,0.10)]"
          : "border-[#333] bg-[#14141c]"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-[#9aa0a6] uppercase tracking-widest">
          Команда {teamIdx + 1}
        </span>
        <button
          onClick={onMarkWinner}
          className={`text-[10px] px-2 py-0.5 rounded-md cursor-pointer border ${
            isWinner
              ? "bg-[#35d07f] text-[#062a16] border-[#35d07f] font-bold"
              : "bg-transparent text-[#9aa0a6] border-[#333] hover:border-[#666]"
          }`}
        >
          {isWinner ? "🏆 Победитель" : "Отметить"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Имя команды (необязательно)"
        value={team.name ?? ""}
        onChange={(e) => onSetName(e.target.value)}
        className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff] mb-2"
      />

      <div className="flex flex-wrap gap-1.5 mb-2">
        {team.fighterIds.map((fid) => {
          const f = fighters.find((x) => x.id === fid);
          return (
            <span
              key={fid}
              className="flex items-center gap-1.5 bg-[#1d1d27] border border-[#00a3ff] rounded-full pl-2.5 pr-1 py-0.5 text-xs"
            >
              <span className="text-[#00a3ff] font-bold">
                {f?.name ?? "?"}
              </span>
              <button
                onClick={() => onRemoveFighter(fid)}
                className="w-4 h-4 flex items-center justify-center rounded-full bg-transparent text-[#ff2b2b] border-none cursor-pointer hover:bg-[#ff2b2b] hover:text-white transition-colors"
              >
                ✕
              </button>
            </span>
          );
        })}
      </div>

      {availableFighters.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) onAddFighter(e.target.value);
            e.target.value = "";
          }}
          className="w-full bg-[#1d1d27] text-[#00a3ff] border border-dashed border-[#00a3ff] rounded-md px-2 py-1 text-xs cursor-pointer outline-none mb-2"
        >
          <option value="">+ добавить бойца</option>
          {availableFighters.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      )}

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#9aa0a6] uppercase tracking-widest">
            Кэф
          </span>
          <input
            type="number"
            step="0.01"
            min="1.01"
            value={odd}
            onChange={(e) => onUpdateOdd(+e.target.value || 1.01)}
            className="bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#9aa0a6] uppercase tracking-widest">
            Балл
          </span>
          <input
            type="number"
            value={score ?? ""}
            placeholder="—"
            onChange={(e) =>
              onUpdateScore(e.target.value === "" ? null : +e.target.value)
            }
            className="bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
          />
        </label>
      </div>
    </div>
  );
}