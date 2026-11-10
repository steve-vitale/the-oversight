# sim-roundcap-b — census + sizing of the round-cap walk-away (DIAG + SIZING, zero src/js)

- Arm: sim-roundcap-b (Loop B, DIAG + SIZING arm, run fleshout-loop-b-20261110T0626Z, arm 2 of 2)
- Branch: sim-roundcap-b; base anchor `215c37e65cf28118cc7520d954fefde751564955`
  (worktree `~/workspace/worktrees/sim-roundcap-b`)
- Prereg: evidence/2026-11-10/sim-roundcap-b-prereg.md (committed `606a4ba2b`
  BEFORE any judged computation in this run). Instruments:
  scripts/roundcap-instrument-20261110.js (round-cap recorder),
  scripts/roundcap-driver-20261110.js (wild driver),
  scripts/roundcap-analyze-20261110.js (wild-corpus analyzer),
  scripts/roundcap-redrive-20261110.js (cap-extension re-driver),
  scripts/test-roundcap-b.js (proof + constructed sizing, **25 passed, 0 failed**).
  Shared-harness addition: `sourcePatch` hook in scripts/sim-harness.js
  (test-only in-memory source transform; regression-checked: volleysoft
  17/17 still green).
- Verdict: **DIAG — the near-dead window is field-unmeasurable (0
  near-dead caps in 1,050 wild field fights on a fresh band), and the
  constructed sizing says a blanket cap extension cannot take the window
  anyway (0/32 converted at +1/+2 rounds, 3/32 at +3 — while 7 fighters
  who walked away alive at 15 die by 18).** Zero src/js changes in this
  arm (instrument + proof + evidence + corpora only). No gate / price /
  deed / readyDemand / win-price change; no MAX_ROUNDS change. The
  design question — whether the walk-away is the intended price — is
  NOT decided here, but the sizing recommends DON'T BUILD a cap
  extension (see the lever spec).

## Premise corrections (the headline — read this first)

