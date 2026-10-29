# sim-scale-onramp-round-1615 — coordinator evidence (Loop A, run fleshout-20261029T1615Z)

Axis: scale-onramp (blocking axis, converging, NOT converged).
No live sibling claim at run start (all lever-claims .DEAD; loop-B
lock files stale only). Loop-B trees and build lanes (build-returns,
build-geartier, build-staying) NOT touched. Both arms merged locally,
pending ship. No push, no bump, no live verification (ship loop owns
deploys).

## Pre-registration (both arms, committed before any judged sweep)

- sim-breakline-a prereg: evidence/2026-10-29/sim-breakline-a-prereg.md
  (worker be8528402, rebased 22f785d24). Primary metric: break-line
  shares on an 8-seed pilot band (75101–75108, death-aware 180d,
  w4dpr2 substrate), DIAG legs: coverage, determinism, neutrality
  (exact vs w4dpr2 subset + OFF/ON), sense, ranked next step.
- sim-tbovertime2-a prereg: evidence/2026-10-29/sim-tbovertime2-a-prereg.md
  (a9863885e, pinned base ca9a7569e). Primary metric: tier-2+
  overtime decomposition (construction → start → end, pre-fight vs
  in-fight), DIAG legs: corpus/substrate, tier-1 control reproduction,
  detgate, tier≥2 join, decomposition table + sentence, sense.
  Substrate disclosed in prereg: leanlinkrescue courtship with NO seat
  drive (TABLESEATNOWAIT unset), policy-side only, zero src/js —
  because tableseat-nowait sits when ready and the overtime clock
  almost never survives past tier 1 under it.

## Arm 1 — sim-breakline-a: DIAG-NO-GO on the prereg as written, census valid and usable

Worker commits (rebased clean onto the tbovertime2 merge, proofs
re-run post-rebase reproducing the published verdict exactly):
22f785d24 (prereg), 3ce0ff362 (instruments), 181436c95 (sense
amendment), 583d09c05 (corpus + evidence). Zero src/js.

Legs: coverage PASS (280 fought, all assigned, joins 1317/1317,
branch recomputation mismatches 0); determinism PASS (75106 scratch
re-run byte-identical); neutrality-exact vs w4dpr2 subset FAIL
(meetings 1317 vs 1272, deaths 240 vs 286, won 6 vs 3, wave-4 fought
only 75108:9 — cause is BASE DRIFT, not the recorder: build-armor
062e07a7a seeds bark wearers at creation plus intervening
geartier/map commits; seed 75108 reproduces w4dpr2 exactly);
neutrality OFF/ON FAIL on strict letter, PASS in substance (76/143
fieldparty meetings differ ONLY in the diagnostic V8 `stack` string,
a wrapper-depth artifact; with `stack` stripped: 0 content diffs,
w4dpr store byte-identical, all wall fields + death ledger
identical — the recorder changes no game state); sense PASS
(SENSE-OK, floor + hopeless + learn quoted). Analyzer machine legs
exit 1 on neutrality only; fixtures 261/261 PASS. Per metric
binding (§14) the verdict is NO-GO — NOT re-scored to GO on the
substance pass. The census itself is valid and is reported below.

Break-line census (fought wild fights, waves 1–4, n=280; universe
805 = 280 fought + 525 unfought):

| Break line | n | Share |
|---|---:|---:|
| DRIVE-OFF (beast breaks) | 130 | 46.4% |
| HOPELESS-BRANCH (trajectory flee) | 66 | 23.6% |
| KILL | 45 | 16.1% |
| FLOOR-BRANCH (wound-floor flee) | 30 | 10.7% |
| PARTY-DEATH | 5 | 1.8% |
| LEARN-BRANCH | 4 | 1.4% |
| CAP / TRICK-EXIT / OTHER | 0 | 0% |

