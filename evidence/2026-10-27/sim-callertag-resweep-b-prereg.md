# sim-callertag-resweep-b — preregistration (written BEFORE any re-sweep judgment)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T1951Z, axis
food-economy. Arm sim-callertag-resweep-b, the named next step of
sim-callertag-b (evidence/2026-10-27/sim-callertag-b.md, DIAG-GO):
per-record mover identity was proven UNCLASSIFIABLE from existing
fields (0/276 garden-attributed deposit records to a single caller;
donateToPantry and returnToVillage homecoming deposit into the SAME
current-village pantry with byte-identical record fields; exile
amends bounded 0..276; tribute excluded by construction), the
assisted/ordinary split was closed (all 276 assisted via the
harvest-event bridge, corrected interval [anchor, H)), and
scripts/caller-tag-capture.js was built + proved 30/30 on the real
Game object, zero src/js. This arm runs the re-sweep that verdict
prescribed: "A single re-sweep band with this wrapper installed
closes the mover question outright."

## Rules (binding)

- Measurement only: ZERO src/js changes. scripts/caller-tag-capture.js
  is reused VERBATIM (no adaptation to the wrapper itself). The only
  new code is harness-side: a re-sweep script (a copy of
  scripts/sweep-stock9762-b.js with the caller-tag capture installed
  LAST, i.e. outermost, after inflow + garden + throttledays + stock
  captures, plus per-seed village-name output), an analyzer, and
  proof scripts. If the verbatim wrapper proves incompatible with
  the stacked captures, that is a reported failure, not a license to
  edit game code or to silently adapt the wrapper — any adaptation
  would need its own proof run first, and this prereg does not
  authorize landing an adapted wrapper on an unproved claim.
- NO fresh seeds beyond the band. The band is seeds 9760–9767,
  competent-nofeast, 100d — the callertag band — so the re-sweep is
  comparable to the 276-record corpus. The pilot IS the band: run
  it, then judge. No second fresh band is spent unless a GO path
  below explicitly requires one for a stated reason; none does.
- Canon read first: docs/CANON.md, then docs/GARDENS.md. Nothing
  invented.
- Judge ONLY against this prereg. A miss is NO-GO, never re-scored
  mid-run against a friendlier bar. Every evidence file carries a
  "metric review" section (MEASUREMENT.md §14).
- Corpus discipline: the re-sweep corpus lives under
  evidence/2026-10-27/sim-callertag-resweep-b-corpus/ (new dir name).
  The existing 9760–9767 corpus files (evidence/2026-10-26/
  sim-stock9762-b-corpus/) are READ, never modified, never
  overwritten. No final output is left in /tmp.

## Band (identical to the callertag band, so the comparison is honest)

- Policy: competent, competent-nofeast only.
- Env (all asserted FATAL by the sweep script, same as
  sweep-stock9762-b.js): COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 unset or 0,
  SEEDS=9760..9767, DAYS=100, SAYCAP=300, INFLOWCAP=50000.
- Horizon: 100d death-aware (runDays; dead villages stop, no fixed
  200d horizon). Same as the original band.
- Captures: inflow + garden + throttledays + stock9762, all
  UNCHANGED, plus caller-tag capture installed LAST (outermost
  depositPantryPieces wrapper, so the stack caller it reads is the
  direct game caller, not an inner capture wrapper).

## Determinism plan (stated up front — the wrapper must not perturb trajectories)

The wrapper consumes no RNG, writes no Game.state, and delegates
with identical arguments / this / return value (proved 30/30 in
sim-callertag-b). This arm proves non-perturbation on the sweep
itself, two ways:

1. Harness proof BEFORE the sweep: scripts/test-callertag-resweep-b.js
   installs inflow + garden + caller-tag captures stacked on the
   real Game object and proves (a) caller tags are still exactly
   donateToPantry / returnToVillage / returnToOldVillage for
   same-named callers when stacked, (b) delegation is identical to
   an unwrapped control, (c) zero Math.random draws consumed, (d)
   caller-tag record count equals gardenInflows deposit-door count
   on the same calls. The pre-existing scripts/test-callertag-b.js
   (30/30) is re-run green in this worktree as well.
2. Corpus comparison AFTER the sweep: scripts/analyze-callertag-
   resweep-b.js diffs every per-seed payload field EXCEPT the new
   callerTagRecords field and the new village-name fields against
   the original corpus file for the same seed. Headline identity
   required: gardenInflows deposit-door totals 276 records /
   1,310,710 kcal overall, per-seed splits 9760: 41, 9761: 60,
   9762: 129, 9763: 13, 9764: 33, 9765: 0, 9766: 0, 9767: 0, plus
   per-seed daysAlive, deaths, deathCauses, waveReach, rank,
   national, table/win identical. ANY divergence is REPORTED, not
   smoothed over — and a headline divergence fails the determinism
   leg (see verdict paths), even if the caller split looks clean,
   because a perturbed trajectory is not comparable to the 276
   corpus it claims to re-sweep.

