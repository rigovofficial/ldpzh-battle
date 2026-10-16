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
const toFloat = (v: any, fallback = 2.0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
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

  const {
    season,
    maintenance,
    news,
    archive,
    style,
    boards,
    fighters,
    participations,
    matches,
    tracks,
  } = body;

  try {
    // 1. site_config
    {
      const { error } = await supabaseAdmin
        .from("site_config")
        .update({ season, archive, style, maintenance: !!maintenance })
        .eq("id", 1);
      if (error) throw new Error("site_config: " + error.message);
    }

    // 2. Удаляем всё кроме bets (bets держатся за матчи через CASCADE)
    for (const t of ["tracks", "matches", "participations", "fighters", "boards", "news"]) {
      const { error } = await supabaseAdmin.from(t).delete().neq("id", "__never__");
      if (error) throw new Error(`${t} delete: ` + error.message);
    }

    // 3. Вставляем заново
    if (boards?.length) {
      const { error } = await supabaseAdmin.from("boards").insert(
        boards.map((b: any) => ({
          id: b.id,
          title: b.title,
          type: b.type,
          status: b.status,
          show_on_home: !!b.showOnHome,
          sort_order: toInt(b.sortOrder),
          slots: b.slots ?? null,
        }))
      );
      if (error) throw new Error("boards insert: " + error.message);
    }

    if (fighters?.length) {
      const { error } = await supabaseAdmin.from("fighters").insert(
        fighters.map((f: any) => ({
          id: f.id,
          name: f.name,
          user_id: validUuid(f.userId),
          total_score: toInt(f.totalScore),
        }))
      );
      if (error) throw new Error("fighters insert: " + error.message);
    }

    if (participations?.length) {
      const { error } = await supabaseAdmin.from("participations").insert(
        participations.map((p: any) => ({
          board_id: p.boardId,
          fighter_id: p.fighterId,
          prev_score: toInt(p.prevScore),
          local_score: toInt(p.localScore),
          seed: p.seed ?? null,
        }))
      );
      if (error) throw new Error("participations insert: " + error.message);
    }

    if (matches?.length) {
      const { error } = await supabaseAdmin.from("matches").insert(
        matches.map((m: any) => ({
          id: m.id,
          board_id: m.boardId,
          round: toInt(m.round),
          position: toInt(m.position),
          teams: m.teams,
          is_fire: !!m.isFire,
          is_final: !!m.isFinal,
          status: m.status,
          odds1: toFloat(m.odds1),
          odds2: toFloat(m.odds2),
          score1: toIntOrNull(m.score1),
          score2: toIntOrNull(m.score2),
          winner_team:
            m.winnerTeam === 0 || m.winnerTeam === 1 ? m.winnerTeam : null,
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

    // 4. Начисляем очки за завершённые матчи
    //    (матчи, которые были удалены при пересборке — CASCADE удалил их ставки,
    //     а те, что остались — если completed + winner_team, обрабатываем)
    if (matches?.length) {
      const completedIds = matches
        .filter((m: any) => m.status === "completed" && m.winnerTeam !== null)
        .map((m: any) => m.id);

      if (completedIds.length > 0) {
        const { data: pendingBets } = await supabaseAdmin
          .from("bets")
          .select("id, user_id, match_id, team, coeff")
          .eq("processed", false)
          .in("match_id", completedIds);

        for (const bet of pendingBets ?? []) {
          const match = matches.find((m: any) => m.id === bet.match_id);
          if (!match) continue;
          const won = bet.team === match.winnerTeam;
          const delta = won
            ? Math.round(100 * Number(bet.coeff))
            : -100;

          // Инкремент users.predictions
          const { data: currentUser } = await supabaseAdmin
            .from("users")
            .select("predictions")
            .eq("id", bet.user_id)
            .single();
          if (currentUser) {
            await supabaseAdmin
              .from("users")
              .update({ predictions: (currentUser.predictions ?? 0) + delta })
              .eq("id", bet.user_id);
          }

          await supabaseAdmin
            .from("bets")
            .update({ processed: true })
            .eq("id", bet.id);
        }
      }
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