# sim-vetsurvive — veteran-survival keeper (2026-10-18)

Run: flesh-out loop arm sim-vetsurvive (run_id fleshout-20261018T0830Z), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first; design call #4 — the four readiness bars; VETERANS = living roster with wave-3+ kills). POLICY-SIDE ONLY — zero src/js changes. Composes outside vetrel (read-only, never modified).

LINEAGE: defercensus3's named next (evidence/2026-10-18/sim-defercensus3.md, landed d81d381a). The census verdict: veterans binds 98.5-100% of deferral days on every substrate; the gate needs 2 LIVING veterans at the gate instant; the wave-3 overtime meatgrinder kills veterans about as fast as vetrel manufactures them (armorbreak census: 34 of 47 demand-meeting villagers died post-unlock, 72%, almost all in combat). Steve-call #427 (the 2-living-veteran demand shape) is open — demand loosening must pair with armor work. This arm is the other half: keep them alive. The demand is NOT loosened.

## The lever

`scripts/policies/vetsurvive.js` (VETSURVIVE=1, default OFF), composed as withVetsurvive(vetrelLead/vetrelBelong):

(a) VETERAN MUSTER — during the deferral window (`Game.standingDeferral(4).deferred`: Standing door open, readiness alone holding, peak < 4), living veteran villagers (wave-3+ kill in `state.waveKillLog` — vetrel's `isVeteran` marker, reused read-only) are mustered via the engine's shelter verb (`Game.shelterVillagers`, reason `'veteran-keep'`): inside the hall, behind the barricaded door. The wild router cannot jump them, the raid draft cannot spend them, duties skip them — the 72% field-exposure channel, mechanically closed. Player-legible muster beat ("muster your veterans home while the wave comes"). Honest cost: mustered villagers perform no duties and still eat. Given at the fire only (DRIFTER rule: no remote leadership).

(b) RELEASE — when the window closes (wave 4 released/grandfathered, or standing fallen 10+ below the door — hysteresis against threshold flap), the muster stands down via `Game.releaseShelter`, only for vids this layer mustered and only while their shelter reason is still ours. Never touches a game-side muster.

(c) HUNT-DRAFT GUARD — a mustered veteran still in the party must not be drafted onto the next vetrel hunt leg (party.js joins fighters by membership "even beyond the 4-square radius" — without the guard the muster leaks). `Game.partyMembers` is read-guarded during `base.daily` to exclude sheltered veterans. No state mutated, restored in finally. Non-veterans draft normally — the pipeline keeps making new veterans.

(d) SCHOLAR HOLD — the shelter verb never musters the scholar (engine rule). A veteran scholar in the window holds the hall: the upkeep's wild sweeps (feastFightRoad's far-tile forage patrols — the only travelTo in the upkeep chain) are stood down via a travelTo guard. Haven-bound, no wild expeditions. The feast draw is still faced (`faceFeastDraw` → `startCombat`, no travel), and vetrel escort hunts (daily, not upkeep) keep running under vetrel's own veteran-scholar discipline (no commit, 35% eject, yield).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

**Arms** (identical seeds, 180d death-aware, own in-sweep paired control):
- control: vetrel-lead, vetrel-belong (VETREL=1, VETSURVIVE unset)
- armed: vetsurvive-lead, vetsurvive-belong (VETREL=1, VETSURVIVE=1)

The vetrel pipeline runs identically on both arms — the only difference is the protection layer.

**Substrate:** pre-seat courtship — SEATDRIVE=0 explicit, FEASTSCALE_R13=1, TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1 (defercensus3 sibling convention).

**PRIMARY (binding):** wave-4 unlocks (maxWave ≥ 4), armed − control ≥ +3 across the 16 paired runs (8 seeds × {lead, belong}). GO → confirm on 12–16 fresh seeds. NO-GO → layer deleted zero-trace per kill protocol.

**Guardrails:** median survival ≥ control −10d (per policy pair); national ≥ control −2; starvation deaths ≤ control +1; no new death mode (n ≥ 3, kind-filtered person deaths only — the DEATH-TELE KIND POLLUTION finding).

