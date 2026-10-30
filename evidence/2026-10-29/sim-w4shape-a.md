# sim-w4shape-a — WAVE-4 MEETING SHAPE, RE-BASELINED ON CURRENT MASTER

Run: flesh-out loop, run fleshout-20261030T0320Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-w4shape-a.
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default
flip, no wave-4 lever built on this run.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-29/sim-w4shape-a-prereg.md (commit 4b800e8c1).
Instruments: commit 8a0ec9a5c.
VERDICT: DIAG-GO. Completeness PASS, determinism PASS, sense PASS
(all 13 fought wave-4 logs read, not just the 3 the bar required),
fixtures PASS (28 checks), ranked next named with numbers.

## Plain words first

On current master, wave-4 meetings are rare, concentrated, and
unwinnable-as-fought — and they are not the meetings the old band
described. All 13 wave-4 meetings in the band happen on ONE seed
(75102), between days 55 and 79, and all 13 become fights: there is
no pre-contact scatter at wave 4, unlike wave 1 where most meetings
never become fights. Of those 13 fights, zero end in a kill, zero end
in a drive-off, 7 end with the villager fleeing, 6 end with the
villager dead. Five seeds unlock wave 4, but only one seed ever meets
a wave-4 monster — unlocking wave 4 is not meeting wave 4.

The 13 meetings are really 5 individual beasts met repeatedly: one
eulogy met 4 times, one algorithm 5 times, one audit twice, a herald
and a reunion once each. The beasts' wounds persist across meetings
(the eulogy goes 900 → 877 → 853 HP), so the chain is accumulating —
but at the observed damage rate it would take roughly 70 more
meetings to finish the eulogy and 90 more for the algorithm. Four of
the 13 meetings deal zero damage at all. Tile mates stand on the
fight tile in 10 of 13 meetings, allies join in 3 — and the joining
ally deals 6, 5, and 4 damage against beasts with 850–1,070 HP left.
The join does not bridge anything at this scale.

## Header (pre-registered) vs result

- COMPLETENESS: 8/8 valid seeds AND all six recorders errs 0 with
  overflow empty AND joins 100% AND OTHER = 0.
  RESULT: 8/8 rows valid; joins 975/975, 0 errors; branch
  recomputation mismatches 0; wave disagreements 0; universe 13,
  all assigned a shape + outcome, OTHER = 0 → PASS.
- DETERMINISM GATE: one seed re-run into a scratch dir; row JSON
  byte-identical.
  RESULT: seed 75102 (the wave-4 seed) re-ran byte-identical in
  full; scratch dir removed after the diff → PASS.
- SENSE BAR: >= 3 wave-4 transcripts read end to end, OR all fought
  wave-4 logs when fewer than 3 fought exist.
  RESULT: all 13 fought wave-4 logs read end to end (both outcome
  classes, both shapes present) → PASS, exceeded.
- FIXTURE BAR: taxonomy mapping, tile rule, shape mapping proven on
  synthetic rows before judging.
  RESULT: FIXTURES-PASS (28 checks, 0 fails) → PASS.
- STALE-BAND VERDICT: "REPAIRED" iff a complete, deterministic,
  citable current-master baseline exists.
  RESULT: REPAIRED (see drift section — the baseline reproduces the
  most recent corpus exactly; the breakline-era picture is
  superseded, not reproduced).
- LEVER LICENSE (per shape, >= 5 meetings): wild LICENSED (11);
  raid INSUFFICIENT-DATA (2); other INSUFFICIENT-DATA (0).
- No re-scoring: no metric was changed mid-run. The analyzer exits 0
  (MACHINE-LEGS-PASS); sense was judged by reading, not by the exit
  code.

## Wall numbers (this band, 8 seeds, tableseat-nowait, 180d)

- Wins: 6/8, all lesser seats (full 0). National ever: 6/8.
  National final: 6/8. Table reached: 7/8. Table entered: 6/8.
- Wave reach: wave 1: 8/8, wave 2: 8/8, wave 3: 6/8, wave 4: 5/8,
  wave 5: 0/8. (Reach is the unlock flag — see the unlock≠encounter
  finding below.)
