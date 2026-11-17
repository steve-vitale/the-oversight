# Journey leg ESTABLISHMENT — r230 pre-registration (2026-11-16, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225 precedent). Death-aware:
stop after 10 consecutive all-dead daily checks; never tick a dead
village to fill the leg.

## Run
Run id `playtest-loop-a-20261116T2239Z` (scheduled Mon 2026-11-16
15:45 CST; lock `2026-11-16T22:40:24Z`). Rotation read `1`
(establishment); write `1→2` at closeout with read-back. Run number
r230 (r229 is Lane B succession, in flight as journey2-succession-r229
at run start; no r230 evidence exists). **Base:** local master
`63fa44d6c` (landing r140). Heartbeat loop running (10-min cadence,
`journey-establishment-hbloop-r230.sh`, pid 45741); registration
heartbeat landed 22:43:39Z; re-heartbeat 23:10:07Z. Pre-flight: main
tree CLEAN, disk 45%. Lock created by this run 2026-11-16T22:40:24Z.
No push (ship loop owns pushes). Registration took ~14 min (queued
behind the reaper's registry lock + a Loop B registration — same
shape as r225's ~5.6 min, longer under box load); the first
post-registration heartbeat took ~13.5 min in the same queue and
landed 23:10:07Z, 26 min after the registration heartbeat — the
standing <15-min heartbeat rule was breached by lock contention, not
by this run idling; the hbloop is running and the queue has drained
(the Loop B tree exists).

## Base delta vs r225's base `b659acdd5` (src/js)
- `conversation.js` / `convo-dialogue.js`: r225 fix itself
  (83c7dc3c7) — stage-0 want is not live; favorless asks no longer
  resolve as refused unheard. This run's Q1 is the re-measure of
  that fix.
- `conversation.js`: crisis r228 C3c stale-favor resume opener +
  F2 narration-quote guard (7ebb2b26e). C3c touches the resume
  pre-emption path that WAS r225's mechanism (a resume/recall/case
  thread pre-empted the opening, so the fresh ask_favor want waited
  at stage 0). The re-measure must adjudicate any rate change as
  fix-effect vs C3c-effect: the analyzer's class mix does this —
  if favorless sits are still class E1 (opener never ran), the
  pre-emption shape survives C3c; if the class mix moves (e.g.
  toward C or a new class), C3c changed the shape and the run says
  so instead of crediting the r225 fix alone.
- `conversation.js` / `convo-dialogue.js`: social-life r226 F6
  dry-opener guard (03fee239a) — ledger-blocked lines fall to a
  fresh phrasing, never the dry line. Touches openers; may move
  the Q3 canned-line counts (report-only).
- `conversation.js`: landing r140 warn_you heed fix (6436b14c8) —
  silent heed turns now deepen + resolve as heeded, plus a
  close/budget stop. Touches the Q2 sitting-close area; Q2 is
  re-measured on this base, not assumed to hold.
- Endgame r225 F5 settled-favor variants (3ba7f0516): settled-favor
  lines in conversation.js; touches favor-ledger display, not the
  want arc directly.
- Sim arms in range are all reverted (launchsurvive seed call,
  trickteach lever, haventick seed call, seedpaths seed call):
  net src/ diff 0. Version bumps only otherwise.
- Everything else in range: evidence/scripts-only landings.

## Leg question (r225's named next Q1)

**Q1 — FAVORLESS ASK, RE-MEASURE ON THE FIXED CODE.** r225 proved
19/58 raised asks (32.8%) never materialized into a committable
favor: the want opener never ran because a resume/recall/case thread
pre-empted the opening, so the fresh ask_favor want waited at stage
0 with a LIVE need and no favor attached — and `dlg:cant` / the
generic `deflect_q` branch then resolved it as refused unheard.
The fix (stage 1–2 required for a live want; deflect engages only
for a live want) landed in this base. This run re-measures the
rate on the fixed code and checks whether stage-0 wants now
surface as proper asks at a later sitting.

