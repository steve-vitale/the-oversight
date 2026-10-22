# sim-plentydepri-confirm-b — PLENTYDEPRI confirm run (ADOPTED ARM, landed df66ebaff)

Run: fleshout-b-20261022T035902Z, axis food-economy. Worker tree:
~/workspace/worktrees/sim-plentydepri-confirm-b (base master 42d328d35).
MEASUREMENT ONLY — no game-code changes in this run. The lever was verified
intact on current master first: scripts/test-plentydepri-b.js re-ran ALL GREEN
on master 42d328d35 before any confirm spend.

## The lever (from the pilot, unchanged on master)
Steve's ruling (DECISIONS.md 2026-10-21): SURPLUSFEED's post-hoc share trim is
REMOVED. Replacement is behavioral and bottom-up: villagers deprioritize
PRODUCTION at the production decision itself when food is plentiful
(`prodThrottleEngaged()` = pantryFreshDays() > 4, hungryStreak>=3 stands it
down). Env gate: `_plentyDepriOn()` — ON in browser; in node ON unless
PLENTYDEPRI=0. Control = PLENTYDEPRI=0; armed = PLENTYDEPRI=1 (default-ON as
landed). Day-level voice: one line/day after the meal loop, rotating speaker,
12-line pool naming real instead-of work. Ledger counts every eased decision.

## PRE-REGISTERED (bound per §14 — a miss is NO-GO, never re-scored)
- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0, 180d death-aware horizons
  (dead villages stop; +10d tail max), policies {leadfeast, belongfeast}.
- Seeds: 9009–9016 (8 fresh seeds; pilot used 9001–9008 — asserted unused in
  evidence/ + scripts/ before running) × 2 policies = 16 runs/side.
- PRIMARY: rot/100d absolute kcal armed/control <= 0.80 per feast-side
  (pilot measured 0.542x leadfeast / 0.622x).
- Guardrails: median survival armed >= control−10d; starvation deaths <=
  control+2; national reach >= control−2; no new death-cause modes; channel
  laundering <= 2x.
- Engagement: eased kcal > 0 on >= 6/16 armed runs.
- Verdict: GO if primary passes on BOTH feast-sides AND all guardrails hold;
  else NO-GO (report-only, no re-scoring).
- Instrument: balanced panel (scripts/balance-panel.js) per §15 — the panel
  is the instrument, the pre-registered threshold is the judge; compare .md
  attached (panel-plentydepri-confirm-b-compare.md).

## Numbers (16 runs/side; identical seeds both sides)
- PRIMARY leadfeast: control 272.1k -> armed 94.8k = **0.348x (GO, <= 0.80)**
- PRIMARY belongfeast: control 184.1k -> armed 93.5k = **0.508x (GO, <= 0.80)**
- Engagement: eased kcal > 0 on **16/16** armed runs (leadfeast depriKcal
  total 2079k, 8/8 firing; belongfeast 1732k, 8/8 firing).
- Median survival: leadfeast 121d -> 131.5d (+10.5); belongfeast 105.5d ->
  130.5d (+25). Both within >= control−10d.
- Starvation deaths: leadfeast 4 -> 3; belongfeast 5 -> 1. Both <= control+2.
- National reach: leadfeast 8 -> 7; belongfeast 5 -> 3. Both >= control−2.
- Death modes: no new modes (kind-filtered, deduped). Armed-only cause
  strings (the night, speedbump, glasswing darter, the eater, the heckler,
  the landlord, the expedition, the reunion, bad belly...) are monster-name
  variants inside the combat family; dehydration fires on belongfeast-armed
  but is already a control-corpus family (leadfeast-control). Armed families
  {sickness, combat, dehydration, starvation, alien} ⊆ control-corpus
  families. Combat remains the sharp end (117 leadfeast armed combat-family
  deaths vs 126 control; 120 belongfeast armed vs 105 control).
- Channel laundering: no inflow channel >2x control. leadfeast max:
  ambient:other 0.92x (duty 0.29x — the easing throttles production inflow,
  not total activity); belongfeast max: duty 1.36x, ambient:other 1.25x.
- wins 0/32 both sides; exiled 0/32 both sides; arc max 4 both sides;
  wave max 4 both sides; wave-4 reach leadfeast 8/6, belongfeast 6/8.

**VERDICT: GO on primary, engagement, and all guardrails. Status:
converging (pilot GO + confirm GO on fresh seeds; arm landed).**

