# sim-spearvolley-b — spears are melee, not ranged (SPEAR-IN-RANGED-SLOT)

- Arm: sim-spearvolley-b (Loop B, BUILD arm, run fleshout-loop-b-20261110T0429Z)
- Branch: sim-spearvolley-b; base anchor `91650a90f` (worktree `~/workspace/worktrees/sim-spearvolley-b`)
- Prereg: evidence/2026-11-10/sim-spearvolley-b-prereg.md (committed `e489c505c`
  BEFORE any judged computation in this run).
- Proof test: scripts/test-spearvolley-b.js (**48/48 on the fixed code**,
  25/48 on the unfixed code — the E1/E2 slot legs fail as designed; the
  test file was REMOVED before closeout, see "What was NOT landed").
- Analyzer: scripts/spearvolley-analyze-20261110.js (wild-leg measures from
  the finishersize-driver per-seed JSONs).
- Verdict: **NO-GO (net-negative wild effect) — the fix is NOT landed.**
  The volley mechanism is fixed (primary GO, 30/30) and the cost bar
  passes, but the fix's collateral damage loss makes the NET wild effect
  negative on both bands, with a measured mechanism. Per the prereg's own
  binding sentence ("if the net is negative the run is a NO-GO"), the
  verdict is NO-GO and the fallback is named below, not built here.

## The fix (built, proven, measured, then REVERTED)

`src/js/equipment.js` only — `isRangedWeapon` trusts the data's
`weapon.type` when present (spears are type `'melee'`, range 2), falling
back to the old range/name rule without a type; `migrateEquipment` uses
the same rule. Effect on current data: exactly the 5 spears/lance flip
from ranged to melee; the other 20 weapons classify identically
(proof-test census leg). No volley formula change, no `wb` fold-in
change, no `mBreak` change, no rounds-cap change, no gate / price / deed
/ readyDemand / win-price change.

The fix was reverted before closeout (`git checkout --` on
`src/js/equipment.js`, the spearxbow fixture/test updates, and deletion
of the proof test): a killed arm leaves no trace (AGENTS.md landing
rule). The measurement — prereg, this file, the analyzer, and the 32
per-seed corpus files — is the deliverable. The E1/E4 probe recipes are
recorded below so the fallback arm can rebuild them in minutes.

## Primary metric (constructed, §14) — GO

Bow+spear fighter (crude bow + 4 arrows + hunting spear + 1 from-start
ally) meets a wave-4 beast at FULL HP through the real `Game.fieldFight`
on seeded streams (30 per beast):

| Beast | Before (unfixed) | After (fixed) | Bar |
|---|---|---|---|
| Herald (700 HP): volley fires | 0/30 | **30/30** | ≥ 27/30 |
| Herald: median volley dmg | — (null) | **14** | > 0 |
| Audit (1200 HP): volley fires | 0/30 | **30/30** | ≥ 27/30 |
| Audit: median volley dmg | — (null) | **26.5** | > 0 |
| Slots: melee spear / ranged bow | 0/30 | 30/30 | — |

GO on the primary as written. The before leg is the same proof test run
against the unfixed code via `git stash` (25/48 — every E1/E2 slot leg
fails, E3 bow-only passes both ways, as it should). Spear-only control:
volley null 30/30, melee spear 30/30, contact strike [19,23] (wb 15)
when attempted (30/30 attempted). Bow-only control: volley 30/30,
median 30.5 — the fix touches nothing about the shape the wild already
produces.

## The trade-off, measured (E4 — why the verdict is NO-GO)

Machete + hunting spear, NO bow, vs full-HP wave-4 beasts, 30 streams
each (measurement only, no threshold — the number the wild leg needs):

| Beast | Before median total dmg | After median total dmg | Rounds | Kills |
|---|---|---|---|---|
| Herald (700) | 232.5 | **142.5 (−39%)** | 3 → 3 | 0/30 both |
| Audit (1200) | 157.5 | **97.5 (−38%)** | 2.5 → 2.5 | 0/30 both |

