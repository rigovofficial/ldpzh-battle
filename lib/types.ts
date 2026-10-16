export type UserRole = "anonymous" | "user" | "participant" | "admin";
export type MatchStatus =
  | "pending"
  | "betting_open"
  | "tracks_open"
  | "judging"
  | "completed";
export type SeasonType = "official" | "intermediate";
export type BoardType = "standard" | "free";
export type BoardStatus = "draft" | "active" | "archived" | "hidden";

export interface Team {
  name: string | null;
  fighterIds: string[];
}

export interface Match {
  id: string;
  boardId: string;
  round: number;
  position: number;
  teams: Team[];
  isFire: boolean;
  isFinal: boolean;
  status: MatchStatus;
  odds1: number;
  odds2: number;
  score1: number | null;
  score2: number | null;
  winnerTeam: 0 | 1 | null;
}

export interface Board {
  id: string;
  title: string;
  type: BoardType;
  status: BoardStatus;
  showOnHome: boolean;
  sortOrder: number;
  slots: number | null;
}

export interface Fighter {
  id: string;
  name: string;
  userId: string | null;
  totalScore: number;
}

export interface Participation {
  id: string;
  boardId: string;
  fighterId: string;
  prevScore: number;
  localScore: number;
  seed: number | null;
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

export interface Bet {
  id: string;
  userId: string;
  matchId: string;
  team: 0 | 1;
  coeff: number;
  points: number;
  createdAt: string;
}

export interface User {
  id: string;
  login: string;
  displayName: string;
  role: UserRole;
  battleNickname: string | null;
  predictions?: number;
}

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

export interface StyleConfig {
  primary: string;
  accent: string;
  grayscale: number;
  participantActive: string;
  participantWin: string;
  participantLoss: string;
}