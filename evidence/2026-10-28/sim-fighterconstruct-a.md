# sim-fighterconstruct-a — the fighter-construction footnote, closed: monsters ARE built fresh; the two below-max starts are opening-turn strikes, not construction

Run: fleshout loop, run fleshout-20261028T0527Z. Axis: scale-onramp
(the blocking axis). Worker: sim-fighterconstruct-a. Tracker blank 3
/ backlog #1301 — fighter-construction footnote audit.
Worktree: `~/workspace/worktrees/sim-fighterconstruct-a` (branch
sim-fighterconstruct-a).
AUDIT / MEASUREMENT ONLY — zero src/js changes, zero policy
changes to game behavior, no game lever, no game fix proposed or
landed. Documentation IS the deliverable. This arm does NOT
re-score the w4tbhp, w4damage, or w4convert verdicts or corpora.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-fighterconstruct-a-prereg.md (commit
d3a360d8e). Corpus:
evidence/2026-10-28/perseed-fighterconstruct-a/ (8 rows +
summary.json + analysis.json + sense-75102.txt). Instruments
(copies only, originals untouched, plus one new recorder):
scripts/test-fighterconstruct-sweep.js (copy of the w4convert
sweep, differing only in corpus dir, labels, mode label,
require renames, and the fighterconstruct recorder),
scripts/policies/fighterconstruct-diag.js (NEW: construction
snapshot at first tbAdvance entry inside startCombat + every
tbDamage event during that call + post-start snapshot),
scripts/test-fighterconstruct.js (NEW analyzer, proof
validator), scripts/test-fighterconstruct-sense.js (copy of
the w4convert sense script, labels only).
Detgate: PASS (seed 75101, 132/132 days, tsNationalDay 77
both — the prior-base numbers exactly, so no detgate
amendment was needed).

## Plain words first

The monster always walks in fresh — and the two fights that
looked like exceptions are not exceptions to that at all.
Every wave-4 monster fighter on this band was built at full
health: 36 fighters across 28 fights, and not one of them
was constructed below max. The two "below-max starts" the
last round flagged are real numbers, but they are not
construction numbers. They are what happened in the seconds
before the scholar's first turn: in both fights the scholar
was the slowest person on the grid (speed 1, pack-burdened),
so the village fighters went first — and they hit the
monster before the snapshot was taken. On 75102 day 166,
Gabriela struck the Audit for 48 and Elena for 23, and the
snapshot caught it at 1140 of 1211. On 75106 day 143, Dihya
struck for 30, and the snapshot caught it at 1268 of 1298.
The deficits add up to the penny, the construction
snapshots are full to the penny, and no other fight on the
band has a villager ahead of the scholar — and none of
those fights shows a single point of opening damage. The
footnote is closed: there is no fighter-construction quirk
shaving 2–6% off audit fights. There is a snapshot that
reads after the opening turns, and two fights where the
village got its licks in first.

## Verdict: GO (binding prereg, no re-score)

GO required 8/8 seeds complete with clean recorders AND
every below-max wave-4 monster TB start classified AND the
"walks in fresh" claim corrected in writing. All three pass:

- (a) 8/8 seeds complete, clean recorders: PASS. 8 rows,
  days > 0, errs 0 on all nine recorders, no overflow,
  incomplete TB starts 0, post-join mismatches 0 (the
  fighterconstruct post-start snapshot matches the
  nonworldkill snapshot fighter for fighter on all 28
  fights), orphan monster opening events 0.
- (b) Every below-max start classified: PASS. 2 below-max
  fighters out of 36 (2 below-max fights out of 28), both
  TRACED to C8 opening turns with exact sums (see table
  below); unexplained 0, unclassified 0.
- (c) The claim corrected in writing: see "The corrected
  claim" below (construction confirmed fresh; snapshot
  qualified with the two exact exceptions).

## The corrected claim

The w4tbhp footnote said: "the monster always walks in
fresh," refined to "the monster's fighter starts at full HP
in 26/28 post fights; the 2 exceptions are 94–98% starts."
That refinement now splits into two statements, and only
one of them survives:

- CONSTRUCTION (confirmed): a wave-4 monster fighter is
  ALWAYS constructed at full HP. 36/36 fighters on this
  band, including both footnote fights (1211/1211 and
  1298/1298 at construction). The code says why: startCombat
  builds every monster fighter with hp == maxHp (fresh def
  roll; veteran x1.5 and packmate x0.7 scale both sides
  together; overtime scaling multiplies both sides by the
  same factor). No construction input in the code can put
  a monster fighter below max, and the census finds none
  that did.
