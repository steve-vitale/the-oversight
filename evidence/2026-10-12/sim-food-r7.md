# Long-run sim — food economy ROUND 7: the feast chain, end to end (2026-10-12)

Lever 0: **food economy** — round 7. Territory: THE FEAST CHAIN (the Arc-IV
gate's feast deed, `scholar.prog.feastSurgeUsed`).
Follows sim-food-r6.md (r6 closed the trapline/knife blanks; its
reachability verdict named the feast gate as the Arc-IV wall: 12/12 misses).

## The blank (as assigned)

In r6's 12-seed × 200d reachability verdict, the Arc-IV gateMiss "feast"
missed on 12/12 runs. Nothing in live sims ever earned it. The chain:
(1) host a feast (real pantry cost, guest list, quality formula);
(2) devotion armed via keepsake channeling (`channelSentiment`: 3×L3
abilities OR surgeResonance≥35); (3) `grantFeastBuff` grants the FEASTED
buff only when armed (2-dawn window); (4) real combat use inside the
window (`noteFeastedCombatUse`) sets `feastSurgeUsed`.

## Where the chain breaks (instrumented, 12 seeds × 200d, competent policy)

Diag: scripts/diag-feast-chain-r7-20261012.js (wraps hostFeast /
grantFeastBuff / noteFeastedCombatUse / channelSentiment; daily sampling
of affordability, arming inputs, trauma, keepsakes). Baseline on the
pre-change code:

**Break 1 — the policy never hosts feasts.** 0 feast calls on 1,008
run-days, of which **577 days** had pantry ≥ 1.5× feast cost at haven.
`grep -i feast scripts/policies/competent.js` → zero matches.

**Break 2 — the devotion lane is loaded but never pulled.** The policy's
only keepsake channel is trauma-routed (`sootheTrauma`: trauma≥8), which
always takes channelSentiment's soothe branch. Arms by construction: 0.
Meanwhile surgeResonance crossed the 35 threshold on **9/12 runs**
(maxRes 53–155; only short runs <35), keepsakes were ready ~every day,
and sentiment was taught ~day 12–23. The arming bar is NOT unreachable —
the policy just never reaches for it.

**Break 3 (found mid-round, in the borrowed guard) — winseek's lifetime
freeload check blocks feasting forever.** I copied winseek's "EAT FIRST,
FEAST SECOND" drain check (`(takes − gives) > 3000 → skip`). But
`takes`/`gives` are RUN-CUMULATIVE lifetime counters (verified: no reset
anywhere in src/; `takeFromPantry`/`donateToPantry` accumulate). Any
scholar who ever eats from the pantry crosses 3,000 by day ~3. Measured
seed 22: **86/141 armed days drain-blocked**. The check's intent
("don't throw parties with the commons' food while freeloading") is
sound; the metric is broken.

**Break 4 (found mid-round) — exile blocks the fire.** `feastPlan`
refuses exiled scholars ("Exile means exile. The fire isn't yours to
open."). Seed 22: 101 armed days exiled; seed 111: 52. The game's honest
rule — an exile can't spend the village's stores — but it makes the deed
fragile: one exile and the chain is unreachable for that run.

**Not a break — the FUSION REACTOR CEILING (Steve 2026-10-12).** An
online reactor honestly refuses armed grants ("the reactor is a ceiling
as well as a floor"). Seed 222: 6 refused armed feasts. Working as
designed; the policy now feasts socially instead of wasting the pantry.

## The lever (scripts/policies/competent.js, gate COMPETENT_FEAST, default ON)

`COMPETENT_FEAST=0` restores byte-identical legacy behavior (verified:
2-seed trajectories match the pre-change baseline exactly, 0 feasts /
0 arms). Three functions, all no-ops when gated off:

1. **channelDevotion** (daily, after sootheTrauma): once per day, when
   trauma < 8 (never steals the soothe channel), sentiment taught, and a
   keepsake is ready → `channelSentiment`. The focused-practice branch
   feeds surgeResonance (+1/use, +5/level-up) until the devotion lane
   arms (3×L3 OR ≥35). The game's own branch order does the work; the
   policy just shows up daily.
2. **eveningFeast** (upkeep at dusk): hosts when ALL hold — at haven,
   `s.feastDay !== day`, `feastPlan().ok`, `have ≥ cost×1.5` (honest
   buffer, winseek's rule), **recentGives(7d) ≥ 1500** (the fixed
   contribute-first check: ~one real haul's donation this week —
   replaces the broken lifetime metric), cadence **7d armed / 14d
   unarmed** (armed = the conversion; unarmed = the social engine:
   trust, bonds, gossip). Reactor-online + armed → 14d social cadence
   (no wasted pantry on refused grants). "Nobody came" (village all
   abed) → back off, don't re-light tomorrow.
3. **feastFightRoad** (upkeep): while feasted and unused — face the
   feast's scavenger draw first (`faceFeastDraw` → real blow-by-blow
   while the buff is live), else patrol far tiles (3 sweeps/day, the
   2-dawn window: the night + next day). Pattern proven in winseek.

Exact numbers (all policy-side; no src/ numbers changed): cadence 7/14
days, buffer 1.5×, contribute-first 1500 kcal/7d, patrol 3 sweeps/day.
The 85%-knap-style game numbers (feast cost formula, quality formula,
2-dawn window, draw chance 1.0, surge multipliers) are untouched.

## Before/after (identical seeds × 200d — 11,22,33,44,55,66,77,88,99,111,222,333)

Chain metrics (diag, final code):

| metric (12 seeds) | before | after |
|---|---|---|
| feast hostings | 0 | 26 (13 armed, 13 social) |
| devotion arms | 0 | 20 |
| buff grants | 0 | 12 |
| combat uses | 0 | 10 (grant→use 83%) |
| **feastSurgeUsed** | **0/12** | **7/12** |
| Arc-IV gateMiss.feast | 12/12 | **5/12** |

Sweep (scripts/sweep-completion.js, mission metrics):

| metric | before | after |
|---|---|---|
| median / max survival | 90d / 200d | 71d / 130d |
| survived the horizon | 1/12 | 0/12 |
| wave reach (max) | 9×w3, 3×w2 | 10×w3, 2×w2 |
| arc reach (max) | 12×Arc 3 | 12×Arc 3 |
| national / table / wins | 0 / 0 / 0 | 0 / 0 / 0 |
| mean codex breadth | 52.5 | 49.2 |
| mean contests | 14.5 | 10.8 |

Death causes (telemetry, 12 seeds):

| cause | before (154 deaths) | after (151 deaths) |
|---|---|---|
| combat (scholar) | 72 (47%) | **92 (61%)** |
| villager combat | 41 (27%) | 29 (19%) |
| monster | 17 (11%) | 8 (5%) |
| starvation | 13 (8%) | 12 (8%) |
| thirst / sickness / other | 11 (7%) | 10 (7%) |

Reading the table honestly:

- **The chain fires end to end.** 0/12 → 7/12 `feastSurgeUsed`; the
  Arc-IV feast gate moves 12→5. The 5 remaining misses: seed 33/55
  (died before the ~2-week chain minimum), seed 88 (armed day 37, died
  day 54 before an armed feast landed), seed 111 (exiled 52 days), seed
  333 (contribute-first gate: the scholar never donated — see below).
- **The lever has a real cost.** Combat death share 47%→61%,
  median survival 90→71d. The mechanism is the feastFightRoad patrol:
  the policy seeks fights while feasted. Starvation is flat (8% both
  sides) — the 1.5× pantry buffer works; the cost is blades, not bread.
  Design call (documented for overrule): the feast conversion is
  HIGH RISK / HIGH REWARD by canon — "the feast was the weapon" means
  fighting more. The draw (guaranteed, threat-rated) is the primary
  deed path; the far patrol is the backup. I kept the patrol: a player
  who feasts for the buff hunts at first light. If Steve wants the
  safer variant, the one-line change is patrol-only-on-feast-day.
- **Reachability beyond the feast didn't move.** Still 12×Arc III, no
  Arc IV (the other gates — stage, sentiment, wave 5/5/4/3/2 distinct,
  3+ contests, national+ — still bind), no wave 4/5, no regional+.
  Expected: this lever is the feast deed, not the scale on-ramp.

## Proof tests

- scripts/test-feast-competent-r7-20261012.js: **35/35** — Part A
  (25 unit checks on stub Games): gate-off no-ops, channelDevotion
  branches (trauma≥8/untaught/no-keepsake/once-per-day), recentGives
  window math (incl. the age-trim bug the test caught), all 11
  eveningFeast guards, reactor fallback, all 5 feastFightRoad branches.
  Part B (identical seeds 11, 66 × 80d, pristine-from-HEAD vs fixed):
  pristine 0/0 grants/uses, fixed grants≥1 + uses≥1 +
  feastSurgeUsed on both.
- The test caught a REAL bug mid-round: recentGives trimmed by
  snapshot COUNT, not age — sparse snapshots stretched "7 days" back
  to day 1. Fixed with age-trimming (keep the latest pre-window
  snapshot as baseline).
- Regressions, all green on final code: test-knife-keep-20261012
  45/45, test-trapline-set-20261012 15/15, test-trapline-20261011
  29/29, test-aid-pipes-20261012 11/11, test-feast-buff 67/67,
  test-feast-ritual-proof 21/21, test-feastchain-contribute (winseek)
  5/5.
- Pre-existing failures (verified unrelated — my diff touches only
  scripts/policies/competent.js): test-feast-surge-20261010 Part 1
  (4 FAILs assert the RETIRED on-strike feastBurn API — the test is
  stale post-2026-10-10 rework); test-feastdraw-20261012 Part 2
  (1 FAIL: `spawnSync node ENOENT` — the test spawns with
  cwd=/tmp/wp-baseline-pristine, a stale path from the winpath-r4 run;
  Part 1's 40 draw-mechanic checks pass); test-hunter-knife.js 13/14
  and test-meat-flow.js FATAL (r6-verified on base 5ae9a5f4).

## Sense-testing (SENSE-TESTING LAW — transcripts read in full)

Capture: scripts/sense-feast-r7-20261012.js (3 seeds × 120d, every
Game.say matching feast/channel/keepsake/FEASTED/draw).

**The feast beat lands.** "🍖 FEAST 📺 — Lena opens the pantry wide:
17× Foraged food, 5× Rice. Carmela, Sujon, Marta, Marcus and 5 more
eat until the fire burns low. Somebody laughs so hard they cry. For one
evening, nobody is surviving — they're just together. (−4,400 kcal
from the pantry) Deirdre stayed in their tent, feverish." Real names,
real menu, the sick honestly noted, the cost stated. The armed feast:
"The channeled keepsake feeds the feast — the feast was the weapon,
and the surge rides the fire until tomorrow's dawn, spent only when
the blades are warmed." The grant: "FEASTED ×2.03 until tomorrow's
dawn (6 parts left)". The draw: "🌙 The cookfire's smell carried
further than the laughter did — smoke and grease on the night wind.
The Moderator is circling the edge of the light. It followed the
feast here." Then the monster's own intro. The story runs in order.

**The chain survives succession.** Feast hosts across one seed: Lena
(d20), Carmela (d55) — the Bearer died and the village kept feasting.
The village, not the scholar, is the protagonist, and the feast road
plays that way.

**The wedding ring works.** Seed 77: "You hold Wedding Ring… devotion
×3.0" → "FEASTED ×4.5 until tomorrow's dawn: a legendary spread."

**Repeats (documented, not fixed — game-side narration blanks):**
1. The arm message prints VERBATIM every channel, ~daily for weeks:
   "💛 You hold Notebook. Your gifts are not mastered — but they are
   lived-in, worn smooth by use, and they are with you…" ×30. A
   repeat-channel needs a shorter/varied line.
2. "FEASTED ×2.03: the feast was the weapon." ×11 inside one fight
   (per-strike feastedLine) — say it once per fight.
3. Feast menu lists "1× Fish catch, 1× Fish catch (smoked), 1× Fish
   catch (smoked)" — aggregate identical names.
4. "The fire burns lower than it should…" ambient line every few days
   (pre-existing, not feast-specific).

**Villagers act like people — mostly.** The sick stay in their tents
(named). Guests get trust +2+quality, pairwise bonds, hunger −30,
social +10, a memory ("real food, firelight, laughing"), a lifeseed
'feast_shared' event, seeded gossip. **Blank (lever 3 territory): no
villager ever pushes for a feast** — the social engine is
one-directional (player hosts; villagers never ask, suggest, or react
to rot by proposing one). Nobody reacts to the ~3,400 kcal/day of
fresh rot by suggesting a feast, which is the obvious human move.

## Village assessment (plain words)

The village learned to feast. Across 12 seeds the pantry stayed the
granary (gardens + fish), and on ~50 affordable days per long run the
scholar now opens it: 26 feasts, 13 of them armed, 12 buffs granted,
10 warmed blades. Seven villages earned the feast deed that was
decoration last round. The cost is honest: the scholar fights more and
dies more in combat (47%→61% of deaths), median survival 90→71 days —
the feast weapon cuts both ways. Starvation didn't move (8%): the
1.5× buffer and the contribute-first gate hold. Two villages couldn't
feast for honest reasons: one exiled (the fire isn't theirs), one too
poor to contribute (the scholar ate from the commons for 53 days and
never put food in — the gate said no, and it was right). The reactor
village feasts socially now, its hum crowding out the surge exactly as
Steve designed.

What was missing: a policy that hosts feasts (filled — 26 hostings),
a devotion channel that isn't trauma-routed (filled — 20 arms, the
devotion lane proven reachable, NOT a design rewrite), an honest
freeload check (filled — lifetime metric replaced with 7-day
contribution), and a fight road that warms the blades (filled —
grant→use 83%). What remains missing is reachability, not food: Arc IV
needs the other gates, waves 4–5 need the scale on-ramp. That's the
next wall, and it's not a food lever's wall.

## Blanks: filled / documented

**Filled this round:**
1. The feast chain end to end under the competent policy (the assigned
   blank): channelDevotion + eveningFeast + feastFightRoad, gated,
   proven 35/35, feastSurgeUsed 0/12 → 7/12.
2. winseek's lifetime drain-check bug (found via the borrowed guard):
   replaced with 7-day recentGives ≥ 1500. (winseek.js itself keeps its
   own check — its worker's call whether to adopt the fix.)
3. Fusion-reactor waste (found mid-round): armed feasts refused by the
   reactor ceiling no longer burn pantry on the 7d cadence — social
   cadence instead.
4. "Nobody came" retry spam: the policy reads the room and doesn't
   re-light an empty fire tomorrow.
5. recentGives age-trim bug (caught by the proof test).

**Documented (not this lever):**
1. Verbatim-repeat arm message (~daily sermon) — game-side narration
   blank.
2. Per-strike "FEASTED ×N: the feast was the weapon" spam (×11/fight).
3. Feast menu doesn't aggregate identical item names.
4. No villager ever pushes for a feast; nobody reacts to rot by
   proposing one — lever 3 (villager agency) territory.
5. Exile fragility: one exile can zero the feast deed for a run
   (the game's honest rule; the deed has no catch-up path).
6. The 5 remaining gate misses (33/55 early deaths, 88, 111 exile,
   333 contribute-first) — all honest, none a bug.
7. Pre-existing test failures listed above.

## Design calls for Steve's overrule

1. **Cadence 7d armed / 14d unarmed.** Armed = the conversion (buff
   window is 2 dawns — re-feasting sooner just refreshes); unarmed =
   the social engine (trust/bonds/gossip, worth doing, less often).
2. **Honest buffer have ≥ cost×1.5** (winseek's rule, kept).
3. **Contribute-first: gives ≥ 1500 kcal in the last 7 days.**
   Replaces the broken lifetime metric. A scholar who hasn't put food
   in this week doesn't open the commons' pantry for a party.
4. **The patrol stays.** Combat death share 47%→61%, median −19d is
   the measured price of the conversion. The feast weapon is high
   risk / high reward by canon. One-line alternative if overruled:
   patrol only on the feast day itself.
5. **Feasting continues after the deed.** The conversion is a
   playstyle, not a one-time deed hunt (differs from winseek's
   stop-after-deed; documented).
6. **No src/ numbers changed.** Every game-side number (cost formula,
   quality formula, 2-dawn window, draw chance, surge multipliers) is
   the game's own. The devotion arming bar (3×L3 OR resonance≥35) is
   reachable as designed — no rewrite proposed.

No `[needs-eyes]`: policy behavior only — no feel, combat, or UI
changes. Nothing for Steve to playtest on his phone.
