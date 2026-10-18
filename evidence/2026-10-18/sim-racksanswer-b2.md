# SIM-WINDFALLFEAST2 — the survival-safe windfall feast (ARM sim-racksanswer-b2, loop B, food-economy)

Date: 2026-10-18 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-racksanswer-b2
Axis: food-economy (scale-wall lens) — the racks-full binding answer, second variant,
via sim-racksanswer-b's killed confirm and the sim-findings.md named next
("WINDFALL FEAST IS A POWERFUL ROT LEVER BUT SURVIVAL-UNSAFE").

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-racksanswer-b proved the windfall feast is a POWERFUL rot
  lever (0.536x pilot / 0.662x confirm, 734 feasts, ~1.5M kcal eaten that
  would have rotted) but was KILLED at confirm on the survival guardrail
  (median -19d vs the -10d bound); the harm was UNATTRIBUTED (no dose-response
  with windfall frequency). Can a survival-safe variant — raised doomed
  threshold + frequency cap — retain the rot reduction without the survival
  cost?
- **Lever**: scripts/policies/windfallfeast2.js (WINDFALLFEAST2=1, default
  OFF; wraps leadfeast/belongfeast). When the pantry holds doomed fresh
  (bonus-inclusive (spoilDay+bonus)==day+1 — rots tomorrow, must be eaten
  tonight) beyond **500*roster** kcal (was 300*roster), the scholar holds a
  feast NOW, bypassing the 7/14d cadence. **Frequency cap: max 2 windfall
  feasts in any 7-day window** (changes nothing in the normal regime,
  truncates glut clusters). Every other feast gate kept (dusk, haven,
  one/day, affordability have>=cost*1.5, contribution >=1500/7d — the r13
  rule via recentGives + recentTribute). Draws urgency-first via the engine's
  own hostFeast/pantryDraw (spoiled skipped — no laundering). Cadence clock
  resets on a windfall. One honest voice line names the why.
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat);
  base courtship policies only. 180d death-aware; dead villages stop.
  Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: pilot 8 FRESH seeds 4901-4908 x {leadfeast, belongfeast} x
  {control, armed} = 32 runs, IDENTICAL seeds both sides. Banned/used before
  this run: 4201–4208, 4301–4308, 4401–4408, 4501–4508, 4601–4608,
  17011–17018, 4801–4808, 4811–4822, 9921–9928.
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days
  alive — armed <= 0.75x control. (The killed confirm achieved 0.662; the
  safe variant should retain most of it.)
- **ENGAGEMENT** (vacuous-pass protection): windfall feasts >= 8 across the
  armed side (~0.5/run; the raised threshold fires less than the old ~1/run).
  If the mechanism never engages, the run is a KILL (invisible effect).
- **Guardrails**: starvation deaths armed <= control+2 per-pair
  (collapse-aware); median survival >= control-10d; a survival miss only kills
  the arm if windfall-count-vs-survival dose-response shows attribution
  (Pearson < -0.3); otherwise written under "metric review" per the killed
  arm's proposed revision (guardrail = median >= -10d OR (harm unattributed
  AND primary <= 0.70x)). No new death mode; no laundering.
- **Det-gate**: wrapped+WINDFALLFEAST2-unset byte-identical to base over 40d
  (2 seeds); SMOKE+proof GREEN before any sims.

## Proof results (scripts/test-windfallfeast2.js — run BEFORE any sims)

PROOF GREEN (29 checks):
- RED gate-off: no fire, no voice, no telemetry, no fire-day bookkeeping
  (delegation byte-identical; det-gate confirms over 40d trajectories).
- GREEN: doomed 9000 > 500*12=6000 threshold → fires once; feastDay set;
  voice said once; telemetry (kcal, doomed, fire-day); cadence reset; doomed
  pile drawn down (9000 → 4200).
- G2 pins the key difference from the killed arm: doomed 5000 (between old
  3600 and new 6000) → NO fire.
- G3/G3b: frequency cap — 2 fires in 7d window blocks; aged-out window fires.
- G4 already feasted / G5 unaffordable (vacuous) / G6 no contribution /
  G7 away from haven → no fire.
