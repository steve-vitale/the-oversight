# sim-cellgate-floor-b — EVIDENCE (adoption of the timed-out 1830Z run)

**Arm:** sim-cellgate-floor-b · **Loop B run:** fleshout-loop-b-20261123T2130Z
(adoption; original run fleshout-loop-b-20261123T1830Z, timed out mid-confirm)
**Axis:** winnability-chain · **Finding:** sim-findings.md line 2716 `[claimed]`
— CELLGATE HOLDS EVERY KILL-LOOT VOLLEY BELOW WAVE 4 (killbundle-b §8)
**Type:** JUDGE a lever (CELLGATE_FLOOR, env parameter, no default flip)
on the staged kill-loot path only. The flip (default floor 3) is a
follow-up decision, NOT made here.
**Prereg:** `evidence/2026-11-23/sim-cellgate-floor-b-prereg.md` (frozen
2026-11-23 ~19:10 UTC). **Verdict rule (frozen):** GO = bars 1, 2, 4, 6, 7,
8 pass AND bars 3 AND 5 pass. NO-GO = bars 1, 2, 4, 6, 7, 8 pass AND bar 3
or bar 5 fails. DIAG = bar 4 fails OR bar 1 fails.

## 0. Formal verdict: DIAG — with the lever question answered YES

**Formal verdict: DIAG.** Two instrument-validity bars fail as literally
written, and the frozen rule makes that DIAG:

- **Bar 1 fails on one subcheck:** the corpus carries **two git anchors**
  (8 pilot files on `6b9e75cf1`, 8 confirm files on `81613563b`) instead of
  one. Everything else in bar 1 is green (all proof counts re-run on this
  base, 0 instrument errors on 32/32 files, single policySha, single
  gameSha, floors correct). The two anchors are **code-identical**
  (`git diff 6b9e75cf1 81613563b -- src scripts` is empty; the pilot
  commit changed evidence files only), the split is symmetric across
  legs (same seeds on the same anchors on both legs), and prereg §9
  anticipates anchor moves from commits as not affecting the comparison.
  The anchor clause's purpose — identical code under test — is proven
  satisfied; its label proxy moved because an evidence-only commit
  landed between pilot and confirm. See §9 for the full investigation.
- **Bar 8 fails on two rows:** the balanced panel's decision is
  `review_required` as required, but the village-deaths rows (per run and
  per 100 days) carry status `regression_watch`, outside bar 8's allowed
  set. Investigated in §7: both 95% intervals cross zero, paired median
  0, worse 4 / better 3 / tied 9 of 16 pairs, and the +82 deaths delta
  is concentrated in 4 downstream-divergence seeds — 3 of them villages
  the wave-3 firing **saved** from being lost (surviving villages record
  more deaths over longer lives). Not a demonstrated regression; a
  noise-level watch on a 16-seed screen. A 64-seed holdout would be
  needed to resolve it — that is a follow-up instrument, not this arm.

**The substantive finding, stated plainly so the DIAG does not bury it:**
the floor works. Floor 3 makes the loaded gun fire — **9 volleys vs 2**,
**7 of them at wave 3**, and the 7 are exactly the 7 holders the prereg
derived mechanistically (each firing at their first wave-3 fight while
loaded). The floor-4 control reproduced killbundle-b exactly (2 volleys:
Emma wave-4 d51, Caleb wave-5 d100). The lever question this arm was
asked — *does moving CELLGATE's floor from 4 to 3 make the loaded gun
fire?* — is answered **yes, decisively**. What the DIAG blocks is the
formal GO label, not the finding: the flip decision (default floor 3)
needs the coordinator / Steve to accept the two instrument-validity
deviations above, or to order a re-judge. No re-run can repair the
anchor label (valid per-seed files must never be overwritten), and the
deaths watch needs a bigger band, not a re-run of this one.

## 1. Prereg header (frozen — carried from the prereg file)

- **Question:** KILLBUNDLE loads the gun (16/16 arrivals, exactly 2
  cells) but CELLGATE forbids firing below wave 4, and a kill-loot
  holder's fights are almost all waves 1–3 (100 of 102 staged fights).
  Does moving CELLGATE's wave floor from 4 to 3 make the loaded gun
  fire?
- **Lever:** `src/js/fieldFights.js` — CELLGATE hold reads
  `CELLGATE_FLOOR` (1..5, default 4), holds when `wave < floor`.
  CELLGATE=1 still required. Contest searcaster volleys do not go
  through this hold. No default flip in this arm.
- **Band (frozen, reused by design):** staged seeds 107533–107548 (16),
  the killbundle-b staged subset. Same staged seeds on both legs; the
  ONLY difference between the corpora is the floor.
