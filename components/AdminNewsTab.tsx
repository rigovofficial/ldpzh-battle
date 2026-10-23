"use client";

export default function AdminNewsTab({ news, archive, setNews, setArchive }: any) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-1">Новостные баннеры</h3>
        <div className="flex flex-col gap-4 mt-4">
          {news.map((n: any, i: number) => (
            <div key={n.id} className="bg-[#1d1d27] rounded-xl p-4 border-l-4" style={{ borderLeftColor: n.borderColor }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Баннер #{i + 1}</span>
                <button onClick={() => { if (confirm("Удалить?")) setNews((prev:any) => prev.filter((x:any) => x.id !== n.id)) }} className="text-[#ff2b2b] border border-[#ff2b2b] px-3 py-1 rounded text-xs hover:bg-[#ff2b2b] hover:text-white">🗑 Удалить</button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Заголовок</span><input type="text" value={n.title} onChange={(e:any) => setNews((prev:any) => prev.map((x:any) => x.id === n.id ? {...x, title: e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1" /></label>
                <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Подпись</span><input type="text" value={n.subtitle} onChange={(e:any) => setNews((prev:any) => prev.map((x:any) => x.id === n.id ? {...x, subtitle: e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1" /></label>
                <label className="flex flex-col gap-1 col-span-2"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Ссылка</span><input type="url" value={n.url} onChange={(e:any) => setNews((prev:any) => prev.map((x:any) => x.id === n.id ? {...x, url: e.target.value} : x))} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-2 py-1" /></label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <ColorField label="Фон" value={n.bgColor} onChange={(v: any) => setNews((prev:any) => prev.map((x:any) => x.id === n.id ? {...x, bgColor: v} : x))} />
                <ColorField label="Рамка" value={n.borderColor} onChange={(v: any) => setNews((prev:any) => prev.map((x:any) => x.id === n.id ? {...x, borderColor: v} : x))} />
                <ColorField label="Текст" value={n.textColor} onChange={(v: any) => setNews((prev:any) => prev.map((x:any) => x.id === n.id ? {...x, textColor: v} : x))} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setNews((prev:any) => [...prev, { id: "n_" + Date.now(), title: "НОВОСТЬ", subtitle: "подпись", url: "https://", bgColor: "#8b0033", borderColor: "#00a3ff", textColor: "#ffffff", enabled: true }])} className="mt-4 bg-[#8b0033] text-white font-bold px-4 py-2 rounded hover:opacity-90">+ Добавить</button>
      </div>
      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Архив</h3>
        <div className="flex flex-col gap-3 max-w-[720px]">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={archive.enabled} onChange={(e:any) => setArchive({...archive, enabled: e.target.checked})} /> Включен</label>
          <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Заголовок</span><input type="text" value={archive.title} onChange={(e:any) => setArchive({...archive, title: e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-2 py-1" /></label>
          <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Подпись</span><input type="text" value={archive.subtitle} onChange={(e:any) => setArchive({...archive, subtitle: e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-2 py-1" /></label>
          <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Ссылка</span><input type="url" value={archive.url} onChange={(e:any) => setArchive({...archive, url: e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-2 py-1" /></label>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[#9aa0a6] text-xs uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e:any) => onChange(e.target.value)} className="w-8 h-8 bg-transparent border border-[#333] rounded cursor-pointer" />
        <input type="text" value={value} onChange={(e:any) => onChange(e.target.value)} className="flex-1 bg-[#14141c] text-white border border-[#333] rounded px-2 py-1 text-xs font-mono" />
      </div>
    </div>
  );
}