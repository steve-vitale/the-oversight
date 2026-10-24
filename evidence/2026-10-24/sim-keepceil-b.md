# sim-keepceil-b — KEEPCEIL keep-ceiling volume knob (lever loop B, 2026-10-24)

Run: fleshout-loop-b-20261024T0812Z, arm sim-keepceil-b. Worker branch
`sim-keepceil-b`. Coordinator merges via --ff-only; this worker does NOT
push, bump, or verify live.

VERDICT: KILLED AT PILOT (pilot NO-GO, 8 failed checks — §9: no confirm
spend). Classification per §14a: CONCEPT-DEAD AS SPECIFIED (the run-level
volume-knob claim — monotonic run-level steering of channel volume — is
falsified on the primary cell by a demonstrated feedback loop), with
METRIC-BROKEN components (engagement bar unachievable even on control;
OFF-identity analyzer bug, repaired). Game-code layer REVERTED TO ZERO
TRACE (src/js/game.js byte-identical to pristine master; kill-state proof
green). Instruments, corpus, and this evidence file remain as the record.

## Canon read

- docs/CANON.md first. No canon doc covers the scholar homecoming keep
  ceiling specifically — the ceiling is a landed mechanism (DG=1 raise
  2000→6000), specified in evidence/2026-10-24/sim-homecoming-vol-b.md
  ("Named-next lever SPEC: keep-ceiling volume knob"), not a Steve canon
  doc. Nearest canon: docs/PRESERVATION.md (food ladder: kept food is pack
  food; spoilage clocks travel with it — the kept share is NOT pantry
  stock, it stays in the scholar's pack) and docs/BALANCING.md (levers).
  Nothing invented: the lever only parametrized the existing raise.
- Substrate docs: docs/MEASUREMENT.md §§9–12, 14–15 (staged, death-aware,
  pre-registered, metric binding, balanced panels).

## The lever (as built, then killed)

`src/js/game.js`, scholar homecoming keep block only (the
`returnToVillage` keep/give split; the `returnToOldVillage` 2000 ceiling
is a DIFFERENT decision — exile amends, no gate — and was untouched):
before, `if (_depositGateEngaged()) KEEP_KCAL = 6000`; the arm changed it
to `KEEP_KCAL = _keepCeilingKcal()`, where the helper returned 6000 when
KEEPCEIL was unset/empty/non-numeric/<=0 or there was no `process`
(browser), else the parsed value. No RNG, no state writes, read only
inside the engaged branch. Zero namespace overlap with sibling arms
(pdvalue-*, pddrift-*) and loop A arms (aidcrisis-*, postunlock-*).
KILLED: both hunks reverted; `git diff` on src/js/game.js is empty and
`grep -c KEEPCEIL src/js/game.js` is 0.

## PRE-REGISTRATION (§14 binds — written before any sweep)

- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (pre-seat regime: wins
  structurally 0 — stated, not chased), PLENTYDEPRI=0 explicit (the keep
  channel in isolation; PD unset would silently arm the landed PD=1
  default), DEPOSITGATE=1 explicit (the ceiling binds only on DG=1 cells).
- Design: KEEPCEIL ∈ {4000, 6000, 8000} × policies {leadfeast,
  belongfeast}, 100d death-aware horizons (mid-game lever per §10;
  baseline median survival sits at the 100d cap on this substrate, so
  100d is the binding horizon, not a truncation).
- Seeds: pooled block 1, 9250–9265 (16 seeds). JUSTIFICATION (one choice,
  not mixed): the spec's pooled-block lesson says to use the pooled set
  for cross-arm comparability, and KEEPCEIL is a NEW dimension — no prior
  corpus ever varied it, so these seeds are fresh WITH RESPECT TO THIS
  LEVER's variation; identical-seed pairing against the depinteraction /
  depositrelief / bufferdepri corpora on the same substrate and policies
  is the point. Pilot = seeds 9250–9257 (8 seeds, all 6 cells) + kcoff
  leadfeast (OFF-identity control, 8 seeds); confirm = seeds 9258–9265
  added only on a pilot GO. Pilot is staged INSIDE the block, not a
  separate seed set.
- Instrument: scripts/homecoming-instruments-b.js reused UNCHANGED
  (attachEC): hc brought/kept/deposit/keepRaise/keepRaiseEvents per
  glut-day and per decision, plus the depositrelief-style per-seed schema
  (rot fresh/preserved, freshDays, death causes, national, table, win,
  wave reach). keepRaise is defined against the FIXED 2000 base ceiling
  (kept−2000 on raise-engaged decisions), so it stays comparable across
  KEEPCEIL levels: 4000 caps it at 2000, 6000 at 4000, 8000 at 6000.
- Primary metric (one): glut-scoped homecoming channel volume —
  hc.glutDeposit per glut-day (kcal deposited into the pantry on
  plentiful days), per policy, identical seeds.
- GO threshold (pilot gate, all must hold; judge against this header):
  (i) CHANNEL BINDS: per policy, mean glutDeposit/gd STRICTLY
  decreasing in KEEPCEIL: 4000 > 6000 > 8000 (the ceiling binds — more
  ceiling, less deposit). (ii) NO ROT REGRESSION: fresh-rot/100d at
  4000 and 8000 ≤ the 6000 cell on BOTH policies (a volume knob must not
  buy deposits with rot). (iii) GUARDRAILS (depinteraction (a)–(e),
  adapted: 6000 is the control): paired survival diff (armed−control)
  ≥ −10d median per policy; exposure-normalized starvation ≤
  control+2/(armedVD/100); no new death modes (armed cause-families ⊆
  pooled control corpus); national(end) ≥ control−2 per policy;
  freshDays median ≥ 0.5× control. (iv) ENGAGEMENT: keepRaiseEvents > 0
  on ≥7/8 pilot seeds per (policy × KEEPCEIL) cell, ≥14/16 at confirm.
  (v) OFF-IDENTITY: KEEPCEIL-unset pilot runs (leadfeast, 8 seeds)
  behaviorally identical per-seed to KEEPCEIL=6000 leadfeast pilot runs.
- Verdict rule: GO iff (i)–(v) all hold at confirm (pilot GO required
  first). Any miss = NO-GO per §14 (never re-scored mid-run; doubts go
  under "metric review"). Pilot miss = killed-at-pilot, classified per
  §14a, layer reverted to zero trace.
- §15 panel: a balance-panel compare was ATTEMPTED
  (scripts/balance-panel.js, leadfeast, seeds 9250–9251, 100d, before =
  KEEPCEIL unset, after = KEEPCEIL=4000, separate out-dirs); result:
  decision INVALID, errors ["Unmatched flags"] — the #797
  invalid-by-construction outcome for env-gated levers. The compare .md
  + .json are attached (evidence/2026-10-24/keepceil-b-panels/); the
  cases/ caches are NOT committed. Manual paired rows (analyzer output
  below) are the judge, per the pre-registration — the run is NOT
  re-scored, and the invalid panel is not a gate.

## Hook proof (pre-kill mechanism proof, green in-branch)

scripts/test-keepceil-b.js ran GREEN before the kill (13 mechanism checks
+ fixture checks): DG=0 keeps base 2000 whatever KEEPCEIL says; DG=1
keeps exactly KEEPCEIL for 4000/6000/8000; KEEPCEIL unset vs 6000 gives
identical kept AND identical sanitized full-state hash (OFF-vs-pristine
byte check); invalid values ('banana', '', '0', '-500') fall back to
6000. The per-decision valve binds exactly as specified — the kill is
about run-level steering, not the hook. After the revert, the same script
rewritten to kill-state checks runs GREEN: _keepCeilingKcal absent,
landed behavior intact, KEEPCEIL env IGNORED on DG=1 (4000/8000/'banana'
all keep 6000) and DG=0 keeps 2000.

## Pilot results (8 seeds, 6 cells + kcoff control — NO confirm spend)

Corpus: evidence/2026-10-24/keepceil-b-corpus/ (56 per-seed JSONs +
7 summaries; pilot log keepceil-b-pilot-log.txt; analyzer output
keepceil-b-pilot-analyzer.txt). Analyzer: EXPECTED_SEEDS=pilot 8,
ENGAGE_MIN=7 → VERDICT: NO-GO (8 failed checks). Channel-identity gap
0 kcal on every seed (hc.deposit == choke-point channel exactly).

Primary — mean glutDeposit per glut-day (kcal/gd):
- leadfeast: 4000 = 134.0, 6000 = 140.8, 8000 = 138.1 — FLAT, NOT
  monotonic. FAIL (i). Medians tell the same story (82.7 / 22.3 / 12.2 —
  the means are single-seed driven).
- belongfeast: 4000 = 565.7, 6000 = 463.1, 8000 = 336.6 — strictly
  decreasing. PASS (i) on belongfeast, but GO requires BOTH policies.

Paired per-seed leadfeast (glutDeposit totals; the mechanism, seed by
seed):
- 9250, 9257: trajectories IDENTICAL across ceilings (deposits 0) —
  ceiling never binds (hauls below 4000).
- 9251, 9252: trajectories diverge; deposits appear at 4000 (16930 /
  1140 total) where 6000/8000 are 0 — the valve binds in the expected
  direction.
- 9254, 9256: textbook monotonic totals (6435 > 4420 > 2405;
  13410 > 6570 > 4590).
- 9253 (the killer): totals RISE with ceiling (50560 → 86270 → 93820)
  because brought RISES with ceiling (150030 → 224620 → 266140). Kept
  food feeds future hauls: a better-fed scholar takes bigger trips and
  brings more, depositing more in absolute terms. The ceiling is a valve
  AND a fuel tank.
- 9255: non-monotonic totals (6720 / 9480 / 5640), trajectories diverge.

Rot — fresh-rot/100d (kcal per 100 days alive):
- leadfeast: 4000 = 103348 vs control 97612 (+5.9%, FAIL); 8000 = 84541
  (PASS).
- belongfeast: 4000 = 119174 vs control 113772 (+4.7%, FAIL);
  8000 = 122758 (+7.9%, FAIL).
- Per-seed rot100d ranges 0–638231: the 5–8% mean misses sit inside
  seed-variance noise, but per §14 a miss is a miss (see metric review).

Guardrails (all other checks PASS except one):
- (a) paired survival diff median = 0d on every armed cell (PASS).
- (b) starvation rates within bar on every armed cell (leadfeast kc4000
  0.040 ≤ 0.065; belongfeast kc8000 0.066 ≤ 0.066 — exactly at bar).
- (c) leadfeast kc4000 FAIL: one 'alien' death (seed 9251, person:alien)
  absent from the leadfeast control corpus. NOTE: alien deaths are NOT
  lever-created in any absolute sense — 3 occur on belongfeast cells in
  this same corpus — it is a rare divergent-trajectory cause, but the bar
  as written is pooled-control ⊆, so it FAILS (see metric review).
- (d) national within bar everywhere (leadfeast 7/8 all cells;
  belongfeast 4/8 vs control 3/8, 3/8 vs 3/8).
- (e) freshDays medians ≥ 0.5× control everywhere.

Engagement — keepRaiseEvents > 0 per seed:
- leadfeast: 8/8 on all three cells (PASS).
- belongfeast: 5/8 on ALL cells INCLUDING the 6000 control — seeds 9250,
  9255, 9257 never exceed the 2000 base ceiling at any level (kept/gd
  431/249/377: small-haul seeds). The bar is unachievable on belongfeast
  regardless of lever: a metric-calibration miss, not a lever miss (the
  control fails its own bar). FAIL (iv) on all three belongfeast cells.

OFF-identity: after repairing the analyzer's comparison (first run
compared the `keepceil` schema field itself — null vs 6000 — and the
unpatched `medianSurvival`, failing by construction; the repair excludes
both bookkeeping fields), kcoff leadfeast == kc6000 leadfeast on ALL
behavioral per-seed fields, all 8 seeds. PASS (v). (The proof-test state
hash independently confirms OFF identity.)

