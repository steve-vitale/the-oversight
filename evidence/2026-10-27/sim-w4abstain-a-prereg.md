# sim-w4abstain-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261027T2147Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4abstain-a.
Worktree: `~/workspace/worktrees/sim-w4abstain-a` (branch sim-w4abstain-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
villager-only wave-4 kill conversion census — when the player refuses
every wave-4 fight, do villagers kill wave-4 monsters, and how often?
Nothing in game code is fixed by this run.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law: wave 4 =
  the Mirror Draft, standing >= 100 + readiness; wave-5 demand
  4/15/6/3/2 with veterans = DISTINCT LIVING killers with wave-4+
  kills in state.waveKillLog; VILLAGER XP LAW: a villager's real
  blow-by-blow fight feeds the deed bars exactly like the
  player's, and villager KILLS score the ledger exactly like the
  player's; "monster encounters are fought, not rolled").
- docs/TABLE.md (full seat keeps the national bar, Steve
  2026-10-27 ruling), docs/MEASUREMENT.md sections 9-12 and
  14-15 (pilot gate, death-aware horizons, pre-registration,
  convergence, metric binding, balanced panels).
- No canon invented. Where code and canon wording differ, the code
  reading below governs the census and the difference is reported.

## Prior evidence read first (this arm's question comes from these)

- evidence/2026-10-27/sim-vetsurvive-a.md (+ prereg): the direct
  parent (seeds 74801-74808, tableseat-nowait substrate). Band
  result: exactly ONE wave-4 kill (seed 74806, day 141,
  Congregation), killer the SCHOLAR, alive at end (39d censored
  survival). Villagers faced wave 4 repeatedly (74802/74807: 3
  kinds each) and killed NOTHING. This arm asks the paired
  question: with the scholar's sword removed, is villager
  conversion still zero — or was the scholar masking villager
  kills (competing for the same fights, or killing first)?
- evidence/2026-10-27/sim-scale-onramp-round-2036.md (coordinator
  evidence, run 2036Z): the current census family totals 7
  wave-4 kills / 24 villages; the scholar is the only recorded
  killer identity in the family; standmeet (74901-74908) has the
  family's first wave-5 unlock (74902, day 165, 3 wave-4 kills,
  0 living killers at end) — kills arrive, living killers do not
  accumulate. No band in the family has yet separated the
  scholar's kills from the villagers' kills by removing the
  scholar. That separation is this arm.
- evidence/2026-10-25/sim-w4funnel-a.md: the prior funnel
  outcome-class vocabulary + recorder stack, reused verbatim
  below (raftdraft-diag, spawnsrc-diag, oldcore-diag,
  w5births-diag, defwound-diag — policy-side only, never
  edited). Its classes (still-present, killed-by-*, departed,
  fled-record, melted, pending-in-fight, unknown) are this
  arm's arrival-outcome classes.
- evidence/2026-10-25/sim-nonworldkill-a.md: the non-world kill
  / TB melt classes. A non-world kill in this band is
  classified by its TB door (nonworldkill-diag, reused
  verbatim), never mistaken for a villager kill: a wave-4 kill
  with by == scholar is a PLAYER kill even if the monster was
  never a world birth; a kill with by == a villager vid is a
  VILLAGER kill; a kill with by == null is not-counted by the
  gate and is reported separately, never attributed.

## Band freshness — disclosed, not assumed

- Judged band: 75101-75108, as assigned — the SAME seeds as
  the sibling arm sim-w4channel-a, so the pairing holds. The
  sibling arm runs the same seeds with the player fighting.
  This arm does NOT depend on its corpus and does NOT judge
  against its numbers (it may land after this arm) — this
  arm's verdict is self-contained; the coordinator draws the
  paired comparison at round-up.
- Freshness check against committed evidence/2026-10-27/
  BEFORE sweeping: seed-field grep (`"seed": 7510[1-8]`,
  `s7510[1-8]`, `seed 7510[1-8]`) found ZERO hits, and no
  file or directory under evidence/2026-10-27/ names these
  seeds. A whole-tree word grep for the bare numbers matches
  incidental quantities (kcal counts, etc.) in unrelated
  corpora — those are not seed uses and are not counted here.
  These seeds have never been censused for anything. The
  judged verdict below is judged ONLY on this run's corpus.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js
  VERBATIM (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT
  unset) — the w5block/w5twokey/w5seq/vetsurvive/standmeet
  substrate, so wall numbers compare in shape — PLUS the new
  abstain layer scripts/policies/w4abstain.js (W4ABSTAIN=1).
  The abstain layer wraps tableseat-nowait and changes ONLY
  the fight and pending hooks (see Policy, below). Daily,
  upkeep, contest and every other hook are inherited unchanged.
