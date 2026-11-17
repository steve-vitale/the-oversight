# sim-nightcarry-a — PREREG (binding)

Run: fleshout-20261117T0215Z (Loop A), axis scale-onramp, arm
sim-nightcarry-a — BUILD lever, scale-onramp blank #7: part-2 commits
die at the night tick. Branch `sim-nightcarry-a` (worktree
`~/workspace/worktrees/sim-nightcarry-a`). Base: master `5d5293972`
(verified at arm start, worktree clean). Binding prereg: THIS file —
frozen before any judged sim. The instrument (driver, analyzer,
panel builder, proof test) and the lever are built AFTER this commit;
no judged numbers exist yet.

## The question, in plain words

A villager commits at dawn (or mid-day) to lead a party out after a
wave-4 beast. If the day ends before the party leaves, the plan dies
overnight — silently, with no word at the fire and no try the next
morning. Is that a defect (a promise the village made and the clock
quietly broke) or an intended same-day departure window (decide today
or not at all)? This arm carries the commit across ONE night and
judges the effect by the pilot, not the intent.

## The death, exactly (read in code before writing this)

Per day-part the tick order is: base `npcNodeTravel` → `agencyTick`
→ `objTick` (both wraps chain onto `npcNodeTravel`;
`villager-agency.js` loads before `villager-objectives.js`, so
agency runs first inside each part). `agencyTick` is the only
caller of `vbrainExecuteDepart`, and it vetoes at night
(`villager-agency.js`, departure loop: `if (night) continue` —
`isNight()` is `dayPart === 3`). `vbrainExecuteDepart`
(`villager-brain.js`) refuses any commit whose day is not today
(`c.day !== dayOf(this)` → `'normal'`), and the next dawn's
`objTick` force-refresh (`objRefreshPick {dawn:true}` → `objPick` →
`vbrainScorePick`) overwrites the commit with a fresh lottery pick.

So a `party_launch` commit written by the part-2 `objTick` refresh
has ZERO execution windows: part 3's `agencyTick` is night-vetoed,
and part 0 next day runs `agencyTick` (stale commit → `'normal'`)
before the dawn re-pick overwrites it. A part-0/1 commit has two
windows (parts 1, 2) and dies the same way if it never executes.
Nothing voices the death: no line, no record, no next-day retry.
`launchdef-a` (0645Z) measured the shape on the two-leg total:
profile-gate-veto 39 (control only), away-on-expedition 53,
night-at-part-3 25 (17 armed + 8 control), not-at-haven 8, other 3.

## Defect or window? (stated now, judged by the pilot)

It reads as a DEFECT, for two canon reasons, and the pilot is the
judge: (1) NO SILENT ACTIONS (`docs/CANON.md`) — a commitment the
dawn scorer made dying overnight with no line and no record is a
silent action; (2) the one-brain commitment contract
(`villager-brain.js` header: "the dawn pick writes a commitment
record the same day so midday agency honors it instead of rolling
again") — the clock, not a decision, breaks the commitment. The
intended-window reading would need canon for a same-day-only
departure rule: none exists in `docs/MONSTER-WAVES.md`,
`docs/PARTY.md`, or `docs/TIME-ECONOMY.md` (departures are gated
on Haven / night / danger, never on "same day as the decision").
If the pilot shows carried commits converting to launches without
a cost-bar breach, the carry stands as a defect repair. If carried
commits do not convert, or the cost bars breach, the arm is NO-GO
and the death stands as the window.

## Prior art (read first)

- `evidence/2026-11-16/sim-launchdef-a-prereg.md` + `.md` +
  `launchdef-a-analysis.json` — the skip-reason recorder, the
  any-commit launch definition (reused verbatim), the frozen bucket
  definitions and classifier (reused verbatim except the GO
  section), the 25 night rows, the profile-gate bypass text (live
  in game code, NOT touched by this arm).
- `evidence/2026-11-15/sim-profilegate-a.md` + prereg — the gate
  fix, the matched pair, the Diana Osei away-as-companion lesson.
- `evidence/2026-11-15/sim-dawnbid-a.md` + prereg — the 24-plan
  decomposition, the frozen buckets, the seed-call text.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave 4
  "The Mirror Draft"; readiness wave 4: 3 armored P≥10, 5 armed,
  3 tricks, 1 wave-3+ killer — the bar this chain feeds, not
  changes), `docs/PARTY.md`.

