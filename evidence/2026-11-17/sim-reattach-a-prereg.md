# sim-reattach-a — PREREG (binding)

Run: fleshout-20261117T060712Z (Loop A), axis scale-onramp, arm
sim-reattach-a — BUILD: re-attach on higher wave — a rumor-born
plan that already holds an attached target re-attaches to a
HIGHER-wave beast when a fresh tale of one is told while the plan
is still unlaunched. Follow-up to sim-rumortarget-a (PILOT NO-GO
3/8 vs bar 4, `evidence/2026-11-17/sim-rumortarget-a.md`).
Claims tracker finding #2466 (attach-once locks plans in wave-3).
Branch `sim-reattach-a` (worktree
`~/workspace/worktrees/sim-reattach-a`). Base: worktree HEAD
`9f7d0522e` (verified at arm start, clean tree). Binding prereg:
THIS file — frozen before any judged sim. The lever +
instrument are built AFTER this commit; no judged numbers exist
yet.

## The question, in plain words

A villager hears a tale at the fire, forms a plan to hunt the
beast in it, and the plan takes the first fresh beast it hears
about — usually a wave-3 beast, because wave-4 tales are told
late (days 55–118) while plans attach early (days 32–90). The
attach-once rule then locks the plan to the wave-3 beast, and
the later wave-4 tale goes unheard by that plan. Rumortarget-a
proved the mechanism works (21 attaches, 156 targeted launches)
and the timing fails (3/8 vs bar 4). This arm adds the one rule
the rumortarget evidence names: when a HIGHER-wave fresh beast
tale is told while the plan is still unlaunched, the plan
re-attaches to the bigger prey. A villager changing their mind
toward bigger prey, for a stated reason, is the sense test — not
just a count.

## Prior art (read first)

- `evidence/2026-11-17/sim-rumortarget-a.md` + prereg — the
  lifecycle this arm changes: 3/8 primary, §Why the primary
  missed (103102 teller died, 103104 tale after last call,
  103105 all tales too late, 103107 tale stale by 2 days),
  the attach-rule description, the 30-day window, the
  attach-once rule. The re-attach design answers exactly
  those four nearest misses.
- `evidence/2026-11-16/sim-rumorplan-a.md` + prereg — the
  plan lifecycle, origin buckets, launch definition.
