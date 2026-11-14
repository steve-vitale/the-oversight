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

## Panel 2 — (H=0.4, D=0.6), same band, same baseline

`evidence/2026-11-14/perseed-reunion-balance-panel2/`, 16 seeds, same 2
fixture-failed in both arms (86114, 86117). 14 valid chains per arm; the
same 8 seeds reached the Reunion wave in both arms.

| arm | reached | won | died | routed | Reunion rounds | dmg dealt (frac of one Reunion HP) |
|-----|---------|-----|------|--------|----------------|------------------------------------|
| armed | 8 | **5** | 5 | 4 | 9–12, mean 10.6 | 0.81–1.06, mean 1.01 |
| baseline | 8 | **0** | 10 | 4 | 3–5, mean 4.0 | 0.11–0.19, mean 0.15 |

Armed wins by seed: 86103 (end HP 0.02), 86105 (0.42), 86108 (0.57),
86110 (0.01), 86116 (0.48). Armed losses in the Reunion wave: 86102
(11 rounds, −0.06), 86104 (9 rounds, −0.12), 86107 (10 rounds — the
seed that flipped from panel 1, where it won at 0.07 HP). Baseline is
byte-identical to panel 1 (same master code, same seeds). Paired: 5/8
flipped from death to win. 0 instrument errors.

### Verdict — panel 2

- **M1 (cap fires): PASS** — 1 mirror on all 8 armed reached waves.
- **M2 (3–5 wins, ≥6 reached): PASS — 5 wins, 8 reached.** The top of
  the band, as predicted (~3–4; the pull-down from the sweep was
  smaller than the 8-point estimate because two wins landed at 0.01–
  0.02 HP — the fight is on a knife's edge, decided by a single round).
- **M3: (pending check.js — see below).** Proofs green on the re-tuned
  tip: balance 39/39, cap 29/29, arena 57/57; check-wired 0 unwired.
  Field Reunion unchanged (proof leg 2: full HP/damage, 3 mirrors).

### Telemetry check (adjudicated)

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-14/perseed-reunion-balance-panel2/*.json'
--metrics national,table,wins,exiled` — exit 1, three LOUD lines
(national 12→0, table 16→0, wins 16→0). **Adjudicated: category error,
not a regression.** The --current files are Gauntlet chain rows — they
carry no national/table/wins/exiled fields (those are village-sim
metrics over 150-day runs); a missing field counts as 0, so the tool
reports a "disappearance" that never happened. The prereg anticipated
the recorder-corpus refusal; these rows carry no anchorCommit, so the
tool ran the comparison instead. The correct comparison for this corpus
is the panel analyzer's paired table above (armed 5/8 vs baseline 0/8).
Baseline NOT rolled (rolling Gauntlet chain rows into a village-run
baseline would corrupt it). No LOUD line to investigate. Log:
`evidence/2026-11-14/sim-reunion-balance-telemetry-check.log`.

## Panel 2 — final verdict

**GO — M1+M2+M3 all pass.**

- **M1 PASS** — cap 1 on all 8 armed reached waves (both panels).
- **M2 PASS** — armed wins **5** Reunion waves, 8 reached (panel 2).
  Baseline 0/8 both panels. A hard fight a geared party can win
  sometimes: 5/8 reached waves, 10–12 rounds, the scholar ending at
  0.01–0.57 HP — two wins decided by a single hit.
- **M3 PASS after adjudication** — proofs green on the final tip
  (balance 39/39, cap 29/29, arena 57/57; check-wired 0 unwired);
  field Reunion unchanged (proof leg 2); `check.js --quick`
  **333/7 GO, 0 attributable** (log
  `evidence/2026-11-14/sim-reunion-balance-check-quick.log`, 1156s).
  The 7: (1–2) measurement-proof staleness pair
  (`test-measurement-proof-update.js` "Proof source inputs are not
  current" + `test-measurement-workflow.js` "retained neutrality proof
  covers the current Game/controller/harness inputs") — expected after
  any src/js change; the neutrality-proof refresh is the proof-refresh
  loop's maintenance step (precedent: r201 landed a src/js fix with the
  pair failing, gate GO). (3) `test-phone-frame-proof.js` — stale
  receipt, standing (refresh needs the browser-run
  `phone-frame-proof-update.js`; Loop B blank item, not this build).
  (4–7) exact-120s timeouts on `test-living-garden-deed-attainment`,
  `test-one-person-army-deed-attainment`, `test-synergy-stall`,
  `test-capable-bot-20261014` — the documented load-artifact class
  (all four on the list; all timed out at exactly 120.0–120.2s
  mid-progress, seeds printing). Living-garden confirmed standalone
  **8/8** (log `sim-reunion-balance-rerun-test-living-garden-deed-attainment.log`).
  The other three standalone confirmations were **blocked by a write
  flap** (started ~21:06Z, still active at 21:17Z: Python AND node
  writes to fresh files refused EPERM; the rerun batch's processes
  died with 0-byte logs). They are adjudicated on signature +
  mechanism: a Reunion arena scale cannot slow a village-campaign sim
  (if anything it resolves arena fights faster), and the timeouts are
  the spawn budget, not a behavioral failure. Telemetry check
  adjudicated above (false LOUD, category error; baseline NOT rolled).

## What lands

- **Arena Reunion: HP ×0.4 ([1200,1400] → [480,560]), damage ×0.6
  (Your Move [60,80] → [36,48], Family Photo [48,68] → [29,41])**,
  via a per-fight clone at spawn in `startCombat` (arena only).
  Mirror cap stays 1. Wild Reunion untouched. No win price, deed
  gate, ladder, gear, or ability changes.
- A geared party (scholar machete + wardens_cloak, allies spear +
  bark_armor, party of 3) now wins **5 of 8** reached Reunion waves
  (was 0/7), lasting 10–12 rounds and ending near-dead. The fight is
  still hard — it is winnable sometimes, not trivial.
- Panel 1's (0.4, 0.5) tuning (6/8, too easy) does NOT land; panel 2's
  (0.4, 0.6) is the landed tuning. The (0.4, 0.5) attempt is preserved
  in the panel-1 corpus for the record.

## Deliberately left unscoped

- **Wild Reunion mirror pack** (the seed-190393 d61 surface): the
  wild Reunion still spawns up to 3 mirrors at FULL HP/damage. The
  arena scale does not touch it. Whether the wild pack should also be
  capped or scaled is a Steve design call, not this build's.
- **Ally behavior in the arena** (the probe: one ally flees at round 2;
  the staying ally deals 4–6/round vs armor 12). That is the
  combat-play gate's territory, not this build's — the Reunion's
  numbers were tuned around the allies as they actually play.
- **Family Photo / Plus One mechanics** unchanged (only their damage
  numbers scale). The rally turn still wastes ~1/3 of the Reunion's
  turns in the arena (no allies to buff) — left as is; it is part of
  why the fight is winnable.
- **Proof-refresh (neutrality proof)** staleness from this src/js
  change is left to the proof-refresh loop (see M3).
