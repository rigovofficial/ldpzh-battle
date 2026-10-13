import type { ArchiveConfig } from "@/lib/types";

export default function ArchiveBanner({ config }: { config: ArchiveConfig }) {
  if (!config.enabled) return null;

  return (
    <a
      href={config.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline text-center rounded-xl p-4 mb-6 border-2 border-[#3a3a52] bg-gradient-to-r from-[#1a1a2e] to-[#2a2a44] text-[#e0e0ff] transition-transform hover:-translate-y-0.5"
    >
      <div className="font-bold uppercase tracking-[1.5px] text-sm">
        {config.title}
      </div>
      <div className="uppercase text-[11px] tracking-[2px] opacity-70 mt-1">
        {config.subtitle}
      </div>
    </a>
  );
}