# journey-landing r120 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** 2026-11-09T04:16:00Z (scheduled Sun 2026-11-08 21:45 CST, started ~04:16Z Nov 9).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@55b5e5aae at worktree registration ("journey-scale r112: run note").
**Seed band 1132–1141 (fresh — see below).**
**Registration:** attempt 1 at ~05:00 UTC FAILED (checkout wrote 86,069 files
with thousands of "unable to write file" errors, then `fatal: Could not reset
index file to revision 'HEAD'`; left the `journey-landing` branch at 55b5e5aae
but no worktree) — the EPERM write flap (below). Attempt 2 at 05:09 UTC
SUCCEEDED (exit 0, completed 05:18:18 UTC, ~9 min); tree verified clean (0
status lines) before any work. Heartbeat at registration + ~10-min loop.
**Numbering note:** Lane A leg counters are per-leg; the last landing run was
r119, so this run is r120. (Deepening's r120 is a different leg's counter.)
Driver: scripts/journey-landing-r120-20261109.js (r119 driver verbatim except
seeds 1132–1141, OUTDIR landing-r120, header, + Q1 resume-in-probe, Q2
cell-greenness, scholar-turn verb wraps — driver-only, zero src/js).
Analyzers (UNCHANGED except the new r120 one): scripts/analyze-landing-r118-outingchain.js
(Q1/Q2 chain; the r120 driver only ADDS `green`/`green3x3` fields to attempt
records and a `together-skipped` kind, which the analyzer ignores — no
analyzer change needed); scripts/analyze-landing-r104-20261105.js (DIR via
argv); scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r113-navlog.js; scripts/analyze-landing-r107-commit-offer.js;
scripts/analyze-landing-r117-huntpractice.js; scripts/analyze-landing-r117-zerodmg-v2.js
(the standing zero-DMG instrument — the r115 analyzer is retired per r117).
NEW: scripts/analyze-landing-r120-scholar-turns.js (r119 zero-DMG watch
instrument — verb counts per zero-DMG fight; proof test
scripts/test-landing-r120-scholar-turns.js, fixtures + r119 calibration: 20
fights, 2 zero-DMG both B, no turn data — PASS).
Proof tests (standing): scripts/test-landing-r115-zerodmg-invariant.js,
scripts/test-landing-r115-miriam-line.js, scripts/test-landing-r117-zerodmg-v2.js,
scripts/test-landing-r118-outingchain.js (fixtures + r117 calibration, unchanged).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test. The Q1
and Q2 work is driver-policy + instrument-only (resume pick placement,
node ordering, bare-patch skip, verb logging, zero src/js); a game-code fix is
NOT in scope unless the panel proves a defect with a before/after proof test.
**Canon:** docs/CANON.md read at run start. No canon doc covers joint-foraging
favor wording, thread-resume picking, or the forage patch's cell state — Q1/Q2
rest on code (src/js/favor-forage.js, src/js/conversation.js:6141,
src/js/engine/forage.js, game.js doAction forage ~27500, stripGround 8326,
genDetail 11228, cellScorched 36684) + panel, not invented canon.
**Pre-flight deviation (LOUD, recorded, standing state):** `git pull --ff-only`
FAILED at 04:15 UTC — local master is ahead 176 / behind 76 vs origin/master
(merge-base d229b58f5, 2026-11-08 11:29 UTC batch ship). The 76 origin-only
commits are Codex OVE PRs #49/#50 (2026-11-08 22:26–23:27 UTC). This is the
same standing divergence journey-scale r112's run note already recorded, with
the decision: proceed on local master, no merge/push/rebase of origin; the
ship loop owns pushes and origin reconciliation; landing is ff-only into
local master and cannot revert anything. **This run measures pre-OVE code** —
OVE-48/50/51 touch conversation/want systems the Q1 fix targets, so the fix
may need re-porting after the ship loop reconciles.
**EPERM write flap (LOUD, active episode):** filesystem-wide write refusals
began ~04:18 UTC. `worktree-reap.sh` failed 3× on registry save
(PermissionError writing REGISTRY.json.tmp); the registry itself stayed
intact (21,291 bytes). A 0-byte `~/workspace/worktrees/REGISTRY.json.tmp`
was left by the failed reaper write — harmless, the next successful run
overwrites it. Memory log 2026-11-08 records the same flap hitting reaper
runs at 22:18/22:28/22:37 CST with brief on/off windows (one ~9-min clear
~22:27 CST). Siblings' heartbeats also stalled (sim-* arms last heartbeated
04:14 UTC). The reaper's only candidate, `build-ladder-leg4-baseline`
(heartbeat 2026-11-08T15:51Z, DIRTY with 2 untracked files), is never
auto-removed — not mine, do not touch. A probe at 05:21:46 UTC wrote OK;
the flap's state is re-probed before every write in this run.
**Context (not this leg's work):** siblings' sim arms (sim-medheadcount-a,
sim-poolcapture-bar-a, flesh-out loop) are active in parallel worktrees.
This run measures master as-is; no action here.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1132–1141**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for `113[2-9]|114[01]` over all files matching
  `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md` returns
  **2 matches, both incidental** ("1140/1211 (94.1%)" in
  sim-fighterconstruct-a-prereg.md — a test-count figure, not a seed naming;
  "callers: resolve 1132" in sim-w4convert-postparty-prereg.md — a code
  reference, not a seed naming) and **0 seed namings**. No range "1132–1141"
  is named anywhere.
- No corpus files for these seeds exist (no landing-r120 dir; goal
  hidden_files evidence/2026-11-09 holds nothing yet for r120).
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062, 1063–1072, 1073–1082, 1083–1092, 1093–1102 (overlaps
  1101–1110), 1111 (single seed, social r11), 1112–1121 (r118), 1122–1131
  (r119, just used).

## Q1 (PRIMARY) — WANT-THREAD RESUME INSIDE THE TOPIC-PROBE BLOCK
**Basis:** r119 proved the shared-picker fix works (3 takes, all real) but is
pre-empted in probe sittings: seed 1124 d10 Antônio, resume offered 4×
(turns 7/11/15/19), 0 takes, 21 turns — the TOPIC_SIT block's page sweep
takes `[menu:more]` every offered turn before the shared picker runs.
OWEN-SHAPE=1 in r119 (NO-GO on that half).
**Code facts established BEFORE the panel (read, not run):**
- The resume option is `alive:thread:<tid>` (src/js/conversation.js:6141);
  picking it clears the open thread from the ledger, sets thread=tid,
  depth=1, and speaks the thread-specific resume line. It is a real
  continuation, not a menu — a competent player taps it.
- The TOPIC_SIT block (driver ~863–996) orders its picks: deflect_q, then
  the open-thread 'more' continuer, then the page sweep (dlg:subject, page
  turns, ask lines). The shared picker (wantEngage) runs only when the
  probe block falls through — which in a probe sitting it almost never
  does, because the sweep always finds something to take.
- The resume advances the WANT thread, not a topic thread, so it spends no
  topic beat before winddown — but the WD probe gates (GATE-A/B) are carried
  bindings on this panel, and any surfacing regression is adjudicated there,
  not assumed away.
**Driver change (driver-only, zero src/js):** inside TOPIC_SIT, after the
deflect_q check and the 'more' continuer check, before `dlg:subject`, take
`alive:thread:want` when offered; count `MET.wantThreadResumeTakes` (all
sittings, now reset per seed and folded into the r41 summary) and the new
`MET.wantThreadResumeProbeTakes` (probe-block takes only). Scoped to the
want thread ONLY — other thread resumes stay counted-but-untaken per the
R28 retirement. The deflect_q and the open-thread 'more' continuer still
win first: a hanging question must be cleared, and an open thread's
continuer beats switching threads.
**Pre-registered metric (binding):**
- OWEN-SHAPE = 0: no sitting with `alive:thread:want` offered ≥2×, 0 takes,
  ≥12 turns. (Measured by grepping saved transcripts; the transcript logs
  every menu.)
- RESUME-TAKEN ≥1 AND PROBE-TAKES ≥1 if any probe-sitting offer occurred on
  the panel (probeTakes from the r41 summary; offers from transcripts).
- If no probe-sitting offer occurred on the panel, the probe layer is
  UNTESTED (carried), not NO-GO — the shape is rare, and the shared-picker
  half was already proved in r119.
- If a resume IS taken and the want still stalls at stage 1 for the rest of
  that sitting, that is a GAME-SIDE finding (the thread resume does not
  advance the want) — name the seed/day/villager and read the full
  transcript; a fix is NOT in scope unless it carries a before/after proof
  test (DELIVER OVER MEASURE).

## Q2 — EVENING-LEG NODE PICKER READS CELL GREENNESS, NOT TILE.STOCK
**Basis:** mechanism proven from code + r119 corpus re-analysis. `canForage`
reads abstract `tile.stock`, but the press is an AREA SWEEP over the tile's
9×9 detail cells, 3×3 around the player's cell (scholar.mx?? 4,
scholar.my?? 4). A high-stock tile whose cells are all regrowing passes the
guard and fails the sweep ("This patch is worked out — step to another green
patch"). **All 27 r119 press-fails were evening-leg, stocks 9–41** (e.g.
stock 41, 38, 35 all failed); mid-day (b) leg had 0 presses (10
`together-blocked`, all "You carry 0 kcal… at home") — the (b) leg is
dormant by construction on this panel; carry as a watch item.
**Code facts established BEFORE the panel (read, not run):**
- The game's PATCH-TRUTH GATE (game.js doAction forage ~27500): a press
  gathers forageable cells (plant/bush/tree/bigtree) in the 3×3 around the
  player's detail cell, skipping `detailRegrow[cx,cy]` and scorched cells
  (`Game.cellScorched(cx,cy)` reads the CURRENT tile only).
