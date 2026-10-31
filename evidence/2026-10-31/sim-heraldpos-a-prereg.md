# sim-heraldpos-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1107Z.
Arm type: DIAG ONLY — zero src/js changes, zero policy-default flips,
zero edits to existing policy or instrument files, no routing/call
build (backlog #1538 ruling still pending; this arm measures
placement/movement, it does not build the route). The perception law
(Steve 2026-10-28) binds any later brief the same way it bound
mustercall-b/2: a meeting must be perceivable by a person present,
never a roster scan — and this arm tests exactly whether such a
perceivable meeting can occur at all.

## Question (handed forward by sim-heraldcontact-a, backlog item 1)

Heraldcontact-a (evidence/2026-10-31/sim-heraldcontact-a.md) found a
located Herald (omen stage 2) never contacts anyone in 30- and
36-day windows (seeds 87137, 87127) while wild wave-4 monsters
contact repeatedly on the same seeds. This arm answers by
measurement, not by reading code alone:

(a) Where does titanPlace put the lair relative to Haven, to
    villager tiles, and to villager paths — distance in tiles,
    on-map vs edge?
(b) After placement, does the placed Herald move under
    monster-turn rules toward inhabited tiles, wander, or sit on
    its lair — daily position census from placement to run end
    or first contact?
(c) How often does any villager tile coincide with / come
    adjacent to the Herald tile, and does the omen say-line
    ("scouts found its lair") match a reachable meeting at all?

## Canon read FIRST (before any instrument design)

- docs/CANON.md (manifest) + docs/MONSTER-WAVES.md: no canon doc
  covers Herald lair placement, Herald movement, or Herald
  villager-path reachability. MONSTER-WAVES.md mentions titans
  only in passing (wave-6 heralds as infrastructure, not the
  Herald). Per the task brief, src/js/titans.js's header is the
  code canon for this area, and it is quoted below from code,
  not invented.