1. **The cap is usually the price of a survival trick, not a damage
   race.** Five of the seven wild caps are Buffering, and the mechanism
   is now read out of the code, not guessed: a fighter who KNOWS the
   Buffering trick stands perfectly still once below 60% HP
   (fieldFights.js:231–232), the beast's attack whiffs
   (`rec.trickStill`, :1542–1547), and the trick-aware morale hold
   keeps them in the fight while above 25% HP (:2292–2302, "holds the
   line — working the trick, not the damage race"). Standing still
   deals no damage — so the beast sits at its post-volley HP for the
   rest of the fight and the clock runs out. Extending the cap extends
   the WAITING, not the striking: Buffering wait-caps convert 0 at
   +1/+2/+3 by construction. The 99596 fighters entered healthy, took
   one hit, then waited — a wounded (55 HP) entry does NOT reproduce
   it: the beast's round-1 hit floors the fighter into a round-1 flee
   (found by construction: 132/150 round-1 flees at health 55).
2. **The suggested band 99743–99750 is NOT fresh.** The first worker's
   single-seed literal search reported 0 hits. Re-verification found
   the RANGE claim `99741–99752` (tbretreat-b-confirm) in
   evidence/2026-11-05/sim-gearoff-confirm-b-prereg.md:62,
   sim-sigoff-confirm-b-prereg.md:43, and
   sim-trickoff-confirm-b-prereg.md:55,59 — a range claim names the
   whole interval, so 99743–99750 is reserved. The single-seed
   literals never appear, which is exactly how the miss happened.
   **Fresh band used: 99633–99640** — verified 0 hits per seed in all
   preregs, all dated .md, all evidence filenames, and scripts/; no
   prereg range covers 99633–99640 (used 996xx ranges found:
   99601–99612, 99651–99658, 99671–99678, 99682–99687). Collision
   recorded in the prereg so the next worker does not repeat it.
3. **"One strike from dead" is engine-defined.** The fighter's strike
   is `lroll([4+wb, 8+wb])`, wb from the engine's equipment helpers.
   The instrument computes wb after the fight (post-gear-up equipment
   IS entry equipment) and records oneStrike = mHpLeft ≤ 8+wb. The
   proof test verifies the instrument's wb against an independent
   computation on every constructed fight (25/25).

## Wild leg (fresh band 99633–99640, competent, 150d death-aware)

Driver: scripts/roundcap-driver-20261110.js, RUN=roundcap-wild
(~8 min, 8/8 seeds, instrument errors 0). Analyzer:
scripts/roundcap-analyze-20261110.js.

| Seed | Days | End | MaxWave | Standing | Field fights | Round caps | Near-dead caps | W4 field | W4 kills | Scholar deaths |
|---|---|---|---|---|---|---|---|---|---|---|
| 99633 | 140 | lost | 4 | 165 | 95 | 1 | 0 | 4 | 0 | 9 |
| 99634 | 150 | survived | 5 | 375 | 102 | 0 | 0 | 0 | 2 | 6 |
| 99635 | 112 | lost | 4 | 199 | 114 | 0 | 0 | 12 | 1 | 6 |
| 99636 | 98 | lost | 4 | 199 | 202 | 4 | 0 | 3 | 4 | 5 |
| 99637 | 148 | lost | 4 | 199 | 170 | 1 | 0 | 16 | 3 | 13 |
| 99638 | 120 | lost | 4 | 199 | 144 | 0 | 0 | 16 | 4 | 10 |
| 99639 | 100 | lost | 4 | 150 | 134 | 1 | 0 | 4 | 2 | 6 |
| 99640 | 150 | survived | 4 | 199 | 89 | 0 | 0 | 9 | 2 | 8 |
| **Band** | **median 130d** | **6 lost / 2 survived** | **w4 8/8, w5 1/8** | — | **1,050** | **7** | **0** | **64** | **18** | **63** |

### The seven round caps (all of them)

| Seed | Day | Monster | Wave | Entry HP | Beast HP at cap | Fighter HP at cap | Fighter strike | One strike? | Next meeting |
|---|---|---|---|---|---|---|---|---|---|
| 99633 | 94 | chorus_line | 3 | 225/300 | 40 | 70/99 | [10,14] | No | d96: entry 40 → vKill in 2 rounds |
| 99636 | 43 | buffering | 3 | 149/280 | 137 | 33/96 | [8,12] | No | none |
| 99636 | 45 | buffering | 3 | 210/280 | 210 | 59/84 | [10,14] | No | d52: entry 210 → capped again at 180 |
| 99636 | 52 | buffering | 3 | 210/280 | 180 | 47/72 | [26,30] | No | none |
| 99636 | 52 | buffering | 3 | 110/280 | 90 | 48/100 | [8,12] | No | none |
| 99637 | 70 | buffering | 3 | 158/280 | 138 | 36/100 | [19,23] | No | none |
| 99639 | 39 | callback | 3 | 260/260 | 92 | 41/100 | [10,14] | No | d39: entry 92 → vFlee in 5 rounds, 43 left |

All seven are wave 3, all end vFlee (fighter walks away, beast holds
the field), all in bucket >30 (beast HP at cap 40–210). Near-dead
(≤30 HP): **0**. One strike from dead: **0**. By wave, field fights
were w1 465 / w2 299 / w3 222 / w4 64; outcomes overall vKill 493 /
evade 285 / vFlee 138 / mFlee 120 / vDie 14. The wave-4 field shape
matches volleysoft's band: 64 fights, 3 vKill, 43 vFlee, 4 vDie, 9
mFlee, 5 evade; rounds median 3 (max 10); beast HP left median 646.5.
Per the prereg, the primary reads **DIAG (field-unmeasurable at 8
seeds)**: caps occur (7/1,050 fights) but none near-dead. The band was
NOT extended mid-run to chase the window.

Two caps chained into later meetings, the way the 99596 chain did:
the chorus_line cap's beast was killed two days later (entry 40 →
vKill in 2 rounds), and the 210-HP Buffering was met again a week
later at 210 and capped AGAIN at 180 — the same beast, ground down
30 HP across a week, still walking away. The cap does not waste the
damage: wounds persist onto the world entity, and the village meets
the same beast again.

