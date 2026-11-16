# sim-trickshare-a — PREREG (binding)

Loop A run `fleshout-20261116T2015Z`, axis winnability chain,
arm sim-trickshare-a — LEVER FORM of the tricklearn DIAG finding:
the TAUGHT channel is dead. Branch `sim-trickshare-a`, base master
tip `7bb50f3dc` (coordinator evidence commit for round 1730:
trickteach NO-GO + 14cwatch D1-stop + 14cwatch2 NOT REPRODUCED).
Binding prereg: THIS file — frozen here, judged in
`evidence/2026-11-16/sim-trickshare-a.md` without alteration. The
instrument (driver, analyzer, proof test) is built AFTER this
commit; no judged numbers exist yet. The game code (the lever)
is built AFTER this commit.

## The question, in plain words

Tricks ARE learned on master — 37 of them on band 102141–102148,
every one at exactly two survived observations — but only
through wild fights, and the second observation takes weeks.
The taught channel is dead: taught 0, node-witnessed 0,
`discoverMonsterCounter` never called for a wave-3/4/5 species
in 150 days on 8 seeds — the beasttricks topic was never even
asked about one. The gate was consulted 29× with the trick
unknown every time, yet only 2 trick-holds. Cutting the
threshold 2→1 (trickteach-b) moved the mechanism (tricks 10→15,
wild trick-known 42%→78%) but the armed leg formed 0 launched
fights, so its primary could not pass — PILOT NO-GO. This arm
asks: if a villager who survives an encounter TELLS the village
about it at the fire — the telling itself counting as the second
observation — do tricks reach the gate in time to turn into
wave-4 kills?

## Prior art (read first)

- `evidence/2026-11-16/sim-tricklearn-b.md` + prereg — the DIAG
  this lever answers. Baseline on band 102141–102148: 37 tricks
  learned, all at obs 2; sources fight-observed 184,
  scholar-observed 6, taught 0, node-witnessed 0; gate 0/29
  known; wait windows 2, both expired; launched wave-4+ fights
  1, kills 0; wild kills 8/149. Its sense check found the
  villager's FIRST observation is silent in the fiction — only
  the scholar's own notebook line exists, and only for the
  scholar. The share this arm builds is voiced; the first
  observation stays silent (unchanged).
- `evidence/2026-11-16/sim-trickteach-b.md` + prereg — the
  threshold 2→1 lever, PILOT NO-GO (bar 1: 0 armed launched
  wave-4 kills vs ≥ 2; mechanism moved, population never
  formed). Its metric review binds this run: (1) D3
  first-lever-day must be first learn on ANY wave/channel
  (here: first taught credit — see D3 below); (2) primary is
  **all-origins wave-4 kills**, launched kills secondary, with
  a floor on launches reported; (3) the cost bar must include
  total deaths / deaths-per-100d alongside starvation (the
  panel caught a deaths price the bar did not); (4) 0-round
  wild kills are wound-mill finish-offs — the kill metric
  separates them (rounds ≥ 1) from real fights.
