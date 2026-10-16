import type { Match, Fighter, Bet } from "@/lib/types";

type Role = "anonymous" | "user" | "participant" | "admin";

export default function MatchCard({
  match,
  role,
  currentUserId,
  bets,
  fighters,
  onBet,
}: {
  match: Match;
  role: Role;
  currentUserId: string;
  bets: Bet[];
  fighters: Fighter[];
  onBet: (team: 0 | 1) => void;
}) {
  const teamLabel = (idx: 0 | 1) => {
    const t = match.teams[idx];
    if (t.name) return t.name;
    if (t.fighterIds.length === 0) return "— TBD —";
    return t.fighterIds
      .map((id) => fighters.find((f) => f.id === id)?.name ?? "?")
      .join(" + ");
  };

  const label1 = teamLabel(0);
  const label2 = teamLabel(1);

  const statusText: Record<Match["status"], string> = {
    pending: "ОЖИДАНИЕ",
    betting_open: "СТАВКИ ОТКРЫТЫ",
    tracks_open: "ПРИЁМ ТРЕКОВ",
    judging: "СУДЕЙСТВО",
    completed: "ЗАВЕРШЁН",
  };
  const statusCls: Record<Match["status"], string> = {
    pending: "bg-[#333] text-[#999]",
    betting_open: "bg-[#35d07f] text-[#062a16]",
    tracks_open: "bg-[#00a3ff] text-[#002233]",
    judging: "bg-[#ffb020] text-[#2a1c00]",
    completed: "bg-[#444] text-[#ccc]",
  };

  const myBet = bets.find((b) => b.userId === currentUserId);
  const votedTeam = myBet ? (myBet.team === 0 ? label1 : label2) : null;

  const votes1 = bets.filter((b) => b.team === 0).length;
  const votes2 = bets.filter((b) => b.team === 1).length;

  const canBet =
    match.status === "betting_open" &&
    (role === "user" || role === "admin") &&
    !myBet &&
    match.teams[0].fighterIds.length > 0 &&
    match.teams[1].fighterIds.length > 0;

  const cardCls = match.isFire
    ? "border-2 border-[#ff6a00] shadow-[0_0_18px_rgba(255,106,0,0.4)] bg-gradient-to-br from-[#14141c] to-[#2a1200]"
    : match.isFinal
    ? "border-2 border-[#ffd166] shadow-[0_0_18px_rgba(255,209,102,0.35)] bg-gradient-to-br from-[#14141c] to-[#2a1f00]"
    : "border border-[#00a3ff]";

  return (
    <div className={`rounded-2xl p-5 ${cardCls}`}>
      <div className="flex justify-between items-center text-[11px] uppercase tracking-widest text-[#9aa0a6] mb-4">
        <span className="flex items-center gap-2">
          {match.isFire && <span>🔥 ОГНЕННЫЙ</span>}
          {match.isFinal && !match.isFire && <span>🏆 ФИНАЛ</span>}
          Раунд {match.round} · Матч {match.position}
        </span>
        <span
          className={`px-2.5 py-1 rounded-full font-extrabold ${statusCls[match.status]}`}
        >
          {statusText[match.status]}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <div className="bg-[#1d1d27] rounded-xl p-4 text-center">
          <div className="font-bold text-[15px] mb-1.5">{label1}</div>
          <div className="text-[#00a3ff] text-[22px] font-black">
            {match.odds1.toFixed(2)}
          </div>
        </div>
        <div className="text-[#9aa0a6] font-black">VS</div>
        <div className="bg-[#1d1d27] rounded-xl p-4 text-center">
          <div className="font-bold text-[15px] mb-1.5">{label2}</div>
          <div className="text-[#00a3ff] text-[22px] font-black">
            {match.odds2.toFixed(2)}
          </div>
        </div>
      </div>

      {match.status === "betting_open" && (
        <>
          {role === "anonymous" && (
            <div className="mt-4 p-3 border-2 border-[#ff2b2b] rounded-xl text-[#ff2b2b] text-center text-[13px] bg-[rgba(255,43,43,0.08)]">
              Зарегистрируйтесь, чтобы сделать ставку
            </div>
          )}
          {role === "participant" && (
            <div className="mt-4 p-3 border-2 border-[#ff2b2b] rounded-xl text-[#ff2b2b] text-center text-[13px] bg-[rgba(255,43,43,0.08)]">
              Участникам запрещено ставить на матчи
            </div>
          )}
          {(role === "user" || role === "admin") && myBet && votedTeam && (
            <div className="mt-4 p-3 bg-[#1d1d27] rounded-xl text-[13px] text-[#9aa0a6]">
              <div>
                Твоя ставка: <strong className="text-white">{votedTeam}</strong>
              </div>
              <div>
                Кэф на момент ставки:{" "}
                <strong className="text-white">{myBet.coeff.toFixed(2)}</strong>
              </div>
            </div>
          )}
          {canBet && (
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                onClick={() => onBet(0)}
                className="py-3 rounded-xl border-none font-bold bg-[#8b0033] text-white cursor-pointer hover:opacity-85"
              >
                Ставка на {label1}
              </button>
              <button
                onClick={() => onBet(1)}
                className="py-3 rounded-xl border-none font-bold bg-[#8b0033] text-white cursor-pointer hover:opacity-85"
              >
                Ставка на {label2}
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-4 p-3 bg-[#1d1d27] rounded-xl text-[13px] text-[#9aa0a6]">
        Голоса: {label1} — <strong className="text-white">{votes1}</strong>,{" "}
        {label2} — <strong className="text-white">{votes2}</strong>. Кэфы:{" "}
        {match.odds1.toFixed(2)} / {match.odds2.toFixed(2)}
      </div>
    </div>
  );
}