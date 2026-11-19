# sim-winnability-round-0130 — Loop B run fleshout-loop-b-20261119T0130Z (axis winnability-chain)

**Scheduled:** 19:30 CST Nov 18, 2026. **Timed out at 7200s; finished by adoption.**
**Base master:** `48c81dac6`. **This run created NO lock** — the 2330Z adoption held `fleshout-loop-b.lock` throughout (its claim still live at adoption time); this run's claim `fleshout-loop-b-20261119T0130Z.json` is retired to .DEAD by the adoption.
**Arms:** sim-sensecotravel-b (DIAG-GO) + sim-carriersetup-b (NO-GO THIN-POOL, both variants).

## Arm 1 — sim-sensecotravel-b: DIAG-GO (commit `792c9d645`, merged whole)

Corrected join (finding #2570) + sense co-location decomposition (finding #2571) on the frozen 2330Z allyslot3 corpora (band 104720–104727, 8 seeds/leg, 150d). No new sims.

- The analyzer's join is now fighter-anchored best-match (fighter must belong, most sensed allies wins, most recent on ties). Re-judgment reproduces the pilot evidence's own sensitivity note exactly: **field-4 4/6 = 0.67** (was 3/7 = 0.43), sense 6/9 (was 5/10). The pilot's NO-GO stands under its frozen bar (0.80) — a re-judgment, not a re-score.
- Every arm-leg sense miss classified, 0 unclassified (7 missing companions): expedition-ended 3, different-expedition 2, dead 2. **The guard never bit** — and there is no tile-equality guard at all; the code guards on expedition TARGET with an explicit "no node check" comment. Every miss had a truncated plan party at the meeting instant; when the plan party is intact the sense returns the trio **6/6**.
- **The binding constraint moved from the sense to plan-party integrity over the expedition's life.** Next lever (finding #2583, filed this run): the sense should read expedition membership, not the mutable plan party.
- Proofs (re-verified by the adoption on the branch): analyzer selftest 24/24, proof test 24/24. No src/js changes — evidence + analyzer + proof test only. Findings #2570 FIXED, #2571 ANSWERED.
- Evidence: `evidence/2026-11-18/sim-sensecotravel-b.md`.

## Arm 2 — sim-carriersetup-b: NO-GO, THIN-POOL, both variants (evidence only; lever HELD)

Rage-carrier setup fixes (finding #2568), fresh band 104931–104938, 8 seeds/leg, 150d, shared control. Full evidence: `evidence/2026-11-19/sim-carriersetup-b.md`.

- **Free** (Rage as a free action striking the same round): mechanism works — 5 fires, all 5 free-action fires, 0 paired setup-deaths, damage/round 37.5 vs ctl 24.9 — but **kill share 0/9 vs ctl 0/8**. The setup death is fixed; the kill is not.
- **Floor** (HP ≥ 50% + armor P ≥ 10): gates fires (8 floor-block records) but the paired-death bar **FAILS** — Pavel d77 fired at 97% HP / P11, dealt 197 in 4 rounds and died where his ctl twin fled. A healthy holder still dies paying the setup round. Kill share **0/7 vs ctl 0/8**.
- **Pool missed on the control leg: ctl pair n 8 < 10** (free 9, floor 7) — the whole pilot is NO-GO THIN-POOL by the frozen ladder, and the thin pool hides no passing arm (both variants miss kill share regardless).
- Costs all pass on both variants (community loss free 4/8 = ctl, floor 5/8 exactly at bar; starvation 2 vs 3; medians 149.5 / 126.5 vs 132.5). Instrument errors 0.
- Panels both `review_required` (screen only). Proofs: 52/52 + instr 14/14 + analyzer selftest 29/29 (re-verified by the adoption).
- **Reconciliation with Loop A's sim-rage-setup-a** (parallel free-action implementation, RAGEFREE flag, `godpath.js` only): its worker reported NO-GO on kill-share bars; both free-action implementations stay HELD; the floor variant is unique to this arm. No landing conflict — nothing from either arm merges as game code.
- Landing: evidence only (prereg `da6faff4b` + evidence `3b9dc35fb` cherry-picked); build `57d54f00a`, tooling adaptation `a3fc095be`, and the held substrate/carrier cherry-picks stay on branch `sim-carriersetup-b`, never to merge.

## Wall numbers

Per arm (different bands — reported side by side, not blended):

| | sensecotravel corpora (allyslot3 pilot, 8 seeds/leg) | carriersetup ctl | carriersetup free | carriersetup floor |
| --- | --- | --- | --- | --- |
| Wins (full seat) | 0 | 0 | 0 | 0 |
| National scale | 0 | 0 | 0 | 0 |
| Wave 4 reached | 7 | 8/8 | 8/8 | 8/8 |
| Wave 5 reached | 5 | 3/8 | 2/8 | 2/8 |
| Median survival | 136d / 137d | 132.5d | 149.5d | 126.5d |
| Survived 150d | 4 / 4 | — | — | — |

No village took the full seat on any leg; no village reached national. The wall is unchanged in shape: launched parties still cannot kill wave-4 monsters (0 kills on 16 judged variant meetings this run), and the damage ladder — not the setup turn — is now the named binding constraint for the carrier.

## Telemetry

`node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-18/perseed-carriersetup-b-free/*.json' --metrics national,table,wins,exiled` — **REFUSED recorder-corpus input** (all 8 rows carry top-level anchorCommit; same documented refusal as the fieldcarrier-confirm-a arm). Recorder corpora are compared with sweep-compare tables, never against a run baseline here. **Baseline NOT rolled.** No LOUD lines to investigate.

## Gate

(To be filled after the check.js run on the landed tip — see below.)

## Findings touched

- #2570 FIXED (corrected join, sensecotravel-b).
- #2571 ANSWERED (expeditions genuinely split; the guard never bit).
- #2583 FILED (sense reads the mutable plan party, not the expedition — next lever).
- #2568 UPDATED (free fixes the setup death but not the kill; floor does not fix the setup death; next arm is a damage question).

## Convergence

Winnability-chain stays **converging, not converged**. The carrier line is now: the setup turn is no longer the question — free-action Rage removes the setup death and still kills nothing (0/9), and an HP/armor floor cannot save a healthy holder from the setup round's cost. The next capability arm must lift launched-party damage (~38/round toward ~111/round), not re-time the setup. The sense line moved upstream to plan-party integrity (#2583). The 2330Z round's partysize4-confirm and allyslot3-rerun arms were adopted separately and are not re-judged here.
