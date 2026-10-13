import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const token = await getSessionCookie();
  if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const payload = await verifySession(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });

  const { season, maintenance, news, archive, matches, fighters, tracks, style } = body;

  try {
    // 1. site_config — одна строка
    const { error: configErr } = await supabaseAdmin
      .from("site_config")
      .update({
        season,
        archive,
        style,
        maintenance: !!maintenance,
      })
      .eq("id", 1);
    if (configErr) throw new Error("site_config: " + configErr.message);

    // 2. news — удаляем всё и вставляем заново (простой и надёжный способ)
    await supabaseAdmin.from("news").delete().neq("id", "__never__");
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
          enabled: n.enabled,
          sort_order: i,
        }))
      );
      if (error) throw new Error("news: " + error.message);
    }

    // 3. fighters
    if (fighters?.length) {
      const { error } = await supabaseAdmin.from("fighters").upsert(
        fighters.map((f: any) => ({
          id: f.id,
          name: f.name,
          user_id: f.userId,
          prev_score: f.prevScore,
          total_score: f.totalScore,
        }))
      );
      if (error) throw new Error("fighters: " + error.message);
    }

    // 4. matches
    if (matches?.length) {
      const { error } = await supabaseAdmin.from("matches").upsert(
        matches.map((m: any) => ({
          id: m.id,
          round: m.round,
          match_index: m.index,
          fighter1: m.fighter1,
          fighter2: m.fighter2,
          status: m.status,
          odds1: m.odds1,
          odds2: m.odds2,
          score1: m.score1,
          score2: m.score2,
          winner: m.winner,
        }))
      );
      if (error) throw new Error("matches: " + error.message);
    }

    // 5. tracks — удаляем всё и вставляем заново
    await supabaseAdmin.from("tracks").delete().neq("id", "__never__");
    if (tracks?.length) {
      const { error } = await supabaseAdmin.from("tracks").insert(
        tracks.map((t: any) => ({
          id: t.id,
          match_id: t.matchId,
          fighter_id: t.fighterId,
          url: t.url,
          is_published: t.isPublished,
          score: t.score,
        }))
      );
      if (error) throw new Error("tracks: " + error.message);
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