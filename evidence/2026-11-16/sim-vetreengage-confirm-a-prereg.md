# sim-vetreengage-confirm-a — PREREG (binding)

Run: fleshout-20261117T0015Z (Loop A, adopted 20261116T2315Z), axis
scale-onramp / winnability chain, arm sim-vetreengage-confirm-a
(CONFIRM of the sim-vetreengage-a pilot GO — no src/ change by design).
Branch `sim-vetreengage-confirm-a` (worktree
`~/workspace/worktrees/sim-vetreengage-confirm-a`).
Base: `580510a5d` (master tip at arm start; lever already ON master,
env-gated `VETREENGAGE=1`, default OFF — `VETREENGAGE` appears 3x in
`src/js/game.js`, 11x in `src/js/win-plan.js`, 6x in
`src/js/villager-brain.js`, verified 2026-11-17).
Binding prereg: THIS file — frozen before any judged sim. The confirm
driver, analyzer extension, and proof test are built AFTER this commit;
no judged numbers exist yet.

## The question, in plain words

The pilot (evidence/2026-11-16/sim-vetreengage-a.md, band 102601–102608)
scored PILOT GO on the frozen bars: mean vet5@end among unlocked 0.0 ->
1.4, survival 5/8 held. But the trio launch and gate-counting pieces
NEVER fired (0/19 wave-4-target launches at size 3, partyTrios 0,
countedRows 0/92); the gain came via the seed call + pair launches.
This confirm re-tests, on a FRESH band under the SAME frozen bars,
whether the vet5@end gain replicates — and whether trios ever fire
there. If it does NOT reproduce the gain, the pilot GO reads as small-n
fluctuation — say so plainly. The lever stays default-OFF either way: a
confirm GO does not flip any default; that is a later decision.

## Canon grounding

- `docs/CANON.md` — read first (done, this run).
- `docs/MONSTER-WAVES.md` §Monster counters — read (this run). Waves
  3–5 carry no `counter` data field; their counterplay is engine-real
  signature mechanics, learnable via `noteVillagerTrickObservation`
  (two observations teach the village the trick). The wave-4 gate's
  trick-known bar is the lever-adjacent canon here; the lever does not
  change it.
- **No canon doc covers the vetreengage lever itself.** There is no
  canon doc for wave-4 re-engagement parties, second-companion picks,
  trio launches, or gate-counting of co-tasked members. The lever is
  specified only in the pilot prereg and evidence (vetattrition §9 via
  sim-vetreengage-a). Nothing is invented here to fill that gap; this
  confirm measures the lever as built, it does not re-derive it.

## Seed band (verified fresh per the seed-band-freshness skill)

- Confirm: **102901–102908** (8 seeds), control leg first (lever
  absent, `VETREENGAGE` unset), then armed leg (lever on,
  `VETREENGAGE=1`), identical seeds, same policy/horizon.
- NEVER reuse the pilot band 102601–102608.
- NEVER 100521–100536 (gorgeprice2 CONFIRM), 190391–190398
  (7redef/guardablate), 190621–190628 (2b-fresh), 190631–190638
  (guardablate-fresh), 190541–190548, 190561–190568 (task-forbidden
  bands), 100821–100828 (vetparty-a pilot), 100841–100856 (vetparty-a
  confirm, reserved), 100861–100868 (dawnbid-a), 100871–100878
  (profilegate-a / seedattach-a), 102001–102008 (companionpool-b),
  102131–102138 (seedpaths-b), 102141–102148 (seedland-b),
  102401–102408 (profileshadow-a), 102601–102608 (vetreengage-a pilot).
- Freshness check (2026-11-17, before this commit, by this worker):
  zero hits for `10290[1-8]` / `102901` and for each exact seed
  102901–102908 in (a) all `*.md` under `evidence/` (full recursive
  grep — every dated prereg, evidence file, and note), (b) all
  `evidence/*/sim-*-prereg.md` re-checked separately, (c) all
  `evidence/2026-11-1*/sim-*.md` re-checked separately, (d) all `*.md`
  under the goal `hidden_files/` top level, (e) the pilot prereg's
  forbidden-band list (this band is not named in it). Neighbouring used
  bands named in the same search: 102601–102608 (vetreengage-a pilot),
  102401–102408 (profileshadow-a), 102141–102148 (seedland-b),
  102131–102138 (seedpaths-b), 102001–102008 (companionpool-b). The
  10290x range is unused. (Scope note: a full-tree grep over
  `evidence/**/*.json` corpora was started and killed — corpora are
  outputs, not reservations; the skill's scope is preregs plus the
  forbidden/contaminated lists they name, and that scope is fully
  covered above. The coordinator's independent check at ~00:53Z also
  found 0 hits in `evidence/**/*.md` for any of 102901–102908.)

