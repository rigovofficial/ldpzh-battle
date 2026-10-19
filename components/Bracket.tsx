import type { Match, Fighter, StyleConfig } from "@/lib/types";
import { matchStatusShort } from "@/lib/labels";

type Role = "anonymous" | "user" | "participant" | "admin";

export default function Bracket({
  matches,
  fighters,
  currentUserId,
  role,
  style,
}: {
  matches: Match[];
  fighters: Fighter[];
  currentUserId: string;
  role: Role;
  style: StyleConfig;
}) {
  const maxRound = matches.length
    ? Math.max(...matches.map((m) => m.round))
    : 1;

  const myFighterIds = new Set(
    role === "participant"
      ? fighters.filter((f) => f.userId === currentUserId).map((f) => f.id)
      : []
  );

  return (
    <div
      className="grid gap-5 items-start"
      style={{ gridTemplateColumns: `repeat(${maxRound}, 1fr)` }}
    >
      {Array.from({ length: maxRound }, (_, i) => i + 1).map((r) => {
        const roundMatches = matches
          .filter((m) => m.round === r)
          .sort((a, b) => a.index - b.index);
        
        const label =
          r === maxRound
            ? "🔥 ФИНАЛ"
            : r === maxRound - 1 && maxRound >= 3
            ? "Полуфинал"
            : `Раунд ${r}`;

        // Финал всегда горит. Или если у матча стоит флаг isFire.
        const isFinalRound = r === maxRound;

        return (
          <div key={r} className="flex flex-col">
            <h4
              className={`text-[11px] uppercase tracking-widest mb-2 font-bold ${
                isFinalRound ? "text-[#ff4500] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)]" : "text-[#9aa0a6]"
              }`}
            >
              {label}
            </h4>
            <div className="flex flex-col gap-4">
              {roundMatches.map((m) => {
                const isFireMatch = m.isFire || isFinalRound;
                return (
                  <MatchSlot
                    key={m.id}
                    match={m}
                    fighters={fighters}
                    myFighterIds={myFighterIds}
                    style={style}
                    isFire={isFireMatch}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatchSlot({
  match,
  fighters,
  myFighterIds,
  style,
  isFire,
}: {
  match: Match;
  fighters: Fighter[];
  myFighterIds: Set<string>;
  style: StyleConfig;
  isFire: boolean;
}) {
  const statusCls: Record<Match["status"], string> = {
    pending: "bg-[#333] text-[#999]",
    betting_open: "bg-[#35d07f] text-[#062a16]",
    tracks_open: "bg-[#00a3ff] text-[#002233]",
    judging: "bg-[#ffb020] text-[#2a1c00]",
    completed: "bg-[#444] text-[#ccc]",
  };

  // Стили для огненного матча
  const fireWrapperStyle = isFire
    ? "p-1 rounded-xl bg-gradient-to-b from-[#ff4500] to-[#8b0000] shadow-[0_0_20px_rgba(255,69,0,0.6)] animate-pulse"
    : "";
    
  const innerBg = isFire ? "bg-[#1a0a05]" : "bg-transparent";

  return (
    <div className={`flex flex-col rounded-xl ${fireWrapperStyle}`}>
      <div className={`flex flex-col p-2 rounded-lg ${innerBg}`}>
        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#9aa0a6] mb-1 px-1">
          <span className={isFire ? "text-[#ffaa00] font-bold" : ""}>Матч {match.index}</span>
          <span
            className={`px-2 py-0.5 rounded-full font-extrabold ${statusCls[match.status]}`}
          >
            {matchStatusShort[match.status]}
          </span>
        </div>
        <Slot
          match={match}
          slot={1}
          fighters={fighters}
          myFighterIds={myFighterIds}
          style={style}
          isFire={isFire}
        />
        <div className="h-1" />
        <Slot
          match={match}
          slot={2}
          fighters={fighters}
          myFighterIds={myFighterIds}
          style={style}
          isFire={isFire}
        />
      </div>
    </div>
  );
}

function Slot({
  match,
  slot,
  fighters,
  myFighterIds,
  style,
  isFire,
}: {
  match: Match;
  slot: 1 | 2;
  fighters: Fighter[];
  myFighterIds: Set<string>;
  style: StyleConfig;
  isFire: boolean;
}) {
  const fid = slot === 1 ? match.fighter1 : match.fighter2;
  const fighter = fid ? fighters.find((f) => f.id === fid) : null;
  const score = slot === 1 ? match.score1 : match.score2;

  if (!fighter) {
    return (
      <div className="bg-[#14141c] border border-[#2a2a36] rounded-lg px-2.5 py-1.5 grid grid-cols-[1fr_auto_auto] gap-2 items-center text-[13px]">
        <span className="truncate text-[#5a5f66]">— TBD —</span>
        <span className="text-[#9aa0a6] font-bold tabular-nums text-right min-w-7">
          {score != null ? score : "—"}
        </span>
        <span className="w-3.5 text-center font-bold" />
      </div>
    );
  }

  const hasWinner = match.winner !== null;
  const isWinner = hasWinner && match.winner === fighter.id;
  const isLoser = hasWinner && match.winner !== fighter.id;
  const isMatchActive = ["betting_open", "tracks_open", "judging"].includes(match.status);
  const isMine = myFighterIds.has(fighter.id);

  let cls = "border-[#2a2a36] bg-[#14141c]";
  let inlineStyle: React.CSSProperties = {};
  let icon = "";

  if (isMine) {
    if (isMatchActive) {
      cls = "border";
      inlineStyle = {
        borderColor: style.participantActive,
        backgroundColor: `${style.participantActive}15`,
        boxShadow: `0 0 12px ${style.participantActive}60`,
      };
    } else if (isWinner) {
      cls = "border";
      inlineStyle = {
        borderColor: style.participantWin,
        backgroundColor: `${style.participantWin}1a`,
      };
      icon = "✓";
    } else if (isLoser) {
      cls = "border opacity-75";
      inlineStyle = {
        borderColor: style.participantLoss,
        backgroundColor: `${style.participantLoss}1a`,
      };
      icon = "⚰";
    }
  } else {
    if (isWinner) {
      cls = "border";
      inlineStyle = {
        borderColor: style.accent,
        backgroundColor: `${style.accent}10`,
      };
      icon = "✓";
    } else if (isLoser) {
      cls = "border-[#444] opacity-60";
      icon = "⚰";
    }
  }

  // Если это огненный матч, делаем шрифт имен жирнее и белее
  const textClass = isFire ? "font-bold text-white" : "";

  return (
    <div
      className={`rounded-lg px-2.5 py-1.5 grid grid-cols-[1fr_auto_auto] gap-2 items-center text-[13px] ${cls}`}
      style={inlineStyle}
    >
      <span className={`truncate ${textClass}`}>{fighter.name}</span>
      <span className={`font-bold tabular-nums text-right min-w-7 ${isFire ? "text-[#ffaa00]" : "text-[#9aa0a6]"}`}>
        {score != null ? score : "—"}
      </span>
      <span
        className="w-3.5 text-center font-bold"
        style={{
          color: isWinner
            ? isMine ? style.participantWin : style.accent
            : isLoser
            ? isMine ? style.participantLoss : "#666"
            : undefined,
        }}
      >
        {icon}
      </span>
    </div>
  );
}