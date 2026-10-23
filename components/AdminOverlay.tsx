"use client";

import { useState, useEffect } from "react";
import type { NewsItem, ArchiveConfig, Match, Fighter, User, Season, Track, StyleConfig, Bracket } from "@/lib/types";

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
  onSave, onDeleteUser, onPatchUser, onApproveReg, onClose,
}: {
  news: NewsItem[]; archive: ArchiveConfig; matches: Match[]; fighters: Fighter[]; users: User[];
  brackets: Bracket[]; activeBracketId: string;
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
  const [draftBrackets, setDraftBrackets] = useState<Bracket[]>(JSON.parse(JSON.stringify(bracketsProp)));
  const [draftActiveBracket, setDraftActiveBracket] = useState(activeBracketIdProp);
  const [draftSeason, setDraftSeason] = useState<Season>(JSON.parse(JSON.stringify(seasonProp)));
  const [draftMaintenance, setDraftMaintenance] = useState(maintenanceProp);
  const [draftMaintConfig, setDraftMaintConfig] = useState(maintenanceConfigProp || { title: "ТЕХРАБОТЫ", subtitle: "ЗАХОДИ ПОЗЖЕ", imageUrl: "" });
  const [draftVersion, setDraftVersion] = useState(versionNameProp || "1.0");
  const [draftTracks, setDraftTracks] = useState<Track[]>(JSON.parse(JSON.stringify(tracksProp)));
  const [draftStyle, setDraftStyle] = useState<StyleConfig>(JSON.parse(JSON.stringify(styleProp)));

  useEffect(() => {
    setDraftNews(JSON.parse(JSON.stringify(newsProp)));
    setDraftArchive(JSON.parse(JSON.stringify(archiveProp)));
    setDraftMatches(JSON.parse(JSON.stringify(matchesProp)));
    setDraftFighters(JSON.parse(JSON.stringify(fightersProp)));
    setDraftBrackets(JSON.parse(JSON.stringify(bracketsProp)));
    setDraftActiveBracket(activeBracketIdProp);
    setDraftSeason(JSON.parse(JSON.stringify(seasonProp)));
    setDraftMaintenance(maintenanceProp);
    setDraftMaintConfig(maintenanceConfigProp);
    setDraftVersion(versionNameProp);
    setDraftTracks(JSON.parse(JSON.stringify(tracksProp)));
    setDraftStyle(JSON.parse(JSON.stringify(styleProp)));
  }, [newsProp, archiveProp, matchesProp, fightersProp, bracketsProp, activeBracketIdProp, seasonProp, maintenanceProp, maintenanceConfigProp, versionNameProp, tracksProp, styleProp]);

  const dirty = JSON.stringify({ news: draftNews, archive: draftArchive, matches: draftMatches, fighters: draftFighters, brackets: draftBrackets, active: draftActiveBracket, season: draftSeason, maintenance: draftMaintenance, maintConfig: draftMaintConfig, version: draftVersion, tracks: draftTracks, style: draftStyle }) !==
                JSON.stringify({ news: newsProp, archive: archiveProp, matches: matchesProp, fighters: fightersProp, brackets: bracketsProp, active: activeBracketIdProp, season: seasonProp, maintenance: maintenanceProp, maintConfig: maintenanceConfigProp, version: versionNameProp, tracks: tracksProp, style: styleProp });

  async function handleSave() {
    setSaving(true);
    try { 
      await onSave({ 
        news: draftNews, archive: draftArchive, matches: draftMatches, fighters: draftFighters, 
        brackets: draftBrackets, activeBracketId: draftActiveBracket,
        season: draftSeason, maintenance: draftMaintenance, maintenanceConfig: draftMaintConfig, 
        versionName: draftVersion, tracks: draftTracks, style: draftStyle 
      }); 
    } finally { setSaving(false); }
  }

  function handleCancel() {
    setDraftNews(JSON.parse(JSON.stringify(newsProp))); setDraftArchive(JSON.parse(JSON.stringify(archiveProp)));
    setDraftMatches(JSON.parse(JSON.stringify(matchesProp))); setDraftFighters(JSON.parse(JSON.stringify(fightersProp)));
    setDraftBrackets(JSON.parse(JSON.stringify(bracketsProp))); setDraftActiveBracket(activeBracketIdProp);
    setDraftSeason(JSON.parse(JSON.stringify(seasonProp))); setDraftMaintenance(maintenanceProp);
    setDraftMaintConfig(JSON.parse(JSON.stringify(maintenanceConfigProp))); setDraftVersion(versionNameProp);
    setDraftTracks(JSON.parse(JSON.stringify(tracksProp))); setDraftStyle(JSON.parse(JSON.stringify(styleProp)));
  }

  function handleClose() { if (dirty && !confirm("Закрыть без сохранения?")) return; onClose(); }

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
    const newBracket: Bracket = { id: newBracketId, name, type };

    const newFighters: Fighter[] = [];
    const newMatches: Match[] = [];

    if (type === "classic") {
      for (let i = 0; i < size; i++) {
        newFighters.push({ id: `f_${Date.now()}_${i}`, name: `Слот ${i+1}`, userId: null, prevScore: 0, totalScore: 0, bracketId: newBracketId });
      }
      const rounds = Math.round(Math.log2(size));
      for (let r = 1; r <= rounds; r++) {
        const count = size / Math.pow(2, r);
        for (let i = 1; i <= count; i++) {
          newMatches.push({ 
            id: `m_${Date.now()}_${r}_${i}`, round: r, index: i, fighter1: null, fighter2: null, 
            isCompleted: false, isBettingOpen: false, isTracksOpen: false, isFinal: r === rounds, 
            odds1: 1.2, odds2: 1.2, score1: null, score2: null, winner: null, bracketId: newBracketId 
          });
        }
      }
      newFighters.forEach((f, idx) => {
        const match = newMatches[Math.floor(idx / 2)];
        if (idx % 2 === 0) match.fighter1 = f.id; else match.fighter2 = f.id;
      });
    } else {
      newMatches.push({ 
        id: `m_${Date.now()}_1_1`, round: 1, index: 1, fighter1: null, fighter2: null, 
        isCompleted: false, isBettingOpen: false, isTracksOpen: false, isFinal: false, 
        odds1: 1.2, odds2: 1.2, score1: null, score2: null, winner: null, bracketId: newBracketId 
      });
    }

    setDraftBrackets([...draftBrackets, newBracket]);
    setDraftFighters([...draftFighters, ...newFighters]);
    setDraftMatches([...draftMatches, ...newMatches]);
    setDraftActiveBracket(newBracketId);
  }

  function deleteBracket(id: string) {
    if (!confirm("Удалить сетку и все её матчи?")) return;
    setDraftBrackets(draftBrackets.filter(b => b.id !== id));
    setDraftFighters(draftFighters.filter(f => f.bracketId !== id));
    setDraftMatches(draftMatches.filter(m => m.bracketId !== id));
    if (draftActiveBracket === id) setDraftActiveBracket(draftBrackets.find(b => b.id !== id)?.id || "");
  }

  return (
    <div className="fixed inset-0 bg-[#0b0b0f] z-50 overflow-y-auto p-4 md:p-6">
      <div className="max-w-[1280px] mx-auto pb-32">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#00a3ff] flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-black uppercase tracking-wide m-0">🛠 Админ-панель</h2>
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
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">Новостные баннеры</h3>
                <div className="flex flex-col gap-4 mt-4">
                  {draftNews.map((n, i) => (
                    <div key={n.id} className="bg-[#1d1d27] rounded-xl p-4 border-l-4" style={{ borderLeftColor: n.borderColor }}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Баннер #{i + 1}</span>
                        <button onClick={() => { if (confirm("Удалить?")) setDraftNews(prev => prev.filter(x => x.id !== n.id)) }} className="text-[#ff2b2b] border border-[#ff2b2b] px-3 py-1 rounded text-xs hover:bg-[#ff2b2b] hover:text-white">🗑 Удалить</button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Field label="Заголовок"><input type="text" value={n.title} onChange={(e) => setDraftNews(prev => prev.map(x => x.id === n.id ? {...x, title: e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1" /></Field>
                        <Field label="Подпись"><input type="text" value={n.subtitle} onChange={(e) => setDraftNews(prev => prev.map(x => x.id === n.id ? {...x, subtitle: e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1" /></Field>
                        <Field label="Ссылка" className="col-span-2"><input type="url" value={n.url} onChange={(e) => setDraftNews(prev => prev.map(x => x.id === n.id ? {...x, url: e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1" /></Field>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <ColorField label="Фон" value={n.bgColor} onChange={(v: string) => setDraftNews(prev => prev.map(x => x.id === n.id ? {...x, bgColor: v} : x))} />
                        <ColorField label="Рамка" value={n.borderColor} onChange={(v: string) => setDraftNews(prev => prev.map(x => x.id === n.id ? {...x, borderColor: v} : x))} />
                        <ColorField label="Текст" value={n.textColor} onChange={(v: string) => setDraftNews(prev => prev.map(x => x.id === n.id ? {...x, textColor: v} : x))} />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setDraftNews(prev => [...prev, { id: "n_" + Date.now(), title: "НОВОСТЬ", subtitle: "подпись", url: "https://", bgColor: "#8b0033", borderColor: "#00a3ff", textColor: "#ffffff", enabled: true }])} className="mt-4 bg-[#8b0033] text-white font-bold px-4 py-2 rounded hover:opacity-90">+ Добавить</button>
              </div>
              <div className="border-t border-[#2a2a36] pt-6">
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Архив</h3>
                <div className="flex flex-col gap-3 max-w-[720px]">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draftArchive.enabled} onChange={(e) => setDraftArchive({...draftArchive, enabled: e.target.checked})} /> Включен</label>
                  <Field label="Заголовок"><input type="text" value={draftArchive.title} onChange={(e) => setDraftArchive({...draftArchive, title: e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-2 py-1" /></Field>
                  <Field label="Подпись"><input type="text" value={draftArchive.subtitle} onChange={(e) => setDraftArchive({...draftArchive, subtitle: e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-2 py-1" /></Field>
                  <Field label="Ссылка"><input type="url" value={draftArchive.url} onChange={(e) => setDraftArchive({...draftArchive, url: e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-2 py-1" /></Field>
                </div>
              </div>
            </div>
          )}

          {tab === "bracket" && (
            <div>
              <div className="flex gap-4 mb-6 items-center flex-wrap">
                <select value={draftActiveBracket} onChange={(e) => setDraftActiveBracket(e.target.value)} className="bg-[#1d1d27] text-white p-2 rounded font-bold border border-[#333]">
                  {draftBrackets.map(b => <option key={b.id} value={b.id}>{b.name} ({b.type === 'classic' ? 'Классика' : 'Свободная'})</option>)}
                </select>
                <button onClick={() => createBracket("classic")} className="bg-[#00a3ff] text-[#002233] px-4 py-2 rounded font-bold">+ Классическая</button>
                <button onClick={() => createBracket("free")} className="bg-[#ffb020] text-[#2a1c00] px-4 py-2 rounded font-bold">+ Свободная</button>
                <button onClick={() => deleteBracket(draftActiveBracket)} className="bg-[#ff2b2b] text-white px-4 py-2 rounded font-bold ml-auto">Удалить сетку</button>
              </div>

              <div className="grid gap-4 items-start" style={{ gridTemplateColumns: `repeat(${Math.max(...draftMatches.filter(m=>m.bracketId===draftActiveBracket).map(m => m.round), 1)}, minmax(230px, 1fr))` }}>
                {Array.from({ length: Math.max(...draftMatches.filter(m=>m.bracketId===draftActiveBracket).map(m => m.round), 1) }, (_, i) => i + 1).map((r) => {
                  const roundMatches = draftMatches.filter(m => m.bracketId === draftActiveBracket && m.round === r).sort((a,b)=>a.index-b.index);
                  return (
                    <div key={r}>
                      <div className="text-[10px] uppercase tracking-widest text-[#9aa0a6] mb-2 font-bold">Раунд {r}</div>
                      <div className="flex flex-col gap-3">
                        {roundMatches.map(m => (
                          <div key={m.id} className="bg-[#1d1d27] border border-[#2a2a36] rounded p-3">
                            <div className="flex justify-between mb-2">
                               <span className="text-[10px] text-[#9aa0a6]">Матч {m.index}</span>
                               <button onClick={() => { if(confirm("Удалить матч?")) setDraftMatches(prev => prev.filter(x => x.id !== m.id)) }} className="text-[#ff2b2b] text-[10px]">🗑</button>
                            </div>
                            <FighterRow match={m} slot={1} fighters={draftFighters.filter(f => f.bracketId === draftActiveBracket)} onUpdate={(p: any) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, ...p} : x))} onSetWinner={() => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, winner: m.fighter1} : x))} createFighter={(name: string) => {
                              const newId = "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
                              setDraftFighters(prev => [...prev, { id: newId, name, userId: null, prevScore: 0, totalScore: 0, bracketId: draftActiveBracket }]);
                              return newId;
                            }} />
                            <FighterRow match={m} slot={2} fighters={draftFighters.filter(f => f.bracketId === draftActiveBracket)} onUpdate={(p: any) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, ...p} : x))} onSetWinner={() => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, winner: m.fighter2} : x))} createFighter={(name: string) => {
                              const newId = "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
                              setDraftFighters(prev => [...prev, { id: newId, name, userId: null, prevScore: 0, totalScore: 0, bracketId: draftActiveBracket }]);
                              return newId;
                            }} />
                            <div className="flex gap-1 mt-2">
                              <button onClick={() => {
                                if (!m.winner || !m.fighter1 || !m.fighter2) return;
                                const nextMatch = draftMatches.find(x => x.bracketId === draftActiveBracket && x.round === m.round + 1 && x.index === Math.ceil(m.index / 2));
                                if (nextMatch) {
                                  const slot = m.index % 2 === 1 ? "fighter1" : "fighter2";
                                  setDraftMatches(prev => prev.map(x => x.id === nextMatch.id ? {...x, [slot]: m.winner} : x));
                                }
                                setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, isCompleted: true} : x));
                              }} className="text-[10px] bg-[#35d07f] text-[#062a16] font-bold px-2 py-1 rounded w-full">✓ Завершить и дальше</button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <label className="flex items-center gap-1 text-[9px] text-[#ccc]"><input type="checkbox" checked={m.isCompleted} onChange={e => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, isCompleted: e.target.checked} : x))} /> Завершён</label>
                              <label className="flex items-center gap-1 text-[9px] text-[#ff4500]"><input type="checkbox" checked={m.isFinal} onChange={e => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, isFinal: e.target.checked} : x))} /> 🔥 Финал</label>
                              <label className="flex items-center gap-1 text-[9px] text-[#35d07f]"><input type="checkbox" checked={m.isBettingOpen} onChange={e => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, isBettingOpen: e.target.checked} : x))} /> Ставки</label>
                              <label className="flex items-center gap-1 text-[9px] text-[#00a3ff]"><input type="checkbox" checked={m.isTracksOpen} onChange={e => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, isTracksOpen: e.target.checked} : x))} /> Треки</label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => {
                const nextIndex = draftMatches.filter(m => m.bracketId === draftActiveBracket && m.round === 1).length + 1;
                setDraftMatches(prev => [...prev, { id: `m_${Date.now()}`, round: 1, index: nextIndex, fighter1: null, fighter2: null, isCompleted: false, isBettingOpen: false, isTracksOpen: false, isFinal: false, odds1: 1.2, odds2: 1.2, score1: null, score2: null, winner: null, bracketId: draftActiveBracket }]);
              }} className="mt-4 bg-[#8b0033] text-white px-4 py-2 rounded text-sm font-bold">+ Добавить матч (для свободной сетки)</button>
            </div>
          )}

          {tab === "season" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Сезон</h3>
                <div className="flex flex-col gap-3 max-w-[720px]">
                  <Field label="Название"><input type="text" value={draftSeason.title} onChange={(e) => setDraftSeason({...draftSeason, title: e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-3 py-2" /></Field>
                  <Field label="Номер"><input type="number" value={draftSeason.number} onChange={(e) => setDraftSeason({...draftSeason, number: +e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-3 py-2" /></Field>
                </div>
              </div>
              
              <div className="border-t border-[#2a2a36] pt-6">
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Кнопка записи</h3>
                <div className="flex flex-col gap-4 max-w-[720px] p-4 bg-[#1d1d27] rounded-xl border border-[#333]">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={draftSeason.registration?.enabled ?? false} 
                      onChange={(e) => setDraftSeason({...draftSeason, registration: { enabled: e.target.checked, buttonText: draftSeason.registration?.buttonText ?? "ЗАПИСАТЬСЯ", buttonColor: draftSeason.registration?.buttonColor ?? "#8b0033" }})} className="w-4 h-4 accent-[#8b0033]" /> Включить
                  </label>
                  <Field label="Текст"><input type="text" value={draftSeason.registration?.buttonText ?? ""} onChange={(e) => setDraftSeason({...draftSeason, registration: { enabled: draftSeason.registration?.enabled ?? true, buttonText: e.target.value, buttonColor: draftSeason.registration?.buttonColor ?? "#8b0033" }})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></Field>
                  <Field label="Цвет"><input type="color" value={draftSeason.registration?.buttonColor ?? "#8b0033"} onChange={(e) => setDraftSeason({...draftSeason, registration: { enabled: draftSeason.registration?.enabled ?? true, buttonText: draftSeason.registration?.buttonText ?? "ЗАПИСАТЬСЯ", buttonColor: e.target.value }})} className="w-16 h-8 bg-transparent border border-[#333] rounded" /></Field>
                </div>
              </div>

              <div className="border-t border-[#2a2a36] pt-6">
                <h3 className="text-[#ff2b2b] text-sm uppercase tracking-widest mb-4">Техработы (Глушилка)</h3>
                <div className="flex flex-col gap-4 max-w-[720px] p-4 bg-[#1d1d27] rounded-xl border border-[#333]">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draftMaintenance} onChange={(e) => setDraftMaintenance(e.target.checked)} className="w-4 h-4 accent-[#ff2b2b]" /> Включить техработы</label>
                  <Field label="Заголовок"><input type="text" value={draftMaintConfig.title} onChange={(e) => setDraftMaintConfig({...draftMaintConfig, title: e.target.value})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></Field>
                  <Field label="Подзаголовок"><input type="text" value={draftMaintConfig.subtitle} onChange={(e) => setDraftMaintConfig({...draftMaintConfig, subtitle: e.target.value})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></Field>
                  <Field label="Ссылка на картинку (Маркин)"><input type="url" value={draftMaintConfig.imageUrl} onChange={(e) => setDraftMaintConfig({...draftMaintConfig, imageUrl: e.target.value})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></Field>
                </div>
              </div>

              <div className="border-t border-[#2a2a36] pt-6">
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Версия сайта</h3>
                <Field label="Название версии"><input type="text" value={draftVersion} onChange={(e) => setDraftVersion(e.target.value)} className="w-full max-w-[720px] bg-[#1d1d27] text-white border border-[#333] rounded px-3 py-2" /></Field>
              </div>
            </div>
          )}

          {tab === "registrations" && (
            <div>
              <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Заявки на участие</h3>
              {registrations.length === 0 ? <div className="text-[#9aa0a6]">Нет активных заявок.</div> : (
                <table className="w-full text-[13px] border-collapse">
                  <thead><tr className="text-[#9aa0a6] text-[11px] uppercase tracking-widest"><th className="text-left py-2">ID</th><th className="text-left py-2">Желаемый ник</th><th className="text-left py-2">Действие</th></tr></thead>
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
                  {users.map((u) => (
                    <div key={u.id} className="bg-[#1d1d27] rounded-xl p-4 border border-[#2a2a36] flex justify-between items-center">
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
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "matches" && (
            <div className="flex flex-col gap-3">
              <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-2">Все матчи (активная сетка)</h3>
              {draftMatches.filter(m => m.bracketId === draftActiveBracket).sort((a, b) => a.round - b.round || a.index - b.index).map((m) => (
                <div key={m.id} className="bg-[#1d1d27] border border-[#2a2a36] rounded p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm">Раунд {m.round} · Матч {m.index}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Field label="Балл 1"><input type="number" value={m.score1 ?? ""} onChange={(e) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, score1: e.target.value === "" ? null : +e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" /></Field>
                    <Field label="Балл 2"><input type="number" value={m.score2 ?? ""} onChange={(e) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, score2: e.target.value === "" ? null : +e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" /></Field>
                    <Field label="Кэф 1"><input type="number" step="0.01" value={m.odds1} onChange={(e) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, odds1: +e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" /></Field>
                    <Field label="Кэф 2"><input type="number" step="0.01" value={m.odds2} onChange={(e) => setDraftMatches(prev => prev.map(x => x.id === m.id ? {...x, odds2: +e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" /></Field>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "tracks" && (
            <div>
              <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Треки</h3>
              {draftTracks.map((t) => (
                <div key={t.id} className="bg-[#1d1d27] p-3 rounded mb-2 flex gap-2 items-center">
                  <select value={t.fighterId} onChange={(e) => setDraftTracks(prev => prev.map(x => x.id === t.id ? {...x, fighterId: e.target.value} : x))} className="bg-[#14141c] text-white text-xs px-2 py-1 rounded">
                    {draftFighters.filter(f => f.bracketId === draftActiveBracket).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <select value={t.matchId} onChange={(e) => setDraftTracks(prev => prev.map(x => x.id === t.id ? {...x, matchId: e.target.value} : x))} className="bg-[#14141c] text-white text-xs px-2 py-1 rounded">
                    {draftMatches.filter(m => m.bracketId === draftActiveBracket).map(m => <option key={m.id} value={m.id}>R{m.round}M{m.index}</option>)}
                  </select>
                  <input type="url" value={t.url} onChange={(e) => setDraftTracks(prev => prev.map(x => x.id === t.id ? {...x, url: e.target.value} : x))} className="flex-1 bg-[#14141c] text-white text-xs px-2 py-1 rounded" />
                  <button onClick={() => { if (confirm("Удалить?")) setDraftTracks(prev => prev.filter(x => x.id !== t.id)) }} className="text-[#ff2b2b] text-xs">🗑</button>
                </div>
              ))}
            </div>
          )}

          {tab === "style" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-2">Стили</h3>
              <div className="grid grid-cols-2 gap-4 max-w-[720px]">
                <ColorField label="Primary" value={draftStyle.primary} onChange={(v: string) => setDraftStyle({...draftStyle, primary: v})} />
                <ColorField label="Accent" value={draftStyle.accent} onChange={(v: string) => setDraftStyle({...draftStyle, accent: v})} />
                <ColorField label="Активный" value={draftStyle.participantActive} onChange={(v: string) => setDraftStyle({...draftStyle, participantActive: v})} />
                <ColorField label="Прошёл" value={draftStyle.participantWin} onChange={(v: string) => setDraftStyle({...draftStyle, participantWin: v})} />
              </div>
              <label className="flex items-center gap-2 mt-4 text-sm"><input type="checkbox" checked={draftStyle.grayscale === 1} onChange={(e) => setDraftStyle({...draftStyle, grayscale: e.target.checked ? 1 : 0})} /> ЧБ-фильтр</label>
            </div>
          )}

          {tab === "backup" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Экспорт</h3>
                <button onClick={() => {
                  const data = { version: 2, exportedAt: new Date().toISOString(), season: draftSeason, maintenance: draftMaintenance, news: draftNews, archive: draftArchive, matches: draftMatches, fighters: draftFighters, users, tracks: draftTracks, style: draftStyle, brackets: draftBrackets, activeBracketId: draftActiveBracket };
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
                        if(d.brackets) setDraftBrackets(d.brackets);
                        if(d.activeBracketId) setDraftActiveBracket(d.activeBracketId);
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

function FighterRow({ match, slot, fighters, onUpdate, onSetWinner, createFighter }: any) {
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
    const newId = createFighter(v);
    onUpdate(slot === 1 ? { fighter1: newId } : { fighter2: newId });
  }

  return (
    <div className={`flex gap-1 items-center p-1 rounded mb-1 ${isWinner ? "border border-[#35d07f] bg-[rgba(53,208,127,0.1)]" : "bg-[#14141c]"}`}>
      <input type="text" value={local} onChange={(e: any) => setLocal(e.target.value)} onBlur={commit} onKeyDown={(e: any) => e.key === "Enter" && (e.target as any).blur()} className="flex-1 bg-[#1d1d27] text-white text-xs px-2 py-1 rounded" />
      <input type="number" value={(slot === 1 ? match.score1 : match.score2) ?? ""} onChange={(e: any) => onUpdate(slot === 1 ? { score1: e.target.value === "" ? null : +e.target.value } : { score2: e.target.value === "" ? null : +e.target.value })} className="w-10 bg-[#1d1d27] text-white text-xs px-1 py-1 rounded text-center" />
      <button onClick={onSetWinner} className={`w-6 h-6 rounded ${isWinner ? "bg-[#35d07f] text-black" : "bg-[#1d1d27] text-[#ccc]"}`}>🏆</button>
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