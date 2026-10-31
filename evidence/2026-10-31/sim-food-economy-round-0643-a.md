# sim-food-economy-round-0643-a — coordinator evidence (Loop A run fleshout-20261031T0643Z)

Axis: food-economy (converging). Sibling Loop B held a live claim on
scale-onramp at run start (claim fleshout-loop-b-20261031T0436Z: sim-sighit-b,
sim-heraldhp-b, sim-deadfall-b — NOT touched), so Loop A worked food-economy,
the topmost axis not converged and not live-claimed. Rotation file read 3
(villager agency); the convergence rule overrides the rotation, and the arms
below use the levers as lenses on food-economy.

All three arms DIAG or POLICY-PROTOTYPE ONLY: zero src/js changes, zero
policy-default flips, zero edits to existing policy files. One arm GO with a
game-code branch available deliberately NOT taken (prototype artifact, no
game change); one arm GO verdict (correct-as-wired); one arm NO-GO at pilot
(prototype deleted, no trace). No food-economy default flipped, no balance
change landed.

## Pre-registration (coordinator)

- Primary question: work the tracker next-blank (1) — a strand-fix design
  reckoning with a near-minimal routine — plus the two open measurement
  blanks adjacent to it: the refused-fell repetition (#1590) and the
  reactor-day kcal gate (#1582).
- Method: staged (pilot before confirm), death-aware horizons, pre-registered
  per-arm GO thresholds in each arm's prereg, judged exactly as written.
  Balanced panel (§15): N/A for all three arms — DIAG/policy-prototype arms
  run no balance comparison; tickfell states the panel reason in its prereg
  (balance-panel.js runs 150-day sweep-compare policies and cannot express
  this 30-day strand-evening census stack; its comparison is control-vs-
  tickfell legs on identical seeds via the census analyzer, never labeled
  a panel compare). No panel compare is attached, and none is claimed.
- Shared substrate (from the 0415Z/0537Z rounds): POLICY=nighttravel,
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1,
  strand seed 15215 (+ band seeds where stated).
- Base at arm start: master 3c03d468b. Master moved once under the run
  (journey-scale r61 evidence, 05f3dfe78 + 5bb15d354, zero src/js, no file
  overlap with any arm); all three branches rebased clean and proofs re-run
  after every rebase and on merged master (see Landing notes).

## Arm 1 — sim-tickfell-a: NO-GO at pilot (prototype deleted, no trace)

Commits (rebased): prereg 11f96306e, addendum f94ca63a3, results 4544a5892,
coordinator cleanup b46ff5c61 (EMPTY — see Landing notes) + real deletion
7a2930129. Proof: scripts/test-tickfell-a.js 71/71 as run by the worker
(33 unit + 38 corpus, incl. the exact 96/95 projection boundary and
fell-gate ordering); determinism re-run of tickfell-ON 15215 byte-identical.
The trace + test files required the deleted prototype module, so they were
deleted at merge (see Landing notes); the analyzer + corpora + evidence
record the pilot result and the analyzer still reproduces NO-GO on merged
master.

Plain-words answer: the tick-budgeted morning fell never got to prove
itself, because on this village's strand mornings the villager never holds
an axe. The gate was designed to allow one fell only when the evening would
still have 96 ticks left for a bridge — and on the mornings where time was
roomy it still could not fire, because the tool was a whittle-tier stone
knife and the food in hand was 0–52 kcal against an 80 floor. The gate
discriminates (3 pass / 4 fail on wood-short mornings) but is starved:
no axe, no food, no fell. Even an axe alone would not have fired without
food.

Numbers: pilot, seed 15215, 4 legs, DAYS=30. 0 tickfell attempts on either
leg. All 7 wood-short ON strand mornings (L10–16) fail canFell with a
whittle Stone knife while a big tree stands in reach (tool-gate, zero
cutTree calls — check-first held, no refused-fell cost paid); all 7 also
fail the kcal floor (0–52 vs 80); the tick gate splits 3 pass / 4 fail
(projected 117–118 on roomy 256-left mornings, −10/−11 on tight 128-left
mornings). Against the prereg exactly as written: clause (a) FAIL — 0
both-evenings rescued (both-evenings 7, 8, 9 still on both tickfell legs);
clause (b) PASS — guard strand 3→3, ON 10→10; clause (c) PASS — guard no
death→no death, ON vessel death day 17→day 17. Per staging, the 9-seed
confirm band was NOT run after a pilot NO-GO. Strand set re-derived with
zero drift from lackingline: guard 7–9, ON 7–16; tickfell legs
census-identical to controls (wrapper neutrality measured, not assumed).
Sense-read: strand days read as a person living (forage, eat, learn,
fireside gossip) with honest refusals; tool-gate mornings carry no
in-story line about the nearby trees.
Evidence: evidence/2026-10-31/sim-tickfell-a.md (+ prereg, addendum).

## Arm 2 — sim-fellrepeat-a: DIAG-GO, verdict branch (b) — #1590 prototype artifact

Commits (rebased): prereg 0c024cbcd, results 05cbcf8b4. Proof:
scripts/test-fellrepeat-a.js 30/30 with all three corpus dirs as arguments
(13/13 bare — the count difference is the corpus checks, not a gap; both
verified on merged master).

Plain-words answer: the game itself never repeats a refused fell line —
it never refuses one at all in these sims, because the base village policy
never tries to cut a tree (only the screen button and prototype policies
call it). The tripled line was purely Loop B's prototype trying, being
refused, and trying again twice more. A person stops after the first
refusal, and the recorded design rule is exactly that: pre-check canFell
before ANY re-attempt in future prototypes. No game change landed,
deliberately.

Numbers: control legs, seed 15215, DAYS=30: 0 refusals and 0 fell successes
on all 60 loop-days across both legs (guard mornings 8–10, ON mornings
8–17, all transcripts stored). Days 10/12/14 — combined-b's fell mornings
— are 0 on both legs. The same counter read-only over Loop B's MORN-ON
corpus reproduces 3/3/3 on days 10/12/14 with the verbatim line "Your Stone
knife can't fell a giant — it takes branches, not trunks. You need an
axe." — the instrument is not deaf; the base is silent. The 9-seed band
was NOT run, per the prereg's conditional trigger (pilot found zero
refusals on every day). Strand re-derived on this base with zero drift
(guard nights 7–9, ON nights 7–16).
Evidence: evidence/2026-10-31/sim-fellrepeat-a.md (+ prereg).

## Arm 3 — sim-reactorgate-a: DIAG-GO, correct-as-wired (#1582 ANSWERED)

Commits (rebased): prereg 2c6e4f035, results 7d8e55d63. Proof:
scripts/test-reactorgate-a.js 71/71, including determinism (ON-variant
re-run byte-identical) and static code-path checks; verified on merged
master. Zero trajectory drift: still-day sets reproduce exactly (control
7–16, variant 7–23) and all 30 evening outcomes match the tickbudget
corpora evening-for-evening on both legs (0/30 diffs each).

Plain-words answer: the bridge gate reads only the food in the villager's
hand — not the reactor — and that is correct as the game is wired, because
the reactor covers the body's daily burn while bridge-lashing is priced as
work effort, which the game charges out of hand food for everyone including
reactor bearers. The famous reactor evening was never decided by food
anyway: it failed all three gates and wood decided it first.

Numbers: ON-variant day 13 (the observed reactor evening): reactor
installed true, online true, ability held true, holder player, install
line present verbatim ("FUSION REACTOR: the pellet goes in… You will
never be hungry again"). Gate inputs: wood 2, kcal 0 (cls.kcal, cls.kcalLive,
and row-time scholar.kcal all agree at 0), ticks 95 (need 96) — all three
gates fail, skip wood-short (first-failure order), narration verbatim "No
bridge tonight — the pack holds 2 logs, and a bridge needs 4." Persistence:
reactor stays installed/online every still evening days 14–23, the gate
keeps reading hand kcal (308–1420 in hand from day 14 on — the bearer
keeps eating), and the hypothetical 4-log/0-kcal/96+-tick reactor evening
never occurs. ON control day 13 (no reactor on any day): wood 1, kcal 0,
ticks 111, wood-short. Code path: creekremedy-diag.js kcalLive =
Math.round(scholar.kcal) → woodcarry.js bridgeDecision kcal < 60, no
reactor parameter anywhere in the bridge path; game.js buildBridge debits
max(0, kcal−60) as "60 kcal effort" with no kcal precondition and no
reactor exemption; the reactor's wired coverage is metabolic {daily: 0}
plus feast/seat code only. A conditional fix spec (policy-side only, if
Steve rules effort should count reactor coverage) is in the arm evidence
§6 — NOT landed, NOT recommended by the arm.
Evidence: evidence/2026-10-31/sim-reactorgate-a.md (+ prereg).

## Village assessment (plain words)

The village on seed 15215 is the same village the last three rounds have
been watching: it strands on the creek evenings of its second and third
weeks, lives honestly through them (forage, eat, learn, gossip by a fire
that sometimes costs it a bridge log), and the strand is now understood
gate by gate. This round closed two of the strand's open questions and
killed one fix cleanly. What the village is still missing is not a cheaper
morning or a truer refusal line — it is an axe in hand on the mornings
that need one, and food in hand on the same mornings. The near-minimal
routine the tracker asked for does not exist yet as a single move, because
its three ingredients (fed, axe, roomy morning) never co-occur on a strand
morning on this stack. The reactor does not change the bridge story, and
the fell-refusal story was never the game's story at all.

## Blanks filled or documented

- FILLED (measured, no game change): #1590 closed as a prototype artifact
  (fellrepeat branch b); #1582 answered — reactor gate correct-as-wired
  (reactorgate).
- DOCUMENTED (killed cleanly): the tick-budgeted fell gate — NO-GO at
  pilot, prototype deleted, no trace; its arithmetic (ROUTINE_ALLOWANCE=40)
  is proven but never validated against a fired fell and must not be
  cited as a validated routine forecast.
- NEW open items (appended to sim-findings.md): tool tier drops
  whittle→none across the strand with no recorded loss event; axe never
  held on any census-stack strand morning; fed+axe+roomy never co-occur on
  strand mornings; tool-gate skips are invisible in-story (no want line);
  buildBridge has no kcal precondition so the policy gate is stricter
  than the engine it mirrors (design question, not a bug); reactor bearer
  still eats (308–1420 kcal days 14–23); evening-gate preregs must require
  classification-time kcal, never row-time (post-decision warmth fuel
  shifts day-14 kcal 950→880).

## Landing notes (coordinator adjudications, not re-judgments)

- All three branches rebased onto master 5bb15d354 (journey-scale r61,
  zero src/js, no file overlap) and proofs re-run green after each rebase
  and on merged master: fellrepeat 30/30 (with corpora), reactorgate
  71/71, tickfell analyzer reproduces NO-GO.
- Tickfell merge flag honored: the worker warned its trace + test files
  require the deleted prototype module and would fail on load. The first
  coordinator cleanup commit (b46ff5c61) came out EMPTY — safe-commit
  stages a deletion only for a file already absent from the worktree, and
  the files still existed on disk. The real deletion (7a2930129, 478
  lines) removed both files after `rm`; the main index then showed the
  known safe-commit clobber (AD entries for the deleted files) and was
  repaired via `update-index --force-remove`; status empty + diff HEAD
  empty verified after repair. The empty commit stays in history, owned
  here as a mistake, not hidden.
- Safe-commit index clobber recurred on worker commits this run as well
  (all three workers report repairs, hashes verified); no clobber on the
  coordinator evidence commit — status verified empty after it.
- check.js --quick NOT re-run (zero src/js, zero policy-default flips,
  zero edits to existing policy files; arm proofs green on merged master,
  same disclosure as 0537Z).
- Worktrees released as merged, branches deleted: sim-fellrepeat-a,
  sim-reactorgate-a, sim-tickfell-a. Claim retired to .DEAD; lock deleted.
  Merged locally, pending ship.

## Telemetry check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-31/sim-{fellrepeat-a-table,reactorgate-a-analysis}.json'
--metrics national,table,wins,exiled` → LOUD lines national 12 -> 0,
table 16 -> 0, wins 16 -> 0 — EXPLAINED, not a regression: the current
inputs are 30-day strand-census DIAG corpora in which national/table/wins
are structurally unobservable, compared against a wall-band baseline.
Baseline NOT rolled forward. Do not quote these LOUD lines as wall
movement.

## Metric review

- Per-arm preregs judged exactly as written; no metric re-scored mid-run.
  Tickfell clause (c) needed its addendum (vessel death or game-over)
  before judged legs — committed pre-leg, disclosed in the arm evidence.
- For the NEXT run: strand-fix designs must pre-register joint
  fed+axe+roomy co-occurrence as their gating condition, not a single
  gate — single-gate designs starve on this stack. Evening-gate preregs
  must require classification-time kcal (reactorgate method note).

food-economy stays converging (NOT converged): the strand's narration
questions are now closed (refusal repetition, reactor gate) and one more
fix design is killed cleanly, but no strand fix has landed and no
food-economy default flipped. Next blanks in order: (1) a strand-fix
design gated on joint fed+axe+roomy co-occurrence — axe acquisition on
this stack first, since no axe ever arrives on strand mornings (the
day-17 corpse-loot arrival is on a different stack/leg, not this census
stack); (2) the lacking-line wording decision (name-first-plus-count
recommended, 0537Z) and the warmth-fuel decision, both still awaiting a
design owner; (3) the two Steve-call items (competent courtship drive;
generation-dealt vs earnable vests) and the warmth default still await
rulings. scale-onramp untouched (sibling Loop B lane).
