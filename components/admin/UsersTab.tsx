"use client";

import type { Fighter, User } from "@/lib/types";
import { roleLabel } from "@/lib/labels";

export default function UsersTab({
  users,
  fighters,
  setFighters,
  onDeleteUser,
  onPatchUser,
}: {
  users: User[];
  fighters: Fighter[];
  setFighters: React.Dispatch<React.SetStateAction<Fighter[]>>;
  onDeleteUser: (userId: string) => Promise<void>;
  onPatchUser: (userId: string, patch: any) => Promise<void>;
}) {
  const realUsers = users.filter((u) => u.role !== "anonymous");

  function updateFighter(id: string, patch: Partial<Fighter>) {
    setFighters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  }

  function unlinkFighter(fighterId: string) {
    setFighters((prev) =>
      prev.map((f) => (f.id === fighterId ? { ...f, userId: null } : f))
    );
  }

  function linkFighter(fighterId: string, userId: string) {
    setFighters((prev) =>
      prev.map((f) => (f.id === fighterId ? { ...f, userId } : f))
    );
  }

  function addFighter() {
    const name = prompt("Имя нового бойца (ника):");
    if (!name || !name.trim()) return;
    const newId =
      "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    setFighters((prev) => [
      ...prev,
      {
        id: newId,
        name: name.trim(),
        userId: null,
        totalScore: 0,
      },
    ]);
  }

  function deleteFighter(fighterId: string, name: string) {
    if (!confirm(`Удалить бойца «${name}»?`)) return;
    setFighters((prev) => prev.filter((f) => f.id !== fighterId));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">
          Пользователи ({realUsers.length})
        </h3>
        <p className="text-[#9aa0a6] text-xs mb-4">
          Роль, имя и боевой ник меняются сразу на сервере. Привязка к никам —
          черновик, сохраняется по кнопке внизу.
        </p>

        <div className="flex flex-col gap-3">
          {realUsers.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              fighters={fighters}
              onPatch={(patch) => onPatchUser(u.id, patch)}
              onDelete={() => {
                if (
                  !confirm(
                    `Удалить юзера «${u.displayName}» (${u.login}) полностью?`
                  )
                )
                  return;
                onDeleteUser(u.id);
              }}
              onUnlink={(fid) => unlinkFighter(fid)}
              onLink={(fid) => linkFighter(fid, u.id)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">
          Бойцы (глобальные ники) — {fighters.length}
        </h3>
        <p className="text-[#9aa0a6] text-xs mb-4">
          Один ник может быть привязан к одному юзеру. Один юзер — к
          нескольким никам. Ник может участвовать в любом количестве сеток
          одновременно.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-[#9aa0a6] text-[11px] uppercase tracking-widest">
                <th className="text-left py-2 pr-3 font-semibold">ID</th>
                <th className="text-left py-2 pr-3 font-semibold">Ник</th>
                <th className="text-left py-2 pr-3 font-semibold">
                  Общий счёт
                </th>
                <th className="text-left py-2 pr-3 font-semibold">Владелец</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {fighters.map((f) => {
                const owner = f.userId
                  ? users.find((u) => u.id === f.userId)
                  : null;
                return (
                  <tr key={f.id} className="border-t border-[#2a2a36]">
                    <td className="py-2 pr-3 font-mono text-xs text-[#666]">
                      {f.id}
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={f.name}
                        onChange={(e) =>
                          updateFighter(f.id, { name: e.target.value })
                        }
                        className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        value={f.totalScore}
                        onChange={(e) =>
                          updateFighter(f.id, {
                            totalScore: +e.target.value || 0,
                          })
                        }
                        className="w-20 bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                      />
                    </td>
                    <td className="py-2 pr-3 text-[#9aa0a6] text-xs">
                      {owner ? (
                        <span className="text-[#00a3ff]">
                          {owner.displayName}
                        </span>
                      ) : (
                        <span className="text-[#666]">— свободен —</span>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <button
                        onClick={() => deleteFighter(f.id, f.name)}
                        title="Удалить бойца"
                        className="bg-transparent text-[#ff2b2b] border border-[#ff2b2b] w-7 h-7 rounded-md cursor-pointer text-xs hover:bg-[#ff2b2b] hover:text-white transition-colors"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          onClick={addFighter}
          className="mt-4 bg-[#8b0033] text-white font-bold px-4 py-2.5 rounded-lg cursor-pointer border-none hover:opacity-90"
        >
          + Создать нового бойца
        </button>
      </div>
    </div>
  );
}

function UserRow({
  user,
  fighters,
  onPatch,
  onDelete,
  onUnlink,
  onLink,
}: {
  user: User;
  fighters: Fighter[];
  onPatch: (patch: any) => void;
  onDelete: () => void;
  onUnlink: (fighterId: string) => void;
  onLink: (fighterId: string) => void;
}) {
  const linked = fighters.filter((f) => f.userId === user.id);
  const freeFighters = fighters.filter((f) => !f.userId);

  return (
    <div className="bg-[#1d1d27] rounded-xl p-4 border border-[#2a2a36]">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex flex-col gap-1 min-w-[140px]">
          <div className="text-xs text-[#9aa0a6] uppercase tracking-widest">
            Логин
          </div>
          <div className="text-sm font-mono">{user.login}</div>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px] flex-1">
          <div className="text-xs text-[#9aa0a6] uppercase tracking-widest">
            Отображаемое имя
          </div>
          <input
            type="text"
            defaultValue={user.displayName}
            onBlur={(e) => {
              if (e.target.value !== user.displayName)
                onPatch({ displayName: e.target.value });
            }}
            className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <div className="text-xs text-[#9aa0a6] uppercase tracking-widest">
            Роль
          </div>
          <select
            value={user.role}
            onChange={(e) => onPatch({ role: e.target.value })}
            className="bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
          >
            <option value="user">{roleLabel.user}</option>
            <option value="participant">{roleLabel.participant}</option>
            <option value="admin">{roleLabel.admin}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px] flex-1">
          <div className="text-xs text-[#9aa0a6] uppercase tracking-widest">
            Боевой ник
          </div>
          <input
            type="text"
            defaultValue={user.battleNickname ?? ""}
            placeholder="—"
            onBlur={(e) => {
              const v = e.target.value || null;
              if (v !== user.battleNickname) onPatch({ battleNickname: v });
            }}
            className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-xs text-[#9aa0a6] uppercase tracking-widest">
            &nbsp;
          </div>
          <button
            onClick={onDelete}
            className="bg-transparent text-[#ff2b2b] border border-[#ff2b2b] px-3 py-1 rounded-md text-xs cursor-pointer hover:bg-[#ff2b2b] hover:text-white transition-colors"
          >
            🗑 Удалить
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#2a2a36]">
        <div className="text-xs text-[#9aa0a6] uppercase tracking-widest mb-2">
          Привязанные ники ({linked.length})
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {linked.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-1.5 bg-[#14141c] border border-[#00a3ff] rounded-full pl-3 pr-1 py-1 text-xs"
            >
              <span className="text-[#00a3ff] font-bold">{f.name}</span>
              <button
                onClick={() => onUnlink(f.id)}
                title="Отвязать"
                className="w-5 h-5 flex items-center justify-center rounded-full bg-transparent text-[#ff2b2b] border-none cursor-pointer hover:bg-[#ff2b2b] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          ))}

          {freeFighters.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) onLink(e.target.value);
                e.target.value = "";
              }}
              className="bg-[#14141c] text-[#00a3ff] border border-dashed border-[#00a3ff] rounded-full px-3 py-1 text-xs cursor-pointer outline-none"
            >
              <option value="">+ привязать ник</option>
              {freeFighters.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}