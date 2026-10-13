"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { refresh } = useAuth();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка входа");
        return;
      }
      await refresh();
      router.push(next);
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
          Вход в ЛДПЖ-Батл
        </h1>

        <label className="flex flex-col gap-1 mb-4">
          <span className="text-xs uppercase tracking-widest text-[#9aa0a6]">
            Логин
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
            Пароль
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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
          {loading ? "Вхожу..." : "Войти"}
        </button>

        <p className="text-center text-sm text-[#9aa0a6] mt-6">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-[#00a3ff] underline">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0b0f]" />}>
      <LoginForm />
    </Suspense>
  );
}