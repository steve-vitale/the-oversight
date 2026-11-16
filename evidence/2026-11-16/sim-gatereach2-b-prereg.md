# sim-gatereach2-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261116T0530Z`, axis winnability chain, arm
sim-gatereach2-b — DIAG follow-up: why `winPlanFightGate` is consulted
only ~2–3 times per 8-seed leg. Branch `sim-gatereach2-b`, base master
tip `3322fb0df` (journey establishment r221). Binding prereg: this
file — frozen here, judged in `evidence/2026-11-16/sim-gatereach2-b.md`
without alteration. The instrument (driver, analyzer, proof test) is
built AFTER this commit; no judged numbers exist yet.

## The question, in plain words

Gatereach-b measured gate reachability on a baseline band WITHOUT the
seed call: launches 0/40 reached a wave-4+ target, the gate was
consulted about wave 5 zero times and about wave 4 only 9 times
across 8 seeds (~2–3 consultations per 8-seed leg in the
producergate legs), and no launched party ever fought a wave-5 beast
together. This follow-up measures gate consultation WITH the seed call
on (plans exist, launches happen): for every `winPlanFightGate`
consultation, WHICH path consulted it — and for every launched party
arrival, was the gate consulted, and with what answer.

## Prior art (read first)

- `evidence/2026-11-15/sim-gatereach-b.md` + prereg — the instrument
  this arm EXTENDS (driver/analyzer patterns reused, not rebuilt).
  Baseline band, no seed call: 40 launches, 9 gate arrivals, 0 wave-5
  gate rows, 8× `avoid:outmatched` + 1× null.
- `evidence/2026-11-15/sim-producerparty-b.md` — gate SEEK 0 in either
  leg; the launch forms a party of 2 while the gate demands 3 for
  wave 4+; fights arrive via the world-tick path, 9/9 no-gate armed.
- `evidence/2026-11-15/sim-dawnbid-a.md` + prereg — launch
  decomposition (1 launch in 24 seeded plans); the seed-call re-land /
  revert pattern and determinism legs (D1/D2/D3) reused here.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave 4 = 10
  ids in `src/data/monsters.json`; the doc lists 9, the data rules),
  `docs/PARTY.md`, `docs/VILLAGER-BRAIN.md`.

## Gate code facts (read from the code, not assumed)

- `winPlanFightGate(vid, mdef)` lives in `src/js/win-plan.js:482`.
  It returns null (old path), `{avoid:true, reason}` (no fight), or
  `{seek:true}` (walk in on purpose). Party = self +
  `villagerFightAllies(vid)` (sensed only, cap 2 allies). OUTMATCHED
  for wave ≥ 4 when party < 3 or not all armed/armored. SEEK only
  when the plan stage is hunt/standing, the beast is the target
  wave/species, party ≥ 3 armed+armored, AND the trick is known
  (else `trickHolds` → null). A table-stage veteran guard also
  avoids (`veteran-guard`) for wave ≥ 3 when party < 2 or unarmed.
- The gate has exactly ONE call site in the game:
  `expeditionMonster` (`src/js/villager-agency.js:612`). It is called
  only from `expeditionLeg` (agencyTick) for a villager ON expedition,
  on a monster roll. `resolveWildMonsterEncounter` (game.js, the
  world-tick path) NEVER consults the gate. `resolvePatrol` NEVER
  consults it. `aidFight` (comms.js) NEVER consults it. The
  `world-tick` / `aid` paths in the taxonomy below are therefore
  structural negatives: if the instrument ever records one, a new
  caller exists and the evidence must name it.
- The gate is consulted on EVERY `expeditionMonster` meeting, before
  the awareness check and before any fight: an `avoid` answer means
  no fight happens at that meeting, a null/SEEK answer means the
  ordinary encounter proceeds (or the SEEK walk-in). So a launched
  party's meeting with a beast ALWAYS produces a gate row — a
  launched-party arrival with no gate row would mean the meeting
  happened outside `expeditionMonster`, and must be counted, not
  assumed away.

