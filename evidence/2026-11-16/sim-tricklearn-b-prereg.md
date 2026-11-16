# sim-tricklearn-b — PREREG (binding)

Run: fleshout-20261116T1315Z (Loop A), axis winnability chain,
tracker blank #2 DIAG — trick learning. Arm sim-tricklearn-b.
Branch `sim-tricklearn-b` (worktree
`~/workspace/worktrees/sim-tricklearn-b`). Base: master at arm
start, `5eedd695b`. Binding prereg: THIS file — frozen before
any judged sim. The instrument (driver, analyzer, panel
builder, proof test) is built AFTER this commit; no judged
numbers exist yet. DIAG, instrument-only: ZERO src/js
game-code change in this arm.

## The question, in plain words

Villagers face wave-4 beasts with the trick unknown 9 times
out of 9 (killfail-a: 9 launched wave-4 fights, 0 kills,
trick-unknown 9/9), and 37 of 37 wave-4 gate nulls on the
gatelever-b lever leg had an unknown trick. One survived
encounter records ONE observation; TWO are needed to teach a
trick — so the trick stays unknown after the fight as well as
before. Is there ANY path that teaches a wave-4 trick fast
enough for a 7-day trick-wait to matter, or does the wait only
ever expire? This is a DIAG arm: measure, do not build a
lever.

## Prior art (read first)

- `evidence/2026-11-16/sim-killfail-a.md` + prereg — the 9
  launched fights, 0 kills, trick-unknown 9/9, trickAfter
  false on all nine; the recorder patterns this arm reuses
  (killfail driver + analyzer + panel builder); the
  killfailFights fight fields (trickBefore/trickAfter).
- `evidence/2026-11-16/sim-gatelever-b.md` + prereg — the
  7-day trick-wait (part 2) and its metric review #4: the
  wait engaged (27 dawn wins) but no hold row was ever
  recorded (holds land outside the depart recorder); the
  only wait releases visible were 3 expiry marks; no wait
  was ever shown released because the village learned the
  trick; 37/37 lever-leg gate nulls had an unknown trick.
  This arm measures the wait question on PURE master
  (no lever), with an instrument that CAN see holds.
- `evidence/2026-11-16/sim-seedpaths-b.md` + prereg — the
  seed-path recorder extension pattern (wrap + classify
  from stack/caller, explicit `unknown-*` never silent);
  the havenTick fifth plan-creation path (not this arm's
  subject; do not count it here).
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  (wave 4 "The Mirror Draft"; §Monster counters: waves
  3–5 carry no `counter` field; learnable through
  `noteVillagerTrickObservation` — two observations teach
  the village the trick).

## Canon gap (recorded, not invented)

No canon doc covers trick-learning rates — how fast
observations accumulate, how often a trick is learned, or
what a trick-wait should cost. This prereg records that gap
instead of inventing canon for it.

## Code facts the taxonomy is built on (read from src, frozen)

Verified on this tree before this prereg:

1. `_trickObservation(vid, mid, firstPerson)`
   (`src/js/game.js:36419`): the shared observation core.
   The bar is SHARED per species —
   `state.villageCounterObs[mid]`, threshold 2. Early
   returns: no mdef, no trick for the species
   (`!mdef.counter && !defs[mid]`), already known.
   At obs 2: waves 1–2 via `discoverMonsterCounter(mid,
   'observed'/'scholar-observed')`; waves 3–5 by setting
   `state.villagerTricks[mid] = true` directly. The bar
   counts OBSERVATIONS per species across the whole
   village, not per villager — "per villager per monster
   type" in this arm means each recorded observation
   carries its contributing villager.
2. `noteVillagerTrickObservation(vid, mid)`
   (`game.js:36401`) is called from exactly ONE site:
   `src/js/fieldFights.js:2747`, for outcomes `vFlee` /
   `mFlee` / `evade`, lead fighter `vid` only (allies get
   no call). BUT the fieldFight evade path early-returns
   at `fieldFights.js:911` (`rec.outcome = 'evade' ...
   return rec;`) BEFORE the deed/observation section at
   :2725 — so a fieldFight evade records NO observation,
   despite 'evade' appearing in the :2747 condition.
   That is a code-reading claim the instrument must
   confirm or refute with event counts (evade rows with
   zero observation events), not an assumption the
   analyzer bakes in.
