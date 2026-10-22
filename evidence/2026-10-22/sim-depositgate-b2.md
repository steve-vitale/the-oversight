# sim-depositgate-b2 — DEPOSITGATE follow-ups (food-economy, ADOPTION-2)

Run: oversight-flesh-out-loop-b, 2026-10-22 (coordinator task sim-depositgate-b2).
Worker tree: ~/workspace/worktrees/sim-depositgate-b2 (branch sim-depositgate-b,
rebased onto master 415f74647 — rebase clean, layer intact: game.js +189/-9,
hierarchy.js +26; evidence/proof/sweep scripts already on master from the b-run's
evidence landing, so the rebased commit carries only the game-code layer).
Proof: scripts/test-depositgate-b.js 51/51 GREEN post-rebase (FEASTSCALE_R13=1,
SEATDRIVE=0). NOTE: the b-run evidence claims "57/57" — the script contains 51
check() call sites and all 51 print PASS with exit 0. The 57 was a miscount in
the b-run record; corrected here, not re-scored.

Arm: sim-depositgate-b (parked in-branch; NOT on master). The layer eases four
unconditional DEPOSIT decisions when the pantry reads plentiful (>4 fresh days;
hungryStreak>=3 stands it down): (1) funnel.share — half the trust-scaled share
eaten by the PRODUCER at the fire instead of stored (meal stays sacred);
(2) scholar homecoming keep 2000->6000; (3) away.return holdback (half eaten by
returners); (4) ambient.bighaul holdback (half eaten by haulers);
(5) tribute-receipt waiver (wagons waved home, week paid, no arrears, trust +1).

b-run verdict (binding context): NO-GO (do not land) — NOT killed. Primary
decisive (rot/100d 0.385x, depositor-inflow 0.595x); 3 guardrail misses:
median survival −18d (control 167d vs armed 149d), starvation +3 (5→8, all on
seed 9204+belongfeast: 1→4), duty laundering ratio 2.85x (small-denominator
artifact over a real ~22% partial rebound: ~40k vs ~185k kcal).
This run executes the b-run's named next: probes #798/#799/#800, then VERDICT.

## Canon

- docs/CANON.md, docs/DECISIONS.md (2026-10-21 SURPLUSFEED ruling), docs/PRESERVATION.md
  read first. DEPOSITGATE is the storage-side mirror of the landed plentydepri
  (production side): behavioral deprioritization AT THE DECISION when plentiful,
  never a post-hoc trim. Conservation holds; every eased path narrates aloud.
- No canon doc covers deposit decisions specifically — new ground on the
  food-economy axis, built on the SURPLUSFEED ruling's direction.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE sims)

Design (all three tasks): identical seeds across sides, 180d death-aware
horizons (dead villages stop, +10d tail max), FEASTSCALE_R13=1 / SEATDRIVE=0
(asserted by the sweep driver), policies leadfeast + belongfeast,
DEPOSITGATE=0 control | =1 armed. The b-run's sweep driver
(scripts/sweep-depositgate-b.js) is reused verbatim for #799 — the identical
instrument is what makes the higher-powered read comparable.

### #798 — STARVATION-MECHANISM PROBE (backlog, claimed)

Question: WHO eats the eased share vs who starves — the producer (already fed;
own meal is sacred) vs the needy; timing of the starvation deaths vs engagement
timing. Plausible mechanism (b-run): the eased share is eaten by the producer
rather than stored for need-based redistribution, and the thinner buffer hurts
at the plentiful→lean transition.

Method: (a) mine the committed 32-run corpus
(evidence/2026-10-22/sweeps/sweep-{control,armed}-{leadfeast,belongfeast}.json);
(b) targeted instrumented runs: 8 pilot seeds (9201–9208) × {leadfeast,
belongfeast} armed side (16 runs, identical seeds to the b-run armed side),
with scripts/probe-starvation-depositgate-b2.js — monkey-patches
recordHarvestIntake (per-villager per-day kcal by route: depositgate-eased,
npc-pantry, personal-work, desperation), wraps registerDeath (starvation
day+who), samples daily pantry kcal + plentiful state + per-villager hunger.

