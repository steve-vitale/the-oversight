# Journey crisis r264 — PREREGISTRATION (Lane B, leg 6)

**Status: FROZEN. This run (`playtest-loop-2-20261122T1300Z`, scheduled Sun
2026-11-22 13:00 CST / 19:00Z) plays crisis (6) on seeds 14599–14601 per
this prereg. Base master `8ec902e56`. Rotation-b read 6 at run start; this
run writes 7 at closeout. The r263 panel (seeds 14596–14598, base
`4266e6cce`) went NO-GO on FIGHT-STALL (5 stall-days, flee never fired)
with C3b GO (fix 2 holds). This run is the r263 next-round instrument
round: confirm or refute the key-churn mechanism, and split the stall bar
by source.**

## Run-state handoff (r264, written at run start)

- Lock: NO `playtest-loop-2.lock` existed at run start. Own lock created
  18:56:36Z, run_id `playtest-loop-2-20261122T1856Z`.
- Pre-flight: main tree clean at 18:56Z (`git status --short` empty).
  Disk 47%. `git pull --ff-only`: already up to date (tip `8ec902e56`).
  `worktree-reap.sh`: SKIP — registry lock held by another reaper run
  (consecutive skips: 5); no worktrees reaped. ALERT line noted (same
  alert r263 saw at skip 1; the count has grown to 5 — the reaper lock
  holder is a standing infra item, not this run's blocker: cap is 11/16
  active, registration can proceed).