- **Legs:** control floor 4 (CELLGATE_FLOOR unset, default 4),
  OUTDIR `perseed-cellgate-floor-b-ctl`; armed floor 3
  (CELLGATE_FLOOR=3), OUTDIR `perseed-cellgate-floor-b-arm`. Both
  MODE=arm, KILLBUNDLE=1, STAGE_SEAR=1, RUN=killlootbundle-a.
  Substrate (both legs, identical to killbundle-b):
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; LEND unset, PRESENCE
  unset. Horizon 150d death-aware. Policy: competent (verbatim).
- **Mechanistic expectation (frozen, §6):** armed leg 8 volleys / 16
  arrivals = 50% fire rate, of which 7 are wave-3 volleys. GO bars sit
  below the expectation to leave margin for downstream divergence.
- **Frozen GO bars:** (1) instrument validity incl. single anchor +
  policySha on every file; (2) cells-at-arrival 16/16 bundled, 0 dry,
  both legs; (3) armed volleys ≥ 5/16; (4) control volleys == 2;
  (5) armed wave-3 volleys ≥ 3; (6) tier-4 rate within ±5pp leg-vs-leg;
  (7) guardrails starv delta ≤ +2, median-survival delta ≥ −20;
  (8) balanced panel, decision `review_required`, every metric status ∈
  {descriptive, no_material_signal, not_observed, insufficient};
  (9) sense-test + re-arm record delivered.
- **Canon:** docs/CANON.md + docs/MONSTER-WAVES.md read. No canon doc
  covers the kill-loot roll table, the bundle, or the CELLGATE floor —
  the numbers are code-derived (killbundle-b §2,
  fieldFights.js:1032–1041), said here rather than inventing canon.
  Wave 3 is "The Final Draft" (day 25+ AND 4 wave-2 ledger points);
  wave 4 is "The Mirror Draft" (standing ≥ 100). A wave-3 firing
  spends the cells on a mid-build fight (HP 240–420) instead of saving
  them for a wave-4+ mirror fight (HP 850–1500) — that trade is the
  design question the follow-up flip decision owns.

## 2. Adoption note (what the 1830Z run left, what this run did)

The 1830Z run timed out after launching the confirm legs at
2026-11-23T20:25:51Z. Verification from disk (not from its reports):
the confirm corpus was **incomplete** — each confirm process finished
exactly one seed (107541 in leg-1, 107545 in leg-2) and then died;
seeds 107542, 107543, 107544, 107546, 107547, 107548 were missing on
BOTH legs (10/16 files per leg at adoption). No files were written in
the tree in the 15 min before 21:33Z — no live worker; the tree was
adopted cleanly.

This run re-ran **only** the 12 missing seeds, with the same
instrument / anchor (HEAD `81613563b`, matching the two existing
confirm files per leg) / band, in 4 remnant processes mirroring the
original confirm split (arm-remnant-1: 107542–107544, arm-remnant-2:
107546–107548, ctl-remnant-1/2 the same), logs
`evidence/2026-11-23/cellgate-floor-b-legs-confirm-{arm,ctl}-remnant-{1,2}.log`.
All 4 remnant processes exited 0; all 12 seeds wrote valid files
(errors 0, anchor `81613563bd78`, gameSha `78f460bcbbbf`). No valid
per-seed file was overwritten. Corpus now complete: 16/16 per leg,
seeds contiguous 107533–107548, 0 instrument errors, single
policySha `1884c8852d38`, single gameSha `78f460bcbbbf` on all 32
files, floors 3 (arm ×16) / 4 (ctl ×16).

Pilot (already committed as `81613563b`): 8+8 staged seeds, both legs
exit 0; arm 9 arrivals (1 natural), 6 volleys, 5 wave-3; ctl 8/8
bundled, 1 volley (Emma w4, 0 wave-3). Pilot expectation met exactly.

## 3. Before / after (the judged numbers)

Analyzer: `scripts/analyze-killlootbundle-a.js --dir` per leg
(`evidence/2026-11-23/cellgate-floor-b-{ctl,arm}-analysis.json`),
`--compare` (`evidence/2026-11-23/cellgate-floor-b-compare.json`),
tier tally `scripts/test-killrate-analysis-a.js --dir` per leg.
Corpus validation: `scripts/test-cellgate-floor-b.js --dir-{ctl,arm}`.
Panel: `scripts/build-cellgate-floor-panels-b.js` +
`scripts/balance-panel.js compare`
(`evidence/2026-11-23/cellgate-floor-b-panel.{json,md}`,
before/after `.json.gz`).

NOTE on the analyzer's own verdict: `--compare` prints verdict
**NO-GO** — that is the *killbundle* analyzer's built-in judge
(pilotGO bar: arm klVolleys ≥ 1 AND ctl klBundled == 0), which cannot
pass on this arm's design (the control leg is *supposed* to bundle
16/16). It is not this arm's verdict; the frozen prereg bars are the
judge, applied here from the analyzer's aggregates. Guardrails inside
`--compare` pass (starv delta −4, median delta +2).