3. `vKill` records NO observation; `vDie` records none.
   ("Kills teach via the slain path" — but the slain
   path is `recordWaveKill` → codex hint, which needs a
   `counter` field; see #6. For waves 3–5 a kill teaches
   nothing about the trick.)
4. `noteScholarTrickObservation(mid)` (`game.js:36415`)
   is called from exactly ONE site:
   `game.js:47568` (tbFight end), for scholar outcomes
   `fled` / `routed` / `calmed`, scholar alive, one
   observation per DISTINCT beast type per fight.
5. `noteNodeWitnessKill(vid, mid, witnesses)`
   (`game.js:36492`) is called only when `NODEWITNESS=1`
   in the environment (`fieldFights.js` vDie block) —
   OFF by default in sims. This arm does NOT set it.
   One witnessed kill = one observation credit on the
   same shared bar.
6. `discoverMonsterCounter(mid, via)` (`game.js:36215`)
   returns false for waves 3–5 (`if (!mdef ||
   !mdef.counter) return false`). So the `beasttricks`
   teaching channel (`game.js:5025`, askAbout topic,
   `discoverMonsterCounter(teachable, 'taught')`) and
   the Codex hint channel CANNOT teach a wave-4 trick.
   `counterTeachable()` (`game.js:36310`) skips every
   species without a `counter` field. `checkMonsterCounter`
   (`game.js:36252`, perform-the-trick) returns false for
   waves 3–5 for the same reason. There is NO
   villager-to-villager trick-teaching path in code and
   NO codex path that writes `villagerTricks`.
7. The ONLY writers of `state.villagerTricks` in src are
   `_trickObservation` (`game.js:36446`) and
   `noteNodeWitnessKill` (`game.js:36521`). Any learn the
   analyzer finds without a matching observation trail
   is an unclassified learn and fails bar 2.
8. Gate trick-hold (`src/js/win-plan.js:537`): wave >= 4,
   isTarget, partyOk → trick unknown returns `null`
   (bump `trickHolds`) instead of seek. There is NO
   7-day wait mechanism on current master: `grep
   trickWaitedFor src/` = 0 hits. The 7-day wait was
   gatelever-b part 2 LEVER code (reverted, not in this
   tree). The 7-day window in this DIAG is
   OBSERVATIONAL (see Frozen definitions) — the first
   trick-hold day stands in for the wait's arming day.
9. `villagerTrickDefs()` (`game.js:36331`) covers all
   wave-4 ids (10, incl. `herald`) and all wave-5 ids
   (10). Wave-4/5 id sets are re-read live from
   `src/data/monsters.json` by the driver (killfail
   frozen lists: wave 4 `algorithm, audit,
   congregation, eater, eulogy, herald, influencer,
   reunion, strike, suburb`; wave 5 `cancellation,
   editor, finale, finale_crew, finale_opening,
   network_note, nielsen, rerun, spoiler, timeslot`).
10. The gate is consulted only on expedition meetings
    (`winPlanFightGate`); wild meetings bypass it. The
    trick-hold null is therefore visible only on
    expedition meetings — wild survived encounters still
    record observations (they are the main pipeline).

## Frozen definitions

- **Observation event** = one recorded call to
  `noteVillagerTrickObservation` / `noteScholarTrickObservation`
  / `noteNodeWitnessKill` for a wave-3/4/5 species (waves
  1–2 events are recorded too, but the judged tables are
  wave-4/5), OR one `discoverMonsterCounter` call for a
  wave-3/4/5 species (expected to return false; recorded
  to prove the taught/codex channels are dead for wave
  4). Each event carries: day, vid, mid, wave, source
  (the wrapped function), obsBefore/obsAfter (shared
  `villageCounterObs[mid]`), knownBefore/knownAfter
  (`villageKnowsTrick(mid)`), return value, caller frame,
  and fight context when the call happens inside a
  `fieldFight` wrap (day+vid+mid of the enclosing
  fight, driver-local marker).
