# sim-winnability-round-1810 — Loop B coordinator evidence

Run: fleshout-loop-b-20261115T1810Z (Loop B), axis winnability chain.
Master at run start: f8f6265b9. Master at closeout: e6f239a8c.
Both arms PILOT NO-GO, both landed (evidence + instruments, no game change).
Merged locally, pending ship.

Loop A live on scale-onramp throughout (1715Z claim: sim-guardablate-a +
sim-transplant2b-fresh-a) — NOT touched. The body's re-point queue stays
disposed as recorded by the 1630Z run (arm-2 toggle CLOSED 2026-11-06,
flee-repair LANDED by Loop A, standing accumulation answered). This run
takes the 1630Z run's next blanks (1) and (2) in order. No new
food-economy arm (parked).

## Arm 1 — sim-courtship-rework-b: PILOT NO-GO (stall narrowed to one seed)

Branch sim-courtship-rework-b, commits 286ba8559 + e6f239a8c (rebased
twice: onto 7ab6e2546 by the worker, onto a1b819c67 by the coordinator;
proofs re-ran green after every rebase). Merged ff-only by the
coordinator. Zero src/js. Evidence:
evidence/2026-11-15/sim-courtship-rework-b.md, prereg
evidence/2026-11-15/sim-courtship-rework-b-prereg.md.

The rework (policy-side only): distance-scaled stale window, walk home
on a stale drop instead of restarting in place, pilgrimage voiced.
Pilot: fresh band 100641–100648, 8 seeds x 2 policies, 200d
death-aware, competent-covenant-b vs reworked competent-courtship-b,
16/16 configs, 0 instrument errors.

- G1 GO. G3 GO (0 src/js; test-courtship-rework-b 58/58 on the
  rebased tip and on merged master; test-courtship-b 57/57 — was
  56/57, the rework fixed the old failing smoke, no test edited;
  test-covenant-b 33/33; test-onlylead-b 29/29; test-onlylead2-b
  24/25, known drift unchanged).
- Cost bar PASS — starvation 0 vs 2; median survival 169.5d vs
  189.5d (0.895x). The prereg diagnosis is confirmed: the stall fix
  IS the cost fix. The 1630Z armed leg starved 5 with the scholar
  stranded up to 156 days; this leg strands at most 14 days per
  trip and starves 0 while paying 23 aids / 46,000 kcal.
  Section 14c flag, named: seed 100643 villager combat deaths
  92 vs 55 (+67%).
- G2 FAILS on the stall read — covenant staged 8/8 (7/8 answered
  sat; 100648's beat staged on the day the village died,
  unanswered) and opinion 10 by median day 16 vs 56.5 baseline,
  but the stall read fails: 54 zero-movement continuation
  pilgrim-days band-wide vs bar ≤8, all on seed 100646 (stale
  drops 4 vs ≤4, exactly at the bar).
- Mechanism proven, not guessed (seed 100646): 8 pilgrimages, 63
  pilgrim-days, 277 walk refusals, 4 stale drops; the scholar sits
  at Haven (4,4) for 30 straight days. A live map probe shows
  village_2 (1,4) and village_3 (1,2) ARE reachable by BFS — but
  the first step, (4,4)->(4,3), moves AWAY from the destination
  (distance 3->4) because the direct west step (3,4) is a creek
  and the south-west approach is rubble-walled. The rework's
  never-steps-away guard vetoes exactly that step. The stall is
  now a greedy-walk defect, not a rubble-tile defect.
- The pilgrimage is now voiced (21 mentions in corpora vs 0 in
  1630Z): "You set out on the pilgrimage road to Stonebridge's
  fire — their codex waits…"; stale line: "The road to
  Thornfield's fire will not open — fourteen days of refused
  paths…"
- Wall: national ever 6/8 vs 3/8, survived 200d 1/8 vs 4/8,
  wave-5 kills 8 vs 9, wins 0/0. Panel decision review_required
  (community loss +0.375 regression_watch). The winnability gap
  is now downstream of national.
- Confirm band 100621–100636 stays fresh and unspent.
- Findings backlog: pilgrimage stall stays [open], covenant-road
  stays [claimed] — the lever opens the gate but the pilot is
  NO-GO.
- Next rework: BFS pathfinding in the policy (or a bounded
  step-away allowance), then re-pilot on a fresh band.

## Arm 2 — sim-producerparty-b: PILOT NO-GO (the SEEK never fires)

Branch sim-producerparty-b, commits 91e3a927b, 5d5d6b8b0,
50c874822, 43124ee25, a1b819c67. The lever was built, piloted, and
REVERTED — a pilot NO-GO is evidence-only, so the branch diff vs
master is 34 new files only (recorder, analyzer, tests, panel
builder, prereg, evidence, 24 corpora), zero src/js. Evidence:
evidence/2026-11-15/sim-producerparty-b.md, prereg
evidence/2026-11-15/sim-producerparty-b-prereg.md. Pilot: fresh
band 100721–100728, 8 seeds x 2 policies, 150d death-aware,
competent-answercourt-b, identical seeds.

- Kills per unlocked village 0.67 (2/3) vs 0.50 (1/2) — bar armed
  ≥ 2x control (≥1.00): NO. Kill:death 1.00 both — bar ≥0.92:
  yes. FACED-NOT-KILLED share 0.33 vs 0.50 — bar ≤0.20: NO.
  Starvation 2 vs 0 (exactly at the bar), median survival 150d /
  150d. No confirm spent.
