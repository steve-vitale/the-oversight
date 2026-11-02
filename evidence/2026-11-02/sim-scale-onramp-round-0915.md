# Loop A 0915Z round — scale-onramp: deliberate titan routing, two arms

Run: fleshout-loop-a-20261102T0915Z, axis scale-onramp (converging, NOT
converged). Worktree branches sim-titanroute-a + sim-stancelayer-a, both
based at master a9b63b886, both rebased onto current master in their own
worktrees with proofs re-run before --ff-only merges (titanroute rebased
onto 777c8a99d, proof ALL GREEN; stancelayer rebased onto the post-
titanroute tip, classifier 18/18 + validator 21/21). Sibling Loop B
trees/branches NOT touched (Loop B live on food-economy, 0848Z claim:
homewardstep + falseclose; Loop B landed falseclose + 0933Z coordinator
evidence on master during this run — master moved twice under us, both
rebases clean, zero file overlap, zero src/js changes in the master delta).
Rotation untouched (convergence-directed axis work supersedes rotation;
stands at 3). Claim written before any sims; deleted at closeout. Lock
deleted at closeout.

Tracker blank worked: (1) deliberate titan routing — policy sound-the-call
+ march behavior, plus the detail/stance layer.

## Arm sim-titanroute-a — PILOT NO-GO (bar 1 missed by one seed)

Policy only, zero src/js changes. `scripts/policies/titanroute.js` wraps
the frozen baseline stack: after base daily, if a lair is known and the
scholar is fed/watered/healthy, it walks tile-by-tile to the lair and, on
the first night ending on the lair tile, sounds `Game.soundTitanCall`
once. Perception-lawful by construction: the lair comes only from the
scouts' heard say-line; the policy never reads `Game.worldMonsters()` or
any roster (unit proof asserts 0 roster reads). No titan canon doc exists
in docs/ — stated, none invented. Unit proof `scripts/test-titanroute.js`
19/19 green (ALL GREEN re-run on rebased tip).

Pre-registered pilot bars (8 seeds, DAYS=180, identical-seed baseline vs
arm; 97307 + 97301 case/contrast + 6 screened baseline-zero-share seeds):
(1) tile-share ≥6/8 — MISSED, 5/8 (on the 7 baseline-zero seeds, 4/7).
(2) ≥1 sounded call or combat attempt — PASS: 5 sounded calls, 2 real
fights (97301 day 60, lost; 97310 day 85, herald SLAIN). (3) guardrail:
pilot median survival within 20d of baseline — PASS: 94 arm vs 91
baseline. Verdict PILOT NO-GO; a miss is NO-GO, never re-scored. Confirm
owed on a follow-up, not chased in this run.

Per-seed shares / attempts / calls / end-day (baseline → arm): 97307
0/0/0/152 → 0/0/0/152; 97301 8/6/0/90 → 2/10/1/90; 97310 0/0/0/90 →
2/1/1/96; 97318 0/0/0/90 → 0/0/0/90; 97327 0/0/0/92 → 0/0/0/92; 97330
0/0/0/96 → 3/7/1/122; 97338 0/0/0/118 → 8/72/1/125; 97342 0/0/0/65 →
2/0/1/64. Wall totals pilot: national 5/8 → 4/8 (97338 flips 1→0 under
the arm, cause not isolated — flagged), table 5/8 → 5/8, won 5/8 → 5/8,
wave-5 unlock 0/8 → 1/8 (97310 arm, via the kill — the finale arrives
but is not fought within the runs). Wave-5 fought stays 0; full seat 0.

Why the bar missed — arrival failures, not share failures. Arrivals
share 5/5 and call 5/5. 97307: march refused 20/20 days; probe proves
`travelTo(6,4)` returns blockType "creek" every time ((6,4) is a
needsBridge creek tile; `travelBlockage()` returns null for it, so even
a BFS detour would not route around — the creek gate lives in
`travelTo` itself). 97318: lair heard day 89, run ends day 90, sole
window guardrail-blocked (hurt scholar). 97327: lair heard on the final
day 92, zero window. Muster completion: minAllies is 10, and calls on
97330/97338 brought only 6 blades each, so all 79 of their attempts were
refused MUSTER-GATE (even 6 + 3 Haven blades = 9 falls short — deeper
links or a fourth village are also needed). The prototype deliberately
does not commit Haven blades and does not re-sound after a spent muster.

