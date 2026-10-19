import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function GET() {
  const { data: bets } = await supabaseAdmin.from("bets").select("*");
  return NextResponse.json({
    bets: (bets ?? []).map((b) => ({
      userId: b.user_id,
      matchId: b.match_id,
      fighterId: b.fighter_id,
      coeff: Number(b.coeff),
    })),
  });
}

export async function POST(req: NextRequest) {
  const token = await getSessionCookie();
  if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const payload = await verifySession(token);
  if (!payload) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { matchId, fighterId } = await req.json();

  const { data: existing } = await supabaseAdmin
    .from("bets")
    .select("id")
    .eq("user_id", payload.userId)
    .eq("match_id", matchId)
    .maybeSingle();

  if (existing) return NextResponse.json({ error: "Вы уже сделали ставку" }, { status: 400 });

  const { data: match } = await supabaseAdmin.from("matches").select("*").eq("id", matchId).single();
  if (!match || match.status !== "betting_open") {
    return NextResponse.json({ error: "Ставки закрыты" }, { status: 400 });
  }

  const coeff = fighterId === match.fighter1 ? Number(match.odds1) : Number(match.odds2);

  await supabaseAdmin.from("bets").insert({
    user_id: payload.userId,
    match_id: matchId,
    fighter_id: fighterId,
    coeff: coeff,
  });

  if (fighterId === match.fighter1) {
    await supabaseAdmin.from("matches").update({
      odds1: Math.max(1.01, coeff - 0.06),
      odds2: Number(match.odds2) + 0.07,
    }).eq("id", matchId);
  } else {
    await supabaseAdmin.from("matches").update({
      odds2: Math.max(1.01, coeff - 0.06),
      odds1: Number(match.odds1) + 0.07,
    }).eq("id", matchId);
  }

  return NextResponse.json({ ok: true });
}