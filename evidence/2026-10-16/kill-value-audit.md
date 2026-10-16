# Kill-Value Audit — The Oversight Sim Arms (2026-10-11 → 2026-10-16)

**Purpose (Steve 2026-10-16):** "I wonder how many of these just got wired wrong... We need to question the underlying assumptions." / "Get the value we should have from all the loops we've run."

**Method:** Every killed arm classified per docs/MEASUREMENT.md §§14a:
- **CONCEPT-DEAD** — mechanism staged, metric fair, concept failed on merits. Don't retry without new mechanism.
- **METRIC-BROKEN** — bar unachievable/mis-scoped/measured noise. Returns to queue with corrected pre-registration (new run, not re-score).
- **SUBSTRATE-MISSING** — engine doesn't stage what the arm needs. Blocks on substrate, then re-runs.

**Scope:** 127 killed-arm files surveyed across evidence/2026-10-13 → 2026-10-16, via 6 parallel research batches + direct reads. Sim evidence begins 2026-10-11 with the "long-run sim lever" framework (lever verdicts, no §14 kill protocol) — those exploratory rounds are noted where they contain dead-end findings, but the kill taxonomy applies from 10-13 when the pre-registered ARM structure began.

**Honesty note:** The majority of kills ARE concept-dead — the taxonomy is not a rescue operation. Roughly 55–60% of classified kills failed on merits. The value of this audit is (a) rescuing the ~25% that were metric-broken, (b) naming the substrates blocking the ~15% that are substrate-missing, and (c) extracting the converging root causes so the loops stop re-running dead lines.

---

## Part 1 — Per-arm classifications (by batch)

### Batch A: Scale-wall rounds, 2026-10-13 (11 killed, 1 passed)

| Arm | Tried | Kill reason | Class | Real finding | Retry |
|---|---|---|---|---|---|
| scale-wall-r1 | Policy DPS-race fight assessment + barrier-exit flee | Median 69→28d (inverted) | CONCEPT-DEAD | Policy flee() never worked vs chasers (21,000-turn stuck fight); fights are 3–4 turns, conviction needs 5+ | Don't retry mid-fight assessment |
| scale-wall-r2 | Directional flee (havenward exits) | Median 69→44d; push fired 2× | CONCEPT-DEAD | 'Combat' death bucket mixes scholar kills with scholar deaths — telemetry misread | Don't retry as survival lever |
| scale-wall-r3 | Pre-fight knowledge-gated decline | Median 69→33d; starvation 2→13 | CONCEPT-DEAD | Declining fights is a FOOD decision — competent's meat income needs fights; 10 declines = 10 lost first-strike turns | Don't retry fight-start disengage |
| scale-wall-r4 | Wave-1/2 damage audit | Audit disproved premise pre-pilot | CONCEPT-DEAD | Monster math fine; fight tempo set by PLAYER DPR; "43–44% wave-1 loss target" RETIRED | Don't retry monster math |
| scale-wall-r5 | Cook smoke racks (processing throughput) | Rot −28% but national 0/4 | CONCEPT-DEAD | Villages at 85% food security still die — wall is combat/sickness, not food-at-haven; 1,291k kcal rot, 95% fresh | Don't retry throughput |
| scale-wall-r6 | Scale-push starvation repro | Killed at precondition: no food bind at scale | CONCEPT-DEAD | **Moot-exile foreclosure: 6/8 scale-push runs exiled in the courtship window** — the road dies at the moot, not the pantry | Retry the AXIS: theft-confrontation, fair-share ledger, path back from exile |
| scale-wall-r13 | Feast lever (tribute/tend as contribution) | National 1/8, median 74d (need 2/8, 90d) | METRIC-BROKEN | Concept SUCCEEDED (35 feasts, table 0→3/8); survival bar on a reachability instrument — unachievable regardless of merit | Re-run with deed-rung/table metric, not median |
| scale-wall-r15 | Armor uptake (hide-sweep + blind craft) | Uptake 0/8, byte-identical | SUBSTRATE-MISSING | Hide_armor L1 is chicken-and-egg: recipe unlearnable by design (not findable, no NPC owns one, only craft makes one needing L1+) | Blocked on honest L1 channel (design call) |
| scale-wall-r15b | Beam-dodge vs gallowdeer | Median +3d only; degenerate stalemate | CONCEPT-DEAD | "Optimizes the wrong protagonist" (Steve: village is protagonist); stalemate revealed deer AI gap → led to beamfatigue (PASSED) | Don't retry as survival lever |
| scale-wall-r16 | Wave-1/2 damage audit + W2-disengage | Top-4 fought 4/104; median byte-identical | CONCEPT-DEAD | Attrition not burst (DPR ≈ ½ static estimates; 11–37 round wars); cheat-death masks campaign cost | Don't retry disengage |
| beamfatigue-b | Deer hunts after 3 sterile beams | — | **PASSED** | Resolves r15b stalemate as designed answer | Land it |
| prodthrottle-b | Production throttling (redirect to wood/water/stone) | Fresh-rot share +0.0pp | METRIC-BROKEN | Share can't move with zero preserved rot (by construction); absolute rot fell 18%; villages die at 33d median — survival is the bind | Re-run with absolute-rot metric on surviving suite |

### Batch B: 2026-10-13/10-14 loop-B + early 10-14 (15 files)

