# sim-w5reach3 — the tableActive gate refinement on the PRE-SEAT stack (flesh-out loop, 2026-10-15, ARM 3)

Worktree: `~/workspace/worktrees/sim-w5reach3`. POLICY-SIDE refinement — ZERO src/js changes; the wave5reach layer is LANDED (58131bb1) and this run refines its table gate in place (coordinator arm sim-w5reach3, claim fleshout-20261016T001400Z.json). Branch: sim-w5reach3, based on current master.

Axis: scale-onramp (standing scale directive). The tracker's named next from w5reach2: "engine-honest tableActive gate" (finding #369).

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law), docs/TABLE.md (sanctity). Canon facts the refinement is built on:
- Wave-5 gate (standing.js): villageStandingTotal() >= t5(200) AND waveUnlockReady(5).ready = waveEngaged(4) >= 2 distinct wave-4 types faced blow-by-blow (FLEEING COUNTS — "you stood on the grid"); bread counts at most 100 toward t5; the rungs sit on top of the wave-3 rung.
- Sanctity of the table (TABLE.md, Steve 2026-10-12): "when the table sits, the world holds its breath" — ambient monster pressure suspends; all stakes come from the table itself. The engine's own predicate is Game.tableActive() (table.js:359: "sanctity is preserved", derived from run state, active from tableScene until any resolve sets phase 'done'; the win-deferral window counts as sitting).
- If the table's sanctity means the world holds its breath, a PENDING invitation shouldn't hold it — only the sitting should. That is the whole refinement.

## The refinement (the only change)

scripts/policies/wave5reach.js — `tableBusy(Game)`:

BEFORE (landed): `return !!(pg.tableDone || pg.tableWaiting)` — a pending invitation stands the hunt down.

AFTER: `return !!(Game.tableActive && Game.tableActive())` — the engine's own sanctity predicate.

Everything else untouched: the 35% mid-fight retreat discipline, the `_w5Commit`/`_huntCommit` fight-commit logic, hunt cadence (every 3rd day, hp>=60%, kcal>=200), node selection, the 12-step engage bound. The win-deferral window keeps its sanctity (tableActive() treats winDeferred as sitting — the hunt stands down there exactly as before). The same `Game.tableActive && Game.tableActive()` guard pattern is already used in game.js (two call sites) and gorgedrive.js — this is convention, not invention.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep)

**Question:** does replacing the landed layer's tableWaiting-stranding heuristic with the engine-honest `Game.tableActive()` gate let the wave-4 counter-learning hunts convert their recovered opportunity into EARLIER wave-5 unlocks on the pre-seat stack?

