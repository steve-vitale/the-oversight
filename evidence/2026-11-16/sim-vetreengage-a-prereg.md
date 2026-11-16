# sim-vetreengage-a — PREREG (binding)

Run: fleshout-20261116T2115Z (Loop A), axis scale-onramp / winnability chain,
arm sim-vetreengage-a (wave-4 re-engagement party lever, second attempt).
Branch `sim-vetreengage-a` (worktree `~/workspace/worktrees/sim-vetreengage-a`).
Base: `7bb50f3dc` (master tip at arm start).
Binding prereg: THIS file — frozen before any judged sim. The lever, driver,
analyzer, and proof test are built AFTER this commit; no judged numbers exist yet.

## The question, in plain words

Veterans bleed to zero after wave 5 unlocks, and the bleed is not wave-5
fights. The vetattrition DIAG (`evidence/2026-11-15/sim-vetattrition-a.md`)
proved, on 72 seeds: the scholar makes 57% of wave-4 kills; 76/139 exits
are WILD deaths (54.7%); only 3/139 are wave-4/5 fight deaths; veterans
almost never die in the scholar's party (inPartyDeaths 0/70) because they
are almost never in it (2.2% of veteran-days); mean living wave-4 veterans
at end among wave-5-unlocked seeds 0.59 (17/29); vet5 ends at 0 on 16/29.

## Why this is a second attempt, not a re-proof (read before judging)

The task as assigned says the vetattrition §9 lever was "specified NOT
built". That premise is stale — the chain has moved five arms since §9:

- **sim-vetparty-a** (2026-11-15, PILOT NO-GO): built the §9 lever
  verbatim — seed call, second companion, trio launch, gate counts
  co-tasked plan party, dissolution. Result: vet5@end 0.5 vs control 1.0,
  survived 4/8 vs 6/8. The trio never launched; gate SEEK 0; 105 of 106
  seeded plans never produced a depart row. Lever reverted.
- **sim-dawnbid-a** (DIAG GO): the loss is two gates — (1) the holder is
  not a ranger: `agencyTick` skips non-wanderer/explorer holders before
  `vbrainExecuteDepart` (8/24 selected-not-executed); (2) no companion at
  Haven (11/24). Plus: the seed only attaches when the fleeing villager
  already has an engagement plan aimed at the fled type (9/9 control seeds
  bounced off target-null plans).
- **sim-companionpool-b** (DIAG GO): profile is the pool's binding
  constraint — 593/638 (93%) of members reaching the profile check are not
  rangers; eligible pool empty on 161/196 scored dawns; holders never
  rangers (0/196 dawns).
- **sim-profilegate-a** (LEVER, PILOT NO-GO on a frozen dawn-only bar):
  the gate bypass — a bid-and-selected `party_launch` commit bypasses the
  non-ranger profile gate in `agencyTick` — works mechanically (2 real
  wave-4 party launches via mid-day commits) but dawn selections died
  because holders were away as companions on other trips. Gate fix +
  seed call reverted after measurement.
- **sim-seedattach-a** (DIAG GO): the seed-attach gap measured (hunt-stage
  plans go target-null; the dominant heard-at-fire shape cannot be helped
  by seed-attach).
- **sim-seedland-b** (NO-GO): seed call + gate fix together launch parties
  (0 → 3 launches on 8 seeds) but launched parties never re-met their
  target; all three launches ended with the holder dying at home. Kills 0.