- Code canon (src/js/titans.js, read at prereg time):
  - `titans_never_wander: monsterWavePool excludes titans. They
    arrive by omen only.` Titan ids are also excluded from the
    cast pool by sim-titanexcl-a (game.js monsterWavePool,
    backlog #1550).
  - Omen staging: stage 0 -> 1 after >= 4 days (p 0.35/day),
    stage 1 -> 2 after >= 9 more days (p 0.4/day); stage 2 calls
    titanPlace and speaks the lair line.
  - `titanPlacementTile(offset)`: target = player tile + offset
    east (titanPlace passes 3); scans the 9x9 home board,
    excludes the player tile, safe tiles (isSafeTile: 'haven'
    tiles + other-village tiles), and tiles already holding a
    monster; picks the tile minimizing Manhattan distance to
    (playerX+3, playerY), tie-break larger x first, then smaller y.
  - `titanPlace` spawns the Herald as an ordinary world monster
    via `Game.spawnWorldMonster(def.monster, tx, ty, {titan:true})`
    — no homeTx/homeTy is set (contrast network-campaign nodes,
    which do set homeTx/homeTy). The lair line is spoken AFTER
    the spawn, so a say-line capture can read the live entry.
  - Escalation (stage >= 2, every 5 days unanswered): pantry
    raid or allied-village trust -5, spoken aloud. No movement
    is coded in titanEscalate.
- Movement code that COULD move a placed Herald (read, not assumed):
  - `wanderWorldMonsters` (game.js worldTick): EVERY world
    monster, with no titan exclusion in its body, moves to a
    random adjacent tile with p 0.35 per worldTick, skipping
    safe tiles and occupied tiles, clamped to 0..8. worldTick
    runs only on player tile entry (checkEncounter).
  - `villagerMonsterTick` (inside worldTick): a world monster
    fights a villager ONLY when at least one roster villager's
    node equals the monster's tile (npcsOnNode), and then only
    with p 0.5 per tick. Safe-tile wandering is impossible, so
    a Herald can never wander ONTO Haven's tile itself.
  - `monsterTurn` moves only the PLAYER-tile monster's detail
    coords (mx,my) within its tile; it never changes a monster's
    tile (tx,ty). Tile movement and detail movement are
    different things, and this arm records both so they cannot
    be conflated.
  - Hypothesis stated BEFORE sims (to be confirmed or refuted
    by the census, never assumed): a placed Herald sits on its
    lair except for random wanderWorldMonsters drift (0.35 per
    player tile entry, direction random, never toward Haven),
    and contact requires either the player walking to its tile
    or a villager's node coinciding with its tile during a
    worldTick — both rare because villagers live at Haven and
    the lair is placed off Haven by construction.

## Base pin

- Worktree HEAD at prereg time: 772ac99d2 (Loop B round 1047Z
  evidence commit; includes the heraldcontact instrument/sweep
  lineage). Every per-seed JSON carries its own anchorCommit;
  the verdict judges the sweep on THIS base only.
  Heraldcontact-a's numbers are quoted as prior-base
  comparisons only, never as current — the pilot below
  re-measures them under the position instrument.

## Definitions (binding)

- COINCIDE: a villager node (or the player tile) equals the
  Herald tile (tx,ty) on the same census row.
- ADJACENT: Chebyshev distance 1 from the Herald tile (any of
  the 8 neighbouring tiles). Manhattan distance is also recorded
  on every row; adjacency is judged on Chebyshev, and the
  distinction is stated wherever it matters.
- DISTANCES: tile Manhattan distance (not detail coords).
  Haven distance = Herald tile to Haven tile
  (state.village px/py, default 4,4). Player distance = Herald
  tile to Game.map px/py. Nearest-villager distance = minimum
  over roster nodes.
- EDGE: lair tile with x in {0,8} or y in {0,8}. ON-MAP always
  holds by construction (0..8 clamp); the question is edge vs
  interior, recorded per located seed.
- LAIR: the Herald tile on its first census row (the placement
  say-line tile, cross-checked against the world entry).
  A later tile is a MOVE, not a new lair.
- VILLAGER PATH: the set of villager nodes occupied on any
  census row of the run (daily + tick rows). "Lair ever on a
  villager path" = lair tile appears in that set at any time
  (before, during, or after the located window — each timed).
- FIRST CONTACT: the first herald startCombat attempt (any
  class), herald fieldFight, herald muster snapshot, or herald
  muster verb on the seed, per heraldcontact-a's contact
  definition. The census runs to run end or first contact,
  whichever comes first; rows after a contact (if any) are
  still recorded but labelled post-contact and excluded from
  the window statistics.

## Instrument (NEW, env-gated, pure reads only)

- NEW scripts/heraldpos-instrument-20261031.js (HERALDPOS=1).
  Contract, following the herald-instrument-20261030.js pattern:
  every wrapper is call-through; the recorder writes ONLY to
  its own store object, never to Game.state; it draws zero RNG;
  it calls NO Game method (no npcNode — that helper CREATES a
  default nodePos entry; no worldMonsters() — that helper
  creates the array; no tileAt, scaleRank, or unlockedWave).
  All reads are direct property reads on Game.state,
  Game.map, and Game.data:
  - say wrapper: captures lines containing 'lair' or
    'HERALD'/'Herald' plus the live Herald entry, player tile,
    and Haven tile at that moment (placement-line capture).
  - sleep wrapper: ONE daily census row per sleep (day =
    scholar day at sleep entry, as in the herald instrument),
    with Herald tile + detail coords, player tile, Haven
    tile, all three distances, counts of villagers on /
    adjacent to the Herald tile, nearest villager node, number
    of villagers away from Haven, and the set of villager
    nodes occupied that day (as a compact node list).
  - wanderWorldMonsters wrapper: before/after Herald tile;
    a change is one MOVE row (day, from, to, step distance).
  - worldTick wrapper (after-call only): one tick census row
    per tile entry while a Herald entry exists (same fields
    as the daily row, compact, no node list). This catches
    intra-day coincidences that a sleep-only census would miss
    (a fight can remove/move the monster before sleep).
  - Sweep final snapshot: after runDays, before uninstall,
    one final row (run-end position) so the census covers
    placement..end even if the last day has no sleep.
- REUSED VERBATIM (not edited): scripts/herald-instrument-
  20261030.js (HERALD=1) for startCombat/fieldFight contact
  detection, and scripts/policies/muster-diag.js (MUSTER=1)
  for muster snapshots. Contact detection therefore uses the
  proven instrument, and the new file adds only position.
- NEW scripts/heraldpos-sweep-20261031.js: the
  heraldcontact sweep stack with the output dir changed to
  evidence/2026-10-31/perseed-heraldpos/leadfeast/, the
  HERALDPOS=1 guard added, the position instrument installed
  alongside the herald instrument, and the final snapshot
  taken. No other behavioral change; diff vs the
  heraldcontact sweep verified as exactly those changes.
- NEW scripts/heraldpos-analyze-20261031.js: per-seed
  placement table (lair tile, spoken-vs-entry agreement,
  player/Haven/villager distances at placement, edge flag,
  tile type from map tiles), movement table (moves, distinct
  tiles visited, max displacement from lair, days stationary,
  wander-attributed vs other moves), proximity table
  (coincide days, adjacent days, min distances over the
  window, lair-on-villager-path yes/no with timing), and
  first-contact determination. Wall numbers from the sweep
  header (national/table/won, wave reach, survival).
- NEW scripts/test-heraldpos-20261031.js: proof test on
  SYNTHETIC fixture rows only (no band seeds): placement
  parsing (spoken tile vs entry tile, agreement/mismatch),
  distance math (Manhattan + Chebyshev + edge), move
  attribution (wander row vs daily displacement), proximity
  counting (coincide vs adjacent vs neither), window
  statistics (located-window length, stationary share),
  and analyzer handling of a never-located seed (empty
  placement, no crash, no invented lair). Band seeds never
  appear in the proof test.
- TRAJECTORY-NEUTRALITY (det-gate, required): one judged
  located seed (87127, the longest located window) is re-run
  to a scratch dir with HERALDPOS unset (recorder never
  installed) and compared against the judged JSON on game
  trajectory only: daily dayHash hashes, gameDays, won,
  national, table, maxWave, endOmenStage, endOmenDay.
  Byte-identical trajectory = the recorder is neutral. Any
  divergence is a DIAG-NO-GO finding (recorder perturbs the
  game), reported loudly, not smoothed.

## Primary metric

Position-census completeness over located seeds: (a) a
placement row exists for every seed ending at omen stage 2
(spoken tile == world-entry tile, or the mismatch is
reported as a finding); (b) daily census rows cover every
sleep day from the placement day to run end (or first
contact) with no missing day; (c) a run-end final row exists.
Completeness = located seeds with (a)+(b)+(c) all satisfied /
all seeds ending at omen stage 2. Tick rows are a bonus
(intra-day resolution), not part of the completeness bar —
their absence on a seed never rescues or sinks it.

## Seeds (pre-registered, justified, not band-shopped)

- Pilot = the heraldcontact pilot seeds, in the same order:
  87104, 87115, 87119, 87127, 87137, 87140, 87109, 87120.
  Justification: direct comparability with the arm that
  posed the question, on the identical policy stack; the
  three located seeds (87115, 87127, 87137 on the prior base)
  are the windows this instrument must census, and
  re-measuring them on this base tests whether the windows
  reproduce before any new band is spent. The prior run's
  located status is a selection reason, NOT a judged result
  of this arm: this arm's verdict uses only its own census.
- Policy stack (identical to heraldcontact-a):
  withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1 + HERALD=1 + MUSTER=1 + HERALDPOS=1,
  200d death-aware cap.
- Confirm (ONLY if pilot located seeds < 2): the 11 un-run
  heraldcontact confirm seeds (87121, 87124, 87126, 87134,
  87107, 87135, 87132, 87123, 87103, 87138, 87128), run under
  the same stack and judged by the same bars. If pilot
  located seeds >= 2, NO confirm is run: the position
  question is answerable on the pilot windows, and spending
  a confirm to chase more windows would be band-shopping
  for a prettier N, not a decision need.
- If the pilot fails its instrument gate, the verdict is
  DIAG-NO-GO (see below). If the pilot yields 0 located
  seeds, the verdict is INSUFFICIENT-DATA — the band moved
  under the new base — and no confirm is run to chase a
  lair (a further band would be a new arm with its own
  prereg).

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot GO requires: instrument fires on all 8 pilot seeds
with zero instrument errors (herald + muster + position
instruments); per-seed JSONs valid (days > 0, census
sorted, position rows present from run start); AND the
position census is complete (primary metric) on every
seed that ends at omen stage 2. Contact is NOT required
to pass this gate — unlike heraldcontact-a, where contact
was the scarce thing, here the scarce thing is the
census itself, and a complete census of a contactless
window IS the answer to (b) and (c). If the pilot fails
on instrument grounds, the verdict is DIAG-NO-GO.

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: pilot gate passes, trajectory det-gate passes
  (byte-identical on 87127), completeness = 100% on located
  seeds, >= 2 located seeds censused, and the evidence
  states (a) the placement answer with seed-level numbers,
  (b) the movement answer with seed-level numbers (moves,
  distinct tiles, stationary share, wander attribution),
  (c) the proximity answer with seed-level numbers
  (coincide/adjacent days, min distances, lair-on-path),
  plus wall numbers on the pilot band. GO here means the
  position question is answered on >= 2 located windows.
- DIAG-GO-SINGLE-WINDOW (caveated GO, not full GO):
  completeness 100%, det-gate passes, but exactly 1 located
  seed censused (and the confirm rule above was followed:
  confirm run, still 1 located window total). The placement
  and movement answers are then single-window answers and
  the headline must carry that caveat.
- DIAG-NO-GO: completeness < 100% on located seeds, or
  instrumentErrors > 0 with no read-only explanation, or
  the det-gate diverges, or a required verdict section
  (a)–(c) plus wall numbers is missing, or the pilot fails
  on instrument grounds.
- INSUFFICIENT-DATA: fewer than 8 usable pilot seeds, or
  ZERO located seeds on the pilot (band moved), or pilot
  located = 1 with the confirm not run for a reason other
  than the prereg rule (then the shortfall is named, not
  hidden). A contactless but completely censused window is
  NOT insufficient data — it is the DIAG-GO answer to (b)
  and (c) when the census shows the Herald never came
  within reach.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to heraldcontact-a: the
located windows ran 8–36 days inside the cap, and a
shorter cap would censor the movement tail; the
death-aware stop keeps cost at the survival distribution.

## Panel (§15)

NOT APPLICABLE — single-base DIAG measurement, no
before/after comparison exists in this arm; none fabricated
(same declaration as mustercall-b/2, herald-b, and
heraldcontact-a).

## Sense-testing (SENSE-TESTING LAW)

Read the placement say-line and every escalation line the
position instrument captures, on each located seed, and
judge meaning, not counts: does "scouts found its lair —
tile X,Y ... It is WAITING. You cannot face it alone.
Sound the call" describe a meeting the village can
actually reach, given the censused distances and the
villager paths? Does an escalation line ("fed in the
night", "struck an allied village") read as the same
beast that never moves, or as a beast that arrives?
The transcript read is reported per located seed, not as
a single global line.

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the daily+tick census
  resolve movement, or did wander moves hide between
  rows? Did the spoken-vs-entry placement check agree?
  Did the det-gate hold with the heavier recorder?)