Same trace + classifier as r225 (read-only probes; classes A–E
verbatim). Thresholds, pre-registered:
- **GO** = favorless rate < 20% (r225: 32.8%) AND zero stage-0
  wants resolved as 'deflected' (the r225 defect shape — no
  `dlg:cant` / `deflect_q` resolution at stage 0) AND every
  favorless sit classified (unknown 0).
- **WATCH** = rate 20–32.8% with the residual mechanism
  classified and a dominant mechanism (≥50%) named; or rate < 20%
  but a NEW dominant class appears (mechanism moved, not fixed).
- **NO-GO** = rate ≥ 32.8% (no improvement) OR any stage-0
  want resolved as 'deflected' (the fix does not hold in the wild).
- Report-only: favorless rate vs r225's 19/58; per-villager repeat
  counts; needs in the favorless sits; class mix vs r225's E1 19/19
  (adjudicates fix-effect vs C3c-effect per the base delta above);
  stage-0 wants that surface later: count of villagers whose
  favorless sit is followed in a LATER sitting by the same want
  opening with a kind attached (stage ≥1 + favor kind) — read from
  the trace records where the analyzer can join them, otherwise
  read by hand on 2–3 cases in the run note and reported as
  hand-read, not analyzer-scored.

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
  servings of a ledger-blocked line).

## Q3 — recap paraphrase (report-only, REVISED per r225 metric review)
r225 found the instrument double-counts: the analyzer counts
canned-line needles by raw `indexOf` over the whole convo txt file,
but each sitting is printed TWICE in that file (turn log +
FULL-TRANSCRIPT). Raw 8 = 4 distinct sittings (r221: raw 2 = 1
distinct). This run counts PER-SITTING PRESENCE: a needle in a
sitting counts once. Threshold recalibrated against the distinct
history (r221: 1, r225: 4):
- Distinct total < 6 → report-only (no formulation owed).
- Distinct total ≥ 6 → the formulation is over-represented and a
  second paraphrase formulation is owed.
Carried canned-line watch (same needles as r213): pod-dream closing,
recap stitch verbatim, slope-reading, "Walked in like they'd never
left.", "Take it for what it's worth.", stew-bowl, pod-dream-open.
Report-only. The analyzer is revised to the per-sitting rule BEFORE
the panel runs; the revision is stated here, not applied mid-run.

## Carried bars (r213/r214/r217/r221/r225 shape, re-verified on the new master)
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
  causes); ≥3 = investigate the wild-travel risk. r137/r138/r217/
  r221 sat at 2, r225 at 1 — all "lost in the wild".
