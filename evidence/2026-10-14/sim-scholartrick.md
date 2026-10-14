# sim-scholartrick — scholar observation channel (flesh-out-b ARM 1, 2026-10-14)

## Pre-registration (written BEFORE sims — §14 binds)

- **Lever**: scholartrick (scale-onramp, war-path lens). Game-code arm.
- **Gap**: sim-findings #67 — `noteVillagerTrickObservation` excluded `vid === 'player'`;
  the scholar's own survived trick/signature-bearing encounters taught nothing.
- **Build**: scholar observation channel into the SAME `state.villageCounterObs` bar —
  same 2-encounter threshold, same `discoverMonsterCounter(mid,'scholar-observed')` /
  `villagerTricks` mechanics, same odds; first-person narration, never silent.
  Hooked in `tbEnd` on fled / routed / calmed; the scholar must be alive. Kills teach
  via the slain path (parity with the villager vKill exclusion — only beasts ALIVE
  at fight end count); 'lost' excluded (vDie parity: the dead tell no tales).
  Villager field-fight paths untouched (byte-identical).
- **Primary metric**: scholar observation increments (count of
  `noteScholarTrickObservation` calls) across the pilot.
- **GO threshold**: ≥4 scholar observation increments across the 8-seed pilot
  AND ≥1 'observed' discovery via the scholar channel (tele via='scholar-observed').
- **Horizon**: 180d death-aware (Steve's WIN-PATH HORIZON 180; dead villages stop).
- **Seeds/policies**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek
  (courtship-road reference set), identical seeds before/after.
- **Guardrail**: median survival within ±10d of identical-seed baseline; wall
  metrics (national / table / wins / wave reach) no regression.
- **Mechanism-starved kill clause**: if wave-3 never unlocks on the pilot seeds,
  KILL honestly (revert game-code, keep proof + evidence, evidence-only commit).
- **Design call for Steve's overrule**: the scholar learns through the village's
  SHARED observation bar (his notes go to the same fire), not a private track —
  symmetric half of his VILLAGER COUNTER PARITY ruling.

## Lever played

`src/js/game.js` only (3 hunks):
1. Refactored `noteVillagerTrickObservation` into wrappers + shared core
   `_trickObservation(vid, mid, firstPerson)`. The villager wrapper keeps the
   `'player'` exclusion and identical strings/events (byte-identical villager
   behavior); new `noteScholarTrickObservation(mid)` calls the core first-person.
   Scholar increments narrate on the FIRST sighting too ("You lived to tell it —
   the X's moves are burned into your memory. (1/2 …)"); villagers stay silent
   until discovery, as before. Tele `counter_observed` now carries `vid` for
   scholar/villager attribution (telemetry-only).
2. `discoverMonsterCounter`: new `'scholar-observed'` viaLine — "You lived to
   tell it — twice — and now you see the pattern." (villager 'observed' line
   unchanged: "You did the thing — and it worked.").
3. `tbEnd` hook: on 'fled' / 'routed' / 'calmed', scholar alive (same guard as
   the trial-deeds block), one observation per distinct ALIVE monster type
   (dead beasts teach via the slain path — recordWaveKill → codex hint).

Docs read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, counter discovery
channels, villager XP law). No canon invented: the arm wires an existing
mechanism to its missing symmetric caller.

## Before/after numbers

16 runs × 2 (baseline pristine via SCHOLARTRICK_GAMEJS override / after),
identical seeds, 180d death-aware. Raw: evidence/2026-10-14/scholartrick-baseline.json,
evidence/2026-10-14/scholartrick-after.json.

| metric | baseline | after |
|---|---|---|
| scholarObs (primary) | 0 | **75** (GO ≥ 4) |
| scholarDisc (primary) | 0 | **11** (GO ≥ 1) |
| median survival | 72d | 72d (guardrail ±10d: PASS) |
| max survival | 180d | 180d |
| wins | 0 | 0 |
| max wave unlocked | 4 | 4 |
| wave-3+ unlocks | 5 seeds | 5 seeds (kill clause NOT triggered) |
| national | 3 | 3 |
| table | 0 | 0 |
| villager observations | 912 | 903 (no cannibalization) |

