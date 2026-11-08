# Pellet radiation rework — PREREGISTRATION AMENDMENT (to sim-pellet-boost-prereg.md)

Amendment to the landed pellet-boost build. Steve's correction
(2026-11-08 11:54 CST) supersedes the pantry-calorie cost the landed
build implements: the cost of overusing the pellet is HEALTH, not
pantry food. This amendment is written BEFORE any rework build.
Coordinator: coord-pellet-rads. One leg (cost-leg rework) plus its
proof panel is the expected shape; split only if the work demands it.

## Steve's correction, plain (2026-11-08 11:54 CST)

"Nah make the pellet cost health or something if overused by the
bearer. Basically it's free food for them, a power boost, and that
boost keeps working after a point but gives them radiation poisoning
that should work a bit like fallout."

- The pellet gives its bearer free food and basically unlimited
  power boosts. Each boost adds radiation exposure to the BEARER
  (the person, not the pellet). The boost keeps working — the power
  never cuts off — but as exposure builds, the bearer sickens
  Fallout-style (radiation degrades max health and/or causes
  periodic sickness damage, worse at higher exposure).
- Radiation lives on the person: when the pellet passes to hungrier
  hands, the new bearer starts from their own exposure.
- Exposure clears slowly when the bearer is not boosting, and
  medicine / a cure clears it faster.

## Steve's cure ruling (2026-11-08 13:12 CST) — Amendment A1

"There must be a cure for the radiation, not just handing the
pellet off." This design satisfies it: the cure is REAL and
proven, not just the pass. Healing-ability cures clear exposure
faster (a real cure drops exposure by `radsCureDrop`; slow decay
clears the rest) — via the medic duty's ability channel, the
scholar's own `treatDisease`, and `treatVillager` — and RB-1 §9/§10
prove cures clearing exposure on both bodies. The pass is NOT the
only relief, and it is not the cure: passing leaves the old
bearer's dose on the old bearer. Germ-medicine stays 'no' (see
"Medicine, decided" below): the ruling names a cure, not a
medicine, and the specificity law stands. If the P1 panel shows
bearers sickening with no cure ever firing in the wild (no healer,
no healing ability), that is a flagged finding for the next
decision — it is recorded as a panel observation, not hidden.

### Amendment A1a — the cure proof, completed (what the ruling actually rests on)

The cure proof is the MEDIC (healing-ability) channel, proven at all
three cure choke points in `scripts/test-pellet-rads-20261108.js`
(63/63 green): §9 the medic duty's ability cure clears a sick
villager bearer (exposure −10, record gone); §10 the scholar's own
`treatDisease`/`cureStatus` clears the scholar (12 → 2); §14 the
scholar treating a sick villager bearer through `treatVillager`'s
cure branch clears them (37 → 27). A player with a roster medic
holding a healing ability (`field_medicine` / `triage`) or the
scholar's own healing ability CAN clear a bearer's poisoning — that
is the designed, reachable cure, and it is proven, not asserted.

The MEDICINE half is verified CLOSED, not assumed open — code-read,
not a guess. Only two medicines exist in the game (`antibiotics`,
`antiparasitic`); `medicDutyCureAttempt` Channel 2 iterates exactly
those two kinds and requires both `cureEffectFor(...) === 'cure'`
AND a class match (`bacterial` / `parasitic` / `fever`), and
`useMedicine` applies the same two gates. `radiation_sickness` is
class `'radiation'` with both germ entries `'no'` in its cure
table, so it fails both gates on both channels; §11 proves an
antibiotics dose is honestly wasted on it. There is no RadAway-style
medicine item in the game. So: a player with ONLY germ medicine
cannot clear radiation — the brief's "medic or medicine" reads, as
built, as "medic (ability)"; a medicine path would need a new
radiation medicine item, which is a content decision for Steve, not
part of this cost leg. This is recorded here so the landing judgment
is not based on an overpromise: the ruling ("there must be a cure")
is satisfied by the proven ability channel + slow decay, and the
missing medicine path is a flagged gap for Steve, not a hidden one.

## Base

