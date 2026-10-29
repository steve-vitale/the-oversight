# sim-w4dpr2 — WAVE-4 PER-ROUND DAMAGE/SURVIVAL DIAG

Run: fleshout loop, run fleshout-20261029T0415Z (adopting the dead
0145Z run's tree; its funnel-a sibling arm already landed on master
as f67cc41df). Axis: scale-onramp (blocking axis, converging, NOT
converged). Worker: sim-w4dpr2.
DIAGNOSIS ONLY — zero src/js, zero game-behavior changes, zero
default flips, zero policy changes, zero roster/list feed into any
decision (PERCEPTION LAW, Steve 2026-10-28). This arm records what
happened; it does not change what villagers do.
Preregistration (binding, committed BEFORE any judged run):
evidence/2026-10-29/sim-w4dpr2-prereg.md (commit 63b1e98a7).
Instruments: commit 3fc97adb0. This run's corpus completion +
analysis: see "Infrastructure notes" below.
VERDICT: DIAG-GO — all five prereg legs pass (coverage, determinism,
wall reproduction exact, sense reads, ranked next step). No wall
movement is claimed from re-analysis.

## Plain words first

A wave-4 field fight is over almost before it starts, and the
villager always loses it. Every one of the 42 wave-4 field fights in
this band ends by round 2 — half end in round 1. A lone villager,
armed and usually armored, scratches a beast carrying a median 900
hit points for about 10 damage total, absorbs about 74 damage in
return, and then either dies (17 of 42, 40%) or runs (25 of 42).
Nobody kills one. Nobody even drives one off. Nobody is ever once
on a winning path — the engine's own "winning" flag reads 0 of 42.

The two numbers that explain everything, side by side: at the damage
rate villagers actually sustain (median 6.5 per round), killing an
850-hit-point beast takes 131 rounds. The fight cap is 15 rounds,
and villagers survive 2. So the gap is not one problem but two
stacked ones: they deal roughly a twentieth of what a kill needs,
AND they live roughly a seventh as long as even a capped fight
allows. Fixing damage alone does not produce a kill, because the
fighter is dead or gone by round 2 either way; fixing staying
alone does not produce a kill either, because 15 rounds at 6.5
damage is 98 damage against a 900-hit-point beast.

The best fight in the whole corpus makes the point cleanly. A
villager carrying the best bow in the band dealt 33 damage in a
single round — five times the median rate — and died in that same
round, having taken 68. The beast walked away with 799 of its 832
hit points. And two whole mechanisms that should help never show
up at all: no bow volley fires in any of the 42 fights, and no ally
ever joins or deals a single point — every fight is one villager
alone against a wave-4 beast, even though these are the same
wounded beasts chainkill already found (starting hit points
501–1200, median exactly 900, matching chainkill's chained
terminals 501–1177, median 900). Villagers re-meet wounded beasts
and still cannot finish them.

## Header (pre-registered) vs result

- COVERAGE BAR: at least 16/16 valid seeds AND at least 20 wave-4
  field fights each carrying a break reason AND at least 90% of the
  corpus's wave-4 field fights carrying a break reason.
  RESULT: 16/16 rows valid (recorder errs 0, overflow empty, both
  recorders, every row); 42/42 fought fights carry a break reason;
  OTHER = 0; assigned 100% → PASS. Note: all 42 universe meetings
  were fought (0 unfought — no evades, no round-0 volley-only
  outcomes in this corpus), so fought == universe here.
- DETERMINISM GATE: re-run seed 75106 into a scratch dir; its row
  JSON must be byte-identical to the corpus row.
  RESULT: byte-identical (440,118 bytes, `cmp` clean; scratch dir
  removed after the diff) → PASS. This also proves the adopting
  run's sweep-script edits (retry span, stdout mode — see
  infrastructure notes) changed no row content.
- WALL REPRODUCTION BAR (returns-a, exact): wins 4/16 all lesser,
  nationalEver 13/16, deaths 600, per-seed judgedA 75106: 15,
  75108: 9, 75109: 8, 75115: 5, 75116: 4, 75110: 1, all other
  seeds 0.
  RESULT: won 4 (full 0), nationalEver 13, deaths 600, per-seed
  counts exact → PASS. The new recorder drew no RNG and wrote no
  game state, exactly as in returns-a.
