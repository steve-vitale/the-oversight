# sim-vetparty-a — PREREG (binding)

Run: fleshout-20261115T2115Z (Loop A), axis scale-onramp, arm
sim-vetparty-a (wave-4 re-engagement party lever). Branch
`sim-vetparty-a` (worktree `~/workspace/worktrees/sim-vetparty-a`).
Base: `d073bd656` (master tip at arm start; includes the
vetattrition DIAG, producerparty NO-GO, and producergate NO-GO
landings as evidence-only).
Binding prereg: THIS file — frozen before any judged sim. The
lever, driver, analyzer, and proof test are built AFTER this
commit; no judged numbers exist yet.

## The question, in plain words

Veterans bleed to zero after wave 5 unlocks, and the bleed is
not wave-5 fights. The vetattrition DIAG
(`evidence/2026-11-15/sim-vetattrition-a.md`, NO-GO on the 90%
classification bar only — the mechanism is named with per-seed
counts) proved, on 72 seeds:

- The scholar makes **57% of wave-4 kills** (70 of 123 w4+ log
  entries as the player); the two living veterans at unlock are
  usually the scholar plus one villager.
- **76/139 exits are WILD deaths** (54.7% of all exits; 65.5% of
  classified). Only **3/139 are wave-4/5 fight deaths**.
- Veterans almost never die in the scholar's party
  (**inPartyDeaths 0/70**) because they are almost never in it:
  veteran-days in party 216/9786 (2.2%).
- Mean living wave-4 veterans at end among wave-5-unlocked
  seeds: **0.59 (17/29)**; vet5 ends at 0 on 16/29 unlocked seeds.
- The inflow exists (269 wave-3 killer entries across the T
  legs) but wave-3 killers die before converting; wave-4
  veterans, once made, die the same way — solo, in the wild.

This arm builds the prereg-ready lever from vetattrition §9:
**the wave-4 re-engagement party** — a villager who has FACED a
wave-4 monster seeks out a party from other living wave-3
killers and armed villagers they have actually perceived and
goes back after that wave-4 type together; the party persists
until the type is killed or a member dies. It attacks inflow
(wave-3 killers converting before they die) AND durability
(party travel vs solo wild deaths) together — both are judged.

## Design question 1 — HOME (settled)

**There is no villager-side persistent-party build on current
master.** Scouted 2026-11-15 before this prereg:

- `src/js/party.js` is the scholar's formal party only
  (`partyMembers`, `partyCap`, up to 3, scholar-side).
- Grep for "persistent" across `src/js/party.js`,
  `src/js/villager-brain.js`, `src/js/win-plan.js` finds no
  villager party store (only an HP-persistence comment in
  party.js).
- `git log --all --grep=persistent -i` finds no persistent-party
  landing (only the villager-goals persistent bias, grave
  markers, and unrelated items).
- The standing memory agrees: "only the scholar has a formal
  party (up to 3, party.js); villagers join a nearby fight and
  scatter — no villager-side persistent party exists."

**Home: `src/js/win-plan.js`, as a scorer pursuit inside the
one-brain program — never a seventh system.** The win-plan is
already the per-villager gameplan store (`v.winPlan[vid]`:
stage, target, node, party, sinceDay), with ordered stages
gear → party → hunt → standing → table, seeded only from lived
or heard knowledge (`winplan_engagement`), and with the brain's
`winPlanCands` bidding `party_launch` / `party_wait` in the
dawn scorer (`docs/VILLAGER-BRAIN.md` Phase 1: drive
candidates as scorer candidates; the bank-veterans drive is
re-homed here, not merged as a separate system). The plan
record IS the persistence mechanism: `plan.party` survives
across days and re-launches until the target type is killed
(`winPlanNoteKill` advances hunt/party → standing) or a member
dies (dissolution rule, below). The lever adds a candidate
shape and a party shape inside that store; it does not add a
planner, a roster, or a second join trigger
(`winplan_no_second_join` stands: launches feed the existing
`villagerFightAllies` / `fieldFight` path).

