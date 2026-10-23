# sim-defer5gate — wave-5 defer5 gate DIAGNOSTIC (run fleshout-20261023T0713Z, axis scale-onramp)

Worker tree sim-defer5gate, DIAG arm: instrument-side, ZERO src/js changes.
Namespaces: diag-defer5gate-* scripts; disjoint from sibling loop-B arms
(scholardistsafe*, storageshed*, sweep-storageshed-b5*, -materialsinflow,
-havencontact — none touched).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md ("Combat readiness
gates the standing unlock (design call #4, 2026-10-16)").

## PRE-REGISTRATION (§14 binding — adopted verbatim from the brief at run start, before any analysis)

- **BINDING QUESTION:** What IS the defer5 gate in code (standing.js /
  w5gates-lib), when does it first fire, what exactly unbinds it (timer?
  veterans? armor? combination?), and is it a pacing mechanism, a kill-bar,
  or something else?
- **DIAG-GO (binding):** >=22/24 census door configs' bindings attributed
  to NAMED gate mechanisms (w5door bar: defer5-armor / defer5-weapons /
  defer5-tricks / defer5-veterans / defer5-multi / w3rung / stand-raw /
  plenty-cap / defer4 / w4faced), 0 unexplained, via w5gates-lib UNMODIFIED;
  plus the mechanism table for defer5-bound configs (first-fire day,
  unbinding conditions per bar) and named nexts. A miss is DIAG-NO-GO,
  never re-scored.
- **Seeds:** the sim-w5door-b census corpus (65511–65522 ×
  {control, armorydrive}, 24 configs, 180d death-aware, anchor
  f5f19667ce19) — re-analyzed read-only; no new corpus needed (daily r5
  bars already recorded). Sense check: one fresh seed (67801, control,
  leadfeast, narration on) for the hold-beat SENSE read.
- **Horizon + why:** census corpus horizon (180d death-aware) — the
  defer5 gate's whole life (first-fire to end-of-run) is visible in the
  existing window traces, so re-analysis answers first-fire + unbinding
  with zero new sim noise. First-fire day computed as the first window row
  with capped>=t5 && !r5.ready (peak<5 guaranteed: no door opened).

## The mechanism (plain words)

The defer5 gate is the **wave-5 readiness deferral** in
`Game.villageStandingTotal()` (src/js/standing.js:184): when the
plenty-capped standing crosses t5=200 but `waveCombatReadiness(5)` is not
ready (and the peak ratchet hasn't released wave 5), the gated total holds
at 199 and wave 5 stays out of `monsterWavePool()`. Four named bars, all
read from LIVE village state (design call #4, 2026-10-16), demand
(standingCfg().readyDemand[5], recalibrated 2026-10-18):

| bar | demand | reads |
|---|---|---|
| ARMORED | 4 fighters, armor WORN at P>=15 | equipment.armorOf / armorBonus (packs don't count) |
| ARMED | 6 fighters | weapon equipped, or weapon carried |
| TRICKS | 3 counters known | monsterCounterKnown convention |
| VETERANS | 2 living roster members with wave-4+ kills | state.waveKillLog, **living only** |

Unbinding: **all four bars met simultaneously** — no timer, no partial
credit. The weekly reminders are narration, not a release clock. After a
release, the monotonic peak ratchet (`_standingPeakWave`) grandfathers the
door open forever. Before release there is NO grandfather path — the only
exit is capability. (VETSHAPE=1 changes the veterans bar's shape to
living-or-dead; it is OFF by default and was unset in this corpus.)

Classification: **a capability + retention gate — not pacing, not a
kill-bar.** It doesn't unlock with time (no timer exists), and it doesn't
count kills directly (ledger points are the w3-rung's job). It demands a
moment where the village simultaneously fields geared, knowledgeable,
blooded fighters who are then ALIVE — and the sims show the game's own
attrition (death, gear decay/breakage) keeps those moments from coinciding.

## Attribution results (DIAG-GO: 24/24, 0 unexplained)

Analyzer: scripts/diag-defer5gate-analyze.js (PURE over the corpus;
w5gates-lib UNMODIFIED, attribution recomputed from stored vectors as a
cross-check). Proof: scripts/test-defer5gate.js — **ALL GATES GREEN**
(E1 RED→GREEN fixtures, E2 analyzer DET byte-identical, E3 non-vacuous
attribution, E4 the binding corpus bar, E5 anchor + standing.js unchanged
since f5f19667ce19).

- 24/24 configs attributed to named gates, 0 unexplained,
  0 recompute mismatches, 0 instrument errors — exceeds the >=22/24 bar.
- Bindings reproduce the census: {defer5:16, w3rung:2, plenty-cap:2,
  stand-raw:3, defer4:1}.
- **defer5 sub-gates (16/16 named at bar level):**
  defer5-armor+veterans+weapons: 13 | defer5-armor+veterans: 2 |
  defer5-veterans: 1. TRICKS NEVER BINDS (16/16 met it; max 15–27
  counters — knowledge is free). WEAPONS bins 14/16 at end-of-run but
  16/16 met it mid-run (max 10–12 armed) — end snapshots mislead; the
  binding is decay, not supply.
- **VETERANS is the universal binder:** short on 16/16 defer5 configs at
  end-of-run; only 1/16 (armorydrive s65517) EVER had 2 living wave-4+
  killers at once (d114–149), and even there they decayed back to 0 by
  d177. 10/16 never had ANY living veteran all run; l4 ledger points >0 on
  only 7/16 (kills happen, killers don't survive them).
- **ARMOR is the co-binder:** 3/16 never fielded 4×P≥15 armor at once
  (max 3); the other 13 met it in mid-run windows that never overlapped
  the veterans windows.
- **The coincidence trap:** across all 16 defer5-bound configs there were
  **0 days** where armor AND veterans were both met simultaneously (and 0
  days where all four bars were met). The gate demands simultaneity; the
  game's attrition keeps the bars disjoint. s65517 is the archetype:
  armor window d2–71, veterans window d114–149 — never touching.

## When defer5 first fires

First window row with capped>=t5 && !r5.ready, per config:
57,57,57,57,58,58,62,62,67,69,69,73,77,78,101,141 — median **d65**,
range d57–141. The gate fires early (the standing bar crosses 200 on
blood/bonds/bread while the village is still geared for a smaller war)
and then holds for the REST of the run: everReady=false on all 16
configs. The village walks up to the door around day 65 and never walks
through. (Contrast: the one 10-22 census unlock happened live-demand
post-win on a stale base — finding #793.)

## What unbinds it (engine truth, from code)

1. `rd5.ready` — all four bars from live state (above). No timer, no
   near-miss accumulation, no standing-over-200-by-more credit.
2. On release: `gated >= t5` → peak=5 → the release beat
   ("RATINGS ARE UP... the Producers have greenlit the fifth draft") →
   the ratchet grandfathers it open forever (grandfathered attribution
   path verified in proof E3b).
3. Dead veterans do not count (default); the VETSHAPE=1 instrument
   changes shape only. Steve's call whether that stays.

## Sense test (SENSE-TESTING LAW — seed 67801, narration on, control)

The hold beats read honestly against what the gate is doing:

- d98 (wave-4 release day): "📡 The fifth draft stays in the wings. It
  wants a village that can fight — blood your fighters (0 of 2
  veterans)." — names ONLY the short bar (armor/weapons/tricks were met
  that day). First-fire, correct.
- d105/d112/d119: 7-day reminders — "stays in the wings — blood your
  fighters (0 of 2 veterans)" → d119 shows "(1 of 2 veterans)" after The
  Strike died by village hands d113. The bar moved; the beat said so.
- The wave-5 TITLE ("The Producers") never leaks in the hold — the
  2026-10-21 #734 fix holds (the d110 "The producers name it: the
  Nielsen" line is the monster reveal, not the hold).
- The run's end is the retention trap in miniature: village entered
  OVERTIME at d104 (stalled at the table), bloodied a wave-4 monster,
  and died d124 with r5 = {armored 0, armed 0, tricks 21, veterans 0} —
  knowledge 21, bodies gone. The beat said "blood your fighters"; the
  village bled out trying.

The beat is not mislabeled and does not misfire. No #734-class finding
on the beat text. (The near-miss fiction blank from sim-w5door-b —
"no beat for knocking" — stands: the hold beats name the bars but there
is no beat for a village that ALMOST has it; s65517's 36-day veteran
window passed with only the weekly reminder.)

## Wall numbers

Inherited from the census corpus (n=24, unchanged): national 12/24,
table 15/24, wins 0/24, wave4 20/24, wave5 0/24, median survival 155d,
max 181d. No new corpus was run (this is a pure DIAG); the sense seed
67801 died d124 in overtime (separate diagnostic, not corpus).

## Metric review

The pre-registered DIAG-GO bar (>=22/24 named, 0 unexplained) was met at
24/24 with 0 unexplained. No metric revision: the bar worked as designed.
One instrument nuance for future runs: end-of-run snapshots mislead on
decay bars (weapons 16/16 "short" at end but 16/16 met mid-run) — the
window-trace peak analysis is the honest instrument for retention bars,
not the end vector.

## Blanks filled / documented

- FILLED: the defer5 mechanism is now named bar-by-bar with the
  coincidence-trap measurement (0/16 configs ever co-satisfied the two
  binding bars) — this is the census's "named nexts" item (2) from
  sim-w5door-b's metric review.
- DOCUMENTED (finding appended to sim-findings.md): the
  veterans-retention trap — villages blood wave-4 killers but the bar
  counts only the LIVING, and killers die; plus the coincidence trap —
  armor windows and veteran windows never overlap in 16/16 configs.

## Convergence note

Axis scale-onramp. defer5 is the door's binding constraint (16/24) and
the mechanism is now named: a capability+retention gate whose two
binding bars (armor@P15×4, 2 living wave-4+ killers) never coincide in
sim time. The sibling armorvillage BUILD arm (live) attacks the armor
side of the coincidence trap.

## Named next lever

**Veterans-retention DIAG + BUILD** (two halves, one lever): (1) autopsy
the wave-4 killers — what kills them (death-cause shares on
waveKillLog `by` vids) and whether the fight that bloods them is
winnable-but-fatal by design (wave-4 bands: damage 35–95, HP 850–1500);
(2) the design call: does the veterans bar count only the living
because "survivors of combat" is the intended fiction (code comment
says so — "Kills are the hard proof"), or is the decay the bug and
VETSHAPE=1 (living-or-dead) the fix? That's Steve's call — the
instrument exists (sim-vetshape, 2026-10-17), default OFF. The armor
side is already being built (armorvillage). Without both, the door's
coincidence trap stays shut: 0 days of overlap in 16/16 configs.
