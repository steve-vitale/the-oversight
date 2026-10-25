# sim-causemeta-b — machine-readable scope metadata + substrate-mismatch guard for the causebase baseline (axis food-economy, MEASUREMENT ONLY)

Run: fleshout-loop-b-20261025T1630Z (Sun 2026-10-25, loop B, second axis).
Worker tree: ~/workspace/worktrees/sim-causemeta-b. Axis: food-economy.
MEASUREMENT ONLY: ZERO src/js game changes. NO new sim sweeps run. This arm
fixes the causebase C6 gap (the 1530Z food-economy next blank #3): the
committed causebase JSON carried no substrate metadata, so a future arm
holding only the JSON could not verify comparability, and the analyzer
exited 0 with no warning on a different-substrate dir.

Canon read first: docs/CANON.md, then docs/PRESERVATION.md (the food
ladder). No canon doc covers death-cause taxonomy — the causes here are
the engine's recorded labels, not canon, and no label is invented,
renamed, or merged in this arm. Verdicts from sim-causebase-b and
sim-causebase-audit-b stand untouched; this arm only makes scope
checkable.

## PRE-REGISTRATION (binding — the assignment's GO, judged as written)

- G1: the baseline JSON carries machine-readable scope metadata
  sufficient to verify comparability (at minimum: policy, horizon,
  flags incl. PLENTYDEPRI/DEPOSITGATE, seed/corpus list, kind-filter
  definition, and the headline counts). Metadata addition must be
  backward-compatible in effect: the audit's counted numbers reproduce
  EXACTLY (1,302 rows / 0 kind exclusions / 732 scholar exclusions /
  570 villager deaths / 48 labels).
- G2: the analyzer, given a different-substrate dir (constructed
  deterministically for the proof), exits NON-ZERO with a LOUD
  scope-mismatch message naming both scopes. It must NOT exit 0
  silently on mismatch (the exact C6 failure).
- G3: the analyzer on the matched baseline still exits 0 and
  reproduces the audit numbers exactly.
- G4: a future arm holding ONLY the JSON + analyzer can verify
  comparability — demonstrated in the proof (proof reads scope from
  the JSON file itself, not from the author's memory of the audit).
- NO new sim sweeps. NO verdict re-judging of causebase.

## WHAT CHANGED

### 1. `evidence/2026-10-25/sim-causebase-b-baseline.json` — scope added, counts untouched

The diff against the previous committed file is exactly one insertion:
a top-level `scope` object after `population`. Every counted number,
every pooled count, every per-corpus breakdown is byte-identical to
before. The new file is not hand-typed: it is the analyzer's own
pool-mode output on the 6 corpora (same relative invocation the audit
used), so re-running the analyzer reproduces it byte-identically.

Exact scope content (see the file for the full object):

- `scopeVersion: 1`
- `policy: "competent"`
- `horizon: { days: 150, mode: "death-aware" }`
- `flags: { PLENTYDEPRI: 1, DEPOSITGATE: 1 }`
- `kindFilter: { kinds: ["villager", "person"], scholarExcluded: true,
  scholarFlagFields: { sweep: "isPlayer", census: "player" },
  description: "kind in {villager, person} AND scholar flag false" }`
- `labels: { form: "raw, unnormalized", truncationChars: 32 }`
- `corpora`: 6 entries — pantrystarve-b 94301–94308 (8 files),
  fullpantry-diag-b 94401–94416 (16), fullpantry-confirm-b 94421–94436
  (16), awayration-size-b 94501–94508 (8), fullpantry-casecount-b
  94601–94664 (64), awayration-cover-b 94701–94732 (32). Full seed
  lists remain in top-level `corpora[].seeds`.
- `counts: { rowsTotal: 1302, excludedByKind: 0, excludedScholar: 732,
  villagerDeaths: 570, labelCount: 48 }`
- `derivation`: which leg comes from where (see below).

Derivation honesty (stated in the file's `derivation` block and here):
policy and flags are read from the corpora themselves — all 144
per-seed files verified uniform (policy `competent`, plentydepri 1,
depositgate 1) — and horizon days from the 6 sweep summary files'
`meta.days` (all 150). The horizon *mode* label (`death-aware`) is
documented sweep-driver semantics per sim-causebase-b.md's
pre-registration, not a corpus field; the analyzer emits it only for
corpora carrying summary meta.days, else null. A field absent from
every corpus file is null, never invented.

### 2. `scripts/analyze-causebase-b.js` — scope emission + substrate guard

- Pool mode emits `scope` (derived as above). A conflict on any
  derived field across the pooled corpora (mixed policy, flags, or
  horizon days) FAILS loudly, exit 2 — a pooled baseline must share
  one substrate, and pooling a mixture silently was the same class
  of error as the C6 silence.
- Compare mode derives the arm's substrate the same way and enforces
  it against `baseline.scope` BEFORE any flag is computed. The guard
  ladder, in full:
  - Mismatch on any declared leg (policy, either flag, horizon days)
    → exit 2, `SCOPE-MISMATCH`, naming both scopes and the differing
    legs. No stdout JSON is emitted: a refusal, not a flagged result.
  - All compared legs equal → exit 0, output carries
    `scopeCheck.status: "match"`.
  - An arm leg undeclared in the corpus files → loud `SCOPE-PARTIAL`
    stderr warning, exit 0, `scopeCheck.status: "partial"`. Unknown
    is warned about, never silently passed — and it is not a
    mismatch, so it does not refuse (census-format arms, for example,
    carry no flag fields).
  - A baseline with no `scope` (legacy files) → loud `SCOPE-WARNING`
    stderr, exit 0, `scopeCheck.status: "unverifiable"`. Old baselines
    keep working but never silently again.
- Compare output gains `scopeCheck: { status, baseline, arm,
  warnings }`. Pool/compare flag semantics are unchanged: new-label
  and share-shift flags remain data, never failures.

### 3. `scripts/test-causemeta-b.js` (NEW) — proof for G1–G4 plus guard edges

### 4. `scripts/test-causebase-audit-b.js` — state assertions updated (see below)

The audit test's old C5a/C6/C7b assertions encoded the PRE-FIX state
(C6 FAIL, compare-on-different-substrate exits 0 silently). Leaving
them would make the suite falsely red after a fix it was written to
motivate. Updated, surgically, to the fixed state: C5a recomputes the
deathcensus decomposition from the files directly (261 = 192 + 42 +
27, Nevermore/The Suburb n = 1 each) and asserts the compare refusal;
C5b's hypo arm now declares the baseline substrate and asserts
`scopeCheck` match; C6 asserts the exact scope content; C7b asserts a
matched in-scope compare still exits 0. C1 (byte-identical
reproduction), C2, C3, C4, C7 tail numbers are unchanged. The new
proof file, not the audit test, carries the G1–G4 legs.

## RESULTS — GO VERDICTS

- G1: GO. Scope present with every required leg (above); audit
  numbers reproduce exactly: 1,302 rows / 0 kind exclusions /
  732 scholar exclusions / 570 villager deaths / 48 labels,
  per-corpus villager deaths 40 / 65 / 71 / 22 / 247 / 125, pooled
  counts identical (monster 219, starvation 49). Pool re-run on the
  6 corpora is byte-identical to the new committed file, scope
  included.
- G2: GO. All four mismatch constructions refuse with exit 2 and a
  message naming both scopes (table below). The audit's exact C6
  failure case (deathcensus baseline-side dir) previously exited 0
  silent; it now exits 2 naming `competent` vs `baseline`.
- G3: GO. Matched synthetic arm exits 0 with `scopeCheck: match`
  and the guardrail flags intact (absent n = 4 flagged, absent n = 2
  churn only); matched real in-scope corpus (awayration-size-b)
  exits 0 with `scopeCheck: match`, 22 villager deaths.
- G4: GO. The proof's JSON-only leg reads `scope` out of the
  committed file and builds arms from those values — no literal
  policy/flag/day value in the arm-construction code. The
  from-the-file matched arm exits 0; the same arm with the policy
  string suffixed `-variant` exits 2 naming both policies. A future
  arm holding only the JSON + analyzer can run exactly this check.

## MISMATCH PROOF (exit codes and messages)

| Case | Exit | Message (stderr, abridged) |
|---|---|---|
| Matched synthetic arm (competent, 1/1, 150d) | 0 | `scopeCheck.status: "match"` (stdout JSON); no warning |
| Matched real corpus (awayration-size-b) | 0 | `scopeCheck.status: "match"`; 22 villager deaths |
| Policy mismatch (arm `tableseat-nowait`) | 2 | `SCOPE-MISMATCH: refusing compare — baseline scope (policy "competent", flags PLENTYDEPRI=1, DEPOSITGATE=1, horizon 150d death-aware) vs arm substrate (policy "tableseat-nowait", ...)`: differing leg `policy: baseline "competent" vs arm "tableseat-nowait"` |
| Flag mismatch (arm PLENTYDEPRI=0) | 2 | `SCOPE-MISMATCH: ... differing legs: flag PLENTYDEPRI: baseline 1 vs arm 0` |
| Horizon mismatch (arm summary meta days 200) | 2 | `SCOPE-MISMATCH: ... differing legs: horizon days: baseline 150 vs arm 200` |
| Real different-substrate dir (deathcensus baseline side, policy `baseline`) | 2 | `SCOPE-MISMATCH: ... policy: baseline "competent" vs arm "baseline"` (previously exit 0, no warning) |
| Scope-less legacy baseline (scope deleted) + matched arm | 0 | `SCOPE-WARNING: baseline ... carries no machine-readable scope metadata; comparability cannot be verified from the artifact ...`; `scopeCheck.status: "unverifiable"` |
| Arm flags undeclared (competent policy, no flag fields) | 0 | `SCOPE-PARTIAL: arm PLENTYDEPRI undeclared ...; arm DEPOSITGATE undeclared ...`; `scopeCheck.status: "partial"` |
| Mixed-substrate pool (competent + tableseat-nowait files, one dir) | 2 | `substrate conflict across input corpora: policies has values "competent", "tableseat-nowait" — refusing to pool or compare mixed-substrate corpora` |

No mismatch case emits stdout JSON. No matched case emits a warning.

## SENSE-TESTING (labels must mean what they say)

The C6 failure was a dishonesty risk, not a counting error: a future
arm could have cited this baseline for a different kind of village
and read its flags as if they meant the same thing — the exact way a
small band's zero once masqueraded as absence. The guard makes the
ledger honest at the point of use: a scope mismatch now refuses with
both scopes named, instead of passing silently and letting the author
discover the mismatch (if ever) after citing the flags. Nothing about
villager behavior or death labels changed — the labels themselves were
already honest (audit C1–C5); what was dishonest was the silent
permission to compare across substrates. That permission is removed.
Deliberately NOT changed: C7 truncation handling (exact-match compare
on 32-char truncated labels) — still open, still documented in the
audit, still a future arm's problem, not silently "fixed" here.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- No metric was re-scored. sim-causebase-b's DIAG-GO and the audit's
  PARTIALLY SATISFIES verdict stand. This arm changes only what the
  audit's C6 leg asserts (FAIL → PASS); the audit verdict remains
  PARTIALLY because C7 (truncation) is still partial — the updated
  audit test says exactly that in its final line.
- Is "refuse on mismatch" the right guard strength, vs warn-and-run?
  For compare mode, yes: compare IS the act of citing the baseline,
  and the audit's binding caveat 1 already forbids citing it outside
  its scope. A warning that still emits flags would let a careless
  citation through with a stderr line nobody reads. The partial and
  legacy-warning rungs keep the guard from blocking legitimate
  unknown-field arms — refusal fires only on a DECLARED difference.
- What would I change next? (a) C7 truncation handling in compare
  mode (prefix-aware matching against the 4 truncated labels) — the
  remaining audit partial, for a future arm; (b) nothing else in this
  tool — the scope object should gain fields only when a new
  substrate leg is actually recorded in corpora, not by anticipation.
- Balanced panel (§15): no panel compare attached, deliberately —
  there is no lever in this run and no panel pair to compare; the
  pooled table is the comparison instrument, used here via compare
  mode on matched/mismatched corpora.
- check.js --quick NOT re-run: zero src/js changed in this arm, and
  the arm's suites are test-causemeta-b.js, test-causebase-audit-b.js
  (updated), and test-causebase-b.js (all green — see proof). The
  coordinator re-runs suites at merge per standing protocol. No
  jest was run (plain node scripts; no jest involvement to cache).

## PROOF

- `node --check` clean on scripts/analyze-causebase-b.js,
  scripts/test-causemeta-b.js, scripts/test-causebase-audit-b.js.
- `node scripts/test-causemeta-b.js` — ALL LEGS PASS (G1a scope
  content, G1b/G3a exact audit numbers, G1c byte-identical
  regeneration incl. scope, G2a policy / G2b flag / G2c horizon /
  G2d real-dir refusals at exit 2, G3b matched synthetic exit 0,
  G3c matched real corpus exit 0, G4 JSON-only matched 0 /
  variant 2, E1 legacy warning, E2 partial warning, E3 pool
  conflict refusal).
- `node scripts/test-causebase-audit-b.js` (updated) — ALL LEGS
  PASS (C1 byte-identical, C2, C3, C4, C5a recomputed + refusal,
  C5b, C7 tail, C6 scope PASS, C7b in-scope preserved).
- `node scripts/test-causebase-b.js` (landed, untouched) — ALL
  LEGS PASS (no regression from the added scope key).
- No src/js changed. No new sims run. No sibling axis, tree,
  branch, claim, or file touched. No tracker/claim edits (coordinator
  owns those).

## VILLAGE ASSESSMENT (plain words)

The village's story doesn't change in this run — the ledger does.
Across 144 competent-policy villages, villagers still die of
monsters first (219 of 570), then sickness, betrayal, wounds, and
hunger — and the scholar still dies far more often than any
villager without those deaths being village blood. What changes is
that the ledger now carries its own warning label in a form a
machine can read: this count belongs to one kind of village, on one
policy, for 150 days, with two flags set. Before this fix, a future
arm could have picked up the ledger for a different kind of village
and never been told it didn't fit. Now the tool itself refuses the
mismatch and names both villages' terms. The death labels stay
honest because the comparison that uses them is now honest too.

Convergence state: food-economy stays converging (this arm is
measurement infrastructure, not a lever — no game-code fix landed
here). The C6 gap is closed: a future arm holding only the JSON +
analyzer can verify comparability, and a different-substrate compare
refuses loudly. The audit's remaining partial, C7 truncation
handling, stays open for a future arm.