| Arm | Tried | Kill reason | Class | Real finding | Retry |
|---|---|---|---|---|---|
| courtkill-b | Deliberate wave-3 hunting on courtship road | 0/8 vs ≥2/8 | CONCEPT-DEAD | Bind is capability not motivation (~1 pt/16 runs ceiling); tribute/tend doesn't fund a mid build | Don't retry hunting; next is combat-build lever |
| dinreserve-b | Cut cook dinner reserve 250→125 | Rot share +0.0pp | CONCEPT-DEAD | Rot lives in eligibility window/racks-full/post-cook arrivals, not the reserve; villages die of combat with full pantries | Don't retry the reserve |
| kitchen-r12 | Policy cooking of revealed monster meat | Eaten 0% vs ≥25% (fired 1× in 83d) | SUBSTRATE-MISSING | Cook→eat proven 7/7 but engine never delivers inputs; succession wipes pack; blind cooking burns 60% | Blocked on carcass-haul substrate |
| meat-r1 | Daily cautious flesh-test for discovery | Meat share 0.01% vs ≥5% | SUBSTRATE-MISSING | **97% of edible carcass kcal rots on corpses unlooted**; discovery works, costs energy-only | Blocked on carcass-haul (one fix serves kitchen-r12 too) |
| plenty-b | r13 feast as Standing plenty feed | Guardrail noise (6/8→4/8) | GO-with-caveat | Plenty strongest Standing source; first wave-5 unlocks ever (5/8) | Larger-seed follow-up on national |
| allowancegate-b | 4-day-floor gate on allowance feasts | hungryDays 44 > 43.2 (§14 letter) | METRIC-BROKEN | Control×0.9 tighter than A/A noise (±11); gate proven-safe (123 holds); harm lives in 2–4d band | Re-register under noise-calibrated bounds and land |
| allowancegate-r15 | <2 fresh-days gate | Starvation 21=21 (flat) | CONCEPT-DEAD | <2d "guards empty rooms"; harm lives in 2–4d band | Don't re-arm <2d |
| buildfund | Wave-3 build funding (spear/armor/counterplay) | 0/8 seeds ≥3pts | SUBSTRATE-MISSING | 3-link chain (recipe→unlock→race); links 1–2 never deliver; scholar's own wave-3 encounters generate no observations | Blocked on recipe arrival + wave-3 unlock |
| candwindow | Pantry discipline + codex-study for proposal window | Window 18 vs ≥31.5d | METRIC-BROKEN | 1.5× bar calibrated on anecdote not suite baseline; phenomenon trajectory-fragile | Only re-run if thin-window verified on current tip |
| consolidate | Haven consolidation after national/Standing≥150 | Median 73=73 (need ≥93) | METRIC-BROKEN | 6/8 seeds never reached trigger; on 2 engaged seeds survival extended (+69d, +5d) | Re-register with trigger-conditional metric |
| dutyalone-r15 | Zero-displacement surplus-only duty | Deeds 13→11, table 4→1 | CONCEPT-DEAD | **Plenty-Standing → wave-5 unlocks villages can't fight** (10/16 vs 4/16; combat deaths 116 vs 62). Extra Standing ≠ power | Don't retry without Standing cap or readiness gate |
| famredirect-b | Famine duty redirect to food work | Bar structurally unreachable (demanded negative rate) | METRIC-BROKEN | Absolute bar < A/A delta; lever engages only in collapse; thirst deaths 1→16 (water redirected) | Re-register with relative bar + thirst guardrail |
| feastdoor-b | Surplus-only duty vs pristine control | hungryDays 40 vs ≤38.5 | METRIC-BROKEN | 1.1× hand-set ~4× tighter than suite noise (p90rel 0.409); r13 allowance genuinely harmful (starvation 15→21) | Retry executed as feastdoor2 |
| feastdoor2-b | Same duty vs r13-only control | Table 2 < 3 (primary passed) | CONCEPT-DEAD (measured trade) | Displacement price structural: −10 starvation, +2 national, +16d median for −2 seats. Calibrated price tag published | Don't retry shared-cadence; needs design call |
| feastopener-b | Feast-forwarding duty | National 5/16 vs 10/16 | METRIC-BROKEN | National measures survival-to-d76, not harm; lever perturbs trajectories without harming | Re-register with harm-specific national proxy |

### Batch C: 2026-10-14 mid (feastr15 → overdraw3)

| Arm | Tried | Kill reason | Class | Real finding | Retry |
|---|---|---|---|---|---|
| feastr15 allowancegate | <2d gate re-test | Starvation 21=21 | CONCEPT-DEAD | Confirms <2d guards nothing; corrected band (allowgate2) went GO same day | Don't retry <2d |
| feastr15 dutyalone | Surplus-only duty re-test | Deeds 13→11, table 4→1 | CONCEPT-DEAD | **"PLENTY ROAD TO WAVE 5 IS LETHAL"** — filed as design item | Blocked on combat-readiness check in unlock logic |
| fleedirect | Destination-judged flee refusal | Refusal fired 0×; median 109→100 | SUBSTRATE-MISSING | Leadfeast haven-bound; disengages at haven node, never wilderness. Refusal spec proven 17/17, preserved | Retry on ranging substrate |
| fleedirectwild | Refusal on ranging substrate | Refusals 0 (unmeasurable) | CONCEPT-DEAD | Landed r2 judgment already guarantees safe-home; nothing left to refuse. Finding #203 answered | Don't retry; spec superseded |
| renegans (r23) | Answer young-link renegotiation beats | 5th-link 1/8=1/8; median 81→60 | CONCEPT-DEAD | Answered beats don't move tend-vs-decay race; #1 race loser is succession haircuts (−8/−14) | Re-aim at succession haircuts |
| gorgcall-b | Call-for-help vs gorge lingerers | Episodes 1 < 4 | SUBSTRATE-MISSING | Phenomenon absent on leadfeast; **aidFight dormant** — arrivals don't end the gorge | Blocked on aidFight route or "Endure it" design call |
| griefgrain | Gift grain becomes real aid | 1/4 vs ≥3/4 (6th-link conversion) | METRIC-BROKEN | Primary measured wrong bond (gifts fire on young-link succession, not 6th link); fix proven 17/17 | Retry with mechanism-matched metric (young-link seasoning/survival) |
| hungerdepth-b | Hunger-depth-gated prodthrottle exemption | Rot guardrail 1.278× vs 1.15× | METRIC-BROKEN | Absolute-rot guardrail **penalizes longevity** — lever works by extending life, which increases total rot | Retry with rate-form rot + calibrated noise floor |
| hybridroad (r35) | Diplomacy + deliberate wave-3 hunting | alive30post 2<3; median 130→109 | CONCEPT-DEAD | Hunt drive crowded out diplomacy (dip=0); s66's "recipe" was survivorship; readiness hold = slower starvation | Don't retry hybrid shape |
| mantlebeat | Succession-day repositioning beat | Scholar deaths 33→59 (doubled) | CONCEPT-DEAD | Threat model wrong at policy layer: successions fire during driver day-parts; killer re-engages inside Haven | Don't retry policy-side; needs engine sanctuary (Steve's call) |
| matbank-b2 | Bank vine+stick to craft threshold | 1/8→0/8; regression | CONCEPT-DEAD | Near-constant pull over-harvested regrowing ground (0.13→0.04/trip); burn-gate inert (0 crafts/32 runs) | Don't retry destination pull; needs regrowth-aware rotation |
| matbank | Bank 2+2 reserve; block burns below | 2/8=2/8 (need ≥4/8) | METRIC-BROKEN | GO band keyed to dead 2+2 instead of live 3+3 blind gate — "the GO band itself was the bug" | Already retried as b2 (then concept-dead); line exhausted |
| mealonly-b | Refuse all voluntary pantry takes | 0.99×/1.26× vs ≤0.50 | CONCEPT-DEAD | **"Removing the penalty stops the bleeding; only trust GAINS can heal."** Penalty side exhausted; pack-dependence fragility (+59–75% hungry days) | Don't retry penalty-side; next is trust-GAIN measurement |
| overdraw3-b | Fresh-first overstock drawdown | Primary passed (0.517) but median 179→123d | CONCEPT-DEAD (lever as built) | **Fresh-first rot mechanism PROVEN** (0.517/0.567); poison is early-tribute timing ratcheting fragile pantries | Retry = aid+feast WITHOUT early tribute |
| fifthlink-r26 | (GO exemplar) | — | — | r22 was METRIC-BROKEN → r26 corrected denominator and passed. Taxonomy loop works | Landed |

