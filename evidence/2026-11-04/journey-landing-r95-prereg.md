# journey-landing r95 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261104T065218Z (scheduled 00:45 CST 2026-11-04).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@def4f8f40 at branch creation.
**Numbering note:** the Lane A counter is global across legs; r94 (2026-11-03
evening) was the last landing panel, so this run is r95. The r75 driver built
by r74 is SUPERSEDED — the landing line has since advanced through r85–r94
(outing-work guard v3, rescue ladder, eat-on-arrival, doorstep, dawn-door,
last-tile walk, live/ledger split). This run does NOT resurrect r75.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or
gate change in this run. **Perception law (2026-10-28) stands** — all
instruments read-only; pickers press offered menu items only; the last-tile
walk reuses travelTo (the game's own "Walk here" pathfinder).
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a fix gate
below is met; otherwise document and move on.
**Canon read:** docs/CANON.md (manifest). No new canon invented.

## Standing context (read before scoring)
- r94 (2026-11-03 evening, seeds 807–816, DAYS=28): M6 DOORSTEP-GO on its
  binding clauses (280 doorstep checks, 2 triggered, both ate, 0 refusals,
  0 class-E deaths); M10 DAWN-DOOR live-only PASS (10 waited live opps, 0
  unexplained door blocks; 65% of pooled opps were stale ledger rows);
  M1 alive-d14 10/10; M2 system contact 10/10 (day 8 all seeds); M3 23/23
  fights complete; M5 people PASS, 0 fabrication flags; M7 kcal PASS,
  water clause UNTESTED (0 wild water skips, standing since r87); M9
  stay-green PASS (self-sufficiency 0.74–0.956, theft 0, griefMiss 0/28,
  plenty-voice all seeds); M8 shape PASS.
- r94's carried blanks for the next landing run: (a) the last-tile walk
  has NO panel-scale positive case — every r94 door step ran with the
  scholar already on the haven tile (lastTileWalk=null on all 6); the
  walk stays repro-proven-only (seed 805) until an adjacent-tile arrival
  recurs naturally; (b) the water clause of guard v3 is still untested
  in the wild (0 wild water skips, r87–r94).
- r94 telemetry: LOUD lines vs landing-split.json ALL EXPLAINED as
  aggregation artifacts (sums vs means); baseline NOT rolled.

## Leg questions (binding)
**Q1 — LASTTILE AT PANEL SCALE + 805 REPRO (r94 blank a):** fresh 10-seed
panel (817–826, DAYS=28) under the r94 policy UNCHANGED, plus a separate
seed-805 rerun under the r95 driver (same DAYS=28) as the Leonard-shape
repro. GO for the walk = at least one panel door step carries a non-null
lastTileWalk that ends with enterResult !== false, OR the 805 rerun
reproduces a last-tile walk with 0 refusals. If neither fires, the walk
stays repro-proven-only and this run reports exactly that — no panel
claim is made from a null walk.
**Q2 — WATER CLAUSE WATCH (r94 blank b):** any wild water skip on the
panel is reported with its outcome (arrived + drank vs starved/dehydrated);
0 skips = UNTESTED again, reported as standing, not as a pass.
**Q3 — STAY-GREEN CARRY + PEOPLE CHECK:** M1 alive-d14, M2 system contact
(≤d10), M3 fight-log completeness, M5 people (full transcripts read:
wants engaged/deflected with reason, endings resolve/plant/owe, 0
fabricated shared history, 0 filler loops), M7 guard v3 kcal, M8 shape
(shape test must PASS on the panel corpus before any verdict is claimed),
M9 stay-green (death liturgy exact under the r74 revised metric — grief
beats == villager deaths while the player is at Haven, final-day player
deaths excluded; theft 0; self-sufficiency ≥ 0.70 last series day;
0 starvation deaths; plenty-voice ≥ 1), M10 dawn-door live-only
(waitDiag 100% of dawn opps; door adjudication on live promises only).

## Metrics (binding; §14 — a miss is NO-GO, never re-scored)
- M6 DOORSTEP-GO (binding, r94 clauses): (a) every triggered doorstep step
  carries a complete eatRec; (b) 0 class-E scholar starvation deaths
  (starved while at/adjacent to Haven with pantry food); (c) 0 triggered
  doorstep steps ending with enterResult===false.
- M10 DAWN-DOOR, LIVE-ONLY (binding): waitDiag present on 100% of dawn
  opps; door-block adjudication counts LIVE promises only.
- M1/M2/M3/M5/M7/M8/M9: reported per r94 definitions.
- Interesting-finding threshold: any class-E starvation death; any door
  refusal; any live-promise dawn opp that waits but never departs for a
  door reason; any system-contact miss; any fabrication flag; any
  wild water skip (Q2).

## Pilot gate (binding, staged method)
Seed 817 runs first (DAYS=28). If it CRASHES, STOP and report. If the
shape test FAILS on the pilot corpus, STOP and fix the instrument before
expanding. Only then run 818–826, then the 805 repro (separate OUTDIR so
the panel corpus stays fresh-seed pure).

## Metric review
- (Filled at closeout. Pre-registered metrics bind this run; a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.)

## Infra notes (at prereg time)
- Worktree `journey-landing` registered under oversight-playtest-loop;
  register checkout was slow under parallel sibling load (worktree
  appeared partial for ~5 min, then complete; verified: branch
  journey-landing at def4f8f40, tracked files clean,
  scripts/sim-harness.js present). Standing heartbeat loop (600s)
  started; beat verified in the registry (heartbeat_at
  2026-11-04T06:59:50Z) before the pilot runs. Note: an earlier
  r75-driver pilot attempt in this run failed before starting (shell
  redirect to a not-yet-created OUTDIR) and was abandoned once the r94
  run note showed r75 superseded; no seed ran under it.
- Driver: scripts/journey-landing-r95-20261104.js (r94 driver verbatim
  except seeds 817–826, OUTDIR landing-r95, header — diff verified).
  Analyzer: scripts/analyze-landing-r94-20261104.js (dir-as-argv,
  unchanged). Shape test: scripts/test-landing-r94-shape.js.
- Pre-flight: main tree clean (0 lines) at pre-flight; git pull already
  up to date; disk 32%. No playtest-loop.lock existed at run start;
  lock created laneA-20261104T065218Z.
- Prior landing runs this cycle: r94 (2026-11-03 evening). Rotation
  cycled 0→1→2→3→0 through the other lane-A legs since r94, so this
  run reads 0 again legitimately.
