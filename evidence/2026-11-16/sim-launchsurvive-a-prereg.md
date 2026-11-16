# sim-launchsurvive-a — PREREG (binding)

Run: fleshout-20261116T1631Z (Loop A), axis winnability chain, tracker
blank #1 — launch survival + re-encounter DIAG. Branch
`sim-launchsurvive-a` (worktree `~/workspace/worktrees/sim-launchsurvive-a`).
Base: master `35686d860` at arm start (the worktree HEAD; the coordinator
rebases at landing and re-runs proofs).
Binding prereg: THIS file — frozen before any judged sim. Commit this file
FIRST, then build the instrument, then anchor the seed call, then run the
judged pilot. No judged numbers exist yet.

## The question, in plain words

The seed call works — it plants plans (seedland: seed calls 6 → 69, plans
0 → 17, launches 0 → 3) — but the launched parties never re-met their
target. All 3 seedland launches ended holder-died within 2–33 days with
ZERO in-window launched-party meetings. This DIAG decomposes WHY: for
every launch, did the party travel and find the beast, travel and not
find it, or die before it got anywhere — and was the beast even still
there to find? Secondary: do plan instances close when the holder dies,
or linger open (haventick found dead holders' plans lingering in
`winPlan` for the rest of the run)?

## Prior art (read first)

- `evidence/2026-11-16/sim-seedland-b.md` + prereg — the instrument, the
  verbatim 13-line seed call, frozen bar definitions, launched-meeting
  definition (reused verbatim below), and the three launches this arm
  decomposes (Omar Farouk → Algorithm, d71–73; app_mgpsphmd698 → Herald,
  d98–131; Greta Hansen → Suburb, d124–137 — all holder-died, 0 meetings).
- `evidence/2026-11-16/sim-seedpaths-b.md` + prereg — the driver/analyzer
  this arm extends (dawnbid instances, buckets, closeKinds).
- `evidence/2026-11-16/sim-haventick-b.md` — launch closeKinds and the
  post-death-tail finding (dead holders' plans linger in `winPlan`;
  tails up to 101–102 days; the only `delete v.winPlan[vid]` in the code
  is the table-active case, win-plan.js:321 — no death cleanup).
- `evidence/2026-11-16/sim-poolmarginals-b.md` — context (companion pool).
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave law),
  `docs/PARTY.md`.
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  companion-pool seed paths, departure gates, or the pick lottery
  (checked 2026-11-16 by sim-seedpaths-b against the `docs/CANON.md`
  manifest). The evidence file states this gap instead of inventing
  canon.

## The instrument (extend minimally, do not rebuild)