### Batch D: 2026-10-14 late (overstock → snaregate)

| Arm | Tried | Kill reason | Class | Real finding | Retry |
|---|---|---|---|---|---|
| overstock-b | Policy overstock drawdown | Primary passed (0.638) but median 103 vs 137d | METRIC-BROKEN | No harm channel (starvation 19→18); −34d is perturbation; **feast-as-table-opener replicated 0→5** | Same lever, harm-specific guardrails, median report-only |
| overstock2-b | Same under corrected guardrails | Primary 0.978 (miss); starvation 19>17 | CONCEPT-DEAD | Verbs take least-perishable first — rot pool unreachable; early tribute ratchets fragile pantries (real harm) | Don't retry as rot lever; feast→table deserves own arm |
| packbank-b | Pack-banking for batch-cook pool | bankTagged=1, poolShare 0.000 | SUBSTRATE-MISSING | Flow doesn't exist: engine routes unprocessed food counter-bound; cookAll reads scholar inventory only | Blocked on Steve-call: should batch verb see counter/stash? |
| predcond | Type-matched spiral posture post-wave-5 | Layer fired 1× in 8 seeds | METRIC-BROKEN | +15d population-mean bar unachievable by near-inert layer; mechanism NOT disproven (20/20 proof) | Per-firing metric + pattern-screened seeds |
| proposelayer-r33 | Policy propose layer for links | Primary met (24≥2 links) but median 109<139 | CONCEPT-DEAD | Diplomacy→wave-4 unlock d57–62→unprepared villages die (4/6, −40d). **Guardrail caught a lever that wins the metric and kills the village** | Don't retry without readiness mechanism (Steve's call) |
| raiddef | RAID WATCH + DAWN CLEARING | Mechanism fired (189 engagements) but "other" deaths 4→12 | CONCEPT-DEAD | Engagement doctrine refuted: dawn-clearing feeds scholars to unbeatable threats; **AVOIDANCE not engagement is the w5 doctrine** | w5-avoidance with survival primary (new concept) |
| rationtraj | Pantry-trajectory ration call | 2 > 3−2=1 (starvation) | CONCEPT-DEAD | Savings verbs found ~nothing (1 feast + 3 begs / 8×180d); policy's own gates already avoid thin feasts | Don't retry these verbs; needs bigger savings verb |
| recconf | Recovery throttle re-confirm on leadfeast | Miss by 12.5d | METRIC-BROKEN | Bar calibrated on courtship-road +53d; leadfeast buys +2.5d — **"a bar is a claim about an effect on a road"** | Same-road re-confirm with stratified bars |
| recoverylever | Recovery throttle survival primary | Miss by 0.5d (130 vs 130.5) | METRIC-BROKEN | Three measurements all median-positive; magnitude scales with baseline room (regime-dependence is the signature) | Stratified/proportional bar, same-regime seeds |
| warroad | War lane to Standing 100 | Wave-4 unlocks 0/8 | SUBSTRATE-MISSING | 53 hunts bank max 3/4 points; warPerKill=25 "sim starting point, not canon" — lane unreachable by construction | Blocked on Standing tuning decision |
| succbrake | Post-death fortify vs succession feed | Feed rate 0.111→0.216 (doubled) | CONCEPT-DEAD | **Feed is Haven-siege phenomenon** (11/11 at tile [4,4], 9/11 fortified) — travel guard can't fix a siege. Accidental discovery: +27.5d recovery lever | Don't retry feed theory; recovery lever is the value |
| hybridroad (r35) | (duplicate of Batch C entry) | — | CONCEPT-DEAD | — | — |
| siegedef3 | SALLY-ONLY-IN-STRENGTH triage | 5.00→4.80 (4% vs 30% bar) | METRIC-BROKEN | ×0.70 bar assumed draw-dominance; draw is ~1/3 of deaths — perfect elimination can't reach bar. Median improved 101→114d | Bar on draw's actual share, or stacked-siege arm |
| sharepol-b | Person-to-person sharing vs starvation | Effect 0.014 vs noise 0.051–0.151 | METRIC-BROKEN | Metric can't resolve merit from noise; 298 gifts, zero starvation deaths prevented — villages starve from production collapse, not distribution | Noise floor from ≥2 invocations; bigger dose or production channel |
| snaregate | Soften blind-craft gate 3+3→2+2 | 22 vs 20 (need 2×); 1/8 seeds | CONCEPT-DEAD | "Materials are the gate, not the policy's 3+3 number" — pack never holds vine≥2 AND stick≥2 | Don't retry gate number; materials-banking is the new concept |

