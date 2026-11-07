# journey-landing r117 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261107T1650Z (scheduled 16:45 CST 2026-11-07, started ~22:50Z).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@783c33400 at worktree registration (git pull already up to
date; no master movement during pre-flight). Main tree clean; disk 24%.
**Seed band 1083–1092 (fresh — see below).**
**Registration:** completed exit 0 in ~6.6 min (slow checkout; a mid-checkout
`git status` read showed transient D entries that resolved to a clean tree
once the checkout finished — verified 0 status lines before any work).
Heartbeat at registration + ~10-min loop.
**Numbering note:** the Lane A counter is global across legs; r116
(deepening) was last, so this run is r117. The last landing run was r115.
Driver: scripts/journey-landing-r117-20261107.js (r115 driver verbatim except
seeds 1083–1092, OUTDIR landing-r117, header — driver-only, zero src/js).
Analyzers (UNCHANGED): scripts/analyze-landing-r104-20261105.js (DIR via
argv); scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r113-navlog.js; scripts/analyze-landing-r107-commit-offer.js;
scripts/analyze-landing-r115-zerodmg.js. NEW: scripts/analyze-landing-r117-huntpractice.js
(Q1). Proof tests (standing): scripts/test-landing-r115-zerodmg-invariant.js,
scripts/test-landing-r115-miriam-line.js.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test. The Q1
work is instrument-only (new analyzer, zero src/js); a code fix is NOT in
scope unless the panel proves a defect with a before/after proof.
**Canon:** docs/CANON.md read at run start. No canon doc covers
practice/hunt-competence wording — Q1 rests on code (game.js practice
ladder, sim-drive-practice-a 2026-11-06) + panel, not invented canon. The
Q1 hunt work touches the "monster encounters are fought, not rolled" rule
(MONSTER-WAVES.md) only as measurement: villager hunt assignments resolve
through villagerHuntResolve, a real animal from a real tile.
**Context (not this leg's work):** the drive build is still unmerged; the
one-brain program proceeds elsewhere (build-brain-p1 active). Steve
2026-11-07 16:29 CST: the feast is "a very poor gating mechanism" (r109
scale: 4/4 seeds, no seat ever priced, FeastSurgeUsed false 4/4) — an open
design question, what should gate the seat instead; this run measures
master as-is and does not touch the table. This run measures master as-is;
no action here.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1083–1092**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for `108[3-9]|109[0-2]` over all 840 files
  matching `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md`
  returns **0 matches**; a second grep for `1083` over all `*prereg*` files
  returns 0. A broad grep over ALL `evidence/**/*.md` finds only incidental
  numbers (line numbers, kcal figures in old October files — e.g.
  sim-audit-*, garden-controller-*) and zero prereg names any of 1083–1092
  as panel seeds. No range "1083–1092" is named anywhere.
- No corpus files for these seeds exist (no landing-r116/r117 dir; goal
  hidden_files evidence/2026-11-07 holds landing-r112, landing-r113,
  landing-r115 only).
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062, 1063–1072, 1073–1082 (r115's band, just used).

## Q1 (PRIMARY) — HUNT PRACTICE: WHY DOES HUNT NEVER MOVE?
**Basis:** three panels running (r112: 82 moved cells, r113: 94, r115: 94)
— hunt competence moved **0 times** while villages killed 18–44 monsters a
month (r115: 302 kills). The crack outside the chores holds (fish, garden)
but hunt, the fighting skill the winnability chain needs, never moves.
**Code facts established BEFORE the panel (read, not run):**
- The practice ladder (game.js:6386, sim-drive-practice-a 2026-11-06)
  covers hunt: thresholds 8 reps for rung 1, cumulative 8 / 20 / 36, max 3
  steps; applied to the occupation base in villagerCompetence.
- `villagerPractice(vid, task)` (game.js:6405) is called from exactly ONE
  place: the tail of `resolveOneAssignment` (game.js:7524), once per
  resolved dawn assignment, final task only.
- A hunt assignment resolves through `villagerHuntResolve` (game.js:6969)
  — a REAL animal from a REAL tile's wildlife, the villager's own gear on
  the same chance machinery the player hunts with.
- Field-fight kills (scholar party hunts, contests, ambushes) NEVER call
  `villagerPractice('hunt')`. The 302 kills a panel records are not practice.
- Hunt IS a delegateable task (delegateTasks, game.js:6244: danger 1).
- The scholar's own hunts are also not assignments, so the scholar's hunt
  practice likewise only moves via assignment — which the player never gets.
  (The scholar-side encHuntXPBonus in encounters.js is a separate bonus,
  not the ladder; the snapshot measures the ladder.)
**Three mechanisms compete:**
- H0 (threshold): villagers ARE assigned hunt and reps accumulate, but no
  villager reaches 8 reps in 28 days — the first rung is out of reach in
  the landing window.
- H1 (no assignments): villagers are never assigned hunt in the landing
  window, so reps stay 0 — the dawn decision never sends anyone hunting.
- H2 (moves): hunt competence moves ≥1 attributed cell — the watch closes.
**Instrument (new, scripts/analyze-landing-r117-huntpractice.js):** reads
the census practice snapshots (no driver change — the snapshots already
record practice['hunt'] per villager at d1/d14/d28) and reports, pooled and
per seed: hunt reps total at d28, max hunt reps per villager, # villagers
with hunt reps > 0, hunt competence moves (attributed), monster kills per
seed (the denominator), and the same rep totals + moves for forage, scout,
patrol as contrast (do those tasks accumulate reps without moving?).
**Calibration (BEFORE the pilot):** run the new analyzer on the r115
corpus. Expected: hunt moves 0 (reproduces the r112 analyzer's hunt=0)
and a hunt-rep distribution that already leans H0 or H1 — reported, never
re-scored; the r117 panel is the fresh-seed verdict either way.
**Pre-registered metric (binding):**
- H1 ESTABLISHED if pooled hunt reps == 0 across all 10 seeds — then name
  the assignment-side cause from code (dawn assignment pool /
  delegateTasks / who assigns hunt and under what conditions) in the run
  note. A code fix is NOT in scope for this run unless the cause is a
  proven defect with a before/after proof test.
- H0 ESTABLISHED if pooled hunt reps > 0 AND max per-villager hunt reps
  < 8 AND hunt moves == 0.
- H2 (hunt moves ≥1 attributed cell) closes the watch; report the mover(s).
- If max hunt reps ≥ 8 but hunt moves == 0, the ladder itself is suspect —
  stop, adjudicate, no verdict (instrument/code contradiction).
- The forage/scout/patrol contrast is reported either way; if scout/patrol
  also accumulate reps without moving, the threshold story generalizes and
  the run note says so.

## Q2 (STANDING) — PRACTICE: DOES THE MOVEMENT REPEAT?
**Instrument (unchanged):** practiceSnapshot d1/d14/d28; analyzer r112
verbatim with DIR arg.
**Pre-registered metric (binding):** movedCells(d1→d28) pooled, attributed
as in r112. GO if ≥1 attributed moved cell on the panel; NO-GO if 0. Report
d1→d14 and d1→d28 side by side. Watch (reported, not judged): hunt/forage/
fish/scout/patrol moves; specialist/foodXp 0→positive; npcSkills gained;
funnel numbers vs r115 (planSeeds, partyWaits, partyFights, monster kills,
starvation deaths per seed).

## Q3 (CARRIED) — ENGAGEMENT REGRESSION LINES (M-PR1 / M-PR2, standing)
- M-PR1 per-seed (adopted r113, ≥3-turn rule): never-offered ≤1 sitting on
  ≥8/10 seeds; report the unfiltered count alongside; transcript
  adjudication of every never-offered sitting remains the backstop.
- M-PR2 revised: of sittings where dlg:commit was PICKED, fraction resolving
  'promised' / (picked − away-guard refusals) ≥80% = line holds. The
  away-guard share is reported separately, and all 'stated' refusals are
  explained case by case (the R72 away-guard is by design).
- M-TG RETIRED (r110 closed the thread-gate question). If a picked-but-stage-1
  case ever appears with a non-'want' thread, that single case reopens it.

## Q4 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7)
r115: GOAROUND-HOLDS (4/4 kcal, 100%). Carried as a regression check.
**Pre-registered metric (binding):** M7-r117 kcal: arrived / kcal-skips ≥80% =
GOAROUND-HOLDS; <80% = GOAROUND-WEAK (name the failing seeds/days and the rung
that stopped). Rung fires reported as counts with seed/day.

## Q5 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r115: UNTESTED (0/280 triggered — no hungry/thirsty Haven day arose).
Carried as a regression check: M6 clauses hold (complete eatRecs on triggered
steps; 0 class-E scholar starvation deaths; 0 triggered steps ending
enterResult===false). An empty sample is UNTESTED, not GO — r115's rule.

## Q6 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now twenty-six runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r115 verdicts, re-judged fresh)
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
- **Zero-DMG invariant (standing after-proof, r115):** 0 violations on the
  panel corpus (test-landing-r115-zerodmg-invariant.js). Any violation is a
  FIX-FAILED — stop, adjudicate, no verdict.
- **Miriam line test (standing, r115):** 0 "settled"-asserting lines in the
  exit pools (test-landing-r115-miriam-line.js); the panel grep must show 0
  "That's settled" across all transcripts.

## Watch items (not verdicts)
- **Thief/route shape-B fights (r115):** 2/16 fights routed, scholar never
  struck, beast stole and ran. Watch whether shape B recurs; read the full
  fight logs for sense — did the scholar have a real choice (fight to
  recover vs let it go), or does the policy always flee-walk? Report, do
  not verdict without the logs.
- **Ally-accompanied hunt fights:** r115 re-based the watch (15/16 fights
  have villager allies present, fixed count). Report fresh; do NOT compare
  against r113's 0 (undercount artifact).
- **R73 NARROW-PATTERN:** r115 promised=8, askedOnly=30, outOfWindow=0, all 8
  NARROW, keptInsideNarrow=2. Design input, carried.
- **R66 HUNGRY horizon pantry + starvation deaths per seed:** r115 6/10
  HUNGRY with 0 starvation deaths. Report starvation deaths per seed
  alongside the gate.
- **Mantle latency (owed item, r107 seed 1009):** r115 latencies [0, 1, 1];
  the 2-day latency is NOT reproduced a fourth panel running. Watch whether
  any r117 mantle pass exceeds 1 day.
- **Kill-mean trend (telemetry watch):** per-seed monster-kill mean 30.2
  (r115) after 26.2 (r113) → 27.9 (r112) → 18.8 (r111) → 20.6 (r110) →
  28.5 (r109). Seed mixture, not a trend. Reported, not chased.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a
  famine the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable before
  day 28 (r106 M-A2, re-confirmed r107–r115). Re-proving the staging adds
  nothing (DELIVER OVER MEASURE).
- **Eamon fallback (standing line):** r115 had 0 starvation deaths, so 0
  STARVATION lines live. A future famine panel exercises it live.
- **Other drivers share the "(no line)" logging:** scripts/convo-probe-*.js
  and the journey-deepening drivers use the same `${r0.line || '(no line)'}` 
  pattern. This run fixes the landing driver only; the other drivers are a
  follow-up, not this run's scope.

## Seeds, pilot, shape
- Panel: fresh seeds 1083–1092, DAYS=28, OUTDIR landing-r117 (goal hidden_files
  evidence/2026-11-07/).
- PILOT FIRST: 3 seeds (1083–1085) before expanding. The pilot validates (a)
  the seed band (driver runs seeds 1083+), (b) the practice snapshots present
  in census JSON (d1/d14/d28, non-null competence maps, practice['hunt']
  fields present), (c) the Q1 analyzer runs on the pilot corpus (hunt reps
  reported, no crash), (d) the invariant test passes on the pilot corpus (0
  violations), (e) ≥1 hunt fight. If the pilot shows 0 hunt fights, document
  and still run the panel only if the carried bindings need the panel — the
  pilot decides; do not burn a full run on a dead question.
- Shape: new Q1 analyzer runs on the r115 corpus BEFORE the pilot
  (calibration: hunt moves 0 reproduced, hunt-rep distribution reported);
  pilot validates the instrument fields on real output before the panel
  expands; the invariant test re-runs on the r117 panel corpus as the
  after-proof.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