- SNAPSHOT (qualified, not "always"): the TB-start snapshot
  the recorders take — after startCombat returns — shows
  the monster below max in 2/28 fights (7.1%), because
  startCombat routes opening turns inside the call before
  returning. Both exceptions are villager opening strikes
  (71 and 30 damage, summed exactly). The corrected
  sentence is: "the monster is always built fresh, and its
  start snapshot is full except when a faster villager
  strikes it during the opening turns before the scholar's
  first turn — 2/28 fights on this band, both audit fights,
  both explained to the point."

## The census table (the judged measurement)

Unit: one row per wave-4 TB fight (28 fights), carrying the
first monster fighter (m_0 — the w4tbhp vocabulary); the
band actually carries 36 monster fighters because 4 fights
bring crew fighters (see below). Start HP is the
nonworldkill post-startCombat snapshot; construction HP is
the first-tbAdvance-entry snapshot; opening sum is the sum
of tbDamage events on that fighter during the startCombat
call. Every fighter not listed as TRACED is full at both
moments (opening sum 0, residual 0).

| seed | day | monster | channel | start | construction | opening | class |
|---|---|---|---|---|---|---|---|
| 75101 | d131 | influencer | non-world-TB | 897/897 | 897/897 | 0 | full |
| 75102 | d166 | audit | player-tb-world | 1140/1211 | 1211/1211 | 71 | TRACED |
| 75102 | d172 | reunion | player-tb-world | 1203/1203 | 1203/1203 | 0 | full |
| 75102 | d172 | reunion | player-tb-world | 1367/1367 | 1367/1367 | 0 | full |
| 75102 | d172 | reunion | player-tb-world | 1342/1342 | 1342/1342 | 0 | full |
| 75102 | d172 | reunion | player-tb-world | 1362/1362 | 1362/1362 | 0 | full |
| 75102 | d172 | reunion | player-tb-world | 1329/1329 | 1329/1329 | 0 | full |
| 75102 | d174 | reunion | player-tb-world | 1200/1200 | 1200/1200 | 0 | full |
| 75102 | d176 | eulogy | player-tb-world | 974/974 | 974/974 | 0 | full |
| 75102 | d177 | suburb | player-tb-world | 1380/1380 | 1380/1380 | 0 | full |
| 75103 | d117 | audit | player-tb-world | 1214/1214 | 1214/1214 | 0 | full |
| 75103 | d118 | eater | player-tb-world | 1060/1060 | 1060/1060 | 0 | full |
| 75103 | d126 | eulogy | non-world-TB | 1095/1095 | 1095/1095 | 0 | full |
| 75103 | d129 | suburb | player-tb-world | 1438/1438 | 1438/1438 | 0 | full |
| 75103 | d159 | algorithm | player-tb-world | 2374/2374 | 1187/1187 | 0 | full (scaled x2.0) |
| 75103 | d160 | suburb | player-tb-world | 2638/2638 | 1319/1319 | 0 | full (scaled x2.0) |
| 75103 | d178 | suburb | player-tb-world | 3688/3688 | 1475/1475 | 0 | full (scaled x2.5) |
| 75106 | d89 | eulogy | player-tb-world | 999/999 | 999/999 | 0 | full |
| 75106 | d90 | reunion | player-tb-world | 1208/1208 | 1208/1208 | 0 | full |
| 75106 | d91 | reunion | player-tb-world | 1325/1325 | 1325/1325 | 0 | full |
| 75106 | d99 | algorithm | player-tb-world | 1002/1002 | 1002/1002 | 0 | full |
| 75106 | d129 | eulogy | player-tb-world | 914/914 | 914/914 | 0 | full |
| 75106 | d130 | eulogy | player-tb-world | 1072/1072 | 1072/1072 | 0 | full |
| 75106 | d143 | audit | other (feast-draw) | 1268/1298 | 1298/1298 | 30 | TRACED |
| 75106 | d145 | eulogy | player-tb-world | 1158/1158 | 926/926 | 0 | full (scaled x1.25) |
| 75106 | d146 | eater | player-tb-world | 1281/1281 | 1025/1025 | 0 | full (scaled x1.25) |
| 75108 | d100 | reunion | player-tb-world | 1214/1214 | 1214/1214 | 0 | full |
| 75108 | d110 | eulogy | player-tb-world | 1034/1034 | 1034/1034 | 0 | full |

