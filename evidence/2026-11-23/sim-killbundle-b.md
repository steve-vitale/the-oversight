# sim-killbundle-b — KILLBUNDLE=1 JUDGED ON THE KILL-LOOT PATH

- Arm: sim-killbundle-b, Loop B run fleshout-loop-b-20261123T1430Z, arm 1 of 2.
- Axis: winnability-chain · Finding: sim-findings.md `[claimed]` — KILL-LOOT
  GUNS ARRIVE DRY AND NEVER FIRE (killarrive-b §9).
- Base: worktree HEAD `23746a0f1` at band time (prereg + STAGE_SEAR hook +
  arm test; branch `sim-killbundle-b`). No game-code change in this arm —
  the lever landed in sim-killlootbundle-a (`48c1a692a`); this arm judges it.
- Prereg: `evidence/2026-11-23/sim-killbundle-b-prereg.md` (content
  frozen ~14:30 UTC, committed `23746a0f1` before any judged seed ran).
- Instrument: `scripts/killlootbundle-driver-a.js` (+ STAGE_SEAR hook,
  frozen in the prereg) + `scripts/analyze-killlootbundle-a.js` reused
  UNCHANGED from the killloot16 / killrate / killarrive arms; tier tally
  `scripts/test-killrate-analysis-a.js`; arm test
  `scripts/test-killbundle-b.js` (NEW); panel builder
  `scripts/build-killlootbundle-panels-a.js`.
