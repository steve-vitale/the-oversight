# sim-rollwall-a — EVIDENCE (diag, 8 seeds × 1 leg)

**Arm:** sim-rollwall-a · **Loop A run:** fleshout-20261121T0315Z · **Axis:** scale-onramp
**Finding:** #2590 (serve half) — the ROLL WALL.
**Verdict: DIAG-GO** — the instrument classifies 100% of served 0-ammo
departures (9/9, 0 unclassified) and names ONE dominant mechanism
(roll-fail, 6 of 9); the calibration report covers 56 attempts (n ≥ 20)
with all three rates inside their exact 95% intervals. **No lever is
built**: the dominant class is roll-fail at a CALIBRATED rate, which the
frozen prereg §5 names as a close-DIAG outcome, not a fix. The roll is
not what is wrong.
**Prereg (frozen 2026-11-21 ~03:45 UTC, before any judged sim):**
`evidence/2026-11-21/sim-rollwall-a-prereg.md` (commit 97a530eca).
**Base:** master b7c8eff2c (journey-crisis r261). **Substrate anchor:**
2ab27333f (instrument + DEPMAT/ROLL35/AMMO re-land). **Branch:**
sim-rollwall-a. No push, no version bump, no live verification —
coordinator merges.

## Bars (frozen prereg §2 — a miss is DIAG-NO-GO, never re-scored)

| # | Bar | Result | Verdict |
|---|---|---|---|
| (a) | Completeness — 100% of served 0-ammo departures classified, 0 unclassified, 0 instrument errors on all 8 per-seed files | 9/9 classified, 0 unclassified, 0 errors, 0 join mismatches | **PASS** |
| (b) | One dominant mechanism — one class ≥ 4 of the classified failures, OR the observed craft success rate across ALL attempts (n ≥ 20) reported per rate with an exact binomial 95% interval + calibration verdict | roll-fail 6 (≥ 4) **AND** 56 attempts: 0.35 → 3/16, 0.60 → 6/12, 0.85 → 22/28, all three intervals contain their stated rate | **PASS (both disjuncts)** |

**Verdict: DIAG-GO.**

## §1. The instrument + substrate (what was built)

Substrate re-landed from the fiberfetch lever commit 213c4adfd
(DEPMAT + ROLL35 + AMMO hunks only — the FIBERFETCH fetch block was NOT
re-landed; it is CONCEPT-DEAD). Verified exact against the lever commit:
the only remaining diff is the fetch hunks, the reworded served-bow
comment, and the r261 dodge-article base drift. Proof at the substrate
anchor 2ab27333f, all green before the judged leg: `test-rollwall-a.js`
**46/46**, `test-depmat-a.js` 43/43, `test-roll35-a.js` 41/41,
`test-ammo-a.js` 52/52, analyzer `--selftest` 18/18. The substrate is
REVERTED before the final commit (§9); the proof tests fail on the
reverted tree by design, as the ammo/roll35/fiberfetch tests do on
master.

Instrument (`scripts/rollwall-driver-a.js`, `scripts/analyze-rollwall-a.js`,
`scripts/test-rollwall-a.js`): lean wraps of `villagerStageBow`
(stage rows: lv before/after, pile + own branch/vine/wood, spearHolder,
return source/itemId/craftedOk/roll35Rate/depmatSite), `villagerPocketAmmo`
(ammo rows: rangedId, ammoId, carriedBefore/After, pile stick/stone/fiber
+ every recipe material with pile AND pack counts, pack fiber,
ammoLvBefore, pocketed/crafted/craftedOk, ammoRate, ammoServed,
failReason, call path expedition/patrol from the stack), and
`villagerAmmoCraftDay` (home-craft rows: pile fiber before/after +
batches made + per-maker carried/level deltas), plus a dawn pile-fiber
census per day and a shared seq counter ordering rows within a day.
Wraps are pure reads, zero extra `Math.random` draws (proven R7).

**Determinism:** seed 107121 re-run into `perseed-rollwall-a-rep/` after
the leg — stageRows, ammoRows, homeCraftRows, dawnCensus, deaths all
byte-identical; days/end/maxWave/standing/scaleRank identical; same
anchor + gameSha. The driver is deterministic.

## §2. The classification (the 9 served 0-ammo departures)

Band 107121–107128, 150d, competent policy, SPEARGATE=1 + BOWOPEN=1 +
SENSEEXPED=1 + DEPMAT=1 + ROLL35=1 + AMMO=1. Served departures: 15
(107123: 3, 107124: 5, 107125: 6, 107128: 1; 107121/107122/107126/107127:
0). Every served departure joined its ammo row (0 no-attempt, 0 join
mismatch). Served with ammo: 6/15. Served with 0 ammo: 9.

