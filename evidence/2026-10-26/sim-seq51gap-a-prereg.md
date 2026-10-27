# sim-seq51gap-a — PRE-REGISTRATION (binding, written BEFORE sweeping)

Run: fleshout-20261026T2317Z, arm sim-seq51gap-a, axis scale-onramp.
DIAG / MEASUREMENT ONLY: zero src/js changes, no default flips, no
combat/channel code changes, no lever proposal. In particular the
TB CHANNEL RESET (whether tb should inherit field wounds) is a
STEVE-CALL design question: traced only, never proposed as a lever,
never smuggled into a commit or evidence recommendation.

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md
(wave 4 = The Mirror Draft, standing >= 100; bands damage 35-95,
HP 850-1500, pierce 0.2-0.5).

## Question (from sim-w4dmg-a.md, DOCUMENTED GAP — not re-litigated)

73672 influencer seq51: last recorded field end is 799 HP (d143),
but the tb-start tile read at d148 shows the world entity at
586 HP — a 213-HP gap with no recorded fight in between (field
rows and tb starts for that seq were both checked; the tile row
is flagged lingering). This arm records the world entity's HP on
a daily tick to find where that 213 went. The surrounding
mechanism is NOT re-litigated: field wounds persist across field
meetings, tb damage does not carry back to the world entity.

## Substrate

- tableseat-nowait (scripts/policies/tableseat-nowait.js, wraps
  leanlinkrescue; compose upon it, never edit it), seeds
  73671-73678, 180d death-aware horizon (runDays stops on
  Game.over).
- Re-baseline FIRST: plain tableseat-nowait, 8 seeds, compared
  field-by-field against the 1920Z band table (wins 2/8,
  national-ever 6/8, national-final 5/8, table 4/8, entered 2/8,
  wave-4 6/8, wave-5 0/8, median 152d, deaths 307, starvation 1).
  Report any base delta field-by-field, never silently absorb
  it. Baseline is this arm's OWN replication (8 seeds), NOT
  another arm's corpus.
- Armed: tableseat-nowait wrapped with the five w4dmg-a
  recorders verbatim (w4dmg-diag, wave4enc-diag, spawnsrc-diag,
  fieldfinish-diag, nonworldkill-diag — no edits) PLUS ONE new
  observational recorder, scripts/policies/seq51gap-diag.js
  (SEQ51GAP=1, distinct name, never editing existing
  recorders): a DAILY world-entity HP tick for every world
  entity (day, spawn seq from the entity's recorder tag,
  monster type, entity hp, maxHp, tile tx/ty, lingering flag,
  lingerSince, alive/vanished via presence in the list),
  PLUS the tick-day village context (lastRaidDay, havenTier).
  Recorders never write game state, draw no RNG, never throw
  into the engine. They never call villageStandingTotal() or
  unlockedWave() mid-run.
- Tick timing (read from scripts/sim-harness.js): policy.daily
  runs once per loop iteration, after the day's actions and
  BEFORE sleep(). Sleep rolls the day and runs progDaily
  (havenGrowthDaily + havenRaidTick). So consecutive ticks
  labelled D and D+1 bracket exactly one night's progDaily
  plus day D+1's actions. The tick recorder is composed
  OUTERMOST, so its snapshot runs AFTER the inner policy's
  daily work, still before sleep. One tick per scholar day
  (duplicate same-day calls collapse to one row); a post-run
  pure-read snapshot closes the tail.
- Intra-interval anchors: a tick-to-tick interval also
  contains that day's field rows (start/end HP, seq, day)
  and tb-start tile reads (pre-fight world hp, seq, day).
  The trace is built as a chronological event chain per seq
  (tick, field fight, tb-start tile read, tb-end), NOT as
  tick deltas alone — because a night event and a same-day
  tb fight plus its restore can all fall inside one tick
  interval (see C2/C3 below: 799 -> raid -213 -> 586 at tb
  start -> restore +264 -> 850 at the next tick nets +51
  across the interval, and only the tb-start anchor splits
  it).