- Master at rework start: `6680d7924` (pellet boost + cost, pantry
  version — landed, NOT shipped). Verified `cat
  .git/refs/heads/master` in `~/workspace/the-scattering` at rework
  start; re-verify `git rev-parse HEAD` + `git log -1` in the
  worktree before the first commit — they must AGREE, and the
  worktree base must be recorded in the first leg commit.
- Worktree: slug `build-pellet-rads`, owner `coord-pellet-rads`,
  branch `build-pellet-rads`, `~/workspace/worktrees/build-pellet-rads`.
  Registration note: the FIRST registration attempt failed — `git
  worktree add` checked out all 85,433 files then died with
  "error: unable to write file tools/mobile-sim.html / version.json"
  + "fatal: Could not reset index file to revision 'HEAD'" (an
  EPERM write-flap window, ~18:01–18:22Z); the directory was cleaned
  up by git and the register script exited. A write probe at 18:24Z
  passed and the registration was retried. Attempt 2 failed the
  same way (~18:25–18:38Z, directory cleaned up; its final echo
  itself hit EPERM writing to /tmp — the flap was still active).
  Attempt 3 failed FAST (35s, exit 120, empty log — root cause
  undetermined; the trace-less run left no evidence). Finding from
  the investigation: attempt 1 had already CREATED the branch
  `build-pellet-rads` before dying at the index reset, so attempts
  2–4 take the script's retry path (attach to the existing branch).
  Attempt 4 (`bash -x`) SUCCEEDED 18:53–19:04Z via that retry path,
  exit 0, registry entry active. Worktree HEAD verified
  `6680d7924` == main-tree master at 19:05Z, `git status` clean.
  If a future registration fails the same way, do NOT hand-roll a
  worktree — probe, retry, and report the flap; check whether the
  branch already exists (it changes the script's path).

## What stands, what changes

STANDS (untouched): the boost mechanic itself (bearer strikes at
x1.5, bonus heals as boosts), the free x1.25 floor, the Q4 surge
marking (`_spendFeastedPower('reactor')` marks `feastSurgeUsed` on
a paid boost), the pass rule (progression.js untouched), free
sustenance (the bearer never hungers), the strike-hook choke point
(game.js tbDamage hook — the single insertion point for both
bodies).

CHANGES (the cost leg only): the pantry-kcal draw per boost is
REMOVED — `pelletBurn` no longer reads `pantryKcalLive` or calls
`pantryDraw`, and `costKcalPerStrike` leaves the config. In its
place: each paid boost adds radiation exposure to the bearer.
Nothing else in the boost changes.

## Verified code map (current master 6680d7924 — re-verified at rework start)

Corrections / additions to the original prereg's map (the substrate
moved since a111b57f; all line numbers below verified by read/grep
on 6680d7924):

- Boost build (landed): `src/data/pellet-boost.json`
  `{boostMult: 1.5, costKcalPerStrike: 50, floorMult: 1.25}`.
  `feastBuff.js`: `pelletBoostCfg()` (:234, defensive read of
  `this.data.pelletBoost`); `pelletBurn(vid, opts)` (:269-300 —
  bearer check, `currentMult` guard, pantry check + whole-unit
  draw, ledger `state.pelletBoost {spent, boosts, floors,
  lastBoostDay}`, free-floor branch, heal branch); `pelletBoostedToday()`
  (:303, reads ledger `lastBoostDay` vs `scholar.day`);
  `feastedLine()` (:339-361 — the reactor status line: x1.5
  "boosted today" / x1.25 floor, "always active").
  `game.js`: tbDamage strike hook (:39050-39051, calls
  `pelletBurn` for scholar `_ps` / villager `_vs` on every
  monster/hostile strike with final > 0, takes the max, marks the
  Q4 surge when boosted); `_feastHealBonus` (:452, calls
  `pelletBurn(null, {heal: true})`).
