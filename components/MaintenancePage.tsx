"use client";

import { useEffect, useState } from "react";

// Сюда добавляй ссылки на фото Маркина.
// Можно загрузить на любой публичный хостинг и вставить URL.
// Пока список пуст — будет показана заглушка с микрофоном.
const MARKIN_PHOTOS: string[] = [
  // "https://example.com/markin-1.jpg",
  // "https://example.com/markin-2.jpg",
];

const ROADMAP = [
  "Переработанная система ставок",
  "Таблица лидеров по предиктам",
  "Мелочи в дизайне",
  "Запись на батл",
  "Просмотр сразу двух сезонов",
];

export default function MaintenancePage() {
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (MARKIN_PHOTOS.length > 0) {
      const random =
        MARKIN_PHOTOS[Math.floor(Math.random() * MARKIN_PHOTOS.length)];
      setPhoto(random);
    }
  }, []);

  // Если API не ответит за 8 секунд — отправляем на /vpn
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/vpn";
    }, 8000);

    fetch("/api/data", { cache: "no-store" })
      .then(() => clearTimeout(timer))
      .catch(() => {
        clearTimeout(timer);
        window.location.href = "/vpn";
      });

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-[#f5f5f5] p-4 md:p-8">
      <div className="max-w-[720px] mx-auto">
        <div className="rounded-2xl overflow-hidden border-2 border-[#00a3ff] mb-6 bg-gradient-to-br from-[#14141c] to-[#1d1d27] aspect-video flex items-center justify-center">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt="Markin"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🎤</div>
              <div className="text-[#9aa0a6] text-sm uppercase tracking-widest">
                Здесь скоро будет фото Маркина
              </div>
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1.5 rounded-full bg-[#ffb020] text-[#2a1c00] font-extrabold text-xs tracking-widest uppercase mb-4">
            🚧 В разработке
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-3">
            Сайт обновляется до версии 1.1
          </h1>
          <p className="text-[#9aa0a6] text-base">
            Придётся подождать релиза новой версии
          </p>
        </div>

        <div className="bg-[#14141c] border border-[#2a2a36] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-extrabold uppercase tracking-wider mb-4 text-[#00a3ff]">
            Что будет в новой версии
          </h2>
          <ul className="flex flex-col gap-2.5">
            {ROADMAP.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[15px]">
                <span className="text-[#35d07f] font-bold shrink-0">◆</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <a
          href="https://ldpj-battle.ru"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#8b0033] hover:opacity-90 text-white text-center font-extrabold py-4 rounded-xl no-underline text-base mb-6"
        >
          🔥 Посмотреть пока сайт трипчика
        </a>

        <div className="text-center text-[#666] text-xs">
          ЛДПЖ-Батл · версия 1.1 в разработке
        </div>
      </div>
    </div>
  );
}