import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = await getSessionCookie();
  if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const payload = await verifySession(token);
  if (!payload) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !body.nickname) {
    return NextResponse.json({ error: "Введи ник" }, { status: 400 });
  }

  // Проверка, не участник ли уже
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("role, predictions_points")
    .eq("id", payload.userId)
    .single();

  if (user?.role !== "user") {
    return NextResponse.json({ error: "Ты уже не просто юзер" }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from("registrations")
    .upsert(
      {
        user_id: payload.userId,
        desired_nickname: body.nickname.trim(),
        status: "pending",
      },
      { onConflict: "user_id" }
    );

  if (error) {
    return NextResponse.json({ error: "Ошибка записи" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}