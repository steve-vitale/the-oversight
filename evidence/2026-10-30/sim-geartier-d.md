# sim-geartier-d — War Pavise re-test: NO-GO on D3 + D4, mechanism HELD (not killed, not landed)

## Verdict, in plain words

This run re-tested the War Pavise where parties actually fight, on 16
fresh seeds with the primary the last pilot asked for. The new primary
PASSES: party fights with the shield end in a kill or a drive-off
40 times out of 44 (91%), against 27 out of 35 (77%) without it, and
the shield plants in 39 of the 44 shield-band party fights (89%).
The shield also cuts the damage a party takes to under a third
(9.1 a fight vs 28.7).

But GO needs every leg, and two secondary legs fail — so the verdict
is NO-GO and the shield stays HELD on its branch: not landed, not
killed. The two failures are narrow and both concern how the legs
were drawn, not a broken lever (see root cause below):

- Ever-winning rate 75% (33/44) beats the no-shield 60% (21/35) but
  misses the frozen absolute floor of 80% — by two fights.
- Deaths in party fights: 1 with the shield vs 0 without. The single
  death is a planted fight against a wave-4 eater where the shield
  absorbed its full 90 points and the beast still killed — the
  shield worked, the fight was still lost. With the no-shield band
  at zero deaths, this leg allows zero tolerance: any single death
  fails it.

No game code lands on this verdict. The mechanism commit on this
branch (ef8890fc1, ported byte-identical from build-geartier
f205fc2b5) exists ONLY as the tested artifact and held backup, in
the gaps2-pavise pattern. Do NOT merge it to master on this NO-GO.
The landing deliverable is evidence only: this note + the corpus.

## Prereg header vs result

Prereg: `evidence/2026-10-30/sim-geartier-d-prereg.md`, commit
1101b69d, frozen BEFORE any judged run (fixture + sweep + analyzer
all after it). Mechanism port commit ef8890fc1 precedes the prereg.
GO = every leg passes. Fresh seeds 75301–75316 (never used in any
pavise run), both bands, same verbatim sweep substrate as
geartier-b/c.

| Leg | Bar (frozen) | Result | Verdict |
|-----|--------------|--------|---------|
| D0 corpus | 16/16 seeds/band, corpusOk, joinMismatch 0, wrapErrs 0, recorder errs 0 | 16/16 both, all zero | PASS |
| D1 PRIMARY | kills+drives RATE in U2, sat >= 0.90 AND sat >= natural | 0.909 (40/44) vs 0.771 (27/35) | PASS |
| D2 applicability | U2 n >= 24/band AND sat planted >= 50% of sat U2 | n 35/44, planted 39/44 (89%) | PASS |
| D3 ever-winning | everWinning RATE in U2, sat >= natural AND sat >= 0.80 | 0.75 (33/44) vs 0.60 (21/35); floor missed | FAIL |
| D4 deaths | deaths in U2, sat <= natural | 1 vs 0 | FAIL |
| D4 starvation | band starvationTotal sat <= natural + 1 | 4 vs 7 | PASS |
| D4b damage taken | vTakenMean in U2, sat <= natural | 9.1 vs 28.7 | PASS |
| D5 fixture guard | pavise cells planted 10/10, everWinning >= 6/10, rounds + damage above matched controls; hungry/lone 0/10 | exactly (see below) | PASS |
| D6 sense | >= 1 verbatim planted transcript, reads as planted/stood-behind/splintered | fixture transcript below | PASS |

Overall: NO-GO (D3 + D4 fail). Geartier-b's and geartier-c's NO-GOs
stand and are NOT re-scored here; this run's verdict is its own.

## Judged universe U2 (party universe, unchanged from geartier-c)

Joined wrapper fights to fieldparty meetings by order index (mid+vid
verified, joinMismatch 0 both bands), fought (rounds >= 1) AND
party-A line present. All waves/channels/callers, leader any (0
scholar leaders occurred). Per-seed U2 counts — natural: 75301:3,
75302:6, 75303:4, 75305:3, 75306:1, 75309:4, 75310:1, 75311:2,
75314:7, 75315:3, 75316:1 (75304, 75307, 75308, 75312, 75313: 0);
sat: 75301:5, 75302:8, 75303:5, 75305:1, 75306:1, 75309:4, 75310:4,
75311:2, 75312:1, 75314:9, 75315:2, 75316:2 (75304, 75307, 75308,
75313: 0).

