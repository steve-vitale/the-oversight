# longsim scale-wall run r8 — FAIR-SHARE RATE ACCOUNTING (2026-10-13, flesh-out, lever 5)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12)
- **Axis:** scale-onramp (blocking; standing directive overrides rotation; `longsims-rotation.txt` stays 3).
- **Lever lens:** 5 (trust & social) on the scale wall — the moot-exile foreclosure face (r6: 9/16 exiled; r7: 3/4 exiled, routes named).
- **Question:** r6/r7 proved the exile is manufactured by the takes/gives ledger: `theftConfrontation`'s 4000 bar is checked against CUMULATIVE LIFETIME takes (not the one take the comment claims), so ~2 days of the village's own communal feeding trips "blatant theft" → 'hoard' observations → grievances → fabricated-theft moot → exile. Generosity buys zero protection (r7 kindseek 3/4, byte-identical). Does fair-share RATE accounting un-foreclose the courtship window?
- **Primary metric:** exile rate in the courtship window (d20–90) on scale-push runs.
- **GO threshold:** pilot 4 seeds (11/22/33/44, belongseek + leadcourt, 150d death-aware) — exiled ≤ 1/4 (≤2/8) AND all RED honesty tests green. Baseline: r6 6/8 exiled on belongseek+leadcourt (9/16 across all policies); r7 kindseek 3/4.
- **Horizon:** 150d death-aware (dead villages stop + 10d tail max). Why: courtship window d20–90; baseline exile days 18–63.
- **Seeds:** 11/22/33/44 — identical before/after. NOTE: the r6 baseline ran on tip 6cca9dc7; this branch's base (ee966411) changed the background-survivor draw from deterministic file-order to random, so r6's numbers are NOT a clean before-side. This run measures its own before-side (fix reverted) on identical seeds.
- **Convergence state:** tbd (pilot).

## Canon check
READ docs/CANON.md first. No canon doc covers trust/social/the moot (stated per the brief, not invented — same finding as r7). Steve's hard rules that bind: THEFT IS ALLOWED, socially punished (theftConfrontation's own header); the moot is the one formal track (betrayal.js/justice.js); Trust ≠ reputation (gossip moves REP only, never trust); "If you don't know, it doesn't show"; no silent actions. The fair-share norm (~2000 kcal/day) and the blatant-theft bar (2x+ in one take, or half the pantry — Steve 2026-10-06) are the documented intent this fix implements.

## The design (coordinator's call, Steve 2026-10-07: make the call, document it)
Fair-share RATE accounting in `theftConfrontation` (game.js):
1. **Single-take check** (documented intent): one take ≥ min(4000, pantryKcal/2) fires. `takeFromPantry` now passes `item.kcalEach` (the take), not the cumulative `v.takes[vid]`. The bulk path already passed the pack total.
2. **NEW rate check:** trailing-7-day voluntary take rate ≥ **3000 kcal/day (1.5× the norm)** fires — catches small-take hoarders without punishing communal eating. DEVIATION DOCUMENTED: the design call said 2× (4000/day), but the mandated RED test (b) requires 3000/day to trip while 2000/day must not — 1.5× threads that needle (2200/day is the max trust-scaled communal share; 3000 clears it with margin). Steve can overrule.
3. **Succession "mystery takes" (r7 blank):** FILLED — `playerDeath` (ledger.js) resets `v.takes[newId]`, `v.gives[newId]`, `v.takeHist[newId]` for the successor. The new face starts their own book ("You're not her. You'll have to earn this face."). The freeload clock `v.freeload[newId]` is intentionally untouched — a known drain becoming bearer is a design question for a future run, documented as an open blank.

Mechanism details:
- New `v.takeHist[vid]` = dated `[{day, kcal}]` per VOLUNTARY pantry take (takeFromPantry/takeFromPantryBulk). The village's served meal (villageMeal) is NOT recorded — the village feeding you is never evidence against you (fills r7 blank 2's core complaint at the confrontation layer).
- Confrontation lines are bar-aware: one big grab reads as a grab; a week of heavy takes reads as a pattern someone finally names aloud (sense-tested below).
- The moot keeps its teeth: genuine one-take theft (≥4000) and sustained 3000/day hoarding both still confront (RED-verified); the fabricated-accusation branch (motive ≥60 + trust <25) is untouched — it just stops receiving manufactured motive from ordinary eating.

## RED tests (scripts/test-fairshare-rate-r8.js) — 17/17 GREEN on fixed code
- (a) 4500-kcal single take FIRES (grab-flavored line). Genuine theft still confronts.
- (a2) 1500-kcal take, clean history: silent.
- (b) 3000/day in 500-kcal takes × 7d: FIRES via rate check (pattern-flavored line: "Every day... Your pack's full every time you leave the hall.").
- (c) 1500/day × 7d AND 2000/day × 7d: silent. Normal communal eating trips neither.
- (d) REGRESSION: 100,000 cumulative lifetime takes + 500-kcal current take: silent. The old bug is dead.
- (e) takeFromPantry passes the single-take kcal (500 on a 50k cumulative ledger: silent; 4500 single take: fires) and records takeHist.
- (f) Succession: crowned NPC with 12,345 "mystery takes" → playerDeath → takes/gives/takeHist all 0.
- The tests FAIL on pristine code (`Game.recordTakeHist is not a function`) — they are real RED tests, not tautologies.
- Pre-existing suite scripts/test-social-depth.js: 27 passed, 3 failed — byte-identical failures on the pristine tree (conversation/doubt areas, untouched by this change).

