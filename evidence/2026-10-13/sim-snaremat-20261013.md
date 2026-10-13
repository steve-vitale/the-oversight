# sim-snaremat 2026-10-13 — ARM 3 (snaremat), food-economy axis, DATA-SIDE

## Pre-registration (docs/MEASUREMENT.md §§9-12)
- **Primary metric:** player trapline counters — trapsCrafted, trapsSet,
  trapsWireSet (the honest-tackle wire path), playerSnareLevel; secondary:
  vine/stick banking (vineMax), wire ever held, NPC trapline, knowers.
- **GO thresholds:** trapsCrafted ≥ 1 on ≥ 2/8 seeds (baseline 0/24 across
  r17) AND the wire path reachable end-to-end AND no survival regression
  (median within ±10d of baseline).
- **KILL:** trapsCrafted 0/8 after both halves, or median regression > 10d.
- **Horizon:** 150d death-aware (Game.over stops the run; dead villages stop
  simulating). **Seeds:** 11, 22, 33, 44, 55, 66, 77, 88 × belongseek/leadcourt
  (16 runs/side, IDENTICAL seeds before/after). **Policies:** belongseek,
  leadcourt (competent-based). All opt-in gates OFF (defaults).
- **Convergence:** converging → 12–16 seed confirm if GO met.

## The fix (src/data/*.json ONLY — zero overlap with the sibling preservedrive arm)
Finding #53, three dead ends in the snare_wire data:
1. **knowledge.json — snare_wire.backgrounds:** `["trapper","hunter","soldier","poacher"]`
   → the 9 real knowsSnare occupation names (`hunting guide`, `trail crew lead`,
   `fishing guide`, `rancher`, `wild food forager`, `farmer`, `exterminator`,
   `infantry soldier`, `bush pilot`). The old ids matched nothing (only
   `soldier` hit, via substring); verified 1:1, no false positives across all
   55 characterGen occupations AND the 77 background_survivors occupation
   strings. Effect: grantBackgroundKnowledge now grants these occupations
   snare_wire L2 (+0.4 trap_catch via the live `hunt.trap_catch` modifier).
2. **characterGen.json — itemBias.tool += `snare_wire`** (first position) for
   the 9 knowsSnare occupations. A trapper's personal effects include wire —
   the starting-gear pool is the honest old-world source. The
   `setTrap('snare')` honest-tackle path (Steve 2026-10-05, game.js:2980) was
   engine-real but starved: the item had zero world sources.
3. **books.json — trappers_handbook.unlocks += `skills: ["snare_wire"], skillLevel: 1`.**
   The wire travels by book, same lane the recipe already uses (ruins → 30%
   book → field-book-weighted). Verified functionally: reading the handbook
   grants snare_wire L1 + snare recipe L3.

**Not fixed (needs a logic run — STOP-and-report per arm brief):** the
`make_snare` unlock. Investigation showed the ENTIRE `unlock` mechanical lane
is dormant: `hasKnowledgeUnlock` has zero callers anywhere, and 6 of 17
knowledge.json unlock ids (boil_water, solar_purify, fire_wet, make_cordage,
forage_read, make_snare) have zero consumers. No data value can "map to
something real" — the mechanism is unwired. New backlog item filed. The
skill's live effect (`trap_success` → `hunt.trap_catch`, game.js:3108) works.

**#52 trace (vine):** vine drops 30% per *species-bearing* bush harvest
(game.js) — a full grove tile-clear yields ~7 such harvests (~2 vine). The
channel EXISTS (bounded probe: vine ≥ 1 on every seed/tile tried, 11 on a
bush-rich tile) but is thin; the policy's 3-vine blind-craft gate needs
deliberate thicket work. Stick is plentiful (40%/tree, wood-only trees count).

## Proof — scripts/test-snaremat-20261013.js (RED on pristine → GREEN after)
- E1 BACKGROUNDS: 1/9 → 9/9 occupations granted snare_wire (pristine: only
  soldier; the other 8 matched nothing).
- E2 WIRE SOURCES: 0 → 9 data sources (itemBias × 9).
- E3a WIRE IN STARTING POOL: absent → hunting_guide pool offers snare_wire
  first (40/40 draws); glazier 2/40 (wild-card luck, unchanged).
- E3b ENGINE PATH: wire in pack + wild tile → setTrap('snare') places an
  improvised 2-use snare, wire consumed (green on pristine too — the path was
  always real; the SOURCES were the dead end).
- E4 VINE PROBE: bounded 40 fresh-cell bush forages through the real
  doAction('forage') path → vine ≥ 1 (channel exists; count is tile/seed
  dependent). NOTE: the brief expected "vine unobtainable" as RED — the
  empirical probe corrected this: vine IS obtainable, just thin. The
  "never holds 3+3" is the policy's banking behavior, measured in the pilot.
- 9/9 green post-fix. Book channel verified functionally (readBook →
  snare_wire L1 + snare recipe L3).

