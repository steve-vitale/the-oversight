# sim-fleerepair-confirm-a — CONFIRM of the fleerepair pilot (Loop A run fleshout-20261104T0820Z, axis scale-onramp)

## Design (from the confirm prereg, committed before any judged sim)

- Confirm prereg: evidence/2026-11-04/sim-fleerepair-confirm-a-prereg.md
  (commit b9f56a56, before any judged sweep). Pilot:
  evidence/2026-11-04/sim-fleerepair-adopt-a.md (8 seeds, pilot GO).
- Seeds 99601–99612, FRESH (verified: no evidence filename and no dated
  evidence .md under evidence/2026-11-04/ used them before this run).
- Horizon 140 days, death-aware. Baseline = scripts/policies/competent.js
  VERBATIM; armed = scripts/policies/competent-fleerepair-a.js
  (COMPETENT_DIRECTIONAL_FLEE=1, COMPETENT_EXIT_VERIFIED_FLEE=1,
  COMPETENT_FLEE_REPAIR=1, nothing else). Policy-side only: no src/js
  change, no gate/price/deed change, no default flip.
- SINGLE-BASE JUDGING: all 24 legs share anchor 0de632f6a391
  (prereg + driver/summarizer scale extension + summarizer proof).
  Pilot and tbfinish numbers are NEVER cited as this confirm's baseline.
- Smoke (not judged): 99601–99602 both legs with the extended driver,
  0 instrument errors, scale fields present on all 4 legs, no driver
  change followed — so the smoke legs fold into the corpus per prereg.
- BALANCED PANEL (§15): not run as a panel compare, for the reason
  stated in the prereg: balance-panel.js does not accept a two-corpus
  comparison (it runs its own sweep-compare registry children), the
  fleerepair variant is not a registry policy, and registering it would
  contaminate the baseline child (the variant file sets COMPETENT_* env
  gates at require time; sweep-compare loads the whole registry in every
  child process). The comparison is the pre-registered per-seed table +
  analyzer aggregates — never a fabricated panel compare. A
  contamination-free registry route is flagged to the coordinator as
  the missing piece for a true panel compare.
- Corpus: evidence/2026-11-04/perseed-fleerepair-a/
  (fleerepair-s996*-confirm-baseline.json / confirm-fleerepair.json,
  24 files). Summaries:
  evidence/2026-11-04/fleerepair-confirm-a-summary-baseline.json,
  evidence/2026-11-04/fleerepair-confirm-a-summary-armed.json.
  Logs: fleerepair-confirm-a-smoke.log, fleerepair-confirm-a-sweep.log.
  0 instrument errors on all 24 legs; 0 scale-read errors
  (scaleMeasured 12/12 in both legs).

## Canon

No canon doc covers TB flee — verified again in this worktree: grep for
flee/barrier in docs/CANON.md returns 0 hits. What covers it instead is
in-code law in src/js/game.js (tbBarrierExit) and Steve's 2026-11-02
ruling that monsters do NOT flee while players CAN. Nothing invented.

## Judged table (12-seed confirm, per-seed)

Baseline leg (competent verbatim):

| seed | days | end | TB exp | fieldW4 | W4 kills | escapes | flee-trig | standingFinal |
|------|------|-----|--------|---------|----------|---------|-----------|---------------|
| 99601 | 134 | lost | 0 | 0 | 0 | 0 | 0 | 120 |
| 99602 | 37 | lost | 0 | 0 | 0 | 0 | 0 | 50 |
| 99603 | 80 | lost | 0 | 0 | 0 | 0 | 0 | 100 |
| 99604 | 65 | lost | 5 | 0 | 0 | 0 | 3 | 100 |
| 99605 | 56 | lost | 0 | 0 | 0 | 0 | 0 | 25 |
| 99606 | 129 | lost | 8 | 13 | 1 | 0 | 6 | 185 |
| 99607 | 140 | survived | 8 | 8 | 1 | 0 | 5 | 165 |
| 99608 | 132 | lost | 6 | 6 | 1 | 0 | 1 | 245 |
| 99609 | 79 | lost | 6 | 3 | 1 | 0 | 2 | 220 |
| 99610 | 52 | lost | 9 | 0 | 0 | 0 | 5 | 150 |
| 99611 | 117 | lost | 11 | 1 | 2 | 0 | 4 | 175 |
| 99612 | 45 | lost | 0 | 0 | 0 | 0 | 0 | 70 |

