# sim-allyslot3-b — the 3rd-ally slot (Loop B 2030Z run, arm 2)

## Verdict: NO-GO, METRIC-BROKEN — the band delivered no pool to judge the slot, and the one live-fire row is invisible to the metric

**Frozen prereg:** `evidence/2026-11-18/sim-allyslot3-b-prereg.md` (commit `fc8b9894a`, rebased onto master `1dc8b1641`).
**Lever commit:** `ddc7e78ed` [needs-eyes] — HELD on branch `sim-allyslot3-b`, never merged.
**Analysis:** `evidence/2026-11-18/allyslot3-b-analysis.json` (verdict NO-GO, kind METRIC-BROKEN; re-run on the rebased tip reproduces it byte-identically).
**Corpora:** `evidence/2026-11-18/perseed-allyslot3-b-ctl/` + `perseed-allyslot3-b-arm/` (8 files each, 0 instrument errors).
**Proofs:** `scripts/test-allyslot3-b.js` 18/18, `scripts/analyze-allyslot3-b.js --selftest` 10/10, `scripts/test-partyquads-b.js` 29/29 (0 skipped — the live §5q quad-fire leg now runs since PARTYSIZE4 landed) — all green on the rebased tip.

## The lever, in plain words

A four-person hunt can now bring its fourth member into the fight itself. Until now the fourth villager travelled with the party but could not join a fight — the fight only ever fielded two allies. The new slot lets the third ally join when the party is a launched four-person hunt against a big monster, with their own health, gear, strikes and a third call for help. Hunts that were not launched as a four stay capped at two allies everywhere. The slot only exists when the flag is on; it is off in live play.

## What happened

The pilot band (104431–104438, 8 seeds, 150 days, competent play) launched almost nothing: **4 wave-4+ launches per leg** (floor ≥6), of which **1 quad per leg** (seed 104437 both legs — the same quad, a substrate effect, not the lever). The analyzer's field-4 table found **0 launched quad meetings on either leg**, so the primary rate reads 0/0 and the pool floor fails on both its clauses.

| Bar | Result | Detail |
| --- | --- | --- |
| Pool floor (≥6 launches/leg; ≥2 denominator meetings) | **FAIL** | launches ctl 4 / arm 4; arm field-4 denominator 0 |
| Primary field-4 rate (≥0.80 on ally2-joined denominator) | **FAIL (n/a)** | arm 0/0, ctl 0/0; raw rate over all launched quad meetings n/a (0/0) |
| Sense rate (reported) | n/a | arm 0/0, ctl 0/0 |
| Cost — starvation (arm ≤ ctl+2) | **PASS** | total 0 vs 0; villager 0 vs 0 |
| Cost — median survival (arm ≥0.8× ctl) | **PASS** | 150d vs 150d |
| Cost — community loss (arm ≤ ctl+16) | **PASS** | village deaths 646 vs 643 |
| Instrument (0 errors; 8/8 files) | **PASS** | errors ctl 0 / arm 0 |

Per-seed launches (ctl / arm): 104431 0/0, 104432 0/0, 104433 0/0, 104434 1/1, 104435 2/2, 104436 0/0, 104437 1/1 (quad), 104438 0/0. Trio launches 3/3 per leg; quad launches 1/1; partyTrios 3/3; partyQuads 1/1. Carry rate 1.0 both legs (c2 candidates carried 3/3, 0 dropped).

## The one live-fire row — the slot DID fire, the metric cannot see it

The raw corpora hold exactly one fight in the whole panel where a third ally joined: **arm leg, seed 104437, day 133, the Reunion, wave 4**. The holder `app_mgpsphub92` launched a quad on **day 130 against the Herald** (party `ruby_callaghan` + `gen_ph37qf5` + `gen_353ni1r`, partySize 4); three days later the party met the Reunion instead, and all three allies fought: `allyVid app_mgpsphub92`, `ally2Vid gen_ph37qf5`, **`ally3Vid gen_353ni1r`, `ally3Dealt` 23 of 239 total damage** against 1,322 HP, 7 rounds, outcome vFlee. The control leg has zero `ally3Vid` rows anywhere.

