# Journey leg ESTABLISHMENT — r231 pre-registration (2026-11-17, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230 precedent). Death-aware:
stop after 10 consecutive all-dead daily checks; never tick a dead
village to fill the leg.

## Run
Run id `playtest-loop-a-20261117T0759Z` (scheduled Tue 2026-11-17 01:45
CST; lock `2026-11-17T08:00:32Z`). Rotation read `1` (establishment);
write `1→2` at closeout with read-back. Run number r231 (r230 is the
last establishment run, 2026-11-16; no r231 evidence exists).
**Base:** local master `dbeb1493f` (journey-landing r141). Heartbeat
loop running (9-min cadence,
`journey-establishment-hbloop-r231.sh`, pid 27420, setsid-detached
per the r141 lesson); registration heartbeat landed ~08:02Z.
Pre-flight: main tree CLEAN, disk 46%. Lock created by this run
2026-11-17T08:00:32Z. No push (ship loop owns pushes). Registration
took ~2 min; worktree `git status` is slow on first run under box
load (timed out at 60s — index restat warming; the run proceeds
with file tools while it warms).

## Base delta vs r230's base `63fa44d6c` (src/js)
- `convo-wants.js` / `convo-dialogue.js`: **the r230 fix itself
  (b9300b938)** — `convoWantMenu` now offers `dlg:help` for a
  stage-0 ask_favor want with a live need. This run's Q1 is the
  re-measure of that fix, on a MATCHED band (see Seeds below).
- `conversation.js`: social-life r231 C3d fix (db83d5ccd) — recap
  names the live want when the thread log is empty. Touches recap
  text; may move the Q3 recap-paraphrase counts (report-only) and
  the Q2 close area; Q2/Q3 are re-measured on this base, not
  assumed to hold.
- `villager-agency.js` / `villager-brain.js`: companion guard ships
  UNCONDITIONAL (2ac1e0566, instrument 4e47b173c) — a companion call
  no longer overwrites a villager's live expedition (orphans 2→0
  on the sim lane). Touches expedition/companion behavior; the
  establishment driver's travel-out wedge travels with a companion,
  so any travel-out / stranded movement is adjudicated as
  guard-effect vs band noise, not assumed to be the fix.
- `sim-vetreengage-a` (46426eb2e): wave-4 re-engagement party lever
  behind the VETREENGAGE env gate, default OFF. The journey driver
  sets no env gates, so the lever is inert in this panel; party
  launches here are base behavior. Noted so a launch uptick is not
  misread as the lever.
- `sim-nightcarry-a` (2e31c9563, reverted cd32c023a),
  `sim-rumortarget-a` (97dfb11e, reverted 28930ed75),
  `sim-trickshare-a` (7f2b0e9fd, reverted 1b2745811): levers
  reverted, net src/ diff 0 per their commit messages.
- Everything else in range: evidence/scripts-only landings and
  version bumps.

## Leg question (r230's named next Q1)

**Q1 — FAVORLESS ASK, RE-MEASURE OF THE r230 FIX.** r230 proved
26/74 raised asks (35.1%) never materialized into a committable
favor, all class E1 (opener never ran — a resume/recall/case thread
pre-empted the opening, the fresh ask_favor want waited at stage 0)
— and landed the fix the same run: the menu now offers `dlg:help`
for a stage-0 ask_favor want with a live need, so the ask is
reachable through the actual player model (the r230 probe showed
the wedge pressing it on turn 0). This run re-measures the rate on
the fixed code, on the SAME seeds as r230, so the only difference
between the two panels is the base (fix + C3d + companion guard).
The analyzer's class mix adjudicates fix-effect vs the other base
changes: if E1 collapses and the rate falls, the fix did it; if E1
persists at the same rate, the menu offer is not reaching the wedge
(goon pre-empts help, or the sit ends before help is pressed); if
the class mix moves elsewhere, the run says so instead of crediting
the fix alone.

Same trace + classifier as r230 (read-only probes; classes A–E
verbatim). Thresholds, pre-registered:
- **GO** = favorless rate < 20% (r230: 35.1%) AND zero stage-0
  wants resolved as 'deflected' (the r225 defect shape — no
  `dlg:cant` / `deflect_q` resolution at stage 0) AND every
  favorless sit classified (unknown 0).
