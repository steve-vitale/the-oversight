# sim-wave4enc-a — wave-4 encounter decomposition (axis scale-onramp)

Run: fleshout-20261026T1816Z follow-up, arm sim-wave4enc-a. DIAG /
MEASUREMENT ONLY — zero src/js changes, no default flips, no
veterans-bar or demand-number changes (readyDemand numbers are NOT
moved on this evidence).

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft, standing >= 100; bands damage 35-95, HP 850-1500,
pierce 0.2-0.5; readiness bars wave 4: 3 armored P>=10 / 5 armed /
3 tricks / 1 veteran killed wave-3+; wave-5 veterans bar 2 living
wave-4+ killers), docs/CONTESTS.md only if contest gates are touched
(they are not — contest-arena tb fights appear only as a tb door
label, never as a gate change). No design is invented here.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Question (from sim-wave5gate-a): wave-4 monsters are faced on 6/8
  seeds of band 73671-73678 but killed on 0/8, leaving the wave-5
  veterans bar (2 living wave-4+ killers) at 0 everywhere. Decompose
  every wave-4 encounter: spawn -> fight -> flee/lose/kill, split
  field fights vs player turn-based (tb) fights, and answer the
  fieldfinish question for wave 4 specifically.
- Substrate (both arms): tableseat-nowait (LEANLINKRESCUE=1 +
  TABLESEATNOWAIT=1, seat legs only), seeds 73671-73678, 180d
  death-aware horizon (runDays stops on Game.over).
- Re-baseline FIRST: plain tableseat-nowait (8 seeds) compared
  field-by-field against the 1816Z band table (wins 2/8,
  national-ever 6/8, national-final 5/8, entered 2/8, wave-4 6/8,
  wave-5 0/8, median 166d, deaths 338). Base at arm start:
  1377d03c3. Base delta vs the 1816Z base (9c9ac3e4f, via
  806ef430e): src/js changes are ONLY conversation.js (+25,
  journey r53 ask_favor re-ask guard) and villageAgency.js (4
  lines, falsy-0) in 1377d03c3, plus the batch-ship BUILD_VERSION
  stamp in build.js (b4621e734). Any re-baseline diff is reported
  as a base delta, never silently absorbed.
- Baseline: plain tableseat-nowait, own replication (8 seeds), NOT
  another arm's corpus. Armed: tableseat-nowait wrapped with four
  observational recorders, all pre-existing except one small new
  one: spawnsrc-diag (SPAWNSRC=1: every spawnWorldMonster birth,
  tagged _spawnSeq/_spawnsrc on the entity), fieldfinish-diag
  (FIELDFINISH=1: field-fight rows + tbEnd rows, verbatim reuse),
  nonworldkill-diag (NONWORLDKILL=1: tb starts with tile-monster
  seq + tb ends joined by fightId, verbatim reuse), and the NEW
  wave4enc-diag (WAVE4ENC=1: field-fight rows carrying the spawn
  sequence read off the entity at fight entry, m._spawnSeq, so a
  field fight links to its birth). Recorders never write game
  state, draw no RNG, never throw into the engine (errors
  counted). They never call villageStandingTotal() or
  unlockedWave() mid-run.
- Cost bar (task substrate, scalemetric): armed starvation total
  <= baseline starvation total + 2 AND armed-only deaths counted,
  armed median days >= 0.8 x baseline median days. For this pure
  recorder arm the stronger G2 identity (armed == baseline exactly
  on days/gameDays/ts/starvation) is also required; the cost bar
  is reported against both.
