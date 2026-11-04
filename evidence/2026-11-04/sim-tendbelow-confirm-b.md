# Tend-through ONLY below the seasoned bar, decision-time classifier — CONFIRM — Loop B, arm sim-tendbelow-confirm-b

Axis: scale-onramp / winnability chain. POLICY-ONLY arm: the
pilot's policy file on master, ZERO src/js changes, ZERO
edits to leadcourt.js, leadcourt-tendthrough.js,
leadcourt-tendseason-b.js, or the pilot driver/analyzer
files, ZERO gate/price/deed changes. This arm is the
CONFIRM of the pilot GO in
`evidence/2026-11-04/sim-tendbelow-b.md` (Loop B 1735Z,
fresh band 91501–91508), on a THIRD FRESH band, with the
pilot's guards (a)–(e) verbatim PLUS the new rung guard
(f) the pilot's metric review called for. It never tests
zombie-clearing, never bundles legs, and never touches
the sibling arm sim-standaccum-b (same coordinator run),
any Loop A tree/claim/branch, the HELD branch
sim-recovery-zombie-b, or the orphaned sim-fracchoice-b
tree.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-tendbelow-confirm-b-prereg.md`
(commit f9a778bc). In short:

- Question: does the pilot GO survive a third fresh band
  under the fixed decision-time classifier, once rung
  downgrades are counted? The pilot's metric review item
  1 named the gap: 91503 and 91506 dropped global →
  regional with no band regression and no drop-guard
  breach. This confirm counts that shape.
- Predicate (from src/js/hierarchy.js before any sim): a
  link IS seasoned iff (scholar day - link.day) >= 30 AND
  (link.trust || 0) >= 40 (link.day = formation day,
  link.trust starts at 30 in _formLink). This policy tends
  iff NOT that: age < 30 days OR trust < 40.
- Decision-time rule (pilot verbatim): the driver wraps
  Game.tendLink a second time (outer, call-through). The
  wrapper reads the live link from hierarchyState() in
  the same synchronous call stack as the policy's own
  predicate check, copies trust/day/age, computes
  seasoned, then captures the call's return (paid kcal:
  > 0 = grain sent, 0 = refused) and records one
  tendDecisionEvent. Snapshot-based tend classification
  is NOT used anywhere in this arm — no fallback. A
  missing decision record or any 'unknown' decision event
  forces INSUFFICIENT-DATA.
- Primary variant (EXACTLY ONE): scripts/policies/
  leadcourt-tendbelow-b.js ON MASTER (verified
  unmodified: worktree `git status` clean at prereg
  time) = leadcourt-tendthrough with EXACTLY ONE
  functional change: the tend condition gains the
  below-seasoned-bar predicate. Everything else is
  tend-through verbatim (weekly cadence, Haven-primary
  only, 1,500 kcal engine request, NO pantry tend gate
  of any kind, proposal gate pantry > 12,000 unchanged,
  answer/counter logic unchanged).
- Seeds: FRESH confirm band 91301–91316, identical on
  both legs (32 runs). Freshness verified before the
  prereg: 0 bare-word hits in any dated evidence .md
  (all dates, this worktree's evidence/), 0 per-seed
  corpus filename hits (exact-token search), absent from
  the task's forbidden list (pilot 91501–91508,
  tendseason 99209–99216, fleerepair 99601–99612,
  exphurt 99917–99932, gearbar 99101–99108, and the
  tracker's other 2026-11-04 bands) and from the goal
  tracker's band list. Scope stated in the prereg: the
  check covers this worktree's evidence/ plus the goal
  tracker/sim-findings; the sibling sim-standaccum-b
  arm's band (if any) was not visible here at prereg
  time, since its evidence is not merged into this tree
  — a collision found later by the coordinator is a
  coordinator-level flag, never a re-score. Incidental
  whole-word hits for 91306/91310 inside OLD JSON corpora
  were spot-checked and are pantryKcal/freshKcal VALUES
  (e.g. pantryKcal 91306), not seed uses.
- Horizon: 300 days, death-aware (dead villages stop
  simulating; +10d tail max as implemented by runDays).
  WHY 300: identical window to tendfloor, 0930Z,
  tendseason, and the pilot, so per-seed death-day
  deltas are like-for-like; the death-aware stop bounds
  cost (confirm max survival 166d; 300 was never
  binding). A village alive at 300 is censored, reported
  as survived, not as a win.
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim
  and the polityfrag analyzer
  (scripts/test-polityfrag-analyze-20261104.js) REUSED
  verbatim, through NEW confirm copies of the pilot
  driver/analyzer (scripts/test-tendbelow-confirm-
  driver-20261104.js, output
  evidence/2026-11-04/perseed-tendbelow-confirm-b/,
  RUN=tendbelow-confirm-base / tendbelow-confirm-armed;
  scripts/test-tendbelow-confirm-analyze-20261104.js,
  which reuses the pilot analyzer's summarizeLeg/
  pairSeeds/judgeGo and adds ONLY the leg (f) rung
  judge). The pilot driver/analyzer files themselves are
  NOT edited. The snapshot NEVER calls
  villageStandingTotal() or unlockedWave(); ONE
  end-of-run unlockedWave() call is reported separately
  and never counted as a natural door-open. The driver
  refuses to overwrite an existing per-seed file.
- Interim catastrophic-stop rule (NOT a verdict): after
  the armed leg's first 8 seeds paired with the baseline,
  stop and report STOPPED (no verdict) if band
  regressions >= 3, OR armed drops >= baseline drops + 3,
  OR any premise violation. Otherwise complete all 16
  seeds and judge only on the full band.
- Survival bands (same as tendfloor/0930Z/tendseason/
  pilot): A = survived to the 300d horizon, B = died
  150–299d, C = died 100–149d, D = died < 100d.
- Wave facing (ever-faced): a seed has faced wave 4
  (resp. 5) iff ANY daily snapshot carries w4faced
  (resp. w5faced) true. Counts are per leg (seeds / 16).
- Hold-share (pooled, per leg): over diplomacy seeds
  only (firstDiploDay != null), sum of post-first-diplo
  snapshots divided by sum of post-first snapshots.
- Rung classification (for leg (f) only): end-state
  scaleRank per seed per leg (Game.scaleRank() at end
  of run). Rung order: village 0, regional 1, national 2,
  global 3 (docs/SCALE.md ladder + hierarchy.js
  scaleRank()). A seed is an ARMED downgrade iff
  order(armed) < order(baseline); a BASELINE downgrade
  iff order(baseline) < order(armed) (the symmetric
  paired comparison). Ties are neither. Unknown ranks
  count for neither side and are listed; > 2 unknown-rank
  seeds on either leg => INSUFFICIENT-DATA.

## PRIMARY METRIC + GO THRESHOLD (binding, judged exactly)

GO iff ALL hold: (a) NO survival-band regression on ANY
seed; (b) median death-day delta (armed minus baseline,
over all 16 seeds) >= -5 days; (c) armed pooled
hold-share >= baseline pooled hold-share - 0.05; (d)
armed ever-faced wave-4 count >= baseline - 1 AND armed
ever-faced wave-5 count >= baseline - 1; (e) armed total
drops <= baseline total drops + 1; (f) RUNG GUARD (NEW):
armed downgrade count <= baseline downgrade count
(paired end-state scaleRank comparison — net rung
movement not negative; on the pilot band this guard
would have read armed 2 vs baseline 0 and FAILED).
Otherwise NO-GO. A miss is NO-GO, never re-scored
against a friendlier metric mid-run.

## Judged verdict — NO-GO (leg (a) only; every other leg passes)

Judge output: verdict NO-GO, insufficientReason null.
Leg (a) no regressions: FALSE (regressions: 91301,
91310). Leg (b) median death-day delta 0 days (deltas
sorted: -39, -6, -3, 0, 0, 0, 0, 0, 0, +1, +17, +19, +33,
+42, +54, +71; bar >= -5): TRUE. Leg (c) pooled
hold-share 0.997 vs baseline 0.993 (bar >= 0.943):
TRUE. Leg (d) wave guard: wave-4 13 vs baseline 13
(bar >= 12): TRUE, wave-5 2 vs 1 (bar >= 0): TRUE.
Leg (e) drop guard: armed drops 1 vs baseline 1
(bar <= 2): TRUE. Leg (f) rung guard: armed downgrades
1 vs baseline downgrades 5 (bar: armed <= baseline):
TRUE. Bad seeds 0. Insufficient-data triggers: none
fired (0 instrument errors, 8 baseline diplomacy seeds,
decision records matched on 32/32 runs, armed seasoned
0, armed below-bar 252, unknown 0, unknown ranks 0).
Verdict as pre-registered: NO-GO, because leg (a) is
binding and two seeds regressed a band. No other leg
was close except where noted below; the verdict does
NOT hinge on a single boundary case — 91310 is a -39
day regression with a rung downgrade attached, and
91301 is a second, independent regression.

## Per-seed table (baseline = tend-through, armed = below-bar)

Columns: days base→armed (delta), band base→armed,
trajectory base→armed, end rank base→armed, ever-faced
W4/W5 base→armed, drops base→armed, tend calls base→
armed (armed below-bar/seasoned in parens), paid tends
base→armed.

- 91301: 100→97 (-3), C→D REGRESSED, holds→holds,
  global→global, W4 Y→Y, W5 Y→N, drops 0→0,
  tends 74→33 (33/0), paid 33→15
- 91302: 26→26 (0), D→D, never→never, village→village,
  W4 N→N, W5 N→N, drops 0→0, tends 0→0 (0/0), paid 0→0
- 91303: 44→44 (0), D→D, never→never, village→village,
  W4 N→N, W5 N→N, drops 0→0, tends 0→0 (0/0), paid 0→0
- 91304: 50→50 (0), D→D, never→never, regional→regional,
  W4 N→N, W5 N→N, drops 0→0, tends 13→13 (13/0),
  paid 11→11
- 91305: 100→119 (+19), C→C, never→holds,
  regional→global UPGRADE, W4 Y→Y, W5 N→N, drops 0→0,
  tends 44→17 (17/0), paid 24→13
- 91306: 95→89 (-6), D→D, holds→holds, global→global,
  W4 Y→Y, W5 N→Y, drops 0→0, tends 87→16 (16/0),
  paid 26→15
- 91307: 73→127 (+54), D→C, never→collapses,
  regional→global UPGRADE, W4 Y→Y, W5 N→N, drops 0→1,
  tends 16→36 (36/0), paid 12→17
- 91308: 69→111 (+42), D→C, holds→holds,
  regional→global UPGRADE, W4 Y→Y, W5 N→N, drops 0→0,
  tends 41→15 (15/0), paid 17→14
- 91309: 88→121 (+33), D→C, holds→holds,
  global→global, W4 Y→Y, W5 N→N, drops 0→0,
  tends 73→16 (16/0), paid 25→16
- 91310: 111→72 (-39), C→D REGRESSED, holds→holds,
  global→regional DOWNGRADE, W4 Y→Y, W5 N→N,
  drops 0→0, tends 114→15 (15/0), paid 29→15
- 91311: 97→98 (+1), D→D, collapses→holds,
  regional→global UPGRADE, W4 Y→Y, W5 N→N, drops 1→0,
  tends 72→15 (15/0), paid 27→14
- 91312: 96→113 (+17), D→C, holds→holds,
  global→global, W4 Y→Y, W5 N→Y, drops 0→0,
  tends 78→16 (16/0), paid 30→15
- 91313: 71→71 (0), D→D, never→never,
  regional→regional, W4 Y→Y, W5 N→N, drops 0→0,
  tends 12→12 (12/0), paid 10→10
- 91314: 59→59 (0), D→D, never→never,
  regional→regional, W4 Y→Y, W5 N→N, drops 0→0,
  tends 8→6 (6/0), paid 4→4
- 91315: 95→166 (+71), D→B, never→holds,
  regional→global UPGRADE, W4 Y→Y, W5 N→N, drops 0→0,
  tends 27→15 (15/0), paid 14→15
- 91316: 57→57 (0), D→D, holds→holds,
  regional→regional, W4 Y→Y, W5 N→N, drops 0→0,
  tends 30→27 (27/0), paid 13→13

Totals: tend calls 689→252 (armed all below-bar);
decision-time seasoned 468→0; paid tends 275→187;
paid kcal 427,181→294,416 (-31%). Decision records
matched tend calls on 32/32 runs.

## Interim stop check (first half, 91301–91308)

After armed seeds 91301–91308 paired with the baseline:
regressions 1 (91301 only — below the >= 3 stop bar),
armed drops 1 vs baseline first-half drops 0 (below the
baseline+3 stop bar), premise violations 0 (no seasoned
tend, no unknown, no mismatch). NO STOP — the full band
was run and the verdict is judged on the full band, per
the prereg. The interim regression (91301) stands in the
final verdict; it was not treated as a verdict on its
own.

## Finding 1 — the two regressions, dissected

- 91301 (100→97, C→D, -3 days): a band-edge miss, not
  a collapse. The armed village holds its global polity
  to death exactly as the baseline did (hold 1.000 both
  legs, 0 drops both legs), but dies 3 days sooner,
  crossing the 100-day C/D edge. It also loses the
  band's only baseline wave-5 facing (baseline faced
  wave 5, armed did not; armed maxWave 4 vs baseline
  5) and its 22 baseline ready-5 days fall to 0. Small
  in days, real under the prereg: a band regression is
  a band regression, and the prereg binds.
- 91310 (111→72, C→D, -39 days, global→regional):
  the pilot-91506 shape, now counted by leg (f). The
  armed village holds its polity to death (hold 1.000,
  0 drops) but dies 39 days sooner and ends a rung
  lower. Its tends stop after day 56 (15 tends, all
  below-bar, all paid): once the links season, the
  policy never feeds them again, and the village never
  climbs to global the way the baseline did. No drop,
  no collapse line — the cost is paid entirely in days
  and rank. Leg (f) still passes overall (1 armed
  downgrade vs 5 baseline downgrades), but 91310 is the
  guard working as designed: the downgrade is counted,
  named, and visible, where the pilot's five legs let
  it escape.

## Finding 2 — the collapsing-seed question, answered on n=1 (saved)

This band is the first tend band with a baseline-
collapsing seed, so the question the pilot and
tendseason could not test finally has a data point —
and it goes FOR the restriction. Baseline 91311
collapses at day 96: its weak link (link_mgpspi14608)
sits at trust 43 on days 91–95 while the policy keeps
tending it as seasoned (age 64–68, trust >= 40) with
PAID 0 — the pantry is nearly bare (910 kcal at the
drop) — and one decay tick drops it 43→35 at day 96,
unseasoning the polity. The baseline's late grain went
to links already at trust 89–91 (day 92: paid 1,500 and
500 to the strong links, 0 to the weak one). Under the
armed leg the same seed HOLDS to death at global
(hold 1.000, 0 drops, 98 days): the early below-bar
grain (days 26–56) banked the weak link to trust 59–63
before it seasoned, and that buffer survived to death.
Mechanism, stated precisely: paid grain is what moves
trust, and tend-through kept spending its late grain on
already-safe links while the weak link got unpaid
attempts; below-bar-only banked trust early and evenly
and then stopped — and the bank held. One seed is not
a law, and the armed leg creates its own collapse
elsewhere (91307, below), so the net drop count is
unchanged (1 vs 1) — but the collapsing-seed direction
on this band is save, not tax.

## Finding 3 — the restriction changes WHICH villages form polities

Three baseline-never seeds form polities under the armed
leg only (91305: polity day 104, lives +19 days to
global; 91307: polity day 97, lives +54 days to global
but then collapses — the armed leg's only drop, day
127 = death day, two links unseasoning 42→35 and 43→36
with pantry 10,930, NOT bare, one link last tended day
124 paid, the other untended since day 97 while
seasoned; 91315: polity day 125, lives +71 days to
global, band D→B). Paired-seed deltas on this band
therefore mix the restriction's direct effect with
downstream timeline divergence: identical seeds, but
the grain saved by not feeding seasoned links changes
which villages survive long enough to court at all.
That divergence IS the measurement (identical seeds,
honest timelines), not noise to be averaged away — but
it means the per-seed deltas should not be read as
"the restriction's effect on a fixed polity." The
armed leg ends with 11 diplomacy seeds vs the baseline's
8, and national+ 5→9, global 5→9, on the strength of
these conversions plus the saved 91311.

## Finding 4 — the restriction bites, and the premise holds perfectly

Decision-time seasoned tends: 468 (baseline) → 0
(armed), on every seed, with 0 unknown and decision
records matching tend calls on 32/32 runs. Paid grain
falls 31% (427,181 → 294,416 kcal) while paid tend
counts fall less (275 → 187), because the armed leg's
tends are the below-bar ones that actually pay. The
lever fired (252 below-bar tends armed) and the variant
as defined was run (0 seasoned tends armed). The
classifier proves itself again: no mislabel to explain
away on a third band.

## Wall numbers (confirm legs, not wall movement)

Wins 0/16 on both legs. Villages lost 16/16, survived
to horizon 0/16, on both legs. End-state scaleRank —
baseline: global 5/16, regional 9/16, village 2/16
(national+ 5/16); armed: global 9/16, regional 5/16,
village 2/16 (national+ 9/16 — five rung upgrades
against one downgrade). Table: not instrumented by
this arm (stated, not faked); no win flag observed on
any seed. Wave-5 unlocks (maxWave 5) 1/16 → 3/16,
wave-5 ever-faced 1/16 → 2/16, wave-4 unlocks
(maxWave >= 4) 13/16 → 13/16, wave-4 ever-faced
13/16 → 13/16. Readiness-5-ready days (daily
snapshots with waveCombatReadiness(5).ready): 22 →
10 (baseline 91301's 22 days vanish under armed;
armed gains 3 on 91305, 6 on 91306, 1 on 91312).
Median survival 80.5 → 93.0 days (median-of-days
ROSE even though the judged median-of-deltas is 0 —
the two summaries answer different questions and both
are reported), max 111 → 166 days. Deaths (deathEvents
count) 920 → 972 — longer lives accumulate more death
events; the shape is unchanged: combat share baseline
villager combat 389 + combat 176 = 565/920 (61%),
armed 408 + 202 = 610/972 (63%) — villages die
fighting, not starving, on this band too. Starvation
deaths 7 → 7 despite the grain cut. Expedition
114 → 118, "the wild" 113 → 109. Arc II/III/IV reach:
not instrumented (stated, not faked). Four-realm
formation: not instrumented (stated, not faked).
Trajectories — baseline: never 8, holds-to-death 7,
collapses 1; armed: never 5, holds-to-death 10,
collapses 1.

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

Baseline leg (the collapse, narrated):

- 91311 d27 (formation): "Three fires bow to Haven. But
  a realm isn't leverage — it's seasons. These bonds are
  young; tend them, keep the trust, and the court will
  come." d76: "Four fires. One head. GOVERNANCE LAYER:
  online — polity tribute routing, the court calendar,
  famine reserves. You built a realm. Try not to lose it
  the way you found it." d96 (drop): "Ashford's fire is
  drifting from ours — their speaker doesn't linger at
  the gate the way they used to, and nobody over there
  says why. Bonds don't mend themselves; a tended fire
  remembers who fed it." Same day: "The realm came apart
  — no polity answers to Haven now, and Haven is a free
  fire again. National and global no longer describe
  this village. The climb starts over." The drifting-fire
  warning is honest about the bond weakening, but the
  causal link is again carried by numbers, not narration:
  nothing in the transcript says the pantry was nearly
  bare (910 kcal) or that the weak link got unpaid
  attempts for five days while strong links took the
  last paid grain. A player reading only the transcript
  would know the realm fell, not why.

Armed leg (the same seed saved; a new collapse elsewhere;
a rung lost in silence):

- 91311 armed: d27 and d76 lines recur verbatim, and
  then NOTHING — no drifting warning, no collapse line.
  The saved polity reads as an absence, which is exactly
  right: the realm that fell under tend-through simply
  holds here, and the transcript has no collapse to
  narrate. The contrast with the baseline leg's d96 pair
  is the cleanest sense-test in this corpus.
- 91307 armed (the new collapse): d67 formation line,
  d90 TWO drifting warnings (Ashford's fire AND The Red
  Table's fire, same template twice in one day — the
  template repetition is the one robotic note in this
  corpus), d97 GOVERNANCE line. The drop itself falls
  on death day 127 and has no collapse line of its own
  in the sampled lines — and the drifting-fire template
  misleads slightly here: it says "a tended fire
  remembers who fed it," but the failing link pair
  includes one link tended (paid) three days before the
  drop and one link untended for 30 days while seasoned.
  Pantry 10,930 at the drop means this collapse is a
  decay-timing story, not an empty-pantry story, and
  the narration does not say so.
- 91310 armed (the rung downgrade): no collapse lines,
  no drifting lines in the sample — the village holds
  to death a rung lower in complete narrative silence,
  exactly the pilot-91506 shape. The rung guard (f)
  exists because the narration does not mark this loss.
- 91305 armed (late polity): d74 formation line, d104
  GOVERNANCE line — a realm built four months in reads
  as a consequence of surviving that long under the
  restriction, not as a scripted beat: the lines are the
  same templates, but their DAYS (74/104 vs the usual
  27/57–76) carry the story.
- Flagged, minor, not verdict-driving: (1) the usual
  repeated templates recur across seeds ("1 unprocessed
  haul onto the counter — the clock is ticking" daily)
  — ordinary village talk, not diplomacy-specific
  robotics. (2) Carried capture limit from
  tendfloor/0930Z/tendseason/pilot: the instrument's
  SAY_RE still does not match tendLink's own say-lines,
  so tend events are proven by decision events and
  return values (paid tends 275 → 187), not quoted
  lines. (3) The drifting-fire warning fires per link
  per day and repeats its template verbatim when two
  links drift together (91307 d90) — readable, but
  doubled.

## Village assessment (plain words)

Picture the same sixteen villages, but with a new rule:
once a bond counts as seasoned — thirty days old, trust
forty or better — nobody sends it grain again. The grain
goes only to young bonds and struggling ones. On this
band the rule mostly helps: villages live longer on
average (median 81 days becomes 93), four more villages
end as world powers than before, three villages that
never built a realm under the old rule build one now,
and the one realm that collapsed under the old rule
holds here — because the grain it needed early actually
arrived early, instead of going to bonds that were
already safe. But the rule also takes its price, and the
price is exactly what the run set out to catch: two
villages end a band lower than they used to — one by
three days at the edge of a band, one by more than a
month while holding a realm that never climbed as high
— and one newly built realm comes apart on the day its
village dies. The grain saved is real (nearly a third
less grain sent), the realms gained are real (nine
world powers instead of five), and the losses are real
too — which is why the verdict is NO-GO even though
most of the numbers point up. A rule that helps most
villages and hurts two, judged by a bar that allows
zero hurt villages, fails its bar.

## Metric review (§14 — no in-run re-scoring)

- The prereg's GO legs were judged exactly as written;
  no metric moved. Leg (a): 2 regressions (bar: none)
  — FAIL. Leg (b): median delta 0 (bar >= -5) — PASS.
  Leg (c): pooled hold 0.997 vs 0.993 (bar >= 0.943)
  — PASS. Leg (d): wave-4 13 vs 13, wave-5 2 vs 1 (bar:
  within 1 each) — PASS. Leg (e): drops 1 vs 1
  (bar <= baseline + 1) — PASS. Leg (f): rung
  downgrades 1 vs 5 (bar: armed <= baseline) — PASS.
  Insufficient-data triggers: none fired (0 instrument
  errors, 8 baseline diplomacy seeds, decision records
  matched on 32/32 runs, armed seasoned 0, armed
  below-bar 252, unknown 0, unknown ranks 0).
- What the metric proved: the decision-time classifier
  proved itself on a third band (0 seasoned tends armed,
  0 unknown, 32/32 matches). The rung guard (f) proved
  itself too: it caught and named 91310's global →
  regional downgrade, which the pilot's five legs would
  have let escape again — and its net formulation
  (downgrades vs upgrades) passed honestly at 1 vs 5
  rather than hiding the downgrade inside a pass. The
  band-regression leg (a) did its job in both directions
  at once: it failed the run on two real regressions
  while the median-of-days rose, showing again that the
  two summaries are not interchangeable.
- What the metric missed, proposed for the NEXT run
  (not applied here): (1) BAND-EDGE AMPLIFICATION:
  91301's regression is 3 days across the 100-day edge;
  leg (a) treats it identically to 91310's 39 days.
  A future prereg could report edge-crossing deltas
  alongside bands, or pre-state a near-miss band — but
  the verdict here does not hinge on 91301 alone, and
  no such softening is applied retroactively. (2) RUNG
  GUARD FORMULATION: this confirm judged the NET
  formulation (downgrades <= upgrades); a zero-tolerance
  formulation (armed downgrades = 0) would have failed
  on 91310 alone. Which formulation the next diplo
  prereg uses is a pre-registration decision for that
  run, stated before sims — not a re-score of this one.
  (3) DIVERGENCE: three never→polity conversions mean
  paired deltas mix restriction effects with timeline
  divergence; a future prereg could pre-register a
  divergence note (how many seeds change trajectory
  class) as a reported secondary, so the mix is measured
  rather than narrated. (4) READY DAYS fell 22→10 as a
  secondary — the winnability chain cares about
  readiness-5 release, so a future run should say in
  advance whether ready days are judged or merely
  reported; here they were reported only. (5) SCOPE,
  updated: the collapsing-seed question is now answered
  on n=1 (saved) with a new collapse created elsewhere
  (91307) — a future run should judge the restriction
  on a band SCREENED for baseline-collapsing seeds
  (the pilot metric-review item 3 design), with n>1
  collapsers, before any claim about collapsing seeds
  in general.
- Instrument limitations recorded for the next run, not
  fixed here: (1) tendLink say-lines not in the SAY_RE
  sample (see sense-testing). (2) Per-link trust is
  sampled from daily snapshots for trajectories, so
  intra-day moves are netted, not itemized — but tend
  classification no longer depends on snapshots at all,
  so this no longer threatens the verdict. (3)
  scaleRank 'global' is the globalLive flag read, not
  a completed global campaign. (4) The analyzer's
  last-snapshot w4/w5 fields were NOT used for the wave
  guard; ever-faced (any snapshot) was, per the prereg.
  (5) Paid kcal totals are sums of engine returns
  (whole-unit pantry removal over-removes above the
  1,500 request); per-tend paid is not exactly 1,500.

## BALANCED PANEL (§15)

Before/after comparison on identical seeds (same 16
seeds, baseline = this leg's tend-through run,
candidate = below-bar run). The panel instrument is the
polityfrag analyzer over identical-seed per-seed JSONs
plus the tendbelow wrapper's delta/GO judge and the
confirm rung judge; the per-seed before/after table
above IS the panel output for this trajectory metric.
A balance-panel.js compare was ATTEMPTED on the
recorder corpus and its output is quoted honestly, not
worked around: it returned "Sweep-corpus comparison
(not a balanced-panel verdict) / Decision:
review_required / 0 paired cases; screen only" with
every contract metric not_observed, and its own footer
states "For a §15 panel verdict, build real panels
with scripts/balance-panel.js" — i.e. this corpus
shape does not fit the panel instrument, exactly as in
the pilot. No panel compare is fabricated, and no
sweep-compare re-score was substituted for the
pre-registered judge.
The telemetry deviation check (scripts/telemetry-
check.js against the scale-wall baseline) was ATTEMPTED
and REFUSED by the tool: "refusing recorder-corpus
input: all 32 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not
runs." Recorded honestly; no --allow-recorder-corpus
workaround was used to force a compare.

## HARD LIMITS (binding, honored)

No gate/price/deed change; no src/js change; no edit to
leadcourt.js, leadcourt-tendthrough.js, or
leadcourt-tendseason-b.js; no edit to the pilot driver/
analyzer files; no edit to any sibling policy; no
zombie-clearing mechanism; no propose/tend verb added
or removed; no file owned by another arm touched; no
Loop A tree/claim/branch touched; no HELD branch adopted,
merged, or re-run; no push, no bump, no live verification,
no merge to master (coordinator merges).

## Next blank, precisely (no fix in this run)

1. The confirm verdict is NO-GO on leg (a): the
   tendbelow variant does NOT confirm. Whether a
   fourth band, a re-shaped variant, or a different
   rung/band formulation follows is the coordinator's
   call — this worker judges only this band.
2. A screened collapsing-seed run (metric-review item
   5): pre-registered tend-through screening first,
   then the restriction judged on the collapsing subset
   with n>1 collapsers — the question this band opened
   (91311 saved, 91307 created) but cannot close on n=1.
3. The BELONG-tending gap (still open): tend-through,
   the floor, and this restriction all tend
   Haven-primary links only, so a BELONG link is still
   never tended on any seed here.
4. Ready-days secondary (22→10): say in advance, in the
   next diplo prereg, whether ready days are judged or
   merely reported — the winnability chain cares about
   readiness-5 release, and this secondary moved
   against the armed leg while the judged legs mostly
   passed.
NO gate/price/deed arm follows from this evidence.

## Findings for backlog (coordinator appends; not chased here)

- [open] 2026-11-04 — diplomacy — tend-through restricted
  to links below the seasoned bar (age < 30d OR trust < 40)
  on third fresh band 91301–91316 with a DECISION-TIME tend
  classifier: CONFIRM NO-GO on leg (a) only (regressions
  91301 C→D -3d and 91310 C→D -39d with global→regional
  downgrade; median delta 0d, pooled hold 0.997 vs 0.993,
  wave guard 13 vs 13 / 2 vs 1, drop guard 1 vs 1, rung
  guard 1 downgrade vs 5 upgrades — all other legs pass;
  armed decision-time seasoned tends 0, below-bar 252,
  unknown 0, decision records matched 32/32; paid tends
  275 → 187, paid kcal 427,181 → 294,416). Costs and
  gains named, not hidden: median survival 80.5 → 93.0d,
  max 111 → 166d, national+ 5 → 9, but two band
  regressions fail the pre-registered bar. Pilot GO does
  NOT confirm on this band; tendseason's NO-GO-shaped
  result is corroborated in direction (a NO-GO) on a
  third band under the fixed classifier.
- [open] 2026-11-04 — diplomacy — collapsing-seed question
  answered on n=1: baseline 91311 collapses day 96 (weak
  link trust 43→35, pantry 910, late grain to links at
  trust 89–91 while the weak link got unpaid attempts);
  armed 91311 holds to death at global (early below-bar
  grain banked the weak link to trust 59–63 before it
  seasoned). Counterpoint on the same band: armed 91307
  forms a polity that never formed under baseline, then
  collapses day 127 (two links unseason, pantry 10,930
  — a decay-timing collapse, not an empty-pantry one).
  Net drops unchanged (1 vs 1). Needs a screened
  collapsing-seed run with n>1 before any general claim.
- [open] 2026-11-04 — metric — rung guard (f) validated:
  paired end-state scaleRank comparison catches the
  holds-to-death rung downgrade (91310 global→regional)
  that the pilot's five legs let escape, and its net
  formulation passes honestly at 1 downgrade vs 5
  upgrades. Next diplo prereg must state before sims
  whether it judges the net or zero-tolerance
  formulation.
- [open] 2026-11-04 — narration — armed 91307's collapse
  narration (drifting-fire template, doubled for two
  links) does not say the pantry was full or that one
  link went untended 30 days while seasoned; the rung
  downgrade (91310) has no narration line at all, same
  as pilot 91506 (this run's sense-test).

## Proof and landing

- Proof: `scripts/test-tendbelow-confirm-20261104.js` —
  26/26 PASS (rung order + rungJudge incl. the pilot
  shape, six-leg judgeGo6 incl. rung-fail overturning a
  pilot GO and INSUFFICIENT-DATA carry-through, policy
  predicate boundaries, confirm driver/analyzer wiring
  vs the pilot files). Pilot proof re-run green:
  `scripts/test-tendbelow-20261104.js` 67/67 PASS
  (pilot files unedited, smoke seed 91501 in-memory
  only, no files written).
- Arm commits on branch sim-tendbelow-confirm-b
  (coordinator merges via --ff-only; committed on
  branch, pending coordinator merge — no push, no bump,
  no live verification by this worker):
  - f9a778bc sim-tendbelow-confirm-b prereg (before any
    judged sim)
  - ebb46120 sim-tendbelow-confirm-b instruments + proof
    26/26 (zero src/js)
  - (this landing) sim-tendbelow-confirm-b evidence +
    corpus (zero src/js)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-tendbelow-confirm-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-tendbelow-confirm-b/`
  (32 files); scripts
  `test-tendbelow-confirm-driver-20261104.js`,
  `test-tendbelow-confirm-analyze-20261104.js`,
  `test-tendbelow-confirm-20261104.js`, reusing
  `diplo-instrument-20261104.js`,
  `test-polityfrag-analyze-20261104.js`, and the pilot
  driver/analyzer verbatim — not modified, not claimed
  as this arm's files. Policy
  `scripts/policies/leadcourt-tendbelow-b.js` on master,
  unmodified by this arm.
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after both commits
  (prereg + instruments); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status`
  empty + `git diff HEAD` empty. The commits themselves
  were always correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers (verified before reporting).
- Telemetry deviation check: ATTEMPTED and REFUSED by
  the tool (recorder-corpus input; see BALANCED PANEL
  above). No compare fabricated, no --allow-recorder-
  corpus workaround used.
- Balance-panel compare: ATTEMPTED on the recorder
  corpus; returned 0 paired cases / not_observed with
  its own "not a balanced-panel verdict" footer (see
  BALANCED PANEL above). The per-seed before/after
  table IS the panel output for this trajectory metric.
- Heartbeats: worktree heartbeated during the run
  (registry `sim-tendbelow-confirm-b`).
- Convergence: scale-onramp stays converging (NOT
  converged): the full seat is still unwon, wave-5 kills
  still 0 in normal play (not instrumented by this arm,
  stated not faked), and this arm's CONFIRM NO-GO means
  the pilot GO does not stand as a confirmed lever —
  the winnability chain's binding failure (wave-4 kills
  in the wild) is untouched by this arm.

## Verdict — CONFIRM NO-GO (judged exactly as pre-registered)

NO-GO on leg (a) only: two survival-band regressions
(91301 C→D, 91310 C→D with a global→regional rung
downgrade) fail the pre-registered bar that allows
none, even though median delta is 0, hold is preserved
(0.997 vs 0.993), the wave guard is intact (13 vs 13 /
2 vs 1), the drop guard passes (1 vs 1), the rung guard
passes on net (1 downgrade vs 5 upgrades), and the
decision-time premise holds perfectly (armed seasoned
tends 0, below-bar 252, unknown 0, decision records
matched 32/32). The pilot GO does not confirm on this
band. No gate/price/deed arm follows from this evidence.
