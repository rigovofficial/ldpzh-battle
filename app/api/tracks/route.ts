import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = await getSessionCookie();
  const payload = await verifySession(token || "");
  if (!payload) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { matchId, url } = await req.json();
  const { data: fighter } = await supabaseAdmin.from("fighters").select("id").eq("user_id", payload.userId).maybeSingle();
  if (!fighter) return NextResponse.json({ error: "Ты не боец" }, { status: 403 });

  await supabaseAdmin.from("tracks").upsert({
    id: "t_" + Date.now(),
    match_id: matchId,
    fighter_id: fighter.id,
    url,
    is_published: false,
  }, { onConflict: "match_id, fighter_id" });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const token = await getSessionCookie();
  const payload = await verifySession(token || "");
  if (payload?.role !== "admin") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const { trackId, isPublished } = await req.json();
  await supabaseAdmin.from("tracks").update({ is_published: isPublished }).eq("id", trackId);
  return NextResponse.json({ ok: true });
}