## Design decision — the subject only exists with the seed call (frozen)

Verified on this tree before this prereg: on current master the
world-tick seed call is GONE (vetparty lever touch point 1, reverted
by commit `7ba893b4b`). A DIAG run on pure master would classify
~0 plans and ~0 launched arrivals: a vacuous result. So the
instrument leg re-lands ONLY the vetparty seed call, verbatim (the
13-line block removed by `7ba893b4b` in `resolveWildMonsterEncounter`,
`src/js/game.js`, beside the existing return-to-fight sighting block;
blob `a66d45a5e`): after a `fieldFight`/`aidFight` vs a wave-4+
monster ending `vFlee`, call `winPlanSeedFromFight(vid, mdef,
'fled')`; excluded for raids (`opts.raid`) and aid fights (`wViaAid`);
wave-gated inside the seed (wave ≥ 3). This is a DIAG reproduction
of the subject, NOT a balance change: it changes no number, no bar,
no gate, no price, no default. The lever's other touch points stay
reverted: no party shape / second companion (`win-plan.js`), no gate
counting, no dissolution, no brain `companion2` mirror.

The seed-call text, verbatim from `git show 7ba893b4b --
src/js/game.js` (lines removed at what is now just before `if
(rec.outcome === 'alreadyDead')`):

```
      // VETPARTY (sim-vetparty-a): a villager who FACED a wave-4+ beast
      // and lived — fought it and fled — now knows the type is real,
      // where it is, and that they survived it. That lived knowledge
      // seeds a win-plan re-engagement: go back after that type, with
      // a party. Only vFlee seeds: a kill already advances the plan
      // through winPlanNoteKill, a death ends the villager, a fleeing
      // monster was never faced, and raids/aid fights are defence, not
      // a place to return to. Wave-gated inside the seed (wave >= 3).
      try {
        if (!opts.raid && !wViaAid && rec && rec.outcome === 'vFlee' && this.winPlanSeedFromFight) {
          this.winPlanSeedFromFight(vid, mdef, 'fled');
        }
      } catch (e) {}
```

Disposition (vetparty/dawnbid precedent): after measurement the seed
call is REVERTED on the branch; at end `git diff
<control-anchor> HEAD -- src/` must be 0 lines. The instrument,
analyzer, proof test, corpora, and evidence merge evidence-only.
The seed-call text is preserved verbatim in this prereg and in git
history (commit `f0fb6fc18`).

## The instrument (frozen)

- Driver: `scripts/gatereach2-driver-20261116.js` (new — the
  gatereach driver extended, not rebuilt: same harness, snapshot,
  cascade, and w5 recorder — unchanged — plus the gate-consultation
  rows below). Recorder wraps are pure reads plus writes to
  driver-local arrays — no game-state writes, no RNG. The driver
  refuses to overwrite an existing per-seed file.
  `GATEREACH2_RECORDER=off` skips installing the recorder wraps
  (used by determinism leg D2).
- Gate-consultation rows (`w5gates`, extended — one row per
  `winPlanFightGate` call vs a wave-4+ monster, plus wave-3 rows
  recorded separately as secondary): {day, vid, mid, wave, result,
  reason, partySize, sensedSize, party, allArmed, allArmored, gear,
  trickKnown, planStage, planTarget, planParty, needWave, **path**,
  **caller**, **fighterExped**, **launch**}. `path` and `caller` are
  read from the call stack at the wrap (see frozen definitions);
  `fighterExped` is the fighter's live `agencyState().exped` entry
  at consultation time (or null); `launch` is the covering
  win-plan launch row for this vid (launch day ≤ day ≤ launch day +
  duration, launched=true) or null.
