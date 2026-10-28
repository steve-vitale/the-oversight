# sim-food-economy-round-1930-b — loop B coordinator evidence (run fleshout-loop-b-20261028T1930Z, axis food-economy)

Run: oversight-flesh-out-loop-b, scheduled 2026-10-28 14:30 CDT (19:30Z).
Axis: food-economy (second axis; sibling loop A live on scale-onramp the
whole run — its 1736Z round landed as 894d86451 during pre-flight, then
its perceptform round started; neither touched, no file overlap with any
arm here). Master moved once under the run before any merge (loop A
retreatdiag 92abb0707); all three branches rebased clean in their own
worktrees (zero file overlap with retreatdiag), proofs re-ran green after
every rebase and the merges below are --ff-only. Merged locally, pending
ship. No push, no version bump, no live verification (ship loop owns all
three).

## Pre-flight + infrastructure (read before judging anything)

- Main tree at run start: dirty ONLY with docs/ONTOLOGY.md at 0 bytes
  (mtime 2026-10-28 18:55Z) — the known recurring doc-sync transient
  (same shape as 2026-10-24 and the 1730Z run). Left alone throughout
  per precedent: never reset, never committed. It is still 0 bytes at
  closeout (see closeout note); it predates this run by ~35 minutes and
  is not sibling work and not this run's work.
- Loop A's 1736Z lock + claim were still on disk at run start, but its
  round had already landed (HEAD 894d86451, coordinator closeout commit,
  19:29:55Z); loop A deleted its own lock/claim during the 10-minute
  pre-flight wait, so no stale-lock recovery was needed for A. This
  run's own B lock + claim were created before any sims and are deleted
  at closeout.
