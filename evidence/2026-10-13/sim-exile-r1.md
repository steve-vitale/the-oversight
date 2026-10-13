# longsim scale-wall run r7 (exile-foreclosure probe, lever 5: trust & social) — PILOT

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12)
- **Axis:** scale-onramp (blocking; standing directive overrides rotation; `longsims-rotation.txt` stays 3).
- **Lever lens:** 5 (trust & social) on the scale wall — the moot-exile foreclosure face identified in r6.
- **Question:** r6 showed the scale wall's current face is MOOT-EXILE FORECLOSURE: 9/16 runs moot-exiled in the courtship window (days 18–63), `_checkNational` won't stage a beat for an exiled answerer and `proposeLink`'s exile guard returns null, so the First Court never sits. The exile is earned via the takes/gives ledger: ~1,000 kcal/day communal-pantry takes with gives=0 → `theftConfrontation` (cumulative ≥ min(4000, pantry/2)) → 'hoard' observations → grievances → moot theft case → conviction (avgBelief < −40) → exile. The cleanest test: does removing the takes ENTIRELY un-foreclose the courtship window?
- **Primary metric:** courtship-window exile rate on a scale-push (belongseek-base) policy.
- **Baseline (r6, identical seeds 11/22/33/44):** belongseek 3/4 exiled (d18, d32, d37; s33 lost d14 before any moot). leadcourt 3/4 (d18, d54, d63). Combined repro 6/8; 9/16 across all policies.
- **GO threshold (pilot → confirm):** selfeed (zero-takes variant) exile ≤1/4 AND ≥2/4 runs show seasoned links (linksSeasonedEver ≥1) with no exile — the window demonstrably un-forecloses. If exile persists at ≥2/4, the pilot's job is to NAME THE ROUTE (another moot path? freeloadVote? something else?), not to fix it.
- **Horizon:** 150d death-aware (dead villages stop; +10d tail max). Why: courtship window d20–90; baseline exile days 18–63.
- **Seeds:** 11/22/33/44 — identical to r6 repro, before/after on the same seeds.
- **Policy:** `selfeed` (new, scripts/policies/selfeed.js): belongseek + ZERO pantry takes — takeFromPantry/takeFromPantryBulk disabled (pack-only eating), the communal dawn meal declined at the haven fire (refused share recorded), post-daily top-off from the pack via Game.eat(), never stealFrom. Ledger contract: v.takes[scholarId] must read 0 at end of run — verified in the test, not assumed.
- **Convergence state:** tbd (pilot).

## Canon check
READ docs/CANON.md first. No canon doc covers trust/social/the moot (CONVERSATIONS.md covers dialogue, PARTY.md covers party dynamics, DIRECTIVES.md is standing orders) — per the brief, that absence is stated here instead of inventing canon. Steve's hard rules that bind: THEFT IS ALLOWED, socially punished; the moot is the one formal track (betrayal.js/justice.js); Trust ≠ reputation (gossip moves REP only, never trust); "If you don't know, it doesn't show"; no silent actions.

