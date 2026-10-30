# sim-shoutrec-a — EXACT SHOUT-TIME FLIP PRICES (KILL + SURVIVAL)

Run: flesh-out loop, run fleshout-20261029T2115Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-shoutrec-a.
Backlog #1452 (claimed by this run). Follow-up to sim-allydpr-a
(DIAG-NO-GO / INSUFFICIENT-DATA: the exact shout-time price was
priced for 0/24 joined fights for lack of recorder fields).
DIAG / INSTRUMENTATION ONLY — one additive record-only src/js change
(22 insertions, no behavior) plus a policy-side recorder, proven
neutral by a revert-and-compare leg. No default flips, no joining
rewire, no one-ally or entry-strength change, no narration fix built.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-29/sim-shoutrec-a-prereg.md (commit 05f1ac59f).
Analyzer: scripts/test-shoutrec-a.js (fixtures + recompute + price
+ judge + neutrality compare; exits 0 on this run).
VERDICT: DIAG-GO on the instrument. All 17 joined fights that have an
ally window are priced with finite shout-time multipliers for BOTH
flips (kill and survival). The recorder gap that blocked allydpr is
closed.

## Plain words first

An ally who answers a shout is still far too weak to turn the fight —
but now that is measured exactly, at the moment of the shout, instead
of guessed from the end of the fight. At the shout moment, the middle
joined fight needs its ally hitting about 7 times harder to kill the
monster outright, and about 5 times harder just to drive it off.
Driving off is cheaper than killing, as expected — but 5x is still
not close to the 1.5x "maybe entry strength is the question" branch.
Only 3 of 17 fights with an ally window are within 1.5x on the
drive-off price, and one of those still ended in the fighter's death.
At wave 4 the numbers stop being a gap and become a wall: about 218x
to kill, about 158x to drive off. And nearly a third of joins (7 of
24) still never get a blow in at all — the fighter is already below
the flee floor when they shout, so the ally charges in and the fight
ends in the same breath. That timing failure is not a damage failure,
and no damage multiplier prices it; it stays a separate Steve-call
question, reported on its own line below.

The earlier proxy guess (median kill price 17.33x) overstated the kill
gap: the exact shout-time price is 7.34x. The proxy was sufficient,
not necessary — it assumed the ally window stayed the same length
and ignored the leader's continuing damage. The correction matters
for honesty, but it changes nothing about the verdict: 7x is still
nowhere near 1.5x, and the survival price (4.70x) is the number that
matters for villages staying alive, not the kill price.

## Header (pre-registered) vs result

- DIAG-GO BAR (primary): among shout-joined fights with
  allyActiveRounds > 0, >= 80% PRIMARILY PRICED with a finite
  multiplier for BOTH flips, with median and <=1.5x / <=3x / <=5x
  shares reported for both.
  RESULT: 17/17 = 100.0% finite for both flips → PASS.
- RECOMPUTE CHECKS (analyzer, not hand-copy): fresh band reproduces
  the tilejoin ON corpus on shared fields — U joined 24, U fought
  250, index-join errors 0, joined outcomes 2 vKill / 4 mFlee /
  15 vFlee / 3 vDie, ally totals dealt 137 / taken 296.
  RESULT: all 6 checks PASS. The fresh band is the tilejoin band,
  re-run with the recorder added — same seeds, same substrate.
- SENSE BAR: >= 3 joined-fight transcripts read end to end.
  RESULT: 4 transcripts read (Chen death, Sanne floor, moderator
  drive-off, Mia kill — see sense notes) → PASS.
- NEUTRALITY GATE (blocks GO): revert re-run (src change reverted,
  same seeds/substrate, scratch dir) must produce rows byte-identical
  to the judged corpus after deleting the shoutrec store key.
  RESULT: 8/8 seeds IDENTICAL → PASS. Wall numbers identical on
  both legs (won 3, deaths 311, per-seed days/deaths identical).
- NO-SHOUT SPLIT: 24/24 joined fights carry a shout snapshot;
  no-shout 0 (ally-from-start 0, unexplained 0). No instrument
  failure blocks the verdict.
