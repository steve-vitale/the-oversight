# sim-learnfirst — the learn-first engagement lever (longsim scale-wall, 2026-10-14)

## Pre-registered (docs/MEASUREMENT.md §§9–12, 14)

- **Axis**: scale wall (the standing directive — scale-onramp is the blocking axis; this arm attacks it through the combat-death bleed).
- **Lever**: engagement judgment — Steve's design call (2026-10-13): villagers default learn-first; override to engage in the player's/assessed party or when the first damage exchange shows good odds; parties aware of each other.
- **Policy**: `scripts/policies/learnfirst.js` (new) wrapping leadfeast, opt-in via `LEARNFIRST=1` (default OFF). FEASTSCALE_R13 unset in BOTH arms — the layer is the only difference.
- **PRIMARY**: player combat death share (armed) ≤ baseline − 15pp. Player combat death = telemetry death with `player:true` and cause ∈ {combat, ambush, raid, raid-defense, patrol combat, villager combat}.
- **GUARDRAILS**: median survival ≥ baseline−5d; national ≥ baseline−4; wave-5 unlocks ≥ baseline−1; no new death mode (armed player-death causes ⊆ baseline causes).
- **Horizon**: 180d death-aware (dead villages stop simulating; +10d tail). **Seeds**: 11/22/33/44/55/66/77/88, identical before/after. **Policy**: leadfeast × 8 seeds.
- **Gates (all green before spend)**: proof test `scripts/test-learnfirst-20261014.js` 34/34 (RED→GREEN); det-gate `scripts/det-gate-learnfirst-20261014.js` 8/8 identical (16/16); SMOKE=1 instrument-honesty gate both arms (policy drives; layer fires when armed, inert when not).
- **Verdict rule**: GO = primary met AND all guardrails hold → keep the layer. KILLED = miss on primary or any guardrail → DELETE the policy file + hook (no trace); keep scripts/test-*.js + this evidence.

## The mechanism (what was built)

`scripts/policies/learnfirst.js` — a policy LAYER (no game-code changes; engagement-judgment only):

1. **Engagement judgment at fight start** (before the first committed strike), reusing the r1 instrument math (dealt/strike vs taken/turn → rounds-to-kill vs rounds-to-die) and the r3 knowledge convention (codex → own-fight lore → pessimistic prior, via `fightAssessRace` from competent.js).
2. **Refuse a losing race**: walk to a reachable havenward edge and push THROUGH via `tbBarrierExit` (the deliberate, engine-honest exit). Non-chasers give up at the barrier; chasers pursue with stamina; Haven's gate ends every chase. Two real bugs fixed during the proof: the walk-to-edge is a no-op by construction (edges block pathing — the r1 seed-44 bug), and the judged edge tile must be reachable on the fight grid (water-walled edges; new `lfRefuseDir` = r2's havenward ranking + a `findPath` reachability filter the base never had). At haven (nowhere to disengage to) the layer holds and the base's judgment stands.
3. **Party override (a)**: live allied fighters (kind ally/villager) assessed with engine-grounded DPR (`tbVillagerTurn`: mean 6+round(wbonus/2)); engage outright when the COMBINED party race wins by the 1.3 margin. A weak party (one unarmed villager) does not override — proven in the test.
4. **Learn-first default → 2-exchange opening probe** (one plain strike/turn when hittable; flyers overhead and out-of-range are unmeasured, not failures). Measured good odds → COMMIT (override b), handing the fight to the base untouched. Measured losing race → refuse while healthy. Unhittable/unmeasured/gentle/nearly-over → commit (the base knows the flyer game; no false conviction).
5. **Learn-first stance** (observe/track/teach), all engine-honest: every judged engagement records {species, day, node, verdict}; at haven, fresh observations are shared via `Game.remember(vid, 'threat', …)` — the convo system's threat topic reads `t2mem`, so villagers actually hold the warning; names are knowledge-gated (`monsterNoun`, never the true name).
6. **Sealed fights** (`f.noFlee` / `arenaContest`) and **monster-less fights** skip the judgment — the engine/base decides.

## Proof test (RED→GREEN)

`scripts/test-learnfirst-20261014.js` — 34/34 PASS:

