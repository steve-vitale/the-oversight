# sim-breakline-a — WHICH BREAK LINE ACTUALLY ENDS WILD FIELD FIGHTS

Run: fleshout loop, run fleshout-20261029T1615Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-breakline-a.
DIAGNOSIS ONLY — zero src/js, zero game-behavior changes, zero
default flips, zero roster/list feed into any decision (PERCEPTION
LAW, Steve 2026-10-28). This arm records what happened; it does
not change what villagers do.
Preregistration (binding, committed BEFORE any judged run):
evidence/2026-10-29/sim-breakline-a-prereg.md (commit be8528402).
Instruments: commit b3f2891f + sense amendment 8bcd60fc.
VERDICT: DIAG-NO-GO on the prereg as written — on the two
neutrality wordings ONLY (see legs below). THE CENSUS ITSELF IS
VALID AND USABLE: coverage, determinism, joins, and branch
recomputation all pass, and the recorder is proven neutral on
every game-content field by OFF/ON. The NO-GO reflects
mis-specified neutrality proxies (a moved base; a V8 stack-trace
artifact), not bad data. The coordinator should use the census
numbers below and rule on the metric review, not discard them.

## Plain words first

Most wild meetings never become fights at all — and of the ones
that do, the beast usually walks away, not the villager. Out of
805 wild meetings on this band, 525 (65%) end before round 1
with the beast fleeing on sight: those are almost all wounded
beasts (median 4 hit points) scattering before contact, not
fresh beasts declining a fight. Of the 280 fights that actually
run, the single biggest ending is the beast breaking and
leaving (130, 46%), then the villager fleeing because the
trajectory says they cannot win (66 hopeless-branch, 24%),
then the villager killing it (45, 16%), then the villager
fleeing on the wound floor with no explanation at all (30,
11%). Nobody times out: the round cap ends zero fights, and
no trick exit fires once. Only 5 villagers die in wild fights
(2%) — wild fights are not where this band dies; they are
where beasts leave.

Two findings cut against the stories the loop has been
telling itself. First, tile mates do not help: 92 fought
wild fights had allies standing on the very same tile when
the fight started — some tiles held up to 10 villagers —
and in all 280 fought wild fights, nobody ever shouts for
help and nobody ever joins. The engine's help comes from
its crew list, not from who is standing there; the mates
stand and watch, and party-present fights actually die
more often (4 of 92) than solo-tile fights (1 of 188).
Second, the wave-4 wild fight has nearly vanished from
this band on current master: all 9 wave-4 wild fights in
the pilot come from a single seed (75108), with 0 kills
and 0 drive-offs — the other seven seeds have zero
wave-4 wild meetings at all, because their villages took
different paths after the build-armor change. Any arm
that assumes the w4dpr2 band still reproduces will be
measuring a ghost.

## Header (pre-registered) vs result

- COVERAGE BAR: 8/8 valid seeds AND all three recorders
  errs 0 with overflow empty AND join errors 0 AND >= 50
  fought wild fights each carrying a break reason AND
  OTHER = 0.
  RESULT: 8/8 rows valid; joins 1317/1317, 0 errors;
  branch recomputation mismatches 0; fought 280, all
  assigned, OTHER = 0 → PASS.
- DETERMINISM GATE: re-run seed 75106 into a scratch
  dir; its row JSON must be byte-identical.
  RESULT: byte-identical in full (scratch dir removed
  after the diff) → PASS.
- NEUTRALITY (exact bar from the w4dpr2 subset corpus,
  seeds 75101–75108): fieldparty meetings 1272; deaths
  286; won 3; nationalEver 7; wave-4 judgedA per-seed
  75106:15, 75108:9, others 0.
  RESULT: meetings 1317, deaths 240, won 6, nationalEver
  7, wave-4 fought per-seed 75108:9 only → FAIL. Cause
  is base drift, NOT the recorder: build-armor
  (062e07a7a, 2026-10-29 11:40 UTC — AFTER w4dpr2's
  ~05:00 UTC run) seeds bark wearers at village
  creation, plus intervening geartier/map commits, so
  trajectories diverge from day 0. Seed 75108
  reproduces w4dpr2 exactly (102d, 37 deaths, 109
  meetings, 9 wave-4 fights) while the other seven
  diverge — the signature of seed-sensitive drift,
  not instrument error.
