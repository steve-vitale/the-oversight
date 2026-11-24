# Journey crisis r287 — PREREGISTRATION (Lane B, leg 6) — DRAFT, frozen at worktree registration

**Status: DRAFT — freeze at worktree registration, before play.**

**Run:** `playtest-loop2-20261124T2200Z`, scheduled 16:00 CST Tue 2026-11-24 / 22:00Z.
Adoption of the 2000Z + 2100Z occurrences, both blocked on write-flap window 36;
this occurrence registered the worktree 22:08:04Z (heartbeat 22:17:56Z) after the
flap cleared. Prereg frozen in draft at 2000Z; copied verbatim except this header.
**Base:** master 4c1bb482e at registration (sim-ammosupply-a evidence-only landing;
r278 landed as b75f43fe3 + 0ebfffe1b + d94ddaa22; r283 landed as 838f3a380 + 45e50d54f).
**Rotation-b read 6 at run start; this run writes 7 at closeout.**
**Number:** r287 — no r287 run note exists in evidence/ or memory (grep-verified
at run start; only incidental "r287" tokens inside 2026-11-02 data files).
Shared counter's latest is r286 (Lane A deepening, in flight). r278 was the
last crisis run (NO-GO, panel complete, merged).

## Stale-lock recovery + r283 release (run-state handoff)

- Lock `playtest-loop2-20261124T1900Z` (created 18:57:28Z) held by the dead
  1900Z run: no registered tree, no heartbeat, no live Lane B process, no
  live agent owned by `oversight-playtest-loop-2` (subagent list: only
  flesh-out workers live; the one live `ps` entry is Lane A's
  journey-deepening registration, WT_RUN_ID=playtest-20261124T1857Z, a
  different job). The 1900Z run had already verified + merged r283
  (45e50d54f on master, proofs re-run green) and held the lock deliberately
  so the next run would release the tree. Lock deleted after run_id match
  (same call); new lock `playtest-loop2-20261124T2000Z` written 20:01:22Z.
- r283 release STILL OWED at prereg time: `worktree-release.sh
  journey2-social merged` failed twice on write-flap EPERM (registry
  atomic write refused ~20:0xZ; REGISTRY.lock open refused). Worktree +
  branch `journey2-social` still exist; registry heartbeat 18:05:15Z
  (reaper margin ~4h, to ~22:05Z). The tree is MERGED and CLEAN (status
  empty, HEAD 45e50d54f on master) — reaper removal loses nothing. Retry
  the release when the flap clears; do NOT re-merge or re-run the gate.
- Write flap ACTIVE during this run's pre-flight (windows from ~20:0xZ;
  probes OK 19:57Z/20:01Z, then FAIL from 20:15Z). Registration, pull,
  and release all refused on fresh-file writes at various points. Per the
  flap skill: probe before every write that matters, wait for clears,
  never hammer. All repo writes in this run go through the registered
  worktree once registration lands.

## Pre-flight (at run start)

- Main tree clean (`git status --short` empty). Disk 49%.
  `git pull --ff-only`: REFUSED by the flap (`.git/FETCH_HEAD` EPERM) —
  retry when clear; master HEAD 6d841a318 (19:50:48Z, sim-instrument-a).
- `worktree-reap.sh`: (owed — run when the flap clears; registry lock
  jammed by live sibling registrations for much of the day).
- Canon read: `git log 7344d8a56..HEAD` on CANON.md, DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md,
  DIRECTIVES.md is EMPTY — r278's canon read stands unchanged.
- Rotation: reads 6 (crisis). This run plays crisis and writes 7.

## Leg question (binding)

r278 landed four fixes and the named residual days went clean (14600 d78,
14601 d100: 0 failed calls), but the stall count moved 2→3/4 via NEW days
on different fights, all six read in full. This run builds r278's named
next levers for the two residual mechanisms and re-panels before/after on
identical seeds plus a fresh band:

