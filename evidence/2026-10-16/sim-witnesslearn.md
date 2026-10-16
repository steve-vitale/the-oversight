# sim-witnesslearn — WITNESS-REPORTED KILL SITES for the trick-learning funnel (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop ARM sim-witnesslearn, run_id fleshout-20261016T1030Z (coordinator claim filed before any sims), axis scale-onramp (blocking).
**Type:** LEVER — game-code, WITNESSLEARN=1, default OFF (zero trace when off; the pilot's control is the same tree with the flag unset).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** the 2026-10-16 runs established the trick game is wired and executing (counterwire + apexhook), but LEARNING is the binding constraint: hyper-lethal species (The Eater 8/8 one-round kills; Spoiler/Timeslot 1-round) can never be learned under the 2-encounter observation bar because the dead don't report (sim-apexroute was killed at pilot on exactly this survivor-bias mechanism). If, when a one-round killer kills a villager, surviving witnesses (allies present at the kill, engine-grounded via party-wiring allyVids) report it — granting observation credit toward the species' trick — do witness-reported learning events for the hyper-lethal set appear?

**PRIMARY (binding):** witness-reported learning events for the hyper-lethal set (eater/spoiler/timeslot + other one-round killers; pre-registered set = eater, spoiler, timeslot, reunion, audit, editor, cancellation, eulogy, influencer) ≥2 on treatment vs 0 control. GO = treatment ≥2 AND control =0. A miss is NO-GO, never re-scored.

**GUARDRAILS (binding, all must hold):** national ≥ control−2; median survival ≥ control−10d; no new death mode; villager field deaths ≤ control+2. A miss on primary or any guardrail = KILL: game-code reverted to zero trace per the kill protocol; instruments + evidence land.

**Horizon:** 180d death-aware (wave-4 unlocks ~d76 on this substrate per apexpredators; death-aware, never fixed-window).

**Seeds:** 8 FRESH [921, 922, 923, 924, 925, 926, 927, 928] — verified 0 `-s<seed>.json` hits across evidence/ before the run.

**Policies:** leadfeast / belongfeast (the tribfloor courtship-road stack), x {control, treatment} = 32 runs, one sweep, own paired control. WITNESSLEARN=1 is the ONLY armed-side switch.

**Substrate:** FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE=0 explicit (pre-seat substrate, post-flip spelling; the win-side stack truncates the trick game per steve-call #411). WAVE5REACH/W3DRIVE off. Confirm (12–16 seeds) ONLY if pilot passes every gate.

**Gates before spend:** proof RED→GREEN (31 checks: unit credit/narration/discovery/negatives, end-to-end witnessed one-round vDie arcs, WITNESSLEARN-unset zero trace, det-gate byte-identical pairs, smoke); node --check on touched files; check.js --quick (see results — 1 pre-existing sprites failure, unrelated).

## The lever (src/js, all new code — no rewrites)

**The mechanism** — `noteWitnessReportedKill(vid, mid, witnesses)` (game.js, next to `_trickObservation`): when a villager dies in the field with living witnesses, the survivors bring the kill home — ONE observation credit toward the species' trick, on the shared `state.villageCounterObs` bar the survived-encounter channel feeds. One kill is one story no matter how many witnesses (the 2-observation bar stays meaningful). Never silent: the report is narrated at the fire (`🗡️ X came back with Y's story — watched the Z take them... (1/2)`); the discovery beat is framed second-hand (`💡 COUNTER LEARNED — ... (X watched it take Y — the village pieced it together from the death.)`). Waves-1-2 route through `discoverMonsterCounter(mid, 'witness-reported')` (honest viaLine added); wave-3+ set `state.villagerTricks`. Design calls (Steve 2026-10-07 — decided, documented for overrule): fires for ANY field vDie with living witnesses vs a trick-bearing species (not gated on round count); only our people report to our fire (roster-filtered — foreign allies tell their own village); a downed ally who wasn't standing at the kill is not a witness.

**The call site** — end of `fieldFight` (fieldFights.js), next to the non-lethal observation block: on `vDie` (vid ≠ 'player', WITNESSLEARN=1), the surviving witnesses = the joined ally still standing (`allyIn && allyHp > 0 && allyVid`) + the party-wired crew (`opts.allyVids`, up to 2). The dead don't report; the living witnesses do.

**Scope honesty:** the observation/trick-credit region of game.js + the witness/death region of fieldFights.js ONLY. Not the pantryDraw region, not the TB kill path, not the encounter-routing callers.

## Results

Sweep complete 2026-10-16 ~13:30 UTC: 32/32 runs finished (16 control + 16 treatment, 8 fresh seeds x 2 policies x 2 sides), 180d death-aware, 0 dropped runs. Per-seed JSONs: evidence/2026-10-16/perseed-witnesslearn/.

### PRIMARY: NO-GO (0 vs the ≥2 bar)

Witness-reported learning events for the hyper-lethal set:

| side | nHyperReports | nHyperCore (eater/spoiler/timeslot) | nWitnessReports (all) | nWitnessDiscovered |
|---|---|---|---|---|
| treatment | **0** | 0 | 1 (understudy, wave-2) | 0 |
| control | 0 | 0 | 0 | 0 |

The single treatment report (belongfeast-s926, day 66: Marisol brought Milo's story home after The Understudy killed him — 1/2, never reached discovery) proves the mechanism fires when witnesses exist. But the hyper-lethal set produced zero reports across 16 runs. Per the pre-registered binding gates: KILL.

### GUARDRAILS: ALL HOLD (primary already kills; recorded honestly)

| guardrail | control | treatment | bar | verdict |
|---|---|---|---|---|
| national | 6 | 6 | ≥ 4 | HOLD |
| median survival | 124d | 124d | ≥ 114d | HOLD |
| new death modes | — | none | none | HOLD |
| villager field deaths | 490 | 481 | ≤ 492 | HOLD |

Secondaries: table 13→13 · won 0→0 · wave-4 13→13 · wave-5 5→5 · max days 180→180 · trick executions 140→135 · deaths 606→598. The lever changed nothing measurable — consistent with a mechanism that fired once in 16 runs.

### VERDICT: KILLED AT PILOT

Primary NO-GO (0 hyper-lethal witness reports vs the ≥2 bar). Per the pre-registered binding gates: KILL. Game-code reverted to zero trace per the kill protocol (this commit); instruments (test with INFO-SKIP, sweep, analyzer) + this evidence + the 32 per-seed JSONs land; no trace of the lever remains in src/js. No confirm spend — the pilot did its job.

## Mechanism autopsy (secondaries + instrumented debug runs)

The lever fired MECHANICALLY — the proof test's end-to-end arc showed a witnessed one-round vDie granting observation credit with honest narration, and the pilot's single live report (understudy, d66) reads true. But the funnel is structurally empty. Three findings, all from instrumented debug runs on seed 921 (not inferred):

1. **Field vDie is rare and essentially never witnessed.** 133 field fights in 111 days → 5 vDie, and 0 of the 5 had any witnesses (allyVids empty at death). The party-wiring witness pool (`_outdoorCrew`-derived) was populated in only 5 of 133 fights — and those 5 resolved mFlee/vKill/vFlee, never vDie. The brief's model ("allies present at the kill, engine-grounded via party-wiring allyVids") does not describe the engine: at kill time, the crew is not there.
2. **The honest witnesses are never wired.** In wild encounters (`villagerMonsterTick` → `resolveWildMonsterEncounter`), the OTHER villagers on the monster's tile (`npcsOnNode`) are standing right there watching — but the encounter wires witnesses from `_outdoorCrew` (assignments), not from the node. In raids (`havenRaidTick`), the defenders fight raiders one at a time via the same path; the other defenders are at Haven, present — but again not wired. The node-mate/defender pool is the real witness surface; it is not in `opts.allyVids` on any path.
3. **Most field deaths don't go through fieldFight's vDie at all.** s921: 31 field deaths but only 5 fieldFight vDie. The death-cause ledger shows "combat" 380 vs "monster" 74 across the pilot — the TB path (companions dying in the scholar's fights, already witness-recorded via `fightWitnesses` in corpses.js, explicitly out of this arm's scope) dominates the killing. The field path this arm targeted is a thin slice of the mortality.

Net: a mechanically sound, proven reporter (31/31) with nobody to report to. The survivor-bias diagnosis from sim-apexroute stands, sharpened: it's not just that the dead don't report — it's that nobody is standing close enough to report for them, because the engine never puts witnesses at the kill site.

## Village assessment

The villages on the pre-seat substrate die the way the fork said — of combat, not hunger (starvation 6 both sides; the trick executions 135–140 show the counterwire/apexhook game is live underneath). Treatment and control are indistinguishable on every wall metric (national 6/6, table 13/13, median 124d/124d) — the lever was a ghost in the machine, firing once.

Who died: everyone, steadily — 481–490 field deaths across 16 runs, dominated by the TB "combat" channel (companions in the scholar's fights) and the field "monster"/"villager combat" channels. The hyper-lethal set (eater/spoiler/timeslot) killed without leaving a single witness report: the eater's trick remains unlearned on all 16 treatment runs, exactly the funnel finding that motivated this arm.

What was missing: witnesses at the kill site. The one report that did fire (Marisol/Milo/understudy, d66) shows what the lever was for — a real person bringing a real death home, the fire listening. It fired once in 16 runs because the engine almost never stages that scene.

The blank filled: witness-reported kill sites are measured and killed. The blank documented: the node-mate/defender witness pool is unwired — a future arm (needs coordinator scope approval; the encounter-routing callers are outside this arm's scope) could wire `resolveWildMonsterEncounter`'s witness pool from the villagers actually present (npcsOnNode / raid defenders) instead of `_outdoorCrew`, and this arm's proven mechanism would have something to report.

## Sense-reads (SENSE-TESTING LAW)

The single live report (belongfeast-s926-treatment, day 66) read in full context:

> 🗡️ Marisol came back with Milo's story — watched the The Understudy take them, and lived to tell it. The fire listens, and remembers. (1/2)

The fiction reads TRUE — a named survivor, a named dead, the fire listening — with one narration bug: "the The Understudy" (monsterDisplayName already carries the article post-System; the fix is the fieldFightSummary article-strip, documented for the next arm). The beat sits naturally among the day's other beats (pantry hauls, departures) — no template fingerprint, fires rarely, narrated honestly.

The death it reports also reads true in the per-seed JSON (Milo's death is attributed; the report is 1/2, correctly not yet a discovery).

## Metric review (§14)

- **The pre-registered metric did its job.** The ≥2 bar for the hyper-lethal set was honest: the arm's whole purpose was opening the hyper-lethal learning funnel, and 0 events in 16 runs is an unambiguous miss. No re-scoring, no revision needed — the bar measured exactly what mattered.
- **The guardrails were well-chosen.** All four held, which matters for the kill verdict: this was a clean mechanism miss, not a harmful lever. The field-deaths guardrail (≤ control+2) is the right shape for future witness arms — reporting must not cost lives.
- **Note for future arms:** the pilot's per-seed JSONs carry `witnessBySpecies`, which made the single understudy report visible. A future node-mate-witness arm should pre-register the same breakdown — the species distribution of reports is the mechanism's signature.

## Telemetry deviation check (Steve 2026-10-13)

`telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-16/perseed-witnesslearn/*.json' --metrics national,table,wins,exiled` fired 2 LOUD lines — both EXPLAINED, no baseline roll (same convention as sim-scale-wall-r17, sim-foodecon-b):

1. `LOUD: table swung 63%: baseline 16 -> current 26` — EXPLAINED: the check compares raw sums without n-normalization (baseline n≈16 runs, current n=32). Treatment and control are identical (13/13) — the lever did not move the table.
2. `LOUD: wins disappeared: baseline 16 -> current 0` — EXPLAINED: the baseline was seeded on the win-side substrate; this arm runs pre-seat (SEATDRIVE=0 explicit) where wins are 0 by design. Treatment and control identical (0/0).

## Convergence state

**killed-at-pilot.** The scale-onramp axis is not converged: the trick-learning funnel for hyper-lethal species remains closed. This arm joins sim-apexroute (survivor-memory routing) and sim-fieldroute (scholar routing) as measured dead ends on the "how does the village learn about one-round killers" question — each naming the next more precisely. The durable lesson: the witness surface is not the party-wiring (`_outdoorCrew`); it is the villagers actually present at the kill (node-mates, raid defenders), and wiring THAT pool is the named next arm. The mortality wall stands: 0/16 wins on the pre-seat substrate across both roads (national 6/16, table 13/16 — the table is reachable, the win is not).

## Per-seed JSONs

evidence/2026-10-16/perseed-witnesslearn/ (numeric wall-metric keys: won/wins/national/table/wave4/wave5/exiled as 0/1; nWitnessReports/nHyperReports/nHyperCoreReports/witnessBySpecies)

## Proof artifacts

- scripts/test-witnesslearn-20261016.js — proof: 31/31 RED→GREEN (unit, arcs, zero-trace, det-gate, smoke)
- scripts/sweep-witnesslearn-20261016.js — the paired sweep (WITNESSLEARN=1 vs unset)
- scripts/analyze-witnesslearn-20261016.js — the gate judge (reads the landed per-seed JSONs)
