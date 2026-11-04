# Tend-through ONLY below the seasoned bar, decision-time classifier — Loop B, arm sim-tendbelow-b

Axis: scale-onramp / winnability chain. POLICY-ONLY arm: one new
policy file, ZERO src/js changes, ZERO edits to leadcourt.js,
leadcourt-tendthrough.js, or leadcourt-tendseason-b.js, ZERO
gate/price/deed changes. This arm tests ONLY the
tend-below-seasoned-bar variant, on a FRESH band, with the tend
classifier FIXED to decision time. It never tests
zombie-clearing, never bundles legs, and never touches the
sibling arm sim-tendfloor-guard-adopt-b, the old
sim-tendfloor-guard-b tree, any Loop A tree/claim/branch, the
HELD branch sim-recovery-zombie-b, or the orphaned
sim-fracchoice-b tree.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-tendbelow-b-prereg.md`
(commit 53303dda9). In short:

- Question: tendseason-b ran this exact variant on 99209–99216
  and judged INSUFFICIENT-DATA as pre-registered (substance
  NO-GO-shaped on the corrected reading: 2 survival-band
  regressions), because its previous-day-snapshot classifier
  mislabeled one refused, below-bar tend as seasoned (99209
  day 97: snapshot trust 46, decision trust ≤ 38, tend ret 0).
  This pilot re-judges the variant on a fresh band with a
  decision-time classifier. It does NOT re-score the
  tendseason verdict, which stands.
- Predicate (from src/js/hierarchy.js before any sim): a link
  IS seasoned iff (scholar day - link.day) >= 30 AND
  (link.trust || 0) >= 40 (link.day = formation day,
  link.trust starts at 30 in _formLink). This policy tends
  iff NOT that: age < 30 days OR trust < 40. Mercy/succ-polity
  graces are polity-membership-only and never change
  link.trust, so they do not move the predicate.
- Decision-time rule (the instrument fix, fixed in the
  prereg): the driver wraps Game.tendLink a second time
  (outer, call-through). The wrapper reads the live link
  from hierarchyState() in the same synchronous call stack
  as the policy's own predicate check, copies trust/day/age,
  computes seasoned, then captures the call's return (paid
  kcal: > 0 = grain sent, 0 = refused) and records one
  tendDecisionEvent. No intra-day trust move can intervene
  between the policy's decision and the record. Snapshot-
  based tend classification is NOT used anywhere in this
  arm — no fallback. A missing decision record or any
  'unknown' decision event forces INSUFFICIENT-DATA.
- Primary variant (EXACTLY ONE): NEW
  `scripts/policies/leadcourt-tendbelow-b.js` =
  leadcourt-tendthrough with EXACTLY ONE functional change:
  the tend condition gains the below-seasoned-bar predicate.
  Everything else is tend-through verbatim (weekly cadence,
  Haven-primary only, 1,500 kcal engine request, NO pantry
  tend gate of any kind, proposal gate pantry > 12,000
  unchanged, answer/counter logic unchanged). Diff against
  leadcourt-tendthrough.js verified: only the helper, the
  tend condition, and header/id renames differ.
- Seeds: FRESH pilot band 91501–91508, identical on both
  legs (16 runs). Freshness verified before the prereg: 0
  bare-word hits in any dated evidence .md (all dates, this
  worktree's evidence/), 0 per-seed corpus filename hits,
  absent from the task's forbidden list (99001–99008,
  99009–99024, 99041–99052, 99101, 99201–99216, 99217–99232,
  99401–99412, 99601–99612, 99701–99708, 99801–99808,
  98701–98716, 89701–89707, 83601–83800, 16101–16116,
  99901–99912) and from today's other bands. Baseline is
  THIS leg's own tend-through run on 91501–91508 — NOT the
  cited 994xx, 99001–99008, or 99209–99216 numbers
  (different seeds, different timelines; background only,
  never pooled).
- Horizon: 300 days, death-aware (dead villages stop; +10d
  tail max). WHY 300: identical window to tendfloor, 0930Z,
  and tendseason, so per-seed death-day deltas are
  like-for-like; never binding here (max survival 125d).
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim via
  a new parameterized driver
  (scripts/test-tendbelow-driver-20261104.js, output
  evidence/2026-11-04/perseed-tendbelow-b/, RUN=tendbelow-base
  for tend-through and RUN=tendbelow-armed for below-bar)
  plus the decision-time wrapper, and the polityfrag analyzer
  (scripts/test-polityfrag-analyze-20261104.js) REUSED
  verbatim through a new wrapper
  (scripts/test-tendbelow-analyze-20261104.js). The snapshot
  NEVER calls villageStandingTotal() or unlockedWave(); ONE
  end-of-run unlockedWave() call is reported separately and
  never counted as a natural door-open. The driver refuses
  to overwrite an existing per-seed file.
- Wave facing (ever-faced, defined in the prereg because
  the reused analyzer's w4faced/w5faced fields read only the
  LAST snapshot): a seed has faced wave 4 (resp. 5) iff ANY
  daily snapshot carries w4faced (resp. w5faced) true.
- Hold-share (pooled, per leg): over diplomacy seeds only,
  sum of post-first-diplo snapshots divided by sum of
  post-first snapshots, from the reused analyzer's fields.
- PRIMARY METRIC + GO BAR (binding): GO iff ALL hold:
  (a) NO survival-band regression on ANY seed; (b) median
  death-day delta (armed minus tend-through baseline, over
  all 8 seeds) >= -5 days; (c) armed pooled hold-share >=
  baseline pooled hold-share - 0.05; (d) WAVE-FACING GUARD:
  armed ever-faced wave-4 count >= baseline - 1, AND armed
  ever-faced wave-5 count >= baseline - 1; (e) DROP-COUNT
  GUARD: armed total drops <= baseline total drops + 1.
  Otherwise NO-GO. PILOT ONLY: on PILOT GO, report PILOT GO
  banked — no 16-seed confirm is run in this run.
  INSUFFICIENT-DATA only if > 2 seeds in either leg carry
  instrument errors, or the baseline leg has zero diplomacy
  seeds, or the armed leg records zero decision-time
  below-bar tends, or any decision-time seasoned tend, or
  any missing/unknown decision record.
- Bands: A = survived to 300d, B = died 150–299d, C = died
  100–149d, D = died < 100d (same as tendfloor/0930Z/
  tendseason).
- Paid vs call counts: tend totals are reported BOTH as
  call counts and as paid tends (ret > 0, grain actually
  sent) with paid kcal summed from tendLink returns. The
  engine requests 1,500 kcal per tend but removes whole
  pantry units (hierarchy.js _removePantryKcal: "over-
  removal is honest, callers report actuals"), so observed
  paid returns run 1,500–1,696 and totals are sums of
  actuals, never 1,500 × calls.

## Pilot leg — per-seed before/after table

Proof `scripts/test-tendbelow-20261104.js` 67/67 before the leg
(policy construction + predicate boundaries, decision-wrapper
unit tests including the tendseason 99209 pattern,
decision-time-only summarize, bands, median, ever-faced,
pooled hold-share, GO-judge fixtures for all five legs +
insufficient-data, live harness smoke: 2-day below-bar run, 0
instrument errors, wrapper restore verified). 0 instrument
errors on all 16 runs; analyzer classified 8/8 pairs;
decision records matched tend calls on all 16 runs
(tendDecisionTotal == tendTotal everywhere). Columns: days,
delta, band, scale, maxW, everW4/W5, trajectory, hold-share,
drops/recov, tends (armed: below/seasoned/unknown DECISION-
TIME classes), paid tends + paid kcal (base → armed), ready
days. Baseline values are this leg's tend-through run on the
same seed.

| seed | days base → armed (delta) | band base → armed | scale base → armed | maxW base → armed | everW4 base → armed | everW5 | trajectory base → armed | hold base → armed | drops/recov base → armed | tends base → armed (armed below/seasoned/unknown) | paid base → armed (kcal base → armed) | ready |
|------|---------------------------|-------------------|--------------------|-------------------|---------------------|--------|--------------------------|--------------------|---------------------------|--------------------------------------------------|----------------------------------------|-------|
| 91501 | 57 → 57 (0) | D → D | village → village | 3 → 3 | no → no | no | never → never | — → — | 0/0 → 0/0 | 0 → 0 (0/0/0) | 0 → 0 (0 → 0) | 0 → 0 |
| 91502 | 98 → 90 (-8) | D → D | global → global | 4 → 4 | yes → yes | no | holds-to-death → holds-to-death | 1.000 → 1.000 | 0/0 → 0/0 | 96 → 15 (15/0/0) | 24 → 14 (34,257 → 21,418) | 0 → 0 |
| 91503 | 116 → 119 (+3) | C → C | global → regional | 4 → 4 | yes → yes | no | holds-to-death → collapses | 1.000 → 0.906 | 0/0 → 1/0 | 92 → 23 (23/0/0) | 35 → 15 (54,825 → 23,492) | 0 → 0 |
| 91504 | 91 → 112 (+21) | D → C | global → global | 4 → 4 | yes → yes | no | holds-to-death → holds-to-death | 1.000 → 1.000 | 0/0 → 0/0 | 57 → 16 (16/0/0) | 27 → 16 (46,838 → 29,511) | 0 → 0 |
| 91505 | 97 → 125 (+28) | D → C | global → global | 4 → 4 | yes → yes | no | holds-to-death → holds-to-death | 1.000 → 1.000 | 0/0 → 0/0 | 61 → 15 (15/0/0) | 31 → 15 (44,865 → 23,642) | 0 → 0 |
| 91506 | 86 → 65 (-21) | D → D | global → regional | 4 → 4 | yes → yes | no | holds-to-death → holds-to-death | 1.000 → 1.000 | 0/0 → 0/0 | 51 → 15 (15/0/0) | 27 → 15 (39,954 → 23,768) | 0 → 0 |
| 91507 | 61 → 61 (0) | D → D | village → village | 4 → 4 | yes → yes | no | never → never | — → — | 0/0 → 0/0 | 3 → 3 (3/0/0) | 3 → 3 (4,668 → 4,668) | 0 → 0 |
| 91508 | 40 → 40 (0) | D → D | village → village | 3 → 3 | no → no | no | never → never | — → — | 0/0 → 0/0 | 3 → 3 (3/0/0) | 3 → 3 (4,865 → 4,865) | 0 → 0 |

Pooled: tend CALLS 363 (baseline) → 90 (armed), a 75% cut —
the restriction bit hard. Paid tends 150 → 81 (-46%) and
paid kcal 230,272 → 131,364 (-43%): call counts overstate
the grain cut (baseline calls include bare-pantry refusals),
but the paid cut is still large. Armed decision-time
seasoned tends: ZERO on all 8 seeds; armed below-bar tends:
90; unknown: 0; decision-record match: 8/8 pairs. The
premise held exactly — this is the first below-bar pilot
whose classifier cannot be accused of mislabeling, because
it reads the same live values the policy decided on.

## Judged verdict — PILOT GO (banked; no confirm in this run)

Judge output: verdict GO, insufficientReason null.
Leg (a) no regressions: TRUE (regressions: none — the two
band gains, 91504 D → C and 91505 D → C, are improvements,
not regressions). Leg (b) median death-day delta 0 days
(deltas sorted: -21, -8, 0, 0, 0, +3, +21, +28; bar >= -5):
TRUE. Leg (c) pooled hold-share 0.974 vs baseline 1.000
(bar >= 0.950): TRUE. Leg (d) wave guard: wave-4 6 vs
baseline 6 (bar >= 5): TRUE, wave-5 0 vs 0 (bar >= -1):
TRUE. Leg (e) drop guard: armed drops 1 vs baseline 0
(bar <= 1): TRUE at the edge. Bad seeds 0. Verdict as
pre-registered: GO. Per the prereg, PILOT GO is banked and
NO 16-seed confirm is run in this run — the confirm
decision belongs to the coordinator.

## Finding 1 — the restriction bites, holds mostly, and costs one polity

The mechanism is visible in the tend totals and in 91503.
Under tend-through, a diplomacy seed tends constantly
(91502: 96 calls, 91503: 92) and holds to death at 1.000.
Under below-bar-only, tending stops the week a link
seasons — and a seasoned link still decays. Four of five
diplomacy seeds still hold to death, but:

- 91503: the pilot's only drop, and the honest version of
  the tendseason mechanism on a new band. Last PAID tend
  day 56 (link trust 62, age 29 — one day short of the
  season). Then nothing for 59 days while the links
  seasoned and decayed: the drop bracket is trust 41 →
  36 on link_mgpspi32150 at day 115, pantry 0 at the drop.
  The day-115 tend attempt IS recorded — decision-time
  preTrust 36 (below bar, age 88), paid 0, refused empty-
  handed — and days 116–119 attempts likewise paid 0.
  So the collapse is not "the policy refused to tend a
  seasoned link": by drop day the link had already
  unseasoned and the policy tried. The collapse is "the
  upkeep stopped for two months, trust bled 62 → 36, and
  the rescue arrived at an empty pantry." The village
  still lived longer than baseline (116 → 119) but lost
  the polity it had held to death under tend-through, and
  ends regional, not global. A drop with refused rescue
  attempts is not a flicker — there is no recovery, and
  the village dies at 119 with diplomacy 0.
- 91506: holds to death, but dies 21 days sooner
  (86 → 65) and ends regional, not global — same shape
  as tendseason's 99216, minus the band regression (both
  legs are band D here; the loss is real but band-
  invisible, which is why the delta distribution is
  reported alongside the bands).
- 91502: holds to death, dies 8 days sooner (98 → 90).
- 91504/91505: the other side of the split — both gain a
  band (D → C, +21 and +28 days) while holding to death.
  The distribution is bimodal, not centered: two seeds
  gain hard, two lose (-8, -21), four are unchanged.
  The median delta (0) passes, but it hides the split —
  which is exactly why leg (a) exists, and leg (a) is
  what this band passes where tendseason's band failed.

## Finding 2 — the never-seeds are untouched, as expected

91501, 91507, and 91508 are identical on both legs in
every column (days 57/57, 61/61, 40/40; same bands, same
tend counts 0/0, 3/3, 3/3; both died before seasoning or
never formed a polity). When a village dies before any
link seasons, every tend is a below-bar tend by
definition, so the restriction changes nothing — the armed
leg and the baseline leg are the same policy on those
seeds. This is a control in disguise: it proves the
restriction's effect is confined to diplomacy seeds, and
that the 91503 drop and the 91506/91502 shorter lives are
the restriction's doing, not harness noise.

## Finding 3 — this band cannot answer the collapsing-seed question either

Scope limit, stated not buried: the baseline leg on THIS
band has zero collapsing seeds (all five diplomacy seeds
hold at 1.000 under tend-through), so this pilot tests the
restriction's effect on holders and never-seeds, NOT its
effect on a village actively collapsing — the same scope
limit as tendseason. The question the queue actually cares
about — does targeted tending save a collapsing polity
without taxing holders? — is still untested on any seed,
because no fresh band can be known to collapse before it
is run. What IS established here, on a second band with a
fixed classifier: on a holding band, restricting tending to
below-bar links PASSES the pre-registered bar (no band
regressions, median delta 0, hold 0.974, wave guard intact,
one drop at the guard's edge) while still costing one
polity, two end-state rungs, and 21 days on one seed. Any
report citing this pilot as "targeted tending works,
period" is wrong — it works to the pre-registered bar on
a holding band, with named costs, and the collapsing-seed
question remains open.

## Wall numbers (pilot legs, not wall movement)

Wins 0/8 on both legs. Villages lost 8/8, survived to
horizon 0/8, on both legs. End-state scaleRank — baseline:
global 5/8, village 3/8 (national+ 5/8); armed: global 3/8,
regional 2/8, village 3/8 (national+ 3/8 — two seeds drop
a rung: 91503 and 91506 global → regional; end-state rung
is reported, not a judged leg). Table: not instrumented
by this arm (stated, not faked); no win flag observed on
any seed. Wave-5 unlocks 0/8 both legs (maxWave 5 on no
seed), wave-5 faced 0/8 both legs, wave-4 ever-faced 6/8
→ 6/8, wave-4 unlocks (maxWave >= 4) 6/8 → 6/8.
Readiness-5-ready days: 0 both legs. Median survival
88.5 → 77.5 days (median-of-days fell even though the
median-of-deltas, the judged leg, is 0 — the two
summaries answer different questions and both are
reported), max 116 → 125 days. Deaths 442 → 466 (the
shape is unchanged): combat share baseline villager
combat 192 + combat 80 = 272/442 (62%), armed 191 + 106
= 297/466 (64%) — villages die fighting, not starving,
on this band too. Starvation deaths 4 → 4 despite the
grain cut: the binding deaths are combat deaths in
slightly redistributed lives. Expedition 56 → 55, "the
wild" 48 → 48. Arc II/III/IV reach: not instrumented
(stated, not faked). Four-realm formation: not
instrumented (stated, not faked).

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

Baseline leg (tending present, nothing collapses):

- 91503 d27 (formation): "Three fires bow to Haven. But a
  realm isn't leverage — it's seasons. These bonds are
  young; tend them, keep the trust, and the court will
  come." d76: "Four fires. One head. GOVERNANCE LAYER:
  online — polity tribute routing, the court calendar,
  famine reserves. You built a realm. Try not to lose it
  the way you found it." The baseline polity reads as a
  consequence of tending because the trust numbers say so:
  every baseline diplomacy link ends tended and held, with
  zero drops to narrate.

Armed leg (tending stops at seasoning, then one realm comes
apart on an empty pantry, and two villages end a rung lower):

- 91503 d115 (drop, the pilot's only collapse): "Thornfield's
  fire is drifting from ours — their speaker doesn't linger
  at the gate the way they used to, and nobody over there
  says why. Bonds don't mend themselves; a tended fire
  remembers who fed it." Same day: "The realm came apart —
  no polity answers to Haven now, and Haven is a free fire
  again. National and global no longer describe this
  village. The climb starts over." The drifting-fire warning
  is the most honest line in the corpus: it names exactly
  what the restriction did — stopped feeding the fire once
  it counted as seasoned. But neither line names tending
  or the empty pantry as the cause — the causal link is
  carried by the trust/tend numbers (last paid tend day
  56, day-115 rescue attempt refused with an empty pantry),
  not by the narration. A player reading only the
  transcript would know the realm fell, not why. The same
  d27/d76 court lines appear on the armed leg too — building
  the realm is narrated; losing the rung is narrated only
  through the collapse line, and 91506's rung downgrade
  (global → regional, holds to death) has no line of its
  own.
- Flagged, minor, not verdict-driving: (1) the usual
  repeated templates recur across seeds ("1 unprocessed
  haul onto the counter — the clock is ticking" daily on
  91503) — ordinary village talk, not diplomacy-specific
  robotics. (2) Carried capture limit from
  tendfloor/0930Z/tendseason: the instrument's SAY_RE still
  does not match tendLink's own say-lines ("Haven sends …
  kcal of grain …"), so tend events are proven by decision
  events and return values (150 paid baseline, 81 paid
  armed), not quoted lines.

## Village assessment (plain words)

Picture the same eight villages, but with a new rule: once
a bond counts as seasoned — thirty days old, trust forty
or better — nobody sends it grain again. The grain goes
only to young bonds and struggling ones. Where before the
grain never stopped and every realm held to the grave, now
most realms still hold — four of five diplomacy villages
die holding theirs — but one realm comes apart after two
months without a paid tend, when the pantry is bare on the
day the bond finally qualifies for help again; two villages
end a rung lower than they used to; one village dies three
weeks sooner holding a realm that used to carry it to the
world's stage; and two villages live three to four weeks
longer and climb a band. The villages that died before
their bonds ever ripened don't notice the rule at all:
every tend they ever got was already a below-bar tend. The
rule does what it says — grain stops flowing to safe bonds,
cutting paid grain nearly in half — and on this band the
price stays inside the bar the run set in advance, with
the costs named above rather than hidden. Whether that
trade is worth it on a village actively collapsing is
still untested, because no village here was collapsing to
begin with.

## Metric review (§14 — no in-run re-scoring)

- The prereg's GO legs were judged exactly as written; no
  metric moved. Leg (a): 0 regressions (bar: none) — PASS.
  Leg (b): median delta 0 (bar >= -5) — PASS. Leg (c):
  pooled hold 0.974 vs 1.000 (bar >= 0.950) — PASS. Leg
  (d): wave-4 6 vs 6, wave-5 0 vs 0 (bar: within 1 each) —
  PASS. Leg (e): drops 1 vs 0 (bar <= baseline + 1) — PASS
  at the edge. Insufficient-data triggers: none fired
  (0 instrument errors, 5 baseline diplomacy seeds,
  decision records matched on 16/16 runs, armed seasoned
  0, armed below-bar 90, unknown 0).
- What the metric proved: the decision-time classifier
  proved itself — armed seasoned tends 0 on every seed
  with no mislabel to forensically explain away, where
  tendseason's snapshot classifier produced exactly one.
  The band-regression leg (a) did its job in the other
  direction this time: it passed while the median-of-days
  fell (88.5 → 77.5), showing the two summaries are not
  interchangeable — leg (a) plus the delta distribution
  together carry what either alone hides. The drop guard
  (e) passed at the edge again (1 vs 0+1), and would have
  caught a worse drop count.
- What the metric missed, proposed for the NEXT run (not
  applied here): (1) END-STATE RUNG is not a judged leg:
  two seeds dropped global → regional with no band
  regression and no drop-guard breach (91506 holds to
  death a rung lower). A future prereg should consider a
  rung guard (armed national+ count >= baseline - 1) or
  say explicitly that rung downgrades are accepted costs.
  (2) MEDIAN-OF-DAYS vs MEDIAN-OF-DELTAS: leg (b) judges
  deltas; the days-median fell 11 days on this band while
  deltas passed at 0. Future preregs should report both
  (as this evidence does) and pre-state which one judges.
  (3) SCOPE, carried from tendseason: this band had no
  baseline-collapsing seeds, so the restriction-on-a-
  collapsing-seed question is untested; a next run should
  screen a fresh band under tend-through first and judge
  the restriction on the collapsing subset, with that
  screening step pre-registered (a new run design, not a
  re-score of this one). (4) TEND CALLS ≠ GRAIN SENT,
  carried from tendseason and now quantified both ways in
  every table: future preregs should judge paid tends,
  with call counts as secondary — this pilot already
  reports both, but the GO legs still read calls for the
  premise conditions (seasoned/below-bar), which is
  correct for the policy decision and should stay.
- Instrument limitations recorded for the next run, not
  fixed here: (1) tendLink say-lines not in the SAY_RE
  sample (see sense-testing). (2) Per-link trust is sampled
  from daily snapshots for trajectories, so intra-day moves
  are netted, not itemized — but tend classification no
  longer depends on snapshots at all, so this no longer
  threatens the verdict. (3) scaleRank 'global' is the
  globalLive flag read, not a completed global campaign.
  (4) The analyzer's last-snapshot w4/w5 fields were NOT
  used for the wave guard; ever-faced (any snapshot) was,
  per the prereg. (5) Paid kcal totals are sums of engine
  returns (whole-unit pantry removal over-removes above
  the 1,500 request); per-tend paid is not exactly 1,500.

## Confirm note (coordinator decision)

Pilot GO banked; NO confirm run by this worker, per the
prereg (PILOT ONLY). Whether a 16-seed confirm follows —
and on which fresh band — is the coordinator's call. Note
for that decision: this GO and tendseason's NO-GO-shaped
result are on DIFFERENT bands with DIFFERENT classifiers,
so they do not cancel each other; a confirm on a third
fresh band under this fixed classifier would be the
tie-breaker the two pilots together point at, not a
re-run of either.

## Verdict — PILOT GO (banked; no confirm in this run)

PILOT GO judged exactly as pre-registered: no survival-band
regressions, median death-day delta 0 (bar >= -5), pooled
hold-share 0.974 vs 1.000 (bar >= 0.950), wave guard intact
(6 vs 6 wave-4, 0 vs 0 wave-5), drop guard passing at the
edge (1 vs 0+1), decision-time premise fully honored (armed
seasoned tends 0, below-bar tends 90, unknown 0, decision
records matched on 16/16 runs). The restriction cuts paid
grain 150 → 81 tends (230,272 → 131,364 kcal), holds four
of five polities to death, drops one (91503, unrecovered,
on an empty pantry after a 59-day no-paid-tend gap),
loses no wave-4 facings, and downgrades two end-state
rungs (91503, 91506 global → regional). Targeted tending
below the seasoned bar passes its bar on a holding band
with named costs; the collapsing-seed question stays open.
No confirm run.

## Next blank, precisely (no fix in this run)

1. A confirm decision on a third fresh band under the
   decision-time classifier (coordinator's call) — the
   tie-breaker between tendseason's NO-GO-shaped band and
   this band's GO.
2. A rung guard for the next diplo prereg (metric-review
   item 1): armed national+ end-state count vs baseline,
   or an explicit accepted-cost statement for rung
   downgrades.
3. A screened collapsing-seed run (metric-review item 3):
   pre-registered tend-through screening first, then the
   restriction judged on the collapsing subset — the
   question neither holding band could test.
4. The BELONG-tending gap (still open): tend-through, the
   floor, and this restriction all tend Haven-primary links
   only, so a BELONG link is still never tended on any seed
   here.
NO gate/price/deed arm follows from this evidence.

## Findings for backlog (coordinator appends; not chased here)

- [open] 2026-11-04 — diplomacy — tend-through restricted
  to links below the seasoned bar (age < 30d OR trust < 40)
  on fresh band 91501–91508 with a DECISION-TIME tend
  classifier: PILOT GO (no band regressions, median delta
  0d, pooled hold 0.974 vs 1.000, wave guard 6 vs 6 / 0 vs
  0, drop guard 1 vs 0 at the edge; armed decision-time
  seasoned tends 0, below-bar 90, unknown 0, decision
  records matched 16/16; paid tends 150 → 81, paid kcal
  230,272 → 131,364). Costs named, not hidden: one drop
  (91503, unrecovered, pantry 0 after a 59-day no-paid-tend
  gap), two end-state rung downgrades (91503, 91506
  global → regional), one 21-day shorter life (91506).
  No confirm run (PILOT ONLY per prereg); tendseason's
  NO-GO-shaped band result stands on its own band and is
  not cancelled by this GO. Collapsing-seed question still
  open (this band's baseline had zero collapsing seeds).
- [open] 2026-11-04 — instruments — decision-time tend
  classification (outer tendLink wrapper reading the live
  link in the policy's own call stack) eliminates the
  tendseason snapshot mislabel class: 0 mislabels on 16
  runs, 90/90 armed tends classified below-bar at decision
  time, 0 seasoned, 0 unknown (this run's evidence).
- [open] 2026-11-04 — narration — armed 91503's drop
  narration names the drifting fire but not tending or the
  empty pantry as the cause; the causal link is carried by
  trust/tend numbers only (this run's sense-test).
- [open] 2026-11-04 — metric — end-state rung downgrade
  (global → regional) escapes all five GO legs when the
  village holds to death a rung lower (91506); next diplo
  prereg should carry a rung guard or an explicit
  accepted-cost statement (this run's metric review).

## Proof and landing

- Proof: `scripts/test-tendbelow-20261104.js` — 67/67 PASS
  (policy construction, predicate boundaries,
  decision-wrapper unit tests including the 99209 pattern,
  decision-time-only summarize, bands, median, ever-faced,
  pooled hold-share, GO-judge fixtures for all five legs +
  insufficient-data, live harness smoke: 2-day below-bar
  run, 0 instrument errors, wrapper restore verified).
- Arm commits on branch sim-tendbelow-b (coordinator merges
  via --ff-only; committed on branch, pending coordinator
  merge — no push, no bump, no live verification by this
  worker):
  - 53303dda9 sim-tendbelow-b prereg (before any judged sim)
  - 642e5fa8f sim-tendbelow-b instruments + proof 67/67
    (zero src/js)
  - (this landing) sim-tendbelow-b pilot + evidence
    (zero src/js)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-tendbelow-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-tendbelow-b/` (16 files);
  scripts `test-tendbelow-driver-20261104.js`,
  `test-tendbelow-analyze-20261104.js`,
  `test-tendbelow-20261104.js`, policy
  `scripts/policies/leadcourt-tendbelow-b.js` (reusing
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
  --current 'evidence/2026-11-04/perseed-tendbelow-b/
  *.json' --metrics national,table,wins,exiled` refused with
  "recorder-corpus input: all 16 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows,
  not runs." Recorded honestly; no compare fabricated and
  no --allow-recorder-corpus workaround used to force one.
- Heartbeats: worktree heartbeated during the run
  (registry `sim-tendbelow-b`).
- Convergence: scale-onramp stays converging (NOT
  converged): the full seat is still unwon, wave-5 kills
  still 0 in normal play, and this arm's PILOT GO is a
  holding-band result with named costs, not a chain
  movement — the winnability chain's binding failure
  (wave-4 kills in the wild) is untouched by this arm.
