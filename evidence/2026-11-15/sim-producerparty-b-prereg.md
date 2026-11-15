# sim-producerparty-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261115T1810Z`, axis winnability chain, arm
sim-producerparty-b (Producer re-engagement party lever). Branch
`sim-producerparty-b`. Binding prereg: this file — frozen here,
judged in `evidence/2026-11-15/sim-producerparty-b.md` without
alteration.

## The question, in plain words

The wave-5 killing diag (`evidence/2026-11-15/sim-wave5kill-b.md`,
DIAG GO on the gorgeprice2 CONFIRM corpora, 16+16 seeds
100521–100536, 150d, `competent-answercourt-b`) proved armed
villages unlock wave 5 at 10/16 but make only 11 wave-5 kills
total (1.1 per unlocked village), kill:death 0.92 (11 kills / 12
villager deaths), 5/10 unlocked villages FACED-NOT-KILLED, and
the scholar never dies to wave 5 (0/28) and never fights them —
villagers fight the Producers alone, in ones.

The scout for THIS arm (8 seeds 100701–100708, recorder-only,
lever absent, `evidence/2026-11-15/perseed-producerparty-b-scout/`)
corrected half of that picture and confirmed the other half:

- CORRECTED: the party IS present at wave-5 fights — 14 of 16
  wave-5 field fights had a party of 3 (fighter + 2 allies
  through `villagerFightAllies`), 2 of 16 a party of 2. The
  blocker is NOT "no party".
- CONFIRMED: the fights still fail — 13 vFlee, 2 vDie, 1 vKill
  across the 16 fights. The one kill (finale_crew, seed 100708,
  day 131) came on the FIFTH meeting with the same lingering
  Producer in 9 days, after its trick was learned — monster HP
  persists across fights (`fieldFight` writes wounds back onto
  the world monster), so repeated bouts accumulate toward a kill.
- CONFIRMED: the re-engagement chain never fires FOR WAVE 5.
  15 of 16 wave-5 fights arrive through the world-tick path
  (`resolveWildMonsterEncounter`), which never seeds a win-plan
  and never consults the fight gate; 0 wave-5 plan seeds, 0 gate
  SEEKs for wave 5 in 8 seeds. The win-plan gate/seed machinery
  runs only in `expeditionMonster`. The re-engagement that
  produced the one kill was accidental — the same lingering
  Producer kept returning to the same villagers — not a plan.
- CORRECTED (2026-11-15, smoke run after the prereg draft):
  the scout's "0 win-plan departures" was an INSTRUMENT BLIND
  SPOT, not a dead launch chain. The brain owns dawn
  (`vbrainOwnsDawn() === true`), so `agencyTick` BYPASSES
  `winPlanDepart` — the scout's depart wrap saw nothing, and
  the brain's `vbrainExecuteDepart` party-launch mirror bumps
  NO `winPlanStats` counter. A 60-day smoke run on pilot seed
  100721 (lever absent) shows the launch chain IS alive: 13
  `party_launch` dawn commits, 3 plans at `hunt` stage (the
  stage only a launch sets), 0 `partyDepartures` (the counter
  lives in the bypassed function). The recorder now wraps
  `vbrainExecuteDepart` too (`source: 'brain'` rows in
  `w5departs`) and tallies dawn commits by `winPlanAction`
  (`brainEnd`), so the control leg measures departures
  honestly. The missing piece is ONLY the wave-5 seed: plans
  launched in the scout carried wave-3/4 targets, never a
  Producer.

This arm tests the lever that owns that re-engagement: a
villager who has FACED a Producer seeds a win-plan from the wild
fight, and the existing party-launch chain goes back after that
Producer type together, instead of the current flee/avoid.

## The lever (frozen)

One game-code change, in `src/js/game.js`
`resolveWildMonsterEncounter`, placed beside the existing
return-to-fight sighting block (same outcomes, same raid
exclusion):

- After a `fieldFight` / `aidFight` against a wave-4+ monster
  that ends `vFlee`, call
  `winPlanSeedFromFight(vid, mdef, 'fled')` — mirroring
  `expeditionMonster`'s vFlee seed (`src/js/villager-agency.js:726`).
  Wave-gated inside `winPlanSeedFromFight` (wave ≥ 3; wave-5
  fights qualify). Excluded for raids (`opts.raid`), like the
  sighting block: defence at the haven door is not a place to
  return to. No seed on `vKill` (handled by `winPlanNoteKill`),
  `mFlee` (the expedition path does not seed it either), `vDie`
  (the dead hold no plan), or `alreadyDead`/`evade` (no fight).
- The seed is perception-gated by construction: only the
  villager who actually fought the beast gets the plan (target =
  Producer species, node = where fought, stage `party` if geared
  else `gear`). No roster scan, no new join trigger.

Everything after the seed rides EXISTING machinery, unchanged
in this arm:

- `winPlanHavenTick` advances the stage at Haven (gear → party
  when geared).
