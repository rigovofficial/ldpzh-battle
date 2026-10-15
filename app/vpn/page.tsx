export default function VpnPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white flex items-center justify-center p-6">
      <div className="max-w-[560px] text-center">
        <div className="text-7xl mb-6">🚫</div>

        <h1 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-4">
          Не грузит даже заглушка...
        </h1>

        <p className="text-[#9aa0a6] text-lg mb-8">
          Подключи{" "}
          <strong className="text-white">MAMKIN VPN</strong> — и всё заведётся.
        </p>

        <a
          href="https://t.me/MAMKIN_uskoritel_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#8b0033] hover:opacity-90 text-white font-extrabold px-6 py-4 rounded-xl no-underline text-base"
        >
          🚀 Открыть MAMKIN VPN в Telegram
        </a>

        <p className="text-[#666] text-xs mt-8">
          Это не реклама. Это просто работает.
        </p>
      </div>
    </div>
  );
}