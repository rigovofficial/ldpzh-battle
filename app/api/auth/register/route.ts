import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });
  }

  const { login, password, displayName } = body as {
    login?: string;
    password?: string;
    displayName?: string;
  };

  if (!login || !password || !displayName) {
    return NextResponse.json(
      { error: "Заполни логин, пароль и имя" },
      { status: 400 }
    );
  }
  if (login.length < 3 || login.length > 32) {
    return NextResponse.json(
      { error: "Логин — от 3 до 32 символов" },
      { status: 400 }
    );
  }
  if (!/^[a-zA-Z0-9_]+$/.test(login)) {
    return NextResponse.json(
      { error: "Логин: только латиница, цифры и _" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Пароль — минимум 6 символов" },
      { status: 400 }
    );
  }

  // Проверка на занятый логин
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("login", login)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Логин уже занят" }, { status: 409 });
  }

  const hash = await hashPassword(password);

  const { data: created, error } = await supabaseAdmin
    .from("users")
    .insert({
      login,
      password_hash: hash,
      display_name: displayName,
      role: "user",
    })
    .select("id, role, token_version")
    .single();

  if (error || !created) {
    console.error("Ошибка создания юзера:", error);
    return NextResponse.json(
      { error: "Не получилось создать аккаунт" },
      { status: 500 }
    );
  }

  const { data: config } = await supabaseAdmin
    .from("site_config")
    .select("auth_epoch")
    .eq("id", 1)
    .single();

  const token = await signSession({
    userId: created.id,
    role: created.role,
    tokenVersion: created.token_version,
    authEpoch: config?.auth_epoch ?? 1,
  });
  await setSessionCookie(token);

  return NextResponse.json({
    ok: true,
    userId: created.id,
    role: created.role,
  });
}