The machete+spear fighter — the common top loadout — loses ~38% of its
damage output. Mechanism: before, the spear contributed half its bonus
through the ranged slot, `wb = (35+30)/2 = 33`; after, the machete wins
the melee slot, the spear is unequipped, `wb = (35+0)/2 = 18`. The
fights last the same number of rounds; the fighter just deals much less
in each of them. The bow+spear shape goes the other way (wb 15 → 26
plus the volley), but it is the rarer shape — the wild bands below show
the common shape's loss dominating the net.

## Wild legs (guard + wall numbers, 8 seeds before/after × 2 bands)

Band 1 (pilot): 99641–99648, the grind band. Band 2 (confirm):
99661–99668, the FS pilot band — run because the pilot showed
volley-rate and field-kill movement, per the prereg's confirm condition.
Competent policy verbatim, 150d death-aware, finishersize driver.
Before-legs ran on the unfixed code (fix stashed); after-legs on the
fixed code. **The pilot before-leg reproduces vetfinish-b's before-leg
EXACTLY** (per-seed days, w4field, kills, scholar deaths all identical)
— the determinism anchor holds, so the after-leg divergence is the fix
biting, not harness drift.

### Pilot band 99641–99648

| Measure | Before | After |
|---|---|---|
| Wave-4+ field fights | 168 | 115 |
| Volley-carrying rows (wave-4+) | 34 | 6 |
| Volley rate (wave-4+) | 20.2% | 5.2% |
| Field wave-4 kills | 9 | 7 |
| Wave-4 kills, all channels | 27 | 23 |
| Wave-5 kills | 0 | **2** |
| Below-break meetings / kills | 11 / 8 | 5 / 5 |
| Field-fighter deaths (vDie) | 15 | 8 |
| Scholar deaths | 86 | 76 |
| Starvation deaths (total / scholar) | 5 / 0 | 2 / 0 |
| Peak living veterans (sum over seeds) | 13 | 9 |
| End living veterans (sum) | 2 | 4 |
| Wave-4 unlock / wave-5 unlock | 8/8 / 4/8 | 8/8 / 3/8 |
| Median survival | 116.5d | 133.5d |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |

### Confirm band 99661–99668

| Measure | Before | After |
|---|---|---|
| Wave-4+ field fights | 101 | 96 |
| Volley-carrying rows (wave-4+) | 8 | 4 |
| Volley rate (wave-4+) | 7.9% | 4.2% |
| Field wave-4 kills | 4 | 1 |
| Wave-4 kills, all channels | 19 | 11 |
| Wave-5 kills | 0 | 0 |
| Below-break meetings / kills | 4 / 3 | 2 / 1 |
| Field-fighter deaths (vDie) | 10 | 10 |
| Scholar deaths | 88 | 84 |
| Starvation deaths (total / scholar) | 2 / 0 | 2 / 1 |
| Peak living veterans (sum over seeds) | 9 | 9 |
| End living veterans (sum) | 3 | 3 |
| Wave-4 unlock / wave-5 unlock | 8/8 / 2/8 | 8/8 / 0/8 |
| Median survival | 112.5d | 98.5d |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |

### Pooled (16 seeds)

Wave-4 kills 46 → 34 (−26%); field wave-4 kills 13 → 8 (−38%);
volley rows (wave-4+) 42 → 10; below-break meetings 15 → 7, kills
11 → 6; scholar deaths 174 → 160; starvation 7 → 4; field-fighter
deaths 25 → 18; wave-5 kills 0 → 2; wave-5 unlocks 6 → 3; wins /
national / table 0 throughout.

### Cost bar (binds the GO — PASSES on both bands)

Starvation after ≤ before + 2: pilot 2 ≤ 7 ✓, confirm 2 ≤ 4 ✓
(scholar-only: 0 ≤ 2 ✓, 1 ≤ 2 ✓). Median survival after ≥ 0.8 ×
before: pilot 133.5 ≥ 93.2 ✓, confirm 98.5 ≥ 90.0 ✓. No cost-bar
breach — the NO-GO is the net-effect clause, not the cost bar.

### The volley-rate drop, investigated (not waved through)

The wave-4+ volley rate fell on both bands (pilot 20.2% → 5.2%,
confirm 7.9% → 4.2%) even though the mechanism provably adds volleys
to bow+spear fighters. Three checks:

