# journey-landing r99 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261104T2045Z (scheduled 20:45 CST 2026-11-04).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@38f849146 at snapshot time (worktree registration was
flap-blocked at run start — see Flap note below; the panel snapshot is a
byte-size-verified copy of this tip, and the base commit is recorded here
before any seed ran).
**Numbering note:** the Lane A counter is global across legs; r98
(2026-11-04, seeds 847–856) was the last landing panel, so this run is r99.
Driver: scripts/journey-landing-r99-20261104.js (prepared and committed by
r98, used verbatim — fresh seeds 857–866, DAYS=28, OUTDIR landing-r99).
Diff-verified against the r98 driver at run start: only header, seeds,
OUTDIR, and the R99 carry header differ (zero policy change).
Analyzer: scripts/analyze-landing-r94-20261104.js (unchanged, dir-as-argv).
Fights: scripts/analyze-fights89-20261102.js (unchanged, dir-as-argv).
Shape test: scripts/test-landing-r94-shape.js.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or
gate change in this run. **Perception law (2026-10-28) stands** — all
instruments read-only; pickers press offered menu items only; the last-tile
walk reuses travelTo (the game's own "Walk here" pathfinder).
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect
is proven in game code (not driver policy) with a before/after proof test;
otherwise document and move on. This run carries NO planned code change.

## Flap note (read before scoring — infrastructure, not game)
At run start the container EPERM write flap (2026-11-03/04 class) blocked
every git write in the main repo: `worktree-register.sh` failed
repeatedly (packed-refs.new / worktrees admin-dir / loose-ref .lock writes
all EPERM), and bulk `cp` of the tree failed on most files. Plain single
writes intermittently succeed; git needs several consecutive writes, so
registration kept failing. This prereg is therefore recorded HERE (goal
hidden_files evidence, alongside the panel OUTDIR) BEFORE any seed ran,
and will be committed verbatim into repo evidence/ once registration
succeeds — the panel itself needs no git: the driver reads src/js and
writes only to the goal evidence OUTDIR, and it carries its own
WRITE-FLAP RETRY (census 90×10s). If registration never succeeds this
run, the panel still stands as a pre-registered measurement, and the
run note will say the merge is owed, not pretend it happened. No file in
the main tree was edited, committed, or written by this run.

## Addendum (written before any seed ran)
Registration SUCCEEDED on retry attempt 5 (registry heartbeat verified
active) after this prereg was recorded above. The panel therefore runs
in the proper worktree `journey-landing` at master@38f849146 — NOT from
the snapshot (the snapshot copy was abandoned incomplete and deleted;
no seed ran from it). This prereg, including this addendum, is committed
verbatim into repo evidence/ before the pilot seed runs. Nothing about
the questions, metrics, seeds, or horizon changed between the original
record and this addendum.

## Standing context (read before scoring)
- r98 (seeds 847–856, DAYS=28): Q1 GO on binding clauses BUT FIX-BRANCH
  UNEXERCISED at panel scale — the single triggered doorstep step
  (851 d10, kcal 685→2335, ate, enter true) carried liveOuting=false;
  across 281 doorstep checks there were 0 'outing-live' skips, so the
  R98 needy+live-outing→eat branch has zero panel exercises and must
  NOT be cited as panel-proven (the r97 seed-843 replay remains the
  only proof). M1 alive-d14 10/10; M2 system contact 10/10 (day 8–9);
  M3 21/21 fights complete, 1 fatal (clean monster-approach loss);
  M5 people PASS (party invites 3/3 spoken, 1 accepted; 2 full
  transcripts read, no fabricated history); M7 kcal PASS (3 skips →
  3 arrivals, rescue ladder 3/3, eat-on-arrival 3/3), water UNTESTED;
  M8 shape PASS; M9 NO-GO on self-sufficiency only, narrow (854:
  0.695 < 0.70 by 0.005, yet FED at horizon, 0 starvation deaths);
  M10 dawn-door live-only PASS (223 panel opps, waitDiagMissing 0,
  5 waited live opps departed, 0 unexplained door blocks; probe
  hall-door stall on 848, probe-side).
- r98's carried watches: (a) horizon pantry thin on 4/10 panel seeds by
  the <2000/person line, a slow bleed not a famine (no panel seed's
  pantry hit 0 before d28); (b) water clause UNTESTED since r87 — now
  thirteen runs deep; (c) probe hall-door adjacency stall (probe-side,
  not a game block); (d) armor tele/line counts disagree (different
  counting units, neither citable for craft counts); (e) outings that
  depart still break on patch exhaustion ("0 kcal" together-blocks);
  (f) creek-tile evening-home block, recovered by the rescue ladder
  but not by the evening hop; (g) census strips liveOuting from
  doorstep steps — the branch can only be adjudicated from the live
  driver log's HAVEN-DOORSTEP lines or the MET dump, not the census.

## Leg questions (binding)
**Q1 — DOORSTEP-OUTINGLIVE BRANCH, SECOND PANEL ATTEMPT (r98 finding):**
fresh 10-seed panel (857–866, DAYS=28) under the r99 driver. GO = M6
binding clauses all hold: (a) every triggered doorstep step carries a
complete eatRec; (b) 0 class-E scholar starvation deaths; (c) 0
triggered doorstep steps ending with enterResult===false. Additionally:
any triggered doorstep step with liveOuting true and a needy scholar
must EAT (not skip) — a skip on a needy scholar with a live outing is
a NO-GO even if no death follows. If the branch again goes unexercised
(0 live-outing doorstep checks), the verdict is GO-on-clauses with the
branch STILL UNEXERCISED, and the next run should consider a targeted
repro (a seed/day engineered to hold an outing live across the
doorstep check) rather than a third blind panel. NO-GO = any clause fails.
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
reported with its pantry trajectory and cause class.

## Metrics (binding; §14 — a miss is NO-GO, never re-scored)
- M6 DOORSTEP-GO (binding, r94/r95/r96/r97/r98 clauses): (a) every
  triggered doorstep step carries a complete eatRec; (b) 0 class-E
  scholar starvation deaths; (c) 0 triggered doorstep steps ending with
  enterResult===false.
- M10 DAWN-DOOR, LIVE-ONLY (binding): waitDiag present on 100% of dawn
  opps; door-block adjudication counts LIVE promises only.
- M1/M2/M3/M5/M7/M8/M9: reported per r98 definitions.
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
Seed 857 runs first (DAYS=28). If it CRASHES, STOP and report. If the
shape test FAILS on the pilot corpus, STOP and fix the instrument before
expanding. Only then run 858–866.

## Metric review
(To be filled at closeout.)
