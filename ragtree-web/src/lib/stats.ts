export interface ComputedStats {
  hp: number; sp: number; atk: number; matk: number
  def: number; mdef: number; hit: number; flee: number; crit: number; aspd: number
}

export function computeStats(
  baseLevel: number,
  stats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
): ComputedStats {
  const { str, agi, vit, int: int_, dex, luk } = stats
  return {
    hp: Math.floor((35 + baseLevel * 3) * (1 + vit / 100)),
    sp: Math.floor((10 + baseLevel) * (1 + int_ / 100)),
    atk: str + Math.floor(str / 10) * Math.floor(str / 10),
    matk: Math.floor(int_ * 1.5),
    def: Math.floor(vit / 2),
    mdef: int_ + Math.floor(int_ / 5) * Math.floor(int_ / 5),
    hit: baseLevel + dex + 175,
    flee: baseLevel + agi,
    crit: Math.floor(luk * 0.3) + 1,
    aspd: Math.max(100, 200 - agi * 0.7 - dex * 0.1)
  }
}
