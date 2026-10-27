# sim-food-economy-round-1230-b — coordinator evidence (loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, 2026-10-27 ~12:30–13:30Z. Axis food-economy
(second non-converged axis — scale-onramp was live-claimed by loop A's 12:15Z
run, NOT touched; A landed mid-run as 0394c5665, socialD D-RULED-OUT +
waitlong NO-GO + d94 CLOSED, and both B branches rebased onto it clean).
Both arms DIAG/measurement only, zero src/js. Merged locally, pending ship.

## Arm 1 — sim-day99demand-b: GO (seed supplied, judged analyzer run pending)

Takes the 1130Z next blank (1): screen for a day-99-demand seed. Prereg
committed BEFORE any sweep; screen competent-nofeast, 100d death-aware,
chunks with a 64-seed cap, recorder fidelity stated explicitly (raidday100
sweep instrument verbatim, WITH its registerDeath suppression, deliberately
— a plain-game seed may not reproduce under the sweep-based analyzer).

- Screened 24 seeds (20100–20123) of the 64 cap; screening stopped per the
  prereg at the hit. Demands 55, takes 53, take kcal 51,194; take = demand + 1
  on every matched pair; 0 PARTIAL seeds; 2 hanging day-100 demands (20115,
  20117 — the 10133 class); 2 zero-raid seeds (20109, 20119).
- HIT: seed 20118 — survived 100d, rank village, wave 2, 2 deaths (ambush
  day 7, "the night" day 81). Demand day 99 (Andre of Thornfield, ~2,000 kcal
  spoken ask); take day 100 (asked 800, Canned soup 4u x 250 = 1,000 kcal,
  retMismatch false, via villageAgencyDaily). Last spoilDays snapshot is
  day 100 (110,054 kcal fresh), taken before that day's sleep/endDay — so the
  take is dated == lastSnapDay, exactly the post-snapshot adjustment's case
  (raid100 = 1,000, dried portion 0).
- Proof GREEN post-rebase on the full 24-seed corpus (selftest passed
  beforehand: PASS-on-positive, FAIL-on-negative, FAIL-on the raidday100
  corpus as negative control).
- What this GO does NOT claim: it supplies the seed only. It does NOT claim
  the post-snapshot raid adjustment is now exercised — that belongs to the
  next arm's judged analyzer run on 20118 (raidday100 GO clauses (b)–(f)).
  The raidday100 DIAG-NO-GO and day100raid-code REACHABLE verdicts stand
  untouched. Record the findings item as "seed supplied (20118), judged
  analyzer run pending" — NOT fixed.
- Recorder-fidelity note: plain recorder on 20118 diverges completely
  (demandDays [], takeDays [] — first death day 7 shifts the RNG stream).
  Faithful TRACE_FULL replication reproduces the hit exactly (demandDays
  [99], takeDays [100], day-100 VAD call pendingBefore 99 / takeFired true).
  Screened trajectories are sweep-instrument trajectories, never cited as
  plain-game ones.
- Updated base rate (raidday100 + this band): day-99 demands 1/108 demands;
  seeds carrying one 1/64. Nearest misses: 20106 demand 98 → take 99;
  20120/20121 demand 98 → take 99.
- Sense note: the 20118 demand/take pair reads like earlier bands' pairs,
  numbers matching the ledger exactly. Caution recorded for the next arm:
  the demand line's "~2,000 kcal" is the spoken ask, not the adjustment
  amount — raid100 = 1,000, the recorded take. No robotic/static/repeated
  dialogue beyond the mechanism's honest 800-ask/1,000-take whole-unit shape.
- Wall (this band): national / table / wins 0/24; wave 4/5 0/24; wave 3 on
  18, wave 2 on 6; median survival 100d (22 at 100d; 20100 lost day 29, 20104
  day 94); 116 deaths (arena 41, sickness 15, ambush 10, starvation 9,
  monster 8, wound 8, contest 7, combat 6, dehydration 4, alien 2, the night
  2, singletons 1 each).

## Arm 2 — sim-9954trace-b: PARTIAL (floor raised, day-100 timing excluded)

Takes the 1130Z next blank (2): wider per-stack trace on seed 9954 ONLY
across the day-100 snapshot boundary. Prereg committed BEFORE any trace
run; faithful replay of 9954 only, no new seeds spent; 9970 NOT re-litigated.