- The villager brain's `winPlanCands` bids `party_launch`
  (stages party/hunt/standing/table with a companion); the dawn
  scorer's win-plan override makes it win the commitment
  (`src/js/villager-brain.js`).
- `vbrainExecuteDepart` mirrors `winPlanDepart`'s shared-target
  party launch to the plan's node.
- The expedition's monster meeting consults
  `winPlanFightGate`: SEEK when the plan targets that species,
  the party is 3 armed+armored, and the village knows the trick
  (the trick-known hold in `fieldFight` then keeps the party in
  a hopeless fight above 25% HP).

If the pilot shows the seed fires (wave-5 seeds > 0) but kills
do not move, the arm is judged NO-GO on the bars below and the
evidence names what the seed failed to change (launches with a
wave-5 target, gate SEEKs, or kills per bout) — the lever is NOT
widened mid-run.

## Seed bands (verified fresh per the seed-band-freshness skill)

- Scout (scoping only, NOT judged): 100701–100708, recorder-only,
  lever absent. Already run; corpora in
  `evidence/2026-11-15/perseed-producerparty-b-scout/`.
- Pilot: **100721–100728** (8 seeds), control leg first (lever
  absent, current tip), then armed leg (lever on), identical
  seeds, same policy/horizon. Pilot gate: 8 seeds before/after
  before any confirm spend.
- Confirm (ONLY on a pilot GO): **100741–100756** (16 seeds),
  same two legs, identical seeds.
- NEVER 100521–100536 (gorgeprice2 CONFIRM bands).
- Freshness check (2026-11-15): zero hits for 100721–100728 and
  100741–100756 in `evidence/*/sim-*-prereg.md`, wider
  `evidence/**/*.md`, goal `hidden_files/`, and no
  `perseed-*1007*` dirs. (100601–100608, 100621, 100644 are USED
  by transplant/courtship preregs.)

## Horizon, policy, death-awareness

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy `competent-answercourt-b` (same as the diag).
- Driver: `scripts/producerparty-driver-20261115.js` (RUN
  `producerparty-b`; control OUTDIR
  `perseed-producerparty-b-control`, armed OUTDIR
  `perseed-producerparty-b-on`, confirm OUTDIRs
  `perseed-producerparty-b-confirm-control` /
  `perseed-producerparty-b-confirm-on`).
- Analyzer: `scripts/analyze-producerparty-b.js` (pooled classes,
  kills per unlocked, kill:death, FACED-NOT-KILLED share,
  starvation, median survival, wall numbers, encounter/gate/
  plan decompositions; `judge(control, armed)` implements the
  bars below). Panel builder:
  `scripts/build-producerparty-panels-20261115.js` (§15 balanced
  panels, pilot seeds 100721–100728).

## Frozen definitions (reused from sim-wave5kill-b-prereg.md)

- **Wave-5 monster ids** (from `src/data/monsters.json`, wave 5):
  `cancellation`, `editor`, `rerun`, `spoiler`, `timeslot`,
  `nielsen`, `finale`, `finale_crew`, `finale_opening`,
  `network_note`.
- **UNLOCKED (per seed):** an `unlockedWave` event with wave 5
  exists (equivalently `maxWave >= 5`). Unlock day = that
  event's day.
- **FACED-DISTINCT (per seed):** final series `w5` value —
  distinct wave-5 types faced by run end.
- **KILLED (per seed):** `waveKills['5']` (0 if absent).
- **DIED-TO-W5 (per seed):** deaths with `who` in the wave-5 id
  set; split scholar vs villager by `player`.
- **KILL:DEATH ratio:** pooled wave-5 kills / pooled deaths-to-W5
  per leg.
- **VETERAN ATTRITION (per unlocked seed):** `vet5` at unlock
  day, at first-faced day, at run end; days `rd5ready` true
  after unlock; dominant `rd5short` bar.
- **NEVER-FACED:** unlocked, final `w5` = 0.
- **FACED-NOT-KILLED:** unlocked, final `w5` > 0, kills = 0.
- **KILLED (class):** unlocked, kills > 0.
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, or any seed whose unlock/faced/
  kill fields disagree (kills > 0 with `maxWave < 5`, or `w5` >
  0 before the unlock day).

## Per-encounter definitions (new in this arm)

The recorder (`scripts/producerparty-driver-20261115.js`) wraps
`winPlanFightGate`, `winPlanSeedFromFight`, `winPlanDepart`,
and `fieldFight` (wave 4+ only) and stores, per seed:
`w5encounters` (day/vid/mid/wave, alliesN/allyVids, gate
snapshot, outcome/rounds/vTaken/mDealt/calledHelp, trick
before/after, fight lines), `w5gates` (gate result/reason,
party size + gear replica, trickKnown, plan stage/target,
needWave), `w5seeds` (wave 3+ plan seeds: stage/target/node),
`w5departs` (hold/launch), `w5ids` (wave-5 ids seen).

- **ENCOUNTER:** one `fieldFight` row with a wave-5 `mid`.
  Outcome classes: `vKill` / `vFlee` / `vDie` / `mFlee` /
  `evade` / `alreadyDead`.