## Confirm results

NONE — no confirm spend per §9 (pilot NO-GO). Seeds 9258–9265 unrun.

## Reachability verdict

On the pilot substrate (FEASTSCALE_R13=1/SEATDRIVE=0, PD=0, DG=1):
- Wins 0/48 pilot cells (structural, pre-seat — expected, not a finding).
- Table flag (tableWaiting/tableDone): leadfeast 3/8 per cell, belongfeast
  2/8 per cell — the table is REACHED as a flag, but wins are 0 (the win
  flag is separate; pre-seat regime).
- National (end rank): leadfeast 7/8 per cell, belongfeast 3–4/8.
- Wave reach: wave 4 on 2–4/8 per cell; wave 5 on 0/48 — the wave-5 door
  is shut on this substrate (consistent with the scale-wall standing
  finding).
- Median survival 100d (horizon cap) on every cell — the dying is done by
  fights, not by the keep ceiling (guardrail (a) median diff 0d).
- NOT instrumented in this arm (stated, not claimed): Arc reach,
  four-realm formation, trap acquisition by source, counter
  discovery/counter-kill rate, young-link succession survival, tier-2
  reach. The homecoming instrument does not capture them; the §15 panel
  attempt (which would have covered some) came back invalid. No claim
  is made about them.

## Wall numbers (pilot, per cell: national / table / wins / wave4 / wave5 / median survival)