- Recorder fidelity PASS: replay vendored sweep-raidcallers-b.js exactly,
  including its death-suppressing registerDeath wrapper (a plain-mode run
  would diverge from the first death onward), plus one read-only stack
  recorder. EVERY shared field matches the committed corpus (headline, all
  counters, all lists: spoilDays 100, mealDraw 1125, inflows 196, stockdoor
  705, direct 262, raid 16, sweeps 100). Sole apparent exception proves the
  rule: raidRecords.stackTop differs only by capture truncation width
  (worktree names 17 vs 15 chars shift the 300-char window) — normalized
  strings agree on their full common length on all 16 records.
- Reproduction PASS: NEW residual +5,719 (fresh +5,719, dried 0); bridge
  stock100 +3,400 − meal100 −5,419 − cc100 0 = −2,019; analyzer boundary
  residual +3,700.
- Window P (day-100 start → snapshot moment): net 0, EXACTLY — all 38 stack
  keys identical across all channels. No pre-snapshot day-100 flows; the
  snapshot moment IS the start of day 100.
- Window Q (snapshot → post-run): observed = recorded, per key — fresh net
  −1,919, matching recorded day-100 flows exactly (draws −5,419; stockdoor
  +3,400; inflow +100). No unrecorded post-snapshot generic flows.
- Consequence — floor raised 300 → 3,700/3,800: timing explains NONE of the
  +3,700 beyond the already-adjusted 2,019; the residual pre-exists day 100
  entirely. Correct-alignment residual (snapshot minus flows dated <100,
  valid by append-order) is +3,800 — the analyzer understates it by the
  +100 inflow, which is empirically POST-snapshot (absent at snap, present
  post-run). That is a boundary-definition gap for the next prereg, not a
  closure.
