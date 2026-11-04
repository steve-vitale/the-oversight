# sim-approachfall-b — BUILD arm: approach-path blocked-step fallback (Loop B run fleshout-loop-b-20261104T1030Z)

## Verdict

**GO (pilot, THIN — read the thinness caveat before citing this as a
loop kill).** Both written bars pass: armed approach-loop fights 0,
cost bar clean (starvation 9 <= 16 totals and 0 <= 2 player-flagged;
median survival 62 >= 52). But the pilot does NOT demonstrate the loop
kill, because the control leg also shows 0 loop fights and the fallback
never fired in any live sim on this band: there are zero failed-approach
turns in either leg (baseline 0, armed 0), and the armed leg has zero
blocked steps of any kind (0 "No path there" lines, 0 zero-tile moves).
What the pilot proves is (a) the mechanism works in stub proofs
(ALL PASS, including gate-off byte-identical control), and (b) the
armed policy does no harm on this band. It does not prove a loop was
killed, because no loop appeared to kill. The confirm MUST NOT re-run
this band and claim a kill; see "What the confirm needs" below. Landing
itself remains the coordinator's --ff-only merge, pending ship. No
rebase, no push, no version bump, no live verification.

## Design (from the prereg, committed before any judged seed)

- Prereg: evidence/2026-11-04/sim-approachfall-b-prereg.md (commit
  9723e8865, before any judged sweep). Fix + tooling: commit 2359076c5.
  Single-base judging: all 16 legs share anchor 2359076c5.
