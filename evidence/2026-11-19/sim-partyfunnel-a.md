# sim-partyfunnel-a — pilot evidence (finding #2547 family)

**Verdict: NO-GO (pilot, frozen bars) — STOP. No confirm spent.**

- **Arm:** `sim-partyfunnel-a` (Loop A, run fleshout-20261119T0915Z, axis scale-onramp; finishing the timed-out 0615Z arm)
- **Fix:** the party-formation funnel AFTER seeding — a seeded wave-4 hunt plan survives its holder's death via reassignment (to a living party member, else a Haven successor), and a retarget holds a staged ('party'-stage, targeted) party. `PARTYFUNNEL`-gated in `src/js/win-plan.js`.
- **Branch:** `sim-partyfunnel-a`, tip `efbf674d1` (frozen prereg `c2073d6ad`, substrate merge `64b0fb1a6`, lever `b4cda1de2`, instruments `efbf674d1`). **Lever HELD — nothing in this run changes game code.** This landing is evidence-only (corpora, analysis, panels, evidence file).
- **Prereg:** `evidence/2026-11-19/sim-partyfunnel-a-prereg.md` (frozen before any sims; binds this run).
- **Substrate (both legs):** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1`; `PARTYFORMFIX`, `WILDSEEDPLAN`, `WILDAVOID` unset on both legs. Policy: competent verbatim. Horizon: 150d death-aware.
- **Seeds:** pilot 105701–105708 (8/leg, identical). The 0615Z run timed out after 2 control seeds (s105701, s105702); both files were verified valid before reuse (anchor `efbf674d1`, competent policy, full fields) and NOT re-run. This run added control 105703–105708 and all 8 arm seeds. Sweeps chunked ≤8 seeds per exec call (finding #2582).
- **Instruments:** driver `scripts/partyfunnel-driver.js`; analyzer `scripts/analyze-partyfunnel-a.js` (selftest ALL PASS before any sweep, 42/42 incl. reassignment-chain cases); proof test `scripts/test-partyfunnel-a.js` (ALL PASS, §1–§6 with old-code-fails controls); panel builder `scripts/build-partyfunnel-panels-a.js`.
- **Analysis:** `evidence/2026-11-19/partyfunnel-a-pilot-analysis.json`. **Panel (§15):** `evidence/2026-11-19/partyfunnel-a-panel.md` (compare of `partyfunnel-a-panel-before.json.gz` / `-after.json.gz`).

## Primary metric (frozen)

Seeded wave-4 plans that launch with a formed party (plan reaches stage `'hunt'` with `party.length >= 1`, following the plan across holder reassignments). GO requires ALL of: arm rate ≥ 50% AND arm rate ≥ 2× control, pool floor ≥ 8 seeded wave-4 plans per leg.

| | Control | Arm | Bar | Pass? |
|---|---|---|---|---|
| Seeded wave-4 plans | 17 | 19 | ≥ 8/leg | yes |
| Launched with party | 4 | 8 | — | — |
| **Launch-with-party rate** | **4/17 = 0.235** | **8/19 = 0.421** | ≥ 0.50 AND ≥ 2× ctl (≥ 0.471) | **no — both halves miss** |
| Launched solo | 0 | 0 | reported | — |
| Stalled | 4 | 8 | reported | — |
| Retargeted | 1 | 2 | reported | — |
| Deleted | 8 (all "holder died") | 1 | reported | — |

The prereg's arithmetic said recovering half the 8 dead-holder plans takes the arm from 8/22 (0.364) to ~12/22 (0.545). On this band the funnel did recover plans — 11 reassignments, 6 of them launching — but the denominator also grew (19 vs 17) and the stalls moved, so the arm lands at 0.421: short of 0.50 by 2 launches and short of 2× control (0.471) by 1 launch. A miss is a NO-GO, never re-scored.

## The funnel itself works — the losses moved, they did not vanish

| Funnel read | Control | Arm |
|---|---|---|
| Plans reassigned on holder death | 0 | 11 |
| Of which launched with party | 0 | 6 |
| Reassignment vias (events; one plan reassigned twice) | — | haven-successor 9, party-member 3 |
| No-successor deaths (plan deleted, nobody to take it) | 16 | 2 |
| Retarget holds (party-stage plan kept its target) | 0 | 4 |
| Band-wide first hunts with a party (any wave) | 12 | 18 |
| Band-wide first hunts solo | 0 | 0 |

Holder death as a deletion cause is closed: control deleted 8 seeded plans, all with detail "holder died"; the arm deleted 1. The no-successor count fell 16 → 2. The retarget hold fires exactly as designed (4 holds, control 0 by construction). The clearest single seed is 105704: control 0/1 (stalled hurt, village lost day 105); arm 3/3 launched, two of them reassigned, village survived to 150d at standing 485. And 105701's influencer plan was reassigned twice (haven-successor, then party-member) and still launched the next day with a companion.

What the funnel cannot fix is the stall that replaced death: **pool-empty is now the dominant arm stall, 4 of 8 stalled plans (0.50)** — the (b)-trigger in the frozen prereg FIRES. The holders are alive, the plans survive, and there is nobody to form the party with. That is findings #2561 (widen `findCompanion` beyond ranger profiles) and #2562 (score the holder's range at staging), which the prereg deliberately left unbuilt pending exactly this trigger. The next arm is the pool, not the funnel.

## Cost bars (all must pass for GO)

| Bar | Control | Arm | Rule | Pass? |
|---|---|---|---|---|
| C1 median survival | 148d | 150d | arm ≥ 0.8× ctl | **yes** (ratio 1.01) |
| C2 starvation deaths (band total) | 3 | 8 | arm ≤ ctl + 2 (= 5) | **no** |
| C3 community loss (villages lost) | 4 | 2 | arm ≤ ctl + 1 (= 5) | **yes** |

C2 fails by 3 deaths. Arm starvation deaths by seed: 105701: 2, 105702: 2, 105703: 2, 105707: 1, 105708: 1; control: 105701: 1, 105702: 2. Two candidate readings, neither established from this corpus: (a) exposure — the arm kept 2 more villages alive to 150d (6 survivors vs 4), so band totals count deaths over more lived days (the §15 panel shows the same shape: village deaths per run up +3.5, per 100 lived days DOWN 72.81 → 70.08); (b) diversion — the funnel pulls Haven-idle villagers into hunts as successors, taking foragers out of food work. The miss stands as a miss either way. The next run should instrument starvation by holder vs non-holder and by expedition-days, and should judge cost bars per lived day (see Metric review).

## Per-seed (identical seeds, 150d death-aware)

| Seed | Ctl seeded → launched | Ctl end (standing) | Arm seeded → launched | Arm end (standing) |
|---|---|---|---|---|
| 105701 | 2 → 2 | lost d146 (199) | 1 → 1, reassigned ×2 | survived (199) |
| 105702 | 2 → 1, 1 stalled hurt | survived (199) | 2 → 1, 1 stalled hurt | survived (199) |
| 105703 | 2 → 1, 1 deleted (holder died) | survived (320, w5) | 3 → 1, 1 retargeted, 1 stalled hurt | survived (275, w5) |
| 105704 | 1 → 0, stalled hurt | lost d105 (360, w5) | 3 → 3, 2 reassigned | survived (485, w5) |
| 105705 | 4 → 0, 2 deleted, 1 retargeted, 1 stalled hurt | survived (450, w5) | 2 → 0, 2 stalled pool-empty | survived (425, w5) |
| 105706 | 1 → 0, deleted (holder died) | survived (560, w5) | 1 → 0, stalled pool-empty (reassigned) | survived (560, w5) |
| 105707 | 0 → 0 | lost d127 (199) | 2 → 0, stalled pool-empty + no-rows | lost d136 (199) |
| 105708 | 5 → 0, 4 deleted, 1 stalled range-0 | lost d110 (365, w5) | 5 → 2, 1 deleted, 1 retargeted, 1 stalled range-0 | lost d111 (315, w5) |

Stall shapes: control hurt 3, range-0-holder 1; arm pool-empty 4, hurt 2, range-0-holder 1, no-rows 1. Seed 105708's two arm launches both landed on day 111 — the day the village was lost — with the same final holder and party (see Metric review instrument note).

## Wall numbers (per leg, 8 seeds)

| | Control | Arm |
|---|---|---|
| National standing (≥ 200) | 5/8 | 5/8 |
| National rank | 0/8 | 0/8 |
| Table | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 |
| Wave-4 unlock | 8/8 | 8/8 |
| Wave-5 unlock | 5/8 | 5/8 |
| Median survival | 148d | 150d |

The scale wall is unchanged by this arm, as expected — it is a party-formation funnel, not a scale lever. Every village reaches wave 4, five of eight reach wave 5 on both legs, none reaches national rank, the table, or a win.

## Village assessment (plain words)

Eight villages, same eight on both legs, and the arm mostly just lets them live longer. On the control leg the story of the band is plans dying with their holders: seed 105708 seeds five wave-4 hunts and loses four of them the day their holder dies — Somchai, Naran, Ruth and one newcomer all carry a hunt to the grave, and the village itself is gone by day 110. On the arm leg the same village still dies on day 111, but two of those hunts get picked up by someone else and actually go out — Ruth's cancellation hunt goes out under a successor with three companions. It launches on the village's last day, which is bleak rather than triumphant, but the mechanism did what it promises: the hunt outlived its holder.

The villages that thrive are the ones whose plans survive at all. Seed 105704 is the turnaround: on control its one hunt stalls because the holder is hurt and the village dies at day 105; on the arm leg three hunts launch, two handed on after a death, and the village stands at 485 with five waves unlocked. Seeds 105705 and 105706 show the new ceiling: healthy villages, standing 425 and 560, hunts seeded and held — and nobody to go with. The holder stands at Haven with a plan, a target, and an empty party. That is the village's shape now: it remembers the beast, it has the gear, and it cannot find a second person willing and able to walk out with it.

Who died and why: on the control leg the villages that died (105701, 105704, 105707, 105708) died with their hunts unlaunched or deleted; on the arm leg only 105707 and 105708 died, both late, both with hunts stalled for want of companions rather than dead holders. Starvation is the one cost that moved the wrong way (8 vs 3 band deaths) and is not yet explained — see C2 above.

## Sense-testing (transcripts, not counts)

- Kill lines read like people: named killers, named beasts, rounds and damage taken, loot off the body, "Word travels fast. The village cheers." (e.g. arm 105704: "Wanjiru killed the Rerun with their party", "Chantal killed the Herald with their party").
- Deaths are mourned aloud: "The Gavel killed Diana in 7 rounds. The village mourns." (arm 105708 d31).
- **Silent handoff (blank, this arm):** no spoken line anywhere in the arm transcripts marks a plan passing to a successor. The fiction says a villager who dies on the trail is mourned and the village does not forget the beast — the mourning is there, the handoff is not. A player watching would not know the hunt changed hands. The mechanism is real (11 live reassignments) but invisible.
- **"0 rounds, 0 taken" kills (finding #2584, outside this arm):** 21 of 239 kill lines on control, 20 of 240 on arm — the same rate on both legs, so pre-existing, not arm-caused. Wave-4 beasts included (Rerun d128, Herald d135 on arm 105704). A beast dying in zero rounds with zero damage taken reads as if it just fell over; the cheer line still fires and loot is sometimes taken. Worth a look at what resolution credits those kills.
- Repetition is combat-bark repetition, not robotic villagers: "It's reeling — the party sees the opening and piles on!" 13× in one seed; the System's party-naming nudge ("We should name this. Us.") 9×. Pre-existing.
- Instrument limit: the stored transcript is a thin sample (arm 105704 keeps 64 of 17,851 said lines), so late-run sense-testing is limited by the driver's cap, not by the villages going quiet.

## Balanced panel (§15)

`node scripts/balance-panel.js compare` → **`review_required`** (exit 2), **no `regression_signal`**. The review flag is driven by one line: village deaths per run, regression_watch, 97.875 → 101.375 (+3.5, 95% exploratory interval −7.25 to 15.125, includes 0). Per 100 lived days the same metric IMPROVES, 72.81 → 70.08 (no material signal), and community loss improves 0.50 → 0.25. Wins, national access, table: 0 → 0 on both legs. Per the frozen prereg a `review_required` is an investigation note, not a verdict override — and the investigation is the exposure reading above: longer-lived villages accumulate more absolute deaths. The panel does not change the NO-GO (the primary already misses) and does not add a second one.

## Metric review (filled at evidence time; a miss is NO-GO, never re-scored)

- The primary metric behaved: pool floor met on both legs (17 / 19), zero legacy-unclassifiable rows, zero non-wave-4 exclusions, denominator real. The bar was honest and the arm missed it cleanly — no metric excuse is available and none is claimed.
- **C2 (and the panel's per-run deaths) should be judged per lived day next run.** Band totals penalize exactly what a good arm does — keeping villages alive longer. The next prereg should carry starvation deaths per 100 lived days alongside (or instead of) the band total, and the same for village deaths. Proposal for the next run only; it does not touch this verdict.
- **Instrument note:** the analyzer counts a launch on the village's final day the same as any other (arm 105708: both launches day 111 = loss day). If the next prereg wants a launch to mean "the hunt went out and the village lived to tell it," the definition needs a survival tail. Proposal only.
- **Builder nit (fix before reuse):** `scripts/build-partyfunnel-panels-a.js` defaults `--seeds` to 104901–104908 (copied from the fix-a builder's header comment, which also still names that band). I passed `--seeds 105701,...,105708` explicitly; `load()` throws loudly on a missing file, so no silent wrong panel is possible — but the default should be updated to this band or removed before the next arm clones the builder.
- **(b)-trigger fired as designed.** Pool-empty is the dominant arm stall (4/8 = 0.50). The next arm is findings #2561/#2562 per the prereg — widen the companion pool / score the holder's range at staging — not another funnel turn.

## Blanks filled or documented

- **Filled:** holder death no longer deletes seeded hunts — proven live (11 reassignments, 6 launching, no-successor 16 → 2) and by proof test §§1–2 with old-code controls. The retarget hold fires (4 holds, control 0) and is proven by §4 with its §5/§6 guards (targetless and gear-stage plans still retarget).
- **Documented, not filled:** (1) pool-empty is the binding stall — #2561/#2562, next arm; (2) reassignment is silent — no voiced handoff line (see Sense-testing); (3) C2 starvation cost unexplained — exposure vs hunt-diverts-foragers, needs holder-split instrumentation; (4) "0 rounds, 0 taken" kill narration — finding #2584, filed in the backlog; (5) band-total cost bars penalize longer-lived villages — finding #2585, filed in the backlog.

## Files

- Prereg: `evidence/2026-11-19/sim-partyfunnel-a-prereg.md` (committed `c2073d6ad`)
- Evidence: `evidence/2026-11-19/sim-partyfunnel-a.md` (this file)
- Analysis: `evidence/2026-11-19/partyfunnel-a-pilot-analysis.json`
- Panels: `evidence/2026-11-19/partyfunnel-a-panel-before.json.gz`, `partyfunnel-a-panel-after.json.gz`, compare `partyfunnel-a-panel.md` (+ `.json`)
- Corpora: `evidence/2026-11-19/perseed-partyfunnel-a-ctl/` (8 seeds), `perseed-partyfunnel-a-arm/` (8 seeds)
- Lever (HELD on this branch, not landed): `src/js/win-plan.js` (`PARTYFUNNEL`, commit `b4cda1de2`)
- Instruments: `scripts/partyfunnel-driver.js`, `scripts/analyze-partyfunnel-a.js`, `scripts/test-partyfunnel-a.js`, `scripts/build-partyfunnel-panels-a.js` (commit `efbf674d1`)