- No door closes the row (accounted = 0 vs bar 3,700 ± 1) — hence PARTIAL,
  not GO. Every door excluded with numbers (wider census, all families):
  inflow stock 166 / deposit 20 / pantryAdd 10 (generic: stock only, 121;
  excluded records 0); stockdoor give−kcal gap 49, zero-kcal records 124;
  meal pantryDraw 206 + mealCall 919 (mealCall carries no items — a summary,
  not a door); 'other' max want 1,496 < 1,500 feast floor (feast copy-draws
  did not fire); direct player-take 257 / npc-adult-pantry 4 /
  green_whisper.cultivate 1, alien-raid paths 0; raid callers payTribute 10 /
  villageAgencyDaily 3 / answerAccord 1 / answerAidBeg 1 /
  answerNationalChoice 1; transforms cook-racks 111 / cook-racks-split 10,
  unlinked 0; sweeps 100 (days 2–101), day-100 and day-101 sweeps remove
  nothing, violations 0; all-family NEW residuals reproduce genericremainder
  exactly (Foraged +5,719, Fish +20, Purslane +30, Winner's −600, rest 0).
  Purslane's +30, unlike generic's, IS post-snapshot timing.
- Instrument finding for the next arm: the snapshot series is PER-ITERATION,
  not per-day (scholar.day repeats/skips; day 36 has two snapshots).
  Worked example: day-36 snapshots 6,297 → 3,730 (Δ −2,567) = 6 cook-racks
  transforms firing between the two same-day snapshots. Per-day attribution
  manufactures phantom leaks — the next trace must walk iterations in order.
- Proof post-rebase: 70/71 pass; the single FAIL is the GO check itself
  (accounted 0), exiting as VERDICT: PARTIAL by design.
- Wall: reused corpus, no new band — raidcallers numbers stand (pilot
  national-or-better 6/8, confirm 9/12, table 0/20, wins 0/20).
- Sense note: day-99/100 treeline gorge lines name the 'other'-draw mechanism
  (lingering Big Thing / Influencer / Big-Eyes gorging at night, amounts
  matching recorded draws); day-101 kite lines narrate past the horizon,
  consistent with the post-run Winner's +600 inflow. Tribute/demand narration
  is absent from this corpus (say recorders cover smoke-rack + treeline lines
  only) — recorded as a scope gap, not papered over.
- Next arm (stated in arm evidence): iteration-level per-stack walk on 9954
  only (stackDays in order, same-day splits explicit) to localize the +3,800
  to an iteration window; if still nonzero, a writer-wrap faithful replay
  proving any unrecorded pantry writer exists before naming it. Do NOT
  re-attribute to day-100 timing, feast previews, alien raids, stockdoor
  carry, or cooking bonus.

## Village assessment (plain words)

No new villages were "played" for their own sake this run — both arms are
ledger-closing measurements on existing bands — but the bands still say
something plain. The day99demand villages (competent play, 24 of them)
are the quiet ones: nobody climbs the hierarchy, nobody reaches the table,
22 of 24 live the full 100 days, and people die in arenas and of sickness,
not hunger — the same honest shape as the raidday100 screen. The one story
that matters is a night story: on seed 20118, Andre of Thornfield walks out
of the treeline on day 99 with four others and a threat, and on day 100,
while the village isn't at the treeline, takes 1,000 kcal of canned soup
and melts back into the dark. That is the raid the ledger has been waiting
three runs to catch on the boundary day — and now the next arm can finally
run the judged analyzer on it instead of hunting for it. On 9954, the
village's books still don't close by 3,700 kcal of generic food, and this
run proved the gap is NOT a timing trick at the day-100 boundary: nothing
moves before the snapshot, everything after it is recorded to the kcal.
The missing food was already missing before day 100 began. That narrows the
hunt from "when" to "where in the day-by-day walk" — which is what the
iteration-level trace is for.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/sim-day99demand-b-screen-corpus/*.json' --metrics
national,table,wins,exiled` on the 24-file day99demand corpus: 3 LOUD lines
(national 12→0, table 16→0, wins 16→0), all the KNOWN regime-artifact class
(WINSEAT baseline vs a competent-nofeast measurement corpus; per-seed rows
carry band-level fields, not top-level national/wins paths); NO exiled LOUD
line. Baseline NOT rolled, no new investigation. (9954trace has no new band
corpus; its reused raidcallers corpus was already checked in the 0945Z run.)

## Balanced panel (MEASUREMENT.md §15)

No before/after panel applies: neither arm changes a lever or game code, so
there is no candidate run to panel against a baseline. The instrument
before/after is each arm's own proof (day99demand selftest + corpus proof;
9954trace faithful-replay reproduction). Not forced, not faked — same
precedent as the raidcallers arm.

## Metric review (MEASUREMENT.md §14)

- Both arms judged ONLY against their own pre-registered bars, no re-scoring.
  day99demand's GO is deliberately narrow (seed supplied, not adjustment
  exercised) — the evidence states the limit in its own verdict section so
  a later reader cannot mistake "GO" for "adjustment closed".
- 9954trace's PARTIAL follows its prereg's bar (full +3,700 with exact stack
  identity for GO); the prereg's PARTIAL definition is met by the narrowed
  bound + per-door exclusions, and the arm additionally raises the floor and
  documents a boundary-definition gap (the +100 post-snapshot inflow) that
  the NEXT prereg must define before any close claim.
- Bar lesson carried forward: snapshot series are per-iteration, not
  per-day — any future trace prereg that attributes flows "per day" without
  walking iterations in order risks manufacturing phantom leaks (worked
  day-36 example above).

## Infrastructure

- Worktree registration slow (~5 min total, sibling I/O contention — same
  precedent as recent runs); no EPERM flap blocked this run's writes.
- Safe-commit index clobber variant hit on worker commits (both arms) —
  repaired via HEAD-blob cacheinfo by the workers, commits verified correct.
- Master moved once under the run (A round 0394c5665); both B branches
  rebased clean (zero file overlap), proofs re-run post-rebase, then merged
  ff-only. The second merge correctly refused ff-only after the first merge
  moved master — rebased again onto the new master, proof re-run, then
  merged. Trees released (done-merged), branches deleted, main tree clean
  at closeout.
- check.js --quick NOT re-run: zero src/js, zero green-list files, arm
  proofs are the attributable verification (same precedent as 1016Z/1130Z).

## Convergence line

food-economy stays converging (NOT converged): the day-99 seed is supplied
but the raid post-snapshot adjustment is still unexercised under a judged
analyzer run, and the 9954 generic remainder is now a pre-day-100 +3,800
with day-100 timing excluded — narrower, but still open. scale-onramp stays
converging (untouched; sibling loop A). Next blanks, in order: (1) judged
analyzer run on seed 20118 (raidday100 GO clauses (b)–(f)); (2)
iteration-level per-stack walk on 9954 only; (3) the 0530Z carried blanks,
still open: garden-attributed deposits with zero garden harvest,
starting-stock draw order, spoilage-boundary split (meal vs cook), ~5,900
kcal non-draw removal day-82/83; (4) a treeline give/overrun band (seeds
where holds fail).

## Commits (all on master, merged locally pending ship)

- sim-day99demand-b: prereg fb2dbf09d, arm acde33c54 (rebased from
  ec59cc195/740a3d865).
- sim-9954trace-b: prereg 40e88fa78, arm 4ae73e39c (rebased from
  b8886c635/0899e61dd).
- Coordinator evidence: this file.
