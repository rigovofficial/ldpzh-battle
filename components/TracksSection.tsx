"use client";

import { useState } from "react";
import type { Match, Track, Fighter } from "@/lib/types";

type Role = "anonymous" | "user" | "participant" | "admin";

export default function TracksSection({
  role, currentUserId, matches, fighters, tracks, onTrackSubmit, onTogglePublish,
}: {
  role: Role; currentUserId: string; matches: Match[]; fighters: Fighter[]; tracks: Track[];
  onTrackSubmit: (matchId: string, url: string) => void; onTogglePublish: (trackId: string) => void;
}) {
  const [urlInput, setUrlInput] = useState("");
  const myFighter = fighters.find((f) => f.userId === currentUserId);
  const openMatch = role === "participant" && myFighter ? matches.find((m) => (m.fighter1 === myFighter.id || m.fighter2 === myFighter.id) && m.status === "tracks_open") : null;
  const myExistingTrack = myFighter && openMatch ? tracks.find((t) => t.matchId === openMatch.id && t.fighterId === myFighter.id) : null;
  const canSubmit = !!openMatch && !myExistingTrack;

  const visibleTracks = tracks.filter((t) => role === "admin" || (myFighter && t.fighterId === myFighter.id) || t.isPublished);

  return (
    <section className="mb-8">
      <h2 className="text-lg font-extrabold uppercase tracking-wide mb-3 pl-2.5 border-l-4 border-[#00a3ff]">Треки</h2>
      {role === "participant" && openMatch && canSubmit && (
        <div className="mb-4 p-4 bg-[#1d1d27] rounded-xl">
          <div className="text-[13px] text-[#9aa0a6] mb-3">Матч: раунд {openMatch.round}, матч {openMatch.index} — приём открыт</div>
          <div className="flex gap-2 flex-wrap">
            <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://soundcloud.com/..." className="flex-1 min-w-[240px] px-3 py-2.5 rounded-lg bg-[#14141c] text-white border border-[#333] outline-none focus:border-[#00a3ff]" />
            <button onClick={() => { const url = urlInput.trim(); if (!url) return; onTrackSubmit(openMatch.id, url); setUrlInput(""); }} className="px-4 py-2.5 rounded-lg border-none bg-[#8b0033] text-white font-bold hover:opacity-85">Сдать трек</button>
          </div>
        </div>
      )}
      {role === "participant" && openMatch && myExistingTrack && (
        <div className="mb-4 p-4 bg-[#1d1d27] rounded-xl text-[13px]">
          Трек сдан: <a href={myExistingTrack.url} target="_blank" rel="noopener noreferrer" className="text-[#00a3ff] underline">{myExistingTrack.url}</a>
          {myExistingTrack.isPublished ? <span className="text-[#35d07f] ml-2">(опубликован)</span> : <span className="text-[#ffb020] ml-2">(скрыт)</span>}
        </div>
      )}
      {visibleTracks.length === 0 ? <div className="bg-[#14141c] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic">Нет треков.</div> : (
        <div className="flex flex-col gap-2">
          {visibleTracks.map((t) => {
            const fighter = fighters.find((f) => f.id === t.fighterId);
            return (
              <div key={t.id} className={`bg-[#1d1d27] rounded-lg px-4 py-3 flex justify-between items-center gap-3 flex-wrap text-[13px] border-l-[3px] ${t.isPublished ? "border-l-[#35d07f]" : "border-l-[#ffb020]"}`}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">{fighter?.name ?? "—"}</span>
                  <span className="text-[#9aa0a6] text-[11px] uppercase tracking-wide">{t.isPublished ? "Опубликован" : "Скрыт"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-[#00a3ff] underline">▶ открыть</a>
                  {role === "admin" && <button onClick={() => onTogglePublish(t.id)} className="px-3 py-1.5 rounded-lg border-none bg-[#8b0033] text-white font-bold cursor-pointer text-xs hover:opacity-85">{t.isPublished ? "Скрыть" : "Опубликовать"}</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}