- **Source classification** (every event gets exactly
  one; zero unclassified):
  - `fight-observed` — `noteVillagerTrickObservation`
    (villager survived fieldFight).
  - `scholar-observed` — `noteScholarTrickObservation`
    (scholar survived tbFight).
  - `node-witnessed` — `noteNodeWitnessKill` (expected 0;
    NODEWITNESS unset).
  - `taught` — `discoverMonsterCounter` call with
    via='taught' for a wave-3/4/5 species (expected 0
    learns; calls recorded, return false recorded).
  - `codex` — no code path writes `villagerTricks`
    from the codex (code-derived zero, §Code facts #6;
    not an event count — the analyzer reports it as
    0 with the citation, never as an invented row).
  - `other` — any observation event whose wrapper is
    none of the above (impossible by construction —
    the wraps ARE the sources), OR any
    `villagerTricks` learn found by the daily census
    diff with no matching observation trail. Any
    `other` row fails bar 2.
- **Trick-learned (species)** = `villagerTricks[mid]`
  false → true between daily censuses (first learn day
  recorded). **Observations-to-learn** = the count of
  recorded observation events for that species from run
  start to its learn day (expected 2 by the threshold-2
  rule; the distribution is the measurement — if a
  learn ever takes 1 or 3+, the analyzer names it).
- **Trick-known rate at gate checks** = share of
  wave-4+ `v4gates` rows with `trickKnown` true, split
  by result (seek / avoid / null) and by wave.
  **Trick-known rate at launched fights** = share of
  launched wave-4+ party fights (killfail join rules:
  trip windows from `seedattachCensus`, launch events
  from `rumorplanLaunches`, BROAD definition) with
  `trickBefore` true; denominator named. Wild fights
  reported as the comparison set.
- **Trick-hold gate row** = a wave-4+ gate row with
  result null AND stage hunt/standing AND isTarget AND
  partyOk AND trickKnown false, where isTarget =
  (targetWave != null && wave == targetWave) ||
  (planTarget == mid) || (stage == 'standing' &&
  wave >= 3), targetWave = needWave || planNeedWave,
  partyOk = partySize >= 2 && allArmed && (wave >= 4
  ? (partySize >= 3 && allArmored) : holder armored).
  The gate row carries needWave + planNeedWave so the
  analyzer can re-derive this without re-running the
  gate. (The gate returns bare `null` — the row's
  fields, not the return value, classify the hold.)
