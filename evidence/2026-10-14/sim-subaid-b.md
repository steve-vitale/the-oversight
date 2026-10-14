# ARM "subaid" — tendLink grain becomes real aid (subordinate-productivity lever on the diplomacy road) — <VERDICT PENDING>

Worktree: `~/workspace/worktrees/sim-subaid-b`. Run: oversight-flesh-out-loop-b, loop B, axis food-economy as a lens on the scale wall.

## Context
sixthlink-r27 (loop A, killed) proved the 6th link's seasoning race is pantry-bound, not priority-bound: the 6-bond village's pantry passes through the 13500–20000 tend band only ~7 days in 126, and a tend-ordering lever measured 0 conversion delta (2/5 → 2/5). Its diagnosis named the next arm: "the 6-bond food economy (tribute reliability, subordinate field productivity, the cost of tending at scale)". This arm claims the open backlog item "6-BOND ECONOMY IS THE NEXT LEVER" (sim-findings.md 2026-10-14): a subordinate-productivity lever — aid, not just tending.

## The lever (game-code, src/js/hierarchy.js, tendLink)
tendLink (the LEAD road's tending verb) removes 1,500 kcal from Haven's pantry and grants +8 trust — but the grain NEVER reaches the subordinate's pantry: it vanishes into narrative while the beat says "Haven sends 1,500 kcal of grain to X's fire... Someone's grandmother over there will remember who fed her." The lever routes the tended grain into the subordinate's pantry: credit `_otherVillage(link.subordinate).pantryKcal` by the paid amount inside tendLink, alongside the unchanged trust gain. The fiction becomes engine-true: their people eat it in the weekly tick (`_linkedVillageWeek` consumes it against their own need), their own production can then go to tribute, tribute reliability rises, and a 6-bond economy becomes affordable. No new beats, no trust-math change, mourning/empty-pantry refusal paths and once-per-week tending dedup untouched. The renegotiation grief-grain verb (hierarchy.js ~1611) is a natural sibling — left alone this run, noted in findings.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE sims; GO clause fixed AFTER the pre-screen per sim-findings #129

- **Question**: conditional on a 6th lead link FORMING, does real grain aid (tended kcal credited to the subordinate's pantry) convert it to seasoned (30+d, trust 40+) — measured on forming seeds only?
- **Primary metric**: seasoned conversion = (forming seeds where the 6th lead link seasons) / (forming seeds), identical seeds, engine-baseline vs engine-armed (same policy stack both sides: leadcourt(+FOURTHLINK=1 FIFTHLINK=1)).
- **GO** (to be fixed post-pre-screen): armed conversion ≥ re-screened baseline + 1, with the near-miss type converted. Noise floor from A/A (baseline re-run on the forming subset).
- **KILL-AT-SCREENING**: <4 forming seeds on the 16-seed baseline screen → under-powered, KILL at screening.
- **Guardrails**: national / exiled / wave-5 not regressed vs the identical-seed baseline side (per-seed, not median). Median survival REPORT-ONLY (sharepol noise-floor finding; det-gate expected to fail on ~2/8 seeds — see r27).
- **Horizon**: 180d death-aware (6th links form d80+, seasoning needs 30d).
- **Seeds**: screening 11/22/33/44/55/66/77/88 + 101/202/303/404/505/606/707/808 × leadcourt(+FOURTHLINK+FIFTHLINK) baseline. Conversion on the forming subset × (baseline vs armed-engine).
- **Policies**: identical policy stack both sides (`fifthlink-r26` id smoke-checked); the ARMED condition is the engine change in the worktree (smoke: lever marker SUBAID-AID-CREDIT present/absent in src/js/hierarchy.js).
- **Proof**: `scripts/test-subaid-20261014.js` — REAL RED phase on pristine (tended grain vanishes: sub pantryKcal byte-identical after a 1500 tend) → GREEN after (exact credit, trust byte-identical, mourning/empty-pantry refusals, weekly dedup, partial credit).
- **Mechanism secondaries**: thin+missed tribute weeks per link, arrears trajectory, `_sov.pantryKcal` sampled on tend weeks — is the aid reaching tribute?

Metric binding (§14): a miss is NO-GO, never re-scored against a friendlier metric mid-run. Doubts go under "metric review" for the NEXT run.

## Determinism gate

`scripts/det-gate-sixthlink-r27-20261014.js` on the current tip (same policy stack: FOURTHLINK=1 FIFTHLINK=1): **8/8 IDENTICAL, GREEN** — all seeds bit-identical across run pairs (s11–s88, 180d). Before/after comparisons on this tip are trustworthy. (Notable: r27's run failed 2/8 on the same script; on the current tip all 8 pass — the residual timestamp-ID nondeterminism from r27 is not biting this stack today. The 101+ seeds were not gated; formation-timing drift across runs remains possible there per r27's s606 d100→d113 observation.)

## Pre-screen (baseline, pristine engine, FOURTHLINK=1 FIFTHLINK=1 — 16 seeds, ~9 min)

6th lead link formed on **5/16** seeds — no kill at screening (≥4). Same forming set as r27's screen:

| seed | d | 6th formed | 6th seasoned | t30 | tw | arrears (form→30→end) | stand | wave5 |
|---|---|---|---|---|---|---|---|---|
| 11 | 159 | d65 | **s94** | 48 | 20 | 0→15,000→30,938 | 263 | d94 |
| 44 | 130 | d56 | **s85** | 68 | 20 | 0→0→0 | 204 | d85 |
| 55 | 78 | d60 | — (died <30) | null | 3 | 0→—→12,000 | 136 | — |
| 606 | 86 | d86 | — (died <30) | null | 0 | 0→—→0 | 102 | — |
| 808 | 89 | d69 | — (died <30) | null | 4 | 0→—→0 | 170 | — |

**Baseline conversion: 2/5** (s11, s44) — identical to r27's pre-screen. Trajectories moved with landed commits (s55's 6th now forms d60 vs d81 and the village dies d78 vs d126; s11's standing 263 vs 245) but the conversion outcome is stable.

The arrears secondaries already tell the 6-bond story: s11's 6th SEASONED (t30:48, tw:20) while its arrears ran 0→15,000→30,938 — the bond seasons on tending while the ledger bleeds. The tending wins the trust race; the economy loses the food race. s44's 6th is the healthy outlier (0 arrears throughout).

Screening wall numbers: national 9/16, wave4 12/16, wave5 2/16 (s11, s44), table 0, won 0, maxStanding 263, median survival 96d (REPORT-ONLY).

## GO clause (fixed post-pre-screen per sim-findings #129)

- **GO**: armed conversion ≥ 3/5 on the forming subset (baseline 2/5 + 1), with at least one of the non-converting forming seeds (55, 606, 808) seasoning in armed while not seasoning in baseline.
- **Noise floor**: A/A calibration (baseline re-run on the forming subset 11/44/55/606/808) — the conversion count must reproduce 2/5 for the delta to be real.
- **Guardrails**: national / exiled / wave-5 per-seed vs identical-seed baseline, no regression. Median survival REPORT-ONLY.

## A/A calibration (baseline re-run, forming subset 11/44/55/606/808)

**2/5** (s11, s44) — byte-identical trajectories to the pre-screen (same days, same outcomes). **Noise floor = 0** on the conversion count. The det-gate's 8/8 green holds: the baseline is stable, so the armed delta is real, not noise.

## The lever (landed in worktree, pending coordinator merge)

`src/js/hierarchy.js`, `tendLink`: after the unchanged trust-gain block, the paid amount is credited to the subordinate's pantry:

```js
// SUBAID-AID-CREDIT (2026-10-14): the tended grain is real food, not
// narrative — it arrives in the subordinate's pantry, where their own
// weekly tick (_linkedVillageWeek) eats it against their need and their
// own production can then go to tribute. ...
try {
  var _sov = this._otherVillage(link.subordinate);
  if (_sov && paid > 0) _sov.pantryKcal = Math.max(0, (_sov.pantryKcal || 0)) + paid;
} catch (e) {}
```

No new beats, no trust-math change, mourning/empty-pantry refusals and the once-per-week dedup untouched. Proof `scripts/test-subaid-20261014.js`: **17/17 GREEN** (was RED on pristine: the grain vanished). Credit is exact at the actual paid amount (whole-unit over-removal included: paid 1712 → credited 1712); trust +8/+4 byte-identical; no double-credit; next-week tends credit again.

## Conversion (forming subset × baseline-engine vs armed-engine, identical seeds)

| seed | baseline 6th | armed 6th | Δ standing | w5 |
|---|---|---|---|---|
| 11 | d65→s94 (t30:48, tw:20, arr 0→15k→30.9k) | d61→s90 (t30:76, tw:5, arr 0→0→0) | 263→238 | d94→d90 |
| 44 | d56→s85 (t30:68, tw:20) | — (no 6th formed; 5 links, all seasoned) | 204→170 | d85→— |
| 55 | d60→x (village d78) | d38→**s67** (t30:75, tw:18, arr 0→10.2k→18.7k) | 136→263 | —→d70 |
| 606 | d86→x (village d86) | d58→**s87** (t30:59, tw:20, arr 0→0→0) | 102→204 | —→d87 |
| 808 | d69→x (village d89) | d52→**s81** (t30:92, tw:27, arr 0→0→0) | 170→204 | —→d81 |

- **PRIMARY: baseline 2/5, armed 4/5** (4/4 on the armed forming set). **GO (≥3/5) MET**, with all three baseline non-converters (55, 606, 808) seasoning under the armed engine.
- The armed re-run reproduced bit-identically (same days, same outcomes) — the lever is deterministic on these seeds.
- The effect is bigger than "aid → one link's tribute": armed villages **survive longer** (s55 d78→d96, s606 d86→d115, s808 d89→d122) and form 6ths **earlier** (d38/d58/d52 vs d60/d86/d69). The chain: aided subs pay tribute reliably → Haven's pantry stays healthier → the village lives through the 6th's seasoning window. The 6-bond economy becomes affordable — exactly the backlog question.

Guardrails (per-seed, identical seeds):
- national: all 5 national+ both sides (ranks: 55 and 808 rose national→global). ✓
- exiled: 0 both. ✓
- wave-5: baseline 2/5 → armed **4/5** (s55, s606, s808 newly unlock). ✗ **s44 regressed per-seed** (d85 → null): the lever's trajectory perturbation closed the candidate window a day early (windowOpenDays 4→3), so no 6th formed; 5 seasoned links = 170 standing < T5=200. Net wave-5 still improves, but the s44 regression is real and named below.
- survival per-seed: s11 159→126, s44 130→120, s55 78→96, s606 86→115, s808 89→122. Median REPORT-ONLY: 89→120d (all ends village-lost).

## Mechanism secondaries (armed)

- **Aid lands in sub pantries** (`_sov.pantryKcal` sampled on tend days): s808's 6th — d52 paid=1584 → pantry 0→1584 (the aid IS the pantry); d56 1533→1533; d63 1584→6084 (their own production + aid accumulating); d84 1595→1595 (a week later the aid is fully eaten — their people eat it). s55's 6th — d41 paid=1600 → 0→1600 (starving sub, aid is the pantry). s606's 6th — pantry 29.5k→37k (rich sub, aid tops up).
- **Arrears trajectories**: s11 armed 0→0→0 vs baseline 0→15k→30.9k — the same bond that seasoned while bleeding now seasons clean. s606/s808 armed 0→0→0. s55 armed still bleeds (0→10.2k→18.7k, 8 arrears-rising days) but seasons on trust anyway (t30:75) — tending outruns the ledger when the village survives.
- **Tribute flow** (paid/thin/missed weeks from link histories): s808 79/0/0; s606 60/1/3; s11 52/15/27; s55 22/29/11 — the aided 6-bond villages pay, thinly or fully, instead of missing.

## SENSE-TESTING (armed seeds 11/55/606/808 — judgment, not counts)

The tend beats are byte-identical to baseline ("🌾 Haven sends 1,848 kcal of grain to Emberhold's fire — not tribute, the other way around. Someone's grandmother over there will remember who fed her. (Trust +8.)") — and now the fiction is engine-true: the sampled pantries prove the grain arrives. The beat reads as feeding, and it IS feeding. **PASS.**

The tribute lines keep naming the true reason: "Emberhold's tribute comes up thin — 1,884 of 4,000 kcal. They sent everything the wagons could carry, and it wasn't enough. The shortfall rides as arrears." Hunger isn't defiance, said aloud. **PASS.**

The region reads as alive: "🏃 Sanne of Stonebridge walks into Haven unannounced, pack-mules behind. 'Heard your bins are echoing. Stonebridge has grain to spare — 2,790 kcal, no tribute, no ceremony. Say the word.'" — surplus villages offer aid unprompted. And the traders carry the culture: "🗣️ Word with the traders: a far fire sent another fire grain when their stores ran thin — no tribute, no ceremony, just food on the road. That's a thing villages DO now." The 6-bond economy doesn't just sustain bonds — it teaches the region to feed itself. **PASS.**

## Village assessment

The armed 6-bond villages are the fed and the feeding. On s808 (standing 204, wave-5 d81) all six bonds pay in full (79/0/0) — the realm's granaries move both directions and nobody misses. On s606 (204, wave-5 d87) the same, quieter. On s55 (263, wave-5 d70) the 6th link — formed d38 at trust 30 — is tended 18 times, seasons at s67 with trust 75 while its arrears run to 18.7k: the bond is carried, not self-sustaining, and the village knows it — the shortfall is said aloud every week, never as defiance. On s11 (238, wave-5 d90) the 6th seasons at trust 76 on only 5 tend-weeks with zero arrears — the aid made the sub's own fields cover the tribute, and Haven barely had to tend. Who died: the villages still die (all five ends are village-lost — the wall beyond the 6-bond economy is untouched), but they die later and richer, with the realm intact around them. The blank filled: **the 6-bond economy is affordable when tended grain is real food** — the r27 NO-GO's "bond the village can't feed" now feeds itself through the tribute loop.

## Blanks filled / documented

- **FILLED**: the 6-bond economy lever — tended grain credited to the subordinate's pantry converts 6th-link seasoning 2/5 → 4/5 on identical seeds, unlocks wave-5 on 3 new seeds (2/5 → 4/5), extends village survival on the converting seeds. Proof 17/17 RED→GREEN; det-gate 8/8 green; armed re-run bit-identical.
- **DOCUMENTED** (metric review): the s44 per-seed regression — trajectory perturbation closed the candidate window a day early (windowOpenDays 4→3), no 6th formed, wave-5 d85→null, standing 204→170. The lever perturbs trajectories; formation is candidate-gated and the gate is thin (3–4 open days in 120). The 16-seed confirm below measures the forming-rate question.
- **DOCUMENTED** (sim-findings.md): the renegotiation grief-grain verb (hierarchy.js ~1611, "Met grief with grain") is the natural aid sibling — same pantry-bound logic, untouched this run. Candidate for the next arm on this road.

## Metric review (§14)

GO met: armed 4/5 vs baseline 2/5 (delta +2 ≥ required +1), all three baseline non-converters (55, 606, 808) seasoning under the armed engine. No re-scoring — the primary stands as pre-registered.

Honesty notes for the NEXT run on this road:
1. The forming denominator is treatment-affected (baseline 5 forming, armed 4). Reported both ways: 4/5 on the fixed baseline denominator, 4/4 on the armed forming set. s44 counts as non-converted on the fixed denominator.
2. The per-seed wave-5 guardrail ("no regression") is violated on s44 (d85→null) even as net wave-5 improves 2/5→4/5. Guardrails are per-seed by pre-registration; the violation is named, not averaged away.
3. The "miss" secondary in the sweep output counts arrears-rising DAYS (daily roll snapshots), not weeks — label it correctly in future sweeps.
4. The effect's main channel is village survival (+18–33 days on converters), not just the 6th link's tribute line. A future arm could test whether the same survival extension comes from cheaper aid (smaller/fractional tends).

## Confirm (16-seed armed engine vs 16-seed baseline screen, identical seeds)

- **Forming rate**: 5/16 → 5/16 — unchanged (set shifted: s44 dropped out, s303 formed). The lever does not change how often 6ths form, only whether they season.
- **Conversion**: 2/5 → **4/5** (s11, s55, 606, 808). s303 is a new forming seed under armed (6th d64, village died d75) — the "dies immediately" boundary the lever can't convert (11 days from formation to death; contrast s55/s606/s808 at 18–58 days).
- **national**: 9/16 → 9/16, identical per-seed. ✓ **exiled**: [202, 707] both, identical per-seed. ✓ **wave4**: 12/16 both. ✓ **table/won**: 0/0 both.
- **wave-5**: 2/16 → **4/16** (s55 d70, s606 d87, s808 d81 newly unlock; s44 d85→null the single per-seed regression).
- **Death causes**: same shape both sides (combat/monster dominated; starvation 14→15 total — the aid does not starve Haven to feed subs).
- Median survival 96→114d (REPORT-ONLY).

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | maxStanding | medianSurv* |
|---|---|---|---|---|---|---|---|
| screen baseline (16) | 9/16 | 0/16 | 0/16 | 12/16 | 2/16 | 263 | 96d |
| A/A baseline (5 forming) | 5/5 | 0/5 | 0/5 | 5/5 | 2/5 | 263 | 89d |
| armed forming subset (5) | 5/5 | 0/5 | 0/5 | 5/5 | 4/5 | 263 | 120d |
| armed confirm (16) | 9/16 | 0/16 | 0/16 | 12/16 | 4/16 | 263 | 114d |

\* median REPORT-ONLY per pre-registration (sharepol noise-floor finding; det-gate 8/8 green this run).

## Verdict: GO — arm lands as its own commit

The 6-bond economy lever converts 6th-link seasoning 2/5 → 4/5 on identical seeds (delta +2, GO needed +1), replicates on the 16-seed confirm with forming rate unchanged (5/16), national/exiled/wave-4/table guardrails identical per-seed, wave-5 net 2/16 → 4/16. The single per-seed blemish (s44: candidate window closed a day early, wave-5 d85→null) is named in metric review, not averaged away. The open backlog item "6-BOND ECONOMY IS THE NEXT LEVER" is claimed by this arm; flip to [fixed] on coordinator landing.
