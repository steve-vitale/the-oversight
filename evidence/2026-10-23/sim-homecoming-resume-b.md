# sim-homecoming-resume-b — resume + DIAG verdict for sim-homecoming-diag-b

Run: oversight-flesh-out-loop-b-20261023T2030Z (cron), axis food-economy, ARM 1 of 3.
Worker tree: ~/workspace/worktrees/sim-homecoming-resume-b (branch sim-homecoming-resume-b).
DIAG — MEASUREMENT ONLY, zero src/js changes, ever. This run resumed the
timed-out sim-homecoming-diag-b sweep and delivered the analyzer verdict.
The pre-registration in evidence/2026-10-23/sim-homecoming-diag-b.md BINDS
this resume; the bar did not move.

## Completion log

- Corpus at resume: 57/128 (pd0dg0 14+16, pd0dg1 7+16, pd1dg0 0+2, pd1dg1 0+2).
  Missing seed lists computed per cell/policy from the directory itself
  (NOT from the task brief's counts): pd0dg0/belongfeast 92815-92816 (2),
  pd0dg1/belongfeast 92808-92816 (9), pd1dg0/belongfeast 92801-92816 (16),
  pd1dg0/leadfeast 92803-92816 (14), pd1dg1/belongfeast 92801-92816 (16),
  pd1dg1/leadfeast 92803-92816 (14) = 71 configs.
- Proof: scripts/test-homecoming-diag-b.js GREEN (46 PASS, 0 FAIL) BEFORE any
  sims — channel identities, determinism, corpus reproduction all hold.
- Substrate pinned on every invocation: FEASTSCALE_R13=1 SEATDRIVE=0,
  PLENTYDEPRI/DEPOSITGATE explicit per cell (asserted FATAL in the sweep).
- 6 parallel sweep processes (one per cell/policy), ~2.4 min/seed — all exit 0.
  Corpus verified 128/128, every cell/policy 16/16, before analysis.
- Correction to the resume instructions: sweep-homecoming-diag-b.js has NO
  skip-existing logic (grep: no "resumed"/"existsSync"; the "+32 resumed" log
  line cited in sim-homecoming-diag-b.md belongs to sibling sweep scripts).
  The resume therefore worked by passing EXACTLY the missing seeds via SEEDS=
  — no config was re-run, no file was overwritten by this resume.
  (The proof test's pilot re-ran pd0dg0/leadfeast+s92801/92802 twice and the
  easingchannels corpus repro s9250; determinism identical, s9250 file deleted
  after — net corpus unchanged.)
- Analyzer: scripts/analyze-homecoming-diag-b.js → exit 1 (verdict below).
  Wrote evidence/2026-10-23/homecoming-diag-b-analyzer-report.json.
- Balanced panel §15: ran scripts/balance-panel.js before/after on the DG=1
  cells (seeds 92801,92802 × {leadfeast,belongfeast}, 100d; before
  PLENTYDEPRI=0, after PLENTYDEPRI=1). Compare decision: **invalid —
  "Unmatched flags"** (exit 2), exactly the documented #797 invalidity
  (env-gated lever changes the flag snapshot by construction; identical
  code). Compare .md:
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-homecoming-diag-b/panel-hc-b-compare.md
  Per pre-registration the metric is NOT re-scored: the manual paired-row
  attribution below IS the comparison.

## The question (from sim-easingchannels-b)

"SCHOLAR HOMECOMING THROTTLED BY PRODUCTION EASING — on DG=0 cells the
decomposition shows scholarHomecoming falling under PD=1 — production
easing reaches surplus-driven scholar homecoming deposits, not just the
funnel.share raw channel."

## Analyzer verdict: DIAG-NO-GO

DIAG-GO required: scholarHomecoming FULLY attributed per cell (sub-channels
named, which throttle under PD=1 and which don't), the engagement-ledger
contrast with the funnel.share throttle drawn, and 0 unexplained cells.

The analyzer flags 5 unexplained cells, all check (c) — "channel/identity
drift" (per-seed total identity hc.deposit === glutChannels.scholarHomecoming
holds EXACTLY on all 128 seeds, proof-tested 46/46 green; the drift is in
the analyzer's per-glut-day MEDIAN comparison — see Metric review):

- leadfeast/dg1: pd0 channel/gd 347 vs deposit/gd 271
- leadfeast/dg1: pd1 channel/gd 236 vs deposit/gd 88
- belongfeast/dg0: pd1 channel/gd 948 vs deposit/gd 632
- belongfeast/dg1: pd0 channel/gd 370 vs deposit/gd 163
- belongfeast/dg1: pd1 channel/gd 83 vs deposit/gd 0

Per §14 the miss is DIAG-NO-GO, never re-scored.

## Per-cell attribution table (median kcal per glut-day, PD=0 -> PD=1)

Identity check (b) — deposit Δ vs brought−kept−spoiled Δ — PASSED on all 4
cells. The sub-channel decomposition of the PD=1 deposit Δ is:

### leadfeast/dg0 (n=16/16)
deposit 152 -> 71 (Δ -81). brought 1134 -> 896 (Δ -238, supply-side throttle
dominates); kept 979 -> 802 (Δ -177); keepRaise 0 -> 0 (0 by construction);
spoiled/capStranded 0. decisions/gd 0.78 -> 0.72 (Δ -0.06); brought/decision
1584 -> 1180 (Δ -404). Identity: -81 vs -61. → The throttle is SUPPLY-SIDE:
the scholar brings less home; fewer returns AND smaller hauls.

### leadfeast/dg1 (n=16/16)
deposit 271 -> 88 (Δ -183). brought 1406 -> 1189 (Δ -217, supply side);
kept 1080 -> 989 (Δ -91); keepRaise 304 -> 210 (Δ -94, DG-side throttle;
events 14.5 -> 8.5). decisions/gd 0.55 -> 0.58 (Δ +0.03); brought/decision
2403 -> 2266 (Δ -137). Identity: -183 vs -126. → TWO throttles: supply-side
brought Δ plus the DG-side keepRaise Δ (the 2000→6000 raise withholds more
deposit under PD=0's larger hauls; under PD=1 hauls shrink so the raise
engages less).

### belongfeast/dg0 (n=16/16)
deposit 46 -> 632 (Δ +587). brought 815 -> 1325 (Δ +510); kept 762 -> 765
(Δ +3); keepRaise 0 -> 0. decisions/gd 0.67 -> 0.67 (Δ -0.00);
brought/decision 1213 -> 2132 (Δ +919). Identity: +587 vs +507. → The
channel RISES under PD=1 here: hauls get BIGGER (brought/decision +919)
while kept stays flat, so the deposit swells. Same-engagement, bigger hauls.

### belongfeast/dg1 (n=16/16)
deposit 163 -> 0 (Δ -163). brought 1019 -> 1045 (Δ +26, supply flat);
kept 810 -> 979 (Δ +169); keepRaise 200 -> 120 (Δ -81; events 6.5 -> 8.5).
decisions/gd 0.56 -> 0.61 (Δ +0.05); brought/decision 1795 -> 1447 (Δ -347).
Identity: -163 vs -143. → The throttle is KEEP-SIDE: same supply, but the
scholar keeps +169/gd more (deposit median falls to 0 — over half the pd1
seeds deposit nothing on glut days; e.g. s92816 kept all 20,565 brought).

## Funnel.share engagement-ledger contrast

The funnel.share throttle is an order of magnitude larger than homecoming:

- leadfeast/dg0: share/gd Δ -2141 | PD-side depri/gd 0 -> 2462 (Δ +2462) | DG-side eased/gd 0
- leadfeast/dg1: share/gd Δ -1052 | depri 0 -> 2629 (Δ +2629) | eased 2328 -> 1280 (Δ -1048)
- belongfeast/dg0: share/gd Δ -1504 | depri 0 -> 2623 (Δ +2623) | eased 0
- belongfeast/dg1: share/gd Δ -1075 | depri 0 -> 2389 (Δ +2389) | eased 2086 -> 1014 (Δ -1073)

Contrast drawn: funnel.share = PD-side depriKcal throttle + DG-side
funnelShareEased throttle; scholarHomecoming = PD-side brought Δ +
DG-side keepRaise Δ. Production easing reaches the homecoming channel
through the SAME two-sided structure as the funnel share — deprioritized
production on the PD side, and the deposit gate on the DG side — but the
homecoming PD-side leg runs through the scholar's pack (brought/kept),
not through villager harvest shares.

## Seed-block note (vs the motivating observation)

sim-easingchannels-b (seeds 9250-9265) reported scholarHomecoming FALLING
under PD=1 on DG=0 (-590 leadfeast, -195 belongfeast kcal/glut-day). On
this block (92801-92816): leadfeast/dg0 deposit Δ -81 (falls, much smaller)
and belongfeast/dg0 deposit Δ +587 (RISES — channel/gd 57 -> 948). The
homecoming PD=1 response is seed-block sensitive, especially on belongfeast:
driven by brought/decision (+919 here), a supply-composition effect, not a
gate effect. Named for the next lever arm: the throttle sign on
belongfeast/dg0 is not stable across seed blocks.

## Guardrails (watch, report-only)

- (a) paired survival-diff ≥ −10d: GO all 4 (median survival 100d → 100d on
  every cell; death-aware horizons, +10d tail max).
- (b) exposure-normalized starvation ≤ control + 2/(armedVD/100): MISS on
  leadfeast (lead/dg0 1.683 vs 1.562+0.014; lead/dg1 1.514 vs 1.148+0.014 —
  +0.12–0.37 starve-days/100vd), GO on belongfeast (1.439 ≤ 1.948;
  1.427 ≤ 1.637). Watch-only; the bar is 2 starve-days across the whole
  armed corpus. No survival collapse accompanies the misses.
- (c) no new death modes: GO at mechanism level — pd1 cause-families ⊆ pd0
  mechanism families (starvation/combat/monster/sickness/dehydration/
  contest/ambush). The pd1-only names (highbeam deer, dustboar, judge hoot,
  nevermore, the algorithm, the paparazzo, the night) are monster/event
  roster samples varying by seed, not new death mechanisms.
- (d) national ≥ control − 2: GO all 4 (14→14, 13→11, 5→6, 3→5).
- (e) freshDays ≥ 0.5× control: GO all 4 (15.95≥9.23, 5.75≥4.23,
  8.70≥5.93, 4.95≥2.83 — the expected easing dip, not a collapse).

## Scale wall (per cell, n=16)

national / table / win / wave4 / wave5 / median survival:

- leadfeast/pd0dg0: 14 / 10 / 0 / 9 / 0 / 100d
- leadfeast/pd1dg0: 14 / 8 / 0 / 9 / 0 / 100d
- leadfeast/pd0dg1: 13 / 4 / 0 / 10 / 0 / 100d
- leadfeast/pd1dg1: 11 / 7 / 0 / 7 / 0 / 100d
- belongfeast/pd0dg0: 5 / 9 / 0 / 9 / 0 / 100d
- belongfeast/pd1dg0: 6 / 11 / 0 / 5 / 0 / 100d
- belongfeast/pd0dg1: 3 / 11 / 0 / 10 / 0 / 100d
- belongfeast/pd1dg1: 5 / 8 / 0 / 10 / 0 / 100d

The wall stands on this substrate: wave-5 unlocks 0/128, wins 0/128
(SEATDRIVE=0 pre-seat substrate; wins structurally absent). Arc IV reach
4–11/16 per cell. Exiled 0/128. Death causes dominated by combat/monster
(≈60%) and starvation (≈15%); sickness, dehydration, contest, ambush trail.
Median survival is horizon-capped at 100d on all 8 cells; village-lost ends
occur (e.g. pd1dg1/leadfeast s92815 lost at d97 with rank global).

## Sense read (SENSE-TESTING LAW)

The homecoming decision is voiced in-fiction and the beats read sensibly.
The scholar IS the player ("You keep a day's food (540 kcal) — nothing
extra for the pantry this time."), and the numbers track the measured
sub-channels: small hauls → keep-all beats (540–2,220 kcal kept, nothing
for the pantry); big hauls on DG=1 → the keep ceiling shows ("You keep a
day's food (5940 kcal) and unload 6300 kcal into Haven's pantry." —
keep ≈ 6000, the DG raise, named in the line). Return trips by other
villagers are voiced alongside ("Meera returns from foraging the wilds:
+152 kcal to the pantry — the shelves are full, so 152 kcal is eaten at
the fire instead."), which is the funnel.share/awayReturn counterpart to
the scholar's own decision. No robotic repeats beyond the expected
formulaic shape of return beats; names, tasks, and kcal vary. One honest
edge: the "nothing extra for the pantry" beat fires even when the keep
was forced by a small haul, which reads fine — it reports the outcome,
not the cause. SENSE VERDICT: sensible — the homecoming beats are legible,
kcal-honest, and the DG=1 keep ceiling is visible in the narration.

## Village assessment (assess and fill blanks)

The villages on this substrate are glut-fed and long-lived: median 100d
survival everywhere, rot/100d 8k–275k kcal (leadfeast rots far more than
belongfeast), freshDays 5–18. The scholar is a major pantry artery on
belongfeast/dg0 under PD=1 (+587/gd deposit, the rising cell) and a
shrinking one on leadfeast/dg1 (-183/gd). Nobody starved out; the binding
pressure is combat/monster deaths in wave 3-4, not food. The blank this
DIAG fills: the homecoming channel is now decomposed kcal-by-kcal —
production easing reaches it through brought (PD side) and keepRaise
(DG side), and on belongfeast/dg1 through kept. The blank it documents
but does not fill: the belongfeast/dg0 sign flip across seed blocks
(-195 on 9250-9265, +587 on 92801-92816) — the next lever arm on this
channel should use the pooled block or pre-register the block.

## Metric review (§14)

- The DIAG-NO-GO is a METRIC-CONSTRUCTION miss, not an attribution miss.
  Verified: per-seed total identity hc.deposit === glutChannels.scholarHomecoming
  holds EXACTLY on all 128 seeds (the proof's 46/46 green extends to the full
  corpus — checked cell by cell). The analyzer's check (c) compared
  median(glut-scoped deposit / glutDays) against median(full-horizon channel
  / glutDays). The gap between them is deposits the scholar makes on
  NON-glut days — real deposits that never enter the glut-inflow accounting
  by design (e.g. belongfeast/dg1/pd1: channel/gd 83 vs glutDep/gd 0; the
  scholar still deposited on 37 decisions, just not on glut days).
  Substantively this is a second finding: a large share of scholarHomecoming
  deposits happen outside glut days — the "surplus-driven" framing of the
  motivating question is only half the channel.
- Proposed revision for the NEXT run: compare like-with-like —
  median(full-horizon deposit / glutDays) vs median(channel / glutDays)
  (verified identical here: 347=347, 236=236, 57=57, 948=948, 370=370, 83=83),
  or scope the channel to glut days (glutDeposit vs glut-channel). Either
  makes check (c) a true identity check again. The identity check (b)
  (deposit Δ vs brought−kept−spoiled Δ) is the correct attribution instrument
  and passed on all 4 cells.
- The DIAG question itself — which sub-channels throttle under PD=1 — IS
  answered (brought Δ dominates on DG=0; brought Δ + keepRaise Δ on DG=1;
  kept Δ on belongfeast/dg1). The bar's "0 unexplained cells" clause is
  what failed, on the scope artifact above. Per §14 the bar stands for
  THIS run; the revision applies to the next.
- Balanced panel §15 invalid by construction (#797) on DIAG corpora —
  the invalid compare .md is attached (path above); the manual paired rows
  are the comparison, as pre-registered.

## Findings for the coordinator

1. Verdict to land in the tracker: this axis's DIAG arm = DIAG-NO-GO
   (metric-scope miss; attribution itself complete — see metric review).
2. sim-findings.md gets one line: the belongfeast/dg0 sign flip across seed
   blocks (named next: pooled-block lever arm).
3. The corpus (128/128 per-seed JSONs) + analyzer report + panel compare
   are committed with this run's evidence. No src/js was touched (DIAG).