- Outcome classes (exactly one per encounter event; the judged
  partition). FIELD events = wave4enc field rows with wave == 4:
  field-kill (vKill), field-lose (vDie), field-flee-villager
  (vFlee), field-flee-monster (mFlee; subcounts: r0-below-line
  startFrac < 0.15 & rounds == 0, r0-other, in-round rounds >= 1,
  volley drive-off startFrac >= 0.15 & rounds == 0),
  field-evade (evade), field-other (any other outcome value,
  named). TB events = nonworldkill initiations with wave == 4
  (refused/thrown/table-trial excluded from initiations by the
  recorder's own classifier): player-tb-kill (joined end wrote a
  wave-4 kill-log entry — player-party tb, by split reported),
  player-tb-lose-or-rout (joined end result lost/fled/routed,
  no wave-4 kill entry), player-tb-other (joined end result
  won/calmed/dissolved/other with no wave-4 kill entry, or no
  joined end = tb-unended, named separately). SPAWN events =
  spawnsrc spawns with wave == 4: spawned-never-fought (its seq
  appears in NO wave4enc field row AND in NO nonworldkill tb
  start tileMonster.seq). A spawn that IS fought contributes
  its fight events, not a spawn class — so the partition
  (field events + tb events + never-fought spawns) counts every
  wave-4 encounter exactly once, with no double count. A field
  row with seq null (entity untagged, e.g. spawned before the
  recorder installed) still gets exactly one field class; it is
  additionally counted as field-unlinked, never hidden. Tb
  linkage by TYPE alone never converts a spawn to fought — that
  limit is stated, and same-type tb events after a never-fought
  spawn are counted separately as unlinked-type-tb-exists.
- FIELDFINISH question for wave 4 (pre-registered): YES iff >= 1
  wave-4 field fight has startFrac < 0.15 AND rounds == 0 AND
  outcome mFlee (a flee-before-strike arrival below the 15%
  break line). Reported with counts: below-line arrivals
  (startFrac < 0.15), zero-round flights among them, 1-HP subset
  (startHp == 1), and STRICT wounded-repeats among them
  (immediate predecessor fight of the same type ended at
  exactly this fight's start hp, > 0; analyzeFieldFights on the
  wave-4 subset, same definition as sim-fieldfinish-a).
- Cross-checks (a seed is fully traced only if all hold):
  (a) every wave-4 kill-log entry has a matching field vKill
  row or tb kill end (same day + mid); (b) every faced wave-4
  type in the deed feed (wavesFaced) has >= 1 field row or tb
  initiation of that type; (c) wave4enc field rows (wave 4)
  count == fieldfinish field rows (wave 4) count on that seed
  (two independent wraps of the same fights).
- DIAG-GO iff (1) every faced wave-4 entity on >= 6/8 seeds is
  traced to exactly one outcome class under the partition above
  (i.e. >= 6 seeds fully traced per the cross-checks, with zero
  unclassified events on those seeds), AND (2) the dominant
  outcome class is named with per-seed counts, AND (3) the
  fieldfinish question is answered yes/no with counts.
  Otherwise DIAG-NO-GO, bar honored. The verdict is about the
  decomposition's completeness, not about whether wave 4 is
  winnable — a dominant flee class is a finding, not a fail.
- BALANCED PANEL (§15): same recorder-corpus limitation as prior
  arms — balance-panel.js has no corpus-ingest mode; the paired
  identical-seed tables below are the comparison of record. No
  panel file is produced or faked.
- Telemetry-check is NOT run on recorder rows (its counts are
  wrong on recorder rows — standing instruction from the 0158Z
  evidence).
- Sense-testing: one NON-MEASURED narration-on replay of the
  seed with the most wave-4 field fights (chosen after the
  census); judge whether wave-4 fights read as finishable
  fights or scripted flights, in plain words. Never census
  evidence.
- DIAG ONLY: no readyDemand moves, no VETSHAPE flip, no src/js
  default change, no combat-code change. No [needs-eyes] flag:
  measurement only (stated explicitly per the brief).

## RESULTS (appended after the run)

### Verdict: DIAG-GO (8/8 seeds fully traced — above the >= 6 bar)

- G1 det-gate: PASS. Seed 73671, recorders unset == unwrapped:
  days 180, gameDays 181, ts {tsNationalDay: 107} on both sides,
  no recorder surface, no installed wraps.
- G2 recorder neutrality: PASS, 8/8 seeds identical on
  days/gameDays/ts/starvation; faced-map agreement 8/8, kill-log
  agreement 8/8 (exact entry tuples d/mid/w/by/via).