- Registration: `bash scripts/worktree-register.sh journey2-crisis` —
  attempt 1 (foreground exec) SIGTERM'd at ~135s by a machine restart
  (uptime showed a fresh boot ~18:59Z); attempt 2 (setsid detached) ran
  ~13 min and vanished with no log output and no registry entry, worktree
  dir removed, branch kept — cause undetermined (see run note); attempt 3
  (setsid, clean exit) died within ~2 min the same way. Attempt 4 runs as
  a runtime-managed backgrounded exec (the same mechanism that carried
  r263's 14-min registration). Registration is the known slow step: the
  repo tracks 108,631 files and the checkout runs under load ~10.
- Rotation: reads 6 (crisis). This run plays crisis and writes 7.
- Canon read: CANON.md + DISEASES.md read in full by r247/r251/r253;
  `git log 4266e6cce..8ec902e56` on CANON.md, DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md,
  DIRECTIVES.md is EMPTY — r247's canon read stands unchanged.

## Base movement since r263's panel base (4266e6cce -> 8ec902e56) — classified

- **r263's fixes ARE on master** (rebased as `924626218`, same message):
  `git diff beda0ee6d HEAD -- src/js/conversation.js
  scripts/policies/oracleV2.js` is EMPTY and master `oracleV2.js` carries
  the stuckKey fix. (The run-start check `merge-base --is-ancestor
  beda0ee6d HEAD` failed only because the adoption rebased the commit.)
- Net src diff 4266e6cce..8ec902e56 (excluding evidence/tests): social
  r266 (conversation.js / convo-wants.js named-favor + F5/F6/repay test
  fixes), sim-gunloss-a instrument, sim-needwave-b guarded needWave copy,
  journey-establishment r268. No gate, threshold, price, or bar changed
  by this run. No game fix is built in this run except the conditional
  travel guard below (driver/policy-side only, proven before/after).

## Corrections to the r263 record (established this run, before play)

1. **ctx is fresh per runDays CALL, not per run.** `sim-harness.js:312`
   creates `const ctx = {...}` inside `runDays`, and the crisis driver
   calls `runDays(Game, policy, {days: 1})` once per game-day — so the
   oracle ctx resets every day. r263's "ctx churn is ruled out" is
   WRONG as stated; what the trace must test is WITHIN-DAY churn
   (fight-object / monster-set churn inside one day's runDays call).
   The day-keyed counter resets daily by design, so a daily ctx reset
   does not itself defeat it — but any claim about ctx stability must
   be re-read with this in mind.
2. **`fled_unreachable` is ABSENT from the per-seed JSONs, not 0.**
   The driver never dumps the oracle ctx counters into `rec` (no
   `fled_*` / `stuck` / `ctx` key occurs anywhere in the three r263
   JSONs — verified by walk). r263's "flee never fired" rests on that
   absence plus the stall-days themselves, not on a measured 0. This
   run adds the ctx dump (instrument B), so the flee count becomes a
   measured number.

## Leg question (binding)

1. **STUCK-KEY-CHURN:** does the stuck counter's key churn inside a
   stall day? The trace records every fight-start key, every
   no-move increment, and every unreachable-flee fire. If stall days
   show the key changing before `_closeStuck` reaches 3, the r263
   deduction is confirmed and the next re-key must survive
   monster-set churn. If a stall day shows a STABLE key with
   `_closeStuck` resetting to 0, the reset is elsewhere (move /
   strike / ability / day boundary) and the trace names it.
2. **STALL-SOURCE:** how many stall-days are fight-source
   (`tbPlayerMove`, game.js:38213) vs travel-source (`beginPathWalk`,
   game.js:15115)? The two call sites are the only emitters of
   "No path there." — the bar splits into two bars of 0.
3. **TRAVEL-CALLER:** who calls `beginPathWalk` 236 times on a
   travel-stall day (r263 seed 14598 d94)? The wrap records the first
   stack sample on each stall day per source.

## Instruments built this run (record-only unless noted)

- **A. oracleV2 `_stuckTrace`** (`scripts/policies/oracleV2.js`): on
  fight-start push `{k:'start', d, key, stuck}`; on each out-of-range
  no-move push `{k:'inc', d, key, stuck}`; before `flee('unreachable')`
  push `{k:'flee', d, key, stuck}`; on a reset of a nonzero counter push
  `{k:'reset', d, key, why}` (why: moved / inrange / strike / ability).
  Capped at 1000 entries; record-only, no decision reads it.
- **B. Driver ctx dump + nopath wraps** (new driver
  `scripts/journey-crisis-r264-delayed-20261122.js`, r262 driver
  verbatim except instruments + seeds + ORIGINS + EVID): the driver's
  `policy.fight` wrapper stashes the runDays ctx; after each day's
  `runDays` the driver accumulates `rec.oracleCtx` (fled, fled_*,
  struck, engagedFavored, assessments — summed across days) and appends
  `rec.stuckTrace` (from `ctx._stuckTrace`). Record-only wraps of
  `Game.beginPathWalk` / `Game.tbPlayerMove` count failures per day per
  source into `rec.nopathBySource` and capture the first stack sample
  per (source, day) once that source reaches 10 failures that day.
- **C. Analyzer** (new `scripts/analyze-crisis-r264-delayed-20261122.js`,
  r262 analyzer verbatim + new sections): FIGHT-STALL split by source
  (fight vs travel stall-days, separate bars); STUCK-TRACE section
  (key changes / max _closeStuck / flee fires per stall day);
  ORACLE-CTX panel totals (fled_* now measured).
- **D. Travel guard (CONDITIONAL, second phase):** IF the stack sample
  names a driver/policy call site that retries the same unreachable
  target, add a same-target-same-day guard at that call site + a proof
  test, and run a second panel on the SAME seeds with the guard on
  (before/after on identical seeds). IF the caller is game-internal,
  build NO guard this run — file it as a game-side finding with the
  stack as evidence. Time-boxed: if the second panel does not fit the
  window, the guard is a filed fix item for r265, not a silent skip.

## Pre-registered metrics (binding, §14)

- **STUCK-KEY-CHURN** (diagnostic): on any stall day, the trace shows
  key changes before `_closeStuck` reaches 3 (mechanism CONFIRMED) or a
  stable key with a named reset (mechanism REFUTED, reset named).
  Verdict is the mechanism named with evidence, either way.
- **FIGHT-STALL-FIGHT**: fight-source stall-days (≥10 failed
  `tbPlayerMove` in a day), bar 0.
- **FIGHT-STALL-TRAVEL**: travel-source stall-days (≥10 failed
  `beginPathWalk` in a day), bar 0.
- **C3b-TRANSCRIPT**: settledLines / TRUE false settlements, bar 0 false
  settlements (carried from r263).
- **DRY**: 0 dry lines (carried). **WRAP**: 0 unmarked endings (carried).
  **DOWNEDTWICE**: 0 repeats (carried). **M12**: 0 same-reason circle
  repeats (carried).
- **People check**: all transcripts read in full; fabricHits 0.
- Interesting iff: key-churn confirmed with trace evidence, OR a
  stall-day with a stable key (new mechanism), OR travel-source
  stall-days dominate the count, OR the travel caller is identified, OR
  any new fixable defect in the crisis band.

## Policy (frozen)

- Driver: `scripts/journey-crisis-r264-delayed-20261122.js` (r262 driver
  + instruments A/B only; no behavior change in the pilot panel).
  Analyzer: `scripts/analyze-crisis-r264-delayed-20261122.js` (r262
  analyzer + sections C). DAYCAP=150, death-aware stop (+10d tail).
  Seeds FRESH 14599–14601 (pilot of 3; expand only if the pilot shows
  an interesting shape per §9 PILOT FIRST).
- Seed-band freshness: grep over `evidence/*/journey-*-prereg.md` and
  `evidence/*/sim-*-prereg.md` finds NO mention of 14599/14600/14601
  (verified at run start; r262 used 14591–14595, r263 used 14596–14598).
  ORIGINS map keys 14599–14601 (fresh band; r262 driver fell back to
  St. Louis for unkeyed seeds — keys are set here).
- Gating freeze stands. Perception law stands. Combat-play gate stands.
  No toughness/gear/ability tuning. No gate, threshold, price, or bar
  changed — only instruments A–C and the conditional guard D.

## Metric review (carried from r263)

1. Wren-note "5x+" bar miscalibrated (r257, carried).
2. C3b instrument searches the wrong corpus (r257, carried) — the
   C3b-TRANSCRIPT section reads transcripts; TRUE hits need run-note
   adjudication with pantryPer from the per-seed JSONs.
3. Link-accept ECHO is an instrument gap (r257, carried).
4. Telemetry units still open: `playerFights` / `latelyDefenseCount`
   keys absent from the per-seed JSONs (r261 review 5, carried).
5. Census corpses omit scholar deaths (r257 review, carried).
6. PS4 arm not run this round (time-boxed pilot); the dir-hygiene item
   (clean `ps4/` between runs) stands for the next run that does.
7. FIGHT-STALL's bar counts failed closes, not unresolved fights (r262
   review 7, carried) — PARTLY ANSWERED this run by the source split
   (fight vs travel) and the trace (resolved-with-strikes days read
   from the trace, not the bar).
8. R58 refused-sortie book check reads a field the driver never
   populates (r262 review 8, carried).
9. MARCH-REFUSAL and TRAIL 3-PRESS have no dedicated analyzer section
   on this leg — judged by the people check only (r262 review 10).
10. **NEW — r263's "fled_unreachable 0" was absence, not a measured
    zero** (see Corrections §2 above). The ctx dump (instrument B)
    closes this; any future "never fired" claim must cite the dumped
    counter.
11. **NEW — r263's "ctx churn ruled out" is wrong** (see Corrections
    §1 above). ctx is fresh per runDays call (per game-day); within-day
    churn is what the trace measures.
12. **NEW — the closer fired 0 times on the r263 panel** (r263 review
    12, carried): C3b GO rests on "no false settlement", not on "the
    closer fires correctly". A panel where a fulfilled favor's thread
    closes is still needed to confirm the positive direction in the
    wild.
