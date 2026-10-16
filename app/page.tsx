import ClientPage from "@/components/ClientPage";

// Режим «тотальной заглушки». Управляется переменной окружения.
// Админ видит сайт как обычно, все остальные — MaintenancePage.
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";

export default function Home() {
  return <ClientPage maintenanceMode={MAINTENANCE_MODE} />;
}