| Seed | Day | Villager | Stage | Rate | Lv | Fail | Pile fiber | Pack fiber | Class |
|------|-----|----------|-------|------|----|------|-----------|-----------|-------|
| 107123 | 49 | theo_lindqvist | crafted crude_bow | 0.60 | 1 | craft-fail | 4 | 0 | roll-fail |
| 107123 | 58 | lucas_brown | crafted crude_bow | 0.60 | 1 | craft-fail | 4 | 0 | roll-fail |
| 107124 | 33 | ruby_callaghan | crafted crude_bow | 0.60 | 1 | craft-fail | 11 | 0 | roll-fail |
| 107124 | 34 | gen_3vjis8c | crafted crude_bow | 0.60 | 1 | craft-fail | 9 | 0 | roll-fail |
| 107124 | 40 | gen_taom4xi | crafted crude_bow | 0.60 | 1 | craft-fail | 4 | 0 | roll-fail |
| 107124 | 75 | sam_wilson | crafted crude_bow | — | 1 | no-mats | 0 | 0 | no-mats |
| 107125 | 3 | devon_okafor | crafted crude_bow | — | 1 | no-mats | 2 | 0 | no-mats |
| 107125 | 22 | gen_31qksib | crafted crude_bow | 0.60 | 1 | craft-fail | 6 | 0 | roll-fail |
| 107125 | 142 | visjoin_135 | crafted crude_bow | — | 1 | no-mats | 0 | 0 | no-mats |

Classes: **roll-fail 6, no-mats 3, no-mats (timing) 0, no-ammo-id 0,
no-ranged 0, no-attempt 0, no-recipe 0, unclassified 0.**

Reading the table:

- **The 6 roll-fails are ordinary 40% failures of a calibrated 60%
  roll.** All six ran at 0.60, level 1, with pile fiber 4–11 (materials
  plentiful) and pack fiber 0. Nothing else is wrong with them: the bow
  is seated (rangedId crude_bow), the attempt ran, the roll lost. The
  12 served-rate attempts split exactly 6 ok / 6 fail.
- **The 3 no-mats split two ways.** Sam Wilson (d75) and visjoin_135
  (d142): pile fiber 0, dawn pile fiber 0 — plain supply, the pile was
  empty at dawn. Devon Okafor (d3): pile fiber 2 — fiber was NOT the
  shortfall; the recipeMats read shows stick 1/2 and stone 0/1, so the
  craft died on stick + stone on day 3, before the pile was stocked.
  Only 2 of 3 no-mats are fiber; 1 is early-game stick/stone.
- **Timing: 0.** No no-mats departure had a home craft take fiber
  earlier the same day with fiber present at dawn. Devon's day-3 case
  is excluded from timing by direct evidence (homeCraftRows day 3: 0
  batches, pile fiber unchanged 2→2) — not by the census, which misses
  day 3 (see §7).
- **Gate-blocked, otherwise: 0.** No served departure left empty
  because the bow never seated (no-ammo-id 0 — the melee-first
  fallback seats every staged bow), because pocketAmmo never ran
  (no-attempt 0), or because there was no ranged weapon at all
  (no-ranged 0). The staging→pocketAmmo join is airtight on this
  band: 15/15 served joined, 0 mismatches.

## §3. The roll calibration (per rate, fresh band + pooled)

Fresh band, all departure arrow/bolt craft attempts (n = 56):

| Rate | n | ok | Observed | Exact 95% CI | Stated in interval? |
|------|---|----|----------|--------------|---------------------|
| 0.35 | 16 | 3 | 0.188 | [0.040, 0.456] | yes |
| 0.60 | 12 | 6 | 0.500 | [0.211, 0.789] | yes |
| 0.85 | 28 | 22 | 0.786 | [0.590, 0.917] | yes |

Pooled with the two prior arm legs (fiberfetch 107101–107108, ammo
107071–107078 — same substrate, same env), 176 attempts:

| Rate | n | ok | Observed | Exact 95% CI | Stated in interval? |
|------|---|----|----------|--------------|---------------------|
| 0.35 | 37 | 13 | 0.351 | [0.202, 0.525] | yes — dead on |
| 0.60 | 42 | 26 | 0.619 | [0.456, 0.764] | yes |
| 0.85 | 97 | 79 | 0.814 | [0.723, 0.886] | yes |

The roll is calibrated at every rate. The 0.35 rate reads low on this
band alone (3/16 = 0.188) and the 0.60 rate reads low-ish (6/12 =
0.500) — both are ordinary band noise: pooled, the 0.35 rate is 0.351
against a stated 0.35, and the 0.60 rate is 0.619 against 0.60.