1. **MECHANISM A — already standing on the edge tile (14600 d43, 14601 d52,
   14603 d83, 14606 d108):** player ON an edge tile ((0,1)/(3,0)/(0,4)/
   (2,8)), moveLeft 0 (d43/d52/d83) or 3 (d108), monster far (spool (7,5)
   hp 325 / congregation (3,7) hp 900 / buffering (6,5) hp 193 /
   influencer (3,2) hp 850). The flee's cheapest path is length 1 (the
   tile it stands on), so FIX 3's partial-progress branch never engages
   and the flee falls to the old target — its own tile — failing 236/
   236/30/235 times. Root cause, established this run from the d43
   evidence (seed 14600 JSON + sayLines): the opening pushThrough DOES
   fire and FAILS — "You hurl yourself at the barrier — no escape that
   way" (travelTo blockage on the far side) — and the flee then burns
   the turn pathing to its own tile. The spool replays the player's
   WAITs and holds still; the fight dissolves at the day boundary
   ("You camp wild tonight"), the scholar survives, the day is burned.
   Lever L1 (oracleV2 flee): after the opening pushThrough, if the
   fight is still live and the player is on an edge tile, NEVER path
   to the player's own tile. If moveLeft > 0, step along the edge
   toward a different edge tile whose outward world direction is
   crossable; if moveLeft == 0, WAIT — end the turn with no move
   attempt (recorded, so the panel sees it). The wait lets the
   monster act and the slow lift; the fight dissolves at the boundary
   either way, but without 100+ failed calls.
2. **MECHANISM B — sealed pocket, monster out of range (14600 d73,
   14606 d104, + d108 combined):** all edge paths null; player (4,7)
   moveLeft 3; monster 2 away (influencer hp 696 / eulogy hp 554) —
   outside weapon range 1, so FIX 1's pocket gate never engages; the
   close path (v2Fight ~587) `findPath` returns null, 22/11 fails.
   Lever L2 (oracleV2 close path): when the close AND the flee both
   fail to move/exit the player for consecutive turns, WAIT instead
   of re-attempting — bounded retries (the monster may close in; the
   strike path runs naturally when it does). The wait is recorded
   (waitedClose) and the fight must still resolve (strike / flee /
   day-boundary dissolve), not just fail quieter — metric review
   item 1 stands.
3. **INSTRUMENT GAP (r278, owed):** the driver's `mergePolicyCtx`
   sums a FIXED key list that does not include `fledBlocked_*` or
   `altCloses` — the r278 secondary signal lived only in stuckTrace.
   This run adds `fledBlocked`, `fledBlocked_*`, `altCloses`, and the
   new `waitedEdge` / `waitedClose` counters to the key list (driver
   change, zero game impact). The analyzer already reads
   `fledBlocked_*` from oracleCtx (r278 analyzer §ORACLE-CTX).
4. **C3b — REPORT-ONLY this run (no fix):** the r278 adjudication
   named three gaps (mid-sitting dlg:cant settle lines aren't
   convoCloseLine; the 'what's been happening' label misses FIX 4's
   anchor; the recap reads the thread label, not the favor state).
   Each is a delicate conversation.js change with its own proof
   shape; the fight levers are the player-facing pain (whole days
   burned) and take this run's budget. The analyzer adjudicates C3b
   on the new panel; confirmed false settlements stand as the next
   run's levers. The C3b bar (0) still judges the run.

## Instruments built this run

- **Driver** `scripts/journey-crisis-r287-delayed-20261124.js` (r278
  driver verbatim except: header, EVID 2026-11-24, ORIGINS keys
  extended to 14599–14610, transcript prefix r287, mergePolicyCtx
  key list extended per §3 above).
- **Analyzer** `scripts/analyze-crisis-r287-delayed-20261124.js`
  (r278 analyzer verbatim except: header, EVID 2026-11-24, file
  regex r287).
- **Panel script** `scripts/journey-crisis-r287-panel-20261124.sh`:
  pilot seeds 14599–14601 into `hidden_files/evidence/2026-11-24/`
  (stdout captured straight to
  `journey-crisis-r287-delayed-seed<SEED>.json`, per the r264 method
  note), analyzer on that dir; then after-panel seeds 14599–14604 +
  fresh-band seeds 14608–14610. Never pipe the analyzer through head
  (r264 method note).

## Pre-registered metrics (binding, §14)

- **FIGHT-STALL-FIGHT**: fight-source stall-days (≥10 failed
  `tbPlayerMove` in a day, R264 split — the stricter instrument per
  r278 metric review item 8; R262 line-count kept as cross-check),
  bar 0 — judged separately on the pilot (14599–14601), the
  after-panel (same seeds 14599–14604; r278 AFTER is the BEFORE) and
  the fresh band (14608–14610; no BEFORE).
- **FIGHT-STALL-TRAVEL**: travel-source stall-days, bar 0 (r278: 0).
- **DOWNEDTWICE**: 0 duplicate "goes down" groups (r278: GO, 0).
- **C3b-TRANSCRIPT**: 0 false settlements — REPORT-ONLY adjudication
  (see §4 above); the bar still judges the run, the fix is the next
  run's.
