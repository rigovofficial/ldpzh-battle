import type {
  Fighter,
  Match,
  Season,
  Track,
  NewsItem,
  ArchiveConfig,
  User,
} from "./types";

export const mockSeason: Season = {
  title: "ЛДПЖ-Батл",
  number: 2,
  type: "official",
  status: "main",
  slots: 8,
};

export const mockUsers: User[] = [
  { id: "u1",    login: "test",    displayName: "Тестер",      role: "user",        battleNickname: null },
  { id: "u2",    login: "sigma",   displayName: "Сигма",       role: "participant", battleNickname: "Сигма" },
  { id: "u3",    login: "trailer", displayName: "Траллик",     role: "participant", battleNickname: "Траллик" },
  { id: "u4",    login: "nagib",   displayName: "Нагибатор",   role: "participant", battleNickname: "Нагибатор" },
  { id: "u5",    login: "krinzh",  displayName: "КринжМастер", role: "participant", battleNickname: "КринжМастер" },
  { id: "admin", login: "admin",   displayName: "Админ",       role: "admin",       battleNickname: null },
];

export const mockFighters: Fighter[] = [
  { id: "f1", name: "MarkinFan69", userId: null, prevScore: 18, totalScore: 0 },
  { id: "f2", name: "Сигма",       userId: "u2", prevScore: 14, totalScore: 0 },
  { id: "f3", name: "Траллик",     userId: "u3", prevScore: 20, totalScore: 0 },
  { id: "f4", name: "Нагибатор",   userId: "u4", prevScore: 8,  totalScore: 0 },
  { id: "f5", name: "КринжМастер", userId: "u5", prevScore: 12, totalScore: 0 },
  { id: "f6", name: "ВайбКодер",   userId: null, prevScore: 16, totalScore: 0 },
  { id: "f7", name: "Скибиди",     userId: null, prevScore: 10, totalScore: 0 },
  { id: "f8", name: "Лудоман",     userId: null, prevScore: 6,  totalScore: 0 },
];

export const mockMatches: Match[] = [
  { id: "m1", round: 1, index: 1, fighter1: "f1", fighter2: "f2", status: "tracks_open",  odds1: 1.90, odds2: 2.10, score1: null, score2: null, winner: null },
  { id: "m2", round: 1, index: 2, fighter1: "f3", fighter2: "f4", status: "betting_open", odds1: 1.60, odds2: 2.20, score1: null, score2: null, winner: null },
  { id: "m3", round: 1, index: 3, fighter1: "f5", fighter2: "f6", status: "tracks_open",  odds1: 2.00, odds2: 1.80, score1: null, score2: null, winner: null },
  { id: "m4", round: 1, index: 4, fighter1: "f7", fighter2: "f8", status: "pending",      odds1: 1.50, odds2: 1.70, score1: null, score2: null, winner: null },
  { id: "m5", round: 2, index: 1, fighter1: null, fighter2: null, status: "pending", odds1: 1.20, odds2: 1.20, score1: null, score2: null, winner: null },
  { id: "m6", round: 2, index: 2, fighter1: null, fighter2: null, status: "pending", odds1: 1.20, odds2: 1.20, score1: null, score2: null, winner: null },
  { id: "m7", round: 3, index: 1, fighter1: null, fighter2: null, status: "pending", odds1: 1.20, odds2: 1.20, score1: null, score2: null, winner: null },
];

export const mockTracks: Track[] = [
  {
    id: "t1",
    matchId: "m3",
    fighterId: "f5",
    url: "https://soundcloud.com/example/krinzh-master-diss",
    isPublished: true,
    score: null,
  },
  {
    id: "t2",
    matchId: "m3",
    fighterId: "f6",
    url: "https://soundcloud.com/example/vibe-coder-diss",
    isPublished: false,
    score: null,
  },
];

export const mockNews: NewsItem[] = [
  {
    id: "n1",
    title: "НОВЫЙ РОЛИК НА КАНАЛЕ!!!",
    subtitle: "ВСЕ БЕГОМ СМОТРЕТЬ!",
    url: "https://www.youtube.com/@Markin",
    bgColor: "#8b0033",
    borderColor: "#00a3ff",
    textColor: "#ffffff",
    enabled: true,
  },
  {
    id: "n2",
    title: "СТРИМ С СУДЕЙСТВОМ ЗАВЕРШЁН",
    subtitle: "РАЗБОР И ИТОГИ — В TELEGRAM",
    url: "https://t.me/example",
    bgColor: "#1a3a5c",
    borderColor: "#00ff88",
    textColor: "#ffffff",
    enabled: true,
  },
];

export const mockArchive: ArchiveConfig = {
  enabled: true,
  title: "АРХИВ ТРЕКОВ И ИТОГИ ПРОШЛЫХ СЕЗОНОВ",
  subtitle: "ТЫК →",
  url: "https://ldpj-battle.ru",
};

import type { StyleConfig } from "./types";

export const mockStyle: StyleConfig = {
  primary: "#8b0033",
  accent: "#00a3ff",
  grayscale: 0,
  participantActive: "#00a3ff",
  participantWin: "#35d07f",
  participantLoss: "#ff2b2b",
};
