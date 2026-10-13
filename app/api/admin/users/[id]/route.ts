import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSessionCookie, verifySession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionCookie();
  if (!token)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const payload = await verifySession(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });

  const patch: any = {};
  if (body.role && ["user", "participant", "admin"].includes(body.role)) {
    patch.role = body.role;
  }
  if (typeof body.displayName === "string" && body.displayName.trim()) {
    patch.display_name = body.displayName.trim();
  }
  if (body.battleNickname !== undefined) {
    patch.battle_nickname = body.battleNickname || null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Нечего менять" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("users").update(patch).eq("id", id);
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionCookie();
  if (!token)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const payload = await verifySession(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { id } = await params;
  if (id === payload.userId) {
    return NextResponse.json(
      { error: "Нельзя удалить себя" },
      { status: 400 }
    );
  }

  // Отвязываем все слоты бойцов от этого юзера
  await supabaseAdmin.from("fighters").update({ user_id: null }).eq("user_id", id);

  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Не удалось удалить" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}