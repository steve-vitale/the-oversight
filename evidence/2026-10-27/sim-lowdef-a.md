# sim-lowdef-a — lower-defiance substrate screen: SCREEN-NEGATIVE

Run: flesh-out loop, axis scale-onramp. Worker: sim-lowdef-a
(run fleshout-20261027T1816Z).
Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-lowdef-a-prereg.md (commit c7c13b9e).
Corpus: evidence/2026-10-27/perseed-lowdef-a/ (48 per-seed rows +
summary-band-A/B/C.json; summary.json itself is band C's copy —
the per-band copies are authoritative). Proof:
scripts/test-lowdef-a.js — ALL APPLICABLE PROOFS PASS
(--require A,B,C). Det-gate: PASS (seed 76101, door-off days 180/181
== baseline 180/181, no dp counters). No src/js touched. The two new
policy files built for this screen (tableseat-leanlink,
tablepaths-leanlink) are DELETED in the final commit, per the prereg's
killed-arms rule — the screen is negative, so they leave no trace.
The sweep and proof scripts stay as the measurement record.

Verdict: **SCREEN-NEGATIVE** — judged only against the binding prereg.
No candidate band qualified, so Phase 2 was never run, no live
fallback-feared test was forced, and no band beyond the three
pre-registered ones was screened. Rule (3) (fallback-feared) stays
unit-proven only, exactly as after 1631Z and 1715Z.

## Plain words

The last two attempts could not test the "only feared is offered, take
feared" rule because every village that reached the table had already
earned defiance, so the rule took defiance instead. This run hunted
for a different kind of village: one that reaches the table WITHOUT
earning defiance, by removing the courtship's pantry-draining tend
habit — the idea being that villages with fuller pantries would finish
more of the audience's trials instead of letting them expire, and
expired trials are what puts defiance on the record. It did not work.
Across three fresh batches of eight villages, 8 reached the table and
all 8 had earned defiance — one of them only just (a score of 4,
exactly the threshold), the rest 6 to 13. The tend-free villages also
reached national less often than the tend-kept ones, so the hunt got
fewer table visits to begin with. The rule itself is still untested
live, and the hunt now needs a village that actually finishes trials,
not just one with a slightly fuller pantry (see Metric review).

## Phase 0 — what was learned before sweeping (unjudged)

Ledger defiance comes from exactly four channels in code, and the
diagnostic (unjudged scratch script, diagnostic seeds 76901-76902,
never judged or re-scored) counted them: seed 76901 ended at defiance
7 = 7 trial expiries, 0 arena-defiance acts, 0 declined world feeds,
0 refused scales; seed 76902 ended at 11 = 11 trial expiries, 0/0/0.
The courtship never declines or refuses anything, and the harness
answers contests with choice 0, which never picks the one
contest-defiance option — so trial expiry is the only open channel,
and it starts early (first expiry days 13-22) and recurs roughly
every 9-13 days. Even a day-90 seating carries ~6 expiries. That is
why this screen's candidate had to move trial COMPLETION, not seating
speed — and why the tend removal, a small pantry effect, was the
best landed candidate but an honestly modest one.

## The screen (binding design, as pre-registered)

- Candidate substrate: leanlink courtship (cap 3, NO tends) under
  tableseat-nowait's seat legs, with tablepaths-defiant's door rule
  on top. Baseline tableseat-leanlink vs armed tablepaths-leanlink,
  identical seeds, 180d death-aware horizon, paired sweep.
- Three candidate bands, screened IN ORDER, screening stops at the
  first qualifying band: Band A 76101-76108, Band B 76301-76308,
  Band C 76501-76508. Freshness verified before sweeping: grep of
  evidence/2026-10-27/ found ZERO hits for any of the 24 seeds.
- Qualifying-band definition: seated >= 3 AND >= 2 seated seeds with
  defiance NOT offered ('defiant' absent from the paths-phase offer
  list). A non-qualifying band's fallback-feared count is recorded
  but NEVER judged (anti-cherry-picking rule, followed: no band
  qualified, so no Phase 2 judgement exists at all).
- Seeds 74201-74208, 74601-74608, 74801-74808, 75701-75708, and
  diagnostic 76901-76902 were NOT re-swept or re-scored.

