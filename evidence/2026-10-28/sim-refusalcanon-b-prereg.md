# sim-refusalcanon-b — prereg: one canon doc for ability-action refusals + pantry ledger accounting

Run: fleshout-loop-b-20261028T1330Z, axis food-economy, arm sim-refusalcanon-b.
Worktree branch: sim-refusalcanon-b. DOC ONLY: zero src/js changes, zero
policy changes, zero game behavior changes. No sim band (a doc arm needs
none; wall numbers are inherited/quoted, never newly measured here).

## Task

Close tracker next-blank (5) for food-economy (run
fleshout-loop-b-20261028T0630Z): no canon doc covers ability-action
refusals or pantry ledger accounting. Write ONE new canon doc,
docs/ABILITY-REFUSALS.md, grounded ONLY in already-landed evidence and
code read in this worktree. Register it in docs/CANON.md's manifest
(the repo's own convention for canon docs) — docs-only, no src/js.

## Grounding sources (read before writing; do not re-measure, do not re-score)

- evidence/2026-10-28/sim-onceaday-scope-b.md — predictor cost scope
  (prediction pure, 0/0/0 deltas), target=null button honesty judgments,
  dive_deep boundary false refusal (since fixed, see below), daily-gate
  inventory.
- evidence/2026-10-28/sim-barwhy-b.md — disabled buttons show why
  verbatim; enabled buttons carry no stale why; availability parity.
- evidence/2026-10-28/sim-calmbeast-b.md — calm_beast fight-scanning
  precheck/impl, monster guard, fled-fighter edge, monsters-uncalmable
  held for Steve.
- evidence/2026-10-28/sim-caughtlift-b.md — caught-lift −20 unbooked
  (DIAG-NO-GO): direct v.trust write, observe() no-op, no telemetry /
  memory / gossip / ledger trace.
- evidence/2026-10-28/sim-caughtlift-fix-b.md — fix landed: bumpTrust
  with reason + observe() table entry; clean lift books nothing;
  pantry-lift convo line STILL unreachable (victimless theft) — OPEN,
  Steve-call, do not resolve.
- evidence/2026-10-27/sim-spandraw-design-b.md — span-draw class is
  timing, not ability; span-keyed dedup; pre-payment vs post-payment
  refusal distinction (three keys refused after payment and still
  crossed a night).
- evidence/2026-10-27/sim-stockdoors-b.md — boundary-aware ledger
  closing (post-run finalPantry), doors census, named/generic/dried
  closure numbers, zero-record paths.
- evidence/2026-10-27/sim-driedhunt-b.md — generic dried residuals
  FOUND as unanswered-raid loot via the unwrapped _removePantryKcal
  door (villageAgencyDaily, 800 asked, longest-spoilDay-first).
- Landed code verified in this worktree by reading it (not by
  re-running sims): src/js/abilityActions.js _actionAvailable (null
  target), _onceADayPostPaymentDay, _calmableFighter, challenge /
  end_it_before / dive_deep / trophy prechecks, caught-lift bumpTrust
  + observe calls; src/js/game.js bumpTrust tele('trust') (~8118),
  observe() caught_you_stealing entry (~17162); src/js/app.js ctx-why
  render; src/js/villageAgency.js raid take (~203); src/js/hierarchy.js
  _removePantryKcal; src/js/game.js stockSurplus (~29121).
- Landed-commit checks (git log in this worktree): refusalprecheck-b
  10ef1e627, divedeep-fix 0761aab9b, calmbeast 2d9ef7c7e, barwhy
  60f873319, caughtlift-fix 98784fc00 are all ancestors of HEAD.
- Sibling arm sim-postpayrefusal-b: branch tip ab51f772c is a PREREG
  commit only ("re-proof of landed prechecks"), NOT an ancestor of
  HEAD. Its re-proof is therefore NOT claimed as done. The prechecks
  themselves are landed via refusalprecheck-b above — the doc must
  keep those two facts separate and must not depend on the sibling's
  files or code.

## Scope rules

- DOC ONLY. Any doc/code discrepancy found while writing is recorded
  as an open finding in the evidence file (TABLE.md/sysBond class),
  NOT fixed in code in this arm.
- Do NOT resolve the pantry-lift convo-line design call (Steve-call).
- Do NOT touch scale-onramp work, home-village birth work, the main
  tree, or any other run's worktree.
- No invented rule. No resolved Steve-call. Every rule traces to a
  cited evidence file or a code location read in this worktree.

## GO bar (judged exactly as written; a miss is NO-GO, never re-scored)

GO iff ALL hold:
(a) docs/ABILITY-REFUSALS.md exists and covers, in plain words plus
    code/evidence citations: refusal timing (pre- vs post-payment),
    button honesty (null target, scan-defaults, why display),
    once-a-day + day-roll predictor scope, caught-lift booking
    (bumpTrust/tele/observe, trust ≠ reputation), pantry ledger
    accounting (closing definition, doors, span-keyed dedup, raid
    loot), and what a player actually sees.
(b) Every previously-named refusal/ledger blank from the grounding
    sources is either covered in the doc or explicitly listed as
    still-open with its evidence path — including the pantry-lift
    convo line, the unmerged sibling re-proof, monsters-uncalmable,
    the fled-fighter edge, and the still-unproven ledger paths.
(c) A verification pass re-reads the doc against its citations and
    lists any uncited claim; zero uncited claims remain at commit.
(d) Worktree contains only committed work at handoff; commit via
    scripts/safe-commit.sh only; no push, no bump, no live check.

## Metric review (for the NEXT run, not this one)

- This prereg's GO bar judges a document, not a sim effect; there is
  no band, no panel compare, and no wall-number claim. Wall numbers
  in the evidence file, if any, are quoted from the grounding arms.
- If a future run finds a doc rule contradicted by later code, the
  doc — not the code — is the thing to revise first, with the new
  evidence cited; canon follows measured evidence, never the reverse.
