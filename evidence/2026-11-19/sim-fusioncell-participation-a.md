# sim-fusioncell-participation-a — DIAG-GO (finding #2599 follow-up)

- **Arm:** sim-fusioncell-participation-a (DIAG, evidence-only, no game-code change)
- **Run:** fleshout-20261119T2215Z (Loop A, scale-onramp axis), adoption by 31c69d8c
- **Prereg:** `evidence/2026-11-19/sim-fusioncell-participation-a-prereg.md` (commit `39b011c23`, frozen ~23:50 UTC Nov 19)
- **Instrument:** commit `dd6d87490` (driver + analyzer + panel builder + proof test 33/33)
- **Smoke:** commit `4728409d8` (seed 107031 clean, 8 wave-4+ meetings, 0 errors, lead/flee fields live)
- **Band:** fresh 107031–107038 (8 seeds, single leg, 150d). Substrate SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1; BOWOPEN/BOWCRAFT/SPEARGATE/FUSIONCELL unset. BOWCRAFT is always-on in code, so the ground is live-bowcraft.
- **Verdict: DIAG-GO** — all three frozen bars hold (analyzer selftest 39/39).

## Frozen bars (prereg §DIAG-GO)

| Bar | Result | Pass |
|---|---|---|
| 1. Lead rule attributed ≥ 80% of wave-4+ meetings | 125/125 = 1.000; by rule expedition-holder 34, aid 30, world-tick 61; unclassified 0 | YES |
| 2. Flee cause classified ≥ 80%, ≤ 2 unclassified | 75/75 = 1.000; by cause hopeless-after-help 53, floor-hp 11, wise-leave 11; unclassified 0 | YES |
| 3. Pool floors ≥ 25 wave-4+ meetings AND ≥ 8 flees | 125 meetings, 75 flees | YES |

## The three questions

**Q1 — Who leads wave-4+ fights?** The lead is attributed on every meeting, and the plurality is **world-tick (61/125, 49%)** — the monster walks in and the fight starts where it stands, not launched by a plan. Expedition-holder leads 34 (27%), aid 30 (24%). No meeting is unled-by-rule. The launch-decision wall is visible here in miniature: fewer than a third of wave-4+ fights are led by the expedition holder — most are arrivals, not hunts.

**Q2 — Why do armed parties flee?** They flee **hopeless-after-help (53/75, 71%)**: the party engages, calls for help, help comes or doesn't, and the fight is still unwinnable — so they leave. Floor-hp 11 (fled at the health floor), wise-leave 11 (left while still winning-able). The dominant flee is not panic and not a bad call: it is a correct read of a fight the party cannot win. That is the damage wall, not a courage wall.

**Q3 — Do armed holders lead / volley?** **The pool is empty: 0 armed entries, 0 armed leads, 0 armed volleys, 0 armed flees in 125 meetings.** "Armed" = a party participant holding a searcaster with ≥ 1 cell. One level up, the reason is supply, not behavior: **0 searcaster holders in all 8 villages across the whole run** (searcaster holder-days 0). Cells exist but barely — 5 single-cell appearances (spawned 1, contest-prize 3, moved 1), max 1 cell ever held at once, 79 cell-holder-days. A cell with no searcaster is a paperweight: nobody can fire it. This sharpens the 1815Z finding (the one armed holder, nora_wilson seed 107028, never led): on a fresh band the armed-holder population is zero, so there is no one to lead. **#2599 is ANSWERED at the supply level — the next lever is searcaster supply to villagers, not holder bravery.** (The analyzer's cell-side volley-opportunity-pool bar records this as the RARE-RATE path: pool thin, stated as a finding, not re-scored.)

## Wall numbers (this band)

- Wave 4 reached 8/8, wave 5 reached 4/8, national 0/8, full wins 0/8.
- Median survival 143d; 4/8 villages lost (communityLost 4/8).
- Deaths 614 total, 6.20 per engaged wave-4+ meeting.
- Lead-ranged volley damage 924 of 5,159 monster damage dealt by leads (17.9%) — the volley contributes, but only from bows; no fusion-cell volley exists in the band.
- Standing-199 stall: 4/8 villages sit at exactly 199 (107031, 107032, 107033, 107037).

## Per-seed

| Seed | Meetings | Engaged | Flees | Armed | Days | End | Standing | Max wave |
|---|---|---|---|---|---|---|---|---|
| 107031 | 8 | 4 | 4 | 0 | 63 | village-lost | 199 | 4 |
| 107032 | 25 | 22 | 11 | 0 | 150 | survived | 199 | 4 |
| 107033 | 3 | 3 | 2 | 0 | 136 | village-lost | 199 | 4 |
| 107034 | 17 | 9 | 8 | 0 | 150 | survived | 310 | 5 |
| 107035 | 13 | 12 | 10 | 0 | 115 | village-lost | 275 | 5 |
| 107036 | 47 | 37 | 31 | 0 | 150 | survived | 325 | 5 |
| 107037 | 12 | 12 | 9 | 0 | 128 | village-lost | 199 | 5 |
| 107038 | 0 | 0 | 0 | 0 | 150 | survived | 665 | 5 |

Note: seed 107038 reached wave 5 and standing 665 with **zero** wave-4+ meetings recorded — the wave timer advanced but no wave-4+ monster was ever met. A quiet band is still a band; the pool floors held on the other seven seeds.

## Panel (instrument, single-leg zero-delta screen)

- Built `fusioncell-participation-a-panel-before/after.json.gz` from the same corpus (before==after by design — a DIAG carries no lever to compare).
- `node scripts/balance-panel.js compare` → decision `review_required`, won 0→0, delta 0, tied 8/8. Zero-delta confirmed; the panel is the instrument, the frozen bars are the judge.

## Files

- Prereg: `evidence/2026-11-19/sim-fusioncell-participation-a-prereg.md`
- Per-seed corpora: `evidence/2026-11-19/perseed-fusioncell-participation-a/` (8 JSONs, 107031–107038)
- Analysis: `evidence/2026-11-19/fusioncell-participation-a-analysis.json`
- Sweep logs: `evidence/2026-11-19/fusioncell-participation-a-sweep.log` / `.err` (0 errors)
- Panels: `evidence/2026-11-19/fusioncell-participation-a-panel-before.json.gz`, `...-after.json.gz`, `fusioncell-participation-a-panel.json`
- Instrument errors: 0 across all 8 seeds; census coverage 8/8 complete.

## Open next

- #2599 CLOSED (answered: no armed-holder population on this band; searcaster supply is the binding constraint, not holder behavior).
- Next lever (for a future arm, not this one): searcaster supply to villagers — how a searcaster ever reaches a villager's hands (loot? craft? armory?) — before any holder-behavior lever can be measured.