## Results

| band | seated (armed) | no-defiance seated | qualifies? | fallback-feared |
|------|---------------|--------------------|------------|-----------------|
| A 76101-76108 | 1/8 | 0 | NO (needs seated >= 3 AND >= 2) | 0 |
| B 76301-76308 | 3/8 | 0 | NO (seated minimum met, needs >= 2) | 0 |
| C 76501-76508 | 4/8 | 0 | NO (seated minimum met, needs >= 2) | 0 |
| TOTAL | 8/24 | 0/8 seated | — | 0 |

Every seated armed row took rule 'defiant' (defiance offered, picked
defiant, won). Defiance values on the record at seating: A: 13; B: 4,
6, 8; C: 13, 6, 7, 11 — all at or above the >= 4 threshold. The 4 on
76304 is the lowest defiance ever seen at a seating in this line
(previous floor 5); it still earns the door, so it does not count as
a no-defiance seat. No seated row shows rule 'fallback-non-feared'
or 'fallback-feared'; no no-defiance seated seed exists anywhere in
the screen to even reach rule (2), let alone rule (3).

Per-seed detail (armed leg; baseline identical except the door —
baseline entered feared on every seed the armed leg entered defiant
on, won on the same seeds, same seat day):

- Band A: seated 76108 only (defiant 13/won, day 170, lesser). Non-seated:
  76101 (survived, reached table flag, never entered), 76102
  (survived, national ever, no table), 76103 (lost day 116, table
  flag, never entered), 76104 (survived, no table), 76105 (survived,
  national final, no table), 76106 (lost day 163, table flag, never
  entered), 76107 (lost day 61, never left village rank).
