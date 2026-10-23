import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validUuid = (v: any): string | null => (!v ? null : UUID_RE.test(String(v)) ? String(v) : null);

export async function PUT(req: NextRequest) {
  const token = await getSessionCookie();
  const payload = await verifySession(token || "");
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });

  const { season, maintenance, maintenanceConfig, versionName, news, archive, matches, fighters, tracks, style, brackets, activeBracketId } = body;

  try {
    // 1. Начисление очков
    for (const m of matches) {
      if (m.isCompleted && m.winner && !m.pointsAwarded) {
        const { data: bets } = await supabaseAdmin.from("bets").select("*").eq("match_id", m.id);
        if (bets) {
          for (const bet of bets) {
            const winPoints = bet.fighter_id === m.winner ? Math.round(100 * Number(bet.coeff)) : -100;
            // Вызываем RPC, игнорируем ошибку, если её нет
            await supabaseAdmin.rpc('increment_points', { user_id: bet.user_id, amount: winPoints }).then();
          }
        }
        m.pointsAwarded = true;
      }
    }

    // 2. Удаление старых данных
    await supabaseAdmin.from("tracks").delete().neq("id", "__never__");
    await supabaseAdmin.from("matches").delete().neq("id", "__never__");
    await supabaseAdmin.from("fighters").delete().neq("id", "__never__");
    
    await supabaseAdmin.from("site_config").update({ active_bracket_id: null }).eq("id", 1);
    await supabaseAdmin.from("brackets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("news").delete().neq("id", "__never__");

    // 3. Вставка сеток
    if (brackets?.length) {
      const validBrackets = brackets.map((b: any) => ({
        id: validUuid(b.id) || crypto.randomUUID(),
        name: b.name,
        type: b.type
      }));
      const { error } = await supabaseAdmin.from("brackets").insert(validBrackets);
      if (error) throw new Error("brackets insert: " + error.message);
    }

    // 4. Вставка бойцов
    if (fighters?.length) {
      const { error } = await supabaseAdmin.from("fighters").insert(fighters.map((f: any) => ({
        id: f.id, 
        name: f.name, 
        user_id: validUuid(f.userId), 
        prev_score: f.prevScore, 
        total_score: f.totalScore, 
        bracket_id: validUuid(f.bracketId)
      })));
      if (error) throw new Error("fighters insert: " + error.message);
    }

    // 5. Вставка матчей
    if (matches?.length) {
      const { error } = await supabaseAdmin.from("matches").insert(matches.map((m: any) => ({
        id: m.id, 
        round: m.round, 
        index: m.index, 
        fighter1: m.fighter1, 
        fighter2: m.fighter2,
        is_completed: !!m.isCompleted, 
        is_betting_open: !!m.isBettingOpen, 
        is_tracks_open: !!m.isTracksOpen, 
        is_final: !!m.isFinal,
        odds1: m.odds1, 
        odds2: m.odds2, 
        score1: m.score1, 
        score2: m.score2, 
        winner: m.winner, 
        bracket_id: validUuid(m.bracketId)
      })));
      if (error) throw new Error("matches insert: " + error.message);
    }

    // 6. Вставка треков
    if (tracks?.length) {
      const { error } = await supabaseAdmin.from("tracks").insert(tracks.map((t: any) => ({
        id: t.id, 
        match_id: t.matchId, 
        fighter_id: t.fighterId, 
        url: t.url, 
        is_published: !!t.isPublished, 
        score: t.score
      })));
      if (error) throw new Error("tracks insert: " + error.message);
    }

    // 7. Вставка новостей
    if (news?.length) {
      const { error } = await supabaseAdmin.from("news").insert(news.map((n: any, i: number) => ({
        id: n.id, 
        title: n.title, 
        subtitle: n.subtitle, 
        url: n.url, 
        bg_color: n.bgColor, 
        border_color: n.borderColor, 
        text_color: n.textColor, 
        enabled: !!n.enabled, 
        sort_order: i
      })));
      if (error) throw new Error("news insert: " + error.message);
    }

    // 8. Обновление конфига
    const { error: configErr } = await supabaseAdmin.from("site_config").update({
      season, archive, style, maintenance: !!maintenance, maintenance_config: maintenanceConfig, version_name: versionName, active_bracket_id: validUuid(activeBracketId)
    }).eq("id", 1);
    if (configErr) throw new Error("site_config update: " + configErr.message);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Ошибка сохранения:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}