## Results — BEFORE side (fix reverted, this branch's base)
8 runs, seeds 11/22/33/44 × belongseek/leadcourt, 150d death-aware. Raw: `/tmp/r8-before.json` (copy in evidence).

| run | end | exiled | route |
|---|---|---|---|
| belongseek 11 | lost d103 | @64 | freeloadVote (gossip d54 → vote d63, 3-2) |
| belongseek 22 | lost d68 | — | (ambush charge d14, acquitted) |
| belongseek 33 | lost d87 | @59 | freeloadVote (gossip d49 → vote d58, 4-1) |
| belongseek 44 | lost d66 | @47 | freeloadVote (fl 12d/stage 3, vote d46, 5-1) |
| leadcourt 11 | lost d51 | — | (freeload stage 1, no vote) |
| leadcourt 22 | lost d88 | — | (freeload stage 2, no vote) |
| leadcourt 33 | surv d150 | @45 | freeloadVote (gossip d35 → vote d44, 5-1) |
| leadcourt 44 | lost d64 | @46 | freeloadVote (gossip d36 → vote d45, 3-2) |

**Wall numbers (before): national 0/8, table 0/8, won 0/8, median 87d, maxWave 3, exiled 5/8 (62.5%), exile days 45–64.**

**CRITICAL FINDING: Route A never fired.** Zero theft-confrontation lines and zero 'hoard' observations across all 8 runs. Every exile went via **Route B (freeloadVote)** — the freeload pipeline's 12-day clock → warning → vote. The r6/r7 Route A mechanism (theftConfrontation → fabricated moot) is DORMANT on this base (the ee966411 random-roster draw changed the social graph; witnesses apparently aren't present at pantry takes, or the 35% slide + once/day gate suppresses it).

This means the theftConfrontation rate accounting — the centerpiece of the design — addresses a route that is not binding on the current base. The fix's only potentially-active ingredient here is the succession ledger reset (which feeds Route B via netDrain).

## Results — AFTER side (full fix applied)
8 runs, identical seeds. Raw: `/tmp/r8-after.json`.

| run | end | exiled | route |
|---|---|---|---|
| belongseek 11 | lost d88 | @60 | freeloadVote (fl 12d/stage 3, vote d59, 4-1) |
| belongseek 22 | lost d81 | — | (ambush charge d14, acquitted) |
| belongseek 33 | lost d96 | @51 | freeloadVote (gossip d41 → vote d50, 5-2) |
| belongseek 44 | lost d97 | — | |
| leadcourt 11 | lost d65 | — | |
| leadcourt 22 | lost d48 | — | |
| leadcourt 33 | lost d75 | — | |
| leadcourt 44 | lost d45 | — | |

**Wall numbers (after): national 0/8, table 0/8, won 0/8, median 81d, maxWave 3, exiled 2/8 (25%), exile days 51/60.**

Route A still never fired (0 confrontation lines). Both exiles were Route B.

**Attribution problem:** 5/8 → 2/8, but the designed mechanism (Route A) was dormant in both. The drop must come from the succession reset — or from noise. Running an isolation experiment (succession-reset ONLY, same 8 seeds) to attribute honestly before claiming GO.

## Results — ISOLATION (succession reset only, no theftConfrontation change)
8 runs, identical seeds. Raw: `/tmp/r8-ison.json`.

**Wall numbers (isolation): national 0/8, table 0/8, won 0/8, median 75d, maxWave 3, exiled 0/8 (0%).**

Every run: freeload stage 0/days 0. Zero exiles. The succession "mystery takes" reset ALONE eliminated the entire foreclosure on these seeds.

**Attribution, honestly:** The 5/8 → 0/8 drop is caused by the succession reset, not the rate accounting. Mechanism: exiled scholars were successors carrying NPC-era "mystery takes" (10k+ kcal from villagerMealDay) → netDrain = takes − gave started deeply negative → freeload clock ran from day one of their tenure → 12 days → vote → exile. The reset (takes/gives/takeHist → 0 for the new bearer) removes this. The theftConfrontation rate accounting is RED-verified and honest, but was dormant on these seeds — it is insurance for r6/r7-type seeds where Route A binds, not the active ingredient here.

## GO/NO-GO verdict: GO (with honest attribution)
- Exiled: 2/8 = 1/4 ≤ 1/4 threshold ✓ (isolation: 0/8)
- RED honesty tests: 17/17 green ✓
- Per pre-registration: running the 12-seed confirm on the FULL fix.

## Results — CONFIRM (12 seeds × belongseek/leadcourt, full fix)
24 runs, seeds 11/22/33/44/55/66/77/88/99/111/222/333. Raw: `/tmp/r8-confirm.json` (copy in evidence).