- Median survival: 114d (analyzer convention — upper-middle row;
  days sorted [31, 86, 90, 101, 114, 115, 115, 165]; statistical
  median 107.5d, noted for comparability).
- Deaths: 232 total. Starvation: 2.
- Death causes (232): villager:combat 90, villager:villager combat
  73, player:the wild 23, villager:expedition 15, villager:monster
  11, rest small. This band does not starve; it is killed in combat.

## Q1 — the primary question: what shape are wave-4 meetings?

Universe: every joined row with fieldparty wave == 4, all channels,
all callers (scholar-led flagged, none occurred). N = 13.

### By shape (fieldparty channel, verbatim)

| Shape | n | Fought | Kills | FLEE | DEATH | DRIVE-OFF | PRE-CONTACT |
|---|---:|---:|---:|---:|---:|---:|---:|
| wild (field) | 11 | 11 | 0 | 6 | 5 | 0 | 0 |
| raid | 2 | 2 | 0 | 1 | 1 | 0 | 0 |
| other | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| TOTAL | 13 | 13 | 0 | 7 | 6 | 0 | 0 |

Wild-judged sub-count (breakline comparability: field + caller in
{resolve, patrol, aid} + non-scholar leader): 11 — all wild meetings
qualify (callers resolve 6, aid 7 across the universe; patrol 0;
scholar-led 0). Raid meetings are both resolve-caller via the raid
depth flag. Other-shape wave-4 meetings: zero in-band — no
expedition/other wave-4 meeting occurred on any seed.

### By outcome, in full

- KILL (fought vKill): 0. PRE-CONTACT-KILL (round-0 vKill): 0.
  WAVE-4 KILL COUNT ON THE BAND: 0 — fought and pre-contact alike.
- DRIVE-OFF (fought mFlee): 0.
- FLEE (fought vFlee): 7 — HOPELESS-BRANCH 4, FLOOR-BRANCH 3,
  LEARN-BRANCH 0, CAP 0, TRICK-EXIT 0.
- DEATH (fought vDie): 6 (46% of meetings).
- PRE-CONTACT-SCATTER (round-0 mFlee): 0.
- OTHER: 0.
Every wave-4 meeting became a fight, and every fight ended in a
flee or a death. The pre-contact scatter that dominates wave 1
(breakline: 65% of wild meetings) does not exist at wave 4 in-band:
wave-4 beasts arrive near full HP (700–1,200), far above their break
lines, so nothing scatters on sight.

### By solo vs tile-mate presence (recorded state only)

Tile-mate present = fieldparty `tile` excluding deadKnown, length
>= 1. Reported only — never a decision input (perception law).

| | n | FLEE | DEATH | Kills |
|---|---:|---:|---:|---:|
| solo-tile | 3 | 2 | 1 | 0 |
| tile-mate present | 10 | 5 | 5 | 0 |

Tile mates were present in 10/13 meetings (tile counts 1–4), yet
allies joined in only 3 (all 3 party-present, via the shout path:
d56, d65, d74). Joined-ally damage from the logs: 6, 5, 4 — against
beasts holding 853, 971, and 1,008 HP at the time. The join is real
but negligible at wave-4 scale. Solo-tile meetings fare no worse
than party-present ones (1 death in 3 vs 5 in 10) — at n=13 this is
a shape note, not a rate claim.

### By caller

resolve 6, aid 7, patrol 0, sortie 0, other 0. Aid-caller meetings
(7) are the crisis-response shape: a villager answering someone
else's trouble meets a wave-4 beast — and 3 of the 6 deaths are
aid-caller meetings (the other 3 are resolve-caller).

### Fighter gear at meeting (all 13)

- Armed: 13/13 (every fighter carried a weapon).
- armorP: range 4–60 (4, 9, 9, 9, 9, 14, 22, 22, 22, 22, 29, 60, 60).
  The two armorP-60 fighters still took 28–35 damage per round after
  absorbs of 55–69 — armor absorbs visibly, but raw wave-4 hits
  (30–100) outrun it.
- veteranW3 (wave-3+ kill in the ledger): 0/13. No wave-4 fighter in-
  band is a wave-3 veteran.
