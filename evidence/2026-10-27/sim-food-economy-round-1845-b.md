# Loop B round 1845 — food-economy, 2 arms GO, merged locally pending ship

Run: fleshout-loop-b-20261027T1845Z. Axis: food-economy (second
non-converged axis). Loop A live at run start on scale-onramp (claim
fleshout-20261027T1816Z, arms sim-w5twokey-a + sim-lowdef-substrate-a,
NOT touched); A landed twice mid-run (w5twokey/lowdef evidence, then
its coordinator evidence b2bf0135f) and freed its trees. B worked
food-economy, taking the 1730Z next blanks (1) and (2) in order. Base
at arm start 5c3ae97be; final master 1c61cd476. Both arms
DIAG/measurement only, zero src/js, no default flips.

## Arm 1 — sim-dedupspan-wire-b: GO (with one disclosed prereg correction)

Commit 967fdd4a9 (rebased clean onto a5f6f8011 after A landed, proof
re-run green post-rebase and on merged master). Proof
scripts/test-dedupspan-wire-b.js 1588/1588, exit 0; dedupspan-b proof
34/34 (was 33/33; +1 from the intentional GO3 update below).

The ability-span de-duplication rule (scripts/dedupspan-ledger-b.js,
1730Z) is now wired into the standing analyzers: new helper
scripts/dedupspan-apply-b.js + perSeed patches in all 8 analyzers that
sum directRecords + mealDrawRecords (stockdoors, residualhunt
NEW-only; ledgerbound NEW+boundary; raiddor, raidday100,
raidday100-general, raidday100-judge NEW+boundary+raid; raidcallers
NEW+boundary+raid+caller-complete). Every perSeed return exposes
`spanDedup` with `newDrawsPreDedup` preserved, so
`newDraws = meal + other + spoiled + direct − spanDedupKcal` stays
auditable. Guard contract on every return: `applied` /
`applied-with-ambiguity` (fail-closed) / `no-span-data` (figures are
exactly the old figures; the status says a span double-count would be
undetectable on that corpus — it does not certify cleanliness).
Documented-only (never sum directRecords, so the double-count cannot
occur; the wire proof fails loudly if one gains a `directRecords`
reference): driedpath, bothgrow, cattailband, lqpersist, mealdraw,
mealdraw-reprereg, spoilvol, smoke-eq.

Verification, all corpora on master, none fabricated: 9954 span corpus
generic newDraws 202,259 → 198,459 (−3,800 exactly), generic
newResidual −35,273 → −39,073 (−3,800), raidcallers boundary residual
3,700 → −100 (the already-proven day-100 inflow timing gap, not a new
residual). Bare corpora: every return `spanDedup.status ===
'no-span-data'`, totalExcludedKcal 0, figures bit-identical.