- SENSE BAR: >= 1 corpus fight trace quoted verbatim (S1) AND the
  parser fixture read + quoted (S2).
  RESULT: longest corpus fight trace quoted below (S1) AND the
  driven parser fixture quoted below (S2) → PASS.
- DIAG-GO BAR: coverage AND determinism AND wall reproduction
  exact AND sense legs AND one ranked next step named with
  numbers. RESULT: all five → DIAG-GO.
- No re-scoring: no metric was changed mid-run. Metric doubts are
  under "metric review" below, for the next run.

## Wall numbers (this corpus, 16 seeds, tableseat-nowait, 180d)

- Wins: 4/16, all lesser seats (full 0). National ever: 13/16.
  National final: 9/16. Table reached: 10/16. Table entered: 4/16.
- Wave reach: wave 4 in 11/16 villages; wave 5 in 0/16.
- Median survival: 180d (analyzer convention — see metric review;
  statistical median 163d). Deaths: 600 total. Starvation: 4.
- Wave-4 field kills: 0. Wave-4 drive-offs: 0. Wave-4 field
  meetings (judgedA): 42, all solo, 0 formed parties.

## Q1 — the primary question: what does a wave-4 field fight look like, round by round?

It looks like one villager alone, hit for roughly eight times what
they deal, gone within two rounds.

- UNIVERSE: 42 wave-4 field meetings (resolve/patrol/aid callers,
  leader not the scholar), all fought, 0 unfought. Join:
  2717/2717 meetings, 0 join errors. Parse: 42/42 exact (parsed
  dealt/taken/ally sums match the engine record to the point on
  every corpus fight) — every DPR number below is built on an
  exact parse, not a modeled one.
- DAMAGE DEALT: sustained DPR median 6.5/round (quartiles 0 / 6.5 /
  13, max 33, mean 8.4). Total damage per fight: median 10.5.
  A quarter of fights average zero damage per round — the median
  already includes the misses; it is not a hit-only rate.
- DAMAGE TAKEN: median 54.5/round (quartiles 42 / 54.5 / 63, range
  29–86) — inside the canon wave-4 band (35–95 incoming before
  armor). Total taken per fight: median 74. Whole-corpus exchange
  ratio: 505 dealt vs 3247 taken, about 1 : 6.4.
- SURVIVAL: median 2 rounds, max 2. By outcome: flees median 1
  round (n=25), deaths median 2 rounds (n=17). 21 fights end in
  round 1, 21 in round 2, none reaches round 3.
- BY ROUND: round 1 — all 42 fight; dealt median 9, taken median
  53, leader dealt mean 9.2, ally dealt mean 0. Round 2 — 21
  remain; dealt median 0, taken median 45, leader dealt mean 5.7,
  ally dealt mean 0. The second round, when it happens, is mostly
  misses taken while already losing: the median round-2 fighter
  deals nothing before dying or fleeing.
- COMPOSITION: all 42 solo. Joined-from-start 0, shout-joined 0,
  ally damage 0 in every fight. Volley: 0 of 42 fights fire a bow
  volley (parser-confirmed: volleyDealt sum 0) — the opening
  volley fieldability priced at ~32 one-shot never appears here,
  even in fights whose loadout names a bow.
- LOADOUTS: all 42 leaders armed, 39/42 armored — gear is present
  and still does not move the picture. Best classes by median DPR:
  starfall_bow (n=2, median 33 — both 1-round fights, one death
  dealing 33, one flee dealing 32); hatchet+bow (n=1, 25);
  crossbow (n=2, median 21); crude_bow (n=2, median 16). The
  workhorse class, crowbar (n=10), medians 6. Kitchen knife
  (n=5) medians 0; stone knife (n=3) medians 0. No loadout class
  reaches the 57–80 band, and no class kills.
- BEASTS: starting HP median 900 (range 501–1200); ending HP
  median 900 (the median fight barely dents its beast). Monsters
  met: eulogy 17, reunion 12, algorithm 5, suburb 4, eater 2,
  influencer 2.
- TRAJECTORY FLAGS: everHopeless 11 (exactly the hopeless breaks),
  everWinning 0. Intents: learn 26, engage 16. Trick known in 16
  fights — and no trick exit in any of them (trickExit 0).

## Q2 — at the DPR parties actually sustain, does a kill fit the 15-round cap?