## Constructed sizing (the deliverable)

Test: scripts/test-roundcap-b.js, 25/25. Re-driver:
scripts/roundcap-redrive-20261110.js. Shapes (30 seeded streams each,
seed 87104 family, bow + 4 arrows, solo, fighter 100 HP, trick-known
unless noted): Buffering anchor (entry 29/43/73 — the 99596 shape),
Buffering wild-typical (entry 149/158/210 — the census caps), Buffering
no-trick control (entry 43/73), chorus_line (entry 225/260), callback
(entry 260). 330 fights per cap value. The extension lives ONLY in the
test's in-memory loaded copy of fieldFights.js (sim-harness
`sourcePatch`); the identity check is load-bearing: CAP=15 patched
reproduces CAP=15 unpatched outcomes EXACTLY (outcome / rounds /
mHpLeft / vHpLeft / mDealt / full log, 330/330), and the CAP=15 log is
a prefix of the CAP=18 log on all 89 capped fights (0 mismatches) —
the extension is a true continuation of the same fight.

| Cap | Fights | Capped | Capped near-dead ≤30 | Capped near-dead ≤10 |
|---|---|---|---|---|
| 15 (production) | 330 | 89 | 32 | 8 |
| 16 (+1) | 330 | 81 | 29 | 6 |
| 17 (+2) | 330 | 81 | 30 | 9 |
| 18 (+3) | 330 | 78 | 29 | 6 |

Matched outcomes for the 89 fights capped at 15:

| Extension | Converted (vKill) | Died (vDie) | Still capped | Other (vFlee) | Near-dead ≤30 converted |
|---|---|---|---|---|---|
| +1 round | **0** | 7 | 81 | 1 | 0/32 (0.0%) |
| +2 rounds | **0** | 7 | 81 | 1 | 0/32 (0.0%) |
| +3 rounds | **3** | 7 | 78 | 1 | 3/32 (9.4%) |

By shape: Buffering wait-caps convert **0 at every extension** (75
capped: 0 converted at +1/+2/+3) — the fighter keeps standing still
through rounds 16–18; the extra rounds are more waiting, not more
striking. Chorus_line striking caps convert 3/14 at +3 (all in round
18, fighter HP left 14 / 27 / 63) — and 7/14 of the SAME chorus_line
caps end vDie by round 18: fighters who walked away alive at 15 die
in the extension. Callback caps 0/30 (fighters flee early, 28/30
vFlee); no-trick Buffering caps 0/60 (fighters die 32/60 or flee
18/60 — without the trick there is no cap to extend).

### What a cap extension would need — the sizing

- **At +1/+2 it converts nothing.** 0/89 overall, 0/32 near-dead.
  The extension cannot convert a fight the fighter is not fighting:
  the wait-shape fighter spends the extra rounds standing still.
- **At +3 it converts 3/89 (3.4%), 3/32 near-dead (9.4%) — and
  kills 7.** The trade is 3 kills for 7 deaths, all in the one shape
  (chorus_line) where the fighter is actually striking, and the
  deaths are fighters who walked away alive at the production cap.
  A build arm with the prereg's draft GO bar (≥ 0.50 near-dead
  conversion) fails by 5× at +3, and the cost bar (fighter deaths)
  fails on its own: 7/89 (7.9%) of capped fighters die in the
  extension.
- **The near-dead ≤10 pool converts 0/8 at every extension.** The
  99596 shape itself — a 10-HP beast, a 56-HP fighter — does not
  convert by giving the fighter more rounds, because the fighter is
  standing still and the beast is whiffing. More clock does not make
  a waiting fighter strike.
