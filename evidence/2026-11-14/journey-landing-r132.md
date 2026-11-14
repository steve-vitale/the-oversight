# journey-landing r132 — RUN NOTE (Lane A, leg 0 LANDING, closeout by adoption)

**Run id:** loop-a-20261114T121445Z (scheduled Sat 2026-11-14 05:45 CST, started 12:14Z).
**Adoption closeout:** original run 858d4f42 was interrupted at the gate
(113/340 scripts); this note closes it out. Prereg:
`evidence/2026-11-14/journey-landing-r132-prereg.md`.
**Fix commit (worktree):** `0a1eafb98` "journey-landing r132: nod-loop fix —
repeat nv: gesture thins the sitting (proof 13/13; pilot 3/3 loops -> 0/3)
[needs-eyes]" — `src/js/conversation.js` +24/−1, proof test
`scripts/test-journey-landing-r132-nod-loop.js`, analyzer
`scripts/analyze-landing-r132-nodloop.js`, driver
`scripts/journey-landing-r132-20261114.js`, prereg.

## Q1 (PRIMARY) — NOD LOOP: FIXED

Panel seeds 1142–1151 (r121 carried band), DAYS=28, fixed code, standing
picker. Analyzer `analyze-landing-r132-nodloop.js` on
`landing-r132-after/`: **LOOP=0** — 8 nv sittings, 104 sittings total,
maxSameStreak=1 everywhere, winddown surfaced on the turn before the last
pick in every sitting, all sittings closed via leave. Pilot repeat-nod probe
(3/3 loops on unfixed code) → 0/3 on fixed code. Proof test 13/13 on the
fix commit; re-run on the rebased tip at landing (see below).

## Q2 / Q3 (carried) — NO REGRESSION

- HEED regression (r131 fix): **WARNED-BUT-UNRESOLVED 0**; D3 0, D2 0.
  (The analyzer log's "HEED filler loop: 1" is the legacy watch item carried
  since r131, not the gate bar.)
- Q2/Q3 metrics byte-identical to the r131 panel.

## Q4 — TELEMETRY: QUIET

No LOUD lines on the r132 panel vs the re-seeded r131 `landing-split.json`
baseline. Baseline not rolled in this run (adoption closeout).

## Gate (adoption re-run, full `check.js --quick` in the worktree)

**335 passed, 5 failed in 954s** (log:
`evidence/2026-11-14/journey-landing-r132-gate.log`). Adjudication —
0 attributable:

- `test-measurement-proof-update.js` — "Proof source inputs are not current":
  measurement-proof staleness pair (standing set; any src/js change stales it).
- `test-measurement-workflow.js` — "retained neutrality proof covers the
  current Game/controller/harness inputs": the pair's other half (standing set).
- `test-phone-frame-proof.js` — phone-frame receipt staleness (standing set;
  refresh needs a browser run, owed separately).
- `test-living-garden-deed-attainment.js` — 120s timeout in the parallel run;
  **PASS standalone** (exit 0, log `...-gate-standalone-garden.log`) —
  load artifact.
- `test-one-person-army-deed-attainment.js` — 120s timeout in the parallel
  run; **PASS standalone** (exit 0, log `...-gate-standalone-army.log`) —
  load artifact.

Occupation-panels and establishment-r20-fixes passed this run. Gate verdict:
**GO**.

## Landing

- Rebased onto master `f1871e37b` (r201 crisis + proofrefresh-b16 closeout
  landed under this closeout); proof test re-run 13/13 on the rebased tip.
- ff-only merged; fix commit verified an ancestor of the new HEAD.
- Worktree released (worktree-release.sh merged), worktree removed, branch
  `journey-landing-r132` deleted. Main tree clean.
- Rotation `journey-rotation-a.txt`: the run itself advanced 0→1 at run
  start (prereg); already read 1 at closeout — no further advance.
  Next leg: establishment.
- Lock `playtest-loop.lock` (run_id `loop-a-20261114T121445Z`) deleted at
  closeout after run_id verification.

## Carried (unchanged)

- r129 terrain-pocket + D1 garbled-label fixes still live only on branch
  `journey-landing` (59ad7c479 / 6b99d6a90), awaiting Steve's call — NOT
  cherry-picked here.
- r129 fixed-side probe detail (which errand Chantal picks on day 28 on
  fixed code) still owed; `~/workspace/scratch-fixed/` still stale.
- Teaching the shared chooser to take nv:accept (r197 lane decision owed).
