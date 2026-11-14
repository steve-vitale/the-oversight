# sim-reunion-balance — Reunion arena balance (Steve-ordered 2026-11-14)

## The order

2026-11-14 13:32 CST, Steve: the wave-3 Reunion arena monster is horribly
balanced — view the situation holistically and balance the game. No more
questions. The soften-vs-leave call from the mirror-cap panel is superseded.
The standing COMBAT-PLAY GATE (no toughness tuning until villagers play
combat properly) is overridden narrowly for THIS monster by the direct
order; the change is scoped to the arena Reunion only, so the override
stays narrow.

## The fight as measured (before)

Panel 3 (geared, evidence/2026-11-13/sim-mirrorcap-panel3-geared.md): a
GEARED party (scholar machete 35 + wardens_cloak 25, 2 allies
hunting_spear 30 + bark_armor 15, party of 3) won **0/7** Reunion waves.
One Reunion alone (HP [1200,1400], Your Move [60,80] psychic direct,
Family Photo [48,68] burst below half HP, Plus One rally, pierce 0.45,
armor 12, speed 3) outclasses a geared party of three. Deaths are base
Reunion lethality, not mirror count — the mirror cap (1, fires 7/7) is
already the floor.

## The probe — why the party loses

`scripts/reunion-ally-probe-20261114.js` (seed 86009, H=0.5 D=0.6): the
Reunion sits adjacent to the scholar and hits him ~2/3 of rounds (~19 net
on Your Move at D=0.6; the other ~1/3 is a wasted rally turn), the scholar
dies at round 11, while the party needs ~12.6 rounds to burn 656 HP at
~52/round (scholar ~46, the one ally who stays ~4–6 — the Reunion's armor
12 eats most of a spear hit — and the second ally flees at round 2 at full
HP). In winning seeds no ally flees and one ally absorbs enough hits to
end at 0.22–0.24 HP; in losing seeds both allies end at ~1.0 HP,
untouched, while the scholar dies. The party loses by ~1.5 rounds at the
easiest grid point — the fight is a stationary slugfest the scholar loses
alone.

## The sweep (16 points, 97 rows)

`evidence/2026-11-14/perseed-reunion-balance-sweep/`, band 86009–86016.
Seeds 86013/86015 fixture-fail at every point (partyN 2 / 1 — an ally
flees before turn 1; the panel-3 pattern), so valid n = 6 per point.
Single Reunion wave, full-HP entry, strike-only driver, H×D scaling.

| H | D | wins/6 | median rounds | winners' scholar end HP |
|---|---|--------|---------------|-------------------------|
| 0.4 | 0.5 | **5/6** | 11.0 | 0.04–0.57 |
| 0.4 | 0.6 | **3/6** | 10.5 | 0.07–0.55 |
| 0.4 | 0.7 | 2/6 | 10.0 | 0.36–0.53 |
| 0.5 | 0.5 | 2/6 | 12.0 | 0.29–0.41 |
| 0.5 | 0.6 | 2/6 | 11.5 | 0.22–0.38 |
| 0.5 | 0.7 | 2/6 | 11.0 | 0.24–0.36 |
| 0.5 | 0.8 | 2/6 | 10.0 | 0.21–0.22 |
| 0.5 | 1.0 | 2/6 | 9.5 | 0.06–0.16 |
| 0.6 | 0.6 | 2/6 | 11.0 | 0.04–0.06 |
| 0.6 | 0.7 | 1/6 | 10.5 | 0.01 |
| 0.6 | 0.8 | 0/6 | 10.0 | — |
| 0.6 | 1.0 | 0/6 | 9.5 | — |
| 0.7 | 0.6–1.0 | 0/6 | 9.5–10.5 | — |

The frozen grid's easiest point was 2/6 (CORRECTION 1: grid extended by
H=0.4, D=0.5). Pick (CORRECTION 2): **(H=0.4, D=0.5) at 5/6** — the sweep
point in the UPPER half of the panel GO range, because chain attrition
(panel 3: entry HP into wave 3 at 0.80–1.00) pulls the panel down from
full-HP entry. (0.4,0.6) at 3/6 sits at the BOTTOM of the panel GO range
in the sweep, so the panel could only fall below it.

