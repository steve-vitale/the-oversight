# Pre-registration — sim-comparecontract-a (COMPARE-CONTRACT repair)

Run: fleshout-20261108T1017Z, Loop A, axis food-economy.
Worker: sim-comparecontract-a. Worktree: ~/workspace/worktrees/sim-comparecontract-a.
Date: 2026-11-08. Tooling arm: no game-code change, no new sims beyond panel rebuilds.

## Canon note

No canon doc covers the panel contract (docs/CANON.md lists no panel/contract
doc; the contract lives in docs/MEASUREMENT.md §15 + scripts/balance-metrics.json).
Nothing here invents canon. The repair touches only the measurement instrument.

## The two cases (from sim-findings.md #1903 and #1909)

(a) WRAPPER-POLICY ARMS (#1903, sim-cheaptend-a closeout, run
fleshout-20261108T0615Z, evidence/2026-11-07/sim-cheaptend-a.md §15).
`comparePanels` pairs cases by `policy:seed` and requires identical
`options.policies` on both sides, so before `--policies competent` vs after
`--policies cheaptend-a` can never match: compare returns `invalid`
(`Unmatched policies`, `Unmatched cases`). The CHEAPTEND_A intervention-flag
exemption (ruling 797) exempts the flag only, not policies or case keys.

(b) HARNESS-REGISTRATION CHURN BETWEEN PANEL LEGS (#1909, sim-doublenight-fix-a,
run fleshout-20261108T0915Z, evidence/2026-11-07/doublenight-fix-a-panel.md on
branch sim-doublenight-a). The doublenight before-panel was built at
96a0a3b84, the after-panel at 597e61740; between them a sibling landing
changed `scripts/sweep-compare.js` (cheaptend-a registration block added,
linkseek registration line dropped in the same hunk — see Finding below) and
added three policy files (`scripts/policies/cheaptend-a.js`,
`competent-darkwit-b.js`, `competent-trialcombat-b.js`). Compare returns
`invalid` with four `Policy/harness changed` errors, even though the game
change under test is the doublenight fix and 6/8 seeds' metric vectors are
byte-identical (the other two carry the fix's effect). Verified from the
branch panels: differing manifest files are exactly `index.html` (changed —
NOT flagged by the compare, which only checks `scripts/` files),
the three added policy files, `scripts/sweep-compare.js`, and `src/` files
(the game change itself, correctly not flagged).

## Repair route — (a) wrapper-policy arms: PROCEDURAL, no compare-code change

Rebuild the before-panel with `--policies cheaptend-a` and CHEAPTEND_A unset
(same seeds 96301–96308, days 150, env PLENTYDEPRI=1 DEPOSITGATE=1).
The layer is verified inert when the flag is unset: `tendDrive` returns
immediately (`scripts/policies/cheaptend-a.js`: "gate off: pure delegation").
The rebuilt before-panel must therefore reproduce the old competent
before-panel's rows EXACTLY (days + stateHash + metrics, all 8 seeds); if it
does not, that is a finding about wrapper neutrality, not a pass.
The after-panel is rebuilt too, with the same patched code (my patch changes
`scripts/balance-panel.js` + `scripts/lib/balance-scorecard.js`, both in the
observer file list, so the observerDigest moves; both legs must be built with
one observer to compare). Compare with `--intervention-flags CHEAPTEND_A`.
The old panels stay in git history (before a38569057, after 1db4a9f90 +
32c47d41e); the rebuilt legs replace them in place and the supersede is
recorded in the evidence file.

A cross-policy compare (before competent ↔ after cheaptend-a, e.g. a declared
policy mapping) is NOT implemented here: it would be a contract change of the
#797 kind and needs Steve's call. Flagged as steve-call in the evidence.

## Repair route — (b) harness-registration churn: SNAPSHOT + NARROW EXEMPTION

Chosen shape: snapshot the harness at panel build, and exempt only
registration-only source changes from the invalidation check. The code
supports this shape: panels already carry a full `sources` manifest and the
compare is a pure function of the two panels, so a build-time normalized
digest is decidable at compare time with no new inputs.

### 1. Build-time snapshot (`scripts/balance-panel.js`)

Record `registrationDigest` on every panel: the SHA-256 of
`scripts/sweep-compare.js` after stripping registration blocks that serve
only policies OUTSIDE the panel's own `options.policies`. The normalizer
(`registrationNormalizedSource`, exported for tests) works block-wise:

- A block is a maximal run of consecutive registration-ish lines (comment
  lines, lines containing `require('./policies/` or `POLICY_REGISTRY[`);
  blank lines and non-registration code break blocks.
- A block's policy ids are the literal `POLICY_REGISTRY['<id>']` assignments
  in it, plus dynamic `POLICY_REGISTRY[id]` / `POLICY_REGISTRY['<prefix>'+id]`
  expanded from the array literal on the same line (maker/merchant/caregiver,
  market-dealer/market-hoarder).
- Strip a block iff it registers ≥1 id AND every id is outside the panel's
  policies. Keep the block otherwise — including blocks with no identifiable
  ids (conservative: never strip what cannot be attributed).

### 2. Compare-time exemption (`scripts/lib/balance-scorecard.js`)

In `comparePanels`, for the sources check:

- `scripts/sweep-compare.js`: if BOTH panels carry `registrationDigest`,
  compare those instead of the raw digest; a mismatch still yields
  `Policy/harness changed: scripts/sweep-compare.js`. If either panel lacks
  the field (built with older code), fall back to the strict raw comparison
  (old panels keep old behavior among themselves).
- `scripts/policies/*.js`: a file present in exactly one panel's sources
  (pure addition) is exempt. Proof it cannot have produced any compared row:
  a used policy's implementation is required at build time (a missing require
  throws, the try/catch registration fails, the build errors `Unknown policy`),
  so if both legs built successfully with identical `options.policies`, no
  used policy requires the added file.
