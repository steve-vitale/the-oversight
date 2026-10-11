# Playtest loop 2026-10-11 — explorer adversarial (rotation idx 1)

Hostile-player attacks on travel/map/fog/examine. Prior art: break-it travel
r1–r12 (fog leaks r4, examine spam r5, corpse-walks r6, ping-pong r7,
glasswing r8, diagonal blockage, MoveAnim r10, state.over phantoms r11,
away-party double-booking r12) + explorer loop guards (examineCell
post-death/mid-fight 2026-10-09, dowsing/echo free-reveal fixes 2026-10-10).
This run attacked what they did NOT: the dialog-rebuild's theorizeWith
(knowledge verb, landed 2026-10-11) and the sense-ability map honesty.

Proof: `scripts/test-playtest-explorer-20261011.js` (17/17 x3 seeds:
424242, 777001, 999983).

## BREAKS (all fixed)

### B1 — EXPLOIT/SOFTLOCK: theorizeWith ran for a corpse (game.js:theorizeWith)
No post-death guard — a stale conversation card narrated full theory lines,
granted skill encounters, moved trust via the resolver, raised energy/cheer,
learned villager goals, and advanced the action clock (tickAction ran — the
world moved for the dead). Proof BEFORE: said 12→15, enc/trust/clock/theoriesSaid
all changed with `Game.over=true`. Same class as the examineCell 2026-10-09
guard. Fix: `if (this.over) return null;` (silent, like examineCell).
Ontology: `dead_dont_theorize`.

### B2 — EXPLOIT: theorizeWith farmed encounters mid-fight with zero time cost
No inCombat guard — theorizing is time-only (tickAction(2), which no-ops when
tbfight is live), so a stale card granted analytical +2 encounters/theorize
(level 1 in 2 theorizes), trust, energy, cheer, goals with the clock frozen.
Proof BEFORE: encounters accrued, clock delta 0, trust moved mid-fight.
Fix: loud refusal `say('Not mid-fight — think later.')`, return null.
Ontology: `no_mid_fight_theorize`. Alive-and-well behavior unchanged: +2
encounters, real 2-tick cost.

### B3 — HONESTY (fog): dowsed water tile map-fogged while travel offered it
The 2026-10-10 dowsing fix narrowed the free reveal to the single water tile
("the tile itself is the find") but wrote `t.revealed=true` WITHOUT markSeen —
t.revealed is the travel flag, the overlay the player reads is seenTiles-gated.
Result: log says "water, south, 3 tiles", travelTargets offers the tile, but
the map tap says "Unexplored — you haven't been here." Same mismatch class as
the scout r8 fix. Fix: `markSeen(best.x, best.y, 'shared', 'dowsing')` —
'shared' never becomes 'visited' until walked. Ontology: `sense_marks_shared`.

### B4 — HONESTY (fog): echo_location's "3x3 revealed" was false on the map
Same class: the 2026-10-10 fix marks exactly the 3x3 via t.revealed, but the
overlay stayed fogged for all of them. Fix: markSeen 'shared' on the 3x3
(with by:'echo_location'). Copy is now true on the map the player reads.

## HELD (attacked, resisted)
- monstersGated knowledge gate (dialog rebuild): swept all 6 intelligences'
  ungated monster/system/situation pools against every monster name/desc in
  monsters.json (word-boundary) — the only hits were ordinary words inside
  phrases ("rules of engagement", "the static"). Gated specifics (headlight-
  eyed night hunter, birds-quiet telegraph, hushwolf wants-quiet counter)
  live in monstersGated and only draw once codex.monsters has a real encounter
  entry (ensureMonsterEntry = faced, not rumored). Proof §H2 both directions.
- Map tap handler: 'shared' tiles honestly named "(shown to you by someone) —
  you haven't walked it yourself"; no travel from the map (Steve 2026-10-06).
- examineCell (carexplore.js, the live one — game.js's is shadowed/dead code):
  post-death + mid-fight guards intact; tickAction(2) real when alive.
- travelTo / tryNodeExit / findWalkableEntry: r7–r10 armor holds (not re-attacked).

## Regressions (on landed tip)
- test-playtest-explorer-20261011: 17/17 x3 seeds
- test-explorer-reveal-20261010: 18/18
- test-dialog-leakfix-20261011: ALL GREEN
- test-parity-abilities: ALL GREEN
- test-social-breakit-deal-appeal-20261009: 12/12
- test-abilities-break-20261010: 66/67 — 1 failure (tidecaller synthetic
  path) PRE-EXISTING, identical on pristine main-tree checkout, not this run.
- validate-ontology: 63/63, ONTOLOGY.md regenerated with the 3 new rules.

## Flags for other loops
- convoTurn (conversation.js) itself has NO dispatch-layer over/inCombat
  guard — theorizeWith is now armored, but other choices ('agree' +1 mood,
  'joke', compare_maps +1 trust + map knowledge with NO tick cost at all)
  still fire for a stale card post-death/mid-fight. Social loop's call
  whether the dispatch layer gets the same treatment.
- game.js's examineCell (line ~16966) is dead code (shadowed by carexplore.js
  since 2026-10-04) and its delegation target Ex.examinePlantCell is
  effectively unreachable — but examinePlantCell itself has no post-death /
  mid-fight guards if load order ever changes. Hardening candidate, not a
  live break.

## FUN note
The theorize lines are genuinely good writing ("Fauna and flora came as a
set. This is a terrarium, and we're inside the glass." / "Learn the quiet —
it's your early warning."). The verb deserved guards, not a nerf; nothing
about the rate or flavor changed for honest play.

Merged locally as 87c36fba ("merged locally, pending ship" — ship loop owns
pushes). Worktree released; main tree clean.