## Candidate-cause set (grep of src/js BEFORE sweeping — a cause
## not in this list may NOT be claimed from rows alone)

World entity = an object in state.worldMonsters (Game.
worldMonsters()). Tb fighters are built from the DEF at
startCombat (game.js startCombat lifts the world object via
removeWorldMonster(playerMonster()) and sets
tbfight.worldOrigin only for titan/lingering entities), so
tb damage lands on fighters, NOT on the world object, except
via C3. Tb-only writers (tbDamage, godverbs, sigW3/4/5, beam
hits, tb help-heals) are therefore NOT world-entity causes
and are excluded with that reason, not silently ignored.

- C1 RECORDED FIELD FIGHT: fieldFights.js writeback
  `m.hp = rec.mHpLeft` for every non-vKill outcome; the
  in-fight decrements to members[0].hp are the same event,
  not a second cause. Joined by seq + day from w4dmg/
  wave4enc/fieldfinish rows. (vKill removes the entity
  instead — see C5.)
- C2 PALISADE RAID WALL: havenGrowth.js havenRaidTick —
  when a raid fires (3+ living world monsters, pantry
  >= 3000 kcal, 7-day cooldown, 18% roll, table not
  active), every drafted raider is moved to the Haven tile
  and, if havenTier >= 2, takes
  `m.hp = max(1, hp - round(maxHp * 0.25))`. Raiders nobody
  meets then linger (lingering=true, lingerSince stamped)
  and gorge nightly (pantry only — no monster HP effect).
  Signature: lastRaidDay changes to the interval day,
  tile moves to the Haven tile, lingering flips true, and
  the drop equals round(maxHp * 0.25) exactly. NOTE the
  arithmetic on the target: round(850 * 0.25) = 213, and
  799 - 213 = 586 — the wall hypothesis predicts the gap
  EXACTLY, but the trace must still show the signature
  (raid day + tile + lingering) before C2 is claimed; the
  arithmetic alone is not the claim.
- C3 TB-END LINGERER/TITAN RESTORE: game.js tbEnd
  aftermath — a still-standing lingerer the scholar fled
  from or lost to is pushed back onto the world list at
  `o.hp = max(1, min(maxHp, standing[0].hp))` (standing =
  first live monster fighter of that species; crew/overtime
  scaling can make that larger than maxHp, so the cap
  binds); a titan is restored at full maxHp. Applies ONLY
  after a tb fight of that entity, never before its first
  tb fight — so C3 cannot explain the pre-d148 drop, but
  it is the predicted post-d148 value for seq51
  (min(850, 2395) = 850) and must be checked there.
- C4 SPAWN / REPLACEMENT: spawnWorldMonster creates a NEW
  object with hp = opts.hp or the def's hp[0] (850 for
  influencer) and maxHp the same; the spawnsrc recorder
  tags it with a NEW seq. A replacement shows as the old
  seq vanishing and a new seq appearing — a same-seq HP
  jump to base HP with no tick-continuity break is NOT C4.
- C5 REMOVAL / VANISH: removeWorldMonster (startCombat
  lift, watch-turn expiry, fled handling) takes the object
  off the world list; the tick shows ABSENT, not a changed
  HP. A later tbEnd push-back is C3, not C5. A vanished
  seq with no later reappearance is "gone", never a
  negative HP change.
- C6 TILE-READ vs ENTITY-READ MEASUREMENT DIFFERENCE:
  the prior arm's alternative — the tb-start tile read
  and the field record measure different things for a
  lingering entity. Test: the daily tick's entity hp on
  the days around d148 must agree with the tb-start tile
  hp (586) for the same seq; if the tick says 586 before
  any d148 fight, C6 is ruled out for the gap window. If
  tick and tile disagree, the disagreement itself is the
  finding and C6 is claimed only for the disagreeing
  reads, never as a blanket explanation.