| Metric | Control floor 4 (16 seeds) | Armed floor 3 (16 seeds) | Bar |
|---|---:|---:|---|
| Kill-loot arrivals | 16 | 17 (16 staged + 1 natural) | 2 |
| Bundled arrivals (exactly 2 cells) | 16 | 17 | 2 |
| Dry arrivals | 0 | 0 | 2 |
| **Kill-loot volleys** | **2** | **9** | 3 (≥5 ✓), 4 (==2 ✓) |
| Wave-3 kill-loot volleys | 0 | **7** | 5 (≥3 ✓) |
| Wave-4+ kill-loot volleys | 2 | 2 | — |
| Volley shots / hits / dmg | 4 / 3 / 200 | 18 / 12 / 526 | — |
| Wave-3 volley shots / hits / dmg | 0 | 14 / 5 / 328 | — |
| Fire rate (volleys / staged arrivals) | 2/16 = 12.5% | 9/16 = 56.25% | exp. 50% |
| Tier-4 kill-roll rate | 17/142 = 11.97% | 22/142 = 15.49% | 6 (+3.52pp ✓) |
| Total kill-loot drops | 142 | 142 | — |
| Searcaster arrivals (all sources) | 29 | 26 | — |
| Contest grants (searcaster) | 13 | 9 | — |
| Holder-days with cells | 1217 | 875 | — |
| Starvation deaths | 9 | 5 (delta −4) | 7 ✓ |
| Median survival (days) | 149 | 151 (delta +2) | 7 ✓ |
| Villages lost | 8 | 5 | — |
| Total deaths | 1581 | 1663 (+82) | §7 |
| Contests / prize rolls | 257 / 360 | 249 / 344 | — |

**The 9 armed volleys** (holder, day, wave, shots/hits/dmg):
Adaeze Nwosu d42 w3 2/0/0 · gen_v30h8sm d34 w3 2/1/64 ·
gen_blg32yz d33 w3 2/1/65 · Emma Larsen d27 w3 2/1/64 ·
gen_3z8xcjr d39 w3 2/1/68 · gen_m286un3 d39 w3 2/1/67 ·
Dmitri Sokolov d33 w3 2/0/0 · Ava Garcia d79 w4 2/1/66 (natural
2nd arrival, seed 107536) · Caleb Jones d100 w5 2/2/132 (as control).
The 7 wave-3 firings are **exactly** the 7 holders the prereg derived
mechanistically (107535, 107536, 107538, 107539, 107540, 107544,
107546), each firing at their first wave-3 fight while loaded. The
mechanistic expectation was 8 volleys (7 wave-3 + Caleb wave-5); the
9th is Ava Garcia, a natural second arrival who fired at wave 4.
Two of the seven wave-3 volleys dealt 0 damage (both shots missed) —
the gun fires reliably at wave 3 but hits only 5 of 14 wave-3 shots
in this sample.

**The 2 control volleys** (exact killbundle-b reproduction):
Emma Larsen d51 w4 2/1/68 · Caleb Jones d100 w5 2/2/132.

## 4. Reachability verdict + scale-wall numbers

- **Waves:** wave 4 reached 16/16 on both legs; wave 5 reached 11/16
  control, 12/16 armed. Wave 3 firing does not gate wave reach —
  every seed reaches wave 4, most reach wave 5, on either floor.
- **National:** 0/16 on both legs. **Table:** not instrumented by
  this driver — recorded as not instrumented, never faked.
  **Wins:** 0/16 on both legs. The scale wall is untouched by this
  lever: moving the floor makes the gun fire, but no village in this
  band reaches national, the table, or a win on either leg.
- **Median survival:** 149d control, 151d armed (150d horizon +
  death-aware tail; max 151d both). **Village lost:** 8 control, 5
  armed. The armed leg's villages survive slightly longer and are
  lost less often — and that longer survival is part of why they
  record more deaths (§7).
- **Standing (end):** control median ~350 (range 100–550); armed
  median ~412 (range 100–645). Three armed villages stand far above
  their control twins (107535: 440 vs 199; 107538: 570 vs 345;
  107540: 645 vs 485) — the wave-3 firing changes the whole
  trajectory, not just one fight. One goes the other way (107539:
  350 vs 550) — firing early is not a free win; it spends the cells
  a wave-4 fight would have used.

## 5. Per-seed staged table (both legs)

Seed, staged arrival day/holder, cells, searcaster fights by wave
(rows = fights with the gun equipped; 0-shot rows are holds),
volleys (day, wave, shots/hits/dmg). Ava Garcia (107536 arm) is the
one natural arrival; all others are staged.