- `genDetail` (game.js:11228) is deterministic per tile (detailSeed +
  neighbor tile types), cached on the tile — calling it early yields the
  identical grid the game generates on arrival; no shared RNG stream is
  consumed. Never call it on the haven tile (view-dependent).
- `stripGround` (game.js:8326) takes 1 stock per press; tiles regrow when
  unpressured. Stock and cell greenness diverge exactly when a tile has
  been pressed recently (stock spent, cells regrowing) or never pressed
  (full stock, green cells).
**Driver change (driver-only, zero src/js):**
- New helpers `outingGreenCells(x,y)` (whole-tile green count, mirroring
  the PATCH-TRUTH GATE exactly: FORAGEABLE set, detailRegrow skip, scorch
  store read directly with the scholar-day expiry) and `outingGreen3x3()`
  (green cells in the 3×3 around the player's current cell, read after the
  hop + approach, at the cell the press would sweep).
- `outingGreenNodes()` sorts green desc, then stock desc, then distance
  desc (farther first among equals keeps the far-leg exercise).
- At press time in the evening leg (after hop + `outingApproach`, which
  moves the player via microMove — so the check is post-approach, at the
  actual press cell): compute green in the 3×3; if 0, SKIP the press —
  record attempt kind `together-skipped` with node `{x,y,d,stock,green,
  green3x3}` (analyzer ignores unknown kinds) and nodeFail entry
  `(x,y,dN,sN):bare-patch` (no digits in the reason — the analyzer's reason
  regex `[a-z-]+` would truncate `bare3x3`); break the press loop and try
  the next node. The skip fires only on a measured 0, never on null
  (unreadable patch still presses).
