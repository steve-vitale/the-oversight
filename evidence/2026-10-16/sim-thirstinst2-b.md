# sim-thirstinst2-b — the EXTENDED thirst attribution instrument + reproduce census (loop B, 2026-10-16)

**Run:** fleshout-loop-b-20261016T1056Z · sim-findings **#286** (claims #286; the named blank: "a trust-delta/water-side instrument before any lever touches it")
**Date:** 2026-10-16 · worktree `~/workspace/worktrees/sim-thirstinst2-b`
**Adoption:** tree adopted from dead run fleshout-loop-b-20261016T1056Z (work uncommitted, proof never run). Proof + SMOKE + census all run fresh this run; the census's first attempt died to a runtime restart at 7/32 and was re-run clean.
**Axis:** food-economy (scale-wall lens)

## Canon note

docs/CANON.md read first, docs/PRESERVATION.md read. **There is no water/thirst canon doc** — stated per the canon rule, not invented. All water mechanics (cistern 40L cap, villager 2L/day draw via `villageDrinks`, health −5/day when unmet, `registerDeath` cause `'thirst'`, hearth boiling 6L/wood, villager task `'water'` hauling 10–14L into the dirty side, autonomous WATER objectives +2–4L clean when `clean<3`, obedience-gated `assignTask` with the trust≥20 gate for water work, `tele('trust')` `{who, delta, reason}` channel) are read from `src/js/game.js` / `src/js/villager-objectives.js` as-is. Zero src/js changes. Policy-side + instrument only.

## Lineage

sim-bankleg (killed: thirst 9 vs ≤2 — the #286 signature: 9 early-siege villager thirst deaths, scholar 0/0) → sim-banklegrecal → sim-thirstinst (instrument v1; phenomenon absent unlayered — deleted-lever artifact; 0/16) → sim-thirstsafe v1/v2 → sim-thirstbank / sim-thirstbank2 (PART B REAL RED: old ungated shape → cistern 0 + 4 villager thirst deaths on belongseek s33 45d; trust-gated shape → cistern min 28L + 0; #300 mechanism answered) → **this arm: the extended attribution instrument + the reproduce census.**

The #286 hypothesis under test: **the armed scholar's at-haven presence changes siege trajectories vs the foraging-away control.**

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding, written BEFORE sims)

