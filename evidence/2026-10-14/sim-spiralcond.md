# sim-spiralcond — SCALE-WALL r28 arm 2: the SPIRAL-SHAPED conditional wave-5 posture

Arm: `sim-spiralcond` (oversight-flesh-out-loop, run 2026-10-14, axis scale-onramp).
Policy-side only — `scripts/policies/spiralcond.js` (gate `SPIRALCOND=1`, default OFF),
layered on leadfeast (`spiralfeast`). Sweep driver `scripts/sweep-spiralcond-20261014.js`
(cloned from the r27 driver). Proof tests `scripts/test-spiralcond-20261014.js`
(14/14 green: R1-R4 RED, G1-G7 GREEN). No src/js game-code changes for the layer.
Instrument: deterministic sim clock in scripts/sim-harness.js (r27 entropy hunt).

Lineage: r24 measured the blanket post-unlock posture (killed at pilot: 32.8d -> 34.8d,
needed +15d). r25 built the conditional design (engage iff trailing-30d scholar
deaths >= 2) and killed it as UNMEASURABLE (det-test noise). r27 re-ran on
deterministic code and killed it MEASURED (evidence/2026-10-14/sim-wave5cond-r27.md):
a death COUNT cannot tell a wake from a collapse — s22 fired on a STRONG village
(2 deaths were attrition, not spiral; pinned home 85/85 days, −31d, full→lesser
table); the mechanism genuinely helps true bleeders (s44 +9d). THIS arm is the
named next design: a spiral-SHAPED trigger (death acceleration, pantry
trajectory, succession feed) instead of a count.

## THE DESIGN (frozen at implementation)