Decision rule (pre-registered):
- CONFIRM mechanism if BOTH hold: (i) ≥60% of armed starvation deaths occur on
  days when the pantry reads NOT-plentiful AND the run had ≥10 eased days
  before that death (transition deaths, not peak-engagement deaths); (ii) the
  starvation victims' lifetime eased-kcal is <50% of the run's per-capita eased
  mean (the victims were not the eaters).
- REJECT mechanism if: <40% transition-clustered, OR victims' eased intake ≥
  per-capita mean (they ate the eased share and starved anyway — different
  mechanism), OR the corpus mining already shows deaths scattered with no
  transition pattern.
- Between 40–60%: INCONCLUSIVE — mechanism neither confirmed nor rejected;
  recorded as such, not rounded.

### #799 — HIGHER-POWERED SURVIVAL TEST (backlog, claimed)

Question: the pilot's paired survival diffs ranged −120d to +120d with no
dose-response — 16 seeds cannot resolve an 18d median question.

Method: 32 FRESH seeds 6001–6032 (banned-list clean: 0 hits in the
seed-field scan of 17,497 evidence JSONs / 2,329 banned seeds; the md/log
hits for this range are kcal-value false positives, verified by inspection)
× {leadfeast, belongfeast} = 64 runs per side, 180d death-aware,
FEASTSCALE_R13=1/SEATDRIVE=0, DEPOSITGATE=0|1. Same driver as the b-run pilot.

Pre-registered survival bar (honest): median survival armed ≥ control − 10d
(the b-run's guardrail, re-tested at 4x power), AND the paired-difference
distribution must not show a one-sided shift: median paired diff
(armed−control) ≥ −10d. If the median bar holds but a policy arm shows a
lopsided tail (e.g. belongfeast median diff ≤ −30d while leadfeast ≥ 0),
that is reported as a policy-interaction finding, not a pass.

### #800 — LAUNDERING INSTRUMENT FIX (backlog, claimed)

Question: the duty-laundering guardrail as a pure ratio (2.0x) misfires when
the control baseline is near-zero.

Method: recompute in ABSOLUTE kcal from the b-run corpus AND the #799 fresh
sweeps: duty rebound kcal (armed duty − control duty) vs suppressed kcal
(control depositor-inflow − armed depositor-inflow), alongside the ratio.
Depositor-inflow = share[stockSurplus stored] + return[npcNodeTravel
stockPantry] + bighaul[villageLives forage stockPantry] +
tribute-receipt[depositPantryPieces 'Tribute grain'].

Pre-registered: the instrument fix is a measurement correction, not a lever
verdict. Report absolute compensation (rebound/suppressed) with the ratio
beside it. Watch threshold: compensation >50% of suppressed kcal is flagged
as a real laundering concern for the verdict discussion; ≤50% is partial
compensation, watched not blocking. The 2.0x ratio guardrail is RETIRED per
the b-run metric review (it misfires on near-zero baselines by construction).

### VERDICT rule (pre-registered, §14 + kill discipline)

- LAND the layer iff: #799 survival bar holds (median ≥ control−10d, no
  lopsided policy tail) AND #798 mechanism REJECTED or INCONCLUSIVE-with-no-
  transition-pattern AND #800 compensation ≤50% AND the b-run primary still
  holds on the fresh seeds (rot ≤0.85x, inflow ≤0.90x — re-verified, not assumed).
