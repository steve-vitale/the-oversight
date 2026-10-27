# sim-genericremainder-b — PRE-REGISTRATION (written BEFORE any trace run, 2026-10-27)

Run: oversight-flesh-out-loop-b, arm sim-genericremainder-b, run
fleshout-loop-b-20261027T1130Z. DIAG/measurement ONLY: ZERO src/js
changes, no default flips, no game-code lever. This arm does NOT
re-judge the raidcallers GO, the raiddor GO, or any earlier ledger
verdict — their verdicts stand in their own evidence. Its verdict
is ONLY whether the two failing generic rows below are traced to a
named mechanism with closing arithmetic, or are explicitly
UNEXPLAINED with every candidate excluded. Judged ONLY against this
prereg. No verdict is claimed before the trace script runs.

## Context (read before designing; verdicts not re-judged)

- evidence/2026-10-27/sim-raidcallers-b.md + prereg (on master):
  caller-complete boundary legs close on both bands (named pooled 0,
  generic pooled 0.077% / 0.016%, dried pooled 0.29% / 0.20%) except
  exactly one failing generic row per band. The rows are documented,
  not explained: raidcallers' NEW-definition trace for 9954 showed
  noisy step divergences that mostly cancel (snapshot/flow day-lag)
  and isolated no single missing door.
- evidence/2026-10-27/sim-raiddor-ledger-b.md + prereg: boundary
  definition (closing snapshot after the final day's flows settle,
  end of day 100, after meal draws; day-101 sweeps post-horizon and
  excluded) and the raid-door post-snapshot adjustment.
- Corpora already on master — NO new seeds are spent until the
  existing rows are traced: pilot corpus
  evidence/2026-10-27/sim-raidcallers-b-corpus (seeds 9951-9958),
  confirm corpus
  evidence/2026-10-27/sim-raidcallers-b-confirm-corpus (seeds
  9962-9973). Both belongseek-nofeast, 100d death-aware horizon.

## Rows to trace (verbatim from sim-raidcallers-b.md)

- Pilot seed 9954, generic (Foraged food) family-seed row,
  caller-complete boundary residual +3,700 kcal (1.16% of inflow),
  FAIL against the 1% per-row bar. Seed survived to day 100,
  national rank, wave 4 reached.
- Confirm seed 9970, generic (Foraged food) family-seed row,
  caller-complete boundary residual +416 kcal (2.72% of inflow),
  FAIL against the 1% per-row bar. Seed died day 16 (village-lost),
  village rank, wave 1 only; inflow small (15,285 kcal).

A positive residual means the closing stock exceeds what the
recorded flows predict: either an unrecorded inflow of that size,
or recorded draws/sweeps/losses overstated by that size, or a
boundary/snapshot timing artifact of that size. A negative residual
would mean the reverse. Both rows are positive; the trace must say
which side of the identity fails, with numbers.

## NEW-definition trace method (fixed before judging)

### Generic-family definition used in this trace (the NEW definition)

The generic family is the famOf-collapsed "Foraged food" family:
every channel and every item whose name, after stripping ONE
trailing " (dried)" or " (smoked)" suffix, equals "Foraged food".
That is: fresh channel "Foraged food" PLUS dried/smoked variants
"Foraged food (dried)" and "Foraged food (smoked)", in opening
stock, closing stock, inflows, draws, sweeps, and transform
events alike. This is the analyzer's famOf, not a literal
channel-name match.

Why this definition matters: a fresh-to-dried transformation inside
the family moves kcal between its own channels and must net to
zero except for the recorded transform loss. If the trace used a
literal channel match instead, every drying event would look like
a disappearance from the family and every dried draw like an
unexplained draw. The trace therefore reports, per row, the split
of the residual across the family's base (fresh) and dried
sub-ledgers, so a within-family transform leak shows up as equal
and opposite base/dried residuals rather than as a family total.

### Old vs new definition, shown for each row

- OLD definition (driedpath honesty rules, the control): inflow =
  three doors only (stock / pantryAdd-added / other inflow doors as
  recorded in inflows, with stock kcal <= 0 and pantryAdd-added =
  false filtered out); draws = pantryDraw records only; sweeps as
  recorded; transform loss = linked events only. No stockdoor
  inflow, no drawSpoiled, no direct draws, no _removePantryKcal
  draws. Residual computed on the raw closing snapshot (no
  boundary adjustment).
- NEW definition (raidcallers trace): OLD plus stockdoor inflow
  (generic family only), drawSpoiled draws, direct draws, ALL
  _removePantryKcal draws (raid-unanswered + every
  removepantry-<caller>), same sweeps and linked transform loss.
  Residual computed on the raw closing snapshot.
- BOUNDARY (caller-complete) definition (the judged row): NEW
  flows restricted to days <= the horizon day (100, or the death
  day for early-death seeds), with the boundary closing =
  raw closing + day-100 stockdoor pushes − day-100 meal draws
  (pantryDraw + drawSpoiled on day 100; direct day-100 draws are
  daytime flows already in the snapshot and are NOT adjusted),
  minus post-snapshot _removePantryKcal takes dated == the
  closing-snapshot day (total and dried portion). For an
  early-death seed the "day-100" adjustments do not apply: the
  closing snapshot is the death-day snapshot, and the
  post-snapshot check is against the death-day snapshot day.
  The trace reports, for each row, the bridge:
  OLD residual → NEW residual → BOUNDARY residual, with each
  bridge step's kcal, so it is visible whether the remainder
  survives the definition moves or is created by one of them.

### Trace procedure (per row, in this order)

1. Re-derive the row from the committed corpus with an
   independent recomputation (scripts/test-genericremainder-b.js):
   the analyzer's caller-complete generic row value must be
   reproduced exactly before any mechanism is named.
