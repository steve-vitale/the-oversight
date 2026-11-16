# sim-gatereach-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261115T2330Z`, axis winnability chain, arm
sim-gatereach-b (gate-reachability instrument). Branch
`sim-gatereach-b`, base master tip `cb00f9818`. Binding prereg: this
file — frozen here, judged in `evidence/2026-11-15/sim-gatereach-b.md`
without alteration. This arm takes Loop B next blank #2 from the 2230Z
run: the GATE-REACHABILITY INSTRUMENT. Diagnostic first — NO
game-code change, NO fix built in this run. If the instrument shows a
clear lever, the evidence NAMES it with a prereg-ready GO bar for a
future run; this run builds none.

## The question, in plain words

The producergate pilot (`evidence/2026-11-15/sim-producergate-b.md`,
PILOT NO-GO) proved the seed half works (win-plan counter 10→75,
plans 12→81, brain commits 57→662) but the launch half almost never
fires: 561 party-waits produced 7 second-companion waits and 2
size-3 launches; the SEEK never fired (0 in both legs); the gate was
consulted about wave 5 only 2–3 times per 8-seed leg; both armed
field kills came through the world-tick path (allies joining at the
fight); across all 45 wave-5 field fights in both legs, not one
started with expedition companions. 22 solo launches were a side
effect of the heavier plan load.

This arm does not re-test that lever (it was killed and reverted).
It builds the instrument that measures, on a fresh baseline band,
how wave-5 field fights actually start and where launched parties go
— so the NEXT lever is aimed at the real meeting point instead of
the assumed one.

## What the instrument measures

Per wave-5 field fight (a `fieldFight` call vs a wave-5 monster with
a villager fighter), the recorder captures:

- **Start mode** (see frozen definitions below): expedition
  companions present at start vs world-tick allies joining mid-fight
  vs solo — plus party size at start, whether the party arrived via
  the gate, whether SEEK fired.
- **Per launched party:** launch size, destination (target node),
  gate arrival (yes/no, days to gate), fight joined or not.
- **Per party-wait:** waits, second-companion waits, launches, and
  WHY waits end without launching (companion never free at Haven?
  plan abandoned? hold expired?).
- **Field-fight deaths from encounter rows** (the 2230Z run notes
  this bar must count field-fight deaths from encounter rows before
  any re-test): a wave-5 `w5encounters` row with outcome `vDie`
  counts as one field death — NOT the death log's killer field,
  which misses deaths recorded the other way round
  (producergate §9.1: control counted 0 wave-5 deaths while 10
  villagers actually died in wave-5 field fights).

## Frozen definitions

- **Wave-5 monster ids** (from `src/data/monsters.json`, wave 5,
  re-read live by the driver): `cancellation`, `editor`, `rerun`,
  `spoiler`, `timeslot`, `nielsen`, `finale`, `finale_crew`,
  `finale_opening`, `network_note`.
- **Fight origin:** the `fieldFight` caller, read from the call
  stack at the wrap (no game-code change): `expedition`
  (`expeditionMonster`, villager-agency.js), `world-tick`
  (`resolveWildMonsterEncounter`, game.js), `patrol`
  (`resolvePatrol`, game.js), `aid` (`aidFight`, comms.js — a
  lingering raider at the Haven door during an aid crisis, fought
  with allied-village leaders from round 1), `other:<caller>` for
  any other caller (contest, alien, corruption, nomad). Origin is
  recorded per encounter row; the analyzer never guesses it from
  the fighter's location. (Correction, before any judged corpus:
  `aid` added when a live run showed it as a real caller; the
  stack reader also skips the game's own `fieldFight` deed wrap
  in progression.js — see the Correction section.)
- **Fighter expedition:** the fighter's live `agencyState().exped`
  entry at fight time, or null: `{tx, ty, sinceDay, duration}`.
- **Shared-expedition ally:** an `allyVids` entry whose own live
  expedition target (`tx,ty`) equals the fighter's — i.e. the ally
  launched on the same shared target and is still out with the
  fighter. Counted per fight as `allyExpedSharedN`.
- **Party at start:** `1 + allyVids.length` — villagers sensed at
  fight time and available to join (the `fieldFight` opts). Note:
  no live caller passes `allyFromStart`, so in current master no
  ally fights from round 1; allies join mid-fight only when the
  fighter is losing (`calledHelp` / `allyVid` on the record). The
  start-mode classes below describe the party the fight STARTS
  with (sensed, available), not who lands a blow.