- Seeds 99801–99808, FRESH (verified: no evidence filename and no dated
  evidence .md under evidence/2026-11-04/ mentions them; same check
  against the main tree's evidence/2026-11-04/ also clean). REJECTED
  band, stated: 99701–99708 collides with sim-holdbeat-a.md.
- Horizon 140 days, death-aware. Baseline = scripts/policies/
  competent.js VERBATIM; armed = scripts/policies/
  competent-approachfall-b.js (COMPETENT_DIRECTIONAL_FLEE=1,
  COMPETENT_EXIT_VERIFIED_FLEE=1, COMPETENT_FLEE_REPAIR=1,
  COMPETENT_APPROACH_FALLBACK=1, nothing else; DPS_RACE off).
  Policy-side only: ZERO src/js changes, no gate/price/deed change,
  no default flip. (Prereg interpretation note: the brief's
  "game-code fallback" is implemented where the flee repair lives —
  competent.js — because the loop is a policy decision loop; an
  engine-level fallback would change play for human players too.)
- Smoke (not judged): 99801–99802 both legs, 0 instrument errors,
  scale fields present, no driver change followed — so the smoke legs
  fold into the corpus per prereg.
- BALANCED PANEL (§15): not run as a panel compare, for the reason
  stated in the prereg (balance-panel.js `compare` takes two
  panel.json.gz files from its own registry runs; the variant is not a
  registry policy and registering it would contaminate the baseline
  child — the same reason the fleerepair confirm documented). The
  comparison is the pre-registered per-seed table + analyzer
  aggregates — never a fabricated panel compare. A
  contamination-free registry route is flagged to the coordinator as
  the missing piece for a true panel compare.
- Corpus: evidence/2026-11-04/perseed-approachfall-b/
  (approachfall-s998*-baseline.json / approachfall-s998*-
  approachfall.json, 16 files). Summaries:
  evidence/2026-11-04/approachfall-summary-baseline.json,
  evidence/2026-11-04/approachfall-summary-armed.json. Logs:
  approachfall-smoke-baseline.log, approachfall-smoke-armed.log,
  approachfall-sweep-baseline.log, approachfall-sweep-armed.log.
  0 instrument errors on all 16 legs; 0 scale-read errors
  (scaleMeasured 8/8 in both legs).
- ANALYZER CORRECTION DURING THIS RUN (disclosed, not hidden): the
  first summarizer run used filter 'approachfall', which matched BOTH
  legs (every filename contains 'approachfall-s'), producing a
  contaminated 16-file "armed" summary. Caught before judging; the
  armed summary was re-run with filter '-approachfall' (8 files,
  armed run tag only). The numbers below are from the corrected
  summaries. The first contaminated output was never used for any
  judgement and is not attached.

## The fix (gated, default off)

In scripts/policies/competent.js, CLOSE THE DISTANCE path only,
mirroring the flee repair: (1) 3 consecutive zero-movement approach
steps mark the fight approach-blocked; (2) a blocked fight first
re-picks a different adjacent tile with a real findPath route (tiles
a step already failed on this geometry are blacklisted, so the "Too
far" case cannot re-pick the same tile forever); a successful re-pick
step clears the block; (3) with no reachable adjacent tile the fight
WAITS (tbPlayerWait auto-advances; never endTurn after it) so the
monster's turn can change the geometry, re-probing the step after 5
frozen waits; (4) a monster-geometry change resets the state.
Strike-anyway is NOT a fallback: striking out of range is a documented
no-op in the CLOSE THE DISTANCE comment. Gate-off behavior is proven
byte-identical by the proof test's gate-off control (5 failed steps
re-issued, no wait, no mark).

## Judged table (8-seed pilot, per-seed)

Baseline leg (competent verbatim):

| seed | days | end | TB exp | fieldW4 | W4 kills | escapes | flee-trig | standingFinal |
|------|------|-----|--------|---------|----------|---------|-----------|---------------|
| 99801 | 78 | lost | 9 | 0 | 0 | 0 | 3 | 175 |
| 99802 | 85 | lost | 3 | 2 | 0 | 0 | 0 | 105 |
| 99803 | 86 | lost | 5 | 5 | 0 | 0 | 2 | 110 |
| 99804 | 27 | lost | 0 | 0 | 0 | 0 | 0 | 0 |
| 99805 | 50 | lost | 0 | 0 | 0 | 0 | 0 | 20 |
| 99806 | 29 | lost | 0 | 0 | 0 | 0 | 0 | 0 |
| 99807 | 52 | lost | 0 | 0 | 0 | 0 | 0 | 0 |
| 99808 | 140 | survived | 3 | 5 | 0 | 0 | 2 | 200 |

Armed leg (approachfall variant):

| seed | days | end | TB exp | fieldW4 | W4 kills | escapes | flee-trig | standingFinal |
|------|------|-----|--------|---------|----------|---------|-----------|---------------|
| 99801 | 140 | survived | 5 | 11 | 2 | 0 | 1 | 150 |
| 99802 | 139 | lost | 7 | 10 | 3 | 0 | 0 | 230 |
| 99803 | 50 | lost | 0 | 0 | 0 | 0 | 0 | 65 |
| 99804 | 27 | lost | 0 | 0 | 0 | 0 | 0 | 0 |
| 99805 | 72 | lost | 0 | 0 | 0 | 0 | 0 | 95 |
| 99806 | 29 | lost | 0 | 0 | 0 | 0 | 0 | 0 |
| 99807 | 52 | lost | 0 | 0 | 0 | 0 | 0 | 0 |
| 99808 | 140 | survived | 1 | 0 | 0 | 0 | 1 | 100 |

W4 kills above are killRows per leg (armed 5, all TB-linked;
baseline 0). Orphans (pre-registered non-exposure class, tbEnd with no
exposure): armed 99801 x1 (routed); baseline none. Reported
separately, not scored as missed fights.

## GO judgement (strict, prereg threshold)

Verdict: **GO (pilot, thin)** — both written bars pass.

1. **Approach-loop fights armed == 0: PASS, vacuously (see caveat).**
   Armed loop fights = 0. Baseline loop fights = 0. Failed-approach
   turns: baseline 0, armed 0. Max same-step run: 0 in both legs.
   Armed blocked steps of ANY kind: 0 ("No path there" lines 0,
   zero-tile moves 0). The fallback never fired in a live sim here —
   there was nothing to fall back from.
2. **Cost bar clean: PASS, both halves, both readings.**
   (a) Starvation deaths, totals: armed 9 <= baseline 14 + 2 = 16.
   Arm-only reading (death-tele records flagged player=true): armed
   0 <= baseline 0 + 2 = 2. Both readings pass.
   (b) Median survival: armed 62 days >= 0.8 x baseline median 65 =
   52 days. Baseline days sorted: 27, 29, 50, 52, 78, 85, 86, 140.
   Armed days sorted: 27, 29, 50, 52, 72, 139, 140, 140.

Supporting mechanism evidence (not judged, but it bounds the claim):

- The baseline's blocked steps are NOT approach steps. All 22 baseline
  "No path there" lines and all 30 zero-tile moves sit in turns where
  the weakest monster is IN RANGE (weakestDist 1) with a move target
  NOT adjacent to the weakest monster — i.e. they are flee walks
  (edge targets like (0,4), (0,3)) and similar non-approach moves, not
  CLOSE THE DISTANCE steps. The analyzer's first version used
  closest-monster distance; the weakest-monster diagnostic (below)
  shows why that would also have read 0 — the band's blocked steps
  are flee-branch steps, which the flee repair already addresses.
  The approach branch never failed on this band in either leg.
- Armed fights strike more (median strikes/fight 5 vs baseline 3;
  lost fights 5 vs 3; median damage fraction in lost fights 0.189 vs
  0.085) and kill more (5 linked W4 kills vs 0) — but on divergent
  trajectories with only 13 vs 20 exposures, this is a supporting
  observation, not a judged bar. Per-seed trajectories diverge sharply
  (99801: 78d lost vs 140d survived; 99802: 85d vs 139d), the same
  chaotic divergence the fleerepair runs showed. Totals judging is
  the honest route.
- Armed barrier pushes: 1 (99808, the barrier-crossing chase read in
  the sense-test). Baseline pushes: 0. Flee-attempt turns: armed 5,
  baseline 9. Escapes: 0 in both legs — the flee-repair escape signal
  is also absent on this band (unlike the confirm's 2 escapes).

## Thinness caveat (the headline qualification)

This band cannot confirm a loop kill. Its villages die early (5 of 8
baseline legs end by day 52; 4 legs have zero TB exposures), its total
exposure count is 33 (20 + 13) against the confirm's 108 (53 + 55),
and the confirm's loop shape (5–9 consecutive blocked approach steps,
0 strikes, death) appears nowhere in either leg. A 0-vs-0 primary is
a no-harm result, not a kill result. Citing this pilot as "the
approach loop is fixed" would be wrong. What is proven: the mechanism
in stubs (the proof test covers gate-off identity, 3-fail marking,
wait fallback with no endTurn after it, re-pick-to-strike, and
geometry reset) and no harm on a live band. The kill itself is
UNPROVEN until a confirm shows baseline loops disappearing under the
armed policy on the same seeds.

## What the confirm needs (for the coordinator, not decided here)

- A band that actually produces approach loops in its baseline leg.
  The confirm's band must be fresh (never reuse this pilot's band as
  its own control — and this pilot's band is now a judged band, so a
  confirm cannot re-pilot on 99801–99808 either). The natural
  candidate question: whether the confirm may use the fleerepair
  confirm's band (99601–99612), where approach loops were actually
  observed (5 fights), even though that band was judged for flee —
  or whether it needs a new band screened for exposure density. That
  is a coordinator/Steve call; this arm does not decide it, and does
  not pre-claim that reusing 99601–99612 would be fresh.