**Control — floor 4:**

| Seed | Arrival | Cells | Fights by wave (w1/w2/w3/w4/w5) | Volleys |
|---|---|---|---|---|
| 107533 | d5 grace_obi | 2 | 3/3/0/0/0 | — |
| 107534 | d10 gen_t2k0pd5 | 2 | 9/6/0/0/0 | — |
| 107535 | d6 adaeze_nwosu | 2 | 2/1/1/0/0 | — |
| 107536 | d7 gen_v30h8sm | 2 | 4/6/1/0/0 | — |
| 107537 | d7 gen_vhjvr2c | 2 | 6/3/0/0/0 | — |
| 107538 | d3 gen_blg32yz | 2 | 2/1/1/0/0 | — |
| 107539 | d3 emma_larsen | 2 | 9/5/4/1/0 | d51 w4 2/1/68 |
| 107540 | d7 gen_3z8xcjr | 2 | 7/0/3/0/0 | — |
| 107541 | d6 chen_wei | 2 | 1/0/0/0/0 | — |
| 107542 | d4 caleb_jones | 2 | 3/0/1/0/1 | d100 w5 2/2/132 |
| 107543 | d6 gen_h2gxe33 | 2 | 2/2/0/0/0 | — |
| 107544 | d7 gen_m286un3 | 2 | 6/1/2/0/0 | — |
| 107545 | d4 elena_petrova | 2 | 0/1/0/0/0 | — |
| 107546 | d5 dmitri_sokolov | 2 | 3/0/1/0/0 | — |
| 107547 | d8 yuki_mori | 2 | 0/0/0/0/0 | — |
| 107548 | d6 olivia_bennett | 2 | 3/1/0/0/0 | — |

Wave-3 fights across control holders: 14 (Adaeze 1, gen_v30h8sm 1,
gen_blg32yz 1, Emma 4, gen_3z8xcjr 3, Caleb 1, gen_m286un3 2,
Dmitri 1) — exactly the prereg §2 derivation; 0 shots in all 14.
That zero is CELLGATE, not chance.

**Armed — floor 3:**

| Seed | Arrival | Cells | Fights by wave (w1/w2/w3/w4/w5) | Volleys |
|---|---|---|---|---|
| 107533 | d5 grace_obi | 2 | 3/3/0/0/0 | — |
| 107534 | d10 gen_t2k0pd5 | 2 | 9/6/0/0/0 | — |
| 107535 | d6 adaeze_nwosu | 2 | 4/2/1/0/0 | d42 w3 2/0/0 |
| 107536 | d7 gen_v30h8sm | 2 | 2/1/1/0/0 | d34 w3 2/1/64 |
| 107536 | d75 ava_garcia (natural) | 2 | 5/5/0/1/0 | d79 w4 2/1/66 |
| 107537 | d7 gen_vhjvr2c | 2 | 6/3/0/0/0 | — |
| 107538 | d3 gen_blg32yz | 2 | 2/4/2/1/0 | d33 w3 2/1/65 |
| 107539 | d3 emma_larsen | 2 | 5/4/1/0/0 | d27 w3 2/1/64 |
| 107540 | d7 gen_3z8xcjr | 2 | 6/0/1/0/0 | d39 w3 2/1/68 |
| 107541 | d6 chen_wei | 2 | 1/0/0/0/0 | — |
| 107542 | d4 caleb_jones | 2 | 3/0/1/0/1 | d100 w5 2/2/132 |
| 107543 | d6 gen_h2gxe33 | 2 | 2/2/0/0/0 | — |
| 107544 | d7 gen_m286un3 | 2 | 6/1/2/0/0 | d39 w3 2/1/67 |
| 107545 | d4 elena_petrova | 2 | 0/1/0/0/0 | — |
| 107546 | d5 dmitri_sokolov | 2 | 4/2/1/1/0 | d33 w3 2/0/0 |
| 107547 | d8 yuki_mori | 2 | 0/0/0/0/0 | — |
| 107548 | d6 olivia_bennett | 2 | 3/1/0/0/0 | — |

Note the fights-by-wave counts diverge between legs for the same
holder after the firing (e.g. Adaeze 2/1/1 control vs 4/2/1 armed;
gen_blg32yz 2/1/1 vs 2/4/2/1) — downstream divergence: firing the
gun changes later fights, which is the slack the GO bars were set
below the expectation to absorb. Yuki Mori (107547) never fights
with the gun equipped on either leg — the bundle sits unused.

## 6. Matched per-seed table — armed leg (floor 3)

Seed, days, end, maxWave, standing, deaths, starvDeaths, contests,
prizeRolls, contest sear grants, kill-loot arrivals, kill-loot
volleys, sear volleys, holder-days with cells.

