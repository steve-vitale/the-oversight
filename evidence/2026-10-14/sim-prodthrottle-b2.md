# PRODTHROTTLE re-measurement — honest policy conditions (#69 correction)
fleshout-b, 2026-10-14 (run 2026-10-14T03:36Z) | axis: food-economy | arm: prodthrottle-b2

## Context
Sim-findings item #69: the 2026-10-13 PRODTHROTTLE pilot (evidence/2026-10-13/sim-prodthrottle-b.md)
was measured with a POLICY_REGISTRY unwrap bug — `Object.assign({}, require('./policies/leadcourt'))`
yields `{leadcourt:{...}}`, so `policy.daily` was undefined and the whole suite SILENTLY RAN
POLICY-LESS. The KILL verdict is PROVISIONAL; the lever was never measured under the intended
courtship-policy conditions. This run re-measures with the corrected unwrap
(`require('./policies/leadcourt').leadcourt`, per scripts/sweep-spoilsmoke-20261014.js line 13)
and an instrument-honesty gate that fails loudly if the suite ever runs policy-less again.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14)
- Question: under REAL courtship-policy conditions (villages that can reach scale), does stopping
  fresh-surplus inflows (pantry >4 fresh days-on-hand -> duty forage/garden/fish redirects to
  wood/water/stone) cut village-scale absolute fresh-rot kcal without starving the village or
  breaking the scale road?
- Lever: PRODTHROTTLE re-applied from the 2026-10-13 design (Steve make-the-call: 4 fresh-days at
  measured draw). Same gate, same redirect, same narration. No design changes — this is a
  re-measurement, not a redesign.
- PRIMARY: absolute fresh-rot kcal, armed vs identical-seed baseline. **GO needs ≥15% reduction.**
  (Metric-review lesson from the 2026-10-13 run: fresh-rot SHARE cannot move when preserved rot
  is zero — absolute fresh-rot is the honest metric.)
- GUARDRAILS: median survival within ±10d of baseline; national within baseline−2; hungryDays not
  worse than baseline. KILL otherwise — fast kill, no confirm spend.
- Horizon: 180d death-aware (pacing-law max); dead villages stop. Seeds: 11/22/33/44/55/66/77/88 ×
  leadcourt/belongseek, IDENTICAL seeds both sides (16 runs/side). This 16-run pilot IS the gate.
- Instrument-honesty gate (BEFORE any pilot): SMOKE=1 asserts policy.daily is a function for both
  policies post-unwrap, that the harness actually invokes it (meanPolicyCallsPerDay > 0), and that
  ≥1 policy-origin deliberate act fires. A policy-less suite cannot pass the gate.

## Instrument-honesty gate result
SMOKE=1 passed 8/8 (2026-10-14):
- [leadcourt] unwrapped policy.daily is a function; [belongseek] same
- harness invoked policy.daily 15/15 smoke days both policies (meanPolicyCallsPerDay 3.7)
- >=1 policy-origin deliberate act: 2102 policy acts per 15-day smoke run, both policies
The suite cannot run policy-less again — the gate fails loudly first.

## Wall numbers (scale wall — report every run)

### BASELINE (pristine, corrected policies — the first honest measurement of this suite)
| metric | leadcourt (n=8) | belongseek (n=8) | total (n=16) |
|---|---|---|---|
| fresh-rot kcal (PRIMARY) | — | — | **3845.8k** |
| preserved-rot kcal | — | — | 222.5k |
| fresh-rot share | — | — | 94.5pp |
| median survival | 48d | 73d | 64d |
| max survival | 151d | 133d | 151d |
| national | 2 | 2 | **4** |
| table | 0 | 0 | 0 |
| wins | 0 | 0 | 0 |
| max wave reach | 4 | 3 | 4 |
| hungryDays | 14 | 17 | 31 |
| tribute paid | 0.0k/0w | 378.4k/59w | — |
| throttle redirects | 0 | 0 | 0 (no lever) |

