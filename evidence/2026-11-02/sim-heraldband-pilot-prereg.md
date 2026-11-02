# sim-heraldband-pilot — PREREG (Loop A 20261102, run fleshout-20261102T2215Z)

Arm: re-screened fight-positive herald-chain pilot band, axis scale-onramp.
Instrument + judged-band arm only: ZERO game-code change. This prereg is
written and committed BEFORE any judged sim in this arm. Judge against
this header; a miss is NO-GO, never re-scored mid-run. Metric doubts go
under "metric review" in the final evidence and apply to the NEXT run.

This file restates the staged prereg
(~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-heraldband-pilot-prereg-2018.md)
with ONE correction from run 2115Z, as instructed: the anchor is the tip
of the tree the sims actually run on, NOT 61e019a85.

## Anchor (corrected)

Worktree base: master 62e251b69
(full 62e251b699ba9c3360f4fe02673bce21b44d6000), which already contains
the landed fightoutcome recorder
(scripts/fightoutcome-{recorder,driver,analyzer}-20261102.js). If the
worktree is rebased before sims, the actual tip at sim time is recorded
in the evidence file and supersedes this line; no other prereg change.

## Band

Fresh seeds 98101-98108 (8 seeds, pilot size per MEASUREMENT.md).
Freshness re-verified by this run before any sim:
- Filename: zero hits for 98101-98108 in evidence/ (the four
  s2981033 JSON hits in evidence/2026-10-17/perseed-vetshape/ are a
  different seed, not this band).
- Word-boundary .md check over evidence/: zero hits.
- Substring .md check over evidence/: exactly two files
  (evidence/2026-10-17/sim-vetshape.md, sim-armorbreak.md), both
  matching ONLY as the substring inside seed 2981033 — no whole-seed
  use of 98101-98108 anywhere (the destfirst substring precedent).
- evidence/2026-11-02/*.md and evidence/2026-11-01/*.md: zero hits.
- Convergence tracker: zero whole-seed hits.
Spare band on file: 98201-98208. Substring .md check: zero whole-seed
hits; the single 98207 substring hit in the convergence tracker sits
inside commit hash 071198207, not a seed use (same substring precedent).
Bands are screened on CURRENT code only.

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
  8 new fo-closecommit-s9810*-r1.json files into a fresh dir
  evidence/2026-11-02/perseed-heraldband-a, so the analyzer corpus is
  exactly this band and the recorder-pilot dir is left as it was.

## Primary metric — screen usability (not a chain verdict)

(a) Analyzer problems = 0 on the fresh band (legs 1a/1b/1c + leg 2, the
same invariants as the recorder pilot: every FOUGHT/BYPASS start carries
exactly one outcome row, every field fight resolved, every titan
slain/fled record joins exactly one TB fight row, zero orphans, zero
duplicates, zero unresolved).
(b) Fight-positive yield = number of seeds with >= 1 titan TB fight row
joined to a slain/fled titan outcome record.

GO (screen usable, confirm round justified): (a) holds AND yield >= 2.
If yield is 0-1: verdict = SCREEN TOO THIN (widen the band next run),
NOT a verdict on the herald chain. If (a) fails: RECORDER REGRESSION,
NO-GO, report loudly, do not judge the chain.

## Secondary (descriptive, never judged)

Per seed: call day; titan outcome class — slain / fled / refused-only
(attempts, no fight) / departed-silent-or-pending (call present, no
fight, no outcome record, herald gone from dailyTrace — the
heralddepart-a silent-departure class, named not assumed); onward scale
flags at end (national / table / won / maxWave). Wall numbers for the
band: national / table / won, wave-4 / wave-5 unlocks, median survival.
Flags stay non-specific: only outcome rows are cited as herald-chain
signal.

## Sense-testing

If yield >= 1, read one fight-positive seed's titan fight row sayLines
end-to-end and judge meaning (coalition price, row/transcript match),
per the SENSE-TESTING LAW. Counts alone never pass this arm.

## Telemetry

node scripts/telemetry-check.js is EXPECTED to REFUSE this corpus
(anchorCommit recorder-row class, same as 1715Z/1825Z). A refusal is
not a LOUD line; the baseline is NOT rolled. Record the refusal class.

## Metric review (to be completed in the final evidence)

- Whether the departed-silent-or-pending class separates cleanly from
  still-pending-at-cap on this band.
- Whether yield >= 2 is the right confirm gate, or the confirm band
  should be built from fight-positive seeds only regardless of yield.
