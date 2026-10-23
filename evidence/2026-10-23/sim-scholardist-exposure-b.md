# sim-scholardist-exposure-b — exposure-normalized re-analysis of the scholardist-confirm corpus + scholar-safe variant resolution

Run: oversight-flesh-out-loop-b, arm sim-scholardist-exposure-b (arm 3 of 3,
run fleshout-loop-b-20261023T2030Z). Worker tree:
~/workspace/worktrees/sim-scholardist-exp-b (base a36890dc9, verified).
Axis: food-economy. Two parts: (a) OFFLINE re-analysis of the landed
scholardist-confirm corpus under the exposure-normalized metric (named next
#1 from the confirm's metric review); (b) the scholar-safe variant named
next (#2) — collision-found already measured, resolved by verification not
repetition (see Part B).

## Pre-registration (binding diagnostic — written BEFORE any analysis; encoded in scripts/test-scholardist-exposure-b.js header)

### Part A — offline re-analysis
- **Question**: does the scholardist pilot GO survive exposure
  normalization — i.e., was the confirm NO-GO (corpus totals 23→30) an
  artifact of punishing armed villages for living longer (or dying
  sooner)?
- **Corpus**: the landed scholardist-confirm per-seed JSONs
  (evidence/2026-10-23/perseed-scholardist-confirm-b/, commits
  1b429dc3e/13825c88d; r1 seeds 67501–67516 = the 32-pair corpus behind
  the NO-GO verdict; r2 seeds 92801–92816 = the replication corpus,
  committed in 1b429dc3e with its analysis section still "pending").
  No new sims. Zero src/js.
- **PRIMARY (binding diagnostic)**: paired per-matched-config
  (seed × policy) thin-pool starvation deaths per 100 village-days,
  one-sided sign test armed<control. **DIAG-GO iff p<0.10 AND median
  paired diff ≤ −0.5/100vd.** Ties dropped from the sign test
  (standard); median over all pairs. PRIMARY corpus = r1 (32 pairs);
  r2 (31 complete pairs; armed-belongfeast-s92808 never landed) is
  SECONDARY.
- **Secondary**: classify r1 pairs by whether the lever's grants were on
  the causal path (thin deaths at grant-recipient vids, joined on the
  beat vid namespace) vs chaos-reshuffle (early combat-collapse deaths
  in the ruins), using the day-beats.
- **Verdict classes**: DIAG-GO / DIAG-NO-GO. No re-score (§14); doubts
  go under metric review.
- **Instrument**: the balanced panel (scripts/balance-panel.js) per §15
  is the instrument; the pre-registered threshold is the judge.
  Env-gated lever on a retained corpus ⇒ panel compare is
  descriptive-by-construction (sim-findings.md #796; #797 invalid-compare
  class) — the existing scholardist-confirm-panel-primary.md stands, and
  the manual paired rows below are the judging instrument.

### Part B — scholar-safe variant (as dispatched)
- As-given design: policy-side instrument only, zero src/js; grant only
  when (a) day > 1 AND (b) the scholar's own hunger is low at grant
  time (burnHistory gate if hunger unreadable); 8-seed pilot, fresh
  block with C1 freshness gate and a scripts/+evidence/ collision scan;
  32 configs (8 seeds × {leadfeast,belongfeast} × {control,armed}), 180d
  death-aware, substrate FEASTSCALE_R13=1/SEATDRIVE=0; PRIMARY =
  thin-pool starvation exposure-normalized ≤ control−0.5/100vd AND
  guardrail corpus-total armed≤control; KILLED-AT-PILOT if missed.
- **Collision-scan outcome (executed before any Part B work)**: the
  named next is already fully executed and committed —
  sim-scholardistsafe-b, commit 6ea142c1c (ancestor of this base):
  scripts/layers/scholardistsafe-b.js (SCHOLARDISTSAFE=1, burnHistory≥1
  + relative scholar-hunger gate — the as-given absolute-≤30 design was
  tried in their instrument proof and documented over-gating: 0 grants in
  180d probes; the relative rule is the working form of the same design),
  scripts/test-scholardistsafe-b.js, evidence/2026-10-23/
  sim-scholardistsafe-b.md, 64-config sweep (16 fresh seeds 67517–67532,
  same substrate/horizon/policies), verdict NO-GO (PRIMARY 0.094→0.123/
  100d MISS; engagement 23/32 PASS; 116 grants / 128,150 kcal / 0
  errors). Re-running an 8-seed pilot of a subset design against a
  64-config judged corpus would duplicate a landed arm (loop rule:
  coordinate via claims, never duplicate) and its PRIMARY bar
  (≤ control−0.5/100vd) is unsatisfiable in the measured regime
  (control 0.094/100d < 0.5). **Part B is therefore resolved by
  verification, not repetition**: (i) byte-identity of the landed layer,
  (ii) independent re-run of the landed proof test on this base
  (E0/E1/E3 must hold; gate fires/doesn't-fire on fixtures; det-gate
  byte-identical), (iii) the sibling corpus verdict + wall numbers
  folded in below as the named next's resolution.

## Canon
- docs/CANON.md read first. docs/PRESERVATION.md (food ladder; grants
  ride the cook:true pantryDraw). docs/DECISIONS.md 2026-10-21
  SURPLUSFEED ruling (behavioral draw-side, never post-hoc trim).
  Backlog #761 (never silent — grants voiced by construction).

## RESULTS — Part A

Proof: scripts/test-scholardist-exposure-b.js — **8/8 checks ALL GREEN**
(run 2026-10-23 on base a36890dc9; E4's sibling-proof re-run ~5min).

- **E0 byte-for-byte reproduction**: thin-pool starvation counts
  recomputed from deaths[] (pclass=='starvation' && thinPool) match the
  stored `thinPoolStarvation` field on ALL 127 configs, zero mismatches.
  The analyzer reads the same numbers the confirm judged.
- **E1 PRIMARY (r1, 32 pairs)**: corpus totals control 23/3961d,
  armed 30/3292d. Sign test: k=8 armed<control of n=18 non-tied pairs,
  one-sided p=0.7597 (bar p<0.10: MISS). Median paired diff
  (armed−control): 0.000/100vd (bar ≤−0.5: MISS).
  → **DIAG-NO-GO**. The pilot GO does not survive normalization; the
  confirm NO-GO is not a corpus-total artifact.
- **E2 causal-path classification (r1, 12 pairs with armed thin
  deaths)**:
  - CAUSAL-PATH (8 pairs): thin deaths at grant-recipient vids — the
    lever touched the dying and they died thin anyway. 67501|belongfeast
    (valeria_quispe d28, yara_haddad d32); 67503|both (gen_6yct60j d31);
    67509|both (gen_rptljwh d22, gen_oczvf5g d24); 67516|belongfeast
    (farid_ahmed d153); 67506|leadfeast (jovan_milic d158);
    67514|leadfeast (app_mgpsphk7117 d132).
  - CHAOS-RESHUFFLE (2 pairs): early combat collapse with thin deaths
    at fd≈0 in the ruins — 67501|leadfeast (36d, 63% combat;
    elijah_scott d29, stan_kowalski d31, gen_9abfqb8 d33);
    67508|leadfeast (54d, 74% combat; gen_02c5rd6 d54 fd=0.32).
  - OTHER (2 pairs): late thin deaths in long-lived villages —
    67502|belongfeast (134d; visjoin_81 d128);
    67507|belongfeast (97d; diana_osei d94).
  - 20 pairs: no armed thin deaths at all.
- **E3 SECONDARY (r2, 31 complete pairs; 92808|belongfeast excluded —
  armed file never landed)**: k=5 of n=12, one-sided p=0.8062; median
  diff 0.000/100vd → **DIAG-NO-GO**. The never-analyzed r2 replication
  agrees with r1 under normalization. (r2 armed median survival was
  HIGHER than control, 141d vs 129d — the verdict is not a
  survival-driven artifact either way.)

### Paired rows (r1; per-100-village-day thin-pool rates, control → armed)

```
67501|belongfeast : 0.00 -> 8.11  (+8.11)   67501|leadfeast : 0.00 -> 8.33  (+8.33)
67502|belongfeast : 0.00 -> 0.75  (+0.75)   67502|leadfeast : 1.30 -> 0.00  (-1.30)
67503|belongfeast : 0.00 -> 8.51  (+8.51)   67503|leadfeast : 0.00 -> 8.51  (+8.51)
67504|belongfeast : 0.00 -> 0.00  (+0.00)   67504|leadfeast : 0.00 -> 0.00  (+0.00)
67505|belongfeast : 0.00 -> 0.00  (+0.00)   67505|leadfeast : 0.00 -> 0.00  (+0.00)
67506|belongfeast : 0.00 -> 0.00  (+0.00)   67506|leadfeast : 0.00 -> 2.47  (+2.47)
67507|belongfeast : 0.00 -> 1.03  (+1.03)   67507|leadfeast : 0.69 -> 0.00  (-0.69)
67508|belongfeast : 0.00 -> 0.00  (+0.00)   67508|leadfeast : 0.00 -> 1.85  (+1.85)
67509|belongfeast : 13.33 -> 11.54 (-1.79)  67509|leadfeast : 13.33 -> 11.54 (-1.79)
67510|belongfeast : 5.77 -> 0.00  (-5.77)   67510|leadfeast : 5.41 -> 0.00  (-5.41)
67511|belongfeast : 2.20 -> 0.00  (-2.20)   67511|leadfeast : 0.00 -> 0.00  (+0.00)
67512|belongfeast : 0.00 -> 0.00  (+0.00)   67512|leadfeast : 0.00 -> 0.00  (+0.00)
67513|belongfeast : 0.00 -> 0.00  (+0.00)   67513|leadfeast : 0.00 -> 0.00  (+0.00)
67514|belongfeast : 0.00 -> 0.00  (+0.00)   67514|leadfeast : 0.00 -> 0.60  (+0.60)
67515|belongfeast : 0.00 -> 0.00  (+0.00)   67515|leadfeast : 0.00 -> 0.00  (+0.00)
67516|belongfeast : 0.00 -> 1.25  (+1.25)   67516|leadfeast : 1.10 -> 0.00  (-1.10)
```

Reading the rows: the "worse" pairs are dominated by short-village
ruins rates (8.11–8.51/100d on 36–47d villages) — the collapse
punishment the normalization was meant to tame still dominates the sign
test, because a 3-death ruins cluster in a 37-day village is an 8/100d
rate. The "better" pairs (67509/67510/67511, −1.3 to −5.8) are the
earmark working as designed on villages that survived the spring.

### Balanced panel story (§15)
Env-gated lever on a retained corpus ⇒ automated panel compare is
descriptive-by-construction (#796; #797 invalid-compare class). The
existing evidence/2026-10-23/scholardist-confirm-panel-primary.md stands
(decision review_required; leadfeast playerDeaths/100d 5.37→8.82
regression_watch, community-loss 0.5625→0.8125 regression_watch;
belongfeast playerDeaths/100d 7.44→8.83, community-loss 0.9375→1.0 —
all consistent with adverse combat-collapse trajectories in the armed
arm). The manual paired rows above are the judging instrument; the
pre-registered sign-test threshold is the judge.

## RESULTS — Part B (verification, not repetition)

- **E4(i)**: scripts/layers/scholardistsafe-b.js is byte-identical to
  the committed 6ea142c1c blob (git hash-object match).
- **E4(ii)**: scripts/test-scholardistsafe-b.js re-run on base a36890dc9:
  **0 FAIL lines — fully GREEN including E2.** On the sibling's base
  (9cf62423e) E2's 4 wild-fire checks honestly failed (60d window yielded
  no thin scholar-meals with established burn clocks); on the current
  base the 60d wild smoke fires the mechanism (thinMeals>0, halves,
  grants, grantedKcal, voices all >0, zero errors). Gate behavior
  verified on fixtures: d1 thin day = zero halve/grant/voice
  (gatedBurn); scholar hungrier than the hungriest mouth = full meal, no
  halve (gatedHunger, ties to scholar); recipient hungrier = halve +
  grant as real pantryDraw + fold-in + one deterministic voice; gate-off
  = byte-identical delegation (E1); armed re-run digest-identical (E3).
  The d1 chaos seed is removed by construction: gated days are full
  delegation, trajectory-identical to control.
- **Named-next resolution** (from the landed sibling corpus, 64 configs,
  16 fresh seeds 67517–67532, same substrate/horizon/policies):
  PRIMARY exposure-normalized 0.094→0.123/100d MISS; g1 14>13 FAIL;
  g2 128d<129d FAIL; g3/g4 PASS; engagement 23/32 PASS (116 grants,
  128,150 kcal, 0 errors; gatedBurn=30, gatedHunger=22,
  gatedNoMouth=58). **Verdict: NO-GO** (not killed-at-pilot).
  Kill-discipline read: the lever is sound and the gates work; the
  regime is gone — thin-pool starvation is 0.8% of deaths on current
  master while combat is 96%+. The scholar-safe variant is the right
  mechanism for a wild that no longer exists.
- No new sweep was run for Part B; no files were added for it. The
  instrument stays on master env-gated default-OFF (not landed as a
  design change), per the sibling's commit.

## Wall numbers

Part A r1 (32+32): control won 0/32, national 16, table 18, wave4 22,
wave5 0, median 124d, max 181d; armed won 0/32, national 15, table 18,
wave4 19, wave5 0, median 115d, max 182d.
Part A r2 (32+31): control won 0/32, national 18, table 25, wave4 26,
wave5 0, median 129d, max 181d; armed won 0/31, national 22, table 22,
wave4 25, wave5 0, median 141d, max 181d.
Part B sibling corpus (32+32): control won 0/32, national 19, table 26,
wave4 30, wave5 0, median 139d, max 181d; armed won 0/32, national 22,
table 26, wave4 28, wave5 0, median 128d, max 181d.
The scale wall stands everywhere: zero wins, zero wave-5 unlocks on
this substrate in any arm of this axis's recent work.

## Death-cause shares

- r1 (from the confirm evidence): control (1,037 deaths) combat 91.4%,
  starvation 3.1%, sickness 2.5%; armed (1,017) combat 90.2%, starvation
  3.9%, sickness 3.0%.
- r2 (recomputed here, raw pclass labels; named threats → combat under
  the confirm's refined taxonomy): control (1,208) combat 84.3%,
  other:monster 4.9%, starvation 2.4%, sickness 2.3%; armed (1,228)
  combat 87.7%, other:monster 3.5%, starvation 2.3%, sickness 1.7%.
  Thin-pool: control 21, armed 19.

## Sense-test (SENSE-TESTING LAW — grant beats read from the corpus)

The beats read as people feeding people, not allocations. s67511 (both
policies, 171/181d, zero thin deaths — the earmark working): d1
"🍽️ Half your share tonight. You hand the rest to Shanice, who takes it
with both hands and doesn't say a word until it's gone." d45 "🍽️ The
bins are thin, and Jovan looks it. You set your second half in front of
Jovan. 'Eat,' you say. Jovan eats like someone making up for days." d47
"🍽️ You wave off the second scoop and nod toward Xavier. 'Xavier eats
first tonight.' Nobody at the fire disagrees." Named recipients,
situated at the fire, recipient reactions in the same beat, lines vary
across the 5 templates, one beat/day, never silent. s67509 (26d, 3 thin
deaths — the collapse): 5 grants to Sal and Jonathan before the village
died; the beats are fine, the economics around them are the question.
**Sense verdict: PASS.** Carried wrinkle: the d1 beat fires while the
scholar may be on a thin ration (the d1 thin-gate artifact — removed in
the scholar-safe variant by the burnHistory gate, verified E4).

## Village assessment (assessor's read)

These are hard-spring villages on a brutal substrate. Combat is
84–96% of deaths; the pantry is usually the least of their problems.
The scholar's share fires everywhere it can — named grants, real kcal,
voiced — and where villages survive the spring it works exactly as
designed (s67511: 29–31 grants carry a village 171–181 days with zero
thin-pool deaths). But the causal-path census reframes the confirm's
"small real effect + large chaos": in 8 of the 12 r1 pairs with armed
thin deaths, the lever HAD touched the dying — Valeria, Yara, Jovan and
others ate the scholar's half and still starved thin. The grant is a
half-meal earmark; when the pool is truly thin, a half meal delays the
funeral, it doesn't cancel it. In 2 pairs the lever never got the
chance — the day-1 reshuffle walked the village into the treeline by
day 40 and the thin deaths happened in ruins at fd=0. The mechanism is
innocent twice over: it fires, it reaches mouths, and where the village
stands it holds the line. It cannot save the village from the treeline,
and on this substrate the treeline comes first.

Who thrived: villagers who stayed near the fire and hauled while the
pantry held; the scholar's named recipients on surviving seeds. Who
died: everyone, eventually, to monsters — wave-2/3 pressure (Rut King,
Choir Toad, mirror_stag, hushwolf class) decides every village; 0 wins
and 0 wave-5 unlocks across 190 paired configs. What's missing is not
food knowledge or distribution — it's survival against the monster
pressure. The food-economy axis is measuring a lever for a 1–3% death
channel while 90%+ of deaths are combat.

**Blank filled**: none — this is a diagnostic run; its job is judgment.
**Blank documented**: (1) the exposure-normalized metric's remaining
collapse-punishment: normalization fixes punishing the arm for living
longer, but a ruins cluster in a 37-day village still scores 8/100d and
dominates the sign test — the metric cannot tell a distribution failure
from a collapse; (2) the causal-path finding sharpens the lever's real
ceiling: grants reach the dying in 8/12 pairs and they die thin anyway —
the half-meal earmark is load-bearing only while the village stands;
(3) the r2 replication corpus (63 configs) was committed without its
analysis section ever being written — E3 above is its first verdict
(DIAG-NO-GO, agreeing with r1).

## Metric review (for the NEXT run, per §14)

1. The exposure-normalized sign test as pre-registered does NOT rescue
   the pilot GO — DIAG-NO-GO on both corpora (p=0.76 / p=0.81, median
   0.000). The normalization fixed the success-punishment direction but
   not the collapse-punishment: short-village ruins clusters dominate
   per-day rates. A next metric for behavioral food levers needs
   collapse-censoring (e.g. exclude villages dead before day 60 from
   the rate comparison) or recipient-attribution (did the thin-dead
   receive grants?) rather than raw rates. Do not re-run corpus-total
   or rate bars on more seeds hoping for GO.
2. The causal-path join (beat vid ∩ death who) is a working instrument
   for "was the lever on the causal path" — consider pre-registering it
   as a secondary for future distribution levers.
3. E2's 60d wild-smoke horizon: fully green on base a36890dc9 after
   honestly failing on 9cf62423e — the wild food regime moved under the
   base. Wild-horizon assertions in proof tests should be treated as
   substrate observations, not instrument guarantees (the sibling's
   metric-review #1 already proposed this; confirmed here).
4. The as-dispatched Part B pilot bar (≤ control−0.5/100vd) is
   unsatisfiable in the measured regime (control 0.094/100d). Any future
   thin-pool lever needs a minimum-rate precondition before judging, or
   a different food-economy question (the sibling's metric-review #2).

## Convergence

- **Part A verdict: DIAG-NO-GO** (not a re-score of the confirm — a
  diagnostic on whether normalization changes the reading; it doesn't).
- **Part B verdict: named next already measured — NO-GO** (landed
  6ea142c1c, 64 configs); verified on this base, not re-run.
- The food-economy axis is NOT converged: the scale wall (0 wins, 0
  wave-5) persists, and the binding constraint on this substrate is
  combat pressure, not calories. The scholardist line (pilot GO →
  confirm NO-GO → exposure DIAG-NO-GO → scholar-safe NO-GO) is now
  measured four ways and closed: the mechanism is sound, the regime is
  gone. Recommend the axis re-baseline around the combat wall or a live
  food-economy question (rot/buffer, pantry depth), not further
  thin-pool distribution levers.
- Panel: existing scholardist-confirm-panel-primary.md stands
  (descriptive-by-construction, #796/#797); manual paired rows above
  are the judging instrument.