- **WATCH** = rate 20–32.8% with the residual mechanism
  classified and a dominant mechanism (≥50%) named; or rate < 20%
  but a NEW dominant class appears (mechanism moved, not fixed).
- **NO-GO** = rate ≥ 32.8% (no improvement) OR any stage-0
  want resolved as 'deflected' (the fix does not hold in the wild).
- Report-only: favorless rate vs r230's 26/74; per-villager repeat
  counts; needs in the favorless sits; class mix vs r230's E1 26/26
  (adjudicates fix-effect vs C3d/guard-effect per the base delta
  above); stage-0-surfaced proxy vs r230's 5/26 (same-villager
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

## Q3 — recap paraphrase (report-only, per-sitting presence, r230 revision)
Distinct total < 6 → report-only (no formulation owed).
Distinct total ≥ 6 → the formulation is over-represented and a
second paraphrase formulation is owed.
Carried canned-line watch (same needles as r213): pod-dream closing,
recap stitch verbatim, slope-reading, "Walked in like they'd never
left.", "Take it for what it's worth.", stew-bowl, pod-dream-open.
Report-only.

## Carried bars (r213/r214/r217/r221/r225/r230 shape, re-verified on the new master)
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
  causes); ≥3 = investigate the wild-travel risk. r230 sat at 0
  (first zero in the r137–r230 run).