## Horizon, policy, death-awareness, instrument

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js`,
  sha256 `df9b7dff4de498779655` at prereg time — first 20 hex; the
  driver's own-policy record carries the sha it ran under).
- Driver: `scripts/vetreengage-confirm-driver-20261116.js` (new,
  copied from `scripts/vetreengage-driver-20261116.js` with the arm
  name, RUN, OUTDIR, and file naming changed, PLUS the §9.4 recorder
  below). Same vetfirst T-class instrument
  `scripts/vetfirst-instrument-20261111.js` plus the wave-4
  per-encounter recorder wrapping `winPlanSeedFromFight`,
  `winPlanDepart`, `vbrainExecuteDepart`, `winPlanFightGate`,
  `fieldFight` wave-4+ only; per-seed rows `v4encounters`, `v4gates`,
  `v4seeds`, `v4departs`. Recorder wraps are pure reads plus writes
  to driver-local arrays. The driver refuses to overwrite an existing
  per-seed file. The driver sets `process.env.VETREENGAGE='1'` before
  load on the armed leg only; the control leg leaves it unset.
- **§9.4 recorder (new in this arm, diagnostic not judge):** wraps
  `Game.winPlanSecondCompanion` driver-side (wrap-based, like the
  planignite/trickshare drivers) — **no src/js change**. Each call
  records one `v4picks` row: {day, vid, firstCid, site (dawn-cands vs
  launch-depart, best-effort from the call stack, else 'unknown'),
  needWave, target, result (accepted/rejected), pick, reason, pool
  (poolCount, poolKillers, poolArmed, poolRest)}. Reason derivation:
  `env-off` (flag unset) / `no-plan` / `needWave-gate` (plan.needWave
  < 4) / `accepted` (pick returned) / `pool-empty` (no eligible
  Haven-idle villager) / `no-pick-despite-pool` (pool non-empty but no
  pick — flags a logic gap). Pool eligibility replicates
  `winPlanSecondCompanion`'s own checks as pure reads: alive, not the
  scholar, not vid/firstCid, trust >= 15, at Haven (npcNode == hx,hy),
  not engaged, no expedition, not sick, npcMaxDist >= 1; tier split
  living wave-3+ killer / armed / rest. The wrap calls the original
  first and reads the pool after (the pick is a pure read per its own
  comment, so post-call pool == at-call pool). If driver-side
  recording proves impossible, judge the confirm bars without it and
  document the gap explicitly — do not touch src/ to add it.
- Analyzer: `scripts/analyze-vetreengage-confirm-a.js` (new, copied
  from `scripts/analyze-vetreengage-a.js` with the `v4picks`
  decomposition added — pick attempts by result/reason/site and pool
  counts; judge unchanged). Computes the judged table from the
  T-class snapshots (vet5@end among unlocked, via the vetfirst
  `livingVeterans` rule and the vetattrition unlock derivation —
  gated spawn callers only, Corrections 1–2) and the mechanism
  decomposition from the recorder rows. It ALSO runs the vetattrition
  classifier (`scripts/vetattrition-analyze-20261115.js`, v3) over
  both legs' corpora so veteran exits are classified the same way as
  the DIAG (WILD share, party/solo split).
- Panel builder: `scripts/build-vetreengage-confirm-panels-20261116.js`
  (§15 balanced panels, confirm seeds 102901–102908, control -> armed;
  copied from the pilot builder with confirm file naming).
- Drift check: `scripts/vetparty-drift-check.js` reused as-is
  (compares control vs armed daily snapshots; requires the first
  divergence to fall on/after the first day the lever could act).
- Proof: `scripts/test-vetreengage-confirm-a.js` (new; see below).
  GREEN before the armed leg runs; re-run green on the final tip.

## Frozen definitions (identical to the pilot)

- **Wave-4 monster ids** (from `src/data/monsters.json`, wave 4; 10,
  re-read live by the driver so a stale roster refuses silently):
  `congregation`, `strike`, `influencer`, `audit`, `reunion`, `suburb`,
  `eulogy`, `algorithm`, `eater`, `herald`. NOTE (doc drift, carried
  from vetattrition §12): `docs/MONSTER-WAVES.md` says wave 4 has 9
  and lists no herald; the data has 10 and the data rules.
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

## Per-encounter definitions (carried from vetparty-a, plus §9.4)

The recorder wraps store, per seed: `v4seeds`, `v4departs`, `v4gates`,
`v4encounters` (pilot definitions unchanged) plus `v4picks` (one
`winPlanSecondCompanion` call: {day, vid, firstCid, site, needWave,
target, result, pick, reason, poolCount, poolKillers, poolArmed,
poolRest}).

## Primary metric + GO bar (frozen — SAME as the pilot, not re-scored)

Primary metric: **mean living wave-4 veterans at end among wave-5-unlocked
seeds** (lever ON vs lever OFF, same seeds).

GO iff ALL hold (confirm, same bars as the pilot):

1. **Mean vet5@end among unlocked, armed ≥ 1.0 AND ≥ 1.5× control.**
2. **Survival guardrail: survived/8 armed ≥ survived/8 control − 1.**
3. **Starvation watch (reported, not judged): armed ≤ control + 2.**

NO-GO otherwise. A confirm NO-GO is evidence-only: the instrument,
analyzer, prereg, and evidence merge; the LEVER stays as-is on master
(default OFF — this arm makes no src/ change either way).

**Metric review (pre-registered):** the pilot's ratio bar was vacuous
(control mean 0.0, so 1.5x of 0 is 0 and bar 1 was decided by the
absolute floor alone) — judge with the SAME frozen bars, do NOT
re-score; if control again reads 0, note the ratio half does no work
again. A future prereg may revise the bar; that revision is for the
NEXT run, not this one.

**Secondary (reported, not judged):** field wave-4 kills per seed
(lever vs control); TB wave-4 kills per seed; conversion rate wave-3 →
wave-4 killer; WILD scholar deaths per leg; launches by party size
(1/2/3) for wave-4-target plans; gate SEEKs / avoid:outmatched /
trick-holds for wave-4; second-companion availability (waits vs
launches at size 3); launched-party wave-4 kills (seedland-b's bar);
seed-bounce count (seed calls hitting target-null plans); vet5@end
distribution (0/1/2/3+) among unlocked; starvation deaths per leg
(watch: armed ≤ control + 2 — a GO with a starvation breach is
reported as a caveat in the evidence, not re-scored); wall numbers
(national / table / wins, wave-4/5 unlocks, median survival);
**pick-attempt decomposition (§9.4): attempts by result/reason/site,
pool counts at dawn, accepted picks by tier — the trio failure is
attributed to pool-empty vs needWave-gate, or the recorder says which
other reason dominates.**

## Per-seed table (evidence file)

Per seed, both legs: seed, unlocked day, vet5@unlock, vet5@end, wave-4
kills (field / TB), wave-3 killers made, conversions, veteran exits
(classified, via the vetattrition classifier), WILD scholar deaths,
starvation deaths, days survived, endReason, standing. Plus pooled rows:
mean vet5@end among unlocked (the judged number), kills per seed,
conversion rate, class counts; plus the mechanism decomposition (seeds →
launches by size → gate rows → encounters → kills → re-meetings), the
party-composition table (launched parties: how many include a living
wave-3 killer), the pick-attempt decomposition (§9.4), and the wall
numbers.

## Proof test

`scripts/test-vetreengage-confirm-a.js` proves, on synthetic fixtures
and a live in-memory run (no corpus numbers):

- Static: the lever's four touch points exist (seed call in
  `resolveWildMonsterEncounter`; `winPlanSecondCompanion`, gate-counting,
  and dissolution in `win-plan.js`; `companion2` in `winPlanCands` +
  `vbrainExecuteDepart` in `villager-brain.js`); the env gate
  `VETREENGAGE` guards each touch point; no src/ change in this arm
  (the lever is already on master — the static check asserts presence,
  not a fresh diff).
- Judge: the frozen bars implemented on fixtures (GO shape: armed mean
  1.2 vs control 0.6 with survival held; NO-GO shapes: mean below 1.0;
  mean above 1.0 but below 1.5x; survival guardrail breach; control
  mean 0.0 with armed 1.4 passes on the floor — the vacuous-ratio shape
  the pilot actually saw).
- Analyzer: synthetic T-class fixtures (vet5@unlock-after rule,
  starvation / WILD scholar counting) plus synthetic `v4picks` rows
  pooled by result/reason/site.
- Determinism D1: confirm seed 102901, 60d, twice, armed (env=1) —
  identical deaths/days/endReason/vet5 + identical recorder arrays
  including `v4picks`.
- Neutrality D2: same seed/days, confirm driver (env=1) vs pilot
  driver (env=1) — identical trajectories (deaths/days/endReason/
  vet5) and identical shared recorder rows (`v4seeds`, `v4departs`,
  `v4gates`, `v4encounters`); the new pick wrap must not perturb
  anything the pilot driver measured.
- Off-mode neutrality: `VETREENGAGE` unset behaves exactly as control
  — the pilot proof's §5e off-mode units are re-run (second companion
  null, gate does not count, no dissolution, brain mirror ignores
  companion2) against the confirm driver/analyzer imports.
- Recorder: synthetic fixtures for the pick-attempt row (accepted,
  pool-empty, needWave-gate, env-off) and the wave-4 id set matching
  `src/data/monsters.json` wave 4 exactly (10 ids).
- Encounter gear (Steve 2026-11-13): any live fight fixture stages a
  geared scholar fighting with a party — never a fresh un-geared
  scholar alone. Proofs must demonstrate the observable effect, not
  just green assertions.

GREEN before the armed leg runs; re-run green on the final tip.

## Sense-testing

Quote the wave-4 fight lines the recorder captures
(`v4encounters[].log`) for 2–3 wave-4 fights per leg and judge whether
the fights read like fights — and whether the PARTY reads like a
party: do villagers set out together, arrive together, go back after
the same beast, name the beast they are hunting — or walk in solo and
die? Read the vetSays lines around veteran deaths (±2 days) and judge
whether the village says anything when a veteran dies (the DIAG found
silence: 0 death lines in 1223 T vetSays lines; the pilot reproduced
it: 0 of 30 exits mentioned). Name the fight lines' source (seed, day,
fighter, monster) and the counts searched. Do not invent fight
narrative from kill counts.
