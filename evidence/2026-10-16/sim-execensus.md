# sim-execensus — the execution-window census on the landed nodewitness channel (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop ARM sim-execensus, run_id fleshout-20261016T1355Z (coordinator claim filed before any sims), axis scale-onramp (blocking).
**Type:** DIAGNOSTIC instrument — zero src/js changes, scripts/ + evidence/ only. Read-only census of the learning→execution funnel on the landed nodewitness channel (commit a2c02684).
**Named next from:** evidence/2026-10-16/sim-nodewitness.md ("the execution window — learned tricks do not convert to executions within the pilot window (0 vs ≥2 bar); the next arm should address execution, not learning") + steve-call #411 (open: "tricks must survive the win" — is the counter game allowed to be win-truncated? — NOT assumed here).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** the nodewitness pilot opened the learning funnel (2 hyper-lethal trick learnings vs 0 baseline) but its SECONDARY missed (0 executions). This arm measures the execution window: with NODEWITNESS=1, trace every witness-sourced learning (learning id → trick id → species) through subsequent live fights. For each learning, find every later live fight against that species where the trick's conditions plausibly held, and record whether the trick executed and what the outcome was (kill / flee / survive / villager died / trick fired but failed).

**PRIMARY (binding):** 100% attribution — every nodewitness-sourced learning in the 16 runs is traced to a classified execution outcome or an explicit no-opportunity verdict. A miss means the instrument is incomplete, not that the window is empty — re-check the instrument before concluding.

**Horizon:** 180d death-aware. Why: wave-4 unlocks ~d76 on this substrate (nodewitness pilot: wave-4 16/16); the trick game lives in the late game; death-aware per §10 (reachability lever: 150–200d; dead villages stop simulating).

**Seeds:** 8 FRESH [961–968] — verified 0 `-s<seed>.json` per-seed filename hits across evidence/ before the run (the word-boundary mentions in old files are spurious, e.g. "1,964 kcal").

