# Journey crisis r278 — PREREGISTRATION (Lane B, leg 6)

**Status: FROZEN at worktree registration, before play.**

**Run:** `playtest-loop-2-20261124T0200Z`, scheduled 20:00 CST Mon
2026-11-23 / 02:00Z Tue 2026-11-24. **Base:** master `7344d8a56` at run
start (landing r157 adoption closeout; includes crisis r274).
**Rotation-b read 6 at run start; this run writes 7 at closeout.**
**Number:** r278 — no r278 exists in evidence/ or memory (grep-verified
at run start); the shared counter's latest is r277 (Lane B social,
merged `f0398bba6`). r274 was the last crisis run.

**Leg question (binding):** r274 left three residual FIGHT-STALL
mechanisms, each with a named lever, plus one C3b false settlement.
This run builds all four fixes, proves each, and re-panels before/after
on identical seeds plus a fresh band.

1. **SEALED POCKET (r274 residual 1, seed 14600 d78):** player (3,3),
   monster `spool` adjacent (distance 1, in range), every edge path
   null; the policy flees on low HP before considering the strike.
   Lever: when the monster is in range and the pocket is sealed (no
   affordable edge tile), strike instead of fleeing.
2. **SEALED ARENA (r274 residual 2, seed 14601 d100):** player (1,0),
   `arenaContest: true` — the barrier holds, the fight cannot end by
   leaving; the flee fires 11×, moves to the edge fine, the barrier
   exit is consumed but the fight does NOT end. Lever: in a sealed
   arena the flee must not fire — close and fight instead.
3. **NO AFFORDABLE EDGE (r274 residual 3, seed 14603 d127, fresh):**
   player (7,4) moveLeft 1, cheapest edge costs 4 — every turn, the
   fighter stays slowed, the flee falls back to the old target and
   fails honestly in place. Lever: partial-progress flee — when no
   edge tile is affordable, target the farthest tile along the
   cheapest edge's path that fits moveLeft, so the fighter walks
   toward the exit turn by turn instead of failing in place.
4. **C3b FALSE SETTLEMENT (r274 fresh band, seed 14603 d84, Raul
   Schumacher):** favor `water_haul`, state `broken` ("This creek
   request is closed"); the NPC says the promise is dead, the recap
   still says "Still on that debt", yet the silence-ending closer
   declares "Good — that debt, settled." Mechanism (r278 diagnosis):
   the closer gate in `convoCloseLine` anchors on the sitting's
   favor (`c.want.favor`) or a kind-label match — a repay sitting
   labels the debt 'that debt', not 'that water haul', and a repay
   want carries no `.favor`, so the gate never sees the broken favor.
   Lever: gate the "settled" closer on the ledger favor whenever the
   thread label is 'that debt' (the repay label IS the favor's debt).

## Run-state handoff (r278, written at run start)

- Lock: NO `playtest-loop-2.lock` existed at run start. Own lock created
  01:58:28Z, run_id `playtest-loop-2-20261124T0200Z`. Previous Lane B run
  (r277 social) finished and merged (`f0398bba6`); rotation-b advanced
  5→6 by the r277 finisher. No `journey2-*` worktree existed; no live
  Lane B coordinator.
- Pre-flight: main tree clean at 01:55Z (`git status --short` empty).
  Disk 50%. `git pull --ff-only`: already up to date (tip
  `7344d8a56`). `worktree-reap.sh`: exit 0, removed nothing, 14/16
  active; LOUD dirty trees are other owners' (flesh-out loops, Lane A
  journey-landing), never auto-removed.
- Registration: `worktree-register.sh journey2-crisis` landed (took
  ~7 min under load; registry-lock jam noted in the memory log, Loop A
  registration holding it). Worktree verified clean at `7344d8a56`
  (an early `git status` during the still-running checkout showed
  phantom deletions — the checkout was mid-flight; re-check after
  completion: status empty, `git diff HEAD` empty, all files present).
  Heartbeat loop `journey2-crisis-hbloop-r278.sh` started (setsid
  nohup, 10-min cycle); first loop cycle hit the same registry-lock
  jam ("registry lock held > 120s — heartbeat skipped"), manual
  heartbeat re-run and landed. The jam is the known ongoing registry
  contention, not a dead run.
- Canon read: `git log 70120c554..7344d8a56` on CANON.md, DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md,
  DIRECTIVES.md is EMPTY — r274's canon read stands unchanged.
- Rotation: reads 6 (crisis). This run plays crisis and writes 7.
- Flap: no flap window observed during this run's pre-flight
  (writes landing; last reported window 23 cleared ~00:57Z).

## Base movement since r274's panel base (70120c554 -> 7344d8a56)

- r274's instruments and fixes ARE on master (DOWNEDTWICE dedup in
  comms.js, nearest-affordable-edge flee in oracleV2.js, STALL-GEOMETRY
  probe, driver ctx dump).
- Net movement includes Lane A landing r157 (M-PR1 residual fix in
  convo-wants.js), Lane B social r277 (outing driver fix), the 2130Z
  flesh-out adoption (cellgate/rearm/gatehorizon, no src/js), and the
  3df28e069 ship bump. No gate, threshold, price, or bar changed by
  this run. No game fix is built in this run except FIX 4 (the closer
  gate in conversation.js); FIX 1–3 are policy-side (oracleV2.js, the
  bot that plays as a competent player) — each with its proof test,
  before/after on identical seeds.

## Instruments built this run

