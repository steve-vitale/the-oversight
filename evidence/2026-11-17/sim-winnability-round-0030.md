# sim-winnability-round-0030 — Loop B 0030Z (winnability chain)

**Run: Loop B `fleshout-loop-b-20261117T0030Z`, axis winnability
chain.** The 0030Z coordinator died before closeout. The 0330Z
occurrence adopted all three arms and built them to completion; its
coordinator then died before the round closeout. Adopted in the main
session the same night: all three arms landed, the round is CLOSED.

## Arms

### sim-expignite-b — DIAG GO (LANDED `c3f440c87`)

- Verdict: DIAG GO, all four frozen bars pass. The zero-attempt
  mechanism is classified, not unknown — findings backlog #2463
  CLOSED.
- Two different zero phenomena, which the medicduty recorder could
  not tell apart: (A) true zero-attempt — seed 103004 never once
  committed to an expedition in 150 days (579 villager-days at
  home, survived 150d, wave 5, standing 300 — a live, healthy
  village that simply never commits); (B) zero-launch-but-attempted
  — three seeds classified too (commit-but-no-depart /
  agency-chance, per the evidence file). The soft path: 0 launches
  in 4,761 villager-days.
- Band 103001–103008 (fresh), 150d, competent verbatim
  (`df9b7dff4de4`), zero `src/` change (recorder wraps only).
  Proof 78/78 (static + D1 + D2 + D3), re-run on the final tip.
  Wall identical both legs: national by rank 0/8, table 0, wins 0.
- Evidence: `evidence/2026-11-16/sim-expignite-b.md`.
  Adoption note: the 0030Z worker died after 1 of 8 OFF seeds
  (s103001, verified intact); the 0330Z run finished the remaining
  7 OFF + all 8 ON seeds without restarting anything.

### sim-nationalsticky-b — DIAG-NO-GO on power (LANDED `a5d3ad97d`)

- Verdict: DIAG-NO-GO on power. G1 instrument validity GO (16/16
  complete JSONs, 0 unknowns, every transition classified — there
  were none); G2 proof green GO (`test-nationalsticky-b.js` 35/35
  on the final tip); **G3 measurement FAIL — 0 reached-national
  seeds (need ≥3): no reach, no lapse, no re-stage on either
  leg**; G4 wall numbers GO (identical both legs).
- The question (findings #2452: "national is not sticky — one
  point of trust drift costs the scale") cannot be measured on
  this band because national is never reached at all — the
  instrument is valid, the phenomenon is absent. A re-run needs a
  band where villages actually reach national first.
- Band 103011–103018 (fresh; 8 seeds × 2 legs = 16 configs),
  200d, competent verbatim (`df9b7dff4de4`), recorder ON vs OFF
  as the only leg difference, `src/` diff zero.
- Evidence: `evidence/2026-11-16/sim-nationalsticky-b.md`.

### sim-companionguard-b — GO, guard ships unconditional (LANDED `1ef267b8b`)

- Verdict: GO, all five frozen bars pass. The companion call must
  not clobber a live expedition (findings #2462, CLOSED — mark
  `fixed` on this landing). The guard ships **unconditional** (the
  env gate was removed on the GO commit) in `villager-agency.js`
  (+16) and `villager-brain.js` (+22/−6) — a defect repair, not a
  lever.
- Orphans 2 → 0 (control seeds 103025 Arturo d101/2, 103027 Juan
  d57/2 — same-part replacements); guard skips 7 (the identical
  two calls plus 5 more on the diverged 103027 trajectory);
  parties hold 57 vs 32; cost bars pass (starvation 1 = 1, median
  survival 151 = 151); proof 115/115; wall unchanged (deaths
  569 → 562, national by standing 4/8 both legs, table 0, wins 0).
- Band 103021–103028 (fresh), 150d, competent verbatim
  (`df9b7dff4de4`).
- Evidence: `evidence/2026-11-16/sim-companionguard-b.md`.
- Adoption (main session): the worker completed the panel and the
  GO commit but died before the evidence commit and merge. I
  verified all five bars against the analysis, re-derived the wall
  from the 16 corpora, re-ran the proof 115/115 on the branch tip,
  rebased onto current master (rebase stop-at-pick quirk struck
  on the GO commit — verified unapplied, `rebase --continue`
  sailed through), re-pinned the proof's scope anchor to the merge
  base (the prereg-commit anchor went stale on rebase because the
  Lane A r230 convo fix then counted as this arm's change;
  assertion unchanged), re-ran the proof 115/115 on the rebased
  tip, ff-merged `1ef267b8b`. The worker's evidence file is
  adopted as written (it is the authoritative record, including
  its honest metric review: bar 2's launch totals are divergence
  noise, the clean read is skips + orphans + proof).
- Balanced-panel cross-check outstanding (recorded in the evidence
  file with exact follow-up commands) — an open cross-check, not a
  verdict input.

## Adoption mechanics (main session)

- Expignite-b and nationalsticky-b landed by the 0330Z run
  (commits verified on master by me: expignite-b `c3f440c87`,
  nationalsticky-b `a5d3ad97d`; evidence files read in full).
- Companionguard-b adopted by me (see above); index clobber
  struck once (the anchor re-pin commit), repaired via ls-tree
  pipe; master moved twice under the night's adoptions
  (expignite-b, then nationalsticky-b) and the rebases tracked it.
- Telemetry check: REFUSED on all three arms — the corpora are
  recorder/driver per-seed JSON, not the checker's input format
  (documented refusal, same as the 2215Z/2230Z rounds and
  vetreengage-confirm). Baseline NOT rolled.
- Round claim/lock: the 0030Z claim is `.DEAD`; the Loop B lock
  belongs to the 0330Z run — deleted by the adoption coordinator
  on this closeout (run_id verified in a separate call first).

## Convergence state

- Winnability chain stays converging (NOT converged): wins still 0
  on competent legs, the table still unreached. This round closed
  three blanks: (1) expedition ignition is classified
  (expignite-b DIAG GO — the never-commit village is the next
  mechanism to explain, not the launch code); (2) national
  stickiness is unmeasurable on a band where national is never
  reached (nationalsticky-b DIAG-NO-GO on power — the next attempt
  needs a reaching band first); (3) the companion-clobber defect
  is FIXED and shipped (companionguard-b GO). The zero-launch seeds
  recur on a fresh band (103023, 103026 — same shape as
  medicduty-b's 102803/102806; the ignition DIAG now classifies
  the mechanism). Next blanks, in order: (1) the never-commit
  village (103004 shape — why does a healthy village never
  commit?); (2) re-attach on higher wave (rumortarget follow-up,
  Loop A 0215Z); (3) nightcarry resume (Loop A 0215Z);
  (4) trick question (Steve/design call); (5) profile-gate design
  call (Loop A); (6) veterans alive together (Steve's #427
  readiness-gate call); (7) answercourt landing decision,
  competent seat-taking BUILD, family-7 program decision
  (Steve-calls). Scale-onramp stays converging.