The analyzer misses it by construction. `field4Table` in `scripts/analyze-allyslot3-b.js` joins a fight to a quad launch only when the fight's monster **is the launch target**:

```js
if (l.target && e.mid !== l.target) continue;
```

The day-133 fight's target is the Reunion; the launch's target was the Herald — so the join skips it, and the field-4 table stays empty. The same rule also excludes the day-132 congregation meeting on the same seed (alliesN 3, `ally3Vid` null, evade). Off-target meetings — a launched party meeting a different monster than the one it hunted — are invisible to this metric. That is the METRIC-BROKEN mechanism, verified from the raw rows, not a lever failure: the slot fired in live play, on the one occasion the band offered it a fight.

## Wall numbers (arm-2 band, 8 seeds per leg)

| | Control | Arm |
| --- | --- | --- |
| Wins (full seat) | 0 | 0 |
| National scale | 0 | 0 |
| Wave 5 reached | 3 | 3 |
| Wave 4 reached | 8 | 8 |
| Standing ≥200 | 3 | 3 |
| Median survival | 150d | 150d |
| Survived 150d | 5 | 5 |

No village took the full seat on either leg; no village reached national. The legs are trajectory-identical on 7 of 8 seeds (same days and standing); the single divergence is seed 104437 (arm 152d vs ctl 151d) — the quad launch day itself. The lever changed nothing measurable at this pool size, which is the point of the NO-GO: there was nothing to measure.

## What this means for finding #2515

The meeting-party 2-ally cap question stays **open**. The slot exists and fires — one live-fire row proves the mechanism — but the pilot cannot judge its rate (0/0). Two things are now established that were not before: (1) a launched quad can meet a *different* monster than its target and still field the fourth member — the join rule, not the engine, is what hides that; (2) the day-133 row is the first observed three-ally fielding anywhere (`alliesN` 3, `ally3Dealt` 23), which bears on finding #2559 (quad fights cap at the usual ally count): the cap lifts when the slot is on, but at n=1, with the party still fleeing after dealing 239 of 1,322 HP, the damage question belongs to the fightcap arm, not this one.

## Metric review

- **No metric was re-scored.** The verdict stands as NO-GO METRIC-BROKEN under the frozen prereg. The frozen prereg already anticipated this outcome: "If the floor fails, the verdict is METRIC-BROKEN and the arm returns to the queue with a launch-richer band — it is not re-scored on the sense rate."
- **Join-definition decision owed (finding #2564):** the next run must decide whether the field-4 join drops the `target == mid` rule (keep the 21-day window + launch-party membership, count off-target meetings) or keeps the strict join and re-runs on a launch-richer band. The day-133 row is the test case: under the loose join it counts as 1/1 fielded; under the strict join the pilot stays blind to exactly the fights the slot exists for.
- **Pool floor set above the measured pool (finding #2566):** the frozen prereg set the launch floor at ≥6 launches/leg on a band measured at 4 launched meetings per 8 seeds ("richest candidate"). The band delivered 4/4 — the floor was unreachable before the first sim ran. The next prereg must set the floor from the band's measured launch rate (the partysize4-rerun lesson: floor from measured 48, delivered 29).
- **The 3rd-ally damage question is unmeasured at n=1 (finding #2567):** one fight, 23 damage, party fled after 7 rounds. The slot firing does not imply quads win more; the damage share belongs to the fightcap arm.
- **Substrate note:** both legs carry PARTYSIZE4=1 as substrate, so the single quad launch (104437) fired identically on both legs — the pilot measured the slot, not the quad. The PARTYSIZE4 lever itself landed on master in this run via arm 1 (commits `1032897dc` + `a9a4108fe`, env-gated `PARTYSIZE4=1`, default OFF) — see finding #2565.

## Landing

Evidence only. Lever commit `ddc7e78ed` and substrate commit `f97f61922` stay on branch `sim-allyslot3-b` (HELD). The branch is preserved, not deleted. The sense-fix substrate is already upstream on master via the arm-1 landing path; the PARTYSIZE4 substrate commits were dropped in rebase as already upstream.
