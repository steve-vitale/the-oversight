# sim-spiralverb — SCALE-WALL r29 arm 3: marker-type-matched spiral verbs

Arm: `sim-spiralverb` (oversight-flesh-out-loop, run 2026-10-14, axis scale-onramp).
Policy-side only — `scripts/policies/spiralverb.js` (gate `SPIRALVERB=1`, default OFF),
layered on leadfeast (`spiralverb`). Sweep driver `scripts/sweep-spiralverb-20261014.js`
(cloned from the r28 driver + type telemetry). Proof tests
`scripts/test-spiralverb-20261014.js` (18/18 green: R1-R4 RED, G1-G10 GREEN;
verb-fork mutation check: forcing combat-only fails the 5 pantry-dependent
checks). No src/js game-code changes.
No canon doc covers the spiral posture (CANON.md has no entry for it) — the
design constraint is the r27 wave5cond kill
(evidence/2026-10-14/sim-wave5cond-r27.md) and the r28 spiralcond kill
(evidence/2026-10-14/sim-spiralcond.md), both read before designing.

Lineage: r24 measured the blanket post-unlock posture (killed at pilot).
r25 built the death-count conditional (killed UNMEASURABLE). r27 re-ran on
deterministic code and killed it MEASURED (a count can't tell a wake from a
collapse — s22 false positive, −31d). r28 built the spiral-SHAPED trigger
(3 markers, ≥2 to engage) and killed it MEASURED: the trigger was SELECTIVE
(s22: 3 engages/3 disengages, +58d, survived 180) but the VERBS mismatched
the spiral TYPE (s44: true pantry-collapse read, homebound posture pinned
the scholar home, −44d). THIS arm is the named next design from the
sim-findings SPIRAL-TYPE-MISMATCH entry: key the VERBS to the marker type.

## THE DESIGN (frozen at implementation)

The r28 trigger, rebuilt from the preserved spec/proof (the r28 policy file
was deleted per the kill protocol): post wave-5 unlock, each day evaluates
three spiral markers over a trailing 21d window from honest engine reads —
(a) death-acceleration (two scholar deaths in-window, 2nd within 14d of 1st),
(b) pantry-trajectory (pantry fresh-days < 3 AND falling), (c) succession-feed
(successor dies to the SAME monster within 48h; combat_start pairing-lite;
null attribution never fires). ENGAGE iff ≥2 markers fire (latch evaluates
pre-unlock history); DISENGAGE after 7 rolling days below 2 markers.

THE VERB FORK (new):
- COMBAT spiral — death-acceleration and/or succession-feed dominate (pantry
  absent), or ALL THREE fire: the r28 homebound verbs (travel guard:
  monster-active wild tiles / far travel declined; haven + adjacent +
  homeward-clear pass; combatExit always passes; walk-home at engage;
  proposal pause; dusk top-up feast vs wave-5 haven threat, honest gates +
  1.5x buffer, one/day).
