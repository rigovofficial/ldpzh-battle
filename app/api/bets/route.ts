import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function GET() {
  const { data: bets } = await supabaseAdmin.from("bets").select("*");
  return NextResponse.json({
    bets: (bets ?? []).map((b) => ({ userId: b.user_id, matchId: b.match_id, fighterId: b.fighter_id, coeff: Number(b.coeff) })),
  });
}

export async function POST(req: NextRequest) {
  const token = await getSessionCookie();
  if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const payload = await verifySession(token);
  if (!payload) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { matchId, fighterId } = await req.json();

  const { data: match } = await supabaseAdmin.from("matches").select("*").eq("id", matchId).single();
  
  if (!match || !match.is_betting_open || match.is_completed) {
    return NextResponse.json({ error: "Ставки на этот матч закрыты" }, { status: 400 });
  }

  const coeff = fighterId === match.fighter1 ? Number(match.odds1) : Number(match.odds2);

  // Пытаемся вставить
  const { error: insertErr } = await supabaseAdmin.from("bets").insert({
    user_id: payload.userId,
    match_id: matchId,
    fighter_id: fighterId,
    coeff: coeff,
  });

  if (insertErr) {
    // 23505 - это ошибка уникальности (юзер уже ставил на этот матч)
    if (insertErr.code === '23505') {
      return NextResponse.json({ error: "Вы уже сделали ставку на этот матч" }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка сохранения ставки" }, { status: 500 });
  }

  // Обновляем кэфы
  if (fighterId === match.fighter1) {
    await supabaseAdmin.from("matches").update({ odds1: Math.max(1.01, Number(match.odds1) - 0.06), odds2: Number(match.odds2) + 0.07 }).eq("id", matchId);
  } else {
    await supabaseAdmin.from("matches").update({ odds2: Math.max(1.01, Number(match.odds2) - 0.06), odds1: Number(match.odds1) + 0.07 }).eq("id", matchId);
  }

  return NextResponse.json({ ok: true });
}