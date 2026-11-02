# sim-maxwave5-a — PREREG (Loop A 20261102T0815Z, axis scale-onramp)

Run: fleshout-loop-a-20261102T0815Z, arm sim-maxwave5-a.
Worktree branch: sim-maxwave5-a, base 0b2d2a3b8. POLICY/INSTRUMENT
SIDE ONLY — zero `src/js` changes. No titan canon doc exists in
docs/ — stated, none invented; in-code source is `src/js/titans.js`
+ `src/js/hierarchy.js`.

## Question (blank #1 from the 0725Z round, evidence/2026-11-02/sim-scale-onramp-round-0725.md)

Seed 97309 in the arrearsscreen screened band
(evidence/2026-11-02/sim-arrearsscreen-a.md, fresh portion
97309–97324) recorded W5=1 — maxWave 5 — on a village-lost run
ending day 77, with NO herald attempt, Nat 0, Table 1, Won 0,
W4 1. What does a maxWave=5 row actually record: wave-5 UNLOCK,
wave-5 monster SPAWN, wave-5 FIGHT, or a recorder artifact?
This decides the standing wall language (full seat 0 / wave 5
fought 0 in normal play) — no wave-5 reach/fight is claimed
until this arm proves which one it is.

## Frozen stack (identical to the arrearsscreen screen)

Policy stack: tribfloor leadfeast + windefer + seatdrive +
fullseat-diag, herald-v1 + muster-diag recorders.
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1; DAYS=180 death-aware
cap. Seed: 97309 only (this is a diagnosis of one recorded
row, not a band). Instrument (new, this arm, scripts only):
scripts/maxwave5-replay-20261102.js — reuses the arrearsscreen
instrument stack (herald-instrument-20261030 install: player
startCombat attempts with wave + FOUGHT/REFUSED, villager
fieldFights wave>=4, wave>=4 kills, sleep census of
unlockedWave/scaleRank) and adds: (i) a sleep-wrap daily
unlock trace (day, unlockedWave, villageStandingTotal,
standing peak, wave-4 faced count, wave-ledger points by wave,
deed wavesFaced counts by wave); (ii) a spawnWorldMonster
wrap recording every spawn (day, monster id, wave from the
data def, titan flag, campaign/titan opts); (iii) end-state
deed wavesFaced by wave, state.waveKillLog by wave, and
state.waveKills. The replay also records the arrearsscreen
dayHash stream so RNG-stream drift vs the original row can be
stated, not assumed.

## Definitions (fixed before any judged sim)

- UNLOCK: `Game.unlockedWave()` observed >= 5 on some day
  (sleep census or daily trace). Unlock means the wave-5
  monsters entered `monsterWavePool()` — nothing more.
- SPAWN: a `spawnWorldMonster` call whose data def carries
  wave 5. Split: POOL spawn (ordinary tile-entry / wanderer /
  background path, no titan/campaign opts) vs TITAN/CAMPAIGN
  spawn (titan opts, finale-campaign, network-campaign).
  A spawn is not a fight: the monster exists on a tile.
- FIGHT: a blow-by-blow fight against a wave-5 monster —
  player `startCombat` FOUGHT with a wave-5 id, OR a villager
  `fieldFight` with a counted outcome (vKill / mFlee / vFlee)
  against a wave-5 id, OR equivalently a wave-5 entry in
  `deedState().wavesFaced` (the deed feed is fed exactly by
  those two paths plus recordWaveKill; see code audit in the
  evidence file). Fleeing counts as fought (stood on the
  grid); evade / vDie / alreadyDead record nothing and are
  not fights.
- KILL: a `recordWaveKill` / `state.waveKillLog` entry with a
  wave-5 monster id. A kill implies a fight; a fight does
  not imply a kill.
- ARTIFACT: any maxWave=5 row produced without an UNLOCK
  (e.g. end-state snapshot misread, stale state, or a
  recorder default). The audit hypothesis, to be tested:
  `scripts/sim-harness.js` `runDays` sets
  `maxWaveUnlocked` from ONE end-state call of
  `Game.unlockedWave()` (not a max-over-run sample), and
  the arrearsscreen recorder copies it as `maxWave` /
  `wave5 = maxWave >= 5`. If the hypothesis holds, W5=1
  proves UNLOCK at end state (subject to the standing peak
  ratchet) and proves nothing about SPAWN or FIGHT.

## DIAG-GO bars (judge the arm against these; never re-score)

(a) REPRODUCTION-OR-DRIFT STATEMENT: the replay row is
    compared field by field to the arrearsscreen 97309 row
    (maxWave, days/gameDays, endReason, national, table,
    won, w4, w5, w4Day, w5Day) and to its dayHash stream.
    PASS if the statement is written either way —
    reproduced (same row within dayHash agreement) or
    drifted (named divergence + hash-divergence day, with
    the verdict then judged from the instrumented trace +
    code audit, not from a forced match). A missing
    statement is a FAIL.
(b) EVERY WAVE-5-RELEVANT EVENT CLASSIFIED: every event in
    the instrumented trace that could bear on wave 5 —
    each unlock transition, each wave-5 spawn, each
    wave-5 fight/kill candidate, each wave-5 deed entry —
    carries exactly one class from
    {UNLOCK, SPAWN-POOL, SPAWN-TITAN-CAMPAIGN, FIGHT,
    KILL, NONE} and the evidence table lists them all.
    Zero UNCLASSIFIED. PASS requires the table to be
    complete for the replayed run; an empty table with a
    stated reason (e.g. no wave-5 event of that kind
    occurred) counts for that kind only if the
    instrument proves the absence (spawn wrap + deed
    end-state both empty).
(c) PROOF GREEN: unit proof
    scripts/test-maxwave5-classify.js (classifier cases
    incl. pool vs titan/campaign spawn split, fight vs
    evade, unlock-only row) green, AND corpus validator
    scripts/test-maxwave5-a.js green reproducing the
    verdict (UNLOCK/SPAWN/FIGHT/NONE) from the corpus
    JSON alone, without re-running the sim.
(d) ZERO src/js CHANGES: branch commits touch only
    evidence/ + scripts/. Verified by commit file lists.
(e) EVIDENCE + CORPUS: evidence/2026-11-02/sim-maxwave5-a.md
    + corpus evidence/2026-11-02/perseed-maxwave5-a/
    (replay JSON + sweep logs) written, stating in plain
    words what future runs may and may not claim from a
    maxWave=5 row.

## Verdict rule (pre-registered)

The arm's verdict is the strongest class proven by the
trace, in order NONE < UNLOCK < SPAWN < FIGHT < KILL:
report UNLOCK only if an unlock transition is observed;
SPAWN only if a wave-5 spawn is observed; FIGHT only if
a wave-5 fight is observed; KILL only if a wave-5 kill
is observed. If the replay drifts from the original row
but the trace + audit still classify the mechanism, the
verdict is about the MECHANISM (what maxWave=5 records),
with the drift stated — not about re-proving seed
97309's exact row. If the trace is empty of wave-5
events entirely, the verdict is UNLOCK-AT-END-STATE-ONLY
or ARTIFACT as the audit dictates, and the wall language
stays "wave 5 fought 0 in normal play" until a fight is
proven elsewhere.

## Metric review (for the NEXT run, never this verdict)

To be filled in the evidence file after the run. Known
candidate before running: the arrearsscreen corpus retains
only a sleep-census first-day (w5Day) and an end-state
maxWave — it cannot by itself distinguish unlock from
spawn from fight, which is why this arm exists. A future
screen's prereg should require a spawn + fight trace, or
should rename its wall column to maxWaveUnlocked to stop
the misreading at the source.
