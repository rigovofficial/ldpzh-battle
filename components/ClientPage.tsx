"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import TopBar from "./TopBar";
import SeasonHeader from "./SeasonHeader";
import NewsBanners from "./NewsBanners";
import ArchiveBanner from "./ArchiveBanner";
import BoardTabs from "./BoardTabs";
import Bracket from "./Bracket";
import MatchesSection from "./MatchesSection";
import TracksSection from "./TracksSection";
import AdminOverlay from "./AdminOverlay";
import MaintenancePage from "./MaintenancePage";
import Footer from "./Footer";
import { useAuth } from "@/lib/auth-context";
import type {
  Match,
  Track,
  NewsItem,
  ArchiveConfig,
  Fighter,
  Season,
  User,
  Bet,
  StyleConfig,
  Board,
  Participation,
} from "@/lib/types";

type Role = "anonymous" | "user" | "participant" | "admin";

interface ServerData {
  season: Season;
  maintenance: boolean;
  archive: ArchiveConfig;
  style: StyleConfig;
  news: NewsItem[];
  boards: Board[];
  fighters: Fighter[];
  participations: Participation[];
  matches: Match[];
  tracks: Track[];
  bets: Bet[];
}

export default function ClientPage({
  maintenanceMode = false,
}: {
  maintenanceMode?: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const role: Role = (user?.role as Role) ?? "anonymous";
  const currentUserId = user?.id ?? "anon";

  const [data, setData] = useState<ServerData | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (!res.ok) throw new Error("load failed");
      const json = await res.json();
      setData(json);
      if (!activeBoardId && json.boards?.length) {
        const firstVisible =
          json.boards.find((b: Board) => b.showOnHome) ?? json.boards[0];
        setActiveBoardId(firstVisible.id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [activeBoardId]);

  const reloadUsers = useCallback(async () => {
    if (role !== "admin") return;
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setAdminUsers(json.users ?? []);
    } catch (err) {
      console.error(err);
    }
  }, [role]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (adminOpen) reloadUsers();
  }, [adminOpen, reloadUsers]);

  useEffect(() => {
    if (role !== "admin") setAdminOpen(false);
  }, [role]);

  // Таймаут — редирект на /vpn, если данных нет за 8 сек
  useEffect(() => {
    if (data || maintenanceMode) return;
    const timer = setTimeout(() => router.push("/vpn"), 8000);
    return () => clearTimeout(timer);
  }, [data, router, maintenanceMode]);

  const visibleBoards = useMemo(() => {
    if (!data) return [] as Board[];
    if (role === "admin") return data.boards;
    return data.boards.filter(
      (b) => b.showOnHome && b.status !== "hidden" && b.status !== "draft"
    );
  }, [data, role]);

  const activeBoard = useMemo(() => {
    if (!data || !activeBoardId) return null;
    return data.boards.find((b) => b.id === activeBoardId) ?? null;
  }, [data, activeBoardId]);

  const boardMatches = useMemo(() => {
    if (!data || !activeBoard) return [] as Match[];
    return data.matches.filter((m) => m.boardId === activeBoard.id);
  }, [data, activeBoard]);

  const boardTracks = useMemo(() => {
    if (!data || !activeBoard) return [] as Track[];
    const matchIds = new Set(boardMatches.map((m) => m.id));
    return data.tracks.filter((t) => matchIds.has(t.matchId));
  }, [data, activeBoard, boardMatches]);

  async function placeBet(matchId: string, team: 0 | 1) {
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, team }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "Не удалось сделать ставку");
        return;
      }
      await reload();
    } catch {
      alert("Сетевая ошибка");
    }
  }

  function submitTrack(matchId: string, url: string) {
    if (!data) return;
    const myIds = new Set(
      data.fighters.filter((f) => f.userId === currentUserId).map((f) => f.id)
    );
    const match = data.matches.find((m) => m.id === matchId);
    if (!match) return;
    const myFid = match.teams
      .flatMap((t) => t.fighterIds)
      .find((id) => myIds.has(id));
    if (!myFid) return;
    setData((prev) =>
      !prev
        ? prev
        : {
            ...prev,
            tracks: [
              ...prev.tracks,
              {
                id: "t_" + Date.now(),
                matchId,
                fighterId: myFid,
                url,
                isPublished: false,
                score: null,
              },
            ],
          }
    );
  }

  function togglePublish(trackId: string) {
    setData((prev) =>
      !prev
        ? prev
        : {
            ...prev,
            tracks: prev.tracks.map((t) =>
              t.id === trackId ? { ...t, isPublished: !t.isPublished } : t
            ),
          }
    );
  }

  async function saveAdmin(payload: any) {
    try {
      const res = await fetch("/api/admin/save", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch {
        json = { error: text || "Пустой ответ" };
      }
      if (!res.ok) {
        alert(
          "Не удалось сохранить (" +
            res.status +
            "):\n\n" +
            (json.error ?? "неизвестная ошибка")
        );
        return;
      }
      await reload();
      if (role === "admin") await reloadUsers();
      alert("Сохранено!");
    } catch (err) {
      alert(
        "Сетевая ошибка:\n\n" +
          (err instanceof Error ? err.message : "неизвестно")
      );
    }
  }

  async function deleteUser(userId: string) {
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      alert("Не удалось удалить: " + (json.error ?? "ошибка"));
      return;
    }
    await reloadUsers();
    await reload();
  }

  async function patchUser(userId: string, patch: any) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    if (!res.ok) {
      alert("Не удалось: " + (json.error ?? "ошибка"));
      return;
    }
    await reloadUsers();
  }

  // Режим глобальной заглушки
  if (maintenanceMode) {
    if (!user) {
      return (
        <>
          <TopBar onOpenAdmin={() => setAdminOpen(true)} />
          <div className="min-h-screen flex items-center justify-center text-[#9aa0a6] bg-[#0b0b0f]">
            Загрузка...
          </div>
        </>
      );
    }
    if (role !== "admin") {
      return <MaintenancePage />;
    }
  }

  if (!data) {
    return (
      <>
        <TopBar onOpenAdmin={() => setAdminOpen(true)} />
        <div className="min-h-screen flex items-center justify-center text-[#9aa0a6] bg-[#0b0b0f]">
          Загрузка...
        </div>
      </>
    );
  }

  const showMaintenance = data.maintenance && role !== "admin";

  return (
    <>
      {adminOpen && role === "admin" && (
        <AdminOverlay
          news={data.news}
          archive={data.archive}
          style={data.style}
          boards={data.boards}
          fighters={data.fighters}
          participations={data.participations}
          matches={data.matches}
          tracks={data.tracks}
          users={adminUsers}
          maintenance={data.maintenance}
          onSave={saveAdmin}
          onDeleteUser={deleteUser}
          onPatchUser={patchUser}
          onClose={() => setAdminOpen(false)}
        />
      )}

      <TopBar onOpenAdmin={() => setAdminOpen(true)} />

      <main
        className="min-h-screen bg-[#0b0b0f] text-[#f5f5f5]"
        style={{ filter: `grayscale(${data.style.grayscale})` }}
      >
        <div className="max-w-[1180px] mx-auto p-4">
          {showMaintenance ? (
            <div className="bg-[#ff2b2b] text-white text-center p-4 rounded-xl font-bold my-8">
              🛠 САЙТ НА ТЕХРАБОТАХ. ЗАХОДИ ПОЗЖЕ, БРО.
            </div>
          ) : (
            <>
              <SeasonHeader season={data.season} />
              <NewsBanners items={data.news} />
              <ArchiveBanner config={data.archive} />

              <BoardTabs
                boards={visibleBoards}
                activeId={activeBoardId ?? ""}
                onChange={setActiveBoardId}
              />

              {!activeBoard && (
                <div className="bg-[#14141c] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic mb-8">
                  Нет доступных сеток.
                </div>
              )}

              {activeBoard && (
                <>
                  <section className="mb-8">
                    <h2 className="text-lg font-extrabold uppercase tracking-wide mb-3 pl-2.5 border-l-4 border-[#00a3ff]">
                      Турнирная сетка · {activeBoard.title}
                    </h2>
                    <Bracket
                      matches={boardMatches}
                      fighters={data.fighters}
                      currentUserId={currentUserId}
                      role={role}
                      style={data.style}
                    />
                  </section>

                  <MatchesSection
                    matches={boardMatches}
                    bets={data.bets}
                    fighters={data.fighters}
                    role={role}
                    currentUserId={currentUserId}
                    onBet={placeBet}
                  />

                  <TracksSection
                    role={role}
                    currentUserId={currentUserId}
                    matches={boardMatches}
                    fighters={data.fighters}
                    tracks={boardTracks}
                    onTrackSubmit={submitTrack}
                    onTogglePublish={togglePublish}
                  />
                </>
              )}

              <section className="mb-8">
                <h2 className="text-lg font-extrabold uppercase tracking-wide mb-3 pl-2.5 border-l-4 border-[#00a3ff]">
                  Другие разделы
                </h2>
                <div className="space-y-3">
                  <div className="bg-[#14141c] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic">
                    Ваше творчество / Оксимешапы — «Скоро всё будет, ЫЫЫ»
                  </div>
                  <div className="bg-[#14141c] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic">
                    Статистика предиктов — Лига Лудоманов / Премия Ванги
                  </div>
                </div>
              </section>

              <Footer />
            </>
          )}
        </div>
      </main>
    </>
  );
}