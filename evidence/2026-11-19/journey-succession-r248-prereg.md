# Journey succession r248 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r248 play or fix. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r248: follows crisis r247 (2026-11-19, adoption
merged 9ad111089, rotation-b 6→7). Base: master e1f002065 at run start.
Lock: playtest-loop-2.lock run_id 2026-11-19T12:55:42Z (own, created at
run start; no prior lock present; main tree clean, disk 47%).
Worktree: ~/workspace/worktrees/journey2-7 (registered, heartbeat loop
journey2-succession-hbloop-r248.sh).

## Standing state (why this run plays leg 7, and what it carries)

r245 succession (2026-11-18) passed every bar except REL-WIT, which stayed
INSUFFICIENT-DATA with supply now PRESENT: the first witnessed person
corpses on any succession panel — Vincent (combat, witnesses Javier +
Stan) and Javier (combat, witness Stan), both seed 34362. The open
question moved from supply to engagement: no driven mourning convo ever
touched a witnessed non-bearer death, because the driver only sits people
down about the bearer. Its metric review filed the next step this run
takes: stage one driven mourning sitting with a witness of a witnessed
death. This run builds that staging as a general driver instrument
(WIT-SIT), not a one-off script.

r245's other carried items:
- **F5 WILD EXERCISE → DESCRIPTIVE (ADOPTED)**: the rolling 5-panel
  window (r231+r232+r233+r245+r248) carries 0 firings — r230's 2 rolled
  out. Under the old binding bar this panel would record FAIL again for
  a wild rate of ~2 firings per 5 panels, which is a coin flip, not a
  verdict. Reclassified DESCRIPTIVE this run: the arm reports firings
  per panel + the rolling window, no PASS/FAIL. The BINDING proof the
  settled-favor branch works is the r225 targeted harness (22/22),
  re-run on this base.
- **REL-VET floor watch (carried)**: the 10-draw floor held with margin
  on r245 (13 draws). Keep it; if this panel lands at 8–9 draws, the
  floor, not the gate, is the question.
- **C3d (carried)**: the empty-log live-line path is still unobserved
  in the wild after five panels. The bar stays.