- Band B: seated 76304 (defiant 4/won, day 106, lesser), 76306
  (defiant 6/won, day 147, lesser), 76307 (defiant 8/won, day 99,
  lesser). Non-seated: 76301 (lost day 34, 4 starvation deaths, the
  band's early collapse), 76302 (survived, national ever), 76303
  (lost day 97, table flag, never entered), 76305 (survived, table
  flag, never entered), 76308 (survived, national final, no table).
- Band C: seated 76501 (defiant 13/won, day 164, lesser), 76503
  (defiant 6/won, day 94, lesser), 76504 (defiant 7/won, day 97,
  lesser), 76507 (defiant 11/won, day 142, lesser). Non-seated: 76502
  (lost day 162, reached WAVE 5, never seated — the screen's only
  wave-5 unlock, and it never saw the table), 76505 (lost day 66),
  76506 (lost day 178, national ever, no table), 76508 (lost day 95).

## Wall numbers (armed legs; baseline identical except door)

| band | national ever | national final | table | wins | wave 4 | wave 5 | median days |
|------|--------------|---------------|-------|------|--------|--------|-------------|
| A | 3/8 | 2/8 | 4/8 | 1/8 | 5/8 | 0/8 | 180 |
| B | 5/8 | 4/8 | 5/8 | 3/8 | 2/8 | 0/8 | 147 |
| C | 5/8 | 4/8 | 5/8 | 4/8 | 6/8 | 1/8 | 142 |
| TOTAL | 13/24 | 10/24 | 14/24 | 8/24 | 13/24 | 1/24 | — |

All 8 seatings lesser; NO full seat anywhere on any band. Starvation
totals (both legs identical per seed): A 6, B 8, C 3 — the door
changes nothing about starvation, days, or deaths on any seed, which
is the leak-gate result, not a finding about the door. Death totals
(both legs identical): A 278, B 251, C 267 = 796. Death-cause shares
(24 armed seeds): villager combat 324, villager-vs-villager combat
195, player arena deaths 108, expeditions 40, wounds that wouldn't
close 26, villager sickness 24, monster kills 19, starvation 16 (+1
player starvation in band B). Combat, not hunger, is what kills
villages on this substrate — the same shape as the 1715Z bands.

Substrate comparison (for the axis, not judged): leanlink reached
national ever 13/24 vs leanlinkrescue's 21/24 on the 1715Z bands, and
seated 8/24 vs 9/24. Removing tends did NOT buy seatings — it cost
national holds (fewer seasoned links surviving to national), which
is the opposite of what a screen wants. The defiance floor did move
(4 vs 5), but no seed crossed under it. Tend removal is therefore a
weak lever on both axes that matter here: fewer national villages,
barely lower defiance.

## Proof gates (as pre-registered)

- G-det: PASS (seed 76101: baseline 180/181 == door-off 180/181,
  dp={}). Required here because the policy pair was new; it pins
  that the door layer off delegates exactly.
- G-screen: PASS on all three bands (16/16 rows each, no zero-day
  rows, counters present; the sweep's G3).
- G-offer: PASS on all 8 seated armed rows (proof script): every
  'defiant'-rule row shows 'defiant' in its offer list and picks
  defiant, every earned snapshot's defiant.earned matches offer
  inclusion, every fallbackFeared flag matches its doorRule (all 0).
  No seated row exists for the fallback branches to check against —
  that absence IS the screen result, not a gap in the check.
- G-leak: PASS on all three bands (non-seated seeds identical
  days/gameDays between legs: A 7/7, B 5/5, C 4/4 comparable seeds).
- Proof script: scripts/test-lowdef-a.js, run with
  --require A,B,C: ALL APPLICABLE PROOFS PASS, first qualifying
  band NONE.

## Sense test

No fallback-feared seating occurred, so no seating transcript is
claimed — the prereg's sense condition is explicitly unmet, not
faked. (No --sense replay was run as a seating, because there is no
seating to replay.) The defiant seatings on these bands read exactly
as in 1315Z/1631Z/1715Z (lesser, first-option answers after the door
pick); no new dialogue judgement is offered here.

## Village assessment — what the villages looked like

These were lean, quarrelsome villages. Most survived to the horizon
or died in combat, not starvation: only two early collapses in 24
seeds (76301 day 34, 76107 day 61), both small and starving, while the
rest lived 94-180 days and died — when they died — with swords in
their hands (combat deaths outnumber starvation deaths roughly 30 to
1). Pantries at the end ranged from empty (several lost villages at
0) to very full (76306 at ~90,000 kcal, 76307 at ~72,000) — full
pantries did not buy seatings by themselves: 76308 sat on ~40,000
kcal at national and never saw the table at all. What was missing
for the non-seated villages was not food but entry itself: 6 seeds
carried the table flag (tableWaiting) without ever entering (76101,
76103, 76106, 76303, 76305, 76502), and 76502 reached wave 5 and
carried the flag but never entered. Rank and seating stay decoupled,
as in prior bands: national is common (13/24 ever), the seat is not
(8/24), the full seat is nowhere (0/24). Who thrived: the seated
eight, all of whom walked defiant and won — defiance, once earned,
is a winning door, not a losing one. Who died and why: combat first
(519 of 796 deaths are combat-shaped), then expeditions and sickness;
starvation is a minor cause here, which cuts against the standing
"villages starve mid-ambition" story on THIS substrate — on leanlink
bands the binding constraint looks more like invitation scarcity and
combat attrition than food.

## Blanks filled or documented

- FILLED (measurement): the defiance-composition question from
  1715Z's metric review is now answered with counted channels —
  defiance at seating is trial expiries, not refusals, declines, or
  contest defiance. Any future low-defiance attempt must move trial
  completion; this evidence names that mechanism and its numbers.
- FILLED (instrument, then removed): the leanlink seat+door pair was
  built, det-gated, and screened — then deleted per the killed-arms
  rule, so the tree carries no dead substrate.
- DOCUMENTED (not filled): rule (3) fallback-feared is still
  unit-proven only. The tend-free substrate does not produce
  no-defiance seatings. The wave-5-with-flag-but-no-entry case (76502) and the
  table-flag-without-entry cases are scale-wall data points for the
  axis, not this arm's target, and were not investigated further.

## Metric review

- The pre-registered metric held with no mid-run re-score. The
  SCREEN-NEGATIVE branch was written before the sweep precisely for
  this outcome, and it was followed: all three bands screened, none
  qualified, no fourth band, no forced door, no re-scoring of
  74201-74208, 74601-74608, 74801-74808, 75701-75708, or diagnostic
  76901-76902.
- What the screen actually learned (for the NEXT run's prereg, not
  this one): (1) Tend removal moves the defiance floor by ~1 (5→4)
  but cannot cross it, because expiries accrue ~1 per 10 days from
  early on and a seating needs <4 after 90+ days — that requires
  completing roughly two-thirds of trials, not shaving one pantry
  drain. A future arm wanting a live rule-(3) firing should build a
  trial-completing player (a policy that chases active trials: haul
  hard and identify fast while a trial is open) and pre-register it
  as a NEW substrate with its own det-gate — not another landed
  courtship. Whether such a player is a fair rule-(3) test (it plays
  genuinely, it just prioritizes trials) is the next arm's design
  question to answer in its prereg. (2) The seated minimum and the
  no-defiance minimum interact harshly on low-seating substrates —
  band A (1 seated) could never qualify no matter what its one
  seating showed, as in 1715Z band B. A future prereg might screen on
  seated seeds pooled differently, but that revision must be written
  BEFORE its sweep, not applied retroactively to these bands.
- A second weakness, also for the next run: this screen's candidate
  was chosen for defiance, but it also weakened national reach
  (13/24 vs 21/24) — a future candidate must be screened for seat
  RATE as well as defiance, or it will starve the screen of seatings
  to judge.
- Balanced panel (§15): no panel artifact — scripts/balance-panel.js
  has NO corpus-ingest mode for this corpus (its modes are its own
  observer/compare; no per-seed-corpus ingest flag exists), so none
  was produced and none faked. The before/after per-seed comparison
  above IS the comparison, as in 1631Z and 1715Z. The sweep's own
  VERDICT field on each band (GO, on defiant entered) is the DEFIANT
  verdict and was NOT used as this run's verdict.

## Findings note (for the coordinator; NOT acted on)

- Scale wall, unchanged in shape: national ever 13/24 but table
  14/24, wins 8/24, full seat 0/24, wave 5 1/24. Villages reach
  national and even wave 5 and the table flag without ever entering
  (76502), and reach the table flag without ever entering on 6 seeds
  total — rank, invitation, and entry remain three different things.
- Band B's first-attempt sweep died mid-armed-leg (exec session lost
  after 76301-armed, no node process left running, no error
  captured). The band was re-swept in full from the same seeds and
  code; the re-run completed cleanly (exit 0, all gates pass) and its
  corpus is a single coherent run — the partial first-attempt rows
  were overwritten, not blended. The re-run is the corpus of record
  for band B. No evidence of non-determinism in the final corpus:
  baseline/armed legs match exactly on every non-seated seed
  (G-leak), as in every band.

## Loud failures / deviations (none hidden)

- The safe-commit index clobber class (AGENTS.md, 2026-10-22/23)
  struck the prereg commit: HEAD held the correct commit while the
  main index showed bogus staged deletions. Repaired the same way as
  documented (`git update-index --add --cacheinfo` with the HEAD
  blob per file), then verified `git status --short` empty,
  `git diff HEAD` empty, and hash-object == HEAD blob before any
  judged sweep started. The judged sweeps ran AFTER the repair, on a
  clean tree, with the prereg already committed.
- Band B first-attempt sweep loss (above): recovered by full re-sweep;
  no partial corpus blended.
- No EPERM flap blocked any commit or sweep write. No push, no
  version bump, no live verification — merging to local master is
  the coordinator's job, and this arm reports ready-to-merge,
  pending coordinator.
- Sibling trees untouched; no other worktree or registry entry
  touched.

## Files

- Prereg: evidence/2026-10-27/sim-lowdef-a-prereg.md
  (committed c7c13b9e, before any judged sweep)
- Evidence (this file): evidence/2026-10-27/sim-lowdef-a.md
- Corpus: evidence/2026-10-27/perseed-lowdef-a/ (48
  per-seed rows + summary-band-A/B/C.json; summary.json = band C)
- Proof: scripts/test-lowdef-a.js
- Sweep (measurement record): scripts/test-lowdef-a-sweep.js
- DELETED (killed arm, no trace): scripts/policies/tableseat-leanlink.js,
  scripts/policies/tablepaths-leanlink.js
- Untouched: scripts/policies/tablepaths-defiant.js,
  scripts/policies/tableseat-nowait.js, scripts/policies/leanlink.js,
  scripts/policies/leanlinkrescue.js, every src/js file.
