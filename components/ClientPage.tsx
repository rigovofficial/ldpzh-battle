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
import type { Match, Track, NewsItem, ArchiveConfig, Fighter, Season, User, Bet, StyleConfig, LeaderboardUser, Bracket as BracketType } from "@/lib/types";

type Role = "anonymous" | "user" | "participant" | "admin";

interface ServerData {
  season: Season; maintenance: boolean; maintenanceConfig: any; versionName: string; archive: ArchiveConfig; style: StyleConfig;
  news: NewsItem[]; brackets: BracketType[]; activeBracketId: string; matches: Match[]; fighters: Fighter[]; tracks: Track[]; registrations: any[]; leaderboard: LeaderboardUser[];
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
    if (!data) return;
    const match = data.matches.find(m => m.id === matchId);
    if (!match) return;
    
    const coeff = fighterId === match.fighter1 ? match.odds1 : match.odds2;
    const optimisticBet = { userId: currentUserId, matchId, fighterId, coeff };

    setBets(prev => [...prev, optimisticBet]);

    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, fighterId })
      });

      if (!res.ok) {
        const json = await res.json();
        alert("Ошибка: " + (json.error || "неизвестно"));
        setBets(prev => prev.filter(b => !(b.matchId === matchId && b.userId === currentUserId)));
      } else {
        await reload();
      }
    } catch (err) {
      alert("Сетевая ошибка. Проверьте интернет.");
      setBets(prev => prev.filter(b => !(b.matchId === matchId && b.userId === currentUserId)));
    }
  }

  async function submitTrack(matchId: string, url: string) {
    const res = await fetch("/api/tracks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId, url }) });
    if (res.ok) await reload(); else alert("Ошибка отправки трека");
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
          brackets={data.brackets} activeBracketId={data.activeBracketId}
          users={adminUsers} season={data.season} maintenance={data.maintenance}
          maintenanceConfig={data.maintenanceConfig} versionName={data.versionName}
          tracks={data.tracks} style={data.style} registrations={data.registrations}
          // --- ИСПРАВЛЕННЫЕ КОЛЛБЕКИ ---
          onSave={async (p: any) => {
            try {
              const res = await fetch("/api/admin/save", { method: "PUT", body: JSON.stringify(p) });
              const json = await res.json().catch(() => ({}));
              if (!res.ok) { alert("Ошибка сохранения:\n" + (json.error || "Неизвестная ошибка")); return; }
              await reload(); await reloadUsers(); alert("Сохранено!");
            } catch (err: any) {
              alert("Сетевая ошибка: " + err.message);
            }
          }}
          onDeleteUser={async (id: string) => { await fetch(`/api/admin/users/${id}`, { method: "DELETE" }); await reloadUsers(); await reload(); }}
          onPatchUser={async (id: string, p: any) => { await fetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(p) }); await reloadUsers(); }}
          onApproveReg={async (regId: string, userId: string, nickname: string) => { await fetch("/api/admin/approve", { method: "POST", body: JSON.stringify({ regId, userId, nickname }) }); await reload(); await reloadUsers(); }}
          onResolveBets={async (matchId: string) => {
            if (!confirm("Рассчитать ставки на этот матч? Очки будут начислены/списаны.")) return;
            const res = await fetch("/api/admin/resolve-bets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId }) });
            const json = await res.json();
            if (!res.ok) return alert(json.error);
            alert(`Успешно! Рассчитано ставок: ${json.resolvedCount}`);
            await reload();
          }}
          onClose={() => setAdminOpen(false)}
        />
      )}
      <TopBar onOpenAdmin={() => setAdminOpen(true)} />
      <main className="min-h-screen bg-[#0b0b0f] text-[#f5f5f5]" style={{ filter: `grayscale(${data.style.grayscale})` }}>
        <div className="max-w-[1180px] mx-auto p-4">
          {showMaintenance ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 border-2 border-[#ff2b2b] rounded-2xl bg-[#1a0a0a] mt-10">
               {data.maintenanceConfig?.imageUrl && <img src={data.maintenanceConfig.imageUrl} alt="Markin" className="max-w-[300px] mb-6 rounded-lg shadow-lg" />}
               <h1 className="text-3xl font-black text-[#ff2b2b] uppercase tracking-widest mb-4">{data.maintenanceConfig?.title || "ТЕХРАБОТЫ"}</h1>
               <p className="text-[#9aa0a6] text-lg">{data.maintenanceConfig?.subtitle || "ЗАХОДИ ПОЗЖЕ, БРО"}</p>
            </div>
          ) : (
            <>
              <SeasonHeader season={data.season} />
              <NewsBanners items={data.news} />
              <ArchiveBanner config={data.archive} />
              
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="flex-1">
                  <section className="mb-8">
                    <h2 className="text-lg font-extrabold uppercase tracking-wide mb-3 pl-2.5 border-l-4 border-[#00a3ff]">Турнирная сетка</h2>
                    <Bracket matches={data.matches} fighters={data.fighters} currentUserId={currentUserId} role={role} style={data.style} />
                  </section>
                  <MatchesSection matches={data.matches} bets={bets} fighters={data.fighters} role={role} currentUserId={currentUserId} onBet={placeBet} />
                  <TracksSection role={role} currentUserId={currentUserId} matches={data.matches} fighters={data.fighters} tracks={data.tracks} onTrackSubmit={submitTrack} onTogglePublish={togglePublish} />
                </div>

                <div className="w-full md:w-[350px] flex flex-col gap-6">
                  <div className="bg-[#14141c] border border-[#ffb020] rounded-xl p-4 shadow-[0_0_15px_rgba(255,176,32,0.2)]">
                    <h3 className="text-[#ffb020] font-black uppercase tracking-widest text-center mb-4 border-b border-[#2a2a36] pb-2">🏆 Премия Ванги</h3>
                    <div className="flex flex-col gap-2">
                      {data.leaderboard?.length === 0 && <div className="text-[#9aa0a6] text-center text-sm">Пока нет предсказаний</div>}
                      {data.leaderboard?.map((u, i) => (
                        <div key={u.id} className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2">
                            <span className={`text-xs font-bold w-4 ${i === 0 ? "text-[#ffd700]" : i === 1 ? "text-[#c0c0c0]" : i === 2 ? "text-[#cd7f32]" : "text-[#666]"}`}>{i + 1}.</span>
                            <span className="text-white">{u.displayName}</span>
                          </span>
                          <span className="text-[#35d07f] font-mono font-bold">{u.points} 🔮</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div id="registration-block" className="scroll-mt-24 bg-[#14141c] border border-[#00a3ff] rounded-xl p-4">
                    <h3 className="text-[#00a3ff] font-black uppercase tracking-widest mb-4 text-center">Запись на батл</h3>
                    {role === "anonymous" && (
                       <div className="text-center text-[#9aa0a6] text-sm p-4 border border-dashed border-[#333] rounded-lg">
                         Зарегистрируйтесь или войдите, чтобы записаться на батл.
                       </div>
                    )}
                    {role === "user" && data.season?.registration?.enabled && !myReg && regStatus !== "success" && (
                      <div className="flex flex-col gap-3">
                        <input type="text" placeholder="Твой боевой ник" value={regNickname} onChange={(e) => setRegNickname(e.target.value)} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded-lg px-4 py-3 outline-none focus:border-[#00a3ff]" />
                        <button onClick={handleRegister} style={{ backgroundColor: data.season.registration.buttonColor }} className="text-white font-extrabold px-6 py-3 rounded-lg hover:opacity-90 w-full">{data.season.registration.buttonText}</button>
                      </div>
                    )}
                    {myReg && (
                      <div className="p-3 bg-[#1d1d27] border border-[#35d07f] rounded-lg text-[#35d07f] text-center text-sm font-bold">
                        Вы подали заявку как "{myReg.desired_nickname}". Ждите.
                      </div>
                    )}
                    {role === "participant" && (
                      <div className="p-3 bg-[#1d1d27] border border-[#00a3ff] rounded-lg text-[#00a3ff] text-center text-sm font-bold">
                        Ты уже участник батла.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Footer version={data.versionName} />
            </>
          )}
        </div>
      </main>
    </>
  );
}