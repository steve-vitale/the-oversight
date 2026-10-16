# sim-feastcost-b — feast-economy cost lever (loop B, food-economy axis, 2026-10-16)

Worker: sim-feastcost-b. Substrate: FEASTSCALE_R13=1 both sides, own paired
control, identical seeds. Lever code: src/js/standing.js standingCfg()
(plentyPerFeast: 20 unchanged; plentyPerFeastQ1: 10 when FEASTCOST=1, 20 when
gate-off — byte-identical credit to pristine). villageStanding() credits a
legend (quality 2) the full +20 and a fine feast (quality 1) the half credit;
quality-0 still counts 0. Gate default OFF (browser `process` undefined →
always false). Canon: docs/CANON.md + docs/PRESERVATION.md read first — the
lever taxes the standing credit of feasts, not the feast's food, cost, or
narration; the preservation ladder is untouched.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — written before any seed ran)

- **The brief's measured gap** (evidence/2026-10-15/sim-standecon.md): t4=100
  is "nearly free" on the bread road — 5 major feasts (quality>=1) open wave
  4 at +20 each; 13/13 day-80+ runs unlocked vs the ~30–50% intent; earliest
  d55 (leadfeast s33, pure bread). The brief names the food-economy lever
  explicitly: the feast economy itself (the quality>=1 threshold / feast
  cost). The same feast economy that makes t4 nearly free is what carries
  villages to scale — food surplus → standing → scale is one pipeline.
- **Lever design (one variant, small):** scale plentyPerFeast by quality.
  Fine feasts (quality 1 — the measured 2.0/day grind rate) credit half;
  legends (quality 2 — variety/centerpiece + witnesses, the real
  food-culture investment) keep the full +20. Rationale over the
  alternatives: raising feastQualityMin to 2 would delete the fine-feast
  grind outright (risks collapsing the bread road and failing the scale
  guardrails); raising the feast's kcal cost would touch player-facing food
  economy and the devotion/surge chain. This variant taxes exactly the
  standing credit the brief flagged, keeps every feast firing, and keeps
  the aspirational ceiling (legends) intact.
- **Primary metric (BOTH must hold):**
  - P1: bread-standing gain rate (standing/day pre-w4) down ≥20% on
    identical seeds — paired mean ratio armed/control ≤ 0.8.
  - P2: median w4-unlock day pushed ≥+7d (armed median − control median).
- **GO threshold:** P1 AND P2 hold, plus all guardrails below.
- **MISS (NO-GO):** P1 or P2 miss, or any guardrail miss → NO-GO; killed at
  pilot, layer deleted per kill protocol (zero trace: standing.js reverted,
  instruments + evidence remain).
- **Horizon:** 180d, death-aware (+10d tail). Why: the question is whether
  the bread road's standing gain slows and the w4 bar moves on runs that
  live long enough to knock; short deaths census at their own numbers.
- **Seeds:** 8 fresh seeds (101–108) × 2 policies = 16 runs/arm; control and
  armed paired on identical seeds. Confirm (if GO): 12–16 fresh seeds.
- **Policies:** leadfeast (leadcourt + feastscale r13), belongfeast
  (belongseek + feastscale r13) — the census-established shape.
- **Guardrails:**
  - G1: national+ (armed) ≥ control−2
  - G2: table (armed) ≥ control−2
  - G3: median survival (armed) ≥ control−10d
  - G4: no new death mode (endReason distribution comparison)
  - G5: feasts still fire — median feast count armed ≥ 0.8 × control
    (the lever taxes cost; it must not delete the behavior).
- **Secondary:** q1/q2 feast mix at unlock (how much of the 2.0/day bread
  rate is fine vs legend); wall numbers per arm (national/table/wave 4–5/
  median survival/exiled); sense read of feast beats on the armed arm.
- **Instrument:** scripts/feastcost-sweep-20261016.js (paired sweeps, rows
  every 5d + unlock transitions, feastLog quality mix sampled, light
  feast-keyword say capture). Proof: scripts/test-feastcost-20261016.js
  (RED→GREEN 2026-10-16: armed fixture 90 vs pristine 140 — 2 armed
  assertions fail on reverted code; gate-off 9/9 GREEN).

## PART A — pilot results

