# Loop B 0830Z coordinator evidence — winnability chain: polity fragility + LEAD-vs-BELONG shape

Run: fleshout-loop-b-20261104T0830Z. Axis: scale-onramp (winnability-chain
re-point; food-economy adoption arms parked per the 2026-11-03 re-point).
Loop A 0820Z was LIVE at run start with claim fleshout-20261104T0820Z
(scale-onramp: sim-askplus-a, sim-fleerepair-confirm-a, sim-holdbeat-a) —
NOT touched. This run took the 0730Z run's next blanks (2) and (3);
blank (1) competent-plus-ask was Loop A's, not duplicated here.

Pre-flight: main tree clean (0 files), disk 31%, reaper removed nothing
sibling-owned (12/16 active at reaper time). Claim written before any
sims; deleted at closeout. Lock deleted at closeout.
Registration was slow (two concurrent Loop A registrations interleaved;
both trees registered and heartbeated before workers spawned).
Master moved twice mid-run from sibling landings (Loop A askplus, then
holdbeat): each arm was rebased onto the new master, proof re-run, then
merged --ff-only. No conflicts.

## Arm 1 — sim-polityfrag-b: DIAG-GO (zero src/js)

Question: over a full season, does diplomacy hold, flicker, or collapse —
and after a drop, does the polity recover?
Pilot (8 seeds, leadcourt verbatim, 300d death-aware): extended 99401–99404
+ fresh 99409–99412. Extended legs reproduce the diplo corpus exactly
(0 mismatches on first-140d diplomacy + funnel). No seed survived to 300
(max 146d) — the horizon never bound.