Fighter-level totals: 36 monster fighters, 2 below-max
(5.6%), 2 traced, 0 unexplained, 0 unclassified, 0
constructed below max. The 7 crew fighters (m_crew_*,
75103 d159 x2, d160 x2, d178 x3) are all full at start
(2232–3648, each hp == maxHp) and are classified
full-reinforcement: they are injected by the
network-campaign startCombat wrapper after orig
startCombat returns (finale-campaign.js injectMonster
builds hp == maxHp), so they postdate the construction
snapshot by design and took no opening damage — they are
not below-max starts and do not touch the GO leg, but
they are counted here so the 36-fighter total closes
(29 startCombat-built fighters + 7 injected = 36).

Overtime scaling, observed (not assumed): 5 fights show
start maxHp larger than construction maxHp by an exact
overtime factor — 75103 d159 x2.0 (1187 -> 2374), d160
x2.0 (1319 -> 2638), d178 x2.5 (1475 -> 3688), 75106
d145 x1.25 (926 -> 1158), d146 x1.25 (1025 -> 1281) —
with hp == maxHp on both sides of the scaling. C4 is
therefore confirmed fraction-neutral in the data, not
just in the code: scaling moves the number, never the
fraction. The two traced fights are unscaled (ratio 1.0),
so their deficits are pure opening damage in unscaled
numbers.

## The two traced fights (every candidate tested)

### 75102 d166 audit — world-bump, world-origin — 1140/1211, deficit 71

- Construction: 1211/1211 (full). Def range [1100,1300];
  maxHp 1211 in range (C0 consistent; the roll sets both
  sides, so it cannot move the fraction).
- C1 veteran: refuted — 1211 is far below the veteran
  range [1650,1949] (roll x1.5); the world spawn carries
  no veteran flag either (spawnsrc seq 22, tile-entry).
- C2 packmate: no — fighter key m_0, not m_packmate.
- C3 snake: no — audit is not a snake monster.
- C4 overtime: no fraction effect — ratio start/constr
  maxHp is 1.0 (unscaled); scaling preserves fractions
  anyway (see the 5 scaled fights above).
- C5 world leakage: REFUTED numerically — world instance
  825/1100 (deficit 275) vs fighter deficit 71; and the
  fighter maxHp (1211) is not the world maxHp (1100) at
  all — a fresh roll, not a copy.
- C6 door-flee claim: not applicable — door is
  world-bump, not door-flee-reengage; and the claim runs
  after the recorder snapshot anyway.
- C7 rounding: no — all HP integers.
- C8 opening turns: TRACED, exact. Turn order at
  construction: [v_gen_ayapunj (speed 3), v_elena_petrova
  (speed 3), m_0 (speed 2), p (speed 1)]. The scholar's
  speed is 1 (burdened pack — base 3 minus burden
  penalty). Opening tbDamage events on m_0, in order:
  Gabriela (v_gen_ayapunj) 1211 -> 1163 (48 landed);
  Elena (v_elena_petrova) 1163 -> 1140 (23 landed).
  Sum 71 = deficit 71, residual 0. The monster's own
  opening turn damaged nobody (player and both villagers
  unchanged between construction and post snapshots:
  100/100, 100/100, 100/100) — a monster damages others,
  never itself, and here it landed nothing.
- C9 direct-build: no — a startCombat fight with a
  nonworldkill start row.
- C10 fear_aura / pocket_sand: no — no tbDamage event
  from either; the only opening events are the two
  villager strikes.
- Corollary check: this is one of exactly 2 fighter rows
  on the band with a villager ordered before the player;
  both such rows are opening-damaged, and all 34 rows
  without a villager before the player have opening sum 0.

### 75106 d143 audit — feast-draw, world-origin-mismatch — 1268/1298, deficit 30

- Construction: 1298/1298 (full). Def range [1100,1300];
  maxHp 1298 in range (C0 consistent).
- C1 veteran: refuted — 1298 below the veteran range,
  and the feast-draw record itself carries veteran: false.
- C2/C3: no — key m_0, audit not a snake.
- C4 overtime: ratio 1.0, unscaled; fraction-neutral
  anyway.
- C5 world leakage: REFUTED structurally — the tile
  monster is a wave-1 cliffhanger at 1/70, a different
  monster entirely (id mismatch); there is no world audit
  wound to leak.
