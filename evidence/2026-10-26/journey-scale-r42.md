# journey-scale r42 — THE BYSTANDER HOLD (2026-10-26, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261027T0017Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + tail); write 3→0 on completion.
**Base:** master@8ecaac395 (deepening r54) at run start. No sibling landed
mid-run, so no rebase was needed. Main tree verified clean at start; disk 29%.
**Arms (two, plus one game-code fix):**
1. **JOURNEY** — the leg itself. Driver `scripts/journey-scale-r42-20261026.js`
   (r41 driver, labels/EVIDIR only, control mode — no picker variant),
   analyzer `scripts/analyze-scale-r42-20261026.js` (r41 analyzer, labels
   only), policy `scripts/policies/scalecourt-nogate.js` UNCHANGED,
   seeds 85001–85004 (matched r30–r41), DAYCAP 180, death-aware stop,
   EVIDIR `evidence/2026-10-26/journey-scale-r42` (scratch dir, never
   r41's dir).
2. **REMOVAL** — r41's named next work. Recorder
   `scripts/policies/removalsite-diag.js` (wraps Game.removeWorldMonster
   after setupGame; logs day, id, seq, wave, tile, hp, lingering/titan,
   player distance, tb-active, fight-monster match, first game.js stack
   frame), driver `scripts/test-removalsite-r42.js` (r41 spawnfate driver
   + the recorder; sweep child filename fixed — the copy initially
   spawned the OLD driver, caught before any batch ran), analyzer
   `scripts/analyze-removal-r42-20261026.js` (reuses the driver's own
   classifyFate, never a second partition), seeds 73671–73678 (the
   wave4enc/spawnfate band), DAYCAP 180, EVIDIR
   `evidence/2026-10-26/journey-scale-r42-removal`.
3. **FIX** — the bystander hold (src/js/game.js startCombat, 15 lines).
   Proof test `scripts/test-journey-scale-r42-bystander.js` (before/after
   on seed 73675, temp dir, no repo writes).
**Pre-register:** `evidence/2026-10-26/journey-scale-r42-prereg.md` (written
before any sim; the fix decision was explicitly deferred to post-recorder
evidence, and that is what happened).
**Pilots:** journey 85001 first (day 181, pop 2/2, pantry 9,361, global,
lesser, arc 4, pilgrimages 4 — byte-identical to r41, gate passed), then
removal 73677 first (installed, 27 rows, partition fully true — and the
eulogy row was already in it, gate passed). Both batches then ran to
completion. One infrastructure incident mid-run: the removal sweep's
parent session vanished after 73675 (no summary, no process alive);
73676/73678 were resumed per-seed and the summary rebuilt from rows on
disk — resume-safe by design, no data lost.

## Pre-registered leg question
1. On the matched scale seeds, does the leg still reach regional→national
   and the table approach, and do villagers still read as people?
2. Where does each vanished wave-4 spawn go — fight-lift, bystander-lift,
   or ambient removal — with 73677's eulogy and 73675's gauntlet day as
   the named targets?

## Verdicts (binding — none re-scored)
- **JOURNEY-PARITY: panel-identical to r41 control.** All four seeds
  reproduce r41's outcome line exactly (85001 day 181 pop 2/2 pantry
  9,361 global lesser arc 4; 85002 day 180 pop 10/10 pantry 58,076
  regional arc 3 seat none; 85003 day 181 pop 3/3 pantry 1,055 regional
  lesser arc 4; 85004 day 181 pop 9/9 pantry 61,320 regional lesser
  arc 4). Pilgrimage counts match r41 per seed (4/77/7/12); pool drawn
  matches (20,747 / 0 / 39,269 / 0). The base movement changed nothing
  on this leg.
- **JOURNEY-PEOPLE: 7/8 transcripts meaningful, 1 circling (known
  picker artifact).** Full reads below; 0 senseless, 0 fabricated.
- **JOURNEY-TABLE: 3/4 seeds reach a lesser seat in-window** (85001,
  85003, 85004); 85002 regional, arc 3, seat none (opinion<10 blocker,
  same as r41). No village scattered; no seat entered (sitting is a
  commitment beyond the approach). Full seat still unreached (w5 0).
