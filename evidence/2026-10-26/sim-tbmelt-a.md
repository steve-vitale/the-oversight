# sim-tbmelt-a — TB bystander melt rate census (axis scale-onramp)

Run: fleshout loop A, 2026-10-25/26, run fleshout-20261026T0017Z, arm sim-tbmelt-a.
DIAG ONLY — zero src/js changes, zero default flips, recorders only.
This arm designs and lands NO game fix for the melt (Steve-ruling
question per the backlog). The census IS the deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4 =
  the Mirror Draft, gate village standing >= 100; wave-3+ ledger
  kills are the standing currency — a melted wave-3/4 monster is a
  kill that never got logged).
- Context read first: evidence/2026-10-25/sim-nonworldkill-a.md
  (the melt finding: 4 melted — 73671 d9 murkcap, 73674 d18
  anaconda_empress, 73677 d15 living_wire, 73677 d63 spool — 1
  lingering restored — 73675 d9 white_noise_heron — across 5
  mismatch fights, 4 wanderer-pending + 1 contest-arena; plus the
  ORIGIN axis: world-origin / world-origin-mismatch / null-origin,
  and the rule that the pre-tile monster is read from
  Game.worldMonsters() by tile, never playerMonster()) and
  evidence/2026-10-25/sim-w4funnel-a.md. This arm answers backlog
  item #1054 (TB fight bystander melt) as a rate census: is the
  melt a veteran-funnel leak, and does it ever eat wave-3+ /
  wave-4 monsters?
- Mechanism, read from code before sweeping (never invented):
  startCombat lifts the world monster on the player tile via
  removeWorldMonster(playerMonster()) (game.js, near the fight
  build) and stores it on tbfight.worldOrigin ONLY if titan or
  lingering. tbEnd restores worldOrigin only when result !==
  'won' — and for a lingerer only on 'fled'/'lost'; a titan
  restores on any non-won result if still standing. Every other
  lifted monster is never put back: it melts, unfought. For a
  mismatch (bystander) lift, the bystander is not a fighter, so
  the restore's "still standing" check is vacuously true — a
  titan/lingering bystander IS restored on a non-won fight, and
  melts on a won fight like anything else. A world-origin lift
  whose fighter dies is a KILL, not a melt; a world-origin lift
  whose fighter survives but is not restored is a fought-monster
  melt (counted separately, never mixed into the bystander rate).
- Shared band, trajectory for trajectory: seeds 73671–73678,
  tableseat-nowait policy (LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
  scripts/policies/tableseat-nowait.js), 180d death-aware horizon
  (runDays stops on death/win; 180 is the cap, not a fixed horizon).
- Published control band (w5chain-a / spawnsrc-a / poolpres-a /
  w4funnel-a / nonworldkill-a, byte-identical): deaths 234,
  national-ever 7/8, wins 4/8, wave-4 6/8, wave-5 0/8, raids 85,
  raiders 361, pool 1,494, pool wave-3+ 107, median survival 135d.
  The armed band must reproduce it EXACTLY or STOP and report the
  deviation — no judging on a moved baseline.
- Recorders reused verbatim (policy-side only, never edited):
  raftdraft, spawnsrc, oldcore, defwound, w5births, nonworldkill
  — the exact nonworldkill composition. New this run, policy-side
  only: scripts/policies/tbmelt-diag.js (TBMELT=1), installed
  OUTERMOST (last), wrapping Game.startCombat (pre/post record)
  and Game.tbEnd (pre/post record) following the safe-wrap rules
  of nonworldkill-diag: write nothing to game state, draw no RNG,
  never throw into the engine (recording errors counted, never
  thrown), return original values untouched. At each TB fight
  start it records the world monster(s) on the player tile (id,
  species, wave, lingering/titan/veteran flags) and the fight's
  monster + initiation door (reusing the nonworldkill door
  vocabulary — contest-arena, feast-draw, tent-intruder,
  door-flee-reengage, glasswing-trap, world-bump,
  wanderer-pending, policy-direct, other — with the same
  precedence). At tbEnd it records which lifted monsters were
  restored vs melted (never restored), joined by fight id. A
  tbEnd row with no matching start row is DIRECT-BUILD, counted
  separately. A lift is recorded for EVERY start with a tile
  monster (world-origin and mismatch alike); null-origin starts
  lift nothing. Refused/thrown starts lift nothing and are
  counted separately, never in the melt denominator.