**What is new in THIS arm, and why it is not a re-proof:** the
PROFILEGATE bypass has since LANDED on master (verified present in this
worktree, `src/js/villager-agency.js:383` — "a bid-and-selected party_launch
commit" bypass). The vetparty lever has NEVER been judged with plans able
to depart: vetparty-a ran without the bypass, profilegate-a ran without the
vetparty lever, seedland-b ran without the vetparty lever. This arm judges
the full combined chain for the first time — seed call + trio launch +
gate-counts-plan-party + dissolution, on a master that already carries the
bypass — against the §9 GO (vet5@end). The trio and gate-count pieces are
the untested variables against seedland-b's "never re-met the target"
failure: a trio that walks in on purpose (SEEK) is the shape that could
convert a launch into a kill. If this arm NO-GOs, the next blank is the
re-meeting gap seedland-b named, not the departure gates.

**Env gate (new in this arm):** the lever is gated by `VETREENGAGE=1`
(default OFF — `typeof process !== 'undefined' && process.env &&
process.env.VETREENGAGE === '1'`, the codebase's established pattern,
e.g. `CAPDRAW2`, `FIGHTOPEN` in `src/js/`). Every lever touch point
checks it: the seed call, the second-companion pick, the trio launch in
both depart paths, the gate count, the dissolution. With the flag unset
the code is behavior-identical to base; the proof test covers the live
path and the off-mode post-revert (D1 determinism + D2 neutrality).

## The lever (frozen — exact changes)

Re-applied verbatim from vetparty-a lever commit `f0fb6fc18`
(`git apply --check` clean on this base, 2026-11-16), plus the env gate
at each touch point. Four game-code touch points, all inside the win-plan
home plus the seed call site:

1. **`src/js/game.js` — the world-tick seed (VETPARTY).** In
   `resolveWildMonsterEncounter`, beside the existing return-to-fight
   sighting block: after a `fieldFight` / `aidFight` vs a wave-4+
   monster ending `vFlee`, call `winPlanSeedFromFight(vid, mdef, 'fled')`
   — gated on `VETREENGAGE=1`. Wave-gated inside
   `winPlanSeedFromFight` (wave ≥ 3). Excluded for raids (`opts.raid`)
   and aid fights (`wViaAid`). No seed on `vKill` (`winPlanNoteKill`
   handles it), `mFlee`, `vDie`, or `alreadyDead` / `evade`. **FACED
   means fought-and-fled here.**
2. **`src/js/win-plan.js` — the party shape + gate count + dissolution.**
   - (a) `winPlanSecondCompanion(vid, hx, hy, firstCid)` (new Game
     method): for a plan whose target is a wave-4+ species
     (`plan.needWave >= 4`), pick a second companion from villagers at
     Haven (same node — seen, not roster-fed), alive, not the scholar,
     not engaged / away / on-expedition, not sick, trust ≥ 15, range
     profile unrestricted. Preference: (1) living wave-3+ killers
     (a `waveKillLog` entry with `w >= 3`); (2) armed villagers; (3) the
     rest; within tiers, `companionRank` order (formula untouched).
     PURE READ at pick time (Correction 1 from vetparty-a: dawn is
     read-only; gear-up happens at launch). Returns null when the gate
     is off or no second companion is free.
   - (b) `launchParty` (in `winPlanDepart`): for wave-4-target plans,
     launch vid + first companion + second companion when one is
     available and launchable (`companionLaunchable`: gear-up first,
     then armed-OR-armored, not sick, range ≥ 1, hurt < 70 needs
     medicine or a healer — hoisted to a named fn shared by both
     companion paths; the hoist is behavior-identical for the first
     companion). `plan.party` = the launched companions. Mirror the
     companion's plan (stage `hunt`, same target/node) for each
     launched companion. Launch with one companion when no second is
     free (no extra waiting beyond the existing PARTY_WAIT_DAYS cap).
   - (c) `winPlanFightGate`: party = [vid] + sensed allies +
     co-tasked plan.party members (alive, agency exped state exists
     with the same tx/ty as the fighter's expedition). The OUTMATCHED /
     SEEK bars are otherwise unchanged (wave ≥ 4: party ≥ 3, all armed,
     all armored; SEEK additionally requires the trick known and a
     hunt/standing plan targeting the species). The fight itself still
     starts with the sensed allies only — counted members are never
     injected into `fieldFight`.
   - (d) Dissolution: in `winPlanHavenTick`, when a plan-holder at
     Haven is in stage `party` or `hunt` and any recorded `plan.party`
     member is dead, clear `plan.party` and drop the stage back to
     `party` (re-form; `partyDissolved` counter). Standing/table stages
     are not dissolved. The party persists until the type is killed
     (`winPlanNoteKill` advances to `standing`, existing) or a member
     dies (this rule).
3. **`src/js/villager-brain.js` — the dawn mirror.**
   - `winPlanCands`: the `party_launch` candidate carries `companion2`
     (via `winPlanSecondCompanion`) when the plan targets a wave-4+
     species and a second companion is free at dawn (gated on
     `VETREENGAGE=1`).
   - `vbrainExecuteDepart`: the `party_launch` mirror launches vid +
     companion + companion2 on the same shared target, verifies each
     companion's expedition started (`exped[cid]` exists — for the
     second companion; the pre-existing mirror gap for the first
     companion stays as-is), sets `plan.party` to the launched
     companions. If the second companion's expedition fails to start,
     launch as a pair rather than holding.
   The fallback path (`winPlanDepart`) implements the same launch shape
   — the proof test asserts both paths launch a trio the same way.

## What the lever does NOT do

- No readiness-bar, standing, deed-gate, win-price, or table change.
  No gate-bar change (the 3 / armed / armored / trick-known bars stand).
- No change to `companionScore` / `companionRank` (shared formula
  untouched; only the second-companion eligibility pool widens, and only
  for wave-4-target plans).
- No change to `villagerFightAllies` (the fight's starting party is still
  the sensed party; calledHelp still adds mid-fight).
- No recall of foragers/workers: the second-companion pool is Haven-idle
  only.
- No change to the scholar's party (`party.js` untouched) and no change
  to scholar behavior. The lever is villager-side.
- No new join trigger, no roster scan: every companion is seen at Haven
  (same node) with trust ≥ 15.
- No seed-attach fix: the seed still only retargets an existing
  engagement plan aimed at the fled type (seedattach-a's gap is a known
  limitation, measured via the analyzer's seed-bounce count, not fixed
  here — a fresh-plan creation is a bigger design change than this lever).
- No change to the PROFILEGATE bypass already on master (it is the base
  this lever is judged on, not part of this lever).

## Seed bands (verified fresh per the seed-band-freshness skill)

- Pilot: **102601–102608** (8 seeds), control leg first (lever absent,
  prereg tip), then armed leg (lever on, `VETREENGAGE=1`), identical
  seeds, same policy/horizon. Pilot gate: 8 seeds before/after before
  any confirm spend.
- Confirm (ONLY on a pilot GO): fresh band to be verified at that time
  (not pre-claimed here).
- NEVER 100521–100536 (gorgeprice2 CONFIRM), 190391–190398
  (7redef/guardablate), 190621–190628 (2b-fresh), 190631–190638
  (guardablate-fresh), 190541–190548, 190561–190568 (task-forbidden
  bands), 100821–100828 (vetparty-a pilot), 100841–100856 (vetparty-a
  confirm, reserved), 100861–100868 (dawnbid-a), 100871–100878
  (profilegate-a / seedattach-a), 102001–102008 (companionpool-b),
  102131–102138 (seedpaths-b), 102141–102148 (seedland-b),
  102401–102408 (profileshadow-a).
- Freshness check (2026-11-16, before this commit): zero hits for
  `102601`, `10260`, and the exact pilot seed numbers, in (a) all `*.md`
  under `evidence/` (every dated prereg, evidence file, and note —
  full recursive grep), (b) all `sim-*-prereg.md` under `evidence/`
  (re-checked separately), (c) all `*.md` under the goal `hidden_files/`
  top level plus `convergence-tracker.md` and `sim-findings.md`,
  (d) per-seed directory names under `evidence/` (`find -maxdepth 2
  -name "*10260*"` — empty), and (e) `scripts/*.js` (driver band
  literals). Neighbouring used bands named in the same search:
  102001–102008 (companionpool-b), 102131–102138 (seedpaths-b),
  102141–102148 (seedland-b), 102401–102408 (profileshadow-a). The
  10260x range is unused. (Scope note: the deep recursive grep over
  goal `hidden_files/` subdirectories was not run — a full-tree grep
  there timed out twice under current box load; the files that carry
  band reservations — preregs, tracker, findings, top-level notes —
  were all searched.)

## Horizon, policy, death-awareness, instrument

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js`,
  sha256 `74a890f0844ebc19…` at prereg time; the driver's own-policy
  record carries the sha it ran under).
- Driver: `scripts/vetreengage-driver-20261116.js` (new, copied from
  `scripts/vetparty-driver-20261115.js` with the arm name and
  `VETREENGAGE` env wiring changed; same vetfirst T-class instrument
  `scripts/vetfirst-instrument-20261111.js` plus the wave-4
  per-encounter recorder wrapping `winPlanSeedFromFight`,
  `winPlanDepart`, `vbrainExecuteDepart`, `winPlanFightGate`,
  `fieldFight` wave-4+ only; per-seed rows `v4encounters`, `v4gates`,
  `v4seeds`, `v4departs`). Recorder wraps are pure reads plus writes
  to driver-local arrays. The driver refuses to overwrite an existing
  per-seed file. The driver sets `process.env.VETREENGAGE='1'` before
  load on the armed leg only; the control leg leaves it unset.
- Analyzer: `scripts/analyze-vetreengage-a.js` (new, copied from
  `scripts/analyze-vetparty-a.js` with paths/anchors changed).
  Computes the judged table from the T-class snapshots (vet5@end among
  unlocked, via the vetfirst `livingVeterans` rule and the vetattrition
  unlock derivation — gated spawn callers only, Corrections 1–2) and
  the mechanism decomposition from the recorder rows. It ALSO runs the
  vetattrition classifier (`scripts/vetattrition-analyze-20261115.js`,
  v3) over both legs' corpora so veteran exits are classified the same
  way as the DIAG (WILD share, party/solo split).
- Panel builder: `scripts/build-vetreengage-panels-20261116.js` (§15
  balanced panels, pilot seeds 102601–102608, control → armed).
- Drift check: `scripts/vetparty-drift-check.js` reused as-is (compares
  control vs armed daily snapshots; requires the first divergence to
  fall on/after the first day the lever could act).
- Proof: `scripts/test-vetreengage-a.js` (new; see below). GREEN before
  the armed leg runs; re-run green on the lever tip and in the off-mode
  post-revert shape.

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`, wave 4; 10,
  re-read live by the driver so a stale roster refuses silently):
  `congregation`, `strike`, `influencer`, `audit`, `reunion`, `suburb`,
  `eulogy`, `algorithm`, `eater`, `herald`. NOTE (doc drift, carried
  from vetattrition §12): `docs/MONSTER-WAVES.md` says wave 4 has 9
  and lists no herald; the data has 10 and the data rules.
