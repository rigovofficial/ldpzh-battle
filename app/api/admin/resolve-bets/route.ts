import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = await getSessionCookie();
  const payload = await verifySession(token || "");
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const { matchId } = await req.json();
  if (!matchId) return NextResponse.json({ error: "Не передан ID матча" }, { status: 400 });

  try {
    // 1. Получаем матч
    const { data: match } = await supabaseAdmin.from("matches").select("*").eq("id", matchId).single();
    if (!match) throw new Error("Матч не найден");
    if (!match.is_completed || !match.winner) throw new Error("Матч должен быть завершен и иметь победителя");
    if (match.points_awarded) throw new Error("Ставки на этот матч уже рассчитаны");

    // 2. Получаем все ставки на этот матч
    const { data: bets } = await supabaseAdmin.from("bets").select("*").eq("match_id", matchId);
    
    let resolvedCount = 0;
    if (bets && bets.length > 0) {
      for (const bet of bets) {
        // Если угадал -> +100 * кэф. Если нет -> -100
        const winPoints = bet.fighter_id === match.winner ? Math.round(100 * Number(bet.coeff)) : -100;
        await supabaseAdmin.rpc('increment_points', { user_id: bet.user_id, amount: winPoints });
        resolvedCount++;
      }
    }

    // 3. Помечаем, что очки выданы
    await supabaseAdmin.from("matches").update({ points_awarded: true }).eq("id", matchId);

    return NextResponse.json({ ok: true, resolvedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}