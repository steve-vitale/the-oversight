# sim-dawnchoke-a — PREREG (frozen)

**Arm:** sim-dawnchoke-a · **Loop A run:** fleshout-20261122T2115Z
**Axis:** scale-onramp · **Blank:** sim-needwave-a §6, control leg,
band 107375–107382 (seed 107375 — holders are foragers; plans sit
in `party` for weeks, 1–35 days, with no departure ever attempted)
**Type:** LEVER (one game-code change, two-leg contrast: ctl vs armed)
**Base master:** `f2d03db92` (worktree
`~/workspace/worktrees/sim-dawnchoke-a`, branch `sim-dawnchoke-a`)
**Frozen:** 2026-11-22 ~22:15 UTC, before any judged run. No judged
run has run. DIAG (control leg) runs first; the fix shape is
designed from the DIAG numbers and documented in the evidence file
— the frozen bars below judge the fix, not the DIAG.

## 1. The question

sim-needwave-a §6 found the launch funnel is nearly dry on its band
(11 launches in 8 villages over 150 days, while wave-4 fights number
7–46 per village) and named three causes. This arm owns one: the
forager dawn choke. Do NOT conflate with the range-0/homebody block
(a sibling arm owns that — a holder who physically cannot depart is
a different cause from a holder who is never asked). The question:
if the dawn tick attempts departure for holders with a staged
wave-4+ plan, not only on days they hold a launch commit, do
wave-4+ departure attempts rise, does at least one previously-stuck
staged plan actually depart, and does it cost anything on the
starvation/survival guardrails?

## 2. Code-read priors (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read; docs/MONSTER-WAVES.md read (wave gates,
  wave-4 standing >= 100, readiness bars; wave-5 standing >= 200 AND
  wave-4 faced). **No canon doc covers who leads a villager party,
  how a dawn departure is attempted, or the profile gate** — said
  here rather than inventing canon. The rule below is code-derived.
- **THE EXACT DAWN-TICK CONDITION (named here).** `agencyTick`
  (src/js/villager-agency.js:357) walks the roster once per
  day-part. For a villager at home, not on expedition, not engaged:
  `prof = npcRangeProfile(rid)` — a forager profile (score -1..1)
  is neither `wanderer` nor `explorer` — and the tick `continue`s
  UNLESS today's commit has `winPlanAction === 'party_launch'`
  (the PROFILEGATE bypass, villager-agency.js:399–422). Otherwise
  `vbrainExecuteDepart` is NEVER called: no depart call at all.
  `vbrainExecuteDepart` (src/js/villager-brain.js:1201) itself
  returns `'normal'` without departing unless the commit is
  `kind === 'EXPEDITION'`; its party branch additionally requires
  `winPlanAction === 'party_launch' && c.companion`.