| Band | U2 n | roundsMed / Mean | mDealtMean / Med | vTakenMean | kills / drives / fled / died | everWinning | planted / held | absorbedMean |
|------|------|------------------|------------------|------------|------------------------------|-------------|----------------|--------------|
| NATURAL | 35 | 2 / 2.83 | 63 / 61 | 28.7 | 15 / 12 / 8 / 0 | 21/35 | 0 / 0 | 0 |
| PAVISE-SAT | 44 | 3 / 3.39 | 82.4 / 68 | 9.1 | 15 / 25 / 3 / 1 | 33/44 | 39/44 | 36.3 |

Planted vs unplanted inside the sat band (descriptive, not a leg):
planted 39 fights — kills 13, drives 23, fled 2, died 1
(kills+drives 36/39 = 92%); unplanted 5 fights — kills 2, drives 2,
fled 1 (4/5 = 80%). The 5 unplanted sat party fights held the pavise
but did not plant (same wrapper-recording gap as geartier-c: the
wrapper records no refusal reason, so hunger vs line vs timing is
unknown, not assumed).

## Why D3 and D4 miss — root cause, not a re-score

1. D3's absolute floor was anchored on small samples. The 0.80 floor
   sits below the geartier-c pilot (93%, n=14) and calibration (89%,
   n=18) — but at n=44 the sat rate is 75%, beating natural by 15
   points (60% -> 75%). The band trajectories also diverge: the sat
   band has more wave-2 party fights (17 vs 8) because shield-band
   villages survive longer on shared seeds (e.g. 75302: sat survived
   180 days, natural lost day 135), so the sat universe contains
   more fights, including harder ones. An absolute floor set off
   n=14–18 does not transfer cleanly to n=44 with a different wave
   mix. The RELATIVE comparison (sat >= natural) passes by 15 points.
2. D4's deaths leg has zero tolerance when natural is 0. Natural U2
   deaths were 0/35 (as in geartier-c: 0/17), so the leg as frozen
   fails on any single shield-band death. The single death (seed
   75303, wave-4 eater, channel/caller other, 3 rounds, planted,
   90 absorbed, vTaken 117, never winning) is a shield that did its
   whole job and still lost to a wave-4 beast — a window, not a
   promise, exactly as the fixture transcript shows. One such death
   in 44 fights is noise-level against a 0 baseline, but the leg as
   written binds: FAIL.
3. The primary itself is a THIN pass and must be reported as such:
   40/44 = 90.9% against a 0.90 floor — one fewer conversion
   (39/44 = 88.6%) would have failed D1 too. The next prereg should
   not treat 0.90 as comfortable.

Under kill discipline this is NOT a kill: the lever is not proven
wrong. It plants at 89% in real party fights, converts 91% of them
to kills/drives, cuts damage taken by 68%, and its one death is a
fully-absorbed wave-4 loss, not a shield failure. What is proven
fragile is two secondary legs' calibration at this sample size
(absolute ever-winning floor; zero-tolerance deaths leg).

## Supporting evidence (reported, not judged)

- RETIRED damage-mean (reported for continuity ONLY — not gated,
  NOT a re-score, does NOT change the verdict): mDealtMean sat 82.4
  vs natural 63 (+31%). The old +25% bar would have passed on these
  seeds. That does not make this a GO: GO needs every leg, and D3 +
  D4 fail regardless of any damage figure.
- HP-matched damage is UNMEASURABLE from this corpus: mHpStart is
  empty for 0/79 U2 fights (the fieldparty recorder never populates
  it for these meetings). The metric-review candidate from the task
  brief therefore cannot be computed here at all — a future run
  needs a recorder change first, or the candidate must be dropped.
- Old universe U on the SAME fresh seeds (sweep --summary,
  validation only): natural 21 fought, sat 40 fought, both 0 kills /
  0 drives, planted 0/40 in sat despite held 40/40 — the old wave-4
  lone-fight universe is still empty of the mechanism, exactly as
  geartier-b/c found. This run does not re-judge old U.
- Natural earn still alive on fresh seeds: 2 clean earners (seed
  75303 via a fight, day 92; seed 75310 carried + equipped).
- Wall totals (guards, not judged): won natural 7 / sat 4 (full 0
  both), wave 4 reached 10 / 12, wave 5: 0 / 0, deaths 487 / 516,
  starvation 7 / 4.
