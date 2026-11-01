# sim-heraldplace-a — preregistration: HERALD PLACEMENT VS WANDERING (DIAG ONLY, zero src/js)

Run: fleshout-loop-a (scale-onramp), worker branch sim-muster-a
(worktree slug unchanged; file prefixes pivoted to sim-heraldplace-a
per the coordinator's correction — this arm supersedes the
muster-formation census as the primary question; the muster census
itself was already completed on this branch before the correction
arrived, see sim-muster-a.md, and is NOT re-run as a primary here).

## Backlog grounding (read before sims)

- #1546 (answered 2026-10-30, sim-muster-a): a muster only exists
  when somebody presses 'Sound the call' / 'Commit Haven's blades'
  — no policy or game system ever does (0 calls over 20 seeds).
- #1591 (Loop B sim-mustercall-b, 2026-10-31): on seed 85106 a
  sounded call yielded 5 then 9 blades, ceilings >= 10, and a
  sounded call at the first day-112 refusal yielded exactly 9,
  +1 commit = ready 10/10, Herald fought same day and lost.
  Still needs steve-call #1538 (route on refused face? re-sound
  after a lost muster-fight?) before any routing build — this arm
  must NOT build routing.
- #1611/#1612 (sim-mustercall2-a, sim-heraldcontact-a): the
  mustercall-b headline is a SINGLE-SEED census; two later bands
  found 0 Herald contacts (contact, not the gate, is the scarce
  thing; day-90 win cluster censors the window). A pilot must be
  gated on a Herald CONTACT signal, not omen stage.
- #1617 (open, sim-heraldcontact-a): a located Herald (omen
  stage 2, lair placed) never contacts anyone in 30- and 36-day
  windows while wild wave-4 monsters contact repeatedly on the
  same seeds. Open measurement question: where does titanPlace
  put the lair relative to villager paths, and does the placed
  Herald move under monster-turn rules toward inhabited tiles or
  sit on its lair? This arm answers it with a position
  instrument, not a routing build.

## Primary question

Herald placement vs wandering, in order:
1. LAIR: where does `titanPlace` put the Herald — tile, distance
   from the Haven tile, distance from the scholar's tile at
   placement, tile type — and how does that relate to where
   villagers actually walk (NPC node occupancy)?
2. MOVEMENT: once placed, does the Herald move under
   monster-turn / world-wander rules toward inhabited tiles
   (scholar tile, Haven tile, NPC-occupied tiles), wander
   randomly, or sit on its lair? Classify every tracked day
   and every wander step.
3. CONTACT MECHANISM: what has to coincide for a contact
   (scholar steps onto the Herald's tile, Herald wanders onto
   a scholar/NPC tile, NPC on the Herald's tile at a
   villagerMonsterTick), and how often does each coincidence
   occur on contacted vs located-but-unfaced seeds?

## Mechanism read before sims (code, not conjecture)

- `titanPlace` (titans.js): placement tile =
  `titanPlacementTile(3)` — target = scholar position +3 east;
  nearest tile by Manhattan distance to the target, excluding
  the scholar's own tile, safe tiles (haven + other villages),
  and monster-occupied tiles. Placement happens at dawn via
  `titanDawnTick` -> `titanAdvanceOmen` (stage 1 -> 2).
- Tile movement is `wanderWorldMonsters` (game.js): each world
  monster (titans included — no titan exclusion in the loop)
  moves with p=0.35 per `worldTick`, one random adjacent step,
  never onto a safe tile, never onto an occupied tile, never
  off the 9x9. NO steering toward any target exists in this
  function. `worldTick` runs on tile entry only
  (checkEncounter), so wander opportunities arrive only when
  the scholar enters tiles.
