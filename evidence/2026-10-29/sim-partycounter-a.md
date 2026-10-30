# sim-partycounter-a — PARTY COUNTERFACTUAL: DOES EVERY TILE MATE JOINING BRIDGE THE GAP?

Run: flesh-out loop, run fleshout-20261030T0215Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-partycounter-a.
Tracker-directed question (from run fleshout-20261030T0015Z): the next
arm must either change what a join is for or prove with a simulated
counterfactual that a bridgeable gap exists — NOT re-price the pooled
single-ally median (sim-shoutrec-a already did that exactly) and NOT
re-narrate endings.
MEASUREMENT ONLY — zero src/js changes, no game-code lever, no
default flip, no one-ally or entry-strength change proposed or built
here. The counterfactual is analytic pricing from recorded state,
never a simulated party fight (the engine takes exactly one ally per
shout; multi-ally joining would need a game-code change this arm
forbids).
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-29/sim-partycounter-a-prereg.md (commit 44343085d).
Instruments: scripts/test-partycounter-a-sweep.js +
scripts/test-partycounter-a.js (commit 64576a2ba, incl. a median-
convention correction found in smoke testing — see infrastructure
notes). Analyzer exits 0 on this run.
VERDICT: DIAG-GO on the instrument, NOT-BRIDGEABLE on the question.
Party formation does not close the gap. At the median addressable
fight, even if every villager on the tile piled in at observed
damage rates, the party would still need to hit 3.56x harder to
drive the beast off (5.83x to kill it). And most joined fights have
no party to form at all: 19 of 26 joined fights had exactly one
villager on the tile besides the fighter.

## Plain words first

Imagine every villager standing on the tile when a fighter shouts
for help actually charging in — not just the one the engine picks.
Would that turn losing fights around? Mostly no, for two separate
reasons. First, there usually isn't anyone else there: in 19 of 26
joined fights, the tile held exactly one mate — the one who already
joined — so the "party" adds nobody. Second, even where mates do
exist, they don't add enough: across the 18 fights that can be
priced, the full party still needs 3.6 times its observed damage
to drive the beast off. Only 3 of 18 priced fights flip at observed
party damage, and zero flip to a kill. Wave 1 gets closest (2.4x
left after the party piles in — a partial bridge, not a crossing).
Wave 4 stays a wall: 69x left even with everyone in. And more than
a quarter of joins (7 of 26) still end before any party round at
all — the fighter is already past holding when they shout, so no
number of mates changes the ending. Party formation is worth
wanting for other reasons (it reads like people — see the sense
notes, where a second mate stands and watches a six-round fight),
but as a gap-closer it is not the lever. The gap is a damage-and-
numbers gap, not a head-count gap.

## Header (pre-registered) vs result

- DIAG-GO BAR (primary): among ADDRESSABLE fights (shout-joined
  with allyActiveRounds > 0), >= 80% PRIMARILY PRICED with a finite
  multiplier for BOTH party flips (pKill and pSurv), with median
  and 1x / <= 1.5x / <= 3x / <= 5x shares for BOTH flips, overall
  and wave-split 1 / 2 / 3 / 4.
  RESULT: 18/19 = 94.7% finite for both flips → PASS. (The one
  unpriced addressable fight is the active-zero-dealt death below,
  counted in the denominator and explained, not dropped.)
- JOIN INTEGRITY (blocks GO): index-join errors 0 across
  fieldparty / tilejoin / shoutrec rows, joined ally in tileAll
  for every joined fight, no unexplained no-shout joined fights,
  shoutAllyDealt = 0 for every shout-joined fight.
  RESULT: joinErrors 0, allyNotOnTile 0, unexplained no-shout 0,
  shoutAllyDealtNonzero 0 → PASS. Shout-time tile presence is
  therefore provable from recorded state: the joined ally is a
  recorded tile mate in all 26 joined fights, and the fight is a
  single synchronous call (no advancePart / nodePos write in
  fieldFights.js), so fight-start tile presence IS shout-time
  tile presence. No roster feed was used anywhere.
- SENSE BAR: >= 3 joined / addressable-fight transcripts read end
  to end.
  RESULT: 4 transcripts read (party-shape bystander, solo-tile
  flee, solo-tile drive-off, floor) → PASS.