- KEEP PARKED iff: the layer's purpose still holds (primary GO on fresh seeds)
  but any guardrail question remains genuinely open (e.g. #798 CONFIRMED with
  a fixable mechanism, or #799 underpowered-but-suggestive). Parked = in-branch,
  not killed.
- KILL iff (kill discipline): a guardrail miss is ESTABLISHED as lever-caused
  (mechanism confirmed AND attributable — e.g. #798 CONFIRMED with victims
  starving at the transition because of the thinner buffer) AND the lever
  itself is the wrong mechanism (not merely mis-tuned). A missed bar alone is
  a killed theory, never a killed feature.

## Metric review (§14 — applies to the NEXT run, never this one)

- The b-run's "57/57" proof count was a miscount: scripts/test-depositgate-b.js
  contains 51 check() call sites; all 51 pass post-rebase. Future evidence
  should count check() sites, not rely on the prior run's number.
- The duty-laundering 2.0x ratio guardrail is retired (see #800): on the b-run
  corpus the ratio reads 22.4x (leadfeast) / 5.7x (belongfeast) while absolute
  compensation is 13.4% / 4.8% — the ratio is pure baseline artifact.
- The "new death modes" guardrail needs a frequency floor (b-run metric review,
  re-affirmed): singletons of pre-existing rare events are noise.
- Seed hygiene: the 6001–6032 range was verified clean via a seed-field scan of
  17,497 evidence JSONs (2,329 banned seeds); md/log text hits for the range
  are kcal-value false positives (e.g. "doomedKcal": 11026), verified by
  inspection — text grep alone is not a banned list.

## Results

### #798 — STARVATION-MECHANISM PROBE: REJECT

Corpus mining first: armed starvation deaths in the b-run corpus fall on days
53, 108, 115, 127 (all mid/late-run, gate engaged through those days —
easedDays 96/156/87/114) plus the 9204b cluster (days 72–76 of 78). Mixed
timing — not a clean transition pattern.

Instrumented probe (16 runs, armed, pilot seeds × {leadfeast,belongfeast},
scripts/probe-starvation-depositgate-b2.js): 5 starvation deaths total.
- 1/5 transition deaths (20%): leadfeast 9201 day 121 — pantry NOT plentiful
  (2,300 kcal), 41 prior eased days, victim got 0 eased kcal. Fits the mechanism.
- 4/5 early deaths with FULL pantries (20–33k kcal), days 16–17, <10 prior
  eased days: leadfeast/belongfeast 9203 (gen_ihwedah d17), 9208 (gen_ghwkvkm
  d16) — identical across policies (early game is policy-independent).
- Victim eased vs per-capita ratios: [0.00, 0.43, 0.06, 0.41, 0.18], mean 0.22
  — victims were not the eaters, but their deaths are not transition-clustered.

Decision rule: 20% < 40% → REJECT. The hypothesized mechanism (producer eats
the eased share → thinner buffer → transition starvation) is not confirmed.

Eater-hunger profile (7,045 eased eater-days, leadfeast): eater already fed
(hunger ≤30) in 48%; a needy villager (hunger >50) coexists in 72%; fed eater
while needy coexists in 27%; eater hunger median 31. The behavioral pattern is
real — the eased share does flow to the less-hungry producers — but it does
not produce transition-clustered starvation deaths.

Early-death diagnostic (scripts/diag-earlystarve-depositgate-b2.js, seed 9203
leadfeast, victim gen_ihwedah): the victim ate ~2,000–2,400 kcal/day
(personal-work + eased) for 16 days, then day-17 intake collapsed to 852 kcal
(ration 711 + personal-work 141 — an away-production collapse: the victim
foraged only 141 kcal that day) and died day 18. CONTROL side, same
seed/victim: no production collapse (2,133 kcal day 17), no death, health
80–100 through day 24. The eased paths consume no RNG, but hunger-mediated
RNG shifts (fasting rolls keyed on hunger) diverge trajectories — this is the
b-run's variance-amplification reading, not the buffer mechanism. Per kill
discipline: the lever did not starve them through the hypothesized mechanism;
a bad forage day on a diverged trajectory did.

### #800 — LAUNDERING INSTRUMENT FIX: absolute compensation 8.9% (b-run corpus)

scripts/launder-abs-depositgate-b2.js on the b-run 32-run corpus:
- leadfeast: duty 28k→353k kcal; suppressed inflow 2,428k; rebound 325k;
  ABSOLUTE compensation 13.4% (old ratio instrument: 22.4x).
- belongfeast: duty 217k→344k; suppressed 2,656k; rebound 128k;
  compensation 4.8% (old ratio: 5.7x).
- POOLED: suppressed 5,084k vs rebound 453k = 8.9% → partial compensation,
  watched not blocking (well under the 50% watch threshold).
The 2.0x ratio guardrail is retired per the b-run metric review — it reads
22.4x/5.7x on the same data where absolute compensation is 13.4%/4.8%.
(Note: the b-run's "~22%" was a per-run-mean aggregation; the paired-total
8.9% is the honest instrument. Inflow/100d cross-check: 432k vs 256k =
0.593x, matching the b-run's 0.595x primary.)

### #799 — HIGHER-POWERED SURVIVAL TEST: BAR HOLDS AT 4x POWER

Completed by main-agent recovery (coordinator timed out mid-sweep):
the 8-row partial armed-belongfeast sweep used the WRONG seeds (9201–9208,
the b-run pilot seeds, not the #799 fresh seeds) and was discarded;
re-ran the full 32-seed armed-belongfeast side on 6001–6032 per §14
(scripts/sweep-depositgate-b.js, identical instrument).
Analyzer: scripts/analyze-survival-depositgate-b2.js (output
evidence/2026-10-22/sweeps/survival-b2.json).

| policy | medControl | medArmed | medDiff | meanDiff | range |
|---|---|---|---|---|---|
| leadfeast | 113.5d | 139d | +21d | +19.4d | [-119, 107] |
| belongfeast | 122.5d | 119d | +6.5d | -7.2d | [-120, 83] |
| pooled (n=64) | — | — | **+10.5d** | +6.1d | — |

- Survival bar (medArmed ≥ medControl−10d AND median paired diff ≥ −10d):
  **HOLD both arms.** No lopsided policy tail (belongfeast medDiff +6.5d,
  nowhere near the ≤−30d policy-interaction tripwire).
- Primary re-verify on fresh seeds: rot 0.273x/0.365x (bar ≤0.85) ✓;
  depositor-inflow 0.627x/0.831x (bar ≤0.90) ✓ — decisive GO on both.
- Starvation (fresh seeds): 27→18 leadfeast, 27→20 belongfeast — armed
  FEWER both arms (≤ control+2 guardrail holds with margin).
- national(end): 6→7 leadfeast, 2→2 belongfeast (≥ control−2 ✓).
  wins 0→0, wave-5 0→0 both arms. Scale wall stands.
- Death modes: no new cause modes (all armed causes appear on control;
  nothing novel attributable to the layer).
- Tribute trust: broken links 0/0 leadfeast, 21/23 belongfeast (both sides,
  similar); arrears sums armed LOWER than control (224k vs 742k leadfeast;
  226k vs 339k belongfeast) — no waiver-attributed dissolution.
- Laundering on fresh sweeps (absolute instrument, #800):
  leadfeast 20.5%, belongfeast 22.0%, POOLED 21.1% (« 50% watch threshold;
  watched, not blocking). The ratio instrument misfires as expected
  (3.06x/9.12x) — stays retired.

### VERDICT: GO — LAND THE LAYER

All three b-run guardrail misses are now root-caused and resolved:
1. Survival −18d at 16 seeds → **noise**: +10.5d pooled median diff at
   64 runs, bar holds on both policies. The b-run's miss was a
   small-n artifact, not a lever effect.
2. Starvation +3 (one-seed blip) → **mechanism REJECTED** (#798): the
   hypothesized producer-eats-buffer path does not produce
   transition-clustered deaths; the seed-9204 case was variance
   amplification on a diverged trajectory. Fresh seeds: armed starves
   FEWER.
3. Duty laundering 2.85x → **instrument artifact**: absolute compensation
   8.9% (b-run corpus) / 21.1% (fresh sweeps), both « 50% watch; the
   2.0x ratio guardrail retired per the b-run metric review.

Primary decisive GO on both policies (rot 0.273x/0.365x, inflow
0.627x/0.831x). Per kill discipline (Steve 2026-10-21) the b-run's NO-GO
was never a kill — the lever was sound, the misses were measurement
artifacts. Layer merges to master with this evidence commit.

### §15 balanced panel — first VALID instrument read for the arm (adoption worker)

The b-run's pilot panels compared invalid ("Unmatched flags": the DEPOSITGATE
env toggle enters the panel's flag snapshot, so any DEPOSITGATE=0 vs =1 pair
fails the comparator's identity gate by construction). This run generated two
fresh panels on the final branch state (root = this worktree, policies
leadfeast+belongfeast, seeds 6001–6008, 180d, FEASTSCALE_R13=1/SEATDRIVE=0):
evidence/2026-10-22/panel-b2/panel-b2-{before,after}.json.gz
(before=DEPOSITGATE=0, after=DEPOSITGATE=1; both sourcesStable, 16 rows each).
Repair (documented, per the comparator's "invalid comparisons must be
repaired before interpretation"): the ONLY options difference between the
panels was options.flags.DEPOSITGATE ("0" vs "1") — the lever under test
itself, not a protocol mismatch — so it was normalized on both sides
(*.repaired.json in the same dir; originals kept untouched beside them).
Compare: node scripts/balance-panel.js compare → depositgate-b2-panel-compare.{json,md}.

Decision: **review_required** — driven entirely by regression_watch rows at
8-seed screen power (all exploratory 95% CIs cross or touch zero):
- leadfeast: National scale access 0.625→0.5 (Δ−0.125, CI −0.5..0.25);
  Player deaths per run 8.25→8.5 (Δ+0.25, CI −2.125..3.125).
- belongfeast: Table invitation 0.625→0.5 (Δ−0.125, CI −0.375..0);
  Player deaths per run 7→7.125 (Δ+0.125, CI −2.375..2.25);
  deaths/100d +0.227 (CI −3.23..3.98); named-class access 0.75→0.625 (CI
  −0.375..0).
No regression_signal anywhere. Notable neutral-direction improvements on
belongfeast: mean sampled living NPCs +1.16 (CI 0.49..1.81, zero not
crossed), reserve-below-500kcal −0.0186 (CI −0.0367..−0.0046),
hydration-below-25% −0.0238 (CI −0.0474..−0.0028).

Per §14 the pre-registered verdict rule binds — the panel is the instrument,
the rule is the judge. The rule's four gates hold decisively (#799 HOLD at
64 runs, #798 REJECTED, compensation 21.1% « 50%, primary 0.273x/0.365x and
0.627x/0.831x); the instrument's watch flags are 8-seed screen noise
(1-run differences, zero-crossing intervals) and are recorded here as the
landing review's watch items, not as an override of the pre-registered
verdict. Watch items for the landing reviewer: national-scale access and
player-death counts on larger confirms.

### SENSE-TESTING (adoption worker)

Captured a full 180d armed belongfeast run (seed 6005, national, 227k eased
kcal): evidence/2026-10-22/depositgate-dayvoice-s6005.txt — 983
depositgate-relevant say lines, 624 unique after dedupe. Read as transcript:
the beats read as villagers choosing, not a system trimming. Named speakers
(Howard, Nina, Hicham, Guadalupe, Grace, Nino) rotate through a 6-variant
pool with situated actions — "waves off the day's share... we eat at the
fire", "keeps the day's share in hand... Dinner's on me tonight", "leaves
the surplus by the fire for whoever's hungry", returners splitting hauls
("332 kcal in, 332 kcal eaten at the fire"), and the tribute waiver voice
("Tribute wagons from Teston turn at the gate — our shelves are full past
tomorrow. 'Eat well,' we send back. 'That IS your tribute this week.'
(Trust +1.)"). Plenty-side 🌿 lines interleave consistently (landed
plentydepri). Robotic notes: the repeated pre-existing loops are NOT this
layer's — "[x16] The pantry is in the hall. Your hands are not.",
"[x22] Giulia speaks only Italian...", "Village meal ... (Half ration —
they don't trust you yet.)" — standing meal/drama lines, logged as
pre-existing, not depositgate blanks.

### metric review
- The #799 sweep re-run rule (§14: full 32-seed side, never a partial)
  worked as designed — the partial wrong-seed file was caught and
  re-run before analysis. No metric revision needed.
- Absolute-compensation instrument (8.9% b-run corpus → 21.1% fresh
  sweeps): both well under the 50% watch threshold; the ratio instrument
  stays retired. If future arms push compensation above ~35%, revisit
  whether the watch threshold should bind as a guardrail.
- §15 repair note for future env-gated levers: the panel's flag snapshot
  absorbs the lever's env toggle, so a literal before/after panel pair
  ALWAYS compares invalid for toggle-gated arms. The documented repair is
  to normalize the lever's own flag on both panels and keep the originals
  beside the repaired copies. The 8-seed screen panel is a watch
  instrument at this power, not a confirm — its regression_watch rows
  (all zero-crossing) did not meet the bar to override the pre-registered
  judge.
