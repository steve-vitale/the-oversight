# Journey succession r258 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r258 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r258: follows crisis r257 (2026-11-20, landed
e103a64cc; rotation-b 6→7). Base: master `d352834ef` at run start.
Lock: playtest-loop-2.lock run_id `playtest2-20261120T1900Z-leg7` (own,
created at run start; no prior lock present; main tree clean, disk 49%).
Worktree: `~/workspace/worktrees/journey2-succession` (registered,
heartbeat loop `journey2-succession-hbloop-r258.sh` every 10 min).

## Standing state (why this run plays leg 7, and what it carries)

r254 succession (2026-11-20, landed via adoption 63f91fa2b) passed every
bar except REL-WIT, which stayed INSUFFICIENT-DATA in the wild — with
supply ZERO on its panel (50 person corpses, 0 witnessed), so the
multi-name witness variant it landed (convoTopics.js +21, commit
972645078 / adoption aea63f6b5) was proven only by the targeted proof
test (4/4 GREEN) and proven inert by a byte-identical matched panel.
Its metric review filed the next step this run takes, verbatim: "a
supply-first panel — screen a fresh band for witnessed combat deaths,
then run the matched control/arm pair on the seeds that carry supply."

This run IS that panel. The design below is the filed design, fixed
before any seed runs: the screen band, the supply rule, and the pair
design are all declared here; no seed is chosen after seeing a
serving. The only adaptive step is the supply rule itself, which is
the filed design, not a mid-run re-score.

## The question

Does the multi-name witness variant serve in the wild when witnessed
person deaths actually exist? The variant is in the game (base
d352834ef carries it); the wild serving is still unmeasured after
r254. Three rare things must coincide — a witnessed person death, a
multi-name fresh window, and a driven sitting in that window — and
r254's panel had zero of the first.

## Panel (two phases, MEASUREMENT.md §15)

### Phase 1 — SCREEN (arm = base, fix present)

- Driver: `scripts/journey-succession-r258-20261120.js` (r254 driver +
  PREFIX env + one instrument addition, see below; NO game-logic
  change). Analyzer: `scripts/analyze-journey-succession-r258-
  20261120.js` (r254 analyzer, renames + one descriptive counter, see
  below). Runner: `scripts/run-journey-succession-r258-panel.sh
  <screen|ctl> [seeds...]`.
- Seeds: FRESH BAND 34401–34408 (EARLY_KILL_DAY=40, POST_DAYS=70) +
  smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing control).
  Pilot first: seed 34401 alone; expand to the rest only if the pilot
  exits 0 with a valid stdout.json.
- PREFIX `r258scr`. The screen leg IS the arm leg for the supply
  seeds: identical driver, identical seeds, identical code (base).
- Supply rule (fixed in advance): a seed carries supply iff its
  WITNESS-CENSUS shows >=1 person corpse with witnessN>0. Supply
  seeds are named by the rule, not by hand.

### Phase 2 — MATCHED PAIR on supply seeds only

- If >=1 supply seed: CONTROL leg (PREFIX `r258ctl`) runs the SAME
  seeds with the SAME driver, the ONLY difference being the worktree
  with the r254 fix reverted (`src/js/convoTopics.js` multi-name
  witness lines removed; the revert is a temporary worktree
  modification, restored immediately after the control runs, verified
  by `git diff` against the fix commit before any commit). The control
  leg also runs smoke 33998 (fix-inert check: the two smoke snapshots
  must match exactly).
- ARM leg for the pair = the Phase 1 screen runs on the supply seeds
  (same files, re-analyzed with the pair seed list — no re-run needed
  unless a game fix lands mid-run, see below).
- If 0 supply seeds: NO pair. Verdict is INSUFFICIENT-DATA
  (supply-zero) again and the screen itself is the finding; the run
  reports the screen band's supply rate and stops the pair.
- If a game defect is found during screening and fixed in the worktree
  BEFORE the pair runs, the arm leg for the supply seeds is RE-RUN
  with the fix (screen runs on supply seeds are re-done, same seeds,
  same driver); the pre-fix screen runs on those seeds are superseded
  and marked as such. Non-supply screen seeds are not re-run (they
  are not part of the pair). A fix found AFTER the pair runs is
  carried, not folded into the pair.

## Instrument additions (this run, both legs identical)

- Driver `relSnapFor` gains `freshPersonN`: count of person corpses
  that died within 0–3 days of the sitting day, the same 3-day fresh
  window the game's mourning pool uses (same `corpses(Game)` +
  `dayOf(Game)` reads as the WIT-SIT scan). Recorded on every driven
  mourning convo's rel snapshot. This answers r254's metric-review
  ask: "The next supply-first panel should record multi-name sitting
  counts, not just witness servings."
- Analyzer gains a descriptive MULTI-NAME SITTING count: driven
  mourning sittings (convoReads with rel) with freshPersonN>=2, and
  witness-variant servings among them. Descriptive, not a bar.