Disclosed prereg correction (read as part of the verdict): the prereg
sentence said "every non-generic family bit-identical," overlooking
the Fish catch unit sim-dedupspan-b itself published (total excluded
3,820 = generic 3,800 + Fish 20). The wired run moves Fish catch by
exactly −20 and nothing else. The proof asserts that exact
pre-published composition rather than loosening the bar. Judged
literally on that sentence, Fish catch is a miss; judged on the bar's
intent (no movement beyond the rule's published exclusions), it passes
exactly.

Two integration fixes the wiring forced (both disclosed in arm
evidence): (1) test-dedupspan-b.js GO3 updated to the wired world
(perSeed now returns deduped cB −100 / newDraws 198,459; old figures
asserted via pre-dedup fields) — intentional behavior change, exact
numbers, not a loosened assertion. (2) Require-cycle fix in
dedupspan-ledger-b.js: `module.exports` assigned before `main()` runs
(previously the cycle returned empty exports and the CLI printed
"analyzer perSeed unavailable"); CLI labels updated to wired vs
pre-dedup. Rule behavior unchanged; exclusions gained one additive
audit field, `directIndex`.

Regression checks: full-output runs of all 8 prior-arm proof scripts.
Every failure falls in pre-existing-or-hygiene classes only
(worktree-guard checks; raidcallers corpus-valid failure without
RAIDCALLERS_POLICY=belongseek-nofeast; 9820 det-gate count mismatch
on 2026-10-26 corpora; raidday100-b ENOENT on the missing corpus —
see below; judge corpus day-100 raid taking Canned soup, not a focal
family). `check.js --quick`: 278 passed, 9 failed — all 9 unrelated
areas, none referencing any file changed here (pre-existing on this
HEAD). Note carried: `sim-raidday100-b-corpus` does not exist on
master (that analyzer's default DIR is stale); the screen corpus was
used instead.

## Arm 2 — sim-callertag-b: DIAG-GO (proven negative, Path B, stated up front in the prereg)

Commits 945b3d0d6 (prereg) + 1c61cd476 (evidence + analyzer + capture
prototype + proof), rebased clean onto b2bf0135f after A landed, proof
re-run green post-rebase and on merged master. Proof
scripts/test-callertag-b.js 30/30. Zero src/js. No fresh seeds spent.

Call-site inventory (exhaustive, grep-anchored — exactly 4 direct
`depositPantryPieces` callers in src/js):
1. `Game.returnToVillage` (game.js:8617) — homecoming pool. Fires when
   returning to Haven carrying finished food, after a keep-split and
   spoilage filter. CORRECTION to gardendeposit's wording: it deposits
   into the *current* village (`vv = state.village`), not another
   village — same destination as donate.
2. `Game.returnToOldVillage` (game.js:8774) — exile amends. Only this
   one goes to another village (past village `ov`); requires a
   fork/abandon history + oldhaven-tile walk, which the competent
   policy never performs, and the corpus has no travel/exile log — so
   exile is bounded (0..276), never excluded.
3. `Game.donateToPantry` (game.js:15371) — deliberate donation, same
   current-village destination.
4. Tribute (hierarchy.js:1173) — synthetic src with no `gardenShares`
   field, so it can never produce a garden-attributed record; excluded
   by construction.

Per-caller counts (band 9760–9767, re-derived from the corpus, not
trusted): 276 records, 1,310,710 kcal, all deposit-door, 0
unclassified — exact match to gardendeposit. Single-caller
classification: 0/276; joint class (donate ∪ homecoming ∪ exile):
276; residual: all 276. Why unclassifiable: records carry exactly
{day, door, gardenShares:true, kcal, name} — no mover, destination,
pack-stack id, or harvest day — and donate vs homecoming produce
byte-identical records to the same pantry. Both fire on this band, so
"most likely donate" would be invention, and the prereg forbade it.
Path A (≥95% to a single caller) honestly fails at 0/276; Path B's
proven-negative legs are all met, so the arm is DIAG-GO, not a kill.

Assisted vs ordinary — CLOSED, all 276 assisted: harvest-event bridge
over gardenDays snapshots + coax days: 248/248 harvest events on
deposit seeds assisted (9762: 123/123). The bridge is not vacuous —
seed 9765 shows 3 ordinary pokeweed events with 0 deposits. One
disclosed correction: the prereg's interval `(anchor, H)` missed
anchor-day coax (cultivateGarden magics just-harvested non-ripe plots
too); corrected `[anchor, H)` flips 9762's 7 apparent "ordinary"
events to assisted, with both counts shown in the arm evidence. NPC
sows don't break the bridge (`villagerSowPlot` uses the same
version-1 `gardenPlant` path).

Caller-tag prototype (zero src/js): scripts/caller-tag-capture.js
wraps `depositPantryPieces`, records caller tag from the stack,
destination village, and the full `gardenShares` object. Tribute's
anonymous-IIFE frame lands as a location-carrying `other:` tag,
documented honestly. Exact capture spec delivered: `callerTag` +
full `gardenShares` object + `destVillage`, set in the inflow/garden
capture layer. One re-sweep band with this wrapper installed closes
the mover question outright.

## Wall (judged material only)

No new win-seeking band; both arms reuse published corpora. Reused
band figures: national/table/wins 0/8, wave 4–5 0/8, median 100d
censored (callertag); wired raidcallers bare corpus national 6/8,
table 0/8, wins 0/8, wave 4–5 reach 1/8, median 100d. The scale wall is
untouched by this axis this run, as expected for ledger-closing work.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/sim-raidcallers-b-corpus/*.json' --metrics
national,table,wins,exiled`: 2 LOUD lines (table 16->0, wins 16->0,
n=8), no national LOUD line, no exiled LOUD line — the KNOWN regime +
field-shape artifact class (ledger corpus rows carry
nationalEver/won-style fields, not top-level paths; pre-seat ledger
regime vs a WINSEAT baseline). Baseline NOT rolled. First glob attempt
hit a subdirectory (EISDIR) and was re-run against the JSON files.

## Metric review

Arm 1: the prereg's "every non-generic family bit-identical" sentence
was wrong in one published unit (Fish 20 kcal); the proof now asserts
the exact published composition instead of loosening the bar. Future
preregs for wiring work should quote the rule's full published
exclusion list, not "generic only." Arm 2: Path A/Path B dual verdict
form worked as designed — a proven negative landed as evidence
instead of being deleted as a pilot kill. No metric re-scored mid-run
in either arm.

## Infrastructure

Worktree cap sequencing (not a failure): arm 1 took the last free slot
(15/16 → 16/16); arm 2 registered only after arm 1's tree was released
post-merge. Loop A landed twice under the run (w5twokey/lowdef, then
its coordinator evidence); both arms rebased clean onto the new
master, proofs green after every rebase and on merged master.
Safe-commit index clobber hit worker commits on both arms (commits
verified correct; repaired via HEAD-blob cacheinfo each time, status +
diff clean, hash verified). Merge and release kept as separate
verified steps (1730Z lesson). `check.js --quick` NOT re-run by the
coordinator: zero src/js, arm proofs are the attributable
verification (1016Z/1130Z/1230Z/1330Z/1430Z/1730Z precedent). No push,
no bump. Sibling trees (gap-*, journey-scale, panel-contract, stale
B trees, A's new sim-w5seq-a / sim-rule3trial-a / sim-fullseatgate-a)
NOT touched.

## Next blanks, in order

1. Span-draw class beyond cultivate (cultnest evidence note, still
   open): a span-draw census across ability types — only cultivate
   spans are proven to swallow an endDay.
2. One re-sweep band with the caller-tag wrapper installed, closing
   the mover question outright (donate vs homecoming vs exile per
   record).
3. The optional focal-row raid arm (fresh sweep, focal-only prereg).
4. The 0530Z carried blanks, still open: starting-stock draw order,
   spoilage-boundary split (meal vs cook), ~5,900 kcal non-draw
   removal day-82/83.
5. A treeline give/overrun band (seeds where holds fail).
6. Span-log foodState gap (findings): nest drawExit items lack
   foodState/granaryDays — the logger should carry foodState before
   the match key is extended from four fields to five.

food-economy stays converging (NOT converged): the dedup rule is now
wired into every summing analyzer and the caller-tag caveat is closed
as a proven negative with a capture spec, but the scale wall is
untouched by this axis and the carried blanks stand. scale-onramp
stays converging (untouched; sibling loop A). Claim deleted; lock
deleted.
