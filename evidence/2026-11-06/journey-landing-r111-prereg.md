# journey-landing r111 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261106T1945Z (scheduled 13:45 CST 2026-11-06, started ~20:41Z).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@408ba9648 at run start (`git pull` already up to date; main tree
clean; disk 30%). **Seed band 1043–1052 (fresh — see below).**
**Registration (flap-delayed, loud):** first attempt failed on checkout writes
(EPERM flap: `error: unable to write file ...`, `fatal: Could not reset index
file to revision 'HEAD'`); second attempt hit branch-exists (the failed attempt
had created branch `journey-landing` at master, verified no unique work);
branch delete refused on `.git/packed-refs.new` (flap still active). Probe-gated
retry loop (`git update-ref refs/heads/probe-r111 HEAD` every 30s) got its first
window at 20:48:41Z, deleted the stale branch, and re-ran registration; the
checkout/reset then ground slowly (~9 min, tree 5.5G → 8.2G) and completed
~20:57Z. Heartbeat at registration + 10-min loop (PID 29317 outer).
**Numbering note:** the Lane A counter is global across legs; r105 (scale) was
last, so this run is r111. The last landing run was r110.
Driver: scripts/journey-landing-r111-20261106.js (r110 driver verbatim except
seeds 1043–1052, OUTDIR landing-r111, header; diff-verified at run start).
Analyzer: scripts/analyze-landing-r104-20261105.js (CHANGED this run — see Q1;
the two r110-named fixes). Commit-offer:
scripts/analyze-landing-r107-commit-offer.js (unchanged). Fights:
scripts/analyze-fights89-20261102.js (unchanged).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test; the Q1
fixes are INSTRUMENT fixes (analyzer only, zero src/js), explicitly named as
next-run work in r110's note. No game-code change is planned; a game fix
follows only if Q2 proves a game-code defect.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1043–1052**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for 1043–1052 over `evidence/*/sim-*-prereg.md`
  and `evidence/*/journey-*-prereg.md` returns only incidental numbers (line
  numbers, HP values, run timestamps like "1047Z", kcal/damage figures) and
  zero prereg names any of 1043–1052 as panel seeds. No corpus files for these
  seeds exist (the `*104[3-9]*`/`*105[0-2]*` filename hits are all seed
  1610521, a different namespace).