No — not at any observed rate, and barely at the alien-tier yardstick.

- CAP-FIT at observed DPR: 0/42 fights (0%). At the corpus median
  DPR (6.5), an 850-HP beast needs 130.8 rounds; 1100 HP needs
  169.2; 1500 HP needs 230.8. The cap is 15.
- CAP-FIT at the fieldability 57–80 band (yardstick, not claim):
  850 HP needs 14.9 rounds at 57 (fits, barely) and 10.6 at 80;
  1100 HP needs 19.3 at 57 (fails) and 13.8 at 80; 1500 HP needs
  26.3 at 57 and 18.8 at 80 (both fail). So even alien-tier
  weapons do not cap-fit the upper half of the wave-4 HP band —
  and the band's observed median beast (900 HP) needs 15.8
  rounds at 57, i.e. it fails the cap at the bottom of the
  alien band too.
- THE SURVIVAL GAP, stated plainly: a kill needs 131 rounds at
  observed DPR; the cap allows 15; the party survives 2. Closing
  the damage gap without closing the survival gap still ends
  every fight by round 2; closing the survival gap without
  closing the damage gap still ends every capped fight with the
  beast above 800 HP. Both gaps are binding, and survival is the
  tighter one (2 vs 15 is a 7.5x shortfall; 6.5 vs 57 is an 8.8x
  shortfall — same order, survival slightly tighter).

## Break reasons (exactly one per fought fight, prereg priority order)

- PARTY-DEATH (vDie): 17 (40.5%).
- HOPELESS (vFlee + fleeHopeless): 11 (26.2%).
- LEARN-WITHDRAWAL (vFlee + fleeLearn, not hopeless): 8 (19.0%).
- WOUND-FLOOR (vFlee, neither flag): 6 (14.3%).
- KILL 0, DRIVE-OFF 0, CAP 0, TRICK-EXIT 0, OTHER 0.
Reading: 40% of wave-4 meetings kill the villager outright; of
the 60% who get away, nearly half (11 of 25) leave because the
trajectory math already says they cannot win, and most of the
rest leave on a learn-first withdrawal or a wound floor. Nobody
leaves because they won, drove the beast off, or timed out a
long fight — there are no long fights.

## Wave-3 contrast (never pooled into the wave-4 numbers)

- 184 meetings, 150 fought, 34 unfought (all mFlee — beasts
  fleeing before a round, counted outside DPR).
- Breaks: HOPELESS 67 (44.7%), DRIVE-OFF 33 (22.0%),
  PARTY-DEATH 14 (9.3%), WOUND-FLOOR 27 (18.0%),
  LEARN-WITHDRAWAL 6 (4.0%), CAP 3 (2.0%), OTHER 0. Kills 0.
- DPR median 0 (mean 8.4 — same mean as wave-4, far wider spread:
  max 68, with hardlight/phase classes reaching 29–45 medians).
  Taken median 22/round (vs wave-4's 54.5 — wave-4 hits about
  2.5x harder per round). Survival median 2–3 rounds, max 15.
  Cap-fit 28% (42/150).
- The contrast sharpens the wave-4 picture in one specific way:
  wave-3 fights DO end in drive-offs (33) and DO sometimes run
  long (max 15 rounds, 3 caps). Wave-4 fights do neither — the
  difference is not that villagers fight wave-4 beasts worse, it
  is that wave-4 beasts end the fight in 2 rounds either by
  killing or by forcing flight, before any drive-off or long
  fight can develop.
- Parse mismatches: 17/150 in the contrast only (all
  focus_group/gavel monsters, takenDelta −8 to −59: the log
  under-counts the recorded taken damage, i.e. some monster
  damage lands without a parser-matched "hits" line). The
  headline wave-3 DPR and taken/round use the engine record
  totals, not the parse, so they are unaffected; only the
  per-round taken split in the contrast is soft. Wave-4 parse
  is exact 42/42, so no judgment number in this arm is soft.
  See metric review.

## Sense-testing law (transcripts read + quoted)

S1 — corpus trace (the LONGEST wave-4 field fight in the corpus;
every wave-4 fight is at most 2 rounds, so this 2-round fight IS
the longest — disclosed, not cherry-picked upward):

