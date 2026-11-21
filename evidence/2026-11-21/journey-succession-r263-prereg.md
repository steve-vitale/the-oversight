# Journey succession r263 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r263 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r263: follows succession r262 (2026-11-21,
landed a3fe07b25; rotation-b 7→4 was its adoption closeout's job —
the file still reads 7 because the crisis r262 leg-6 closeout wrote 7
after it; this run plays the leg the file says, 7, and writes 4).
Base: master `320165c5a` at registration. Lock: playtest-loop-2.lock
run_id `playtest-loop-2-20261121T1400Z` (own, created at run start; no
prior lock present; main tree clean, disk 42%). Worktree:
`~/workspace/worktrees/journey2-succession` (registered; first attempt
failed on the write flap — `git worktree add` could not write the new
branch ref lock — flap cleared within minutes, retry registered clean;
registration also queued ~3 min behind Lane A's journey-landing
registration on REGISTRY.lock; heartbeat loop
`journey2-succession-hbloop-r263.sh` every 10 min, setsid).

## Standing state (why this run plays leg 7, and what it carries)

r262 succession (2026-11-21, landed a3fe07b25) STAGED the first
single-fresh witness sitting ever — Isabella died in combat day 81–82
on 34403, witnessed by Cesar + Grace; the post-death scan staged
Cesar the same day (freshPersonN=1, latelyWitnessed=true, lately
named the staged dead). The pick drew the VETERAN variant, not the
witness one (Cesar: "Isabella killed the things that come at night.
I did too. That's a small club, and it's smaller now."). REL-WIT
stayed INSUFFICIENT-DATA: 1 single-fresh draw < the 3-draw floor.
Its metric review filed the next step verbatim: "stage MORE sittings
per seed (raise the cap, or stage the same witnessed death across two
sittings on consecutive fresh days) rather than screen more seeds.
The variant is proven by harness (r254) and the pool is proven
reachable (this sitting); only the pick is unmeasured." This run IS
that step: WIT-SIT v2 stages a second sitting for the same witnessed
death the next day, with a different living witness, and raises the
per-seed cap 2→4.

Carried from r262: the M12 escalator-cap fix (landed; panel-confirmed
on 45787) and the M4 strip (landed) — no new game change is planned
this run. No canon doc covers succession/mantle (CANON.md grep empty;
r54/r91 preregs, unchanged) — none invented here. Gating freeze
(2026-10-27) stands; no gate, deed-bar, standing, wave, or
table-price change is in scope.

## The WIT-SIT v2 instrument (new this run)

Driver `scripts/journey-succession-r263-20261121.js` = r262 driver +
ONE instrument change (filenames r262 → r263; no other logic change):

- Per-seed cap 2 → 4 sittings (shared across pre/post phases, as
  before).
- A witnessed death may be staged TWICE: the first sitting on the
  detection day (as r262), the second the next day while the death is
  still inside the 0–1 day candidate window, with a DIFFERENT living
  non-bearer witness (the first sitting's speaker is excluded for
  that death). The 0–1 day window enforces "consecutive fresh days"
  by construction — a third sitting is impossible (dayDied+2 is
  outside the window).
- State: `witStaged` Set → `witSitByDead` Map (deadId → {count,
  speakers}). A death is a candidate while count < 2 and an unused
  living non-bearer witness exists.
- Records: fired sittings carry `sitSeq: 1|2`. A `no-living-witness`
  record is pushed only on the FIRST attempt (count 0, r262 behavior);
  a second-attempt miss (no unused living witness) is driver-logged
  only, not recorded — the analyzer's WIT-SIT descriptive counts
  `!fired` records under the no-living-witness label, and a second
  miss is not one.
- Everything else unchanged: same 0–1 day freshness, same speaker
  rule (living, not the bearer), same transcript + rel snapshot
  recording, same pre-death scan (r262), same smoke control.

Analyzer `scripts/analyze-journey-succession-r263-20261121.js` =
r262 analyzer + two changes:

1. MOURN-TEMPLATE village-window exemption (PREREGISTERED — see
   Bars below): the two sittings of one double-staged death are ONE
   instrument event. A same-shape serving across that pair is exempt
   from the village-window clause and printed explicitly as
   `MOURN-TEMPLATE-EXEMPT-DOUBLE-STAGE`. All other pairs still bind.
2. WIT-SIT descriptive prints the double-stage pairs (deaths staged
   twice, with sitSeq) alongside the existing counts.

## Bars (binding, §14)

- STAGE (binding, carried): ≥1 staged wit-sit fires on the panel
  with a living witness speaker, inside the fresh window.
- REL-WIT (binding, carried): PASS = ≥1 judged witness-variant
  serving with rel.witnessed true AND 0 servings where not witnessed,
  on staged sittings, naming the latest dead. Fewer than 3
  single-fresh draws (fired && freshPersonN==1 && latelyWitnessed)
  = INSUFFICIENT-DATA on the positive arm (the question stays on the
  pick). A serving naming the WRONG dead = fabrication: FAIL LOUDLY.
- REL-BOND (binding, carried): PASS = ≥1 bond-variant serving where
  close AND 0 servings where not close.
- REL-VET (binding, carried): PASS = ≥1 both-veteran serving on
  ≥10 opener draws in both-veteran convos AND 0 servings where either
  is not a veteran; fewer than 10 opener draws = INSUFFICIENT-DATA
  on arm (a).
- MOURN-TEMPLATE (binding, carried, AMENDED this run): 0
  same-speaker same-shape firings for different dead AND 0
  different-speaker same-shape same-dead firings within 5 days,
  EXCEPT pairs that are the two sittings of one double-staged death
  (same deadId, consecutive days, different speakers — the r263
  instrument's own pair). Rationale, stated before play: two
  witnesses grieving the same dead person with the same words on
  consecutive days is shared grief, not a template defect; the clause
  was written for independent wild sittings, and the double-stage
  pair is one instrument event by construction. The exemption is
  printed, counted, and auditable in the run note; it touches ONLY
  that pair — a collision between a double-stage sitting and any
  OTHER sitting still fails, as does any same-speaker repeat for a
  different dead.
- MOURN-EXHAUST (binding, carried): 0 servings of the exhausted
  line in a mourning sitting.
- MANTLE-FINE (binding, carried, gap-subtraction): 0
  flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2,
  0 unexplained fineLatency==1, 0 day-skips.
- DRY CENSUS (binding, carried): 0 dry hits of any class.
- WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/F6/
  C3c/F2/C3d and the carried landed-fix surfaces.
- C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
- F5 WILD EXERCISE (DESCRIPTIVE, r248 reclassification): firings
  reported per panel + the rolling 5-panel window
  (r232+r233+r245+r248+r254 — r262's window, advanced one panel);
  binding proof is the r225 harness (22/22), re-run on this base.
- CONTROLS (binding, smoke bar S_fixed from r230, as re-baselined
  in r233): smoke 33998 at-death snapshot matches r233's smoke run
  exactly — handoff d6 Heinrich → Grace, relPost bonds 33,
  relD14 50, selfId grace_obi + machinery (pick rank 1, funeral
  INCALL true, selfReq 0 on every seed). If the smoke snapshot
  moves, it is base drift since r233, recorded as such and the bar
  re-baselines by measurement, not adoption.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA.

## Panel

- Driver: scripts/journey-succession-r263-20261121.js (r262 driver +
  WIT-SIT v2 only; filenames r262 -> r263, EVID 2026-11-21).
- Analyzer: scripts/analyze-journey-succession-r263-20261121.js
  (r262 analyzer + MOURN-TEMPLATE double-stage exemption + WIT-SIT
  double-stage descriptive; no other logic change).
- Panel runner: scripts/run-journey-succession-r263-panel.sh (r262
  runner, renames + seeds).
- Proof tests: no new src/js change is planned this run, so no new
  proof test. The r262 M12 escalator-cap proof, r254 multiwit proof,
  r232 relationship-mourning proof, r225 F5 harness (22/22), and r258
  selfwit proof re-run on this base (WILD CHECK). The pilot seed is
  the WIT-SIT v2 instrument test: its stdout.json must show
  sitSeq 1/2 records behaving as designed before the panel expands.
- Seeds: FRESH BAND 34411–34416 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34411 alone to verify the driver runs
  clean on this base and the v2 instrument behaves; then
  34412–34416 sequentially, then smoke. The panel runner is launched
  with nohup so it survives the coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Word-boundary grep for 34411/34412/34413/34414/34415/34416 over
  evidence/*/journey-*-prereg.md and evidence/*/sim-*-prereg.md:
  0 hits each.
- Comparison: 34403 = r258/r262 known-supply seed (NOT re-run this
  run — replay divergence proven r262: the 34403 replay is a fresh
  trajectory, not a controlled re-run); 34362/34371–34374 = r248
  panel; 34361–34364 = r245; 34351–34354 = r233; 34341–34344 = r232;
  34331–34334 = r231; 34321–34324 = r230; 34311–34314 = r229;
  34301–34304 = r224; 34291–34294 = r218; 34281–34284 = r209;
  34271–34274 = r202; 34261–34264 = r197; 34251–34254 = r193;
  34241–34244 = r187; 34231–34234 = r183; 34221–34224 = r181;
  34211–34218 = r177; 34201–34208 = r169; 34011–34018 = r169;
  33998 = standing smoke control.
- Band 34411–34416 is FRESH.

## What would count as interesting

- A witness-variant serving on a staged sitting (REL-WIT moves from
  INSUFFICIENT-DATA to PASS — the first ever wild witness serving).
- A witness-variant serving on a SECOND sitting (sitSeq 2) — the
  double-stage instrument paying for itself.
- 3+ single-fresh draws with 0 witness servings (the pick, not the
  sitting, is the wall — FAIL as pre-registered if the floor is met
  and the variant never serves; the next step becomes a pick-side
  question).
- A second sitting whose lately event names someone OTHER than the
  staged dead (a newer fresh corpse intervened overnight —
  engagement data: the sitting mourned the wrong death).
- A second sitting landing multi-name (freshPersonN >= 2 overnight)
  — the witness variant cannot serve by construction; the arm's
  draws are single-fresh only.
- A MOURN-TEMPLATE exemption firing (a double-stage pair sharing a
  shape — the amendment's first use, audited in the run note).
- A staged sitting with rel.witnessed true and 0 witness servings
  across >=3 such sittings (the pool has the lines but the draw
  never lands them).
- A relationship variant served WITHOUT the relationship (a
  fabrication). FAIL LOUDLY.
- A MOURN-TEMPLATE repeat outside a double-stage pair.
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

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-21/journey-succession-r263-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r248/r258/r262 precedent): a forced-chain panel
must NOT roll the unforced baseline forward — LOUD lines from forced
deaths are regime, not drift, unless investigation shows a real bug.
Per-file means are the comparison (the tool's sum-vs-mean mismatch
is unresolved since r229).

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r258/r260/r261/r262: measurement-proof staleness pair,
phone-frame stale receipt, deed-attainment / capable-bot / trust-
observer / occupation-panels / measurement-cache-flags 120s timeouts
under load) are the baseline; any NEW failure is a stop-and-explain
item. No src/js change this run, so no attributable failure is
expected. The gate may go to adoption if the occurrence times out
(r239/r256/r260/r262 precedent) — the proof re-runs + panel are the
in-run bar.

## Metric review (carried)

- REL-WIT: this run stages MORE sittings per seed (r262 metric
  review, filed). The 3-draw floor stands.
- WIT-SIT cap 2/seed is RAISED to 4 this run (the r262 prescription);
  the pre-death scan shares the cap with the post-death scan.
- MOURN-TEMPLATE: double-stage-pair exemption ADOPTED this run (see
  Bars) — preregistered before play, printed by the analyzer.
- F5 WILD EXERCISE stays DESCRIPTIVE; rolling window advances to
  r232+r233+r245+r248+r254.
- Proof refresh rounds 11 + 12 remain owed (measurement-proof track,
  carried since r192/r194/r195).
- Scout-role ping-pong / driver re-ask pestering: carried, unchanged
  (checkpoint loop untouched to protect the smoke control).
- m3v2b: carried, not a bar.
- BOWCRAFT bisect for the 34362 drift stays open (not this run's).
- Outing-chain re-tune stays open (conversion 12.9%, r260).
- F5 V3 still never served in the wild.
- Day-skip watch: twenty-fifth straight panel watch.
- Multi-name relationship mourning stays open (not built).
- KIN mourning stays unavailable (no kin signal).
