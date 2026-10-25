# journey-scale r34 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140)

Run id: oversight-playtest-loop-20261025T1443Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion.
Base: master@4f99a66b6 (pulled at run start; worktree journey-scale).
Driver: scripts/journey-scale-r34-20261025.js (r33 driver + daily trust
instrument only; picker cap inherited, R32 SUMMARY label fixed to R34).
Analyzer: scripts/analyze-scale-r34-20261025.js (r33 analyzer + daily
trust-delta attribution).
Proof: scripts/test-journey-scale-r34-trustdelta.js (extracts the driver's
daily-snapshot/delta code path and replays synthetic link histories).
Policy: scripts/policies/scalecourt-nogate.js — UNCHANGED from r33.
Standing scalecourt.js untouched. Zero src/js changes.

## Leg question (from r33's named next arm)

r33 measured the split but could not explain it: covenants formed ≤ d77
climb to season (peaks 65–89); covenants formed ≥ d91 stall at peak 35–38
and decay to 34–37, never reaching trust 40 — while primary-sub links climb
throughout (40→50–73) and the policy's tended counter is 0 everywhere.
r33's own metric review named the gap: weekly samples are too coarse, and
"whatever grows covenant trust is not the policy's tending path."

Code read BEFORE this run (no code changed): hierarchy.js covenantTick
pays +1/week ONLY while no covenant link has poolLive; once the pool is
live the weekly tick pays nothing, and short pours cost −2 on the short
member (Haven short: −4 across the league). The other covenant gains are
event-only: defense answered +8, crisis conceded +8, first-court/feast
gains on the lead/covenant roads. _trustGain is the single choke (mourning
blocks gains for 7 days after a speaker death; every gain stamps
lastKeptDay). link.history is the engine's own day-attributed book
(capped at 40 entries, so a daily driver snapshot is what preserves it).

## The instrument (ONE change, driver only)

Every simulated day, after the policy's daily step, the driver snapshots
every active link: {day, other, kind, trust, poolLive, chartered,
lastKeptDay, mourningUntil, arrears, pendingDefense, pendingCovenantCrisis}.
It also diffs each link's history against the previous day and appends
only NEW history entries as trustEvents: {day, other, kind, noteKind,
note}. Weekly census, govWatch, transcripts, and picker cap are all
r33-identical. Same seeds as r30–r33 (85001–85004), same DAYCAP=150,
same death-aware stop, same d90/d120 conversation days.

PILOT GATE: seed 85001 runs first. If it crashes, its pilgrimages == 0,
or its trustWatch has zero covenant snapshots, STOP — do not burn the
other three seeds. Diagnose and report the instrument as failed.

## Pre-registered verdicts (binding, §14)

- TRUST1 mechanism identified: for every covenant link, the analyzer
  splits its life into pre-poolLive and post-poolLive phases (poolLive day
  = first snapshot day any covenant link shows poolLive) and reports,
  per phase: net trust change, number of weeks with a nonzero delta, and
  the dominant delta value with its source (history entry, govWatch line,
  or "silent weekly +1" / "silent other"). GO iff the phase split
  explains r33's split with a named mechanism — i.e. pre-pool weeks show
  a steady +1 (or event gains) and post-pool weeks show 0/negative drift
  except on event weeks — on at least 3 of the 4 seeds. A mechanism that
  fits only 1–2 seeds is reported as partial, not GO.
- TRUST2 late-bond stall confirmed at day granularity: every covenant
  link formed ≥ d91 shows post-formation net drift ≤ 0 excluding event
  weeks (defense/crisis/feast weeks), OR the run names the event weeks
  that lifted it. Bar: the stall holds on all late links, or each
  exception is event-explained. This is a measurement verdict, not a
  bar change — no threshold in src/js is touched.
- PICK-G picker-cap guard (regression only): all 8 transcripts keep max
  consecutive dlg:more/goon ≤ 1 and post-deflect goon = 0. A miss is a
  regression in the inherited cap, reported as such — the picker is not
  re-judged as a new arm.
- BONDS/NATIONAL (report-only): third bond by d110 and national by d140,
  with r33 as reference (3/4 bonds, 1/4 national). Any move is divergence
  (base moved from r33's f810314b8 to 4f99a66b6: belltoad/postflee/
  poolpres landings), reported and not judged as instrument success.
- L5 stay-green: every ending voiced in full, class named (scatter vs
  die-out vs alive-at-cap).

## What would count as interesting

- Pre-pool +1 / post-pool 0-or-negative on all seeds, with late bonds
  born already post-pool: the r33 split is fully explained — late bonds
  never had a +1 phase, they were born into the event-only regime. The
  next arm is then a tending/event question (how does a player feed a
  post-pool bond?), not another measurement run.
- Early bonds climb AFTER poolLive too, via defense/crisis/feast weeks:
  the event regime can carry a bond to 40, and the late-bond stall is
  about event scarcity (no calls in their window), not the weekly tick.
  The next measurement is event frequency per link-window.
- Deltas that match NEITHER phase (e.g. steady +1 after poolLive, or
  decay before it): the code read above is wrong or incomplete — the
  run must name the actual writer (history note, gov line, or a
  _trustGain caller the read missed) before any arm is proposed.
- A covenant reaches 40 in r34 where r33's same seed did not: base
  movement (not the instrument) moved it — reported as divergence, and
  the trust mechanism is judged on the phase shape, not the 40 line.

## Metric review (filled after the run — no metric re-scored)

- TRUST1 NO-GO as written: poolLive never arrived on 3/4 seeds (85002
  only on d150 itself), so the pool-phase split is unjudged, not refuted.
- TRUST2 NOT CONFIRMED: late bonds did not uniformly stall (85002's
  d93–100 bonds reached 49–52); formation day is the wrong discriminator
  — crisis rate vs deed rate is (see run note).
- PICK-G GO: all transcripts maxStretch ≤ 1, post-deflect goon 0.
- BONDS/NATIONAL report-only as pre-registered; counts moved with the
  base (85001 die-out, 85002 national d150), not the instrument —
  control: unmodified r33 driver on the new base gave the identical
  85001 outcome line.
- Telemetry LOUD lines (5/6) all explained as instrument-shape mismatch
  (see run note); baseline NOT rolled.
