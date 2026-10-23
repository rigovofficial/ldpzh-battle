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
  users, season: seasonProp, maintenance: maintenanceProp, maintenanceConfig: maintenanceConfigProp, versionName: versionNameProp,
  tracks: tracksProp, style: styleProp, registrations,
  onSave, onDeleteUser, onPatchUser, onApproveReg, onClose,
}: {
  news: NewsItem[]; archive: ArchiveConfig; matches: Match[]; fighters: Fighter[]; users: User[];
  season: Season; maintenance: boolean; maintenanceConfig: any; versionName: string;
  tracks: Track[]; style: StyleConfig; registrations: any[];
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
  const [draftMaintConfig, setDraftMaintConfig] = useState(maintenanceConfigProp || { title: "ТЕХРАБОТЫ", subtitle: "ЗАХОДИ ПОЗЖЕ", imageUrl: "" });
  const [draftVersion, setDraftVersion] = useState(versionNameProp || "1.0");
  const [draftTracks, setDraftTracks] = useState<Track[]>(JSON.parse(JSON.stringify(tracksProp)));
  const [draftStyle, setDraftStyle] = useState<StyleConfig>(JSON.parse(JSON.stringify(styleProp)));

  useEffect(() => {
    if (draftSeason && !draftSeason.registration) {
      setDraftSeason(prev => ({ ...prev, registration: { enabled: true, buttonText: "ЗАПИСАТЬСЯ НА БАТЛ", buttonColor: "#8b0033" } }));
    }
  }, [draftSeason]);

  const dirty = JSON.stringify({ news: draftNews, archive: draftArchive, matches: draftMatches, fighters: draftFighters, season: draftSeason, maintenance: draftMaintenance, maintConfig: draftMaintConfig, version: draftVersion, tracks: draftTracks, style: draftStyle }) !==
                JSON.stringify({ news: newsProp, archive: archiveProp, matches: matchesProp, fighters: fightersProp, season: seasonProp, maintenance: maintenanceProp, maintConfig: maintenanceConfigProp, version: versionNameProp, tracks: tracksProp, style: styleProp });

  async function handleSave() {
    setSaving(true);
    try { 
      await onSave({ 
        news: draftNews, archive: draftArchive, matches: draftMatches, fighters: draftFighters, 
        season: draftSeason, maintenance: draftMaintenance, maintenanceConfig: draftMaintConfig, 
        versionName: draftVersion, tracks: draftTracks, style: draftStyle 
      }); 
    } finally { setSaving(false); }
  }

  function handleCancel() {
    setDraftNews(JSON.parse(JSON.stringify(newsProp))); setDraftArchive(JSON.parse(JSON.stringify(archiveProp)));
    setDraftMatches(JSON.parse(JSON.stringify(matchesProp))); setDraftFighters(JSON.parse(JSON.stringify(fightersProp)));
    setDraftSeason(JSON.parse(JSON.stringify(seasonProp))); setDraftMaintenance(maintenanceProp);
    setDraftMaintConfig(JSON.parse(JSON.stringify(maintenanceConfigProp))); setDraftVersion(versionNameProp);
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
          
          {tab === "news" && (
            <NewsTab news={draftNews} archive={draftArchive} 
              onChangeNews={(id: string, patch: any) => setDraftNews(prev => prev.map((n: any) => n.id === id ? { ...n, ...patch } : n))} 
              onRemoveNews={(id: string) => { if (confirm("Удалить?")) setDraftNews(prev => prev.filter((n: any) => n.id !== id)); }} 
              onAddNews={() => setDraftNews(prev => [...prev, { id: "n_" + Date.now(), title: "НОВОСТЬ", subtitle: "подпись", url: "https://", bgColor: "#8b0033", borderColor: "#00a3ff", textColor: "#ffffff", enabled: true }])} 
              onChangeArchive={(patch: any) => setDraftArchive(prev => ({ ...prev, ...patch }))} 
            />
          )}

          {tab === "bracket" && (
            <BracketTab matches={draftMatches} fighters={draftFighters} setMatches={setDraftMatches} setFighters={setDraftFighters} createFighter={createFighter} />
          )}

          {tab === "season" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Сезон</h3>
                <div className="flex flex-col gap-3 max-w-[720px]">
                  <Field label="Название"><input type="text" value={draftSeason.title} onChange={(e: any) => setDraftSeason({...draftSeason, title: e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-3 py-2" /></Field>
                  <Field label="Номер"><input type="number" value={draftSeason.number} onChange={(e: any) => setDraftSeason({...draftSeason, number: +e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-3 py-2" /></Field>
                </div>
              </div>
              
              <div className="border-t border-[#2a2a36] pt-6">
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Кнопка записи</h3>
                <div className="flex flex-col gap-4 max-w-[720px] p-4 bg-[#1d1d27] rounded-xl border border-[#333]">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draftSeason.registration?.enabled ?? false} onChange={(e: any) => setDraftSeason({...draftSeason, registration: {...(draftSeason.registration || {}), enabled: e.target.checked}})} className="w-4 h-4 accent-[#8b0033]" /> Включить</label>
                  <Field label="Текст"><input type="text" value={draftSeason.registration?.buttonText ?? ""} onChange={(e: any) => setDraftSeason({...draftSeason, registration: {...(draftSeason.registration || {}), buttonText: e.target.value}})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></Field>
                  <Field label="Цвет"><input type="color" value={draftSeason.registration?.buttonColor ?? "#8b0033"} onChange={(e: any) => setDraftSeason({...draftSeason, registration: {...(draftSeason.registration || {}), buttonColor: e.target.value}})} className="w-16 h-8 bg-transparent border border-[#333] rounded" /></Field>
                </div>
              </div>

              <div className="border-t border-[#2a2a36] pt-6">
                <h3 className="text-[#ff2b2b] text-sm uppercase tracking-widest mb-4">Техработы (Глушилка)</h3>
                <div className="flex flex-col gap-4 max-w-[720px] p-4 bg-[#1d1d27] rounded-xl border border-[#333]">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draftMaintenance} onChange={(e: any) => setDraftMaintenance(e.target.checked)} className="w-4 h-4 accent-[#ff2b2b]" /> Включить техработы</label>
                  <Field label="Заголовок глушилки"><input type="text" value={draftMaintConfig.title} onChange={(e: any) => setDraftMaintConfig({...draftMaintConfig, title: e.target.value})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></Field>
                  <Field label="Подзаголовок глушилки"><input type="text" value={draftMaintConfig.subtitle} onChange={(e: any) => setDraftMaintConfig({...draftMaintConfig, subtitle: e.target.value})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></Field>
                  <Field label="Ссылка на картинку (Маркин)"><input type="url" value={draftMaintConfig.imageUrl} onChange={(e: any) => setDraftMaintConfig({...draftMaintConfig, imageUrl: e.target.value})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></Field>
                </div>
              </div>

              <div className="border-t border-[#2a2a36] pt-6">
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Версия сайта</h3>
                <Field label="Название версии"><input type="text" value={draftVersion} onChange={(e: any) => setDraftVersion(e.target.value)} className="w-full max-w-[720px] bg-[#1d1d27] text-white border border-[#333] rounded px-3 py-2" /></Field>
              </div>
            </div>
          )}

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
                        <td className="py-3"><button onClick={() => onApproveReg(r.id, r.user_id, r.desired_nickname)} className="bg-[#35d07f] text-[#062a16] px-3 py-1 rounded font-bold hover:opacity-90">Одобрить</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "users" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Юзеры</h3>
                <div className="flex flex-col gap-3">
                  {users.map((u: any) => (
                    <div key={u.id} className="bg-[#1d1d27] rounded-xl p-4 border border-[#2a2a36] flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold">{u.displayName} <span className="text-[#666] font-mono text-xs">({u.login})</span></div>
                        <div className="text-[#00a3ff] text-xs mt-1">{u.role}</div>
                      </div>
                      <div className="flex gap-2">
                        <select value={u.role} onChange={(e: any) => onPatchUser(u.id, { role: e.target.value })} className="bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs">
                          <option value="user">Юзер</option><option value="participant">Участник</option><option value="admin">Админ</option>
                        </select>
                        <button onClick={() => onDeleteUser(u.id)} className="text-[#ff2b2b] border border-[#ff2b2b] px-2 py-1 rounded text-xs hover:bg-[#ff2b2b] hover:text-white">🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-[#2a2a36] pt-6">
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Бойцы</h3>
                <div className="flex flex-col gap-2">
                  {draftFighters.map((f: any) => (
                    <div key={f.id} className="flex gap-2 items-center bg-[#1d1d27] p-2 rounded">
                      <input type="text" value={f.name} onChange={(e: any) => setDraftFighters((prev: any) => prev.map((x: any) => x.id === f.id ? { ...x, name: e.target.value } : x))} className="flex-1 bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" />
                      <button onClick={() => setDraftFighters((prev: any) => prev.filter((x: any) => x.id !== f.id))} className="text-[#ff2b2b] px-2 py-1 rounded text-xs">🗑</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "matches" && (
            <div className="flex flex-col gap-3">
              <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-2">Матчи</h3>
              {[...draftMatches].sort((a: any, b: any) => a.round - b.round || a.index - b.index).map((m: any) => (
                <div key={m.id} className="bg-[#1d1d27] border border-[#2a2a36] rounded p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm">Раунд {m.round} · Матч {m.index}</span>
                    <label className="flex items-center gap-2 text-xs text-[#ff4500] font-bold">
                      <input type="checkbox" checked={m.isFire || false} onChange={(e: any) => setDraftMatches((prev: any) => prev.map((x: any) => x.id === m.id ? { ...x, isFire: e.target.checked } : x))} className="w-4 h-4 accent-[#ff4500]" />
                      🔥 ОГОНЬ
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="Статус"><select value={m.status} onChange={(e: any) => setDraftMatches((prev: any) => prev.map((x: any) => x.id === m.id ? { ...x, status: e.target.value } : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs"><option value="pending">Ожидание</option><option value="betting_open">Ставки</option><option value="tracks_open">Треки</option><option value="judging">Суд</option><option value="completed">Готово</option></select></Field>
                    <Field label="Балл 1"><input type="number" value={m.score1 ?? ""} onChange={(e: any) => setDraftMatches((prev: any) => prev.map((x: any) => x.id === m.id ? { ...x, score1: e.target.value === "" ? null : +e.target.value } : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" /></Field>
                    <Field label="Балл 2"><input type="number" value={m.score2 ?? ""} onChange={(e: any) => setDraftMatches((prev: any) => prev.map((x: any) => x.id === m.id ? { ...x, score2: e.target.value === "" ? null : +e.target.value } : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" /></Field>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "tracks" && (
            <div>
              <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Треки</h3>
              {draftTracks.map((t: any) => (
                <div key={t.id} className="bg-[#1d1d27] p-3 rounded mb-2 flex gap-2 items-center">
                  <select value={t.fighterId} onChange={(e: any) => setDraftTracks((prev: any) => prev.map((x: any) => x.id === t.id ? { ...x, fighterId: e.target.value } : x))} className="bg-[#14141c] text-white text-xs px-2 py-1 rounded">
                    {draftFighters.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <select value={t.matchId} onChange={(e: any) => setDraftTracks((prev: any) => prev.map((x: any) => x.id === t.id ? { ...x, matchId: e.target.value } : x))} className="bg-[#14141c] text-white text-xs px-2 py-1 rounded">
                    {draftMatches.map((m: any) => <option key={m.id} value={m.id}>R{m.round}M{m.index}</option>)}
                  </select>
                  <input type="url" value={t.url} onChange={(e: any) => setDraftTracks((prev: any) => prev.map((x: any) => x.id === t.id ? { ...x, url: e.target.value } : x))} className="flex-1 bg-[#14141c] text-white text-xs px-2 py-1 rounded" />
                  <button onClick={() => { if (confirm("Удалить?")) setDraftTracks((prev: any) => prev.filter((x: any) => x.id !== t.id)) }} className="text-[#ff2b2b] text-xs">🗑</button>
                </div>
              ))}
              <div className="mt-4 flex gap-2 items-center">
                <select id="newTrackFighter" className="bg-[#1d1d27] text-white text-xs p-2 rounded"><option value="">Боец</option>{draftFighters.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
                <select id="newTrackMatch" className="bg-[#1d1d27] text-white text-xs p-2 rounded"><option value="">Матч</option>{draftMatches.map((m: any) => <option key={m.id} value={m.id}>R{m.round}M{m.index}</option>)}</select>
                <input type="url" id="newTrackUrl" placeholder="URL" className="flex-1 bg-[#1d1d27] text-white text-xs p-2 rounded" />
                <button onClick={() => { 
                  const f = (document.getElementById("newTrackFighter") as HTMLSelectElement).value;
                  const m = (document.getElementById("newTrackMatch") as HTMLSelectElement).value;
                  const u = (document.getElementById("newTrackUrl") as HTMLInputElement).value;
                  if (f && m && u) { setDraftTracks((prev: any) => [...prev, { id: "t_" + Date.now(), matchId: m, fighterId: f, url: u, isPublished: false, score: null }]); (document.getElementById("newTrackUrl") as HTMLInputElement).value = ""; }
                }} className="bg-[#8b0033] text-white text-xs px-3 py-2 rounded">Добавить</button>
              </div>
            </div>
          )}

          {tab === "style" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-2">Стили</h3>
              <div className="grid grid-cols-2 gap-4 max-w-[720px]">
                <ColorField label="Primary" value={draftStyle.primary} onChange={(v: any) => setDraftStyle({...draftStyle, primary: v})} />
                <ColorField label="Accent" value={draftStyle.accent} onChange={(v: any) => setDraftStyle({...draftStyle, accent: v})} />
              </div>
              <label className="flex items-center gap-2 mt-4 text-sm"><input type="checkbox" checked={draftStyle.grayscale === 1} onChange={(e: any) => setDraftStyle({...draftStyle, grayscale: e.target.checked ? 1 : 0})} /> ЧБ-фильтр</label>
            </div>
          )}

          {tab === "backup" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Экспорт</h3>
                <button onClick={() => {
                  const data = { version: 2, exportedAt: new Date().toISOString(), season: draftSeason, maintenance: draftMaintenance, news: draftNews, archive: draftArchive, matches: draftMatches, fighters: draftFighters, users, tracks: draftTracks, style: draftStyle };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `backup.json`; a.click();
                }} className="bg-[#8b0033] text-white font-bold px-4 py-2 rounded hover:opacity-90">💾 Скачать JSON</button>
              </div>
              <div className="border-t border-[#2a2a36] pt-6">
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Импорт</h3>
                <label className="inline-block bg-[#ff2b2b] text-white font-bold px-4 py-2 rounded cursor-pointer hover:opacity-90">
                  📂 Загрузить JSON
                  <input type="file" accept=".json,application/json" onChange={(e: any) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    if (!confirm("Импорт перезапишет данные в черновике. Продолжить?")) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try { const d = JSON.parse(ev.target?.result as string);
                        setDraftNews(d.news); setDraftArchive(d.archive); setDraftMatches(d.matches); setDraftFighters(d.fighters); setDraftSeason(d.season); setDraftTracks(d.tracks); setDraftStyle(d.style); setDraftMaintenance(d.maintenance);
                        alert("Импорт выполнен. Нажми Сохранить!");
                      } catch { alert("Ошибка чтения"); }
                    }; reader.readAsText(file); e.target.value = "";
                  }} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0b0b0f] border-t border-[#2a2a36] px-4 md:px-6 py-3 z-10">
        <div className="max-w-[1280px] mx-auto flex gap-2.5 items-center flex-wrap">
          <button onClick={handleSave} disabled={!dirty || saving} className={`font-extrabold px-4 py-2.5 rounded-lg border-none ${dirty && !saving ? "bg-[#35d07f] text-[#062a16]" : "bg-[#2a2a36] text-[#666]"}`}>{saving ? "Сохраняю..." : "💾 Сохранить изменения"}</button>
          <button onClick={handleCancel} disabled={!dirty} className={`bg-transparent border px-4 py-2.5 rounded-lg ${dirty ? "text-[#9aa0a6] border-[#333]" : "text-[#444] border-[#222]"}`}>Отменить</button>
          <span className="text-[#ffb020] text-xs ml-auto">{dirty ? "Правки применяются только после «Сохранить»" : "Все изменения сохранены"}</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: any) {
  return <label className={`flex flex-col gap-1 ${className}`}><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">{label}</span>{children}</label>;
}

function ColorField({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[#9aa0a6] text-xs uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e: any) => onChange(e.target.value)} className="w-8 h-8 bg-transparent border border-[#333] rounded cursor-pointer" />
        <input type="text" value={value} onChange={(e: any) => onChange(e.target.value)} className="flex-1 bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs font-mono" />
      </div>
    </div>
  );
}