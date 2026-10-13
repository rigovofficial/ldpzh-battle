import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { verifyPassword, signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });
  }

  const { login, password } = body as { login?: string; password?: string };
  if (!login || !password) {
    return NextResponse.json(
      { error: "Заполни логин и пароль" },
      { status: 400 }
    );
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, password_hash, role, token_version, is_banned")
    .eq("login", login)
    .maybeSingle();

  if (!user) {
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 }
    );
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 }
    );
  }

  if (user.is_banned) {
    return NextResponse.json(
      { error: "Аккаунт заблокирован" },
      { status: 403 }
    );
  }

  const { data: config } = await supabaseAdmin
    .from("site_config")
    .select("auth_epoch")
    .eq("id", 1)
    .single();

  const token = await signSession({
    userId: user.id,
    role: user.role,
    tokenVersion: user.token_version,
    authEpoch: config?.auth_epoch ?? 1,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, userId: user.id, role: user.role });
}