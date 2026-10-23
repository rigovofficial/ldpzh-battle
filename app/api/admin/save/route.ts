import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const token = await getSessionCookie();
  const payload = await verifySession(token || "");
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });

  const { season, maintenance, news, archive, matches, fighters, tracks, style, maintenanceConfig, versionName } = body;

  try {
    // 1. Конфиг
    await supabaseAdmin.from("site_config").update({ 
      season, archive, style, maintenance: !!maintenance, maintenance_config: maintenanceConfig, version_name: versionName 
    }).eq("id", 1);

    // 2. Логика начисления очков
    for (const m of matches) {
      if (m.status === "completed" && m.winner && !m.pointsAwarded) {
        // Получаем все ставки на этот матч
        const { data: bets } = await supabaseAdmin.from("bets").select("*").eq("match_id", m.id);
        if (bets && bets.length > 0) {
          for (const bet of bets) {
            if (bet.fighter_id === m.winner) {
              // Выиграл: +100 * кэф
              const winPoints = Math.round(100 * Number(bet.coeff));
              await supabaseAdmin.rpc('increment_points', { user_id: bet.user_id, amount: winPoints });
            } else {
              // Проиграл: -100
              await supabaseAdmin.rpc('increment_points', { user_id: bet.user_id, amount: -100 });
            }
          }
        }
        // Помечаем, что очки выданы
        m.pointsAwarded = true;
      }
    }

    // 3. Перезапись игровых данных (bets не трогаем, чтобы сохранить историю)
    await supabaseAdmin.from("tracks").delete().neq("id", "__never__");
    await supabaseAdmin.from("matches").delete().neq("id", "__never__");
    await supabaseAdmin.from("fighters").delete().neq("id", "__never__");
    await supabaseAdmin.from("news").delete().neq("id", "__never__");

    if (fighters?.length) await supabaseAdmin.from("fighters").insert(fighters.map((f: any) => ({ id: f.id, name: f.name, user_id: f.userId, prev_score: f.prevScore, total_score: f.totalScore })));
    if (matches?.length) await supabaseAdmin.from("matches").insert(matches.map((m: any) => ({ id: m.id, round: m.round, match_index: m.index, fighter1: m.fighter1, fighter2: m.fighter2, status: m.status, odds1: m.odds1, odds2: m.odds2, score1: m.score1, score2: m.score2, winner: m.winner, is_fire: !!m.isFire, points_awarded: !!m.pointsAwarded })));
    if (tracks?.length) await supabaseAdmin.from("tracks").insert(tracks.map((t: any) => ({ id: t.id, match_id: t.matchId, fighter_id: t.fighterId, url: t.url, is_published: !!t.isPublished, score: t.score })));
    if (news?.length) await supabaseAdmin.from("news").insert(news.map((n: any, i: number) => ({ id: n.id, title: n.title, subtitle: n.subtitle, url: n.url, bg_color: n.bgColor, border_color: n.borderColor, text_color: n.textColor, enabled: !!n.enabled, sort_order: i })));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}