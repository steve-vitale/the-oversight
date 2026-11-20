# sim-spearstage-a — NO-GO (finding #2590 staging blind spot)

- **Arm:** sim-spearstage-a (MEASURE/confirm — the SPEARGATE fix is already landed; this arm measures gate+source TOGETHER under live BOWCRAFT ground)
- **Run:** fleshout-20261119T2215Z (Loop A, scale-onramp axis), adoption by 31c69d8c
- **Prereg:** `evidence/2026-11-19/sim-spearstage-a-prereg.md` (commit `0aa9aa9fe`, frozen ~00:30 UTC Nov 20)
- **Proof test:** `scripts/test-spearstage-a.js` — 26/26 (new; spear-holder passed to sources, craft attempts with knowledge+mats, honest noSource without, real bow still alreadyHad both legs, flag-off byte-identical). Re-run alongside: `test-speargate-a.js` 31/31, `test-bowcraft-a.js` 58/58.
- **Analyzer:** `scripts/analyze-spearstage-a.js` — cloned from the speargate analyzer (selftest 49/49); SERVED + volley-rate-rise judge, deaths-per-engaged-meeting cost bar added. Panel builder `scripts/build-spearstage-panels-a.js` cloned the same way (the speargate builder hardcodes its RUN segment; spearstage corpora carry RUN=spearstage-a).
- **Band:** fresh 107041–107048 (8 seeds × 2 legs, 150d, paired). Legs differ ONLY by env: ctl SPEARGATE unset, arm SPEARGATE=1; both BOWOPEN=1 + SENSEEXPED=1 + VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1. BOWCRAFT always-on in code.
- **Verdict: NO-GO** — the gate replicates perfectly and every cost bar passes, but the two binding mechanism bars fail: nothing is served, so no volley rises. Killed cleanly per the frozen bars; no re-scoring.

## Frozen bars (prereg)

| Bar | Result | Pass |
|---|---|---|
| 0. Pool floor: arm spearSeen ≥ 10 | 49 | YES |
| 1. Gate replication: arm spearPassed/spearSeen == 1.0 | 49/49 = 1.000 | YES |
| 2. Gate replication: ctl spearPassed == 0 | 0 | YES |
| 3. alreadyHad consistency ±3 | arm 101 vs ctl 150 − 49 = 101 (delta 0) | YES |
| 4. noSource consistency ±3 (frozen formula as written) | arm 130 vs ctl 81 + 49 = 130 (delta 0) | YES |
| 5. **SERVED: arm.staged − ctl.staged ≥ 3** | arm 1 − ctl 1 = **0** | **NO** |
| 6. **Volley-rate rise arm − ctl ≥ +0.10** (pair-inclusive) | 0.500 − 0.500 = **+0.000** | **NO** |
| 7. Cost: kill share ≥ ctl − 0.05 | 0.200 vs 0.200 | YES |
| 8. Cost: damage/round ≥ 0.9× ctl | 43.4 vs 43.4 | YES |
| 9. Cost: deaths per engaged meeting ≤ ctl × 1.10 | 80.80 vs 80.80 (×1.10 = 88.88) | YES |
| 10. Cost: community loss ≤ ctl + 0.125 | 3/8 vs 3/8 | YES |
| 11. Cost: starvation ≤ ctl + 2 | 0 vs 0 | YES |
| 12. Cost: median survival ≥ 0.8× ctl | 150d vs 150d | YES |

## What the numbers say

**The gate works exactly as designed — the serve fails downstream.** All 49 spear-holder departures are passed to the sources (pass rate 1.000, ctl 0), and the consistency deltas are both exactly 0: every spear-holder who was alreadyHad on ctl is noSource on arm, and nothing else moved. But the sources yield nothing for them: fromStash 0, fromArmory 0, crafted 1 on BOTH legs — the single crafted bow came from a non-spear departure with knowledge + materials (identical on both legs), and the 2 craftedFails are the same two seeded-identical departures failing the 35% L1 roll on both legs. **48 of 49 passed spear-holders land in noSource.** With nothing served, no new bow ever enters a fight: the pair-inclusive fight population is byte-identical (10 meetings, 3 wins, 2 kills, volley 5/10, damage/round 43.4 on both legs), as is the trio+ population (6 meetings, 2 wins, 1 kill, volley 3/6) and the whole funnel (27 encounters, 13 pair launches, 5 evade-excluded). Every cost bar passes trivially because nothing changed — the gate is provably harmless and provably inert on this band.

