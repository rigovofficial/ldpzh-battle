import type { SeasonType, UserRole } from "./types";

export const seasonTypeLabel: Record<SeasonType, string> = {
  official: "Официальный",
  intermediate: "Промежуточный",
};

export const roleLabel: Record<UserRole, string> = {
  anonymous: "Аноним",
  user: "Юзер",
  participant: "Участник",
  admin: "Админ",
};