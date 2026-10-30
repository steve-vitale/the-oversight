# sim-geartier-d — PREREGISTRATION (binding, committed BEFORE any judged run)

Run: gapscomp-pavise, War Pavise re-test (gaps-completion run, Steve
2026-10-29 15:47 CDT "Address remaining gaps" via gaps coordinator #2).
Assignment: re-test the HELD War Pavise mechanism on 16+ FRESH seeds
with a reconsidered primary. This prereg is NEW. It does NOT re-score
geartier-b (pilot NO-GO, lone-fight universe) or geartier-c (pilot
NO-GO on the damage-mean primary only); both verdicts stand. A miss
below is NO-GO per MEASUREMENT.md §14 — never re-scored mid-run
against a friendlier metric. Metric doubts go under "metric review"
in the final note, for the NEXT run.

## Canon read first

- docs/CANON.md, docs/MONSTER-WAVES.md, docs/PARTY.md (read before
  this prereg was written; no canon invented).
- evidence/2026-10-29/sim-geartier-b.md + sim-geartier-b-prereg.md
  (mechanism, gates, lone-universe root cause).
- evidence/2026-10-29/sim-geartier-c.md + sim-geartier-c-prereg.md
  (party-universe pilot: every leg passed except the damage-mean
  primary; root cause below). Tangle Line stays DEAD — no snare code,
  no tangle_line item, no snare-shaped effect is built or revived.
- Gating freeze stands: NO deedGateReady, finale-omen, or wave/scale
  threshold changes in this run. No leg-village links touched. No
  default flipped. The shield is judged as a saturation instrument
  (as in geartier-b/c), NOT as an earn-rate claim.

## Why damage-mean is the wrong primary here (written rationale)

The geartier-c pilot proved the damage-mean primary punishes exactly
what the shield achieves, in two visible ways:

1. CONVERSION CAPS DAMAGE. The shield turns fled fights into
   drive-offs (geartier-c: fled 0 vs 4 natural) — and a driven beast
   ends the fight. A drive-off caps the damage a fight can deal,
   while a natural kill fight keeps dealing until the beast dies.
   So the outcome-conversion leg passed at 100% while the
   damage-mean leg missed: the shield wins fights by ENDING them,
   not by prolonging them into bigger damage totals. The shield
   touches no strike/armor/round-cap formula, so a damage-inflation
   bar measures something the mechanism never claimed to do.
2. THE NATURAL MEAN IS UNSTABLE AT THIS n. Calibration natural
   mDealtMean was 49.8; fresh-seed natural was 71.9 (+44%) — a few
   kill fights (mirror_stag 135, gavel 243, anaconda_empress 114)
   swing either band's mean by ~10% at n = 14–17. A +25% bar set off
   a quieter calibration band is therefore a lottery on which
   seeds' natural kill fights show up, not a measure of the shield.

The shield's actual claim, visible in both calibration and pilot, is
OUTCOME CONVERSION: a party fight that plants the shield ends in a
kill or a drive-off instead of a flee or a death, with less damage
taken. The primary below measures that claim directly.

## The mechanism (frozen, ported from build-geartier tip f205fc2b5)

Ported onto the current master base (mechanism commit precedes this
prereg commit; NOTHING in the mechanism changed for this run — in
particular the known geartier-b wart, the pavise's `acc1` slot
displacing a keepsake in auto-equip, is NOT fixed here, so the
judged fixture reproduces on identical code; planting works from
carried, so the slot is irrelevant to planting). src/js/
fieldFights.js (pavise plant/absorb/break hunks), src/data/items.json
(war_pavise entry), src/data/reward-economy.json (tier-3 line), plus
the two instruments and the prior prereg/note for reference.

In plain words, unchanged: a tall planted shield as a third body on
the board. A fighter carrying a War Pavise, with a line (ally beside
them, or a crew who will come) and a meal in them, plants it at the
fight's opening; ordinary blows land on the shield's 90-point pool
until it splinters while the party strikes. Planting costs a meal's
hunger (24); hungry or lone fighters cannot plant. Earnable (tier-3
loot, prizes, trader, gifts); food-powered; can't skip dinner. Six
System slots untouched.

## Judged universe U2 (party universe, UNCHANGED from geartier-c)

A joined meeting (wrapper fight + fieldparty meeting, same order
index, mid+vid verified, any mismatch invalidates the corpus) counts
in U2 iff ALL of:
- rounds >= 1 (fought; 0-round 'evade' meetings are not fights), AND
- party-A line present: allyFromStart OR allyVids non-empty OR
  engineAllies > 0 OR joinedAllyVid non-null.
- No wave, channel, caller, or scholar restriction (geartier-c: 0
  scholar leaders occurred; scholar count is reported, not filtered).

## Judged runs (in order, all after this commit)

1. FIXTURE GUARD (regression, not a re-score):
   scripts/test-geartier-b.js (verbatim from the mechanism port) to
   evidence/2026-10-30/geartier-d-party-postfixture.json. Controls
   are matched controls run in the same fixture on the current base;
   the guard is directional (see D5).
2. PILOT SWEEP: scripts/test-geartier-b-sweep.js VERBATIM (same
   substrate as geartier-b/c: tableseat-nowait policy,
   LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware,
   fieldparty-form-diag recorder verbatim), seeds FRESH 75301–75316
   (16 seeds; never used in any pavise run — geartier-b used 751xx,
   geartier-c used 752xx), bands natural (read-only wrapper) and
   pavise (saturation grant wrapper), corpus
   evidence/2026-10-30/perseed-geartier-d-party/{natural,pavise}/.
   Run with SEEDS=75301,...,75316 EVID=<corpus dir>. Then
   scripts/test-geartier-d-party.js (frozen in this commit) for the
   U2 verdict table. The sweep's own --summary (old U) is run for
   corpus validation only and is NOT judged here.
3. SENSE: >= 1 full planted-fight transcript (fixture or wild)
   quoted verbatim in the final note, judged as a played fight.

## GO thresholds (GO = every leg passes; any FAIL = NO-GO)

| Leg | Bar (frozen) | Anchor (geartier-c pilot / calibration) |
|-----|--------------|------------------------------------------|
| D0 corpus | 16/16 seeds per band, corpusOk, joinMismatch 0, wrapErrs 0, recorder errs 0, no overflow | 8/8 both, all zero |
| D1 PRIMARY: outcome conversion | kills+drives RATE in U2, sat >= 0.90 AND sat >= natural | pilot 100% (14/14) vs 76.5% (13/17); calibration 89% vs 67% |
| D2 applicability | U2 n >= 24 per band, AND sat planted >= 50% of sat U2 fights. If n < 24 in either band -> INSUFFICIENT-DATA (neither GO nor kill; next run adds seeds). Plant-rate miss with n >= 24 -> FAIL. | pilot n 17/14, planted 71% |
| D3 ever-winning | everWinning RATE in U2, sat >= natural AND sat >= 0.80 | pilot 13/14 (93%) vs 10/17 (59%); calibration 16/18 (89%) |
| D4 no-harm | deaths in U2, sat <= natural; AND band starvationTotal sat <= natural + 1 | pilot deaths 0 vs 0; starvation 4 vs 3 |
| D4b damage taken | vTakenMean in U2, sat <= natural | pilot 13.9 vs 34.7 (halved) |
| D5 fixture guard | pavise-aid AND pavise cells: planted 10/10, everWinning >= 6/10, roundsMed AND mDealtMean above their matched controls. Hungry/lone refusal cells: planted 0/10. | prior 10/10, 10/10, controls reproduced exactly |
| D6 sense | >= 1 verbatim planted transcript, reads as a thing planted, stood behind, splintered (or fight ended behind it) | prior transcripts |

REPORTED, NOT GATED: mDealtMean/Med in U2 (the retired primary,
reported for continuity — a NO-GO here does NOT re-impose it),
roundsMed/Mean, HP-matched damage (mean of mDealt/mHpStart over U2
fights with mHpStart > 0, both bands, plus coverage counts — the
metric-review candidate for a future primary, reported here without
a bar because no calibration exists for it yet), per-seed U2 counts,
wave/channel/caller mix, wall totals (won, wave reach, deaths,
starvation), natural earners. A NO-GO on D1/D3/D4/D4b is a
HELD-WITH-REASON outcome (mechanism stays on its branch, not killed,
not landed) unless the evidence proves the lever itself wrong — kill
discipline: a missed bar is not a kill until the lever is proven
wrong.

## Policies

- No re-scoring: geartier-b's and geartier-c's NO-GOs stand; this
  run's verdict is its own. No mid-run threshold changes; doubts go
  in the final note's 'metric review' for the NEXT run.
- No push, no version bump, no live verification, no merge to
  master. On GO: land the mechanism on this branch (src/js + proof
  test + evidence, proof-green, check-quick with no NEW failures vs
  the known 284/6 baseline set) and report the branch tip for the
  coordinator to merge and verify. On NO-GO or INSUFFICIENT-DATA:
  evidence only (new numbers, why the primary still binds or what
  new root cause appeared); no game code lands.
- Instruments frozen at this commit: test-geartier-b.js,
  test-geartier-b-sweep.js (verbatim), test-geartier-d-party.js
  (new, adapted from test-geartier-c-party.js: SEEDS default
  75301–75316, corpus dir perseed-geartier-d-party, legs D0–D6,
  HP-share reported). Any instrument edit after this commit voids
  the judged runs.