- `outingNodeDist()` (mid-day attempts) extended with `green`/`green3x3`
  for adjudication; evening 'together' attempt records carry the same.
**Instrument (unchanged):** scripts/analyze-landing-r118-outingchain.js —
per distinct favorId, the furthest rung reached + break reason; pooled rung
counts + haul-by-node-distance + evening-blocked reason counts. The new
`green`/`green3x3` fields are read in the run note directly from the census
JSON — no analyzer change.
**Pre-registered metric (binding):**
- Evening press-fails ≤9 (r119 baseline 27 — a two-thirds cut) AND
  keptTotal ≥1 (the chain still completes) AND skips ≥1 with every skipped
  node green3x3=0.
- If press-fails fall but keptTotal == 0, adjudicate by furthest rung (the
  chain broke elsewhere — name the rung), not as a Q2 pass.
- If 0 skips occur, the green sort may have removed bare nodes from the
  candidate list entirely — report the green distribution of pressed nodes
  instead of claiming the skip worked; the metric is then judged on
  press-fails alone.

## Watch — SCHOLAR 0-STRIKES: DID THE POLICY PASS ITS TURNS? (instrument-only, no verdict)
**Basis:** r119 zero-DMG v2: 2/20 fights, both shape B (scholar-stood-through,
allies killed; scholar 0 strikes in 2 and 4 rounds, first in turn order).
Since `driveFightsImpl` (sim-harness.js:722) strikes by default when
`policy.fight` returns false, 0 strikes means `competent.fight`
(policies/competent.js:3393) consumed every scholar turn (flee-walk,
barrier push, ability, endTurn). Do NOT wrap `tbAfterPlayerAction` (called
by many engine paths, noisy).
**Instrument (new):** in the R82 block, after the `tbDamage` wrap, wrap
`tbPlayerWait`, `tbPlayerMove`, `tbBarrierExit`, `useAbility` — each appends
`{turn: 'player-wait'|'player-move'|'player-barrier-exit'|'player-ability',...}`
to the current FIGHTS entry's fightLog only while a fight is live (`_cur82()`
pattern, capture entry BEFORE the call). New analyzer
scripts/analyze-landing-r120-scholar-turns.js + proof test
scripts/test-landing-r120-scholar-turns.js (fixtures + r119-corpus
calibration: no new turn entries → "no turn data (pre-r120 corpus)").
v2 analyzer and invariant test untouched (they filter on turn types and
ignore new ones).
**Pre-registered read (not a verdict):** for each zero-DMG B-shape fight,
print the scholar's turn-verb counts. The run note reports the read — did
the scholar wait / walk / flee / use an ability, or pass turns with no
logged verb — and adjudicates with the fight log. No verdict on this watch.

