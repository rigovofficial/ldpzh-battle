import ClientPage from "@/components/ClientPage";
import MaintenancePage from "@/components/MaintenancePage";

// Режим техработ:
//   MAINTENANCE_MODE=true  → всем показывается заглушка
//   MAINTENANCE_MODE=false → сайт работает как обычно
// Управляется переменной окружения в .env.local и на Vercel.
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";

export default function Home() {
  if (MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }
  return <ClientPage />;
}