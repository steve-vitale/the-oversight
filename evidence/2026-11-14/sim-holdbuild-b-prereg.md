# sim-holdbuild-b — PREREG (BUILD: the hold)

Run: fleshout-loop-b-20261114T2345Z (Loop B), arm sim-holdbuild-b.
Axis: winnability chain. BUILD arm — the hold: upkeep tending for seasoned
links + post-dissolution poverty-trap relief. Takes round-2230 next blank #2.
Branch: sim-holdbuild-b — worktree ~/workspace/worktrees/sim-holdbuild-b.
Date: 2026-11-14. Prereg committed BEFORE any judged run; the bars below bind.

## Canon note (read first)

docs/CANON.md was read, then docs/SCALE.md (the scale-ladder canon — the
only canon doc covering hierarchy/diplomacy). There is NO HIERARCHY.md /
DIPLOMACY.md; the mechanics are taken from docs/SCALE.md + src/js/hierarchy.js
(`tendLink`, `successionCrisis`, `_linkSeasoned`, `_trustDriftWatch`) +
src/js/win-plan.js (`winPlanBondsTick`), NOT invented. Canon facts used:
national = LEAD primary of ≥3 SEASONED subordinates (seasoned = link 30+
days old AND trust 40+); a polity is a live relationship — when no
qualifying polity remains and no beat is pending, `nationalLive` clears and
the realm dissolves aloud; the succession haircut is −8 trust to ALL links
plus a 7-day mourning window with no trust gains; a seasoned link's gains
are +1/week tribute paid in full and +8 from a tend (1,500 kcal, once per
week per link, via `tendLink` — no seasoned gate in the verb itself);
tendLink pays partial from a thin pantry with proportional trust.
Canon gap (stated, not invented): no canon doc covers realm holding /
dissolution / upkeep tending (holdrealm-b metric review §5).

## The diagnosis being built on (measured, not guessed)

Source: evidence/2026-11-14/sim-holdrealm-b.md (7 dissolutions classified,
0 UNCLASSIFIED) on the answercourt-confirm corpus
(evidence/2026-11-14/perseed-answercourt-confirm-b/, 32 files, 16 seeds ×
armed competent-answercourt-b + baseline competent-scaleclimb-b, 150d).
Corpus numbers (armed leg): national ever 13/16; national held-days per
seed 90, 0, 28, 71, 7, 72, 30, 57, 0, 0, 68, 77, 43, 19, 58, 34 (median
38.5); dissolutions 7 (series-counted, never end-state arithmetic);
re-climbs 2 (100208 d113, 100211 d127); never re-climbed 2 (100203, 100212);
starvation armed 6 vs baseline 3; median survival armed 121.5d.

## FIRST: where tending is decided in real play (established by this arm)

Four deciders, read from source + corpus + probes (scripts/probe-holdbuild-b.js,
diagnostic only, no judged data). The build lives in #2 — the only
autonomous engine decider that runs in shipped play:

1. **The player verb** (app.js `[data-link-tend]` → `Game.tendLink`):
   the player CAN tend any active Haven-primary link weekly at 1,500 kcal
   → +8 trust. The verb has NO seasoned gate and NO pantry gate beyond
   paying partial from a thin pantry. The verb never blocked upkeep.
2. **The engine's autonomous tending — `winPlanBondsTick`** (src/js/win-plan.js,
   called from the villager-agency daily tick, villager-agency.js:443):
   plan-holders home at Haven tend own primary links with trust < 50,
   weekly, when pantry-days ≥ 3 — BUT the tick returns null when
   `nationalLive || pendingNational`. Corpus proof: 58 engine tends
   band-wide, **ZERO on/after the national day on any seed**; 104–266 tick
   calls per national seed were blocked by the nationalLive return alone.
   THIS is the real-play "no upkeep tending" — the village tends its bonds
   while climbing, then stops tending them the day the realm exists.