- **Driver:** `scripts/seedpaths-driver-20261116.js`, extended behind an
  env flag `LAUNCHSURVIVE=1` (flag unset = seedpaths/seedland behavior
  byte-identical). `LAUNCHSURVIVE=1` implies the SEEDLAND semantics
  internally (fieldFight watch wave >= 4 + `origin` on encounter rows),
  so a tracker run can never be misconfigured into an unjudgeable
  corpus. The extension adds one per-seed array, `v4launchTrack`: one
  row per live wave-4 plan holder per day, recorded in the daily
  snapshot block alongside `dawnbidCensus` (same population, same
  cadence — end of day, after the policy's daily step):
  `{day, vid, target, needWave, stage, party, holderAlive, holderNode,
  holderExped, holderSick, holderHealth, haven, partyNodes, planNode,
  sightingTile, lastKnownTile, lastKnownSource, targetNearDist,
  targetNearCount, targetAliveCount}`. All fields are pure reads (no
  RNG, no game-state writes):
  - `haven`: the village tile `{nx, ny}` (village px/py, fallback 4,4).
  - `partyNodes`: `{pid: {nx, ny} | null}` for each `plan.party`
    member, read with `Game.npcNode` (same call the census uses).
  - `planNode`: `plan.node` or null (the holder's node at seed time).
  - `sightingTile`: the latest `state.village.monsterSightings[vid]`
    entry with `mid === target` (`{tx, ty, day}`), or null. This is
    the tile where the holder actually fought the target type
    (recorded by `objNoteMonsterSighting` from
    `resolveWildMonsterEncounter`; cap 4 per villager).
  - `lastKnownTile`: the sighting tile when present
    (`{nx: tx, ny: ty}`, source `'sighting'`), else `planNode`
    (source `'planNode'`), else null (source null). Frozen: the
    sighting tile is the party's destination; the plan node is the
    fallback.
  - `targetNearDist`: the minimum Chebyshev distance from any LIVE
    world monster of the target type (`Game.worldMonsters()`, `m.id
    === target`) to `lastKnownTile`; null when there is no live
    monster of that type or no last-known tile. The raw distance is
    recorded so any radius can be re-counted later.
  - `targetNearCount`: live target-type monsters within Chebyshev
    distance <= 2 of `lastKnownTile` (frozen radius R=2); 0 when none
    or no last-known tile.
  - `targetAliveCount`: live world monsters of the target type
    anywhere (audit: is the type extinct that day, or just elsewhere?).
- **Analyzer:** new `scripts/analyze-launchsurvive-a.js`, requiring
  `scripts/analyze-seedland-b.js` (launched-party meetings, verbatim
  definition) and `scripts/analyze-seedpaths-b.js` (instances,
  launches, wall, median). It computes the per-launch classification,
  target persistence, the plan-linger secondary, the guard metric,
  and the judgment. It writes
  `evidence/2026-11-16/launchsurvive-a-analysis.json`. It does not
  copy the seedpaths/seedland driver or analyzer.
- **Proof test:** new `scripts/test-launchsurvive-a.js` — static check
  (seed call present verbatim on the on-tip, absent + `src/` diff 0
  post-revert), judge fixtures (launch-window classification incl.
  each of the six closeKinds, distinct meetings, target-persistence
  yes/no, plan-linger tails), live recorder shape (tracker rows
  present under `LAUNCHSURVIVE=1`, absent when unset), determinism
  D1 (recorder ON twice identical) + D2 (recorder ON vs OFF identical
  trajectories) at 60d on seed 102401. Green on the on-tip AND
  post-revert.

## Frozen definitions

- **Launched instance / launch window / launched-party meeting:**
  verbatim from the seedland prereg. A launched instance is a
  seedpaths instance whose bucket is `launched` (dawnbid `resolved`
  outcome `launched`). Launch day = the resolved entry's `day`;
  companion = its `companion`; close day = the instance's `closeDay`
  (null = still open at the final day). A launched-party wave-4+
  meeting is a `v4encounters` row with wave >= 4, origin
  `expedition`, whose `vid` is the launched instance's holder or its
  resolved companion, whose `mid` equals the instance's target, and
  whose `day` falls in `[launchDay, closeDay || finalDay]`. Distinct
  meetings are keyed `seed|vid|day|mid`.
- **Launch classification (frozen precedence, exactly one class per
  launch):**
  1. `traveled-and-found` — >= 1 in-window launched-party meeting.
  2. `still-open` — no meeting AND `closeDay == null` (instance still
     open at the final day).
  3. `died-en-route` — no meeting, holder died in the window, AND the
     holder was on expedition (`holderExped` true) or away from the
     Haven tile on the death day (tracker row of the death day, or
     the last alive day's row when the death-day row is missing).
  4. `stayed-home-died` — no meeting, holder died in the window, AND
     the holder was never on expedition in the window AND the holder
     node equals the Haven tile on every window tracker row.
  5. `died-at-home-other` — no meeting, holder died in the window,
     AND neither (3) nor (4) (died at home after having traveled at
     least once in the window — e.g. returned home, then died
     defending the door).
  6. `traveled-not-found` — no meeting, holder alive at `closeDay`,
     plan closed another way (retarget / plan-deleted).
  Precedence is part of the definition: a meeting beats still-open;
  still-open beats the death classes; a death beats
  traveled-not-found. Every launch falls in exactly one class: any
  launch is either (a) with a meeting, (b) still open, (c) holder
  died in-window (one of the three death classes, which partition
  died holders by died-away vs died-home × traveled-before), or (d)
  alive + closed + no meeting.
- **Holder death day / cause / place:** death day = the first window
  tracker day with `holderAlive` false (the census's own method, as
  in dawnbid's close logic); if no tracker row shows the holder
  dead but a death-log row exists for the holder in the window, that
  row's day is used instead. Cause = the death-log row for the holder
  (`kind` `villager` or `person`, `who` === holder vid) in the
  window — `cause` as recorded, or `'unknown (no death-log row)'`
  when no row exists. Place = the holder node on the death day's
  tracker row (or the last alive day's row): `'haven'` when it
  equals the Haven tile, else `'away'` with the node.
- **Target persistence (per launch):** `yes` when `targetNearCount >=
  1` on >= 1 window day (a beast of the target type within Chebyshev
  distance 2 of the last-known tile); `no` otherwise. Also reported:
  persistent days (count of window days with `targetNearCount >= 1`),
  minimum `targetNearDist` over the window (null when the type was
  never alive near anywhere), and the last-known source
  (`sighting` / `planNode` / none).
- **Plan-linger secondary (per leg):** for every instance (launched
  or not) with `closeKind === 'holder-died'`: `postDeathTailDays` =
  the count of census/tracker rows for that vid+target after
  `closeDay` with `holderAlive` false; `planLingers` = tail > 0.
  Reported: share of holder-died instances whose plan lingers, and
  the median tail. NOTE (frozen): the dawnbid `closeDay` IS the
  first holder-dead census day by construction, so "the instance
  closes when the holder dies" is true in the instance frame by
  construction and is NOT what this measures — the measure is
  whether the plan ENTRY stays in `winPlan` afterwards (census rows
  keep coming for a dead holder), which is the haventick finding.
- **Guard metric (reported, not judged):** expedition deaths +
  total village deaths per leg. Expedition deaths = death-log rows
  with `cause === 'expedition'` (seedland: 98 control → 189 on,
  deaths/run 76.5 → 90). Total deaths = death-log row count per leg.
- **Wall numbers** (reported every run, not judged): national by
  standing >= 200 AND by scaleRank, table (seat taken), wins, wave-4
  unlocks, wave-5 unlocks, median survival — from the seedpaths
  analyzer's `wall` + `medianSurvival`.

## Primary metric + GO bars (frozen — all five must pass for GO)

Primary metric: **share of launches with >= 1 in-window
launched-party meeting** (seedland: 0/3).

1. **Instrument valid:** 8/8 corpora parse per leg, 0 instrument
   errors, attribution coverage >= 0.90 on each leg.
2. **Power:** >= 3 launches observed on the on-leg. If fewer, the
   DIAG is under-powered: report NO-GO on power (like tricklearn)
   and do NOT re-scope the bar.
3. **Classification complete:** every launch classified into exactly
   one of the six classes (unclassified == 0), with
   target-persistence (yes/no) measured for every launch.
4. **Proof green:** `scripts/test-launchsurvive-a.js` green on the
   instrument tip AND in the post-revert shape.
5. **Determinism:** D1/D2 green (proof test, 60d, seed 102401) and
   the D3 drift smoke clean (legs diverge only after the first
   world-tick seed fires on the on-leg).

## Legs

- **Control leg:** this base as-is (seed call ABSENT, gate fix
  present). `MODE=control`, `RUN=launchsurvive-a`.
- **On leg:** base + the verbatim 13-line VETPARTY seed-call block
  from the seedland prereg (blob `a66d45a5e`, in
  `resolveWildMonsterEncounter` before
  `if (rec.outcome === 'alreadyDead') {`, line 20935 on this base —
  re-located fresh; lines drift). `MODE=on`, `RUN=launchsurvive-a`.
- Identical seeds, policy, horizon, driver, analyzer on both legs.
  The ONLY difference between legs is the 13-line seed call. Both
  legs run with `SEEDLAND=1 LAUNCHSURVIVE=1`.

## Gate-fix verification (pre-condition, verified before this commit)

The PROFILEGATE bypass (`ed542bba4`, 18 lines in
`src/js/villager-agency.js` depart path) is present on this base,
verbatim: `grep PROFILEGATE` hits `src/js/villager-agency.js:383`,
and the block matches the seedland prereg's description (bid-and-
selected `party_launch` commit bypasses the wanderer/explorer
profile skip only; all other launch conditions still apply). If it
had been absent this arm would have stopped here. It is present.

## Horizon, policy, seeds, determinism

- **Seeds:** 102401–102408 (8-seed pilot ONLY; no 12–16 seed confirm
  — this is a DIAG, and bar 2 is the power bar).
- **Seed freshness (re-verified by this worker, recorded here):**
  zero hits for `10240[1-8]` in any prereg
  (`evidence/2026-11-14|15|16/sim-*-prereg.md`), the convergence
  tracker (`grep -c "10240"` = 0), `scripts/` (no file), `~/memory/`
  (no file), per-seed filenames (`ls evidence/2026-11-16/ | grep
  10240` = 0), or evidence `.md` files (Nov 15/16, no hits). The
  coordinator's note matches: the 102401 hits in `evidence/` are
  incidental kcal/pantry numbers in corpora only, not seed namings.
  The band is fresh.
- **Horizon:** 150d, death-aware (dead villages stop simulating;
  +10d tail max, per docs/MEASUREMENT.md).
- **Policy:** competent verbatim (`scripts/policies/competent.js`,
  sha256 `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
  — verified with sha256sum before this commit; same sha as
  seedpaths / seedland preregs; the geared-scholar-with-party policy
  — never a fresh un-geared solo scholar).
- **Determinism:** D1/D2 as in the seedland proof (same shape, seed
  102401, 60d). D3 drift smoke: first divergence day vs first
  world-tick seed day per seed, reported in the evidence file.
- **Telemetry deviation check:** after writing evidence, run
  `node scripts/telemetry-check.js` per the loop body; recorder
  corpora are expected to be refused (seedpaths/seedland precedent)
  — record the refusal, do not work around it (no
  `--allow-recorder-corpus`, no `--update-baseline`).
- **Balanced panel (§15):** none for this DIAG (poolmarginals
  precedent: the panel measures a lever's effect; this arm ships no
  game change — the seed call is reverted and the instrument is
  observation-only; the neutrality proof D1/D2/D3 is the substitute).

## Commit sequence (frozen order)

1. This prereg (this commit).
2. Instrument: driver extension (`LAUNCHSURVIVE=1`) + analyzer +
   proof test.
3. The seed call (13 lines, verbatim) — its own commit.
4. Judged pilot: control leg, then on leg, 8 seeds each.
5. Evidence + analysis + corpora; then REVERT the seed call
   (`src/` diff 0 vs base) and re-run the proof post-revert.

## Metric review (to be filled in the evidence file)

- Whether the sighting-tile vs plan-node last-known source changes
  any launch's persistence verdict (re-count at the other source).
- Whether the frozen radius R=2 turns any launch's persistence
  verdict (report the window minimum `targetNearDist` per launch so
  the radius sensitivity is visible).
- Whether any launch's death class turns on the death-day row
  (death-day tracker row missing — fell back to the last alive day).
- Whether any launched instance's plan lingers after the holder's
  death (post-death tail > 0), and whether the instance frame or
  the plan-entry frame is the honest one for "plans close on death".
