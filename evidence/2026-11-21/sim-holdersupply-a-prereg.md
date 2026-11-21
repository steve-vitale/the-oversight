# sim-holdersupply-a — prereg (FROZEN before any judged sim)

- **Arm:** sim-holdersupply-a · **Loop A run:** fleshout-20261121T0315Z · **Axis:** scale-onramp
- **Findings:** #2628 (lend pool empty — holder population empty) / #2631 (gun never reaches a villager on plain master) / #2599 (searcaster that can never fire)
- **Base master:** `b7c8eff2c` (journey-crisis r261). Worktree `~/workspace/worktrees/sim-holdersupply-a`.
- **Question:** put a searcaster + cells into a living villager's hands before wave 4.
- **Canon:** no canon doc covers the searcaster / contest-prize / lend / holder-presence rules specifically (same as the lendpool prereg records); rules below are cited from code only.

## 1. The combination is NOT the next step — verified from the evidence

The task's first candidate was the combination GUNRATE=1 + CELLGATE=1, never measured together. Reading the evidence shows it HAS been measured together — three times, on three fresh bands:

| Prior arm | Band | Legs | Combination measured as | Result |
|---|---|---|---|---|
| sim-cellgate-a (evidence/2026-11-20/sim-cellgate-a.md §1, §3) | 107051–107058 | ctl GUNRATE=1; arm GUNRATE=1 + CELLGATE=1 | arm leg IS the combination | holder-days 194, armed entries **2** vs floor 3, armed volleys **1** (first ever), cell-days 58→182 |
| sim-lendfix-a (evidence/2026-11-20/sim-lendfix-a.md) | 107081–107088 | BOTH legs GUNRATE=1 + CELLGATE=1 | combination on both legs | holder-days 87, armed entries 20, pool **0** lendable moments |
| sim-lendpool-a (evidence/2026-11-21/sim-lendpool-a.md) | 107111–107118 | one diag leg, GUNRATE=1 + CELLGATE=1 env ON | combination | holder-days 116, pool 2 moments; no-living-holder **130/141 (92.2%)** of unarmed-lead wave-4+ launches |

Per the task instruction ("Do NOT run a combination that has already been measured"), the combination is rejected and the named alternative is taken instead: **a bigger cell bundle per gun**.

## 2. The alternative: BIGBUNDLE — 6 cells per searcaster grant (3 volleys)

**Lever (frozen design):** `BIGBUNDLE=1` (default OFF, env-gated, node sims only). In `src/js/contests.js` `_cxItemPrize`, the GUNRATE bundle beside a granted searcaster becomes **6 fusion cells** (`units: 6`) instead of 2, to the same redirected recipient. Nothing else changes: same gun weight (4/18 tier-4), same redirect (`_gunRateFighter`), same wave-gated volley (CELLGATE). Zero new `Math.random()` draws by construction (the bundle is a constant, not a roll) — the proof test asserts draw counts.

**Why 6:** a wave-4 searcaster volley fires 2 shots (range 8, `fieldFights.js` volley sizing), so 2 cells = exactly one volley and 6 cells = up to three wave-4 volleys per gun.

**Substrate (both legs, already on master — no rebuild needed):** the GUNRATE + CELLGATE + LEND code landed env-gated OFF via sim-lendfix-a (merged `37f01cb32`); verified present in this worktree: `GUNRATE` in `src/js/contests.js` (~213) and `src/js/game.js` (~47576), `CELLGATE` in `src/js/fieldFights.js` (~1011), `LEND` in `src/js/game.js` (~21114). **LEND stays OFF on both legs.**

**Legs (differ ONLY by bundle size):**
- Control: `GUNRATE=1 CELLGATE=1`, bundle 2 (plain substrate).
- Arm: `GUNRATE=1 CELLGATE=1 BIGBUNDLE=1`, bundle 6.