- **Wave-3 monster ids** (for the second-companion killer check — a
  kill is wave-3+ by `waveKillLog.w`, not by id list, so no frozen
  wave-3 list is needed).
- **UNLOCKED (per seed):** wave 5 unlocked — the vetattrition T-class
  derivation: first snapshot day where ready5.ready AND standing ≥ 200
  AND a wave-4 spawn/kill seen, min'd with the first gated wave-5 spawn
  day (callers `Object.checkEncounter` /
  `Object.maintainWorldMonsters` only; `titanPlace` /
  `Object.finaleCampaignPlace` spawns never imply unlock). Unlock day =
  that day; null when neither exists.
- **VET5@END (per seed):** living wave-4+ killers at run end (vetfirst
  `livingVeterans` rule: living = current scholar, or on roster with vp
  not dead; pyrrhic kills count when the killer lives). VET5@UNLOCK
  likewise, read at the first snapshot AFTER the unlock day
  (vetattrition §12: the unlock-day snapshot can predate a mid-day
  second veteran).
- **FIELD KILL vs TB KILL (per seed):** wave-4 kills from
  `waveKillLog` split by `via`: `wild` / `companion` / `aid-crisis` /
  `agency` = field; `player` = scholar turn-based.
- **WAVE-4 KILLS (per seed):** `waveKillLog` entries with `w === 4`,
  split field / TB as above.
