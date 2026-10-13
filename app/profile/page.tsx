"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refresh, logout } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/profile");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) setDisplayName(user.displayName);
  }, [user]);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить");
        return;
      }
      await refresh();
      setMessage("Сохранено");
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setError("Сеть недоступна");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwMessage(null);

    if (newPassword !== newPassword2) {
      setPwError("Новые пароли не совпадают");
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error ?? "Не удалось сменить пароль");
        return;
      }
      setPwMessage("Пароль изменён. Сейчас тебя выкинет на страницу входа...");
      setOldPassword("");
      setNewPassword("");
      setNewPassword2("");
      // Ждём 2 секунды и делаем logout
      setTimeout(async () => {
        await logout();
        window.location.href = "/login";
      }, 2000);
    } catch {
      setPwError("Сеть недоступна");
    } finally {
      setPwSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0f] text-[#9aa0a6]">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0f] px-4 py-10">
      <div className="max-w-[560px] mx-auto">
        <Link
          href="/"
          className="text-[#00a3ff] text-sm no-underline hover:underline"
        >
          ← На главную
        </Link>

        <h1 className="text-2xl font-black uppercase tracking-wider my-6 text-white">
          Профиль
        </h1>

        {/* Имя */}
        <form
          onSubmit={saveName}
          className="bg-[#14141c] border border-[#00a3ff] rounded-2xl p-6 mb-6"
        >
          <div className="mb-5">
            <div className="text-xs uppercase tracking-widest text-[#9aa0a6] mb-1">
              Логин
            </div>
            <div className="text-white font-mono bg-[#1d1d27] border border-[#2a2a36] rounded-lg px-3 py-2">
              {user.login}
            </div>
            <div className="text-[#9aa0a6] text-xs mt-1.5">
              Логин изменить нельзя — это твой внутренний ID.
            </div>
          </div>

          <label className="flex flex-col gap-1 mb-5">
            <span className="text-xs uppercase tracking-widest text-[#9aa0a6]">
              Отображаемое имя
            </span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              className="bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
            />
          </label>

          {user.battleNickname && (
            <div className="mb-5">
              <div className="text-xs uppercase tracking-widest text-[#9aa0a6] mb-1">
                Боевой ник (назначен админом)
              </div>
              <div className="text-[#00a3ff] bg-[#1d1d27] border border-[#2a2a36] rounded-lg px-3 py-2">
                {user.battleNickname}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-[#ff2b2b] bg-[rgba(255,43,43,0.08)] text-[#ff2b2b] text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 rounded-lg border border-[#35d07f] bg-[rgba(53,208,127,0.10)] text-[#35d07f] text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || displayName === user.displayName}
            className="bg-[#8b0033] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold px-5 py-2.5 rounded-lg border-none cursor-pointer"
          >
            {saving ? "Сохраняю..." : "Сохранить имя"}
          </button>
        </form>

        {/* Смена пароля */}
        <form
          onSubmit={savePassword}
          className="bg-[#14141c] border border-[#ffb020] rounded-2xl p-6"
        >
          <h2 className="text-lg font-black uppercase tracking-wider text-[#ffb020] mb-4">
            Смена пароля
          </h2>

          <label className="flex flex-col gap-1 mb-4">
            <span className="text-xs uppercase tracking-widest text-[#9aa0a6]">
              Старый пароль
            </span>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              className="bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#ffb020]"
            />
          </label>

          <label className="flex flex-col gap-1 mb-4">
            <span className="text-xs uppercase tracking-widest text-[#9aa0a6]">
              Новый пароль (минимум 6 символов)
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#ffb020]"
            />
          </label>

          <label className="flex flex-col gap-1 mb-4">
            <span className="text-xs uppercase tracking-widest text-[#9aa0a6]">
              Повтори новый пароль
            </span>
            <input
              type="password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              autoComplete="new-password"
              className="bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#ffb020]"
            />
          </label>

          {pwError && (
            <div className="mb-4 p-3 rounded-lg border border-[#ff2b2b] bg-[rgba(255,43,43,0.08)] text-[#ff2b2b] text-sm">
              {pwError}
            </div>
          )}
          {pwMessage && (
            <div className="mb-4 p-3 rounded-lg border border-[#35d07f] bg-[rgba(53,208,127,0.10)] text-[#35d07f] text-sm">
              {pwMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={pwSaving || !oldPassword || !newPassword}
            className="bg-[#ffb020] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-[#2a1c00] font-extrabold px-5 py-2.5 rounded-lg border-none cursor-pointer"
          >
            {pwSaving ? "Меняю..." : "Сменить пароль"}
          </button>

          <p className="text-[#9aa0a6] text-xs mt-3">
            После смены пароля все сессии будут сброшены — придётся залогиниться заново.
          </p>
        </form>
      </div>
    </div>
  );
}