Armed leg (fleerepair variant):

| seed | days | end | TB exp | fieldW4 | W4 kills | escapes | flee-trig | standingFinal |
|------|------|-----|--------|---------|----------|---------|-----------|---------------|
| 99601 | 99 | lost | 6 | 2 | 0 | 1 | 0 | 100 |
| 99602 | 85 | lost | 0 | 0 | 0 | 0 | 0 | 95 |
| 99603 | 80 | lost | 0 | 0 | 0 | 0 | 0 | 100 |
| 99604 | 133 | lost | 10 | 7 | 1 | 0 | 0 | 290 |
| 99605 | 106 | lost | 6 | 2 | 1 | 0 | 0 | 175 |
| 99606 | 93 | lost | 11 | 6 | 2 | 1 | 0 | 320 |
| 99607 | 124 | lost | 6 | 2 | 0 | 0 | 0 | 190 |
| 99608 | 140 | survived | 4 | 1 | 2 | 0 | 0 | 320 |
| 99609 | 102 | lost | 4 | 4 | 2 | 0 | 0 | 375 |
| 99610 | 65 | lost | 8 | 3 | 1 | 0 | 0 | 175 |
| 99611 | 49 | lost | 0 | 0 | 0 | 0 | 0 | 50 |
| 99612 | 52 | lost | 0 | 0 | 0 | 0 | 0 | 95 |

Exposure outcomes: baseline 53 = 47 fighter-died, 6 kill, 0 fled.
Armed 55 = 44 fighter-died, 9 kill, 2 fled.
Per-seed trajectories diverge sharply under the policy change (e.g.
99601: 0 vs 6 exposures; 99611: 11 vs 0) — the same chaotic divergence
the pilot showed (26 vs 47). Totals judging is the honest route; the
per-seed table above shows the divergence plainly rather than hiding it.
Orphans (pre-registered non-exposure class, tbEnd with no exposure):
baseline 99606 x1 (routed); armed 99607 x2 (routed). Reported
separately, not scored as missed fights.

## GO judgement (strict, prereg threshold)

Verdict: **GO (confirm)** — all three pilot bars still hold on 12 seeds.

1. **Escapes >= 2 across armed TB exposures: PASS, exactly at threshold
   again, this time WITH transcript corroboration (prereg tightening).**
   Armed escapes = 2, baseline = 0. Both are round-1 endings with 0
   bracketed turns, exactly like the pilot's — and both carry the
   corroborating say-lines the prereg requires:
   - 99601 day 99 (influencer, solo escape into Haven):
     "BARRIER CROSSED — you crash through into Haven. The gate shuts
     behind you. The wild goes quiet. (Haven is safe — nothing follows
     you here.)" + "You escape. The thicket keeps its secrets." plus a
     Counter learned for surviving (Influencer: kill the followers
     first) and the gamblers' line. Corroborated escapes: 2/2;
     uncorroborated fled exposures: 0.
   - 99606 day 89 (algorithm, escape into Haven): same BARRIER CROSSED
     + "You escape" lines, plus a Counter learned (Ugly-Eyes: lose on
     purpose). Corroborated.
   No fled exposure lacked corroboration, so the tightening changed
   nothing — but it was applied, not waived.
