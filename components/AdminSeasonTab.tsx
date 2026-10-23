"use client";

import type { Season } from "@/lib/types";

export default function AdminSeasonTab({ season, setSeason, maintenance, setMaintenance, maintConfig, setMaintConfig, version, setVersion }: any) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Сезон</h3>
        <div className="flex flex-col gap-3 max-w-[720px]">
          <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Название</span><input type="text" value={season.title} onChange={(e:any) => setSeason({...season, title: e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-3 py-2" /></label>
          <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Номер</span><input type="number" value={season.number} onChange={(e:any) => setSeason({...season, number: +e.target.value})} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-3 py-2" /></label>
        </div>
      </div>
      
      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Кнопка записи</h3>
        <div className="flex flex-col gap-4 max-w-[720px] p-4 bg-[#1d1d27] rounded-xl border border-[#333]">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={season.registration?.enabled ?? false} onChange={(e:any) => setSeason({...season, registration: { enabled: e.target.checked, buttonText: season.registration?.buttonText ?? "ЗАПИСАТЬСЯ", buttonColor: season.registration?.buttonColor ?? "#8b0033" }})} className="w-4 h-4 accent-[#8b0033]" /> Включить</label>
          <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Текст</span><input type="text" value={season.registration?.buttonText ?? ""} onChange={(e:any) => setSeason({...season, registration: { enabled: season.registration?.enabled ?? true, buttonText: e.target.value, buttonColor: season.registration?.buttonColor ?? "#8b0033" }})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></label>
          <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Цвет</span><input type="color" value={season.registration?.buttonColor ?? "#8b0033"} onChange={(e:any) => setSeason({...season, registration: { enabled: season.registration?.enabled ?? true, buttonText: season.registration?.buttonText ?? "ЗАПИСАТЬСЯ", buttonColor: e.target.value }})} className="w-16 h-8 bg-transparent border border-[#333] rounded" /></label>
        </div>
      </div>

      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#ff2b2b] text-sm uppercase tracking-widest mb-4">Техработы (Глушилка)</h3>
        <div className="flex flex-col gap-4 max-w-[720px] p-4 bg-[#1d1d27] rounded-xl border border-[#333]">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={maintenance} onChange={(e:any) => setMaintenance(e.target.checked)} className="w-4 h-4 accent-[#ff2b2b]" /> Включить техработы</label>
          <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Заголовок</span><input type="text" value={maintConfig.title} onChange={(e:any) => setMaintConfig({...maintConfig, title: e.target.value})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></label>
          <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Подзаголовок</span><input type="text" value={maintConfig.subtitle} onChange={(e:any) => setMaintConfig({...maintConfig, subtitle: e.target.value})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></label>
          <label className="flex flex-col gap-1"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Ссылка на картинку (Маркин)</span><input type="url" value={maintConfig.imageUrl} onChange={(e:any) => setMaintConfig({...maintConfig, imageUrl: e.target.value})} className="w-full bg-[#14141c] text-white border border-[#333] rounded px-3 py-2" /></label>
        </div>
      </div>

      <div className="border-t border-[#2a2a36] pt-6">
        <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Версия сайта</h3>
        <label className="flex flex-col gap-1 max-w-[720px]"><span className="text-[#9aa0a6] text-xs uppercase tracking-widest">Название версии</span><input type="text" value={version} onChange={(e:any) => setVersion(e.target.value)} className="w-full bg-[#1d1d27] text-white border border-[#333] rounded px-3 py-2" /></label>
      </div>
    </div>
  );
}