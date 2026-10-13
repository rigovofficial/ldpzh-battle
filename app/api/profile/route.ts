import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function GET() {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const payload = await verifySession(token);
  if (!payload) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, login, display_name, role, battle_nickname, created_at")
    .eq("id", payload.userId)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: "Юзер не найден" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      login: user.login,
      displayName: user.display_name,
      role: user.role,
      battleNickname: user.battle_nickname,
      createdAt: user.created_at,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const payload = await verifySession(token);
  if (!payload) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });
  }

  const displayName = (body.displayName ?? "").toString().trim();

  if (displayName.length < 2 || displayName.length > 40) {
    return NextResponse.json(
      { error: "Имя — от 2 до 40 символов" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({ display_name: displayName })
    .eq("id", payload.userId);

  if (error) {
    console.error("Ошибка обновления профиля:", error);
    return NextResponse.json({ error: "Не сохранилось" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, displayName });
}