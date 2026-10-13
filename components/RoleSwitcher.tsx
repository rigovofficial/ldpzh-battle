type Role = "anonymous" | "user" | "participant" | "admin";

export default function RoleSwitcher({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  const items: [Role, string][] = [
    ["anonymous", "Аноним"],
    ["user", "Юзер"],
    ["participant", "Участник"],
    ["admin", "Админ"],
  ];

  return (
    <div className="flex gap-2 mb-6 flex-wrap items-center p-3 bg-[#14141c] border border-dashed border-[#333] rounded-xl">
      <span className="text-xs text-[#9aa0a6] mr-1">
        🧪 Тест роли (потом заменится реальным логином):
      </span>
      {items.map(([r, label]) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-colors ${
            role === r
              ? "bg-[#8b0033] text-white border-[#00a3ff]"
              : "bg-[#1d1d27] text-[#f5f5f5] border-transparent hover:border-[#333]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}