## Scope — what this arm does NOT touch

- The profile-gate bypass (launchdef, live in `villager-agency.js`
  `agencyTick`) is NOT touched: the carry re-issues the commit with
  TODAY's day, so the existing day-gated bypass composes unchanged.
- The vetparty seed call (reverted, `7ba893b4b`) is NOT re-landed.
  Both legs run on master as-is. Live seed sources on master are
  the expedition paths only: `expeditionMonster` 'evaded' /
  vFlee → `winPlanSeedFromFight` (`villager-agency.js`), and the
  `winPlanFightGate` 'avoided' path (`win-plan.js:684`); plus
  `winPlanHavenTick` target-null gear plans (not seed-counted
  instances — they can still bid `party_launch`).
- No win-plan stage, bar, gate, price, readiness, or default
  changes. No `winPlanDepart` change (legacy path, not the
  one-brain path). No `agencyTick` night-check change: nobody
  departs at night, before or after this arm.

## Design decision 1 — the carry, exactly (frozen)

Env-gated: `NIGHTCARRY=1` (node sims only; in the browser
`process` is undefined, so this never fires — same idiom as
`VETREENGAGE`). Default OFF = master behavior byte-for-byte.

Hook: at the top of `vbrainScorePick` (`villager-brain.js`),
before any scoring, when `NIGHTCARRY=1`:

1. Read the stored commit `c0 = vbrainCommit(vid)`. Carry ONLY
   when ALL hold:
   - `c0.kind === 'EXPEDITION'`, `c0.winPlanAction ===
     'party_launch'`, `c0.day === today - 1` (yesterday's commit,
     any part — the death mechanism is identical for part-0/1/2
     commits; `carriedFromPart` is recorded so the analyzer can
     split part-2 from earlier), and `!c0.carried` (ONE night's
     grace only — a carried commit that fails to launch dies for
     good at the next dawn; no infinite carry loop).
   - The plan still exists and `plan.stage === 'party'`
     (pre-launch; `hunt`/`standing`/`table` means it already
     launched or moved on — the normal re-engagement loop owns
     those, not the carry).
   - The holder is alive, not away, and holds no expedition.
   - The COMMITTED companion (never re-picked from a roster —
     perception law) is alive, at the Haven node, not away,
     holds no expedition, is not engaged, and trust ≥ 15 (the
     same bars `findCompanion` applies, minus the profile check:
     profiles are cached in `agencyState().profiles` and cannot
     change overnight; the commit already passed them).
2. If all hold: re-issue the commit verbatim with `day = today`,
   `part = current part`, `carried: true`,
   `carriedFrom: c0.day`, `carriedFromPart: c0.part` (same kind,
   companion, `winPlanAction`, `vbrainSrc`, score), push a log
   entry `{mode: 'carry', override: 'night_carry'}`, bump
   `village.vbrain.stats.nightcarries`, and RETURN the carried
   candidate (kind `EXPEDITION`) so `objPick` materializes the
   same indoor chore hold via `vbrainAlignObjective`. No new RNG
   draws on the carry path (no lottery, no `findCompanion` call).
3. If any check fails: the commit dies as on master and scoring
   proceeds normally. No state is written on the failing path.

`writeCommit` persists the new fields (`carried`,
`carriedFrom`, `carriedFromPart`) so the analyzer and the
departure path can read them. `companion2` is NOT added to
`writeCommit`'s field list: that would change the sibling
vetreengage arm's trio behavior (its `c.companion2` read in
`vbrainExecuteDepart` is currently always undefined because
`writeCommit` drops it) — out of scope; recorded as a finding
for the backlog instead.

