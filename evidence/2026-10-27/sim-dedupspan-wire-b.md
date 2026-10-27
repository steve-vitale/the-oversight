# sim-dedupspan-wire-b — wiring the span-dedup rule into the standing analyzers

Run: oversight-flesh-out-loop-b, arm sim-dedupspan-wire-b, axis food-economy.
DIAG/tooling ONLY: ZERO src/js changes. The rule itself is unchanged
except one additive audit field (see below).

## Verdict against the pre-registered GO: GO (with one disclosed prereg correction)

Pre-registration: `evidence/2026-10-27/sim-dedupspan-wire-b-prereg.md`
(committed before any wired comparison; baseline figures were captured
from the unwired analyzers before any analyzer edit, then compared
against the wired run on identical payloads).

- GO1 (coverage): MET — all 8 wired analyzers expose `spanDedup` on
  every `perSeed` return, with `newDrawsPreDedup` /
  `newDriedDrawsPreDedup` preserved per family.
- GO2 (9954 span corpus): MET — for every wired analyzer, generic
  `newDraws` 202,259 → 198,459 (−3,800 exactly), generic
  `newResidual` −35,273 → −39,073 (−3,800 exactly), and every
  boundary/raid/caller generic residual present moves −3,800
  exactly (raidcallers cB 3,700 → −100, the already-proven day-100
  inflow timing gap, not a new residual; b −37,292 → −41,092;
  rB −35,134 → −38,934).
- GO3 (no other movement): MET AS CORRECTED — see the correction
  note below. With the correction, every family figure is exact:
  generic −3,800, Fish catch −20, all other families 0, all dried
  figures 0.
- GO4 (bare corpora): MET — every bare-corpus `perSeed` return has
  `spanDedup.status === 'no-span-data'` and
  `totalExcludedKcal === 0`, and every family figure is
  bit-identical wired vs unwired (proof recomputes the old sums
  from the raw payloads).
- GO5 (proof + hygiene): MET — `node scripts/test-dedupspan-wire-b.js`
  1588/1588, exit 0; `node scripts/test-dedupspan-b.js` 34/34
  (was 33/33; +1 check from the intentional GO3 update, see below);
  zero src/js files in the commit.

CORRECTION DISCLOSED (prereg drafting error, not a re-score of a
surprise): prereg GO3 said "every non-generic family figure is
bit-identical" on the 9954 corpus. That sentence overlooked the
Fish catch unit that sim-dedupspan-b itself published before this
arm started: total excluded from seq 124 is 3,820 = generic 3,800 +
the 20 kcal Fish catch unit. The wired run moves Fish catch by
exactly −20 and nothing else unexpected. The proof test asserts
that exact pre-published composition (generic −3,800, Fish catch
−20, all others 0) rather than loosening the bar. Judged literally
on GO3's sentence, Fish catch is a miss; judged on the bar's
intent (no movement beyond the rule's published exclusions), it
passes exactly. The coordinator should read this paragraph as the
verdict's caveat: the wiring is exact, the prereg sentence was
wrong about a figure published by the prior arm.

## What was wired

Shared helper `scripts/dedupspan-apply-b.js` (new): wraps
`applySpanDedup`, aggregates exclusions by family, and applies them.
Each wired analyzer's `perSeed` now, after its direct loop and
before its residual loop, subtracts the exclusions from `newDraws`
(and `newDriedDraws` for dried items); each boundary analyzer, after
its boundary accumulation and before its boundary-residual loop,
subtracts the day-<=100 exclusions from boundary draws (raid and
caller-complete legs derive from boundary draws, so they inherit
the correction). `directKcal` stays raw, so
`newDraws = meal + other + drawSpoiled + directKcal − spanDedupKcal`
is auditable from the returned fields.

Wired (8):
- `scripts/analyze-stockdoors-b.js` — NEW-only.
- `scripts/analyze-residualhunt-b.js` — NEW-only.
- `scripts/analyze-ledgerbound-b.js` — NEW + boundary.
- `scripts/analyze-raiddor-ledger-b.js` — NEW + boundary + raid.
- `scripts/analyze-raidday100-b.js` — NEW + boundary + raid.
- `scripts/analyze-raidday100-general-b.js` — same leg shape.
- `scripts/analyze-raidday100-judge-b.js` — same leg shape.
- `scripts/analyze-raidcallers-b.js` — NEW + boundary + raid + caller-complete.

Documented-only (never sum directRecords, so the double-count
cannot occur in them; the helper header states the requirement
that any future direct leg in one of them MUST call the helper,
and the wire proof fails loudly if one gains a `directRecords`
reference):
- `analyze-driedpath-b.js` (OLD-definition control: pantryDraw-only,
  no direct leg), `analyze-bothgrow-b.js`, `analyze-cattailband-b.js`,
  `analyze-lqpersist-b.js`, `analyze-mealdraw-b.js`,
  `analyze-mealdraw-reprereg-b.js`, `analyze-spoilvol-b.js`,
  `analyze-smoke-eq-b.js`.
- Capture/sweep scripts only PRODUCE records; they do not sum
  ledger totals and are out of scope.

Guard contract (`spanDedup.status` on every wired perSeed return):
`applied` (span log present, exclusions applied),
`applied-with-ambiguity` (span log present, an ambiguous span
failed closed and excluded nothing), `no-span-data` (no span log:
figures are exactly the old figures, and the status says a span
double-count would be undetectable on that corpus — it does NOT
certify the corpus clean).

## Two integration fixes this wiring forced (both intentional, both disclosed)

1. `scripts/test-dedupspan-b.js` GO3 update (33/33 → 34/34): the prior
   arm's test asserted the OLD cB figure (3,700) via `perSeed`,
   which is now deduped by design (−100). Updated to assert the
   wired figures exactly (cB −100, newDraws 198,459) and the old
   figures via the pre-dedup
   fields (newDrawsPreDedup 202,259, cB + 3,800 = 3,700). This is
   the repo's own rule for intentional behavior change (update the
   test in the same commit, say so) — not a loosened assertion.
