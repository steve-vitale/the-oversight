# sim-rotleak-b — rot-leak attribution (#820) + drawSpoiled reachability verdict

Run: fleshout-loop-b, arm sim-rotleak-b (worker). DIAGNOSTIC, instrument-only.
Worker tree: ~/workspace/worktrees/sim-rotleak-b (master 8720dc2c7, verified
`git rev-parse HEAD`). **ZERO src/js changes, ZERO new sims** — offline
against the sim-rotsensor-b corpus (evidence/2026-10-22/perseed-rotsensor-b/,
5 runs × 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, anchor b73e4751e) +
code reads at 8720dc2c7. The anchor→base diff touches only
src/js/convo-wants.js (favor hunger-stutter fix) — every spoil/meal/preserve
code site below is byte-identical between the sweep substrate and this base.

## Pre-registration (binding, docs/MEASUREMENT.md §14 — written BEFORE analysis)

- **PRIMARY (diag)**: ≥80% of the measured rot kcal (244,391 kcal, the
  belong-66051 survivor run) attributed to NAMED mechanisms, with the
  preservation-behavior share quantified to ±10 points. Fresh vs preserved
  split comes from the instrument's own classification
  (scripts/rotsensor-b.js: foodState 'preserved'/'rendered'/pemmican =
  preserved; all other spoiled kcal = fresh).
- **SECONDARY**: definitive drawSpoiled verdict — REACHABLE (with the named
  conditions that would have to be true) or UNREACHABLE (with the named
  code-grounded reason). Grounded in the full pantry-writer audit, not in
  the 0/21 count alone.
- **Verdict classes**: DIAG-GO | DIAG-insufficient-data | NO-GO (never
  re-scored). Budget: zero sims, zero game-code.

## Canon