- Every other `scripts/` difference (a modified policy file, a modified
  `sim-harness.js`, a behavior change in `sweep-compare.js`, a re-pointed
  registration for a USED policy) still invalidates exactly as before.
- Exemptions are RECORDED on the report (`registrationExemptions`, plus a
  markdown line naming the files), never silent.

### Why this does not weaken the contract

- A behavior change anywhere in the driver (`runComparison`, `stdSnapshot`,
  child path) changes kept text → normalized digest moves → still invalid.
- Re-pointing a used policy's registration is in a block whose ids include a
  panel policy → kept → digest moves → still invalid.
- The existing explicit-declaration lane (`scripts/lib/harness-comparison.js`,
  `compareHarnessRevision`) is untouched and remains the route for ANY
  declared harness change, including behavior changes. This repair covers
  only the narrow case the panels themselves prove is registration-only.
  Existing tests pinning "the ordinary comparator still rejects changed
  harnesses" (test-measurement-comparison.js, sim-harness.js change) still
  hold: sim-harness.js is not registration-only and still invalidates.
- `balance-metrics.json` is untouched: the 23-metric contract and its digest
  do not move. This is a change to WHICH source differences invalidate, not
  to any metric, tolerance, or direction (those remain Steve-call).

### Considered and not chosen

- The explicit-declaration lane for the doublenight pair: it would work
  mechanically, but it labels the result a methodology change and needs a
  human declaration per pair; the registration-only case is provable from
  the panels themselves, so the exemption belongs in the check with a
  recorded note. Behavior-changing harness changes still go through the lane.
- Snapshotting full harness file contents into the panel: heavier than a
  digest and unnecessary — the decision needs equality, not the text.

## Proof bar (GO requires ALL of these)

1. `scripts/test-comparecontract-a.js` green, covering:
   - wrapper-policy match (same policy both sides, declared intervention flag
     differing) → valid;
   - registration-only churn tolerated (added policy file + added registration
     block, normalized digests equal) → valid;
   - behavior-changing churn still invalid: changed line in the driver,
     re-pointed registration for a USED policy, modified used policy file,
     modified `sim-harness.js` → invalid in each case;
   - existing compare cases still green: mismatched policies, mismatched
     contract digest, undeclared flag difference, sweep-corpus path.
   - Real-file normalizer check: normalized digest of the actual
     `sweep-compare.js` at 96a0a3b84 vs 597e61740 with policies
     `['competent']` → EQUAL (pins the doublenight case at unit level).
2. Cheaptend pair: rebuilt before-panel rows == old competent before-panel
   rows exactly (days + stateHash + metrics, 8/8 seeds) — wrapper neutrality;
   rebuilt after-panel compare → decision VALID (any of no_material_signal /
   review_required; the decision text is attached, not pre-chosen).
3. Doublenight pair: un-augmented copies compare → `invalid` (reproduces the
   original decision); augmented copies (registrationDigest computed from the
   exact file content at each panel's recorded sourceHead, via a scripted,
   reproducible step — originals untouched, branch not merged) compare →
   decision VALID, with the decision text attached.
4. Existing panel/compare tests green: `scripts/godpath/test-balance-scorecard.js`,
   `scripts/godpath/test-measurement-comparison.js`,
   `scripts/godpath/test-panel-contract-rulings.js`,
   `scripts/godpath/test-measurement-cache-flags.js`,
   `scripts/godpath/test-measurement-flags.js`, plus `node scripts/check.js --quick`.
5. No other arm's committed panel file is touched; the worktree ends with
   only committed work.

## Metric review

Tooling arm: no game metric, no GO threshold on game behavior. The proof bar
above is the binding metric. Panel rebuilds reuse the cheaptend seeds
96301–96308 (150d, policies cheaptend-a); no new sims beyond the two panel
rebuilds. The doublenight demonstration reuses the committed branch panels
(read/copy only, no merge).

## Findings recorded during intake (not fixed in this arm)

- FINDING (rebase accident, out of area): the cheaptend landing replaced the
  `linkseek` registration try-line in `scripts/sweep-compare.js` with the
  cheaptend block — the comment block survives (line 88) but
  `POLICY_REGISTRY['linkseek']` is never assigned on master now, so the
  sim-linkseek-b instrument is unregistered. Flagged in the evidence file
  and sim-findings.md; NOT fixed here (sibling arm's instrument).
- OBSERVATION (contract scope, not fixed here): the compare's sources check
  only flags `scripts/` files, so the `index.html` change between the
  doublenight legs (load order) passed silently. Whether the check should
  cover it is a contract-scope question for a future arm, not this repair.
