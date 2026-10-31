# sim-finishgate-a — PRE-REGISTRATION (written BEFORE any judged analysis)

Run: Loop A worker, axis scale-onramp (converging, NOT converged),
run fleshout-20261031T2058Z. Arm type: DIAG, analyzer-only.
NO new sims. NO game harness loads. ZERO src/js changes.
No [needs-eyes] (DIAG only, no feel/combat/UI change).

## Question (from sim-fieldfinish2-a, landed master 2d25029bb)

The fieldfinish2 pilot proved the committed-finish one-strike gate
never fires on wave-3 beasts (0/71 wave-3 fights on the lever leg,
0 committed wave-3 fights on either leg). This arm measures EXACTLY
how far short the gate falls, from the landed corpus alone — it does
not re-run sims, re-judge the pilot, or land a gate redesign. Any
redesign the numbers imply is stated in the evidence as a CANDIDATE
for a future BUILD arm, never as a landed change.

## Canon read first

docs/CANON.md, docs/MONSTER-WAVES.md (wave 3: HP 240-420 in data;
break line 15% for wave >= 2, i.e. a 36-63 HP remainder at the break
check), evidence/2026-10-31/sim-fieldfinish2-a.md and
sim-fieldfinish2-a-prereg.md (gate definition: the override fires at
an in-round break check only when, among other gates, the monster's
remaining HP is <= this fight's own biggest proven single lead
strike). No canon doc covers villager field-fight flee triggers in
detail beyond the break line; the classifier below is read from the
fieldfinish2 prereg + the corpus schema, not invented as canon.

## Corpus (already on master in this worktree, no new data)

