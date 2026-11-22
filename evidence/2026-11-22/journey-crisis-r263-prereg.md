# Journey crisis r263 — PREREGISTRATION (Lane B, leg 6)

**Status: FROZEN. This run (`playtest-loop-2-20261122T0300Z`, scheduled Sat
2026-11-21 21:00 CST / 03:00Z) plays crisis (6) on seeds 14596–14598 per
this prereg. Base master `4266e6cce`. Rotation-b read 6 at run start; this
run writes 7 at closeout. The r262 panel (seeds 14591–14595, base
`237ad3c53`) went NO-GO on two binding bars — FIGHT-STALL (6 stall-days)
and C3b (1 false settlement, regression of the r240 fix) — with fix items
named in its run note. This run is the fix round for both.**

## Run-state handoff (r263, written at run start)

- Lock: NO `playtest-loop-2.lock` existed at run start. Own lock created
  02:57:27Z, run_id `playtest-loop-2-20261122T0300Z`.
- Pre-flight: main tree clean at 02:55Z (`git status --short` empty).
  Disk 48%. `git pull --ff-only`: already up to date (tip `fc915f94d`).
  `worktree-reap.sh`: SKIP — registry lock held by another reaper run
  (consecutive skips: 1); no worktrees reaped, no LOUD lines.
- Registration: `bash scripts/worktree-register.sh journey2-crisis`
  slow (registry flock held by the flesh-out loop's `sim-searvoice-a`
  register since 02:53Z; `git worktree add` + `git reset --hard`
  grinding from 03:05Z). Master moved DURING registration:
  `fc915f94d` → `4266e6cce` (sibling merged sim-doorflee2-b to master);
  the worktree base is the new tip `4266e6cce`. Main tree verified clean
  at the new tip. Heartbeat immediately after registration; a 5-min
  hbloop runs detached (`setsid nohup`).
- Rotation: reads 6 (crisis). The social r265 adoption wrote 5→6; this
  run plays crisis and writes 7.
- Canon read: CANON.md + DISEASES.md read in full by r247/r251/r253;
  `git log 237ad3c53..fc915f94d` on CANON.md, DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md,
  DIRECTIVES.md is EMPTY — r247's canon read stands unchanged. The
  4266e6cce doorflee2-b merge touches no canon doc (verified by
  `git show --stat 4266e6cce` in the worktree before play).

## Base movement since r262's panel base (237ad3c53 -> 4266e6cce) — classified

Net src diff (excluding evidence/tests): `betrayal.js`, `build.js`,
`conversation.js` (+39), `convo-wants.js` (+19), `game.js` (+108),
`villager-brain.js`, `win-plan.js`. Classified in the run note from the
per-file diff; the live surface for this leg is the conversation.js /
convo-wants.js change (r152 settled-reask + social r265 fixes) and the
game.js change (door-flee / DODGE-ARTICLE follow-ups). No gate,
threshold, price, or bar changed by this run except the two fixes below
(both in the crisis leg's own fix items).

## Leg question (binding)

Do the two r262 fix items land and hold in the wild?

1. **FIGHT-STALL** — the unreachable-flee stuck counter is keyed to the
   monster + day instead of the fight object
   (`scripts/policies/oracleV2.js`), so spool-replay / influencer-round
   fight-object churn no longer zeroes it before 3. Proof test adds the
   churn case the r262 fixture lacked (metric review 11).
2. **C3b** — the settled-closer (`convoCloseLine`, `src/js/conversation.js`)
   is gated on the SITTING's favor state, not only on the ledger-favor
   label match: a `want` thread whose sitting carries a favor that is not
   fulfilled/thanked never earns "Good — …, settled." The r262 false
   settlement (14594 d30, Fiona Wen, broken heal_help, thread labeled
   'that debt') slipped the r201 label-match gate.

## Pre-registered metrics (binding, §14)

- **FIGHT-STALL**: stall-days (≥10 "No path there." in a day), bar 0.
  Supporting: `fled_unreachable` count panel-wide (r262: 0).
- **C3b-TRANSCRIPT**: settledLines / TRUE false settlements, bar 0 false
  settlements. Adjudicated from transcripts + favor state + pantryPer.
- **DOWNEDTWICE**: 'goes down' repeats for one ally in one fight, bar 0.
- **M12**: same-reason circles repeats in one sitting, bar 0.
- **WRAP**: unmarked conversation endings, bar 0.
- **People check**: all transcripts read in full; fabricHits 0.
- Interesting iff: fled_unreachable ≥1 AND stall-days 0 (fix 1 fires in
  the wild), OR a new stall mechanism appears, OR a C3b false settlement
  recurs (fix 2 fails), OR any new fixable defect in the crisis band.

## Policy (frozen)

- Driver: `scripts/journey-crisis-r262-delayed-20261121.js` UNCHANGED,
  analyzer `scripts/analyze-crisis-r262-delayed-20261121.js` UNCHANGED
  (r262 instrument; FIGHT-STALL + C3b-TRANSCRIPT sections as-is).
  DAYCAP=150, death-aware stop (+10d tail). Seeds FRESH 14596–14598
  (pilot of 3; expand only if the pilot shows an interesting shape per
  §9 PILOT FIRST).
- Gating freeze stands. Perception law stands. Combat-play gate stands.
  No toughness/gear/ability tuning. No gate, threshold, price, or bar
  changed — only the two named fixes above.

## Metric review (carried from r262)

1. Wren-note "5x+" bar miscalibrated (r257, carried).
2. C3b instrument searches the wrong corpus (r257, carried) — the
   C3b-TRANSCRIPT section reads transcripts; TRUE hits need run-note
   adjudication with pantryPer from the per-seed JSONs.
3. Link-accept ECHO is an instrument gap (r257, carried).
4. Telemetry units still open: `playerFights` / `latelyDefenseCount`
   keys absent from the per-seed JSONs (r261 review 5, carried).
5. Census corpses omit scholar deaths (r257 review, carried).
6. PS4 arm wrote no transcripts in r262 — this run does NOT run a PS4
   side-arm (time-boxed pilot); the dir-hygiene item (clean `ps4/`
   between runs) stands for the next run that does.
7. FIGHT-STALL's bar counts failed closes, not unresolved fights (r262
   review 7, carried).
8. R58 refused-sortie book check reads a field the driver never
   populates (r262 review 8, carried).
9. MARCH-REFUSAL and TRAIL 3-PRESS have no dedicated analyzer section
   on this leg — judged by the people check only (r262 review 10).
10. The unreachable-flee proof fixture needs a churn case (r262 review
    11) — ADDED this run (fix 1 proof test, section 3).
