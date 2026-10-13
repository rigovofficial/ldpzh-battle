import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  getSessionCookie,
  verifySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = await getSessionCookie();
  if (!token)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const payload = await verifySession(token);
  if (!payload)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });

  const { oldPassword, newPassword } = body;
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "Заполни оба поля" }, { status: 400 });
  }
  if (String(newPassword).length < 6) {
    return NextResponse.json(
      { error: "Новый пароль — минимум 6 символов" },
      { status: 400 }
    );
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("password_hash, token_version")
    .eq("id", payload.userId)
    .maybeSingle();

  if (!user)
    return NextResponse.json({ error: "Юзер не найден" }, { status: 404 });

  const ok = await verifyPassword(oldPassword, user.password_hash);
  if (!ok)
    return NextResponse.json(
      { error: "Старый пароль неверный" },
      { status: 400 }
    );

  const hash = await hashPassword(newPassword);
  const { error } = await supabaseAdmin
    .from("users")
    .update({
      password_hash: hash,
      token_version: (user.token_version ?? 0) + 1,
    })
    .eq("id", payload.userId);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Не удалось сохранить" }, { status: 500 });
  }

  // Сессия инвалидируется (token_version изменился) — надо залогиниться заново
  return NextResponse.json({
    ok: true,
    message: "Пароль изменён. Залогинься заново.",
  });
}