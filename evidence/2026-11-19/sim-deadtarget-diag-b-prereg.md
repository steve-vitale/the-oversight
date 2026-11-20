# sim-deadtarget-diag-b — FROZEN prereg (Loop B 0030Z run, arm sim-deadtarget-diag-b)

**Frozen:** 2026-11-20 ~01:07 UTC, BEFORE any judged sim. Base master
`1cb6ce2e1` (origin/master at rebase time). Branch
`sim-deadtarget-diag-b`.
**Diagnostic:** instrument-only — ZERO `src/js` game-code changes.
The instrument is a renamed driver copy + a new analyzer in
`scripts/` (pure reads of the plan store and the fight record);
the game is untouched. If the diag finds no liveness check, do
NOT build the fix in this arm — report the fix as the next arm.

## The question (finding #2617)

Does the plan store re-check target liveness (or recent
sightings) before a launch departs? Finding #2617 (measured by
sim-dmgshape-rerun-b on band 106081–106088): 4/8 launches
re-launched a target TYPE whose last fight predated the launch
— 106081 d115 + d117 app_mgpspho1903 → herald (last herald
fight d114, the kill); 106084 d136 + d141 visjoin_114 → herald
(last herald fight d126, the kill). Both holders re-launched
twice against a target type nobody fought again for the rest
of the run. The plan store holds a target past its death; the
launch system does not check target liveness before departure.

## Code answer (read BEFORE freezing; the instrument must confirm it behaviorally)

Read in `src/js/win-plan.js` on this base:

- `winPlanDepart` (lines 658–810) is the departure gate. It
  checks stage, gear (`gearOf`, `villagerGearUp`), companion
  willingness/launchability (`findCompanion` +
  `companionLaunchable`), the `PARTY_WAIT_DAYS` hold and the
  `VETERAN_GUARD_DAYS` hold. `launchParty()` (lines 668–775)
  walks to `plan.node` (a fixed tile) or a fresh ranging
  target; `plan.target` is copied onto the companions' plans
  (lines 760, 764, 769) and never validated. **No read of
  `villageSlain`, no read of monster sightings, no recency or
  liveness check exists anywhere on the departure path.**
- `plan.target` is written in exactly one place,
  `winPlanSeedFromFight` (line 515), and copied at launch;
  there is NO `plan.target = null` / `plan.node = null`
  anywhere in `win-plan.js` — the target is never cleared.
- `winPlanNoteKill` (lines 536–553): a kill advances a
  hunt/party plan to stage `'standing'` — target and node
  untouched. Stage `'standing'` still launches: the branch at
  line 796 sends `'party' | 'hunt' | 'standing' | 'table'`
  all through `launchParty()`. That is the #2617 shape in
  code: kill → standing → re-launch against the same dead
  target and the same node.
- `winPlanFightGate` (lines 944–1010, the fight gate, not the
  departure gate): SEEK matches `plan.target` by id OR any
  wave match when stage is `'standing'` (`plan.stage ===
  'standing' && wave >= 3`) — also no liveness check.
  Reported for completeness; the departure gate is the
  question.
- The knowledge channel the gate COULD consult exists:
  `state.villageSlain[type]` (game.js lines 35192, 35423;
  read for engagement seeding at win-plan.js line 598) —
  the fire tells the village when a type is slain
  (MONSTER-WAVES.md: 1+ slain unlocks the beasttricks topic).
  The departure gate does not consult it.
- Canon: docs/MONSTER-WAVES.md (wave law, wave-4/5 gates,
  readiness bars, villageSlain teaching channel) and
  docs/CANON.md were read first. No canon doc covers a
  departure liveness gate — there is none to invent from.

## Substrate (frozen)

- Flags: SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 — the CURRENT LANDED substrate. NO ALLYSLOT3
  (the ported slot commit `735fce64f` MUST NEVER MERGE and is
  NOT re-introduced here; the leg stops if ALLYSLOT3=1).
  NO LAUNCHSURVIVE (no tracker rows; policy/env only).
- **Base difference (recorded):** the coordinator registered
  this branch on master `8bd330f22` (journey-establishment
  r244). Master moved before the judged sims, so per the
  brief the branch was rebased onto origin/master
  `1cb6ce2e1` (a batch-ship version bump on top of
  `8bd330f22`). `git diff 8bd330f22 HEAD -- src/js` is one
  line in `src/js/build.js` (the version stamp) — no game-code
  difference. Journey-endgame r249 (`af7fddfc4`) is already
  an ancestor of `8bd330f22`, so it is in both bases.
