# sim-haulinvert-b — the haulcount predicate, inverted

Run: oversight-flesh-out-loop-b-20261025T1752Z, arm sim-haulinvert-b,
axis food-economy. Worktree: `~/workspace/worktrees/sim-haulinvert-b`,
branch sim-haulinvert-b.

Status: PRE-REGISTERED — the GO thresholds H1–H6 below were fixed
before any sweep in this run. This arm proves the INSTRUMENT ONLY.
It does NOT re-judge leg2decide, rotdecide-govern, rotragged,
rotcompanion, or any rot verdict, and it does NOT judge any rot
verdict on the pilot seeds (the pilot is the same 8 fresh seeds as
sim-haulcount-b, re-run under the inverted predicate).

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
- The exclusion list below is measured from the code, not guessed:
  EVERY stockPantry/depositPantryPieces call site was read
  (2026-10-25, this run), and each name is justified from its
  call site in the derivation table. The counting definitions of
  sim-haulcount-b (evidence/2026-10-25/sim-haulcount-b.md) are
  adopted unchanged for the current-predicate side of this
  comparison.

## Background (quoted from the prior arm, NOT re-judged here)

sim-haulcount-b built the haul/preserve action-count recorder and
proved it on the pilot (seeds 9400–9407 x pd0/pd1, leadfeast/dg1,
100d death-aware). Its "metric review" proposed the next revision:
invert the rule — count every pantry deposit as a haul EXCEPT the
known non-haul names — because "a census rots: any future
stockPantry caller with a new haul name will silently miss the
predicate until a trace shows it", while "the non-haul set is
smaller and more stable than the haul set". This arm is that
revision, judged ONLY on the comparison below.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

- Instrument: scripts/sweep-haulinvert-b.js (new, derived verbatim
  from scripts/sweep-haulcount-b.js — the prior instrument — plus
  inverted-predicate counting; declared deltas in the sweep header)
  + scripts/compare-haulinvert-b.js (new, field-by-field comparison
  of the new corpus against the prior corpus) + the unchanged
  game.js HAULCOUNT TAP (cook-duty smoke racks; already in this
  branch from sim-haulcount-b — this arm adds NO game-code lines).
- Comparison: the IDENTICAL pilot — seeds 9400–9407 x {pd0, pd1} x
  leadfeast/dg1, 100d death-aware horizons (dead villages stop,
  +10d tail max), FEASTSCALE_R13=1, SEATDRIVE=0 — re-run under the
  inverted predicate, compared field-by-field against
  evidence/2026-10-25/haulcount-b-corpus/ (anchor 7a6d873a).
  Preserve columns are controls: scholar preserve columns are
  policy-dependent (0 under leadfeast per haulcount-b — the policy
  never preserves), so villager columns are always read alongside.
- Balanced panel (§15): inapplicable — instrument demonstration,
  not a before/after lever landing; no verdict is re-judged, so
  there is no before/after comparison to panel.

### The inversion rule

invHaulActions/invHaulKcal = every pantry deposit (rounded kcal >
0) in the instrument's deposit universe — stockPantry calls +
depositPantryPieces calls — EXCEPT:

- stockPantry deposits whose name (defaulting to 'Foraged food'
  when falsy, mirroring stockPantry itself) is in the exclusion
  list below (exact names, plus two prefixes);
- depositPantryPieces deposits into a NON-home village (transfers
  to another village's fire — exile amends, tribute grain — counted
  separately as foreign, never as hauls);
- depositPantryPieces deposits into the home village whose src name
  starts with 'Tribute ' (tribute grain — counted separately as
  home-excluded, never as hauls).

Every other deposit counts — including haul names the census
predicate missed or has not met yet (custom haulLabels, future
callers). Disjoint buckets, so the arithmetic closes on every
file: pantryDepositActions = invHaulActions +
invStockExcludedActions + invPiecesHomeExcludedActions +
invPiecesForeignActions (same for kcal).

### Exclusion list — derived from EVERY call site (read 2026-10-25)

