# sim-aidleave-b — DIAG on the aid-path leave-hit (finding #2540)

**Arm:** sim-aidleave-b, Loop B run fleshout-loop-b-20261118T1430Z, axis winnability-chain.
**Branch:** `sim-aidleave-b`, tip `7da0f3d6d` (rebased onto master `8bfd1874d`; proof re-run green after the rebase).
**Verdict: DIAG-GO — mechanism (A).**
**Prereg:** `evidence/2026-11-18/sim-aidleave-b-prereg.md` (frozen BEFORE any sweep).
**Band:** 104411–104418 (8 seeds — the wildavoid band, home of the 104417 chain). **Horizon:** 150d death-aware. **Policy:** competent verbatim. **Substrate (both legs):** VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1. **Legs (both fresh, same tip, identical seeds):** ctl = substrate, FLEEREPAIR3 unset; arm = ctl + FLEEREPAIR3=1. **Cross-check:** archived `perseed-wildavoid-a-ctl` (same seeds, same substrate, older master), re-scored by the same analyzer.
**Corpora:** `evidence/2026-11-18/perseed-aidleave-b-ctl/` and `perseed-aidleave-b-arm/` (8/8 files each). **Analysis:** `evidence/2026-11-18/aidleave-b-analysis.json`. **Panel:** `evidence/2026-11-18/aidleave-b-panel.md` (+ `-before.json.gz` / `-after.json.gz`).

## The answer, in plain words

The leave-hit on the aid path **is the same parting hit the expedition fix already kills** — there is no aid-path-specific second hit, and the aid path needs no separate fix. On the control leg, all seven aid-path meetings with the trick known were leave-first wise leaves that still took damage (109 total, 13–25 each), and one villager died walking out. With FLEEREPAIR3=1, the same band's aid-path leaves took **zero damage and killed nobody** — five meetings, all clean. The aid path routes through the same `fieldFight` the fix touches (`aidFight` in comms.js calls it directly), so the fix reaches it. The staged probe proves it at unit level too: the same aid-shaped fight takes a parting hit with the flag off and none with it on.

The follow-up question the coordinator filed — whether the aid path should consult the trick-hold the way the expedition gate does — now has a number: **on this band the consult would buy nothing beyond the fix.** Re-scoring every aid trick-known wise leave as "avoided entirely" saves 109 damage and 1 death — exactly what FLEEREPAIR3 already saves (arm total 0, deaths 0). A trick-hold consult on the aid path would be a second way to save the same 109 damage. Whether it is still worth building for other reasons (fewer meetings, less wear on the crisis) is the Steve-call; the damage argument for it is gone.

## The numbers (D1–D5)

| Bar | Control | Arm | Threshold | Result |
| --- | --- | --- | --- | --- |
| D1 aid-known Suburb wise leaves (n) | 7 | 5 | — | — |
| D1 total damage taken | 109 | **0** | — | — |
| D1 mean / median / max per meeting | 15.57 / 14 / 25 | 0 / 0 / 0 | — | — |
| D1 parting hits (leave line first + damage) | 7 | **0** | arm 0 | **PASS** |
| D1 monster-first hits | 0 | 0 | — | — |
| D1 wise-leave deaths (parting deaths) | 1 (1) | **0 (0)** | — | — |
| D1 calibration | 7 fresh + 7 archived parting hits | — | ≥ 1 on a control leg | **PASS** |
| D2 mechanism | parting 100%, monster-first 0% of ctl damage; coverage 1.0 | arm total 0, arm parting hits 0 | coverage ≥ 0.80 | **PASS — mechanism (A)** |
| D3 aid-unknown, per meeting (ctl) | 36.5 (n=2, total 73, rounds 4 + 7) | — | — | known leave is ~2.3× cheaper per meeting |
| D3 world-tick trick-known (ctl) | n=0 | n=0 | — | the phenomenon is aid-concentrated on this band |
| D4 P2 re-score (ctl) | avoid 7 meetings → save 109 damage, 1 death | — | — | equals what FLEEREPAIR3 already saves |
| D4 P3 trickHolds (gate holds on trick-UNKNOWN seeks) | 13 | 11 | — | gate never touches a trick-known meeting |
| D5 wall (both legs) | nationalStanding 3/8, nationalRank 0, table 0, wins 0, wave-4 7/8, wave-5 3/8, median survival 132.5 | identical | reported | — |
| Instrument | 8/8 files both legs, 0 errors, missingHp 0, recMismatch 0/0, seed sets match | — | clean | **CLEAN** |
| Proof | `scripts/test-aidleave-b.js` ALL PASS (re-run on the rebased tip); analyzer `--selftest` ALL PASS | — | green | **PASS** |