- **CONVERSION (per seed):** wave-3 killers alive at any point who later
  make a wave-4 kill, over wave-3 killers who die without one (T-class
  `vetsW4` + `waveKillLog`).
- **Instrument error:** any non-empty `instrumentErrors`, any per-seed
  file failing to parse, any seed whose unlock/kill fields disagree
  (wave-4 kills > 0 with `maxWave < 4`, or a vet5@end that disagrees
  with the final snapshot's `vetsW4.killers` count).

## Per-encounter definitions (carried from vetparty-a)

The recorder wraps store, per seed:

- `v4seeds`: one `winPlanSeedFromFight` call with a wave-4+ target:
  {day, vid, mid, wave, outcome, stageAfter, target, node}.
- `v4departs`: one `winPlanDepart` / `vbrainExecuteDepart` party launch
  or hold for a wave-4-target plan: {day, vid, source, result, stage,
  target, partySize, party (vids), partyKillers (how many of the party
  are living wave-3+ killers), partyArmed (how many armed)}.
- `v4gates`: one `winPlanFightGate` call with a wave-4 `mdef`: {day,
  vid, mid, wave, result (seek/avoid/null), reason, partySize (sensed +
  counted), sensedSize, countedSize (co-tasked plan members counted),
  allArmed, allArmored, trickKnown, planStage, planTarget, needWave}.
- `v4encounters`: one `fieldFight` row with a wave-4 `mid`: {day, vid,
  mid, wave, alliesN, allyVids, allyFromStart, gate (the gate snapshot
  for this fight, if any), outcome, rounds, vTaken, mDealt, calledHelp,
  allyVid, trickBefore, trickAfter, lines[]}.

## Primary metric + GO bar (frozen from vetattrition §9, via the task)

Primary metric: **mean living wave-4 veterans at end among wave-5-unlocked
seeds** (lever ON vs lever OFF, same seeds).

GO iff ALL hold (pilot, then confirm on the same bars):

1. **Mean vet5@end among unlocked, armed ≥ 1.0 AND ≥ 1.5× control.**
   (Baseline measured in the DIAG: 0.59, 17/29. The 1.0 floor means the
   average unlocked village ends with at least one living veteran; the
   1.5× means the lever moved the mean, not the noise. The control leg's
   own baseline on THIS band is the judge — the DIAG's 0.59 is a
   cross-corpus mean, not this band's baseline.)
2. **Survival guardrail: survived/8 armed ≥ survived/8 control − 1.**
   (The lever must not buy veterans with villages.)

NO-GO otherwise. A pilot NO-GO is evidence-only: the instrument,
analyzer, prereg, and evidence merge; the LEVER does not merge (killed
arms leave no trace — the lever commit is reverted on the branch, as
vetparty-a, producerparty, and producergate did). A pilot GO spends a
fresh confirm band (verified at that time); a confirm NO-GO is
evidence-only the same way.

**Secondary (reported, not judged):** field wave-4 kills per seed (lever
vs control); TB wave-4 kills per seed; conversion rate wave-3 → wave-4
killer; WILD scholar deaths per leg; launches by party size (1/2/3) for
wave-4-target plans; gate SEEKs / avoid:outmatched / trick-holds for
wave-4; second-companion availability (waits vs launches at size 3);
launched-party wave-4 kills (seedland-b's bar — reported here so the
re-meeting gap is measured, not assumed); seed-bounce count (seed calls
hitting target-null plans); vet5@end distribution (0/1/2/3+) among
unlocked; starvation deaths per leg (watch: armed ≤ control + 2 — a GO
with a starvation breach is reported as a caveat in the evidence, not
re-scored); wall numbers (national / table / wins, wave-4/5 unlocks,
median survival).

## Per-seed table (evidence file)

Per seed, both legs: seed, unlocked day, vet5@unlock, vet5@end, wave-4
kills (field / TB), wave-3 killers made, conversions, veteran exits
(classified, via the vetattrition classifier), WILD scholar deaths,
starvation deaths, days survived, endReason, standing. Plus pooled rows:
mean vet5@end among unlocked (the judged number), kills per seed,
conversion rate, class counts; plus the mechanism decomposition (seeds →
launches by size → gate rows → encounters → kills → re-meetings), the
party-composition table (launched parties: how many include a living
wave-3 killer), and the wall numbers.

## Proof test

`scripts/test-vetreengage-a.js` proves, on synthetic fixtures and a live
in-memory run (no corpus numbers):

- Static: the lever's four touch points exist (seed call in
  `resolveWildMonsterEncounter`; `winPlanSecondCompanion`, gate-counting,
  and dissolution in `win-plan.js`; `companion2` in `winPlanCands` +
  `vbrainExecuteDepart` in `villager-brain.js`); the env gate
  `VETREENGAGE` guards each touch point (static: the literal appears at
  each site); the diff touches exactly those three files for game code
  (plus the driver's/analyzer's own scripts).
- Unit: `winPlanSecondCompanion` prefers a living wave-3 killer over an
  armed non-killer, both over an unarmed non-killer; refuses the dead,
  the scholar, the engaged, the away, the sick, the below-trust-15;
  refuses when the plan does not target wave-4+; returns null with the
  env flag unset (off-mode).
- Unit: the gate counts a co-tasked plan member (same tx/ty expedition)
  and does NOT count a plan member on a different target, a dead member,
  or a member with no expedition; with the env flag unset the gate does
  not count co-tasked members.
- Unit: dissolution clears `plan.party` and drops stage to `party` on a
  dead member in hunt stage, and does NOT dissolve a standing-stage plan;
  with the env flag unset no dissolution happens.
- Unit: the seed call fires only with the env flag set (fixture: vFlee
  vs wave-4, flag on → seed called; flag off → not called).
- Judge: the frozen bars implemented on fixtures (GO shape: armed mean
  1.2 vs control 0.6 with survival held; NO-GO shapes: mean below 1.0;
  mean above 1.0 but below 1.5×; survival guardrail breach).
- Recorder: synthetic fixtures for the four recorder rows; wave-4 id
  set matches `src/data/monsters.json` wave 4 exactly (10 ids).
- Determinism: pilot seed 102601, 60d, twice — identical deaths/days/
  endReason/vet5 + identical recorder arrays (D1, env=1).
- Neutrality: same seed, recorder ON vs OFF (env=1) — identical
  trajectories (D2); env unset vs the pre-lever base behavior on a
  fixture — the off-mode shape (proof re-run after revert: 22/0
  not-built-yet style check — the lever static check records
  "not-built-yet" before the lever commit exists).
- The lever static check records "not-built-yet" before the lever commit
  exists. GREEN before the armed leg runs; re-run green on the lever tip
  and in the off shape after any revert.

## Sense-testing

Quote the wave-4 fight lines the recorder captures (`v4encounters[].log`
— note vetparty-a's correction: narration lives in `log[]`, not
`lines[]`) for 2–3 wave-4 fights per leg and judge whether the fights
read like fights — and whether the PARTY reads like a party: do villagers
set out together, arrive together, go back after the same beast, name the
beast they are hunting — or walk in solo and die? Read the vetSays lines
around veteran deaths (±2 days) and judge whether the village says
anything when a veteran dies (the DIAG found silence: 0 death lines in
1223 T vetSays lines; dawnbid/companionpool/profilegate all reproduced
it). Name the fight lines' source (seed, day, fighter, monster) and the
counts searched. Do not invent fight narrative from kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first (done, this run).
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft" (standing ≥ 100;
  bands damage 35–95, HP 850–1500, pierce 0.2–0.5; readiness wave 4: 3
  armored P≥10, 5 armed, 3 tricks, 1 wave-3+ killer — the bar this lever
  feeds, not changes). Wave 5 "The Producers" (standing ≥ 200 AND wave-4
  faced). Doc drift noted: the doc lists 9 wave-4 monsters; the data has
  10 (herald).
