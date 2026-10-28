# sim-dawnhall-b — PRE-REGISTRATION (committed BEFORE any judged run)

Run: oversight-flesh-out-loop-b, arm sim-dawnhall-b
(run fleshout-loop-b-20261028T2224Z, axis food-economy).
MEASUREMENT ONLY: zero game-code change, zero policy change,
zero default flips. The only new files are the tracer driver,
the analyzer, the proof test, this prereg, and the evidence
file + corpora.

## The open item being traced

sim-morningpersist-b (run fleshout-loop-b-20261028T2126Z,
evidence evidence/2026-10-28/sim-morningpersist-b.md — READ
FIRST, miss coordinates verified from that evidence, not from
this brief) traced 3/3 morning-after-inside-evening misses to
one mover — flee-by-door in a morning fight drive — but did
NOT record which monster or how it reached the hall at dawn:
its tracer logs verbs/positions, not tbfight fighters or
pendingEncounter provenance. This arm records fighters +
pendingEncounter provenance at every fight-drive entry and
answers: for each of the 3 misses, what fight was live inside
the hall at dawn, and what put it there?

The 3 misses, verified from sim-morningpersist-b.md:
- 10712, morning 21 (evening 20 'completed', (4,7) inside):
  fight drive after upkeep-1; tbPlayerMove to door cell
  (5,6) -> exitBuilding(true) -> (4,5) outside, fight 'fled'.
  Witness: Kelsey.
- 10720, morning 18 (evening 17 'completed', (4,7) inside):
  fight drive after upkeep-1; tbPlayerMove (5,6) stepping on
  the door cell from (4,7) -> exitBuilding(true) -> (4,5)
  outside, fight 'fled'. Witness: Omar. A second fight later
  in the same morning interval moved the already-outside
  player to (5,6); the miss mover is still the first exit.
- 10722, morning 30 (evening 29 'completed', (4,7) inside):
  post-sleep checkpoint already carries pendingEncounter=true;
  the post-sleep contest drive resolves it into a fight BEFORE
  upkeep-1; tbPlayerMove (4,6) door cell ->
  exitBuilding(true) -> (4,5) outside, fight 'fled'.
  Witness: Rafael.

## Instrument

Driver: scripts/dawnhall-trace-b.js — a copy of
scripts/morningpersist-trace-b.js's day loop (same substrate,
same POLICY=insideevening, same DAYS=30, same TAPDAYS=5 tap
code, same grant fixture) PLUS fight-origin tracing layers
that must not move game state (all read-only, each wrapped
call invokes the original exactly once, no new Game writes,
no RNG consumption by the tracer itself):

- snapPos extended with a fight snapshot at every checkpoint
  and every verb record: pendingEncounter, pendingMonsterId,
  pendingInTent, tbfight id/over/result, tbfight fighters
  (key, kind, monsterId, display name, hp, mx, my, veteran,
  veteranVariant), doorFledMonsters stash (id, hp, bearer),
  scholar feastDraw, scholar world-monster mirror (s.monster
  id when present).