- Forbidden/contaminated-band files checked explicitly: the single hit is
  evidence/2026-11-06/sim-finishprobe-a-prereg.md:316 ("529 damage dealt of
  1052 entry with a +30 hunting spear") — a damage total, not a seed band
  naming. No other forbidden-band file names 1043–1052.
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010 (all named in r107/r108 preregs as
  used), plus 1033–1042 (r110's band, just used).

## Q1 (PRIMARY) — THE TWO r110-NAMED ANALYZER FIXES
**Basis:** r110's note named two instrument gaps and left them as next-run work:
(a) the NO-ARRIVAL label conflates "tested safe, never sat unknown in the
pantry" with "never tested at all" — its 4 NO-ARRIVAL seeds each tested 2–3
mids and revealed them all safe; (b) the panel summary's scholarDeaths counts
only mantle-passing deaths (2) while the panel had 3 scholar deaths (the d28
one is honestly unresolved-at-horizon and flagged as such in its own line).
Both fixes are analyzer-only (scripts/analyze-landing-r104-20261105.js), zero
src/js, zero policy change.
- **Fix A (NO-ARRIVAL split):** a peak===0 seed is labeled NO-ARRIVAL-TESTED
  when any test happened — transitions OR stream experiments OR experiment
  lines (the 1042 gap proves transitions alone undercount: 7 experiments, 6
  transitions, the poison test has no transition) — and NO-ARRIVAL-UNTESTED
  when no test happened at all. The R62 summary gains
  noArrivalTested/noArrivalUntested counts. ("Tested-safe" was r110's
  phrasing; TESTED is the honest label, since a seed that tests and finds
  poison still reached the channel — the stream poison count carries that.)
- **Fix B (scholarDeaths counts ALL scholar deaths):** final-holder deaths —
  unresolved-at-horizon AND no-successor NO-GO — now count in scholarDeaths,
  with the unresolved ones broken out (unresolved=N) on the summary line and
  the per-seed lines naming the counting, so the headline can never again
  undercount a horizon-day death.
**Pre-registered metric (binding):**
- Back-compat run on the r110 corpus (BEFORE the panel): R62 numbers
  reproduce exactly except the two new counts — arrivalSeeds=6/10,
  testSeeds=10, exitSeeds=6, stuckSeeds=0, openSeeds=6,
  noArrivalTested=4, noArrivalUntested=0; scholarDeaths=3 (was 2) with
  unresolved=1, scholarDeathSeeds=3/10 (was 2/10). Any other number moving
  is a REGRESSION — stop and adjudicate before running the panel.
- On the r111 panel: every peak===0 seed carries the TESTED or UNTESTED
  label (zero bare NO-ARRIVAL lines anywhere in the analysis); scholarDeaths
  equals the count of scholar deaths read from the per-seed lines.
- Proof test scripts/test-landing-r111-analyzer-fixes.js: synthetic corpora
  covering NO-ARRIVAL-TESTED, NO-ARRIVAL-UNTESTED, TAIL-MOVES, STUCK, a
  mantle-passing scholar death, a final-holder unresolved death, and a
  final-holder NO-GO death — run the REAL analyzer, assert the labels and
  the summary counts. All cases pass before the panel runs.
- A miss is NO-GO, never re-scored.

## Q2 (WATCH) — SCHOLAR-SOLO FATALITY: IS SOLO HUNTING THE RISK FACTOR?
**Basis:** r110's sharpest number: 3/10 scholars dead in the first month, all
solo in the wild (allies 0), each with the beast at 1–27 HP. The fights
analyzer already records allies at fight time, so the question is answerable
from this panel without new instrumentation.
**Pre-registered metric (binding):** from the fights analyzer, the solo-share
of ALL hunt fights vs the solo-share of FATAL fights. If fatal fights are
solo at a rate far above the base solo rate (fatals 3/3 solo while ≤50% of
all fights are solo), solo hunting is a named risk factor to dig into. If the
base rate is also ~solo, it is the wild being the wild, not a solo effect.
Adjudication only — no game change either way this run; a game-code defect
claim would need a mechanism, not just the share.

## Q3 (CARRIED) — ENGAGEMENT REGRESSION LINES (M-PR1 / M-PR2, standing)
- M-PR1 per-seed: never-offered ≤1 sitting on ≥8/10 seeds, PLUS transcript
  adjudication of every never-offered sitting. The pooled never-offered rate
  stays reported for the record.
- M-PR2 revised: of sittings where dlg:commit was PICKED, fraction resolving
  'promised' / (picked − away-guard refusals) ≥80% = line holds. The
  away-guard share is reported separately, and all 'stated' refusals are
  explained case by case (the R72 away-guard is by design).
- M-TG RETIRED (r110 closed the thread-gate question — withdrawn-want
  deflection, n=3 pooled). If a picked-but-stage-1 case ever appears with a
  non-'want' thread, that single case reopens it.

## Q4 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7)
r108: GOAROUND-HOLDS (3/3 kcal skips); r109: UNTESTED (0 cases); r110:
GOAROUND-HOLDS (3/3). Carried as a regression check.
**Pre-registered metric (binding):** M7-r111 kcal: arrived / kcal-skips ≥80% =
GOAROUND-HOLDS; <80% = GOAROUND-WEAK (name the failing seeds/days and the rung
that stopped). Rung fires reported as counts with seed/day.

## Q5 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r110: DOORSTEP-GO (280 checks, 3 triggered, ate 3). Carried as a regression
check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E scholar
starvation deaths; 0 triggered steps ending enterResult===false). Includes the
R105-DOORSTEP-DRINK-ENTRY fix.

## Q6 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now twenty-two runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r110 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party
  invites spoken/dry; two full transcripts read for sense (SENSE-TESTING LAW).
- **M-R70 (closed r107):** consistency check only — live-promise dawn opps
  with waiting=false should stay explained (has-run / kept / dead promiser),
  0 genuine defects expected.

## Watch items (not verdicts)
- **R73 NARROW-PATTERN:** r110 promised=8, askedOnly=40, outOfWindow=1, all 8
  NARROW, keptInsideNarrow=3. Design input, carried.
- **R66 HUNGRY horizon pantry:** r110 9/10 seeds end hungry (r109: 4/10,
  r108: 7/10, r107: 9/10). Starvation deaths 0 on r110. The landing pantry is
  a slow leak everywhere, a collapse on one seed in ten.
- **Mantle latency (owed item, r107 seed 1009):** a 2-day gap between scholar
  death and mantle pass. r110 REPRODUCED it (1038 Luigi d11 → Ava d13,
  latency 2). Watch whether any r111 mantle pass exceeds 1 day, and whether
  the successor's absence from Haven at death time explains it (hypothesis
  only, not established).
- **Kill-mean trend (telemetry watch):** per-seed monster-kill mean reversed
  on r110 (28.5 → 20.6) after the three-panel climb — seed mixture, not a
  trend. Reported, not chased.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a famine
  the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable before
  day 28 (r106 M-A2, re-confirmed r107/r108/r109/r110). Re-proving the staging
  adds nothing (DELIVER OVER MEASURE).
- **Context (not this leg's work):** Steve ordered one-villager-brain coherence
  this evening (2026-11-06) — all intelligence systems in one spot, one
  scorer — and the self-improvement-drive build he approved is already
  running. That is build-coordinator territory, not the landing leg; no
  action in this run.

## Seeds, pilot, shape
- Panel: fresh seeds 1043–1052, DAYS=28, OUTDIR landing-r111 (goal hidden_files
  evidence/2026-11-06/).
- PILOT FIRST: 3 seeds (1043–1045) before expanding. The pilot validates (a)
  the seed band (driver runs seeds 1043+), (b) the analyzer fixes report on
  pilot output (labels + counts present, no bare NO-ARRIVAL), (c) Q2 shows a
  live signal (hunt fights exist with allies recorded). If the pilot shows 0
  hunt fights, document and still run the panel only if the carried bindings
  need the panel — the pilot decides; do not burn a full run on a dead
  question.
- Shape: pilot validates the analyzer fixes on real output before the panel
  expands; the proof test (synthetic corpora) runs BEFORE the pilot.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
