"use client";
import AdminMatchesTab from "./AdminMatchesTab";
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

  // Страховка, если registration еще нет в базе
  useEffect(() => {
    if (draftSeason && !draftSeason.registration) {
      setDraftSeason(prev => ({
        ...prev,
        registration: { enabled: true, buttonText: "ЗАПИСАТЬСЯ НА БАТЛ", buttonColor: "#8b0033" }
      }));
    }
  }, [draftSeason]);

  const dirty = JSON.stringify({ news: draftNews, archive: draftArchive, matches: draftMatches, fighters: draftFighters, season: draftSeason, maintenance: draftMaintenance, tracks: draftTracks, style: draftStyle }) !==
                JSON.stringify({ news: newsProp, archive: archiveProp, matches: matchesProp, fighters: fightersProp, season: seasonProp, maintenance: maintenanceProp, tracks: tracksProp, style: styleProp });

  async function handleSave() {
    setSaving(true);
    try { 
      await onSave({ 
        news: draftNews, archive: draftArchive, matches: draftMatches, 
        fighters: draftFighters, season: draftSeason, maintenance: draftMaintenance, 
        tracks: draftTracks, style: draftStyle 
      }); 
    } finally { setSaving(false); }
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
          
          {tab === "news" && (
            <NewsTab
              news={draftNews} archive={draftArchive}
              onChangeNews={(id, patch) => setDraftNews(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n))}
              onRemoveNews={(id) => { if (confirm("Удалить?")) setDraftNews(prev => prev.filter(n => n.id !== id)); }}
              onAddNews={() => setDraftNews(prev => [...prev, { id: "n_" + Date.now(), title: "НОВОСТЬ", subtitle: "подпись", url: "https://", bgColor: "#8b0033", borderColor: "#00a3ff", textColor: "#ffffff", enabled: true }])}
              onChangeArchive={(patch) => setDraftArchive(prev => ({ ...prev, ...patch }))}
            />
          )}

          {tab === "bracket" && (
            <BracketTab
              matches={draftMatches} fighters={draftFighters}
              setMatches={setDraftMatches} setFighters={setDraftFighters} createFighter={createFighter}
            />
          )}

          {tab === "season" && (
            <SeasonTab
              season={draftSeason} setSeason={setDraftSeason}
              maintenance={draftMaintenance} setMaintenance={setDraftMaintenance}
              fighters={draftFighters} setFighters={setDraftFighters} setMatches={setDraftMatches}
            />
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

          {tab === "users" && (          {tab === "users" && (
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
          )}
          )}

                   {tab === "matches" && (
            <AdminMatchesTab
              matches={draftMatches}
              fighters={draftFighters}
              draftActiveBracket={draftActiveBracket}
              setDraftMatches={setDraftMatches}
              onResolveBets={async (matchId) => {
                if (!confirm("Рассчитать ставки на этот матч? Очки будут начислены/списаны.")) return;
                const res = await fetch("/api/admin/resolve-bets", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ matchId })
                });
                const json = await res.json();
                if (!res.ok) return alert(json.error);
                alert(`Успешно! Рассчитано ставок: ${json.resolvedCount}`);
                await reload(); // Перезагружаем данные, чтобы скрыть кнопку
              }}
            />
          )}

          {tab === "style" && (
            <StyleTab style={draftStyle} setStyle={setDraftStyle} />
          )}

          {tab === "backup" && (
            <BackupTab
              season={draftSeason} maintenance={draftMaintenance} news={draftNews} archive={draftArchive}
              matches={draftMatches} fighters={draftFighters} users={users} tracks={draftTracks} style={draftStyle}
              onImport={(data) => {
                setDraftNews(data.news); setDraftArchive(data.archive); setDraftMatches(data.matches);
                setDraftFighters(data.fighters); setDraftSeason(data.season); setDraftTracks(data.tracks);
                setDraftStyle(data.style); setDraftMaintenance(data.maintenance);
              }}
            />
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

/* ============================================================
   ВКЛАДКИ
   ============================================================ */

function NewsTab({ news, archive, onChangeNews, onRemoveNews, onAddNews, onChangeArchive }: any) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">Новостные баннеры</h3>
        <div className="flex flex-col gap-4 mt-4">
          {news.map((n: any, i: number) => (
            <div key={n.id} className="bg-[#1d1d27] rounded-xl p-4 border-l-4" style={{ borderLeftColor: n.borderColor }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Баннер #{i + 1}</span>
                <button onClick={() => onRemoveNews(n.id)} className="text-[#ff2b2b] border border-[#ff2b2b] px-3 py-1 rounded text-xs hover:bg-[#ff2b2b] hover:text-white">🗑 Удалить</button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Заголовок"><input type="text" value={n.title} onChange={(e) => onChangeNews(n.id, { title: e.target.value })} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1" /></Field>
                <Field label="Подпись"><input type="text" value={n.subtitle} onChange={(e) => onChangeNews(n.id, { subtitle: e.target.value })} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1" /></Field>
                <Field label="Ссылка" className="col-span-2"><input type="url" value={n.url} onChange={(e) => onChangeNews(n.id, { url: e.target.value })} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1" /></Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <ColorField label="Фон" value={n.bgColor} onChange={(v: any) => onChangeNews(n.id, { bgColor: v })} />
                <ColorField label="Рамка" value={n.borderColor} onChange={(v: any) => onChangeNews(n.id, { borderColor: v })} />
                <ColorField label="Текст" value={n.textColor} onChange={(v: any) => onChangeNews(n.id, { textColor: v })} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={onAddNews} className="mt-4 bg-[#8b0033] text-white font-bold px-4 py-2 rounded hover:opacity-90">+ Добавить</button>
      </div>
      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Архив</h3>
        <div className="flex flex-col gap-3 max-w-[720px]">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={archive.enabled} onChange={(e) => onChangeArchive({ enabled: e.target.checked })} /> Включен</label>
          <Field label="Заголовок"><input type="text" value={archive.title} onChange={(e) => onChangeArchive({ title: e.target.value })} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-2 py-1" /></Field>
          <Field label="Подпись"><input type="text" value={archive.subtitle} onChange={(e) => onChangeArchive({ subtitle: e.target.value })} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-2 py-1" /></Field>
          <Field label="Ссылка"><input type="url" value={archive.url} onChange={(e) => onChangeArchive({ url: e.target.value })} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-2 py-1" /></Field>
        </div>
      </div>
    </div>
  );
}

function BracketTab({ matches, fighters, setMatches, setFighters, createFighter }: any) {
  const maxRound = matches.length ? Math.max(...matches.map((m: any) => m.round)) : 1;
  function updateMatch(id: string, patch: any) { setMatches((prev: any) => prev.map((m: any) => (m.id === id ? { ...m, ...patch } : m))); }
  
  function completeAndAdvance(m: any) {
    if (!m.winner || !m.fighter1 || !m.fighter2) return;
    const wScore = m.winner === m.fighter1 ? m.score1 : m.score2;
    if (wScore != null) setFighters((prev: any) => prev.map((f: any) => f.id === m.winner ? { ...f, totalScore: (f.totalScore || 0) + wScore } : f));
    setMatches((prev: any) => {
      let upd = prev.map((x: any) => x.id === m.id ? { ...x, status: "completed" } : x);
      if (m.round >= maxRound) return upd;
      const nextMatch = upd.find((x: any) => x.round === m.round + 1 && x.index === Math.ceil(m.index / 2));
      if (nextMatch) {
        const slot = m.index % 2 === 1 ? "fighter1" : "fighter2";
        upd = upd.map((x: any) => x.id === nextMatch.id ? { ...x, [slot]: m.winner, winner: null, status: "pending" } : x);
      }
      return upd;
    });
  }

  return (
    <div>
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Сетка</h3>
      <div className="grid gap-4 items-start" style={{ gridTemplateColumns: `repeat(${maxRound}, minmax(230px, 1fr))` }}>
        {Array.from({ length: maxRound }, (_, i) => i + 1).map((r) => {
          const roundMatches = matches.filter((m: any) => m.round === r).sort((a: any, b: any) => a.index - b.index);
          return (
            <div key={r}>
              <div className="text-[10px] uppercase tracking-widest text-[#9aa0a6] mb-2 font-bold">{r === maxRound ? "Финал" : r === maxRound - 1 && maxRound >= 3 ? "Полуфинал" : `Раунд ${r}`}</div>
              <div className="flex flex-col gap-3">
                {roundMatches.map((m: any) => (
                  <div key={m.id} className="bg-[#1d1d27] border border-[#2a2a36] rounded p-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] text-[#9aa0a6]">Матч {m.index}</span>
                      <select value={m.status} onChange={e => updateMatch(m.id, { status: e.target.value })} className="bg-[#14141c] text-[10px] border border-[#333] rounded">
                        <option value="pending">Ожидание</option><option value="betting_open">Ставки</option><option value="tracks_open">Треки</option><option value="judging">Суд</option><option value="completed">Готово</option>
                      </select>
                    </div>
                    <FighterRow match={m} slot={1} fighters={fighters} onUpdate={(p: any) => updateMatch(m.id, p)} onSetWinner={() => updateMatch(m.id, { winner: m.fighter1 })} createFighter={createFighter} />
                    <FighterRow match={m} slot={2} fighters={fighters} onUpdate={(p: any) => updateMatch(m.id, p)} onSetWinner={() => updateMatch(m.id, { winner: m.fighter2 })} createFighter={createFighter} />
                    <div className="flex gap-1 mt-2">
                      <button onClick={() => completeAndAdvance(m)} className="text-[10px] bg-[#35d07f] text-[#062a16] font-bold px-2 py-1 rounded w-full">✓ Завершить</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
      <input type="text" value={local} onChange={e => setLocal(e.target.value)} onBlur={commit} onKeyDown={e => e.key === "Enter" && (e.target as any).blur()} className="flex-1 bg-[#1d1d27] text-white text-xs px-2 py-1 rounded" />
      <input type="number" value={(slot === 1 ? match.score1 : match.score2) ?? ""} onChange={e => onUpdate(slot === 1 ? { score1: e.target.value === "" ? null : +e.target.value } : { score2: e.target.value === "" ? null : +e.target.value })} className="w-10 bg-[#1d1d27] text-white text-xs px-1 py-1 rounded text-center" />
      <button onClick={onSetWinner} className={`w-6 h-6 rounded ${isWinner ? "bg-[#35d07f] text-black" : "bg-[#1d1d27] text-[#ccc]"}`}>🏆</button>
    </div>
  );
}

function SeasonTab({ season, setSeason, maintenance, setMaintenance, fighters, setFighters, setMatches }: any) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Сезон</h3>
        <div className="flex flex-col gap-3 max-w-[720px]">
          <Field label="Название"><input type="text" value={season.title} onChange={e => setSeason({...season, title: e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-3 py-2" /></Field>
          <Field label="Номер"><input type="number" value={season.number} onChange={e => setSeason({...season, number: +e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-3 py-2" /></Field>
        </div>
      </div>
      
      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Кнопка записи</h3>
        <div className="flex flex-col gap-4 max-w-[720px] p-4 bg-[#1d1d27] rounded-xl border border-[#333]">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={season.registration?.enabled ?? false} onChange={e => setSeason({...season, registration: {...(season.registration || {}), enabled: e.target.checked}})} className="w-4 h-4 accent-[#8b0033]" /> Включить</label>
          <Field label="Текст"><input type="text" value={season.registration?.buttonText ?? ""} onChange={e => setSeason({...season, registration: {...(season.registration || {}), buttonText: e.target.value}})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></Field>
          <Field label="Цвет"><input type="color" value={season.registration?.buttonColor ?? "#8b0033"} onChange={e => setSeason({...season, registration: {...(season.registration || {}), buttonColor: e.target.value}})} className="w-16 h-8 bg-transparent border border-[#333] rounded" /></Field>
        </div>
      </div>

      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#ff2b2b] text-sm uppercase tracking-widest mb-4">Техработы</h3>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={maintenance} onChange={e => setMaintenance(e.target.checked)} className="w-4 h-4 accent-[#ff2b2b]" /> {maintenance ? "Включены" : "Выключены"}</label>
      </div>
    </div>
  );
}

function UsersTab({ users, fighters, setFighters, onDeleteUser, onPatchUser }: any) {
  return (
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
                <select value={u.role} onChange={(e) => onPatchUser(u.id, { role: e.target.value })} className="bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs">
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
          {fighters.map((f: any) => (
            <div key={f.id} className="flex gap-2 items-center bg-[#1d1d27] p-2 rounded">
              <input type="text" value={f.name} onChange={e => setFighters((prev: any) => prev.map((x: any) => x.id === f.id ? { ...x, name: e.target.value } : x))} className="flex-1 bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" />
              <button onClick={() => setFighters((prev: any) => prev.filter((x: any) => x.id !== f.id))} className="text-[#ff2b2b] px-2 py-1 rounded text-xs">🗑</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchesTab({ matches, fighters, setMatches }: any) {
  function update(id: string, patch: any) { setMatches((prev: any) => prev.map((m: any) => m.id === id ? { ...m, ...patch } : m)); }
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-2">Матчи</h3>
      {[...matches].sort((a: any, b: any) => a.round - b.round || a.index - b.index).map((m: any) => (
        <div key={m.id} className="bg-[#1d1d27] border border-[#2a2a36] rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm">Раунд {m.round} · Матч {m.index}</span>
            <label className="flex items-center gap-2 text-xs text-[#ff4500] font-bold">
              <input type="checkbox" checked={m.isFire || false} onChange={e => update(m.id, { isFire: e.target.checked })} className="w-4 h-4 accent-[#ff4500]" />
              🔥 ОГОНЬ
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Статус"><select value={m.status} onChange={e => update(m.id, { status: e.target.value })} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs"><option value="pending">Ожидание</option><option value="betting_open">Ставки</option><option value="tracks_open">Треки</option><option value="judging">Суд</option><option value="completed">Готово</option></select></Field>
            <Field label="Балл 1"><input type="number" value={m.score1 ?? ""} onChange={e => update(m.id, { score1: e.target.value === "" ? null : +e.target.value })} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" /></Field>
            <Field label="Балл 2"><input type="number" value={m.score2 ?? ""} onChange={e => update(m.id, { score2: e.target.value === "" ? null : +e.target.value })} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs" /></Field>
          </div>
        </div>
      ))}
    </div>
  );
}

function TracksTab({ tracks, fighters, matches, onChange, onRemove, onAdd }: any) {
  const [fid, setFid] = useState(""); const [mid, setMid] = useState(""); const [url, setUrl] = useState("");
  return (
    <div>
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Треки</h3>
      {tracks.map((t: any) => (
        <div key={t.id} className="bg-[#1d1d27] p-3 rounded mb-2 flex gap-2 items-center">
          <select value={t.fighterId} onChange={e => onChange(t.id, { fighterId: e.target.value })} className="bg-[#14141c] text-white text-xs px-2 py-1 rounded">
            {fighters.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select value={t.matchId} onChange={e => onChange(t.id, { matchId: e.target.value })} className="bg-[#14141c] text-white text-xs px-2 py-1 rounded">
            {matches.map((m: any) => <option key={m.id} value={m.id}>R{m.round}M{m.index}</option>)}
          </select>
          <input type="url" value={t.url} onChange={e => onChange(t.id, { url: e.target.value })} className="flex-1 bg-[#14141c] text-white text-xs px-2 py-1 rounded" />
          <button onClick={() => onRemove(t.id)} className="text-[#ff2b2b] text-xs">🗑</button>
        </div>
      ))}
      <div className="mt-4 flex gap-2 items-center">
        <select value={fid} onChange={e => setFid(e.target.value)} className="bg-[#1d1d27] text-white text-xs p-2 rounded"><option value="">Боец</option>{fighters.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
        <select value={mid} onChange={e => setMid(e.target.value)} className="bg-[#1d1d27] text-white text-xs p-2 rounded"><option value="">Матч</option>{matches.map((m: any) => <option key={m.id} value={m.id}>R{m.round}M{m.index}</option>)}</select>
        <input type="url" placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} className="flex-1 bg-[#1d1d27] text-white text-xs p-2 rounded" />
        <button onClick={() => { if (fid && mid && url) { onAdd({ id: "t_" + Date.now(), matchId: mid, fighterId: fid, url, isPublished: false, score: null }); setUrl(""); } }} className="bg-[#8b0033] text-white text-xs px-3 py-2 rounded">Добавить</button>
      </div>
    </div>
  );
}

function StyleTab({ style, setStyle }: any) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-2">Стили</h3>
      <div className="grid grid-cols-2 gap-4 max-w-[720px]">
        <ColorField label="Primary" value={style.primary} onChange={(v: any) => setStyle({...style, primary: v})} />
        <ColorField label="Accent" value={style.accent} onChange={(v: any) => setStyle({...style, accent: v})} />
      </div>
      <label className="flex items-center gap-2 mt-4 text-sm"><input type="checkbox" checked={style.grayscale === 1} onChange={e => setStyle({...style, grayscale: e.target.checked ? 1 : 0})} /> ЧБ-фильтр</label>
    </div>
  );
}

function BackupTab({ season, maintenance, news, archive, matches, fighters, users, tracks, style, onImport }: any) {
  function exportJSON() {
    const data = { version: 2, exportedAt: new Date().toISOString(), season, maintenance, news, archive, matches, fighters, users, tracks, style };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `backup.json`; a.click();
  }
  return (
    <div>
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Бэкап</h3>
      <button onClick={exportJSON} className="bg-[#8b0033] text-white font-bold px-4 py-2 rounded">💾 Скачать JSON</button>
    </div>
  );
}

/* ============================================================
   UI ЭЛЕМЕНТЫ
   ============================================================ */
function Field({ label, children, className = "" }: any) {
  return <label className={`flex flex-col gap-1 ${className}`}><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">{label}</span>{children}</label>;
}
function ColorField({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[#9aa0a6] text-xs uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-8 h-8 bg-transparent border border-[#333] rounded cursor-pointer" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs font-mono" />
      </div>
    </div>
  );
}
