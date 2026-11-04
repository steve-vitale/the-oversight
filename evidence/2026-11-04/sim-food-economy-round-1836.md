# Food-economy round 1836 — coordinator evidence (run fleshout-20261104T1836Z)

Axis: food-economy (second non-converged axis). Scale-onramp was
live-claimed by sibling Loop B at run start (claim
fleshout-loop-b-20261104T1735Z, arms sim-tendfloor-guard-b +
sim-tendbelow-b; tendbelow heartbeat 10 minutes old at run start)
and was NOT touched. Loop B's claim closed mid-run on its own
landing (local master a32735f13: tendfloor-guard adoption NO-GO +
tendbelow PILOT GO, coordinator evidence
sim-winnability-round-1735); nothing of Loop B's was touched at
any point. Rotation file reads 3 (villager agency) and was NOT
advanced: the convergence-directed plan overrides the rotation,
and this run worked the topmost non-converged unclaimed axis.
Pre-flight clean (main tree empty, disk 27%, reaper removed
nothing sibling-owned). Claim written before any sims; deleted at
closeout. Lock deleted at closeout.

Pre-registration: each arm's binding prereg was committed before
any judged sim (exphurt-24 d296eff4c, bankretain-rerun 8402562bd
after rebase). No gate, price, deed bar, or win price changed in
either arm. No game-code change at all in this run (both arms
measurement-only). No push, no version bump, no live verification
(ship loop owns deploys). Merged locally, pending ship.

## Arm 1 — sim-exphurt-24-a: GO (SPEC-READY)

