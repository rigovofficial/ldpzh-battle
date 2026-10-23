import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const token = await getSessionCookie();
  const payload = await verifySession(token || "");
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });

  const { season, maintenance, maintenanceConfig, versionName, news, archive, matches, fighters, tracks, style, brackets, activeBracketId } = body;

  try {
    // 1. Начисление очков ДО удаления ставок
    for (const m of matches) {
      if (m.isCompleted && m.winner && !m.pointsAwarded) {
        const { data: bets } = await supabaseAdmin.from("bets").select("*").eq("match_id", m.id);
        if (bets) {
          for (const bet of bets) {
            const winPoints = bet.fighter_id === m.winner ? Math.round(100 * Number(bet.coeff)) : -100;
            await supabaseAdmin.rpc('increment_points', { user_id: bet.user_id, amount: winPoints });
          }
        }
        m.pointsAwarded = true;
      }
    }

    // 2. Удаление старых данных (строго в таком порядке из-за FK)
    await supabaseAdmin.from("tracks").delete().neq("id", "__never__");
    await supabaseAdmin.from("matches").delete().neq("id", "__never__");
    await supabaseAdmin.from("fighters").delete().neq("id", "__never__");
    
    // Сначала отвязываем активную сетку, чтобы можно было удалить старые
    await supabaseAdmin.from("site_config").update({ active_bracket_id: null }).eq("id", 1);
    await supabaseAdmin.from("brackets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("news").delete().neq("id", "__never__");

    // 3. Вставка новых данных (сетки должны быть первыми)
    if (brackets?.length) {
      const { error } = await supabaseAdmin.from("brackets").insert(brackets.map((b: any) => ({ id: b.id, name: b.name, type: b.type })));
      if (error) throw new Error("brackets insert: " + error.message);
    }

    if (fighters?.length) {
      const { error } = await supabaseAdmin.from("fighters").insert(fighters.map((f: any) => ({
        id: f.id, name: f.name, user_id: f.userId, prev_score: f.prevScore, total_score: f.totalScore, bracket_id: f.bracketId
      })));
      if (error) throw new Error("fighters insert: " + error.message);
    }

    if (matches?.length) {
      const { error } = await supabaseAdmin.from("matches").insert(matches.map((m: any) => ({
        id: m.id, round: m.round, index: m.index, fighter1: m.fighter1, fighter2: m.fighter2,
        is_completed: !!m.isCompleted, is_betting_open: !!m.isBettingOpen, is_tracks_open: !!m.isTracksOpen, is_final: !!m.isFinal,
        odds1: m.odds1, odds2: m.odds2, score1: m.score1, score2: m.score2, winner: m.winner, bracket_id: m.bracketId
      })));
      if (error) throw new Error("matches insert: " + error.message);
    }

    if (tracks?.length) {
      const { error } = await supabaseAdmin.from("tracks").insert(tracks.map((t: any) => ({
        id: t.id, match_id: t.matchId, fighter_id: t.fighterId, url: t.url, is_published: !!t.isPublished, score: t.score
      })));
      if (error) throw new Error("tracks insert: " + error.message);
    }

    if (news?.length) {
      const { error } = await supabaseAdmin.from("news").insert(news.map((n: any, i: number) => ({
        id: n.id, title: n.title, subtitle: n.subtitle, url: n.url, bg_color: n.bgColor, border_color: n.borderColor, text_color: n.textColor, enabled: !!n.enabled, sort_order: i
      })));
      if (error) throw new Error("news insert: " + error.message);
    }

    // 4. Обновление конфига в самом конце
    const { error: configErr } = await supabaseAdmin.from("site_config").update({
      season, archive, style, maintenance: !!maintenance, maintenance_config: maintenanceConfig, version_name: versionName, active_bracket_id: activeBracketId
    }).eq("id", 1);
    if (configErr) throw new Error("site_config update: " + configErr.message);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Ошибка сохранения:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}