## Q3 (STANDING) — PRACTICE: DOES THE MOVEMENT REPEAT?
**Instrument (unchanged):** practiceSnapshot d1/d14/d28; analyzer r112
verbatim with DIR arg; huntpractice analyzer r117 verbatim with DIR arg.
**Pre-registered metric (binding):** movedCells(d1→d28) pooled, attributed
as in r112. GO if ≥1 attributed moved cell on the panel; NO-GO if 0. Report
d1→d14 and d1→d28 side by side, PLUS the rep totals from the huntpractice
analyzer (reps-below-rung vs reps-zero are different stories). Watch
(reported, not judged): hunt/forage/fish/scout/patrol moves; specialist/
foodXp 0→positive SPLIT into foodXp vs specialistSkill (the skill step
itself is judged on its own, not inside one pooled count); npcSkills
gained; funnel numbers vs r119 (planSeeds, partyWaits, partyFights,
monster kills, starvation deaths per seed).

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

## Q5 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7)
r119: GOAROUND-HOLDS (R84 kcal ALL-ARRIVED 2/2, R85 kcal RESCUE-GO 2/2).
Carried as a regression check.
**Pre-registered metric (binding):** M7-r120 kcal: arrived / kcal-skips ≥80% =
GOAROUND-HOLDS; <80% = GOAROUND-WEAK (name the failing seeds/days and the rung
that stopped). Rung fires reported as counts with seed/day.

## Q6 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r119: DOORSTEP-GO (triggered=3, ate=3; checks=279). Carried as a regression
check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E
scholar starvation deaths; 0 triggered steps ending enterResult===false).
An empty sample is UNTESTED, not GO — r115's rule. A 1-case GO stays a weak
GO, reported as such.

## Q7 — WATER CLAUSE, RETIRED IN THIS RUN
**Retired, with stated reason:** 0 wild water skips in 29 runs (r87–r119);
the landing window never produces them — the instrument belongs on a leg
with wild outings, not here. This is an explicit retirement, not a silent
drop: the clause is closed, the count (29 runs, 0 skips) is the reason, and
any future water-skip question re-opens it on the leg that can produce one.

## Carried bindings (r119 verdicts, re-judged fresh)
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
- **R66 HUNGRY horizon pantry + starvation deaths per seed:** r119 5/10
  HUNGRY with 0 starvation deaths. Report starvation deaths per seed
  alongside the gate.