- G3 corpus integrity: PASS. 16/16 rows in
  evidence/2026-10-26/perseed-wave4enc-a/ + summary.json; every
  armed row carries wave-4 event rows (spawns, seq-linked field
  fights, tb starts/ends) + the post-run pure-read snapshot.
- Cost bar: PASS. Armed starvation 1 <= baseline 1 + 2; armed
  median 152 >= 0.8 x baseline median 152 (identical — the
  recorders move nothing, so the cost bar is met trivially and
  honestly, via G2 identity rather than by a margin).
- Proof: scripts/test-wave4enc-a.js — 69 PASS, 0 FAIL (per-seed
  classes, partitions, dominants, fieldfinish counts, bands,
  diffs, and the verdict rule all re-derived from the rows).
- Detail: --detail 73673 censusMatch=true (partition 11,
  identical classes on re-run).

### RE-BASELINE (base 1377d03c3) — NOT exact; base delta stated, not absorbed

Band aggregates vs the 1816Z table: wins 2/8 (same),
national-ever 6/8 (same), national-final 5/8 (same), entered 2/8
(same), wave-4 6/8 (same), wave-5 0/8 (same), starvation 1
(same); median 152d vs 166d (-14), deaths 307 vs 338 (-31).
Per-seed diffs (13 fields compared: days, end, won, wave,
arc, final/max rank, national ever/final, table, entered,
deaths, starvation):

| seed | 1816Z | this run (baseline) | diffs |
|---|---|---|---|
| 73671 | 180d survived, w4, 48 deaths | identical | none |
| 73672 | 180d survived, w4, 51 deaths | identical | none |
| 73673 | 117d lost, w4, regional/national, 40 deaths | 124d lost, w4, global/global, national-final 1, 32 deaths | days, ranks, national-final, deaths |
| 73674 | 166d lost, w4, global, 39 deaths | 142d over-other (WON, lesser), w3, national, table 1, entered 1, 28 deaths | end, won, wave, arc, ranks, table, entered, deaths |
| 73675 | 180d survived, w4, 42 deaths | 180d survived, w4, 26 deaths | deaths only |
| 73676 | 144d won, w4, 43 deaths | identical | none |
| 73677 | 140d won (lesser), w3, national, 37 deaths | 152d lost, w4, regional/global, table 1, entered 0, 41 deaths | end, won, wave, ranks, national-final, entered, deaths |
| 73678 | 104d lost, w3, 38 deaths, starv 1 | identical | none |

Attribution, stated carefully: the ONLY src/js + policy delta
between the 1816Z base (9c9ac3e4f) and this base (1377d03c3)
is journey r53 — conversation.js (+25, ask_favor re-ask
guard) and villageAgency.js (4 lines, falsy-0) — plus the
batch-ship BUILD_VERSION stamp. The instrument cannot be the
cause: G2 proves armed == baseline exactly on this base, and
4/8 seeds reproduce the wave5gate rows exactly, so the
harness/policy/substrate pipeline is faithful where the base
delta does not bite. The four shifted seeds are therefore a
BASE DELTA (r53 behavior change moving trajectories), reported
here field-by-field, not a re-baseline failure to hide. The
wave-4 story is unaffected in kind: wave-4 reach is still 6/8,
wave-5 still 0/8, wave-4 kills still 0/8 — but the SET of
wave-4 seeds changed (73674 drops out, 73677 enters), and any
future arm comparing per-seed wave-4 counts against 1816Z
must use this run's table, not the old one. Wins are still 2/8
(73674's win replaces 73677's).

### PER-SEED DECOMPOSITION (the partition: field events + tb events + never-fought spawns = every wave-4 encounter exactly once)