**Seeds:** 8 fresh (51904, 51905, 51906, 51907, 51908, 52001, 52002, 52004 — verified unused in evidence/). Horizon: 180d death-aware (death-aware: dead villages stop simulating; the harness's runDays handles this).

**Why this horizon:** the deferral window opens at Standing ≥ 100 (typically day 50–80) and the gate resolves over the following ~100 days; 180d covers the full deferral arc on surviving villages.

## Proof

`scripts/test-vetsurvive-20261018.js` — (a) 24 mechanism fixtures on a real harness game (muster/release with legible beats, draft guard, travel guard, gate-off purity), (b) det-gate (VETSURVIVE unset → byte-identical to vetrel-lead on 2 fixed seeds), (c) smoke (45d gate-on run). Result: **29/29 GREEN**.

## Pilot results

**PRIMARY: NO-GO — wave-4 unlocks armed=1, control=0, diff=+1 (bar ≥ +3). Kill protocol applies.**

32 runs (8 seeds × {lead, belong} × {armed, control}), 180d death-aware. 15 complete pairs (1 pair incomplete — s52004 belong-control missing after a service restart killed the batch; the 31 per-seed JSONs are valid).

| metric | armed | control | guardrail | verdict |
|---|---|---|---|---|
| w4 unlocks | 1/15 | 0/15 | primary ≥ +3 | **NO-GO (+1)** |
| national | 12 | 11 | ≥ control−2 | PASS |
| starvation deaths | 3 | 3 | ≤ control+1 | PASS |
| median survival | 118d | 118d | ≥ control−10d | PASS |
| new death mode (n≥3) | none | — | none | PASS |
| veteran deaths | 9 | 6 | report-only | — |

The single armed unlock (lead-armed s52001, d117) traces through the mechanism: 2 musters, 2 veterans mustered, 1 release, 65 scholar-hold days, 829 draft-guard hits — the muster kept 2 veterans alive through the window and the gate released. But it fired on only 4/15 armed runs, and the hold on 5/15. The pipeline (vetrel hunts) is not producing enough villager veterans for preservation to matter at scale: on s51908 (lead-armed), the scholar held for 38 days as the sole veteran while 16 hunts / 8 fights produced zero companion veterans.

## Village assessment (plain words)

The modal village: opens the Standing door around day 50–80, grinds wave-3 overtime, and never unlocks wave 4 because the second veteran never arrives. The muster is a faithful keeper — when a villager veteran exists during the window, they are sheltered (belong s51906, s52001; lead s52001) and the draft guard keeps them off hunts (829–17k guard hits). But "keep them alive" presumes they exist: on most seeds the window opens onto zero villager veterans, and the 38-day scholar hold on s51908 is a veteran guarding an empty bar. The meatgrinder kills faster than vetrel manufactures, and the muster starts too late (standing ≥ 100) to catch pre-window deaths. The demand (2 living veterans) is not the problem this arm can solve — the manufacturing rate is.

## Sense-testing (SENSE-TESTING LAW)

INCOMPLETE — the pilot consumed the run budget; the transcript side-runs (scripts/vetsurvive-transcripts-20261018.js, ready) were not executed. The muster/stand-down/hold SAY beats are proven to fire (proof test) but were not read in context. A sense-test pass is recommended before any revival.

## Metric review (§14 — binding, never re-scored)

1. **Primary miss is NO-GO, not re-scored.** +1 < +3. The mechanism is proven (1 unlock traces through it) but the effect size is insufficient. Not re-scored against veteran-survival or muster-count metrics.
2. **Veteran deaths armed=9 vs control=6** is report-only (not a guardrail). Directionally the muster should REDUCE veteran deaths; the +3 delta suggests either pre-window deaths (outside the muster) or the small-n noise band. Not investigated — the primary miss kills the arm regardless.
3. **The window may be mis-scoped.** The muster starts at standing ≥ 100, but the census shows veterans dying through the whole wave-3 overtime (day 25+). A pre-window protection arm is a different lever (not this one).
4. **Seed 52001 lead-armed is the existence proof** that the mechanism CAN work (2 musters → unlock). A revival would need the pipeline to produce veterans more reliably, not better preservation.

## Convergence

**killed-at-pilot.** The vetsurvive layer is NO-GO per the pre-registered primary. Kill protocol: layer deleted zero-trace (scripts/policies/vetsurvive.js), proof INFO-SKIP, instruments + evidence kept. The axis stays scale-onramp; the veteran bar remains the binding constraint, but preservation-during-deferral is not the lever — the bottleneck is veteran manufacturing rate (vetrel pipeline) and pre-window mortality.

## Files

- scripts/policies/vetsurvive.js — the layer (this run)
- scripts/test-vetsurvive-20261018.js — proof (this run)
- scripts/sweep-vetsurvive-20261018.js — pilot sweep (this run)
- evidence/2026-10-18/perseed-vetsurvive/ — per-seed JSONs (this run)
- evidence/2026-10-18/sim-vetsurvive.md — this file
- ZERO src/js changes (policy-side only)
