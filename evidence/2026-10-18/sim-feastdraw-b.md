# sim-feastdraw-b — the nightly feast-draw scaling policy (food-economy lever)

Run: fleshout-loop-b-20261018T1653Z, arm sim-feastdraw-b. Worker tree: ~/workspace/worktrees/sim-feastdraw-b.
Claimed named next: sim-rackscap-b #559 — "any future rot lever must attack the draw (feast-draw scaling), not the smoke capacity."

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE sims)

- **Question**: the pantry's binding sink is the ~125 kcal/person/day nightly draw (rackscap-b). Doomed-fresh (bonus-inclusive spoilDay+bonus == day+1 — rots at tomorrow's dawn, BEFORE any meal can touch it) piles up beyond what dinner clears. Can a policy-side draw-scale-up — seconds at the fire on doomed nights — eat the doomed pile before it rots, without the windfall feast's meal-displacement?
- **Lever**: scripts/policies/feastdraw.js (FEASTDRAW=1, default OFF; wraps leadfeast/belongfeast). Inside the wrapped Game.villageEats, AFTER the normal nightly loop (which eats fresh-first, doomed first), if the remaining doomed-fresh pile still exceeds **200*roster** kcal (dinner's own draw is ~125/person — beyond ~1.6 dinners of doomed the night's meal cannot clear it), the cook serves SECONDS: a supplementary fresh-first draw through the engine's own pantryDraw (cook:true, consequence-rolled per villager via villagerFoodPoisoning — no laundering), capped at **400*roster**/night, hunger eased with the meal's own math, takes ledgers + recordTakeHist kept (freeloader/fair-share clocks stay honest), pantryKcal re-synced. NO feast machinery: no feastDay, no hunger-30 bomb, no trust/social/memory effects. One voice line names the food, the cook, the reason (no lever name — the windfallcap-b polish note).
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat); base courtship policies only. 180d death-aware; dead villages stop. Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: pilot 8 FRESH seeds 6201-6208 x {leadfeastdraw, belongfeastdraw} x {control, armed} = 32 runs, IDENTICAL seeds both sides, own in-sweep paired control. Banned/used before this run: 4201–4208, 4301–4308, 4401–4408, 4501–4508, 4601–4608, 17011–17018, 4801–4808, 4811–4822, 4901–4908, 5111–5118, 5101–5108, 5601–5608, 7001–7008, 7601–7608, 9292–9295, 99101–99108, 9921–9928, 105101–105104.
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days alive — armed <= 0.85x control.
- **ENGAGEMENT** (kill-fast): feast-draw seconds nights >= 8 across the armed side. If the mechanism never engages, KILL at pilot.
- **Guardrails**: median survival >= control-10d; STARVATION DEATHS armed <= control+2 per-pair (collapse-aware, both >30d); no new death mode (kind person/villager, dedup on (who,day,cause), thirst/dehydration canonicalized — findings #515/#517/#525/#544); laundering 0 measured AT CONVERT TIME.
- **Det-gate**: wrapped+FEASTDRAW-unset byte-identical to base over 40d (2 seeds); SMOKE+proof GREEN before any sims.
- **Balanced panel**: scripts/balance-panel.js before/after per §15 (built even on the killed arm — panel = instrument, threshold = judge).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. "Rot can't be smoked back into food" — the seconds draw runs through pantryDraw, which skips spoiled stacks (isSpoiled filter); spoiled stacks never count as doomed (pinned by proof G-doome). The ladder is untouched: this lever eats fresh food, it does not preserve.
- sweepSpoiled runs at DAWN of the next day (game.js endDay: villageEats at night, sweepSpoiled at the following dawn — verified in code), before any meal — doomed-fresh tonight is structurally unreachable tomorrow. Tonight's dinner (or seconds after it) is the only honest rescue path. This is the lever's entire rationale.

## Instruments

- scripts/test-feastdraw-b.js — proof: RED on gate-off (no fire, no voice, no telemetry; wrapped villageEats delegates), GREEN on gate-on — 31 checks ALL GREEN pre-kill (trigger/cap pinned, seconds served, capped at 400*roster, voice once naming food+cook with no lever name, telemetry, takes ledgers, consequence path, idempotent install, determinism, empty-pantry null). Post-kill: INFO-SKIP.
- scripts/detgate-feastdraw-b.js — 2 seeds x 40d, wrapped+unset == base byte-identical, wrapped==wrapped identical. GREEN pre-kill; INFO-SKIP post-kill.
- scripts/sweep-feastdraw-b.js — 32 runs: rot:fresh vs rot:preserved split (deduped by item identity in sweepSpoiled), duty-time cook drive throughput (resolveOneAssignment cook wrap), laundering measured at convert time, kind-aware person/villager deaths (deduped, canonicalized), starveDays (npcNeeds hunger>70), feastdraw telemetry (ctx._fdNights/_fdKcal/_fdDoomedSeen).
- scripts/analyze-feastdraw-b.js — aggregator with the pre-registered verdict (paired starvation-DEATH guardrail, new-death-mode subset check, dose-responses).
- scripts/build-feastdraw-panels.js — §15 balanced-panel compare (cookbulk pattern: panels from the sweep's own per-seed JSONs). Compare: evidence/2026-10-18/feastdraw-panel-primary.{json,md} (+ -before/-after .json.gz).
- scripts/sense-feastdraw-b.js — SENSE-TESTING LAW: reads seconds beats with context.
- scripts/diag-feastdraw-inflow.js — abandoned diagnostic (two harnesses in one process — contaminated; verdict-independent).

## Sweep results

### Pilot (32 runs: 8 seeds 6201-6208 x {leadfeastdraw, belongfeastdraw} x {control, armed})

| metric | control (16) | armed (16) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**) | 135,229 | 116,887 | **FAIL** (ratio 0.864 > 0.85) |
| feastdraw nights (engagement) | 0 | 661 | **PASS** (≥ 8) |
| seconds kcal eaten | — | 1,923k | (info) |
| doomed-seen | — | 4,172k | (info) |
| median survival | 123d | 128d | **PASS** (+5d ≥ -10d) |
| starveDays/100d (pooled) | 21.1 | 12.9 | (info, -8.2) |
| starvation deaths | 2 | 0 | **PASS** (per-pair fails: none) |
| laundered | 0 | 0 | **PASS** |
| new death mode | — | 7 armed-only causes | **FAIL** (strict; all n=1–2, see below) |
| national | 7/16 | 10/16 | (info) |
| table | 13/16 | 13/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 13/16 | 12/16 | (info) |
| wave 5 | 0/16 | 0/16 | (info) |

Per-seed: evidence/2026-10-18/perseed-feastdraw-b/.

**Pilot verdict: NO-GO** (primary 0.864x vs 0.85x bar). No confirm spend.
Per §14, a miss is NO-GO, never re-scored. The arm is KILLED: layer deleted
zero-trace; evidence + instruments landed.

Dose-responses:
- Pearson(fd nights, survival delta) = +0.02 (n=16) — survival effect unattributed, same as the windfall arms.
- **Pearson(fd nights, pair rot ratio) = +0.73 (n=15) — ATTRIBUTED PERVERSE dose-response: the more nights the mechanism fires, the WORSE the rot ratio.** The lever is not merely ineffective — it is actively harmful where it engages most.

Pair-level rot ratios (same-seed control vs armed, most informative):

| pair | rot C→A | ratio | fd nights | note |
|---|---|---|---|---|
| belong 6204 | 148k→27k | 0.14 | 14 | best pair |
| lead 6208 | 351k→64k | 0.15 | 13 | |
| belong 6206 | 163k→83k | 0.30 | 38 | |
| belong 6203 | 6k→3k | 0.36 | 2 | |
| lead 6203 | 156k→49k | 0.35 | 26 | |
| lead 6204 | 110k→135k | 0.67 | 44 | |
| lead 6202 | 366k→321k | 0.88 | 83 | |
| lead 6205 | 48k→53k | 0.88 | 29 | |
| lead 6201 | 245k→264k | 0.94 | 58 | |
| belong 6207 | 141k→102k | 1.18 | 32 | |
| lead 6207 | 114k→91k | 1.17 | 32 | |
| belong 6205 | 22k→19k | 1.46 | 20 | |
| **lead 6206** | **361k→674k** | **1.87** | **134** | **backfire: permanent glut** |
| **belong 6202** | **189k→456k** | **2.10** | **106** | **backfire: permanent glut** |
| belong 6208 | 0k→0k | — | 0 | early collapse, 39d both sides |

The two permanent-glut seeds (trigger firing nearly every night: 106/180, 134/180) dominate the pooled metric and flip it: the seconds ate 346k/469k of doomed on those seeds while rot ROSE 267k/313k. On moderate-glut seeds the lever works as designed (0.14–0.67).

The new-death-mode trip: 7 armed-only causes, ALL singletons/doubletons — dehydration×1, cliffhanger×1, the night×2, grief counselor×1, the loud beast×1, the landlord×1, the focus group×1. Monster/event names, none plausibly caused by eating seconds at the fire (the seconds pass touches no water, no combat, no social machinery). Noise-level, strict by design — noted, not investigated (same treatment as the windfall arms' "The Reunion"/"The Eater" trips). The primary miss kills regardless.

### §15 balanced-panel compare

evidence/2026-10-18/feastdraw-panel-primary.{json,md}. Decision: review_required —
driven by a leadfeastdraw table regression_watch (delta -0.125, CI [-0.5, 0.25]);
belongfeastdraw table moved the other way (+0.125). Small-sample wobble, not a
directional arm effect (same pattern as rackscap-b's panel). The panel is the
instrument, the pre-registered threshold is the judge (primary FAIL either way).

### Telemetry deviation check

vs scale-wall.json (national,table,wins,exiled): 2 LOUDs — "table swung 63%:
baseline 16 -> current 26" and "wins disappeared: baseline 16 -> current 0".
BOTH explained by regime mismatch: the baseline's _regime label is
"winseat — full win-side win stack" (SEATDRIVE=1); this run is pre-seat
courtship (SEATDRIVE=0) where wins are structurally 0 and table counts differ.
The exact spurious LOUDs the baseline's _regime note predicts. Not drift, not a bug.

## Wall numbers (every run)

Armed: national 10/16, table 13/16, wins 0/16, w4 12/16, w5 0/16,
median 128d, max 180d. The wall stands (zero wins, wave-4 ceiling, pre-seat).
This arm does not attack the wall.

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins serve seconds at the
fire — 661 trigger nights, 1.9M kcal of doomed food eaten that would have
rotted at dawn. On ordinary glut seeds the mechanism does exactly what the
design promised: the cook sees the doomed pile, calls seconds, the pile
shrinks (belong 6204: 148k→27k rot). But on the two permanent-glut seeds the
village eats its seconds every single night for months — and rots MORE, not
less (lead 6206: 361k→674k). The harder the lever works, the worse the outcome
(r=+0.73). The village is not a pantry with a leak; it is a living economy
that answers a leaner pantry by producing more — the duty cook's smoke drive
ran +25% harder on the armed side (1,837k vs 1,465k), and still the fresh rot
rose. Eating the doomed pile treats the symptom; the inflow refills the pile
by morning.

Who thrived: moderate-glut villages where the seconds cleared a pile the
village could not otherwise touch (belong 6204/6206, lead 6203/6208 — rot
ratios 0.14–0.35, survival deltas +33 to +75d on three of them). Who died:
the early collapses (belong 6208: 39d both sides, rot 0k — the mechanism
never engaged; the seed contributes nothing) and the permanent-glut villages
where the lever backfired. What knowledge was missing: nothing about the
mechanism's operation — the proof pinned every behavior. What is missing is
the system-level understanding: WHY does nightly doomed-eating increase total
rot on glut seeds? The leading hypothesis is production rebound (the village
replaces the eaten surplus and the marginal production rots), but the causal
chain is unproven — a diagnostic for the next arm, not this one. Which blank
I filled: the rackscap named next ("attack the draw") is now ANSWERED —
attacking the draw with a scaled nightly draw moves rot 0.864x at pilot with
an attributed perverse dose-response on glut seeds. The draw is the binding
sink, but scaling it up is not the lever — the lever has to be on the inflow
side, or on WHY the village over-produces into gluts it cannot eat.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-feastdraw-b.js, seed 6203, 60d, 6 seconds beats:

d52: "🍽️ Thabo sees the Aid from Emberhold and Foraged food won't keep till
tomorrow — seconds all round at the fire, before it turns." (Thabo is the
village cook — the beat names the right person.)

d53–d55: the same beat three nights running — the glut cluster, the exact
substrate the lever targets. The following dawn: "The village threw out
spoiled stores: Foraged food. Ava mutters: 'Should've smoked that. Fresh
stuff keeps a day or two on the shelf — the smoke rack is right there.'"
The narrative arc is coherent: seconds at night, some still rots at dawn,
Ava comments honestly.

**PASS with two polish notes** — (1) the beat fires on consecutive
glut-cluster nights (expected — that IS the substrate); (2) "Foraged food
and Foraged food" name-doubling is flat — the stacks share a name. The sense
is fine; the economics aren't.

## Blanks filled / documented

- **FILLED (finding)**: the feast-draw lever is KILLED at pilot — primary
  0.864x (bar 0.85x), engagement massive (661 nights, 1.9M kcal eaten),
  survival +5d, starvation deaths 0 vs 2, laundering 0. The rackscap named
  next is answered: scaling the nightly draw is not the lever.
- **FILLED (finding)**: PERVERSE DOSE-RESPONSE — Pearson(fd nights, pair rot
  ratio) = +0.73. On permanent-glut seeds the lever backfires (2.10x, 1.87x);
  on moderate seeds it works (0.14–0.67). The village answers a leaner pantry
  with more production; eating the doomed pile treats the symptom. The next
  arm on this axis must investigate the rebound (inflow-side) before building
  another draw lever. Filed to the findings backlog.
- **FILLED (finding)**: the seconds design avoids the windfall feast's
  meal-displacement — starvation deaths 0 vs 2 control, per-pair fails none,
  survival +5d with unattributed dose-response (+0.02). Triggering on
  abundance (post-dinner, hunger ~0) closes the gorge-fast displacement
  channel the feast opened. A future draw-side design can reuse this shape;
  the problem is the rebound, not displacement.
- **DOCUMENTED (killed)**: the feast-draw layer is KILLED at pilot per §14.
  Layer deleted zero-trace (scripts/policies/feastdraw.js removed; src/
  untouched — the arm was policy-side only). Proof + det-gate repaired to
  INFO-SKIP. Instruments + evidence landed.
- **DOCUMENTED (polish)**: "Foraged food and Foraged food" name-doubling in
  the seconds voice; consecutive-night repetition is the substrate, not a bug.
- **DOCUMENTED (seed)**: 6208 is an early-collapse seed (39d both sides, rot
  0k) — contributes nothing to the rot metric; noted for future seed selection.

## Metric review (§14)

- The primary (rot/100d ≤ 0.85x) FAILED at 0.864 — a 1.4pp miss. Per §14 it
  is NO-GO, never re-scored. The metric behaved as designed: the pooled
  absolute-per-100d showed the null that a pair-mean (0.806) would have
  flattered — the two backfire seeds are real, heavy, and correctly dominate.
- The engagement bar (≥ 8 nights) PASSED at 661 — this is ineffectiveness
  with perversity, not invisibility. The engagement-gate design is validated
  a third time: it distinguishes "invisible" from "engaged but harmful".
- The starvation-DEATH guardrail (new this run — deaths, not starveDays)
  PASSED cleanly (0 vs 2, no per-pair fails). The windfall arms' starveDays
  signal did not replicate as deaths here; the abundance-trigger design
  holds up.
- The new-death-mode guardrail tripped on 7 singleton/doubleton causes.
  At n=1–2 with no mechanistic path (no water/combat/social touch), these
  are noise — but the guardrail is strict by design and the trip is recorded.
  The primary miss kills regardless, so no adjudication was needed.
- §15 panel: built (review_required on a leadfeast table regression_watch,
  ±0.125 both directions across policies — small-sample wobble). Panel =
  instrument, threshold = judge.
- Metric-review note for the NEXT run on this axis: the food-economy axis
  now has THREE killed draw-side/supply-side variants (windfall feast
  0.662x-but-displacing, rackscap 1.001x, feastdraw 0.864x-perverse). The
  remaining direction is the INFLOW side: why does the village over-produce
  into gluts, and what governs production when the pantry is lean? The
  +0.73 perverse dose-response is the thread to pull.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current '/tmp/sim-feastdraw-b/agg/agg-*.json' --metrics national,table,wins,exiled`:
2 LOUDs, both explained by regime mismatch (baseline = winseat full win-stack
SEATDRIVE=1; this run = pre-seat courtship SEATDRIVE=0, wins structurally 0).
The exact spurious LOUDs the baseline's _regime note predicts. Not drift, not a bug.

## Convergence state

**killed-at-pilot** (NO-GO on the primary — 0.864x vs the 0.85x bar; attributed
perverse dose-response +0.73 on glut seeds). The food-economy axis is not
converged. Named next for the axis: investigate the production rebound
(inflow-side) before any further draw/supply lever — the village replaces
eaten surplus and the marginal production rots.
KILL PROTOCOL: layer deleted zero-trace (verified `git status` shows no
src/ changes; only instruments + evidence + panels added); proof 31/31
GREEN pre-kill, det-gate 4/4 IDENTICAL pre-kill, both repaired to INFO-SKIP
post-kill and verified. Layer leaves no trace in src/ (policy-side only).
