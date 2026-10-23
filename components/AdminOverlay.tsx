"use client";

import { useState, useEffect } from "react";
import AdminBracketTab from "./AdminBracketTab";
import AdminSeasonTab from "./AdminSeasonTab";
import AdminNewsTab from "./AdminNewsTab";
import AdminTracksTab from "./AdminTracksTab";
import AdminBackupTab from "./AdminBackupTab";
import AdminUsersTab from "./AdminUsersTab";
import AdminMatchesTab from "./AdminMatchesTab";

const TABS = [
  { id: "news", label: "📰 Новости" },
  { id: "bracket", label: "🥊 Сетки" },
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
  brackets: bracketsProp, activeBracketId: activeBracketIdProp,
  users, season: seasonProp, maintenance: maintenanceProp, maintenanceConfig: maintenanceConfigProp, versionName: versionNameProp,
  tracks: tracksProp, style: styleProp, registrations,
  onSave, onDeleteUser, onPatchUser, onApproveReg, onResolveBets, onClose,
}: any) {
  const [tab, setTab] = useState<TabId>("news");
  const [saving, setSaving] = useState(false);

  const [draftNews, setDraftNews] = useState(JSON.parse(JSON.stringify(newsProp)));
  const [draftArchive, setDraftArchive] = useState(JSON.parse(JSON.stringify(archiveProp)));
  const [draftMatches, setDraftMatches] = useState(JSON.parse(JSON.stringify(matchesProp)));
  const [draftFighters, setDraftFighters] = useState(JSON.parse(JSON.stringify(fightersProp)));
  const [draftBrackets, setDraftBrackets] = useState(JSON.parse(JSON.stringify(bracketsProp)));
  const [draftActiveBracket, setDraftActiveBracket] = useState(activeBracketIdProp);
  const [draftSeason, setDraftSeason] = useState(JSON.parse(JSON.stringify(seasonProp)));
  const [draftMaintenance, setDraftMaintenance] = useState(maintenanceProp);
  const [draftMaintConfig, setDraftMaintConfig] = useState(maintenanceConfigProp || { title: "ТЕХРАБОТЫ", subtitle: "ЗАХОДИ ПОЗЖЕ", imageUrl: "" });
  const [draftVersion, setDraftVersion] = useState(versionNameProp || "1.0");
  const [draftTracks, setDraftTracks] = useState(JSON.parse(JSON.stringify(tracksProp)));
  const [draftStyle, setDraftStyle] = useState(JSON.parse(JSON.stringify(styleProp)));

  useEffect(() => {
    setDraftNews(JSON.parse(JSON.stringify(newsProp))); setDraftArchive(JSON.parse(JSON.stringify(archiveProp)));
    setDraftMatches(JSON.parse(JSON.stringify(matchesProp))); setDraftFighters(JSON.parse(JSON.stringify(fightersProp)));
    setDraftBrackets(JSON.parse(JSON.stringify(bracketsProp))); setDraftActiveBracket(activeBracketIdProp);
    setDraftSeason(JSON.parse(JSON.stringify(seasonProp))); setDraftMaintenance(maintenanceProp);
    setDraftMaintConfig(maintenanceConfigProp); setDraftVersion(versionNameProp);
    setDraftTracks(JSON.parse(JSON.stringify(tracksProp))); setDraftStyle(JSON.parse(JSON.stringify(styleProp)));
  }, [newsProp, archiveProp, matchesProp, fightersProp, bracketsProp, activeBracketIdProp, seasonProp, maintenanceProp, maintenanceConfigProp, versionNameProp, tracksProp, styleProp]);

  const dirty = JSON.stringify({ news: draftNews, archive: draftArchive, matches: draftMatches, fighters: draftFighters, brackets: draftBrackets, active: draftActiveBracket, season: draftSeason, maintenance: draftMaintenance, maintConfig: draftMaintConfig, version: draftVersion, tracks: draftTracks, style: draftStyle }) !==
                JSON.stringify({ news: newsProp, archive: archiveProp, matches: matchesProp, fighters: fightersProp, brackets: bracketsProp, active: activeBracketIdProp, season: seasonProp, maintenance: maintenanceProp, maintConfig: maintenanceConfigProp, version: versionNameProp, tracks: tracksProp, style: styleProp });

  async function handleSave() {
    setSaving(true);
    try { await onSave({ news: draftNews, archive: draftArchive, matches: draftMatches, fighters: draftFighters, brackets: draftBrackets, activeBracketId: draftActiveBracket, season: draftSeason, maintenance: draftMaintenance, maintenanceConfig: draftMaintConfig, versionName: draftVersion, tracks: draftTracks, style: draftStyle }); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-[#0b0b0f] z-50 overflow-y-auto p-4 md:p-6">
      <div className="max-w-[1280px] mx-auto pb-32">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#00a3ff] flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-black uppercase tracking-wide m-0">🛠 Админ-панель</h2>
            {dirty && <span className="px-2.5 py-1 rounded-full bg-[#ffb020] text-[#2a1c00] font-extrabold text-[11px] tracking-widest uppercase">● Есть правки</span>}
          </div>
          <button onClick={() => { if (dirty && !confirm("Закрыть без сохранения?")) return; onClose(); }} className="bg-[#ff2b2b] text-white px-4 py-2 rounded-lg cursor-pointer font-extrabold text-[13px] border-none hover:opacity-90">✕ Закрыть</button>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-4">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3.5 py-2 rounded-lg cursor-pointer text-[13px] border transition-colors ${tab === t.id ? "bg-[#8b0033] text-white border-[#00a3ff]" : "bg-[#1d1d27] text-[#f5f5f5] border-transparent hover:border-[#333]"}`}>{t.label}</button>
          ))}
        </div>

        <div className="bg-[#14141c] border border-[#00a3ff] rounded-2xl p-5 min-h-[400px]">
          {tab === "news" && <AdminNewsTab news={draftNews} archive={draftArchive} setNews={setDraftNews} setArchive={setDraftArchive} />}
          
          {tab === "bracket" && (
            <AdminBracketTab matches={draftMatches} fighters={draftFighters} brackets={draftBrackets} activeBracket={draftActiveBracket} setMatches={setDraftMatches} setFighters={setDraftFighters} setBrackets={setDraftBrackets} setActiveBracket={setDraftActiveBracket} />
          )}

          {tab === "season" && (
            <AdminSeasonTab season={draftSeason} setSeason={setDraftSeason} maintenance={draftMaintenance} setMaintenance={setDraftMaintenance} maintConfig={draftMaintConfig} setMaintConfig={setDraftMaintConfig} version={draftVersion} setVersion={setDraftVersion} />
          )}

          {tab === "registrations" && (
             <div>
               <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Заявки на участие</h3>
               {registrations.length === 0 ? <div className="text-[#9aa0a6]">Нет активных заявок.</div> : (
                 <table className="w-full text-[13px] border-collapse">
                   <thead><tr className="text-[#9aa0a6] text-[11px] uppercase tracking-widest"><th className="text-left py-2">ID</th><th className="text-left py-2">Желаемый ник</th><th className="text-left py-2">Действие</th></tr></thead>
                   <tbody>{registrations.map((r: any) => (<tr key={r.id} className="border-t border-[#2a2a36]"><td className="py-3">{r.user_id}</td><td className="py-3 font-bold text-white">{r.desired_nickname}</td><td className="py-3"><button onClick={() => onApproveReg(r.id, r.user_id, r.desired_nickname)} className="bg-[#35d07f] text-[#062a16] px-3 py-1 rounded font-bold hover:opacity-90">Одобрить</button></td></tr>))}</tbody>
                 </table>
               )}
             </div>
          )}

          {tab === "users" && (
            <AdminUsersTab users={users} draftFighters={draftFighters} setDraftFighters={setDraftFighters} draftActiveBracket={draftActiveBracket} onDeleteUser={onDeleteUser} onPatchUser={onPatchUser} />
          )}

          {tab === "matches" && (
            <AdminMatchesTab matches={draftMatches} fighters={draftFighters} draftActiveBracket={draftActiveBracket} setDraftMatches={setDraftMatches} onResolveBets={onResolveBets} />
          )}

          {tab === "tracks" && <AdminTracksTab tracks={draftTracks} fighters={draftFighters} matches={draftMatches} activeBracket={draftActiveBracket} setTracks={setDraftTracks} />}
          
          {tab === "style" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-2">Стили</h3>
              <div className="grid grid-cols-2 gap-4 max-w-[720px]">
                <div className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Primary</span><div className="flex items-center gap-2"><input type="color" value={draftStyle.primary} onChange={(e:any) => setDraftStyle({...draftStyle, primary: e.target.value})} className="w-8 h-8 bg-transparent border border-[#333] rounded cursor-pointer" /><input type="text" value={draftStyle.primary} onChange={(e:any) => setDraftStyle({...draftStyle, primary: e.target.value})} className="flex-1 bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs font-mono" /></div></div>
                <div className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Accent</span><div className="flex items-center gap-2"><input type="color" value={draftStyle.accent} onChange={(e:any) => setDraftStyle({...draftStyle, accent: e.target.value})} className="w-8 h-8 bg-transparent border border-[#333] rounded cursor-pointer" /><input type="text" value={draftStyle.accent} onChange={(e:any) => setDraftStyle({...draftStyle, accent: e.target.value})} className="flex-1 bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs font-mono" /></div></div>
              </div>
              <label className="flex items-center gap-2 mt-4 text-sm"><input type="checkbox" checked={draftStyle.grayscale === 1} onChange={(e:any) => setDraftStyle({...draftStyle, grayscale: e.target.checked ? 1 : 0})} /> ЧБ-фильтр</label>
            </div>
          )}

          {tab === "backup" && <AdminBackupTab season={draftSeason} maintenance={draftMaintenance} news={draftNews} archive={draftArchive} matches={draftMatches} fighters={draftFighters} users={users} tracks={draftTracks} style={draftStyle} brackets={draftBrackets} activeBracket={draftActiveBracket} onImport={(d:any) => { setDraftNews(d.news); setDraftArchive(d.archive); setDraftMatches(d.matches); setDraftFighters(d.fighters); setDraftSeason(d.season); setDraftTracks(d.tracks); setDraftStyle(d.style); setDraftMaintenance(d.maintenance); if(d.brackets) setDraftBrackets(d.brackets); if(d.activeBracketId) setDraftActiveBracket(d.activeBracketId); }} />}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0b0b0f] border-t border-[#2a2a36] px-4 md:px-6 py-3 z-10">
        <div className="max-w-[1280px] mx-auto flex gap-2.5 items-center flex-wrap">
          <button onClick={handleSave} disabled={!dirty || saving} className={`font-extrabold px-4 py-2.5 rounded-lg border-none ${dirty && !saving ? "bg-[#35d07f] text-[#062a16]" : "bg-[#2a2a36] text-[#666]"}`}>{saving ? "Сохраняю..." : "💾 Сохранить изменения"}</button>
          <button onClick={() => { setDraftNews(JSON.parse(JSON.stringify(newsProp))); setDraftArchive(JSON.parse(JSON.stringify(archiveProp))); setDraftMatches(JSON.parse(JSON.stringify(matchesProp))); setDraftFighters(JSON.parse(JSON.stringify(fightersProp))); setDraftBrackets(JSON.parse(JSON.stringify(bracketsProp))); setDraftActiveBracket(activeBracketIdProp); setDraftSeason(JSON.parse(JSON.stringify(seasonProp))); setDraftMaintenance(maintenanceProp); setDraftMaintConfig(maintenanceConfigProp); setDraftVersion(versionNameProp); setDraftTracks(JSON.parse(JSON.stringify(tracksProp))); setDraftStyle(JSON.parse(JSON.stringify(styleProp))); }} disabled={!dirty} className={`bg-transparent border px-4 py-2.5 rounded-lg ${dirty ? "text-[#9aa0a6] border-[#333]" : "text-[#444] border-[#222]"}`}>Отменить</button>
          <span className="text-[#ffb020] text-xs ml-auto">{dirty ? "Правки применяются только после «Сохранить»" : "Все изменения сохранены"}</span>
        </div>
      </div>
    </div>
  );
}