# sim-spanpromo-b — pre-registration (committed BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, arm sim-spanpromo-b, axis
food-economy. DIAG/measurement ONLY: ZERO src/js changes, ZERO
default flips, ZERO changes to any existing analyzer, sweep,
capture, or to scripts/dedupspan-ledger-b.js /
scripts/census-spandraw-b.js. This arm reuses the census
instrument unchanged (scripts/sweep-spandraw-census-b.js with
PERSEED_DIR pointed at this arm's corpus) and the census
classifier unchanged (scripts/census-spandraw-b.js censusDir).
One NEW script is allowed, and only for the det-gate leg:
scripts/detgate-spanpromo-b.js (instrument OFF vs ON on one
seed — the census sweep has no instrument-off mode for its
nest logger, so neutrality of that logger cannot be shown
with the sweep alone). No new analyzer, no new classifier.

## Question (backlog item, goal hidden_files/sim-findings.md line 1279)

"REAL-PLAY PROMOTION BAND FOR PROBE-PROVEN SPAN KEYS
(loop-B arm sim-spandraw-design-b, run
fleshout-loop-b-20261027T2030Z, evidence/2026-10-27/
sim-spandraw-design-b.md, DIAG-GO): 15 keys are PROBE-PROVEN
(mechanism) on a scripted day-boundary probe, not real-play
proven; a separate unscripted band is required before quoting
them as real-play double-counts or savings."

The 15 keys, exactly as proven (evidence/2026-10-27/
sim-spandraw-design-b.md, pilot + 12-seed confirm):

tracker.track, thief.steal_pantry, game_sense.read_sign,
patient_aim.clean_shot, stalk.stalk_prey,
blood_trail.follow_blood, ambush.lay_wait,
animal_ken.read_beast, scarecrow.stage_injury,
molt.shed_skin, fear_aura.menace,
intimidating_presence.end_it_before, war_cry.challenge,
trophy_room.mark, long_table.share_pot.

Background taken as proven, NOT re-proved: the probe mechanism
(any useAbility span holding a night swallows that night's
meals in a naive direct+meal ledger; the class is timing, not
ability) and the already-wired span-keyed dedup rule. The one
key with a real-play proof remains cultivate (belongseek 9954
replay, 3,820 kcal); this band does not re-judge cultivate.

## What "promotion" means, stated plainly

A key PROMOTES (from PROBE-PROVEN to real-play double-count)
only if, on an UNSCRIPTED competent-policy band, it recurs
with a day-boundary exclusion — that is, it meets the census
PROVEN-SPAN-DOUBLE-COUNT rule in real play: >=1 span with
item-matched exclusion kcal > 0 attributed by applySpanDedup
(match on name/kcalEach/spoilDay, consuming units — amount
matching never counts), the span's enterDay != exitDay, and
>=1 span-internal pantryDraw (drawEnter evt strictly between
span entry/exit). A key that fires in real play but never
crosses a day, or crosses without an item-matched meal
inside, does NOT promote. A key that never fires in real
play does NOT promote. Promotion is per key, judged key by
key; there is no band-level promotion.

## Corpus, policy, horizon (pre-registered)

- Sweep: scripts/sweep-spandraw-census-b.js UNCHANGED, with
  PERSEED_DIR=evidence/2026-10-27/sim-spanpromo-b-corpus/
  (one JSON per seed: spanpromo-b-competent-nofeast-s<seed>.
  json, written with the sweep's pending-flush transport).
  Same competent-nofeast substrate as the census, gated the
  same way: COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, FEASTSCALE_R13 unset/0, POLICY=competent.
  ("Competent policy" here = this substrate, not a
  belongseek/treeline variant, so the band is comparable to
  the census and is not confounded by a regional-politics
  policy's extra ability use.)
- Horizon: DAYS=100 MAXIMUM, death-aware via runDays
  endReason — never a fixed 200d. Justification: 100d is the
  horizon of every prior span corpus (9954 cultnest replay,
  census band), so span rates are comparable, and it is long
  enough for dozens of useAbility spans per seed. A longer
  horizon is NOT spent on this question: the census found
  the competent-policy useAbility surface is cultivate-only
  BY CONSTRUCTION (the only game-code useAbility caller in
  node sims is cultivateGarden, player path; UI buttons live
  in app.js, excluded from node; villager casts bypass
  useAbility). Time cannot conjure a caller that does not
  exist — the pilot tests whether fresh seeds change that
  surface finding, and a longer horizon would only add more
  cultivate spans by the same mechanism.
- Pilot seeds: 10012-10019 (8 seeds). Collision-checked
  before this prereg was committed: no evidence filename and
  no top-level dated .md file mentions any of them as a spent
  seed (10011 was avoided: it appears as a range endpoint in
  sim-ledgerbound-b-prereg.md; 10013's only prior dated-.md
  mention is a call-count column in
  evidence/2026-10-19/release-main67-after-features-r1.md —
  "14479 | 10013 | reached" in a per-action table — not a
  seed, so it is not a collision, and it is disclosed here
  rather than hidden). Fresh, never simulated.
- Confirm band IF the pilot shows signal (see legs): 12
  fresh seeds 10021-10032, same substrate, same horizon,
  judged ONLY on recurrence of the signal key(s). If the
  pilot shows no signal, NO confirm band is run — a
  negative promotion band is a result, not a failure, and
  burning 12-16 seeds on zero signal would add nothing.
- Det-gate leg (neutrality, runs before judging, on one
  pilot seed): scripts/detgate-spanpromo-b.js runs the
  competent policy for the same 100d-max death-aware horizon
  twice in separate processes — instrument OFF (no captures
  at all) vs instrument ON (the census instrument stack:
  inflow + spoilvol + driedpath + stockdoors + mealdraw +
  nest logger, installed exactly as the sweep installs
  them) — and compares daysAlive, endReason, rank,
  waveReach, deaths, deathCauses, national, table, win.
  The leg passes iff all compared fields are IDENTICAL
  (ms excluded). A mismatch is PROOF-RED: the instrument
  is not neutral, and no promotion verdict may be judged
  until it is explained. (The sweep's STOCKDOORS=0 mode
  toggles only the stockdoors install, not the nest logger,
  so it cannot prove nest-logger neutrality — hence the
  dedicated script.)

## Classification and promotion bars (fixed before seeing data)

Per key, from nestEvents + applySpanDedup(payload) per seed
through censusPayload (reused, not re-invented):

- PROMOTED (pilot + confirm): the key meets the census
  PROVEN rule on the pilot band (see "promotion" above)
  AND recurs with an exclusion on the confirm band on >=3
  confirm seeds. Recurrence across seeds is the bar: a
  single-seed real-play exclusion is a candidate, not a
  promotion.
- SINGLE-SEED PROMOTION CANDIDATE: the key meets the PROVEN
  rule on exactly 1 pilot seed, or on 1-2 confirm seeds.
  Reported as such, never rounded up to PROMOTED.
- STAYS PROBE-PROVEN: every other outcome — zero spans,
  spans without a day crossing, crossings without an
  item-matched exclusion, or a day-crossing span whose
  internal draw matches no record item (MIXED-NEEDS-READ
  per the census classifier, never silently promoted).
  Zero firings are attributed, not bare zeros: harness
  (logger/capture install order) vs policy (competent
  policy never taps the key — the census's
  cultivate-only-surface finding, re-tested here) vs engine
  (context/tick suppression/impl behaviour) vs fixture
  (ownership: the key's ability never owned on the band,
  from the post-run abilityOwnership snapshot). The
  ownership split is a post-run observation, stated as
  such: an ability owned mid-run and lost before post-run
  can be missed.

## Legs and GO thresholds (judge ONLY against these)

- LEG 1 — pilot gate (before any confirm spend): GO iff all
  8 pilot seeds complete without sweep crash, every pilot
  payload carries nestEvents, and the analyzer classifies
  every fired key (no unclassified key). If any clause
  fails: KILL or NARROW (report the failing clause, do
  not run the confirm band).
- LEG 2 — promotion judgment: for each of the 15 keys, the
  evidence publishes spans, day-crossing spans,
  span-internal draws, exclusion kcal, seeds with spans,
  seeds with exclusions, classification, and zero
  attribution where zero. A band that meets LEG 2 is a
  completed band even if its answer is "no key promotes" —
  a negative promotion band is reported as such, never
  re-scored as a failure for finding no promotion.
- LEG 3 — confirm (only if >=1 key meets the PROVEN rule
  on >=1 pilot seed): GO iff the confirm band (10021-10032)
  completes without crash and each signal key is judged
  against the PROMOTED bar (>=3 confirm seeds with an
  exclusion). A signal key below that bar stays
  SINGLE-SEED PROMOTION CANDIDATE or PROBE-PROVEN per the
  bars above. If no key meets the PROVEN rule in the
  pilot, LEG 3 is NOT TRIGGERED and no confirm band is run.
- LEG 4 — controls: (a) the det-gate leg passes (OFF vs ON
  identical on one seed); (b) the analyzer re-run on the
  9954 belongseek replay still classifies cultivate as
  PROVEN with 3,820 kcal exclusions (instrument
  consistency, as in the census/design proofs). A failed
  control is PROOF-RED: no promotion claim may be judged
  until it is fixed.

## Before/after and balanced panel (MEASUREMENT.md §15)

This band has NO before/after game leg: zero game changes,
zero lever variants, nothing to panel. The judged comparison
is WITHIN the instrument (real-play spans vs the probe's
boundary spans, same classifier, same dedup rule), and panel
metrics (national/table/wins) are reported as wall numbers
from the band's own payloads (see below), not as a
before/after comparison. So NO balance-panel compare .md is
produced for this arm, as pre-registered here. This
paragraph is the explicit statement required in place of a
panel attachment.

## Sense-testing

If any key promotes, the evidence reads at least one
real-play span trace for that key end-to-end (enter, any
internal draws with frames, exit, exclusions) and judges
real vs artifact, and states in plain words what the
village was doing when the night got swallowed. If no key
promotes, there is no promoted-key transcript to read:
the evidence says so plainly, and instead reads the
longest real-play span trace on the band end-to-end (the
closest real-play span the band actually produced) as the
sense check. No villager transcript claim is made for a
ledger phenomenon unless a transcript line actually names
the span — the cultnest arms already established this
surface is silent in speech, and silence is reported, not
filled in.

## Wall numbers (reported, not estimated)

From the band's own payloads via the analyzer's wall
output: national / table / wins, wave 4-5 reach, median
and max survival, death-cause shares. Stated with the
regime (competent-nofeast, 100d max death-aware) — this is
ledger work, not a reachability claim, and the numbers are
not inflated into one.

## Metric review (MEASUREMENT.md §14 — filled in the evidence)

Pre-registered metrics bind this run; a miss is NO-GO,
never re-scored mid-run. Metric doubts go in the evidence's
"metric review" section for the NEXT run.
