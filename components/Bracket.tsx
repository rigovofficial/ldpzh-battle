import type { Match, Fighter, StyleConfig } from "@/lib/types";

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
    ? Math.max(...matches.map((match) => match.round))
    : 1;

  const myFighterIds = new Set(
    role === "participant"
      ? fighters
          .filter((fighter) => fighter.userId === currentUserId)
          .map((fighter) => fighter.id)
      : [],
  );

  // Keep each round readable on narrow screens; the wrapper scrolls horizontally.
  const minBracketWidth = `${maxRound * 140 + (maxRound - 1) * 12}px`;

  return (
    <div
      className="w-full overflow-x-auto pb-2"
      aria-label="Турнирная сетка"
    >
      <div
        className="grid items-start gap-3"
        style={{
          gridTemplateColumns: `repeat(${maxRound}, minmax(0, 1fr))`,
          minWidth: minBracketWidth,
        }}
      >
        {Array.from({ length: maxRound }, (_, index) => index + 1).map((round) => {
          const roundMatches = matches
            .filter((match) => match.round === round)
            .sort((a, b) => a.index - b.index);

          const isFinalRound = round === maxRound;
          const label =
            isFinalRound
              ? "🔥 Финал"
              : round === maxRound - 1 && maxRound >= 3
                ? "Полуфинал"
                : `Раунд ${round}`;

          return (
            <section key={round} className="min-w-0">
              <h4
                className={`mb-2 min-h-4 text-[11px] font-bold uppercase tracking-wider ${
                  isFinalRound
                    ? "text-[#ff6b35]"
                    : "text-[#9aa0a6]"
                }`}
              >
                {label}
              </h4>

              <div className="flex flex-col gap-3">
                {roundMatches.map((match) => {
                  const isFireMatch = Boolean(match.isFinal || isFinalRound);

                  return (
                    <article
                      key={match.id}
                      className={`flex min-w-0 flex-col rounded-xl ${
                        isFireMatch
                          ? "bracket-final-glow bg-gradient-to-b from-[#ff4500] to-[#8b0000] p-1"
                          : ""
                      }`}
                    >
                      <div
                        className={`flex min-w-0 flex-col rounded-lg p-2 ${
                          isFireMatch ? "bg-[#1a0a05]" : "bg-transparent"
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-1 px-1 text-[10px] uppercase tracking-wide text-[#9aa0a6]">
                          <span
                            className={`truncate ${
                              isFireMatch ? "font-bold text-[#ffaa00]" : ""
                            }`}
                          >
                            Матч {match.index}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                              match.isCompleted
                                ? "bg-[#444] text-[#ccc]"
                                : "bg-[#35d07f] text-[#062a16]"
                            }`}
                          >
                            {match.isCompleted ? "Завершён" : "Активен"}
                          </span>
                        </div>

                        <Slot
                          match={match}
                          slot={1}
                          fighters={fighters}
                          myFighterIds={myFighterIds}
                          style={style}
                          isFire={isFireMatch}
                        />

                        <div className="h-1" />

                        <Slot
                          match={match}
                          slot={2}
                          fighters={fighters}
                          myFighterIds={myFighterIds}
                          style={style}
                          isFire={isFireMatch}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
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
  const fighterId = slot === 1 ? match.fighter1 : match.fighter2;
  const fighter = fighterId
    ? fighters.find((item) => item.id === fighterId)
    : null;
  const score = slot === 1 ? match.score1 : match.score2;

  if (!fighter) {
    return (
      <div className="flex min-h-7 items-center rounded border border-[#2a2a36] bg-[#14141c] px-2 py-1 text-[12px] text-[#737985]">
        — TBD —
      </div>
    );
  }

  const isWinner = match.isCompleted && match.winner === fighter.id;
  const isLoser = match.isCompleted && match.winner !== fighter.id;
  const isMine = myFighterIds.has(fighter.id);

  let className = "border-[#2a2a36] bg-[#14141c]";
  let inlineStyle: React.CSSProperties = {};
  let icon = "";

  if (isMine) {
    if (!match.isCompleted) {
      className = "border";
      inlineStyle = {
        borderColor: style.participantActive,
        backgroundColor: `${style.participantActive}15`,
        boxShadow: `0 0 10px ${style.participantActive}45`,
      };
    } else if (isWinner) {
      className = "border";
      inlineStyle = {
        borderColor: style.participantWin,
        backgroundColor: `${style.participantWin}1a`,
      };
      icon = "✓";
    } else if (isLoser) {
      className = "border opacity-75";
      inlineStyle = {
        borderColor: style.participantLoss,
        backgroundColor: `${style.participantLoss}1a`,
      };
      icon = "⚰";
    }
  } else if (isWinner) {
    className = "border";
    inlineStyle = {
      borderColor: style.accent,
      backgroundColor: `${style.accent}10`,
    };
    icon = "✓";
  } else if (isLoser) {
    className = "border-[#444] opacity-60";
    icon = "⚰";
  }

  return (
    <div
      className={`grid min-h-7 min-w-0 grid-cols-[minmax(0,1fr)_auto_14px] items-center gap-1.5 rounded border px-2 py-1 text-[12px] ${className}`}
      style={inlineStyle}
    >
      <span
        className={`truncate ${isFire ? "font-bold text-white" : ""}`}
        title={fighter.name}
      >
        {fighter.name}
      </span>
      <span
        className={`min-w-6 text-right font-bold tabular-nums ${
          isFire ? "text-[#ffaa00]" : "text-[#9aa0a6]"
        }`}
      >
        {score != null ? score : "—"}
      </span>
      <span
        className="w-3.5 text-center font-bold"
        aria-label={icon === "✓" ? "Победитель" : icon === "⚰" ? "Проигравший" : undefined}
        style={{
          color: isWinner
            ? isMine
              ? style.participantWin
              : style.accent
            : isLoser
              ? isMine
                ? style.participantLoss
                : "#666"
              : undefined,
        }}
      >
        {icon}
      </span>
    </div>
  );
}