- Disk 16% at pre-flight. worktree-reap.sh: journey trees flagged
  uncommitted (their owners' work, never touched).
- Worktree registration was slow (~6 min/tree: the git reset --hard
  step), and the first registration command died mid-way through the
  third tree (session lost, partial dir with only evidence/ written,
  branch created but unregistered). Recovery, no ref surgery: partial
  dir removed, register re-run (script's fallback attached the existing
  branch), all three trees registered + heartbeated. Recorded so the
  next coordinator does not mistake a partial dir for a live tree.
- Safe-commit index clobber hit the insideevening worker's commits
  (repaired via HEAD-blob cacheinfo each time, verified) and the
  coordinator commit (same repair, verified below). No EPERM flap
  blocked this run's merges; the flap's only sighting was the killed
  registration command above, cause unproven (session loss, not a
  demonstrated lock failure).

## Arm 1 — sim-insideevening-b (POLICY ONLY, zero src/js): CONFIRM-GO, LANDED

Policy: scripts/policies/insideevening.js — competent + an evening step
(walk + 'Go inside' when the day ends at haven; no trek home, no
mid-fight/tent entry). Prereg committed before any judged run; confirm
addendum committed before any confirm run. Pilot 8 seeds 10700–10707,
confirm 16 fresh seeds 10710–10725, 30 loop-days, identical-seed
competent baseline, relative guards (median >= 0.8x control, starvation
<= control+2).

- Pilot: M1 8/8 (rate 1.00 every seed), M2 7/8 (bar 6), guards hold
  (median 30 vs 30; starvation 1 vs 0). Control inside rate 0.07–0.09
  (spawn days 1–2 only), 0 inside taps.
- Confirm: M1 16/16 (rate 1.00 every seed), M2 14/16 (bar 12), guards
  hold (median 30 vs 30; starvation 1 vs 1). Control 0.07–0.08, 0 taps.
- The three M2 failures (10701, 10714, 10720) are all away tap days,
  counted as failures, not re-classified. The lever never fails on a
  haven evening.
- Mornings after inside evenings still inside: 408/411 confirm
  (99.3%). Evening outcomes combined (720 policy evenings):
  already-inside 59, walk+go-inside 579, not-attempted-away 76,
  blocked-combat 6 (all on away tiles); 0 walk-no-path, 0
  no-go-inside-button, 0 entry-refused, 0 walk-interrupted-combat.
- Proof: scripts/test-insideevening-b.js PROOF-GREEN on both bands
  (pilot 240+240, confirm 480+480 evenings), re-run green post-rebase
  and on merged master (see below).
- Sense: the inside evening reads as a played evening (grounds ->
  hall -> pantry lift, caught in the hall whose stores were lifted);
  one silence named: no game line tells a player to step inside at
  evening time — the step is the policy's habit, not a hint.
- Confounds stated, not smoothed: stage-3 remote access by tap days
  (inside lever's marginal value is pre-stage-3); ownership loss on
  succeeded grants (late taps answer "You don't have that ability"
  even from inside); walk-quote kcal variance (5 kcal/5 squares vs
  8 kcal/4 squares, untraced, no verdict effect).
- No balanced-panel compare (pre-registered arenalabel precedent):
  30-day position/reachability leg, no game change, panel metrics
  unobservable in 30-day instances; custom driver on identical seeds
  is the instrument, prereg thresholds the judge.
- Next blanks from this arm (appended to sim-findings.md): nightly
  travel home as a separate lever; pre-stage-3 tap window
  (loop-days 8–12) preregistered from the start; morning-persistence
  upkeep-mover trace; walk-quote variance trace. DOM-tap entry and
  thief precheck are UNCHANGED (still open / still Steve-call).

## Arm 2 — sim-arenafallback-b (LABEL-ONLY game change): PILOT-GO + CONFIRM-GO, LANDED

Change: src/js/game.js Game.tbFightDeathCause(f) now names fallback
origins — betrayal -> 'betrayal'; tableTrial -> 'the table trial';
coalitionArena -> 'the coalition arena'; alien-hostile fighter ->
'a stranger' (knowledge-gated: pre-reveal the fighter is named
'Stranger'; never 'an alien'). Arena branch unchanged ('the
arena'); proven wild unchanged ('the wild'); residual fallback
unchanged ('the arena', now covering only fights no known producer
makes). No code branches on any cause string (checked); no damage,
HP, kcal, death-rule, or routing change. scripts/test-arenalabel-b.js
L3–L6 expectations updated in the same commit (design changed on
purpose, repo rule). Change commit carries [needs-eyes] for the
'a stranger' wording — Steve may tune the word; counts are green
regardless.

- Substrates: real entry points, forced loss only (arenalabel L7/L8
  pattern): arena-pit + arena-gauntlet via Game._contestArena;
  betrayal via startBetrayalCombat; tableTrial via startCombat
  ('finale', {tableTrial:true}); coalition via seeded muster (10
  allied blades, herald, minAllies 10) + startCombat('herald') —
  COORDINATOR JUDGMENT, disclosed: the muster prerequisite is seeded
  (a fresh day-1 game has no coalition), but the coalitionArena FLAG
  is set by real code in every instance (verified: flag true, 10
  ally fighters). Seeding a prerequisite is not fabricating the
  flag; the label is accepted on that basis. If a later ruling
  judges seeded musters dishonest, revert ONLY the coalition label
  line — the other four origins stand on unseeded substrates.
- Pilot (8 seeds 12100–12107 x 7 origins, 56/leg): arena 16/16
  'the arena' in all 6 death-record fields (bar 14/16); each
  fallback origin 8/8 (bar 7/8); wild control 8/8 'the wild';
  0 non-label differences, 0 unintended label changes.
- Confirm (16 fresh seeds 12108–12123 x 7 origins, 112/leg): arena
  32/32 (bar 28/32); each fallback origin 16/16 (bar 14/16); wild
  16/16; 0 non-label differences, 0 unintended changes. Totals:
  168 unique (seed, origin) pairs, 336 instance records.
- Proof: scripts/test-arenafallback-b.js 32/32 (incl. real-tbEnd
  origin legs), test-arenalabel-b.js 13/13 with updated
  expectations, test-grantdeath-b.js 8/8 — all re-run green
  post-rebase and on merged master (see below).
- Leg A closes the arenalabel proof-leg-only gap (arena branch now
  band-proven on real _contestArena losses, pit + gauntlet); Leg B
  closes the fallback-origin gap (no tbEnd fallback origin left
  unnamed except fights no known producer makes).
- No balanced-panel compare (pre-registered arenalabel precedent):
  label-only change, panel metrics cannot move; determinism clauses
  are the binding guard.
- check.js --quick did NOT complete in this worker's run (420s
  timeout, header + dots only, sibling check runs concurrent) —
  same stall class as arenalabel-b; carried as an open item, and
  the coordinator closeout check below is the adjudicator.

## Arm 3 — sim-awayvoice-b (DUPLICATE DISPATCH, resolved as RE-PROOF, no game change): LANDED as measurement

This arm was dispatched to build the away-hunger voice beat from the
0630Z round's "still open" note. The beat ALREADY LANDED on
2026-10-25 (pilot a7d84bdba, confirm 862721ade, adoption
2870c771c — verified on master) and the worker correctly refused to
rebuild it (a second voice line would duplicate landed code). The
arm instead RE-PROVED the landed beat on current master — the
question a duplicate dispatch actually needs answered.

- Re-proof prereg committed before any re-proof sims; fresh band
  96001–96008, competent only, 150d death-aware.
- Proof scripts/test-awayvoice-b.js 10/10 on current HEAD.
- Fresh band: fire rate 8/8 = 1.000 (bar >= 0.80); healthy fires
  0/695; name-borrowing 0; zero src/js diff from this run.
- Sense: Kurt s96006 trough-and-recovery arc — beat fires exactly
  at health 3 (d17) and nowhere else on the arc; the quoted beat
  names traveler, pack amount (1220 = want), hurt health, and
  distance from the shelves, claiming no shortfall it does not
  have. All 8 fires here are the ADEQUATE variant (packtail top-up
  live); short/empty variants were proven at pilot + confirm.
- Coverage limit (honest): only 1 starvation death in band, a
  HAVEN death, so no away-starvation death-day beat was sampled;
  the David health-8 edge is NOT re-tuned (<= 7 line stands).
- Coordinator lesson (appended to sim-findings.md): check git log
  for a later landing before dispatching a "next blank" arm —
  tracker next-blank notes go stale when a later round lands the
  item. This run's own backlog maintenance marks the stale lines
  fixed (divedeep boundary, calmbeast, barwhy) and closes the
  away-hunger invisibility sightings under the same landed beat.
- Merged branch carries ONLY: this arm's re-proof evidence,
  sweep + analyzer scripts, and fresh-band corpus. Nothing to
  merge as a game change — and none was.

## Merges (all --ff-only, rebased in own worktrees, proofs re-run)

- sim-awayvoice-b: rebased onto 92abb0707 clean; proof 10/10;
  merged (new tip 986eb1832).
- sim-arenafallback-b: rebased onto 986eb1832 clean; proofs 32/32,
  13/13, 8/8; merged (new tip 78c0db981).
- sim-insideevening-b: rebased onto 78c0db981 clean; proof
  PROOF-GREEN on both bands post-rebase; merged (new tip
  782af19e0).
- Post-merge verification on merged master (HEAD 782af19e0, run
  by the coordinator in the main tree, all exit 0):
  test-awayvoice-b.js 10 legs passed; test-arenafallback-b.js
  32 passed, 0 failed; test-arenalabel-b.js 13 passed, 0 failed;
  test-grantdeath-b.js verdict PROOF-GREEN (8/8);
  test-insideevening-b.js PROOF-GREEN on the pilot corpora
  (10700–10707) and PROOF-GREEN on the confirm corpora
  (10710–10725).

## Wall numbers (this run's judged corpora — NOT a win-seeking run)

- Awayvoice reproof corpus (competent-only, 150d): national 0/8,
  table 0/8, wins 0/8, wave-4 6/8, wave-5 0/8, median survival 150d.
- Insideevening bands (30 loop-days, position/reachability only):
  no wall fields observable by design; survival guards hold
  (median 30 vs 30 both bands).
- Arenafallback bands (substrate instances, day-1 bearers): no
  wall movement by construction (determinism is the evidence).
- No wall movement is claimed from this run: one label-only game
  change, one policy file (default-OFF, no driver adopts it yet),
  one measurement re-proof. The scale wall (national / table /
  wins, wave-5) is untouched by this axis this run, as in 1730Z.

## Telemetry deviation check (Steve 2026-10-13)

Command: node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-28/sim-awayvoice-b-reproof-corpus/*.json'
--metrics national,table,wins,exiled. Result: 3 LOUD lines
(national 12 -> 0, table 16 -> 0, wins 16 -> 0; n=9 files =
8 per-seed + sweep summary JSON swept by the glob). All three are
the known field-shape + regime artifact class: corpus rows carry
no top-level national/table/wins paths (competent-only pre-seat
substrate; the arm's own wall numbers are national 0/8, table 0/8,
wins 0/8), and the glob sweeps the summary file exactly as in the
0634Z round's note. Baseline NOT rolled, no investigation item.

## check.js --quick on merged master

Coordinator run on this run's merged tip 782af19e0 (before loop A's
1942 round landed on top; that round is A's responsibility):
284 passed, 6 failed in 337s. The 6 failing scripts, adjudicated:

- scripts/godpath/test-measurement-proof-update.js (retained proof
  staleness — known pre-existing; 1730Z adjudicated the same failure
  at pre-arms base a84b7a1b8).
- scripts/godpath/test-measurement-workflow.js (retained neutrality
  proof staleness — same known pre-existing).
- scripts/godpath/test-mobile-combat-cadence.js (Continue wrap —
  same set as the insideevening worker's branch run).
- scripts/godpath/test-occupation-panels.js (real CLI workflow —
  same set).
- scripts/godpath/test-phone-frame-proof.js (retained phone
  evidence staleness — same set; refreshing it needs real phone
  receipts per MOBILE-PLAYTEST.md, not a node re-run, and is
  maintenance debt for the measurement owner, not this run).
- scripts/test-establishment-r20-fixes-20261020.js (next-day
  voice gate — same set).

None of the 6 scripts references any arm file (grep: 0 hits for
tbFightDeathCause / insideevening / awayvoice in all six), and the
only src/js change in this run's merged range is game.js +19/-9
(the label-only tbFightDeathCause change). The arms' own proofs
are green (see Merges above). Verdict: check.js is NOT green on
this tip, but the 6 failures are the standing pre-existing set,
not regressions from these arms. The retained-proof / phone-proof
staleness is the same debt the 1730Z coordinator recorded: a fresh
proof via scripts/balance-proof-update.js is owed after Game
changes, and it is not silently re-minted here.

## Metric review (MEASUREMENT.md §14)

- No metric was re-scored mid-run in any arm: insideevening's away
  M2 failures stayed failures; arenafallback's coalition seeding
  was disclosed in prereg and judged as disclosed; awayvoice's
  re-proof bar was written before the sweep and judged as written.
- Panel exceptions are stated per arm (label-only / policy-only /
  re-proof), never faked — fourth/fifth sighting of the panel's
  sweep-corpus TypeError class is not re-run where no panel leg
  exists.
- Next-run metric notes (from the arms): insideevening's
  pre-stage-3 tap window must be preregistered from the start;
  arenafallback's 'a stranger' wording is a string tune, not a
  metric change; awayvoice's David health-8 edge stays a
  metric-review proposal, not a re-tune.

## Backlog maintenance (sim-findings.md, this run)

- Marked fixed: dive_deep boundary false refusal (divedeep-fix-b
  0761aab9b); calm_beast unreachable (calmbeast-b 2d9ef7c7e);
  action-bar why reason (barwhy-b 60f873319); away-hunger
  invisibility sightings #939/#954 (same landed beat as #994,
  re-proven this run); away-ration fix line #942 annotated
  (voice half landed, sizing half killed at pilot — line stays
  open only for the sizing half).
- Appended [open]: check.js --quick stall (third sighting);
  'a stranger' wording (needs-eyes); nightly travel home lever;
  pre-stage-3 tap window; morning-persistence upkeep-mover trace;
  walk-quote kcal variance trace.
- Appended [fixed — re-proof, not a landing]: duplicate dispatch
  of the away-hunger voice beat, with the coordinator lesson above.
- NOT touched (Steve-call gated, unchanged): thief pre-payment
  precheck (scope/wording/whether-at-all); pantry-lift convo line
  (who remembers a victimless theft); DOM-tap lodge entry
  (browser follow-up, still the step to call an inside evening
  fully played).

## Infrastructure notes for the next coordinator

- The ONTOLOGY.md 0-byte transient persisted the whole run
  (18:55Z -> closeout). It is NOT in any arm branch and was never
  committed, reset, or touched. If it is still 0 bytes at the next
  run's pre-flight, treat it as the same transient class (check
  for a live doc-sync writer before touching it) — do not fail a
  run on it alone, and do not "fix" it by reset.
- Loop A is mid-round (perceptform + retreatdiag trees active at
  various points; retreatdiag landed 92abb0707 during this run).
  Its perceptform arm may land after this closeout; the next B
  run re-reads the tracker before choosing arms, per the body.
- check.js --quick stalls when sibling lanes run it concurrently
  (arenalabel-b, arenafallback-b, and the 1730Z coordinator note
  all record the class). The coordinator closeout check below
  ran on merged master; if it stalled, that is reported as-is,
  not as a green light.

## Convergence line

food-economy stays converging (NOT converged): the tbEnd death
record no longer lies about any producible origin (arena band
proven, four fallback origins named, wild control intact); the
inside-evening policy is proven and landable as a default-OFF
policy file (it changes no default behavior until a driver adopts
it); the away-hunger voice beat is proven still alive on current
master. No food-economy change in this run touches the scale wall,
and the thief precheck + DOM-tap entry + nightly-travel-home
blanks stay open. scale-onramp stays converging (untouched;
sibling loop A lane). Claim deleted; lock deleted.