- **ROSTER-RECONCILIATION WATCH (r225 anomaly):** seed 101101 lost
  Morgan and Naran d11–13 with NO death record of any kind (roster
  11→9→8 while only Jesse's death is recorded d12). This run
  reconciles every seed (start − villager deaths = end roster) and
  checks whether departures are ever logged — if a seed does not
  reconcile, the census names it and checks the departure record
  before claiming the count is complete. One seed, not a defect
  claim unless it recurs.

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp`; village knowledge is measured by
codexPlantsEnd + per-villager spotter XP. Also report party
launches and wave-4 kills per seed (profilegate bypass is in the
base since r221; the winnability lane's seed-call arms are all
reverted, so launches here are base behavior).

## Seeds, policy, horizon
Pilot: **101201**. Panel: **101202–101205**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221/r225 driver
shape — no withDelegate/HUNTSTAFF flags). Death-aware tail +10d.
Driver clone is verbatim r225 except run number / EVID date /
output names + the Q3 per-sitting counting fix in the analyzer
(stated above; the driver itself is unchanged). Proof tests: the
r225 stage0-cant proof test
(`scripts/test-journey-establishment-r225-stage0-cant-20261116.js`,
16/16), the r214 mood-goodbye proof test
(`scripts/test-journey-establishment-r214-mood-goodbye.js`, 10/10),
the r139 spotter proof test
(`scripts/test-journey-establishment-r139-spotter.js`, 35/35), and
the r221 want-raise proof test
(`scripts/test-journey-establishment-r221-want-raise-20261116.js`,
7/7) are re-run in this worktree to confirm the mechanisms still
hold on the new base; new proof test only if a defect is found.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 101201–101205 is FRESH.** `git grep -w` over committed
  `evidence/**/*.md` + `scripts/*.js`: zero hits for 101201–101204;
  101205 appears ONLY as a pantry-kcal data value (`pantryKcal
  101205` in evidence/2026-11-06/journey-establishment-r108.md,
  2026-11-09/journey-establishment-r118.md,
  2026-11-10/journey-establishment-r127.md,
  2026-11-10/journey-establishment-r128.md). `git grep -w` for
  101201 over all committed evidence: only pantry-kcal data values
  (`"pantry": 101201`, `"pantryKcal":101201`,
  `"pantryBefore":101201`, `"pantryAfter":101201` in
  evidence/2026-10-20/perseed-relaydarkcost/control/leadfeast/
  s64202.json and evidence/2026-11-01/
  sim-gardenpool-b-confirm-armed.jsonl). Adjudicated NOT a seed
  use (same shape as r225's 101101 kcal adjudication): a kcal
  count is not a reservation. Filesystem grep over `evidence/*/sim-*-prereg.md`
  + `evidence/*/journey-*-prereg.md`: zero hits for all five
  numbers. Checked 2026-11-16 ~23:10Z.
- Rejected bands (carried): 100901–100903 (named in committed
  evidence .md), 100601–100605, 100701–100705, 6301–6305,
  6401–6405, 6501–6505.
- Contaminated bands NOT reused (r225 list carried): 1502, 1504,
  1603, 1604, 17101–17112, 1142–1151, 1801–1804, 1901–1916,
  2001–2010, 2101–2116, 2201–2216, 2301–2316, 2401–2416,
  100001–100008, 1200–1209, 2501–2516, 2601–2616, 2701–2705,
  2801–2805, 2901–2905, 3001–3005, 3101–3105, 3201–3205,
  5001–5005 (r139), 5101–5105, 5201–5205, 5301–5305, 5401–5405,
  5501–5505 (r210), 5601–5605, 5701–5705, 5801–5805, 5901–5905,
  6001–6005, 6101–6105, 6201–6205 (r213 rejections),
  100501–100505 (r213/r214), 100801–100805 (r217),
  101001–101005 (r221), 101101–101105 (r225).

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
r213/r217/r221/r225; proof tests stage for the mechanism only, not
a combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design (holder-less
levers, build-medicduty-h), wave-4 kill A/B before anyone touches
the lingerer guard (sim lane), Q4 driver winddown-logging fix
(deepening leg), family 7 UNMEASURED. **Landing r139 F1 is CLOSED:**
landing r140 landed the warn_you heed fix (6436b14c8) — this run
does NOT re-take it. This run does NOT take any of those builds.
The panel's wound-fever/healer numbers are reported as context
only.

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND ≥1 people-check sitting is held AND its transcript is written
AND the spotter instruments fire (≥1 bumpPlantFamiliarity wrap
record AND ≥1 villager forage resolution observed) AND the
sittingCloses record is present in the JSON (beatsAfterLastThem
counted) AND wedgeSits carry pick wantIds (Q1b instrument present)
AND ≥1 wedge social sit carries the Q1 trace fields (fromSeed /
seedFavorId / need / ledgerFavor recorded at sit start). If the
pilot forces a driver or fix change, the panel restarts on fresh
seeds and the pilot seed is NOT scored.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225 did NOT roll forward. This run's panel is the r225
driver regime + Q3 analyzer counting fix on a fresh band —
guardrails should stay quiet; any LOUD line is adjudicated as band
noise vs real bug BEFORE rolling the baseline forward. Metrics:
guardrails.deaths, guardrails.popAlive, guardrails.pantryKcal,
c3.starvationDeaths (r135's set). The r225 checker hit the known
schema mismatch (the driver never emits `guardrails.*` fields, so
the checker reads missing paths as 0) — expected again, not a
finding. NOTE: this run changes src/js only if Q1/Q2 warrant a
fix; a guardrail move on a no-src-change run cannot be caused by
this run's code — any LOUD line gets adjudicated as band noise vs
a pre-existing drift, and the baseline is NOT rolled on a mismatch.
