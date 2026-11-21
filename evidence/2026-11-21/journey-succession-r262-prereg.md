# Journey succession r262 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r262 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r262: follows crisis r261 (2026-11-20/21, landed
b7c8eff2c; rotation-b 6→7). Base: master `36d694f13` at registration
(Lane A scale r248 merged mid-pre-flight; the 03:55Z pull predates it —
base re-verified in the worktree). Lock: playtest-loop-2.lock run_id
`playtest-loop-2-20261121T0355Z` (own, created at run start; no prior
lock present; main tree clean, disk 48%). Worktree:
`~/workspace/worktrees/journey2-succession` (registered; registration
took ~10 min under box load — `git reset --hard` CPU-bound, not stuck;
heartbeat loop `journey2-succession-hbloop-r262.sh` every 10 min, setsid).

## Standing state (why this run plays leg 7, and what it carries)

r258 succession (2026-11-20, landed ef5e65cb1) left REL-WIT at
INSUFFICIENT-DATA with supply PRESENT (1/9 seeds: Karimi, 34403,
ambush, witnesses Giulia + Grace — pre-fix record even listed Karimi
herself as a witness; the r258 SELFWIT fix corrected that). The serving
never got its chance because no sitting ever gathered around the one
witnessed death: WIT-SIT NO-STAGING. Its metric review filed the next
step verbatim: "stage the sitting (drive a mourning sitting on a
witnessed-death seed) rather than screen more seeds for supply."
This run IS that staging panel.