- SNAPSHOT INTEGRITY: shoutAllyDealt non-zero 0 (the ally never
  deals damage before the shout, as the engine guarantees);
  hopeless-check failures 0 (every shout-joined fight recomputes
  hopeless from its own snapshot, rtdS < rtkS * 0.85);
  shoutFleeAt == shoutVbreak mismatches 0 (the flee floor at a
  shout is exactly vBreak, as the prereg derived); per-round
  parse mismatches 0.
- DIAG-GO BAR overall: primary PASS, recompute PASS, sense PASS,
  neutrality PASS → DIAG-GO.

## Headline: exact shout-time prices (17 priced fights)

Definitions (prereg, fixed before judging): S = shout round; HPs =
monster lead HP at the shout; vHps = leader HP at the shout; Mmax =
lead max HP; mBreak = 0.25 (wave 1) or 0.15 (wave 2+); rtdS =
vHps / max(1, shoutVtaken / S) — the leader's remaining window in
rounds, on the engine's own 2-round damage sample; observed ally
DPR = allyDealt / allyActiveRounds, allyActiveRounds = rounds - S.
kKill = (HPs / rtdS) / observed (ally-alone rate that kills within
the window). kSurv = ((HPs - mBreak * Mmax) / rtdS) / observed
(ally-alone rate that drives the beast to its break line within
the window). Both are sufficient, not necessary, prices: they credit
the ally alone and ignore the leader's continuing damage, so the
true flip multiplier could be lower — most visibly on kills (see
the Mia row below).

- kKill MEDIAN: 7.34x. Shares <= 1.5x: 1/17 (5.9%); <= 3x: 3/17
  (17.6%); <= 5x: 6/17 (35.3%). Over all 24 joined fights the same
  counts read 4.2% / 12.5% / 25.0% (the 7 zero-window fights sit
  above 5x as infinite, never dropped).
- kSurv MEDIAN: 4.70x. Shares <= 1.5x: 3/17 (17.6%); <= 3x: 6/17
  (35.3%); <= 5x: 9/17 (52.9%). Over all 24 joined fights: 12.5% /
  25.0% / 37.5%.
- The 1.5x branch is dead on both flips for the median fight, and
  nearly dead even as a near-miss story: only 3 fights price within
  1.5x on survival (Farid drive-off 1.26x, Oliver drive-off 1.11x,
  spool death 0.62x — a death, not a rescue; see the window-artifact
  note below), and only 1 on kill (the same spool death, 0.81x).
  An entry-strength change of 1.5x would move zero non-kill, non-death
  fights across either bar except the two drive-offs that already
  ended in drive-offs.

### Prices by wave (pooled medians hide a 60x gradient — always split)

- Wave 1 (priced n=6): median kKill 3.39x, median kSurv 1.85x.
  Closest band, and the only band where the survival price flirts
  with reachable (two drive-offs at 1.11x/1.26x).
- Wave 2 (priced n=2): median kKill 4.59x, median kSurv 3.67x.
- Wave 3 (priced n=7): median kKill 9.88x, median kSurv 8.10x.
- Wave 4 (priced n=2, plus 1 zero-window): median kKill 217.81x
  (206.86x death, 228.76x death), median kSurv 157.64x (134.55x,
  180.73x). Wave-4 exact prices are WORSE than the allydpr proxy
  median (154.75x): allies strike for 3–4 damage against 453–643 HP
  still standing at the shout, with under one round of leader window
  left (rtdS 0.76 and 0.70). No single-ally change carries this.

### Branch split (where DPR pricing stops and timing starts)

- KILL 2, DRIVE-OFF 4, HOPELESS-BRANCH 8, FLOOR-BRANCH 7, PARTY-DEATH 3
  (identical to allydpr — the recompute check).
- ZERO-WINDOW (floor) line, reported separately, NOT folded into
  the DPR verdict: 7/24 = 29.2% of joins. Every floor fight has
  allyActiveRounds = 0 and allyDealt = 0; every zero-window fight
  is a floor fight. The shout fires and the flee floor fires in the
  same morale pass, before any further round. rtdS at the shout for
  these fights runs 0.08–2.12 rounds — the leader had, at most, two
  rounds left, usually under one. This is the Steve-call question
  from allydpr (suppress the futile shout, grant the ally one
  strike, or leave the honest tragedy) — still open, still not
  decided here.
