"use client";

import type { User, Fighter } from "@/lib/types";

export default function AdminUsersTab({
  users, draftFighters, setDraftFighters, draftActiveBracket, onDeleteUser, onPatchUser
}: {
  users: User[];
  draftFighters: Fighter[];
  setDraftFighters: React.Dispatch<React.SetStateAction<Fighter[]>>;
  draftActiveBracket: string;
  onDeleteUser: (id: string) => Promise<void>;
  onPatchUser: (id: string, patch: any) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Юзеры</h3>
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div key={u.id} className="bg-[#1d1d27] rounded-xl p-4 border border-[#2a2a36]">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="text-sm font-bold">{u.displayName} <span className="text-[#666] font-mono text-xs">({u.login})</span></div>
                  <div className="text-[#00a3ff] text-xs mt-1">{u.role} · {u.predictionsPoints || 0} 🔮</div>
                </div>
                <div className="flex gap-2">
                  <select value={u.role} onChange={(e) => onPatchUser(u.id, { role: e.target.value })} className="bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs">
                    <option value="user">Юзер</option><option value="participant">Участник</option><option value="admin">Админ</option>
                  </select>
                  <button onClick={() => onDeleteUser(u.id)} className="text-[#ff2b2b] border border-[#ff2b2b] px-2 py-1 rounded text-xs hover:bg-[#ff2b2b] hover:text-white">🗑</button>
                </div>
              </div>

              {/* БЛОК ПРИВЯЗКИ БОЙЦОВ */}
              <div className="flex flex-wrap gap-2 items-center text-xs bg-[#14141c] p-2 rounded border border-[#333]">
                <span className="text-[#9aa0a6] uppercase tracking-widest text-[10px]">Привязанные бойцы:</span>
                {draftFighters.filter(f => f.userId === u.id).map(f => (
                  <span key={f.id} className="bg-[#1d1d27] border border-[#00a3ff] rounded px-2 py-1 flex items-center gap-2 text-[#00a3ff]">
                    {f.name}
                    <button onClick={() => setDraftFighters(prev => prev.map(x => x.id === f.id ? {...x, userId: null} : x))} className="text-[#ff2b2b] font-bold">✕</button>
                  </span>
                ))}
                <select 
                  onChange={(e) => {
                    const fId = e.target.value;
                    if(!fId) return;
                    setDraftFighters(prev => prev.map(x => x.id === fId ? {...x, userId: u.id} : x));
                    e.target.value = "";
                  }} 
                  className="bg-[#1d1d27] text-[#00a3ff] border border-dashed border-[#00a3ff] rounded px-2 py-1 cursor-pointer outline-none"
                >
                  <option value="">+ привязать бойца</option>
                  {draftFighters.filter(f => !f.userId && f.bracketId === draftActiveBracket).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}