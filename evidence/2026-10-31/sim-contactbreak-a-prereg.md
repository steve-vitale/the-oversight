# sim-contactbreak-a — PRE-REGISTRATION (written BEFORE any judged analysis, 2026-10-31)

Run: Loop A worker, axis scale-onramp (converging, NOT converged),
run fleshout-20261031T2058Z. Arm type: DIAG, analyzer-only.
NO new sims, NO game harness loads, ZERO src/js changes.
This file was committed BEFORE any judged analysis. Only a schema
probe (field-presence counts per leg, not a judged result) ran
before this commit.

## Question (from sim-fieldfinish2-a)

The fieldfinish2 prereg EXPLICITLY excluded a second lever family:
finishing a beast that is met already below its break line (the
contact/volley break, ~line 930 in fieldFights.js, fires before
any fought round). This arm measures how big that excluded class
is, from the landed corpus alone — so a future BUILD arm knows
whether it is worth building. It does NOT build the rule, does
NOT judge a gate, and does NOT change the game.

## Corpus (base for this arm, and nothing else)

Landed fieldfinish2 corpus, already on master in this worktree:

- BASELINE leg (PRIMARY): evidence/2026-10-31/perseed-fieldfinish2-baseline-pilot/leadfeast/*.json
- Lever leg (secondary): evidence/2026-10-31/perseed-fieldfinish2-pilot/leadfeast/*.json

8 seeds per leg (87104, 87109, 87119, 87124, 87140, 87115, 87123,
87127 — the fieldfinish2 pilot set). Judged comparisons are
baseline-vs-lever on this corpus only. Do NOT judge against any
other base's numbers, and do NOT judge against fieldkill-a's
corpus. The fieldfinish2 evidence file
(evidence/2026-10-31/sim-fieldfinish2-a.md) and its prereg
(sim-fieldfinish2-a-prereg.md) are the context; the numbers
below come only from the two corpus directories above.

## Canon read first

docs/CANON.md, docs/MONSTER-WAVES.md (wave 3: HP 240-420, break
line 15% for wave >= 2, 25% for wave 1), sim-fieldfinish2-a.md
and sim-fieldfinish2-a-prereg.md. The 15% wave >= 2 break line
is canon; the classifier below applies it exactly as stated,
not as a tuned gate.

## Schema probe (pre-prereg, counts only — NOT a judged result)

Per leg, wave-3 field-fight rows and field presence:

- Baseline: 104 wave-3 rows. Present: mHpStart 89, mMaxHp 89,
  rounds 104, mDealt 104, outcome 104, log 104.
  Missing (null): mHpStart 15, mMaxHp 15, others 0.
- Lever: 71 wave-3 rows. Present: mHpStart 64, mMaxHp 64,
  rounds 71, mDealt 71, outcome 71, log 71.
  Missing (null): mHpStart 7, mMaxHp 7, others 0.

No classification, share, distribution, or threshold count was
computed before this prereg. The missing-field rows are the
reason the unclassified category exists (below).

## Classifier (binding, applied to EVERY wave-3 field-fight row)

A row is CONTACT iff ALL of the following hold:

1. mHpStart < 0.15 * mMaxHp (the wave >= 2 break line),
2. rounds <= 1,
3. mDealt == 0,
4. outcome in {mFlee, evade}.

A row is FOUGHT iff it is classifiable (all fields needed by
the classifier are present and numeric where numeric) and it
fails at least one of conditions 1-4.

A row is UNCLASSIFIED iff any field needed by the classifier
is missing or non-numeric (mHpStart, mMaxHp, rounds, mDealt,
outcome), with the reason recorded per row (which field(s)).
Unclassified rows are counted in the reconciliation, never
silently dropped, and never derived: mHpStart is NOT
reconstructed from mDealt + mHpLeft (that derivation belongs
to the fieldfinish2 analyzer's killable-state work, not to
this classifier).

Notes on the definition, stated now so the evidence cannot
re-litigate them later:

- rounds <= 1 (not == 0) is deliberate: the contact break
  fires before any fought round, and a row that records a
  single round with zero damage dealt is still a contact
  meeting, not a fought round.
- outcome is restricted to {mFlee, evade} because a CONTACT
  meeting ends with the beast leaving (or the meeting
  evaded), never with a kill or a villager death. A row
  meeting conditions 1-3 but ending vKill or vDie is FOUGHT
  by this definition and is reported as such if it occurs.
- The classifier uses the row's own mMaxHp, never a data-table
  fallback. A row with mMaxHp missing is unclassified even
  if its monster type has a known HP band.

## Validation sample rule (binding)

The classifier is checked against the fight logs (row.log)
as follows:

- Census of the CONTACT class: EVERY contact-class row on
  both legs has its log read.
- Negative controls: the first 3 FOUGHT rows per leg in
  corpus order (seed order, then row order within the seed
  file) have their logs read.
- Expected log shape for a CONTACT row: no strike lines
  (no villager strike dealing damage, no volley damage) and
  a break/flee line at contact, before any fought round.
- A disagreement is any CONTACT row whose log shows a
  strike line or damage dealt, or any negative-control row
  whose log shows a pure contact break with no fought round.
  Every disagreement is reported in the evidence file with
  seed, day, monster, the classifier fields, and the log
  lines that disagree.
- Resolution rule (fixed now): if the log proves a
  classifier field wrong (e.g. a strike dealt while mDealt
  records 0), the row is moved to FOUGHT, the wrong field
  is named, and the move is counted in the reconciliation
  (the row stays classified, in a different class). If the
  log merely lacks explicit contact-break wording but
  shows no strikes and no damage, the row stays CONTACT
  and the wording gap is noted — log wording is not a
  classifier condition. Final reported contact counts are
  post-resolution; the number of disagreements and moves
  is reported alongside, never folded silently into the
  counts.

## Reported numbers (per leg, never pooled for the GO)

- Total wave-3 field meetings (wave == 3 field-fight rows).
- CONTACT n and share (share = CONTACT / total wave-3 rows;
  the unclassified share is reported separately so the
  shares sum to 100% with FOUGHT).
- FOUGHT n and share.
- UNCLASSIFIED n and share, with reason counts (which
  field(s) missing, per leg).
- mHpStart distribution for the CONTACT class only:
  median, quartiles (Q1, Q3 by linear interpolation on the
  sorted values, index = p * (n - 1)), min, max.
- Descriptive threshold counts within the CONTACT class:
  mHpStart <= 15 HP, <= 30 HP, <= 45 HP. These are
  DESCRIPTIVE ONLY — they size a future gate, they do not
  judge one, and no threshold is recommended or rejected
  on their basis in this arm.
- Reconciliation: CONTACT + FOUGHT + UNCLASSIFIED =
  total wave-3 rows, on each leg separately.
- Sense-testing: at least 2 CONTACT-class fight logs read
  in full and judged in plain words (does fleeing read as
  believable for a beast already broken on sight, and what
  would a finish have to look like to read as earned
  rather than granted?).

## GO rule (DIAG-GO, pre-registered)

DIAG-GO iff BOTH of the following hold:

1. 100% of wave-3 rows on BOTH legs are classified CONTACT
   vs FOUGHT or explicitly UNCLASSIFIED with reason, and
2. all counts reconcile to corpus totals on both legs
   (CONTACT + FOUGHT + UNCLASSIFIED = total wave-3 rows,
   per leg, verified by the proof test).

Otherwise DIAG-NO-GO (incomplete) — the evidence reports
exactly what is missing. There is no effect threshold in
this arm: a small contact class is a measured answer, not
a failure, and a large one is a candidate for a future
BUILD arm, never a landed change. The evidence states what
a contact-finish rule would have to convert as a CANDIDATE
only.

## Analyzer and proof test (committed with the evidence)

- Analyzer: scripts/contactbreak-analyze-20261031.js —
  reads the two corpus directories, applies the classifier
  above, prints per-leg counts, shares, distribution,
  threshold counts, unclassified reasons, and the
  reconciliation. It reads corpus files only; it loads no
  game code and runs no sims.
- Proof test: scripts/test-contactbreak-20261031.js —
  plain node, single process. Synthetic classifier cases
  (including boundary cases: exactly at the break line,
  rounds 0 vs 1 vs 2, mDealt 0 vs > 0, each outcome, missing
  fields) plus log-disagreement cases (strike in log with
  mDealt 0 moves the row to FOUGHT; wording gap without
  strikes keeps CONTACT) plus corpus reconciliation proving
  classified + unclassified = corpus wave-3 totals on both
  legs. Must pass on this branch before the evidence
  commit is reported as done.

## Metric review (to be filled at evidence time)

- Did the rounds <= 1 bound admit any row that reads as
  fought in its log? Did any outcome outside {mFlee,
  evade} meet conditions 1-3? Did missing mHpStart/mMaxHp
  cluster on any seed, monster, or outcome in a way that
  biases the contact share? Is the contact class big
  enough that a future BUILD arm is worth scoping, or
  small enough that it should stay a documented blank?
