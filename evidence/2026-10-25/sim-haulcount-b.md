# sim-haulcount-b — haul + preserve action counts in per-seed recorder output

Run: oversight-flesh-out-loop-b-20261025T1630Z, arm sim-haulcount-b,
axis food-economy. Worktree: `~/workspace/worktrees/sim-haulcount-b`,
branch sim-haulcount-b.

Status: PRE-REGISTERED — the GO thresholds G1–G5 below were fixed
before the pilot ran. This arm proves the INSTRUMENT ONLY. It does
NOT re-judge leg2decide, rotdecide-govern, rotragged, or
rotcompanion verdicts (they stand), and it does NOT judge any rot
verdict on the pilot seeds (the pilot is 8 fresh seeds, not a
deciding corpus).

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
- The counting definitions below are measured from the code, not
  invented: every stockPantry/depositPantryPieces call site was
  read, and the preserve verbs were read in `src/js/food.js`
  (preserveFood/renderFat/makePemmican all return null on every
  path, so success is an item-state delta, never a return value).

## Background (quoted from prior runs, NOT re-judged here)

- sim-rotcompanion-b (evidence/2026-10-25/sim-rotcompanion-b.md):
  the companion metric (absolute rot per 100 village-days, pd0 vs
  pd1) qualifies the governing ratio STEPs as DENOMINATOR-DRIVEN
  on both corpora — but its stated limitation is that
  haul-vs-preserve cause is still unmeasured, because per-seed
  files carry no haul/preserve action counts. Its verbatim
  pre-registration template for the next deciding rot run is
  adopted here with one addition (see "What the next deciding
  run adopts" below): the counts alongside the companion metric.
- sim-rotragged-b (evidence/2026-10-25/sim-rotragged-b.md): the
  preserver-widening step is ragged (identical/down/up/degenerate
  seeds) and down-moves split into genuine depri-side improvement
  vs denominator-driven pd0 blowup (pd0 rot up 2.8x–10.6x,
  overwhelmingly fresh rot). The mechanism — "more hauling" vs
  "less preserving" — is unanswered without action counts. This
  arm builds the instrument that answers it.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

- Instrument: scripts/sweep-haulcount-b.js (new, derived verbatim
  from scripts/sweep-leg2drift-b.js — the instrument that produced
  the leg2decide/rotdecide corpora — plus haul/preserve counting;
  declared deltas in the sweep header) + one counting-only tap in
  src/js/game.js (HAULCOUNT TAP markers, cook-duty smoke racks).
- Pilot only: 8 fresh seeds (9400–9407) x {pd0, pd1} x leadfeast/dg1,
  100d death-aware horizons (dead villages stop, +10d tail max),
  FEASTSCALE_R13=1, SEATDRIVE=0. Anchor = the instrument commit
  that ran (see Proof). No verdict is judged on the pilot.
- Balanced panel (§15): inapplicable — instrument demonstration,
  not a before/after lever landing; no verdict is re-judged, so
  there is no before/after comparison to panel.

### GO thresholds (judge this run ONLY against these; no re-scoring)

- G1: per-seed output gains BOTH counts, separately: haul actions
  (food hauled to the pantry / deposited) and preserve actions
  (preservation attempts, with successes distinguished from
  attempts where the code distinguishes them — reported exactly
  as the code counts them, never redefined).
- G2: counts present on EVERY per-seed file from the pilot sweep
  (8 seeds, pilot only), non-negative integers, and haul counts
  > 0 on competent food runs (a zero-everywhere instrument is a
  failed instrument).
- G3: counts sane on sampled seeds: at least 2 pilot seeds
  spot-checked by tracing counts back to real pantry/haul/preserve
  events in the run output (counts must correspond to actions
  that happened, not to ticks or unrelated events).
- G4: ZERO game-code behavior change: the diff changes only
  counting/recording lines (every touched hunk's nature listed
  in the diff review). If a behavior line must move to place a
  tap, the arm is NO-GO until the coordinator rules — nothing
  smuggled in.
- G5: the evidence file carries the exact field names/paths a
  future rot analyzer must read, plus the rotcompanion template
  note that the next deciding run adopts counts alongside the
  companion metric.

## What was built

### Recorder: scripts/sweep-haulcount-b.js (new file, 397 lines)

Derived from scripts/sweep-leg2drift-b.js with these declared
deltas (everything else — rot capture via the sweepSpoiled
wrapper with the same dedupe, death capture, villageDays
exposure, depriKcal ledger read, wall fields, FATAL env asserts,
death-aware horizons, EPERM-resilient writes, STDOUT_SPLIT
routing — byte-identical in behavior):

1. HAUL counting. Two wrappers, both delegating to the original,
   counting blocks try/catch-isolated so a counting failure can
   never change game behavior:
   - `stockPantry(kcal, name, opts)`: every call with rounded
     kcal > 0 is a pantry deposit (pantryDepositActions /
     pantryDepositKcal). The HAUL subset passes `isFieldHaul`:
     the generic duty names (Foraged food, Game meat, Garden
     harvest, Fish catch, Expedition haul, Aid crew haul), the
     trap lines (Snared meat, Pit meat (X)), the haul-return
     default (Hauled meat), and the emergency hunt (Emergency
     hunt meat). A falsy name counts as 'Foraged food',
     mirroring stockPantry itself.
   - `depositPantryPieces(v, src, pieceKcal)`: the homecoming /
     village pooling path. Counts only when the target village
     IS the home village (v === Game.state.village) AND the src
     name does not start with 'Tribute ' (tribute grain and
     exile-amends pooling into another village's fire are
     transfers, not hauls). Deposited kcal is the ORIGINAL's
     return value, never a re-derivation. Home-pantry pieces
     calls count in BOTH haulActions and pantryDepositActions:
     a homecoming unload IS a haul and IS a pantry deposit.
2. PRESERVE counting (scholar verbs). The verbs return null on
   every path, so success is NEVER read from the return value —
   it is the item-state delta in the same container the verb
   acted on, counted before/after delegation:
   - preserveFood: attempt = one call; successes = delta of
     preserved UNITS (sum of units over foodState 'preserved'
     items) in the acted container.
   - renderFat: attempt = one call; successes = delta of
     rendered units, same units rule.
   - makePemmican: attempt = one call; sets = delta of pemmican
     stacks (itemId 'pemmican'), bars = delta of their units.
   - A call that finds nothing (no fire, no targets, no render
     knowledge, no plan) is an ATTEMPT with zero successes —
     exactly the distinction the rot question needs.
3. VILLAGER preserving (the cook-duty smoke racks,
   src/js/game.js `a.task === 'cook'`): the conversion is INLINE
   game code, not a verb, so no wrapper can see it. It is
   counted by the game.js tap below into Game._haulcount.
   As a wrapper-visible cross-check, creditDeed calls with
   deedId 'preserving' are counted into
   preserveVillagerResolutions (one per cook resolution with
   n > 0; the ONLY 'preserving' creditDeed call site is that
   same cook block). Invariants enforced by the test on every
   pilot file: batches >= resolutions when resolutions > 0,
   and kcal <= 4000 * resolutions (the cook's per-resolution
   budget cap).
4. TRACE mode (HAULCOUNT_TRACE=1, off by default): wrappers also
   record per-event {day, via, name, kcal} for deposits and
   {day, verb, items} for scholar preserves, capped at 500
   stored events (totals always complete). Trace JSONs land
   beside the per-seed files as
   haulcount-b-trace-<ANCHOR8>-<SIDE>-dg1-<POLICY>-s<seed>.json.
   Trace runs are deterministic re-runs: their per-seed files
   must be byte-identical to the pilot's (verified, see Proof).

### Counting tap: src/js/game.js (8 added lines, cook-duty loop)

Placed immediately after the game's own
`budget -= stackKcal; n++; keptKcal += ...` line, between
HAULCOUNT TAP BEGIN/END markers. It mirrors that resolution's
own conversion into Game._haulcount (batches += 1, kcal += the
same kept-kcal formula the game just used), inside its own
try/catch. It writes NOTHING else, reads no other state, and
cannot change behavior. The sweep reads Game._haulcount at end
of run into preserveVillagerBatches/preserveVillagerKcal.

### Inherited, unchanged, stated not hidden

The leg2drift registerDeath wrapper records deaths but does NOT
delegate to the original registerDeath. That is pre-existing
instrument behavior from the source instrument (verified: the
wrapper is identical to leg2drift's), kept for comparability
with the leg2decide/rotdecide corpora. This arm did not change
it and does not defend it — a future instrument revision may
revisit it, but changing it here would break comparability with
the corpora the next deciding run compares against.

### The trace-caught undercount (found by the pilot, fixed before final numbers)

The FIRST haul predicate (generic duty names only) was run on
the pilot, and the trace files caught it undercounting: on seed
9400 pd0, 38 stock deposits were excluded, of which 32 were
REAL villager trap hauls (27 Snared meat + 5 Pit meat) and only
6 were correctly non-haul (5 Aid from Emberhold + 1 System
meal). The predicate was widened to the caller census above
(trap lines, haul-return default, emergency hunt) and the
pilot was RE-RUN from scratch on the fixed instrument. All
numbers in RESULTS are from the fixed instrument; the first
run's numbers are superseded and are not quoted as results.
Residual gap, stated not hidden: a haul-return whose haulName
is a bare custom site label other than 'Hauled meat' would miss
the predicate — no such name appeared in the 4 traced runs,
and a future trace showing one is the signal to widen it.

## RESULTS (pilot only — instrument demonstration, NOT a verdict)

Pilot corpus: evidence/2026-10-25/haulcount-b-corpus/ — 16
per-seed files (8 seeds x pd0/pd1), 2 eight-row sweep summaries,
4 trace files. Anchor: 7a6d873a3a977107f70f5ba73e07b46503ad7a62
(the fixed-instrument commit). All 16 files carry all 11 new
fields as non-negative integers; haulActions > 0 and haulKcal >
0 on all 16.

### Pilot ranges (8 seeds per side)

| side | haulActions | haulKcal | pantryDepositActions | pantryDepositKcal | preserveAttempts | villagerBatches | villagerKcal | villagerResolutions |
| pd0 | 81–310 (med 200.5) | 40,209–239,699 (med 101,978) | 81–312 (med 206.5) | 42,930–244,266 (med 123,432) | 0 everywhere | 3–175 (med 76) | 3,069–141,457 (med 56,046) | 3–52 (med 28) |
| pd1 | 154–326 (med 209) | 64,508–299,118 (med 100,152) | 168–331 (med 221) | 77,378–299,518 (med 135,046) | 0 everywhere | 27–212 (med 99) | 24,858–83,917 (med 58,908) | 13–71 (med 39) |

Scholar preserve attempts are 0 on all 16 pilot files. That is
a REAL finding about the instrument's coverage, not a gap in
it: the leadfeast policy chain (belongseek/leadcourt/competent)
never calls preserveFood/renderFat/makePemmican — the scholar's
verbs are UI verbs — so in these sims ALL preservation is
villager smoke-rack work (the tap + resolutions columns). A
future run whose policy DOES preserve (e.g. livelihood.js,
which calls preserveFood) will populate the scholar columns
through the same wrappers. The instrument does not invent
scholar preserves where none happened.

### Per-seed pilot table

seed | side | days | haulActions/haulKcal | deposits | presAtt | villBatches/villKcal/res | rotTotal | depriKcal
9400 | pd0 | 100 | 289 / 153,798 | 304 / 203,235 | 0 | 80 / 58,692 / 38 | 23,408 | 0
9401 | pd0 | 95 | 217 / 116,471 | 228 / 142,292 | 0 | 72 / 52,653 / 21 | 39,885 | 0
9402 | pd0 | 100 | 123 / 40,209 | 136 / 80,414 | 0 | 68 / 54,535 / 25 | 29,191 | 0
9403 | pd0 | 100 | 184 / 87,485 | 185 / 88,085 | 0 | 38 / 32,534 / 14 | 4,897 | 0
9404 | pd0 | 100 | 310 / 239,699 | 312 / 244,266 | 0 | 175 / 141,457 / 52 | 192,593 | 0
9405 | pd0 | 40 | 81 / 42,930 | 81 / 42,930 | 0 | 3 / 3,069 / 3 | 1,000 | 0
9406 | pd0 | 90 | 157 / 77,378 | 167 / 104,572 | 0 | 91 / 75,565 / 31 | 39,752 | 0
9407 | pd0 | 100 | 290 / 142,112 | 303 / 185,051 | 0 | 95 / 57,558 / 38 | 1,701 | 0
9400 | pd1 | 100 | 208 / 94,860 | 225 / 145,338 | 0 | 81 / 64,954 / 32 | 73,701 | 197,833
9401 | pd1 | 100 | 178 / 64,508 | 183 / 77,378 | 0 | 125 / 52,862 / 46 | 26,662 | 175,896
9402 | pd1 | 100 | 161 / 80,253 | 178 / 140,110 | 0 | 45 / 41,546 / 20 | 14,079 | 156,335
9403 | pd1 | 100 | 154 / 65,778 | 168 / 102,313 | 0 | 38 / 24,858 / 13 | 33,676 | 114,331
9404 | pd1 | 100 | 313 / 172,872 | 321 / 195,760 | 0 | 181 / 79,590 / 47 | 48,378 | 215,107
9405 | pd1 | 100 | 268 / 299,118 | 269 / 299,518 | 0 | 27 / 39,448 / 15 | 49,044 | 59,087
9406 | pd1 | 100 | 210 / 105,444 | 217 / 124,011 | 0 | 117 / 83,917 / 47 | 7,103 | 322,464
9407 | pd1 | 100 | 326 / 118,706 | 331 / 129,982 | 0 | 212 / 73,083 / 71 | 17,496 | 190,847

## G3 SPOT-CHECKS — counts traced to real events (2 seeds x both sides)

Trace files: haulcount-b-trace-7a6d873a-<side>-dg1-leadfeast-
s{9400,9404}.json. For each, haulActions/haulKcal were
recomputed INDEPENDENTLY from the stored events (field-named
stock events + home-pantry pieces events) and matched the
per-seed totals exactly; trace totals matched per-seed totals
for every traced field (formal check: test T3).

- Seed 9400 pd0: 289 haul actions = 285 field-named stock
  deposits (Foraged food 140, Fish catch 108, Expedition haul
  5, Snared meat 27, Pit meat (White-tailed Deer) 3, Pit meat
  (Raccoon) 2) + 4 homecoming pieces deposits (Burdock 4).
  Excluded, correctly: 6 deposits / 11,437 kcal (Aid from
  Emberhold 5, System-replicated (enthusiastic) meal 1) — aid
  and a System gift, not hauls. First events: day 1 Foraged
  food 100 kcal, day 1 Foraged food 539 kcal — the village's
  first forages, real actions with day, name, and kcal each.
  VillagerCook resolutions: 38, first day 32, last day 99 —
  the racks start only once surplus about to spoil exists,
  which is the sensible shape (no day-1 preserving of food
  that was just hauled).
- Seed 9404 pd0: 310 = 215 stock (Foraged food 189, Snared
  meat 19, Expedition haul 6, Fish catch 1) + 95 pieces
  (Purslane 91, Burdock 4 — a big homecoming unload of
  carried plants). Excluded, correctly: 2 Aid from Emberhold
  deposits / 4,567 kcal.
- Seed 9400 pd1: 208 = 202 stock (Foraged food 148, Fish
  catch 51, Expedition haul 1, Snared meat 1, Pit meat
  (Virginia Opossum) 1) + 6 pieces (Burdock 4, Canned corn 1,
  Canned beans 1). Excluded, correctly: 9 deposits /
  18,478 kcal (System-replicated stew 1, Aid from The
  Bloodied 1, Aid from Emberhold 7).
- Seed 9404 pd1: 313 = 248 stock (Foraged food 167, Fish
  catch 54, Snared meat 16, Expedition haul 9, Garden
  harvest 2) + 65 pieces (Purslane 37, Blackberry 18,
  Burdock 10). Excluded, correctly: 5 Aid from Emberhold /
  10,888 kcal.

Villager batches (tap-counted, not event-traced — the
conversion is inline code, so there is no wrapper event to
trace from): the proof is placement + invariants. The tap
sits on the exact conversion line and reuses the game's own
per-resolution numbers; on all 16 pilot files batches >=
resolutions and kcal <= 4000 * resolutions (the cook's
budget cap) hold with no exception. A phantom or
double-counting tap would break the budget cap; a missed
conversion would break batches >= resolutions on a
resolution that preserved.

## SENSE-TESTING: do the counts read like villagers acting?

Yes, in the traces' own words: day-1 forages land 100-kcal
pieces; trappers come back from snares and pit lines with
species-named meat (White-tailed Deer, Raccoon, Virginia
Opossum); named villages send aid (Emberhold, The Bloodied);
homecomings unload named plants (Purslane, Burdock,
Blackberry) and canned goods; cooks work the racks from
about day 20–32 onward, not from day 1. Nothing in the
counts is a tick, a promise, or a System gift wearing a
haul's clothes — the excluded deposits are listed per trace
above, and they are exactly the aid/gift names. The one
honest asymmetry: scholar preserve columns are 0 because
the policy never preserves, not because the instrument
cannot see preserving — the villager columns carry the
whole preserve side in these sims, and that is the true
shape of preservation under leadfeast.

## What the next deciding run adopts (G5 — read this, future analyzer)

Per-seed field names (top level of each per-seed JSON, beside
the existing rot/depri/days fields):

- haulActions (int): field-haul deposits into the home pantry
  (isFieldHaul predicate above) + home-pantry pieces deposits.
- haulKcal (int): kcal in those haulActions.
- pantryDepositActions / pantryDepositKcal (int): ALL pantry
  deposits (every stockPantry call with rounded kcal > 0 +
  every depositPantryPieces call with deposited kcal > 0,
  including aid, gifts, refunds, leftovers). Use this for
  total inflow; use haulActions/haulKcal for haul cause.
- preserveAttempts (int): scholar preserveFood + renderFat +
  makePemmican calls (calls that returned, all verbs return
  null by design).
- preserveSuccessItems (int): smoked + rendered UNITS (stack
  units, not stack objects).
- preservePemmicanSets (int): pemmican stacks created.
- preservePemmicanBars (int): pemmican bar units created.
- preserveVillagerBatches (int): villager smoke-rack stacks
  converted (game.js tap).
- preserveVillagerKcal (int): kept kcal of those batches.
- preserveVillagerResolutions (int): cook-duty resolutions
  with n > 0 (creditDeed 'preserving' count).
- Trace files (same corpus dir, haulcount-b-trace- prefix)
  carry per-event {day, via, name, kcal} for deposits and
  {day, verb, items} for scholar preserves, capped at 500
  stored events; totals in each trace file match its per-seed
  file exactly.

Rotcompanion template note (addition to the verbatim template
in sim-rotcompanion-b.md, for the next deciding rot run):
adopt the companion metric AND these counts together. The
companion answers WHERE rot moved (which side, how much);
the counts answer WHY it is haul-vs-preserve: compare
haulKcal and preserveVillagerKcal (+ preserveSuccessItems
when the policy preserves) across the pair's sides before
calling any down-move genuine or denominator-driven. A
denominator-driven seed whose pd0 haulKcal rose while its
pd0 preserve columns stayed flat is a HAUL story, not a
preserve story — and the counts, not the ratio, say so.
Rules carried over unchanged: the companion NEVER replaces
scripts/govern-verdict.js; degenerate seeds stay counted
separately; "flat" is exact equality on deterministic files;
daysChanged seeds get the lifespan-move caveat (template
item 6).

## GO / NO-GO per G1–G5

- G1: GO. Both counts present and separate on every pilot
  file: haulActions/haulKcal + pantryDepositActions/
  pantryDepositKcal + preserveAttempts/preserveSuccessItems/
  preservePemmicanSets/preservePemmicanBars +
  preserveVillagerBatches/preserveVillagerKcal/
  preserveVillagerResolutions. Successes are distinguished
  from attempts exactly as the code distinguishes them
  (item-state deltas; verbs return null always).
- G2: GO. All 11 fields on all 16 pilot files, non-negative
  integers, haulActions 81–326 and haulKcal 40,209–299,118
  (never zero-everywhere; the minimum is the 40-day
  village-lost seed 9405 pd0, which still hauled 81 times).
- G3: GO. 4 traces (2 seeds x both sides) recomputed from
  events to the action and matched exactly; excluded
  deposits identified by name as aid/gifts, not hauls;
  villager batches held under both invariants on all 16
  files.
- G4: GO. Diff review below: the ONLY game-code change is
  the 8-line counting tap; no behavior line moved, added,
  or removed. The sweep and test are new files; no existing
  analyzer, causebase, tableseat, or game-logic file was
  touched. All wrappers delegate to their originals.
- G5: GO. Field names/paths above + the rotcompanion
  template note above.

## Metric review (filled after the results, §14 — revisions apply to the NEXT run)

- THE PREDICATE IS A CENSUS, NOT A DEFINITION. The first
  predicate missed real hauls (trap lines) and the traces
  caught it — which is the system working. But a census
  rots: any future stockPantry caller with a new haul name
  will silently miss the predicate until a trace shows it.
  The next instrument revision should consider inverting
  the rule (count every stockPantry deposit as a haul
  EXCEPT the known non-haul names: System gifts, aid,
  refunds, restitution, leftovers, returned rations) — the
  non-haul set is smaller and more stable than the haul
  set. NOT adopted here (it would change the pilot numbers'
  meaning mid-run); proposed for the next run, which should
  re-derive the pilot on the inverted rule and compare.
- SCHOLAR PRESERVE COLUMNS ARE POLICY-DEPENDENT. Under
  leadfeast they are structurally 0; under a preserving
  policy they populate. A future analyzer must not read
  "preserveAttempts 0" as "nothing was preserved" — it
  must read the villager columns alongside, always.
- TRACE CAP. 500 stored events covered all 4 traced runs
  (max stored 365), but a 100-day village hauling ~300
  times plus ~200 deposit events plus cook resolutions
  approaches the cap on busier seeds; a future run with
  longer horizons should raise the cap or store events
  per-kind. Totals are always complete regardless of the
  cap — only the event-level recomputation degrades.
- VILLAGER BATCHES ARE TAP-COUNTED, NOT EVENT-TRACED.
  The tap's placement + invariants are strong, but they
  are not an independent event stream. If a future run
  needs event-level villager preserve proof, the tap would
  have to record {day, batches, kcal} per resolution into
  Game._haulcount — a small, still-counting-only change.

## Diff review (G4 evidence — every touched hunk's nature)

- src/js/game.js: +8 lines only, inside the cook-duty
  convert loop (a.task === 'cook'): comment lines +
  one try/catch counting statement writing ONLY to
  this._haulcount (verified: no this.state write, no
  pantry/roster/kcalEach reference in the tap line; the
  test asserts this structurally). No other game.js line
  changed. No behavior line moved.
- scripts/sweep-haulcount-b.js: NEW FILE (derived from
  sweep-leg2drift-b.js; deltas documented in its header).
  All wrappers delegate (oStock/oPieces/oCredit/orig/oPem
  .apply); counting blocks are try/catch-isolated.
- scripts/test-haulcount-b.js: NEW FILE (proof only).
- evidence/2026-10-25/haulcount-b-corpus/: NEW — 16
  per-seed files, 2 sweep summaries, 4 trace files (the
  pilot's outputs, committed so the next run can read them
  without re-running).
- evidence/2026-10-25/sim-haulcount-b.md: NEW (this file).
- Nothing else touched: no analyzer, no causebase file, no
  tableseat file, no other game-logic file. The leg2drift
  source instrument is untouched.

## Proof

- node --check on sweep, test, and game.js: clean.
- node scripts/test-haulcount-b.js => 49 PASS, 0 FAIL
  (T1 static tap/sweep checks + T2 live 10-day mini-run
  with trace determinism + trace-total checks).
- node scripts/test-haulcount-b.js --corpus
  evidence/2026-10-25/haulcount-b-corpus --seeds 9400-9407
  => 342 PASS, 0 FAIL (T1+T2+T3: all 16 pilot files'
  fields, haul > 0, deposits >= hauls, villager invariants,
  and trace totals == per-seed totals on all 4 trace files).
- Pilot determinism: trace re-runs' per-seed files
  byte-identical to the pilot's (md5-verified on all 4
  traced files); the final summary-restoring re-run's
  per-seed files byte-identical to the pilot's on all 16
  (md5-verified). The sweep summaries in the corpus are
  the final 8-row pilot summaries.
- Node harness: the sweep uses scripts/sim-harness.js
  (loadGame/setupGame/runDays) exactly as leg2drift does;
  Math.random is seeded before eval by the harness. No
  Game.save stub. No jest run (no jest suites touch this
  instrument; the proof test is the designated suite).
- Standing verdicts re-judged: NONE. leg2decide STEP
  CONFIRMED, rotdecide-govern STEP (CONTESTED),
  rotcompanion DENOMINATOR-DRIVEN qualifiers — all stand.
  The pilot seeds (9400–9407) are fresh and carry no verdict.

## Scope compliance

Instrument + tap + proof test + pilot corpus + evidence only.
No push, no version bump, no live verification. Merged
locally, pending ship, by the coordinator. Three commits on
this branch: the instrument commit (tap + sweep + test),
the fix commit (widened haul predicate + test predicate),
and the pilot commit (corpus + this evidence file) — the
first two repaired for the known safe-commit index clobber
(index entries restored from HEAD blobs; commits verified
via git show).