- **GATE ROW:** one `winPlanFightGate` call with a wave-5
  `mdef`. Result `seek` / `avoid` / `null` (old path), reason
  (`seek` / `outmatched` / `veteran-guard` / `trick-hold`
  via null).
- **SEED:** one `winPlanSeedFromFight` call with a wave-5
  target (the recorder logs wave 3+; wave-5 seeds are the
  judged subset).
- **DEPART:** one `winPlanDepart` call returning `launch` or
  `hold` for a plan whose target is a wave-5 id.

## Primary metric + GO bar

Primary metric: **wave-5 kills per wave-5-unlocked village**
(armed leg vs control leg, same seeds).

GO iff ALL hold (pilot, then confirm on the same bars):

1. **Kills per unlocked village (armed) ≥ 2× control.**
2. **Kill:death (armed) ≥ 0.92** (the diag's armed-leg ratio;
   the lever must not buy kills with deaths).
3. **FACED-NOT-KILLED share among unlocked armed ≤ 2/10**
   (≤ 0.20; the diag's armed leg was 5/10).
4. **Cost bar:** starvation (armed) ≤ control + 2, AND median
   survival (armed) ≥ 0.8× control.

NO-GO otherwise. A pilot NO-GO is evidence-only: the
instrument, analyzer, prereg, and evidence merge; the LEVER
does not merge (killed arms leave no trace). A pilot GO spends
the confirm band; a confirm NO-GO is evidence-only the same
way.

## Per-seed table (evidence file)

Per unlocked seed, both legs: seed, unlocked day, first-faced
day, faced-distinct (final w5), wave-5 kills, deaths-to-W5
(scholar / villager), vet5 at unlock / at end, days rd5ready
after unlock, dominant rd5short bar, median survival (days),
endReason. Plus pooled rows: kills per unlocked village, kills
per faced village, kill:death ratio, class counts; plus the
encounter decomposition (wave-5 fights by outcome / party size
/ gate), the gate decomposition (by result / reason / party
size / trickKnown / plan stage), plan seeds and departs, and
the win-plan sums.

## Proof test

`scripts/test-producerparty-b.js` proves, on synthetic
fixtures and a live in-memory run (no corpus numbers): the
recorder wraps are present and record party size + flee/fight
on a pilot seed; the wave-5 id set matches
`src/data/monsters.json` wave 5 exactly; the judge implements
the bars (GO shape + one NO-GO per leg + boundary GO); the
analyzer classifies synthetic per-seed fixtures; the driver is
deterministic (same seed twice → same deaths/days/endReason/
series + identical recorder arrays); and the LEVER static check
(the `winPlanSeedFromFight` call exists in
`resolveWildMonsterEncounter` in `src/js/game.js`) passes
once the lever commit exists and records "not-built-yet"
before it. GREEN before the armed leg runs; re-run green on
the rebased tip before landing.

## Sense-testing

Quote the wave-5 fight lines the recorder captures
(`w5encounters[].lines` / `log`) for 2–3 wave-5 fights per leg
and judge whether the fights read like fights: do villagers
party up, flee sensibly, hold the line on a known trick, go
back after the same Producer — or walk in solo and die? Name
the fight lines' source (seed, day, fighter, monster) and the
counts searched (wave-5 encounters scanned, fight lines
found). Do not invent fight narrative from kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 5 "The Producers" (standing
  ≥ 200 AND wave-4 faced; bands damage 50–130, HP 1000–2200,
  pierce 0.25–0.75; readiness wave 5: 4 armored P≥15, 6 armed,
  3 tricks, 2 veterans; waves 3–5 deliberately counter-less,
  signature-mechanics counterplay instead).
- `docs/PARTY.md` — the party concept this lever test-cases.
- Prior evidence: `evidence/2026-11-15/sim-wave5kill-b.md`
  (the finding) and `evidence/2026-11-15/sim-wave5kill-b-prereg.md`
  (definitions reused); `evidence/2026-11-15/sim-gorgeprice2-b.md`
  (lever + sweep pattern).

## Metric review (to be filled in the evidence file)

Pre-registered here: the scout band is scoping, not judged —
its 1 kill / 0.2-per-unlocked is the shape of the problem, not
a baseline. The pilot control leg is the judged baseline. If
the lever's seed fires (wave-5 seeds > 0) but kills do not
move, the review will say which link failed — launches with a
wave-5 target, gate SEEKs, or kills per bout — with the
brain-commit tally (`brainEnd`), the `w5departs` rows (both
`winPlanDepart` and brain sources), and the gate rows as the
evidence. The scout's "0 departures" misread is corrected in
the scout section above: the launch chain fires through the
brain; only the wave-5 seed was missing. If kills rise but
kill:death falls below 0.92, the review will say the lever buys
kills with deaths and the bar holds as NO-GO. The
per-encounter recorder removes the diag's blind spot (party
size + flee/fight per fight); if the recorder itself misses
fights (e.g. aid fights bypassing the wrap), the review will
name the gap.
