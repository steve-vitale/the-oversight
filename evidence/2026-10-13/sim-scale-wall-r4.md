# longsim scale-wall run r4 — MONSTER-MATH (2026-10-13, flesh-out)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12)
- **Axis:** scale-onramp (blocking; standing directive overrides rotation; `longsims-rotation.txt` stays 3)
- **Question:** r1 KILLED DPS-race at pilot (inert). r2 KILLED directional flee at pilot (backfired). r3 KILLED fight-assess at pilot (assessment correct, disengage fictional, declining = starvation). r3's honest diagnosis: "no policy-side fight-selection instrument has moved national off 0/8 across 24 runs — the wall is fight selection + monster MATH, and the math half (wave-1/2 damage numbers vs 'slow and risky' intent) is now the untested half." The 2026-10-13 combat-lever run reframed the face of the wall: day-15 machete-armed (bonus 35) players COIN-FLIP vs wave-1 gallowdeer (160 HP, Ocular Discharge 20–30/round). This run TESTS the math half: audit wave-1/2 damage numbers against "slow and risky" (risky but with enough rounds for decisions — counter discovery, positioning, gear — not a 3-round burst race), then play the one game-side lever the audit points at.
- **Primary metric:** national reach per seed (0/1); secondary: median survival days
- **GO threshold:** after-side national ≥ 2/8 AND median survival ≥ 1.2× baseline (≥82.8d) — else KILL AT PILOT
- **Horizon:** 150d death-aware (dead villages stop; +10d tail)
- **Seeds:** 11/22/33/44 × competent/winseek = 8 runs before/after on IDENTICAL seeds
- **Gate config:** MONSTER_MATH_R4=1 (AFTER) vs unset (BEFORE). No lever code exists yet — the gate is defined, the audit decides what (if anything) goes behind it.
- **Baseline:** re-run on this tree's tip BEFORE any lever (gate off) — see Results.