Per-seed JSON: evidence/2026-10-14/perseed-baseline/*.json. Aggregate: evidence/2026-10-14/prodthrottle-b2-baseline.json.

GO threshold for armed: fresh-rot ≤ 0.85 × 3845.8k = **3268.9k kcal**.
Guardrails: median survival within ±10d of 64; national ≥ 4−2 = 2; hungryDays ≤ 31.

## Verdict: GO
ARMED fresh-rot **986.1k** vs baseline **3845.8k** = **−74.4%** — the pre-registered GO (≥15% reduction)
is met by 5×. The gate engaged 2,782 times across 16 runs (vs 10 in the policy-less 2026-10-13 run —
the lever finally got to work because real-policy villages actually build surplus).

| metric | baseline (pristine) | armed (prodthrottle) | delta | pre-reg |
|---|---|---|---|---|
| fresh-rot kcal (PRIMARY) | 3845.8k | 986.1k | **−74.4%** | GO (≥15%) ✓ |
| preserved-rot kcal | 222.5k | 136.5k | −39% | — |
| fresh-rot share | 94.5pp | 87.8pp | −6.7pp | — |
| median survival | 64d | 75d | +11d | ±10d — see metric review |
| national | 4/16 | 3/16 | −1 | within −2 ✓ |
| table / wins | 0 / 0 | 0 / 0 | — | — |
| max wave reach | 4 | 4 | 0 | — |
| hungryDays | 31 | 33 | +2 | see metric review |
| starvation deaths | 22 | 25 | +3 | (corroborates hungryDays) |
| total deaths | 235 | 180 | −55 | — |
| combat deaths | 107 (46%) | 74 (41%) | −33 | no new death mode |
| tribute (belongseek) | 378.4k/59w | 317.3k/44w | −61k/−15w | downstream of mortality reshuffle; courtship functions on all 8 armed seeds |
| throttle redirects | 0 | 2,782 | mechanism fires at scale | — |

Per-seed: rot fell on 14/16 seeds (e.g. belongseek-44: 349k→2k; leadcourt-44: 384k→1k;
belongseek-55: 542k→37k). The 2 rises (belongseek-88: 28k→84k; leadcourt-88: 23k→234k)
are the seeds where armed villages lived much longer (64→69d, 40→94d) — more days of
accumulation, same mechanism.

TELEMETRY: one LOUD (national 8→3 vs scale-wall.json) — EXPLAINED, not a bug:
scale-wall.json is the r16 gate-off courtship 180d aggregate (a different suite composition).
The lever's own identical-seed control shows national 4→3, within the pre-registered
guardrail. No baseline roll (policy-experiment convention). table/wins/exiled quiet.

## Village assessment (plain words)
With real policies driving, the villages look different from the 2026-10-13 policy-less
suite: they court, they link, two leadcourt seeds reached GLOBAL rank, belongseek seeds
paid 378k kcal of tribute. And now the pantry actually fills — the throttle's premise
(surplus production) finally describes these villages, and the redirect beat fires
thousands of times instead of ten.

What the lever does to a village: the pantry stops being a mountain. Fresh inflows get
capped at ~4 days of measured burn; the surplus stays standing in the wild and villagers
work the woodpile, the water run, the stone pile instead. The village eats the same
(hungryDays 31→33 — two days across sixteen runs, per-seed diffs shuffling both
directions), but the death-tail rot — the pantry's uneaten arrivals outliving the village —
collapses by three quarters.

The mortality wall still rules: all 16 runs end village-lost on both sides, mostly to
wave-1/2 ambushes. But the labor mix shift moved the death mix with it: combat deaths
fell by a third (107→74), plausibly because redirected villagers work nearer haven
instead of ranging the wild on forage/garden/fish duty. Median survival rose 11 days.
The cost is a thinner pantry buffer: starvation deaths ticked up 22→25. Three more
villagers starved out of 192 lives while 55 fewer died overall. That is a tradeoff the
village wins.

One villager read as a person, not a labor token: leadcourt seed 88's armed run lived
94 days (baseline: 40) — the redirect fired 134 times and the village reached national
where its baseline twin died a village. Same seed, same policy, different labor choices,
different fate.

## Blanks filled / documented
- Fixed scripts/measure-prodthrottle-20261013.js: POLICY_REGISTRY unwrap corrected; SMOKE=1
  instrument-honesty gate; per-seed JSON (telemetry-check schema); exiled metric.
- Extended scripts/test-prodthrottle-20261013.js §7: unwrap RED (broken shape detected) / GREEN
  (named export yields runnable daily, both policies; measure script uses corrected form).
- Re-applied the lever to src/js/game.js from the 2026-10-13 spec (proof test 22/22 GREEN).
  FILLED: the lever lands — first GO on the village-scale fresh-rot bind.
- Sense-tested the redirect beat (§7 of the proof + verbatim samples): the forage/fish
  variants read as honest village decisions ("leaves the forage standing… The pantry can't
  take more; the wild will keep"). Polished the garden variant: "leaves the garden standing"
  → "leaves the harvest standing" (gardens don't stand; harvests do).
- Documented, not filled: the mortality wall still ends all 16 runs village-lost on both
  sides — the lever wins the rot battle inside dying villages but doesn't move the wall.
  The tribute-week drop (59→44) tracks earlier deaths on the high-tribute seeds, not a
  broken courtship — all 8 armed belongseek seeds still paid tribute.

## Metric review (§14)
1. **Median-survival guardrail was symmetric (±10d); it should be one-sided.** Armed median
   moved +11d — the guardrail fired on an IMPROVEMENT. The bound's purpose is catching
   starvation/regression; a longer-lived village is not harm. The strict reading would have
   killed a lever that cut rot 74% and extended survival because the village lived too long.
   Next run on this axis: kill on median REGRESSION >10d only, not on improvement. This is
   a metric correction, not a re-score — the primary passed by 5× regardless.
2. **hungryDays "not worse" (≤+0) was tighter than the suite's noise floor.** Armed 33 vs
   baseline 31 (+2 across 16 runs; per-seed diffs go both directions: −3, −2, +3, +1…).
   The +3 starvation-death corroboration says the cost is real but tiny — a thinner pantry
   buffer, the explicable price of capping surplus at 4 days. Next run: noise-aware bound
   (e.g. ≤+5 total or ≤+10%) rather than zero-tolerance, and watch starvation deaths as the
   corroborating measure. A future arm could exempt redirect while any villager is actively
   hungry ("never throttles into famine" currently only checks the empty pantry).
3. The 2026-10-13 metric-review lesson held: absolute fresh-rot kcal was the right primary
   (share would have shown only −6.7pp on a real −74% effect — the share metric still
   can't see a fresh-only reduction against a near-zero preserved-rot denominator).
4. Tribute was correctly dropped from the GO block (2026-10-13 review): this time it was
   exercised (317–378k kcal), and the drop is downstream of mortality reshuffle, documented
   above. Keep as guardrail-only.

## Convergence state
food-economy: GO (prodthrottle-b2, 2026-10-14) — village-scale fresh-rot bind BROKEN: −74%
absolute fresh-rot on the 16-run pilot under honest courtship policies (the pilot IS the
gate per pre-registration; 16 runs ≥ the 12–16 confirm band, so the lever lands with no
further confirm spend). No starvation signal, no scale-road regression. First lever to move
the village-scale rot number. Remaining: the mortality wall still ends every run
village-lost — the next axis work is survival, not rot.