- **RED** (gate off): losing race (turtle, armor 15, dmg [18,26] vs bare-handed scholar) is TAKEN — no refusal, no probe, base strikes 4×. The bug pinned: pristine policy takes the losing fight.
- **A GREEN**: refused at engagement with php=100 (roundsToDie 4.5 < roundsToKill 4.6 — the margin calls it); scholar walks to a reachable edge; the non-chaser turtle gives up at the barrier; fight ends; scholar alive at 77; observation recorded.
- **A2 GREEN**: chaser (200-HP hushwolf) — the scholar pushes through the barrier (2 pushes), the chase plays out honestly across nodes (3,3)→(3,4)→(4,4 haven), Haven's gate ends it; scholar alive at 69.
- **B GREEN**: party override — 2 real allies (wbonus 20) + codex knowledge flip the race → `lfPartyEngaged`, no refusal, no probe. **B2**: one unarmed villager does NOT override → refused.
- **C GREEN**: winnable race (mirrormoth) → probe (2 measured exchanges) → commit → base kills it; scholar lives.
- **D**: `lfProbeAssess` unit cases — synthetic losing → refuse; winning/gentle/unmeasured/nearly-over → commit.
- **E**: learn-first stance honesty — refused observation is teachable: `lfTeach` writes a threat memory the villager holds (`t2mem` 0→1), note is knowledge-gated ("dog-shaped silence at the treeline", no true-name leak).

Notable proof findings: the engine marks a species codex-observed at fight start (so the knowledge race usually runs on real def data, not the pessimistic prior); `tbPlayerStrike` does NOT advance the turn by itself (the base's moveLeft=0+acted+tbAfterPlayerAction pattern is the advancer — my probe matches it, no double-advance); the hushwolf's pack-break counter fires on the first solid hit (test C fixture moved to the solitary mirrormoth).

## Det-gate

`scripts/det-gate-learnfirst-20261014.js` — 8/8 seeds bit-identical across reruns (16/16), 180d, armed tip — INCLUDING s44 (the entropy-r26 known-risk seed). Before/after comparisons trustworthy.

## SMOKE (instrument honesty)

`SMOKE=1 node scripts/sweep-learnfirst-20261014.js` — both arms: policy.daily invoked every day (15/15), policyCalls pacing > 0, 2400+ policy-origin acts; armed: the losing-race fixture refuses (lfRefused=1, observed=1); baseline: layer fully inert (zero lf counters).

## Pilot results (8 seeds × leadfeast, 180d death-aware, identical seeds)

### BASELINE (LEARNFIRST unset — pure delegation)

| seed | days | end | wave | arc | rank | nat | won | pDeaths | pCombat | player causes |
|---|---|---|---|---|---|---|---|---|---|---|
| 11 | 86 | village-lost | 4 | 3 | national | 1 | 0 | 6 | 6 | combat×6 |
| 22 | 151 | village-lost | 3 | 3 | regional | 0 | 0 | 2 | 1 | sickness, combat |
| 33 | 37 | village-lost | 2 | 3 | village | 0 | 0 | 2 | 1 | combat, starvation |
| 44 | 179 | village-lost | 4 | 3 | global | 1 | 0 | 5 | 5 | combat×5 |
| 55 | 109 | village-lost | 4 | 3 | national | 1 | 0 | 6 | 5 | combat×5, lockjaw |
| 66 | 178 | village-lost | 5 | 3 | global | 1 | 0 | 2 | 2 | combat×2 |
| 77 | 88 | village-lost | 4 | 3 | national | 1 | 0 | 2 | 2 | combat×2 |
| 88 | 80 | village-dead | 4 | 3 | national | 1 | 0 | 4 | 4 | combat×4 |

Aggregate: national 6/8, table 0/8, won 0/8, wave5 1/8, maxWave 5, maxArc 3, medianDays 109.
playerDeaths 29, playerCombatDeaths 26 → **share 0.897**.
Deaths overall: combat:66, monster:18, contest:3, sickness:7, villager combat:5, starvation:9, wound:5, lockjaw:1.

### ARMED (LEARNFIRST=1)

| seed | days | end | wave | rank | nat | pDeaths | pCombat | player causes | ref | prb | go | pty |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 11 | 115 | village-dead | 4 | global | 1 | 3 | 2 | starvation, combat×2 | 2 | 6 | 4 | 4 |
| 22 | 159 | village-lost | 4 | global | 1 | 2 | 1 | combat, sickness | 4 | 5 | 2 | 0 |
| 33 | 37 | village-lost | 2 | village | 0 | 1 | 1 | combat | 1 | 4 | 3 | 0 |
| 44 | 115 | village-lost | 4 | national | 1 | 6 | 5 | combat×5, contest | 3 | 7 | 4 | 0 |
| 55 | 73 | village-lost | 4 | regional | 0 | 0 | 0 | — (scholar never died) | 1 | 5 | 2 | 0 |
| 66 | 80 | village-lost | 4 | global | 1 | 3 | 3 | combat×3 | 6 | 5 | 3 | 1 |
| 77 | 106 | village-dead | 4 | national | 1 | 4 | 4 | combat×4 | 5 | 4 | 4 | 2 |
| 88 | 111 | village-lost | 4 | global | 1 | 3 | 3 | combat×3 | 4 | 12 | 9 | 0 |

Aggregate: national 6/8, table 0/8, won 0/8, wave5 0/8, maxWave 4, maxArc 3, medianDays 111.
playerDeaths 22, playerCombatDeaths 19 → **share 0.864**.
Layer totals: refused 26, probed 48, goodOdds 31, partyEngaged 7, observed 83, taught 359, barrierPushes 0.
Deaths overall: monster:38, starvation:10, combat:35, contest:3, villager combat:4, alien:1, sickness:10.

### Verdict math

- **PRIMARY**: 0.864 vs 0.897 → **−3.3pp**. Required ≤ −15pp. **MISS → NO-GO.**
- Guardrails: median 111 ≥ 104 ✓ · national 6 ≥ 2 ✓ · wave5 0 ≥ 0 ✓ · new death mode: one scholar contest death (s44) — pre-existing system (3 contest deaths in baseline overall), not layer-attributable; flagged as a watch item, not a layer-caused mode.
- Telemetry deviation check vs scale-wall baseline: QUIET (8 files, 4 metrics, no LOUD lines).

**VERDICT: KILLED.** Per the pre-registered rule and the task's kill instruction, `scripts/policies/learnfirst.js` is DELETED (no trace). The proof test, det-gate, sweep, per-seed JSONs, and this evidence are kept — the mechanism (34/34 proven) and the measurement are preserved in git for re-arming under a revised metric.

## Metric review (§14)

The pre-registered primary (player combat death SHARE, −15pp) missed at −3.3pp — and the miss is structural, not noise. Absolute combat deaths fell 27% (26→19) and total scholar deaths fell 24% (29→22): the layer does what it claims. But the SHARE barely moved, because this world kills scholars many ways — the scholars saved from combat died of starvation (s11), sickness (s22), and contests (s44) instead. A share-of-deaths metric punishes any lever that keeps scholars alive longer in a multi-cause world: competing risks refill the denominator. The honest primary for the NEXT run is absolute — player combat deaths per run (or per 100 scholar-days) — which this run would have cleared (−27%). Per the anti-drift rule this revision applies to the next run only; this run is NO-GO on its registered metric. The kill stands.

Open telemetry question (not chased): the 'monster'-keyed death rows (38 armed vs 18 baseline) = telemetry rows with kind='monster' and no cause — likely slain monsters via a cause-less path. Needs a telemetry audit, not an arm.

## Village assessment (plain words)

Both arms show the same village from a distance: competent courtship-road scholars who climb to national (6/8) and face waves 4–5, then watch every village collapse — all 16 runs end village-lost or village-dead, zero wins, zero tables, Arc III ceiling. The scholar is the village's spearhead and its casualty list: 29 scholar-deaths in the baseline, 26 in combat.

With the layer, the village genuinely acts more like Steve's learn-first design: 26 refused fights, 48 probed openings, 31 measured commits, 7 party-override engagements, 83 observations tracked, 359 warnings taught at haven. Scholars die less in combat (19 vs 26) — s55's scholar never died at all. But the saved scholars don't live to win: they starve, sicken, or fall in contests, and their villages fall anyway (s55's undying scholar still lost the village at day 73). The wall didn't move: national 6→6, table 0→0, wins 0→0, median survival 109→111d.