- A baseline-signal bar in the confirm prereg (e.g. baseline loop
  fights >= 1), so a vacuous 0-vs-0 cannot pass as a kill again.
  This pilot's prereg lacked one; the confirm's must not.
- The analyzer's failed-approach definition should stay as
  pre-registered here (move-only + zero-tile + weakest-monster
  out-of-range + same-target/same-geometry runs). The weakest-monster
  correction matters: the approach branch keys on the weakest
  monster, not the closest, so a closest-monster predicate would
  misclassify approach turns whenever a different monster is nearer.

## Sense-test (SENSE-TESTING LAW): no loop to read, closest cases read

Neither leg has a loop fight, so per the prereg I read the closest
cases: the most-blocked baseline fights and the armed fights.

Before (baseline): the blocked steps read as a fighter bumping into
the flee geometry, not as the confirm's robot loop — but one fight
shows the OLD flee shape at the end. 99801 seq 5 (suburb, 12 turns):
8 clean Hatchet strikes with legible narration ("OVERCHARGED ×1.25
(well-fed): food is fuel"), then 4 consecutive "No path there" moves
toward edge tile (0,4) — a legacy flee walk failing at the end of a
fight the fighter was winning on strikes — then death. That is the
flee-branch loop wearing the same transcript line, on the verbatim
leg where flee repair is OFF. 99801 seq 2 (reunion, 4 turns): 2
Turncoat ability turns with full narration (the fighter talks the
two Reunions into fighting each other), then 2 failed moves toward
edge tile (0,3), then death — short, not a loop (2 repeats, not 4+).
The baseline's blocked steps never wear the approach shape (target
adjacent to an out-of-range weakest monster); they are edge-target
flee walks. So the sense veto does not fire on the approach path
here — there is no approach loop to veto — but the end-of-fight flee
walk in seq 5 is a reminder that the transcript line "No path there"
is shared by two loop classes, and only the flee class appears here.