- The 17 priced fights are exactly the non-floor shout-joined
  fights. No fight with a positive window dealt 0 damage (active-
  but-dealt-0 = 0): every ally who got a round struck at least once.

## Per-fight price table (exact shout-time prices; floor rows infinite)

S = shout round; HPs/vHps = HP at shout (leader HP max always 100
in this corpus); Mmax = lead max HP; rtdS = leader window at shout;
act = ally active rounds; str = ally strike rounds (post-shout
rounds with ally damage > 0); obs = observed ally DPR; needS =
damage to the break line (HPs - mBreak * Mmax); kKill/kSurv as
defined above. Floor rows: kKill/kSurv infinite, reason zero-window.

| Seed | Day | Fighter vs monster (wave) | R | Outcome / branch | S | HPs | vHps | Mmax | mBreak | rtdS | act/str | Ally dealt | obs | needS | kKill | kSurv |
|-----:|----:|---------------------------|---:|------------------|---:|----:|-----:|-----:|-------:|-----:|-------:|-----------:|-----:|------:|------:|------:|
| 75101 | 25 | Farid vs hushwolf (w1) | 3 | mFlee / DRIVE-OFF | 2 | 32 | 63 | 50 | 0.25 | 2.57 | 1/1 | 6 | 6.00 | 19.5 | 2.07 | 1.26 |
| 75101 | 26 | Vasyl vs gallowdeer (w1) | 3 | vFlee / HOPELESS | 2 | 139 | 71 | 150 | 0.25 | 3.16 | 1/1 | 6 | 6.00 | 101.5 | 7.34 | 5.36 |
| 75101 | 52 | Oliver vs gallowdeer (w1) | 3 | mFlee / DRIVE-OFF | 2 | 55 | 58 | 150 | 0.25 | 2.64 | 1/1 | 6 | 6.00 | 17.5 | 3.48 | 1.11 |
| 75101 | 94 | Desmond vs buffering (w3) | 3 | vFlee / HOPELESS | 2 | 210 | 67 | 280 | 0.15 | 3.44 | 1/1 | 4 | 4.00 | 168.0 | 15.28 | 12.22 |
| 75101 | 100 | gen_pz654xh vs buffering (w3) | 3 | vFlee / HOPELESS | 2 | 104 | 23 | 280 | 0.15 | 2.00 | 1/1 | 6 | 6.00 | 62.0 | 8.67 | 5.17 |
| 75102 | 40 | gen_0x2wi4u vs gallowdeer (w1) | 2 | vFlee / FLOOR | 2 | 88 | 20 | 150 | 0.25 | 0.82 | 0/0 | 0 | 0.00 | 50.5 | inf | inf |
| 75103 | 107 | Sanne vs suburb (w4) | 2 | vFlee / FLOOR | 2 | 323 | 16 | 1300 | 0.15 | 0.38 | 0/0 | 0 | 0.00 | 128.0 | inf | inf |
| 75104 | 75 | Yara vs gallowdeer (w1) | 3 | vFlee / HOPELESS | 2 | 131 | 73 | 150 | 0.25 | 5.41 | 1/1 | 4 | 4.00 | 93.5 | 6.06 | 4.32 |
| 75104 | 75 | Chantal vs gallowdeer (w1) | 2 | vFlee / FLOOR | 2 | 101 | 28 | 150 | 0.25 | 1.02 | 0/0 | 0 | 0.00 | 63.5 | inf | inf |
| 75104 | 88 | Chantal vs belltoad (w1) | 2 | vFlee / FLOOR | 2 | 16 | 27 | 45 | 0.25 | 0.74 | 0/0 | 0 | 0.00 | 4.8 | inf | inf |
| 75105 | 18 | gen_jm418sb vs anaconda (w1) | 6 | mFlee / DRIVE-OFF | 2 | 73 | 74 | 90 | 0.25 | 6.73 | 4/4 | 16 | 4.00 | 50.5 | 2.71 | 1.88 |
| 75105 | 19 | Mia vs hushwolf (w1) | 3 | vKill / KILL | 2 | 28 | 51 | 50 | 0.25 | 2.13 | 1/1 | 4 | 4.00 | 15.5 | 3.29 | 1.82 |
| 75105 | 62 | gen_8yf6fyg vs redactor (w3) | 3 | vFlee / HOPELESS | 2 | 230 | 30 | 260 | 0.15 | 1.09 | 1/1 | 6 | 6.00 | 191.0 | 35.14 | 29.18 |
| 75105 | 70 | Vasyl vs spool (w3) | 7 | vFlee / HOPELESS | 4 | 234 | 66 | 280 | 0.15 | 10.15 | 3/2 | 7 | 2.33 | 192.0 | 9.88 | 8.10 |
| 75105 | 70 | Vasyl vs spool (w3) | 8 | vDie / PARTY-DEATH | 2 | 178 | 66 | 280 | 0.15 | 66.00 | 6/4 | 20 | 3.33 | 136.0 | 0.81 | 0.62 |
| 75105 | 73 | Caleb vs spool (w3) | 5 | vFlee / FLOOR | 5 | 185 | 22 | 280 | 0.15 | 2.12 | 0/0 | 0 | 0.00 | 143.0 | inf | inf |
| 75105 | 73 | Mia vs callback (w3) | 5 | vKill / KILL | 3 | 84 | 41 | 260 | 0.15 | 2.08 | 2/2 | 10 | 5.00 | 45.0 | 8.06 | 4.32 |
| 75106 | 26 | gen_embnvnq vs moderator (w2) | 9 | mFlee / DRIVE-OFF | 2 | 129 | 83 | 150 | 0.15 | 9.76 | 7/7 | 29 | 4.14 | 106.5 | 3.19 | 2.63 |
| 75106 | 38 | gen_4uem561 vs voice_mimic (w2) | 3 | vFlee / HOPELESS | 2 | 45 | 50 | 65 | 0.15 | 2.50 | 1/1 | 3 | 3.00 | 35.3 | 6.00 | 4.70 |
| 75107 | 103 | Chen vs audit (w4) | 3 | vDie / PARTY-DEATH | 2 | 472 | 27 | 1100 | 0.15 | 0.76 | 1/1 | 3 | 3.00 | 307.0 | 206.86 | 134.55 |
| 75108 | 69 | gen_r7aa18u vs callback (w3) | 3 | vFlee / HOPELESS | 2 | 150 | 53 | 260 | 0.15 | 2.36 | 1/1 | 3 | 3.00 | 111.0 | 21.23 | 15.71 |
| 75108 | 69 | gen_cugi4hf vs callback (w3) | 6 | vFlee / FLOOR | 6 | 24 | 16 | 260 | 0.15 | 0.92 | 0/0 | 0 | 0.00 | -15.0 | inf | inf |
| 75108 | 75 | Ava vs eulogy (w4) | 3 | vDie / PARTY-DEATH | 2 | 643 | 26 | 900 | 0.15 | 0.70 | 1/1 | 4 | 4.00 | 508.0 | 228.76 | 180.73 |
| 75108 | 113 | visjoin_111 vs callback (w3) | 2 | vFlee / FLOOR | 2 | 166 | 2 | 260 | 0.15 | 0.08 | 0/0 | 0 | 0.00 | 127.0 | inf | inf |