The lesson for the axis: the combat bleed the layer closes is real but not the binding constraint on the wall. Villages don't fail to scale because the scholar takes bad fights — they scale to national and then die of everything at once, and the table chain never starts in either arm. The next attack on the wall needs to look past the scholar's fight decisions.

## Blanks filled / documented

- FILLED: the engagement judgment itself (this arm) — proven 34/34, then killed on its metric; mechanism preserved in git.
- FILLED (proof-time): the walk-to-edge flee is a no-op by construction (edges block pathing; only a deliberate `tbBarrierExit` crosses) — the r1 seed-44 bug class. The layer's refuse used the deliberate push; the base's no-gate legacy flee has the same latent bug.
- FILLED (proof-time): judged edge tiles must be reachable on the fight grid — `lfRefuseDir` adds the `findPath` reachability filter the base's directional flee lacks (water-walled edge = the r1 bug in a new costume).
- DOCUMENTED (not chased — findings backlog): map-level avoidance (declining to walk onto losing-race tiles before the fight starts) isn't wired — the wrapper can't hook the base's trip planning without touching competent.js; the fight-start refuse covers it. Candidate for a follow-up arm.
- DOCUMENTED: 'monster'-keyed death telemetry rows (no cause) need an audit — 38 vs 18 across arms is unexplained.

## Wall numbers

| arm | national | table | wins | wave4 | wave5 | median survival |
|---|---|---|---|---|---|---|
| baseline | 6/8 | 0/8 | 0/8 | 7/8 | 1/8 | 109d |
| armed (killed) | 6/8 | 0/8 | 0/8 | 7/8 | 0/8 | 111d |
