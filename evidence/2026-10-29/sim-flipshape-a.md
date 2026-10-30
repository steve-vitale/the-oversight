# sim-flipshape-a — PRICING THE SURVIVAL GAP BY MECHANISM CLASS (DIAG-NO-GO on coverage; no class bridges the pooled gap)

Run: flesh-out loop, run fleshout-20261030T0320Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-flipshape-a.
Tracker direction (from run fleshout-20261030T0215Z, sim-partycounter-a):
party formation closed as NOT BRIDGEABLE — change what a fight is
for, NOT re-count heads, NOT re-narrate endings, NOT lower
win-prices. This arm prices the survival gap by MECHANISM CLASS
instead of damage.
MEASUREMENT ONLY — zero src/js changes, no game-code lever, no
default flip, no mechanism change proposed or built here. The
ranked next is a proposal for a future arm, not a build.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-29/sim-flipshape-a-prereg.md (commit 1312c178a).
Instruments: scripts/test-flipshape-a-sweep.js +
scripts/test-flipshape-a.js (commit 88b3858d). Analyzer fixtures
18/18, but the analyzer exits 1 on this run — the coverage leg
fails (see below). That exit code is the verdict, not an error to
work around.

## VERDICT: DIAG-NO-GO on the instrument (coverage leg), with a NOT-BRIDGEABLE finding on the question

The instrument prices 8 of 12 addressable-lost fights jointly
(66.7%, bar 80%) — the 4 misses are all one shape, incoming damage
after the shout exactly zero (the ally tanks every post-shout hit
while the leader still flees on trajectory), so the mitigation
class has no denominator for them. Per the binding prereg, that is
a coverage miss, not a rounding choice: the verdict is DIAG-NO-GO,
failing leg coverage, and no re-scoring is done mid-run to rescue
it (the metric-review revision that would fix it is proposed for
the NEXT run, below, with its arithmetic labeled as sensitivity,
never as verdict). Join integrity PASS, sense PASS, determinism
PASS, addressable-lost size 12 (>= 8) PASS — the NO-GO is one leg,
named here, not a general instrument failure.

On the 8 jointly priced fights, the substance readings are all
non-bridgeable at the pooled level: staying-shout (A) median 18.84
rounds → NOT BRIDGEABLE; flee-window (C) median 21.36 rounds →
NOT BRIDGEABLE; mitigation (B) median f 0.85 with exactly 50% of
fights already above the floor (f = 1.0) → NOT THE LEVER by the
pre-registered guard. Ranked next (prereg rule): A > C > B, and
since the top class reads NOT BRIDGEABLE, the pooled answer is:
NO BRIDGEABLE MECHANISM CLASS ON THIS EVIDENCE. The one
bridgeable slice is wave 1 only (median A 0.38 rounds, C 1.46
rounds, 3 of 4 within 2 rounds) — a wave-split flag, not a pooled
proposal. Wave 4 stays a wall (median A 38.54, C 38.32 rounds),
and wave 3's single priced fight prices 35.60 / 37.60 rounds.

## Plain words first

Imagine a losing fight where the fighter has already called for
help. Instead of asking "how much harder would the team have to
hit," this arm asks three different questions: how many more
rounds would the fighter have to stand there, how much softer
would the monster's hits have to be, and how many more rounds
past the moment they actually ran would they have to be allowed
to stay? The answer, for the fights that lost, is mostly: far too
many rounds, and softer hits wouldn't matter anyway. At the
median priced fight, the team would need to survive about 19 more
rounds at the shout, or about 21 more rounds past the moment they
ran, to grind the monster down to its breaking point — and the
priced fights here last 3 rounds. The monster at the median
priced fight still has about 180 hit points left when the
fighter runs; a hold that buys one or two rounds (the size of the
holds already in the game, Rally and War Cry) closes only the
wave-1 slice, not the pooled gap. Softer hits look closer at first — the median fighter
would only need hits at 85% strength — but half the priced fights
didn't need softer hits at all: their health was already above
the running-away line when they ran. They ran because the fight's
trajectory said they were losing, not because their health ran
out. And a third of the fights that should have been priced can't
even be priced for softer hits: after the ally charged in, the
monster hit the ally instead, and the leader took no damage at
all — yet still ran. You cannot mitigate damage that isn't
landing. The exception is the smallest monsters: against wave-1
beasts, the same three questions come back with small answers —
about half a round short at the shout, about one and a half
rounds past the run — so a one-or-two-round hold WOULD flip most
wave-1 lost fights. But wave-1 fights are not the wall. The wall
is wave 3 and wave 4, where a lone fighter meets a fresh monster
with 850–1,000 hit points and deals about 10 a round, and no
plausible hold, shield, or softening turns that into a drive-off.
Those fights are not a mechanism question at all; they are a
meeting question — why is that fighter alone against that monster
in the first place?

## Header (pre-registered) vs result

- DIAG-GO BAR (primary): among ADDRESSABLE-LOST fights, >= 80%
  PRIMARILY PRICED with a finite value for ALL THREE classes
  (A, B, C jointly), with median and fixed-cut shares for all
  three classes, overall and wave-split 1 / 2 / 3 / 4.
  RESULT: 8/12 = 66.7% jointly finite → FAIL. Per-class coverage
  is A 12/12, C 12/12, B 8/12 — the joint miss is entirely the B
  denominator (incomingPost = 0 in 4 fights). The 4 jointly-
  unpriced fights ARE priced for A and C (see their table below)
  and are counted in the denominator, not dropped.