2. Check the KNOWN boundary artifacts FIRST, before naming any
   new mechanism (do not re-attribute a known artifact):
   (a) closing snapshot vs day-100 draws — for 9954: day-100
   meal draws, day-100 stockdoor pushes, and any
   _removePantryKcal record dated == the closing-snapshot day
   (100), and whether each was already adjusted in the boundary
   closing; for 9970: the same check against the death-day
   snapshot (day 16), including flows dated on day 16 after the
   snapshot and flows dated after day 16 (death tail);
   (b) day-101 sweeps / post-horizon flows — any inflow, draw,
   sweep, or transform dated after the last snapshot day, and
   whether the boundary ledger excluded it (it must) or the
   NEW-definition trace counted it (it does — the bridge must
   show the difference);
   (c) direct pantry consumption bypassing pantryDraw — every
   directRecord for the family, by path, with item sums vs
   returned kcal (retMismatch), and whether any direct path is
   double-counted with a meal draw for the same event;
   (d) alien raids / Light Fingers lifts — every raidRecord for
   the family, by path and caller, with asked vs taken vs item
   sum, and whether any raid item sum disagrees with the
   recorded taken kcal or any raid path falls outside the
   caller-complete draw set.
3. Only then, decompose the residual: snapshot-sequence trace
   (scripts/trace-raidcallers-b.js, NEW definition) over the
   spoilDays series, listing every nonzero step divergence and
   the persistent-divergence window (if any); per-day family
   flow totals (inflow / draws by door and path / sweep /
   transform loss, split base vs dried); unlinked transform
   events for the family (post kcal that the loss-only ledger
   never sees); spoil-sweep channel mapping for the family
   (famOf on channel names vs literal names); inflow honesty
   filters actually applied (stock <= 0 excluded, pantryAdd
   unadded excluded — list any excluded record for the family
   and its kcal, since an excluded record that really landed
   would appear as a positive residual); duplicate snapshot
   days / empty intervals in the spoilDays series.
4. Name the mechanism ONLY if its kcal arithmetic closes the
   row: mechanism kcal == residual within ±1 kcal on the
   boundary definition (rounding: all corpus kcal are integers;
   no rounding allowance beyond 1 kcal), with the records
   listed. Otherwise the row is UNEXPLAINED, with each candidate
   above listed as excluded and the evidence that excludes it,
   plus what would settle it (which recorder, which seed, which
   instrument change — not a game-code change, which this arm
   does not make).

## PRE-REGISTERED GO (verbatim — judge ONLY against this)

GO iff BOTH rows are traced to a named mechanism with closing
arithmetic (mechanism kcal == boundary residual within ±1 kcal,
records listed), OR both rows are explicitly UNEXPLAINED with
every candidate in step 2–3 above excluded by evidence and a
settling next step stated for each. A single-row trace (one row
traced, the other neither traced nor fully excluded) is a
PARTIAL verdict, not GO. A row "explained" by a mechanism whose
kcal does not close, or by re-attributing a known boundary
artifact already adjusted in the boundary definition, is NOT a
trace — it is reported as unexplained for that row.

## Corpora and analyzer (fixed before judging)

- Corpora: evidence/2026-10-27/sim-raidcallers-b-corpus
  (pilot, seeds 9951-9958) and
  evidence/2026-10-27/sim-raidcallers-b-confirm-corpus (confirm,
  seeds 9962-9973). No new seeds; no sweep is run unless the
  trace step 4 settling step requires one, in which case that
  sweep is a NEW arm's work, not this arm's verdict input.
- Analyzer: scripts/analyze-raidcallers-b.js (computeLegs /
  perSeed, caller-complete legs leg3c/leg4c/leg5c) for the judged
  row values; scripts/trace-raidcallers-b.js (NEW-definition
  snapshot-sequence trace) for the step decomposition.
- Proof: scripts/test-genericremainder-b.js (new in this arm)
  re-derives BOTH rows from the committed corpora via an
  independent recomputation (not by calling the analyzer's
  leg function), reproduces the analyzer's caller-complete
  generic row values for 9954 (+3,700) and 9970 (+416), and
  re-derives the OLD → NEW → BOUNDARY bridge for each row.
  The proof also checks the known-artifact exclusions
  (post-snapshot takes, post-horizon flows, direct retMismatch,
  raid asked/taken/item-sum agreement) as assertions, not
  narrative. Proof command:
  node scripts/test-genericremainder-b.js (run from the
  worktree root; corpus paths are relative to the repo root
  and must resolve to the committed corpora).
- No jest (the proof is node, not jest). No [needs-eyes]: this
  lands a measurement, not a player-visible change.

## Reachability + sense (reported, not judged)

Reachability is not re-judged here (raidcallers reported it: pilot
national-or-better 6/8, confirm 9/12, table 0/20, wins 0/20). Sense
note: at least one captured line from each traced seed's corpus
(raidSayLines / smokeSayLines) read for meaning — whether the
village's recorded speech around the traced days is coherent
with the ledger flows — or an explicit statement that the
corpus's captured lines do not cover the traced days. Sense is
reported, not judged, and never substitutes for arithmetic.

## Metric review (MEASUREMENT.md section 14)

Pre-registered metrics bind this run: the GO above is the only
verdict. If the ±1 kcal closure bar proves wrong (e.g. a
mechanism closes to within a few kcal but the corpus rounds a
unit conversion), that is written under "metric review" and the
row is still reported UNEXPLAINED under this prereg, with the
near-miss mechanism and its gap stated — never re-scored
mid-run. If the generic-family definition above proves wrong
(e.g. a dried variant name that famOf does not strip), that is
likewise metric review for the NEXT run, and the trace reports
both the famOf result and the literal-name result for the row.