- **ROSTER-RECONCILIATION WATCH (r225 anomaly, recurred r230):**
  seeds 101101 (r225) and 101201 (r230) each lost two villagers
  with NO death record of any kind. This run closes the instrument
  gap the r230 metric review named: the driver now logs
  `rosterDepartures` — every dawn, any roster id that vanished
  since the previous dawn, with the day, the name from the start
  census, and whether a death record exists for it. The analyzer
  reconciles per seed: start roster − end roster − villager deaths
  (telemetry kind villager/person) = unaccounted; each unaccounted
  id must appear in rosterDepartures with its day. Matching is by
  ID, not name: the death record's `who` is the villager id
  (corpses.js), but its resolved name is the KNOWN name at end of
  run, which differs from the start-census name ("A person, maybe
  30s" vs "Wei") — name-only matching was proven on the r230 corpus
  to undercount (101204/101205 read UNACCOUNTED=2 by name; the
  driver now records the death id, so the analyzer matches by id
  with the name match as fallback). If a seed does not reconcile,
  the census names it; if departures ARE logged and the ids match,
  the watch is answered as "departures happen and are now
  recorded" and the next question is whether the departure itself
  is ever narrated to the player. One seed, not a defect claim
  unless it recurs — but a third occurrence WITH the departure
  instrument in place turns it into a defect finding about
  un-narrated departures.

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp`; village knowledge is measured by
codexPlantsEnd + per-villager spotter XP. Also report party
launches and wave-4 kills per seed (profilegate bypass is in the
base since r221; the winnability lane's seed-call arms are all
reverted or env-gated OFF, so launches here are base behavior).

## Seeds, policy, horizon
Pilot: **101201**. Panel: **101202–101205**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221/r225/r230
driver shape — no withDelegate/HUNTSTAFF flags). Death-aware tail
+10d. Driver clone is verbatim r230 except run number / EVID date /
output names + the `rosterDepartures` instrument (stated above;
the driver itself is otherwise unchanged). The analyzer is the
r230 analyzer verbatim except run number / file names + the
roster-reconciliation section (stated above). Proof tests: the
r230 stage0-help proof test
(`scripts/test-journey-establishment-r230-stage0-help-20261116.js`,
13/13), the r225 stage0-cant proof test
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
- **Band 101201–101205 is a MATCHED RE-USE, not a fresh band.**
  It is named in the r230 prereg
  (`evidence/2026-11-16/journey-establishment-r230-prereg.md`,
  "Seeds, policy, horizon" + "Seed-band freshness") and was the
  r230 panel band. Per the skill's release clause, this prereg
  **RELEASES band 101201–101205 for exactly one purpose: the
  r230-fix matched before/after re-measure (this run, r231)**.
  Justification: the comparison's validity depends on identical
  seeds — the only difference between the r230 and r231 panels
  must be the base (fix + C3d + companion guard). The fix was
  NOT tuned to these seeds (its proof is a staged probe, not a
  panel seed), so re-running them cannot launder a tuned result.
  The release is scoped to this one re-measure: after r231 the
  band returns to forbidden status for any other question, and
  any later establishment run takes a fresh band.
- Full-scope search performed before this release (per the skill):
  `git grep -w` over committed `evidence/**/*.md` + `scripts/*.js`
  for 101201–101205: the only hits are the r230 prereg/run note
  and the r230 driver/analyzer filenames (the reservation itself),
  plus pantry-kcal data values for 101201/101205 in older evidence
  (adjudicated NOT seed uses in the r230 prereg — a kcal count is
  not a reservation). Filesystem grep over
  `evidence/*/sim-*-prereg.md` + `evidence/*/journey-*-prereg.md`:
  no other naming. Checked 2026-11-17 ~08:10Z.
- Rejected bands (carried): 100901–100903 (named in committed
  evidence .md), 100601–100605, 100701–100705, 6301–6305,
  6401–6405, 6501–6505.
- Contaminated bands NOT reused (r230 list carried): 1502, 1504,
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
- Analyzer fork proven on the r230 corpus BEFORE the panel
  (r230 JSONs copied to /tmp, renamed to r231 names): every scored
  number reproduces r230 exactly — Q1 26/74 E1 26/26, stage-0-
  deflected 0, stage-0-surfaced 5/26; Q1b 74/310 (23.9%); SPOTTER
  60, 5/5; LADDER 4/5; FASTER-ID 5/5 (172/249); END 14/14; VILLAGE
  5/5. The fork changes no scorer logic.
- The same proof run exposed the name-only reconciliation flaw
  (above): on the id-less r230 corpus, 101204/101205 read
  UNACCOUNTED=2 by name while r230's hand reconciliation was exact
  — the death record's resolved name ("Wei") differs from the
  start-census name ("A person, maybe 30s, with a broad frame").
  The driver now records the death id (corpses.js `who` is the
  villager id) and the analyzer matches by id, name as fallback.
  The old corpus cannot prove id-matching (no ids recorded); the
  pilot seed 101201 exercises the departure instrument directly
  (r230 lost 2 villagers there on d16), and any panel seed with a
  villager death exercises the id match.

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
r213/r217/r221/r225/r230; proof tests stage for the mechanism only,
not a combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design (holder-less
levers, build-medicduty-h), wave-4 kill A/B before anyone touches
the lingerer guard (sim lane), Q4 driver winddown-logging fix
(deepening leg), family 7 UNMEASURED. **Landing r141 F1/F2 are
NOT this run's scope** (M-PR1 miss + verbatim repeats live in the
landing leg's bridge-pool machinery; the fix is owned by the
bridge-memory build arm). This run does NOT take any of those
builds. The panel's wound-fever/healer numbers are reported as
context only.

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
empty). If the pilot forces a driver or fix change, the panel
restarts on fresh seeds and the pilot seed is NOT scored — EXCEPT
that a driver change after the pilot on a MATCHED band voids the
match: the panel then restarts on the same band only if the change
is instrument-only (no game behavior); any src/js change forces a
fresh-band restart and the match is abandoned, recorded in the run
note.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225/r230 did NOT roll forward. This run's panel is the
r230 driver regime + rosterDepartures instrument on a matched band —
guardrails should stay quiet; any LOUD line is adjudicated as band
noise vs real bug BEFORE rolling the baseline forward. Metrics:
guardrails.deaths, guardrails.popAlive, guardrails.pantryKcal,
c3.starvationDeaths (r135's set). The r230 checker hit the known
schema mismatch (the driver never emits `guardrails.*` fields, so
the checker reads missing paths as 0) — expected again, not a
finding. NOTE: this run changes src/js only if Q1/Q2 warrant a
fix; a guardrail move on a no-src-change run cannot be caused by
this run's code — any LOUD line gets adjudicated as band noise vs
a pre-existing drift, and the baseline is NOT rolled on a mismatch.
