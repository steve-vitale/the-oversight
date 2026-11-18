# Journey leg ESTABLISHMENT — r241 pre-registration (2026-11-18, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231/r232/r233/r240
precedent). Death-aware: stop after 10 consecutive all-dead daily
checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261118T195358Z` (scheduled Wed 2026-11-18
13:45 CST; lock `2026-11-18T19:53:58Z`). Rotation read `1`
(establishment); write `1→2` at closeout with read-back. Run number
r241 (r240 is the last establishment run, 2026-11-18 07:45 CST).
**Base:** local master `6a97f3a07` (verified = worktree HEAD at
registration). Heartbeat loop running (9-min cadence, background
exec). Pre-flight: main tree CLEAN, disk 49%. Lock created by
coordinator 2026-11-18T19:53:58Z. No push (ship loop owns pushes).

## Base delta vs r240's panel base `0b7a1f524` (src/js, 5 commits)
- `476f43e1d` journey-establishment r240: walkHome names the FIRST
  homeward refusal + clearableBlocked; travelHome84 prefers it.
  **THE fix under re-read this run** — r240's END BAR missed 11/14
  because a creek overwrote the tree in the blocked record and the
  scholar never got home. The END BAR re-reads on a fresh band with
  this fix in; any movement is the fix's effect, adjudicated
  against the r240 miss mechanism, not as band noise alone.
- `8747d1bcd` journey-scale r242: tableSitting() — the r233-owed
  tableActive distinction (mercy is not a live sitting)
  [needs-eyes]. Endgame table machinery; inert at day 42. No
  establishment-leg behavior expected.
- `6f614ce66` + `11f9e87ca` journey-crisis r241: mime-walk
  invitation + Wren cache note rotate through 6-variant pools,
  no-repeat per villager [needs-eyes]. Transcript wording only;
  could move Q3 canned-line counts marginally (new variants). No
  sitting-close mechanism touched.
- `5c1976462` version-bump stamp only.
- `a85627205` journey-landing r145: door-skip for fight steps —
  **the COMPETENT POLICY changed, not the game**: fight dodge +
  approach steps in `scripts/policies/competent.js` now skip door
  tiles (a dodge onto a hall door fled a fight with 4 allies
  behind on r145 seed 1234). The r241 driver uses the current
  competent policy, so the panel runs under the new policy. Could
  move fight deaths/outcomes — adjudicated as base-effect vs band
  noise, not assumed to be the panel.
- Everything else in range: evidence/scripts-only landings
  (scale r242 analyzer + run note, crisis r241 run note,
  succession r233 run note, deepening r237, partysize4-b,
  fightcap-dmg-a, wildavoid-confirm-a, aidleave-b, fleshout
  evidence rounds).
- **None of the above touches the settled-ledger favorless-ask
  mechanism, the sitting-close machinery, or the freeloader
  pipeline.** Q1/Q1b/Q1c/Q2/Q5 bars carry verbatim; any movement
  on them is band noise unless the mechanism is named.

## Leg question (r240's named next step, first)

**END BAR RE-READ WITH THE WALKHOM FIX IN.** r240's END BAR
missed 11/14: the two misses were both on the collapse seed
101401 (Benoit broken d9, Elijah broken d28 — 11 end attempts,
all 'end-stranded'), mechanism named (F1: creek overwrote the
tree in `blocked`, travelHome84 saw 'creek', never cleared
anything) and fixed with a proof test (r240 27/27). Thresholds
verbatim from the r240 prereg END BAR: every broken-live forage
run that (a) broke ≥ 2 days before the run's end, (b) bearer is
the player, (c) the ending status was ready on at least one dawn
after breaking, is closed by the wedge within 2 dawns of
breaking. Bearer-change excuse stands. **GO** = every
opportunity closed within 2 dawns. **MISS** = any opportunity
open past 2 dawns — mechanism named, fixed with a proof test if
the cause is in the walkHome/travelHome84 area; otherwise
documented for the build arm. The r240 residual (walkHome still
steps back onto a tile already on its path when that step is a
homeward axis step — the (4,2)→(5,2)→(4,2) oscillation) is a
watch item: a walk with NO clearable refusal that burns steps
bouncing is a finding, documented with the geometry, not fixed
in this run unless the fix is a one-line guard with a proof
test.

**Q1 — FAVORLESS ASK, FOURTH FRESH-BAND RE-READ.** r231 13/82
(15.9%) → r232 2/77 (2.6%) → r233 1/53 (1.9%) → r240 1/70
(1.4%). Same trace + classifier as r232/r233/r240 (read-only
probes; classes A–E verbatim). Thresholds, pre-registered:
- **GO** = favorless rate < 20% AND zero stage-0 wants resolved
  as 'deflected' AND every favorless sit classified (unknown 0).
- **WATCH** = rate 20–32.8% with the residual mechanism
  classified and a dominant mechanism (≥50%) named; or rate < 20%
  but a NEW dominant class appears (mechanism moved, not fixed).
- **NO-GO** = rate ≥ 32.8% (no improvement) OR any stage-0
  want resolved as 'deflected' (the fix does not hold in the wild).
- Report-only: favorless rate vs r240's 1/70; per-villager repeat
  counts; needs in the favorless sits; class mix vs r240's E1 1/1;
  stage-0-surfaced proxy vs r240's 1/1.

## Q1b — WANT-RAISE, REGRESSION GUARD (r221 Q1, thresholds verbatim)
Per wedge sit, did the NPC raise an ask_favor want at any turn.
- **GO** = panel raise rate ≥10% AND no seed goes a full leg with
  0 raises. **WATCH** = a zero-raise seed whose sits show other
  wants. **NO-GO** = a zero-raise + no-want seed (defect shape).
- **F5 per-seed floor watch (r233 F5, CLOSED on r240):** r240's
  thinnest seed raised at 16.4% (r233's thin seeds were 5.8–6.2%).
  If this panel ALSO shows a thin seed under 7% while fat seeds
  clear 15%, the floor question re-opens in the NEXT run's prereg
  (this run only records the spread).
Report-only: raise rate by want kind (joint forage_help /
water_haul vs other favors).

## Q1c — CASE-THREAD PRE-EMPTION (r232 F1 residual, report-only)
Same as r233/r240: among E1 favorless sits, how many are
case-thread-occupied (case picks / total picks, openThread,
`dlg:help` pressed Y/N), and whether each ask later surfaces
(stage-0-surfaced proxy). Bars: report-only, EXCEPT a case-thread
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
- Report-only: r214 parting-pool serves in the wild; r224 F4a/F4b/F4c
  dry-line fixes hold in the wild (0 recurrences in their classes);
  r228 C3c/F2 fixes hold in the wild (0 recurrences in their
  classes); r226 F6 dry-opener guard holds in the wild (0 dry
  servings of a ledger-blocked line); C3d recap fix holds in the
  wild (recap names the live want — read on 1–2 sittings).
- **F2 echo watch (r240 F2, third sighting):** the engine echoes
  the player's own acceptance words as the NPC's reply on
  link/raise accepts (r239 Walt, r233 Paolo, r240 Naoise). A
  fourth sighting in the people check is recorded for the
  conversation build arm; a fix is a dialogue-content change,
  outside this run's panel scope unless the echo breaks a close.

## Q3 — recap paraphrase (report-only, per-sitting presence, r230 revision)
Distinct total < 6 → report-only (no formulation owed).
Distinct total ≥ 6 → the formulation is over-represented and a
second paraphrase formulation is owed.
Carried canned-line watch (same needles as r213): pod-dream closing,
recap stitch verbatim, slope-reading, "Walked in like they'd never
left.", "Take it for what it's worth.", stew-bowl, pod-dream-open.
Report-only. (r240 distinct: paraphrase 2, walked-in 0, rest 0.)

## Q5 — EXILE WARNING HEARD (r233 F1 named probe, report-only + defect trigger)
r240: **no exile fired on any of the 5 seeds** (exileLines 0
everywhere, removals all `killed`) — NO-OPPORTUNITY, instrument
proven. This run carries the instrument verbatim (regex gains
`/pulling weight|pull weight|village will decide/i` in the
driver, proven behavior-neutral by r240's bit-identical pilot
re-run).
- Report-only: for every exile on the panel, the day-stamped line
  sequence (gossip → warning → vote → pronouncement) and whether
  the scholar was at Haven on the warning day.
- **Defect trigger:** an exile whose exileLines hold NO warning
  line at all is a silent-exile finding — documented with the full
  transcript; a fix is proposed, not landed unilaterally, unless
  the cause is a one-line instrument-class bug with a proof test.
- The design question (should three UNMET villagers be exilable
  before the player has sat with them?) stays with the build arm.

## Q6 — POLICY FORAGING (r233 F4 named question, report-only)
r240: no F4-shape seed (thinnest forager 14 bumps with 78 sits).
Same read-only analyzer line: per seed, scholar bumpCalls vs
wedgeSits vs joint forage_help commits. A seed with bumpCalls
≤ 2 AND wedgeSits ≥ 50 is the F4 shape, recorded; a seed with
bumpCalls ≥ 10 on the same sits answers "no, the policy does
forage when sits are available". The mechanism (why the policy
picks sits over solo forage) is a sim-lane question if the shape
repeats on ≥3/5 seeds.

## Carried bars (r213/r214/r217/r221/r225/r230/r231/r232/r233/r240 shape, re-verified on the new master)
- **SPOTTER BAR:** panel foodXp['spotter'] total ≥ 10 AND every
  panel seed contributes > 0.
- **LADDER BAR (report-only under a SPOTTER GO — r210 metric review:
  pace read):** ≥1 villager reaches 5 XP (skill 1) on ≥3/4 panel
  seeds; report foraging-volume context if it misses.
- **FASTER-ID BAR:** threshold benefit fires on ≥2/4 seeds.
- **STRANDED BAR (carried watch):** previous-bearer runs recorded
  in strandedLog with 0 work performed on them. NO-OPPORTUNITY = zero.
- **TRAVEL BRANCH (carried watch):** homeward sits hitting a
  clearable blockage reach home the same dawn. NO-OPPORTUNITY = zero.
  (This is the branch the walkHome fix lands in — a TRAVEL miss
  now names the fix's failure mode, not a new mechanism.)
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
  r232 at 4, r233 at 2, r240 at 2. The companion-guard A/B
  escalation already triggered on r232 (sim lane's job). This run
  keeps the watch + the location instrument (`scholarDawns`) and
  reports causes. NOTE: wildavoid (5402d4cc3) + fleerepair2/3 +
  the competent-policy door-skip (a85627205) all landed since
  r233 — a scholar-death move in EITHER direction is adjudicated
  as base-effect vs band noise, not as a panel finding alone.
- **ROSTER-RECONCILIATION WATCH (r225 anomaly, recurred r230,
  answered r231/r232/r233/r240):** 0 unaccounted on all five
  r240 seeds with departures logged and matched by id, AND the how
  named per departure (removalLog). The instrument stays in the
  driver; the open question is whether a departure is narrated to
  the player (Q5 answers it for exiles when one fires).

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp`; village knowledge is measured by
codexPlantsEnd + per-villager spotter XP. Also report party
launches and wave-4 kills per seed (FIGHTALLY2 is env-gated OFF, so
launches here are base behavior). Standing totals at end per seed
(r240: wave 4 tracks standing 100, t4=100 — re-check the split on
the fresh band) and the scholar's last-dawn location for every
scholar death. A full telemetry type-count map is recorded at end
(read-only) so a launch/kill signal can be named if telemetry
records it.