After (armed): no blocked steps anywhere, and the fights read as
people fighting. 99802 seq 2 (reunion, 3 turns): three Pocket Sand
throws with deepening narration ("Pocket Sand deepened to L2! You
always have sand. Don't ask." + the sponsors line) — then death.
That is a trick-spam shape worth one line in findings (below), not an
approach loop. 99808 seq 1 (eater, 5 turns): the fighter walks tile
by tile to the edge (3,8 → 2,8 → 1,8 → 0,8) and pushes through the
barrier with honest chase narration ("BARRIER CROSSED — you crash
through to a new area, but they're right behind you — through the
barrier!"), then keeps moving — a person escaping, not a no-op loop.
Armed 99801 fights (5 exposures, 2 won) read as straight fighting:
11, 10, 12, 7 strikes with no blocked steps.

Sense verdict, stated plainly: nothing robotic in the approach path
on either leg, because the approach path never blocked on either
leg. The veto does not fire. But the sense-test cannot confirm the
fallback reads human either — the fallback never ran in a live sim.
Its human-readability rests on the stub proofs (wait instead of
hammering; re-pick to a reachable tile; strike from range after a
successful re-pick), not on a live transcript. The confirm owes a
live fallback transcript.

## Wall numbers (REPORTED, not judged — honestly measured)

Every leg carries measured scale fields (scaleMeasured 8/8 both legs,
scaleReadError null everywhere). Nothing below is hard-coded.

| metric | baseline | armed |
|--------|----------|-------|
| wins | 0 | 0 |
| national reached | 0 / 8 | 0 / 8 |
| table reached (sat, end-state tableDone) | 0 / 8 | 0 / 8 |
| table invited (end-state tableWaiting) | 0 / 8 | 0 / 8 |
| wave-4 faced (TB + field) | 32 | 34 |
| wave-4 kills (killRows; linked) | 0 (0) | 5 (5) |
| wave-5 UNLOCKED (maxWave >= 5; see note) | 0 | 0 |
| wave-5 kills | 0 | 0 |
| median survival (days) | 65 | 62 |
| max standing (final) | 200 | 230 |
| median standing (final) | 62.5 | 80 |
| arc reached (all legs) | 3 | 3 |

Wave-5 note (confirm's honesty correction, kept): the summarizer's
"wave5faced" counts maxWave >= 5, which is wave-5 UNLOCKED, not
wave-5 faced. No leg in either leg reaches maxWave 5, so unlocked and
faced are both 0 here with no ambiguity. No wave-5 spawn is evidenced
in the corpus.

Scale observation (reported, not judged): rank stayed 'village' on
ALL 16 legs even as standing climbed to 200 (baseline 99808) and 230
(armed 99802). Standing alone does not lift rank — the same
standing-without-rank pattern the confirm reported. The scale wall is
unchanged by this arm (as expected — an approach fallback was never
going to move the wall).

Death-cause shares: combat dominates both legs (baseline 369 deaths:
villager combat 182 / 49%, combat 54 / 15%, expedition 35 / 9%, the
wild 33 / 9%; armed 399 deaths: villager combat 180 / 45%, combat 74
/ 19%, expedition 43 / 11%, monster 31 / 8%). Starvation is a small
share in both (14 vs 9). No village reaches wave 5 in a fight, let
alone national, the table, or a win.

## Village assessment (plain words)

The village still mostly dies, and nothing in this arm changes that
arc: 7 of 8 villages are lost in both legs (baseline survivor: 99808
at 140d; armed survivors: 99801 and 99808 at 140d), combat deaths
dominate, no win, no national, no table. What changed is narrow and
honestly bounded: fighters on the armed leg never hit a blocked step
at all (0 "No path there" lines where the baseline had 22), they
strike more per fight, and they killed 5 wave-4 beasts where the
baseline killed none — but on a band where the approach loop never
appeared in the first place, that reads as the flee repair + variance
plus the armed leg's longer-lived villages, not as proof the new
fallback did anything. The blank filled is the mechanism (the
approach path now has a blocked-step fallback in stub proof); the
blank documented is the live kill, which this band could not test.
Knowledge/capability gaps that remain: no live fallback transcript
exists yet (no wait-fallback or re-pick turn was ever recorded in a
live sim); the confirm must produce one.

## Metric review (for the NEXT run, not a re-score of this one)

- The approach-loop definition worked as specified (same-step runs
  with weakest-monster geometry), but its weakest-monster clause was
  load-bearing in a way the prereg did not spell out: the approach
  branch keys on the weakest monster, and the instrument's turn-start
  dists carry per-monster distances, so the analyzer must compute
  weakest-out-of-range from start.monsters + dists — a closest-monster
  predicate would misclassify. Keep the weakest-monster definition.
  The diagnostic that proved the baseline's blocked steps are flee
  walks (weakest in range + non-adjacent target) should be folded
  into the confirm's analyzer as a reported split (approach-target
  vs edge-target blocked steps), so the two loop classes stop sharing
  one count.
- The pilot's GO bar lacked a baseline-signal requirement, which is
  what allowed a vacuous 0-vs-0 to pass. The confirm prereg must add
  one (baseline loop fights >= 1) — proposed in "What the confirm
  needs" above, not applied retroactively here.
- The summarizer's run-filter footgun (filter 'approachfall' matches
  both legs because every filename contains 'approachfall-s') must
  be fixed before the confirm: filter on the run tag suffix
  ('-approachfall' vs 'baseline'), or the next run will contaminate
  its armed summary the same way. This run caught it before judging.
- "wave5faced" in the summarizer is really "wave5 unlocked" — rename
  it before any future wall claim cites it (carried over from the
  confirm's metric review; still not renamed).
- Table is end-state only in this driver (no daily ever-entered
  history). Same limitation as the confirm; a future arm that touches
  the table needs daily capture.
- Per-seed matching breaks under policy divergence (99801: 78d lost
  vs 140d survived; 99803: 86d vs 50d): totals judging stays the
  honest route.
- TELEMETRY DEVIATION CHECK (run-book step 10): scripts/
  telemetry-check.js REFUSED this corpus — "all 16 --current rows
  carry top-level anchorCommit, so they are sweep recorder rows, not
  runs. Recorder corpora are compared with sweep-compare tables,
  never against a run baseline here." That refusal is a tool-shape
  rule, not a deviation finding; --allow-recorder-corpus is for
  recorder-vs-recorder compares, not for a recorder corpus against
  the run-shaped scale-wall baseline, so it was not forced. The wall
  numbers above are instead reported directly from the measured
  per-seed scale fields (scaleMeasured 8/8 both legs). Flagged to the
  coordinator: the run book's telemetry-check step does not fit
  sweep-recorder corpora as written.

## Findings for the coordinator (do NOT edit hidden_files from this arm)

1. Confirm design question (blocking for the kill claim): the confirm
   needs a band whose baseline leg actually produces approach loops,
   plus a baseline-signal bar (baseline loops >= 1). Whether the
   fleerepair confirm's band (99601–99612, where the loops were
   observed) may be reused for this different arm's confirm, or a new
   exposure-dense band is needed, is a coordinator/Steve call.
2. Trick-spam shape (out of this arm's scope; noted, not chased):
   armed 99802 seq 2 — a fighter throws Pocket Sand three turns
   running while the monster kills them, never striking. Ability
   repetition without a strike fallback is worth a glance by whoever
   owns ability-press play. Not an approach loop; not this arm's fix.
3. Standing-without-rank (confirm's finding, reproduced): rank
   'village' on all 16 legs despite standing up to 230.
   Scale-onramp evidence, unchanged by this arm.
4. Summarizer run-filter footgun: filter 'approachfall' matches both
   legs; the confirm must filter on the run-tag suffix. Caught here
   before judging; the contaminated output was discarded.
5. check.js --quick 6 failures are pre-existing base staleness (see
   Proof): the retained neutrality panel already mismatches the
   branch base in 103 manifest entries; this arm adds 2. The
   measurement-proof refresh belongs to the coordinator/ship loop,
   not to this arm.
6. Infrastructure: NEVER full-archive this repo into /tmp. /tmp here
   is a 512M tmpfs and the repo's evidence/ alone exceeds it — a
   `git archive <base>` extraction filled /tmp to 100% mid-run
   (recovered by file-first deletion; home disk is fine at 30%).
   Manifest comparisons against another revision must read blobs
   via `git cat-file` (streaming, no disk), as done for the Proof
   check above.

## Proof

`node scripts/test-approachfall-20261104.js` — ALL PASS (exit 0) on
the pilot branch, re-run after the final test-file edit (smoke seed)
and before the sweep; no code changed after that run except the
prereg commit itself (evidence only), so the proof stands for the
swept corpus. Coverage: gate-off legacy control (5 failed steps
re-issued, no wait, no mark), gate-on blocked (3 fails -> mark, 4th
turn waits, no endTurn after wait), gate-on re-pick (blocked ->
alternate tile -> cleared -> strike from range), gate-on geometry
reset (monster move -> primary path retried), variant gates exact
with DPS_RACE off, analyzer loop/wait/re-pick/strike fixtures,
summarizer loop-fight + player-flagged starvation fixtures, 2-day
live-harness smoke with the variant policy.

Sibling proof, no regression: `node scripts/test-fleerepair-20261104.js`
— ALL PASS on this branch after the approach change landed (the
flee-repair arm shares competent.js; its gates are unaffected because
the approach blocks run only when COMPETENT_APPROACH_FALLBACK=1,
which that proof never sets).

Repo gate: `node scripts/check.js --quick` — 284 passed, 6 failed in
~530–550s, twice (same 6, reproducible). The 6 are PRE-EXISTING on
this branch's base, not caused by this arm — proven, not asserted:
the retained neutrality panel (evidence/2026-10-30/
sim-stashfetch-b-panel-after/panel.json.gz) already mismatches the
branch base's source manifest in 103 entries (policies added and
src/js changed between 2026-10-30 and the 02158dbea base), while this
arm's commits add exactly 2 manifest diffs (competent.js content +
new competent-approachfall-b.js). The 6 failures:
test-measurement-proof-update.js + test-measurement-workflow.js
(retained neutrality proof stale — see above), test-mobile-combat-
cadence.js (Continue round-wrap), test-occupation-panels.js (CLI
workflow), test-phone-frame-proof.js (retained browser inputs /
phone receipt stale vs index.html + src/css + src/data), test-
establishment-r20-fixes-20261020.js (racks-full voice gate). None
touches competent.js, policies, approach, flee, or TB fights, and
none of the files they check (index.html, src/css, src/data, phone
receipts, cook voice) is touched by this arm. The measurement-proof
refresh (scripts/balance-proof-update.js) is a coordinator/ship-loop
job for the whole stale proof, not something this arm regenerates
for its two files — refreshing it here would re-baseline a proof
whose 101 other diffs belong to other lanes.

## Verdict (restated)

**GO (pilot, thin)** — armed loops 0, cost bar clean, sense veto not
fired, mechanism proven in stubs, no harm on a live band — but the
live loop kill is UNPROVEN on this band (baseline loops also 0,
fallback never fired live). The arm is PILOT-GO; a confirm on a
loop-producing band with a baseline-signal bar is still owed before
any default flip is even proposed. Branch tip at report time: the
evidence commit itself (below). No rebase, no push, no version bump,
no live verification — those belong to the coordinator and the ship
loop.

## Files

- Evidence (this file): evidence/2026-11-04/sim-approachfall-b.md
- Prereg: evidence/2026-11-04/sim-approachfall-b-prereg.md
- Corpus (16 files): evidence/2026-11-04/perseed-approachfall-b/
  (approachfall-s998*-baseline.json, approachfall-s998*-
  approachfall.json)
- Summaries: evidence/2026-11-04/approachfall-summary-baseline.json,
  evidence/2026-11-04/approachfall-summary-armed.json
- Logs: evidence/2026-11-04/approachfall-smoke-baseline.log,
  evidence/2026-11-04/approachfall-smoke-armed.log,
  evidence/2026-11-04/approachfall-sweep-baseline.log,
  evidence/2026-11-04/approachfall-sweep-armed.log
- Fix + variant + tooling + proof: scripts/policies/competent.js
  (gated approach fallback), scripts/policies/
  competent-approachfall-b.js, scripts/approachfall-driver-20261104.js,
  scripts/approachfall-analyze-20261104.js, scripts/approachfall-
  summarize-20261104.js, scripts/test-approachfall-20261104.js
