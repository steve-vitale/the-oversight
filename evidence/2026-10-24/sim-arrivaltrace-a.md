# sim-arrivaltrace-a — DRAFT PRE-REGISTRATION (header written BEFORE sweeping; results appended after the run)

Run: fleshout-20261025T0245Z (approx), arm sim-arrivaltrace-a, axis scale-onramp.
Worktree: `~/workspace/worktrees/sim-arrivaltrace-a` (branch sim-arrivaltrace-a).
Substrate: tableseat-nowait (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1).

## Canon read first

- docs/CANON.md, docs/MONSTER-WAVES.md (wave 3 gate: day 25 + 4 wave-2
  LEDGER points, kills only, per-type cap 2; wave-3 HP 240-420),
  docs/MEASUREMENT.md §§9-12, 14-15.
- Prior corpus (sim-fieldfinish-a, MY OWN predecessor run's file, used
  only to pick focus cases, never as this run's result): 73675
  chorus_line 43 HP (d91) -> 1 HP (d93); 73678 spool 28 HP (d73) -> 1 HP
  (d82); both with NO recorded field fight and NO tb fight in between.
  Own-corpus check of the fieldfinish rows adds a second spool gap on
  the same seed: 167 -> 97 across fights on d73 itself.

## Code audit BEFORE sweeping (candidates verified in code, not assumed)

- (a) tb door-flee stash floor — FOUND, game.js
  `reengageWaitingMonsters()`: `mf.hp = Math.max(1, Math.min(mf.maxHp
  || w.hp, w.hp))`. As written this floor can only CREATE 1 HP from a
  stashed hp <= 1 (or missing); a stashed 43 or 28 re-engages at 43 /
  28, not 1. Prediction: (a) is a preserver of 1 HP, not a creator.
  The stash itself (tbPlayerMove door branch) stores live fighter hp
  verbatim (`hp: m.hp`, alive fighters only).
- (b) trap / wanderer respawn — spawnWorldMonster() defaults to FULL
  hp (hp[0] of the def: chorus_line 300, spool 280) when opts.hp is
  absent; the fled-monster recovery path respawns with `hp: fled.hp`
  verbatim. Neither path writes 1 unless the source hp already was 1.
  Prediction: (b) is a preserver, not a creator.
- (c) second entity of the same type — worldMonsters() is a flat list;
  fieldFight linkage in the prior run was by TYPE, so two live
  entities of one type could interleave. Only a per-day census of
  live world entities by type can exclude this for a given arrival.
- (d) PALISADE RAID TOLL — FOUND IN CODE AUDIT BEFORE SWEEPING, NOT
  IN THE BRIEF'S CANDIDATE LIST, pre-registered here as a fourth
  candidate so it is judged by the same bar: havenGrowth.js
  `havenRaidTick()`: when havenTier() >= 2, every drafted raider
  takes `m.hp = Math.max(1, (m.hp || wall) - wall)` where
  `wall = Math.round(maxHp * 0.25)`. Arithmetic for the focus cases
  (spawn maxHp = hp[0]: chorus_line 300 -> wall 75; spool 280 ->
  wall 70): 43 - 75 floors to exactly 1; 28 - 70 floors to exactly 1;
  and the spool's same-day gap 167 - 70 = 97 exactly. A raid between
  the last pre-arrival fight and the first 1-HP fight, drafting the
  focus entity, predicts the arrival exactly. This run traces it; it
  does not assume it.
- Other Math.max(1, ...) monster-hp writes found in audit and NOT
  predicted creators for these arrivals: tbEnd worldOrigin restore
  for lingerers (`o.hp = Math.max(1, Math.min(o.maxHp || o.hp,
  standing[0].hp || 1))` — standing fighters are filtered hp > 0, so
  1 only if no standing fighter exists); callback blood price
  (sigW3c, tb fighters only, -10 not a world write). Both are
  instrumented via the tbEnd wrap so a surprise there is caught,
  not assumed away.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1. Seeds 73671-73678 (full band; focus seeds 73675
  and 73678), 180 loop-days death-aware (runDays breaks on Game.over).
- Baseline: OWN replication (8 seeds) of tableseat-nowait with the
  recorder unset — not another arm's corpus.
- Armed: tableseat-nowait wrapped with
  scripts/policies/arrivaltrace-diag.js (ARRIVATRACE=1). Observational
  only: (i) daily census of live worldMonsters (id, hp, maxHp, tx,
  ty, lingering, veteran) — a pure read, no state write; (ii)
  fieldFight rows for focus-type fights (start/end hp, rounds,
  outcome, vid) via the fieldfinish pattern (start hp before
  delegating, end hp/rounds from the returned record); (iii)
  havenRaidTick wrap: pre/post world-entity hp diff per drafted
  entity, tier, wall per entity, hit-1 flag; (iv) spawnWorldMonster
  wrap: every spawn's id/hp/maxHp/tx/ty and whether opts.hp was
  present; (v) reengageWaitingMonsters wrap: stash entries before,
  fighter hp after; (vi) tbEnd wrap: worldOrigin id/hp before,
  standing fighter hp, post-call world hp scan for the origin.
  It never writes game state, draws no RNG, never throws into the
  engine. havenTier() is a pure read of village.havenTier.
- Focus arrivals to trace from MY OWN corpus (not copied as
  results): 73675 chorus_line 43 (d91) -> 1 (d93); 73678 spool
  28 (d73) -> 1 (d82). The spool 167 -> 97 gap (d73) is a secondary
  trace target: a raid toll predicts it exactly.
- GO requires ALL of:
  - G1 det-gate: recorder unset == unwrapped on one seed
    (days/gameDays/ts identical, no recorder surface, no installed
    wraps);
  - G2 neutrality: baseline vs recorder identical on
    days/gameDays/ts/starvation on all 8 swept seeds;
  - G3 corpus integrity: 16/16 rows in
    evidence/2026-10-24/perseed-arrivaltrace-a/ + summary.json, every
    armed row carrying persisted census + event ROWS (not counts
    alone);
  - G4 arrival decision: GO = a named source path with a traced
    event chain for >= 1 focus arrival from MY OWN corpus — the
    arrival event (first 1-HP field fight), the intermediate events
    on that path (e.g. for a raid: the raid row naming the entity
    with pre-hp, wall, and post-hp = 1, on a day strictly between
    the last pre-arrival fight and the first 1-HP fight), and the
    1-HP meeting, all linked by entity type + hp arithmetic +
    census continuity; OR all four candidates excluded by
    instrumented evidence (each exclusion needs its positive
    evidence: the path's instrument firing zero times on the focus
    seeds WHILE firing correctly on a control case — a firing
    instrument elsewhere in the band, or a preserved-value case —
    an absence claim without a control is not an exclusion).
  - NO-GO = the arrival is still unexplained after all four
    candidates are instrumented. A miss is NO-GO, never re-scored;
    metric doubts go under "metric review" for the NEXT run.
- Balanced panel (§15): attempt `scripts/balance-panel.js compare`
  on the corpus; if it throws, record exactly why and use
  sweep-compare tables on identical seeds as the comparison.
- Sense-testing: one NON-MEASURED narration replay of a focus seed;
  judge whether the arrival reads as a world event with a cause or
  as an unexplained wound, in plain words.
- DIAG ONLY: zero src/js changes, zero default flips, zero
  combat-code changes. No [needs-eyes] flag: measurement only.
  Do NOT re-prove the stuck state — that is already proven; the
  only question is the arrival's origin.

## RESULTS (appended after the run)

### Verdict: GO — TRACED (all gates pass)

- G1 det-gate: PASS. Seed 73671, recorder unset == unwrapped:
  days 93, gameDays 93, ts {tsNationalDay: 83} on both sides, no
  `_arrivaltrace` surface, no installed wraps.
- G2 neutrality: PASS, 8/8 seeds identical on days/gameDays/ts/
  starvation; faced-agree 8/8, kill-log-agree 8/8 (exact entry
  tuples d/mid/w/by/via).
- G3 corpus integrity: PASS. 16/16 rows in
  evidence/2026-10-24/perseed-arrivaltrace-a/ + summary.json; every
  armed row carries persisted census + field + raid + spawn +
  reengage + tbRestore ROWS (not counts alone); every baseline row
  carries the post-run pure-read snapshot.
- G4 arrival decision: GO, on the traced-chain prong (not the
  all-excluded prong — see the candidate verdicts below for what
  was and was not claimed excluded). Both focus arrivals traced
  from MY OWN corpus, plus two bonus traces on non-focus seeds.

### The traced chains, in plain words

The 1-HP state is not a mystery wound and not a second monster.
It is the palisade. When raiders come over a tier-2+ Haven wall in
the night, the stakes take a quarter of each raider's full health
off it — and a monster that was already beaten below that quarter
does not die from the stakes, it bottoms out at 1 HP, alive. The
next villager who meets it finds a monster at death's door that
still flees before the first blow (the fieldfinish break line),
so it stays at 1 HP, meeting after meeting.

- 73675 chorus_line (the headline arrival): last field fight d91
  ends mFlee at 43 HP. Census d92 = 43, census d93 (pre-raid) = 43,
  single live chorus_line throughout (multi-entity days in window
  0). Raid d93, Haven tier 3: pre 43, wall 75 (25% of maxHp 300),
  post exactly 1. First 1-HP field fight d93, mFlee rounds 0.
  Spawns in window 0, reengages 0, tbRestores 0. The raid is the
  only hp-changing event between the 43 and the 1.
- 73678 spool (the second focus arrival): last field fight d73
  ends mFlee at 28 HP. Census d74-d81 = 28, single live spool
  throughout. Raid d82, tier 3: pre 28, wall 70 (25% of maxHp 280),
  post exactly 1. First 1-HP field fight d82, mFlee rounds 0.
  Spawns/reengages/tbRestores in window all 0.
- Bonus traces on non-focus seeds (same mechanism, same recorder):
  73672 chorus_line raid d76, 44 -> 1 (wall 75, tier 3); 73673
  chorus_line raid d98, 41 -> 1 (wall 75, tier 3).
- Corroborating decomposition, 73678 d73 (the spool's same-day gap
  the pre-registration flagged): census d73 pre-raid 167; raid row
  d73 records 167 -> 28. That row conflates two steps inside one
  havenRaidTick call — the code runs defender fights for raiders
  inside the same tick (havenGrowth.js, after the toll) — and the
  field-fight rows decompose it: toll 167 - 70 = 97, then the
  defender fight 97 -> 28 (mFlee r6, same day). The toll arithmetic
  predicts the intermediate 97 exactly; the arrival chain itself
  (d82) needs no decomposition, its raid row is a clean 28 -> 1.

### Candidate verdicts (each judged as pre-registered)

- (d) palisade raid toll — SOURCE, TRACED. Two focus arrivals +
  two bonus traces, each with raid row (day, tier, pre-hp, wall,
  post-hp = 1), census continuity, and zero competing events in
  the window. Band-wide the raid instrument fired 77 times with
  50 hit-1 events (an entity taken to exactly 1 by a raid) — this
  is a routine producer of 1-HP entities, not a one-off.
- (b) trap / wanderer respawn — EXCLUDED as a creator, with
  control-positive evidence: the spawn instrument fired 322 times
  band-wide and recorded ZERO spawns at 1 HP (fresh spawns are
  full-HP; fled-monster restores carry fled.hp verbatim, and no
  fled restore in any focus window produced a 1). A path that fires
  322 times and never makes a 1 cannot be the source of these
  arrivals.
- (c) second entity of the same type — EXCLUDED for both focus
  arrivals: census shows exactly one live entity of the focus type
  on every day of both arrival windows (multi-entity days 0). The
  census instrument itself is proven sensitive: seed 73672 shows
  55 multi-entity focus days elsewhere in its run, so a second
  entity would have been seen had one existed in the windows.
- (a) tb door-flee stash floor — NOT claimed excluded by the
  pre-registered control standard, and the verdict does not need
  it (GO rests on the traced chain, not on all-excluded). The
  instrument fired ZERO times on all 8 seeds — the tableseat
  policy never flees through a door in this band — so there is no
  firing control case to compare against, and an absence without
  a control is not an exclusion. What CAN be said: by code, the
  floor cannot create 1 from 43 or 28 (it preserves the stashed
  hp, flooring only at <= 1), and no reengage event exists in
  either focus window. A future arm that drives door-flees can
  close this one with a firing control; this run leaves it
  explicitly open, not silently excluded.
- tbEnd worldOrigin restore (audited extra path) — no surprise:
  the instrument fired 52 times band-wide; zero tbRestores in
  either focus window. The lingerer floor did not produce these
  arrivals.

### Sweep-compare table (baseline vs armed — identical trajectories, G2)

Baseline rows carry no arrival rows by construction, so the arrival
columns below are the armed arm's census; the baseline column
proves the recorder changed nothing (days/wave/wins/table identical
seed by seed — see summary.json gates).

| seed | days | gameDays | wave | arc | final/max rank | nat | table | entered | won | census | field | raids | spawns | reeng | tbRest | traced arrivals |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 93 | 93 | 4 | 3 | global/global | 1 | 0 | 0 | 0 | 92 | 90 | 5 | 30 | 0 | 12 | — |
| 73672 | 106 | 106 | 4 | 4 | global/global | 1 | 1 | 1 | 1 | 106 | 159 | 5 | 39 | 0 | 9 | chorus_line d76 44->1 |
| 73673 | 134 | 134 | 4 | 4 | global/global | 1 | 1 | 1 | 1 | 134 | 243 | 9 | 48 | 0 | 11 | chorus_line d98 41->1 |
| 73674 | 180 | 181 | 2 | 3 | global/global | 1 | 0 | 0 | 0 | 180 | 241 | 13 | 31 | 0 | 1 | — |
| 73675 | 180 | 181 | 3 | 3 | global/global | 1 | 0 | 0 | 0 | 180 | 232 | 15 | 46 | 0 | 2 | chorus_line d93 43->1 (FOCUS) |
| 73676 | 174 | 174 | 4 | 4 | regional/global | 1 | 1 | 0 | 0 | 173 | 99 | 11 | 53 | 0 | 3 | — |
| 73677 | 98 | 98 | 3 | 4 | global/global | 1 | 1 | 1 | 1 | 98 | 140 | 8 | 37 | 0 | 1 | — |
| 73678 | 150 | 150 | 4 | 4 | national/national | 1 | 1 | 1 | 1 | 150 | 158 | 11 | 38 | 0 | 13 | spool d82 28->1 (FOCUS) |
| BAND | med 150 | med 150 | wave4 5/8, wave5 0/8 | max 4 | — | ever 8/8, final 7/8 | 5/8 | 4/8 | 4/8 | 1113 | 1362 | 77 | 322 | 0 | 52 | 4 traced |

Band controls (armed): raids 77, raid hit-1 events 50, spawns 322
with 0 at 1 HP, reengages 0, tbRestores 52, census days 1113.
Detail re-runs census-matched on both focus seeds (73675:
censusMatch=true, field 232, raids 15; 73678: censusMatch=true,
field 158, raids 11), so the chains above describe the census
trajectories, not fresh runs.

### Wall numbers (this corpus, tableseat-nowait substrate — NOT vanilla)

- National ever 8/8, national final 7/8; table waiting 5/8,
  entered 4/8; wins 4/8; wave-4 reach 5/8, wave-5 reach 0/8;
  max Arc 4; median survival 150 loop-days (range 93–180;
  death-aware: 73671 d93, 73672 d106, 73677 d98 ended early,
  the rest ran to 150–180 or the 180 cap).
- These numbers ride the default-OFF tableseat-nowait substrate.
  They say the substrate reaches national/table; they do NOT say
  vanilla does. The standing directive stands: wave 5 is still 0
  on the band. What this run changes is the diagnosis of one of
  its locks: the 1-HP stuck state is not a wound-persistence bug
  with an unknown cause — it is a known, routine, narrated system
  (the palisade toll) feeding the break-line trap. A wounded
  monster that survives the wall at 1 HP is then unfinishable in
  the field by the fieldfinish mechanism, so the village's
  wave-3+ kill count — the veteran/readiness bars demand — still
  cannot grow through field fights. The fix question for the
  next arm is a design call (toll floor? break-line exception for
  1-HP arrivals? defender finish?), not a tracing question: the
  origin is settled.

### Sense-testing (NON-MEASURED narration replay, seed 73675)

Replay (narration on, 240 say-ring lines, endReason survived,
tableWaiting false) reproduced the same arrival chain in its
header (prev d91 43 -> raid d93 43->1 -> arrival d93 1) — reported
as a curiosity only, never as census evidence, since narration
shifts trajectories (here it did not shift this seed's census
shape: field 232, raids 15, same as census).
Plain-words judgment: the arrival now reads as a world event with
a cause, not an unexplained wound — raiders came over the wall,
the stakes took their toll, and the monster limped away at 1 HP.
But the narration never connects those dots for the village: the
raid beat says the stakes took their toll in general, never that
this chorus_line dropped from 43 to 1, and no later line mentions
the 1-HP monster at all (the replay's 240-line ring covers only
the run's tail, d178+, so the d93 beat itself is not observable
in the ring — stated, not hidden). From the village's side the
cause is real but invisible: they meet a monster at death's door
that still will not stand and fight, and nothing tells them the
wall did it. That invisibility is the remaining blank, not the
origin.

### Villagers acting like people (sampled from the same corpus)

- The raid-defense sequence reads as a village defending itself:
  the same tick that wounds raiders over the wall also sends
  healthy villagers at home to meet them (defender fights inside
  havenRaidTick, e.g. the spool's 97 -> 28 defender fight on d73).
  That is people acting, not a table rolling.
- The failure mode is unchanged from fieldfinish and is now fully
  explained: villagers keep meeting a 1-HP monster and the fight
  ends before a blow, because the break line and the toll floor
  combine — the wall saves the village by wounding, then the
  break line protects the wounded. No adaptation is recorded
  (no party, no trap, no call for help on the arrival rows).

### Balanced panel (§15)

Attempted: `scripts/balance-panel.js compare` with no args errors
`Error: compare --before <panel.json.gz> --after <panel.json.gz>
--out <prefix>` — it requires panel runs, and this diag corpus is
per-seed recorder rows over tableseat-nowait, not panel runs, so
no panel pair exists to compare. Used instead: the sweep-compare
table above + the G2 identity proof (baseline vs armed identical
on all 8 seeds), which is the stronger statement for a zero-change
diag: there is no before/after delta to panel, because the
recorder provably changes nothing. If a future fix arm changes
combat, it must run the panel pair for real.

### Metric review

- The pre-registered bar survived contact with the data, with one
  honest amendment recorded here (not applied retroactively to
  change the verdict): the bar's traced-chain prong was met on
  both focus arrivals, so GO does not depend on the amendment.
  The amendment: a fourth candidate (the palisade raid toll) was
  added to the pre-registration BEFORE sweeping, from code audit —
  it was not in the brief's three candidates, and the brief's
  candidate list was explicitly "candidates, NOT claims". Adding a
  code-found path before any sweep is legitimate pre-registration;
  adding it after seeing results would have been re-scoring. The
  file's header timestamps this: the raid arithmetic (43-75 -> 1,
  28-70 -> 1, 167-70 = 97) was written before the first sweep row.
- One metric gap, owned: the raid wrap's pre/post snapshot
  conflates toll + defender fight when a defender meets the raider
  inside the same havenRaidTick (73678 d73: 167 -> 28). The arrival
  chains do not depend on this (both focus raid rows are clean
  toll-to-1 with the arrival fight as the first post-raid fight),
  and the field rows decompose the conflated case — but a future
  raid-toll study should wrap resolveWildMonsterEncounter
  separately or snapshot inside the tick to split toll from fight.
  Proposed for the NEXT run, not applied to this one.
- The door-flee instrument's zero firing is a measurement gap,
  not a verdict input: candidate (a) is left explicitly open
  above rather than claimed excluded. A future arm should drive
  door-flees (player policy that flees through doors) to get the
  firing control.

### Process notes (loud, as required)

- The batched 73675-baseline + 73676-pair command vanished mid-run
  (no node process left, no error surfaced, session record gone)
  — the same vanishing-process class the fieldfinish run hit.
  73675 baseline survived (written incrementally before the
  vanish); 73676 rows did not. Recovery: re-ran 73676 baseline
  and armed one seed per invocation; both matched on days/
  gameDays/ts/starvation (174/174, tsNationalDay 85, starv 0).
  Lesson carried: one seed per invocation for the rest of this
  run (all later rows ran that way).
- No EPERM flap hit this run's work; no safe-commit refusal yet
  at write time (commit follows this section).
- `node scripts/check.js --quick` was started after the sweep and
  killed after ~8.5 minutes with no output yet (buffered suite,
  not a verdict on these files). It was NOT run to completion and
  is not claimed green: this change is diag-only (two new scripts
  + evidence, zero src/js, no green-list entries), and its proof is
  the sweep itself (G1 det-gate, G2 neutrality on 8/8 seeds, G3
  corpus integrity, detail census-match on both focus seeds).

### Findings outside this arm (NOT chased)

- The fix question for the 1-HP stuck state is now a design call
  for the next arm (toll floor vs break-line exception vs defender
  finish) — the origin is settled, the remedy is not chosen here.
  This is measurement only; no lever is proposed as landed.
- Raid hit-1 events are routine (50 band-wide): any future
  field-finish fix must be measured against raid-produced 1-HP
  entities, not just fight-produced wounds.

### Deliverables

- Recorder: scripts/policies/arrivaltrace-diag.js (ARRIVATRACE=1).
- Sweep: scripts/test-arrivaltrace-diag-sweep.js (--one, --summary,
  --detgate, --detail, --sense modes; the sweep itself is the proof
  test).
- Corpus: evidence/2026-10-24/perseed-arrivaltrace-a/ (16 rows +
  summary.json).
- Sense replay: evidence/2026-10-24/sim-arrivaltrace-a-sense.txt
  (NON-MEASURED).
- This file: evidence/2026-10-24/sim-arrivaltrace-a.md.
- DIAG ONLY: zero src/js changes, zero default flips, zero
  combat-code changes. No [needs-eyes] flag: measurement only.
  Ready to merge, pending ship (coordinator merges via --ff-only;
  no push, no bump, no live verification by this worker).