- JOIN INTEGRITY (blocks GO): index-join errors 0 across
  fieldparty / tilejoin / shoutrec rows, joined ally in tileAll
  for every joined fight, no unexplained no-shout joined fights,
  shoutAllyDealt = 0 for every shout-joined fight.
  RESULT: joinErrors 0, allyNotOnTile 0, unexplained no-shout 0,
  shoutAllyDealtNonzero 0 → PASS. All 26 joined fights are
  shout-joined (0 ally-from-start, 0 no-shout in-band).
- SENSE BAR: >= 3 lost / addressable-lost transcripts read end
  to end.
  RESULT: 6 transcripts read (2 U lost from the named joined
  slots, 1 non-U lost from a named joined slot, 3 U lost from
  same-band shouted slots — see sense notes for the exact
  breakdown) → PASS in substance; the slot-type breakdown is
  disclosed rather than smoothed over.
- DETERMINISM GATE: re-run one seed into a scratch EVID dir;
  byte-identical to the corpus row.
  RESULT: seed 75106 re-run byte-identical in full (scratch dir
  removed after the diff) → PASS.
- ADDRESSABLE-LOST SIZE: 12 (>= 8) → not INSUFFICIENT-DATA on
  size. The verdict is read as DIAG-NO-GO on coverage, not
  withheld for size.
- BRIDGEABILITY READINGS (pre-registered lines; do not move the
  DIAG-GO bar): A median 18.84 → NOT BRIDGEABLE (> 4); C median
  21.36 → NOT BRIDGEABLE (> 4); B median 0.85 with f = 1.0 share
  50.0% (>= 50% guard) → NOT THE LEVER. A and C agree (no MIXED
  for the staying family). Wave readings: wave 1 A BRIDGEABLE
  (0.38) / C BRIDGEABLE (1.46) / B NOT THE LEVER (100% at 1.0),
  n = 4; wave 2 n = 0 priced; wave 3 A NOT BRIDGEABLE (35.60) /
  C NOT BRIDGEABLE (37.60) / B PARTIAL (0.55), n = 1 flag only;
  wave 4 A NOT BRIDGEABLE (38.54) / C NOT BRIDGEABLE (38.32) /
  B PARTIAL (0.58), n = 3.
- DIAG-GO overall: coverage FAIL, integrity PASS, sense PASS,
  determinism PASS → DIAG-NO-GO, failing leg coverage, with a
  NOT-BRIDGEABLE finding on the pooled question and a
  bridgeable wave-1 slice flagged.

## Headline: mechanism-class prices (8 jointly priced fights)

Definitions (prereg, fixed before judging): S = shout round;
R = rounds; HPs = monster lead HP at the shout; Mmax = lead max
HP; mBreak = 0.25 (wave 1) or 0.15 (wave 2+); vHps = leader HP at
the shout; rtdS = leader rounds-to-drop at the shout (engine's
own); postDPR = (final mDealt - shoutMdealt) / (R - S), the
post-shout TEAM rate (leader + ally, since the engine adds ally
strikes to mDealt); incomingPost = final vTaken - shoutVtaken
(leader damage taken after the shout; ally damage taken is
separate and never counted); needS = HPs - mBreak * Mmax;
needEnd = final mHpLeft - mBreak * Mmax. (A) = needS / postDPR -
rtdS (signed rounds); (B) = min(1.0, (vHps - floorHP) /
incomingPost), floorHP = shoutFleeAt * shoutVhpMax for vFlee, 0
for vDie; (C) = needEnd / postDPR (signed rounds). All prices are
sufficient, not necessary, exactly as shoutrec's are: they hold
damage output fixed at its observed rate and ignore everything
a real hold mechanism might also change (monster targeting,
stuns, trick progress), so the true flip cost could differ —
but the orders of magnitude here leave no room for that caveat
to rescue the pooled reading.

- CLASS A staying-shout: median 18.84 rounds. Shares <= 0: 12.5%
  (1/8); <= 2: 37.5% (3/8); <= 4: 37.5% (3/8). The three fights
  within 2 rounds are all wave 1; every wave-3/4 priced fight is
  at 27.63 rounds or more.
- CLASS B mitigation: median f 0.85. Share f = 1.0 (already above
  the floor — the loss was trajectory, not HP): 50.0% (4/8).
  Shares f >= 0.75: 50.0%; f >= 0.50: 100.0%; f < 0.50: 0.0%.
  Among the 4 HP-bound fights only (f < 1.0: 0.55, 0.56, 0.58,
  0.70), the median f is 0.57 — PARTIAL by the lines, but those
  4 fights price A at 27.63–119.03 rounds and C at 28.31–119.67
  rounds, so surviving the HP window would not flip them: the
  staying gap behind the window is still tens of rounds. B is
  necessary-for-window, never sufficient-for-flip, and the
  evidence must not be read as "85% damage would flip the
  median fight" — it would keep the median fighter above the
  floor through the observed window and still leave them facing
  a hopeless trajectory the next round.
