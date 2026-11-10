# sim-wave5face-b — prereg: wave-5 facing instrument on the vetfinish band

- Arm: sim-wave5face-b (Loop B, DIAG arm, run fleshout-loop-b-20261110T0122Z)
- Branch: sim-wave5face-b; base anchor `74debf969` (worktree
  `~/workspace/worktrees/sim-wave5face-b`); master at branch start is the
  same SHA — base is current, no rebase pending at prereg time.
- Lever from: evidence/2026-11-09/sim-vetfinish-b.md ("the chain binds at
  wave-5 facing + national/table, past the veterans bar") and
  evidence/2026-11-09/sim-standaccum-b.md § "Next blanks" #3 (99101
  released 19 days, wave 5 unlocked d106, zero wave-5 kills, died d132
  standing 270). This arm is the named next step: instrument wave-5
  engagements (spawns, fights, outcomes) on a release-capable band
  before any gate/price discussion. DIAG ONLY, zero src/js.

## Context (pre-existing, not judged here)

- Vetfinish before-leg on this band (current master, base `65fef6d7e`):
  9 field wave-4 kills, villages banked up to 3 living veterans at peak,
  readiness-5 held up to 35 days (99641), wave-5 unlocks 4/8, wave-5
  kills 0, national 0/8, wins 0/8, median survival 116.5d.
- Standaccum-b (band 99101–99108): first release ever, 99101, 19 ready
  days d106–125, wave 5 unlocked d106, zero wave-5 kills, lost d132
  standing 270. Its ledger[5] = 0 everywhere and it has no w5faced
  field — it cannot say whether the village ever MET a wave-5 beast.
- Prior w5 window work (gap-w5window, 2026-11-02, in-code comment at
  game.js moveWanderer): the old corpus showed 2–7 casts per 86–180d
  run and ZERO wave-5 casts/triggers, with a stuck wanderer blocking
  the cast slot; the 7-day give-up repair landed after that corpus.
  This arm re-measures facing on current master; it does not re-litigate
  that corpus.

## Band, policy, horizon (pre-registered)

- Seeds: **99641–99648, RE-USE of the vetfinish/grind band** (never
  claimed fresh; recorded here as the re-use). 8 seeds, competent
  policy verbatim, 150d death-aware horizon (match vetfinish-b).
- One leg only (characterization, no lever): RUN=wave5face-b through
  `scripts/wave5face-driver-20261109.js` (finishersize-driver shape,
  competent policy verbatim, refuses to overwrite).
- Neutrality leg: the same 8 seeds with W5_OFF=1 (instrument off).
  Pre-registered neutrality bar: days, endReason, standing, maxWave,
  wave-4 kills, and scholar deaths IDENTICAL on all 8 seeds between
  on/off legs, and fieldFights rows byte-identical. The instrument adds
  zero RNG draws and zero game-state writes (pure-read wrappers only);
  a recording failure is counted in instrumentErrors and the original
  result is returned untouched.

## Instrument (scripts/wave5face-instrument-20261109.js, layers on finishersize-instrument)

The finishersize stack already records fieldFights rows (all waves,
with day/vid/mid/wave/outcome/log), TB traces (wave 4+, with fighters/
mids/ending), daily snapshots (readiness5, gated standing,
unlockedWaveSnap), killerTrack, waveKillLog, wavesFaced, scaleRank.
This layer adds the wave-5 facing entry point:

- **Spawns** — `Game.spawnWorldMonster` wrapped (the spawn choke
  point: tile-entry casts, wanderer contacts, traps, finale nodes all
  pass through it; it returns the world entity). Every wave-5 spawn
  recorded: day, mid, wave, veteran flag, hp/maxHp, tile, spawnSeq
  (own WeakMap id on the returned entity object). `removeWorldMonster`
  wrapped to record removal day per spawn.
- **Casts** — `Game.castMonster` wrapped: every wave-5 pick recorded
  (day, mid, veteran). A cast is a spawn *choice*, not a spawn: the
  wanderer cast becomes a world entity only on contact
  (triggerEncounter → spawnWorldMonster); a feast-draw cast never does.
  Casts are reported separately from spawns and never conflated.
- **Wanderer births** — daily snapshot diff of `Game.wanderer`
  (monsterId, bornDay, veteran): the true wanderer-birth record, as a
  cross-check on casts (a cast matching a same-day wanderer birth is a
  wanderer spawn-choice; others are feast/other draws).
- **Meetings** — field fights join to spawns EXACTLY by instance id
  (the field row's `m` object is the same world entity the spawn wrap
  tagged). TB fights join by the stated rule below (the TB fighter is
  a fresh object, not the world entity): earliest unmatched wave-5
  spawn of the same mid with spawnDay ≤ traceDay and (no removal, or
  traceDay ≤ removalDay). A match made under this rule is flagged
  `tbJoin: 'mid-day'`; a field join is `tbJoin: 'instance'` (exact).
  If two live spawns of the same mid overlap a TB trace day, the match
  is flagged `tbJoin: 'ambiguous'` and counted separately, never
  silently assigned.
