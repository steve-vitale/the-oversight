# sim-lackingline-b — INSUFFICIENT-DATA: the staged still-refused evening did not occur in 60 seeds

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261029T1730Z,
arm sim-lackingline-b, axis food-economy. Worktree
sim-lackingline-b. MEASUREMENT ONLY: zero src/js changes,
zero policy retunes — scripts/policies/woodcarry.js is
untouched by this arm. This worker does NOT merge to master
— coordinator merges.

Prereg: evidence/2026-10-29/sim-lackingline-b-prereg.md
(committed e3b2d02f, before any judged leg). Judge (prereg,
unchanged): DIAG-GO requires >= 1 honestly-staged
still-refused ON creek evening whose played tail carries
the lacking-line for the actual skip reason with the named
number equal to the live classification number, plus
errs == 0, determinism byte-identical, OFF guard leg free
of lever lines, and a passing sense-test. A miss is never
re-scored. No post-hoc seeds were added after the screen
cap; the bar was never lowered and no refusal was faked.

## Verdict: INSUFFICIENT-DATA — 0 still-refused evenings in a 60-seed screen

| Check | Result | Bar |
|---|---|---|
| Seeds screened (sequential from 13300) | 60 (13300–13359) | cap 60 |
| Total evenings screened | 1,797 | — |
| Travel-refused evenings | 14 | — |
| ON creek evenings (bucket creek) | 3 | — |
| Still-refused ON creek evenings (PRIMARY) | 0 | >= 1 |
| Lacking-lines owed / fired in play | 0 / 0 | — |
| Unclassified (all 60 seeds) | 0 | == 0 for a judged evening (vacuous: none exists) |
| Classifier errs (all 60 seeds) | 0 | == 0 |
| Determinism re-run (seed 13336, ON) | byte-identical | identical |
| OFF guard leg | NOT RUN — no staged seed exists to guard | n/a |
| Sense-test on a played tail | NOT PERFORMED — no still-refused tail exists | NOT claimed as pass |

This is the fourth consecutive run in which the honesty
guard has nothing to guard: sim-woodcarry-b,
sim-woodcarry2-b, and sim-woodcarry3-b each had 0
still-refused ON creek evenings on their judged bands,
and this dedicated staging screen adds 60 more seeds
with the same 0. The lacking-line remains unit-proven
only (proof T1: wood line names the pack count and 4,
kcal line names kcal and 60, ticks line names ticks and
96). Findings backlog #1424 and #1444 stay OPEN — this
arm does NOT close them, and does not claim otherwise.

## The funnel: why no still-refused evening could occur

Evening outcomes across the 60 screened seeds (1,797
evenings):

| Outcome | Evenings | Share |
|---|---|---|
| completed (night spent inside) | 1,537 | 85.5% |
| already-inside | 182 | 10.1% |
| out-of-reach (haven never attempted) | 53 | 2.9% |
| travel-refused | 14 | 0.8% |
| blocked-combat | 8 | 0.4% |
| walk-interrupted-combat | 3 | 0.2% |

Of the 14 travel-refused evenings: creek 3, other-refused
11, unclassified 0. The funnel narrows twice before the
lacking-line can ever fire:

1. A refusal needs a hop ATTEMPT. Most outside nights
   never attempt one: 53 evenings end out-of-reach (the
   nighttravel hop is not tried when haven is out of
   reach), so no refusal, no classification, no line
   opportunity. Only 14 of 1,797 evenings (0.8%) even
   reach a travel refusal.
2. A creek refusal needs the lever to FAIL. On all 3
   creek evenings the lever's precondition held with
   huge margin (table below) — wood exactly 4, kcal in
   the thousands against a 60 floor, ticks above the 96
   floor — so every creek evening bridged, retried, and
   arrived home. The line is owed only when a gate
   binds, and no gate bound in 60 seeds.

## The 3 screened creek evenings (all rescued, no line owed)

| Seed | Loop-day | Wood | KcalLive | Ticks | Morning carry | Bridge | Retry | Rescued | Line |
|---|---|---|---|---|---|---|---|---|---|
| 13323 | 25 | 4 | 2246 | 239 | not-at-haven (slept out prior night) | built | arrived | yes | none (none owed) |
| 13327 | 30 | 4 | 2390 | 127 | already-carrying (pack held 4) | built | arrived | yes | none (none owed) |
| 13336 | 29 | 4 | 2390 | 127 | already-carrying (pack held 4) | built | arrived | yes | none (none owed) |

