# sim-raidname-b1-b — the staged-B1 leg in live sims (backlog #1454 next step)

Run: oversight-flesh-out-loop-b, arm sim-raidname-b1-b
(run fleshout-loop-b-20261030T0130Z).
Claims the standing next step of findings-backlog #1451
residual (2) ONLY (the coordinator marks the backlog —
this arm does not edit the backlog file). This arm is
DIAG ONLY: zero src/js changes, zero default flips,
zero game-mechanism changes. A fix is documented as a
recommendation, never built mid-run.

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-29/sim-raidname-b1-b-prereg.md, committed as eb6c24431 BEFORE any judged leg)

**DIAG-GO — the B1 misfire reproduces in live sims, 9 out of 9 times.**

- Staged configurations: **9** (minimum-n 8 met; pilot
  4/8 seeds, confirm extension 5/8 more seeds, 16
  seeds total, band 10710–10725, within the 40-seed
  budget — no further seeds needed).
- Misfire rate: **9/9 = 1.000** (bar: >= 0.75).
  Every staged fight carried the raid line via path
  (b) with the pending shadow null at entry
  (pendingMatch false on all 9) and the tile entity
  raidBorn of the same species (entityMatchCandidate
  true on all 9) — while the pending was, by
  construction, a non-raid wanderer-style pending
  written by the driver, never by havenRaidTick.
- Unclassified staged fights: **0**. Staging misses:
  **0**. Pre-staging determinism: identical OFF vs ON
  fight sequences on all 9 staged seeds (0
  mismatches) — the driver did not perturb any
  trajectory before the staging moment.
- Proof: `node scripts/test-raidname-b1-b.js` —
  RESULT pass=14 fail=0 skip=0 on the judged corpora.

What this closes and what it does not: the
fixture-only caveat is now LIVE-PROVEN. Given the
B1 configuration in a real sim trajectory, the
narration misfires deterministically — it is not a
fixture artifact. What is still open is only the
NATURAL coincidence rate: a genuine wanderer
pending resolving while a raidBorn lingerer sits on
the player tile. The blind band measured 0 such
coincidences in 40 seeds, and this leg does not
re-score that number — it measures the conditional
rate (given the configuration), which is 1.000.
The fix recommendation from collision-b stands
unchanged (provenance-gate path (b), consume-or-
clear the shadow on any startCombat pending-clear,
clear on exile/succession clears); landing it is a
later arm's work, not this measurement's.

## How staging worked (the intervention, stated exactly)

The driver (scripts/stage-raidname-b1-b.js) wraps
policy.upkeep. After the original upkeep returns,
once per seed at most, it checks: no live fight, no
pending, player alive, player-tile world monster
raidBorn and alive, raid shadow NULL. Only then it
writes exactly the wanderer path's pending
(pendingEncounter + pendingMonsterId = tile species,
pendingInTent false, shadow already null), and the
harness pending block resolves it via startCombat
in the same day iteration. The lingerer was never
created, moved, or edited by the driver — every
staged lingerer arose naturally from a real raid in
the live trajectory. Shadow-null gating means zero
shadow perturbation: no window was ever skipped
for a live shadow (skipped-shadow 0 across both
legs), and no staged fight could match path (a).

Natural opportunity windows (OFF leg, same seeds):
27 post-upkeep windows where a raidBorn entity sat
on the player tile with no pending/fight — the
linger half of the configuration is COMMON (every
window on the haven tile (4,4), player inside).
The pending half is what never coincides
naturally: 0 coincidences on the 40-seed blind
band, which is why staging the pending — and only
the pending — was the honest next measurement.

## Staged configurations (all 9, all creations, all haven tile, all inside)

| seed | loop-day | species (display) | tile entity HP | fighter HP | line | pendMatch | entCand |
|------|----------|-------------------|----------------|------------|------|-----------|---------|
| 10710 | 10 | gallowdeer (Highbeam Deer) | 43 | 167 | yes | no | yes |
| 10714 | 8 | gallowdeer (Highbeam Deer) | 107 | 154 | yes | no | yes |
| 10716 | 13 | anaconda_empress (The Anaconda Empress) | 50 | 106 | yes | no | yes |
| 10717 | 9 | cliffhanger (Cliffhanger) | 44 | 70 | yes | no | yes |
| 10719 | 12 | gallowdeer (Highbeam Deer) | 130 | 154 | yes | no | yes |
| 10720 | 9 | anaconda_empress (The Anaconda Empress) | 50 | 110 | yes | no | yes |
| 10722 | 11 | sanjun (The Mountain Lord) | 17 | 82 | yes | no | yes |
| 10724 | 9 | hushwolf (Hushpuppy pack) | 12 | 54–63 | yes | no | yes |
| 10725 | 11 | hushwolf (Hushpuppy pack) | 14 | 51–59 | yes | no | yes |