- CLASS C flee-window: median 21.36 rounds. Shares <= 0: 0.0%
  (0/8 — no priced fight was already below the break line at its
  ending; the floor-pre-empted-break shape does not occur among
  priced fights); <= 2: 37.5% (3/8); <= 4: 37.5% (3/8). Again the
  three within-2 fights are all wave 1.
- SECONDARY kill variants (report-only): Akill median 24.55
  rounds, Ckill median 27.07 rounds — killing the lead costs
  roughly 6 more rounds than breaking it at the median, the same
  ordering as partycounter's kill-vs-survival damage prices.
- BEFORE single-ally prices on the same 8 fights (paired,
  shoutrec formulas verbatim): kKill median 11.29x, kSurv median
  8.56x. These are WORSE than partycounter's all-addressable
  medians (6.49x / 4.28x on its band) for an expected reason:
  this population is lost fights only — the 5 drive-offs and 1
  kill that carried the small prices are excluded by definition.
  Do not compare the two as drift; they are different
  populations on the same band.

### Prices by wave (pooled medians hide the gradient — always split)

- Wave 1 (priced n = 4): median A 0.38, B 1.00 (f = 1.0 in 4/4),
  C 1.46. Readings A BRIDGEABLE, C BRIDGEABLE, B NOT THE LEVER.
  A <= 2 in 3/4, C <= 2 in 3/4. The one wave-1 fight outside 2
  rounds is valeria d79 (A 10.06, C 14.42): a gallowdeer at 130
  HP at the shout with a post-shout team rate of only 6/round —
  a slow grind, not a hold, is what that fight lacks.
- Wave 2 (priced n = 0): no addressable-lost wave-2 fight exists
  on this band; the only wave-2 shout-joined lost fight is the
  landlord floor fight (separate line below).
- Wave 3 (priced n = 1, flag only): ad_break d58, A 35.60,
  B 0.55, C 37.60. Readings A NOT BRIDGEABLE, C NOT BRIDGEABLE,
  B PARTIAL. One fight proves nothing alone, but it sits with
  the wave-4 wall, not with wave 1.
- Wave 4 (priced n = 3): median A 38.54, B 0.58 (f = 1.0 in 0/3),
  C 38.32. Readings A NOT BRIDGEABLE, C NOT BRIDGEABLE,
  B PARTIAL. The eulogy fight (A 119.03, C 119.67) is the
  extreme: a monster at 859 HP at the shout, a team dealing
  6/round after it — 119 rounds is not a hold, it is a different
  fight. The algorithm fight (A 27.63, C 28.31) is the "best"
  wave-4 case and still needs 28 rounds past the run.

### Branch split (where mechanism pricing stops and timing starts)

- U fights overall (214): mFlee 92, vKill 44, vFlee 68, vDie 10.
  U lost = 78: shout-joined 20, no-shout-joined 0, unjoined 58.
  Shout-joined lost (20) is only 25.6% of all lost fights — the
  mechanism prices below cover a quarter of losses. The other
  58 unjoined lost fights carry no shout snapshot and no
  post-shout window and are NOT priced here; any future arm
  that claims a pooled mechanism verdict must say whether it
  covers them too, because this arm's verdict does not.
- Joined fights overall (26, all shout-joined): mFlee 5, vFlee
  18, vDie 2, vKill 1. Split: priced addressable-lost 8 (vFlee
  7, vDie 1), floor-branch 7 (all vFlee), active-zero-dealt 1
  (vDie), jointly-unpriced addressable-lost 4 (all vFlee),
  not-lost 6 (mFlee 5, vKill 1). 8 + 7 + 1 + 4 + 6 = 26.
- ZERO-WINDOW (floor) line, reported separately, NOT folded into
  any median: 7/20 = 35.0% of shout-joined lost fights (26.9%
  of all joined fights, as in partycounter). Every floor fight
  has allyActiveRounds = 0; the shout fires and the flee floor
  fires in the same morale pass, before any post-shout round.
  No mechanism class fixes this branch by construction — there
  is no window to extend or mitigate. This remains the separate
  Steve-call question (suppress the futile shout, grant the
  ally one strike, or leave the honest tragedy, now with an
  honest line since joinendlines).
- ACTIVE-ZERO-DEALT line, reported separately, NOT folded into
  any median: 1/20 shout-joined lost fights (5.0%), the same
  fight as partycounter's: s75104 d57, chantal_mukendi vs
  buffering (w3), died in round 3 before the joined ally
  (chloe_dubois) could strike — allyDealt 0, postDPR 0.00,
  incomingPost 59. A death-before-ally-strike shape, not a
  staying or mitigation shape.
- JOINTLY-UNPRICED line (in the denominator, not in the
  medians): 4/12 addressable-lost fights, ALL with incomingPost
  = 0 and all vFlee. The leader took no damage after the shout
  — the monster's post-shout hits went to the ally — yet the
  leader fled on hopeless trajectory anyway. Their A/C prices
  (staying gaps 2.83–12.52 / 4.61–15.38 rounds) are reported in
  the table below so the information is not hidden by the joint
  bar. This is the arm's genuinely new shape: ALLY-TANKING
  FLIGHT. For a third of addressable-lost fights, leader HP is
  not falling at all in the window that ends the fight, so no
  mitigation number exists to price — and the flight is a morale
  judgment about a trajectory the leader is no longer even
  bleeding for. A mitigation mechanism aimed at the leader's HP
  cannot touch these fights even in principle.