**Policies:** leadfeast / belongfeast (the tribfloor courtship-road stack, same composition as the nodewitness sweep — the census is directly comparable to the pilot's treatment side).

**Substrate:** pre-seat courtship, FEASTSCALE_R13=1, SEATDRIVE=0 explicit, NODEWITNESS=1. Armed-only census (diagnostic) — no control; the substrate IS the landed channel.

**Answers required:** (1) do witness-learned tricks ever fire in live fights? (2) when they fire, what happens? (3) where does the funnel break — conditions never met, execution never attempted, attempted but failed?

**Gates before spend:** proof RED→GREEN equivalent (scripts/test-execensus-20261016.js, 38/38: unit token-map coverage, DET-GATE byte-identical trajectories with the full instrument attached vs bare, 5 synthetic attribution arcs, smoke); node --check on new scripts; no jest concurrency.

### §14b pre-pilot substrate checklist

1. **Contact:** the nodewitness pilot measured the phenomenon on this exact substrate (4 discoveries in 16 runs) — contact confirmed by the substrate's own pilot.
2. **Pool sizing:** the addressable pool is ~4–8 learnings per 16 runs (pilot-measured). The PRIMARY is 100% attribution, not a count bar — pool sizing doesn't bind it.
3. **Verb existence:** the funnel's verbs exist — field-AI trick gates (villagerTrickAction), TB performances (checkMonsterCounter), per-species trick logs. The instrument reads the engine's own gates; it invents no verbs.
4. **Horizon fit:** the pilot's learnings landed d65–d148; 180d death-aware contains the phenomenon.

## The instrument (all scripts/, zero src/js)

**scripts/sweep-execensus-20261016.js** — the census sweep. Read-only attach:
- tele wrap: `counter_observed {id,n,vid,via}` + `counter_discovered {id,via}` + death events, all seq-stamped by a fight counter (so "later fight" is exact, not day-granular).
- `villagerTrickAction` wrapper: every evaluation where the village knew the trick records {fightSeq, round, fired?} — the engine's own gate decides; the instrument just counts its answers. Aggregated per fight as {evals, fires, firedActions}.
- `fieldFight` wrapper (counterres pattern): per-fight {seq, day, vid, mid, wave, outcome, rounds, trickLog, knownStart, knownEnd} + gate aggregation + rec.log for trick-fired fights (sense material).
- `tbEnd` wrapper: per-TB-fight {seq, day, result, mids, perfs} where perfs = f.trickLogByMid per species (scholar performances).
- end-of-run: waveKillLog trick entries, _trickTally, node-witness reports by species.
- **Funnel classification** (`classifyLearning`, exported for the proof): per witness-sourced learning, every later fight vs that species is classified —
  - `evade` → **survive** (no contact); `alreadyDead` excluded (not a live fight)
  - trick has no field-AI gate → **un-actuatable** (herald, finale, rerun, timeslot, finale_crew, finale_opening — the engine's own documented gap)
  - evals=0 → **no-opportunity** (fight over before any trick turn: one-round kill, volley)
  - fires=0 → **conditions-never-met** (the engine evaluated the gate N×, never fired)
  - fired → outcome taxonomy: **kill** (trick present, brute-force kill) / **flee** (trick-driven vs engine) / **survive** / **villager died** (no trick) / **trick fired but failed** (trick fired, villager died or fled anyway)
  - TB path: per-species performances; w3+ species → **tb-n/a** (the scholar cannot actuate village tricks); w1/w2 → kill (trick-attributed or not) / flee / villager died / trick fired but failed.
- **Witness-sourced definition:** `counter_discovered` with via='node-witnessed' (the witness channel wrote the discovery) OR any discovery where the witness channel contributed ≥1 observation to the 2-bar before discovery (shared-bar — e.g. 1 witness + 1 survived). pure = witness wrote both observations; shared = it wrote the decisive one.
- **Det-gate:** the proof runs identical-seed 40d pairs with the full instrument attached vs bare — byte-identical digests (38/38 GREEN).

**scripts/test-execensus-20261016.js** — proof: UNIT (token map covers all 29 villagerTrickDef keys + every w1/w2 counter kind), DET (byte-identical), ATTR (5 synthetic arcs: eater poison→flee/trick-driven; eater without spoiled food→conditions-never-met; herald→un-actuatable; learning with no fights→no-opportunity; TB hummice shout captured+classified), SMOKE (20d census run, schema-valid).

**scripts/analyze-execensus-20261016.js** — the judge: PRIMARY verdict, funnel aggregation, the three questions.

## Results

Sweep complete 2026-10-16: 16/16 runs finished (8 fresh seeds × 2 policies), 180d death-aware, 0 dropped runs. Per-seed JSONs: evidence/2026-10-16/perseed-execensus/. Beats: evidence/2026-10-16/execensus-beats/.

### Wall numbers (context — pre-seat by design)

| metric | this census (16 runs) |
|---|---|
| national | 7/16 |
| table | 14/16 |
| won | 0/16 (pre-seat) |
| wave-4 reached | 13/16 |
| wave-5 reached | 5/16 |
| median / max survival | 115d / 180d |

### The learnings (8 witness-sourced)

| run | day | species | wave | store | bar |
|---|---|---|---|---|---|
| belongfeast-s967 | d112 | congregation | 4 | villagerTricks | shared |
| belongfeast-s968 | d74 | reunion | 4 | villagerTricks | shared |
| leadfeast-s961 | d128 | network_note | 5 | villagerTricks | shared |
| leadfeast-s963 | d25 | belltoad | 1 | monsterCounters | shared |
| leadfeast-s964 | d87 | reunion | 4 | villagerTricks | shared |
| leadfeast-s966 | d114 | eater | 4 | villagerTricks | shared |
| leadfeast-s966 | d122 | reunion | 4 | villagerTricks | shared |
| leadfeast-s968 | d124 | editor | 5 | villagerTricks | shared |

All 8 are shared-bar (witness + survived); the pure double-witness shape from the nodewitness pilot's algorithm did not recur in this census. 7/8 are w4/w5 villagerTricks; 1/8 is a w1 counter (belltoad/shout).

### PRIMARY: GO — 100.0% attribution (8/8)

Every witness-sourced learning is traced: 6 to classified post-learning fights, 2 to explicit no-opportunity verdicts (belltoad d25 — village died d71 with no later belltoad fights; reunion d87 s964 — village died d102 with no later reunion fights). Completeness argument: all three knowledge-write paths (`discoverMonsterCounter`, `_trickObservation`, `noteNodeWitnessKill`) emit `counter_discovered`, and the tele wrap is installed before `runDays` — no learning can escape the instrument.

### The funnel (post-learning fights)

| class | n | share of field |
|---|---|---|
| conditions-never-met | 13 | 65% |
| flee (trick fired) | 5 | 25% |
| trick fired but failed | 2 | 10% |
| tb-n/a (TB can't actuate w3+) | 4 | — |

**Executions: 7 — all `bad_note` (network_note), all on leadfeast-s961.** Zero executions for congregation (3 fights), reunion (3 fights), eater (2 fights), editor (5 fights), belltoad (0 post-learning fights).

### The three questions

**(1) Do witness-learned tricks ever fire in live fights?** YES — but only one trick type fired in 16 runs: the Network Note's `bad_note` (7/7 post-learning fights). Five other traced learnings produced 13 post-learning fights with ZERO executions.

**(2) When they fire, what happens?** `bad_note` fired 7× → 5 villager flights, 2 villager deaths. The trick does exactly what the fiction promises (R2: "NOTE: 'THE WOLF SHOULD BE SMALLER' — the memo 'fixes' it into uselessness. The lasers never arrive.") — but the fights are still lost on damage. The trick is a debuff, not a fight-ender. Tricks buy survival, not damage (counterres) — and here the debuff didn't even buy survival.

**(3) Where does the funnel break?** Two places, measured:
- **Conditions never met (13/20 field fights, 65%).** The engine's own gates said no. The gates assume multi-round fights or material preconditions, but w4/5 field fights end in round 1–2:
  - congregation/argue needs round%3===0 → all 3 fights ended round 1 (vFlee/vDie).
  - editor/continuity needs 2 consecutive strikes → 4/5 fights ended round 1, one round 2.
  - eater/poison needs spoiled food on the fighter → 2 fights, gate evaluated, never fired (nobody carries spoiled meat).
  - reunion/novelty needs 2 strikes thrown → fights ended round 1–2.
- **No-opportunity (learnings): 2/8** — the village died soon after learning (d71, d102) with no later fights vs those species.
- The TB path contributed 4 fights, all tb-n/a (scholar cannot actuate w3+ village tricks — correct, not a break).
- Un-actuatable: 0 in this census (no herald/finale learnings landed).

**The design-level finding:** the wave-4/5 trick gates were built for signature-mechanic pacing (multi-round duels where the fighter chooses), but field fights against hyper-lethal species are one-round massacres. The villagers KNOW the tricks — the engine evaluates the gates every round — but the fights don't last long enough for the conditions to arise, or the material precondition is never satisfied. The ONE gate that fires unconditionally on round 1 (`bad_note`: `!rec.badNotePlanted`) fires every time — and still doesn't change outcomes, because it's a debuff in a damage race.

## Village assessment

The villages that reached the trick game look like villages that learn but can't apply. The fire teaches (8 witness-sourced learnings, all shared-bar — the village piecing it together from deaths AND survivals), and then the fighters walk out and die in round 1 holding the knowledge. The cruelest arc is the eater on leadfeast-s966: d114 the village learns "Poison the meal" from a witnessed death + a survived encounter; d118 Zoe dies to the Eater in round 1 — the poison gate evaluated once, never fired, because she carried no spoiled meat. The knowledge is real; the material isn't.

Who died: everyone, steadily — the funnel's own fights are 1–2 round affairs against w4/5 species (vFlee/vDie). The two no-opportunity learnings are villages that learned and then died (d71, d102) before the knowledge could be used.

What was missing: **not knowledge, not courage — applicable conditions.** The tricks' gates don't match the fights' shape. The villagers fight like they know things when the gate lets them (Nora plants the bad note on round 1, proactively — see sense-reads).

The blank filled: the execution window is now MEASURED — learning→execution funnel with per-fight gate attribution, 8/8 learnings traced. The blank documented: the gate/fight-shape mismatch (multi-round trick conditions vs one-round hyper-lethal fights; material preconditions never stocked).

## Sense-reads (SENSE-TESTING LAW)

**Arc 1: leadfeast-s961, the Network Note (d128) — the trick fires, the fight is still lost.**

> 💡 COUNTER LEARNED — The Network Note: Give it bad notes. It is support — it takes suggestions. Plant a terrible idea ('the wolf should be SMALLER') and the memo 'fixes' the enemy into uselessness: the lasers never arrive...

Hours later, Nora walks into the fight and on round 1 — before taking any damage — leans to the memo:

> R1: Nora leans to the memo: 'the wolf should be SMALLER.' It writes it down.
> R1: Per My Last Email hits Nora for 26 (68 left)
> R2: NOTE: 'THE WOLF SHOULD BE SMALLER' — the memo 'fixes' it into uselessness. The lasers never arrive.
> R2: Just Fix It hits Nora for 41 (27 left)
> R2: Nora's eyes go red... (vFlee)

Meaning: Nora fights LIKE SHE KNOWS SOMETHING — proactive, round-1, the correct trick, no hesitation. The trick WORKS as the fiction promises (the buff note misfires, "the lasers never arrive"). And she still loses on damage and flees. Coherence: the execution is legible, the fiction is honest, the outcome is a damage race the debuff doesn't touch. Relevance: this is the ONLY trick that fired in 16 runs, and it shows the execution arm's real problem — firing isn't the same as mattering. A person acting with knowledge, correctly, and still losing.

**Arc 2: leadfeast-s966, the Eater (d114 → d118) — the trick never fires, and the absence reads as a material gap.**

> d114 💡 COUNTER LEARNED — The Eater: Poison the meal. It cannot tell good food from bad — it gorges, it does not chew, and it eats the grid first, you second. Feed it spoiled or diseased meat and watch it vomit out the fight...

> d118: Zoe fights the Eater. Round 1. The poison gate evaluates once — no spoiled food — and never fires. The Eater kills her in round 1.

Meaning: the village KNOWS — the discovery beat fired, the knowledge is in the state, the gate was consulted. Zoe doesn't walk in ignorant; she walks in unstocked. Nobody carries spoiled meat into a fight — why would they? The beat says "feed it spoiled or diseased meat" as if the meat were to hand, but the trick's material precondition lives nowhere in the village's habits. Coherence: the absence doesn't read as stupidity or cowardice — it reads as a plan that requires a pantry run nobody makes. A person acting with knowledge would need the knowledge to be ACTIONABLE, and "carry rotten meat everywhere just in case" isn't actionable without a system that stocks it. Relevance: the funnel's sharpest break isn't behavioral — it's logistical. The trick is a recipe with no ingredients.

## Metric review (§14)

- **The PRIMARY (100% attribution) was met (8/8) and the spirit holds.** It bound the run: it forced seq-stamped tele capture + per-fight gate-eval aggregation, which is what makes the funnel airtight (the engine's own gates testify "conditions never met" — no inference). The completeness argument is structural (all three write paths emit `counter_discovered`), not statistical.
- **The pure/shared relabeling is a measurement refinement, not a re-score.** The sweep's stored `witnessSourced` used the via-only rule; the analyzer applies the observation-count rule (pure = witness wrote both observations on the 2-bar). All 8 learnings are shared-bar in this census — the witness channel was decisive in every case, but always alongside a survived encounter. The PRIMARY doesn't depend on the split; no verdict changes.
- **No re-scoring:** the funnel classes are exactly as pre-registered (kill / flee / survive / villager died / trick fired but failed + the break stages). The "flee, engine" sub-class for bad_note fights is reported honestly — the trick fired but the flight was the engine's morale, not the trick's design.
- **Proposed revision for the NEXT run:** none needed for the instrument. The next arm is an execution arm (game-code), and its pre-registration should split the funnel: (a) gate-fire rate per trick (the instrument measures it), (b) outcome movement on identical seeds. The instrument is reusable as-is.
- **The guardrail question:** this census ran no guardrails (diagnostic, armed-only, no lever) — the wall numbers are reported as context, not judged.

## Named next — the execution arm's design options (NOT picked)

Steve-call #411 stays open (win-truncation is not assumed; this census ran pre-seat precisely to isolate the gate problem from the truncation problem). The measured fact for the execution arm: **w4/5 trick gates assume multi-round fights or stocked material preconditions; w4/5 field fights are one-round massacres with unstocked fighters.** The design options, named without picking:

1. **Condition-widening:** relax the field-AI gates for hyper-lethal species (round-1 gates like `bad_note`'s, which is the only gate that fired). Risk (root-cause lens): widening the gate doesn't change that the trick is a debuff in a damage race — bad_note fired 7/7 and changed 0 outcomes.
2. **Material-precondition sourcing:** the eater's poison needs spoiled food ON THE FIGHTER. Villagers never carry it. Something would have to stock it (pack habit? pantry draw? pre-fight prep?) — a logistical system, not a gate tweak.
3. **Earlier learning:** learn tricks earlier for more post-learning fights. The census suggests this misses the point: the break is gate-conditions vs fight-shape, not learning timing (6/8 learnings HAD post-learning fights; the gates still said no).
4. **Gate/fight-shape alignment:** the deeper mismatch — multi-round trick conditions vs one-round hyper-lethal fights. Either the tricks need round-1 forms or the fights need to last longer. This is the root-cause candidate; the execution arm should test it before widening gates.
5. **Win-survival (steve-call #411):** orthogonal — on win-side stacks the trick game is truncated before it matures (counterres). An execution arm on the win-side stack would need the matched non-winning formulation.

## Convergence state

scale-onramp: **converging** (diagnostic arm — measures, does not move). The execution window is now measured end-to-end: the learning funnel is open (8 witness-sourced learnings, all shared-bar), the execution funnel is quantified (7 executions, all one trick; 65% conditions-never-met; the gate/fight-shape mismatch named). The next arm on this axis is the execution arm (game-code), with the design options named above.

## Telemetry deviation check (Steve 2026-10-13)

`telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-16/perseed-execensus/*.json' --metrics national,table,wins,exiled` fired 1 LOUD line — EXPLAINED, no baseline roll:

1. `LOUD: wins disappeared: baseline 16 -> current 0` — EXPLAINED: the baseline was seeded on the win-side stack (national 12, table 16, wins 16); this census runs pre-seat (SEATDRIVE=0 explicit) where wins are 0 by design. Same substrate-mismatch class as the nodewitness arm's finding — not drift. national 7/16 and table 14/16 are the same class (pre-seat vs win-side), below the check's LOUD thresholds.

## Per-seed JSONs

evidence/2026-10-16/perseed-execensus/ (16 runs: 8 seeds × {leadfeast,belongfeast}; numeric wall-metric keys national/table/won/wins/exiled; witnessLearnings + funnel per learning with per-fight classifications) · beats: evidence/2026-10-16/execensus-beats/ (say beats + trick-fight logs for sense-reads)

## Proof artifacts

- scripts/sweep-execensus-20261016.js — the census sweep (attachExecensusCapture + classifyLearning + trickTokensFor; zero src/js)
- scripts/test-execensus-20261016.js — proof: 38/38 GREEN (unit token-map, DET-GATE byte-identical, 5 synthetic attribution arcs, smoke)
- scripts/analyze-execensus-20261016.js — the judge (PRIMARY verdict, funnel aggregation, the three questions)

## Blank-fill record

- FILLED (instrument): the execution-window census — seq-stamped learning→fight tracing with per-fight gate-eval capture (the engine's own gates testify).
- FILLED (measurement): 16-run census (8 fresh seeds × 2 policies), PRIMARY GO (8/8 attribution); the funnel quantified (7 executions, all bad_note; 13/20 conditions-never-met; 2 no-opportunity; 4 tb-n/a).
- FILLED (sense): two transcript reads — the trick firing but not mattering (Nora/bad_note), the trick never firing for want of material (Zoe/eater).
- DOCUMENTED (not fixed — the execution arm's job): the gate/fight-shape mismatch (multi-round trick conditions vs one-round hyper-lethal fights; unstocked material preconditions); the 6 un-actuatable defs (herald, finale, finale_crew, finale_opening, rerun, timeslot); TB-path cannot actuate w3+ village tricks.
- DOCUMENTED (metric): the pure/shared relabeling (observation-count rule vs via-only rule).
