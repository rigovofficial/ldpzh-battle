import type { Match, Fighter, Bet } from "@/lib/types";

type Role = "anonymous" | "user" | "participant" | "admin";

export default function MatchCard({
  match, role, currentUserId, bets, fighters, onBet,
}: {
  match: Match; role: Role; currentUserId: string; bets: Bet[]; fighters: Fighter[]; onBet: (fighterId: string) => void;
}) {
  const f1 = match.fighter1 ? fighters.find((f) => f.id === match.fighter1) : null;
  const f2 = match.fighter2 ? fighters.find((f) => f.id === match.fighter2) : null;

  const statusText = match.isCompleted ? "ЗАВЕРШЁН" : match.isBettingOpen ? "СТАВКИ ОТКРЫТЫ" : match.isTracksOpen ? "ПРИЁМ ТРЕКОВ" : "ОЖИДАНИЕ";
  const statusCls = match.isCompleted ? "bg-[#444] text-[#ccc]" : match.isBettingOpen ? "bg-[#35d07f] text-[#062a16]" : match.isTracksOpen ? "bg-[#00a3ff] text-[#002233]" : "bg-[#333] text-[#999]";

  const myBet = bets.find((b) => b.userId === currentUserId);
  const votedFighter = myBet ? fighters.find((f) => f.id === myBet.fighterId) : null;
  const votes1 = bets.filter((b) => b.fighterId === match.fighter1).length;
  const votes2 = bets.filter((b) => b.fighterId === match.fighter2).length;
  
  const canBet = match.isBettingOpen && !match.isCompleted && (role === "user" || role === "admin") && !myBet;

  return (
    <div className="bg-[#14141c] border border-[#00a3ff] rounded-2xl p-5">
      <div className="flex justify-between items-center text-[11px] uppercase tracking-widest text-[#9aa0a6] mb-4">
        <span>Раунд {match.round} · Матч {match.index}</span>
        <span className={`px-2.5 py-1 rounded-full font-extrabold ${statusCls}`}>{statusText}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <div className="bg-[#1d1d27] rounded-xl p-4 text-center">
          <div className="font-bold text-[15px] mb-1.5">{f1 ? f1.name : "—"}</div>
          <div className="text-[#00a3ff] text-[22px] font-black">{match.odds1.toFixed(2)}</div>
        </div>
        <div className="text-[#9aa0a6] font-black">VS</div>
        <div className="bg-[#1d1d27] rounded-xl p-4 text-center">
          <div className="font-bold text-[15px] mb-1.5">{f2 ? f2.name : "—"}</div>
          <div className="text-[#00a3ff] text-[22px] font-black">{match.odds2.toFixed(2)}</div>
        </div>
      </div>

      {match.isBettingOpen && !match.isCompleted && (
        <>
          {role === "anonymous" && <div className="mt-4 p-3 border-2 border-[#ff2b2b] rounded-xl text-[#ff2b2b] text-center text-[13px] bg-[rgba(255,43,43,0.08)]">Зарегистрируйтесь, чтобы сделать ставку</div>}
          {role === "participant" && <div className="mt-4 p-3 border-2 border-[#ff2b2b] rounded-xl text-[#ff2b2b] text-center text-[13px] bg-[rgba(255,43,43,0.08)]">Участникам запрещено ставить на матчи</div>}
          {(role === "user" || role === "admin") && myBet && votedFighter && (
            <div className="mt-4 p-3 bg-[#1d1d27] rounded-xl text-[13px] text-[#9aa0a6]">
              <div>Твоя ставка: <strong className="text-white">{votedFighter.name}</strong></div>
              <div>Кэф: <strong className="text-white">{myBet.coeff.toFixed(2)}</strong></div>
            </div>
          )}
          {canBet && (
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button onClick={() => match.fighter1 && onBet(match.fighter1)} className="py-3 rounded-xl border-none font-bold bg-[#8b0033] text-white cursor-pointer hover:opacity-85">Ставка на {f1?.name}</button>
              <button onClick={() => match.fighter2 && onBet(match.fighter2)} className="py-3 rounded-xl border-none font-bold bg-[#8b0033] text-white cursor-pointer hover:opacity-85">Ставка на {f2?.name}</button>
            </div>
          )}
        </>
      )}

      <div className="mt-4 p-3 bg-[#1d1d27] rounded-xl text-[13px] text-[#9aa0a6]">
        Голоса: {f1?.name ?? "—"} — <strong className="text-white">{votes1}</strong>, {f2?.name ?? "—"} — <strong className="text-white">{votes2}</strong>. Кэфы: {match.odds1.toFixed(2)} / {match.odds2.toFixed(2)}
      </div>
    </div>
  );
}