- NEVER edited: tableseat-nowait.js, leanlinkrescue.js,
  competent.js, any *-diag.js recorder, or any src/js file.
  New instruments only: scripts/policies/w4abstain.js (the
  abstain policy), scripts/test-w4abstain-a-sweep.js (census
  sweep + recorder composition + strike counter),
  scripts/test-w4abstain-a.js (proof validator + analyzer),
  scripts/test-w4abstain-a-policy.js (unit proof for the
  policy hooks on a fake Game),
  scripts/test-w4abstain-a-sense.js (non-measured sense
  replay).
- Sweep harness: scripts/sim-harness.js loadGame/setupGame/
  runDays, full src/js list in index.html order minus DOM-only
  files (per the worker template). Math.random seeded BEFORE
  eval. Never stub Game.save.

## Full env set (inherited gates included)

- Env vars set by the sweep before each loadGame:
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, W4ABSTAIN=1,
  TABLEDEFIANT deleted. loadGame mode label 'w4abstain-a' (a
  manifest label only — sim-harness.js reads mode into the
  manifest, never into game state or RNG; game RNG is seeded
  from the seed alone).
- Policy RNG: sim-harness seeds global.__policyRandom from the
  seed (unchanged from vetsurvive).
- Writer: scripts/sim-postunlock2-b-writer.js chunked writer
  with sha check + retry (same as vetsurvive) — a write flap
  cannot silently lose a row.
- Recorders installed by the sweep after setupGame (verbatim,
  policy-side only, installed directly like the w4funnel
  sweep — the install functions take no env gate):
  raftdraft-diag, spawnsrc-diag, oldcore-diag, w5births-diag,
  defwound-diag (the w4funnel stack), PLUS nonworldkill-diag
  installed OUTERMOST (last, per its own doc: the stack then
  holds exactly [this wrapper, the true caller, ...] at
  pre-record time, so door rules see the true caller).
  No recorder draws RNG, throws into the engine, or returns
  anything but the original value.
- Strike counter (new instrumentation, same class as the
  recorders): the sweep wraps Game.tbPlayerStrike after
  setupGame — it records (fight id, game day, monster waves
  present in the live fight, strike count) and returns the
  original value untouched, never throws into the engine.
  The counter is what the activation gate reads; the gate is
  MEASURED, never trusted from the policy's intent.
- Read discipline (same as vetsurvive, unchanged): the daily
  series uses ONLY pure reads (villageStanding,
  standingPlentyCappedTotal, waveCombatReadiness(4/5),
  waveEngaged(4), waveLedgerPoints, deedGateReady, state
  reads). It NEVER calls villageStandingTotal() or
  unlockedWave() daily — the daily gated total and daily
  unlocked wave are computed from the pure reads by the
  vetsurvive replication. The engine's own numbers are called
  once at end and checked by the validator. deedGateReady()
  is a pure read for census purposes (computes from
  progState/deedState/scaleRank/integrationStage, writes
  nothing except idempotent deedState defaults); the wave-5
  unlock gate does not consult it at all.

## Substrate-activation gate (rule3trial lesson — binding)

Same gate as vetsurvive (the substrate must be proven to
have run before any verdict is judged), checked by the
validator from the recorded policy ctx counters
(courtCounters, courtAccords, courtNational, courtGlobal,
tended, defenseCalls, proposedLead — all captured in full
in every row):

- GATE (band-level, binding): combined courtship activity
  (sum of all seven counters over the band) > 0 AND at least
  6/8 seeds show non-zero combined courtship activity.
- If the gate FAILS, the sweep is INVALID (not NO-GO): no
  verdict is judged, the failure is reported loudly, and the
  run stops for an env fix. Per-seed courtship counters are
  tabulated in the evidence regardless.

## Policy: what abstention does and does not do (binding)