## Blank 1 — theftConfrontation calibration (traced in code, game.js:13335)
- The bar: `if (totalKcal < Math.min(4000, pantryKcal / 2)) return;` — fires when the ARG ≥ 4000 kcal (or half the pantry, whichever is smaller), with witnesses(6) present, once per day per villager, 65% chance after the boldest-witness pick.
- The comment claims "Blatant theft = 2x+ in one take, OR half the pantry at once — whichever is smaller" (fair-share norm ~2000 kcal/day).
- THE MISCALIBRATION: the single-take path (game.js:13593) passes the CUMULATIVE LIFETIME total `v.takes[vid]`, not the one take. So the bar is not "2x in one take" — it is ~2 days of the village's own communal feeding (share 2000/day at trust 30+, 1000/day below 30) or ~4 days of the r6 policy's ~1,000 kcal/day eating, then the confrontation fires on the next witnessed take. At the r6 policy's ~1,080 kcal/day vs the 2,000/day fair-share norm: BELOW fair share still trips it, in ~3.7 days of eating.
- Sibling bars on the same cumulative ledger (net = gives − takes): takeFromPantry trust drip at net < −min(5000, pantryKcal) (−2 trust + 'hoard' observation per take); justiceHeat at net < −5000 (+10) / net < −15000 (+25); freeloaderTick's drainBeyondCapacity = netDrain > max(1500, totE*3) → freeload days → gossip(3d)/warning(7d)/vote(12d) → freeloadVote (pairAffinity vote, can exile).
- Verdict: the 4000 bar is calibrated as a per-take blatancy check but implemented as a cumulative-ledger tripwire. It cannot distinguish hoarding from ordinary communal eating over time. (Fix design is a separate run's call — this run only fills the measurement blank.)

## Blank 2 — takes/gives fair-share accounting
- The ledger has NO rate concept and NO fair-share credit. It records cumulative lifetime takes vs cumulative lifetime gives and compares against fixed kcal bars (4000/5000/15000). Time is not a variable: eating 2,000/day (exactly fair share) for a week with gives=0 accumulates 14,000 → trips every bar. The village's own communal meal (villageMeal, game.js:24737 — "you eat from the communal pantry. You're one of the 12", trust-scaled share 1000/2000/2200) RECORDS the draw as a take (FREELOADER LEDGER block, game.js:24824). The village feeds you, then the ledger reads its own feeding as your hoarding.
- Villagers' own takes: recorded too (villagerMealDay → v.takes[vid] += pile.taken, v.gives[vid] += shared surplus, game.js:25604). NPCs are judged only by drainBeyondCapacity (the effort gate is dead-by-construction for them: produced = expected × grit, grit ≥ 0.5 ⇒ effort ≥ 0.5 always), so an NPC eating communally with no surplus trips freeload days after netDrain > max(1500, totE*3) — the same cumulative-trap, softened only by their gives offset. theftConfrontation itself is player-only (uses scholar.villagerId).
- Verdict: there is no fair-share eating allowance anywhere in the pipeline. The ledger measures accumulation, not rate; the communal meal is both the village's generosity and the ledger's evidence.

## Blank 3 — the cleanest test (this run's pilot)

## PRE-REGISTRATION AMENDMENT (two-arm pilot)
Arm 1 (selfeed, zero-takes) was built and debugged first. Finding: a
zero-takes scholar is not survivable — see "Arm 1 result" below. The arm
answers the task's question in the negative with a named route
(starvation, not exile), but it cannot test the exile-foreclosure
hypothesis because the scholar dies before the courtship window.
Arm 2 (kindseek) is the task's named clean test: kind.js "NEVER steals" +
belongseek scale-push. A generous, surviving, non-stealing scholar — if
exile persists, the transcript names the route. GO/NO-GO is judged on Arm 2.

## The moot-convening routes (traced, betrayal.js/justice.js)
For a scholar with NO recorded crimes (a communal eater never calls
stealFrom, so recordCrime('theft') never fires), the moot convenes via:
1. **Fabricated accusation** (considerPlayerAccusation): enemy motive ≥ 60
   AND trustInPlayer < 25 AND 25% roll → charge pick(['theft','assault']).
   The 'hoard' observations from theftConfrontation build the motive; the
   trust erosion opens the door. This is the r6 route.
2. **Justice-ladder mootDemanded** → forcePlayerAccusation — but that needs
   UNJUDGED provable crimes; a crimeless scholar gets "nothing left
   unjudged... No second moot" and the stage resets to 1. The heat ladder
   alone CANNOT moot a crimeless scholar.
So the exile needs both: the ledger tripwire (gross takes) to manufacture
motive + trust collapse to under 25. Generosity attacks the second half.

## Arm 1 result — selfeed: the zero-takes scholar starves (NOT survivable)
Instrument: scripts/policies/selfeed.js (takeFromPantry/Bulk disabled,
communal dawn meal declined at the haven fire with refused share recorded,
post-daily pack top-off via Game.eat(), never stealFrom).
Ledger contract verified: the ORIGINAL scholar (gen_dkjljvy) held
v.takes = 0 through death — the refusal machinery works (21/25 dawn meals
refused in the 25d smoke run; the 4 non-refusals were wild-camp nights).
But the scholar cannot live on pack food alone:
- kcal bank: 420 → 96 → 0 by day 5; refusedPantryTakes=420 in 7 days (the
  policy constantly reaches for the pantry and finds it locked).
- donateHaul kept giving the forage surplus away (gives=8788) while the
  scholar couldn't eat it back — a net giver who starves.
- 3 successions in 30 days (seed 11): gen_dkjljvy d10 → rosa_mendez d19 →
  gen_1fo0vsd d27 → marcus_webb. Cause: starvation.
- The "TAKES=1948" mystery that consumed the debugging: those were the
  SUCCESSORS' pre-existing NPC-era takes (villagerMealDay records NPC
  communal eating into the same ledger). A new scholar inherits a ledger
  they didn't write. (Documented as a blank: succession ledger inheritance.)
