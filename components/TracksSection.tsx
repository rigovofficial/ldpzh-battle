"use client";

import { useState } from "react";
import type { Match, Track, Fighter } from "@/lib/types";

type Role = "anonymous" | "user" | "participant" | "admin";

export default function TracksSection({
  role,
  currentUserId,
  matches,
  fighters,
  tracks,
  onTrackSubmit,
  onTogglePublish,
}: {
  role: Role;
  currentUserId: string;
  matches: Match[];
  fighters: Fighter[];
  tracks: Track[];
  onTrackSubmit: (matchId: string, url: string) => void;
  onTogglePublish: (trackId: string) => void;
}) {
  const [urlInput, setUrlInput] = useState("");

  const myFighterIds = new Set(
    fighters.filter((f) => f.userId === currentUserId).map((f) => f.id)
  );

  // Ищем матч с открытым приёмом, где участвует один из моих ников
  const myOpenMatch =
    role === "participant" && myFighterIds.size > 0
      ? matches.find(
          (m) =>
            m.status === "tracks_open" &&
            m.teams.some((t) => t.fighterIds.some((id) => myFighterIds.has(id)))
        )
      : null;

  const myFighterInMatch = myOpenMatch
    ? myOpenMatch.teams
        .flatMap((t) => t.fighterIds)
        .find((id) => myFighterIds.has(id)) ?? null
    : null;

  const myExistingTrack =
    myOpenMatch && myFighterInMatch
      ? tracks.find(
          (t) => t.matchId === myOpenMatch.id && t.fighterId === myFighterInMatch
        )
      : null;

  const canSubmit = !!myOpenMatch && !myExistingTrack && !!myFighterInMatch;

  const visibleTracks = tracks.filter((t) => {
    if (role === "admin") return true;
    if (myFighterIds.has(t.fighterId)) return true;
    return t.isPublished;
  });

  function nameOf(fid: string) {
    return fighters.find((f) => f.id === fid)?.name ?? "?";
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-extrabold uppercase tracking-wide mb-3 pl-2.5 border-l-4 border-[#00a3ff]">
        Треки
      </h2>

      {role === "participant" && myOpenMatch && canSubmit && (
        <div className="mb-4 p-4 bg-[#1d1d27] rounded-xl">
          <div className="text-[13px] text-[#9aa0a6] mb-3">
            Матч: раунд {myOpenMatch.round}, матч {myOpenMatch.position} — приём
            треков открыт
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://soundcloud.com/..."
              className="flex-1 min-w-[240px] px-3 py-2.5 rounded-lg bg-[#14141c] text-white border border-[#333] outline-none focus:border-[#00a3ff]"
            />
            <button
              onClick={() => {
                const url = urlInput.trim();
                if (!url) return;
                onTrackSubmit(myOpenMatch.id, url);
                setUrlInput("");
              }}
              className="px-4 py-2.5 rounded-lg border-none bg-[#8b0033] text-white font-bold cursor-pointer hover:opacity-85"
            >
              Сдать трек
            </button>
          </div>
        </div>
      )}

      {role === "participant" && myOpenMatch && myExistingTrack && (
        <div className="mb-4 p-4 bg-[#1d1d27] rounded-xl text-[13px]">
          Твой трек сдан:{" "}
          <a
            href={myExistingTrack.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00a3ff] underline"
          >
            {myExistingTrack.url}
          </a>{" "}
          {myExistingTrack.isPublished ? (
            <span className="text-[#35d07f] ml-2">(опубликован)</span>
          ) : (
            <span className="text-[#ffb020] ml-2">(скрыт до публикации)</span>
          )}
        </div>
      )}

      {role === "participant" && !myOpenMatch && (
        <div className="mb-4 p-3 border-2 border-[#ff2b2b] rounded-xl text-[#ff2b2b] text-center text-[13px] bg-[rgba(255,43,43,0.08)]">
          Сейчас у тебя нет матча с открытым приёмом треков.
        </div>
      )}

      {(role === "user" || role === "anonymous") && (
        <div className="mb-4 p-3 bg-[#1d1d27] rounded-xl text-[13px] text-[#9aa0a6] text-center">
          Сдавать треки могут только участники батла.
        </div>
      )}

      {visibleTracks.length === 0 ? (
        <div className="bg-[#14141c] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic">
          Опубликованных треков пока нет.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleTracks.map((t) => {
            const borderCls = t.isPublished
              ? "border-l-[3px] border-l-[#35d07f]"
              : "border-l-[3px] border-l-[#ffb020]";
            return (
              <div
                key={t.id}
                className={`bg-[#1d1d27] rounded-lg px-4 py-3 flex justify-between items-center gap-3 flex-wrap text-[13px] ${borderCls}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">{nameOf(t.fighterId)}</span>
                  <span className="text-[#9aa0a6] text-[11px] uppercase tracking-wide">
                    {t.isPublished ? "Опубликован" : "Скрыт"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00a3ff] underline"
                  >
                    ▶ открыть
                  </a>
                  {role === "admin" && (
                    <button
                      onClick={() => onTogglePublish(t.id)}
                      className="px-3 py-1.5 rounded-lg border-none bg-[#8b0033] text-white font-bold cursor-pointer text-xs hover:opacity-85"
                    >
                      {t.isPublished ? "Скрыть" : "Опубликовать"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}