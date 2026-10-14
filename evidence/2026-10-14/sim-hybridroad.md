# ARM "hybridroad" — the hybrid road: diplomacy + a little war + readiness doctrine (r35)

Worktree: `~/workspace/worktrees/sim-hybridroad`. Run: oversight-flesh-out-loop, ARM 1 of the r35 3-arm scale-onramp run, 2026-10-14.

## Context
r34 (evidence/2026-10-14/sim-scale-r34.md) closed with the headline finding: **no
survivable road to wave 4 exists in sims**. The diplomacy road unlocks wave 4
(~day 60, all diplomacy-driven, 6/8 unlocks) and the Mirror Draft then kills 4/6
unlocking villages 20–50 days early; the war road never clears the 4-point kill
rung (max 3/4 points banked in 150d of dedicated hunting — the war lane is
unreachable by hunting at warPerKill=25). But control seed s66 survived wave-4
contact to 150d and reached global rank with diplomacy + 2 organic wave-3 kills
(war=50) under the diplomacy bar. This arm builds the hybrid: the diplomacy
drive PLUS a modest hunt drive that banks the 2-point recipe pre-unlock PLUS a
readiness doctrine for the post-unlock village.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE sims
- **Axis**: scale-onramp (the wall).
- **Question**: does the hybrid road reach wave 4 AND hold it where the
  diplomacy road reaches it and bleeds?
- **Seeds**: 11/22/33/44/55/66/77/88 (identical seeds, before/after).
- **Horizon**: 150d death-aware (dead villages stop; +10d tail max) — the
  reachability-lever band (§10: 150–200d); wave-4 unlocks land ~day 57–79 and
  the +30d post-unlock window must fit inside the horizon.