Per-seed aid-known counts (ctl → arm): 104411: 0→0, 104412: 0→0, 104413: 0→0, 104414: 0→0, 104415: 0→0, 104416: 0→0, **104417: 7→5**, 104418: 0→0. The phenomenon lives on one seed — the 104417 chain, reproduced exactly (see below). Aid-unknown meetings (ctl, seed 104412, days 83–84): 2 fought meetings, trick unknown, rounds 4 and 7, taken 30 and 43, both fled — the learning path, working as designed. No world-tick Suburb meeting of any kind occurred on either leg (tick-known 0, tick-unknown 0): on this band the Suburb only ever meets the village as a lingering raider at the door during an aid crisis.

## The 104417 chain, meeting by meeting (ctl → arm)

Control leg (FLEEREPAIR3 off) — the archived chain, reproduced exactly:

| Day | Villager | Trick | Wise | Rounds | Taken | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| 94 | visjoin_92 (Xiuying) | known | yes | 1 | 25 | vFlee |
| 95 | visjoin_83 (Sami) | known | yes | 1 | 13 | vFlee |
| 96 | visjoin_83 | known | yes | 1 | 13 | vFlee |
| 96 | visjoin_83 | known | yes | 1 | 13 | vFlee |
| 96 | visjoin_83 | known | yes | 1 | 14 | vFlee |
| 97 | visjoin_83 | known | yes | 1 | 14 | vFlee |
| 98 | visjoin_92 (Xiuying) | known | yes | 1 | 17 | **vDie** |

Arm leg (FLEEREPAIR3=1) — five meetings, all clean: day 94 Xiuying 0, day 95 Xiuying 0, day 95 Sami 0, day 96 Sami 0, day 98 Sami 0. The days shift slightly after the first clean leave (trajectory re-rolls once the first leaver is unhurt), but every leave is damage-free and nobody dies. Total deaths on the seed fall 119 → 111; expedition deaths on the band fall 228 → 225; band deaths 705 → 697.

## Sense-test (transcripts read, not just counted)

Control leg, day 94: "Xiuying reads the sterile streets — you can't kill a suburb. They walk out. (Navigation is victory.) / Xiuying's gear absorbs 27. / R1: Property Tax hits Xiuying for 25 (70 left)". The sentence is the defect in miniature: the walk-out is narrated, then the street taxes the walker anyway. Day 97: Sami walks out at 9 HP left — "Sami is past holding — they run while running still works" — and day 98 Xiuying walks out and dies to the same line ("HOA Fine hits Xiuying for 17 (0 left)"). A villager doing the correct counter, in the right order, dies to it. That reads as a bug, not a cost.

Arm leg, day 94: "Xiuying reads the sterile streets — you can't kill a suburb. They walk out. (Navigation is victory.)" — and nothing follows. No hit line, no absorbed line, no death. The ranged opening volley still happens first (a bow-armed villager looses arrows, then reads the streets and walks out), which reads as a person arriving ready and then recognizing the street — sensible. The crisis itself stays open and the beast stays in the world; the door is not magically safe. The learning path is untouched: the two trick-unknown meetings (104412, days 83–84) still stand and fight for 4–7 rounds and flee wounded. **Sense-test: PASS.**

## Panel (§15) + the community-loss watch

`balance-panel.js compare`: decision `review_required` — the standard screen-only outcome for an 8-seed panel (confirmationSized false), not a flagged regression. No `regression_signal`. Every observed metric is `no_material_signal` or descriptive with delta 0 or tiny (village deaths 88.125 → 87.125; survival flat; wins 0 both legs) — except one `regression_watch`: community loss 0.625 → 0.75 (+0.125, interval 0 to 0.375). Investigated: the only seed that differs is 104417 — ctl survived (150d, standing 410), arm village-lost day 145 (standing 360, deaths 111 vs 119). All other seven seeds are identical on endReason, days, standing, deaths, and maxWave. The arm leg's extra loss is a knock-on trajectory re-roll after the saved day-98 death (the saved villager lives and the village takes a different path, losing 5 days earlier with *fewer* deaths) — not a lever cost: the lever's direct effect on that seed is strictly fewer deaths and zero leave damage. The watch is explained, not a regression.

## Trajectory stability (fresh ctl vs archived wildavoid ctl)

The fresh control leg reproduces the archived `perseed-wildavoid-a-ctl` corpus **exactly** on every checked number: aid-known slice 7 meetings / 109 damage / 7 parting hits / 1 death on both; aid-unknown 2 meetings / 73 damage on both; wall identical (nationalStanding 3/8, nationalRank 0, table 0, wins 0, wave-4 7/8, wave-5 3/8, median survival 132.5); total deaths 705 on both; total wave-4 encounters 175 on both; wave-4 kills 5 on both. The master moved between the two corpora (fleerepair3 + fightcap landings, both env-gated), and nothing in the aid-path numbers moved with it. The instrument is stable; the verdict does not rest on a drifting baseline.

