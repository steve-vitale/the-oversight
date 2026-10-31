# sim-wave3enc-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1535Z.
Arm type: DIAG ONLY — measurement, zero src/js changes, zero
policy-default flips, zero edits to existing policy files, no gate
threshold or demand number moved. The deliverable is the instrument
+ census + verdict; do NOT build a lever fix.

## Question (sim-findings item, from sim-wavegate-a)

"WAVE-3+ KILLS NEVER HAPPEN ON STALL SEEDS" (Loop A sim-wavegate-a,
evidence/2026-10-31/sim-wavegate-a.md, backlog item 1). Wavegate
found, on ITS base: 3 of the 5 stall seeds unlock wave 3 and live
with it 40–101 days with warPts 0; the other 2 never unlock wave 3.
Its recorder counts kills only. This arm's question: are wave-3
fights avoided, fled, or lost?

## Prior-base context (quoted, never re-judged)

Wavegate (base 4c92bbb04, 19 seeds): stall set = 87104 (survived,
cap, wave 3), 87109 (WIN-LESSER day 121, wave 3), 87119
(village-lost day 167, wave 2), 87124 (WIN-LESSER day 164,
wave 3), 87140 (survived, cap, wave 2). Stall == never-veteran
exactly on that base (maxVet 0, maxWarPts 0 on all 5). Road
contrast seeds below are also wavegate labels on that base.
This arm judges ONLY its own corpus on ITS base (below); if a
named seed behaves differently here, that is reported as a
base-difference observation, never smoothed toward wavegate.

## Base pin

- Worktree HEAD at prereg time: 9f22a0838928e68340f42325d9e4951e219d94bc
  (sim-scale-onramp-round-1415-a coordinator evidence commit).
  This base is NEWER than the wavegate sweep anchor (4c92bbb04);
  trajectories on the same seeds may therefore differ from the
  wavegate census. Every judged JSON carries its anchorCommit.
- Worktree: ~/workspace/worktrees/sim-wave3enc-a (branch
  sim-wave3enc-a). Main tree untouched.

## Seed plan (fixed now; no band-shopping)

- Pilot (8): the 5 stall seeds 87104, 87109, 87119, 87124, 87140
  + 3 road seeds as contrast: 87115 (ready unlock on wavegate
  base), 87123 (early wave-4 unlock, died at wave 4), 87127
  (defer4 then road). Contrast seeds exist to prove the
  instrument sees fights/kills where wavegate saw veterans;
  they never enter the stall-seed verdict denominators.
- Confirm (11, = all remaining wavegate band seeds): 87103,
  87107, 87120, 87121, 87126, 87128, 87132, 87134, 87135, 87137,
  87138. Run ONLY if the pilot gate passes (below). No
  substitutions, no additions.

## Policy stack (identical to wavegate, plus the NEW recorder)

- withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1, 200 loop-days death-aware cap
  (harness Game.over stop; dead villages stop simulating).
  Wavegate's loop-days were 200 with gameDays reaching 201;
  this arm uses the same DAYS=200 so "days lived with wave 3"
  is comparable in construction (not in values — different base).
- NEW recorder: scripts/policies/wave3enc-diag.js (WAVE3ENC=1),
  wrapped OUTSIDE fullseat-diag. It does NOT replace or edit
  wavegate-diag; wavegate-diag is NOT in this stack (its gate
  decomposition is not re-measured here — only the wave-3 rung
  is re-derived from pure reads, see below).

## Recorder purity (env-gated, pure reads, zero game-state writes, zero RNG draws)

- WAVE3ENC=1 is the only on-switch. Unset, the layer delegates
  to the wrapped policy byte-identically and installs no wraps
  (proof-test guard + det-gate OFF leg).
- Daily row (AFTER the inner daily runs), pure reads only:
  day; scaleRank(); waveLedgerPoints(1..5); waveLedgerCfg()
  bars + day floor; wave-3 rung recomputed as day >= 25 AND
  p2 >= bar2 (exactly the wave-3 rung of unlockedWave();
  standing gates only waves 4-5 on top of this rung, so
  rung-true <=> derived unlocked wave >= 3); villageStanding()
  breakdown for warPts; deedState().wavesFaced copy (wave-3
  types faced); waveKillLog length + new entries since last
  daily (append-only log; a shrink is a resync flag, never
  silently dropped).
- The recorder deliberately does NOT call unlockedWave() or
  villageStandingTotal() mid-run (both can write state / fire
  beats). One post-run unlockedWave() call per seed, after the
  trajectory is complete, cross-checks derived final uw >= 3
  against the engine (trajectory-free).