## Primary metric and verdict paths (binding)

Primary metric: per-caller split of the re-sweep's garden-attributed
deposit records, counted from callerTagRecords joined to
gardenInflows deposit-door records on (day, name, kcal) order:
donateToPantry vs returnToVillage (homecoming) vs
returnToOldVillage (exile amends) vs other:<frame>, with kcal per
caller and destVillage per record; the assisted/ordinary split per
record from the FULL gardenShares object (not the boolean); and the
exile share as a COUNTED number (a counted zero counts — zero
exile records with destVillage evidence is a result, not a bound).

- GO: ALL of (a) determinism leg passes (headline identity above,
  no divergence on any compared field); (b) single-caller share
  ≥ 95% of garden-attributed deposit records (i.e. unclassified
  garden records ≤ 5%, where "unclassified" = a garden-attributed
  record carrying an other:<frame> tag, or a gardenInflows
  deposit-door record with no matching callerTagRecord, or a
  callerTagRecord with no matching gardenInflows record — joins
  must balance both ways); (c) exile share is a counted number
  with its destVillage values listed (not a bound); (d) the
  assisted/ordinary split is counted from the full gardenShares
  objects (whatever it shows — the split is judged as counted,
  not as matching the bridge expectation; a mismatch against the
  all-assisted bridge result is reported and discussed, not hidden);
  (e) proof scripts green (test-callertag-b.js 30/30 re-run +
  test-callertag-resweep-b.js green).
- NO-GO: determinism leg fails (any headline divergence), OR
  single-caller share < 95%, OR the join does not balance, OR a
  proof script fails, OR hygiene fails (any src/js modified, any
  original corpus file modified, uncommitted leftovers at end).
  A NO-GO names the failing leg and the exact counts. A NO-GO on
  determinism does NOT license re-running until the numbers match:
  the divergence is the finding.
- What does NOT count: a "most likely caller" assignment; a split
  counted from gardenInflows alone (no caller tag); a panel result
  not actually produced (see below); smoothing a divergence by
  re-running with different seeds or flags.

## Balanced panel (MEASUREMENT.md §15) — explicitly N/A, not faked

There is NO before/after game leg in this arm: nothing in the game
changed, and the re-sweep differs from the original band ONLY by
an added instrument. A balance-panel compare would compare an
instrument against itself, so no panel compare is run and none is
claimed. The attributable verification for this arm is the corpus
re-derivation + determinism diff + stacked-capture proof above.
If a panel compare were attempted and hit the known
balance-scorecard.js TypeError seen by prior runs, that failure
would be reported as a panel failure, not papered over — but no
such attempt is part of this prereg's verdict.

## Other deliverables (all judged, none re-scored)

- Wall numbers for the judged (re-sweep) corpus: national / table /
  wins, wave 4–5 unlocks, wave reach, median/max survival,
  death-cause shares. Arc II/III/IV, four-realm formation, trap
  acquisition, counter discovery/kill, young-link succession
  survival are NOT recorded in this corpus — stated plainly, never
  estimated.
- Village assessment in plain words: what the village looked like,
  who thrived/died and why, what knowledge/capabilities were
  missing, and which blank this arm filled or documented.
- Sense-check: at least one re-sweep deposit trace read end-to-end
  (harvest → carry → deposit) and judged as real village behavior
  or instrument artifact, with the trace quoted.
- Metric review section in the evidence file (binding).

## Deliverables

- This prereg (committed FIRST, before any sweep judgment).
- scripts/sweep-callertag-resweep-b.js (re-sweep, harness-side only),
  scripts/analyze-callertag-resweep-b.js (per-caller split +
  assisted/ordinary split from full objects + determinism diff +
  wall numbers), scripts/test-callertag-resweep-b.js (stacked-capture
  proof), evidence/2026-10-27/sim-callertag-resweep-b-corpus/
  (per-seed JSONs), evidence/2026-10-27/sim-callertag-resweep-b.md
  (verdict judged ONLY against this prereg, with a "metric review"
  section). scripts/caller-tag-capture.js UNCHANGED (verbatim reuse).
- Hygiene: zero src/js files modified; no original corpus file
  modified; worktree contains only committed work at the end.