- DETERMINISM GATE: re-run one seed into a scratch EVID dir;
  byte-identical to the corpus row.
  RESULT: seed 75106 re-run byte-identical in full (scratch dir
  removed after the diff) → PASS.
- ADDRESSABLE SIZE: 19 addressable fights (>= 8) → not
  INSUFFICIENT-DATA. The verdict is read, not withheld.
- BRIDGEABILITY READING (pre-registered lines; does not move the
  DIAG-GO bar): BRIDGEABLE if median pSurv <= 1.5x, PARTIAL if
  <= 3x, NOT BRIDGEABLE if > 3x; sensitivity crossing a line the
  primary does not → MIXED.
  RESULT: median pSurv 3.56x → NOT BRIDGEABLE. Sensitivity median
  pSurv 3.56x (identical — see why below) → same side, NOT MIXED.
  Wave readings: wave 1 PARTIAL (2.42x, n=8), wave 2 PARTIAL
  (1.91x, n=2, flag only), wave 3 NOT BRIDGEABLE (4.31x, n=5),
  wave 4 NOT BRIDGEABLE (69.34x, n=3).
- DIAG-GO overall: coverage PASS, integrity PASS, sense PASS,
  determinism PASS → DIAG-GO on the instrument, with a
  NOT-BRIDGEABLE finding on the question.

## Headline: party counterfactual prices (18 priced fights)