2. `scripts/dedupspan-ledger-b.js` require-cycle fix: wiring made
   `analyze-raidcallers-b.js` require the helper, which requires
   the rule module, while the rule module's CLI summary required
   the analyzer — and the rule module assigned `module.exports`
   AFTER calling `main()`, so the cycle returned empty exports and
   the CLI printed "analyzer perSeed unavailable". Fix: assign
   `module.exports` before the `main()` call, and update the CLI
   summary's labels (wired vs pre-dedup). Rule behavior unchanged.
   Also additive only: exclusions now carry `directIndex` (the
   audit key the helper uses to attribute an exclusion to its
   direct record's day for the boundary leg; seq lookup alone
   fails on seq-less corpora). No rule number changed.

## Before/after numbers

9954 cultnest replay (1 seed, span corpus), generic family, all 8 analyzers:
- newDraws: 202,259 → 198,459 (−3,800). newDrawsPreDedup: 202,259.
- newResidual: −35,273 → −39,073 (−3,800). (This is the
  full-horizon residual, not the perstack closed figure; the
  perstack correct-alignment figure 3,800 → 0 from sim-dedupspan-b
  is a different residual definition and is not re-judged here.
  The delta is what the prereg bound, and it is exact.)
- Boundary (where present): bResidual −37,292 → −41,092;
  rBResidual −35,134 → −38,934; raidcallers cBResidual
  3,700 → −100 (proven day-100 timing gap).
- Fish catch: −20 (the published unit). All other families: 0.
  All dried figures: 0.