- **The honest alternative is not the cap.** If the 99596 shape is
  worth addressing, the lever is the WAIT, not the clock: a fighter
  standing still against a beast one strike from dead could take the
  strike instead of waiting (a "finish-aware wait"). That is a
  different lever — it changes what the trick means (standing still
  IS the counterplay; breaking it to strike risks the whiff
  protection) — and it needs its own prereg plus a Steve-call, not a
  cap raise. This arm sizes the cap extension and finds it wanting;
  it does not build or spec the wait lever beyond naming it.

## Lever spec (pre-registered for a future build run — NOT built here)

- **Recommendation: DO NOT BUILD a blanket round-cap extension.**
  Primary metric for any future cap-extension arm: near-dead capped
  meetings converted to kills / near-dead capped meetings, GO ≥ 0.50.
  Measured: 0.000 at +1/+2, 0.094 at +3. Cost bar: fighter deaths
  in capped fights must not exceed the no-extension baseline (0 deaths
  among capped fighters at cap 15 — they all walk away) by more than
  +0pp in practice; measured +7/89 at +3, all chorus_line. Any build
  that extends the cap must carry that death rate as its cost bar.
- **Band / horizon:** FRESH band, verified at build time the way this
  run verified 99633–99640 (preregs + dated .md + filenames +
  scripts/; 99633–99640 is now used, never reuse it; 99743–99750 is
  NOT fresh — see the band correction above). 150d death-aware,
  competent policy verbatim. Construction judged on the 330-fight
  driver in scripts/test-roundcap-b.js (same shapes, same streams);
  wild leg is the guard, not the judge.
- **Pre-build decisions required (Steve-call, in order):** (1) whether
  the walk-away is the intended price at all — the sizing says the
  cap is the price of a survival trick working as designed, and the
  fiction reads as earned; (2) if the 99596 shape is still worth
  addressing, whether the wait should break for a finishing strike
  (the "finish-aware wait" lever), which is a different build with its
  own prereg. **Do NOT build a MAX_ROUNDS raise on this evidence: it
  converts 0/32 near-dead caps at +1/+2 and 3/32 at +3 while killing
  7 fighters who would have walked away.**
- **What the build must NOT do:** raise MAX_ROUNDS, touch the break
  line, the 60% HP wait gate, the 25% trick-hold floor, the
  committed-beast walk-away, or any win price / deed gate / readiness
  bar.

## Sense-test read

**The seven wild caps, log tails.** The Buffering caps read as earned
survival, not a bug: "Catch Up hits Carlos for 0 (33 left)" — the
beast swings at where Carlos was going to be and hits air — "Carlos
stands perfectly still. Gives it nothing to predict." — "Carlos holds
the line — working the trick, not the damage race." — "Neither gives
after 15 rounds — Carlos walks away. Buffering holds the field; it is
not leaving." A wounded fighter surviving by refusing the damage race
is exactly what the trick is for, and the narration says so. The
chorus_line cap reads differently and better as a near-miss: "Nina
strikes for 13 (40 left)" in round 15 — she is still fighting, the
beast is at 40 HP, and the clock ends it. The callback cap has one
off note: "Ella strikes for 14 (92 left)" followed by "Ella holds the
line — working the trick, not the damage race" — she is striking, not
trick-working; the morale-hold line is generic and fires for any
trickLog entry. Same wart class as volleysoft's repeated committedHold
line: the "holds the line" sentence repeats verbatim in 6 of 7 caps —
true every time, but it reads as filler by the third repeat.

**The daily texture.** "Somchai and Mia lingered over the fire
together" repeats day after day with different pairings — a routine
line, not a conversation; it reads as the village idling, not living
(same observation as volleysoft). The deathSays sample is mostly the
instrument's "deadfall" false positive (gathering lines matching
/dead/), not actual deaths — a known instrument quirk, harmless.

## Village assessment (plain words)

