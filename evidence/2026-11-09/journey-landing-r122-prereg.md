# journey-landing r122 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** playtest-loop-a-20261109T1545Z (scheduled Mon 2026-11-09 15:45 CST, started ~22:08Z).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** local master `7cd52fbb0` ("journey-scale r123", pending ship). Branch: `journey-landing` (worktree).
**Seed band 1152–1161 (fresh — see below).**
**Registration:** BLOCKED by Flap 3 (EPERM write flap, 2026-11-09 ~22:16Z): O_EXCL
file creation refused (git lock files — `git worktree add` fails writing
`.git/worktrees/journey-landing/locked`; `git branch` fails writing
`.git/refs/heads/*.lock`), while plain O_TRUNC writes mostly succeed. First
register attempt interrupted by a runtime restart mid-checkout (orphan
worktree removed cleanly); 27+ register retries + 8804 tight-loop
`--no-checkout` attempts all failed on the `locked` write. A flap-waiter
probing the real O_EXCL create in `.git/worktrees/` ran two 20-minute cycles;
cycle 2 found a window at 23:18:54Z and `git worktree add --no-checkout`
succeeded 23:18:55Z. The registry entry was then written manually,
replicating worktree-register.sh exactly (flock + atomic write, run_id
2026-11-09T22:08:50Z matching the lock); heartbeat 23:19:42Z; checkout
(`git reset --hard HEAD`, 87,573 files) completed 23:33Z. The staged prereg
draft was truncated to 0 bytes at 23:17Z by a flap-blipped python write
(open-truncate succeeded, write EPERM) and was rewritten into the worktree
from the run's context.
**Numbering note:** Lane A leg counters are per-leg; the last landing run was
r121, so this run is r122. (Deepening's r122 / scale's r123 are different
legs' counters.)
**Design — BEFORE/AFTER on matched seeds (§15, §9):** both drivers run the
SAME fresh seeds 1152–1161, DAYS=28. BEFORE = r121 AFTER driver verbatim
except seeds/OUTDIR/header (it already contains the Q1 press-stop, Q2
stepping hop, and the r121 curious first-reveal fix lives in src). AFTER =
r122 driver = BEFORE + Q1 env gates below (driver-env only, zero src/js).
The panel judges the deltas on identical villages, not across seed bands.
Drivers:
- scripts/journey-landing-r122-before-20261109.js (r121 verbatim; OUTDIR landing-r122-before)
- scripts/journey-landing-r122-20261109.js (r121 + Q1 gates; OUTDIR landing-r122-after)
Analyzers: scripts/analyze-landing-r118-outingchain.js;
scripts/analyze-landing-r121-presshop.js (Q1/Q2 counter);
scripts/analyze-landing-r104-20261105.js (DIR via argv);
scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r113-navlog.js; scripts/analyze-landing-r107-commit-offer.js
(WITH THE Q2 SETTLED-FAVOR REVISION — see below);
scripts/analyze-landing-r117-huntpractice.js; scripts/analyze-landing-r117-zerodmg-v2.js
(the standing zero-DMG instrument); scripts/analyze-landing-r120-scholar-turns.js
(the standing scholar-turns watch instrument).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 is driver-env only (zero src/js).
A game-code fix is NOT in scope unless the panel proves a defect in game
code with a before/after proof test.
**Canon:** docs/CANON.md read at run start. No canon doc covers the flee
execution, the arena entry tile, or the competent-policy gates — Q1 rests on
code (competent.js flee(), game.js tbPlayerMove/findPath) + panel, not
invented canon. docs/CONTESTS.md covers contests-are-played (the 1148 death
fight is a contest-arena fight — it WAS played, blow by blow; the defect is
the scholar's flee execution inside it, not the contest).
**Pre-flight deviations (LOUD, recorded, standing state):** `git pull --ff-only`
FAILED — local master is ahead 300 / behind 156 vs origin/master (merge-base
d229b58f5, batch ship 2026-11-08 11:29Z; Cursor PR merges #119–121 on origin).
Same standing divergence r120/r121 recorded; Steve was asked Nov 8 ~15:25
CST and the SHIP waits on his reconciliation direction. Proceed on local
master, no merge/push/rebase of origin; landing is ff-only into local master
and cannot revert anything. **This run measures pre-OVE code**, as r120/r121 did.
**Flap 3 (this run):** see Registration above. Sibling arms (sim-foodrung-band-b,
sim-midfifth-c-b, the r166 Lane B adoption) ran their own flap-waiters
concurrently; the whole fleet waited on this flap.
**Context (not this leg's work):** siblings' sim arms hold dirty worktrees
in parallel (sim-wideduty-a, sim-sametick-a, journey2-succession,
sim-medheadcount-confirm-a, sim-midfifth-c-b, sim-foodrung-band-b,
build-ladder-leg4-baseline). This run measures master as-is; no action here.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1152–1161**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for `\b115[2-9]\b|\b116[01]\b` over all files
  matching `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md`
  returns **4 matches, all incidental** ("findings line 1158" in
  sim-gardendeposit-b-prereg.md; "backlog 1156" in sim-stockdoors-b-prereg.md;
  "d95 1154" in sim-w4damage-a-prereg.md; "table.js:1156" in
  sim-sitgap-b-prereg.md — a line number, a backlog id, a day/stat, a code
  line reference; none a seed naming) and **0 seed namings**. No range
  "1152–1161" is named anywhere. The forbidden-band list
  (hidden_files/sim-heraldband-pilot-prereg-2018.md) names nothing in this band.
- No corpus files for these seeds exist (no landing-r122-* dir yet).
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062, 1063–1072, 1073–1082, 1083–1092, 1093–1102 (overlaps
  1101–1110), 1111 (single seed, social r11), 1112–1121 (r118), 1122–1131
  (r119), 1132–1141 (r120), 1142–1151 (r121, just used).

## Q1 (PRIMARY) — THE FLEE THAT NEVER LEAVES: THE NO-OP EDGE WALK KILLS THE SCHOLAR
**Basis — r121's "scholar never strikes" was a misread; the real defect is
narrower and proven in the corpus.** The scholar struck 24× on the r121
AFTER panel (fights where it dealt damage). The defect lives in the TWO
zero-damage death fights, read case by case from the census fightLogs:
- **1148 d25 (Jian, The Union Rep, contest-arena fight, 10 rounds, LOST,
  28→-1 HP):** 9 moves, ALL to (0,0), 0 strikes, 0 barrier exits, 0 waits,
  0 abilities. The scholar starts the arena fight AT (0,0) (census
  scholarMx 0, scholarMy 0), 28/100 HP, alone, vs the Rep (101 HP) + its
  picket backup. Every turn it "moves" to (0,0) and the Rep's Solidarity
  Speech (locks on — "moving won't dodge it") + the darter's Skyfall Dive
  kill it. The fight WAS played blow-by-blow; the scholar's turns were all
  spent on the same no-op.
- **1143 d11 (Blanca, Highbeam Deer, 6 rounds, LOST):** 5 moves
  (0,3(!moved); 4,4; 3,3; 2,3; 0,3(!moved)), 0 strikes — the scholar walks
  toward the edge tile (0,3), twice fails the last step, dies without
  striking. Same flee shape, different geometry.
**Code facts established BEFORE the panel (read, not run):**
- `competent.fight()` (scripts/policies/competent.js, the `competent` object
  method driveFights calls) chooses flee at low HP vs a big monster — the
  right call in both deaths; the DECISION is not the defect.
- With every COMPETENT_* gate OFF (the landing driver sets none), flee()
  takes the LEGACY branch: `if (pick && dpsRaceOn())` guards the ONLY
  barrier push in that branch (competent.js:3542) — `dpsRaceOn()` is false,
  so NO push is ever attempted. The fall-through walks to the nearest
  x-edge: `const tx = px <= 4 ? 0 : 8; Game.tbPlayerMove(tx, py)`
  (competent.js:3570). At (0,0) that is `tbPlayerMove(0,0)` — and
  `findPath` returns `[[0,0]]` for start==target (game.js:14554 `return
  path.length ? path : [[tx, ty]]`), so the move "succeeds" as a no-op
  (moved=true) and `endTurn()` spends the turn. The scholar stands on the
  edge pressing "flee" as a no-op — the exact shape the flee comments warn
  about (seed 44 belltoad, d63 moderator), recurring because the legacy
  branch never pushes.
- `exitVerifiedFleeOn()` (false) gates the stuck-flee detection that would
  fall through to strikes after 3 no-progress turns (competent.js:3583);
  `dirFleeOn()` (false) gates the directional branch that pushes through
  the chosen edge (competent.js:3422); `fleeRepairOn()` (false) gates
  marking a consumed push unfleeable so the scholar fights it out
  (competent.js:3426). All four gates default OFF (`process.env.X === '1'`).
- The 1143 geometry (walk progressing 4,4→3,3→2,3, then two failed
  (0,3) steps) is the walk-toward-edge half: the directional branch walks
  one step per turn toward the havenward edge and pushes on arrival, so it
  addresses both deaths — escape where the edge is reachable, and (via
  exit-verified + flee-repair) fight-it-out where the push is consumed or
  the walk stalls.
**Driver change (driver-env only, zero src/js) — AFTER driver only:**
- Run with `COMPETENT_DIRECTIONAL_FLEE=1 COMPETENT_EXIT_VERIFIED_FLEE=1
  COMPETENT_FLEE_REPAIR=1`. `COMPETENT_DPS_RACE` is deliberately NOT set:
  it gates fight-assess racing broadly; the directional branch pushes
  without it, and the question is the flee execution, not the race.
- The gates change flee EXECUTION only: flee decisions (HP-ratio /
  fight-assess hooks) are untouched — `COMPETENT_FIGHT_ASSESS` stays off —
  so the comparison isolates execution, not decision.
- A flee-loop death is defined for the metric as: the scholar dies in a
  fight with 0 strikes logged AND ≥3 flee-walk turns logged (player-move
  entries while fleeing — the analyzer reads the fightLog; the 1148 shape
  is 9× (0,0), the 1143 shape is ≥3 moves toward one edge tile).
**Pre-registered metric (binding, judged BEFORE vs AFTER on identical seeds):**
- AFTER flee-loop deaths = 0 AND scholar fight deaths AFTER ≤ BEFORE AND
  keptTotal(AFTER) ≥1 (the outing chain still completes under the new flee
  behavior).
- If AFTER has 0 flee-loop deaths but scholar deaths rise elsewhere,
  adjudicate by case (name the fights), do not call it a pass on the first
  clause alone.
- If the AFTER panel shows a flee-loop death, NO-GO on Q1 — adjudicate by
  case (which gate failed to fire, and why: sealed arena? push consumed?
  walk stalled?).

## Q2 — M-PR1 SETTLED-FAVOR EXCLUSION (r121 metric review)
**Basis:** r121's metric review: "M-PR1 should exclude settled-favor
sittings." The one counted miss (1150 d9 Henry) is a favor already handled
("Never mind the food I needed — we got it handled. Thanks anyway."), so no
commit *could* be offered — offering one would be the lie. The analyzer
counts it as never-offered; the game is correct.
**Change (analyzer + metric, no game code):** the M-PR1 instrument
(analyze-landing-r107-commit-offer.js) gains a settled-favor exclusion: a
sitting is SETTLED when a THEM line in it speaks one of the engine's own
settled-favor lines — the moot opener ("Never mind … — we got it handled.
Thanks anyway.", convo-wants.js:716,2013), the handled pool ("It's handled.
Really — it is…", "No, really, it's fine. Forget I even asked.", "All
sorted. Some things just work out.", convo-wants.js:747-750), or "It's
already handled. Thank you for asking." (convo-dialogue.js:450). Those lines
fire only for favor states moot / thanked / acknowledged / fulfilled
(convo-wants.js:743-745), so the rule reads the engine's own settled state,
never infers from the transcript. A settled sitting does not count as
never-offered (it is reported separately as settled=N). Proof test gains
the 1150-d9-Henry shape as a fixture (settled → excluded) plus a control
(live favor, never offered → still counted).
**Pre-registered metric (binding, judged on the AFTER corpus, and
re-measured on the BEFORE corpus with the same revised instrument):**
- M-PR1 per-seed (≥3-turn rule): never-offered ≤1 sitting on ≥8/10 seeds,
  AND the settled-favor exclusion fires on the r121 shape (the 1150-d9
  pattern, if it recurs, reads excluded — not counted, not hand-waived).
- If the exclusion never fires on this panel, Q2 is UNTESTED (carried), not
  GO — the revision then has nothing to prove on this band.

## Q3 (STANDING) — PRACTICE: DOES THE MOVEMENT REPEAT?
**Instrument (unchanged):** practiceSnapshot d1/d14/d28; analyzer r112
verbatim with DIR arg; huntpractice analyzer r117 verbatim with DIR arg.
Run on the AFTER corpus (the BEFORE corpus is the Q1 baseline only; the
practice question is judged on the AFTER driver, as the live policy).
**Pre-registered metric (binding):** movedCells(d1→d28) pooled, attributed
as in r112. GO if ≥1 attributed moved cell on the panel; NO-GO if 0. Report
d1→d14 and d1→d28 side by side, PLUS the rep totals from the huntpractice
analyzer (reps-below-rung vs reps-zero are different stories). Watch
(reported, not judged): hunt/forage/fish/scout/patrol moves; specialist/
foodXp 0→positive SPLIT into foodXp vs specialistSkill; npcSkills gained;
funnel numbers vs r121 (planSeeds, partyWaits, partyFights, monster kills,
starvation deaths per seed).

## Q4 (CARRIED) — ENGAGEMENT REGRESSION LINES (M-PR1 / M-PR2, standing)
- M-PR1 per-seed (adopted r113, ≥3-turn rule, WITH the Q2 settled-favor
  revision): never-offered ≤1 sitting on ≥8/10 seeds; report the unfiltered
  count alongside; transcript adjudication of every never-offered sitting
  remains the backstop.
- M-PR2 revised: of sittings where dlg:commit was PICKED, fraction resolving
  'promised' / (picked − away-guard refusals) ≥80% = line holds. The
  away-guard share is reported separately, and all 'stated' refusals are
  explained case by case (the R72 away-guard is by design).
- M-TG RETIRED (r110 closed the thread-gate question). If a picked-but-stage-1
  case ever appears with a non-'want' thread, that single case reopens it.
- Judged on the AFTER corpus.

## Q5 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7)
r121: GOAROUND-HOLDS (R84 prompt arrival 2/2, R85 NO BEARER LOST 2/2).
**Meaning stated for this run (r120 metric review):** R84 measures PROMPT
arrival (reached Haven inside the check window); R85 measures NO BEARER
LOST (the rescue ladder completes every skip). They are separate bars, not
two readings of one number.
**Pre-registered metric (binding):** M7-r122 kcal: arrived / kcal-skips ≥80%
= GOAROUND-HOLDS (prompt); <80% = GOAROUND-WEAK (name the failing
seeds/days and the rung that stopped). R85: complete == skips = RESCUE-GO;
any skip without a completed rescue = RESCUE-LOST (stop, adjudicate).
Rung fires reported as counts with seed/day. Judged on the AFTER corpus.

## Q6 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r121: UNTESTED (triggered=0 — no hungry/thirsty Haven day triggered the
step). Carried as a regression check: M6 clauses hold (complete eatRecs on
triggered steps; 0 class-E scholar starvation deaths; 0 triggered steps
ending enterResult===false). An empty sample is UNTESTED, not GO — r115's
rule. A 1-case GO stays a weak GO, reported as such. Judged on the AFTER
corpus.

## Carried bindings (r121 verdicts, re-judged fresh on the AFTER corpus)
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
- **R66 HUNGRY horizon pantry + starvation deaths per seed:** r121 8/10
  HUNGRY with 0 starvation deaths (pattern — collapse recurs, lever work
  candidate, NOT this run's Q). Report starvation deaths per seed
  alongside the gate.
- **R73 narrow windows:** r121 promised=8, NARROW=8, keptInsideNarrow=4.
  Design input, carried.
- **Mantle latency (owed item, r107; OBSERVED r119 latency 1, r120 latency
  2, r121 latencies 1 and 0):** watch whether any r122 mantle pass exceeds
  1 day; if a ≥2 latency recurs, read the daily census series around the
  death to see what the succession sweep did (the analyzer already logs
  latency; the sweep-timing mechanism stays open).
- **1130-d6 amnesia-shape watch (r119 open watch, CLOSED by the r121 fix):**
  the curious first-reveal guard is live in src (ae7daf40c). Verify 0
  recurrences of the misfit line on the AFTER panel; any recurrence is a
  FIX-FAILED — stop, adjudicate.
- **Scholar-turns watch (SHARPENED — the r121 note misread it):** r121's
  "26 moves, 0 strikes" conflated the zero-DMG subset with the whole
  panel (the scholar struck 24× on r121; the 0-strike shape lives only in
  the two death fights, now Q1). This run reports strikes per fight from
  the census fightLogs directly (not the analyzer's zero-DMG subset), and
  the analyzer's verbTotals line is read as all-fights totals, as written.

## Watch items (not verdicts)
- **Scholar-turns per fight (r122 read):** for every fight on the AFTER
  panel, report strikes/moves/waits/abilities + rounds + outcome from the
  census fightLogs. A fight with 0 strikes AND ≥3 moves is a Q1-shape
  candidate even if the scholar lives — name it, read the log.
- **Curious resume line (r121 voice fix, now live):** 0 expected. Count
  occurrences on the AFTER panel + read each in its transcript for fit.
- **Deflect-fallback repetition (r118/r120 loop shape):** the dlg:subject
  fallback repeats verbatim in long sittings. Grep the AFTER transcripts
  for repeats in sittings ≥15 turns; report the worst sitting. Game-side
  voice pass candidate, not a verdict.
- **Hunt-assignment policy question (r117, carried):** does the competent
  policy need a hunt-assignment branch (fed pantry + idle hunter), or is
  chore-first correct play? A policy question, not this run's Q1. R121:
  hunt reps 0 again (261 kills, 0 hunt practice).
- **Thief/route shape-B fights (r117):** watch whether shape B recurs; read
  the full fight logs for sense — did the scholar have a real choice (fight
  to recover vs let it go), or does the policy always flee-walk? Report, do
  not verdict without the logs.
- **Ally-accompanied hunt fights:** r121 re-base holds (fights with
  villager allies present). Report fresh.
- **Mid-day (b) leg dormant (r119/r120/r121):** 0 presses, together-blocked
  all "You carry 0 kcal… at home". The (b) press loop carries the same
  double-press shape unpatched (see r121 Q1) — a leg that exercises it
  takes the stop there. Carry as a watch item; the evening leg is the only
  together-press path.
- **6394 alive:want flat fall-through (r121 metric review):** the branch
  falls to "Okay. Here's the thing —" when a curious re-ask has no answer
  on record. Honest but flat; a future pass can route null → opener there.
  Count occurrences on the AFTER panel; if it fires, it is a candidate
  game-side fix for the NEXT run, not this one. Not a defect, noted.
- **Kill-mean trend (telemetry watch):** per-seed monster-kill mean r120
  31.1 → r121 26.1. Report fresh. Seed mixture, not a trend. Reported,
  not chased.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a
  famine the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable
  before day 28 (r106 M-A2, re-confirmed r107–r121). Re-proving the staging
  adds nothing (DELIVER OVER MEASURE).
- **Eamon fallback (standing line):** r121 had 0 starvation deaths, so 0
  STARVATION lines live. A future famine panel exercises it live.
- **Poison re-test (r109 fix, eleventh panel):** r121 had 0 re-tests.
  Report fresh.
- **Observe fallback (r118 Owen finding, game-side watch):** the observe
  fallback ("I just said — did you miss it?") fired 3 times in one
  sitting while the want sat unasked. Report whether it still fires
  repeatedly in other shapes; do not verdict without transcripts.

## Seeds, pilot, shape
- Panel: fresh seeds 1152–1161, DAYS=28, OUTDIR landing-r122-before (BEFORE
  driver) and landing-r122-after (AFTER driver), both under goal
  hidden_files evidence/2026-11-09/.
- PILOT FIRST: 3 seeds (1152–1154), BOTH drivers, before expanding. The pilot
  validates (a) seeds run; (b) the practice snapshots present in census JSON
  (d1/d14/d28, non-null competence maps, practice['hunt'] fields present); (c)
  the outingchain analyzer runs on both pilot corpora; (d) the invariant test
  passes (0 violations); (e) ≥1 forage_help favor observed; (f) **≥1 evening
  together attempt on a far node (d≥4) — the green sort must not kill far
  attempts; if 0, stop and diagnose**; (g) report count of
  `alive:thread:want` offers in TOPIC_SIT sittings (carried Q1-closed read);
  (h) **the flee gates load on the AFTER driver (env visible in the pilot
  log header) and at least one flee turn is logged on the pilot panel —
  if no flee turns occur, Q1 is UNTESTED on the pilot and the panel still
  runs only if the carried bindings need it**.
  If the pilot shows 0 favors, document and still run the panel only if the
  carried bindings need the panel — the pilot decides; do not burn a full run
  on a dead question.
- Shape: the r118 outingchain analyzer runs on BOTH corpora as-is. The r121
  presshop analyzer compares the two corpora for the Q1 outing shape (kept
  totals as the chain guard). The invariant test re-runs on the AFTER panel
  corpus as the after-proof. Q1 is measured by a NEW analyzer
  (scripts/analyze-landing-r122-fleeloop.js — reads both corpora, counts
  flee-loop deaths + scholar fight deaths per side, and classifies each
  flee-loop death's move pattern: all-same-tile no-op vs walk-toward-edge;
  proof test scripts/test-landing-r122-fleeloop.js with synthetic
  before/after census fixtures built from the r121 1143/1148 shapes).
  keptTotal for the Q1 chain guard is read from the outingchain analyzer
  (already run on both corpora), not re-counted. The scholar-turns
  analyzer runs on the AFTER corpus as the watch read.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