**VERDICT: NO-GO — killed at pilot.** P1 held with wide margin; P2 missed
by a mile. Per the binding pre-registration (§14 anti-drift: a miss is
NO-GO, never re-scored), the lever is killed. Layer deleted: src/js/standing.js
reverted to HEAD, byte-identical (game code untouched by this run's end).
Instruments (scripts/feastcost-sweep-20261016.js,
scripts/test-feastcost-20261016.js) + evidence rows land.

32 runs: 8 fresh seeds (101–108) × {leadfeast, belongfeast} × {control,
FEASTCOST=1 armed}, 180d death-aware, FEASTSCALE_R13=1 both sides, paired
on identical seeds. 0 instrument errors across 32 runs.

### The q1/q2 mix (what the lever actually taxes)

The census could not see per-feast quality; this pilot sampled it. On
these roads **~90%+ of credited feasts are quality 1 (fine)** — legends
(quality 2) are rare: leadfeast control final mix q1=9,q2=0 (s101),
q1=11,q2=2 (s102); belongfeast all-q1 on 7/8 runs. The lever halves the
bread rate by design — the brief's "quality>=1 threshold / feast cost"
was the right target for P1.

### P1 (bread gain rate down ≥20%, paired): GO — mean paired ratio 0.514

plenty@unlock-row / unlockDay, per seed, armed vs control:

| seed/road | control | armed | ratio |
|---|---|---|---|
| 101 leadfeast | 1.791 | 0.896 | 0.500 |
| 102 leadfeast | 2.105 | 1.316 | 0.625 |
| 103 leadfeast | 1.842 | 0.921 | 0.500 |
| 104 leadfeast | 1.786 | 0.877 | 0.491 |
| 105 leadfeast | 1.460 | 0.730 | 0.500 |
| 106 leadfeast | 1.270 | 0.635 | 0.500 |
| 107 leadfeast | 1.205 | 0.602 | 0.500 |
| 108 leadfeast | 1.754 | 1.053 | 0.600 |
| 101 belongfeast | 1.940 | 0.970 | 0.500 |
| 103 belongfeast | 1.772 | 0.886 | 0.500 |
| 104 belongfeast | 2.353 | 1.176 | 0.500 |
| 105 belongfeast | 1.887 | 0.893 | 0.473 |
| 107 belongfeast | 2.340 | 1.170 | 0.500 |
| 108 belongfeast | 0.930 | 0.465 | 0.500 |

Road means: leadfeast 1.652 → 0.879 (0.53); belongfeast 1.863 → 0.927
(0.50). The unit proof confirmed the mechanism live: armed s101 d67
plenty 60 (6 q1 × 10) vs control 120 (6 × 20), identical feast log.

### P2 (median w4-unlock day pushed ≥+7d): MISS — +0d / +1d

- leadfeast: control w4 days [56,57,67,76,76,83,126,137] med **76**; armed
  [57,57,67,76,76,83,126,137] med **76**. Delta **+0d**.
- belongfeast: control [53,55,79,85,86,94,134] med **85**; armed
  [56,79,85,86,94,134] med **86**. Delta **+1d**.

Seed-paired unlock days are near-identical (s101–s108 mostly ±0d; biggest
paired move +3d on belongfeast s105, and s106 armed never unlocked vs
control d55). The census brief already said it: "the faced-deferral (3
wave-3 kinds) does the actual pacing work — days-to-w4 spans d55–149
mostly on deferral + survival, not on the 100." Halving the bread credit
moves the bread math, not the bar's clock. Teeth at the margin only:
belongfeast s105 armed died d82 (control d147); s106 armed died d111
without unlocking (control unlocked d55); leadfeast s104 armed missed w5
(bread couldn't crest the cap). Fragile runs feel it; the median doesn't.

### Guardrails (all held — recorded, not re-scored)

- G1 national+: leadfeast 7 armed vs 7 control; belongfeast 2 armed vs 1
  control ✓
- G2 table: 8/8 + 7/8 armed = 15/16 both arms ✓
- G3 median survival: leadfeast 139 vs 141 (−2 ≥ −10); belongfeast 119 vs
  125 (−6 ≥ −10) ✓
- G4 death modes: {village-lost:7, survived:1} / {village-lost:8} in BOTH
  arms — byte-identical distribution, no new mode ✓
- G5 feasts still fire: median feast count 10 both arms (armed mixes
  ~9 q1 + ~1 q2, same firing behavior) ✓

### Sense verdict (SENSE-TESTING LAW)

Read the armed feast beats (leadfeast s101, the instrument's feast-keyword
capture): the d26–27 feast reads as a village choosing to feast — the
pantry opens wide with named foods ("4× Foraged food, 2× Expedition
haul"), guests eat, the System televises it, the scavenger draw follows
the smell honestly, the devotion chain rides the ritual, and the buff
expires with the night. The lever changed only the standing credit (a
number in the readout), never the feast's cost, food, or narration — no
silent branches, no dishonest beats. The d56/d57 armed standing line
names it straight: "Standing 50 (war 0 · bonds 0 · bread 50) — wave 4 at
100, wave 5 at 200", then bonds carry the unlock at d57. Feasts still
feel like feasts; only the ledger got cheaper bread.

### Wall numbers (feastscale courtship substrate, per arm — scale wall)

| | national+ | table | wave 4 | wave 5 | median survival | exiled |
|---|---|---|---|---|---|---|
| control | 8/16 (7 lead nat/global + 1 belong) | 15/16 | 15/16 | 9/16 | 130d | 0 |
| armed | 9/16 (7 + 2) | 15/16 | 14/16 | 7/16 | 122d | 0 |

The wall is down on this substrate either way; the lever moved none of it.

## Metric review (§14)

P2 assumed the bread credit was pacing-binding for the wave-4 bar. The
census brief (2026-10-15) already measured otherwise — deferral +
survival pace unlocks — and this pilot confirms it on fresh seeds:
unlock days are seed-identical across arms while the bread math halves.
P2 was the wrong instrument for this question, not the lever's failure:
the lever did exactly what it was designed to do (halved the bread
gain rate, P1 at 0.514) and the bar's clock didn't care. For the NEXT
run, a design-honest primary would measure the bread share at unlock or
standing surplus at deferral release, not median unlock day. Also: P1's
20% threshold was too loose given the ~90% q1 mix — any quality-tiered
tax lands near 50% by construction; a future arm should pre-register a
tighter band (e.g. 0.45–0.55) if re-running. No mid-run re-scoring —
this run is NO-GO as pre-registered.

## Village assessment (food-economy axis)

The villages looked like the census's: courtship roads that feast their
way to standing, die mostly to mid-game violence (median survival ~130d),
and reach national/global on the lead road while belongfeast stalls at
regional. The feast economy is the bread road's entire engine — 9+ fine
feasts per run, legends nearly absent. The blank this run fills: the
feast-quality distribution at unlock (new data: ~90% quality 1) and the
honest verdict that taxing the bread credit is a real lever on the
standing economy (0.514 paired) that does not move the wave-4 bar —
because the bar's pacing is the faced-deferral, not the 100. The food
economy carries villages to scale regardless (wall numbers unchanged);
the brief's "food surplus → standing → scale is one pipeline" stands,
and the pipeline's throughput dial is elsewhere.
