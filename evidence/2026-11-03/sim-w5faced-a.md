# Wave-5 faced wall — adoption closeout (run fleshout-20261103T0203Z, axis scale-onramp)

Diagnostic only: zero `src/js` changes, zero policy changes, zero default flips.
Instrument + driver + analyzer + proof test were committed by the previous worker
(b3e915e59); this closeout adds only the per-seed corpus and this evidence file.
No game change is proposed here; the verdict below is a measurement for the
coordinator, not a lever.

## Adoption inventory (what was inherited, what was missing)

Prereg: `scripts/wave5encounter-diag-prereg-20261103.md` (commit 7e93b883f,
committed before any judged sim). It binds this closeout: horizon 180d
death-aware, closecommit policy stack verbatim
(titanroute + musterclose + mustergap over lead-fullseat, env
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1
HERALD=1, mode `herald`, one process per seed), anchor seed 98201 first,
candidates re-run from earlier corpora, fresh 8-seed pilot ONLY if fewer than
2 wave-5-unlocked seeds result. GO rule: separate the wave-5 bottleneck
mechanism on >= 2 wave-5-unlocked seeds (spawn failure vs conversion failure
distinguished by stage counts), or report verified scarcity honestly. A
verdict from a single seed alone is not claimed.

Inherited corpus (`evidence/2026-11-03/perseed-w5faced-a/`, all timestamped
02:19–02:21Z, all `anchorCommit` = b3e915e59d92, all `instrumentErrors` = []):

| leg | days | end | verdict on the leg |
|---|---|---|---|
| w5-closecommit-s97310-w5diag.json | 86 | village-lost | VALID, did NOT unlock wave 5 (maxWave 4) — a candidate lead that failed re-run verification, not a counted unlocked seed |
| w5-closecommit-s97409-w5diag.json | 180 | survived (cap) | VALID, unlocked wave 5 |
| w5-closecommit-s97418-w5diag.json | 90 | over-other, lesser win | VALID, unlocked wave 5 |
| w5-closecommit-s97438-w5diag.json | 95 | over-other, lesser win | VALID, unlocked wave 5 |
| w5-closecommit-s98201-w5diag.json | 90 | over-other, lesser win | VALID, anchor REPRODUCED: unlock d76, standing 307, 4 wave-4 kinds faced, 0 wave-5 faced, lesser win d90 — exactly the 1915Z pattern |

Missing legs for counts: NONE. Four wave-5-unlocked seeds (>= 2 required), so
the prereg's fresh-pilot clause did not trigger and no new judged seed was run.
The one missing artifact was the say transcript: the driver writes says to
`/tmp` only, and `/tmp` did not survive the previous worker's transport
failure. It was recovered with a transcript-only re-run of seed 97418
(`RUN=sense`, says to `/tmp/w5-sense`): every driver summary field reproduced
the inherited leg exactly (90d, over-other, won, global, maxWave 5, gateW5 1,
targetW5 2, castW5 0, spawnW5 3, triggerW5 0, startW5 0, fieldW5 1, removeW5 0,
tableDone, lesser seat, says 9888, errors 0). The sense JSON was then DELETED
from the evidence directory, so the judged corpus is exactly the 5 inherited
legs above — the re-run contributed transcript only, never counts. (Byte
identity was not claimed: the sense JSON was removed before a structured
field diff; the summary-field identity above is what was verified.)

Proof test on this branch: `node scripts/test-wave5encounter-diag-20261103.js`
→ 22/22 checks passed. Analyzer: `node
scripts/wave5encounter-analyze-20261103.js` over the 5-file corpus (no
analyzer fix was needed).

## Stage tables (wave 5 only; window = unlock day → run end)

Gate = first day `unlockedWave() >= 5`. Pool = `monsterWavePool()` wave-5
entries (same 6 kinds on every unlocked seed from unlock day to run end:
cancellation, editor, rerun, spoiler, timeslot, network_note). Target =
`spawnWaveTarget()` calls in the window; Spawn = `spawnWorldMonster()`
wave-5 rows; Cast = `castMonster()` wave-5 returns; Trigger =
`triggerEncounter()` wave-5 calls; Start = `startCombat()` wave-5 starts;
Field = `fieldFight()` wave-5 rows; Faced = distinct wave-5 kinds in
`deedState().wavesFaced` at run end (deedGate needs 2).

| seed | unlock (standing) | window | target (of calls) | target=5 | cast | spawn | trigger | start | field | faced / 2 |
|---|---|---|---|---|---|---|---|---|---|---|
| 98201 (anchor) | d76 (307) | 14d → lesser win d90 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 97438 | d88 (250) | 7d → lesser win d95 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 97418 | d60 (367) | 30d → lesser win d90 | 8 | 2 (d77, d83) | 0 | 3 | 0 | 0 | 1 | 1 (editor) |
| 97409 | d156 (252) | 25d → 180d cap | 4 | 1 (d176) | 0 | 2 | 0 | 1 | 0 | 1 (timeslot) |
| 97310 | never (end standing 199) | — | — | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Spawn detail (the 5 analyzer spawnW5 rows, and what they really are):