- **Wait window (observational)** = one episode per
  (seed, species): opens on the FIRST trick-hold gate
  row for that species on that seed; window [D, D+7]
  inclusive, D = first-hold day. Outcome: `learned`
  if `villagerTricks[species]` is true on any daily
  trick census day ≤ D+7 (equivalently an observation
  event reaches obs 2 inside the window); `expired`
  if still unknown at the D+7 census. A second episode
  for the same (seed, species) opens only after the
  first closes AND a new trick-hold row occurs.
  Within-window activity recorded per episode:
  observations gained for the species, fights vs the
  species (killfailFights), launches targeting the
  species (rumorplanLaunches, inviter rows,
  targetAfter == species), gate rows for the species.
  The wait mechanism itself does not exist on master
  (§Code facts #8) — the episode table is the
  observational stand-in, and the evidence says so.
- **TrickAfter** = per killfailFights row:
  trickBefore → trickAfter. A fight "teaches" iff
  trickBefore false and trickAfter true. Observation
  events are joined to fights by the driver's fight
  context marker (same day+vid+mid inside the fight
  wrap); an event with no fight context is a
  non-fight observation (scholar tbFight, witness)
  and is never attributed to a field fight.
- **Instrument error:** any non-empty
  `instrumentErrors`, any per-seed file failing to
  parse, any observation event missing a required
  field, any learn without a matching observation
  trail, any wait-window episode without a classified
  outcome.

## Primary metric + GO bar (frozen)

GO (DIAG-GO: instrument valid, trick-learning pipeline
decomposed) iff ALL hold:

1. **Corpus 16/16 complete** (8 main + 8 replication
   files parse, identical seeds, 0 instrument errors).
2. **Classification coverage: zero unclassified.**
   Every observation event carries a named source;
   every `villagerTricks` learn has a matching
   observation trail (obs reaching 2); `other` rows 0.
3. **Neutrality proven:** determinism D1 (same seed
   twice identical incl. all trick rows) + D2
   (recorder ON vs OFF identical trajectories) green,
   and the §15 panel compare main→replication shows
   no material signal.
4. **Proof test `scripts/test-tricklearn-b.js` green.**
5. **Distinguishing power (substantive bar):** the
   wait-window table is produced with EVERY episode
   classified learned vs expired, with within-window
   counts attached; episodes ≥ 3 across the band AND
   total wave-4+ observation events ≥ 5. (If episodes
   < 3 or events < 5, the window question is
   under-powered → DIAG-NO-GO on power; the counts
   are still reported plainly, not re-scored.)
6. **Population floor:** ≥ 10 wave-4+ fieldFight rows
   total (launched + wild) on the main leg. The
   launched-fight trick-known rate is reported with
   its denominator named even if 0 launched fights
   occur (0 launched fights = a finding about the
   competent policy on this band, not a 0% rate).

This is a DIAG: GO means the instrument is valid and
the trick-learning pipeline is decomposed. It is NOT a
lever GO — no game change is judged, and nothing ships
from this arm except the instrument + evidence. A GO
with 0 tricks learned still answers the question ("0
learned, and here is the observation pipeline that
starves it") — that IS the answer, not a failed run.

## Secondary (reported, not judged)

- Observation counts per villager per monster type, by
  source (the (a) table): rows (seed, vid, mid) with
  per-source counts; pooled per-species totals.
- Observations-to-learn distribution vs threshold 2:
  per learned species the obs count at learn; per
  unlearned species the obs count at run end (0/1/2+).
- Trick-known rate at gate checks (by result, by wave)
  and at launched fights (denominator named) + wild
  comparison.
- Wait-window episode table (every episode: seed,
  species, D, outcome, within-window observations /
  fights / launches).
- TrickAfter transitions: fights where trickAfter
  flips false→true, per species; fights per species
  vs observations per species (the starvation table).
- Per-seed table: days, end, standing, maxWave,
  tricks learned (wave-4/5), observation events,
  episodes (learned/expired), launched fights.
- Wall numbers (BOTH legs): national / table / wins,
  wave-4/5 unlocks, median survival — national
  reported BOTH ways (scaleRank ≥ 2 and standing ≥
  200), `won` glossed as seat-taken under the policy,
  not a full-seat win.
- Sense check: quote ONE trick-relevant passage end
  to end from the main leg — a survived encounter's
  observation beat (`(n/2 — one more survived
  encounter...)`) or a COUNTER LEARNED beat if one
  fires, or a trick-hold gate moment — with seed, day,
  villager, monster named. Judge meaning, not counts.

## Seed band (verified fresh per the seed-band-freshness skill)

- **102141–102148** (8 seeds), 150d death-aware.
- Leg 1 (judged): **competent verbatim**
  (`scripts/policies/competent.js`), sha256
  `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
  (matches the gatelever/seedpaths competent policy).
  Default environment — NO TABLESEATNOWAIT /
  LEANLINKRESCUE flags (competent verbatim means
  competent, not tableseat-nowait).
- Leg 2 (replication): identical policy / env / seeds
  — a full-corpus determinism replication. The JUDGED
  classification is leg 1 only; leg 2 is classified as
  a cross-check and must match leg 1's trajectories.
- Freshness check (this arm, before this commit):
  zero whole-token hits for `102141`–`102148` in (a)
  all `*.md` under `evidence/` EXCEPT two October
  single-seed fixture mentions of seed 102143
  (`evidence/2026-10-15/sim-aidspoil-b.md:132`,
  `evidence/2026-10-16/sim-floorday3-b.md:22` — a
  probe seed, not a band reservation, no corpus
  behind it as a band); (b) all `sim-*-prereg.md`
  under `evidence/` (rg rc=1, zero hits); (c)
  `scripts/*.js` driver band literals (rg rc=1);
  (d) per-seed filenames under `evidence/` (no
  `10214[1-8]` file); (e) the goal `hidden_files/`
  tracker/lever-claims/findings — the ONLY hits are
  this run's own claim
  (`lever-claims/fleshout-20261116T1315Z.json`), the
  sibling Loop B claim's collision note naming this
  run's band as NOT touched
  (`lever-claims/fleshout-loop-b-20261116T1321Z.json`),
  the tracker line for this run, and today's memory
  log (`~/memory/2026-11-16.md:473`, the coordinator's
  freshness confirmation for this same band). The
  remaining hidden_files hits are incidental game
  numbers inside old corpora (e.g. pantryKcal 102143 /
  102145 in log lines, float fragments in October
  `.json` analysis files — the digits inside a decimal,
  not a seed). Neighbouring used bands: 102011–102018
  (launchdef/rumorplan), 102101–102108 (gatelever-b),
  102131–102138 (seedpaths-b), 102201–102208 (Loop B
  this round — do NOT touch). NEVER 100521–100536,
  190391–190398, 190621–190628, 190631–190638,
  190541–190548, 190561–190568 (task-forbidden bands).

## Horizon, policy, legs, panel applicability

- Horizon 150 days, death-aware (dead villages stop
  simulating; runs end early on win or village loss).
- Leg 1 (judged): competent + recorder, flags on,
  seeds 102141–102148.
- Leg 2 (replication): competent + recorder, flags on,
  IDENTICAL seeds.
- **§15 balanced panel:**
  `scripts/build-tricklearn-panels-20261116.js` (copied
  from `scripts/build-killfail-panels-20261116.js`,
  panel-building logic UNCHANGED; only leg dirs, file
  names, seeds, pseudo-policy change) builds panels in
  the `scripts/balance-panel.js` schema from the two
  legs: before=leg 1 (main), after=leg 2 (replication),
  PAIRED seeds on the same tip, pseudo-policy
  `tricklearn-b` in both panels. Expected: no material
  signal — the two legs are the same policy on identical
  seeds, so the compare is a replication/neutrality
  check, and any signal is a nondeterminism finding,
  not a lever effect. The panel is the instrument; the
  prereg bars are the judge. The `compare` `.md` is
  attached to the evidence file.
- **Sibling-file note:** this arm touches NO src file.
  All files are new names under `scripts/tricklearn-*`
  and `evidence/2026-11-16/*tricklearn*` — no overwrite
  of the killfail/seedpaths instrument files, no merge
  sequencing needed on src. Sibling Loop B works band
  102201–102208 (trees sim-seasoning-b,
  sim-haventarget-b, sim-trickteach-b) — do NOT touch
  its trees, claims, or band. Sibling Loop A arms on
  this band (sim-seedland-b BUILD, sim-haventick-b
  DIAG) share no files with this arm.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** main leg tip, seed 102141,
  60d, recorder ON, run twice → identical per-seed
  JSON (deaths/days/endReason/vet5 + all trick rows
  identical, incl. trick observations, trick census,
  gate rows, killfail fights).
- **D2 (wrap neutrality):** main leg tip, seed 102141,
  60d, recorder ON vs recorder OFF
  (`TRICKLEARN_RECORDER=off`) → identical trajectories
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
  as killfail, so the same check applies verbatim.)

## The instrument (frozen)

- Driver: `scripts/tricklearn-driver-20261116.js` (new —
  the killfail driver adapted, not rebuilt: same
  vetfirst T-class instrument, same `v4seeds` /
  `v4departs` / `v4gates` / `v4encounters` recorder,
  same dawnbid capture rows, same seedattach capture
  rows, same rumorplan launch rows + target diffs,
  same killfailFights capture, PLUS the trick capture
  below). Recorder wraps are pure reads plus writes
  to driver-local arrays — no game-state writes, no
  RNG. The driver refuses to overwrite an existing
  per-seed file. `TRICKLEARN_RECORDER=off` skips
  installing ALL wraps (inherited + new; used by
  determinism leg D2). `LEG=competent` only (any other
  LEG value is a STOP). Errors are REPORTED into
  `instrumentErrors` (named, not swallowed).
- Trick capture (per seed, in addition to every
  killfail row):
  - `trickObservations` — one row per wrapped
    observation/discovery call for a wave-3/4/5
    species (see Frozen definitions): source, caller
    frame, obsBefore/After, knownBefore/After,
    return value, fight context when inside a
    fieldFight wrap. `discoverMonsterCounter` calls
    for wave-3/4/5 species are recorded even when
    they return false (that false IS the measurement
    for the taught/codex channels).
  - `trickCensus` — one row per day (in the daily()
    hook): day, `villageCounterObs` copy (wave-3/4/5
    species), `villagerTricks` list (wave-3/4/5
    species known), `monsterCounters` list (waves 1–2
    known, for the taught-channel cross-check).
    Learn days are read off this census, never
    inferred from prose.
  - `v4gates` rows extended (vs killfail): wave 4 AND
    wave 5 rows recorded (killfail recorded wave 4
    only), plus `needWave` and `planNeedWave` fields
    so the analyzer can re-derive trick-hold
    classification. All other gate-row fields
    unchanged.
  - Fight-context marker: driver-local `currentFight`
    set before the original `fieldFight` call and
    cleared after; observation wraps tag events
    occurring inside it with the fight's day+vid+mid.
- Analyzer: `scripts/analyze-tricklearn-b.js` (new).
  Builds the (a)–(e) tables above from the main leg,
  cross-checks the replication leg (trajectories
  identical, trick rows identical), classifies every
  wait-window episode, prints the observation table +
  observations-to-learn distribution + trick-known
  rates + episode table + TrickAfter table + per-seed
  table + wall numbers for both legs, writes
  `evidence/2026-11-16/tricklearn-b-analysis.json`,
  exits non-zero on any bar failure.
- Panel builder:
  `scripts/build-tricklearn-panels-20261116.js` (new;
  see §15 above).
- Drift check: reuse `scripts/vetparty-drift-check.js`
  verbatim.
- Proof: `scripts/test-tricklearn-b.js` (new; see
  below). GREEN on the instrument tip before the main
  leg runs.

## Proof test

`scripts/test-tricklearn-b.js` proves, on synthetic
fixtures and live in-memory runs (no corpus numbers):

- Static: NO src diff on this branch (`git diff
  master...HEAD -- src/` empty — instrument-only); the
  driver wraps exist (incl. all four observation wraps
  + the trick census hook + the extended gate wrap);
  the wave-4 AND wave-5 id sets match
  `src/data/monsters.json` exactly (10 + 10 ids); the
  taxonomy's code anchors still hold (`_trickObservation`
  threshold 2 at `game.js:36419`; evade early-return at
  `fieldFights.js:911` before the observation call at
  `:2747`; `discoverMonsterCounter` false for
  counter-less species at `game.js:36215`;
  `noteNodeWitnessKill` gated on `NODEWITNESS=1`;
  gate trick-hold at `win-plan.js:537`).
- Unit (classifier, synthetic fixtures): one fixture per
  source (fight-observed, scholar-observed,
  node-witnessed, taught, other); a taught call for a
  wave-4 species classifies `taught` with learned=false
  (the call happened, the trick did not move); a learn
  with no observation trail classifies `other` and
  fails; an observation event missing a required field
  is unclassified with the field named.
- Unit (observations-to-learn, synthetic fixtures): a
  species learned at obs 2 counts 2; a species with 1
  obs at run end counts 1 unlearned; two observations
  from DIFFERENT villagers (villager + scholar) sum on
  the shared bar to a learn.
- Unit (trick-hold, synthetic fixtures): a wave-4 gate
  row with stage hunt, target match, partyOk, trick
  unknown classifies trick-hold; the same row with
  trick known does not; a row with party short does
  not; a standing-stage row with wave >= 3 and no
  target match still holds by the standing disjunct;
  a null row with no plan does not.
- Unit (wait window, synthetic fixtures): first hold
  opens an episode; a learn on day D+7 counts
  learned; a learn on day D+8 counts expired; a second
  hold after close opens a second episode; a hold
  inside an open window does not open a second
  episode; an episode with no D+7 census row (village
  lost before D+7) classifies `village-lost`, not
  expired.
- Unit (TrickAfter, synthetic fixtures): a fight with
  trickBefore false / trickAfter true counts as
  teaches; a fight with both false does not; an
  observation event with fight context joins its
  fight; an event without fight context does not.
- Recorder: synthetic fixtures for the trick row
  shapes; a live in-memory run proves the observation
  wraps record obsBefore/After + knownBefore/After and
  the trick census records the daily bar state — a
  proof that only shows no-throw proves plumbing, not
  effect.
- Determinism: D1 + D2 as frozen above (seed 102141,
  60d).
- GREEN on the instrument tip before the main leg runs.

## Sense-testing

Quote ONE trick-relevant passage end to end from the main
leg: a survived encounter's observation beat (`(n/2 — one
more survived encounter...)`) or a COUNTER LEARNED beat if
one fires, or a trick-hold gate moment — with seed, day,
villager, monster named. Judge whether the learning reads
like a village piecing a trick together, or a counter that
never arrives. Do not invent learning narrative from
observation counts.

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
- §Monster counters: waves 3–5 carry no `counter` data
  field — signature counterplay is learnable through
  `noteVillagerTrickObservation` (two survived
  encounters teach the village).
- No canon doc covers trick-learning rates — recorded
  above as a canon gap, not invented.

## Lever candidate (named, NOT built — for the next round)

If the pipeline names a dominant starvation point, the
next round's lever is pre-registered ONLY as a candidate
here and built by the next arm, not this one:

- If observations accumulate at 0–1 per species and
  never reach 2 (evades record nothing, fights are
  rare): a trick-teaching lever (a survived encounter
  teaching in one observation instead of two — the
  killfail candidate, threshold 2→1; sibling Loop B's
  sim-trickteach-b is ALREADY building this on band
  102201–102208 — do NOT duplicate; this arm's numbers
  are its DIAG baseline). GO bar for a future build
  arm: launched wave-4+ party kill rate ≥ 2× the
  killfail main-leg rate on a fresh band, 8 seeds.
- If observations reach 2 but learns do not follow
  (a code-path bug, not starvation): a fix arm, not a
  lever — the analyzer's unclassified-learn check
  names it.
- If tricks ARE learned within windows but the gate
  still never seeks (party/target missing instead):
  the gate question belongs to the gate family, not
  the trick family — hand the episode table to the
  coordinator, do not build a gate lever here.

## Metric review (to be filled in the evidence file)

Pre-registered here: if wave-4+ observation events are
0, the review will say the pipeline is unmeasured, not
that tricks are unlearnable (bar 5 fails on power). If
episodes are 0, the review will say the gate never
held on the trick on this band under competent verbatim
(no wait question arises), not that waits expire. If
the launched-fight denominator is 0, the review will
say so with the launch-event denominator (launched
events that produced no fight are not fights). If the
wild comparison shows wild fights learning tricks at
the same rate as launched fights, the review will say
the starvation is wave-4-wide, not launch-specific.
No re-scoring mid-run: the source classes, the
trick-hold rule, the window rule, and the bars above
are the judge.
