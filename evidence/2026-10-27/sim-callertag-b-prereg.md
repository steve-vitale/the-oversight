# sim-callertag-b — preregistration (written BEFORE any classification judgment)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T1845Z, axis
food-economy. Arm sim-callertag-b, carried caveat from 2026-10-27
(sim-gardendeposit-b, evidence/2026-10-27/sim-gardendeposit-b.md, GO with
disclosed caveat; findings line 1243): per-record mover identity for
garden-attributed deposits is unattributed, and the assisted-vs-ordinary
harvest split is unclassified. This arm closes the caveat or proves it
unclosable from existing data.

## Rules (binding)

- Measurement/DIAG only: ZERO src/js changes in the landed commit. A
  caller-tag capture prototype may be built ONLY as a harness/instrument
  script under scripts/ (wrapping, never editing, game code). If capture
  genuinely requires game-code instrumentation, do NOT land a game change
  — deliver the exact spec as the finding and commit tooling+evidence only.
- NO fresh seeds. The corpus is the existing
  evidence/2026-10-26/sim-stock9762-b-corpus/ (seeds 9760–9767,
  competent-nofeast, 100d), reused read-only. No new wall band exists
  this arm; reachability verdict reuses the gardendeposit band numbers
  and says so. A fresh seed would need a new prereg justifying it in
  advance; none is claimed here.
- Canon read first: docs/CANON.md, then docs/GARDENS.md. Nothing invented.
- Judge ONLY against this prereg. A miss is NO-GO (or DIAG-GO where
  defined below), never re-scored mid-run against a friendlier bar.
  Every evidence file carries a "metric review" section.

## Traced set (fixed before any classification judgment)

- Primary set: `gardenEvents.gardenInflows` on seeds 9760–9767 in the
  stock9762 corpus — the set prior evidence reports as 276
  garden-attributed records, all deposit-door. The analyzer re-derives
  the count, door split, name split, and kcal total from the corpus
  files themselves; the prior report's numbers are NOT taken on trust.
- Linked arrays used by the rules below (all pre-existing corpus
  fields, no new capture): `inflows` (seq/day/door/name/kcal),
  `gardenDays` (per-day per-plot pid/lastHarvest/plantedDay),
  `gardenEvents.sows` + `npcSows`, `gardenEvents.sayLines`
  (garden-filtered, includes coax lines with day + amount).
- Field inventory (stated now, verified by the analyzer): a
  gardenInflows record carries exactly {day, door, name, kcal,
  gardenShares:true} — NO mover, NO destination village, NO pack-stack
  id, NO harvest day, NO shares class. An inflows record carries
  {seq, day, door, name, kcal} — likewise no mover/destination.

## Call-site inventory (to be verified by grep anchors, not assumed)