The policy file (scripts/policies/w4abstain.js) is the
specification; this section states it in words so the
census cannot be misread as "no wave-4 contact at all."

DOES:
- FIGHT HOOK: on any player turn of a TB fight containing a
  LIVE wave-4 monster fighter (fighter monsterId/mdef wave —
  mdef.wave preferred, roster lookup fallback; unknown wave
  is NEVER treated as wave 4 and is counted separately),
  the player FLEES: one step per turn toward the nearest
  grid edge, then a deliberate barrier push (tbBarrierExit)
  once on the edge. If the push is refused (sealed fight,
  blocked far side), the player WAITS OUT the turn instead.
  The player NEVER strikes and NEVER uses an ability in a
  wave-4 fight. A fight containing ANY live wave-4 monster
  (including mixed packs) is fled whole — the player does
  not fight a fight that contains a wave-4 monster.
- PENDING HOOK: a pending FEAST DRAW whose monster is wave 4
  is declined with the engine's own honest verb,
  driveOffFeastDraw (devotion unspent, buff stays live).
  Any other pending encounter whose monster is wave 4 is
  COUNTED and left alone — the UI offers no decline verb
  for it (only "Face it"; the drive-off button exists for
  feast draws only), so the harness fallback faces it and
  the fight hook flees it.
- All other fights (non-wave-4 TB fights, including feast
  draws of waves 1-3) are fought normally via the inherited
  competent fight hook; courtship, seat legs, feasts,
  foraging, teaching and travel are unchanged.

DOES NOT SUPPRESS (each is a measured quantity, not a gap):
- Villager fights (field fights, raid-defense fights,
  patrol fights, aid fights): engine-driven, not player
  fights. Villagers fight wave-4 monsters freely; their
  kills are exactly what is measured.
- World births, spawns, raid drafts, monster turns: the
  policy cannot stop a wave-4 monster from arriving, being
  drafted, or stepping onto the player's tile. It can only
  refuse to fight it once a TB fight starts.
- Contest-arena TB fights with wave-4 monsters: fled via
  the fight hook like any TB fight; if sealed, waited out
  without striking (possible player death — the honest
  cost of refusing a sealed fight, counted in the wall
  numbers, never hidden).
- Table trials: not monster fights; untouched.
- TIMING HONESTY: feast draws are faced INSIDE
  competent.upkeep (eveningFeast grants, feastFightRoad
  faces, one upkeep call) — no policy hook runs between
  grant and face. A wave-4 draw faced there starts a TB
  fight that the fight hook then flees; the pending hook's
  drive-off applies only to draws still pending at
  driveContests time. The fight hook is the binding
  abstention layer; both paths are counted (drive-offs,
  fled fights). The driveoff arm's COMPETENT_SEEK_FIGHTS=0
  workaround is NOT used: it would also kill feasted
  patrol sweeps and move the substrate away from the
  sibling arm for no census gain, since the fight hook
  already guarantees zero player strikes.

## Definitions (fixed before sweeping, validator repeats them)

- ARRIVED: one wave-4 world-monster birth (oldcore birth
  joined to its spawnsrc spawn on seq; a fled-recovery
  re-entry is a NEW arrival with its own seq and source
  'fled-recovery', reported separately so fresh arrivals
  and all arrivals both reconcile). Raid draft is NOT a
  birth source — it selects already-born pool entities.
- FACED: distinct wave-4 monster types in deedState
  wavesFaced at end (wave 4), cross-checked against
  waveEngaged(4). The faced number is the deed count.
- ENGAGED (fought, any channel): an arrival or TB fight
  with at least one fight row — a defwound resolve row, an
  oldcore tbEnd row, a raftdraft fieldFight row, or a
  nonworldkill start+end pair. Subclasses, counted
  separately, never merged: player-fought (>= 1 player
  strike in a TB fight with that monster — the activation
  gate requires this to be ZERO for wave 4), villager-
  fought (>= 1 villager/defender resolve row), met-not-
  fought (a TB fight started and fled with zero strikes,
  or an arrival with fight rows that record no striker —
  reported, never counted as fought).