- Canon: `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  §Monster counters — the 2-observation rule is canon ("a
  villager who survives an encounter with a signature mechanic
  brings home an observation, and two observations teach the
  village the trick (`state.villagerTricks`)"), and the
  beasttricks topic is canon ("Told at Haven — the village
  learns together"). No canon doc covers trick-learning speed
  or hearthside sharing as a lever — this prereg says so rather
  than inventing canon. The lever adds a sharing step to the
  canon channel; it changes no canon number and no canon text.

## Code facts the lever is built on (read from src, frozen)

Verified on this tree before this prereg:

1. `_trickObservation(vid, mid, firstPerson)` (`src/js/game.js`,
   ~line 36420) is the shared observation core. It increments
   `state.villageCounterObs[mid]` — the ONE shared bar — and
   teaches when the count reaches the hardcoded threshold
   (`obs[mid] < 2` in the first-person narration guard and the
   learn gate). Both call paths feed it:
   `noteVillagerTrickObservation` (villagers, called only from
   `src/js/fieldFights.js:2747` on vFlee/mFlee/evade) and
   `noteScholarTrickObservation` (the scholar, also called from
   `src/js/game.js:47568`). Because the bar is shared, a taught
   observation CAN be a second observation: the share credits
   the same bar, it does not invent a second bar.
2. `noteNodeWitnessKill(vid, mid, witnesses)`
   (`src/js/game.js`, ~line 36483) is the second channel onto
   the SAME bar, with its own hardcoded `obs[mid] < 2` learn
   gate. The share's pending offer is recorded from both
   channels when an observation leaves the bar at exactly 1.
3. `discoverMonsterCounter(mid, via)` (`src/js/game.js:36215`)
   only teaches waves 1–2 (`mdef.counter`); it returns false
   for wave-3/4/5 signature tricks, whose knowledge lives on
   `state.villagerTricks`. That is WHY the taught channel is
   dead for wave-3/4/5: the beasttricks topic path calls
   `discoverMonsterCounter(mid, 'taught')` (`src/js/game.js:5046`)
   and the call can never land on a signature species. The
   share does NOT route through `discoverMonsterCounter` for
   waves 3–5 — it credits the observation bar and learns
   through the same `villagerTricks` set the observation path
   uses. For waves 1–2 it learns through
   `discoverMonsterCounter(mid, 'taught')`, so the taught
   via is honest on both lanes.
4. `villageKnowsTrick(mid)` (`src/js/game.js:36386`) is the
   unified read the gate (`src/js/win-plan.js:537`) and the
   field-fight AI read. The lever changes no reader — only
   how soon the read turns true, and only via a told story.
5. `campPeopleIds('haven')` (`src/js/game.js:14458`) is the
   living Haven population read: roster villagers not away,
   health > 0, not dead; includes the scholar when home.
   The share's listeners are exactly this set minus the
   teacher — co-presence at the fire at dawn IS the
   perception: they heard the telling. No roster scan, no
   list feed — nobody is taught who was not there. (Precedent:
   `bondProposalPerceived` in `src/js/bond-initiation.js` —
   perception-gated by fire-group / lived interaction.)
6. `sleep()` (`src/js/game.js:21426`) is the dawn point:
   the sleep loop runs `endDay` (the day rolls), and the
   code after the woke-check is explicitly "You slept through
   to dawn." The sim harness calls `Game.sleep()` once per
   day (`scripts/sim-harness.js:589`). The share tick hooks
   there, once per day (guarded by a last-run day stamp),
   chain-safe (try/catch — a share bug can never break sleep).
7. Env-gate pattern (VETSHAPE / TRICKTEACH precedent,
   `src/js/standing.js:238`): `((typeof process !==
   'undefined' && process.env && process.env.X) === '1')`.
   The lever reads `TRICKSHARE=1`; unset (including in the
   browser, where `process.env` never exists) the code takes
   the exact old path. Zero src/js behavior change when
   unset — proven by the proof test's static off-mode check.
8. The threshold stays 2. This lever does NOT cut it — that
   was trickteach-b, killed at pilot. A trick is learned
   after one survived observation PLUS one told story at the
   fire, or after two survived observations as before. The
   difference from trickteach is the dawn delay, the Haven
   presence condition, and the perception condition: a
   villager who never comes home never tells the tale.

## The lever — hearthside trick teaching (frozen design)

- `TRICKSHARE=1` → `trickShareEnabled()` returns true, else
  false. The helper is the ONLY place the flag is read.
- **Pending offer.** When an observation leaves the shared
  bar at exactly 1 (`_trickObservation` and
  `noteNodeWitnessKill`), and the flag is on, record a pending
  share: `state.trickSharePending[mid] = { teacher: vid, day }`
  (teacher is the observer; for the witness channel, the first
  roster witness). One pending per species; a newer offer
  replaces an older one for the same species. When the trick
  is learned by any path, the pending for that species is
  cleared. When the teacher dies, the pending is dropped at
  the dawn tick. No RNG anywhere in the offer path.
- **Daily Haven share.** `trickShareDawnTick()`, called once
  per slept-through dawn from `sleep()`: for each pending
  species (sorted keys — deterministic order), in order:
  trick already known → drop; teacher dead → drop; teacher
  not at Haven (`campPeopleIds('haven')` does not include
  the teacher; the scholar-teacher counts as at Haven iff
  the scholar id is in that set) → keep pending (they will
  tell when they come home); no other living villager at
  Haven → keep pending (nobody to tell); else credit the
  taught observation via `noteTrickTaught(mid, teacher,
  listeners)` and consume the pending.
- **Taught credit.** `noteTrickTaught(mid, teacherVid,
  listenerVids)`: guards (flag on, trick-bearing species,
  not already known); `obs[mid] += 1`; tele
  `counter_observed` with `via: 'taught'`; if still below
  threshold 2, a voiced telling line ("{Teacher} told the
  fire about {monster} — what it did, how it moved. (n/2)")
  + journal note; if the threshold is reached, learn —
  waves 1–2 through `discoverMonsterCounter(mid, 'taught')`,
  waves 3–5 through the `villagerTricks` set with the
  hearthside learn beat ("💡 COUNTER LEARNED — … (At the
  fire, {Teacher} told {listeners} how it moves — the
  village pieced it together.)"). Returns whether the
  trick was learned.
- **Teach-on-learn.** When a trick is learned through
  `_trickObservation` (villager path) and the flag is on,
  the learner tells whoever was WITH them: the learn call
  carries the fight's party (`opts.allyVids`, threaded as an
  optional third argument through
  `noteVillagerTrickObservation(vid, mid, allies)`), and a
  second voiced line names the listeners who were there
  ("{Teacher} told {names} — they were there when it
  happened."). No state effect beyond the existing learn —
  the knowledge is already village-shared; the line is the
  teaching made visible. The scholar path carries no allies
  (no line). The first observation itself stays silent, as
  today — the share is what voices it, at dawn.
- No gate change, no party change, no damage change, no
  seed call. The gate still demands party 3 + armed +
  armored + known trick; the lever only moves how soon
  "known" becomes true, and only for villagers who come
  home and tell the tale.

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`,
  wave 4; 10, re-read live by the driver):
  `algorithm`, `audit`, `congregation`, `eater`, `eulogy`,
  `herald`, `influencer`, `reunion`, `strike`, `suburb`.