- A fightOrigin log, appended at EVERY fight-drive entry:
  (a) the policy.fight wrapper records, before delegating,
  the live fight snapshot + pending snapshot + the say window
  since the previous record; (b) a policy.contest wrapper
  records the same on every contest-drive entry (delegating
  to competent's contest behaviour when present, else no-op);
  (c) a policy.pending wrapper records the same when the
  harness offers a pending encounter to the policy.
- A fight-creation log, appended by wrappers around the
  fight/pending creators: Game.startCombat (before-call
  pending snapshot + caller stack, after-call fighter list),
  Game.triggerEncounter, Game.wandererTentBreach,
  Game.drawFeastScavenger, Game.havenRaidTick,
  Game.reengageWaitingMonsters, Game.enterBuilding (the
  door-fled re-engage slot). Caller stack is reduced to the
  first game-code frames (file + function) so provenance is
  a named caller, not a raw stack dump.
- A transition log: after every wrapped verb, if the pending
  state or the live fight changed (new fight, new pending,
  fight ended), the change is recorded with the verb, phase,
  and say window — so a fight that becomes live during a
  wait (doAction('wait') -> tick/villagerTurn/encounter roll)
  is captured even though no policy hook fires at that
  instant.
- The morningpersist verb/checkpoint records are kept
  unchanged in shape (plus the fight snapshot fields), so
  the flee verb for each miss still reads exactly as in
  sim-morningpersist-b (tbPlayerMove onto a door cell ->
  nested exitBuilding(true)) and can be matched to the
  fight live at that verb from its before-fight snapshot.

Analyzer: scripts/analyze-dawnhall-b.js. It reuses the
morningpersist miss definition (morning after an inside
evening that reads outside) and, for each miss, extracts
from the miss interval (evening checkpoint seq to morning
checkpoint seq): the flee verb + its before-fight fighters,
every fight-drive entry in the interval, every
fight-creation / pending-creation record in the interval
(including creations during sleep, which carry the sleep
phase and the pre-morning loop-day), and the pending state
at post-sleep / pre-upkeep-1 / pre-fight-drive checkpoints.
Proof: scripts/test-dawnhall-b.js.

Candidate provenance classes (recorded, never assumed —
the analyzer reports the stack/method actually observed):
wanderer contact (triggerEncounter / wandererTentBreach),
feast-draw scavenger (drawFeastScavenger), haven raid
(havenRaidTick, incl. the no-palisade sleeping-player
pending slot), door-fled re-engage (enterBuilding ->
reengageWaitingMonsters), direct startCombat from a
wait/tick/encounter roll, and the harness driveContests
pending fallback (pending -> startCombat). A provenance
claim must name the observed method/stack + the
pendingMonsterId (or direct startCombat id) + the say line
that announced it, where one exists.

## Bands, staging, reproduction rule (all fixed up front)

- Reused band: the morningpersist CONFIRM band, seeds
  10710-10725 (16 seeds), so misses are comparable
  seed-for-seed with 3/411.
- Pilot first: seeds 10710-10717 (8 seeds). The pilot
  judges INSTRUMENT sanity only (driver completes, corpora
  complete, fight-origin records present on at least the
  known sub-band miss 10712/21, or its absence is explained
  in metric review). The pilot does NOT judge fight-origin
  completeness.
- Confirm: the full 16 seeds 10710-10725. The confirm run
  is the judged run; the pilot run is instrument sanity.
- REPRODUCTION RULE (task-stated, no rescue): first
  reproduce the 3 misses seed-for-seed and
  morning-for-morning on the morningpersist substrate. If
  reproduction FAILS, that is the finding: report it, do
  NOT move seeds, do NOT re-pick misses to fit, do NOT run
  an expansion band to hunt a replacement miss set. The
  verdict in that case is NO-GO (reproduction failure),
  with fight-origin completeness on whatever misses DID
  occur reported secondarily — never re-scored into a GO.
- Substrate (identical to morningpersist, gates FATAL):
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1, POLICY=insideevening, DAYS=30,
  TAPDAYS=5. Corpora: evidence/2026-10-28/
  sim-dawnhall-b-corpus/ (pilot files are the first 8 of
  the confirm corpus; the confirm run re-runs the full
  band as the judged run).

## Primary metric and GO threshold (judged ONLY against this)

- Primary metric: FIGHT-ORIGIN COMPLETENESS = (misses
  among the reproduced 3 with a COMPLETE fight origin) /
  3. A miss's fight origin is COMPLETE iff ALL of:
  (a) FIGHTER IDENTITY: the fight live at the flee verb
  is named — every monster fighter at that verb (monsterId,
  display name, fighter key, hp, grid position, veteran
  flag) from the verb's before-fight snapshot, plus the
  fight-entry snapshot of the fight drive that drove it.
  (b) PROVENANCE: the event that put that fight at the
  hall at dawn is named — either a fight-creation record
  in the miss interval (startCombat caller stack +
  pendingMonsterId/direct id + say line where present),
  or, if the fight predates the interval, the creation
  record in the preceding interval plus evidence it was
  still live at the interval's first fight-drive entry.
  (c) PENDING ROUTE, when applicable: if the fight arrived
  via pendingEncounter (pending true at post-sleep, or
  pending set then resolved in the interval), the pending
  creation event is named too (method + stack + say line
  + monsterId). A fight whose pending slot was already
  live at the evening checkpoint must say so explicitly
  (pending-at-evening, with its id) rather than being
  credited to a morning creation.
  A checkpoint-only claim ("a fight was live, monster
  unknown", "pending was true, creator unknown") is
  INCOMPLETE, not complete.
- GO: reproduction passes (miss set exactly 10712/21,
  10720/18, 10722/30) AND fight-origin completeness = 100%
  (3/3 complete) AND guards G1+G2 hold.
- NO-GO: reproduction fails, OR any of the 3 misses has
  an incomplete fight origin, OR a guard fails. An
  incomplete origin is a failed trace, not a shrug.
- KILLED at pilot: tracer crashes, corpora incomplete,
  fight-origin records absent on the pilot miss, or the
  pilot shows the tracer layers moving the game (move
  counts diverging from the morningpersist corpus on the
  same seeds) — stop, diagnose, do not spend confirm
  seeds.
- This arm lands NO game change whatever it finds: a
  lever class the trace reveals (e.g. a monster reaching
  a hall sleeper by a route that should not reach them)
  is DOCUMENTED in the evidence file as a named next arm
  with its own prereg sketch, and the arm stops.

## Secondary observations (reported, never judged)

- Miss rate on the judged band vs morningpersist (3/411)
  on identical seeds.
- Move-count trajectory neutrality vs the morningpersist
  corpus (first-8-seed move counts 328/283/230/284/226/
  215/182/261): divergence names the tracer layers as
  prime suspect before any game-code explanation.
- Wall numbers for the judged corpora (national / table /
  wins, wave 4-5 reach, median survival) — expected zero
  on 30-day instances; reported as zero / not-observable,
  not omitted.
- Sense read: the say transcript around each miss's fight
  arrival — does a player reading it understand HOW the
  monster got into the hall at dawn, or is the arrival
  still unexplained even with the fighter named?
- Village assessment in plain words (what the village
  looked like, who thrived/died and why, what knowledge
  was missing, which blank was filled or documented).

## Guards

- G1: median days alive on the judged band >= 0.8x the
  morningpersist confirm policy median (30) — i.e. >= 24.
  A tracer that kills villages is a broken instrument.
- G2: no src/js file modified in this arm's commits
  (additions under scripts/ + evidence/ only).
  Violation = stop and report.

## Metric review (mandatory section in the evidence file)

Every evidence file carries a metric review: whether the
prereg metric proved right, what diverged (miss set vs
morningpersist, tracer-induced divergence, reproduction
outcome), and any revision proposed for the NEXT run —
never a mid-run re-score.
