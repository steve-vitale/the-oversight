# journey-landing r73 — PRE-REGISTER (lane A, leg 0 LANDING, days 1–14 + tail)

**Run id:** laneA-landing-2026-11-03T03:45CST (scheduled 03:45 CST 2026-11-03).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@9b9ee8b7e at branch creation (local master ahead of origin push
state; pending ship — normal).
**Driver:** scripts/journey-landing-r73-20261103.js — clone of the r72 driver
(labels/seeds/OUTDIR only) + FAVOR_TRACE + outing73 census field.
Diff verified by inspection: no src/js, no other driver logic.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** instruments read-only; the probe only presses
offered favor actions and walks honest travel hops — never engine state, never
teleports. The tracer READS favorLedger/promises only; it never writes them.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if the fix gate
below is met; otherwise document and move on.
**Canon read:** docs/CANON.md (manifest) + the favor lifecycle in
src/js/convo-wants.js (commit/store), src/js/favor-forage.js (waiting/action),
src/js/game.js checkPromises, src/js/ledger.js mantle release. No new canon
invented; the favor system is documented canon (convo favor system 2026-10-11).

## Standing context (read before scoring)
- Last landing run: r72 (2026-11-02, seeds 701–704). Stay-green GO on all
  gates; people check GO with 0 fizzles / 0 fabrication; outing KEPT
  end-to-end for the first time (704 Yuki). `more` offered 0 times — fifth
  running run of dead UI in landing.
- r72 observation (THIS RUN'S BLANK, first repro item): 701 Jorge promised
  day 11 ("forage with Jorge tomorrow to rebuild the pantry"), then the
  favor never appeared in ANY dawn scan, has no favorsEnd entry, and left
  no rot line. Ruled out by r72: new-ask overwrite (one-open-commitment
  guard) and ledger deletion (no deletion path found by grep). NOT ruled
  out: a detached-object commit, a mid-day prune, a save/load drop, or a
  mantle-timing effect (701's player died day 13, mantle to Elijah day 14).
  This run replays seed 701 with a tracer instead of running another blind
  quad. A vanished promise with no honest line is a senseless defect if
  reproduced — it meets the fix gate.
- r72 second gap (documented, design call, NOT this run's fix): 703 Wanjiru
  promised day 11, left after promising, stranded the whole window. Widening
  the window or sliding the meet to her return is a design call.

## Leg questions (binding)
1. **JORGE REPRO (the blank):** does seed 701 replay reproduce Jorge's
   vanished promise, and if so, between which two driver actions does the
   favorLedger entry / promises entry disappear?
   - Method: SEEDS=701 replay of the r72 driver + FAVOR_TRACE. Snapshot
     (full favorLedger + promises, bearer id) at each dawn (inside
     tryOuting, before probe attempts), after each conversation sitting,
     and at each day's end. In-process vanish detector: any ledger entry
     present at snapshot N and absent at N+1 while its promise is not
     kept/broken/released logs `*** FAVOR-VANISH` with last-seen state.
   - GO (explained) = the transition is bracketed to one driver action
     AND named to one engine path (commit/store/prune/mantle/checkPromises)
     with a quoted line or code site. A reproduce with no bracket is a
     documented miss, not a fix.
   - Fix gate applies: land a code change ONLY if the finding is a
     senseless defect (dead end, unfireable beat, contradictory state,
     silent loss) with a runnable before/after proof test in
     scripts/test-*.js and the relevant suite staying green.
2. **STAY-GREEN (carry, report + gates):** fresh quad 801–804, policy
   competent PINNED, FAVOR_ACCEPT default ON, horizon 14d, death-aware
   stop (+10d tail). Gates per seed: System contact day ≤ 10; death
   liturgy exact (grief beats == villager+person deaths, 0 headcount
   codas); theft 0; self-sufficiency ≥ 0.70 on the last series day and
   0 starvation deaths; plenty-voice ≥ 1.
   PILOT GATE: seeds 801+802 run first; if either crashes or systemDay is
   null, STOP and report.
3. **PEOPLE CHECK (sense law — transcripts read in full):** all sittings
   from the pilot + main seeds judged on meaning, coherence, relevance,
   consequences — never just exchange counts. Gates: 0 depth fizzles,
   0 fabricated shared history, 0 sittings where a pursued continuer
   yields an empty beat. Also report `more` offered count (sixth run of
   the dead-UI watch: if 0 again, retire the more-thread gate from this
   leg's panel in metric review rather than re-reporting it as news).
4. **LOOT/ABILITIES REACH (report-only):** pack + grants + monsterKills +
   fleshArc. 0 gains with 0 kills = no opportunity, not a defect.

## Metric review
- (Filled at closeout. Pre-registered metrics bind this run; a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.)

## Infra notes (at prereg time)
- Worktree `journey-landing` registered under oversight-playtest-loop;
  register took ~5 min (evidence-tree checkout under parallel load).
  Standing heartbeat loop (540s) started; first beat verified in the
  registry (heartbeat_at 2026-11-03T09:53:02Z) before the pilot runs.
- Pre-flight reap queued behind sibling reaps on the registry flock, then
  completed: active 11/16, several LOUD dirty-tree notices for OTHER
  owners' trees (never touched). Main tree clean (0 lines) at pre-flight;
  git pull already up to date; disk 28%.
- No lock contention: no playtest-loop.lock existed at run start.
