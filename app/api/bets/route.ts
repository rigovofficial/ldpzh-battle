import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = await getSessionCookie();
  if (!token)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const payload = await verifySession(token);
  if (!payload)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", payload.userId)
    .single();

  if (!user)
    return NextResponse.json({ error: "Юзер не найден" }, { status: 404 });
  if (user.role === "participant") {
    return NextResponse.json(
      { error: "Участникам запрещено ставить" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });
  }

  const { matchId, team } = body as { matchId?: string; team?: number };
  if (!matchId || (team !== 0 && team !== 1)) {
    return NextResponse.json({ error: "Неверные параметры" }, { status: 400 });
  }

  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .maybeSingle();

  if (!match) {
    return NextResponse.json({ error: "Матч не найден" }, { status: 404 });
  }
  if (match.status !== "betting_open") {
    return NextResponse.json(
      { error: "Ставки на этот матч закрыты" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabaseAdmin
    .from("bets")
    .select("id")
    .eq("user_id", payload.userId)
    .eq("match_id", matchId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Ты уже ставил на этот матч" },
      { status: 400 }
    );
  }

  const coeff = team === 0 ? Number(match.odds1) : Number(match.odds2);

  const { error: betErr } = await supabaseAdmin.from("bets").insert({
    user_id: payload.userId,
    match_id: matchId,
    team,
    coeff,
    points: 100,
  });

  if (betErr) {
    console.error("Ошибка вставки ставки:", betErr);
    return NextResponse.json({ error: betErr.message }, { status: 500 });
  }

  let newOdds1 = Number(match.odds1);
  let newOdds2 = Number(match.odds2);
  if (team === 0) {
    newOdds1 = Math.max(1.01, +(newOdds1 - 0.06).toFixed(2));
    newOdds2 = +(newOdds2 + 0.07).toFixed(2);
  } else {
    newOdds2 = Math.max(1.01, +(newOdds2 - 0.06).toFixed(2));
    newOdds1 = +(newOdds1 + 0.07).toFixed(2);
  }

  const { error: updErr } = await supabaseAdmin
    .from("matches")
    .update({ odds1: newOdds1, odds2: newOdds2 })
    .eq("id", matchId);

  if (updErr) {
    console.error("Ошибка обновления кэфов:", updErr);
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, odds1: newOdds1, odds2: newOdds2 });
}