- **R73 narrow windows:** r119 promised=7, NARROW=7, keptInsideNarrow=3.
  Design input, carried.
- **Mantle latency (owed item, r107; OBSERVED r117):** r119 latency 1
  (Kennedy d12 → Camila d13). Watch whether any r120 mantle pass exceeds 1
  day; if a ≥2 latency recurs, read the daily census series around the death
  to see what the succession sweep did (the analyzer already logs latency;
  the sweep-timing mechanism stays open).
- **1130-d6 amnesia-shape watch (r119 open watch):** resume reply "Huh. I
  wouldn't have guessed that about you." — needs a prior-sitting check
  before any claim. Watch for a recurrence; check the prior sitting before
  calling it amnesia.

## Watch items (not verdicts)
- **Hunt-assignment policy question (r117, carried):** does the competent
  policy need a hunt-assignment branch (fed pantry + idle hunter), or is
  chore-first correct play? A policy question, not this run's Q1. R119:
  hunt reps 0 again (256 kills, 0 hunt practice).
- **Thief/route shape-B fights (r117):** 2/21 fights routed, scholar never
  struck, beast stole and ran. Watch whether shape B recurs; read the full
  fight logs for sense — did the scholar have a real choice (fight to
  recover vs let it go), or does the policy always flee-walk? Report, do
  not verdict without the logs.
- **Ally-accompanied hunt fights:** r119 re-base holds (20/21 fights have
  villager allies present). Report fresh.
- **Mid-day (b) leg dormant (r119):** 0 presses, 10 `together-blocked`, all
  "You carry 0 kcal… at home". The (b) leg never fires on this panel by
  construction (the scholar carries nothing at home at mid-day). Carry as
  a watch item; the evening leg is the only together-press path.
- **Kill-mean trend (telemetry watch):** per-seed monster-kill mean 25.6
  (r118) → r119: report fresh. Seed mixture, not a trend. Reported, not
  chased.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a
  famine the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable
  before day 28 (r106 M-A2, re-confirmed r107–r119). Re-proving the staging
  adds nothing (DELIVER OVER MEASURE).
- **Eamon fallback (standing line):** r119 had 0 starvation deaths, so 0
  STARVATION lines live. A future famine panel exercises it live.
- **Poison re-test (r109 fix, ninth panel):** r119 had 1 poison verdict,
  0 re-tests, tester survives. Report fresh.
- **Observe fallback (r118 Owen finding, game-side watch):** the observe
  fallback ("I just said — did you miss it?") fired 3 times in one
  sitting while the want sat unasked. If Q1's resume fix removes the
  loop, note whether observe still fires repeatedly in other shapes;
  report, do not verdict without transcripts.

## Seeds, pilot, shape
- Panel: fresh seeds 1132–1141, DAYS=28, OUTDIR landing-r120 (goal hidden_files
  evidence/2026-11-09/).
- PILOT FIRST: 3 seeds (1132–1134) before expanding. The pilot validates (a)
  seeds run; (b) the practice snapshots present in census JSON (d1/d14/d28,
  non-null competence maps, practice['hunt'] fields present); (c) the
  outingchain analyzer runs on the pilot corpus; (d) the invariant test
  passes (0 violations); (e) ≥1 forage_help favor observed; (f) **≥1 evening
  together attempt on a far node (d≥4) — the green sort must not kill far
  attempts; if 0, stop and diagnose**; (g) report count of
  `alive:thread:want` offers in TOPIC_SIT sittings — if 0 in pilot, expand
  to panel and judge the probe layer there (not a pilot stop; the shape is
  rare). If the pilot shows 0 favors, document and still run the panel only
  if the carried bindings need the panel — the pilot decides; do not burn a
  full run on a dead question.
- Shape: the r118 outingchain analyzer runs on the r120 corpus as-is (it
  ignores the new kind/fields). The invariant test re-runs on the r120 panel
  corpus as the after-proof. Q1 is measured by grepping saved transcripts +
  the r41 counters (wantThreadResumeTakes / wantThreadResumeProbeTakes).
  The scholar-turns analyzer runs on the r120 corpus as the watch read.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
