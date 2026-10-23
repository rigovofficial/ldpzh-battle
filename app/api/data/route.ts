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
      { data: registrations },
      { data: usersPoints }
    ] = await Promise.all([
      supabaseAdmin.from("site_config").select("*").eq("id", 1).maybeSingle(),
      supabaseAdmin.from("news").select("*").order("sort_order"),
      supabaseAdmin.from("matches").select("*").order("round").order("match_index"),
      supabaseAdmin.from("fighters").select("*"),
      supabaseAdmin.from("tracks").select("*"),
      supabaseAdmin.from("registrations").select("*").eq("status", "pending"),
      supabaseAdmin.from("users").select("id, display_name, predictions_points").order("predictions_points", { ascending: false }).limit(20)
    ]);

    return NextResponse.json({
      season: config?.season ?? null,
      maintenance: config?.maintenance ?? false,
      maintenanceConfig: config?.maintenance_config ?? { title: "ТЕХРАБОТЫ", subtitle: "ЗАХОДИ ПОЗЖЕ", imageUrl: "" },
      versionName: config?.version_name ?? "1.0",
      archive: config?.archive ?? null,
      style: config?.style ?? null,
      news: (news ?? []).map((n) => ({ id: n.id, title: n.title, subtitle: n.subtitle, url: n.url, bgColor: n.bg_color, borderColor: n.border_color, textColor: n.text_color, enabled: n.enabled })),
      matches: (matches ?? []).map((m) => ({ id: m.id, round: m.round, index: m.match_index, fighter1: m.fighter1, fighter2: m.fighter2, status: m.status, odds1: Number(m.odds1), odds2: Number(m.odds2), score1: m.score1, score2: m.score2, winner: m.winner, isFire: m.is_fire, pointsAwarded: m.points_awarded })),
      fighters: (fighters ?? []).map((f) => ({ id: f.id, name: f.name, userId: f.user_id, prevScore: f.prev_score, totalScore: f.total_score })),
      tracks: (tracks ?? []).map((t) => ({ id: t.id, matchId: t.match_id, fighterId: t.fighter_id, url: t.url, isPublished: t.is_published, score: t.score })),
      registrations: registrations ?? [],
      leaderboard: (usersPoints ?? []).map(u => ({ id: u.id, displayName: u.display_name, points: u.predictions_points || 0 }))
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка данных" }, { status: 500 });
  }
}