- **REMOVAL-COMPLETE: GO — 8/8 seeds fully partitioned, 0 unclassified
  removals.** Band totals reproduce r41 exactly: 33 wave-4 spawns
  (fought-both 4, alive-at-end 21, fought-field 3, vanished-near-player
  3, fought-tb 2). Every vanished spawn (3/3) has a removal row.
- **REMOVAL-73677: NAMED — ambient lost-sight, not a fight.** The eulogy
  (seq 32, seen once d120 at (5,2), minDist 0) was removed d121 at (5,2)
  with full HP 900, tb inactive, stack at game.js monsterTurn:22561 —
  the lostSight > 6 rule ("It lost your trail"). It is a designed
  despawn, not a bug — though a monster standing on the player tile
  losing the trail in one day is a design question worth a look, not a
  claim made here.
- **REMOVAL-BYSTANDER: CONFIRMED — and band-wide, not gauntlet-only.**
  73675's gauntlet day reproduces exactly: d145 at (4,4), sweeps_week
  s19 (hp 1) lifted during lockpick_raccoon, eater s28 (712 HP) during
  nevermore, eulogy s31 (675 HP) during speedbump_turtle — all three
  tb-bystander-lift rows at startCombat:33081, removed id never in the
  fight's ids. Across the band there are 15 bystander-lift rows on all
  8 seeds, every one at the player tile (4,4)/(4,3), every one during a
  fight against a different monster. ANY tb fight starting on an
  occupied tile ate a non-fighter — the mechanism is systemic.
- **FIX-PROOF: 6/6 checks pass on seed 73675 under the fix.**
  Day-145 bystander lifts 0 (was 3); seq 28 and seq 31 both fought-tb
  (were vanished-near-player) — the survivors later got fought
  properly; 21 tb-fight-lift rows still exist (normal lifting intact);
  fully partitioned. Cascade noted honestly: under the fix the seed
  grows 13 wave-4 spawns (9 alive-at-end, 4 fought-tb) vs 7 before (4
  alive, 2 vanished, 1 fought-tb) — surviving bystanders change the
  downstream trajectory; the count delta is reported, not celebrated,
  but its direction (more wave-4 monsters fought, zero vanished) is the
  encounter problem moving the right way.

## The fix (what changed, in plain words)
When a turn-based fight starts, the game used to pick up whatever monster
was standing on the player's tile and throw it away — even when the fight
was against a completely different monster (a contest wave, a trial, a
trap). If the player won, the bystander was never put back: a healthy
besieging monster simply ceased to exist, with no message and no record.
Now the game only picks up the tile monster when it IS the monster being
fought; anyone else stays standing on their tile, and the siege they
were part of goes on. Fights against the actual tile monster work
exactly as before (lift, fight, melt-or-restore rules untouched).

## Village assessment (plain words)
- **85001 — the village of two that reached the table.** Ends day 181
  with 2 living people, pantry 9,361, global rank, a lesser seat
  waiting, arc 4. Five villages known, all linked (1 primary-sub, 3
  covenant, 1 trade); pool drawn 20,747. Same village as r41, to the
  number.
- **85002 — the fat, stuck village.** Ends day 180 with 10 living
  people, pantry 58,076, regional rank, arc 3, no seat — blocked on
  opinion (four known villages below the bar). Nobody starved, nobody
  scattered; it simply never earned the approach.
- **85003 — the thin village that still got there.** Ends day 181 with
  3 living people, pantry 1,055, regional rank, a lesser seat waiting,
  arc 4. Seven villages known, pool drawn 39,269.
- **85004 — the comfortable village.** Ends day 181 with 9 living
  people, pantry 61,320, regional rank, a lesser seat waiting, arc 4.
  Nothing broke; it arrived latest and fattest.
- **Standing blank, again:** no seed grows by arrival. The roster only
  shrinks — the same arrivals-0 shape as r41. A village that reaches
  the table with 2 people is the leg's honest shape until arrivals exist.
- **Removal band side note:** seed 73676 (tableseat-nowait policy) ends
  with entered=1, won=1 — a table win exists on that policy band. It is
  a policy-band observation, not a journey-leg win claim.

## People check (all 8 transcripts read in full)
- 85001-d90 Irving (anxious baker, curious): treeline fear — "So it's
  not just me. Good. That's... good to know. Bad, but good." Real.
- 85001-d120 Irving (curious): "I dream about soup. Actual soup, with
  a spoon." Real.
