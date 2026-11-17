# sim-winnability-round-0215 — Loop A 0215Z (scale-onramp)

**Run: Loop A `fleshout-20261117T0215Z`, axis scale-onramp.**
Coordinator timed out (2h cap) with both workers dead and no final
handoff. Adopted in the main session the same night: both arms
landed, one judged, one incomplete. No game-code change lands from
either arm (both levers reverted; net `src/` diff 0).

## Arms

### sim-rumortarget-a — PILOT NO-GO (LANDED `ecbc630a4`)

- Verdict: PILOT NO-GO. Primary 3/8 seeds (bar ≥4/8 rumor-born
  plans acquiring a named wave-4/5 target). Launch bar PASS (156
  targeted launches, 48 wave-4/5), cost bars PASS (deaths 90.125 →
  88.625, median survival 142 → 131, ratio 0.9225; starvation 3 →
  1). Proof 67/67 at the instrument tip `b98b229ed`.
- The rule works (21 attaches, 5 at creation / 16 on refresh — the
  refresh supplied the 3rd primary seed) but the timing misses: a
  plan takes the first fresh beast it hears about, and wave-4/5
  tales arrive late (days 55–118) while heard plans attach early
  (days 32–90) to whatever fresh wave-3 tale is around. Attach-once
  then locks the plan to the wave-3 beast. A second round would need
  a re-attach-on-higher-wave rule, not more call sites — a design
  call, recorded in the evidence file.
- Band 103101–103108 (fresh), 150d, competent verbatim
  (`df9b7dff4de4`). Wall: wins 0/8, national 0/8, wave-4 8/8,
  wave-5 2/8 → 3/8, median survival 142 → 131d.
- Lever (`winPlanRumorAttach`, `RUMORTARGET=1`, default OFF) built
  in `b98b229ed`, REVERTED by the adoption coordinator
  (`862966f70`, verified `src/` diff vs base 0, `node --check`
  passing; safe-commit's delete guard refused the revert commit
  until the coordinator approved `--force-delete` — the worker's
  evidence file had already requested that approval). Evidence +
  corpora `4903cc0c4` / `781a7ca74`. Proof 25/39 on the reverted
  tip — the 14 failures are exactly the lever-presence assertions,
  by design (the test documents the lever at `b98b229ed`).
- Evidence: `evidence/2026-11-17/sim-rumortarget-a.md`.
- Tracker blanks #5/#6 (0825Z: rumor-born plans + world-tick
  seeding design calls): the rumor-born half is now MEASURED —
  the attachment rule works, the timing defeats it. The design call
  (re-attach on higher wave) stays open for the coordinator.

### sim-nightcarry-a — INCOMPLETE, no verdict (LANDED `f7128f9f3`)

- Verdict: NONE. The worker died mid-control-leg (6/8 seeds,
  103101–103106); the ON leg never started. No judged numbers.
- The lever (carry a part-2 `party_launch` commit across ONE night,
  `NIGHTCARRY=1`, default OFF; `src/js/villager-brain.js` +118)
  is reverted by the adoption coordinator (`c6ff17988`, verified
  `src/` diff vs base 0). The lever code survives in branch history
  at `00fb5745a` for a resume round.
- Control-leg observation (not a verdict): the phenomenon exists —
  seed 103101 shows 47 `nightcarrySkips` (part-2 commits dying at
  the night tick), 0 on the other five seeds. Resume instructions
  are in the evidence file; band 103101–103108 is partially spent
  (control 6/8).
- Evidence: `evidence/2026-11-17/sim-nightcarry-a.md` (INCOMPLETE
  note + control corpora 6/8 + driver log).

## Adoption mechanics (main session)

- Both workers provably dead: no live processes in either tree,
  heartbeats stale since 02:56:10Z (rumortarget) / 04:31Z
  (nightcarry driver log); heartbeated both trees myself first.
- Rumortarget: read prereg + analysis + panel + evidence in full;
  verified the primary miss (3/8 vs bar 4) and the cost bars from
  the analysis; reverted the lever and committed with coordinator
  `--force-delete` approval; committed evidence + corpora (index
  clobber struck twice, repaired via ls-tree pipe); rebased twice
  (master moved under the adoption — expignite-b, then
  nationalsticky-b landed mid-adoption); ff-merged `ecbc630a4`.
- Nightcarry: read the prereg (frozen bar: launched wave-4+
  instances armed ≥ control + 2); verified the control leg is 6/8
  with no ON leg; reverted the lever with coordinator
  `--force-delete` approval; wrote the INCOMPLETE note; committed
  (clobber struck once, repaired); rebased onto `ecbc630a4`,
  ff-merged `f7128f9f3`.
- Telemetry check: not run on either arm — the corpora are the
  drivers' own per-seed JSON (recorder-corpus class); the checker
  refuses that input (documented refusal, same as the 2215Z/2230Z
  rounds and vetreengage-confirm). Baseline NOT rolled.
- The 0215Z claim is `.DEAD` and the Loop A lock now belongs to
  the 0415Z run — nothing to delete for this round.

## Convergence state

- Winnability chain stays converging (NOT converged): wins still 0
  on competent legs, the table still unreached. The rumor-born
  attachment question is measured; the night-tick carry-over is
  unjudged and resumable. Next blanks, in order: (1) re-attach on
  higher wave (rumortarget follow-up design call); (2) nightcarry
  resume (finish control 103107–103108 + ON leg); (3) trick
  question (Steve/design call); (4) profile-gate design call
  (Loop A); (5) veterans alive together (Steve's #427
  readiness-gate call); (6) expedition ignition — answered by
  expignite-b DIAG GO this same night (Loop B 0030Z); (7) national
  stickiness — answered DIAG-NO-GO on power this same night (Loop B
  0030Z); (8) answercourt landing decision, competent seat-taking
  BUILD, family-7 program decision (Steve-calls). Scale-onramp
  stays converging.