| Seed | Days | End | Wave | Standing | Deaths | Starv | Contests | Prizes | C-grants | KL arr | KL vol | Sear vol | Hold-days |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 107533 | 47 | lost | 4 | 100 | 71 | 0 | 5 | 7 | 0 | 1 | 0 | 0 | 43 |
| 107534 | 151 | survived | 4 | 199 | 111 | 0 | 20 | 31 | 1 | 1 | 0 | 0 | 60 |
| 107535 | 151 | survived | 5 | 440 | 154 | 0 | 19 | 23 | 0 | 1 | 1 | 1 | 37 |
| 107536 | 136 | lost | 5 | 470 | 133 | 0 | 14 | 22 | 0 | 2 | 2 | 2 | 31 |
| 107537 | 124 | lost | 5 | 465 | 113 | 2 | 17 | 25 | 0 | 1 | 0 | 0 | 45 |
| 107538 | 151 | survived | 5 | 570 | 108 | 0 | 16 | 20 | 0 | 1 | 1 | 1 | 29 |
| 107539 | 150 | survived | 5 | 350 | 108 | 1 | 14 | 18 | 0 | 1 | 1 | 1 | 23 |
| 107540 | 151 | survived | 5 | 645 | 113 | 0 | 12 | 20 | 3 | 1 | 1 | 1 | 32 |
| 107541 | 151 | survived | 5 | 350 | 71 | 1 | 18 | 28 | 0 | 1 | 0 | 0 | 71 |
| 107542 | 125 | lost | 5 | 350 | 102 | 0 | 14 | 16 | 1 | 1 | 1 | 1 | 95 |
| 107543 | 150 | survived | 4 | 199 | 136 | 0 | 17 | 26 | 2 | 1 | 0 | 0 | 20 |
| 107544 | 151 | survived | 4 | 199 | 86 | 0 | 14 | 16 | 0 | 1 | 1 | 1 | 31 |
| 107545 | 151 | survived | 5 | 400 | 66 | 0 | 17 | 21 | 2 | 1 | 0 | 0 | 146 |
| 107546 | 151 | survived | 5 | 425 | 104 | 0 | 18 | 27 | 0 | 1 | 1 | 1 | 28 |
| 107547 | 130 | lost | 5 | 475 | 104 | 0 | 16 | 21 | 0 | 1 | 0 | 0 | 92 |
| 107548 | 151 | survived | 5 | 365 | 83 | 1 | 18 | 23 | 0 | 1 | 0 | 0 | 92 |

## 7. Bar-by-bar verdict

| # | Bar | Result |
|---|---|---|
| 1 | Instrument validity (proofs + 0 errors + single anchor + policySha + floors) | **FAIL (one subcheck)** — proofs all green re-run on this base (test-killlootbundle-a 12/12, analyzer --selftest 17/17, test-killrate-a 36/36, test-killrate-analysis-a 14/14, test-killarrive-b 12/12, test-killbundle-b 11/11 + --live 11/11, test-gunrate-a 39/39, test-cellgate-floor-b 17/17 + --live 24/24); 0 instrument errors on 32/32 files; single policySha; single gameSha `78f460bcbbbf`; floors 4×16 ctl / 3×16 arm. **Single-anchor subcheck fails:** 2 anchors per corpus (pilot 8 on `6b9e75cf1`, confirm 8 on `81613563b`) — `test-cellgate-floor-b.js --dir-ctl` and `--dir-arm` both report FAIL on exactly that subcheck and nothing else (ctl: files 16, errors 0, klArrivals 16, klBundled 16, klDry 0; arm: files 16, errors 0, klArrivals 17, klBundled 17, klDry 0). See §9. |
| 2 | Cells-at-arrival 16/16 bundled, 0 dry, both legs | **PASS** (arm 17/17 incl. the natural arrival) |
| 3 | Armed volleys ≥ 5/16 | **PASS** — 9/16 (56.25%; expectation 8) |
| 4 | Control volleys == 2 | **PASS** — exactly 2, Emma w4 d51 + Caleb w5 d100, the killbundle-b staged result reproduced |
| 5 | Armed wave-3 volleys ≥ 3 | **PASS** — 7 (expectation 7) |
| 6 | Tier-4 rate within ±5pp | **PASS** — arm 15.49% vs ctl 11.97%, +3.52pp |
| 7 | Guardrails (starv ≤ +2, median ≥ −20) | **PASS** — starv delta −4, median delta +2 |
| 8 | Balanced panel (review_required; statuses in allowed set) | **FAIL (status set)** — decision `review_required` ✓, panels built via `build-cellgate-floor-panels-b.js`, compare completes, but 2 metrics are `regression_watch` (village deaths per run +5.125, 95% CI −3.25 to 15.31; per 100 days +3.34, CI −2.66 to 10.29), outside the allowed set {descriptive, no_material_signal, not_observed, insufficient}. Investigated below. |
| 9 | Sense-test + re-arm record | **DELIVERED** — §8 |