2. **Median strikes/fight armed >= baseline: PASS.** Armed median 3,
   baseline median 2 (all TB exposures). Lost fights only: armed 3 vs
   baseline 2. Median damage fraction: lost fights armed 0.165 vs
   baseline 0.042; all fights 0.168 vs 0.063.
3. **Cost bar clean: PASS, both halves, both readings.**
   (a) Starvation deaths, totals: armed 4 <= baseline 6 + 2 = 8.
   Arm-only reading (prereg's precise definition: death-tele records
   flagged player=true): armed 2 <= baseline 2 + 2 = 4.
   Detail: armed player-flagged starvations on 99601 (x1) and 99611
   (x1); baseline player-flagged on 99601 (x1) and 99609 (x1). No
   reading fails.
   (b) Median survival: armed 96 days >= 0.8 x baseline median 79.5 =
   63.6 days. Baseline days sorted: 37, 45, 52, 56, 65, 79, 80, 117,
   129, 132, 134, 140. Armed days sorted: 49, 52, 65, 80, 85, 93, 99,
   102, 106, 124, 133, 140. Aggregate-harm transparency line: armed
   median 96 >= baseline median - 10d (69.5) also passes; the governing
   tolerance remains the prereg's 0.8x, as pre-registered.

Supporting mechanism evidence (not judged, but it is the repair working):

- Barrier pushes, run-wide (tbBarrierExit wraps): baseline 0 on ALL 12
  legs — the tbfinish loop's 0-push band, reproduced a second time.
  Armed 12 total (99601:2, 99602:2, 99604:1, 99605:1, 99606:3, 99608:1,
  99609:1, 99612:1). The directional path actually pushes barriers now.
  Exposure-level push count is 0 in both legs because pushes in non-W4
  TB fights sit outside the W4 census and the two W4 escapes ended in
  unbracketed round 1 (same instrument shape as the pilot).
- Flee-attempt turns in W4 exposures: baseline 42 across 26
  flee-triggered fights; armed 0 across 0 flee-triggered fights. The
  EDGE loop class is gone from armed W4 exposures — no armed fight
  ends a turn standing on an edge tile after a move, and no armed fight
  pushes-then-loops.
- Zero-tile moves, by turn class (this is where the confirm qualifies
  the pilot): baseline 52 (flee-attempt + move-only turns); armed 34,
  ALL in move-only turns, ZERO in flee-attempt turns. See "Mechanism
  gap" below — the confirm's headline caveat.

## Sense-test (SENSE-TESTING LAW): MIXED — escapes human, 5 fights robotic

Read: both armed escapes, armed 99601 exp#4/#5/#6, armed 99604 exp#10,
armed 99606 exp#10, baseline 99604 exp#1/#5, baseline 99606 exp#3.

Before (baseline): flee fights read as a robot walking into a wall.
99604 exp#1: 4 flee attempts in 7 turns, death. 99604 exp#5: 4
move-only turns, 0 strikes, death. The old shape is all over the
baseline leg (42 flee-attempt turns).

After (armed), the escapes read as people escaping, not as a silent
no-op loop — same verdict as the pilot, now on fresh seeds:
- 99601 day 99: a hurt person crashing out through the barrier while
  the beast is untouched, with the cost visible (no damage dealt, no
  kill) and knowledge gained for surviving (the Counter). The
  transcript even stages the village reaction (gamblers furious /
  rich, "Victor sags with relief. 'Good. Good call.'").
- 99606 day 89: same shape — barrier crash, "It didn't leave — you
  did. The treeline holds its shape; the siege goes on.", gamblers'
  line, Counter learned.

After (armed), the qualification — 5 fights read as a robot pressing a
blocked move until it dies (see "Mechanism gap"): 99601 exp#4 (8
move-only turns, 0 strikes, "No path there" x9), exp#5 (9 turns, 0
strikes, x10), exp#6 (5 failed moves + 9 ability turns, 0 strikes,
x6), 99604 exp#10 (5 turns, 0 strikes, x6), 99606 exp#10 (7 turns, 0
strikes, x8). 34 turns total, 5 of 55 armed exposures (9%).

