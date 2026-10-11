# Break-it: travel & map, round 13 (2026-10-11)

Hostile-player attack on travel & map, round 13. Rounds 1–12 are closed and
were NOT re-attacked (fog leaks r4, examine spam r5, corpse-walks r6, travel
ping-pong r7, glasswing stacking r8, diagonal blockage + hive_mind honesty,
MoveAnim queue exploits + long-walk truncation r10, the `state.over`
phantom-flag class r11, away-party double-booking + party drafting + dead
walk-ins + player-loaning r12). This round attacked the FRESH surface landed
after r12 (87c36fba, 2026-10-11).

Canon: **no dedicated travel/map canon doc exists** (stated, not invented —
same as every prior round). Travel canon from docs/TIME-ECONOMY.md (node
travel free; travelTimeStep anti-spam) + docs/CANON.md ("If you don't know,
it doesn't show").

Worktree: `break-travel9` (this run).

Verdict: **BROKE + FIXED — 2 honesty breaks** (one copy class × 2 tap
sites + codex header), both introduced by the fresh `sense_marks_shared`
change. Everything else on the fresh surface held.

## The fresh surface

**87c36fba** "playtest explorer 2026-10-11": dowsing and echo_location now
`markSeen('shared', by='dowsing'|'echo_location')` so the world-map overlay
agrees with the log ("water, south, 3 tiles" / "3x3 revealed"). Before this
commit, 'shared' meant exactly ONE thing: a villager shared the ground
(compareMaps writes `by=<villager id>`; scout reports write `by=<vid>`).
Sensed ground now lands in the same bucket, with the provenance stored in
the `by` field — but nothing reads it.

## BREAKS (both fixed, proof below)

### H1 — HONESTY: sensed ground claimed a person showed it to you (FIXED)

Both map tap sites rendered the same unconditional lie for EVERY 'shared'
tile:

- `src/js/app.js` map-overlay tap: `(shown to you by someone)`
- `src/js/app.js` expedition-minimap tap: `Someone showed you this ground —
  you haven't walked it yourself.`

Repro: grant dowsing → activate → the sensed water tile lands in seenTiles
as `{k:'s', by:'dowsing'}` → open the map, tap the tile → "(shown to you by
someone)". Nobody showed you. You dowsed it. Same for echo_location's 3x3.

**Fix:** `Game.sharedTileNote(x, y)` (game.js, next to mapSeen) names the
provenance honestly from the stored `by`:

- `by==='dowsing'` → "(your dowsing found water here — not walked)"
- `by==='echo_location'` → "(your echo mapped this ground — not walked)"
- villager id / null (old saves) → "(shown to you by someone)" (unchanged)

Both tap sites call it (guarded `Game.sharedTileNote ?` + a `||` fallback to
the old copy so a skewed deploy never renders an empty span). Ontology:
`sense_provenance_honest`.

### H2 — HONESTY: codex MAPS claimed "everywhere the village has walked" (FIXED)

`villageMapKnown()` pools all of seenTiles, so dowsing/echo-sensed tiles
now render in the codex MAPS section — under the header "everywhere the
village has walked, pooled together." Sensed ground was never walked by
anyone. (The scout precedent — villagers' own walked tiles — fit the old
header; the new sense writers don't.) **Fix:** the header now reads
"everywhere the village has walked — or sensed — pooled together."

## HELD — probed, not broken

- **H3 — EXPLOIT: sensed-ground depletion leak.** `depletionClass` still
  gates on `mapSeen` AND a fresh `groundReadDay`. Dowsing a tile does not
  set `groundReadDay`, so sensed ground shows no depletion intel. Verified
  the gate isn't dead: a fresh read on a stripped visited tile still shows
  `depleted-barren`.
- **H4 — upgrade path.** 'shared' never becomes 'visited' without walking:
  re-sensing (`markSeen` 'shared' again) never upgrades; walking the sensed
  tile (travelTo) upgrades to 'visited'. markSeen's `s->v` upgrade and the
  no-clobber rule intact.
- **H5 — no clobber.** `markSeen` never overwrites an existing entry:
  echo over a compareMaps tile keeps `by=<villager>`; 'visited' is never
  downgraded to 'shared'.
- **H6 — villageCard fog (r5 regression).** Unseen village → card null;
  seen (any sense, incl. echo) → card opens. Fog gate holds.
- **H7 — scout/drinking/water.** Survivalist r7's `drinkFromCell` (a7f6b5ee)
  examined for travel interplay: the not-thirsty null return is the
  designed free-refusal (world turns already advanced — not a free lunch);
  `_cellInteract`'s mid-fight/post-death guards still front the water
  branch. Held by design.
- **H8 — r10 BREAK 2 guard.** `playerDeath` still purges MoveAnim first
  (abilities r5's ledger.js diff appends below it; verified on the new base).
- **D — dead code.** `sharedTileNote` defined + called from both tap sites;
  index.html loads every travel module; every `Game.*` travel entry point
  defined and called (r11 T-section pattern).
- **Washed-out swim offer** (r3/r8-known): the blockage card still offers
  "Swim across" on washed_out gaps while smashBridge's comment says "swim is
  a lie there". Pre-existing, seen by two prior rounds, unchanged this run
  — noted, not re-plowed. (Honest opinion: the card offer contradicts the
  engine comment; a future round should pick one.)

## Sibling sweep (same "sense writes that copy didn't keep up with" class)

- All `'shared'` readers in app.js audited: tap sites (fixed), renderMap
  shared-class/depth comments (cosmetic, 'shared' renders biome-color only
  — correct), compass line (gated by proximity announcement, dist<=2 —
  held), codex header (fixed).
- `seenTiles` readers outside game.js/app.js: none (only betrayal.js's
  unrelated `b.by` bribery field).
- `villageMapKnown` consumers: codex MAPS only. Header fix covers it.

## Proof

`scripts/test-travel-r13-20261011.js` — 28/28 × 3 seeds (7, 42, 2026).
BEFORE (unfixed): [D] 4 red legs (no `sharedTileNote`, both unconditional
lies present in app.js) + TypeError on the missing function. AFTER: all
green. Regressions: `test-playtest-explorer-20261011.js` 17/17 (the
dowsing/echo change's own suite), `test-travel-r10.js` 8/8,
`test-travel-r11.js` 125/126 — the single failure ("lived time releases
world-steps proportionally") reproduces identically on the pristine main
tree: pre-existing, not this run. Ontology validator: 63/63, docs/ONTOLOGY.md
regenerated.

## Fix files

- `src/js/game.js` — `sharedTileNote(x, y)`, ontology entries
  (`sense_provenance_honest`, provides line)
- `src/js/app.js` — both map tap sites provenance-aware; codex MAPS header
- `docs/ONTOLOGY.md` — regenerated by the validator
- `scripts/test-travel-r13-20261011.js` — proof (28/28 × 3 seeds)
