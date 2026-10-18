# ARM — Dinner-reserve cut revival (game-code, food-economy) — 2026-10-18

Run: oversight-flesh-out-loop-b fleshout-loop-b-20261018T0830Z, arm worker (dinreserve-b2), worktree sim-dinreserve-b2.
Axis: FOOD-ECONOMY. Revival of the 2026-10-13 sim-dinreserve-b arm (KILLED AT
PILOT — rot share +0.0pp vs −10pp GO) on current master (base 28408259).

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12, 14, carried forward)
- **Primary metric:** fresh-rot share = rot:fresh / (rot:fresh + rot:preserved),
  in percentage points, summed over the suite — armed −10pp vs identical-seed baseline.
- **GO threshold:** fresh-rot share −10pp AND median survival ≥ control −10d
  (one-sided — §14 revision from 2026-10-13 metric review; the favorable
  +21d technically missed the old two-sided band) AND starveDays/100d delta ≤
  +1.0 (normalized — §14 revision; raw starveDays is confounded with run
  length). No arm-attributable preserved-rot laundering.
- **KILL conditions:** rot share moves <5pp | median survival regresses >10d |
  any arm-attributable laundering (smoking a spoiled item).
- **Horizon:** 180d death-aware. **Seeds:** 17011–17018 (verified zero overlap
  with every SEEDS= list grepped in evidence/; original used 11/22/…/88) ×
  {leadfeast, belongfeast} = 16 runs per side, IDENTICAL seeds both sides.
- **Opt-in gates:** FEASTSCALE_R13=1 / SEATDRIVE=0 explicit, asserted by the sweep script.
- **Death instrument:** kind-aware (findings #517/#525): captures registerDeath
  kind, filters to person/villager only (monster kills pollute the share),
  dedups on (who,day,cause).
- **Convergence state at plan:** food-economy = converging; scale-onramp = blocking (loop A).

## The lever (docs/PRESERVATION.md canon; game.js duty-time cook drive ONLY)
The village cook's duty-time smoke-racks drive (resolveOneAssignment, 'cook'
task) keeps `reserve = 250 * roster` kcal of soonest-spoiling fresh as the
dinner reserve. Measured pantry draw is ~125/person/night — the reserve is
~2x the real draw, so the reserve itself rots while the drive smokes blind
around it. The lever: reserve 250→125 kcal/person (make-the-call: 125 = one
night of the ACTUAL draw; documented for Steve's overrule). Racks-full guard,
eligibility window, rates, and budget all unchanged. Canon: dinner-first
holds — one real night, not two.

Mechanism check on current master (before any sims): game.js:6595 still
`reserve = 250 * roster`; the laundering guard (`isSpoiled(it, 0)` skip) that
was a documented blank in 2026-10-13 has since landed. Premise INTACT.

## Proof test
scripts/test-dinreserve-b2.js (revival of the original fixture: crafted
pantry 3,000 kcal near-expiry fresh + one spoiled stack, roster 12).
- Pristine: REAL RED — dutyPreserved=0 (keeps the whole pile fresh),
  laundered=0, dinnerCooked=true.
- Armed: GREEN — dutyPreserved=1200 (1,500 kcal excess × 0.80 blind = 1200),
  laundered=0, dinnerCooked=true.

## Sweep results

Corpus (16 runs/side, identical seeds 17011–17018 × {leadfeast, belongfeast},
180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0 asserted by the sweep script):
`evidence/2026-10-18/perseed-dinreserve-b2/` — all four sweep JSONs plus
aggregate files. Runtime: ~30m (two concurrent policy sweeps on a contended
box; both exit 0).

Verdict table (scripts/analyze-dinreserve-b2.js, §14 binding):

| gate | control (16) | armed (16) | delta | verdict |
|---|---|---|---|---|
| fresh-rot share | 91.3pp | 91.0pp | **−0.2pp** (GO ≤−10pp) | FAIL — **KILL FIRED** (moves <5pp) |
| median survival | 173d | 180d | **+8d** (GO ≥−10d one-sided) | PASS |
| starveDays/100d | 19.6 | 18.7 | **−0.9** (GO ≤+1.0) | PASS |
| laundered | 0 | 0 | — | PASS (no arm-attributable laundering) |

Duty throughput moved 2,399k → 2,791k kcal (+392k, +16%) — the lever did fire:
the cook put more fresh on the racks. But rot:fresh rose 3,421k → 3,758k and
rot:preserved 327k → 371k in lockstep, so the SHARE didn't move. The lever
attacked the reserve; the binding constraint is the racks-full guard (see
Sense-testing and Metric review).

By policy: control — belongfeast 94.1pp share/1,292k duty/170d medSurv,
leadfeast 90.1pp/1,106k/173d. Armed — belongfeast 91.0pp/1,578k/180d,
leadfeast 91.1pp/1,213k/166d. Policy interaction ~nil; the primary metric is
flat under both policies.

TELEMETRY DEVIATION CHECK (run bookkeeping): telemetry-check vs
scale-wall.json on (national,table,wins,exiled) fired one LOUD —
"wins disappeared: baseline 16 -> current 0". Investigated same-run:
NOT an arm effect. Control side is also 0/16 wins on these seeds; the
scale-wall baseline's wins:16/16 comes from a different suite regime (a
100%-win suite) and is not comparable count-wise to this 16-seed lever
suite. Filed as a measurement-infra note in the findings backlog — the
baseline file needs a suite-regime label, else every lever run will re-fire
this line.

