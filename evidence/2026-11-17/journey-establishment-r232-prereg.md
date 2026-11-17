# Journey leg ESTABLISHMENT — r232 pre-registration (2026-11-17, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never
tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261117T1346Z` (scheduled Tue 2026-11-17
06:45 CST; lock `2026-11-17T13:46:00Z`). Rotation read `1`
(establishment); write `1→2` at closeout with read-back. Run number
r232 (r231 is the last establishment run, 2026-11-17; no r232 evidence
exists). **Base:** local master `e5028debd` (journey-landing r142).
Heartbeat loop running (9-min cadence,
`journey-establishment-hbloop-r232.sh`, pid 15757, setsid-detached
per the r141 lesson); registration heartbeat landed ~14:00Z.
Pre-flight: main tree CLEAN, disk 46%. Lock created by this run
2026-11-17T13:46:00Z. No push (ship loop owns pushes). Registration
took ~17 min (slow checkout under box load ~12.9 — the `git reset
--hard` child was working, ~2 min CPU; not stuck, just contended).

## Base delta vs r231's base `dbeb1493f` (src/js)
- `convo-dialogue.js` / `convo-wants.js`: **the r231 fix itself
  (af1791e90)** — the dlg:help handler skips the settled-favor
  short-circuit when the want has NO favor, is still at stage 0,
  and a LIVE need exists; engageBeat's `deferredAfterResume`
  broadens from "resumed sitting with no favor, stage < 1" to "no
  favor, stage < 1". This run's Q1 is the re-measure of that fix,
  on a MATCHED band (see Seeds below).
- `win-plan.js`: planignite-fix (a61f03d22, PILOT GO) — plan store
  initializes on first HavenTick when `PLANFIX=1`, env-gated
  default-OFF. The journey driver sets no env gates, so the lever
  is inert in this panel; plan launches here are base behavior.
  deathcleanup-b (5f583a056 + correction 1f3187fc2): winPlan dies
  with the villager (own entry deleted + purged from every holder
  party); hooks in the removeVillager death branch and
  tbVillagerFalls; the correction stops `winPlanOnVillagerDeath`
  from calling `stateOf` (which materialized `winPlan={}` and
  ignited the plan system in sleeping villages). Touches
  death/plan behavior: any plan-launch or death-adjacent movement
  is adjudicated as deathcleanup-effect vs band noise, not assumed
  to be the fix. The planignite CONFIRM (2a49a1e82) is NO-GO —
  the lever stays env-gated OFF; the plan-store wake-up question
  stays open for a different lever.
- `game.js` (+5) / `betrayal.js` (+7): deathcleanup-b hooks +
  analyzer allowlist (same commit as above).
- `titans.js` (+105): journey-scale r233 titan refusal fix
  (fdf79a680) — refusal said once per titan per day. Titans are
  scale-leg content; the establishment horizon (d42) should not
  meet titans; any titan line is reported, not assumed.
- `build.js`: version-bump stamp only (e390dff60).
- Everything else in range: evidence/scripts-only landings and
  version bumps.

## Leg question (r231's named next Q1)

**Q1 — FAVORLESS ASK, RE-MEASURE OF THE r231 FIX.** r231 proved
13/82 raised asks (15.9%) never materialized into a committable
favor, all class E1 (opener never ran — a resume/recall/case
thread pre-empted the opening, the fresh ask_favor want waited at
stage 0) — and 12 of the 13 carried a SETTLED ledger favor while a
LIVE need waited (forage_help/u2 ×9, heal_help/u4 ×1,
water_haul/u3 ×2). The fix landed the same run: the menu offer
(`dlg:help`) now reaches past the settled favor to the live need.
This run re-measures the rate on the fixed code, on the SAME seeds
as r231, so the only difference between the two panels is the base
(fix + deathcleanup + titan refusal + planignite-inert). The
analyzer's class mix adjudicates fix-effect vs the other base
changes: if E1 collapses and the rate falls, the fix did it; if E1
persists at the same rate, the menu offer is not reaching the wedge
(goon pre-empts help, or the sit ends before help is pressed); if
the class mix moves elsewhere, the run says so instead of crediting
the fix alone.

Same trace + classifier as r231 (read-only probes; classes A–E
verbatim). Thresholds, pre-registered:
- **GO** = favorless rate < 20% (r231: 15.9%) AND zero stage-0
  wants resolved as 'deflected' (the r225 defect shape — no
  `dlg:cant` / `deflect_q` resolution at stage 0) AND every
  favorless sit classified (unknown 0).
- **WATCH** = rate 20–32.8% with the residual mechanism
  classified and a dominant mechanism (≥50%) named; or rate < 20%
  but a NEW dominant class appears (mechanism moved, not fixed).
- **NO-GO** = rate ≥ 32.8% (no improvement) OR any stage-0
  want resolved as 'deflected' (the fix does not hold in the wild).
- Report-only: favorless rate vs r231's 13/82; per-villager repeat
  counts; needs in the favorless sits; class mix vs r231's E1 13/13
  (adjudicates fix-effect vs deathcleanup/titan-effect per the base
  delta above); stage-0-surfaced proxy vs r231's 5/13 (same-villager
  kinded ask in a later sitting — now a secondary signal, since
  the fix is meant to surface the ask IN the sitting).

## Q1b — WANT-RAISE, REGRESSION GUARD (r221 Q1, thresholds verbatim)
Per wedge sit, did the NPC raise an ask_favor want at any turn.
- **GO** = panel raise rate ≥10% AND no seed goes a full leg with
  0 raises. **WATCH** = a zero-raise seed whose sits show other
  wants. **NO-GO** = a zero-raise + no-want seed (defect shape).
Report-only: raise rate by want kind (joint forage_help /
water_haul vs other favors).

## Q2 — SITTING CLOSES, STANDING BAR (r217 Q1, thresholds verbatim)
A sitting is CUT only when the full transcript shows NO closing beat
after the final grace beat AND the last THEM line is an open question
/ invitation / promise. The analyzer flags the mechanical half
(engine-ended + 0 beats after last THEM + no closing line); the
open-question half is a human read in the run note.
- **GO** = 0 cut sittings across the panel sittings.
- **WATCH** = 1–2 cut sittings: each read in full in the people
  check. If the last THEM line reads as a natural close, report-only.
  If any reads as a mid-thought cut, that sitting is a defect finding
  and the run fixes the close in the worktree, grounded in the
  transcript, with a proof test.
- **NO-GO** = ≥3 cut sittings, or any cut whose last THEM line is an
  open question/invitation with no resolution.
- Report-only: r214 parting-pool serves in the wild (counts of the
  three plain lines across panel transcripts); r224 F4a/F4b/F4c
  dry-line fixes hold in the wild (0 recurrences in their classes);
  r228 C3c/F2 fixes hold in the wild (0 recurrences in their
  classes); r226 F6 dry-opener guard holds in the wild (0 dry
  servings of a ledger-blocked line); C3d recap fix holds in the
  wild (recap names the live want — read on 1–2 sittings).
- **PARTING-POOL THIRD-PANEL RULE (r231 metric review):** the r214
  parting lines served 0 on r230 AND r231. If r232 also serves 0,
  OPEN the question of whether the r214 parting lines are reachable
  at all in the wild (not a bar, a named next question).

## Q3 — recap paraphrase (report-only, per-sitting presence, r230 revision)
Distinct total < 6 → report-only (no formulation owed).
Distinct total ≥ 6 → the formulation is over-represented and a
second paraphrase formulation is owed.
Carried canned-line watch (same needles as r213): pod-dream closing,
recap stitch verbatim, slope-reading, "Walked in like they'd never
left.", "Take it for what it's worth.", stew-bowl, pod-dream-open.
Report-only.

## Carried bars (r213/r214/r217/r221/r225/r230/r231 shape, re-verified on the new master)
- **SPOTTER BAR:** panel foodXp['spotter'] total ≥ 10 AND every
  panel seed contributes > 0.
- **LADDER BAR (report-only under a SPOTTER GO — r210 metric review:
  pace read):** ≥1 villager reaches 5 XP (skill 1) on ≥3/4 panel
  seeds; report foraging-volume context if it misses.
- **FASTER-ID BAR:** threshold benefit fires on ≥2/4 seeds.
- **END BAR:** every broken-live forage run that (a) broke ≥ 2
  days before the run's end, (b) bearer is the player, (c) the ending
  status was ready on at least one dawn after breaking, is closed by
  the wedge within 2 dawns of breaking. Bearer-change excuse stands.
  NO-OPPORTUNITY = zero broken-live forage runs.
- **STRANDED BAR (carried watch):** previous-bearer runs recorded
  in strandedLog with 0 work performed on them. NO-OPPORTUNITY = zero.
- **TRAVEL BRANCH (carried watch):** homeward sits hitting a
  clearable blockage reach home the same dawn. NO-OPPORTUNITY = zero.
- **THREAD BRANCH (carried watch):** paged (Yara-shape) end
  opportunities closed within 2 dawns.
- **TRUST GUARD (hard, DROP-ONLY):** trust[vid] must not drop
  across any end press. Any drop = defect finding, wedge stops
  ending for the rest of that seed, END BAR NO-GO for that seed.
- **JAM BAR (report-only):** jam-days = dawns on which a promised
  (not yet live) run existed while a broken-live run was live.
- **VILLAGE BAR:** alive at d40 on ≥3/4 panel seeds.
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel seed,
  read in full (meaning, coherence, consequence — not counts).
- **WATER INSTRUMENT (report-only):** count of broken-live water
  runs seen across the panel.
- **SCHOLAR-DEATH STANDING METRIC (r221 metric review, r138 rule):**
  scholar deaths ≤2 per 5-seed panel = WATCH (at bar, report
  causes); ≥3 = investigate the wild-travel risk. r231 sat at 3
  (first ≥3 in the series; 2 of 3 "the wild"; named candidate
  mechanism: the companion guard keeping a mantle-holder out on
  expedition longer — unproven, driver did not record the
  scholar's location at death). **r232 ESCALATION RULE:** if r232
  also shows ≥3, escalate to a matched A/B on the companion guard
  — and this run ADDS the location-at-death instrument now
  (`scholarDawns`: per-dawn scholar location, so each scholar death
  can be read against the last dawn location) so the escalation can
  be judged without another instrument round. The instrument is
  read-only; it changes no game behavior.
- **ROSTER-RECONCILIATION WATCH (r225 anomaly, recurred r230,
  answered r231):** 0 unaccounted on all five r231 seeds with
  departures logged and matched by id. The instrument stays in the
  driver; the open question is whether a departure is ever narrated
  to the player. If a seed does not reconcile, the census names it.

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp`; village knowledge is measured by
codexPlantsEnd + per-villager spotter XP. Also report party
launches and wave-4 kills per seed (profilegate bypass is in the
base since r221; the winnability lane's seed-call arms are all
reverted or env-gated OFF, so launches here are base behavior).
**NEW this run:** standing totals at end per seed (r231 metric
review — attribute the wave-4 unlock move: r231 reached wave 4 on
3/5 seeds vs 0/5 on r230, unlock reads standing only via
`villageStandingTotal()`), and the scholar's last-dawn location
for every scholar death (see SCHOLAR-DEATH above). A full
telemetry type-count map is also recorded at end (read-only) so a
launch/kill signal can be named if telemetry records it.

