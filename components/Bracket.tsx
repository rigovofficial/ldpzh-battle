import type { Match, Fighter, StyleConfig } from "@/lib/types";

type Role = "anonymous" | "user" | "participant" | "admin";

export default function Bracket({ matches, fighters, currentUserId, role, style }: { matches: Match[], fighters: Fighter[], currentUserId: string, role: Role, style: StyleConfig }) {
  const maxRound = matches.length ? Math.max(...matches.map((m) => m.round)) : 1;
  const myFighterIds = new Set(role === "participant" ? fighters.filter((f) => f.userId === currentUserId).map((f) => f.id) : []);

  return (
    <div className="grid gap-5 items-start" style={{ gridTemplateColumns: `repeat(${maxRound}, 1fr)` }}>
      {Array.from({ length: maxRound }, (_, i) => i + 1).map((r) => {
        const roundMatches = matches.filter((m) => m.round === r).sort((a, b) => a.index - b.index);
        const label = r === maxRound ? "🔥 ФИНАЛ" : r === maxRound - 1 && maxRound >= 3 ? "Полуфинал" : `Раунд ${r}`;
        const isFinalRound = r === maxRound;

        return (
          <div key={r} className="flex flex-col">
            <h4 className={`text-[11px] uppercase tracking-widest mb-2 font-bold ${isFinalRound ? "text-[#ff4500] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)]" : "text-[#9aa0a6]"}`}>{label}</h4>
            <div className="flex flex-col gap-4">
              {roundMatches.map((m) => {
                const isFireMatch = m.isFinal || isFinalRound;
                return (
                  <div key={m.id} className={`flex flex-col rounded-xl ${isFireMatch ? "p-1 bg-gradient-to-b from-[#ff4500] to-[#8b0000] shadow-[0_0_20px_rgba(255,69,0,0.6)] animate-pulse" : ""}`}>
                    <div className={`flex flex-col p-2 rounded-lg ${isFireMatch ? "bg-[#1a0a05]" : "bg-transparent"}`}>
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#9aa0a6] mb-1 px-1">
                        <span className={isFireMatch ? "text-[#ffaa00] font-bold" : ""}>Матч {m.index}</span>
                        <span className={`px-2 py-0.5 rounded-full font-extrabold ${m.isCompleted ? "bg-[#444] text-[#ccc]" : "bg-[#35d07f] text-[#062a16]"}`}>{m.isCompleted ? "ЗАВЕРШЁН" : "АКТИВЕН"}</span>
                      </div>
                      <Slot match={m} slot={1} fighters={fighters} myFighterIds={myFighterIds} style={style} isFire={isFireMatch} />
                      <div className="h-1" />
                      <Slot match={m} slot={2} fighters={fighters} myFighterIds={myFighterIds} style={style} isFire={isFireMatch} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Slot({ match, slot, fighters, myFighterIds, style, isFire }: { match: Match, slot: 1 | 2, fighters: Fighter[], myFighterIds: Set<string>, style: StyleConfig, isFire: boolean }) {
  const fid = slot === 1 ? match.fighter1 : match.fighter2;
  const fighter = fid ? fighters.find((f) => f.id === fid) : null;
  const score = slot === 1 ? match.score1 : match.score2;

  if (!fighter) return <div className="bg-[#14141c] border border-[#2a2a36] rounded px-2 py-1 text-[13px] text-[#5a5f66]">— TBD —</div>;

  const isWinner = match.isCompleted && match.winner === fighter.id;
  const isLoser = match.isCompleted && match.winner !== fighter.id;
  const isMine = myFighterIds.has(fighter.id);

  let cls = "border-[#2a2a36] bg-[#14141c]";
  let inlineStyle: React.CSSProperties = {};
  let icon = "";

  if (isMine) {
    if (!match.isCompleted) { cls = "border"; inlineStyle = { borderColor: style.participantActive, backgroundColor: `${style.participantActive}15`, boxShadow: `0 0 12px ${style.participantActive}60` }; }
    else if (isWinner) { cls = "border"; inlineStyle = { borderColor: style.participantWin, backgroundColor: `${style.participantWin}1a` }; icon = "✓"; }
    else if (isLoser) { cls = "border opacity-75"; inlineStyle = { borderColor: style.participantLoss, backgroundColor: `${style.participantLoss}1a` }; icon = "⚰"; }
  } else {
    if (isWinner) { cls = "border"; inlineStyle = { borderColor: style.accent, backgroundColor: `${style.accent}10` }; icon = "✓"; }
    else if (isLoser) { cls = "border-[#444] opacity-60"; icon = "⚰"; }
  }

  return (
    <div className={`rounded px-2 py-1 grid grid-cols-[1fr_auto_auto] gap-2 items-center text-[13px] ${cls}`} style={inlineStyle}>
      <span className={`truncate ${isFire ? "font-bold text-white" : ""}`}>{fighter.name}</span>
      <span className={`font-bold tabular-nums text-right min-w-7 ${isFire ? "text-[#ffaa00]" : "text-[#9aa0a6]"}`}>{score != null ? score : "—"}</span>
      <span className="w-3.5 text-center font-bold" style={{ color: isWinner ? (isMine ? style.participantWin : style.accent) : isLoser ? (isMine ? style.participantLoss : "#666") : undefined }}>{icon}</span>
    </div>
  );
}