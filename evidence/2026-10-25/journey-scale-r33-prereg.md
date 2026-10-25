# journey-scale r33 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140)

Run id: oversight-playtest-loop-20261025T0943Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion.
Base: master@f810314b8 (pulled at run start; worktree journey-scale).
Driver: scripts/journey-scale-r33-20261025.js (r32 driver, picker cap only).
Analyzer: scripts/analyze-scale-r33-20261025.js (r32 analyzer + picker counts
+ trust trajectories). Proof: scripts/test-journey-scale-r33-pickcap.js (14/14).
Policy: scripts/policies/scalecourt-nogate.js — UNCHANGED from r32. Standing
scalecourt.js untouched. Zero src/js changes.

## Leg question (from r32's named next arm)

r32 left the conversation picker as the as-played defect: 6/8 transcripts
marred by the picker's more/goon loop (measured from r32's own transcript
files: max consecutive stretches 0, 2, 3, 1, 8, 1, 0, 3 — the 8 is 85003-d120,
a whole conversation of dlg:more) plus one goon re-ask AFTER a deflect
(85002-d90 Domfeh). Does capping the picker fix the as-played conversation
without breaking the content — and, measured on the same run, what does
covenant trust actually do after formation?

## The arm (ONE change, driver only)

In the r33 driver picker: at most ONE consecutive dlg:more/goon press, and
NEVER goon after a deflect in the same conversation. State {consec,
deflected} is maintained by runConversation and passed to pickChoice.
Everything else is r32-identical: same seeds, same DAYCAP=150, same
nogate policy, same d90/d120 conversation days, same 8-turn cap.

Trust is MEASURED, not changed: the analyzer prints each final link's
trust trajectory from the weekly village census (first / peak + day-age /
final / ever-40). r32's own 85003 numbers (re-analysis, not this run's
evidence): covenants form at trust 30, peak at 38 around age 30, decay to
33–34 by age 50, never reach 40; tended counter 0. r33 re-measures on fresh
runs; if it confirms, the next arm is a tending/deeds question, not another
picker tweak.

## Design: matched worlds

Same seeds as r30/r31/r32 (85001–85004), same driver except the picker cap,
same horizon (DAYCAP=150, death-aware stop). Matched at world-gen only: the
picker change rewrites the RNG stream after the first d90 conversation, so
later divergence (deaths, survivals) is reported, not attributed. Picker
counts are the clean comparison; bond/national timing is divergence watch.

PILOT GATE: seed 85001 runs first. If it crashes or its pilgrimages == 0,
STOP — do not burn the other three seeds. Diagnose and report the arm as
failed.

## Pre-registered verdicts (binding, §14)

- PICK1 picker stretches: on ALL 8 transcripts, max consecutive
  dlg:more/goon ≤ 1 AND total post-deflect goon picks = 0. r32 baseline:
  max stretches 0/2/3/1/8/1/0/3, post-deflect goon 1. A miss means the cap
  is not wired where the driver actually picks — report it, do not re-score
  PICK1 as "stretches shortened".
- PICK2 meaning preserved: ≥ 6/8 transcripts read as meaningful (NPC wants
  something, options engage/deflect it, endings resolve/plant/owe; no
  fabricated shared history). Shorter transcripts are NOT a miss — a
  conversation that ends cleanly beats a looped one. A picker artifact
  that survives the cap counts against PICK1, not as "content".
- TRUST (measurement, report-only): per covenant link, first / peak /
  final trust and ever-40. Question: does any covenant reach trust 40 in
  r33? No bar set — this run measures, the next run arms.
- BONDS/NATIONAL (report-only): third bond by d110 and national by d140,
  with r32 as reference (3/4 bonds, 1/4 national). The picker talks at
  d90/d120 should not move courtship; any move is divergence, reported
  and not judged as picker success or failure.
- L5 stay-green: every ending voiced in full, class named (scatter vs
  die-out vs alive-at-cap).

## What would count as interesting

- Stretches collapse to ≤ 1 everywhere AND transcripts stay meaningful:
  the picker was the defect, the content was fine — the driver fix stands
  and future runs inherit the capped picker.
- Stretches collapse but transcripts turn thin or abrupt (all leaves at
  turn 1–2, wants never engaged): the cap is too blunt — the next arm is
  a smarter picker (substantive-option preference), not a looser cap.
- A covenant reaches trust 40 in r33: the seasoned bar is reachable on
  some seeds and r32's 85003 was a trajectory case, not a wall — the
  next measurement is what differed on that seed.
- No covenant reaches 40 again, with the same rise-then-decay shape: the
  seasoned-trust bar is the scale wall for covenant-road villages, and
  the next arm must be tending/deeds (what raises trust post-formation,
  at what rate) — the r34 question.
- A village scatters or dies where r32's survived (or vice versa): the
  picker change moved the RNG stream enough to flip a fate — reported as
  divergence, and a reminder that matched seeds are matched at world-gen
  only.

## Metric review (filled after the run — no metric re-scored)

- PICK1 GO: all 8 transcripts maxStretch ≤ 1, post-deflect goon 0.
- PICK2 GO: 8/8 transcripts meaningful by full read (bar was ≥ 6/8).
- TRUST measured, not judged: early-formed covenants climb to season,
  late-formed (d91–98) stall at peak 35–38 and decay to 34–37, never 40.
  Next run (r34) needs day-attributed trust deltas to find the mechanism.
- BONDS/NATIONAL report-only as pre-registered: 3/4 third bonds by d110,
  1/4 national by d140 — identical counts to r32, not upgraded to a verdict.
- Telemetry LOUD lines (5/6) all explained as instrument-shape mismatch
  (see run note); baseline NOT rolled.