1. **All-waves volley rate is near-flat**: pilot 17.0% → 16.0%
   (205/1209 → 182/1134 rows); confirm 13.6% → 11.3% (156/1143 →
   125/1104). Pooled 15.3% → 13.7%. The bow's volley is alive across
   the campaign; the drop concentrates in the wave-4+ slice.
2. **Bow-held rate (volley + "no arrows" rows) is flat at waves 1–3**
   (pilot: 21.5% → 23.1%, 21.0% → 22.0%, 30.5% → 29.3%) and falls
   only at waves 4–5 (39.5% → 21.1%, 53.1% → 24.0%). The wave-4/5
   fighter population is different people with different gear after
   the fix — chaotic divergence, not a bow-seeking change: per-fighter,
   the fix can only INCREASE bow equipping (a bow+spear fighter goes
   from bow unequipped to bow equipped), and no gear-acquisition
   channel in the code predicts fewer bows (the spear's gearFit
   multiplier falls from the ranged 1.25× to the fight 1.15×, and a
   spear no longer counts as "ranged covered" when a villager judges
   whether they need a bow — both push toward MORE bows, not fewer).
3. **The pilot's 34 volley rows came from 3 villages** (99643: 15,
   99644: 9, 99645: 9) whose trajectories diverged completely after
   the fix (99643: 61 → 17 field fights, days 147 → 101; 99644:
   26 → 18; 99645: volley 9 → 1). The wave-4 slice is a 3-seed
   concentration artifact. The kill drop, by contrast, is consistent
   across BOTH bands and has the E4 mechanism behind it — that is the
   finding the verdict rests on, not the volley rate.

## Sense-test read

**99642 d124, Tugce vs The Algorithm (925/1000, after-leg).** "Tugce
sees The Algorithm coming and nocks an arrow — the fight opens at
range (3 shots)." Two misses honestly spent ("the arrow buries itself
in the dirt. (spent)"), one hit for 20, "lowers the bow — it is on
them now. (1/3 hit)". Rounds against named parts (Recommended For You,
Engagement), a shout for help, Abigail charges in, and a sensible flee
at 8 HP: "Tugce sees how this ends — and runs while running still
works." A real fight, honestly narrated. The restored volley reads as
the bow's identity, not a system trick.

**99641 d22, George vs The Ugly Beast (13/105, after-leg).** "George
drove at The Ugly Beast with the hunting spear — it staggers, holds
its ground, and keeps coming. (Committed)" — then R1: George strikes
for 19 and the lead falls. The spear is NAMED as the melee instrument
and the strike lands exactly on the wb-15 contact floor (19). The fix
working in the wild, in one line.

**The band's first wave-5 kills (after-leg).** 99645 d137: Sigrun
Eiriksdottir kills the finale_crew in the wild. 99648 d104: Nadia
Khoury kills the spoiler as the player. Two wave-5 kills where the
before-legs had none on either band — but the confirm band's wave-5
unlocks went 2 → 0, so this is divergence, not a lever effect; not
claimed as one.

## Village assessment (plain words)

Sixteen villages, same seeds, one slot rule changed. The villages
themselves are unrecognizable after the fix — seed 99641 went from a
103-day loss with 13 scholar deaths to a 150-day survival with none;
seed 99648 went from dying on day 68 to surviving the full 150 with
six wave-4 kills. Villages lived about as long overall and lost fewer
scholars, but they killed fewer of the big beasts: 46 wave-4 kills
became 34, and the field kills fell from 13 to 8. The bow's opening
shot came back for the fighters who carry a bow and a spear — the
proof fights show it firing every single time — but out in the
villages, the fighters who carry a machete and a spear lost more than
the bow-fighters gained, because the spear used to quietly add half
its strength to every close-in blow and now it sits in the pack as a
spare. Nobody reached national rank, nobody sat at the table, nobody
won — same as before, on both bands. The chain still binds at wave-4
kills and the climb past regional.

## Wall numbers (national / table / wins, wave 4–5, median survival)