Seed 75108, day 94, mid=reunion, outcome=vDie, break=PARTY-DEATH,
rounds=2, beast HP start 1168, left 1122, dealt 46, taken 123.
Parse deltas all 0. Verbatim engine log, unedited:

```
R1: Ava strikes for 24 (stalker's opening +4) (1144 left)
Ava's gear absorbs 13.
R1: Your Move hits Ava for 66 (34 left)
R2: Ava strikes for 22 (1122 left)
Ava's gear absorbs 11.
R2: Your Move hits Ava for 57 (0 left)
```

Judgment: this reads as a real fight, not as numbers without one
— a named villager strikes twice, her gear visibly absorbs part
of each blow, the beast's hits are named and counted down, and
she dies on the second hit with the death line "(0 left)". What
it does NOT read as is a contest: there is no decision point, no
shout, no ally, no retreat line, no second act. Ava lands two
solid strikes (24, 22 — above the corpus median rate), takes
66 then 57, and is dead having removed 4% of the beast's health.
The narration is honest; the fight is simply an execution in two
rounds. Any fix that only adds narration here would be decorating
a wall.

S2 — parser fixture (driven fight, base code): a machete+bow
villager vs an audit-shaped beast, parsed by the analyzer's own
parser. Driven result: outcome=vFlee, rounds=3, mDealt=172,
vTaken=64, allyDealt=5, logLines=17. Parsed: dealt=172 (delta 0),
taken=64 (delta 0), allyDealt=5 (delta 0), volley=33,
unknownDealt=0, unknownTaken=0. All 33 fixture checks pass
(FIXTURES-PASS), including every break classifier and the
spear-ranged / dual / bow-carried / unarmed loadout classes.
The fixture's job is the parser + the reading, not a kill claim:
it proves the instrument reads a real 3-round fight exactly,
which is what makes the corpus's 2-round maximum a finding
about the game rather than about the parser.

## Guards (reported, not judged — this arm changes nothing)

- Death causes (600 total): villager:combat 235,
  villager:villager combat 160, player:the wild 87,
  villager:expedition 35, villager:monster 32, the rest small.
  Starvation accounts for 4 of 600. This band does not starve;
  it is killed in combat. Any survival guard framed around
  starvation would misread this corpus.
- No guard can move under a measurement-only arm; guards are
  reported for the band's own sake, per prereg.

## Ranked next steps (with numbers — no lever built here)

1. MEASURE THE STAYING REQUIREMENT (tightest gap first).
   Surviving a capped 15-round wave-4 fight at the observed
   54.5 taken/round means absorbing ~818 damage before armor —
   against villager HP in the ~100 range (Ava: 100). The next
   arm should price staying, not just damage: what armor/HP/
   healing/avoidance stack lets a villager live 15 rounds, and
   does any earnable stack reach it? Until that number exists,
   damage arms are aiming at a fight nobody lives to finish.