- KILLED: waveKillLog entries with w == 4, by channel:
  player-TB (by == scholar vid, joined to a nonworldkill
  TB end row — the door names the channel; a player kill
  of a never-born monster is still a player kill, per
  nonworldkill); villager (by == a villager vid — the
  primary metric; via tag recorded, field/defender split
  from the via vocabulary in the log); other (any other
  via tag, listed verbatim); not-counted (by == null —
  the gate skips these; reported separately, never
  attributed to any killer).
- OUTCOME classes for arrivals (w4funnel vocabulary, in
  precedence order): killed-by-player-fight,
  killed-by-villager-fight, killed-by-defender-fight,
  killed-other-cause, departed, fled-record, melted,
  still-present, pending-in-fight, unknown. Still-present
  beats any earlier removal (re-entry rule).
- VILLAGER WAVE-4 FIGHTS (the denominator of conversion):
  villager/defender resolve rows (defwound) + raftdraft
  fieldFight rows whose monster is wave 4, deduplicated by
  (seed, entity seq or fight id) where linkage exists;
  unlinked fight rows are reported as unlinked-fight, never
  attributed to an arrival.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: villager-attributed wave-4 kills on this band —
count + killer vids + living-at-end status — together with
villager wave-4 fights, under player abstention.

Per wave-4 kill entry in state.waveKillLog (fields d, mid,
w, by, via, trick), the record is: killerVid = by;
killerName = Game.disp(by) at end (dead villagers keep a
person record; if disp fails, the vid itself is the
identity and the gap is reported, never filled by guess);
killDay = d; monster = mid (+ data name for reading only);
via = via channel tag; TB door (for player kills, from
the nonworldkill join); aliveAtEnd by the gate's own
living rule (scholar vid at end counts living by
definition; otherwise vpOf(vid) exists and is not dead).

- ACTIVATION GATE (binding, checked BEFORE judging):
  player strikes in wave-4 TB fights (strike counter,
  joined by fight id + monster waves) == 0 AND player
  wave-4 kills (waveKillLog w == 4, by == scholar) == 0.
  If either is > 0, the run is an ACTIVATION FAILURE: STOP,
  report the failure loudly, do NOT judge conversion on a
  band where the player still fought. Fights started-but-
  fled with zero strikes are NOT gate failures — they are
  abstention held, reported by door in the evidence.
- GO RULE (census, judged ONLY against this prereg):
  (a) 8/8 configs valid (8 rows, days > 0, every gate +
  deed + fate field present, no recorder errors);
  (b) activation gate passes;
  (c) >= 95% of wave-4 arrivals classified (outcome =
  one of the classes above; unknown = untagged seq,
  vanished-unrecorded, unclassified removal, or
  pending-in-fight at run end — each counted, never
  hidden);
  (d) villager kill/fight counts reported with killer
  identities AND a SENSE read of one seed's wave-4 thread
  in plain words.
  Any leg missing = DIAG-NO-GO.