Notes on the table, verified against the raw corpus rows
(not just the analyzer): 13323's pack held 4 despite a
not-at-haven morning — the wood was carried on an
earlier day and never spent, so the prior night out did
not leave the pack short. 13327 and 13336 share
preStepKcal 2390 and dayTicks 385 (different blocked
tiles, 4,3 vs 4,6; different piles, 650 vs 177) — the
competent day's routine converges on the same
day-shape across seeds, which is an observation about
the policy's steady state, not a defect claim: kcal
sits near ~2400 at morning and the day consumes a
near-fixed tick budget, so kcal-short and ticks-short
evenings essentially require a food emergency or an
over-long day that competent play avoids. That is the
diagnosis, not an excuse: the gates the line names
are gates competent play almost never trips.

## Diagnosis: WHAT game state prevents a still-refused evening

Three facts, each measured, jointly explain the 0:

- CREEK HOPS ARE RARE. Creek-blocked hops are 3 of
  1,797 evenings (0.17%). Sequential ON screening is
  the wrong instrument for this line: it spends 60
  seeds to produce 3 creek evenings, all rescued.
- THE PRECONDITION HOLDS ONCE THE HOP EXISTS. The
  morning carry (or an earlier carry — wood is never
  spent once packed in these trajectories) puts 4 logs
  in the pack before any creek evening arrives, and
  competent play keeps kcal near ~2400 and evenings
  above 96 ticks. Wood-short needs a pack that LOST
  its wood or never got it on a day that ends at a
  creek; kcal-short needs a genuine food emergency;
  ticks-short needs a day longer than the competent
  routine's ~385 ticks. None occurred.
- BUILD/RETRY FAILURES ALSO NEVER OCCURRED. All 3
  builds succeeded and all 3 retries arrived, so the
  build-refused and retry-refused lines are equally
  unplayed. The unplayed-line gap covers every
  lacking-line variant, not just the gate-skip lines.

## What would stage it honestly (next-run note, NOT a claim)

The prereg's sequential-ON screen is spent; a next run
should NOT repeat it. Honest routes that stay inside
the staging rules (real game state, seed selection
only, no edited narration or state):

- BANK ON THE OFF LEG FIRST, as blockscreen2 did:
  screen seeds OFF for creek episodes, then run the
  banked seeds ON and inspect still-refused evenings.
  Banking on creek episodes (not on ON outcomes)
  multiplies the creek-evening yield per seed by an
  order of magnitude versus the 3-in-60 seen here.
- HUNT THE FAILURE MODES DIRECTLY: a creek evening
  whose morning was not-at-haven AND whose wood was
  spent the previous day; a food-emergency trajectory
  (a village sliding into starvation, cf. seed 13317's
  day-20–25 starvation cascade) that ends at a creek;
  a long-day trajectory whose refusal lands under 96
  ticks. Each is a seed-selection hunt, not a state
  edit — but each needs its own prereg, because
  selecting on the failure mode is exactly what this
  run's first-qualifying-seed rule was written to
  prevent from becoming cherry-picking.
- DO NOT stage by weakening the lever (e.g. disabling
  the morning carry) or by editing kcal/wood: that
  would manufacture the shortfall instead of finding
  it, and the resulting tail would prove nothing about
  the shipped line.

## Sense-testing (honest statement, not a vacuous pass)