| seed | spawn (day, caller, dist to player) | became |
|---|---|---|
| 97409 | finale_crew (d172, other, 1) | nothing — still on the world at d181; `finale_crew` is `campaignOnly` in the monster data, a finale-campaign entity, not a free-roam fight candidate |
| 97409 | timeslot (d176, checkEncounter, 0) | `startCombat` d180, provenance `world:timeslot` → faced (timeslot) |
| 97418 | finale_crew (d76, other, 3) | nothing — still on the world at d90; campaignOnly, as above |
| 97418 | rerun (d77, checkEncounter, 0) | nothing — still on the world at d90, 13 days after spawning ON the player's tile; never a fight, never removed |
| 97418 | editor (d83, checkEncounter, 0) | `fieldFight` d83, villager devon_okafor, outcome `vFlee` → faced (editor) |

Aggregate over the 5 legs: unlocked 4/5, post-unlock target calls 13 total
(3 returning 5), fight-candidate spawns 3 (timeslot, editor, rerun — excluding
the 2 campaignOnly finale_crew rows the analyzer counts), fight candidates
converted 2/3, distinct wave-5 kinds faced per unlocked seed 0, 0, 1, 1 —
none reaches the 2 the full seat needs. CastW5 = 0 and triggerW5 = 0 on all
five legs; wanderer wave-5 days = 0 on all five. Total target calls per run
44–61 over 86–180 days (≈0.3–0.5/day); total spawns per run 43–62.

## Verdict: GO (diagnostic success) — bottleneck separated on 4 unlocked seeds

**The bottleneck is spawn-opportunity scarcity inside a window the lesser-seat
win truncates — not the pool, not readiness, not the wanderer channel.**

1. **Pool and gate are not the block.** All 4 unlocked seeds show the full
   6-kind wave-5 pool from unlock day to run end, and unlock itself is
   standing-gated only (see correction below). The wave is available; it
   just almost never gets a spawn opportunity before the run ends.
2. **Spawn failure on the short-window seeds.** 98201 gets exactly 1 spawn
   opportunity in its 14-day post-unlock window (target → 3, never 5) and
   97438 gets zero in 7 days. Both end in a lesser win 7–14 days after
   unlocking. A village that unlocks wave 5 and promptly sits has, in
   practice, no wave-5 encounter pipeline at all.
3. **Thin spawn, thin conversion on the long-window seeds.** 97418 (30d)
   and 97409 (25d) each convert exactly one fight candidate and end with
   1 of the 2 distinct kinds needed. The observed rate is roughly 1 faced
   kind per 25–30 unlocked days, so 2 distinct kinds need on the order of
   50–60 unlocked days — longer than the lesser-win truncation on 3 of the
   4 unlocked seeds, and only just inside the 180d cap on the survivor.