## Per-fight price table (addressable-lost, jointly priced)

S = shout round; R = rounds; HPs/vHps = HP at shout; Mmax = lead
max HP; mHpLeft = lead HP at fight end; rtdS = leader window at
shout; postDPR = post-shout team rate; incPost = leader damage
taken after the shout; needS/needEnd = break damage still needed
at shout / at end; A/B/C = mechanism prices (B raw in
parentheses where capped); Akill/Ckill = kill variants
(report-only); kKill/kSurv = single-ally damage prices on the
same fight (paired before leg).

| Seed | Day | Fighter vs monster (wave) | R | Outcome | Subtype | S | HPs | vHps | Mmax | mHpLeft | rtdS | postDPR | incPost | needS | needEnd | A | B | C | Akill | Ckill | kKill | kSurv |
|-----:|----:|---------------------------|---:|---------|---------|---:|----:|-----:|-----:|--------:|-----:|--------:|--------:|------:|--------:|------:|------:|------:|------:|------:|------:|------:|
| 75102 | 56 | daniyar_askarov vs eulogy (w4) | 3 | vFlee | hopeless | 2 | 859 | 45 | 900 | 853 | 1.64 | 6.00 | 33 | 724 | 718 | 119.03 | 0.58 | 119.67 | 141.53 | 142.17 | 87.49 | 73.74 |
| 75102 | 65 | daniyar_askarov vs algorithm (w4) | 3 | vFlee | floor-plausible | 2 | 1000 | 53 | 1000 | 971 | 1.68 | 29.00 | 33 | 850 | 821 | 27.63 | 0.70 | 28.31 | 32.80 | 33.48 | 118.87 | 101.04 |
| 75102 | 74 | mateo_alvarez vs audit (w4) | 3 | vDie | death | 2 | 1030 | 23 | 1100 | 1008 | 0.78 | 22.00 | 41 | 865 | 843 | 38.54 | 0.56 | 38.32 | 46.04 | 45.82 | 330.27 | 277.36 |
| 75103 | 17 | greta_hansen vs hushwolf (w1) | 3 | vFlee | hopeless | 2 | 36 | 47 | 50 | 24 | 1.84 | 12.00 | 4 | 24 | 12 | 0.12 | 1.00 (6.75) | 0.96 | 1.16 | 2.00 | 6.51 | 4.25 |
| 75104 | 58 | david_kim vs ad_break (w3) | 3 | vFlee | hopeless | 2 | 241 | 51 | 320 | 236 | 3.00 | 5.00 | 20 | 193 | 188 | 35.60 | 0.55 | 37.60 | 45.20 | 47.20 | 16.07 | 12.87 |
| 75106 | 39 | valeria_quispe vs gallowdeer (w1) | 3 | vFlee | hopeless | 2 | 85 | 57 | 150 | 69 | 2.33 | 16.00 | 13 | 48 | 32 | 0.64 | 1.00 (2.38) | 1.97 | 2.99 | 4.31 | 6.09 | 3.40 |
| 75106 | 52 | chantal_mukendi vs hushwolf (w1) | 3 | vFlee | hopeless | 2 | 36 | 60 | 50 | 20 | 2.00 | 16.00 | 22 | 24 | 8 | -0.53 | 1.00 (1.36) | 0.47 | 0.25 | 1.25 | 3.00 | 1.96 |
| 75106 | 79 | valeria_quispe vs gallowdeer (w1) | 3 | vFlee | hopeless | 2 | 130 | 67 | 150 | 124 | 5.36 | 6.00 | 19 | 93 | 87 | 10.06 | 1.00 (1.97) | 14.42 | 16.31 | 20.67 | 4.04 | 2.88 |

Reading notes on the table (do not misread these rows):
- The chantal hushwolf row (A -0.53, C 0.47) is the only priced
  fight whose shout-time window already sufficed: at the shout
  the team needed fewer rounds than the leader's window, and at
  the ending the monster needed only 8 more damage (0.47 rounds
  at 16/round) to break. It still fled — on hopeless trajectory,
  with the leader at 60 HP at the shout and above the floor at
  the end (B = 1.0). Half a round of staying would have driven
  this one off; the engine's hopeless judgment fired first.
  This is the wave-1 bridgeable shape in its purest form.
- The four B = 1.0 rows are all wave-1 hopeless flees: in every
  one, the leader's HP at the end was already at/above the floor
  (raw B 1.36–6.75, capped to 1.0), so mitigation is definitionally
  not the lever there. The four HP-bound rows (B 0.55–0.70) are
  all wave 3/4, and all four also need 27+ staying rounds — the
  classes do not trade off against each other here; the HP-bound
  fights are also the staying-bound fights.
- The audit death (mateo, w4) is the only priced vDie: leader at
  23 HP at the shout, window 0.78 rounds, monster at 1030/1100.
  Mitigation f 0.56 would have kept the leader alive through the
  observed window — and still left 843 break damage (38.32
  rounds) standing. Surviving the window is not winning the
  fight, and this row is the proof in one line.