- NEUTRALITY OFF/ON: one seed run with BREAKLINE unset
  must match the corpus row on every field except the
  breakline store (fieldparty + w4dpr stores and wall
  fields byte-identical after stripping breakline).
  RESULT (strict letter): FAIL — 76/143 fieldparty
  meetings differ in the diagnostic `stack` string
  alone (a V8 stack-trace artifact of wrapper depth:
  the OFF run's first meeting stack carries an extra
  `travelTo` frame). RESULT (substance): PASS — with
  `stack` stripped, 0 content diffs across all 143
  meetings, 0 caller-classification diffs, w4dpr store
  byte-identical, every wall field and the death
  ledger identical. The recorder changes no game
  state; it changes its own metadata string. The leg
  as worded did not anticipate stack-trace variance.
- SENSE BAR: >= 2 corpus fight traces quoted verbatim
  covering >= 2 distinct break lines, one being
  floor-branch if any floor-branch fight exists.
  RESULT: U (wild) floor + hopeless + learn transcripts
  quoted below, SENSE-OK → PASS, with one disclosed
  instrument gap: the sense script's first-found pair
  (s75101 floor + hopeless) are raid/expedition fights,
  not wild ones — the script was amended (8bcd60fc) to
  judge the leg on judged-universe transcripts only,
  and the leg is met by the U quotes below.
- DIAG-GO BAR: coverage AND determinism AND neutrality
  exact AND sense legs AND one ranked next step named
  with numbers. RESULT: neutrality wordings fail as
  written → DIAG-NO-GO (prereg bar). No re-scoring:
  the census is reported whole and the failures are
  attributed, not adjusted away. Metric review below
  proposes the corrected legs for the next run.
- No re-scoring: no metric was changed mid-run. The
  analyzer's machine legs exit 1 on neutrality only
  (MACHINE-LEGS-FAIL); fixtures FIXTURES-PASS and
  sense SENSE-OK are green as printed.

## Wall numbers (this band, 8 seeds, tableseat-nowait, 180d)

- Wins: 6/8, all lesser seats (full 0). National ever:
  7/8. National final: 7/8. Table reached: 6/8. Table
  entered: 6/8.
- Wave reach: wave 1: 8/8, wave 2: 8/8, wave 3: 8/8,
  wave 4: 6/8, wave 5: 0/8.
- Median survival: 114d (analyzer convention —
  upper-middle row; days 110/180/104/114/90/136/149/102).
  Deaths: 240 total. Starvation: 1.
- Death causes (240): villager:combat 104,
  villager:villager combat 62, player:the wild 26,
  villager:expedition 19, villager:monster 6, rest small.
  This band does not starve; it is killed in combat,
  mostly villager-vs-villager and villager combat.

## Q1 — the primary question: which break line ends wild fights?

Universe U (judgedA shape, waves 1–4): 805 meetings.
Fought (rounds >= 1): 280. Unfought (rounds < 1): 525
— 524 beast-flees-before-contact (mFlee) + 1 round-0
volley kill (vKill). Supplemental (never pooled):
scholar-led 0, other callers 40, non-field channels
472, waves 5+ 0.

### The meetings that never become fights (525)

Unfought by wave: wave 1: 433, wave 2: 74, wave 3: 18,
wave 4: 0. These are NOT fresh beasts declining: their
starting HP median is 4 (quartiles 1 / 4 / 8, max 35)
against fought wave-1 beasts' median 55 (quartiles
45 / 55 / 70). A beast arriving below its break line
(0.25 wave 1, 0.15 waves 2+) scatters before contact —
the free zero-round flight wild chance meetings keep
(the cornered-party hold applies only to mustered
parties). So the modal wild "fight" outcome on this
band is a wounded beast leaving on sight, before any
villager acts. Any kill-path accounting that starts
at fought fights misses 65% of meetings.

### The fought census (280) — branch break lines

| Break line | n | Share |
|---|---:|---:|
| DRIVE-OFF (beast breaks, mFlee) | 130 | 46.4% |
| HOPELESS-BRANCH (trajectory flee) | 66 | 23.6% |
| KILL (vKill) | 45 | 16.1% |
| FLOOR-BRANCH (wound-floor flee) | 30 | 10.7% |
| PARTY-DEATH (vDie) | 5 | 1.8% |
| LEARN-BRANCH (learn withdrawal) | 4 | 1.4% |
| CAP (round cap) | 0 | 0% |
| TRICK-EXIT | 0 | 0% |
| OTHER | 0 | 0% |

