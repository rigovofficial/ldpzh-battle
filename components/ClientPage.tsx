"use client";

import { useState, useEffect } from "react";
import TopBar from "./TopBar";
import SeasonHeader from "./SeasonHeader";
import NewsBanners from "./NewsBanners";
import ArchiveBanner from "./ArchiveBanner";
import Bracket from "./Bracket";
import MatchesSection from "./MatchesSection";
import TracksSection from "./TracksSection";
import AdminOverlay from "./AdminOverlay";
import Footer from "./Footer";
import { useAuth } from "@/lib/auth-context";
import {
  mockSeason,
  mockMatches,
  mockTracks,
  mockFighters,
  mockNews,
  mockArchive,
  mockUsers,
  mockStyle,
} from "@/lib/mock-data";
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

export default function ClientPage() {
  const { user } = useAuth();
  const role: Role = (user?.role as Role) ?? "anonymous";
  const currentUserId = user?.id ?? "anon";

  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [fighters, setFighters] = useState<Fighter[]>(mockFighters);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [bets, setBets] = useState<Bet[]>([]);
  const [tracks, setTracks] = useState<Track[]>(mockTracks);
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [archive, setArchive] = useState<ArchiveConfig>(mockArchive);
  const [season, setSeason] = useState<Season>(mockSeason);
  const [style, setStyle] = useState<StyleConfig>(mockStyle);
  const [maintenance, setMaintenance] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Закрываем админку, если роль перестала быть admin
  useEffect(() => {
    if (role !== "admin") setAdminOpen(false);
  }, [role]);

  function placeBet(matchId: string, fighterId: string) {
    const m = matches.find((x) => x.id === matchId);
    if (!m || m.status !== "betting_open") return;
    if (bets.some((b) => b.userId === currentUserId && b.matchId === matchId))
      return;

    const coeff = fighterId === m.fighter1 ? m.odds1 : m.odds2;
    setBets((prev) => [
      ...prev,
      { userId: currentUserId, matchId, fighterId, coeff },
    ]);

    setMatches((prev) =>
      prev.map((x) => {
        if (x.id !== matchId) return x;
        if (fighterId === x.fighter1) {
          return {
            ...x,
            odds1: Math.max(1.01, +(x.odds1 - 0.06).toFixed(2)),
            odds2: +(x.odds2 + 0.07).toFixed(2),
          };
        }
        return {
          ...x,
          odds2: Math.max(1.01, +(x.odds2 - 0.06).toFixed(2)),
          odds1: +(x.odds1 + 0.07).toFixed(2),
        };
      })
    );
  }

  function submitTrack(matchId: string, url: string) {
    const myFighters = fighters.filter((f) => f.userId === currentUserId);
    if (myFighters.length === 0) return;
    const myFighter = myFighters[0];
    setTracks((prev) => [
      ...prev,
      {
        id: "t_" + Date.now(),
        matchId,
        fighterId: myFighter.id,
        url,
        isPublished: false,
        score: null,
      },
    ]);
  }

  function togglePublish(trackId: string) {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, isPublished: !t.isPublished } : t
      )
    );
  }

  function saveAdmin(payload: {
    news: NewsItem[];
    archive: ArchiveConfig;
    matches: Match[];
    fighters: Fighter[];
    users: User[];
    season: Season;
    maintenance: boolean;
    tracks: Track[];
    style: StyleConfig;
  }) {
    setNews(payload.news);
    setArchive(payload.archive);
    setMatches(payload.matches);
    setFighters(payload.fighters);
    setUsers(payload.users);
    setSeason(payload.season);
    setMaintenance(payload.maintenance);
    setTracks(payload.tracks);
    setStyle(payload.style);
  }

  const showMaintenance = maintenance && role !== "admin";

  return (
    <>
      {adminOpen && role === "admin" && (
        <AdminOverlay
          news={news}
          archive={archive}
          matches={matches}
          fighters={fighters}
          users={users}
          season={season}
          maintenance={maintenance}
          tracks={tracks}
          style={style}
          onSave={saveAdmin}
          onClose={() => setAdminOpen(false)}
        />
      )}

      <TopBar onOpenAdmin={() => setAdminOpen(true)} />

      <main
        className="min-h-screen bg-[#0b0b0f] text-[#f5f5f5]"
        style={{ filter: `grayscale(${style.grayscale})` }}
      >
        <div className="max-w-[1180px] mx-auto p-4">
          {showMaintenance ? (
            <div className="bg-[#ff2b2b] text-white text-center p-4 rounded-xl font-bold my-8">
              🛠 САЙТ НА ТЕХРАБОТАХ. ЗАХОДИ ПОЗЖЕ, БРО.
            </div>
          ) : (
            <>
              <SeasonHeader season={season} />

              <NewsBanners items={news} />

              <ArchiveBanner config={archive} />

              <section className="mb-8">
                <h2 className="text-lg font-extrabold uppercase tracking-wide mb-3 pl-2.5 border-l-4 border-[#00a3ff]">
                  Турнирная сетка
                </h2>
                <Bracket
                  matches={matches}
                  fighters={fighters}
                  currentUserId={currentUserId}
                  role={role}
                  style={style}
                />
              </section>

              <MatchesSection
                matches={matches}
                bets={bets}
                fighters={fighters}
                role={role}
                currentUserId={currentUserId}
                onBet={placeBet}
              />

              <TracksSection
                role={role}
                currentUserId={currentUserId}
                matches={matches}
                fighters={fighters}
                tracks={tracks}
                onTrackSubmit={submitTrack}
                onTogglePublish={togglePublish}
              />

              <section className="mb-8">
                <h2 className="text-lg font-extrabold uppercase tracking-wide mb-3 pl-2.5 border-l-4 border-[#00a3ff]">
                  Другие разделы
                </h2>
                <div className="space-y-3">
                  <div className="bg-[#14141c] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic">
                    Командные батлы — «Командный вайб в разработке, ыыы, 69»
                  </div>
                  <div className="bg-[#14141c] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic">
                    Ваше творчество / Оксимешапы — «Раздел недовайбкодили, ЫЫЫ, 69!!!»
                  </div>
                  <div className="bg-[#14141c] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic">
                    Статистика предиктов (Лига Лудоманов / Премия Ванги) — скоро™
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