**The lever:** scripts/policies/wave5reach.js — env-gated WAVE5REACH=1, default OFF. Wraps SD.leadseat / SD.belongseat (same ids leadfeast-windefer/belongfeast-windefer). After wave-4 unlock and before wave-5 unlock (and never while the table sequence is actually playing):
1. Counter-learning expeditions (hunt legs): every 3rd day, healthy (hp>=60%) and fed (kcal>=200), travel to thicket/ruin/forest/grove nodes, engage visible wave-3/4+ monsters (facing fills waveEngaged — fleeing counts), come home. The courtship/win verbs run FIRST and fully — the hunt is additive, never preempting.
2. Fight commitment: wave-3 in fight → ctx._huntCommit (courtkill's proven mechanism, holds to 12%); wave-4+ in fight + scholar >=50% HP → ctx._w5Commit, honored by the extended legacy flee block in scripts/policies/competent.js (start-of-fight walk-away overridden ONLY; the mid-fight 35% eject is UNCHANGED).
3. No free knowledge, no combat cheats, no deed-bar reimplementation: reads Game state, issues player verbs — never writes engine state.

**Arms:** control = pre-seat stack (FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE NEVER set — the seat layer gate-offs to pure delegation) with WAVE5REACH unset; armed = the same + WAVE5REACH=1. Identical seeds both sides, 180d death-aware (dead villages stop simulating, +10d tail max), own control in the same sweep.

Seeds: 8 FRESH [163,274,385,496,607,718,829,940] (verified: zero prior per-seed files in evidence/ as seed values) x {leadfeast, belongfeast} x {control, armed} = 32 runs.

**Horizon + why:** 180d death-aware. Wave-5 unlocks land d69–d120 on measured pre-seat sets; the pre-seat stack's runs live long (w5reach2: median ~135d), so the full horizon is the honest surface.

**Proof:** scripts/test-w5reach3-20261015.js — RED→GREEN on the new base: (a) C1 pins the FIXED behavior (huntLive TRUE in the stranding state: wave-4, tableWaiting pending, table NOT active) — FAILED on landed code (RED), passes after (GREEN); (b) C2/C3 pin unchanged behavior (sitting still stands down; win-deferral sanctity preserved); (c) C8a/b pin the fight-side flags honoring the refined gate; (d) det-gate: gate-off trajectory byte-identical to plain seatdrive composition (2/2 seeds, 60d); (e) gate-on determinism: identical armed 60d runs byte-identical; (f) SMOKE both sides. 22/22 GREEN post-refinement.

**PRIMARY (binding):** mean per-seed paired wave-5 unlock-day delta (armed − control) ≤ −4d, computed over pairs where BOTH sides unlocked. One-sided pairs are reported separately and do not enter the mean (a paired delta needs a pair). Wave-5 unlock days via DAILY unlockedWave() sampling (finding #360 — no engine event fires on wave unlock).

**GUARDRAILS (binding):** armed unlock count ≥ control (no regression); national ≥ control − 2; wins 0/16 expected — ANY armed win is reported LOUD; median survival ≥ control − 10d; no new death mode at n>=3.

**EXERCISE GATE (binding):** count live-gate days and hunt engagements on identical seeds — if <3 engagements, this is no-contact, not a null.

**Secondaries:** full wall numbers both sides (national/table/wins/wave-4/5 unlocks/median survival/exiled); recovered-days counter (days the old heuristic would have stranded but the refined gate keeps live — finding #369 quantified); sanctity-days (refined-gate stand-downs via tableActive — expected ~0 on the pre-seat stack); per-seed JSONs in evidence/2026-10-15/perseed-w5reach3/ with EXACT numeric keys national, table, wins, exiled, wave5, wave5Day; beat captures in evidence/2026-10-15/w5reach3-beats/.

**SENSE-TESTING LAW:** read transcripts from runs where the hunt fired repeatedly across the wave-4 window — with the gate opened, hunts fire every 3rd day for weeks instead of ~1/run. Does the scholar's repeated counter-learning read as sensible villager behavior (a scholar deliberately working a problem) or robotic farming? Judge meaning, coherence, consequences.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **PRIMARY is NO-GO (binding).** Mean per-seed paired wave-5
   unlock-day delta (armed − control) = **+3.5d** over n=4
   both-unlocked pairs (s163 lead +3, s496 lead +6, s829 lead −5, s940
   lead +10). The bar was ≤ −4d. This is a clean miss on a contacted
   surface (27 engagements ≥ 3 — the exercise gate is met; this is a
   genuine negative, not a no-contact). Per §14 this is NO-GO, never
   re-scored mid-run.
2. **The metric's paired surface was road-blind — and the road split is
   the finding.** The only both-unlocked pairs were lead-road, because
   belong-road controls unlocked 0/8. The road split:
   - belong road: control 0/8 unlocks → armed 4/8 (+4), national 5/8 =
     5/8, median survival 116.5d → 117.5d (+1d), 18 engagements.
   - lead road: control 8/8 unlocks → armed 5/8 (−3), national 7/8 =
     7/8, median survival 118.0d → 106.5d (−11.5d), 9 engagements.
   The arm HELPS where the base can't reach the gate alone and HURTS
   where the base already unlocks. The next run's header should carry a
   road-aware primary (e.g., unlocks on the low-unlock road, or paired
   deltas within road). This revision applies to the NEXT run, not this
   one.
3. **Instrumentation edge (daily sampler misses final-day unlocks).**
   s274 lead-armed: the beats show the wave-5 greenlight on d103
   ("the Producers have greenlit the fifth draft"), the harness's own
   maxWaveUnlocked = 5, the per-seed JSON records wave5 = 1 — but
   wave5Day = null because the village was lost before the next daily
   sample. Beats-corrected, the s274 pair is +7 (d103 vs d96) and the
   mean becomes +4.2d (n=5) — still NO-GO either way. Future sweeps
   using daily unlockedWave() sampling should cross-check beats or
   sample once on run end. Filed to sim-findings as an instrument gap.
4. **The refinement's mechanism worked exactly as designed.** 397
   recovered days (the old heuristic's stranding, now live), 0
   sanctity days (tableActive() never fired on the pre-seat stack —
   0 sittings, as expected), 139 hunts, 27 engagements, 237
   bloodFights, 311 facingFights. The stranding fix is mechanically
   correct; its benefit is road-dependent. Per the kill protocol the
   refinement is REVERTED (this run's commit is evidence+instruments
   only) — it must not be re-landed as-is, because on the lead road it
   regresses unlocks 8/8 → 5/8 on identical seeds.

## Results

32 runs (8 fresh seeds x {leadfeast, belongfeast} x {control, armed}),
180d death-aware, pre-seat substrate, own in-sweep control. Per-seed
JSONs: evidence/2026-10-15/perseed-w5reach3/ (32/32 present, 0
schema-bad). Beat captures: evidence/2026-10-15/w5reach3-beats/ (32/32).
Sweep log: evidence/2026-10-15/w5reach3-sweep.log.

| metric | control (n=16) | armed (n=16) | bar | verdict |
|---|---|---|---|---|
| paired unlock-day delta (PRIMARY) | — | +3.5d (n=4) | ≤ −4d | **NO-GO** |
| wave-5 unlocks | 8/16 | 9/16 | armed ≥ control | GO |
| wins | 0/16 | 0/16 | expected 0, LOUD if any | GO |
| national | 12/16 | 12/16 | ≥ control−2 | GO |
| table invites | 16/16 | 16/16 | — | — |
| wave-4 unlocks | 16/16 | 16/16 | — | — |
| exiled | 0/16 | 0/16 | — | GO |
| median survival | 118.0d | 110.5d | ≥ control−10d | GO (−7.5d) |

Road split (the finding):

| road | side | w5 | national | median surv | hunts | engagements | liveDays | recoveredDays |
|---|---|---|---|---|---|---|---|---|
| belong | control | 0/8 | 5/8 | 116.5d | 0 | 0 | 0 | 0 |
| belong | armed | 4/8 | 5/8 | 117.5d | 78 | 18 | 232 | 227 |
| lead | control | 8/8 | 7/8 | 118.0d | 0 | 0 | 0 | 0 |
| lead | armed | 5/8 | 7/8 | 106.5d | 61 | 9 | 175 | 170 |

Wave-5 unlock days (daily unlockedWave() sampling — finding #360's fix):
- control: s274l d96, s385l d83, s496l d117, s607l d109, s718l d163, s829l d100, s940l d84, s163l d69 (all lead road; belong 0/8)
- armed: s274b d85, s496b d112, s829b d86, s940b d121, s163l d72, s496l d123, s829l d95, s940l d94 — plus s274l greenlit d103 per beats (final-day, sampler missed; harness maxWave=5)

Paired unlock-day deltas (armed − control; negative = armed earlier):
- both-unlocked (in the mean): s163l +3, s496l +6, s829l −5, s940l +10 → mean +3.5d (n=4)
- one-sided: belong s274/s496/s829/s940 armed-only unlocks (d85/d112/d86/d121); lead s385/s607/s718 control-only (d83/d109/d163); s274l armed greenlight d103 (beats) vs control d96

Mechanism counters (armed): 139 hunts, 407 liveDays, 397 recoveredDays,
0 sanctityDays, 27 engagements, 237 bloodFights (wave-3 commits), 311
facingFights (wave-4+ commits). Control: all zero (gate off, as
designed). Zero scholar deaths to committed fights across all 16 armed
runs (the 35% retreat discipline held).

Death modes: both sides dominated by combat (control 350, armed 391),
villager-combat (128 vs 124), monster (96 vs 84). Armed-only at n>=3:
none ("Performance Review" x1 and "Gavel" x1 are wave-3 monster kills at
n=1 — below the threshold). No new death mode introduced; guardrail
holds. Starvation 4 vs 5 — the food economy holds on this stack.

Wall numbers on the pre-seat stack (this arm's measurement): national
12/16, table 16/16, wins 0/16, wave-4 16/16, wave-5 8–9/16, median
~110–118d, exiled 0. (For the tracker: the pre-seat substrate reaches
national and wave-5 in sims, but wins 0/16 — the seat driver is the
win-side difference; unchanged from w5reach2.)

## Village assessment

Thirty-two villages lived on the pre-seat stack — invited, every one,
to a table nobody sits. They die the way villages die out here:
combat, combat, combat — villagers falling to the Mirror Draft's
champions, funerals stacking up in the wave-4 window, the scholar
surviving fights the village doesn't.

On the belong road, the scholar's hunts are the difference between a
village that never sees the fifth draft and one that does. Four
villages that would have died wave-4-locked stood before the Mirror
Draft's champions because the scholar walked out to the thickets on
purpose, every third day, and the Producers took notice. The hunts are
the village's only road to the readiness gate — the base's own verbs
never get there (0/8).

On the lead road, the villages were already unlocking — 8/8 without a
single hunt — and the hunts cost them. The scholar's committed fights
don't kill the scholar (the 35% eject holds; zero scholar deaths in 16
armed runs), but they don't save the village either, and the time away
shows up as earlier deaths: −11.5 days of median survival on identical
seeds, unlocks 8/8 → 5/8. s274 is the parable: the scholar faced
champions (3 engagements), the fifth draft greenlit on d103 — and the
village bled out the next day (Tanvir, Tom Baker, Milagros Ruiz, combat,
combat, combat), one day after the greenlight, ten days before its
identical-seed control died. A champion who keeps walking out to duel
while the village burns behind them.

Nobody starved (4–5 starvation deaths across 32 runs). No exiles. No
wins. The table stays empty; the villages die rich in standing and
armed with knowledge, under post-invite overtime.

## Sense-testing

Read end to end: (1) belongfeast-armed s940 d60–123 (belong-road
success: 20 hunts, 4 engagements, wave-5 greenlit d120, village-lost
d123); (2) leadfeast-armed s274 d83–104 (lead-road regression: 7 hunts,
3 engagements, greenlight d103, village-lost d104).

- The arc is earned on both roads. The Mirror Draft opens with the
  System's own voice ("We've been watching you for a LONG time...
  Say hello to the MIRROR DRAFT") and the hold beat states the price
  ("The fifth draft stays in the wings. Stand before the Mirror
  Draft's champions — more than once, more than one kind — and the
  Producers will take notice"). The scholar's hunts are that order,
  executed deliberately — no expedition cutscene, just the scholar
  walking out to monster country on purpose, using ordinary
  travel/encounter verbs. With the gate opened, the hunts fire every
  3rd day for weeks; it reads as a scholar working a problem the
  System named, not as farming — each hunt is bounded (12 steps),
  gated on health and food, and the fights are real (the village
  buries people throughout).
- The cost is visible and honest. In s940 the pantry falls from ~34
  days of fresh (d64) to ~5 days (d106) while the scholar hunts fed —
  the scholar eats before walking out; the village's margin thins
  behind them. Nobody hides this; the beats show it. On the belong
  road the trade pays (0/8 → 4/8). On the lead road it doesn't, and
  the fiction reads coherently anyway: the s274 scholar survives every
  committed fight and the village dies without them.
- The deaths around the hunts are real: the Algorithm, the Audit, the
  Congregation — the Mirror Draft kills people who stand before it,
  which is the point. No scholar deaths to committed wave-4 fights
  across 311 facing fights — the 35% mid-fight eject stayed honest.
- Judgment: meaning and coherence pass on both roads. The difference
  between the roads is cost/benefit, not sense. The lever is not
  robotic; it is expensive where the village was already winning.

## Blanks (filled / documented)

- **FILLED:** scripts/test-w5reach3-20261015.js (22/22 GREEN on the new base: C1 RED→GREEN on the stranding state, C2/C3/C8 unchanged-behavior pins, det-gate 2/2 byte-identical, gate-on determinism, SMOKE green).
- **FILLED:** scripts/sweep-w5reach3-20261015.js (the 32-run sweep with daily unlockedWave() sampling, recovered-days/sanctity-days gate-liveness tracking, beat captures, per-seed JSONs with the exact numeric keys).
- **FILLED:** the 32-run pre-seat gate-refinement census —
  evidence/2026-10-15/perseed-w5reach3/*.json (32/32 present, 0
  schema-bad) + w5reach3-beats/ (32/32 beat captures) +
  w5reach3-sweep.log.
- **DOCUMENTED:** the road heterogeneity — the refinement helps where
  the base can't reach the gate (belong 0/8 → 4/8) and hurts where the
  base already unlocks (lead 8/8 → 5/8, median −11.5d). Named next: a
  road-aware arm (hunt only where the base's own verbs aren't already
  unlocking, or scholar-absence cost accounting). The refinement is
  REVERTED per kill protocol — it must not be re-landed as-is.
- **DOCUMENTED:** finding #369's fix, mechanically — 397 recovered
  days, 0 sanctity days, 27 engagements (vs 13 live days / 3
  engagements under the landed heuristic). The stranding is gone; the
  gate is engine-honest.
- **DOCUMENTED:** the daily-sampler final-day edge (s274 lead-armed:
  beats greenlight d103, harness maxWave=5, wave5Day=null) — filed to
  sim-findings as an instrument gap.
