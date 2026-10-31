# sim-lackingline-a — prereg (binding; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop, Loop A run fleshout-20261031T0537Z,
arm sim-lackingline-a, axis food-economy, backlog #1561/#1580/#1583
class (lacking-line gate incompleteness). Worktree
sim-lackingline-a. DIAG ONLY: measurement and a wording
PROPOSAL, zero src/js changes, zero policy-default flips, zero
edits to any existing policy file or existing script. New files
only: this prereg, the analyzer + proof scripts named below, the
evidence file, and the corpora/censuses they produce. Sibling
trees (sim-heraldhp-b, sim-deadfall-b, sim-stashfetch-a,
sim-waitsalign-a) never touched; main tree never touched.

## Canon read first

docs/CANON.md read. No canon doc covers the bridge/lacking line
itself: docs/ABILITY-REFUSALS.md covers ability-action refusals
and pantry ledger accounting, not the woodcarry bridge refusal,
so this arm states that gap instead of inventing canon. The one
standing rule that bears on it is CANON.md's "no silent actions
— every action narrates honestly, including failures." The
lacking line's code is scripts/policies/woodcarry.js
`lackingLine()` + `bridgeDecision()` (first-failure order wood,
then kcal, then ticks; gates 4 logs / 60 kcal / 96 ticks).

## Prior evidence read in full before designing anything

- evidence/2026-10-30/sim-kcalshort-b.md (failure-mode census;
  ON 15215 nights 7-16, guard 7-9; both-evenings 11, 12, 13, 15,
  16 named wood-short while kcal also 0).
- evidence/2026-10-30/sim-tickbudget-b.md (ticks-short-plus
  evenings on pressb-variant legs: ON-variant days 13, 18, 22
  named wood-short while ticks also short).
- evidence/2026-10-30/sim-warmfuel-b.md (warmth ledger: ON
  spends nights 9, 11, 12, 13; night 10's refusal never mentions
  night 9's spend).
- evidence/2026-10-30/sim-strandbank-b.md (strand set on its
  base: 15215 only, guard 7-9, ON 7-16).

## Question

On stranded evenings, which gates actually fail versus which
gate the narrated lacking line names — and, separately, on
evenings following a warmth fire that consumed a bridge log,
does the refusal line mention that spend? The line is known
true, not a lie; whether it should name all failing gates is a
DESIGN question, so this arm PROPOSES wording and implements
nothing in src/js (and nothing in any policy file either).

## Primary metric

The lacking-line census: for EVERY stranded evening in the
re-derived strand set, the tuple (gates failing, gate named,
narration verbatim). Gates failing are computed from RAW
refusal-time gates (woodPlayer < 4, kcalLive-or-kcal < 60,
ticksToDayEnd < 96) — never from the bridge skip, which is
itself the first-failure line under census. Gate-combination
labels: single-gate (wood-only / kcal-only / ticks-only),
wood+kcal, wood+ticks, kcal+ticks, all-three. Warmth
connection, separately: for each still evening that directly
follows a strand evening whose warmth fire spent >= 1 bridge
log, whether that evening's refusal line mentions the spend
(strict test: the lacking-line text itself; a looser
any-line-in-the-day check is sense-read only, never counted
as a connection).

## GO threshold (use as tasked; judged exactly as written)

GO iff a complete census table covers every stranded evening
in the re-derived strand set, with per-evening gates-failing vs
gates-named, plus the warmth-connection count. Otherwise
NO-GO. Completeness bars (all must hold): (a) strand set
re-derived on THIS base (full 10-seed bank, both control
legs), not inherited; (b) zero unclassified still evenings;
(c) every censused evening carries its narration verbatim and
its bridge skip, and skip agrees with the first failing raw
gate on every evening; (d) warmth records present on every
ON-leg strand evening, with spend nights identified by
logSpent / woodBefore-woodAfter; (e) determinism re-run
byte-identical on at least one leg; (f) proof suite green.

## Staged method (docs/MEASUREMENT.md §§9-12, 14-15)

- PILOT (before any confirm spend): seed 15215 only, control
  legs guard + ON, kcalshort recorder, OUTDIR override only.
  Pilot passes iff both legs run clean (errs 0, 30 evening
  rows), a strand is present on both legs, every still evening
  is classifiable with narration present, and warmth records
  are present on ON strand evenings. If the pilot strand shape
  differs from the expected guard 7-9 / ON 7-16, the deviation
  is reported in full and the pilot still passes only if every
  still evening is classifiable — the census covers what
  exists, and names what vanished.
- CONFIRM (only if pilot passes): full 10-seed bank
  (15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337,
  15376, 15439), control legs guard + ON, kcalshort recorder.
  This re-derives the strand set and produces the PRIMARY
  census. Control legs are the judged primary set; variant
  legs below are never pooled into it.
- SECONDARY EXTENSION (only if primary confirm passes):
  tickbudget recorder, PRESSB=1 variant legs (guard-variant +
  ON-variant), full 10-seed bank. Purpose: the ticks-short-plus
  class exists only on variant legs (tickbudget evidence), so a
  control-only census cannot contain it. The variant census is
  reported in its own table, labeled variant-policy, and its
  ticks-plus counts are never added to the primary counts.
  Warmth-connection on variant legs is likewise reported
  separately if its strand carries spends.
- HORIZON: DAYS=30. Why: prior arms show the full strand
  cycle inside it on this substrate (guard 7-9, ON 7-16,
  variant ON 7-23 — all < 30); dead villages stop simulating
  with the driver's own endReason. No fixed-200d horizon.
- POLICIES (env gates asserted FATAL by the drivers):
  POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0
  (guard) / 1 (ON), DAYS=30. Variant legs add PRESSB=1
  (tickbudget driver; PRESSB=0 delegates untouched).
- INSTRUMENTS (reused verbatim, OUTDIR override only):
  scripts/kcalshort-trace-b.js (control legs; records
  woodcarry classification + bridge skip + narration verbatim
  + warmth record + fullDaySay on still evenings),
  scripts/tickbudget-trace-b.js (variant legs; same
  woodcarry/warmth records plus tick probes).
  New, this arm: scripts/analyze-lackingline-a.js (pure reads:
  strand extraction, raw-gate classification, named-gate
  cross-check, gate-combination counts, warmth-connection
  count) and scripts/test-lackingline-a.js (proof).
- §15 PANEL: not applicable, declared here as in the prior
  DIAG arms: zero game-root changes (no src/js, no policy
  defaults, no policy files edited), so there is no
  before/after game delta for scripts/balance-panel.js to
  compare. The census compares narration against raw gates
  within one root, and is never labeled a panel comparison.
- METRIC BINDING (§14): the GO bar above binds. A miss is
  NO-GO, never re-scored against a friendlier metric mid-run.
  Metric doubts go under "metric review" in the evidence
  file, and any revision applies to the NEXT run.

## Wording proposal (decision rule, pre-registered)

The evidence file ends with a RANKED proposal (e.g.
name-all-gates vs name-first-plus-count vs keep-as-is), each
option tied to the measured counts, and implements none of
them. Ranking rule: an option outranks keep-as-is only to the
extent the census shows multi-gate evenings are common AND
the hidden gate changes what a reader would do or conclude;
a warmth-connection clause is ranked on its own count (0/N
connected), not folded into the gate-count ranking. The
proposal is a recommendation for the coordinator / Steve, not
a landing.

## Pinned base

Worktree HEAD at prereg writing time: f44ec6957 (branch
sim-lackingline-a). The prereg commit adds only this file, so
the legs run on pinned-base game/policy code verbatim.
