# sim-killfail-a — PREREG (binding)

Run: fleshout-20261116T0825Z (Loop A), axis scale-onramp, arm
sim-killfail-a — DIAG: why launched wave-4 parties get 0 kills.
Branch `sim-killfail-a` (worktree
`~/workspace/worktrees/sim-killfail-a`). Base: master at arm
start, branch tip `2b552433e` (coordinator evidence commit for
round 0645). Binding prereg: THIS file — frozen before any
judged sim. The instrument (driver, analyzer, panel builder,
proof test) is built AFTER this commit; no judged numbers
exist yet. DIAG, instrument-only: NO src/js change in this
arm, like rumorplan-a.

## The question, in plain words

The launchdef-a pilot (0645Z) proved launched wave-4 parties
now happen — 6 wave-4+ instances on 4 of 8 seeds — but 0
wave-4 kills by any of the six launchers. The sense-test
showed launched parties fight real wave-4 monsters with real
lines (Tashi vs The Eulogy, Adaeze vs The Eater fleeing at
1 HP) and get mauled. The next binding link is killing, not
leaving. This DIAG decomposes EVERY launched wave-4+ party
fight on a fresh band: how big was the party when it met the
beast, did the village know the beast's trick, did the
fighters have ammunition, what gear and health did they walk
in with, what did they deal, how long did they last — and
which of those, ranked, explains why the kill never comes.

## Prior art (read first)

- `evidence/2026-11-16/sim-launchdef-a.md` + prereg — the 6
  launched instances, 0 kills, the sense-tested fights
  (Tashi/Eulogy, Adaeze/Eater, Peyton/Eater, Brian/Eulogy),
  the gate fix (PROFILEGATE bypass, now in this tree).
  This arm's population is the same KIND of fight on a
  fresh band under pure master + gate fix.
- `evidence/2026-11-16/sim-rumorplan-a.md` + prereg — the
  launch taxonomy reused here (broad vs strict wave-4+
  launch, expedition-start gating, trip windows), the
  48 broad / 12 strict launched plans on band
  102011–102018, the 27 target-null trips that met a
  wave-4 monster (evade 22, fled 13). DIAG-GO.
- `evidence/2026-11-15/sim-ammocensus-a.md` + prereg —
  the ammo classifier reused verbatim here
  (`classifyFighter`): 50% of ranged-carrying fighters dry
  at wave-4 meetings, 44.4% of all ranged carriers dry.
  Do NOT re-run that census — it is a known factor; this
  arm measures the fight outcomes it feeds.
- `evidence/2026-11-15/sim-producerparty-b.md` (Loop B) —
  the failed link is the gate SEEK (0 in either leg): the
  launch forms a party of 2 while the gate demands 3 for
  wave 4+. Party size at the gate is a named candidate
  factor; this arm measures party size AT CONTACT (which
  can differ from the gate party).
- Loop B is LIVE on this chain (gatelever-b: launched
  party arrives as 3 + trick known + plan names the beast;
  poolmarginals-b: companion-pool marginals). Do NOT build
  or measure those. This DIAG is the baseline
  decomposition their lever will move. Loop B's
  gatelever-b evidence (run 0730Z, already written) notes
  37/37 wave-4 gate nulls on its lever leg had an unknown
  trick — a PRIOR, not this arm's measurement; this arm
  measures trick-known at contact independently, on its
  own band, and must not copy that number.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  (wave 4 "The Mirror Draft", wave 5 "The Producers").

## Tree state at arm start (observed, not assumed)

- The gate fix IS in this tree: `PROFILEGATE
  (sim-profilegate-a)` in `src/js/villager-agency.js:383`.
- The world-tick seed call is NOT in this tree: no
  `winPlanSeedFromFight` in `src/js/game.js` (reverted by
  launchdef-a `b735283cd`). Launches on this band come
  from the remaining seed sites (agency `'evaded'` /
  `'fled'`, fight-gate `'avoided'`) plus rumor-born plans —
  exactly the rumorplan population. The launchdef six
  launchers (seed-call leg) are prior-art reference, not
  this arm's population.

