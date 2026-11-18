# Pre-registration — sim-fleerepair2-rejudge-b (Loop B run fleshout-loop-b-20261118T0026Z, axis: winnability chain)

Committed BEFORE any judged sweep in this run. Judge strictly against this
file; a miss is NO-GO, never re-scored against a friendlier metric mid-run.
Metric doubts go under "metric review" in the evidence file, for the NEXT run.

## What this run is

A MEASUREMENT-ONLY re-judge of the HELD arm sim-fleerepair2-b. NO code
change in this run: the fix (FLEEREPAIR2 seed gate in winPlanSeedFromFight,
src/js/win-plan.js) is already built on this branch at tip `1725b9336`
(sim-fleerepair2-b: evidence + panel). The 2230Z panel was NO-GO because B1
was UNJUDGEABLE: the fresh band 104001–104008 launched zero suburb hunts on
the control leg, so the frozen calibration gate ("fresh-band ctl leg must
show >=1 suburb-hunt launch; if 0, B1 is UNJUDGEABLE, not a GO") stopped a
vacuous GO. This run re-judges B1 on the launch-rich DIAGNOSIS band
103601–103608, which launches suburb hunts.

Authorization: the 2230Z coordinator decision (HOLD, re-judge B1 on the
diagnosis band), carried in this run's assignment. NOTE: the coordinator
file `evidence/2026-11-17/sim-winnability-round-2230.md` does NOT exist in
this branch (the held branch predates it) — the decision is recorded here
from the assignment, not from a file read in this tree.

## Frozen definitions (inherited, unchanged)

All bar definitions are inherited verbatim from the FROZEN prereg
`evidence/2026-11-17/sim-fleerepair2-b-prereg.md`, which binds this run:

- PRIMARY B1: launched meetings vs a leave-counter species (suburb) per
  8-seed panel — COUNT. A launched meeting is the analyzer's join
  (encounter day within launch day +21, mid == launch target, vid in
  launch party).
- B2 (no-kill-loss): wave-4 kills (meetings outcome vKill, wave 4)
  armed >= control.
- B3 (guardrail): expedition deaths armed <= control x 1.10 AND total
  deaths armed <= control x 1.10.
- B4: proof green — scripts/test-fleerepair2-b.js on the final tip.
- B5: balanced panel (§15) — scripts/balance-panel.js compare on the
  panel corpora; no uninvestigated regression.
- Instrument: 8/8 files both legs, 0 instrument errors, missingHp 0 on
  fought non-kill rows (recMismatch diagnostic only, as partysize).

**Verdict: GO iff B1 && B2 && B3 && B4 && instrument clean && B5 no
uninvestigated regression.** A miss on ANY leg is NO-GO. No re-scoring.

## GO threshold for this re-judge (B1)

GO iff armed launched-suburb-meetings = 0 WHILE ctl launched-suburb-meetings
>= 1. The calibration gate carries over: if the ctl leg shows 0 launched
suburb meetings, B1 is UNJUDGEABLE (not a GO) — the analyzer's
`judgeB1` passes vacuously at 0 launched suburb meetings on both legs,
and that vacuous 0/0 pass must NOT read as GO. The ctl leg here is the
already-existing diagnosis corpus (see below), so the calibration check is
a VERIFICATION of that corpus, not a new run.

## Calibration verification (run FIRST, before the armed leg)

The diagnosis ctl corpus in this branch
(`evidence/2026-11-17/perseed-fleerepair2-b-diag/`, 8 files +
`evidence/2026-11-17/fleerepair2-b-diag-analysis.json`) must verify as:

- suburb-hunt launches >= 1 AND launched suburb meetings >= 1 with
  rounds 1 / mDealt 0 / vFlee shape.
- Expected from the 2230Z evidence (verify, don't assume): 9 suburb-hunt
  launches, 3 launched suburb meetings, round-1-zero 2, wise leaves 3,
  all on seed 103602.

If the verification fails (0 launches/meetings), the gate FAILS: stop,
investigate drift, do NOT proceed to judge B1.

## Seed-band freshness — reuse is DELIBERATE and authorized

Grep of `evidence/*/sim-*-prereg*.md` for `103601` (run 2026-11-18, before
any sims in this run) names the band in:

- `evidence/2026-11-17/sim-fightallycap-b-prereg.md`
- `evidence/2026-11-17/sim-fightallycap-confirm-b-prereg.md`
- `evidence/2026-11-17/sim-fleerepair2-b-prereg.md` (as the DIAGNOSIS
  band, reused for diagnosis ONLY, never as the panel)

Reuse of 103601–103608 here is DELIBERATE and authorized by the 2230Z
coordinator decision: identical-seed before/after — the ctl leg ALREADY
EXISTS as the diagnosis corpus in this branch, and this run executes ONLY
the NEW armed leg (`FLEEREPAIR2=1`) on the same seeds. No fresh band is
sought: the whole point of this re-judge is that the diagnosis band is the
one band known to launch suburb hunts. This is not band-shopping: the
fresh panel verdict (NO-GO, B1 unjudgeable) stands as recorded; this run
judges the same frozen bars on the band where the phenomenon exists.

## Design (seeds, policy, horizon, instruments)

- Band: 103601–103608 (8 seeds). Horizon: 150d death-aware. Policy:
  competent verbatim (scripts/policies/competent.js).
- Substrate (both legs): VETREENGAGE=1 PARTYSIZE4=1. FIGHTALLY2 unset
  both legs (single-lever contrast). Armed leg adds FLEEREPAIR2=1.
- Ctl leg: the existing diagnosis corpus — NOT re-run. Armed leg: NEW
  run via scripts/fleerepair2-driver-b.js, MODE=arm, OUTDIR
  `evidence/2026-11-17/perseed-fleerepair2-rejudge-b-arm/`,
  RUN=fleerepair2-b, SEEDS=103601..103608.
- Analyzer: scripts/analyze-fleerepair2-b.js (reused as-is; its B1/B2/B3
  judges and launch join are the frozen instrument). Output written to
  a NEW file `evidence/2026-11-17/fleerepair2-rejudge-b-analysis.json`
  — the original `fleerepair2-b-analysis.json` (fresh-panel analysis)
  must NOT be overwritten.
- Balanced panel (B5): scripts/balance-panel.js compare on the
  diagnosis-ctl vs rejudge-armed corpora, via
  scripts/build-fleerepair2-b-panels.js if it supports a re-judge
  output path, otherwise a new re-judge panel file; the compare .md is
  attached to the evidence file. If the panel builder cannot be pointed
  at re-judge outputs without overwriting the fresh-panel files, record
  that in the evidence file and judge B5 from the analyzer + panel
  compare run with distinct output names.
- Proof (B4): scripts/test-fleerepair2-b.js re-run on this tip (no code
  changed; expected 29/29).
- PILOT GATE: not applicable as a new spend — the diagnosis band IS the
  pilot population and its ctl leg already exists; the armed leg is the
  single judged sweep.

## Sense-test (pre-registered)

Read the 'leave' lines / suburb-plan silence on the armed leg. Judge
meaning: a fixed run must read as parties simply never being sent at the
unkillable one. The gate's silence (returns null, no voice line) is a
known limitation from the 2230Z evidence — check whether it is voiced
anywhere on this band, quote lines, do not build a voice line here
(measurement only).

## Wall numbers (both legs, reported not judged)

Wins, national reached, table reached, wave-4 faced/kills, wave-5
faced, median survival — from the analysis JSON.
