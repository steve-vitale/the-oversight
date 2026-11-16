# Journey leg ESTABLISHMENT — r225 pre-registration (2026-11-16, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221 precedent). Death-aware: stop after
10 consecutive all-dead daily checks; never tick a dead village to fill
the leg.

## Run
Run id `playtest-a-20261116T1011Z` (scheduled Mon 2026-11-16 03:45 CST;
lock `2026-11-16T10:11:57Z`). Rotation read `1` (establishment); write
`1→2` at closeout with read-back. Run number r225 (r224 is Lane B
succession, already closed; r223 Lane A scale; r222 is Lane B deepening
in flight — r225 is the next unused global number, no collision).
**Base:** local master `b659acdd5` (sim-gateconfirm-a evidence landing;
master moved 3 commits past the pull-time 4341557ab while this run
registered — the worktree was registered on the current master).
Heartbeat loop running (10-min cadence,
`journey-establishment-hbloop-r222.sh` — file name carries the slug,
not the run number — pid 35901); registration heartbeat landed
immediately; re-heartbeat 10:20:16Z. Pre-flight: main tree CLEAN, disk
43%. Lock created by this run 2026-11-16T10:11:57Z. No push (ship loop
owns pushes). Registration itself took ~5.6 min (slow `git worktree
add` under box load — same shape as r221's ~5 min registry-lock wait).

## Base delta vs r221's base `9fd662db5` (src/js, 77 insertions)
- `convo-wants.js` (+30) / `conversation.js` (+16) / `convo-dialogue.js`
  (+16): succession r224 F4a/F4b/F4c dry-line fixes (ledger-aware
  question pick; repeat-ack variants; dlg:help nowant guard) + crisis
  r223 drift-note stage-direction fix. All DIALOGUE-scoped and all
  touch the Q2 sitting-close / Q3 recap area (dry lines, question
  repeats) — this run is a fresh measurement on a changed
  conversation system, not a pure re-run of r221's game.
- `villager-agency.js` (+19): sim-launchdef-a PROFILEGATE bypass
  (GO — gate fix lands): a bid-and-selected party_launch plan
  bypasses the non-ranger profile gate; every other launch condition
  stands. Touches wave-4 party launches, not conversation — panel
  trajectories may shift toward more launches vs r221; the census
  reports launches/kills and any shift is adjudicated as base-delta
  vs band noise, never silently absorbed.
- `build.js`: version bump only.
- Everything else in range: sim/evidence/scripts-only landings
  (gatelever-b lever + revert = net zero on game.js/win-plan.js/
  villager-brain.js; profilegate-a revert; gateconfirm-a evidence).

## Leg question (new — r221's named next Q1)

**Q1 — FAVORLESS ASK, LIVE TRACE.** r221 proved 20/73 raised asks
(27%) never materialized into a committable favor: the want stayed
ask_favor for the whole sitting, no favor kind ever attached, and the
asks repeated for the same distressed villagers (Ivy ×3 while
starving, then dead; Dale ×3; Zoltan ×4). The structural claim in
`src/js/convo-wants.js` ("a contentless favor is structurally
impossible") is contradicted by the live game. This run traces the
mechanism live instead of guessing it again.

Code reading (done pre-panel, to aim the trace, not to conclude):
- `convoSelectWant` pre-empts a live seed ABOVE the weighted pick,
  with no canOpen check — a seed can select ask_favor even when the
  want cannot open.
- `ask_favor.opener` has two null paths: (a) seeded favor gone
  (`convo-wants.js:705`, "favor gone — honest fallback"); (b) fresh
  path with no live need (`:708`). Either way the want stays
  ask_favor and the sitting runs favorless.
- `ask_favor.resolve` plants a seed with NO favorId when the favor
  is null (`:1034`, 'stated'/'abandoned' branch) — a contentless
  seed, which re-selects ask_favor next sitting.
- `convoResolveWant` deletes an unestablished (stage < 1) seed, so
  a favorless sit re-seeds only if the want reached stage ≥ 2
  (engaged) — the trace must record stage, not just the seed.
- `convoFindFavorNeed` is documented PURE (no RNG) — the trace
  probes (`convoFindFavorNeed`, `convoGetFavor`, `convoSeeds` read)
  cannot perturb the game's RNG stream.

Trace (driver records per wedge social sit, read-only probes):
- at sit start (first convoGet): want.fromSeed, want.seedFavorId,
  want.seedNote, live seed record (`convoSeeds[vid]`: wantId /
  favorId / day), ledger favor (id / state / kind / short or null),
  live need (`convoFindFavorNeed`: kind / urgency or null).
- per turn: wantId, wantFavorKind, want.stage.
- at sit end (after endConvo): seed record after resolve (planted?
  favorId? deleted?), ledger favor state.
Classification of each favorless sit (ask_favor raised, no kind on
any pick):
- **A — contentless seed in**: fromSeed && seedFavorId == null.
- **B — seeded favor gone**: fromSeed && seedFavorId != null &&
  (ledger favor null || id mismatch).
- **C — seeded favor present, opener null anyway**: fromSeed &&
  seedFavorId != null && ledger favor matches, but no favor ever
  attached (followup null / settled favor / ledger-blocked line).
- **D — fresh pick, need died**: !fromSeed && no live need at sit
  start (should be impossible per pick() — if seen, it is a
  structural-claim violation with no known path).
- **E — other**: trace attached, mechanism named from the record.
- **GO** = every favorless sit in the panel is classified (unknown
  0) AND the dominant mechanism (≥50% of favorless sits) is
  reproduced in a staged proof (a scripted two-sitting sequence
  that produces a favorless ask through that path). If the
  mechanism yields a fix, it lands with a proof test; if the
  mechanism is working-as-designed, the run says so and names the
  design call owed (e.g. a seed must not select a want that cannot
  open) instead of landing a speculative fix.
- **NO-GO** = any favorless sit unclassified, or class D appears
  (structural-claim violation with no path), or the panel shows
  favorless asks at ≥ r221's rate (27%) with no dominant mechanism.
- Report-only: favorless rate (favorless sits / raised asks) vs
  r221's 20/73; per-villager repeat counts; whether distressed
  villagers (starving/sick) dominate the classes; seed age at
  re-fire (days between plant and re-select).

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
  dry-line fixes hold in the wild (0 recurrences in their classes).

## Q3 — recap paraphrase (report-only, r217 Q2 verbatim)
Count "still where we are" across the panel's AFTER transcripts.
Total < 6 → THIN-PROBE, report only. Total ≥ 6 → the formulation
is over-represented and a second paraphrase formulation is owed.
Carried canned-line watch (same needles as r213): pod-dream closing,
recap stitch verbatim, slope-reading, "Walked in like they'd never
left.", "Take it for what it's worth.", stew-bowl, pod-dream-open.
Report-only.

## Carried bars (r213/r214/r217/r221 shape, re-verified on the new master)
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
  r221 all sat at exactly 2, both r221 deaths "lost in the wild".

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp` (r217 instrument fix — no plant-knowledge
field exists on person records); village knowledge is measured by
codexPlantsEnd + per-villager spotter XP. Also report party
launches (profilegate bypass is new in the base) and wave-4 kills
per seed.

## Seeds, policy, horizon
Pilot: **101101**. Panel: **101102–101105**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221 driver shape
— no withDelegate/HUNTSTAFF flags). Death-aware tail +10d. Driver
clone is verbatim r221 except run number / EVID date / output names
+ the Q1 trace probes (read-only, RNG-pure per the pre-panel code
check above); the analyzer clone adds only the Q1 favorless
classifier (read-only, from the trace records — no driver change
beyond the trace). Proof tests: the r214 mood-goodbye proof test
(`scripts/test-journey-establishment-r214-mood-goodbye.js`, 10/10),
the r139 spotter proof test
(`scripts/test-journey-establishment-r139-spotter.js`, 35/35), and
the r221 want-raise proof test
(`scripts/test-journey-establishment-r221-want-raise-20261116.js`,
7/7) are re-run in this worktree to confirm the mechanisms still
hold on the new base; new proof test only if a defect is found (Q1
mechanism repro, or Q2 close fix).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 101101–101105 is FRESH.** `git grep -w` over committed
  `evidence/**/*.md` + `scripts/*.js` (all preregs, forbidden and
  contaminated lists): zero hits for all five numbers. Filesystem
  grep over goal `hidden_files/evidence/`: the only hit is
  101101 as a PANTRY-KCAL data value (`"pantryFreshBefore":
  101101`, `"pantryFreshAfter": 101101` — evidence/2026-10-16
  crumbdefault-sweep census-control JSON, never as a seed field);
  101102–101105 appear nowhere. Adjudicated NOT a seed use (same
  shape as r221's 101002/101005 kcal adjudication): a kcal count
  is not a reservation. Checked 2026-11-16 ~10:20Z.
- Rejected bands (carried): 100901–100903 (named in committed
  evidence .md), 100601–100605, 100701–100705, 6301–6305,
  6401–6405, 6501–6505.
- Contaminated bands NOT reused (r221 list carried): 1502, 1504,
  1603, 1604, 17101–17112, 1142–1151, 1801–1804, 1901–1916,
  2001–2010, 2101–2116, 2201–2216, 2301–2316, 2401–2416,
  100001–100008, 1200–1209, 2501–2516, 2601–2616, 2701–2705,
  2801–2805, 2901–2905, 3001–3005, 3101–3105, 3201–3205,
  5001–5005 (r139), 5101–5105, 5201–5205, 5301–5305, 5401–5405,
  5501–5505 (r210), 5601–5605, 5701–5705, 5801–5805, 5901–5905,
  6001–6005, 6101–6105, 6201–6205 (r213 rejections),
  100501–100505 (r213/r214), 100801–100805 (r217),
  101001–101005 (r221).

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
r213/r217/r221; proof tests stage for the mechanism only, not a
combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design (holder-less
levers, build-medicduty-h), wave-4 kill A/B before anyone touches
the lingerer guard (sim lane), Q4 driver winddown-logging fix
(deepening leg), family 7 UNMEASURED. **Landing r139 F1 (warn_you
heed silent loop — after the 3-line ack pool exhausts, the
no-repeat ledger blocks further heeds and the handler passes no
fallback) is CARRIED, not this run's scope**: it is a different
want (warn_you) with a different mechanism (ack-pool exhaustion),
and this run's single blank is the favorless ask. F1's fix is
owed to a landing-leg run. This run does NOT take any of those
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
seedFavorId / need / ledgerFavor recorded at sit start). If the
pilot forces a driver or fix change, the panel restarts on fresh
seeds and the pilot seed is NOT scored.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221 did NOT roll forward. This run's panel is the r221 driver
regime + trace probes on a fresh band — guardrails should stay
quiet; any LOUD line is adjudicated as band noise vs real bug
BEFORE rolling the baseline forward. Metrics: guardrails.deaths,
guardrails.popAlive, guardrails.pantryKcal, c3.starvationDeaths
(r135's set). The r221 checker hit the known schema mismatch (the
driver never emits `guardrails.*` fields, so the checker reads
missing paths as 0) — expected again, not a finding. NOTE: this run
changes src/js only if Q1/Q2 warrant a fix; a guardrail move on a
no-src-change run cannot be caused by this run's code — any LOUD
line gets adjudicated as band noise vs a pre-existing drift, and
the baseline is NOT rolled on a mismatch.
