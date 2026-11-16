# Journey leg ESTABLISHMENT — r221 pre-registration (2026-11-16, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217 precedent). Death-aware: stop after
10 consecutive all-dead daily checks; never tick a dead village to fill
the leg.

## Run
Run id `playtest-a-20261116T0521Z` (scheduled Sun 2026-11-15 22:45
CST; lock `playtest-a-20261116T0521Z`). Rotation read `1`
(establishment); write `1→2` at closeout with read-back. Run number
r221 (r220 is Lane B succession, in flight now; r219 was Lane A
scale; r218 Lane B succession — no collision).
**Base:** local master `9fd662db5` (journey landing r138). Heartbeat
loop started at run start (10-min cadence,
`journey-establishment-hbloop-r221.sh`, pid 9369); registration
heartbeat landed immediately. Pre-flight: main tree CLEAN, disk 42%.
Lock created by this run 2026-11-16T05:21:54Z. No push (ship loop
owns pushes).

**r217 closeout note (found this run):** r217's run note records
commits 0138f8583/510bd835c and leaves [MERGE-RESULT] unfilled, but
both are NOT ancestors of master. The work DID land under different
hashes — `40fe6eda4` (prereg + driver/analyzer clones),
`9e3abfbab` (anchor fix), `2a3ea11b1` (run note + no-close fix) are
all on master. The run-note hashes were stale (pre-rebase); the
rotation file still reads `1`, so r217's `1→2` write never landed
either. This run writes it.

## Base delta vs r217's base `ce0f28a46` (src/js)
- `conversation.js` / `convo-dialogue.js` (+15/+16): scale r219
  goon ask-tag fix (25373172b — a held ask's substituted line no
  longer carries the ask tag) + succession r218 commit-refusal
  thread-memory fix (50c86b0b9). Both are DIALOGUE-scoped and both
  touch the Q2 sitting-close area (goon substitution, thread
  memory) — this run is a fresh measurement on a changed
  conversation system, not a pure re-run of r217's game.
- `hierarchy.js` (+18): crisis r216 funeral-mend partial-payment
  honest line (edd53a489).
- `build.js`: version bump only (cb00f9818).
- Everything else in range: sim/evidence/scripts-only landings
  (dawnbid-a, aidgate-b, scale-onramp, endgame r219).

## Leg question (new)

**Q1 — WANT-RAISE RATE (r217 metric-review carry).** r217's seed
100803 raised ZERO ask_favor wants in 42 days — the wedge sat 84
times and no villager ever offered one — while other seeds offered
2–13. The wedge can only accept wants villagers actually raise, so
a zero-raise seed starves the whole joint-favor instrument. This run
measures the raise rate directly: per wedge sit, did the NPC raise
an ask_favor want at any turn (driver records every pick's wantId;
analyzer counts sits with ≥1 ask_favor pick vs total wedge sits).
- **GO** = every panel seed raises ≥1 ask_favor want per ~10 wedge
  sits on average (panel raise rate ≥10%), and no seed goes a full
  leg with 0 raises.
- **WATCH** = a seed raises 0 in the leg but its sits show other
  wants (curious/ask_favor-non-joint) — the dawn-decision question
  stays open, carried with the sit transcript.
- **NO-GO / defect** = a seed raises 0 ask_favor wants AND its sits
  show no want of any kind across the leg (villagers sit with the
  player for 42 days and never want anything) — that is a
  dawn-decision/want-generation defect, fixed in the worktree with
  a proof test, grounded in the transcript.
- Report-only: raise rate by want kind (joint forage_help /
  water_haul vs other favors), and whether zero-raise seeds
  correlate with the thin seed shape (fought all leg, foraged less).

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
  three plain lines across panel transcripts).

## Q3 — recap paraphrase (report-only, r217 Q2 verbatim)
Count "still where we are" across the panel's AFTER transcripts.
Total < 6 → THIN-PROBE, report only. Total ≥ 6 → the formulation
is over-represented and a second paraphrase formulation is owed.
Carried canned-line watch (same needles as r213): pod-dream closing,
recap stitch verbatim, slope-reading, "Walked in like they'd never
left.", "Take it for what it's worth.", stew-bowl, pod-dream-open.
Report-only.

