# sim-heraldband-widen — PREREG (Loop A 20261103, run fleshout-20261103T0011Z)

Arm: widened fight-positive herald-chain screen, axis scale-onramp.
Instrument + judged-band arm only: ZERO game-code change. This prereg is
written and committed BEFORE any judged sim in this arm. Judge against
this header; a miss is NO-GO, never re-scored mid-run. Metric doubts go
under "metric review" in the final evidence and apply to the NEXT run.

This file restates evidence/2026-11-02/sim-heraldband-pilot-prereg.md
and evidence/2026-11-02/sim-heraldband-pilot.md verbatim in its stack,
band procedure, and verdict rules, with the widen changes instructed
for this run: fresh band 98201-98208, yield reported per called seed
ALONGSIDE yield per band seed, combined 16-seed yield with the pilot
band reported for context only, and onward scale flags read as
national / tableDone (NOT the table latch) / won / maxWave.

## Anchor

Worktree base: master 1ce6d98fd
(full 1ce6d98fd1bc47d12515ac59b2512cd20a519334), which already contains
the landed fightoutcome recorder
(scripts/fightoutcome-{recorder,driver,analyzer}-20261102.js) and the
pilot band's merged evidence (d8ce88852). Per the pilot prereg's
correction, the anchor is the tip of the tree the sims actually run
on: the prereg-commit tip, recorded in the final evidence. It differs
from the worktree base by exactly one file (this prereg itself), so no
trajectory-relevant code differs from base.

## Band

Fresh seeds 98201-98208 (8 seeds, pilot size per MEASUREMENT.md).
Freshness re-verified by this run before any sim:
- Word-boundary .md check over evidence/: the only hits are the
  spare-band RANGE mentions themselves ("98201-98208" / "98201–98208")
  in sim-heraldband-pilot-prereg.md, sim-heraldband-pilot.md, and
  sim-scale-onramp-round-2215.md — a reservation, not a seed use.
  No per-seed row, no per-seed file, no sim use of any individual
  98201-98208 seed anywhere.
- Substring .md check over evidence/: exactly three files (the same
  three above), all matching ONLY as the spare-band range string —
  no whole-seed use.
- evidence/2026-11-02/*.md and evidence/2026-11-01/*.md: the
  2026-11-02 hits are the same three range-mention files; no
  2026-11-01 hits; no individual-seed use in either day.
- Convergence tracker: the only hits are the same spare-band range
  mention (line 21402) and the pre-documented 98207 substring inside
  commit hash 071198207 (line 9093, same substring precedent as the
  pilot prereg) — neither is a seed use.
- Filename check: no fo-closecommit-s9820*.json exists; the
  s9820.json files under evidence/2026-10-26 and 2026-10-27 are seed
  9820 (four digits), not this band.
Bands are screened on CURRENT code only. If any seed above had been
used since, this run would FAIL LOUDLY rather than silently swap
seeds — that condition did not trigger.

## Stack (verbatim, no game-code change)

- Policy stack: closecommit (titanroute + musterclose + mustergap over
  lead-fullseat), exactly as scripts/fightoutcome-driver-20261102.js
  composes it. Env flags verbatim from the driver header:
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1 HERALD=1. Mode herald, 180d death-aware cap, one process
  per seed.
- Recorder: scripts/fightoutcome-{recorder,driver,analyzer}-20261102.js
  as landed at the anchor above (zero src/js changes in this arm).
- Analyzer: scripts/fightoutcome-analyze-20261102.js over the per-seed
  JSON only (no re-simulation).
- Output-dir note (procedure, not a metric change): the driver writes
  into evidence/2026-11-02/perseed-fightoutcome-a, which already holds
  the recorder pilot's files. Before analyzing, this run MOVES only its
  8 new fo-closecommit-s9820*-r1.json files into a fresh dir
  evidence/2026-11-02/perseed-heraldband-widen, so the analyzer corpus
  is exactly this band and perseed-heraldband-a and
  perseed-fightoutcome-a are left as they were.

## Primary metric — screen usability (not a chain verdict)

(a) Analyzer problems = 0 on the fresh band (legs 1a/1b/1c + leg 2, the
same invariants as the recorder pilot: every FOUGHT/BYPASS start carries
exactly one outcome row, every field fight resolved, every titan
slain/fled record joins exactly one TB fight row, zero orphans, zero
duplicates, zero unresolved).
(b) Fight-positive yield = number of seeds with >= 1 titan TB fight row
joined to a slain/fled titan outcome record.

GO (screen usable, confirm round justified): (a) holds AND yield >= 2.
If yield is 0-1: verdict = SCREEN STILL THIN (widen the band next run
or condition on call-age survival), NOT a verdict on the herald chain.
If (a) fails: RECORDER REGRESSION, NO-GO, report loudly, do not judge
the chain.

## Secondary (descriptive, never judged)

Per seed: call day; titan outcome class — slain / fled / refused-only
(attempts, no fight) / departed-silent-or-pending (call present, no
fight, no outcome record, herald gone from dailyTrace — the
heralddepart-a silent-departure class, named not assumed) /
still-pending-at-cap / no-call; onward scale flags at end (national /
tableDone — NOT the table latch — / won / maxWave). Wall numbers for
the band: national / tableDone / won, wave-4 / wave-5 unlocks, median
survival. Yield is reported per called seed ALONGSIDE yield per band
seed, and the combined 16-seed yield with the pilot band (98101-98108,
yield 1) is reported for context — but GO is judged on this band
alone, per this header.

## Sense-testing

If yield >= 1, read one fight-positive seed's titan fight row sayLines
end-to-end and judge meaning (coalition price, row/transcript match,
pathing, bearer risk) per the SENSE-TESTING LAW. Counts alone never
pass this arm.

## Telemetry

node scripts/telemetry-check.js is EXPECTED to REFUSE this recorder
corpus (anchorCommit rows). A refusal is not a LOUD line; the baseline
is NOT rolled. Record the refusal class. Do NOT use a broad glob that
sweeps in analysis files (the pilot's first-invocation mistake).

## Metric review (to be completed in the final evidence)

- Whether the departed-silent-or-pending class separates cleanly from
  still-pending-at-cap on this band.
- Whether yield >= 2 is the right confirm gate, or the confirm band
  should be built from fight-positive seeds only regardless of yield.
- Whether yield per called seed changes the thinness reading vs yield
  per band seed on this band.

## Canon note

docs/CANON.md read first; docs/MONSTER-WAVES.md read for wave law. No
canon doc covers the herald/titan call chain itself (herald appears in
MONSTER-WAVES / ONTOLOGY / TABLE in passing) — this arm invents no
canon and judges only recorded outcome rows, per the pilot prereg.
