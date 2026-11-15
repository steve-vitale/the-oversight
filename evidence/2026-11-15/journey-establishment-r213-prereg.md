# Journey leg ESTABLISHMENT — r213 pre-registration (2026-11-15, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210 precedent). Death-aware: stop after 10 consecutive all-dead
daily checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261115T0645CST` (scheduled Sun 2026-11-15 06:45
CST; lock `2026-11-15T12:43:37Z`). Rotation read `1` (establishment);
write `1→2` at closeout with read-back. **Rotation note:** the file reading 1
is legitimate, not a clobber — full cycle since r210: r210 establishment
1→2, r212 deepening 2→3 (r211's advance did not stick — file still read 2
at r212's start; r211 left no note file, presumed died mid-run), r207
scale 3→0, r136 landing 0→1 (read back 1, mtime 2026-11-15 12:29:43Z).
Establishment is the correct next leg. Run number r213 (r212 is the
highest confirmed journey run; r211 exists only as a mention in r210/r212
notes).
**Base:** local master `b0b171cc8` (sim-onlylead2-b PILOT NO-GO, lane B).
Registration base was `738ccb2c9` (journey-landing r136 addendum); master
moved during the flap wait, so the branch was rebased onto `b0b171cc8`
before any work. Master delta vs r210's base `8b77f0f40` DOES touch
src/js: conversation.js +12, convo-dialogue.js +8, convo-wants.js +27
(r209 succession deferred-ask ledger guard + favor-block noBeat; r136
person-trust bar), build.js, sw.js, version.json (batch ship 79060b74b).
The conversation system under test changed — this is a fresh measurement
on a new game, not a re-run of r210's game. The `738ccb2c9`→`b0b171cc8`
delta is evidence + scripts only (sim-onlylead2-b), no src/js change.
No push (ship loop owns pushes).
Pre-flight deviations (LOUD):
- **No lock present at run start** — no stale-lock recovery needed.
- **Reaper ran clean** (~38s): nothing removed; 13/16 active, all LOUD
  lines the standing dirty-tree holds.
- **Worktree registration FAILED twice on write flaps, succeeded on
  the third attempt.** Window #1 opened ~12:47Z (flap-watch log:
  ALL-OK 12:46:38Z, FLAP 12:47:42Z); the first `git worktree add`
  EPERM'd on checkout (5 files) and died "fatal: Could not reset index
  file to revision 'HEAD'." Window #1 cleared ~13:20:34Z — but a VM
  replacement followed (new boot id `5bbe5dd2`; that SIGTERM'd the
  first flap-wait loop) and window #2 opened by 13:26:35Z, killing the
  second registration attempt at the `git worktree add` step ("could
  not write to '.git/worktrees/journey-establishment/locked':
  Operation not permitted"). Window #2 ran ~13:26–14:27Z (60-min wait
  expired FLAP-STILL-ACTIVE; the 14:27:08Z probe then showed A–D/F–H
  OK with only stale-probe-file EEXISTs on E/I, and a direct git probe
  passed). Third attempt succeeded ~14:36Z; branch
  `journey-establishment` (created by the first failed add) was left
  in place throughout and the register attached to it. Heartbeat
  landed immediately after registration; 10-min heartbeat loop running
  (PID 25775, exact-PID kill at closeout).
- **Held tree inspected (INSPECT HELD WORK, Steve 2026-10-27):**
  `journey-scale-attr` (heartbeat 2026-11-10 06:08Z, 5+ days stale)
  still holds the unlanded revert of the live sim-wideduty-a medic-duty
  code in `src/js/game.js` (unstaged, 20+/66−: removes the
  duty-holder-as-camp-healer wiring + isMedicDutyEligible) plus staged
  edits to contests.js, conversation.js, convo-dialogue.js,
  convo-scene.js, convo-wants.js and untracked
  scripts/deathcensus-instrument-20261110.js +
  scripts/journey-scale-r125-20261110.js. Real work-in-progress, not
  scratch — not released, not touched. Flagged again.

## Leg question (r210's next blank — sittings should close, not cut)

**Q1 — SITTING CLOSES.** r210's people check (Miguel, 5504) ended
"(ended by engine)" after the player's agreement, with no closing line.
docs/CONVERSATIONS.md says the energy budget, when spent, signals a
natural ending ("I should get back to it — but this was nice.") and the
conversation closes. Does the engine end sittings with that signal, or
does it cut them mid-thought? Instrument: the r210 driver's people-check
transcripts (2 sittings per seed × 5 seeds = 10 sittings). The analyzer
counts ENGINE-CUT sittings: transcript ends with "(ended by engine)"
and no subsequent "closing:" line. Graceful = a "closing:" line, or the
sitting running its full 8 turns.
- **GO** = 0 engine-cut sittings across the 10 panel sittings.
- **WATCH** = 1–2 engine-cut sittings: each read in full in the people
  check. If the last THEM line reads as a natural close, report-only.
  If any reads as a mid-thought cut (open question / invitation /
  promise left hanging, no resolution), that sitting is a defect finding
  and the run fixes the close in the worktree, grounded in the
  transcript, with a proof test.
- **NO-GO** = ≥3 engine-cut sittings, or any engine-cut whose last THEM
  line is an open question/invitation with no resolution.
- Investigation (after the panel, grounded in transcripts): what sets
  `r.ended` in convoTurn — energy budget spent, choices exhausted, or a
  farewell — and why endConvo returns no closing line on an
  engine-ended sitting.

## Q2 (report-only — [recap] paraphrase variety, A2 floor ADOPTED)
Count "still where we are" across the panel's AFTER transcripts (the
r210 needle). Decision rule (r193 A2 floor proposal, adopted this run):
total < 6 → THIN-PROBE, report only. Total ≥ 6 → the formulation is
over-represented and a second paraphrase formulation is owed — the run
builds it (exact wording chosen from the transcripts' topics, in the
`recaprepeat` pool in conversation.js) with a proof test. Carried
canned-line watch (same needles as r210): pod-dream closing, recap
stitch verbatim, slope-reading, "Walked in like they'd never left.",
"Take it for what it's worth.", stew-bowl, pod-dream-open. Report-only.

## Carried bars (r210 shape, re-verified on the new master)
- **SPOTTER BAR (carried verification):** panel foodXp['spotter'] total
  ≥ 10 AND every panel seed contributes > 0. (r210: 38, every seed > 0.)
- **LADDER BAR (report-only under a SPOTTER GO — r210 metric review:
  pace read):** ≥1 villager reaches 5 XP (skill 1) on ≥3/4 panel
  seeds; report foraging-volume context if it misses.
- **FASTER-ID BAR (carried):** threshold benefit fires on ≥2/4 seeds.
- **END BAR (carried):** every broken-live forage run that (a) broke ≥ 2
  days before the run's end, (b) bearer is the player, (c) the ending
  status was ready on at least one dawn after breaking, is closed by
  the wedge within 2 dawns of breaking. Bearer-change excuse stands.
  NO-OPPORTUNITY = zero broken-live forage runs.
- **STRANDED BAR (carried watch):** previous-bearer runs recorded in
  strandedLog with 0 work performed on them. NO-OPPORTUNITY = zero.
- **TRAVEL BRANCH (carried watch):** homeward sits hitting a clearable
  blockage reach home the same dawn. NO-OPPORTUNITY = zero.
- **THREAD BRANCH (carried watch):** paged (Yara-shape) end
  opportunities closed within 2 dawns.
- **TRUST GUARD (hard, DROP-ONLY, carried):** trust[vid] must not drop
  across any end press. Any drop = defect finding, wedge stops ending
  for the rest of that seed, END BAR NO-GO for that seed.
- **JAM BAR (report-only):** jam-days = dawns on which a promised (not
  yet live) run existed while a broken-live run was live. (r210: 0.)
- **VILLAGE BAR (r85 carried):** alive at d40 on ≥3/4 panel seeds.
  (r210: 5/5.)
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel seed,
  read in full (meaning, coherence, consequence — not counts).
- **WATER INSTRUMENT (report-only):** count of broken-live water runs
  seen across the panel (r210: 0).

## Q3 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words.

## Seeds, policy, horizon
Pilot: **100501** (band check complete — FRESH, see below). Panel:
**100502–100505**, 42d horizon. Policy: competent (r85/r136/r137/r138/
r139/r210 driver shape — no withDelegate/HUNTSTAFF flags). Death-aware
tail +10d. Proof test: the r139 spotter proof test
(`scripts/test-journey-establishment-r139-spotter.js`, 35/35 on the
r210 base) is re-run in this worktree to confirm the mechanism still
holds on the new base; new proof test only if a defect is found (Q1
close fix or Q2 second formulation).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 100501–100505 is FRESH.** Evidence-wide grep for standalone
  100501–100505: zero hits. Scripts seed-context grep: zero hits.
  Checked 2026-11-15 ~12:52Z.
- Rejected bands (this run): 5601–5605 — seed 5601 used in
  journey-succession r170 control (2026-11-10,
  `journey-succession-r170.md`: "control (seed 5601, no poisoning)").
  5701–5705 — seeds 5701–5704 + smoke 5705 used in journey-social r62
  (scripts/journey-social-r62-20261028.js). 5801–5805 — journey-social
  r63 (5801–5804 + smoke 5805). 5901–5905 — journey-social r64
  (5901–5904 + smoke 5905); 5901 also in sim-harnessstop. 6001–6005 —
  journey-social r65 (6001–6004). 6101–6105 — sim-nothingedible-b /
  journey-social r66 (6101–6108). 6201–6205 — seed 6202 used in
  journey-deepening r9 (2026-10-13,
  `journey-deepening-r9-competent-6202.json`).
- Contaminated bands NOT reused for new questions (r210 list carried):
  1502, 1504, 1603, 1604, 17101–17112, 1142–1151, 1801–1804, 1901–1916,
  2001–2010, 2101–2116, 2201–2216, 2301–2316, 2401–2416,
  100001–100008, 1200–1209, 2501–2516, 2601–2616, 2701–2705, 2801–2805,
  2901–2905, 3001–3005, 3101–3105, 3201–3205, 5001–5005 (r139),
  5101–5105, 5201–5205, 5301–5305, 5401–5405 (r210 rejections),
  5501–5505 (r210), plus 5601–5605, 5701–5705, 5801–5805, 5901–5905,
  6001–6005, 6101–6105, 6201–6205 (this run's rejections).

## Canon
docs/CANON.md read at run start. docs/CONVERSATIONS.md read at run
start (the Q1/Q2 area — energy budget + natural ending signal; "Tell
me more." depth; no-repeat ledger; recap reframes are grammar, not
content). KNOWLEDGE.md laws binding the spotter question: "Human skills
≠ alien abilities" (spotter is earthly knowledge — practice earns it,
never a System slot); "identification happens BACK AT CAMP". **No canon
doc covers the recap phrasing pool or sitting-close wording itself** —
said here instead of inventing canon. ENCOUNTER-GEAR RULE (Steve
2026-11-13): the journey driver plays the live village state (real
gear/progression, competent policy), not a staged solo-scholar fixture
— same as r137/r138/r139/r210; the proof test stages for the mechanism
only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Steve RULED 2026-11-13 18:00 CST on the medicine holder-less lever:
ALL FOUR levers — (a) scholar fetches medicine, (b) traveling healer
visits, (c) any villager can search for medicine once taught, (d)
level-ups offer healing abilities with more incentive. Build brief:
goal hidden_files/medicine-holderless-levers-brief-2026-11-13.md. This
run does NOT take that build — it belongs to a dedicated arm
(build-medicduty-h) — but the panel's wound-fever/healer numbers are
relevant context and are reported. Standing design question for Steve
also stands, unchanged: should the game release a dead bearer's outing
on succession, or should it linger in the successor's ledger forever?
(r138 diagnosis; fresh evidence: 5504 Arlo case, r210.) The r129
terrain-pocket bar is ANSWERED (r135 landing: fix merged, bar
re-baselined) — no longer carried as open. Still open: gating
recalibration proposal, answercourt cost, richer medicine design,
reaper restructure nod.

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND ≥1 people-check sitting is held AND its transcript is written AND
the spotter instruments fire (≥1 bumpPlantFamiliarity wrap record AND
≥1 villager forage resolution observed). If the pilot forces a driver
or fix change, the panel restarts on fresh seeds and the pilot seed is
NOT scored.

## Telemetry
Live baseline is the r132 BEFORE panel (competent + withDelegate +
HUNTSTAFF=2, seeds 2401–2416); r133–r139/r210 did NOT roll forward.
This run's panel is the r85/r136/r137/r138/r139/r210 driver regime on
a fresh band — guardrails should stay quiet; any LOUD line is
adjudicated as band noise vs real bug BEFORE rolling the baseline
forward. Metrics: guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths (r135's set). The r210
checker hit the known schema mismatch (the driver never emits
`guardrails.*` fields, so the checker reads missing paths as 0) —
expected again, not a finding. NOTE: this run changes src/js only if
Q1/Q2 warrant a fix; a guardrail move on a no-src-change run cannot be
caused by this run's code — any LOUD line gets adjudicated as band
noise vs a pre-existing drift, and the baseline is NOT rolled on a
mismatch.