- C6 door-flee claim: not applicable — door is
  feast-draw (faceFeastDraw), not re-engage.
- C7 rounding: no.
- C8 opening turns: TRACED, exact. Turn order:
  [v_visjoin_115 (speed 4), m_0 (speed 2), p (speed 1)].
  Opening tbDamage event on m_0: Dihya (v_visjoin_115)
  1298 -> 1268 (30 landed). Sum 30 = deficit 30,
  residual 0. The monster's opening turn again damaged
  nobody (player 100/100 unchanged; Dihya entered at
  98/100 and stayed 98/100 — the villager's own wound,
  carried in like the scholar's, not dealt here).
- C9/C10: no, same as above — startCombat fight, only
  opening event is the villager strike.

## Candidate-input summary (all 36 fighters)

- C0 def roll: maxHp in def range for every
  startCombat-built fighter (audit 1211/1298 in
  [1100,1300]; all others likewise per analysis.json);
  the roll sets hp == maxHp, so it never moves the
  fraction. No maxHp outside its def range (or, where
  scaling applies, outside the scaled range).
- C1 veteran, C2 packmate, C3 snake: move maxHp only,
  never the fraction; no below-max row is a veteran,
  packmate, or snake segment (keys m_0 throughout).
- C4 overtime: fraction-neutral, confirmed in data (5
  scaled fights, fractions 1.0 both sides).
- C5 world leakage: refuted on both rows (275 vs 71;
  id-mismatched tile). startCombat copies no world HP.
- C6 door-flee claim: post-snapshot writer; cannot
  affect start HP; neither traced fight is a re-engage.
- C7 rounding: integers; no effect.
- C8 opening turns: the ONLY input that moves a monster
  fighter below max before the snapshot — and only via
  a villager/ally strike (the player never acts before
  the snapshot by construction of tbAdvance, and a
  monster never damages itself). 2/2 below-max rows
  traced here, exactly.
- C9 direct-build: outside the census unit (no
  startCombat); no wave-4 direct-build end appears as a
  below-max start.
- C10 fear_aura / pocket_sand: flags only, no HP; no
  event observed from either.
- Construction-below-max rows: 0/36 (29 startCombat-built
  + 7 injected, all full at their own construction).

## Parity (exact, vs the w4damage corpus)

The analyzer's parity table (this band vs
evidence/2026-10-28/perseed-w4damage-a/, same seeds /
policy / substrate) matches EXACTLY on all 8 seeds and
all 13 checks per seed: days, gameDays, won, waveReach,
nationalEver/Final, table, entered, deathTotal, courtship
combined, wave-4 defwound rows by context, wave-4
nonworldkill starts, wave-4 spawn seq sets. Per-seed
days: 132/177/180/90/162/146/180/114 on both sides. The
detgate (132/132, tsNationalDay 77 both) proves the
fighterconstruct recorder addition is neutral, as the
scholar-history addition was before it. No divergence to
diagnose; no re-score against any retired corpus; the
w4tbhp, w4damage, and w4convert verdicts are untouched.

## Wall numbers (THIS band only, never pooled)

National ever / final 7/8 / 5/8; table invited / entered
6/8 / 3/8; wins 3/8 (3 lesser / 0 full); wave-4 unlock
5/8; wave-5 unlock 0/8; median survival 162d (days: 90,
114, 132, 146, 162, 177, 180, 180); deaths total 299;
courtship combined 121, 8/8 active — GATE PASSES.
Identical to the w4damage and w4convert bands, as exact
parity requires.

## Sense note (75102 d166, NON-MEASURED replay + measured corpus)