- The algorithm row is the only priced fight whose subtype is
  floor-plausible rather than hopeless: it ended by the floor
  (final HP frac below the shout floor), not by the hopeless
  branch — the one priced fight where B's floor logic is the
  actual ending mechanism, and its B (0.70) is still only a
  window price, not a flip price.

### Jointly-unpriced addressable-lost fights (A/C priced, B has no denominator — in the denominator, never in the medians)

| Seed | Day | Fighter vs monster (wave) | R | Outcome | S | postDPR | incPost | A | C |
|-----:|----:|---------------------------|---:|---------|---:|--------:|--------:|------:|------:|
| 75102 | 57 | daniyar_askarov vs chorus_line (w3) | 5 | vFlee | 4 | 12.00 | 0 | 2.83 | 12.50 |
| 75104 | 60 | gen_p2ufvsv vs terms_of_service (w3) | 3 | vFlee | 2 | 17.00 | 0 | 12.52 | 14.65 |
| 75106 | 79 | valeria_quispe vs gallowdeer (w1) | 3 | vFlee | 2 | 14.00 | 0 | 3.42 | 4.61 |
| 75106 | 114 | gen_iw4ffac vs terms_of_service (w3) | 3 | vFlee | 2 | 16.00 | 0 | 6.25 | 15.38 |

Note the divergence inside this small set: the valeria gallowdeer
fight (A 3.42, C 4.61) is near the bridgeable cuts, while the two
terms_of_service fights need 12–15 window rounds. Ally-tanking
flight is not one shape with one price — but in all four, the
leader's HP was not the thing ending the fight.

### Floor-branch lost fights (separate, never folded)

| Seed | Day | Fighter vs monster (wave) | R | Outcome | N | S |
|-----:|----:|---------------------------|---:|---------|---:|---:|
| 75102 | 38 | gen_0x2wi4u vs landlord (w2) | 3 | vFlee | 1 | 3 |
| 75102 | 58 | daniyar_askarov vs chorus_line (w3) | 8 | vFlee | 4 | 8 |
| 75102 | 77 | app_mgpspiho509 vs callback (w3) | 3 | vFlee | 1 | 3 |
| 75104 | 58 | david_kim vs ad_break (w3) | 2 | vFlee | 1 | 2 |
| 75104 | 61 | gen_p2ufvsv vs terms_of_service (w3) | 2 | vFlee | 1 | 2 |
| 75104 | 80 | chloe_dubois vs spool (w3) | 8 | vFlee | 1 | 8 |
| 75106 | 103 | chantal_mukendi vs callback (w3) | 4 | vFlee | 1 | 4 |

These are the same 7 fights as partycounter's floor line (same
seeds, days, fighters, monsters) — a reproducibility check in
itself. Note the daniyar chorus_line floor fight (d58, N = 4)
and the daniyar chorus_line ally-tanking flight (d57, above)
are consecutive fights against the same monster type on
consecutive days: one ends the instant the ally arrives, the
other ends with the leader taking no damage at all. Timing, not
damage, is the through-line of both.

### Active-zero-dealt lost fight (separate, never folded)

s75104 d57, chantal_mukendi vs buffering (w3), 3 rounds, vDie,
N = 2, S = 2, active = 1, postDPR = 0.00, incomingPost = 59.
Death before the ally's first strike (see sense S6).

## Sense-testing law (6 transcripts read end to end)

S1 — s75103 d17, ADDRESSABLE-LOST, PRICED (Greta vs hushwolf,
3 rounds, vFlee, A 0.12 / B 1.00 / C 0.96, U: field/resolve).
Greta trades two rounds, shouts, Dale charges in — and the
monster immediately switches to Dale (15, then 12 damage to him)
while Greta takes only 4 more and strikes twice. Greta still
flees on the hopeless line. This is the ally-tanking shape in
transcript form and the B = 1.0 shape in transcript form at
once: the leader's HP stopped falling the moment help arrived,
and she ran anyway because the trajectory (monster at 24 HP,
only 12 damage above its break threshold) still read as losing
to the engine's hopeless check. The
numbers say about one more round would have broken it (the
monster sat 12 damage above its 12.5-HP break threshold at the
ending, at a 12/round post-shout team rate); the transcript
says the fighter could not see that. Reads as a
person making a judgment call under pressure — and as an
engine whose hopeless threshold fires a round early on exactly
the fights a hold would flip. The snapshot fields hand-verify
against the log (shout HP 36 monster / 47 leader, Dale's
strike for 3, final monster HP 24).

S2 — s75102 d38, FLOOR (Paola vs landlord, 3 rounds, vFlee,
U: field/resolve). Paola strikes three times (23/21/22), takes
22/21/22, shouts at 18 HP — "Olivia charges in!" — and the
joinendlines floor line fires immediately. The ally never
strikes. Unlike shoutrec's old floor blank, the ending now HAS
a line, and it reads as tragedy rather than silence: help
arrived one beat too late. This is the timing branch in its
cleanest form, and no staying/mitigation price applies to it —
there is no post-shout window to price.

