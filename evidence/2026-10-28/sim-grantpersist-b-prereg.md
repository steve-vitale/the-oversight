# sim-grantpersist-b — PREREGISTRATION (committed BEFORE any judged trace run)

Run: oversight-flesh-out-loop-b, arm sim-grantpersist-b, axis
food-economy. DIAGNOSIS ONLY: zero src/js changes, zero app.js
UI code, zero changes to scripts/playpath-spandraw-b.js itself
(it is copied/extended, never edited). NEW scripts:
scripts/grantpersist-trace-b.js (trace instrument) and
scripts/test-grantpersist-b.js (proof). NEW evidence: this
prereg, per-seed trace files under
evidence/2026-10-28/sim-grantpersist-b-corpus/, and
evidence/2026-10-28/sim-grantpersist-b.md.

## Gap (tracker blank 2, from run fleshout-loop-b-20261028T1430Z)

From evidence/2026-10-28/sim-spandraw-playpath-b.md, § "Notes
(coordinator backlog)", grant-persistence follow-up: on seeds
10041/10042, 11 late taps (animal_ken 1, fear_aura 3, molt 3,
ambush 1, blood_trail 1, patient_aim 1, scarecrow 1) were
refused "You don't have that ability." though the setup grant
succeeded and early taps on the same instances fired. Root
cause was NOT established; candidates named were bearer
change vs ability-list rewrite. This arm does NOT re-judge
any spandraw verdict (no promotion, no key classification is
re-opened); it diagnoses the loss so long tap runs can be
reused honestly.

## The trace instrument (what counts as a trace)

Per (seed, key), one fresh game (loadGame + setupGame via
scripts/sim-harness.js, FULL src/js list in index.html order
minus DOM-only app.js/sprites.js/tile-scenes.js/move-anim.js/
drama.js, Math.random seeded BEFORE eval, never stub
Game.save), played exactly as the playpath driver played it:

1. GRANT (setup, identical to playpath): the key's ability is
   pushed onto scholar.abilities (level 1) before play begins,
   verified via Game.hasAbility(aid) at setup.
2. PLAYED DAYS: competent policy (substrate gates asserted
   FATAL by the driver: COMPETENT_FEAST=0 SEATDRIVE=0
   PLENTYDEPRI=0 DEPOSITGATE=1) for 2 lead days + 5 tap days.
   On each tap day, AFTER competent.daily, the driver performs
   the same tap sequence as playpath-spandraw-b.js (social
   keys open a conversation via Game.talkTo and keep it open;
   button read via Game._actionAvailable; if and only if the
   button reads ok, tap via Game.activateAbility('ability.
   action') with NO target). The driver NEVER sets dayTicks/
   dayPart, NEVER calls tickAction, NEVER tops up kcal/health,
   NEVER steers tap positions — same honesty rules as the
   playpath driver.
3. NEW RECORDING (the whole point of this arm): for EVERY tap
   the driver records, in the per-instance trace file:
   - the scholar's ability list (ids + levels) BEFORE the tap,
   - the current bearer/villager id (Game.villagerId and
     state.scholar.villagerId where present),
   - game day + dayTicks before the tap,
   - the tap outcome and tap-window say lines.
   PLUS ability-list snapshots at each tap-day start (before
   competent.daily runs that day) and after each
   competent.daily (i.e. immediately before the tap sequence).
   A snapshot records: ability ids + levels, bearer id, game
   day + dayTicks, and whether the granted key is present.
   The tap-day-start snapshot is taken at the top of the
   wrapper daily, before competent.daily; the post-daily
   snapshot is taken after competent.daily returns, before
   any tap work. That pair brackets exactly what competent.
   daily did to the list on that day.
4. WRITE TRANSPORT: identical to the playpath driver —
   failed writes kept in memory and flushed at end (EPERM
   flap waited out, never forced); deadline exhaustion stages
   inside this worktree (never /tmp) and exits loudly.

## Band (judged)

- Seeds: 10040–10047 (8 seeds — never below 8; the full
  pilot band, so the original reproducing seeds 10041/10042
  are inside it).
- Keys: the same 15 playpath keys (tracker.track,
  thief.steal_pantry, game_sense.read_sign,
  patient_aim.clean_shot, stalk.stalk_prey,
  blood_trail.follow_blood, ambush.lay_wait,
  animal_ken.read_beast, scarecrow.stage_injury,
  molt.shed_skin, fear_aura.menace,
  intimidating_presence.end_it_before, war_cry.challenge,
  trophy_room.mark, long_table.share_pot).
- Horizon: 2 lead + 5 tap days per instance (120 instances).
- Output: one trace file per (seed, key) under
  evidence/2026-10-28/sim-grantpersist-b-corpus/, named
  grantpersist-b-s<seed>-<ability>.<action>.json, mirroring
  the playpath corpus layout.

## Primary metric and GO threshold (pre-registered, §14 binds)

Primary metric: localization of the first grant-absence event
per reproducing seed — the tap-day/game-day of first absence,
the last present snapshot, and what changed between them.

- DIAG-GO: the loss reproduces on 10041 and/or 10042 AND
  the loss event is localized to a single day-transition or
  named in-game event on each reproducing seed (what changed
  between last-present and first-absent: bearer id, list
  object, a grant/deepen/prune call — the system and code
  site named if traceable). A documented negative (e.g.
  bearer unchanged AND list rewritten by X with proof)
  counts as GO if the localization bar is met — the evidence
  file states which it is.
- DIAG-NO-GO: no reproduction on the band, OR reproduction
  without localization (absence appears but no snapshot pair
  brackets a change, or the change cannot be tied to a day/
  event).

Secondary (reported, never re-scored as the verdict):
reproduction counts per seed/key, bearer-change counts,
list-rewrite counts, and the tap-day distribution of first
absences. A mechanism that is the game legitimately
removing/replacing abilities (a cap, a slot rule, a bearer
swap) is reported plainly as a finding, not a bug claim,
with what the spandraw instrument must do next time
(re-grant check per tap day, or record-and-exclude).

## Proof (before any judged band)

scripts/test-grantpersist-b.js must pass green BEFORE the
judged band runs, including synthetic legs proving the
snapshot logic detects a planted loss: a fixture that drops
an ability mid-run must be flagged with the right day/event.
A proof failure blocks the judged band; no judged file is
written before the proof is green.

## Honesty rules (carried from playpath)

No clock-setting, no tickAction, no kcal/health top-up, no
tap-position steering, no editing of playpath-spandraw-b.js,
no src/js changes in this arm. If the EPERM write flap hits,
use the in-memory-flush pattern; never force a write.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

This diagnosis has NO before/after game leg: zero game
changes, zero lever variants, nothing to panel. Panel
metrics (national/table/wins) do not exist for 7-day
instances and are not estimated. So NO balance-panel compare
.md is produced for this arm, as in the playpath arm.

## Metric review (carried — judged against this prereg as written)

Pre-registered metrics bind the run (§14). A miss is
DIAG-NO-GO, never re-scored against a friendlier metric
mid-run. If the metric proves wrong, it goes under "metric
review" in the evidence file and any revision applies to
the NEXT run.