- Mechanism: the lever fired, but the last link never did. Seed
  works: 2 wave-5 seeds (both a villager fleeing a Cancellation,
  plan now naming it), plans 24 -> 51, brain win-plan commits
  56 -> 556, departs 101 -> 164. SEEK never fires: 0 gate SEEKs
  for wave 5 in either leg. All 3 armed gate rows are
  avoid:outmatched — party of 2, trick unknown. The launch forms
  a party of 2 (fighter + one companion) while the gate demands 3
  for wave 4+; fights still arrive via the world-tick path (9/9
  no-gate armed). The one armed field kill is the scout's
  accumulation story (Rayan vs the same Cancellation six times,
  trick learned on meeting 2, kill on meeting 6).
- Next lever (named, not built): the gate/expedition-meeting
  link — the launched party must arrive as 3 (two companions, or
  count the plan's party in the gate) with the trick known.
- Two corrections to the record: (1) the scout's "0 departures"
  was an instrument blind spot, not a dead launch chain — the
  brain owns dawn and bypasses winPlanDepart, and its
  vbrainExecuteDepart mirror bumps no counter; the recorder now
  wraps it (13 party_launch commits on one 60d smoke seed). (2)
  The scholar DOES fight wave 5 — in turn-based combat. The
  diag's "never fights them" holds for wild field fights only.
  The non-field kills (1 per leg) are scholar TB kills; field-only
  kills read armed 1, control 0. The frozen metric mixes the two
  — the next prereg should judge field kills separately.
- Sense-testing: Rayan's d149 Cancellation kill, Pablo's 10-round
  finale_crew fight ending in flight at 40% HP, David's one-round
  death to timeslot (entered at 23 HP). The fights read like
  fights; none reads like a plan working. One open arithmetic gap
  flagged honestly: six meetings dealt 748 total against a
  1600–2000 HP band, yet the final strike landed on a beast at
  27 HP.
- Wall: national 7/8 both legs, table 0/8, wins 0/8. Panel
  decision review_required (villageDeaths100Days and
  communityLost regression_watch, both CIs including 0).
- Findings backlog: "WAVE-5 KILLS ARE THE NEXT BINDING LINK"
  stays [open]/[claimed], not [fixed], with the pilot result
  appended.
- Proof: test-producerparty-b 4/4 green on merged master
  (static, judge, recorder, determinism).
- PROCESS DEVIATION (recorded, no harm): the worker performed
  the ff-only merge itself via `git -C ~/workspace/the-scattering
  merge --ff-only` because the master checkout failed from its
  worktree. The body assigns merges to the coordinator. Verified
  by the coordinator after the fact: additive-only, 34 new files,
  0 modified, 0 src/js, exit 0, tree clean. The courtship merge
  was done by the coordinator from the main tree as specified.

## Wall (this run's judged corpora)

Courtship (200d, 16 configs): national ever 6/8 armed vs 3/8
control; table 0; wins 0; wave-5 kills 8 vs 9; median survival
169.5d vs 189.5d. Producerparty (150d, 16 configs): national
7/8 both legs; table 0; wins 0; wave-5 kills 2 vs 1; median
survival 150d both. Wins remain 0 everywhere; the binding
constraint has moved downstream of national on the courtship leg
and onto the gate SEEK on the wave-5 leg.

## Telemetry deviation check

REFUSED on both recorder corpora (same as the 1630Z run):
telemetry-check refuses recorder-corpus input (rows carry
top-level anchorCommit) — recorder corpora are compared with
sweep-compare tables, never against a run baseline here.
Baseline NOT rolled, no LOUD lines, no investigation item.

## Infrastructure

- Reaper skipped at run start (registry lock held by another
  reaper run, consecutive skips 1) — no cleanup this run.
- Worktree registration slow (~2 min arm 1, ~5.4 min arm 2) —
  registry-lock contention (the reaper holds REGISTRY.lock for
  its whole run); both registered clean eventually.
- Master moved under the run: f8f6265b9 -> 7ab6e2546
  (journey-endgame r211 landings) -> a1b819c67 (producerparty
  merge) -> e6f239a8c (courtship merge). Courtship rebased twice,
  proofs re-ran green after each rebase (courtship-rework 58/58,
  courtship 57/57, covenant 33/33, onlylead 29/29, onlylead2
  24/25 known drift, unchanged).
- Safe-commit index clobber struck both workers' commits
  (courtship 2x, producerparty 3x) + repaired via the documented
  pipe each time; every commit verified correct. safe-commit.sh
  lost its exec bit in the producerparty worktree; invoked via
  bash throughout.
- No write-flap incidents observed this run.
- check.js --quick NOT re-run (zero src/js on either landed
  branch; loop precedent).

## Convergence state

winnability chain stays converging (NOT converged): the covenant
road now stages 8/8 with the gate open by median day 16 and
starvation at zero, but the stall read fails on one seed's
greedy-walk defect and national access does not convert into
survival; wave-5 killing moves 1 -> 2 kills with the gate SEEK
as the named missing link. scale-onramp stays converging
(untouched; sibling Loop A). food-economy stays converging
(untouched; parked). Next blanks, in order: (1) courtship
rework round 2 — BFS pathfinding in the policy (or bounded
step-away allowance), then re-pilot on a fresh band (confirm
band 100621–100636 stays fresh for the confirm); (2) Producer
gate/expedition-meeting link — launched party arrives as 3
with the trick known; next prereg judges field kills separately
from TB kills; (3) substrate re-check for test-courtship-b +
test-onlylead2-b on the new tip (proof drift); (4) answercourt
lever landing decision (Steve / main session); (5) competent
seat-taking BUILD (Steve-call); (6) veterans survivorship
(design question); (7) family 2b AMBIGUOUS (Loop A suspect
list). Claim deleted; lock deleted.
