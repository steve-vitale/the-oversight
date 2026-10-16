# sim-nodewitness — NODE-MATE/DEFENDER WITNESS OBSERVATION CHANNEL (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop ARM sim-nodewitness, run_id fleshout-20261016T0750Z (coordinator claim filed before any sims), axis scale-onramp (blocking).
**Type:** LEVER — game-code, NODEWITNESS=1, default OFF (zero trace when off; the pilot's control is the same tree with the flag unset).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** the 2026-10-16 runs established the funnel — hyper-lethal wave-4/5 species (THE EATER 8/8 one-round kills, the Audit, the Cancellation) are never learned under the 2-survived-encounter observation bar (apexhook pilot: eater/audit/cancellation 0 learnings across 16 runs), and sim-witnesslearn proved a witness-report mechanism (31/31) but died at pilot because its party-wiring witness pool was structurally empty at kill time (0/5 vDie witnessed). If the witness pool is wired from the villagers the engine actually stages at the kill — node-mates on the monster's tile (villagerMonsterTick's npcIds) and defenders at Haven (havenRaidTick), read live at kill time via npcsOnNode — do hyper-lethal trick learnings appear?

**PRIMARY (binding):** hyper-lethal trick learnings for the apexhook 0-learning set (eater, audit, cancellation — end-of-run presence in state.villagerTricks) > 0 on the treatment sweep. GO = treatment nPrimaryLearned > 0. Baseline 0/16 (apexhook pilot). A miss is NO-GO, never re-scored.

**SECONDARY:** trick executions vs the newly-hooked set (apexhook's APEX_TALLY_KEYS: poison, focus_followers, inefficient, wait:reunion-novel, continuity, offscript) ≥ 2 on treatment.

**GUARDRAILS (binding, all must hold):** national ≥ control−2; median survival ≥ control−10d; no new death mode. A miss on primary or any guardrail = KILL: game-code reverted to zero trace per the kill protocol; instruments + evidence land.

**Horizon:** 180d death-aware (wave-4 unlocks ~d76 on this substrate per apexpredators; death-aware, never fixed-window).

**Seeds:** 8 FRESH [931, 932, 933, 934, 935, 936, 937, 938] — verified 0 `-s<seed>.json` hits across evidence/ before the run.

**Policies:** leadfeast / belongfeast (the tribfloor courtship-road stack), x {control, treatment} = 32 runs, one sweep, own paired control. NODEWITNESS=1 is the ONLY armed-side switch.

**Substrate:** FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE=0 explicit (pre-seat substrate, post-flip spelling). WAVE5REACH/W3DRIVE off. Confirm (12–16 seeds) ONLY if pilot passes every gate.

**Gates before spend:** proof RED→GREEN (36 checks: unit credit/narration/discovery/negatives, end-to-end node-mate-witnessed one-round vDie arcs, m=null honesty, NODEWITNESS-unset zero trace, det-gate byte-identical pairs, smoke); node --check on touched files; check.js --quick (96 passed, 1 pre-existing sprites failure in test-sprites-valid-20261014.js — loads only sprites.js/godhood.js, files untouched by this arm).

## The lever (src/js, all new code — no rewrites)

**The mechanism** — `noteNodeWitnessKill(vid, mid, witnesses)` (game.js, next to `_trickObservation`): when a villager dies in a field fight with living node-mates/defenders present, the survivors bring the kill home — ONE observation credit toward the species' trick on the shared `state.villageCounterObs` bar (one kill = one story, no matter how many witnesses — the 2-observation bar stays meaningful). Never silent: the report is narrated at the fire (`🗡️ X came back with Y's story — watched the Z take them, and lived to tell it. The fire listens, and remembers. (1/2)`); the discovery beat is framed second-hand (`💡 COUNTER LEARNED — ... (X watched it take Y — the village pieced it together from the death.)`). Waves-1-2 route through `discoverMonsterCounter(mid, 'node-witnessed')` (honest viaLine added); wave-3+ set `state.villagerTricks`. Narration is deterministic (seatvoice precedent): no Math.random — reporter is the first roster witness, names via firstRef (knowledge-gated), monster via monsterNoun (sentence-safe; proper names keep casing, descriptors take "the" — never "the The X"). Design calls (Steve 2026-10-07 — decided, documented for overrule): fires for ANY field vDie with living node witnesses vs a trick-bearing species (not gated on round count — the hyper-lethal set kills in round 1, and that is the point); only our people report to our fire (roster-filtered); a witness who is down is not a witness.

**The call site** — end of `fieldFight` (fieldFights.js), next to the non-lethal observation block, NODEWITNESS=1 gated: on `vDie` (vid ≠ 'player'), the witness pool = roster node-mates on the monster's tile read live via `npcsOnNode(m.tx, m.ty)` (the wild path's npcIds, the raid path's defenders at Haven — the fight is synchronous inside the encounter tick, so nobody has moved) + the party-wired ally still standing (`helpCalled && allyIn && allyHp > 0 && allyVid`). Guarded on `m` carrying numeric tx/ty — the expedition shape (m=null) and contest shapes honestly yield no pool. Zero trace when the flag is unset (short-circuits before any state read; det-gate proven byte-identical).

**Non-lethal learning only:** withdrawing is lethal (witnesslearn's lesson); scholars die mid-withdrawal (learnfight's lesson) — this channel never asks anyone to flee. The witnesses were already there.

**Scope honesty:** the observation/trick-credit region of game.js (villagerTrickDefs/_trickObservation/villageKnowsTrick + discoverMonsterCounter's viaLine, its discovery half) + the witness/death region of fieldFights.js ONLY. Not the pantryDraw region, not the league-granary famine-draw region (loop B's live arm owns them), not the TB kill path, not the encounter-routing callers.

## Results

Sweep complete 2026-10-16 ~15:30 UTC: 32/32 runs finished (16 control + 16 treatment, 8 fresh seeds x 2 policies x 2 sides), 180d death-aware, 0 dropped runs. Per-seed JSONs: evidence/2026-10-16/perseed-nodewitness/. Analyzer: scripts/analyze-nodewitness-20261016.js.

| metric | treatment | control | bar | verdict |
|---|---|---|---|---|
| PRIMARY: hyper-lethal trick learnings (eater/audit/cancellation) | **2** | 0 | >0 | **GO** |
| — per-run | belongfeast-s932: eater; leadfeast-s932: cancellation | — | — | — |
| SECONDARY: trick executions vs newly-hooked set | 0 | 0 | ≥2 | NO-GO |
| node-witness reports (mechanism) | 15 | 0 | — | fires |
| node-witness discoveries | 4 (algorithm@d75 + 3 shared-bar) | 0 | — | — |
| national | 9/16 | 9/16 | ≥7 | HOLD |
| median survival | 136d | 136d | ≥126d | HOLD |
| new death modes | none | — | none | HOLD |
| table | 16/16 | 16/16 | — | — |
| wave-4 reached | 16/16 | 16/16 | — | — |
| wave-5 reached | 8/16 | 8/16 | — | — |

**PRIMARY: GO.** Two hyper-lethal trick learnings on treatment vs zero on control (baseline 0/16 from the apexhook pilot). Both learnings used the shared observation bar: the witness channel contributed the decisive observation.

**The shared-bar story (mechanism honesty):** the villageCounterObs bar is shared between the survived-encounter channel (_trickObservation) and the witness channel (noteNodeWitnessKill). The two primary learnings each had exactly 1 witness report + 1 survived encounter:
- belongfeast-s932 eater: d64 Caleb reported Katarina's death to The Eater (witness, 1/2) → d70 COUNTER LEARNED (survived encounter provided 2/2). Without the witness report, the single survived encounter would have left the bar at 1/2 — no learning.
- leadfeast-s932 cancellation: d84 Tom reported Joaquin's death to The Cancellation (witness, 1/2) → d85 COUNTER LEARNED (survived encounter provided 2/2).
- leadfeast-s932 algorithm: 2 witness reports → d75 COUNTER LEARNED via the witness channel alone (pure witness discovery — no survived encounter needed).

The witness channel is the ONLY writer of `via: 'node-witnessed'` tele events (control has 0 reports), and `state.villagerTricks` has exactly two writers (_trickObservation and noteNodeWitnessKill), so the attribution is airtight.

**SECONDARY: NO-GO.** Zero trick executions vs the newly-hooked set on both sides. The learnings arrived but did not convert to executions within the runs — the execution chain (learn → encounter again → meet trick conditions) is longer than the pilot window typically allows. The apexhook pilot's 2 executions came from the influencer (the least lethal of the six); the eater/cancellation tricks learned here never found their execution window.

### VERDICT: PRIMARY GO on the binding metric, SECONDARY missed → NO CONFIRM SPEND

Per the pre-registered gates: the PRIMARY (binding) is GO and all guardrails HOLD, so the arm is not killed. But "Confirm (12–16 seeds) ONLY if pilot passes every gate" — the SECONDARY gate missed, so no confirm spend. The pilot stands as the measurement: the node-mate/defender witness channel opens the hyper-lethal learning funnel (2 learnings vs 0 baseline, mechanism firing 15× with 4 discoveries), but learnings do not yet convert to executions.

## Village assessment

The villages on the pre-seat substrate die the way apexpredators said — of combat, not hunger — and this arm's channel touches only the learning margin. Treatment and control are indistinguishable on every wall metric (national 9/16 both, table 16/16 both, median 136d both, wave-4 16/16 both, wave-5 8/16 both) — the lever adds knowledge, not power.

Who died: everyone, steadily — 28–60 deaths per run, dominated by the TB "combat" channel and field "monster"/"villager combat" channels. The hyper-lethal set killed as before, but now the deaths teach: 15 witness reports across 16 treatment runs (eater 2, cancellation 1, editor 2, reunion 2, algorithm 2, plus wave-3/2 species). The dead still die — but the living who watched now bring something home.

Who thrived: the villages that learned. belongfeast-s932 (135d, wave 5) learned the Eater's trick from Caleb's report + a survived encounter. leadfeast-s932 (158d, wave 5) learned both the Algorithm (pure witness) and the Cancellation (shared). Knowledge arrived where the apexhook pilot found only darkness.

What was missing: **the execution window.** The tricks were learned but never used — 0 executions. The funnel is now open at the learning end (witness → theory), but the theory-to-practice step (learned → executed in a live fight) remains the binding constraint. The villagers know how to poison the Eater's meal; they haven't yet fed it one.

What the village had: the witness ritual itself — 15 times, a named survivor brought a named dead home, and the fire listened. The mechanism is culturally legible, not just mechanically functional.

The blank filled: the node-mate/defender witness pool is now WIRED — the encounter context's actually-present villagers (npcIds, raid defenders) report through the proven observation-credit mechanism. The blank documented: learning without execution is a half-open funnel; the next arm on this axis should address the execution window (trick conditions met in live fights), not the learning bar.

## Sense-reads (SENSE-TESTING LAW)

**Arc 1: belongfeast-s932, the Eater (d64 → d70) — the funnel opening.**

> 🗡️ Caleb came back with Katarina's story — watched The Eater take them, and lived to tell it. The fire listens, and remembers. (1/2)

Six days later:

> 💡 COUNTER LEARNED — The Eater: Poison the meal. It cannot tell good food from bad — it gorges, it does not chew, and it eats the grid first, you second. Feed it spoiled or diseased meat and watch it vomit out the fight...

The story reads TRUE. Katarina — a real villager — dies to The Eater, the 8/8 one-round killer that the apexhook pilot never saw learned in 16 runs. Caleb was on the same node, watched it happen, and lived. He brings the story home — not as gossip, not as a stat, but as a named death the fire remembers. The (1/2) is honest: one story is not a theory. Then someone survives an encounter — the second observation — and the village pieces it together. The Eater, the most lethal thing in the Mirror Draft, now has a known counter: poison the meal.

Meaning: a real death becomes real knowledge through a real social act (witnessing + reporting). Coherence: the beats chain — death → report (1/2) → survived encounter (2/2) → theory. No step is skipped, no step is free. Relevance: this is the exact species the funnel was built for, learned for the first time in measured sims.

The villagers act like people: Caleb doesn't "generate an observation credit" — he comes back with Katarina's story. The fire listens. That's a mourning ritual that happens to teach.

**Arc 2: leadfeast-s932, the Algorithm (d72 → d75) — pure witness learning.**

> 🗡️ Marta came back with Irena's story — watched The Algorithm take them, and lived to tell it. The fire listens, and remembers. (1/2)

Three days later, a second witness report (another Algorithm kill, another survivor), and:

> 💡 COUNTER LEARNED — The Algorithm: Lose on purpose — tank the prediction...

No survived encounter. No one lived through an Algorithm fight. Two people watched it kill, two people came home, and the village pieced together the counter from the deaths alone. This is the mechanism's purest form: the dead don't report, but the living who watched do — and two watchings are a theory.

Meaning: the village can learn about a one-round killer without anyone surviving it. Coherence: the 1/2 → 2/2 → discovery chain is the same shape as the survived-encounter channel, but the observations come from grief, not from living. Relevance: proves the channel works end-to-end on its own terms — the funnel is open even for species no one ever survives.

The villagers act like people: Marta and the second witness are doing what people do after a death — telling the story, trying to make sense of it. The theory that emerges ("lose on purpose — tank the prediction") is the village thinking together, not a UI unlock.

**Narration quality:** no "the The X" doubling (the monsterNoun fix holds — "watched The Eater take them", "watched The Algorithm take them" both read clean). The beats are deterministic (first roster witness reports — no RNG in the narration). Names are knowledge-gated via firstRef. The 🗡️/💡/fire-listens diction matches the established witness voice from the killed arm's sense-read, now with the article bug fixed.

## Metric review (§14)

- **The PRIMARY was met (2 > 0), and the spirit holds.** Unlike the apexhook pilot's "thin" GO (2 executions of one trick), these 2 learnings are exactly what the arm was built to produce: hyper-lethal species (eater, cancellation) learned for the first time in measured sims, with the witness channel contributing the decisive observation in both cases (shared bar: 1 witness + 1 survived). The mechanism didn't just fire — it made the difference between 1/2 (no theory) and 2/2 (theory).
- **The SECONDARY miss is informative, not a flaw in the primary.** Zero executions vs the ≥2 bar. The execution chain (learn → re-encounter → meet trick conditions like spoiled food on hand) is longer than the learning chain, and the pilot's 180d window with death-aware horizons doesn't guarantee a post-learning encounter. The secondary measured "does the system work end-to-end" — it doesn't yet, and that's the honest finding.
- **Proposed revision for the NEXT run:** split the funnel into two pre-registered primaries — (a) LEARNING: hyper-lethal trick learnings >0 (this arm's primary, now proven), and (b) EXECUTION: trick executions vs learned-via-witness tricks ≥1, with a per-species breakdown and the learning day recorded. The learning funnel is open; the execution funnel is the next question.
- **The guardrails were well-chosen.** All three held with wide margins (national identical 9/16, median identical 136d, no new death modes). The lever adds knowledge without perturbing survival — exactly what a learning channel should do.
- **No re-scoring:** the GO stands on the pre-registered PRIMARY. The secondary miss blocks confirm per the pre-registered "every gate" rule. The revision above is for the next run only.

## Telemetry deviation check (Steve 2026-10-13)

`telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-16/perseed-nodewitness/*.json' --metrics national,table,wins,exiled` fired 2 LOUD lines — both EXPLAINED, no baseline roll (same convention as sim-witnesslearn):

1. `LOUD: table swung 100%: baseline 16 -> current 32` — EXPLAINED: the check compares raw sums without n-normalization (baseline n≈16 runs, current n=32). Treatment and control are identical (16/16 each) — the lever did not move the table.
2. `LOUD: wins disappeared: baseline 16 -> current 0` — EXPLAINED: the baseline was seeded on the win-side substrate; this arm runs pre-seat (SEATDRIVE=0 explicit) where wins are 0 by design. Treatment and control identical (0/0).

## Convergence state

**converging.** The scale-onramp axis: the hyper-lethal learning funnel is now OPEN — the node-mate/defender witness channel fires (15 reports, 4 discoveries) and produced the first measured learnings of the eater and cancellation tricks (2 vs the 0/16 baseline). But the funnel is half-open: learnings do not convert to executions (0 vs the ≥2 bar), and the win remains at 0/16 on the pre-seat substrate. The next arm on this axis should address the execution window, not the learning bar.

## Per-seed JSONs

evidence/2026-10-16/perseed-nodewitness/ (32 runs: 8 seeds x {leadfeast,belongfeast} x {treatment,control}; numeric wall-metric keys: national/table/won/wins/exiled as 0/1; nNodeWitnessReports/nodeWitnessBySpecies/nNodeWitnessDiscovered/primaryLearned/primaryWitnessDiscovered/apexTally/apexExecutions) · beats: evidence/2026-10-16/nodewitness-beats/ (trick-beat captures per run)

## Proof artifacts

- scripts/test-nodewitness-20261016.js — proof: 36/36 RED→GREEN (unit, arcs, zero-trace, det-gate, smoke)
- scripts/sweep-nodewitness-20261016.js — the paired sweep (NODEWITNESS=1 vs unset)
- scripts/analyze-nodewitness-20261016.js — the gate judge (reads the landed per-seed JSONs)

## Blank-fill record

- FILLED (code): the node-mate/defender witness observation channel — `noteNodeWitnessKill` (game.js) + kill-time witness capture (fieldFights.js), NODEWITNESS=1 flagged, default OFF.
- FILLED (code): honest `node-witnessed` viaLine in `discoverMonsterCounter`.
- FILLED (proof): scripts/test-nodewitness-20261016.js (36/36 RED→GREEN).
- FILLED (instrument): scripts/sweep-nodewitness-20261016.js + scripts/analyze-nodewitness-20261016.js.
- FILLED (measurement): 32-run pilot (8 fresh seeds x 2 policies x 2 arms), PRIMARY GO (2 hyper-lethal learnings vs 0 baseline), all guardrails HOLD.
- DOCUMENTED (not fixed — out of scope): the execution window — learned tricks do not convert to executions within the pilot window (0 vs ≥2 bar); the next arm should address execution, not learning.