- docs/CANON.md read first. docs/PRESERVATION.md: the ladder
  (cleaned 2d < cooked 5d < smoked 30d < rendered 90d < pemmican 120d);
  "Rot can't be smoked back into food"; smoking pace 16 ticks; blind first
  attempts teach (0.80x/15d rough job, then solid). The player's preserveFood
  is MEAT-only (food.js:834: cleaned/cooked meat) — the VILLAGE cook's
  overnight layer dries plants too ("You can preserve anything... smoke
  fish", game.js:6975 comment; Steve 2026-10-07 design call).
- docs/STORAGE.md: pantry cap 120,000 kcal ("~5 days for 12. Tight, not
  cruel.", food.js:2018). The survivor's peak pantry (88,178, d76) never hit
  the cap — rot here is not cap-driven.

## Method

Read the instrument corpus (sensor sweeps + 139 voice lines for
belong-66051; _summary.json for the other 4 runs), then audited the code:
sweepSpoiled + isSpoiled (food.js:2550–2660, call at game.js:30900),
pantryDraw + drawSpoiled (game.js:28138/28390, meal-loop call at
game.js:29133), the village cook's rack layer (game.js:6975–7120,
resolveOneAssignment task 'cook'), every pantry writer's spoilDay stamping
(stockPantry, stockSurplus, depositPantryPieces, pantryAdd, contests share,
hierarchy/membership/villageAgency, relay's cut, unknown-flesh paths,
mapmemButcherForCarry, carcassToMeat, takeFromPantry re-deposit), and the
single scholar.day increment site (game.js:30847).

## Attribution — the 244,391 kcal, all named (100%)

| # | Named mechanism | kcal | share | class |
|---|---|---|---|---|
| 1 | Preserved-but-expired: food the village DID preserve (mostly '(dried)' plants, some '(smoked)') that died on the preserved shelf — over-stockpiling beyond the eat rate | 61,298 | 25.1% | structural |
| 2 | Cook-budget overflow: single-night fresh rot above the cook's ~12,000 kcal/day processing budget (3 resolutions × 4,000) — d69 12,400 / d77 18,257 / d81 16,467 | 47,124 | 19.3% | structural |
| 3 | Racks-full stand-down fresh rot: fresh rotted on the 27 mixed nights (excl. d81 counted in #2) where preserved food ALSO expired the same night — the guard's design rationale: smoking it would have converted fresh rot into preserved rot, not food | 58,234 | 23.8% | structural-by-design |
| 4 | Within-budget fresh-only rot: 31 nights (24 <4,000 kcal = 28,083; 7 at 4,000–12,000 = 49,652) where the preservation system had the capacity and the teaching had named the fix, but the food rotted anyway | 77,735 | 31.8% | preservation-behavior |
| | **Total** | **244,391** | **100%** | |

**Preservation-behavior share: 32% ± 10 points** (structural: 68%).
Uncertainty note: the corpus records no cook-assignment telemetry, so #4
cannot separate "no cook resolved that day / no preserver-specialty
villager in the haven" from "the cook resolved and let it rot". The
measurable behavioral fact is the scholar's: across 66 pantry-voice days
the teaching fired ONCE (d19) and the knows-preserve mutters fired ZERO
times — the belongfeast policy never smoked once in 180d (16 ticks a batch,
fire-gated). The village-side behavior is the cook layer's coverage, which
this corpus can't see.

Why the structural buckets are structural, code-grounded:
- The cook's layer (game.js:6975+) is automatic, skill-independent (an
  unskilled cook still does the 0.80x/15d rough job), ~3x/day per the
  RACKSVOICE comment, budget 4,000 kcal/resolution — but it only touches
  about-to-rot surplus (spoilDay−day ≤ 2) beyond a ~2-night dinner reserve
  (250/person), and it STANDS DOWN entirely when preservedKcal ≥
  125/person/day × (shelf−2) (racks-full guard, default ON — the sweep ran
  without FOODLEVER_R5). The guard's own comment records the 2026-10-11
  longsim measurement: "~28% of all waste was dried/smoked food the
  village never got to" — our 25.1% preserved-rot share reproduces it.
- Fresh-first meal order (pantryDraw: spoilDay ascending) means heavy fresh
  inflow perpetually pushes preserved stacks behind dinner — preserved food
  rots uneaten even when the village "did everything right" (#1).
- Inflow spikes (expedition-tail returns + big foraging days) arrive faster
  than any rack budget; d77's line reads like a manifest: "Foraged food,
  Muscadine Grapes, Expedition haul, Wild Onion" — 18,257 kcal in one
  night against a ~12,000 kcal/day ceiling (#2).

## Sense-testing (SENSE-TESTING LAW — the village story)

d19: the village throws out spoiled Cattail and Elena says the line once —
"Should've smoked that. Fresh stuff keeps a day or two on the shelf — the
smoke rack is right there." The teaching lands. Then 65 more times the
village throws out its stores and the line condenses to the list, because
nobody changes: the scholar never learns preserving (zero mutter lines —
the mutters only fire when the player knows), and the cook smokes what the
budget and the guard allow while the foragers keep out-hauling both.

The survivor's arc: belong-66051 lives all 180 days with a pantry peaking
at 88,178 (d76) — a village drowning in its own competence. The glut
nights d69/d77/d81 read as harvest festivals gone wrong: 12–18k of fresh
food turning in a single night, Muscadine Grapes by the basket, Wild
Onion, expedition hauls. d81 is the peak the evidence file named: 19,707
swept, 25% of a 78,997 pantry — "Muscadine Grapes (dried), Foraged food,
Muscadine Grapes" — the village smoked what it could and still lost
16,467 fresh; 3,240 of previously-dried grapes died on the shelf the same
night. Late game (d143, d155) the village is STILL throwing out dried
stores — "Wild Onion (dried), Foraged food (dried)", "Expedition haul
(dried)" — preserved food it never got around to eating. The waste is
voiced every time; the behavior never moves. SENSE-PASS: the numbers and
the fiction agree — this is over-production with a preservation system
running at its design limits, not villagers refusing to work.

## drawSpoiled — verdict: UNREACHABLE (named reason)

The 0/21 (0/16 census + 0/5 rotsensor) is structural, not a sampling fluke.

The engine's spoil clock is day-granular: `isSpoiled(item)` ⟺
`spoilDay ≤ scholar.day` (food.js:2550). There is exactly ONE site that
increments `scholar.day` (game.js:30847), and `sweepSpoiled()` runs in the
same dawn wrap immediately after it (game.js:30900), removing EVERY
spoiled stack from the pantry, the scholar's pack, and the prep counter.
After that, `scholar.day` never changes until the next dawn — mid-day
spoilage is impossible by construction.

The pantry-writer audit (all writers, spoilDay stamping):
- stockPantry (foraged/expedition/game meat/weregild/genesis): day+3
  (+granary bonus). stockSurplus (villager meal surplus): v.day+3
  (v.day synced to scholar.day at dawn). depositPantryPieces/pantryAdd:
  inherit the source's fresh clock. Contests "Winner's share": pday+9.
  hierarchy/membership/villageAgency: day+14/21. Region staples: d0+v.
- Player butchering (carcassToMeat): day+2 — the corpse's own rot clock is
  NOT inherited (unlike the mapmem haul-site memory, which uses spoilBy
  only to decide whether the corpse is worth walking to, never stamped
  onto pantry items).
- No-clock writers: the relay's cut (no spoilDay → isSpoiled false
  forever); unknown flesh (kcalEach 0, no spoilDay — skipped by every
  draw). takeFromPantry bulk re-deposit preserves the original clock
  minus the granary unwind — can never go below the original fresh stamp.
- No code path decrements spoilDay; no second day-increment exists.

`drawSpoiled` has exactly ONE caller: the villager meal loop
(game.js:29133), gated by `pile.shortOfFresh` (genuine fresh exhaustion).
At that moment the pantry holds zero spoiled stacks by the invariant
above — the loop always skips everything, returns 0, never voices. The
proof's synthetic unit test (600 kcal call-through) proves the FUNCTION
works; the ENGINE never produces the state it handles.

Named conditions that would make it REACHABLE: (a) an intra-day pantry
writer stamping spoilDay ≤ current day — e.g. hauling already-rotten meat
home honestly (mapmemButcherForCarry already computes the corpse-clock
spoilBy; stamping it instead of fresh would do it); (b) sub-day spoilage
granularity, so food turns between the dawn sweep and the night meal;
(c) a dawn sweep that doesn't clear the pantry (phase split).

Steve-call (documented per kill discipline, NOT killed): the "eat rot
rather than starve" beat is dead code with live voice. Options: keep as
insurance (honest if it ever fires), make reachable via (a) — the
"haul the rot home" beat, villagers bringing back meat that's already
turned and the village choosing to eat it — or remove. Filed on #820.

## Metric review (§14)

1. **PRIMARY (≥80% named, behavior ±10pt): DIAG-GO, exceeded.** 100% of
   244,391 kcal attributed to four named mechanisms; preservation-behavior
   share 32% ± 10pt (structural 68%). Never re-scored — the bar was met as
   written. The ±10pt reflects the corpus's cook-assignment blindness,
   stated above, not a re-score.
2. **SECONDARY (drawSpoiled verdict): delivered — UNREACHABLE**, with the
   named engine reason (day-granular clock + co-located dawn sweep +
   all-fresh writers + single caller) and the three named reachability
   conditions. The 0/21 is explained, not just counted.
3. **What would change this verdict:** a cook-assignment instrument would
   narrow #4's ±10pt; a corpus on a substrate where the scholar preserves
   would split #4's scholar/village shares. Neither changes the
   structural/behavioral ordering (structural ≥58% under any split).

## Convergence state

**DIAG-GO.** #820 diagnosed: the rot leak is ~68% structural
over-production (preserved-expired 25.1%, rack-budget overflow 19.3%,
racks-full stand-down 23.8%) and ~32% preservation-behavior (within-budget
fresh the system could have saved but didn't — the scholar never smoked
once). The drawSpoiled desperation beat is UNREACHABLE in the current
engine (named reason above) — the #820 steve-call. food-economy stays
converging; the wall is unmoved by this arm (instrument-only by design).

## Wall numbers (report-only, from sim-rotsensor-b)

n=5: wins 0/5; 1/5 survived 180d; 4/5 village-lost (d87, d111, d126, d143).
National/table/wave fields were not in that sweep's lean per-seed record.

## Village assessment

The survivor (belong-66051) is the story the evidence file already told:
a village that out-produced its own spoilage. This arm names where the
1,357 kcal/day went: about a quarter was food the village preserved and
never ate (the racks-full dynamic the code already knows about), about
43% was fresh inflow arriving faster than the racks' design budget on
glut nights, and about a third was within reach of the preservation
system and lost anyway — mostly the scholar's share of the work, never
done. Nobody starved for lack of the rot; the rot is the receipt for a
food economy running hot. The blank filled: #820's attribution question.
The blank documented: the desperation beat is dead code — Steve's call
whether to wire it, reach it, or remove it.