**Bar 8 investigation (the deaths watch).** Per-seed deaths delta
(arm − ctl): 9 seeds exactly 0; +66 (107535), +28 (107536), +15
(107538), +11 (107546); −30 (107539), −3 (107540), −5 (107544);
net +82 (1663 vs 1581). Paired median 0; worse 4 / better 3 /
tied 9. Both 95% intervals cross zero. The +66/+15/+11 seeds are
the ones where a wave-3 firing **saved the village from being
lost** (control lost d145/d145/d148 → armed survived 151d, standing
199→440, 345→570, 375→425): a village that survives records more
deaths over a longer life with more people alive. The +28 seed
(107536) lost earlier on the armed leg (d136 vs d144) with more
deaths — the Ava second-arrival firing changed that village's whole
trajectory. The −30 seed (107539) fired early, survived, and ended
with 30 fewer deaths but lower standing (350 vs 550). This is
downstream-divergence noise concentrated in 4 seeds, not a uniform
"floor 3 kills more villagers" effect — but on a 16-seed screen it
cannot be resolved further. It is a same-run investigation item for
the follow-up: a 64-seed holdout on the floor question would settle
whether firing early costs lives on balance. The analyzer's own
guardrails (bar 7) pass, and starvation deaths actually fall (5 vs 9).

**Formal verdict: DIAG** (frozen rule: bar 1 fails → DIAG; bar 8
also fails as written). The lever bars (3, 5) pass decisively; the
control (4), cells (2), tier-4 (6), guardrails (7), and sense-test
(9) all pass. The DIAG is about two instrument-validity clauses,
not about the lever.

## 8. Sense-test + re-arm (bar 9)

The driver records no dialogue text, so this judges from
equip/carry/fight behavior and grant/corpse records — said plainly,
not faked.

**Emma Larsen, seed 107539, armed leg.** Day 3 she picks up the
searcaster with 2 cells from a kill. For 24 days she carries it
into fight after fight — wave-1 heron, catfish, Nevermore,
gallowdeer; wave-2 union rep, memory projector — and it never
fires: ammoLeft stays 2 through 9 held fights. Day 27 she fights
twice: a wave-2 union rep (held, 0 shots), then a wave-3 Buffering —
the gun finally speaks: 2 shots, 1 hit, 64 damage, cells 2→0. She
keeps carrying the empty gun, equipped, for 22 more days. She
becomes the scholar (the gun's census label changes to
scholar-equipped), dies in the wild on day 57, and the gun ends the
run on her unburied corpse (day 150, never looted, never taken up
by anyone). On the control leg her story runs the same until day
51, when she fires at a wave-4 monster instead — and her village
ends at standing 550 with 138 deaths, against 350 and 108 armed.
Firing three weeks earlier at a smaller monster changed her whole
village's fate, and nobody in the records ever comments on the gun,
asks about the cells, or picks it up after her. The mechanic works;
it leaves no social trace in anything this instrument records.

**Dmitri Sokolov, seed 107546, armed leg.** Arrival day 5, carries
the gun through wave-1 fights (held, 0 shots), fires day 33 at a
wave-3 Chorus Line — 2 shots, 0 hits, 0 damage — and the cells are
gone. He keeps carrying the empty gun, equipped, to day 150,
fighting wave-1/2/4 monsters with a weapon that cannot fire. His
village is lost on the control leg (day 148, standing 375) and
survives on the armed leg (151 days, standing 425) — a 0-damage
volley still changed the fight and the village. He is recorded dead
to a monster on day 114 yet still carries the gun on day 150; the
record does not say how he came back (a second-wind return is the
likely mechanism — canon: `phoenix_clause` / `second_wind` — not
verified in this instrument). Flagged as an observation, not a
conclusion.

**Re-arm: none, anywhere, on either leg.** Zero equipped-with-cells
days after any first volley; no firing holder ever gains cells again
(no later kill-loot arrival for a firing holder, no sear grant to
one). The only post-volley searcaster grants are contest prizes
(107540 days 74/95/130; 107542 day 114) to other villagers — new
guns entering the village, not re-arms of the fired holder. A
fired holder's gun is spent for the rest of the run; holder-days
with cells fall from 1217 (control) to 875 (armed) because the
cells are spent ~24 days earlier on average. If the design wants
the gun to matter twice, re-arming needs a real source (fusion-cell
crafting, a second kill-loot roll, or a contest grant that can reach
the holder) — today there is none. That is a documented blank, not
a fix made here.

