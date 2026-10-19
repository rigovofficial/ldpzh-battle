"use client";

import { useState, useEffect, useCallback } from "react";
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
import type { Match, Track, NewsItem, ArchiveConfig, Fighter, Season, User, Bet, StyleConfig } from "@/lib/types";

type Role = "anonymous" | "user" | "participant" | "admin";

interface ServerData {
  season: Season; maintenance: boolean; archive: ArchiveConfig; style: StyleConfig;
  news: NewsItem[]; matches: Match[]; fighters: Fighter[]; tracks: Track[]; registrations: any[];
}

export default function ClientPage() {
  const { user } = useAuth();
  const role: Role = (user?.role as Role) ?? "anonymous";
  const currentUserId = user?.id ?? "anon";

  const [data, setData] = useState<ServerData | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [regNickname, setRegNickname] = useState("");
  const [regStatus, setRegStatus] = useState<"idle" | "success" | "error">("idle");

  const reload = useCallback(async () => {
    try {
      const [resData, resBets] = await Promise.all([fetch("/api/data", { cache: "no-store" }), fetch("/api/bets", { cache: "no-store" })]);
      const jsonData = await resData.json();
      const jsonBets = await resBets.json();
      setData(jsonData);
      setBets(jsonBets.bets || []);
    } catch (err) { console.error(err); }
  }, []);

  const reloadUsers = useCallback(async () => {
    if (role !== "admin") return;
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const json = await res.json();
    setAdminUsers(json.users ?? []);
  }, [role]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { if (adminOpen) reloadUsers(); }, [adminOpen, reloadUsers]);
  useEffect(() => { if (role !== "admin") setAdminOpen(false); }, [role]);

  async function handleRegister() {
    if (!regNickname.trim()) return;
    const res = await fetch("/api/battle/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nickname: regNickname }) });
    if (res.ok) { setRegStatus("success"); reload(); } else { setRegStatus("error"); }
  }

  async function placeBet(matchId: string, fighterId: string) {
    const res = await fetch("/api/bets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId, fighterId }) });
    if (res.ok) await reload();
    else alert("Ошибка ставки");
  }

  async function submitTrack(matchId: string, url: string) {
    const res = await fetch("/api/tracks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId, url }) });
    if (res.ok) await reload();
    else alert("Ошибка отправки трека");
  }

  async function togglePublish(trackId: string) {
    const track = data?.tracks.find(t => t.id === trackId);
    if (!track) return;
    await fetch("/api/tracks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackId, isPublished: !track.isPublished }) });
    await reload();
  }

  if (!data) return <div className="min-h-screen flex items-center justify-center text-white bg-[#0b0b0f]">Загрузка...</div>;

  const showMaintenance = data.maintenance && role !== "admin";
  const myReg = data.registrations?.find((r: any) => r.user_id === currentUserId);

  return (
    <>
      {adminOpen && role === "admin" && (
        <AdminOverlay
          news={data.news} archive={data.archive} matches={data.matches} fighters={data.fighters}
          users={adminUsers} season={data.season} maintenance={data.maintenance}
          tracks={data.tracks} style={data.style} registrations={data.registrations}
          onSave={async (p) => {
            const res = await fetch("/api/admin/save", { method: "PUT", body: JSON.stringify(p) });
            if (!res.ok) { alert("Ошибка сохранения"); return; }
            await reload(); await reloadUsers(); alert("Сохранено!");
          }}
          onDeleteUser={async (id) => { await fetch(`/api/admin/users/${id}`, { method: "DELETE" }); await reloadUsers(); await reload(); }}
          onPatchUser={async (id, p) => { await fetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(p) }); await reloadUsers(); }}
          onApproveReg={async (regId, userId, nickname) => { await fetch("/api/admin/approve", { method: "POST", body: JSON.stringify({ regId, userId, nickname }) }); await reload(); await reloadUsers(); }}
          onClose={() => setAdminOpen(false)}
        />
      )}
      <TopBar onOpenAdmin={() => setAdminOpen(true)} />
      <main className="min-h-screen bg-[#0b0b0f] text-[#f5f5f5]" style={{ filter: `grayscale(${data.style.grayscale})` }}>
        <div className="max-w-[1180px] mx-auto p-4">
          {showMaintenance ? (
            <div className="bg-[#ff2b2b] text-white text-center p-4 rounded-xl font-bold my-8">🛠 САЙТ НА ТЕХРАБОТАХ.</div>
          ) : (
            <>
              <SeasonHeader season={data.season} />
              <NewsBanners items={data.news} />
              <ArchiveBanner config={data.archive} />
              {role === "user" && data.season?.registration?.enabled && !myReg && regStatus !== "success" && (
                <div className="mb-8 p-4 bg-[#14141c] border border-[#00a3ff] rounded-xl flex flex-col md:flex-row items-center gap-4">
                  <input type="text" placeholder="Твой боевой ник" value={regNickname} onChange={(e) => setRegNickname(e.target.value)} className="flex-1 bg-[#1d1d27] text-white border border-[#333] rounded-lg px-4 py-3 outline-none focus:border-[#00a3ff]" />
                  <button onClick={handleRegister} style={{ backgroundColor: data.season.registration.buttonColor }} className="text-white font-extrabold px-6 py-3 rounded-lg hover:opacity-90 w-full md:w-auto">{data.season.registration.buttonText}</button>
                </div>
              )}
              {myReg && <div className="mb-8 p-4 bg-[#1d1d27] border border-[#35d07f] rounded-xl text-[#35d07f] text-center font-bold">Вы уже подали заявку как <span className="text-white">"{myReg.desired_nickname}"</span>. Ожидайте одобрения.</div>}
              <section className="mb-8">
                <h2 className="text-lg font-extrabold uppercase tracking-wide mb-3 pl-2.5 border-l-4 border-[#00a3ff]">Турнирная сетка</h2>
                <Bracket matches={data.matches} fighters={data.fighters} currentUserId={currentUserId} role={role} style={data.style} />
              </section>
              <MatchesSection matches={data.matches} bets={bets} fighters={data.fighters} role={role} currentUserId={currentUserId} onBet={placeBet} />
              <TracksSection role={role} currentUserId={currentUserId} matches={data.matches} fighters={data.fighters} tracks={data.tracks} onTrackSubmit={submitTrack} onTogglePublish={togglePublish} />
              <Footer />
            </>
          )}
        </div>
      </main>
    </>
  );
}