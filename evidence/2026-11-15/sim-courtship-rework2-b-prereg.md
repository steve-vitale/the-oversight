# sim-courtship-rework2-b — PREREG (round 2 of the courtship-deeds rework)

Run: fleshout-loop-b-20261115T1930Z (Loop B), arm sim-courtship-rework2-b
Axis: winnability chain. Rework round 2 — the courtship-deeds lever that
PILOT NO-GO'd twice (1630Z cost bar; 1810Z stall bar).
Branch: sim-courtship-rework2-b — worktree ~/workspace/worktrees/sim-courtship-rework2-b
Base: master at worktree creation (tip e577ef5f8 — the 1810Z coordinator
evidence commit, which landed the courtship-rework-b instrument + evidence)
Date: 2026-11-15
Findings backlog: claims "2026-11-15 — winnability chain — THE
PILGRIMAGE STALLS ON FAR VILLAGES" (sim-findings.md, [open]; claimed by
sim-courtship-rework-b in round 1, still [open] — this arm re-claims it;
[fixed] only if this arm lands a working lever — a pilot GO that
confirms). The covenant-road item ("THE COVENANT ROAD IS GATED BY
OPINION", [claimed] by sim-courtship-b) stays [claimed] — this arm does
not re-claim it.

## Canon note (read first)

docs/CANON.md was read, then docs/MAP.md (travel canon) and the travel
machinery itself (src/js/game.js `travelTo`, `travelTargets`,
`travelBlockage`, `clearBlockage`) — as already grounded in
evidence/2026-11-15/sim-courtship-b-prereg.md and
sim-courtship-rework-b-prereg.md, which this prereg inherits. Nothing
below is invented. The travel canon, in one line (docs/MAP.md, and
game.js `travelBlockage` header): **blockages offer multiple ways
through — cut, clear, bridge, swim, or go around, never one mandatory
path** — and `travelTo` at d>1 checks every tile on a shortest path for
entry blockages from the approach side. The covenant shape, in one
line: Haven holds ≥3 SEASONED covenant peer links (kind 'covenant', no
primary/subordinate; seasoned = 30+ days old AND trust 40+), the rung
(regional a full season: networkLiveDay + 30) has passed, and no
higher-priority shape's beat is pending/live — then "The Founding
Council" stages (pact/pool/walk). Peer proposals need opinion 10+
first.

## The diagnosis (step 1 — DONE, inherited from round 1, mechanism proven)

Read first, in full: evidence/2026-11-15/sim-courtship-rework-b.md and
sim-courtship-rework-b-prereg.md. The 1810Z re-pilot: G1 GO, G3 GO,
cost bar PASS (starvation 0 vs 2; median survival 169.5d vs 189.5d) —
but G2 FAILS on the stall bar alone: band-wide zero-movement
continuation pilgrim-days **54** (bar ≤8), all on seed 100646, across
4 stale drops and 277 walk refusals. The other seven seeds: 0
zero-move days, 0 stale drops — the round-1 walk fixed the stall
everywhere else. Covenant staged 8/8 (7/8 beats answered 'pact' and
sat; 100648's beat staged on the day the village died, unanswered).

The remaining defect is precise and PROVEN by live map probe
(/tmp/probe-646-map.js, diagnostic, no corpus): village_2 sits at
(1,4), village_3 at (1,2). A BFS over the 9×9 with `travelBlockage`
as the oracle finds paths: (4,4)→(4,3)→(3,3)→(2,3)→(1,3)→(1,4). But
the first step, (4,4)→(4,3), moves AWAY from the destination
(Manhattan distance 3→4), because the direct west step (3,4) is
blocked by a **creek**, and the south-west approach is walled by
rubble at (3,5)/(2,6). The round-1 `walkTo` forbids every step that
increases distance to the target — the never-steps-away guard added
to prevent oscillation. From (4,4) the only passable offered step is
(4,3), and the guard vetoes it; from (4,2) the same shape repeats
((4,1)/(4,3) both step away; (3,2) creek, (5,2) rubble). Every
offered step is either blocked or vetoed, so the scholar stands
still for 14 days, drops stale, and re-picks the same village.

So the remaining defect is precise: **the greedy walk cannot take a
detour whose first step moves away from the destination.** A single
rubble tile was the 1630Z cause; a creek + rubble pocket that forces
a northward detour is this run's cause.

## THE FIX — BFS pathfinding in the policy (chosen over a bounded step-away allowance)

The lever is the same two deeds, same prices, same gates. What
changes is the WALK — all in scripts/policies/competent-courtship-b.js,
zero src/js:

**Choice: BFS pathfinding, not a bounded step-away allowance.** Four
reasons, frozen here:
1. **Complete on the 9×9 board.** If any orthogonal walk exists from
   the scholar to the village, BFS finds the shortest one. A bounded
   allowance can still stall in a pocket deeper than the allowance,
   and can oscillate at the allowance boundary (step away, step back,
   step away again) — the exact failure the never-steps-away guard
   was written to prevent. BFS cannot oscillate: every step strictly
   decreases BFS-distance to the target, so the no-oscillation
   property the guard protected now holds exactly, not greedily.
2. **Same honesty oracle.** Passability of each single step is
   `Game.travelBlockage(next, from=current)` — exactly the rule
   `travelTo` applies to a d==1 hop (destination blockage from the
   approach side, creek unless bridged/swimmer). A step BFS plans
   is a step travelTo takes; the policy never asks travelTo to do
   anything the engine would refuse.
3. **Canon: it is the "go around" way.** docs/MAP.md — blockages
   offer multiple ways through, "cut, clear, bridge, swim, or go
   around". BFS walks around. No new mechanic, no src/js, no
   clearing/bridging/swimming — the scholar just takes the open road.
4. **Bounded and cheap.** The board is 9×9 (81 tiles); BFS is
   recomputed per hop (≤10 hops per walkTo call) and never leaves
   the home board. Villages and Haven sit on-board (round-1
   diagnosis); a destination off the board falls back to the old
   greedy nearest-first step, unchanged.

**Implementation (frozen):**
- New `bfsNextStep(Game, hx, hy)` (exported for the proof test):
  orthogonal-only BFS from the scholar's current tile to (hx,hy)
  over 0..8, neighbor passability = `travelBlockage(nx, ny, cur.x,
  cur.y)` null. Returns the first step of the shortest path, or
  null when no path exists (genuinely walled in) or the destination
  is off-board. Pure reads only — no travelTo, no say, no state
  writes — so planning never narrates and never moves.
- `walkTo` rewritten around it: each hop takes `bfsNextStep`'s
  step via one `travelTo`; if BFS returns null, one greedy
  nearest-first step (the round-1 body, kept as `greedyStep`) is
  tried so an off-board destination still walks one step closer;
  if no step moves, the walk stops (bounded, no spin). The
  never-steps-away guard is REMOVED — BFS-distance, not Manhattan
  distance, is the progress measure now.
- `pathBlocked` is KEPT (the greedy fallback's pre-check; the
  round-1 proof test still asserts it) and still exported.

**Voice polish (named open item from round-1 sense-testing, same
function, one flag + one line — NOT a gate):** the return line
("You walk back into Haven, {name}'s codex still open in your
head.") fires even when the study just completed and the codex is
now read. The return now distinguishes: after a completed study,
"...their codex now read — the road was worth walking."; after a
stale turn-home, "...their fire behind you — their codex stays
unread." Both lines still carry 'codex' and 'walk back into Haven',
so LINK_LINE_RE and the round-1 return-line assertion still match.
(The engine's own adjacent-day homecoming double-line is untouched
— engine text, not policy text.)

WHAT IS NOT CHANGED (frozen): the aid price (2,000 kcal, pantry
gate 12,000, max 6,000/run); the stale window (14 days); the tend
gate (20,000); the twice-stale retirement (PILGRIM_MAX_STALE_DROPS
= 2); engine-courtship surfacing (finding #2, next arm); no src/js;
the pilgrimage start / stale lines (unchanged text).

EXPECTED ARITHMETIC (frozen prediction, not a bar): with the walk
fixed, the 100646 stall is gone — every pilgrimage completes in
1–3 days (start + walk + study + walk home) or ends in a stale
turn-home only when genuinely walled in (no BFS path); zero-move
continuation pilgrim-days band-wide ≈ 0 (the only remaining
zero-move days would be a fight interrupting a walk, or a
genuinely walled-in village); stale drops band-wide ≈ 0; studies
complete on ~every attempted village; opinion-10 timing and
covenant staging at or above the round-1 armed leg (median day 16,
staged 8/8).

## Seed-band freshness (verified BEFORE any judged sim)

Per ~/workspace/custom-skills/local_seed_band_freshness/SKILL.md —
exact-seed grep over all dated preregs
(evidence/*/sim-*-prereg.md), the convergence tracker, scripts/,
and evidence filenames:

- PILOT BAND 100761–100768: exact-seed grep (100761…100768) over
  all preregs + tracker + scripts/ = 0 hits; evidence filenames
  = 0 hits. FRESH. The coordinator's brief proposed this band;
  this prereg spends it as the pilot band.
- CONFIRM BAND 100621–100636 (16 seeds): named ONLY by the
  courtship-b prereg as its reserved confirm band, UNSPENT (both
  re-pilots were NO-GO; no confirm ran). This prereg carries the
  reservation forward: spent ONLY on a re-pilot GO. The onlylead2
  reserved bands 100429–100436 + 100441–100448 stay fresh and
  unused, as before.
- SPENT BANDS (never reuse): 100601–100608 (1630Z pilot),
  100641–100648 (1810Z re-pilot). Seed 100646 is used ONLY as an
  in-memory live regression inside the proof test (§3, no corpus
  written) — the same diagnostic precedent as the round-1 probes.

## Primary metric + GO bars (binding, §14)

COMBINATION RULE (carried from round 1): **GO requires G1 AND G2
AND G3 AND the cost bar; any FAIL = PILOT NO-GO, and the cost bar
is a veto.** No bar is re-scored mid-run; a miss is written under
"metric review" with a revision proposed for the NEXT run.

- G1 INSTRUMENT VALIDITY — GO iff the driver captures a full
  per-day link roll + shape-candidate roll + DAILY MAX-KNOWN-
  OPINION read + DAILY SCHOLAR POSITION + pilgrim state on all 16
  configs (8 seeds × covenant-baseline / courtship-armed), 0
  instrument errors, EVERY staged beat classified by shape with
  sat/unsat, UNCLASSIFIED ≤ 1 per 8 seeds on the armed leg, and
  the pilgrim rollup present on every armed record. Any instrument
  error, unclassified shape beyond the bar, staged beat without a
  shape, or missing pos/pilgrim field = NO-GO.
- G2 THE LEVER — GO iff on the courtship leg, COVENANT BEATS
  STAGED on ≥3/8 pilot seeds AND every staged covenant beat is
  answered 'pact' and sat (READING, adopted from round-1 metric
  review #2 and frozen here: a beat that stages on the day the
  village dies is EXCLUDED from the sat denominator, not counted
  unanswered — it was never answerable), AND the stall read holds:
  zero-movement continuation pilgrim-days band-wide ≤ 8 AND
  per-seed ≤ 8 on EVERY seed (round-1 metric review #1: the
  band-wide bar alone let one seed hide the stall; the per-seed
  bar is the same number applied where the stall lives), AND
  stale drops band-wide ≤ 4. A miss on any clause = NO-GO, never
  re-scored mid-run. Lead beats staged on the courtship leg are
  reported (expectation: 0 — the leg proposes no lead links); a
  lead staging means the isolation failed and the pilot is
  re-examined, not re-scored.
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch
  diff and the proof tests are green (test-courtship-rework2-b.js,
  new — the BFS walk + instrument, GREEN before any landing;
  test-courtship-rework-b.js 58/58, test-courtship-b.js 57/57,
  test-covenant-b.js 33/33, test-onlylead-b.js 29/29,
  test-onlylead2-b.js 24/25 — the recorded baselines from the
  round-1 tip, re-verified on this tip). ONE NAMED DESIGN-CHANGE
  UPDATE (repo AGENTS.md: a test broken because the design
  changed on purpose is updated in the same commit and said so):
  test-courtship-rework-b.js §1a(a) 'walkTo counted the refused
  jumps' (walkRefusals ≥ 1) encodes the OLD walk, which counted
  travelTo refusals on jumps BFS never attempts — BFS plans
  around the rubble, so the walk takes ZERO refused jumps by
  design. The assertion is updated to the BFS semantic
  ('BFS plans around the rubble with zero refused travelTo
  calls': walkRefusals === 0 and every travel call landed); the
  check count stays 58/58 and the change is recorded here and in
  the evidence file. A CHANGE from any other recorded number is a
  failure — no test is edited to go green. Any src/js change =
  NO-GO.

Cost bar (round-1 form, KEPT as the binding bar — the veto — with
the metric-review #3 split reported alongside): starvation deaths
pooled courtship ≤ baseline + 2 AND median survival courtship ≥
0.8× baseline median. Guardrail (§14c): villager (non-scholar)
combat deaths are a co-primary read on every seed — the evidence
names any seed where courtship deaths exceed the before leg by
>50%. SPLIT (analysis, not a second bar): the evidence ALSO
reports starvation per seed split by lever spend (aid kcal paid
before the death day) AND by scholar absence (pilgrim-days before
the death day), so the bar's verdict can be read against the
lever's own spend and its own absence instead of the weather.

## Method (staged, §§9–12, 14–15)

- STAGE 0 SUBSTRATE SMOKE (before the pilot, in-memory only):
  the proof test (§2 game smoke) runs the BFS policy on pilot
  seed 100761, 200d, via the driver as a module — NO corpus is
  written, so the pilot band is not spent. It must show the deeds
  firing (studyVillageCodex ≥ 1 call — the arrival proof; aid
  ≥ 1 OR the counters account for the window as in round 1),
  max-known-opinion ≥ 10 reached in-window, a study completing
  within 3 days of its pilgrimage start, and the pos/pilgrim
  snapshot fields present every day. PLUS §3 LIVE REGRESSION
  (in-memory only, seed 100646 — the stalled seed from the spent
  100641–100648 band; NO corpus written, so no band is spent):
  the full 200d courtship leg on 100646 must show zero-move
  continuation pilgrim-days ≤ 8 AND ≥ 1 study completing on
  village_2 or village_3 (the villages that stalled). If §3
  fails, the pilot is NOT spent (SUBSTRATE-MISSING re-check,
  onlylead precedent) — the BFS fix does not do what this prereg
  claims on the one seed where the defect was proven.
- STAGE 1 PILOT (8 seeds × 2 policies = 16 configs, 200d
  death-aware, identical seeds, BOTH legs run fresh): the judged
  run. Horizon 200d because the covenant road needs it
  (round-1: first beat day 62 even on the fastest staging seed).
  Seeds (exact literals): 100761, 100762, 100763, 100764,
  100765, 100766, 100767, 100768. Policies:
  competent-covenant-b (baseline — the road walked, no opinion
  lever) vs competent-courtship-b (BFS rework — the same road +
  courtship deeds with the walk fixed), identical seeds. The
  courtship leg is the judged leg; the covenant leg is the
  control. The contrast isolates the BFS fix: same road, same
  deeds, fixed walk.
- CONFIRM (16 seeds × 2 policies) ONLY on a pilot GO, on the
  fresh band 100621–100636 (carried above). A borderline pilot
  is reported as-is; the coordinator decides. Do NOT spend a
  confirm to rescue a NO-GO.
- DRIVER: scripts/onlylead-driver-20261115.js (extended — see
  instrument changes below; same recorder, same shape-candidate
  roll). Per-seed JSON to
  evidence/2026-11-15/perseed-courtship-rework2-b-control/
  (baseline) and evidence/2026-11-15/perseed-courtship-rework2-b-on/
  (courtship). Zero src/js. RUN=courtship-rework2-b.
- ANALYZER: scripts/analyze-onlylead-b.js (unchanged — the
  pilgrim rollup already reads the driver's pos/pilgrim fields).
  Writes evidence/2026-11-15/courtship-rework2-b-analysis.json.
- BALANCED PANEL (§15): panels are built in the
  scripts/balance-panel.js schema from the two per-seed dirs
  (new builder scripts/build-courtship-rework2-panels-20261115.js,
  same construction as the round-1 builder), and the compare
  itself is run through scripts/balance-panel.js
  (`node scripts/balance-panel.js compare --before
  <panel>-before.json.gz --after <panel>-after.json.gz --out
  evidence/2026-11-15/courtship-rework2-b-panel`) — the panel is
  the instrument, the pre-registered G2 bar is the judge. Built
  for the record whether the pilot is GO or NO-GO (onlylead2
  precedent).
- ENV: defaults, matching the courtship-b legs — COUNTER_ANSWER
  unset, COMPETENT_FLEE_REPAIR unset, ANSWERMAIL_DRIVE unset. No
  other env.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures —
  the driver observes the policies' own play; nothing is staged.

## Instrument changes (frozen BEFORE the pilot — all in this prereg)

1. POLICY — scripts/policies/competent-courtship-b.js: BFS
   pathfinding (`bfsNextStep`, exported) + `walkTo` rewritten
   around it (greedy nearest-first kept as `greedyStep` for the
   no-path / off-board fallback); the never-steps-away guard is
   removed (BFS-distance is the progress measure);
   `pathBlocked` kept for the fallback + the round-1 proof test;
   return line distinguishes a completed study from a stale
   turn-home (one flag `ctx._returningStudied` + one line each).
   Aid price, pantry gate, stale window, tend gate, twice-stale
   retirement: UNCHANGED.
2. DRIVER — scripts/onlylead-driver-20261115.js: `dirFor` maps
   RUN=courtship-rework2-b to
   perseed-courtship-rework2-b-control / -on (covenant → control,
   courtship → on). No other driver change.
3. PROOF — scripts/test-courtship-rework2-b.js (new; §1 static:
   the 100646 creek/rubble shape + the (4,2) village_3 shape —
   first step moves AWAY in Manhattan and still arrives, no
   tile revisited, zero refused travelTo calls; walled-in null;
   off-board fallback walks one step closer and stops;
   pilgrimage end-to-end on the 100646 shape studies within 3
   days; §2 game: live 200d smoke on pilot seed 100761,
   in-memory only, + determinism; §3 live regression: 200d on
   seed 100646, in-memory only, zero-move ≤ 8 + a study on
   village_2/village_3). test-courtship-rework-b.js §1a(a): the
   ONE named assertion update (see G3).
4. PANEL BUILDER — scripts/build-courtship-rework2-panels-20261115.js
   (new; same construction as the round-1 builder, new dirs /
   seeds / RUN / observer digest).

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the staged beat + answer lines the driver captures and judge
whether the Founding Council reads like a played ceremony — AND
read the pilgrimage lines: does the start line name the village
and the road, does the stale turn-home line say WHY the scholar
turns, does the return line now distinguish a completed study
("codex now read") from a turn-home ("codex stays unread")? Do
the deeds arrive as played lines with named villages and
remembered gifts, or as ledger entries? Judge meaning and
coherence, never just counts. In particular: does any pilgrimage
line repeat daily, and does a stall — if any trip still goes
stale — read aloud instead of vanishing?

## Evidence

- Prereg: this file.
- Instrument substrate (on master, unchanged):
  scripts/policies/competent-scaleclimb-b.js and
  scripts/policies/competent-covenant-b.js (the covenant road).
- Lever: scripts/policies/competent-courtship-b.js (BFS rework).
- Driver: scripts/onlylead-driver-20261115.js (extended: dirFor
  for RUN=courtship-rework2-b).
- Analyzer: scripts/analyze-onlylead-b.js (unchanged).
- Proof: scripts/test-courtship-rework2-b.js (new); re-verified:
  scripts/test-courtship-rework-b.js (one named assertion update,
  see G3), scripts/test-courtship-b.js, scripts/test-covenant-b.js,
  scripts/test-onlylead-b.js, scripts/test-onlylead2-b.js.
- Panel builder: scripts/build-courtship-rework2-panels-20261115.js
  (new).
- Per-seed JSON: evidence/2026-11-15/perseed-courtship-rework2-b-control/
  (8 files) and evidence/2026-11-15/perseed-courtship-rework2-b-on/
  (8 files).
- Analysis: evidence/2026-11-15/courtship-rework2-b-analysis.json.
- Panel (GO and NO-GO, for the record):
  evidence/2026-11-15/courtship-rework2-b-panel.*
- Evidence: evidence/2026-11-15/sim-courtship-rework2-b.md
  (per-seed per-shape tables with ALL failing gates + rung naming,
  opinion trajectories per leg, pilgrim stall table, deeds table,
  wall numbers, sense-testing, metric review).

## Convergence state

Courtship-deeds rework round 2 on a 200d horizon. The verdict is GO /
NO-GO against G1/G2/G3 + the cost bar above (pilot), plus confirm
on GO. If GO, the BFS-reworked courtship policy lands as its own
commit(s) — policy + evidence + tests; NO default flip, NO src/js
change. If NO-GO, evidence-only record; no game change. Killed
arms leave no trace. The findings-backlog item ("THE PILGRIMAGE
STALLS ON FAR VILLAGES") is marked [fixed] only if this arm lands
a working lever — a pilot GO that confirms. The covenant-road
item stays [claimed] until the same bar is met on the road itself.
