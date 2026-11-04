# Floored tend-through — Loop B, arm sim-tendfloor-b

Axis: scale-onramp / winnability chain. POLICY-ONLY arm: one new
policy file, ZERO src/js changes, ZERO edits to leadcourt.js or
leadcourt-tendthrough.js, ZERO gate/price/deed changes. This arm
tests ONLY the floored tend-through variant; it never tests
zombie-clearing, never bundles legs, and never touches the
sibling recovery-zombie work, any Loop A tree/claim/branch, or
the HELD branch sim-recovery-zombie-b.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-tendfloor-b-prereg.md`
(commit 51f73cb78). In short:

- Question: tend-through (0930Z) held every polity (hold-share
  1.000, 0 drops, 3/3 collapsed seeds hold) but cost two villages
  their lives (99409 C→D 111→82d, 99410 C→D 107→95d),
  hypothesized as grain spent on villages that needed it least.
  Does flooring the tend-through keep the polity gain while
  removing the survival cost?
- Primary variant (EXACTLY ONE): NEW
  `scripts/policies/leadcourt-tendfloor-b.js` =
  leadcourt-tendthrough with EXACTLY ONE change: the tend
  condition becomes pantry > 13,500 kcal. Floor justification,
  fixed before any sim: 13,500 = the 12,000-kcal proposal gate
  + one 1,500-kcal tend, so a policy-authorized tend can never
  by itself push the pantry below the proposal gate; because
  the check runs per link inside the weekly loop, a week whose
  pantry starts just above the floor buys at most one tend.
  Everything else is tend-through verbatim (weekly cadence,
  Haven-primary only, 1,500 kcal engine cost, proposal gate
  unchanged, answer/counter logic unchanged). The other queued
  shape (tend-through only for links below the seasoned bar)
  was NOT run here; it is the pre-registered sensitivity for a
  NEXT run only, never a post-hoc rescue.
- Seeds: FRESH pilot band 99001–99008, identical on both legs
  (16 runs). Freshness verified before the prereg: no dated
  evidence .md in evidence/2026-11-04/ names 99001–99008, no
  per-seed corpus filename carries them, and the band is absent
  from the forbidden list and from today's other bands. Baseline
  is THIS leg's own tend-through run on 99001–99008 — NOT the
  cited 994xx numbers (different seeds, different timelines;
  994xx is background only, never pooled).
- Confirm band (pre-stated in the prereg, so a confirm is
  legitimate without a later addendum): 99009–99024 (16 seeds),
  verified fresh the same way. Confirm runs ONLY on a pilot
  GO, and only on this band.
- Horizon: 300 days, death-aware (dead villages stop; +10d
  tail max). WHY 300: identical window to 0930Z, so per-seed
  death-day deltas are like-for-like; never binding here (max
  survival 195d).
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim via a
  new parameterized driver
  (scripts/test-tendfloor-driver-20261104.js, output
  evidence/2026-11-04/perseed-tendfloor-b/, RUN=tendfloor-base
  for tend-through and RUN=tendfloor-armed for floored) and the
  polityfrag analyzer REUSED verbatim through a new wrapper
  (scripts/test-tendfloor-analyze-20261104.js). The snapshot
  NEVER calls villageStandingTotal() or unlockedWave(); ONE
  end-of-run unlockedWave() call is reported separately and
  never counted as a natural door-open. The driver refuses to
  overwrite an existing per-seed file.
- Wave facing (ever-faced, defined in the prereg because the
  reused analyzer's w4faced/w5faced fields read only the LAST
  snapshot): a seed has faced wave 4 (resp. 5) iff ANY daily
  snapshot carries w4faced (resp. w5faced) true.
- Hold-share (pooled, per leg): over diplomacy seeds only,
  sum of post-first-diplo snapshots divided by sum of
  post-first snapshots, from the reused analyzer's fields.
- PRIMARY METRIC + GO BAR (binding): GO iff ALL hold:
  (a) NO survival-band regression on ANY seed; (b) median
  death-day delta (armed minus tend-through baseline, over
  all 8 seeds) >= -5 days; (c) armed pooled hold-share >=
  baseline pooled hold-share - 0.05; (d) WAVE-FACING GUARD:
  armed ever-faced wave-4 count >= baseline - 1, AND armed
  ever-faced wave-5 count >= baseline - 1. Otherwise NO-GO.
  INSUFFICIENT-DATA only if > 2 seeds in either leg carry
  instrument errors, or the baseline leg has zero diplomacy
  seeds. A miss is NO-GO, never re-scored (§14).
- Bands: A = survived to 300d, B = died 150–299d, C = died
  100–149d, D = died < 100d (same as 0930Z).

## Pilot leg — per-seed before/after table

Proof `scripts/test-tendfloor-20261104.js` 41/41 before the leg
(floored-policy construction, bands, median, tend-band counting,
ever-faced detection, pooled hold-share, GO-judge fixtures for
all four legs + insufficient-data, live harness smoke: 2-day
floored run, 0 instrument errors). 0 instrument errors on all
16 runs; analyzer classified 8/8 pairs. Columns: days,
delta, band, scale, maxW, everW4/W5, trajectory, hold-share,
drops/recov, tends (armed: blocked/floored/high snapshot
bands — see the band-count note below), ready days. Baseline
values are this leg's tend-through run on the same seed.

| seed | days base → armed (delta) | band base → armed | scale base → armed | maxW base → armed | everW4 base → armed | everW5 | trajectory base → armed | hold base → armed | drops/recov base → armed | tends base → armed (armed blocked/floored/high) | ready |
|------|---------------------------|-------------------|--------------------|-------------------|---------------------|--------|--------------------------|--------------------|---------------------------|--------------------------------------------------|-------|
| 99001 | 135 → 136 (+1) | C → C | global → global | 4 → 4 | yes → yes | no | holds-to-death → flickers | 1.000 → 0.829 | 0/0 → 1/1 | 110 → 82 (15/43/24) | 0 → 0 |
| 99002 | 102 → 102 (0) | C → C | global → global | 4 → 4 | yes → yes | no | holds-to-death → collapses | 1.000 → 0.979 | 0/0 → 1/0 | 65 → 18 (3/14/1) | 0 → 0 |
| 99003 | 122 → 115 (-7) | C → C | global → global | 4 → 4 | yes → yes | no | holds-to-death → holds-to-death | 1.000 → 1.000 | 0/0 → 0/0 | 108 → 30 (10/17/3) | 0 → 0 |
| 99004 | 54 → 132 (+78) | D → C | regional → regional | 4 → 4 | no → yes | no | never → never | — → — | 0/0 → 0/0 | 11 → 10 (10/0/0) | 0 → 0 |
| 99005 | 18 → 18 (0) | D → D | village → village | 2 → 2 | no → no | no | never → never | — → — | 0/0 → 0/0 | 0 → 0 (0/0/0) | 0 → 0 |
| 99006 | 72 → 122 (+50) | D → C | regional → global | 4 → 4 | yes → yes | no | never → holds-to-death | — → 1.000 | 0/0 → 0/0 | 25 → 38 (9/7/22) | 0 → 0 |
| 99007 | 24 → 24 (0) | D → D | village → village | 2 → 2 | no → no | no | never → never | — → — | 0/0 → 0/0 | 0 → 0 (0/0/0) | 0 → 0 |
| 99008 | 80 → 195 (+115) | D → B | regional → regional | 3 → 4 | no → yes | no | holds-to-death → collapses | 1.000 → 0.985 | 0/0 → 1/0 | 59 → 21 (6/5/10) | 0 → 0 |

Pooled: tend totals 378 (baseline) → 199 (armed), a 47% cut —
the floor bit hard. Armed floored-band tends total 86
(43+14+17+7+5 across the five diplomacy/armed seeds), so the
lever fired inside the 13,501–20,000 band it was designed to
open; it was not a dead gate. Baseline pooled hold-share
1.000 (4 diplomacy seeds, 186/186 post-first snapshots);
armed pooled hold-share 0.957 (5 diplomacy seeds — 99006 is
new — 335/350 post-first snapshots). Ever-faced wave 4: 4/8
→ 6/8. Ever-faced wave 5: 0/8 → 0/8. Ready days: 0 both legs.

BAND-COUNT NOTE (read before citing the blocked column): the
tend-band split uses the latest daily snapshot at or before
the tend day, and the driver snapshots AFTER that day's policy
run — so a tend authorized at pantry 14,200 that pays 1,500
shows up in a 12,700 snapshot and counts as "blocked." The
armed leg's blocked-band counts (53 total) are therefore a
snapshot-timing artifact, NOT 53 floor violations: the policy
checks pantry before each tend, and the snapshot is taken
after the tend's own cost. The robust floor-bite signals are
the tend-total cut (378 → 199) and the nonzero floored-band
activity (86), not the blocked column. A future instrument
should record pantry at tend-event time to make the band
split exact (see metric review).

## Judged verdict — GO (thin, and the thinness is the finding)

GO judge output: verdict GO — leg (a) no regressions: TRUE
(0 regressions); leg (b) median death-day delta +0.5 days
(deltas sorted: -7, 0, 0, 0, +1, +50, +78, +115; bar >= -5):
TRUE; leg (c) pooled hold-share 0.957 vs baseline 1.000
(bar >= 0.950): TRUE by 0.007 — seven thousandths of margin;
leg (d) wave guard: wave-4 6 vs baseline 4 (bar >= 3): TRUE,
wave-5 0 vs 0 (bar >= -1): TRUE. Bad seeds 0. Verdict: GO,
judged exactly as pre-registered.

GO-THIN, stated plainly and NOT re-scored: the pooled
hold-share passes while the drop count goes the wrong way —
0 drops on the baseline leg, 3 on the armed leg (99001
flickers, 99002 collapses, 99008 collapses). The pooled
number passes only because the armed leg lives longer and
adds diplomacy snapshots (99006's new polity at hold 1.000,
99008's 131 diplo days before a final-day drop). A reader who
stops at "GO" and misses "3 drops vs 0" has misread this run.
Per §14 the verdict stands as pre-registered — the drop
count was not a prereg guard, so it cannot retroactively
flip GO to NO-GO — but the next run MUST carry a drop-count
guard (see metric review), and no confirm should be run on
this metric as written (see confirm note below).

## Finding 1 — the floor buys survival, and the price is late polity drops

The survival half of the 0930Z asymmetry reverses on this
band: no seed regresses a band, and three seeds gain a band
or more (99004 D → C, 99006 D → C, 99008 D → B). Median
survival 76 → 118.5 days, max 135 → 195. The mechanism is
visible in the tend totals: holder seeds that tended
constantly under tend-through barely tend under the floor
(99002: 65 → 18 tends; 99003: 108 → 30; 99008: 59 → 21) and
still live as long or far longer. Grain not sent outward is
grain the village lives on — the 0930Z cost hypothesis now
has a same-seed control in its favor: flooring the spend
removes the survival cost on every seed in this band.

But the polity half moves the other way. Under tend-through
all four baseline diplomacy seeds held to death; under the
floor, three armed seeds drop:

- 99001: drop d103, trust-unseason 47 → 39, pantry 14,522 at
  the drop snapshot, last tend the SAME day (d103) — a tend
  fired and the link still unseasoned (39, one point below
  the 40 bar). Recovery d115, same link re-seasoned, final
  standing diplomacy 102. A flicker, not a loss: when the
  pantry sits above the floor, tending resumes and the realm
  comes back. This is the floor working as designed — a
  brief gap, then recovery.
- 99002: drop d103 (one day past the reported 102-day run;
  the analyzer's final snapshot lands a day after runDays'
  count — a one-day instrument offset, noted not hidden),
  trust-unseason 45 → 37, pantry 0 at the drop, last tend
  d56 — a 47-day tending gap while the pantry sat below the
  floor. No recovery; the village dies with diplomacy 0
  (baseline: diplomacy 102 to death). The floor's protection
  became the polity's starvation: trust decays slowly
  (~1/week at this range), so a month-plus below-floor
  stretch is exactly long enough to unseason a link.
- 99008: drop at death (d195), trust-unseason 41 → 36,
  pantry 867 at the drop, last tend d63 — a 132-day gap. The
  village lived 115 days longer than baseline (80 → 195)
  and paid diplomacy for 131 of them (hold 0.985), but its
  realm still came apart on its last day because tending
  had stopped five months earlier. Long life with a dead
  realm at the end is not the same as a held realm — the
  pooled hold-share (0.985 on this seed) flatters a polity
  that ended collapsed.

The pattern: the floor converts tend-through's "hold
everything, pay with your life" into "live longer, drop
late." Trust decays slowly enough that below-floor stretches
of weeks cost nothing visible, then unseason all at once.
That is why the pooled hold-share stays high while drops
triple: drops happen late, after long held stretches.

## Finding 2 — the floor creates a polity where baseline had none

99006 flips from never (baseline: max 2 seasoned at once,
died d72, diplomacy 0) to holds-to-death: diplomacy 102 from
d76 to death d122, end-state global (baseline: regional),
final standing 262 (war 100, diplomacy 102, plenty 60).
Its armed tend total is HIGHER than baseline (38 vs 25) —
the floor did not starve this seed; it lived long enough
for three links to season, and the floored-band tends (7)
plus high-band tends (22) kept them fed. Same shape as
0930Z's 99404 flip, on a new band: when a village's binding
constraint is survival time, not grain, the floor's saved
grain becomes seasoning time. 99004 also lives far longer
(54 → 132) but still never reaches diplomacy
(never-3-seasoned, max 1 seasoned at once on the armed leg)
— longer life alone does not build a polity without three
links ripening together. 99005 and 99007 are unchanged in
kind (died d18/d24 before any link seasoned, identical death
days on both legs, 0 tends): when a village dies before
seasoning, the tend gate is irrelevant — there is no polity
for either lever to save or lose.

## Finding 3 — this band cannot answer the 0930Z collapsing-seed question

Scope limit, stated not buried: the baseline leg on THIS
band has zero collapsing seeds (all four diplomacy seeds
hold at 1.000 under tend-through), so this pilot tests the
floor's effect on holders and never-seeds, NOT its effect on
a village actively collapsing. The 0930Z question — does the
floor save the villages that tend-through saved (99402,
99403, 99411) without taxing the holders (99409, 99410)? —
is still untested on any seed, because no fresh band can be
known to collapse before it is run. What IS established
here: on a holding band, the floor removes the survival
cost (0 regressions, median +0.5) at the price of late
drops (3 vs 0). Whether that trade also holds on a
collapsing band is the next run's question, not this run's
claim. Any report citing this GO as "floor fixes the 0930Z
cost" is wrong: the 0930Z seeds were never run here, by
design (fresh-band rule).

## Wall numbers (pilot legs, not wall movement)

Wins 0/8 on both legs. Villages lost 8/8, survived to
horizon 0/8, on both legs. End-state scaleRank — baseline:
global 3/8, regional 3/8, village 2/8, national 0/8 at end;
armed: global 4/8, regional 2/8, village 2/8, national 0/8
at end (global is the scaleRank read when the globalLive
flag is set — same qualifier as 0930Z; a global end-state
has passed through national, it is not a completed global
campaign). Table: not instrumented by this arm (stated, not
faked); no win flag observed on any seed. Wave-5 unlocks
0/8 both legs (maxWave 5 on no seed), wave-5 faced 0/8 both
legs, wave-4 ever-faced 4/8 → 6/8, wave-4 unlocks (maxWave
>= 4) 5/8 → 6/8. Readiness-5-ready days: 0 both legs.
Median survival 76 → 118.5 days, max 135 → 195 days.
Deaths 363 → 454 (longer lives count more deaths; the shape
is unchanged): combat share 60% both legs (baseline:
villager combat 162 + combat 57 = 219/363; armed: 173 + 98
= 271/454) — villages die fighting, not starving, on this
band too. Starvation deaths 6 → 7 despite the grain saved:
the floor does not convert to fewer starvation deaths on
this band, because the binding deaths are combat deaths in
longer lives. Arc II/III/IV reach: not instrumented (stated,
not faked). Four-realm formation: not instrumented (stated,
not faked).

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

Baseline leg (tending present, nothing collapses — the
absence is the finding, as in 0930Z):

- 99001 d45 (formation): "Three fires bow to Haven. But a
  realm isn't leverage — it's seasons. These bonds are
  young; tend them, keep the trust, and the court will
  come." d81: "Four fires. One head. GOVERNANCE LAYER:
  online — polity tribute routing, the court calendar,
  famine reserves. You built a realm. Try not to lose it
  the way you found it." The baseline polity reads as a
  consequence of tending because the trust numbers say so:
  every baseline diplomacy link ends tended and held, with
  zero drops to narrate.

Armed leg (tending absent for months, then the realm comes
apart — and, once, comes back):

- 99001 d103 (drop): "Thornfield's fire is drifting from
  ours — their speaker doesn't linger at the gate the way
  they used to, and nobody over there says why. Bonds
  don't mend themselves; a tended fire remembers who fed
  it." Same day: "The realm came apart — no polity answers
  to Haven now, and Haven is a free fire again. National
  and global no longer describe this village. The climb
  starts over." d115 (recovery): "Four fires. One head.
  GOVERNANCE LAYER: online — ... You built a realm. Try
  not to lose it the way you found it." The drop and the
  recovery are both narrated as realm events, but neither
  line names tending as the cause — the causal link is
  carried by the trust/tend numbers (last tend d103 on the
  drop day, re-seasoning d115), not by the narration. A
  player reading only the transcript would know the realm
  fell and returned, not why.
- 99006 d76 (new polity): "Four fires. One head.
  GOVERNANCE LAYER: online — ... You built a realm. Try
  not to lose it the way you found it." A village that
  never had a polity under tend-through builds one under
  the floor, and the game says so in its own voice.
- 99008 d195 (drop at death): "The Hungry Road's fire is
  drifting from ours — ... Bonds don't mend themselves; a
  tended fire remembers who fed it." + "The realm came
  apart — ... National no longer describes this village.
  The climb starts over." The drifting-fire warning is the
  most honest line in the corpus: it names exactly what
  the floor did — stopped feeding the fire.

Flagged, minor, not verdict-driving: (1) on armed 99001
d103 the generic line "The village feels it — the bond
dips, but holds. They endure together." appears the SAME
day as "The realm came apart" — a dip-that-holds line
paired with a collapse line reads incoherent in sequence.
(2) The usual repeated templates recur across seeds
("Three retellings in, nobody remembers what actually
happened", "We're feeding the shelves more than
ourselves") — ordinary village talk, not diplomacy-specific
robotics. (3) Carried capture limit from 0930Z: the
instrument's SAY_RE still does not match tendLink's own
say-lines ("Haven sends … kcal of grain …"), so tend
events are proven by counts (378 → 199), not quoted lines.

## Village assessment (plain words)

Picture the same eight villages, but with a floor under the
grain: below 13,500 kcal in the pantry, no grain leaves.
Where before the grain never stopped and every realm held
to the grave, now three villages live much longer — one
more than twice as long — because the grain stays home.
One village that died before its bonds ever ripened last
time now lives long enough to build a realm of its own and
die as its head. But the grain that stays home is grain
the bonds never taste: on two villages the realm comes
apart late, after a month or five months of silence, and
on a third it flickers out and comes back when the pantry
recovers. The villages that needed the grain least are
saved from the tax; the villages whose pantry crashed are
still, in the end, left holding a realm that dissolved
because nobody fed it for months. The floor does not solve
the trade — it moves it: shorter held realms, longer
lives, and the collapse, when it comes, comes late and
quiet, at the end of a long life rather than in the middle
of a short one. Whether that trade is worth it is a design
call, not a measurement — and on this band, the
pre-registered numbers say the trade passes, by seven
thousandths on the hold-share leg.

## Metric review (§14 — no in-run re-scoring)

- The prereg's GO legs were judged exactly as written; no
  metric moved. Leg (a): 0 regressions (bar: none) — PASS.
  Leg (b): median delta +0.5 (bar >= -5) — PASS. Leg (c):
  pooled hold 0.957 vs 1.000 (bar >= 0.950) — PASS by 0.007.
  Leg (d): wave-4 6 vs 4, wave-5 0 vs 0 (bar: within 1 each)
  — PASS. Verdict: GO. The split character of the result
  (survival up, drops up) is reported alongside the verdict,
  not used to re-score it.
- What the metric proved: the survival-band + median-delta
  pair did its job as a cost guard in reverse — it caught
  that the floor removes the 0930Z survival cost on this
  band (0 regressions where tend-through cost 2 bands on
  994xx). The wave guard did its job too (wave-4 facing
  rose, not fell).
- What the metric missed, proposed for the NEXT run (not
  applied here): (1) POOLED HOLD-SHARE MASKS DROP COUNT.
  Three drops vs zero still pass because longer lives add
  held snapshots. Next run MUST pre-register a drop-count
  guard alongside hold-share (e.g. armed drops <= baseline
  drops + 1, or armed collapsing seeds <= baseline + 1);
  a GO met with a drop-count breach should be NO-GO. (2)
  SNAPSHOT PANTRY BANDS ARE APPROXIMATE. The blocked-band
  column counts end-of-day snapshots, not authorization-time
  pantry; a future instrument should log pantry inside the
  tend event (or the policy should log its own gate
  decision) so "floor fired / floor blocked" is exact. (3)
  BANDS ARE COARSE but the delta distribution was reported
  alongside, so no seed hid inside a band here (the -7 day
  loss on 99003 and the +115 on 99008 are both visible).
  (4) SCOPE: this band had no baseline-collapsing seeds, so
  the floor-on-a-collapsing-seed question is untested; a
  next run should screen a fresh band under tend-through
  first and judge the floor on the collapsing subset, with
  that screening step pre-registered (it is a new run
  design, not a re-score of this one).
- Instrument limitations recorded for the next run, not
  fixed here: (1) tendLink say-lines not in the SAY_RE
  sample (see sense-testing). (2) Per-link trust is sampled
  from daily snapshots, so intra-week moves are netted, not
  itemized. (3) scaleRank 'global' is the globalLive flag
  read, not a completed global campaign. (4) The analyzer's
  last-snapshot w4/w5 fields were NOT used for the wave
  guard; ever-faced (any snapshot) was, per the prereg.
  (5) One-day offset: 99002's armed drop snapshot (d103)
  lands a day past the reported 102-day run (final snapshot
  after run end); drop days at end of life carry ±1 day.

## Confirm note (coordinator decision)

Pilot GO, so a confirm is legitimate — but NOT run by this
worker on this metric as written. Reason, stated plainly:
the metric review above shows the pooled hold-share leg
masks drop count; spending 32 more runs (16 seeds × 2 legs)
to confirm a GO that a drop-count guard might overturn
would be confirming the wrong bar. The confirm band is
already pre-stated in the prereg (99009–99024, fresh), so
the coordinator can run it — ideally with a drop-count
guard added by prereg addendum BEFORE the confirm sims
(a between-run metric change, allowed by §14; it must not
be applied retroactively to this pilot). If the coordinator
runs the confirm on this pilot's metric unchanged, the
band to use is 99009–99024 and no other.

## Verdict — GO (thin: pooled hold passes by 0.007; drops 3 vs 0)

GO judged exactly as pre-registered: 0 survival-band
regressions, median death-day delta +0.5d, pooled
hold-share 0.957 vs 1.000 baseline (bar 0.950), wave guard
passed (wave-4 6 vs 4, wave-5 0 vs 0). The floor removes the
survival cost on this band and buys large survival gains on
three seeds, creates one new polity, and costs three late
polity drops where the baseline had none. The verdict is
GO; the finding is GO-THIN — the next run's drop-count
guard, not this run's numbers, decides whether the floor
is a keeper.

## Next blank, precisely (no fix in this run)

1. A floor run WITH a drop-count guard pre-registered
   (metric-review item 1), ideally screened on a fresh band
   that contains baseline-collapsing seeds, so the floor is
   judged where tend-through actually saves polities — the
   question this band could not test.
2. The pre-registered sensitivity from this prereg:
   tend-through only for links below the seasoned bar
   (grain targeted at links at risk of unseasoning, not at
   safe links) — the shape that might keep holds without
   either the survival tax or the late drops.
3. The BELONG-tending gap (still open): tend-through and
   the floor both tend Haven-primary links only, so a
   BELONG link is still never tended on any seed here.
NO gate/price/deed arm follows from this evidence.

## Findings for backlog (coordinator appends; not chased here)

- [open] 2026-11-04 — diplomacy — floored tend-through
  (tend below 20,000 only while pantry > 13,500) on fresh
  band 99001–99008: GO as pre-registered (0 band
  regressions, median death-day delta +0.5d, pooled hold
  0.957 vs 1.000, wave guard passed) but GO-THIN — drops
  0 → 3 (99001 flickers then recovers d115, 99002
  collapses after a 47-day below-floor gap, 99008 collapses
  at death after a 132-day gap), tend totals 378 → 199,
  median survival 76 → 118.5d, one new polity (99006).
  Next run needs a drop-count guard; the floor-on-a-
  collapsing-seed question is still untested (this band
  had zero baseline-collapsing seeds) (this run's evidence).
- [open] 2026-11-04 — instruments — tend-band pantry split
  from daily snapshots is approximate (snapshot taken after
  the day's policy run, so a tend's own 1,500-kcal cost can
  push its snapshot into the blocked band); future
  instruments should log pantry at tend-event time (this
  run's capture note).
- [open] 2026-11-04 — narration — armed 99001 d103 pairs
  "the bond dips, but holds" with "the realm came apart"
  the same day; a dip-that-holds line alongside a collapse
  line reads incoherent in sequence (this run's
  sense-test).

## Proof and landing

- Proof: `scripts/test-tendfloor-20261104.js` — 41/41 PASS
  (policy construction, bands, median, tend-band counting,
  ever-faced detection, pooled hold-share, GO-judge fixtures
  for all four legs + insufficient-data, live harness smoke:
  2-day floored run, 0 instrument errors).
- Arm commits on branch sim-tendfloor-b (coordinator merges
  via --ff-only; committed on branch, pending coordinator
  merge — no push, no bump, no live verification by this
  worker):
  - 51f73cb78 sim-tendfloor-b prereg (before any judged sim)
  - 674667d78 sim-tendfloor-b instruments + proof 41/41
    (zero src/js)
  - (this landing) sim-tendfloor-b pilot + evidence
    (zero src/js)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-tendfloor-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-tendfloor-b/` (16 files);
  scripts `test-tendfloor-driver-20261104.js`,
  `test-tendfloor-analyze-20261104.js`,
  `test-tendfloor-20261104.js`, policy
  `scripts/policies/leadcourt-tendfloor-b.js` (reusing
  `diplo-instrument-20261104.js` and
  `test-polityfrag-analyze-20261104.js` verbatim — not
  modified, not claimed as this arm's files).
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after both commits
  (prereg + instruments); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status`
  empty + `git diff HEAD` empty. The commits themselves
  were always correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers (verified before reporting).
- Telemetry deviation check: ATTEMPTED and REFUSED by the
  tool — `node scripts/telemetry-check.js --baseline
  …/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-04/perseed-tendfloor-b/
  *.json' --metrics national,table,wins,exiled` refused with
  "recorder-corpus input: all 16 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows,
  not runs." Recorded honestly; no compare fabricated and
  no --allow-recorder-corpus workaround used to force one.
- Heartbeats: worktree heartbeated during the run
  (registry `sim-tendfloor-b`).
- Convergence: scale-onramp stays converging (NOT
  converged): the full seat is still unwon, wave-5 kills
  still 0 in normal play, and the floor's verdict is
  GO-THIN with a drop-count guard still owed.