- Villager sickness (the hook for the cost): `v.sick[vid] =
  {name, daysLeft, severity}` (light sim). `villageSicknessTick()`
  (game.js:32825) runs daily from endDay (:33573): stale records
  deleted silently; `daysLeft -= 1`; damage
  `max(1, 1 + severity*2 - (healer ? 1 : 0))` HP/day via
  `hurtVillager(vid, dmg, sickCause, null, {nonviolent: true})`;
  death cause is the disease id when the village knows it
  (`villagerDiseaseId`); recovery when `daysLeft` hits 0.
  `hurtVillager` (game.js:8176) routes through `wornDamage`,
  handles the scholar's real pool (`scholar.health`) and the
  villager pool (`v.health[vid]`, default 100), with the real
  death pipeline + godpath refusal.
  `villagerDiseaseId(rec)` (game.js:14345) maps record name to
  disease id: 'wound fever' -> 'wound_fever', 'gut rot' ->
  'gutrot', 'tick fever' -> 'disease'. The radiation record maps
  here (see design).
- Villager cure (the fast-clear hook): `medicDutyTick()` at dawn
  picks the duty holder; `medicDutyCureAttempt(holder, patient)`
  (game.js:33136-33180) tries Channel 1 (a healing ability via
  `cureEffectFor(did, ab)` + the cure table) then Channel 2
  (proper medicine from the Haven stash pharmacy, class-matched);
  a cure deletes `v.sick[pid]`. `villagerCareTick` tends
  (daysLeft -= 1). `treatVillager` (game.js:14354, scholar-only
  via UI) cures via the same cure table + diagnosis gate.
- Scholar sickness (the scholar-bearer hook): the full status
  engine. `sickDiseases()` (game.js:13756) reads engine entries
  (`seList('scholar')` filtered by `seIsDisease`).
  `seIsDisease(id)` (statusEffects.js:562) admits a def iff
  `pool === 'mundane'` AND it has a `symptomLabel` — a new
  mundane def is admitted with NO engine change.
  `contractDisease(effectId)` (game.js:13766) contracts mundane
  diseases via `applyStatus('scholar', ...)`. `tickStatuses`
  (statusEffects.js:319) ticks per dayPart (called from
  advancePart, game.js:28673): damage `def.tick.hp x stacks`,
  halved if eased, through `wornDamage` into `scholar.health`;
  `dayPartsLeft` counts down; `severe` entries may override
  `tickHp` (not used here — see design). `cureStatus(target,
  effectId, source)` (statusEffects.js:462) removes the entry,
  drops the mirror, says the cure text, fires telemetry; alien
  pool refused. `cureEffectFor(effectId, treatment)`
  (statusEffects.js:694) is a plain cure-table lookup.
  Scholar self-cure: `treatDisease(abilityId)` (game.js:14008)
  cures/eases via the table + diagnosis gate; `useMedicine(kind)`
  (game.js:14068) cures/eases only when the medicine class
  matches (`def.class === cls || def.class === 'fever'`).
- Disease data shape (`src/data/statusEffects.json`): each disease
  carries `pool`, `class` (bacterial/parasitic/viral/fever/prion),
  `scope: ['scholar']`, `cure: {herbal_remedy, field_medicine,
  triage, antibiotics, antiparasitic, folk, needsDiagnosis}`,
  `tick: {hp, per: 'dayPart'}`, `duration: {dayParts}`,
  `symptoms` / `symptomLabel`, `diagnosedDesc`, `vectors`,
  `debuff`. Diseases never announce their names — symptom-only
  until diagnosed (disease rework 2026-10-09).
- **No "radiation" string exists anywhere in `src/` or
  `src/data/`** (grep, rework start) — the condition is entirely
  new. The existing sickness + cure systems CAN carry it (see
  design) — no parallel system is built.

## Design (pinned — Muse calls, Steve can overrule)

- **Exposure lives on the person.** `state.pelletRads = { [key]:
  {exposure, lastBoostDay} }`, key `'p'` for the scholar or a
  villager id. Created lazily on the bearer's first paid boost.
  The pass does not transfer it: a fresh bearer has no entry, so
  exposure 0 — passing the pellet does not pass the poisoning.
  State is saved wholesale, so exposure survives save/load like
  `state.pelletBoost` / `state.pelletPass`.