Eight villages on a fresh band, and none of them won. Two survived
the full 150 days (99634 reached standing 375 and unlocked the fifth
wave; 99640 held at 199); the other six died between day 98 and 148.
The strongest village killed four wave-4 beasts and still lost. The
villages fought the fourth wave 64 times in the field and killed
three — the field still almost never kills at this tier, and nobody
reached national, nobody sat at the table. The chain binds where
volleysoft left it: past the veterans bar, at wave-5 facing and the
climb to national. Against that, the round cap is a small story: seven
fights in 1,050 ended on the clock, and in five of them the fighter
survived specifically because they knew the trick and refused the
damage race. The cap is not where these villages are losing the game.
What they are missing is the same as on the last band: kills that turn
into standing, and standing that turns into a seat.

## Wall numbers (national / table / wins, wave 4–5, median survival)

Wild leg (current master, anchor `215c37e65`): median survival 130d
(range 98–150), won 0/8, national 0/8 (regional 8/8), table sittings
0, wave-4 unlock 8/8, wave-5 unlock 1/8, wave-4 kills 18 (all
channels), wave-5 kills 0, field wave-4 kills 3, scholar deaths 63,
instrument errors 0. No win movement either way; nothing to
investigate on the telemetry side (telemetry-check refused the
recorder corpus, as expected — see below).

## Metric review (§14a, to carry to the next run)

- The prereg's primary (wild near-dead round-cap rate, DIAG-GO if ≥ 1
  near-dead cap) read 0 — DIAG field-unmeasurable, as the prereg
  provided for. No re-score, no band extension. The constructed
  sizing is the deliverable and it does not depend on the wild count.
- The wild "one strike" definition uses the fighter's strike range
  (mHpLeft ≤ 8+wb), not the strike that would actually have been
  rolled next (the next strike is a draw, not a fact). On this band
  the distinction is moot (0 near-dead caps), but a future run with a
  non-zero near-dead pool should report both the range-based share and
  the stricter ≤ 4+wb share — both are recorded per row already.
- The constructed extension re-drives a patched in-memory copy, so
  its identity check (CAP=15 patched == CAP=15 unpatched, 330/330
  exact including full logs; CAP=15 log a prefix of the CAP=18 log on
  89/89 capped fights) is the load-bearing proof that the extension
  is a true continuation. A future run reusing the redriver must
  re-run that identity check, not assume it.
- Shape correction, made during the run (bar not moved): the first
  constructed pass used wounded (55 HP) Buffering fighters, who fled
  in round 1 (132/150) — the beast's round-1 hit floors them. The
  wild 99596 fighters entered healthy and dropped below 60% on the
  beast's round-1 hit, then waited. The shape was fixed to healthy
  (100 HP) entries and the sizing re-run; the first pass's numbers
  (0 caps) are discarded, not reported as sizing.
- The wild leg's cap count (7) is thin for a window this rare; a
  future run that wants a wild near-dead count should screen 16+
  seeds and should first check whether field fighters know the
  Buffering trick at fight time on its band — the wait is what makes
  caps, and trick knowledge is learned, not given.

## Findings for the backlog (coordinator files these)

- ROUND-CAP WALK-AWAY, SIZED (update the open 2026-11-10 finding):
  wild 0 near-dead caps in 1,050 field fights on fresh band
  99633–99640; constructed 0/32 converted at +1/+2 rounds, 3/32 at
  +3, with 7 fighters dying in the extension who walked away at 15.
  Recommendation: DO NOT BUILD a blanket cap extension. If the 99596
  shape is still worth addressing, the lever is the wait, not the
  clock ("finish-aware wait" — a fighter standing still against a
  beast one strike from dead takes the strike), which needs its own
  prereg + Steve-call. Evidence: this file + perseed-roundcap-b
  corpora + scripts/test-roundcap-b.js (25/25).
- (Not re-filed: the repeated "holds the line" morale line — a wart,
  not a defect, same class as vetfinish's committedHold repeat; the
  "lingered over the fire together" daily repeat — routine texture;
  the deathSays "deadfall" false positive — instrument quirk,
  harmless.)

