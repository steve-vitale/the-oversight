# journey-scale r52 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261029T0745Z (scheduled 07:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 on completion.
**Base:** master@a6fa0710c at worktree creation (sibling merged
build-pickdepart into master during registration; worktree created from
the new tip — verified by reflog + rev-parse, not assumed).
**No src/js change planned at pre-register time:** measurement first
(r43–r51 discipline). A game-code fix is decided ONLY after evidence
confirms a mechanism, and only lands with its own proof test.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work in this run;
the driver reads only what the engine exposes to the policy, as before.

## Standing context (read before scoring)
- r51 (scale reference for this run): mechanical PARITY vs r50 except one
  narration loss. 85001: day 111, over=true, pop 0/0, pantry 0, rank
  regional, nationalDay 99, globalDay 104, seat lesser, arc 4, maxWave 4,
  pilgrimages 5, firstCourt 98, leaguePool 965. Covenant trusts 24/19/14.
  85003: day 181, over=false, pop 7/7, pantry 46,089, rank global,
  nationalDay 142, globalDay 143, seat lesser, arc 4, maxWave 3,
  pilgrimages 8, firstCourt 141, leaguePool 32,822. Covenant trusts
  64/70/56. Both seeds lesser seat, arc 4, priced wait, full seat
  unreached (w5 0). The one r50→r51 loss: the barrier refusal line
  (`Not mid-fight — the barrier is the way out.`) — 4 deletions on
  85001, 2 on 85003, zero other diffs. Mechanism UNPINNED at r51 close;
  r51's follow-up for the next scale run is exactly this run's Q2.

## Net src/js drift since r51's PLAYED base (b1f7edbca..a6fa0710c), verified by diff before any seed ran
Mechanisms that COULD move the scale band:
- fix-all armor LIVE (9c650f840 + 062e07a7a): craft live-enabled + pile
  draw, bark inflow widened 15→30% (villager-build.js, storage.js), and
  up to three staying bark wearers seeded at village creation (game.js
  +93). This is the ONLY game-code drift in the window that touches
  fight survival on the scale band — bearer deaths in wild/stranger
  fights are the scale band's attrition, and armor changes exactly that.
  Any census move this run must be pinned to armor (craft lines in
  capture, wearer survival in the death log), never to generic drift.
- Version bump (c3c8a2718) + build.js stamp only.
Everything else in the window is evidence/tooling/preregs (hunthold
instruments, deepening r64, crisis r66, social r65) — zero src/js.

## Leg questions (binding)
1. **SCALE-BASE-MOVE-R52:** pilot seeds 85001 + 85003, r51 driver with
   labels/EVIDIR only → new driver `scripts/journey-scale-r52-20261029.js`
   + compare `scripts/journey-scale-r52-compare.js` (r52 vs r51).
   Interesting = ANY census scalar move (day, pop, pantry, rank, seat,
   arc, maxWave, pilgrimages, firstCourt, leaguePool, covenant trusts)
   or any death-log change. Per r51 discipline, the remaining r43 seeds
   (85002, 85004) are SKIPPED if the pilot pair bounds the move; breadth
   burns a run that should go to mechanism pinning, not sweeping.
   A move is ARMOR only if armor capture lines and/or wearer death-log
   changes accompany it; otherwise it is reported as unexplained drift
   and NOT attributed.
2. **BARRIER-LINE-PIN:** driver-only instrument, both pilot seeds: wrap
   `Game.sayOncePerFight` and log EVERY call — day, message, inCombat()
   at call time, tbfight present/over, and caller stack. Written to
   `journey-scale-r52-barrier-<seed>.txt`. Verdict rules, fixed now:
   - Zero barrier calls + zero capture lines → call sites never reached
     in combat this run (consistent with the r51 hypothesis: policy walk
     helpers guard `!tbfight`, so the guarded verbs are never attempted
     mid-fight; the r50 lines came from a call path that no longer
     lands). That ENDS the pin: the line's absence is explained by
     no-attempt, not by a broken guard.
   - Barrier calls present but capture lacks the line → check per-fight
     dedup: a first-per-fight call MUST say (sayOncePerFight says when
     the fight object is fresh); suppression on later calls in the same
     fight is by design, not a bug. Report the call/capture counts.
   - Barrier calls present AND capture has the line → the r51 loss did
     not reproduce; report as non-reproducing, do not re-litigate r51.
   No src/js change follows from any outcome unless a call path is
   proven broken (a call that should say but does not).
3. **TABLE-APPROACH SENSE:** read THIS run's want/wantwatch files fresh
   (not r51's). Priced wait (named deed gap / named seat) vs silent
   stall; any seat-taker-choice or full-seat voicing in-window; neither
   seed sits (expected: lesser seat, arc 4, waiting).
4. **PEOPLE CHECK (sense law):** read the d90 + d120 transcripts in full
   for both pilot seeds. Judge meaning: NPC wants something, options
   engage/deflect, endings resolve/plant/owe. No counts-only verdict.
5. **FUN / REACHABLE / WINNABLE** for the scale leg, in plain words.

## Metric review (carried)
- r51's compare normalizes driver labels r46–r51; r52 compare extends
  the normalization to r52 (same rule, no metric change).
- Census scalars unchanged from r51's list (19 scalars + covenant trusts).
- Barrier instrument is new telemetry, not a new metric: it records
  calls the engine already makes; it changes no engine input.
