# sim-w4channel-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261027T2147Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4channel-a.
Worktree: `~/workspace/worktrees/sim-w4channel-a` (branch sim-w4channel-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
wave-4 encounter→kill conversion census by channel, with killer
identity first-class, on the current census-family substrate. This arm
answers the 2036Z round's top blank (run fleshout-20261027T2036Z,
evidence/2026-10-27/sim-scale-onramp-round-2036.md): faced → engaged
→ killed, by channel. It does NOT re-ask survivorship (vetsurvive-a
settled that: killers live; kills are scarce, 7/24 villages in the
2036Z pooled run) and does NOT re-ask the world-funnel outcome split
(w4funnel-a: 11 arrivals, 9 never-fought, 2 fought-and-survived, only
kill non-world). It asks, for THIS band: which channels do wave-4
encounters and kills actually travel, and who kills?

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave 4 = the
  Mirror Draft, standing >= 100; readiness gates hold waves 4-5:
  wave-5 demands 4 armored @ P>=15 / 6 armed / 3 tricks / 2 living
  wave-4 killers; VETERANS = living roster members with a recorded
  kill of a wave-(w-1)+ monster — the readiness veterans bar counts
  LIVING killers only, so a killer's death un-counts the kill;
  VILLAGER XP LAW: a villager's real blow-by-blow fight feeds the
  deed bars exactly like the player's, and villager KILLS score the
  ledger exactly like the player's; engagements feed the endgame
  deed bars only, never wave unlocks).
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels).
- No canon invented. Where code and canon wording differ, the code
  reading below governs the census and the difference is reported.

## Prior evidence read first (this arm's question comes from these)

- evidence/2026-10-25/sim-w4funnel-a.md (+ corpus
  perseed-sim-w4funnel-a/): the prior funnel — 11 wave-4 world
  arrivals, 9 never-fought, 2 fought-and-survived, 0 killed from
  arrivals, the band's only wave-4 kill non-world (73678 d115
  strike, scholar, via 'player', no birth/removal/tbEnd-origin).
  Its recorder stack and outcome-class vocabulary are reused here
  (see below).
- evidence/2026-10-25/sim-nonworldkill-a.md (+ corpus
  perseed-sim-nonworldkill-a/): non-world kill / TB melt classes —
  the band's only wave-4 kill came through the feast-draw door;
  113 TB initiations, 0 unclassified; null-origin TB fights are
  29/113 (25.7%), not an edge case; bystander melts (origin
  mismatch lifts deleting unfought monsters) are a documented
  observation, not chased here.
- evidence/2026-10-27/sim-scale-onramp-round-2036.md +
  sim-vetsurvive-a.md + sim-standmeet-a.md + their preregs (the
  current census family): kills are scarce, 7/24 villages in the
  pooled 2036Z run; killers live; scholar is the only recorded
  killer identity in the family; villagers face wave 4 and kill
  nothing (vetsurvive: 74802/74807 faced 3 kinds each, 0 kills).
- evidence/2026-10-27/sim-vetsurvive-a-prereg.md: the substrate
  source (see "Substrate" below — copied exactly).

## Band freshness — disclosed, not assumed

- Judged band: 75101-75108, as assigned. Freshness check against
  committed evidence/2026-10-27/ BEFORE sweeping: these seeds were
  never censused for wave-4 encounters, kills by channel, or
  killer identity — the quantities this arm measures do not exist
  for this band anywhere in committed evidence. (A filename grep
  for "7510" over evidence/ returned no prior corpus for these
  seeds; the full grep result is recorded in the evidence file
  after the sweep, and any hit found later is disclosed there,
  never silently absorbed.)
- Framing, stated up front so it cannot be mistaken for a claim:
  this band is FRESH FOR THE CHANNEL CENSUS (new quantities,
  never measured on these seeds). The judged verdict below is
  judged ONLY on this run's census. Prior bands appear as
  comparison columns only, never re-scored.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (the w5block/w5twokey/w5seq/vetsurvive/standmeet substrate, so
  wall numbers compare in shape).