- G8/G8b (added mid-run after the filter bug): real pantry "Foraged food"
  stacks (foodState undefined) COUNT as the fresh sink; preserved/rendered
  excluded.
- G9 determinism.

Det-gate (scripts/detgate-windfallfeast2.js): 2 seeds x 40d, wrapped+unset ==
base byte-identical. GREEN.

**Filter-bug postmortem (found during pilot)**: the first doomedFresh
implementation filtered `foodState !== 'fresh'`, but real pantry items carry
`foodState: undefined` ("Foraged food", "Rice", etc.) — the layer fired 0x in
the first pilot sweep. Fixed to the game's own rot-accounting split
(preserved/rendered excluded, everything else is the fresh sink); G8/G8b pin
it. The pilot was re-run with the fix; the buggy-run data is discarded (its
control side, being layer-inert, was valid and is reused).

## Sweep results

### Pilot (32 runs: 8 seeds 4901-4908 x {leadfeast, belongfeast} x {control, armed})

| metric | control (16) | armed (16) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**) | 135,496k | 133,797k | **FAIL** (ratio 0.987 > 0.75) |
| windfall feasts (engagement) | 0 | 158 | **PASS** (≥ 8) |
| windfall kcal saved | — | 289k | (info) |
| windfall doomed-seen | — | 1,090k | (info) |
| median survival | 153d | 135d | **FAIL** (-18d < -10d; unattributed, r=0.10) |
| starveDays/100d | 15.8 | 19.7 | (info, +3.9) |
| per-pair starvation >+2 | — | 5 pairs | **FAIL** |
| laundered | 0 | 0 | **PASS** |
| new death mode | — | "The Eater" x1 | **FAIL** (1 death) |
| national | 9/16 | 8/16 | (info) |
| table | 12/16 | 12/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 11/16 | 13/16 | (info) |
| wave 5 | 0/16 | 0/16 | (info) |

Per-seed: evidence/2026-10-18/perseed-racksanswer-b2/sweep-*.json

**Pilot verdict: NO-GO** (primary 0.987x vs 0.75x bar). No confirm spend.
Per §14, a miss is NO-GO, never re-scored. The arm is KILLED: layer deleted
zero-trace; evidence + instruments landed.

Dose-response: Pearson(windfall count, survival delta) = 0.10 (n=16) —
the survival harm does NOT track mechanism frequency (unattributed, same as
the killed arm). Per-pair deltas range -105d to +69d with no pattern by
windfall count (e.g., -105d on wf=1; +69d on wf=8; +0d on wf=17 and wf=22).

## Wall numbers (every run)

Armed: national 8/16, table 12/16, wins 0/16, w4 13/16, w5 0/16,
median 135d, max 180d. The wall stands (zero wins, wave 4 ceiling, pre-seat).
This arm does not attack the wall.

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins hold windfall feasts —
158 across the pilot, eating 289k kcal of doomed food. But the rot barely
moves (0.987x): the 500*roster threshold fires on LARGE gluts (~6,900 kcal
seen per fire) that a single 400/head feast cannot clear — it eats ~1,800
doomed kcal per fire and fills the rest of its cost with ordinary food,
mostly DISPLACING the nightly meal rather than preventing rot. The killed
arm's 300*roster threshold fired on medium piles a feast could actually
clear; the raised threshold targets piles too big to matter. The frequency
cap (2/week) rarely binds (prior arm ran 0.8/week) and is not the culprit.

Four villages collapse much earlier than their twins (belong 4904: 75d vs
180d; lead 4902: 75d vs 125d) — but the harm doesn't track windfall count,
and starvation ticks up on 5 pairs (worst: lead 4905 +62 starveDays). The
mechanism is honest but ineffective at this threshold and carries the same
unattributed survival cost as the killed arm.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-windfall2.js, seed 4902, 60d, 6 windfall feasts:

d30: "🍖 The Foraged food and Expedition haul won't keep till tomorrow —
Pasquale calls a feast to eat it before it turns." Followed by the engine
feast report (menu, attendees, the laughter line, FEASTED buff).

