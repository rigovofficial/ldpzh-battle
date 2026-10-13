import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function GET() {
  const token = await getSessionCookie();
  if (!token)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const payload = await verifySession(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("id, login, display_name, role, battle_nickname, created_at")
    .order("created_at");

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }

  return NextResponse.json({
    users: (users ?? []).map((u) => ({
      id: u.id,
      login: u.login,
      displayName: u.display_name,
      role: u.role,
      battleNickname: u.battle_nickname,
    })),
  });
}