## Code facts the taxonomy is built on (read from src, frozen)

Verified on this tree before this prereg:

1. `fieldFight(vid, mdef, m, opts)` (`src/js/fieldFights.js:472`)
   returns `{ outcome, rounds, vTaken, mDealt, vHpLeft,
   mHpLeft, packCount, log[], allyDealt, calledHelp,
   allyVid, fleeHpFrac, ... }`. Outcome is one of
   `'evade' | 'vKill' | 'mFlee' | 'vFlee' | 'vDie'`.
   `mDealt` accumulates ALL party damage (lead + allies:
   the ally-damage line adds to both `mDealt` and
   `allyDealt`). `m` is the world-monster entity; wounds
   persist onto `m.hp`. `opts.allies` / `opts.allyVids`
   name the fighters present at contact.
2. `Game.villageKnowsTrick(mid)` (`src/js/game.js:36386`)
   is the unified "does the village know this beast's
   trick" read; `noteVillagerTrickObservation`
   (`:36401`) records survived-encounter observations
   into `state.villagerTricks` (two observations teach
   the village). `fieldFights.js:561` reads
   `villageKnowsTrick` for the learn-vs-fight judgment.
   Waves 3–5 carry no `counter` data field — their
   counterplay is the signature mechanics, learnable
   through this same channel
   (`docs/MONSTER-WAVES.md` §Monster counters).
3. The fight gate (`src/js/win-plan.js:510`): wave ≥ 4
   requires `party.length >= 3 AND allArmed AND
   allArmored`, else `{ avoid: true, reason:
   'outmatched' }`. Party size 3 is the gate's bar, not
   this arm's invention. The gate is consulted only on
   expedition meetings (`winPlanFightGate`); wild
   meetings bypass it.
4. The ammo classifier is the ammocensus frozen one
   (`scripts/ammocensus-driver-20261115.js`,
   `classifyFighter`): equipped ranged entry is a REAL
   ranged weapon only when `weapon.type === 'ranged'`
   AND `weapon.ammo` is set; ammo is counted from the
   carrier's own items (id or material match); a spear
   in the ranged slot is recorded as melee, not ranged;
   `effectivelyArmed` = melee weapon OR (ranged weapon
   with ≥1 ammo). Class: `armed-with-ammo` /
   `armed-no-ammo` / `unarmed`.
5. Fighter HP at contact is readable pre-fight from
   `((Game.state||{}).village||{}).health||{})[vid]`
   (the dawnbid census read); armor P from
   `S.equipment.armorOf(person, items)`, weapon bonus
   from `weaponBonusOf` (the rumorplan `gearOfReplica`
   read). All are pure reads.