- **Veteran-at-meeting** — for each wave-5 meeting, the fighter's
  veteran status at that day: a wave-4+ kill in state.waveKillLog with
  `by` = fighter vid and `d` ≤ meeting day, and the fighter alive that
  day (via Game.getPerson dead flag at record time). Recorded live on
  the field row (`w5veteranAtMeeting`, `w5vetKillDays`) and on the TB
  trace (scholar + each human fighter).
- **Simultaneity datum** — daily snapshot: living veterans = distinct
  wave-4+ killers alive today (waveKillLog `by`, w ≥ 4, alive via
  getPerson/fallen), count + ids. Yields max simultaneous living
  veterans per seed and the day-count of 2+ living veterans (and of
  1+, for the release-window read).

## Definitions (pre-registered, judge against these)

- **Release day**: a daily row with `unlockedWaveSnap >= 5`
  (unlockedWave reads the gated villageStandingTotal, so this IS the
  readiness-5 release — standing ≥ 200 + wave-4 faced + all four
  readiness bars met). **Unlock day**: the first release day.
- **Release window**: unlock day through the last release day (release
  days need not be contiguous — standing can fall back under the gate
  only via the peak ratchet; the analyzer reports the day list).
- **Spawn**: one spawnWorldMonster call with wave 5. **Meeting**: one
  field fight or TB fight against that spawn. **Outcome** per meeting:
  kill (vKill / trace ending 'kill'), die (vDie / 'scholar-death'),
  flee (vFlee / 'scholar-flee' / trace ending 'rout'), or never-met.
- **Never-met reasons** (one per spawn, in this order):
  `no-spawn` is NOT a spawn reason — it is a seed/release-window
  reason (release days with zero wave-5 spawns); per spawn:
  `no-encounter` (spawn lived its whole life / to end of run with no
  field or TB meeting — includes the 7-day wanderer give-up path only
  insofar as a wanderer that never contacts never becomes a spawn at
  all, so it shows up as a cast without a spawn, reported in the
  cast-vs-spawn reconciliation); `no-veteran-alive` is a meeting-level
  reason, not a spawn reason: a meeting whose fighter was not a
  veteran while zero veterans were alive that day (i.e. the village
  faced wave 5 with no veteran in the fight because none lived).
- **National/table**: scaleRank at end + wavesFaced[5] distinct types.

## DIAG-GO bars (all three must hold for the instrument to pass)

1. Every readiness-5 release on the band classified: each seed with ≥
   1 release day gets a release classification (released + met / 
   released + spawns-but-no-meeting / released + no-spawn), with unlock
   day and release-day list; seeds with no release are classified by
   the binding short bar (readiness5.short on the last snapshot).
2. Every wave-5 spawn classified by meeting outcome or never-met with
   a stated reason (kill / die / flee / never-met:no-encounter), and
   every wave-5 cast reconciled (spawned vs never-materialized, with
   the wanderer-birth cross-check count).
3. The simultaneity datum recorded for all 8 seeds: max simultaneous
   living veterans + day-count of 2+ living veterans (+ day-count of
   1+ during the release window where a release exists).

## Proof test (scripts/test-wave5face-b.js)

- Pure-function analyzer tests on synthetic fixtures: spawn/meeting
  joins (instance + mid-day + ambiguous), veteran-at-meeting, release
  classification, simultaneity computation, cast-vs-spawn
  reconciliation. Must pass on this branch AND after any rebase.
- Live-harness neutrality smoke: 1 seed, DAYS=30, instrument on vs
  W5_OFF=1, days/endReason/waveKillLog identical (the full-band
  neutrality leg above is the judged demonstration; the smoke is the
  proof-test gate).
- The proof test must pass before the judged leg is read as evidence.

## Scale-wall numbers (reported every run)

National / table / wins, wave 4–5 unlocks, wave-5 kills, median
survival — from the judged corpus, plus the vetfinish before-leg
numbers above for the same-band comparison.

## Metric review (to fill after the run)

- Whether the TB mid-day join rule produced any ambiguous matches,
  and whether the cast-vs-spawn reconciliation leaves casts
  unexplained (feast draws should explain the non-wanderer remainder).
- Whether "release days" needs the contiguity question answered (does
  the peak ratchet hold the release once earned?).

## What is NOT in scope

- Zero src/js changes. No gate / price / deed / readyDemand / win-price
  change. No new lever, no confirm leg (DIAG only). Findings go in the
  evidence file under "Findings for the coordinator" — this arm does
  NOT edit hidden_files/ (the coordinator owns sim-findings.md and the
  tracker).
- No balance-panel run (§15): the panel takes no corpus input (same
  precedent as grind-a / finishersize-a / adopt-a / vetfinish-b); the
  pre-registered classification IS the comparison (identical seeds,
  same band as vetfinish-b before-leg).
