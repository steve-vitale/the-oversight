# sim-nondeathplan-b — PREREG (binding)

Run: fleshout-loop-b-20261117T1130Z (Loop B), axis winnability chain, arm
sim-nondeathplan-b — BUILD: non-death plan cleanup in `win-plan.js`
(finding #2475, the follow-on to the just-landed deathcleanup).
Branch `sim-nondeathplan-b` (worktree
`~/workspace/worktrees/sim-nondeathplan-b`). Base at arm start: master
`3cb0782e5` (the brief's pin) — REBASED clean onto local master
`581a2551e` before any judged sim (the brief's base check: master had
moved; the rebase is a fast-forward, branch had no commits; the 5
commits after 3cb0782e5 are evidence-only gateproof/food-economy
commits with zero overlap in src/js/win-plan.js, src/js/betrayal.js,
src/js/party.js or the deadplan instrument). Proof re-run on the
rebased tip is required at the end (see §Proof).
Binding prereg: THIS file — frozen before any judged sim. The
instrument (driver extension, thin driver, analyzer, proof test) is
built AFTER this commit; the fix is built AFTER the control leg runs;
no judged numbers exist yet. Commit this file FIRST
(`scripts/safe-commit.sh "sim-nondeathplan-b: frozen prereg — ..."`),
then build.

## The question, in plain words

A villager starts a win-plan (gear up, gather a party, walk out and
hunt the beasts the village needs dead). The villager LEAVES the
village alive — driven off, walked out after losing a leadership
fight, exiled by the moot, paid away as tribute, or named for the
relay. The plan does not die with their leaving: the deathcleanup
fix (landed 1e74e1078) hooks only death (`'killed'` / `'ambushed'`),
and finding #2475 says non-death removals leave winPlan entries the
same way the dead's did (8 dead holders lingered ≥30 days on the
deathcleanup control leg). This arm BUILDS the extension — a
villager's win-plan dies when they leave the village by ANY removal
path — and measures before/after on identical seeds: does the
cleanup remove the stale refs with no regression, and does it never
ignite the plan system in a sleeping village?

## Prior art (read first)

- `evidence/2026-11-17/sim-deathcleanup-b.md` + prereg — the spec
  this extends: the purge helper (`winPlanOnVillagerDeath`), the
  non-creating read, the stage fallback, the `deathCleanups`
  counter, the deadplan driver/analyzer reuse, the correction
  lesson (a cleanup must NEVER call `stateOf()` or otherwise
  materialize `winPlan={}` — it must never ignite the plan system
  in sleeping villages).
- `docs/CANON.md` (read first). CANON GAP (recorded, not invented):
  no CANON-registered doc covers winPlan lifecycle or removal
  cleanup (checked 2026-11-17 against the `docs/CANON.md`
  manifest, same as deadplan/deathcleanup). The work is grounded
  only in `src/js/win-plan.js`, `src/js/betrayal.js`,
  `src/js/party.js`, and that evidence file.
- `docs/MEASUREMENT.md` §§9–12, 14–15.

## Removal-path inventory (frozen — verified in this tree before this commit)

Every way a villager leaves the roster, and where the cleanup hooks:

- `removeVillager(vid, how)` (`src/js/betrayal.js:1104`, "the one
  removal choke point"): ALL non-death removals route through here.
  Callers by `how` (enumerated 2026-11-17 in this tree):
  - `'fled'` — game.js:4406 (bullied villager runs from Haven).
  - `'splinter'` — game.js:5449 (leadership loser walks out).
  - `'exiled'` — game.js:31756 (freeloader moot vote-out) and
    betrayal.js:2220 (trial sentence).
  - `'tribute'` — table.js:206 (two living wave-4 veterans paid
    away; verified the payment lands, roster checked after).
  - `'relay'` — table-defiant.js:170/185 (the relay's person named
    and taken).
  - Generic passthroughs forward the caller's `how` unchanged:
    membership.js:201 (`severMembership` → `removeVillager(id,
    how)`; only the player self-exile path calls it in this tree)
    and comms.js:1196 (a pass-through wrap that calls the original
    and then retires a vacated switchboard — it does NOT bypass the
    choke point; a driver wrap on `Game.removeVillager` sits above
    it and sees every call).
  - Death hows (`'killed'`, `'ambushed'`) keep the deathcleanup
    hook exactly as landed; the new hook is the `else` branch.
- `tbVillagerFalls(t)` (src/js/game.js:40356): death only — a
  villager FALLS in a turn-based fight. No non-death removal passes
  through it. NOT hooked (the death hook there is untouched).
- **BYPASS (found this arm, frozen):** `Game.tbEnd` in
  `src/js/party.js:1438` — a fled betrayer in a turn-based
  betrayal fight is removed from the roster DIRECTLY
  (`v.roster = filter(...)`), bypassing `removeVillager`
  entirely. Their winPlan entry would linger, and they would never
  reach the exiles ledger or any other removal hygiene. The fix
  routes this one through the choke point (see §The fix) instead
  of adding a second hook site — the choke point exists so
  removals go through it.
- NOT removal funnels (checked, frozen): `membership.js`
  villageEats wrap (temporarily filters the roster for one meal
  call and restores live + withheld — no departure); game.js:2458
  / 10311 (village creation/setup); betrayal.js:3472 (join —
  pushes, never removes); contests.js:6082 (inside
  `_cxKillContestant`, which also calls `removeVillager('killed')`
  — a death, already covered); `registerDeath` (corpses.js — the
  death record, NOT a removal choke point; same non-hook ruling as
  deathcleanup, for the same phoenix reason).

## The fix (frozen design)

`winPlanOnVillagerLeave(vid)` in `src/js/win-plan.js` (new method,
listed in the file's `provides:`), plus a shared purge core and two
hook sites:

- **Shared purge core** (the reuse, not a duplication): the
  party-purge loop + stage fallback move into a module-internal
  `purgePartyRefs(v, vid)` returning the purged count. The death
  method keeps its own entry-delete line and its own exact bump
  line verbatim — the deathcleanup proof test pins both
  (`delete v.winPlan[vid]` occurs exactly twice in the file:
  death method + table-active case; the death bump line is an exact
  string). The leave method deletes the entry spelled
  `delete v.winPlan[key]` (key === vid) with an explanatory comment:
  the spelling is deliberate, so the deathcleanup pin keeps
  counting two. Both methods use the same non-creating read
  (`this.state.village`, return early when `!v.winPlan`) — the
  leave method must NEVER call `stateOf()` on the no-plan path.
- `winPlanOnVillagerLeave(vid)`: delete the leaver's own entry,
  purge the vid from every remaining holder's `plan.party`, fall a
  `party`/`hunt` plan back to `party` when its party empties
  (same rule as the death method); `standing` / `table` plans keep
  their stage. Bump `winPlanStats.removalCleanups` (new counter,
  initialized in `stateOf` beside `deathCleanups`, with the same
  null-guard line) only when something was actually cleaned
  (entry deleted or ≥1 party ref purged). Pure data work: no RNG,
  no `say`, no narration. Returns `{ deleted, purged }`.
- **Hook 1 — `removeVillager` else-branch** (betrayal.js, at the
  end of the function, after the dead-mark `if (how === 'killed'
  || how === 'ambushed')` block): `else { if (typeof
  this.winPlanOnVillagerLeave === 'function')
  this.winPlanOnVillagerLeave(vid); }`. Fires for every non-death
  `how` that reaches the end of the function — which is all of
  them (the only early return is the phoenix one, killed-only).
  The death branch is untouched: `winPlanOnVillagerDeath` is still
  called exactly once in `removeVillager`, and non-death removals
  still never call it.
- **Hook 2 — `tbEnd` fled betrayer** (party.js:1438): replace the
  direct `v.roster = filter(...)` line with `try { if
  (this.removeVillager) this.removeVillager(fled.villagerId,
  'fled'); } catch (e) {}`. The `positions` / `v.party` /
  `v.followers` filter lines beside it STAY (removeVillager does
  not clean party/followers). This adds NO `winPlan` literal to
  party.js — the deathcleanup proof's `staticReaderCheck`
  allowlist (game, agency, brain, win-plan, betrayal) stays green.
- NOT hooked (deliberate, frozen): `tbVillagerFalls` (death only);
  `registerDeath` (fires before the phoenix decision); no tick, no
  recorder, no dawn pass — the cleanup runs at the removal moment,
  synchronously, in game code.

Scholar: the scholar cannot hold a winPlan entry — all creation
paths are NPC-only (deathcleanup prereg, unchanged). No player
hook is needed; the method itself is vid-generic.

## Instrument (frozen)

Reuse the deadplan/deathcleanup instrument, not a rebuild, plus a
minimal opt-in extension:

- `scripts/deathcleanup-driver-20261117.js` is NOT reused as-is:
  this arm needs the removal day AND the `how` for every removal,
  which the corpus does not carry (planCensus `holderAlive` is a
  dead-flag read — a leaver reads alive). The deadplan driver gets
  ONE additive, env-gated extension (correction-style commit,
  stated in the evidence): when `NONDEATH_RECORDER=on`, a wrap on
  `Game.removeVillager` (installed with the other wraps, after
  `setupGame`) records `{ day, vid, how }` into a top-level
  `removals` array. Pure reads + driver-local writes, no RNG, no
  game-state writes — same class as every other wrap. When the env
  is unset, NO new code path executes: the death leg's behavior is
  byte-identical (the deathcleanup driver never sets the env).
- `scripts/nondeathplan-driver-20261117.js` — thin wrapper over
  the deadplan driver's `oneRun` (same pattern as the
  deathcleanup driver): sets `MODE=on`, `NONDEATH_RECORDER=on`,
  writes per-seed JSON to
  `evidence/2026-11-17/perseed-nondeathplan-b-{control,armed}/`
  with `RUN=nondeathplan-b-{control,armed}`, `MODE=on`,
  `DAYS=150`. It re-labels `arm`/`leg` the same way.
- `scripts/analyze-nondeathplan-b.js` — requires
  `scripts/analyze-deathcleanup-b.js` (reuses `summarize`,
  `driftSmoke`, wall numbers, cost inputs) and
  `scripts/analyze-deadplan-b.js` (`analyzeOne`). It adds the
  non-death analysis ONLY: a removal map built from BOTH the
  `removals` wrap (exact day + how) AND a roster-disappearance
  derivation from `daily[].roster` (last roster day + 1; permanent
  disappearance only; a vid with a deaths-array row dated at or
  before the removal is a death, not a removal — a later death row
  is a post-removal death and is reported explicitly). A removal
  the derivation sees but the wrap never recorded is a BYPASS
  removal, named as such (the party.js path on the control leg is
  the known one; any other bypass is a finding). Lingering counts
  mirror the deathcleanup slot definition (one count per census
  row): entry rows = planCensus rows for the removed vid on days
  ≥ removalDay + 7; party-ref rows = planCensus rows for a LIVING
  holder whose party still names the removed vid on days ≥
  removalDay + 7. The analyzer also runs the ignition check
  (below) and the D3 drift smoke with `firstLeverDay` = the first
  non-death removal day (min across legs) — the lever's earliest
  possible effect, since the death cleanup is in BOTH legs.
- `scripts/test-nondeathplan-b.js` — proof: static checks (the
  leave method exists; the deathcleanup pins still hold —
  delete-count 2, death bump line exact, removeVillager calls the
  death method exactly once, staticReaderCheck clean, party.js
  routes through the choke point and carries no `winPlan` literal;
  the src diff vs merge-base is exactly win-plan.js +
  betrayal.js + party.js), unit fixtures (one
  `removeVillager(vid, how)` case per non-death how — fled /
  splinter / exiled / tribute / relay — each deleting the holder's
  plan + purging party refs + bumping `removalCleanups` and NOT
  `deathCleanups`; stage fallback; idempotency; the party.js
  routing statically + the fled case through the choke point;
  no-creation regression: removing a villager from a village with
  NO winPlan store creates nothing, and a lethal `hurtVillager`
  still bumps `deathCleanups` only), D1 determinism (armed code
  twice, 60d, seed 103241, identical full corpus), and a 150d live
  run proving the armed code leaves zero lingering non-death
  entries on its seed.
- Drift smoke (D3): adapted from the deathcleanup analyzer with
  `firstLeverDay` = first non-death removal day (see above). Any
  daily-fingerprint divergence BEFORE that day is substrate drift,
  not a lever effect, and fails the run.

Legs (both with the recorder ON and `NONDEATH_RECORDER=on` — the
game change is the lever, not the recorder):

- CONTROL leg — the worktree BEFORE the fix commit (base
  `581a2551e` + prereg + instrument), 8 seeds, 150d, competent
  verbatim. Proves the band carries the defect (bar 2).
- ARMED leg — the worktree AFTER the fix commit, same 8 seeds,
  same policy/horizon. Proves the fix removes it (bar 1) with no
  regression (bars 2–3).
- VETREENGAGE is OFF in these sims (env unset) — same as
  deadplan/deathcleanup.

## Primary metric + GO bars (frozen)

Primary metric: **lingering plan entries held by removed
villagers 7+ days after removal, and lingering party refs to
removed villagers, on the armed leg vs the control leg, with the
no-ignition and cost bars behind them.**

GO (BUILD GO = fix works + no regression) iff ALL hold:

1. **Armed leg clean.** Lingering entry rows 0 AND lingering
   party-ref rows 0 on all 8 armed seeds (the analyzer's counts,
   same 7-day rule both legs).
   `winPlanStats.removalCleanups` > 0 band-wide (the hook fired in
   live sims, not just in fixtures).
2. **Control leg reproduces the defect AND no ignition
   regression.** (a) Lingering entry rows > 0 OR lingering
   party-ref rows > 0 on the control leg — the band must carry the
   defect, or the armed leg's zero proves nothing. (b) No-creation:
   the count of no-plan seeds (0 planCensus rows) on the armed leg
   is within ±1 village of the control leg, AND no armed seed
   shows its FIRST plan creation on a day after a removal in a
   village that had no plan before that removal (the deathcleanup
   correction lesson: a cleanup must NOT ignite the plan system
   in sleeping villages).
3. **Cost bars — no regression.** Armed vs control, band totals:
   total deaths armed ≤ control + 10%; median survival armed ≥
   0.8× control; wave-4 kills within ±20% of control. Any bar
   missed = REGRESSION: gate the fix (env gate, default OFF) and
   report it plainly — the ship call below flips to gated.
4. **Proof green.** `scripts/test-nondeathplan-b.js` green on the
   final rebased tip (including D1 + the 150d live leg), and the
   drift smoke shows no divergence before the first non-death
   removal day on any seed.
5. **Balanced panel attached.** The compare `.md` is attached (see
   §Balanced panel) and its decision is `no_material_signal`, or a
   material signal is investigated and explained in the evidence
   (a regression signal there fails this bar).
6. **Wall numbers on both legs**: national by standing ≥200,
   national by scaleRank, table, wins, wave-4 unlocks, wave-5
   unlocks, median survival, wave-4 kills, deaths.

RISK (frozen, honest): bar 2(a) depends on the band carrying
non-death removals of plan holders. Deaths are common; leavers
are rarer (exile votes and splinters are NPC-driven; fled/tribute/
relay need the player or the endgame). If the control leg shows
ZERO lingering entries, the defect is unreproduced on this band
and the verdict is NO-GO on bar 2(a) — the build judgement then
falls back to the proof test + the code evidence (the hook fires
on every removal path by construction, fixture-proven per how),
NOT a silent GO. The arm does not go hunting for a dirtier band
mid-run; the band is frozen here.

The VERDICT is the armed-leg cleanliness plus the cost bars. A
BUILD GO means the fix ships as a direct fix (no env gate). A miss
on bar 2(b) or 3 or 5 means the fix ships gated (default OFF) or
not at all, per the ship call below — never silently.

## Ship call (frozen)

Direct fix, NO env gate — unless the before/after shows ANY
regression (bar 2(b), 3, or 5), in which case gate it, keep default
OFF, and report the regression plainly. The evidence file states
which call was taken and why. (Same rule as the brief.)

## Seed bands (fresh — verified, not reused)

- Band: **103241–103248** (8 seeds), control leg first (pre-fix),
  then armed leg (post-fix), identical seeds, same policy/horizon.
- FRESH: per-seed `grep -rl` over `evidence/*/sim-*-prereg.md`
  AND `evidence/*/sim-*.md` returns 0 files for every seed in the
  band (verified 2026-11-17 in the worktree); the only
  `10324`/`10325` hits anywhere under `evidence/` are false
  positives (a game.js line number, `10325`, in
  sim-kinfirst-b-prereg.md, and a run-id timestamp, `1032Z`, in
  journey-scale-r197 files — neither is a seed). `grep -rl "10324"`
  over the live claim files in
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/lever-claims/`
  returns nothing. The band is in no earlier arm's forbidden list
  (deadplan's list carried over: NEVER 100621–100636,
  100861–100868, 100821–100828, 100721–100728, 100761–100768,
  10100–10139, 190391–190398, 190621–190628, 190631–190638,
  190541–190548, 190561–190568). Nearby bands already used:
  103201–103208, 103211–103218, 103221–103228, 103231–103238.
- This is a fresh screening band; there is no cross-band comparison
  in this arm — both legs run this band only.

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js`
  — sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`,
  verified in the worktree before this commit — matches the brief's
  pin, no re-pin needed).
- Control anchor = the prereg commit (base `581a2551e` + prereg +
  instrument, recorder ON); armed anchor = the fix commit (same +
  the `win-plan.js` / `betrayal.js` / `party.js` change). No seed
  call anywhere in this arm; the only `src/` change between legs
  is the fix itself.

## Sense-testing (mandatory)

Read transcripts. Read the per-holder stories on the CONTROL leg:
for every removed holder whose plan lingers ≥7 days, say who they
were, when and how they left, what their plan was (stage, target,
party), and whether anything in the village's talk or behavior
ever treated the removed holder as still planning. On the ARMED
leg, read the same villages' talk around the same removals: does
any line treat a removed holder as still planning, or name a
removed companion as still walking with the living? One such line
is a finding, not a rounding error — name it in the evidence.
(Limitation, frozen: the corpus captures veteran-filtered say
lines only, same as deathcleanup — the scan runs over `vetSays`
for the removed holders' names; a full-transcript check is not
available from the corpus.)

## Balanced panel (per docs/MEASUREMENT.md §15)

The panel IS run for this BUILD arm (same as deathcleanup):
it is the before/after cross-check on 4 policies × 16 seeds × 150d.

- Base panel: `node scripts/balance-panel.js --n 16 --days 150 --out
  evidence/2026-11-17/nondeathplan-panel-before` — run from this
  worktree BEFORE the fix commit (control `src/`).
- Lever panel: same command with `--out
  evidence/2026-11-17/nondeathplan-panel-after` — run AFTER the fix
  commit (armed `src/`).
- Compare: `node scripts/balance-panel.js compare --before
  evidence/2026-11-17/nondeathplan-panel-before/panel.json.gz --after
  evidence/2026-11-17/nondeathplan-panel-after/panel.json.gz --out
  evidence/2026-11-17/nondeathplan-b-panel` — the compare `.md` is
  attached to the evidence file. No legacy sweep env overrides
  (`SEEDS`/`POLICIES`/`DAYS`/`REGION`/`ORIGIN` unset) during panel
  runs; no `src/` edits during a panel run (the panel's sourcesStable
  check fails otherwise).
- If panel compute fails or overruns the run, record the deviation
  with the exact follow-up commands (companionguard precedent) —
  do not silently skip it, do not fake a compare.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-17/perseed-nondeathplan-b-armed/*.json'
--metrics national,table,wins,exiled`. Record the outcome (including
a documented refusal) — do not work around a refusal.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the control leg reproduce the defect on this fresh band
  (bar 2(a)), or is the band defect-free (no plan-holding leaver)?
- Did any non-death removal bypass BOTH hook sites (a removal in
  the derivation with no wrap row AND no choke-point call — a
  second bypass beyond party.js)? Name the path — a bypass is a
  finding, not a rounding error.
- Did the stage fallback (`hunt` → `party` on empty) fire on a
  removal in the armed leg, and did any holder re-seek a
  companion afterwards?
- Did the `removalCleanups` counter fire per how (fled / splinter /
  exiled / tribute / relay) in live sims, or only in fixtures?
  Which hows never fired in 150d, and what does that say about
  the band?
- Did the ignition check (bar 2(b)) hold — same sleeping villages
  on both legs?
- Was 150d the right horizon, or did the cost bars need the full
  run to separate from noise?
- Did the panel agree with the paired legs, or disagree (and why)?

## Wall numbers (report every run)

National (standing ≥200 AND scaleRank), table, wins, wave-4
unlocked, wave-5 unlocked, median survival, wave-4 kills, deaths —
per leg.
