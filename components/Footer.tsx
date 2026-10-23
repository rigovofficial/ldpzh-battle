export default function Footer({ version }: { version?: string }) {
  return (
    <footer className="text-center py-6 text-[#5a5f66] text-[11px] border-t border-[#1f1f28] mt-10">
      Версия сайта {version || "1.0"} · Мальборо Мартини
    </footer>
  );
}