- Fixture guard D5 (detail): control-aid 133.4 / roundsMed 2 and
  control 157.5 / roundsMed 3 reproduce the geartier-b baselines
  EXACTLY; pavise-aid planted 10/10, everWinning 10/10, roundsMed 6,
  mDealtMean 289.3; pavise planted 10/10, everWinning 10/10,
  roundsMed 8, mDealtMean 323.4; hungry 0/10 refused-hungry, lone
  0/10 refused-no-ally. The mechanism survived the port onto the
  current base behavior-identical.
- Run incidents (disclosed, no data lost): the first sweep process
  died at natural seed 75313 of 16 during a runtime restart that
  also wiped /tmp (sweep log lost); all 13 completed per-seed files
  verified valid JSON with matching fight/meeting counts and zero
  errors, and the remaining 3 natural + 16 pavise runs were resumed
  via --one with no /tmp dependency. Both band --summary exits
  were RC=0.

## Sense transcript (judged fixture, pavise-aid, influencer 850 — verbatim)

5 rounds, 244 dealt, 90 absorbed, shield splintered, party flees
with the shield spent. It reads as a thing planted, stood behind,
and splintered — the party still flees an 850-HP beast, honestly,
because the pavise opens a window, it does not promise a kill.
(Identical cell to geartier-c, reproduced exactly.)

```
the person in their 40s, with grey-streaked hair sees the someone the light loves coming and nocks an arrow — the fight opens at range (2 shots).
  loosed wide — the arrow buries itself in the dirt. (spent)
  loosed wide — the arrow buries itself in the dirt. (spent)
the person in their 40s, with grey-streaked hair lowers the bow — the someone the light loves is on them now. (0/2 hit)
the person in their 50s, with freckles is already at the door — charges in with the person in their 40s, with grey-streaked hair!
the person in their 40s, with grey-streaked hair plants the war pavise with the person in their 50s, with freckles — the line holds behind it. (War Pavise)
the person in their 40s, with grey-streaked hair's gear absorbs 27.
R1: Ratio lands on the war pavise (77 left).
R1: the person in their 40s, with grey-streaked hair strikes for 45 (x1.3) (805 left)
R1: the person in their 50s, with freckles strikes for 4 (801 left)
R2: the person in their 40s, with grey-streaked hair strikes for 45 (x1.3) (756 left)
R2: the person in their 50s, with freckles strikes for 5 (751 left)
R2: Ratio lands on the war pavise (20 left).
R3: the person in their 40s, with grey-streaked hair strikes for 45 (x1.3) (706 left)
R3: the person in their 50s, with freckles strikes for 3 (703 left)
R3: the war pavise splinters, taking 20 — 28 still gets through.
R3: Ratio hits the person in their 50s, with freckles for 28 (72 left)
R4: the person in their 40s, with grey-streaked hair strikes for 43 (x1.3) (660 left)
R4: the person in their 50s, with freckles strikes for 3 (657 left)
the person in their 40s, with grey-streaked hair's gear absorbs 39.
R4: Ratio hits the person in their 40s, with grey-streaked hair for 20 (80 left)
the person in their 40s, with grey-streaked hair's gear absorbs 42.
R5: Ratio hits the person in their 40s, with grey-streaked hair for 20 (60 left)
R5: the person in their 40s, with grey-streaked hair strikes for 46 (x1.2) (611 left)
R5: the person in their 50s, with freckles strikes for 5 (606 left)
the person in their 40s, with grey-streaked hair sees how this ends — and runs while running still works.
```

## Metric review (for the NEXT run — not a re-score of this one)

- D3 ever-winning floor: re-anchor on this larger band (n=44/35)
  rather than the n=14–18 pilot; consider a relative margin (sat
  >= natural + 10pp) instead of, or alongside, an absolute floor, so
  a 15-point improvement with a divergent wave mix is not failed by
  a floor set off a smaller, quieter band.
- D4 deaths leg: give it the starvation leg's tolerance shape (sat
  <= natural + 1) or compare rates, so a single death against a
  zero baseline is not an automatic fail at n=44/35.
- D1 primary floor 0.90 is thin (passed by one fight): the next
  prereg should either keep it with eyes open or pair it with a
  margin requirement (sat >= natural + 10pp — met here: +13.8pp).
- HP-matched damage: NOT computable from the current recorder
  (mHpStart empty on 0/79 U2 fights). Either change the recorder to
  capture beast starting HP before proposing it as a primary, or
  drop the candidate.
- Damage-mean: retired with cause (geartier-c) and reported here
  (+31%, would have passed). Do not re-impose it as a primary
  without addressing the conversion-cap argument — a passing
  damage-mean on these seeds does not overturn the D3/D4 verdict.