- Definitions (fixed before sweeping): MELT (bystander) = a
  world-origin-mismatch lift whose tbEnd exists and whose monster
  is absent from worldMonsters() after tbEnd (identity first,
  id+spawnSeq second). RESTORED = present after tbEnd.
  UNACCOUNTED = a non-refused, non-thrown lift with no tbEnd row
  (fight still live at run end, or join failure). MELT RATE =
  melts / TB initiations (nonworldkill initiations) and melts /
  seed, reported both ways; wave breakdown by the melted
  monster's def wave; melts by door. VETERAN-CANDIDATE = a melted
  monster of wave >= 3 (a fight-and-kill would have logged a
  wave-3+ ledger point); wave-4 melts named by seed/day/species.
  A melted monster carrying a veteran flag at lift is named
  separately (wanderer-spawned veterans ride worldMonsters).
- PRIMARY QUESTION: what is the TB bystander melt rate on this
  band — melts per TB fight, melts per seed, wave breakdown
  (especially wave-3+/wave-4 melts), and melts by door? Does the
  melt eat monsters that could have become veterans?
- DIAG-GO rule (ALL required): (a) every TB fight with a
  tile-mismatch (fight monster id !== pre-tile monster id) is
  classified by door, unclassified 0; (b) every lifted monster
  is accounted restored-or-melted (world-origin kills counted as
  kills, not melts, but still accounted), unaccounted 0; (c) melt
  rate + wave breakdown computed, wave-4 melts (if any) named by
  seed/day/species; (d) the 5 known mismatch fights from
  nonworldkill-a reproduce on this band (or each deviation
  explained by evidence, never by absence alone). Any leg
  missing = DIAG-NO-GO.
- SENSE plan: one melt thread in plain words from the corpus
  (which monster melted, what fight lifted it, whether the
  transcript shows the melt or hides it — checked against tbEnd
  narration in code, since the sweep corpus carries no say-log)
  + a villager-behavior spot check (party on mismatch fights).
  Numbers plus meaning, not counts alone.
- METRIC REVIEW section is mandatory below (docs/MEASUREMENT.md
  §14: pre-registered metrics bind the run — a miss is NO-GO,
  never re-scored mid-run).
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (known limitation, carried) — the
  sweep-compare table + analyzer output are attached instead; do
  NOT run telemetry-check on recorder rows (its counts are wrong
  on recorder rows — standing instruction).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: CONTROL-NO-GO, CENSUS LEGS ALL GO (read both halves)

- CONTROL GATE (pre-registered precondition): FAILED — the armed
  band does NOT reproduce the published control band exactly, so
  per the pre-registration this run STOPS on the control claim:
  no result below is judged against the published band. Observed
  band: wins 4/8 (control 4 — same), median survival 143d (135),
  national-ever 6/8 (7), national-final 5/8, table invited 4/8,
  entered 4/8, wave-4 5/8 (6), wave-5 0/8 (same), deaths 260
  (234), raids 85 (same), raiders 352 (361), pool 1,527 (1,494),
  pool wave-3+ 132 (107). The deviation is concentrated in two
  seeds: 73674 (control: survived 180d, 18 deaths, 11 TB starts;
  here: won d163, 30 deaths, 18 starts) and 73675 (control: won
  lesser d135, 24 deaths, 13 starts; here: survived 180d, 38
  deaths, 21 starts). The other six seeds reproduce the control
  seed-for-seed exactly (days, wins, deaths, starts, spawns).
- The deviation is PROVEN NOT to be the tbmelt recorder: (1)
  detgate PASS (recorders OFF = plain tableseat-nowait, days
  180/181, tsNationalDay 77, no diag surface, no wraps); (2)
  re-running 73675 with the NONWORLDKILL sweep (no tbmelt at
  all) on this worktree reproduces the NEW trajectory exactly
  (180d, 21 starts, starts identical), twice; (3) the tbmelt
  sweep re-ran three full times with identical melt numbers.
  The cause is HEAD drift since the nonworldkill run's base:
  the nonworldkill run happened 2115Z 2026-10-25, and this HEAD
  includes journey-deepening r48 (armor-vine seek moves vine
  arrival — a gameplay change, authored 2310Z), journey-
  establishment r39, and journey endgame r52, all authored
  after the run. Between the nonworldkill commit and this HEAD,
  src/js changes are notes-only (r36 link-note bookkeeping) —
  the drift sits in the run-base-to-HEAD gap the coordinator
  adoption landing bridged, not in this arm. Consequence for
  the coordinator: the published control band is stale for
  73674/73675 on current HEAD and needs re-baselining after
  r48 before any future arm judges against it.
