# journey-landing r97 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261104T1445Z (scheduled 08:45 CST 2026-11-04).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@03844d5a5 at branch creation (journey-scale r96 tip).
**Numbering note:** the Lane A counter is global across legs; r96 (2026-11-04
04:45 CST, seeds 827–836) was the last landing panel, so this run is r97.
The r97 driver was prepared and committed by r96 and is used VERBATIM here
— fresh seeds 837–846, OUTDIR landing-r97, plus the R96 LIVE-RUN PASS.
Diff-verified against the r96 driver: only seeds, OUTDIR, and header
differ. This run does NOT resurrect any older driver line.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or
gate change in this run. **Perception law (2026-10-28) stands** — all
instruments read-only; pickers press offered menu items only; the last-tile
walk reuses travelTo (the game's own "Walk here" pathfinder).
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect
is proven in game code (not driver policy) with a before/after proof test;
otherwise document and move on. The R96 pass is DRIVER POLICY (zero src/js),
not a game change.

## Standing context (read before scoring)
- r96 (seeds 827–836, DAYS=28): Q1 LIVE-RUN PASS GO — 6 broken-promise live
  runs ended at dawn, 6 ends ok, 0 failures, 0 "Finish your current outing"
  refusals (r95: 2), all 5 waited live opps departed; causal caveat: the
  end→depart join is seed-level, not per-wait proven (causal proof remains
  r95's seed-821 replay). M1 alive-d14 10/10; M2 system contact 10/10
  (day 8 all seeds); M3 14/14 fights complete, 2 fatal, both clean
  Highbeam Deer losses; M5 people PASS (party invites 7/7 spoken, 0 dry,
  2 accepted; 2 full transcripts read, no fabricated history); M6
  DOORSTEP UNTESTED (248 checks, 0 triggered); M7 kcal PASS (5 skips →
  5 arrivals, rescue ladder 5/5, eat-on-arrival 5/5), water UNTESTED;
  M8 shape PASS; M9 MISS on two clauses, both seed 829: 1 starvation
  death (Aubrey d20, CAUSE CLASS D — at Haven, pantry empty, village
  famine, NOT a guard/door failure) and self-sufficiency 0.678 < 0.70
  floor; M10 dawn-door live-only PASS (395 panel opps, waitDiagMissing 0,
  5 waited live opps, 0 unexplained door blocks; probe hall-door stall
  on 4 seeds, probe-side).
- r96's carried watches: (a) horizon pantry thin on 5/9 panel seeds,
  now a finding for a future lever run, not a gate miss to re-score
  (M9's binding metric is self-sufficiency, and a starvation death is
  already a binding miss — report both, re-score neither); (b) water
  clause UNTESTED since r87 — now eleven runs deep; (c) probe hall-door
  adjacency stall (probe-side, not a game block); (d) armor tele/line
  counts disagree (different counting units, neither citable for craft
  counts); (e) outings that depart still break on patch exhaustion
  (togetherBlocked 7, all "0 kcal" in r96) — a world-content question
  (patch yield/regrowth), not a door fix.
- r96 telemetry: 2 LOUD lines vs landing-split.json, BOTH EXPLAINED as
  aggregation artifacts (sums vs means); baseline NOT rolled.

## Leg questions (binding)
**Q1 — LIVE-RUN PASS, SECOND PANEL (r96 finding):** fresh 10-seed panel
(837–846, DAYS=28) under the r97 driver. GO for the pass = no waited live
opp ends NO-DEPART for a live-run reason while the pass is armed, and
every liveRunEnds endOk true. NO-GO = an END attempt fails (endOk false),
or a waited live opp still ends NO-DEPART for a live-run reason.
**Q2 — WATER CLAUSE WATCH (standing since r87):** any wild water skip on
the panel is reported with its outcome (arrived + drank vs
starved/dehydrated); 0 skips = UNTESTED again, reported as standing,
not as a pass.
**Q3 — STAY-GREEN CARRY + PEOPLE CHECK + FAMINE RECURRENCE:** M1
alive-d14, M2 system contact (≤d10), M3 fight-log completeness, M5
people (full transcripts read: wants engaged/deflected with reason,
endings resolve/plant/owe, 0 fabricated shared history, 0 filler loops),
M7 guard v3 kcal, M8 shape (shape test must PASS on the panel corpus
before any verdict is claimed), M9 stay-green (death liturgy exact under
the r74 revised metric — grief beats == villager deaths while the player
is at Haven, final-day player deaths excluded; theft 0; self-sufficiency
≥ 0.70 last series day; 0 starvation deaths; plenty-voice ≥ 1), M10
dawn-door live-only (waitDiag 100% of dawn opps; door adjudication on
live promises only). Famine recurrence is the interesting-finding watch:
any seed whose pantry hits 0 before d28, or any starvation death, is
reported with its pantry trajectory and cause class — a second famine
panel in a row strengthens the lever-work case; a clean panel does not
retroactively clear r96.

## Metrics (binding; §14 — a miss is NO-GO, never re-scored)
- M6 DOORSTEP-GO (binding, r94/r95/r96 clauses): (a) every triggered
  doorstep step carries a complete eatRec; (b) 0 class-E scholar
  starvation deaths (starved while at/adjacent to Haven with pantry
  food); (c) 0 triggered doorstep steps ending with enterResult===false.
- M10 DAWN-DOOR, LIVE-ONLY (binding): waitDiag present on 100% of dawn
  opps; door-block adjudication counts LIVE promises only.
- M1/M2/M3/M5/M7/M8/M9: reported per r96 definitions.
- M5 FIZZLE (r96 convention, kept): a depth fizzle is flagged ONLY when
  the thread is exhausted; the verdict rests on full reads plus the
  wind-down/probe gates.
- Interesting-finding threshold: any class-E starvation death; any door
  refusal; any live-promise dawn opp that waits but never departs for a
  door reason; any liveRunEnds endOk=false; any waited live opp that
  ends NO-DEPART for a live-run reason despite the pass; any
  system-contact miss; any fabrication flag; any wild water skip (Q2);
  any pantry-to-0 before d28; any starvation death of any cause class.

## Pilot gate (binding, staged method)
Seed 837 runs first (DAYS=28). If it CRASHES, STOP and report. If the
shape test FAILS on the pilot corpus, STOP and fix the instrument before
expanding. Only then run 838–846.

## Metric review
(To be filled at closeout.)
