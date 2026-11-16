# sim-scale-onramp-round-0115 — Loop A 0115Z coordinator evidence (adoption)

**Run:** Loop A, 2026-11-16 01:15Z occurrence. **Adoption by the main session**
(the 0115Z coordinator timed out before its gate finished; the vetparty
check.js it started was interrupted mid-run with an empty log, outcome
unknown). **Base at adoption:** master `126382932` (gatereach); rebased
twice during adoption (onto `8aed1dbfb` r218 succession, then onto
`4c30c022a` deepening r218). **Final tip:** `55d1c8f02`.

## Arms

### 1. sim-vetparty-a — A/B + gate + merge-or-kill (the 2115Z claim's open arm)

**Verdict: PILOT NO-GO — lever KILLED, reverted, evidence-only landing.**

- Lever: wave-4 re-engagement party (win-plan.js / villager-brain.js /
  game.js) — the party persists as a trio until the monster type is killed
  or a member dies; companion launchability hoisted to named
  `companionLaunchable(self, cid)`.
- Panel: 8 seeds 100821–100828, 150d, competent, shared baseline.
  Control: 6/8 survived, vet5@end 1.0. Armed: 4/8 survived, vet5@end 0.5.
  The trio never launched; SEEK fired 0 times.
- Frozen bars: bar 1 FAIL, bar 2 FAIL, bar 3 PASS.
- The lever was reverted on the branch (`7ba893b4b`); the revert was
  verified by the run coordinator (260 src deletions are exactly the
  lever's own lines, reverse-applied; worktree game files byte-identical
  to pre-lever) and re-verified by adoption: `git diff` of the branch tip
  against current master over `src/js/` is **0 lines**. The branch adds
  only evidence, instruments, and the proof test.
- Mechanism note (from the evidence): the party never forms because the
  launch conditions (gear-up at launch, sick stay home, range-0 can't go,
  hurt <70 HP needs medicine or a healer at camp) are almost never all
  true at dawn on these seeds. A follow-up lever would need to attack
  the launch conditions, not the party persistence — the persistence half
  was never exercised.
- Wall numbers this panel: wins 0/8 both legs, table 0/8 both legs
  (balanced panel `vetparty-a-panel.json`, decision `review_required`).

### 2. sim-grecorder-a — merge verification (claim arm 2, verify only)

Already merged before this round: `9f46c27f2`, verified an ancestor of
master at adoption start and again at closeout. No action needed.

## Gate (adoption re-runs)

`node scripts/check.js --quick` run **three times** during adoption, all
on rebased tips, all agreeing:

- Pre-rebase tip (base `126382932`): **333/7**.
- `8aed1dbfb`-based tip: **333/7**.
- Final tip `55d1c8f02` (base `4c30c022a`): **333/7**.

The 7, identical every time: living-garden + one-person-army (120s load
timeouts, standing artifact class); measurement-proof-update +
measurement-workflow (staleness pair, standing); phone-frame-proof (stale
receipt, standing); ladder-bundle (ambient-raid suppression — gorgeprice2
guard side-effect, r213-adjudicated substrate); person-trust (HAUL 3 vs 0
— r214 parting-pool RNG shift, r213-adjudicated substrate).
**Gate verdict: GO, 0 attributable to vetparty.** The deepening-r218
analyzer test added by the final base is not on the quick list (0 mentions
in the gate log), so the count is unchanged across bases.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-15/perseed-vetparty-a-on/*.json'
--metrics national,table,wins,exiled` — **REFUSED**: the per-seed files
are sweep recorder rows (all 8 carry top-level `anchorCommit`), not run
baselines. Same refusal pattern as the 1415Z round. Baseline NOT rolled,
documented as refusal. Recorder corpora are compared with sweep-compare
tables, never against a run baseline here.

## Closeout

- Merged ff-only by adoption (see timeline entry for the merge SHA).
- Worktree `sim-vetparty-a` released (done-merged), dir removed, branch
  deleted.
- Claim `fleshout-20261116T0115Z.json` deleted; claim
  `fleshout-20261115T2115Z.json` deleted (vetparty was its last open arm —
  the 2115Z adoption is now FULLY closed: alignstep merged, grecorder
  merged, vetparty killed-and-landed as evidence).
- Lock `fleshout-loop.lock` (run `fleshout-20261116T0115Z`) deleted after
  verifying the run_id matches.
- Main tree verified clean after merge.
- Tracker updated (0115Z review section appended below the 2115Z review).

## Next blanks (scale-onramp, converging, NOT converged)

1. Family-7 program decision (guardablate-fresh CONFIRMED; alignstep
   third UNMEASURED-substrate read; the collapse regime reads gone on
   master tip — a program call is owed, not another substrate read).
2. Headcount-ceiling (Steve-call).
3. Wild Reunion mirror pack (Steve design call).
4. Answercourt lever landing decision (Steve — cost call still open).
5. Competent seat-taking BUILD (Steve-call).
6. Second-companion pool (Loop B blank).
7. Substrate re-check for test-covenant-b / test-courtship-b /
   test-onlylead2-b on the new tip (Loop B blank).
8. Veterans survivorship — vetparty was the lever response and it is now
   KILLED; the survivorship question needs a new lever aimed at launch
   conditions, not party persistence.