NO played still-refused tail exists, so NO sense-test
on a played tail was performed. This is recorded as
NOT PERFORMED, never as passed: the unit lines read as
plain person-language in proof T1 ("the pack holds 2
logs, and a bridge needs 4"), but a unit string is not
a played evening, and the question the sense-testing
law asks — does the evening read as a person lacking
something, in context, with the day explaining how the
lack came about? — remains unanswered in play. The
gap #1424/#1444 names is still exactly this gap.

## Village assessment (plain words)

Sixty villages, thirty days each (one, 13317, lost at
day 28). Almost every night is spent inside — 1,719
of 1,797 evenings end at haven — and the nights spent
out are mostly out-of-reach nights (53), where the
player simply never tries the walk home, not dramatic
strandings. Creek strandings, the thing this arm
hunts, happened three times in 1,800 evenings, and
each time the village's own habit — four logs packed
for the road home — bridged the gap and walked home.
The one village that died, 13317, did not die at a
creek: it starved, days 20–25, after its player died
twice in the wild and wounds took two more villagers
— a food-collapse story, not a travel story. What was
missing across the screen was not wood or bridges but
pressure: competent play keeps the village fed near
~2400 kcal and the pack stocked, so the lacks the
lacking-line exists to name almost never happen. The
blank this run documents (not fills) is the played
proof of that line — four runs running, still unplayed.

## Wall numbers (every run)

- National: NOT OBSERVABLE in 30-day evening legs
  (pre-seat, no field) — not claimed, never zero.
- Table: NOT OBSERVABLE in 30-day evening legs.
- Wins: NOT OBSERVABLE in 30-day evening legs;
  0 win flags present.
- Wave 4–5 unlocks: not re-measured on this leg shape;
  no wave-4/5 content is reachable from a 30-day
  evening leg, and none is claimed.
- Median survival: 30 days (59 of 60 villages reach
  day 30; 13317 lost day 28).

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as pre-registered
before judging: this leg is a 30-day position measurement
of a POLICY-SIDE lever — zero src/js changes, so there is
no game-root delta for a panel to compare, and the panel's
registry policies do not include the nighttravel trace
policy. The determinism re-run (byte-identical, seed
13336) is the instrument-perturbation proof, and the
pre-registered DIAG bars above are the judge.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- MINIMUM-N 1, KEPT BUT UNMET: one honestly-staged
  evening is still the right unit for an existence proof
  — the failure here is yield, not the unit. Do not
  lower the bar to a unit test (already green) or to a
  hand-staged string (forbidden by the prereg).
- SEQUENTIAL-ON SCREENING, RETIRE: 3 creek evenings
  per 60 seeds is too thin an instrument. The next run
  banks on OFF-leg creek episodes first (the
  blockscreen2 method) and only then judges ON
  still-refused evenings. The first-qualifying-seed
  rule was never exercised — it should be kept in
  whatever banking-first design replaces this screen,
  so the staged seed is still the first qualifier,
  not the prettiest.
- GATE-SKIP PRIMARY, KEPT: build/retry-refused lines
  are secondary evidence for the same reason as
  before — they name a failure, not a countable lack.
  Neither variant played in this screen either.
- ANALYZER FIX, RECORDED: the screen analyzer first
  labeled rescued evenings with a placeholder skip
  ("retry?"); it now reports skip null for rescued
  evenings (the lever did not refuse, so no skip
  exists). The census JSON in this evidence set was
  regenerated after the fix; the proof script asserts
  the corrected shape.
- If the metric proves wrong, write it under "metric
  review" in the evidence file and propose the revision
  for the NEXT run — never re-score mid-run.

## Evidence files

- Prereg: evidence/2026-10-29/sim-lackingline-b-prereg.md
  (commit e3b2d02f, before any judged leg)
- This file: evidence/2026-10-29/sim-lackingline-b.md
- Screen census (all 60 seeds, per-seed creek/still/
  skips/outcomeDist/errs):
  evidence/2026-10-29/sim-lackingline-b-screen-census.json
- Creek-seed corpora (the 3 seeds with ON creek
  evenings; the other 57 screen JSONs are not committed
  — they contain no refusals and are exactly
  reproducible from the documented driver + env + seed
  list, as the byte-identical determinism re-run for
  13336 proves):
  evidence/2026-10-29/sim-lackingline-b-corpus-screen-creek/
  (woodcarry3-b-nighttravel-s13323.json,
  -s13327.json, -s13336.json)
- Instruments: scripts/analyze-lackingline-screen-b.js
  (screen census), scripts/test-lackingline-b.js (T1–T4,
  ALL PASS: 11 checks), scripts/woodcarry3-trace-b.js
  (judged driver, reused unchanged from woodcarry3).
- NO src/js change, NO policy change, NO default flip.

## Infrastructure note for the coordinator

The prereg commit via scripts/safe-commit.sh triggered
the known index-clobber variant: after the commit the
worktree index showed the prereg file as a staged
deletion while the worktree file was byte-identical to
HEAD. The commit itself was verified correct (git show
--stat + HEAD blob match), and the index was repaired
with `git update-index --add --cacheinfo
"100644,<blob-from-HEAD>,<path>"` per the repo lesson;
`git status --short` and `git diff HEAD` were empty
after repair. No work was lost; the clobber is
reported, not hidden.

## Landing note for the coordinator

INSUFFICIENT-DATA (0 still-refused in a 60-seed screen,
bar unmet, nothing faked): land prereg + this evidence
file + screen census + 3 creek corpora + analyzer +
proof. Backlog disposition (reported, NOT edited — goal
hidden_files are the coordinator's): #1424 and #1444
remain OPEN — the lacking-line is still unit-proven
only, four runs running, and the recommended next step
is a banking-first (OFF-leg creek episodes) screen
under a new prereg, not a fifth sequential-ON screen.
This worker does NOT merge to master — coordinator
merges. Report: 'committed, pending coordinator merge'.