**Wall numbers (confirm): national 2/24, table 0/24, won 0/24, median 48d, maxWave 4, exiled 3/24 (12.5%), exile days 51/60/84.**

Exile rate: 62.5% (before) → 25% (pilot) → **12.5% (confirm)**. Route A never fired (0 confrontation lines across 24 runs). All 3 exiles were Route B (freeloadVote) on genuine drain — the mystery-takes driver is gone.

**The nationals:**
- **leadcourt s99:** 3 links seasoned, national HELD 25 days, reached GLOBAL rank, maxWave 3. Exiled @84 — AFTER the achievement (the exile didn't foreclose; it was post-achievement). Died village-lost d102.
- **leadcourt s333:** 3 links seasoned, national HELD 13 days, NOT exiled, maxWave 4 (first wave-4 reach on a scale-push policy). Died d89.
- These are the first scale-push nationals since the LEAD fix — and they came from un-foreclosing the courtship window, not from pushing harder.

## Village assessment (confirm runs; sense-tested)
- **leadcourt s99 (d102):** the global-reacher. Courted and seasoned three subordinates, held national 25 days, climbed to global rank. The moot exiled its speaker at d84 — but the realm was already built and held; the exile was a post-achievement reckoning, not a foreclosure. Died village-lost with the realm intact. The fiction held: a village that reached too far, too fast, and its speaker paid after the triumph, not before it.
- **leadcourt s333 (d89):** the clean national. Three links seasoned, 13 days of national standing, first wave-4 unlock on a scale-push run, never exiled. Died village-lost (combat/sickness, the baseline bind) — but the scale arc completed.
- **The 3 exiled (s11, s33, s99):** all Route B, all on genuine sustained drain (takes outpacing gives over weeks, not mystery takes). The freeload pipeline still works — it just stopped executing successors for meals they ate as NPCs.
- **Who thrived:** scale-push villages that survived the courtship window now season links and climb. **Who died and why:** villages still die village-lost (combat, sickness) at ~48d median — the combat/sickness baseline, not the moot. **Missing capabilities:** the wall is now survival-to-national (combat/food baseline), not foreclosure.

## SENSE-TESTING (transcripts read)
- Route B (freeloadVote) reads as village decisions: d37 "Around the fire, low voices: Divya isn't pulling weight. Nobody says it to their face. Yet." → d46 "The village gathers. No fire-show, no System — just people, tired. 'We've carried you long enough'... Hands: 5 for exile, 1 against." Gossip, then tired people voting. Not a meter firing.
- The new rate-confrontation lines (RED-verified in test (b)): "Every day... Your pack's full every time you leave the hall. Every day. We count too, you know." — a pattern named aloud, not a tripwire. (Never fired in sims — Route A dormant — but the unit test proves the fiction.)
- No 'hoard' observations, no fabricated-theft moots in 32 post-fix runs (8 pilot + 24 confirm). The manufactured-motive pipeline is starved.

## Blanks filled
1. **Fair-share RATE accounting** — implemented and RED-verified (17/17): single-take bar (documented intent) + trailing-7d rate bar (3000/day, 1.5× norm; deviation from the 2× design call documented). takeHist ledger; villageMeal excluded (the village feeding you is never evidence).
2. **Succession "mystery takes"** — FILLED and proven as the active ingredient: 5/8 → 0/8 on the isolation run. `playerDeath` resets takes/gives/takeHist for the successor.
3. **Route attribution** — the foreclosure on the current base is Route B (freeloadVote), not Route A. Route A (r6/r7's mechanism) is dormant here; the rate accounting is insurance for seeds where it binds.

## Blanks documented (open)
- **v.freeload[newId] inheritance:** the freeload clock (days/stage) is intentionally NOT reset on succession — a known NPC drain becoming bearer keeps their clock. Design question for a future run.
- **villageMeal in v.takes:** the served meal still records to the cumulative takes ledger (feeds freeloaderTick's netDrain). The confrontation layer now ignores it (takeHist), but Route B still reads gross. A future lever-5 run could move freeloaderTick to a rate basis.
- **The 1.5× vs 2× rate bar:** Steve can overrule the 3000/day bar (design call said 4000/day).
- **tableWaiting flag:** 2 before-side runs showed table=1/tableWaiting — the table beat staged but unanswered at regional. Uninvestigated.

## Reachability (wall numbers, confirm)
national 2/24 · table 0/24 · wins 0/24 · wave 4–5 unlocks: wave 4 reached (s333), wave 5 not · regional reached broadly · median survival 48d · vests 0/24 · exiled 3/24 (12.5%).

## Convergence state: **converging** (scale-onramp)
The moot-exile foreclosure is lifted as the binding constraint: exile rate 62.5% → 12.5%, first scale-push nationals (2/24, one to global). The axis moves from `blocked` (foreclosure) toward `converging` — but national is still rare (2/24) and the binding constraint is now survival-to-national (combat/sickness baseline, 48d median). Not `converged` (target: national reached organically, reliably, across roads).

## Village assessment
(pending)

## Blanks filled / documented
(pending)

## Reachability (wall numbers)
(pending)

## Convergence state
(pending)