- PANTRY spiral — pantry-trajectory fires without BOTH combat markers:
  haul/forage PRIORITY. The scholar ranges OUT — NO travel guard (the s44
  fix is the absence of pinning); an extra forage trip each engaged day
  (competent.forageTripSeedFirst, honest engine verbs); corpse hauling at
  upkeep 3x/day (haul.haulCorpses); courts paused ("no new courts while the
  bins echo").
- MIXED (all three markers): combat posture wins on scholar safety —
  DOCUMENTED TIE-BREAK: when the village is both bleeding scholars and
  starving, the scholar's personal survival is judged the binding constraint
  (a dead scholar ends the leadership). With only ONE combat partner, the
  pantry marker dominates the verb choice — the s44 lesson is that a
  collapsing pantry needs income and the bunker verbs cost 44 days.

Type is fixed per engage; a re-engage re-classifies from the new marker set.

## Pre-registration (MEASUREMENT.md §§9–12, 14) — written BEFORE the sweep

- ARMS: leadfeast (baseline: FEASTSCALE_R13=1, SPIRALVERB off) vs spiralverb
  (FEASTSCALE_R13=1, SPIRALVERB=1). Both sides on current tip, identical seeds.
- SEEDS: pilot 11,22,33,44,55,66,77,88 (8; pilot gate per §9).
- HORIZON: 180d death-aware (runDays stops on Game.over / pop zero).
- PRIMARY METRIC: mean post-unlock survival days (endDay − unlockDay5) among
  wave-5 unlockers. GO = armed mean >= baseline mean + 15d.
- GUARDRAILS: overall median survival >= baseline−10d; table among wave-5
  unlockers >= baseline; national >= baseline−1.
- THIN-N RULE: if unlocks < 2 on BOTH sides → UNMEASURABLE → kill per §9, no
  confirm spend.
- WHAT WOULD KILL IT: GO missed at pilot (no confirm spend); any guardrail
  breached; the pantry type never engages on s44-shaped runs (precondition).
- PER-SEED ADJUDICATION: s44 (pantry-spiral) must not repeat the r28 −44d;
  s22 (combat/attrition) must not regress the r28 +58d.
- INSTRUMENT: scripts/sweep-spiralverb-20261014.js; per-seed JSON
  evidence/2026-10-14/spiralverb-r29-sweep.json.
- §14 BINDING: a miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Doubts go under "metric review" for the NEXT run.

## Determinism gate (before the sweep)

scripts/det-gate.js checkDeterminism on all 8 seeds x both policies (180d,
one process): 16/16 IDENTICAL A/A. The comparison is controlled, not
noise-dominated — the layer is RNG-free in its own decisions (pure reads;
the verbs use the seeded RNG), and the deterministic sim clock holds.

## RESULTS

Sweep: 16/16 runs completed (8 seeds x leadfeast/spiralverb, 180d
death-aware, identical seeds, one process, current tip both sides).
Per-seed JSON: evidence/2026-10-14/spiralverb-r29-sweep.json. Proof tests
scripts/test-spiralverb-20261014.js: 18/18 green (verb-fork mutation check:
forcing combat-only fails the 5 pantry-dependent checks). Det-gate: 16/16
identical A/A on BOTH policies.

### Pilot numbers (adjudicated, not just reported)

- Baseline (leadfeast): 3 unlocks — s22 u5=57 postU=65 (lesser table),
  s44 u5=63 postU=59, s55 u5=60 postU=104 (lesser table).
  meanPostUnlock 76.0d; table among unlockers 2; national 4; median 122d;
  exiled 0.
- Armed (spiralverb): 3 unlocks — s22 u5=57 postU=123 (lesser table),
  s44 u5=63 postU=11, s55 u5=60 postU=120 (lesser table, survived 180).
  meanPostUnlock 84.7d; table among unlockers 2; national 3; median 74d;
  exiled 0.
- Layer telemetry (armed): 3 runs active, 5 engages / 3 disengages
  (ALL 5 pantry-type; ZERO combat-type engages), 52 engaged days
  (36 with ≥2 markers; 16 in the 7-day disengage countdown), 4 extra
  forage trips, 3 corpses hauled, 0 proposals paused (no court was
  proposed on engaged days to pause — the counter only increments when
  the base actually proposes), 0 top-up feasts, 0 walk-homes
  (both are combat-posture verbs; the combat posture never engaged).

Note on baseline drift: this run's baseline (76.0d, 3 unlocks incl. s55)
differs from the r28 context (62.0d, 2 unlocks) — master moved between runs
(sixthlink kill, coordinator repairs). The GO bar was computed against THIS
run's own control, identical code both sides.

### Adjudication (§14 — binding)

- PRIMARY: armed mean 84.7d vs GO (baseline 76.0 + 15 = 91.0d) → MISS
  (−6.3d; the mean is s44's −48d against s22's +58d and s55's +16d).
- GUARDRAILS: median 74 >= 112? NO → BREACH (driven by s44's d74 death vs
  baseline d122 — with n=8 the median is one seed deep); table among
  unlockers 2 >= 2 ✓; national 3 >= 3 ✓ (exactly at the floor — s44 lost
  its national).
- Thin-n rule not triggered (3 unlocks each side — measurable).

### Verdict: KILLED AT PILOT — NO-GO (measured: primary miss + guardrail breach)

Per §14: no re-score, no confirm spend. The policy file is deleted per the
kill protocol; proof + driver + sweep JSON + evidence survive.

## Per-seed autopsy (which markers fired, which verbs answered)

**Type classification worked as designed.** All 5 engages classified pantry
(s22 ×3, s44 ×1, s55 ×1); zero combat engages — no seed produced a
combat-dominant marker set (accel+feed without pantry, or all three). The
succession-feed marker fired 0 times in 32 runs across r28+r29 — it is too
rare at pilot scale to carry the combat half of the fork (r28 review
already flagged this; confirmed again).

**s22 (armed, postU 123 vs baseline 65: +58d — the gain is preserved).**
Three pantry engages (d84, d136, d171) / two disengages (d91, d152), 21
marker-days, 4 extra forage trips, 3 corpses hauled, survived the full
180d to a lesser table seat. The marker shape was accel+pantry both times
(fresh-days 10.2→2.3, 8.4→2.3, 4.4→0.8) — the same shape r28's homebound
brace answered. The pantry verbs (ranging open + income beats) delivered
the IDENTICAL +58d the brace did. Lesson: on s22 the trigger's selectivity
does the work, not the verb choice — engaging at all (vs r27's pinning or
nothing) is what saves the 58 days.

**s44 (armed, postU 11 vs baseline 59: −48d — type-matching did NOT fix it).**
Scholar deaths at 19, 47, 53, 55, 63 (the unlock-day scholar died at d63).
Death-acceleration fired from d54; pantry-trajectory joined at d69
(fresh-days 24.0 → 1.6) → engaged d69 as PANTRY, correctly classified,
never disengaged. The village died at d74 — 6 engaged days, 0 successful
extra forage trips, 0 corpses hauled. The transcript shows why: d68's
engine line reads "⚠ STARVING: health and energy falling. The spiral has
started." while the pantry falls 24→1.6 fresh-days in days — the r28
raid-stripping pattern (~4.4k kcal/night carried off). Villagers died to
monsters nightly (d67, d71, d72, d75). The base policy's own forage trips
were already coming back empty ("This patch is worked out — step to
another green patch and forage again," repeated d64–d69): the wilds near
haven were stripped. The posture's extra trip found nothing either.
THE REFINED LESSON: s44's spiral was not an income shortfall — it was
pantry collapse via RAID PREDATION. More ranging cannot outrun a pantry
being looted faster than it is filled. The pantry verbs answered the wrong
CAUSE: the village needed raid defense, not more foraging. (Adjacent:
sim-findings #161 — wave-4/5 lingerers are undrivable, steve-call; the
gorgedrive arm's answer doesn't reach apex raiders.)

**s55 (armed, postU 120 vs baseline 104: +16d, survived 180 vs d164).**
One pantry engage (d76–83) / one disengage (d90), lesser table both sides.
The posture's engage window bridged a real dip; the village survived the
horizon the baseline didn't.

**s11/s33/s66/s77/s88:** identical trajectories both sides (layer inert —
no unlock, no markers; gate-off byte-identical confirmed by the det-gate).
No wins, no vests; national 3/8 armed vs 4/8 baseline (s44's loss). The
scale wall stands.

## Village assessment

**s22 (armed):** three food-posture windows across a 180-day run, each
followed by a stand-down — the village ranged FOR food during death
clusters with collapsing pantries and stood down when the signs cleared.
The transcript around the d84 engage shows a living village making a
decision, not a policy switch (see Sense test). Who thrived: the commons
— the posture never pinned the scholar, so tribute, trade, and talk
continued; the lesser table seat held. Who died: the usual wave-5 wall.

**s44 (armed):** a raid-driven pantry collapse the food posture couldn't
answer. The d69 engage beat is the run's best line — correctly read,
honestly named — and then the village starved in 5 days while the extra
forage trips found worked-out patches and the raids kept stripping the
bins. The missing capability is not a better food posture but a
raid-defense answer (or a trigger that distinguishes predation spirals
from income spirals — a design question for the next arm).

**s55 (armed):** the posture as a bridge — one 8-day food window, then
the village walked the rest of the 180 days itself. The first
survived-horizon on this seed.

## Sense test (SENSE-TESTING LAW)

Two engage/disengage beat sets read (s44 d69, s22 d84/d91/d136/d152/d171 —
the s22 beats re-captured with a dedicated uncapped run since the sweep's
120-line windowSay cap saturated before its engages).

s44 d69: "The pantry is the spiral — death-acceleration (two scholar
deaths 2d apart inside the 21d window); pantry-trajectory (fresh-days 24.0
-> 1.6, below 3 and falling). The village does not brace at home — it
keeps ranging for food while the bins echo: haul, forage, garden, creek."
It fires mid-crisis (STARVING flag d68, Red Table aid caravans, worked-out
forage patches) and names its evidence. A village decision, not a switch.

s22 d84/d91: engage names death-acceleration (3d gap) + pantry-trajectory
(10.2→2.3); disengage: "The spiral has loosened — fewer than two signs
for a full week. The food posture stands down; the bins are breathing
again." The d136/d152 and d171 cycles repeat the pattern with fresh
numbers — the oscillation reads as the village bracing and standing down,
not a stuck switch.

The sense test PASSES — which makes this kill purely outcome-driven like
r27's and r28's: the trigger is selective, the type classification is
correct, the beats read as decisions, but on a controlled instrument the
arm costs more than it saves because the pantry verbs can't answer a
raid-driven collapse.

## Metric review

§14 honored: primary miss and median guardrail breach are NO-GO as
pre-registered — no re-score, no confirm spend. Doubts recorded here for
the NEXT run, not this one:
(1) With n=3 unlocks per side, the mean is single-seed dominated AGAIN
(r28's review said the same): +58/+16/−48. The per-seed asymmetric
analysis the r27 review proposed is now validated twice — the trigger is
1-for-2 on true spirals (s22, s55 helped; s44 hurt) and the mean hides
that the CLASSIFICATION problem is solved and the CAUSE problem is new.
(2) The median guardrail (74 vs 112) is one seed deep — s44's d74 death.
A wider seed set would steady it; the 8-seed pilot is cheap and could go
wider before killing. (3) The combat half of the verb fork is untested in
sims — 0 combat engages in 16 runs (succession-feed fired 0 times in 32
runs across r28+r29). Any future arm relying on the combat posture must
first measure the feed marker's base rate or widen its window. (4) The
driver's 120-line windowSay cap saturated before s22's/s55's engages —
future drivers should reserve the capture budget for engaged days (the
r28 driver had the same limit; the dedicated re-capture run worked
around it).