- **Wave-5 monster ids** (10, re-read live):
  `cancellation`, `editor`, `finale`, `finale_crew`,
  `finale_opening`, `network_note`, `nielsen`, `rerun`,
  `spoiler`, `timeslot`.
- **A taught observation** = one `trickObservations` row with
  source `taught` (the driver wraps `noteTrickTaught` the same
  way the tricklearn driver wraps the other three observation
  channels; the analyzer classifies by source, as before).
  A taught observation that teaches the trick has
  `knownBefore` false and `knownAfter` true.
- **Gate trick-known rate** = share of `v4gates` rows
  (wave-4 gate consultations, killfail frozen definition)
  with `trickKnown` true, per leg; counts reported alongside.
- **All-origins wave-4 kills (PRIMARY)** = distinct meetings
  (seed+vid+day+mid) among `killfailFights` rows with wave 4,
  outcome `vKill`, **rounds ≥ 1** (trickteach metric review
  #5: 0-round kills are wound-mill finish-offs of already-
  wounded beasts, not fights; the unfiltered count is
  reported as a secondary). Wave-5 kills same definition.
- **A launched wave-4+ party fight (secondary population)**
  = the killfail frozen definition verbatim: a `fieldFight`
  row vs a wave-4/5 monster whose fighter or any ally at
  contact has an active trip window for a BROAD wave-4+
  launch event covering the fight day (trip window [launch
  day, first census day after launch on which the holder is
  no longer on expedition, capped at launch day + 14]).
