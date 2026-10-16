"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopBar from "./TopBar";
import SeasonHeader from "./SeasonHeader";
import NewsBanners from "./NewsBanners";
import ArchiveBanner from "./ArchiveBanner";
import Bracket from "./Bracket";
import MatchesSection from "./MatchesSection";
import TracksSection from "./TracksSection";
import AdminOverlay from "./AdminOverlay";
import Footer from "./Footer";
import MaintenancePage from "./MaintenancePage";
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
  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (!res.ok) throw new Error("load failed");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
  }, []);

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

  // Если данные не пришли за 8 секунд — отправляем на /vpn
  useEffect(() => {
    if (data) return;
    const timer = setTimeout(() => {
      router.push("/vpn");
    }, 8000);
    return () => clearTimeout(timer);
  }, [data, router]);

  useEffect(() => {
    if (adminOpen) reloadUsers();
  }, [adminOpen, reloadUsers]);

  useEffect(() => {
    if (role !== "admin") setAdminOpen(false);
  }, [role]);

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
    const myFighters = data.fighters.filter((f) => f.userId === currentUserId);
    if (myFighters.length === 0) return;
    const myFighter = myFighters[0];
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
                fighterId: myFighter.id,
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
        json = { error: text || "Пустой ответ сервера" };
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
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
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

  

  // Если включён глобальный режим заглушки — админ видит сайт, остальные видят MaintenancePage.
  // Пока роль не известна (идёт загрузка сессии) — нейтральный экран «Загрузка...».
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
          matches={data.matches}
          fighters={data.fighters}
          users={adminUsers}
          season={data.season}
          maintenance={data.maintenance}
          tracks={data.tracks}
          style={data.style}
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

              <section className="mb-8">
                <h2 className="text-lg font-extrabold uppercase tracking-wide mb-3 pl-2.5 border-l-4 border-[#00a3ff]">
                  Турнирная сетка
                </h2>
                <Bracket
                  matches={data.matches}
                  fighters={data.fighters}
                  currentUserId={currentUserId}
                  role={role}
                  style={data.style}
                />
              </section>

              <MatchesSection
                matches={data.matches}
                bets={data.bets}
                fighters={data.fighters}
                role={role}
                currentUserId={currentUserId}
                onBet={placeBet}
              />

              <TracksSection
                role={role}
                currentUserId={currentUserId}
                matches={data.matches}
                fighters={data.fighters}
                tracks={data.tracks}
                onTrackSubmit={submitTrack}
                onTogglePublish={togglePublish}
              />

              <section className="mb-8">
                <h2 className="text-lg font-extrabold uppercase tracking-wide mb-3 pl-2.5 border-l-4 border-[#00a3ff]">
                  Другие разделы
                </h2>
                <div className="space-y-3">
                  
                  </div>
                  <div className="bg-[#14141c] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic">
                    Ваше творчество / Оксимешапы — «Скоро всё будет, ЫЫЫ»
                  </div>
                  <div className="bg-[#14141c] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic">
                    Все должны зиговать
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