Honest records: void first arm batch (health guardrail read `s.hp`, but
the Game stores scholar HP in `s.health`; every march blocked, arm runs
byte-identical to baseline; fixed in 1175dcf56, void records preserved
as VOID-hpbug-route-s*.json). Prereg addendum before any arm run: first
screening rule omitted the coordinator bar's own condition (baseline
reaches 0); screening proved baseline shares are common once located
(6/14 located seeds share via raid-pin), so fresh pilot seeds were
corrected to the first 6 satisfying lair-heard AND baseline-zero-share;
excluded seeds remain in the screening record. 97301 reproduces in
mechanism with a small tail divergence (end 90 vs 91, national 0 vs 1)
disclosed in arm evidence. Balanced panel: no compare .md attached,
deliberately — the panel runs named registry policies only and cannot
express this prototype stack; wall metrics come from the attached
per-seed driver records. Adding prototype policies to the panel registry
is tooling work for a separate arm.

## Arm sim-stancelayer-a — DIAG-GO (all coordinator bars pass)

Instrument/diagnosis, zero src/js changes. Prereg 4e4046491 (before any
judged sim); closing f361916b5. Classifier unit proof 18/18, corpus
validator 21/21 (both re-run green on rebased tip). Reproducibility exact
for both seeds (97301: wave4 48, stage2 59, present 59–91, attempts days
78/89, lair 8,4; 97307: wave4 116, stage2 129, present 129–152, attempts
0, lair 7,4).

Reconciliation first: the tracker's "lair-tile-stepping days 73/85/87" is
imprecise — those steps landed on the herald's CURRENT tile (5,4), not
the lair tile (8,4), which no travel event targets. The days are from
97301, arm sim-locatedengage-a (0815Z), not 97307 (reconfirmed: 0 shared
monsterTurn calls, 0 arrivals).

Exact blocking gates (function names, src/js/game.js): the stance
machine is `monsterTurn`, and `travelTo` is a tile jump that NEVER calls
it — that is the whole gate. Days 73/85/87 — NO_TURN: arrivals onto
(5,4) by forageTripSeedFirst, then hopped off the same trip, 0 shared
monsterTurn calls each day, 0 attempts. Day 87: herald followed onto
(4,2) and landed exactly on the scholar's detail cell (8,8)=(8,8),
hungry, and still 0 attempts because no stance turn ran there.
Coincided + hungry + zero turns = nothing. `stanceFor` falls through to
curious for the herald (behavior prose matches no branch); curious at
detail distance >3 only stepToward()s (1 cell/turn, no watch); at ≤3 it
watchTurns++ and turns hungry at ≥3; hungry stepToward()s and calls
startCombat only on detail-cell coincidence. monsterTurn runs per detail
step, interact, wait batch, search/examine — never per travelTo, never
at dawn, never during sleep (0 sleeping shared calls in 49).

Attempt days are CLOSED-IN-DAY, not dawn coincidence (instrument
correction, bars unaffected): day 78 wait-phase calls #0–#9 closed
d8→d0 (8 progress + 2 terrain stalls), attempt on closing turn #9,
re-fires #10/#11; day 89 closed d8→d0 in 8 turns, attempt on #7. The
0815Z "coincided at the morning snapshot" reverses cause and effect: the
pre-daily sample is taken after the harness's pre-daily waits, so the
snapshot shows what the waits already closed. Near-misses: day 77 ended
d1 (one turn short), day 80 d1, day 79 d4 with blind-turn flicker; day
76's single call was BLIND (canSee false → lostSight 0→1, stance never
initialized).

March-policy requirement list (for the titanroute follow-up): (1) arrive
on the herald's CURRENT tile, not the lair tile; (2) arrival is not
engagement — do something after arriving; (3) linger AWAKE on that tile
and generate shared turns (waits first, ~4/batch; 8–12 turns closed d8);
do not leave until the attempt fires; (4) budget from arrival state:
fresh curious at d8 needs ~8–11+ turns, hungry at d7 needs 7; (5) keep
line of sight — blind turns earn nothing and 7 in a row despawn
(lostSight > 6); (6) do NOT sleep on the tile as the plan (zero sleeping
turns observed); (7) do not change tiles mid-close — every hop re-places
detail cells and re-opens the distance; (8) muster before/during the
close — all 4 attempts were refused MUSTER-GATE (mitigating: coincided
turns re-attempt every turn, day 78 ×3); (9) stance persists across days
(hungry 77→89), distance does not.

Open puzzle (not a bar item): days 74/75/81 show the herald home at the
pre-sample yet 0 shared calls; the non-judged mt-count probe shows 16
total calls/day, 0 shared. Candidates: pin lands after wait batches, or
the pinned herald is shadowed on the home tile (monsterAt returns first
entry; raid pins ignore occupancy). The probe's post-first-refusal days
diverge and are discarded. Stancelayer check.js --quick: 284 passed, 6
failed in 489s — all 6 in pre-existing suites untouched by this arm, no
stancelayer file in the run, zero src/js/shared-test changes, so not
caused here.

