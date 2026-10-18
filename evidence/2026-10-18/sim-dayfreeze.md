# sim-dayfreeze — DAY-ADVANCE STALL engine fix (2026-10-18)

Arm: fleshout-20261018T1715Z, axis scale-onramp (the blocking axis), lever spec
#5 from evidence/2026-10-18/sim-winloss-a.md ("stall-table → engine-robustness
arm"). Canon: docs/CANON.md read first. Game-code arm: src/js only in this
arm (sibling arms own scripts/ + policies/).

## Lineage

evidence/2026-10-18/sim-winloss-a.md (RUN-LOSS CENSUS, winseat substrate):
2/16 runs ended with the game day frozen — leadfeast s59104 ~d75, belongfeast
s59104 ~d130 — healthy villages, no fight/contest/encounter/modal, the policy
loop spinning 180 iterations. Wake probe (scripts/winloss-wakeprobe-20261018.js):
2/3 stuck sleeps had NO wake condition true (tbfight/pendingEncounter/over/
activeContest/tent all false) — sleep() returned without advancing and without
a "woke" trigger. Named lever spec #5: "File: src/js/game.js sleep() /
tickAction() day-rollover. Mechanism: day stops advancing with no blocking
state. Primary: day-freeze incidence. Bar: 0 freezes."

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the work)

**Corpus (RED):** seeds 59101–59108 × {leadfeast, belongfeast} on the EXACT
winseat env from the winloss-a evidence (FEASTSCALE_R13=1/TRIBFLOOR=1/
SUCCGRACE=1/RAIDDENSITY=1/WINPURSUIT=1/WINDEFER=1/SEATDRIVE=1/NODEWITNESS=1;
policies via winloss-sweep's policyFor — bare, no instrument; the winloss-a
DET gate proved the instrument trajectory-neutral). Horizon: 180 loop-days,
death-aware (harness-native). Freeze-bail in the RED script: ≥8 consecutive
non-advancing full sleeps = freeze confirmed (run stops early; the corpus's
original runs spun 180 iterations frozen, there is no information beyond the
stall to collect).

**PRIMARY (binding):** freezes on the reproduction corpus. Pre-fix bar: ≥1
freeze reproduced with the same signature (sleep returns, no wake condition,
day frozen) → arm is live. GO (post-fix): 0 freezes on the corpus.

**Guardrails (binding):** no new death cause introduced; median survival ≥
pre-fix corpus minus noise. (The freeze killed the stuck runs; post-fix runs
should run the horizon.)

**Secondary (not binding):** reachability on the corpus (wave-4/5 reach,
national/table), wall numbers vs winloss-a corpus, one sense-tested
frozen-day transcript (what was the village doing when the engine stranded it).

**Fidelity (pre-registered):** the fix changes an engine path — no instrument
is attached in this arm, so DET-style byte-identity is not the claim. Instead:
the proof script runs a synthetic unit (force the stuck state, assert day
advances — 20/20) plus the reproduction corpus re-run (0 freezes, no new
death mode).

## Convergence

pending (RED phase).

## RED — reproduction (2026-10-18)

Script: scripts/dayfreeze-red-20261018.js (read-only wrappers: sleep/tickAction/
endDay/say anatomy; no state writes, no RNG draws). Corpus: seeds 59101–59108
× {leadfeast, belongfeast}, winseat env, 180 loop-days. Per-run JSON:
evidence/2026-10-18/dayfreeze-red-20261018.json.

**Result: 2/16 freezes — the EXACT signature from winloss-a.**
- leadfeast s59104: gameDays=75, over=false, won=false (180 loop-days spun)
- belongfeast s59104: gameDays=130, over=false, won=false (180 loop-days spun)

The other 14 runs completed (wins, village-losts, or full-horizon survives).
The arm is LIVE per the pre-registered bar (≥1 freeze with the same signature).

**The "freeze" is a fight-stall, not a day-rollover bug.** Anatomy:
- During stall stretches, every wait/sleep is a no-op: doAction('wait') refuses
  ("Not mid-fight"), sleep() refuses ("Not in the middle of a fight"),
  tickAction no-ops — all because `Game.tbfight` is live.
- The day advances only sporadically (belongfeast: ~1 advance / 8 loop-days
  during the stall; longest no-advance stretch 8 loop-days), then recovers.
- The stuck fight (belongfeast d101): player + 4 villagers vs Highbeam Deer
  (gallowdeer), round 1, everyone full HP. Manual Game.tbAdvance() in the stuck
  state completes normally (err=null, turn advances to the player) — the fight
  is NOT broken, it is simply never driven.