- leadfeast kc4000: 7/8, 3, 0, 4/8, 0, 100d
- leadfeast kc6000: 7/8, 3, 0, 2/8, 0, 100d
- leadfeast kc8000: 7/8, 3, 0, 2/8, 0, 100d
- belongfeast kc4000: 4/8, 2, 0, 3/8, 0, 100d
- belongfeast kc6000: 3/8, 2, 0, 2/8, 0, 100d
- belongfeast kc8000: 3/8, 2, 0, 3/8, 0, 100d
- Death causes pooled (pilot corpus): combat+monster dominate
  (leadfeast ~62%, belongfeast ~57%), sickness ~17%/13%, starvation
  ~6%/9%, dehydration ~3%/4% — the dying is done by wave fights and
  ambushes, not hunger.

## Village assessment (plain words)

The village on this substrate is glut-fed and long-lived: full shelves
from early on, median survival at the 100d cap on every cell, and the
scholar is a real pantry artery — except where the ceiling binds, which
is the whole story. On most trips the scholar brings home about a
thousand kcal and keeps all of it (the ceiling never bites); on the big
trips — the 22,730-kcal monster haul on seed 9253's day 22 — the ceiling
decides the split exactly: 4,000 kept + 18,730 to the pantry at a 4,000
ceiling, 6,000 + 16,730 at 6,000. That split is the valve, and it works
perfectly per trip. What breaks the volume-knob story is what happens
next: the food the scholar keeps feeds the scholar's next trips. Keep
more, haul more, deposit more — on seed 9253, raising the ceiling from
4,000 to 8,000 grew total brought food by 77% and total deposits by 86%.
The knob doesn't just throttle the pantry pipe; it fattens the hauler.
On belongfeast the pipe effect wins on average (deposits fall as the
ceiling rises); on leadfeast — the spec's primary cell — the two effects
cancel to flat. Nothing about the village is broken by the ceiling:
survival, national reach, and starvation are all flat across ceilings,
and the dying is combat and sickness, not hunger. The blank this run
fills is the mechanism itself: the keep ceiling is a valve with
feedback, not a clean volume knob, and any future lever on this channel
has to measure per-trip splits (where the valve is exact), not run-level
means (where the feedback eats it).