## Seeds, policy, horizon
Pilot: **101201**. Panel: **101202–101205**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221/r225/r230/
r231 driver shape — no withDelegate/HUNTSTAFF flags). Death-aware
tail +10d. Driver clone is verbatim r231 except run number / EVID
date / output names + the three r232 instruments (standing totals
at end, `scholarDawns` per-dawn scholar location, telemetry
type-count map at end — all read-only, no game behavior). The
analyzer is the r231 analyzer verbatim except run number / file
names + reporting the new instruments (standing totals on the seed
line, scholar-death locations, telemetry type counts). Proof tests:
the r231 settled-help proof test
(`scripts/test-journey-establishment-r231-settled-help-20261117.js`,
19/19), the r230 stage0-help proof test
(`scripts/test-journey-establishment-r230-stage0-help-20261116.js`,
13/13), the r225 stage0-cant proof test
(`scripts/test-journey-establishment-r225-stage0-cant-20261116.js`,
18/18), the r214 mood-goodbye proof test
(`scripts/test-journey-establishment-r214-mood-goodbye.js`, 10/10),
the r139 spotter proof test
(`scripts/test-journey-establishment-r139-spotter.js`, 35/35), and
the r221 want-raise proof test
(`scripts/test-journey-establishment-r221-want-raise-20261116.js`,
7/7) are re-run in this worktree to confirm the mechanisms still
hold on the new base; new proof test only if a defect is found.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 101201–101205 is a MATCHED RE-USE, not a fresh band.**
  It is named in the r230 prereg
  (`evidence/2026-11-16/journey-establishment-r230-prereg.md`,
  "Seeds, policy, horizon" + "Seed-band freshness") and the r231
  prereg (`evidence/2026-11-17/journey-establishment-r231-prereg.md`),
  and was the r230 and r231 panel band. Per the skill's release
  clause, this prereg **RELEASES band 101201–101205 for exactly one
  purpose: the r231-fix matched before/after re-measure (this run,
  r232)**. The release is authorized by the r231 metric review
  ("r232 takes a fresh band UNLESS its prereg explicitly re-releases
  101201–101205 for the r231-fix re-measure (same justification,
  same scoping — the re-measure of THIS fix wants the same
  attribution, and the fix was not tuned to these seeds)").
  Justification: the comparison's validity depends on identical
  seeds — the only difference between the r231 and r232 panels
  must be the base (fix + deathcleanup + titan refusal +
  planignite-inert). The fix was NOT tuned to these seeds (its
  proof is a staged probe, not a panel seed), so re-running them
  cannot launder a tuned result. The release is scoped to this one
  re-measure: after r232 the band returns to forbidden status for
  any other question, and any later establishment run takes a fresh
  band.
- Full-scope search performed before this release (per the skill):
  `git grep -w` over committed `evidence/**/*.md` + `scripts/*.js`
  for 101201–101205: no hits outside r230/r231 lines. Filesystem
  grep over `evidence/*/sim-*-prereg.md` +
  `evidence/*/journey-*-prereg.md`: only the r230 and r231 preregs
  name the band. The r108/r118/r127/r128 "101205" hits are
  pantry-kcal data values (adjudicated NOT seed uses in the r230
  prereg — a kcal count is not a reservation). Checked
  2026-11-17 ~14:05Z.
- Rejected bands (carried): 100901–100903 (named in committed
  evidence .md), 100601–100605, 100701–100705, 6301–6305,
  6401–6405, 6501–6505.
- Contaminated bands NOT reused (r231 list carried): 1502, 1504,
  1603, 1604, 17101–17112, 1142–1151, 1801–1804, 1901–1916,
  2001–2010, 2101–2116, 2201–2216, 2301–2316, 2401–2416,
  100001–100008, 1200–1209, 2501–2516, 2601–2616, 2701–2705,
  2801–2805, 2901–2905, 3001–3005, 3101–3105, 3201–3205,
  5001–5005 (r139), 5101–5105, 5201–5205, 5301–5305, 5401–5405,
  5501–5505 (r210), 5601–5605, 5701–5705, 5801–5805, 5901–5905,
  6001–6005, 6101–6105, 6201–6205 (r213 rejections),
  100501–100505 (r213/r214), 100801–100805 (r217),
  101001–101005 (r221), 101101–101105 (r225).

## Instrument proof (before the panel)
- Analyzer fork proven on the r231 corpus BEFORE the panel
  (r231 JSONs copied to /tmp, renamed to r232 names): every scored
  number reproduces r231 exactly — Q1 13/82 E1 13/13,
  stage-0-deflected 0, stage-0-surfaced 5/13; Q1b 82/297 (27.6%);
  SPOTTER 50, 5/5; LADDER 4/5; FASTER-ID 5/5 (172/255); END 15/15;
  VILLAGE 5/5; Q2 0/10 CUT. The fork changes no scorer logic; the
  new instrument lines report `null`/absent on the old corpus
  (standing totals + scholarDawns + teleTypeCounts were not
  recorded by the r231 driver) without breaking the scores.
- The pilot seed exercises the new instruments directly: standing
  totals present at end, `scholarDawns` recorded per dawn,
  teleTypeCounts present. (Scholar-location-at-death fires only on
  a scholar death — 101201 had none on r231; if the pilot has none,
  the instrument is proven structurally by the per-dawn records,
  and the death-reading is exercised by any panel seed with a
  scholar death.)

## Canon
docs/CANON.md read at run start. docs/CONVERSATIONS.md is the Q1/Q2
area (energy budget + natural ending signal; "Tell me more." depth;
no-repeat ledger; recap reframes are grammar, not content).
KNOWLEDGE.md laws binding the spotter question: "Human skills ≠
alien abilities" (spotter is earthly knowledge — practice earns it,
never a System slot); "identification happens BACK AT CAMP". **No
canon doc covers the favorless-ask mechanism, want-raise rates, or
seed selection rules** — said here instead of inventing canon.
ENCOUNTER-GEAR RULE (Steve 2026-11-13): the journey driver plays
the live village state (real gear/progression, competent policy),
not a staged solo-scholar fixture — same as r137/r138/r139/r210/
r213/r217/r221/r225/r230/r231; proof tests stage for the mechanism
only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design (holder-less
levers, build-medicduty-h), wave-4 kill A/B before anyone touches
the lingerer guard (sim lane), Q4 driver winddown-logging fix
(deepening leg), family 7 UNMEASURED. **Landing r142 F1/F2 are
NOT this run's scope** (R66 starvation margin + pocket stuck turn
live in the landing leg's machinery; the starvation-margin question
belongs to a balance/policy arm). This run does NOT take any of
those builds. The panel's wound-fever/healer numbers are reported
as context only. **planignite CONFIRM NO-GO (2a49a1e82)** — the
lever stays env-gated OFF; not this run's scope.

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND ≥1 people-check sitting is held AND its transcript is written
AND the spotter instruments fire (≥1 bumpPlantFamiliarity wrap
record AND ≥1 villager forage resolution observed) AND the
sittingCloses record is present in the JSON (beatsAfterLastThem
counted) AND wedgeSits carry pick wantIds (Q1b instrument present)
AND ≥1 wedge social sit carries the Q1 trace fields (fromSeed /
seedFavorId / need / ledgerFavor recorded at sit start) AND the
rosterDepartures instrument is present in the JSON (array, possibly
empty) AND the r232 instruments are present (standingEnd non-null,
scholarDawns recorded per dawn, teleTypeCounts present). If the
pilot forces a driver or fix change, the panel restarts on fresh
seeds and the pilot seed is NOT scored — EXCEPT that a driver change
after the pilot on a MATCHED band voids the match: the panel then
restarts on the same band only if the change is instrument-only (no
game behavior); any src/js change forces a fresh-band restart and
the match is abandoned, recorded in the run note.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225/r230/r231 did NOT roll forward. This run's panel is
the r231 driver regime + three read-only instruments on a matched
band — guardrails should stay quiet; any LOUD line is adjudicated
as band noise vs real bug BEFORE rolling the baseline forward.
Metrics: guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths (r135's set). The r231
checker hit the known schema mismatch (the driver never emits
`guardrails.*` fields, so the checker reads missing paths as 0) —
expected again, not a finding. NOTE: this run changes src/js only
if Q1/Q2 warrant a fix; a guardrail move on a no-src-change run
cannot be caused by this run's code — any LOUD line gets adjudicated
as band noise vs a pre-existing drift, and the baseline is NOT
rolled on a mismatch.