## The change

`src/js/partyTactics.js` + `src/js/game.js` (startCombat), commit
3463bb1b5 (superseded by the re-tune — see below):

- **Arena-only Reunion scaling at spawn:** a per-fight CLONE of the def
  (the shared `monsters.json` entry is never mutated): HP ×0.4
  ([1200,1400] → [480,560]), damage ×0.5 (Your Move [60,80] → [30,40],
  Family Photo [48,68] → [24,34]). Plus One has no damage field, so the
  rally turn is unchanged. Constants `REUNION_ARENA_HP_SCALE` (0.4) /
  `REUNION_ARENA_DMG_SCALE` (0.5) exposed on `G`, same pattern as the cap.
- **Mirror cap stays 1.** No other monster, win price, deed gate, ladder,
  gear, or ability changes. The wild Reunion is untouched (same def; the
  clone is the scope).

Proof: `scripts/test-reunion-arena-balance-20261114.js` **39/39** — arena
fighter HP [480,560] + scaled damage, field fighter full [1200,1400] +
[60,80] with 3 mirrors, chained arena wave-3 scaled and capped, shared
def unmutated after an arena spawn.

## Panel 1 — band 86102–86117, baseline (master f0b64c672) vs armed (H=0.4, D=0.5)

`evidence/2026-11-14/perseed-reunion-balance-panel/`, 16 seeds, 2
fixture-failed in both arms (86114, 86117 — partyN 2 at entry; NOT
replaced, per the prereg allowance). 14 valid chains per arm; the same 8
seeds reached the Reunion wave in both arms (identical waves 1–2 draws).

| arm | reached | won | died | routed | Reunion rounds | dmg dealt (frac of one Reunion HP) |
|-----|---------|-----|------|--------|----------------|------------------------------------|
| armed | 8 | **6** | 4 | 4 | 9–12, mean 10.6 | 0.81–1.09, mean 1.02 |
| baseline | 8 | **0** | 10 | 4 | 3–5, mean 4.0 | 0.11–0.19, mean 0.15 |

Armed wins by seed: 86103 (end HP 0.10), 86105 (0.51), 86107 (0.07),
86108 (0.66), 86110 (0.09), 86116 (0.45). Armed losses in the Reunion
wave: 86102 (11 rounds, scholar died), 86104 (9 rounds, end HP −0.02 —
one hit short). Baseline: all 8 reached waves died in 3–5 rounds.
Paired: 6/8 flipped from death to win. 0 instrument errors.

### Verdict — panel 1

- **M1 (cap fires): PASS** — 1 mirror on all 8 armed reached waves.
- **M2 (3–5 wins, ≥6 reached): NO-GO — TOO EASY.** 6 wins, 8 reached.
  The frozen bar says wins ≥ 6 = too easy, do not land, re-tune down.
  The wins are hard-fought (9–12 rounds, scholar ends 0.07–0.66 HP,
  two wins at 0.07/0.09), but the count is the count and the bar is
  frozen — it is not re-interpreted after seeing the result.
- **M3: incomplete at panel 1** (proofs green: cap 29/29, arena 57/57,
  balance 39/39; check.js --quick + telemetry run on the final tip).

**The (0.4, 0.5) tuning does NOT land.**

## Re-tune (CORRECTION 3)

Per the prereg's "re-tune down" instruction, the scale moves to the next
sweep point: **(H=0.4, D=0.6)** — sweep 3/6 (50%), median 10.5 rounds,
winners' scholar end HP 0.07–0.55. HP scale stays 0.4; damage scale moves
0.5 → 0.6 (Your Move [36,48], Family Photo [29,41]). Predicted panel:
~3–4 wins of 8 reached (the panel ran ~8 points below the sweep at
(0.4,0.5): 83% → 75%; applying the same pull-down to 50% gives ~42%).
Panel 2 runs the SAME band (86102–86117) into
`evidence/2026-11-14/perseed-reunion-balance-panel2/` — identical seeds,
so the only difference from panel 1 is the damage scale. The GO bar is
unchanged. If panel 2 misses, the build stops and reports NO-GO; there
is no second re-tune in this build.

## Panel 2 — (to be filled)
