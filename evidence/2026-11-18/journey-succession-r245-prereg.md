# Journey succession r245 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r245 play or fix. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r245: follows crisis r244 (2026-11-18). Base:
master 854e395c0 at run start. Lock: playtest-loop-2.lock run_id
2026-11-19T03:56:53Z (own, created at run start; no prior lock present;
main tree clean at second check after a transient sibling-landing dirty
state at run start, disk 50%).

## Standing state (why this run plays leg 7, and what it carries)

r233 succession (2026-11-18) passed every bar except F5 WILD EXERCISE,
which recorded FAIL as written (0 firings across the rolling 3-panel
window r231+r232+r233; r230's 2 firings had rolled out). Its metric
review filed revisions this run adopts:

- **F5 FIVE-PANEL WINDOW (ADOPTED)**: the rolling window widens from 3
  panels to 5. The window is the 5 most recent succession panels:
  r230+r231+r232+r233+r245 — there was no r234 or r235 succession panel
  (the Lane B counter skipped those numbers on other legs / stood-down
  occurrences), so r245 is the 5th panel in the window. The window
  carries 2 firings (both r230's). Bar: settled-favor branch fires >=1x
  across the window AND 0 F5-class dry hits. The targeted harness (r225
  proof test) re-run on this base is the binding proof the branch works.
- **REL-VET floor watch (carried)**: the 10-draw floor was met exactly
  on r233 (10 draws). Keep it; if this panel lands at 8–9 draws, the
  floor, not the gate, is the question.
- **REL-WIT (carried)**: stays INSUFFICIENT-DATA by the written bar
  unless a witnessed death occurs; the WITNESS-CENSUS diagnostic stays
  in the analyzer as a standing diagnostic.
- **C3d (carried)**: the empty-log live-line path is still unobserved
  in the wild after four panels. The bar stays.
- **Proof refresh rounds 11 + 12 remain owed (not this run's).**
- **Multi-name relationship mourning stays open (not built).**
- **KIN mourning stays unavailable (no kin signal between villagers).**
- **REL-VET revised denominator (r233, carried)**: the bar counts opener
  draws in both-veteran convos, not qualifying convos. PASS = >=1
  veteran-variant serving on >=10 opener draws in both-veteran convos
  AND 0 unheld servings; fewer than 10 draws = INSUFFICIENT-DATA on the
  positive arm (the negative arm still binds).
- **WITNESS diagnostic (r233, carried)**: per-seed corpse-witness census
  (`rec.corpseCensus`) + the static audit of every registerDeath call
  site in the r233 prereg (unchanged — no death-path code has changed
  since). If this panel also sees 0 witnessed deaths, the finding
  stands as a supply fact (filed, not fixed by inventing witnesses for
  deaths nobody saw).

## Questions (r245)

(1) REL-BOND (binding, carried): PASS = (a) >=1 bond-variant serving
    where relMap shows close (v>=20 or depth>=1), AND (b) 0 servings
    where NOT close.
(2) REL-VET (binding, REVISED denominator, floor watch): PASS = (a) >=1
    veteran-variant serving on >=10 opener draws in both-veteran
    convos, AND (b) 0 servings where either is not a veteran. Fewer
    than 10 opener draws in both-veteran convos = INSUFFICIENT-DATA
    on arm (a); the negative arm still binds.
(3) REL-WIT (binding, carried): PASS = (a) >=1 witnessed serving
    AND (b) 0 servings where not witnessed. If no witnessed death
    occurs, (a) is INSUFFICIENT-DATA — and the WITNESS-CENSUS
    diagnostic (Q13) answers WHY.
(4) MOURN-TEMPLATE (binding, carried): 0 same-speaker same-shape
    firings for different dead AND 0 different-speaker same-shape
    same-dead firings within 5 days. 19 shapes.
(5) MOURN-EXHAUST (binding, carried): 0 servings of the exhausted
    line in a mourning sitting.
(6) MANTLE-FINE (binding, carried, gap-subtraction): 0
    flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2,
    0 unexplained fineLatency==1, 0 day-skips.
(7) DRY CENSUS (binding, carried): 0 dry hits of any class.
(8) WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/F6/
    C3c/F2/C3d and the carried landed-fix surfaces.
(9) C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
(10) F5 WILD EXERCISE (binding, rolling 5-panel window
    r230+r231+r232+r233+r245): the settled-favor branch fires >=1x
    across the window (r230 fired 2x, r231 vacuous, r232 vacuous,
    r233 vacuous) AND 0 F5-class dry hits. Targeted harness (r225
    proof test) re-run on this base.
(11) CONTROLS (binding, smoke bar S_fixed from r230, as re-baselined
    in r233): smoke 33998 at-death snapshot matches r233's smoke run
    exactly — handoff d6 Heinrich → Grace, relPost bonds 33,
    relD14 50, selfId grace_obi + machinery (pick rank 1, funeral
    INCALL true, selfReq 0 on every seed). If the smoke snapshot
    moves, it is base drift since r233, recorded as such and the bar
    re-baselines by measurement, not adoption.
(12) Descriptive: CAP-NC bonded-by-deadline among eligible;
    denominator < 3 stays INSUFFICIENT-DATA. HABIT-COLLISION: 0
    same-seed same-habit servings. Per-kind relationship-variant
    serving counts; witness-populated corpse count; both-veteran convo
    count and opener-draw count.
(13) WITNESS-CENSUS (diagnostic, carried): per-seed corpse census —
    person corpses total, person corpses with witnessN>0, their
    causes, and whether any bearer corpse carried witnesses. A 0
    witnessed-corpse panel + the r233 static audit = the supply
    answer for REL-WIT; a witnessed corpse with no witness-variant
    serving on its mourning convos = a gate/engagement question for
    the next run.

## Panel

- Driver: scripts/journey-succession-r245-20261118.js (r233 driver,
  rename only — filenames r233 -> r245, seeds 34351-34354 ->
  34361-34364; no new instrument).
- Analyzer: scripts/analyze-journey-succession-r245-20261118.js
  (r233 analyzer, rename only).
- Panel runner: scripts/run-journey-succession-r245-panel.sh (r233
  runner, rename only).
- Proof tests: the r232 relationship-mourning proof test
  (scripts/test-journey-succession-r232-relationship-mourning-20261117.js)
  is the standing guard for the REL-MOURN fix; re-run on this base.
  The r225 F5 targeted harness (scripts/test-*-f5-*.js — the r225
  proof test named in the r233 run note) re-run on this base. No new
  src/js change is planned this run, so no new proof test.
- Seeds: FRESH BAND 34361–34364 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34361 alone to verify the driver runs
  clean on this base; then the remaining 3 seeds sequentially, then
  smoke. The panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Word-boundary grep for 34361/34362/34363/34364 over
  evidence/*/sim-*-prereg.md and evidence/*/journey-*-prereg.md
  (every dated prereg): 0 hits each. Same grep over the goal
  hidden_files *.md files: 0 hits each.
- A full-tree grep over evidence/ (killed after the binding scope was
  verified) showed incidental numeric hits for 34361 only, both
  inspected in context and neither a seed-band naming:
  evidence/2026-10-16/perseed-ledgerdiag/belongfeast-s218.json
  (`"pantryKcalAtPack":34361` — a kilocalorie value) and
  evidence/2026-10-24/awayration-cover-b-corpus/sweep-competent.json
  (a float substring `1588.9378343611957`). No hits for 34362–34364
  in the prereg scope.
- Comparison: 34351–34354 = r233 panel; 34341–34344 = r232; 34331–34334
  = r231; 34321–34324 = r230; 34311–34314 = r229; 34301–34304 = r224;
  34291–34294 = r218; 34281–34284 = r209; 34271–34274 = r202;
  34261–34264 = r197; 34251–34254 = r193; 34241–34244 = r187;
  34231–34234 = r183; 34221–34224 = r181; 34211–34218 = r177;
  34201–34208 = r169; 34011–34018 = r169; 33998 = standing smoke
  control.
- Band 34361–34364 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation.

## Bars (binding, §14)

- REL-BOND (binding, carried): PASS — >=1 bond-variant serving
  where close AND 0 servings where not close.
- REL-VET (binding, REVISED): PASS — >=1 both-veteran serving on
  >=10 opener draws in both-veteran convos AND 0 servings where
  either is not a veteran; fewer than 10 opener draws =
  INSUFFICIENT-DATA on arm (a).
- REL-WIT (binding, carried): PASS — >=1 witnessed serving AND 0
  servings where not witnessed; no witnessed death =
  INSUFFICIENT-DATA on arm (a).
- MOURN-TEMPLATE (binding, carried): PASS — 0 same-speaker
  same-shape firings for different dead AND 0 different-speaker
  same-shape same-dead firings within 5 days (19 shapes).
- MOURN-EXHAUST (binding, carried): PASS — 0 exhausted-line servings
  in a mourning sitting.
- MANTLE-FINE (binding, carried, gap-subtraction): PASS — 0
  flippedImmediate=false rows outside VILLAGE-OVER, 0
  fineLatency>=2 (gap-adjusted), 0 unexplained fineLatency==1,
  0 day-skips.
- DRY CENSUS (binding, carried): 0 dry hits of any class.
- WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/F6/
  C3c/F2/C3d and the carried landed-fix surfaces.
- C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
- F5 WILD EXERCISE (binding, rolling 5-panel window
  r230+r231+r232+r233+r245): settled-favor branch fires >=1x across
  the window AND 0 F5-class dry hits. Targeted harness (r225 proof
  test) green on this base.
- CONTROLS (binding, smoke bar S_fixed as re-baselined in r233):
  smoke 33998 at-death snapshot = d6 Grace (relPost 33, relD14 50,
  selfId grace_obi) + MANTLE-FINE clean + pick rank 1, funeral
  INCALL true, selfReq 0 on every seed.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA. bondedEver
  reported descriptively.
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.

## What would count as interesting

- A relationship variant served WITHOUT the relationship (a
  fabrication). FAIL LOUDLY.
- A bond variant never firing despite close bonds per seed.
- A witness variant firing with witnesses=[] (instrument bug).
- A witnessed corpse on the census whose mourning convos never drew
  a witness opener (engagement question, not a gate failure).
- Zero witnessed corpses on the census AND zero witnessed deaths
  (the supply answer for REL-WIT — finding, filed).
- A veteran serving on >=10 opener draws with 0 holdings (the gate
  fires but the pool never lands it — engagement question).
- A MOURN-TEMPLATE repeat through the 19 shapes.
- A DRY hit on ask:lately (emission-block cost, realized).
- A C3d-class erasure / F5-class dry hit / stale-favor resume /
  narration-quote opener (carried-fix regressions).
- Any MANTLE-FINE miss on the fresh band (regression).
- A live-want recap serving (positive evidence the C3d fix
  engages).
- Smoke snapshot move vs r233 (base drift since r233).
- CAP-NC denominator >= 3 for the first time in several runs.
- REL-VET opener draws landing at 8–9 (the floor, not the gate,
  becomes the question — metric review for the next run).

## Metric review (carried)

- r233's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in their run notes). This run runs telemetry-check
  against the succession baseline and reports LOUD lines; it does
  NOT roll the baseline forward until the mismatch is resolved.
- F5 WILD EXERCISE widened to a 5-panel window this run (r233
  proposal, adopted): r230+r231+r232+r233+r245. If the window
  passes on r230's 2 firings, the arm is re-judged on the wider
  window next run as the window rolls (r231+r232+r233+r245+next).
- REL-VET: the 10-draw floor is at the edge of the wild rate; keep
  it and watch whether it stays measurable.
- DRY CENSUS amendment stands (any dry hit fails).
- MANTLE-FINE stays the gap-subtraction revision (r230); no further
  revision proposed.
- C3d wild hold: the fix's live-want path never engaged on r230,
  r231, r232, or r233 (no recap while a live want was open). The bar
  stays.
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: nineteenth straight panel watch.
- Proof refresh rounds 11 + 12 remain owed (not this run's).
- KIN mourning: NOT in this run's scope — no signal exists.
- Multi-name relationship mourning (bond variant for losing two at
  once): open, not built.
