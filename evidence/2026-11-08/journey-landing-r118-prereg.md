# journey-landing r118 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261108T0435Z (scheduled Sat 2026-11-07 21:45 CST, started 04:35Z Nov 8).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@2ce918e0e at worktree registration (`git pull` already up to
date at pre-flight; master moved during registration — a sibling merged
sim-medicdiag-a / sim-darkwit-b; base verified current at registration:
main-tree `git log -1 master` and the worktree HEAD agree on 2ce918e0e).
Main tree clean; disk 29%.
**Seed band 1112–1121 (fresh — see below).**
**Registration:** completed exit 0 in ~11.1 min (slow checkout; `git reset
--hard` actively running, tree verified clean, 0 status lines, before any
work). Heartbeat at registration + ~10-min loop.
**Numbering note:** Lane A leg counters are per-leg; the last landing run was
r117, so this run is r118. (Deepening's r118 is a different leg's counter.)
Driver: scripts/journey-landing-r118-20261108.js (r117 driver verbatim except
seeds 1112–1121, OUTDIR landing-r118, header, + Q1 evening-leg widening and
node attribution — driver-only, zero src/js).
Analyzers (UNCHANGED): scripts/analyze-landing-r104-20261105.js (DIR via
argv); scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r113-navlog.js; scripts/analyze-landing-r107-commit-offer.js;
scripts/analyze-landing-r117-huntpractice.js; scripts/analyze-landing-r117-zerodmg-v2.js
(the standing zero-DMG instrument — the r115 analyzer is retired per r117).
NEW: scripts/analyze-landing-r118-outingchain.js (Q1 per-favor chain).
Proof tests (standing): scripts/test-landing-r115-zerodmg-invariant.js,
scripts/test-landing-r115-miriam-line.js, scripts/test-landing-r117-zerodmg-v2.js.
NEW: scripts/test-landing-r118-outingchain.js (fixtures + r117 calibration).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test. The Q1
work is driver-policy + instrument-only (evening-leg widening, new analyzer,
zero src/js); a game-code fix is NOT in scope unless the panel proves a
defect with a before/after proof test.
**Canon:** docs/CANON.md read at run start. No canon doc covers joint-foraging
favor wording — Q1 rests on code (src/js/favor-forage.js) + panel, not
invented canon. The "monster encounters are fought, not rolled" rule
(MONSTER-WAVES.md) is untouched by this run.
**Context (not this leg's work):** Steve 2026-11-07 16:55 CST approved the 4
new alien personas — the alien-expansion + Reunion mirror-cap builds run in
parallel worktrees; the victory-gating design-brief build
(build-ladder-leg1) is active; the one-brain program proceeds elsewhere.
This run measures master as-is; no action here.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1112–1121**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for `111[2-9]|112[01]` over all files matching
  `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md` returns
  **2 matches, both incidental** ("1120 kcal" figures in
  sim-smoke-eq-b-prereg.md, 2026-10-26) and **0 seed namings**. A second
  word-boundary grep over ALL `evidence/**/*.md` (git grep) returns only
  incidental numbers of the same class (line numbers, test counts, kcal
  figures — e.g. app.js:1112, 1117/1117 tests) and zero prereg names any of
  1112–1121 as panel seeds. No range "1112–1121" is named anywhere.
- **CORRECTION to r117's note:** r117 wrote "next fresh band after 1083–1092
  starts at 1093". That is wrong: 1093–1102 overlaps the contaminated band
  1101–1110 (named in journey-landing-r107/r108 preregs and
  journey-establishment-r85-prereg), and 1093–1100 alone is only 8 seeds
  while the panel needs 10. Do not use 1093–1102.
- **Seed 1111 excluded though no prereg names it:** scripts/journey-social-
  r11-askfreq-20261013.js:14 used seed 1111 as a panel seed (DAY CAP 60,
  2026-10-13) — the same seed replays the same village, so 1111 is not fresh
  for a landing panel even though no prereg names it. The band starts at 1112.
- No corpus files for these seeds exist (no landing-r118 dir; goal
  hidden_files evidence/2026-11-08 holds nothing yet).
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062, 1063–1072, 1073–1082, 1083–1092, 1093–1102 (overlaps 1101–1110),
  1111 (single seed, social r11).

## Q1 (PRIMARY) — JOINT-FORAGING KEPT PROMISE: DOES THE CHAIN COMPLETE ON FRESH PATCHES?
**Basis:** r117 panel — 9 departs across 6/10 seeds, 3 together-ok presses
(ALL 0 edible kcal — "hands empty"), 0 haul-carrying presses, 0 delivers,
kept 0/10, broken 11. Evening-blocked reasons: press-fail on the 3 nearest
green nodes (3,3)/(4,3)/(5,3) + unreached hops (14). The R70/R71 kept-promise
gap is the next blank r117 named.
**Code facts established BEFORE the panel (read, not run):**
- `forageFavorAction` (src/js/favor-forage.js): forage_together requires NOT
  at home (atHome && total==0 blocks with "You have nothing from this outing
  to bring home yet. Forage together on green ground first."); forage_deliver
  requires atHome && total>0; forage_start requires dawn dayPart 0 at Haven
  with the promise live (maker is the bearer, day >= meetDay, before the
  deadline, no other outing live).
- The evening leg (driver R71d) walks only to the 3 nearest forageable nodes
  (≤3 of Haven) — the same ground the competent solo daily picks every
  morning. A press on a patch the solo policy already picked today returns
  "Nothing came of that press. This patch has nothing left to give right
  now — walk to another green patch."
- `performForageFavor` splits only KNOWN edible food (known_food_only_split);
  unknown plants stay in the player's bag, never split — so a press can
  succeed with 0 edible kcal ("hands empty").
- The (b) mid-day together presses run after competent.daily, when the
  scholar is home — they block at home with total 0. The evening leg is the
  only real together driver.
**Three mechanisms compete:**
- H-FAR (patch freshness): near-Haven nodes are picked clean by the solo
  daily; farther nodes (4–5 out) still hold edible food; together presses
  there carry haul; deliver fires; kept ≥1.
- H-KNOW (knowledge): even fresh patches yield only unknown plants in the
  first month — the village knows too few edibles for ANY patch to feed a
  joint outing; together presses stay 0-kcal; kept 0.
- H-HOP (routing): the hop to farther nodes fails (unreached / tick
  exhaustion) — the chain is routing-gated, not patch-gated.
**Driver change (driver-only, zero src/js):** the evening leg tries up to 6
green nodes within distance ≤5 (was 3 within ≤3), nearest first; records node
{x,y,d} on evening together attempts + evening-blocked lines; (b) mid-day
together attempts record the current node + distance from home. No change to
competent.daily; no src/js. Risk noted: a 5-out walk + return may exhaust
the evening's ticks — the attempt records will show it as unreached, and the
analyzer adjudicates it as H-HOP, not as a game defect.
**Instrument (new, scripts/analyze-landing-r118-outingchain.js):** per distinct
favorId, the furthest rung reached (asked → waited → departed → together-ok →
haul>0 → deliver → kept/broken/open) + the break reason at the furthest rung;
pooled rung counts + haul-by-node-distance (near ≤3 vs far 4–5) +
evening-blocked reason counts. Waits read from the dawn opps (the snap's
waiting flag misses a dawn wait that already departed by snapshot time —
fixed after the first calibration run: r117 waits 0→4). Kept requires the
R71-amendment-4 id match.
**Calibration (BEFORE the pilot):** run the new analyzer on the r117 corpus.
Expected: favors=38 kept=0 broken=11 open=27 waits=4 departs=9
togetherOkFavors=2 haulFavors=0 deliverFavors=0 farHaul=0 nearHaul=0
unknownHaul=0 unknownOk=3 handsEmpty=3 pressFail=19; RUNGS asked=29 waited=0
departed=7 together-ok=2 haul>0=0 deliver=0 kept=0; verdict OPEN (the r117
corpus carries no far-node data, so it cannot distinguish H-KNOW from H-HOP).
Reported, never re-scored; the r118 panel is the fresh-seed verdict either way.
**Pre-registered metric (binding):**
- CHAIN-COMPLETES-FAR if keptTotal ≥1 with haul from a far node (d≥4) — H-FAR
  established; name the seed/favor/days.
- CHAIN-COMPLETES-NEAR if keptTotal ≥1 with haul from near nodes only — H-FAR
  falsified as stated (near patches sufficed); report as such.
- If keptTotal == 0: adjudicate by furthest rung — haul>0 on ≥1 favor but
  deliver 0 = DELIVERY-RUNG break (name the deliver-blocked reason);
  haul 0 on all favors AND ≥1 far-node together-ok press with 0 edible =
  H-KNOW; far nodes unreached on all evening attempts = H-HOP. The analyzer's
  per-favor trace is the verdict; no re-scoring against a friendlier rung.
- If a together press returns ok=true with total>0 but the favor shows no run
  in any snap, the instrument contradicts the game — stop, adjudicate, no
  verdict (CONTRADICTION).

## Q2 (STANDING) — PRACTICE: DOES THE MOVEMENT REPEAT?
**Instrument (unchanged):** practiceSnapshot d1/d14/d28; analyzer r112
verbatim with DIR arg; huntpractice analyzer r117 verbatim with DIR arg.
**Pre-registered metric (binding):** movedCells(d1→d28) pooled, attributed
as in r112. GO if ≥1 attributed moved cell on the panel; NO-GO if 0. Report
d1→d14 and d1→d28 side by side, PLUS the rep totals from the huntpractice
analyzer (reps-below-rung vs reps-zero are different stories). Watch
(reported, not judged): hunt/forage/fish/scout/patrol moves; specialist/
foodXp 0→positive SPLIT into foodXp vs specialistSkill (r117 metric-review
proposal — the skill step is judged on its own, not inside one pooled count);
npcSkills gained; funnel numbers vs r117 (planSeeds, partyWaits, partyFights,
monster kills, starvation deaths per seed).

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
r117: GOAROUND-HOLDS (3/3 kcal, 100%). Carried as a regression check.
**Pre-registered metric (binding):** M7-r118 kcal: arrived / kcal-skips ≥80% =
GOAROUND-HOLDS; <80% = GOAROUND-WEAK (name the failing seeds/days and the rung
that stopped). Rung fires reported as counts with seed/day.

## Q5 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r117: DOORSTEP-GO (1/1, single case). Carried as a regression check: M6 clauses
hold (complete eatRecs on triggered steps; 0 class-E scholar starvation deaths;
0 triggered steps ending enterResult===false). An empty sample is UNTESTED,
not GO — r115's rule. A 1-case GO stays a weak GO, reported as such.

## Q6 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now twenty-eight runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r117 verdicts, re-judged fresh)
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
  chore-first correct play? A policy question, not this run's Q1.
- **Thief/route shape-B fights (r117):** 2/21 fights routed, scholar never
  struck, beast stole and ran. Watch whether shape B recurs; read the full
  fight logs for sense — did the scholar have a real choice (fight to
  recover vs let it go), or does the policy always flee-walk? Report, do
  not verdict without the logs.
- **Ally-accompanied hunt fights:** r117 re-base holds (20/21 fights have
  villager allies present). Report fresh.
- **R73 NARROW-PATTERN:** r117 promised=12, askedOnly=26, outOfWindow=0, all 12
  NARROW, keptInsideNarrow=0. Design input, carried.
- **R66 HUNGRY horizon pantry + starvation deaths per seed:** r117 3/10
  HUNGRY with 0 starvation deaths. Report starvation deaths per seed
  alongside the gate.
- **Mantle latency (owed item, r107; OBSERVED r117):** r117 latencies [2]
  (Lucia d23 → Victor d25, scholar-less d24). Watch whether any r118 mantle
  pass exceeds 1 day; if a ≥2 latency recurs, read the daily census series
  around the death to see what the succession sweep did (the analyzer already
  logs latency; the sweep-timing mechanism stays open).
- **Kill-mean trend (telemetry watch):** per-seed monster-kill mean 30.4
  (r117) after 30.2 (r115) → 26.2 (r113) → 27.9 (r112) → 18.8 (r111) →
  20.6 (r110) → 28.5 (r109). Seed mixture, not a trend. Reported, not chased.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a
  famine the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable before
  day 28 (r106 M-A2, re-confirmed r107–r117). Re-proving the staging adds
  nothing (DELIVER OVER MEASURE).
- **Eamon fallback (standing line):** r117 had 0 starvation deaths, so 0
  STARVATION lines live. A future famine panel exercises it live.
- **Poison re-test (r109 fix, seventh panel):** r117 had 4 poison verdicts,
  0 re-tests, all 4 testers survive. Report fresh.

## Seeds, pilot, shape
- Panel: fresh seeds 1112–1121, DAYS=28, OUTDIR landing-r118 (goal hidden_files
  evidence/2026-11-08/).
- PILOT FIRST: 3 seeds (1112–1114) before expanding. The pilot validates (a)
  the seed band (driver runs seeds 1112+), (b) the practice snapshots present
  in census JSON (d1/d14/d28, non-null competence maps, practice['hunt']
  fields present), (c) the Q1 chain analyzer runs on the pilot corpus (rung
  counts reported, no crash), (d) the invariant test passes on the pilot corpus
  (0 violations), (e) ≥1 forage_help favor observed. If the pilot shows 0
  favors, document and still run the panel only if the carried bindings need
  the panel — the pilot decides; do not burn a full run on a dead question.
- Shape: new Q1 analyzer runs on the r117 corpus BEFORE the pilot
  (calibration: kept 0, haul 0, verdict OPEN — reproduces the r117 pooled
  verdict); pilot validates the instrument fields on real output before the
  panel expands; the invariant test re-runs on the r118 panel corpus as the
  after-proof.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