### Batch E: 2026-10-14 spiral/succession/trust/wave (16 files)

| Arm | Tried | Kill reason | Class | Real finding | Retry |
|---|---|---|---|---|---|
| spiralcond r28 | Spiral-shaped post-wave-5 trigger → homebound verbs | Triple miss; median 78 vs 90 | CONCEPT-DEAD | Trigger ≠ treatment: s44's pantry spiral was raid PREDATION not income shortfall; homebound pins needed income | Don't retry uniform verbs; key verbs to cause |
| spiralverb r29 | Type-matched verbs on spiral trigger | Primary + guardrail miss | CONCEPT-DEAD | Cause taxonomy 3 levels: marker type ≠ cause; s44 needed RAID DEFENSE not food posture | Blocked on raid-defense substrate (#161: lingerers undrivable) |
| spoilgate | Spoilage gate on pantry takes | 0 spoiled takes / 23,168 (no exposure) | CONCEPT-DEAD | Dawn sweepSpoiled owns the window; motivating transcript MISREAD (undercooked poison roll, not spoilage) | Don't retry; candidate: undercooked-food gate |
| succbrake | (duplicate of Batch D) | — | — | — | — |
| succombat | Succession-day fight-back protocol | 1.96 vs ≤1.92; multi-death 4/16 vs ≤2 | CONCEPT-DEAD | Base policy already optimal at policy layer; binding constraint is **sanctuary semantics** (Steve's call #87) | Don't retry policy-side |
| takedisc | Batched bar-safe pantry takes | Opposite of intent (takes UP 35–53%) | CONCEPT-DEAD | **PANTRY-PACK CROWDING**: pre-filling pack suppresses foraging; v.takes conserved — cumulative metrics punish survival | Don't retry take discipline; day-normalize take metrics |
| triage | Evening pantry triage to racks | +0.2pp (kill floor <5pp) | CONCEPT-DEAD | Fishes SAME pool as duty cook drive (956k→581k offset); substitution not addition | Don't retry; name a different pool first |
| tribdisc-b | Healthy-pantry early tribute pull-forward | Arrears 24→16 vs ≤12; median 128→103 | CONCEPT-DEAD | **Pantry health ≠ village health**: paid 5,000 kcal "early" while village starving since day 1; beat read as lie | Only with link-stability/village-health gate redesign |
| tribgate-b | Tribute fragility gate (hold when <4 fresh-days) | Primary PASSED; median 109<141 | METRIC-BROKEN | **Cleanest perturbation kill**: per-policy medians byte-identical (109/109, 180/180); combined moved on rank interleaving. Working lever killed by a number | Re-register: median report-only, harm guardrails binding |
| trustgain-r31 | Trust-gain census (diagnostic) | — | GO | **Succession masking**: r30's "trust never reaches 30" was dead-scholar artifact; village earns +95/100d vs −32 drains; sitting scholar earns ~nothing | Named nexts: sitting-scholar deed→trust, silent-gain fiction |
| vinebank-b | Materials-banking for trapline | — | GO | Blind band now working early-trapline lane | None; engine follow-up on arrows |
| w5avoid | W5-avoidance doctrine | Median 120 vs ≥123 (miss by 3d) | MIXED | Avoidance barely fired (thin surface) but s33 vindicates; clearing doctrine recreated successor-feed at wave 1 — needs wave floor | Retry: wave-floored clearing + stratified metric |
| warroad | (duplicate of Batch D) | — | — | — | — |
| wave4ready | Readiness-gated diplomacy | Unlock 1 vs ≥6 | CONCEPT-DEAD | R1∧R2∧R3 bar is coincidence detector; control shows lethal pattern (ready AFTER unlock) | Retry only with trajectory bar + reachability pre-check |
| wave5cond-r27 | Death-count wave-5 posture (deterministic) | 40.0 vs 60.5 | CONCEPT-DEAD | Count can't tell wake from collapse (s22 mourning pinned 85d −31d; s44 true bleeder +9d) | Don't retry count triggers; lineage moved to spiral |
| wave5cond r25 | Death-count posture (first staging) | UNMEASURABLE (nondeterminism) | METRIC-BROKEN | Instrument noise-dominated; established det-gate rule + deterministic clock repair | Superseded by r27; don't retry without det-gate |

### Batch F: 2026-10-15 loop-B + arms (16 files; 3 not kills)

| Arm | Tried | Kill reason | Class | Real finding | Retry |
|---|---|---|---|---|---|
| aiddrain-b | Honest tendLink aids as rot drawdown | 1.014× vs ≤0.75 (clean null) | CONCEPT-DEAD | Aid is social verb not rot lever (teaspoon vs 36k–134k pantries); isolates feast-as-drawdown | Don't retry aid-as-drawdown |
| aidspoil-b | Spoil-first aid ordering | 1.32× (inverted); starvation 3→6 | CONCEPT-DEAD | Spoil-first drains tonight's food on fragile pantries — ordering-specific harm; weakens finding #273 | Don't retry this ordering |
| allowgate4-b | (GO — gate re-verified) | — | — | Substrate moved hard: control starvation 21→3 overnight — baseline drift hazard | Confirm with composite primary or 24–32 seeds |
| bankleg-b | Low-exposure pack-banking | 1.094 vs ≤0.70 | METRIC-BROKEN | 0.6×kcalCap mislabels thriving scholars as "starved" once skillsets multiply cap | Superseded by banklegrecal |
| banklegrecal-b | Same, corrected h1200 primary | Primary GO (0.512) but thirst guardrail 9 vs ≤2 | METRIC-BROKEN | Miss was the metric not mechanism (byte-identical 1.094 + GO 0.512); 9 deaths are villager collapse-thirst, mechanistically disconnected | Re-run after #285 resolved; rate-normalized guardrail |
| bankpath-b | deep_reserves interceptor in sheets | 0/33 sheets (no contact) | SUBSTRATE-MISSING | Probe caught structural zero pre-spend; full abilityChoices writer map reusable | Retry only after live offer route exists |
| belongfeast-b | (diagnostic GO) | — | — | **#259 ANSWERED: belong feast verb INNOCENT**; trust-throttled half-rations: villagers hungry with 24–34 fresh-days on shelves (DISTRIBUTION not quantity) | Trust-throttle channel is the named next |
| bowldecline-b | Decline communal bowl to delay trust bar | +1.9d vs +7d; starvation 2→7 | CONCEPT-DEAD | Day-4 crossing behaviorally unfixable — evidence FOR ledger-side fix (#340); pooled hunger-days vs starvation measure different things | Don't retry behavior-side; game-code ledger fix |
| carcasshaul-b | Villager map memory + cross-node HAUL | 0/16 hauls; median haulK 0 vs ≥1,500 | SUBSTRATE-MISSING | Knowledge gate never opens on baseline roads; byproduct: belltoad-legs bug fixed | Retry only with gate-opening substrate |
| dawngo-b | Leanest #314 draw variant | 0.862 vs ≤0.75; starvation 9 (8/9 one seed) | CONCEPT-DEAD | Draw side exhausted at every strictness (0.869/1.158/0.862); binding constraint is trust throttle | Never a fourth draw variant; trust-ledger-side next |
| dawnrefuse-b | (GO, landed) | — | — | det-gate + byte-identical sweep = strongest voice-only proof pattern | Closed |
| drinksafe-b | drinkSafe regex alignment | Byte-identical (inert) | SUBSTRATE-MISSING | Regex genuinely wrong but 0 on-wetland upkeeps — fill verbs must trigger **on arrival** not at upkeep | Rebuild as en-route fill trigger (rangerefill pattern) |
| feastdrawdown-b | Feast-only drawdown driver | 1.114× (clean null) | CONCEPT-DEAD | Closes "feast verb alone"; aidspoil 4× unexplained by either verb — candidates: 2-day floor, aid×feast interaction | Test 2-day floor feast-only |
| goinside-b | Real go-inside + dawn pack-lunch | 1.158 vs ≤0.60 | METRIC-BROKEN | Pooled hunger-days confound with survival (armed lived 25% longer; per-day hunger FELL); trust-tax: takes feed the throttle | Could return with corrected metric, but lineage says trust-ledger first |
| griefgift-b | Grief-grain credit → tribute arrears | 65,267 vs ≤37,928 | METRIC-BROKEN | Cumulative arrears confound with bond life (+37% bond-days); rate favors armed (0.88×) | Re-run with arrears per bond-week alive |
| hybridroad (10-15) | Deliberate pre-unlock wave-3 hunts | alive30post 4<5; median 97<105 | CONCEPT-DEAD | Readiness window structurally nearly empty (unlocks days before diplomacy answers); second falsification of hybrid | Don't retry; diagnostic on surviving unlock villages |

### Batch G: 2026-10-15/10-16 direct reads (24 arms)

| Arm | Tried | Kill reason | Class | Real finding | Retry |
|---|---|---|---|---|---|
| witnesslearn | Witness-reported kill sites | 0 vs ≥2 reports | SUBSTRATE-MISSING | Node-mate witnesses never wired; most deaths bypass fieldFight; reporter proven 31/31 | Wire npcsOnNode/defenders as witnesses |
| fieldports | Wire finale ports | No contact; punishments 1<2 | METRIC-BROKEN | Ports 35/35 proven; villagers correctly flee by round 2; metric conflated mechanism with contact | Split MECHANISM/CONTACT/ACTUATION |
| learnfight | Withdraw to observe hostile trick-bearers | +38 scholar / +47 villager deaths | CONCEPT-DEAD | Funnel works (+5 discoveries) but withdrawal takes free hits — "backs away while it hits you" | Needs non-flee witness verb or hostility gate |
| crumbs-b | Whole-piece pantry take | Empty-pantry-share 0.25→0.556 | METRIC-BROKEN | Steve redirected: 2,813-kcal slabs were granularity leak (fixed 0152a2ce); metric measured the leak | Re-run as default on granular substrate |
| counterres | Resolution-based counter confirm | 9 < 20 resolutions | SUBSTRATE-MISSING | Seat driver wins ~d89; trick game needs d81+; resolution rate stack-independent (~50%) | Measure on non-truncating substrate |
| apexroute | Survivor-biased apex memory | 1.109 vs ≤0.70 (wrong way) | SUBSTRATE-MISSING | One-round killers leave no reporters — same root as witnesslearn | Blocked on witness substrate |
| fieldroute | Apex-aware expedition routing | 1.109 vs ≤0.70; median −12d | SUBSTRATE-MISSING | **Policy cannot move villagers** (assignTask carries no destinations); 72% channel is villager-autonomous | Blocked on villager-movement verb |
| patrolassign | Patrols for threat-thinning | 0.703 vs ≤0.700 (miss by 0.003) | METRIC-BROKEN | Thinning WORKED (52 vs 74, 29.7%); missed 30% bar by 0.3pp — noise | Re-run with ≤0.75× bar or larger n |
| patrolwave | Wave-gated patrols | 1.314 vs ≤0.750 + guardrails | CONCEPT-DEAD | **No free lunch**: thinning costs lives 1:1.2; refusing costs more. Patrol line exhausted | Don't retry patrol variants |
| observefarm | Farm observations by watching | Discoveries 7→4 (wrong way) | CONCEPT-DEAD | Self-defeating: fewer engagements = fewer fights to observe | Don't retry |
| hauldrive-b | Kill→haul via revealed auto-haul | 1.64× vs 2×; starvation 3 vs ≤2 | CONCEPT-DEAD | TWO binds: meat never leaves corpse (79.7%) + knowledge gate can't open fast enough (35 reveals → 5 hauls). **Design contradiction** | Blocked on Steve's call (haul unrevealed vs other on-ramp) |
| monstermeat-b | Pack→mouth routing | Pool ~300 vs ≥10,000 bar | METRIC-BROKEN | Bar 30× pool — "kill was foregone conclusion"; layer works (rot 1.000→0.848) | Pool-relative bar (≥0.5× pool) |
| feastexposure | Feast fight-exposure gate | Median 111 vs ≥130 (primary passed) | METRIC-BROKEN | No mechanism; identical deed windows; "perturbation at n=8" | Larger n; median report-only |
| siegeroster | Muster beat for siege defense | 2.40→2.40 (zero) | SUBSTRATE-MISSING | Beat fires well but **no verb to move villagers off threatened tile** — narration without mechanism | Blocked on shelter/evacuate verb |
| siegedef2r | Watch/disengage discipline | Primary missed both bars | METRIC-BROKEN | Scholar protected (2 vs 5) but village died (d120/d97) — **wall lives in roster** | Villager deaths co-primary (§14c) |
| succevac | Successor-evacuate off besieged Haven | Primary HIT; median −33.5d | CONCEPT-DEAD | **Besieger pursues** ("It followed you"); mid-combat refusal — evac relocates chain, doesn't break it | Don't retry evac; answer the besieger |
| eveningmeal-b | Scheduled evening meal | 1.04× vs ≤0.75 (more hunger) | CONCEPT-DEAD | Dusk draw already fills to 95%; meal adds ~17 kcal/day vs ~4,900 burn. **"More fills" line exhausted** (dawnmeal/dawngo/sleepin/goinside all dead) | Structural: cap/burn/third intake |
| feastcost-b | Bread-credit pacing for wave-4 | P2 missed (unlock day flat) | METRIC-BROKEN | "P2 was the wrong instrument" — lever halved bread (P1 0.514); clock doesn't respond to bread | Primary: bread share at unlock |
| overdrawfloor-b | 3-day floor + fragility gate | 0.884>0.85; starvation 8>3 | CONCEPT-DEAD | Mitigations weakened mechanism (0.884 vs 0.503) without closing harm — structural trade-off | Don't retry mitigations |
| plentycap | Cap-only wave-4/5 (remove tooth) | Catastrophic: 22 vs 0 deaths, −65d | CONCEPT-DEAD | **"Faced tooth is not redundant — it is the tooth that protects lives"** | Don't retry; keep the tooth |
| readinessgate | Readiness gate for unlocks | 0.833 < 0.9725 | METRIC-BROKEN | Gate works; metric measures wrong population (gate shrinks 18→6; near-perfection bar on n=6) | Absolute-count or population-aware bar |
| spoilfirst-b | Spoil-first tribute ordering | Inverted 3.44× | CONCEPT-DEAD | Drains fresh, leaves preserved to rot — structural inversion | Don't retry |
| w5avoid2 | Wave-5 avoidance doctrine | Missed by 15d | SUBSTRATE-MISSING | Works where w5 surface exists (s33 111→145d) but 5/8 never reach wave 5 — can't move median | Condition on wave-5-reaching population |
| waterwatch-b | Village water-duty adaptation | 0.885× + median miss | SUBSTRATE-MISSING | #291 open: village-side adaptation needs engine-side trigger (Steve's call) | Blocked on engine trigger |

---

## Part 2 — Converging root causes (ranked by arms explained)

### RC1. Standing-gated wave unlocks never check combat readiness (design contradiction) — ~10 arms
dutyalone ("PLENTY ROAD TO WAVE 5 IS LETHAL"), feastr15-dutyalone, hybridroad ×2, proposelayer-r33 (diplomacy unlocks and kills), warroad (war lane unreachable by construction), wave4ready (readiness = coincidence detector), fifthlink-r26 (diplomacy → wave-5s), overdraw3 (feast-driven wave-5 0→5), raiddef→w5avoidance. Every road that buys Standing promotes villages into fights they can't win; no road reaches the gate AND survives what's behind it. **Needs Steve-level design/tuning answer** (Standing gates, warPerKill, diplomacy-bar speed, readiness signals), not another lever.

### RC2. Policy layers cannot move villagers (missing engine verb) — ~8 arms
fieldroute ("assignTask carries no destinations; the engine moves them"), siegeroster (narration without mechanism), fleedirect (0 firings — haven-bound), succevac (pursuit + mid-combat refusal), mantlebeat (policy never acts first), gorgcall (aidFight dormant), spiralverb (needs raid defense), w5avoid (clearing needs wave floor). **Build first:** engine-side villager-movement verb (shelter/evacuate/redirect) + aidFight routing. Until then, no more policy-side defense arms. Note succevac: even with the verb, pursuit breaks naive evac.

### RC3. The observation/witness substrate doesn't exist — ~6 arms
witnesslearn (witnesses never wired; most deaths bypass fieldFight), apexroute (one-round killers leave no reporters), counterres (horizon truncates before learning matures), learnfight (needs non-flee witness verb), observefarm (self-defeating), buildfund (scholar's own wave-3 encounters generate no observations). **Build first:** wire node-mate/defender witnesses to kill sites; then re-run dependents.

### RC4. Guardrails tighter than suite noise / median fires on perturbation — ~14 arms
allowancegate-b (×0.9 vs ±11), feastdoor-b (1.1× vs p90rel 0.409), tribgate-b (per-policy medians byte-identical, killed on rank interleaving), feastexposure (n=8 perturbation, no mechanism), overstock-b (no harm channel), sharepol-b (0.014 vs 0.051–0.151 spread), patrolassign (miss by 0.003), recconf/recoverylever (road-calibrated bars), siegedef3 (×0.70 assumed draw-dominance), w5avoid (3d on middle-seed median), griefgift (cumulative confounded), hungerdepth-b (absolute rot penalizes longevity). **Fix:** A/A calibration mandatory before registration; harm-specific guardrails binding, median report-only; rate forms alongside absolutes. (Needs Steve's call for the §14 escape hatch.)

### RC5. The trust throttle is the binding constraint on the scholar side — ~6 arms
dawngo, goinside, bowldecline, bankleg, belongfeast (trust-throttled half-rations: hungry with 24–34 fresh-days on shelves — DISTRIBUTION not quantity), mealonly ("removing the penalty stops the bleeding; only trust GAINS can heal"). Takes → v.takes → net<−5000 → trust drop → half-rations. Every pantry-draw lever compensates for the throttle while taxing it. #314 draw side exhausted at three strictness levels. **Named direction:** trust-ledger-side work (#340: bars read dated voluntary ledger).

### RC6. The carcass-haul gap starves the monster-meat line — ~5 arms
meat-r1 (97% rots unlooted), kitchen-r12 (fired 1× in 83d), carcasshaul-b (0/16 hauls; knowledge gate never opens), monstermeat-b (pool ~300/run; layer works, nothing to route), hauldrive-b (design contradiction: knowledge law vs monster diversity). **One fix serves several:** haul-the-carcass verb / longer spoil window / gate-opening substrate. Plus Steve's design call on the knowledge-law contradiction.

### RC7. Trajectory perturbation swamps small effects at 8–16 seeds — ~8 arms
overstock (0.638→0.978 reversal), siegedef3 (compensatory mortality), sharepol, per-seed rot ratios 0.10×–4.49×, snaregate (identical seeds differ under zero perturbation), tribgate-b. **Fix:** det-gates + A/A noise floors before trusting deltas; per-day-alive forms; treat opposite-moving per-day-alive as mechanism failure.

### RC8. Death telemetry systematically misleads — ~4 arms
scale-wall-r1/r2 ('combat' bucket mixes scholar kills with scholar deaths), r16 (37 successions unattributed; 25/91 bearer deaths misreported as 1/104), succombat (arena deaths report 'combat'), takedisc (cumulative takes punish survival). **Build:** bearer-death cause attribution; kind-split keys; (day, vid)-scoped scholar metrics (succession masking — trustgain-r31).

### RC9. The "more fills" food line is exhausted — ~5 arms
eveningmeal-b ("not closable by filling the same 2,400-cap bank more often"), dawnmeal, dawngo, sleepin, goinside. Bank already filled twice daily by reactive draws. **Redirect:** cap size, burn rate, third intake — not fill frequency.

### RC10. Fight EXIT substrate broken — ~4 arms
scale-wall-r1 (21,000-turn stuck fight; walk-to-edge ≠ exit), r3 (disengage without barrier-push = wasted turn), r16 (5,410 flee ticks, 0 'fled'), fleedirect (destination judgment never fires). **Missing:** destination-judged exit verb. (Converges with RC2.)

### RC11. No survivable road to wave 4 — ~4 arms
warroad (war lane unreachable: max 3/4 points in 150d), wave4ready (readiness = coincidence detector), r33/warroad controls (diplomacy unlocks and kills), hybridroad (crowds out diplomacy). The hybrid (fight AND court) is the remaining candidate (s66, s22). **Needs:** war-lane tuning (warPerKill, 4-point bar — design call).

### RC12. Moot-exile foreclosure — ~2 arms (+ diagnostics)
scale-wall-r6 (6/8 scale-push runs exiled in courtship window; exile guard blocks proposeLink + national). The courtship road dies at the moot, not the pantry. **Retry the axis:** theft-confrontation calibration, fair-share ledger, visible path back from exile.

### RC13. Baseline drift — ~4 arms
aiddrain (driver moves baseline 4×), allowgate4 (control starvation 21→3 overnight), griefgrain (forming set shifted), fifthlink-r22→r26 (0/2 → 5/8). **Rule:** same-sweep own control (#247) is load-bearing infrastructure; never fix a bar off an old screen.

### RC14. Zero-fire / precondition kills — ~5 arms
spoilgate (dawn sweepSpoiled owns window), fleedirect (0 firings), gorgcall (0 calls), triage (same pool as cook drive), drinksafe (0 on-wetland upkeeps). **Rule:** exposure pre-check + reachability proof before sweep spend (Steve's root-cause-first).

### RC15. The knowledge/offer pipeline is gated on the courtship road — ~3 arms
carcasshaul (village never learns), bankpath-b (deep_reserves 0/33 sheets), buildfund (recipe never arrives). Mechanisms proven sound die at the gate. **Rule:** exercise-feasibility probe before building any "village learns X / System offers Y" arm.

### RC16. Absolute metrics confound longevity with harm — ~5 arms
hungerdepth-b (absolute rot penalizes survival), overdraw3 (dual registration was the fix), goinside (pooled hunger-days vs per-day), griefgift (cumulative arrears vs rate), takedisc (v.takes conserved). **Rule:** rate forms + per-day-alive alongside every absolute.

### RC17. Killed arms' loudest value is often the secondary — ~6 cases
overstock's feast→table 0→5 (two pilots), raiddef's median 101→177d, succbrake's accidental recovery lever (+27.5d), belongfeast's trust-throttle channel, tribgate-b→tribdisc-b's gate lesson, beamfatigue resolving r15b's stalemate. **Rule:** mine secondaries for their own arms; don't bury them with the kill.

---

## Part 3 — Prioritized retry queue

### Tier 1 — METRIC-BROKEN, cheapest (corrected pre-registration; re-run now)
1. **fieldports** — split MECHANISM / CONTACT / ACTUATION (ports already 35/35)
2. **feastcost-b** — primary: bread share at unlock, not unlock day
3. **readinessgate** — absolute-count or population-aware bar
4. **patrolassign** — bar ≤0.75× (mechanism showed 0.703)
5. **monstermeat-b** — pool-relative bar (≥0.5× pool)
6. **scale-wall-r13** — deed-rung/table metric, not median survival
7. **prodthrottle-b** — absolute-rot metric on surviving suite
8. **allowancegate-b** — noise-calibrated bounds (proven-safe gate)
9. **griefgrain** — mechanism-matched metric (young-link seasoning/survival)
10. **siegedef3** — bar on draw's actual share (~1/3)
11. **crumbs-b** — re-run as default on granular substrate; judge absolute starvation
12. **siegedef2r** — villager combat deaths co-primary (§14c now requires it)
13. **tribgate-b** — median report-only, harm guardrails binding (cleanest case)
14. **overstock-b** — harm-specific guardrails, median report-only
15. **goinside-b** — hunger-days per 100 days alive (lineage says trust-ledger first, though)
16. **griefgift-b** — arrears per bond-week alive
17. **predcond** — per-firing metric + pattern-screened seeds
18. **recconf / recoverylever** — same-road, stratified/proportional bars
19. **sharepol-b** — noise floor from ≥2 invocations; bigger dose
20. **feastexposure** — larger n; median report-only (pending §14 escape-hatch call)

### Tier 2 — SUBSTRATE-MISSING, blocked (build substrate, then re-run)
1. **Witness/observation substrate** → unblocks witnesslearn, apexroute, counterres, learnfight-retry, observefarm-retry, buildfund (scholar observations). *Build: wire node-mate/defender witnesses to kill sites.*
2. **Villager-movement verb** → unblocks siegeroster, fieldroute, fleedirect, succevac-line (with pursuit handling), spiralverb (raid defense). *Build: engine-side shelter/evacuate/redirect + aidFight routing.*
3. **Carcass-haul substrate** → unblocks kitchen-r12, meat-r1, carcasshaul-b, monstermeat-b (pool), hauldrive-b (partially). *Build: haul verb / longer spoil window / gate-opening.*
4. **Standing/readiness design** → unblocks dutyalone-line, warroad, wave4ready, proposelayer-retry, hybridroad. *Needs Steve's design call:* combat-readiness check in unlock logic; warPerKill tuning.
5. **Knowledge/offer pipeline** → unblocks bankpath-b, carcasshaul-b, buildfund. *Needs exercise-feasibility probes; possibly Steve's call.*
6. **Horizon fit** → unblocks counterres (non-truncating substrate), w5avoid2 (wave-5-conditioned).
7. **Sanctuary semantics** → unblocks mantlebeat, succombat. *Steve's call #87.*
8. **Engine-side water trigger** → unblocks waterwatch-b (#291, Steve's call).
9. **Destination-judged exit verb** → unblocks fight-selection line (r1/r2/r3/r16/fleedirect).
10. **Bearer-death telemetry** → unblocks honest kill-cause analysis everywhere.

### Tier 3 — CONCEPT-DEAD, do not retry (value captured, lines closed)
learnfight, patrolwave, observefarm, hauldrive-b (needs Steve's call first), eveningmeal-b + fill line, overdrawfloor-b, plentycap, spoilfirst-b, succevac, courtkill-b, dinreserve-b, allowancegate-r15, overdraw3-b (as built; retry = aid+feast minus early tribute), proposelayer-r33 (as built), raiddef (as built; value = avoidance doctrine), rationtraj, succbrake (feed theory; value = recovery lever), hybridroad ×2, snaregate (gate number), matbank line (exhausted), mealonly-b (penalty side), takedisc, triage, tribdisc-b (as built), spiralcond/spiralverb (as built; value = cause taxonomy), wave5cond lineage (superseded), succombat, w5avoid (clearing doctrine), aiddrain-b, aidspoil-b, feastdrawdown-b, bowldecline-b (behavior-side), drinksafe-b (one-line), bankleg-b (superseded), dawngo-b, griefgift-b (as measured).

### Tier 4 — Steve's design calls needed (no arm can proceed without)
1. **Knowledge law vs monster diversity** (hauldrive-b): haul unrevealed meat or another on-ramp?
2. **§14 escape hatch**: METRIC-BROKEN kills get corrected re-runs; what proves "broken bar"?
3. **Sanctuary semantics** (#87): can killers re-engage successors at Haven?
4. **Standing/readiness**: combat-readiness check in wave unlocks? warPerKill tuning? diplomacy-bar speed?
5. **Armor L1 channel**: honest route to hide_armor knowledge?
6. **Batch verb scope** (packbank-b): should batch see counter/stash?
7. **Water trigger** (#291): engine-side village water-duty adaptation?
8. **Lingerer answer** (#161): wave-4/5 lingerers drivable or "Endure it"?

---

## Part 4 — Loop adjustments (addressing "so this doesn't keep happening")

These are the parent's to implement; recorded here as the audit's findings:

1. **Pre-pilot substrate checklist** (already in §§14b per Steve 2026-10-16): contact, pool sizing, verb existence, horizon fit. The audit shows ~15% of kills would have been blocked pre-spend.
2. **A/A noise calibration mandatory** before registering count/metric guardrails (RC4). The r25b rotcal precedent + feastdoor2's published noise floors make this a solved pattern.
3. **Kill taxonomy in every verdict** (§§14a): METRIC-BROKEN/SUBSTRATE-MISSING must not be filed as CONCEPT-DEAD.
4. **Exposure pre-check**: does the code path the lever touches actually fire on honest roads? (RC14: spoilgate, triage, takedisc, drinksafe.)
5. **Same-sweep own control** (#247): never compare against inherited baselines (RC13).
6. **Rate forms alongside absolutes** (RC16); **day-normalized cumulatives** (takedisc, goinside, griefgift).
7. **Secondary mining**: every kill's metric review must ask "does a measured secondary deserve its own arm?" (RC17).
8. **Stale-premise re-screen**: never fix a bar off an old screen; run a fresh screen first (fifthlink r22→r26, griefgrain).
9. **Roster co-primary** on all survival/defense arms (§14c — already added).
10. **Proof-degradation check** in kill protocol: proofs must degrade gracefully when the layer is deleted (r23 renegans, r21b matbank2 incidents).

---

*Audit compiled 2026-10-16 by subagent (parent: main agent). Sources: 127 killed-arm evidence files (2026-10-13 → 2026-10-16) via 6 parallel research batches + 24 direct reads. Prior 10-13→10-16 audit in ~/memory/2026-10-16.md extended backward to 10-11 (pre-§14 lever-verdict era noted, not reclassified).*