- `docs/PARTY.md` — the party concept this lever test-cases.
- `docs/VILLAGER-BRAIN.md` — the one-brain contract: Phase 1 (dawn
  scorer; drive candidates as scorer candidates; the bank-veterans drive
  re-homed, never a seventh system), §9 (win prices / deed gates /
  readiness bars untouched; perception law; difficulty stance — a
  death-rate drop beyond ~15% is presumed a buff).
- Prior evidence: `evidence/2026-11-15/sim-vetattrition-a.md` (§6
  mechanism, §9 spec — this lever); `evidence/2026-11-15/sim-vetparty-a.md`
  + prereg (first build: PILOT NO-GO — trio never launched, SEEK 0);
  `evidence/2026-11-15/sim-dawnbid-a.md` (the two gates);
  `evidence/2026-11-16/sim-companionpool-b.md` (profile is the pool's
  binding constraint); `evidence/2026-11-15/sim-profilegate-a.md` (the
  bypass, now on master — works mechanically, 2 mid-day launches);
  `evidence/2026-11-15/sim-seedattach-a.md` (seed-attach gap);
  `evidence/2026-11-16/sim-seedland-b.md` (seed + bypass: launches 0→3,
  kills 0 — the re-meeting gap this arm's trio/SEEK shape must close).

## Metric review (to be filled in the evidence file)

Pre-registered here: the pilot control leg is the judged baseline (the
DIAG's 0.59 is a cross-corpus mean, not this band's baseline — the judge
compares THIS band's two legs). If the lever's seed fires (wave-4 seeds >
0) but vet5@end does not move, the review will say which link failed —
launches at size 3, gate SEEKs, field kills per bout, re-meetings, or
conversions — with the `v4departs` rows (both `winPlanDepart` and brain
sources), the `v4gates` rows, and the `v4encounters` rows as the evidence.
If vet5@end moves but field kills do not, the review will say whether the
gain is durability (fewer WILD deaths) rather than inflow. If kills rise
but the survival guardrail fails, the review will say the lever buys
veterans with villages and the bar holds as NO-GO. The per-encounter
recorder removes the DIAG's blind spot (party size + flee/fight per
fight, gate snapshot per fight); if the recorder itself misses fights
(e.g. aid fights bypassing the wrap), the review will name the gap.