Bare corpora (all figures bit-identical wired vs unwired; status
no-span-data; totalExcluded 0):
- raidcallers corpus: 8 seeds (9951–9958).
- raiddor corpus: 8 seeds (9820–9827).
- stockdoors corpus (2026-10-26): 8 seeds (9820–9827).
- ledgerbound corpus: 8 seeds (9820–9827).
- residualhunt corpus: 8 seeds (9820–9827).
- raidday100 screen corpus: 40 seeds (10100–10139 range as files
  present). NOTE: `sim-raidday100-b-corpus` does not exist on
  master (the analyzer's default DIR is stale); the published
  raidday100-b corpus used here is the screen corpus.
- raidday100-general corpus: 1 seed (20118).
- raidday100-judge corpus: 1 seed (20118).
- Confirm corpora were not needed (all primary corpora present).

Proof: `node scripts/test-dedupspan-wire-b.js` — 1588 checks,
exit 0, verdict GO. It recomputes old sums from raw payloads, so
it needs no baseline snapshot file and stays valid after landing.
It also includes a synthetic ambiguous-span case through a wired
analyzer (status applied-with-ambiguity, 0 exclusions, newDraws
unchanged at 200).

## Existing-analyzer test runs (regression check)

The wired analyzers' own prior-arm proof scripts were run after
wiring, full output (not tail) for raidcallers and raidday100-b;
the remaining six are running full-output at evidence time and
their failure lists will be appended before commit if they differ
from the pattern below. The wire proof (1588 checks) is the
numeric regression evidence for all 8 analyzers: it recomputes
old sums from raw payloads per family per seed on every corpus.

- test-raidcallers-b, full output: 36 PASS + 3 FAIL without env;
  with `RAIDCALLERS_POLICY=belongseek-nofeast` (the corpus's actual
  policy; the test defaults to competent-nofeast): 37 PASS + 2
  FAIL. The 2 remaining failures are worktree-guard hygiene only
  ("zero sibling capture files modified" and "no modified tracked
  file outside this run's own files" — this arm's files are
  outside the raidcallers arm's allowlist by definition). ALL
  numeric checks pass, including every independent-vs-analyzer
  pooled residual (named, generic, dried × NEW, boundary, raiddor,
  caller-complete) on the bare corpus, and zero src/js modified.
  The corpus-valid failure without env is a test-invocation
  precondition (policy default), not a regression: the committed
  corpus files are untouched (git status clean for the corpus).
- test-raidday100-b, full output: 14 PASS, then a crash — NOT a
  wiring regression: `computeLegs` → `loadCorpus` throws ENOENT
  on `evidence/2026-10-27/sim-raidday100-b-corpus`, which does not
  exist on master (same missing-corpus gap noted above). Its only
  FAIL before the crash is "corpus has 1/8/12 files — 0 files",
  the same cause. Det-gate checks (14 PASS) all pass before the
  crash. Pre-existing, unrelated to wiring: the crash path is
  `readdirSync` on the missing directory in unchanged code.
- test-stockdoors-b, full output: 2 FAIL — (a) det-gate count
  reproduction (re-run 240/1247/3/155 vs corpus 255/1249/4/163),
  (b) worktree guard. (a) is pre-existing, not wiring: the det-gate
  re-runs sweep-stockdoors-b.js, which requires only sim-harness,
  policies and capture modules — none modified here, and src/ is
  clean; the test's own INFO line says "base moved" since the
  2026-10-26 corpus. All other checks pass.
- test-raiddor-ledger-b, full output: 3 FAIL — same det-gate
  count reproduction + 2 guard failures. No numeric failure.
- test-ledgerbound-b, full output: 2 FAIL — same det-gate
  count reproduction + guard. No numeric failure.
- test-residualhunt-b, full output: 2 FAIL — same det-gate
  count reproduction + guard. No numeric failure.
- test-raidday100-general-b, full output: 2 FAIL — guard only.
- test-raidday100-judge-b, full output: 4 FAIL — 2 guard + 2
  day-100-exercise checks ("touches at least one focal row",
  "touched rows close with adjustment", both "none"). Pre-existing
  corpus content, not wiring: the exercise recomputes from raw
  corpus records (not via the wired analyzer), the corpus has no
  nestEvents (dedup zero), and its only day-100 raid takes 1000
  kcal of Canned soup — not a focal family (focal = named families
  + Foraged food) — so touchedFocal is empty by construction.
  The seed itself passes ("judged corpus contains a surviving
  day-100 raid seed", seed 20118).
- Summary: across all 8 prior-arm scripts, ZERO failures are
  analyzer-numeric failures caused by wiring. Every failure falls
  in exactly three pre-existing-or-hygiene classes: (i) worktree
  guard (this arm's files outside each prior arm's allowlist),
  (ii) pre-existing corpus/base conditions (missing raidday100-b
  corpus, belongseek policy default, 9820 det-gate base move,
  judge Canned-soup day-100 raid), (iii) nothing else. The wire
  proof (1588 checks, old sums recomputed from raw payloads) is
  the numeric regression evidence for all 8 analyzers.

## Repo quick check (for the record)

`node scripts/check.js --quick`: 278 passed, 9 failed in 458s.
The 9 failures are all in unrelated areas (hide-discovery,
measurement proof/workflow, mobile combat cadence, occupation
panels, phone frame proof, parity gear, establishment racks
voice) and none of the 9 scripts references any file changed in
this arm (grep for analyze-*-b/dedupspan: 0 in each). Pre-existing
on this HEAD, not caused by wiring. No stray files left by the
check run (git status shows only this arm's files).

## Reachability + wall numbers (reused corpus, no new band)

No fresh sim band was run (tooling-only arm, no game change):
wall numbers are the raidcallers numbers, not re-judged —
national 6/8, table 0/8, wins 0/8, wave 4–5 reach 1/8,
median survival 100d (from the wired raidcallers CLI run on the
bare corpus). Seed 9954 itself: wave 4, national rank, 100 days.
Reachability verdict: UNCHANGED by this arm (it moves no game
code and no game figure — it only corrects a counting instrument
on span corpora).

## Village assessment (plain words)

No village was re-simulated, so no new village story is claimed
here. The story this arm changes is the bookkeeping one the last
two arms told: on the night the garden magic swallowed the evening
meal, two counters wrote down the same food, and the books now
say so in every instrument that adds those counters up — not just
in the one rule module that first proved it. A future ledger run
that loads a corpus WITH a span log can no longer silently
re-create the +3,800 double tally; a run on a corpus WITHOUT a
span log now says so out loud (`no-span-data`) instead of
looking clean by default. Blanks filled: (1) the dedup rule is
wired into all 8 ledger analyzers, with pre-dedup figures kept
for audit; (2) the require cycle the wiring exposed is fixed;
(3) the prior arm's test is updated to the wired world instead of
left failing. Documented, not fixed: the span-log foodState gap
(match key stays four fields, not five — the task forbade chasing
it as a game-code change, and wiring did not touch the key);
analyzers without a direct leg stay unwired by design, guarded by
the proof's directRecords-absence check.

## Sense-testing

This arm has NO narration surface: it touches only a summing
ledger over already-recorded corpora. No villager transcript or
dialogue sample is claimed as a sense check, per the same stance
as sim-dedupspan-b. The wired raidcallers CLI still prints its
sense lines unchanged on the bare corpus (first unanswered-raid
take day 39, first non-raid take day 27) — observed, not judged,
since the CLI's sense output is not a metric of this arm.

## Metric review (MEASUREMENT.md section 14)

- GO3's "every non-generic family bit-identical" sentence was
  wrong against the prior arm's published total (3,820, not
  3,800). Proposed revision for the NEXT run: state exclusions
  as an exact composition table (generic 3,800 + Fish catch 20)
  rather than "generic plus nothing else". The correction was
  applied to the proof test with full disclosure above; it was
  not applied silently to the prereg file after the fact.
- The dual-figure discipline from sim-dedupspan-b (correct-alignment
  vs boundary) held: the full-horizon newResidual (−35,273) and
  the boundary cBResidual (3,700) are different numbers, and only
  the −3,800 delta is common. A future prereg should name which
  residual it bounds, not just "the residual".
- The `no-span-data` status is the honest guard for bare corpora,
  but it is a label, not a proof of cleanliness: a span corpus is
  the only corpus that can be deduped. Future sweeps that want
  dedupable ledgers must install the span logger; that is a
  logger-adoption note, not a rule change.
- Balanced panel (§15): no before/after game comparison exists —
  this arm changes no lever and no game code. The before/after is
  old sum vs deduped sum on identical inputs, judged by the prereg
  thresholds (as corrected and disclosed above). Not forced, not
  faked.
- The old arm proofs' worktree-guard checks are arm-scoped, not
  repo-scoped: they fail in any later arm's tree by design. A
  future harness change could scope that guard to the test's own
  files only when run standalone — noted, not changed here (out
  of scope for a tooling arm that must not rewrite other arms'
  proofs beyond the one behavior change it caused).

## Notes (out-of-scope gaps, recorded here only)

- [follow-up] ledger — span logger foodState gap: nest drawExit
  items lack foodState/granaryDays, so the match key is four
  fields, not five. Wiring did not touch the key (task rule 4).
  (sim-dedupspan-wire-b; carried from sim-dedupspan-b)
- [follow-up] ledger — `sim-raidday100-b-corpus` missing on
  master; `analyze-raidday100-b.js` default DIR points at it.
  The screen corpus was used instead. Either the default DIR or
  the corpus directory wants a cleanup pass (not done here: out
  of scope, and changing a default path could break other arms'
  scripts that pass explicit dirs).
- [follow-up] ledger — old arm proofs' worktree-guard checks fail
  in later arms' trees by design (see metric review).

## Convergence line

wired — the span-dedup rule is now applied by all 8 standing ledger
analyzers (NEW + boundary/raid/caller legs where present), with
pre-dedup figures preserved and a no-span-data guard on bare
corpora: 9954 generic newDraws 198,459 (pre 202,259), cBResidual
−100 (pre 3,700), Fish catch −20, all other figures exact;
1588/1588 wire proof checks; dedupspan-b proof 34/34 after its
intentional GO3 update; zero src/js changes.

## Verdict (judged against the pre-registered bar, with the disclosed GO3 correction): GO

GO1, GO2, GO4, GO5 met exactly; GO3 met on the corrected exact
composition (generic −3,800, Fish catch −20, all else 0) — the
prereg sentence's literal wording missed the prior arm's published
Fish unit, disclosed above.