## Village assessment (plain words)

Seed 104417's village is the story of the band: it learns the Suburb's trick, answers Haven's call for help seven times in five days, does the right thing every single time — and pays for it in blood anyway, until one of its own dies walking out of a street she had already left. With the fix on, the same village answers the same call, walks out clean five times, and the death never happens. The rest of the band is unchanged: the same three villages reach national standing, the same three unlock wave 5, nobody wins, nobody sits at the table. The wall did not move — this arm was never about the wall; it was about whether a correct exit should cost a life. It shouldn't, and with the flag on, it doesn't.

## Metric review

- D1's "instrument captures on ≥8 seeds" bar was written as files/seeds, and the phenomenon itself lives on one seed (104417). The bar passes as written (8/8 files both legs, per-seed counts reported), but a future arm should say whether it wants population (meetings on many seeds) or depth (the chain, fully classified) — here the chain *is* the population, and the archived corpus agrees with the fresh one exactly, so depth was the right call.
- D3's known-vs-unknown contrast needed the fix the analyzer carries: a trick-unknown villager can never fire the leave trick, so the unknown slice is fought meetings (rounds ≥ 1), not wise leaves. The prereg's D3 wording ("wise-leave damage per meeting with trickBefore true vs false") was loose; the analyzer implements the honest version (known wise leaves vs unknown fought meetings) and the evidence reports it that way.
- D2's mechanism ladder (A/B/C/mix) worked: with parting at 100% and arm parting hits at 0, the verdict is unambiguous. The ladder's C-branch (arm still takes leave-first damage) is untested on live data — it only fires on synthetic legs in the proof test. That is fine for a DIAG arm; C was the branch that would have meant a second build.
- The P2 re-score's "saved damage" equals the fix's savings by construction on this band (every avoided meeting was a parting hit). On a band with monster-first hits, P2 would overstate the consult's value relative to the fix; a future re-score should report saved-parting vs saved-monster-first separately (this analyzer already splits them in `p2`).

## Findings updates (for the coordinator to file — this arm does not edit sim-findings.md)

- **#2540 (aid-path leave-hit): ANSWERED — mechanism (A).** The aid-path leave-hit is the #2500 parting hit, shared by all `fieldFight` callers: aid trick-known wise leaves took 109 damage across 7 meetings on the control leg (all leave-first, 1 death) and 0 damage across 5 meetings with FLEEREPAIR3=1. No aid-path-specific second hit exists (monster-first 0, arm parting hits 0). FLEEREPAIR3 already covers the aid path; no separate aid-path fix is needed. The remaining question is the Steve-call: whether the aid path should consult the trick-hold (avoid the meeting entirely when the trick is known). Measured value of the consult on this band: **0 additional damage or deaths saved beyond FLEEREPAIR3** (P2 re-score 109 damage / 1 death = the fix's own savings). #2539/#2540 can close as answered once the coordinator records the Steve-call.
- **NEW observation (not a defect claim): ranged opening volley before a known-trick leave.** Bow-armed villagers who know the Suburb can't be killed still loose their opening arrows at it (15–19 damage a shot, 3–4 shots) before reading the streets and walking out — on both legs. The arrows chip its HP, but the meeting is resolved by the walk-out, not by the damage (the fight is a timer; the beast stays in the world and the crisis stays open), so the volley buys nothing toward the resolution and the arrows are simply spent. Worth a look only if arrow economy ever matters; filed as an observation, no arm claimed.

## Files

- Prereg: `evidence/2026-11-18/sim-aidleave-b-prereg.md` (frozen before the sweep; commits `406f25ef0` + `7da0f3d6d` after rebase onto master `8bfd1874d`).
- This evidence file: `evidence/2026-11-18/sim-aidleave-b.md`.
- Analysis: `evidence/2026-11-18/aidleave-b-analysis.json` (ctl → arm + archived cross-check).
- Panel: `evidence/2026-11-18/aidleave-b-panel.md` (+ `-before.json.gz` / `-after.json.gz`).
- Corpora: `evidence/2026-11-18/perseed-aidleave-b-ctl/` + `perseed-aidleave-b-arm/` (8 files each).
- Instruments: `scripts/aidleave-driver-b.js`, `scripts/analyze-aidleave-b.js`, `scripts/build-aidleave-b-panels.js`. Proof: `scripts/test-aidleave-b.js` (ALL PASS on the rebased tip; analyzer `--selftest` ALL PASS).
- No src/ changes. No push, no bump, no live verification — the coordinator merges.
