"use client";

import { useState, useEffect } from "react";
import type { NewsItem, ArchiveConfig, Match, Fighter, User, Season, Track, StyleConfig } from "@/lib/types";
import { matchStatusLabel, roleLabel } from "@/lib/labels";
import { regenerateBracket, resizeFighterPool } from "@/lib/bracket-utils";

const TABS = [
  { id: "news", label: "📰 Новости" },
  { id: "bracket", label: "🥊 Сетка" },
  { id: "season", label: "📅 Сезон" },
  { id: "registrations", label: "📝 Записи" },
  { id: "users", label: "👥 Юзеры" },
  { id: "matches", label: "⚔ Матчи" },
  { id: "tracks", label: "🎵 Треки" },
  { id: "style", label: "🎨 Стили" },
  { id: "backup", label: "💾 Бэкап" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminOverlay({
  news: newsProp, archive: archiveProp, matches: matchesProp, fighters: fightersProp,
  users, season: seasonProp, maintenance: maintenanceProp, tracks: tracksProp, style: styleProp, registrations,
  onSave, onDeleteUser, onPatchUser, onApproveReg, onClose,
}: {
  news: NewsItem[]; archive: ArchiveConfig; matches: Match[]; fighters: Fighter[]; users: User[];
  season: Season; maintenance: boolean; tracks: Track[]; style: StyleConfig; registrations: any[];
  onSave: (payload: any) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onPatchUser: (userId: string, patch: any) => Promise<void>;
  onApproveReg: (regId: string, userId: string, nickname: string) => Promise<void>;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabId>("news");
  const [saving, setSaving] = useState(false);

  const [draftNews, setDraftNews] = useState<NewsItem[]>(JSON.parse(JSON.stringify(newsProp)));
  const [draftArchive, setDraftArchive] = useState<ArchiveConfig>(JSON.parse(JSON.stringify(archiveProp)));
  const [draftMatches, setDraftMatches] = useState<Match[]>(JSON.parse(JSON.stringify(matchesProp)));
  const [draftFighters, setDraftFighters] = useState<Fighter[]>(JSON.parse(JSON.stringify(fightersProp)));
  const [draftSeason, setDraftSeason] = useState<Season>(JSON.parse(JSON.stringify(seasonProp)));
  const [draftMaintenance, setDraftMaintenance] = useState(maintenanceProp);
  const [draftTracks, setDraftTracks] = useState<Track[]>(JSON.parse(JSON.stringify(tracksProp)));
  const [draftStyle, setDraftStyle] = useState<StyleConfig>(JSON.parse(JSON.stringify(styleProp)));

  const dirty = JSON.stringify({ news: draftNews, archive: draftArchive, matches: draftMatches, fighters: draftFighters, season: draftSeason, maintenance: draftMaintenance, tracks: draftTracks, style: draftStyle }) !==
                JSON.stringify({ news: newsProp, archive: archiveProp, matches: matchesProp, fighters: fightersProp, season: seasonProp, maintenance: maintenanceProp, tracks: tracksProp, style: styleProp });

  async function handleSave() {
    setSaving(true);
    try { await onSave({ news: draftNews, archive: draftArchive, matches: draftMatches, fighters: draftFighters, season: draftSeason, maintenance: draftMaintenance, tracks: draftTracks, style: draftStyle }); }
    finally { setSaving(false); }
  }

  function handleCancel() {
    setDraftNews(JSON.parse(JSON.stringify(newsProp))); setDraftArchive(JSON.parse(JSON.stringify(archiveProp)));
    setDraftMatches(JSON.parse(JSON.stringify(matchesProp))); setDraftFighters(JSON.parse(JSON.stringify(fightersProp)));
    setDraftSeason(JSON.parse(JSON.stringify(seasonProp))); setDraftMaintenance(maintenanceProp);
    setDraftTracks(JSON.parse(JSON.stringify(tracksProp))); setDraftStyle(JSON.parse(JSON.stringify(styleProp)));
  }

  function handleClose() { if (dirty && !confirm("Закрыть без сохранения?")) return; onClose(); }
  function createFighter(name: string): string {
    const newId = "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    setDraftFighters((prev) => [...prev, { id: newId, name, userId: null, prevScore: 0, totalScore: 0 }]);
    return newId;
  }

  return (
    <div className="fixed inset-0 bg-[#0b0b0f] z-50 overflow-y-auto p-4 md:p-6">
      <div className="max-w-[1280px] mx-auto pb-32">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#00a3ff] flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-black uppercase tracking-wide m-0">🛠 Админ-панель</h2>
            <span className="px-2.5 py-1 rounded-full bg-[#35d07f] text-[#062a16] font-extrabold text-[11px] tracking-widest uppercase">Режим организатора</span>
            {dirty && <span className="px-2.5 py-1 rounded-full bg-[#ffb020] text-[#2a1c00] font-extrabold text-[11px] tracking-widest uppercase">● Есть правки</span>}
          </div>
          <button onClick={handleClose} className="bg-[#ff2b2b] text-white px-4 py-2 rounded-lg cursor-pointer font-extrabold text-[13px] border-none hover:opacity-90">✕ Закрыть</button>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-4">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3.5 py-2 rounded-lg cursor-pointer text-[13px] border transition-colors ${tab === t.id ? "bg-[#8b0033] text-white border-[#00a3ff]" : "bg-[#1d1d27] text-[#f5f5f5] border-transparent hover:border-[#333]"}`}>{t.label}</button>
          ))}
        </div>

        <div className="bg-[#14141c] border border-[#00a3ff] rounded-2xl p-5 min-h-[400px]">
          
          {/* ВКЛАДКА ЗАПИСИ */}
          {tab === "registrations" && (
            <div>
              <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Заявки на участие</h3>
              {registrations.length === 0 ? <div className="text-[#9aa0a6]">Нет активных заявок.</div> : (
                <table className="w-full text-[13px] border-collapse">
                  <thead><tr className="text-[#9aa0a6] text-[11px] uppercase tracking-widest"><th className="text-left py-2">Юзернейм (ID)</th><th className="text-left py-2">Желаемый ник</th><th className="text-left py-2">Действие</th></tr></thead>
                  <tbody>
                    {registrations.map((r: any) => (
                      <tr key={r.id} className="border-t border-[#2a2a36]">
                        <td className="py-3">{r.user_id}</td>
                        <td className="py-3 font-bold text-white">{r.desired_nickname}</td>
                        <td className="py-3"><button onClick={() => onApproveReg(r.id, r.user_id, r.desired_nickname)} className="bg-[#35d07f] text-[#062a16] px-3 py-1 rounded font-bold hover:opacity-90">Одобрить и сделать бойцом</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ВКЛАДКА СЕЗОН (с настройками кнопки) */}
          {tab === "season" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Параметры сезона</h3>
                <div className="flex flex-col gap-3 max-w-[720px]">
                  <Field label="Название"><input type="text" value={draftSeason.title} onChange={(e) => setDraftSeason({...draftSeason, title: e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none" /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Номер"><input type="number" value={draftSeason.number} onChange={(e) => setDraftSeason({...draftSeason, number: +e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none" /></Field>
                    <Field label="Тип"><select value={draftSeason.type} onChange={(e) => setDraftSeason({...draftSeason, type: e.target.value as any})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none"><option value="official">Официальный</option><option value="intermediate">Промежуточный</option></select></Field>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#2a2a36] pt-6">
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Кнопка "Записаться"</h3>
                <div className="flex flex-col gap-4 max-w-[720px] p-4 bg-[#1d1d27] rounded-xl border border-[#333]">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={draftSeason.registration?.enabled ?? false} onChange={(e) => setDraftSeason({...draftSeason, registration: {...draftSeason.registration!, enabled: e.target.checked}})} className="w-4 h-4 accent-[#8b0033]" />
                    Включить приём заявок
                  </label>
                  <Field label="Текст кнопки"><input type="text" value={draftSeason.registration?.buttonText ?? ""} onChange={(e) => setDraftSeason({...draftSeason, registration: {...draftSeason.registration!, buttonText: e.target.value}})} className="w-full bg-[#14141c] text-white border border-[#333] rounded-lg px-3 py-2 outline-none" /></Field>
                  <Field label="Цвет кнопки"><input type="color" value={draftSeason.registration?.buttonColor ?? "#8b0033"} onChange={(e) => setDraftSeason({...draftSeason, registration: {...draftSeason.registration!, buttonColor: e.target.value}})} className="w-16 h-8 bg-transparent border border-[#333] rounded cursor-pointer" /></Field>
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА МАТЧИ (с чекбоксом огня) */}
          {tab === "matches" && (
            <div className="flex flex-col gap-3">
              <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-2">Матчи</h3>
              {[...draftMatches].sort((a,b)=>a.round-b.round||a.index-b.index).map(m => (
                <div key={m.id} className="bg-[#1d1d27] border border-[#2a2a36] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm">Раунд {m.round} · Матч {m.index}</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#ff4500]">
                      <input type="checkbox" checked={m.isFire || false} onChange={e => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, isFire: e.target.checked} : x))} className="w-4 h-4 accent-[#ff4500]" />
                      🔥 ОГНЕННЫЙ ПОЕДИНОК
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Статус"><select value={m.status} onChange={e => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, status: e.target.value as any} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs"><option value="pending">Ожидание</option><option value="betting_open">Ставки</option><option value="tracks_open">Треки</option><option value="judging">Суд</option><option value="completed">Готово</option></select></Field>
                    <Field label="Балл 1"><input type="number" value={m.score1 ?? ""} onChange={e => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, score1: e.target.value === "" ? null : +e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs" /></Field>
                    <Field label="Балл 2"><input type="number" value={m.score2 ?? ""} onChange={e => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, score2: e.target.value === "" ? null : +e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs" /></Field>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ... ОСТАЛЬНЫЕ ВКЛАДКИ (Юзеры, Треки, Бэкап, Сетка) ОСТАВЬ КАК БЫЛО ИЗ ПРЕДЫДУЩЕГО ФАЙЛА ... */}
          {/* Для экономии места я их пропустил, но в твоем файле они должны быть! */}
          
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b0b0f] border-t border-[#2a2a36] px-4 md:px-6 py-3 z-10">
        <div className="max-w-[1280px] mx-auto flex gap-2.5 items-center flex-wrap">
          <button onClick={handleSave} disabled={!dirty || saving} className={`font-extrabold px-4 py-2.5 rounded-lg border-none ${dirty && !saving ? "bg-[#35d07f] text-[#062a16]" : "bg-[#2a2a36] text-[#666]"}`}>{saving ? "Сохраняю..." : "💾 Сохранить изменения"}</button>
          <button onClick={handleCancel} disabled={!dirty} className={`bg-transparent border px-4 py-2.5 rounded-lg ${dirty ? "text-[#9aa0a6] border-[#333]" : "text-[#444] border-[#222]"}`}>Отменить</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">{label}</span>{children}</label>;
}