S3 — s75101 d8, FLOOR, NON-U (Jorge vs gallowdeer, 2 rounds,
vFlee, from the shoutrec sense slot; fieldparty row: channel
other, caller other, outcome evade, rounds 0 — an expedition
fight, not a U fight, disclosed here rather than counted as a
U transcript). Jorge walks straight into Highbeam Deer with a
bow and no arrows, takes 12 then 26, shouts, Emma charges in,
floor line fires. Same shape as S2, one round faster. It is
counted toward the sense bar as a lost-fight transcript from
this band's named sense slot, but NOT as U evidence — the U
sense count below excludes it.

S4 — s75106 d39, ADDRESSABLE-LOST, PRICED (Valeria vs
gallowdeer, 3 rounds, vFlee, A 0.64 / B 1.00 / C 1.97, from the
tilejoin shouted slot, U by the priced table). Valeria binds
her own wound mid-fight (+20 HP, field medicine), shouts,
Mateo joins for 6, and she still flees on the hopeless line
with the monster at 69 HP. A second mate (jorge_silva) is fed
on the tile and never appears in a line — the party-shape
silence from partycounter S1, recurring. The fight reads as
people (wound-binding, a shout answered, an honest flight) and
its prices say a 2-round hold flips it. The wave-1 bridgeable
slice has a human face here.

S5 — s75102 d56, ADDRESSABLE-LOST, PRICED (Daniyar vs eulogy,
3 rounds, vFlee, A 119.03 / B 0.58 / C 119.67, from the tilejoin
shouted slot, U by the priced table). Daniyar strikes for 10
then 8 against a monster at 867 HP, takes 31 then 24, shouts,
Terrence strikes for 6, Daniyar binds his wound (+20), takes
33, flees. The transcript makes the 119-round price visceral:
after three rounds the monster sits at 853, down just 24 from
its 877 start — and only 6 of that came after the shout.
Nothing about this fight reads as winnable-by-holding —
it reads as a person who met something far beyond him, called
for help, got one strike of it, and correctly ran. The sense
judgment agrees with the price: this is a meeting-shape fight,
not a mechanism-shape fight.

S6 — s75104 d57, ACTIVE-ZERO-DEALT (Chantal vs buffering,
3 rounds, vDie, from the tilejoin shouted slot, U by the AZ
line). Chantal's round-2 strike misses the mirage frame (0
damage, "bright frame — mirage miss"), she shouts, Chloe
charges in, and round 3 kills Chantal (59 damage, 0 left)
before any Chloe strike line appears. The death-before-ally-
strike shape reads exactly as its name: help arrived, the
fighter died in the same breath. No mechanism class prices it,
and no transcript claim beyond the log is made on it.

Sense judgment overall: every ending reads as a person, not a
number — the hopeless flights (S1, S4, S5) all land on the same
honest line, the floor flights (S2, S3) now carry their
joinendlines line, and the death (S6) is abrupt in the way a
death should be. The recurring fiction gap is the same one
partycounter named: second tile mates who never appear (S4's
jorge_silva), and allies who absorb the fight while the leader
flees on trajectory (S1). The sense bar counts: 6 transcripts
read, 5 U lost (S1, S2, S4, S5, S6) + 1 non-U lost (S3). The
named-slot transcripts alone (tilejoin sense.joined +
shoutrec sense.joined) give 2 U lost (S1, S2) + 1 non-U lost
(S3); the remaining 3 U lost transcripts come from tilejoin
sense.shouted slots on the same band, disclosed as such —
they are the same band's sense slots, not another band's, and
without them the U-lost sense count would be 2, not 3.

## Band wall numbers (report-only, diverging prototype)

This band (8 seeds, tableseat-nowait, 180d death-aware): won 6
(full seat 0), nationalEver 6, nationalFinal 6, table 7, entered
6, wave4 5, wave5 0, median survival 114d (upper-middle row;
days 115/86/90/101/165/115/114/31), deaths 232, starvation deaths
2. Never a verdict leg here (diverging prototype per the
tilejoin metric review).

## Drift diagnostic (reference only, never a verdict leg)

ZERO drift against partycounter's published band on every
checkable number: joined 26 with outcomes mFlee 5 / vFlee 18 /
vDie 2 / vKill 1, ally dealt 136 / taken 215, meetings 975,
wall won 6 / deaths 232 / median 114d, and the same 7 floor
fights and the same active-zero-dealt fight. The substrate has
not moved since partycounter (this arm's commits are prereg,
instruments, and evidence only — no game code), so cross-band
equality was expected here, unlike the shoutrec→joinendlines
drift. Per the prereg and backlog #1457, no shoutrec number is
quoted as current anywhere in this file; the verdict judges
this band's own mechanism prices only. The before-leg medians
above (kKill 11.29x / kSurv 8.56x) are this band's lost-only
subset, not a drift claim against partycounter's all-addressable
6.49x / 4.28x.

## Ranked next steps (with numbers — no behavior built here)

Ranked by the prereg rule (reading first, then smaller median
gap, then larger bridgeable-cut share): (A) staying-shout NOT
BRIDGEABLE (median 18.84) > (C) flee-window NOT BRIDGEABLE
(median 21.36) > (B) mitigation NOT THE LEVER (median 0.85,
50% at f = 1.0). The top class reads NOT BRIDGEABLE, so:

1. DO NOT BUILD A STAYING / HOLD MECHANISM TO CLOSE THE POOLED
   GAP. A hold that buys 1–2 rounds (the size of Rally / War
   Cry) flips 3 of 8 priced lost fights — all wave 1 — and
   touches none of the priced wave-3/4 fights (27+ rounds at
   best). A
   hold that buys 20+ rounds is not a hold, it is a different
   fight. The pooled staying gap (18.84 / 21.36 rounds) is an
   order of magnitude beyond any hold-shaped mechanism.
2. DO NOT BUILD A MITIGATION MECHANISM TO CLOSE THE POOLED GAP.
   Half the priced fights were already above the floor when
   they ran, and a third of addressable-lost fights took no
   leader damage at all after the shout. Mitigation aimed at
   the leader's HP cannot touch 8 of 12 addressable-lost fights
   even in principle (4 at f = 1.0 + 4 with no denominator).
   Among the 4 genuinely HP-bound fights, mitigation is only
   PARTIAL (median f 0.57) and still leaves 27+ staying rounds
   behind it.
3. THE WAVE-1 SLICE IS THE ONLY BRIDGEABLE MECHANISM FINDING,
   AND IT IS SMALL. Wave-1 lost fights price A 0.38 / C 1.46
   rounds at the median, 3 of 4 within 2 rounds on both classes.
   If a future arm wants a mechanism win, it is here: a 1–2
   round hold (or a hopeless-threshold nudge — S1's engine
   fired hopeless one round before the break) flips most
   wave-1 lost fights. But wave-1 lost fights are not the
   scale wall, and this slice must not be sold as closing it.
4. THE FLOOR BRANCH (7/20 shout-joined lost, 35.0%) AND THE
   ALLY-TANKING SHAPE (4/12 addressable-lost) ARE STILL THE
   SEPARATE STEVE-CALL QUESTIONS. Options for the floor remain
   shoutrec's three (ally gets one strike, suppress the futile
   shout, leave the honest tragedy). The ally-tanking shape
   raises a new design question, not answered here: when the
   monster switches to the ally and the leader stops bleeding,
   should the leader's hopeless judgment still fire on the
   old trajectory — or does "my ally is holding it" change
   what the fighter sees? That is a Steve-call about morale
   perception, not a measurement to run silently.
5. THE NEXT ARM ON THIS AXIS MUST CHANGE WHAT A MEETING IS,
   NOT WHAT A FIGHT IS. The remaining gaps after this arm are:
   a 38-round wave-4 staying wall, a 35% timing branch no
   mechanism touches, and a meeting shape in which lone
   fighters meet fresh wave-4 monsters at full HP (eulogy
   859/900, algorithm 1000/1000 at the shout). Candidate
   directions, in order of this evidence: (a) wave-4 meeting
   shape — who meets wave-4 monsters, alone or warned, and
   whether the village's readiness bars should gate the
   meeting rather than the wave; (b) the hopeless threshold
   itself as a perception question (S1: the engine called a
   fight hopeless half a round before the break); (c) the
   ally-tanking morale question in (4). None of these is a
   damage number, a head count, or a win-price — which is the
   tracker's direction, honored here by elimination.

## Metric review (for the NEXT run — nothing re-scored here)

- MITIGATION DENOMINATOR, PROPOSED REVISION. The joint-coverage
  miss is entirely incomingPost = 0. Conceptually, a leader who
  takes no damage after the shout HAS survived the HP window —
  their HP at the end equals their HP at the shout, above the
  floor by the same argument that makes f = 1.0 meaningful.
  Proposed revision: price B = 1.0 (with a flag
  "incoming-post-zero: window already survived") when
  incomingPost = 0, instead of leaving B unpriced. Sensitivity
  (labeled as such, NOT the verdict): under that revision,
  joint coverage would be 12/12, the pooled B median would be
  1.00 with an f = 1.0 share of 8/12 = 66.7% — the B reading
  would remain NOT THE LEVER, more strongly — and the A/C
  medians over the full 12 would be A 8.16 / C 14.54 rounds
  (the four added A values are 2.83–12.52 and C values
  4.61–15.38), still above the 4-round PARTIAL line. The revision
  would move the verdict from DIAG-NO-GO to DIAG-GO on the
  instrument WITHOUT moving any substance reading — which is
  exactly why it belongs in metric review for the next run
  rather than as a mid-run rescue of this one.
- JOINT vs PER-CLASS COVERAGE, PROPOSED REVISION. A joint bar
  conflates "the instrument cannot price this fight" with
  "this mechanism class does not apply to this fight." The
  incoming-zero fights are the second kind — a finding, not a
  missing value. Proposed revision: report coverage per class
  (here A 12/12, C 12/12, B 8/12 + 4 class-NA) and let the DIAG
  bar judge per-class coverage, with class-NA fights counted
  in a stated NA line rather than failing the joint bar.