Stock names EXCLUDED (exact match):

- 'Weregild' — betrayal.js justice payment: the accused's own
  stores move to the pantry (a payment/transfer, not food brought
  from the world). Two call sites, same name.
- "Hoarder's interest" — buildarounds.js overnight interest: minted
  kcal on stored bins, not food anyone carried in.
- 'System-replicated stew', 'System-replicated (enthusiastic)
  meal' — game.js System gifts (minted meals, not hauls).
- 'System aid cache', 'SYNTHETIC SUSTENANCE BRICKS' — safetynets.js
  quest-reward supply drops (a variable name taking exactly these
  two values; System gifts from the sky, not hauls).
- 'Trial feast' — game.js System trial feast (gift, not haul).
- 'Refunded trade goods' — game.js trade refund (food returning to
  the bins, a re-deposit, not a haul).
- 'Meal leftovers' — game.js CAPDRAW2 excess (drawn food going back
  in the bins, a re-deposit, not a haul).
- 'Restitution' — justice.js payment (internal transfer, not a haul).
- 'Ration returned' — safetynets.js rationing (the player's own meal
  going back in the bins, a re-deposit, not a haul).

Stock prefixes EXCLUDED (prefix match):

- 'Aid from ' — safetynets.js resolveAidInbound food deliveries:
  another village's stores arriving (a transfer, not a haul).
- 'Remedy stores from ' — safetynets.js aid medicine leftovers:
  another village's stores arriving (a transfer, not a haul).

Stock names COUNTED as hauls (every other name — the inversion):

- The whole census predicate (Foraged food, Game meat, Garden
  harvest, Fish catch, Expedition haul, Aid crew haul, Snared meat,
  Pit meat (X), Hauled meat, Emergency hunt meat): aid-crew haul
  stays a haul — aid-hands crews WORK three days in the village
  ("three days' work in your bins"), producing food by work, not
  transferring another village's stores.
- Names the census missed, now caught by construction:
  'Expedition meat' (villager-agency.js expeditionReturn: the
  killer's butchered known-safe meat coming home — a real haul the
  census never listed); 'Buried cache' (betrayal.js inviteReward:
  a villager digs up their own pre-Scattering bundle and puts it in
  the pantry — a find brought in, consistent with home-pantry
  donations counting as hauls); 'Genesis fruit' (game.js haven
  genesis crop yield to the pantry — a harvest, like Garden
  harvest); any custom haulLabel (villager-objectives.js haul
  return via ho.haulName, default 'Hauled meat', custom label from
  villager-mapmem.js haulLabel — the census's stated residual gap,
  closed by the inversion).

Pieces names: pieces src names are ITEM names (plant/food names),
not deposit-kind names, so no item-name exclusion applies. The
only pieces exclusions are structural: non-home village (foreign)
and 'Tribute ' prefix (home-excluded). Home-pantry donations
(game.js donateToPantry) and homecomings (game.js returnToVillage)
both count as hauls, exactly as the census predicate counted them.

Scope note, stated not hidden: the inversion applies within the
instrument's deposit universe (stockPantry + depositPantryPieces).
Direct pantry pushes that bypass both wrappers (e.g. 0-kcal
unknown-flesh items pushed straight into vv.pantry) are outside
both predicates equally and carry no kcal, so they cannot move
either haul total.

### GO thresholds (judge this run ONLY against these; no re-scoring)

- H1 (superset): on EVERY one of the 16 new per-seed files,
  invHaulActions >= haulActions AND invHaulKcal >= haulKcal. The
  inversion counts every census haul by construction (no census
  name is excluded), so any violation is an implementation bug.
- H2 (every disagreement named): every newly-counted haul name —
  inv minus current, by name from the traces — is explained by a
  trace, and every excluded name is justified by a call site in
  the derivation table above. No unexplained newly-counted name,
  no unexplained excluded name.
- H3 (traces recompute exactly): on ALL traced files, recomputing
  both predicates plus the excluded and foreign buckets from the
  stored events reproduces the per-seed totals exactly (requires
  stored events complete, i.e. eventsStored < cap).