Sense verdict, stated plainly: the REPAIRED FLEE reads human (both
escapes; fallthrough strikes elsewhere — e.g. 99601 exp#1 fought 13
strikes to the death). The 5 loop fights are NOT flee turns — by the
repair's own code, the flee branch resolves at 3 stuck turns and marks
the fight unfleeable, and the turns that follow are the fallthrough
(approach) path failing on the same blocked geometry. So the prereg's
sense veto, literally applied to the repaired flee, does not fire.
BUT the player-visible behavior in those 5 fights is indistinguishable
from the loop this arm was built to kill ("No path there" every turn,
death without a blow), and the pilot's "loop gone from W4 exposures"
claim does not survive this confirm in full. I report this as GO with
the gap disclosed and flagged, NOT as a quiet pass — and I put the
veto question to the coordinator explicitly: if the coordinator reads
the prereg's sense veto as covering approach-path loops (not just
flee-branch loops), this verdict flips to NO-GO and the kill steps in
the prereg apply (revert the competent.js gated change, delete the
variant policy, archive the proof). I did not execute the kill on an
ambiguous clause, and I did not hide the gap that could justify it.

## Mechanism gap (the confirm's real finding — next arm's target)

The repair fixes the flee branch. It does not fix the fallthrough
branch. Concretely, in armed 99601 exp#4: fighter at center tile (4,4),
monster (influencer) at distance 2, weapon range 1 — OUT of range.
Every player turn says "No path there." The code path, read directly
from scripts/policies/competent.js:

1. flee() is called (outmatched: 850-HP monster vs 100-HP fighter).
   The directional step toward the havenward edge fails (blocked
   target tile — the influencer spawns followers, which plausibly
   occupy the step tile; the corpus does not record intended targets,
   so this is hypothesis, not measurement).
2. Out of range, so the walk-failure fallthrough does NOT strike
   (correct per prereg: a strike is impossible). The turn counts
   toward stuck tracking; at 3 stuck turns the fight is marked
   unfleeable and later flee() calls return false before endTurn.
3. fight() then falls through to ability/trick play (exp#6 shows this
   working: 9 ability turns after the failed moves) and then to
   CLOSE THE DISTANCE: out of range, so it steps toward the tile
   adjacent to the weakest monster via findPath. That step fails on
   the same blocked geometry ("No path there"), the turn ends, and
   the next turn repeats it — 8-9 times, to death, with no blocked-step
   fallback in the approach path (no strike-anyway, no wait, no
   re-pick of a different adjacent tile, no give-up-and-ability).

The gap is therefore precise and fixable: the approach path needs the
same blocked-step treatment the flee branch just got (count failed
approach steps; on repeated failure, do something else — strike if
possible, use an ability, or hold — instead of re-issuing the same
failed step). This shape is PRE-EXISTING in baseline (baseline
move-only zero-tile turns exist too, e.g. 99604 exp#5's 4 move-only
turns) — the arm did not introduce it, and it is not a judged bar —
but the confirm proves the flee repair alone does not end
blocked-step deaths. It belongs in the coordinator's findings backlog
as the next arm, not buried.

## Wall numbers (REPORTED, not judged — honestly measured this time)

Pilot caveat (a) is FIXED: every leg below carries measured scale
fields (scaleMeasured 12/12 both legs, scaleReadError null everywhere).
Nothing below is hard-coded.

| metric | baseline | armed |
|--------|----------|-------|
| wins | 0 | 0 |
| national reached | 0 / 12 | 0 / 12 |
| table reached (sat, end-state tableDone) | 0 / 12 | 0 / 12 |
| table invited (end-state tableWaiting) | 0 / 12 | 0 / 12 |
| wave-4 faced (TB + field) | 84 | 82 |
| wave-4 kills (killRows; linked) | 6 (6) | 9 (9) |
| wave-5 UNLOCKED (maxWave >= 5; see note) | 0 | 2 |
| wave-5 kills | 0 | 0 |
| median survival (days) | 79.5 | 96 |
| max standing (final) | 245 | 375 |
| median standing (final) | 135 | 175 |
| arc reached (all legs) | 3 | 3 |

