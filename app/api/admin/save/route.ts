import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validUuid = (v: any) => (!v ? null : UUID_RE.test(String(v)) ? String(v) : null);
const toInt = (v: any) => Number.isFinite(Number(v)) ? Math.round(Number(v)) : 0;
const toIntOrNull = (v: any) => (v == null || v === "") ? null : Math.round(Number(v));

export async function PUT(req: NextRequest) {
  const token = await getSessionCookie();
  const payload = await verifySession(token || "");
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });

  const { season, maintenance, news, archive, matches, fighters, tracks, style } = body;

  try {
    // 1. Конфиг
    await supabaseAdmin.from("site_config").update({ season, archive, style, maintenance: !!maintenance }).eq("id", 1);

    // 2. Удаление всего игрового
    await supabaseAdmin.from("bets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("tracks").delete().neq("id", "__never__");
    await supabaseAdmin.from("matches").delete().neq("id", "__never__");
    await supabaseAdmin.from("fighters").delete().neq("id", "__never__");
    await supabaseAdmin.from("news").delete().neq("id", "__never__");

    // 3. Вставка заново
    if (fighters?.length) {
      await supabaseAdmin.from("fighters").insert(fighters.map((f: any) => ({
        id: f.id, name: f.name, user_id: validUuid(f.userId), prev_score: toInt(f.prevScore), total_score: toInt(f.totalScore)
      })));
    }
    if (matches?.length) {
      await supabaseAdmin.from("matches").insert(matches.map((m: any) => ({
        id: m.id, round: toInt(m.round), match_index: toInt(m.index), fighter1: m.fighter1, fighter2: m.fighter2,
        status: m.status, odds1: m.odds1, odds2: m.odds2, score1: toIntOrNull(m.score1), score2: toIntOrNull(m.score2),
        winner: m.winner, is_fire: !!m.isFire
      })));
    }
    if (tracks?.length) {
      await supabaseAdmin.from("tracks").insert(tracks.map((t: any) => ({
        id: t.id, match_id: t.matchId, fighter_id: t.fighterId, url: t.url, is_published: !!t.isPublished, score: toIntOrNull(t.score)
      })));
    }
    if (news?.length) {
      await supabaseAdmin.from("news").insert(news.map((n: any, i: number) => ({
        id: n.id, title: n.title, subtitle: n.subtitle, url: n.url, bg_color: n.bgColor, border_color: n.borderColor, text_color: n.textColor, enabled: !!n.enabled, sort_order: i
      })));
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}