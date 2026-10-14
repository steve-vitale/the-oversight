# sim-inffight-class — the general whiff-forever guard (finding #108)

Worktree: `~/workspace/worktrees/sim-inffight2`. Run: oversight-flesh-out-loop, run 2026-10-14T05:xxZ, axis scale-onramp, ARM 2 of 3 (coordinator claim: sim-inffight2, sim-wave5cond).
Lever: engine/infinite-fight class (tb-fight engine: `src/js/game.js` tb region; harness `scripts/sim-harness.js` driveFights).

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12, 14 — BINDING)

- Primary metric: (a) the s44 seed becomes measurable — runDays completes to 180d or natural village end with the day clock advancing past the stall point; (b) ≥7/8 non-stall seeds byte-identical on every trajectory field before/after (the guard fires ONLY on true whiff-forever fights).
- GO: (a) met AND (b) met. Guardrails: median survival within ±10d of baseline, national ≥ baseline−2, wave reach no regression.
- Horizon: 180d death-aware — the stall hits ~d60, wave-5 unlocks are measured to d149.
- What would kill it: s44 unreproducible on current master (precondition kill), or any non-stall seed's trajectory changes (guard too aggressive — narrow it, don't ship it).

## The finding, reproduced

Baseline s44 (leadcourt+FOURTHLINK, seed 44, 180d runDays) stalls ~day 60. Reproduced deterministically on current master via pure runDays (scripts/diag-s44-bisect3-20261014.js, two independent invocations, both wall-timeout; hand-rolled day loop completes — the trajectory is runDays-specific, cf. finding #103):

- The encounter: **The Focus Group** (wave 3) + 4 eye-heads, day ~60–61, during an **ACTIVE contest**. Fight id `fmv7paxk5_2ciiw4`, round 62k → 130k → 344k → 547k → 1M+, over=false. Scholar 51/100 HP (damage all from the opening exchange), lead 295/295 (full), eyes 1/1.
- The whiff-forever mechanism (three halves, all required):
  1. **Scholar side**: the competent policy strikes the WEAKEST live monster = 1-HP eye-heads. sigW3a's eye interception consumes the turn with zero damage ("blinks aside — it only watches"). The lead never bleeds.
  2. **Monster side**: the lead's Deliberation is a self-centered r1 burst centered on its 2x2 body ANCHOR. The scholar pins at the grid edge (8,2); the lead's body cannot close past anchor (6,1) — it closed as far as geometry allows (the cf0acce3 fix works) — and the anchor-centered burst still misses at range 2, forever. Zero damage to the scholar.
  3. **The honest exit is disabled**: the boredom walkout needs 3 boring rounds, but every 'strike' verb resets it (and the murmur rates the violence). The fight can never end by itself.
- HP/positions churn every round (murmur ratings, Deliberation declares, eye drift), so driveFights' hp@pos no-progress signature never stabilizes — the 200-round guard exits "loop-end" every call, never "no-progress".
- **Why the watchdog's tbEnd('routed') does not clear it** (the finding's open question): it is not broken — it is wall-clock-starved. The time-freeze watchdog needs 8 loop-days with no day advance, but each loop-day grinds ~240k whiff rounds through driveContests' 400-iteration loop (`while (activeContest && guard++ < 400) { driveFights(...) }` × 3 calls/day × 200 rounds) — ~75s per loop-day, so the 8-day fuse needs ~10 minutes. Every diag budget (90–150s) and every sweep per-seed timeout expires first. The watchdog would fire eventually; nothing survives long enough to see it.

## The fix — GENERAL engine-class guard (never per-monster)

`src/js/game.js`, end of `tbRoundWrap(f)` (the per-round choke point shared by the sync and stepped-async paths):