Definitions (prereg, fixed before judging): S = shout round; HPs =
monster lead HP at the shout; Mmax = lead max HP; mBreak = 0.25
(wave 1) or 0.15 (wave 2+); rtdS = leader window at the shout;
observed = joined ally DPR (allyDealt / allyActiveRounds); kKill /
kSurv = shoutrec's exact single-ally prices; N = tileAll.length
(every villager on the fight tile at shout time, uncapped — the
prototype fed at most 2, the counterfactual counts all); PRIMARY
party DPR = N x observed (each mate credited at the joined ally's
observed in-fight rate — the only in-fight observed mate rate, a
stated assumption, not a per-mate measurement); pKill = kKill / N,
pSurv = kSurv / N. SENSITIVITY party DPR = sum of each mate's own
observed DPR from other U fights in the same seed (Tier SELF: the
joined ally's rate in this fight; Tier A: own ally data; Tier B:
own leader data; Tier C: joined ally's rate fallback). Both party
prices are sufficient, not necessary, exactly as shoutrec's are:
they credit the party alone and ignore the leader's continuing
damage, so the true flip multiplier could be lower.

- BEFORE (single-ally, this band's own legs — never quoted from
  shoutrec): median kKill 6.49x, median kSurv 4.28x.
  Shares <= 1x / <= 1.5x / <= 3x / <= 5x: kill 0.0% / 5.6% /
  22.2% / 33.3%; survival 11.1% / 11.1% / 38.9% / 61.1%.
- PARTY PRIMARY: median pKill 5.83x, median pSurv 3.56x.
  Shares <= 1x / <= 1.5x / <= 3x / <= 5x: kill 0.0% / 11.1% /
  38.9% / 44.4%; survival 16.7% / 27.8% / 50.0% / 66.7%.
  Over all 26 joined fights (floor + active-zero-dealt as
  infinite): survival <= 1.5x is 19.2% (5/26); survival <= 1x is
  11.5% (3/26); kill <= 1x is 0/26.
- PARTY SENSITIVITY: median sKill 5.83x, median sSurv 3.56x —
  IDENTICAL medians to the primary. Why: 13 of 18 addressable
  fights have N = 1, where sensitivity equals primary by
  construction (SELF only), so the median fight is an N = 1 fight
  under both pricings. The sensitivity differs only where it can:
  at <= 1x it flips 3 kill-fights (16.7%) vs the primary's 0,
  because in multi-mate fights some mates' own rates exceed the
  joined ally's — but those fights are off-median, so the headline
  does not move. Tier mix across addressable fights: SELF 19,
  A 2, B 11, C 2 (34 mates total; most mates are priced from their
  own leader data, not from ally data — ally data is rare because
  joins are rare).
- The party moves the survival median from 4.28x to 3.56x — a 17%
  improvement, not a bridge. It moves the kill median from 6.49x
  to 5.83x — a 10% improvement. The reason the improvement is so
  small is the N distribution below, not the arithmetic: dividing
  by N only helps when N > 1, and usually N = 1.

### Tile-mate count distribution (the head-count finding)

- All joined fights (26): N = 1 in 19, 2 in 2, 3 in 1, 4 in 3,
  6 in 1. Mean party size 1.69.
- Addressable fights (18): N = 1 in 13, 2 in 1, 3 in 1, 4 in 2,
  6 in 1.
- Floor fights (7): N = 1 in 6, 4 in 1.
- Fights with N > 2 (a party beyond the engine's 2-cap feed):
  5/26. The counterfactual's extra fighters beyond the single
  joiner (N - 1) are zero in 19 fights, 1 in 2 fights, 2 in 1
  fight, 3 in 3 fights, 5 in 1 fight.
- Plain reading: the binding constraint on party formation is
  not the one-ally rule or the 2-cap — it is that the tile is
  usually empty. A party rule that takes everyone on the tile
  changes nothing for 73% of joined fights, because "everyone"
  is one person.

### Prices by wave (pooled medians hide the gradient — always split)

- Wave 1 (addressable n=8): median kKill 5.07x, kSurv 3.14x →
  party pKill 3.52x, pSurv 2.42x (PARTIAL). pSurv <= 1.5x: 3/8.
  The only band where the party gets within shouting distance.
- Wave 2 (addressable n=2): median kKill 2.37x, kSurv 1.91x →
  party pKill 2.37x, pSurv 1.91x (PARTIAL, n=2 flag only — both
  fights are N = 1, so the party changes nothing here at all;
  the "partial" is the single-ally gap being small, not a party
  effect).
- Wave 3 (addressable n=5): median kKill 6.58x, kSurv 5.06x →
  party pKill 6.58x, pSurv 4.31x (NOT BRIDGEABLE). pSurv <= 1.5x:
  2/5 (both are large-N fights — see the table).
- Wave 4 (addressable n=3): median kKill 118.87x, kSurv 101.04x
  → party pKill 82.57x, pSurv 69.34x (NOT BRIDGEABLE — a wall).
  Sensitivity sSurv 27.85x is lower (mates' own rates help) and
  still a wall by an order of magnitude. pSurv <= 1.5x: 0/3.

### Branch split (where party pricing stops and timing starts)

- Joined outcomes overall (26): vKill 1, mFlee 5, vFlee 18, vDie
  2. Split by pricing: priced addressable 18 (vKill 1, mFlee 5,
  vFlee 11, vDie 1), floor-branch 7 (all vFlee), active-zero-dealt
  1 (vDie, see below). 1 + 5 + 18 + 2 = 26.
- ZERO-WINDOW (floor) line, reported separately, NOT folded into
  the party median: 7/26 = 26.9% of joins. Every floor fight has
  allyActiveRounds = 0; the shout fires and the flee floor fires
  in the same morale pass, before any party round. Party size
  cannot fix this branch by construction — including the one
  floor fight with N = 4 (daniyar chorus_line, s75102 d58).
  This is the same Steve-call question as shoutrec's (suppress
  the futile shout, grant the ally one strike, or leave the
  honest tragedy) — still open, still not decided here.
- ACTIVE-ZERO-DEALT line, reported separately, NOT folded into
  the party median: 1/19 addressable-denominator fights (5.3%),
  the only coverage miss. s75104 d57, chantal_mukendi vs
  buffering (w3): the leader dealt 0 damage in every round
  (mDealt 0, vTaken 124), shouted at round 2 with the monster at
  full 280 HP, and died in round 3 before the joined ally
  (chloe_dubois) could strike — allyDealt 0, allyTaken 0, no
  round-3 morale entry (death ends the fight in the action
  phase). This is a death-before-ally-strike shape, not a DPR
  shape and not an instrument error: the ally's window was one
  round and the leader died in it. It is counted in the
  denominator (hence 18/19, not 18/18) and excluded from the
  medians. A party would not obviously save this fight either:
  the leader dealt nothing in any round, and the death arrived
  before the ally's first strike — but action-phase ordering
  for multiple allies is not recorded, so no party claim is made
  on this fight.

## Per-fight price table (party counterfactual; floor rows infinite)

S = shout round; HPs/vHps = HP at shout; Mmax = lead max HP;
rtdS = leader window at shout; obs = observed ally DPR; N =
tileAll count; pKill/pSurv = primary party prices (equal-rate);
sKill/sSurv = sensitivity party prices (per-mate observed rates);
sensDpr = sensitivity party DPR; tiers = per-mate rate tiers in
tileAll order (SELF = joined ally's rate in this fight; A = own
ally data; B = own leader data; C = fallback). Floor rows:
pKill/pSurv infinite, reason zero-window.

| Seed | Day | Fighter vs monster (wave) | R | Outcome | S | HPs | vHps | Mmax | rtdS | obs | N | kKill | kSurv | pKill | pSurv | sKill | sSurv | sensDpr | Tiers |
|-----:|----:|---------------------------|---:|---------|---:|----:|-----:|-----:|-----:|-----:|---:|------:|------:|------:|------:|------:|------:|--------:|-------|
| 75101 | 38 | gen_r2ga17l vs hushwolf (w1) | 3 | mFlee | 2 | 19 | 66 | 50 | 2.44 | 6.00 | 1 | 1.30 | 0.44 | 1.30 | 0.44 | 1.30 | 0.44 | 6.00 | SELF |
| 75101 | 102 | emma_larsen vs callback (w3) | 4 | mFlee | 3 | 44 | 37 | 260 | 1.34 | 5.00 | 1 | 6.58 | 0.75 | 6.58 | 0.75 | 6.58 | 0.75 | 5.00 | SELF |
| 75102 | 56 | daniyar_askarov vs eulogy (w4) | 3 | vFlee | 2 | 859 | 45 | 900 | 1.64 | 6.00 | 3 | 87.49 | 73.74 | 29.16 | 24.58 | 15.00 | 12.64 | 35.00 | SELF,B,B |
| 75102 | 57 | daniyar_askarov vs chorus_line (w3) | 5 | vFlee | 4 | 207 | 40 | 300 | 10.67 | 3.00 | 4 | 6.47 | 5.06 | 1.62 | 1.27 | 0.41 | 0.32 | 46.83 | SELF,B,B,B |
| 75102 | 65 | daniyar_askarov vs algorithm (w4) | 3 | vFlee | 2 | 1000 | 53 | 1000 | 1.68 | 5.00 | 1 | 118.87 | 101.04 | 118.87 | 101.04 | 118.87 | 101.04 | 5.00 | SELF |
| 75102 | 74 | mateo_alvarez vs audit (w4) | 3 | vDie | 2 | 1030 | 23 | 1100 | 0.78 | 4.00 | 4 | 330.27 | 277.36 | 82.57 | 69.34 | 33.17 | 27.85 | 39.83 | SELF,B,C,B |
| 75103 | 17 | greta_hansen vs hushwolf (w1) | 3 | vFlee | 2 | 36 | 47 | 50 | 1.84 | 3.00 | 1 | 6.51 | 4.25 | 6.51 | 4.25 | 6.51 | 4.25 | 3.00 | SELF |
| 75104 | 17 | gen_duncnkr vs anaconda_empress (w1) | 6 | mFlee | 2 | 71 | 72 | 90 | 5.14 | 4.50 | 2 | 3.07 | 2.10 | 1.53 | 1.05 | 0.99 | 0.67 | 14.00 | B,SELF |
| 75104 | 58 | david_kim vs ad_break (w3) | 3 | vFlee | 2 | 241 | 51 | 320 | 3.00 | 5.00 | 1 | 16.07 | 12.87 | 16.07 | 12.87 | 16.07 | 12.87 | 5.00 | SELF |
| 75104 | 60 | gen_p2ufvsv vs terms_of_service (w3) | 3 | vFlee | 2 | 317 | 61 | 340 | 3.13 | 3.00 | 1 | 33.78 | 28.34 | 33.78 | 28.34 | 33.78 | 28.34 | 3.00 | SELF |
| 75105 | 10 | gen_4yz72hj vs gallowdeer (w1) | 4 | mFlee | 2 | 80 | 34 | 150 | 1.79 | 5.00 | 1 | 8.94 | 4.75 | 8.94 | 4.75 | 8.94 | 4.75 | 5.00 | SELF |
| 75106 | 23 | gen_qhsj2el vs understudy (w2) | 6 | mFlee | 2 | 89 | 78 | 105 | 8.67 | 5.00 | 1 | 2.05 | 1.69 | 2.05 | 1.69 | 2.05 | 1.69 | 5.00 | SELF |
| 75106 | 39 | valeria_quispe vs gallowdeer (w1) | 3 | vFlee | 2 | 85 | 57 | 150 | 2.33 | 6.00 | 6 | 6.09 | 3.40 | 1.01 | 0.57 | 0.82 | 0.46 | 44.62 | SELF,B,A,B,C,A |
| 75106 | 52 | chantal_mukendi vs hushwolf (w1) | 3 | vFlee | 2 | 36 | 60 | 50 | 2.00 | 6.00 | 1 | 3.00 | 1.96 | 3.00 | 1.96 | 3.00 | 1.96 | 6.00 | SELF |
| 75106 | 79 | valeria_quispe vs gallowdeer (w1) | 3 | vFlee | 2 | 130 | 67 | 150 | 5.36 | 6.00 | 1 | 4.04 | 2.88 | 4.04 | 2.88 | 4.04 | 2.88 | 6.00 | SELF |
| 75106 | 79 | valeria_quispe vs gallowdeer (w1) | 3 | vFlee | 2 | 116 | 46 | 150 | 2.19 | 4.00 | 1 | 13.24 | 8.96 | 13.24 | 8.96 | 13.24 | 8.96 | 4.00 | SELF |
| 75106 | 101 | gen_embnvnq vs understudy (w2) | 7 | vKill | 3 | 75 | 65 | 105 | 5.57 | 5.00 | 1 | 2.69 | 2.13 | 2.69 | 2.13 | 2.69 | 2.13 | 5.00 | SELF |
| 75106 | 114 | gen_iw4ffac vs terms_of_service (w3) | 3 | vFlee | 2 | 313 | 81 | 340 | 10.13 | 6.00 | 1 | 5.15 | 4.31 | 5.15 | 4.31 | 5.15 | 4.31 | 6.00 | SELF |

Reading notes on the table (do not misread these rows):
- The three fights that price at or below 1x on the party
  survival flip (pSurv <= 1x) are the hushwolf drive-off (0.44x,
  N = 1), the callback drive-off (0.75x, N = 1), and the valeria
  gallowdeer flee (0.57x, N = 6). The first two already ended in
  drive-offs with one ally — a price at or below 1x there is not
  a rescue story, it is the formula confirming the observed rate
  sufficed. The valeria fight IS a rescue: a six-mate party at
  observed rates drives off a fight the single ally lost. The
  honest count: party-at-observed-rates rescues 1 of the 11
  lost (vFlee) addressable fights on survival, and 0 of 11 on
  kill (no vFlee fight prices pKill <= 1x; the closest is the
  same valeria fight at 1.01x). Two more lost fights price under
  1.5x on survival (chorus_line 1.27x) — near-misses, not flips.
- The valeria N = 6 fight is the party counterfactual's best
  case and it still prices above 1x on kill (1.01x — a rounding
  hair from flipping, on a fight that fled). Six mates, and the
  kill price is still not met. That single row is the whole
  verdict in miniature: even the biggest party on the band does
  not buy a kill.
- The daniyar chorus_line fight (N = 4, rtdS 10.67) shows what a
  long window does: the party survival price drops to 1.27x
  (sensitivity 0.32x — mates' own rates are far above the joined
  ally's 3.00, because daniyar's tile mates are strong fighters
  in their own fights). Long-window fights are where parties
  help most, and there are few of them: most rtdS values are
  1.3–3.1 rounds.
- Wave-4 rows: the audit death prices 82.57x / 69.34x even with
  four mates (sensitivity 33.17x / 27.85x — better, still a
  wall). The algorithm fight (N = 1, monster at 1000/1000 HP at
  the shout, leader 53 HP) prices 118.87x / 101.04x: a fresh
  wave-4 monster met by a lone fighter is not a party question
  at all.

## Sense-testing law (4 transcripts read end to end)

S1 — s75104 d17, PARTY-SHAPE (Najat vs anaconda_empress, 6 rounds,
mFlee, N = 2, fed = [yara_haddad, chantal_mukendi], joined =
yara_haddad). Verbatim engine log, unedited, in full (21 lines):

```
Najat has Sling but no arrows — the string stays drawn, useless.
R1: Najat strikes for 11 (79 left)
Najat's gear absorbs 3.
R1: Death Coil hits Najat for 14 (86 left)
R2: Najat strikes for 8 (71 left)
Najat's gear absorbs 4.
R2: Death Coil hits Najat for 14 (72 left)
Najat is losing — shouts for help! Yara charges in!
R3: Najat strikes for 11 (60 left)
R3: Yara strikes for 5 (55 left)
R3: Death Coil hits Yara for 17 (68 left)
R4: Najat strikes for 11 (44 left)
R4: Yara strikes for 4 (40 left)
R4: Death Coil hits Yara for 19 (49 left)
R5: Najat strikes for 9 (31 left)
R5: Yara strikes for 3 (28 left)
R5: Death Coil hits Yara for 16 (33 left)
R6: Najat strikes for 9 (19 left)
R6: Yara strikes for 6 (13 left)
R6: Death Coil hits Yara for 18 (15 left)
The Anaconda Empress breaks — wounded past its line, it turns and runs. Yara answered Najat's shout.
```

Judgment: this reads as people — and it is the party
counterfactual's human shape. Chantal stood on the tile through
all six rounds, fed as a candidate mate, and never appears in a
single line: the engine takes one ally and the other watches.
Nothing in the log explains why Chantal doesn't pile in, and
nothing needs to for the join beat to read honestly — but the
silence is exactly what a party rule would have to answer in
fiction (why does the second mate wait?). The drive-off end line
is the joinendlines line, present and honest — unlike shoutrec's
S3 blank, joined drive-offs now end with a line. Noted as
joinendlines' landed work, not claimed here.

S2 — s75103 d17 (Greta vs hushwolf, 3 rounds, vFlee, N = 1).
Greta trades two rounds, shouts, Dale charges in and strikes for
3 — and Greta flees on the honest line ("Greta sees how this
ends — and runs while running still works"). The modal joined
fight: one mate, one round of help, still lost. Reads as people
precisely because the help is small and the flight is honest.

S3 — s75106 d23 (Walt vs understudy, 6 rounds, mFlee, N = 1).
Walt binds his own wound mid-fight (+20 HP, field medicine),
shouts, Mateo joins for four steady rounds (5/4/5/6), and the
beast breaks with the joinendlines end line. The long counter-
example again: a single ally plus a leader who keeps fighting
grinds a wave-2 monster down. Nothing here needs a party — and
nothing here suggests a party would have changed the shape, only
the speed.

S4 — s75102 d38, FLOOR (Paola vs landlord, 3 rounds, vFlee,
N = 1). Paola strikes three times (23/21/22), takes 22/21/22,
shouts at 18 HP — "Olivia charges in!" — and the joinendlines
floor line fires ("Olivia answered Paola's shout, but Paola is
past holding — they run while running still works"). Unlike
shoutrec's S2 floor blank, the floor ending now HAS a line. The
tragedy reads honestly instead of silently. Noted as
joinendlines' landed work, not claimed here.

Sense judgment overall: joins read as people answering shouts in
every transcript; the one-ally rule's cost is visible only in S1,
where the second mate's absence has no line at all — not a
narration blank in the ending sense (the ending is now narrated),
but a fiction gap a party rule would need to close (why does she
wait?). The snapshot fields were hand-verified against the S1
log (shout HP, strike damage, fed mates all match the analyzer
row: HPs 71, fed [yara, chantal], Yara's strikes 5/4/3/6).

## Band wall numbers (report-only, diverging prototype)

This band (8 seeds, tableseat-nowait, 180d death-aware): won 6
(full seat 0), nationalEver 6, nationalFinal 6, table 7, entered
6, wave4 5, wave5 0, median survival 114d (upper-middle row;
days 115/86/90/101/165/115/114/31), deaths 232, starvation deaths
2. Never a verdict leg here (diverging prototype per the tilejoin
metric review).

## Drift diagnostic (reference only, never a verdict leg)

This band diverges from shoutrec's published band (won 3, deaths
311, meetings 1068, joined 24, dealt 137 / taken 296): this band
has won 6, deaths 232, meetings 975, joined 26, dealt 136 /
taken 215, and seed 75108 dies at day 31 (27 meetings) where the
older band ran long. The branch moved between runs — geartier
abilities, knower ledger, raidguard, and social r67 landings are
all ancestors of this branch tip and postdate shoutrec's run —
so cross-band equality was never expected. Per the prereg and
the backlog #1457 warning, NO published shoutrec / joinendlines
number is quoted as current here: the verdict judges this band's
paired before-vs-counterfactual legs only (before medians 6.49x /
4.28x on this band's own 18 priced fights; party medians 5.83x /
3.56x on the same fights). The drift direction (more wins, fewer
deaths) is consistent with stronger abilities on the newer base,
but attributing it is out of scope for this measurement arm.

## Ranked next steps (with numbers — no behavior built here)

1. DO NOT BUILD A PARTY-JOIN RULE TO CLOSE THIS GAP. The party
   counterfactual kills the idea on both of its legs: the tile
   is usually empty (N = 1 in 19/26 joined fights), and where a
   party exists it still leaves a 3.56x survival gap at the
   median (5.83x kill gap) and a 69.34x survival gap at wave 4.
   A party rule may still be worth building for fiction and
   feel (S1's watching mate is a real human-shape gap), but it
   must not be sold as a scale-onramp fix — on this evidence it
   rescues 1 of 11 lost addressable fights at observed rates on
   survival, 0 of 11 on kill.
2. THE FLOOR BRANCH IS STILL THE SEPARATE STEVE-CALL QUESTION
   (7/26 joins, 26.9%, ally never strikes — including one N = 4
   fight). Options remain shoutrec's three, not implemented
   silently: (a) a shouted ally gets at least one strike before
   the floor flee is honored; (b) the shout is suppressed when
   the leader is already below the flee floor; (c) leave it.
   Note the change since shoutrec: the floor ending now HAS an
   honest line (joinendlines), so option (c) reads as tragedy
   rather than silence now — the question is purely mechanical,
   not narrational, anymore.
3. THE NEXT ARM ON THIS AXIS MUST CHANGE WHAT A FIGHT IS FOR,
   NOT WHO JOINS IT. The remaining gaps after this arm are: a
   3.56x party survival gap at the median (damage / numbers,
   not head-count), a 26.9% timing branch no damage number
   touches, and a wave-4 wall (69.34x party survival) that no
   plausible party closes. Candidate directions, in order of
   this evidence: (a) survival-flip targeting — what would let
   a losing fight end in drive-off rather than flight (the
   break line, not the kill line, is the cheaper bar — 3.56x vs
   5.83x — and drive-offs already end 5/26 joined fights);
   (b) the wounded-beast free flee (breakline-a's 65% modal
   ending) as the kill-path front door, still colliding with
   the risk-weighted-finish ruling as a Steve-call; (c) wave-4
   entry shape — fresh wave-4 monsters met at full HP by lone
   fighters (algorithm 1000/1000, leader 53 HP) are not a party
   question at all, they are a meeting question.
4. IF A PARTY RULE IS EVER BUILT FOR FEEL, IT NEEDS A FICTION
   ANSWER FOR THE WAITING MATE FIRST. S1's Chantal problem: the
   second mate on the tile needs a reason to wait (orders? fear?
   holding the line? tending the wounded?) or a reason to pile
   in — otherwise the rule trades one honest beat (one ally
   answers) for an unexplained crowd. That is a design question
   for Steve, not a measurement to run.

## Metric review (for the NEXT run — nothing re-scored here)

- MEDIAN CONVENTION, CORRECTED IN SMOKE TESTING. The analyzer's
  first version used the upper-middle row for all medians
  (breakline's days convention). Smoke-testing against the old
  corpus showed wave splits diverging from shoutrec's published
  wave medians (wave-2 kKill 6.00x vs 4.59x) — because shoutrec
  uses the standard median (mean of two middles for even n).
  Corrected before this band ran: prices use the standard median
  (shoutrec convention), survival days keep the upper-middle row
  (breakline / tilejoin convention, labeled as such). Pooled
  medians (odd n) were unaffected. Future price arms must state
  their median convention in the prereg.
- EQUAL-RATE PRIMARY vs PER-MATE SENSITIVITY, RESOLVED BY
  MEASUREMENT. The primary assumes every mate hits like the
  joined ally; the sensitivity replaces that with each mate's
  own observed DPR. On this band they agree on the median
  exactly (3.56x / 3.56x) because the median fight has N = 1.
  Proposed revision: future party arms should report the
  N = 1 share FIRST — when it exceeds ~50%, the primary and any
  per-mate refinement must agree on the median by construction,
  and the interesting variation lives only in the multi-mate
  tail (here: 5 fights with N > 2, where sensitivity flips 3
  extra kill-fights at 1x). A party arm that reports only a
  pooled median without the N distribution is hiding its own
  denominator.
- ACTIVE-ZERO-DEALT AS ITS OWN CLASS. Shoutrec's pricing had two
  infinite classes (zero-window, active-zero-dealt) but no
  observed instance of the second; this band produces one (a
  death before the ally's first strike). Proposed revision: keep
  active-zero-dealt counted in the coverage denominator (as here:
  18/19, not 18/18) and described from its recorded fields —
  its full log is not stored (sense slots keep first-joined
  fights only), so no transcript claim is made on it.
- SENSE-SLOT COVERAGE. Sense slots keep the FIRST joined fight
  per seed only, so only one transcript on this band (S1) shows
  the multi-mate party shape; the other five first-joined slots
  are N = 1. Proposed revision: future party-shape arms should
  record sense logs for the first N >= 2 joined fight per seed
  as well as the first joined fight, or the sense bar cannot
  cover the shape being priced.
- POOLED MEDIAN HIDES THE N DISTRIBUTION (carried from shoutrec's
  wave-gradient note, now with head-count numbers): the party
  median (3.56x) mixes 13 N = 1 fights (where the party IS the
  single ally, median unchanged by construction) with 5
  multi-mate fights (where the party helps). Pre-register the N
  distribution for any future party arm; do not report a party
  median alone.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no
wall number — by design (measurement only) — but it closes the
question the tracker set for it: the party counterfactual does
NOT prove a bridgeable gap exists. The single-ally gap (this
band: 6.49x kill / 4.28x survival) shrinks under full-party
pricing to 5.83x / 3.56x — still NOT BRIDGEABLE by the
pre-registered lines, still a wall at wave 4 (69.34x party
survival), with 26.9% of joins in a timing branch no party fixes
and 73% of joins on tiles too empty for a party to matter. The
next arm that claims movement on this axis must change what a
fight is for (survival-flip targeting, the wounded-beast free
flee, wave-4 meeting shape) or answer the floor-timing Steve-call
— not re-count heads on the tile.

## Infrastructure notes

- No container EPERM flap this run; the 8-seed sweep ran clean
  in ~15 min (seeds ~1–3 min each in this VM).
- Safe-commit index clobber hit the prereg commit (44343085d)
  and the instruments commit (64576a2ba) — repaired via
  HEAD-blob cacheinfo each time with hash verification (worktree
  hash = HEAD blob), never reset, never forced, commits verified
  correct, status empty after repair. The final commit below was
  checked the same way after landing (see the run's commit
  record).
- Analyzer exits 0 on this run (MACHINE-LEGS-PASS: fixtures 18/18,
  coverage 18/19, join integrity clean, 12 sense slots available);
  the final verdict additionally requires the determinism gate,
  which passed separately (seed 75106 byte-identical, scratch
  removed).
- Median-convention correction (see metric review) was made
  BEFORE this band ran, during smoke testing against the old
  corpus — the smoke run's prices are not evidence and are not
  quoted as findings; only this band's numbers are judged.
- check.js --quick was NOT run: this arm adds no game code and
  modifies no existing file (only new scripts + evidence), and
  the directly relevant proofs are complete instead (node --check
  on both new scripts, 18/18 analyzer fixtures, 8/8 corpus rows
  valid with all recorder errs 0, determinism byte-identical).
  Not claimed as green; recorded as not run, with the reason.
- No live verification, no push, no bump: this arm reports
  "committed in worktree, pending coordinator merge" per
  assignment. The batch ship job owns pushes.

## Files

- Corpus (fresh band, ON leg): evidence/2026-10-29/
  perseed-partycounter-a/on/s75101–s75108-fresh.json + summary.json.
- Sweep: scripts/test-partycounter-a-sweep.js (shoutrec substrate
  verbatim, output dir changed only).
- Analyzer: scripts/test-partycounter-a.js (fixtures + join +
  party primary + per-mate sensitivity + judge; exits 0 on
  DIAG-GO legs).
- Prereg: evidence/2026-10-29/sim-partycounter-a-prereg.md
  (44343085d).
- This evidence: evidence/2026-10-29/sim-partycounter-a.md.