By wave (fought): w1 (153): drive-off 88, kill 24, hopeless 26,
learn 3, floor 12. w2 (58): drive-off 24, kill 21, hopeless 10,
floor 3. w3 (60): hopeless 28, drive-off 18, floor 11, deaths 2,
learn 1, kills 0. w4 (9, all seed 75108): floor 4, deaths 3,
hopeless 2, kills 0, drive-offs 0.
By party (tile-present allies only): solo-tile (188): drive-off 91,
kill 32, hopeless 41, floor 20, learn 3, death 1. Party-present
(92): drive-off 39, hopeless 25, kill 13, floor 10, deaths 4,
learn 1. Tile mates present in 92 fought fights, yet shouts 0 and
joins 0 across all 280 — help comes from the crew list, never the
tile. Kill rate no better with mates present (14% vs 17%); deaths
concentrate there (4/92 vs 1/188, n=5 — a flag, not a rate claim).
Unfought (525): 524 beast-flees-before-contact + 1 round-0 volley
kill; by wave w1 433 / w2 74 / w3 18 / w4 0. Unfought w1 beasts'
starting HP median 4 (vs fought median 55) — wounded beasts
scattering on sight below the break line, the free wild-meeting
flee. Flag cross-tab: LEARN-WITHDRAWAL 13 is 9 floor flees + 4 true
learn withdrawals (round-1/2 floor flees by learn-intent villagers;
the learn branch can't fire before round 3). True learn
withdrawals: 4, all round 3. Rounds: floor flees 24/30 at round 1;
hopeless 53/66 at round 2; deaths rounds 1–2 only; drive-offs
rounds 1–12 (mode 3).

Wall (this band, 8 seeds, 180d): wins 6/8, all lesser (full 0);
national ever 7/8, final 7/8; table reached 6/8, entered 6/8;
wave reach 1–5: 8/8/8/6/0; median survival 114d; deaths 240
(villager:combat 104, villager:villager combat 62, player:the wild
26, expedition 19, starvation 1).

Sense: the floor branch logs NO exit line — all 30 floor flees end
mid-fight, vs the honest hopeless line ("sees how this ends") and
learn line ("has seen enough"). The hopeless branch is the
best-narrated exit in the game (Chantal vs living_wire, s75103 d9,
flight line at exactly round 2). Non-wild note, labeled not
counted: an expedition log ends "shouts for help! Emma charges
in!" followed same-round by a floor flee, Emma's arrival never
played out — but in the judged universe the shout never fires at
all (0/280).

## Arm 2 — sim-tbovertime2-a: DIAG-GO (all prereg legs pass, no re-score)

Worker commits (merged ff-only, no rebase needed): a9863885e
(prereg), b3f440de2 (instruments), 1ad041e58 (sense substrate fix),
5514f188b (corpus + evidence). Zero src/js.

Legs: corpus/substrate PASS (8/8 seeds, errs 0 on all ten
recorders, no overflow, courtship combined 181, 8/8 active);
tier-1 control reproduction PASS, EXACT (analyzer `--control` mode
on the tbovertime-a corpus reproduces every published number:
24/24 joined, tiers 0×22 / 1×2, preFightScalingMax 463,
overtimeHpGain 345, inFightChange −3187, inFightMaxGrowth 0);
detgate PASS on pinned base ca9a7569e (75101: 157/157 days,
156/156 gameDays, no diag surface, no wraps installed — numbers
differ from tbovertime-a's 132/132 because base + substrate moved;
the detgate requires the two sides to match each other);
tier≥2 join PASS (judged n=16 ≥ 3, unit join 22/22, 0 tier/opening/
identity disagreements, 0 unexplained gaps); decomposition table +
sentence PASS; sense PASS (75101 d134/d136 tier-3 fights read end
to end, NON-MEASURED replay).

Tier-2+ overtime table (construction → start → end; opening = 0 and
maxGrowth = 0 on all rows): judged tier≥2 (n=16): scalingMax
+18,250, otHpGain +10,760, inFight −684, constrToEnd +10,076,
scales-up 16/16, crew 36. All 22 unit fights: inFightMaxGrowth 0,
inFight −1,978, tile→construction 0 on 22/22. By tier (judged +
context): t0 n=3 (scaling 0, inFight −969); t1 n=3 (675 / −325);
t2 n=1 (475 / 233 / −115); t3 n=2 (1425 / 1425 / −48); t4 n=6
(5700 / 1284 / −271); t5 n=0; t6 n=7 (10650 / 7818 / −250).
Headline: 100% of every tier-2+ increase is PRE-FIGHT overtime
scaling. The fight itself never grows a monster at any tier
observed. The tier-2+ step-change is the pack: crew counts are
exactly floor(t/2) on every judged fight (t2→1, t3→1, t4→2,
t6→3). Crew start full on 36/36 (fresh def roll × hpM) while m_0
starts wounded (world HP × hpM); crew HP totals 89,152 → 89,081,
the entire −71 in a single tier-4 fight. Scaling multiplies
CURRENT HP, not the ceiling: the 214/950 eater at tier 4 gains
only +214 HP while its ceiling gains +950; otHpGain equals
scalingMax only for unwounded world monsters (2/22 fights).
Fight length shrinks with tier (mean rounds t0 6.0, t1 4.3, t2 4.0,
t3 2.5, t4 3.3, t6 2.4); all 16 judged fights lost. Tier-4/6
sub-claim JUDGED (6 tier-4, 7 tier-6 fights, same mechanism).
Tier 5 still unmeasured (0 fights); wave-5 overtime unmeasured
(wave 5 unlock 0/8, so all 22 unit fights are wave 4 in fact).
Titan fights resolve inside one startCombat call (315 same-call
rows, 299 herald/nielsen) and cannot be post-snapshotted by these
recorders — a future titan-TB arm needs a different instrument.

Wall (THIS BAND ONLY, substrate caveat, never pooled): national
ever/final 7/8 / 2/8; table waiting/entered 6/8 / 0/8; wins 0/8 (0
lesser / 0 full) — entered and wins are 0 BY CONSTRUCTION, the
substrate never sits, so these are not regressions; wave-4 unlock
7/8; wave-5 unlock 0/8; median survival 180d (same convention as
tbovertime-a); ends lost 4 / survived-to-horizon 4; deaths 367;
starvation deaths 1. Parity vs tbovertime-a FAILS on all 8 seeds
as expected (diagnostic only, not a gate); 75108 is
trajectory-identical to tbovertime-a (102d, 37 deaths, same 3
fights — dies before the divergence point).

Sense: scaling reads coherently in-world (tier announcement "+75%
HP, +36% damage, +1 to every pack…", RERUN ×3 line at fight start,
renamed fighter every turn). Two narration-completeness notes, not
scaling findings: exact HP arithmetic (900 → 1575) is never stated,
as at tier 1; the pack is announced but no packmate turn appears in
the read excerpt — the player is told a pack exists but sees only
the named monster's turns, matching the measured fact that crew are
untouched.

## Plain-words village assessment

Two measurements that sharpen the same wall from opposite sides.
In the wild, fights mostly never happen: two-thirds of meetings end
before round 1 with a wounded beast scattering on sight, and of the
fights that do run, the beast usually walks away (46%) while the
villager flees a third of the time; kills happen only against waves
1–2, and a villager standing next to tile mates gets no help from
them at all — help comes from a crew list, not from who's there.
At the table's clock, the overtime monster is a different shape of
the same wall: the fight never grows it, the wrapper grows it
before the first turn, and from tier 2 up it brings a pack of fresh
copies of itself — at tier 6 the village fights one wounded monster
at 2.5× health plus three fresh ones, and loses in about two rounds
having dealt almost nothing. The villages that wait keep reaching
national (7/8 ever on both bands) while the full seat stays
nobody's story and wave 5 stays unreached. That is a coherent
tragedy, not a broken system — but the wave-4 wild fight has
nearly vanished from the current band (9 meetings on 1 seed, down
from 24), so the next wave-4 lever judgment needs a fresh baseline
first, not a louder lever.

## Metric review

- Breakline: no metric revised. The neutrality-exact leg failed on
  base drift, and the OFF/ON leg failed on the strict letter (V8
  `stack` string) while passing in substance. Both failures are
  reported as failures; nothing was re-scored. Carried
  recommendation: future census preregs should judge neutrality by
  OFF/ON with `stack` stripped, or by OFF/ON alone, and pin the base
  commit — exact-reproduction legs do not survive a moving base.
- Tbovertime2: sense substrate fix (1ad041e58) disclosed in the
  arm's Metric review 1: the replay must use the same no-seat
  substrate as the corpus or it sits before tier 3. Sense is
  NON-MEASURED; no judged leg depends on it. Cosmetic leftover
  disclosed in Metric review 2: the sweep summary console header
  still prints the literal "sim-tbovertime-a decomposition"
  (summary.json's label is correct) — noted for the next copy.
- No threshold was moved in either arm after any judged sweep.

## Telemetry deviation check (coordinator, --sweep-rows, row-only globs)

- Breakline corpus (perseed-breakline-a/s751*.json): wall reproduces
  the worker numbers exactly (nationalEver 7/8, table 6/8, won 6/8).
  2 LOUD lines: table 16→6 (−62%), wins 16→6 (−62%). Verdict:
  baseline-file regime artifact — the scale-wall baseline is a
  16-config WINSEAT corpus count, not a rate on this 8-seed pilot
  band. Baseline NOT rolled. Exiled: no LOUD line.
- Tbovertime2 corpus (perseed-tbovertime2-a/s751*.json): wall
  reproduces the worker numbers exactly (nationalEver 7/8, table
  6/8, entered 0/8, won 0/8). 2 LOUD lines: table 16→6 (−62%), wins
  16→0 (disappeared). Verdict: same regime artifact PLUS this
  band's by-construction wins/entered zeros (no-seat substrate,
  disclosed in prereg). Baseline NOT rolled. Exiled: no LOUD line.
- Carried recommendation (unchanged from 1530Z): telemetry checks
  on recorder corpora should use --sweep-rows with a row-only glob
  (s751*.json, not s*.json which also matches summary.json).

## Infrastructure

- Registry ops slow under sibling load (registration ~100s each,
  waited out). Safe-commit index clobber hit all worker commits on
  both arms — repaired via HEAD-blob cacheinfo each time with hash
  verification, never reset, never forced; commits verified correct.
  No container EPERM flap this run. Master moved under the breakline
  arm only via this run's own tbovertime2 merge; breakline rebased
  clean (disjoint filenames) with proofs re-run post-rebase
  reproducing the published verdict exactly.
- check.js --quick NOT re-run at coordinator level: zero src/js in
  both arms; arm proofs are the landing gate.
- Reaper at closeout flagged sibling trees' uncommitted changes
  (loop-B trees, build-returns, sim-fightorigin-b, sim-woodcarry3-b)
  and removed nothing; journey-scale tree live, untouched.

## Backlog maintenance (sim-findings.md, this run)

Appended [open]: tbovertime2 pack/fresh-crew/current-HP-scaling/
tier-5-unmeasured/titan-instrument/RERUN-narration items (6) +
breakline w4dpr2-band-drift/wounded-free-flee/tile-mate-join-gap/
floor-flee-silence/learn-flag items (5).

## Next blanks, in order

1. Tier-5 + wave-5 overtime arm (same tbovertime2 instruments,
   prereg amendment): needs a band/horizon in which a world-origin
   wave-4/5 TB fight lands at tier 5, and a band that unlocks wave 5.
2. Re-baseline wave 4 before any wave-4 lever judgment — the w4dpr2
   band (24 meetings on this 8-seed subset) is now 9 meetings on 1
   seed; judging against the old corpus mistakes drift for lever
   effect.
3. Measure the wounded-beast free flee — price how many of the 524
   pre-contact flees were killable at the meeting villager's DPR;
   collides with the risk-weighted-finish ruling vs the wild
   free-flee rule and needs a Steve-call before any change.
4. Close the tile-mate join gap, perception-lawfully (a shout
   answered by those standing there, never a roster feed) — until
   then party work can't move wild outcomes.
5. Write the floor-flee line (cheap narration).
6. Titan-TB instrument arm, only if titan fights become a question.

scale-onramp stays converging (NOT converged): tier-2+ overtime is
now measured and behaves like tier 1 only bigger, and the wild
break-line census is valid — but no wave-4 field party has yet
killed in the field, the full seat stays 0, wave 5 stays 0.
food-economy stays converging (untouched; sibling loop B lane).
Rotation left at 3 (convergence work does not cycle it). Claim
deleted; lock deleted.
Evidence: evidence/2026-10-29/sim-scale-onramp-round-1615.md
(coordinator) + sim-breakline-a.md + sim-tbovertime2-a.md +
perseed-breakline-a/ + perseed-tbovertime2-a/ (all on master,
merged locally pending ship).