d31: "🍖 The Foraged food won't keep till tomorrow — Vanessa calls a feast
to eat it before it turns." The engine follows with the GRIEF register
("The laughter stays low — somebody's seat is empty") — the emotional
system responding to a death the day before.

d57: "🍖 The Tribute grain from Emberhold and Tribute grain from Thornfield
and more won't keep till tomorrow — Rafael calls a feast to eat it before
it turns."

**PASS** — the windfall line reads as a person making a sensible call
(names the food, the actor, the reason); the caller varies (Pasquale,
Vanessa, Rafael); the engine's emotional register tracks village state.
The mechanism is a numbers funnel that speaks like a person, not a
numbers funnel that stays silent. The sense is fine; the economics aren't.

## Blanks filled / documented

- **FILLED (finding)**: the 500*roster threshold neuters the windfall feast
  (0.987x vs the 300*roster arm's 0.662x). Large doomed piles exceed what one
  feast can clear; the feast displaces the nightly meal instead of preventing
  rot. The rot reduction lives in the 300*roster medium-pile band.
- **FILLED (finding)**: the frequency cap (2/week) is NOT the culprit — it
  binds rarely (prior arm: 0.8/week). A cap-alone variant (300*roster +
  2/week) is the named next; it keeps the proven threshold and bounds only
  the glut-cluster compounding the b sense-test flagged.
- **FILLED (finding)**: real pantry "Foraged food" stacks carry
  `foodState: undefined`, not 'fresh'. Any doomed-fresh computation must use
  the game's rot-accounting split (preserved/rendered excluded), not a
  `foodState === 'fresh'` filter. (Caught by the 0-fire pilot; fixed and
  re-proved.)
- **DOCUMENTED (killed)**: the survival-safe variant is KILLED at pilot —
  primary 0.987x (bar 0.75x), survival -18d (unattributed, r=0.10),
  starvation guardrail fails on 5 pairs, 1 "The Eater" death trips the
  new-death-mode guardrail. Layer deleted zero-trace per kill protocol.

## Metric review (§14)

- The primary (rot/100d ≤ 0.75x) FAILED (0.987x). The metric is sound; the
  lever as shaped does not move it. Absolute rot did drop 10.6% (3,019k →
  2,698k), but the -18d survival difference confounds the absolute; the
  normalized metric is the binding one and it doesn't move.
- The engagement bar (≥ 8) PASSED (158) — the mechanism engages, it's just
  ineffective at this threshold. This validates the engagement-gate design:
  it distinguishes "invisible" from "ineffective".
- The survival guardrail (-10d) FAILED (-18d) but the harm is UNATTRIBUTED
  (r=0.10), replicating the killed arm's finding. The attribution requirement
  (adopted from the killed arm's metric review) holds: the miss does not
  kill on its own, but the primary miss kills regardless.
- The starvation per-pair guardrail (≤ +2) FAILED on 5 pairs (worst +62).
  On the killed arm this passed; here the feast's meal-displacement may be
  shifting hunger. Worth watching in the cap-alone variant.
- The new-death-mode guardrail tripped on a single "The Eater" kill. At n=1
  this is noise-level, but the guardrail is strict by design.
- §15 panel: not built — the arm was killed at pilot, and the prior killed
  arm likewise could not complete it. The before/after comparison lives in
  the sweep analyzer output above.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current '/tmp/sim-windfallfeast2-b2/agg/agg-*.json' --metrics national,table,wins,exiled`:
1 LOUD: "wins disappeared: baseline 16 -> current 0". EXPLAINED by regime
mismatch — the baseline is labeled "winseat — full win-side win stack"
(FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=1); this run is pre-seat courtship (SEATDRIVE=0) where
wins are structurally 0. This is the exact spurious LOUD the baseline's
_regime note predicts. Not drift, not a bug.

## Convergence state

**killed-at-pilot** (NO-GO on the primary — 0.987x vs the 0.75x bar; the
500*roster safety shape neuters the lever). The food-economy axis is not
converged. Named next: cap-alone variant (300*roster + 2/week cap) — keeps
the proven threshold, bounds glut clusters; filed in the findings backlog.