- `evidence/2026-11-16/sim-vetreengage-a.md` — the env-gate
  precedent (`VETREENGAGE=1`, default OFF) this arm mirrors
  for its own gate.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  (wave 4 "The Mirror Draft", wave 5 "The Producers"),
  `docs/VILLAGER-BRAIN.md` §2 (heard sightings: "a rumor
  recorded with its teller named, its age, and its distance,
  never merged into fight memory") and §7 phase 1 (the seek /
  scout half is scored "trust-in-teller × staleness ×
  distance — over heard sightings in the belief state").

## Code facts the lever is built on (read from src, frozen)

Verified on this tree before this prereg (`src/js/win-plan.js`,
`src/js/game.js`):

1. The rumortarget lever was REVERTED on this branch
   (commit `28930ed75`, PILOT NO-GO revert, verified src/
   diff vs base 0). Current `src/js/win-plan.js` has NO
   `winPlanRumorAttach`, NO origin stamp, NO attach call
   sites. This arm RE-APPLIES the attach rule verbatim from
   commit `97dfc7307` (the lever commit: method +
   HavenTick wiring + origin stamp + ontology header line)
   and THEN adds the re-attach rule inside the same method.
   The re-attach rule is meaningless without the attach
   rule beneath it, so the armed leg runs BOTH env gates
   (`RUMORTARGET=1` + `REATTACH=1`); the control leg runs
   neither. The delta vs rumortarget-a's 3/8 is read from
   the re-attach rows (see Secondary), not assumed.
2. `plan.target` is written in EXACTLY TWO places on this
   tree: `winPlanSeedFromFight` (`win-plan.js:283-312`,
   `plan.target = mdef.id`, ONLY when stage is `gear` or
   `party`, wave-gated ≥ 3) and `winPlanDepart.launchParty`
   (`win-plan.js:439` — companion copy, null copies as
   null). NOTHING ever writes `target` back to null. The
   re-applied attach adds the THIRD write site; the
   re-attach adds the FOURTH (same method, new branch).
3. "Still unlaunched" is readable from stage alone, with
   NO new state: `launchParty` sets `plan.stage = 'hunt'`
   on every successful departure (`win-plan.js`, in
   `winPlanDepart`), and the companion copy sets the
   companion's plan to `hunt` too. A plan reaches `hunt`
   ONLY by launching or by being a companion on a launch.
   The ONLY hunt→party transition in the code is the
   VETREENGAGE dissolution (`win-plan.js`, dead recorded
   party member), and `VETREENGAGE` is OFF on both legs
   of this arm. So on these legs, stage `gear`/`party`
   ⟺ never launched; stage `hunt`/`standing`/`table` ⟹
   launched (or companion-launched). The re-attach gate
   is therefore stage gear/party ONLY — a plan that
   attached (or advanced) to hunt is frozen on its
   target. This is the conservative reading of the
   coordinator's "still unlaunched": it under-counts
   eligible re-attaches (a hunt-stage plan that has not
   yet departed cannot re-attach either) but it can
   never re-attach a launched plan.
4. Launches depart from `party`/`hunt`/`standing`/`table`
   (`winPlanDepart`), so a party-stage plan CAN be on the
   verge of launching — but it has not launched yet, and
   the moment it does its stage becomes `hunt` and the
   re-attach window closes on the next Haven tick.
5. Rumor-born plans are created in `winPlanHavenTick`
   (`win-plan.js:340-376`): a ranger (`wanderer`/`explorer`)
   at Haven with no plan, engaged either by personally
   fought species (`know.fought`) or by the village's
   slain count (`state.villageSlain`, the fire-talk
   channel). The re-applied attach stamps `plan.origin`
   (`'heard'` | `'fought'`) at creation so the attach and
   re-attach rules can tell them apart.
6. The rumor itself lives in `state.killerTales` /
   `state.vetKillerTales` (`game.js:23352-23390`,
   `queueKillerTale` / `queueVetKillerTale`): one entry per
   (type[, killer]) — `{mid, killer, day, told}` — queued
   when a VILLAGER kills a type (scholar kills never
   queue). The night fireside beat (`killerTaleBeat`,
   `game.js:23400`, dayPart 3) tells each untold tale and
   stamps `played = true` on tales actually told.
7. `monsterDisplayName(mid)` (`game.js`) is the
   knowledge-gated beast name — voice lines use it, never
   `mdef.name`.
8. The fight gate already withholds SEEK for a trick-less
   wave-4 beast and demotes OUTMATCHED parties
   (`winPlanFightGate`): re-attaching a wave-4/5 target
   does NOT force a suicide fight — the safety nets stay
   the judge of any single encounter. The lever changes
   what the plan NAMES, not what the gate ALLOWS.

## The lever (frozen design)

### Part 1 — re-apply the attach rule (verbatim from 97dfc7307)

New Game method `winPlanRumorAttach(vid, atCreation)` in
`src/js/win-plan.js` (env-gated by `RUMORTARGET=1`, default
OFF), called from `winPlanHavenTick` in exactly two places:
(a) AT CREATION, right after the plan is born (stage `gear`,
target null); (b) AS A REFRESH, on every later Haven tick,
while the plan is target-null, origin `'heard'`, and stage
`gear` / `party` / `hunt`. A tale is ELIGIBLE iff ALL hold:
actually told at the fire (`played === true`) by a teller
ALIVE on the roster now; tale day within 30 days
(`RUMOR_TALE_FRESH_DAYS = 30`, a prereg choice, not canon);
beast wave ≥ 3. Pick the HIGHEST wave among eligible tales;
tie-break by FRESHEST tale day; then by queue order
(deterministic). On attach: `plan.target = mid`,
`plan.needWave = wave`, provenance stamps
`targetSource='tale'`, `targetTeller`, `targetTaleDay`,
plus ONE `Game.say` voice line naming the beast via
`monsterDisplayName` and the teller via `firstRef`. The
kill's LOCATION is not in state — the plan gets a target
SPECIES, never a node (`plan.node` stays null) — recorded
as a blank, not invented. See the rumortarget prereg for
the full frozen design; nothing in part 1 changes.

### Part 2 — the re-attach rule (this arm's design call)

Inside the SAME method, a SECOND branch, gated by its own
env flag `REATTACH=1` (default OFF — mirrors the
`VETREENGAGE` precedent; node sims only, OFF in the
browser where `process` is undefined):

- Fires ONLY when the plan already holds a target
  (`plan.target` non-null), origin `'heard'`, and stage
  `gear` or `party` (pre-hunt = still unlaunched, fact 3
  above). Hunt/standing/table stages NEVER re-attach.
- Builds the SAME eligible-tale list as part 1 (same
  gates: played, wave ≥ 3, fresh ≤ 30d, teller alive;
  same pick: highest wave, freshest, queue order).
- Re-attaches ONLY UPWARD: the best eligible tale's wave
  must be STRICTLY greater than the current target's wave
  (`rumorWaveOf(plan.target)`). Same-wave or downward
  tales never re-attach — the plan keeps its beast.
- On re-attach: `plan.target = best.mid`,
  `plan.needWave = best.wave`, provenance stamps
  refreshed (`targetSource='tale'`, `targetTeller`,
  `targetTaleDay`), plus ONE `Game.say` voice line
  DISTINCT from the attach line, naming the NEW beast
  and the teller AND the old beast — the villager says
  they are changing the hunt toward bigger prey:
  "`<holder>` heard `<teller>`'s tale of `<new beast>` —
  bigger prey than `<old beast>` — and changes the hunt."
  (exact wording frozen in the proof test; the line must
  name the new beast via `monsterDisplayName` and the
  teller via `firstRef`, as the attach line does).
- Result shape extended (the recorder reads it; the game
  caller ignores it): `{mid, wave, teller, taleDay,
  taleAge, atCreation, considered, reattached, oldTarget,
  oldWave, reattachBlocked}` — `reattached` true only on
  a re-attach; `oldTarget`/`oldWave` the replaced beast;
  `reattachBlocked` names the reason when a targeted plan
  is offered a tale but keeps its beast (`'wave-not-higher'`,
  `'stage-launched'`, `'reattach-off'`).
- NO other call sites, NO window changes, NO new state:
  the refresh call in `winPlanHavenTick` gains a sibling
  branch — when the plan HAS a target, origin `'heard'`,
  stage gear/party, call `winPlanRumorAttach(vid, false)`
  (the method itself enforces every gate; the call-site
  stage check mirrors the existing attach-call pattern).
  The 30-day window, the tale gates, and the pick order
  are shared verbatim between the two branches — one
  eligible-list builder, two decision branches.

### Scope discipline

- Do NOT touch the plan-store catch-22 fix, the vetparty
  seed call, or any world-tick seed call. Live-master
  sites only (`winPlanHavenTick` + the helper in
  `win-plan.js`).
- The armed leg runs `RUMORTARGET=1` AND `REATTACH=1`;
  the control leg runs NEITHER. A `REATTACH=1`-only leg
  is not run: without the attach rule beneath it the
  re-attach branch can never fire (no plan ever holds a
  tale target), so it would test nothing.
- No instrument seed call is needed: the attach /
  re-attach IS the lever; the recorder wraps
  `winPlanRumorAttach` directly.

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`,
  wave 4; 10, re-read live by the driver):
  `algorithm`, `audit`, `congregation`, `eater`, `eulogy`,
  `herald`, `influencer`, `reunion`, `strike`, `suburb`.
- **Wave-5 monster ids** (from `src/data/monsters.json`,
  wave 5; 10, re-read live by the driver): `cancellation`,
  `editor`, `finale`, `finale_crew`, `finale_opening`,
  `network_note`, `nielsen`, `rerun`, `spoiler`, `timeslot`.
- **Rumor-born** = a plan whose HavenTick creation had
  `know.fought` EMPTY and `villageSlainTotal > 0` at
  creation (the rumorplan-a `heard-at-fire` rule), recorded
  in this arm as `plan.origin === 'heard'`. The recorder
  captures the same creation reads independently, so
  origin is classified from the corpus too — the two must
  agree (analyzer cross-check, inherited from rumortarget).
- **A tale-attach** = one `rumortargetAttaches` row with
  `result` non-null and `reattached` false: `{day, vid,
  mid, wave, teller, taleDay, taleAge, atCreation, stage,
  origin}` plus the `considered` list.
- **A re-attach** = one `rumortargetAttaches` row with
  `result` non-null and `reattached` true: the same fields
  PLUS `oldTarget` / `oldWave` (the replaced beast) and
  `stageBefore` in gear/party. A row with `result` null is
  a failed attempt — counted as an opportunity (attach) or
  a blocked re-attach (when `targetBefore` non-null), not
  a re-attach.
- **A launched rumor-born plan carrying a target** = a
  `rumorplanLaunches` row (rumorplan-a definition: one per
  participant per real expedition start, any commit) whose
  vid's plan origin is `heard-at-fire` and whose
  `targetAfter` is non-null. Hunt-stage launches are
  reported separately from all-stage launches.
- **Cost bars** (binding, from the task): deaths/run within
  +2 of control, median survival ratio ≥ 0.9, starvation
  deaths within +2 of control. Starvation = deaths with
  kind/cause naming starvation/hunger in the per-seed
  `deaths` rows (same reading as the rumorplan-a corpus).

## Primary metric + GO bar (frozen)

PILOT GO iff ALL hold:

1. **Primary — rumor-born plans acquire a named wave-4/5
   target on ≥4 of 8 seeds (armed leg).** Counted per seed:
   ≥1 tale-attach row (first-attach OR re-attach) with
   `wave` 4 or 5 on a rumor-born (`heard-at-fire`) plan.
   The bar is the task's: 4/8 seeds — the bar rumortarget
   missed at 3/8.
2. **Secondary launch bar — launched rumor-born plans
   carrying a target ≥1** (any wave, any stage; hunt-stage
   launches counted separately). A named target that never
   launches is a half-answer.
3. **Cost bars hold** (above): deaths/run ≤ control + 2,
   median survival ratio ≥ 0.9, starvation ≤ control + 2.
4. **Proof test `scripts/test-reattach-a.js` green**
   (including the old-code-fails control: the same probe
   shows 0 rumor-born targets with both env flags OFF,
   and shows an attach but NO re-attach with
   `RUMORTARGET=1` + `REATTACH` unset).
5. **Instrument clean:** 8/8 control + 8/8 armed files
   parse, `instrumentErrors` empty on both legs,
   determinism legs D1 + D2 green, §15 panel compare
   attached to the evidence file.
6. **Re-attach integrity (instrument check, not a bar):**
   ZERO re-attach rows with `wave ≤ oldWave`
   (downward/same-wave) and ZERO re-attach rows with
   `stageBefore` in hunt/standing/table (post-launch).
   Any such row is a lever defect and fails the run
   outright — the analyzer exits non-zero.

A miss on (1) is PILOT NO-GO — never re-scored against a
friendlier metric mid-run (§14). The lever is reverted on
the branch (verify `src/` diff vs master is 0 lines) and
the run lands evidence-only. (Note the rumortarget-a
precedent: `safe-commit.sh`'s delete guard blocks a
revert commit without coordinator approval — if this arm
goes NO-GO, the revert is performed and verified in the
worktree and the commit is left for the coordinator to
approve, exactly as rumortarget-a reported it.)

### Feasibility note (pre-registered interpretation, not a re-score)

The primary can only fire on a seed where a wave-4/5 beast
is killed AND its tale is told AND the teller is alive AND
a heard plan stands at Haven within 30 days (attach), OR
where a heard plan already holds a wave-3 target in
gear/party stage when a higher-wave tale arrives fresh
(re-attach). The control leg measures that supply (told
wave-4/5 tales per seed). If the control shows <4 seeds
with ANY told wave-4/5 tale, the primary is unachievable
by construction on this band and the pilot reads NO-GO
with tale supply as the named cause — the binding
constraint is upstream (no wave-4/5 kills to hear about),
not the attachment rule. The mechanism secondary
(wave-3+ attaches + re-attaches: count + seeds) is the
judge of whether the RULE works in that case. This
paragraph fixes the interpretation BEFORE any judged sim;
it changes no bar.

## Secondary (reported, not judged)

- **Re-attach isolation (the marginal-contribution read):**
  per seed, w4/5 first-attaches vs w4/5 re-attaches; the
  "reattach-only primary seeds" — seeds where the primary
  is met ONLY via a re-attach (≥1 w4/5 re-attach, 0 w4/5
  first-attach). If the primary passes at 4/8 but zero
  seeds are reattach-only, the re-attach rule contributed
  nothing and the pass belongs to the re-applied attach
  rule on a fresh band — the evidence must say so plainly.
  Also: re-attaches by wave (3→4, 3→5, 4→5), tale-age
  distribution at re-attach, `reattachBlocked` reason
  counts (wave-not-higher / stage-launched / reattach-off
  on the control leg).
- Tale supply (control leg): told wave-4/5 tales per seed
  (played, teller alive at telling), told wave-3 tales,
  rumor-born plans formed, attach opportunities (heard
  plan target-null at Haven while ≥1 eligible tale fresh),
  re-attach opportunities (heard plan targeted, gear/party,
  while ≥1 eligible HIGHER-wave tale fresh).
- Attach split: creation-time vs refresh attaches; by wave
  (3 / 4 / 5); tale-age distribution at attach; teller-alive
  rejections and stale rejections (from `considered`).
- Wave-3+ attach rate: seeds with ≥1 tale-attach of any
  wave ≥ 3 (the mechanism secondary above).
- Launch table: rumor-born launches by (target null /
  wave-3 / wave-4/5), hunt-stage vs all-stage; launches
  carrying a RE-ATTACHED target counted separately.
- Voice sample: quote re-attach lines (≥3, with seed/day/
  villager/old beast/new beast/teller) and judge honesty
  against the tale they cite (SENSE-TESTING LAW). A
  re-attach line that names a beast the holder never
  heard about, or an old beast the plan never held, fails
  the sense test.
- Wall numbers (BOTH legs): national / table / wins,
  wave-4/5 unlocks, median survival.
- Per-seed table: rumor-born plans, attaches (by wave),
  re-attaches (by wave step), launches with target, tale
  supply.

## Seed band (verified fresh per the seed-band-freshness skill)

- **103201–103208** (8 seeds), 150d death-aware. Sibling
  arm sim-nightcarry-resume uses 103101–103108 — not
  touched, no overlap.
- Freshness check (this arm, before this commit): zero
  word-boundary hits for `103201`–`103208` in (a) ALL
  `*.md` under `evidence/` (including every dated prereg
  `evidence/*/sim-*-prereg.md` and today's
  `evidence/2026-11-17/*.md`), (b) `scripts/*.js` driver
  band literals, (c) per-seed filenames under `evidence/`
  (none match `*10320[1-8]*`), (d) the goal
  `hidden_files/` tracker, lever-claims, and findings
  `.md`, (e) ALL of `hidden_files/` (word-boundary `rg -w`,
  files listed below). The ONLY hits anywhere are corpus
  VALUES, not seed usage — resolved as false positives:
  the single value `103205` (a `pantryKcal` reading,
  103,205 kcal, day-76 row) in six files, all copies of
  the same spiralgate/belongcost corpora whose seeds are
  s7735 / s94102, e.g.
  `evidence/2026-10-17/perseed-spiralgate/armed-leadfeast-s7735.json`
  (`"117:117|90|2400|8|103205|0|470"` — a pipe-delimited
  telemetry field carrying the same pantryKcal value) and
  `evidence/2026-10-24/belongcost-b-corpus/belongcost-b-pd1-dg1-leadfeast-s94102.json`
  (`"pantryKcal":103205`). The coordinator's raw grep
  flag on these files is answered: substring false
  positives, one value, no band reservation. No
  forbidden-band list file exists. Neighbouring used
  bands: 102011–102018 (rumorplan-a), 103101–103108
  (rumortarget-a / nightcarry-a), 103001–103008
  (expignite-b), 103011–103018 (nationalsticky-b),
  103021–103028 (companionguard-b) — do not use.
  The one `hidden_files/` word-boundary hit outside the
  corpora is this run's OWN claim file
  (`hidden_files/lever-claims/fleshout-20261117T060712Z.json`,
  the coordinator's claim for this arm) — a self-reference,
  not a prior reservation.
- NEVER 100521–100536, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568
  (task-forbidden bands).

## Horizon, policy, legs, panel applicability

- Horizon 150 days, death-aware (dead villages stop
  simulating; +10d tail max).
- Policy: **competent verbatim**
  (`scripts/policies/competent.js`, sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
  — verified by this arm with sha256sum before this commit).
  No policy flags: default env.
- Leg 1 (control): competent + recorder, `RUMORTARGET`
  and `REATTACH` both UNSET (both levers OFF — the
  old-code-fails control), seeds 103201–103208. Leg 2
  (armed): competent + recorder, `RUMORTARGET=1`
  `REATTACH=1`, IDENTICAL seeds. Both legs run on the
  SAME branch tip (levers built, env toggles them) — the
  before/after is the env, not the code.
- **§15 balanced panel:**
  `scripts/build-reattach-panels-20261117.js` (cloned
  from `scripts/build-rumortarget-panels-20261117.js`,
  panel logic UNCHANGED; only leg dirs, file names, seeds,
  pseudo-policy change) builds panels in the
  `scripts/balance-panel.js` schema from the two legs:
  before=control, after=armed, PAIRED seeds on the same
  tip, pseudo-policy `reattach-a`. The scorecard reads
  OFF→ON deltas per contract metric. The panel is the
  instrument; the prereg bars are the judge. The `compare`
  `.md` is attached to the evidence file.
- **Encounter gear (Steve 2026-11-13):** no staged
  solo-scholar fixture is used anywhere in this arm. The
  judged numbers come from full 150d sims under the
  competent policy (a geared scholar with a party, as the
  policy plays it). The proof test's live probe stages a
  villager-side state (a told tale + a heard plan at
  Haven), not a combat fixture — no fight is staged.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** armed leg tip, seed 103201, 60d,
  recorder ON, run twice → identical per-seed JSON
  (deaths/days/endReason/vet5 + all rumortarget rows
  identical, including re-attach rows).
- **D2 (wrap neutrality):** armed leg tip, seed 103201,
  60d, recorder ON vs recorder OFF
  (`REATTACH_RECORDER=off`) → identical trajectories
  (deaths/days/endReason/standing/vet5 + daily
  fingerprints). The recorder wraps are the only
  difference between the legs — D2 isolates them.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js`
  over the control corpus vs the armed corpus — first
  divergence on/after the first attach OR re-attach day
  per seed; the two legs differ ONLY by the env gates, so
  any divergence BEFORE the first attach/re-attach on a
  seed is a nondeterminism finding and fails the run.
  (The driver carries the same `v4seeds` rows + T-class
  fingerprints as rumorplan-a, so the same check applies
  verbatim.)

## The instrument (frozen)

- Driver: `scripts/reattach-driver-20261117.js` (new —
  the rumortarget driver cloned, not rebuilt: same
  vetfirst T-class instrument, same WAVE-4 PER-ENCOUNTER
  RECORDER, same DAWNBID CAPTURE, same SEEDATTACH
  CAPTURE, same RUMORPLAN CAPTURE, same RUMORTARGET
  CAPTURE, PLUS the re-attach fields on the attach wrap:
  `reattached`, `oldTarget`, `oldWave`,
  `reattachBlocked`, `reattachApplicable` (targeted heard
  plan, gear/party, at call time). `LEG` locked to
  `competent`, `RUMORTARGET` + `REATTACH` read from env
  and passed through to the game. Recorder wraps are pure
  reads plus writes to driver-local arrays — no game-state
  writes, no RNG. The driver refuses to overwrite an
  existing per-seed file. `REATTACH_RECORDER=off` skips
  installing ALL wraps (used by determinism leg D2).
  Errors are REPORTED into `instrumentErrors` (named, not
  swallowed).
- Rumortarget rows (per seed, in addition to every
  rumorplan row): as the rumortarget prereg, PLUS on each
  attach row the re-attach fields above. The wrap reads
  the plan's origin/stage/target before the call; the call
  itself is the lever's.
  - End-of-run `taleSupply`: `{killerTales,
    vetKillerTales}` (each `{mid, killer, day, told,
    played}`) + `killerTaleLog` / `vetKillerTaleLog`
    (voice sample, last 20 each).
  - Output also carries `wave4Ids` / `wave5Ids` (live).
- Analyzer: `scripts/analyze-reattach-a.js` (new, cloned
  from `scripts/analyze-rumortarget-a.js`). Reads both
  corpora, prints the primary per-seed table + attach
  split + RE-ATTACH split + launch table + tale-supply
  table + wall numbers for both legs, writes
  `evidence/2026-11-17/reattach-a-analysis.json`,
  exits non-zero on any bar failure AND on any
  re-attach integrity violation (bar 6). Origin
  cross-check: recorder creation rows (fought empty +
  slainTotal > 0) vs `plan.origin` stamps in the census —
  any disagreement is named.
- Panel builder:
  `scripts/build-rumortarget-panels-20261117.js` → cloned as
  `scripts/build-reattach-panels-20261117.js` (see §15
  above).
- Drift check: reuse `scripts/vetparty-drift-check.js`
  verbatim (first divergence on/after first attach OR
  re-attach day).
- Proof: `scripts/test-reattach-a.js` (new; see below).
  GREEN on the instrument tip before the armed leg runs.

## Proof test

`scripts/test-reattach-a.js` proves, on synthetic fixtures
and live in-memory runs (no corpus numbers):

- Static: the wave-4 AND wave-5 id sets match
  `src/data/monsters.json` exactly (10 + 10 ids); the env
  gates read `RUMORTARGET` AND `REATTACH` (both default
  OFF); the code anchors still hold (two pre-existing
  target-write sites, the HavenTick creation block with
  the two engagement legs, the tale queues + `played`
  stamp, the single plan-deletion site); the re-attach
  branch exists inside `winPlanRumorAttach` and the
  refresh call site fires for targeted heard plans in
  gear/party.
- Unit (re-attach rule, synthetic fixtures): re-attach
  fires wave-3 → wave-4, wave-3 → wave-5, wave-4 → wave-5;
  NEVER downward (wave-4 → wave-3), NEVER same-wave
  (wave-4 → a different wave-4 beast), NEVER to the same
  beast; stale higher-wave tale excluded; dead teller
  excluded; untold tale excluded; wave-2 tale excluded;
  hunt/standing/table stages NEVER re-attach (the
  launched-plan bar); fought-origin plans NEVER
  re-attach; `REATTACH` unset → attach fires but NO
  re-attach (plan keeps its wave-3 beast even with a
  fresh wave-4 tale on offer); both env flags OFF → no
  attach at all (old-code-fails control); re-attach
  updates `target` + `needWave` + provenance stamps and
  voices the DISTINCT re-attach line naming the new
  beast, the teller, AND the old beast; a second
  re-attach can chain upward (3 → 4 → 5) while the plan
  stays unlaunched.
- Live (in-memory run, no staged fight): a told wave-3
  tale + a heard plan at Haven attaches, then a told
  wave-4 tale re-attaches it (voice line captured naming
  both beasts); the IDENTICAL setup with `REATTACH`
  unset keeps the wave-3 target — the re-attach control.
- Determinism: D1 + D2 as frozen above (seed 103201, 60d).
- GREEN on the instrument tip before the armed leg runs.

## Sense-testing

Quote ≥3 re-attach lines end to end from the armed leg:
what the villager planned, what the old tale said, what
the new tale said (seed/day/beast/teller from `taleSupply`
+ `killerTaleLog`), what the plan named before and after,
and what happened on the trip (launch rows +
`v4encounters[].log[]` where a meeting followed). Do not
invent fight narrative from kill counts. Judge whether the
voice line names the beast the holder actually heard about
AND the beast the plan actually held — a line naming a
wrong old beast is a sense failure even if the counts pass.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft",
  wave 5 "The Producers". Doc drift noted (rumorplan-a):
  the doc lists 9 wave-4 monsters and 8 wave-5; the data
  has 10 and 10 (`herald`; `finale_crew` /
  `finale_opening`) — the data rules.
- `docs/VILLAGER-BRAIN.md` §2 + §7 phase 1 — the rumor
  rules this lever implements (teller named, age, distance;
  trust-in-teller × staleness × distance). The full
  per-villager trust map + heard-filtered belief state
  (phases 2–3) are NOT built here: this arm uses the
  existing fireside channel (the tale is told at Haven's
  fire; the deed talk tells everyone) and records the
  per-villager heard-list gap as a blank (see "Distance"
  in the rumortarget prereg).
- No canon doc covers plan-target attachment or the
  win-plan lifecycle — the win-plan system lives in
  `src/js/win-plan.js` (ontology header) and the dated
  evidence. This prereg says so rather than inventing canon.
- Prior evidence: `evidence/2026-11-17/sim-rumortarget-a.md`
  (§"Why the primary missed" + Findings #5) and
  `evidence/2026-11-16/sim-rumorplan-a.md`.

## Metric review (to be filled in the evidence file)

Pre-registered here: the review will report the primary
per-seed table (attach / re-attach / no-attach with the
reason: no tale, stale-only, teller-dead-only, no heard
plan, wave-not-higher, stage-launched), the reattach-only
primary seeds, the launch bar, the cost bars against the
control leg, and — if the primary misses — the nearest
miss (the seed that came closest: a wave-3 attach with a
wave-4 tale one day too late, a re-attach blocked by
stage, a teller who died the day before the re-attach).
If the control shows <4 seeds with any told wave-4/5
tale, the review will say so with the per-seed supply
table (the feasibility note above). No re-scoring mid-run:
the bars above are the judge.