Answer: diplomacy HOLDS or COLLAPSES — never flickers, never recovers.
Of 5 seeds that ever reached diplomacy > 0: 2 hold to village death
(hold-share 1.000, end at global with 102 still paying), 3 collapse
exactly once with 0 recoveries (hold-shares 0.345 / 0.968 / 0.867;
pooled 274/343 = 0.799). Every drop is a weakest-link trust-unseason
after a 40–82 day pantry-gated tending gap (leadcourt tends only when
pantry > 20,000 kcal). Two no-recovery modes: tending never resumes
(99403 dies 1 day after its drop; 99411's pantry never recovers), and —
decisively — tending resumes and still fails (99402: tends d97/d110/d111
including the dropped link, trust still falls 21 → 0). Structural trap:
a trust-0 link still counts as an active subordinate, so no replacement
is ever proposed (0 re-proposals on all 8 seeds) and resumed tending
counts as upkeep, blocking the neglect snap — a zombie polity at
diplomacy 0 until village death. A drop demotes the village (global →
regional, "the climb starts over") but removed no wave-5 unlock: 99402
faced wave 5 from d114, 25 days after its drop, on war standing alone.
The BELONG mixed-polity finding reproduces (99401: 3 seasoned links,
diplomacy 0, BELONG link breaks d97).

Wall (pilot corpus, 8 seeds): wins 0/8, end-state global 2/8, national
0/8 at end, table not instrumented, wave-5 unlock 1/8, wave-5 faced 1/8,
wave-4 faced 8/8, readiness-5-ready days 27 (99402 only), median
survival 109d, max 146d, all 8 villages lost, 543 deaths (59% combat).

Commits (rebased onto master incl. Loop A landings; proof 32/32 on
rebased tip and on merged master): prereg 683f51da5, instruments
ef2b102f9, analyzer fix d1373f2b4, pilot + evidence c590a6cba.
Next blank named (not built here): a recovery arm testing tend-through
vs. zombie-clearing separately. NO gate/price/deed arm follows.

## Arm 2 — sim-leadbelong-b: DIAG (zero src/js)

Question: for every link, which side LEADs and which BELONGs — and does
shape predict anything? Corpus: stored sim-diplo-b corpus, all 8 files,
no re-derivation needed (leadcourt 99401–99404 + competent 99405–99408).

Shapes, 12/12 links classified, 0 unclassified, 0 mid-life shape
changes: LEAD 11, BELONG 1, LEAGUE 0, CONQUEST 0. Competent seeds:
0 links. Flip rate, all three denominators: 1/1 accepted counters
(100%), 1/12 proposals (8.3%), 1/12 links (8.3%) — the single counter
in the corpus (99401, Stonebridge, d26 counter → d27 accept, LEAD
intent → BELONG link). Seasoning is NOT predicted by shape: LEAD 10/11
seasoned-ever (the miss is a time miss: 99404 splinter link formed d47,
village lost d76 at age 29d, trust 58); BELONG 1/1 seasoned-ever, but
for exactly one day (d57, trust 41) before falling back below the
trust bar. Holding gap is 100% confounded — do not attribute to shape:
LEAD 11/11 held, BELONG 0/1 (broken d97, day before village loss).
Leadcourt's tend loop tends only primary === 'haven' links, so the
BELONG link got zero tends in 70 days; trust decayed 68 (d39 peak) →
0 (d85) → broken. Whether a tended BELONG link holds is unmeasured.
Diplomacy value follows the seed's shape SET, not a link's shape:
99402/99403 (pure LEAD) hit 102 for 29/60 regional+ days; 99401
(2 LEAD + 1 BELONG, all seasoned at d57) scored 0 every day — the flip
left only 2 LEAD subordinates, one short of a LEAD polity, and no
Stonebridge polity was ever recorded for a BELONG count; 99404 also
scored 0 but because 2/3 links are splinter bonds (score 0 by rule).
The flip permanently capped 99401: leadcourt counts only Haven-primary
subs and all 3 villages were already linked, so no replacement proposal
could restore a third LEAD subordinate.

Say-line over-catch quantified: 619/1,496 captured lines (41.4%) are
named over-catch classes; strict diplomacy only 79/1,496 (5.3%), of
which just 14 concern villages/polities. Zero captured lines on any
seed narrate a proposal, counter, decline, or covenant — the flip
itself is invisible in dialogue (sayLines are a capped SAY_RE sample,
so "zero" means zero in the captured sample; whether proposals are
narrated through an unwrapped channel or not at all is an open
instrument question, not a game finding).

Wall (8-seed corpus, for the record): wins 0/8, national 0/8, table
0/8, wave-4 unlocks 6/8, wave-5 unlocks 1/8 (99402 only), wave-4 faced
6/8, wave-5 faced 1/8, readiness-5-ready days 27 (all on 99402), median
survival 81d (range 37–140), 7/8 villages lost. Arc reach not
instrumented — stated, not faked.

Commits (rebased onto master incl. Loop A askplus landing; proof 35/35
on rebased tip and on merged master): prereg 667cf1d9b, instruments
99846081d, strict say-classifier fix 08fe0eef6, evidence a4e032490.
Next blanks named (not built here): (1) a belongseek panel with a
policy that tends its subordinate links, to measure BELONG
holding/diplomacy for real; (2) a peer-link corpus for LEAGUE shape
(zero observed here); (3) an instrument fix anchoring SAY_RE on first
words plus a dedicated proposal/counter event channel; (4) the policy
question for the next proposing arm: when a LEAD proposal flips to
BELONG, tend it, replace the third LEAD subordinate, or both — 99401
needed both. NO gate/price/deed change follows.

## Sibling context (not this run's verdicts)

Loop A landed mid-run: sim-askplus-a KILL per prereg (NO-GO on
holding, 2/8 end-diplo) and sim-holdbeat-a (Q1 door held, Q2
pre-credit beat proven, DIAG-GO). The askplus holding failure sharpens
this run's finding rather than duplicating it: even when proposals
fire, diplomacy does not hold — and this run names why (pantry-gated
tending gaps + the zombie-link trap).

## Telemetry deviation check

Refused by the tool itself (recorder rows with top-level anchorCommit,
not runs; no comparison against the WINSEAT run baseline). Field-shape
artifact, same as the 0730Z run; baseline NOT rolled, no investigation
item. No --allow-recorder-corpus or --update-baseline override used.

## Village assessment (plain words)

Villages that reach the wider world can now genuinely link up and even
stand as a global power — but the friendship is brittle in a specific,
fixable way: keeping allies takes steady tending, and tending stops
when the pantry runs low. Once one ally's trust runs out, the whole
arrangement collapses to nothing and never comes back, because the
dead friendship still counts as filling the slot, so nobody ever
replaces it. The village keeps paying the price of a fallen alliance
until it dies. The fix is not to lower any price or gate — it is to
decide what tending-through or clearing a dead link should do, and to
tend subordinate links whoever leads them.

## Metric review

Both arms pre-registered before any judged work and were judged against
their bars, not re-scored. Leadbelong's first judged say-classification
run over-matched bare "counter" (combat tactics flooded strict); the
classifier was corrected to the prereg's village-context intent, proof
extended to 35/35, say numbers recomputed — the DIAG bar never moved
and shape/flip/wall numbers are identical across both runs (disclosed
in the arm evidence). Polityfrag's 300d horizon never bound (max
survival 146d); future season arms should set horizons from the
baseline survival distribution rather than a round 300d cap.

## Closeout

Both arms merged --ff-only after rebase + proof re-run; both worktrees
released done-merged and branches deleted; main tree clean at closeout
(0 files). No push, no bump, no live verification (ship loop owns
deploys). Merged locally, pending ship.