- **Policy:** `scripts/policies/competent.js` sha256 first-12
  `150229eda010` — UNCHANGED since the dmgshape-rerun leg
  (same sha as that leg's prereg). The judged leg runs the
  CURRENT policy verbatim.
- Horizon: 150d, death-aware (dead villages stop, +10d tail
  max). Why 150d: the #2617 launches happened on days
  115–141 — a shorter horizon would cut the re-launch
  window; 150d is the same horizon that measured the
  finding.
- Policies: competent verbatim only.
- Seeds: **106081–106088, the FULL designated band, never a
  subset.** Deliberate same-band reproduction of #2617
  (same deterministic population, different question:
  departure gate, not damage).

## Seed-band freshness (per local_seed_band_freshness)

- Search scope: EVERY dated prereg under `evidence/`
  matching `evidence/*/sim-*-prereg.md` (1037 files), plus
  all `*.md` under `evidence/` naming the band.
- Result: the band is named in 4 preregs —
  `sim-launchfunnel-b-prereg.md` (the designating survey;
  bands 106051–106058, 106061–106068, 106071–106078,
  106081–106088), `sim-partysurvive-rerun-b-prereg.md`
  (judged re-use), `sim-dmgshape-rerun-b-prereg.md` (judged
  re-use; the leg that measured #2617),
  `sim-rageholder-survey-b-prereg.md` (line 85 only: names
  the band in a list of launchfunnel-b survey bands — a
  cross-reference, not a judged use).
- Verdict: the band is USED, and re-used here DELIBERATELY
  as same-band reproduction of #2617 under the current
  landed substrate. The re-use is the point: if the
  dead-target pattern does not reproduce, the substrate
  difference (landed substrate, no ALLYSLOT3 port, current
  policy) is the cause candidate — do not force
  reproduction.

## Judged population (frozen)

**Launches:** `v4departs` rows with `result: 'launch'`,
`targetWave >= 4`, `target` non-null — the survey's
counting, all party sizes. Dedupe by
`(seed, vid, day, target)`, keeping the first row: the
driver wraps both `winPlanDepart` and
`vbrainExecuteDepart`, and the dmgshape-rerun prereg
verified 0 duplicates on the partysurvive-rerun corpus —
but if the two wraps ever double-fire for one departure,
the dedupe is the rule and the duplicate count is
reported (expect 0).

**Departure-gate snapshot (the instrument):** at each
launch (and hold) the driver records, BEFORE the
departure call: `stageBefore` (the plan stage the launch
departed from — `'party'` = first launch, `'hunt'` =
re-launch while hunting, `'standing'` = post-kill
re-launch, `'table'` = veteran), `plan.node` (the tile
the party walks to), `plan.sinceDay`,
`villageSlain[target]` (the village's told kill count for
the target type at departure — the knowledge the gate
could have consulted), and from the encounters recorded
so far with `day < launch.day` (a dawn gate cannot see
the day's fights yet): `lastFightDay` /
`lastFightKill` / `lastFightOutcome` / `daysSinceLastFight`
(the last FOUGHT encounter of the target type: `rounds > 0`
or `mDealt > 0` — an evade is a sighting, not a fight) and
`lastSightingDay` / `daysSinceLastSighting` (the last
encounter of the type, fought or evaded — the monster was
seen alive).

**Classification (frozen, by the last pre-launch FOUGHT
encounter of the target type, `day < launch.day`):**

- **dead** — a fought encounter of the target type exists
  before the launch day AND its outcome was `vKill`.
- **live** — a fought encounter exists before the launch
  day AND its outcome was not `vKill` (the type was fought
  and survived).
- **unknown** — no fought encounter of the target type
  exists before the launch day.
- Every launch falls in exactly one class, so
  classified == launches by construction. The
  classification bar is classified / launches = 1.000.
- Type, not instance: the recorder carries no monster
  instance id — "the target type" is the species id, the
  same matching the #2617 measurement used. A kill of one
  herald does not prove every herald is dead; the class
  names the TYPE's last fight, and the evidence names the
  type beside every launch so this stays auditable.
- Day granularity: a same-day fight may precede the launch
  within the day; the frozen rule counts only `day <
  launch.day` as "before" (the dawn-gate rule — the
  departure call runs at dawn, before the day's fights).
  Same-day first-fights after a launch are reported
  separately under the dmgshape 21-day convention and
  flagged in the per-launch table.

## Primary metric (BINDING, §14)

**Dead-target share = dead launches / all launches.**

- Reproduction reference (REPORTED, not a GO bar):
  #2617 measured 4/8 = 0.50 dead-target under the
  ALLYSLOT3-ported substrate. This diag re-measures under
  the landed substrate; the share is reported either way.
  The question is the MECHANISM (does a check exist, and
  what does the population show), so non-reproduction is
  itself an answer — with the substrate difference as the
  cause candidate — not a failure to be forced.
- **POOL FLOOR (binding precondition): ≥4 launches.**
  Fewer → NO-GO kind METRIC-BROKEN. Report the pool size
  and stop; do not force it.
- **DIAG-GO requires ALL of:** pool floor met (≥4
  launches) + classification complete (classified /
  launches = 1.000) + code answer named (check
  present/absent, and where) + 0 instrument errors +
  8/8 files. A miss is NO-GO, never re-scored against a
  friendlier metric.
- **NO-GO INSTRUMENT:** instrument errors > 0 or files < 8.

## Secondary (REPORTED, not binding)

- Per-seed launch map: launches, dead / live / unknown,
  stageBefore distribution, villageSlain[target] at each
  departure.
- First fight after each launch (dmgshape 21-day window,
  any origin, any fighter) for context — did the launched
  party (or anyone) meet the target afterwards?
- Rest-of-run refights: for each dead-target launch, did
  anyone fight the target type again before the run ended
  (the #2617 "nobody fought again" shape)?
- Wall numbers (national / table / wins, wave 4–5
  unlocks, median survival, community loss, standing ≥200,
  standing-199 count) reported every run and compared
  against sim-dmgshape-rerun-b's wall on the SAME band as
  the reproducibility reference (the substrate moved since
  that leg — no ALLYSLOT3 port now; the comparison is
  descriptive, never a lever before/after).

## Design

- Driver: `scripts/deadtarget-driver-b.js` — a copy of
  `scripts/dmgshape-rerun-driver-b.js` with ONLY these
  changes: header comment, `arm` string
  `deadtarget-diag-b`, default RUN `deadtarget-diag-b`,
  default OUTDIR `perseed-deadtarget-diag-b`, corpus file
  prefix `deadtarget-diag-b-s<seed>`; MODE guard
  `MODE=deadtarget`; substrate assertions SENSEEXPED,
  PARTYSIZE4, VETREENGAGE, FLEEREPAIR2, FIGHTALLY2 = 1 and
  ALLYSLOT3 UNSET (leg stops if ALLYSLOT3=1 — landed
  substrate only); LAUNCHSURVIVE off (no `v4launchTrack`
  key); the departure-gate snapshot added to both
  `v4departs` wraps (see "Departure-gate snapshot"
  above). All other recorder logic is byte-identical in
  behavior. Corpus:
  `evidence/2026-11-19/perseed-deadtarget-diag-b/` (8 files).
- Analyzer: `scripts/analyze-deadtarget-b.js` — launch
  extraction (survey counting + dedupe) + last-fight
  classification (frozen above) + judge + wall via
  `analyze-fightcap-b.js` `summarizeLeg`. `--selftest`
  covers: classification fixtures (dead / live / unknown,
  kill-then-refight ordering, same-day exclusion, evade
  as sighting-not-fight, shared target type across two
  launches, no-encounter seed), dedupe (two wraps, one
  departure), and judge fixtures (GO shape, pool floor
  fail → METRIC-BROKEN, classification < 1.000 → NO-GO,
  instrument errors → INSTRUMENT).
- Proof test: `scripts/test-deadtarget-diag-b.js` —
  code-answer assertions (no liveness read in
  `winPlanDepart`; no `plan.target = null` in win-plan.js;
  `'standing'` still launches), analyzer selftest, and a
  live 30d driver smoke on one designated seed (exit 0, 0
  instrument errors, flags self-describing, gate snapshot
  present on any launch rows). Mirrors
  `test-dmgshape-rerun-b.js`.
- Panel: `scripts/balance-panel.js` compare of this
  corpus against the dmgshape-rerun-b corpus as a
  same-band reproducibility reference (NOT a lever
  before/after) via a re-pointed panel builder; if the
  tool refuses the unpaired comparison, record the
  refusal verbatim and report wall numbers directly
  (dmgshape-rerun-b §4 precedent).
- Telemetry: `node scripts/telemetry-check.js --baseline
  <scale-wall.json> --current 'evidence/2026-11-19/
  perseed-deadtarget-diag-b/*.json' --metrics
  national,table,wins,exiled`; if it refuses recorder
  corpora, record the refusal verbatim and report wall
  numbers directly.

## Fixture (encounter-gear rule, Steve 2026-11-13)

No staged fixture: the corpus is live launches from the
competent policy on the designated band. The analyzer's
synthetic selftest stages its own rows, not live fights.

## Metric review (for the NEXT run — this run is judged as frozen)

- The dead-target class prices the TYPE's last fight, not
  the individual's death: a killed herald and a live
  herald of the same type are indistinguishable in this
  corpus (no instance id). If the fix arm ever needs
  instance-level liveness, the recorder must carry an
  instance id first — that is a recorder change, not a
  re-score of this diag.
- The `live` class is weak evidence of liveness: a
  non-kill fight 30 days before the launch does not prove
  the type still walks. The class means "last seen alive
  in a fight" and the table carries days-since so a reader
  can see how stale that sighting is. A future gate
  design (recency window) would need the days-since
  distribution this diag reports.
- `villageSlain[target]` is the village's TOLD knowledge
  (the fire), not the holder's own knowledge — a holder
  who never heard the kill tale would still depart
  honestly. The snapshot records the village count; the
  holder's own knowledge is a separate question for the
  fix arm (perception-first: what the holder saw/heard).
- The pool floor (≥4 launches) is priced from the
  dmgshape-rerun leg's 8 launches on this band under the
  ported substrate. The landed substrate may deliver
  fewer (finding #2616: designation does not survive a
  substrate move). If the floor binds, the verdict kind
  is METRIC-BROKEN and the headline is the launch count
  the band actually delivers under the landed substrate.
- The panel compare is expected to refuse (unmatched
  origin — the two corpora carry different RUN labels).
  It is attempted anyway so the refusal is on the record;
  the reproducibility reference is the direct wall-number
  comparison against dmgshape-rerun-b on the same band.