## Wall numbers (scale-wall reporting, armed side)

| metric | control (16) | armed (16) |
|---|---|---|
| national reached | 7/16 | 11/16 |
| table reached (waiting or won) | 12/16 | 15/16 |
| wins | 0/16 | 0/16 |
| wave 4 unlocks | 1/16 | 0/16 |
| wave 5 unlocks | 0/16 | 0/16 |
| median survival | 173d | 180d |
| max survival | 180d | 180d |

The wall stands: zero wins on both sides, wave 3 is the ceiling (32/32 runs
maxWave ≤ 3). National/table reach ticked up with armed, but that rides on
+8d survival (more days alive = more chances to rank up), not on food being
fixed. This arm does not attack the wall.

## Death-cause shares (kind-aware instrument: person/villager only, deduped
on (who,day,cause))

Armed (16 runs): combat:96, monster:49, "a wound that wouldn't close":11,
ambush:5, sickness:4, contest:4, lockjaw:2, Rut King:2.
Control (16 runs): combat:80, monster:52, contest:10, "a wound that wouldn't
close":9, starvation:6, ambush:5, "the night":2, sickness:2.

Pattern: blow-by-blow fighting kills dominate both sides (combat+monster =
145/165 armed, 132/168 control — the "fought, not rolled" law is visible).
Starvation is NOT the killer here (6 control, 0 armed) — the food economy
feeds the village but doesn't carry it past wave 3. Named-monster kills
(Rut King ×2, Flashbulb Moth, Cliffhanger, The Loud Beast) appear on both
sides — real fights, real deaths. The 17017 seed is the collapse seed on
both sides (wounds + sickness + starvation compounding ~day 150+).

## Village assessment (plain words)

Two villages, same seeds, 180 days. On both sides the village lives long
(arms median 180d), eats dinner every night, smokes its racks, buries
8–16 people per run to combat and monsters, and dies at wave 3 — either
lost to the field or stuck at global/national rank with nothing left to
climb. Nobody starved out; the village that lost hardest (17017, both
sides) died of wounds and sickness in the field, not an empty pantry.

