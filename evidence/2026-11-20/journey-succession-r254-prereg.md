# Journey succession r254 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r254 play or fix. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r254: follows crisis r253 (2026-11-19/20, adoption
merged; rotation-b 6→7). Base: master `8cd4c0181` at run start.
Lock: playtest-loop-2.lock run_id `playtest2-20261120T0455Z` (own, created
at run start; no prior lock present; main tree clean, disk 43%).
Worktree: `~/workspace/worktrees/journey2-succession` (registered,
heartbeat loop `journey2-succession-hbloop-r254.sh` every 10 min).

## Standing state (why this run plays leg 7, and what it carries)

r248 succession (2026-11-19) passed every bar except REL-WIT, which stayed
INSUFFICIENT-DATA with supply PRESENT (first witnessed person corpses ever:
Vincent + Javier, both combat, seed 34362). Its metric review filed the
next step this run takes — but this run adjudicates the two filed
candidates against the code and the 34362 data BEFORE adopting either:

- **Candidate (a) — let the bearer sit as a mourner: REJECTED.** The bearer
  IS the player character. A WIT-SIT drives a conversation whose SPEAKER is
  the witness (an NPC) and whose listener is the player. Driving a convo
  with the bearer as speaker is self-talk: r25 established the engine
  does not guard it and the UI never offers it — unreachable in real
  play. On 34362, Stan held the mantle and was the only living witness
  of both deaths; there was no NPC witness to stage. A bearer-speaker
  sitting would measure a driver artifact, not the game. NOT adopted.
- **Candidate (b) — stage on the death day before the next runDays call:
  NOT the binding constraint.** The r248 instrument already stages on the
  detection day (after each 1-day runDays call). The 34362 data shows why
  timing cannot help: Vincent was detected day 49 with witnesses Javier
  + Stan, freshPersonN=3 — Javier died in the SAME combat, so no staging
  time finds him alive; Javier was detected day 50 (witness Stan only),
  freshPersonN=4. Same-combat witness death defeats any staging time.
  NOT adopted as the fix (the instrument keeps its detection-day staging).
- **The binding constraint is the MULTI-FRESH bind** (r248 metric review,
  third point): witnessed deaths arrive clustered — combat kills the
  people standing next to the dead — and the mourning pool serves
  relationship variants ONLY in the single-name branch
  (`convoTopics.js` t2gen_lately, mourning case). With >= 2 fresh person
  corpses the multi-name branch serves 4 generic templates and NO
  relationship variant can draw. On 34362 both staged deaths sat at
  freshPersonN 3–4: the witness variant was out of the pool regardless
  of the speaker. The witness lines exist in game code (2 lines, r232),
  are voice-tested in single-name, and are unreachable exactly when
  witnessed deaths happen. That is the blank this run fills.

## The fix (game change, one pool, one gate)

`src/js/convoTopics.js`, t2gen_lately, mourning case, MULTI-NAME branch
only: when the speaker witnessed the most-recent fresh dead, the two
witness lines join the multi-name pool:

- Gate: `t2MournRel(vid, ev).witnessed` — the speaker's id is in
  `ev.witnesses`, which `t2LatelyEvent` fills from the LAST fresh
  corpse's stored witnesses only. A speaker who witnessed an EARLIER
  fresh corpse but not the latest gets nothing: the lines would name
  the wrong dead. No fabrication by construction.
- Lines (identical strings to the single-name witness variant, same
  `{mname}` discipline — filled by t2fill AFTER the pick, so
  convoPick dedupes on the template, not the name-baked copy):
  `"I was there when {mname} fell. I keep seeing it when I blink, and
  blinking doesn't help."` and `"I saw {mname} go down. I did what I
  could. It wasn't enough, and I carry that now."` `{mname}` fills from
  `ev.name`, the latest fresh dead — the witnessed one, by the gate.
