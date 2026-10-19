# sim-w4finish — PILOT NO-GO (kill protocol executed)

**Date:** 2026-10-18
**Arm:** sim-w4finish (lever-10 from sim-w5legs.md)
**Verdict:** PILOT NO-GO — primary bar missed (1/8 < 2/8) AND critical mechanism bug (153k-turn pathological fight). Layer deleted zero-trace per kill protocol.

## Pre-registration (binding)

From the task brief (docs/MEASUREMENT.md §§9-12, 14-15):
- **PILOT** (seeds 65101–65104, 8 runs/arm): PRIMARY armed runs with ≥1 wave-4 kill ≥2/8; guardrails: no new death mode; median survival ≥ control−15d.
- **CONFIRM** (all 16 seeds): PRIMARY ≥5/16; SECONDARY maxVet≥2 ≥2/16; guardrails: no new death mode (n≥3); wins ≥9/16; median survival ≥66d.
- §14: a miss is NO-GO, never re-scored.

## What was built

**`scripts/policies/w4finish.js`** (DELETED per kill protocol): a policy-side wave-4 finishing layer, env-gated `W4FINISH=1` (default OFF), zero `src/js` changes. When wave 4 is unlocked and wave 5 is not, it commits the scholar to FINISH wave-4 TB fights: no early retreat once committed (overrides the base's flee decisions), counter-use when known (vacuous — all 10 wave-4 defs have `counter:null`), focus fire (lowest-HP wave-4), kill-attribution spread via `beastStrikeTarget`. 12% suicide floor breaks commitment. Per-fight state keyed by fight object.

**`scripts/test-w4finish-20261018.js`**: proof (UNIT 22/22, GREEN real-fight, DET, SMOKE — all passed before the pilot).

**`scripts/w4finish-sweep-20261018.js`**: sweep driver (standalone, does not touch `scripts/sweep-compare.js`).

**`scripts/w4finish-analyze-20261018.js`**: verdict analyzer.

## Pilot results (seeds 65101–65104, 180d death-aware)

| Side | n | w4killRuns | maxVet≥2 | wins | medianSurvival |
|------|---|------------|----------|------|----------------|
| Control | 8 | 2/8 | 0/8 | 7/8 | 90d |
| Armed (W4FINISH=1) | 8 | 1/8 | 0/8 | 7/8 | 90d |

**PRIMARY:** Armed 1/8, bar ≥2/8. **MISS → NO-GO.**

Per-policy:
- belongfeast: armed 1/4 w4killRuns (s65103, by villager `gen_lcfjej1`), control 1/4 (s65101, by villager `app_mgpsphhv316`).
- leadfeast: armed 0/4, control 0/4.

Guardrails: no new death modes (PASS); median survival 90d ≥ 75d (PASS). But the primary missed, so NO-GO per §14.

## Critical bug: pathological 153k-turn fight

**`armed/belongfeast/s65101.json`:** `w4fCommits=8, w4fOverrides=153000, w4fStrikes=152997, w4fCloses=3, w4fCounterChecks=153000`. Days=124, survived (did not die).

The layer committed to 8 wave-4 fights, then overrode the base's flee decisions **153,000 times** — an average of ~19,000 override-turns per commit. The scholar was locked in a wave-4 fight, striking 152,997 times without a kill (w4k=0), because the 12% suicide floor never triggered (scholar HP stayed above 12%).

**Root cause:** The commitment has no turn cap or damage-race check. Once committed, the layer overrides flee indefinitely as long as HP ≥12%. Against a wave-4 monster the scholar cannot kill (eater: 1026 HP, scholar unarmed/no abilities in the proof), this creates a near-infinite fight — the exact "suicidal hold" the spec forbids. The per-fight reset (`L.f !== f`) works, but a single fight can still run 19k turns.

This is not just ineffective — it's actively harmful. The layer converts a retreat (sensible) into a 19,000-turn stalemate.

## Metric review (for the NEXT run — never re-scored)

1. **Baseline shift:** The w5legs corpus (1/16 w4 kills, 11/16 wins, 91d median) is stale — generated before the sim-dayfreeze combat fix (1a2f2afdb). Fresh control on current master: 2/8 w4killRuns (pilot), 7/8 wins, 90d median. The absolute pre-registered bars still bound this run, but future runs should re-baseline.

2. **Wave-4 kills are villager fieldFight kills, not scholar TB kills:** Both pilot w4 kills (control s65101, armed s65103) were by villagers (`app_mgpsphhv316`, `gen_lcfjej1`), not the scholar. A diagnostic on s65103 (180d) found **zero** wave-4 monsters in the scholar's TB fights across 126 fight turns. The wave-4 combat happens in villager fieldFights, which a scholar-TB policy layer cannot influence. The spec's premise ("fights it already engages") does not match where wave-4 fights occur.

3. **The "two fighters" requirement is unmet by design:** The wave-5 door needs TWO LIVING veterans (killers). Villager fieldFight kills do not create veterans (veterans are made from scholar/companion kills in TB). Even if the layer worked, it could not produce the required veteran count because the kills happen outside the scholar's fights.

4. **Substrate-shape contrast (coordinator note 2026-10-18):** the sibling arm sim-w5preseat landed on master (DIAG-GO 16/16) with a wave-5 door leg census on the PRE-SEAT substrate. Veterans bind 16/16 there too — but with a DIFFERENT SHAPE than winseat. Pre-seat: **killer mortality, not kill drought** (7 wave-4 kills in 5 runs, all solo scholar kills, killers dead within ~4–10d; maxVet never reached 2). Winseat (this arm's substrate): **kill drought** (1/16 baseline wave-4-kill runs; the village fights but the kills don't land). The shapes call for different levers — winseat wants a *conversion* lever (turn engaged fights into kills), pre-seat wants a *survival* lever (keep the killers alive). The sim-w4finish surface does NOT apply pre-seat: its GO primary (≥5/16) is already met on the pre-seat baseline (5/16), and "no early retreat" would plausibly worsen the mortality shape. This arm's pre-registered substrate is WINSEAT, where the bind IS the kill drought — the bars stand as briefed. The contrast sharpens the "which blank you filled" story: this lever was built for the drought shape, and the drought shape is where it was tested and killed.

## Sense-testing

The proof's GREEN test (real eater fight) showed sensible single-turn behavior: commit at full HP, override the turn-1 outmatched flee, close distance when out of range. But the pilot revealed the multi-turn pathology: without a turn cap or kill-progress check, "no early retreat" becomes "never retreat," and a fight the scholar cannot win becomes a 19,000-turn stalemate. The finishing discipline is coherent for one turn but incoherent over a full fight.

## Kill protocol (executed)

Per the task brief: on NO-GO, delete `scripts/policies/w4finish.js` zero-trace, repair the proof to INFO-SKIP, commit instruments + evidence + repaired proof only.

- Deleted: `scripts/policies/w4finish.js` (zero-trace).
- Proof `scripts/test-w4finish-20261018.js`: repaired to INFO-SKIP (layer removed; instruments retained for the record).
- Committed: sweep driver, analyzer, evidence, repaired proof.
- Did NOT reach CONFIRM (killed at PILOT per §14).

## Files

- `evidence/2026-10-18/sim-w4finish.md` (this file)
- `evidence/2026-10-18/perseed-w4finish/` (pilot runs: control/ + armed/)
- `scripts/w4finish-sweep-20261018.js` (sweep driver)
- `scripts/w4finish-analyze-20261018.js` (analyzer)
- `scripts/test-w4finish-20261018.js` (repaired to INFO-SKIP)

## Panel verdict

§15 panel blocked — `scripts/sweep-compare.js` is frozen (sibling loop B concurrent edits). Per the task: "Undecided — decide after pilot." Pilot NO-GO, so the panel question is moot. The paired sweep stats above serve as the instrument; the pre-registered thresholds were the judge.