Reading notes on the table (do not misread these rows):
- Kill rows price ABOVE 1.0 on purpose: the formula prices the ally
  ALONE. Mia's hushwolf kill prices 3.29x even though her ally landed
  the killing blow — because the leader dealt 24 of the final round's
  damage and the ally 4; the ally-alone rate that drops 28 HP in 2.13
  rounds is 13.1 DPR, not 4. The kill rows prove the formula is
  conservative, not that the kills were close calls for the ally.
- The spool death (0.81x / 0.62x) is a window artifact, not a
  near-miss rescue: its rtdS is 66 rounds because the leader took
  almost no damage in rounds 1–2 (shoutVtaken ≈ 0–2, floored at
  mDpr = 1 by the engine's max(1, ...) rule), while dealing nothing
  either (rounds 1–2 leader damage 0 — trick-skip rounds). The
  engine shouted on that same noisy 2-round sample, so the price is
  faithful to the engine's decision inputs — but a 66-round "window"
  for a fight that ended in death 6 rounds later is not a survival
  window in any real sense. One fight of 17; the medians are robust
  to it, and it must not be quoted as "a fight 1.5x would have saved."
- The callback floor row with needS = -15.0: the monster was ALREADY
  below its break line (24 HP vs a 39-HP line) at the shout moment,
  yet the leader fled. Mechanism, found in the engine order: in one
  morale pass the shout branch fires, then the flee-floor check
  fires (leader 16/100 < fleeAt 0.213), and the pass breaks on the
  flee BEFORE reaching the mBreak check at the bottom of the pass.
  The floor pre-empts the break. A drive-off that was already earned
  mid-round is lost to the floor ordering. Noted as a mechanism
  observation, not a verdict leg and not a fix proposed here.

## Per-round damage (leader / ally, from roundTotals diffs)

Rounds that end in the action phase (kill/death/break before morale)
carry no morale entry for that round; their damage is assigned to
the final round as a flagged residual (analyzer flags
residual-final-round / residual-merged-final-round). After that
assignment, per-round leader and ally damage reconcile EXACTLY to
rec.mDealt / rec.allyDealt in all 24 fights. One component is NOT
round-true and must not be read that way: rec.allyTaken is computed
post-fight (ally entry HP minus end HP), never accumulated in-round,
so roundTotals allyTaken is 0 throughout and the analyzer's
per-round allyTaken is nominal (all in the final round). Pricing
uses allyDealt only, so this touches no price. Format: R<round>:
L<leader damage>/A<ally damage>; only post-shout rounds carry A > 0.

- Farid hushwolf: R1:L18/A0 R2:L0/A0 R3:L17/A6
- Vasyl gallowdeer: R1:L11/A0 R2:L0/A0 R3:L9/A6
- Oliver gallowdeer: R1:L13/A0 R2:L0/A0 R3:L16/A6
- Desmond buffering: R1:L0/A0 R2:L0/A0 R3:L12/A4
- gen_pz654xh buffering: R1:L12/A0 R2:L0/A0 R3:L0/A6
- gen_0x2wi4u gallowdeer (floor): R1:L22/A0 R2:L24/A0
- Sanne suburb (floor): R1:L10/A0 R2:L8/A0
- Yara gallowdeer: R1:L11/A0 R2:L8/A0 R3:L10/A4
- Chantal gallowdeer (floor): R1:L0/A0 R2:L16/A0
- Chantal belltoad (floor): R1:L14/A0 R2:L15/A0
- anaconda: R1:L8/A0 R2:L9/A0 R3:L12/A4 R4:L8/A3 R5:L11/A4 R6:L12/A5
- Mia hushwolf (kill): R1:L0/A0 R2:L22/A0 R3:L24/A4
- redactor: R1:L14/A0 R2:L16/A0 R3:L12/A6
- Vasyl spool flee: R1:L0/A0 R2:L22/A0 R3:L24/A0 R4:L0/A0 R5:L28/A4 R6:L10/A3 R7:L11/A0
- Vasyl spool death: R1:L0/A0 R2:L0/A0 R3:L22/A6 R4:L20/A6 R5:L32/A5 R6:L16/A3 R7:L16/A0 R8:L14/A0
- Caleb spool (floor): R1:L0/A0 R2:L0/A0 R3:L0/A0 R4:L0/A0 R5:L25/A0
- Mia callback (kill): R1:L33/A0 R2:L36/A0 R3:L0/A0 R4:L35/A4 R5:L39/A6
- moderator: R1:L11/A0 R2:L10/A0 R3:L13/A3 R4:L13/A4 R5:L10/A5 R6:L11/A4 R7:L11/A3 R8:L10/A6 R9:L12/A4
- voice_mimic: R1:L9/A0 R2:L11/A0 R3:L9/A3
- Chen audit: R1:L19/A0 R2:L15/A0 R3:L16/A3
- gen_r7aa18u callback: R1:L0/A0 R2:L21/A0 R3:L21/A3
- gen_cugi4hf callback (floor): R1:L0/A0 R2:L26/A0 R3:L25/A0 R4:L0/A0 R5:L26/A0 R6:L25/A0
- Ava eulogy: R1:L16/A0 R2:L16/A0 R3:L13/A4
- visjoin callback (floor): R1:L0/A0 R2:L15/A0

What the per-round view adds beyond the prices: allies strike for
3–6 per round, every round they are present, without exception
(ally strike rounds = active rounds in 15 of 17 priced fights; the
two exceptions are long fights where the ally sat out a round or
two — spool flee 2/3, spool death 4/6). The gap is a rate gap, not
a participation gap: allies show up and hit, at about a quarter of
a leader's rate, against monsters holding 100+ HP at the shout in
most losing fights. Leaders, meanwhile, deal 0 in whole rounds
(trick-skip rounds: Desmond R1–R2, spool R1–R2, Mia hushwolf R1) —
the engine's 2-round DPR sample that triggers the shout is noisy
by construction, which is why rtdS swings from 0.08 to 66.00.

## Sense-testing law (4 transcripts read end to end)

S1 — Chen vs audit, s75107 d103, vDie (wave 4, kKill 206.86x).
Wei strikes 19 and 15 against a 506-HP audit (472 left at the shout,
leader 27 HP), shouts, Valeria charges in and strikes for 3, and the
next monster hit kills Wei (29 damage to 0). The snapshot matches
the log line by line (HPs 472, vHps 27). The call reads as
desperation, honestly answered and honestly futile: 3 damage
against 453 remaining HP is not a rescue in any telling. The 207x
price is visible here as a token blow, not an abstraction.

S2 — Sanne vs suburb, s75103 d107, vFlee, FLOOR-BRANCH (wave 4).
Sanne strikes twice, takes 58 then 26, shouts at 16 HP — "Dale
charges in!" — and the log ENDS. No third round, no flee line, no
consequence at all: the ally's entrance is narrated and then the
fight silently ceases to exist in the transcript (the engine ends
it on the flee floor in the same morale pass, with no log line).
Second independent confirmation of the floor-ending narration
blank (allydpr S3). Noted, not built.

S3 — Sandile vs moderator, s75106 d26, mFlee, 9 rounds (kSurv
2.63x). The long counter-example: Sandile shouts after round 2
(monster 129 left, leader 83), Fatima joins and deals a steady 3–6
per round for seven rounds, the monster is ground down to 20 HP —
and again the log stops with no end line. The joined fight that
works best is also the one whose ending is missing: a reader of
the log alone cannot tell the beast fled (it crossed the 22.5-HP
break line on the final strike). Drive-off-ending narration blank,
confirmed a second time (allydpr S5). Noted, not built.

S4 — Mia vs hushwolf, s75105 d19, vKill (kKill 3.29x, kSurv 1.82x).
Mia shouts with the monster at 28 HP (snapshot HPs 28, vHps 51 —
both match the log); Kayla charges in, takes a hit, and lands the
killing blow (4 damage to 4 HP): "The lead falls — the pack's
coordination shatters." This is the one shape where a small ally
contribution decides a fight: finishing a nearly-dead monster. It
reads as people precisely because the numbers are close — and it
is also the proof that the ally-alone formula overstates kill
prices: the team killed it (Mia 24 + Kayla 4 in the final round),
while the formula asks what the ally alone would have needed.

Sense judgment overall: joins read as people answering shouts in
every transcript; endings read honestly when they exist (death,
kill) and do not exist at all for drive-offs and floor-flees after
a shout. The narration blanks are confined to endings, not to the
join beat. The snapshot fields were hand-verified against all four
logs (shout HP, leader HP, strike damage all match).

## Band wall numbers (report-only, diverging prototype)

Fresh ON band (8 seeds, 180d death-aware, same substrate as
tilejoin ON): won 3 (full seat 0), nationalEver 6, nationalFinal 5,
table 4, entered 3, wave4 7, wave5 0, median survival 123d, deaths
311, starvation deaths 3. Identical to the tilejoin ON band on
every headline — as expected for a record-only change, and confirmed
by the neutrality leg rather than assumed. Never a verdict leg
here (diverging prototype per the tilejoin metric review).

## Ranked next steps (with numbers — no behavior built here)

1. DO NOT TOUCH THE ONE-ALLY RULE OR ALLY ENTRY STRENGTH. The exact
   prices kill the 1.5x branch on both flips: median kill 7.34x,
   median survival 4.70x, wave-4 survival 157.64x. A 1.5x entry change
   moves zero non-kill fights across the kill bar except none, and
   across the survival bar only the two drive-offs that already
   drove off (Farid 1.26x, Oliver 1.11x) — fights the village
   already survived. If entry strength is ever revisited, it needs
   a Steve-call and a survival-flip (not kill-flip) bar — and it
   must first answer the floor branch, not the damage branch.
2. THE FLOOR BRANCH IS STILL THE SEPARATE STEVE-CALL QUESTION
   (7/24 joins, 29.2%, ally never strikes; plus the floor-pre-empts-
   break ordering found here, which cost at least one earned
   drive-off). Options remain allydpr's three, not implemented
   silently: (a) a shouted ally gets at least one strike before the
   floor flee is honored; (b) the shout is suppressed when the
   leader is already below the flee floor; (c) leave it — the futile
   call is itself honest tragedy. This arm measures the branch's
   size and its ordering quirk; it does not pick an option.
3. WRITE THE MISSING END LINES (cheap narration fix, ranked below
   pricing work, NOT built here): drive-off ends after a joined
   fight (S3) and floor-flees after a shout (S2) currently end the
   log with no line. One honest line each makes joined-fight endings
   legible. Narration only, no behavior change.
4. ANY FUTURE DPR WORK MUST BE WAVE-SPLIT AND PARTY-BASED, NOT
   POOLED AND SINGLE-ALLY. The pooled medians (7.34x / 4.70x) mix a
   wave-1 survival band at 1.85x with a wave-4 band at 157.64x — an
   85x spread inside one headline. A future arm that re-prices the
   pooled median, or prices one ally again instead of what a party
   does, re-runs this verdict.

## Metric review (for the NEXT run — nothing re-scored here)

- KILL-FLIP vs SURVIVAL-FLIP, RESOLVED BY MEASUREMENT. This arm
  priced both, as the brief required. The survival flip is the
  right primary for village survival (median 4.70x vs kill 7.34x;
  survival shares dominate kill shares at every threshold), and
  the kill flip stays as context. Proposed revision: the next arm's
  primary is the survival-flip price, kill-flip reported alongside,
  never alone. The 17.33x proxy headline must not be quoted anymore
  — the exact kill median is 7.34x, and the survival median is
  4.70x; quoting the proxy overstates the kill gap by 2.4x.
- ALLY-ALONE CONSERVATISM. Both formulas credit the ally alone and
  ignore the leader's continuing damage, so both are sufficient,
  not necessary, multipliers — most visibly on kills (Mia 3.29x for
  a fight the team won). A true flip multiplier, accounting for the
  leader's damage over the extended window a stronger ally would
  buy, could be lower — especially for near-miss drive-offs. The
  formulas rule OUT the 1.5x branch and rule IN "several-x at the
  median," but they do not pin the median to 7.34x/4.70x exactly.
  Any future arm that wants a necessary (not sufficient) price must
  simulate the counterfactual fight, not scale a rate.
- RTD NOISE FROM THE 2-ROUND SAMPLE. rtdS inherits the engine's own
  first-S-rounds damage sample, and S is usually 2. Trick-skip
  rounds (leader damage 0) and near-untouched openings (leader
  taken ≈ 0) swing rtdS from 0.08 to 66.00. Proposed revision: flag
  fights where shoutMdealt/S or shoutVtaken/S sits at the max(1, ...)
  floor, and report a sensitivity median excluding them (here: the
  spool death is the only fight with rtdS > 11; excluding it, the
  kill median moves 7.34x → 7.70x and the survival median 4.70x →
  4.51x — the artifact matters for single-fight stories, not for
  the headline, which moves under 5% either way).
- FLOOR PRE-EMPTS BREAK. The same-pass ordering (shout → floor →
  break check) means a monster below its break line can still
  escape a drive-off verdict when the leader is below the flee
  floor. Proposed revision: future survival-flip pricing should
  count "already below break at shout" as a distinct class (here
  1/24), not as a priced fight or a failure — it is an ordering
  finding, and it slightly understates how often joined fights
  "should" have driven off.
- POOLED MEDIAN HIDES THE WAVE GRADIENT. Wave-1 survival 1.85x vs
  wave-4 survival 157.64x is an 85x spread inside one headline.
  Proposed revision (carried from allydpr, now with exact numbers):
  pre-register wave splits for any future DPR arm; do not report a
  pooled median alone.
- SENSE-SLOT COVERAGE. Tilejoin sense slots give the first fed
  joined fight per seed (8 slots, all U); shoutrec sense slots give
  the first calledHelp join per seed regardless of channel (2 of 8
  are non-U: s75101 day-8 expedition shout, s75108 day-12 non-U
  kill). Sense claims here rest on the 4 tilejoin-slot transcripts
  actually read, all U, not on the 24.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no wall
number — by design (diag + record-only) and by measurement (band
headlines identical to tilejoin ON). What it moves is the quality
of the reason: tilejoin's "joins do not flip losing fights" and
allydpr's proxy "median kill gap ~17x" are replaced by exact
shout-time prices — median survival gap 4.70x, median kill gap
7.34x, wave-4 survival gap 157.64x, plus a 29.2% timing branch that
no damage number touches. The next arm that claims movement on this
axis must either change what a join is for (floor timing, party
formation, survival-flip targeting) or prove, with a simulated
counterfactual rather than a scaled rate, that a bridgeable gap
exists — not re-price the pooled median.

## Infrastructure notes

- No container EPERM flap on either sim leg; both bands ran clean
  (sweep ~18 min per 8-seed band; analyzer ~3 s).
- Safe-commit index clobber hit the prereg commit (05f1ac59f) as
  "D + ??" on the same file — repaired via HEAD-blob cacheinfo with
  hash verification (worktree hash = HEAD blob), never reset, never
  forced, commit verified correct, status empty after repair.
- Analyzer exits 0 on this run (DIAG-GO); fixtures all PASS (11/11).
- check.js --quick was attempted after the src change and did NOT
  complete: killed by a 600 s timeout with 101 scripts passed and
  zero failures shown (290 scripts, 2 parallel — it runs longer
  than its "seconds" billing on this tree). NOT claimed green. The
  directly relevant proofs are complete instead: node --check on the
  edited file, 1068 recorded fights with zero recorder errors, and
  the byte-identical neutrality band.
- No live verification, no push, no bump: this arm reports "ready
  for coordinator merge, pending ship" per assignment. The batch
  ship job owns pushes.

## Files

- Corpus (fresh band, ON leg only): evidence/2026-10-29/perseed-shoutrec-a/
  on/s75101–s75108-fresh.json + summary.json.
- Neutrality scratch (reverted-src re-run): created under the
  worktree, compared, then DELETED after the compare — no scratch
  files remain in the tree.
- Recorder: scripts/policies/shoutrec-diag.js (new).
- Engine record fields (additive only, 22 insertions):
  src/js/fieldFights.js (SHOUTREC snapshot + roundTotals).
- Sweep: scripts/test-shoutrec-a-sweep.js (new; substrate policies
  reused verbatim, never edited).
- Analyzer: scripts/test-shoutrec-a.js (fixtures + recompute +
  price + judge + neutrality compare; exits 0 on DIAG-GO).
- Prereg: evidence/2026-10-29/sim-shoutrec-a-prereg.md (05f1ac59f).
- This evidence: evidence/2026-10-29/sim-shoutrec-a.md.