- Event wraps (installed after loadGame, re-ensured idempotently
  in daily, removed after the run; all record AFTER delegating,
  return the original value untouched, never throw into the
  engine — recording errors are counted):
  - Game.fieldFight (villager channel): vid, mdef id/wave,
    caller class from the call stack (wild-resolve / patrol /
    aid / sortie / contest-proxy via opts.rng / other),
    returned outcome, rounds, vHpLeft, mHpLeft, allyVid,
    calledHelp, intent. Wave-3 rows only enter the census;
    all waves are recorded so the filter is auditable.
  - Game.tbEnd (player channel): fighters captured BEFORE
    delegating (tbEnd clears Game.tbfight — the encounter-diag
    lesson: a post-call read always misses), settled result
    after delegating (won/lost/fled/routed/other), monster
    ids + waves, villager ids, scholar presence, arena flag.
    Only fights whose settled state is over are recorded.
  - Game.recordWaveKill (ledger choke point): monster id/wave,
    via, and the wave-ledger point delta for that wave
    (waveLedgerPoints(wave) after minus before — the scorer
    runs inside recordWaveKill, so the delta is exact per
    kill event, whatever channel called it). This is how a
    kill is split into ledger-point vs capped (delta > 0 vs
    delta == 0) without guessing from log order.
  - Game.spawnWorldMonster (context only, NOT in the meeting
    total): monster id/wave/tile/veteran flag. Spawn-to-fight
    linkage is type-level only (world entities carry no stable
    instance id — the encounter-diag known limit, carried here).
- Say capture: Game.sysSay wrapped ONLY to record lines
  naming a wave-3 monster (Redactor, Gavel, Focus Group,
  Spool, Chorus Line, Terms of Service, Callback, Buffering,
  Ad Break — matched on display-name fragments), capped,
  calling through with identical arguments. Feeds the sense
  read; if the engine never narrates a meeting, the capture
  is empty and the sense read says so.
- No muster verb, no call, no button press, no policy action
  is ever taken by the recorder. It cannot move a trajectory
  except through a bug — which the det leg exists to catch.

## Meeting definition + outcome split (binding)

A MEETING is one fight row: one fieldFight call with a wave-3
mdef, or one settled tbEnd fight containing a wave-3 monster.
Each meeting maps to EXACTLY ONE bucket (mutually exclusive,
exhaustive over fight rows with a usable outcome):