- CENSUS LEGS (DIAG-GO rule, judged on the current-HEAD corpus,
  recorder proven neutral within-tree): (a) GO — all 8
  tile-mismatch lifts classified by door, unclassified 0;
  (b) GO — all 88 lifted monsters accounted (restored 12,
  melted-bystander 7, killed 41, fought-melt 28), unaccounted 0;
  (c) GO — melt rate + wave breakdown computed below, wave-4
  melts: NONE (named as an empty set, not hidden); (d) GO —
  all 5 known mismatch fights from nonworldkill-a reproduce
  (see Known-5 table). The census itself is green; the NO-GO
  attaches to the control comparison, not to the census.
- Analyzer gate: scripts/test-tbmelt-diag.js over the corpus:
  GATE PASS. Unit proof scripts/test-tbmelt-a.js 16/16
  (13 original + adopted-resolved cross-check + null-origin
  end + null-liftId-poisoning regression). Sweep summary
  CORPUS PASS + TBMELT GATE PASS; NEUTRALITY DEVIATED (above).

## CONTROL GATE — THE DEVIATION IN FULL (gate, not a claim)

Armed band (tableseat-nowait + raftdraft + spawnsrc + oldcore +
defwound + w5births + nonworldkill + tbmelt) vs published
control: raids 85 = 85, wins 4 = 4, wave-5 0 = 0, table 4 = 4;
raiders 352 vs 361, deaths 260 vs 234, national-ever 6 vs 7,
median 143d vs 135d, pool 1,527 vs 1,494, pool wave-3+ 132 vs
107, wave-4 5 vs 6. Per-seed (days/won/deaths/TB starts):
73671 180/0/31/15 = control; 73672 97/1/25/14 = control;
73673 124/1/28/9 = control; 73674 163/1/30/18 vs 180/0/18/11
DEVIATED; 73675 180/0/38/21 vs 135/1/24/13 DEVIATED; 73676
70/0/31/13 = control; 73677 143/0/43/22 = control; 73678
116/1/34/16 = control (including the d115 feast-draw strike
kill, still the band's only wave-4 TB kill). Recorder errors 0
on all eight recorders, no overflow. Detgate PASS (above).

## THE ANSWER, FIRST (plain words)

About one fight in eighteen quietly deletes a monster nobody
was fighting. On this band, 7 of 128 turn-based fights
(5.5%, 0.875 per seed) lifted an unrelated world monster off
the player tile and never put it back — it melted, unfought,
unannounced. The melt never ate a wave-4 monster and never
ate a veteran-flagged monster: four melts were wave-1, two
were wave-2, one was wave-3. So NO, the melt is not a
wave-4 veteran-funnel leak on this band — the veteran door
stays shut for other reasons. But it did eat one wave-3
monster (a spool worth a standing point), and it eats
through exactly two doors: fights the harness faces for you
as pending wanderers (4 melts) and contest arenas (3 melts).
World-bump fights — the commonest kind — never melt a
bystander, because the monster on your tile IS the fight.
And the melt has a big, honest shadow that is NOT a leak:
28 fought monsters melted after being fought but not killed
(fled/lost/routed, not lingering/titan) — that is the
documented "wild monsters melt away" rule, working as
written. The leak is only the 7 unfought ones.

## CENSUS — EVERY LIFT, BY FATE

128 TB initiations, 88 lifts (40 starts were null-origin —
no tile monster, nothing to lift), 8 tile-mismatch lifts,
80 world-origin lifts (73 + 7 adopted fights whose mid the
engine rule resolves, where nonworldkill reads unresolved).

| fate | count | meaning |
|---|---|---|
| killed | 41 | world-origin, fighter dead, all on 'won' — a kill, not a melt |
| fought-melt | 28 | world-origin, fighter alive, not restored — fled/lost/routed, by design |
| restored | 12 | lifted monster back in the world after tbEnd |
| melted (bystander) | 7 | mismatch, never restored — THE LEAK |
| unaccounted | 0 | every lift has its end |
| direct-build ends | 2 | tbEnd with no start row (73677 d41, d99 — the same two nonworldkill found) |

Per seed (initiations / lifts / mismatch / melts / restored /
killed / fought-melts): 73671 15/12/2/2/1/4/5; 73672 14/12/1/1/
0/4/7; 73673 9/6/0/0/2/3/1; 73674 18/9/2/2/0/4/3; 73675
21/14/1/0/2/7/5; 73676 13/9/0/0/1/7/1; 73677 22/16/2/2/6/5/3;
73678 16/10/0/0/0/7/3.

## THE 7 MELTS, NAMED

| seed/day | melted (wave, HP at lift) | fight (wave, door, result) |
|---|---|---|
| 73671 d9 | murkcap (w1, 42/60) | anaconda_empress (w1, wanderer-pending, lost) |
| 73671 d114 | bright_idea (w2, 1/55, lingering) | moderator (w2, contest-arena, routed) |
| 73672 d10 | hushwolf (w1, 29) | living_wire (w1, wanderer-pending, routed) |
| 73674 d18 | anaconda_empress (w1, 65/90) | hushwolf (w1, wanderer-pending, lost) |
| 73674 d162 | moderator (w2, 1) | warranty_caller (w2, contest-arena, won) |
| 73677 d15 | living_wire (w1, 46/60) | anaconda_empress (w1, wanderer-pending, won) |
| 73677 d63 | spool (w3, 170/280) | bulldozer (w1, contest-arena, won) |

Melts by door: wanderer-pending 4, contest-arena 3, world-bump
0, feast-draw 0, glasswing-trap 0, tent-intruder 0,
door-flee-reengage 0, policy-direct 0, other 0. Melts by wave:
w1 4, w2 2, w3 1, w4 0, w5 0. No melted monster carried a
veteran flag at lift; no melted monster was a titan. The one
lingering melt (bright_idea) is the rule working exactly as
written: lingerers restore only on fled/lost, and this fight
routed — so the siege's 1-HP lingerer melted. Two melts were
at 1 HP (bright_idea, 73674's moderator) — monsters one hit
from death anyway, so their melts cost almost nothing; the
spool melt (170 HP, wave 3) is the one that cost a real fight
and a real standing point.

## KNOWN-5 REPRODUCTION (leg d)

| seed/day | tile monster | expected | actual | door |
|---|---|---|---|---|
| 73671 d9 | murkcap | melted | melted | wanderer-pending |
| 73674 d18 | anaconda_empress | melted | melted | wanderer-pending |
| 73677 d15 | living_wire | melted | melted | wanderer-pending |
| 73677 d63 | spool | melted | melted | contest-arena |
| 73675 d9 | white_noise_heron | restored | restored | wanderer-pending |

5/5 reproduced, doors matching nonworldkill-a (the spool's
door reads contest-arena here; nonworldkill-a's text says
"4 wanderer-pending + 1 contest-arena" for the five — the
arena one is this spool fight). Nonworldkill-a's OLD corpus
held 5 mismatch fights; tbmelt counts 8 on the
current-HEAD corpus, and the difference decomposes exactly:
(1) the known 5, all reproduced above; (2) 2
adopted-resolved extras — fights whose mid tbmelt resolves
via the engine rule (arg || pendingMonsterId ||
'bulldozer') where nonworldkill reads
world-origin-unresolved (fighters gone by post-record):
73671 d114 bright_idea (above) and 73672 d10 hushwolf
(fight living_wire, wanderer-pending, routed, melted);
(3) 1 new-trajectory mismatch — 73674 d162 moderator
(fight warranty_caller, contest-arena, won, melted) — which
is in nonworldkill's CURRENT mismatch set too (current
nonworldkill byOrigin mismatch = 6 = known 5 + d162); it
was absent from nonworldkill-a's old corpus because
73674's trajectory moved. The analyzer's cross-check
(missing 0, every extra adopted-resolved) passes band-wide.
Tbmelt's mismatch count (8) supersedes nonworldkill-a's 5
for future arms; nonworldkill's 5 are all inside it.

## RESTORED, NAMED (why the other lifts survived)

All 12 restored are lingering, all on 'lost' — exactly the
r38 lingerers-hold rule, with no exceptions: 73677's suburb
linger six times (d139, d140 x3, d142, d143 — the besieging
wave-4 lingerer, lost each time, back on the treeline each
time); 73675's white_noise_heron (the known restored
bystander, lost); 73671's moderator, 73673's focus_group x2,
73675's moderator, 73676's hushwolf (all world-bump fights
about the tile monster itself, lost). No titan restores
occurred on this band; no restored monster was on a
won/routed fight.

