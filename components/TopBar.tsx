"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function TopBar({
  onOpenAdmin,
}: {
  onOpenAdmin: () => void;
}) {
  const { user, loading, logout } = useAuth();
  const role = user?.role ?? "anonymous";

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  return (
    <div className="sticky top-0 z-40 bg-[#14141c] border-b border-[#00a3ff] px-4 py-3 flex items-center justify-between flex-wrap gap-3">
      <Link
        href="/"
        className="font-black tracking-wide text-[15px] no-underline text-white"
      >
        ЛДПЖ<span className="text-[#00a3ff]">-Батл</span>
      </Link>

      <div className="flex items-center gap-2 flex-wrap">
        {role === "admin" && (
          <button
            onClick={onOpenAdmin}
            className="bg-gradient-to-r from-[#8b0033] to-[#4a001a] text-white border border-[#00a3ff] px-3.5 py-2 rounded-lg cursor-pointer font-bold text-[13px] tracking-wide hover:opacity-90"
          >
            🛠 Открыть админ-панель
          </button>
        )}

        {loading ? (
          <span className="text-[#9aa0a6] text-sm">…</span>
        ) : user ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-2 no-underline text-white hover:opacity-90 px-2 py-1.5 rounded-lg border border-transparent hover:border-[#333] transition-colors"
              title="Профиль"
            >
              <span className="text-[13px] font-bold">
                {user.displayName}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#9aa0a6]">
                {user.role}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-transparent text-[#ff2b2b] border border-[#ff2b2b] px-3 py-2 rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#ff2b2b] hover:text-white transition-colors"
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-[#00a3ff] border border-[#00a3ff] px-3 py-2 rounded-lg text-[13px] font-bold no-underline hover:bg-[#00a3ff] hover:text-[#002233] transition-colors"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="bg-[#8b0033] text-white px-3 py-2 rounded-lg text-[13px] font-bold no-underline hover:opacity-90"
            >
              Регистрация
            </Link>
          </>
        )}
      </div>
    </div>
  );
}