- **Accumulation.** Every PAID boost adds `radsPerBoost` exposure
  to the boosting bearer (scholar or villager). The free floor
  adds nothing — it is not a spent boost (ledger counts floors
  separately, as today). The boost keeps working at ANY exposure:
  no cutoff, no weakening — the power never cuts off.
- **Numbers (data, `pellet-boost.json` — starting values, tunable
  ONLY by a further prereg amendment if the panel shows them
  off, never silently):** `radsPerBoost: 2`, `radsSickAt: 10`,
  `radsDecayPerDay: 1`, `radsCureDrop: 10`. Rationale: 5 boosted
  strikes cross the sickness threshold — a light fight stays
  clean, a heavy fight day sickens. One cure clears a full
  threshold; a quiet 10 days clears a threshold dose.
- **Sickness tiers (villager side, via `v.sick` severity):**
  exposure 10–19 -> severity 1 (3 HP/day, 2 with a healer in
  camp); 20–39 -> severity 2 (5 HP/day); 40+ -> severity 3
  (7 HP/day). The existing tick supplies the damage, the healer
  discount, the death pipeline, and the recovery.
- **Daily tick.** NEW `pelletRadiationTick()`, called from endDay
  immediately after `villageSicknessTick()` (game.js:33573):
  for each person in `state.pelletRads` who is living (roster or
  scholar): if they did NOT boost today (`lastBoostDay < today`),
  exposure decays by `radsDecayPerDay` (floor 0); if exposure >=
  `radsSickAt`, ensure the sickness record exists with the tier
  severity — villager: `v.sick[vid] = {name: 'radiation
  sickness', daysLeft: 4, severity: tier}` (create if absent,
  update severity if present; do NOT refresh `daysLeft` — tending,
  curing, and expiry work naturally, and the tick re-creates the
  record the next day while the bearer is still hot); scholar:
  `contractDisease('radiation_sickness')` if no such status entry
  is active (the engine's 8-dayPart duration expires it; the tick
  re-contracts while hot). If exposure < threshold, leave any
  existing record alone — it expires on its own as the dose
  clears. Onset says ONE line per bearer per episode, throttled
  by a `lastRadSayDay` on the rads entry (no re-contraction spam).