4. **Secondary conversion leak: the Rerun never engages.** Rerun spawns on
   the player's tile (d77, dist 0) and is still wandering 13 days later with
   no fight and no removal. The transcript announces it once ("Something
   moves out there — The Rerun. It followed you.") and then never mentions
   it again. Why a spawned, following wave-5 monster never converts is a
   separate open question for the coordinator (it is NOT answered by these
   counts — do not cite it as proven mechanism).
5. **The wanderer/cast channel contributes zero, but it is not the
   bottleneck.** castW5 = 0, triggerW5 = 0 everywhere, and every wave-5
   contact in this corpus arrives via world spawn → checkEncounter /
   fieldFight / startCombat. Removing the wanderer channel from the story
   changes nothing; the world-spawn channel is where the scarcity lives.

What this verdict is NOT: wave 5 is not unreachable and not unfightable —
two seeds each faced a real wave-5 kind (timeslot in a player turn-based
fight, editor in a villager field fight that ended in a flee and still
counted as faced). The full seat stays bound on wave 5 because the second
distinct kind never arrives in time, not because the first kind cannot be
fought.

Descriptive wall numbers (not judged — this arm is diagnostic): 5 legs,
wins 3 (all lesser seat, path feared), tableDone 3, tableWaiting latch 1
(97310, set before the village was lost — a latch artifact, not a table
reach), national/global scale 3 (97409 global survived, 97418 + 98201 global
lesser; 97438 regional lesser; 97310 regional lost), maxWave 5 on 4/5,
median survival 90d (days 86, 90, 90, 95, 180). Near-miss note: 97310 died at
d86 with end standing 199 — one point short of the t5 200 bar — with
readiness-5 short on armor, weapons, and veterans.

## Sense-testing (transcript read, seed 97418, days 60–90, 3269 lines)

Coherent arrival, silent on the actual blocker — judged on meaning, not counts.

- **The arrival lands.** d60, the System announces the Producers in plain
  fiction: "You've gotten too big for the story. Ratings are GREAT, by the
  way — but you're threatening the narrative now. So the narrative is
  fighting back. Meet the PRODUCERS." A player learns wave 5 has arrived
  and why. That line is good.
- **The one faced fight reads as a real village event, not a stat.** d83:
  "Something moves out there — The Editor. It followed you. The Editor is
  here." … "The Editor stops at the treeline — pacing, unwilling. The walls
  end the argument." Then a night raid — "3 raiders (The Algorithm, The
  Editor, The Eulogy) hit Haven in the night" — "Mia and Devon met them at
  the door — 2 barely walked away. Mia, Devon are hurt." The deed counts
  editor as faced even though the field fight ended in a villager flee, and
  the transcript supports that reading: the village met the Editor at its
  door and survived it.
- **The Rerun's silence is the incoherence.** Announced d77 ("It followed
  you. The Rerun is here."), then nothing for 13 days while it wanders the
  world tiles. Nothing explains why it never comes to the door the way the
  Editor did.
- **Nothing says a wave-5 fight matters for the full seat.** The d90 audit
  reports the count without the requirement: "A lesser seat — global
  standing, waves 1–3 faced (15/7/3), with 5 wave-4 and 1 wave-5 fought, 11
  contests survived, 3 crises weathered. The table does not rise. It
  prices." The only wave-5-bar line in the window is about a different bar:
  "Even now the wave-5 bar reads: blood your fighters (1 of 2 veterans)"
  — the readiness veterans bar, not the 2-distinct-faced deed bar. A player
  finishing this run learns they got a lesser seat and fought one wave-5
  kind; nothing in the game tells them a second distinct wave-5 kind was
  the missing piece, or how to get one. That silence is a blank worth
  documenting (narration/guidance, not a balance lever — diagnostic only,
  no change made here).

## Corrections to the prereg's mechanism story (measured, not assumed)

- **Readiness does NOT keep wave 5 out of the pool on this branch.** The
  prereg repeated the claim that while any `waveCombatReadiness(5)` bar is
  short, standing holds at t5−1 and the wave stays out of the pool. Seed
  97438 contradicts it directly: d87 unlocked 4 at standing 199; d88
  unlocked 5 at standing 250 with readiness-5 short on armor AND veterans,
  and the 6-kind wave-5 pool present from d88 to run end. Seed 97418
  likewise returns target 5 (d77) and spawns rerun while readiness-5 is
  short on veterans. The code agrees: `unlockedWave()` in `src/js/game.js`
  reads standing (t5 = 200) plus the wave-3 rung plus wave-4 faced only —
  "unlockedWave() now reads villageStandingTotal() only." Readiness bars
  are a separate display/gate (the endGate `holdKind: defer5` vs
  `released` field records them without blocking unlock or pool). Any
  future arm that treats readiness as the wave-5 gate will be measuring
  the wrong mechanism.
- **Analyzer caveat for the next run: `finale_crew` inflates spawnW5.**
  It is `campaignOnly` in `src/data/monsters.json` and never converts in
  either seed where it spawns. Fight-candidate spawn counts should exclude
  it (3, not 5, here). No analyzer fix was made in this closeout — the
  instrument is the previous worker's, adopted verbatim — but the next
  analyzer revision should split campaignOnly spawns out of the
  fight-candidate stage.
- **Analyzer window quirk (cosmetic):** daily rows include a duplicate
  final snapshot, so the analyzer's `unlockDays` row-count runs one over
  the calendar window (e.g. 97418: 32 rows for d60–d90). Window lengths in
  this evidence use unlock day → end day, not the row count.

## Metric review (for the NEXT run only; this run is judged on its prereg)

- The staged counts bound the question fairly: gate → pool → target →
  spawn → cast/trigger → start/field → faced separates spawn failure
  (98201, 97438) from thin-spawn-plus-partial-conversion (97418, 97409)
  without re-scoring. The single-seed prohibition was honored by the
  corpus itself (4 unlocked seeds, not 1).
- Proposed revisions for the next run only: (a) split campaignOnly spawns
  from fight-candidate spawns in the analyzer; (b) drop the readiness-hold
  premise from the prereg and replace it with the standing-only gate as
  coded; (c) if the next question is the Rerun non-engagement, it needs a
  villager/world-monster behavior instrument, not this spawn-stage one —
  this instrument can show the Rerun lingering but cannot say why it
  never raids or fights.
- Panel note: no before/after comparison exists in this diagnostic arm
  (no lever, no variant), so `scripts/balance-panel.js` has nothing to
  compare; the analyzer output over the 5-file corpus is the instrument
  record. No telemetry-baseline roll-forward is claimed here — that is
  the coordinator's call.
