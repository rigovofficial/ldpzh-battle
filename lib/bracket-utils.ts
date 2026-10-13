import type { Match, Fighter } from "./types";

/**
 * Пересобирает сетку под N участников (4, 8, 16, 32).
 * Возвращает новый массив матчей.
 *
 * - Раунды = log2(N)
 * - Раунд 1: N/2 матчей
 * - Каждый следующий: делим пополам
 * - Первый раунд заполняется бойцами по порядку
 * - Остальные — пустые (продвигаются через «Завершить и дальше»)
 */
export function regenerateBracket(
  fighterIds: string[],
  fighters: Fighter[]
): Match[] {
  const N = fighterIds.length;

  if (![4, 8, 16, 32].includes(N)) {
    throw new Error("Количество участников должно быть 4, 8, 16 или 32");
  }

  const rounds = Math.round(Math.log2(N));
  const matches: Match[] = [];

  for (let r = 1; r <= rounds; r++) {
    const count = N / Math.pow(2, r);
    for (let i = 1; i <= count; i++) {
      matches.push({
        id: `m_${r}_${i}`,
        round: r,
        index: i,
        fighter1: null,
        fighter2: null,
        status: "pending",
        odds1: 1.2,
        odds2: 1.2,
        score1: null,
        score2: null,
        winner: null,
      });
    }
  }

  // Заполняем первый раунд
  const round1 = matches.filter((m) => m.round === 1);
  fighterIds.forEach((fid, idx) => {
    const slot = idx % 2 === 0 ? "fighter1" : "fighter2";
    const m = round1[Math.floor(idx / 2)];
    m[slot] = fid;
  });

  // Считаем стартовые кэфы по формуле: 1.2 + prevScore оппонента / 20
  for (const m of matches) {
    if (m.fighter1 && m.fighter2) {
      const a = fighters.find((f) => f.id === m.fighter1);
      const b = fighters.find((f) => f.id === m.fighter2);
      if (a && b) {
        m.odds1 = +(1.2 + b.prevScore / 20).toFixed(2);
        m.odds2 = +(1.2 + a.prevScore / 20).toFixed(2);
      }
    }
  }

  return matches;
}

/**
 * Обрезает / добивает список бойцов до N.
 * Для добора создаёт «пустых» бойцов с именем «Свободный слот N».
 */
export function resizeFighterPool(
  current: Fighter[],
  N: number
): Fighter[] {
  const result = [...current];

  // Обрезаем
  if (result.length > N) {
    return result.slice(0, N);
  }

  // Добиваем
  while (result.length < N) {
    const idx = result.length + 1;
    result.push({
      id: "f_" + Date.now() + "_" + idx,
      name: `Свободный слот ${idx}`,
      userId: null,
      prevScore: 0,
      totalScore: 0,
    });
  }

  return result;
}