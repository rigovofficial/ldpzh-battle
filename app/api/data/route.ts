import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    const [
      { data: config },
      { data: news },
      { data: boards },
      { data: fighters },
      { data: participations },
      { data: matches },
      { data: tracks },
    ] = await Promise.all([
      supabaseAdmin.from("site_config").select("*").eq("id", 1).maybeSingle(),
      supabaseAdmin.from("news").select("*").order("sort_order"),
      supabaseAdmin
        .from("boards")
        .select("*")
        .order("sort_order")
        .order("created_at"),
      supabaseAdmin.from("fighters").select("*").order("created_at"),
      supabaseAdmin.from("participations").select("*"),
      supabaseAdmin
        .from("matches")
        .select("*")
        .order("board_id")
        .order("round")
        .order("position"),
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
      boards: (boards ?? []).map((b) => ({
        id: b.id,
        title: b.title,
        type: b.type,
        status: b.status,
        showOnHome: b.show_on_home,
        sortOrder: b.sort_order,
        slots: b.slots,
      })),
      fighters: (fighters ?? []).map((f) => ({
        id: f.id,
        name: f.name,
        userId: f.user_id,
        totalScore: f.total_score,
      })),
      participations: (participations ?? []).map((p) => ({
        id: p.id,
        boardId: p.board_id,
        fighterId: p.fighter_id,
        prevScore: p.prev_score,
        localScore: p.local_score,
        seed: p.seed,
      })),
      matches: (matches ?? []).map((m) => ({
        id: m.id,
        boardId: m.board_id,
        round: m.round,
        position: m.position,
        teams: m.teams,
        isFire: m.is_fire,
        isFinal: m.is_final,
        status: m.status,
        odds1: Number(m.odds1),
        odds2: Number(m.odds2),
        score1: m.score1,
        score2: m.score2,
        winnerTeam: m.winner_team,
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