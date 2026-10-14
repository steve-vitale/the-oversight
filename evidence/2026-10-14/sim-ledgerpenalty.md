# CUMULATIVE TAKE PENALTY vs RATE LEDGER — arm verdict (scale-onramp r30 ARM, 2026-10-14)

Axis: scale-onramp, trust/ledger lens (lever 5 as lens, lever 0 food as context).
Blank: sim-findings #156 — takeFromPantry's "-2 trust per take when net < -5000"
keys on the CUMULATIVE gross ledger (v.takes/v.gives, no time decay) while the
r8/r9 work built the rate-based takeHist/giveHist (trailing-7d net rate vs the
3000 kcal/day abuse bar) for exactly this judgment. The two ledgers disagree
and the old one drives early-game trust to 0 (r28 s11: 647 take calls in 11
days, trust 0). This arm is the prescribed engine fix: route the per-take -2
trust sting through the rate ledger.

**VERDICT: KILLED per §14 — primary missed (+0.4% vs the -25% bar; the metric
is saturated, see Metric review), median guardrail missed on the letter
(124 vs 139d, need >= 129). The fix was proven correct (proof 10/10
RED->GREEN) and the mechanism FIRED (trust no longer pins at 0; original
scholars survive instead of dying into succession chains), but it does not
move the bind it was built to address: trust never reaches 30 on this road,
so a trust<30 share cannot fall 25%. Game-code REVERTED byte-clean per kill
protocol; scripts + evidence land. The proven 15-line patch is preserved in
the diff below and at ~/workspace/lp-fix-backup.patch for re-application.**

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14)