Pooled 16 seeds, before → after: won 0 → 0, national 0 → 0, table
sittings 0 → 0, wave-4 unlock 16/16 → 16/16, wave-5 unlock 6/16 →
3/16, wave-4 kills 46 → 34, wave-5 kills 0 → 2, field wave-4 kills
13 → 8, scholar deaths 174 → 160, median survival ~114.5d → ~116d
(pilot 116.5 → 133.5, confirm 112.5 → 98.5). No win movement either
way; the kill movement is the investigation item, and it is
investigated above (E4 + two-band consistency).

## Metric review (§14a, to carry to the next run)

- The pre-registered primary (constructed volley restoration) PASSED
  decisively (30/30 both beasts, median volley dmg 14 / 26.5). The
  cost bar PASSED on both bands. The verdict is NO-GO anyway, under
  the prereg's own net-effect sentence ("if the net is negative the
  run is a NO-GO"): the net on the chain's kill link is negative on
  both bands (wave-4 kills −15% pilot, −42% confirm; −26% pooled)
  with a proven mechanism (E4: −38% damage on machete+spear). This
  run is NOT re-scored as GO on the primary alone — the primary
  measures the mechanism, the net measures the fix, and the fix as
  specified is not landable.
- The prereg's "confirm only on wild movement" condition was met
  (field-kill movement 9 → 7 pilot); the confirm band ran and
  replicated the direction (kills down, volley rows down), which is
  what turns a one-band suspicion into a verdict.
- **Fallback for the next run (named, not built): the
  melee-first/ranged-fallback slot rule.** A spear takes the MELEE
  slot when the fighter carries a real ranged weapon (bow/sling/
  crossbow — volley restored, wb 26 for bow+spear), and the RANGED
  slot otherwise (the old fold-in preserved: machete+spear-no-bow
  keeps wb 33, spear-only keeps wb 15 and the contact finish's
  kind-'spear' path). It dominates the reverted fix on the trade-off:
  the −38% damage loss is confined to the machete+spear+bow shape
  (wb 33 → 27, but gaining the volley), instead of hitting every
  machete+spear fighter. It needs its own prereg; the E1/E4 probe
  recipes in this file are the instrument (bow+spear herald-700 /
  audit-1200, 30 streams; machete+spear no-bow, same beasts).
- Metric note for the fallback arm: judge it on the SAME constructed
  primary (volley fires ≥ 27/30) PLUS a net wild-kill guard (wave-4
  kills, all channels, on the 99641–99648 band, must not fall below
  the before-leg count) — the guard this run lacked as a binding
  number. The wild volley rate is NOT the judge: it is composition-
  dominated at 8 seeds (see the investigation above); the all-waves
  rate is the powered comparison.

## Findings for the backlog

- SPEAR-IN-RANGED-SLOT (open, 2026-11-09 — STAYS OPEN): the mechanism
  is fixed by construction (volley 30/30, this file) but the fix as
  specified is net-negative in the wild and was reverted; the finding
  now carries the fallback (melee-first/ranged-fallback) and the E4
  number (−38% damage on machete+spear). Do not re-assign the
  one-line "spears are melee" fix; the next arm is the fallback with
  its own prereg.
- SPEARXBOW-CORPUS-STALE (open, 2026-11-10 — surfaced by this arm):
  scripts/test-spearxbow-20261031.js re-runs 25/27 on current master;
  the determinism gate fails because the corpus is anchored on the
  2026-10-31 src commit (7d5281064a) and master has moved 10 days
  (anchor now facc9d60c; 1598 field-differences across the 176
  fights, vTaken/vHpLeft differing on all 176 — roster/world drift,
  not this arm: this arm changed zero src lines in the final tree).
  Verdict fields still recompute SPEAR:GO XBOW:GO and the pilot gate
  still passes. The corpus needs re-anchoring + regeneration under
  current master, or the test needs its anchor rule revisited. Not
  this arm's to fix (zero src/js changes in the final tree).
