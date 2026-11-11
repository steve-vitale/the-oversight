# sim-proofrefresh-b6 — measurement-proof refresh, round 6 (Loop B adoption)

- **Run:** fleshout-loop-b-20261111T2030Z, arm sim-proofrefresh-b6 (Loop B 2030Z)
- **Adoption:** the 2030Z coordinator timed out before the panel finished;
  the main session adopted the arm (loop-closeout skill) and completed it.
  Coordinator evidence: `evidence/2026-11-11/sim-winnability-round-2030.md`.
- **Prereg:** `evidence/2026-11-11/sim-proofrefresh-b6-prereg.md` (committed
  `3ba0a39ad` before any panel run)
- **Proof test:** `scripts/test-proofrefresh-b6.js` (committed `eaba712f4`,
  12 legs modeled on b5)
- **Worktree:** `~/workspace/worktrees/sim-proofrefresh-b6`
- **Branch:** `sim-proofrefresh-b6`
- **Base SHA:** `d33ca69f9` (read in the main tree before the panel run);
  the branch is on `1f27fd269` (r180 social-life adoption), which contains
  d33ca69f9 plus the r180 favorreq-exit fix (`src/js/convo-dialogue.js`,
  a manifest file — the panel measures the branch's code, which is the
  code the proof will be re-pointed on).

## Why the refresh was owed

The retained b5 panel (`evidence/2026-11-11/neutral-proofrefresh-b5.json.gz`,
generated on the 49ca310fa-based branch, rebased to 3eec28a81) went stale
when the 1830Z run's mournblooded arm landed `13e6f40ae` — a game-code
change to `src/js/standing.js` (hold beat mourns the blooded, finding
#472), a manifest file. `test-measurement-proof-update.js` FAILED on
d33ca69f9 with "Proof source inputs are not current". Exactly one manifest
key differed (standing.js); no other manifest file moved between the b5
panel's sources and d33ca69f9.

## Panel

- **Command:** `node scripts/balance-panel.js --out .proofrefresh-b6-panel --n 16 --days 150`
  (driver defaults: policies capable, risk-aware, socialite, winseek;
  proof-seeds = first seed, 7; 68 jobs: 64 observer-on + 4 observer-off
  proof cases). Seeds: the driver's default 16
  (7, 42, 99, 1234, 555, 777, 2026, 31337, 1, 2, 3, 4, 5, 6, 8, 9),
  identical to the b5 panel's seed list. No new seed band consumed.
- **Run history:** the 2030Z coordinator launched the panel and it cached
  32/68 cases before the cron timeout killed the run. The adoption resumed
  the same command in the same `--out` dir (4 stale `.json.tmp` partial
  writes from the killed run removed first; the driver re-ran those 4 jobs
  cleanly). Remaining 36 cases completed in the adoption run.
- **Output:** `evidence/2026-11-11/neutral-proofrefresh-b6.json.gz`
  (new file — the b5 and reconcile panels are NOT overwritten).
- **Master-move check (prereg rule):** master moved during the panel
  window, 1f27fd269 → 51bd2542c (the survivalcontrol arm: prereg +
  instrument + evidence/corpus). `git diff --name-only` between the two
  SHAs touches ONLY `evidence/` and `scripts/survivalcontrol-*.js` —
  no manifest file (no `src/`, no `scripts/policies/`, no `index.html`).
  Per the rule the panel is KEPT, the branch is rebased onto the explicit
  new master SHA, and all proof legs are re-run on the rebased branch
  before the coordinator's `--ff-only` merge.

## Results — GO, 12/12

- **Panel:** 68 jobs complete (64 observer-on cases + 4 observer-off
  proof cases); `panel.json.gz` 1,060,593 bytes, saved 22:49Z.
  `scripts/balance-proof.json` re-pointed at
  `evidence/2026-11-11/neutral-proofrefresh-b6.json.gz`
  (digest `06f38709186bb0b513fe7477a968b58105fa7cf375ffe9b17dde1edfe9d22da7`).
- **`scripts/test-proofrefresh-b6.js`: 12 passed, 0 failed** (exit 0,
  run on the branch after the re-point):
  - balance-proof-update validate passes on the new panel
    (normalizedSources match `scripts/balance-proof.json`)
  - test-measurement-proof-update.js exits 0
  - test-measurement-workflow.js 9/9
  - test-measurement-cache-flags.js 4/4 (no spawn-timeout replication
    needed — clean first pass)
  - validate-ontology.js exits 0 (all 138 systems validated)
  - neutrality match on every proof case
    (capable@7, risk-aware@7, socialite@7, winseek@7: all match,
    0 warnings)
  - panel rows complete: 64 rows, 64 distinct policy/seed combos
  - neutrality verdict reproduces the retained panel (b5) on every
    proof case — regeneration moved no verdict
  - neutrality verdict reproduces the reconcile panel (second reference)
  - validity.sourcesStable true
  - stale-input negative check: the retained b5 panel FAILS validate
    on this tip with "Proof source inputs are not current"
  - stale-input negative check, second reference: the reconcile panel
    also FAILS validate on this tip
- **All prereg GO legs (a)–(f) hold.** The measurement proof is current
  again on this branch: the proof tests pass, the panel is complete and
  neutral, and the negative checks prove the green result is not vacuous.

## Metric review

- The primary metric (`test-measurement-proof-update.js` pass/fail on the
  rebased tip) judged what it claimed: the proof was stale before the
  refresh (exit 1, exactly one manifest key moved) and is current after
  it (exit 0, 12/12 legs).
- No delta in the neutrality reproduction: the fresh panel's neutrality
  tuples are identical to the b5 panel's and the reconcile panel's on
  every proof case. Regeneration alone moved no verdict.
- Nothing outside the refresh's scope surfaced: no src/js change by this
  arm, no balance question judged. The survival-collapse control leg
  (sibling arm, same run) is reported in the coordinator evidence.