3. **The engine answermail drive** (`_answermailDriveDaily`, hierarchy.js):
   DEFAULT-OFF, node-only (`process.env.ANSWERMAIL_DRIVE === '1'`; in the
   browser `process` is undefined so it never runs in shipped play).
   Tends weekly when pantry > 20,000 regardless of seasoned status. It was
   UNSET in the corpus (`driveEnd: null` on all 32 files). NOT the
   real-play decider. NOT changed by this arm.
4. **The sim policy** (competent-scaleclimb-b / competent-answercourt-b):
   tends ONLY unseasoned links, pantry > 20,000 kcal (188 policy tends
   band-wide; 100203: 211 tends blocked by the pantry gate after day 42).
   That is the INSTRUMENT's gap (the policy is the sim's player stand-in),
   not the game's. The policies stay byte-identical; the build is NOT
   policy-side.

## The probe refutation (component (b) redesigned before the build)

The brief presumed the post-dissolution blocker was the tend pantry gate.
The probe refutes that for the two target seeds:

- 100203 armed: `winPlanBondsTick` was called 599 times; on all 447 calls
  where tending was possible (not national, ≥2 prims, a link below trust
  50), **winPlan holders = 0 — every single time**. The pantry-days gate
  blocked only 71 of those 447 calls; the actor gate blocked the rest.
  Zero engine tends ever (the corpus agrees: 4 policy tends, 0 engine).
- 100212 armed: same story — holders 0 on all 218 possible calls;
  pantry gate blocked 8; zero engine tends ever.
- Contrast 100211 (re-climbed d127): holders ≤ 5; 8 engine tends — 5
  pre-national plus **3 on day 126, the day before the re-climb**. The
  engine tick IS the re-climb mechanism when holders exist.

So on the two never-re-climbed seeds the binding blocker is ACTOR
ABSENCE (no villager ever holds a win plan — the system sleeps until a
villager survives a wave-3+ beast, and none did), not the pantry gate:
lowering the pantry gate alone cannot produce one tend there. Component
(b) is therefore built against the actual blocker: a fallback actor for
re-climb tending, with the pantry gate lowered for those tends. The
policy's 20,000 kcal gate is left alone (instrument, not game).

## The build (src/js/win-plan.js ONLY — `winPlanBondsTick` + flag gates)

Two components, separately flaggable, both DEFAULT-ON (live behavior;
the env flags exist only so the measurement can attribute each).

PRIOR ART (read before judging this build): arm sim-tenddrive-a
(2026-11-08, Loop A; evidence/2026-11-08/sim-tenddrive-a.md) built
component (a) in exactly this construction and went NO-GO at pilot —
NOT because the mechanism failed (it fired: 2 engine tends while
national; links topped to 55) but because its band carried ZERO
national losses on its base, so the headroom had nothing to save
(primary: national final 3 → 3). This band is the opposite: LOSS-RICH
(7 dissolutions in the corpus), so the primary bar here tests the
lever where losses exist. The retained specification test
scripts/test-tenddrive-a.js currently FAILS 2/4 on the reverted tree
by design; with (a) re-applied it must pass 4/4 again (cross-check).

- **(a) UPKEEP — `HOLDBUILD_UPKEEP`** (default ON; `HOLDBUILD_UPKEEP=0`
  disables, restoring the old early return exactly): the tenddrive
  construction, in `winPlanBondsTick` ONLY — delete the early return
  `if (st.nationalLive || st.pendingNational) return null;` entirely,
  and raise the tend cap from 50 to 55 while nationalLive
  (`(l.trust || 0) >= (st.nationalLive ? 55 : 50)`; cap stays 50 when
  not national). Sizing (tenddrive, computed): observed loss dips are
  3/7/12 trust points; cap 55 banks 15 headroom above the 40 bar and
  holds the 12-point dip, cap 50 banks only 10. Every other gate
  UNCHANGED: ≥2 primary links, plan actor at Haven, pantry-days ≥ 3,
  once/week/link, mourning skip, same 1,500 kcal cost through
  `tendLink` (never free). `winPlanMusterTick` keeps its own early
  return untouched. Counts as `upkeepTends` in
  `state.village.winPlanStats`.
