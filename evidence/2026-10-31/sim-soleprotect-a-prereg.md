# sim-soleprotect-a — PREREGISTRATION (written BEFORE any judged sims)

Arm: sim-soleprotect-a, Loop A run fleshout-20261031T1850Z, axis
scale-onramp (converging, NOT converged). DIAG-ONLY arm: no
game-code default flips, no lever build, no efficacy judged.
Question, from the 1702Z metric review: what protects a sole
specialist sent to danger? The dangerfit NO-GO (sim-dangerfit-a)
showed the failure was MORTALITY, not diversion rate: the
85111 mechanic patrolled 10 times, then died on patrol day
140 (cause 'monster'), and village mend fell 271 -> 85
because he was the village's only mender. This arm measures
that mortality/capacity shape; it does NOT retry the reorder
and does NOT build a protection lever.

## Canon

docs/CANON.md read first. NO canon doc covers delegate
pickTask branch order, patrol assignment, or sole-specialist
protection specifically (docs/PARTY.md covers parties /
villagers generally; it does not prescribe fit-first vs
danger order or any sole-coverage guard). Stated, not
invented around: branch order and any future guard are
policy-layer facts, not Steve canon rulings. No canon doc
is being rewritten or extended by this DIAG arm.

## Instrument (measurement only, reverted before landing)

The dangerfit routing is re-applied ONLY as a measurement
instrument inside this worktree, in scripts/policies/
delegate.js pickTask, exactly as dangerfit built it (single
prand draw, matching the 35% patrol / 25% hunt split the
dangerfit evidence reports): after the hp < 40 -> 'rest'
return and before the fit-first block, if hp >= 60 AND raw
agency monsterKills > 0 (read RAW from
state.village.agency.stats — never via Game.agencyOf, so
the check mutates no state and draws no RNG), roll danger
first: prand() < 0.35 -> 'patrol'; < 0.6 -> 'hunt'; else
fall through to fit exactly as before. Between legs the
ONLY code difference is this block. The block is REVERTED
before the final commit; the revert is verified
byte-identical to base (git diff of delegate.js empty AND
hash equal to the base blob). If the revert cannot be
verified byte-identical, the run FAILS LOUDLY instead of
landing game/policy code. What lands is evidence +
recorder + analyzer + proof test only: zero src/js change
on this branch (delegate.js is a policy script, and even
it returns to base state).

## Legs, stack, seeds, horizon

- Stack: the IDENTICAL S-PATROL stack as dangerfit
  (leadfeast + windefer + seatdrive + fullseat + delegate +
  deadfall; FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 DEADFALL_B=1),
  reusing scripts/patrolsilent-diag-20261031.js (v2)
  verbatim, scripts/dangerfit-runner-20261031.js verbatim
  (ARM label soleprotect), and
  scripts/dangerfit-split-20261031.js verbatim.
- BASECHECK leg first: a baseline leg (dangerfit OFF) is
  run on THIS base (master tip at spawn 00e1bd4db) and its
  headlines compared to dangerfit's pilot numbers. Seeded
  trajectories are base-pinned (1535Z base-drift warning):
  seed labels and numbers are NEVER transferred across
  bases without this verification. If the basecheck
  reproduces dangerfit's pilot headlines, the band is
  stable; if it drifts, the drift is reported and the
  judged band is this base's two legs regardless — never
  dangerfit's numbers re-quoted as this run's results.
- Judged legs (after basecheck, which doubles as the
  baseline leg if it runs the full pilot cleanly):
  BASELINE (dangerfit OFF) and INSTRUMENT (dangerfit ON),
  identical seeds and stack.
