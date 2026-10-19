export type UserRole = "anonymous" | "user" | "participant" | "admin";

export type MatchStatus =
  | "pending"
  | "betting_open"
  | "tracks_open"
  | "judging"
  | "completed";

export type SeasonType = "official" | "intermediate";

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
  isFire?: boolean;
}

export interface RegistrationConfig {
  enabled: boolean;
  buttonText: string;
  buttonColor: string;
}

export interface Season {
  title: string;
  number: number;
  type: SeasonType;
  status: string;
  slots: number;
  registration?: RegistrationConfig;
}

export interface Track {
  id: string;
  matchId: string;
  fighterId: string;
  url: string;
  isPublished: boolean;
  score: number | null;
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

export interface User {
  id: string;
  login: string;
  displayName: string;
  role: UserRole;
  battleNickname: string | null;
  predictionsPoints?: number;
}

export interface Registration {
  id: string;
  userId: string;
  login: string;
  displayName: string;
  desiredNickname: string;
  status: string;
  createdAt: string;
}

export interface Bet {
  userId: string;
  matchId: string;
  fighterId: string;
  coeff: number;
}