- **Question:** the bankleg at-haven layer re-fired the #286 signature deterministically (9 villager thirst deaths, 3 early-siege armed runs; scholar thirst 0/0), but on current master without an at-haven scholar the phenomenon does not reproduce (0 across 16×180d in sim-thirstinst). Can the extended instrument attribute every villager thirst death to the classification (scholar at-haven presence ±3d · trust-delta · water-duty state · early-siege flag), and does the reproduce harness confirm the at-haven-presence mechanism (suppressed early-siege water hauling)?
- **Layer (harness):** `scripts/policies/thirstrepro.js`, `THIRSTREPRO=1` (default OFF). The OLD ungated bankleg at-haven shape rebuilt honestly from the committed record (`scripts/test-thirstbank2-20261015.js` `oldShapePolicy()`): take-discipline (always-on while gated) + at-haven guarantee leg (garden/fish/forage, tile-identical, zero travel). **HARNESS ONLY — deleted per kill protocol after the census, never landed.** Do NOT invent new water mechanics; the instrument observes.
- **Instrument:** `scripts/thirstinst2-lib-20261016.js` — `installThirst2` / `finalizeThirst2` / `armedStateHash`. Read-only wraps (registerDeath, tele trust+death, say water beats, per-day sampleDay). Zero src/js.
- **Road:** 8 seeds (11/22/33/44/55/66/77/88) × {belongseek, leadcourt} × {control, armed}, 180d death-aware (+10d tail max), identical seeds both sides. Own control in the SAME sweep (#247). Courtship substrate: **FEASTSCALE_R13=1 both sides, SEATDRIVE=0 explicit** (pre-seat by design).
- **PHENOMENON-PRESENCE GATE (binding, the sim-thirstinst metric-review lesson):** ≥3 early-siege (d≤40) villager thirst deaths in the harness-armed cohort. Below the gate the verdict is **"phenomenon absent"** (a finding, not a miss-on-the-merits).
- **PRIMARY (diagnostic GO):** 100% of observed villager thirst deaths (both sides) fully attributed to the classification (bar 100%). "Fully attributed" = all four slots non-null: (a) scholar at-haven presence ±3d, (b) trust-delta (scholar net, village mean, water-duty trust links), (c) water-duty state (assignees, victim's task, abandoned/redirected, cistern, wood), (d) early-siege flag.
- **SECONDARY (mechanism test):** early-siege water-haul volume (parsed liters from haul beats, d≤40) armed/control ≤ 0.75 — the at-haven-presence hypothesis predicts the harness suppresses water hauling during early sieges (the #300 mechanism chain).
- **GO:** presence gate + primary + secondary. GO → land the instrument (scripts + evidence). MISS → evidence only. The THIRSTREPRO harness is deleted per kill protocol either way.
- **ANSWERABILITY:** the presence gate is the answerability gate; the primary's denominator is the observed death count.
- **Gates before sims:** `scripts/test-thirstinst2-20261016.js` — PART A fixtures (6/6 thirst deaths attributed, combat not attributed), PART B det-gate (instrument-on == pristine byte-identical), PART C SMOKE, PART D harness mechanics + signature-reproducibility measurement.

## What was built (instrument + harness — zero src/js)

- `scripts/thirstinst2-lib-20261016.js` — the extended attribution instrument (see header for the four classification slots).
- `scripts/policies/thirstrepro.js` — the reproduce harness (THIRSTREPRO=1, default OFF).
- `scripts/test-thirstinst2-20261016.js` — the proof (A/B/C/D).
- `scripts/sweep-thirstinst2-b-20261016.js` — the census sweep (SMOKE=1 gate + full 32-run census).

## Results

### Proof tests (scripts/test-thirstinst2-20261016.js)

Run fresh this run (the adopted tree's proof was never run). **58 assertions, all green**, plus both SMOKE gates.

- **PART A (fixtures, seeds 11/22/33):** 6/6 forced villager thirst deaths fully attributed — all four classification slots non-null each (scholar at-haven presence ±3d, trust-delta, water-duty state, early-siege flag). Forced combat deaths NOT attributed (cause split holds; no combat death carries a classification).
- **PART B (det-gate):** instrument-on vs pristine per-day state hashes byte-identical, 30d belongseek, seeds 11/22 — the instrument is read-only.
- **PART C (SMOKE=1):** policy.daily fired 15x (bar ≥10); ≥1 death-attribution observed in the fixture suite — instrument honest. Sweep SMOKE=1 also green (policies drive, harness-live marker honest).
- **PART D (harness mechanics + signature-reproducibility):** gate OFF when THIRSTREPRO unset / ON when set; gate-off wrapped == raw base byte-identical (20d); take-gate refuses voluntary takes; at-haven + thin pack → exactly 1 banking leg. The #286 SIGNATURE reproduction was MEASURED, not asserted: belongseek s33 45d harness-ON → minCistern=12L, villagerThirst=0 — **signature ABSENT on current master** (verbatim record code run separately: identical outcome — the harness is faithful, master moved since 2026-10-15).

### Sweeps (8 seeds × {armed, control} × 180d death-aware, FEASTSCALE_R13=1, SEATDRIVE=0)

32 runs, identical seeds both sides, own paired control in the same sweep. First attempt was killed by a runtime restart at 7/32; re-ran clean (~24.5 min). Determinism cross-check: the 7 completed runs reproduced the dead run's partial values exactly.

Per-policy (armed vs control):
- **belongseek:** earlyThirstV-armed 0 (presence gate ≥3) | attr 0/0 | haulEarly 18656L/16459L = **1.133** (bar ≤0.75) | medSurv 123 vs 120 | national 5/8 vs 4/8
- **leadcourt:** earlyThirstV-armed 0 | attr 0/0 | haulEarly 20657L/17882L = **1.155** | medSurv 134 vs 129 | national 6/8 vs 8/8
- **POOLED:** earlyThirstV-armed **0** | attr 0/0 n/a | haulEarly 39313L/34341L = **1.145** | medSurv 131 vs 123 | national 11/16 vs 12/16 | won 0/16 vs 0/16

Manipulation check: 1,682 at-haven guarantee legs fired across the 16 armed runs (~105/run); 44,812 voluntary takes refused by the take-discipline; atHavenEarlyShare ~1.0 armed. The harness did what it was built to do — the predicted hauling suppression did not follow; hauling ROSE 14.5%.

## Attribution table

Empty by measurement, not by instrument failure. Zero villager thirst deaths in 32 runs (0 early-siege, 0 late) — there was nothing to classify. PART A proved the instrument classifies 6/6 fixture deaths with all four slots non-null.

Caveat for future water-side instruments: 3 deaths carried cause `'dehydration'` rather than `'thirst'` (the instrument keys on the `registerDeath` cause `'thirst'`). Whether those share a pipeline under a different string was not verified this run — check before filtering.

## Hypothesis verdict

**Phenomenon absent** (binding gate: 0 early-siege armed thirst deaths < 3 — a finding, not a miss-on-the-merits). The #286 signature — early-siege villager thirst deaths under the at-haven banking shape — does not occur on current master. Third confirmation: sim-thirstinst v1 (0/16), sim-thirstbank2 ("#286 reconfirmed by absence"), now 0/32.

**Mechanism refuted in direction.** The at-haven-presence hypothesis predicted the harness would SUPPRESS early-siege water hauling (armed/control ≤ 0.75 — the #300 chain's first link: at-haven presence → suppressed hauling → cistern drain → thirst deaths). Measured 1.145× — the armed shape hauls MORE water. The cistern never emptied in any of the 32 runs. On current master the water economy holds under the exact shape that used to break it.

## Named next lever

None on the thirst side. #286 → answered-by-absence; recommend **parked** on the convergence tracker (reopen only if a water-side change recreates thirst pressure).

Design-side note (steve-call, not a tuning lever): if Steve wants water as a pressure source at all, the #291 frontier stands — no cistern-deposit verb exists, and the scholar's 0.26L/day draw can't move the 24L/day village drain. That's a verb-design call, not a lever.

For the food-economy axis, the sims point at what actually kills villages: combat/monsters/expeditions (~90% of ~1,170 deaths) and starvation (12). The next lever should live there, not at the cistern.

## Village assessment (plain words)

The villages in this census die to teeth and claws, not thirst. Across 32 runs (~1,170 deaths): 636 combat, 258 villager-combat, 170 monster, 27 expedition, 20 contest — and zero thirst, 12 starvation, 3 dehydration. Water is a solved problem on current master: the cistern never hit zero in any run (lowest observed 12L on the old signature substrate, 3L late in one 100-day run), and the at-haven banking shape that once drained it now hauls 14.5% MORE early water, not less.

The scholar dies a lot — 232 scholar deaths across 32 runs, roughly one every 16 days — and the village keeps going: succession works as designed (the story is the village's, not the scholar's). National reach is healthy (23/32), the table was touched in 26/32 runs, wave 5 reached in 15/32 — but zero wins on the pre-seat substrate (SEATDRIVE=0 by design, so this is a reachability read, not a winnability miss).

The beats read coherent: day-1 low-trust villagers hesitate ("Not today. Sorry."), take half rations with the reason stated; water hauling narrates its costs honestly ("-10 kcal hauling, 1 tick", cistern level after each fill). Mild template repetition in stranger greetings, but pre-naming villagers are stranger descriptors by design, so it stays in-fiction. Nothing robotic in the water/trust lines sampled.

## Blanks filled / documented

- **#286's named blank** ("a trust-delta/water-side instrument before any lever touches it"): instrument built and proven honest (58 proof assertions + both SMOKE gates green; det-gate byte-identical). The phenomenon it was built to classify is absent on current master for the third time → documented here, instrument NOT landed per the binding GO-only landing rule (v1 precedent: deleted-lever artifact on phenomenon-absent). The four-slot classification spec is preserved in this file for rebuild.
- **THIRSTREPRO harness**: deleted per kill protocol (harness-only, never landed).
- **Documented for the backlog** (appended to `hidden_files/sim-findings.md`): (a) scholar mortality ~7.25/run (~16-day life expectancy) on the pre-seat substrate — succession holds, but the rate is worth a design look; (b) the `'dehydration'` vs `'thirst'` cause-string split (3 deaths outside the instrument's filter).
- No src/js touched. Zero game-code changes.

## Wall numbers (the standing scale-wall report)

- national: **23/32** (armed 11/16, control 12/16) · everTable: **26/32** · won: **0/32** (pre-seat substrate — SEATDRIVE=0 by design; reachability read)
- wave reach (max): w2 2 · w3 4 · w4 11 · **w5 15/32**
- median survival: **116d** (armed 131 vs control 123) · max 182d
- death-cause shares (~1,170 deaths): combat 54% · villager-combat 22% · monster 15% · expedition/contest/ambush ~4% · sickness 1.2% · starvation 1.0% · dehydration 0.3% · thirst 0%
- scholar deaths: 232 (succession continuity held — villages outlived their scholars)
- water: 0 villager thirst deaths; cistern never emptied; early-siege haul armed/control 1.145×

## Metric review (§14 — mandatory)

- The presence gate worked as the sim-thirstinst lesson intended: 0 < 3 → verdict "phenomenon absent", recorded as a finding, never re-scored against a friendlier metric. No revision proposed — the gate did its job.
- The primary (100% attribution) had a zero denominator; attributability was proven on fixtures instead (PART A, 6/6). The bar stands unchanged for any future run where the phenomenon is present.
- The secondary was measured despite absence and is informative: 1.145× vs the ≤0.75 bar refutes the mechanism direction. Not a re-score — the bar stays.
- Instrument-scope caveat for the next run: the `'thirst'` cause filter missed 3 `'dehydration'` deaths. Future water-side instruments must verify whether those share a pipeline before filtering.
- Provenance: one runtime restart killed the first census attempt at 7/32; the clean re-run reproduced those 7 values exactly — seed determinism holds, and the re-run is the record of provenance.
- No metric was changed mid-run. Nothing in this file was re-scored after the fact.

## Convergence state

**parked** — the #286 diagnostic question is answered-by-absence on current master (third confirmation: v1 0/16, thirstbank2, now 0/32); the at-haven→suppressed-hauling mechanism is refuted in direction. No lever to tune, nothing to land. Reopen only if a water-side change recreates thirst pressure or the cistern-deposit verb lands (steve-call).
