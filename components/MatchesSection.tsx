import MatchCard from "./MatchCard";
import type { Match, Fighter, Bet } from "@/lib/types";

type Role = "anonymous" | "user" | "participant" | "admin";

export default function MatchesSection({
  matches, bets, fighters, role, currentUserId, onBet,
}: {
  matches: Match[]; bets: Bet[]; fighters: Fighter[]; role: Role;
  currentUserId: string; onBet: (matchId: string, fighterId: string) => void;
}) {
  // Показываем ТОЛЬКО незавершенные матчи, где открыты ставки или треки
  const visibleMatches = matches.filter((m) => !m.isCompleted && (m.isBettingOpen || m.isTracksOpen));

  return (
    <section className="mb-8">
      <h2 className="text-lg font-extrabold uppercase tracking-wide mb-3 pl-2.5 border-l-4 border-[#00a3ff]">Матчи и ставки</h2>
      {visibleMatches.length === 0 ? (
        <div className="bg-[#14141c] border border-dashed border-[#333] rounded-xl p-6 text-center text-[#9aa0a6] italic">Сейчас нет активных ставок</div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleMatches.map((m) => (
            <MatchCard key={m.id} match={m} role={role} currentUserId={currentUserId} bets={bets.filter((b) => b.matchId === m.id)} fighters={fighters} onBet={(fighterId) => onBet(m.id, fighterId)} />
          ))}
        </div>
      )}
    </section>
  );
}