Wave-5 note (honesty correction to the summarizer's label): the
summarizer's "wave5faced" counts maxWave >= 5, which is wave-5
UNLOCKED (Game.unlockedWave()), not wave-5 faced. The two armed legs
at maxWave 5 are 99608 and 99609 (their baselines sat at maxWave 4).
No wave-5 spawn is evidenced in the corpus (spawn records carry no
wave field; all killRows and exposures on those legs are wave 4), and
wave-5 kills are 0. So: wave 5 unlocked on 2 armed legs, faced 0 times
by any evidence this instrument holds. Do not cite "2 wave-5 faced."

Scale observation (reported, not judged): rank stayed 'village' on
ALL 24 legs even as standing climbed to 245 (baseline 99608), 290
(armed 99604), 320 (armed 99606/99608), 375 (armed 99609). Standing
alone does not lift rank — the scale wall is not a standing-number
problem on these seeds; something else (regional links / other gates)
holds villages at village rank while standing triples. That is the
axis's problem in miniature, and it is unchanged by this arm (as
expected — a flee repair was never going to move the wall).

Death-cause shares: combat dominates both legs (baseline 741 deaths:
villager combat 315 / 43%, expedition 133 / 18%, combat 120 / 16%,
the wild 76 / 10%; armed 744 deaths: villager combat 331 / 44%,
combat 122 / 16%, expedition 118 / 16%, the wild 68 / 9%).
Starvation is a small share in both (6 vs 4). No village reaches wave
5 in a fight, let alone national, the table, or a win.

## Village assessment (plain words)

The village still mostly dies, and nothing in this arm changes that
arc: 11 of 12 villages are lost in both legs (baseline survivor:
99607 at 140d; armed survivor: 99608 at 140d), combat deaths dominate,
no win, no national, no table. What changed is narrow but real and
now confirmed on fresh seeds: fighters push barriers (12 pushes where
there were 0), they sometimes get out alive (2 corroborated escapes
where there were 0), and when they cannot get out they fight more
(median 3 strikes per fight vs 2, damage fraction nearly quadrupled in
lost fights: 0.165 vs 0.042). The blank filled is the edge flee loop; the blank
documented is everything downstream — killing a wave-4 beast in the
wild is still rare (9 kills across 55 armed exposures), the road past
wave 4 is still closed in every fight that can be evidenced, and the
blocked-step death has moved house from the flee branch to the
approach branch (5 fights). Knowledge/capability gaps that remain:
escaping itself teaches Counters (both escapes learned one — the game
rewards survival with knowledge, and that channel works), but fleeing
still never happens mid-fight with bracketed turns (both escapes are
round-1 events; no mid-fight escape was ever bracketed in pilot or
confirm), and no new capability arrives from fleeing itself.

## Metric review (for the NEXT run, not a re-score of this one)

- The escape-corroboration tightening worked: both fled exposures
  carried BARRIER CROSSED + "You escape" lines; 0 uncorroborated fled.
  Keep the standard. The round-1 capture gap remains (0 bracketed
  turns on both escapes) — the pending buffer attaches round-1 player
  actions only when the exposure is created after startCombat returns,
  and a fight ending fled in the opening pass leaves turns empty.
  Transcript corroboration is the evidence for round-1 escapes until
  that gap is fixed; do not invent a bracketed-turn requirement
  retroactively.
- The precise arm-only starvation definition worked (player=true flag):
  totals 4 vs 6, player-flagged 2 vs 2, both readings pass. Keep it.