- **DRY**: 0 dry lines (carried; r278 GO). **WRAP**: 0 unmarked endings
  (carried; r278 GO). **M12**: 0 same-reason circle repeats (carried;
  r278 GO).
- **ORACLE-CTX secondary**: stall-days + `fledBlocked_*` (now in
  oracleCtx) + `waitedEdge` / `waitedClose` — a wait must show as a
  strike/flee/dissolve resolution in stuckTrace + sayLines, never as
  a quieter stall (metric review item 1).
- **People check**: all transcripts read in full; fabricHits 0.
- Interesting iff: the pilot clears the named stall days, OR any
  residual stall day names a new fixable mechanism, OR any new
  fixable defect in the crisis band.

## Policy (frozen)

- Pilot: seeds 14599–14601 on FIXED code, DAYCAP=150, death-aware
  stop (+10d tail). Expand to the full after-panel + fresh band only
  if the pilot clears the named days (14600 d43/d73, 14601 d52).
- After-panel: seeds 14599–14604 (same-seed before/after; r278 AFTER
  on these seeds is the BEFORE — these seeds are NOT a fresh
  measurement, they are the comparison instrument) on FIXED code,
  DAYCAP=150, death-aware stop (+10d tail).
- Fresh band: seeds 14608–14610 on FIXED code, same policy.
  Freshness (local_seed_band_freshness skill): exact-token grep over
  ALL `evidence/**/*prereg.md` finds NO reservation of 14608–14610
  (only the r278 prereg's line 143 stating its own check range
  "contains no 14605–14609 token"); exact-token grep over ALL of
  `evidence/` finds only incidental numeric values inside October
  sweep data tables (perseed-holdloss2, bearercombat, fictiongate,
  crumbguard, aidfeastint), never a seed reservation; the
  `evidence/2026-11-06/drive-practice-contaminated-baseline` dir
  contains no 14608–14610 token. ORIGINS: 14599 Seattle, 14600
  Boston, 14601 Austin, 14602 Chicago, 14603 Phoenix, 14604 Denver
  (same as r278, for the same-seed comparison); 14608 Portland,
  14609 Atlanta, 14610 Minneapolis (new cities).
- Gating freeze stands. Perception law stands. Combat-play gate stands.
  No toughness/gear/ability tuning. No gate, threshold, price, or bar
  changed — only L1, L2, and instruments. No src/js change this run
  (L1/L2 are policy-side, oracleV2.js; C3b is report-only).

## Metric review (carried from r278 + new)

1. The bar counts failed closes, not unresolved fights (carried from
   r264 item 7) — L1/L2 must end or disengage the fight, and the
   panel must show the fight resolving (fewer turns burned / fight
   over), not just fewer failed calls. STUCK-TRACE + ORACLE-CTX
   (incl. the new `waited*` counters) are the check.
2. C3b's "true" bucket needs the adjudication step every run — keep it.
3. `fled_unreachable` retired as a fix signal (r278 item 9): it counts
   working partial-progress flees too. Judge the secondary on
   stall-days + `fledBlocked_*` (now in oracleCtx) + `waited*`.
4. The analyzer crashes on a partial panel dir (empty per-seed JSON)
   — the skip-empty guard proposed in r278 item 6 is still owed.
5. R262 and R264 disagree (5 lines vs 30 failed calls on 14603 d83)
   — judge FIGHT-STALL on the R264 split, keep R262 as cross-check.
6. Census corpses omit scholar deaths (r257 review, carried).
7. R58 refused-sortie book check reads a field the driver never
   populates (r262 review 8, carried).
8. MARCH-REFUSAL and TRAIL 3-PRESS have no dedicated analyzer section
   on this leg — judged by the people check only (r262 review 10).
9. Telemetry units still open: `playerFights` / `latelyDefenseCount`
   keys absent from the per-seed JSONs (r261 review 5, carried).
10. **NEW — the game-side mutual-stall disengage is the long-term
    fix for mechanism B:** if neither side can reach the other for N
    turns, dissolve the fight with honest narration instead of
    burning the day. Named in the r274 prereg as FIX 2's alternate
    shape; NOT built this run (src/js/game.js change, own proof +
    gate). The policy-side wait (L2) is the stopgap; the disengage
    ends the day early where the wait only quiets it.
11. **NEW — the flee's opening pushThrough return is unread:** 
    tbBarrierExit returns true for "consumed the push attempt"
    (sealed / world edge / blockage) as well as for a real exit, so
    the policy cannot tell an exit from a refusal without checking
    `Game.tbfight.over`. L1 checks the fight state, not the return
    value. A game-side split (exit vs refused as distinct returns)
    would be cleaner; not this run.