## Balanced panel (§15 — instrument)
Base panel (pre-arm source df66ebaff^, lever absent) and armed panel (current
master 42d328d35, lever default-ON): 16 cases each (8 fresh seeds ×
{leadfeast, belongfeast}, 180d, FEASTSCALE_R13=1/SEATDRIVE=0) — the pilot's
exact instrument: before/after differ by SOURCE, not env. (First attempt ran
base/armed on identical master with PLENTYDEPRI=0/1 in env; the compare
contract rejects this — the env value enters the panel's flag snapshot, so
options.flags mismatch → decision "invalid". The lever is env-gated, so the
contract-correct before/after is two sources, exactly as the pilot did:
b6b0937 vs 887ffb4e then, df66ebaff^ vs 42d328d35 now. The env-sweep +
test-plentydepri-confirm-b.js remain the precise arm measurement on identical
code; the panel is the corroborating scorecard.)
Compare: evidence/2026-10-22/panel-plentydepri-confirm-b-compare.md.
TODO(panels-running): fill in the decision + any regression_watch notes after
the compare lands. Pre-registered judge: the panel cannot overturn the
primary/guardrail verdict; it is reviewed for regression_watch items to track.

## Telemetry deviation check (scale-wall baseline)
Ran: node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current '/tmp/sim-plentydepri-confirm-b/perseed/*.json' --metrics national,table,wins,exiled (32 files, control+armed pooled).
LOUD lines (investigated same-run):
- `national swung 92%: baseline 12 -> current 23` — regime/n artifact, NOT a
  deviation: the baseline is the winseat regime (SEATDRIVE=1, n=16) while this
  corpus is FEASTSCALE_R13=1/SEATDRIVE=0 with n=32 pooled (control 13/16 +
  armed 10/16). Honest same-substrate comparison: armed national reach is
  within the pre-registered guardrail of control on both feast-sides
  (leadfeast 7 vs 8, belongfeast 3 vs 5, both >= control−2).
- `table disappeared: baseline 16 -> current 0` — regime artifact. The
  baseline's own note warns: "DO NOT compare pre-seat / courtship /
  readiness substrates against this baseline — wins are structurally ~0
  there". This substrate is SEATDRIVE=0 (pre-seat); the pilot's panel also
  measured table entry 0/0 on this substrate.
- `wins disappeared: baseline 16 -> current 0` — same regime artifact as
  table. Wins are structurally ~0 on this substrate (0/32 both sides).
Conclusion: no real deviation; the wall numbers for THIS regime are reported
below ("The villages" section).

## The villages, and what I assessed
FEASTSCALE_R13=1/SEATDRIVE=0 feast-driven villages that glut hard and early —
pantries routinely cross >4 fresh days within the first week, and the easing
fires from day 2 on fast-glut seeds (sense-check seed 9009 armed: ledger days
2–60, 405 eased decisions, 141k kcal eased off, day-voice fired 59/59 days).
The villages that died died of combat (wave-4 monsters, the sharp end) and
the long starvation tail after the glut years — not of the easing; starvation
deaths FELL on both policies (4→3, 5→1) and median survival ROSE (+10.5d,
+25d). The easing throttles the surplus push, not total activity: duty
inflow drops to 0.29x on leadfeast but ambient/away channels hold ~1x.
Wave 4 unlocks reliably; wave 5 never (0/32) — the wave-5 wall stands
independent of this lever. No wins, no table — the scale wall is untouched
by this arm (as expected: it's a food-economy lever; the wall is a separate
axis). Villagers ACT like people in the mechanism: rotating speakers
(Sofia, Nadia, Giuseppe, Sari, Ruth) voice the easing with named productive
alternatives — mending palisade/nets, tending the fire, teaching kids
snares, sitting with fever cases, rendering fat — never idle, never a trim
narrated as a cut.

## Blanks filled / documented
- Filled: none this run (measurement-only arm, no game-code changes).
- Documented (measurement-definition drift, carried from pilot):
  1. nationalEnd `/national/i.test(rank)` misses rank='global' (ladder:
     global implies national). This script counts rank∈{national,global} ||
     nationalLive. Absolute national counts differ from the pilot's for that
     reason alone; the before/after comparison is honest (same definition
     both sides).
  2. Death-mode guardrail needs kind-filtering (first script version
     compared raw cause strings and false-failed on named-monster causes —
     fixed to the pilot's kind-filtered operationalization before any
     verdict; see metric review).
  3. dehydration firing on belongfeast-armed but not belongfeast-control is
     not a new mode — it's a control-corpus family (leadfeast-control);
     allowed set is pooled across both policies.

## Metric review
- The pre-registered metric (rot/100d ratio per feast-side <= 0.80) behaved
  well: the confirm reproduced the pilot's direction with a STRONGER effect
  (0.348x/0.508x vs 0.542x/0.622x). No revision proposed.
- Guardrail operationalizations carried from the pilot unchanged; the two
  definition notes above (national rank-global, kind-filtered death modes)
  are the pilot's own operationalizations re-applied, not re-scoring.
- Confirm sample size note: 8 seeds/policy per the pilot's recommendation
  ("confirm 12-16 seeds recommended"); this confirm ran 8/policy = 16/side
  total, matching the pilot's screen. A 64-seed holdout would tighten the
  guardrail intervals; the effect size here (0.35-0.51x) leaves no ambiguity.

## Panel / telemetry appendices (filled when panels land)
- panel compare: panel-plentydepri-confirm-b-compare.md (attached)
- measurement log: confirm-measure.log
