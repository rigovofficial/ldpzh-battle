import type { NewsItem } from "@/lib/types";

export default function NewsBanners({ items }: { items: NewsItem[] }) {
  const visible = items.filter((n) => n.enabled);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mb-3">
      {visible.map((n) => (
        <a
          key={n.id}
          href={n.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block no-underline text-center rounded-xl p-6 relative overflow-hidden transition-transform hover:-translate-y-0.5"
          style={{
            backgroundColor: n.bgColor,
            border: `2px solid ${n.borderColor}`,
            color: n.textColor,
            boxShadow: `0 0 20px ${n.borderColor}40`,
          }}
        >
          <div className="font-black uppercase tracking-[1.5px] text-[22px] mb-1.5">
            {n.title}
          </div>
          <div className="uppercase text-xs tracking-[2px] opacity-90">
            {n.subtitle}
          </div>
        </a>
      ))}
    </div>
  );
}