Carried from r260/r261 (social-life / crisis): the M12 escalator-cap
fix. r260's M12-native went NO-GO on ONE sitting (Ines, seed 45787,
d27 — "three times now" served 3x after "circles"); the mechanism is
pinned (the favor-requirements escalator cycles past its cap) and the
fix arm was filed as "the next run's first job: probe the escalator,
fix the cycle, proof test RED→GREEN, panel-confirm." This run does
it as Arm 1. The r260 metric-review strip addition ("You asked me
that before. It's a different question now.") rides as Arm 3, time
permitting, same file family.

No canon doc covers succession/mantle (CANON.md grep empty; r54/r91
preregs, unchanged) — none invented here. Gating freeze (2026-10-27)
stands; no gate, deed-bar, standing, wave, or table-price change is
in scope.

## Arm 1 — M12 escalator cap (fix, carried from r260)

DEFECT (mechanism, read from src/js/convo-dialogue.js before any
play): the favor-requirements repeat handler escalates As I said →
Like I said → Still the same thing → "I've told you three times
now" → spend-out "We're going in circles" — then RESETS
`_favorReqEscalations` to 0. The next repeat re-serves "three times
now", then circles again, then three-times again: the count is a lie
the second time, and the cycle repeats as long as the player keeps
pressing (the spend only drops `dlg:favor_requirements` from the
menu; the outing action re-enters the same path, which is how Ines
d27 pressed 7x). The recap escalator (conversation.js) has no such
cycle — it serves circles for every reframe ≥ 2. Only
convo-dialogue.js:262 serves "three times now" in game code
(journal.js:166 is a memory line, not an escalator).

FIX (pre-declared): per-sitting, per-block-reason latch
`c._favorReqCirclesServed[escKey]`. Once the circles exit has fired
for an escKey, every further repeat for that key serves the circles
line (and re-spends the choice), never "three times now" again. A
new block reason re-arms honestly (fresh escKey); a fresh sitting
resets the latch with the convo object. "Three times now" max 1 per
sitting per key — the r260 bar shape.

PROOF (`scripts/test-journey-succession-r262-escalator-cap-20261121.js`,
r195-test staging, seed 777036, door-blocked food_share favor, all
pool variants pre-marked said): drive `dlg:favor_requirements` 8x.
GREEN = 8 transcript door lines; "three times now" exactly once (4th);
lines 5–8 all "going in circles"; spent['dlg:favor_requirements']
true after press 5 and still true after press 8; fresh sitting resets
counters + latch. RED (pre-fix, expected) = three-times 3x (presses
4, 6, 8), circles 2x (5, 7). The r195 test (5 presses) and r180 test
(food blocker) must stay GREEN unchanged — their 5-press traces end
at the first circles, before the latch matters.

PANEL-CONFIRM: re-run the r260 social driver on seed 45787 only
(the failing seed) with the fix; M12-native bar max≤1, 0 sittings
2+, exits≥1. A full 4-seed panel re-run is NOT required — the fix is
proven by the targeted test and confirmed on the one failing seed.

## Arm 2 — succession: STAGE the witness sitting (leg question)

QUESTION: does the REL-WIT multi-name witness variant serve in the
wild when a mourning sitting is STAGED on a witnessed death while
fresh? r258 proved the variant by harness only; the wild serving is
still unmeasured because no sitting ever landed in a witnessed
window.

DESIGN (r258 driver fork, ONE instrument change): the WIT-SIT scan
also runs after each PRE-death day (days 1..deathDay), same 0–1 day
freshness, same cap 2/seed, same living-non-bearer-witness speaker
rule, same transcript + rel snapshot recording. Rationale: r258's
Karimi died pre-death (the post-death-only scan never saw her fresh
— bearer Duc died day 29 organically, post loop starts there). The
scan is pure reads; the sitting is driven the same day as detection,
inside the engine's 3-day fresh-mourning window. Declared in
advance: a pre-death sitting perturbs the seed's trajectory after
the death (RNG/time consumed); the question is the serving, not
trajectory fidelity. The smoke control guards driver inertness.

DRIVER: `scripts/journey-succession-r262-20261121.js` (r258 driver +
PREFIX env + the pre-death scan; NO game-logic change). ANALYZER:
`scripts/analyze-journey-succession-r262-20261121.js` (r258 analyzer,
renames only — its witSit / witness-serving counts are
phase-agnostic). RUNNER: `scripts/run-journey-succession-r262-panel.sh`
(r258 runner, renames).

SEEDS (declared replays, not a fresh band — the point is staging,
not supply screening): 34403 (KNOWN supply — Karimi ambush,
witnesses Giulia + Grace post-fix) + smoke 33998 (standing control;
snapshot must match r233 exactly). Pilot first: 34403 alone; expand
to the smoke only if the pilot exits 0 with a valid stdout.json.
No fresh band: r258's metric review forbids re-screening for supply.

BARS (binding, §14):
- STAGE (new, binding): ≥1 staged wit-sit fires on 34403 with a
  living witness speaker, inside the fresh window.
- REL-WIT (binding, carried): PASS = ≥1 judged witness-variant
  serving with rel.witnessed true AND 0 servings where not witnessed,
  on the staged sitting(s), naming the latest dead. 0 servings despite
  a staged sitting with latelyWitnessed=true = INSUFFICIENT-DATA
  (the question narrows to the pick, not the sitting) — recorded as
  such, not re-scored. A serving naming the WRONG dead = fabrication:
  FAIL LOUDLY.
- REL-BOND, REL-VET, MOURN-TEMPLATE, MOURN-EXHAUST, MANTLE-FINE,
  DRY CENSUS, WILD CHECK, C3d WILD HOLD, CONTROLS: as in r258
  (carried, unchanged). CONTROLS bar: smoke 33998 snapshot matches
  r233 exactly; if the pre-death scan moves the smoke, it is base
  drift, recorded as such and the bar re-baselines by measurement,
  not adoption.
- F5 WILD EXERCISE (DESCRIPTIVE, r248 reclassification): firings
  reported per leg; binding proof is the r225 harness (22/22),
  re-run on this base.

## Arm 3 — "You asked me that before" strip (conditional on time)

r260 metric review: add "You asked me that before. It's a different
question now." to the repeat-prefix strip in
`scripts/journey-social-r226-helpers.js` (it is a question-stem
prefix like "As I said —", not content). Extend the r250-m4-split
proof test (44/44 base); verify the r238 corpus pins (181 / 174 / 7)
— if the strip moves the pins, the re-baseline is justified in the
commit (design change on purpose, green-list rules) and the panel
conversational count is reported both ways. Analyzer-only, no game
change. If time runs out, this arm is carried, not half-done.

## What would count as interesting

- A witness-variant serving in a STAGED sitting on 34403, naming
  Karimi (the first ever wild witness serving — REL-WIT moves from
  INSUFFICIENT-DATA to PASS).
- A staged sitting with latelyWitnessed=true and 0 witness servings
  (the pick never lands on the 2 witness lines — the pool math, not
  the sitting, is the binding constraint; next step is a pick-side
  question, filed, not tuned around mid-run).
- A staged sitting where the lately dead is NOT Karimi (a second
  witnessed death lands first — the scan's candidate order matters).
- The pre-death scan firing on the smoke (a witnessed pre-death
  death on 33998 — the smoke bar moves; base drift vs driver effect
  adjudicated by the snapshot diff).
- The M12 panel-confirm on 45787 reading max≤1 (the cycle is dead
  in the wild, not just the harness).
- A second three-times serving anywhere on the confirm seed (the
  latch fails for a reason the harness doesn't stage — FAIL LOUDLY).

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-21/journey-succession-r262-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r248/r258 precedent): a forced-chain panel must
NOT roll the unforced baseline forward — LOUD lines from forced
deaths are regime, not drift, unless investigation shows a real bug.
Per-file means are the comparison (the tool's sum-vs-mean mismatch
is unresolved since r229).

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r258/r260/r261: measurement-proof staleness pair,
phone-frame stale receipt, deed-attainment / capable-bot / trust-
observer / occupation-panels / measurement-cache-flags 120s timeouts
under load) are the baseline; any NEW failure is a stop-and-explain
item. The M12 fix touches only convo-dialogue.js's favor-requirements
repeat path plus test/evidence files; a failure in a conversation /
favor-requirements test is attributable until proven otherwise. The
gate may go to adoption if the occurrence times out (r239/r256/r260
precedent) — the proof tests + panel are the in-run bar.

## Metric review (carried)

- REL-WIT stays INSUFFICIENT-DATA in the wild until a supply-seed
  serving is observed; this run stages the sitting instead of
  screening for supply (r258 metric review, filed).
- WIT-SIT cap stays 2/seed (r258 design); the pre-death scan shares
  the cap with the post-death scan.
- Proof refresh rounds 11 + 12 remain owed (measurement-proof track,
  carried since r192/r194/r195).
- Scout-role ping-pong / driver re-ask pestering: carried, unchanged
  (checkpoint loop untouched to protect the smoke control).
- m3v2b: carried, not a bar.
- BOWCRAFT bisect for the 34362 drift stays open (not this run's).
- Outing-chain re-tune stays open (conversion 12.9%, r260).
- F5 V3 still never served in the wild.
- Day-skip watch: twenty-fourth straight panel watch.
