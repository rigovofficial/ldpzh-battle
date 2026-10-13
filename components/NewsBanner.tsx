export default function NewsBanner({
  title,
  subtitle,
  url,
}: {
  title: string;
  subtitle: string;
  url: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline text-white text-center rounded-xl p-6 mb-6 relative overflow-hidden transition-transform hover:-translate-y-0.5 bg-[#8b0033] border-2 border-[#00a3ff] shadow-[0_0_20px_rgba(0,163,255,0.25)]"
    >
      <div className="font-black uppercase tracking-[1.5px] text-[22px] mb-1.5">
        {title}
      </div>
      <div className="uppercase text-xs tracking-[2px] opacity-90">
        {subtitle}
      </div>
    </a>
  );
}