- VERDICT WORDING (from this band's numbers only):
  villager kills 0 -> "villager conversion zero on this
  band under abstention"; villager kills >= 1 ->
  "villager-capable" with the rate (kills per villager
  wave-4 fight, and kills per seed) and the killer
  identities. Do NOT claim "scholar-gated" from this band
  alone — that conclusion needs the paired arm and is the
  coordinator's, not this arm's.

ZERO-KILL BRANCH (binding): villager kills 0 is a REPORTED
OUTCOME (the verdict wording above covers it), NOT a
failure to re-band around. There is NO second judged band
on new wording in this run. Prior bands are comparison-
only, never re-scored.

Secondary quantities (reported, NOT the verdict, never
promoted into it mid-run):
- Wall numbers every run needs: national ever/final,
  table invited/entered, wins (lesser/full split), wave-4
  faced/engaged/killed (by channel), wave-5 unlocks,
  median survival, death-cause shares.
- Arrival outcome table (funnel classes) + TB fight door
  table (nonworldkill doors, wave 4 only) + fled/held/
  drive-off counts from the abstain ctx counters.
- rd4/rd5 veterans peak-vs-end per seed (does abstention
  move the bar at all?).
- The vetsurvive comparison columns (1 kill / scholar /
  alive) — comparison only.

## Design

- PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
  pilot for a census (this is a census, not a lever test);
  no confirm band is pre-registered beyond this one band.
- Seeds: 75101-75108 (as assigned; freshness framed above).
- Horizon: 180d DEATH-AWARE (runDays stops on death/win;
  +10d tail max) — NOT a fixed 180d. Why: matches the
  vetsurvive band in shape, so wall numbers compare.
- Per-seed daily tracking: gated standing, raw, capped, war/
  diplomacy/plenty, rd5 bars, rd4 bars, w4faced, unlockedWave
  (computed), rank, waveKillLog-derived wave-4 kill/killer
  counts, AND deedGateReady() per day. Peaks and
  first-crossing days are derived from the daily series in
  the proof validator, never hand-edited.
- Det-gate (STOP, before the judged sweep): seed 75101 run
  TWICE under the abstain policy — once with the full
  recorder stack + strike counter installed, once with
  neither — and the headlines (days, gameDays, won,
  nationalEver, wave-4 kills, player strikes) must agree
  exactly. A mismatch means the instruments moved the
  trajectory: abort loudly, no judged sweep. The det-gate
  runs are NOT judged rows and are NOT in the corpus.
- Proof gates (STOP, not verdict inputs, except the
  substrate and activation gates above which invalidate
  the run):
  - G1 corpus integrity: 8/8 rows, days > 0, every gate +
    deed + fate field present, no recorder errors, no
    overflow on any recorder store.
  - G2 veterans recompute: living wave-4 killers recomputed
    from waveKillLog + rosterLiving (+ scholar rule) equal
    the row's.
  - G3 fate recompute: every wave-4 log entry has a fate
    record; every dead killer has deathDay >= killDay and
    a matching live-death entry by name (or is flagged
    'unmatched'); every alive killer matches rosterLiving
    living=true or the scholar rule; post-kill survival
    arithmetic recomputed; firstKillDay recomputed from
    the log (vetsurvive lesson: never seed a min with 0).
  - G4 rd4/rd5 peak/end recompute from the daily series.
  - G5 demand vs live code: rd5 demand 4/15/6/3/2, rd4
    demand 3/10/5/3/1, as recorded in the gate objects.
  - G6 substrate-activation gate (binding, above).
  - G7 activation gate (binding, above): strikes == 0 and
    player w4 kills == 0, recomputed from the strike
    counter + the log; every wave-4 TB fight (nonworldkill
    starts, wave 4) listed with its strike count (all must
    be 0) and its end result (fled / held / won / lost /
    routed).
  - G8 arrival classification: >= 95% of wave-4 arrivals
    with a known outcome class; every wave-4 log entry
    with a channel (player-TB door, villager via, other
    verbatim, or not-counted null-by).
  - G9 daily series: daily rows present, days
    non-decreasing (vetsurvive lesson: loop-day !=
    game-day, so a stalled day is reported, not failed),
    no gap covering a kill day.
  - G10 det-gate agreement (above).
- SENSE TEST (SENSE-TESTING LAW): sense seed by the fixed
  rule — the LOWEST seed with a villager wave-4 kill; if
  no villager kill exists, fall back to the vetsurvive
  rule (highest gated standing at end; ties by most
  wave-4 kills, then lowest seed). Non-measured narration
  replay (say/sysSay taps, last 30 days) read for the
  seed's wave-4 thread: who met what, who fought, who
  fled, what the village did about it — judged in plain
  words in the evidence. Replay text never enters any
  count, and the replay trajectory shift is stated, not
  hidden: the replay proves wording and presence only.
- Balanced panel note: scripts/balance-panel.js has NO
  corpus-ingest mode for a single-arm census corpus
  (vetsurvive grep: 0 hits for ingest/corpus; it builds
  before/after panels from two roots). A panel compare
  will be ATTEMPTED and reported honestly; no panel
  artifact will be faked. Same standing exception as the
  vetsurvive corpus if the attempt fails.
- Telemetry deviation check: per the loop body, run AFTER
  writing evidence (telemetry-check.js vs scale-wall
  baseline, metrics national,table,wins,exiled) and report
  LOUD lines with verdict; do NOT roll the baseline on an
  unexplained LOUD line. NOTE: the vetsurvive standing
  exception applies in part — recorder rows are not the
  telemetry tool's input shape — so the check is run on
  the per-seed rows' wall fields and any LOUD line is
  judged as artifact-vs-real before any baseline action.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
