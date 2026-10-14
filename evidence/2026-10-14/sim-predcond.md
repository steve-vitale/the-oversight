# sim-predcond — the PREDDISC CONSUMER arm: type-matched conditional spiral posture

Arm: `sim-predcond` (oversight-flesh-out-loop, run 2026-10-14, axis scale-onramp).
Policy-side only — `scripts/policies/predcond.js` (gate `PREDCOND=1`, default
OFF), layered on leadfeast (`FEASTSCALE_R13=1`). Proof
`scripts/test-predcond-20261014.js` (19/19: R1–R5 RED, G1–G10 GREEN).
Det-gate `scripts/detgate-run-predcond-20261014.js` (SMOKE + 16/16 identical).
Sweep driver `scripts/sweep-predcond-20261014.js` (driver-side gorge
instrumentation for BOTH arms — the #189 lesson). Constructed scenario
`scripts/scenario-predcond-20261014.js` (the #172 fallback: forced-gorge
full-collapse, 6/6 assertions). No src/js game-code changes.

Lineage: wave5cond-r27 killed the death-count trigger (a count cannot tell a
wake from a collapse). spiralcond-r28 built the spiral-SHAPED trigger (>=2 of
{death-accel, pantry-trajectory, succession-feed}) but its r24 posture verbs
were threat-agnostic: s44's pantry collapse pinned the scholar home, stopping
the ranging income a starving village needs (-44d). spiralverb-r29 keyed verbs
to marker type (combat -> homebound, pantry -> ranging) but s44 was
RAID-DRIVEN — haul/forage answered the wrong cause (-48d). preddisc (r30
instrument, scripts/preddisc-20261014.js, sim-findings #163) added the
predation discriminator. THIS arm consumes it.

## THE DESIGN (frozen at implementation)

Post wave-5 unlock, each day the layer evaluates the spiral markers from
honest engine reads (the preddisc instrument's live telemetry):
  (a) DEATH ACCELERATION — two scholar deaths in the trailing 21d, the 2nd
      within 14d of the 1st (the spiralcond spec);
  (b) PANTRY TRAJECTORY — pantry fresh-days < 3 AND falling across the
      trailing 7d (from the preddisc track's pantryDaysEstimate-based
      samples — the same series the frozen rule was validated on);
  (c) SUCCESSION FEED — a successor dies to the SAME monster within 48h of
      succession (combat_start pairing-lite; null attribution never fires).
ENGAGE iff >=2 markers fire (the latch evaluates immediately from passively
tracked pre-unlock history). DISENGAGE after 7 rolling days with <2 markers.

TYPE CLASSIFICATION (the frozen preddisc rule, applied to the live
trailing-7d markers — raidExplains7d = gorge kcal / pantry drain, drain
floored at 3000):
  combat set dominates (accel + feed, pantry absent — or all three):
      -> 'combat'
  pantry-trajectory without both combat markers:
      raidExplains7d >= 0.40 or (3+ gorge nights and 6000+ kcal) -> 'pantry-raid'
      raidExplains7d >= 0.15                                    -> 'mixed'
      else                                                      -> 'pantry-income'

VERB FORK (type-matched):
  combat        -> homebound-brace (the r24 verbs: walk-home at engage,
                 travel guard declines wild/far sorties {moved:false},
                 combatExit always passes, haven/adjacent/homeward pass,
                 proposals pause, dusk top-up feast vs wave-5+ haven threat
                 with feastPlan ok + have >= cost x 1.5 + unfeasted, one/day,
                 guard-posture beat once per window)
  pantry-income -> ranging-income-priority (ranging OPEN — the r28 lesson;
                 never pin the scholar home on an income spiral; one extra
                 forage trip/day via competent.forageTripSeedFirst; corpse
                 hauling at upkeep via haul.haulCorpses; courts pause)
  mixed         -> combat-posture-wins (the r29 tie-break: the combat verbs)
  pantry-raid   -> brace+conserve (SCOPE CUT — see below; NO top-up feasts)

SCOPE CUT (documented, not built): raid-defense against apex lingerers is
UNBUILT — sim-findings #161 (steve-call): "the arrival needs a fight path or
the beat should say 'Endure it'". This arm FENCES APEX OUT: on a pantry-raid
spiral with wave-4/5 apex entities lingering, the layer braces (walk-home,
guarded travel, courts pause) and conserves (no feasts, no tribute
acceleration, no new pantry spends) — it NEVER engages the lingerer, never
fires triggerEncounter, never promises to answer. The engage beat says it
plainly: "the village braces and conserves. Driving them off is not in the
plan: endure it." The apex fence is structural (the policy contains no
march-out/engage verb at all) and is asserted by proof G3 and scenario A4.

CAVEATS (from #163, documented not built):
  (1) 'income' is the residual not-raid-driven bucket and absorbs
      spoilage-driven collapses, for which ranging verbs are the wrong
      answer — the verb mapping needs a preservation/pantry-management
      branch (sim-findings #171 OVERSTOCK-ROT).
  (2) The succession-feed marker fired 0 times in 32 runs across r28+r29;
      it is kept in the marker set and measured live (this run), not built on.

## Pre-registration (MEASUREMENT.md §§9–12, 14) — written BEFORE the sweep

- ARMS: leadfeast (baseline: FEASTSCALE_R13=1, PREDCOND off) vs predcond
  (FEASTSCALE_R13=1, PREDCOND=1). Both sides on current tip, identical seeds.
- SEEDS: pilot 11,22,33,44,55,66,77,88 (8; pilot gate per §9).
- HORIZON: 180d death-aware (runDays stops on Game.over / pop zero). Why 180:
  wave-5 is a late metric; shorter caps truncate the post-unlock window.
- PRIMARY METRIC: mean post-unlock survival days (endDay − unlockDay5) among
  wave-5 unlockers. GO = armed mean >= baseline mean + 15d.
- GUARDRAILS: overall median survival >= baseline−10d; national >=
  baseline−2; no new death mode (n>=3 family floor); table / wave reach
  report-only.
- THIN-N RULE: if unlocks < 2 on BOTH sides → UNMEASURABLE → kill per §9, no
  confirm spend.
- WHAT WOULD KILL IT: GO missed at pilot (no confirm spend); any guardrail
  breached; the mechanism never engages on any unlock seed (precondition).
- #172 CAVEAT (binding): no live predation-positive reproduced on current
  master (the r27/r28/r29 s44 shape did not reproduce in 6 preddisc runs).
  If the 8-seed pilot produces ZERO predation-positive classifications, do
  NOT claim a null — validate the trigger + verb fork in the constructed
  forced-gorge scenario (scripts/scenario-predcond-20261014.js) and judge
  the arm on the scenario + the live classifications the pilot DID produce.
- INSTRUMENT: scripts/sweep-predcond-20261014.js; per-seed JSON
  evidence/2026-10-14/predcond-r30-sweep.json. #189: gorge instrumentation
  installed DRIVER-SIDE for both arms.
- §14 BINDING: a miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Doubts go under "metric review".

## Proof tests

scripts/test-predcond-20261014.js — 20/20 GREEN (RED phase run against the
real layer: R1 gate-off byte-identical delegation with no tracking state;
R1b the hook-surface RED — every parent hook forwards; R2 pre-window passive
tracking; R3 attrition non-engagement; R4 single-marker non-engagement; R5
the r28 lesson as a RED — pantry-income must NOT pin travel). GREEN: G1
combat engage (brace verbs), G2 pantry-income engage (ranging open + extra
forage), G3 pantry-raid engage (scope cut, conserve, apex fenced), G4 mixed
-> combat posture, G5 travelGuard direct, G6 dusk top-up feast gates, G7
disengage + release, G8 latch, G9 haul at upkeep, G10 re-engage re-classifies;
frozen-rule unit checks. Four genuine failures fixed during development
(beat-text mismatch, mock drain pollution, guard ordering, fixture ctx key).

### THE HOOK-DROP BUG (caught by the s11 autopsy, fixed same-run)

The first full sweep was INVALID and is discarded. Symptom: armed s11 died
at day 34 pre-unlock while the identical-seed baseline ran 170d. Bisect
(day-hash comparison) localized the first divergence to day 11 (pantry
236 vs 233 x100). Narrowing: preddisc wraps alone identical, travel/propose
wraps alone identical, sampleDay-daily identical, setup-only identical —
but true-leadfeast vs predcond-gateoff DIVERGED. Root cause: `withPredcond`
built the policy object from scratch, DROPPING `leadfeast`'s `fight` hook
(the harness calls policy.fight; without it fights resolve differently).
Fix: the gorgedrive `Object.assign({}, base, overrides)` pattern — every
hook forwards unless overridden. Proof R1b pins the hook surface. After the
fix: leadfeast ≡ predcond-gateoff ≡ predcond-gateon for 15 days (bisect5),
and the sweep below was re-run from scratch. Lesson for the loop: any new
policy wrapper must use the Object.assign pattern; hand-listing the surface
silently drops hooks.

## Determinism gate

scripts/detgate-run-predcond-20261014.js: SMOKE (named-export unwrap yields
working policies, gate-off delegation intact) + checkDeterminism 16/16
IDENTICAL (8 seeds x leadfeast/predcond, 180d, one process).

## RESULTS

Sweep: 16/16 runs completed (8 seeds x leadfeast/predcond, 180d death-aware,
identical seeds, one process, current tip both sides, AFTER the hook-drop
fix). Per-seed JSON: evidence/2026-10-14/predcond-r30-sweep.json. Proof
20/20. Det-gate 16/16. Scenario 6/6.

### Pilot numbers (adjudicated, not just reported)

- Baseline (leadfeast): 4 unlocks — s11 u5=106 postU=64, s33 u5=99 postU=29,
  s44 u5=59 postU=44 (lesser table), s77 u5=65 postU=10.
  meanPostUnlock 36.8d; table among unlockers 1; national 2; median 103d;
  won 1; exiled 1.
- Armed (predcond): 4 unlocks — IDENTICAL seeds and days (106/99/59/65; the
  hook-drop fix restored pre-unlock byte-identity).
  s11 u5=106 postU=64, s33 u5=99 postU=29, s44 u5=59 postU=44 (lesser table),
  s77 u5=65 postU=14 (lesser table).
  meanPostUnlock 37.8d; table among unlockers 2; national 3; median 103d;
  won 2; exiled 1.
- Layer telemetry (armed): 1 engage in 16 runs — s77, type 'combat', 7 engage
  days (d73–79, all three markers, accel+feed dominate the tie-break), 0
  disengages (village died engaged). 0 pantry-income, 0 mixed, 0 pantry-raid
  engages. 0 top-up feasts, 0 forage trips, 0 hauls (no pantry engage).
- Gorge (driver-side, both arms — #189): 20 nights / 41,754 kcal total,
  w5Gorged 4,393 — IDENTICAL both sides (the layer never touched the gorge).
  Zero predation-positive classifications in the pilot (#172 as predicted).

### Adjudication (§14 — binding)

- PRIMARY: armed mean 37.8d vs GO (baseline 36.8 + 15 = 51.8d) → MISS
  (−14.0d).
- GUARDRAILS: median 103 >= 93 ✓; national 3 >= 0 ✓; exiled 1 <= 1 ✓; no new
  death mode (death-cause families identical: combat 58/58, monster 14/14,
  villager-combat 8/7, wound 6/6, sickness 9/9, contest 2/2, expedition 2/2,
  thirst 2/2, starvation 3/3) ✓.
- Thin-n rule not triggered (4 unlocks each side — measurable).
- #172 caveat honored: 0 live predation-positives → the trigger + verb fork
  were validated in the constructed scenario (6/6) instead of claiming a null.

### Verdict: KILLED AT PILOT — NO-GO (primary miss, §14)

Per §14: no re-score, no confirm spend. The policy file is deleted per the
kill protocol; proof + det-gate + sweep + scenario + evidence survive as
instruments. The kill is on POWER, not mechanism: the layer fired once in 8
seeds (the predation pattern is absent on current master — the #172 drought),
and the pre-registered bar cannot be met by a near-inert layer. The mechanism
is NOT disproven: proof 20/20, scenario 6/6, and the single live firing
(s77 combat) was directionally positive (+4d post-unlock, none→lesser table,
national 0→1 held).

## Per-seed autopsy

**s77 (armed, the single engage).** Post-unlock combat bleed: scholar deaths
d65, d67, d69, d72, d72 (combat), then d73 the layer engaged — markers
death-acceleration + succession-feed + pantry-trajectory, classified 'combat'
(accel+feed dominate the r29 tie-break). 7 engaged days (d73–79, brace verbs:
walk-home, guarded travel, courts paused, no top-up feast fired — no dusk
threat alignment in the window). Village-lost d79 vs baseline d75 (+4d);
lesser table seat vs none; national held 1 vs 0. The brace did what the r24
verbs do: it bought days, not a turnaround.

**s11/s22/s33/s44/s55/s66/s88:** identical trajectories both sides (layer
inert — no unlock on 22/55/66/88, or no spiral markers on 11/33/44; the
hook-drop fix restored byte-identity — every per-seed day count matches the
baseline exactly). No wins on either side; the scale wall stands.

## Sense test (transcripts — SENSE-TESTING LAW)

s77's post-unlock transcript reads as a village being ground down, not as
numbers: "The Big Beast is on you — no warning, just teeth", "Hassan is
dead. You didn't ask. It knew.", "The village threw out spoiled stores...
'Should've smoked that'", "🌙 Raid — Emberhold came in the night... They
carried off ~1000 kcal", "⚠ WARNING: reserves critical. Eat tomorrow or the
spiral begins." The deaths are named people (Hassan Ali, Jesse Cortez, Farid
Ahmed, Chen Wei, Thabo Maseko) dying in combat days apart — the succession
feed the marker set watches for. The brace engage at d73 (all three markers)
is the village's honest response to a real bleed. (Instrumentation note: the
120-line say cap saturated on d65–71 chatter, so the d73 engage beat itself
wasn't captured — the preddisc metric-review #3 ring-buffer limitation,
still open.)

## The #172 constructed scenario (forced-gorge full-collapse)

scripts/scenario-predcond-20261014.js — 6/6 assertions hold:
- A1: LIVE predation-positive — raidExplains7d = 0.648 (6 gorge nights,
  9,744 kcal vs 15,033 drain) on real gorge telemetry from a sustained
  wave-5 Cancellation siege. The discriminator's sensitivity is now proven
  on live (constructed) telemetry, not just synthetic shapes.
- A2: engages as 'pantry-raid'. A3: the scope-cut beat fires ("RAID
  PREDATION... the village braces and conserves. Driving them off is not in
  the plan: endure it.").
- A4: apex fence holds — zero triggerEncounter calls. A5: conserve holds —
  zero hostFeasts while engaged. A6: brace verbs fire (walk-home + guarded
  travel).
- Fixture honesty: the Cancellation slaughters visitors (real scholar deaths
  to it during the fixture); the pantry was trimmed to 15k so the collapse
  outruns the killing; the unlock is staged; two deaths are seeded. The
  scenario proves the trigger + verb fork, not the unlock road.

## Metric review

§14 honored: GO adjudicated against the pre-registered bar, no re-score.
Doubts for the NEXT run:
(1) The +15d absolute bar assumes a layer that fires. On a master where the
    spiral patterns are rare (the #172 drought), the pilot is a power failure,
    not a mechanism failure. Next conditional-posture run should pre-register
    a per-firing effect metric (e.g., mean post-engage survival delta on
    engaged seeds) alongside the population mean, or screen seeds for the
    pattern first (the preddisc 6-run set is the screen).
(2) The 'income' residual bucket still absorbs spoilage collapses (#171) —
    the verb map needs the preservation branch before any pantry-income arm
    is re-tested.
(3) The say-cap saturation (preddisc review #3) bit again — per-window flush,
    not latest-N.
(4) The hook-drop bug is now a standing lesson (evidence section above):
    policy wrappers must use Object.assign({}, base, overrides).