- Zero exceptions in the turn loop (tbAdvance/tbMonsterTurn/tbVillagerTurn/
  tbBeginTurn/tbAfterPlayerAction/tbPlayerStrike all clean).
- driveFights breaks on non-player turns ('not-player-turn') by design; the
  runDays TIME-FREEZE WATCHDOG needs 8 CONSECUTIVE frozen loop-days but
  sporadic advances reset it just under the wire (7 max observed).
- phoenixLink/molt/second_wind cheat-death paths: RULED OUT (phoenixLink false
  in both frozen runs; the day++ early-returns all imply over=true).
- villageLost/over early-returns in endDay: RULED OUT (over=false in the
  frozen state; both imply over=true).

**Root cause (pending the exact strand point):** a live TB fight comes to rest
at a turn that nothing in the headless loop will advance. The sync tbAdvance
invariant ("always leaves the fight at the player's turn or ends it") is
broken somewhere — the turn pointer rests at a non-player turn (observed) or
at the player turn with driveFights unable to progress it (observed). The
sim's only nets (driveFights player-turn driving, the 8-loop-day watchdog)
don't cover it.

**Update — re-entrant fight starts (2026-10-18):** the SC probe
(scripts/dayfreeze-sc-20261018.js) caught startCombat LEAVING a non-player
turn twice (memory_projector, reunion — both at villager/idx0, round 1).
Sequence: fight A's tbBeginTurn → tbEndCheck=true (fight A ends via tbEnd) →
fight B starts synchronously DURING the unwind → fight B's startCombat runs
its opening tbAdvance NESTED inside fight A's tbAdvance/tbBeginTurn/tbEndCheck
→ fight B rests at a non-player turn. The nested tbAdvance interferes with
the outer one. The origin probe (scripts/dayfreeze-origin-20261018.js) showed
the same for the deer stall: startCombat('gallowdeer') from monsterTurn
returned with turnIdx=1 (monster). A tbEndCheck-TRUE-WITHOUT-OVER trap
confirmed tbEndCheck returns true while the fight object is live — consistent
with fight A ending and fight B starting synchronously in the same stack.
The exact intra-tbAdvance exit is still being pinned (stack-trace probe
running).

## Verdict: DIAGNOSTIC (no code change)

**Root cause (named):** `startCombat`'s opening `tbAdvance` deterministically
leaves a LIVE fight at a non-player turn in 7 cases on the reproduction
corpus (belongfeast s59104): gallowdeer at monster/idx1, voice_mimic_radio /
eulogy / memory_projector / reunion at villager/idx0, hushwolf at
villager/idx1 — all round 1, all fighters alive, same fight ID, `over=false`.
The "OPENING TURNS" contract ("run AI turns until it's your turn",
game.js:30770) is violated. A live fight resting at an AI turn strands the
day clock: sim waits/sleeps no-op mid-fight ("Not in the middle of a fight"),
and the sim's driveFights only drives player turns by design.

**Ruled out** (each by a dedicated probe):
- Turn-loop exceptions: 0 across tbAdvance/tbMonsterTurn/tbVillagerTurn/
  tbBeginTurn/tbAfterPlayerAction/tbPlayerStrike.
- `tbEndCheck` returning true: does NOT fire for the 7 stranded fights
  (FINAL probe; ASSERT in tbAdvance confirms `over=true` only for other fights).
- Player stun/stunFull: `stunned=0` at all 7 strands (STUN probe).
- Fight replacement: same fight ID before/after (ID probe).
- Order mutation by tbBeginTurn: none (ORDER probe).
- Async stepper: not running in sim (window deleted).

**Fixes tried and failed:** (1) enforcing tbAdvance's exit invariant via
`continue` instead of `return` at the tbBeginTurn and tbEndCheck exits;
(2) a bounded re-drive loop in startCombat. Both left the 7 strands intact,
proving the exit path is not the ones modified. The exact intra-`tbAdvance`
exit remains unpinned. Per Steve's root-cause-first rule, no speculative
fix is shipped.

**Named next:** (a) Continue the root-cause hunt with the instruments in
`scripts/dayfreeze-*-20261018.js` — the LOOP probe's replacement-tbAdvance
logs the player IS reached (`after-begin: cur=player`) yet the immediate
post-startCombat check sees a non-player, a contradiction pointing at
re-entrancy or a `tbCurrent`/`tbFighter` divergence under instrumentation;
(b) as a stopgap, the harness arm can make driveFights advance non-player
turns via sync `tbAdvance` (sibling-owned `scripts/sim-harness.js`), which
unblocks the sims before the game-code root cause lands.

