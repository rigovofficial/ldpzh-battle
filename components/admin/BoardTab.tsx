"use client";

import type { Board, Match, Fighter, Participation } from "@/lib/types";

export default function BoardTab({
  boards,
  matches,
  fighters,
  participations,
  setBoards,
  setMatches,
  setFighters,
  setParticipations,
}: {
  boards: Board[];
  matches: Match[];
  fighters: Fighter[];
  participations: Participation[];
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  setFighters: React.Dispatch<React.SetStateAction<Fighter[]>>;
  setParticipations: React.Dispatch<React.SetStateAction<Participation[]>>;
}) {
  function updateBoard(id: string, patch: Partial<Board>) {
    setBoards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  }

  function removeBoard(id: string) {
    if (
      !confirm(
        "Удалить сетку? Все её матчи, участия и треки тоже удалятся."
      )
    )
      return;
    setBoards((prev) => prev.filter((b) => b.id !== id));
    setMatches((prev) => prev.filter((m) => m.boardId !== id));
    setParticipations((prev) => prev.filter((p) => p.boardId !== id));
  }

  function addBoard() {
    const title = prompt("Название новой сетки:", "Новый сезон");
    if (!title) return;
    const type = confirm(
      "ОК = СТАНДАРТНАЯ (дерево, 4/8/16/32 участника)\nОтмена = СВОБОДНАЯ (ручная, любая анархия)"
    )
      ? "standard"
      : "free";

    const id = "b_" + Date.now();
    const newBoard: Board = {
      id,
      title: title.trim(),
      type,
      status: "draft",
      showOnHome: false,
      sortOrder: boards.length + 1,
      slots: type === "standard" ? 8 : null,
    };
    setBoards((prev) => [...prev, newBoard]);

    if (type === "standard") {
      // Генерим пустое дерево на 8 участников (можно потом пересоздать)
      const slots = 8;
      const rounds = Math.round(Math.log2(slots));
      const newMatches: Match[] = [];
      for (let r = 1; r <= rounds; r++) {
        const count = slots / Math.pow(2, r);
        for (let p = 1; p <= count; p++) {
          newMatches.push({
            id: `m_${id}_${r}_${p}`,
            boardId: id,
            round: r,
            position: p,
            teams: [
              { name: null, fighterIds: [] },
              { name: null, fighterIds: [] },
            ],
            isFire: false,
            isFinal: r === rounds,
            status: "pending",
            odds1: 2.0,
            odds2: 2.0,
            score1: null,
            score2: null,
            winnerTeam: null,
          });
        }
      }
      setMatches((prev) => [...prev, ...newMatches]);
    }
  }

  function regenerateStandardMatches(boardId: string, slots: 4 | 8 | 16 | 32) {
    if (
      !confirm(
        `Пересобрать сетку под ${slots} участников? Текущие матчи этой сетки будут заменены на пустые.`
      )
    )
      return;
    setMatches((prev) => prev.filter((m) => m.boardId !== boardId));
    const rounds = Math.round(Math.log2(slots));
    const newMatches: Match[] = [];
    for (let r = 1; r <= rounds; r++) {
      const count = slots / Math.pow(2, r);
      for (let p = 1; p <= count; p++) {
        newMatches.push({
          id: `m_${boardId}_${Date.now()}_${r}_${p}`,
          boardId,
          round: r,
          position: p,
          teams: [
            { name: null, fighterIds: [] },
            { name: null, fighterIds: [] },
          ],
          isFire: false,
          isFinal: r === rounds,
          status: "pending",
          odds1: 2.0,
          odds2: 2.0,
          score1: null,
          score2: null,
          winnerTeam: null,
        });
      }
    }
    setMatches((prev) => [...prev, ...newMatches]);
  }

  function addParticipationsForBoard(boardId: string) {
    // Опционально: подкинуть всех текущих бойцов в новый борд
    const existing = new Set(
      participations
        .filter((p) => p.boardId === boardId)
        .map((p) => p.fighterId)
    );
    const toAdd = fighters
      .filter((f) => !existing.has(f.id))
      .map((f) => ({
        id: "p_" + Date.now() + "_" + f.id,
        boardId,
        fighterId: f.id,
        prevScore: 0,
        localScore: 0,
        seed: null,
      }));
    if (toAdd.length > 0) {
      setParticipations((prev) => [...prev, ...toAdd]);
      alert(`Добавлено участий: ${toAdd.length}`);
    }
  }

  return (
    <div>
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">
        Сетки / турниры ({boards.length})
      </h3>
      <p className="text-[#9aa0a6] text-xs mb-4">
        Каждый борд — отдельный турнир со своими бойцами, матчами, треками.
        Standard — дерево 4/8/16/32. Free — полная ручная анархия.
      </p>

      <div className="flex flex-col gap-3">
        {boards.map((b) => (
          <div
            key={b.id}
            className="bg-[#1d1d27] rounded-xl p-4 border border-[#2a2a36]"
          >
            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex flex-col gap-1 min-w-[180px] flex-1">
                <div className="text-xs text-[#9aa0a6] uppercase tracking-widest">
                  Название
                </div>
                <input
                  type="text"
                  value={b.title}
                  onChange={(e) =>
                    updateBoard(b.id, { title: e.target.value })
                  }
                  className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-sm outline-none focus:border-[#00a3ff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-xs text-[#9aa0a6] uppercase tracking-widest">
                  Тип
                </div>
                <select
                  value={b.type}
                  onChange={(e) =>
                    updateBoard(b.id, {
                      type: e.target.value as Board["type"],
                    })
                  }
                  className="bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                >
                  <option value="standard">Стандартная</option>
                  <option value="free">Свободная</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-xs text-[#9aa0a6] uppercase tracking-widest">
                  Статус
                </div>
                <select
                  value={b.status}
                  onChange={(e) =>
                    updateBoard(b.id, {
                      status: e.target.value as Board["status"],
                    })
                  }
                  className="bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                >
                  <option value="draft">Черновик</option>
                  <option value="active">Активна</option>
                  <option value="archived">Архив</option>
                  <option value="hidden">Скрыта</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-xs text-[#9aa0a6] uppercase tracking-widest">
                  Порядок
                </div>
                <input
                  type="number"
                  value={b.sortOrder}
                  onChange={(e) =>
                    updateBoard(b.id, { sortOrder: +e.target.value || 0 })
                  }
                  className="w-20 bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-xs text-[#9aa0a6] uppercase tracking-widest">
                  &nbsp;
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs bg-[#14141c] border border-[#333] rounded-md px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={b.showOnHome}
                    onChange={(e) =>
                      updateBoard(b.id, { showOnHome: e.target.checked })
                    }
                    className="w-3.5 h-3.5 accent-[#00a3ff]"
                  />
                  На главной
                </label>
              </div>

              <button
                onClick={() => removeBoard(b.id)}
                className="bg-transparent text-[#ff2b2b] border border-[#ff2b2b] px-3 py-1.5 rounded-md text-xs cursor-pointer hover:bg-[#ff2b2b] hover:text-white transition-colors self-end"
              >
                🗑 Удалить
              </button>
            </div>

            {b.type === "standard" && (
              <div className="mt-3 pt-3 border-t border-[#2a2a36] flex gap-2 items-center flex-wrap">
                <span className="text-[#9aa0a6] text-xs">
                  Участников:
                </span>
                <select
                  value={b.slots ?? 8}
                  onChange={(e) => {
                    const v = +e.target.value as 4 | 8 | 16 | 32;
                    updateBoard(b.id, { slots: v });
                    regenerateStandardMatches(b.id, v);
                  }}
                  className="bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                >
                  <option value={4}>4</option>
                  <option value={8}>8</option>
                  <option value={16}>16</option>
                  <option value={32}>32</option>
                </select>
                <span className="text-[#666] text-xs">
                  (изменишь — пересоберёт сетку)
                </span>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-[#2a2a36] flex gap-2 flex-wrap">
              <button
                onClick={() => addParticipationsForBoard(b.id)}
                className="bg-transparent text-[#00a3ff] border border-[#00a3ff] px-3 py-1.5 rounded-md text-xs cursor-pointer hover:bg-[#00a3ff] hover:text-[#002233] transition-colors"
              >
                + Подкинуть всех бойцов в участия
              </button>
              <span className="text-[#666] text-xs self-center">
                Участий:{" "}
                {participations.filter((p) => p.boardId === b.id).length}
                · Матчей: {matches.filter((m) => m.boardId === b.id).length}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addBoard}
        className="mt-4 bg-[#8b0033] text-white font-bold px-4 py-2.5 rounded-lg cursor-pointer border-none hover:opacity-90"
      >
        + Создать новую сетку
      </button>
    </div>
  );
}