- (Not re-filed: the repeated committedHold narration line and the
  1-HP wall floor's invisibility — vetfinish-b holds them.)

## What was NOT touched / NOT landed (guardrails)

- Zero src/js changes in the final tree (the equipment.js fix was
  built, proven 48/48, measured on 32 seed-legs, and REVERTED — see
  above). `git status` shows only the prereg commit + the measurement
  artifacts committed with this file.
- No rounds-cap change, no armor-ignoring hits, no Eulogy change, no
  mBreak change, no volley formula change, no wb fold-in change, no
  gate / price / deed / readyDemand / win-price change.
- The spearxbow fixture/test updates written mid-run (S1/M3 →
  ranged==crude_bow, S2 → volley-fired) were REVERTED with the fix —
  they assert the new behavior and belong with a landing fix, not
  with a killed arm. The 2026-10-31 corpus was NOT regenerated.
- No [needs-eyes] (nothing player-facing ships; the fix is reverted).

## Commits (this branch)

- `e489c505c` — prereg (committed BEFORE any judged computation;
  safe-commit index clobber hit, repaired from HEAD with
  `git ls-tree HEAD -r | git update-index --add --index-info`,
  status + diff clean)
- (measurement commit next: this file + analyzer + 32 per-seed files)

## Corpus

- evidence/2026-11-10/perseed-spearvolley-b/fs-s9964{1..8}-spearvolley-before.json (8 files)
- evidence/2026-11-10/perseed-spearvolley-b/fs-s9964{1..8}-spearvolley-after.json (8 files)
- evidence/2026-11-10/perseed-spearvolley-confirm/fs-s9966{1..8}-spearvolley-confirm-before.json (8 files)
- evidence/2026-11-10/perseed-spearvolley-confirm/fs-s9966{1..8}-spearvolley-confirm-after.json (8 files)
- Tooling: scripts/spearvolley-analyze-20261110.js (wild-leg analyzer);
  the proof test (scripts/test-spearvolley-b.js, 48/48 fixed / 25/48
  unfixed) and the spearxbow updates were removed with the reverted
  fix — recipes for both are recorded in this file.
- Reused, unchanged: scripts/finishersize-driver-20261106.js,
  scripts/finishersize-analyze-20261106.js.

## Convergence state

- Finding SPEAR-IN-RANGED-SLOT: mechanism proven fixed by
  construction (volley 30/30, median dmg 14 / 26.5), fix judged
  NO-GO on net wild effect (wave-4 kills −26% pooled, E4 −38%
  damage) and reverted. Status: open, with a named fallback
  (melee-first/ranged-fallback) for the next arm. Not killed as a
  concept — the volley restoration is real and wanted; this SHAPE
  of the fix is what failed.
- Balance panel (§15): not run. The panel runs its own full panel and
  takes no corpus input (same precedent as grind-a, finishersize-a,
  adopt-a, vetfinish-b); the pre-registered comparison is the
  identical-seed corpora + the constructed volley rate. No compare
  .md fabricated.
- Telemetry: `scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-10/perseed-spearvolley-b/*.json' --metrics
  national,table,wins,exiled` REFUSED — "refusing recorder-corpus
  input: all 16 --current rows carry top-level anchorCommit". Recorded
  as the result, same as grind-a / finishersize-a / adopt-a /
  vetfinish-b. The baseline was NOT reseeded.

## Check status

- Proof tests on the fixed code (before revert): spearvolley 48/48,
  spearxbow updated version NOT run to green (its corpus was never
  regenerated — the fix was reverted first; the reverted tree runs
  the ORIGINAL test-spearxbow at 25/27, the 2 failures being the
  pre-existing stale-anchor det-gate, see the finding above).
- `node scripts/check.js --quick`: 296 passed, 4 failed in ~765–780s,
  IDENTICAL failures on two runs (deterministic, not flaky):
  scripts/godpath/test-mobile-combat-cadence.js,
  scripts/godpath/test-occupation-panels.js,
  scripts/godpath/test-phone-frame-proof.js,
  scripts/test-establishment-r20-fixes-20261020.js. All four are
  pre-existing on the base — today's memory log already records the
  first three as failing on the base (phone-frame receipt stale vs
  ~90 source files) and the fourth as the establishment-r20 racks
  voice failure — and this arm's final tree carries ZERO src/js
  changes, so none of them can be attributed to it. The green list
  is otherwise green on the reverted tree.
