"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [login, setLogin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== password2) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password, displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка регистрации");
        return;
      }
      await refresh();
      router.push("/");
      router.refresh();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b0f] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-[420px] bg-[#14141c] border border-[#00a3ff] rounded-2xl p-6"
      >
        <h1 className="text-2xl font-black uppercase tracking-wider mb-6 text-center text-[#f5f5f5]">
          Регистрация
        </h1>

        <label className="flex flex-col gap-1 mb-4">
          <span className="text-xs uppercase tracking-widest text-[#9aa0a6]">
            Логин (латиница, цифры, _)
          </span>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
            className="bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
          />
        </label>

        <label className="flex flex-col gap-1 mb-4">
          <span className="text-xs uppercase tracking-widest text-[#9aa0a6]">
            Отображаемое имя
          </span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
          />
        </label>

        <label className="flex flex-col gap-1 mb-4">
          <span className="text-xs uppercase tracking-widest text-[#9aa0a6]">
            Пароль (минимум 6 символов)
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
          />
        </label>

        <label className="flex flex-col gap-1 mb-4">
          <span className="text-xs uppercase tracking-widest text-[#9aa0a6]">
            Повтори пароль
          </span>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
            className="bg-[#1d1d27] text-white border border-[#333] rounded-lg px-3 py-2 outline-none focus:border-[#00a3ff]"
          />
        </label>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-[#ff2b2b] bg-[rgba(255,43,43,0.08)] text-[#ff2b2b] text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#8b0033] hover:opacity-90 disabled:opacity-50 text-white font-extrabold py-3 rounded-lg cursor-pointer border-none"
        >
          {loading ? "Создаю..." : "Создать аккаунт"}
        </button>

        <p className="text-center text-sm text-[#9aa0a6] mt-6">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-[#00a3ff] underline">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}