- Single-name branch UNCHANGED. Bond/vet variants in multi-name stay
  open, NOT built this run (REL-BOND and REL-VET already PASS via
  single-name; scope stays on the witness arm, the leg's open question).
- Template safety (read before writing): convoPick dedupes per speaker
  FOREVER on template text (conversation.js), so MOURN-TEMPLATE (a)
  same-speaker same-shape different-dead cannot fire on the witness
  shapes; the village-wide LINE_FRESH_DAYS (5-day) steering
  deprioritizes a template said anywhere in the village, so (b)
  village-window repeats are steered against the same as the existing
  generics. The follow-up pools (cope/next/part mourning) are already
  per-kind, not per-name-count, so they serve in multi-name sittings
  today; the bond follow-ups there already name ev.name (the latest
  dead) — the same discipline this change follows.
- No gate, deed-bar, standing, wave, or table-price change: mourning
  content only. The 2026-10-27 gating freeze is unaffected. No canon
  doc covers succession/mantle/mourning (CANON.md grep empty; r94
  prereg, unchanged) — none invented here. The change follows the
  r232 REL-MOURN build in the same pool, same file, same gate.

## Panel (matched before/after, MEASUREMENT.md §15)

- Driver: `scripts/journey-succession-r254-20261120.js` (r248 driver +
  PREFIX env only: transcript/tele/stdout filenames take
  `journey-succession-${PREFIX}-...` so the two legs share one EVID
  dir without collision; NO other logic change). Analyzer:
  `scripts/analyze-journey-succession-r254-20261120.js` (r248 analyzer,
  renames only — PREFIX + EVID_DATE were already env-driven).
  Runner: `scripts/run-journey-succession-r254-panel.sh <leg>` (r248
  runner + leg argument; pilot-first per leg).
- CONTROL leg (PREFIX r254ctl, game change ABSENT): reproduces r248's
  verdicts on the new base 8cd4c0181. ARM leg (PREFIX r254arm, game
  change PRESENT): same seeds, same driver, same analyzer. The ONLY
  difference between legs is `src/js/convoTopics.js`.
- Seeds (identical both legs): FRESH-BAND REUSE 34371–34374
  (EARLY_KILL_DAY=40, POST_DAYS=70) + DEDICATED 34362 RE-RUN
  (EARLY_KILL_DAY=40, POST_DAYS=70) + smoke 33998 (EARLY_KILL_DAY=5,
  POST_DAYS=25 — the standing control). Pilot first per leg: seed
  34371 alone; then 34362, then 34372–34374 sequentially, then smoke.
  The panel runner is launched with nohup so it survives the
  coordinator's execution limit.
- The r248 panel on base e1f002065 is the historical control. The only
  convo-code change between e1f002065 and 8cd4c0181 is baba35e87
  (journey-deepening r244: F8 confide-line secret gate,
  src/js/conversation.js +12, mourning pool untouched — verified by
  diff; convoTopics.js untouched). The fresh control leg is the matched
  control; a control leg that diverges from r248's verdicts is a base-
  drift signal, recorded as such.

## Seed-band freshness (local_seed_band_freshness)

- Word-boundary grep for 34371/34372/34373/34374 over
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`:
  0 hits except `evidence/2026-11-19/journey-succession-r248-prereg.md`
  (this band's own origin). 34362 named in r245 + r248 preregs only.
  33998 is the standing smoke control.
- Reuse rationale (recorded, not hidden): §15 matched before/after
  REQUIRES identical seeds; re-running the r248 band as the control
  leg and the arm leg is the design, not a fresh reservation. The
  r248 prereg itself established 34362 as a deliberate re-run and
  33998 as the standing control.

## Questions (r254)

(1) REL-WIT (binding, carried bar, analyzer order unchanged): PASS =
    >=1 judged witness-variant serving with rel.witnessed true AND 0
    servings where not witnessed. The analyzer judges servings from
    ALL driven transcripts (checkpoints + wit-sits) against driver rel
    snapshots; held >= 1 passes regardless of the witDraws floor — the
    floor (3 single-fresh staged sittings) governs only the
    INSUFFICIENT-DATA verdict when held == 0. The fix makes the arm
    measurable through checkpoint convos in multi-name windows, not
    only through staged single-fresh sittings. A witness serving that
    names the WRONG dead (not the lately-named dead) is a fabrication:
    FAIL LOUDLY.
(2) REL-BOND (binding, carried): PASS = >=1 bond-variant serving where
    close AND 0 servings where not close. (Regression guard: the fix
    must not move the bond arm.)
(3) REL-VET (binding, REVISED denominator, floor watch): PASS = >=1
    veteran-variant serving on >=10 opener draws in both-veteran
    convos, AND 0 servings where either is not a veteran. Fewer than
    10 opener draws = INSUFFICIENT-DATA on arm (a).
(4) MOURN-TEMPLATE (binding, carried): 0 same-speaker same-shape
    firings for different dead AND 0 different-speaker same-shape
    same-dead firings within 5 days. 19 shapes (witness shapes already
    in the scan; the fix adds no new shape).
(5) MOURN-EXHAUST (binding, carried): 0 servings of the exhausted line
    in a mourning sitting.
(6) MANTLE-FINE (binding, carried, gap-subtraction): 0
    flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2,
    0 unexplained fineLatency==1, 0 day-skips.
(7) DRY CENSUS (binding, carried): 0 dry hits of any class.
(8) WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/F6/
    C3c/F2/C3d and the carried landed-fix surfaces.
(9) C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
(10) F5 WILD EXERCISE (DESCRIPTIVE, reclassified r248): report
    settled-favor firings per leg + the rolling 5-panel window
    (r232+r233+r245+r248+r254arm); no PASS/FAIL. Binding proof is the
    r225 targeted harness (22/22), re-run on this base.
(11) CONTROLS (binding, smoke bar S_fixed from r230, as re-baselined
    in r233): smoke 33998 at-death snapshot matches r233's smoke run
    exactly — handoff d6 Heinrich → Grace, relPost bonds 33,
    relD14 50, selfId grace_obi + machinery (pick rank 1, funeral
    INCALL true, selfReq 0 on every seed). If the smoke snapshot
    moves, it is base drift since r233, recorded as such and the bar
    re-baselines by measurement, not adoption. The fix is inert on the
    smoke seed (1 person corpse, witnessed 0 — multi-name never
    engages), so the arm leg's smoke snapshot must match the control
    leg's exactly.
(12) Descriptive: CAP-NC bonded-by-deadline among eligible;
    denominator < 3 stays INSUFFICIENT-DATA. HABIT-COLLISION: 0
    same-seed same-habit servings. Per-kind relationship-variant
    serving counts; witness-populated corpse count; both-veteran convo
    count and opener-draw count. WIT-SIT staging counts per leg:
    sittings fired, single-fresh vs multi-fresh, no-living-witness
    cases, lately-named vs staged-dead agreement. Per-leg REL-WIT
    held/unheld counts (the before/after).
(13) WITNESS-CENSUS (diagnostic, carried): per-seed corpse census —
    person corpses total, person corpses with witnessN>0, their
    causes, and whether any bearer corpse carried witnesses.

## Proof tests (before/after the fix)

- NEW `scripts/test-journey-succession-r254-multiwit-20261120.js`
  (cloned from the r232 proof test's harness pattern, multi-name
  staging): cases `multiwit-fires` (speaker in the LATEST corpse's
  witnesses → >=1 witness opener in 7 sittings, naming the latest
  dead), `multiwit-silent` (speaker in NO corpse's witnesses → 0
  witness openers), `multiwit-wrongdead` (speaker witnessed the
  EARLIER corpse only → 0 witness openers; guards the fabrication),
  `multiwit-names-latest` (every served witness opener names the
  latest dead; no literal `{mname}` in any served line; the event
  carries both names). RED before the fix (fires case: 0 witness
  openers — the pool has no witness line in multi-name), GREEN after.
  Each case in its own process (never two harnesses in one process).
- REGRESSION: the r232 relationship-mourning proof test re-run on this
  base (single-name behavior unchanged by the fix). The r225 F5
  targeted harness re-run on this base (binding proof for the
  reclassified F5 arm; expect 22/22).

## Bars (binding, §14)

- REL-WIT (binding, carried): PASS — >=1 judged witness serving with
  rel.witnessed true AND 0 servings where not witnessed; a serving
  naming the wrong dead is a FAIL, not a re-score.
- REL-BOND (binding, carried): PASS — >=1 bond-variant serving where
  close AND 0 servings where not close.
- REL-VET (binding, REVISED): PASS — >=1 both-veteran serving on >=10
  opener draws in both-veteran convos AND 0 servings where either is
  not a veteran; fewer than 10 opener draws = INSUFFICIENT-DATA.
- MOURN-TEMPLATE (binding, carried): PASS — 0 same-speaker same-shape
  firings for different dead AND 0 different-speaker same-shape
  same-dead firings within 5 days (19 shapes).
- MOURN-EXHAUST (binding, carried): PASS — 0 exhausted-line servings
  in a mourning sitting.
- MANTLE-FINE (binding, carried, gap-subtraction): PASS — 0
  flippedImmediate=false rows outside VILLAGE-OVER, 0
  fineLatency>=2 (gap-adjusted), 0 unexplained fineLatency==1,
  0 day-skips.
- DRY CENSUS (binding, carried): PASS — 0 dry hits of any class.
- WILD CHECK (binding, carried): PASS — 0 regressions on the carried
  surfaces.
- C3d WILD HOLD (binding, carried): PASS — 0 C3d-class erasures.
- F5 WILD EXERCISE (DESCRIPTIVE): firings reported per leg + rolling
  5-panel window; r225 harness 22/22 is the binding proof.
- CONTROLS (binding, smoke bar S_fixed as re-baselined in r233):
  smoke 33998 at-death snapshot = d6 Grace (relPost 33, relD14 50,
  selfId grace_obi) + MANTLE-FINE clean + pick rank 1, funeral
  INCALL true, selfReq 0 on every seed; arm smoke == control smoke.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA.
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.
- A miss is NO-GO, never re-scored against a friendlier metric mid-run.
  Metric doubts go under "metric review" for the NEXT run.

## What would count as interesting

- A witness-variant serving on the ARM leg in a multi-name sitting,
  naming the latest dead (the fix working as designed — the first ever
  multi-name witness serving).
- A witness serving on the ARM leg where rel.witnessed is false, or
  naming a dead person other than the lately-named dead (fabrication —
  FAIL LOUDLY, fix reverted, not tuned around).
- A MOURN-TEMPLATE failure on a witness shape (adjudicate: honest
  double-witnessing vs a real repeat — the bar, not the fix, may be
  the question; file under metric review, do not re-score).
- The CONTROL leg diverging from r248's verdicts (base drift since
  e1f002065 — the F8 confide gate is the only convo change; a drift
  here is a signal, not noise).
- The ARM leg's smoke snapshot differing from the CONTROL leg's (the
  fix must be inert on the smoke seed; a difference is a defect).
- A staged wit-sit firing single-fresh on either leg (the first
  single-fresh staged sitting — the r248 floor would finally bind).
- REL-BOND or REL-VET moving between legs (the fix must not move
  them; a move is a regression, not a side effect).
- A live-want recap serving (positive evidence the C3d fix engages).
- CAP-NC denominator >= 3 for the first time in several runs.
- The 34362 re-run NOT reproducing Vincent/Javier witnessed deaths
  (trajectory drift — the instrument's pre-death path is untouched,
  so this would be a base-drift signal, recorded as such).

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-20/journey-succession-r254ctl-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
(and the same for the r254arm tele files). Prereg rule (r89/r91/r248
precedent): a forced-chain panel must NOT roll the unforced baseline
forward — LOUD lines from forced deaths are regime, not drift, unless
investigation shows a real bug. The means-vs-sum mismatch (tool sums
the current files; the baseline stores means) is unresolved since r229:
per-file means are the comparison, and the baseline is NOT rolled on
LOUD lines without a same-run investigation verdict.

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r248: measurement-proof staleness pair + phone-frame stale
receipt; load-artifact timeouts on deed-attainment/capable-bot/trust-
observer-neutrality/occupation-panels/measurement-cache-flags, all
solo-PASS on r248) are the baseline; any NEW failure is a
stop-and-explain item. The run changes src/js/convoTopics.js (one
pool, one gate) plus instruments; a failure in a mourning/conversation
test is attributable until proven otherwise.

## Metric review (carried)

- r248's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in their run notes). This run runs telemetry-check
  against the succession baseline and reports LOUD lines; it does NOT
  roll the baseline forward until the mismatch is resolved.
- F5 WILD EXERCISE stays DESCRIPTIVE. The r225 harness (22/22) is the
  binding proof.
- REL-VET: the 10-draw floor held with margin on r248 (19 draws). Keep
  the floor; stop watching it.
- DRY CENSUS amendment stands (any dry hit fails).
- MANTLE-FINE stays the gap-subtraction revision (r230); no further
  revision proposed.
- C3d wild hold: the fix's live-want path never engaged on r230, r231,
  r232, r233, r245, or r248 (no recap while a live want was open).
  The bar stays.
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: twenty-first straight panel watch.
- Proof refresh rounds 11 + 12 remain owed (not this run's).
- Scout-role ping-pong: carried as an owed driver note (checkpoint
  loop untouched this run to protect the smoke control).
- KIN mourning: NOT in this run's scope — no signal exists.
- Multi-name BOND/VET mourning: open, not built (this run builds the
  witness arm only — the leg's open question).
- Candidate (a) bearer-as-mourner: REJECTED this run (self-talk,
  unreachable in real play) — the rejection is filed here so the next
  run does not re-propose it.
- Candidate (b) same-day staging: NOT the binding constraint (same-
  combat witness death defeats timing) — filed here so the next run
  does not re-propose it as the fix.