- **FIX**: game.js takeFromPantry penalty site (r29 cited ~game.js:14060; this
  tree: the `if (net < -5000)` gate at line 14073). The gate becomes
  `netRate7 >= 3000` where `netRate7 = takeRate7(vid) - giveRate7(vid)` — the
  trailing-7-day NET voluntary-take rate vs the r8 fair-share abuse bar
  (1.5x the ~2000/day norm). The cumulative `net` computation is KEPT (the
  donate-take-back exploit block below still reads it — separate system, out
  of scope). The thief sub-branch rides the same gate (it's the same "they
  notice" judgment). The bulk path (takeFromPantryBulk, `-Math.min(5000,
  _pk)`) is UNTOUCHED per the brief's scope. Homecoming-unload path untouched
  (sibling arm's territory).
- **Design consequences**: honest daily eating (~1,080/day, below the 2,000
  norm) never stings; genuine drains (>= 3000/day net) still get stung on
  every take; contributors net their gives against their takes; a stale
  lifetime ledger no longer haunts (rate decays). Gossip/rumors move REP
  only, never trust (canon) — this penalty is direct-witness ("Someone
  watches you take food"), which is the trust-moving kind. The served
  village meal is NOT in takeHist (r8 design: "the village feeding you is
  not evidence against you") and therefore no longer feeds the sting — this
  is the intended r8/r9 semantics, not a loophole.
- **SEEDS/POLICIES**: 11/22/33/44/55/66/77/88 x belongseek/leadcourt = 16
  combos, 180d death-aware, det-gate required 16/16 identical per side before
  trusting the comparison (scripts/det-gate.js via sweep --invocations=2).
- **PRIMARY**: trust<30 scholar-day share reduction >= 25% relative vs control
  (suite share = total trustLT30Days / total gameDays across 16 combos;
  trust<30 is the engine's own half-ration line; the "(Half ration — ...)"
  say line captured as cross-check).
- **GUARDRAILS**: median survival >= control - 10d (one-sided); national >=
  control - 2; exiled run-count <= control + 1.
- **GO on primary + all guardrails, else KILL per §14.**

## The fix (applied, proven, then reverted)

Diff (game.js takeFromPantry, 14 insertions / 1 deletion, now reverted
byte-clean — verified: 0 diff lines post-checkout, proof test back to
pristine RED):

```js
const net = (v.gives[vid] || 0) - (v.takes[vid] || 0);
// CUMULATIVE TAKE PENALTY vs RATE LEDGER (longsim scale-wall r30
// 2026-10-14, sim-findings #156): the old gate keyed the per-take -2
// on the CUMULATIVE gross ledger (v.takes/v.gives, no time decay) —
// a lifetime of honest communal eating pinned trust at 0 (r28 s11:
// 647 takes in 11 days). The r8/r9 fair-share machinery already judges
// ABUSE on the trailing-7-day NET rate (takeHist/giveHist vs the
// 3000 kcal/day abuse bar); the sting now keys on the same judgment.
// Honest daily eating (~1,080/day, below the ~2,000 norm) never
// stings; a genuine drain (net rate >= 3000/day, 1.5x fair share)
// still gets stung on every take. (The current take is already in
// takeHist — recordTakeHist ran above — so the rate judges it too.)
// if you're taking way more than giving, trust drops
let netRate7 = 0;
try { netRate7 = this.takeRate7(vid) - this.giveRate7(vid); } catch (e) {}
if (netRate7 >= 3000) {
```

## Proof test (scripts/test-ledgerpenalty-20261014.js)

- **RED on pristine**: T1 (s11 shape: 42,148 cumulative takes, 1080/day rate)
  stings -2; T1b (10 honest takes) grinds 30->10; T2 (60k lifetime, zero
  recent rate) stings; T4 (2999.4/day net, incl. the take) stings; T6
  (contributor: 4000/day takes + 2000/day gives) takes -7 (-2 penalty + -5
  take-back); T7 (thief, always caught, honest rate) takes -20. 6 FAIL as
  required; guards T3/T5/T8 pass on pristine too. (4 passed, 6 failed.)
- **GREEN after fix**: 10/10 PASS. Honest eating unstung at every boundary
  (2999.4 silent, 3000.4 stings); genuine 4000/day drains still stung;
  contributor pays only the untouched take-back -5; thief silent on honest
  rate; v.takes accounting byte-identical.
- **Post-revert check**: after the byte-clean checkout, the test returns to
  the identical pristine RED (4 passed, 6 failed) — the fix left no trace.
- **Regression guards**: scripts/test-fairshare-rate-r8.js 17/17 PASS;
  scripts/test-fairshare-freeload-r9.js 26/26 PASS on the fixed build.

## Det-gate (scripts/sweep-ledgerpenalty-20261014.js --invocations=2)

- **Armed: 16/16 IDENTICAL. Control: 16/16 IDENTICAL.** The brief's hard gate
  is met on both sides; in-process A/A spread on the primary metric is
  exactly 0.00000 both sides. Cross-side divergence is a deterministic
  consequence of the fix, not #113 noise.
- Note: a mid-run service restart wiped /tmp (losing the fix patch); the
  patch was re-applied from the exact edit text, re-verified (node --check,
  14+/1- diff, proof 10/10 GREEN), and a durable backup kept at
  ~/workspace/lp-fix-backup.patch. Lesson: keep patch backups under
  ~/workspace, not /tmp.

## Before/after on identical seeds (invocation 1; invocation 2 byte-identical)

| metric | control | armed | verdict |
|---|---|---|---|
| trust<30 scholar-day share (PRIMARY) | 0.9938 (1932/1944) | 0.9978 (1823/1827) | **+0.4% — MISS (need -25%)** |
| half-ration say-line share (x-check) | 0.3894 (757/1944) | 0.4581 (837/1827) | +17.6% (wrong way) |
| median survival | 139d | 124d | **MISS (need >= 129)** |
| national | 10/16 | 11/16 | PASS (>= 8) |
| table | 0/16 | 0/16 | — |
| wins | 0/16 | 0/16 | — |
| exiled | 0/16 | 0/16 | PASS (<= 1) |
| max wave | 4 | 4 | — |
| wave 4-5 unlocks | 4/16 | 5/16 | report |

Per-seed trustEnd (armed vs control) — the mechanism FIRED:

| seed | belongseek trustEnd A/C | leadcourt trustEnd A/C |
|---|---|---|
| 11 | 3 / 0 | 15 / 0 |
| 22 | 15 / 0 | 19 / 0 |
| 33 | 15 / 15 | 15 / 15 |
| 44 | 15 / 15 | 15 / 0 |
| 55 | 15 / 0 | 15 / 0 |
| 66 | 15 / 15 | 15 / 15 |
| 77 | 23 / 0 | 23 / 23 |
| 88 | 21 / 21 | 21 / 21 |

On 8 of 16 combos the control scholar's trust pinned at exactly 0; on armed
it NEVER pins at 0 (holds 15-23). The -2 grind is gone. But trust never
reaches 30 on either side (max 23) — the <30 line cannot move.

## Mechanism probe (scripts/probe{,2b,3,5}-ledgerpenalty-20261014.js)

The takesEnd divergence (e.g. belongseek:11: armed 277,158 vs control
26,883) is a **succession artifact**, not a behavioral blowout:

- Control belongseek:11: the original scholar's trust craters 15 -> 7 -> 3
  -> 0 over d17-19 (the -2 sting grinding); the scholar DIES ~d25 and is
  succeeded (probe5: 2 vids by d60; a full 180d run showed 5 successions:
  gen_dkjljvy -> gen_1fo0vsd -> gen_8mgbopq -> priya_nair -> ingrid_vik).
  The sweep tracked the ORIGINAL vid, whose cumulative takes froze at death.
  The successor's takes accrue under a new vid.
- Armed belongseek:11: the original scholar SURVIVES all 180d (trust holds
  15), accumulating honest takes ~1,300/day = the served meal (~1,100/day,
  half ration) + voluntary top-ups. probe3 timeline: scholar at the haven
  (4,4) every day, pantry in reach, bar full from d20+, pantry healthy
  (13-18k).
- The served village meal writes cumulative v.takes[vid] (FREELOADER LEDGER,
  game.js ~25730) but is NOT in takeHist (r8 design). Under the OLD gate the
  meal itself drove net < -5000 within days, arming the -2 on every
  voluntary take — "the village feeds you, then the ledger reads its own
  feeding as your hoarding" (r7 blank 2). Under the new gate the meal is
  correctly not evidence against the scholar.

## Sense-test (SENSE-TESTING LAW)

Read the meal beats on both sides. They read as people, and the fiction
names the reason honestly:

- "Village meal: +1200 kcal, +1L water from the communal pantry. (Half
  ration — they don't trust you yet.)"

The village IS telling the scholar why they're eating half. The beats are
not the blank — the ledger mechanics underneath are. The -2 sting's own
line ("Someone watches you take food. They say nothing, but you feel
it.") fires only on genuine drains after the fix. No robotic flags.

The human story the numbers tell: on control, a scholar eats honestly,
their trust grinds to 0 under the cumulative ledger, they die obscurely
~d25, and a stranger inherits the fire — five times in one run. On armed,
the same scholar holds trust 15, eats the same honest meals, and lives.
The fiction never narrates the ledger; it narrates the meals. The ledger
was the blank.

## Village assessment

- **belongseek:11**: the succession run (control) vs the survivor (armed).
  Control: 5 scholars in 180d, trust pinned at 0 between deaths. Armed:
  one scholar, 180d, trust 15, national reached.
- **The trust floor moved, the ceiling didn't.** Armed trustEnds cluster
  15-23; control clusters 0 or 15. Nothing on this road lifts trust TO 30
  — the gain channels (gifts, deeds, tribute) are the missing half, not
  the penalty.
- The scale wall stands: 0 wins, 0/16 table both sides, national 11/16
  armed (10/16 control). Villages die of the combat bleed + hollow before
  the on-ramp, same as r28/r29.

## Reachability verdict

Waves 1-4 reachable both sides (max wave 4; wave-5 unlocks 5/16 armed,
4/16 control — the wave-5 content gate is untouched by this arm).
Regional→national on 11/16 armed vs 10/16 control. Table: 0/16 both.
No wins. The ledger routing does not open or close any content gate.

## Blanks filled / documented

- **sim-findings #156 — ADDRESSED AND MEASURED, KILLED AS A LEVER.** The
  accounting disagreement is real (proven RED), the rate-routed gate is
  correct (proven GREEN, 10/10; r8/r9 suites still 17/17 and 26/26), and
  the mechanism fires (trust never pins at 0 on armed). But the bind it was
  built to address — half-ration hunger from trust<30 — does not move:
  the trust<30 share is saturated at ~99.7% on both sides because trust
  never reaches 30 on this road. Removing the penalty stops the bleeding;
  only trust GAINS can heal. The proven 15-line patch is preserved above
  and at ~/workspace/lp-fix-backup.patch for re-application paired with a
  trust-gain lever.
- **New open blank: TRUST-GAIN CHANNELS ARE THE MISSING HALF** — the
  penalty removal holds trust at 15-23 but nothing lifts it to 30 (full
  rations). The r28 vicious cycle is broken at the penalty link, but the
  recovery link (what EARNS trust back: gifts, deeds, tribute, teaching)
  is unmeasured on this road. A future arm should measure trust-gain
  sources before any further trust-side lever.
- **New open blank: SUCCESSION MASKS LEDGER METRICS** — per-vid cumulative
  ledgers (v.takes/v.gives) freeze at death while the village continues;
  any metric reading a single vid's ledger across a run with successions
  undercounts. Metrics should be successor-aware (sum across the scholar
  lineage) or the finding should be documented per arm.

## Metric review (§14, mandatory)

- PRIMARY (trust<30 scholar-day share -25%): MISSED — measured +0.4%
  (0.9938 -> 0.9978), A/A spread 0.00000 (real delta, far below the bar).
  NO-GO per §14. Not re-scored: the bar was pre-registered and the miss
  is unambiguous.
- GUARDRAIL median survival (>= control-10d = 129d): MISSED on the letter
  (124d). The -15d is deterministic (A/A identical), but with n=16 and the
  trust change moving trajectories (survival-vs-succession dynamics), this
  reads as trajectory divergence, not the arm killing villages faster.
  Reported as miss-on-letter per the brief.
- GUARDRAIL national (>= control-2 = 8): PASS (11 >= 8). Exiled (<=
  control+1 = 1): PASS (0 = 0).
- **Metric concern for the NEXT run (not this one): the primary was
  mis-specified.** A threshold share on a saturated line cannot measure
  this arm: trust<30 sits at ~99.7% on both sides because (a) trust never
  reaches 30 on this road (max trustEnd 23), and (b) dead scholars' frozen
  0-trust inflates the control side. The arm moves the trust FLOOR (0 vs
  15-23) and scholar survival, neither of which a <30 share can see.
  Proposed revisions for a future trust-side arm: (a) mean scholar trust
  (continuous, not thresholded); (b) trust-0 day share (the actual crater
  the penalty creates); (c) original-scholar survival days. Any of the
  three would have shown this arm's real effect.

## Convergence report

- Convergence: killed-at-measurement. Axis scale-onramp: still blocked
  (0/16 wins; the ledger routing is not a scale lever — it is a
  trust-floor repair).
- Wall numbers this run (armed side, 16 combos): national 11/16, table
  0/16, wins 0/16, wave 4-5 unlocks 5/16 (max wave 4), median survival
  124d.