- Weapons (loadoutPost, gearUp-inclusive): kitchen_knife, sling ×4,
  crude_bow, bow ×3, fire_hardened_spear, hunting_spear, hatchet.
  No high-tier weapon appears. 8/13 transcripts carry a ranged
  weapon with no arrows ("the string stays drawn, useless"); volleys
  fired: 0/13.
- Intents: engage 8, learn 5. Five wave-4 meetings are led by a
  learn-intent villager — including the first meeting (d55) and two
  deaths (d64 raid, d70).

## Q2 — how is wave-4 first met per seed?

| Seed | First wave-4 meeting |
|---|---|
| 75101 | none (wave 4 unlocked, 0 meetings) |
| 75102 | d55, wild/resolve, eulogy, solo-tile, FLEE r2 (hopeless) |
| 75103 | none (wave 4 NOT unlocked) |
| 75104 | none (wave 4 unlocked, 0 meetings) |
| 75105 | none (wave 4 unlocked, 0 meetings) |
| 75106 | none (wave 4 NOT unlocked) |
| 75107 | none (wave 4 unlocked, 0 meetings) |
| 75108 | none (village lost d31, wave 2, 0 meetings) |

UNLOCK ≠ ENCOUNTER: 5/8 seeds unlock wave 4, but only 1/8 ever meets
a wave-4 monster within 180 days. Any lever judged on wave-4 reach
alone (5/8) overstates wave-4 contact (1/8) fivefold. The wave-4
question on this band is a one-seed question — and that seed's
village is lost by day 86, so the wave-4 window closes with the
village, not with a win.

## The 13 meetings in full (seed 75102, days 55–79)

| Day | Beast | Shape/Caller | Rounds | Outcome | mHpStart→Left | Dealt | Taken | Party | Gear (armorP / weapon) |
|---:|---|---|---:|---|---|---:|---:|---:|---|---|
| 55 | eulogy | wild/resolve | 2 | FLEE hopeless | 900→877 | 23 | 75 | solo | 9 / kitchen_knife |
| 56 | eulogy | wild/aid | 3 | FLEE hopeless | 877→853 | 24 | 88 | tile 3, joined | 22 / sling |
| 57 | eulogy | wild/aid | 2 | DEATH | 853→853 | 0 | 82 | tile 4 | 9 / kitchen_knife |
| 59 | eulogy | wild/aid | 1 | FLEE floor | 853→853 | 0 | 30 | tile 1 | 22 / sling |
| 64 | algorithm | raid/resolve | 2 | DEATH | 1000→986 | 14 | 103 | tile 4 | 29 / crude_bow |
| 65 | algorithm | wild/aid | 3 | FLEE hopeless | 1000→971 | 29 | 96 | tile 1, joined | 60 / sling |
| 67 | algorithm | wild/aid | 2 | DEATH | 971→971 | 0 | 66 | tile 2 | 60 / sling |
| 70 | algorithm | wild/aid | 1 | DEATH | 971→959 | 12 | 100 | solo | 9 / fire_hardened_spear |
| 71 | algorithm | wild/resolve | 2 | DEATH | 959→959 | 0 | 161 | tile 2 | 9 / bow |
| 73 | audit | raid/resolve | 2 | FLEE hopeless | 1100→1066 | 34 | 61 | tile 4 | 22 / bow |
| 74 | herald | wild/aid | 1 | FLEE floor | 700→679 | 21 | 15 | tile 4 | 14 / hunting_spear |
| 74 | audit | wild/resolve | 3 | DEATH | 1066→1008 | 58 | 100 | tile 4, joined | 22 / bow |
| 79 | reunion | wild/resolve | 1 | FLEE floor | 1200→1185 | 15 | 70 | solo | 4 / hatchet |

Totals: 25 rounds, 230 damage dealt (mean 17.7/meeting), 1,047
taken (mean 80.5/meeting). Zero-dealt meetings: 4 (d57, d59, d67,
d71). Chain arithmetic (illustrative, at each beast's own observed
rate): eulogy 47 dealt over 4 meetings (11.75/meeting) needs ~73
more meetings to cover its remaining 853 HP; algorithm 55 over 5
(11/meeting) needs ~87 more for 959 HP; audit 92 over 2 (46/meeting)
needs ~22 more for 1,008 HP. These are extrapolations, not
predictions — they price how far the current meeting shape is from
a finish, they do not forecast one.