**Why nothing is served:** a departure craft needs the villager to PERSONALLY know the bow recipe (lv[bow] ≥ 1, seeded only by seeing an equipped bow at home) plus reachable materials, and a stash/armory serve needs a bow sitting there. Spear-holders evidently have neither: they never handled a bow, so they never learned it, and no bows sit in stash or armory for them. The proof test shows the craft path fires the moment knowledge + materials are present — in live play they almost never are for spear-holders. **The blind spot is closed at the classification step and open at the supply step: the next lever is bow-knowledge reach for spear-holders (or bows in the stash/armory), not the gate.** #2590 stays OPEN on the serve half; the gate half is confirmed.

**Frozen-formula note (for the metric review, not a re-score):** the noSource consistency bar as written (arm.noSource vs ctl.noSource + arm.spearSeen, no term for staged) is satisfiable only while arm.staged ≤ 3, meeting SERVED exactly at 3. It did NOT bind here (staged 1, delta 0), so the verdict is clean. A future run that serves 4+ would fail bar 4 by construction; the partition formula (minus arm.staged) should replace it before then.

## Per-seed staging

| Seed | Days | End | Standing | Max wave | spearSeen (ctl/arm) | spearPassed (arm) | alreadyHad ctl→arm | crafted | craftedFail | noSource ctl→arm |
|---|---|---|---|---|---|---|---|---|---|---|
| 107041 | 151 | survived | 750 | 5 | 10 / 10 | 10 | 35 → 25 | 0 | 0 | 3 → 13 |
| 107042 | 150 | survived | 199 | 4 | 5 / 5 | 5 | 10 → 5 | 0 | 0 | 0 → 5 |
| 107043 | 135 | village-lost | 320 | 5 | 1 / 1 | 1 | 2 → 1 | 0 | 0 | 5 → 6 |
| 107044 | 150 | survived | 485 | 5 | 2 / 2 | 2 | 14 → 12 | 0 | 0 | 2 → 4 |
| 107045 | 106 | village-lost | 505 | 5 | 7 / 7 | 7 | 15 → 8 | 0 | 2 | 39 → 46 |
| 107046 | 131 | village-lost | 275 | 5 | 0 / 0 | 0 | 0 → 0 | 0 | 0 | 12 → 12 |
| 107047 | 150 | survived | 575 | 5 | 24 / 24 | 24 | 48 → 24 | 1 | 0 | 20 → 44 |
| 107048 | 150 | survived | 400 | 5 | 0 / 0 | 0 | 26 → 26 | 0 | 0 | 0 → 0 |

Seed 107047 carries half the pool (24/49 spear departures). Seeds 107046/107048 have no spear-holder departures at all. Days, standing, and deaths are identical between legs on every seed.

## Panel (instrument)

- Built `spearstage-a-panel-before/after.json.gz` from the paired corpora.
- `node scripts/balance-panel.js compare` → decision `review_required`; every observed metric delta 0 (won 0→0, villageDeaths 101→101, communityLost 0.375→0.375, survival30/60 1→1). The panel confirms the legs are identical; the frozen bars are the judge.

## Wall numbers (this band, both legs identical)

- Wave 4 reached 8/8, wave 5 reached 7/8, national 0/8, full wins 0/8.
- Median survival 150d; community lost 3/8.
- Deaths 808 total (101/village), 80.80 per pair-inclusive engaged meeting — the denominator is the thin 10-meeting pair population, so the ratio is a guardrail read, not a rate claim.

## Files

- Prereg: `evidence/2026-11-19/sim-spearstage-a-prereg.md`
- Per-seed corpora: `evidence/2026-11-19/perseed-spearstage-a-ctl/` + `perseed-spearstage-a-arm/` (8 JSONs each, 107041–107048)
- Analysis: `evidence/2026-11-19/spearstage-a-analysis.json`
- Sweep logs: `evidence/2026-11-19/spearstage-a-ctl.log` / `.err`, `spearstage-a-arm.log` / `.err` (0 errors)
- Panels: `evidence/2026-11-19/spearstage-a-panel-before.json.gz`, `...-after.json.gz`, `spearstage-a-panel.json`
- Instrument: `scripts/test-spearstage-a.js`, `scripts/analyze-spearstage-a.js`, `scripts/build-spearstage-panels-a.js`

## Open next

- #2590 stays OPEN on the serve half (gate half confirmed: 49/49 passed, consistency delta 0).
- Next lever (for a future arm, not this one): bow-knowledge reach for spear-holders, or bows in stash/armory — the serve path, not the gate.
- Metric review owed: noSource consistency bar needs the partition formula (minus arm.staged) before any run that could serve 4+.
