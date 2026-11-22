# sim-homebody-a — PREREG (frozen)

**Arm:** sim-homebody-a · **Loop A run:** fleshout-20261122T2115Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** #2498/#2568
(the homebody-holder launch-attempt wall; findings #1409 steve-call and
#1417 sizing in the backlog)
**Type:** LEVER (one game-code change + instrument, two-leg contrast:
ctl vs armed)
**Base master:** `f2d03db92` (worktree
`~/workspace/worktrees/sim-homebody-a`, branch `sim-homebody-a`)
**Frozen:** 2026-11-22 ~21:35 UTC, before any judged run. No judged
run has run.

## 0. Name collisions (frozen, read first)

- The slug `sim-homebody-a` was used once before, 2026-10-29, as a
  MEASUREMENT-ONLY arm (DIAG-GO, homebody block sized 2/19, finding
  #1417; evidence `evidence/2026-10-29/sim-homebody-a.md`). This run
  is the BUILD arm on the same blank. The evidence file
  `evidence/2026-11-22/sim-homebody-a.md` does not collide (dated
  directory differs).
- `scripts/test-homebody-a.js` already exists: the Oct-29 census
  analyzer (measurement only, still referenced by its evidence).
  It is NOT overwritten. This arm's proof test is
  `scripts/test-homebody-handoff-a.js`, the driver is
  `scripts/homebody-driver-a.js`, the analyzer is
  `scripts/analyze-homebody-a.js`, the panel builder is
  `scripts/build-homebody-panels-a.js`. RUN=`homebody-a`,
  OUTDIR `perseed-homebody-a-<mode>`.

## 1. The question

sim-needwave-a §6 (control leg, band 107375–107382): seed 107380 —
Dale Hoffman held a wave-4 strike plan (wave 4) from day 86 to day
150, got 41 dawn commits to launch with companions picked, and held
all 41 — he is a homebody, and `startExpedition` refuses him at the
range check (`villager-agency.js`: `if (maxD < 1) return;`).
Armed, armored, healthy, at Haven — and never leaves. The question:
does handing a range-0 holder's wave-4+ plan to a walkable
companion at depart time convert held dawn commits into real
wave-4+ departures, without starving the village harder or
shortening survival?

## 2. The call (frozen — made by this arm, Steve can overrule)

**HANDOFF, not bid-block.** At depart time, when a range-0 holder's
`party_launch` commit fails to leave Haven, the plan moves to the
first walkable companion on the commit, who leads the party out on
the same shared target; the old holder's plan entry is deleted
(they can re-seed a plan from a lived fight); the handoff speaks
one line. If no walkable companion can depart, the hold stands.

Why handoff over bid-block:
- A bid-block alone cannot move the frozen primary metric: it
  produces zero additional departures — the plan would sit with
  nobody holding it (plans are per-holder; nobody else can pick
  one up), and the village's intent (armed, armored, companions
  picked) would be discarded with the holder.
- The handoff preserves the village's intent: the plan was real,
  only the leader couldn't walk. Moving leadership to a walker is
  what people do.
- Constraint honored (finding #1409, steve-call): the homebody is
  NEVER offered a hunt and never walks. The plan moves; the person
  stays home. The holder-voice line (sim-holdervoice-b, #2505)
  already says so once per (holder, companion) pair at bid time;
  the handoff line says the transfer at depart time.

Scope (frozen): the handoff fires ONLY for wave-4+ plans —
`plan.needWave >= 4` OR the plan's target is a wave-4+ species
(`monsterWaveOf`, win-plan.js). A range-0 holder with a wave-3 or
targetless plan keeps holding: out of scope for this arm, and the
wall this arm attacks is the wave-4+ launch wall. A wave-4+
launch is at most a trio through a handoff (leader + the two
remaining commit companions); no quad pin fires, by construction.

## 3. Code-read priors (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read; docs/MONSTER-WAVES.md read (wave
  gates, readiness bars). **No canon doc covers who leads a
  wave-4+ villager party or what happens when the holder cannot
  walk** — said here rather than inventing canon. The rule below
  is code-derived.
- **The live depart site is `vbrainExecuteDepart`
  (villager-brain.js).** `agencyTick` routes departures through
  it whenever `vbrainOwnsDawn()` is true, which is unconditional;
  `winPlanDepart` (win-plan.js) never fires in sims (needwave-a:
  33/33 launches from the brain path). The handoff is implemented
  ONCE as a shared Game method `winPlanHomebodyHandoff` in
  win-plan.js, called from BOTH sites for parity — the brain path
  is the judged one, the win-plan path is the dead-path guard
  (it still matters if `vbrainOwnsDawn` ever becomes conditional).
- **The hold shape (brain path).** `vbrainExecuteDepart` calls
  `this.startExpedition(vid, ...)`; for a range-0 holder that
  returns early at the `maxD < 1` check with no exped record and
  no voice at depart time; the `if (!a2 || !a2.exped[vid]) return
  'hold'` line then strands the plan. The holder re-bids at the
  next dawn and holds again — 41 times on seed 107380.
- **The companions are walkable by construction on this
  substrate.** The first companion comes from `findCompanion`
  (profile wanderer/explorer unless PROFILEGATE4 opens it —
  PROFILEGATE4 is not in the substrate); companion2/3 come from
  `extraCompanionScan`, which excludes `npcMaxDist < 1`. The
  handoff still checks `maxD >= 1` per candidate and lets
  `startExpedition` itself be the honest judge (sick / hurt /
  medic-duty / companion-guard all return early with no exped
  record); the first candidate who actually departs becomes the
  new leader.
- **The transfer is a key move, not a copy.** `v.winPlan[newLeader]
  = plan; delete v.winPlan[vid];` — the plan object survives
  under the new leader; the old holder holds nothing and can
  re-seed from a lived fight (`winPlanSeedFromFight`). The
  transferred plan keeps stage/target/node/needWave; stage is
  set to `'hunt'` and `party` to the departed companions (leader
  excluded, mirroring the normal path where `party` lists
  companions and the holder is implied). Companions' plans get
  the same stage/party/target/node/needWave sync the normal path
  does. Counters: `partyDepartures` once, `partyTrios` when the
  party is leader + 2 (a trio); `partyQuads` never; `pinQuadParty`
  never. A new stat `homebodyHandoffs` is bumped per handoff.
- **The beat fires with the new leader.** `winPlanDepartLaunchBeat
  (newLeader, launchedOthers)` reads the transferred plan, so the
  ordinary departure beat speaks ("Maya sets out with … — the
  fire marks the trail."). LAUNCHVOICE r268 removed the wave-4+
  gate on the beat, so it speaks for every real departure. The
  handoff line is spoken BEFORE the beat, once per handoff: the
  plan moves, so it cannot repeat for the same plan.
- **Det-gate safety (read-only before the divergence).** Before
  any handoff, the inserted code is pure reads (`npcMaxDist`,
  plan read) plus the same `startExpedition` call the control
  leg makes — no RNG consumed, no state written. The first
  handoff day is the divergence bound; event streams before it
  must be byte-identical between legs (bar 2).
- **The forager dawn choke is NOT this arm.** A sibling arm owns
  non-ranger reach at dawn; this arm touches only the range-0
  block at depart time.

## 4. Band freshness (local_seed_band_freshness skill)

- **Band: 107423–107430 (8 seeds).** Verified before this prereg
  (re-run by this arm, not taken from the coordinator's check):
  `rg -n "107423|...|107430" evidence/ --glob 'sim-*-prereg.md'
  --glob 'sim-*.md'` — **0 hits**; `grep` over
  `~/memory/*.md` and the findings backlog — **0 hits**;
  evidence filenames under `evidence/2026-11-22/` — **0 hits**.
- **Nearest used bands, all excluded:** 107375–107382
  (sim-needwave-a), 107383–107390 (sim-launchfield-refreeze-b),
  107391–107398 (sim-needwave-b, GO landed), 107399–107406
  (sim-launchfield-rejudge-b screen B1), 107407–107414
  (rejudge-b screen B2), 107415–107422 (rejudge-b judged band).
  Forbidden bands from prior briefs (106751–106766,
  107221–107228, 107191–107198, 107131–107138, 107111–107118,
  107091–107098, 107081–107088, 107051–107058, 107021–107028)
  do not overlap it either.
- **No collision; no shift needed.**

## 5. Instrument (frozen design)

- `scripts/homebody-driver-a.js`: a COPY of
  `scripts/needwave-driver-b.js` (wipe-aware) reused with its
  wraps intact (contest prizes, kill-loot, fieldFight volleys,
  alienLootGrant, corpse takes, daily `v4gunLoc` gun census,
  `winPlanDepart` + `vbrainExecuteDepart` departs, `fieldFight`
  wave-4+ fights, `winPlanSeedFromFight` seeds, daily `planCensus`,
  `needWaveCopies` wipe-aware, `departBeats`, `beatLines`) PLUS
  homebody wraps (pure reads + driver-local writes; every game
  function runs exactly once, untouched):
  - `handoffs`: a wrap on `winPlanHomebodyHandoff` (installed
    ONLY when the method exists — on the ctl leg it does not,
    so the stream is empty by construction and NO instrument
    error is recorded for its absence). A row is `{day,
    oldHolder, oldHolderProfile, oldHolderMaxD, newLeader,
    target, needWave, party, result}` — `result` is the
    method's return (`'launch'` / `'hold'` / `'skip'`).
  - `handoffLines`: the say wrap ALSO matches the handoff line
    (`/takes the plan and leads the party/`) into `beatLines`
    alongside the departure-beat lines, so the sense-test
    quotes the transfer verbatim.
  - In the handoff wrap, a successful launch ALSO pushes a
    `v4departs` row `{day, vid: newLeader, source: 'handoff',
    result: 'launch', ...}` — the primary metric counts
    launches from every source, and the old holder's own
    depart wrap records no row after a transfer (their plan
    entry is gone), so a converted launch is counted exactly
    once, under its new leader.
  - `attrsOf` gains a `maxD` field (recorder-only addition) so
    the analyzer can classify range-0 holders without inferring
    from profile.
  - **RUN id / OUTDIR (frozen choice):** `RUN=homebody-a`,
    OUTDIR `perseed-homebody-a-<mode>` (`ctl` / `arm`). The
    driver writes under `evidence/2026-11-22/<OUTDIR>`.
  - **Two legs:** MODE=ctl (old code — runs BEFORE the
    game-code commit) and MODE=arm (new code — runs AFTER it).
    Same driver, same substrate, identical seeds; the per-seed
    JSON's `anchorCommit` + `winplanSha`/`brainSha` prove which
    code each leg ran on.
  - **Parallelism:** each leg runs as 2 detached processes (4
    seeds each), same RUN/OUTDIR — per-seed filenames never
    collide.
- New analyzer `scripts/analyze-homebody-a.js`: reads both legs'
  per-seed JSONs and emits the judged metrics, the det-gate
  verdict, and the wall numbers;
  `node scripts/analyze-homebody-a.js --ctl <dir> --arm <dir>
  --out <file>`; `--selftest` runs the staged checks.
- Proof test `scripts/test-homebody-handoff-a.js`: staged
  fixtures driving the REAL `winPlanDepart` AND the REAL
  `vbrainExecuteDepart` (needwave-a fixture shape, holder +
  companions with pre-existing plans) — asserts the plan moves
  to the new leader, the party departs, the handoff line speaks
  and the departure beat speaks on new code, and asserts the old
  code holds with nobody departing via `--old-code` child mode
  against `git show` of the branch base tip
  (`f2d03db92`). 100% required before the band; the test MUST
  fail on old code (the handoff assertions) and pass on new
  code. Fixture staged at encounter gear — a geared party
  (armed + armored holder and companions), never a fresh
  un-geared solo scholar.
- Panel builder `scripts/build-homebody-panels-a.js` (cloned from
  `build-needwave-panels-b.js`): builds the §15 balanced-panel
  before/after JSONs from the paired corpora (case identity is
  the seed); `node scripts/balance-panel.js compare` is run and
  its compare `.md` attached to the evidence file. The panel is
  the instrument, the frozen bars below are the judge.

## 6. Definitions (frozen)

- **Wave-4+ launch:** a `v4departs` row with result `launch`
  and (plan.needWave ≥ 4 OR plan.target a wave-4+ species) — the
  OR definition from leadgate-a §8 (a companion sync can still
  drop needWave on a wave-4-target plan; the needwave-b guarded
  copy is on this base, but the OR definition is kept).
- **Wave-4+ departure attempts (PRIMARY):** the COUNT of
  wave-4+ launches (above) across the 8 seeds. "Attempts" here
  means launches attempted-and-made: a hold is a failed attempt
  and is counted separately as a hold, never as a launch — a
  converted plan stops re-bidding, so counting attempts as
  launches+holds would punish the lever for succeeding.
- **Dale-class conversion:** a `handoffs` row with result
  `'launch'` whose `oldHolderMaxD` is 0. (The row IS the
  Dale class: a range-0 holder whose wave-4+ plan departs under
  a new leader. The analyzer also reports the hold-days of each
  converted plan from the census — days the old holder held it
  before the handoff — as color, not as a bar.)
- **Selected-blocked share (reported, not judged):** on the
  CONTROL leg, wave-4+ `party_launch` depart rows (brain source)
  with result `'hold'` whose holder profile is `homebody`
  (first-block = holder range-0), divided by all control-leg
  wave-4+ depart rows. Other hold reasons are listed as observed
  (sick / hurt / other), not classified further.
- **Starvation death:** a `deaths` row whose kind or cause matches
  /starv|hunger/i. (The analyzer lists the actual kind strings
  seen on the corpus; if none match, the guardrail is reported
  as unmeasurable, never faked.)
- **Median survival:** median of per-seed `gameDays` (analyzer
  gameDays, as in leadgate-a).
- **First-handoff day (det-gate bound):** per seed, the earliest
  `handoffs` day on the armed leg. The ctl leg must record zero
  handoff rows on all 8 seeds.
- **Fixture:** competent policy verbatim
  (`scripts/policies/competent.js`) — the leadgate-a baseline
  shape: the scholar is driven by the competent policy, geared
  and fighting with a party as the policy drives (encounter-gear
  fixture per the arm brief; a staged fixture that does not match
  encounter gear would invalidate the verdict). Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`;
  `LEND` unset; `PRESENCE` unset; `KILLBUNDLE` unset; `HPGATE`
  unset; `PINQUAD` unset; `PROFILEGATE4` unset.

## 7. Frozen bars (judge: the analyzer on the full band)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — leadgate proof test 33/33-equivalent re-run on this base (killlootbundle proof + analyzer selftest re-run); homebody proof test 100% (fails on old code, passes on new); homebody analyzer `--selftest` 100%; 0 instrument errors on all 16 seed files (8 ctl + 8 arm) | all must hold |
| 2 | **Det-gate** — ctl leg records 0 `handoffs` rows on all 8 seeds; for each seed, every recorded event stream (`v4departs`, `planSeeds`, `v4fights`, `volleyEvents`, `prizeEvents`, `grantEvents`, `contestEvents`, `deaths`, `needWaveCopies`) is byte-identical between legs for rows with day < the armed leg's first-handoff day; the first divergence is on/after that day | all must hold |
| 3 | **PRIMARY — wave-4+ launches** — armed ≥ control + 4 on identical seeds | must hold for GO |
| 4 | **PRIMARY — Dale-class conversion** — at least one `handoffs` row with result `'launch'` and `oldHolderMaxD` 0 | must hold for GO |
| 5 | **GUARDRAIL — starvation** — total starvation deaths armed ≤ control total + 2, AND no single seed's armed starvation deaths exceed its control by more than 2 | must hold for GO |
| 6 | **GUARDRAIL — survival** — median survival armed ≥ 0.8 × control median | must hold for GO |
| 7 | **NO-GO rule** — any of bars 3–6 missed → NO-GO (never re-scored against a friendlier metric mid-run, §14); det-gate failure (bar 2) → NO-GO on instrument grounds (the legs are not comparable) | frozen |

**Zero-launch rule (frozen, no re-scoring):** if EITHER leg sees
**fewer than 5 wave-4+ launches**, there is nothing to attribute
and the verdict is **INCONCLUSIVE** (not GO, not NO-GO) — the
evidence says so and names the next step (a wider band, or a
substrate check on why launches are absent). A miss is NO-GO,
never re-scored against a friendlier metric mid-run (§14).

GO = all seven bars pass. GO means: the handoff converts held
range-0 wave-4+ plans into real departures (≥4 more launches,
≥1 Dale-class conversion) and costs nothing on the
starvation/survival guardrails. NO-GO = any bar missed; the
evidence says which, and the game-code change is reverted
zero-trace per kill protocol (instrument + evidence kept).

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node
  scripts/test-killlootbundle-a.js` → 12/12;
  `node scripts/analyze-killlootbundle-a.js --selftest` → 17/17;
  `node scripts/test-leadgate-a.js` → 33/33;
  `node scripts/analyze-leadgate-a.js --selftest` → 21/21;
  `node scripts/test-needwave-b.js` → 100% on this base;
  `node scripts/analyze-needwave-b.js --selftest` → 100%;
  `node scripts/test-homebody-handoff-a.js` → 100% on NEW code
  AND its handoff assertions FAIL on old code (child mode, `git
  show` of the base tip `f2d03db92`); `node
  scripts/analyze-homebody-a.js --selftest` → 100% — all before
  any judged run. Green.
- **Band (judged):** 8 seeds, **107423–107430**, horizon 150d
  death-aware, competent verbatim policy, two legs (ctl on old
  code, arm on new code). Substrate as §6.
- **Leg order (frozen):** ctl leg runs BEFORE the game-code
  commit; the game-code change is committed next; the arm leg
  runs AFTER it. The analyzer refuses to judge if either leg's
  `anchorCommit` does not match the expected side (ctl anchor
  without the fix, arm anchor with it) — recorded, not assumed.
- **Per-launch tables** in the evidence file from the analyzer
  output (per-seed JSONs in
  `evidence/2026-11-22/perseed-homebody-a-ctl` and
  `evidence/2026-11-22/perseed-homebody-a-arm`).
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median survival.
- **Sense-test:** read handoff lines + departure beats from both
  legs (verbatim `beatLines` where captured): does a converted
  launch read as a real party setting out, with the transfer
  named?
- **Canon:** docs/MONSTER-WAVES.md (gates); docs/PARTY.md
  (scholar's party only); no canon doc covers villager
  party-lead selection or the homebody handoff — the rule is
  code-derived (see §3), said here rather than inventing canon.

## 9. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
