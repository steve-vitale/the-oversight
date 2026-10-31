# sim-heraldpos-a — Herald POSITION census: lair placement, wandering, and reachability (MEASUREMENT ONLY)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1107Z.
Worktree branch: sim-heraldpos-a.
Base anchor: worktree HEAD at prereg time 772ac99d2; judged sweep
ran with the sweep file at sha256
ff07d2e280d60f7a25ad906946656c34ddd73ef18d81f2c766de7ba540841956
(see "Prereg deviations" — the sweep gained a write-retry and a
stdout-summary fallback after the prereg, for the EPERM flap; both
run after runDays and cannot move trajectories).
Pre-registration: evidence/2026-10-31/sim-heraldpos-a-prereg.md
(written BEFORE any judged sims; judged against it below, with
deviations recorded, not hidden).
Instrument: NEW scripts/heraldpos-instrument-20261031.js
(HERALDPOS=1, pure property reads only — no Game method calls, no
nodePos materialisation, zero RNG) + verbatim reuse of
scripts/herald-instrument-20261030.js (HERALD=1) and
scripts/policies/muster-diag.js (MUSTER=1) for contact detection.
Sweep: scripts/heraldpos-sweep-20261031.js. Analyzer:
scripts/heraldpos-analyze-20261031.js.
Proof: scripts/test-heraldpos-20261031.js — 39/39 green
(synthetic fixtures only, no band seeds), including an instrument
purity test on a fake Game (no nodePos created, no worldMonsters
array created, wander/say/sleep wrappers observe without causing).
Det-gate: scripts/heraldpos-detgate-20261031.js +
scripts/heraldpos-detgate-run-20261031.js — DETGATE PASS (see below).
Corpus: NO per-seed JSON files exist for this arm — the container
EPERM flap ate every file write (see "Prereg deviations"). The
judged record is the sweep's stdout: one full analyzer SUMMARY
per seed plus the daily dayHash HASHES, printed by the sweep
itself from the in-memory per-seed objects. A machine-readable
transcription of the 8 summaries (moves included) is kept at
evidence/2026-10-31/perseed-heraldpos/heraldpos-summaries.json,
labelled as transcribed from stdout, NOT as sweep JSONs. The full
per-seed JSON corpus must be re-run after the flap clears for the
persisted record; the verdict numbers below come from the complete
analyzer summaries, not from hand tallies.
No game code changed. No policy file edited. No [needs-eyes]
(measurement only, nothing player-facing). Panel (§15): NOT
APPLICABLE — single-base DIAG measurement, no before/after
comparison exists in this arm; none fabricated (same declaration
as mustercall-b/2, herald-b, and heraldcontact-a).

## Verdict: DIAG-GO

Judged exactly against the prereg:

- Pilot: 8/8 seeds ran, all three instruments fired with zero
  instrument errors on every seed (posErrors 0, heraldErrors 0),
  per-seed summaries valid.
- Located seeds: 3/8 (87115, 87127, 87137) — at or above the
  prereg's >= 2 bar — so NO confirm was run (prereg rule).
  Completeness on located seeds: 3/3 = 100% (placement row
  present with spoken == entry on all 3; daily rows cover
  placement..end with maxGap 1; final row present on all 3).
- Trajectory det-gate: PASS — seed 87127 recorder-ON vs
  recorder-OFF: 200/200 daily dayHash hashes byte-identical,
  and all outcome fields equal (gameDays 201, won 0, national 1,
  table 0, maxWave 4, w4Day 152, omen stage 2 day 165). The
  recorder-ON re-run also reproduces the judged pilot outcomes
  exactly, so the chain judged -> re-run -> recorder-off holds.
  The det-gate ran via in-memory child-process comparison
  (no file writes) because the flap blocked the prereg's
  scratch-dir variant; the comparison is equivalent, not weaker
  (same 200 hashes, same fields).
- All 8 pilot seeds reproduce heraldcontact-a's table exactly
  (gameDays, won, national, table, maxWave, w4Day, endOmenStage,
  endOmenDay) — a third independent run of the same band with
  the same outcomes, which is itself evidence the position
  instrument does not perturb trajectories.
- Required sections (a) placement, (b) movement, (c) proximity,
  plus wall numbers, are all present below with seed-level
  numbers. No required section is missing, no completeness bar
  is missed, no instrument error is unexplained.

## Answer in one paragraph