6. A launch event is an expedition START via
   `winPlanDepart` / `vbrainExecuteDepart` returning
   `'launch'` (rumorplan Correction 1: a depart call
   returning `'launch'` for a villager already out is a
   repeat, not a launch; the recorder gates on
   exped false → true).

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`,
  wave 4; 10, re-read live by the driver):
  `algorithm`, `audit`, `congregation`, `eater`,
  `eulogy`, `herald`, `influencer`, `reunion`, `strike`,
  `suburb`.
- **Wave-5 monster ids** (from `src/data/monsters.json`,
  wave 5; 10, re-read live by the driver):
  `cancellation`, `editor`, `finale`, `finale_crew`,
  `finale_opening`, `network_note`, `nielsen`, `rerun`,
  `spoiler`, `timeslot`. (Doc drift carried forward:
  `docs/MONSTER-WAVES.md` lists 9 wave-4 and 8 wave-5
  monsters; the data has 10 and 10. The data rules.)
- **A launch event** = one expedition start via a depart
  call returning `'launch'` (rumorplan rows, one per
  participant: inviter + each companion), grouped by
  (day, inviter). `launchedPartySize` = the inviter's
  post-call party length (partyAfter).
- **A wave-4+ launch event (BROAD)** = a launch event
  where ANY participant row satisfies ANY of:
  (a) `needWaveAfter` ≥ 4; (b) `targetAfter` is a
  wave-4 or wave-5 monster id; (c) the inviter's plan
  instance has a wave-4 `v4seeds` row dated ≤ launch
  day. **STRICT** = (a) or (b) only. Both counts are
  reported; the population uses BROAD (the rumorplan
  definition, so rumor-born target-null launches with
  needWave 4 count — they are launched wave-4 parties).
- **Trip window** (per launch participant, rumorplan Q3
  rule): [launch day, first census day after launch on
  which the holder is no longer on expedition
  (`seedattachCensus.holderExped` false), capped at
  launch day + 14]. A fight joins a launch event when
  its day falls inside the window of the fighter OR any
  ally present at contact.
- **A launched wave-4+ party fight (the population)** =
  a `fieldFight` row vs a wave-4 or wave-5 monster
  (a `killfailFights` row) whose fighter or any ally at
  contact has an active trip window for a BROAD wave-4+
  launch event covering the fight day. `joinKind` is
  recorded: `fighter` (the fighter's own window) or
  `ally` (only an ally's window covers it). Wave-4 and
  wave-5 fights are reported split.
- **A wild wave-4+ fight (comparison set, secondary)** =
  a `killfailFights` row vs a wave-4/5 monster with NO
  covering window. Same fields, same classifier — the
  comparison is kill rate and damage/round, launched vs
  wild, on identical seeds.
- **Fight fields (ALL required for classification)** —
  recorded by the driver at contact (pre-fight) and at
  close (post-fight), per fight:
  - launch: event id (day + inviter), fighter's role in
    the launch (`inviter` / `companion`), launched
    party size, plan target / needWave / stage at
    launch, target named or null;
  - contact: party size at contact (1 + `opts.allies`),
    ally vids present, gate row if consulted
    (`winPlanFightGate` result / reason / partySize);
  - trick: `trickBefore` and `trickAfter`
    (`villageKnowsTrick(mid)`);
  - per person (fighter + each ally at contact, +
    called-help ally post-fight): ammocensus class
    (`armed-with-ammo` / `armed-no-ammo` / `unarmed`),
    ranged weapon id, ammo need id, ammo units,
    melee weapon id, `effectivelyArmed`, `gateArmed`,
    armor P, weapon bonus, HP at entry;
  - monster: id, wave, HP at entry (`m.hp` || `mdef.hp`),
    HP left at close (`rec.mHpLeft`);
  - outcome: `rec.outcome`, rounds (`rec.rounds`),
    damage dealt by the launcher party (`rec.mDealt`,
    split lead vs allies via `rec.allyDealt`),
    damage taken (`rec.vTaken`), fighter HP left,
    flee HP fraction, volley `{shots, hits, dmg}`,
    fight log (first 20 lines).
  A fight missing ANY field is `unclassified` (the
  analyzer names which field is missing per fight).
- **Failure-mode flags (multi-label, per fight)** —
  each fight carries every flag whose predicate holds:
  - `trick-unknown` — `trickBefore` false.
  - `party-short` — party size at contact < 3 (the
    gate's bar).
  - `launched-short` — launched party size < 3.
  - `dry-fighter` — fighter class `armed-no-ammo`.
  - `no-working-range` — no person at contact is
    `armed-with-ammo` (the party has no working ranged
    weapon at all).
  - `under-geared` — fighter armor P < 10 (the
    readiness wave-4 bar) OR fighter NOT
    `effectivelyArmed`. Sub-split reported:
    `unarmored` (armor P < 10) / `unarmed`
    (!effectivelyArmed).
  - `fled-early` — outcome `vFlee` AND rounds ≤ 2.
  - `out-damaged` — `mDealt` < 25% of monster HP at
    entry.
  - `mauled` — `vTaken` ≥ 50% of fighter HP at entry.
  - `died` — outcome `vDie`.
  - `evaded` — outcome `evade` (no contact fight).
  - `drove-off` — outcome `mFlee` (monster fled; not a
    kill, not a loss).
- **Primary failure mode (single label per non-kill
  fight, precedence — first match wins, frozen)**:
  1. `evaded` (outcome evade)
  2. `died` (outcome vDie)
  3. `fled-early` (vFlee, rounds ≤ 2)
  4. `drove-off` (mFlee)
  5. `out-damaged` (vFlee with rounds ≥ 3, mDealt < 25%
     monster HP)
  6. `trick-unknown` (trickBefore false; fought ≥ 3
     rounds, dealt ≥ 25%)
  7. `dry` (fighter dry)
  8. `party-short` (contact party < 3)
  9. `under-geared` (armor P < 10 or !effectivelyArmed)
  10. `other` — fought, none of the above; each such
      fight is named individually in the evidence.
  Kills (`vKill`) carry primary mode `killed` and are
  NOT in the failure table. The multi-flag table carries
  the distal conditions regardless of precedence, so a
  low precedence never hides a condition.
- **Instrument error:** any non-empty
  `instrumentErrors`, any per-seed file failing to
  parse, any fight whose launch join is ambiguous
  (two covering events — the analyzer names it and
  counts it once, first event wins, flagged).

## Primary metric + GO bar (frozen)

GO (DIAG-GO: instrument valid, launched fights decomposed)
iff ALL hold:

1. **≥90% of launched wave-4+ party fights classified
   with ALL fields, unknown ≤10%.** Population floor:
   **≥5 launched fights** — fewer is DIAG-NO-GO on
   population (an instrument unproven in the wild is not
   valid, however clean its fixtures). Prior for the
   floor: rumorplan's band yielded 27 target-null trips
   meeting a wave-4 monster; launchdef's yielded 6
   launched instances.
2. **Corpus 8/8 files parse** (main leg) **+ 8/8**
   (replication leg), identical seeds, 0 instrument
   errors.
3. **Neutrality proven:** drift smoke clean (no
   pre-seed divergence; main vs replication IDENTICAL
   on all 8 seeds) AND determinism legs green (D1 +
   D2 below) AND the §15 panel compare main→replication
   shows no material signal.
4. **Proof test `scripts/test-killfail-a.js` green.**
5. **Ranked failure-mode table produced:** every
   non-kill launched fight carries a primary mode;
   `other` rows are named individually in the
   evidence.

This is a DIAG: GO means the instrument is valid and the
launched fights are decomposed. It is NOT a lever GO — no
game change is judged, and nothing ships from this arm
except the instrument + evidence. A GO with 0 kills still
answers the question ("0 kills, and here is why, ranked")
— that IS the answer, not a failed run.

## Secondary (reported, not judged)

- Outcome table for launched fights: vKill / mFlee /
  vFlee / vDie / evade, with rounds + damage dealt
  distributions per outcome; wave-4 vs wave-5 split;
  strict-subset counts alongside broad.
- Flag-prevalence table among non-kill launched fights
  (each flag's share, with denominators named).
- Wild comparison: kill rate, median damage/round,
  median rounds, flee share — launched vs wild on the
  same band.
- Per-seed table: launched events, launched fights,
  kills, median damage dealt per fight, median rounds.
- Per-fight table (every launched fight, one row):
  seed/day/fighter/monster, party sizes (launched vs
  contact), trick, fighter class + ammo, armor P, HP
  entry, outcome, rounds, mDealt, flags, primary mode.
- Gate rows joined to launched fights (seek / avoid /
  outmatched / not-consulted) — the gate's verdict on
  the same meetings.
- Wall numbers (BOTH legs): national / table / wins,
  wave-4/5 unlocks, median survival — national reported
  BOTH ways (scaleRank ≥ 2 and standing ≥ 200).
- Sense check: quote ONE launched fight end to end
  from the main leg (`killfailFights[].log[]` + launch
  rows) — what the party planned, what they met, how
  the fight read — with seed, day, fighter, monster
  named. Judge meaning, not counts.

## Seed band (verified fresh per the seed-band-freshness skill)

- **102041–102048** (8 seeds), 150d death-aware.
- Leg 1 (judged): **tableseat-nowait**
  (`scripts/policies/tableseat-nowait.js`) with
  **`TABLESEATNOWAIT=1 LEANLINKRESCUE=1` on BOTH legs**
  — a REAL tableseat-nowait baseline (the 0446Z
  cross-arm lesson: default env collapses to competent).
- Leg 2 (replication): identical policy / env / seeds
  — a full-corpus determinism replication. The JUDGED
  classification is leg 1 only; leg 2 is classified as a
  cross-check and must match leg 1's trajectories.
- Freshness check (this arm, before this commit — scope
  and result): zero whole-token hits for `102041`–
  `102048` in (a) all `*.md` under `evidence/` (rg
  rc=1), (b) `scripts/*.js` driver band literals (rg
  rc=1), (c) per-seed filenames under `evidence/`
  (no `10204[1-8]` file), (d) the goal `hidden_files/`
  tracker, lever-claims, and findings `.md` (rg rc=1).
  The ONLY hits anywhere are float fragments inside old
  `.json` analysis files (e.g. `0.3469387755102041` in
  `evidence/2026-10-21/prodrebuff-pilot-analysis.json`
  — the digits `102041` inside a decimal, not a seed;
  same class as the coordinator's 0446Z kcal-float
  note). Neighbouring used bands: 102011–102018
  (launchdef/rumorplan), 102001–102008 (Loop B — do not
  use). NEVER 100521–100536, 190391–190398,
  190621–190628, 190631–190638, 190541–190548,
  190561–190568 (task-forbidden bands).

## Horizon, policy, legs, panel applicability

- Horizon 150 days, death-aware (dead villages stop
  simulating; runs end early on win or village loss).
- Leg 1 (judged): tableseat-nowait + recorder, flags on,
  seeds 102041–102048.
- Leg 2 (replication): tableseat-nowait + recorder,
  flags on, IDENTICAL seeds.
- **§15 balanced panel:**
  `scripts/build-killfail-panels-20261116.js` (copied
  from `scripts/build-rumorplan-panels-20261116.js`,
  panel-building logic UNCHANGED; only leg dirs, file
  names, seeds, pseudo-policy change) builds panels in
  the `scripts/balance-panel.js` schema from the two
  legs: before=leg 1 (main), after=leg 2 (replication),
  PAIRED seeds on the same tip, pseudo-policy
  `killfail-a` in both panels. Expected: no material
  signal — the two legs are the same policy on identical
  seeds, so the compare is a replication/neutrality
  check, and any signal is a nondeterminism finding,
  not a lever effect. The panel is the instrument; the
  prereg bars are the judge. The `compare` `.md` is
  attached to the evidence file.
- **Sibling-file note:** this arm touches NO src file.
  All files are new names under `scripts/killfail-*`
  and `evidence/2026-11-16/*killfail*` — no overwrite
  of the rumorplan/launchdef instrument files, no merge
  sequencing needed on src.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** main leg tip, seed 102041, 60d,
  recorder ON, run twice → identical per-seed JSON
  (deaths/days/endReason/vet5 + all killfail rows
  identical).
- **D2 (wrap neutrality):** main leg tip, seed 102041,
  60d, recorder ON vs recorder OFF
  (`KILLFAIL_RECORDER=off`) → identical trajectories
  (deaths/days/endReason/standing/vet5 + daily
  fingerprints). The recorder wraps are the only
  difference between the legs — D2 isolates them.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js`
  over the main corpus vs the replication corpus —
  first divergence on/after the first `v4seeds` day per
  seed; the two legs are the same policy on identical
  seeds, so the expected verdict is IDENTICAL on all 8
  seeds, NO PRE-SEED DRIFT. Any divergence is a
  nondeterminism finding and fails the run. (The driver
  carries the same `v4seeds` rows + T-class fingerprints
  as rumorplan, so the same check applies verbatim.)

## The instrument (frozen)

- Driver: `scripts/killfail-driver-20261116.js` (new —
  the rumorplan driver adapted, not rebuilt: same
  vetfirst T-class instrument, same `v4seeds` /
  `v4departs` / `v4gates` / `v4encounters` recorder,
  same dawnbid capture rows, same seedattach capture
  rows, same rumorplan launch rows + target diffs,
  PLUS the killfail capture below). Recorder wraps are
  pure reads plus writes to driver-local arrays — no
  game-state writes, no RNG. The driver refuses to
  overwrite an existing per-seed file.
  `KILLFAIL_RECORDER=off` skips installing ALL wraps
  (inherited + new; used by determinism leg D2).
  `LEG=competent|tableseat-nowait` selects the leg
  policy (default tableseat-nowait for this arm).
  Errors are REPORTED into `instrumentErrors` (named,
  not swallowed).
- Killfail rows (per seed, in addition to every
  rumorplan row):
  - `killfailFights` — one row per `fieldFight` vs a
    wave-4 or wave-5 monster: the frozen fight fields
    above (launch join fields filled by the ANALYZER,
    not the driver: the driver records the fight +
    the fighter/allies' pre-fight state; the analyzer
    joins launches to fights). The pre-fight snapshot
    (classifyFighter + armor P + weapon bonus + HP at
    entry, for fighter + each ally at contact) is
    taken BEFORE the original `fieldFight` call; the
    close fields (outcome, rounds, mDealt, allyDealt,
    vTaken, vHpLeft, mHpLeft, fleeHpFrac, volley, log)
    are taken from the returned record AFTER the call.
    The driver ALSO carries the rumorplan `v4encounters`
    row for the same fight (unchanged) so the two
    recorders cross-check (same fight, same outcome).
  - The ammo classifier is copied VERBATIM from the
    ammocensus driver (`classifyFighter` + `defOf` /
    `entryId` / `entryMaterial` / `entryUnits` /
    `ammoIdSet` / `countAmmo` / `gateArmedOf`) — no
    re-derivation, no drift from the frozen census.
  - Output also carries `wave5Ids` (live wave-5 list)
    next to `wave4Ids`.
- Analyzer: `scripts/analyze-killfail-a.js` (new).
  Builds launch events from `rumorplanLaunches`,
  trip windows from `seedattachCensus`, joins
  `killfailFights` to events, classifies every fight
  (flags + primary mode per the frozen precedence),
  prints the outcome table + flag-prevalence table +
  ranked primary-mode table + per-fight table +
  per-seed table + wild comparison + wall numbers for
  both legs, writes
  `evidence/2026-11-16/killfail-a-analysis.json`,
  exits non-zero on any bar failure.
- Panel builder: `scripts/build-killfail-panels-20261116.js`
  (new; see §15 above).
- Drift check: reuse `scripts/vetparty-drift-check.js`
  verbatim.
- Proof: `scripts/test-killfail-a.js` (new; see below).
  GREEN on the instrument tip before the main leg runs.

## Proof test

`scripts/test-killfail-a.js` proves, on synthetic fixtures
and live in-memory runs (no corpus numbers):

- Static: NO src diff on this branch (`git diff
  master...HEAD -- src/` empty — instrument-only); the
  driver wraps exist (incl. the killfail fieldFight
  wrap and the ammo classifier, copied verbatim from
  the ammocensus driver — the proof asserts the copied
  function text matches the ammocensus source on the
  frozen lines); the wave-4 AND wave-5 id sets match
  `src/data/monsters.json` exactly (10 + 10 ids); the
  taxonomy's code anchors still hold (fieldFight
  return fields; gate party-3 bar at `win-plan.js:510`;
  `villageKnowsTrick` at `game.js:36386`).
- Unit (classifier, synthetic fixtures): one fixture
  per primary mode (evaded, died, fled-early,
  drove-off, out-damaged, trick-unknown, dry,
  party-short, under-geared, other, killed); precedence
  (a fight that is trick-unknown AND dry AND
  party-short classifies by the frozen order; a
  vFlee at 2 rounds with low damage is fled-early, not
  out-damaged; a vFlee at 5 rounds with low damage is
  out-damaged, not fled-early); flag independence (a
  fight can carry trick-unknown + dry + party-short at
  once and all three are counted); the under-geared
  sub-split (unarmored vs unarmed counted separately);
  the `other` residue (a fought, geared, known-trick,
  3-person, ammo-fine vFlee at 4 rounds with 40%
  damage lands in `other`); unknown on a missing field
  (each required field dropped in turn → unclassified
  with the field named).
- Unit (join, synthetic fixtures): a fight inside a
  participant's trip window joins that launch event
  (fighter window and ally window); a fight one day
  past the +14d cap does not join; a fight the day
  the holder returns (census exped false) does not
  join; a fight with two covering events joins once
  (first event wins, flagged ambiguous); a wild fight
  (no window) is wild, not launched; strict vs broad
  (a target-null needWave-4 launch is broad, not
  strict; a named-target launch is both).
- Recorder: synthetic fixtures for the killfail row
  shape; a live in-memory run proves the fieldFight
  wrap records BEFORE-state (ammo class, armor P, HP
  at entry, trickBefore) for fighter + allies and
  AFTER-state (outcome, rounds, mDealt, log) — a proof
  that only shows no-throw proves plumbing, not effect.
- Determinism: D1 + D2 as frozen above (seed 102041,
  60d).
- GREEN on the instrument tip before the main leg runs.

## Sense-testing

Quote ONE launched fight end to end from the main leg:
what the party planned (launch rows: target, party,
stage), what they met, how the fight read
(`killfailFights[].log[]`) — with seed, day, fighter,
monster named. Judge whether the fight reads like a
party that went out to kill a named beast and failed,
or a party that wandered into something it could not
hurt. Do not invent fight narrative from kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft"
  (standing ≥ 100; bands damage 35–95, HP 850–1500,
  pierce 0.2–0.5; readiness wave 4: 3 armored P≥10,
  5 armed, 3 tricks, 1 wave-3+ killer). Wave 5 "The
  Producers" (standing ≥ 200 AND wave-4 faced; bands
  damage 50–130, HP 1000–2200, pierce 0.25–0.75).
  Doc drift noted: the doc lists 9 wave-4 monsters
  and 8 wave-5; the data has 10 and 10 (`herald`;
  `finale_crew` / `finale_opening`).
- No canon doc covers plan-target attachment or the
  win-plan lifecycle beyond `src/js/win-plan.js`
  (ontology header) and the dated evidence — this
  prereg says so rather than inventing canon. The
  fight itself is canon-covered: "Monster encounters
  are fought, not rolled" (CANON.md) — every fight
  here is a real blow-by-blow `fieldFight`, never an
  outcome table.

## Lever candidate (named, NOT built — for the next round)

If the ranked table names a dominant mode, the next
round's lever is pre-registered ONLY as a candidate
here and built by the next arm, not this one:

- If `trick-unknown` dominates: a trick-teaching lever
  (faster `noteVillagerTrickObservation` → village
  trick for wave-4 beasts, e.g. a survived encounter
  teaching in one observation instead of two). GO bar
  for that arm: launched wave-4+ party kill rate ≥ 2×
  this arm's main-leg rate on a fresh band, 8 seeds.
- If `party-short` dominates: the launched-party-
  arrives-as-3 lever (already Loop B's gatelever-b —
  do NOT duplicate; this arm's number is its baseline).
- If `dry` / `no-working-range` dominates: an ammo-
  supply lever (stones/arrows carried on launch).
  GO bar for that arm: launched fights with a working
  ranged weapon ≥ 2× this arm's rate AND kill rate
  up, same band shape.
- If `out-damaged` dominates with trick known and gear
  fine: a damage lever (the wave-4 HP/damage bands
  themselves — a Steve-call scale, not a quiet knob).

## Metric review (to be filled in the evidence file)

Pre-registered here: if launched fights are 0, the
review will say so with the launch-event denominator
(launched events that produced no fight are not
fights — the population is fights, and 0 fights is
DIAG-NO-GO on population, not a 0% kill rate). If the
wild comparison shows wild fights killing at the same
rate as launched fights, the review will say the
failure is wave-4-wide, not launch-specific. If the
`other` residue is non-zero, the review will name
each such fight. No re-scoring mid-run: the flags,
precedence, and join rules above are the judge.
