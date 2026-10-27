import MatchCard from "./MatchCard";
import type { Match, Fighter, Bet } from "@/lib/types";

type Role = "anonymous" | "user" | "participant" | "admin";

export default function MatchesSection({
  matches,
  bets,
  fighters,
  role,
  currentUserId,
  onBet,
}: {
  matches: Match[];
  bets: Bet[];
  fighters: Fighter[];
  role: Role;
  currentUserId: string;
  onBet: (matchId: string, fighterId: string) => void;
}) {
  // Показываем только незавершённые матчи, где открыты ставки или треки.
  const visibleMatches = matches.filter(
    (match) =>
      !match.isCompleted && (match.isBettingOpen || match.isTracksOpen),
  );

  // Group bets once instead of filtering the entire array for every match.
  const betsByMatch = new Map<string, Bet[]>();
  for (const bet of bets) {
    const matchBets = betsByMatch.get(bet.matchId);
    if (matchBets) {
      matchBets.push(bet);
    } else {
      betsByMatch.set(bet.matchId, [bet]);
    }
  }

  return (
    <section className="mb-8">
      <h2 className="mb-3 border-l-4 border-[#00a3ff] pl-2.5 text-lg font-extrabold uppercase tracking-wide">
        Матчи и ставки
      </h2>

      {visibleMatches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#333] bg-[#14141c] p-6 text-center italic text-[#9aa0a6]">
          Сейчас нет активных матчей
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              role={role}
              currentUserId={currentUserId}
              bets={betsByMatch.get(match.id) ?? []}
              fighters={fighters}
              onBet={(fighterId) => onBet(match.id, fighterId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