The sense rule picks the lowest seed with a below-max
monster start on this band: 75102, window d156–d176
(fight day 166 ± 10, capped at the seed's end day 177).
The replay (sense-75102.txt, NON-MEASURED — its
trajectory shifts, and its fight-start lines are the
only fight evidence taken from it) shows the d166 fight
starting in that window ("Turn-based now..."), but its
beat filter does not capture strike lines, so the
blow-by-blow below is the MEASURED corpus's opening
events, not replay text — stated, not hidden:

The scholar walks into the Audit's fight already the
slowest person there — speed 1 against the villagers'
3 and the Audit's 2 — and before the scholar gets a
turn at all, Gabriela steps in and lands 48, then Elena
lands 23. The Audit's own opening turn answers with
nothing that marks the party: the scholar and both
villagers come out of the opening exactly as they went
in. By the time the game says "your turn," the monster
is already down 71 — not because it walked in hurt, but
because its enemies got there first. In plain words,
that is the whole footnote: the village fights before
its scholar does, when the scholar is carrying too much
to keep up. (The replay, for its part, never remarks on
any of this — no beat says "your allies struck first" —
the same silence the w4tbhp sense read found around
wounded entries generally.)

## Village assessment (plain words)

Same band, same story as the last two rounds, because
parity is exact: three villages win through the lesser
seat, three die, two survive the horizon without sitting
the table, five reach wave 4, none reaches wave 5, and
the full seat is still nobody's story. What this round
adds is a correction to how the story is told: the
monster does not walk in hurt. It walks in whole, and
sometimes the village has already hit it before the
scholar's turn begins — which is, if anything, the
village acting like people with faster feet than their
burdened scholar, not a wound the monster carried in.
Anyone reading a below-max monster start in a future
census should ask first "who was faster than the
scholar?" — on this band, that question answers itself
in both cases.

## Blanks filled or documented

- FILLED (answered, with numbers): the w4tbhp footnote —
  the 2 audit monster-start deficits (71, 30) traced to
  opening-turn villager strikes with exact sums, and the
  full 28-fight / 36-fighter census classified (2 traced,
  0 unexplained, 0 unclassified, 0 constructed below
  max).
- FILLED (mechanism, read from code + corpus): startCombat
  builds monster fighters at hp == maxHp and then routes
  opening turns inside the call; the nonworldkill "start"
  snapshot is post-opening-turn, so it is a
  post-opening snapshot, not a construction snapshot.
  The fighterconstruct recorder now exists to tell the
  two apart (construction snapshot + opening tbDamage
  join), and it is proven neutral by detgate + exact
  parity.
- FILLED (refinement, measured): overtime scaling is
  fraction-neutral in the data (5 fights, x1.25–x2.5,
  hp == maxHp both sides); crew fighters are
  post-startCombat injections at hp == maxHp (7 rows,
  all full).
- DOCUMENTED, NOT FIXED (named next blank, for the
  coordinator — NOT a re-score): the w4convert mechanism
  hypothesis said TB fights "scale the monster up" citing
  e.g. 75103 suburb tile 975 -> TB end 3688/3688. This
  arm's construction join shows that fight's START was
  already 3688/3688 (construction 1475 x2.5 overtime) —
  so part of that "TB scaling" was pre-fight overtime
  scaling already present at start, not growth inside
  the fight. The w4convert census verdict (0 kills) and
  its tile-to-end comparison as measured are untouched;
  but a future arm that wants pure in-fight TB scaling
  should join construction -> start -> end, which this
  corpus now makes possible (construction, start, and
  tbEnd snapshots all exist per fightId). The TB-end
  numbers themselves were not re-judged here.

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged
exactly against its pre-registered GO rule: 8/8 complete
+ clean recorders + every below-max start classified +
claim corrected — all pass. Judgment notes, all
disclosed, none a re-score:

1. ANALYZER FIX, NOT A METRIC CHANGE. The analyzer's
   FIRST run judged mechanical PASS but labeled 7 full
   crew fighters UNCLASSIFIED (they postdate the
   construction snapshot — see above). The fix re-labels
   full m_crew_* rows as full-reinforcement (their
   injection builds hp == maxHp, finale-campaign.js
   injectMonster) and counts unclassified across ALL
   rows, not just below-max rows. The GO rule itself was
   NOT changed (it governs below-max starts, and all 7
   crew rows are full), the prereg was NOT re-scored,
   the corpus was NOT re-swept, and the original run's
   output is disclosed here rather than hidden. The
   analysis.json in the corpus is the re-run's output.
   A below-max crew fighter, or a non-crew fighter
   missing its construction snapshot, would still fail
   the gate — neither occurs on this band.
2. FIGHTS vs FIGHTERS. The census unit in the prereg is
   the TB fight, but 4 fights carry multiple monster
   fighters (crew injections). The evidence reports both
   counts everywhere it matters: 28 fights, 36 fighters,
   2 below-max fights = 2 below-max fighters (both are
   m_0 first fighters, so the first-fighter census and
   the all-fighter census agree on the below-max count).
   The byMonster table in analysis.json counts fighter
   rows, not fights, and is labeled as such here.
3. "START" DEFINITION, REFINED BY THIS ARM. The w4tbhp
   metric-review note 3 suspected the start snapshot
   could carry opening-turn damage; this arm proves it
   does (2/28 fights) and supplies the instrument that
   separates construction HP from start HP. Future
   censuses that want pure construction numbers should
   use the construction snapshot, not the start
   snapshot; the w4tbhp verdict (wound2 causation) is
   unaffected, because it compared the same snapshot
   definition on both sides.
4. PANEL (§15). scripts/balance-panel.js compare was
   attempted: it errors `compare --before <panel.json.gz>
   --after <panel.json.gz> --out <prefix>` — the entry
   point requires panel artifacts that do not exist for
   a census corpus (standing exception, sixth-plus
   round). No panel artifact was faked; the paired
   sweep-compare tables (this analyzer's output,
   analysis.json, parity EXACT) are the section-15
   substitute, as the prereg provides.
5. TELEMETRY DEVIATION CHECK (loop body step 10):
   `node scripts/telemetry-check.js --baseline .../telemetry-
   baselines/scale-wall.json --current
   'evidence/2026-10-28/perseed-fighterconstruct-a/*.json'
   --metrics national,table,wins,exiled` → 3 LOUD lines
   (national 12→0, table −62% 16→6, wins 16→0, n=10
   files). Verdict: KNOWN ARTIFACT, no investigation,
   baseline NOT rolled. Two independent reasons, both
   documented (same as the census family): (a) the
   baseline's own regime note forbids this comparison (a
   ~100%-win winseat suite vs a tableseat-nowait census
   substrate); (b) the field-shape artifact repeats
   (per-seed rows carry nationalEver/entered/won, not
   top-level national/table/wins paths; summary.json +
   analysis.json are the 9th and 10th files). The
   corpus's real wall numbers are nationalEver 7/8,
   table entered 3/8, wins 3/8. No exiled LOUD line.