## SENSE-TESTING READ (one melt thread, in plain words)

Day 63 on seed 73677: a spool — a wave-3 monster, 170
health, standing on the scholar's tile — is simply gone by
the end of the day, and nobody in the game ever says so.
What happened is a contest arena: the scholar, alone at
full health, fought a bulldozer (a wave-1 default) in the
arena and won. Starting that arena fight lifted the spool
off the tile, and because the spool is neither lingering
nor titan, nothing put it back. The transcript hides it
completely: the melt lines in tbEnd ("they melt back into
the wilds") describe the FOUGHT monster disengaging, and
the only restore line ("It didn't leave — you did") is for
a lingerer that fled. No line anywhere names a bystander
melting, because no code path ever looks at the bystander
again after lifting it. A player watching this day would
see a bulldozer fight, a win, and a world with one fewer
wave-3 monster in it for no stated reason — and one fewer
standing point available to the village that, eighty days
later, lost the village. The spool melt is the census's
clearest case that the melt is a fiction gap first and a
numbers gap second: the number is small (one wave-3 melt
on the band), but the silence is total.

Second thread, for balance: the bright_idea melt (73671
d114) cuts the other way. A lingering raider at 1 health,
besieging the haven, was lifted by a siege-arena moderator
fight that routed — and because lingerers restore only on
fled/lost, it melted. The village's siege lost a besieger
for free, through a door nobody aimed at the besieger.
Melts are not all losses: this one helped the village.
Any fix Steve rules must reckon with both directions —
sparing bystanders would also keep 1-HP lingerers in
sieges that routing currently clears.

## VILLAGER-BEHAVIOR SPOT CHECK (SENSE-TESTING LAW)

Mismatch-fight parties, from the corpus: five of the seven
melt fights were solo (scholar alone — the wanderer and
arena fights find her where she stands, and nobody is
within joining distance); one had a villager beside her
(73677 d15: sigrun_eiriksdottir at full health joined the
anaconda_empress fight while the living_wire melted beside
them); the two adopted-arena melt fights have no party
recorded (fighters gone by post-record — a recorder limit,
stated, not a villager fact). Nothing robotic here: the
pattern is the same lone-scholar ranging nonworldkill-a
found — villagers join when they are near, and the melt
fights happen where the scholar is alone. The melt is not
a villager-behavior failure; it is a fight-start side
effect villagers never see.

## VILLAGE ASSESSMENT (plain words)

These are the same eight villages as the shared band, plus
two that swerved on current HEAD: 73674 won where it used
to survive, 73675 survived where it used to win — the
band still wins 4/8 and reaches the table 4/8, but national
slipped 7/8 to 6/8 and wave-4 6/8 to 5/8. What is new is
where their turn-based fights leak. Most fighting is clean:
41 kills, 28 by-design fought-melts, 12 restores. The leak
is narrow — 7 monsters in 128 fights — and it runs through
the two doors where the fight is NOT about the tile: the
harness facing a pending wanderer for you, and the contest
arena. If Steve ever rules that bystanders must be spared,
the fix surface is exactly those two doors' lift paths, not
world-bump fighting (which never leaks) and not the
fought-melt rule (which is deliberate). And the leak does
not explain the scale wall: zero wave-4 melts, zero
veteran-flagged melts, one wave-3 melt. The wall is still
a veteran-production problem elsewhere, not a melt problem.

## WALL NUMBERS (current-HEAD corpus, NOT the published control)

National-ever 6/8, national-final 5/8, table invited 4/8,
entered 4/8, wins 4/8, wave-4 reached 5/8, wave-5 0/8, Arc IV
4/8, median survival 143d, max 180d, deaths 260. The wall
stands on current HEAD too: national 6/8 but table 4/8,
wins 4/8, wave-5 0/8.

## BLANKS FILLED OR DOCUMENTED

- FILLED (answered, with numbers): the TB bystander melt
  rate — 7 melts / 128 initiations (5.5%), 0.875 per seed;
  melts by door (wanderer-pending 4, contest-arena 3, all
  else 0); melts by wave (w1 4, w2 2, w3 1, w4 0, w5 0);
  veteran-candidate answer (1 wave-3 melt, 0 wave-4, 0
  veteran-flagged); the adopted-resolved mismatch class (3
  fights nonworldkill could not classify, resolved here via
  the engine mid rule); true direct-build ends (2, both
  73677, matching nonworldkill).
- FILLED (mechanism, read from code): why a titan/lingering
  bystander restores on non-won fights but melts on won
  ones (worldOrigin + result gate); why lingerers melt on
  routed (fled/lost only); why world-bump never melts a
  bystander (tile monster IS the fight); why fought-melts
  (28) are not a leak (documented wild-melt rule).
- DOCUMENTED, NOT FIXED (Steve-ruling question, no fix
  designed or landed per the arm's DIAG-only scope): whether
  mismatch lifts should spare the bystander — evidence is
  the 7 melts above, both directions (spool loss vs
  bright_idea siege relief). This arm designs NO fix.
- CARRIED (not chased here): the published control band is
  stale for 73674/73675 on current HEAD (re-baseline after
  r48 before any future arm judges against it); the
  adopted fights' party capture (fighters gone by
  post-record — future recorders could capture the party
  at tbEnd pre, where fighters still exist).

## NEXT-BLANK PROPOSAL (for the coordinator, not a fix)

Backlog #1054 is ANSWERED as a census (rate, doors, waves)
and remains OPEN as a design ruling (spare-or-not). The
next arm on this axis should not re-census the melt; it
should either (1) take the ruling question to Steve with
this evidence (spool loss vs bright_idea relief as the
two-sided case), or (2) if Steve rules "spare," design
the spare as a door-scoped change (wanderer-pending +
contest-arena lifts only) with this corpus as its before
numbers (7 melts on 128 initiations). No lever work on
the melt is justified before that ruling — the rate is
too small to move the wall (0 wave-4 melts), and touching
it without the ruling risks breaking the deliberate
fought-melt rule it sits next to.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its pre-registered DIAG-GO legs: (a) 8/8 mismatch
lifts classified, 0 unclassified (bar: every mismatch
classified); (b) 88/88 lifts accounted, 0 unaccounted (bar:
every lift restored-or-melted, kills counted as kills);
(c) melt rate + wave breakdown computed, wave-4 melts named
(bar: computed, wave-4 named — the set is empty, reported
as empty); (d) known-5 5/5 reproduced (bar: reproduce, or
each deviation explained by evidence — reproduction achieved,
no fallback needed). The CONTROL gate is separate from the
legs and it FAILED (band DEVIATED, above) — that failure
is reported, not re-scored: no headline was re-baselined,
no metric swapped, no friendlier band substituted. Two
method notes, neither a revision: (1) The first corpus's
direct-build count (33) was a recorder join gap (null
liftIds poisoned the ended-set, mislabeling null-origin
ends as direct-build) — fixed in the recorder (null
liftIds never enter the ended set), unit-proven (16/16),
and the corpus re-run in full; the re-run reproduced every
melt number exactly, and the fixed corpus is the corpus of
record. The earlier corpora are superseded, not patched.
(2) The cross-check definition was refined by evidence
before the full sweep (not mid-judgment): tbmelt resolves
adopted mids via the engine rule, so "cross agree" means
nonworldkill-missing 0 AND every extra adopted-resolved —
the refinement is recorded in the analyzer, and the raw
nonworldkill mismatch set (6 incl. unresolved handling) is
still visible in the corpus for audit. The telemetry-check
and balanced panel were NOT run, per the standing exception
for recorder rows (panel cannot ingest per-seed recorder
corpora). The sweep-compare table + analyzer output are the
comparison of record. The telemetry baseline was NOT rolled.
No game code changed in this run; no [needs-eyes] flag
applies (DIAG-only, no narration or behavior added).

## Infrastructure notes

- Sweep: scripts/test-tbmelt-diag-sweep.js (the nonworldkill
  sweep copied with the tbmelt recorder composed OUTERMOST).
  Corpus: evidence/2026-10-26/perseed-sim-tbmelt-a/ (8 rows +
  summary.json + analysis.json). Analyzer:
  scripts/test-tbmelt-diag.js (standalone GATE PASS over the
  corpus). Recorder: scripts/policies/tbmelt-diag.js
  (TBMELT=1). Unit proof: scripts/test-tbmelt-a.js (16/16).
- Detgate PASS (before and after the two recorder fixes —
  seed 73671: baseline vs recorders-OFF days 180/181,
  tsNationalDay 77 both, no diag surface, no wraps
  installed, post-setup world 0).
- The corpus was swept three times in full (first corpus,
  post direct-build-label fix, post null-poisoning fix);
  melt numbers identical all three times (7 melts, same
  rows) — the fixes touched labels only, never fates.
- Commit: sim-tbmelt-a, CONTROL-NO-GO + census legs GO,
  zero src/js diff. Ready for coordinator merge; NOT pushed,
  NOT bumped, live NOT verified (coordinator/ship-loop
  line, not this arm's).