Question: the 1647Z next-blank 1 — EXPHURT 24-seed single band on
the same instrument, gate on instrument health, judged on M1 ≤
0.20 / D-last denominator ≥ 8. Verdict: GO. The drafted
hurt-clause spec (text-only hurt clause appended to
expeditionReturn's playerAtHaven homecoming line when the
returnee's hp at return is 1..7) is SPEC-READY for a future
landing arm. This arm landed no hook and no game code.

- Fresh band 99933–99956 (24 seeds), competent policy, 100d
  death-aware cap, PLENTYDEPRI=1, DEPOSITGATE=1, event-based
  instrument reused from the confirm arm (hurthome-b-lib,
  exphurt-a-lib, exphurt-confirm-a-lib; new sweep script
  refusing all other seed lists, analyzer copy, proof test
  22/22 green before judged sims and re-run green after rebase).
- Instrument-health gate (the only gate): PASS — 24/24 seeds
  complete, errors 0, unclassified 0 (all 55 cases in exactly one
  outcome bucket).
- Judged: expedition cases 20/24 seeds (0.83/seed, above the
  pooled prior 0.50/seed — the pooled-rate budget is why this
  band cleared the bar where two staged pilots stopped). D-last
  denominator 20 (bar ≥ 8, met 2.5×). M1 0/16 = 0.000 (GO bar
  ≤ 0.20): not one announced expedition homecoming line
  mentions hurt. M1-all 0/17, M2 16/17, M3 16/17. D-open 3/20
  and D-last 3/20 (same 3 cases: Owen s99943 gap 4, Carolina
  s99948 gap 14, Mateo s99951 gap 17 — no during-episode
  divergence this band). Latency descriptive only (4 at 0 parts,
  13 at 1 part).
- Sense test (quoted pairs in arm evidence): all 16 announced
  returns follow the identical pattern — a true hurt line, then
  a celebration that erases it in the same tick (Carolina at hp
  1 remembered as "6 stories, a new scar"). The disconnect is
  now measured, not just directional: descriptive pooling
  across all three arms is M1 0/23 announced expedition
  returns (NOT a judged pooling).
- Wall (diag corpus, stated plainly): survived to 100d 8/24,
  median daysAlive 88, max 100; wave 4 on 14/24, wave 3 on 8/24,
  wave 2 on 2/24, wave 5 on 0/24; national / table / wins 0/24.
  Deaths 283: "the wild" 41.0%, monster 20.5%, starvation 9.9%,
  sickness 7.1%, "a wound that wouldn't close" 4.9%.
- Commits (rebased onto a32735f13, files byte-identical across
  rebase): d296eff4c prereg, b40ef9c20 instruments, 85123a056
  evidence + corpus (24 per-seed JSONs + sweep summary/log/
  analyzer output).
- Out-of-scope, carried to the backlog: (1) one silent
  player-at-Haven expedition return (Bill, s99946, hp 2, zero
  closing-part lines despite playerAtHavenAtClose=true) —
  silence may not be purely a player-away phenomenon, or a
  capture gap on that close path; a landing arm must look
  before assuming otherwise. (2) Walk-out `leave` cases carry
  sentinel awayDuration 999. (3) Death-cause "the wild" is a
  bucket, not a cause.

## Arm 2 — sim-bankretain-rerun-a: INSUFFICIENT-DATA (SUBSTRATE-MISSING)

Question: the 1647Z next-blank 2 — bank-retention re-run on
current master with the redefined event (edible pack at a
stranded evening → true morning, carried or banked) plus the
upkeep-eat mechanism decision, to confirm the 0-judged count
holds post-twins before any retention claim. Verdict:
INSUFFICIENT-DATA (§14a SUBSTRATE-MISSING), second consecutive
run. No retention claim, no vanish claim, no fix.

- Same 16-seed band as bankretain-a (15003, 15009, 15091,
  15211, 15215, 15220, 15221, 15337, 15376, 15439,
  16501–16506), 60d death-aware, guard + ON / off + variant
  legs, same env gates, policy and trace driver unchanged.
  New analyzer (carried-or-banked event, upkeep-eat
  accounting) + proof test 30/30 pure green before judged
  sims, corpus mode 110/110 per leg pre-rebase; proof re-run
  30/30 green after both rebases; worker files verified
  byte-identical across both rebases (empty diff on all 72
  worker files).
- Prereg mechanism decision (binding, before sims): morning
  upkeep competentEat IS the morning meal — edible present at
  the first-upkeep snapshot and then upkeep-eaten counts as
  RETAINED-then-eaten with the exact kcal chain, NOT vanished.
  Retained bar pre-registered as all-retained (a 2/3 majority
  bar was deliberately rejected in the prereg). Judge bar ≥ 3
  judged events (distinct events: seed + loop-day, not
  leg-instances — guard/ON legs reproduce identical events).
- Judged: 1 distinct event (both legs byte-identical), bar 3
  NOT met. The event: seed 16505 loop-day 59, carried 540 kcal
  Muscadine Grapes — post-bank edible 540 → first-upkeep
  edible 540 (scholar kcal 344) → daily-entry morning
  packBefore 0, kcalBefore 884, ate=false, skip
  'no-pack-food'. Chain exact: 884 − 344 = 540. Verdict at
  true morning: RETAINED; morning disposition: upkeep-eaten.
  Reported as 1/1 retained, NOT a verdict.
- Censored: seed 15003 loop-day 30, banked 195 kcal
  Blackberry — reproduced verbatim on current master, still
  censored a THIRD consecutive run because the village dies
  day 30 on all four legs; no horizon un-censors a bank made
  on the village's death day.
- Substrate: only 15003, 15376, 16505 strand at 60d; 13/16
  seeds never strand. All other bank/flip evenings end at
  post-bank edible 0 (lump-only/no-gain). In-stack edible
  stranded-evening pool is ~1 per 16 seeds.
- Revised neutrality guardrail PASSES: pre-action trajectory
  match on all 16 seeds × both leg-pairs; named divergence
  points 15003 day 24 (−14 kcal), 15376 day 8 (−72 kcal),
  16505 day 48 (−28 kcal); OFF-leg det-gate passes everywhere
  (errs 0, zero acted OFF evenings). The 15376 off-dies-49 /
  variant-survives-60 split reproduces and is a documented
  divergence, not a failure.
- Wall (observed, not attributed): median survival 60 days
  (census boundary, 11/16 at 60 per variant leg); wave reach 2
  on 2 seeds, 3 on 10, 4 on 4 (15221, 15439, 16501, 16502).
  Wins / national / table are NOT read by this corpus and
  are not claimed.
- check.js --quick: 284 passed, 6 failed in 785s — all 6
  pre-existing green-list failures unrelated to this arm
  (measurement-proof, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20 racks voice). Zero src/js changes, zero
  existing-script changes.
- Commits (rebased twice: onto a32735f13, then onto the
  exphurt tip 85123a056 after the sequential-merge ff block —
  see Infrastructure): 8402562bd prereg + analyzer + proof,
  be1bb1713 evidence + 64 corpora + 4 sweep logs.
- Out-of-scope, carried to the backlog: upkeep breakfast still
  silent on current master (judged 16505 case: 540 kcal meal,
  no line, morning phase skip 'no-pack-food') — deliberately
  left alone per this arm's scope; late-work line still
  hardcoded "at the creek" on forest_floor evenings
  (voice-only).

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-04/perseed-exphurt-24-a/*.json' --metrics
national,table,wins,exiled`. LOUD lines: national 12 → 0,
table 16 → 0, wins 16 → 0 (n=25 files). Verdict: EXPLAINED, not
a regression, baseline NOT rolled. The exphurt corpus is a 100d
hurt-narration diag corpus that reads 0/24 on all three by
design (rank village on all seeds; it cannot reach
national/table/wins). Same scope-mismatch class as 1445Z/1647Z.
No LOUD line for exiled. The bankretain corpus reads none of
the three metrics and was not run through the tool.

## Metric review (for the NEXT run)

- The pooled-rate budget works: 24 seeds at a pooled 0.50/seed
  delivered D-last 20 where 8- and 16-seed staged bands
  stopped. Future confirm arms should budget from pooled
  rates, not the latest band's rate, and gate on instrument
  health only when the unit is thin and variable.
- D-open vs D-last agreed exactly again (3/20, same cases);
  keep D-last judged, D-open for comparability. Keep the
  M1/M1-all/M2/M3 quartet; M1-all is still the only metric
  that can catch a silence branch, and this band produced a
  candidate silence case outside the player-away branch (Bill
  s99946) — the landing arm's proof must cover that close
  path before assuming silence is player-away-only.
- Bankretain's redefined event still yields ~1 judged event
  per 16 seeds. The census design is exhausted: a third run
  of the same census is PARKED, not planned. The next
  retention arm must change the substrate (strand-screened
  seed band or probe-given-food design) and must count
  distinct events, not leg-instances.
- The ≥ 3 judge bar held correctly twice — it prevented a
  retention claim from n=1 (twice) and from the single
  carried case. Keep it.

## Village assessment (plain words)

The villages in these runs mostly lived ordinary short lives
and died on schedule: hurt fighters came home and were
celebrated for their haul while the hurt itself went
unmentioned in every single announced homecoming line — that
blank is now proven on a full band, not just suggested, and
the words to fix it are drafted and ready. Stranded scholars
carried food through the night just fine; the morning meal got
eaten silently by the village's own upkeep before the morning
moment ever arrived, and that meal still has no line naming
it. Nobody reached beyond village standing in either corpus,
and no village faced the fifth wave. One blank is now ready
to be filled; the other has run out of census and needs a new
way of finding its mornings.

## Blanks filled or documented

Filled with a game change: none. Documented: (1) exphurt spec
now SPEC-READY (GO on an adequately-powered band); (2)
in-stack edible retention still OPEN after a second
substrate-missing run on current master, census design
parked; (3) upkeep-eat-as-morning-meal mechanism decision
recorded and applied (retained-then-eaten, not vanished);
(4) revised neutrality guardrail proven (pre-action match +
named divergence + OFF-leg det-gate); (5) new backlog items
(silent player-at-Haven return, creek line, census parked).

## Next blanks, in order — under the Nov 4 re-point

During this run the alignment synthesis refresh recorded a
Nov 4 approval: the food-economy loop is re-pointed at the
winnability chain, its food arms parked, with a standing rule
that no new measurement arm runs on an already-proven
constraint unless it carries a new lever to test. The next
run's planning must start from that re-point, not from this
run's food list alone. Candidates that carry a lever:

1. EXPHURT LAND arm (hook + matched-seed re-run judged at
   M1 ≥ 0.80 per the confirm prereg's LAND section) — carries
   the hook lever, so it qualifies under the new rule. Must
   first resolve the Bill s99946 silence case (capture gap
   vs real silence on the player-at-Haven close path).
2. Bankretain census: PARKED. No third census on this band.
   Any future retention arm must change the substrate
   (strand-screened band or probe-given-food) and justify
   itself under the new rule.
3. Upkeep-breakfast narration line (16505 shape) and
   stranded-scholar narration: parked under the re-point
   pending the next run's winnability-chain planning — they
   are fixes, not measurements, but the re-point governs
   what this loop picks up next.

## Convergence

food-economy stays converging (NOT converged): one arm
returned GO (SPEC-READY, not a landed game change) and one
returned INSUFFICIENT-DATA on a parked census design; no
food-economy default flipped, no balance change landed.
scale-onramp untouched by this run (sibling Loop B's axis;
its claim closed mid-run on its own landing).
Claim deleted; lock deleted at closeout.

## Infrastructure

- Sequential-merge ff block: after merging exphurt, the
  bankretain branch (forked from the same base) could not
  ff-merge; it was rebased onto the exphurt tip in its own
  worktree (worker files verified byte-identical across the
  rebase, proof 30/30 re-run green) and then ff-merged.
  No force, no conflict, no sibling work touched.
- Safe-commit index clobber struck in both worktrees
  (workers repaired via HEAD-blob cacheinfo each time;
  commits verified correct).
- Coordinator heartbeat script hung ~5 min on registry
  contention (sibling Loop B active throughout); its writes
  had landed (both trees 19:20:28Z) before it was stopped.
  No tree was at reaper risk (4h threshold).
- Sibling Loop B re-activated during closeout
  (sim-tendbelow-confirm-b, sim-standaccum-b trees) — not
  touched. Local master is ahead of origin/master (Loop B
  landings + this run, not yet pushed); origin/master is an
  ancestor of local master, no divergence — the ship loop
  owns the push.
- Main tree clean at closeout (verified after both merges +
  branch deletion + reap). No push, no bump, no live
  verification (ship loop owns deploys).