- C7 OTHER ENUMERATED WRITERS (checked, no world-entity
  effect on this path): havenGrowthDaily lingering re-pin
  (tx/ty only, no HP); drift valve (lingering=false only);
  wanderWorldMonsters (tx/ty/mx/my only); maintainWorld-
  Monsters (spawns only, = C4); villagerMonsterTick routes
  through fieldFight (= C1); aid-crisis / sortie / raid-
  defense fights route through fieldFight (= C1).
  Anything outside C1-C6 found in the rows is reported as
  UNACCOUNTED with its HP amount, never forced into C7.

## Trace target and classification

- Primary: seq51 on seed 73672, day by day from its spawn
  (d131) through d148 and the post-tb tick, with EVERY HP
  change in the d143-d148 window classified into: C1,
  C2, C3, C4, C5, C6, or UNACCOUNTED (with HP amount).
  Every day in the window must appear in the trace — a
  missing day is a trace failure, not a gap in the story.
- Band-wide: every wave-4 entity on all 8 seeds — count
  unexplained HP drops (tick-to-tick or anchor-to-anchor
  changes matching none of C1-C6) across the whole corpus,
  and report the count even if it is zero.
- Also report: whether the tick on/around d148 agrees
  with the tb-start tile read (C6 test); the post-tb tick
  value for seq51 (C3 prediction: 850); havenTier and
  lastRaidDay on the drop interval.

## DIAG-GO threshold (binding — judge against this header)

DIAG-GO iff (1) every HP change for seq51 between d143 and
d148 is accounted to a named cause from C1-C6, OR is
explicitly reported as UNACCOUNTED with its HP amount and
the candidate causes enumerated (an honest unaccounted
remainder with candidates still counts as DIAG-GO ONLY if
no change is silently dropped — every day in the window
must appear in the trace); AND (2) a band-wide count of
unexplained HP drops across all wave-4 entities is
reported; AND (3) G2 recorder neutrality holds (baseline
== armed on days/gameDays/ts/starvation, 8/8) and
recorder errors are zero. A trace with missing days or
dropped changes is DIAG-NO-GO — say so plainly.
A cause not in C1-C6 may not be claimed from rows alone.

## Cost bar / gates (same discipline as w4dmg-a)

- G1 det-gate: recorders unset == unwrapped on one seed
  (days/gameDays/ts identical, no recorder surface, no
  installed wraps).
- G2 recorder neutrality: 8/8 seeds identical on
  days/gameDays/ts/starvation; faced-map agreement 8/8,
  kill-log agreement 8/8.
- Cost bar: armed starvation total <= baseline + 2 AND
  armed median days >= 0.8 x baseline median days.
- Cross-checks: (a) w4dmg field rows (wave 4) count ==
  wave4enc field rows (wave 4) count per seed; (b) every
  w4dmg tb row joins to a nonworldkill start (wave 4)
  minus explicitly-named unjoined rows; (c) every w4dmg
  field row passes the source-sum identity; (d) recorder
  errors zero, overflow zero; (e) every scholar day in
  [first tick, last tick] has a tick row per seed (tick
  coverage), and every seq51 tick in d131-d149 is present
  on seed 73672.

## Sense section

Read a small sample of transcripts around seq51's meetings
(field narrations, tb entries, any death/eulogy lines) and
judge whether the monster's weakening reads coherently to
a player; flag anything robotic, static, or repeated. Do
NOT chase the separate "wave-4 defeats mourned, never
taught" blank — note it only if the transcripts touch it.
Sense evidence comes from a NON-MEASURED narration-on
replay, never from census rows.

## Wall numbers (report for the coordinator's band compare)

National-ever/final, table, entered, wins, wave-4, wave-5,
wave-4 kills, median survival, death-cause shares — for
both the baseline and armed corpora on identical seeds.

## Metric review

Every evidence file carries a "metric review" section (§14).
Metric doubts go there for the NEXT run, never a mid-run
re-score. BALANCED PANEL (§15): balance-panel.js has no
corpus-ingest mode (standing limitation from prior arms) —
the paired identical-seed tables are the comparison of
record. No panel file is produced or faked.
scripts/telemetry-check.js is NOT run on recorder rows
(its counts are wrong on recorder rows).