- 85002-d90 Keisha (sardonic musician, curious): "Noted. Filing that
  under 'extremely useful.'" Voice matches temperament. Minor wart:
  the opener ends "...nobody here knows about? Told you." — a leaked
  fragment, same talk as r41, not a new break.
- 85002-d120 Keisha (curious): "Then it's not gone. Not really. Keep
  going back, anyway." Real.
- 85003-d90 Joshua (earnest arborist, seek_taken stage 1): THE talk of
  the run, again. He wants news of taken kin; the player commits to ask
  the System about the pods; "Even asking is more than the silence."
  A want, an engagement, a promise — the quality bar met outright.
- 85003-d120 Pamela (dry farmer, ask_favor stage 1): "I can't reach
  this properly. Could you clean it out for me? Please." → commit →
  "Careful with it. And — thank you." Short, but the want is named and
  committed.
- 85004-d90 Dorothy (anxious mechanic, curious): Columbus, Ohio, the
  street that keeps getting longer, waking tired "like I actually
  walked it." Real.
- 85004-d120 Dorothy (curious stage 0): THE wart, and a known one.
  more/react ×4 circling the restless thread ("I'm not built for
  staying", "I'd rather be moving toward maybe than sitting in
  certainly-not"). The thread is real and the lines are good, but the
  talk never takes the offered dlg:subject / dlg:doubt / dlg:invite —
  the control picker never takes them, exactly as r40 diagnosed, and
  r40 proved subject-first breaks the circle. Verdict: circling, not
  senseless; picker artifact, not a content gap.
- No fabricated shared history, no filler loops besides the one
  circling talk, no static menus. Betrayal accepts 0/8 (no betrayal
  subjects offered in this batch).

## Reachable / fun / winnable (leg 3)
- **Reachable:** YES for the approach — 3/4 seeds price a lesser seat
  in-window, voiced on all three. The full seat is NOT reached (w5 0
  everywhere); the wave-4 encounter side moved a little with the
  bystander hold (survivors now get fought instead of evaporating),
  but the full seat remains unreached on this band.
- **Fun:** YES with the known wart — the talks that land (Joshua's pods
  promise, Dorothy's Columbus dream) are the game at its best; the one
  circling talk is the control picker's, and the fix direction is
  already proven (r40 subject-first). The villages' thin end-states
  (2–3 people at the table) read as earned attrition, not as a bug —
  but they sharpen the arrivals blank.
- **Winnable:** PARTIAL — lesser seats are winnable in-window; the full
  seat is not, and this run removes one silent deletion mechanism from
  the encounter side while naming the remaining shape (monsters persist
  unencountered; arrivals 0). No win claimed.

## Telemetry check
`telemetry-check.js` against scale.json with metrics day, popAlive,
pantryKcal: "quiet (4 files, 3 metrics, no large deviations)". HONEST
CAVEAT (same standing gap as r37–r41): the metric paths do not resolve
in journey trust JSONs (the values live under `census`, not top-level)
and scale.json is not journey-shaped, so this quiet is vacuous, not a
verification. Baseline NOT rolled. A journey-shaped baseline is still
owed by a future run (contract area, not done here).

## Test suites
- Proof test `test-journey-scale-r42-bystander.js`: 6 PASS, 0 FAIL
  (day-145 bystander lifts 0, seq 28/31 fought-tb, 21 fight-lifts,
  fully partitioned).
- Removal summary: FATE-GO, 8/8 fully partitioned, band totals
  identical to r41 (33 spawns; 21 alive-at-end, 3 vanished-near-player
  — all 3 sited, 0 unclassified).
- Analyzer `analyze-scale-r42-20261026.js`: exit 0 on all 4 journey
  seeds; analyzer `analyze-removal-r42-20261026.js`: exit 0 on the band.
- node --check green on game.js, driver, analyzers, recorder, proof test.
- check.js --quick: 278 passed, 9 failed in 983s — the failing list is
  IDENTICAL to r41's standing set (hide-discovery,
  measurement-comparison, measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, parity-20261014, establishment-r20-fixes
  racks-voice gate). Zero new failures attributable to this run — it
  changed game.js startCombat only, and the combat-adjacent suites
  (mobile-combat-cadence was already failing pre-existing) show no new
  break. Full log: goal hidden_files journey-scale-r42-checkquick.log
  (kept out of the repo per the r41 pattern).

## Infrastructure notes (for the next run)
- Heartbeat loops die silently: both r42 loops were gone by 01:01 UTC
  (the first loop's parent session ended; the setsid loop died between
  its 00:45 and 00:55 writes for unknown reasons). Recovered by manual
  heartbeat + a fresh setsid loop with read-back verification.
- Heartbeat writes queue behind a sibling's register lock: a
  flesh-out-loop register (sim-finalloss-a) held REGISTRY.lock for
  minutes at 01:08–01:12, delaying my loop's write to 01:12:45 (11 min
  after the previous). The 540s loop cadence leaves little margin
  against a multi-minute lock hold when the 15-min staleness threshold
  is the tripwire — a shorter cadence (300s) would be safer.
