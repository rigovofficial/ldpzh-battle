import type { Match, Fighter, Participation } from "./types";

export function getFighterName(
  fighterId: string,
  fighters: Fighter[]
): string {
  return fighters.find((f) => f.id === fighterId)?.name ?? "—";
}

export function getTeamLabel(
  match: Match,
  teamIndex: 0 | 1,
  fighters: Fighter[]
): string {
  const team = match.teams[teamIndex];
  if (!team) return "—";
  if (team.name) return team.name;
  if (team.fighterIds.length === 0) return "— TBD —";
  return team.fighterIds.map((id) => getFighterName(id, fighters)).join(" + ");
}

export function matchIsPlayable(match: Match): boolean {
  return match.teams.every((t) => t.fighterIds.length > 0);
}

export function nextPosition(round: number, matches: Match[]): number {
  const inRound = matches.filter((m) => m.round === round);
  return inRound.length + 1;
}

export function getBoardMatches(
  boardId: string,
  matches: Match[]
): Match[] {
  return matches
    .filter((m) => m.boardId === boardId)
    .sort((a, b) =>
      a.round !== b.round ? a.round - b.round : a.position - b.position
    );
}

export function getBoardParticipations(
  boardId: string,
  participations: Participation[]
): Participation[] {
  return participations.filter((p) => p.boardId === boardId);
}