Voice (honesty): in `vbrainExecuteDepart`'s `party_launch`
branch, when the commit is carried AND the departure is
announced (`announce`, i.e. the player is at Haven), say one
line naming it as yesterday's plan continuing — the next-day
departure must read as the SAME launch, not a fresh decision
(e.g. "`<holder>` is finally setting out — yesterday's plan,
leaving today with `<companion>`."). The generic
`startExpedition` announce line is left untouched; the carried
line is additional and gated on `announce`.

Downstream gates still apply unchanged at execute time: Haven,
night, danger, objectives, and `startExpedition`'s sick /
range-0 / hurt<70 checks. A carried launch that fails any of
them simply does not launch (the analyzer's existing
`selected-blocked` buckets catch it).

## Design decision 2 — baseline policy is competent verbatim (frozen)

Policy `scripts/policies/competent.js`, sha
`df9b7dff4de4` (12-char sha256), used verbatim, no env
pairing. No `LEANLINKRESCUE` / `TABLESEATNOWAIT` env: the
0446Z lesson was that default env collapses tableseat-nowait
to competent — here competent IS the baseline, so there is
nothing to collapse. Control leg: `NIGHTCARRY` unset (OFF).
Armed leg: `NIGHTCARRY=1`. Both legs run the same driver,
same seeds, same horizon.

## Design decision 3 — seeds, horizon, band freshness (frozen)

- Seeds: **103101–103108** (8 seeds, pilot). Horizon: **150d
  death-aware** (+10d tail max). Confirm (12–16 seeds) only on
  a pilot GO.
- Freshness (per `local_seed_band_freshness`, checked
  2026-11-16 before this prereg): `rg "10310[1-8]"` over
  `evidence/*/sim-*-prereg.md` — ZERO hits. Full-`evidence/`
  search returned only incidental digit runs inside longer
  numbers, verified NOT seed reservations: `0.01031064194808311`
  (a float in `evidence/2026-10-19/pithear-compare.json`),
  `"pantryKcal": 103101` (a kcal value in
  `evidence/2026-11-16/journey-succession-r229-34313.stdout.json`),
  `1.161031048981721` (a float in
  `evidence/2026-11-03/sim-streakfree-cost-b-tracer.jsonl` and
  its screen twin). No `"seed": 10310x` anywhere in `evidence/`.
  Live claim files in
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/lever-claims/`
  name no 10310x band. Band is FRESH.
- This band is SHARED with the sibling `sim-rumortarget-a`
  arm (coordinator-verified). My verdict rests on my own
  within-arm control contrast; I do not read or reuse their
  corpora.

## Design decision 4 — instruments (frozen)

### 4a. Launch definition (launchdef, reused verbatim)

A wave-4+ plan instance counts as **launched** when a
`party_launch` commit for the instance on a given day — dawn
(part 0) OR mid-day refresh (part 1 / part 2) — leads to a
`vbrainExecuteDepart` row that day with result `launch` and
BOTH the inviter's and the companion's expeditions started
(`vidExped && companionExped`). Every launch records its
commit kind (`dawn` / `mid-day part-1` / `mid-day part-2`) AND
whether the commit was carried (`carried`, `carriedFrom`).
A `launch` row with the companion left behind is NOT launched
— it is `selected-blocked` with sub-reason
`companion-not-started`. Dawn-only launched is reported
alongside as a secondary count.

### 4b. Skip-reason recorder (launchdef, reused verbatim)

The driver wraps `Game.agencyTick` with the same 11-reason
taxonomy (holder-dead, engaged, away-as-companion,
away-on-expedition, profile-gate-veto, not-at-haven, night,
indoor-objective, danger-gate, execute-returned-normal,
other), plus the `no-tick-after-commit` analyzer resolution.
PLUS, new in this driver: `nightcarryCarries` rows — one per
carry event at `vbrainScorePick` (day, vid, companion,
carriedFrom, carriedFromPart, plan stage/target), and the
`carried` flag on every score/depart row, so the analyzer can
join carries → launches. `NIGHTCARRY_RECORDER=off` skips the
wraps (determinism leg). Recorder wraps are pure reads plus
writes to driver-local arrays — no game-state writes, no RNG.

### 4c. Driver / analyzer / panel (adapted, not rebuilt)

- Driver: `scripts/nightcarry-driver-20261117.js` (new — the
  launchdef driver copied EXCEPT: policy competent verbatim,
  `MODE=control|on` maps to `NIGHTCARRY` unset / `=1`,
  arm/run naming `nightcarry-a`, the carry recorder above,
  `nightcarryCarries` corpora; the vetfirst T-class instrument,
  v4 recorders, dawnbid capture rows, and skip recorder are
  otherwise UNCHANGED). The driver refuses to overwrite an
  existing per-seed file.
- Analyzer: `scripts/analyze-nightcarry-a.js` (new — the
  launchdef analyzer copied EXCEPT: output file
  `evidence/2026-11-17/nightcarry-a-analysis.json`, arm label
  `nightcarry-a`, the GO section below, a carry table
  (carried / carried→launched / carried→blocked, split by
  carriedFromPart), and the skip-reason decomposition per leg).
  The frozen bucket definitions, precedence, and classifier
  are otherwise UNCHANGED from launchdef (Correction 2
  included: stage advancement is history, not churn;
  `target-killed` bucket; `selected-not-executed` sub-reason).
- Panel: `scripts/build-nightcarry-panels-20261117.js` (new —
  the launchdef panel builder adapted: before=control leg,
  after=armed leg, PAIRED seeds, pseudo-policy
  `nightcarry-a`, seeds 103101–103108, 150d). The §15 balanced
  panel (`scripts/balance-panel.js`) is the instrument; the
  pre-registered threshold below is the judge. The compare
  `.md` is attached to the evidence file.
- Drift check: reuse `scripts/vetparty-drift-check.js`
  verbatim (reads `v4seeds` + the T-class daily
  fingerprints). First divergence must fall on/after the
  first `v4seeds` day per seed in the armed leg — the carry
  can only act after a plan exists and a commit dies, so any
  earlier divergence is substrate drift, not a lever effect.
- Proof: `scripts/test-nightcarry-a.js` (new; see below).
  GREEN on the control anchor before the control leg runs;
  GREEN again on the armed tip before the armed leg runs.

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`, wave 4;
  10, re-read live by the driver): `congregation`, `strike`,
  `influencer`, `audit`, `reunion`, `suburb`, `eulogy`,
  `algorithm`, `eater`, `herald`. (Doc drift carried from
  dawnbid: `docs/MONSTER-WAVES.md` lists 9, no herald; the
  data has 10 and the data rules.)
