# sim-creekremedy-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-creekremedy-b, axis
food-economy (creek-remedy feasibility DIAG). Worktree
sim-creekremedy-b. DIAG ONLY, measurement-only: zero src/js
changes, zero policy lever built, zero default flips. A
future bridge/ford lever needs its own prereg; if this
DIAG shows a remedy is feasible on some share, this run
reports the share + preconditions and STOPS — it does
not build the lever mid-run. This worker does NOT merge
to master — coordinator merges.

## Background (read before judging)

- evidence/2026-10-29/sim-clearhabit-b.md +
  sim-clearhabit-b-prereg.md: the homeward clearing habit
  was KILLED at pilot (rescue 5/22 = 0.227 < 0.50 bar,
  n = 22). Creek is unclearable and dominates the pool:
  16/22 opportunities creek (seed 11636: 10, seed 11707:
  6), rescued 0/16; all 5 rescues were non-creek
  blockages. The evidence states "creek needs a bridge,
  not clearing."
- evidence/2026-10-29/sim-blocktype-b.md: the blind-band
  census was INSUFFICIENT-DATA, but its validation pair
  adds one more creek refusal (seed 12027: 1, blocked
  tile (3,3), 3-step route-around exists).
- The 0830Z loop-B review names the next blank, in
  order #4: "a creek remedy (bridge/ford) as
  precondition for any future homeward-clearing
  attempt — the habit's value is capped by creek share
  until then."
- The evening-detour lever (route-around walk home)
  already covers route-around-able evenings — it is NOT
  re-measured here. Detour gates are OFF in both legs.
  Route-around existence is recorded per creek evening
  for CONTEXT ONLY, never pooled into feasibility.

## Canon + code FIRST (the feasibility definition comes from here, never from wishes)

Read first: docs/CANON.md (manifest), docs/MAP.md §1/§6
(creeks, the way home). No canon doc covers a creek
remedy as a system; the authority is the engine itself
(src/js/game.js), verified by grep before this prereg
was written:

- BRIDGE MECHANIC EXISTS: Game.buildBridge(x, y)
  (src/js/game.js, "build a bridge: 4 wood,
  permanent. for washed-out paths and hard creeks").
  Cost: 4 wood from the PLAYER's inventory
  (Game.woodCount() reads state.scholar.inventory —
  NOT the village woodpile), 60 kcal, 96 ticks
  (3 chunks via tickAction). Guards: refuses when
  dead, mid-fight, already bridged, or no gap to span.
  NO knowledge gate, NO skill gate, NO occupation
  gate. Permanent until a storm smashes it
  (smashBridge returns a creek crossing to its honest
  pre-bridge state, needsBridge persisting).
- CREEK BLOCKAGE: ~35% of creek tiles carry
  needsBridge (world-gen). Game.travelBlockage refuses
  a needsBridge, unbridged creek tile to anyone
  without the swimmer skill. Game.clearBlockage refuses
  it by hand, saying: "The creek runs fast here —
  you can't clear it with your hands. Bridge it
  (4 wood) or swim it."
- SWIM: not a ford. The only swim path is the
  swimmer SKILL (knowledge.json: learnable via
  background/teach; abilities.json lane "skill").
  A non-swimmer cannot swim a hard creek at any
  cost in the engine.
- FORD MECHANIC: ABSENT. Grep over src/js/game.js
  and src/js/app.js finds no ford verb, no ford
  cost, no ford tile state — only the village name
  "Stonebridge". If this DIAG reports a ford share,
  it would be invented; it reports "mechanic absent"
  instead. That absence IS part of the finding.

## Feasibility definition (code-derived, fixed here)

A creek evening is BRIDGE-FEASIBLE iff ALL hold, read
at the refused evening on the post-competent.daily
state (position unchanged by the refusal, hop cost
0, so the refusal-time read IS the day-end read):

1. Blocked tile is a creek tile with needsBridge true
   and bridged false (recorder probe agrees with the
   hop's block:creek — see classification below).
2. Player wood (Game.woodCount()) >= 4.
3. Scholar kcal >= 60 (pays the bridge cost in full;
   the engine clamps at 0 rather than refusing, so
   kcal < 60 still "builds" but drives kcal to 0 —
   counted NOT feasible under the pay-in-full
   reading, and reported separately if any occur).
4. Not dead, not in combat (travel-refused evenings
   satisfy this by construction; recorded as a check).

TIME (descriptive, NOT a gate): bridge costs 96
ticks; the day budget is 512 ticks
(TICKS_PER_DAY). The recorder logs dayTicks at
refusal and ticks-to-day-end (512 - dayTicks), plus
a rollsDay flag (96 > ticks-to-day-end). The engine
does not refuse a build for lack of ticks —
tickAction rolls the day — and the clearhabit
precedent inserts work before nightStep in driver
order, so time cannot gate feasibility on engine
grounds. If rollsDay is near-universal, that is a
design note for the future lever's prereg, not a
re-score here.

SECONDARY (reported, never judged): FLOOR-FEASIBLE =
bridge-feasible AND kcal - 60 >= 200 (the
clearhabit kcal-floor analog: after building, the
villager still holds >= 200 kcal). VILLAGE-PILE
CONTEXT = state.village.wood at refusal (the pile
sits at haven, unreachable on a refused evening —
it can never make that evening feasible, but it
sizes the "wood not carried" gap for a future
daytime-carry habit).

## Corpus (DIAG band, no re-scan)

Known creek-dominated seeds ONLY: 11636, 11707
(clearhabit pool), 12027 (blocktype creek refusal).
Expected creek pool from prior evidence: 17
(10 + 6 + 1). NEVER re-scanned as judged data: the
nighttravel bank 11000–11447, the blocktype blind
band 12000–12079.

FALLBACK (bounded, pre-authorized): if the 3-seed
band yields creek n < 8, extend in ascending seed
order with the remaining clearhabit pilot seeds
(11626, 11639, 11654, 11697, 11714, 11728) — already-
run seeds, no new scan — until n >= 8 or the list
is exhausted, then INSUFFICIENT-DATA. No fresh
band is authorized by this prereg.

## Legs

Fresh gate-OFF nighttravel legs (detour OFF,
clearhabit policy deleted from this tree, all
separation gates unset/0: COMPETENT_EVENING_DETOUR,
COMPETENT_STANDING_HOME, COMPETENT_ROUTE_AROUND,
COMPETENT_TRIPHOME_ROUTE_AROUND), substrate
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, DAYS=30, TAPDAYS=5, same driver
shape as nighttravel-trace-b (thief tap retained
for substrate identity, never judged):

- OFF leg: recorder env unset → wrapper delegates,
  corpus sim-creekremedy-b-corpus-off/.
- ON leg: CREEKREMEDY_DIAG=1 → recorder classifies
  travel-refused evenings, corpus
  sim-creekremedy-b-corpus-on/.
- The recorder is PURE READS + one ctx record
  (directHopBlockage probe + BFS route-around for
  context, both drawing no RNG; wood/kcal/pile/
  swimmer/dayTicks reads; no say lines, no game
  writes, no wrapped engine functions). Errors are
  counted, never thrown into the engine.

## Classification (per travel-refused evening)

- CREEK evening: outcome travel-refused AND
  hopReturnKind block:creek AND recorder probe
  finds blockType creek on the SAME tile AND no
  probe/route error. (Route-around BFS errors do
  not unclassify: route length is context only;
  a BFS error is recorded in its own field and the
  evening stays classified on the creek facts.)
- OTHER-REFUSED: travel-refused with a non-creek
  hop type (fallen_tree / rubble / washed_out) —
  context count only, never in the creek
  denominator.
- UNCLASSIFIED: travel-refused where the hop says
  creek but the probe disagrees (different type or
  tile, or probe found no blockage) or the probe
  errors. Unclassified evenings break DIAG-GO (see
  below) — they are never papered over.

## Primary metric, DIAG bar, guards (judge ONLY against these)

PRIMARY (creek-evening bridge-feasible share, ON leg
only): (bridge-feasible creek evenings) / (all
creek evenings on the ON leg). Reported with exact
counts and a Wilson 95% interval (computed by the
analyzer; with n = 17 the interval is wide and is
reported as such, never hidden behind the point
share).

- DIAG-GO requires ALL of: creek n >= 8 AND
  unclassified == 0 AND recorder errs == 0 AND
  OFF-vs-ON deep-equal zero diffs (corpus JSONs
  equal after stripping creekRemedy fields and the
  recorder store) AND determinism re-run byte-
  identical for one re-run seed. DIAG-GO means THE
  QUESTION IS ANSWERED (feasibility share +
  binding constraint measured on a clean
  instrument) — it is NOT a rescue bar and NOT a
  lever adoption.
- INSUFFICIENT-DATA: creek n < 8 after the
  fallback, or any DIAG-GO condition failing on
  instrument grounds (unclassified > 0, errs > 0,
  OFF-vs-ON diffs, determinism mismatch) where the
  failure is the instrument's, not the game's.
  The verdict names which condition failed.
- NO-GO: not applicable as a kill bar for a DIAG —
  a feasible share of 0 is a ANSWERED question
  (DIAG-GO with share 0), not a failure. A miss is
  never re-scored: the denominator stays ALL creek
  evenings (never feasible-only, never
  route-uncovered-only, never wood-carried-only).

BINDING CONSTRAINT (reported per infeasible creek
evening, first failing precondition in order):
wood-short (wood < 4, with deficit 4 - wood) vs
kcal-short (kcal < 60, with shortfall) vs
other (dead/combat/bridged — expected 0 on
travel-refused evenings; any occurrence is
reported, not dropped). The pooled binding
constraint is whichever class holds the plurality
of infeasible evenings.

## Secondary (reported, never judged)

- Per-seed creek counts, wood/kcal distributions
  at refusal, village-pile wood at refusal, swimmer
  flags (expected all false — a true swimmer
  would not refuse), route-around lengths
  (context only), dayTicks / rollsDay flags,
  floor-feasible share, other-refused counts.
- Cross-check vs prior evidence: ON-leg creek
  counts per seed vs the clearhabit after-leg
  counts (11636: 10, 11707: 6) and the blocktype
  scan count (12027: 1). Divergence is reported
  and explained (gate-OFF legs vs clearhabit
  after-legs differ by the deleted habit's
  clearings on non-creek evenings), never hidden.
- Wall numbers: NOT OBSERVABLE on 30-day evening
  legs (pre-seat). National / table / wins are
  reported as NOT OBSERVABLE, never claimed.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered here before judging: this leg is a
30-day position DIAG of a POLICY-SIDE recorder —
zero src/js changes, so there is no game-root
delta for a panel to compare, and the panel's
registry policies do not include the nighttravel
trace policy. The OFF-vs-ON deep-equal check is
the instrument-perturbation proof, and the
pre-registered DIAG bar above is the judge. If a
future bridge lever becomes a game change, a panel
compare is run at that point.

## Horizon + why (death-aware, never a fixed 200d)

30 loop-days, same as the verdict/detour/
clearhabit legs: the refused pattern is visible
inside 30 days (prior episodes run 1–10 evenings
within 30 days). Dead villages stop simulating
(runDays endReason); the +10d tail is a cap, not
a target.

## Sense-testing (mandatory, in the evidence file)

Read 2–3 creek-refused evenings end to end from
the ON corpus say tails and judge meaning: does
the player understand WHY home is unreachable, and
what would fix it? Is there any line naming a
bridge, a ford, or the missing wood? Judge
meaning, not counts.

## Village assessment (mandatory, in the evidence file)

Plain words: what the village looked like, who
thrived and who died and why, what
knowledge/capabilities were missing, which blank
was filled (this DIAG itself) or documented. Plus
wall numbers (NOT OBSERVABLE — stated, not
claimed).

## Metric review (prereg — doubts carried into the run)

- Time-as-gate: the engine gives no tick refusal,
  so time is descriptive here. If rollsDay proves
  near-universal, the FUTURE lever prereg must
  decide whether a bridge habit belongs earlier
  in the day (daytime work point) rather than at
  the clearhabit insertion point — proposed here,
  NOT applied retroactively to this DIAG.
- Wood scope: feasibility reads PLAYER-carried
  wood only, because buildBridge spends from
  scholar inventory. A future lever could in
  principle add a daytime carry habit (pile →
  pack); the pile numbers recorded here size that
  question but do not change this DIAG's
  denominator.
- If the metric proves wrong (e.g. the probe's
  first-blockage order diverges from the hop
  refusal on a judged seed), write it under
  "metric review" in the evidence file and propose
  the revision for the NEXT run — never re-score
  mid-run.

## Landing rule

- DIAG-GO / INSUFFICIENT-DATA: land the recorder
  instrument ONLY (scripts/policies/
  creekremedy-diag.js + trace/analyzer/proof
  instruments, default-OFF, no driver adopts it by
  default) + evidence + corpora. NO src/js change,
  NO policy lever, NO default flip.
- This worker does NOT merge to master —
  coordinator merges. Report 'committed, pending
  coordinator merge' with the verdict, the
  feasibility share + binding constraint, and the
  evidence paths.
