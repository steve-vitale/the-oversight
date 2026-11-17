# Journey leg ESTABLISHMENT — r233 pre-registration (2026-11-17, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231/r232 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never
tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261117T2219Z` (scheduled Tue 2026-11-17
15:45 CST; lock `2026-11-17T22:19:00Z`). Rotation read `1`
(establishment); write `1→2` at closeout with read-back. Run number
r233 (r232 is the last establishment run, 2026-11-17; no r233 evidence
exists). **Base:** local master `5079bee22` (sim-scale-onramp-round-
2025 evidence). Heartbeat loop running (9-min cadence,
`journey-establishment-hbloop-r233.sh`, setsid-detached per the r141
lesson). Pre-flight: main tree CLEAN, disk 42%. Lock created by this
run 2026-11-17T22:19:00Z. No push (ship loop owns pushes).

## Base delta vs r232's panel base `e5028debd` (src/js)
- `truth.js` (+43): **journey-landing r143 (3ba09cec4)** — an
  already-confessed doubt's confront option is spent per sitting
  (was repeating verbatim up to 18x in one sitting). Touches
  sitting shapes directly: any Q1/Q2 movement is adjudicated as
  r143-effect vs band noise, not assumed to be the fix alone.
- `fieldFights.js` (+274) / `party-wiring.js` (+4):
  sim-fightallycap-b (dded39f58) — second ally slot, env-gated
  `FIGHTALLY2=1`. The journey driver sets no env gates, so the
  lever is INERT in this panel; fight outcomes here are base
  behavior (single ally). Any fight-outcome movement is band noise.
- `convoTopics.js` (+73): journey-succession r231 (ec7abcd00) —
  mourning lines stop wearing different names. Transcript wording
  only; read in the people check.
- `conversation.js` (+88): journey-crisis r230 (7eb8ffc22) —
  quote-aware pagination fix. Could change sitting transcripts
  (fewer paged/cut artifacts); adjudicated as base-effect vs band
  noise on any Q2 movement.
- `build.js`: version-bump stamp only (c5af0c082).
- profilegate-b landed AND reverted in range (39e8f10f4 +
  0da095c78): net src/ zero vs r232 base. planignite CONFIRM NO-GO
  stands — lever env-gated OFF, inert.
- Everything else in range: evidence/scripts-only landings and
  version bumps.

## Leg question (r232's named next step)

**Q1 — FAVORLESS ASK, FRESH-BAND RE-READ.** r232 measured the r231
settled-ledger fix on the MATCHED band 101201–101205: 2/77 raised
asks (2.6%) never materialized into a committable favor, both class
E1 (opener never ran — a betrayal case thread pre-empted the
opening), down from r231's 13/82 (15.9%). The matched-band release
is SPENT after r232. This run re-reads the rate on a FRESH band, so
the question is whether the low rate holds on unseen seeds or was
band-specific. Same trace + classifier as r232 (read-only probes;
classes A–E verbatim). Thresholds, pre-registered:
- **GO** = favorless rate < 20% AND zero stage-0 wants resolved
  as 'deflected' AND every favorless sit classified (unknown 0).
- **WATCH** = rate 20–32.8% with the residual mechanism
  classified and a dominant mechanism (≥50%) named; or rate < 20%
  but a NEW dominant class appears (mechanism moved, not fixed).
- **NO-GO** = rate ≥ 32.8% (no improvement) OR any stage-0
  want resolved as 'deflected' (the fix does not hold in the wild).
- Report-only: favorless rate vs r232's 2/77; per-villager repeat
  counts; needs in the favorless sits; class mix vs r232's E1 2/2;
  stage-0-surfaced proxy vs r232's 2/2.

## Q1b — WANT-RAISE, REGRESSION GUARD (r221 Q1, thresholds verbatim)
Per wedge sit, did the NPC raise an ask_favor want at any turn.
- **GO** = panel raise rate ≥10% AND no seed goes a full leg with
  0 raises. **WATCH** = a zero-raise seed whose sits show other
  wants. **NO-GO** = a zero-raise + no-want seed (defect shape).
Report-only: raise rate by want kind (joint forage_help /
water_haul vs other favors).

## Q1c — CASE-THREAD PRE-EMPTION (r232 F1, report-only)
r232's residual was pure thread pre-emption: both E1 sits had a
betrayal case thread filling all 8 turns (6 `betrayal:*:case_N`
picks + goon + silence), the want opener never ran, `dlg:help`
never pressed — and both asks surfaced in a later sitting
(DEFERRED, not lost). The precedence question (should a live
ask_favor want pre-empt a case thread's opening?) is a design
question for the conversation build arm, NOT this run's fix.
This run measures, on a fresh band: among E1 favorless sits, how
many are case-thread-occupied (case picks / total picks, openThread,
`dlg:help` pressed Y/N), and whether each ask later surfaces
(stage-0-surfaced proxy). NEW instrument: the analyzer prints a
Q1c line with those counts (proven on the r232 corpus — it names
both r232 sits exactly). Bars: report-only, EXCEPT a case-thread
E1 whose ask NEVER surfaces later is a LOST ask — a defect
finding, documented with the full transcript and proposed (not
landed) for the build arm. A surfaced ask is a day's delay, not a
defect.

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
- **PARTING-POOL RULE (r232 metric review):** the r214 parting
  lines served 1 on r232 (first serve in three panels), so the
  reachability question is CLOSED — the lines are reachable, rare.
  Keep watching the serve count only.

## Q3 — recap paraphrase (report-only, per-sitting presence, r230 revision)
Distinct total < 6 → report-only (no formulation owed).
Distinct total ≥ 6 → the formulation is over-represented and a
second paraphrase formulation is owed.
Carried canned-line watch (same needles as r213): pod-dream closing,
recap stitch verbatim, slope-reading, "Walked in like they'd never
left.", "Take it for what it's worth.", stew-bowl, pod-dream-open.
Report-only.

## Carried bars (r213/r214/r217/r221/r225/r230/r231/r232 shape, re-verified on the new master)
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
  causes); ≥3 = investigate the wild-travel risk. r231 sat at 3,
  r232 at 4 — the r232 prereg's escalation rule ALREADY TRIGGERED
  (matched A/B on the companion guard is the sim lane's next step,
  not this run's). This run keeps the watch + the location
  instrument (`scholarDawns`) and reports causes; a third straight
  ≥3 is recorded, not re-escalated.
- **ROSTER-RECONCILIATION WATCH (r225 anomaly, recurred r230,
  answered r231/r232):** 0 unaccounted on all five r232 seeds with
  departures logged and matched by id. The instrument stays in the
  driver; the open question is whether a departure is ever narrated
  to the player. If a seed does not reconcile, the census names it.

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp`; village knowledge is measured by
codexPlantsEnd + per-villager spotter XP. Also report party
launches and wave-4 kills per seed (FIGHTALLY2 is env-gated OFF, so
launches here are base behavior). Standing totals at end per seed
(r232: wave 4 tracks standing 100, t4=100 — re-check the split on
the fresh band) and the scholar's last-dawn location for every
scholar death. A full telemetry type-count map is recorded at end
(read-only) so a launch/kill signal can be named if telemetry
records it.

