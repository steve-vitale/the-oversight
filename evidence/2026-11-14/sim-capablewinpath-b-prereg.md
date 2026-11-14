# sim-capablewinpath-b — PREREG (DIAG arm: decompose finding #2321)

Run: fleshout-loop-b-20261114T1030Z (Loop B), arm sim-capablewinpath-b
Axis: winnability chain. This arm decomposes a MEASURED divergence — it
changes nothing in the game.
Branch: sim-capablewinpath-b — worktree ~/workspace/worktrees/sim-capablewinpath-b
Base: master 2042cb96c (rebased from 2de44bad8; the branch's three
journey-establishment r137 commits were already merged to master, so the
rebase fast-forwarded with no picks replayed and no work lost)
Date: 2026-11-14

## The finding (#2321, sim-findings.md)

Capable wins 16/16 by ~day 90 (endReason over-other) while competent wins
0/16 on identical seeds 98801–98816, 150d. Grounding:
evidence/2026-11-14/sim-rageprecheck-b-stage2.md (per-seed competent-vs-
capable table: wins 0/16 vs 16/16, wave-4 kills 34→26 vs 34→31 — the
AFTER leg, i.e. with the rage engine precheck landed) and
evidence/2026-11-13/sim-rageloop-b.md (the original 8/8 band 98801–98808).
Question: what does capable do that competent doesn't? Where do the paths
diverge?

## What is already known (read before the run)

- `competent.js` contains ZERO references to tableTakeSeat / tablePreview /
  tableSeat / deedGateReady (grep, 2026-11-14): competent never takes the
  seat, so it cannot win even if it qualified. Whether it ever qualifies
  is open — this arm measures it.
- Capable wins at ~day 90 with standing as low as 199 and 0 wave-4 kills
  on some seeds (98803: 0/0 w4/w5 kills, 5 strikes, won day 89–90). Day 90
  is the table's day floor (`winDayFloorOk`, table.js:910) and wave 5
  unlocks at standing 200 — so the win path is a LESSER seat taken the
  morning it opens, needing no wave-4/5 kills. Which door, and what
  earned it, is what the recorder must show.
- Seat bars (docs/TABLE.md + src/js/table.js `tableSeat()` + progression.js
  `deedGateReady()`): LESSER = waves faced 4/4/3 distinct, 2+ contests
  survived, 2+ crises, scale regional+, integration stage ≥ 2,
  sentimentTaught, ladder peak stage ≥ 1. FULL = waves 5/5/4/3/2, 3+
  contests, 3+ crises, stage ≥ 2, sentimentTaught, national/global,
  ladder peak ≥ 3 + capstone delivered. Arc IV fires only on a seat.
- Standing (standing.js `villageStanding()`): total = war + diplomacy +
  plenty — war = wave-ledger points × warPerKill (waves 3–5 kills),
  diplomacy = seasoned REGIONAL+ links × diplomacyPerLink, plenty =
  quality feasts × plentyPerFeast. `villageStandingTotal()` is the GATED
  number (plenty cap, combat-readiness deferral, peak ratchet) and is NOT
  a pure read — it fires release/hold beats and writes
  `_standingPeakWave`. The recorder NEVER calls it daily (see §Method).
- Capable's layers over leadfeast (capable.js): (1) real fleeing,
  (2) combat abilities + signature counter verbs, (3) scored choices
  (offers / contests / table / relic / relay), (4) held conversations by
  need, (5) scale climb + food deeds via leadfeast, (6) deed hunt
  (feast-spend + wave-bar sorties). The decomposition must say WHICH layer
  carries the win — a layer that never fires on the winning seeds is not
  the cause.

## Prior guesses (to test, not to assume)

- H1 — the seat-taker gap: competent never sits (verified by grep above);
  capable's `tableRoad` sits the morning the preview reads ready. If
  competent ever reaches a lesser seat on any seed and still wins 0/16,
  H1 alone explains the win gap and the rest of the decomposition is
  about why capable qualifies.
- H2 — the qualifier gap: capable qualifies for a lesser seat by ~day 90
  via leadfeast (courtship → regional scale, devotion → sentimentTaught,
  feast/tribute → ladder peak) + deedHunt (wave bars 4/4/3); competent's
  seat stays `none` on a named missing bar.
- H3 — the door: the winning door needs no wave-4/5 kills and no national
  scale (lesser seat + an always-available door, e.g. assimilated/defiant,
  or relay at stage 3). The recorder names the path, branch, and strength
  per winning seed.
- H4 — the standing split: capable's standing at seat day is carried by a
  different source than competent's (diplomacy/plenty vs war), or by the
  same source at a different speed.

## Primary metric + GO bars (binding, §14)

The primary is DECOMPOSITION COMPLETENESS — this is a DIAG arm, not a
lever: there is no before/after and no win-rate bar to move.

- G1 INSTRUMENT VALIDITY — GO iff the recorder captures full per-day
  progression on all 32 configs (16 seeds × competent/capable), 0
  instrument errors, and EVERY seed is classified (won-table /
  qualified-never-sat / never-qualified-<missing-bar> /
  died-before-90 / survived-no-seat) — zero UNCLASSIFIED. Any instrument
  error or unclassified seed = NO-GO.
- G2 DECOMPOSITION — GO iff the evidence file carries a RANKED list of
  the divergence steps (first-seat-ready day, seat-taken day, path, and
  the per-bar completion days that separate the policies), EACH with
  per-seed numbers on all 16 seeds, and the list names which capable
  layer fires on the winning seeds. A ranked list without per-seed
  numbers, or a list that cannot say which layer carries the win = NO-GO.