The cook worked. With the reserve halved the duty cook put ~16% more fresh
on the smoke racks (2.8M vs 2.4M kcal across the suite) and narrated the
choice honestly every time. The pantry did not notice: racks fill, racks
rot uneaten, the reserve math was never the bottleneck. The lever pulled a
string that wasn't tied to anything. If the 2026-10-13 pilot killed the
same arm on +0.0pp, this revival confirms it on −0.2pp: the dinner-reserve
number is not a lever on rot share. The thing that looks like a blank —
racks-full before the reserve matters — is documented below for the next
arm, not filled here.

## Blanks filled or documented

- FILLED: proof test scripts/test-dinreserve-b2.js (pristine RED / armed
  GREEN), sweep scripts/sweep-dinreserve-b2.js (asserts opt-in gates,
  kind-aware death instrument, laundering detection), analyzer with the
  §14 judge. All four sweep JSONs committed under
  evidence/2026-10-18/perseed-dinreserve-b2/ — the corpus lives in the repo.
- DOCUMENTED (for the next arm, NOT chased mid-run): the racks-full guard
  appears to be the binding constraint on preservation throughput — the
  reserve cut freed ~1,500 kcal/person of fresh for smoking, but duty
  throughput only rose 16% and rot:preserved rose with it. Candidate next
  lever: racks capacity (smoke-racks cap) or feast-draw scaling, measured
  against rot:preserved absolute rather than the share. Left to the
  coordinator's next plan.
- DOCUMENTED: the laundering guard (`isSpoiled` skip in the duty drive)
  that was a blank in 2026-10-13 has landed on master; laundered=0 both
  sides. Closed by drift, verified here.
- DOCUMENTED: scale-wall.json baseline (wins:16/16) is not regime-labeled —
  every lever suite re-fires its "wins disappeared" LOUD. Filed in
  hidden_files/sim-findings.md (measurement-infra, coordinator-owned).

## Sense-testing

scripts/sense-cookbeats-b2.js, seed 17013 / leadfeast / armed tree, 40 days:
92 cook beats captured. Three beat shapes, every one narrated with a named
cook and a reason:

1. `🍲 Nwachukwu cooked for the haven — meals stretched.` (19x)
2. `… Nwachukwu worked the smoke racks too — 3 batches preserved (~1057 kcal, keeps a couple of weeks).` (27x)
3. `… The racks are already full (~N kcal kept — more than the haven can eat before it turns), so Nino left the fresh pile for tonight's dinner instead of smoking it onto the rot pile.` (37x)

SENSE VERDICT: the cook reads like a person taking stock for tomorrow's
dinner, not a robot. The racks-full beat names the tradeoff honestly
("left the fresh pile for tonight's dinner instead of smoking it onto the
rot pile") — the duty drive tells the player WHY it stopped. Cooks rotate
across duty days (Nwachukwu → Paul → Nino → Rachel), which reads as duty
rotation, plausible. Two soft robotic notes, neither a blank: "meals
stretched" repeats verbatim on every beat; the kcal figures in the racks-full
beat are scrubbed in the report but render in-game — fine either way.

Notably, the racks-full beat is the MOST common (37/92) on the ARMED tree —
the lever freed fresh for smoking, and the racks-full guard is what absorbs
it. This corroborates the quantitative finding above: the reserve was never
the bottleneck.

## Metric review (§14)

The pre-registration binds: KILL FIRED, arm dead, no re-score. Under
"metric review" for the NEXT run: the fresh-rot share (rotF/(rotF+rotP)) is
confounded with survival length — villages that live longer cycle more food,
so rotF and rotP both scale with days alive and the share sits at ~91pp no
matter what the reserve does. A better primary for the next preservation
arm: rot:preserved ABSOLUTE per 100 days alive (armed 18.7-scaled: ~0.6M/100d
vs control ~0.58M/100d — still small, but the right unit), or duty
throughput minus rot:preserved (preservation that actually gets EATEN).
Also: measure at the racks-full constraint directly (cap sweeps), not the
reserve. Propose revisions in the next run's header; they do not touch this
verdict.