The HP columns are the mechanism made visible: the
tile entity is a worn raider (12–130 HP) while the
fighter is a fresh instantiation (51–167 HP). The
fight is not against the tile entity — yet the line
names it as raid-born because the tile entity's
species matches. All 9 staged origins carry
lingering=false: these are drafted raiders sitting
on the haven tile, not siege lingerers — the B1
configuration in live sims is a raidBorn tile
entity, lingering flag not required.

## Sense (full staged fight tail read end to end — SENSE-TESTING LAW)

Seed 10710, loop-day 10, gallowdeer/Highbeam Deer
(full 120-line tail in
sim-raidname-b1-b-corpus-on/stage-b1-b-insideevening-s10710.json,
stagedSayFull): the village is rattled, the deer
intro fires, villagers join, the raid line lands
last at fight start — then a long, coherent,
brutal fight in which the deer kills the player
(Jason Palmer falls to the beam; the mantle passes
to Natalie Gonzalez mid-tail, with the succession
beats reading as earned grief, not noise).

Sense verdict: PASS as prose, FAIL as honesty —
which is exactly the caveat's shape. Nothing in
the 120 lines betrays the misattribution: a player
reading this would believe, completely reasonably,
that the deer that killed Jason came with the raid
on Haven. In fact the fight was a staged wanderer
pending against a fresh 167-HP deer, while the
actual raid-born deer on the tile had 43 HP. The
misfire is invisible in prose and detectable only
by provenance — and here it attaches a false raid
origin to a player death and succession. That is
why the 9/9 rate matters more than the blind
band's 0: when the configuration occurs, the game
tells a confident, smooth, wrong story about it.

## Village assessment (plain words, within what 30-day instances can say)

Sixteen month-long villages on the insideevening
shape: the player comes home, sleeps in the hall,
and raid-born entities sit on the haven tile on
27 counted windows — raiders do not just visit,
they stay on the doorstep. The staged leg adds the
missing sentence to that picture: when a wanderer
fight resolves against that doorstep, the game
calls it a raid fight, 9 times out of 9. Blank
filled: the B1 misfire rate given the
configuration, measured in live trajectories with
pre-staging determinism intact. Blank documented,
not filled: the fix itself (provenance gate), and
the natural coincidence rate of wanderer pendings
with lingerer windows (still 0 on the blind band;
the OFF windows here count lingerer presence, not
coincidence).

## Wall numbers (30-day legs, report-only, never judged)

- National / table / wins: NOT OBSERVABLE inside
  30-day instances — reported as not claimed, never
  as zeros. Scale stays 'village' on 16/16 seeds,
  standing 0 on 16/16.
- Wave reach: max wave unlocked 1 on 4 seeds, 2 on
  12 seeds; wave 4–5 reach 0. Median survival: 30
  loop-days; max 30. Total fights on the ON corpus:
  51 (16 seeds). One village-lost (10714, day 22)
  on both legs.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, by the
same pre-registered analogy as raidname-b and
collision-b: this leg is a diagnosis on 30-day
instances, and panel metrics (national / table /
wins, wave reach) cannot move — and cannot even be
observed — inside 30-day instances. The judged
instrument is the staged corpus on identical seeds,
and the pre-registered DIAG bars are the judge.

## Metric review (MEASUREMENT.md §14)

- Judged ONLY against the prereg as committed
  before any judged leg. No band, substrate,
  threshold, staging clause, or classification rule
  changed mid-run. Pilot (8 seeds, 4/4 misfires)
  passed the sniff test and the confirm extension
  ran in band order to the 8-config floor (9
  configs on 16 seeds); no seeds beyond 10725 were
  run, and the 40-seed budget was not needed.
- No instrument corrections during the judged legs.
  Two design choices, both in the prereg, proved
  load-bearing and are recorded for the next arm:
  (1) shadow-null gating — no staged fight could
  match path (a), so all 9 misfires are pure (b)
  misfires with no (a)/(b) ambiguity; (2) one-
  monster-per-tile in live sims — the fixture's
  bystander-shadowing note never arose, because
  the tile monster IS startCombat's _origin in a
  live sim.
- No revision proposed for the next run's metric
  except: the next raid-narration arm that lands a
  fix should re-run this staged leg as its
  regression (same prereg, same band order) and
  pre-register the expected post-fix rate (0/8 or
  better) — the staged corpus is now the
  regression instrument for the provenance gate.
