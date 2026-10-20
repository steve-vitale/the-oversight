# sim-emptydraft — the #692 empty-draft DIAGNOSTIC (flesh-out loop, 2026-10-20, ARM sim-emptydraft)

Run: fleshout-20261020T1615Z, arm sim-emptydraft. Axis: scale-onramp (the blocking axis).
DIAGNOSTIC, not a lever — zero src/js expected, zero scripts/policies files changed.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md ("Monster encounters are fought, not rolled", Steve 2026-10-08). The raid system: src/js/havenGrowth.js (havenRaidTick — reactive raids: 3+ world monsters, 3k+ pantry kcal, 7-day cooldown, 18% roll; wealth draws teeth: 3 raiders, +1 above 12k, +1 above 24k pantry kcal, cap 5; defenders = healthy at-home villagers — `v.roster` minus `villagerId` minus `v.away[id]` minus `isSheltered(id)` minus `health[id] <= 40` — one per raider, sequential real fights; unmet raiders LINGER and gorge nightly).

Lineage: sim-raidgarrison (2026-10-20, KILLED at pilot) found raids routinely meeting ZERO defenders — armed d59 s64008: 5 unmet on roster 9, "all villagers away/sheltered/wounded at raid-night" — and concluded the garrison's homekeep half never engaged because "the draft empties through autonomous NPC expedition rhythms the policy cannot touch." This diagnostic measures the drain: who is missing WHERE at raid-night, across seeds. If expeditions are the drain, the verdict is "the lever is an engine-side departure discipline, not another policy posture" (the raidgarrison conclusion).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** per-raid-night defender composition (counts: away-on-expedition / sheltered / wounded-incapacitated / present-but-unengaged(benched) / engaged — all over the roster at raid-night, player counted separately) and the share of raid-nights with ZERO defenders met (engaged===0). **Attribution target: every unmet night attributed to a composition category — 100% attribution, 0 unexplained** (unexplained = a night whose composition record does not fully cover the roster — an instrument error, counted LOUD).

**Attribution rule** (per raid-night, over non-player roster slots): a category holding 100% of slots → `all-<cat>`; >50% → `majority-<cat>`; otherwise `mixed-<top1>-<top2>`.

**GO (diagnostic, not a lever):** the instrument must (1) pass the DET gate (instrument-on == instrument-off byte-identical trajectories), (2) attribute every unmet raid-night with 0 unexplained. If GO holds, the taxonomy table IS the deliverable; if it fails, the instrument is broken, not the village.

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max — the harness's own stop). Why 180: the raid pressure under study is the late-game def5-window phenomenon; the pilot corpus (raidgarrison) used 180d and this census reuses its seed regime for comparability.

**Seeds:** 8 seeds (64001–64008, the raidgarrison pilot corpus) x {leadfeast, belongfeast} x {census arm} = 16 runs. No arm dimension — this is a census of the base draft, not a comparison (the raidgarrison policy file was deleted zero-trace per its kill protocol; there is no armed arm to compare against).

**Policies:** competent-player policy; substrate pre-seat + windefer (the sim-w5door-measure substrate): withSeatDrive(withWinDefer(withReposition(TF base))) on {leadfeast, belongfeast} tribfloor bases. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1.

**Instrument:** scripts/measure-emptydraft-20261020.js (read-only census wrap on Game.havenRaidTick: pre-tick composition snapshot per the engine's own defender filter; engagement vids via resolveWildMonsterEncounter records stamped per raid-tick; unmet-raider count from the engine's own "Nobody met ..." say lines), scripts/analyze-emptydraft-20261020.js (taxonomy aggregator), scripts/test-emptydraft-20261020.js (proof: fixture RED→GREEN — F1 all-away, F2 mixed, F3 health edge parity, F4 benched/surplus, F5 player exclusion; filter parity asserted: instrument 'available' ids == engine draft ids on the same fixture).

## Metric review

(pre-registered doubts — for the NEXT run if the metric proves wrong; the GO bar above binds THIS run, §14)
1. **Unmet vs zero-defender:** a night can have defenders engaged AND raiders unmet (raiders > defenders). The primary's "zero defenders met" is the narrow empty-draft phenomenon from the raidgarrison finding; the analyzer reports the unmet-rate separately so partial drafts are visible.
2. **Away composition:** `v.away[id]` marks away-from-haven; the instrument does not distinguish expedition-away from trade-away or covenant-away. The taxonomy can be refined post-hoc if the drain is away-heavy.
3. **The "sheltered" drain vs the muster discipline:** shelter.js's shelter is a defensive posture ("outlast it") — if sheltered dominates the drain, the lever is engine-side departure/shelter discipline, not policy posture.
4. **Night-1 skew:** raids fire at endDay; the census snapshots composition at that tick, before the fights resolve — no post-fight health contamination by construction.

## Results

16/16 census runs complete (seeds 64001–64008 x {leadfeast, belongfeast}, 180d death-aware, per-seed JSONs in `evidence/2026-10-20/perseed-emptydraft/census/`). Instrument errors: 0 across all runs. DET gate: ALL PASS (instrument-on == bare byte-identical, 4/4). Proof: RED→GREEN demonstrated, ALL PASS (16/16).

