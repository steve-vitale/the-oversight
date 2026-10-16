# SIM-HOLDSPIRAL — the allowgate6 anti-strand release valve (loop B, food-economy, sim-findings #187 heterogeneity note)

Date: 2026-10-16 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-holdspiral-b · Run: fleshout-loop-b-20261016T0330Z
Axis: food-economy (scale-wall lens) — the allowgate5 confirm's filed heterogeneity note (leadc-s909: "not tonight" became "not ever").

## The lever

scripts/policies/allowgate6.js (NEW, this run; ALLOWGATE6=1, default OFF; requires FEASTSCALE_R13=1 + ALLOWGATE2=1 — wraps belonggate2/leadgate2, the landed 4-day-floor gate). THE VALVE: count CONSECUTIVE candidate-only holds over consecutive candidate EVENTS (candidates are cadence-spaced; non-candidate dusks don't break the chain). After N (default 3, ALLOWGATE6_N override) consecutive holds — a proven-persistent marginal pantry, since any above-floor candidate would have fired and reset the chain — suspend the hold and allow the allowance feast: the village decides to feast anyway rather than let the feast engine strand. The release fires the REAL engine path the gate refused (Game.hostFeast, restored by allowgate2's finally) and mirrors scaleFeast's post-fire bookkeeping (cadence IS marked, fsFeasts/fsArmedFeasts counted with the same fusion-reactor ceiling, "Nobody came" room-read marks cadence). The release is narrated through Game.say as a village decision. Policy-side only; ZERO src/js changes.