- NEVER edited: tableseat-nowait.js, leanlinkrescue.js, any
  recorder file, or any src/js file. New instruments only:
  scripts/test-w4channel-a-sweep.js (channel census sweep, the
  w4funnel-diag sweep copied with the nonworldkill recorder
  composed outermost — as in the nonworldkill sweep — plus a
  vetsurvive-style wall/killer snapshot),
  scripts/test-w4channel-a.js (proof validator / analyzer),
  scripts/test-w4channel-a-sense.js (non-measured sense replay,
  one seed's wave-4 thread).
- Recorders reused verbatim, policy-side only, never edited:
  scripts/policies/raftdraft-diag.js (raid draft census + final
  waveKillLog snapshot + fieldFights, type-only, no seq),
  spawnsrc-diag.js (birth source + seq tags),
  oldcore-diag.js (birth -> removal fate per entity instance,
  seq linkage, tbEnds),
  w5births-diag.js (daily rd5.veterans = the gate's own
  living-veteran count, plus spawn targets),
  defwound-diag.js (resolve rows per entity instance, seq
  linkage — REQUIRED for the engaged stage: raftdraft
  fieldFights carry monster type but no seq, so without
  defwound a villager/defender fight that the monster
  survives leaves no per-entity trace at all; defwound wraps
  resolveWildMonsterEncounter only, records after delegating,
  and never touches oldcore's flag wrap semantics),
  nonworldkill-diag.js (TB initiation census: startCombat /
  tbEnd rows joined by fight id, door + origin per fight —
  REQUIRED for the non-world-TB channel: without it a TB kill
  with via 'player' cannot be told world-origin from
  null-origin, and the w4funnel strike class is unmeasurable).
  No recorder draws RNG, throws into the engine, or returns
  anything but the original value.

## Full env set (inherited gates included)

- Env vars set by the sweep before each loadGame:
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT deleted
  (the vetsurvive prereg's exact game-policy env set),
  PLUS recorder on-switches (recorders only, never game
  levers): RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1,
  DEFWOUND=1, NONWORLDKILL=1.
  loadGame mode label 'w4channel-a' (a manifest label only —
  sim-harness.js reads mode into the manifest, never into game
  state or RNG; game RNG is seeded from the seed alone).
- Policy RNG: sim-harness seeds global.__policyRandom from the
  seed (unchanged from w5seq/vetsurvive).
- Writer: direct writeFileSync with retry loop (same pattern as
  the w4funnel sweep — a write flap cannot silently lose a row;
  every row is re-read by the analyzer, which fails loudly on a
  missing or unparseable row).
- Read discipline (same as w4funnel/vetsurvive, unchanged): the
  sweep-side snapshot uses ONLY pure reads (deedState wavesFaced,
  waveKillLog, waveCombatReadiness, roster/vpOf/disp for killer
  identity, tableState). It NEVER calls villageStandingTotal()
  or unlockedWave() mid-run. The engine's own numbers are called
  once at end (waveReach from the harness) and checked by the
  validator where a check exists.

## Substrate-activation gate (rule3trial lesson — binding)

Same gate as vetsurvive-a, checked by the validator from the
recorded policy ctx counters (courtCounters, courtAccords,
courtNational, courtGlobal, tended, defenseCalls, proposedLead
— all captured in full in every row):

- GATE (band-level, binding): combined courtship activity
  (sum of all seven counters over the band) > 0 AND at least 6/8
  seeds show non-zero combined courtship activity.
- If the gate FAILS, the sweep is INVALID (not NO-GO): no verdict
  is judged, the failure is reported loudly, and the run stops
  for an env fix. Per-seed courtship counters are tabulated in
  the evidence regardless, so a single quiet seed is visible
  even when the band gate passes.

## Definitions (fixed BEFORE sweeping — the analyzer repeats them)

- ARRIVAL = one world-monster birth with wave 4 (oldcore birth
  joined to its spawnsrc spawn on seq; a fled-recovery re-entry
  is a NEW arrival with its own seq and source 'fled-recovery',
  reported separately so fresh arrivals and all arrivals both
  reconcile). Raid draft is NOT a birth source — it selects
  already-born pool entities at raid time; the census verifies
  that (every wave-4 raider traces to a spawn) rather than
  assuming it.
- FACED — READ THIS FIRST, because the engine's "faced" and the
  funnel's "faced" are different shapes, and this census reports
  both without conflating them:
  - FACED-TYPE (the engine's faced): a distinct wave-4 monster
    TYPE present in deedState().wavesFaced at end (recordDeedFight
    fires on a real blow-by-blow fight — startCombat / fieldFight
    / recordWaveKill — never on a sighting, a pool presence, or
    a raid draft). Counted per TYPE, never per instance: two
    instances of one type faced = 1 faced-type. This is the
    deed-bar quantity (deed w4 >= 3 types).
  - FACED-INSTANCE (the funnel's faced): UNMEASURABLE as a
    distinct stage for world arrivals with the existing
    recorders, and this census says so rather than inventing
    it. There is no sighting, proximity, or "monster seen but
    not fought" recorder: a world monster enters the deed feed
    ONLY by being fought blow-by-blow, so "faced but not
    engaged" has no per-instance instrument. The census
    therefore does NOT report a faced-instance count. Its
    measurable proxy, reported in its place and labelled as
    such, is NEVER-ENGAGED arrivals (arrivals with zero
    seq-linked fight rows — the w4funnel "never-fought" class).
    Any future arm that wants a true faced-instance stage
    needs a new sighting recorder; that is a tooling blank,
    not a number in this census.
- ENGAGED = an arrival with >= 1 seq-linked fight row: a
  defwound resolve row with seq == the arrival's seq, OR an
  oldcore tbEnd with seq == the arrival's seq, OR a nonworldkill
  TB start whose tileMonster.seq == the arrival's seq. A
  raftdraft fieldFight with the arrival's TYPE but no seq is
  reported as UNLINKED-FIGHT (counted, never attributed to an
  arrival). An engaged arrival's fight rows are its engagement
  record; engagement is counted per arrival (engaged yes/no)
  AND per fight row (rows per arrival, for the "fought N
  times, killed 0" shape).
- KILLED = one waveKillLog entry with w == 4 (the single kill
  choke point, recordWaveKill). A kill is attributed to an
  arrival ONLY when a seq-linked fight row and the log entry
  join (same seed, same type, kill day >= first fight day for
  that arrival, and — for TB kills — the nonworldkill end row's
  newLog entry for that fight). A log entry with no joining
  arrival is a NON-ARRIVAL KILL (the w4funnel strike class),
  channelled by its own fight row, never forced onto an
  arrival. A kill whose via is 'contest' with no TB row is a
  contest kill, not a TB kill.
- CHANNEL vocabulary (mutually exclusive per fight row / kill,
  in the precedence below; every wave-4 fight row and every
  wave-4 kill gets exactly one channel; `other` rows are
  counted and investigated, never hidden):
  - player-tb-world: a TB fight whose nonworldkill origin is
    world-origin (a world monster sat on the player tile and
    its id == the fight's monster), OR an oldcore tbEnd with
    kind player-fight-kill / player-fight-melt on a world
    arrival. The scholar's turn-based fight against a world
    monster.
  - non-world-TB: a TB fight whose nonworldkill origin is
    null-origin (no world monster on the player tile at call)
    — the w4funnel strike class. Its DOOR (nonworldkill
    classification: feast-draw / tent-intruder /
    door-flee-reengage / glasswing-trap / world-bump /
    wanderer-pending / contest-arena / policy-direct / other)
    is reported as a sub-channel, never as a second count.
    A null-origin TB fight is NEVER also counted as
    player-tb-world.
  - villager-field: a defwound resolve row with context
    'field' (raid false), OR an oldcore kind
    villager-fight-kill not in a raid context. Log vias
    'wild' / 'patrol' map here when a seq-linked row joins.
  - raid-defender: a defwound resolve row with context 'raid'
    (raid true), OR an oldcore kind raid-defense-kill.
  - trap: an oldcore kind trap-capture, OR a nonworldkill
    door glasswing-trap on a null-origin fight (trap-spawned
    monster fought in TB — counted here, not as
    non-world-TB, when the door is glasswing-trap; the
    precedence below settles it).
  - contest: a waveKillLog entry with via 'contest' (contest
    engine field-fight kills), or a nonworldkill door
    contest-arena TB fight that is NOT world-origin
    (arena TB kills log via 'player' through the tbEnd kill
    loop — the nonworldkill correction — so door, not via,
    decides this channel; a world-origin arena fight stays
    player-tb-world).
  - other: aid-crisis (via 'aid-crisis'), lingerer sortie
    (via 'sortie'), companion killing blow inside a TB fight
    (via 'companion' — reported with its TB fight's channel
    as context, counted once under other), agency, and any
    fight row / log entry matching none of the above (its
    via + door + kind are printed in full).
  - Precedence (only when several signals fire — every signal
    is still recorded per row): trap > contest-arena-door
    (non-world) > non-world-TB (null-origin) >
    player-tb-world (world-origin TB) > raid-defender >
    villager-field > other. A row's channel is single; its
    door/kind/via are all retained for audit.
- KILLER IDENTITY (first-class, per wave-4 kill):
  - scholar-player: log `by` == the end scholar vid
    (Game.villagerId at end; the scholar counts living by
    definition under the gate rule).
  - villager: log `by` is a non-scholar vid with a person
    record (disp name at end; roster/vpOf presence recorded).
  - player-literal: log `by` is literally 'player' (NOT
    assumed to be the scholar — reported as its own class;
    the gate does not count it unless villagerId is
    literally 'player').
  - unknown: log `by` null/missing (the gate skips null-by
    entries outright — reported, never filled by guess).
  - Living-at-end per killer uses the GATE's own living rule:
    scholar vid at end counts living by definition; otherwise
    vpOf(vid) exists and is not dead. A killer who was scholar
    at kill time but died and was succeeded is NOT the end
    scholar vid, so they count dead unless their person
    record says otherwise. Living status is recorded per
    killer at end AND per kill (killer identity + living
    flag travel together in the per-kill table).
- OUTCOME classes for arrivals (w4funnel vocabulary, reused):
  killed-by-player-fight, killed-by-villager-fight,
  killed-by-defender-fight, killed-other-cause, departed,
  fled-record, melted, still-present, pending-in-fight,
  unknown — in the w4funnel precedence order, with
  still-present beating any earlier removal and re-appearance
  after a removal cancelling the exit. Outcome is computed
  from the oldcore removal kind + tbEnd settlement, exactly
  as in w4funnel-a; the channel census adds the fight-row
  channel to each outcome, it does not replace the outcome.
- WALL NUMBERS (every run reports these): national ever/final,
  table invited (tableWaiting ever) / entered (tableDone ever),
  wins (lesser/full split via tableState.seat), wave-4 unlock
  (waveReach >= 4 or engine wave), wave-5 unlocks, median
  survival (days), death-cause shares (harness live-death
  capture, player:/villager: prefixed).

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the wave-4 channel census on this band.

GO RULE (census, judged ONLY against this prereg):
  (a) 8/8 configs valid (row per seed, days > 0, every gate +
      deed + channel field present, no recorder errors);
  (b) >= 95% of wave-4 arrivals classified into a known outcome
      (unknown counted, never hidden);
  (c) channel attributed for >= 90% of wave-4 fights (fight
      rows with wave 4, all recorders) and 100% of wave-4 kills
      (every waveKillLog entry with w == 4 gets exactly one
      channel + one killer-identity class);
  (d) the narrowest funnel stage named with counts and shares
      (arrivals → engaged → killed, with the faced-type count
      reported alongside, labelled per-type, never merged
      into the per-instance funnel);
  (e) SENSE: one seed's wave-4 thread read in plain words
      (numbers plus meaning, not counts alone).
  Any leg missing = DIAG-NO-GO. No re-scoring mid-run; metric
  doubts go under a mandatory "metric review" section.

ZERO-KILL BRANCH (binding): if zero wave-4 kills occur on the
band, that is a REPORTED OUTCOME (kill scarcity — the census
completes with an empty kill table and the verdict says so),
NOT a failure to re-band around. There is NO second judged
band on new wording in this run. The faced/engaged stages are
still judged (legs b–d) even with zero kills.

Secondary quantities (reported, NOT the verdict, never
promoted into it mid-run):
- Per-seed wall numbers + death-cause shares + wave-4 arrivals /
  engaged / kills / living wave-4 killers at end.
- Channel conversion rates: engaged/arrivals, killed/engaged,
  killed/arrivals, per channel (a channel's conversion is
  kills-in-channel / fights-in-channel, plus its share of all
  wave-4 kills).
- Killer-identity table: kills by scholar-player vs villager
  vs player-literal vs unknown, with living-at-end per killer.
- Non-arrival kills by door (the feast-draw class, if any).
- Unlinked-fight count (raftdraft fieldFights wave 4 with no
  seq join) — a recorder-gap measure, not a channel.
- The vetsurvive/standmeet comparison columns (kills per band,
  scholar-only identity).

## Design

- PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
  pilot for a census (this is a census, not a lever test); no
  confirm band is pre-registered beyond this one band. Confirm
  spend only if a lever emerges, and none is expected — this
  arm is diagnostic.
- Seeds: 75101-75108 (as assigned; freshness framed above).
- Horizon: 180d DEATH-AWARE (runDays stops on death/win; +10d
  tail max) — NOT a fixed 180d. Why: matches the census family
  in shape, so wall numbers compare.
- Per-seed tracking: the w4funnel row (raftdraft/spawnsrc/
  oldcore/defwound/w5births/nonworldkill stores + final
  waveKillLog snapshot + killerStatus snapshot) PLUS the
  vetsurvive-style wall snapshot (national/table/wins/seat,
  death summary, courtship counters, deedEnd wavesFaced,
  waveReach). Peaks and first-crossing days are derived from
  the corpus in the analyzer, never hand-edited.
- Proof gates (STOP, not verdict inputs, except the substrate
  gate above which invalidates the run):
  - G1 corpus integrity: 8/8 rows, days > 0, every gate + deed
    + channel field present, no recorder errors, no overflow
    with value > 0.
  - G2 arrival reconciliation: oldcore wave-4 births ==
    spawnsrc wave-4 spawns joined on seq (spawn-only and
    birth-only counts reported, never hidden); every wave-4
    raider traces to a spawn seq.
  - G3 kill reconciliation: every waveKillLog entry with
    w == 4 appears exactly once in the per-kill table with a
    channel + killer-identity class; every non-arrival kill is
    flagged as such with its joining fight row (or flagged
    unjoined with the reason).
  - G4 channel recompute: the analyzer's channel for a sample
    of fight rows recomputed from the raw row fields (door /
    origin / kind / context / via) equals the sweep's channel
    (the analyzer IS the recompute — it derives channel from
    raw rows, never trusting a sweep-side channel label; the
    sweep stores raw rows only).
  - G5 demand vs live code: rd5 demand 4/15/6/3/2, rd4 demand
    3/10/5/3/1, as recorded in the gate objects (w5births daily
    rd5/rd4 tuples carry the demand implicitly via the short
    bars; the validator checks the live waveCombatReadiness
    demand fields where the row carries them).
  - G6 substrate-activation gate (binding, above).
  - G7 daily series: w5births daily rows present, days
    non-decreasing (loop-day != game-day stalls are allowed
    and reported, per the vetsurvive G8 correction).
  - G8 killer-identity recompute: every per-kill identity class
    recomputed from log `by` + end scholar vid + roster/vpOf
    equals the analyzer's class; every living flag recomputed
    under the gate rule equals the analyzer's flag.
- SENSE TEST (SENSE-TESTING LAW): seed rule — the seed with the
  most wave-4 kills; ties by most wave-4 engaged arrivals, then
  lowest seed. If zero kills on the band, the seed with the
  most wave-4 engaged arrivals (ties: lowest seed). Non-measured
  narration replay (say/sysSay taps, last 30 days) read for
  whether the wave-4 thread reads as people meeting monsters
  with consequences — judged in plain words in the evidence.
  Replay text never enters any count, and the replay
  trajectory shift (narration replays shift trajectories) is
  stated, not hidden: the replay proves wording and presence
  only; the counted channel attribution comes from the judged
  corpus.
- Balanced panel note: scripts/balance-panel.js has NO corpus-
  ingest mode for a single-arm census corpus (w5seq/w5twokey/
  vetsurvive grep: 0 hits for ingest/corpus; it builds
  before/after panels from two roots). A panel compare will
  be ATTEMPTED and reported honestly; no panel artifact will
  be faked. Same standing exception as the census-family
  corpora if the attempt fails.
- Telemetry deviation check: per the loop body, run AFTER
  writing evidence (telemetry-check.js vs scale-wall baseline,
  metrics national,table,wins,exiled) and report LOUD lines
  with verdict; do NOT roll the baseline on an unexplained
  LOUD line. NOTE (carried from the census family): the check
  is known-wrong on recorder rows (field-shape artifact), so
  its LOUD lines are reported with the artifact verdict, not
  as wall numbers.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
