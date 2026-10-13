# longsim scale-wall run r6 — THE SCALE-PUSH STARVATION REPRO (2026-10-13, flesh-out)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12)
- **Axis:** scale-onramp (blocking; standing directive overrides rotation; `longsims-rotation.txt` stays 3)
- **Lever lens:** 0 (food economy) + 8 (travel & regional) on the scale wall. Context: r1–r5 all KILLED AT PILOT (fight-selection ×3, monster-math ×1, food-processing ×1); national 0/8 every run. The open blank from r5: the 2026-10-12 sims showed villages reaching national ~day 39 then starving mid-ambition (dead by day 63), but that was NEVER reproduced in the r1–r5 suite — the competent/winseek policies may not push scale hard enough to stress the on-ramp.
- **Question (Phase 2):** does the current tip reproduce the day-39–63 starvation-at-scale with scale-pushing policies, or has the wall moved since 2026-10-12?
- **Primary metric:** national reach per seed (0/1)
- **GO threshold (Phase 3 lever):** national ≥2/8 AND median survival ≥82.8d on the 8-run suite (the r1–r5 bar)
- **Horizon:** 150d death-aware (dead villages stop; +10d tail max). Never a fixed 200d. Why 150d: the ladder is one rung/season (NATIONAL 61–90) and foreign realms need engagement-driven consolidation; the Belong standing bar is a 14-day hold.
- **Seeds:** 11/22/33/44 × competent/winseek (baseline) and × belongseek/leadcourt (repro) = 16 runs, identical seeds
- **Gate config:** all gates OFF (FOODLEVER_R5 unset, BELONG_V3 unset = v2 baseline, MONSTER_MATH_R4 unwired). Pristine tip.
- **Phase 3 precondition:** a food-at-scale lever ships ONLY if Phase 2 shows a food bind AT SCALE.