- **The commit requires a companion at dawn.**
  `winPlanCands` (villager-brain.js:217) emits a `party_launch`
  candidate only when the plan stage is `party`/`hunt`/`standing`/
  `table` AND `findCompanion` returns someone; the scorer
  (vbrainScorePick, villager-brain.js:939) lets any win-plan
  `party_launch` override the core lottery. `findCompanion`
  (villager-brain.js:153) requires the companion to be a
  `wanderer`/`explorer` at Haven with trust >= 15, alive, not
  away, not engaged, not already out (unless PROFILEGATE4=1,
  unset in this substrate, opens it for wave-4+ holders — a
  different, env-gated lever, not this arm's). Stage `hunt`/
  `standing`/`table` with NO companion at dawn emits NO win-plan
  candidate at all; stage `party` with none emits `party_wait`.
  So a forager holder's plan departs only on mornings when a
  ranging companion happens to be standing at Haven at dawn.
- **The profile gate also freezes stage advancement.** The
  `continue` at the profile gate runs BEFORE `winPlanHavenTick`
  (villager-agency.js:433), so a choked holder's plan stage never
  advances on the tick that skips them — the choke is sticky.
- **Scope (frozen).** The lever touches ONLY the dawn-tick reach
  for holders with a staged wave-4+ plan: the tick attempts
  departure for them, not only on party_launch-commit days. It
  does NOT touch the range-0/homebody block (`startExpedition`'s
  `maxD < 1` refusal — sibling arm), and it does NOT re-scope
  into the targetless-plan shape (plans with no target/no wave
  stay what they are; only wave-4+ staged plans — needWave >= 4
  OR a wave-4+ target — count toward the primary metric). The
  exact code shape (which of the two gates — agencyTick profile
  gate, vbrainExecuteDepart commit gate — is opened, and how the
  party is picked when no commit names one) is designed AFTER
  the DIAG quantifies which sub-choke dominates: (a) no companion
  at Haven at dawn, (b) companions present but none ranging,
  (c) commit written but part-3 deferred, (d) commit written but
  the tick skipped for another reason (night/node/indoor/danger).
  The DIAG is the control leg; the fix is a follow-up commit in
  the same arm, judged on the frozen bars below.
- **Why attempts, not launches, are primary.** A launch also
  needs `startExpedition` to accept the holder (Haven, health,
  gear, range — the sibling's block) and companions to actually
  leave. This arm owns the ASK, not the whole launch: reaching
  the depart call is the choke being opened. Launches are the
  secondary check that attempts turn into departures.

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107423–107430 (8 seeds).** Verified before this prereg
  (re-run by this arm, not taken from the coordinator's check):
  zero hits for any of the 8 seeds in `evidence/2026-11-22/`
  filenames, in `evidence/2026-11-22/*.md` and
  `evidence/2026-11-21/*.md` contents, and in
  `~/memory/2026-11-*.md` contents.
- **Nearest used bands:** 107375–107382 (sim-needwave-a),
  107383–107390 (sim-launchfield-refreeze-b),
  107391–107398 (launchfield pilot),
  107399–107406 / 107407–107414 / 107415–107422
  (sim-launchfield-rejudge-b, per ~/memory/2026-11-22.md — three
  bands, all used). 107423–107430 follows them with no overlap.
  Forbidden bands from prior briefs (106751–106766, 107221–
  107228, 107191–107198, 107131–107138, 107111–107118,
  107091–107098, 107081–107088, 107051–107058, 107021–107028) do
  not overlap it either.

## 4. Instrument (frozen design)

- `scripts/dawnchoke-driver-a.js`: a COPY of
  `scripts/needwave-driver-a.js` with its wraps intact (contest
  prizes, kill-loot, fieldFight volleys, alienLootGrant, corpse
  takes, daily `v4gunLoc` gun census, `winPlanDepart` +
  `vbrainExecuteDepart` departs, `fieldFight` wave-4+ fights,
  `winPlanSeedFromFight` seeds, daily `planCensus`,
  `needWaveCopies`, `departBeats`, `reseedBeats`, `beatLines`)
  PLUS dawnchoke wraps (pure reads + driver-local writes; every
  game function runs exactly once, untouched):
  - `departCalls`: EVERY `vbrainExecuteDepart` call (and every
    `winPlanDepart` call, source-tagged), regardless of plan:
    `{day, part, vid, source, commitWinPlanAction, commitKind,
    result, planStage, planTarget, planNeedWave, profile,
    occupation}`. An ATTEMPT is a row whose plan is wave-4+
    (§5). The winPlanDepart path is dead in sims (needwave-a:
    18/18 launches via brain) — recorded, never assumed.
  - `scorePicks`: EVERY `vbrainScorePick` call, read AFTER the
    call from `vbrainLastLog(vid)` + `vbrainCommit(vid)`:
    `{day, part, vid, pickKind, winPlanAction, override,
    deferred, commitKind, commitWinPlanAction}`. This is the dawn
    bid record: whether the dawn scoring produced a
    `party_launch` pick for a staged holder, and what beat it.
  - `planCensus` rows gain a `commit` field (today's commit
    action/kind + last-log override/deferred, read at census
    time) and the daily census gains a `dawnPool` row:
    roster counts by profile at Haven + the count of
    findCompanion-eligible villagers (wanderer/explorer at
    Haven, trust >= 15, alive, not away/engaged/out) — the
    companion-availability read, replicating findCompanion's
    eligibility as pure reads.
  - **RUN id / OUTDIR (frozen choice):** `RUN=dawnchoke-a`,
    OUTDIR `perseed-dawnchoke-a-<mode>` (`ctl` / `arm`). The
    driver writes under `evidence/2026-11-22/<OUTDIR>`.
  - **Two legs:** MODE=ctl (old code — runs BEFORE the game-code
    commit, and IS the DIAG) and MODE=arm (new code — runs AFTER
    it). Same driver, same substrate, identical seeds; the
    per-seed JSON's `anchorCommit` proves which code each leg ran
    on. The fix is committed between the legs.
  - **Parallelism:** each leg runs as 2 detached processes (4
    seeds each), same RUN/OUTDIR — per-seed filenames never
    collide.
- New analyzer `scripts/analyze-dawnchoke-a.js`: reads both legs'
  per-seed JSONs and emits the DIAG tables (control leg only:
  choke rate by occupation and plan shape, sub-choke breakdown)
  plus the judged bars (§6); `node
  scripts/analyze-dawnchoke-a.js --ctl <dir> --arm <dir> --out
  <file>`; `--selftest` runs the staged checks. The analyzer
  also emits the DIAG-only verdict on the control leg alone
  (`--diag-only --ctl <dir>`).
- Proof test `scripts/test-dawnchoke-a.js`: staged fixture
  driving the REAL `vbrainExecuteDepart` through the REAL
  `agencyTick` profile gate — a forager-profile holder whose
  wave-4 plan has sat staged for days (companions present,
  armed and armored, per the encounter-gear rule: a geared
  party, never a fresh un-geared solo scholar) — asserts a
  depart call is reached on new code and NOT reached on old
  code (child mode against `git show` of the branch base tip),
  and asserts the departure beat speaks on a converted launch.
  100% required before the armed band; the test MUST fail on old
  code (no depart call) and pass on new code.
- Panel builder `scripts/build-dawnchoke-panels-a.js` (cloned
  from `build-needwave-panels-a.js`): builds the §15
  balanced-panel before/after JSONs from the paired corpora
  (case identity is the seed); `node scripts/balance-panel.js
  compare` is run and its compare `.md` attached to the evidence
  file. The panel is the instrument, the frozen bars below are
  the judge.

## 5. Definitions (frozen)

- **Wave-4+ plan:** a plan with `needWave >= 4` OR a target that
  is a wave-4+ species (same OR definition as leadgate-a §8 /
  needwave-a §5 — the companion sync drops needWave, so a
  needWave-only definition undercounts).
- **Staged plan:** a plan whose `stage` is `party`, `hunt`,
  `standing`, or `table` (the launchable stages; `gear` is
  still kitting up, not staged). A **staged-plan day** is a
  planCensus day-row for a living, at-Haven, not-on-expedition
  holder of a staged wave-4+ plan.
- **Departure ATTEMPT:** a `departCalls` row with source
  `brain` (the live path; `winPlanDepart` rows counted
  separately and reported, never merged) whose plan at call time
  is wave-4+ — the dawn tick reached the depart call for that
  holder. Result `launch`/`hold`/`normal` all count as attempts;
  `launch` alone is the departure.
- **Choke day:** a staged-plan day with NO `departCalls` row for
  that holder that day. **Choke rate:** choke days / staged-plan
  days. Reported by holder occupation (forager vs ranger vs
  other — occupationId, never profile) and by plan shape
  (targeted wave-4+ vs targetless hunt: target null AND needWave
  null with stage `hunt`).
- **STUCK plan:** a (seed, vid) whose plan is staged on >= 7
  distinct census days on the CONTROL leg with ZERO departCalls
  rows for that vid across the whole control run. The
  previously-stuck population is defined on control only.
- **A stuck plan actually departs:** on the ARM leg, that same
  (seed, vid) has a `departCalls` row with result `launch` and a
  wave-4+ plan at call time.
- **Starvation death:** a `deaths` row whose kind or cause
  matches /starv|hunger/i.
- **Median survival:** median of per-seed `gameDays`.
- **First-release day (det-gate bound):** per seed, the earliest
  arm-leg `departCalls` row for a forager/homebody-profile holder
  with a staged wave-4+ plan and no `party_launch` commit today —
  the lever's first observable effect. The ctl leg must record
  zero such rows on all 8 seeds (on old code the profile gate
  blocks them by construction).
- **Fixture:** competent policy verbatim
  (`scripts/policies/competent.js`). Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`;
  `LEND` unset; `PRESENCE` unset; `KILLBUNDLE` unset; `HPGATE`
  unset; `PINQUAD` unset; `HYPOFLOOR` unset. Horizon 150d,
  death-aware.

## 6. Frozen bars (judge: the analyzer on the full band)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — needwave proof test re-run green on this base; dawnchoke proof test 100% (fails on old code, passes on new); dawnchoke analyzer `--selftest` 100%; 0 instrument errors on all 16 seed files (8 ctl + 8 arm) | all must hold |
| 2 | **Det-gate** — ctl leg records 0 first-release rows on all 8 seeds; for each seed, every recorded event stream (`departCalls`, `scorePicks`, `v4departs`, `planSeeds`, `v4fights`, `planCensus`, `volleyEvents`, `prizeEvents`, `grantEvents`, `contestEvents`, `deaths`, `needWaveCopies`, `departBeats`, `reseedBeats`, `beatLines`) is byte-identical between legs for rows with day < the armed leg's first-release day; the first divergence is on/after that day | all must hold |
| 3 | **PRIMARY — wave-4+ departure attempts** — armed attempts >= control attempts + 4 on 8 seeds | must hold for GO |
| 4 | **PRIMARY (second half) — a stuck plan departs** — at least one control-STUCK (seed, vid) actually departs on the armed leg (§5) | must hold for GO |
| 5 | **SECONDARY — launches** — armed wave-4+ launches >= control (reported; a rise in attempts that never becomes a launch is a hollow win, named in the evidence, not re-scored) | reported, not judged |
| 6 | **GUARDRAIL — starvation** — total starvation deaths armed <= control total + 2, AND no single seed's armed starvation deaths exceed its control by more than 2 | must hold for GO |
| 7 | **GUARDRAIL — survival** — median survival armed >= 0.8 x control median | must hold for GO |
| 8 | **NO-GO rule** — any of bars 3, 4, 6, 7 missed → NO-GO (never re-scored against a friendlier metric mid-run, §14); det-gate failure (bar 2) → NO-GO on instrument grounds (the legs are not comparable) | frozen |

**Zero-attempt rule (frozen, no re-scoring):** if BOTH legs see
fewer than 5 wave-4+ departure attempts, there is nothing to
attribute and the verdict is **INCONCLUSIVE** (not GO, not
NO-GO) — the evidence says so and names the next step (a wider
band, or a substrate check on why attempts are absent). A miss
is NO-GO, never re-scored against a friendlier metric mid-run
(§14).

GO = all eight bars pass. GO means: the dawn tick now attempts
departure for staged wave-4+ holders, at least one previously-stuck
plan actually departs, and it costs nothing on the
starvation/survival guardrails. NO-GO = any bar missed; the
evidence says which, and the game-code change is reverted
zero-trace per kill protocol (instrument + evidence kept).

## 7. Run plan (frozen)

- **Pre-flight (NOT judged):** `node
  scripts/test-needwave-a.js` → green on this base;
  `node scripts/analyze-dawnchoke-a.js --selftest` → 100% —
  all before any judged run.
- **DIAG (control leg, judged as measurement, not as a lever):**
  8 seeds, **107423–107430**, horizon 150d death-aware,
  competent verbatim policy, substrate as §5. The analyzer's
  `--diag-only` output quantifies: staged-plan days with NO
  depart call, by holder occupation (forager vs ranger vs
  other) and by plan shape (targeted wave-4+ vs targetless
  hunt); the sub-choke breakdown ((a) no companion at Haven at
  dawn, (b) companions present but none ranging, (c) commit
  written but part-3 deferred, (d) commit written but tick
  skipped otherwise); the exact dawn-tick condition, named.
  The fix shape is chosen from these numbers.
- **Leg order (frozen):** ctl leg runs BEFORE the game-code
  commit; the game-code change is committed next (proof test
  green first); the arm leg runs AFTER it. The analyzer refuses
  to judge if either leg's `anchorCommit` does not match the
  expected side (ctl anchor without the fix, arm anchor with
  it) — recorded, not assumed.
- **Per-seed tables** in the evidence file from the analyzer
  output (per-seed JSONs in
  `evidence/2026-11-22/perseed-dawnchoke-a-ctl` and
  `evidence/2026-11-22/perseed-dawnchoke-a-arm`).
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median survival.
- **Sense-test:** read the departure lines for a converted
  launch (verbatim `beatLines` where captured): the morning must
  say something (Steve's no-silent-actions law).
- **Canon:** docs/MONSTER-WAVES.md (gates); no canon doc covers
  villager party-lead selection, the dawn departure attempt, or
  the profile gate — the rule is code-derived (see §2), said
  here rather than inventing canon.

## 8. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
