# Journey leg ESTABLISHMENT — r217 pre-registration (2026-11-15, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214 precedent). Death-aware: stop after 10
consecutive all-dead daily checks; never tick a dead village to fill
the leg.

## Run
Run id `playtest-a-20261115T223532Z` (scheduled Sun 2026-11-15 15:45
CST; lock `playtest-a-20261115T223532Z`). Rotation read `1`
(establishment); write `1→2` at closeout with read-back. Run number
r217 (r216 is Lane B crisis; r215 was Lane A scale — no collision).
**Base:** local master `ce0f28a46` (journey landing r137, [needs-eyes]).
Master delta vs r214's base `84d68a5b5` touches src/js: conversation.js
(r137 want-thread resume fix + r215 curious-resume stutter fix),
convo-mood.js (r214 plain parting pool — the fix under test here),
plus evidence/scripts-only landings (deepening r213, guardablate,
social r215, transplant2b closeout, scale r215). The conversation
system under test changed — this is a fresh measurement on a new
game, not a re-run of r213/r214's game. No push (ship loop owns
pushes).
Pre-flight: lock already created by the scheduler handoff
(`playtest-a-20261115T223532Z`, 2026-11-15T22:35:32Z); worktree
already registered + heartbeated; main tree CLEAN; disk 43%.
Heartbeat loop started at run start (10-min cadence,
`journey-establishment-hbloop-r217.sh`, pid 53576).

## Leg question (r214's metric-review carry — the Q1 bar, revised)

**Q1 — SITTING CLOSES, REVISED BAR.** r214 proved the old bar
measured the driver's per-turn dump, not the live game: 4 of 5
"engine-cut" sittings close with spoken beats in the full transcript
(want close + thread close + mood goodbye), and the one real gap
(Marta 100505, neutral mood, zero closing beats) was fixed by the
plain parting pool in convo-mood.js. This run verifies the fix in
the wild on the revised bar: the driver folds in the r214
full-transcript probe (FULL-TRANSCRIPT dump after every held
sitting + a structured `sittingCloses` record per sitting:
endedByEngine, closing line, last THEM line, and the closing beats
endConvo spoke after the last printed THEM line).
- A sitting is CUT only when the full transcript shows NO closing
  beat after the final grace beat AND the last THEM line is an open
  question / invitation / promise. The analyzer flags the mechanical
  half (engine-ended + 0 beats after last THEM + no closing line);
  the open-question half is a human read in the run note.
- **GO** = 0 cut sittings across the 10 panel sittings.
- **WATCH** = 1–2 cut sittings: each read in full in the people
  check. If the last THEM line reads as a natural close, report-only.
  If any reads as a mid-thought cut, that sitting is a defect finding
  and the run fixes the close in the worktree, grounded in the
  transcript, with a proof test.
- **NO-GO** = ≥3 cut sittings, or any cut whose last THEM line is an
  open question/invitation with no resolution.
- Report-only: r214 parting-pool serves in the wild (counts of the
  three plain lines across panel transcripts).

## Q2 (report-only — [recap] paraphrase variety, A2 floor ADOPTED)
Count "still where we are" across the panel's AFTER transcripts.
Total < 6 → THIN-PROBE, report only. Total ≥ 6 → the formulation
is over-represented and a second paraphrase formulation is owed.
Carried canned-line watch (same needles as r213): pod-dream closing,
recap stitch verbatim, slope-reading, "Walked in like they'd never
left.", "Take it for what it's worth.", stew-bowl, pod-dream-open.
Report-only.

## Carried bars (r213/r214 shape, re-verified on the new master)
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