## Seeds, policy, horizon
Pilot: **101301**. Panel: **101302–101305**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221/r225/r230/
r231/r232 driver shape — no withDelegate/HUNTSTAFF flags).
Death-aware tail +10d. Driver clone is verbatim r232 except run
number / seed band / output names + header comment (no game
behavior change; the three r232 read-only instruments stay).
The analyzer is the r232 analyzer verbatim except run number /
file names / the Q1 comparison line (now vs r232's 2/77) + the
new Q1c case-thread line (read-only reporting). Proof tests:
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
- **Band 101301–101305 is FRESH.** Full-scope search performed
  2026-11-17 ~22:20Z before this prereg: `git grep -w` over
  committed `evidence/**/*.md` + `scripts/*.js` for each of
  101301–101305: zero hits (exit 1). Filesystem grep over
  `evidence/*/sim-*-prereg.md` + `evidence/*/journey-*-prereg.md`:
  no file names the band. The only `101301` hits anywhere are
  digit-substrings inside floating-point values in two
  rage-precheck panel case JSONs
  (`evidence/2026-11-14/panel-rageprecheck-b-confirm-after/cases/5c7f668593f8af0630525fe7e6ec3f8cf77ab911f002d0a35826470e79a06098.json`
  and the matching `-before` case file — e.g. `149.4101301081662`
  contains `101301` as digits, not a seed) — adjudicated NOT seed
  uses, same class as the r230 prereg's kcal-value adjudication.
- Rejected bands (carried): 100901–100903, 100601–100605,
  100701–100705, 6301–6305, 6401–6405, 6501–6505.
- Contaminated bands NOT reused (r232 list carried):
  101201–101205 (matched-band release SPENT after r232 — forbidden
  again for any other question), 1502, 1504, 1603, 1604,
  17101–17112, 1142–1151, 1801–1804, 1901–1916, 2001–2010,
  2101–2116, 2201–2216, 2301–2316, 2401–2416, 100001–100008,
  1200–1209, 2501–2516, 2601–2616, 2701–2705, 2801–2805,
  2901–2905, 3001–3005, 3101–3105, 3201–3205, 5001–5005 (r139),
  5101–5105, 5201–5205, 5301–5305, 5401–5405, 5501–5505 (r210),
  5601–5605, 5701–5705, 5801–5805, 5901–5905, 6001–6005,
  6101–6105, 6201–6205 (r213 rejections), 100501–100505
  (r213/r214), 100801–100805 (r217), 101001–101005 (r221),
  101101–101105 (r225).

## Instrument proof (before the panel)
- Analyzer fork proven on the r232 corpus BEFORE the panel
  (r232 JSONs + convo txts copied to /tmp/r233-analyzer-proof,
  renamed to r233 names): every scored number reproduces r232
  exactly — Q1 2/77 E1 2/2, stage-0-deflected 0, stage-0-surfaced
  2/2; Q1b 77/293 (26.3%); SPOTTER 41, 5/5; LADDER 3/5; FASTER-ID
  5/5 (174/255); END 15/16; VILLAGE 5/5; Q2 0/10 CUT; Q3 distinct
  0; parting tomorrow=1. The new Q1c line names both r232 F1 sits
  exactly (Ava d20 grief 6/8 case picks dlg:help NO; Chantal d15
  lately 6/8 dlg:help NO). The fork changes no scorer logic.
- The pilot seed exercises the instruments directly: standing
  totals present at end, `scholarDawns` recorded per dawn,
  teleTypeCounts present. (Scholar-location-at-death fires only on
  a scholar death; if the pilot has none, the instrument is proven
  structurally by the per-dawn records, and the death-reading is
  exercised by any panel seed with a scholar death.)

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
r213/r217/r221/r225/r230/r231/r232; proof tests stage for the
mechanism only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design (holder-less
levers, build-medicduty-h), wave-4 kill A/B + companion-guard A/B
(sim lane), family 7 UNMEASURED. **Landing r143 F1/F2 are NOT this
run's scope** (R66 starvation margin + pocket stuck turn live in the
landing leg's machinery). This run does NOT take any of those
builds. The panel's wound-fever/healer numbers are reported as
context only. **Q1c precedence is a design question for the
conversation build arm** — this run measures it, documents it, and
proposes nothing to land unilaterally.

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
empty) AND the r233 instruments are present (standingEnd non-null,
scholarDawns recorded per dawn, teleTypeCounts present). If the
pilot forces a driver or fix change, the panel restarts on fresh
seeds and the pilot seed is NOT scored — EXCEPT that a driver change
after the pilot on a FRESH band voids the band only if the change
is game behavior (instrument-only changes keep the band, recorded
in the run note); any src/js change forces a fresh-band restart.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225/r230/r231/r232 did NOT roll forward. This run's panel
is the r232 driver regime + one read-only analyzer line on a fresh
band — guardrails should stay quiet; any LOUD line is adjudicated
as band noise vs real bug BEFORE rolling the baseline forward.
Metrics: guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths (r135's set). The r232
checker hit the known schema mismatch (the driver never emits
`guardrails.*` fields, so the checker reads missing paths as 0) —
expected again, not a finding. NOTE: this run changes src/js only
if Q1/Q2 warrant a fix; a guardrail move on a no-src-change run
cannot be caused by this run's code — any LOUD line gets adjudicated
as band noise vs a pre-existing drift, and the baseline is NOT
rolled on a mismatch.