**Village assessment, in plain words.** These are villages where
one villager finds an alien gun with exactly two shots, carries it
for weeks through fights it refuses to fire in, and — once the
floor moves — finally fires it at the first big monster that shows
up. The gun matters: three villages that would have been lost
survive instead, and one village's whole standing more than
doubles. But it is a one-shot story in every sense: two cells, one
fight, then an empty gun carried like a lucky charm for the rest of
the run while the village still never reaches national, never sits
at the table, never wins. The floor moves the gun from decoration
to a real moment — but a real moment is not a win condition. The
binding wall is still standing, kills, and veterans, not the gun.

## 9. Anchor-split investigation (bar 1)

`test-cellgate-floor-b.js --dir-ctl` / `--dir-arm` FAIL solely on
`Object.keys(v.anchors).length === 1` (2 anchors per corpus).
Facts established from disk:

- Pilot files (107533–107540, both legs): anchor
  `6b9e75cf1e6b…`, the prereg commit. Confirm files (107541–107548,
  both legs): anchor `81613563bd78…`, the pilot commit. The pilot
  commit `81613563b` (2026-11-23 20:24:25Z) landed between the pilot
  legs and the confirm legs (launched 20:25:51Z), moving HEAD.
- `git show --stat 81613563b`: the pilot commit contains ONLY
  evidence files (16 per-seed JSONs + 8 leg logs per leg set). No
  `src/`, no `scripts/`.
- `git diff 6b9e75cf1 81613563b -- src scripts`: EMPTY. Zero code
  difference between the two anchors.
- `gameSha` is single (`78f460bcbbbf`) on all 32 files; `policySha`
  single (`1884c8852d38`) on all 32; 0 instrument errors; floors
  correct. The anchor split is symmetric across legs (same seeds on
  the same anchors on both legs), so the floor is the only
  difference between the corpora.