- Launched-arrival rows (analyzer-built from gate rows + encounter
  rows + launch rows, exported in the analysis JSON as
  `arrivals.rows`): one row per launched-party arrival (see frozen
  definitions): {seed, vid, mid, wave, day, launchDay, launchSource,
  gateConsulted, answer, reason, partySize, trickKnown, planStage,
  fightOutcome}. The analyzer also keeps the gatereach-b joins
  (launch→gate→fight, wait episodes, start modes) so the wall
  numbers and per-seed table compare with the baseline band.
- Analyzer: `scripts/analyze-gatereach2-b.js` (new — the gatereach
  analyzer extended). Classifies gate consultations by path and
  launched arrivals by consultation, prints the tables + per-seed
  table + wall numbers, writes
  `evidence/2026-11-16/gatereach2-b-analysis.json`, exits non-zero
  on any `unknown` consultation or arrival.
- Drift check: `scripts/gatereach2-drift-check.js` (new — see
  Correction below). First divergence must fall on/after the first
  `w5seeds` (wave ≥ 4) day per seed.

## Correction (2026-11-16, BEFORE any judged sim — no corpus exists yet)

**C1 — the drift smoke is gatereach2-native, not the verbatim
vetparty script.** The frozen D3 above first said "reuse
`scripts/vetparty-drift-check.js` verbatim". That script reads
`daily` (T-class daily fingerprints) and `v4seeds` — fields the
vetparty/dawnbid drivers carry but the gatereach substrate does
NOT: this driver's corpora carry `series` (daily snapshots) and
`w5seeds`, no `daily`, no `v4seeds`. Run verbatim, the script
would read zero days per seed and report `IDENTICAL` on every
seed — a vacuous CLEAN, not a check. So D3 runs as
`scripts/gatereach2-drift-check.js`, which implements the SAME
verdict logic (first divergence on/after the first lever-action
day per seed; NO PRE-LEVER DRIFT) over the series fingerprint
(standing total, faced counts per wave, vet4/vet5, readiness
flags, population, pantry, wave kills) with first-lever-day =
first wave-4+ `w5seeds` day in the instrument leg. The bars are
unchanged; only the smoke's input fields change. The verbatim
vetparty script is NOT run as D3 (its result on these corpora
would be meaningless); this correction records why.
- Proof: `scripts/test-gatereach2-b.js` (new; see below). GREEN on
  the instrument tip before the instrument leg runs; GREEN again
  post-revert.

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`, wave 4; 10,
  re-read live by the driver): `algorithm`, `audit`,
  `congregation`, `eater`, `eulogy`, `herald`, `influencer`,
  `reunion`, `strike`, `suburb`. (Doc drift carried from vetparty /
  dawnbid: `docs/MONSTER-WAVES.md` lists 9, no herald; the data
  has 10 and the data rules.)
- **Wave-5 monster ids** (from `src/data/monsters.json`, wave 5; 10,
  re-read live by the driver): `cancellation`, `editor`, `rerun`,
  `spoiler`, `timeslot`, `nielsen`, `finale`, `finale_crew`,
  `finale_opening`, `network_note`.
- **Gate consultation:** one `winPlanFightGate` call vs a wave-4+
  monster (wave-3 rows are recorded and reported separately; they
  do not enter the primary denominator). Answer: `seek` /
  `avoid:<reason>` / `null` / `other:<result>`.
- **Consultation path** (pure function of the recorded row, tested
  on synthetic fixtures — first match wins):
  1. `expedition-launched` — stack caller is `expeditionMonster`
     AND a covering win-plan launch row exists for the fighter
     (holder, launched=true, day in [launch day, launch day +
     duration]). The launched party arrived at the beast.
  2. `expedition-ordinary` — stack caller is `expeditionMonster`
     AND no covering win-plan launch row exists. An ordinary
     ranging expedition met the beast.
  3. `world-tick` — stack caller is `resolveWildMonsterEncounter`.
     Structurally impossible on current master (no call site); a
     non-zero count means a new caller exists and must be named.
  4. `aid` — stack caller is `aidFight`. Structurally impossible
     on current master; same rule as (3).
  5. `other:<fn>` — stack caller is some other named function.
     Counts as UNCLASSIFIED for the coverage bar (the instrument
     names the caller; it does not claim a path it cannot see).
  6. `unknown` — no src/js caller frame found (stack read failed).
     Any such row is an instrument error.
- **Launched party:** a win-plan launch row (`grLaunches`, role
  `holder`, launched=true) — a `startExpedition` call that actually
  created an expedition entry, tagged by the depart wraps
  (`win-plan` / `brain` source).
- **Launched-party arrival:** one gate row for a launched holder
  with day in [launch day, launch day + duration] (the meeting
  consulted the gate — the expected case, since
  `expeditionMonster` always consults it), OR one
  expedition-origin encounter row for a launched holder in the
  same window with NO gate row for the same (vid, day, mid) (the
  meeting did NOT consult the gate — the gap this DIAG hunts for).
  A launched holder with no gate row and no expedition encounter
  in its window never arrived: counted in the launch→gate arrival
  rate (gatereach-b join), NOT in the arrival denominator.
  Multiple gate rows for one launch are multiple arrivals (one
  meeting each — the gatereach-b note that one gate row served
  three launches' windows is a launch-counting caveat, not an
  arrival-merging rule).
- **Arrival classification** (pure function of the joined row):
  `consulted` (gate row present — answer, party size at the gate,
  trick-known state recorded) vs `not-consulted` (encounter with
  no gate row — answer `unknown`, party size / trick state from
  the encounter row where readable). `unknown` (arrival row that
  fits neither — analyzer bug) must be 0.
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, any `unknown` consultation path,
  or any seed whose unlock/faced/kill fields disagree (kills > 0
  with `maxWave < 5`, or `w5` > 0 before the unlock day) — same
  rule as gatereach-b.

## Primary metric + GO bars (frozen)

Primary metric: **share of wave-4+ gate consultations classified
by path** (classified = path in `expedition-launched`,
`expedition-ordinary`, `world-tick`, `aid`).

GO (instrument validity) iff ALL hold:

1. **≥ 90% of gate consultations classified by path, unknown 0.**
2. **≥ 90% of launched-party arrivals classified (gate consulted?
   answer? party size? trick known?), unknown 0.**
3. **Corpus 16/16 files parse** (8 control + 8 instrument legs,
   identical seeds).
4. **Neutrality proven:** D1 (repeat 60d seed 102001 twice,
   identical) + D2 (recorder on vs off, identical trajectories) +
   D3 drift smoke (`scripts/gatereach2-drift-check.js`, first
   divergence on/after first wave-4+ `w5seeds` day per seed;
   see Correction C1).
5. **Proof test `scripts/test-gatereach2-b.js` green.**

This is a DIAG: GO means the instrument is valid and the
decomposition is measured. It is NOT a lever GO — no game change
is judged, and nothing ships from this arm except the instrument
+ evidence.

## Secondary (reported, not judged)

- Consultation rate per leg by path (control vs instrument), and
  per-seed consultation counts.
- Arrival→consultation gap: for each launched arrival, days from
  launch to the gate row; arrivals with no gate row listed
  individually.
- Per-seed table: unlock day, first-faced day, faced-distinct,
  wave-5 kills split field / TB, field deaths from encounter rows,
  vet5 at unlock / at end, days rd5ready after unlock, median
  survival, endReason. Plus pooled rows: consultations by path and
  answer, arrivals by consultation + answer, launches by
  size/source, gate arrivals + days-to-gate, fights joined by
  launched parties, and the wall numbers (national / table / wins,
  wave-4/5 unlocks, median survival).
- Sense check: quote 2–3 gate/fight lines (`log[]`) from the
  instrument leg and judge whether the meetings read like meetings
  (a party that set out together, a gate turning them away, allies
  running in mid-fight).

## Seed bands (verified fresh per the seed-band-freshness skill)

- Corpus: **102001–102008** (8 seeds), TWO legs (control first,
  then instrument), identical seeds, same policy/horizon.
- Freshness check (2026-11-16, this arm, before this commit —
  scope and result): zero seed-band uses of 102001–102008 in (a)
  all `evidence/*/sim-*-prereg.md` (only hit is this file itself),
  (b) all `evidence/**/*.md` (only hit is this file itself), (c)
  `scripts/*.js` (zero hits), (d) the goal
  `hidden_files/convergence-tracker.md` and `sim-findings.md`
  (zero hits), (e) `~/memory/2026-11-*.md` (zero hits), (f)
  per-seed directory/filenames under `evidence/` (no
  `perseed-*10200*`, no `*10200*` filenames). The broad
  whole-evidence substring sweep returns only false positives of
  the known class: `pantryFreshBefore/After` kcal values
  (`102002`, `102006`) inside October census JSONs, a float
  fragment (`3958.262540102005`), and content-hash panel JSONs —
  none a seed. The one other naming hit is the coordinator's own
  claim file for this run
  (`hidden_files/lever-claims/fleshout-loop-b-20261116T0530Z.json`,
  "shared fresh band 102001-102008 candidate"), which IS this
  run, not a prior use. Neighbouring used bands avoided:
  100821–100828, 100861–100868, 100721–100728, 100761–100768,
  101001–101005, 190391–190398, 190541–190548, 190561–190568,
  190621–190628, 190631–190638.
- NEVER use: 100621–100636, 100861–100868, 100821–100828,
  100721–100728, 100761–100768, 10100–10139, 190391–190398,
  190621–190628, 190631–190638, 190541–190548, 190561–190568.
- Shared substrate note: sibling arm sim-companionpool-b runs on
  the same seed call, same band, same horizon/policy — but this
  arm does NOT depend on its files; the seed call is re-landed
  independently in this worktree (dawnbid pattern). Per-seed dirs
  are disjoint (`perseed-gatereach2-b-*`).

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js`,
  sha `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
  — verified by this arm with sha256sum before this commit; the
  same sha dawnbid recorded, `74a890f0844e` prefix). The driver's
  own-policy record carries the sha it ran under.
- Control anchor = the instrument commit (driver + analyzer +
  proof test, seed call ABSENT); instrument anchor = the seed-call
  commit. Both SHAs are recorded in the evidence file. Control leg
  first, then instrument leg, identical seeds.
- No balanced-panel compare is owed: the panel
  (`scripts/balance-panel.js`) is for before/after lever
  comparisons (§15) and this is a baseline-vs-subject DIAG
  instrument — stated here so its absence is a design decision,
  not a gap; the prereg bar is the judge. (If a future lever run
  reuses these legs as its control, the panel attaches there.)

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** instrument tip, seed 102001, 60d,
  recorder ON, run twice → identical per-seed JSON
  (deaths/days/endReason/vet5 + all gate rows identical).
- **D2 (wrap neutrality):** instrument tip, seed 102001, 60d,
  recorder ON vs recorder OFF (`GATEREACH2_RECORDER=off`) →
  identical trajectories (deaths/days/endReason/standing/vet5
  + daily fingerprints). The seed call is game code, not a wrap,
  so it is present in both legs — D2 isolates the wraps only.
- **D3 (drift smoke):** `scripts/gatereach2-drift-check.js` over
  the two corpora (see Correction C1 — gatereach2-native, same
  verdict logic as the vetparty smoke) — first divergence on/after
  the first wave-4+ `w5seeds` day per seed; NO PRE-SEED DRIFT. (The
  seed call is the instrument's first possible divergence cause, so
  the smoke's "first lever-action day" is the first `w5seeds` day,
  exactly as in the vetparty/dawnbid arms.)

## Proof test

`scripts/test-gatereach2-b.js` proves, on synthetic fixtures and
live in-memory runs (no corpus numbers):

- Static: the seed call is present in `src/js/game.js` (verbatim
  VETPARTY block) when the instrument tip is built, absent on the
  control anchor (the check records "not-built-yet", it does not
  crash); the driver wraps exist (`winPlanFightGate`,
  `winPlanSeedFromFight`, `startExpedition` — driver-side); the
  diff for game code touches exactly `src/js/game.js` (the seed
  call only); the wave-4 id set matches `src/data/monsters.json`
  wave 4 exactly (10 ids).
- Unit (classifier, synthetic fixtures): one fixture per
  consultation path — `expedition-launched`,
  `expedition-ordinary`, `world-tick`, `aid`, `other:<fn>`,
  `unknown`; one fixture per arrival outcome — consulted SEEK,
  consulted `avoid:outmatched`, consulted `avoid:veteran-guard`,
  consulted null (trick-hold), not-consulted (encounter, no gate
  row); precedence (launched beats ordinary when a covering
  launch exists; a gate row with no launch is ordinary, not
  launched).
- Recorder: synthetic fixtures for the gate-consultation row
  shape and the launched-arrival row shape; a live in-memory run
  proves the `winPlanFightGate` wrap records the consultation
  (path, party size, trick state, answer) without changing the
  gate's return value.
- Determinism: D1 + D2 as frozen above (seed 102001, 60d).
- GREEN on the instrument tip before the instrument leg runs;
  GREEN again post-revert.

## Sense-testing

Quote the gate/fight lines the recorder captures
(`w5encounters[].log[]`) for 2–3 gate consultations / fights in
the instrument leg and judge whether the meetings read like
meetings — and whether the PARTY reads like a party. Name the
lines' source (seed, day, fighter, monster) and the counts
searched. Do not invent fight narrative from kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft"
  (standing ≥ 100; readiness wave 4: 3 armored P≥10, 5 armed, 3
  tricks, 1 wave-3+ killer — the bar this chain feeds, not
  changes). Wave 5 "The Producers" (standing ≥ 200 AND wave-4
  faced). Doc drift noted: the doc lists 9 wave-4 monsters; the
  data has 10 (herald).
- `docs/PARTY.md` — the party concept this chain test-cases
  (party cap 3 — the scholar's party; the villager party of 3
  here is fighter + 2 sensed allies through
  `villagerFightAllies`).
- `docs/VILLAGER-BRAIN.md` — the one-brain contract: Phase 1
  (dawn scorer; drive candidates as scorer candidates), §9 (win
  prices / deed gates / readiness bars untouched; perception law).
- Prior evidence: `evidence/2026-11-15/sim-gatereach-b.md`
  (§5 — the 9 gate rows this DIAG decomposes by path),
  `evidence/2026-11-15/sim-producerparty-b.md` (gate SEEK 0;
  launch forms a party of 2, gate demands 3),
  `evidence/2026-11-15/sim-dawnbid-a.md` (1 launch in 24 seeded
  plans; the seed-call re-land pattern).

## Metric review (to be filled in the evidence file)

Pre-registered here: the path taxonomy assumes the gate's only
caller is `expeditionMonster` — if `world-tick` or `aid` ever
records non-zero, the review will name the new caller and the
code path that reaches it, and the bar (1) may need a revision
for the next run (a real second caller is informative, not a
failure of the instrument). The arrival denominator counts gate
rows, not distinct meetings: if one meeting produces two gate
rows for the same (vid, day, mid) — e.g. two expedition legs in
one day — the review will say so and propose de-duplication for
the next run. The 150d horizon is long enough if most launches
resolve within it; if a large share of launched holders are
still out at the horizon with no arrival, the review will say
the window, not the gate, is the blind spot.