depositPantryPieces (src/js/game.js:8376) has exactly four direct
call sites in src/js (exhaustive grep; the analyzer's proof script
asserts this count and each site's forwarding of gardenShares):

1. Game.returnToVillage — game.js:8617 — HOMECOMING POOL. Condition:
   `brought > 0` (finished food in pack), pantryRoom > 0, give list
   non-empty after the keep-split (KEEP_KCAL 2000, or 6000 when the
   deposit gate is engaged) and the spoilage filter. Forwards
   `item.gardenShares` verbatim. Destination: `this.state.village`
   (the CURRENT village — correction to gardendeposit's "another
   village" wording for this caller; the exile caller below is the
   genuinely other-village one). Fires on this band in principle:
   the competent policy walks home via travelTo(hx,hy) and stepping
   onto a haven tile calls returnToVillage (game.js:12176).
2. Game.returnToOldVillage — game.js:8774 — EXILE AMENDS. Condition:
   a past village matching the walked tile's pastVillage exists,
   give list non-empty after the same keep-split (KEEP_KCAL 2000)
   and spoilage filter. Forwards `item.gardenShares` verbatim.
   Destination: that past village ov (genuinely another village).
   Requires a fork/abandon history + an oldhaven-tile walk; the
   competent policy performs no fork/abandon (grep-anchored absence
   in scripts/policies/competent.js) and the corpus carries no
   travel/exile log to check against.
3. Game.donateToPantry — game.js:15371 — DELIBERATE DONATION.
   Condition: pantryDonationOptions ok (not over/won, haven access
   not 'none', valid pack index, edible !== false, not bonded, not
   spoiled, pantry room > 0). Forwards the whole donated item
   (`{...item, units: amount}`), so `gardenShares` rides verbatim.
   Destination: `this.state.village` (current). Fires on this band
   via the policy's workGarden → donateHaul → donateSurplus path
   (competent.js workGarden final line + donateSurplus).
4. Tribute — src/js/hierarchy.js:1173 — SYNTHETIC, NO gardenShares.
   The src literal is constructed from scratch (name 'Tribute grain
   from X', kcalEach, units 1, spoilDay, safe) with NO gardenShares
   field. It can NEVER produce a garden-attributed record, on any
   band, by construction. Counted as excluded-by-construction, not
   by band evidence.

No other src/js file calls depositPantryPieces (grep-verified; the
proof script re-checks and fails if the count differs).

## Retro-classification rules (stated now, applied after this commit)

- R1 (tribute): 0 records, by construction (site 4 above). Any
  record carrying gardenShares cannot be tribute.
- R2 (exile amends): NEVER positively classified from corpus fields
  (no destination field exists in either record array). Exile can
  only enter the residual class, bounded by mechanism (requires past
  village + oldhaven walk; no policy fork/abandon; no corpus log).
  A claim that exile is zero on this band would require evidence
  the corpus does not contain, and must NOT be made.
- R3 (homecoming vs donate): JOINT CLASS, not separable per record.
  Both deposit into the current village, both forward gardenShares
  verbatim, both produce byte-identical record fields, and both can
  fire on this band (see sites 1 and 3). No corpus field — record
  fields, inflows seq, gardenDays plot state, sows, garden-filtered
  sayLines, resolutions — records a mover, a destination, a return
  event, or a pack-stack identity. Any rule purporting to split
  homecoming from donate per record on these fields would be
  invention, and is forbidden by this prereg.
- R4 (assisted vs ordinary — harvest-level bridge): each deposit
  record is one donated pack stack from one player harvest
  (harvestGarden pushes one item per ripe plot with
  `item.gardenShares = gardenHarvestOrigin(p)`; donateToPantry
  donates that stack; garden-capture records src.gardenShares at
  call time, before pantry merging — so a record's class IS its
  source harvest's class). The source harvest day is NOT in the
  record, so per-record linkage is unavailable directly. Bridge:
  reconstruct every harvest event in the window from gardenDays
  snapshots (a plot's lastHarvest first appearing as day H is a
  harvest event on H; anchor = plantedDay for first harvests,
  previous H thereafter) and classify each event by the coax-window
  rule — ASSISTED iff a coax sayLine day falls strictly inside
  (anchor, H) [magic persists from earlier coax days until harvest
  resets it: gardenHarvestTaken sets magicGrowth 0 / magicYield 1];
  ORDINARY iff no coax day falls inside (anchor, H];
  UNDETERMINED iff the only coax day in (anchor, H] is H itself
  (a morning pre-coax harvest that day would be ordinary, a
  post-coax second harvest that day assisted — snapshots cannot
  tell which fired). Legacy classes: plots sown via sowPlot adopt
  cultivation version 1 (gardenPlant), so classes are assisted /
  ordinary only; any NPC-sown plot (npcSows) is counted separately
  and breaks the bridge for its harvests if present. IF every
  harvest event on a seed is ASSISTED, then every deposit record
  from that seed is ASSISTED (bridge classification, stated as
  such). IF any event is ORDINARY or UNDETERMINED, the per-record
  split is UNDERIVABLE from existing fields (records lack harvest
  day), and the arm must deliver the exact capture spec instead
  (see below).

## Primary metric and verdict paths (binding)

Primary metric: share of the 276 traced records classified to a
SINGLE depositPantryPieces caller by rules R1–R4, with the residual
class counted and named. Assisted/ordinary is judged as a second,
separate leg (classified via the R4 bridge, or proven underivable
+ exact capture spec).

- PATH A — GO: mover share ≥ 95% to a single caller (residual ≤ 5%,
  named) AND the assisted/ordinary leg resolved (bridge-classified
  for all records, or proven underivable + exact capture spec).
- PATH B — DIAG-GO (proven negative, allowed ONLY because this
  prereg states it up front): mover share < 95% AND the negative is
  proven by ALL of: (a) the exhaustive 4-site inventory above,
  grep-anchored; (b) the field inventory showing no corpus field
  distinguishes homecoming from donate; (c) both candidate callers
  shown fireable on this band (code conditions + policy paths);
  AND the assisted/ordinary leg resolved (bridge-classified or
  proven underivable + exact capture spec); AND the caller-tag
  capture prototype green (below). DIAG-GO is a completed result,
  not a failed GO re-scored: the report must name the residual
  (homecoming/donate joint class size, exile-bounded residual) and
  the exact capture that would close it.
- NO-GO: proof script fails, hygiene fails, the assisted leg is
  unresolved without a capture spec, or the prototype fails. A
  NO-GO names the failing leg and the exact counts.

What does NOT count:
- The prior reports' numbers do not count as re-derivation; only
  the analyzer's output from the corpus files counts.
- A "most likely caller" assignment (e.g. calling every record
  donate because workGarden donates often) does NOT count as
  classification — the joint class is the honest class.
- No fresh-seed result may rescue a failing leg; the verdict stands
  on the corpus named above.
- Stock-days pantry totals do NOT count as destination evidence:
  pantry totals confound inflow with consumption, so they cannot
  separate home-pantry from exile-pantry deposits.

## Caller-tag capture prototype (tooling leg, no src/js)

- scripts/caller-tag-capture.js: a harness wrapper installed AFTER
  loadGame, BEFORE setupGame, wrapping Game.depositPantryPieces.
  It delegates with identical arguments / this / return value,
  writes ONLY to the caller's array, consumes no RNG, writes no
  Game.state, and records per call: day, door 'deposit', name,
  kcal, destination village name (v.name), the FULL src.gardenShares
  object (not the boolean), and a caller tag parsed from
  `new Error().stack` (first frame outside the wrapper itself):
  donateToPantry | returnToVillage | returnToOldVillage | tribute |
  other:<frame>. This is the exact capture that would close the
  caveat; the spec below is what a game-code implementation would
  have to record if the wrapper were ever ported inward.
- Exact capture spec (for the finding, whether or not the wrapper
  is ever ported): field `callerTag` (string, one of the four tags
  above) + field `gardenShares` (the full object
  {assisted:1}|{ordinary:1}|{legacyAssisted:1}|{legacy:1}, not a
  boolean) + field `destVillage` (string), set in the
  depositPantryPieces wrapper at call time, i.e. in the inflow /
  garden capture layer (scripts/inflow-capture.js +
  scripts/garden-capture.js), where v, src, and the call stack are
  all available without touching src/js.
- Proof: scripts/test-callertag-b.js proves, on the real Game
  object loaded via the FULL src/js list in index.html order
  (minus DOM-only app.js/sprites.js/tile-scenes.js/move-anim.js/
  drama.js), Math.random seeded BEFORE eval, never stubbing
  Game.save: (i) the wrapper installs on the real
  depositPantryPieces; (ii) delegation is identical (return value
  and pantry delta match an unwrapped control call); (iii) calls
  made from functions named donateToPantry / returnToVillage /
  returnToOldVillage record exactly those tags, and a
  tribute-shaped synthetic call records the tribute/other tag;
  (iv) the full gardenShares object (assisted and ordinary cases)
  is recorded verbatim; (v) destination village name is recorded;
  (vi) the wrapper writes no Game.state beyond the delegated
  pantry effect and consumes no RNG (deterministic repeat: same
  inputs → same records).

## Deliverables

- scripts/analyze-callertag-b.js (re-derivation + R1–R4
  classification + harvest-event bridge + field inventory),
  scripts/caller-tag-capture.js (prototype wrapper),
  scripts/test-callertag-b.js (proof), this prereg file,
  evidence/2026-10-27/sim-callertag-b.md (verdict judged ONLY
  against this prereg, with a "metric review" section). Corpus
  files are READ, never modified. Hygiene: zero src/js files
  modified; no sibling capture or corpus file modified; worktree
  contains only committed work at the end.
- Commit this prereg FIRST, before any classification judgment, via
  scripts/safe-commit.sh. Classification work starts only after
  that commit lands.