## Sense reads (SENSE-TESTING LAW)

From scripts/sense-keepceil-b.js (seeds 9253, 9255 × 4000/6000/8000,
100d; full capture evidence/2026-10-24/keepceil-b-sense.txt — the
capture regex was broad, ~1,000–1,600 keep/pantry lines per run, so the
reads below are grep-targeted, not skimmed):

1. "You keep a day's food (4000 kcal) and unload 18730 kcal into Haven's
   pantry." (seed 9253, d22, KEEPCEIL=4000) vs "You keep a day's food
   (6000 kcal) and unload 16730 kcal into Haven's pantry." (same seed,
   same day, KEEPCEIL=6000). THE SAME HAUL, split differently by the
   ceiling, total 22,730 both ways. The valve reads in the fiction
   exactly, on matched early trajectories before divergence. Sensible,
   kcal-honest, no fabricated history.
2. "You keep a day's food (450 kcal) — nothing extra for the pantry
   this time." (small haul, all ceilings). The keep decision tracks haul
   size; small trips keep everything and say so. Sensible.
3. "The pantry is bursting past tomorrow — most of the haul stays in
   your pack. The fire can wait; the road can't." (raise voice; fires
   exactly when kept > 2000). Counts scale with ceiling on seed 9253
   (25/30/34 at 4000/6000/8000) and stay small on 9255 (2/6/6). DOCUMENTED
   (not fixed — out of scope for a killed arm): the line is INVARIANT —
   the same sentence fires daily on glut runs (d20–d28 nearly daily on
   9253) with no speaker and no rotation, unlike the DG day voice which
   rotates speakers and lines. It is honest (never fires when the keep
   didn't exceed 2000) but verbatim-repetitive on glut substrates; a
   future voice-variation pass could rotate it. It also never names the
   ceiling — the keep line itself carries the number, so the fiction
   stays legible.
4. No robotic, static, or repeated beats beyond the expected formulaic
   shape of return beats, except the invariant raise line in (3).

SENSE VERDICT: sensible — the keep beats are legible and kcal-honest,
and the ceiling is visible in the narration. The fiction does not save
the lever: the kill is about run-level steering, not readability.

## Metric review (§14)

- The pre-registered pilot bar was judged as written; nothing was
  re-scored. The 8 fails stand: PRIMARY leadfeast, ROT leadfeast kc4000,
  ROT belongfeast kc4000, ROT belongfeast kc8000, GUARD (c) leadfeast
  kc4000, ENGAGEMENT belongfeast ×3 (including control).
- ROT misses (+5–8%) sit inside per-seed variance (per-seed rot100d
  0–638,231): with n=8, a 5% mean difference is not a demonstrable lever
  effect. NEXT RUN (if rot is ever the question again): pre-register an
  absolute rot bar or a paired per-seed test, not a mean-ratio bar on
  8 seeds.
- GUARD (c) "no new death modes" as pooled-control ⊆ is brittle at n=8:
  a single rare divergent death (1 alien death, seed 9251 kc4000) fails
  it, while alien deaths exist elsewhere in the same corpus (3 on
  belongfeast). NEXT RUN: define "new" as a family absent from the
  POOLED multi-policy corpus, or require ≥2 occurrences.
- ENGAGEMENT bar (≥7/8 seeds) is unachievable on belongfeast because
  3/8 seeds never exceed the 2000 base ceiling at ANY level — the bar
  measures haul-size distribution, not lever engagement. NEXT RUN:
  pre-register engagement as "armed engagement pattern == control
  engagement pattern on the same seeds" or restrict the bar to the
  binding policy (leadfeast, where it passed 8/8).
- OFF-identity analyzer bug (first run): the comparison included the
  `keepceil` schema field (null vs 6000 by construction) and the
  `medianSurvival` patch field (kcoff unpatched). Repaired to compare
  behavioral fields only; the corrected check passes 8/8. Same class as
  the pdtradeoff-b ms-normalization finding: byte-reproduce checks must
  exclude their own bookkeeping fields.
- PRIMARY metric for a future keep-channel run: run-level mean
  deposit/gd is confounded by trajectory divergence + kept-food
  feedback. A future run should pre-register a TRAJECTORY-FREE primary
  — e.g., per-decision kept/deposit on the FIRST binding decision per
  run, or the proof-test-style matched-haul split — and treat run-level
  volume as a secondary, feedback-aware outcome. This is a proposal for
  the NEXT run, not a re-score of this one.
- §15: panel compare invalid ("Unmatched flags") — the #797
  env-gated-lever outcome, reproduced on a minimal pair (leadfeast,
  seeds 9250–9251). The panel identity cannot see an env-gated lever
  except as a flag mismatch; manual paired rows remain the instrument
  for this lever class. No re-score, no waiver.
- Per-seed IQRs are huge (leadfeast kc4000 deposit/gd 0–510.7; belongfeast
  kc4000 0–1598): seed variance dominates the channel; cell means are
  single-seed driven (seed 9253 alone sets the leadfeast ordering).
  The paired/contrast design is what makes the mechanism legible; the
  means alone are not.

## Blanks filled / documented

- FILLED (instrument): scripts/sweep-keepceil-b.js — KEEPCEIL × policy
  sweep on the unchanged homecoming instrument (hc decomposition +
  rot/fresh/deaths/wall schema); scripts/analyze-keepceil-b.js —
  pre-registered verdict analyzer (primary, rot, guardrails (a)–(e),
  engagement, OFF-identity, wall numbers, manual paired rows);
  scripts/run-keepceil-b.sh — pilot/confirm runner;
  scripts/sense-keepceil-b.js — keep-beat sense capture.
- FILLED (question): does the keep ceiling steer run-level channel
  volume monotonically? NO on the primary cell (leadfeast flat
  134.0/140.8/138.1), YES on belongfeast means (565.7/463.1/336.6) —
  and the mechanism is now understood: per-trip valve exact, run-level
  steering eaten by trajectory divergence + kept-food feedback (seed
  9253: brought +77% from 4000→8000).
- FILLED (kill): the layer is reverted to zero trace (src/js/game.js
  clean, grep 0) with a green kill-state proof test; the landed DG=1
  6000 raise is intact and KEEPCEIL-immune.
- DOCUMENTED (voice): the DG raise line is invariant and fires daily on
  glut runs (sense read 3) — a future voice-variation pass, not this
  arm's fix.
- DOCUMENTED (backlog): the kept-food feedback loop filed in
  hidden_files/sim-findings.md for future keep/pantry lever design.

## Convergence state

killed-at-pilot. The keep-ceiling volume knob does not converge: its
run-level steering claim is falsified on the primary cell, and the
per-trip valve it does provide is already the landed behavior (6000).
No further rounds on this lever without a new pre-registration (see
metric review: trajectory-free primary).