- Prereg §9 anticipated anchor moves from commits and declared the
  comparison unaffected ("both staged corpora will carry the
  prereg-commit anchor … the floor-4-vs-floor-3 comparison is
  unaffected because both legs run on the same anchor"). The event
  that occurred is that class of event, with a second commit in the
  middle. The anchor clause's purpose — identical code under test —
  is proven satisfied by the direct evidence (single gameSha + empty
  diff); only its label proxy (git HEAD) moved, for a code-neutral
  reason.

Recorded here as a deviation from the frozen bar's letter, not
hidden: the --dir FAILs are quoted in §7. The formal verdict
follows the frozen rule (DIAG). Whether the anchor clause should
be satisfied by code identity (gameSha) rather than the git label
is a metric-review proposal below, for the coordinator / Steve to
rule — this run does not re-score the bar itself.

## 10. Metric review

- **Anchor clause (bar 1):** as a proxy for code identity, the git
  anchor fails a code-identical corpus whenever an evidence-only
  commit lands mid-band — which the standard process (commit pilot
  evidence, then launch confirm) makes routine. Proposed revision
  for the next run: judge code identity by `gameSha` (single on
  every file) plus an empty `src/`+`scripts/` diff between anchors,
  and keep the git anchor as a recorded label, not a pass/fail
  gate. The pilot/confirm commit order should also be frozen in
  future preregs (commit pilot evidence only after the whole band,
  or accept the split up front).
- **Panel status set (bar 8):** the allowed set excludes
  `regression_watch`, but a watch on a 16-seed screen with a
  zero-crossing interval and a paired median of 0 is noise, not a
  regression — and the repo's own precedent is split
  (test-flipsocial-b treats a death-metric watch as a guardrail
  miss; test-partysize4-confirm-b records one investigated watch
  row and proceeds). Proposed revision: judge a `regression_watch`
  by its interval and pair split (fail only if the 95% interval
  excludes zero, or the paired median moves the wrong way), and
  require the deaths investigation (per-seed decomposition) in the
  evidence file. A 64-seed holdout remains the real resolver for a
  deaths-cost claim.
- **Mechanistic expectation:** the expectation (8 volleys, 7 wave-3)
  was met almost exactly (9 volleys, 7 wave-3; the 9th is a natural
  arrival firing at wave 4). The derivation in prereg §2/§6 held
  up — including the prediction that Caleb fires at wave 5 as
  before. No revision needed.
- **Analyzer's built-in verdict:** `--compare` prints NO-GO on this
  arm by construction (its pilotGO bar requires ctl bundled == 0).
  Future arms reusing this analyzer should note in the prereg that
  its verdict field is inapplicable and the frozen bars are the
  judge — as this file does in §3.
- **What the bars did not measure:** whether a wave-3 firing
  *should* happen (the trade — mid-build fight vs saved cells for
  a mirror fight — is the flip decision's design question, not
  this arm's); whether the gun's 5/14 wave-3 hit rate is the
  intended accuracy (the volleys deal 64–68 damage when they hit,
  0 when both shots miss); re-arming (none exists — §8).

## 11. Infra notes

- **Adoption:** 1830Z run timed out mid-confirm; this run (2130Z)
  verified the corpus from disk, found 6/16 confirm seeds missing
  per leg, re-ran only those 12 seeds with the same instrument /
  anchor / band. Pilot commit `81613563b` + prereg commit
  `6b9e75cf1` verified from git; base master commit at adoption
  `dbe748d46`; master has since moved to `04717109b`
  (journey-endgame r275) — rebase + proof re-run before reporting
  per the task brief (see commit note below).
- **Pre-flight re-run on this base (bar 1 proofs, all green):**
  test-killlootbundle-a 12/12; analyze --selftest 17/17;
  test-killrate-a 36/36; test-killrate-analysis-a 14/14;
  test-killarrive-b 12/12; test-killbundle-b 11/11 + --live 11/11;
  test-gunrate-a 39/39; test-cellgate-floor-b 17/17 + --live 24/24.
- **`node scripts/check.js --quick` (1830Z run's log,
  `cellgate-floor-b-check-quick.log`):** 308 passed, 36 failed in
  3820s. Failures are 120s timeouts (slow godpath/deed tests under
  load) plus pre-existing godpath measurement-proof exit-1s
  (test-measurement-*, test-trust-observer-neutrality,
  test-human-combat-parity, test-phone-frame-proof,
  test-prepared-runner-custody). None is in this arm's area (no
  cellgate / fieldFight / killloot / gunrate test failed). Not
  re-run in this adoption (64 min; arm instruments green).
  Pre-existing drift recorded in the prereg, still open:
  `test-cellgate-a.js` is 10/12 on this base (stale `^  loosed`
  shot counter after the Nov 22 searvoice narration change; the
  game spends correctly). Fixing it is out of this arm's area.
- **Telemetry deviation check:** `node scripts/telemetry-check.js
  --baseline …/telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-21/perseed-cellgate-floor-b-arm/*.json'
  --metrics national,table,wins,exiled` REFUSES recorder-corpus
  input ("all 16 --current rows carry top-level anchorCommit, so
  they are sweep recorder rows, not runs"). No LOUD lines; no
  investigation item. Scale-wall numbers are reported from the
  analyzer in §4.
- **Panel:** `evidence/2026-11-23/cellgate-floor-b-panel.md`
  (decision `review_required`; 16 paired cases) is attached to
  this evidence file by reference; before/after panels
  `cellgate-floor-b-panel-{before,after}.json.gz`, compare JSON
  `cellgate-floor-b-panel.json`.
- **Analysis artifacts:** per-leg analyses
  `cellgate-floor-b-{ctl,arm}-analysis.json`; compare
  `cellgate-floor-b-compare.json`; pilot analyses
  `cellgate-floor-b-pilot-{ctl,arm}-analysis.json` (1830Z run);
  leg logs `cellgate-floor-b-legs-{pilot,confirm}-{arm,ctl}[-remnant]-{1,2}.log`.
- **Files committed in this run:** the 12 remnant per-seed files
  (6 per leg, under `evidence/2026-11-21/`), 4 remnant leg logs,
  2 per-leg analyses, compare JSON, panel build + compare outputs,
  this evidence file. Pilot per-seed files + pilot logs were
  committed by the 1830Z run as `81613563b`.
- **No game-code change in this adoption:** the lever
  (CELLGATE_FLOOR param, fieldFights.js) + driver recording + arm
  test + panel builder landed in the prereg commit `6b9e75cf1`.
  This run added corpora, analysis, panel, and evidence only.

## 12. Findings backlog / blanks (for sim-findings.md — none appended mid-run; listed here for the coordinator)

- **Re-arm source missing (documented blank, §8):** no kill-loot
  holder ever re-arms after firing; a spent searcaster is a dead
  weight for the rest of the run. If the design wants the gun to
  matter twice, it needs a real re-arm source. Needs a design
  decision before any build (is a second firing intended at all?).
- **The fired gun leaves no social trace (documented blank, §8):**
  nobody comments on the gun, nobody inherits it, Emma's gun ends
  on her unburied corpse unlooted. The mechanic is behaviorally
  real but socially invisible in this instrument. Worth a look
  when the gun's fiction gets its pass — not this arm's fix.
- **Dmitri d114 death vs d150 carry (§8):** a recorded monster
  death with the villager still carrying the gun to day 150.
  Likely a second-wind return; unverified. If the instrument is
  miscounting deaths, other arms' death counts inherit it — a
  small verification item for whoever owns the death records.
- **Deaths watch on floor 3 (§7/§10):** needs a 64-seed holdout to
  resolve whether early firing costs lives on balance. Proposed
  as a follow-up instrument, not claimed here.