- **Start mode** (pure function of the recorded row, tested on
  synthetic fixtures):
  - `expedition-party`: origin `expedition`, fighter on expedition,
    `allyExpedSharedN >= 1` — a launched party that arrived
    together.
  - `expedition-solo`: origin `expedition`, fighter on expedition,
    `allyExpedSharedN = 0`.
  - `worldtick-party`: origin `world-tick`, `allyVids.length >= 1`.
  - `worldtick-solo`: origin `world-tick`, `allyVids.length = 0`.
  - `patrol-party` / `patrol-solo`: origin `patrol`, split the same
    way on `allyVids.length`.
  - `aid-party` / `aid-solo`: origin `aid`, split the same way on
    `alliesN` (aid fights carry foreign allied-village leaders as
    `allyVids`, and are the only live path with `allyFromStart`).
  - `other`: any other origin. `other` counts as UNCLASSIFIED for
    the coverage bar (the instrument names the caller; it does not
    claim a mode it cannot see).
  - `unclassified`: origin unreadable (stack read failed). Any
    such row is an instrument error.
- **SEEK fired:** a gate row for the same fight (`w5gates`, matched
  by vid + day + monster) with result `seek`. The gate is consulted
  only in `expeditionMonster`, so a world-tick fight can never SEEK
  — that asymmetry is a finding of the instrument, not a bug in it.
- **Launch:** a `startExpedition` call that actually creates an
  `agencyState().exped` entry for the departing villager (ground
  truth — `startExpedition` can return early for hurt/sick/medic-
  duty villagers, so a depart commit that says "launch" without an
  expedition entry is NOT a launch). Rows carry: day, villager,
  source (`win-plan` depart path, `brain` dawn commit, or
  `ordinary` ranging expedition), launch size (1 + `plan.party`
  length after the call, for win-plan launches), destination
  (`tx,ty`), duration, plan target species, plan needWave, stage.
  Win-plan launches are tagged by the depart wraps that bracket
  the `startExpedition` calls; ordinary expeditions are recorded
  with source `ordinary` so non-plan meetings are visible too.
- **Gate arrival (per launch):** a gate row for the same villager
  with day in `[launch day, launch day + duration]`. Days to gate
  = first such gate row's day minus launch day. A launch with no
  gate row in its window did NOT arrive at the gate. (Window
  approximation: the expedition's return is not itself recorded;
  duration is the outward bound the game sets.)
- **Fight joined (per launch):** an encounter row for the same
  villager, origin `expedition`, day in the launch window, with
  `allyExpedSharedN >= 1` — the launched party fought together.
- **Party-wait:** a depart outcome `hold` on a `party_wait` action
  (brain dawn commit) or a `party`-stage hold from `winPlanDepart`
  (kept as a wrap; live it never fires — the brain owns dawn, see
  below). Each wait row carries a **pool census** at wait time:
  the count of eligible companions (replicating `findCompanion`
  eligibility — alive, not the scholar, not away, trust ≥ 15, at
  Haven, not engaged, profile wanderer/explorer, not already on
  expedition) plus the roster count failing each gate first
  (dead / away / trust / not-at-Haven / engaged / profile /
  already-expedition). A **second-companion wait** is a wait row
  with exactly 1 eligible companion on a wave-4+ plan.
- **Wait episode:** consecutive wait rows for the same villager +
  plan target, closed by the first later depart row for that
  villager. End reasons: `launch` (a launch row within 1 day),
  `hold-expired` (a `normal` depart outcome on a `party`-stage
  plan — the PARTY_WAIT_DAYS hold ran out and the plan imposed
  nothing), `plan-changed` (a later depart row shows a different
  stage or target, or the plan is gone at end of run),
  `fighter-died` (villager dead by end of run), `horizon` (still
  waiting at end of run). `horizon` and `fighter-died` are honest
  ends, not failures of classification; only `unknown` (no closing
  event found at all) counts as unclassified.
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, any `unclassified` start mode,
  or any seed whose unlock/faced/kill fields disagree (kills > 0
  with `maxWave < 5`, or `w5` > 0 before the unlock day) — same
  rule as producergate.

## Correction (2026-11-15, BEFORE any judged corpus — no verdict exists yet)

Two instrument defects were found by the proof test + first analysis
run, and fixed before any corpus was judged. The bars above are
UNCHANGED; only the recorder's origin reading and the classified
set are corrected. The first corpus run (seeds 100821–100828,
150d, competent-answercourt-b, ~19:00Z) is DISCARDED, unjudged,
never committed: its origin stamp read `other:fieldFight` on all
95 wave-4+ fights, so its classified share was 0.00 on an
instrument bug, not on the game. The corpus was re-run with the
fixed driver on the SAME seeds, policy, and horizon.

