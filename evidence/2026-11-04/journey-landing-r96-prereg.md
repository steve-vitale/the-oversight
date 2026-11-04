# journey-landing r96 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261104T104529Z (scheduled 04:45 CST 2026-11-04).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@02158dbea at branch creation (journey-scale r95 tip).
**Numbering note:** the Lane A counter is global across legs; r95 (2026-11-04
00:45 CST, seeds 817–826) was the last landing panel, so this run is r96.
The r96 driver was prepared and committed by r95 (commit 4a5c619ee) and is
used VERBATIM here — fresh seeds 827–836, OUTDIR landing-r96, plus the R96
LIVE-RUN PASS. This run does NOT resurrect any older driver line.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or
gate change in this run. **Perception law (2026-10-28) stands** — all
instruments read-only; pickers press offered menu items only; the last-tile
walk reuses travelTo (the game's own "Walk here" pathfinder).
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a fix gate
below is met; otherwise document and move on. The R96 pass is DRIVER POLICY
(zero src/js), not a game change — it is the competent-player behavior
r95's finding calls for, tested at panel scale.
**Canon read:** docs/CANON.md (manifest). No new canon invented.

## Standing context (read before scoring)
- r95 (seeds 817–826, DAYS=28): M6 DOORSTEP-GO on binding clauses (253
  doorstep checks, 2 triggered, both ate, 0 refusals, 0 class-E deaths);
  M10 DAWN-DOOR live-only PASS (7 waited live opps, 0 unexplained door
  blocks); M1 alive-d14 10/10; M2 system contact 10/10 (day 8 nine seeds,
  day 9 on 818); M3 29/29 fights complete; M5 people PASS (0 fabrication
  flags; party invites 8 offered / 8 spoken / 0 dry / 1 accepted); M7 kcal
  PASS, water clause UNTESTED (standing since r87); M8 shape PASS; M9
  stay-green PASS (griefMiss 0, theft 0).
- r95's LIVE FINDING (this run's Q1): seed 821, Chloe (d11) and Ursula
  (d13) both waited at dawn, both were refused with "Finish your current
  outing before starting another" because Raj's live run (departed d9,
  due d10, delivered late d13) was still live — both promises broke
  NO-DEPART for a non-door reason. The R96 LIVE-RUN PASS (folded into
  this driver, replay-proven by r95 on seed 821) ends a broken-promise
  live run at dawn when the player is at Haven — walking the last tile
  first (r89 LASTTILE pattern), since the END action requires the haven
  TILE, not the Manhattan-<=1 radius. Ending unloads both shares through
  the shared unload path (food still banks); it only frees the
  companion slot. Live runs with open promises are LOGGED ONLY.
- r95's carried watches: (a) Haven-door adjacency stall, probe-side, on
  4 seeds (probe could not reach a waiting partner); (b) fizzle-flag
  criterion question — r95 proposed, for the NEXT run, requiring thread
  exhaustion before flagging a depth fizzle; (c) armor tele/line counts
  disagree (different counting units, neither citable for craft counts);
  (d) horizon pantry thin on 4/9 panel seeds (watch, not a gate miss —
  M9's binding metric is self-sufficiency).
- r95 telemetry: 2 LOUD lines vs landing-split.json, BOTH EXPLAINED as
  aggregation artifacts (sums vs means); baseline NOT rolled.

## Leg questions (binding)
**Q1 — LIVE-RUN PASS AT PANEL SCALE (r95 finding):** fresh 10-seed panel
(827–836, DAYS=28) under the r96 driver. GO for the pass = at least one
panel seed where a broken-promise live run is ended at dawn with endOk
true AND a waiting partner who would otherwise have been refused then
departs (or: no waited live opp ends NO-DEPART for a live-run reason
while the pass is armed). NO-GO = an END attempt fails (endOk false),
or a waited live opp still ends NO-DEPART for a live-run reason. Either
way the liveRunEnds records are reported per seed.
**Q2 — WATER CLAUSE WATCH (standing since r87):** any wild water skip on
the panel is reported with its outcome (arrived + drank vs
starved/dehydrated); 0 skips = UNTESTED again, reported as standing,
not as a pass.
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
- M6 DOORSTEP-GO (binding, r94/r95 clauses): (a) every triggered doorstep
  step carries a complete eatRec; (b) 0 class-E scholar starvation deaths
  (starved while at/adjacent to Haven with pantry food); (c) 0 triggered
  doorstep steps ending with enterResult===false.
- M10 DAWN-DOOR, LIVE-ONLY (binding): waitDiag present on 100% of dawn
  opps; door-block adjudication counts LIVE promises only.
- M1/M2/M3/M5/M7/M8/M9: reported per r95 definitions.
- M5 FIZZLE REVISION (adopted from r95's proposal, stated here so the
  binding changes in the open): a depth fizzle is flagged ONLY when the
  thread is exhausted; raw flag counts are still printed for
  comparability with r95, but the verdict uses the revised count.
- Interesting-finding threshold: any class-E starvation death; any door
  refusal; any live-promise dawn opp that waits but never departs for a
  door reason; any liveRunEnds endOk=false; any waited live opp that
  ends NO-DEPART for a live-run reason despite the pass; any
  system-contact miss; any fabrication flag; any wild water skip (Q2).

## Pilot gate (binding, staged method)
Seed 827 runs first (DAYS=28). If it CRASHES, STOP and report. If the
shape test FAILS on the pilot corpus, STOP and fix the instrument before
expanding. Only then run 828–836.

## Metric review
(To be filled at closeout; r95's fizzle proposal is adopted above, not
deferred again.)