- **A seeded wave-4+ plan instance** opens on a `v4seeds` row
  with wave ≥ 4 whose holder does NOT already hold a live
  wave-4 plan (same vid, same target = a refresh, counted once;
  a later seed row for the same vid with a DIFFERENT target
  while the old instance is still open closes the old instance
  as `churned-retargeted` and opens a new instance). A seed row
  that arrives while the holder's plan is at stage
  hunt/standing/table opens NOTHING — recorded as a non-opening
  seed, not a plan instance. Wave-5 targets count as instances
  (the seed gate is wave ≥ 3; the frozen definition counts
  them — the primary metric is "wave-4+ plans", and the
  wave-4-only count is reported alongside).
- **Launched** (the primary-metric event): any-commit per 4a,
  with the carried flag recorded. Dawn-only launched is
  reported alongside as a secondary count.
- **Carried** (the secondary-metric event): one
  `nightcarryCarries` row per re-issued commit. A carried
  commit counts as **converted** when its instance launches on
  the carry day (the depart row's commit has `carried: true`
  and the instance is the carried one — same vid, same target,
  same companion).
- **Skip reasons**: the 11-reason taxonomy in 4b, recorded per
  (vid, day, part). A commit-day's blocked reason is the first
  skip row that day in part order, unless a depart row was
  reached (then the depart blocker governs: `inviter-*` /
  `companion-not-started:*`).
- **Starvation cost** (per `scripts/analyze-scale-costbar.js`
  B3): totals = starvation-caused deaths across the 8 seeds
  (`deaths[].cause === 'starvation'`); arm-only = armed-leg
  starvation deaths minus those matched same-seed same-day in
  the control leg (a matched starvation death is the same
  village dying the same way on the same day, not a new cost).