Verdict: "removing the takes entirely" is not a playable strategy — the
communal meal is load-bearing for survival. The courtship window cannot be
tested this way. Arm 1 is a documented negative result, not a lever.

## Arm 2 — kindseek pilot (4 seeds, 150d death-aware)
Policy: scripts/policies/kindseek.js (belongseek + kind's shareSurplus/
comfortRound, never stealFrom). Instrument: scripts/test-exile-selfeed.js
(scale-repro instrument + take-ledger + moot-transcript capture).
Baseline: r6 belongseek 3/4 exiled (d18/d32/d37) on seeds 11/22/33/44.
GO: kindseek exile ≤1/4 AND ≥2/4 runs with seasoned links and no exile.

### Result: NO-GO — exile 3/4, IDENTICAL to baseline. Generosity does not un-foreclose the window.

| seed | end | exiled | takes | gives | net | route |
|---|---|---|---|---|---|---|
| 11 | lost d132, regional | @37 | 23,415 | 26,810 | +3,395 | fabricated theft (David) → moot → exile d36 |
| 22 | surv d150, village | @18 | 8,787 | 38,656 | +29,869 | fabricated theft (James) → moot → exile d17 |
| 33 | lost d14, village | — | 11,028 | 305 | — | died d14 before any moot |
| 44 | lost d83, regional | @32 | 9,340 | 28,518 | +19,178 | freeloadWarning d26 → freeloadVote d31 (8-0) → exile |

Wall numbers: national 0/4, table 0/4, won 0/4, median 132d, wave 4-5 unlocks 0, vests 0/4.

### The routes, named (transcript-verified)
**Route A — fabricated theft → moot (s11, s22).** Day 33 (s11): "David stands up at the fire, pointing. 'This one. Theft — taking what wasn't theirs — and we all know it.' Heads turn. 3 days until the moot. Use them." Day 36: "◈ CRISIS — THE SCHISM. You are cast out." Case record: `fabricated=true, accuser=david_kim, charge=theft, resolution=exile`. The scholar never stole anything — the charge is manufactured. Mechanism: theftConfrontation's GROSS-takes bar fires on cumulative communal eating → 'hoard' observations → grievances/motive → considerPlayerAccusation's false-accusation branch (motive ≥ 60 + trust < 25 + 25% roll) → moot → conviction (avgBelief < −40) → exile. Generosity is irrelevant to this route: the confrontation bar never looks at gives.

**Route B — freeloadVote (s44).** Day 26: "Minh corners you by the fire. 'We all eat from the same pot. You've been taking more than you bring for a while now. That can't continue — the village will decide.' (Warning: pull weight or face a moot.)" Day 31: "Hands: 8 for exile, 0 against." Mechanism: freeloaderTick's drainBeyondCapacity (netDrain > max(1500, totE*3)) → 12-day clock → vote. The scholar's net ENDED at +19,178 — but the vote happened during the early drain phase (net −30,499 at d27), before the lumpy donations caught up. The pipeline judges the dip, not the balance.

### Why generosity fails (the design hole)
1. **Gross vs net:** theftConfrontation (the motive factory for Route A) reads cumulative GROSS takes. Donations don't slow it. Every communal eater trips it in 2–4 days.
2. **The dip, not the balance:** freeloadTick (Route B) starts its 12-day clock the moment netDrain crosses the bar. Takes are daily; gives are lumpy. A scholar who nets positive over a month still spends 12+ days in the dip.
3. **Newcomer calibration:** drainBeyondCapacity = netDrain > max(1500, totE*3), where totE is 5-day expected PRODUCTION. A new scholar (low knowledge × stranger factor) has low expected production → a low bar → trips in under a week of ordinary eating. The "kick out drains" design hits newcomers hardest — exactly the scholars pushing scale.
4. **No fair-share rate:** eating 2,000/day (the village's own norm, the communal meal's own share) with net-positive donations still reads as hoarding to every tripwire. The ledger cannot distinguish "ate their share" from "drained the pantry."

