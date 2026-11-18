# Pre-registration — sim-fleerepair2-rejudge2-b (Loop B run fleshout-loop-b-20261118T0221Z, axis: winnability chain)

Committed BEFORE any judged sweep in this run. Judge strictly against this
file; a miss is NO-GO, never re-scored against a friendlier metric mid-run.
Metric doubts go under "metric review" in the evidence file, for the NEXT run.

## What this run is

A MEASUREMENT-ONLY re-judge of the HELD arm sim-fleerepair2-b. NO code
change in this run: the fix (FLEEREPAIR2 seed gate in winPlanSeedFromFight,
src/js/win-plan.js) is already built on this branch at tip `cf7ae127c`
(sim-fleerepair2-rejudge-b: B1 re-judged on diagnosis band (NO-GO, B2 6->5)).

Context: the 0026Z re-judge passed B1 (launched Suburb meetings 3 -> 0 on
the diagnosis band 103601–103608) but failed B2 by ONE kill (wave-4 kills
6 -> 5, the whole gap on seed 103602 — trajectory divergence, wild/contact
kills, not removed killing power). The coordinator's next step: re-judge
B2 on a LARGER band with a pre-registered one-kill tolerance.

## Seed-band freshness — verified before any sims in this run

- Reuse band 103601–103608: the diagnosis band, DELIBERATE and authorized
  (same as the 0026Z re-judge; identical-seed before/after). Both legs are
  re-run FRESH on all 16 seeds in this run (the 0026Z armed leg is NOT
  reused; the diagnosis ctl corpus is NOT reused — a clean 16-seed
  before/after on one tip).
- Fresh seeds 103609–103616: grep of `evidence/*/sim-*-prereg*.md` for
  `103609`–`103616` returned NO matches (exit 1, run 2026-11-18 in this
  worktree), and a grep of `evidence/2026-11-17/*.md` and
  `evidence/2026-11-1*/*.md` for `103609` also returned nothing. The fresh
  half-band is unused by any prior prereg or evidence note in this tree.

## Frozen definitions (inherited, unchanged)

All bar definitions are inherited verbatim from the FROZEN prereg
`evidence/2026-11-17/sim-fleerepair2-b-prereg.md`, which binds this run:

- PRIMARY B1: launched meetings vs a leave-counter species (suburb) per
  panel — COUNT. A launched meeting is the analyzer's join (encounter day
  within launch day +21, mid == launch target, vid in launch party).
- B2 (no-kill-loss): wave-4 kills (meetings outcome vKill, wave 4).
- B3 (guardrail): expedition deaths armed <= control x 1.10 AND total
  deaths armed <= control x 1.10.
- B4: proof green — scripts/test-fleerepair2-b.js on the final tip.
- B5: balanced panel (§15) — scripts/balance-panel.js compare on the
  panel corpora; no uninvestigated regression.
- Instrument: all files parse, 0 instrument errors, missingHp 0 on
  fought non-kill rows (recMismatch diagnostic only, as partysize).

## GO thresholds for THIS re-judge (revised B2, pre-registered)

- **B1 (re-check):** GO iff armed launched-suburb-meetings == 0 AND ctl
  launched-suburb-meetings >= 1. If ctl == 0, B1 is UNJUDGEABLE (not a
  GO) — the analyzer's `judgeB1` passes vacuously at 0/0 and that
  vacuous pass must NOT read as GO.
- **B2 (PRIMARY for this re-judge):** wave-4 kills — GO iff
  armed >= ctl - 1 (ONE-KILL TOLERANCE, pre-registered: on 16 seeds a
  1-kill gap is noise; the gate removes no fight, no weapon, no kill —
  the 0026Z gap was wild/contact kills lost to trajectory divergence).
  The strict armed >= ctl line is ALSO reported, separately, never
  re-scored into the verdict.
- **B3 (guardrail):** expedition deaths armed <= ctl x 1.10 AND total
  deaths armed <= ctl x 1.10.
- **B4:** proof green — scripts/test-fleerepair2-b.js on the final tip
  (expected 29/29).