- Horizon: 150d death-aware. Matched seeds: 107533–107581 (49, the
  killarrive band, reused BY DESIGN). Staged seeds: 107533–107548 (16,
  subset of the matched band). Policy: competent (verbatim). Two legs:
  matched armed (KILLBUNDLE=1) + staged (KILLBUNDLE=1 + STAGE_SEAR=1).
  Substrate: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`.

## Verdict: GO — the bundle loads the gun, and a loaded gun fires (when the game lets it)

The bundle does exactly what it promises, on every arrival it touches:
**17 of 17 armed kill-loot arrivals carried exactly 2 cells** (1
natural on the matched leg, 16 forced on the staged leg, 0 dry).
And a loaded kill-loot gun DOES fire: **2 of the 16 staged holders
fired** — Emma Larsen on seed 107539, day 51, wave-4 suburb, 2 shots,
1 hit, 68 damage; Caleb Jones on seed 107542, day 100, wave-5 spoiler,
2 shots, 2 hits, 132 damage — each spending both cells in a single
volley, exactly the contest-gun shape (2 shots, 64–68 damage per
volley on this band). Per-arrival fire rate 2/16 = **12.5%** (Wilson
95% CI 3.5–36.0%).

The matched leg is the honest caveat, diagnosed not hidden: the
single natural arrival (Jorge Silva, seed 107533, day 19 — the same
arrival killarrive-b found dry) arrived bundled this time, carried
its 2 cells for 69 days through the same 15 fights, and fired **0
shots** — because all 15 of his fights were waves 1–3, and CELLGATE
(fieldFights.js, part of the frozen substrate) holds a searcaster's
fire below wave 4 to save the cells for harder prey. His fire
probability under CELLGATE was exactly 0, not a matter of chance:
the hold line ("holds the Searcaster — the beast is below wave 4,
and the cells are saved for harder prey") fired on every one of his
15 volleys, ammoLeft 2 throughout. The bundle fixes arrival
dryness; it does not fix fire frequency — a kill-loot holder only
ever fires if they live to fight a wave-4+ monster while still
holding the gun. On this band that happened for 2 of 16 staged
holders and 0 of 1 natural ones. And once the 2 cells are spent,
the gun is dry forever: **no holder re-armed anywhere** in any of
the three corpora (see §5).

## Frozen-bar table (prereg §7)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| 1. Instrument validity (proof 12/12 + selftest 17/17 + killrate 36/36 + analysis 14/14 + killarrive-b 12/12 + killbundle-b 11/11 + live 11/11 on this base; 0 errors on all 49 armed + 16 staged files; single anchor + policySha on every file in each corpus) | all must hold | proof 12/12, selftest 17/17, killrate 36/36, analysis 14/14, killarrive-b 12/12, killbundle-b 11/11 pre-run + 11/11 live; armed corpus validation PASS (49 files, anchor `23746a0f1`, policySha match, 0 errors); staged corpus validation PASS (16 files, same anchor, 0 errors) | ✅ |
| 2. Cells-at-arrival (every kill-loot searcaster arrival in the armed leg AND the staged leg carries exactly 2 cells) | klBundled == klArrivals, klDry == 0, per leg | armed 1/1 bundled, staged 16/16 bundled, 0 dry anywhere | ✅ |
| 3. Primary, matched leg (armed-leg kill-loot volleys ≥ 1 vs ctl 0) | ≥ 1, or inconclusive | 0 volleys from 1 arrival — FAILS as a bar, diagnosed in §4 (all 15 fights wave < 4, CELLGATE held every one) | ❌ (miss, diagnosed) |
| 4. Primary, staged leg (staged-leg kill-loot volleys ≥ 1 across 16 forced armed arrivals) | ≥ 1 for GO | 2 volleys (d51 wave-4 suburb 2 shots/1 hit/68 dmg; d100 wave-5 spoiler 2 shots/2 hits/132 dmg); per-arrival rate 2/16 = 12.5% (Wilson 3.5–36.0%) | ✅ |
| 5. Tier-4 no-regression (armed-leg tier-4 rate inside ctl Wilson 5.5–10.8%) | must hold for GO | armed 31/399 = 7.77% — byte-identical to ctl (same 31 rolls, same seeds) | ✅ |
| 6. Guardrails (analyzer --compare ctl vs armed: starv delta ≤ +2, median-survival delta ≥ −20) | must hold for GO | starv 16 = 16 (delta 0); median survival 149 = 149 (delta 0) | ✅ |
| 7. Balanced panel (§15) (ctl vs armed 49 seeds; compare completes; decision review_required; every metric status ∈ {descriptive, no_material_signal, not_observed, insufficient}) | must hold for GO | decision review_required; statuses: 1 descriptive, 6 no_material_signal, 24 not_observed; every paired delta 0 | ✅ |
| 8. Re-arm record + sense-test delivered | must be delivered | §5 (no re-arm anywhere) + §4 (sense-test) | ✅ |

**Verdict rule (frozen, prereg §7):** GO = bars 1, 2, 5, 6, 7 pass AND
(bar 3 passes OR bar 4 passes). Bar 3 fails, bar 4 passes → **GO**,
with the matched miss diagnosed in §4. This is not a re-score: the
rule was frozen before any judged run for exactly this expected
outcome (μ ≈ 2.25 natural arrivals; the pilot already showed 1).
Note the analyzer's own `--compare` verdict reads NO-GO — that is
its narrower pilotGO rule for the matched pair alone (arm klVolleys
≥ 1 on the matched leg), not the arm's frozen rule. The two verdicts
answer different questions; the arm's question is the prereg's.

## 1. Per-seed table, matched armed leg (analyzer + tier tally; days = driver days)

| Seed | Days | End | Wave | Standing | Deaths | Contests | Prize rolls | Contest sear grants | Kill-loot events | Tier-4 rolls | Kill-loot sear | Bundled | Sear volleys | KL volleys |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107533 | 129 | village-lost | 4 | 199 | 137 | 17 | 26 | 0 | 10 | 2 | 1 | 1 | 0 | 0 |
| 107534 | 129 | village-lost | 4 | 199 | 84 | 13 | 20 | 0 | 8 | 1 | 0 | 0 | 0 | 0 |
| 107535 | 150 | survived | 4 | 199 | 93 | 17 | 22 | 3 | 8 | 2 | 0 | 0 | 0 | 0 |
| 107536 | 135 | village-lost | 5 | 275 | 118 | 10 | 16 | 1 | 15 | 1 | 0 | 0 | 1 | 0 |
| 107537 | 150 | survived | 5 | 345 | 77 | 14 | 19 | 2 | 6 | 2 | 0 | 0 | 0 | 0 |
| 107538 | 150 | survived | 4 | 199 | 61 | 17 | 31 | 2 | 1 | 0 | 0 | 0 | 0 | 0 |
| 107539 | 83 | village-lost | 4 | 199 | 126 | 9 | 13 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |
| 107540 | 150 | survived | 5 | 545 | 132 | 17 | 24 | 1 | 12 | 0 | 0 | 0 | 0 | 0 |
| 107541 | 142 | village-lost | 5 | 430 | 103 | 22 | 31 | 1 | 8 | 0 | 0 | 0 | 0 | 0 |
| 107542 | 95 | village-lost | 4 | 175 | 91 | 8 | 8 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |
| 107543 | 150 | survived | 5 | 435 | 121 | 20 | 22 | 1 | 12 | 1 | 0 | 0 | 0 | 0 |
| 107544 | 119 | village-lost | 4 | 150 | 68 | 10 | 11 | 0 | 5 | 1 | 0 | 0 | 0 | 0 |
| 107545 | 150 | survived | 4 | 150 | 53 | 19 | 25 | 0 | 6 | 2 | 0 | 0 | 0 | 0 |
| 107546 | 150 | survived | 4 | 199 | 76 | 22 | 25 | 0 | 6 | 1 | 0 | 0 | 0 | 0 |
| 107547 | 76 | village-lost | 4 | 199 | 74 | 8 | 14 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |
| 107548 | 150 | survived | 5 | 610 | 79 | 20 | 32 | 1 | 5 | 1 | 0 | 0 | 0 | 0 |
| 107549 | 150 | survived | 4 | 199 | 100 | 15 | 18 | 1 | 7 | 0 | 0 | 0 | 0 | 0 |
| 107550 | 135 | village-lost | 5 | 390 | 94 | 16 | 18 | 0 | 8 | 2 | 0 | 0 | 0 | 0 |
| 107551 | 150 | survived | 5 | 580 | 167 | 16 | 23 | 1 | 5 | 0 | 0 | 0 | 0 | 0 |
| 107552 | 150 | survived | 5 | 510 | 84 | 13 | 19 | 0 | 3 | 1 | 0 | 0 | 0 | 0 |
| 107553 | 150 | survived | 5 | 415 | 92 | 16 | 21 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |
| 107554 | 92 | village-lost | 4 | 199 | 76 | 8 | 12 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |
| 107555 | 144 | village-lost | 5 | 385 | 87 | 15 | 20 | 1 | 7 | 1 | 0 | 0 | 0 | 0 |
| 107556 | 79 | village-lost | 4 | 195 | 90 | 8 | 13 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |
| 107557 | 123 | village-lost | 5 | 480 | 110 | 13 | 22 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |
| 107558 | 150 | survived | 5 | 650 | 152 | 17 | 18 | 1 | 13 | 1 | 0 | 0 | 1 | 0 |
| 107559 | 149 | village-lost | 4 | 199 | 162 | 17 | 19 | 2 | 22 | 1 | 0 | 0 | 0 | 0 |
| 107560 | 81 | village-lost | 4 | 199 | 91 | 8 | 6 | 2 | 9 | 0 | 0 | 0 | 0 | 0 |
| 107561 | 150 | survived | 4 | 199 | 91 | 16 | 21 | 0 | 8 | 1 | 0 | 0 | 0 | 0 |
| 107562 | 87 | village-lost | 4 | 199 | 52 | 10 | 12 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 107563 | 150 | survived | 4 | 199 | 68 | 20 | 20 | 1 | 3 | 0 | 0 | 0 | 0 | 0 |
| 107564 | 150 | survived | 4 | 199 | 93 | 25 | 39 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |
| 107565 | 150 | survived | 4 | 199 | 79 | 21 | 25 | 1 | 2 | 0 | 0 | 0 | 1 | 0 |
| 107566 | 150 | village-lost | 5 | 475 | 126 | 12 | 13 | 1 | 14 | 0 | 0 | 0 | 1 | 0 |
| 107567 | 150 | survived | 4 | 199 | 90 | 13 | 18 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |
| 107568 | 150 | survived | 4 | 199 | 112 | 10 | 15 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |
| 107569 | 150 | survived | 4 | 199 | 64 | 19 | 31 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 107570 | 150 | survived | 5 | 390 | 149 | 19 | 26 | 0 | 18 | 4 | 0 | 0 | 0 | 0 |
| 107571 | 118 | village-lost | 4 | 199 | 93 | 11 | 22 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |
| 107572 | 121 | village-lost | 5 | 335 | 77 | 13 | 18 | 1 | 5 | 0 | 0 | 0 | 0 | 0 |
| 107573 | 150 | survived | 5 | 300 | 112 | 15 | 21 | 1 | 9 | 1 | 0 | 0 | 0 | 0 |
| 107574 | 110 | village-lost | 4 | 199 | 102 | 17 | 23 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |
| 107575 | 103 | village-lost | 4 | 199 | 85 | 13 | 18 | 0 | 13 | 2 | 0 | 0 | 0 | 0 |
| 107576 | 113 | village-lost | 4 | 165 | 36 | 14 | 18 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| 107577 | 146 | village-lost | 4 | 199 | 109 | 21 | 27 | 1 | 5 | 0 | 0 | 0 | 0 | 0 |
| 107578 | 138 | village-lost | 5 | 325 | 92 | 17 | 29 | 0 | 15 | 1 | 0 | 0 | 0 | 0 |
| 107579 | 117 | village-lost | 4 | 199 | 115 | 12 | 13 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |
| 107580 | 150 | survived | 4 | 199 | 100 | 23 | 44 | 1 | 12 | 1 | 0 | 0 | 0 | 0 |
| 107581 | 150 | survived | 4 | 199 | 61 | 22 | 33 | 1 | 4 | 1 | 0 | 0 | 0 | 0 |

Totals: 399 kill-loot events, 31 tier-4 rolls (7.77%), 1 kill-loot
searcaster (bundled), 30 contest searcaster grants, 4 searcaster
volleys (8 shots, all from contest guns — seeds 107536, 107558,
107565, 107566, each exactly 2 shots), 4,704 deaths, 16 starvation
deaths, 0 instrument errors. (Analyzer `days` reads 151 on survived
seeds vs the driver's 150; same 1-day quirk as killrate-a /
killarrive-b. No bar turns on it.)

The armed per-seed table is row-for-row identical to the ctl table
(killarrive-b §1) on every compared key (days, end, wave, standing,
deaths, contests, prize rolls, contest grants, kill-loot events,
tier-4 rolls, sear volleys — verified programmatically across all
49 seeds): the bundle changed nothing upstream of the arrival. The
only differences in the whole 49-seed corpus are the bundle itself
(klBundled 0 → 1) and holder-days with cells (0 → 69).

## 2. Wall numbers

| Metric | Ctl (49 seeds) | Armed (49 seeds) | Staged (16 seeds) |
| --- | --- | --- | --- |
| Wins | 0/49 | 0/49 | 0/16 |
| National | 0/49 | 0/49 | 0/16 |
| Table | not instrumented | not instrumented | not instrumented |
| Wave 5 unlocks | 18/49 | 18/49 | 11/16 |
| Wave 4 unlocks | 49/49 | 49/49 | 16/16 |
| Median survival | 149d (analyzer) | 149d (analyzer) | 149d (analyzer) |
| Max survival | 150d | 150d | 150d |
| Villages lost | 25/49 | 25/49 | 8/16 |

The scale wall still binds — regional is the ceiling on all 49
matched seeds (best standing 650, seed 107558), no national, no
wins — but the wall is not this arm's question; the numbers are
reported because the standing directive requires them every run.
The bundle moved no wall number by even one seed.

## 3. Staged leg — 16 forced armed arrivals

| Seed | Holder | Arrival | Fights with gun (by wave) | Volleys fired | Shots / Hits / Dmg | Holder's end |
| --- | --- | --- | --- | --- | --- | --- |
| 107533 | grace_obi | d5, 2 cells | 6 (w1×3, w2×3) | 0 | — | village lost d47 |
| 107534 | gen_t2k0pd5 | d10, 2 cells | 15 (w1×9, w2×6) | 0 | — | died d79, the wild |
| 107535 | adaeze_nwosu | d6, 2 cells | 4 (w1×2, w2×1, w3×1) | 0 | — | died d114, contest |
| 107536 | gen_v30h8sm | d7, 2 cells | 11 (w1×4, w2×6, w3×1) | 0 | — | died d140, the wild |
| 107537 | gen_vhjvr2c | d7, 2 cells | 9 (w1×6, w2×3) | 0 | — | died d67, the wild |
| 107538 | gen_blg32yz | d3, 2 cells | 4 (w1×2, w2×1, w3×1) | 0 | — | died d77, the wild |
| 107539 | emma_larsen | d3, 2 cells | 19 (w1×9, w2×5, w3×4, w4×1) | **1** | **2 / 1 / 68** | died d86, the wild |
| 107540 | gen_3z8xcjr | d7, 2 cells | 10 (w1×7, w3×3) | 0 | — | survived 150d |
| 107541 | chen_wei | d6, 2 cells | 1 (w2×1) | 0 | — | died d118, dehydration |
| 107542 | caleb_jones | d4, 2 cells | 5 (w1×3, w3×1, w5×1) | **1** | **2 / 2 / 132** | died d115, the wild |
| 107543 | gen_h2gxe33 | d6, 2 cells | 4 (w1×2, w2×2) | 0 | — | died d69, the wild |
| 107544 | gen_m286un3 | d7, 2 cells | 9 (w1×6, w2×1, w3×2) | 0 | — | died d59, the wild |
| 107545 | elena_petrova | d4, 2 cells | 1 (w2×1) | 0 | — | died d77, wound |
| 107546 | dmitri_sokolov | d5, 2 cells | 4 (w1×3, w3×1) | 0 | — | died d124, the wild |
| 107547 | yuki_mori | d8, 2 cells | 0 | 0 | — | died d116, the wild |
| 107548 | olivia_bennett | d6, 2 cells | 4 (w1×3, w2×1) | 0 | — | survived 150d |

Totals: 16 arrivals, 16 bundled, 0 dry, 2 kill-loot volleys
(4 shots, 3 hits, 200 damage), 1,217 holder-days with cells,
142 kill-loot events, 17 tier-4 rolls (11.97% — inflated by
construction: 16 of the 17 are the forced searcasters themselves
plus 1 natural tier-4; reported, not judged, per prereg §7 bar 5).
Contest path on the staged band: 13 grants, 0 contest volleys.
Fights with the gun total 102 across the 16 holders; only 2 of
those 102 fights were wave 4+ — and both fired.

Per-arrival fire rate: 2/16 = 12.5% (Wilson 95% CI 3.5–36.0%).
Per-fight fire rate at wave 4+: 2/2. Per-fight fire rate below
wave 4: 0/100 — that zero is CELLGATE, not chance.

## 4. Sense-test — the three armed arrivals that tell the story

The driver records no dialogue text, so the sense-test judges from
equip/carry/fight behavior and the engine's own narration lines
(fieldFights.js) — said plainly, not faked.

**Jorge Silva, seed 107533, matched leg (the natural arrival).**
The same man, the same day, the same gun as killarrive-b — only
now it arrives loaded. He takes the gun + 2 cells on day 19,
equips it the same day, and carries it loaded for 69 days
(days 19–87, the daily census shows him equipped with 2 cells on
every one of those days). He fights with it 15 times — wave 1
drumbelly, anaconda, ducks, mirrormoth ×3, glasswing ×3; wave 2
bright_idea, memory_projector, alien_tick; wave 3 spool,
chorus_line — and every volley record reads 0 shots, 0 hits,
ammoLeft 2. The engine's hold line fires every time: he "holds
the Searcaster — the beast is below wave 4, and the cells are
saved for harder prey." The harder prey never comes: he dies in
the wild on day 92, the gun still loaded on his unburied corpse
when the village is lost on day 129. Nobody recovers it — no
corpse take, no grant, no scholar-pack location. The bundle
changed his story in exactly one respect: the gun on his corpse
has 2 cells in it instead of 0.

**Emma Larsen, seed 107539, staged leg (the first firing).**
She takes the staged gun on day 3 with 2 cells and fights with it
19 times — the busiest holder in the program. Fourteen of those
fights are waves 1–3, all held, all 0 shots. On day 51 she faces
a wave-4 suburb — and fires: 2 shots, 1 hit, 68 damage, both
cells spent, ammoLeft 0. She fights on without the gun ever
firing again, dies in the wild on day 86, and her gun stays on
her corpse, unrecovered. Her 68 damage is the largest single
volley contribution from any kill-loot gun in the program, and it
came in exactly the fight CELLGATE was saving the cells for.

**Caleb Jones, seed 107542, staged leg (the second firing).**
He takes the staged gun on day 4 with 2 cells, fights three
wave-1 beasts in his first two weeks (all held, 0 shots), and
then — nothing for 82 days — until day 100, when he faces a
wave-5 spoiler and fires: 2 shots, 2 hits, **132 damage**, both
cells spent. Six days later he faces a wave-3 chorus_line with
the gun dry: 0 shots, ammoLeft 0. He dies in the wild on day 115.
132 damage is the hardest single volley the program has measured
from any searcaster, contest or kill-loot.

**The mechanism, in plain words.** CELLGATE (fieldFights.js,
sim-cellgate-a) is a deliberate hold: a searcaster with cells
never fires below wave 4. Its own code comment says the hold
exists so "the bundle's cells survive the first low-wave fight."
The two levers compose exactly as written: KILLBUNDLE loads the
gun, CELLGATE decides when it may speak. A kill-loot holder's
fight mix is almost entirely waves 1–3 (100 of the staged
holders' 102 fights), so the gun is a talisman for months and a
weapon for one volley — if the holder lives to meet a wave-4+
monster at all. 14 of 16 staged holders never did. The two who
did both fired. The contest path shows the same shape from the
other side: 4 volleys on the matched band, all in wave-4 fights
(herald, audit, reunion, suburb), each exactly 2 shots.

Nobody in any village notices, equips-around, or comments on the
gun and its cells beyond the engine's own hold/fire lines — the
instrument records no dialogue, and the census shows holders
simply carrying the gun from arrival day until death. That is the
honest limit of this sense-test: the behavior is coherent (equip,
carry, hold, fire at the right tier, go dry), but there is no
village conversation about the gun to judge.

## 5. Re-arming — nobody re-arms, anywhere

A systematic scan of all three corpora (ctl, armed, staged) for
every kill-loot holder: fusion_cell gains via kill-loot drops,
grant events, or corpse takes, before and after their first
volley.

- **After firing: 0 re-arms.** Emma Larsen and Caleb Jones each
  fired once, spent both cells, and never gained another cell —
  Emma fought on dry to day 86, Caleb to day 115.
- **Before firing: 0 gains beyond the bundle.** No kill-loot
  holder gained a fusion_cell from any source at any point; the
  bundle's 2 cells are the only cells a kill-loot holder ever
  holds. (Two apparent gains in the raw scan — Elena Petrova
  107545, Yuki Mori 107547 — are the *scholar* taking a cell from
  the holder's corpse after death, not the holder gaining one.)
- **Corpse recovery is the only second life a gun gets.** The
  scholar recovered Elena Petrova's gun + 1 fusion cell from her
  corpse on day 78 (she died d77 of a wound) and a fusion cell
  from Yuki Mori's corpse on day 116; an unidentified searcaster
  was taken from a corpse on seed 107539 day 61. Jorge's gun and
  Emma's gun stayed on their unburied corpses, unrecovered. No
  holder ever picked up a dead holder's gun; only the scholar
  takes from corpses, and only sometimes.
- The three tier-4 `fusion_cell` kill-loot drops on the matched
  band (days 22, 30, 52, per killarrive-b §1) went to holders who
  did not hold a searcaster — cells and guns never meet except
  through the bundle.

## 6. Reconciliation — code vs band

| Quantity | Ctl (49) | Armed (49) | Staged (16) |
| --- | --- | --- | --- |
| Kill-loot events | 399 | 399 | 142 |
| Drops / seed | 8.14 | 8.14 | 8.88 |
| Tier-4 rate / drop | 7.77% | **7.77%** (identical) | 11.97% (forced searcasters; not judged) |
| Kill-loot searcasters | 1 | 1 | 16 (forced) |
| Bundled arrivals | 0 | 1 | 16 |
| Kill-loot volleys | 0 | 0 | **2** (4 shots, 3 hits, 200 dmg) |
| Holder-days with cells | 0 | 69 | 1,217 |
| Contest grants / volleys | 30 / 4 | 30 / 4 | 13 / 0 |
| Deaths / starvation | 4,704 / 16 | 4,704 / 16 | 1,581 / 9 |

The matched leg is a perfect reproduction of the control: every
wall number, every per-seed row, every tier-4 roll identical —
the bundle is a pure addition (2 cells on one arrival) with zero
draws on the RNG stream and zero measurable side effects. The
staged leg is where the mechanism shows: 2 firings in 16 arrivals,
both at wave 4+, both spending both cells, both the hardest
volleys of their seeds.

## 7. Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged run** (prereg content ~14:30
  UTC, committed `23746a0f1`, judged legs launched after): bars
  1, 2, 4, 5, 6, 7, 8 pass; bar 3 fails with its diagnosis
  frozen into the verdict rule (a bar-3 miss with a bar-4 pass
  is GO with the miss diagnosed — the rule, not a re-score).
  No bar was re-scored.
- **The analyzer's NO-GO is not the arm's NO-GO.** The
  analyzer's `judgeCompare` encodes the matched-pair rule only
  (arm klVolleys ≥ 1 on the matched leg). The prereg's frozen
  rule routes the verdict through the staged leg when the
  matched leg is thin — that routing, and the staged leg itself,
  were frozen before any judged seed ran, because the matched
  leg was *expected* to carry ~1 arrival. Reporting the
  analyzer's NO-GO as the arm's verdict would be the re-score
  the frozen rule exists to prevent.
- **The GO is narrow, and the prereg said so in advance.**
  "If the staged per-arrival fire rate is low (e.g. 1/16), the
  GO stands but the metric review says so plainly: the gun
  fires, but rarely matters — the next question is fire
  frequency." The observed rate is 2/16 = 12.5% (Wilson
  3.5–36.0%). The bundle answers the question it was asked —
  does a loaded kill-loot gun fire — but the binding constraint
  has moved, not vanished: it is now CELLGATE's wave floor
  against a kill-loot holder's fight mix (100 of 102 staged
  fights below wave 4), plus the absence of any re-arm path.
  A future arm that wants kill-loot guns to matter in ordinary
  play has to touch the wave floor or the re-arming, not the
  bundle — the bundle is done.
- **What this band does NOT judge:** whether 2 cells is the
  right bundle size (both firings spent both cells in one
  volley — a 1-cell bundle would have fired half as hard; a
  4-cell bundle might have fired twice, but no holder ever got
  a second wave-4+ fight while loaded, so the data cannot say),
  whether holders would fire more if CELLGATE's floor moved,
  or whether the scholar's corpse-recovery of guns/cells is
  tuned right (2 recoveries in 17 arrivals, both partial — 1
  cell taken where 2 were carried — the instrument cannot
  resolve whether the second cell stayed on the corpse or was
  never there; recorded, not explained).

## 8. Findings (for the coordinator to append to sim-findings.md)

- [open] 2026-11-23 — items / supply — CELLGATE HOLDS EVERY
  KILL-LOOT VOLLEY BELOW WAVE 4: KILLBUNDLE loads the gun
  (17/17 arrivals, exactly 2 cells), but CELLGATE forbids firing
  below wave 4, and a kill-loot holder's fights are almost all
  waves 1–3 (100 of 102 staged fights; the matched holder's 15
  fights all below wave 4). Only 2 of 16 staged holders ever
  reached a wave-4+ fight, and both fired. The bundle is done;
  the next binding constraint on kill-loot guns is the wave
  floor vs the holder's fight mix. Next step: a design call on
  whether CELLGATE's floor should move, or whether kill-loot
  holders need a path to wave-4+ fights. (sim-killbundle-b,
  evidence/2026-11-23/sim-killbundle-b.md)
- [open] 2026-11-23 — items / supply — NO RE-ARM PATH EXISTS
  FOR SEARCASTERS: both staged holders who fired spent both
  cells in one volley and never gained another cell by any route
  (no kill-loot cell drops to a holder, no grants, no corpse
  takes by a holder); the gun is a two-shot weapon for its whole
  life. The only second life is the scholar taking a gun/cell
  from a holder's corpse (2 of 17 arrivals). Next step: check
  what re-arms a holder (crafting? corpse takes? trade?) — the
  question killarrive-b §9 posed, still unanswered.
  (sim-killbundle-b, evidence/2026-11-23/sim-killbundle-b.md)

The `[claimed]` finding this arm worked (KILL-LOOT GUNS ARRIVE
DRY AND NEVER FIRE, sim-findings.md line 2715) is now judged:
the bundle loads the gun and a loaded gun fires — GO per the
frozen rule. The finding's next step (KILLBUNDLE unjudged) is
closed; its successor constraints are the two open findings
above.

## 9. Infra notes and deviations

- **Pre-flight (NOT judged):** proof 12/12, selftest 17/17,
  `test-killrate-a.js` 36/36, `test-killrate-analysis-a.js`
  14/14, `test-killarrive-b.js` 12/12, `test-killbundle-b.js`
  11/11 pre-run + 11/11 `--live` — all re-run on base
  `8a949703a` before the prereg commit. Green.
- **safe-commit index clobber (known class).** After the prereg
  commit `23746a0f1` the main index showed the committed files
  staged-as-deleted (plus `MM` on the driver); repaired with
  the `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info` pipe, verified empty status + empty diff HEAD +
  hash-object match. The judged legs therefore carry anchor
  `23746a0f1` (the prereg commit), not `8a949703a` — recorded
  in the prereg §9 as the expected case; no `src/` file
  changed between the two anchors beyond the driver hook
  itself, and the ctl-vs-armed comparison is unaffected
  (verified: armed vs ctl identical on all 14 compared keys ×
  49 seeds).
- **Machine restart killed the first confirm attempt mid-run.**
  All six leg processes were SIGTERM'd at ~5.7 min (uptime 1
  min when the worker resumed) — a VM replacement, per the
  known pattern. 15 armed + 4 staged seed files had already
  landed complete (writeRobust tmp+rename; every landed file
  carries its printed summary line). The 34 missing armed
  seeds were re-run as four remnant processes and the 12
  missing staged seeds as two remnant processes, exit 0, same
  anchor `23746a0f1`, same substrate — the driver refuses to
  overwrite, so no landed file was re-run or replaced. All 49
  + 16 files share the one anchor; corpus validations PASS.
  Nothing from the killed attempt is counted twice; nothing is
  extrapolated.
- **Runtime restart killed the staged-remnant tail.** The two
  staged-remnant sessions were interrupted with no confirmed
  result (runtime restart, not a VM replacement — uptime 42
  min at recovery). Verified on disk first: 14/16 staged files
  landed complete, no driver processes alive; only 107540 and
  107548 were missing. Those two were re-run as a single
  remnant process, exit 0, same anchor/substrate. Nothing
  re-run, nothing extrapolated.
- **Panel exit code:** `balance-panel.js compare` exits 2 when
  its decision is `review_required` (the tool's own convention:
  exit 0 only on `no_material_signal`). The compare completed
  and wrote `killbundle-b-panel.md` + `.json`; the exit code is
  not a failure. Recorded so the next reader doesn't misread it.
- **RUN / OUTDIR:** `RUN=killlootbundle-a` unchanged (analyzer
  hardcodes it); fresh OUTDIRs `perseed-killbundle-b-arm` and
  `perseed-killbundle-b-stage`. Driver hardcodes
  `evidence/2026-11-21/<OUTDIR>` — corpora land under
  2026-11-21 although this arm's evidence is 2026-11-23.
  Recorded, not moved.
- **No panel for the staged leg (§15):** the staged leg has no
  matched control (its arrivals are forced, not sampled), so
  no balanced-panel compare applies to it. The panel covers
  the matched pair only. Stated plainly, not faked.

## Files

- Prereg: `evidence/2026-11-23/sim-killbundle-b-prereg.md`
  (`23746a0f1`)
- Evidence: `evidence/2026-11-23/sim-killbundle-b.md` (this file)
- Proof tests: `scripts/test-killbundle-b.js` (11/11 pre-run +
  11/11 live + corpus PASS), `scripts/test-killlootbundle-a.js`
  (12/12), `scripts/test-killrate-a.js` (36/36),
  `scripts/test-killrate-analysis-a.js` (14/14),
  `scripts/test-killarrive-b.js` (12/12 + ctl corpus PASS)
  (`23746a0f1`)
- Analysis: `evidence/2026-11-23/killbundle-b-analysis.json`
  (armed leg), `evidence/2026-11-23/killbundle-b-compare.json`
  (analyzer --compare ctl vs armed),
  `evidence/2026-11-23/killbundle-b-tally.json` (armed tier
  tally), `evidence/2026-11-23/killbundle-b-stage-analysis.json`
  (staged leg), `evidence/2026-11-23/killbundle-b-stage-tally.json`
  (staged tier tally), `evidence/2026-11-23/killbundle-b-rows.json`
  (per-seed table source, both legs)
- Panel: `evidence/2026-11-23/killbundle-b-panel.md` (+
  `killbundle-b-panel-before.json.gz` /
  `killbundle-b-panel-after.json.gz` /
  `killbundle-b-panel.json`)
- Corpora: `evidence/2026-11-21/perseed-killbundle-b-arm/` (49
  files, anchor `23746a0f1`),
  `evidence/2026-11-21/perseed-killbundle-b-stage/` (16 files,
  anchor `23746a0f1`); control
  `evidence/2026-11-21/perseed-killarrive-b-ctl/` (49 files,
  anchor `5fb502bd1`)
- Leg logs: `evidence/2026-11-23/killbundle-b-legs-pilot-{1,2,3,4}.log`
  (8 seeds), `killbundle-b-legs-confirm-{1,2,3,4}.log` (killed
  by the restart, partial), `killbundle-b-legs-remnant-{1,2,3,4}.log`
  (34 seeds), `killbundle-b-legs-stage-{a,b}.log` (killed by the
  restart, partial), `killbundle-b-legs-stage-remnant-{a,b}.log`
  (12 seeds), `killbundle-b-legs-stage-remnant-c.log` (2 seeds)

## Run identity

- **Base:** worktree HEAD `8a949703a` (master tip at arm start);
  prereg + STAGE_SEAR hook + arm test `23746a0f1`; branch
  `sim-killbundle-b`.
- **Pre-flight:** `node scripts/test-killlootbundle-a.js` → 12/12;
  `node scripts/analyze-killlootbundle-a.js --selftest` → 17/17;
  `node scripts/test-killrate-a.js` → 36/36;
  `node scripts/test-killrate-analysis-a.js` → 14/14;
  `node scripts/test-killarrive-b.js` → 12/12;
  `node scripts/test-killbundle-b.js` → 11/11;
  `node scripts/test-killbundle-b.js --live` → 11/11 (all on
  `8a949703a`).
- **Pilot (judged):** 8 matched armed seeds, 107533–107540,
  4 processes, all exit 0.
- **Confirm (judged):** 41 matched armed seeds, 107541–107581
  (4 processes, killed by restart at ~5.7 min, 7 landed) +
  34 remnant seeds (4 processes, exit 0); 16 staged seeds,
  107533–107548 (2 processes, killed by restart, 4 landed) +
  12 remnant seeds (2 processes, interrupted by runtime
  restart, 10 landed) + 2 remnant seeds (1 process, exit 0).
  Horizon 150d death-aware, competent verbatim policy
  (`scripts/policies/competent.js`). Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `KILLBUNDLE=1`
  (both legs); `STAGE_SEAR=1` (staged leg only); `LEND` unset;
  `PRESENCE` unset.
- **Analysis (judged):** `node scripts/analyze-killlootbundle-a.js
  --compare evidence/2026-11-21/perseed-killarrive-b-ctl
  evidence/2026-11-21/perseed-killbundle-b-arm --out
  evidence/2026-11-23/killbundle-b-compare.json` → verdict
  NO-GO on the matched pair alone (its pilotGO rule; see §7);
  `node scripts/analyze-killlootbundle-a.js --dir
  evidence/2026-11-21/perseed-killbundle-b-arm --out
  evidence/2026-11-23/killbundle-b-analysis.json` → exit 0;
  `--dir` on the staged dir → exit 0; tier tallies on both dirs
  → exit 0; `node scripts/test-killbundle-b.js --dir <armed>`
  → PASS; `--dir-stage <staged>` → PASS; panel build + compare
  → decision `review_required`.