## Seeds, policy, horizon
Pilot: **101601**. Panel: **101602–101605**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221/r225/r230/
r231/r232/r233/r240 driver shape — no withDelegate/HUNTSTAFF
flags; NOTE the competent policy itself changed since r240: the
landing-r145 door-skip, see Base delta). Death-aware tail +10d.
Driver clone is verbatim r240 except run number / seed band /
output names + header comment. The analyzer is the r240 analyzer
verbatim except run number / file names / the Q1 + Q1c + Q3
comparison lines (now vs r240's 1/70, E1 1/1, paraphrase 2).
Proof tests: the r240 walkHome proof test
(`scripts/test-journey-establishment-r240-walkhome-firstblock.js`,
27/27), the r231 settled-help proof test (19/19), the r230
stage0-help proof test (13/13), the r225 stage0-cant proof test
(18/18), the r214 mood-goodbye proof test (10/10), the r139
spotter proof test (35/35), and the r221 want-raise proof test
(7/7) are re-run in this worktree to confirm the mechanisms
still hold on the new base; new proof test only if a defect is
found. The r137 clearhome test (37/37) is re-run as the
walkHome-adjacent regression guard.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 101601–101605 is FRESH.** Full-scope search performed
  2026-11-18 ~20:10Z before this prereg: `git grep -w` over
  committed `evidence/**/*.md` + `scripts/*.js` for each of
  101601–101605: zero hits. Filesystem grep over
  `evidence/*/sim-*-prereg.md` + `evidence/*/journey-*-prereg.md`:
  no file names the band.
- Full-filesystem grep over `evidence/` found two incidental
  hits, adjudicated NOT seed reservations: `101601` is a pantry
  kcal value in `evidence/2026-10-29/journey-scale-r52/` +
  `r54` hungerwatch/trust outputs (`d71 pantry=101601`);
  `101602` is a cumulative-takes value in
  `evidence/2026-10-15/perseed-trustcensus/run-leadcourt-s77.json`
  (`"cumTakes": 101602`). Neither file names a seed band; both
  are measurement values that happen to equal those integers.
- **Rejected first pick 101501–101505:** its `101501` hit is
  likewise a pantry value (`"pantry": 101501` in
  `evidence/2026-10-21/perseed-draworder-b/leadfeast-control.json`,
  whose seeds are 23001–23002) — not a seed reservation either.
  The band is retired anyway to avoid ambiguity; the next worker
  should not need to re-adjudicate it. Recorded here so the
  rejection is not mistaken for a contamination finding.
- Rejected bands (carried): 100901–100903, 100601–100605,
  100701–100705, 6301–6305, 6401–6405, 6501–6505.
- Contaminated bands NOT reused (r240 list carried):
  101201–101205 (matched-band release SPENT after r232 — forbidden
  again for any other question), 101301–101305 (r233, just used),
  101401–101405 (r240, just used), 1502, 1504, 1603, 1604,
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
- Analyzer fork proven on the r240 corpus BEFORE the panel
  (r240 JSONs + convo txts copied to /tmp/r241-analyzer-proof,
  renamed to r241 names): every scored number reproduces r240
  exactly — Q1 1/70 E1 1/1, stage-0-deflected 0, stage-0-surfaced
  1/1; Q1b 70/269 (26.0%); SPOTTER 43, 5/5; LADDER 4/5; FASTER-ID
  5/5 (99/143); END 11/14; VILLAGE 5/5 (with the r240 honest
  footnote); Q2 0/8 CUT; Q3 distinct 2; parting tomorrow=0. The
  new Q6 line names r240's numbers exactly (101401: bumpCalls 39,
  wedgeSits 37). The fork changes no scorer logic.
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
r213/r217/r221/r225/r230/r231/r232/r233/r240; proof tests stage for
the mechanism only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design (holder-less
levers, build-medicduty-h), wave-4 kill A/B + companion-guard A/B
(sim lane), family 7 UNMEASURED. **Landing r145 F1/F2 are NOT this
run's scope** (door-skip lives in the competent policy, not the
game — this run only measures its panel effect). This run does NOT
take any of those builds. The panel's wound-fever/healer numbers
are reported as context only. **Q1c precedence and the Q5
unmet-exile policy are design questions for the conversation build
arm** — this run measures them, documents them, and proposes
nothing to land unilaterally. The r240 walkHome axis-step
oscillation residual stays with the build arm (watch item above).

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND (≥1 people-check sitting is held OR game over before the check
with the skip note written — r240 metric-review revision) AND its
transcript is written AND the spotter instruments fire (≥1
bumpPlantFamiliarity wrap record AND ≥1 villager forage resolution
observed) AND the sittingCloses record is present in the JSON
(beatsAfterLastThem counted) AND wedgeSits carry pick wantIds (Q1b
instrument present) AND ≥1 wedge social sit carries the Q1 trace
fields (fromSeed / seedFavorId / need / ledgerFavor recorded at sit
start) AND the rosterDepartures instrument is present in the JSON
(array, possibly empty) AND the r240 instruments are present
(standingEnd non-null, scholarDawns recorded per dawn,
teleTypeCounts present) AND the Q5 exileLines regex extension is
present in the driver source (grep for "pull weight"). If the pilot
forces a driver or fix change, the panel restarts on fresh seeds
and the pilot seed is NOT scored — EXCEPT that a driver change
after the pilot on a FRESH band voids the band only if the change
is game behavior (instrument-only changes keep the band, recorded
in the run note); any src/js change forces a fresh-band restart.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225/r230/r231/r232/r233/r240 did NOT roll forward. This
run's panel is the r240 driver regime on a fresh band — guardrails
should stay quiet; any LOUD line is adjudicated as band noise vs
real bug BEFORE rolling the baseline forward. Metrics:
guardrails.deaths, guardrails.popAlive, guardrails.pantryKcal,
c3.starvationDeaths (r135's set). The r240 checker hit the known
schema mismatch (the driver never emits `guardrails.*` fields, so
the checker reads missing paths as 0) — expected again, not a
finding. NOTE: this run changes src/js only if Q1/Q2/Q5 or the END
BAR warrant a fix; a guardrail move on a no-src-change run cannot
be caused by this run's code — any LOUD line gets adjudicated as
band noise vs a pre-existing drift, and the baseline is NOT rolled
on a mismatch.
