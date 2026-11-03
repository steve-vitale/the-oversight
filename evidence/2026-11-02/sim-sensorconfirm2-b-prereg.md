# sim-sensorconfirm2-b — FRESH-BAND CONFIRM RETRY PREREGISTRATION (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T0330Z,
arm sim-sensorconfirm2-b, axis food-economy. Worktree
sim-sensorconfirm2-b, branch sim-sensorconfirm2-b. This arm changes NO
game code, flips NO policy default, edits NO existing script or policy
file. New files only, all named *-sensorconfirm2-b.*: this prereg, the
proof test (scripts/test-sensorconfirm2-b.js), the thin analyzer
(scripts/analyze-sensorconfirm2-b.js, which imports the reused
gatediseng analyzer for the (c) cross-check and adds only the new rule
and lead arithmetic), the evidence file, and the confirm corpus
(evidence/2026-11-02/sim-sensorconfirm2-b.jsonl /
*-summary.json / *-sweep.log / *-detcheck.log). The gatecover tracer
(scripts/trace-gatecover-b.js), the gatediseng analyzer
(scripts/analyze-gatediseng-b.js), and scripts/policies/competent.js
are REUSED VERBATIM, read-only, never edited. This worker does NOT
push, bump versions, verify live, merge, or rebase — the coordinator
lands the branch. This confirm does NOT deploy (e*).

## Canon note (read first)

docs/CANON.md read in full. NO canon doc covers the gatediseng sensor
itself — it is a policy-side sim instrument, not a game system; no canon
is invented for it. docs/PRESERVATION.md (food ladder) is adjacent, not
the sensor. This arm invents no game system: it measures would-fire
overlays on existing evening trajectories.

## Background (read, never re-litigated, never re-judged)

Read in full before judging: evidence/2026-11-02/sim-sensorredesign-b.md
and its prereg evidence/2026-11-02/sim-sensorredesign-b-prereg.md,
evidence/2026-11-02/sim-sensorconfirm-b.md and its prereg
evidence/2026-11-02/sim-sensorconfirm-b-prereg.md, plus
docs/MEASUREMENT.md sections 9-12, 14-15. The pilot (PILOT-GO on a KNOWN
band) is the reason confirms exist; no deploy claim may cite the pilot
alone, and no deploy claim may cite this confirm alone — this confirm
does NOT deploy (e*).

The first fresh-band confirm (run fleshout-loop-b-20261103T0230Z,
arm sim-sensorconfirm-b, band 80001-80024) came back
INSUFFICIENT-DATA: only 2 collapsing seeds against a bar of >= 4,
while every leg that could be checked passed on those two (fire 2/2,
tie 2/2, strict 2/2, lead >= 1 2/2, cost 4/22 = 18.2%, cross-check 0/24
mismatches, tracer 24/24 first try). That verdict neither overturns
the pilot GO nor deploys (e*). This run is the retry its metric review
ordered: the ONLY change vs the prior prereg is the screening rule
below — a fixed larger band. Verdict bars, rule definitions, and
definitions are carried VERBATIM.

Rule (e*) verbatim, carried from the pilot prereg: S = first evening of
the current disengaged stretch; peak(D) = max pantry over S..D in the
stretch; falls(D) = count of evenings t in (S..D] with
pantry(t) < pantry(t-1), cumulative not consecutive; fire at FIRST
evening D in the stretch with D > S, D >= 8, disengaged,
hungryStreak(D) >= 1, where (E1) falls(D) >= 2 AND
pantry(D) <= 0.90*peak(D), or (E2) pantry(D) <= 0.65*peak(D).
Rule (c) is the old stand-down+trend rule from the same prereg
(S = first evening of the current disengaged stretch; D > S, D >= 8,
three consecutive falls ending at D with D-3 >= S, and
pantry(D) <= 0.90*pantry(S)).

## Fresh band (fixed here, BEFORE any judged sim)

Seeds 81001-81056 inclusive (56 seeds), 30d competent, verbatim
gatecover tracer (scripts/trace-gatecover-b.js) reused read-only, one
node process per seed, each line appended to
evidence/2026-11-02/sim-sensorconfirm2-b.jsonl. These seeds are FRESH —
never used for sensor tuning: they are not in the collapseband band
(79006, 79019, 79031, 79064), the 790 screen (79001-79064), the 767
confirm band (76701-76712), the 522 pilot subset, or the consumed
80001-80024 band (screened by sim-sensorconfirm-b). No seed is added,
dropped, or substituted mid-run. No cherry-picking: the judged legs run
on the full band. The band size (56, inside the 48-64 range fixed by
the retry order) is chosen so that, at the prior fresh band's collapse
rate (2/24 = 8.3%), the expected collapsing count is ~4.6 — a band
that can actually meet the >= 4 bar without screening-until-4, while
still forbidding any mid-run top-up if it falls short.

## Definitions (fixed here, BEFORE any judged sim — verbatim from the prior prereg)

- Collapsing = lost before 30d WITH a starvation death
  (endReason village-lost, daysAlive < 30, at least one death with cause
  'starvation'). Reference day = first starvation death day.
- Survivor = survived the full 30d (daysAlive == 30, not village-lost).
- Other outcomes (lost before 30d with NO starvation death) are neither
  collapsing nor survivors: they are reported seed-by-seed, count toward
  neither judged denominator, and do not fill either count.
- Lead = reference day - first firing day. A collapsing seed with NO
  firing has no lead and fails outright; for lead-vs-(c) comparisons,
  no-fire counts as negative infinity (worse than any firing).