- Pilot seeds (8, dangerfit's pilot band): 85111, 85114,
  85101, 85103, 85104, 85107, 85108, 85110.
- Confirm (12-16 seeds) ONLY if the pilot passes its
  completeness bars: the remaining dangerfit band seeds
  (85102, 85105, 85106, 85109, 85112, 85113, 85115, 85116)
  plus, if needed to reach 12+, re-screened pilot seeds
  are NOT re-counted — confirm seeds are distinct from
  pilot seeds; a confirm band of 8 fresh seeds is the
  floor for any confirm claim, and no confirm claim is
  made on fewer.
- Horizon: death-aware, never fixed 200d: DAYS=200 cap,
  runDays early-ends on over / village-lost / won exactly
  as the dangerfit sweep did.

## Definitions (fixed here, applied by the analyzer, never tuned mid-run)

- Holder: a villager with snapshot monsterKills > 0 on any
  at-Haven beat (killscred join rule, unchanged).
- Fit-skill provider: a villager with >= 1 delegateBeat
  pick of that task ('mend' or 'cook') on at-Haven beats
  over the run (the all-beats frame that reproduces
  "271x/257x"). Provider counts are village-wide, per
  seed per leg per skill.
- Sole provider: exactly 1 provider of that skill on that
  seed-leg. A sole-specialist holder is a kills-holder who
  is the sole provider of mend or of cook on that
  seed-leg. (Sole is measured over the run's observed
  picks; a holder who dies early can still be the run's
  sole provider — that IS the truncation finding, and the
  analyzer also reports providers-alive-at-end so the two
  readings are never conflated.)
- Sole-specialist patrol death: a sole-specialist holder
  with a deaths-list row kind=villager whose last
  delegateBeat pick before disappearance was 'patrol' on
  the death day (a patrol pick on the death day, in a
  part before the beat where the holder vanishes from the
  roster). Cause is taken from the deaths row: 'monster'
  (and 'combat'/'ambush' where the row names them) =
  combat; 'sickness', 'contest', wound phrasings, and all
  other causes = other, each named verbatim.
- HP at death: the pre-beat snapshot HP on the death-day
  patrol beat (the last recorded HP before disappearance).
- Days out: (i) days from first-kill day to death day,
  (ii) distinct patrol days before death, (iii) patrol
  picks before death. All three are reported; none is
  silently substituted for another.
- Truncation: per seed-leg-skill, village-wide delegate
  picks of that skill split at the holder's death day
  (before vs after), PLUS empty-days: days after the
  death day to run end on which the village records zero
  delegate picks of that skill, over total post-death
  days. A holder who survives gets a survival-row
  instead: totals and empty-days over the whole run.
- RETREAT-80 (the ONE counterfactual retreat rule, stated
  here before any judged sim): a sole specialist does not
  take a patrol pick when pre-beat HP < 80 (patrol only at
  HP >= 80). A sole-specialist patrol death counts as
  RETREAT-80-SAVED iff its death-day patrol beat's
  pre-beat HP was < 80 — i.e. the rule would have kept
  the holder home on the fatal day. This is a
  kept-home-that-day count, NOT a claim the holder would
  have lived to run end: a holder kept home one day can
  still die on a later patrol. The evidence states this
  limit wherever the count appears. The analyzer ALSO
  reports the full HP distribution of fatal patrols
  (so a reader can see whether ANY HP threshold would
  have mattered) — but only RETREAT-80 is the judged
  counterfactual; no other threshold is scored.

## Primary metric (DIAG completeness, not lever efficacy)

No lever efficacy is judged here. DIAG-GO iff ALL of:
1. Pilot (8 seeds) completes on BOTH legs with
   instrument errors 0 on every seed.
2. Every sole-specialist patrol death on both legs is
   classified (cause verbatim, HP at death, days out —
   all three legs of the definition present, or the
   death is listed as unclassifiable WITH the missing
   field named; unclassifiable deaths count against
   this bar, they do not vanish).
3. Truncation is quantified on BOTH legs: for every
   sole-specialist holder (died or survived), skill
   totals AND empty-days are reported; no sole holder
   row is missing a leg.
4. Sole-coverage census complete: per seed per leg per
   skill (mend, cook), provider count + whether a
   kills-holder is the sole provider — no seed-leg-skill
   cell blank.
5. RETREAT-80 counted from the logs on both legs
   (saved / total sole-specialist patrol deaths, with
   the kept-home-that-day limit stated).
6. Proof test scripts/test-soleprotect-20261031.js
   GREEN (synthetic analyzer cases + corpus-structure
   reconciliation for both legs).
7. Instrument revert verified byte-identical to base
   before the landing commit (git diff of
   scripts/policies/delegate.js empty, hash equal to
   base blob).
8. Sense read: transcripts of at least 2
   sole-specialist patrol deaths AND one surviving
   holder's patrol, judged for meaning, coherence,
   relevance — never just counts.

A miss on any clause is DIAG-NO-GO, never re-scored
mid-run (§14). Metric doubts go under "metric review"
for the NEXT run. A DIAG-NO-GO still lands its evidence
and census (a measured incompleteness is a result); it
must not be re-labeled DIAG-GO by dropping a clause.

## What is NOT judged

- No lever efficacy: diversion rates, guardrail floors,
  win/national movement are reported as context where
  observable, never as GO/NO-GO for a lever (there is
  no lever in this arm).
- Wall numbers (national/table/wins, wave 1-5 reach,
  median/max survival) are reported where observable on
  this substrate, never as 0s where unobservable. Arc
  II/III/IV reach, four-realm formation, trap
  acquisition by source, counter discovery/counter-kill
  rates, and young-link succession survival are NOT
  instrumented in this substrate and are NOT reported.
- Dangerfit's corpus is NOT re-judged; its numbers
  appear only as prior-base context, labeled as such.
  Judged numbers come ONLY from this run's two legs on
  this base.
- Trajectories WILL diverge between legs after the first
  kill (the instrument draws policy RNG where the
  baseline drew none for fit-routed killers). Legs are
  paired by seed + stack, not trajectory-identical.

## Split-guardrail proposal (deliverable, not judged)

The evidence ends with a split-guardrail proposal for
the NEXT build arm, with numbers from this census:
separate diversion-rate bars (post-kill fit share, from
the census) from death-truncation bars (holder-alive
or backup-coverage conditions, from the census), each
with a numeric bar grounded in the measured values —
not invented thresholds.

## Metric review

(To be filled at end of run; never a re-score of this run.)