- H4 (zero behavior change, reproduction): every non-anchor field
  of every new per-seed file equals the same seed/side file in the
  prior corpus (src/ is unchanged since the prior pilot tip, so the
  deterministic harness must reproduce the prior files exactly
  apart from anchorCommit and the new inv fields). Preserve columns
  are read as controls alongside the villager columns.
- H5 (zero game-code change): the diff touches NO src/js file at
  all — sweep, comparison script, test, corpus, and evidence only.
  If a game-code touch proves necessary, the arm is NO-GO until the
  coordinator rules — nothing smuggled in.
- H6 (determinism leg): one seed re-run byte-compares — a trace
  re-run's per-seed file is byte-identical to the pilot's.

## RESULTS (pilot comparison — instrument demonstration, NOT a verdict)

Pilot corpus: evidence/2026-10-25/haulinvert-b-corpus/ — 16
per-seed files (8 seeds x pd0/pd1), 2 eight-row sweep summaries,
4 trace files. Anchor: 202dc9350cb340292676bd944999fdfd3c4d8ae6
(the instrument commit: sweep + comparison script + proof test +
this evidence file's pre-registration, committed BEFORE the pilot
ran). All 16 files carry all 8 inv fields as non-negative
integers, and every shared field reproduces the prior corpus
exactly (see H4).

### Headline: the inversion changes NOTHING on this pilot — and that is the result

On all 16 files, invHaulActions == haulActions and invHaulKcal ==
haulKcal EXACTLY (delta +0/+0 everywhere, both sides). The
inversion does NOT capture any additional trap haul on this pilot
— because the trap lines the census missed in haulcount-b's FIRST
predicate are already in its FIXED predicate, and the remaining
census gaps (Expedition meat, Buried cache, Genesis fruit, custom
haulLabels) simply never fired in these 16 runs: zero trace events
carry those names, and zero trace events disagree between the two
predicates (curHaul != invHaul on no event in any of the 4 traces).
The inversion also does NOT inflate anything: the only deposits it
excludes beyond the census haul set are the named aid/System
deposits below, each justified from its call site.

What the inversion buys, then, is not a bigger number here but a
rule that cannot silently miss the NEXT haul name: any future
stockPantry caller with a new haul name counts by default, and
only the small, stable exclusion list can keep a deposit out. The
pilot proves the rule is safe to adopt (identical numbers on a
corpus where both rules apply) and proves the census predicate was
already complete FOR THIS PILOT — the two rules agree everywhere
they were both tested.

### Per-seed comparison table (exact; delta is +0/+0 on every row)

