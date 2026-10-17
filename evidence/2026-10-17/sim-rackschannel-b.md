# SIM-RACKSCHANNEL — the racks-channel: scholar's nightly share eats from the racks (ARM sim-rackschannel-b, loop B, food-economy)

Date: 2026-10-17 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-rackschannel-b
Axis: food-economy (scale-wall lens) — the #444 (sim-trig6-b) named next mechanism, via sim-harvstop-b's metric review: "the racks-channel (scholar eats preserved → guard lifts → more smoking) as a named mechanism."

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the cook's duty-time smoke drive carries a racks-cap guard (game.js): it stands down smoking when the preserved+rendered stock ≥ 125 kcal/person/day × roster × (ownShelf−2). If the scholar eats preserved-first (diet composition), preserved stock drops, the guard lifts, and the cook smokes more fresh surplus before it rots. Is the channel open with headroom, or saturated/closed?
- **Census first** (this run's step 1): 8-run diagnostic on the base substrate (FEASTSCALE_R13=1, SEATDRIVE=0, seeds 4601–4604 × {leadfeast, belongfeast}) measuring scholar/village intake composition and guard-bind frequency. The census — not assumption — decides whether the lever gets built.
- **Lever**: scripts/policies/rackschannel.js (RACKSCHAN=1, default OFF; wraps leadfeast→rackslead, belongfeast→racksbelong — the FEASTSCALE_R13=1 substrate). Policy-side only, zero src/js. When the channel is OPEN (preserved+rendered ≥ blind racks-cap 125×roster×13 AND fresh near-expiry surplus on the shelves), the scholar's nightly villageMeal share draws preserved/rendered-first (two-phase pantryDraw: the guard's numerator first, then the engine's own fresh-first order). Pure reorder: same want, same kcal; spoiled never drawn (pantryDraw skips spoiled — proof G7); preserved-short falls through to fresh; never starves. Voiced beat (deterministic 3-rotation, never RNG).
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat); base courtship policies only. 180d death-aware; dead villages stop. Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: 8 FRESH seeds 4601-4608 x {leadfeast, belongfeast} x {control, armed} = 32 runs, IDENTICAL seeds both sides. Banned/used: 4201–4208, 4301–4308, 4401–4408, 4501–4508 (embedded ranges; sweep stops on hit).
- **PRIMARY** (binding): waste-rate (wasterate instrument: pantryRotKcal / (pantryStartKcal + pantryInKcal), scripts/test-wasterate-20261017.js conventions) armed ≤ 0.85x control.
- **COVERAGE GATE** (mechanism attribution, binding): armed smokeKcal − control smokeKcal ≥ 0.5 × armed scholarMeal preserved kcal. A waste-rate win without the smoke delta is NO-COVERAGE, not a GO — the win must come through the channel (more smoking), not another path.
- **MECHANISM-ENGAGEMENT** (vacuous-pass protection): rcFires ≥ 20 armed-side; armed scholarMeal preserved > control. If the mechanism never engages, the run is a KILL (invisible effect), not a GO.
- **Guardrails**: starvation deaths armed ≤ control; median survival ≥ control−10d; national ≥ control−2/16; no new death mode; no laundering (spoiled never smoked — proof G7 pins it).
- **Det-gate**: bit-identical reruns both sides (40d) before trusting comparisons; SMOKE=1 honesty gate proving the layer actually ran.
- **Metric-review note (§14)**: the harvstop-b 0.75x bar was too ambitious for its heterogeneity; this run pre-registers 0.85x per the coordinator's brief, plus the paired-median as a reported (not binding) lens.

## Census results (scripts/diag-rackchannel-20261017.js — 8 runs, base substrate, instruments DET-green)

