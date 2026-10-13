// ============================================================
// РОЛИ И СТАТУСЫ
// ============================================================

export type UserRole = "anonymous" | "user" | "participant" | "admin";

export type MatchStatus =
  | "pending"
  | "betting_open"
  | "tracks_open"
  | "judging"
  | "completed";

export type SeasonType = "official" | "intermediate";

// ============================================================
// ОСНОВНЫЕ СУЩНОСТИ
// ============================================================

export interface Fighter {
  id: string;
  name: string;
  userId: string | null;
  prevScore: number;
  totalScore: number;
}

export interface Match {
  id: string;
  round: number;
  index: number;
  fighter1: string | null;
  fighter2: string | null;
  status: MatchStatus;
  odds1: number;
  odds2: number;
  score1: number | null;
  score2: number | null;
  winner: string | null;
}

export interface Season {
  title: string;
  number: number;
  type: SeasonType;
  status: string;
  slots: number;
}

export interface Track {
  id: string;
  matchId: string;
  fighterId: string;
  url: string;
  isPublished: boolean;
  score: number | null;
}

// ============================================================
// НОВОСТИ И АРХИВ
// ============================================================

export interface NewsItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  enabled: boolean;
}

export interface ArchiveConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  url: string;
}
export interface Bet {
  userId: string;
  matchId: string;
  fighterId: string;
  coeff: number;
}
export interface User {
  id: string;
  login: string;
  displayName: string;
  role: UserRole;
  battleNickname: string | null;
}
export interface StyleConfig {
  primary: string;
  accent: string;
  grayscale: number; // 0 | 1
  participantActive: string;
  participantWin: string;
  participantLoss: string;
}