- **B5:** balanced panel (§15) — scripts/balance-panel.js compare on the
  panel corpora, .md attached to the evidence file; no uninvestigated
  regression.
- **Instrument:** 16/16 files both legs, 0 instrument errors,
  missingHp 0 (recMismatch diagnostic only).

**Verdict: GO iff B1 && B2(tolerance) && B3 && B4 && instrument clean
&& B5 clean.** On GO the lever is a LAND candidate (coordinator merges
the held branch). On NO-GO it stays HELD with the numbers. A miss on ANY
leg is NO-GO. No re-scoring.

NOTE on the analyzer: scripts/analyze-fleerepair2-b.js judges B2
strictly (armed >= ctl) and exits 1 when the strict line fails. The
tolerance verdict for THIS run is computed from the analysis JSON
numbers by hand (armed >= ctl - 1); an analyzer exit code of 1 on the
strict B2 line alone is NOT this run's verdict when the tolerance line
passes. Record both lines explicitly in the evidence file.

## Design (seeds, policy, horizon, instruments)

- Band: 103601–103616 (16 seeds: diagnosis 103601–103608 + fresh
  103609–103616). Horizon: 150d death-aware. Policy: competent verbatim
  (scripts/policies/competent.js).
- Substrate (both legs): VETREENGAGE=1 PARTYSIZE4=1. FIGHTALLY2 unset
  both legs (single-lever contrast). Armed leg adds FLEEREPAIR2=1.
- BOTH legs run FRESH on all 16 seeds via
  scripts/fleerepair2-driver-b.js:
  - ctl: `VETREENGAGE=1 PARTYSIZE4=1 MODE=ctl
    OUTDIR=perseed-fleerepair2-rejudge2-b-ctl
    SEEDS=103601,...,103616 RUN=fleerepair2-b`
  - arm: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 MODE=arm
    OUTDIR=perseed-fleerepair2-rejudge2-b-arm
    SEEDS=103601,...,103616 RUN=fleerepair2-b`
  - OUTDIR is a bare dirname (the driver hardcodes
    path.join(REPO, 'evidence', '2026-11-17', OUTDIR) — the 0026Z run's
    nested-path trap; do NOT pass a full path).
- Analyzer: scripts/analyze-fleerepair2-b.js (reused as-is; its B1/B2/B3
  judges and launch join are the frozen instrument). Output written to
  a NEW file `evidence/2026-11-17/fleerepair2-rejudge2-b-analysis.json`
  via the `FLEEREPAIR2_ANALYSIS_OUT` env var — the original
  `fleerepair2-b-analysis.json` (fresh panel) and
  `fleerepair2-rejudge-b-analysis.json` (0026Z) must NOT be overwritten.
- Balanced panel (B5): scripts/build-fleerepair2-b-panels.js with
  `--out evidence/2026-11-17/fleerepair2-rejudge2-b-panel --before
  evidence/2026-11-17/perseed-fleerepair2-rejudge2-b-ctl --after
  evidence/2026-11-17/perseed-fleerepair2-rejudge2-b-arm --seeds
  103601,...,103616`, then scripts/balance-panel.js compare; the
  compare .md is attached to the evidence file.
- Proof (B4): scripts/test-fleerepair2-b.js re-run on this tip (no code
  changed; expected 29/29).
- PILOT GATE: not applicable as a new spend — the 0026Z re-judge IS the
  pilot population on the diagnosis half-band; this run extends it to
  16 seeds with 8 fresh ones.

## Sense-test (pre-registered)

Read the 'leave' lines / suburb-plan silence on the armed leg. Judge
meaning: a fixed run must read as parties simply never being sent at the
unkillable one. The gate's silence (returns null, no voice line) is a
known limitation from the 2230Z evidence — check whether it is voiced
anywhere on this band, quote at least one vetSays line showing the
gate's behavior/silence, do not build a voice line here (measurement
only).

## Wall numbers (both legs, reported not judged)

Wins, national reached, table reached, wave-4 faced/kills, wave-5
faced, median survival — from the analysis JSON.
