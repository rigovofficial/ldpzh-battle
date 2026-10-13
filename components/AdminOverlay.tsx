"use client";

import { useState, useEffect } from "react";
import type {
  NewsItem,
  ArchiveConfig,
  Match,
  Fighter,
  User,
  Season,
  Track,
  StyleConfig,
} from "@/lib/types";
import { matchStatusLabel, roleLabel } from "@/lib/labels";
import { regenerateBracket, resizeFighterPool } from "@/lib/bracket-utils";

const TABS = [
  { id: "news", label: "📰 Новости" },
  { id: "bracket", label: "🥊 Сетка" },
  { id: "season", label: "📅 Сезон" },
  { id: "users", label: "👥 Юзеры" },
  { id: "matches", label: "⚔ Матчи" },
  { id: "tracks", label: "🎵 Треки" },
  { id: "style", label: "🎨 Стили" },
  { id: "backup", label: "💾 Бэкап" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface AdminPayload {
  news: NewsItem[];
  archive: ArchiveConfig;
  matches: Match[];
  fighters: Fighter[];
  season: Season;
  maintenance: boolean;
  tracks: Track[];
  style: StyleConfig;
}

export default function AdminOverlay({
  news: newsProp,
  archive: archiveProp,
  matches: matchesProp,
  fighters: fightersProp,
  users,
  season: seasonProp,
  maintenance: maintenanceProp,
  tracks: tracksProp,
  style: styleProp,
  onSave,
  onDeleteUser,
  onPatchUser,
  onClose,
}: {
  news: NewsItem[];
  archive: ArchiveConfig;
  matches: Match[];
  fighters: Fighter[];
  users: User[];
  season: Season;
  maintenance: boolean;
  tracks: Track[];
  style: StyleConfig;
  onSave: (payload: AdminPayload) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onPatchUser: (userId: string, patch: any) => Promise<void>;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabId>("news");
  const [saving, setSaving] = useState(false);

  const [draftNews, setDraftNews] = useState<NewsItem[]>(() =>
    JSON.parse(JSON.stringify(newsProp))
  );
  const [draftArchive, setDraftArchive] = useState<ArchiveConfig>(() =>
    JSON.parse(JSON.stringify(archiveProp))
  );
  const [draftMatches, setDraftMatches] = useState<Match[]>(() =>
    JSON.parse(JSON.stringify(matchesProp))
  );
  const [draftFighters, setDraftFighters] = useState<Fighter[]>(() =>
    JSON.parse(JSON.stringify(fightersProp))
  );
  const [draftSeason, setDraftSeason] = useState<Season>(() =>
    JSON.parse(JSON.stringify(seasonProp))
  );
  const [draftMaintenance, setDraftMaintenance] = useState(maintenanceProp);
  const [draftTracks, setDraftTracks] = useState<Track[]>(() =>
    JSON.parse(JSON.stringify(tracksProp))
  );
  const [draftStyle, setDraftStyle] = useState<StyleConfig>(() =>
    JSON.parse(JSON.stringify(styleProp))
  );

  const dirty =
    JSON.stringify(draftNews) !== JSON.stringify(newsProp) ||
    JSON.stringify(draftArchive) !== JSON.stringify(archiveProp) ||
    JSON.stringify(draftMatches) !== JSON.stringify(matchesProp) ||
    JSON.stringify(draftFighters) !== JSON.stringify(fightersProp) ||
    JSON.stringify(draftSeason) !== JSON.stringify(seasonProp) ||
    draftMaintenance !== maintenanceProp ||
    JSON.stringify(draftTracks) !== JSON.stringify(tracksProp) ||
    JSON.stringify(draftStyle) !== JSON.stringify(styleProp);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        news: draftNews,
        archive: draftArchive,
        matches: draftMatches,
        fighters: draftFighters,
        season: draftSeason,
        maintenance: draftMaintenance,
        tracks: draftTracks,
        style: draftStyle,
      });
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraftNews(JSON.parse(JSON.stringify(newsProp)));
    setDraftArchive(JSON.parse(JSON.stringify(archiveProp)));
    setDraftMatches(JSON.parse(JSON.stringify(matchesProp)));
    setDraftFighters(JSON.parse(JSON.stringify(fightersProp)));
    setDraftSeason(JSON.parse(JSON.stringify(seasonProp)));
    setDraftMaintenance(maintenanceProp);
    setDraftTracks(JSON.parse(JSON.stringify(tracksProp)));
    setDraftStyle(JSON.parse(JSON.stringify(styleProp)));
  }

  function handleClose() {
    if (dirty && !confirm("Есть несохранённые изменения. Закрыть без сохранения?"))
      return;
    onClose();
  }

  function createFighter(name: string): string {
    const newId =
      "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    setDraftFighters((prev) => [
      ...prev,
      { id: newId, name, userId: null, prevScore: 0, totalScore: 0 },
    ]);
    return newId;
  }

  return (
    <div className="fixed inset-0 bg-[#0b0b0f] z-50 overflow-y-auto p-4 md:p-6">
      <div className="max-w-[1280px] mx-auto pb-32">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#00a3ff] flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-black uppercase tracking-wide m-0">
              🛠 Админ-панель
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-[#35d07f] text-[#062a16] font-extrabold text-[11px] tracking-widest uppercase">
              Режим организатора
            </span>
            {dirty && (
              <span className="px-2.5 py-1 rounded-full bg-[#ffb020] text-[#2a1c00] font-extrabold text-[11px] tracking-widest uppercase">
                ● Есть правки
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="bg-[#ff2b2b] text-white px-4 py-2 rounded-lg cursor-pointer font-extrabold text-[13px] border-none hover:opacity-90"
          >
            ✕ Закрыть
          </button>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-lg cursor-pointer text-[13px] border transition-colors ${
                tab === t.id
                  ? "bg-[#8b0033] text-white border-[#00a3ff]"
                  : "bg-[#1d1d27] text-[#f5f5f5] border-transparent hover:border-[#333]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-[#14141c] border border-[#00a3ff] rounded-2xl p-5 min-h-[400px]">
          {tab === "news" && (
            <NewsTab
              news={draftNews}
              archive={draftArchive}
              onChangeNews={(id, patch) =>
                setDraftNews((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, ...patch } : n))
                )
              }
              onRemoveNews={(id) => {
                if (!confirm("Удалить этот баннер?")) return;
                setDraftNews((prev) => prev.filter((n) => n.id !== id));
              }}
              onAddNews={() =>
                setDraftNews((prev) => [
                  ...prev,
                  {
                    id: "n_" + Date.now(),
                    title: "НОВАЯ НОВОСТЬ",
                    subtitle: "подпись",
                    url: "https://",
                    bgColor: "#8b0033",
                    borderColor: "#00a3ff",
                    textColor: "#ffffff",
                    enabled: true,
                  },
                ])
              }
              onChangeArchive={(patch) =>
                setDraftArchive((prev) => ({ ...prev, ...patch }))
              }
            />
          )}

          {tab === "bracket" && (
            <BracketTab
              matches={draftMatches}
              fighters={draftFighters}
              setMatches={setDraftMatches}
              setFighters={setDraftFighters}
              createFighter={createFighter}
            />
          )}

          {tab === "season" && (
            <SeasonTab
              season={draftSeason}
              setSeason={setDraftSeason}
              maintenance={draftMaintenance}
              setMaintenance={setDraftMaintenance}
              fighters={draftFighters}
              setFighters={setDraftFighters}
              setMatches={setDraftMatches}
            />
          )}

          {tab === "users" && (
            <UsersTab
              users={users}
              fighters={draftFighters}
              setFighters={setDraftFighters}
              onDeleteUser={onDeleteUser}
              onPatchUser={onPatchUser}
            />
          )}

          {tab === "matches" && (
            <MatchesTab
              matches={draftMatches}
              fighters={draftFighters}
              setMatches={setDraftMatches}
            />
          )}

          {tab === "tracks" && (
            <TracksTab
              tracks={draftTracks}
              fighters={draftFighters}
              matches={draftMatches}
              onChange={(id, patch) =>
                setDraftTracks((prev) =>
                  prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
                )
              }
              onRemove={(id) => {
                if (!confirm("Удалить трек?")) return;
                setDraftTracks((prev) => prev.filter((t) => t.id !== id));
              }}
              onAdd={(newTrack) =>
                setDraftTracks((prev) => [...prev, newTrack])
              }
            />
          )}

          {tab === "style" && (
            <StyleTab style={draftStyle} setStyle={setDraftStyle} />
          )}

          {tab === "backup" && (
            <BackupTab
              season={draftSeason}
              maintenance={draftMaintenance}
              news={draftNews}
              archive={draftArchive}
              matches={draftMatches}
              fighters={draftFighters}
              users={users}
              tracks={draftTracks}
              style={draftStyle}
              onImport={(data) => {
                setDraftNews(data.news);
                setDraftArchive(data.archive);
                setDraftMatches(data.matches);
                setDraftFighters(data.fighters);
                setDraftSeason(data.season);
                setDraftTracks(data.tracks);
                setDraftStyle(data.style);
                setDraftMaintenance(data.maintenance);
              }}
            />
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0b0b0f] border-t border-[#2a2a36] px-4 md:px-6 py-3 z-10">
        <div className="max-w-[1280px] mx-auto flex gap-2.5 items-center flex-wrap">
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`font-extrabold px-4 py-2.5 rounded-lg cursor-pointer border-none ${
              dirty && !saving
                ? "bg-[#35d07f] text-[#062a16] hover:opacity-90"
                : "bg-[#2a2a36] text-[#666] cursor-not-allowed"
            }`}
          >
            {saving ? "Сохраняю..." : "💾 Сохранить изменения"}
          </button>
          <button
            onClick={handleCancel}
            disabled={!dirty}
            className={`bg-transparent border px-4 py-2.5 rounded-lg ${
              dirty
                ? "text-[#9aa0a6] border-[#333] cursor-pointer hover:border-[#666]"
                : "text-[#444] border-[#222] cursor-not-allowed"
            }`}
          >
            Отменить
          </button>
          <span className="text-[#ffb020] text-xs ml-auto">
            {dirty
              ? "Правки применяются только после «Сохранить»"
              : "Все изменения сохранены"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB: НОВОСТИ
   ============================================================ */

function NewsTab({
  news,
  archive,
  onChangeNews,
  onRemoveNews,
  onAddNews,
  onChangeArchive,
}: {
  news: NewsItem[];
  archive: ArchiveConfig;
  onChangeNews: (id: string, patch: Partial<NewsItem>) => void;
  onRemoveNews: (id: string) => void;
  onAddNews: () => void;
  onChangeArchive: (patch: Partial<ArchiveConfig>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">
          Новостные баннеры
        </h3>
        <p className="text-[#9aa0a6] text-xs mb-4">
          Список баннеров сверху главной страницы. Порядок = порядок вывода.
        </p>
        <div className="flex flex-col gap-4">
          {news.map((n, i) => (
            <NewsEditor
              key={n.id}
              index={i + 1}
              item={n}
              onChange={(patch) => onChangeNews(n.id, patch)}
              onRemove={() => onRemoveNews(n.id)}
            />
          ))}
        </div>
        <button
          onClick={onAddNews}
          className="mt-4 bg-[#8b0033] text-white font-bold px-4 py-2.5 rounded-lg cursor-pointer border-none hover:opacity-90"
        >
          + Добавить баннер
        </button>
      </div>

      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">
          Кнопка «Архив»
        </h3>
        <div className="flex flex-col gap-3 max-w-[720px]">
          <Field label="Показывать">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={archive.enabled}
                onChange={(e) => onChangeArchive({ enabled: e.target.checked })}
                className="w-4 h-4 accent-[#8b0033]"
              />
              {archive.enabled ? "Включено" : "Выключено"}
            </label>
          </Field>
          <Field label="Заголовок">
            <input
              type="text"
              value={archive.title}
              onChange={(e) => onChangeArchive({ title: e.target.value })}
              className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
            />
          </Field>
          <Field label="Подпись">
            <input
              type="text"
              value={archive.subtitle}
              onChange={(e) => onChangeArchive({ subtitle: e.target.value })}
              className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
            />
          </Field>
          <Field label="Ссылка">
            <input
              type="url"
              value={archive.url}
              onChange={(e) => onChangeArchive({ url: e.target.value })}
              className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function NewsEditor({
  index,
  item,
  onChange,
  onRemove,
}: {
  index: number;
  item: NewsItem;
  onChange: (patch: Partial<NewsItem>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="bg-[#1d1d27] rounded-xl p-4 border-l-4"
      style={{ borderLeftColor: item.borderColor }}
    >
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[#9aa0a6] text-xs uppercase tracking-widest">
            Баннер #{index}
          </span>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#9aa0a6]">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => onChange({ enabled: e.target.checked })}
              className="w-3.5 h-3.5 accent-[#8b0033]"
            />
            {item.enabled ? "Показан" : "Скрыт"}
          </label>
        </div>
        <button
          onClick={onRemove}
          className="bg-transparent text-[#ff2b2b] border border-[#ff2b2b] px-3 py-1 rounded-md text-xs cursor-pointer hover:bg-[#ff2b2b] hover:text-white transition-colors"
        >
          🗑 Удалить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Заголовок (крупный)">
          <input
            type="text"
            value={item.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="w-full bg-[#14141c] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
          />
        </Field>
        <Field label="Подпись (мелкая)">
          <input
            type="text"
            value={item.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            className="w-full bg-[#14141c] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
          />
        </Field>
        <Field label="Ссылка" className="md:col-span-2">
          <input
            type="url"
            value={item.url}
            onChange={(e) => onChange({ url: e.target.value })}
            className="w-full bg-[#14141c] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <ColorField
          label="Фон"
          value={item.bgColor}
          onChange={(v) => onChange({ bgColor: v })}
        />
        <ColorField
          label="Рамка"
          value={item.borderColor}
          onChange={(v) => onChange({ borderColor: v })}
        />
        <ColorField
          label="Текст"
          value={item.textColor}
          onChange={(v) => onChange({ textColor: v })}
        />
      </div>

      <div className="mt-3">
        <div className="text-[10px] text-[#9aa0a6] uppercase tracking-widest mb-1.5">
          Предпросмотр:
        </div>
        <div
          className="rounded-lg p-3 text-center"
          style={{
            backgroundColor: item.bgColor,
            border: `2px solid ${item.borderColor}`,
            color: item.textColor,
          }}
        >
          <div className="font-black uppercase tracking-wider text-sm">
            {item.title || "— без заголовка —"}
          </div>
          <div className="uppercase text-[10px] tracking-widest opacity-80 mt-0.5">
            {item.subtitle || "— без подписи —"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB: СЕТКА
   ============================================================ */

function BracketTab({
  matches,
  fighters,
  setMatches,
  setFighters,
  createFighter,
}: {
  matches: Match[];
  fighters: Fighter[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  setFighters: React.Dispatch<React.SetStateAction<Fighter[]>>;
  createFighter: (name: string) => string;
}) {
  const maxRound = matches.length
    ? Math.max(...matches.map((m) => m.round))
    : 1;

  function updateMatch(id: string, patch: Partial<Match>) {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }

  function autoWinner(matchId: string) {
    const m = matches.find((x) => x.id === matchId);
    if (!m || !m.fighter1 || !m.fighter2) return;
    if (m.score1 == null && m.score2 == null) return;
    if (m.score1 === m.score2) return;
    const winner = (m.score1 ?? 0) > (m.score2 ?? 0) ? m.fighter1 : m.fighter2;
    updateMatch(matchId, { winner });
  }

  function completeAndAdvance(matchId: string) {
    const m = matches.find((x) => x.id === matchId);
    if (!m || !m.winner || !m.fighter1 || !m.fighter2) return;

    const winnerScore = m.winner === m.fighter1 ? m.score1 : m.score2;
    if (winnerScore != null) {
      const wId = m.winner;
      setFighters((prev) =>
        prev.map((f) =>
          f.id === wId
            ? { ...f, totalScore: (f.totalScore || 0) + winnerScore }
            : f
        )
      );
    }

    setMatches((prev) => {
      let updated = prev.map((x) =>
        x.id === matchId ? { ...x, status: "completed" as const } : x
      );

      if (m.round >= maxRound) return updated;

      const nextIdx = Math.ceil(m.index / 2);
      const slot = m.index % 2 === 1 ? "fighter1" : "fighter2";
      const nextMatch = updated.find(
        (x) => x.round === m.round + 1 && x.index === nextIdx
      );
      if (!nextMatch) return updated;

      updated = updated.map((x) =>
        x.id === nextMatch.id
          ? ({
              ...x,
              [slot]: m.winner,
              winner: null,
              status: "pending" as const,
            } as Match)
          : x
      );
      return updated;
    });
  }

  return (
    <div>
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">
        Инлайн-редактор сетки
      </h3>
      <p className="text-[#9aa0a6] text-xs mb-4">
        Пиши имя бойца в ячейку — если такого нет, он создастся автоматически.
        Заполни баллы, отметь 🏆 победителя, нажми «✓ Завершить и дальше».
      </p>

      <div
        className="grid gap-4 items-start"
        style={{
          gridTemplateColumns: `repeat(${maxRound}, minmax(230px, 1fr))`,
        }}
      >
        {Array.from({ length: maxRound }, (_, i) => i + 1).map((r) => {
          const roundMatches = matches
            .filter((m) => m.round === r)
            .sort((a, b) => a.index - b.index);
          const label =
            r === maxRound
              ? "Финал"
              : r === maxRound - 1 && maxRound >= 3
              ? "Полуфинал"
              : `Раунд ${r}`;

          return (
            <div key={r}>
              <div className="text-[10px] uppercase tracking-widest text-[#9aa0a6] mb-2 font-bold">
                {label}
              </div>
              <div className="flex flex-col gap-3">
                {roundMatches.map((m) => (
                  <BracketMatchEditor
                    key={m.id}
                    match={m}
                    fighters={fighters}
                    onUpdate={(patch) => updateMatch(m.id, patch)}
                    onSetWinner={(fid) => updateMatch(m.id, { winner: fid })}
                    onAutoWinner={() => autoWinner(m.id)}
                    onComplete={() => completeAndAdvance(m.id)}
                    onReset={() =>
                      updateMatch(m.id, {
                        status: "pending",
                        score1: null,
                        score2: null,
                        winner: null,
                      })
                    }
                    createFighter={createFighter}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BracketMatchEditor({
  match,
  fighters,
  onUpdate,
  onSetWinner,
  onAutoWinner,
  onComplete,
  onReset,
  createFighter,
}: {
  match: Match;
  fighters: Fighter[];
  onUpdate: (patch: Partial<Match>) => void;
  onSetWinner: (fighterId: string | null) => void;
  onAutoWinner: () => void;
  onComplete: () => void;
  onReset: () => void;
  createFighter: (name: string) => string;
}) {
  const statusColors: Record<Match["status"], string> = {
    pending: "bg-[#333] text-[#999]",
    betting_open: "bg-[#35d07f] text-[#062a16]",
    tracks_open: "bg-[#00a3ff] text-[#002233]",
    judging: "bg-[#ffb020] text-[#2a1c00]",
    completed: "bg-[#444] text-[#ccc]",
  };

  return (
    <div className="bg-[#1d1d27] border border-[#2a2a36] rounded-xl p-3">
      <div className="flex justify-between items-center mb-2.5 flex-wrap gap-1.5">
        <span className="text-[10px] uppercase tracking-widest text-[#9aa0a6]">
          Матч {match.index}
        </span>
        <span
          className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColors[match.status]}`}
        >
          {matchStatusLabel[match.status]}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <FighterRow
          match={match}
          slot={1}
          fighters={fighters}
          onUpdate={onUpdate}
          onSetWinner={() => onSetWinner(match.fighter1)}
          createFighter={createFighter}
        />
        <FighterRow
          match={match}
          slot={2}
          fighters={fighters}
          onUpdate={onUpdate}
          onSetWinner={() => onSetWinner(match.fighter2)}
          createFighter={createFighter}
        />
      </div>

      <div className="mt-3">
        <select
          value={match.status}
          onChange={(e) =>
            onUpdate({ status: e.target.value as Match["status"] })
          }
          className="w-full bg-[#14141c] text-white border border-[#333] rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#00a3ff]"
        >
          <option value="pending">Ожидание</option>
          <option value="betting_open">Ставки открыты</option>
          <option value="tracks_open">Приём треков</option>
          <option value="judging">Судейство</option>
          <option value="completed">Завершён</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        <button
          onClick={onAutoWinner}
          className="text-[10px] px-2 py-1 rounded-md border border-[#333] bg-transparent text-[#ccc] cursor-pointer hover:border-[#666]"
        >
          Авто-победитель
        </button>
        <button
          onClick={onComplete}
          className="text-[10px] px-2 py-1 rounded-md border-none bg-[#35d07f] text-[#062a16] font-bold cursor-pointer hover:opacity-90"
        >
          ✓ Завершить и дальше
        </button>
        <button
          onClick={onReset}
          className="text-[10px] px-2 py-1 rounded-md border border-[#333] bg-transparent text-[#9aa0a6] cursor-pointer hover:border-[#666]"
        >
          Сбросить
        </button>
      </div>
    </div>
  );
}

function FighterRow({
  match,
  slot,
  fighters,
  onUpdate,
  onSetWinner,
  createFighter,
}: {
  match: Match;
  slot: 1 | 2;
  fighters: Fighter[];
  onUpdate: (patch: Partial<Match>) => void;
  onSetWinner: () => void;
  createFighter: (name: string) => string;
}) {
  const fid = slot === 1 ? match.fighter1 : match.fighter2;
  const fighter = fid ? fighters.find((f) => f.id === fid) : null;
  const score = slot === 1 ? match.score1 : match.score2;
  const isWinner = fid != null && match.winner === fid;

  const [localValue, setLocalValue] = useState(fighter?.name ?? "");

  useEffect(() => {
    setLocalValue(fighter?.name ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fid]);

  function commitName() {
    const v = localValue.trim();
    if (!v) {
      onUpdate(slot === 1 ? { fighter1: null } : { fighter2: null });
      return;
    }
    if (fighter && fighter.name === v) return;

    const existing = fighters.find(
      (f) => f.name.toLowerCase() === v.toLowerCase()
    );
    if (existing) {
      onUpdate(
        slot === 1 ? { fighter1: existing.id } : { fighter2: existing.id }
      );
      return;
    }

    const newId = createFighter(v);
    onUpdate(slot === 1 ? { fighter1: newId } : { fighter2: newId });
  }

  return (
    <div
      className={`flex gap-1.5 items-center p-1.5 rounded-md ${
        isWinner
          ? "border border-[#35d07f] bg-[rgba(53,208,127,0.10)]"
          : "border border-transparent bg-[#14141c]"
      }`}
    >
      <input
        type="text"
        list="fighters-datalist"
        value={localValue}
        placeholder="— имя бойца —"
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={commitName}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="flex-1 min-w-0 bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
      />

      <input
        type="number"
        value={score ?? ""}
        placeholder="—"
        onChange={(e) => {
          const v = e.target.value === "" ? null : +e.target.value;
          onUpdate(slot === 1 ? { score1: v } : { score2: v });
        }}
        className="w-12 bg-[#1d1d27] text-white border border-[#333] rounded-md px-1.5 py-1 text-xs text-center font-bold outline-none focus:border-[#00a3ff]"
      />

      <button
        onClick={onSetWinner}
        disabled={fid == null}
        title="Отметить победителем"
        className={`w-7 h-7 flex items-center justify-center rounded-md border text-sm cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          isWinner
            ? "bg-[#35d07f] text-[#062a16] border-[#35d07f]"
            : "bg-[#1d1d27] text-[#ccc] border-[#333] hover:border-[#666]"
        }`}
      >
        {isWinner ? "🏆" : "○"}
      </button>
    </div>
  );
}

/* ============================================================
   TAB: СЕЗОН
   ============================================================ */

function SeasonTab({
  season,
  setSeason,
  maintenance,
  setMaintenance,
  fighters,
  setFighters,
  setMatches,
}: {
  season: Season;
  setSeason: React.Dispatch<React.SetStateAction<Season>>;
  maintenance: boolean;
  setMaintenance: React.Dispatch<React.SetStateAction<boolean>>;
  fighters: Fighter[];
  setFighters: React.Dispatch<React.SetStateAction<Fighter[]>>;
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
}) {
  const [newSeasonTitle, setNewSeasonTitle] = useState(season.title);
  const [newSeasonNumber, setNewSeasonNumber] = useState(season.number + 1);
  const [newSeasonType, setNewSeasonType] = useState<"official" | "intermediate">(
    season.type
  );
  const [newSeasonSlots, setNewSeasonSlots] = useState<4 | 8 | 16 | 32>(
    ([4, 8, 16, 32].includes(season.slots)
      ? season.slots
      : 8) as 4 | 8 | 16 | 32
  );

  function startNewSeason() {
    if (
      !confirm(
        `Начать новый сезон?\n\nУчастников: ${newSeasonSlots}\nСтавки и треки будут очищены.`
      )
    )
      return;

    const resized = resizeFighterPool(fighters, newSeasonSlots);
    const ids = resized.map((f) => f.id);
    const newMatches = regenerateBracket(ids, resized);

    setFighters(resized);
    setMatches(newMatches);
    setSeason({
      title: newSeasonTitle,
      number: newSeasonNumber,
      type: newSeasonType,
      status: "main",
      slots: newSeasonSlots,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">
          Параметры текущего сезона
        </h3>
        <div className="flex flex-col gap-3 max-w-[720px] mt-4">
          <Field label="Название">
            <input
              type="text"
              value={season.title}
              onChange={(e) =>
                setSeason((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Номер сезона">
              <input
                type="number"
                min={1}
                value={season.number}
                onChange={(e) =>
                  setSeason((prev) => ({
                    ...prev,
                    number: +e.target.value || 1,
                  }))
                }
                className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
              />
            </Field>

            <Field label="Тип">
              <select
                value={season.type}
                onChange={(e) =>
                  setSeason((prev) => ({
                    ...prev,
                    type: e.target.value as Season["type"],
                  }))
                }
                className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
              >
                <option value="official">Официальный</option>
                <option value="intermediate">Промежуточный</option>
              </select>
            </Field>
          </div>

          <Field label="Статус">
            <select
              value={season.status}
              onChange={(e) =>
                setSeason((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
            >
              <option value="draft">Черновик</option>
              <option value="qualifiers">Отборочные</option>
              <option value="main">Основной этап</option>
              <option value="finished">Завершён</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">
          Техработы
        </h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm max-w-[720px] mt-3">
          <input
            type="checkbox"
            checked={maintenance}
            onChange={(e) => setMaintenance(e.target.checked)}
            className="w-4 h-4 accent-[#ff2b2b]"
          />
          {maintenance ? "🔴 Техработы включены" : "⚪ Техработы выключены"}
        </label>
      </div>

      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#ff2b2b] text-sm uppercase tracking-widest mb-1">
          ⚠ Начать новый сезон
        </h3>
        <div className="flex flex-col gap-3 max-w-[720px] mt-4">
          <Field label="Название нового сезона">
            <input
              type="text"
              value={newSeasonTitle}
              onChange={(e) => setNewSeasonTitle(e.target.value)}
              className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Номер">
              <input
                type="number"
                min={1}
                value={newSeasonNumber}
                onChange={(e) => setNewSeasonNumber(+e.target.value || 1)}
                className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
              />
            </Field>

            <Field label="Тип">
              <select
                value={newSeasonType}
                onChange={(e) =>
                  setNewSeasonType(
                    e.target.value as "official" | "intermediate"
                  )
                }
                className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
              >
                <option value="official">Официальный</option>
                <option value="intermediate">Промежуточный</option>
              </select>
            </Field>
          </div>

          <Field label="Количество участников">
            <select
              value={newSeasonSlots}
              onChange={(e) =>
                setNewSeasonSlots(+e.target.value as 4 | 8 | 16 | 32)
              }
              className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
            >
              <option value={4}>4 участника (2 раунда)</option>
              <option value={8}>8 участников (3 раунда)</option>
              <option value={16}>16 участников (4 раунда)</option>
              <option value={32}>32 участника (5 раундов)</option>
            </select>
          </Field>

          <button
            onClick={startNewSeason}
            className="mt-2 bg-[#ff2b2b] text-white font-extrabold px-5 py-3 rounded-lg cursor-pointer border-none hover:opacity-90 self-start"
          >
            🚀 Начать новый сезон
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB: ЮЗЕРЫ
   ============================================================ */

function UsersTab({
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

  function addFreeFighter() {
    const name = prompt("Имя нового бойца:");
    if (!name || !name.trim()) return;
    const newId =
      "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    setFighters((prev) => [
      ...prev,
      { id: newId, name: name.trim(), userId: null, prevScore: 0, totalScore: 0 },
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
          Роли и имена меняются сразу на сервере (без «Сохранить»). Привязка
          бойцов — часть черновика, сохраняется по кнопке внизу.
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
                    `Удалить юзера «${u.displayName}» (${u.login}) полностью?\n\nВсе его слоты отвяжутся.`
                  )
                )
                  return;
                onDeleteUser(u.id);
              }}
              onUnlink={(fid) => unlinkFighter(fid)}
              onLinkFighter={(fid) => {
                setFighters((prev) =>
                  prev.map((f) => (f.id === fid ? { ...f, userId: u.id } : f))
                );
              }}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">
          Бойцы (слоты сетки) — {fighters.length}
        </h3>
        <p className="text-[#9aa0a6] text-xs mb-4">
          Пул всех слотов. К каждому можно привязать юзера или оставить
          свободным. Удаление бойца уберёт его из сетки.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-[#9aa0a6] text-[11px] uppercase tracking-widest">
                <th className="text-left py-2 pr-3 font-semibold">ID</th>
                <th className="text-left py-2 pr-3 font-semibold">Имя</th>
                <th className="text-left py-2 pr-3 font-semibold">Прошлый</th>
                <th className="text-left py-2 pr-3 font-semibold">Сумма</th>
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
                        value={f.prevScore}
                        onChange={(e) =>
                          updateFighter(f.id, {
                            prevScore: +e.target.value || 0,
                          })
                        }
                        className="w-16 bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
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
                        className="w-16 bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
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
          onClick={addFreeFighter}
          className="mt-4 bg-[#8b0033] text-white font-bold px-4 py-2.5 rounded-lg cursor-pointer border-none hover:opacity-90"
        >
          + Добавить свободного бойца
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
  onLinkFighter,
}: {
  user: User;
  fighters: Fighter[];
  onPatch: (patch: any) => void;
  onDelete: () => void;
  onUnlink: (fighterId: string) => void;
  onLinkFighter: (fighterId: string) => void;
}) {
  const linked = fighters.filter((f) => f.userId === user.id);
  const freeFighters = fighters.filter((f) => !f.userId);

  const [displayName, setDisplayName] = useState(user.displayName);
  const [battleNickname, setBattleNickname] = useState(
    user.battleNickname ?? ""
  );

  function saveName() {
    if (displayName !== user.displayName) {
      onPatch({ displayName });
    }
  }

  function saveNickname() {
    if (battleNickname !== (user.battleNickname ?? "")) {
      onPatch({ battleNickname: battleNickname || null });
    }
  }

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
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
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
            value={battleNickname}
            placeholder="—"
            onChange={(e) => setBattleNickname(e.target.value)}
            onBlur={saveNickname}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
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
            title="Удалить юзера"
            className="bg-transparent text-[#ff2b2b] border border-[#ff2b2b] px-3 py-1 rounded-md text-xs cursor-pointer hover:bg-[#ff2b2b] hover:text-white transition-colors"
          >
            🗑 Удалить
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#2a2a36]">
        <div className="text-xs text-[#9aa0a6] uppercase tracking-widest mb-2">
          Привязанные бойцы ({linked.length})
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
                if (e.target.value) onLinkFighter(e.target.value);
                e.target.value = "";
              }}
              className="bg-[#14141c] text-[#00a3ff] border border-dashed border-[#00a3ff] rounded-full px-3 py-1 text-xs cursor-pointer outline-none"
            >
              <option value="">+ привязать слот</option>
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

/* ============================================================
   TAB: МАТЧИ
   ============================================================ */

function MatchesTab({
  matches,
  fighters,
  setMatches,
}: {
  matches: Match[];
  fighters: Fighter[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
}) {
  function update(id: string, patch: Partial<Match>) {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }

  const sorted = [...matches].sort((a, b) =>
    a.round !== b.round ? a.round - b.round : a.index - b.index
  );

  return (
    <div>
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">
        Детальная форма по матчам
      </h3>

      <div className="flex flex-col gap-3">
        {sorted.map((m) => {
          const f1 = m.fighter1
            ? fighters.find((f) => f.id === m.fighter1)
            : null;
          const f2 = m.fighter2
            ? fighters.find((f) => f.id === m.fighter2)
            : null;
          return (
            <div
              key={m.id}
              className="bg-[#1d1d27] border border-[#2a2a36] rounded-xl p-4"
            >
              <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                <span className="font-bold text-sm">
                  Раунд {m.round} · Матч {m.index}
                  <span className="text-[#666] font-mono text-xs ml-2">
                    {m.id}
                  </span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#9aa0a6]">
                  {matchStatusLabel[m.status]}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] text-[#9aa0a6] uppercase tracking-widest mb-1">
                    Боец 1
                  </div>
                  <div className="text-sm mb-2">{f1?.name ?? "— TBD —"}</div>
                  <input
                    type="number"
                    placeholder="балл"
                    value={m.score1 ?? ""}
                    onChange={(e) =>
                      update(m.id, {
                        score1: e.target.value === "" ? null : +e.target.value,
                      })
                    }
                    className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="кэф"
                    value={m.odds1}
                    onChange={(e) =>
                      update(m.id, {
                        odds1: Math.max(1.01, +e.target.value || 1.01),
                      })
                    }
                    className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff] mt-1.5"
                  />
                </div>

                <div>
                  <div className="text-[10px] text-[#9aa0a6] uppercase tracking-widest mb-1">
                    Боец 2
                  </div>
                  <div className="text-sm mb-2">{f2?.name ?? "— TBD —"}</div>
                  <input
                    type="number"
                    placeholder="балл"
                    value={m.score2 ?? ""}
                    onChange={(e) =>
                      update(m.id, {
                        score2: e.target.value === "" ? null : +e.target.value,
                      })
                    }
                    className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="кэф"
                    value={m.odds2}
                    onChange={(e) =>
                      update(m.id, {
                        odds2: Math.max(1.01, +e.target.value || 1.01),
                      })
                    }
                    className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff] mt-1.5"
                  />
                </div>

                <div>
                  <div className="text-[10px] text-[#9aa0a6] uppercase tracking-widest mb-1">
                    Статус и победитель
                  </div>
                  <select
                    value={m.status}
                    onChange={(e) =>
                      update(m.id, {
                        status: e.target.value as Match["status"],
                      })
                    }
                    className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                  >
                    <option value="pending">Ожидание</option>
                    <option value="betting_open">Ставки открыты</option>
                    <option value="tracks_open">Приём треков</option>
                    <option value="judging">Судейство</option>
                    <option value="completed">Завершён</option>
                  </select>

                  <select
                    value={m.winner ?? ""}
                    onChange={(e) =>
                      update(m.id, { winner: e.target.value || null })
                    }
                    className="w-full bg-[#14141c] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff] mt-1.5"
                  >
                    <option value="">— победитель не выбран —</option>
                    {m.fighter1 && (
                      <option value={m.fighter1}>
                        {f1?.name ?? m.fighter1}
                      </option>
                    )}
                    {m.fighter2 && (
                      <option value={m.fighter2}>
                        {f2?.name ?? m.fighter2}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                <button
                  onClick={() => update(m.id, { status: "betting_open" })}
                  className="text-[10px] px-2 py-1 rounded-md bg-[#35d07f] text-[#062a16] font-bold cursor-pointer border-none hover:opacity-90"
                >
                  Открыть ставки
                </button>
                <button
                  onClick={() => update(m.id, { status: "tracks_open" })}
                  className="text-[10px] px-2 py-1 rounded-md bg-[#00a3ff] text-[#002233] font-bold cursor-pointer border-none hover:opacity-90"
                >
                  Приём треков
                </button>
                <button
                  onClick={() => update(m.id, { status: "judging" })}
                  className="text-[10px] px-2 py-1 rounded-md bg-[#ffb020] text-[#2a1c00] font-bold cursor-pointer border-none hover:opacity-90"
                >
                  Судейство
                </button>
                <button
                  onClick={() => update(m.id, { status: "completed" })}
                  className="text-[10px] px-2 py-1 rounded-md bg-[#444] text-[#ccc] font-bold cursor-pointer border-none hover:opacity-90"
                >
                  Завершить
                </button>
                <button
                  onClick={() =>
                    update(m.id, {
                      status: "pending",
                      score1: null,
                      score2: null,
                      winner: null,
                    })
                  }
                  className="text-[10px] px-2 py-1 rounded-md border border-[#333] bg-transparent text-[#9aa0a6] cursor-pointer hover:border-[#666]"
                >
                  Сбросить
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   TAB: ТРЕКИ
   ============================================================ */

function TracksTab({
  tracks,
  fighters,
  matches,
  onChange,
  onRemove,
  onAdd,
}: {
  tracks: Track[];
  fighters: Fighter[];
  matches: Match[];
  onChange: (id: string, patch: Partial<Track>) => void;
  onRemove: (id: string) => void;
  onAdd: (track: Track) => void;
}) {
  const [newFighterId, setNewFighterId] = useState<string>("");
  const [newMatchId, setNewMatchId] = useState<string>("");
  const [newUrl, setNewUrl] = useState<string>("");

  function addManual() {
    if (!newFighterId || !newMatchId || !newUrl.trim()) {
      alert("Выбери бойца, матч и вставь ссылку");
      return;
    }
    onAdd({
      id: "t_" + Date.now(),
      matchId: newMatchId,
      fighterId: newFighterId,
      url: newUrl.trim(),
      isPublished: false,
      score: null,
    });
    setNewFighterId("");
    setNewMatchId("");
    setNewUrl("");
  }

  return (
    <div>
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">
        Все треки (включая скрытые)
      </h3>

      {tracks.length === 0 ? (
        <div className="bg-[#1d1d27] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic mb-4">
          Треков пока нет.
        </div>
      ) : (
        <div className="overflow-x-auto mb-4">
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
              {tracks.map((t) => (
                <tr key={t.id} className="border-t border-[#2a2a36]">
                  <td className="py-2 pr-3">
                    <select
                      value={t.fighterId}
                      onChange={(e) =>
                        onChange(t.id, { fighterId: e.target.value })
                      }
                      className="bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff] w-full min-w-[140px]"
                    >
                      {fighters.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      value={t.matchId}
                      onChange={(e) =>
                        onChange(t.id, { matchId: e.target.value })
                      }
                      className="bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff] w-full min-w-[100px]"
                    >
                      {matches.map((m) => (
                        <option key={m.id} value={m.id}>
                          R{m.round}·M{m.index}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="url"
                      value={t.url}
                      onChange={(e) => onChange(t.id, { url: e.target.value })}
                      className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-1 text-xs outline-none focus:border-[#00a3ff]"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      value={t.score ?? ""}
                      placeholder="—"
                      onChange={(e) =>
                        onChange(t.id, {
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
                        onChange(t.id, { isPublished: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#35d07f]"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <button
                      onClick={() => onRemove(t.id)}
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
        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={newFighterId}
            onChange={(e) => setNewFighterId(e.target.value)}
            className="bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-2 text-xs outline-none focus:border-[#00a3ff]"
          >
            <option value="">— выбери бойца —</option>
            {fighters.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <select
            value={newMatchId}
            onChange={(e) => setNewMatchId(e.target.value)}
            className="bg-[#1d1d27] text-white border border-[#333] rounded-md px-2 py-2 text-xs outline-none focus:border-[#00a3ff]"
          >
            <option value="">— выбери матч —</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                Раунд {m.round} · Матч {m.index}
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
            onClick={addManual}
            className="bg-[#8b0033] text-white font-bold px-4 py-2 rounded-lg cursor-pointer border-none hover:opacity-90 text-xs"
          >
            + Добавить
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB: СТИЛИ
   ============================================================ */

function StyleTab({
  style,
  setStyle,
}: {
  style: StyleConfig;
  setStyle: React.Dispatch<React.SetStateAction<StyleConfig>>;
}) {
  function update(patch: Partial<StyleConfig>) {
    setStyle((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-3">
          Цвета темы
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[720px]">
          <ColorField
            label="Primary (кнопки, баннер)"
            value={style.primary}
            onChange={(v) => update({ primary: v })}
          />
          <ColorField
            label="Accent (рамки, акценты)"
            value={style.accent}
            onChange={(v) => update({ accent: v })}
          />
        </div>
      </div>

      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-3">
          Подсветка участника
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[900px]">
          <ColorField
            label="Активный матч"
            value={style.participantActive}
            onChange={(v) => update({ participantActive: v })}
          />
          <ColorField
            label="Прошёл дальше"
            value={style.participantWin}
            onChange={(v) => update({ participantWin: v })}
          />
          <ColorField
            label="Вылет"
            value={style.participantLoss}
            onChange={(v) => update({ participantLoss: v })}
          />
        </div>
      </div>

      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-3">
          ЧБ-фильтр
        </h3>
        <label className="flex items-center gap-3 cursor-pointer text-sm">
          <input
            type="range"
            min="0"
            max="1"
            step="1"
            value={style.grayscale}
            onChange={(e) => update({ grayscale: +e.target.value })}
            className="w-40 accent-[#8b0033]"
          />
          <span className="text-[#9aa0a6]">
            {style.grayscale === 1 ? "🔴 включён" : "⚪ выключен"}
          </span>
        </label>
      </div>
    </div>
  );
}

/* ============================================================
   TAB: БЭКАП
   ============================================================ */

interface BackupData {
  version: number;
  exportedAt: string;
  season: Season;
  maintenance: boolean;
  news: NewsItem[];
  archive: ArchiveConfig;
  matches: Match[];
  fighters: Fighter[];
  users: User[];
  tracks: Track[];
  style: StyleConfig;
}

function BackupTab({
  season,
  maintenance,
  news,
  archive,
  matches,
  fighters,
  users,
  tracks,
  style,
  onImport,
}: {
  season: Season;
  maintenance: boolean;
  news: NewsItem[];
  archive: ArchiveConfig;
  matches: Match[];
  fighters: Fighter[];
  users: User[];
  tracks: Track[];
  style: StyleConfig;
  onImport: (data: BackupData) => void;
}) {
  function handleExport() {
    const data: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      season,
      maintenance,
      news,
      archive,
      matches,
      fighters,
      users,
      tracks,
      style,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `ldpj-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !confirm(
        "Импорт перезапишет ВСЕ данные в черновике. Продолжить?"
      )
    ) {
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed.matches || !parsed.season) {
          throw new Error("Не похоже на бэкап");
        }
        onImport(parsed as BackupData);
        alert("Импорт выполнен в черновик. Нажми «Сохранить» внизу.");
      } catch (err) {
        alert(
          "Ошибка импорта: " +
            (err instanceof Error ? err.message : "невалидный JSON")
        );
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  const counts = [
    ["Юзеров", users.length],
    ["Бойцов", fighters.length],
    ["Матчей", matches.length],
    ["Треков", tracks.length],
    ["Баннеров", news.length],
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">
          Экспорт
        </h3>
        <div className="bg-[#1d1d27] rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {counts.map(([label, n]) => (
              <div key={label} className="flex justify-between">
                <span className="text-[#9aa0a6]">{label}:</span>
                <span className="font-bold">{n}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleExport}
          className="bg-[#8b0033] text-white font-bold px-5 py-2.5 rounded-lg cursor-pointer border-none hover:opacity-90"
        >
          💾 Скачать backup.json
        </button>
      </div>

      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">
          Импорт
        </h3>
        <label className="inline-block">
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="hidden"
            id="backup-file-input"
          />
          <span
            onClick={() => document.getElementById("backup-file-input")?.click()}
            className="inline-block bg-[#ff2b2b] text-white font-bold px-5 py-2.5 rounded-lg cursor-pointer hover:opacity-90"
          >
            📂 Загрузить backup.json
          </span>
        </label>
      </div>
    </div>
  );
}

/* ============================================================
   ОБЩИЕ ПОЛЯ
   ============================================================ */

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[#9aa0a6] text-xs uppercase tracking-widest">
        {label}
      </span>
      {children}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[#9aa0a6] text-xs uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 bg-transparent border border-[#333] rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-[#14141c] text-white border border-[#333] rounded-lg px-2 py-1.5 outline-none focus:border-[#00a3ff] text-xs font-mono"
        />
      </div>
    </div>
  );
}