| run | days | scholar meal (main) | scholar pantry top-up | guard binds (cook res.) | fresh near-expiry left unsmoked | cook smoked (open) |
|---|---|---|---|---|---|---|
| belongfeast s4601 | 147 | pres 17k / fresh 180k (8.6% pres) | pres 16k / fresh 16k | 18 | 131k kcal | 75 batches / 169k |
| belongfeast s4602 | 98 | pres 21k / fresh 123k (15%) | pres 13k / fresh 0k | 265 | 3,675k kcal | 50 / 148k |
| belongfeast s4603 | 180 | pres 22k / fresh 162k (12%) | pres 6k / fresh 1k | 402 | 3,364k kcal | 121 / 363k |
| belongfeast s4604 | 116 | pres 21k / fresh 184k (10%) | pres 8k / fresh 1k | 66 | 636k kcal | 69 / 165k |
| leadfeast s4601 | 180 | pres 44k / fresh 237k (16%) | pres 16k / fresh 10k | 80 | 827k kcal | 56 / 148k |
| leadfeast s4602 | 146 | pres 41k / fresh 239k (15%) | pres 23k / fresh 7k | 71 | 1,132k kcal | 37 / 88k |
| leadfeast s4603 | 180 | pres 38k / fresh 212k (15%) | pres 47k / fresh 0k | 406 | 7,122k kcal | 72 / 242k |
| leadfeast s4604 | 180 | pres 41k / fresh 206k (17%) | pres 7k / fresh 2k | 131 | 1,095k kcal | 89 / 203k |

Census verdict — **the channel is OPEN with LARGE headroom** (this is why the lever was built):
1. The "scholar eats preserved-first" hypothesis is FALSE for the main meal: the scholar's nightly villageMeal share (up to 2000 kcal, ~85-90% of scholar intake) draws FRESH-first (84–91% fresh). Only the competentEat top-up is preserved-first — and it's small (~110 kcal/day).
2. The racks-full guard binds on 18–406 cook-resolutions per run (the cook resolves ~3x/day), leaving 131k–7.1M kcal of fresh near-expiry unsmoked per run. (Per-resolution eligible scans; the same stack can appear across ~6 resolutions in its 2-day window — unique kcal roughly /6, still 20k–1.2M.)
3. Binds fire at preserved stock ≈ 125×roster×13 (the blind cap — the cooks are unskilled on this substrate), so the blind-cap proxy in channelOpen is ~exact here.
4. The cook smokes 88–363k kcal when the guard is open — the drive works; it just stands down too often.
5. Pemmican (foodState 'pemmican') and cooked are NOT in the guard's numerator — only preserved/rendered. The lever correctly targets preserved/rendered only.

Attributable prize: the scholar's ~1000–2000 kcal nightly share redirected from fresh to preserved drains the guard numerator by the same; each redirected kcal unlocks ~1 fresh kcal of smoking (cook budget 4000/resolution). Expected smoke delta on high-bind runs: 50–200k kcal/run.

## Proof results (scripts/test-rackschannel-20261017.js — run BEFORE any sims)

RED (RACKSCHAN unset) + GREEN (RACKSCHAN=1), one process per phase. PROOF GREEN, all checks passed:
- R1 gate-off byte-identical: rackslead == leadfeast and racksbelong == belongfeast, 40d day-hashes, both phases.
- R2 gate-off on the pinned fixture: meal taken identical (1000 == 1000), no firing, channelOpen honestly reads true (condition, not action).
- G1 channelOpen on the pinned fixture (blindCap=19500, pk=47500).
- G2 preserved-first: channel fired, pres=1000 covers the want=1000.
- G3 same want: scholar no worse off (1000 == 1000), taken within one piece.
- G4 thin pantry (no preserved): channel closed, meal identical to control, fresh-first.
- G5 preserved pinned but no fresh near-expiry: channel closed (nothing to protect).
- G6 preserved short of want: falls through to fresh, total == control (never starves for the channel).
- G7 NO LAUNDERING: spoiled preserved stack untouched (units 10 → 10).
- G8 determinism: identical fixture meals.
- G9 beat voiced exactly once per firing; rotation deterministic across firings.

Sense-read of the beat (deterministic 3-rotation, no RNG in copy):
> "The racks are full — you eat from the kept stores tonight, and the fresh pile goes to the smoke, not the rot."
PASS — reads as a person making a sensible call (names the real situation, the honest reason, the consequence). The rotation (3 variants keyed on fire count) answers the harvstop-b repetition finding.

## Sweep results

32 runs: 8 fresh seeds 4601–4608 x {leadfeast, belongfeast} x {control, armed}, 180d death-aware, identical seeds both sides. SMOKE+DET gates green (40d reruns byte-identical both sides). Per-seed JSONs: evidence/2026-10-17/perseed-rackschannel-sweep/. (One mid-sweep service restart wiped /tmp and killed the sweep process at 14/32 — per-seed JSONs under ~/workspace survived; the remaining 18 re-ran clean. Lesson re-confirmed: never keep recovery-critical state in /tmp.)