### Village assessment (kindseek runs; sense-tested)
- **s11:** the generous realm-builder. Donated 26,810 kcal (net +3,395), courted and seasoned a subordinate link, reached regional. Exiled d36 on a fabricated theft charge by David — the village's generosity ledger said "giver," its suspicion ledger said "thief," and suspicion won. Died village-lost d132 with the realm intact. The fiction is coherent and cruel: the moot felt like a real trial, the exile like a real injustice.
- **s22:** the philanthropist. Net +29,869 (gave 38,656!). Exiled d18 — the fastest exile in the dataset — on James's fabricated theft charge. Survived to d150 as an outcast at village rank. Giving nearly 40k kcal bought no protection whatsoever.
- **s44:** the warned. Got the freeloadWarning speech d26 ("We all eat from the same pot..."), then the 8-0 vote d31. The warning is honest and well-written; the vote that follows ignores the subsequent donations.
- **s33:** died d14 (village-lost) before any social machinery engaged — the early game is lethal independent of the ledger.
- **Who thrived:** nobody reached national. The scale-push courtship works mechanically (links proposed/accepted/seasoned, tribute flowing) but the speaker keeps getting exiled in the window.
- **Succession note:** s11's exiled scholar was marcus_webb, a successor (gen_dkjljvy d19 → gen_1fo0vsd d33 → marcus_webb). Successors inherit NPC-era takes into the scholar ledger — the takes/gives bookkeeping does not reset on succession. (Documented blank.)

### Reachability (wall numbers, this run)
national 0/4 · table 0/4 · wins 0/4 · wave 4–5 unlocks 0 · regional reached (2/4) · median survival 132d · vests 0/4 · exiled 3/4 (courtship window).

### Convergence state: **blocked** (axis unchanged, diagnosis deepened)
Scale-onramp stays the blocking axis. The r6 "moot-exile foreclosure" diagnosis is now measured, not just observed: generosity (the obvious lever-5 fix) changes nothing — 3/4 exiled, byte-identical to baseline. The foreclosure is structural to the takes/gives ledger design (gross-takes tripwires + dip-judging + newcomer calibration), not to player behavior. A real fix needs fair-share rate accounting in the ledger (a design change for a future run, not this measurement run).

## Blanks filled
1. **theftConfrontation calibration** — traced: the 4000 bar is cumulative lifetime takes, not per-take. ~2 days of the village's own communal feeding (or ~3.7 days at the r6 policy's 1,080/day) trips it. Below-fair-share eating is not distinguished from hoarding.
2. **takes/gives fair-share accounting** — there is none. No rate concept, no fair-share credit; the communal meal records its own feeding as the scholar's take; NPC villagers accumulate the same way (judged by drainBeyondCapacity only).
3. **The cleanest test** — run as a two-arm pilot:
   - Arm 1 (selfeed, zero takes): not survivable — scholar starves ~day 10 (3 successions/30d). The communal meal is load-bearing. Documented negative result.
   - Arm 2 (kindseek, generous non-stealing): exile 3/4, identical to baseline. Generosity does not protect.
   - **Routes named:** (A) fabricated theft accusation → moot → exile (s11, s22); (B) freeloadVote 8-0 (s44).
4. **Succession ledger inheritance** — successors inherit NPC-era takes; the ledger doesn't reset on succession. (Documented blank for a future run.)
5. **Transcript capture for sims** — the harness silences Game.say; scripts/test-exile-selfeed.js restores a capturing say (first-600-lines policy to avoid post-exile spam eviction) plus moot-case forensics. Reusable.

## Blanks documented (open)
- The ledger needs fair-share rate accounting (takes/day vs the 2,000 norm, not cumulative gross) — a design change, not a measurement. Steve's call.
- freeloadVote's pairAffinity vote went 8-0 against a net-positive scholar — the vote doesn't weigh the ledger either.
- BELONG_V3's exile/score gates still opt-in (r6 blank, untouched).
- Whether the r6 baseline exiles were also successors (succession confounds exile-day attribution).
- Exile-then-survive arcs (s22: 132 days as an outcast) still unassessed as played experience.