- **(b) RECLIMB — `HOLDBUILD_RECLIMB`** (default ON; `HOLDBUILD_RECLIMB=0`
  disables): when the village is NOT national and a Haven-primary link
  sits below the seasoned trust bar (trust < 40), it may be tended by a
  FALLBACK ACTOR — the available representative
  (`Game._availableRepresentative()`: best-standing living member who can
  actually walk out, never the player; the same actor precedent as the
  answermail drive) — when no plan-holder actor is at Haven. For these
  re-climb tends only, the pantry-days gate is lowered from ≥ 3 to ≥ 1
  (a village with a day of food can spare one tend's grain); `tendLink`
  still pays the real 1,500 kcal and pays partial from a thin pantry with
  proportional trust. Weekly cadence unchanged. Counts as `reclimbTends`
  in `state.village.winPlanStats`.

Flag semantics (shared gate helper, browser-safe): a component is ON
unless `process.env.HOLDBUILD_<X> === '0'` — in the browser `process`
is undefined, so shipped play runs the build. With both flags '0' the
tick behaves exactly as before (verified by the Stage-0 reproduction
and by the proof test's flag legs).

NOT changed: `tendLink` pricing/cadence, the seasoned bar (40 / 30d),
the succession haircut (−8), mourning, national staging, win prices /
deed gates / readiness bars, the answermail drive, the policies, the
muster tick. No new system (Steve: root-cause first; this is one early
return + one fallback actor inside the existing bonds tick).

## Baseline + control (identical seeds by design — NOT a fresh band)

The pilot/confirm bands REUSE the answercourt-confirm band (100201–100216)
on purpose: the before leg is the committed corpus, and the judged control
is the OFF leg (same armed policy, both build flags '0') on identical seeds.
Seed-band freshness does not apply — re-use IS the paired before/after
design; a fresh band would confound the build with new seeds.

- HISTORICAL BASELINE: the committed corpus (32 per-seed files; armed leg
  numbers in "The diagnosis" above). Zero src/js behavior changes since
  that corpus (only evidence/scripts/version files moved).
- JUDGED CONTROL: the OFF leg, run in this arm (armed policy, both flags
  '0'). It must reproduce the corpus (Stage 0); the ON-vs-OFF contrast on
  identical seeds is the verdict.

## Instrument (recovered + adapted; changes are instrument-only)

- POLICIES recovered byte-identical from the pilot branch tip ed6df749e
  (`git show`, hash-verified, committed 0a1282119 with attribution):
  competent-scaleclimb-b.js sha256
  24d6b4ad8fbe8d3c5ff542cc99a8cd08fb6be1b4da3bff7b09f092b668d2a032;
  competent-answercourt-b.js sha256
  616aa98670770697fac49fba3dad06c6ec9895f16361368eaf6d757d4a25a0c2.
  The holdrealm "policy source unrecoverable" finding is answered by this
  recovery (the coordinator marks it fixed; the confirm branch itself
  kept evidence only — 6d8470a4a carries no scripts/).
- DRIVER `scripts/answercourt-driver-20261114.js` recovered byte-identical
  from ed6df749e (sha256
  1257e215ff601ccbd2fa52b2aff6ed6fe12e1e36b698ecdb76b5591b8f89b7c8),
  kept byte-identical (Stage-0 reproduction vehicle). The judged driver
  is a copy, `scripts/holdbuild-driver-20261114.js`, with renamed
  RUN/OUTDIR/arm literals + FOUR ADDITIVE snapshot fields only
  (`pd` = pantryDaysEstimate, `wpHolders` = winPlan holder count,
  `wpUpkeep` / `wpReclimb` = winPlanStats counters) + the dissolution-
  episode ring from scripts/linklines-capture.js (same pattern as the
  holdrealm arm; general 600-line buffer untouched, additive
  `dissolutionLines` field). Pure reads; no game-behavior change.
- ANALYZER `scripts/analyze-holdbuild-b.js` (copy of the recovered pilot
  analyzer with renamed literals + component attribution: engine tends
  classified from verbEvents + series — (a) = engine tend while
  nationalLive that day; (b) = engine tend on a sub-40 link while not
  national). The holdrealm analyzer (scripts/analyze-holdrealm-b.js, on
  master) is reused as-is for dissolution / re-climb classification.
- PANEL BUILDER `scripts/build-holdbuild-panels-20261114.js` (copy of the
  recovered pilot builder, renamed literals only; pseudo-panels per the
  confirm precedent — the §15 compare is built for the record and attached;
  the pre-registered bars below are the judge).
- PROOF TEST `scripts/test-holdbuild-b.js` (new): static legs (flag gates
  default-ON / '0'-OFF, independent; diff confined to src/js/win-plan.js
  + scripts + evidence; ontology validation) + game legs on the
  tenddrive fixture pattern (`Game.mshipState()` links, stocked pantry,
  plan-holder at Haven, `winPlanOf` stage `standing`): (a) tends a
  sub-50 seasoned link while nationalLive with a holder present, and
  does NOT with the flag off; (a) cap 55 while national / 50 otherwise;
  (b) tends a sub-40 link with no holders via the representative at
  pantry-days 1, and does NOT with the flag off; bounds (weekly dedup,
  trust ≥ cap skipped, mourning respected, tendLink cost charged) hold
  on both components; the muster tick still returns null while national.
  CROSS-CHECK: `scripts/test-tenddrive-a.js` (retained specification,
  currently 2/4 by design on the reverted tree) must pass 4/4 with the
  build on — it is NOT edited and NOT added to the green list while the
  build is reverted.

## Seed bands, horizon, env

- PILOT: seeds 100201–100208, 150d, armed policy, ON leg + OFF leg
  (16 runs). 100203 is the pilot's re-climb target; 100212 is confirm-only.
- CONFIRM: seeds 100201–100216, 150d, armed policy, ON leg + OFF leg
  (32 runs).
- HORIZON 150d, death-aware (dead villages stop simulating, +10d tail
  max), matching the corpus. 150d because links need 30 days to season
  after a day-10 start, plus a season for the national beat, plus hold
  time after the court.
- ENV: HOLDBUILD_UPKEEP / HOLDBUILD_RECLIMB unset (= ON) on the ON leg,
  both '0' on the OFF leg. COUNTER_ANSWER, COMPETENT_FLEE_REPAIR,
  ANSWERMAIL_DRIVE unset (as in the corpus). No other env.
- If the pilot shows the components diverging (one fires, the other
  doesn't — read from upkeepTends/reclimbTends + the classified engine
  tends), run single-component pilot legs (UPKEEP-only:
  HOLDBUILD_RECLIMB=0; RECLIMB-only: HOLDBUILD_UPKEEP=0) to attribute
  before the confirm.

## Primary metric + GO bars (binding, §14)

Definitions: NATIONAL HELD-DAYS = days with scaleRank national/global in
the per-day series (per seed). RE-CLIMB = nationalLive regained after a
dissolution (national→regional→national in the series), per the holdrealm
analyzer. Dissolutions counted as EVENTS from the series, never end-state
arithmetic.

- STAGE 0 REPRODUCTION (gate before any judged run): re-run 100201,
  100203, 100212 armed with the UNMODIFIED recovered driver and confirm
  the judged fields reproduce the corpus files (series scale/dip/links
  roll, verbEvents, deaths, days, endReason, scaleRank, maxWave,
  standing). If they don't reproduce, STOP and report — do not silently
  re-baseline.
- PILOT GATE (proceed to confirm iff ALL hold): (i) the mechanism fires
  (upkeepTends + reclimbTends > 0 on the pilot band); (ii) the cost bar
  is clean on the pilot (starvation pooled ON ≤ OFF + 2 AND median
  survival ON ≥ 0.8× OFF); (iii) 100203 re-climbs OR pilot median
  national held-days ≥ 48 (pilot-band corpus median 43.5 × 1.1 = 47.85).
  A pilot-gate miss = NO-GO at pilot: revert the game change, report the
  measurement, no confirm spend.
- CONFIRM GO (all three, on the 16-seed confirm):
  - P1 RE-CLIMB: at least one of 100203 / 100212 re-climbs on the ON leg.
  - P2 HOLD: median national held-days across the 16 seeds, ON leg,
    ≥ 47 (corpus median 38.5 × 1.2 = 46.2).
  - COST: starvation deaths pooled ON ≤ OFF + 2 (totals AND arm-only
    per-seed) AND median survival ON ≥ 0.8× OFF median.
  A miss on any leg = NO-GO: REVERT the game change in the branch
  (killed arms leave no trace) and report the measurement as the result.
  Do NOT land a failing build. A GO keeps the change live (default
  behavior) with game tests green + `node scripts/check.js --quick`
  green on the branch (once at the end; if it times out with zero output
  under concurrent sweeps, record that + targeted suites instead, per
  loop precedent).
- Alongside reads (never re-scored as the judge): dissolution count (7 in
  corpus), re-climb count (2 in corpus), national ever (13/16), engine
  tends by component, policy tends + tendsBlockedPantry, starvation per
  seed, villager combat deaths per seed, wall numbers (national / table /
  wins, wave 4–5, median survival).

## Balanced panel (§15)

Pseudo-panels built from the driver per-seed JSONs (same builder pattern
as the confirm precedent); the compare .md is attached to the evidence
file. The pre-registered bars above are the judge, not the panel.

## Sense-testing (SENSE-TESTING LAW)

Read the re-climb transcripts in the ON leg: does the village SAY why it
tends again — does the representative's tending carry a voiced line (the
tend grain line names the village and the trust gain), and does a
re-climb read as a played return rather than a silent meter? Quote the
lines. Judge meaning and coherence, never just counts. Note any
dissolution whose line is still missing (the episode ring should now
capture it).

## Evidence

- Prereg: this file.
- Build: src/js/win-plan.js (winPlanBondsTick + flag gates + stats).
- Proof: scripts/test-holdbuild-b.js.
- Probe (diagnostic): scripts/probe-holdbuild-b.js.
- Driver: scripts/holdbuild-driver-20261114.js (copy + additive fields).
- Analyzer: scripts/analyze-holdbuild-b.js (+ reuse
  scripts/analyze-holdrealm-b.js for dissolutions).
- Panel builder: scripts/build-holdbuild-panels-20261114.js.
- Per-seed JSON: evidence/2026-11-14/perseed-holdbuild-b/ (pilot 16 +
  confirm 32 files, ON + OFF legs).
- Panel: evidence/2026-11-14/holdbuild-panel.{json,md}
  (+ -before/-after .json.gz pair).
- Evidence: evidence/2026-11-14/sim-holdbuild-b.md (per-seed tables,
  component attribution, wall numbers, sense-testing, metric review).

## Convergence state

BUILD — verdict GO/NO-GO against P1 + P2 + COST above (or NO-GO at pilot
on the pilot gate). A GO lands upkeep tending + poverty-trap relief as
default game behavior; a NO-GO reverts the game change and the measurement
stands as the result. Either way the axis line updates from this run's
numbers only.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did P1/P2 measure the hold, or did the
metric prove wrong (bad proxy, blind channel)? Note in particular
whether the OFF leg reproduced the corpus (Stage 0) and whether the
pilot-gate's 100203-or-held-days disjunction was the right sniff test.