- G3 INSTRUMENT-ONLY — GO iff zero `src/js` changes in the branch diff
  and the proof test (`scripts/test-capablewinpath-b.js`) is green.
  Any src/js change = NO-GO.

Guardrail (§14c): villager (non-scholar) combat deaths are a co-primary
read on every seed — a decomposition that ignores the roster is
incomplete even if G1–G3 pass.

## Method (staged, §§9–12, 14–15)

- STAGE 0 SMOKE (2 seeds × 2 policies): does the recorder capture a
  full daily series, do the wrappers log seat/path events, does the
  classifier assign every seed? Fix wiring, not thresholds.
- STAGE 1 FULL (16 seeds × 2 policies = 32 configs, 150d death-aware,
  identical seeds): the judged run. Horizon 150d because the finding's
  band is 150d and capable wins ~d90 while competent grinds to 150d or
  dies (§10: reachability lever, 150–200d).
- Seeds (exact literals): 98801, 98802, 98803, 98804, 98805, 98806,
  98807, 98808, 98809, 98810, 98811, 98812, 98813, 98814, 98815, 98816.
  Policies: competent verbatim vs capable, identical seeds, same
  process shape as scripts/rageprecheck-driver-20261114.js.
- RECORDER (driver-side only, in scripts/): wraps the policy object
  passed to `runDays` (snapshot after each `daily()` call, deduped by
  game day) and wraps `Game.tableTakeSeat`, `Game.chooseTableOption`,
  `Game.unlockedWave`, `Game.villageStandingTotal` (LOG-ON-CHANGE ONLY —
  never called by the recorder; the engine's own calls surface the
  values), and `Game.say` (table/seat lines only, capped). Daily
  snapshot reads are PURE reads only: `villageStanding()` (raw
  war/diplomacy/plenty), `deedGateReady()`, `tableSeat()`,
  `tablePreview()` (only when `pg.tableWaiting`), `progState()`,
  `deedState()`, `playerTracks()`, `integrationStage()`,
  `codexBreadth()`, `waveCombatReadiness(4/5)`, `state.waveKills`,
  scholar abilities, roster size. `villageStandingTotal()` is read
  ONCE at end-of-run (as the rageprecheck driver did). Zero `src/js`.
- CLASSIFICATION (per seed, at end of run): won-table (won=true) /
  qualified-never-sat (seat lesser/full reached, no tableTakeSeat call) /
  never-qualified-<missing-bar> (seat stayed none; the bar that never
  cleared, named from the last snapshot's `tableSeat().detail`) /
  died-before-90 (village-lost, day < 90) / survived-no-seat. A seed
  matching none of these is UNCLASSIFIED and fails G1.
- NO BALANCED PANEL (§15): this is a DIAG, not a before/after lever —
  there is no second game root to compare. Corroboration instead: a
  reproduction check of the run's end-state columns (days, endReason,
  won, maxWave, standing, waveKills) against the stage-2 AFTER-leg
  corpus (evidence/2026-11-14/perseed-rageprecheck-b-confirm-after/),
  reported with deltas; exact match is NOT required (later master
  merges may legitimately move numbers) — the check is evidence, never
  the judge.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures in this
  arm — the recorder observes the policies' own play; nothing is staged.

## Divergence steps the recorder must rank (per-seed numbers each)

1. Scale trajectory: day village→regional, day regional→national (or
   never), per policy.
2. Standing source split at first-seat-ready day (war / diplomacy /
   plenty) and at day 90.
3. Deed-bar completion days: w1/w2/w3 faced bars, contests survived,
   crises, integration stage 2, sentimentTaught, ladder peak ≥ 1.
4. Arc reach days (II / III / IV) and tableWaiting/tableAnnounced days.
5. Wave unlock days (4/5, from the engine's own `unlockedWave` calls),
   first wave-4/5 kill days, living veterans at seat day.
6. First preview-ready day, seat-taken day, path + branch + strength,
   final choice, win day.
7. Ability-offer picks (capable's scored picks vs competent's first
   pick) and abilities held at seat day.
8. Capable layer counters on winning seeds (capSeatTaken,
   capHuntWaveFights, capOffersChosen, capTableAnswers, capRelayClaimed,
   capFleeExits, capAbilityUses) — which layer actually fires.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival — reported
for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the table/seat narration the recorder captures (announcement,
path offer, final choice) and judge whether the win reads like a
played ending or a silent flag flip. Read villager dialogue in the
captured lines where present; judge meaning and coherence, never just
counts.

## Evidence

- Prereg: this file.
- Driver: scripts/capablewinpath-driver-20261114.js (new).
- Analyzer: scripts/analyze-capablewinpath-b.js (new).
- Proof: scripts/test-capablewinpath-b.js (new; static + game sections).
- Per-seed JSON: evidence/2026-11-14/perseed-capablewinpath-b/ (32 files).
- Evidence: evidence/2026-11-14/sim-capablewinpath-b.md (per-seed
  tables, wall numbers, sense-testing, metric review).
- Reproduction check: against perseed-rageprecheck-b-confirm-after/.

## Convergence state

DIAG — no lever, no convergence verdict. The arm documents; the
finding's fix (if any) is a later arm's prereg.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did G1/G2/G3 measure the decomposition,
or did the metric prove wrong (bad proxy, blind channel)?
