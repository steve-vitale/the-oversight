# journey-scale r35 — PRE-REGISTRATION (lane A, leg 3 SCALE, days 80–140 + post-national tail)

**Run id:** oversight-playtest-loop-20261025T1843Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. **Base:** master at run start (2018a499a after lane-B
sim-food-round-1752 landed mid-preflight; worktree rebased onto it before any
sim). **Driver:** `scripts/journey-scale-r35-20261025.js` (r34 driver + ONLY:
trust-setter call-site logging, betrayal-choice picker handling, DRIVER DROP
marker, DAYCAP 150→180). **Analyzer:** `scripts/analyze-scale-r35-20261025.js`.
**Proof test:** `scripts/test-journey-scale-r35-trustset.js` (must pass on r35,
must FAIL on r34: r34 has no installTrustSetters, no betrayal pick, no drop
marker). **Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED.
Standing scalecourt.js untouched. Zero src/js changes (instrument only).

## Leg question (carried from r34, verbatim)

r34 proved deeds feed covenant trust silently (+1..+4 per deed, no line, no
book entry) and found 4 silent −4/−5 drops with no writer in the engine's
book. r34's own instrument lesson: daily snapshots cannot attribute moves
the engine never books. r35's question: **can driver-only trust-setter
logging attribute EVERY daily trust move to a named call site, and what
are the writers of the r34-class silent drops?**

## Pre-registered metrics (BINDING — §14; a miss is NO-GO, never re-scored)

- **ATTR (attribute coverage):** for every link-day with a nonzero daily
  snapshot delta, the setter log's summed delta for that link that day
  equals the snapshot delta. Bar: ≥95% of nonzero link-days matched
  exactly; every mismatched link-day listed with both numbers. A
  systematic mismatch class (e.g. formation-day moves) is a finding, not
  a re-score — it is reported as the coverage gap.
- **DROPID (silent-drop writers):** every daily drop ≤ −4 on a covenant
  link is named by its setter stack site (function name, or
  `_trustGain`-caller when routed through the choke). Bar: 100% of
  drops ≤ −4 named; any unnamed drop is a NO-GO on the instrument.
- **BETRAY (betrayal-choice handling):** transcripts are NOT driver-dropped
  on betrayal choices. If a betrayal want is encountered, the driver
  engages it (betrayal:accept) and the transcript is judged for meaning
  under the conversation bar. If none is encountered, BETRAY is
  reported NOT-ENCOUNTERED (not a fail, not a pass).
- **PICK-G (picker-cap guard, inherited):** max consecutive dlg:more/goon
  ≤ 1 on every transcript; post-deflect goon = 0. Any violation is a
  regression, not a metric to re-tune.
- **POSTNAT (post-national window, report-only):** for any seed reaching
  national, days observed after the national day, and poolLive days in
  that window. No bar — this window has never been observed; r35
  measures whether DAYCAP 180 finally buys it.
- **BONDS/NATIONAL (report-only, as r32–r34):** third bond by d110,
  national by d140, lesser/full seat, wave reached.

## What would count as an interesting finding

- A named writer for the silent −4/−5 drops (e.g. a specific council /
  succession / arrears routine) — that closes r34 blank (b) and decides
  whether the drop is voiced elsewhere or is a second silent move.
- A setter site for deed gains that is NOT recordDeed's wrap (a second
  silent gain channel) — that widens r34 blank (a).
- A post-national poolLive window with trust movement (or a clean
  post-national zero-movement window) — either one retires r34 blank (d)
  as measured instead of carried.
- A betrayal transcript that reads as a real want with a resolution
  (or one that reads as a menu) — that closes r34 blank (c) either way.

## Seeds, horizon, pilot gate

- **Seeds:** MATCHED to r30–r34: 85001–85004. Same world-gen, new base.
- **Horizon:** DAYCAP=180 loop-days (was 150), death-aware stop
  (dead/scattered village stops simulating; +10d tail max per the
  measurement methodology — the harness's over-stop already enforces it).
- **PILOT GATE:** seed 85001 runs first; if it crashes or pilgrimages == 0,
  STOP and report — do not launch the other three.

## Metric review (to be filled after the run — never mid-run)

- No metric re-scored mid-run. Revisions proposed here apply to r36.
