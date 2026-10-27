# sim-callertag-b — per-record mover identity + assisted/ordinary split (DIAG ONLY)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T1845Z, axis
food-economy. Arm sim-callertag-b, carried caveat from 2026-10-27
(sim-gardendeposit-b, evidence/2026-10-27/sim-gardendeposit-b.md, GO with
disclosed caveat; findings line 1243): per-record mover identity for
garden-attributed deposits was unattributed, and the assisted-vs-ordinary
harvest split was unclassified.

Pre-registration (committed BEFORE any classification judgment):
evidence/2026-10-27/sim-callertag-b-prereg.md, commit 68da8847a.
Judged ONLY against it. Measurement only: zero src/js changes, no
default flips, no garden or throttle redesign.

Canon read first: docs/CANON.md, then docs/GARDENS.md. Nothing invented.

## Verdict against the prereg: DIAG-GO (proven negative, Path B)

| leg | bar | result |
|-----|-----|--------|
| Mover, Path A (≥95% to a single caller) | 262+/276 to one caller | 0/276 positively classified — FAILS, honestly |
| Mover, Path B (proven negative) | exhaustive inventory + no discriminating field + both callers fireable | all three proven ✓ |
| Assisted/ordinary leg | bridge-classified, or underivable + exact spec | bridge-classified: all 276 assisted ✓ |
| Caller-tag prototype | green on the real Game object | 30 PASS / 0 FAIL ✓ |
| Hygiene | zero src/js modified; no sibling file modified; only committed work at end | verified before commit ✓ |

DIAG-GO is a completed result, not a failed GO re-scored: the prereg
stated Path B up front, and every Path B leg is met. What this arm
proves is that the mover question CANNOT be answered from the existing
corpus — and it delivers the exact capture that answers it next time.
The assisted half of the caveat, by contrast, is CLOSED: all 276
records are assisted harvests, by a stated rule.

## The answer in plain words

Think of each pantry deposit as a delivery with a return address torn
off. The old records say what arrived (Lamb's Quarters, 2,700 kcal,
from a garden), on what day, through which door — but never who
carried it in, and never which village's pantry it entered. There
are three possible carriers, and two of them — the player's own
donation and the homecoming pooling when you walk back into Haven —
do exactly the same thing to exactly the same pantry, leaving exactly
the same record. No clever re-reading of the old records can separate
them, because the records never contained the difference. The third
carrier, exile amends to an old village, goes to a different pantry,
but the records don't say which pantry either — so it can't be ruled
in or out per record. The only carrier that CAN be ruled out is
tribute grain: it is built from scratch with no garden connection at
all, so it could never have produced one of these records.

The harvest side came out clean. Every garden harvest on the five
seeds that produced deposits was magic-assisted: the player coaxes
the beds nearly every day, and the magic sticks to a bed until it is
harvested, so by harvest day every bed carries it. The seven apparent
"ordinary" harvests on seed 9762 under a first-draft rule turned out
to be an off-by-one in that rule (see below), not real ordinary
harvests. So all 276 deposits are assisted-harvest food — that half
of the caveat is closed, not just bounded.

## Call-site inventory (exhaustive, grep-anchored)

depositPantryPieces (src/js/game.js:8376) has exactly four direct
call sites in src/js. No others exist (the proof script re-counts
and fails if the count differs).

1. **Game.returnToVillage — game.js:8617 — HOMECOMING POOL.**
   Condition: the scholar walks back into Haven carrying finished
   food (`brought > 0`), the pantry has room, and something remains
   after keeping a day's food (KEEP_KCAL 2000, or 6000 when the
   deposit gate is engaged) and after spoiled items are dropped.
   Forwards `item.gardenShares` verbatim. Destination:
   `this.state.village` — the CURRENT village.
   CORRECTION to gardendeposit's wording: gardendeposit said both
   alternative callers "deposit into another village's pantry."
   That is true only of exile amends below. The homecoming pool
   deposits into the village you just walked into — the same pantry
   donateToPantry uses. The two are indistinguishable in destination
   as well as in record fields.
   Fireable on this band: the competent policy walks home via
   travelTo(hx,hy), and stepping onto a haven tile calls
   returnToVillage (game.js:12176). The haul block has no
   days-away condition — any return carrying finished food can pool.