## Q3 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. **Instrument
fix (r214 metric-review carry):** census `knownCount` is DROPPED —
it read null on every villager in all five r213 seeds because no
plant-knowledge field exists on person records (grep: zero
`knownPlants` hits in src/js). The r217 driver records per-villager
`spotterXp` in the census instead (same foodXpOf pattern as
foodXpEnd); village knowledge is measured by codexPlantsEnd (the
scholar's codex) + per-villager spotter XP.

## Seeds, policy, horizon
Pilot: **100801** (band check complete — FRESH, see below). Panel:
**100802–100805**, 42d horizon. Policy: competent (r85/r136/r137/
r138/r139/r210/r213 driver shape — no withDelegate/HUNTSTAFF
flags). Death-aware tail +10d. Proof test: the r214 mood-goodbye
proof test (`scripts/test-journey-establishment-r214-mood-goodbye.js`,
10/10) and the r139 spotter proof test
(`scripts/test-journey-establishment-r139-spotter.js`, 35/35) are
re-run in this worktree to confirm the mechanisms still hold on the
new base; new proof test only if a defect is found (Q1 close fix
or Q2 second formulation).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 100801–100805 is FRESH.** Evidence-wide grep for
  standalone 100801–100805 in `evidence/**/*.md`: zero hits.
  Scripts grep (`scripts/*.js`): zero hits. Checked 2026-11-15
  ~23:00Z.
- Rejected bands (this run): 100601–100605 — named in
  analyze-onlylead-b.js, build-courtship-panels-20261115.js,
  probe-pilgrim*.js, test-courtship-b.js. 100701–100705 — used by
  sim-producerparty-b (prereg + test, 2026-11-15). 6301–6305 —
  journey-social r73–r78 + sim-doomdraw-b et al. 6401–6405 —
  sim-sharcensus-b, sim-doomdraw-b, journey-deepening r116.
  6501–6505 — sim-winsupport-decomp, journey-deepening r118.
- Contaminated bands NOT reused (r213 list carried): 1502, 1504,
  1603, 1604, 17101–17112, 1142–1151, 1801–1804, 1901–1916,
  2001–2010, 2101–2116, 2201–2216, 2301–2316, 2401–2416,
  100001–100008, 1200–1209, 2501–2516, 2601–2616, 2701–2705,
  2801–2805, 2901–2905, 3001–3005, 3101–3105, 3201–3205,
  5001–5005 (r139), 5101–5105, 5201–5205, 5301–5305, 5401–5405,
  5501–5505 (r210), 5601–5605, 5701–5705, 5801–5805, 5901–5905,
  6001–6005, 6101–6105, 6201–6205 (r213 rejections),
  100501–100505 (r213/r214).

## Canon
docs/CANON.md read at run start. docs/CONVERSATIONS.md is the Q1
area (energy budget + natural ending signal; "Tell me more." depth;
no-repeat ledger; recap reframes are grammar, not content).
KNOWLEDGE.md laws binding the spotter question: "Human skills ≠
alien abilities" (spotter is earthly knowledge — practice earns it,
never a System slot); "identification happens BACK AT CAMP". **No
canon doc covers the recap phrasing pool or sitting-close wording
itself** — said here instead of inventing canon. ENCOUNTER-GEAR
RULE (Steve 2026-11-13): the journey driver plays the live village
state (real gear/progression, competent policy), not a staged
solo-scholar fixture — same as r137/r138/r139/r210/r213; the proof
test stages for the mechanism only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design (holder-less
levers, build-medicduty-h), wave-4 kill A/B before anyone touches
the lingerer guard (sim lane), Q4 driver winddown-logging fix
(deepening leg), family 7 UNMEASURED. This run does NOT take any
of those builds. The panel's wound-fever/healer numbers are
reported as context only.

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND ≥1 people-check sitting is held AND its transcript is written
AND the spotter instruments fire (≥1 bumpPlantFamiliarity wrap
record AND ≥1 villager forage resolution observed) AND the
sittingCloses record is present in the JSON (beatsAfterLastThem
counted). If the pilot forces a driver or fix change, the panel
restarts on fresh seeds and the pilot seed is NOT scored.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214
did NOT roll forward. This run's panel is the r85/r136/r137/r138/
r139/r210/r213 driver regime on a fresh band — guardrails should
stay quiet; any LOUD line is adjudicated as band noise vs real bug
BEFORE rolling the baseline forward. Metrics:
guardrails.deaths, guardrails.popAlive, guardrails.pantryKcal,
c3.starvationDeaths (r135's set). The r214 checker hit the known
schema mismatch (the driver never emits `guardrails.*` fields, so
the checker reads missing paths as 0) — expected again, not a
finding. NOTE: this run changes src/js only if Q1/Q2 warrant a
fix; a guardrail move on a no-src-change run cannot be caused by
this run's code — any LOUD line gets adjudicated as band noise vs
a pre-existing drift, and the baseline is NOT rolled on a mismatch.