**Does NOT touch the readiness-bar definition** (no Steve-call
needed). No standing, deed-gate, win-price, or table change.
No gate-bar change (the wave-4 bar stays party ≥ 3, all armed,
all armored, trick known for SEEK).

## Design question 2 — PARTY SIZE vs THE GATE (settled: BOTH)

The vetattrition spec says party ≥ 2, but the Producer pilot
proved a launched party of 2 gets gate SEEK 0 because the gate
demands 3 for wave-4+ fights (expedition meetings answer
`avoid:outmatched`). The two candidate reconciliations were:
(a) form parties of 3, or (b) count the plan's party in the
gate. **This lever does BOTH, in a shape the two NO-GOs
force:**

**(i) Launch with two companions for wave-4-target plans —
but NOT by waiting.** Producergate-b proved the wait is the
wrong shape: 128 departure attempts produced **2 size-3
launches**, and 561 `party_wait` bids produced 7
second-companion waits — the companion pool at Haven is the
binding constraint, and waiting does not create companions.
So the second companion comes from a **wider pool**: living
wave-3 killers of ANY range profile at Haven (the spec's own
pool — "other living wave-3 killers and armed villagers"),
trust ≥ 15, not engaged / away / on-expedition, not sick,
geared or gear-up-able. The range-profile filter
(wanderer/explorer only) excludes exactly the proven fighters
the spec names: a wave-3 killer has proven they can fight,
whatever their profile says about ranging. The pool stays
Haven-idle — nobody is recalled off a foraging trip, so the
starvation warning from producergate (armed 6 vs control 1,
concentrated on the heaviest-departure seeds) is respected by
construction. If no second companion is free, the plan
launches with one (today's behavior) — no extra waiting beyond
the existing PARTY_WAIT_DAYS cap; a pair that sets out is
better than a trio that never leaves.

**(ii) Count the plan's party in the gate.** In
`winPlanFightGate`, the party is [fighter] + sensed allies
(`villagerFightAllies`, up to 2) + plan.party members who are
alive AND co-tasked on the same expedition (same target node
tx/ty in the agency exped state). Justification: the plan's
party set out together on one shared target (same tx/ty,
same duration) — they are the travelling party even when the
encounter instant finds them a leg apart, because
`villagerFightAllies` only sees same/adjacent nodes at that
instant. The gate judges the party that set out, not the
earshot snapshot. The fight that follows still uses the sensed
allies for its starting party (the lever does NOT inject
counted members into `fieldFight` — that would be a fiction
about who is actually there); the gate's job is the SEEK/avoid
call, and the SEEK's value is walking in on purpose with the
trick known, which the field fight then plays with whoever is
actually beside the fighter, plus calledHelp. The gate's other
bars stand unchanged: all armed, all armored for wave-4+,
trick known for SEEK.

**Why both, not one:** (i) alone repeats producergate's
measured failure whenever the second companion is not free
(the wait never converts, and a pair still fails OUTMATCHED);
(ii) alone lets a launched pair count itself as 2 and still
fail the bar. Together they are the only shape that can ever
pass the gate: a trio that set out together, judged as the
trio it is. A party of 2 that can never pass the gate repeats
a measured failure — this prereg forbids that shape as the
judged mechanism (pairs still launch when no second companion
is free, and are counted as pairs in the decomposition, not
as gate passes).

## The lever (frozen — exact changes)

Four game-code touch points, all inside the win-plan home
plus the proven seed call site:

1. **`src/js/game.js` — re-land the world-tick seed
   (VETPARTY).** In `resolveWildMonsterEncounter`, beside the
   existing return-to-fight sighting block (same placement as
   producerparty commit `50c874822`, re-tagged): after a
   `fieldFight` / `aidFight` vs a wave-4+ monster ending
   `vFlee`, call `winPlanSeedFromFight(vid, mdef, 'fled')`.
   Wave-gated inside `winPlanSeedFromFight` (wave ≥ 3).
   Excluded for raids (`opts.raid`) and aid fights
   (`wViaAid`), like the sighting block: defence at the haven
   door is not a place to return to. No seed on `vKill`
   (`winPlanNoteKill` handles it), `mFlee` (the expedition
   path does not seed it either — parity), `vDie` (the dead
   hold no plan), or `alreadyDead` / `evade` (no fight).
   **FACED means fought-and-fled here** (vFlee in the wild
   path; evaded/fled in the expedition path already seed).
   The seed is perception-gated by construction: only the
   villager who actually fought the beast gets the plan
   (target = species, node = where fought, stage `party` if
   geared else `gear`). The seed covers wave-4+ flees, so
   wave-5 plans also form and benefit from the party/gate
   changes below — that is a secondary decomposition, not the
   judged metric.

2. **`src/js/win-plan.js` — the party shape + gate count +
   dissolution.**
   - **(a) `winPlanSecondCompanion(vid, hx, hy, firstCid)`**
     (new Game method, one implementation, two call sites):
     for a plan whose target is a wave-4+ species
     (`plan.needWave >= 4` or target id in the wave-4 set),
     pick a second companion from villagers at Haven (same
     node — seen, not roster-fed), alive, not the scholar,
     not engaged / away / on-expedition, not sick, trust ≥ 15
     (not a stranger), range profile unrestricted.
     Preference order: (1) living wave-3+ killers (a
     `waveKillLog` entry with `w >= 3` by that vid, killer
     living — the spec's pool first); (2) armed villagers.
     Within each tier, `companionRank` order (the shared
     OVE-54 score — the formula itself is NOT changed, so the
     door and favor-company rankings are untouched). The
     candidate must be geared or gear-up-able: gear them
     first (`villagerGearUp`), then require armed OR armored
     (same bar as the first companion in `launchParty`).
     Returns null when no second companion is free.
   - **(b) `winPlanDepart.launchParty`:** for wave-4-target
     plans, launch vid + first companion + second companion
     when one is available (same shared target/duration;
     verify each companion's expedition actually started
     before recording them — the `exped[cid]` check the
     first-companion path already does). `plan.party` =
     the launched companions. Mirror the companion's plan
     (stage `hunt`, same target/node, party `[vid]`) for
     each launched companion. Launch with one companion when
     no second is free (no extra waiting).
   - **(c) `winPlanFightGate`:** party = [vid] + sensed
     allies + co-tasked plan.party members (alive, agency
     exped state exists with the same tx/ty as the fighter's
     expedition). The OUTMATCHED / SEEK bars are otherwise
     unchanged (wave ≥ 4: party ≥ 3, all armed, all armored;
     SEEK additionally requires the trick known and a
     hunt/standing plan targeting the species).
   - **(d) Dissolution (persistence rule):** in
     `winPlanHavenTick`, when a plan-holder at Haven is in
     stage `party` or `hunt` and any recorded `plan.party`
     member is dead, clear `plan.party` and drop the stage
     back to `party` (re-form). The party persists until the
     type is killed (`winPlanNoteKill` advances to `standing`,
     existing) or a member dies (this rule). Standing/table
     stages are not dissolved — their purpose is already
     banked.

3. **`src/js/villager-brain.js` — the dawn mirror (the brain
   owns dawn; `winPlanDepart` is bypassed).**
   - `winPlanCands`: the `party_launch` candidate carries
     `companion2` (via `self.winPlanSecondCompanion`) when the
     plan targets a wave-4+ species and a second companion is
     free at dawn.
   - `vbrainExecuteDepart`: the `party_launch` mirror launches
     vid + companion + companion2 on the same shared target
     (same opts), verifies each companion's expedition started
     (`exped[cid]` exists — the mirror already lacks this
     check for the first companion; the lever adds it for the
     second only, and records only companions whose
     expedition actually started), and sets `plan.party` to
     the launched companions. If the second companion's
     expedition fails to start, launch as a pair rather than
     holding.

   The fallback path (`winPlanDepart`, used only when the
   brain does not own dawn) implements the same launch shape
   — the proof test asserts both paths launch a trio the same
   way on a fixture.

## What the lever does NOT do

- No readiness-bar, standing, deed-gate, win-price, or table
  change. No gate-bar change (the 3 / armed / armored /
  trick-known bars stand).
- No change to `companionScore` / `companionRank` (shared
  formula untouched; only the second-companion eligibility
  pool widens, and only for wave-4-target plans).
- No change to `villagerFightAllies` (the fight's starting
  party is still the sensed party; calledHelp still adds
  mid-fight).
- No recall of foragers/workers: the second-companion pool is
  Haven-idle only.
- No change to the scholar's party (`party.js` untouched) and
  no change to scholar behavior: the scholar still makes their
  share of wave-4 kills. The lever is villager-side.
- No new join trigger, no roster scan: every companion is
  seen at Haven (same node) with trust ≥ 15.

## Seed bands (verified fresh per the seed-band-freshness skill)

- Pilot: **100821–100828** (8 seeds), control leg first (lever
  absent, prereg tip), then armed leg (lever on), identical
  seeds, same policy/horizon. Pilot gate: 8 seeds before/after
  before any confirm spend.
- Confirm (ONLY on a pilot GO): **100841–100856** (16 seeds),
  same two legs, identical seeds.
- NEVER 100521–100536 (gorgeprice2 CONFIRM), 190391–190398
  (7redef/guardablate), 190621–190628 (2b-fresh),
  190631–190638 (guardablate-fresh), 190541–190548,
  190561–190568 (task-forbidden bands).
- Freshness check (2026-11-15, before this commit): zero hits
  for `10082[0-9]`, `10084[0-9]`, `10085[0-9]`, and for the
  exact pilot/confirm seed numbers, in (a) all `*.md` under
  `evidence/` (every dated prereg, evidence file, and note),
  (b) all `*.md` under the goal
  `hidden_files/` (tracker, claims, findings, convergence
  notes), (c) per-seed filenames under
  `evidence/2026-11-15/perseed-*/`, and (d) `scripts/*.js`
  (driver band literals). Neighbouring used bands named in
  the same search: 100701–100708 (producerparty scout),
  100721–100728 (producerparty pilot), 100741–100756
  (producerparty confirm, reserved), 100781–100788
  (producergate pilot), 100801–100816 (producergate confirm,
  reserved). The 10082x and 10084x/10085x ranges are unused.

## Horizon, policy, death-awareness, instrument

- Horizon 150 days, death-aware (dead villages stop
  simulating), policy **competent verbatim**
  (`scripts/policies/competent.js`, sha `74a890f0844e` at
  prereg time; the driver's own-policy record carries the sha
  it ran under). The standing fix marker (`ROSTER CHECK`) is
  present in `src/js/standing.js` on this tree — no swap is
  needed; both legs run on the worktree tip (control on the
  prereg tip, armed on the lever tip).
- Driver: `scripts/vetparty-driver-20261115.js` (new). ONE
  driver, TWO legs: it runs the **vetfirst T-class
  instrument** (`scripts/vetfirst-instrument-20261111.js`:
  daily snapshots with `vetsW4.killers`, `waveKillLog`,
  `veteranRows`, `partyMembers`, `ready4`/`ready5`,
  `regDeaths`, `spawns`/`fights`/`killCalls`, plus the
  `say` capture) AND the **wave-4 per-encounter recorder**
  (wraps `winPlanSeedFromFight`, `winPlanDepart`,
  `vbrainExecuteDepart`, `winPlanFightGate`, `fieldFight`
  wave-4+ only; per-seed rows `v4encounters`, `v4gates`,
  `v4seeds`, `v4departs`). Recorder wraps are pure reads
  plus writes to driver-local arrays. The driver refuses to
  overwrite an existing per-seed file.
- Analyzer: `scripts/analyze-vetparty-a.js` (new). Computes
  the judged table from the T-class snapshots (vet5@end among
  unlocked, via the vetfirst `livingVeterans` rule and the
  vetattrition unlock derivation — gated spawn callers only,
  Corrections 1–2) and the mechanism decomposition from the
  recorder rows. It ALSO runs the vetattrition classifier
  (`scripts/vetattrition-analyze-20261115.js`, v3) over both
  legs' corpora so veteran exits are classified the same way
  as the DIAG (WILD share, party/solo split).
- Panel builder: `scripts/build-vetparty-panels-20261115.js`
  (§15 balanced panels, pilot seeds 100821–100828,
  control → armed).
- Proof: `scripts/test-vetparty-a.js` (new; see below).
  GREEN before the armed leg runs; re-run green on the
  rebased tip before landing.

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`,
  wave 4; 10, re-read live by the driver so a stale roster
  refuses silently): `congregation`, `strike`, `influencer`,
  `audit`, `reunion`, `suburb`, `eulogy`, `algorithm`,
  `eater`, `herald`. NOTE (doc drift, carried from
  vetattrition §12): `docs/MONSTER-WAVES.md` says wave 4 has
  9 and lists no herald; the data has 10 and the data rules.
- **Wave-3 monster ids** (for the second-companion
  killer check — a kill is wave-3+ by `waveKillLog.w`, not by
  id list, so no frozen wave-3 list is needed).
- **UNLOCKED (per seed):** wave 5 unlocked — the vetattrition
  T-class derivation: first snapshot day where ready5.ready
  AND standing ≥ 200 AND a wave-4 spawn/kill seen, min'd with
  the first gated wave-5 spawn day (callers
  `Object.checkEncounter` / `Object.maintainWorldMonsters`
  only; `titanPlace` / `Object.finaleCampaignPlace` spawns
  never imply unlock). Unlock day = that day; null when
  neither exists.
- **VET5@END (per seed):** living wave-4+ killers at run end
  (vetfirst `livingVeterans` rule: living = current scholar,
  or on roster with vp not dead; pyrrhic kills count when the
  killer lives). VET5@UNLOCK likewise, read at the first
  snapshot AFTER the unlock day (vetattrition §12: the
  unlock-day snapshot can predate a mid-day second veteran).
- **FIELD KILL vs TB KILL (per seed):** wave-4 kills from
  `waveKillLog` split by `via`: `wild` / `companion` /
  `aid-crisis` / `agency` = field; `player` = scholar
  turn-based. (Producerparty/producergate lesson: the frozen
  metric mixes scholar TB kills with villager field kills —
  this arm judges field kills separately and reports the TB
  split, so the TB engine cannot pad either leg.)
- **WAVE-4 KILLS (per seed):** `waveKillLog` entries with
  `w === 4`, split field / TB as above.
- **CONVERSION (per seed):** wave-3 killers alive at any point
  who later make a wave-4 kill, over wave-3 killers who die
  without one (T-class `vetsW4` + `waveKillLog`).
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, any seed whose unlock/kill
  fields disagree (wave-4 kills > 0 with `maxWave < 4`, or a
  vet5@end that disagrees with the final snapshot's
  `vetsW4.killers` count).

## Per-encounter definitions (new in this arm)

The recorder wraps store, per seed:

- `v4seeds`: one `winPlanSeedFromFight` call with a wave-4+
  target: {day, vid, mid, wave, outcome, stageAfter,
  target, node}.
- `v4departs`: one `winPlanDepart` / `vbrainExecuteDepart`
  party launch or hold for a wave-4-target plan: {day, vid,
  source, result, stage, target, partySize, party (vids),
  partyKillers (how many of the party are living wave-3+
  killers), partyArmed (how many armed)}.
- `v4gates`: one `winPlanFightGate` call with a wave-4 `mdef`:
  {day, vid, mid, wave, result (seek/avoid/null), reason,
  partySize (sensed + counted), sensedSize, countedSize
  (co-tasked plan members counted), allArmed, allArmored,
  trickKnown, planStage, planTarget, needWave}.
- `v4encounters`: one `fieldFight` row with a wave-4 `mid`:
  {day, vid, mid, wave, alliesN, allyVids, allyFromStart,
  gate (the gate snapshot for this fight, if any), outcome,
  rounds, vTaken, mDealt, calledHelp, allyVid, trickBefore,
  trickAfter, lines[]}.

## Primary metric + GO bar (frozen from vetattrition §9)

Primary metric: **mean living wave-4 veterans at end among
wave-5-unlocked seeds** (lever ON vs lever OFF, same seeds).

GO iff ALL hold (pilot, then confirm on the same bars):

1. **Mean vet5@end among unlocked, armed ≥ 1.0 AND ≥ 1.5×
   control.** (Baseline measured in the DIAG: 0.59, 17/29.
   The 1.0 floor means the average unlocked village ends
   with at least one living veteran; the 1.5× means the lever
   moved the mean, not the noise.)
2. **Survival guardrail: survived/8 armed ≥ survived/8
   control − 1.** (The lever must not buy veterans with
   villages.)
3. **Cost bar: starvation (armed) ≤ control + 2.** (The
   producergate warning: heavy departures starve villages.
   Starvation is pooled deaths with cause starvation/thirst/
   dehydration across the leg.)

NO-GO otherwise. A pilot NO-GO is evidence-only: the
instrument, analyzer, prereg, and evidence merge; the LEVER
does not merge (killed arms leave no trace — the lever commit
is reverted on the branch, as producerparty and producergate
did). A pilot GO spends the confirm band; a confirm NO-GO is
evidence-only the same way.

**Secondary (reported, not judged):** field wave-4 kills per
seed (lever vs control); TB wave-4 kills per seed; conversion
rate wave-3 → wave-4 killer; WILD scholar deaths per leg;
launches by party size (1/2/3) for wave-4-target plans;
gate SEEKs / avoid:outmatched / trick-holds for wave-4;
second-companion availability (waits vs launches at size 3);
vet5@end distribution (0/1/2/3+) among unlocked; wall
numbers (national / table / wins, wave-4/5 unlocks, median
survival).

## Per-seed table (evidence file)

Per seed, both legs: seed, unlocked day, vet5@unlock,
vet5@end, wave-4 kills (field / TB), wave-3 killers made,
conversions, veteran exits (classified, via the vetattrition
classifier), WILD scholar deaths, starvation deaths, days
survived, endReason, standing. Plus pooled rows: mean
vet5@end among unlocked (the judged number), kills per seed,
conversion rate, class counts; plus the mechanism
decomposition (seeds → launches by size → gate rows →
encounters → kills), the party-composition table (launched
parties: how many include a living wave-3 killer), and the
wall numbers.

## Proof test

`scripts/test-vetparty-a.js` proves, on synthetic fixtures
and a live in-memory run (no corpus numbers):

- Static: the lever's four touch points exist (seed call in
  `resolveWildMonsterEncounter`; `winPlanSecondCompanion`,
  gate-counting, and dissolution in `win-plan.js`;
  `companion2` in `winPlanCands` + `vbrainExecuteDepart` in
  `villager-brain.js`) and the diff touches exactly those
  three files for game code (plus the driver's/analyzer's own
  scripts).
- Unit: `winPlanSecondCompanion` prefers a living wave-3
  killer over an armed non-killer, both over an unarmed
  non-killer; refuses the dead, the scholar, the engaged,
  the away, the sick, the below-trust-15; refuses when the
  plan does not target wave-4+; gears the pick before judging
  (armed-or-armored bar).
- Unit: the gate counts a co-tasked plan member (same tx/ty
  expedition) and does NOT count a plan member on a different
  target, a dead member, or a member with no expedition.
- Unit: dissolution clears `plan.party` and drops stage to
  `party` on a dead member in hunt stage, and does NOT dissolve
  a standing-stage plan.
- Judge: the frozen bars implemented on fixtures (GO shape:
  armed mean 1.2 vs control 0.6 with survival held; NO-GO
  shapes: mean below 1.0; mean above 1.0 but below 1.5×;
  survival guardrail breach; starvation breach).
- Recorder: synthetic fixtures for the four recorder rows;
  wave-4 id set matches `src/data/monsters.json` wave 4
  exactly (10 ids).
- Determinism: pilot seed 100821, 60d, twice — identical
  deaths/days/endReason/vet5 + identical recorder arrays.
- The lever static check records "not-built-yet" before the
  lever commit exists. GREEN before the armed leg runs;
  re-run green on the rebased tip before landing.

## Sense-testing

Quote the wave-4 fight lines the recorder captures
(`v4encounters[].lines`) for 2–3 wave-4 fights per leg and
judge whether the fights read like fights — and whether the
PARTY reads like a party: do villagers set out together,
arrive together, go back after the same beast, name the
beast they are hunting — or walk in solo and die? Read the
vetSays lines around veteran deaths (±2 days) and judge
whether the village says anything when a veteran dies (the
DIAG found silence: 0 death lines in 1223 T vetSays lines).
Name the fight lines' source (seed, day, fighter, monster)
and the counts searched. Do not invent fight narrative from
kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft"
  (standing ≥ 100; bands damage 35–95, HP 850–1500, pierce
  0.2–0.5; readiness wave 4: 3 armored P≥10, 5 armed, 3
  tricks, 1 wave-3+ killer — the bar this lever feeds, not
  changes). Wave 5 "The Producers" (standing ≥ 200 AND wave-4
  faced). Doc drift noted: the doc lists 9 wave-4 monsters;
  the data has 10 (herald).
- `docs/PARTY.md` — the party concept this lever test-cases.
- `docs/VILLAGER-BRAIN.md` — the one-brain contract: Phase 1
  (dawn scorer; drive candidates as scorer candidates; the
  bank-veterans drive re-homed, never a seventh system),
  §9 (win prices / deed gates / readiness bars untouched;
  perception law; difficulty stance — a death-rate drop
  beyond ~15% is presumed a buff).
- Prior evidence: `evidence/2026-11-15/sim-vetattrition-a.md`
  (§6 mechanism, §9 spec — this lever) and
  `evidence/2026-11-15/sim-vetattrition-a-prereg.md`
  (definitions reused); `evidence/2026-11-15/sim-producerparty-b.md`
  + prereg (the same mechanism one wave later: PILOT NO-GO —
  seed fired, launch chain worked, gate SEEK 0, party of 2);
  `evidence/2026-11-15/sim-producergate-b.md` (Loop B's
  NO-GO on the gate/expedition-meeting link: second companion
  almost never free at Haven, 2 size-3 launches in 128
  attempts, SEEK still 0, starvation 6 vs 1).

## Metric review (to be filled in the evidence file)

Pre-registered here: the pilot control leg is the judged
baseline (the DIAG's 0.59 is a cross-corpus mean, not this
band's baseline — the judge compares THIS band's two legs).
If the lever's seed fires (wave-4 seeds > 0) but vet5@end
does not move, the review will say which link failed —
launches at size 3, gate SEEKs, field kills per bout, or
conversions — with the `v4departs` rows (both `winPlanDepart`
and brain sources), the `v4gates` rows, and the
`v4encounters` rows as the evidence. If vet5@end moves but
field kills do not, the review will say whether the gain is
durability (fewer WILD deaths) rather than inflow. If kills
rise but the survival guardrail or the starvation bar fails,
the review will say the lever buys veterans with villages
and the bar holds as NO-GO. The per-encounter recorder
removes the DIAG's blind spot (party size + flee/fight per
fight, gate snapshot per fight); if the recorder itself
misses fights (e.g. aid fights bypassing the wrap), the
review will name the gap.