- Quick check: NOT run, deliberately (same
  reasoning as collision-b). This arm changes no
  src/js file, so the repo quick suite cannot move;
  the relevant gates are the proof test (green,
  below) and node --check on the three scripts
  (clean). The base quick-check state (284 passed
  / 6 failed, identical failing set, per
  raidname-b) is unchanged by anything in this arm.

## Proof

- `node scripts/test-raidname-b1-b.js --corpus
  evidence/2026-10-29/sim-raidname-b1-b-corpus-on
  --base-corpus
  evidence/2026-10-29/sim-raidname-b1-b-corpus-off`
  — PROOF-GREEN: synthetic classification cases
  (misfire / non-misfire / isolation-broken /
  snapshot-fail / missing-tail / null, 7 pass) +
  corpus invariants (seeds >= 8, staged events
  accounted, 0 unclassified, determinism clean,
  entry snapshots verified, staged full say tail
  present, verdict recomputed). RESULT pass=14
  fail=0 skip=0.
- Judged analysis: `node scripts/analyze-raidname-b1-b.js
  --corpus evidence/2026-10-29/sim-raidname-b1-b-corpus-on
  --base-corpus evidence/2026-10-29/sim-raidname-b1-b-corpus-off
  --out evidence/2026-10-29/sim-raidname-b1-b-analysis.json`
  (16 seeds, 9 staged, 9 misfires, rate 1.000,
  verdict DIAG-GO, det mismatches [], windows ON
  26 / OFF 27, skipped-shadow 0). Pilot analysis
  preserved at
  evidence/2026-10-29/sim-raidname-b1-b-pilot-analysis.json
  (8 seeds, 4 staged, 4 misfires).
- `node --check` clean on scripts/stage-raidname-b1-b.js,
  scripts/analyze-raidname-b1-b.js,
  scripts/test-raidname-b1-b.js.
- Corpora: evidence/2026-10-29/
  sim-raidname-b1-b-corpus-off/ (16 files),
  sim-raidname-b1-b-corpus-on/ (16 files).
  Driver: scripts/stage-raidname-b1-b.js. Analyzer:
  scripts/analyze-raidname-b1-b.js. Proof:
  scripts/test-raidname-b1-b.js. Prereg:
  evidence/2026-10-29/sim-raidname-b1-b-prereg.md
  (eb6c24431, before any judged leg); instruments
  11be49d55 (before any judged leg).
- No [needs-eyes]: DIAG-only, no player-facing
  text changes, no game-code change. The raidname
  wording commit's [needs-eyes] (browser ordering)
  is untouched and still stands.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [for coordinator: #1451 residual (2) is now
  LIVE-PROVEN, not just fixture-proven] Staged-B1
  leg, 16 seeds, 9 staged configurations, 9/9
  misfires, 0 unclassified, determinism clean,
  proof green. Recommended marking: measurement
  COMPLETE with DIAG-GO; the caveat itself stays
  open until the provenance-gate fix lands (a later
  arm's work — this arm built its regression
  instrument: re-run this staged leg post-fix and
  expect 0/8+). Do NOT mark the caveat closed on
  this measurement alone: the measurement proves
  the bug, it does not fix it. The natural
  coincidence rate remains the blind band's 0/40
  seeds — frequency-open in the wild, deterministic
  given the configuration.
- [method note for future raid-narration arms]
  Staging one wanderer pending at a verified
  shadow-null raidBorn-on-tile window reproduces
  the fixture mechanism in live trajectories with
  pre-staging determinism intact — this is the
  template for regression-testing any (b)-path fix.
  The HP gap (worn tile entity vs fresh fighter)
  is a useful secondary signature in staged
  records.

## Convergence line

raidname-b1-staged — DIAG-GO: on band 10710–10725
(16 seeds, 30d, insideevening) the staged-B1 leg
stages 9 configurations (pilot 4 + confirm 5) and
misfires on 9/9 (rate 1.000, bar >= 0.75), 0
unclassified, 0 staging misses, pre-staging
determinism identical on all 9 staged seeds, proof
PROOF-GREEN (14 pass, 0 fail); every staged fight
is a haven-tile creation against a naturally
arisen raidBorn entity (HP 12–130) fought as a
fresh instantiation (HP 51–167) under a staged
non-raid pending with the shadow null; sense read
(10710, 120-line tail) shows the misattribution
is invisible in prose and attaches a false raid
origin to a player death; wall numbers on the
band: national/table/wins NOT OBSERVABLE (30d),
wave 4–5 reach 0, median survival 30. DIAG-only,
no game change; fix recommendation stands
(provenance gate) with this staged leg as its
regression instrument.

## Verdict (judged against the pre-registered bar, not re-scored): DIAG-GO