## Carried bars (r213/r214/r217 shape, re-verified on the new master)
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

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp` (r217 instrument fix — no plant-knowledge
field exists on person records); village knowledge is measured by
codexPlantsEnd + per-villager spotter XP.

## Seeds, policy, horizon
Pilot: **101001**. Panel: **101002–101005**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217 driver shape — no
withDelegate/HUNTSTAFF flags). Death-aware tail +10d. Driver clone
is verbatim r217 except run number / EVID date / output names
(behavior-identical, so the panel is comparable to r217); the
analyzer clone adds only the Q1 want-raise scorer (read-only, from
the existing wedge-sit pick records — no driver change). Proof
tests: the r214 mood-goodbye proof test
(`scripts/test-journey-establishment-r214-mood-goodbye.js`, 10/10)
and the r139 spotter proof test
(`scripts/test-journey-establishment-r139-spotter.js`, 35/35) are
re-run in this worktree to confirm the mechanisms still hold on the
new base; new proof test only if a defect is found (Q1 want-raise
or Q2 close fix).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 101001–101005 is FRESH.** `git grep -w` over committed
  `evidence/**/*.md` + `scripts/*.js` (all preregs, forbidden and
  contaminated lists): zero hits for all five numbers. Filesystem
  grep over `evidence/` + goal `hidden_files/evidence/` (*.md +
  *.json): the only hits are in old census JSONs where 101002 and
  101005 appear as PANTRY-KCAL data values (`"pantryFreshBefore":
  101002`, `"pantryKcal": 101005` — evidence/2026-10-15
  perseed-trustcensus, 2026-10-16 crumbguard/crumbdefault, 2026-10-20
  perseed-retagrot, 2026-11-02 journey-succession-r108,
  2026-10-22 prodrebound-b2-sweep), never as a seed field;
  101001/101003/101004 appear nowhere. Adjudicated NOT a seed use:
  a kcal count is not a reservation. Checked 2026-11-16 ~05:30Z.
- Rejected bands (this run): 100901–100903 — each named once in
  committed evidence .md (100901/100902 filesystem .md grep,
  100903 git grep). 100601–100605, 100701–100705, 6301–6305,
  6401–6405, 6501–6505 (r217 rejections, carried).
- Contaminated bands NOT reused (r217 list carried): 1502, 1504,
  1603, 1604, 17101–17112, 1142–1151, 1801–1804, 1901–1916,
  2001–2010, 2101–2116, 2201–2216, 2301–2316, 2401–2416,
  100001–100008, 1200–1209, 2501–2516, 2601–2616, 2701–2705,
  2801–2805, 2901–2905, 3001–3005, 3101–3105, 3201–3205,
  5001–5005 (r139), 5101–5105, 5201–5205, 5301–5305, 5401–5405,
  5501–5505 (r210), 5601–5605, 5701–5705, 5801–5805, 5901–5905,
  6001–6005, 6101–6105, 6201–6205 (r213 rejections),
  100501–100505 (r213/r214), 100801–100805 (r217).

## Canon
docs/CANON.md read at run start. docs/CONVERSATIONS.md is the Q1/Q2
area (energy budget + natural ending signal; "Tell me more." depth;
no-repeat ledger; recap reframes are grammar, not content).
KNOWLEDGE.md laws binding the spotter question: "Human skills ≠
alien abilities" (spotter is earthly knowledge — practice earns it,
never a System slot); "identification happens BACK AT CAMP". **No
canon doc covers the recap phrasing pool, sitting-close wording, or
want-raise rates** — said here instead of inventing canon.
ENCOUNTER-GEAR RULE (Steve 2026-11-13): the journey driver plays
the live village state (real gear/progression, competent policy),
not a staged solo-scholar fixture — same as r137/r138/r139/r210/
r213/r217; proof tests stage for the mechanism only, not a combat
fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design (holder-less
levers, build-medicduty-h), wave-4 kill A/B before anyone touches
the lingerer guard (sim lane), Q4 driver winddown-logging fix
(deepening leg), family 7 UNMEASURED. This run does NOT take any
of those builds. The panel's wound-fever/healer numbers are
reported as context only. Scholar-death watch (r138): 2 scholar
deaths on each of the last two landing panels — if establishment
shows the same shape, it earns a metric; watch only here.

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND ≥1 people-check sitting is held AND its transcript is written
AND the spotter instruments fire (≥1 bumpPlantFamiliarity wrap
record AND ≥1 villager forage resolution observed) AND the
sittingCloses record is present in the JSON (beatsAfterLastThem
counted) AND wedgeSits carry pick wantIds (Q1 instrument present).
If the pilot forces a driver or fix change, the panel restarts on
fresh seeds and the pilot seed is NOT scored.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217 did NOT roll forward. This run's panel is the r217 driver
regime on a fresh band — guardrails should stay quiet; any LOUD
line is adjudicated as band noise vs real bug BEFORE rolling the
baseline forward. Metrics: guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths (r135's set). The r217
checker hit the known schema mismatch (the driver never emits
`guardrails.*` fields, so the checker reads missing paths as 0) —
expected again, not a finding. NOTE: this run changes src/js only
if Q1/Q2 warrant a fix; a guardrail move on a no-src-change run
cannot be caused by this run's code — any LOUD line gets adjudicated
as band noise vs a pre-existing drift, and the baseline is NOT
rolled on a mismatch.