A located Herald is placed on Haven's own row, 3–4 tiles east,
and then random-walks — it never walks toward anyone, and nobody
ever walks onto it. On all three located seeds the lair line
speaks the exact tile the world entry sits on (7,4 twice; 8,4
once, on the east edge, where the 7,4 target was evidently
unavailable and the code's east tie-break pushed it outward),
the player is sitting at Haven (4,4) at placement on all three,
and no villager node ever occupies the lair tile on any day of
any run. After placement the Herald moves only by
wanderWorldMonsters drift — orthogonal, random, 0.35 per player
tile entry, never toward Haven: 5 moves in 8 days (87115), 9 in
36 (87127), 23 in 30 (87137), with 57–74% of days stationary,
and final tiles farther from Haven than the lair on two seeds
(87115: Haven-distance 3 → 6; 87127: 3 → 8) and adjacent to Haven
on the third only by random-walk luck (87137: 4 → 1, ending at
4,5 as the village died). Daily coincidence is zero on every
located seed — no villager, and never the player at sleep, ever
stands on the Herald's tile — while daily adjacency is common
(0, 5, and 4 days) and tick-row adjacency is frequent (3, 24,
and 12 rows): the beast is often NEXT to someone and never ON
anyone, and the game's only villager-meeting rule
(villagerMonsterTick) fires on same-tile coincidence only. So
the omen line's promise — "scouts found its lair... It is
WAITING. You cannot face it alone. Sound the call" — does not
match a reachable meeting: the call button points at a beast
nobody has seen, on a tile nobody's path ever includes, and in
74 combined located-window days (8 + 36 + 30) the Herald is
never met, never fought, and never even stood upon. The scarce
thing is not the muster gate downstream — it is the meeting
itself, and random wandering does not deliver it.

## (a) Placement — where titanPlace puts the lair

| Seed | Lair (spoken = entry) | Player at placement | Haven | Dist Haven | Dist player | Edge? | Tile type |
|---|---|---|---|---|---|---|---|
| 87115 | 7,4 | 4,4 | 4,4 | 3 | 3 | No | forest_floor |
| 87127 | 7,4 | 4,4 | 4,4 | 3 | 3 | No | forest_floor |
| 87137 | 8,4 | 4,4 | 4,4 | 4 | 4 | Yes (x=8) | forest_floor |

- Spoken == entry on 3/3. The say-line tile is the world-entry
  tile, not a rumour of one: the instrument reads the live entry
  at say time and all three agree.
- All three lairs sit on Haven's row (y=4), east of Haven, on
  forest_floor. That is exactly what the code predicts when the
  player is at Haven at dawn placement: target = player + 3 east
  = (7,4), and the closest free, non-safe, unoccupied tile wins.
  87115 and 87127 land exactly on the target. 87137 lands one
  tile farther east (8,4, the board's east edge): consistent
  with (7,4) being unavailable at placement (occupied or
  otherwise excluded) and the code's larger-x-first tie-break
  choosing (8,4) over (6,4) — stated as consistency with the
  code, not as a measured occupancy, because this instrument
  does not capture which tiles were occupied at placement
  (backlog item 2 below).
- Lair vs Haven: never the Haven tile itself (safe tiles are
  excluded by construction), never a village tile, always
  on-map (0..8 both axes). Edge only on 87137.
- Lair vs villager paths: NO villager node ever occupies any
  lair tile on any day of any run (lairOnPathDay null on all 3
  located seeds, searched over the whole run's daily node lists,
  not just the window). Villagers live at Haven; the lair is
  placed off Haven by construction, and no villager's path ever
  includes it.
- Placement days reproduce heraldcontact-a exactly (87115: 193,
  87127: 165, 87137: 106).

## (b) Movement — wander, not approach

| Seed | Window | Wander moves | Other moves | Distinct tiles | Max disp. from lair | Stationary share | Final tile (disp. / Haven-dist) |
|---|---|---|---|---|---|---|---|
| 87115 | 8d | 5 | 0 | 4 | 4 | 0.571 (4 stat / 3 changed) | 7,7 (3 / 6) |
| 87127 | 36d | 9 | 0 | 7 | 5 | 0.743 (26 / 9) | 8,0 (5 / 8) |
| 87137 | 30d | 23 | 0 (+1 unattributed, see below) | 11 | 6 | 0.567 (17 / 13) | 4,5 (5 / 1) |

- Every attributed move is a wanderWorldMonsters step:
  orthogonal, one tile, random direction. Zero moves are
  attributed to any other call, and zero moves are toward
  Haven in any directed sense — the paths are random walks:
  87115 drifts south down x=7 (7,4 → 7,5 → 7,6 → 7,7 → 7,8 →
  7,7); 87127 drifts east then north up the east edge
  (7,4 → 7,5 → 7,4 → 8,4 → 8,3 → 8,2 → 8,3 → 8,2 → 8,1 →
  8,0, the northeast corner); 87137 meanders across the
  eastern half (8,4 → 8,5 → 8,6 → 7,6 → 6,6 → 6,5 → 7,5 →
  7,4 → 7,3 → 7,4 → 7,3 → 8,3 → 7,3 → 7,4 → 7,5 → 6,5 →
  5,5 → 6,5 → 7,5 → 6,5 → 6,4 → 5,4 → [unattributed] →
  4,5 → 4,6 → 4,5).
- No monster-turn tile movement exists to find: monsterTurn
  moves detail coords (mx,my) within the player tile only,
  never (tx,ty). The daily census records detail coords but
  the verdict turns on tiles, and no tile change was ever
  observed outside wanderWorldMonsters except the one step
  below.
- The "WAITING" in the lair line is therefore wrong as a
  stationary claim (the Herald moves on most windows: 5, 9,
  23 steps) and right only in the narrow sense that it never
  approaches: its distance from Haven grows on 87115 (3 → 6)
  and 87127 (3 → 8), and on 87137 it ends adjacent to Haven
  (distance 1) purely by random-walk luck, on the day the
  village dies, without ever meeting anyone.
- UNATTRIBUTED STEP (flagged, not explained away): on 87137,
  between the day-132 wander row (… → 5,4) and the day-133
  wander row (4,5 → 4,6), the tile changes 5,4 → 4,5 — a
  diagonal step no wander call produces (wander moves
  orthogonally only). Excluded by measurement: mFlee
  relocation via the fieldFight routes (0 Herald field fights
  on the seed, and both wild and patrol resolvers route
  through Game.fieldFight, which the instrument wraps), and
  startCombat lifts (0 Herald attempts). Remaining code paths
  that move a world monster diagonally exist (spawn-displacement
  shove, tbEnd restore) but the instrument as built cannot
  distinguish them, and the 3 tick-coincide rows on this seed
  (see (c)) are consistent with — but do not prove — a
  player-tile interaction. One step in 37 total moves does not
  change any verdict; it is carried as backlog item 1.

## (c) Proximity — adjacent often, coincident never, contact never

Daily rows are one per sleep (distinct days); tick rows are one
per player tile entry (rows, not days — a day can contribute
several). Row counts merge player + villager coincidence /
adjacency (see "Prereg deviations": the analyzer counts a row
once per source, so a row can count twice); day counts are
distinct days and are the primary columns.

| Seed | Daily coincide days | Daily adj days | Tick adj rows | Tick coincide rows | Min nearest (daily / tick, Manhattan) | Lair on path? | Herald attempts / field fights |
|---|---|---|---|---|---|---|---|
| 87115 | 0 | 0 | 3 | 0 | 3 / 1 | No | 0 / 0 |
| 87127 | 0 | 5 (165,169,170,177,183) | 24 | 0 | 1 / 1 | No | 0 / 0 |
| 87137 | 0 | 4 (127,132,133,136) | 12 | 3 (unattributed, see below) | 1 / 0 | No | 0 / 0 |

- Daily coincidence is ZERO on every located seed: at no sleep
  does any villager node, or the player tile, equal the Herald
  tile. The player never stands on the Herald tile at any sleep
  on any located seed (playerCoincide contributes to the same
  daily count and it is 0 throughout).
- Daily adjacency is common once the window is long: 5 days on
  87127, 4 on 87137 (0 on the 8-day 87115 window). Tick-row
  adjacency is frequent everywhere (3/24/12 rows): villagers
  and/or the player pass next to the Herald constantly without
  ever stepping onto it.
- The 3 tick-coincide rows on 87137 are the only coincidence
  rows in the whole pilot, and they are UNATTRIBUTED: the
  analyzer's tick aggregate merges player coincidence and
  villager coincidence, and the raw tick rows are in the lost
  per-seed JSONs, not in the stdout summary — so these 3 rows
  cannot be split into "a villager stood on the Herald" vs
  "the player stood on the Herald" from this arm's record.
  What CAN be said: no field fight followed from them
  (heraldFieldFights 0), no startCombat attempt followed
  (0), and no daily row ever shows coincidence — so whatever
  coincided at a tile-entry moment did not become a meeting
  the game acted on. If they were villager coincidences, the
  villagerMonsterTick 0.5 roll missed 3 times in a row
  (p = 0.125) or the villagers were ineligible (sheltered /
  post-flee resting — eligibility is not captured by this
  instrument); if they were player coincidences, no combat
  trigger fired. The next instrument must split player vs
  villager coincidence and capture eligibility (backlog 1).
- First contact: NONE on any pilot seed, by any channel
  (0 startCombat attempts, 0 field fights, 0 muster snapshots,
  0 muster verbs for the Herald). The omen say-line therefore
  does NOT match a reachable meeting: it gives the player exact
  tile coordinates, but under this policy the player never
  walks to them, no villager's path ever includes them, and
  the game's meeting rule (same tile + worldTick) is never
  satisfied on a daily row in 74 located-window days.
- Escalation is the only thing the located Herald DOES to the
  world, and it does it remotely: 87115: 2 fed lines, both
  0 kcal (days 193, 198); 87127: 8 lines — fed 0 kcal ×3
  (165, 175, 180), struck Thornfield trust −5 ×3 (170, 185,
  200), struck Emberhold −5 (190), fed 160 kcal (195):
  total trust −20, kcal 160; 87137: 7 lines — struck
  Stonebridge, Emberhold, Thornfield, Emberhold, Thornfield,
  Thornfield (106–131, −5 each, total −30), fed 0 kcal (136).
  A beast that "strikes villages in the night" while never
  visiting any tile a villager stands on is a remote tax, not
  an arrival — and "fed in the night — 0 kcal gone" claims
  eating while taking nothing (4 of the 6 fed lines are 0).

## Wall numbers (pilot, 8 seeds)

| Measure | Pilot |
|---|---|
| National reached | 8/8 |
| Table reached | 2/8 |
| Won | 2/8 (days 121, 146 — both table-flagged) |
| Wave 4 reached | 4/8 |
| Wave 5 reached | 0/8 |
| Median survival | 184 days; max 201 |
| Herald contacts | 0/8 seeds; 0 attempts; 0 field fights |
| Located-but-unfaced | 3/8 (windows 8, 36, 30 days) |
| Located census completeness | 3/3 = 100% |

Plain-words read: the same strong villages as heraldcontact-a
— every one national, half alive at the cap — and the Herald
chapter stays unopened for the same reason, now measured at
tile resolution: the lair is placed where nobody walks, the
beast drifts randomly instead of approaching, and the meeting
rule demands a same-tile coincidence that 74 window-days never
produce. Adjacency is not scarcity of opportunity — villagers
are next to the Herald on 9 distinct daily days across the
located seeds — it is that adjacency is not a meeting in this
engine, and coincidence is what random walk plus Haven-bound
villagers almost never supply.

## Village assessment — what the villages looked like

- 87104 (201d, survived, national, wave 3): the quiet endurer,
  no omen, no Herald at all. National without wave 4, again.
- 87115 (201d, survived, national, wave 4 day 148): located the
  Herald on day 193 and lived 8 more days; the Herald drifted
  south down x=7 to the south edge and back, never adjacent on
  a daily row, never met. 2 remote fed lines, both 0 kcal.
- 87119 (167d, died, national, wave 2): national rank, wave 2,
  no omen — scale without wave progression, ending in death.
- 87127 (201d, survived, national, wave 4 day 152): the longest
  window and the cleanest answer. Herald located day 165,
  random-walked to the northeast corner (8,0) over 36 days,
  adjacent on 5 daily days, coincident on none, fought never —
  while the village absorbed 8 remote escalation lines
  (−20 trust, 160 kcal) from a beast walking away from it.
- 87137 (136d, died, national, wave 4 day 82): the fighting
  village. Herald placed on the east edge (8,4), meandered
  23+ steps across the eastern half to end adjacent to Haven
  (4,5) on the day the village died — adjacent on 4 daily
  days, coincident on none of them, fought never, while 6
  remote trust strikes (−30) landed on its allies.
- 87140 (201d, survived, national, wave 2): the quietest
  village — national, cap-surviving, wave 2, no omen.
- 87109 (121d, won, national, table, wave 3): won without wave
  4 and without any omen. The win road does not need the Herald.
- 87120 (146d, won, national, table, wave 4 day 144): won two
  days after unlocking wave 4 — the win closed the titan road
  before the omen could stage, as in heraldcontact-a.

Who thrived and who died and why, in one line: the strong
villages won lesser or endured at national without the titan;
the fighting village died against other wave-4 monsters while
the Herald random-walked past it; nobody's story touches the
Herald at all. Knowledge/capabilities missing: not blades, not
trust, not buttons — a meeting. The blank this arm fills is the
position mechanism behind heraldcontact-a's emptiness: the lair
is off-path, the beast drifts rather than approaches, and the
meeting rule is same-tile coincidence.

## Sense-testing read (SENSE-TESTING LAW)

- The lair line, identical on all 3 located seeds except the
  tile ("Scouts found its lair — tile 7,4 / 8,4. THE HERALD —
  the sky, getting bigger. It is WAITING. You cannot face it
  alone. Sound the call."), reads as a promise of an imminent,
  locatable meeting. Measured against the census it is
  half-true in a way that misleads: the tile is exact and the
  beast is really there, but "WAITING" describes a stationary
  guardian and the beast is a random walker (up to 23 steps in
  30 days, 5 tiles from its lair at the end), and "Sound the
  call" addresses a player who, under this policy, never walks
  to the tile and whose villagers never go near it on purpose.
  A player following the line literally — walking to 7,4 —
  would find the beast gone on most days (it sits on its lair
  on only 57–74% of days, and its lair tile is never a villager
  destination). The line is honest about WHERE, misleading
  about STILL.
- The escalation lines read as a different beast from the lair
  line: a Herald that "fed in the night" for 0 kcal four times
  out of six is narrating a meal it did not eat, and a Herald
  that "struck Thornfield in the night" while its census tile
  sits 5+ tiles from any villager is narrating a visit it did
  not make. The costs are real (trust −5 per strike, 160 kcal
  once on 87127) but the visits are not: the escalation is a
  clock tax with a monster's name on it, not an arrival. That
  mismatch — a present-tense attacker who never arrives — is
  the sense failure this census makes visible: the village is
  taxed for deliberating about a beast it has never seen, and
  the tax does not bring the beast any closer.
- What reads as people, not counters: nothing in the Herald
  record does, because the Herald never interacts — but the
  villages around it do. The census's villager-node lists show
  villagers moving, foraging, and dying elsewhere while the
  Herald drifts; the absence of any villager path through the
  lair is itself the human story: nobody goes looking for the
  thing the sky is warning them about, because nothing in the
  game tells a villager to go to a tile — villagers go to
  Haven, to forage nodes, to each other, never to a lair.

## Metric review (for the NEXT run)

1. The daily + tick census resolved movement: every located
   window's wander path is fully attributed except one step
   (87137's diagonal), and the spoken-vs-entry placement check
   agreed 3/3. The tick census proved its worth: 87115 shows
   ZERO daily adjacency days but 3 tick adjacency rows — a
   sleep-only census would have understated proximity and
   missed the "adjacent often, coincident never" shape.
2. The completeness rule's gap allowance (<= 2) never bound:
   maxGap was 1 on all three located windows. The rule is
   kept, not tightened on this evidence alone.
3. The det-gate held with the heavier recorder (200/200 daily
   hashes identical, recorder-on vs recorder-off, seed 87127).
   The heavier census (tick rows, node lists) does not move
   trajectories — the prereg's purity rule (no Game method
   calls, no nodePos materialisation) is validated by that
   result, not just asserted.
4. METRIC GAP (fix for the next arm): the analyzer's proximity
   aggregates merge player coincidence/adjacency with villager
   coincidence/adjacency in row counts. Day counts are clean
   (distinct days), but the 87137 tick-coincide rows (3) cannot
   be attributed to player vs villager from this arm's record,
   and eligibility (sheltered / post-flee resting) is not
   captured at all — so "coincidence without a fight" cannot be
   split into "roll missed" vs "ineligible". Next position
   instrument must record player-coincide, villager-coincide,
   and per-villager eligibility separately on every row.
5. The stdout-summary corpus (deviation 1) is a complete
   analyzer record but not a re-analyzable corpus: raw daily /
   tick rows are lost with the per-seed JSONs. Any next arm
   that needs row-level re-analysis (e.g. attributing the
   87137 tick coincidences) must re-run the seeds after the
   flap clears; it cannot recover rows from the summaries.

## Prereg deviations (recorded, not hidden)

1. CORPUS IS STDOUT, NOT FILES. The first pilot attempt
   (pre-retry sweep) lost 4/4 per-seed JSONs to the container
   EPERM flap: file created, write(2) EPERM, 0-byte file left.
   A probe confirmed the flap widened beyond evidence/ to /tmp
   and the worktree, and a single-seed retry with 90 write
   attempts failed 90/90. The judged pilot therefore ran with
   a sweep amendment (below) that prints the full analyzer
   SUMMARY plus dayHash HASHES to stdout per seed; all 8
   summaries were captured, and all verdict numbers come from
   them. Per-seed JSONs were attempted 10 times per seed
   (WRITE_RETRIES=10) and failed 8/8. The persisted corpus
   must be re-run after the flap clears; until then the
   summaries file (transcribed from stdout) is the record.
2. SWEEP AMENDED AFTER PREREG (tooling only, trajectory-neutral
   by construction and by det-gate): (a) per-seed JSON write
   retry loop (90 attempts default, WRITE_RETRIES env) that
   deletes partial 0-byte files on failure so a flap artifact
   can never pass as data; (b) stdout SUMMARY + HASHES fallback
   on write failure, computed by the pure analyzer over the
   in-memory per-seed object (never a second sim); (c) the
   instrument label corrected to
   'herald-v1+muster-diag+heraldpos-v1'. All three run after
   runDays completes for the seed and cannot affect any
   trajectory; the det-gate (200/200 hashes) covers the
   instrument, and the 8/8 exact reproduction of
   heraldcontact-a's table covers the sweep.
3. DET-GATE VARIANT: the prereg's scratch-dir JSON comparison
   was replaced by an in-memory child-process comparison
   (recorder-ON sweep child vs recorder-OFF runner child, both
   stdout, no file writes) for the same flap reason. Same
   seed (87127), same 200 daily hashes, same outcome fields —
   equivalent, not weaker.
4. COMMIT DEFERRAL: the sweep amendments, det-gate scripts,
   and this evidence file could not be committed at run end
   if the flap still blocks safe-commit's /tmp index writes
   (12 consecutive safe-commit attempts failed on
   '/tmp/idx-safecommit-*.lock' EPERM before the pilot; the
   coordinator must verify commit state on merge — see the
   worker report for exact hashes and status).
5. CONFIRM NOT RUN: per the prereg rule (located >= 2 → no
   confirm). Located = 3, so the 11 un-run heraldcontact
   confirm seeds were not spent.

## Backlog items (for the coordinator — NOT appended to sim-findings.md by this arm)

1. Herald position instrument gaps (next arm, measurement):
   split player vs villager coincidence/adjacency on every row;
   capture per-villager eligibility (sheltered, post-flee
   resting) on tick rows; capture tile occupancy at placement
   (which tiles were excluded and why, to explain edge lairs
   like 87137's 8,4); attribute the 87137 diagonal step
   (5,4 → 4,5) — candidates narrowed to non-fieldFight movers,
   still unattributed. Do NOT build a routing/call fix here:
   backlog #1538 ruling still pending, and this arm shows the
   binding constraint is the meeting, not the call.
2. Lair-at-edge mechanism: 87137's lair (8,4) is the only edge
   lair in the pilot; the code's east tie-break plus an
   unavailable (7,4) target explains it, but occupancy at
   placement was not captured. A placement-occupancy capture
   would turn the consistency argument into a measurement.
3. Escalation as remote tax (design question, not a build):
   a located Herald taxes trust (−5/strike, −20 to −30 per
   window here) and sometimes kcal from villages it never
   visits, while its lair line promises an arrival. Whether
   remote strikes are intended, or whether escalation should
   require proximity, is a design call the census cannot make
   — but the census shows the tax and the meeting are
   decoupled: the tax arrives on schedule (every 5 days)
   whether the beast approaches or not.
4. The meeting rule itself (the finding downstream of this arm):
   adjacency is common (9 distinct daily days across located
   seeds, 39 tick rows) and coincidence is ~never (0 daily
   days, 3 unattributed tick rows). Any future Herald
   reachability work — routing, call, or movement — must
   first decide what counts as a meeting: same-tile coincidence
   under random walk does not deliver one in 74 window-days.
   That decision belongs with the #1538 ruling, not with a
   worker arm.