| seed | days | end | wave | spawns4 | field4 | tb4 | never-fought | partition | dominant class |
|---|---|---|---|---|---|---|---|---|---|
| 73671 | 180 | survived | 4 | 4 | 3 | 2 | 2 | 7 | field-lose (2) |
| 73672 | 180 | survived | 4 | 8 | 5 | 2 | 6 | 13 | spawned-never-fought (6) |
| 73673 | 124 | lost | 4 | 5 | 2 | 6 | 3 | 11 | player-tb-lose-or-rout (6) |
| 73674 | 142 | won (lesser) | 3 | 0 | 0 | 0 | 0 | 0 | — (no wave-4 encounters) |
| 73675 | 180 | survived | 4 | 7 | 1 | 1 | 6 | 8 | spawned-never-fought (6) |
| 73676 | 144 | won (lesser) | 4 | 2 | 0 | 1 | 1 | 2 | tie: tb-lose-or-rout (1) / never-fought (1) |
| 73677 | 152 | lost | 4 | 7 | 1 | 1 | 6 | 8 | spawned-never-fought (6) |
| 73678 | 104 | lost | 3 | 0 | 0 | 0 | 0 | 0 | — (no wave-4 encounters) |

Band partition (49 units): spawned-never-fought 24, player-tb-
lose-or-rout 13, field-flee-villager 8, field-lose 4,
field-kill 0, field-flee-monster 0, field-evade 0,
player-tb-kill 0, player-tb-other 0. Band dominant class:
spawned-never-fought (24/49). Total wave-4 spawns 33, field
fights 12, tb initiations 13, fought spawns 9 (33 - 24).

Fully-traced check per seed (kills matched + faced types
covered + wave4enc vs fieldfinish field counts equal + zero
recorder errors/overflow): 8/8 pass. The two zero-encounter
seeds (73674, 73678) pass vacuously — they have no faced
wave-4 entities to trace. The bar's substance is the six
faced seeds (73671, 73672, 73673, 73675, 73676, 73677), all
fully traced with zero unclassified events. No wave-4
kill-log entry exists band-wide to leave unmatched (kills4 =
0 on all 8 seeds — the wave5gate finding reproduces on this
base), and every faced wave-4 type has at least one field
row or tb initiation. Unlinked-type-tb ambiguity is zero:
all 24 never-fought spawns have typeTbAfter=false (no
tileSeq-null tb event of their type after their spawn day
could be them in disguise).

### WHAT THE FIGHTS LOOK LIKE (rows, not summaries)

Field fights (12, all waves-4, rounds 1-3, never more):
- Outcomes: vFlee 8, vDie 4, vKill 0, mFlee 0, evade 0.
  The monster NEVER flees a wave-4 field fight on this band.
- Damage dealt per fight (known-start fights): 0-31 HP
  against monster starts of 448-1000 HP. Two fights deal
  exactly 0 (73673 algorithm 1000->1000, villager flees;
  73673 eater 950->950, villager dies in round 1). The
  deepest dent in the band is 31 HP (73672 herald 479->448
  over 5 meetings of the same two types). Villagers do not
  grind wave-4 monsters down; they scratch them and die
  or run within 1-3 rounds.
- Repeat meetings exist (73671 suburb seq38: d176 vDie
  975->957, d178 vFlee 957->934; 73672 herald/influencer
  pairs met 3 times each) but the wound arc stalls at ~5%
  damage — nothing like the wave-3 chorus_line arc (300->43)
  that fieldfinish-a traced, because the fighters do not
  survive long enough to repeat.
- One ephemeral field fight: 73675 d90 influencer (vid
  gen_s977vdo, 3 rounds, vFlee, end 964 HP, start HP null,
  seq null, hasRng false, allies present, calledHelp true) —
  BEFORE the wave-4 unlock (d117 on the 1816Z table) and
  with no world entity. The deed feed counts it as faced
  (73675 faced4 = influencer, algorithm). Its door is NOT
  identified by this recorder (not contest-RNG by the
  hasRng proxy, not a world spawn by seq) — flagged as an
  open instrument question, not explained away. It is
  classified field-flee-villager and counted as
  field-unlinked (1 of 12 field rows); it is excluded from
  below-line counts (startFrac null).

Tb fights (13, all result `lost`, doors world-bump 10,
feast-draw 2, contest-arena 1):
- player-tb-kill 0, player-tb-lose-or-rout 13, other 0. The
  scholar's party loses EVERY wave-4 tb fight on this band
  — no wins, no flees, no routes, no kills.