- **Proof refresh rounds 11 + 12 remain owed (not this run's).**
- **Multi-name relationship mourning stays open (not built).**
- **KIN mourning stays unavailable (no kin signal between villagers).**
- **Scout-role ping-pong (r245 metric review item 8): NOT fixed this
  run.** Varying the role pick across checkpoints would touch the
  checkpoint convo path the smoke control (S_fixed) measures; the
  cosmetic gain is not worth risking the control match. Carried as an
  owed driver note, not a fix.
- **REL-VET revised denominator (r233, carried)**: the bar counts
  opener draws in both-veteran convos, not qualifying convos.

## The WIT-SIT instrument (new this run)

Added to the r248 driver (r245 driver + WIT-SIT only, no other logic
change). In the post-death loop, after each 1-day runDays call, the
driver scans corpses() for person corpses that died since the last
iteration (dayDied within 0–1 days of the current day) with populated
witnesses, excluding lineage bearer deaths (the mantle-memory branch
carries no witnesses by construction; bearer deaths already get
checkpoint sittings). The FIRST such death per iteration, up to 2
sittings per seed, gets a driven mourning sitting the same day with
the first living witness (not the bearer, not dead):

- Sitting tag `witness-mourning d+<n>`, 12 turns, transcript
  `journey-succession-r248-transcript-<seed>-dplus<n>-WIT-<speaker>.txt`,
  convoRead carries `witSit: true` + the rel snapshot, and
  `rec.witSits` records {day, dplus, deadFirst, deadId, cause,
  witnesses, freshPersonN, speakerFirst, speakerId, latelyDead,
  latelyWitnessed}.
- `freshPersonN` = person corpses with dayDied within 3 days of the
  sitting day. This matters because the engine's mourning pool adds
  the relationship variants ONLY in the single-name branch
  (convoTopics.js t2gen_lately, mourning case): with >= 2 fresh
  corpses the multi-name branch serves and NO relationship variant
  can draw. A multi-name sitting is engagement data, not a REL-WIT
  draw — it does not count toward the floor below.
- If no witness is alive, the death is recorded as
  `{fired: false, reason: 'no-living-witness'}` and not retried.
- Accepted edge (documented, not fixed): a wit sitting can land on
  the same day as a CONVO_DAYS checkpoint that also drives the same
  speaker (top-2 by trust, no talked-set in the checkpoint loop).
  Both convos read the same lately event and rel snapshot, so the
  judging is unaffected; the transcripts just show two sittings that
  day. No checkpoint-loop change — the smoke control is not worth
  the risk.
- The scan itself is pure reads and consumes no RNG. The first
  sitting fires only AFTER a witnessed death is detected, so the
  34362 re-run reproduces r245's trajectory exactly up to Vincent's
  death (same seed, same pre-death code path). The smoke seed
  (33998: 1 person corpse, witnessed 0 on r245) never triggers the
  instrument, so the S_fixed control is unaffected.

## Questions (r248)

(1) REL-WIT (binding, STAGED — revised floor): PASS = (a) >=1
    witness-variant serving on a witness sitting whose lately event
    named the witnessed dead (rel.witnessed true), AND (b) 0 servings
    where not witnessed. The positive arm binds only on SINGLE-FRESH
    sittings (freshPersonN == 1 — the only sittings where the witness
    variant is in the pool): fewer than 3 such sittings panel-wide =
    INSUFFICIENT-DATA on arm (a); >=3 with 0 servings = FAIL. The
    negative arm still binds on every judged serving. (Rationale for
    the floor: one sitting is one opener draw from a 7-line pool with
    2 witness lines — 0/1 or 0/2 servings is chance, not a verdict.
    The old r245 bar as written would FAIL on a single unserved
    sitting; that over-claims and is corrected here, before play.)
(2) REL-BOND (binding, carried): PASS = (a) >=1 bond-variant serving
    where relMap shows close (v>=20 or depth>=1), AND (b) 0 servings
    where NOT close.
(3) REL-VET (binding, REVISED denominator, floor watch): PASS = (a)
    >=1 veteran-variant serving on >=10 opener draws in both-veteran
    convos, AND (b) 0 servings where either is not a veteran. Fewer
    than 10 opener draws in both-veteran convos = INSUFFICIENT-DATA
    on arm (a); the negative arm still binds.
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
(10) F5 WILD EXERCISE (DESCRIPTIVE, reclassified this run): report
    settled-favor firings this panel + the rolling 5-panel window
    (r231+r232+r233+r245+r248); no PASS/FAIL. Binding proof is the
    r225 targeted harness re-run on this base (expect 22/22).
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
    count and opener-draw count. WIT-SIT staging counts: sittings
    fired, single-fresh vs multi-fresh, no-living-witness cases,
    lately-named vs staged-dead agreement.
(13) WITNESS-CENSUS (diagnostic, carried): per-seed corpse census —
    person corpses total, person corpses with witnessN>0, their
    causes, and whether any bearer corpse carried witnesses.

## Panel

- Driver: scripts/journey-succession-r248-20261119.js (r245 driver +
  WIT-SIT instrument only; filenames r245 -> r248, EVID 2026-11-18
  -> 2026-11-19; no other logic change).
- Analyzer: scripts/analyze-journey-succession-r248-20261119.js
  (r245 analyzer + WIT- transcript prefix in the scan regex +
  WIT-SIT section; REL-WIT verdict logic unchanged — it already
  judges witness servings against rel snapshots; the floor for the
  positive arm is applied from rec.witSits single-fresh counts).
- Panel runner: scripts/run-journey-succession-r248-panel.sh (r245
  runner, rename + seeds).
- Proof tests: the r232 relationship-mourning proof test
  (scripts/test-journey-succession-r232-relationship-mourning-20261117.js)
  re-run on this base. The r225 F5 targeted harness (the r225 proof
  test named in the r233 run note) re-run on this base — binding
  proof for the reclassified F5 arm. No new src/js change is planned
  this run, so no new proof test.
- Seeds: FRESH BAND 34371–34374 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + DEDICATED 34362 RE-RUN (EARLY_KILL_DAY=40, POST_DAYS=70 — the
  r245 seed with Vincent + Javier witnessed combat deaths; a
  deliberate re-run, not a fresh reservation) + smoke 33998
  (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing control). Pilot
  first: seed 34371 alone to verify the driver runs clean on this
  base; then 34362, then 34372–34374 sequentially, then smoke. The
  panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Word-boundary grep for 34371/34372/34373/34374 over
  evidence/*/journey-*-prereg.md and evidence/*/sim-*-prereg.md:
  0 hits each.
- Comparison: 34361–34364 = r245 panel; 34351–34354 = r233;
  34341–34344 = r232; 34331–34334 = r231; 34321–34324 = r230;
  34311–34314 = r229; 34301–34304 = r224; 34291–34294 = r218;
  34281–34284 = r209; 34271–34274 = r202; 34261–34264 = r197;
  34251–34254 = r193; 34241–34244 = r187; 34231–34234 = r183;
  34221–34224 = r181; 34211–34218 = r177; 34201–34208 = r169;
  34011–34018 = r169; 33998 = standing smoke control.
- Band 34371–34374 is FRESH. Seed 34362 is a deliberate re-run of
  the r245 panel seed, named in the r245 metric review as the staged-
  sitting candidate; its reuse is the point, not a freshness breach.

## Bars (binding, §14)

- REL-WIT (binding, STAGED, floor 3 single-fresh sittings): PASS —
  >=1 witness-variant serving on a single-fresh wit sitting with
  rel.witnessed true AND 0 servings where not witnessed; fewer than
  3 single-fresh sittings = INSUFFICIENT-DATA on arm (a).
- REL-BOND (binding, carried): PASS — >=1 bond-variant serving
  where close AND 0 servings where not close.
- REL-VET (binding, REVISED): PASS — >=1 both-veteran serving on
  >=10 opener draws in both-veteran convos AND 0 servings where
  either is not a veteran; fewer than 10 opener draws =
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
- F5 WILD EXERCISE (DESCRIPTIVE this run): firings reported per
  panel + rolling 5-panel window; r225 harness 22/22 is the binding
  proof.
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

- A witness-variant serving on a staged sitting (REL-WIT measurable
  at last — the first ever, if it fires).
- A staged sitting whose lately event names someone OTHER than the
  staged dead (the lately slot picks the most recent fresh corpse —
  engagement data: the sitting mourned the wrong death).
- A staged sitting with rel.witnessed true and 0 witness servings
  across >=3 such sittings (the pool has the lines but the draw
  never lands them — engagement question, FAIL as pre-registered).
- A staged sitting landing multi-name (freshPersonN >= 2): the
  witness variant cannot serve by construction — a code fact the
  r245 framing missed; the arm's draws are single-fresh only.
- A wit sitting firing on a fresh-band seed (the instrument is
  general, not 34362-specific).
- The 34362 re-run NOT reproducing Vincent/Javier witnessed deaths
  (trajectory drift — the instrument's pre-death path is untouched,
  so this would be a base-drift signal, recorded as such).
- A relationship variant served WITHOUT the relationship (a
  fabrication). FAIL LOUDLY.
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

- r245's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in their run notes). This run runs telemetry-check
  against the succession baseline and reports LOUD lines; it does
  NOT roll the baseline forward until the mismatch is resolved.
- F5 WILD EXERCISE reclassified DESCRIPTIVE this run (r245 proposal,
  adopted): the rolling 5-panel window is r231+r232+r233+r245+r248
  and carries 0 firings. The r225 harness (22/22) is the binding
  proof.
- REL-WIT: floor 3 single-fresh sittings adopted this run (see Q1
  rationale). Multi-name sittings are not draws.
- REL-VET: the 10-draw floor is at the edge of the wild rate; keep
  it and watch whether it stays measurable.
- DRY CENSUS amendment stands (any dry hit fails).
- MANTLE-FINE stays the gap-subtraction revision (r230); no further
  revision proposed.
- C3d wild hold: the fix's live-want path never engaged on r230,
  r231, r232, r233, or r245 (no recap while a live want was open).
  The bar stays.
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: twentieth straight panel watch.
- Proof refresh rounds 11 + 12 remain owed (not this run's).
- Scout-role ping-pong: carried as an owed driver note (checkpoint
  loop untouched this run to protect the smoke control).
- KIN mourning: NOT in this run's scope — no signal exists.
- Multi-name relationship mourning (bond variant for losing two at
  once): open, not built.