seed | side | days | haulActions/haulKcal (= inv) | stockExcl actions/kcal | homeExcl actions/kcal | foreign | deposits | presAtt | villB/villK/villR | rot | depriKcal
9400 | pd0 | 100 | 289 / 153,798 | 6 / 11,437 | 9 / 38,000 | 0 | 304 / 203,235 | 0 | 80 / 58,692 / 38 | 23,408 | 0
9401 | pd0 | 95 | 217 / 116,471 | 9 / 16,821 | 2 / 9,000 | 0 | 228 / 142,292 | 0 | 72 / 52,653 / 21 | 39,885 | 0
9402 | pd0 | 100 | 123 / 40,209 | 4 / 8,453 | 9 / 31,752 | 0 | 136 / 80,414 | 0 | 68 / 54,535 / 25 | 29,191 | 0
9403 | pd0 | 100 | 184 / 87,485 | 1 / 600 | 0 / 0 | 0 | 185 / 88,085 | 0 | 38 / 32,534 / 14 | 4,897 | 0
9404 | pd0 | 100 | 310 / 239,699 | 2 / 4,567 | 0 / 0 | 0 | 312 / 244,266 | 0 | 175 / 141,457 / 52 | 192,593 | 0
9405 | pd0 | 40 | 81 / 42,930 | 0 / 0 | 0 / 0 | 0 | 81 / 42,930 | 0 | 3 / 3,069 / 3 | 1,000 | 0
9406 | pd0 | 90 | 157 / 77,378 | 7 / 14,194 | 3 / 13,000 | 0 | 167 / 104,572 | 0 | 91 / 75,565 / 31 | 39,752 | 0
9407 | pd0 | 100 | 290 / 142,112 | 5 / 10,939 | 8 / 32,000 | 0 | 303 / 185,051 | 0 | 95 / 57,558 / 38 | 1,701 | 0
9400 | pd1 | 100 | 208 / 94,860 | 9 / 18,478 | 8 / 32,000 | 0 | 225 / 145,338 | 0 | 81 / 64,954 / 32 | 73,701 | 197,833
9401 | pd1 | 100 | 178 / 64,508 | 4 / 8,870 | 1 / 4,000 | 0 | 183 / 77,378 | 0 | 125 / 52,862 / 46 | 26,662 | 175,896
9402 | pd1 | 100 | 161 / 80,253 | 5 / 9,857 | 12 / 50,000 | 0 | 178 / 140,110 | 0 | 45 / 41,546 / 20 | 14,079 | 156,335
9403 | pd1 | 100 | 154 / 65,778 | 6 / 10,335 | 8 / 26,200 | 0 | 168 / 102,313 | 0 | 38 / 24,858 / 13 | 33,676 | 114,331
9404 | pd1 | 100 | 313 / 172,872 | 5 / 10,888 | 3 / 12,000 | 0 | 321 / 195,760 | 0 | 181 / 79,590 / 47 | 48,378 | 215,107
9405 | pd1 | 100 | 268 / 299,118 | 1 / 400 | 0 / 0 | 0 | 269 / 299,518 | 0 | 27 / 39,448 / 15 | 49,044 | 59,087
9406 | pd1 | 100 | 210 / 105,444 | 5 / 8,567 | 2 / 10,000 | 0 | 217 / 124,011 | 0 | 117 / 83,917 / 47 | 7,103 | 322,464
9407 | pd1 | 100 | 326 / 118,706 | 4 / 7,276 | 1 / 4,000 | 0 | 331 / 129,982 | 0 | 212 / 73,083 / 71 | 17,496 | 190,847

Per-side ranges: pd0 haulActions 81–310, invHaulActions 81–310;
pd1 haulActions 154–326, invHaulActions 154–326. Stock-excluded
0–9 actions per file; home-excluded (tribute grain pieces) 0–12;
foreign 0 on every file (no exile-amends deposit fired in the
pilot — the bucket exists and is proven by construction, not by
pilot events).

### H2 trace detail — every excluded name, every disagreement

4 traces (seeds 9400/9404 x pd0/pd1; stored events 342, 364, 257,
368 — all under the 1000 cap, so recomputation is complete):

- Seed 9400 pd0: excluded stock = System-replicated
  (enthusiastic) meal 1, Aid from Emberhold 5. Home-excluded
  pieces = Tribute grain from Emberhold 6, from Stonebridge 2,
  from Thornfield 1. Disagreements (curHaul != invHaul): NONE.
- Seed 9404 pd0: excluded stock = Aid from Emberhold 2.
  Disagreements: NONE.
- Seed 9400 pd1: excluded stock = System-replicated stew 1, Aid
  from The Bloodied 1, Aid from Emberhold 7. Home-excluded pieces
  = Tribute grain from Stonebridge 6, from The Bloodied 1, from
  Thornfield 1. Disagreements: NONE.
- Seed 9404 pd1: excluded stock = Aid from Emberhold 5.
  Home-excluded pieces = Tribute grain from Emberhold 2, from
  Stonebridge 1. Disagreements: NONE.

Every excluded name is in the derivation table (System gifts, aid
transfers, tribute grain). No newly-counted name exists to explain
on this pilot — the H2 condition for newly-counted names is met
vacuously, and the exclusion side is fully explained. The
census-gap names (Expedition meat, Buried cache, Genesis fruit,
custom haulLabels) appear in NO traced event: they are proven by
the code census, not by pilot events, and a future trace showing
one is now a confirmation of the inversion, not a predicate fix.