1. **fightOrigin skipped past the wrong frame.** The game wraps
   `Game.fieldFight` itself (progression.js `_attachFieldFight`, a
   deed-recording wrapper), so the first src/js frame after the
   recorder's wrapper is named `fieldFight` — the real caller
   sits below it. `fightOrigin()` now skips frames named
   `fieldFight` and keeps walking. Proven live by the proof
   test's determinism case (150d, seed 100821): every encounter
   row carries a classified start mode and at least one
   `world-tick` origin.
2. **aidFight is a fourth field-fight caller.** The live run
   showed a wave-4 fight with origin `other:aidFight`:
   `aidFight` (comms.js) fights a lingering raider at the Haven
   door during an aid crisis, calling `fieldFight` with allied-
   village leaders as real combatants from round 1 — the ONLY
   live path that passes `allyFromStart`. Origin `aid` and
   start modes `aid-party` / `aid-solo` (split on `alliesN`)
   are added; the classified set is now EIGHT modes. This is
   the case the prereg's metric-review paragraph anticipated
   ("if ... another caller turns out to carry a large share").

## Code facts the instrument is grounded in (read before building)

- `src/js/win-plan.js` `winPlanFightGate`: party = self +
  `villagerFightAllies(vid)` (sensed only); OUTMATCHED (avoid) for
  wave ≥ 4 when party < 3 or not all armed/armored; SEEK only when
  plan stage is hunt/standing, the beast is the target wave/species,
  party ≥ 3 armed+armored, AND the trick is known (else `trickHolds`
  → null, ordinary encounter proceeds).
- `src/js/villager-agency.js` `expeditionMonster`: the ONLY caller
  of the gate. `resolveWildMonsterEncounter` (game.js, the
  world-tick path) NEVER consults the gate. `resolvePatrol`
  (game.js) fights through `fieldFight` with allies from the stale
  `_outdoorCrew` snapshot, not the live sensing helper.
- `src/js/villager-agency.js` agencyTick: the brain owns dawn
  (`vbrainOwnsDawn() === true`), so `winPlanDepart` is BYPASSED
  live — all departures go through `vbrainExecuteDepart`
  (villager-brain.js). The `winPlanDepart` wrap is kept for
  completeness; the brain wrap is the live instrument.
- `src/js/party-wiring.js` `villagerFightAllies`: up to 2 allies —
  outdoor crew first (live assignments), then villagers on/adjacent
  nodes (earshot ≤ 1), trust-ordered, trust floor 15, scholar
  excluded.
- `src/js/fieldFights.js` `fieldFight`: `opts.allyFromStart`
  joins from round 1, but NO live caller passes it — allies join
  mid-fight only via the hopeless-shout path (`calledHelp`).
- `src/js/villager-brain.js` `winPlanCands` + `vbrainExecuteDepart`:
  current master launches ONE companion (the producergate
  two-companion lever was reverted). `findCompanion` eligibility:
  at Haven, trust ≥ 15, wanderer/explorer, not away/engaged/on
  expedition.