- No other driver/analyzer logic change. The analyzer reads files by
  PREFIX env; the pair's arm-leg analysis runs with PREFIX=r258scr
  over the supply-seed list, output redirected to the r258arm
  analyzer filename.

## Seed-band freshness (local_seed_band_freshness)

- Band 34401–34408: word-boundary grep for each seed over
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`:
  0 hits. Full `.md` grep over evidence/: three apparent hits, all
  false positives — `evidence/2026-11-09/journey-deepening-r124-
  prereg.md` names 44001–44008 (not 34401); a telemetry sum
  "1234408" in journey-establishment-r118.md; a hash fragment in
  sim-transplant15e-p23-prereg.md. No forbidden/contaminated list
  names the band (the lists found are Oct 26–27 sim preregs naming
  other bands).
- 33998 is the standing smoke control (r233 baseline). Supply seeds
  are a subset of this fresh band selected by the pre-registered
  supply rule — not a new reservation.
- 34362 is NOT re-run this run: r254 re-ran it and recorded the
  trajectory drift (BOWCRAFT turn-on the unproven suspect); a
  re-run here would be a third look at the same seed, not supply
  screening. The BOWCRAFT bisect stays open, not this run's.

## Questions (r258)

(1) REL-WIT (binding, carried bar): PASS = >=1 judged
    witness-variant serving with rel.witnessed true AND 0 servings
    where not witnessed, on the ARM leg over the supply seeds. A
    witness serving that names the WRONG dead (not the lately-named
    dead) is a fabrication: FAIL LOUDLY. If the arm leg serves 0
    with supply present, the verdict is INSUFFICIENT-DATA (supply
    present, serving unmeasured) — the question narrows to the
    sitting/window rareness, recorded as such, not re-scored.
(2) REL-BOND (binding, carried): PASS = >=1 bond-variant serving
    where close AND 0 servings where not close (both legs).
(3) REL-VET (binding, REVISED denominator, 10-draw floor): PASS =
    >=1 veteran-variant serving on >=10 opener draws in both-veteran
    convos, AND 0 servings where either is not a veteran.
(4) MOURN-TEMPLATE (binding, carried): 0 same-speaker same-shape
    firings for different dead AND 0 different-speaker same-shape
    same-dead firings within 5 days.
(5) MOURN-EXHAUST (binding, carried): 0 servings of the exhausted
    line in a mourning sitting.
(6) MANTLE-FINE (binding, carried, gap-subtraction): 0
    flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2,
    0 unexplained fineLatency==1, 0 day-skips.
(7) DRY CENSUS (binding, carried): 0 dry hits of any class.
(8) WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/
    F6/C3c/F2/C3d and the carried landed-fix surfaces.
(9) C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
(10) F5 WILD EXERCISE (DESCRIPTIVE, reclassified r248): report
    settled-favor firings per leg + the rolling 5-panel window
    (r233+r245+r248+r254+r258); no PASS/FAIL. Binding proof is the
    r225 targeted harness (22/22), re-run on this base.
(11) CONTROLS (binding, smoke bar S_fixed from r230, as re-baselined
    in r233): smoke 33998 at-death snapshot matches r233's smoke run
    exactly — handoff d6 Heinrich → Grace, relPost bonds 33,
    relD14 50, selfId grace_obi + machinery (pick rank 1, funeral
    INCALL true, selfReq 0 on every seed). The screen (arm) smoke
    and the control smoke must match exactly (the fix is inert on
    the smoke seed). If the smoke snapshot moves, it is base drift
    since r233, recorded as such and the bar re-baselines by
    measurement, not adoption.
(12) Descriptive: CAP-NC bonded-by-deadline among eligible;
    denominator < 3 stays INSUFFICIENT-DATA. HABIT-COLLISION: 0
    same-seed same-habit servings. Per-kind relationship-variant
    serving counts; witness-populated corpse count; both-veteran convo
    count and opener-draw count. WIT-SIT staging counts per leg.
    MULTI-NAME SITTING count (new instrument): driven mourning
    sittings with freshPersonN>=2, and witness servings among them.
(13) WITNESS-CENSUS (diagnostic, carried): per-seed corpse census —
    person corpses total, person corpses with witnessN>0, their
    causes, and whether any bearer corpse carried witnesses. The
    screen's per-seed census IS the supply finding.

## Proof tests (before/after)

- REGRESSION (no new game change this run): the r254 multiwit proof
  test (`scripts/test-journey-succession-r254-multiwit-20261120.js`)
  re-run on this base — expect 4/4 GREEN (the fix is unchanged, the
  base moved). The r232 relationship-mourning proof test re-run on
  this base (single-name behavior unchanged). The r225 F5 targeted
  harness re-run on this base (binding proof for the reclassified
  F5 arm; expect 22/22).
- If the panel finds a defect and this run fixes it: a NEW proof test
  for the fix, RED before / GREEN after, same pattern as r254's
  multiwit test. The fix lands only with its proof test.

## Bars (binding, §14)

- REL-WIT (binding, carried): PASS — >=1 judged witness serving
  with rel.witnessed true AND 0 servings where not witnessed, on the
  arm leg over supply seeds; a serving naming the wrong dead is a
  FAIL, not a re-score. 0 servings with supply present =
  INSUFFICIENT-DATA (not a fail); 0 supply seeds =
  INSUFFICIENT-DATA (supply-zero).
- REL-BOND, REL-VET, MOURN-TEMPLATE, MOURN-EXHAUST, MANTLE-FINE,
  DRY CENSUS, WILD CHECK, C3d WILD HOLD, CONTROLS: as in r254
  (carried, unchanged).
- F5 WILD EXERCISE (DESCRIPTIVE): firings reported per leg +
  rolling 5-panel window; r225 harness 22/22 is the binding proof.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA.
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Metric doubts go under "metric review" for the NEXT run.

## What would count as interesting

- A witness-variant serving on the ARM leg in a multi-name sitting
  on a supply seed, naming the latest dead (the fix working as
  designed in the wild — the first ever multi-name witness serving).
- A witness serving on the ARM leg where rel.witnessed is false, or
  naming a dead person other than the lately-named dead (fabrication
  — FAIL LOUDLY, fix reverted, not tuned around).
- Supply present on >=1 screen seed but 0 witness servings on the
  arm leg (the question narrows to sitting/window rareness — the
  multi-name sitting count then tells whether sittings even landed
  in multi-name windows).
- 0 supply seeds on a fresh 8-seed band (supply rate even lower
  than r254's ~2 per 11 seed-runs — the witness question may need a
  different instrument, e.g. combat-heavy screening).
- The CONTROL leg diverging from the ARM leg on any carried bar
  (the fix must be inert except for the witness variant; a move is a
  regression, not a side effect).
- A staged wit-sit firing single-fresh on either leg (the first
  single-fresh staged sitting — the r248 floor would finally bind).
- A live-want recap serving (positive evidence the C3d fix engages).
- CAP-NC denominator >= 3 for the first time in several runs.
- The screen's smoke snapshot moving from r233's (base drift signal).

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-20/journey-succession-r258scr-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
(and the same for the r258ctl tele files if a pair runs). Prereg rule
(r89/r91/r248 precedent): a forced-chain panel must NOT roll the
unforced baseline forward — LOUD lines from forced deaths are regime,
not drift, unless investigation shows a real bug. The means-vs-sum
mismatch (tool sums the current files; the baseline stores means) is
unresolved since r229: per-file means are the comparison, and the
baseline is NOT rolled on LOUD lines without a same-run
investigation verdict.

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r254: measurement-proof staleness pair + phone-frame stale
receipt; load-artifact timeouts on deed-attainment/capable-bot/trust-
observer-neutrality/occupation-panels/measurement-cache-flags, all
solo-PASS on r254) are the baseline; any NEW failure is a
stop-and-explain item. This run changes no src/js unless the panel
finds a defect; a failure in a mourning/conversation test is
attributable until proven otherwise.

## Metric review (carried)

- REL-WIT stays INSUFFICIENT-DATA in the wild until a supply-seed
  serving is observed; this run is the filed supply-first attempt.
- Candidate (a) bearer-as-mourner: REJECTED r254 (self-talk,
  unreachable in real play) — filed, do not re-propose.
- Candidate (b) same-day staging: NOT the binding constraint r254
  (same-combat witness death defeats timing) — filed, do not
  re-propose as the fix.
- Multi-name BOND/VET mourning: still open, not built. This run
  builds no game change unless the panel finds a defect.
- F5 WILD EXERCISE stays DESCRIPTIVE. The r225 harness (22/22) is
  the binding proof. No F5 firing counter exists in the analyzer —
  the count stays a convention, not an instrumented metric.
- C3d: the live-want recap path did not engage on r230–r254 (seven
  straight panels). The bar stays; the question is now whether the
  path is reachable at all in the wild, not whether it is broken.
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: twenty-second straight panel watch.
- Proof refresh rounds 11 + 12 remain owed (not this run's; owned by
  the measurement-proof track, carried since r192/r194/r195).
- Scout-role ping-pong: carried as an owed driver note (checkpoint
  loop untouched this run to protect the smoke control).
- Driver re-ask pestering: carried, REFINED r254 — the re-ask reads
  fine with a live want open, flat without one.
- m3v2b: 5/6 true on r254 (34362 false, echoV2b=1 — the same seed
  that missed on r248). Carried, not a bar.
- BOWCRAFT turn-on as the suspect for the 34362 trajectory drift
  (r254): UNPROVEN, no bisect this run. Stays open.
- Multi-name openers in driven sittings were 0 on r254 (all 48
  mourning servings single-name). This run's new multi-name sitting
  counter measures whether driven sittings land in multi-name
  windows at all.