- **Policies**: CONTROL = competent + proposelayer (PROPOSELAYER=1 — the
  diplomacy road; r33/r34 substrate rebuilt from the proof spec, 11/11 GREEN,
  det-gate 8/8, per-seed outcomes behaviorally identical to r34's table).
  ARMED = competent + hybridroad (HYBRIDROAD=1 + COMPETENT_DIRECTIONAL_FLEE=1).
- **PRIMARY**: villages alive at d+30 post-wave-4-unlock >= control AND
  wave-4 unlocks >= control−1.
- **GUARDRAILS**: median survival >= control−10d; national >= control−2;
  no new death mode (cause-family level; COUNT FLOOR per r34 metric review:
  >=2 events on a side to fire — singleton noise doesn't count).
- **Gates before spend**: proof scripts/test-hybridroad-20261014.js REAL
  RED→GREEN (10/10); det-gate-hybridroad 8/8 IDENTICAL on the armed stack;
  SMOKE=1 instrument-honesty gates both sides.
- **GO**: primary met at pilot → confirm 12–16 seeds before calling GO.
  A miss is NO-GO — never re-scored mid-run (§14).

## The lever (policy-side, no game-code changes)
`scripts/policies/hybridroad.js` (HYBRIDROAD=1; gate off = the pinned
competent object, reference-equal):
1. **Diplomacy drive** — the SAME `courtshipPass` function the proposelayer
   exports (required, not copied): real proposeLink on the proposal window
   (day>=25, pantry>12000, no pending offer, <3 haven-primary subs,
   known+unlinked candidate, 7-day per-target cooldown;
   proposeLink(v.id, {asSubordinate:false, tributeKcalPerWeek:4000}));
   counter → accept their terms when pantry<25000 (BELONG road, real 5000/wk),
   sweeten when >=25000; tend 1500 kcal from a rich (>=25000) pantry; accord
   → 'gift'; national (lead shape) → 'feast'.
2. **Modest hunt drive** (pre-wave-4-unlock only): live when wave-3 unlocked,
   wave-3 ledger points < 2, wave 4 not unlocked. Pace >= 6 days between
   deliberate legs (warroad: 3); scholar HP >= 70% (warroad: 60%); kcal >= 200.
   Engine-honest: real travelTo to thicket/ruin/forest/grove (revealed first),
   the real checkEncounter per node entry, detail-grid engagement of visible
   wave-3 monsters (courtkill's engageVisibleWave3 — required, not copied),
   max 2 legs, walk home after. Fight commit via the ctx._huntCommit channel
   competent.fight already reads (maxWave===3, HP>=50% at start, hold to 12%).
   Stand-down at 2 wave-3 ledger points — s66's recipe (2 pts → war=50).
3. **Readiness doctrine** (post-wave-4-unlock): heal discipline — when the
   scholar's HP < 70%, set ctx._recoverUntilDay = day+2 BEFORE competent.daily,
   driving competent's own recover-and-return path (walk home, eat/drink, skip
   outward legs: stoneRun, forage trips, counterPlay, workTrapline); releases
   on competent's early-out (fed + HP>60% at Haven). No deliberate hunts
   post-unlock ("stand, don't sally"). Requires COMPETENT_DIRECTIONAL_FLEE=1
   (the recovering() gate) — armed-side only. DISCLOSED CONFOUND: the gate
   also makes flee() pick the havenward exit; r2 measured directional flee
   firing 2× in 8 runs. If the arm GOes, the confound rides along and is
   named here.
Numbers: HUNT_PACE_DAYS=6, HUNT_HP_MIN=0.70, HUNT_POINTS_CAP=2,
HUNT_KCAL_MIN=200, HOLD_HP=0.70, HOLD_WINDOW_DAYS=2.

## Gates (RESULTS PENDING)
- Proof hybridroad: REAL RED (exit 1) → GREEN 10/10.
- Proof proposelayer (rebuild): REAL RED (exit 1) → GREEN 11/11.
- Det-gate hybridroad (HYBRIDROAD=1 + COMPETENT_DIRECTIONAL_FLEE=1): 8/8 IDENTICAL.
- Det-gate proposelayer (PROPOSELAYER=1): 8/8 IDENTICAL.
- SMOKE=1: both sides green (harness drives policy.daily; control fires
  proposeLink on the window fixture; armed fires the hunt leg on the
  wave-3-unlocked fixture and the readiness hold on the hurt post-unlock fixture).
- WRAPPER BUG CAUGHT PRE-SPEND (honest debugging): the first rebuild used a
  literal wrapper object (`{id, desc, daily, fight}`), silently dropping
  competent's `setup`/`upkeep` — the scholar never ate/cooked/drank/geared up
  and every village starved by ~day 30 (control sweep: 8/8 village-lost at
  29–77d, 0 links). Caught by the behavioral-identity check against r34's
  table, isolated by bisection (bare competent 150/survived; Object.assign
  wrapper 150/survived; literal wrapper 29/village-lost even with the propose
  pass neutered — the layer's verbs were proven innocent by call-tracing).
  Fixed with the courtkill pattern (`Object.assign({}, competent, {...})`),
  which preserves setup/upkeep/fight. Lesson for the skill file: policy
  wrappers must never be literal objects — always Object.assign over the base.

## Pilot (8 seeds × 150d, identical seeds) — RESULTS

| seed | control (diplomacy) d/end | w4day | driver | armed (hybrid) d/end | w4day | driver | hunts/hf | holds |
|---|---|---|---|---|---|---|---|---|
| 11 | 130/village-lost | 60 | diplomacy | 109/village-lost | 60 | diplomacy | 0/0 | 2 |
| 22 | 150/survived | – | none | 150/survived | – | none | 7/20 | 0 |
| 33 | 150/survived | 65 | diplomacy | 79/village-lost | – | none | 0/0 | 0 |
| 44 | 150/survived | 59 | diplomacy | 120/village-lost | 59 | diplomacy | 0/0 | 2 |
| 55 | 117/village-dead | – | none | 143/village-lost | 136 | hybrid | 3/35 | 1 |
| 66 | 89/village-lost | 84 | diplomacy | 84/village-lost | – | none | 7/8 | 0 |
| 77 | 71/village-lost | 60 | diplomacy | 71/village-lost | – | none | 0/0 | 0 |
| 88 | 51/village-lost | – | none | 54/village-lost | – | none | 0/0 | 0 |

Suite: wave-4 unlocks 5/8 → **3/8**; alive-at-d+30-post-unlock 3/8 → **2/8**;
median survival 130 → **109**; national 0 → 0; table/wins 0/8 both; wave-5 0/8;
links formed 22 → 22 (seasoned 19 → 15); starvation deaths 5 → 14; hungryDays
7 → 6; exiled 0 → 0; hybrid hunts 17 deliberate legs / 63 committed fight-rounds;
readiness holds 5, recover days 15.

**VERDICT: KILLED AT PILOT.** PRIMARY MISSED on both prongs (alive30post 2 < 3;
wave4unlocks 3 < 5−1=4). Guardrails: median survival MISS (109 < 130−10=120);
national HOLD (0 ≥ 0−2); no-new-death-mode MISS at the pre-registered family
level with the count floor (armed-only family `alien` ×2 — one event each on
s22 and s77; see metric review). Per §14 the miss is NO-GO, never re-scored.
Both policy files deleted per kill protocol; proof (RED→GREEN) + det-gates +
sweeps + evidence + per-seed JSONs kept.

## Why it missed (honest diagnosis — the run's real finding)
The hybrid thesis inverted. Where the hunt drive fired (s22, s55, s66), it did
not add "a little war" under the diplomacy road — it pulled the village OFF
the diplomacy road and onto the war road: endStanding diplomacy = 0 on all
three (s22: war=75/dip=0; s55: war=125/dip=0; s66: war=25/dip=0). Committing
wave-3 fights changed the scholar's days from courtship to combat; proposals
still went out (3–4 per seed) but links never seasoned into standing. The war
road then did what the war road does:
- s55: 5 wave-3 points banked → wave-4 unlocked at day **136** via the war lane
  (driver=hybrid) — 76 days later than the diplomacy road — and the village
  died 7 days later (d143). The 2-point recipe did not create readiness; the
  village fought its way to the gate and died at the door.
- s22: 3 points (war=75 < 100), no unlock, survived 150 — the war lane's
  familiar decorative finish.
- s66: 1 point, died at 84, no unlock.
On the diplomacy-unlock seeds where the hunt never fired (s11, s44), the armed
side did WORSE than control (s11: 130→109; s44: 150→120) despite the readiness
hold firing (2 holds + 6 recover days each). The hold kept the scholar home
eating from the pantry instead of producing food — starvation deaths doubled
(5→14) while wave-4 raids killed villagers on schedule. Heal discipline
without a defense to join is just a slower starvation.
The s66/s77 `alien` deaths (1+1 singletons) are noise at the count floor, not
a mechanism — filed in metric review.

## SENSE-TESTING (unlock moments, wave-4 contact — judgment, not counts)
s55 armed, d136–143: the transcript reads as a tragedy in three beats. The
village fought wave-3 monsters all game (5 ledger points) while its links
broke from deaths ("The realm came apart — no polity answers to Haven now,
and Haven is a free fire again"). At d136 the System announces the Mirror
Draft ("We've been watching you for a LONG time... So we built something out
of... well. Out of YOU") and "WAVE LEDGER — wave 3's bar is full (4/4). Wave
4's talent is cleared for release — watch the treeline." The village that
unlocked wave 4 by blood meets monsters built out of itself and dies in a
week (d143, village-lost). The readiness the hunt was supposed to buy is
nowhere in the transcript — the fights were attrition, not preparation.
s11 armed (d60 unlock, d109 death): the hold fired twice, the scholar
recovered at Haven, and 19 villager:combat deaths still arrived on schedule —
the doctrine treats the scholar's HP; the deaths are the villagers'.

## SENSE-TESTING (unlock moments, wave-4 contact, d+30 survival) — see above.

## Village assessment (plain words)
The control villages court and climb: proposals ~day 25, links season, the
diplomacy bar fills to 102, wave 4 unlocks ~day 60 as the System's response —
then the Mirror Draft arrives and the villages bleed (3/5 unlocking villages
dead within 30 days; s33 the exception at 150). The hybrid villages split in
two. Where the hunt drive fired, the scholar stopped courting and started
fighting: the villages banked war points (75, 125, 25) and zero diplomacy,
reaching wave 4 late (s55, day 136) or never (s22, s66) — "a village that
fought the whole game and was noticed for it, 76 days late, and died anyway."
Where the hunt didn't fire, the readiness hold kept the hurt scholar home —
and the villages died earlier than control (s11 130→109, s44 150→120), eating
from a pantry nobody was filling. The missing capability is not a little war
under diplomacy — the two drives compete for the same scholar-days, and the
war drive wins them. s66's recipe (2 organic kills under a working diplomacy
road) does not replicate as a deliberate drive: the deliberate version eats
the diplomacy it was supposed to supplement.

## Blanks filled / documented
1. HYBRID ROAD FALSIFIED (filled): diplomacy + deliberate wave-3 hunting does
   not replicate s66 — the hunt drive crowds out the diplomacy drive (dip=0
   on all three hunt seeds) and the war-lane unlock arrives 76 days late and
   dies in 7 days. The s66 hint was survivorship, not a recipe: its 2 kills
   were organic (the diplomacy road uninterrupted), not driven.
2. READINESS HOLD AS HEAL DISCIPLINE (filled): 5 holds / 15 recover days moved
   nothing — post-unlock villages died on schedule or earlier; starvation
   doubled. A hold without a defense to join is a slower starvation.
3. POLICY-WRAPPER UPCKILL (filled, tooling): literal policy wrapper objects
   silently drop competent's setup/upkeep → villages starve by ~day 30.
   Always `Object.assign({}, base, {...})` (the courtkill pattern). Filed for
   the worktree-isolation skill notes.
4. CONTROL SUBSTRATE RECONSTRUCTION NOTE (documented): the proposelayer
   rebuild is qualitatively faithful (5/8 diplomacy unlocks, all
   diplomacy-driven, Mirror Draft kills) but not per-seed identical to r34's
   table (s33 37→150, s66 150→89, s88 80→51) — reconstruction judgments
   (tend threshold 25000, counter-sweeten ≥25000) shift timings. Per the task's
   "never trust old numbers," the current-tip re-run IS the baseline; the r34
   table is not a regression target.

## Metric review (§14 — for the NEXT run, not this one)
1. The primary's two prongs both assumed the armed side would unlock at least
   as often — the hybrid unlocked LESS (3 vs 5) because the drives compete.
   A follow-up hybrid should pre-register drive-coexistence (diplomacy
   standing on hunt seeds) before survival.
2. The no-new-death-mode count floor (≥2 events) fired on 1+1 singletons
   (`alien` on s22 and s77). The floor should be per-seed (≥2 on one seed) or
   ≥3 total — 1+1 across seeds is the singleton noise the floor was meant to
   exclude. This run stays NO-GO on the pre-registered rule regardless.
3. alive30post worked cleanly (no censoring — no unlock after day 120 except
   s55's d136, which died at 143, honestly counted as a miss).
4. The median-survival guardrail told the truth again: 109 < 120 — the hybrid
   is genuinely worse for village longevity, not just unlucky at the gate.

## Wall numbers (this run, 8 seeds × 150d, identical seeds)
national 0/8 both · table 0/8 · wins 0/8 · wave-4 unlocks 5/8 control (all
diplomacy) / 3/8 armed (2 diplomacy + 1 hybrid war-lane) · wave-5 0/8 ·
median survival 130 control / 109 armed · maxStanding 102 control / 125 armed.

## Files
- `scripts/policies/hybridroad.js` — DELETED per kill protocol (the killed arm).
- `scripts/policies/proposelayer.js` — DELETED per kill protocol (control
  rebuild; warroad precedent: both layers deleted, proofs kept).
- `scripts/test-hybridroad-20261014.js` — proof, REAL RED (exit 1) → GREEN
  10/10 (kept; 3184c187 INFO-SKIP guard).
- `scripts/test-proposelayer-20261014.js` — proof, REAL RED (exit 1) → GREEN
  11/11 (kept; 3184c187 INFO-SKIP guard added this run).
- `scripts/det-gate-hybridroad-20261014.js` — det-gate 8/8 IDENTICAL (kept;
  INFO-SKIP guard).
- `scripts/det-gate-proposelayer-20261014.js` — det-gate 8/8 IDENTICAL (kept;
  INFO-SKIP guard added this run).
- `scripts/sweep-hybridroad-20261014.js` — pilot sweep + SMOKE=1 gates +
  COMPARE=1 verdict (kept).
- `evidence/2026-10-14/sim-hybridroad-control.json`,
  `evidence/2026-10-14/sim-hybridroad-armed.json` — per-seed evidence rows (kept).
- `evidence/2026-10-14/sim-hybridroad.md` — this file.

## Convergence
scale-onramp: CONVERGING (unchanged). The hybrid does not move the axis — the
drives compete for the same scholar-days, and the war drive wins them. The
axis still moves only when a road reaches wave 4 AND holds it; current
evidence says no road does both. Next highest-value arms: (a) stacked siege
doctrine (draw triage + watch + sally, pre-registered on the full Haven-death
surface); (b) recovery-lever (post-trauma ranging throttle) with a survival
primary; (c) plenty-road-to-wave-4 (loop B territory).