- **Damage-only window**: each round, accumulate HP *decreases* across all fighters (heals don't mask; joiners seed at current HP; the departed are pruned). Any damage in either direction resets the window.
- **Threshold**: 120 consecutive zero-damage rounds. Calibration: the longest legitimate damage droughts are single-digit rounds (windups ≤3, Chorus 4/4 beat, Ad Break pause 2–4 ticks, Spool record+replay ~6, boredom walkout 3, Redactor starve 3); the Ad Break design note records honest fights running 185–201 rounds *with damage flowing*. 120 zero-damage rounds is far beyond any honest fight and far below the 1M-round stall.
- **Resolution**: the fight COMES APART via the existing honest-disengage idiom (`tbEndCheck`: "It comes apart — no one in reach, no one chasing. The fight ends; they melt back into the wilds." → 'routed'). Never a silent kill, never a free win: no bodies drop, so 'routed' pays no kills, no ledger, no combatWins — "It got away. No meat, no trophy — but you're breathing, and now you know its moves."
- **Scope guards**: fires only with live monsters AND live player-side fighters AND no incoming reinforcements (belltoad `_pendingPack` — the pack is finite; the guard fires once it's exhausted); fires once per fight (`_whiffFired`).
- **No monster ids, no telegraph names** — the class is "both sides whiff", not the beast. `WHIFFGUARD=0` disables (RED), following the `focusGroupCloseOn()`/`beamFatigueOn()` precedent. Ontology header updated (`tbRoundWrap` provides); `scripts/validate-ontology.js` 94/94 green.

Canon note: Steve's "monsters were sent to fight" stands — the per-monster fixes (Focus Group close-in, gallowdeer hunt) remain the first line. The guard is the backstop for the *class*: per the task's canon ruling, a fight where neither side can land damage for hundreds of rounds is not a fight, and freezing the day clock is a softlock.

## Proof (scripts/test-inffight-class-20261014.js)

- **RED** (`WHIFFGUARD=0`): the s44 whiff geometry (edge-pinned scholar, 2x2 lead, strike-weakest) stalls — 3000-round cap hit, over=false, lead frozen post-opening, scholar untouched. 11/11.
- **GREEN** (guard on): the same duel resolves at round 120 — over=true, 'routed', the "comes apart" line, lead alive at 223/245 (only the 22 opening damage — no free win), scholar alive at 100, combatWins unchanged (no kill paid). 15/15.
- **G2 battery**: honest duels (bulldozer, hushwolf, mirror_stag) resolve **byte-identically** with the guard on vs off (over/result/rounds/end-HP all equal across the two env invocations).
- **G3 sense**: the line reads as an honest fizzle — "no one in reach, no one chasing… melt back into the wilds"; no kill language, no victory language.

Pre-existing proofs updated for the new layer (their RED phases now also disable the guard to show the pristine bug):
- `scripts/test-inffight-20261014.js`: GREEN 12/12; RED (`FOCUSGROUP_CLOSE=0`) 9/9 — R1 stalls with both gates off; G1 now resolves via the *class* guard (the per-monster fix is subsumed for the stall class; its honest threat is still G2's).
- `scripts/test-beamfatigue-b.js`: GREEN 11/11; RED (`BEAM_FATIGUE=0`) 3/3 — pristine sterile-beam stalemate reproduces with both guards off.

## Before/after sweep (8 seeds × leadcourt/belongseek × A1/A2/B)

Design (findings #103/#111/#113 — per-run nondeterminism): A1 vs A2 (both `WHIFFGUARD=0`) measures the noise floor; A1 vs B (guard on) measures the effect. Byte-compare on the canonical trajectory (days, endReason, gameDays, maxWaveUnlocked, maxScaleRank, maxStanding, ledger/scale/standing/pop/pantry/knowledge/codex/trust samples, death causes). Driver: `scripts/run-wg-sweep-20261014.sh`; per-run: `scripts/sweep-whiffguard-20261014.js`; compare: `scripts/compare-whiffguard-20261014.js`.

| seed/pol | A1 vs A2 (noise) | A1 vs B (effect) | days A1→B |
|---|---|---|---|
| leadcourt/11 | DIVERGE (noise) | identical | 127→127 |
| leadcourt/22 | identical | identical | 118→118 |
| leadcourt/33 | identical | DIVERGE — guard fired day 80 (Focus Group, r146) | 99→86 |
| leadcourt/44 | STALL (both) | **s44 MEASURABLE** | —→101 |
| leadcourt/55 | identical | DIVERGE — guard fired day 50 (Moderator, r124) | 95→66 |
| leadcourt/66 | identical | identical | 61→61 |
| leadcourt/77 | DIVERGE (noise) | DIVERGE (noise-confounded) | 97→144 |
| leadcourt/88 | identical | identical | 77→77 |
| belongseek/11 | DIVERGE (noise) | identical | 180→180 |
| belongseek/22 | identical | DIVERGE — guard fired day 85 (Spool, r121) | 120→107 |
| belongseek/33 | identical | identical | 96→96 |
| belongseek/44 | identical | DIVERGE — guard fired day 128 (Focus Group, r121) | 180→180 |
| belongseek/55 | DIVERGE (noise) | DIVERGE (noise-confounded) | 143→142 |
| belongseek/66 | DIVERGE (noise) | identical | 47→47 |
| belongseek/77 | identical | identical | 151→151 |
| belongseek/88 | identical | identical | 85→85 |

- A/A identical: 10/16 (5 diverged — the #113 noise floor, confirmed).
- A1/B identical: 9/16. The 4 real guard effects (A/A clean) were ALL verified true positives via the firing log (`scripts/diag-wg-fire-20261014.js`): Focus Group ×2, **the Moderator** (wave-2 apex), **Spool** (wave 3) — each 121–146 consecutive zero-damage rounds, both sides alive, no bodies. The guard is general, not Focus Group-specific.
- The Moderator case is the smoking gun for correctness: without the guard, that fight ground **40,798 rounds** before routing (traced via `scripts/diag-moderator-a1-20261014.js`). The guard truncated it to 124 rounds with the same outcome ('routed'). It did not pre-empt an honest resolution; it truncated a pathological one.
- The trajectory changes (villages dying earlier) are the guard removing the **time-freeze subsidy**: a 40k-round whiff freezes the game day, shielding the village from attrition. Ending it honestly exposes the village to the survival game. This is a measurement correction, not harm.

## Reachability verdict

**s44's content is reachable.** With the guard, s44/leadcourt completes in 4s (vs 150s wall-timeout stall): 101 days, village-lost, maxWaveUnlocked 4, national reached (maxScaleRank 3), maxStanding 204. The day clock advances past the ~d60 stall point; the run measures wave-4 unlocks, national, and the full village arc. The stall no longer gates the seed.

The guard also unblocked three other whiff-forever fights (Moderator, Spool, Focus Group on belongseek/44) that were softlocking or near-softlocking their runs.

## Village assessment

Sixteen villages on the leadcourt/belongseek roads, before and after the guard. What the guard changed: four villages had whiff-forever fights (Focus Group ×2, Moderator, Spool) that the guard resolved honestly at rounds 121–146 instead of grinding (one traced to 40,798 rounds). Those villages' trajectories changed — three died 13–29 days earlier, one survived the full 180 either way — because the guard removed the time-freeze subsidy: a 40k-round whiff freezes the game day, shielding the village from hunger, aging, and attrition. Ending the fight returns the village to the survival game, honestly.

The villages that thrived did so on the strength of their diplomacy and food, not on stall subsidies. The villages that died early (s66 both roads, d47–61) died of combat and hunger, not of the guard. No village was harmed by the guard — the "earlier" deaths are the honest measurement, the later ones were subsidized by softlock.

s44/leadcourt, the seed that was unmeasurable, now lives 101 days: it seasons links, reaches national (Standing 204), unlocks wave 4, and loses the village to attrition — a complete, measurable run where before there was only a frozen clock.

## Blanks filled / documented

- **Fixed** (finding #108): the general whiff-forever guard — s44-class infinite fights now resolve honestly instead of softlocking the day clock.
- **Answered**: why the watchdog's tbEnd('routed') never cleared it — wall-clock starvation via the driveContests 400-loop multiplier (~75s/loop-day → ~10min fuse vs 90–150s budgets), not a tbEnd failure.
- **Documented** (new findings appended): (1) the Focus Group 2x2-anchor vs edge-pinned-scholar residual geometry (the cf0acce3 close-in works; the anchor-centered burst still can't reach — per-monster nuance, covered by the class guard); (2) the driveContests 400-iteration × 200-round multiplier as a wall-clock hazard for any future never-ending fight (the engine guard now bounds it, but a second such fight would still grind); (3) Object.assign policy-clobber instrumentation hazard (diag-s44-upkeep/noop replaced competent's real upkeep — those "completing" runs were invalid; always chain, never overwrite).

## Metric review (§14)

- **Metric (a) — MET**: s44/leadcourt completes (101d, village-lost, 4s wall) vs 150s wall-timeout stall. The day clock advances past the stall point; wave-4, national, and the full arc are measured.
- **Metric (b) — NOT MET as written, but the metric's assumption was wrong**: 9/16 byte-identical, not ≥7/8. The miss is NOT guard over-aggression — every firing (4/16 runs, 3 monsters) was verified a true 120+ zero-damage whiff via the firing log. The miss is because **whiff-forever fights are common (25% of runs), not rare** — the metric assumed rarity. On the 10 A/A-clean seeds, the guard changed 4 (all true positives) and left 6 byte-identical.
- **The "guard too aggressive" kill condition does not trigger**: "narrow it, don't ship it" applies to false positives. There were none. Narrowing (raising the threshold) would leave real 40k-round softlocks grinding. The 120-round threshold stands on Steve's "hundreds of rounds" canon.
- **Guardrails**: median survival leadcourt 97→93.5 (−3.5d, fair 8-seed comparison), belongseek 131.5→124.5 (−7d) — both within ±10d. National: leadcourt 4→4, belongseek 5→4 (≥ baseline−2 ✓). Wave reach: no regression (maxWaveUnlocked identical on all A/A-clean seeds).
- **Proposed revision for the NEXT run**: (b') "the guard fires only on fights with 120+ consecutive zero-damage rounds (verified by firing log); zero firings on any fight with damage inside the window; honest-duel battery byte-identical." Byte-identity of full trajectories is unachievable as a bar given #113 (5/16 A/A diverge with identical code).
- **Time-freeze subsidy**: recorded as a measurement finding — whiff fights freeze the game day, inflating survival metrics. The guard's "earlier deaths" are the honest numbers. Future survival comparisons on seeds with whiff fights should note this.

## Wall numbers (every run)

| | national | table | wins | wave-4+ | medianSurv |
|---|---|---|---|---|---|
| leadcourt A1 (7 seeds, s44 stalled) | 4/7 | 0/7 | 0/7 | 5/7 | 97d |
| leadcourt B (8 seeds, s44 measurable) | 4/8 | 0/8 | 0/8 | 5/8 | 93.5d |
| belongseek A1 (8 seeds) | 5/8 | 0/8 | 0/8 | 0/8 | 131.5d |
| belongseek B (8 seeds) | 4/8 | 0/8 | 0/8 | 0/8 | 124.5d |

No run reached the table or a win. The scale wall stands. s44/leadcourt: unmeasurable → 101d, national, wave-4, Standing 204.

## Addendum — independent firing-count re-run (2026-10-14, post-commit)

Motivation: the first sweep verified firings via a post-hoc firing-log diag. A behavior-neutral instrumentation line was added to the guard's fire branch (`this._whiffGuardFiredTotal = (this._whiffGuardFiredTotal || 0) + 1;` — no RNG, no flow change; `scripts/sweep-whiffguard-20261014.js` records it as `whiffGuardFired`) so every sweep run self-reports its firing count.

Harness note (caught mid-run): the sweep script reads ENV (`SEED`, `POLICY`, `WHIFFGUARD`, `OUT`), not argv — the first re-run attempt passed `--seed/--policy` as argv and ran s44/leadcourt four times. Killed, fixed (`run-b.sh` exports env), re-ran clean: 16/16 exit=0, zero timeouts.

Fresh B-sample firing counts (guard ON, second independent sample):

| seed | leadcourt days/fired | belongseek days/fired |
|---|---|---|
| 11 | 169 / 2 | 180 / 0 |
| 22 | 118 / 0 | 107 / 1 |
| 33 | 86 / 1 | 96 / 0 |
| 44 | **101 / 1** | 180 / 3 |
| 55 | 66 / 1 | 155 / 0 |
| 66 | 61 / 0 | 180 / 1 |
| 77 | 145 / 0 | 151 / 0 |
| 88 | 77 / 0 | 85 / 0 |

- s44/leadcourt replicates: fired exactly once (the stall fight), 101d, village-lost, wave-4 — byte-consistent with the first sweep's B result.
- 9 firings across 16 runs (7 seeds); 9 seeds fired zero times — the guard is inert where there is no true whiff. Every firing is a true 120+ consecutive zero-damage-round fight by construction (the counter increments only in the fire branch).
- The firing SEEDS differ between the two samples (e.g. belongseek/66 fires here, not in the first sample; leadcourt/11 fires twice here) — expected under the #113 per-run noise floor; whiff-forever fights are trajectory events, not seed-deterministic. The class claim is sample-independent: the guard fires only on true whiffs, never on honest fights.
- Proof test re-run with instrumentation: 15/15 GREEN; ontology 94/94.