**Common env (both legs, matching the lendpool band):** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1`. Competent verbatim policy. Horizon **150d death-aware**. Band **107131–107138** (fresh — see §3).

## 3. Band freshness (verified before writing this prereg)

- No seed 107131–107138 appears in any dated `evidence/2026-*/sim-*.md`, any `*prereg*.md`, any corpus filename under `evidence/` (`find evidence -name "*10713[1-8]*"` empty), or in `hidden_files/sim-findings.md`.
- Neighbouring used bands: 107111–107118 (lendpool), 107091–107098 (fibersupply), 107081–107088 (lendfix), 107051–107058 (gunrate/cellgate). A full-content grep over `evidence/` matched the digit strings only as substrings of unrelated JSON numerics, never as seed references — the filename + dated-.md + findings check is the seed check, and it is clean.

## 4. The honest tension (recorded, not hidden)

Cellgate §4 and the finding #2629 entry say **"a bigger bundle is NOT the next lever"** — the binding constraint has moved from cell survival to holder PRESENCE at wave-4+ fights, and a bigger bundle "would only add a second volley to a gun that already reaches the right fight once." This arm runs the bundle anyway, for two stated reasons: (a) the coordinator named it as the alternative if the combination was already measured, and it was; (b) there is a distinct mechanism it can move that cellgate did not test — **armed-window length**. Cellgate proved cells survive to wave 4, but 2 cells = exactly one volley: Lautaro fired once (day 117) and then carried the empty gun through seven more wave-4 fights; naran kept 2 cells to day 150 but entered only one armed fight. A 6-cell bundle keeps a holder armed across up to three wave-4 fights, so armed entries and pool presence should rise even if presence-per-fight is unchanged.

**Falsifier:** if armed entries stay ≤ 2 and pool presence stays ~8% despite 3× cells, presence is confirmed binding, the bundle is killed, and the next lever is presence-side (lead-side — get the armed holder into the wave-4+ fights), exactly as cellgate named. A bigger bundle is not re-tried after this.

## 5. Frozen bars (GO requires ALL of 1–5; a miss is NO-GO, never re-scored)

| Bar | Metric (arm leg unless stated) | Floor | Baseline for comparison |
|---|---|---|---|
| 1 | Searcaster-holder-days | ≥ 40 | cellgate arm: 194 |
| 2 | Armed-holder entries (wave-4+ entry, searcaster + ≥1 cell, any participant) | ≥ 3 | cellgate arm: 2 (missed by one) |
| 3 | Armed volleys fired (lead rangedId searcaster, shots > 0) | ≥ 2 | cellgate arm: 1 — the bundle's point is a SECOND volley |
| 4 | **Pool presence:** share of unarmed-lead wave-4+ launches with a living armed holder anywhere in the village = (unarmedLaunches − noLivingHolder) / unarmedLaunches, from the near-miss breakdown | ≥ 25% | lendpool: 11/141 = **7.8%** (no-living-holder 92.2%) |
| 5 | Guardrail, separated (frozen from gunrate/cellgate): (i) deaths per engaged wave-4+ meeting ≤ 1.10× control; (ii) median survival ≥ 0.80× control; (iii) villager starvation deaths ≤ control + 2 | all three | — |

**Instrument validity (pre-pilot, not a judged bar):** proof test green before the pilot; analyzer `--selftest` green; near-miss coverage ≥ 95% with ≤ 5% unclassified on each leg (the lendpool coverage bar — if coverage fails, the verdict is METRIC-BROKEN, not NO-GO). `v4lends` must stay 0 on both legs (LEND off); `v4lendPool` counter re-verified (lendable rows agree with pool moments).

**Outcome discipline:** if GO, the lever stays env-gated OFF on master (no default flip — a separate design decision); the arm lands instrument + evidence + the combined-substrate proof. If NO-GO, REVERT the BIGBUNDLE game-code change in the worktree before finishing (verify the revert is the exact inverse by hash), leaving instrument + evidence only, and name the next lever (presence-side / recipient weighting) with numbers.

## 6. Instrument (clones, no new recorder)

- Driver: `scripts/holdersupply-driver-a.js` — clone of `scripts/lendpool-driver-a.js` (itself the gunrate-driver lineage: ammo census, grant wraps, near-miss recorder, `v4lendPool` counter, `v4lends` recorder). MODE=ctl|arm; no lever changes in the driver (BIGBUNDLE is game code). Run name `holdersupply-a`.
- Analyzer: `scripts/analyze-holdersupply-a.js` — clone of `scripts/analyze-lendpool-a.js`, keeping its `judgeLend` bars (holder-days ≥ 40, entries ≥ 3, volleys ≥ 2, separated guardrail, starvation guardrail — already the floors in §5) plus a new pool-presence bar (bar 4) computed from the near-miss output, plus the lendpool coverage/pool-reverified bars as instrument validity. The `armedLeads` counter fix from the lendpool analyzer is kept (cellgate §4 bug — never incremented in the gunrate analyzer — already fixed in the lendpool clone; the selftest must prove it).
- Proof test: `scripts/test-holdersupply-a.js` — bundle 6 on-leg / bundle 2 with BIGBUNDLE unset (GUNRATE on) / bundle 0 with GUNRATE unset; redirect recipient unchanged; draw-count identity on `_cxItemPrize` (3 draws both legs); gear-up equips the granted searcaster; a 6-cell grant survives a low-wave hold under CELLGATE (cells kept, 0 spent).
- Panel builder: `scripts/build-holdersupply-panels-a.js` — rename of `scripts/build-gunrate-panels-a.js` (before = ctl 2-cell substrate, after = arm 6-cell bundle, seeds 107131–107138). Balanced-panel compare per docs/MEASUREMENT.md §15; the panel is the instrument, the frozen bars above are the judge.

## 7. Run plan

1. Commit this prereg BEFORE any judged sim (safe-commit).
2. Build BIGBUNDLE + proof test; proof test green before the pilot.
3. Smoke: seed 107131, both legs; corpora valid, coverage sane, `v4lends` 0.
4. Pilot: 8 ctl + 8 arm seeds 107131–107138, parallel background legs (~20–30 min each). Resume from disk if a sweep dies (VM restarted ~03:21Z during setup; re-run only missing seeds, never a partial corpus).
5. Analyze (frozen judge), build panels, compare, write evidence `evidence/2026-11-21/sim-holdersupply-a.md` (prereg, before/after on identical seeds, village assessment in plain words, metric review, next lever named).
6. If NO-GO: revert BIGBUNDLE (hash-verified inverse), re-run proof test post-revert, commit instrument + evidence only. If GO: land env-gated OFF.
7. No push, no bump, no live verification. Report branch tip + proof results + verdict to the coordinator; the coordinator merges.

## 8. Metric review (to be filled in the evidence file)

Pre-registered here as a placeholder so the evidence file carries the section: bars 1–4 measure the bundle's mechanism (grant → armed window → entries → volleys → presence); bar 5 is the frozen exposure-normalized guardrail. Known metric risks, stated in advance: (a) bar 4's denominator is unarmed-lead wave-4+ launches, which varies by band (lendpool: 141; a thin band weakens the share); (b) "armed holder anywhere in the village" is the lendpool tile-distance presence definition, not reachability (an on-expedition holder counts as present — the day-127 caveat); (c) bar 2 counts entries, not leads — the fixed `armedLeads` counter is reported alongside, not judged.