- The sweep parent session can vanish without a trace (no process, no
  summary); the --one + --summary resume pattern is what saved the
  band — keep it.

## LANDING STATUS: BLOCKED — NOT MERGED (read this first on recovery)
**The work is DONE and PROVEN but NOT COMMITTED and NOT MERGED.**
Root cause: a container-wide filesystem fault — `fsync(2)` returns
EPERM on every path tried (/tmp and the worktree alike), while plain
writes without fsync succeed. Git fsyncs object files, index files and
ref updates, so EVERY git write fails: ~2,600 safe-commit attempts
over ~25 minutes (spaced, tight, and split-commit variants) all died
at the first index/object write with "Operation not permitted".
Disabling fsync to force the commit through was NOT attempted — that
would be overriding the safe-commit discipline, not fixing it.
**Preservation (verified 01:42 UTC):** all work sits uncommitted in
the registered worktree `~/workspace/worktrees/journey-scale`,
branch `journey-scale` (base 8ecaac395), status 12 lines, fix present
in src/js/game.js (15 insertions). The registry entry stays `active`
(never released as abandoned — the work is pending, not dropped);
the heartbeat loop was stopped, so the heartbeat will go stale, but
the reaper NEVER auto-removes dirty trees — the worktree is safe.
Rotation was NOT advanced (still 3) and the playtest lock was deleted,
so the next lane-A run must RECOVER this work, not replay the leg.
**Recovery (in order, when fsync recovers — prove it first with
`python3 -c "open('/tmp/x','w').write('x'); import os; fd=os.open('/tmp/x',os.O_RDONLY); os.fsync(fd)"` succeeding):**
1. `cd ~/workspace/worktrees/journey-scale && bash ~/workspace/the-scattering/scripts/worktree-heartbeat.sh journey-scale`
2. Commit with the saved list (74 files):
   `bash scripts/safe-commit.sh "journey-scale r42: bystander hold fix + removal-site measurement [needs-eyes]" -- $(cat ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-scale-r42-commit-list.txt | tr '\n' ' ')`
   then verify with `git show --stat HEAD` (74 files, message as above).
3. Master moved during the run (now 44179091d, scale-onramp round
   2317) — rebase the branch onto the new master, re-run the proof
   test (`node scripts/test-journey-scale-r42-bystander.js`), then
   `git merge --ff-only journey-scale` in the main tree, release,
   remove the worktree, and reap — per the loop's normal steps 8–10.
4. Only then write rotation 3→0 and report "merged locally, pending
   ship". Do NOT push; the ship loop owns pushes.
**What is NOT blocked:** the measurements, the fix, the proof test and
check-quick all completed before the fault (see above). Nothing in
this note's verdicts depends on the landing.

## Metric review
- JOURNEY-PARITY, JOURNEY-PEOPLE, REMOVAL-COMPLETE, REMOVAL-73677 and
  REMOVAL-BYSTANDER all GO on their pre-registered bars; no metric
  revision proposed. The removal-site metric did its job: it turned
  r41's two open items into one named designed despawn (lost-sight)
  and one confirmed systemic bug with a fix.
- The telemetry-check shape gap (vacuous quiet) belongs under metric
  review for the NEXT run: either seed a journey-shaped baseline from
  trust JSONs (contract area — needs a baseline owner, not a silent
  roll) or drop the step for journey runs and say so. This run did
  neither silently: it ran the check, reported it vacuous, and did not
  roll.
- Next run's pre-registration should include: (a) a post-fix removal
  band re-run (does the bystander class go to zero band-wide, not just
  on 73675?); (b) whether surviving lingerers change siege/crisis
  outcomes downstream (the 73675 cascade grew wave-4 spawns 7→13).