- avoided (no-contact): fieldFight outcome 'evade' ("saw it,
  gave it room" — contact decided, not fought). TB fights
  have no evade row; a TB fight that never settles has no row
  and is reported as unsettled, never bucketed.
- fled-by-beast: fieldFight 'mFlee', OR TB 'won' with NO
  recordWaveKill event for that monster type on that day
  (the beast is gone, not dead — driven off).
- fled-by-villagers: fieldFight 'vFlee', OR TB 'fled'/'routed'.
- fought-lost: fieldFight 'vDie', OR TB 'lost'.
- fought-won-no-ledger-point: a KILL row (fieldFight 'vKill',
  OR TB 'won' WITH a recordWaveKill event for that type on
  that day) whose matching kill event(s) score ledger delta
  == 0 (type capped — breadth cap, not a missing kill).
- ledger-point kill: a KILL row whose matching kill event
  scores ledger delta > 0.
- UNCLASSIFIED (outside the six buckets, breaks GO unless
  read-only explained): a wave-3 fight row with a null/unknown
  outcome, a TB result outside won/lost/fled/routed, a kill
  row with no matching kill event, or a kill event with no
  matching fight row. The analyzer counts these separately;
  the six buckets must sum to (meetings minus unclassified),
  and GO requires unclassified == 0.

Matching rule (kill row <-> kill event): same monster type
AND same scholar day. If two kill rows for one type share a
day, they share that day's kill events for the type in log
order; any ambiguity is reported as unclassified, never
resolved by guessing. Contest-arena TB fights are included
in the meeting total with arena=true flagged (a wave-3
monster in a contest arena is still a wave-3 meeting; the
channel split shows how many).

NOT in the meeting total (reported as context, never folded
into the split): wave-3 spawns; spawned types never fought
(type-level); deed-feed wave-3 types with no fight row
(reported as deed-only, investigated, never bucketed).

## Per-seed report (required for every judged seed)

Days lived with wave 3 unlocked (count of daily rows with
the rung true; first rung day also stated), end warPts
(villageStanding warPts), end wave-3 ledger points p3, end
derived uw >= 3 cross-check vs post-run engine uw, meeting
total, the six-bucket split (which must sum to the total),
channel split (field vs TB), spawn count + spawned-never-
fought types, deed-feed wave-3 types, wave-3 kill events
(ledger-point vs capped), recorder errors, and the
stall-status re-derivation on THIS base (wave 4 reached?
ever a living veteran? — via wavegate's own definitions:
wave-4 reached = post-run engine uw >= 4 or maxWave >= 4;
veteran = any waveKillLog entry with wave >= 3 by a living
roster member at run end is NOT recomputed here — the
re-derivation reports only warPts/p3/maxWave/engine uw,
and calls a seed "still-stalled on this base" ONLY if
engine uw < 4 AND p3 == 0 AND warPts == 0; otherwise it
reports the new-base outcome plainly without the stall
label).

## Primary metric

Encounter-instrument completeness over the 5 named stall
seeds: every one of the 5 has (a) an unbroken daily row
series in the wavegate operational sense (one row per
harness daily call, sorted, no recorder drops), (b) a
meeting table whose six buckets sum to its meeting total,
(c) days-lived-with-wave-3 + warPts + p3 stated, (d)
recorder errors 0, (e) derived-final-uw>=3 == engine-final-
uw>=3. Completeness = stall seeds fully reported / 5.
Cross-checks: (i) det-gate byte-identity on 2 seeds;
(ii) corpus determinism leg (one pilot seed re-run
byte-identical); (iii) kill-event count == waveKillLog
wave-3 entries on every seed (no kill missed, none invented).

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: completeness 5/5 on the stall seeds, cross-checks
  (i)–(iii) all pass, instrumentErrors = 0 on all judged
  seeds, unclassified == 0 on all judged seeds, >= 8 usable
  judged seeds (pilot), AND the evidence states (a) the
  per-seed encounter table for all 5 stall seeds, (b) the
  verdict sentence (avoided / fled / lost — with numbers),
  (c) the spawn-vs-fight context (spawned-never-fought),
  (d) wall numbers on the judged band, (e) a sense read of
  at least one stall-seed wave-3 meeting (or its absence).
- DIAG-NO-GO: completeness < 5/5 with no read-only
  explanation, or any cross-check failing unexplained, or
  instrumentErrors > 0 with no read-only explanation, or
  unclassified > 0 unexplained, or a required verdict
  section (a)–(e) missing, or the pilot fails on instrument
  grounds.
- KILLED-AT-PILOT: the pilot gate fails (below) and no
  confirm is run. Pilot numbers are still reported; the
  wave-3 question stays open, not answered by the pilot
  alone.

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot GO requires: recorder fires on all 8 pilot seeds with
zero recorder errors; per-seed JSONs valid (days > 0, daily
rows sorted, no gaps in the harness-call sense); meeting
tables computable on every pilot seed (including total 0
with all buckets 0 on never-unlocked seeds — a zero table
is a complete table, not a failure); AND cross-check (iii)
holds on every pilot seed. If the pilot fails on instrument
grounds, the verdict is killed-at-pilot (instrument
DIAG-NO-GO) and no confirm is run. If the pilot is thin
(e.g. zero wave-3 meetings on all 5 stall seeds), the
thinness IS the finding and the confirm still runs — a
zero-meeting census is answerable, not vacuous — provided
the instrument demonstrably fires (contrast road seeds
must show meetings/kills, or the instrument is suspect and
the run stops as killed-at-pilot with that reason stated).

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to wavegate: wave-3 doors
opened late and stall seeds lived with wave 3 for 40–101
days on the prior base, so a shorter cap would censor the
meeting tail; the death-aware stop keeps cost at the
survival distribution.

## Panel (§15)

NOT APPLICABLE — single-base DIAG census, no before/after
lever comparison exists in this arm; none fabricated (same
declaration as wavegate-a). The det leg compares
recorder-on vs recorder-off trajectories of the SAME stack;
it is a neutrality proof, not a panel comparison, and its
numbers never enter the census tables.

## Det-gate (before judged sims are trusted)

- scripts/wave3enc-det-20261031.sh (shell + node compare):
  runs 2 pilot seeds (87104, 87127) twice each — recorder ON
  vs recorder OFF (same stack, same seeds) — to worktree
  scratch dirs (scratch-wave3enc-det/, deleted before
  commit; NEVER /tmp, never the judged corpus), and compares
  dayHash arrays + end fields (gameDays, won, national,
  table, maxWave, endScaleRank). Requirement: byte-identical
  hashes and identical end fields on both seeds. A mismatch
  stops the run (killed-at-pilot on instrument grounds)
  until explained.
- Corpus determinism leg: one judged pilot seed re-run to a
  worktree scratch dir is byte-identical to its judged JSON.
- Sweep I/O discipline (prior-run lessons): the sweep prints
  ONE JSON line per seed to stdout and writes nothing itself
  (game-loaded processes cannot reliably write files under
  the frozen clock); a separate idle splitter process
  (scripts/wave3enc-split-20261031.js) reads the stdout file
  and writes the per-seed JSONs with a resilient writer
  (retry + full-size verification, 0-byte deleted on final
  failure). stdout/stderr are captured to files in a single
  FOREGROUND exec, never a backgrounded pipe. Judged corpora
  are NEVER staged in /tmp.

## Sense-testing (SENSE-TESTING LAW)

The evidence judges at least one stall-seed wave-3 meeting
(or its absence) for meaning: who met what, where the
meeting came from (wild / patrol / aid / sortie), what the
fight record says (rounds, wounds, intent, ally), and
whether any narration exists for it (say capture). Counts
alone do not pass this section. If a stall seed has zero
meetings, the sense read covers the absence itself: what
the village WAS doing instead (spawns near it? deed-feed
types? patrol/sortie channels?) — an absence with no
context is not a finding.

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the kill-row/kill-event
  day+type join hold without ambiguity, did the det-gate
  hold, did any classification rule misfire, did the pilot
  gate behave, does the meeting definition need rewording
  for the next arm.)