- **The scholar's disease def (NEW `src/data/statusEffects.json`
  entry `radiation_sickness`):** `pool: 'mundane'`,
  `class: 'radiation'` (a new class — no germ-medicine matches
  it), `scope: ['scholar']`, `tick: {hp: 2, per: 'dayPart'}`
  (8 HP/day while sick — wound-fever scale), `duration:
  {dayParts: 8}`, `cure: {herbal_remedy: 'ease',
  field_medicine: 'cure', triage: 'cure', antibiotics: 'no',
  antiparasitic: 'no', folk: 'slow', needsDiagnosis: false}`,
  `debuff: {energyMult: 0.85}` (the bearer tires faster),
  symptoms `['Nauseous', 'Weak', 'Hair falling']`,
  `symptomLabel: 'Nauseous'`, `vectors: "The reactor's invisible
  fire."`, `diagnosedDesc` naming radiation poisoning and the
  cure direction (skilled hands clear it; no pill touches it —
  it isn't a germ). `needsDiagnosis: false`: radiation sickness
  is visibly tied to the pellet — no diagnosis gate on the cure.
  Scholar tick is FLAT (2/dayPart) — tier scaling lives on the
  villager side (severity) and, for the scholar, in how long the
  sickness recurs while hot. No `severe` override, no engine
  change.
- **Villager cure-table hook.** `villagerDiseaseId` gains
  `'radiation sickness': 'radiation_sickness'`, so the medic duty
  and `treatVillager` read the same cure table — and the death
  cause names `radiation_sickness` when the village knows it
  (free, via the existing honesty path). `sickSymptom` gains a
  radiation branch ('nauseous and weak, hair coming away').
- **A cure clears exposure faster.** NEW helper
  `pelletRadiationCured(key)`: drops that person's exposure by
  `radsCureDrop` (floor 0). Called from the three cure choke
  points, and ONLY there: `cureStatus` in statusEffects.js when
  the cured id is `radiation_sickness` (scholar engine cures —
  `treatDisease` + `useMedicine` both funnel through it);
  `medicDutyCureAttempt`'s `cureIt` when the disease id is
  `radiation_sickness` (villager ability cure); `treatVillager`'s
  cure branch when the disease id is `radiation_sickness`
  (scholar treating a villager). Eases do NOT drop exposure —
  only a real cure does.
- **Medicine, decided (not silent).** Germ-medicine does NOT clear
  radiation: `antibiotics` / `antiparasitic` read `'no'` in the
  table, and `useMedicine`'s class match fails for class
  `'radiation'` — the dose is honestly wasted with the existing
  "wrong medicine" line. This follows the game's specificity law
  (no pill touches a virus; no pill touches radiation either) and
  Steve's "medicine / a cure" is carried by the cure channels
  that exist: healing-ability cures (medic duty Channel 1, the
  scholar's own `treatDisease`, `treatVillager`) clear exposure
  faster; slow decay clears the rest. There is no RadAway-style
  medicine item in the game; adding one is a separate content
  decision for Steve, not part of this cost leg.
- **Max health, decided (not silent).** The brief allows "max
  health AND/OR periodic sickness damage". This rework builds the
  DAMAGE half only, through the existing sickness engine.
  Max-health degradation is NOT built: villagers have no max-HP
  field (health is a 0–100 pool), so it would be a new system, and
  the task forbids silently building a parallel one. The sickness
  damage is the cost the player feels.
- **The floor, preserved.** `pelletBurn` keeps its paid-vs-floor
  structure, but the pantry gate is deleted — and the pantry gate
  was the floor's ONLY trigger, so the structure must change or
  the floor dies: with no pantry check the paid branch can never
  fail and the floor branch is unreachable. The fix: the
  `currentMult` early return becomes the floor return. When a
  bigger mult already applies (`boostMult <= currentMult`), the
  reactor does not pay for a boost it cannot deliver — it returns
  the free floor instead (ledger `floors += 1`, no rads, return
  `floorMult`; the hook takes the max, so the strike keeps the
  bigger mult). The floor is the reactor's standing hum: always
  on, free, returned whenever the boost doesn't apply. The paid
  boost fires whenever it would raise the strike. Proof: with an
  overcharge active (currentMult 1.5), a bearer strike lands at
  the overcharge mult, the ledger counts a floor, and no rads are
  added. CONSEQUENCE, recorded not hidden: in the wild the boost
  now applies on every bearer strike (no pantry gate), so the floor
  branch fires only when a bigger mult already applies — the
  floor's old wild trigger (short pantry) is gone with the pantry
  gate. The floor survives as the guaranteed minimum the status
  line promises and the guard-case return, not as a frequent strike
  path. If Steve wants the floor to fire more often in the wild
  (e.g. a free boost allowance per day), that is a separate design
  call — not smuggled into this cost leg.
- **Ledger.** `state.pelletBoost` renames `spent` (kcal, dead)
  to `rads` (total exposure added across all bearers):
  `{rads, boosts, floors, lastBoostDay}`. Proof identity: `rads
  == boosts x radsPerBoost` exactly. The rename is safe: the
  pantry build never shipped, so no live save carries a ledger;
  proof tests read the new field. Defensive reads (`(L.rads ||
  0)`) tolerate a stale `spent`-era ledger.
- **Voicing (plain, honest; [needs-eyes] on the landing).**
  Boost line names rads, not kcal: "REACTOR — the pellet burns
  hot: this strike hits ×1.5. (Radiation +2.)" Heal-boost line
  the same shape. Onset line (once per episode): the bearer's
  sickness is named in symptoms, the power named as still there.
  `feastedLine()` gains the exposure word for the bearer when hot
  (warm / hot / burning by tier) — the status row is where the
  player watches the dose climb. No new UI surfaces.
- **Where the code lives.** `feastBuff.js`: `pelletBurn` cost leg
  (pantry out, rads in), `pelletRadiationTick()`,
  `pelletRadiationCured(key)`, `pelletBoostCfg()` gains the rads
  keys, `feastedLine()` exposure word, onset throttling.
  `game.js`: endDay calls the tick after `villageSicknessTick`;
  `villagerDiseaseId` map + `sickSymptom` branch;
  `medicDutyCureAttempt` cureIt + `treatVillager` cure branch
  call the cured hook. `statusEffects.js`: `cureStatus` calls the
  cured hook for `radiation_sickness`. `src/data/pellet-boost.json`:
  rads keys + `_doc` (costKcalPerStrike removed).
  `src/data/statusEffects.json`: the `radiation_sickness` def.
  Ontology header of feastBuff.js updated (provides); offline
  assets regenerated.
- **NOT touched:** progression.js (pass untouched), table.js,
  ladder.js, app.js, overtime.js, standing.js, abilityActions.js,
  foodPower.js, engine/calories.js, mirror-cap / alien files,
  loop arms, journey rotation files, loop locks. No new status
  engine, no new medicine item, no max-HP system.

## Proof plan (prereg-bound, before any build — P1–P5 radiation version)

Rig: as the original prereg — the reactor is rare alien loot, so
bearer panels RIG the reactor onto the scholar at day 1 (grant
`fusion_reactor` + `scholar.fusionReactor = {installed:true,
online:true}` + `state.fusionReactorHolder = {who:'player', vid,
day:1}`), same rig for before and after. Before/after comparisons
run the same rig on the pre-rework root (the landed pantry build,
6680d7924) and the branch.

- P1 — boosts fire, rads track: rigged-bearer panel, 8 seeds
  (standard screening set 7,42,99,1234,555,777,2026,31337),
  capable, 150d, env standard (below). Bar: the bearer spends ≥1
  paid boost on ≥4/8 seeds; on EVERY seed, `ledger.rads ==
  boosts x radsPerBoost` exactly; the pantry is UNTOUCHED by the
  boost (pantry delta attributable to boosts == 0 — no pantry
  draw, no free power); per-person exposure delta matches that
  bearer's own boost count (passing does not transfer exposure).
- P2 — cost binds: (a) rigged heavy-use unit: force N paid boosts
  on a bearer (N chosen so exposure crosses `radsSickAt`), assert
  the sickness record/status entry appears with the tier severity
  and damage moves (villager HP falls over the episode / scholar
  HP falls per dayPart tick), AND a boosted strike at exposure ≥
  40 still returns ×1.5 (power never cuts off). (b) Rigged
  light-use unit: a bearer with few boosts stays below
  `radsSickAt` with no sickness record. (c) Panel: the P1 panel
  MUST contain at least one heavy-use bearer-day (≥5 paid boosts
  in a day) and light-use bearer-days; on heavy-use days the
  bearer shows exposure ≥ threshold and a sickness record, on
  light-use days they show neither. If the panel contains NO
  heavy-use day, that is a finding, not a pass — the cost never
  binds in the wild at these numbers, and the numbers need a
  further amendment (NO-GO on tuning). (d) Cure observation
  (recorded, not a bar — Amendment A1): on the P1 panel, for every
  bearer who sickens, record whether a cure cleared their exposure
  in the wild (duty ability cure, treatDisease, treatVillager) or
  whether only decay / the pass relieved them. If no cure ever
  fires in the wild, flag it as a finding for the next decision.
- P3 — Q4: rigged unit + live seed. Unit: a paid boost marks
  `feastSurgeUsed` + `feastSurgeBy` ('p' for the scholar,
  'v:<id>' for a villager bearer); the free floor alone does NOT
  mark; the reactor path leaves `feastSurge` arming alone. Live:
  on the P1 panel, `feastSurgeUsed` marks on ≥1 seed via a paid
  reactor boost (By recorded). Unchanged from the original
  prereg — the Q4 fix rides untouched.
- P4 — pass untouched: the pass is behavior-identical. Extract
  the pass firing days from the landed pantry build's panel
  evidence and assert the branch's panel fires the pass on the
  SAME seeds/days. Bar: exact equality on pass days. (If the
  baseline is not extractable, fall back to "pass fires ≥1 time
  on the 99767 shape where the trigger holds" and say so in the
  run note — no silent fallback.)
- P5 — no regression: balanced panel before/after (standard
  neutral shape: seed 7 × 4 policies × 150d) + deaths/day
  comparison. Bar: deaths/day must not drop >~15% (difficulty
  law: survivor strength, never fewer deaths; a fix dropping the
  death rate that far is probably just a buff). Wins / national
  moving beyond noise is investigated, not auto-passed. NOTE:
  bearer deaths FROM radiation sickness are expected when the
  cost binds — the bar is on pooled deaths/day, not on zero
  radiation deaths.

## Bars (metric binding — MEASUREMENT.md §14: a miss is NO-GO, never re-scored)

- RB-1-unit: every `scripts/test-pellet-rads-*.js` proof passes
  (rigged states): paid boost adds exactly `radsPerBoost` exposure
  to the boosting bearer and only that bearer; ledger `rads ==
  boosts x radsPerBoost`; pantry untouched by boosts; floor ×1.25
  free adds no exposure; non-bearer party strikes get nothing;
  boost line names the rads cost; heavy-use rig sickens at the
  threshold tier with damage moving; light-use rig stays clean;
  boost at exposure ≥ 40 still returns ×1.5; a cure drops
  exposure by `radsCureDrop`; decay drops exposure by
  `radsDecayPerDay` on a non-boost day and not on a boost day;
  the pass does not transfer exposure (new bearer starts at 0).
- RB-2-panel (P1): rigged-bearer panel bar as above (≥1 boost on
  ≥4/8 seeds; ledger exact on every seed; pantry untouched;
  per-bearer exposure matches per-bearer boosts).
- RB-3-costbinds (P2): heavy-use days sicken, light-use days
  don't, on the P1 panel (conditional bar as written; no
  heavy-use day in the panel = NO-GO on tuning, numbers amended).
- RB-4-q4-live (P3): `feastSurgeUsed` marks on ≥1 P1-panel seed
  via a paid reactor boost.
- RB-5-pass (P4): pass days equal to the landed-build baseline.
- RB-6-noregress (P5): deaths/day drop ≤15% on the balanced
  panel; no unexplained win/national movement.
- RB-7-proof: neutral proof refreshed in its own commit;
  `check.js --quick` green except pre-existing + phone-frame
  (known owed). The change alters what the game reads
  (feastBuff.js, game.js, statusEffects.js, pellet-boost.json,
  statusEffects.json), so the refresh is required.
- RB-8-wired: `node scripts/check-wired.js` on feastBuff.js,
  game.js, and statusEffects.js shows nothing unwired.
  `node scripts/validate-ontology.js` passes (feastBuff.js
  provides updated); offline assets regenerated
  (`node scripts/build-offline-assets.js`).
- RB-9-scope: `git show --stat` for every leg commit touches no
  `src/js` file outside feastBuff.js, game.js, and statusEffects.js,
  no `src/data` file outside pellet-boost.json and
  statusEffects.json, and no progression.js / table.js / ladder.js /
  app.js / overtime.js / abilityActions.js / foodPower.js /
  engine/calories.js. Proof tests live in `scripts/` as usual
  (new `scripts/test-pellet-rads-*.js` + updates to the existing
  `scripts/test-pellet-boost-*.js` ledger assertions).
- SUPERSEDED (do not re-judge): PB-1-unit's pantry assertions
  (ledger `spent == boosts x 50`, pantry lighter by 50/boost),
  PB-2-panel's pantry accounting, PB-3-starved (the pantry-starved
  rig is meaningless now — the pantry is not the limiter; replaced
  by P2's light/heavy rigs). PB-4/PB-5/PB-6/PB-7/PB-8/PB-9 stand
  as RB-4..RB-9 above (P4's baseline is now the LANDED pantry
  build's panel, not the pre-boost baseline).

## Env

- Unit proofs: none (shared harness, fixed seeds, rigged states).
- Panels (P1/P2/P4/P5): the standard competent-panel env:
  `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
  STRANDNARR=1`.
- No fresh seed band needed: unit proofs use rigged states;
  panels use the standard screening set + the 99767 shape +
  the existing neutral-panel seeds. No freshness check owed.