- **Driver** `scripts/journey-crisis-r278-delayed-20261124.js` (r274
  driver verbatim except: header, EVID 2026-11-24, ORIGINS keys
  extended to 14599–14607, transcript prefix r278). **Analyzer**
  `scripts/analyze-crisis-r278-delayed-20261124.js` (r274 analyzer
  verbatim except: header, EVID 2026-11-24, file regex r278,
  ORACLE-CTX section gains the new `fledBlocked_*` counters).
- **Panel script** `scripts/journey-crisis-r278-panel-20261124.sh`:
  after-panel seeds 14599–14604 into
  `hidden_files/evidence/2026-11-24/` (stdout captured straight to
  `journey-crisis-r278-delayed-seed<SEED>.json`, per the r264 method
  note), analyzer on that dir; then fresh-band seeds 14605–14607
  into `hidden_files/evidence/2026-11-24/fresh/`, analyzer on that
  dir. Never pipe the analyzer through head (r264 method note).

## Pre-registered metrics (binding, §14)

- **FIGHT-STALL-FIGHT**: fight-source stall-days (≥10 failed
  `tbPlayerMove` in a day), bar 0 — judged separately on the
  after-panel (same seeds 14599–14604; r274 AFTER was 2 + 1 fresh)
  and on the fresh band (14605–14607; no BEFORE).
- **FIGHT-STALL-TRAVEL**: travel-source stall-days (≥10 failed
  `beginPathWalk` in a day), bar 0 (r274: 0).
- **DOWNEDTWICE**: 0 duplicate "goes down" groups (r274: GO, 0).
- **C3b-TRANSCRIPT**: 0 false settlements (r274: GO after-panel, 1
  false fresh — the Raul case this run fixes).
- **DRY**: 0 dry lines (carried; r274 GO). **WRAP**: 0 unmarked endings
  (carried; r274 GO). **M12**: 0 same-reason circle repeats (carried;
  r274 GO).
- **ORACLE-CTX secondary** (r274 review item 4): `fled_unreachable`
  is the FIX 2 signal (r274: 618 → 28); the new `fledBlocked_*`
  counters are the FIX 1/2 signal — a blocked flee must show as a
  strike/close on the same turn, never as a burned turn.
- **People check**: all transcripts read in full; fabricHits 0.
- Interesting iff: the after-panel clears FIGHT-STALL on identical
  seeds, OR any residual stall day names a new fixable mechanism, OR
  the C3b false settlement clears, OR any new fixable defect in the
  crisis band.

## Policy (frozen)

- After-panel: seeds 14599–14604 (same-seed before/after; r274 AFTER
  on these seeds is the BEFORE — these seeds are NOT a fresh
  measurement, they are the comparison instrument) on FIXED code,
  DAYCAP=150, death-aware stop (+10d tail).
- Fresh band: seeds 14605–14607 on FIXED code, same policy.
  Freshness (local_seed_band_freshness skill): exact-token grep over
  ALL `evidence/**/*prereg.md` finds NO mention of 14605–14607;
  exact-token grep over ALL of `evidence/` finds only incidental
  numeric values inside per-seed data tables (e.g. kcal counts), never
  a seed reservation; `evidence/2026-11-06/drive-practice-contaminated-baseline`
  contains no 14605–14609 token. ORIGINS: 14599 Seattle, 14600 Boston,
  14601 Austin, 14602 Chicago, 14603 Phoenix, 14604 Denver (same as
  r274, for the same-seed comparison); 14605 Portland, 14606 Atlanta,
  14607 Minneapolis (new cities).
- Gating freeze stands. Perception law stands. Combat-play gate stands.
  No toughness/gear/ability tuning. No gate, threshold, price, or bar
  changed — only FIX 1–4 and instruments.

## Metric review (carried from r274 + new)

1. The bar counts failed closes, not unresolved fights (carried from
   r264 item 7) — FIX 1–3 must end or disengage the fight, and the
   after-panel must show the fight resolving (fewer turns burned /
   fight over), not just fewer failed calls. The STUCK-TRACE +
   ORACLE-CTX sections are the check.
2. C3b's "true" bucket needs the adjudication step every run — the
   after-panel's 4 true hits were genuine and the fresh band's 1 was
   false. The bucket alone cannot tell them apart; the sitting read
   can. Keep the adjudication.
3. ORACLE-CTX's `fled_unreachable` is the cleanest FIX 2 signal
   (618 → 28). This run pre-registers it as the secondary metric for
   the three residual levers, plus the new `fledBlocked_*` counters.
4. The write-flap phrasing in the standing record is the O_EXCL
   discriminator (r274, strace proof) — "fresh-file writes fail" is
   too broad. No flap window observed this run's pre-flight.
5. PS4 arm not run this round (time-boxed pilot); the dir-hygiene item
   (clean `ps4/` between runs) stands for the next run that does.
6. Telemetry units still open: `playerFights` / `latelyDefenseCount`
   keys absent from the per-seed JSONs (r261 review 5, carried).
7. Census corpses omit scholar deaths (r257 review, carried).
8. R58 refused-sortie book check reads a field the driver never
   populates (r262 review 8, carried).
9. MARCH-REFUSAL and TRAIL 3-PRESS have no dedicated analyzer section
   on this leg — judged by the people check only (r262 review 10).
10. **NEW — the r274 closer gate misses the repay label:** the
    sitting-favor anchor (r263) requires `c.want.favor`, which a repay
    want never carries, and the kind-label match fails because the
    repay label is 'that debt', not the favor's kind label. FIX 4
    anchors on the ledger favor whenever the thread label is
    'that debt'.
