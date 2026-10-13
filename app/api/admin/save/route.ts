import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validUuid = (v: any): string | null => {
  if (!v) return null;
  const s = String(v);
  return UUID_RE.test(s) ? s : null;
};
const toInt = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
};
const toIntOrNull = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
};

export async function PUT(req: NextRequest) {
  const token = await getSessionCookie();
  if (!token)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const payload = await verifySession(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });

  const { season, maintenance, news, archive, matches, fighters, tracks, style } = body;

  try {
    // 1. Конфиг сайта
    const { error: configErr } = await supabaseAdmin
      .from("site_config")
      .update({ season, archive, style, maintenance: !!maintenance })
      .eq("id", 1);
    if (configErr) throw new Error("site_config: " + configErr.message);

    // 2. tracks (сначала, т.к. FK на matches/fighters)
    await supabaseAdmin.from("tracks").delete().neq("id", "__never__");

    // 3. matches
    await supabaseAdmin.from("matches").delete().neq("id", "__never__");

    // 4. fighters
    await supabaseAdmin.from("fighters").delete().neq("id", "__never__");

    // 5. news
    await supabaseAdmin.from("news").delete().neq("id", "__never__");

    // --- теперь вставляем ---

    if (fighters?.length) {
      const { error } = await supabaseAdmin.from("fighters").insert(
        fighters.map((f: any) => ({
          id: f.id,
          name: f.name,
          user_id: validUuid(f.userId),
          prev_score: toInt(f.prevScore),
          total_score: toInt(f.totalScore),
        }))
      );
      if (error) throw new Error("fighters insert: " + error.message);
    }

    if (matches?.length) {
      const { error } = await supabaseAdmin.from("matches").insert(
        matches.map((m: any) => ({
          id: m.id,
          round: toInt(m.round),
          match_index: toInt(m.index),
          fighter1: m.fighter1,
          fighter2: m.fighter2,
          status: m.status,
          odds1: m.odds1,
          odds2: m.odds2,
          score1: toIntOrNull(m.score1),
          score2: toIntOrNull(m.score2),
          winner: m.winner,
        }))
      );
      if (error) throw new Error("matches insert: " + error.message);
    }

    if (tracks?.length) {
      const { error } = await supabaseAdmin.from("tracks").insert(
        tracks.map((t: any) => ({
          id: t.id,
          match_id: t.matchId,
          fighter_id: t.fighterId,
          url: t.url,
          is_published: !!t.isPublished,
          score: toIntOrNull(t.score),
        }))
      );
      if (error) throw new Error("tracks insert: " + error.message);
    }

    if (news?.length) {
      const { error } = await supabaseAdmin.from("news").insert(
        news.map((n: any, i: number) => ({
          id: n.id,
          title: n.title,
          subtitle: n.subtitle,
          url: n.url,
          bg_color: n.bgColor,
          border_color: n.borderColor,
          text_color: n.textColor,
          enabled: !!n.enabled,
          sort_order: i,
        }))
      );
      if (error) throw new Error("news insert: " + error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Ошибка сохранения:", err);
    return NextResponse.json(
      { error: err.message ?? "Не удалось сохранить" },
      { status: 500 }
    );
  }
}