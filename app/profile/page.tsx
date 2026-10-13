"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/profile");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) setDisplayName(user.displayName);
  }, [user]);

  async function submit(e: React.FormEvent) {
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

        <form
          onSubmit={submit}
          className="bg-[#14141c] border border-[#00a3ff] rounded-2xl p-6"
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
            <span className="text-[#9aa0a6] text-xs mt-1">
              Видно в шапке и в интерфейсе. От 2 до 40 символов.
            </span>
          </label>

          {user.battleNickname && (
            <div className="mb-5">
              <div className="text-xs uppercase tracking-widest text-[#9aa0a6] mb-1">
                Боевой ник
              </div>
              <div className="text-[#00a3ff] bg-[#1d1d27] border border-[#2a2a36] rounded-lg px-3 py-2">
                {user.battleNickname}
              </div>
              <div className="text-[#9aa0a6] text-xs mt-1.5">
                Боевой ник назначает админ. Это имя отображается в турнирной
                сетке.
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
            {saving ? "Сохраняю..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
}