import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function GET() {
  const token = await getSessionCookie();
  if (!token) return NextResponse.json({ user: null });

  const payload = await verifySession(token);
  if (!payload) return NextResponse.json({ user: null });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, login, display_name, role, battle_nickname, token_version")
    .eq("id", payload.userId)
    .maybeSingle();

  if (!user) return NextResponse.json({ user: null });

  // token_version устарел — сессия невалидна
  if (user.token_version !== payload.tokenVersion) {
    return NextResponse.json({ user: null });
  }

  const { data: config } = await supabaseAdmin
    .from("site_config")
    .select("auth_epoch")
    .eq("id", 1)
    .single();

  if ((config?.auth_epoch ?? 1) !== payload.authEpoch) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      login: user.login,
      displayName: user.display_name,
      role: user.role,
      battleNickname: user.battle_nickname,
    },
  });
}