DESIGN CALL (documented, Steve can overrule): the hold condition IS the marginal-pantry gate — a hold fires ONLY when the full r13 candidacy chain passes and ONLY the 4-day-floor test fails, i.e. exactly when the pantry sits below (floor + this feast's cost). No extra tier gate was added; the valve answers the exact strand pattern the confirm measured.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE any sims)

- **Question**: does the anti-strand release valve fire feasts the landed gate would strand (the leadc-s909 pattern) WITHOUT making any single seed worse than its own gate-only control — i.e. is the heterogeneity fix safe?
- **Lever**: scripts/policies/allowgate6.js (ALLOWGATE6=1, default OFF; requires FEASTSCALE_R13=1 + ALLOWGATE2=1). All r13 and allowgate2 gates kept. Zero src/js changes.
- **Horizon**: 180d death-aware (reachability lever per §10; pacing-law absolute max). Dead villages stop; +10d tail max.
- **Seeds**: PILOT — 101,202,303,404 × leadcourt/belongseek = 8 runs/side, IDENTICAL seeds control vs armed. Substrate BOTH sides: FEASTSCALE_R13=1, ALLOWGATE2=1, SEATDRIVE=0 explicit (pre-seat; the c004b9dd default flip does not apply — bare policies run pre-seat by construction). Control: ALLOWGATE6 unset (the landed gate alone). Armed: ALLOWGATE6=1. OWN paired control measured in the SAME sweep (#247).
- **Det-gate**: r27 rule — 8/8 bit-identical both sides on the pilot seeds before trusting the comparison (scripts/det-gate-holdspiral-20261016.js). SMOKE=1 instrument-honesty gate both sides.
- **Proof**: scripts/test-holdspiral-20261016.js — REAL RED (valve-off byte-identical to belonggate2/leadgate2; 3 consecutive holds strand the fixture, no release) → GREEN (release on the 3rd hold, N knob, no double-feast, inert without the gate/layer, determinism, narrated decision).
- **PRIMARY (per-seed heterogeneity)**: max over the 8 paired runs of (armed.starveDeaths − control.starveDeaths) ≤ 0 — no armed run worse than its own control. The valve fires feasts the gate held; the strand fix must not buy new starvation anywhere.
- **CO-PRIMARY (confirmed-safe envelope)**: pooled armed starvation ≤ 11 AND pooled armed hungryDays ≤ 62 (the allowgate5 confirm bounds).
- **GUARDRAILS**: rot/villager-day ≤ 1.15× control; food-deeds ≥ 7/8; table ≥ 6/8; national ≥ 5/8; no new death mode (n≥3); wave5 ≥ control−2. Median survival report-only.
- **SECONDARY**: gate holds (candidate-only ag2GateHeld), valve releases (ag6Releases), feast counts, wave reach 1–5, Arc reach, four-realm formation, death-cause shares (villager-only kind filter), exiled, wall numbers (national/table/wins/wave4-5/median).
- **Decision rule**: GO = primary + co-primary + every guardrail hold at PILOT (fast kills honored — any miss kills the layer per kill protocol: file deleted, instruments+evidence kept). NO-GO = killed, reported honestly. §14 binds: a miss is NO-GO, never re-scored mid-run; metric doubts go under "metric review" for the NEXT run.
- **Substrate check**: the allowgate5 confirm's control (16 fresh seeds, r13+gate) measured starvation 11 / hungryDays 44 / 159 feasts / table 13/16 / national 12/16 / median 130d. The pilot's control (8 runs, same policies) is expected near that, but may move — a moved control is reported, not "fixed"; the verdict is vs the paired control only.

## Proof results

scripts/test-holdspiral-20261016.js — REAL RED → GREEN, ALL GREEN both phases on THIS tree's HEAD, two consecutive invocations (the G7 assertion was tightened once: the fixture's feast beat reads "🍖 The feast is warm and good" not "🍖 FEAST 📺" — the proof now matches on the emoji, case-insensitive).

RED (FEASTSCALE_R13=1 + ALLOWGATE2=1, ALLOWGATE6 unset): R1 valve-off byte-identical — leadgate6/belonggate6 == leadgate2/belonggate2 per-day hashes, 40d ×2 seeds, IDENTICAL (the layer adds zero trajectory delta when off). R2: the strand in miniature — 3 consecutive candidate-only holds on the 3.9d fixture (days 30/31/32), ag2GateHeld=3, fsFeasts=0, NO release, cadence never marked (the heterogeneity failure mode, reproduced). R5/G5: valve inert without FEASTSCALE_R13.

GREEN (FEASTSCALE_R13=1 + ALLOWGATE2=1 + ALLOWGATE6=1): G1 holds 1,2 then day-32 release — fsFeasts=1, ag6Releases=1, pantry 9500→4500 kcal (really drawn), cadence marked _fsLastFeastDay=32, chain reset ag6Holds=0, release-day context recorded {day:32, fd:3.96, tier:'secure'}. G2 ALLOWGATE6_N=2 releases on the 2nd hold. G3 no double-feast on the release day. G4 valve inert without ALLOWGATE2 (allowance fires immediately, textual guard `!AG2.gateOn()` present). G6 armed determinism (identical fixture twice → identical outcome `1|3|1|5000|1.875`). G7 the release narrates the decision — "3 held dusks in a row — the pantry keeps saying not tonight. Kieran looks at the shelves and says: 'Not tonight has become not ever. We eat together — we fill the shelves tomorrow.' The village decides to feast anyway." followed by the feast beat.

## Det-gate + SMOKE

Det-gate (scripts/det-gate-holdspiral-20261016.js, r27 rule — in-process double-run, 8/8 bit-identical required before trusting the comparison, on the pilot seeds): CONTROL 8/8 identical (FEASTSCALE_R13=1 + ALLOWGATE2=1; 4 seeds × leadcourt/belongseek). ARMED 8/8 identical (FEASTSCALE_R13=1 + ALLOWGATE2=1 + ALLOWGATE6=1). SMOKE=1 instrument-honesty gate GREEN both sides (named-export unwrap + harness invokes policy.daily 18.3 calls/day + 260 policy-origin deliberate acts per side).

## Pilot results

8 runs/side, IDENTICAL paired seeds, 180d death-aware. Det-gate 8/8 both sides; SMOKE green both sides. Substrate both sides: FEASTSCALE_R13=1 + ALLOWGATE2=1 + SEATDRIVE=0 (pre-seat). Control: ALLOWGATE6 unset (the landed gate alone). Armed: ALLOWGATE6=1. OWN paired control measured in the same sweep (#247).

| metric | control (gate only) | armed (gate+valve) | pre-reg | verdict |
|---|---|---|---|---|
| max per-seed starve delta (**PRIMARY**) | — | **0** (all 8 seeds 0→0) | ≤ 0 | **GO** |
| pooled starvation (**CO-PRIMARY 1**) | 0 | **0** | ≤ 11 | **GO** |
| pooled hungryDays (**CO-PRIMARY 2**) | 17 | **17** | ≤ 62 | **GO** |
| rot/villager-day (GUARDRAIL) | 341.34 | **342.45** | ≤ 392.54 (×1.15) | **GO** (1.003×) |
| food-deeds (GUARDRAIL) | 8/8 | **8/8** | ≥ 7/8 | **GO** |
| table (GUARDRAIL) | 8/8 | **8/8** | ≥ 6/8 | **GO** |
| national (GUARDRAIL) | 7/8 | **7/8** | ≥ 5/8 | **GO** |
| new death mode (GUARDRAIL) | — | "the night" n=1 (all other armed kinds present in control) | none n≥3 | **GO** (flagged §14) |
| wave5 (GUARDRAIL) | 6/8 | **6/8** | ≥ control−2 | **GO** |
| median survival (report-only) | 123d | **123d** | — | flat |
| max survival | 180d | 180d | — | — |
| wave-4 | 8/8 | 8/8 | — | — |
| wins / exiled | 0 / 0 | 0 / 0 | — | pre-seat substrate |
| four-realm | 7/8 | 7/8 | — | — |
| max Arc | 4 | 4 | — | — |
| allowance feasts | 86 | 89 | — | mechanism (+3 = the releases) |
| gate holds (candidate-only) | 19 | 18 | — | gate live |
| valve releases | 0 | **3** | — | valve live |

Per-seed paired deltas (starvation, control → armed): all eight 0→0, MAX delta 0. HungryDays per seed: identical on 7 seeds (leadcourt-s202: 3→3). The valve engaged on the two most-held runs: belongseek-s101 (9 holds → 2 releases, feasts 14→18) and leadcourt-s202 (6→5 holds → 1 release, feasts 7→6). On leadcourt-s202 the release re-timed the cadence chain (the release marks _fsLastFeastDay): the village died 13d earlier (103 vs 116) — of violence, not hunger (starve 0→0, hungry 3→3; death kinds match control's violence profile).

**Verdict: PILOT GO — land the layer (default-OFF, dormant).** Primary, co-primary, and every guardrail hold. The mechanism is live: 3 release feasts on the two most-held runs, narrated, cadence-marked, chains reset.

The honest caveat: these pilot seeds starved ZERO times on both sides, so the primary's heterogeneity bar was untested in a genuine strand regime (leadc-s909's substrate — the failure mode that motivated the valve). What the pilot proves is the valve's SAFETY envelope: it engaged on the most-held runs and bought no new starvation or hunger anywhere. The strand-fix EFFICACY claim (does the valve rescue a leadc-s909-class collapse?) needs a confirm on starvation-prone seeds — proposed for the NEXT header, not scored here (§14).

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max | realm |
|---|---|---|---|---|---|---|---|---|
| control (gate only) | 7/8 | 8/8 | 0/8 | 8/8 | 6/8 | 123d | 180d | 7/8 |
| armed (gate+valve) | 7/8 | 8/8 | 0/8 | 8/8 | 6/8 | 123d | 180d | 7/8 |

Exiled: 0 both sides. Max Arc 4 both sides. Reachability verdict: national, table, wave-4/5, Arc IV, four-realm formation all reachable on both sides — the valve changed none of the reachability (identical wall numbers; the only delta is feasts 86→89).

Death-cause shares (villager-only, kind person/villager/player) — control: combat 78, monster 47, wound 4, contest 4, dehydration 2, ambush 2, Suburb 2, Focus Group 1, lockjaw 1. Armed: combat 77, monster 45, contest 5, wound 3, dehydration 2, ambush 2, Suburb 2, "the night" 1, Focus Group 1, lockjaw 1. Villages die of violence, not hunger, on both sides. "the night" n=1 (armed-only) is flagged for the next run's metric review, not re-scored (§14).

TELEMETRY NOTE: telemetry-check.js fires LOUD on wins 16→0 on BOTH sides vs the scale-wall baseline — the recurring substrate-mismatch class (baseline = composed-driver full win-side stack; these arms ran uncomposed pre-seat by design; own controls 0=0). EXPLAINED, not a roll.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed 180d transcript (scripts/sense-holdspiral-20261016.js; belongseek seed 101: 18 feasts, 9 holds, 2 releases, survived).

The pair comparison: control's last feast fired d150 (freshDays 6.4→5.8); after that the pantry slid and the gate held every subsequent candidate — the run's last ~30 days are a slow postponement with the feast engine quiet. Armed released twice on genuinely marginal pantries: d143 (pantry 8,320 kcal, freshDays 3.4→2.7 — deliberately below the 4-day floor, by design) and d179 (pantry 10,100 kcal, 5.1→3.8). Both release lines read as a person deciding:

"d143: 3 held dusks in a row — the pantry keeps saying not tonight. Naran looks at the shelves and says: 'Not tonight has become not ever. We eat together — we fill the shelves tomorrow.' The village decides to feast anyway."

"d179: 3 held dusks in a row — the pantry keeps saying not tonight. Theo looks at the shelves and says: 'Not tonight has become not ever. We eat together — we fill the shelves tomorrow.' The village decides to feast anyway."

Named deciders (Naran, Theo — the scholar's display name both times), the hold chain cited, the intent stated ("we fill the shelves tomorrow"), the feast beat following. The village survived to 180d with hungryDays 0. hungryStreak 0 at both releases — the valve fired on pantry-marginality, not on visible hunger; the decision reads as foresight (keep the feast engine alive), not desperation.

**PASS with the pre-existing blank re-noted (sixth run in a row)**: the devotion channeling line ("💛 You hold Home key... The feast was the weapon.") fires VERBATIM every day — the finding #64 repetition class (competent.js channelDevotion, not this layer's doing). Filed, not chased.

**PASS with a note**: the release decision line is the SAME sentence both times (only the name changes) — two releases in one run is fine, but across many runs the line will repeat. If the valve fires often on a future substrate, the line wants variation. Filed as a polish blank, not a blocker.

## Village assessment (plain words)

Eight villages with the gate, eight with gate-plus-valve. The valve only spoke on the two runs where the gate's holds were piling up — belongseek-s101 (9 holds) and leadcourt-s202 (5 holds) — and each time it said, in so many words: the pantry has said not tonight three times running, and not tonight has become not ever. It fired 3 feasts the gate would have held, drew the pantry honestly (one of them down to 2.7 fresh-days, below the floor — that's the valve's whole point: the floor is suspended, not moved), and the villages went on being villages: same violence-led death ledgers, same national/table/realm reach, same median survival to the day.

Nothing in the transcripts reads as the valve making decisions for the village — it only breaks the spiral. The holds that preceded each release were real candidate-only holds (the allowance would actually have fired), and after each release the chain reset and the village went back to the gate's discipline. On the six runs where the pantry never went marginal, the valve never said a word — R1's byte-identical delegation held in the wild, not just in the proof.

The strand regime itself (a leadc-s909-class collapse) did not appear on these seeds — zero starvation on both sides — so this run is a safety proof, not a rescue proof. The rescue proof is the next run's work.

## Blanks filled / documented

- **LAND (this arm, PILOT GO)**: scripts/policies/allowgate6.js (ALLOWGATE6=1, default OFF; requires FEASTSCALE_R13=1 + ALLOWGATE2=1; N=3 consecutive candidate-only holds → the village feasts anyway; ALLOWGATE6_N override; zero src/js changes) — landed dormant by this commit. Proof: scripts/test-holdspiral-20261016.js (REAL RED→GREEN). Sweep: scripts/measure-holdspiral-20261016.js (paired gate-only control + armed, 8 runs/side, per-seed dirs hs-control-perseed/, hs-armed-perseed/). Det-gate: scripts/det-gate-holdspiral-20261016.js (8/8 bit-identical both sides). Sense: scripts/sense-holdspiral-20261016.js (180d stranded-pair read).
- **PROOF**: REAL RED (valve-off byte-identical 40d ×2 seeds; 3 holds strand the fixture with no release) → GREEN (release on the 3rd hold, N knob, no double-feast, inert without gate/layer, determinism, narrated decision).
- **[open] STRAND-REGIME RESCUE (documented, not chased)**: the pilot seeds starved 0/16 runs — the heterogeneity bar was untested in a genuine strand regime. The next run on this axis should pre-register a confirm on starvation-prone seeds (the leadc-s909 seed itself, paired) to test whether the valve RESCUES a collapse, not just whether it's safe. Proposed for the NEXT header, not scored here.
- **[open] "the night" n=1 armed-only**: below the n≥3 guardrail; flagged for the next header's death-kind watch, not re-scored (§14).
- **[open] release-line variation**: the decision line is identical every release (only the name varies). Fine at this fire rate; if the valve fires often on a future substrate, add variation.
- **[open] finding #64 repetition class**: the devotion channeling line fires verbatim daily — re-noted for the sixth consecutive run, not chased.
- **[open] release re-times cadence**: the release marks _fsLastFeastDay, shifting the subsequent candidate chain (leadcourt-s202 feasts 7→6, belongseek-s101 14→18). Documented as designed behavior — the release is an opening, not a postponement — but a future header should watch feast-count drift on longer horizons.
- **TELEMETRY NOTE**: telemetry-check.js LOUD on wins 16→0 on BOTH sides — the recurring substrate-mismatch class (pre-seat by design; own controls 0=0). EXPLAINED, not a roll.

## Metric review (§14)

1. **PILOT GO stands — the header's bar is the verdict.** Max per-seed paired starvation delta 0 ≤ 0; pooled armed starvation 0 ≤ 11 and hungryDays 17 ≤ 62; rot/vd 342.45 ≤ 392.54; food-deeds/table/national all at or above their floors; no new death mode (n≥3); wave5 6 ≥ 4. Det-gate 8/8 both sides, SMOKE green both sides, own paired control in the same sweep.
2. **The primary was a safety bar on these seeds, not a rescue bar.** Zero starvation on both sides means the heterogeneity the valve was built for didn't occur. The pilot correctly answers "the valve buys no new harm" — the rescue question ("does it un-strand a leadc-s909?") is explicitly the NEXT header's question, on starvation-prone seeds.
3. **The co-primary bounds (≤11, ≤62) carried the weight.** With a zero-starvation substrate, the pooled envelope is what proves the valve didn't shift the population — it didn't (0, 17 vs the allowgate5 confirm's 11, 47).
4. **"the night" n=1 is flagged for the next header**, not re-scored here — §14.
5. **Seed variance is the substrate fact (again).** allowgate5's fresh seeds starved 11+11; these 4 pilot seeds starved 0+0 (different seed set, same policies, same tip). Composite/hold-envelope primaries, not single-metric bars, remain the answer for this axis.

## Convergence state

food-economy: **converging** (sim-holdspiral-b). The allowgate6 anti-strand release valve is built, proven (REAL RED→GREEN), det-gated 8/8 both sides, and PILOT-GO (primary + co-primary + all guardrails on 8 paired seeds, mechanism live: 3 narrated releases on the 2 most-held runs, zero new harm) — landed dormant (ALLOWGATE6=1, default OFF) by this commit. sim-findings #187's heterogeneity note is now CLAIMED by this arm: the strand-fix safety envelope is proven; the rescue efficacy (does the valve un-strand a leadc-s909-class collapse?) is the next run's confirm header on starvation-prone seeds.