- The extreme case is 73673 d112: SIX distinct tb fights
  against the same algorithm (seq45, world-bump, scholar
  present, twice with james_okonkwo) in one day, all lost.
  The same entity was field-fought d105 (0 damage, villager
  flees) and never dies. The village's best wave-4
  opponent is an algorithm it has now lost to seven times
  across two channels.
- 73672 d100 audit is a contest-arena tb loss (tileSeq
  null — an arena beast, not a world entity); it still
  counts as faced (73672 faced4 includes audit).

Spawns (33, days d100-d180, types: eulogy 7, reunion 5,
suburb 4, herald 4, eater 4, influencer 3, algorithm 3,
audit 2, congregation 1; sources tile-entry 28, maintain 1,
scripted-titan 4):
- 24/33 never fought. Lateness does NOT explain it alone:
  never-fought spawn days run d101-d180, including
  d101 herald, d103 reunion, d106 eater, d111 reunion,
  d112 herald — monsters that sat in the world for 40-79
  days unmet. The villages do not go to wave-4 monsters;
  the monsters do not come to them either (tile-entry
  spawns sit where they spawn). Only 9 spawns are ever
  fought, and 4 of those are fought only by the scholar's
  tb channel (audit d100 arena, suburb d142 feast-draw,
  algorithm d112 x6 counted once, influencer d148).
- Faced types per seed (deed feed): 73671 influencer,
  suburb; 73672 audit, herald, influencer; 73673 algorithm;
  73675 influencer, algorithm; 73676 suburb; 73677 audit;
  73674/73678 none. Spawned-but-never-faced types (reunion,
  congregation, and most eulogies) are the rule, not the
  exception: the Mirror Draft arrives, and the village
  mostly never meets it.

### FIELDFINISH QUESTION FOR WAVE 4: NO (with counts)

- Below-line arrivals (startFrac < 0.15): 0.
- Zero-round flights among them: 0.
- 1-HP arrivals (startHp == 1): 0.
- STRICT wounded-repeats: 0.
- Wave-4 field fights do NOT hit the <15% flee-before-strike
  / 1-HP stuck state on this band — because wave-4 fights
  never wound a monster anywhere near the break line. The
  lowest start fraction in any wave-4 field fight is the
  73672 herald at 448 HP (startFrac ~0.45-0.9 by type; no
  fight starts below 0.15, and no fight ends below it
  either — end HPs stay 448+). The fieldfinish mechanism
  (fieldfinish-a: wounded wave-3 monsters fleeing at round
  0 forever) requires a monster the village CAN wound; at
  wave 4 the village cannot wound at all, so the stuck
  state never engages. The lowest start fraction in any
  known-start wave-4 field fight is 0.684 and the lowest
  end HP is 448 — no fight even approaches the line. The
  wave-4 kill drought has a different mechanism:
  unwinnable fights + unmet monsters, not unfinished
  fights. A future fieldfinish-style arm for
  wave 4 would need a different question (why 0-31 damage?
  why no pursuit/party formation?) — not a re-run of the
  below-line census.

### SENSE-TEST (NON-MEASURED replay, seed 73673 — census shape reproduced exactly)

Replay (narration on): days 124, village-lost, maxWave 4,
field4 = 2 (vFlee 1, vDie 1) — the census trajectory, not a
fresh run. The captured ring covers only d122-d124, so it
cannot judge the d112 six-loss day directly; what it does
capture is the d122 eater kill, in the System's voice:
"👄 The Eater gorges on the field — +0 damage growth.
(Isadora should have poisoned the meal.)" then "💀 The
Eater killed Isadora in 1 round. The village mourns."
Plain-words judgment: the fight reads as an execution, not
a contest — one round, zero damage dealt by the villager,
death, mourning, and a wry aside instead of a next step.
Nothing in the narration tells the village how to answer
a monster it cannot scratch: no call to bring more people,
no trick named, no retreat ordered, no lesson carried into
the next meeting (the same village then loses to the
algorithm six times in the census). The fiction mourns
well and instructs not at all. That silence, plus the
mostly-unmet spawns, is the sense-level blank: the Mirror
Draft is present as a killer and absent as a problem the
village can work on.

