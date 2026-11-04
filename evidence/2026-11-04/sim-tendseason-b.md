# Tend-through ONLY for links below the seasoned bar — Loop B, arm sim-tendseason-b

Axis: scale-onramp / winnability chain. POLICY-ONLY arm: one new
policy file, ZERO src/js changes, ZERO edits to leadcourt.js or
leadcourt-tendthrough.js, ZERO gate/price/deed changes. This arm
tests ONLY the tend-below-seasoned-bar variant; it never tests
zombie-clearing, never bundles legs, and never touches the
sibling recovery-zombie work, any Loop A tree/claim/branch, the
HELD branch sim-recovery-zombie-b, or the orphaned
sim-fracchoice-b tree.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-tendseason-b-prereg.md`
(commit ed06543cc). In short:

- Question: floored tend-through (99001–99008) was GO-THIN — it
  removed the tend-through survival cost but bought three late
  polity drops where the baseline had none. Does tending ONLY
  below-bar links keep polities held without the survival tax
  and without the floored leg's late drops?
- Predicate (from src/js/hierarchy.js before any sim): a link IS
  seasoned iff (scholar day - link.day) >= 30 AND (link.trust ||
  0) >= 40 (link.day = formation day, link.trust starts at 30
  in _formLink). This policy tends iff NOT that: age < 30 days
  OR trust < 40. Mercy/succ-polity graces are
  polity-membership-only and never change link.trust, so they
  do not move the predicate.
- Primary variant (EXACTLY ONE): NEW
  `scripts/policies/leadcourt-tendseason-b.js` =
  leadcourt-tendthrough with EXACTLY ONE change: the tend
  condition gains the below-seasoned-bar predicate. Everything
  else is tend-through verbatim (weekly cadence,
  Haven-primary only, 1,500 kcal engine cost, NO pantry tend
  gate of any kind, proposal gate pantry > 12,000 unchanged,
  answer/counter logic unchanged).
- Seeds: FRESH pilot band 99209–99216, identical on both legs
  (16 runs). Freshness verified before the prereg: no dated
  evidence .md in evidence/2026-11-04/ names any of them, no
  per-seed corpus filename carries any of them, and no dated
  evidence .md of any date names any of them as a bare word;
  absent from the forbidden list (99001–99008 tendfloor pilot,
  99009–99024 tendfloor-guard confirm, 994xx, 996xx, 998xx)
  and from today's other bands. Baseline is THIS leg's own
  tend-through run on 99209–99216 — NOT the cited 994xx or
  99001–99008 numbers (different seeds, different timelines;
  background only, never pooled).
- Confirm band (pre-stated in the prereg, so a confirm is
  legitimate without a later addendum): 99041–99052 (12 seeds),
  verified fresh the same way. Confirm runs ONLY on a pilot
  GO, and only on this band, and only with this prereg's
  metric (including the drop guard).
- Horizon: 300 days, death-aware (dead villages stop; +10d
  tail max). WHY 300: identical window to tendfloor and
  0930Z, so per-seed death-day deltas are like-for-like;
  never binding here (max survival 129d).
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim via a
  new parameterized driver
  (scripts/test-tendseason-driver-20261104.js, output
  evidence/2026-11-04/perseed-tendseason-b/, RUN=tendseason-base
  for tend-through and RUN=tendseason-armed for below-bar)
  and the polityfrag analyzer REUSED verbatim through a new
  wrapper (scripts/test-tendseason-analyze-20261104.js). The
  snapshot NEVER calls villageStandingTotal() or
  unlockedWave(); ONE end-of-run unlockedWave() call is
  reported separately and never counted as a natural
  door-open. The driver refuses to overwrite an existing
  per-seed file.
- Wave facing (ever-faced, defined in the prereg because the
  reused analyzer's w4faced/w5faced fields read only the LAST
  snapshot): a seed has faced wave 4 (resp. 5) iff ANY daily
  snapshot carries w4faced (resp. w5faced) true.
- Hold-share (pooled, per leg): over diplomacy seeds only,
  sum of post-first-diplo snapshots divided by sum of
  post-first snapshots, from the reused analyzer's fields.
- Tend classification (fixed in the prereg): a tend on day D
  is classified from the LATEST daily snapshot with day < D
  (pre-tend state — the driver snapshots AFTER that day's
  policy run, so the same-day snapshot already carries the
  tend's own +8 trust and cannot be used). Seasoned iff
  (snapDay - link.day >= 30) AND (trust >= 40); otherwise
  below-bar; no earlier snapshot carrying the link = unknown.
- PRIMARY METRIC + GO BAR (binding): GO iff ALL hold:
  (a) NO survival-band regression on ANY seed; (b) median
  death-day delta (armed minus tend-through baseline, over
  all 8 seeds) >= -5 days; (c) armed pooled hold-share >=
  baseline pooled hold-share - 0.05; (d) WAVE-FACING GUARD:
  armed ever-faced wave-4 count >= baseline - 1, AND armed
  ever-faced wave-5 count >= baseline - 1; (e) DROP-COUNT
  GUARD (added per the tendfloor metric review,
  pre-registered here before any sim): armed total drops <=
  baseline total drops + 1. Otherwise NO-GO.
  INSUFFICIENT-DATA only if > 2 seeds in either leg carry
  instrument errors, or the baseline leg has zero diplomacy
  seeds, or the armed leg records zero below-bar tends
  (lever never fired), or the armed leg records any seasoned
  tend (variant as defined not run). A miss is NO-GO, never
  re-scored (§14).
- Bands: A = survived to 300d, B = died 150–299d, C = died
  100–149d, D = died < 100d (same as tendfloor/0930Z).

## Pilot leg — per-seed before/after table

Proof `scripts/test-tendseason-20261104.js` 46/46 before the leg
(policy construction, bands, median, tend classification by
pre-tend seasoned state, ever-faced detection, pooled
hold-share, GO-judge fixtures for all five legs +
insufficient-data, live harness smoke: 2-day below-bar run, 0
instrument errors). 0 instrument errors on all 16 runs;
analyzer classified 8/8 pairs. Columns: days, delta, band,
scale, maxW, everW4/W5, trajectory, hold-share, drops/recov,
tends (armed: below/seasoned/unknown pre-tend classes — see
the classification note below), ready days. Baseline values
are this leg's tend-through run on the same seed.

| seed | days base → armed (delta) | band base → armed | scale base → armed | maxW base → armed | everW4 base → armed | everW5 | trajectory base → armed | hold base → armed | drops/recov base → armed | tends base → armed (armed below/seasoned/unknown) | ready |
|------|---------------------------|-------------------|--------------------|-------------------|---------------------|--------|--------------------------|--------------------|---------------------------|--------------------------------------------------|-------|
| 99209 | 72 → 98 (+26) | D → D | regional → regional | 4 → 4 | yes → yes | no | holds-to-death → collapses | 1.000 → 0.949 | 0/0 → 1/0 | 30 → 16 (13/1/2) | 0 → 0 |
| 99210 | 112 → 115 (+3) | C → C | global → global | 4 → 4 | yes → yes | no | holds-to-death → holds-to-death | 1.000 → 1.000 | 0/0 → 0/0 | 116 → 15 (13/0/2) | 0 → 0 |
| 99211 | 53 → 53 (0) | D → D | regional → regional | 4 → 4 | yes → yes | no | never → never | — → — | 0/0 → 0/0 | 26 → 26 (26/0/0) | 0 → 0 |
| 99212 | 111 → 91 (-20) | C → D REGRESSION | global → global | 4 → 4 | yes → yes | no | holds-to-death → holds-to-death | 1.000 → 1.000 | 0/0 → 0/0 | 103 → 16 (15/0/1) | 0 → 0 |
| 99213 | 85 → 103 (+18) | D → C | global → global | 4 → 4 | yes → yes | no | holds-to-death → holds-to-death | 1.000 → 1.000 | 0/0 → 0/0 | 66 → 16 (15/0/1) | 0 → 0 |
| 99214 | 57 → 57 (0) | D → D | village → village | 4 → 4 | no → no | no | never → never | — → — | 0/0 → 0/0 | 5 → 5 (5/0/0) | 0 → 0 |
| 99215 | 122 → 129 (+7) | C → C | national → national | 4 → 3 | yes → NO | no | holds-to-death → holds-to-death | 1.000 → 1.000 | 0/0 → 0/0 | 50 → 22 (22/0/0) | 0 → 0 |
| 99216 | 119 → 82 (-37) | C → D REGRESSION | global → national | 4 → 4 | yes → yes | no | holds-to-death → holds-to-death | 1.000 → 1.000 | 0/0 → 0/0 | 87 → 16 (14/0/2) | 0 → 0 |

Pooled: tend calls 483 (baseline) → 132 (armed), a 73% cut —
the restriction bit hard. But tend CALLS overstate grain:
the instrument records every tendLink call, including
engine refusals (bare pantry returns 0, no grain, no trust).
Paid tends (return > 0): baseline 183 → armed 104, still a
43% cut in actual grain sent. Armed below-bar tends total
123, so the lever fired where it was designed to fire; the
single "seasoned" count on 99209 is a classification artifact
(see the verdict section — proven, not assumed). The 8
"unknown" tends are all formation-day tends (link formed
that same day: age 0, trust 30 — below bar by construction),
verified link by link; none of them can be a hidden seasoned
tend. Baseline pooled hold-share 1.000 (6 diplomacy seeds,
241/241 post-first snapshots); armed pooled hold-share
0.992 (6 diplomacy seeds, 237/239). Ever-faced wave 4: 7/8
→ 6/8. Ever-faced wave 5: 0/8 → 0/8. Ready days: 0 both legs.

CLASSIFICATION NOTE (read before citing the seasoned column):
the tend classifier uses the latest snapshot BEFORE the tend
day, because the driver snapshots after the day's policy run.
A trust move that lands after that snapshot and before the
next day's policy run is invisible to the classifier — the
same snapshot-timing artifact class the tendfloor evidence
documented for pantry bands, now in seasoned form. It bites
exactly once here, on 99209 (see verdict section).

## Judged verdict — INSUFFICIENT-DATA as pre-registered; substantively NO-GO-shaped

Judge output: verdict INSUFFICIENT-DATA — reason: "armed leg
tended 1 seasoned link(s): variant as defined was not run";
leg (a) no regressions: FALSE (regressions 99212, 99216);
leg (b) median death-day delta +1.5 days (deltas sorted:
-37, -20, 0, 0, +3, +7, +18, +26; bar >= -5): TRUE; leg (c)
pooled hold-share 0.992 vs baseline 1.000 (bar >= 0.950):
TRUE; leg (d) wave guard: wave-4 6 vs baseline 7 (bar >= 6):
TRUE at the edge, wave-5 0 vs 0 (bar >= -1): TRUE; leg (e)
drop guard: armed drops 1 vs baseline 0 (bar <= 1): TRUE at
the edge. Bad seeds 0. Verdict as pre-registered:
INSUFFICIENT-DATA, judged exactly as written.

FORENSIC FINDING — the trigger event is proven artifactual,
and the policy premise was honored. The single "seasoned"
tend is 99209 day 97, link_mgpspi0e706. The evidence against
the label:

- The day-96 snapshot shows the link at trust 46, age 67
  (seasoned). The day-97 snapshot shows trust 38, age 68
  (below bar) — and the analyzer's own drop record brackets
  the same move (trust 46 → 38) with the drop at day 97.
  The realm-apart line was already spoken on day 96
  ("The realm came apart — no polity answers to Haven now"),
  so the trust drop (46 → 38) landed after the day-96
  snapshot and before the day-97 policy run.
- The day-97 tend call returned 0: the engine refused it
  (pantry 0 at the day-97 snapshot — "the pantry is bare"
  path: no grain sent, no trust gained). Decision-time trust
  was therefore ≤ 38 (< 40) on either branch: 38 if refused
  (as recorded), 30 if it had paid (+8 → 38). Either way
  the policy tended a below-bar link, exactly as defined.
- No grain moved on a seasoned link anywhere in this pilot:
  the only seasoned-classified event paid 0 kcal.

So the classifier failed, not the policy. Per §14 the
revision is proposed for the NEXT run, NOT applied in-run:
the classifier must use decision-time trust — e.g. record
trust inside the tend event (wrap tendLink's pre-call link
state), or classify from the same-day post snapshot minus
the paid gain (ret > 0 ⇒ decision trust = post trust - gain;
ret = 0 ⇒ decision trust = post trust) — and must count
only paid tends (ret > 0) as grain sent. The verdict above
stands as pre-registered; the revision must not be applied
retroactively to this pilot.

CORRECTED-CLASSIFICATION READING (a finding, NOT a re-score):
with the artifact removed (armed seasoned 0, below-bar 123 +
8 formation-day unknowns), the judge would read NO-GO on
leg (a) alone: two survival-band regressions (99212 C → D,
99216 C → D), all other legs passing (median +1.5, hold
0.992, wave guard at the edge, drop guard at the edge).
Do NOT cite this pilot as GO. Do NOT cite
INSUFFICIENT-DATA as "the arm tested nothing" — the arm
tested, the premise held, and on the corrected reading it
misses on survival bands. No confirm is run: a confirm
requires a pilot GO, and this pilot is not GO on either
reading. The pre-stated confirm band (99041–99052) stays
fresh and unused.

## Finding 1 — the restriction starves the links it stops feeding

The mechanism is visible in the tend totals and in the two
regressions. Under tend-through, a diplomacy seed tends
constantly (99210: 116 calls, 99212: 103, 99216: 87) and
holds to death at 1.000. Under below-bar-only, tending stops
the week a link seasons — and a seasoned link still decays:
weekly ticks, tribute shortfalls, and speaker deaths all
chew trust, and nothing feeds it back until it has already
unseasoned. The armed leg's holds are therefore holds on a
knife-edge: five of six diplomacy seeds still hold to death,
but the two that fall behind die sooner, not later:

- 99212: C → D, 111 → 91 days (-20). Holds to death, but
  dies 20 days sooner. Tend calls 103 → 16 (paid grain far
  less). The realm still stands at death — it just stands
  over a village that died sooner.
- 99216: C → D, 119 → 82 days (-37), end-state global →
  national. Holds to death, but dies 37 days sooner and
  ends a rung lower. Same shape: the realm survives, the
  village does not live as long.
- 99209: the only drop, and it is the honest version of the
  same mechanism: the link seasoned, tending stopped, trust
  decayed 46 → 38 across the drop bracket while the pantry
  sat at 0, the realm came apart on day 97, and the
  village's day-97 tend attempt was refused empty-handed
  (ret 0). It lived longer than baseline (72 → 98) but lost
  the polity it had held to death under tend-through.
  A drop with a refused rescue attempt is not a flicker —
  there is no recovery, and the village dies at 98 with
  diplomacy 0.

The tendfloor trade was "live longer, drop late." This
trade is worse: "live shorter on two seeds, drop once, and
gain one band on one seed (99213 D → C, 85 → 103)." The
median (+1.5 days) hides the split — the distribution is
bimodal, not centered: three seeds gain (+26, +18, +7),
two lose hard (-20, -37), three are unchanged. A median
that passes while two seeds regress a band is exactly why
leg (a) exists, and leg (a) is what fails.

## Finding 2 — the never-seeds are untouched, as expected

99211 and 99214 are identical on both legs in every column
(days 53/53 and 57/57, same bands, same tend counts 26/26
and 5/5, both died-before-seasoning). When a village dies
before any link seasons, every tend is a below-bar tend by
definition, so the restriction changes nothing — the armed
leg and the baseline leg are the same policy on those
seeds. This is a control in disguise: it proves the
restriction's effect is confined to diplomacy seeds, and
that the regressions on 99212/99216 are the restriction's
doing, not harness noise. 99211's armed tend total (26)
equals baseline exactly, while diplomacy seeds' totals
collapse — the cut is targeted at seasoned links, as
designed, and that targeting is what costs the bands.

## Finding 3 — this band cannot answer the collapsing-seed question either

Scope limit, stated not buried: the baseline leg on THIS
band has zero collapsing seeds (all six diplomacy seeds
hold at 1.000 under tend-through), so this pilot tests the
restriction's effect on holders and never-seeds, NOT its
effect on a village actively collapsing. The question the
queue actually cares about — does targeted tending save a
collapsing polity without taxing holders? — is still
untested on any seed, because no fresh band can be known to
collapse before it is run. What IS established here: on a
holding band, restricting tending to below-bar links does
not preserve survival (2 band regressions) even though it
preserves hold-share (0.992) and mostly preserves facing.
Any report citing this pilot as "targeted tending works"
is wrong on both readings (INSUFFICIENT-DATA as
pre-registered, NO-GO on the corrected classification).

## Wall numbers (pilot legs, not wall movement)

Wins 0/8 on both legs. Villages lost 8/8, survived to
horizon 0/8, on both legs. End-state scaleRank — baseline:
global 4/8, national 1/8, regional 2/8, village 1/8
(national+ 5/8); armed: global 3/8, national 2/8, regional
2/8, village 1/8 (national+ 5/8 — same count, different
seeds: 99216 drops global → national). Table: not
instrumented by this arm (stated, not faked); no win flag
observed on any seed. Wave-5 unlocks 0/8 both legs
(maxWave 5 on no seed), wave-5 faced 0/8 both legs,
wave-4 ever-faced 7/8 → 6/8 (99215 loses its facing on the
armed leg), wave-4 unlocks (maxWave >= 4) 8/8 → 7/8 (99215
maxWave 4 → 3). Readiness-5-ready days: 0 both legs.
Median survival 98 → 94.5 days, max 122 → 129 days.
Deaths 497 → 495 (the shape is unchanged): combat share
baseline villager combat 233 + combat 81 = 314/497 (63%),
armed 233 + 71 = 304/495 (61%) — villages die fighting,
not starving, on this band too. Starvation deaths 2 → 0
despite the grain cut: the binding deaths are combat deaths
in slightly shorter lives. Arc II/III/IV reach: not
instrumented (stated, not faked). Four-realm formation: not
instrumented (stated, not faked).

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

Baseline leg (tending present, nothing collapses):

- 99210 d32 (formation): "Three fires bow to Haven. But a
  realm isn't leverage — it's seasons. These bonds are
  young; tend them, keep the trust, and the court will
  come." d76: "Four fires. One head. GOVERNANCE LAYER:
  online — polity tribute routing, the court calendar,
  famine reserves. You built a realm. Try not to lose it
  the way you found it." The baseline polity reads as a
  consequence of tending because the trust numbers say so:
  every baseline diplomacy link ends tended and held, with
  zero drops to narrate.

Armed leg (tending stops at seasoning, then the realm comes
apart — once — and two villages die sooner holding realms):

- 99209 d96 (drop, the pilot's only collapse): "Stonebridge's
  fire is drifting from ours — their speaker doesn't linger
  at the gate the way they used to, and nobody over there
  says why. Bonds don't mend themselves; a tended fire
  remembers who fed it." Same day: "The realm came apart —
  no polity answers to Haven now, and Haven is a free fire
  again. National and global no longer describe this
  village. The climb starts over." The drifting-fire warning
  is the most honest line in the corpus: it names exactly
  what the restriction did — stopped feeding the fire once
  it counted as seasoned. But neither line names tending as
  the cause — the causal link is carried by the trust/tend
  numbers (last paid tend weeks earlier, day-97 tend refused
  with an empty pantry), not by the narration. A player
  reading only the transcript would know the realm fell,
  not why.
- 99216 d76 (realm built under the restriction): "Four
  fires. One head. GOVERNANCE LAYER: online — ..." — the
  same court line as baseline, but the village then dies
  37 days sooner than baseline and ends national, not
  global. Building the realm is narrated; losing the rung
  is not — the end-state downgrade has no line of its own.
- 99212 d77: same court line, then death at 91 vs 111
  baseline, again with no narration of the shorter life.

Flagged, minor, not verdict-driving: (1) on armed 99209 the
drop's narration (d96) precedes the analyzer's drop
snapshot (d97) by a day — the trust move lands after the
day-96 snapshot, so snapshot-day and narration-day disagree
by one; this is the same timing gap behind the seasoned
misclassification, and it is a property of daily snapshots,
not of the game. (2) The usual repeated templates recur
across seeds ("1 unprocessed haul onto the counter — the
clock is ticking" daily on 99209) — ordinary village talk,
not diplomacy-specific robotics. (3) Carried capture limit
from tendfloor/0930Z: the instrument's SAY_RE still does
not match tendLink's own say-lines ("Haven sends … kcal
of grain …"), so tend events are proven by counts and
return values (183 paid baseline, 104 paid armed), not
quoted lines.

## Village assessment (plain words)

Picture the same eight villages, but with a new rule: once
a bond counts as seasoned — thirty days old, trust forty
or better — nobody sends it grain again. The grain goes
only to young bonds and struggling ones. Where before the
grain never stopped and every realm held to the grave, now
the villages that already had realms keep them, mostly —
five of six still die holding their realm — but two of
them die weeks sooner, one realm comes apart on an empty
pantry after its fire stopped being fed, and one village
that used to reach the world's stage ends a rung lower.
The villages that died before their bonds ever ripened
don't notice the rule at all: every tend they ever got was
already a below-bar tend. The rule does what it says —
grain stops flowing to safe bonds — and the price is
exactly what the rule's own logic predicts: a seasoned
bond is not a finished bond. It still needs feeding, and
when the feeding stops, it quietly starves until it isn't
seasoned anymore, and by then the village may already be
dead or dissolved. Targeted tending is not the answer to
the floored leg's late drops; it trades them for shorter
lives.

## Metric review (§14 — no in-run re-scoring)

- The prereg's GO legs were judged exactly as written; no
  metric moved. Leg (a): 2 regressions (bar: none) — FAIL.
  Leg (b): median delta +1.5 (bar >= -5) — PASS. Leg (c):
  pooled hold 0.992 vs 1.000 (bar >= 0.950) — PASS. Leg (d):
  wave-4 6 vs 7, wave-5 0 vs 0 (bar: within 1 each) — PASS.
  Leg (e): drops 1 vs 0 (bar <= baseline + 1) — PASS at the
  edge. Insufficient-data trigger: 1 armed seasoned tend
  (bar: zero) — TRIGGERED, so the verdict is
  INSUFFICIENT-DATA as pre-registered, not NO-GO, even
  though leg (a) also fails. The split character of the
  result (verdict INSUFFICIENT-DATA, substance NO-GO-shaped)
  is reported alongside the verdict, not used to re-score it.
- What the metric proved: the band-regression leg (a) did
  its job — it caught what the median (b) hid (a passing
  +1.5 median over a bimodal distribution with two hard
  losses). The drop guard (e), new this run, did its job
  too: it passed at the edge (1 vs 0+1) where the tendfloor
  pooled hold-share alone would have hidden the drop, and
  it would have caught a worse drop count. The wave guard
  (d) passed at the edge as well (99215's lost facing is
  exactly the one allowed loss).
- What the metric missed, proposed for the NEXT run (not
  applied here): (1) PRE-TEND SNAPSHOT CLASSIFICATION IS
  WRONG ON INTRA-DAY TRUST MOVES. The seasoned classifier
  reads the previous day's snapshot, but trust moves after
  that snapshot and before the next day's policy run (the
  99209 46 → 38 move). Next run MUST classify from
  decision-time trust (record trust inside the tend event,
  or derive it from the same-day post snapshot and the
  call's return value) and MUST count only paid tends
  (ret > 0) as grain sent — call counts include bare-pantry
  refusals (300 of the baseline's 483 calls paid nothing).
  (2) TEND CALLS ≠ GRAIN SENT. Every tend total in this
  evidence is call counts unless marked "paid"; future
  preregs should judge paid tends, with call counts as
  secondary. (3) BANDS ARE COARSE but the delta distribution
  was reported alongside, so no seed hid inside a band here
  (the -37 day loss on 99216 and the -20 on 99212 are both
  visible, and both cross bands). (4) SCOPE: this band had
  no baseline-collapsing seeds, so the restriction-on-a-
  collapsing-seed question is untested; a next run should
  screen a fresh band under tend-through first and judge
  the restriction on the collapsing subset, with that
  screening step pre-registered (a new run design, not a
  re-score of this one).
- Instrument limitations recorded for the next run, not
  fixed here: (1) tendLink say-lines not in the SAY_RE
  sample (see sense-testing). (2) Per-link trust is sampled
  from daily snapshots, so intra-day moves are netted, not
  itemized — this is what produced the seasoned
  misclassification. (3) scaleRank 'global' is the
  globalLive flag read, not a completed global campaign.
  (4) The analyzer's last-snapshot w4/w5 fields were NOT
  used for the wave guard; ever-faced (any snapshot) was,
  per the prereg. (5) Drop days at end of life carry ±1 day
  (snapshot vs narration day, see sense-testing).

## Confirm note (coordinator decision)

Pilot NOT GO on either reading (INSUFFICIENT-DATA as
pre-registered; NO-GO on the corrected classification), so
NO confirm is run by this worker. The confirm band is
already pre-stated in the prereg (99041–99052, fresh) and
stays fresh and unused — but a confirm of THIS arm on that
band would only be legitimate after a prereg addendum
fixing the tend classifier (metric-review item 1), since
the current classifier demonstrably mislabels a refused,
below-bar tend as a seasoned tend. Running 24 more runs
(12 seeds × 2 legs) through a known-broken classifier
would be confirming the wrong instrument, not the arm. If
the coordinator wants the arm re-judged rather than
re-instrumented, the pilot corpus already supports the
corrected reading (NO-GO on leg (a)); no new sims are
needed to state it.

## Verdict — INSUFFICIENT-DATA as pre-registered (substance: NO-GO-shaped; no confirm)

INSUFFICIENT-DATA judged exactly as pre-registered: the
analyzer records 1 armed seasoned tend, triggering the
prereg's insufficient-data condition, even though forensic
analysis proves that event was a refused (ret 0),
below-bar tend mislabeled by snapshot timing — decision-time
trust ≤ 38, pantry 0, no grain moved. On the corrected
classification the pilot would be NO-GO on survival-band
regressions alone (99212 C → D, 99216 C → D; median +1.5,
hold 0.992, wave guard and drop guard both passing at the
edge). The restriction cuts paid grain 183 → 104, holds
five of six polities to death, drops one (99209, unrecovered),
loses one wave-4 facing (99215), and downgrades one
end-state rung (99216 global → national). Targeted tending
below the seasoned bar does not fix the floored leg's trade
— it trades late drops for shorter lives. No confirm run.

## Next blank, precisely (no fix in this run)

1. A tend classifier that records decision-time trust and
   paid-vs-refused (metric-review item 1) — the instrument
   fix the next diplo arm needs before any re-judgment, on
   any band.
2. A floor run WITH a drop-count guard pre-registered
   (tendfloor metric-review item 1, carried forward),
   ideally screened on a fresh band that contains
   baseline-collapsing seeds, so a tend variant is judged
   where tend-through actually saves polities — the
   question neither the floored band nor this band could
   test.
3. The BELONG-tending gap (still open): tend-through, the
   floor, and this restriction all tend Haven-primary links
   only, so a BELONG link is still never tended on any seed
   here.
NO gate/price/deed arm follows from this evidence.

## Findings for backlog (coordinator appends; not chased here)

- [open] 2026-11-04 — diplomacy — tend-through restricted
  to links below the seasoned bar (age < 30d OR trust < 40)
  on fresh band 99209–99216: INSUFFICIENT-DATA as
  pre-registered (analyzer records 1 armed seasoned tend)
  but proven artifactual on forensics (99209 d97 tend
  ret 0, pantry 0, decision-time trust ≤ 38 after an
  intra-day 46 → 38 drop; no grain moved on a seasoned
  link); corrected reading NO-GO on survival-band
  regressions (99212 C → D, 99216 C → D; median delta
  +1.5d, pooled hold 0.992 vs 1.000, wave guard 6 vs 7,
  drop guard 1 vs 0, paid tends 183 → 104). No confirm run;
  next diplo arm needs a decision-time tend classifier
  (this run's evidence).
- [open] 2026-11-04 — instruments — tend classification
  from previous-day snapshots mislabels tends when trust
  moves intra-day between snapshot and policy run (99209:
  trust 46 at day-96 snapshot, 38 at decision time, tend
  refused ret 0, labeled seasoned); future instruments
  must record trust at tend-event time and count only
  paid (ret > 0) tends as grain sent (this run's capture
  note).
- [open] 2026-11-04 — narration — armed 99209's drop
  narration (d96) precedes the analyzer's drop snapshot
  (d97) by a day; snapshot-day vs narration-day disagree
  when a trust move lands after the snapshot (this run's
  sense-test).

## Proof and landing

- Proof: `scripts/test-tendseason-20261104.js` — 46/46 PASS
  (policy construction, bands, median, tend classification
  by pre-tend seasoned state, ever-faced detection, pooled
  hold-share, GO-judge fixtures for all five legs +
  insufficient-data, live harness smoke: 2-day below-bar
  run, 0 instrument errors).
- Arm commits on branch sim-tendseason-b (coordinator merges
  via --ff-only; committed on branch, pending coordinator
  merge — no push, no bump, no live verification by this
  worker):
  - ed06543cc sim-tendseason-b prereg (before any judged sim)
  - ad1b616b3 sim-tendseason-b instruments + proof 46/46
    (zero src/js)
  - (this landing) sim-tendseason-b pilot + evidence
    (zero src/js)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-tendseason-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-tendseason-b/` (16 files);
  scripts `test-tendseason-driver-20261104.js`,
  `test-tendseason-analyze-20261104.js`,
  `test-tendseason-20261104.js`, policy
  `scripts/policies/leadcourt-tendseason-b.js` (reusing
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
  --current 'evidence/2026-11-04/perseed-tendseason-b/
  *.json' --metrics national,table,wins,exiled` refused with
  "recorder-corpus input: all 16 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows,
  not runs." Recorded honestly; no compare fabricated and
  no --allow-recorder-corpus workaround used to force one.
- Heartbeats: worktree heartbeated during the run
  (registry `sim-tendseason-b`).
- Convergence: scale-onramp stays converging (NOT
  converged): the full seat is still unwon, wave-5 kills
  still 0 in normal play, and this arm's verdict is
  INSUFFICIENT-DATA as pre-registered with a NO-GO-shaped
  substance — targeted tending does not move the chain.