## What the village looked like (plain words)

When the village marches, it stops being a place things happen to and
goes out to meet the sky getting bigger — and pays in lives either way:
about 8 lives for a won herald fight, about 13 for a lost one. Villages
that march but muster only 6 blades stand on the monster's tile for
days, ready to die, and are told by arithmetic they may not fight.
Waiting is not free either: the herald ate 1,980 kcal in one night on
97310 while the village deliberated. And the stance arm's day-87 read is
the quietest finding of the round: the scholar walks onto the tile, the
herald trails onto the scholar's exact cell, the scholar walks home, and
the game says nothing — no warning, no line. A route-only march policy
reproduces that silence at the destination. Marching without lingering
awake is arriving without meeting.

## Transcript reads (sense-tested)

97310 days 84–85 (titanroute): scouts find lair (7,4) → herald feeds
that night (1,980 kcal, deliberation visibly priced) → "THE CALL GOES
OUT" → three villages answer by name with 11 named blades → scholar
(7,4), herald (7,4), shared → day 85: "THE HERALD FALLS. The realm
exhales." Coherent end to end. Minor voice note: the fight banner
"You're on your own" reads lonely for a coalition fight (game's voice,
not the policy's). 97301's parallel story is a coherent loss: call day
59 (10 blades exactly), fight day 60 lost, "muster is spent," then
refusals at have=0. Day 87 (stancelayer): no anchored herald line at all
— that absence is the finding, above.

## Blanks filled / documented

Filled: deliberate march + sound-the-call under the perception law
(titanroute, prototype, pilot NO-GO); the stance-layer gate decomposition
(stancelayer, DIAG-GO) with a march-policy requirement list. Documented
for follow-ups, in order: (1) creek-aware march routing (detour on
visible tile types + refusal memory, or a bridge/swim action) — the
97307 block; (2) linger-awake close behavior per the requirement list
(waits on the herald's current tile, not the lair tile) — the direct
child of this round, and the titanroute confirm depends on it; (3)
muster completion (commit-own leg + deeper links / fourth village);
(4) re-call after spent muster (design question, documented not
decided); (5) refusal-voice escalation (72 identical MUSTER-GATE lines
on 97338); (6) post-kill lingering with no spoken reason; (7) 97338
national flip, cause unisolated; (8) days 74/75/81 home-presence zero-
shared-calls puzzle; (9) prototype policies in the panel registry
(tooling arm).

## Metric review

Bars held as pre-registered; no re-scoring. Titanroute bar 1 missed by
one seed (5/8 vs ≥6/8) — the miss is arrival-window luck (two seeds'
lairs heard on/near the final day) plus one hard creek block, not share
mechanics, but the bar was the bar: NO-GO stands, and the confirm is
owed on a follow-up with linger-awake + creek-aware routing, not on
this prototype. Stancelayer's attempt-rule fix mid-run (pre-trace to
first-firing-call) is a correction, not a re-score: both attempt days
satisfy both definitions and no bar depended on the label. Panel
limitation recorded (registry policies only) — future prototype arms
should either register the policy or pre-declare the driver-table
substitute, before judging.

## Telemetry

telemetry-check.js REFUSED the per-seed glob by design (all 42 rows
carry top-level anchorCommit — sweep recorder rows, not runs; same
refusal class as 0815Z/0725Z/0605Z/0445Z). No override, no baseline
reseed, baseline NOT rolled. No LOUD line.

## Coordinator catch

Index clobber struck both workers' safe-commits (repaired by the
workers, commits verified correct by blob hash) and was checked after
this coordinator commit (status clean, below). Master moved twice
during landing (sibling playtest journey-endgame r105, then sibling Loop
B 0933Z evidence); both branches rebased cleanly in their own
worktrees with proofs re-run on rebased tips before --ff-only merges
(second branch rebased AFTER the first merge, per the 0605Z lesson).
Merges verified alone before any chained release/remove step. No
index clobber on the coordinator commit (verified: git status empty
after commit).

scale-onramp stays converging (NOT converged): deliberate routing now
exists as a prototype and the stance gate is decomposed to the missing
layer (linger awake on the herald's current tile) — but the pilot is
NO-GO, no game change landed, no full-seat win is shown, and wave-5
fought stays unshown. Wall UNCHANGED in substance: full seat 0 /
wave-5 fought 0 stand as last measured (Loop A lane). food-economy
untouched (sibling Loop B lane).

Merged locally, pending ship (both arms: prototype + diagnosis).