### Reachability (untouched, as required)

Same game code, same seeds, same outcomes as the prior pilot:
waves reached 2–5 (wave 5 on seed 9401 pd0), ranks village →
regional → national → global, national reached on both sides,
wins 0 on both sides (the pilot is an instrument comparison, not
a win run). No reachability field moved — H4's exact reproduction
covers daysAlive, waveReach, national, win, deathCauses, rot, and
depriKcal on every file.

### Preserve columns as controls

Scholar preserveAttempts = 0 on all 16 files, exactly as in the
prior pilot (the leadfeast policy never preserves — the verbs are
UI verbs). Villager columns reproduce the prior pilot exactly on
every file (batches 3–212, kcal 3,069–141,457, resolutions 3–71).
Per the haulcount-b note, always read villager columns alongside:
"preserveAttempts 0" means the policy did not preserve, never that
nothing was preserved.

## SENSE-TESTING: do the traces still read like villagers acting?

Yes — the inverted traces tell the same village story as the
census traces, with the exclusions now labeled instead of silently
dropped: day-1 forages land 100-kcal pieces; trappers come back
from snares and pit lines with species-named meat (White-tailed
Deer, Raccoon); homecomings unload named plants (Burdock,
Purslane, Blackberry); named villages send aid (Emberhold, The
Bloodied) and tribute grain (Emberhold, Stonebridge, Thornfield);
the System drops one enthusiastic meal. Nothing newly counted is
a tick, a promise, or a gift wearing a haul's clothes — because
nothing new was counted at all on this pilot, and the excluded
deposits are exactly the aid/gift/tribute names the code says
they are.

## GO / NO-GO per H1–H6

- H1: GO. invHaul >= haul on all 16 files — in fact exactly equal
  (delta +0/+0 on actions and kcal everywhere).
- H2: GO. Zero disagreements on all 4 traces; every excluded name
  justified from a call site in the derivation table; no
  unexplained newly-counted name (none exists on this pilot).
- H3: GO. On all 4 traces, recomputing both predicates plus the
  excluded and foreign buckets from stored events reproduces the
  per-seed totals exactly (formal check in the proof test, T3).
- H4: GO. Every non-anchor, non-inv field of every new per-seed
  file equals the prior corpus file for the same seed/side
  (comparison script: 640 PASS, 0 FAIL, covering all shared fields
  on all 16 files).
- H5: GO. The diff touches NO src/js file — sweep, comparison
  script, test, corpus, and evidence only. The game.js HAULCOUNT
  TAP is unchanged from sim-haulcount-b (verified: tap block
  present, same single counting line).
- H6: GO. All 4 trace re-runs' per-seed files are byte-identical
  to the pilot's (md5-verified); the proof test's own 10-day
  mini-run determinism leg also passes.

## Metric review (filled after the results, §14 — revisions apply to the NEXT run)

- ZERO-DELTA IS A GO, NOT A NON-RESULT. The pre-registration judged
  the inversion on superset + explanation + exact recomputation,
  not on "must find new hauls" — a forced delta would have meant
  inventing hauls. The honest reading: on this pilot the census
  predicate was already complete, and the inversion's value is
  forward-looking (it cannot rot). A future run SHOULD NOT re-judge
  the inversion on the same pilot expecting a different number.
- THE INVERSION'S NEW CLASSES ARE CODE-PROVEN, NOT PILOT-PROVEN.
  Expedition meat, Buried cache, Genesis fruit, and custom
  haulLabels are real call sites that the inversion counts and the
  census missed — but no pilot event exercised them. The next run
  that adopts the inverted predicate as the primary haul measure
  should say so explicitly, and the first trace that shows one of
  these names is the confirmation event, not a surprise.
