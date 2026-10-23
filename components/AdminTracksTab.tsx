"use client";

export default function AdminTracksTab({ tracks, fighters, matches, activeBracket, setTracks }: any) {
  return (
    <div>
      <h3 className="text-[#00a3ff] text-sm uppercase tracking-widest mb-4">Треки</h3>
      {tracks.map((t: any) => (
        <div key={t.id} className="bg-[#1d1d27] p-3 rounded mb-2 flex gap-2 items-center">
          <select value={t.fighterId} onChange={(e:any) => setTracks((prev:any) => prev.map((x:any) => x.id === t.id ? {...x, fighterId: e.target.value} : x))} className="bg-[#14141c] text-white text-xs px-2 py-1 rounded">
            {fighters.filter((f:any) => f.bracketId === activeBracket).map((f:any) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select value={t.matchId} onChange={(e:any) => setTracks((prev:any) => prev.map((x:any) => x.id === t.id ? {...x, matchId: e.target.value} : x))} className="bg-[#14141c] text-white text-xs px-2 py-1 rounded">
            {matches.filter((m:any) => m.bracketId === activeBracket).map((m:any) => <option key={m.id} value={m.id}>R{m.round}M{m.index}</option>)}
          </select>
          <input type="url" value={t.url} onChange={(e:any) => setTracks((prev:any) => prev.map((x:any) => x.id === t.id ? {...x, url: e.target.value} : x))} className="flex-1 bg-[#14141c] text-white text-xs px-2 py-1 rounded" />
          <button onClick={() => { if (confirm("Удалить?")) setTracks((prev:any) => prev.filter((x:any) => x.id !== t.id)) }} className="text-[#ff2b2b] text-xs">🗑</button>
        </div>
      ))}
    </div>
  );
}