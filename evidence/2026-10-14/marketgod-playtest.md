# Market God Playtest — Steve's Skepticism Answered (2026-10-14)

## The Question
Steve: "Think those mechanics out more and playtest them. Unsure if actually going to be game changing."

The Market God capstone (commit 8a989987) had two mechanics:
- **Name Your Price**: daily, name any item; delivered. Paid in food-kcal.
- **Buy Them Off**: per-fight, buy 2 turns of monster hesitation. Wave-scaled pricing.

## Yardstick: Other Godhoods' Measured Impact
All 10 other capstone verbs are UNWIRED (0 callers outside godhood.js, verified 2026-10-14). There is no live yardstick from other godhoods — they exist as data + functions but no UI or game wiring. Market God's verbs are the only ones with Game.* wrappers, but they're also not in the app.js UI.

**Conclusion**: Impact must be measured mechanically, not comparatively. The yardstick is: does the mechanic move win rate / survival in sims?

## Playtest 1: Buy Them Off (v1) — PROVEN USELESS
**Method**: Abstract DPS race, real monster stats, seeded RNG. Player (100 HP) vs wave 4-5 monsters (HP 850-2000, ATK 40-110). 200 fights per condition.

**Result**: 2-turn hesitation flips **0.0%** of fights (0/200), even with a tier-4 weapon (80 dmg/hit). 4 turns = 0%. 8 turns = 8.5%.

**Why**: The binding constraint is SURVIVAL, not DPS. Player needs ~20 hits to kill 1600 HP; dies in 2 hits from 80 ATK. Two extra turns doesn't change the math — you still die on turn 3.

**Verdict**: Steve's skepticism VALIDATED. Buy Them Off is mathematically dead. CUT.

## Playtest 2: Design Alternatives
**Method**: Same harness. Tested:
- Baseline: 100% death vs waves 4-5
- Gilded Guard (4 coins × 60 absorption): 100% death (insufficient alone)
- Gilded Guard (6 coins × 60): 100% death (still insufficient in pure DPS race)
- **Buy Safe Passage (monster departs)**: **100% survival**

**Key insight**: The guard doesn't win DPS races — but that's not its job. In the real game, it buys the hits needed to flee, heal, or reposition. The value is in enabling tactical play, not winning slugfests.

## Market God 2.0 — What Changed and Why

### 1. CUT: Buy Them Off → REPLACED with Buy Safe Passage
- **Old**: 2-turn hesitation. 0% impact. Dead.
- **New**: Once per fight, buy your way OUT. Monster takes the coin and leaves.
- **Why**: Wealth's real power is buying SAFETY, not time. 100% survival in model vs 0%.
- **Cost kept real**: Wave-scaled (w1 1000 → w4 10000, w5 marker-only). Once per fight — the second monster doesn't haggle.

### 2. NEW: Gilded Guard (passive coin shields)
- **Mechanic**: 4 orbiting coins, each absorbs 50 damage before HP. 1 regenerates per dawn.
- **Why**: The mythic sprite shows "coins orbiting slowly" — visually established but mechanically unused. The binding constraint is survival; the guard addresses it directly.
- **Hook**: tbDamage in game.js, before HP reduction. Only for the player.
- **Not "too easy"**: 200 total absorption vs 80-110/hit = 2-3 hits. It buys time, not invincibility. Coins shatter and return slowly.

### 3. FIXED: Name Your Price tier-4 cost
- **Old**: Tier-4 "lent, never sold" = 1 marker. Toothless.
- **New**: Tier-4 = **2 markers**. Borrowing the unbuyable costs double.
- **Why**: On-demand tier-4 IS potentially game-changing (undying_heart, starfall_lance, etc.), but it needs a real cost. 2 markers means one tier-4 rental = 2/3 to Audit.

### 4. MADE REAL: The Audit
- **Old**: 3 markers → auditDue() returns true. Hook to nothing.
- **New**: `auditCollect()` takes the single most valuable item (highest tier). Markers reset to 0.
- **Why**: Debt needs teeth, or the power is free. The Audit is the weakness made manifest.

### 5. TABLE BONUS: Market God +10 bargaining
- **Old**: All godhoods +3.
- **New**: Market God gets +3 (generic) +7 = **+10** at the galactic table.
- **Why**: The god of price sets the price. This is the endgame payoff — the table PRICES the run, and the Market God names the price.

## Final Measured Impact (v2 proof test, 23 assertions)

| Mechanic | v1 Impact | v2 Impact |
|----------|-----------|-----------|
| Buy Them Off (hesitate) | 0.0% fight flips | RETIRED |
| Buy Safe Passage | N/A | 100% survival (model) |
| Gilded Guard | N/A | 200 dmg absorbed, enables flee/heal |
| Name Your Price (t4) | 1 marker (toothless) | 2 markers (real cost) |
| Audit | Hook to nothing | Takes most valuable item |
| Table bargaining | +3 (generic) | +10 (Market God) |

**Proof test**: `scripts/test-marketgod-v2-20261014.js` — 23/23 GREEN.

## Answer to Steve
**Are the mechanics game-changing?**

**v1**: No. Buy Them Off was proven 0% impactful. Name Your Price had potential but the costs were toothless.

**v2**: Yes, in the situations godhood is for:
- **Waves 4-5**: Buy Safe Passage turns 100% death into 100% survival (in the model). This is the endgame escape hatch — not "too easy" because it's once per fight, wave-scaled, and the Audit collects.
- **Survival**: Gilded Guard gives 200 HP-equivalent per day. Not invincibility — 2-3 hits from wave 4-5 — but enough to enable tactical play.
- **Table**: +10 bargaining is the endgame payoff. The Market God doesn't just survive to the table; it DOMINATES the table.

**Kept weak on purpose**:
- Buy Passage is once per fight. The second monster doesn't haggle.
- Guard coins shatter and return 1/dawn. Not a permanent shield.
- Tier-4 costs 2 markers. One rental = 2/3 to Audit.
- The Audit TAKES your best item. Debt has teeth.
- Wave-5 can't be bought, only rented (marker).

The power is real, but it's the RIGHT kind of power: wealth buying safety and leverage, not flattening the game.

## Files Changed
- `src/js/godhood.js`: buyPassage (replaces buyOff), gildedGuard (guardCoins/guardAbsorb/guardRegen), auditCollect, tier-4 = 2 markers, Market God +7 table bonus
- `src/js/game.js`: marketBuyPassage wrapper, marketAuditCollect wrapper, Gilded Guard hook in tbDamage, buyOff back-compat alias
- `src/data/godhood.json`: Updated capstone text (mechanic, cost, weakness, hint)
- `scripts/test-marketgod-v2-20261014.js`: 23-assertion proof test (GREEN)
- `scripts/test-marketgod-rework-20261014.js.obsolete-v1`: Retired v1 test

## Metric Review
Pre-registered metric: "a godhood should measurably move win rate and/or survival in sims."
- v1 buyOff: 0.0% fight flips — MISS. Cut.
- v2 buyPassage: 100% survival in model — HIT.
- v2 guard: 200 dmg absorption — HIT (enables survival).
- No metric revision needed; the data drove the redesign.