2. **Game.returnToOldVillage — game.js:8774 — EXILE AMENDS.**
   Condition: a past village matching the walked tile's pastVillage
   exists, and something remains after the same keep-split (2000)
   and spoilage filter. Forwards `item.gardenShares` verbatim.
   Destination: that past village ov — genuinely another village.
   Requires a fork/abandon history plus an oldhaven-tile walk; the
   competent policy performs no fork/abandon (grep-anchored absence
   in scripts/policies/competent.js — the only "abandon" hits are
   comments about gates staying off), and the corpus carries no
   travel/exile log to check against. Bounded, never excluded.
3. **Game.donateToPantry — game.js:15371 — DELIBERATE DONATION.**
   Condition: pantryDonationOptions ok (run not over/won, haven
   access not 'none', valid pack index, edible !== false, not
   bonded, not spoiled, pantry room > 0). Deposits the whole
   donated item (`{...item, units: amount}`), so gardenShares rides
   verbatim. Destination: `this.state.village` (current).
   Fireable on this band: the policy's workGarden ends with
   donateHaul → donateSurplus → donateToPantry whenever crop work
   happened at Haven (competent.js workGarden final line).
4. **Tribute — src/js/hierarchy.js:1173 — SYNTHETIC, NO gardenShares.**
   The src literal is built from scratch (name 'Tribute grain from
   X', kcalEach, units 1, spoilDay, safe) with no gardenShares field
   at all. It can NEVER produce a garden-attributed record, on any
   band, by construction. Excluded by construction, not by band
   evidence.

## Per-caller counts (band 9760–9767, re-derived, not trusted)

Traced set re-derived from the corpus files: 276 records,
1,310,710 kcal, all deposit-door, 0 unclassified — exact match to
the prior report. Per seed: 9760 Burdock 19 + Blackberry 22 = 41;
9761 Cattail 60; 9762 Lamb's Quarters 129; 9763 Mayapple 3 +
Muscadine Grapes 10 = 13; 9764 Burdock 33; 9765/9766/9767 zero.

| caller | positively classified | kcal | basis |
|--------|----------------------|------|-------|
| donateToPantry | 0 | — | joint class below; no field separates it from homecoming |
| returnToVillage (homecoming) | 0 | — | joint class below; no field separates it from donate |
| returnToOldVillage (exile amends) | 0 | — | no destination field; bounded, not excluded |
| tribute | 0 | — | excluded by construction (no gardenShares in its src) |
| **joint class (donate ∪ homecoming ∪ exile)** | **276** | **1,310,710** | every record is one of these three; which one is unrecorded |
| **residual (single-caller unknown)** | **276** | **1,310,710** | 100% of the traced set; the mover question is fully residual |

Single-caller share: 0/276 = 0%, against the 95% Path A bar. The
residual is not a handful of ambiguous stragglers — it is the whole
set, and it is residual for a structural reason (below), not for
lack of effort.

## Why the mover cannot be classified from existing fields (Path B proof)

(a) Inventory: the four sites above, exhaustive by grep.
(b) Field inventory: a gardenInflows record carries exactly five
    keys — {day, door, gardenShares:true, kcal, name}. An inflows
    record carries {seq, day, door, kcal, name} (plus `added` on
    pantryAdd). Neither array carries a mover, a caller tag, a
    destination village, a pack-stack id, or a harvest day. The
    proof script asserts these key sets exactly.
(c) Both candidate callers fireable on this band: donate via
    workGarden → donateHaul (policy code, Haven, after crop work);
    homecoming via travelTo home → haven-tile entry →
    returnToVillage haul block (game.js:12176 + the 8539 keep-split
    block, which has no days-away condition). A rule that assigned
    every record to donate because "workGarden donates often" would
    be a guess dressed as a classification — the prereg forbids it,
    and this arm does not make it.
(d) Considered and rejected as destination evidence: stockDays
    pantry totals. Pantry totals confound inflow with consumption
    (food is eaten out of the same stacks), so they cannot separate
    home-pantry deposits from exile-pantry deposits. The prereg
    excludes this route explicitly; it was not used.
(e) Exile bound: exile amends requires a past village and an
    oldhaven-tile walk. The competent policy never forks or abandons,
    and no corpus log records travel or exile — so exile can be
    neither confirmed nor excluded per record. Its true count on
    this band lies somewhere in 0..276, unknowable from this corpus.
    Any report claiming "exile is zero" from these fields would be
    inventing evidence.

## Assisted vs ordinary: CLOSED — all 276 assisted (R4 bridge)

Rule (stated in the prereg, corrected on one endpoint — see below):
each deposit record is one donated pack stack from one player
harvest (harvestGarden pushes one item per ripe plot with
`item.gardenShares = gardenHarvestOrigin(p)`; donateToPantry donates
that stack; garden-capture records src.gardenShares at call time,
before pantry merging — so a record's class IS its source harvest's
class). The source harvest day is not in the record, so records are
linked to harvests only through a universal bridge: reconstruct every
harvest event in the window from gardenDays snapshots (a plot's
lastHarvest first appearing as day H is a harvest event on H) and
classify each event by its coax window. If EVERY event is assisted,
every record is assisted.

Bridge results (corrected rule; analyzer + proof test agree):

| seed | harvest events | assisted | ordinary | undetermined | deposit records |
|------|---------------|----------|----------|--------------|-----------------|
| 9760 | 30 | 30 | 0 | 0 | 41 |
| 9761 | 56 | 56 | 0 | 0 | 60 |
| 9762 | 123 | 123 | 0 | 0 | 129 |
| 9763 | 10 | 10 | 0 | 0 | 13 |
| 9764 | 29 | 29 | 0 | 0 | 33 |
| 9765 | 3 | 0 | 3 | 0 | 0 |
| 9766 | 0 | 0 | 0 | 0 | 0 |
| 9767 | 0 | 0 | 0 | 0 | 0 |
| **deposit seeds** | **248** | **248** | **0** | **0** | **276** |

Why events (248) ≠ records (276): one harvest event is one plot
harvested one day — one pack item — and that item can donate across
several days in partial donations, producing several records. The
bridge classifies harvests; the universal result (every event
assisted) transfers to every record.

Why the bridge is not vacuous: seed 9765 has 3 ordinary pokeweed
harvest events (no coax at all on that seed's window) and 0 deposits
— the rule CAN produce "ordinary"; it just doesn't on the
deposit seeds. Coaxing is near-daily wherever deposits exist
(9760: 90 coax days, 9761: 59, 9762: 87, 9763: 83, 9764: 81), and
magic persists on a bed until harvest resets it, so every harvest
follows a coax.

CORRECTION (disclosed, both numbers shown): the prereg's bridge rule
said "coax strictly inside (anchor, H)". That misses the anchor day
itself — but cultivateGarden applies magic to just-harvested plots
too: after harvestGarden resets a plot (growthLeft back to the
28-day regrowth), the plot is NOT ripe, so the same day's coax loop
(which skips only ripe plots) still sets magicGrowth/magicYield on
it, and no same-plot second harvest can follow that day (28 minus
at most ~20 coax days stays above 0). Anchor-day coax therefore DOES
assist the next harvest. Corrected rule: ASSISTED iff a coax day
falls in [anchor, H); ORDINARY iff none falls in [anchor, H];
UNDETERMINED iff the only coax day in [anchor, H] is H itself (a
morning pre-coax harvest that day would be ordinary, a post-coax
second harvest assisted — snapshots cannot tell which fired).
Under the prereg-literal rule, 9762 shows 116 assisted / 7 ordinary
/ 0 undetermined — all 7 "ordinary" events are anchor-day-coax cases
(anchors 83→84, 84→85, 85→86, 88→89, 89→90, 97→98, 98→99). Under the
corrected rule they are assisted, and the band is 248/248 assisted.
The verdict (all records assisted) rests on the corrected rule; the
literal-rule numbers are shown here so the correction cannot hide a
verdict change. A future prereg in this family should write the
interval as [anchor, H) from the start.

Two bridge caveats, both bounded:
- Single-harvest crops clear pid at harvest (gardenHarvestTaken),
  so 9760's 16 and 9764's 29 null-pid events cannot be named by
  species from snapshots (consistent with single-harvest burdock
  roots). Species naming does not affect class, which depends only
  on the coax window.
- Snapshots miss day 3 on all seeds (days 2/4 duplicated instead).
  First sows are day 5+, so no harvest could occur on day 3; every
  possible harvest day is covered.
- NPC sows do not break the bridge: villagerSowPlot calls
  gardenPlant (game.js:21532), the same version-1 path as player
  sowing, so NPC-sown plots take assisted/ordinary classes like any
  other. 9763's 11 NPC sows coexist with 10/10 assisted events.

## Caller-tag capture prototype (tooling leg, zero src/js)

scripts/caller-tag-capture.js: a harness wrapper installed after
loadGame, before setupGame, wrapping Game.depositPantryPieces. It
delegates with identical arguments/this/return value, writes only to
the caller's array, consumes no RNG, writes no Game.state, and
records per call: day, door, name, kcal, destination village name
(v.name), the FULL src.gardenShares object (deep-copied, not the
boolean), a caller tag parsed from `new Error().stack` (first frame
outside the wrapper), and the raw caller frame.

Tag rule: donateToPantry / returnToVillage / returnToOldVillage map
exactly by function name; anything else maps to
`other:<fnName or file:line>`. The tribute caller (hierarchy.js
linkTick's anonymous IIFE, ~line 1173) has no function name, so it
lands as `other:<hierarchy.js location>` — identifiable by frame
location, not by name. That is honest, not a gap: tribute's src
carries no gardenShares, so a garden-attributed record can never be
tribute regardless of tag.

Proof (scripts/test-callertag-b.js, 30 PASS / 0 FAIL): on the real
Game object loaded via scripts/sim-harness.js (full src/js list in
index.html order, minus DOM-only files; Math.random seeded before
eval by the harness; Game.save never stubbed) — delegation return
values and pantry deltas identical to an unwrapped control call;
tags exactly donate/returnToVillage/returnToOldVillage for
same-named callers and an other: tag for the anonymous tribute
shape; gardenShares objects recorded verbatim ({assisted:1} and
{ordinary:1}, null for the tribute shape); destination villages
recorded; zero Math.random draws consumed; uninstall restores the
original; double-install refused loudly.

EXACT CAPTURE SPEC (for the finding — what a future capture must
record, whether as this wrapper or ported inward): field `callerTag`
(string: donateToPantry | returnToVillage | returnToOldVillage |
other:<frame>) + field `gardenShares` (the full object
{assisted:1}|{ordinary:1}|{legacyAssisted:1}|{legacy:1}, NOT a
boolean) + field `destVillage` (string), set in the
depositPantryPieces wrapper at call time, in the inflow/garden
capture layer (scripts/inflow-capture.js +
scripts/garden-capture.js), where v, src, and the call stack are all
available without touching src/js. A single re-sweep band with this
wrapper installed closes the mover question outright: every record
would carry its caller, and the 276-record joint class would split
into counted callers.

## Reachability verdict (reused corpus — no new wall band this arm)

No fresh seeds were spent, so no new wall numbers exist this arm.
Reused band (competent-nofeast, seeds 9760–9767, 100d, from
gardendeposit): national / table / wins 0/8; wave-4/5 unlocks 0/8;
wave reach per seed 9760: 3, 9761: 2, 9762: 2, 9763: 2, 9764: 2,
9765: 3, 9766: 3, 9767: 3; median survival 100d (censored at the 100d
horizon; all 8 seeds survived to day 100); deaths 18 total, none
starvation. The scale wall stands on this band; this arm closes a
provenance blank, it does not move the wall numbers. Arc II/III/IV,
four-realm formation, trap acquisition, counter discovery/kill, and
young-link succession survival are not recorded in this corpus and
are not estimated here.

## Village assessment

This arm ran no fresh sims, so it adds no new village observation
beyond the reused corpus — stated plainly rather than padded. The
village the corpus shows is gardendeposit's: a village surviving
100 days whose pantry garden food comes from its scholar's own
sowing, coaxing, harvesting, and donating loop (now proven
magic-assisted on every harvest), while the appointed garden keeper
spends duty days watering, weeding, and being redirected to wood,
water, and stone. Nothing in this arm's classification changes that
picture: the food is the scholar's assisted harvests either way;
only the name of the hand that carried each stack into the pantry
(donation vs homecoming pooling) stays unknown — and both hands are
the scholar's.

## Blanks filled or documented

FILLED (closed, not bounded):
- (1) Assisted/ordinary split for all 276 garden-attributed records:
  ASSISTED, via the harvest-event bridge (248/248 events assisted
  on deposit seeds, corrected rule; literal-rule numbers shown).
- (2) Homecoming destination corrected: the homecoming pool deposits
  into the CURRENT village, not another village — only exile amends
  goes elsewhere. Gardendeposit's "another village" wording for the
  homecoming caller is corrected here.
- (3) The prereg's coax-interval endpoint corrected ([anchor, H)),
  with the code reason and both counts shown.

DOCUMENTED (proven unclosable from existing data, with the exact
next step):
- (4) Per-record mover identity: 276/276 residual for single-caller
  classification. Next step is not another recount — it is one
  re-sweep band with scripts/caller-tag-capture.js installed, which
  this arm built and proved (30/30). No game-code change is needed
  to capture it: the wrapper layer already has v, src, and the stack.
- (5) Exile-amends share: bounded (0..276) but unknowable from this
  corpus; the same re-sweep resolves it, since exile records would
  carry destVillage = the past village's name.

No game-code change was made (DIAG only). No prior evidence needs
numeric revision: the 276 / 1,310,710 / door split reproduce exactly,
and only interpretations are corrected (homecoming destination,
coax interval).

## Metric review (MEASUREMENT.md section 14)

- The pre-registered bar worked as written — and it worked by
  failing Path A. The 95% single-caller bar correctly refused a
  "most likely donate" story: without it, this arm could have
  reported donate-haul as the mover for all 276 records on the
  strength of the workGarden sequence alone, and the homecoming
  alternative would have stayed hidden. A bar that can only pass is
  not a bar; this one bit, as designed.
- Path B (proven negative, stated up front) is what makes the
  negative a result instead of a shrug: inventory + field inventory
  + both-fireable is a checkable proof shape, and the next arm in
  this family should reuse it whenever a retro-classification is
  attempted on a boolean corpus.
- The one soft spot in the prereg as written: the R4 coax interval
  (anchor, H) was off by one endpoint (anchor-day coax counts, for
  the cultivateGarden reason given above). The evidence corrects it
  with both counts shown and the verdict judged on the corrected
  rule — disclosed here, not silently applied. Proposed for the NEXT
  run, not applied retroactively to the prereg: write bridge
  intervals as [anchor, H) from the start, and derive them from the
  cultivateGarden loop (which plots it skips) rather than from the
  harvest function alone.
- A second lesson for the next run: no retro-classification prereg
  in this family should promise a per-record mover split from a
  corpus that lacks a caller tag. The prereg for any future
  provenance arm should EITHER require a caller-tag capture
  installed before the sweep, OR pre-register the joint-class /
  proven-negative verdict shape this arm used. Counting on a
  post-hoc field to appear is how the gardendeposit caveat was born.
- No revision is proposed for the tribute exclusion, the field
  inventory method, or the prototype legs: construction-based
  exclusion, exact key-set assertion, and stack-tag proof on the
  real Game object are the right strictness for a provenance arm.
- Residual: 276 records mover-unknown at single-caller level (joint
  class named, exile bounded 0..276, tribute excluded). The only
  residual that matters for the next arm is the capture, and it is
  built, proved, and specified above.

## Reproduction check (this run)

- NO fresh seeds were spent. All numbers re-derive from
  evidence/2026-10-26/sim-stock9762-b-corpus/ (read, never
  modified) via scripts/analyze-callertag-b.js.
- Proof scripts/test-callertag-b.js green in this worktree,
  exit 0: 30 PASS / 0 FAIL — corpus re-derivation (276 / 1,310,710 /
  all deposit-door / 0 unclassified / 9762 129 / 396,750 / exact
  field key sets / bridge tallies incl. 9762 123/123 assisted and
  9765 3 ordinary with 0 deposits) plus 9 code anchors (4 call
  sites, gardenShares forwarding, tribute synthetic src, homecoming
  destination, exile destination) plus 11 prototype checks on the
  real Game object (load, delegation identity, tags, shares
  objects, destinations, zero RNG, uninstall, double-install
  refusal). One prototype failure was caught and fixed mid-run
  (V8's `wrappedDeposit [as depositPantryPieces]` frame naming —
  the parser now strips the `[as ...]` suffix); the final run is
  green from a clean invocation.
- No game-code change: zero src/js files touched; no sibling
  capture or corpus file modified. No jest was run (nothing to
  test in jest — the proof is node, not jest). No [needs-eyes]:
  this lands measurement + tooling, not a player-visible change.
- Index note: the prereg commit via scripts/safe-commit.sh left the
  worktree index showing a staged deletion + untracked copy of the
  same file (the known safe-commit index-clobber class). The commit
  itself was correct (230 insertions, verified via git show); the
  index was repaired with `git update-index --add --cacheinfo`
  against the HEAD blob, and `git status` / `git diff HEAD` verify
  empty afterwards. Reported here so the coordinator is not
  surprised by it in the worktree history.
- Files in this arm: evidence/2026-10-27/sim-callertag-b-prereg.md
  (commit 68da8847a), evidence/2026-10-27/sim-callertag-b.md,
  scripts/analyze-callertag-b.js, scripts/caller-tag-capture.js,
  scripts/test-callertag-b.js.

## Findings for the coordinator backlog (do NOT edit goal hidden_files here)

- [open] 2026-10-27 — food-economy/provenance — DEPOSIT MOVER
  IDENTITY PROVEN UNCLASSIFIABLE FROM EXISTING FIELDS (loop B arm
  sim-callertag-b, DIAG-GO, this evidence): 276/276 garden-attributed
  records residual at single-caller level; donate and homecoming
  deposit into the same village with byte-identical record fields
  (day/door/name/kcal/boolean flag only); exile bounded 0..276,
  tribute excluded by construction. Next step is one re-sweep band
  with scripts/caller-tag-capture.js installed (built + proved
  30/30 here, zero src/js) — no recount of the old corpus can close
  this.
- [fixed 2026-10-27 by loop-B arm sim-callertag-b] 2026-10-27 —
  food-economy/provenance — ASSISTED VS ORDINARY SPLIT (same arm):
  all 276 records are assisted harvests (248/248 harvest events
  assisted on deposit seeds via the coax-window bridge; 9762's 7
  apparent ordinary events are anchor-day-coax artifacts of a
  first-draft interval, corrected with both counts shown).
- [open] 2026-10-27 — food-economy/provenance — CORRECTION TO
  GARDENDEPOSIT WORDING (same arm): the homecoming pool deposits
  into the CURRENT village (game.js:8539 vv = state.village), not
  another village; only exile amends (game.js:8774, ov) goes
  elsewhere. Gardendeposit's origin conclusion is unaffected (all
  three garden-carrying callers still require a garden-harvested
  source); only the destination wording for the homecoming caller
  changes.

## Verdict (judged against the pre-registered bar, not re-scored): DIAG-GO

Mover identity from existing fields is proven impossible (0/276 to
a single caller, with the proof legs met), the assisted/ordinary
split is closed (all 276 assisted), and the caller-tag capture that
closes the mover question next time is built, proved 30/30 on the
real Game object, and specified exactly — all with zero src/js
changes.