- SUBTYPE CLASSIFIER, LIMITATION CARRIED. The vFlee subtype
  split (floor-plausible vs hopeless) compares final HP frac
  against the SHOUT-time flee floor; War Cry's post-shout
  fleeAt lowering (-0.15) can misclassify a true floor flee as
  hopeless. Only 1 of 8 priced fights classifies as
  floor-plausible, so the split is descriptive only and no
  verdict leg touches it. A future arm with ability-state
  recording could harden it; this arm does not need it to.
- ANALYZER COSMETIC (not a number change). The analyzer's
  "not addressable-lost" list prints N = undefined for
  non-lost joined fights, because N is assigned only in the
  lost-pricing block. Priced, floor, and active-zero rows all
  carry N correctly; the evidence tables above omit N for
  non-lost rows rather than quoting the undefined value. Fix
  in the next analyzer revision, not silently patched here.
- POOLED MEDIAN HIDES THE WAVE GRADIENT (carried, now with
  mechanism numbers): the pooled A/C medians (18.84 / 21.36)
  mix 4 wave-1 fights (medians under 1.5 rounds) with 4
  wave-3/4 fights (medians near 38 rounds). Any future
  mechanism arm must report the wave split first; a pooled
  mechanism median alone hides whether the class bridges
  anything at all.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no
wall number — by design (measurement only) — but it closes the
question the tracker set for it, subject to the coverage
caveat: NO mechanism class in the staying / mitigation /
flee-window family bridges the pooled survival gap. Staying
needs ~19–21 rounds at the median, mitigation is not the lever
for two-thirds of addressable-lost fights, and 35% of
shout-joined lost fights sit in a timing branch no mechanism
touches. The wave-1 slice (1–2 rounds) is real but small, and
the wave-4 wall (38 rounds) is a meeting question, not a fight
question. The next arm that claims movement on this axis must
either adopt the metric-review revision and re-run this
pricing cleanly, or move to meeting shape / hopeless perception
/ ally-tanking morale — not re-price damage, heads, or endings.

## Village assessment (plain words)

The village this band played is the same village the
joinendlines and partycounter bands played — competent,
reaching national in 6 of 8 seeds, sitting the table in 7,
winning 6 (all lesser seats, full seat 0, wave 5 0), median
survival 114 days. Nothing about that picture moved, because
nothing about the game moved: this run changed no code at all.
What the village looked like, fight by fight, is this: its
fighters meet monsters, call for help when they are losing,
get one ally who sometimes tanks the whole rest of the fight
while they run anyway, and die or flee in 3 rounds against
anything wave 3 or bigger that they meet fresh. Against the
small beasts of week one, they are a round or two from winning
most of the fights they lose — close enough that a steadier
nerve would flip them. Against the mirror beasts of standing
100+, they are not close at all: they are a hundred rounds
from breaking something they deal 6 damage a round to. The
blank this arm filled was a priced, ranked next — not a fix:
no hold, no shield, no softening closes the pooled gap, and
the honest next questions are about meetings and morale, not
about fight mechanics.

## Infrastructure notes

- Sweep interruption, recovered cleanly: the first 8-seed sweep
  run died mid-seed-75108 (its background session vanished and
  its /tmp log with it — the sibling /tmp-cleanup wipe class;
  sweep outputs live in evidence/, never /tmp, so seeds 1–7
  were already safe on disk). Seed 75108 was re-run with
  `--one 75108` and the summary rebuilt; corpusOk true
  (8/8 rows, all recorder errs 0). The re-run is the same seed
  through the deterministic engine, not a different band — and
  the finished band reproduces partycounter's band exactly
  (see drift diagnostic), which corroborates seeds 1–7 as well
  as the re-run seed.
- Safe-commit index clobber hit the prereg commit (1312c178a)
  and the instruments commit (88b3858d) — repaired via
  HEAD-blob cacheinfo each time with hash verification
  (worktree hash = HEAD blob), never reset, never forced,
  commits verified correct, status empty after repair. The
  final commit below was checked the same way after landing.
- Analyzer exits 1 on this run (MACHINE-LEGS-FAIL: coverage
  8/12, join integrity clean, 12 sense slots available) — the
  exit code is the DIAG-NO-GO verdict, not a crash: fixtures
  18/18, corpus 8/8 valid with all recorder errs 0,
  determinism byte-identical.
- check.js --quick was NOT run: this arm adds no game code and
  modifies no existing file (only new scripts + evidence), and
  the directly relevant proofs are complete instead (node
  --check on both new scripts, 18/18 analyzer fixtures, 8/8
  corpus rows valid with all recorder errs 0, determinism
  byte-identical). Not claimed as green; recorded as not run,
  with the reason.
- No live verification, no push, no bump: this arm reports
  "committed in worktree, pending coordinator merge" per
  assignment. The batch ship job owns pushes.

## Files

- Corpus (fresh band, ON leg): evidence/2026-10-29/
  perseed-flipshape-a/on/s75101–s75108-fresh.json + summary.json.
- Sweep: scripts/test-flipshape-a-sweep.js (partycounter
  substrate verbatim, output dir changed only).
- Analyzer: scripts/test-flipshape-a.js (fixtures + join +
  mechanism-class pricing + judge; exits 1 on DIAG-NO-GO legs).
- Prereg: evidence/2026-10-29/sim-flipshape-a-prereg.md
  (1312c178a).
- This evidence: evidence/2026-10-29/sim-flipshape-a.md.
