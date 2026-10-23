"use client";

export default function AdminBackupTab({ season, maintenance, news, archive, matches, fighters, users, tracks, style, brackets, activeBracket, onImport }: any) {
  function exportJSON() {
    const data = { version: 2, exportedAt: new Date().toISOString(), season, maintenance, news, archive, matches, fighters, users, tracks, style, brackets, activeBracketId: activeBracket };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `backup.json`; a.click();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Экспорт</h3>
        <button onClick={exportJSON} className="bg-[#8b0033] text-white font-bold px-4 py-2 rounded hover:opacity-90">💾 Скачать JSON</button>
      </div>
      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Импорт</h3>
        <label className="inline-block bg-[#ff2b2b] text-white font-bold px-4 py-2 rounded cursor-pointer hover:opacity-90">
          📂 Загрузить JSON
          <input type="file" accept=".json,application/json" onChange={(e: any) => {
            const file = e.target.files?.[0]; if (!file) return;
            if (!confirm("Импорт перезапишет данные в черновике. Продолжить?")) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              try { const d = JSON.parse(ev.target?.result as string);
                onImport(d);
                alert("Импорт выполнен. Нажми Сохранить!");
              } catch { alert("Ошибка чтения"); }
            }; reader.readAsText(file); e.target.value = "";
          }} className="hidden" />
        </label>
      </div>
    </div>
  );
}