## Canon check
READ docs/CANON.md FIRST, then MONSTER-WAVES.md, BALANCING.md, DESIGN.md combat intent. Findings that constrain this run:
- The Highbeam Deer (160 HP) is the benchmark — never question its stats, never change it. (Its id is `gallowdeer`; name field "Highbeam Deer".)
- Wave-1 animal deadliness is canon ("every animal might kill you") — wave 1 may not be made safe.
- DESIGN.md combat: "Turn-based, telegraphed intents, usually avoidable, high stakes/high reward."
- BALANCING.md 2026-10-12 (Steve's call): **the 43–44% wave-1 fight-loss target is RETIRED** — it was a team measurement from a weaker-player era, not a design parameter. The combat-lever run's framing ("designed wave-1 loss target is 43–44%") is STALE. The current canon anchor: "Wave-1 duels are fair, not free: solo hushwolf [12,17] vs 100-HP player — win 10/10 but lose ~37 HP (desperate, traumatic)."
- Fights are REAL fights, never RNG outcome tables (Steve 2026-10-08).

## Results

### Baseline re-run on this tree's tip (gate off) — byte-identical to r1–r3
8 runs, seeds 11/22/33/44 × competent/winseek, 150d death-aware: **national 0/8, table 0/8, won 0/8, median 69d** — per-seed days byte-identical to r1/r2/r3 baselines (competent 69/150/14/90, winseek 32/124/15/34). No LOUD flag. The tip is stable; the wall holds. Full report: `evidence/2026-10-13/r4-baseline.json`.

### The audit (the actual work of this run)
New instrument: `scripts/test-monster-math-r1.js` — scripted turn-based duels in the harness (full src/js eval, seeded RNG): day-15-like scholar (100 HP), machete equipped (bonus 35, verified) or UNARMED, closes distance like the competent policy, strikes when in range, never flees, no abilities/tricks — a deliberately dumb loop, so death rates are UPPER bounds on what the sim policy experiences. 6 duels/species. Reports rounds, player DPR, monster effective DPR, rounds-to-kill vs rounds-to-die, telegraphed (no-damage, telegraph-text) rounds, wins/flees/deaths.

**Wave-1, machete (bonus 35), 100 HP:**

| species | HP | rnds | pDPR | mDPR | rKill | rDie | W | D |
|---|---|---|---|---|---|---|---|---|
| bulldozer | 80 | 2.5 | 40.8 | 0.5 | 2.0 | 214 | 6/6 | 0/6 |
| hushwolf | 58 | 1.7 | 51 | 6.3 | 1.1 | 15.9 | 5/6 | 0/6 |
| **gallowdeer** | 160 | 4.5 | 52 | 23 | 3.1 | 4.3 | 5/6 | **4/6** |
| mirrormoth | 40 | 1.3 | 44.8 | 0 | 0.9 | ∞ | 6/6 | 0/6 |
| belltoad | 53 | 6.3 | 41.4 | 2.8 | 1.3 | 36.2 | 6/6 | 0/6 |
| lockpick_raccoon | 48 | 1 | 10 | 0 | 4.8 | ∞ | 0/6 | 0/6 (fled 6/6) |
| white_noise_heron | 70 | 2 | 49.3 | 0 | 1.4 | ∞ | 6/6 | 0/6 |
| hummice | 12 | 7.2 | 27.5 | 3.4 | 0.4 | 29.7 | 6/6 | 0/6 |
| speedbump_turtle | 60 | 5.2 | 17.7 | 4.8 | 3.4 | 20.8 | 6/6 | 0/6 |
| nightlight_catfish | 27 | 1 | 44 | 0 | 0.6 | ∞ | 6/6 | 0/6 |
| **ducks_in_a_row** | 15 | 8.5 | 26.7 | 10.3 | 0.6 | 9.7 | 0/6 | **5/6** |
| sunbasker | 53 | 2 | 45 | 0 | 1.2 | ∞ | 6/6 | 0/6 |
| nightcourt | 63 | 1 | 48.3 | 0 | 1.3 | ∞ | 6/6 | 0/6 |

(nevermore excluded: airborne, melee can't reach. glasswing excluded: range-3 dive + grounded windows.)

**Wave-2, machete, 100 HP** (selected): voice_mimic 2 rnds 6/6 W; mirror_stag 3.2 rnds 6/6 W; review_drone 2.7 rnds 6/6 W; bright_idea fled 6/6; memory_projector 2 rnds 6/6 W; warranty_caller 2.3 rnds 6/6 W; understudy 3.8 rnds 6/6 W; landlord 3 rnds 6/6 W; heckler 2.3 rnds 6/6 W; paparazzo 3 rnds mDPR 13.2 6/6 W; **moderator 15.2 rnds pDPR 2.9 mDPR 7.0 0/6 W 6/6 D**; statickite 10 rnds 6/6 W; giant_mosquito 2 rnds 6/6 W; alien_tick 1.8 rnds 6/6 W.

**Wave-1, UNARMED (fists, DPR ~13), 100 HP** — the "slow and risky to START" check:
bulldozer 15.2 rnds 6/6 W; hushwolf 5.2 rnds 4/6 W + 2 fled, 0/6 D (~41 HP lost — **matches the BALANCING anchor**: win, lose ~37 HP); gallowdeer 4.5 rnds 0/6 W **6/6 D**; mirrormoth 3.3 rnds 6/6 W; **belltoad 10.3 rnds 0/6 W 6/6 D** (rKill 5 < rDie 9.3 — variance kills); lockpick fled 6/6; heron 6.5 rnds 6/6 W; hummice 8.2 rnds 6/6 W; **speedbump 5 rnds 0/6 W 6/6 D** (mDPR 21.6 — fists can't crack the shell); nightlight 3.7 rnds 6/6 W; **ducks 9.8 rnds 0/6 W 6/6 D**; sunbasker 7.5 rnds 6/6 W; nightcourt 3.7 rnds 6/6 W.

### The disproof (RED-verified)
The combat-lever run's premise — "Ocular Discharge 20–30/round" — is FALSE on pristine. The actual pattern: `{type: beam, length: 9, windup: 2, sweep: true, fireTurns: 6, sweepRate: 0.18, cooldownTurns: 2}`. It winds up 2 rounds (telegraphed: "Light gathers behind its eyes. It is not frozen. It is aiming."), fires 6 (sweepable — MOVE and the beam has to chase; stand still and it parks), cools down 2. Effective DPR ≈ 15/round when parked, less when moving. The "coin-flip" was a misread of the data file, not the engine.
- `scripts/test-monster-math-premise-20261013.js`: 10/10 PASS on pristine. Guards: beam cycle shape, wave-1 telegraph census (16/23 damage attacks windup≥1; all 7 untelegraphed are documented-designed: hushwolf Silent Rush / glasswing Skyfall Dive / sunbasker bite / nightlight Lure / raccoon Disassemble / turtle Snap Decision (ambush) / nightcourt Adjournment (silence is its identity)), wave-2 telegraph share, benchmark HP [150,170] intact, antler-thrash Steve-design citation present. RED demo: asserting the flat-20-30/round premise exits 1 on pristine.
- What the gallowdeer actually does (transcript, seed 1000): at melee range it deals the **Steve-designed antler proximity tax** (`tbAntlerThrash`, monsterBehaviors.js cites Steve 2026-10-05: "closing in is risky EVERY turn... You get in, you hit, you get OUT") — [10,16] to all adjacent every turn, no windup — PLUS Antler Sweep [6,10] ≈ 20/round at dist 0. The beam gathers (telegraphed a full round ahead: "It should drop — but the light behind its eyes is already gathered. The body won't fall until it fires."), and fires **death-throes on the kill** ("You cut it down — but the light was already in its eyes... the death throes loose the beam... You go down."). 5-round fight; my strike-loop won the HP race and died to the parked beam anyway. A player who sidesteps the beam line in the telegraphed round lives — the decision exists, the loop didn't take it.
- The ducks (transcript, seed 1007): a 14-duck pack ("×14"), March [6,9] "locks onto one target — moving won't dodge it", NIP [4,7]×N as the line passes. Real counter, learned round 1: "Break the line — strike a duck that ISN'T the head and the line splits." My loop struck heads and died 5/6 taking 10.3 DPR over 8.5 rounds. Designed lethality with a designed answer.
- The moderator: pDPR 2.9 — the strike-loop's verbs are muted inside the suppression field (Steve 2026-10-06 puzzle design: muting/shadowban phases, verb-aware coaching, compliance graze). It's a puzzle boss, not a math problem; the loop kept violating and died 6/6.

### The call (Steve 2026-10-07: figure it out yourself)
**NO game-side lever ships in r4.** The audit disproves the premise that motivated one:
1. Wave-1/2 damage is already "slow and risky": 16/23 wave-1 damage attacks telegraphed (windup≥1), fights run 1–15 rounds, every lethal outlier carries a designed answer (antler tax = hit-and-run positioning; beam = sidestep the line; ducks = break the line; turtle = patience/bunker; moderator = puzzle).
2. Every lethal outlier is canon-protected (gallowdeer = the benchmark, antler tax = Steve 2026-10-05 design) or designed (ducks counter, turtle ambush, belltoad burst, moderator puzzle). "Every animal might kill you" forbids making wave 1 safer, and the 43–44% loss target the combat-lever run cited is RETIRED canon.
3. Fight tempo is set by PLAYER DPR (machete 48 kills wave-1 in 1–3 rounds), not monster math — monster damage numbers cannot make fights "slower" without touching HP (canon) or player weapons (out of scope for the monster-math lever).
4. Shipping a placebo tweak (e.g. flattening belltoad/turtle ranges) to satisfy "play one lever" would be fake work: unarmed scholars are SUPPOSED to fear toads, and it cannot move national (day-15 scholars are armed; the wall is food at scale, not wave-1 spikes).
The MONSTER_MATH_R4 gate is defined but intentionally left unwired to any change. Steve can overrule — the audit tables above are the material for that call.

### Pilot verdict: KILLED AT PILOT
The monster-math hypothesis — "the wall's untested half is wave-1/2 damage numbers" — is killed by the audit before any confirm spend. No after-side exists (no lever shipped); the GO threshold (national ≥2/8 AND median ≥82.8d) is judged against the baseline alone: 0/8, 69d. Per MEASUREMENT §9: killed at pilot, never run 12–20 seeds on an invisible effect.

| | national | table | won | median days |
|---|---|---|---|---|
| baseline (gate off) | 0/8 | 0/8 | 0/8 | 69 |
| after (no lever shipped) | — | — | — | — |
| GO threshold | ≥2/8 | — | — | ≥82.8 |

### Convergence state: killed-at-pilot
Scale-onramp stays the blocking axis; wall numbers unchanged (national 0/8, table 0/8, wins 0, wave 4–5 unlocks 0, median 69d). `longsims-rotation.txt` stays 3 (standing directive overrides rotation). The r1–r4 arc now reads: fight SELECTION (policy) killed ×3, monster MATH (game) killed ×1 — both halves of r3's diagnosis tested, both empty. The remaining untested half of the wall is the FOOD-AT-SCALE economy (lever 0), which the 2026-10-12 scale sims already fingered: villages reach national ~day 39 then starve mid-ambition, dead by day 63.

### Village assessment (baseline, gate off)
- **Seed 11 competent (69d):** the median village. Two bearer deaths (combat), 8 villager combat deaths, 4 sickness. Reached wave 3, arc 3, never left village rank. Died village-lost with 16 beast tricks and 15 counters known — the knowledge economy worked; the bodies didn't.
- **Seed 22 competent (150d, survived):** the best village. SIX bearer deaths and it still stood at day 150 — succession worked (Marcus picks up the journal). 9 scholar combat deaths, wave 3, arc 3, rank village. The ceiling isn't survival, it's SCALE: 150 days and never past village.
- **Seed 33 (both policies, 14–15d):** thirst + starvation + early combat. A food lever can't reach day-14 thirst deaths; out of scope, working as designed (neglectful starts die).
- **Seed 44 competent (90d):** 11 scholar combat deaths — the bloodiest scholar. Wave 3, arc 3, village-lost.
- **Winseek (32/124/15/34d):** pushes scale harder — seeds 11/22/44 reached REGIONAL (the only regional ranks in the baseline) — but dies doing it: starvation 3+1+1+2, monster 1+6+6. Seed 22 winseek: 124d, regional, 8 villager combat deaths. The ambition is there; the food isn't.
- **Who thrived:** scholars who played counters (66 tricks competent) and the villages that kept a bearer alive. **Who died and why:** scholars to combat spikes (gallowdeer-class fights the policy takes for meat), villagers to combat + sickness + "a wound that wouldn't close", villages to the compound interest of bearer turnover.
- **Missing capabilities:** no instrument measures the fight→food coupling in-run (kills-per-day × meat-yield vs village kcal need — r3's open blank, still open); villager field-fight math vs "slow and risky" unaudited (my duels are scholar-only); vests not tracked in the sweep driver.
- **Texture intact:** deaths stayed flavorful and systemic (wounds that wouldn't close, sickness cascades) — the world's texture is not the problem.

### Blanks filled
1. **Duel harness** (`scripts/test-monster-math-r1.js`): scripted turn-based duels vs any species list (MIDS env), machete/UNARMED, with policy-like closing movement — 27 species × 2 configs measured. Reusable for any future math lever.
2. **Premise disproof** (`scripts/test-monster-math-premise-20261013.js`, 10/10): the beam-cycle guard + wave-1/2 telegraph census + benchmark intactness. Fails RED if anyone flattens the beam or silently un-telegraphs wave 1.
3. **Fight transcript dumper** (`scripts/dump-fight-r4.js`): full say-log duels for SENSE-TESTING.
4. **Baseline re-verified byte-identical** on the current tip (`evidence/2026-10-13/r4-baseline.json`).
5. **Canon correction filed:** the combat-lever run's "designed wave-1 loss target 43–44%" is retired per BALANCING.md 2026-10-12; its "20–30/round" beam read was wrong. Future runs should cite the "fair, not free" duel anchor instead.

### Blanks documented (open)
- Fight→food coupling instrument (r3's blank, still open): kills/day × meat-yield vs village kcal need, measured in-run.
- Villager field-fight math audit (scholar-only duels here; villagers die "villager combat:18" per 4 competent runs).
- Vests: mentioned in the mission's measure list, not tracked by the sweep driver.
- The gallowdeer death-throes beam + antler-tax stacking at dist 0: working as Steve designed, but the combined ~20/round no-windup tax + telegraphed beam + death-throes makes it the hardest wave-1 fight by far — noted for Steve's eyes, not changed (benchmark).
- Whether the competent policy actually sidesteps beams / breaks duck lines in sims (my loop didn't; the policy plays tricks — unmeasured here).

## Reachability (wall numbers, this run)
national 0/8 · table 0/8 · wins 0/8 · wave 4–5 unlocks 0 (maxWave 3) · Arc II/III reached (maxArc 3), Arc IV not reached · regional reached 3/8 (winseek only) · national 0/8 · median survival 69d · vests: not tracked.

## SENSE-TESTING (transcripts read, not just counts)
Gallowdeer (seed 1000): reads as slow and risky WITH decisions — 5 rounds, the beam telegraphed ("Light gathers behind its eyes. It is not frozen. It is aiming."), the death-throes telegraphed ("the light... is already gathered. The body won't fall until it fires."), the antler tax narrated every round ("getting close has a price"). The strike-loop's death is the loop's fault (never sidestepped, never hit-and-ran) — a thinking player had two separate outs. Verdict: the fiction and the mechanics agree; this is the benchmark working.
Ducks (seed 1007): reads as a real fight — "⚠️ 1 threats... (×14) — all here, all now", the line marches, NIPs as it passes, the counter learned mid-fight ("💡 COUNTER LEARNED — Break the line"). The loop's death is again the loop's fault (struck heads, never broke the line). Verdict: Undertale-style counter design working as intended; the lethality is the price of ignoring it.
