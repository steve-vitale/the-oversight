# journey-scale r40 — PRE-REGISTRATION (lane A, leg 3 SCALE, days 80–140 + post-national tail)

**Run id:** oversight-playtest-loop-20261026T1555Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. **Base:** master at run start (0beb7da8b — sim-food-economy
round 1529-b). Rebase if a sibling lands mid-run; proof re-run after any rebase.
**Arm:** r39's named next question #2 (its metric review): the want-treadmill
pattern, now in its third appearance — r38 Scarlett (seek_taken stage 0), r39
Eduardo (seek_taken stage 0) and r39 Dorothy (ask_favor stage 2): the want is
named in the transcript header and never spoken about; the talk drifts into a
gossip treadmill and ends unresolved. r39's other named arm (pellet-vs-table) is
NOT this run: it is a Steve call, not a measurement. The unplayed finale is
lane B's leg, not this one's.
**Driver:** `scripts/journey-scale-r40-20261026.js` — the r39 driver with ONLY
run label / EVIDIR / mode changed, PLUS one picker variant behind an env flag:
`WANT_SUBJECT=1` makes the picker take `dlg:subject` at turn 0 (the
"Can I ask you something else?" choice that opens the subject menu, where the
alive want items live) instead of its usual first engage choice; every other
turn, the policy, the engine inputs, and the convo days (90/120) are unchanged.
**Analyzer:** `scripts/analyze-scale-r40-20261026.js` (r39 analyzer + WANT
section + tightened TABLE-VOICED filter). **Proof test:**
`scripts/test-journey-scale-r40-want.js` (static + synthetic-EVIDIR functional).
**Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED. Standing
scalecourt.js untouched. Zero src/js change is pre-planned: r40 is measurement
plus a driver-picker variant; any engine fix it motivates is a later run's work,
not smuggled into this one.

## Leg question

Is the want-treadmill a driver artifact or a system blank? The r39 picker never
selects `dlg:subject` — it is absent from both ENGAGE and ENGAGE2 — so the talk
never reaches the subject menu where alive want items (`alive:want:*`) are
offered. If subject-first talks surface the want, the flat verdicts of r38/r39
were the picker, not the game. If subject-first talks still drift to gossip
(no alive want offered, or the want opener still never speaks), the want is
unreachable from this sitting and the blank is the system's.

## Pre-registered metrics (BINDING — §14; a miss is NO-GO, never re-scored)

- **WANT-CONTROL (measurement-binding):** Mode A (WANT_SUBJECT unset) runs
  seeds 85001–85004. Every transcript carries want id + stage in its header
  (the driver's existing header). The analyzer's WANT section reports, per
  transcript: want, stage, picker mode, subjectPicked, aliveWantPicked,
  gossipCount (THEM lines matching headed-out / snares / is-back / doing-right-by
  templates), wantLexiconHits (seek_taken: /taken|pods|humming/; ask_favor:
  /favor|help|need|owe/ — generic, so hand-reading confirms), opening line,
  closing line. A transcript with no header want line is a NO-GO on the method.
- **WANT-SUBJECT (measurement-binding):** Mode B (WANT_SUBJECT=1) runs the
  same seeds 85001–85004 into a separate EVIDIR. Same WANT report. The verdict
  is judged on the comparison, not passed/failed by existence: subject-first
  surfacing the want in talks where control did not = driver artifact;
  subject-first still treadmill = system blank. A Mode B transcript whose
  first pick is not `dlg:subject` (when turn 0 offered it) is a NO-GO on the
  variant — the variant must be proven to have fired, not assumed.
- **WANT-HANDREAD (people check, SENSE-TESTING LAW):** all Mode A and Mode B
  transcripts are read in full by the runner (not counts-only): does the NPC
  want something, do the options engage or deflect it, does the ending
  resolve/plant/owe? The analyzer counts support the reading; they do not
  replace it.
- **TABLE-PARITY (method; r39's revision, adopted):** parity is judged against
  a SAME-BASE control, not r39's published numbers — the base moved since
  r39. Control: the r39 driver (EVIDIR path only changed, to a scratch dir —
  never r39's own dir) run on seed 85001 on THIS base; bar: r40 Mode A pilot
  85001 outcome line == control outcome line (day, over, popAlive/popTotal,
  pantryKcal, pilgrimages, lead, seat, arc). Any diff is instrument
  contamination and a NO-GO on the method.
- **TABLE-VOICED-TIGHT (tooling fix, proven by the proof test):** the r39
  filter also caught two non-table lines — the fusion-reactor line ("It does
  not come out" matches /does not come/) and feast lines ("Arc IV burns
  hotter" matches /ARC IV/). r40's analyzer excludes /does not come out/
  and /burns hotter/ from TABLE-VOICED. The proof test runs the analyzer on a
  synthetic EVIDIR containing both decoy lines and asserts they are not
  counted, while a true table line is.
- **TABLE-REGRESSION (report-only):** seat/arc/waiting/announced from
  tableWatch, same shape as r39 — does the r39 approach picture (lesser seat
  3/4, arc 4 3/4, waiting 3/4) hold on this base?
- **BOOK-TITAN (secondary, regression watch):** every titanEscalate −5 still
  100% booked (r36's fix must hold on the new base).
- **PICK-G (picker-cap guard, inherited):** max consecutive dlg:more/goon
  ≤ 1 on every transcript; post-deflect goon = 0. Any violation is a
  regression. (Mode B's turn-0 subject pick is not a stretch press and does
  not interact with the cap.)
- **BONDS/NATIONAL (report-only):** third bond by d110, national by d140,
  lesser seat, wave 5 — same report as r39, no bar.

## Pilot gate

Mode A seed 85001 runs first (after the control run), then Mode B seed 85001.
If either crashes, produces no transcripts, or pilgrimages == 0, STOP (same
gate as r37/r38/r39). Seeds matched to r30–r39: 85001–85004. Horizon DAYCAP=180,
death-aware stop.

## Metric review (standing notes carried into r40)

- r39: TABLE-PARITY judged vs same-base control only (adopted here).
- r39: telemetry-check against scale.json baseline is LOUD on panel-observer
  fields the journey census does not carry — EXPLAINED, not a game deviation.
  r40 runs the same-shape check (day, popAlive, pantryKcal on the same files)
  and does NOT roll the panel baseline. A journey-shaped baseline is still
  owed by a future run.
- r39: TABLE-VOICED counts were hand-counted (4/2/4/1) because the filter's
  raw counts (5/3/5/2) included the two decoys. r40 tightens the filter; if
  the tightened count still disagrees with hand-reading, the hand count wins
  and the filter gets a second tightening note, not a silent correction.
- r38/r39: the want-treadmill was documented, not fixed, twice. r40 does not
  fix the engine either — it isolates the cause (picker vs system) so the
  next run fixes the right thing.