Reading: the beast ends nearly half of all fought
wild fights by breaking; the villager ends a third
by fleeing (66 hopeless + 30 floor + 4 learn = 100,
35.7%); kills are 1 in 6. The round cap — the
supposed backstop of a 15-round fight — ends
nothing: no fought wild fight reaches a cap ending
(one 15-round fight ends in a hopeless-branch flee
at round 15's morale, before cap logic runs).

### By wave (fought)

- Wave 1 (153): DRIVE-OFF 88, KILL 24,
  HOPELESS-BRANCH 26, LEARN-BRANCH 3, FLOOR-BRANCH 12.
- Wave 2 (58): DRIVE-OFF 24, KILL 21,
  HOPELESS-BRANCH 10, FLOOR-BRANCH 3.
- Wave 3 (60): HOPELESS-BRANCH 28, DRIVE-OFF 18,
  FLOOR-BRANCH 11, PARTY-DEATH 2, LEARN-BRANCH 1.
  Kills 0.
- Wave 4 (9): FLOOR-BRANCH 4, PARTY-DEATH 3,
  HOPELESS-BRANCH 2. Kills 0, drive-offs 0.
Kills happen only in waves 1–2 (24 + 21). Wave 3
fights are the most hopeless-heavy (28/60); wave 4
fights are all flees or deaths, all within 2 rounds.

### By party-present vs solo-tile (fought)

Tile-present = fieldparty `tile` list at fight start
(excluding deadKnown), length >= 1. Solo-tile = empty.

- Solo-tile (188): DRIVE-OFF 91, KILL 32,
  HOPELESS-BRANCH 41, FLOOR-BRANCH 20, LEARN-BRANCH 3,
  PARTY-DEATH 1.
- Party-present (92): DRIVE-OFF 39,
  HOPELESS-BRANCH 25, KILL 13, FLOOR-BRANCH 10,
  PARTY-DEATH 4, LEARN-BRANCH 1.
Tile mates were present in 33% of fought wild fights
(tile counts: 1 mate in 68 fights, 2 in 13, 3–10 in
11). Yet across ALL 280 fought wild fights: shouts
for help 0, joins 0 — including all 92 party-present
fights (party-present AND joined: 0). The engine's
help comes from the crew list (opts.allyVids), never
from the tile; tile mates stand and watch. Kill rate
is no better with mates present (13/92 = 14% vs
32/188 = 17% solo), and deaths concentrate there
(4/92 = 4.3% vs 1/188 = 0.5%) — though at n=5
deaths this is a flag, not a rate claim.
By wave × party: wave-4 party-present 6 (1 hopeless,
2 floor, 3 deaths), wave-4 solo 3 (1 hopeless,
2 floor). The wave-4 deaths all happen with mates
present and none of them joining.

### Flag cross-tab (w4dpr taxonomy, for comparability)

KILL 45, CAP 0, DRIVE-OFF 130, PARTY-DEATH 5,
HOPELESS 66, LEARN-WITHDRAWAL 13, TRICK-EXIT 0,
WOUND-FLOOR 21, OTHER 0. The vFlee split by
(branch | flag | join) is the precise correction to
the staying-a / w4dpr2 flag readings:

- HOPELESS-BRANCH | HOPELESS | no-join: 66
- LEARN-BRANCH | LEARN-WITHDRAWAL | no-join: 4
- FLOOR-BRANCH | LEARN-WITHDRAWAL | no-join: 9
- FLOOR-BRANCH | WOUND-FLOOR | no-join: 21

So the flag class LEARN-WITHDRAWAL (13) is 69%
floor-branch flees, not learn withdrawals: those 9
are round-1/2 floor flees by learn-intent villagers
(the learn branch cannot fire before round 3, but
the floor check fires from round 1 and sets
fleeLearn when intent is learn). True learn-branch
withdrawals are 4, all at round 3. And in this
corpus the flag WOUND-FLOOR (21) equals the floor
branch exactly (no floor fight carried
fleeHopeless=true here — unlike w4dpr2's w3/w4
matrix, which held 1 such case). The staying-a
"wound-floor" reading survives this census intact:
floor flees are 30/100 vFlee exits (30%), and
round-1 flees are 24 of those 30 — morale (round
>= 2) is never consulted for most of them.

### Rounds by break

- DRIVE-OFF: rounds 1–12 (mode 3; 48 at round 3).
  Beasts that break do so mid-fight, not instantly.
- KILL: rounds 1–6.
- HOPELESS-BRANCH: 53 of 66 at round 2 (the first
  round trajectory is computed), 5 at round 3, rest
  4–15 (one 15-round hopeless flee).
- FLOOR-BRANCH: 24 of 30 at round 1, 2 at round 2,
  rest 3–11 (one 11-round floor flee).
- PARTY-DEATH: rounds 1–2 only.
- LEARN-BRANCH: all 4 at round 3.
The shape is stark: floor flees are round-1 exits,
hopeless flees are round-2 exits, deaths are
round-1/2 exits. Wild fights do not build; they
decide in the first two rounds or become
drive-offs.

### Wave-4 subset in full (all 9, all seed 75108)

| Day | Beast | Caller | Rounds | Outcome | Break | Party | mHpStart | Dealt | Taken |
|---:|---|---|---:|---|---|---|---:|---:|---:|
| 86 | eulogy | resolve | 2 | vFlee | HOPELESS-BRANCH | yes | 900 | 11 | 58 |
| 86 | eulogy | resolve | 1 | vFlee | FLOOR-BRANCH | yes | 889 | 0 | 33 |
| 87 | eulogy | resolve | 1 | vFlee | FLOOR-BRANCH | no | 889 | 0 | 51 |
| 87 | reunion | resolve | 2 | vFlee | HOPELESS-BRANCH | no | 1200 | 13 | 84 |
| 88 | eulogy | resolve | 1 | vFlee | FLOOR-BRANCH | yes | 889 | 0 | 59 |
| 89 | reunion | resolve | 2 | vDie | PARTY-DEATH | yes | 1187 | 17 | 82 |
| 93 | reunion | resolve | 1 | vFlee | FLOOR-BRANCH | no | 1200 | 32 | 60 |
| 94 | suburb | aid | 1 | vDie | PARTY-DEATH | yes | 832 | 33 | 68 |
| 94 | reunion | resolve | 2 | vDie | PARTY-DEATH | yes | 1168 | 46 | 123 |

The 889-HP eulogy re-met three times (days 86–88)
is the chainkill shape again — a wounded beast met
repeatedly, never finished (0, 0, 0 dealt in its
floor flees). The day-94 reunion fight (46 dealt,
123 taken, death in round 2) IS w4dpr2's longest
fight, reproduced exactly (same seed, same day,
same beast, same numbers — Ava's fight) — as
expected, since 75108 reproduces w4dpr2 exactly.
W4dpr2's 42 fights have collapsed to 9 on current
master, on one seed — do not compare wave-4 break
shares across this base change without
re-baselining.

## Sense-testing law (transcripts read + quoted)

S1 — U floor-branch (seed 75102, day 74, murkcap,
Paola, rounds 1, vFlee, FLOOR-BRANCH). Verbatim
engine log, unedited:

```
Paola has Crossbow but no arrows — the string stays drawn, useless.
R1: Paola strikes for 22 (38 left)
Paola's gear absorbs 2.
R1: Sporefall hits Paola for 12 (26 left)
```

Judgment: this reads as a fight cut off, not as a
fight ended. Paola lands one good strike, takes one
hit — and then the transcript simply stops. The
floor branch logs no exit line at all: no "runs",
no "falls back", nothing. A player reading this
would not know Paola fled, only that the log
ended. Every floor-branch flee (30 fought) ends
this silently; hopeless flees get their honest
line, learn withdrawals get theirs, floor flees
get none. That is a narration blank, not a numbers
problem — and it is the branch that ends 1 in 9
fought wild fights, mostly in round 1.

S2 — U hopeless-branch (seed 75103, day 9,
living_wire, Chantal, rounds 2, vFlee,
HOPELESS-BRANCH). Verbatim engine log, unedited:

```
Chantal has Sling but no arrows — the string stays drawn, useless.
R1: Chantal strikes for 9 (51 left)
Chantal's gear absorbs 3.
R1: Full Discharge hits Chantal for 15 (83 left)
R2: Chantal strikes for 8 (43 left)
Chantal's gear absorbs 3.
R2: Full Discharge hits Chantal for 17 (66 left)
Chantal sees how this ends — and runs while running still works.
```

Judgment: this reads as a real, legible fight —
two exchanges, gear visibly absorbing part of each
blow, damage roughly 2:1 against her, and then the
honest flight line at exactly the point the
trajectory math turns (round 2, the first round
trajectory is computed). Nothing here is broken;
the hopeless branch is the best-narrated exit in
the game. The contrast with S1 is the finding: the
two flee branches do not narrate equally.

S3 (bonus, U learn-branch; seed 75102, day 19,
anaconda_empress, Gabriela, rounds 3, vFlee,
LEARN-BRANCH): three even exchanges (7/10, 11/11,
10/11), then "Gabriela has seen enough — withdraws
to report back. (Learn-first: not winnable, not
worth the blood.)" — coherent, and the only
branch whose exit names its reason.

NON-WILD NOTE (labeled, not counted as S1/S2):
the sense script's first-found floor log (seed
75101, day 8, expedition fight, Jorge vs
gallowdeer) ends "Jorge is losing — shouts for
help! Emma charges in!" — and then the fight ends
in a floor flee in the SAME round, with Emma's
arrival never played out. That shout-then-instant-
floor sequence is real engine behavior (shout
branch falls through to the floor check), but it
happened outside the wild universe; in U, the
shout never fires at all (0/280). Do not quote it
as a wild-fight behavior.

Ammo note (both U transcripts): each fighter
carries a ranged weapon with no arrows ("the
string stays drawn, useless") — the volley never
fires in either quoted wild fight. This arm did
not record volley booleans for waves 1–2, so no
volley rate is claimed; the two transcripts are
anecdotes, flagged for the next recorder.

## Guards (reported, not judged — this arm changes nothing)

- Death causes (240 total): villager:combat 104,
  villager:villager combat 62, player:the wild 26,
  villager:expedition 19, villager:monster 6,
  villager:starvation 1. Starvation is 1 of 240;
  any survival guard framed around starvation would
  misread this band.
- No guard can move under a measurement-only arm.

## Ranked next steps (with numbers — no lever built here)

1. RE-BASELINE WAVE 4 BEFORE ANY WAVE-4 LEVER JUDGMENT.
   On current master the w4dpr2 band no longer
   reproduces: wave-4 wild meetings exist on 1/8
   seeds (75108, 9 fights) instead of 2/8 seeds
   (75106:15 + 75108:9 = 24 meetings). Any arm that
   judges a wave-4 lever against w4dpr2's 42-fight
   corpus without a fresh current-master baseline
   will mistake base drift for lever effect. First
   job for the next wave-4 arm: a fresh 8–16 seed
   current-master baseline with its own prereg.
2. MEASURE THE WOUNDED-BEAST FREE FLEE (the modal
   ending). 524/805 wild meetings (65%) end before
   round 1 with a wounded beast (median 4 HP)
   scattering on sight. Price the counterfactual:
   of those 524, how many were killable at the
   meeting villager's observed DPR (beast HP vs
   1–2 rounds of damage)? If a large share were
   killable, the free flee — not damage, not
   staying — is the wave-4 wall's front door, and
   it collides directly with the risk-weighted-finish
   ruling (Steve 2026-10-27: defenders finish a
   crippled beast they meet if they can) versus the
   wild-meeting free-flee rule. That collision is a
   Steve-call before any change; the measurement
   must come first.
3. CLOSE THE TILE-MATE JOIN GAP (perception-lawful
   direction only). 92 fought wild fights had tile
   mates present, 0 joins, 0 shouts — help comes
   from the crew list, never from the tile. The next
   arm should decompose WHY opts.allyVids is empty
   when tile mates stand there (crew-list membership
   vs tile presence, by caller), and frame the fix
   as perception (a shout the fighter can see
   answered by those standing there), never as a
   roster feed. Until this gap closes, party
   formation work cannot move wild-fight outcomes:
   parties exist on tiles and never enter fights.
4. WRITE THE FLOOR-FLEE LINE (cheap narration fix,
   ranked below kill-path work). 30 fought wild
   flees end with no exit line at all (S1). One
   honest line in the floor branch ("X falls back,
   hurt too badly to hold") makes 11% of fought
   wild endings legible. Narration only — no
   behavior change — but it stops the transcript
   from ending mid-fight.
5. RECORD VOLLEY BOOLEANS FOR WAVES 1–2 (next
   recorder version). Both U sense transcripts show
   ranged weapons with no arrows; w4dpr2 proved 0
   volleys in 42 wave-4 fights, but no wave-1/2
   volley rate exists. The breakline recorder v2
   should store volleyFired/volleyDealt booleans for
   all waves so the ammo gap can be priced, not
   anecdoted.

## Metric review (for the NEXT run — nothing re-scored here)

- NEUTRALITY-EXACT (cross-base): the leg assumed
  the base was unchanged since w4dpr2. It was not
  (build-armor + geartier + map commits landed
  between). A cross-base exact-reproduction leg is
  only valid on the same base; on a moved base it
  fails no matter how clean the instrument is.
  Proposed revision: the neutrality leg for the next
  run is OFF/ON on game-content fields on the SAME
  base (recorder present vs absent, same seeds,
  same code), plus a same-base determinism gate.
  Cross-base comparisons are reported as drift
  diagnostics, never as GO/NO-GO legs.
- OFF/ON BYTE-IDENTITY: the leg as worded swept
  recorder metadata (V8 `stack` strings) into a
  game-neutrality claim. Stack traces vary with
  wrapper depth by construction; they are not game
  state. Proposed revision: OFF/ON compares all
  fields EXCEPT recorder stack-trace metadata
  (and the breakline store itself); any game-content
  diff is an instrument failure.
- SENSE-SCRIPT UNIVERSE FILTER: the original sense
  script printed first-of-branch transcripts
  regardless of channel, while the prereg required
  wild transcripts. Fixed in-run by amendment
  (8bcd60fc, instrument correction, not a metric
  change): the script now judges SENSE-OK on
  judged-universe transcripts only. Future sense
  scripts should filter to the judged universe from
  the first commit.
- MEDIAN-DAYS CONVENTION (carried from w4dpr2):
  the analyzer reports the upper-middle row
  (index floor(8/2) = 114d). The statistical median
  of this band's days is 112d (middle two: 110d,
  114d). This evidence quotes the analyzer's 114d
  for comparability and notes the 112d here.

## Convergence note

Scale-onramp stays converging, NOT converged. This
arm moves no wall number — by design, it is
diagnosis — but it reframes the blocking mechanism
on current master: the wild fight is usually not
fought (65% pre-contact beast flees), usually not
joined (0/280), never capped (0/280), and at wave 4
nearly absent (9 fights, 1 seed, 0 kills). The next
arm that claims movement on this axis must move one
of those measured quantities, not re-describe them.

## Infrastructure notes

- No container EPERM flap this run; the 8-seed sweep
  ran clean in ~8 minutes (seeds ~1 min each in this
  VM, slower than the 3–4s/seed of earlier notes —
  the sweep prints only after each seed completes).
- Safe-commit index clobber hit all three worker
  commits (prereg, instruments, sense amendment) —
  repaired via HEAD-blob cacheinfo each time with
  hash verification, never reset, never forced,
  commits verified correct. The clobber once showed
  as "MM" (staged + unstaged divergence on the same
  file); the same HEAD-blob repair cleared it.
- Scratch dirs (determinism + OFF/ON + ON re-run)
  removed after their diffs; the worktree holds only
  committed work plus the corpus + evidence committed
  with this file.
- Analyzer exits 1 by design on this run
  (MACHINE-LEGS-FAIL on neutrality only); fixtures
  FIXTURES-PASS (261 checks, 0 fails, incl. 239
  corpus equivalence fights); sense SENSE-OK.
  Fixture matrix note (w4dpr2 w3/w4 corpus, 239
  fought): flag classifier equals verbatim
  classifyBreak 239/239; branch classifier agrees
  on all 79 non-vFlee fights; vFlee matrix:
  HOPELESS-BRANCH|HOPELESS 108,
  FLOOR-BRANCH|HOPELESS 1, FLOOR-BRANCH|WOUND-FLOOR
  35, FLOOR-BRANCH|LEARN-WITHDRAWAL 14,
  LEARN-BRANCH|LEARN-WITHDRAWAL 1, CAP|CAP 1.
  That matrix is what motivated the branch
  taxonomy: the flag LEARN-WITHDRAWAL class is
  mostly floor flees even on the old corpus.
- No live verification, no push, no bump: this arm
  reports "ready for coordinator merge, pending ship"
  per assignment. The batch ship job owns pushes.

## Files

- Corpus: evidence/2026-10-29/perseed-breakline-a/s75101–s75108-fresh.json
  (8 rows) + summary.json (corpusOk true).
- Analyzer: scripts/test-breakline-a.js (machine legs
  FAIL on neutrality only; coverage PASS).
- Recorder + classifiers: scripts/policies/breakline-diag.js,
  scripts/breakline-lib.js.
- Sweep: scripts/test-breakline-a-sweep.js.
- Fixtures: scripts/test-breakline-a-fixtures.js (261 checks, 0 fails).
- Sense: scripts/test-breakline-a-sense.js (SENSE-OK, U transcripts).
- Prereg: evidence/2026-10-29/sim-breakline-a-prereg.md (be8528402).
