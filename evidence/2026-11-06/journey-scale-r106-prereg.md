# journey-scale r106 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-07T0245Z (scheduled 20:45 CST 2026-11-06).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@5a4e3e4b5 at first scored seed.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — all instruments read-only
except the FILL_ARM policy variant (presses only the offered
fillWater verb at Haven, a menu item a player can press) and the
TEND_PEER arm (the offered tendLink verb, as r103/r104/r105); pickers
press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** this run confirms r105's
fill-arm result on a fresh band — it does not re-prove r104's
diagnostic.

## Standing context (read before scoring)
- r105 (95901–95904, TEND_PEER=1, fill arm vs matched control)
  **PASSED Q1:** control dry 2, arm dry 0, no arm seed shorter than
  its control. The arm's seed 95901 lived +54 days (d126 vs d72)
  and staged the FIRST national (day 77, covenant) and FIRST global
  (day 78, Watchers) in the r102–r105 scale line; control 0/4
  national/global. The control died five days short of its covenant
  national beat with 3 seasoned covenants at trust 84–88.
- r105's footprint bound was one-sided (no shortening > 10 days).
  The +54-day divergence passes it literally but is the same
  stream-perturbation class as r102's −23 days. r105: "A default-fill
  decision cannot rest on this quad alone." Its metric review
  **proposed for r106:** judge footprint as |delta| with a
  two-sided bound, or report the divergence magnitude alongside
  the verdict rather than inside it. This run adopts the two-sided
  form (see Q1).
- **Tend premise weakens (r105, descriptive):** 95901-arm seasoned
  3 covenants with tendPeer=0 — on seeds where links are healthy,
  time seasons them; tending is one path, not the only path. The
  tend cadence/gate question (r104 item b) stays open, carried
  report-only here, not re-judged.
- **Dry nights persist under the fill arm (r105):** 95901-arm still
  slept out with packW 0 on 6 nights. The fill fixes the departure,
  not the overnight. Carried report-only (Q4b); no new lever
  this run.
- **Wall carried:** no full seat, no wave-5 content faced, no kill
  claimed on any seed in the scale line. One global staging is a
  rung, not a win.
- **V-INIT-BOND is live in this base** (landed 2026-11-06,
  merged 5ba7f167f): villagers propose bonds (warmth 15–49, at
  visits / daily pair tick / talk requests) and raise village-link
  ideas; targets decide by character (5–95%). Proposals observed
  in sittings are counted report-only, not judged — sittings are
  not the only venue.
- **Analyzer PREFIX defect (r105 metric review) fixed in this
  run's analyzer:** the arm run passes the arm EVIDIR with the
  SAME file prefix (the driver writes the same prefix in both
  dirs); passing PREFIX journey-scale-r105-arm read nothing.

## Q1 — FILL ARM CONFIRM, FRESH BAND (binding)
Matched control vs arm on fresh band 95911–95914.
**Elimination:** control dry ≥ 1 AND arm dry = 0 → elimination
REPRODUCED. Control dry 0 → INSUFFICIENT-DATA (the phenomenon did
not occur to be eliminated); arm dry > 0 → FAIL.
**Footprint (two-sided, adopted from the r105 proposal):**
|arm end day − control end day| per seed. Any |delta| > 10 →
HIGH-FOOTPRINT: the elimination verdict stands, but the
default-fill decision stays deferred pending a bigger panel.
All |delta| ≤ 10 → footprint CLEAN. The footprint is judged
alongside the elimination verdict, not inside it. r105 itself is
not re-scored.

## Q2 — CENSUS CONTINUITY (report-only)
National/global staged per quad, rank, seat, arc, seasoned peers
(final), scatter gap, deaths by cause class. National staged on
the arm quad again would strengthen r105's "survival, not trust,
is the binding constraint" reading; control national would weaken
the arm attribution.

## Q3 — PEOPLE CHECK (sense law, report-only)
Read sittings in full on seeds alive at day 90/120 (arm quad's
transcripts read when the control has no surviving sitting, per
the r105 precedent). Judge meaning, coherence, relevance,
consequences — never just exchange counts. Count V-INIT-BOND
proposals observed in the sittings read (report-only).

## Q4 — WATER CONTROL (report-only)
Walk-out dry/partial/wet counts per quad (the analyzer's Q1 GATE
line). **Q4b dry nights:** nights slept out with packW 0 at the
morning entry, per seed per quad (the r105 open blank, counted
from the morntrace NIGHT lines).

## Harness
- Driver: scripts/journey-scale-r106-20261106.js (r105 driver,
  labels/seeds/EVIDIR only + analyzer PREFIX comment fix).
  Analyzer: scripts/analyze-journey-scale-r106-20261106.js.
  Proof: scripts/test-journey-scale-r106-natgate-20261106.js
  (40/40 — 31 carried r104 checks + 7 FILL_ARM checks + 2
  fill-counter emission checks — BEFORE any scored seed ran).
- Policies: scalecourt-nogate-morntrace3 (control) vs
  scalecourt-nogate-morntrace3-fillnarrow (arm); diff-verified in
  r105 and re-checked by this run's proof test (the two variants
  differ ONLY by topUpBeforeWalk). TEND_PEER=1 both quads.
- Seeds 95911–95914 — FRESH band: grep across ALL dated preregs
  (evidence/*/sim-*-prereg.md, evidence/*/journey-*-prereg.md)
  plus forbidden-band lists returns zero hits for 95911–95914.
- DAYCAP=180, death-aware stop (+10d tail max per MEASUREMENT
  §10; a dead/scattered village stops simulating).
- PILOT GATE: smoke seed 95910 × DAYCAP=45 first (no crash,
  pilgrimages > 0), then pilot seed 95911 control. A crash or
  zero pilgrimages STOPS the run.
- Determinism: control re-run after any mid-run driver fix must
  be byte-identical except new instrument fields (r105
  precedent). No fix is expected.
- Duplicate-day note (carried): the daily hook fires twice on
  day 2 across ALL watches (pre-existing r99 lineage behavior),
  so nat-gate counts carry +1 row on day 2. Disclosed;
  immaterial (1 row per seed).

## Scale leg verdicts carried
REACHABLE partly (national 1/4 arm, 0/4 control in r105); FUN yes
with the death-band caveat (most seeds die before day 90);
WINNABLE not yet (no full seat, no wave-5 content faced).

## Metric review (filled at closeout; pre-registered metrics bind)
No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written under "metric review" and the revision
proposed for the NEXT run.