| measure | value |
|---|---|
| raid-nights recorded | 201 |
| zero-defender nights (engaged===0) | 43 (21.4%) |
| raiders / engaged / unmet | 828 / 572 / 256 (unmet share of raiders: 30.9%) |
| unattributed / unexplained nights | 0 / 0 (GO gate: 0 — MET) |
| mean roster composition at raid-night | away 2.49, sheltered 0.86, wounded 0.10, benched 0.96, engaged 2.85, player 1.00 |

**Attribution taxonomy (43 zero-defender nights):**

| attribution | nights | share |
|---|---|---|
| majority-away | 17 | 39.5% |
| majority-sheltered | 17 | 39.5% |
| all-away | 3 | 7.0% |
| all-sheltered | 3 | 7.0% |
| mixed-away-sheltered | 3 | 7.0% |

Attribution target MET: 100% of unmet nights attributed, 0 unexplained.

**Mechanism pins** (scripts/verify-shelter-muster-20261020.js, 3 runs on 64005/64008, read AFTER the census wrap so state is the current night's):
- Every sheltered slot at raid-night carried reason='muster' with the engine's `shelterMustered` episode live and a wave-4+ threat at the treeline (The Influencer / The Eulogy / The Algorithm / The Loud Beast). 100% of the sheltered drain = the engine's DAILY MUSTER (shelterMusterCheck, src/js/shelter.js, 2026-10-17: wave-4+ world monster within Chebyshev radius 2 of Haven → shelterEveryoneBut → the muster check runs in progDaily BEFORE havenRaidTick, by design). The muster discipline ("outlast it, not feed it") then excludes the sheltered from the raid draft — also by design. Two working-as-designed systems compose into the empty draft: the village shelters from the apex threat and loses the pantry to the raiders, who linger, gorge (~1k kcal/night each), and send one to the scholar's bedroll.
- Away-drain purposes at raid-night (the zero-defender nights' away slots): water runs (dominant), visit, forage, expedition, explore, traps, haul, leave — autonomous NPC duty rhythms, no single purpose dominating. Nightly water churn especially: villagers are constantly heading out for water at raid time ("Tetsuya heads out for water. 'The well won't fill itself.'").
- Wounded: negligible (0.10/night mean) — not a driver.
- The palisade does NOT prevent the empty draft (e.g. belongfeast s64008 d96: palisade=true, 6 sheltered by muster, 5 raiders unmet).
- Notable interaction: muster episodes can persist for weeks (The Influencer, d115–d179 on belongfeast s64008) — during which raids keep firing at a drafted-down village; the partial draft (engaged 1–3) absorbs the rest.

## Sense-testing

Two zero-defender windows read against the raidgarrison s64008 transcripts (SENSE-TESTING LAW — does the fiction match the attribution?):
1. **armed d105 (5 unmet):** villagers on water runs — "Nino heads out for water. 'The well won't fill itself.'" / "💧 Dale returns with water: +3 clean" / "💧 Nino returns with water: +4 clean." The raid hits mid-churn; nobody home-and-able. Fiction matches an away-drain attribution: the village is living its nightly rhythm, not frozen or bugged.
2. **control d101 (4 unmet, palisade live):** Tetsuya and Grace cycling water runs ("Tetsuya heads out for water" / "Grace heads out for water"), "Village meal: +500 kcal" — a thin evening; the raid meets no one. No muster beat fired that night, so no shelter contribution expected — consistent with the census taxonomy's away half.

Judgment: the attributions read true. The empty draft is a composition problem in the fiction, not a narration bug — the village acts like people (water runs, hurts, shelter), and the raid draft finds nobody. Robotic/repeated: none new beyond the raidgarrison-filed garrison-beat dedup flag.

## Verdict

**DIAGNOSTIC COMPLETE — GO met (100% attribution, 0 unexplained). The raidgarrison conclusion is CONFIRMED and sharpened with numbers:**

The empty draft is an engine-side composition problem with two drains, not a policy-posture problem:
1. **The shelter auto-muster (46.5% of zero-defender nights):** the engine's own DAILY MUSTER shelters the whole village when a wave-4+ threat lingers near Haven — and the raid draft, reading the same flag, finds nobody. Working as designed on both sides; the composition is the bug.
2. **Autonomous away rhythms (46.5%):** NPC expedition/duty departures (water runs dominant, then visit/forage/expedition/traps) the policy cannot touch — the raidgarrison diagnosis verbatim.

The named lever is an **engine-side departure/muster discipline** (e.g. a draft-aware muster: hold back N fighters when a raid is ripe; or a raid-ripe departure gate on NPC rhythms), not another policy posture. That is a Steve-call: the muster discipline ("outlast it, not feed it") is his design, and any draft-aware muster changes what sheltering MEANS. Filed in sim-findings.md as a steve-call.

## Convergence state

diagnostic-complete. The scale-onramp axis is NOT converged by this run (no lever was tested), but the empty-draft blank is now attributed: 201 raid-nights, full taxonomy, both mechanisms pinned. Named next: the engine-side departure/muster discipline — needs Steve's design ruling before any arm is built against it.
