# journey-landing r98 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261104T1545Z (scheduled 15:45 CST 2026-11-04).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@570daa9c5 at branch creation (includes r97's merge).
**Numbering note:** the Lane A counter is global across legs; r97 (2026-11-04
08:45 CST, seeds 837–846) was the last landing panel, so this run is r98.
The r98 driver was prepared and committed by r97 and is used VERBATIM here
— fresh seeds 847–856, OUTDIR landing-r98, DAYS=28.
Diff-verified against the r97 driver: only header, seeds, OUTDIR, and the
R98 DOORSTEP-OUTINGLIVE fix block differ (need computed before the
outing-live skip; the skip stands only when the scholar is NOT
hungry/thirsty). This run does NOT resurrect any older driver line.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or
gate change in this run. **Perception law (2026-10-28) stands** — all
instruments read-only; pickers press offered menu items only; the last-tile
walk reuses travelTo (the game's own "Walk here" pathfinder).
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect
is proven in game code (not driver policy) with a before/after proof test;
otherwise document and move on. The R98 fix is DRIVER POLICY (zero src/js),
not a game change.

## Standing context (read before scoring)
- r97 (seeds 837–846, DAYS=28): Q1 LIVE-RUN PASS GO, SECOND PANEL — 8
  broken-promise ends endOk true, 0 endOk false; all 5 waited seeds
  departed; the single "Finish your current outing" refusal (838 d10,
  Dale) was NOT a pass failure (Adaeze's run still PROMISED at d10 dawn;
  Dale departed d11 inside his window, breaking on patch exhaustion).
  M1 alive-d14 10/10; M2 system contact 10/10 (day 8 on eight seeds, day 9
  on 842/846); M3 27/27 fights complete, 5 fatal, both clean
  monster-approach losses; M5 people PASS (party invites 9/9 spoken,
  0 dry, 3 accepted; 2 full transcripts read, no fabricated history);
  M6 DOORSTEP NO-GO on binding clause (b) — seed 843 Gilberto starved
  day 13 at Haven with pantry food because the doorstep step skipped on
  a live outing BEFORE need was computed (class E, first proven class-E
  scholar starvation death since the doorstep step landed in r88);
  step mechanics GO (254 checks, 1 triggered, complete eatRec);
  M7 kcal PASS (4 skips → 4 arrivals, rescue ladder 4/4, eat-on-arrival
  4/4), water UNTESTED; M8 shape PASS; M9 NO-GO on the starvation
  clause (3 starvation deaths: 843 Gilberto class E, 840 Elif d19 /
  Pedro d20 non-scholars, placement unexplained — analyzer starvation
  classes describe the SCHOLAR's series and are NOT citable for
  non-scholar deaths); self-sufficiency clause PASSED (≥0.85 every
  panel seed); M10 dawn-door live-only PASS (438 panel opps,
  waitDiagMissing 0, 12 waited live opps, 0 unexplained door blocks;
  probe hall-door stall on 4 seeds, probe-side).
- r97's carried watches: (a) horizon pantry thin on 4/9 panel seeds by
  the <2000/person line, a slow bleed not a famine (no panel seed's
  pantry hit 0 before d28); (b) water clause UNTESTED since r87 — now
  twelve runs deep; (c) probe hall-door adjacency stall (probe-side,
  not a game block); (d) armor tele/line counts disagree (different
  counting units, neither citable for craft counts); (e) outings that
  depart still break on patch exhaustion (14 together-blocks, all
  "0 kcal" in r97); (f) creek tile (5,3) evening-home block, recovered
  by the rescue ladder but not by the evening hop.
- r97 replay proof: seed 843 under the r98 driver — day 13 doorstep
  TRIGGERS (kcal 728→2328), Gilberto lives, village ends 12 and FED,
  Caleb's outing outcome UNCHANGED. The replay is a proof, not a
  re-run; this panel tests the fix at scale.
- r97 telemetry: 2 LOUD lines vs landing-split.json, BOTH EXPLAINED as
  aggregation artifacts (sums vs means); baseline NOT rolled.

## Leg questions (binding)
**Q1 — DOORSTEP-OUTINGLIVE FIX AT PANEL SCALE (r97 finding):** fresh
10-seed panel (847–856, DAYS=28) under the r98 driver. GO = M6 binding
clauses all hold: (a) every triggered doorstep step carries a complete
eatRec; (b) 0 class-E scholar starvation deaths; (c) 0 triggered
doorstep steps ending with enterResult===false. Additionally: any
triggered doorstep step with liveOuting true and a needy scholar must
EAT (not skip) — a skip on a needy scholar with a live outing is a
NO-GO even if no death follows. NO-GO = any clause fails.
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
reported with its pantry trajectory and cause class. The 840 shape
(non-scholar starvation deaths with pantry food on paper) recurs or it
does not — a villager-placement instrument remains the open item if it
does, but this run does not build it unless a placement question blocks
a binding verdict.

## Metrics (binding; §14 — a miss is NO-GO, never re-scored)
- M6 DOORSTEP-GO (binding, r94/r95/r96/r97 clauses): (a) every triggered
  doorstep step carries a complete eatRec; (b) 0 class-E scholar
  starvation deaths; (c) 0 triggered doorstep steps ending with
  enterResult===false.
- M10 DAWN-DOOR, LIVE-ONLY (binding): waitDiag present on 100% of dawn
  opps; door-block adjudication counts LIVE promises only.
- M1/M2/M3/M5/M7/M8/M9: reported per r97 definitions.
- M5 FIZZLE (r96 convention, kept): a depth fizzle is flagged ONLY when
  the thread is exhausted; the verdict rests on full reads plus the
  wind-down/probe gates.
- Interesting-finding threshold: any class-E starvation death; any
  doorstep skip on a needy scholar with a live outing; any door refusal;
  any live-promise dawn opp that waits but never departs for a door
  reason; any liveRunEnds endOk=false; any waited live opp that ends
  NO-DEPART for a live-run reason despite the pass; any
  system-contact miss; any fabrication flag; any wild water skip (Q2);
  any pantry-to-0 before d28; any starvation death of any cause class.

## Pilot gate (binding, staged method)
Seed 847 runs first (DAYS=28). If it CRASHES, STOP and report. If the
shape test FAILS on the pilot corpus, STOP and fix the instrument before
expanding. Only then run 848–856.

## Metric review
(To be filled at closeout.)