- Canon: `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  wave 5 "The Producers" (standing ≥ 200 AND wave-4 faced; damage
  50–130, HP 1000–2200), `docs/PARTY.md` (party cap 3 — the
  scholar's party; the villager party of 3 here is fighter + 2
  sensed allies through `villagerFightAllies`).

## Seed bands (verified fresh per the seed-band-freshness skill)

- Corpus: **100821–100828** (8 seeds), ONE leg, ONE policy
  (baseline only — this is a diagnostic, not a comparison).
- Freshness check (2026-11-15, exact-seed grep with digit
  boundaries `(^|[^0-9])10082[1-8]([^0-9]|$)`): zero hits in
  committed `evidence/**/*.md` (`git grep`, this worktree),
  zero hits in committed `scripts/*.js`, zero hits in the goal
  `hidden_files/convergence-tracker.md`, zero hits in goal
  `hidden_files/**/sim-*-prereg.md`, zero hits in
  `~/memory/2026-11-1*.md`, no `perseed-*10082*` directories,
  no evidence filenames containing `10082`. The only
  substring hit anywhere was the float `61.44279241008213`
  inside a 2026-10-17 feastvoice JSON beat — not a seed.
  Spent bands avoided: 100521–100536, 100601–100608,
  100621–100636, 100641–100648, 100701–100708, 100721–100728,
  100761–100768, 100781–100788, 100801–100816 (confirm, named).
- No confirm band is named: a diagnostic spends no confirm.

## Horizon, policy, death-awareness

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy `competent-answercourt-b` (same as producergate, so
  numbers compare).
- Driver: `scripts/gatereach-driver-20261115.js` (RUN
  `gatereach-b`; OUTDIR `perseed-gatereach-b`), adapted from the
  producergate driver (same harness, snapshot, cascade, and
  w5 recorder — unchanged) plus the gate-reachability recorder
  (origin stamp, expedition membership, launch rows, wait pool
  census, extended depart rows). All recorder wraps are pure
  reads plus writes to driver-local arrays — no game behavior.
- Analyzer: `scripts/analyze-gatereach-b.js` (pooled start-mode
  classification, launch→gate→fight joins, wait episodes,
  field deaths from encounter rows, wall numbers; `judge()`
  implements the bars below).
- No balanced-panel compare is owed: the panel
  (`scripts/balance-panel.js`) is for before/after comparisons
  (§15) and this is a baseline-only diagnostic — stated here so
  its absence is a design decision, not a gap.

## Primary metric + GO bars (instrument validity)

Primary metric: **share of wave-5 field fights classified by
start mode** (classified = start mode in `expedition-party`,
`expedition-solo`, `worldtick-party`, `worldtick-solo`,
`patrol-party`, `patrol-solo`, `aid-party`, `aid-solo`).

GO iff ALL hold:

1. **Classified share ≥ 0.90** of wave-5 field fights.
2. **Instrument errors = 0** (no non-empty `instrumentErrors`,
   no parse failures, no `unclassified` start mode).
3. **Corpus complete on all 8 seeds** (8/8 per-seed files parse,
   each with a full series).
4. **Launch + wait classification:** every launch has a
   gate-arrival verdict (arrived / not-arrived) AND every wait
   episode has an end reason; explicitly unclassified
   (launch with no determinable arrival, episode with end
   `unknown`) ≤ 10% of launches and ≤ 10% of episodes
   respectively.

A miss is NO-GO, never re-scored mid-run; the revision is
proposed under "metric review" for the NEXT run. GO means the
instrument is valid and its first numbers stand — it is NOT a
verdict on any lever (no lever is tested here).

## Per-seed table (evidence file)

Per seed: unlock day, first-faced day, faced-distinct (final w5),
wave-5 kills split field / TB, field deaths from encounter rows
(wave 5, and wave 4 for reference), vet5 at unlock / at end,
days rd5ready after unlock, median survival (days), endReason.
Plus pooled rows: fights by start mode, launches by size/source,
gate arrivals + days-to-gate, fights joined by launched parties,
waits + episodes by end reason, pool-census medians at waits,
win-plan sums, and the wall numbers.

## Mechanism decomposition (what the evidence must show)

Whether the verdict is GO or NO-GO, the evidence names the flow
as measured, in order: (a) how wave-5 fights start (start-mode
split — is the expedition path even where fights happen?); (b)
what launched parties do (how many launch, at what size, to
where, how many reach the gate, how many days it takes, how
many fight together); (c) why waits end (pool census at waits —
is the second companion ever free at Haven? — vs hold-expiry vs
plan abandonment); (d) whether SEEK ever fires and through
which start mode; (e) field deaths from encounter rows, so the
next lever's kill:death bar can count them. If the instrument
shows a clear lever, the evidence NAMES it with a prereg-ready
GO bar for a future run.

## Proof test

`scripts/test-gatereach-b.js` proves, on synthetic fixtures and
a live in-memory run (no corpus numbers): the recorder wraps are
present (origin stamp, expedition membership, launch rows,
wait pool census, extended depart rows); the frozen wave-5 id
set matches `src/data/monsters.json` wave 5 exactly; the
classifier assigns each start mode correctly on synthetic rows
(incl. the `other` and `unclassified` cases); the wait-episode
builder closes episodes with each end reason; the field-death
count reads encounter rows (vDie) and NOT the death log's killer
field; the analyzer classifies synthetic per-seed fixtures and
the judge implements the bars (GO shape + one NO-GO per bar +
boundary GO); the driver is deterministic (seed 100821, 60d,
twice identical, 0 errors). GREEN before the corpus runs;
re-run green on the rebased tip before landing.

## Sense-testing

Quote the wave-5 fight lines the recorder captures
(`w5encounters[].lines` / `log`) for 2–3 wave-5 fights and judge
whether the fights read like fights — and hand-check one fight
per start mode present: does the classification match what a
player would see (a party that set out together, allies running
in mid-fight, a villager alone)? Name the fight lines' source
(seed, day, fighter, monster) and the counts searched (wave-5
encounters scanned, fight lines found). Do not invent fight
narrative from kill counts.

## Metric review (to be filled in the evidence file)

Pre-registered here: the classified-share bar counts `other`
origins as unclassified — if patrol or another caller turns out
to carry a large share of wave-5 fights, the bar may fail while
the instrument is actually informative; the review will say
whether the bar or the classification needs the revision. The
gate-arrival window uses launch duration as its bound; if
expeditions routinely return early or linger, the review will
say so and propose recording the return. The wait-episode
`horizon` end is honest, not a failure — but if most episodes
end at the horizon, the review will say the 150d window is too
short to see waits resolve.
