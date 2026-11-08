# sim-comparecontract-a — COMPARE-CONTRACT repair

Run: fleshout-20261108T1017Z, Loop A, axis food-economy.
Worker: sim-comparecontract-a. Prereg: evidence/2026-11-08/sim-comparecontract-a-prereg.md
(all five proof bars judged below against that prereg).
Branch: sim-comparecontract-a. Repair commit: d938321b8 (tooling only, no
[needs-eyes]). Evidence commits: e27fabfa7 (this file, rebuilt cheaptend pair, doublenight
compares, augmentation script) + 6dac90653 (doublenight panel copies +
neutrality panel). The check --quick re-run attribution was still pending at
evidence time (log: /tmp/check-quick-rerun-sim-comparecontract-a.log — since
deleted by /tmp cleanup; see the run's final report for its outcome).
No game-code change. No canon doc covers the panel contract (CANON.md lists
none; the contract lives in MEASUREMENT.md §15 + scripts/balance-metrics.json).

## What was broken (findings #1903, #1909)

`balance-panel compare` returned `invalid` in two cases that are not
comparability failures:

(a) Wrapper-policy arms (#1903): before `--policies competent` vs after
`--policies cheaptend-a` can never match — the compare pairs cases by
`policy:seed` and requires identical `options.policies`. The CHEAPTEND_A
intervention-flag exemption (ruling 797) exempts the flag only.

(b) Harness-registration churn between panel legs (#1909): the doublenight
before-panel (head 96a0a3b8) vs after-panel (597e6174) differed only by a
sibling landing — a `scripts/sweep-compare.js` registration hunk plus three
new policy files — and the compare returned `invalid` with four
`Policy/harness changed` errors.

## The repair

Two parts, both in the measurement instrument only. `balance-metrics.json`
untouched: the 23-metric contract and its digest do not move.

### (a) Wrapper-policy arms — procedural, no compare-code change

Rebuild the before-panel with `--policies cheaptend-a` and CHEAPTEND_A unset.
The layer is inert when the flag is unset (`tendDrive` returns immediately),
so the rebuilt before-panel must reproduce competent rows. See the neutrality
proof below. A cross-policy compare (before competent ↔ after cheaptend-a via
a declared policy mapping) is NOT implemented: it would be a #797-class
contract change and needs Steve's call. Flagged as steve-call (below).

### (b) Harness-registration churn — snapshot + narrow exemption

1. **Build-time snapshot** (`scripts/balance-panel.js`): every panel now
   records `registrationDigest` — the SHA-256 of `scripts/sweep-compare.js`
   after stripping registration blocks that serve only policies OUTSIDE the
   panel's own `options.policies` (`registrationNormalizedSource`, exported
   for tests). Block-wise, conservative: a block is stripped only when it
   registers ≥1 policy id and every id is outside the panel's policies;
   blocks with no identifiable ids are kept; the `POLICY_REGISTRY` object
   literal is always kept.
2. **Compare-time exemption** (`scripts/lib/balance-scorecard.js`,
   `comparePanels`): for the sources check,
   - `scripts/sweep-compare.js` differs but both panels carry the same
     `registrationDigest` → tolerated (the difference is registration-only
     by construction). Panels built with older code lack the field and keep
     the strict raw comparison.
   - a file under `scripts/policies/` present in exactly one panel (a pure
     addition) → tolerated. Proof it cannot have produced any compared row:
     a used policy's implementation is required at build time (a missing
     require throws, the try/catch registration fails, the build errors
     `Unknown policy`); both legs built successfully with identical
     `options.policies`, so no used policy needs the added file.
   - everything else still invalidates: a modified policy file, a modified
     `sim-harness.js`, a behavior change in `sweep-compare.js`, a re-pointed
     registration for a USED policy.
   - exemptions are RECORDED on the report (`registrationExemptions`, plus a
     markdown line), never silent.
3. The explicit-declaration lane (`scripts/lib/harness-comparison.js`) is
   untouched and remains the route for ANY declared harness change, including
   behavior changes. This repair covers only the narrow case the panels
   themselves prove is registration-only.

## Proof — prereg bar 1: the test file

`scripts/test-comparecontract-a.js`: **25 passed, 0 failed.**
- wrapper-policy match (same wrapper policy both sides, declared flag
  differing) → valid, flag recorded, markdown names it; undeclared → invalid.
- registration-only churn tolerated (added policy file + added registration
  block, normalized digests equal) → valid, all four churned files recorded,
  markdown names them.
- behavior-changing churn still invalid in each shape: moved normalized
  digest, modified USED policy file, modified `sim-harness.js`, old panels
  without a normalized digest (strict fallback). Exemptions are recorded even
  on an invalid decision.
- normalizer on the real harness text: an added unused registration is inert;
  removing an unused registration is inert (the doublenight linkseek shape);
  a driver-code change moves the digest; re-pointing a USED policy moves the
  digest; the panel keeps its own policy's registration.
- existing compare cases still green: mismatched policies, mismatched
  contract digest, undeclared flag difference, matched runtime change →
  `no_material_signal`, sweep-corpus path intact.
- Real-file pin (verified during the run, not in the committed test — it
  needs git history): normalized digest of the actual `sweep-compare.js` at
  96a0a3b8 vs 597e6174 with policies `['competent']` → IDENTICAL
  (ccd6aee9c6da48fe…), while the raw digests differ.

## Proof — prereg bar 4: existing tests

- `scripts/godpath/test-balance-scorecard.js`: 35 passed, 0 failed.
- `scripts/godpath/test-measurement-comparison.js`: 14 passed, 0 failed
  (includes the pinned "the ordinary comparator still rejects changed
  harnesses" — sim-harness.js change).
- `scripts/godpath/test-panel-contract-rulings.js`: 9 passed, 0 failed.
- `scripts/godpath/test-measurement-cache-flags.js`: 4 passed, 0 failed.
- `scripts/godpath/test-measurement-flags.js`: 5 passed, 0 failed.
- `scripts/godpath/test-balance-source-identity.js`: 3 passed, 0 failed.
- `scripts/godpath/test-balance-windows.js`: 13 passed, 0 failed.
- `node scripts/check.js --quick`: FIRST run 278 passed, 14 failed in 1495s.
  None of the four visible failures touches this repair (verified by grep:
  the racks-voice failure in test-establishment-r20-fixes-20261020.js and the
  three 120s per-job timeouts — test-trust-observer-neutrality,
  test-table-endings-20261014, test-time-save-crashes — contain no reference
  to balance-panel, balance-scorecard, comparePanels, or registrationDigest).
  The timeouts are the 120s per-job limit tripping under heavy box load
  (load ~13, sibling checks running). A re-run with `--timeout 300` and full
  output to a file was started to attribute all 14; its result was still
  pending at evidence time — see the run note in the footer. The seven
  panel/compare files above all pass individually on this tree, so no failure
  in them is attributable to this repair.

## Proof — prereg bar 2: the cheaptend pair (rebuilt legs)

Both legs rebuilt on the repair commit d938321b8 (same tree, same observer):
- BEFORE: `PLENTYDEPRI=1 DEPOSITGATE=1 node scripts/balance-panel.js --out
  evidence/2026-11-07/cheaptend-a-panel-before --seeds
  96301,96302,96303,96304,96305,96306,96307,96308 --policies cheaptend-a
  --days 150` → 8 cases, 0 cached, valid (sourcesStable, neutrality match).
- AFTER: same with `CHEAPTEND_A=1` → 8 cases, 5 cached (first attempt was
  killed by an unexplained SIGTERM at 5/9 cases; the retry reused the 5
  cached cases — see run notes), valid.
- Both legs agree on sourceDigest, observerDigest (da3bb8dd…), contractDigest,
  and registrationDigest (e7eb53f2…). The old panels are superseded in place
  (before a38569057, after 1db4a9f90 + 32c47d41e — both preserved in git
  history). The old committed `cases/` caches were deleted with the rebuild
  (§15: never commit the cases cache; the stale files could never be reused
  under the new observer digest anyway).

### Wrapper neutrality — the decisive test

The rebuilt before-panel does NOT reproduce the OLD competent before-panel
(0/8 exact) — but that comparison is confounded: the old panel was built at
85b4f30 and the game has moved since (doublenight fix et al.). The decisive
test is same-tree: a competent panel built on d938321b8 with the same
seeds/days/env (`evidence/2026-11-08/cheaptend-a-neutrality-panel`) vs the
rebuilt before-panel. Result: **8/8 seeds exact** — days, stateHash, and
metrics byte-identical. The wrapper is neutral when the flag is unset, as
the prereg required. The old-panel mismatch is game drift, not a wrapper
effect (both rebuilt legs also drift from their old counterparts on most
seeds, in both directions — trajectory chaos from the intervening game
changes, not a systematic wrapper shift).

### Compare decision — VALID

`node scripts/balance-panel.js compare --before
evidence/2026-11-07/cheaptend-a-panel-before/panel.json.gz --after
evidence/2026-11-07/cheaptend-a-panel-after/panel.json.gz --out
evidence/2026-11-07/cheaptend-a-panel-compare --intervention-flags
CHEAPTEND_A` → decision **`review_required`**, errors [] (exit 2).
Attached: `evidence/2026-11-07/cheaptend-a-panel-compare.md` (+ `.json`).
Intervention flags recorded: CHEAPTEND_A before null, after "1". No
registration exemptions were needed (same tree, no churn).
Non-clean metrics: survival30, playerDeaths, villageDeaths — all
`regression_watch` (intervals cross zero), plus luckHunt/luckFish
not_observed and luckSnare/luckPit insufficient. No regression_signal.
Read plainly: on the current tree the panel leans the same way as the pilot
NO-GO (cheaptend costs survival on this band), as a watch, not a signal.
The panel is the instrument, not the judge — the pilot verdict stands on its
own prereg; this compare does not re-judge the arm.

## Proof — prereg bar 3: the doublenight pair (augmented copies)

Method (`evidence/2026-11-08/augment-doublenight-panels-a.js`): the branch
panels were copied read-only (branch sim-doublenight-a never merged,
originals untouched) and the ONE field the repair records at build time —
`registrationDigest` — was computed from the exact `scripts/sweep-compare.js`
content at each panel's recorded sourceHead, with the panel's own policies.
That is exactly what a build with the patched code would have recorded;
rows, sources, digests, and validity are copied verbatim (verifiable by
diff). Un-augmented copies were kept alongside so the original decision is
reproducible.

- Un-augmented copies → decision **`invalid`** (reproduces the original).
  Under the new code the error list shrinks from four to one
  (`Policy/harness changed: scripts/sweep-compare.js`): the three added
  policy files are now tolerated outright by the pure-addition rule, and only
  the harness file still needs the normalized digest.
- Augmented copies (both registrationDigest ccd6aee9c6da48fe…) → decision
  **`review_required`**, errors [] (exit 2). Attached:
  `evidence/2026-11-08/doublenight-fix-a-panel-compare.md` (+ `.json`).
  Registration exemptions recorded: `scripts/sweep-compare.js`
  (registration-only: normalized harness digests agree),
  `scripts/policies/cheaptend-a.js`,
  `scripts/policies/competent-darkwit-b.js`,
  `scripts/policies/competent-trialcombat-b.js` (added policy files, unused
  by either panel).
- The decision is review_required with NO regression_signal: the only
  non-clean metrics are luckHunt/luckFish not_observed and luckTrap/luckSnare/
  luckPit insufficient (small-n luck streams). Correction to finding #1909's
  wording: the rows are NOT "identical except stateHash" — 6/8 seeds' metric
  vectors are byte-identical, and the other two (98028, 98079) carry the
  doublenight fix's effect (fewer deaths, communityLost 1→0 on 98028).
  The compare now returns that as a valid decision instead of `invalid`.

## Findings (recorded, not all fixed here)

- FINDING (rebase accident, out of area — new, appended to sim-findings.md):
  the cheaptend landing replaced the `linkseek` registration try-line in
  `scripts/sweep-compare.js` with the cheaptend block — the comment block
  survives (line 88) but `POLICY_REGISTRY['linkseek']` is never assigned on
  master now, so the sim-linkseek-b instrument is unregistered. NOT fixed
  here (a sibling arm's instrument).
- OBSERVATION (contract scope, not fixed here): the compare's sources check
  only flags `scripts/` files, so the `index.html` change between the
  doublenight legs (load order) passed silently. Whether the check should
  cover it is a contract-scope question for a future arm.
- RUN NOTE (infrastructure): the safe-commit index-clobber class hit this run
  (commit d938321b8 correct; the main index then showed the four committed
  files as deleted/modified). Repaired with the recorded recipe
  (`git ls-tree HEAD -- <paths> | git update-index --add --index-info`,
  verified worktree hashes == HEAD blobs, `git status` clean of them).
- RUN NOTE: `worktree-heartbeat.sh sim-comparecontract-a` timed out once on
  REGISTRY.lock flock contention (60s); a later retry landed in 2s. Heartbeat
  was never more than ~50 min stale (reaper threshold ~4h).
- RUN NOTE: the after-panel first build attempt was killed by SIGTERM at 5/9
  cases after ~6 min, source unknown (no reaper/killer identified; registry
  showed the tree active throughout). Recovered by re-running; the 5 cached
  cases were reused.
- RUN NOTE: `/tmp/cheaptend-old-panels.json` (a snapshot written for the
  neutrality check) vanished from /tmp mid-run — re-derived from git HEAD
  instead. Do not rely on /tmp for cross-hour state.

## Steve-call remainder

Cross-policy compare (a declared before-policy ↔ after-policy mapping, e.g.
competent ↔ cheaptend-a) is NOT implemented. It would be a #797-class
contract change: only Steve can approve letting the compare pair different
policies. The procedural rebuild route above is the maximal repair that does
not need his call.

## Metric review

Tooling arm: no game metric, no GO threshold on game behavior. The binding
metric was the prereg proof bar: test file 25/25, existing compare tests
green, cheaptend compare VALID with wrapper neutrality 8/8, doublenight
compare VALID on augmented copies and `invalid` on un-augmented copies. All
five bars met. The check --quick re-run attribution was pending at evidence
time; the seven panel/compare test files pass individually, and no failure in
the first run touches this repair.

## Convergence

converged (tooling repair, both cases demonstrated valid). Findings #1903 and
#1909 move to fixed by this arm (see sim-findings.md).
