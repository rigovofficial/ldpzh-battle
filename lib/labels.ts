import type { MatchStatus, SeasonType, UserRole } from "./types";

export const matchStatusLabel: Record<MatchStatus, string> = {
  pending: "Ожидание",
  betting_open: "Ставки открыты",
  tracks_open: "Приём треков",
  judging: "Судейство",
  completed: "Завершён",
};

// короткие для бейджиков в сетке
export const matchStatusShort: Record<MatchStatus, string> = {
  pending: "ОЖИДАНИЕ",
  betting_open: "СТАВКИ",
  tracks_open: "ТРЕКИ",
  judging: "СУД",
  completed: "ГОТОВО",
};

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
export const seasonStatusLabel: Record<string, string> = {
  draft: "Черновик",
  qualifiers: "Отборочные",
  main: "Основной этап",
  finished: "Завершён",
};