- TRIBUTE GRAIN IS BIG. Home-excluded tribute pieces run
  4,000–50,000 kcal per file (one deposit action can carry a whole
  tribute stack) — larger than most stock-excluded totals. An
  analyzer that reads "deposits minus hauls" as "non-haul inflow"
  must remember most of that gap on tribute files is tribute
  grain, not aid: the buckets separate them for exactly this
  reason. Do not collapse the buckets into one "excluded" total
  in future summaries.
- FOREIGN BUCKET UNEXERCISED. No non-home pieces deposit fired in
  the pilot (foreign 0 everywhere). The bucket's logic is proven
  by code reading (exile-amends path targets another village's
  fire) and by the test's recomputation machinery, not by pilot
  events. Same standing as the new haul classes above.
- TRACE CAP 1000 HELD. Max stored 368 (was 365 under the old cap
  with fewer event kinds traced). The 1000 cap has ample headroom
  for 100-day pilots; longer horizons should still watch it.

## Diff review (H5 evidence — every touched file's nature)

- scripts/sweep-haulinvert-b.js: NEW FILE (derived from
  sweep-haulcount-b.js; current-predicate counting behaviorally
  identical, plus inverted-predicate counting, inv fields, richer
  trace events, cap 500 → 1000). All wrappers delegate to their
  originals; counting blocks try/catch-isolated.
- scripts/compare-haulinvert-b.js: NEW FILE (comparison only;
  reads two corpus dirs, writes nothing).
- scripts/test-haulinvert-b.js: NEW FILE (proof only).
- src/js/game.js: UNTOUCHED. The HAULCOUNT TAP from
  sim-haulcount-b is carried, not modified.
- evidence/2026-10-25/haulinvert-b-corpus/: NEW — 16 per-seed
  files, 2 sweep summaries, 4 trace files.
- evidence/2026-10-25/sim-haulinvert-b.md: NEW (this file).
- Nothing else touched: no analyzer, no causebase file, no
  tableseat file, no other game-logic file. The haulcount-b
  instrument and corpus are untouched.

## Proof

- node --check on sweep, comparison script, and test: clean.
- node scripts/test-haulinvert-b.js => 95 PASS, 0 FAIL
  (T1 static + T2 live 10-day mini-run with trace determinism +
  both-predicate trace recomputation).
- node scripts/test-haulinvert-b.js --corpus
  evidence/2026-10-25/haulinvert-b-corpus --seeds 9400-9407
  => 616 PASS, 0 FAIL (T1+T2+T3: all 16 pilot files' fields,
  haul > 0, superset, bucket closure, villager invariants, and
  trace totals + full recomputation on all 4 trace files).
- node scripts/compare-haulinvert-b.js --prior
  evidence/2026-10-25/haulcount-b-corpus --new
  evidence/2026-10-25/haulinvert-b-corpus --seeds 9400-9407
  => 640 PASS, 0 FAIL (H1 superset + H4 exact reproduction of
  every shared field + closure on all 16 files).
- Pilot determinism: all 4 trace re-runs' per-seed files
  byte-identical to the pilot's (md5-verified); the proof test's
  mini-run determinism leg passes.
- Node harness: the sweep uses scripts/sim-harness.js
  (loadGame/setupGame/runDays) exactly as haulcount-b does;
  Math.random is seeded before eval by the harness. No
  Game.save stub. No jest run (no jest suites touch this
  instrument; the proof test is the designated suite).
- Standing verdicts re-judged: NONE. leg2decide STEP CONFIRMED,
  rotdecide-govern STEP (CONTESTED), rotcompanion
  DENOMINATOR-DRIVEN qualifiers, haulcount-b instrument GO — all
  stand. The pilot seeds (9400–9407) carry no verdict.

## Scope compliance

Instrument revision + comparison + proof test + pilot corpus +
evidence only. No push, no version bump, no live verification.
Merged locally, pending ship, by the coordinator. Two commits on
this branch: the instrument commit (sweep + comparison + test +
pre-registration, anchor 202dc935) and the corpus commit (corpus
+ this evidence file's results) — the instrument commit repaired
for the known safe-commit index clobber (index entries restored
from HEAD blobs; commit verified via git show).