- Tracer verification: rows == daysAlive on every seed. A seed failing
  verification is re-run once and the retry reported loudly; a seed is
  never judged on a mismatched row count.
- Determinism spot-check: re-run 3 legs verbatim (first, middle, and
  last collapsing legs in seed order if >= 3 collapsing seeds exist;
  otherwise the first 3 legs in seed order) and report match/mismatch
  of the full JSON line. A mismatch is reported loudly as a substrate
  finding; judged legs run on the first-run lines.

## Judged legs + GO bars (fixed here, BEFORE any judged sim — verbatim from the prior prereg)

GO requires ALL of the following:

- COUNT GATE: collapsing >= 4 AND survivors >= 12. If either count is
  below its bar, the verdict is INSUFFICIENT-DATA — do not lower bars,
  do not screen extra seeds to fill the count.
- FIRE LEG: (e*) fires on ALL collapsing seeds.
- TIE LEG: lead_e >= lead_c on ALL collapsing seeds.
- STRICT LEG: lead_e > lead_c on >= 50% of collapsing seeds.
- LEAD-ONE LEG (the lead>=1 leg the pilot's metric review demanded):
  lead_e >= 1 on >= 75% of collapsing seeds.
- COST LEG: (e*) fires on <= 25% of survivors.
- CROSS-CHECK LEG: this arm's analyzer's (c) first-firing matches the
  reused gatediseng analyzer's (c) first-firing on ALL seeds. Any
  mismatch = INSUFFICIENT-DATA (loud failure, not a re-score).
- TRACER LEG: tracer verification rows == daysAlive on every seed
  (after at most one re-run per seed).

Verdict words (judged exactly against this header):
- CONFIRM-GO: count gate holds AND all legs hold. The shape survives a
  fresh band; it does NOT deploy (e*).
- CONFIRM-NO-GO: count gate holds but any judged leg fails, with the
  failing leg named. The shape does not advance on this evidence.
- INSUFFICIENT-DATA: count gate fails, cross-check mismatch, or tracer
  verification failure unrepairable by re-run — with the failure stated.
  No leg is re-scored, no margin relaxed, no seed substituted, no clause
  redefined mid-run.

Secondary (reported, NOT judged): per-seed clause (E1/E2) and firing
days for both rules; mean lead_e vs mean lead_c (with the pilot's
warning that means mislead when coverage differs); collapsing seeds
with lead_e == 0 (death-knell firings, named even on a GO); (c) firing
rate on survivors for context; and, per the prior run's metric review,
the (c)-vs-(e*) survivor overlap — whether the identical firing sets
seen on 80001-80024 repeat on this band (fluke vs property).

## Staged design

STEP 1 — THIS PREREG COMMIT (before any judged sim).
STEP 2 — TOOLS + PROOF (new proof test scripts/test-sensorconfirm2-b.js;
pure, synthetic series only, NO judged seeds — synthetic rows carry no
seed numbers from any judged band — run green after the prereg commit
and before any judged application; the reused proof tests
test-gatediseng-b.js (21/21) and test-gatediseng-confirm-b.js (11/11)
are also re-run green on current base before the confirm).
STEP 3 — SCREEN (run the full 81001-81056 band fresh via the verbatim
tracer, one node process per seed; verify rows == daysAlive each).
STEP 4 — JUDGE ((c) via reused analyzer, (e*) via thin analyzer,
cross-check, leads, verdict judged exactly against this header; wall
numbers from the confirm band, 30d limit stated; survivor overlap
reported as secondary).
STEP 5 — SENSE TEST (read transcripts around (e*) firing evenings on
collapsing seeds, quote >= 3 lines, judge in plain words whether the
warning reads as the village noticing in time).
STEP 6 — EVIDENCE (evidence/2026-11-02/sim-sensorconfirm2-b.md).

## Balanced panel (section 15) — inapplicability declared

No balanced-panel compare is fabricated, with the same reasoning as
the pilot and the first confirm: this arm changes NO game code, runs
NO lever, and its primary metrics are within-trajectory instrument
diagnostics (would-fire overlays on identical evening series), not
panel metrics. The tables are reported directly in the evidence file
instead, on identical seeds and identical trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins. NO wall
movement is claimed. What is reported from the confirm band: survival
(seeds survived / band, median and max days alive), wave reach,
collapsing-seed count, and national / table / wins as NOT REACHED IN
WINDOW (expected 0 — late-game states with no fields in this window,
reported as such, not as a rate claim).

## Deploy wording note (carried, not acted on)

Any future deploy wording must be peak-anchored ("fallen from its
recent high"), never stand-down-anchored — per the pilot's metric
review (4), (e*) can in principle fire while pantry is still above its
stand-down level. This confirm does NOT deploy (e*) and writes no
deploy copy.

## Attribution limits (stated before judging)

- Evening snapshots only: (e*) reads evening pantry/gate/streak values.
  Intraday flicker is not measured and cannot change a would-fire
  evening verdict.
- Would-fire overlay, not a counterfactual: firing days are computed on
  trajectories as run. A real (e*) rule could change villager behavior
  and therefore later evenings; whether it would have saved any village
  is unmeasured and is not claimed.
- Single policy (competent) by design; other policies may pantry
  differently. 30-day early window only; late-game legs unmeasured.
- Descriptive staged measurement, NOT a causal claim.

## Metric review

(To be completed in the evidence file after judging. Doubts about this
header go here, and any revision applies to the NEXT run, never to
this one.)