- "wave5faced" in the summarizer is really "wave5 unlocked" — rename
  it before any future wall claim cites it, or the next run will
  over-claim a facing from an unlock.
- Table is end-state only in this driver (no daily ever-entered
  history). A sitting lost before end-state would be missed; none was
  observed (tableWaiting 0 everywhere too), so nothing turns on it
  here, but a future arm that touches the table needs daily capture.
- Per-seed matching breaks under policy divergence (0 vs 6 exposures
  on 99601; 11 vs 0 on 99611): totals judging stays the honest route.
- The approach-path blocked-step loop (5 fights, 34 turns) needs its
  own pre-registered metric next time: failed approach steps per fight
  + a bar (e.g. no fight with 3+ consecutive failed approach steps
  without a strike/ability/wait). The current instrument does not
  record policy branch or intended step target — the next arm's
  instrument should, or the claim "flee loop gone" will keep being
  confounded by approach loops wearing the same transcript line.

## Findings for the coordinator (do NOT edit hidden_files from this arm)

1. Approach-path blocked-step loop: fighters die on repeated "No
   path there" approach steps after the flee repair marks the fight
   unfleeable (armed 99601 exp#4/#5/#6, 99604 exp#10, 99606 exp#10;
   34 turns, 0 strikes in those fights). Next-arm target with the
   metric sketched in Metric review.
2. Standing-without-rank: rank 'village' on all 24 legs despite
   standing up to 375. Scale-onramp evidence: standing is not the
   binding constraint on these seeds.
3. Armed 99608 survived 140d with 1171 tbPlayerWait wraps in its
   run-wide counts — a wait-heavy survival worth a glance by whoever
   owns the wait lever (held, not killed). Out of this arm's scope;
   noted, not chased.

## Proof

`node scripts/test-fleerepair-20261104.js` — ALL PASS (exit 0) on the
confirm branch, including the new summarizer scale-fields test (8):
gate-off legacy control, directional repair-off gate pinned, repair
fallthrough (failed step -> strike), repair consumed-push (blocked,
then next call strikes), round-1 pending turn attached, variant gates
exact with DPS_RACE off, 2-day live-harness smoke, summarizer scale
fields measured (national 1/2, table 1/2, maxStanding 150 on fixtures).
Re-run after the driver/summarizer extension and before the sweep; no
code changed after that run, so the proof stands for the swept corpus.

## Verdict

**GO (confirm)** — escapes 2 corroborated (>= 2), median strikes/fight
3 >= 2, cost bar clean (starvation 4 <= 8 totals and 2 <= 4
player-flagged; median survival 96 >= 63.6), sense: escapes human with
the approach-loop gap disclosed and the veto question flagged to the
coordinator above. The arm is CONFIRMED; landing itself remains the
coordinator's --ff-only merge, pending ship. Branch tip before the
evidence commit: 0de632f6 (tooling; prereg b9f56a56 beneath it). The
evidence commit itself is the tip at report time. No rebase, no push,
no version bump, no live verification — those belong to the coordinator
and the ship loop.

## Files

- Evidence (this file): evidence/2026-11-04/sim-fleerepair-confirm-a.md
- Confirm prereg: evidence/2026-11-04/sim-fleerepair-confirm-a-prereg.md
- Corpus (24 files): evidence/2026-11-04/perseed-fleerepair-a/
  (fleerepair-s996*-confirm-baseline.json, fleerepair-s996*-confirm-fleerepair.json)
- Summaries: evidence/2026-11-04/fleerepair-confirm-a-summary-baseline.json,
  evidence/2026-11-04/fleerepair-confirm-a-summary-armed.json
- Logs: evidence/2026-11-04/fleerepair-confirm-a-smoke.log,
  evidence/2026-11-04/fleerepair-confirm-a-sweep.log
- Driver/summarizer extension + proof: scripts/fleerepair-driver-20261104.js,
  scripts/fleerepair-summarize-20261104.js, scripts/test-fleerepair-20261104.js
