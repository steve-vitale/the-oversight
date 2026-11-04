# Journey endgame r128 — run note (TIMEOUT CLOSEOUT by main session)

Leg 4 (endgame). Substrate r118 exactly (capable + deedhunt + vetcommit + greedy
deferral, MAXTIER 4 / LASTDAY 145, armorydrive + fullseat-diag + vetguard on
waves seeds). 4 seeds: 89701, 89702, 89704, 89705. 180d, death-aware.
Prereg + driver/analyzer: branch commit 5a0bccb6f (r124 probe verbatim except
renames + hurtreturn/fallen instruments).

## Status: partial run, evidence preserved, closeout by main session

The coordinator timed out before closeout. What completed: the 4-seed pilot
(exit 0) and three diagnostics (holdrevert, nohurt, det89702). What did NOT
complete: the analyzer run, the full-transcript people check, the village
census, the telemetry check, and the metric review below (stated, not
scored). The transcripts are preserved in perseed-endgame-r128/ for the next
run's people check.

Closeout actions (main session, verified): the orphan heartbeat loop
(pid 11293) was killed after death was established (coordinator timeout +
zero worker processes; the loop's fresh heartbeat was not worker liveness).
A one-line diagnostic edit to src/js/game.js (shouldHurtReturn forced
false, marked DIAGNOSTIC-ONLY #2, uncommitted) was RESET from the worktree
and is NOT in any commit — game.js is pristine on this branch. This note +
the pilot corpus + diagnostic logs are committed as evidence only; no game
change, no fix, no revert is landed by this closeout.

## Pilot vs r124 — NOT reproduced (verified from both pilot logs)

Same 4 seeds, same substrate, r124 pilot log vs r128 pilot log:

- 89701: r124 won, lesser, wave 4, standing 199 → r128 won, lesser, wave 4,
  standing 199. IDENTICAL.
- 89702: r124 won, lesser, wave 4, standing 199 → r128 LOST, village-lost,
  wave 4, standing 125. Win → death.
- 89704: r124 lost, village-lost, wave 3, standing 25 → r128 lost,
  village-lost, wave 3, standing 0. Lost both; standing shift minor.
- 89705: r124 won, lesser, wave 4, standing 199 → r128 won, lesser, wave 5,
  standing 582. Wave-4 → wave-5 unlock, standing nearly tripled.

## Diagnostics (single-variable, same driver, same seeds)

- holdrevert (holdbeatfix reverted): 89702 lost (125), 89705 won wave-5
  (582) — IDENTICAL to the pilot. Holdbeatfix-b is inert for these flips.
- nohurt (hurthome rule disabled via the diagnostic edit): 89702 WON,
  lesser, wave 4, standing 199 — the r124 outcome restored exactly.
  Attribution for the 89702 flip: the hurthome turn-home rule is
  implicated (outcome-level only; the mechanism by which it flips this
  seed from win to village-lost is NOT established by these logs).
  The nohurt diagnostic ran 89702 only; it did not run 89705.
- det89702 (detailed rerun): 89702 lost (125) — confirms the pilot death,
  not a logging artifact.

## Attribution summary (honest scope)

- 89702 win → death: attributed to the hurthome rule by a clean
  single-variable comparison (rule ON = death, rule OFF = r124 win).
  Mechanism unknown. This is NOT a revert call: the hurthome fix
  improved its own panel (returned-hurt 16 → 48, median survival
  74 → 92 days); its endgame side effect on this seed needs a
  mechanism-level look, not a reflex revert.
- 89705 wave-4 → wave-5 unlock, standing 199 → 582: UNATTRIBUTED.
  Holdrevert did not move it; nohurt did not test it.
- 89704: lost in both legs; no attribution question.

## Metric review (stated, not scored — completing run owns the score)

Pre-registered question: reproduce r124 on identical seeds. Verdict: NOT
reproduced — 2 of 4 seeds changed outcome or reach (89702, 89705).
The pilot gate for a confirming run should pre-register which
diagnostics run on which seeds (nohurt covered only 89702 here) and
whether a lesser-seat win with a wave-5 unlock counts as the same
outcome class as a wave-4 lesser win (89705's case).

## Rotation: NOT advanced (per prereg)

The prereg binds: the leg advances "ONLY after a verified landing — a
failed run does not advance the leg." This run did not complete its leg
(no census, no people check, no analyzer, no telemetry), so
journey-rotation-b.txt stays at 4. The next Lane B run replays endgame
and owns the open items below. The R120 held-work item (dirty
journey2-endgame tree) was NOT touched; it still needs main-session
inspection as a standing item.

## Infrastructure

Registration saga per prereg (wrapper-killed attempt, VM restart wiping
background sessions, leftover-dir refusal, 4th attempt succeeding after
~11 min checkout); registry flock contention with Lane A's heartbeat
loop, cleared unaided; index clobber repaired during the run. The VM
restart also explains the main session's lost /tmp suite log the same
morning. Lock deleted at closeout; worktree released; branch merged
evidence-only (this note + corpus + logs + prereg commit).

## Next blanks, in order

1. 89705 flip attribution: run the nohurt diagnostic (and any further
   single-variable diagnostics) on 89705; do not cite hurthome for it
   until tested.
2. Hurthome mechanism on 89702: trace how the turn-home rule moves this
   seed from win to village-lost; judge intended vs side effect from
   the trace, not from the outcome alone.
3. Completing endgame run: census, people check (transcripts preserved),
   analyzer, telemetry check, scored metric review.
4. R120 held work: main-session inspection of the dirty journey2-endgame
   tree (standing item, untouched by this run).
