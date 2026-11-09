# journey-landing r121 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** playtest-loop-a-20261109T1245Z (scheduled Mon 2026-11-09 06:45 CST, started ~12:43Z).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@5e79679e4 ("journey-scale r122: pilot+confirm evidence").
**Seed band 1142–1151 (fresh — see below).**
**Registration:** single attempt, SUCCEEDED but slow (~8 min, 12:45–12:53Z):
`git worktree add` + `git reset --hard` ran ~7 min under heavy sibling load
(takeseat-b, prefloor-deaths-b, wideduty-a-confirm sims all running). Tree
verified clean (0 status lines) before any work. Heartbeat at registration +
~10-min loop (hbloop pid logged to ~/workspace/worktrees/journey-landing-hbloop-r121.out).
**Numbering note:** Lane A leg counters are per-leg; the last landing run was
r120, so this run is r121. (Deepening's r121 is a different leg's counter.)
**Design — BEFORE/AFTER on matched seeds (§15, §9):** both drivers run the
SAME fresh seeds 1142–1151, DAYS=28. BEFORE = r120 driver verbatim except
seeds/OUTDIR/header. AFTER = r121 driver = r120 + Q1 + Q2 below. The panel
judges the deltas on identical villages, not across seed bands (r120's
cross-band comparison 27→7 is retired as the method for these two questions).
Drivers:
- scripts/journey-landing-r121-before-20261109.js (r120 verbatim; OUTDIR landing-r121-before)
- scripts/journey-landing-r121-20261109.js (r120 + Q1 + Q2; OUTDIR landing-r121-after)
Analyzers: scripts/analyze-landing-r118-outingchain.js (WITH ONE R121 FIX —
see below); scripts/analyze-landing-r104-20261105.js (DIR via argv);
scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r113-navlog.js; scripts/analyze-landing-r107-commit-offer.js;
scripts/analyze-landing-r117-huntpractice.js; scripts/analyze-landing-r117-zerodmg-v2.js
(the standing zero-DMG instrument); scripts/analyze-landing-r120-scholar-turns.js
(the standing scholar-turns watch instrument).
**R121 ANALYZER FIX (pre-panel, instrument defect proven before any r121
seed runs):** the outingchain analyzer's classifyEveningLine regex required
')' right after the distance, but since r119 the driver writes tile stock
into nodeFails entries ("(0,0,d4,s47):unreached") — so every r119/r120
unreached entry silently failed to match and farUnreached read 0 on both
panels (true r120 count, re-measured with the fixed parse: 11 far, 4 near).
The r119/r120 run notes never quoted farUnreached (they read the census JSON
directly), which is why the drift went unnoticed. Fix: optional `(?:,s\d+)?`
in the regex (all three formats still parse); proof test
scripts/test-landing-r118-outingchain.js gains an h-hop-stock fixture +
r120 calibration (farUnreached 11, nearUnreached 4, pressFail 7). The Q2
metric below is judged on the FIXED parse on both corpora.
NEW: scripts/analyze-landing-r121-presshop.js (Q1/Q2 before/after counter —
reads both corpora, prints press-fails, together-stopped, unreached-far, and
hop classifications; proof test scripts/test-landing-r121-presshop.js with
synthetic before/after census fixtures).
Proof tests (standing): scripts/test-landing-r115-zerodmg-invariant.js,
scripts/test-landing-r115-miriam-line.js, scripts/test-landing-r117-zerodmg-v2.js,
scripts/test-landing-r118-outingchain.js, scripts/test-landing-r120-scholar-turns.js
(all unchanged).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 and Q2 are driver-policy +
instrument-only (zero src/js). A game-code fix is NOT in scope unless the
panel proves a defect in game code with a before/after proof test.
**Canon:** docs/CANON.md read at run start. No canon doc covers the forage
patch's cell state, the joint-press loop, or hop routing — Q1/Q2 rest on code
(src/js/game.js doAction forage ~27500 AREA SWEEP; travelTo intermediate-
blockage scan; walkTo in scripts/policies/scalecourt-traderoad-r113.js) +
panel, not invented canon.
**Pre-flight deviations (LOUD, recorded, standing state):** `git pull --ff-only`
FAILED at 12:44 UTC — local master is ahead/behind vs origin/master (same
standing divergence r120 recorded; merge-base drifted since). Proceed on
local master, no merge/push/rebase of origin; the ship loop owns pushes and
origin reconciliation; landing is ff-only into local master and cannot
revert anything. **This run measures pre-OVE code**, as r120 did.
**Context (not this leg's work):** siblings' sim arms (sim-wideduty-a,
sim-sametick-a, sim-e18f-beforeafter-b, sim-prefloor-deaths-b,
sim-takeseat-repin-b, build-ladder-leg4-baseline) hold dirty worktrees in
parallel. This run measures master as-is; no action here.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1142–1151**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for `\b114[2-9]\b|\b115[01]\b` over all files
  matching `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md`
  returns **3 matches, all incidental** ("[950,1150]" in
  sim-spawnhp-a-prereg.md — a stat-range endpoint, not a seed naming;
  "hierarchy.js:1147" ×2 in sim-tendtrust-b / sim-tenddrive-a preregs — a
  code line reference, not a seed naming) and **0 seed namings**. No range
  "1142–1151" is named anywhere. The forbidden-band list
  (hidden_files/sim-heraldband-pilot-prereg-2018.md) names nothing in this band.
- No corpus files for these seeds exist (no landing-r121-* dir yet).
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062, 1063–1072, 1073–1082, 1083–1092, 1093–1102 (overlaps
  1101–1110), 1111 (single seed, social r11), 1112–1121 (r118), 1122–1131
  (r119), 1132–1141 (r120, just used).

## Q1 (PRIMARY) — THE DOUBLE-PRESS: STOP AFTER A STRIPPED FIRST PRESS
**Basis:** r120's metric review: "The next run's Q should be the double-press
itself." r120 proved the remaining 7 press-fails are ALL second presses: the
evening leg presses twice per node while the haul is 0; the first press strips
the 3×3 patch, so the second press re-sweeps a patch the first press just
emptied and fails with "This patch has nothing left to give right now."
Seed 1133 d12 (Mara) is the pure case: 6 nodes × (press 1 ok, 0 kcal; press 2
fail). The green sort + skip cannot touch them — the skip checks before press
1, when the patch is still green.
**Code facts established BEFORE the panel (read, not run):**
- The game's AREA SWEEP (game.js doAction forage ~27500) harvests EVERY
  forageable, non-regrowing, non-scorched cell in the 3×3 around the player's
  cell, then depletes each ("harvest each cell: deplete it (3-day regrow)").
  A cell that yields 0 edible kcal (unknown plant) is still harvested and
  depleted. So after ANY ok press, the patch the press swept holds no
  harvestable cell: a second press on the same patch MUST fail
  (harvested.length === 0 → "This patch is worked out"). The one corner:
  plant/bush cells with no species id are skipped, not harvested — they stay
  green but yield nothing, so a second press still fails. The re-check below
  records that corner if it ever occurs (green3x3After > 0 with pressYield 0).
- The evening press loop (driver ~3476) presses up to 2× per node and breaks
  only on haul > 0 or a failed press. `haulE` is the RUN total, not the
  press yield — the fix measures the per-press delta.
**Driver change (driver-only, zero src/js) — AFTER driver only:**
- Before each press, record haulBefore (player + partner haul kcal). After an
  ok press, pressYield = haulAfter − haulBefore; re-read outingGreen3x3()
  as green3x3After. Record both on the 'together' attempt (new fields
  `press` 0/1, `pressYield`, `green3x3After`).
- If the press was ok AND pressYield === 0 AND green3x3After === 0: the patch
  is provably stripped — STOP. Record a 'together-stopped' attempt (reason
  'patch stripped by first press — second press cannot yield', node +
  green3x3After) and break the press loop (the node loop tries the next
  green node). The stop fires only on a measured 0, never on null.
- If pressYield === 0 AND green3x3After > 0 (the species-less corner): press
  again as before — the game will fail it, and the record names the corner.
- If pressYield > 0: pressed=true, break (existing behavior, unchanged).
- The mid-day (b) leg presses up to 3× with the same shape but is DORMANT
  (0 presses on r119/r120 — the scholar carries 0 kcal at home at mid-day);
  it is NOT changed — the same stop belongs there when a leg can exercise it.
  Watch item, not this run's Q.
**Pre-registered metric (binding, judged BEFORE vs AFTER on identical seeds):**
- AFTER evening press-fails (outingchain pooled.pressFail) ≤2 AND
  keptTotal(AFTER) ≥1 (the chain still completes) AND second-press
  stripped-shape fails = 0 (no 'together' ok=false attempt whose previous
  attempt on the same node/day was ok with pressYield 0 and green3x3After 0)
  AND together-stopped ≥1 with green3x3After=0 (the fix firing, not luck).
- BEFORE is the baseline on the same seeds (r120 panel on 1132–1141: 7 fails;
  the BEFORE corpus on 1142–1151 is the matched number this run is judged
  against — a cross-band comparison is NOT the verdict).
- If press-fails fall but keptTotal(AFTER) == 0, adjudicate by furthest rung
  (the chain broke elsewhere — name the rung), not as a Q1 pass.
- If 0 together-stopped occur, report the green3x3After distribution of
  0-kcal ok presses instead of claiming the stop worked; the metric is then
  judged on press-fails alone.

## Q2 — THE EVENING HOP GIVES UP ON THE FIRST REFUSAL: STEP AROUND IT
**Basis:** r120's metric review: "The 1141 unreached story is the next H-HOP
question." Seed 1141: three far nodes (0,0) d4 stock 47, (0,1) d4 stock 42,
(0,3) d4 stock 41 all unreached — the green sort sends the driver to the
greenest far tiles and the hop cannot reach them. r120's review asked for a
"hop-budget instrument (ticks left at hop time vs distance)".
**Code fact established BEFORE the panel (read, not run) — the H-HOP
hypothesis is already falsified for the hop itself:** node travel is FREE
(Steve 2026-10-05; game.js:274 TRAVEL_TICKS deprecated: "travelTo charges
no ticks"). A hop cannot run out of ticks. What CAN stop it is travelTo's
intermediate-blockage scan (a bridgeless creek on the jump line refuses the
jump) — and the driver's outingHopTo (~2688) tries exactly ONE jump per
iteration and BREAKS on the first no-progress refusal, with no sidestep and
no detour. The same shape r122's scale fix addressed for walkTo (the
(4,4)→(2,5) hop refused because intermediate (2,4) is a bridgeless creek;
walkTo now steps tile-by-tile with sidesteps — proof
scripts/test-journey-scale-r122-walkto-20261109.js, panel 6/6 + 12/12).
The r121 instrument therefore records ticks-left AND the refusal, so the
panel adjudicates H-ROUTE (refusal with ticks to spare) vs H-HOP (the part
ending mid-hop) honestly instead of assuming the budget.
**Driver change (driver-only, zero src/js) — AFTER driver only:**
- outingHopTo rewritten on the r122 walkTo pattern (attributed in-code):
  orthogonal one-tile steps through travelTo, longer axis first, then the
  other axis, then a perpendicular sidestep (toward-target side first, never
  onto a tile already on this walk's path); MAX_STEPS 16; stops on Game.over
  / inCombat; same boolean return, so the three call sites (evening node
  hop, evening-home hop, R72 walk-home hop) are unchanged.
- Per-hop detail stashed in ctx._lastHop {tx, ty, reached, steps, blocked,
  dayPartBefore, dayPartAfter, ticksLeftBefore} (ticksLeft from
  Game.TIME.TICKS_PER_PART || 128, mirroring game.js:27891-27892). The
  evening unreached nodeFails entry keeps its parseable shape
  `(x,y,dN):unreached` (the outingchain analyzer's `[a-z-]+` reason regex);
  the hop detail rides on the 'evening-blocked' attempt record as `hopDetail`
  (per-node {x,y,d,steps,blocked,dayPart,ticksLeft}), which the analyzer
  ignores — the run note reads the census JSON directly.
**Pre-registered metric (binding, judged BEFORE vs AFTER on identical seeds):**
- AFTER evening unreached-far count (outingchain pooled.farUnreached) <
  BEFORE evening unreached-far count, AND every AFTER unreached node carries
  an engine-named block (honest stall, not a give-up). If BEFORE has 0
  unreached-far, Q2 is UNTESTED (carried), not NO-GO — the fix then has
  nothing to prove on this band.
- Classification per AFTER unreached node (from hopDetail): H-ROUTE if a
  block is named with ticksLeft > 0; H-HOP if dayPart advanced during the hop;
  H-GUARD if steps hit MAX with no block named. Report the counts.
- If AFTER unreached-far ≥ BEFORE unreached-far, NO-GO on Q2 — adjudicate by
  case (name the nodes/blocks), do not re-score.

## Q3 (STANDING) — PRACTICE: DOES THE MOVEMENT REPEAT?
**Instrument (unchanged):** practiceSnapshot d1/d14/d28; analyzer r112
verbatim with DIR arg; huntpractice analyzer r117 verbatim with DIR arg.
Run on the AFTER corpus (the BEFORE corpus is the Q1/Q2 baseline only; the
practice question is judged on the AFTER driver, as the live policy).
**Pre-registered metric (binding):** movedCells(d1→d28) pooled, attributed
as in r112. GO if ≥1 attributed moved cell on the panel; NO-GO if 0. Report
d1→d14 and d1→d28 side by side, PLUS the rep totals from the huntpractice
analyzer (reps-below-rung vs reps-zero are different stories). Watch
(reported, not judged): hunt/forage/fish/scout/patrol moves; specialist/
foodXp 0→positive SPLIT into foodXp vs specialistSkill; npcSkills gained;
funnel numbers vs r120 (planSeeds, partyWaits, partyFights, monster kills,
starvation deaths per seed).

## Q4 (CARRIED) — ENGAGEMENT REGRESSION LINES (M-PR1 / M-PR2, standing)
- M-PR1 per-seed (adopted r113, ≥3-turn rule): never-offered ≤1 sitting on
  ≥8/10 seeds; report the unfiltered count alongside; transcript
  adjudication of every never-offered sitting remains the backstop.
- M-PR2 revised: of sittings where dlg:commit was PICKED, fraction resolving
  'promised' / (picked − away-guard refusals) ≥80% = line holds. The
  away-guard share is reported separately, and all 'stated' refusals are
  explained case by case (the R72 away-guard is by design).
- M-TG RETIRED (r110 closed the thread-gate question). If a picked-but-stage-1
  case ever appears with a non-'want' thread, that single case reopens it.
- Judged on the AFTER corpus.

## Q5 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7)
r120: GOAROUND-HOLDS (R84 kcal 5/6 = 83%, R85 kcal RESCUE-GO 6/6), with one
non-arrival proven to be a timing shape (1139 d11 arrived via the rescue
ladder; the R84 window caught it mid-transit).
**Meaning stated for this run (r120 metric review):** R84 measures PROMPT
arrival (reached Haven inside the check window); R85 measures NO BEARER
LOST (the rescue ladder completes every skip). They are separate bars, not
two readings of one number.
**Pre-registered metric (binding):** M7-r121 kcal: arrived / kcal-skips ≥80%
= GOAROUND-HOLDS (prompt); <80% = GOAROUND-WEAK (name the failing
seeds/days and the rung that stopped). R85: complete == skips = RESCUE-GO;
any skip without a completed rescue = RESCUE-LOST (stop, adjudicate).
Rung fires reported as counts with seed/day. Judged on the AFTER corpus.

## Q6 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r120: UNTESTED (triggered=0, ate=0, checks=279). Carried as a regression
check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E
scholar starvation deaths; 0 triggered steps ending enterResult===false).
An empty sample is UNTESTED, not GO — r115's rule. A 1-case GO stays a weak
GO, reported as such. Judged on the AFTER corpus.

## Carried bindings (r120 verdicts, re-judged fresh on the AFTER corpus)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party
  invites spoken/dry; full transcripts read for sense (SENSE-TESTING LAW).
- **M-R70 (closed r107):** consistency check only — live-promise dawn opps
  with waiting=false should stay explained (has-run / kept / dead promiser),
  0 genuine defects expected.
- **NAV-log classifier (standing instrument):** any GENUINE "(no line)" is an
  investigation item; panel must show THEM: (no line) == 0 with menu:more
  picks > 0 and NAV: lines == menu:more picks.
- **Zero-DMG invariant (standing after-proof, r115; v2 analyzer the standing
  instrument per r117):** 0 violations on the panel corpus
  (test-landing-r115-zerodmg-invariant.js). Any violation is a FIX-FAILED —
  stop, adjudicate, no verdict.
- **Miriam line test (standing, r115):** 0 "settled"-asserting lines in the
  exit pools (test-landing-r115-miriam-line.js); the panel grep must show 0
  "That's settled" across all transcripts.
- **R66 HUNGRY horizon pantry + starvation deaths per seed:** r120 5/10
  HUNGRY with 0 starvation deaths (pattern — collapse recurs, lever work
  candidate, NOT this run's Q). Report starvation deaths per seed
  alongside the gate.
- **R73 narrow windows:** r120 promised=7, NARROW=7, keptInsideNarrow=1.
  Design input, carried.
- **Mantle latency (owed item, r107; OBSERVED r119 latency 1, r120 latency
  2):** watch whether any r121 mantle pass exceeds 1 day; if a ≥2 latency
  recurs, read the daily census series around the death to see what the
  succession sweep did (the analyzer already logs latency; the sweep-timing
  mechanism stays open).
- **1130-d6 amnesia-shape watch (r119 open watch):** resume reply "Huh. I
  wouldn't have guessed that about you." — needs a prior-sitting check
  before any claim. Watch for a recurrence; check the prior sitting before
  calling it amnesia.

## Watch items (not verdicts)
- **Scholar 0-strikes (r120 watch, sharpened):** r120's policy walks — 31
  moves, 0 waits, 0 barrier exits, 0 abilities across 9 fights. Read the
  r120 scholar-turns analyzer on the AFTER corpus: per zero-DMG fight, the
  scholar's verb counts; plus the panel verb totals across ALL fights. The
  read asks whether walking instead of striking was the right call in the
  fights where allies did the killing — report, do not verdict without the
  fight logs. (A range-at-turn-start instrument is a future run's job.)
- **Curious resume line (r120 voice flag):** "Huh. I wouldn't have guessed
  that about you." fires as the generic curious-want reply even for mundane
  wants ("what day it is"). Count occurrences on the AFTER panel + read each
  in its transcript for fit. A game-side voice fix is NOT in scope unless
  the panel proves the misfit with a before/after proof test (DELIVER OVER
  MEASURE) — the fix would split the reply by want kind, which needs the
  panel's cases as its proof corpus.
- **Deflect-fallback repetition (r118/r120 loop shape):** the dlg:subject
  fallback repeats verbatim in long sittings (Jose 1132-d6: "Forget I said
  anything. What did you want?" ×3, "Sorry — I shouldn't load that on you.
  What's up?" ×2 across 22 turns). Grep the AFTER transcripts for repeats
  in sittings ≥15 turns; report the worst sitting. Game-side voice pass
  candidate, not a verdict.
- **Hunt-assignment policy question (r117, carried):** does the competent
  policy need a hunt-assignment branch (fed pantry + idle hunter), or is
  chore-first correct play? A policy question, not this run's Q1. R120:
  hunt reps 0 again (311 kills, 0 hunt practice).
- **Thief/route shape-B fights (r117):** watch whether shape B recurs; read
  the full fight logs for sense — did the scholar have a real choice (fight
  to recover vs let it go), or does the policy always flee-walk? Report, do
  not verdict without the logs.
- **Ally-accompanied hunt fights:** r120 re-base holds (18/20 fights have
  villager allies present). Report fresh.
- **Mid-day (b) leg dormant (r119/r120):** 0 presses, together-blocked all
  "You carry 0 kcal… at home". The (b) leg never fires on this panel by
  construction. Carry as a watch item; the evening leg is the only
  together-press path. The (b) press loop carries the same double-press
  shape unpatched (see Q1) — a leg that exercises it takes the stop there.
- **Kill-mean trend (telemetry watch):** per-seed monster-kill mean r119
  25.6 → r120: 311/10 = 31.1. Report fresh. Seed mixture, not a trend.
  Reported, not chased.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a
  famine the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable
  before day 28 (r106 M-A2, re-confirmed r107–r120). Re-proving the staging
  adds nothing (DELIVER OVER MEASURE).
- **Eamon fallback (standing line):** r120 had 0 starvation deaths, so 0
  STARVATION lines live. A future famine panel exercises it live.
- **Poison re-test (r109 fix, tenth panel):** r120 had 3 poison verdicts,
  0 re-tests, tester survives. Report fresh.
- **Observe fallback (r118 Owen finding, game-side watch):** the observe
  fallback ("I just said — did you miss it?") fired 3 times in one
  sitting while the want sat unasked. If Q1's resume fix removes the
  loop, note whether observe still fires repeatedly in other shapes;
  report, do not verdict without transcripts.

## Seeds, pilot, shape
- Panel: fresh seeds 1142–1151, DAYS=28, OUTDIR landing-r121-before (BEFORE
  driver) and landing-r121-after (AFTER driver), both under goal
  hidden_files evidence/2026-11-09/.
- PILOT FIRST: 3 seeds (1142–1144), BOTH drivers, before expanding. The pilot
  validates (a) seeds run; (b) the practice snapshots present in census JSON
  (d1/d14/d28, non-null competence maps, practice['hunt'] fields present); (c)
  the outingchain analyzer runs on both pilot corpora; (d) the invariant test
  passes (0 violations); (e) ≥1 forage_help favor observed; (f) **≥1 evening
  together attempt on a far node (d≥4) — the green sort must not kill far
  attempts; if 0, stop and diagnose**; (g) report count of
  `alive:thread:want` offers in TOPIC_SIT sittings (carried Q1-closed read).
  If the pilot shows 0 favors, document and still run the panel only if the
  carried bindings need the panel — the pilot decides; do not burn a full run
  on a dead question.
- Shape: the r118 outingchain analyzer runs on BOTH corpora as-is (it
  ignores the new kinds/fields). The r121 presshop analyzer compares the two
  corpora for Q1/Q2. The invariant test re-runs on the AFTER panel corpus as
  the after-proof. Q1 is measured by the presshop analyzer + the r41 counters;
  Q2 by the presshop analyzer + hopDetail records. The scholar-turns analyzer
  runs on the AFTER corpus as the watch read.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