- **A launched wave-4+ party kill** = a population fight
  with outcome `vKill`, counted as DISTINCT meetings
  (seed+vid+day+mid) — the gatelever bar-2 definition.
- **Trick-known at contact** = `trickBefore` on the fight
  row (`villageKnowsTrick(mid)` pre-fight).
- **Tricks learned** (mechanism) = distinct wave-4/5
  species per leg with a fight row showing `trickBefore`
  false and `trickAfter` true (first such transition per
  species per seed), plus the count of such transitions.
- **Starvation** = death-log starvation/hunger deaths
  (gatelever bar-5 definition). **Median survival** =
  median `days` across all 8 seeds per leg.
  **Deaths/100d** = total deaths per 100 village-days
  (panel metric, cost bar — trickteach metric review #3).
- **Instrument error:** any non-empty
  `instrumentErrors`, any per-seed file failing to parse,
  any fight whose launch join is ambiguous (analyzer
  names it, counts once, first event wins, flagged).

## Primary metric + GO bar (frozen, from the 1530Z brief + trickteach metric review)

GO iff ALL hold:

1. **(a) Taught observations > 0 on the armed leg** (the
   channel fires — at least one `trickObservations` row
   with source `taught` on the armed leg; control leg
   expected 0, reported alongside).
2. **(b) Gate trick-known rate rises vs control** — armed
   gate-known count > control gate-known count AND armed
   rate ≥ control rate, denominators reported. If both
   legs have 0 gate rows, (b) is uninformative and the run
   is NO-GO on power (tricklearn bar-5 precedent), not a
   pass.
3. **(c) PRIMARY: all-origins wave-4 kills (rounds ≥ 1,
   distinct meetings) armed > control.** Launched kills
   are secondary; if launched fights are 0 on the armed
   leg, the review says the population never formed (with
   the launch-event denominator) and does NOT claim a 0%
   launched kill rate as a lever verdict.
4. **Cost bar: starvation (armed) ≤ starvation (control)
   + 2 AND median survival (armed) ≥ 0.8 × median survival
   (control) AND the §15 panel shows NO regression_signal
   on deaths/100d** (villageDeaths100Days). Total villager
   deaths are reported per leg + in the panel.
5. **Instrument clean:** 0 instrument errors on both
   legs, 8/8 per-seed files parse per leg, proof test
   green on the lever tip and green post-revert (off
   mode), D1 + D2 green, D3 CLEAN or IDENTICAL (below).

A miss is NO-GO, never re-scored mid-run (§14). If the
pilot NO-GOs, the lever is KILLED (revert game code on
the branch, land evidence-only) — no 12–16 seed confirm
on an invisible effect.

## Secondary (reported, not judged)

- Outcome table for launched fights (vKill / mFlee /
  vFlee / vDie / evade) + flag prevalence (killfail
  taxonomy verbatim, incl. trick-unknown share).
- Wild comparison: wave-4+ wild fights, kills, trick
  known/after — launched vs wild on identical seeds.
- All-origins wave-4 kills unfiltered (incl. 0-round)
  and wave-5 kills per leg.
- Trick mechanism: tricks learned per leg (distinct
  species + transitions), trick-known share among
  launched fights per leg, trick-known share among
  wild fights per leg, wave-1/2 trick-known share
  (scope visibility for the shared bar).
- Share mechanism: pending offers recorded, shares fired,
  shares kept-pending (teacher away / no listeners /
  teacher dead), taught observations per species, days
  from first observation to taught learn (the dawn delay).
- Per-seed table: launched events, launched fights,
  kills, median damage dealt per fight, median rounds.
- Per-fight table (every launched fight, one row).
- Gate rows joined to launched fights (seek / avoid /
  outmatched / not-consulted).
- Wall numbers (BOTH legs, BOTH national definitions):
  national by scaleRank ≥ 2 and by standing ≥ 200,
  table (seat taken), wins, wave-4/5 unlocks, median
  survival, starvation, total deaths.
- Sense check: quote ONE launched fight end to end from
  the armed leg (`killfailFights[].log[]` + launch rows)
  — what the party planned, what they met, how the fight
  read — and judge whether the trick, once learned, is
  VOICED. Quote one hearthside share beat (the dawn
  telling) and one teach-on-learn beat when they fire on
  the armed leg, and judge whether they read like a
  village telling itself what it survived.

## Seed band (verified fresh per the seed-band-freshness skill)

- **102601–102608** (8 seeds), 150d death-aware.
- Freshness check (this arm, before this commit — scope
  and result): coordinator-verified fresh (claim file
  `hidden_files/lever-claims/fleshout-20261116T2015Z.json`
  names this band for this run's arms). This arm's own
  check: whole-token grep (`rg -w`) for `102601` …
  `102608` over (a) all `evidence/*/sim-*-prereg.md`,
  (b) all `evidence/2026-11-16/*.md`, (c) `scripts/*.js`,
  (d) the goal `hidden_files/convergence-tracker.md`
  and `sim-findings.md` — zero hits naming the band as a
  seed band in any prereg. Two incidental whole-token
  hits, neither a seed-band use: (1) this run's own
  claim file (it names the band — that IS this run);
  (2) `evidence/2026-10-15/perseed-trustcensus/run-leadcourt-s77.json`
  contains the NUMBER `102602` as a `cumTakes` value
  (a pantry-take total, not a seed). No per-seed file
  under `evidence/` is named for any 102601–102608 seed.
  Neighbouring used bands avoided: 102701–102708
  (stand199 DIAG, Loop B live), 102211–102218
  (trickteach-b), 102201–102208 (seasoning, forbidden),
  102141–102148 (tricklearn-b DIAG), 102101–102108
  (gatelever-b), 102041–102048 (killfail-a), 102011–102018
  (launchdef/rumorplan), 102001–102008 (gatereach2).
  NEVER use: 100621–100636, 100861–100868,
  100821–100828, 100721–100728, 100761–100768,
  10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568.

## Horizon, policy, legs, panel applicability

- Horizon 150 days, death-aware (dead villages stop
  simulating; runs end early on win or village loss).
- Policy competent verbatim (`scripts/policies/competent.js`,
  sha256
  `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
  — verified by this arm with sha256sum before this
  commit; the same sha gatelever-b / trickteach-b
  recorded). No env flags on the policy (competent is
  the default env). The driver's own-policy record
  carries the sha it ran under.
- Leg 1 (control): competent + recorder, `TRICKSHARE`
  unset, seeds 102601–102608.
- Leg 2 (armed): competent + recorder, `TRICKSHARE=1`,
  IDENTICAL seeds. The ONLY difference between the
  legs is the env flag.
- **§15 balanced panel:**
  `scripts/build-trickshare-panels-20261116.js` (copied
  from `scripts/build-trickteach-panels-20261116.js`,
  panel-building logic UNCHANGED; only leg dirs, file
  names, seeds, pseudo-policy change) builds panels in
  the `scripts/balance-panel.js` schema from the two
  legs: before=control, after=armed, PAIRED seeds,
  pseudo-policy `trickshare-a` in both panels. The
  panel is the instrument; the prereg bars are the
  judge. The `compare` `.md` is attached to the
  evidence file.
- Pilot 8 seeds before any confirm spend. If the pilot
  NO-GOs, the lever is KILLED — no 12–16 seed confirm
  on an invisible effect.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** armed tip, seed 102601,
  **150d**, recorder ON, run twice → identical per-seed
  JSON (deaths/days/endReason/vet5 + all killfail rows
  identical).
- **D2 (wrap neutrality):** armed tip, seed 102601,
  150d, recorder ON vs recorder OFF
  (`TRICKSHARE_RECORDER=off`) → identical trajectories
  (deaths/days/endReason/standing/vet5 + daily
  fingerprints). The recorder wraps are the only
  difference between the legs — D2 isolates them.
  `TRICKSHARE=1` stays ON in both D2 legs: the lever
  is the game under test, the recorder is the
  instrument.
- **D3 (drift smoke):** `scripts/trickshare-drift-check.js`
  (copy of `scripts/trickteach-drift-check.js`, same
  verdict logic over the series fingerprint) with
  first-lever-day = the earliest armed-leg day a taught
  observation is credited (first `trickObservations`
  row with source `taught`, any wave/channel, per seed;
  earliest across seeds). The lever can only change
  behavior once a taught observation is credited — a
  pending offer alone writes state but consumes no RNG
  and gates nothing — so any divergence before that
  day is DRIFT. If no taught observation is ever
  credited on the armed leg, first-lever-day is null
  and any divergence is DRIFT. Expected verdict: CLEAN
  or IDENTICAL on all 8 seeds (the legs share seed
  call, policy, and data; only the flag differs).
  (Trickteach metric review #1 applied: first-lever-day
  is first lever ACTION on any wave/channel, not first
  wave-4/5 fight-row transition.)

## The instrument (frozen)

- Driver: `scripts/trickshare-driver-20261116.js` (new —
  copy of `scripts/trickteach-driver-20261116.js`, EXTENDED
  only by renames + one wrap, not rebuilt: same harness,
  snapshot, cascade, w5 recorder, gate rows, launches,
  killfail rows, ammo classifier — unchanged). RUN/OUTDIR
  defaults renamed (`trickshare-a`,
  `perseed-trickshare-a-control` / `-armed`); per-seed
  filename prefix `trickshare-a-s`; `LEG=competent`
  default; `TRICKSHARE_RECORDER=off` skips the recorder
  wraps (D2). Recorder wraps are pure reads plus writes
  to driver-local arrays — no game-state writes, no RNG.
  The driver refuses to overwrite an existing per-seed
  file. Errors are REPORTED into `instrumentErrors`
  (named, not swallowed). The driver ALSO records the
  first trick-learned day per species per seed
  (`trickLearnedDays`, from `killfailFights` trickAfter
  transitions) for the D3 check, AND wraps
  `noteTrickTaught` with source `taught` (the fourth
  observation channel) AND records share events
  (`trickShares`: pending offers, fired shares, kept-
  pending reasons — pure reads of `state.trickSharePending`
  at census time plus the wrap rows).
- Analyzer: `scripts/analyze-trickshare-a.js` (new —
  requires `scripts/analyze-killfail-a.js` and adds the
  trickshare judgment on top of its `analyzeFiles`
  output; the killfail analyzer itself is NOT modified).
  It reports, per leg: taught observations, gate
  trick-known rate, all-origins wave-4/5 kills (rounds
  ≥ 1 and unfiltered), launched fights + kills
  (distinct), trick-known shares, tricks learned,
  starvation + median survival + deaths/100d, the wall
  numbers, and the five-bar judgment. It exits non-zero
  on any bar failure or any `unknown` consultation path
  or arrival.
- Drift check: `scripts/trickshare-drift-check.js` (new —
  copy of `scripts/trickteach-drift-check.js`, same verdict
  logic, first-lever-day as frozen in D3 above).
- Proof: `scripts/test-trickshare-a.js` (new; see below).
  GREEN on the lever tip before the armed leg runs;
  GREEN again post-revert.
- Balanced panel (MEASUREMENT.md §15): as above; the
  panel builder is copied from the trickteach one.

## Proof test

`scripts/test-trickshare-a.js` proves, on synthetic fixtures
and live in-memory runs (no corpus numbers):

- Static: the lever is env-gated (the flag is read in
  exactly one place, `trickShareEnabled()`; `TRICKSHARE`
  appears nowhere else in src/); off mode = zero src
  behavior change (`git diff <BASE>...HEAD -- src/` empty
  with the flag unset — the static check diffs the
  committed lever against the branch base and asserts
  the lever files' off-mode behavior via a fresh
  loadGame with the flag unset); the threshold helper is
  untouched (threshold stays 2 — grep census: no other
  `obs[mid] <` sites added, `trickLearnThreshold` absent);
  `sleep()` calls the share tick exactly once per dawn
  (last-run day guard).
- Unit (share, synthetic fixtures via live loadGame):
  with `TRICKSHARE=1`, a first observation records a
  pending offer (teacher + day); at the next dawn with
  the teacher at Haven and ≥ 1 other living villager at
  Haven, the share credits a taught observation (obs 1→2)
  and the trick is learned with the hearthside beat
  naming teacher + listeners; the taught row's source is
  `taught` (driver-wrap shape); with the flag unset, no
  pending is recorded and no share fires (obs stays 1).
- Unit (gates): teacher dead before dawn → pending
  dropped, no credit; teacher away from Haven → pending
  kept, no credit; no listeners at Haven → pending kept,
  no credit; trick already known → pending dropped, no
  credit; share fires at most once per dawn (second call
  same day is a no-op); a second survived observation
  before dawn clears the pending (learned the old way).
- Unit (teach-on-learn): with the flag on, a learn via
  the villager observation path with allies present voices
  the teach-on-learn line naming them; with no allies,
  no line; with the flag off, no line ever.
- Unit (perception): listeners are exactly the living
  Haven population minus the teacher — a villager away
  on expedition is never a listener; a dead villager is
  never a listener.
- Unit (waves 1–2): a taught credit on a counter species
  learns through `discoverMonsterCounter(mid, 'taught')`
  (monsterCounters set, via 'taught').
- Encounter-gear fixture (Steve 2026-11-13): the live
  fight fixture stages the average gear + party a player
  actually has at the content — a geared scholar fighting
  with a party, never a fresh un-geared scholar alone.
  (The proof's live leg is a 150d sim, not a staged
  fight; the gear fixture applies to the unit fight that
  produces the first observation.)
- Determinism: D1 + D2 as frozen above (seed 102601,
  150d).
- GREEN on the lever tip before the armed leg runs.

## Sense-testing

Quote ONE launched fight end to end from the armed leg:
what the party planned (launch rows: target, party,
stage), what they met, how the fight read
(`killfailFights[].log[]`) — with seed, day, fighter,
monster named. Judge whether the fight reads like a
party that went out to kill a named beast and failed,
or a party that wandered into something it could not
hurt. Quote one hearthside share beat and one
teach-on-learn beat when they fire on the armed leg
and judge whether the village voices the learning or
the knowledge arrives silently. Do not invent fight
narrative from kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` §Monster counters — the
  2-observation rule is canon; the beasttricks "Told at
  Haven" channel is canon. No canon doc covers trick
  learning speed or hearthside sharing as a lever, and
  this prereg says so rather than inventing canon. The
  lever adds a sharing step to the canon channel; it
  changes a threshold nowhere.
- No canon doc covers plan-target attachment or the
  win-plan lifecycle beyond `src/js/win-plan.js`
  (ontology header) and the dated evidence — carried
  forward from the trickteach prereg, unchanged here.

## Metric review (to be filled in the evidence file)

Pre-registered here: if taught observations are 0 on the
armed leg, the review will say the channel still did not
fire and name why (pending offers vs shares kept-pending
reasons). If the armed leg moves all-origins wave-4 kills
but not launched kills, the review will say the lever
moved kills but not through launches, and propose the
revised primary for the NEXT run. If the cost bar passes
but total deaths rise materially on the panel, the review
will name the deaths price. No re-scoring mid-run: the
bars above are the judge.