| metric | control (n=16) | armed (n=16) | pre-reg |
|---|---|---|---|
| waste-rate (**PRIMARY**) | 0.20382 | 0.20587 | **MISS** (ratio 1.010, need ≤ 0.85) |
| smoke delta (**COVERAGE**) | — | +500k kcal | **MISS** (need ≥ 0.5 × 1529k = 764k) |
| rcFires (engagement) | 0 | 1095 | **PASS** (≥ 20) |
| scholarMeal preserved | 451k | 1529k | **PASS** (> control) |
| starvation deaths | 1 | 1 | **PASS** (≤ control) |
| national | 13/16 | 13/16 | **PASS** (≥ 11) |
| median survival | 180d | 180d | **PASS** (≥ 170d) |
| max wave | 3 | 3 | (info) |
| arc ≥ 3 | 16/16 | 16/16 | — |
| table | 15/16 | 16/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| exiled | 0/16 | 0/16 | — |

Paired waste-rate ratios (armed/control): 0.391, 0.517, 0.576, 0.639, 0.833, 1.021, 1.027, 1.057, 1.165, 1.167, 1.204, 1.523, 1.621, 1.746, 2.033, 7.358. Median 1.165. 5/16 pairs improve, 11/16 worsen.

**Verdict: NO-GO — KILLED** (primary miss: 1.010x vs the ≤0.85x bar; coverage miss: 500k < 764k floor). The mechanism ENGAGED at high volume (1095 channel firings, 1.53M preserved kcal redirected vs 451k control, +500k smoked) — this is a real NO-GO on an engaged mechanism, not a vacuous kill. Per the kill protocol the layer file is deleted zero-trace; instruments (proof, sweep, diagnostic, per-seed JSONs) and this evidence are kept.

## Why the bar was missed (mechanism, not just heterogeneity)

The lever's theory was "each preserved kcal the scholar eats unlocks ~1 fresh kcal smoked." What actually happened:
1. The scholar's fresh-first nightly meal was itself a guaranteed urgent-fresh sink — pantryDraw eats soonest-spoiling first, so the scholar was eating the fresh most about to rot. Removing that sink left urgent fresh for the cook — but the cook's smoking is capped (4000 kcal/resolution) and conditional (eligible surplus beyond the 250/person dinner reserve, duty cadence). The fresh the scholar abandoned rotted faster than the re-opened guard could smoke it.
2. The guard-lift doesn't convert 1:1 into smoking: 1078k redirected preserved kcal (armed−control) → +500k smoked (0.46x, just under the 0.5x coverage floor). The cook's eligible-surplus and duty cadence bind, not just the guard.
3. Trajectory divergence swamps the signal (paired ratios 0.39–7.36, same class as harvstop-b): the s4601-belongfeast armed twin survived 180d vs 147d control with a much bigger pantry — the rate normalizes by throughput but big old villages rot more per throughput-kcal.
4. The paired median (1.165, worse than control) says the direction is wrong, not just noisy — this isn't a miscalibrated bar like harvstop-b's 0.80x-on-0.75x. The lever as designed trades a certain fresh sink for a conditional one.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 13/16 | 15/16 | 0/16 | 0/16 | 0/16 | 180d | 180d |
| armed | 13/16 | 16/16 | 0/16 | 0/16 | 0/16 | 180d | 180d |

Exiled: 0 everywhere. Wave 4: 0/16 both — the readiness gate holds wave 4 shut on the pre-seat courtship substrate (established). The scale wall is untouched by this arm (as expected — the lever is food-economy, not scale).

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins' scholars eat from the racks on 1095 nights — smoked and dried instead of the fresh pile — and the cooks smoke 500k kcal more than their twins. But the pantries don't get leaner: the fresh the scholar leaves behind rots in the bins faster than the re-opened racks can take it. Villages live just as long (180d median both), starve the same (1 vs 1), reach national at the same clip (13 vs 13). Nothing about the redirect reads as harmful or robotic at the table — the scholar eating the kept stores while the racks overflow is a sensible call — but the prize (waste rate ≤ 0.85x) was missed, so the layer is killed.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

