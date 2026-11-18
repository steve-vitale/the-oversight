# Pre-registration — sim-wildavoid-seedplan-b (Loop A, run fleshout-20261118T1515Z follow-up, axis: scale-onramp)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is NO-GO per the verdict mapping below, never re-scored against a friendlier
metric mid-run. Metric doubts go under "metric review" in the evidence file,
for the NEXT run.

## Run identity

- Arm: sim-wildavoid-seedplan-b (Loop A) · Branch: `sim-wildavoid-seedplan-b`,
  based on master at the coordinator's registration.
- This is the RE-REGISTERED CONFIRM of the seedplan fix (finding #2556):
  the 1515Z pilot (evidence/2026-11-18/sim-wildavoid-seedplan-a.md, prereg
  sim-wildavoid-seedplan-a-prereg.md) went METRIC-BROKEN because two frozen
  bars assumed a control leg that never avoids (B1: arm avoids vs ctl
  would-avoid meetings; B5: ctl say lines == 0). Under this arm's legs
  both legs run the avoid, so those bars are unmeasurable BY
  CONSTRUCTION, not by lever behavior. This arm re-freezes the bars
  corrected (B1, B5, B2 floor, seed-path label — see below) and judges
  the SAME fix, unchanged, on a fresh confirm band. It does NOT
  re-judge the 1515Z pilot on the corrected bars; that pilot stays
  METRIC-BROKEN under its frozen prereg.
- The fix under test is the cherry-picked 1515Z fix, unchanged: commit
  4f5feae78 (cherry-picked as ba5568812 on this branch: src/js/game.js
  only — both wild-router avoid branches call
  `winPlanSeedFromFight(vid, mdef, 'avoided')` when WILDSEEDPLAN=1 AND
  VETREENGAGE=1, excluding raids and aid-crisis fights at the door)
  plus driver leg validation 646f661b1 (cherry-picked as 65e0ebc07).
  No other commit from branch sim-wildavoid-seedplan-a is cherry-picked.
  Src scope verified by the runner via
  `git diff --name-only <base> <branch> -- src/js/` (exactly
  src/js/game.js), NOT by any test assertion — a test asserting on
  `git diff --name-only` (uncommitted changes) can only pass while
  the change is uncommitted.
- The wild-avoid lever itself (95ba293f2, sim-wildavoid-rejudge-a) is
  already on master and stays untouched; this arm adds the seed call
  only. The confirm it fixes (evidence/2026-11-18/sim-wildavoid-confirm-a.md)
  went NO-GO on B2 (launches 42 → 32, 76% vs bar ≥90%), B4 (one
  raid-exempt 1-HP Suburb kill), and C3 (community loss 6 → 8).
- The sibling arm sim-fieldcarrier-a shares pilot band 104601–104608
  by design (different worktree, no interference); sims run as
  separate processes only. This arm does NOT touch Loop B's work
  (party-size / partysize4) or godpath.js / fieldFights.js.

## Canon (read first)

- docs/CANON.md: read. docs/MONSTER-WAVES.md (leave-counter canon): The
  Suburb — "comfort as a trap — you don't kill it, you ESCAPE it" — and
  monsters.json weaknesses: "you can't kill it — LEAVE. Navigation is
  victory; the fight is a timer". The 'leave' itself is CORRECT
  counterplay per canon. This arm changes NO canon and re-tunes NO
  outmatched threshold.

## The lever, in plain words

When villagers meet a wave-4-or-worse beast out in the world with too small
or too poorly geared a party, they step aside instead of fighting — one
spoken line ("going back for help"), the beast stays in the world. Until
now the line was a lie: no plan was ever seeded, so nobody ever went back.
This arm makes it true: the avoid now seeds a re-engagement plan through
the SAME function a flee uses (`winPlanSeedFromFight(vid, mdef,
'avoided')`), under the SAME guards as the flee seed (VETREENGAGE=1, not
a raid, not an aid-crisis fight at the door; wave ≥ 3 inside the seed;
the Suburb never seeds a hunt plan while FLEEREPAIR2 is on). Full geared
parties fight exactly as before. Raids at the haven door are exempt from
avoiding, exactly as before.

## The change (frozen shape, before sims)

- Same src fix as the 1515Z pilot (cherry-picked, unchanged — see Run
  identity). New env flag `WILDSEEDPLAN=1` (node sims only). Control
  leg: WILDAVOID=1, WILDSEEDPLAN unset (the avoid fires, no plan
  seeded — the landed behavior). Arm leg: WILDAVOID=1 + WILDSEEDPLAN=1
  (the avoid fires AND seeds).
- Instrument changes for -b (the corrected bars need corrected
  instruments; the src fix is untouched):
  - `scripts/wildavoid-driver-seedplan-b.js` (copy of the -a driver):
    `classifySeedPath` teaches 'avoided' the wild-avoid path — a
    seed from `resolveWildMonsterEncounter` / `resolvePatrol` in
    game.js classifies `wild-avoid` (new named path in SEED_PATHS);
    the expedition gate (`winPlanFightGate` / win-plan.js) still
    classifies `gate-avoid`; an 'avoided' seed with no caller frame
    stays `unknown-avoided-no-gate-frame`. Also fixes the stale
    frame-skip strings (`wildavoid-driver-b.js` → the -b filename)
    in `firstCallerFrame` / `fightOrigin`, and the OUTDIR default
    (`perseed-wildavoid-seedplan-b-` + MODE).
  - `scripts/analyze-wildavoid-seedplan-b.js` (copy of the -a
    analyzer): frozen seeds 104701–104712; corrected B1, B2 floor,
    B5 sayOk (see bars); selftest extended with the corrected-bar
    cases (including the 1515Z pilot numbers as fixtures).
  - `scripts/test-wildavoid-seedplan-b.js` (copy of the -a proof
    test): same live §1, plus §2b corrected-bar cases (wild-avoid
    label, B1/B2-floor/B5-sayOk judges); §3 is CONTENT ONLY — no
    `git diff` / `git status` assertion (see Run identity).
  - Panel builder `scripts/build-wildavoid-panels-a.js` reused
    unchanged (takes --out/--before/--after/--seeds).

## Pre-registered metrics (frozen)

Two legs, identical seeds, one shared baseline: MODE=ctl
(WILDAVOID=1, WILDSEEDPLAN unset) vs MODE=arm (WILDAVOID=1 +
WILDSEEDPLAN=1). Substrate both legs: VETREENGAGE=1 PARTYSIZE4=1
FLEEREPAIR2=1, SEEKGATE unset, FIGHTALLY2 unset. Policy: competent
verbatim. Horizon: 150d death-aware.

- **B1 (CORRECTED — the avoid fires, on both legs):** arm wild avoids
  >= 50% of ctl wild avoids (ratio). Contact precondition: ctl wild
  avoids >= 8. Ctl would-avoid wild meetings are reported as CONTEXT
  ONLY — they are unmeasurable-by-construction under avoid-on legs
  (outmatched meetings are avoids on ctl too and never become
  encounters for the classifier). The contact floor applies to the
  CONFIRM band (12 seeds); on the 8-seed pilot B1 is judged on the
  ratio only, with contact reported (the pilot band is known to be
  avoid-poor: 4 avoids in the 1515Z pilot — applying a >= 8 floor
  to it would repeat the #2556 error in the other direction).
- **B2 (PRIMARY — no launch loss):** wave-4 launch events
  (`dawnbidDeparts` rows with `result === 'launch'` and a wave-4 plan)
  armed >= 90% of ctl, AND launched instances (any-commit, frozen
  classifier) armed >= 90% of ctl. LAUNCH-POPULATION FLOOR (confirm
  band only): the ratio is judged only if ctl stages >= 8 launch
  events AND >= 8 launched instances; below that B2 is
  METRIC-BROKEN (launch-poor band — the pilot's 5/5 cannot
  distinguish "the seed restores launches" from "nothing launched").
  On the 8-seed pilot B2 is judged on the ratio only, with the
  population reported.
- **B3 (the price banks):** armed-leg wild wave-4+ deaths (vDie
  outcomes on wild origins) <= ctl AND armed-leg wild vFlee damage
  (sum of `vTaken` over wild vFlee rows) <= ctl. Carried verbatim
  from the 1515Z prereg.
- **B4 (re-scoped, non-raid):** count Suburb deaths and fought meetings
  ONLY among OUTMATCHED, NON-RAID Suburb meetings (party < 3, or anyone
  unarmed/unarmored — the same `winPlanOutmatched` rule the lever
  applies — AND `raid !== true` on the encounter row). GO requires
  BOTH: (a) arm outmatched non-raid Suburb deaths == 0, AND (b) every
  outmatched non-raid Suburb meeting on the arm leg was avoided (arm
  outmatched non-raid Suburb fought meetings == 0). Any Suburb death
  on the arm leg is reported with the original-B4 numbers as context,
  and must be VERIFIED from the corpora: a matched-party death
  identical on both legs (same day, same outcome, same damage, same
  party) AND predating any avoid on that seed does not fail B4
  re-scoped. A raid meeting (raid == true) does not fail B4 re-scoped.
  Carried verbatim from the 1515Z prereg.
- **B5 (instrument, CORRECTED sayOk):** 12/12 files per leg on the
  confirm (8/8 on the pilot — the analyzer takes `--seeds` to
  override the frozen list; the pilot invocation is recorded in the
  evidence file), exactly the frozen seed list, 0 instrument errors,
  missingHp 0, recMismatch 0, D3 replica-vs-live-gate agreement
  >= 0.95 on expedition rows (n >= 5) on BOTH legs,
  `winPlanStats.wildAvoids` == recorded avoids, say-lines == avoids
  ON EACH LEG (`ctl.sayAvoidLines === ctl.avoids AND
  arm.sayAvoidLines === arm.avoids` — the old check required ctl
  say lines == 0 and ctl avoids == 0, a stale avoid-off-control
  assumption), every encounter row carries a boolean `raid` field
  (0 rows missing it). Trajectory control: first diverging day per
  seed >= that seed's first avoid day, or no divergence when no avoid.
- **C1 (median-survival cost):** arm median survival >= 0.90 x ctl
  median survival (ratio reported). Carried verbatim.
- **C2 (starvation cost):** arm starvation deaths <= ctl starvation
  deaths. Carried verbatim.
- **C3 (community-loss cost):** arm community loss (panel
  `communityLost`) <= ctl + 1 on the confirm band (on the 8-seed
  pilot, <= ctl + 1 as well — same rule, smaller band). Carried
  verbatim.
- **Panel (§15):** `scripts/balance-panel.js compare` on the built
  panels must not return `regression_signal`. Any `regression_watch`
  line is investigated in the evidence file, not waived.

**Verdict: GO iff B1 && B2 && B3 && B4 && B5 && C1 && C2 && C3 && panel clean.**
**NO-GO iff any B or C fails with population present.**
**METRIC-BROKEN iff ctl wild avoids < 8 (confirm band), or ctl wild
wave-4+ meetings < 40, or D3 n < 5 on either leg, or (confirm band
only) the B2 launch-population floor is missed.** No re-scoring.

Reported (not gated): wild wave-4+ kills ctl vs arm; wild meetings by
origin ctl vs arm; avoids by origin/rule on arm; avoids with foreign help
at the door; wild deaths by origin; fled-seed pool (v4seeds, world-tick
fled seeds, wild vFlee count) ctl vs arm — the channel this fix restores;
avoid-seed pool (v4seeds with path `wild-avoid`) ctl vs arm; Suburb slice
(meetings, outcomes, trick-known seeds, damage taken) + original-B4
numbers as context + raid Suburb meetings fought as context; wall numbers
(national / table / wins, wave 4–5 unlocks, median survival) both legs;
sense-testing notes from transcripts (at least 2 avoided meetings and 2
fought meetings read, plus whether seeded re-engagement plans produce
sensible behaviour — villagers going back with help, not marching alone
into the same monster).

## Design (seeds, policy, horizon, instruments)

- Seed-band freshness (verified 2026-11-18 by this worker, BEFORE any
  judged sweep — search scope: every `evidence/*/sim-*-prereg.md` AND
  every `evidence/*/*prereg*.md` in the main tree, plus the
  forbidden/contaminated band lists those files name):
  - CONFIRM band **104701–104712** (12 seeds): **FRESH** — word-boundary
    grep for each of 104701…104712 returns 0 hits in any prereg file.
    The forbidden/contaminated mentions found (evidence/2026-10-26 and
    2026-10-27 preregs) name other bands (9700–9711, 9930–9941, 74201–
    74208, 9950, 10000) — none names 104701–104712.
  - PILOT band **104601–104608** (8 seeds): **DELIBERATE MATCHED REUSE**
    of the 1515Z pilot band (same seeds, so the corrected bars judge
    the same meetings) — recorded as a reuse, not a fresh band. It is
    also named in evidence/2026-11-18/sim-fightcap-dmg-a-prereg.md
    (a different arm's legs on the same band — no interference: separate
    worktree, separate corpora). The coordinator's pre-check found the
    confirm band unnamed in any prereg; this worker re-verified it.
  - Collision note for the next worker: 104431–104446 is the wildavoid
    confirm band; 104411–104418 is the wildavoid pilot band; 104421–
    104428 is the sibling sim-scale-onramp-round-1015 band; 104601–
    104612 is the seedplan-a band (pilot 104601–104608 used here as a
    matched reuse; 104609–104612 never judged).
- Pilot gate: 8 seeds (104601–104608) before/after on identical seeds
  first. The pilot is a REPRODUCTION check: it must reproduce the
  1515Z pilot corpus numbers (wild meetings 89, avoids 4/4, wild deaths
  18/18, flee damage 2,528, launches 5/5, median survival 136, starvation
  0/0, community loss 5/5) and judge the corrected bars with the
  population floors NOT applied (B1 ratio only, B2 ratio only — see
  bars). The pilot passes the sniff test iff reproduction matches AND
  the B1 ratio passes AND the B2 ratio passes AND no B/C bar fails AND
  no gross instrument failure. If the pilot NO-GOs, STOP: no confirm
  spend, report the NO-GO. (A B1-contact or B2-floor shortfall on the
  pilot is EXPECTED — the pilot band is avoid- and launch-poor — and
  is not a pilot failure; the floors bite on the confirm band.)
- Confirm: 12 seeds (104701–104712), same legs, 150d, ONLY if the pilot
  passes the sniff test. All bars incl. both population floors judged.
- Horizon: 150d death-aware. Policy: competent verbatim
  (scripts/policies/competent.js).
- Substrate: VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 (the confirm
  substrate). FIGHTALLY2 unset. SEEKGATE unset (not on this base).
- Instruments (seedplan-b copies, distinct names — never modify the
  -a instruments or shared analyzers):
  `scripts/wildavoid-driver-seedplan-b.js` (OUTDIR default
  `perseed-wildavoid-seedplan-b-<mode>`; RUN kept `wildavoid-a` so the
  per-seed filename shape matches the panel builder),
  `scripts/analyze-wildavoid-seedplan-b.js` (frozen seeds 104701–
  104712, corrected B1/B2/B5, output
  `evidence/2026-11-18/wildavoid-seedplan-b-analysis.json`; accepts
  `--seeds` to judge the 8-seed pilot list),
  `scripts/build-wildavoid-panels-a.js` (unchanged pilot panel builder,
  run with `--out evidence/2026-11-18/wildavoid-seedplan-b-panel`
  `--before evidence/2026-11-18/perseed-wildavoid-seedplan-b-ctl`
  `--after evidence/2026-11-18/perseed-wildavoid-seedplan-b-arm`
  `--seeds <list>`).
- Corpora: `evidence/2026-11-18/perseed-wildavoid-seedplan-b-ctl/` and
  `perseed-wildavoid-seedplan-b-arm/` (8 files each on pilot; 12 each
  on confirm). Pilot corpora are diffed against the 1515Z pilot corpora
  (`perseed-wildavoid-seedplan-a-ctl/` / `-arm/`) as the reproduction
  check — the only expected differences are the v4seeds `path` labels
  (`wild-avoid` vs `unknown-avoided-no-gate-frame`) and file/run
  metadata.
- D-checks (instrument validity, run before the judged sweep):
  D1 repeatability — seed 104701, 60d, recorder ON, arm leg, run
  twice; output files identical except the `file` path. D2 wrap
  neutrality — same seed/days, recorder ON vs recorder OFF on the
  armed tip: daily fingerprints identical. D3 (in-analyzer, both
  legs) — replica vs live gate >= 0.95, n >= 5 (B5).
- A 1-seed 30d driver smoke precedes the sweep (seed 104701, arm leg,
  same substrate) to prove the recorder writes `v4avoids` rows; the
  smoke output is discarded, not judged — the judged corpora are the
  8-seed pilot legs (then the 12-seed confirm legs) only. (Wave 4 may
  not have unlocked by day 31; if the smoke shows no avoids, extend
  to 150d on the same seed to prove the rows.)
- Encounter-gear rule (Steve 2026-11-13): the panel stages the
  competent policy (geared scholar with a party) — never a fresh
  un-geared solo scholar. The proof test stages a geared scholar
  with a party for the live "should fight" cases.

## Proof (frozen)

- New proof test `scripts/test-wildavoid-seedplan-b.js` on the branch
  tip; expect ALL PASS. It proves live, on staged fixtures: (§1) a
  wild avoid seeds a re-engagement plan (target = the avoided species,
  stage by gear) iff WILDSEEDPLAN=1 AND VETREENGAGE=1 — with the flag
  unset the avoid fires and NO plan is seeded (the landed behavior);
  a raid never avoids and never seeds; a Suburb avoid under
  FLEEREPAIR2 seeds nothing; a patrol avoid seeds; an aid-crisis
  avoid at the door seeds nothing; (§2) the raid-aware B4 analyzer
  selftest (a raid outmatched Suburb meeting fought does NOT fail B4;
  a non-raid one does); (§2b) the corrected bars — the seed-path
  classifier labels wild-router 'avoided' seeds `wild-avoid`, B1
  judges avoids vs avoids with a ctl-avoids contact floor, B2 carries
  a confirm-only launch-population floor, B5 sayOk is per-leg; (§3)
  src confinement by CONTENT only (game.js carries WILDSEEDPLAN;
  win-plan.js / fieldFights.js / villager-agency.js / party-wiring.js
  carry no seedplan change) — NO git-diff assertion.
- Run `scripts/analyze-wildavoid-seedplan-b.js --selftest`; expect
  SELFTEST ALL PASS. A failure is a loud failure of the instrument.
- The pre-existing proof test `scripts/test-wildavoid-a.js` must still
  pass its live/analyzer sections (§1–§4); its §5 (src changes are
  exactly game.js + win-plan.js) is expected to fail on this arm by
  design (this arm changes only game.js, and §5's merge-base diff
  spans the whole branch, not one arm) — record the result, do not
  re-score it.
- No check.js run in this arm (the coordinator runs the gate at merge);
  the 1415Z addendum records check.js --quick at 336/6 on merged master
  with failures NOT attributable to this run's area.