- Detail-grid `monsterTurn` (game.js) drives only the
  player-tile monster (mx,my within the scholar's tile); it is
  NOT tile movement and is not the Herald's travel mechanism
  while it sits elsewhere.
- Villager contact is `villagerMonsterTick` (inside worldTick):
  for each world monster NOT on the scholar's tile, NPCs on
  that monster's node (`npcsOnNode(tx,ty)`) may fight, with a
  p=0.5 coin flip per tick. NPC nodes move via
  `npcNodeTravel` (once per day-part); NPCs default to the
  Haven node.
- Scholar contact is the scholar stepping onto the Herald's
  tile (then `playerMonster` / encounter / `startCombat`), or
  the Herald wandering onto the scholar's tile (announced:
  "Something pads into the clearing").

## Stack (named exactly — numbers NEVER compared across stacks/bases)

Substrate: `scripts/policies/tableseat-nowait.js`
(`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) — the titangate /
sim-muster-a stack, reused because the pilot band's contact
and located-unfaced behavior is already measured on it (see
Band), so the contact gate can be judged on this instrument's
own counts against a known-contact band.

Recorders, all REUSED UNMODIFIED:
- `fullseat-diag`, `wavegate-diag`, `vet2-diag`,
  `vet2mfg-diag` — end fields, unlock day, end snapshots only.
- `muster-diag` (`MUSTER=1`) — SECONDARY CHECK ONLY: verb
  counters + herald refusal snapshots on contacted seeds
  (see Secondary muster check). It is not the primary
  instrument of this arm.

New instrument files only (this arm; sim-heraldplace-a prefix):
- `scripts/sim-heraldplace-a-sweep.js` — sweep driver +
  sweep-side wrappers (pure observation: call through with
  identical arguments and return values, never mutate game
  state, never draw RNG, never throw into the engine).
- `scripts/sim-heraldplace-a-lib.js` — shared pure helpers
  (distances, step classification, day classification).
- `scripts/sim-heraldplace-a-analyze.js` — analyzer
  (per-seed + pooled + screen counts).
- `scripts/test-sim-heraldplace-a.js` — proof test
  (synthetic classification cases + corpus legs).

## Band, horizon, and the CONTACT-GATED pilot (fixed before sims)

Band (pilot): 8 seeds 95301–95308 — the FIRST HALF of the
vet2mfg/titangate band, FIXED in this prereg before sims.
This is not band-shopping: the band is chosen because prior
arms on this exact stack measured BOTH phenomena on it —
95304 contacted (29 herald refusals, titangate + sim-muster-a)
and 95301/95303/95305/95306/95307 located-but-unfaced
(sim-muster-a: herald omen stage 2, 0 contacts, windows 5–50
days). The gate below is judged on THIS instrument's own
counts, never borrowed from those arms.

Horizon: `DAYS=180`, death-aware (runDays ends dead villages
early) — identical to titangate/sim-muster-a, long enough to
reach a titan-gate/seat attempt.

CONTACT GATE (per #1611, tightened per heraldcontact-a):
the pilot passes iff >= 1 pilot seed records a Herald
CONTACT on this instrument (scholar startCombat attempt with
mid 'herald', OR villager resolveWildMonsterEncounter with a
herald monster). Omen stage alone does NOT pass the gate.
- If the gate passes: analyze all 8 pilot seeds (contacted +
  located-but-unfaced + never-located) and report the
  placement finding. No confirm band is pre-authorized by
  this prereg: a confirm would need its own prereg, since
  the placement question is answered-or-not on the pilot.
- If the gate fails (0 contacts on all 8 pilot seeds):
  verdict INSUFFICIENT-DATA for the contact-dependent
  questions (movement-on-contact contrast, muster
  generalization). Report the screen counts exactly as
  #1611/#1612 did (pool size, wins censoring, located-but-
  unfaced, contacted) and STOP — do not burn a confirm band
  on a contact-free base. The pilot's placement trajectories
  on located seeds are still reported as pilot data (they
  are not a confirm band), with the caveat that no contacted
  seed exists to contrast sit vs approach-on-contact.

## Counting rules (fixed before sims)

- Contact (scholar): one `startCombat` call with mid
  'herald'. Outcome subclass: fought (non-null return),
  refused (null return + titan outcomes 'refused' record),
  other (entry-refused / threw).
- Contact (villager): one `resolveWildMonsterEncounter`
  call whose monster id is 'herald'. (This is the router
  for wild villager fights; fieldFight resolves the rounds.)
- Contacted seed: >= 1 contact of either channel.
- Located seed: herald omen stage >= 2 at any time (lair
  placed — verified by a herald spawn event, not by omen
  alone when the two disagree; a disagreement is reported,
  not smoothed).
- Located-but-unfaced seed: located AND 0 contacts, with
  window = run-end day minus first-omen-2 day.
- Lair: the `spawnWorldMonster` event with id 'herald'
  (day, tx, ty, scholar tile at spawn, Haven tile
  (village px,py, default 4,4), tile type via `tileAt`,
  Manhattan + Chebyshev distances lair–Haven and
  lair–scholar-at-placement). A later herald spawn after a
  removal is a re-placement, recorded separately, never
  merged into the first lair.
- Daily position (dawn snapshot after `titanDawnTick`):
  herald tile or absent, scholar tile, Haven tile,
  Manhattan + Chebyshev distances herald–Haven and
  herald–scholar, NPC count on the herald tile
  (`npcsOnNode`), NPC node histogram (distinct occupied
  tiles; NPC count within Chebyshev <= 1 of the herald
  tile), cumulative worldTick count (for ticks/day).
- Wander step: `wanderWorldMonsters` before/after herald
  tile diff. Classification vs the scholar tile at that
  moment AND vs the Haven tile (report both; the primary
  is vs the scholar tile): approach (Manhattan distance
  to the target decreases), retreat (increases), lateral
  (unchanged), sit (no tile change — recorded per
  wander call in which the herald does not move, including
  p=0.35 skips and blocked steps, so sit is measured, not
  assumed). A dawn-to-dawn tile jump of Chebyshev > 1 is
  flagged TELEPORT (placement / repair / removal-respawn),
  never counted as a wander step.
- Day classification (per located day): CONTACT (a contact
  that day), APPROACH (net Manhattan distance to scholar
  tile decreased dawn-to-dawn and no contact), SIT (herald
  tile unchanged dawn-to-dawn), WANDER (tile changed but
  net distance to scholar unchanged or increased),
  ABSENT (herald not on the board). Days before placement
  and after removal are not classified (reported as
  pre/post counts).
- Villager paths (operational definition — "paths" is not a
  game object): (a) NPC node occupancy per dawn (which
  tiles NPCs stand on, how many NPCs per tile, how often
  any NPC stands on the herald's tile); (b) scholar dawn
  tile + scholar-tile visits to the herald's tile
  (contacts); (c) worldTick opportunities per day (how
  many tile-entry steps the scholar took, bounding how
  many wander chances the herald got). No path is invented
  from gossip, memory, or intent — only nodes and tiles.
- Screen counts (reported whatever the gate does): pool
  size (8), seeds won (and won exactly day 90), seeds
  surviving un-won past day 120, located seeds,
  located-but-unfaced seeds (+ windows), contacted seeds
  (+ contacts per channel), never-located seeds.

## Secondary muster check (only if a contact occurs)

On contacted seeds ONLY: record call-sounding
(muster-diag verb counters) and hypothetical muster yield
at contact/refusal days (same replication as sim-muster-a:
trust/opinion/arrears thresholds, base 2 / trusted 6 quotas,
free-face filter). Compare to mustercall-b's single-seed
headline (sounded call yielded 5 then 9, ceilings >= 10, 9
+ 1 commit = ready 10/10 on seed 85106) as a
generalization question, NOT a pooled number: mustercall-b
used the leadfeast stack, this arm uses tableseat-nowait,
so a difference is a stack/band difference until proven
otherwise, and a match on a second seed is still only 2
seeds, not a rule. If no contact occurs, this check is
vacuous (reported as such, never as 0% or as a
contradiction). NO routing is built under any outcome
(#1538 still pending).

## Pre-registered DIAG-GO bars (judge exactly against this)

DIAG-GO (placement finding) iff ALL of:
1. 8 pilot seeds, each complete (position capture +
   contact counters + end fields present, capture errors
   0 on every seed).
2. Contact gate judged as written above (>= 1 pilot seed
   with a contact on this instrument) — if it fails, the
   verdict is INSUFFICIENT-DATA for contact-dependent
   questions, NOT a failed DIAG-GO, and no confirm is run.
3. Lair position recorded on 100% of seeds where a herald
   spawns (spawn event with tile + both distances + tile
   type; any spawn without a recorded lair is a failure).
4. Daily positions recorded on 100% of located days
   (dawn snapshots present from first-omen-2 day to run
   end or removal; gaps listed with cause, never silently
   interpolated).
5. Movement classified on 100% of tracked days (every
   located day has a day class) and 100% of wander events
   (every before/after diff has a step class or a TELEPORT
   flag).
6. Screen counts reported exactly as listed above
   (pool / wins / located / located-but-unfaced + windows
   / contacted + per-channel contacts / never-located).
7. Recorder-neutrality leg: ON vs OFF end fields identical
   (days, gameDays, won, national/table flags, maxWave,
   endScaleRank, endReason) on 1 pilot seed (95304 — the
   expected-contact seed; the instrument must not move
   the run).
8. Determinism leg: one judged seed re-run to a scratch dir
   reproduces its judged per-seed JSON except for
   `anchorCommit` (which records the commit and may
   legitimately change if a commit lands between runs —
   any other field difference is a failure).
9. Proof test `scripts/test-sim-heraldplace-a.js` green
   (synthetic distance/step/day-classification cases +
   corpus legs re-deriving the verdict gates from the
   judged corpus).
10. Sense-test: at least one first-event transcript beat
    read for meaning in the evidence file (omen-2 beat on
    the contacted seed at minimum; longest-sit beat on a
    located-but-unfaced seed).

Panel (MEASUREMENT.md §15): NOT APPLICABLE — single-base DIAG
census, no before/after comparison exists in this arm; none
fabricated.

## Canon note

No dedicated titan/muster canon doc exists in docs/CANON.md's
manifest (checked 2026-11-01): the governing sources read
before sims are `src/js/titans.js`'s header (Titan class),
docs/MONSTER-WAVES.md (wave 4/5 gates), and the movement
functions cited above (`titanPlacementTile`, `titanPlace`,
`wanderWorldMonsters`, `worldTick`, `villagerMonsterTick`,
`npcNodeTravel`, `npcsOnNode`, `isSafeTile`). Nothing in this
arm invents canon; placement and movement rules above are
transcribed from those functions, not designed.

## Metric review (mandatory section in the evidence file)

Doubts go here, never into a re-score. Known in advance:
(a) Dawn snapshots miss intra-day position changes — the
wander-event log (before/after per worldTick wander call)
is the guard: any intra-day move is captured as a step
event even if the dawn tile is unchanged. (b) "Villager
paths" has no game object; the operational definition above
(nodes + tiles + tick opportunities) is the whole claim —
gossip, memory, and intent are not paths and are not
counted. (c) The scholar's tile at placement is read at the
spawn event; if the scholar moves between the dawn omen
advance and the spawn within the same tick, the recorded
scholar tile is the spawn-time tile, which is the one
`titanPlacementTile` actually used (it reads live map
position). (d) A herald that is removed (lostSight /
cleanup / slain) and later re-placed produces two lair
records; the analyzer never averages lairs across
placements. (e) Yield values on contacted seeds reuse the
sim-muster-a replication; a sounded call on a contacted
seed would let the replication be checked against a real
call — if that happens, any mismatch is reported, not
smoothed.
