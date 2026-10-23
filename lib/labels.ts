import type { SeasonType, UserRole } from "./types";

export const seasonTypeLabel: Record<SeasonType, string> = {
  official: "Официальный",
  intermediate: "Промежуточный",
};

export const seasonStatusLabel: Record<string, string> = {
  draft: "Черновик",
  qualifiers: "Отборочные",
  main: "Основной этап",
  finished: "Завершён",
};

export const roleLabel: Record<UserRole, string> = {
  anonymous: "Аноним",
  user: "Юзер",
  participant: "Участник",
  admin: "Админ",
};