The channel beat (11 firings captured on a 30d s4603 probe, deterministic 3-rotation):
> d19: "The racks are full — you eat from the kept stores tonight, and the fresh pile goes to the smoke, not the rot."
> d20: "Smoked and dried — the racks are overflowing. You take your share from the stores; the cook can smoke the fresh."
> d22: "You eat the kept food tonight. The fresh won't wait, and the racks need the room."
**PASS** on meaning — each reads as a person making a sensible call (names the real situation, the honest reason, the consequence). **FINDING** (not chased — layer killed): the beat fires nearly every night the channel is open (9 firings in 12 days on the probe; 50–126 per full run) and the 3-rotation is visibly mechanical over a full run — the same repetition class as the harvstop-b feast-prose finding. A future diet lever should voice sparingly (first firing per stretch, or a weekly summary) rather than nightly.

## Blanks filled / documented

- **FILLED (finding)**: the scholar's nightly villageMeal share (up to 2000 kcal, ~85–90% of scholar intake) draws FRESH-first (84–91% fresh on 8 census runs). The "scholar eats preserved-first" hypothesis is FALSE for the main meal — only the competentEat top-up is preserved-first (~110 kcal/day).
- **FILLED (finding)**: the racks-full guard binds on 18–406 cook-resolutions per run with 131k–7.1M kcal of fresh near-expiry left unsmoked (per-resolution scans; unique kcal roughly /6). Binds fire at preserved stock ≈ 125×roster×13 (the blind cap — cooks are unskilled on this substrate).
- **FILLED (finding)**: the cook smokes only 0.5–2k kcal/day against a 12k/day budget — the drive is eligibility/duty-bound, not budget-bound. A future arm should tune the cook drive itself (duty cadence, reserve size), not the scholar's diet.
- **FILLED (finding)**: pemmican (foodState 'pemmican') and cooked are NOT in the guard's numerator — only preserved/rendered. A future arm pushing pemmican production won't trip the guard.
- **DOCUMENTED (design)**: removing the scholar's fresh sink has a real cost — the fresh-first meal eats soonest-spoiling fresh (rot prevention); the cook's smoking is capped and conditional. Any diet-redirect lever must account for the lost fresh sink (e.g., fire only when the cook has spare smoking capacity, or redirect without abandoning the fresh pile).
- **DOCUMENTED (instrument)**: a mid-run service restart wiped /tmp and killed the sweep at 14/32 — per-seed JSONs under ~/workspace survived; the rest re-ran. Never keep recovery-critical state in /tmp (AGENTS.md lesson re-confirmed live).

## Metric review (§14)

- The primary (armed ≤ 0.85x control on waste-rate) missed at 1.010x aggregate, 1.165 paired median. Per §14 this is NO-GO, not re-scored. Unlike harvstop-b (0.80x on a 0.75x bar — miscalibrated bar), the paired median says the DIRECTION is wrong: the lever trades a certain fresh sink for a conditional smoke gain.
- The coverage gate (smoke delta ≥ 0.5 × armed scholarMeal preserved) missed at 500k vs 764k — the guard-lift converts at 0.46x, not 1:1. The gate did its job: it caught that the waste-rate movement (nil) wasn't coming through the channel.
- The starvation guardrail (armed ≤ control: 1 ≤ 1) passes globally; the single armed starvation death (s4605-belongfeast, village lost d158) vs single control death (s4604-leadfeast, survived d180) is within the heterogeneity lens (per-seed delta +1 ≤ +3). No new death mode (armed-only keys are monster descriptors; base modes identical).
- Metric lesson (carrying forward): for diet-composition levers, pre-register the fresh-sink accounting — the scholar's redirected fresh kcal must appear as cook-smoked (or village-eaten) kcal, not just vanish from the scholar's plate. The coverage gate's 0.5x floor was the right idea; the lever failed it honestly.

## Convergence state

**killed** (NO-GO on the engaged primary — 1.010x vs the 0.85x bar; coverage 500k < 764k floor). The food-economy axis is not converged. The racks-channel direction is conceptually spent in this form: the scholar's fresh sink is load-bearing, and the cook's throughput (not the guard) is the binding constraint on smoking. The #444 line now points to: (a) cook-drive tuning (duty cadence / reserve size) as the smoking lever, (b) waste-rate metrics that handle pantry-shrink and trajectory divergence (paired designs with matched-survival lenses).

## Run notes

- `node scripts/check.js --quick`: 96 passed, 1 failed — the failure is pre-existing sprite checks ("sweeps_week aggro sprite", "cliffhanger calm/aggrro sprite"), unrelated to this run (zero tracked files modified; scripts + evidence only).
- A mid-run service restart wiped /tmp and killed the 32-run sweep at 14/32; per-seed JSONs under ~/workspace survived and the remaining 18 re-ran clean.