- BASELINE leg = PRIMARY (unperturbed by the rule):
  evidence/2026-10-31/perseed-fieldfinish2-baseline-pilot/leadfeast/*.json
- Lever leg = SECONDARY (rule present, for cross-check only):
  evidence/2026-10-31/perseed-fieldfinish2-pilot/leadfeast/*.json
- Pilot seeds (8, identical both legs): 87104, 87109, 87119, 87124,
  87140, 87115, 87123, 87127.
- Rows: `fieldFights` arrays in the per-seed JSONs. Fields used:
  wave, outcome, log, mHpStart, mHpLeft, mMaxHp, committedFinish,
  plus gate-context fields (vHpLeft, minHpFrac, intent, noFlee,
  rounds) only to name a blocking gate on any gap<=0 row.

## Schema probe (done BEFORE this prereg, not a judged result)

Log-presence counts only, per leg, wave-3 field-fight rows ending
mFlee: baseline 40 rows, all 40 logged (non-null, non-empty log);
lever 18 rows, all 18 logged. No unlogged wave-3 mFlee row exists
in either leg, so the unlogged class below is expected empty but
is still implemented and counted. Corpus totals for reconciliation:
baseline fieldFights 1271, wave-3 rows 104; lever fieldFights 643,
wave-3 rows 71. (These are corpus sizes, not findings.)

Parser-design facts from the probe (shapes only, no gap numbers):
strike lines match `R<n>: <Name> strikes for <vd> ...`; every
strike-bearing wave-3 mFlee log has exactly ONE distinct striker
name, consistent with the prereg's "wild fights are always solo"
— so maxStrike over strike lines IS the lead's max strike, with
no ally/volley contamination to separate. Any row with more than
one distinct striker name is flagged by the analyzer as
`multi-striker` and itemized, never silently folded in.

## Measurement (binding)

For each wave-3 field-fight row with outcome `mFlee`:

1. Strike parse: lines matching `^R\d+: (.+?) strikes for (\d+)`.
   maxStrike = largest vd; secondStrike = second-largest vd
   (0/absent if fewer than 2 strike lines).
2. Gap = mHpLeft - maxStrike, computed ONLY for gap-table rows
   (class D below). Positive gap = HP the biggest proven blow
   still leaves standing; zero/negative = one proven blow covers
   the remainder.
3. Two-strike reach: mHpLeft <= maxStrike + secondStrike
   (whether a second blow of the fight's own proven size would
   have finished the beast).
4. Distributions over gap-table rows, per leg: median, quartiles
   (25th/75th), min, max for mHpStart, mHpLeft, and gap.
5. Shares reported per leg: gap<=0 share of gap-table rows;
   two-strike-reach share of gap-table rows.

## Classifier (every row gets exactly one class, in this order)

- A. `unlogged`: log is null or an empty list. Counted as a
  coverage count with reason "no log", never as zero gap.
- B. `contact-break`: mHpStart < 0.15 * mMaxHp — the beast was
  met already below the break line (includes rounds-0 volley
  drive-offs). Excluded from the gap table, counted separately.
  This class is the sibling sim-contactbreak-a arm's territory;
  it is classified here, not analyzed as a gate gap.
- C. `no-lead-strike`: at least one fought round but no strike
  line in the log (peaceful/talk/trick resolutions, monster-only
  damage lines). Excluded from the gap table with reason
  "no lead strike in log"; maxStrike is undefined, not zero.
- D. `gap-table` (break-line flight): mHpLeft < 0.15 * mMaxHp
  (strict, matching the engine's `hp/maxHp < mBreak` check) AND
  at least one strike line. Gap computed.
- E. `non-break-flight`: mHpLeft >= 0.15 * mMaxHp with at least
  one strike line. Excluded from the gap table, counted
  separately with reason "fled above the break line" (log tail
  consulted for a more specific reason where determinable).
- F. `missing-fields`: mHpLeft or mMaxHp null/non-numeric.
  Excluded with reason "missing HP fields". Expected empty.
- G. `multi-striker`: more than one distinct striker name.
  Itemized individually; excluded from the gap table pending a
  lead-identification rule. Expected empty.
- Any row matching none of A-G is `unclassified` and FAILS
  reconciliation (see GO).

## Cross-checks (binding)

- gap<=0 share: expected 0 on gap-table rows, consistent with
  the pilot's 0 committed wave-3 fights. Any gap<=0 row is
  itemized individually and checked against committedFinish and
  the available gate-context fields (lead HP fraction, intent,
  noFlee, rounds) to name the gate that blocked it. A nonzero
  gap<=0 share is reported and explained, not hidden; it does
  not by itself fail DIAG-GO (GO is coverage + reconciliation),
  because gate 2 alone never sufficed for the override.
- Lever leg is a secondary cross-check only: its gap table is
  computed identically, but its numbers are post-divergence
  (the rule fired on wave 1-2 and moved downstream state) and
  are never pooled with baseline.
- Reconciliation (analyzer asserts, proof test re-proves):
  per leg, class counts sum to the corpus wave-3 mFlee total;
  wave-3 mFlee + other wave-3 outcomes sum to the wave-3 total;
  all wave totals sum to the fieldFights total. Any mismatch
  is DIAG-NO-GO.

## GO rule (DIAG-GO, pre-registered)

DIAG-GO iff BOTH hold:
1. Gap table + explicit classification covers >= 90% of
   baseline-leg wave-3 mFlee rows (coverage = rows in classes
   A-G divided by total baseline wave-3 mFlee rows; the target
   is 100%, the floor is 90%), AND
2. All counts reconcile to corpus totals on BOTH legs
   (no unclassified rows, no arithmetic mismatch).
Otherwise DIAG-NO-GO (incomplete) — the evidence reports exactly
what is missing (which rows, which class, which total mismatched).

## Sense-testing (SENSE-TESTING LAW)

Read at least 2 wave-3 break-flight logs (class D) and judge in
plain words whether each flight reads as a believable near-miss:
does the fight show a fighter landing real blows and the beast
breaking while still standing, or does it read as a rout, a
talk-down, or a non-fight? Counts alone do not pass this section.

## Deliverables (this branch only, no merge by this worker)

- This prereg (committed BEFORE any judged analysis).
- evidence/2026-10-31/sim-finishgate-a.md: numbers, gap table,
  distributions, shares, sense-testing, and the gate-redesign
  CANDIDATE the numbers imply (e.g. two-blow window vs
  threshold change), stated as a candidate for a future BUILD
  arm, never as a landed change.
- scripts/finishgate-analyze-20261031.js: the analyzer.
- scripts/test-finishgate-20261031.js: plain-node proof test —
  synthetic log-parse/gap/classifier cases + corpus
  reconciliation proving counts sum to corpus totals.
  Must pass on this branch.
- Commit discipline: scripts/safe-commit.sh "msg" -- <files>
  (message FIRST, then files, expanded file lists, never
  directory paths). After EVERY safe-commit, run
  git status --short first and repair any staged-deletion
  index clobber before reporting. Do NOT push, do NOT bump
  versions, do NOT verify live. Do NOT merge to master —
  the coordinator merges via --ff-only. Final state: branch
  contains ONLY committed work; uncommitted leftovers are a
  loud failure.

## Metric review (to be filled at evidence time)

- Did the classifier need a class not listed above?
- Did gap<=0 occur, and if so, which gate blocked it?
- Is the one-strike gap or the two-strike reach the more
  informative redesign input?