Doubts recorded for the NEXT run, never applied here:

1. TB-END SCALING, REFINED. The construction -> start ->
   end join now exists; a future arm could measure how
   much of TB-end HP growth is overtime-at-start vs
   growth inside the fight. Not measured here beyond
   the 5 scaled starts noted above.
2. PLAYER SPEED 1. Both traced fights have the scholar
   at speed 1 (burdened). Whether burden is what
   routinely puts villagers ahead of the scholar in
   opening turns — and whether that is intended — is a
   design question, not an audit finding; the audit only
   proves the mechanism in these two fights.

## Infrastructure notes

- Sweep: scripts/test-fighterconstruct-sweep.js, 8 seeds,
  ~7 min wall + detgate ~2 min + sense replay ~2 min.
  Corpus: evidence/2026-10-28/perseed-fighterconstruct-a/
  (8 rows + summary.json + analysis.json +
  sense-75102.txt). Analyzer:
  scripts/test-fighterconstruct.js (unit checks pass;
  exit 0 on the re-run, mechanical PASS). Sense:
  scripts/test-fighterconstruct-sense.js (NON-MEASURED
  replay only; 75102 window d156-d176).
- Safe-commit index clobber hit the prereg commit (bogus
  staged deletion, commit itself correct — verified by
  stat + hash before proceeding); repaired via HEAD-blob
  cacheinfo, verified status empty + diff HEAD empty.
  The same check runs after every safe-commit in this run.
- No jest run: zero src/js changed, and the arm proofs are
  the attributable verification (per the census-family
  precedent for DIAG-only runs). No [needs-eyes] flag
  applies (measurement only, no narration or behavior
  added — the sense script only READS beats on a replay,
  it adds none to the game).
- Commit: sim-fighterconstruct-a, GO on all legs, zero
  src/js diff. Branch ready, pending coordinator merge;
  NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
- Heartbeats: tree heartbeat after registration
  (coordinator), after instruments (this worker), and
  after the sweep — all landed.

## Findings for the coordinator (NOT appended by this worker)

- [open] 2026-10-28 — TB-end scaling refinement — the
  75103 d178 suburb fight's start was already 3688/3688
  (construction 1475 x2.5 overtime), so part of the
  w4convert "TB scales the monster up" reading was
  pre-fight overtime scaling at start, not in-fight
  growth; the construction -> start -> end join in this
  corpus can separate the two on a future arm (this
  run's verdict, not a re-score of w4convert).
- [open] 2026-10-28 — burdened scholar goes last — both
  traced fights have the scholar at speed 1 (burdened),
  letting villagers strike first in the opening turns;
  whether burden routinely ordering villagers ahead of
  the scholar is intended is a design question (this
  run's mechanism finding).