Per-seed (after): every one of the 16 runs recorded ≥1 scholar observation
(range 1–11); 10 seeds produced ≥1 scholar-channel discovery (leadcourt s88: 2).
Death-cause shares baseline→after: combat 92→88, sickness 25→26, wound 19→22,
villager-combat 19→19 — noise, no shift. Wall metrics byte-identical.

## Reachability verdict

- Wave 1–2 counters: REACHABLE and now learnable three ways (perform the trick,
  scholar observation ×2, taught at haven). belongseek s55: scholar discovered
  Nightlight's counter purely by surviving two encounters (4 observations total).
- Wave-3 signatures (spool/chorus_line/buffering): wave-3 unlocked on 5/16 seeds,
  but ZERO scholar signature observations were recorded on the richest seed
  (belongseek s55, 11 scholar obs — all wave-1/2 mids: nightlight_catfish,
  hushwolf, lockpick_raccoon, heckler). The signature half of the mechanism
  remains mechanism-starved on the courtship road — consistent with finding #67's
  buildfund note (villager side: known=[] on 16 runs). The channel is proven
  end-to-end for signatures by the proof test (G-7); it just rarely fires in
  honest sims because scholars seldom survive two wave-3 encounters of one type.
- Arc/wave/national/table reach: unchanged (pure-knowledge lever, no stat effects).

## Village assessment

The villages look the same as baseline — this lever changes what the scholar
*knows*, not what the village *does*. On belongseek s55 (the 175-day wave-4
run): the scholar personally pieced together the Nightlight's counter from two
survived fights, plus 9 other beasts' tells across the run, while the village's
own 183 observations flowed through the same bar. Who thrived: scholars who
fight-and-live (leadcourt's aggressive road produced 34 scholar obs vs
belongseek's 41 — both roads feed the channel). Who died: the usual wall —
combat 88, sickness 26; the lever moves no death needle by design. Missing
capability the run surfaced: scholars still can't learn wave-3 signatures in
practice (see reachability) — that blank stays open for a future arm (e.g.
signature observations from *witnessed* villager fights, or the scholar
studying a driven-off wave-3 beast's leavings).

## Blanks filled / documented

- FILLED: finding #67's missing symmetric half — the scholar's survived
  encounters now feed the shared 2-encounter bar (proof 36/36 GREEN, 5/5 RED;
  75 increments + 11 discoveries on the pilot).
- DOCUMENTED (not chased): wave-3 signature observations remain mechanism-starved
  in honest courtship-road sims (0 on the richest seed) — the *unlock* gate is
  met on 5/16 seeds but the *observation* gate isn't. Candidate future arm noted
  above; no design call made (needs Steve only if we change what counts as an
  observation).

## Metric review

- The GO metric (increments + discoveries) measured the channel's existence and
  use cleanly; no revision proposed. One instrumentation gap for next time: the
  sweep counted scholar increments per seed but not per-mid — the wave-3
  signature share had to come from a supplemental sense run on one seed. Future
  runs should log observation mids per seed (the sense script
  scripts/sense-scholartrick-20261014.js already does this; fold it into the sweep).
- Guardrail choice (±10d median) was easily satisfied — expected for a
  knowledge-only lever; the binding guardrail was the wall-metric identity,
  which held exactly.

## Sense check

Read 19 scholar beats in context (belongseek s55, 13,827 say lines). The three
discovery channels read distinctly and honestly side by side:
- trick performed: "…(You did the thing — and it worked.)" (Highbeam Deer, Lockpick…)
- scholar observed: "…(You lived to tell it — twice — and now you see the pattern.)" (Nightlight)
- taught: "…(Someone at the haven knew the trick.)" (Hummice, tick)
No beat contradicts what actually happened; the first-sighting beat ("You lived
to tell it — the Nightlight's moves are burned into your memory. (1/2 …)")
lands as a notebook entry, not a reward. Proof-test transcripts (G-2 through
G-9) all narrate in first person with no silent increments.

## Verdict: GO

Primary metric exceeded 18× on increments (75 vs ≥4) and 11× on discoveries
(11 vs ≥1); guardrail passes; wall metrics identical; kill clause not triggered
(wave-3 unlocked on 5 seeds). Landing the game-code change.