## Canon check
READ docs/CANON.md FIRST, then SCALE.md, PRESERVATION.md, BALANCING.md, MONSTER-WAVES.md. Findings that constrain this run:
- The scale ladder (SCALE.md): national = one rung/season (VILLAGE 1–30, REGIONAL 31–60, NATIONAL 61–90); national needs regional ≥30 days old; links season at 30+ days & trust 40+; six roads in; every beat offers REFUSE.
- **No beat stages for an exiled answerer** (travel lever r3 2026-10-11, `_checkNational`): "a staged national/global beat whose answerer is exiled can never be answered... so it dies aloud at the next day boundary... The rung can re-stage once someone can answer it."
- `proposeLink`'s exile guard (`_blockIfNotHaven`): an exiled persona cannot propose at all.
- Theft is allowed, socially punished (Steve's hard rule). The moot is the one formal track (betrayal.js/justice.js).
- The Highbeam Deer is the benchmark; wave-1 deadliness is canon; monster tiers ≠ loot tiers; fights are real.

## Phase 1 — BASELINE (gates off, current tip)
8 runs, seeds 11/22/33/44 × competent/winseek, 150d death-aware.

national **0/8**, table 0/8, won 0/8, median **69d**, maxWave 3, vests 0/8.
Per-seed days **byte-identical to r1–r5** (competent 69/150/14/90, winseek 32/124/15/34). The tip is stable; the wall holds. Raw: `evidence/2026-10-13/r6-baseline.json`.

## Phase 2 — THE REPRO (diagnostic)
New instrument: `scripts/scale-repro-20261013.js` — the food-coupling instrument (`attachInstruments`, `dailyRow`, `finalize`) PLUS scale-road telemetry, all defensive try/catch, no RNG touched, no game state mutated:
- wraps: `proposeLink` (day/vid/asSub/result), `answerCounter`, `payTribute` (records the engine's RETURN = actual kcal removed; the policy calls it bare), `tendLink`, `drawLeaguePool`, `answerNationalChoice`, `breakLink`
- daily scale rows: rank, link states (real hierarchy.js fields: `primary/subordinate/trust/day/arrears/tributeKcalPerWeek`; kind derived: lead/belong/covenant/trade), foreign realm max + head, pendingNational shape, **exiled + justice stage**
- finalize: links proposed/accepted/seasoned, tribute weeks paid/thin/missed (parsed from link `history` — the arrival bypasses `stockPantry`, same class as r5's donateToPantry catch), good-standing days (BELONG bar: trust≥50, arrears 0, age≥14, under a foreign 4+ realm's head), national staging/held days, push-window food (days 20–90: pantry-days med/min, ate med, starveDays), longest pantry crash, exile day

Policies: `belongseek` (competent + BELONG-road courtship, v2 default) and `leadcourt` (competent + LEAD-road courtship), seeds 11/22/33/44, 150d death-aware. Raw: `evidence/2026-10-13/r6-repro-final.json`.

### Results — the wall moved. The day-39–63 starvation-at-scale does NOT reproduce.

| run | end | rank | links prop/acc/seas | tribOut | tribFlow paid/thin/missed | tends | goodDays | f4days | exiled | push pantry-days med/min | push ate | push starve |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| belongseek 11 | lost d132 | regional | 6/1/1 | 44k | 0/0/0 | 0 | 0 | 62 | **@37** | 12/2 | 80.4% | 0 |
| belongseek 22 | surv d150 | village | 9/0/0 | 0k | 0/0/0 | 0 | 0 | 0 | **@18** | 8/2 | 79.1% | 0 |
| belongseek 33 | lost d14 | village | 0/0/0 | 0k | 0/0/0 | 0 | 0 | 0 | — | — | — | — |
| belongseek 44 | lost d83 | regional | 1/1/1 | 28k | 0/0/0 | 0 | 0 | 35 | **@32** | 17/0 | 83.6% | 0 |
| leadcourt 11 | lost d90 | regional | 3/3/3 | 0k | **24/0/0** | 49 | 0 | 42 | **@63** | 15/0 | 80.8% | 0 |
| leadcourt 22 | surv d150 | village | 25/0/0 | 0k | 0/0/0 | 0 | 0 | 0 | **@18** | 8/2 | 79.1% | 0 |
| leadcourt 33 | lost d14 | village | 0/0/0 | 0k | 0/0/0 | 0 | 0 | 0 | — | — | — | — |
| leadcourt 44 | lost d73 | regional | 3/3/2 | 0k | 19/0/2 | 14 | 0 | 25 | **@54** | 11/0 | 86.0% | 3 |

**Wall numbers (repro): national 0/8, table 0/8, won 0/8, median 90d, wave 4–5 unlocks 0, vests 0/8.**

The five findings, in order of importance:

**1. THE MOOT EXILES THE SCHOLAR IN THE COURTSHIP WINDOW — 6/8 scale-push runs (9/16 across all policies).**
Exile days: 18, 18, 32, 37, 54, 63 — squarely in the proposal/seasoning/national window (proposals from d20, Regional Dawn d41–46, national window d61–90). The exile is structural, not cosmetic:
- `_checkNational` refuses to stage any beat for an exiled answerer (canon, travel lever r3).
- `proposeLink`'s exile guard returns null — the exiled persona cannot court at all.
- The mechanism is verified end to end on leadcourt s11: 3/3 links seasoned, polity `lead sz4` live from d70, season gate clears d76 (networkLive d46 + 30) — **but the scholar was moot-exiled at d63, so the First Court never staged**; the village died d90 at regional with the realm intact. Forensic trace: `polity:"lead sz4"` every check d70–82, `exiled:true`, `pendNat:null`.
- On belongseek s11 the exile triggers the v2 consolidator bug the v3 gate was written for: exiled @37, the trust-85 subordinate bond is broken ~d62 by `rideConsolidator` chasing village_3's 4-realm, and the re-court fails silently (exile-blocked propose) — 0 good-standing days from a bond that was one season from the bar.

**2. NO FOOD BIND AT SCALE.** During the push window (days 20–90): pantry-days medians 8–17 (thin but recovering), ate share 79–87%, starveDays 0–3. Villages die village-lost (combat/sickness), not starvation. The 2026-10-12 day-39–63 collapse is not on the current tip — the base food economy (r5's instrument: fish+garden+forage, 85% food security) carries the push.

**3. THE TRUST FIXES HOLD; SUBORDINATE ECONOMIES ARE HEALTHY.** 47 proposals → 8 accepted → 7 seasoned. Tribute flow 43 paid / 0 thin / 2 missed (leadcourt s11: 24/0/0 — every week in full). The `_linkedVillageWeek` subordinate tick (2026-10-12) works: subordinates pay. Tribute discipline and subordinate throughput are NOT the wall.

**4. THE EXILE IS EARNED BY THE POLICY, VIA THE TAKES/GIVES LEDGER.** Forensic (competent s22, exiled @18): takes climbed ~1,000 kcal/day from the communal pantry with gives=0 for 12 days (net −12,939); `theftConfrontation` fires on cumulative takes ≥ min(4000, pantry/2) — about two days of normal eating; confrontations → 'hoard' observations → grievances → moot case (crime: theft, d33 on s11) → conviction with avgBelief < −40 ("theft needs the village baying for blood" — betrayal.js) → exile. The policy eats to 95% cap daily from the shared pantry and donates late; the village reads it as hoarding. Whether the 4000-cumulative bar is calibrated for below-fair-share eating (~1,080/day < the 2,000 fair-share norm) is a **lever-5 (trust & social) question, out of this run's scope** — documented as a blank, not fixed here.

**5. THE SCALE PUSH READS AS VILLAGE DECISIONS (sense-tested).** Transcript (leadcourt s11): tribute arrives ("🌾 Tribute from Emberhold arrives — 3,000 kcal of grain into the pantry. Their fields, our fire."), tending ("🌾 Haven sends 3,000 kcal of grain to Emberhold's fire — not tribute, the other way around. Someone's grandmother over there will remember who fed her. (Trust +8.)"), raids ("🌙 Raid — Stonebridge came in the night..."), the moot ("David stands up at the fire, pointing. 'This one. Raising hands against one of us — and we all know it.' Heads turn. 2 days until the moot. Use them."). The fiction and the mechanics agree; the wall is not a feel problem.

### Phase 3 — LEVER: NOT TRIGGERED (killed at precondition)
The staged plan gates Phase 3 on "Phase 2 shows a food bind AT SCALE." It doesn't: food during the push is adequate (finding 2), tribute flows (finding 3), links season (finding 3). The task's candidate levers are all disproven as the wall:
- tribute discipline (landed 41%→17%): flow now 43/0/2 — healthy, nothing to fix.
- subordinate-economy throughput: 24/0/0 and 19/0/2 — healthy.
- cook staffing at scale: push ate 79–87% without it.
Shipping a food-at-scale lever against these numbers would be fake work (r4's lesson: "placebo tweaks would be fake work"). No game code changed in r6; no gate defined. The GO threshold (national ≥2/8 AND median ≥82.8d) has no after-side to judge.

### Convergence state: **blocked** (axis unchanged, diagnosis refined)
Scale-onramp stays the blocking axis, but the r1–r6 arc now reads: the wall's face on the current tip is **the moot-exile foreclosure** (lever-5/trust-social territory) plus combat/sickness deaths — NOT food at scale, NOT trust drift (fixed), NOT subordinate throughput (healthy). `longsims-rotation.txt` stays 3.

## Village assessment (repro runs; sense-tested)
- **leadcourt s11 (d90):** the realm-builder. Three subordinates courted d25–27, tended 49 times (1,500–4,000 kcal grain, +8 trust each — "Someone's grandmother over there will remember who fed her"), trust 90/74/54, 24 tribute weeks paid in full. The polity was REAL — lead sz4 from d70. Then the moot exiled its voice at d63 ("Raising hands against one of us") and the First Court never sat. Died village-lost d90 with the realm intact. **The village did everything right; its speaker was an outcast.**
- **belongseek s11 (d132):** the oath-seeker. Subordinate link to village_0 d20, trust 49→85, 44k tribute paid over 7 weeks. Exiled d37 for theft. At d62 the policy burned the trust-85 bond chasing village_3's 4-realm and the re-court died silent — the exile guard ate the proposal. Limped to d132 as an outcast village, regional, never a good-standing day.
- **belongseek s44 / leadcourt s44:** the same story compressed — links formed and seasoned, exile at d32/d54, ambitions died with the sentence.
- **s22 (all policies):** exiled at d18, survived to d150 as an outcast at village rank. The exile doesn't end the run; it ends the *scale arc*.
- **Who thrived:** villages that kept fish+garden labor staffed and never courted (the s22 survivors). **Who died and why:** scale-push villages die village-lost (combat, sickness, wounds) — and their scale arcs die earlier, at the moot.
- **Missing capabilities:** the takes/gives ledger has no fair-share-rate accounting (cumulative 4000 bar vs ~2,000/day norm); exile has no visible path back in the sims (amendsCredit exists in code, unmeasured); the consolidator re-court needs the v3 exile/score gates on by default (currently opt-in via BELONG_V3).

## Blanks filled
1. **Scale-push repro instrument** (`scripts/scale-repro-20261013.js`): food-coupling + scale-road telemetry on one runner — proposals, tribute flows (paid/thin/missed from link histories), trust/seasoning, foreign realms, good-standing days, national staging, push-window food curves, exile day. Reusable for any future scale lever.
2. **The 2026-10-12 starvation-at-scale is NOT on the current tip** — answered with numbers, not arguments.
3. **Baseline re-verified byte-identical** on the current tip (`evidence/2026-10-13/r6-baseline.json`).
4. **Tribute-arrival instrumentation gap found and fixed in-tooling**: the arrival pushes pantry items directly, bypassing `stockPantry` (same class as r5's donateToPantry catch) — now read from link histories.
5. **`payTribute` telemetry correction**: the policy calls it bare (`linkId` only); the engine defaults to the weekly owed — the instrument now records the return value (actual kcal removed), not the missing arg.

## Blanks documented (open)
- **The moot-exile foreclosure is the wall's current face** (lever 5, not lever 0/8): 9/16 runs exiled in the courtship window. Next run should work lever 5 — the theft-confrontation calibration (cumulative-4000 bar vs fair-share rate), the takes/gives accounting for communal eating, and whether exile needs a visible path back (amendsCredit unmeasured).
- **BELONG_V3's exile/score gates are opt-in** (`BELONG_V3=1`); v2's consolidator can still burn a live bond into a silent null when the persona is exiled. Default-on is a policy call, not made here.
- **Villager field-fight math vs "slow and risky"** still unaudited (r4's open blank, scholar-only duels).
- **Exile-then-survive arcs** (s22: 132 days as an outcast) are unassessed as played experience — the defied-exile path exists but no run has read it as a player.
- Whether a non-stealing policy variant (kind.js exists: "NEVER steals") reaches national — the cleanest test of the exile-foreclosure hypothesis. Recommended as the next run's pilot.

## Reachability (wall numbers, this run)
national 0/16 · table 0/16 · wins 0/16 · wave 4–5 unlocks 0 (maxWave 3) · Arc II/III reached (maxArc 3), Arc IV not reached · regional reached (scale-push runs) · median survival 69d (baseline) / 90d (scale-push) · vests 0/16 · exiled 9/16.

## SENSE-TESTING (transcripts read, not just counts)
The scale push reads as village decisions — moots, debates, the tendLink verb ("not tribute, the other way around"), tribute arrivals, raids, the schism. The exile reads as a real social consequence ("David stands up at the fire, pointing... 2 days until the moot. Use them."), not a silent counter. Verdict: the fiction and the mechanics agree; the village feels alive. The wall is not a feel problem — it's a systems problem wearing a social face.
