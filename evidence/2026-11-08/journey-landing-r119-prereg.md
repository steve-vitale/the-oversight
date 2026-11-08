# journey-landing r119 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261108T1420Z (scheduled Sun 2026-11-08 07:45 CST, started ~14:20Z Nov 8).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@a111b57fa at worktree registration (`git pull` already up to
date at pre-flight; master tip is the sim-tendtrust-b DIAG-GO landing).
**Seed band 1122–1131 (fresh — see below).**
**Registration:** completed exit 0 in ~11.4 min (slow checkout, same as r118);
tree verified clean (0 status lines) before any work. Heartbeat at
registration + ~10-min loop.
**Numbering note:** Lane A leg counters are per-leg; the last landing run was
r118, so this run is r119. (Deepening's r119 is a different leg's counter.)
Driver: scripts/journey-landing-r119-20261108.js (r118 driver verbatim except
seeds 1122–1131, OUTDIR landing-r119, header, + Q1 freshness-first evening
leg and Q2 want-thread resume — driver-only, zero src/js).
Analyzers (UNCHANGED): scripts/analyze-landing-r118-outingchain.js (Q1
per-favor chain; the r119 driver only ADDS a `stock` field to attempt
records, which the analyzer ignores — no analyzer change needed);
scripts/analyze-landing-r104-20261105.js (DIR via argv);
scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r113-navlog.js; scripts/analyze-landing-r107-commit-offer.js;
scripts/analyze-landing-r117-huntpractice.js; scripts/analyze-landing-r117-zerodmg-v2.js
(the standing zero-DMG instrument — the r115 analyzer is retired per r117).
Proof tests (standing): scripts/test-landing-r115-zerodmg-invariant.js,
scripts/test-landing-r115-miriam-line.js, scripts/test-landing-r117-zerodmg-v2.js,
scripts/test-landing-r118-outingchain.js (fixtures + r117 calibration, unchanged).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test. The Q1
and Q2 work is driver-policy + instrument-only (evening-leg ordering,
want-thread resume pick, stock recording, zero src/js); a game-code fix is
NOT in scope unless the panel proves a defect with a before/after proof test.
**Canon:** docs/CANON.md read at run start. No canon doc covers joint-foraging
favor wording or thread-resume picking — Q1/Q2 rest on code
(src/js/favor-forage.js, src/js/conversation.js) + panel, not invented canon.
The "monster encounters are fought, not rolled" rule (MONSTER-WAVES.md) is
untouched by this run.
**Pre-flight deviation (LOUD, recorded, not mine):** the main tree carried 1
pre-existing untracked file at run start —
`evidence/2026-11-08/sim-food-adoption-round-1315.md`, the Loop A 1315Z
coordinator's run note, left uncommitted by that closed run (its landings are
already on master: d80f972a2 etc.). Not staged, not modified tracked content,
no path overlap with this run's branch — no merge hazard. Left untouched
throughout (never committed another agent's file, never deleted it). The
final clean-tree check will still show this 1 file; it predates this run.
**Context (not this leg's work):** Lane B is mid-run on journey2-endgame
(heartbeat fresh at run start); the victory-gating ladder leg-3 coordinator
(build-ladder-leg3) and the medic-duty + fightloop2-b sim arms are active in
parallel worktrees. This run measures master as-is; no action here.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1122–1131**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for `112[2-9]|113[01]` over all files matching
  `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md` returns
  **1 match, incidental** ("`tableOfferPaths` (~1129)" in
  sim-doorwalk-b-prereg.md, 2026-11-07 — a code-ish figure, not a seed
  naming) and **0 seed namings**. The "1122Z" hits in
  sim-dissolve-a / sim-dissolvecause-a / sim-fledcover-a / sim-floortime-a
  preregs (2026-10-30) are fleshout run-id timestamps
  (fleshout-20261030T1122Z), not seed bands. A second word-boundary grep
  over ALL `evidence/**/*.md` (git grep) returns only incidental numbers
  of the same class (line numbers, test counts, kcal figures — e.g.
  villageAgency.js:1122, havenRoom:1122, 1128 kcal) and zero prereg names
  any of 1122–1131 as panel seeds. No range "1122–1131" is named anywhere.
- No corpus files for these seeds exist (no landing-r119 dir; goal
  hidden_files evidence/2026-11-08 holds nothing yet for r119).
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062, 1063–1072, 1073–1082, 1083–1092, 1093–1102 (overlaps
  1101–1110), 1111 (single seed, social r11), 1112–1121 (r118, just used).

## Q1 (PRIMARY) — JOINT-FORAGING KEPT PROMISE: DOES THE CHAIN COMPLETE ON FAR PATCHES?
**Basis:** r118 panel — CHAIN-COMPLETES-NEAR. Kept=3 (Tahani 775 kcal,
Devon 1620 kcal, Dale 360 kcal), 3/3 haul favors delivered and kept. But
**farHaul=0, nearHaul=3** — all evening entries are near (d1); the 6
nearest forageable nodes are all adjacent, so the far-node test never
fired. H-FAR is untested as designed. R118 metric review: "sort or try
nodes by patch freshness, or skip worked-out patches, so the far leg is
actually exercised."
**Code facts established BEFORE the panel (read, not run):**
- `canForage(tile)` (src/js/engine/forage.js): `(tile.stock || 0) > 0 &&
  tile.type !== 'ruin'`. Stock is the freshness signal: `stripGround`
  (src/js/game.js:8318) takes 1 stock per press; tiles regrow when
  unpressured (game.js:8371 "recovering"). The solo daily strips the near
  ground every morning; far tiles keep full stock.
- `performForageFavor` splits only KNOWN edible food; unknown plants stay
  in the player's bag — a press can succeed with 0 edible kcal ("hands
  empty"). A far press with high stock yielding 0 edible is H-KNOW, not a
  bare patch; a far press with low stock yielding 0 is bare ground.
- The evening leg (driver R71d) walks out with the partner, hops to a
  node, presses together (up to 2), hops home, delivers. Once per vid per
  day; skipped when scholar kcal <= 500.
**Three mechanisms compete (as r118):**
- H-FAR (patch freshness): farther nodes (4–5 out) still hold edible food;
  together presses there carry haul; deliver fires; kept ≥1 with far haul.
- H-KNOW (knowledge): even fresh patches yield only unknown plants in the
  first month — the village knows too few edibles for ANY patch to feed a
  joint outing; together presses stay 0-kcal; kept 0 with far haul 0.
- H-HOP (routing): the hop to farther nodes fails (unreached / tick
  exhaustion) — the chain is routing-gated, not patch-gated.
**Driver change (driver-only, zero src/js):** `outingGreenNodes()` now
sorts FRESHEST-first (tile stock desc, then distance desc) instead of
nearest-first; the evening leg still tries the first 6 (same budget —
only the order changes). Together attempts record node + distance + stock
at press time (evening leg and mid-day (b) leg both); evening-blocked
lines record node + distance + stock. No change to competent.daily; no
src/js. Risk noted: a 5-out walk + return may exhaust the evening's
ticks — the attempt records will show it as unreached, and the analyzer
adjudicates it as H-HOP, not as a game defect.
**Instrument (unchanged):** scripts/analyze-landing-r118-outingchain.js —
per distinct favorId, the furthest rung reached (asked → waited →
departed → together-ok → haul>0 → deliver → kept/broken/open) + the break
reason at the furthest rung; pooled rung counts + haul-by-node-distance
(near ≤3 vs far 4–5) + evening-blocked reason counts. The new `stock`
field is read in the run note directly from the census JSON (median stock
of far together-ok presses; stock of hands-empty far presses) — no
analyzer change.
**Pre-registered metric (binding):**
- CHAIN-COMPLETES-FAR if keptTotal ≥1 with haul from a far node (d≥4) — H-FAR
  established; name the seed/favor/days.
- CHAIN-COMPLETES-NEAR-ONLY if keptTotal ≥1 with haul from near nodes only
  and ≥1 far-node together-ok press happened — the far leg was exercised
  and failed on the press; adjudicate the far presses (H-KNOW if high-stock
  far presses yield 0 edible; bare-ground if low-stock).
- If keptTotal == 0: adjudicate by furthest rung — haul>0 on ≥1 favor but
  deliver 0 = DELIVERY-RUNG break (name the deliver-blocked reason);
  haul 0 on all favors AND ≥1 far-node together-ok press with 0 edible =
  H-KNOW (name the stock at those presses); far nodes unreached on all
  evening attempts = H-HOP. The analyzer's per-favor trace is the verdict;
  no re-scoring against a friendlier rung.
- If a together press returns ok=true with total>0 but the favor shows no run
  in any snap, the instrument contradicts the game — stop, adjudicate, no
  verdict (CONTRADICTION).
- If the panel shows 0 far-node together attempts at all, the ordering change
  did not take effect — stop, diagnose the driver, no verdict (the pilot gate
  below is meant to catch this first).

## Q2 — WANT-THREAD RESUME: DOES THE DRIVER STOP CIRCLING WHEN THE THREAD IS OFFERED?
**Basis:** r118 people check — seed 1117 d6 Owen (unresolved, 18 turns):
the want never advances past stage 1. Owen opens withdrawing the want;
the specific want-thread option ("We never finished — that sickness
help", id `alive:thread:want`) sat on the menu four times (turns 5, 9,
13, 17) but the driver never took it — it kept picking [menu:more] /
[dlg:subject] / the generic [alive:want:ask_favor], which Owen deflects.
The driver only COUNTED `alive:thread:` offers (R28 block, retired per
r27 metric review — "the pinned driver takes the r26 deepening path —
no resume-priority pick") and never took one. The wind-down gate kept
replacing leave with observe while Owen had nothing new to say, and the
observe fallback ("I just said — did you miss it?") fired three times.
**Code facts established BEFORE the panel (read, not run):**
- The resume option is `alive:thread:<tid>` (src/js/conversation.js:6141);
  picking it clears the open thread from the ledger, sets thread=tid,
  depth=1, and speaks the thread-specific resume line. It is a real
  continuation, not a menu — a competent player taps it.
- The picker's `wantEngage` (alive:want:*) sits after yn and before
  agree — the want-engagement priority band. The resume belongs in that
  band for the want thread only.
**Driver change (driver-only, zero src/js):** `wantEngage` also matches
`alive:thread:want` (exact id), in the same priority band; takes counted
via `MET.wantThreadResumeTakes`. Scoped to the want thread ONLY — other
thread resumes (gossip etc.) stay counted-but-untaken per the R28
retirement. No change to WD/topic-probe sittings' structure (the pick
lives in the shared picker; WD sittings take it only when the shared
picker runs, i.e. not while windingDown — the R55 WD MENU override still
wins there).
**Pre-registered metric (binding):**
- OWEN-SHAPE = 0: no sitting where the transcript shows
  `alive:thread:want` offered ≥2 times, 0 takes, and the sitting ran
  ≥12 turns. (Measured by grepping saved transcripts; the transcript
  logs every menu.)
- RESUME-TAKEN ≥1 when offered: `MET.wantThreadResumeTakes` ≥1 on the
  panel if any `alive:thread:want` offer occurred (offer count from
  transcripts + the existing gossipThreadOffered counter, which counts
  all alive:thread: offers — the want-thread share is read from
  transcripts).
- If a resume IS taken and the want still stalls at stage 1 for the rest
  of that sitting, that is a GAME-SIDE finding (the thread resume does
  not advance the want) — name the seed/day/villager and read the full
  transcript; a fix is NOT in scope unless it carries a before/after
  proof test (DELIVER OVER MEASURE).
- If 0 `alive:thread:want` offers occur on the whole panel, Q2 is
  UNTESTED (the shape is rare — r118 had 2 counted never-offered
  sittings on 10 seeds), not GO — report, do not re-score Q1's verdict
  on it.

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
gained; funnel numbers vs r118 (planSeeds, partyWaits, partyFights,
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
r118: GOAROUND-HOLDS (R84 kcal ALL-ARRIVED 2/2, R85 kcal RESCUE-GO 2/2).
Carried as a regression check.
**Pre-registered metric (binding):** M7-r119 kcal: arrived / kcal-skips ≥80% =
GOAROUND-HOLDS; <80% = GOAROUND-WEAK (name the failing seeds/days and the rung
that stopped). Rung fires reported as counts with seed/day.

## Q6 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r118: DOORSTEP-GO (triggered=3, ate=3; checks=279). Carried as a regression
check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E
scholar starvation deaths; 0 triggered steps ending enterResult===false).
An empty sample is UNTESTED, not GO — r115's rule. A 1-case GO stays a weak
GO, reported as such.

## Q7 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now twenty-nine runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r118 verdicts, re-judged fresh)
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

## Watch items (not verdicts)
- **Hunt-assignment policy question (r117, carried):** does the competent
  policy need a hunt-assignment branch (fed pantry + idle hunter), or is
  chore-first correct play? A policy question, not this run's Q1. R118:
  hunt reps 0 again (256 kills, 0 hunt practice).
- **Thief/route shape-B fights (r117):** 2/21 fights routed, scholar never
  struck, beast stole and ran. Watch whether shape B recurs; read the full
  fight logs for sense — did the scholar have a real choice (fight to
  recover vs let it go), or does the policy always flee-walk? Report, do
  not verdict without the logs.
- **Ally-accompanied hunt fights:** r118 re-base holds (20/21 fights have
  villager allies present). Report fresh.
- **R73 NARROW-PATTERN:** r118 promised=7, NARROW=7, keptInsideNarrow=3
  (r117: 0). Design input, carried.
- **R66 HUNGRY horizon pantry + starvation deaths per seed:** r118 5/10
  HUNGRY with 0 starvation deaths. Report starvation deaths per seed
  alongside the gate.
- **Mantle latency (owed item, r107; OBSERVED r117):** r117 latencies [2];
  r118 latency 1 (Kennedy d12 → Camila d13). Watch whether any r119 mantle
  pass exceeds 1 day; if a ≥2 latency recurs, read the daily census series
  around the death to see what the succession sweep did (the analyzer
  already logs latency; the sweep-timing mechanism stays open).
- **Kill-mean trend (telemetry watch):** per-seed monster-kill mean 25.6
  (r118) after 30.4 (r117) → 30.2 (r115) → 26.2 (r113) → 27.9 (r112) →
  18.8 (r111) → 20.6 (r110) → 28.5 (r109). Seed mixture, not a trend.
  Reported, not chased.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a
  famine the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable
  before day 28 (r106 M-A2, re-confirmed r107–r118). Re-proving the staging
  adds nothing (DELIVER OVER MEASURE).
- **Eamon fallback (standing line):** r118 had 0 starvation deaths, so 0
  STARVATION lines live. A future famine panel exercises it live.
- **Poison re-test (r109 fix, eighth panel):** r118 had 1 poison verdict,
  0 re-tests, tester survives. Report fresh.
- **Observe fallback (r118 Owen finding, game-side watch):** the observe
  fallback ("I just said — did you miss it?") fired 3 times in one
  sitting while the want sat unasked. If Q2's resume fix removes the
  loop, note whether observe still fires repeatedly in other shapes;
  report, do not verdict without transcripts.

## Seeds, pilot, shape
- Panel: fresh seeds 1122–1131, DAYS=28, OUTDIR landing-r119 (goal hidden_files
  evidence/2026-11-08/).
- PILOT FIRST: 3 seeds (1122–1124) before expanding. The pilot validates (a)
  the seed band (driver runs seeds 1122+), (b) the practice snapshots present
  in census JSON (d1/d14/d28, non-null competence maps, practice['hunt']
  fields present), (c) the Q1 chain analyzer runs on the pilot corpus (rung
  counts reported, no crash), (d) the invariant test passes on the pilot corpus
  (0 violations), (e) ≥1 forage_help favor observed, (f) **≥1 evening
  together attempt on a far node (d≥4) in the pilot corpus — the far leg
  actually fires; if 0, the ordering change did not take effect: stop,
  diagnose the driver, do not burn the panel.** If the pilot shows 0 favors,
  document and still run the panel only if the carried bindings need the
  panel — the pilot decides; do not burn a full run on a dead question.
- Shape: no new analyzer; the r118 analyzer runs on the r119 corpus as-is.
  The invariant test re-runs on the r119 panel corpus as the after-proof.
  Q2 is measured by grepping saved transcripts + MET counters.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