### VILLAGERS ACTING LIKE PEOPLE (sampled from the same corpus)

- Villagers DO go back to a known monster (73671 suburb
  met twice by different villagers, 73672 herald/influencer
  met three times each) — that is persistence across
  people, the village sharing a problem. But the sharing
  stops at contact: no party forms around a known wave-4
  monster in any row (calledHelp true only on the d90
  ephemeral influencer fight; allyVid null on all 11
  world-entity field rows), no second villager joins a
  fight in progress, and the same losing matchup repeats
  without adaptation (73673's algorithm, seven losses).
- The scholar's behavior is the least people-like datum:
  six tb losses to one algorithm in one day, with no
  change of approach visible in the rows (same door,
  same monster, same result). Whether that is bot-policy
  persistence (the tableseat-nowait policy re-engaging on
  bump) or engine re-engagement cannot be split by this
  recorder — the policy's bump behavior is the confound,
  stated here rather than blamed on the villagers.

### WALL NUMBERS (this run's judged corpora — baseline = armed, G2 identical)

Wins 2/8, national-ever 6/8, national-final 5/8, table
waiting 4/8, entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8,
median 152d, max 180d, deaths 307, starvation 1. Against
1816Z: wins/national/entered/wave/starvation identical;
median -14d, deaths -31 (the r53 base delta, per-seed
table above). Wave-4 kills 0/8 seeds, wave-4+ killers peak
0 everywhere (unchanged from wave5gate — the veterans bar
is still empty for the same reason, now decomposed: the
fights are lost 13/13 tb and 12/12 field-non-kill, and
24/33 spawns are never fought at all).

### METRIC REVIEW (§14 — binding, no mid-run re-scores)

- The DIAG-GO bar is judged exactly as pre-registered. The
  verdict is DIAG-GO because 8/8 seeds are fully traced
  (6 faced seeds substantively, 2 zero-encounter seeds
  vacuously) with the dominant class named per seed and
  the fieldfinish question answered NO with counts (0/0/0/0).
  No metric was re-scored: the fieldfinish YES bar (>= 1
  zero-round flight) was NOT met, and the verdict does not
  depend on it — the bar requires the question be ANSWERED,
  and NO is an answer.
- Two instrument corrections made BEFORE judging, both
  disclosed: (1) the first classifier used
  analyzeNonworldkill's return as if it carried the joined
  arrays — it returns counts only. The join is now built
  in the sweep from the exported classifyStart (same
  precedence, same excluded set); the smoke seed was
  re-run after the fix. (2) The never-fought
  typeTbAfter flag first counted tb events seq-linked to a
  DIFFERENT spawn of the same type as ambiguity; it now
  counts only tileSeq-null tb events (a seq-linked tb
  event belongs to its own spawn). After the fix,
  typeTbAfter is false for all 24 never-fought spawns —
  the never-fought class is unambiguous, not merely
  unchallenged.
- One metric note for the NEXT run: "fully traced" passes
  vacuously on zero-encounter seeds. A future bar that
  wants to force encounter coverage should require a
  minimum encounter count per seed (e.g. >= 1 wave-4
  spawn fought) separately from trace completeness —
  proposed here, not applied retroactively.
- BALANCED PANEL (§15): attempted, not applicable — same
  recorder-corpus limitation as prior arms
  (balance-panel.js has no corpus-ingest mode). The paired
  identical-seed tables above are the comparison of record.
  No panel file is produced or faked.
- Telemetry-check was NOT run on recorder rows (its counts
  are wrong on recorder rows — standing instruction from
  the 0158Z evidence).
- check.js --quick NOT run: zero src/js diff in this tree
  (DIAG arm, two new scripts + one new recorder policy
  only) and sibling loops are live; the arm's own proof
  is the det-gate + G2 identity + the 69-check proof +
  the detail census-match. node --check clean on all three
  new scripts.

### PROOF SCRIPTS (all in this tree, all run)

- scripts/policies/wave4enc-diag.js — NEW in this arm.
  Field-fight spawn-link recorder (WAVE4ENC=1): reads
  m._spawnSeq at fight entry, records full field rows.
- scripts/test-wave4enc-diag-sweep.js — NEW in this arm.
  Sweep (--one per seed via child processes, --summary
  rebuild, --detgate, --detail, --sense). Det-gate PASS,
  detail census-match PASS (73673), sense replay done
  (NON-MEASURED, see above).
- scripts/test-wave4enc-a.js — NEW in this arm. Proof:
  re-derives every summary number from the rows; 69 PASS,
  0 FAIL.
- Reused verbatim: scripts/policies/spawnsrc-diag.js,
  scripts/policies/fieldfinish-diag.js,
  scripts/policies/nonworldkill-diag.js (no edits).

### INFRASTRUCTURE (loud, as required)

- No EPERM flap hit this run: all node/shell disk writes
  succeeded (16 band rows, summary, evidence, sense text).
  No stdout-only fallback was needed.
- No safe-commit refusal yet (commit step follows this
  file); the coordinator owns the --ff-only merge. No
  [needs-eyes]: this DIAG arm changes no feel, combat, or
  UI — that assessment did not change during the run.
- Files for commit (worktree ~/workspace/worktrees/sim-wave4enc-a):
  evidence/2026-10-26/sim-wave4enc-a.md (this file),
  evidence/2026-10-26/perseed-wave4enc-a/ (16 rows +
  summary.json),
  evidence/2026-10-26/sim-wave4enc-a-sense.txt
  (NON-MEASURED),
  scripts/policies/wave4enc-diag.js,
  scripts/test-wave4enc-diag-sweep.js,
  scripts/test-wave4enc-a.js. Zero src/js diff. No other
  untracked files in the worktree (verified by git status
  at close — see the final report).

### BLANKS FILLED OR DOCUMENTED

- FILLED (measurement): the wave-4 encounter decomposition
  on band 73671-73678 — 49 partition units: never-fought
  24, tb-lose-or-rout 13, field-flee-villager 8, field-lose
  4, kills 0 in every channel. DIAG-GO (8/8 traced).
- FILLED (measurement): the fieldfinish question for wave
  4 is NO — 0 below-line arrivals, 0 zero-round flights,
  0 1-HP arrivals, 0 strict repeats. The wave-4 drought
  is not the fieldfinish stuck state; it is unwinnable
  fights (0-31 damage vs 448-1000 HP, 1-3 rounds) plus
  unmet spawns (24/33 never fought).
- FILLED (measurement): the re-baseline delta — 4/8 seeds
  shifted under the r53 base (per-seed table above); band
  aggregates hold except median/deaths. Future per-seed
  wave-4 comparisons must use this run's table.
- DOCUMENTED, NOT FIXED (instrument gap): the 73675 d90
  ephemeral influencer fight (pre-unlock, no world
  entity, no spawn seq) — its door is unidentified by
  this recorder. A future trace arm that wants encounter
  doors for ephemeral fights must record the fieldFight
  caller's door (or the wanderer-contact path), not just
  the entity tag.
- DOCUMENTED, NOT FIXED (sense blank): wave-4 defeats are
  mourned but never instructed — no narration names a
  counter, a party, or a next step after a 1-round death.
- DOCUMENTED, NOT FIXED (policy confound): the scholar's
  six same-day tb losses to one algorithm cannot be split
  by this recorder into bot-policy persistence vs engine
  re-engagement — a policy-behavior question for a
  future arm, not a villager finding.
- NOT A FINDING: no game bug was found in the wave-4
  spawn, field-fight, or tb paths — the two independent
  field wraps agree on wave-4 counts on all 8 seeds, the
  kill log agrees with the tb ends, and the faced feed
  agrees with the event rows. The fights work as designed;
  villages lose them, and mostly never meet them.

Convergence state: scale-onramp stays converging (NOT
converged): wave 5 still 0/8, wave-4 kills still 0/8, and
now the reason has a decomposition — the Mirror Draft is
mostly unmet (24/33 spawns never fought) and wholly
unbeaten (0/25 fights won or killed) on this band. The
wall did not move; this arm measured exactly how it is
manned, fight by fight.