## §4. The 6/6, dissolved (the selection fallacy, closed)

The fiberfetch 6/6 (p ≈ 0.004) was never 6 independent draws. On the
fiberfetch band the 6 failures were the failure subset of 20 served-rate
attempts (14 ok / 6 fail, 0.700 observed). On this fresh band the same
shape recurs with the numbers visible: 12 served-rate attempts, 6 ok /
6 fail — and the 6 failures ARE the 6 served 0-ammo departures, because
a failed craft with 0 arrows carried leaves 0 arrows. Conditioning on
"left with 0 ammo" selects failures by construction; the p ≈ 0.004
conditions on the outcome it measures. Pooled across three bands, the
served rate is 26/42 = 0.619 against a stated 0.60 — there is no roll
defect to find, at any rate, on any band. **The roll wall as framed
does not exist.** What exists is the ordinary 40% failure share of a
60% roll (6 of 15 served departures leave empty on the roll) plus a
materials wall at departures (3 of 15, §2) — and neither is a defect
in the roll.

## §5. Sense-test (transcripts)

The say-wrap works (12,300–16,022 say lines per seed). Bow/arrow
talk on this band is the home craft, narrated honestly both ways:
125 "made 5 Arrow" lines ("spent the afternoon at the workbench and
made 5 Arrow — and carries them now, their own work in their own
hands") against 107 "came apart in their hands. The materials are
wasted." lines. The served-zero villagers are named in their own
workbench lines: Theo fails at home d57/d61 after his d49 departure
roll-fail; Lucas fails d62 after his d58 roll-fail; Ruby fails d37
after her d33 roll-fail; Devon fails d12, then MAKES arrows d28/d38/
d50, fails d60, makes d64 — the home craft works for him after the
day-3 departure failed on stick/stone. No villager ever comments on
an empty quiver at departure, and no "no arrows" / "string stays
drawn" say-line fires — those are fight-log lines, not say lines, and
this driver does not wrap fieldFight; the ammo arm (§6) and fiberfetch
arm (§4) already sense-tested that voicing and it reads correctly
("Lelisa has Crude bow but no arrows — the string stays drawn,
useless."). Nothing here needs Steve's eyes on feel: the mechanism is
unheard at departure because nobody talks about the quiver there, not
because it reads wrong.

## §6. Village assessment (plain words)

Five of eight villages serve bows; three never serve one. The served
villages quiver about half their served departures (6/15 leave with
arrows) and the other half walk out empty — six on an honest lost
roll with fiber in the pile, three because the pile had nothing to
make arrows from. The villages survive anyway: median survival 150
days, wave 5 on 5 of 8 seeds, standing 199–625, regional throughout.
No village reaches national, none wins, none takes a seat — the wall
numbers are unchanged from the fiberfetch band.

Seed portraits: 107121 survives to wave 5, standing 535, bow-rich
(21 alreadyHad) — nobody needed serving. 107122 is lost day 149 at
regional 199 with 27 noSource stagings and 9 skill-gated stagings —
the knowledge wall, not the roll: nine departures where the villager
didn't know either bow while the materials sat there. 107123 is lost
day 122, 3 served, 2 empty on the roll. 107124 survives to wave 5,
5 served, 4 empty (3 roll, 1 fiber-0). 107125 survives to wave 5,
6 served, 3 empty (1 roll, 2 no-mats). 107126 is lost day 150 at wave
5 with 0 served. 107127 survives to wave 5 with ZERO departures of
any kind in 150 days — no expedition, no patrol, no pocketAmmo call:
a village that never leaves home and still reaches wave 5. 107128
survives to wave 4, 1 served, quivered.

## §7. Metric review (frozen bars judge as written — no re-score)

- **Completeness (a):** PASS cleanly — 9/9 classified, 0 unclassified,
  0 instrument errors, 0 join mismatches. The join (stage → ammo by
  vid/day/seq, expedition path) held on all 15 served departures.
- **Dominant mechanism (b):** PASS on BOTH disjuncts — roll-fail 6 ≥ 4,
  and the calibration report covers 56 attempts (n ≥ 20) with all
  three rates inside their intervals. DIAG-GO is unambiguous; neither
  disjunct had to carry the verdict alone.
- **Instrument gap (recorded, not hidden):** the dawn census misses
  days 1 and 3 on ALL 8 seeds (plus day 85 on 107121, day 62 on
  107126) — a systematic harness-cadence artifact (the first daily
  call never lands while the day counter reads 1 or 3), so the timing
  test is blind on those days. It does not change any classification
  here: the two fiber-0 no-mats had dawn fiber 0 on days WITH a
  census, and Devon's day-3 no-mats is excluded from timing by direct
  home-craft evidence (0 batches, pile fiber unchanged). A future
  instrument should census the pile inside the pocketAmmo pre-read on
  the same day (already recorded as `pile`) rather than relying on the
  daily hook for the dawn value.
- **Analyzer detail gap:** the no-mats detail string names only pile
  fiber; Devon's shortfall was stick + stone, visible only in the
  `recipeMats` field. A future analyzer should name the short
  material in the detail line.
- **Staging footnote:** 1 of 379 stage rows has source null (`?` in
  the counts — seed 107123, day 70, vid app_mgpsphkv883, knows both
  bows, pile branch 20/vine 0): an early return before `record()` —
  most plausibly a dead villager or the scholar's own id reaching the
  call. Not a served departure, not in any judged population, counted
  nowhere.
- **0.35 reads low on this band (3/16):** band noise, not a signal —
  pooled it is 13/37 = 0.351. The review does not re-score the band
  against the pooled number; the frozen bar judges the band, and the
  band passes.
- **RNG divergence:** single-leg diag, no contrast — nothing to
  diverge. Determinism proven by the 107121 re-run (§1).
- **Telemetry check (loop step 10):** `telemetry-check.js` against
  `telemetry-baselines/scale-wall.json` REFUSES this corpus by
  design — "refusing recorder-corpus input: all 8 --current rows
  carry top-level anchorCommit, so they are sweep recorder rows,
  not runs." A single-leg diag recorder corpus is not a run to
  compare against the scale-wall baseline, and the baseline is NOT
  rolled forward from it. No LOUD lines, no update.

## §8. Verdict + next lever (no fix built)

**DIAG-GO. No lever is built.** The frozen prereg §5 names this exact
outcome: the dominant class is `roll-fail` at a calibrated rate, so
the diag closes with the named next lever and no speculative fix.
There is no roll defect: the 60% rate delivers 0.619 pooled, the
35% delivers 0.351 pooled, the 85% delivers 0.814 pooled. Raising
the served first-make rate above 60% would be a BALANCE call (paying
for the 40% failure share with a bigger number), not a defect fix —
and it is not made here.

**Next lever, in the fiberfetch §8 order: evade-on-a-quivered-bow.**
The served bow now leaves quivered often enough (6/15 with arrows,
plus the alreadyHad quivers) that the binding question is what the
quivered fighter DOES when the fight comes — the evade wall that ate
gen_iq204w4 (4 arrows, evaded) on the ammo band. Held, not named as a
fix: the materials wall at departures (3/15 — fiber-0 at dawn twice,
stick/stone day 3 once) and the knowledge wall on seed 107122 (9
skill-gated stagings). Finding #2590's serve half stays OPEN on the
evade half; the roll half is CLOSED — the roll is calibrated, the 6/6
is selection, and no further roll work is owed.

## §9. Revert (DIAG closeout)

Per the ammo/depmat/roll35/fiberfetch precedent (instrument + evidence
only): the DEPMAT+ROLL35+AMMO substrate re-land is reverted from
`src/js/game.js` before the final commit — the branch's final tree
differs from master b7c8eff2c in no `src/` file. Revert verified as
the exact inverse by hash (game.js hash-identical to base b7c8eff2c;
`git diff b7c8eff2c -- src/js/game.js` empty). Proof results at the
substrate anchor 2ab27333f (ROLLWALL 46/46, DEPMAT 43/43, ROLL35 41/41,
AMMO 52/52, analyzer selftest 18/18) are recorded here and in the
commit message; the proof tests fail on the reverted tree by design,
as the roll35/ammo/fiberfetch tests do on master. Nothing is pushed,
no version bumped, nothing verified live. Branch clean, ready for
coordinator `--ff-only` merge, pending ship.

## §10. Files

- Prereg (frozen): `evidence/2026-11-21/sim-rollwall-a-prereg.md`
- This evidence: `evidence/2026-11-21/sim-rollwall-a.md`
- Analysis: `evidence/2026-11-21/rollwall-a-analysis.json`
- Pilot corpora (8 seeds): `evidence/2026-11-21/perseed-rollwall-a-diag/`
- Determinism re-run (seed 107121): `evidence/2026-11-21/perseed-rollwall-a-rep/`
- Pilot logs: `evidence/2026-11-21/rollwall-a-diag.log/.err`
- Instrument: `scripts/rollwall-driver-a.js`,
  `scripts/analyze-rollwall-a.js`, `scripts/test-rollwall-a.js`
- Substrate (reverted, history only): `src/js/game.js` DEPMAT +
  ROLL35 + AMMO at commit 2ab27333f.