## What was NOT touched (guardrails)

- Zero src/js changes in this arm. No MAX_ROUNDS change, no wait-gate
  change, no break-line change, no gate / price / deed / readyDemand /
  win-price change.
- Shared-script addition only: the `sourcePatch` hook in
  scripts/sim-harness.js (default identity; volleysoft 17/17 still
  green). No live verification, no push, no version bump (coordinator
  merges).

## Commits (this branch)

- `606a4ba2b` — prereg (safe-commit index clobber hit, repaired from
  HEAD with `git ls-tree HEAD | git update-index --add --index-info`,
  status + diff clean, hash verified)
- (instrument + driver + analyzer + redriver + proof test + harness
  hook + evidence + corpora, to commit next)

## Corpus

- evidence/2026-11-10/perseed-roundcap-b/rc-s9963{3..40}-roundcap-wild.json (8 files)
- evidence/2026-11-10/perseed-roundcap-b/roundcap-redrive-cap15/16/17/18.jsonl (4 files, 330 fights each)
- Tooling: scripts/roundcap-instrument-20261110.js,
  scripts/roundcap-driver-20261110.js,
  scripts/roundcap-analyze-20261110.js,
  scripts/roundcap-redrive-20261110.js,
  scripts/test-roundcap-b.js (25/25); harness hook in
  scripts/sim-harness.js; reused
  scripts/finishersize-driver-20261106.js (as template),
  scripts/finishersize-instrument-20261106.js,
  scripts/grind-instrument-20261106.js,
  scripts/finishersize-analyze-20261106.js,
  scripts/test-volleysoft-b.js (regression, 17/17).

## Convergence state

- ROUND-CAP WALK-AWAY (sim-findings.md, open, design decision):
  sized, not decided. Wild window 0/1,050 field fights on a fresh
  band; constructed window 89 capped fights with 32 near-dead, and a
  cap extension converts 0/32 at +1/+2 and 3/32 at +3 while killing 7
  fighters who walked away at 15. A blanket cap raise is NOT
  recommended. Status: sized / awaiting design decision on the
  alternative (finish-aware wait), not converged, not killed.
- Balance panel (§15): not run. The panel runs its own full panel and
  takes no corpus input (same precedent as grind-a, finishersize-a,
  adopt-a, vetfinish-b, volleysoft-b); the pre-registered primary is
  the wild near-dead cap rate on identical seeds + the constructed
  sizing. No compare .md fabricated.
- Telemetry: `scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-10/perseed-roundcap-b/*.json' --metrics
  national,table,wins,exiled` REFUSED — "refusing recorder-corpus
  input: all 8 --current rows carry top-level anchorCommit". Recorded
  as the result, same as grind-a / finishersize-a / adopt-a /
  vetfinish-b / volleysoft-b. The baseline was NOT reseeded.
- Blanks filled: the round-cap walk-away is censused in the wild
  (7 caps, 0 near-dead, all wave 3) and sized by construction (89
  capped fights, conversion 0/0/3 at +1/+2/+3, death cost 7), the
  mechanism is read out of the code (the stand-still wait, not a
  damage race), and the future build run has a pre-registered
  DON'T-BUILD recommendation with the alternative lever named. Blank
  remaining: the design decision itself, and the chain past veterans
  — wave-5 facing / national, where this band also binds.

## Check status

- Proof tests on this tip: roundcap 25/25, volleysoft 17/17
  (regression after the harness hook). `test-vetfinish-b.js` was NOT
  re-run here (its V2 shapes are not touched by this arm; zero src/js
  changes).
- `node scripts/check.js --quick` was NOT run (zero src/js changes;
  the 25/25 proof + 8-seed wild leg with 0 instrument errors are the
  regression evidence for an instrument-only arm, plus the volleysoft
  17/17 harness regression). Stated as not run, not claimed.