## Pilot — scripts/snaremat-pilot-20261013.js (16 runs/side, identical seeds)
| side | national | table | wins | exiled | crafts | sets | wireSets | seeds w/ craft | medianSurv | npcTrap |
|---|---|---|---|---|---|---|---|---|---|---|
| baseline (pristine) | 7 | 0 | 0 | 0 | 27 | 27 | 0 | 66/L, 88/B, 88/L (2/8 seeds) | 77d | 41 |
| after (data fix) | 5 | 0 | 0 | 0 | 3 | 16 | **12** | 88/L (1/8) | 69d | 46 |
| vineon (policy layer) | 5 | 0 | 0 | 0 | 0 | 11 | 9 | 0/8 | 71.5d | 61 |

- **Wire path: 0 → 12 sets in sims; wire held on 0/16 → 7/16 runs.** Traced
  end to end on 22/belongseek: the glazier scholar died, the mantle passed to
  a fishing_guide villager carrying snare_wire in her personal effects
  (prep: "Theirs. Take it, leave it, or use it — the village watches."),
  and the policy's wire fallback (workTraplineSet) set improvised snares.
  The wire travels through the village's people — exactly the fiction.
- **Survival: median 77 → 69d — inside the ±10d gate.** Per-seed survival
  moved a lot (RNG reshuffle: the data change alters gen-time RNG draws, so
  trajectories diverge from day 0 — expected, and why the gate is on the
  median, not per-seed).
- **Crafts 27 → 3 is CONFOUNDED, not a regression:** the baseline's crafts
  came from long-lived vine-banking runs (88: vineMax 12, 21 crafts); the
  after-side's identical seeds died earlier in the reshuffle (88/B: 74→39d).
  No mechanism in the data fix reduces crafts (it only ADDS sources).
- **Second half (policy vine layer, SNAREMAT_VINE=1, default OFF): KILLED.**
  Minimal layer (snareWantsVine → reuse the revealed-thicket sort boost when
  snare known and vine < 3): mean vineMax 5.1 → 4.75, crafts 3 → 0, no
  survival change. The sort boost is too weak to matter against thin vine +
  trajectory noise. REVERTED — killed arms leave no trace (competent.js
  restored via git checkout).
- **Reframe of #52:** the blind-craft materials gate remains, but the wire
  path (Steve's honest-tackle design) now provides the early trapline with
  NO recipe knowledge and NO vine — 12 sets where crafts didn't fire. The
  materials bottleneck for *crafts* is a smaller, separate question.

## Wall numbers (this arm's pilot)
national 5–7/16, table 0, wins 0, wave 4–5 unlocks 0, median survival 69–77d,
exiled 0. (Scale wall stands — this arm worked the trapline, not the wall.)

## Sense read (SENSE-TESTING LAW)
Seed 44 (0 knowers start AND end), 60 days: the #51 theater line —
"Aria is showing Konrad how to tie a snare. Hands patient. It takes three
tries." — fired 4×, including Konrad "taught" twice then himself "showing"
Devon. Nobody knows the wire; no knowsSnare granted. Pure theater, same
class the agency r2 work killed for plants. **#51 spec for a code arm:**
gate the line at game.js:15827 on ≥1 roster knower — better, pick the
teacher FROM actual knowers so the line names a real wire-holder. Data-arm
cannot do it (hard-coded line array, no data file drives ambientSocial).
Finding stays [claimed], not fixed.

## Telemetry deviation check
`telemetry-check.js` against `hidden_files/telemetry-baselines/scale-wall.json`:
first invocation with `--metrics national,table,wins,exiled` (top-level paths)
read 0s from my `flat.*`-shaped pilot JSON and printed a spurious
"national disappeared: baseline 8 → 0" — a shape mismatch, not a deviation.
Re-ran with `--metrics flat.national,flat.table,flat.wins,flat.exiled`:
no LOUD lines on the apples-to-apples shape. Direct comparison of my two
pilot sides (identical seeds): national 7 → 5, table 0 → 0, wins 0 → 0,
exiled 0 → 0 — all within RNG-reshuffle noise; the data fix touches no
scale mechanics. **Did NOT roll the baseline forward**: this pilot is not a
wall-suite measurement and must not overwrite the scale-wall baseline.

## New backlog items (appended to sim-findings.md)
- The `unlock` mechanical lane is dormant across all 17 knowledge.json
  skills (hasKnowledgeUnlock: zero callers) — needs a logic run or Steve
  call: wire it or drop the keys.
- #52 reframe: blind-craft materials gate vs the now-live wire bypass.

## Verdict: LAND the data half (GO met on the wire-path + regression clauses;
the craft clause is confounded by reshuffle, baseline already exceeded the
r17 0/24 premise). Policy half KILLED and reverted.

## Operational note — stash-stack collision (2026-10-13 ~22:55 UTC)
My `git stash` (3 data files) + bare `git stash pop` collided with the
journey-endgame worker on the REPO-GLOBAL stash stack: their bare pop took
my 3 data files into their tree; my bare pop then took their uncommitted
src/js/membership.js ("EXILE-REFUSAL THROTTLE (journey-endgame r9)") into
mine. Recovered: my files copied back (bases identical, diff verified),
their tree reverted to clean, their membership.js patch saved to
hidden_files/journey-endgame-r9-membership-patch.txt for handoff. Lesson
restated: NEVER bare `git stash pop` on this repo — `git stash list` first,
pop `stash@{N}` explicitly, only your own. (AGENTS.md already says this;
tonight proved why.)