Monster roster check (src/data/monsters.json): eulogy wave 4 HP
900/1100, algorithm 1000/1200, audit 1100/1300, herald 700/900,
reunion 1200/1400 — all wave-4 defs, all meeting HP values within
their def ranges. Herald's 700 sits below the MONSTER-WAVES.md band
anchor (850–1500); the anchor is a band description, not a per-
monster floor, so this is noted as roster spread, not an error.

## Drift diagnostic — the stale band, repaired and re-homed

- vs BREAKLINE (the stale band): drifted, as finding #1437 warned.
  Breakline's wave-4 wild fought count was 9, all on seed 75108.
  This corpus has 11 wild + 2 raid wave-4 meetings, all on seed
  75102; 75108 contributes zero (village lost day 31 at wave 2,
  27 meetings total, vs breakline's 102 days / 109 meetings / 9
  wave-4 fights). The carrying seed changed; the qualitative shape
  did not: still 0 kills, still 0 drive-offs — breakline's wave-4
  fights were also all flees or deaths.
- vs JOINENDLINES BEFORE LEG (the most recent corpus): STABLE.
  Every wall field, every per-seed meeting count, and every per-seed
  wave-4 count reproduces exactly (e.g. s75102: 86 days, 45 deaths,
  90 meetings, 13 wave-4 meetings on both). The drift happened
  between breakline and joinendlines (narration landings +
  intervening commits), NOT between joinendlines and now.