## Frozen GO bar (binding — §14 metric binding)

- **Primary:** launched wave-4+ instances (any-commit, 4a),
  armed leg ≥ control leg **+ 2 instances**. (Launched seeds
  reported alongside; the bar is instances, stated exactly.)
- **Secondary:** carried commits converting to launches ≥
  **25%** of carried commits.
- **Cost bars (all must hold):** deaths/run within **+2** of
  control; median survival ratio ≥ **0.9**; starvation deaths
  within **+2** (arm-only, B3 method).
- **Subject-viability floor (pre-stated, NOT a re-score):**
  if control + armed instances opened total **< 4**, the pilot
  is **UNJUDGEABLE** (vacuous subject — wave-4+ plans never
  form on master without the reverted seed call), reported as
  such with the numbers; the lever stays untested pending a
  plan source (a coordinator decision), NOT a lever NO-GO.
- A miss on primary, secondary, or any cost bar is NO-GO,
  never re-scored against a friendlier metric mid-run. If the
  metric proves wrong, it goes under "metric review" and a
  revision is proposed for the NEXT run.

## Encounter gear (Steve 2026-11-13)

The judged sims stage NO artificial fixture: the competent
policy plays live villages, and wave-4 plans form only when
the village has actually geared (plan stage `gear` → `party`
requires armed + armored). The proof probe
(`scripts/test-nightcarry-a.js`) stages encounter gear
explicitly — a geared holder (armed + armored) with a geared
companion and a wave-4 plan at `party` stage — never a fresh
un-geared solo scholar. A staged fixture that does not match
encounter gear invalidates the verdict.

## Proof test (frozen shape)

`scripts/test-nightcarry-a.js` proves the OBSERVABLE effect,
not green assertions alone:

1. Stage a live game (seeded harness, full `src/js` eval in
   `index.html` order, `Math.random` seeded before eval, never
   stub `Game.save`): a wave-4 plan at `party` stage for a
   geared holder with a geared committed companion; write a
   `party_launch` commit at part 2 (via the real
   `vbrainScorePick` path or a direct `writeCommit`-equivalent
   through the public commit API — no private-state forgery
   beyond what the scorer itself writes).
2. Advance through the part-3 night tick (real `agencyTick`):
   assert the commit produced no departure.
3. Advance to the next dawn with `NIGHTCARRY=1`: assert the
   SAME commit (same holder, same companion, same target) is
   re-issued with `carried: true` and `carriedFrom` = the
   prior day, the dawn pick does NOT re-roll a different
   action, and the following daytime `agencyTick` launches it
   (both expeditions started) with the carried departure line
   in the transcript naming it as yesterday's plan.
4. OLD-CODE-FAILS control: the identical probe with
   `NIGHTCARRY` unset (default OFF = un-armed code path) must
   show the commit DYING at the night tick — no carry at dawn,
   a fresh pick overwriting it, no launch. The same probe
   failing on the armed tip and passing on the OFF tip is the
   proof the lever is the cause.
5. Bound check: a carried commit that cannot launch (companion
   made away before dawn) is NOT carried a second day — the
   next dawn re-picks fresh.
6. Guard checks: `NIGHTCARRY` unset leaves the dawn pick
   byte-identical to master (no carry log entry, no stats
   change); a `hunt`-stage plan's commit is never carried.

## Metric review

(To be written after the pilot. Pre-run note: the primary bar
is instances, not seeds, because one instance can launch
repeatedly across days while another never launches — the
instance count is the lever's unit. The 25% conversion
secondary is a floor, not a target: a carry that converts
rarely is a dead letter even if the primary bar passes on
noise. The <4-instances vacuity floor exists because both
legs run WITHOUT the reverted seed call — if plans do not
form, the pilot measures the missing subject, not the lever.)

## Wall numbers to report

national / table / wins, wave 4–5 unlocks, median survival
— per leg, from the balanced panel + analyzer.