Post-unlock (wave-5 latched), each day the layer evaluates THREE spiral markers
over a trailing 21-day window, from honest engine reads only:
  (a) DEATH ACCELERATION — two scholar deaths both inside the trailing 21d
      window, the second within 14 days of the first;
  (b) PANTRY TRAJECTORY — pantry FRESH-days (Game.pantryFreshDays()) below 3
      AND falling across the window (now vs window's oldest daily sample);
  (c) SUCCESSION FEED — a successor dies to the SAME monster within 48h of
      succession (the r26 w5census named engine pattern; attribution from the
      combat_start tele pairing-lite, nearest start within 2d of the death;
      null attribution never fires).
ENGAGE the r24 posture verbs (homebound scholar: travel guard declines
monster-active wild tiles / far travel, haven+adjacent+homeward-clear allowed,
combatExit always passes; walk-home at engage; proposal pause; dusk top-up
feast vs wave-5 haven threat with honest feast gates + 1.5x buffer, one/day)
iff >=2 markers fire on the day (latch evaluated immediately from passively
tracked pre-unlock history). DISENGAGE when <2 markers fire for 7 rolling days
(no sticky homebound). Engage/disengage narrated with named markers.

## Pre-registration (MEASUREMENT.md §§9–12, 14) — written BEFORE the sweep

- ARMS: leadfeast (baseline: FEASTSCALE_R13=1, SPIRALCOND off) vs spiralfeast
  (FEASTSCALE_R13=1, SPIRALCOND=1). Both sides on post-fix code, identical seeds.
- SEEDS: pilot 11,22,33,44,55,66,77,88 (8; pilot gate per §9).
- HORIZON: 180d death-aware (runDays stops on Game.over / pop zero). Why 180:
  wave-5 is a late metric; shorter caps truncate the survivors that carry the
  post-unlock window. WIN-PATH HORIZON 180 is the absolute max.
- PRIMARY METRIC: mean post-unlock survival days (endDay − unlockDay5) among
  wave-5 unlockers. GO = armed mean >= baseline mean + 15d.
- SECONDARY METRIC: table reaches among wave-5 unlockers. GO = armed >= baseline + 1.
- THIN-N RULE: if unlocks < 2 on BOTH sides → UNMEASURABLE → kill per §9, no
  confirm spend.
- GUARDRAILS: overall median survival >= baseline−10d; national >= baseline−2;
  wave-5 unlocks >= baseline−1 (the layer must not gate the unlock);
  exiled <= baseline.
- WHAT WOULD KILL IT: condition never fires on any unlock seed (precondition
  kill); GO missed at pilot (no confirm spend); any guardrail breached.
- INSTRUMENT: scripts/sweep-spiralcond-20261014.js; per-seed JSON
  evidence/2026-10-14/spiralcond-r28-sweep.json.
- §14 BINDING: a miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Doubts go under "metric review" for the NEXT run.

## Determinism gate (before the sweep)

scripts/det-gate.js checkDeterminism on all 8 seeds x both policies (180d,
one process): 16/16 IDENTICAL A/A. The comparison is controlled, not
noise-dominated — the r27 repair holds with the new layer (the layer is
RNG-free: pure reads, deterministic wraps, no Date.now).

## RESULTS

Sweep: 16/16 runs completed (8 seeds x leadfeast/spiralfeast, 180d death-aware,
identical seeds, one process, post-fix code both sides). Per-seed JSON:
evidence/2026-10-14/spiralcond-r28-sweep.json. Proof tests
scripts/test-spiralcond-20261014.js: 14/14 green. Det-gate: 16/16 identical
A/A on BOTH policies — the comparison is controlled, not noise-dominated.

### Pilot numbers (adjudicated, not just reported)

- Baseline (leadfeast): 2 unlocks — s22 u5=57 postU=65 (lesser table),
  s44 u5=63 postU=59.
  meanPostUnlock 62.0d; table among unlockers 1; national 3; median 100d;
  exiled 0.
- Armed (spiralfeast): 2 unlocks — s22 u5=57 postU=123 (lesser table),
  s44 u5=63 postU=15.
  meanPostUnlock 69.0d; table among unlockers 1; national 3; median 78d;
  exiled 0.
- Layer telemetry (armed): 2 runs active, 4 engages / 3 disengages,
  39 engage-days, 50 monster-tile declines + 51 far-travel declines,
  0 proposals paused, 0 top-up feasts (no wave-5 monster sat on the haven
  tile at dusk while engaged), 1 walk-home.

Note on baseline drift: this run's baseline mean (62.0d) differs from the r27
context number (45.5d) — master moved between runs (the sixthlink kill and
coordinator repairs landed after r27). The brief's r27 numbers were context
only; the GO bar was computed against THIS run's own control, which ran on
identical code both sides.

### Adjudication (§14 — binding)

- PRIMARY: armed mean 69.0d vs GO (baseline 62.0 + 15 = 77.0d) → MISS
  (+7d, and the +7 is s22's +58 against s44's −44 on n=2 unlocks).
- SECONDARY: table among unlockers 1 vs GO (baseline 1 + 1 = 2) → MISS.
- Guardrails: median 78 >= 90? NO → BREACH (driven by s44's d78 death vs
  baseline d122); national 3 >= 1 ✓; wave-reach 2 >= 1 ✓; exiled 0 <= 0 ✓.
- Thin-n rule not triggered (2 unlocks each side — measurable, but thin).

### Verdict: KILLED AT PILOT — NO-GO (measured, triple miss)

Primary missed, secondary missed, and the median guardrail breached. Per §14:
no re-score, no confirm spend. The policy file is deleted per the kill
protocol; proof + driver + sweep JSON + evidence survive.

## Per-seed autopsy (which markers fired, where)

**s22 (armed, survived 180; baseline died d122): the trigger works — +58d.**
Scholar deaths at 17, 48, 56, 64, 67, 75, 86, 88, 108, 148, 150, 161, 178.
The layer engaged 3 times (d84, d102, d153) and disengaged 3 times (d91,
d109, d168) — the designed oscillation: brace when death-acceleration AND
pantry-trajectory fire together, stand down after 7 quiet days. 29
engage-days, 38 monster-tile + 36 far-travel declines, walk-home at the
latch engage. postU 123 vs baseline 65. No feed events all run (the
succession-feed marker never fired on any seed this run — see below).

**s44 (armed, died d78; baseline died d122): the verbs fail — −44d.**
Scholar deaths at 19, 47, 53, 55, 63, 75. Markers fired HONESTLY: death
acceleration (53→55→63→75, gaps 2/8/12d inside the window) and pantry
trajectory (fresh-days 14.6 → 1.6 and below 3). The layer engaged at d69 and
never disengaged — the village was in a REAL spiral and the trigger read it
correctly. 10 engage-days, 27 declined travels, and the village died at d78
while pinned home. The baseline, left alone, survived to d122.

**The lesson is not selectivity this time — it's verb-type mismatch.**
r27's kill was the trigger misclassifying strength as spiral. Here the
trigger classified a TRUE spiral correctly and the posture still lost 44
days. The r24 verbs assume the threat is OUTSIDE (monsters): homebound
scholar = safer scholar. But s44's spiral was a pantry collapse —
fresh-days 14.6 → 1.6, raids carrying off ~4.4k kcal in a night — and
pinning the scholar home stopped the ranging income (forage/haul/tribute
runs) that a starving village needs. The layer treats every spiral the
same; the spiral was real but the wrong KIND for these verbs. Filed to
sim-findings.md: the next design must key the VERBS to the marker type
(combat-spiral → homebound; pantry-spiral → haul/forage priority, the
scholar ranging FOR food), not just the trigger.

**Succession-feed marker: 0 fires across 16 runs.** The marker is proven
selective in unit tests (G5, G7), but in these 8 seeds no successor died to
the same monster within 48h post-unlock. It contributed nothing to this
run's engage decisions — all 4 engages were acceleration+pantry. Design
note for the next arm: the feed marker may be too rare to matter at 8-seed
scale, or it may need a wider window (the r26 pattern was same-day chains;
48h may already be the wide reading).

## Village assessment

**s22 (armed):** the brace working as designed. Three engages across a
180-day run, each followed by a stand-down — the village braced during
death clusters (d64: Walt dead; d67: Theo dead, combat; d75: Konrad dead,
combat — the Algorithm raid at Haven's door) and ranged again in the
gaps. The transcript shows a living village around the posture: Stonebridge
aid caravans ("Heard your bins are echoing"), tribute paid and received,
codex growth (29→37 entries), monster-name debates ("The Big Beast"),
Theo's dream-warning. The posture's 29 homebound days cost travel but the
village reached a lesser table seat and survived the full horizon — the
first 180-day survival in the wave-5 posture lineage. Who thrived: the
commons — traders kept coming, links held through deaths. Who died: Walt,
Theo, Konrad (combat, monster raids at Haven) — the posture can't fight
haven-door raids for you; it only keeps the scholar from walking into new
ones.

**s44 (armed):** a pantry spiral the posture couldn't answer. The d69 brace
line fires mid-crisis ("fresh-days 14.6 -> 1.6") while Emberhold raids
carry off pantry stock night after night and The Hungry Road takes 4.4k in
one night. The scholar pins home; the village starves in place. The
baseline's scholar kept ranging (and dying — deaths at 63, 75 either way)
but the village's income streams stayed open and it lived 44 days longer.
The missing capability: a food-crisis posture, not a monster-crisis one.

**s11/s33/s55/s66/s77/s88:** identical trajectories both sides (the layer
inert — no unlock, no markers; gate-off byte-identical behavior confirmed
by the det-gate). No wins, no vests; national 3/8 both sides. The scale
wall stands — national reached on 3 seeds both sides, table on 1, zero
wins, zero wave-4→5→table chain completions.

## Sense test (SENSE-TESTING LAW)

Two engage beats read (s44 d69, s22's latch-equivalent from the unit
proof). The d69 line reads as a village decision, not a policy switch:
"The signs are not two deaths but a spiral — death-acceleration (two
scholar deaths 8d apart inside the 21d window); pantry-trajectory
(fresh-days 14.6 -> 1.6 and below 3). The village braces: no ranging, no
new courts. Home ground, full bellies, and the table." It names its
evidence, in context of real strain (raids, starvation warnings, shaken
links). The disengage line ("The spiral has loosened — fewer than two
signs for a full week. Ranging resumes, cautiously.") fires at the right
cadence. The sense test PASSES — which makes this kill purely
outcome-driven, like r27's: the trigger is coherent and selective, the
beats read as decisions, but on a controlled instrument the posture costs
more than it saves because its verbs answer the wrong kind of spiral.

## Metric review

§14 honored: primary, secondary, and one guardrail are NO-GO as
pre-registered — no re-score, no confirm spend. Doubts recorded here for
the NEXT run, not this one:
(1) With n=2 unlocks per side, the mean is single-seed dominated — the
+15d bar on a 2-seed mean is near a coin flip (+58 vs −44). r27's review
already proposed per-seed asymmetric analysis (help on true spirals vs
cost on false positives) for the next conditional design; this run
confirms it: the trigger was 1-for-2 on true positives and the mean
hides that the SELECTIVITY problem is solved and the VERB problem is new.
(2) The median guardrail breach (78 vs 90) is real but driven by one seed's
death; with n=8 the median is one seed deep. A wider seed set would steady
both the mean and the median — the 8-seed pilot is cheap (~3s/seed) and
could go wider before killing.
(3) The succession-feed marker fired 0 times in 16 runs. Either it is too
rare to carry weight at pilot scale (and the design should not count on
it), or the 48h window is wrong for the current engine's succession
tempo. The next arm should measure the marker's base rate before building
on it.