- Log-stripped row comparison vs the joinendlines before leg: the
  ONLY differences in all 8 rows are sense-slot logs exactly one
  line longer in this run — and each extra line is verbatim a
  landed joinendlines end line ("Emma answered Jorge's shout, but
  Jorge is past holding…", "Big-Eyes breaks… Oliver answered
  Morena's shout.", "The Callback breaks… Desmond answered Emma's
  shout."). Game content is identical; the narration landings are
  the whole difference. This is the proof the drift window closed
  before this run.
- STALE-BAND VERDICT: REPAIRED. This evidence file + corpus is the
  current citable wave-4 baseline. No future wave-4 lever judgment
  may cite w4dpr2's 24, breakline's 9-on-75108, or this run's 13
  without naming its own fresh corpus — per finding #1457, every
  quoted band number is now stale the moment the base moves, and
  the re-derivation clause is the standing guard.

## Sense-testing law (all 13 transcripts read end to end)

S1 — d55 Aria vs eulogy, solo, hopeless flee r2 (quoted verbatim):

```
R1: Aria strikes for 12 (888 left)
Aria's gear absorbs 13.
R1: Final Chapter hits Aria for 42 (58 left)
R2: Aria strikes for 11 (877 left)
Aria's gear absorbs 10.
R2: Epitaph hits Aria for 33 (25 left)
Aria sees how this ends — and runs while running still works.
```

Judgment: coherent and legible — two exchanges at ~3:1 damage
against her, the honest flee line at the trajectory turn. But the
arithmetic is the story: ~11 damage per round against 900 HP is an
82-round kill; the beast kills her in ~3. The hopeless line is
honest because the fight genuinely is hopeless at this scale.

S2 — d56 Daniyar vs eulogy, joined, hopeless flee r3: Daniyar's
sling has no arrows; he strikes 10, 8; Terrence charges in and
strikes for 6; Daniyar binds a wound mid-fight (+20 HP) and still
flees. The join adds one 6-damage strike to an 877-HP beast. The
field medicine beat is real play — and it buys exactly one round.

S3 — d57 Aria vs eulogy, death r2: Aria never strikes. Both rounds
are "Aria contradicts the narration — it says Aria runs — Aria
advances", then Epitaph hits for 42, 40. The eulogy's signature
mechanic (it narrates your death) consumes the fighter's turns: a
wave-4 signature that does not just out-damage the fighter but
removes their damage entirely. This is one of the 4 zero-dealt
meetings, and it is by design, not by failure — which is exactly
why the zero-dealt class needs its own measurement before any
lever touches it.

S4 — d59 Daniyar vs eulogy, floor flee r1: one exchange (30 taken,
24 HP left) and the line "Daniyar is past holding — they run while
running still works." Contrast breakline S1, where floor flees
ended mid-log with no line: the soloendlines landing is visible
here — the transcript ends legibly. The fight itself is still a
one-round exit.

S5 — d64 Sigrun vs algorithm, RAID, death r2: crude bow, no arrows;
gear absorbs 49 then 48; Engagement hits for 52 then 51. The raid
meeting reads like a defense that never had a chance — two rounds,
14 dealt, dead. Raid-shape wave-4 is not a different fight; it is
the same unwinnable arithmetic in a raid channel.

S6 — d65 Daniyar vs algorithm, joined, hopeless flee r3: Rage
doubles his strikes (24 ×2.0); Stan joins and strikes for 5;
Daniyar still flees at 20 HP. Even the doubled strike is a rounding
error against 971 HP. If a future lever bets on parties, this is
its bar: a joined fight must change the outcome, not add 5 damage.

S7 — d70 Dmitri vs algorithm, death r1: one strike for 12, one hit
for 100, dead. The one-shot shape: a single wave-4 round can exceed
a villager's entire HP pool. Five of the six deaths come in rounds
1–2; only the joined d74 audit fight reaches round 3.

S8 — d71 Ursula vs algorithm, death r2: bow, no arrows; she binds a
wound mid-fight (+20 HP) and still dies to 77. Field medicine
delays death by less than a round at this damage scale.

S9 — d73 Mateo vs audit, RAID, hopeless flee r2: 34 dealt vs 1,100
HP, honest flee line. The best damage total of any raid meeting —
and still 3% of the beast.

S10 — d74 Alexandra vs herald, floor flee r1: she takes 15 (27
left — she entered the fight already hurt), strikes for 21, flees.
A low-HP entry into a wave-4 fight that ends, mercifully, in a
floor flee rather than a death. The nearly-dead-entry pattern from
the death census is visible here, not just in deaths.

S11 — d74 Mateo vs audit, joined, death r3: a joint-longest wave-4
fight in-band (3 rounds) with 58 dealt — the best damage total of any
meeting. Terrence joins, strikes for 4. Mateo dies anyway. The
best wave-4 fight on the band still ends in death with the beast
at 1,008/1,100 HP.

S12 — d79 Faina vs reunion, floor flee r1: 15 dealt, 70 taken, flees
at 18 HP. One exchange decides it — the modal wave-4 meeting in
miniature.

Cross-cutting sense findings: (1) every fight is decided in rounds
1–3 — wave-4 fights never build; (2) the flee lines now land
(soloendlines + joinendlines), so transcripts end legibly where
breakline's floors ended mid-log; (3) the ammo gap is audible in
8/13 transcripts ("the string stays drawn, useless") with 0 volleys
fired; (4) signature mechanics work as designed and cost damage —
the eulogy's narration beats are the reason a meeting deals zero.

## RANKED NEXT (with numbers — no lever built here)

1. CHAIN-FINISH / ZERO-DEALT MEASUREMENT (the bridgeable wave-4
   question, wild shape only — LICENSED, n=11). 13 meetings are 5
   beasts; wounds persist across meetings but 4/13 meetings deal 0
   (narration-beat turns, round-1 floor flees, round-1/2 deaths).
   Next arm: decompose the zero-dealt class per cause and price the
   counterfactual — at observed per-beast DPR, how many re-meetings
   finish each beast, and what share of meetings must stop dealing
   zero before a chain can close. This is "change what a fight is
   for" (a re-meeting that finishes vs a re-meeting that re-loses),
   not a damage-number lever, not a head re-count.
2. JOIN EFFECTIVENESS AT WAVE-4 SCALE. 3 joins add 6/5/4 damage vs
   850–1,070 HP remaining. If parties are the intended bridge to
   wave-4 kills, the next measurement is ally contribution at
   wave-4 scale on party-present fights (n=10 here, 3 joined) — a
   lever that adds a party member without changing ally output at
   this scale cannot move the kill count.
3. RAID-SHAPE WAVE-4 — INSUFFICIENT-DATA (n=2). Do not judge any
   raid-shape lever from 2 meetings. A raid-heavy band or a larger
   seed set must come first.
4. AMMO AT WAVE 4. 8/13 no-arrow transcripts, 0/13 volleys. Ranked
   below chain work: even a firing volley is small against 900+
   HP, so ammo is a real gap but not the front door to a wave-4
   kill. A band-wide volley rate (not just wave-4 anecdotes) should
   be measured before it is priced as a lever.
5. OTHER-SHAPE WAVE-4 — nothing to judge (n=0). If expedition/other
   wave-4 meetings are supposed to exist, their absence is itself a
   finding for the encounter-rate question (unlock 5/8 vs contact
   1/8), not a lever target.

## Guards (reported, not judged — this arm changes nothing)

- Death causes (232 total) and wall numbers are reported above; no
  guard moves under a measurement-only arm.
- No guard can move under a measurement-only arm.

## Metric review (for the NEXT run — nothing re-scored here)

- LEVER LICENSE THRESHOLD (>= 5 meetings/shape): fixed here as a
  judgment aid, not a GO leg. It worked: wild (11) is judgeable,
  raid (2) and other (0) are honestly insufficient. Keep it — but
  note it licenses a shape for judgment, not a lever for landing;
  a lever still needs its own prereg and before/after.
- MEDIAN-DAYS CONVENTION (carried from breakline): the analyzer
  reports the upper-middle row (114d); the statistical median is
  107.5d. This evidence quotes 114d for comparability and notes
  107.5d here.
- SENSE-BAR WORDING: the bar as written ("all fought logs when
  fewer than 3") is satisfied trivially when fought n is small;
  this run exceeded it (13/13 read). Future preregs should keep the
  "read all when few" clause — it is what forced the full read here.
- UNLOCK-vs-ENCOUNTER: waveReach is reported as reach, but the
  finding that reach (5/8) overstates contact (1/8) deserves its own
  pre-registered pair in the next wave-4 arm (reach count AND
  meeting count per seed, judged together, never reach alone).

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no wall
number — by design, it is diagnosis — but it replaces a stale
baseline with a current one and reframes the blocking mechanism on
current master: wave-4 meetings are not scarce because beasts
scatter (0 pre-contact), not absent because wave 4 is locked (5/8
unlock it), and not unwinnable for lack of meeting (13 meetings) —
they are unwinnable-as-fought (0 kills, 0 drive-offs, 6 deaths),
chained across re-meetings of 5 beasts that nobody finishes. The
next arm that claims movement on this axis must move one of those
measured quantities — a finished beast, a drive-off, a joined fight
that changes its outcome — not re-describe them.

## Infrastructure notes

- No container EPERM flap this run; the 8-seed sweep ran clean in
  ~2.5 minutes of compute (faster than breakline's ~8 min — the
  sweep prints only after each seed completes).
- Safe-commit index clobber hit both worker commits (prereg,
  instruments) — repaired via HEAD-blob cacheinfo each time with
  hash verification, never reset, never forced, commits verified
  correct. Same clobber class as the 2026-10-29 loop notes.
- Scratch dir (determinism re-run of s75102) removed after its diff;
  the worktree holds only committed work plus the corpus committed
  with this file.
- Analyzer exits 0 (MACHINE-LEGS-PASS); fixtures FIXTURES-PASS
  (28 checks, 0 fails); sense read 13/13 logs (SENSE-OK by reading).
- No live verification, no push, no bump: this arm reports "ready
  for coordinator merge, pending ship" per assignment. The batch
  ship job owns pushes.

## Files

- Corpus: evidence/2026-10-29/perseed-w4shape-a/s75101–s75108-fresh.json
  (8 rows) + summary.json (corpusOk true).
- Analyzer: scripts/test-w4shape-a.js (machine legs PASS; fixtures
  28 checks; --sense prints all fought wave-4 logs).
- Sweep: scripts/test-w4shape-a-sweep.js (joinendlines stack verbatim,
  corpus perseed-w4shape-a).
- Prereg: evidence/2026-10-29/sim-w4shape-a-prereg.md (4b800e8c1).
- Instruments: scripts/test-w4shape-a-sweep.js +
  scripts/test-w4shape-a.js (8a0ec9a5c).
