import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    const [
      { data: config },
      { data: news },
      { data: matches },
      { data: fighters },
      { data: tracks },
    ] = await Promise.all([
      supabaseAdmin.from("site_config").select("*").eq("id", 1).maybeSingle(),
      supabaseAdmin.from("news").select("*").order("sort_order"),
      supabaseAdmin
        .from("matches")
        .select("*")
        .order("round")
        .order("match_index"),
      supabaseAdmin.from("fighters").select("*"),
      supabaseAdmin.from("tracks").select("*"),
    ]);

    return NextResponse.json({
      season: config?.season ?? null,
      maintenance: config?.maintenance ?? false,
      archive: config?.archive ?? null,
      style: config?.style ?? null,
      news: (news ?? []).map((n) => ({
        id: n.id,
        title: n.title,
        subtitle: n.subtitle,
        url: n.url,
        bgColor: n.bg_color,
        borderColor: n.border_color,
        textColor: n.text_color,
        enabled: n.enabled,
      })),
      matches: (matches ?? []).map((m) => ({
        id: m.id,
        round: m.round,
        index: m.match_index,
        fighter1: m.fighter1,
        fighter2: m.fighter2,
        status: m.status,
        odds1: Number(m.odds1),
        odds2: Number(m.odds2),
        score1: m.score1,
        score2: m.score2,
        winner: m.winner,
      })),
      fighters: (fighters ?? []).map((f) => ({
        id: f.id,
        name: f.name,
        userId: f.user_id,
        prevScore: f.prev_score,
        totalScore: f.total_score,
      })),
      tracks: (tracks ?? []).map((t) => ({
        id: t.id,
        matchId: t.match_id,
        fighterId: t.fighter_id,
        url: t.url,
        isPublished: t.is_published,
        score: t.score,
      })),
    });
  } catch (err) {
    console.error("Ошибка /api/data:", err);
    return NextResponse.json(
      { error: "Не удалось загрузить данные" },
      { status: 500 }
    );
  }
}