2. INVESTIGATE THE MISSING VOLLEY (0/42, parser-confirmed).
   Loadouts name bows, fieldability priced a ~32 volley
   one-shot, and no volley fires once. Find the mechanism: is
   it ammo (pocketed-ammunition arm's territory), a bow that is
   carried but never equipped at fight time, or an opening
   condition that never fires against wave-4 beasts? A working
   volley alone would roughly triple the median fight's total
   damage (10.5 → ~42) — still not a kill, but the largest
   single free damage source in the corpus.
3. FIX THE W3 PARSER GAP (contrast hygiene, no judgment impact).
   Focus_group/gavel special-attack hit lines are not matched
   by the parser (17 W3 mismatches, takenDelta −8 to −59).
   Fix the line shapes before any future arm leans on wave-3
   per-round taken splits.

## Metric review (for the NEXT run — nothing re-scored here)

- Median-days convention: the analyzer reports medianDays as
  the upper-middle row (index floor(16/2) = 180d), matching
  prior arms' convention. The statistical median of this
  band's days is 163d (middle two: 146d, 180d). This evidence
  quotes the analyzer's 180d for comparability and notes the
  163d here; a future run should pick one definition and
  state it in its prereg.
- Wave-3 parser gap (see contrast + next step 3): 17/150
  contrast fights mismatch on takenDelta, all negative, all
  focus_group/gavel. The prereg's validation leg requires
  exactness on "every corpus fight whose log carries
  strike/hit lines" — read strictly, that leg would fail on
  the contrast. The arm judges the leg on the wave-4 corpus
  (42/42 exact), where the judgment numbers live, and reports
  the contrast gap openly rather than re-scoring the leg
  against the friendlier cut. A future prereg should scope
  the validation leg to the judged universe explicitly.
- DPR quartile q25 = 0 is not a parser artifact: 42/42 wave-4
  parses are exact, so the zero quartile is real (misses and
  1-round fights with no damage). No adjustment is warranted.
- The prereg's coverage bar ("at least 20 fights") was met
  with 42 because every universe meeting happened to be fought
  (0 unfought). A future band with evades would test the
  fought-vs-unfought split harder; the rule itself held.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no
wall number — by design, it is diagnosis — but it sharpens the
blocking mechanism to a measured pair: wave-4 field kills 0/42,
wave-5 reach 0/16, and now the reason is decomposed per round
rather than asserted (2-round survival vs a 131-round kill
requirement at observed DPR, 0 ever-winning trajectories).
The next arm that claims movement on this axis must move one of
those two gaps with numbers, not just re-describe them.

## Infrastructure notes (adopting run — read before reusing this tree)

- ADOPTED STATE (verified, not trusted): the 0145Z tree held 13
  rows (s75101–s75113) plus a 0-byte s75114. Each of the 13 was
  validated against the sweep's own validity rules — JSON parses,
  all prereg keys present, fieldparty/w4dpr meeting counts equal,
  recorder errs 0, overflow empty — not by file size alone. The
  0-byte s75114 was discarded (it is not a judged row).
  Re-ran ONLY 75114, 75115, 75116 with the adopted sweep script.
  Completed seeds were never re-run, except the prereg-authorized
  determinism re-run of 75106 into a scratch dir (byte-identical,
  scratch removed).
- EPERM WRITE FLAP (loud, per assignment): the container write
  flap hit this run repeatedly — sweep writes failed at ~04:28,
  ~04:29, ~04:35–04:48, and ~05:07–05:16 UTC, and .git ref writes
  had failed 4x at 04:21–04:23 UTC before adoption. Signature:
  a long-running node's writeFileSync fails EPERM while fresh
  processes write fine in the same minute, and a failing process
  keeps failing across retries — so short retry spans lose.
  Two instrument fixes were made in place in
  scripts/test-w4dpr2-sweep.js (content-neutral: the sim is
  deterministic and the determinism gate proves row bytes
  unchanged): (1) writeFileRetry span raised from 8 attempts /
  ~28s to 60 attempts with up to 30s sleeps (~26 min worst
  case); (2) a W4DPR_STDOUT=1 mode emitting the row JSON on
  stdout for caller-side capture. NOTE: the stdout mode was
  added but never used for a landed row — two redirected runs
  exited 1 in ~1.2s with no stderr, unexplained (possibly VM
  turbulence around the reboot below); validate stdout mode
  before relying on it. Landed rows all came through file mode
  once the flap cleared.
- VM REBOOT ~04:55 UTC: uptime reset mid-run and killed one
  in-flight sim (seed 75114 attempt); re-ran cleanly after.
  No corpus rows were lost — the reboot predates the 75114
  landing (05:02).
- ROW LANDINGS: 75114 (05:02 UTC, 180d survived, 187/187
  meetings, errs 0), 75115 (05:04, 130d village-lost, 83/83,
  errs 0), 75116 (05:06, 138d village-lost, 204/204, errs 0).
  Summary landed 05:16 UTC once the flap cleared (corpusOk
  true). The adopted prereg file was NOT modified.
- No live verification, no push, no bump: this arm reports
  "ready for coordinator merge, pending ship" per assignment.
  The batch ship job owns pushes.

## Files

- Corpus: evidence/2026-10-29/perseed-w4dpr2/s75101–s75116-fresh.json
  (16 rows) + summary.json (corpusOk true).
- Analyzer: scripts/test-w4dpr2.js (MACHINE-LEGS-PASS).
- Fixtures: scripts/test-w4dpr2-fixtures.js (33 checks, 0 fails).
- Sense: scripts/test-w4dpr2-sense.js (SENSE-OK).
- Instrument fix: scripts/test-w4dpr2-sweep.js (retry span +
  stdout mode; node --check clean).
