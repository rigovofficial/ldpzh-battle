import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = await getSessionCookie();
  if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const payload = await verifySession(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { regId, userId, nickname } = await req.json();

  // 1. Обновляем юзера
  await supabaseAdmin
    .from("users")
    .update({ role: "participant", battle_nickname: nickname })
    .eq("id", userId);

  // 2. Создаём бойца (если еще нет)
  const fighterId = "f_" + Date.now();
  await supabaseAdmin.from("fighters").insert({
    id: fighterId,
    name: nickname,
    user_id: userId,
    prev_score: 0,
    total_score: 0,
  });

  // 3. Обновляем статус заявки
  await supabaseAdmin
    .from("registrations")
    .update({ status: "approved" })
    .eq("id", regId);

  return NextResponse.json({ ok: true });
}