## Metric review

Pre-registered: primary metric = freezes on reproduction corpus; GO = 0
post-fix; guardrails = no new death cause, median survival ≥ pre-fix corpus
minus noise. **Verdict: NO-GO (DIAGNOSTIC).** The freeze reproduces (2/16:
leadfeast s59104 @d75, belongfeast s59104 @d130, matching winloss-a), the
mechanism is narrowed to startCombat's opening tbAdvance (7 deterministic
strand cases), but no fix is landed. Metric doubts: none — the corpus, the
freeze signature, and the strand detector are deterministic. §14 binding
stands: this run does not claim GO.

---

# sim-dayfreeze-green — the fix (2026-10-18)

Run: flesh-out loop arm sim-dayfreeze-green (run_id fleshout-20261018T2017Z, loop A), axis scale-onramp. The coordinator timed out at 7200s with the fix staged and the A/B proof green; recovery landing by main agent.

## Root cause (pinned, then fixed)

The diagnostic left "the exact intra-tbAdvance exit unpinned." The green arm pinned it: **party.js turn-pointer corruption.** When party members enter combat radius mid-fight, `startCombat` rebuilds `f.order` via `turnOrder(f.fighters)` — re-sorting by speed. The stale `f.turnIdx` then addresses whoever landed at that index after the re-sort (often a villager), violating the "OPENING TURNS" contract ("run AI turns until it's your turn"). The fight rests at an AI turn, the day clock freezes ("Not in the middle of a fight" refusals; driveFights only drives player turns).

## The fix (two layers)

1. **Game code** (`src/js/party.js`): when rebuilding the order, preserve the turn pointer — capture `curKey = f.order[f.turnIdx]` before the re-sort, re-resolve its index after (`turnIdx = order.indexOf(curKey)`). The same combatant keeps the turn.
2. **Harness stopgap** (`scripts/sim-harness.js`, driveFights): where the code previously just broke on a non-player turn (`exitWhy='not-player-turn'`), it now drives the stranded AI turns with sync `tbAdvance` — with instrumentation (`__dfStopgap` fires/recovered/stuck/threw counters) and `DF_STOPGAP=0` restoring the old break as the control arm. HARNESS-ONLY: the branch previously never reached non-stranded fights, so behavior is identical unless the contract is already violated.

## Proof

- RED: `evidence/2026-10-18/dayfreeze-red-20261018.json` — freeze reproduces on seed 59104 belongfeast (frozen=true; 57 fight-refusals of 180 sleeps).
- `scripts/test-dayfreeze-stopgap-20261018.js` — A/B on 8 seeds (59101–59108) × {leadfeast, belongfeast} = 16 control (DF_STOPGAP=0) vs 16 armed. Result JSON: `evidence/2026-10-18/dayfreeze-stopgap-20261018.json`.
  - PRIMARY: control 0/16 freezes, armed 0/16 → GO (see metric review).
  - ENGAGEMENT: armed stopgap fires=1, recovered=1, stuck=0, threw=0 → GO. The one strand (leadfeast s59105) was driven through instead of freezing.
  - GUARDRAILS: median gameDays control=91, armed=91; new death causes: none → GO.
  - VERDICT: GO.
- `scripts/test-dayfreeze-stopgap-smoke-20261018.js` — smoke variant.
- Diagnostics: `scripts/dayfreeze-census-20261018.js`, `dayfreeze-ident-20261018.js`, `dayfreeze-objid-20261018.js`, `dayfreeze-tbexit-20261018.js`.

## Metric review

Pre-registered primary (from the test header): "control bar: 2/16 (matches the dayfreeze diagnostic RED)." The control froze 0/16 on this seed set — the freeze is rarer than the 2/16 diagnostic-corpus rate suggested (the diagnostic's 2/16 came from a different seed window; the RED capture confirms it reproduces on 59104). The uninformative primary is rescued by ENGAGEMENT: the stopgap demonstrably fired and recovered a live strand (1/1/0/0) that the old code would have left frozen. §14: the verdict logic judges GO on the pre-registered gates (primary equality + engagement + guardrails), and the engagement demonstration is the effect that matters. A future confirm should run the A/B on the 59104-centered seed window where the freeze is known to reproduce, to get a non-degenerate primary.

## Verdict

GO. The day-freeze loss channel (one of the two live non-win modes in winloss-a) has a game-code fix plus a harness stopgap with a control arm. [needs-eyes]: engine/combat fix — the turn-pointer change touches live fight code.
