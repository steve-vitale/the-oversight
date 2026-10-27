# sim-residual2b — PRE-REGISTRATION (written BEFORE any judged trace)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T0630Z, axis
food-economy, arm sim-residual2b. DIAG/measurement only: zero src/js
changes, no default flips, no game-code lever. This arm does NOT re-judge
the stockdoors NO-GO or the residualhunt GO — its verdict is ONLY whether
the two left-open residuals below trace. Judged ONLY against this prereg.

## Question (verbatim from the coordinator's assignment)

Trace the two left-open residuals from the 0530Z residualhunt
(evidence/2026-10-27/sim-residualhunt-b.md, "Open items" section; corpus
evidence/2026-10-27/sim-residualhunt-b-corpus/, pinned pre-c04d4e0cb base,
game.js blob b2ba423afdfbdce8c98751ef544f10805b46cfa6, policy
competent-nofeast, seeds 9820-9827, horizon 100d):

(a) Lamb's Quarters dried -800: between the day-81 and day-82 snapshots,
dried Lamb's Quarters fell 3,840 -> 3,040 with NO record in any of the six
instruments (no dried draw, sweep, transform-out, direct record, or inflow
on days 81-82; day-82 flows for OTHER families are recorded normally, so
this is not a blanket snapshot gap). It nets to -120 in the family residual
after the +680 day-100 dried draw. Candidates noted in the evidence: an
unwrapped direct path, or a snapshot-timing effect whose record sits on a
non-adjacent day.

(b) Muscadine 9825 -864 (passes at 0.39%): negative residual with zero
day-100 draws — a different small component, not a closing-boundary case.

## GO threshold (pre-registered exactly as assigned — copied verbatim, not softened)

GO iff BOTH targets are traced exactly to named records, OR one is traced
exactly and the other is decomposed with its dominant component exact and
its remainder itself itemized (traced-with-open-remainder, reported not
hidden). A target counts as TRACED iff the trace names the specific records
(or the specific boundary mechanism with the specific records) whose kcal
sum equals the residual exactly.

A miss is NO-GO, never re-scored against a friendlier metric mid-run;
metric doubts go under a "metric review" section for the NEXT run.

## Prereg header (MEASUREMENT.md §§11, 14)

- Primary metric: per-target trace exactness — the named records' kcal sum
  vs the target residual (-800 dried component for (a), -864 for (b)),
  plus, for (a), the net -120 family-residual arithmetic (dried -800 +
  day-100 dried draw +680, against the already-traced base +1,250).
- GO threshold: as above, verbatim.
- Horizon + why: 100d, inherited from the residualhunt corpus — the
  residuals are defined over that horizon (closing snapshot day 100,
  post-horizon flows day 101); no new horizon is set because phase 1
  traces a committed corpus, it does not re-run sims.
- Seeds: 9820-9827 (corpus substrate); the two targets live on seeds
  9825 only (Lamb's Quarters dried, Muscadine), but the corpus integrity
  check covers all 8 seeds.
- Policies: competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off), as in the corpus.

## Method — phase 1 (the judged verdict)

1. Trace on the COMMITTED residualhunt corpus only — do not duplicate the
   corpus into this arm's evidence dir, cite it.
2. Vendor scripts/trace-residualhunt-b.js under a residual2b name
   (scripts/trace-residual2b.js); never modify residualhunt- or
   stockdoors-named files. The trace script reconstructs the family ledger
   over the spoilDays snapshot series; for target (a) the dried channel
   is traced separately from the family total (the -800 lives in the
   dried channel, and the family-total trace already nets it against
   the base channel).
3. Trace caveats from the residualhunt evidence are BINDING: snapshot/flow
   day numbering lags by ~1 transition and cancels within the horizon on
   closing families, so single-transition steps are NOT verdicts; only
   persistent steps and post-horizon flows name a residual; separate
   within-horizon from post-horizon before claiming any door.
4. For each target, report a per-target trace table with exact kcal
   arithmetic: residual, each named component with its records, sum,
   remainder. A component counts only if its records are named (record
   kind, day, item, units, kcal each) or its boundary mechanism is named
   with the specific records it covers.
5. Sibling-arm boundary: do NOT touch the sibling arm's tree or files
   (sim-ledgerbound-b is re-judging legs under a boundary-aware closing
   in its own tree; the coordinator reconciles). If the -800 finding
   explains the sibling's Lamb's Quarters -120 net, report it plainly
   without assuming the sibling's outcome.

## Contingency — phase 2 (stated BEFORE judging; separate reporting)

If the corpus alone cannot name a component, a second-phase DIAG-only
recorder plus a pilot rerun on seeds 9820-9827 on the pinned base may be
added — but second-phase results are reported separately and do NOT
retroactively change the phase-1 verdict. If the pinned base is used for
any rerun, follow residualhunt discipline exactly: back up game.js
OUTSIDE the repo, swap, run, restore, verify
`git diff HEAD -- src/js/game.js` is empty, NEVER commit the pin.

## Proof

scripts/test-residual2b.js proves: trace reproduction on both targets,
corpus integrity (the corpus files are the committed residualhunt corpus,
unmodified), and hygiene (zero src/js modified, zero sibling files
modified, pinned-game.js allowance in BOTH hygiene checks if the pinned
base is used). Proof must be GREEN before evidence is committed. No jest
unless needed; never run concurrent jest; if jest is run, use
--cacheDirectory=/tmp/jest-cache-sim-residual2b.

## Balanced panel (MEASUREMENT.md §15)

No game-code change exists, so there is no before/after panel — stated in
the evidence, with the det-gate as the instrument before/after (the
residualhunt proof's det-gate, reproduced by reference, not re-judged).

## Canon read

docs/CANON.md FIRST, then docs/PRESERVATION.md and docs/MEASUREMENT.md
sections 9-12 and 14-15, plus the residualhunt evidence and prereg (all
read before writing this prereg). The food ladder
(cleaned→cooked→smoked→rendered→pemmican) and the "no nonsensical calorie
loss" rule are the canon background for the dried channel; this arm
changes no canon. If no doc covers a target's mechanism, the evidence
says so instead of inventing canon.

## Reported, not judged

- The stockdoors NO-GO: NOT re-judged.
- The residualhunt GO: NOT re-judged.
- The sibling ledgerbound arm's outcome: NOT assumed or judged.
- Reachability on this band: verified from the corpus, not invented —
  the residualhunt band showed waves 1-3, national/table/wins 0/8.
