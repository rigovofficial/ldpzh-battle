"use client";

import { useState } from "react";
import type {
  NewsItem,
  ArchiveConfig,
  Match,
  Fighter,
  User,
  Track,
  StyleConfig,
  Board,
  Participation,
} from "@/lib/types";
import BoardTab from "./admin/BoardTab";
import MatchesTab from "./admin/MatchesTab";

const TABS = [
  { id: "news", label: "📰 Новости" },
  { id: "boards", label: "🥊 Сетки" },
  { id: "matches", label: "⚔ Матчи" },
  { id: "users", label: "👥 Юзеры" },
  { id: "tracks", label: "🎵 Треки" },
  { id: "style", label: "🎨 Стили" },
  { id: "backup", label: "💾 Бэкап" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminOverlay({
  news: newsProp,
  archive: archiveProp,
  style: styleProp,
  boards: boardsProp,
  fighters: fightersProp,
  participations: participationsProp,
  matches: matchesProp,
  tracks: tracksProp,
  users,
  maintenance: maintenanceProp,
  onSave,
  onDeleteUser,
  onPatchUser,
  onClose,
}: {
  news: NewsItem[];
  archive: ArchiveConfig;
  style: StyleConfig;
  boards: Board[];
  fighters: Fighter[];
  participations: Participation[];
  matches: Match[];
  tracks: Track[];
  users: User[];
  maintenance: boolean;
  onSave: (payload: any) => Promise<void>;
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
  const [draftStyle, setDraftStyle] = useState<StyleConfig>(() =>
    JSON.parse(JSON.stringify(styleProp))
  );
  const [draftMaintenance, setDraftMaintenance] = useState(maintenanceProp);

  const [draftBoards, setDraftBoards] = useState<Board[]>(() =>
    JSON.parse(JSON.stringify(boardsProp))
  );
  const [draftFighters, setDraftFighters] = useState<Fighter[]>(() =>
    JSON.parse(JSON.stringify(fightersProp))
  );
  const [draftParticipations, setDraftParticipations] = useState<
    Participation[]
  >(() => JSON.parse(JSON.stringify(participationsProp)));
  const [draftMatches, setDraftMatches] = useState<Match[]>(() =>
    JSON.parse(JSON.stringify(matchesProp))
  );
  const [draftTracks, setDraftTracks] = useState<Track[]>(() =>
    JSON.parse(JSON.stringify(tracksProp))
  );

  const dirty =
    JSON.stringify(draftNews) !== JSON.stringify(newsProp) ||
    JSON.stringify(draftArchive) !== JSON.stringify(archiveProp) ||
    JSON.stringify(draftStyle) !== JSON.stringify(styleProp) ||
    draftMaintenance !== maintenanceProp ||
    JSON.stringify(draftBoards) !== JSON.stringify(boardsProp) ||
    JSON.stringify(draftFighters) !== JSON.stringify(fightersProp) ||
    JSON.stringify(draftParticipations) !==
      JSON.stringify(participationsProp) ||
    JSON.stringify(draftMatches) !== JSON.stringify(matchesProp) ||
    JSON.stringify(draftTracks) !== JSON.stringify(tracksProp);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        news: draftNews,
        archive: draftArchive,
        style: draftStyle,
        maintenance: draftMaintenance,
        boards: draftBoards,
        fighters: draftFighters,
        participations: draftParticipations,
        matches: draftMatches,
        tracks: draftTracks,
      });
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (dirty && !confirm("Есть несохранённые изменения. Закрыть без сохранения?"))
      return;
    onClose();
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
                if (!confirm("Удалить баннер?")) return;
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

          {tab === "boards" && (
            <BoardTab
              boards={draftBoards}
              matches={draftMatches}
              fighters={draftFighters}
              participations={draftParticipations}
              setBoards={setDraftBoards}
              setMatches={setDraftMatches}
              setFighters={setDraftFighters}
              setParticipations={setDraftParticipations}
            />
          )}

          {tab === "matches" && (
            <MatchesTab
              boards={draftBoards}
              matches={draftMatches}
              fighters={draftFighters}
              setMatches={setDraftMatches}
            />
          )}

          {tab === "style" && (
            <StyleTab style={draftStyle} setStyle={setDraftStyle} />
          )}

          {tab === "backup" && (
            <BackupTab
              news={draftNews}
              archive={draftArchive}
              style={draftStyle}
              boards={draftBoards}
              fighters={draftFighters}
              participations={draftParticipations}
              matches={draftMatches}
              tracks={draftTracks}
              users={users}
              maintenance={draftMaintenance}
              onImport={(data) => {
                if (data.news) setDraftNews(data.news);
                if (data.archive) setDraftArchive(data.archive);
                if (data.style) setDraftStyle(data.style);
                if (typeof data.maintenance === "boolean")
                  setDraftMaintenance(data.maintenance);
                if (data.boards) setDraftBoards(data.boards);
                if (data.fighters) setDraftFighters(data.fighters);
                if (data.participations)
                  setDraftParticipations(data.participations);
                if (data.matches) setDraftMatches(data.matches);
                if (data.tracks) setDraftTracks(data.tracks);
              }}
            />
          )}

          {(tab === "users" || tab === "tracks") && <Placeholder tab={tab} />}
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
            onClick={handleClose}
            className="bg-transparent border border-[#333] text-[#9aa0a6] px-4 py-2.5 rounded-lg cursor-pointer hover:border-[#666]"
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

/* ==== НОВОСТИ (без изменений) ==== */

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
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">
          Новостные баннеры
        </h3>
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
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">
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
        <Field label="Заголовок">
          <input
            type="text"
            value={item.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="w-full bg-[#14141c] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
          />
        </Field>
        <Field label="Подпись">
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
    </div>
  );
}

/* ==== СТИЛИ (без изменений) ==== */

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
            label="Primary"
            value={style.primary}
            onChange={(v) => update({ primary: v })}
          />
          <ColorField
            label="Accent"
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
            label="Прошёл"
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

/* ==== БЭКАП (без изменений) ==== */

function BackupTab({
  news,
  archive,
  style,
  boards,
  fighters,
  participations,
  matches,
  tracks,
  users,
  maintenance,
  onImport,
}: any) {
  function handleExport() {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      news,
      archive,
      style,
      boards,
      fighters,
      participations,
      matches,
      tracks,
      users,
      maintenance,
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
    if (!confirm("Импорт перезапишет черновик. Продолжить?")) {
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        onImport(parsed);
        alert("Импорт выполнен в черновик. Нажми «Сохранить».");
      } catch (err) {
        alert("Ошибка импорта: " + (err instanceof Error ? err.message : "?"));
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">
          Экспорт
        </h3>
        <div className="bg-[#1d1d27] rounded-xl p-4 mb-4 text-sm grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="flex justify-between">
            <span className="text-[#9aa0a6]">Юзеров:</span>
            <span className="font-bold">{users.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9aa0a6]">Бойцов:</span>
            <span className="font-bold">{fighters.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9aa0a6]">Сеток:</span>
            <span className="font-bold">{boards.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9aa0a6]">Матчей:</span>
            <span className="font-bold">{matches.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9aa0a6]">Треков:</span>
            <span className="font-bold">{tracks.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9aa0a6]">Баннеров:</span>
            <span className="font-bold">{news.length}</span>
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

/* ==== ЗАГЛУШКА ==== */

function Placeholder({ tab }: { tab: TabId }) {
  return (
    <div className="text-center py-16">
      <div className="text-[#9aa0a6] text-sm mb-3 uppercase tracking-widest">
        🚧 В разработке
      </div>
      <div className="text-[#f5f5f5] text-base max-w-[560px] mx-auto leading-relaxed">
        {tab === "users"
          ? "Управление юзерами — в следующем шаге."
          : "Управление треками — в следующем шаге."}
      </div>
    </div>
  );
}

/* ==== ОБЩИЕ ==== */

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