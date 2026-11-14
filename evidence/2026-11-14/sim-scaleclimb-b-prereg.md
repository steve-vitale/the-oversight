# sim-scaleclimb-b — PREREG (BUILD arm: teach competent capable's diplomacy)

Run: fleshout-loop-b-20261114T1430Z (Loop B), arm sim-scaleclimb-b
Axis: winnability chain. BUILD arm — teaches the COMPETENT policy
capable's diplomacy behaviors and measures before/after on identical
seeds. Policy-side only: one new policy file, zero src/js changes.
Branch: sim-scaleclimb-b — worktree ~/workspace/worktrees/sim-scaleclimb-b
Base: master 8491b132b
Date: 2026-11-14

## The finding (measured, not guessed)

- sim-capablewinpath-b (finding #2321): capable wins 16/16 by ~day 90,
  competent 0/16 on identical seeds 98801–98816, 150d. Two gaps: the
  seat-taker gap (competent never calls `tableTakeSeat` — OUT OF SCOPE
  here, a Steve-call) and the scale-climb gap (capable reaches regional
  at median day 38 vs competent's day 71; diplomacy standing capable
  median 102 at the win vs competent 0 on 16/16).
- sim-diplo-verb-b (finding #2321 follow-up, this band 98801–98808):
  the diplomacy gap is fully attributed. The crossing verb is the
  first-gesture accord gift — `answerAccord('gift')`, +10 trust,
  2,000 kcal — 24 of 30 first-crossings; the tend
  (`tendLink`, +8/week) carries the other 6 and all maintenance.
  Competent's zero is three layers: (1) it forms exactly 1 link per
  village (the ladder stage-3 reward, days 39–58) while capable
  proposes 3–5 from day 10–38; (2) it never answers an accord and
  never tends, so its one link decays (max trust 31–39, ends 0–27,
  3 succession breaks); (3) the polity gate — diplomacy is exactly
  34 × (Haven-primary seasoned subs) when that count is ≥3, else 0.
  Counter-answers build BELONG links that score 0 (5/5 seasoned,
  0/5 counted — no foreign 4-realm). The engine's answermail drive
  is DEFAULT-OFF, so under defaults there is no engine accord/tend:
  the gap is purely policy-side.

## The lever (frozen — do not tune mid-run)

New policy `scripts/policies/competent-scaleclimb-b.js`: plain
competent + a courtship step run after `competent.daily`, modeled on
capable's leadfeast verbs (`scripts/policies/leadcourt.js` is
capable's courtship layer; `feastscale.js` adds only the feast
layer, which does not touch trust). The step, once per day each,
in order:

1. Answer a pending counter with `answerCounter('accept')` — mirrors
   capable/leadcourt; a pending counter blocks further proposes, so
   it must be answered to keep proposing. ENGINE RULE (hierarchy.js
   `_stageCounter`): a counter to ANY propose always flips to
   asSubordinate — the accepted counter forms a BELONG link, never a
   LEAD link. BELONG links are counted separately and never toward
   the 3-sub polity bar.
2. Answer a pending first accord with `answerAccord('gift')` —
   2,000 kcal → +10 trust, the crossing verb.
3. Tend Haven-primary links weekly, below the seasoned bar only
   (age < 30 days OR trust < 40; the tendseason-b predicate),
   pantry > 20,000 kcal — 1,500 kcal → +8 trust, the maintenance
   verb. Seasoned links are NOT tended.
4. Propose LEAD — `proposeLink(vid, { asSubordinate: false,
   tributeKcalPerWeek: 4000 })` — from day 10 (capable's first
   propose day; leadcourt gates day 25), once per day, when no
   counter/accord/national beat is pending, pantry > 12,000 kcal,
   and fewer than 3 Haven-primary subs stand. Candidate: the best
   KNOWN village (`Game.knowsVillage` — the scholar's own lore,
   never a roster) by deterministic as-PRIMARY judge ≥ 45
   (linkdrive's `detJudge` prim component, no RNG draw — the
   recorder's rule). Threshold 45, not 55: the engine adds
   R()*20−10 to the score, so det ≥ 45 guarantees ≥ 35 after the
   draw — the counter floor, never a cold decline (−5 opinion,
   banks courtshipDeclined); accepts land when the draw favors.
   A declined village is not re-proposed within 7 days.

WHAT IT DOES NOT DO (stated so the pilot cannot be misread):
- No seat-taking (`tableTakeSeat`) — OUT OF SCOPE, a Steve-call
  (should competent sit, or should the game prompt a human harder?).
- No national/global beat answers (leadcourt answers them; this
  lever does not — they are endgame beats, not diplomacy verbs,
  and answering them would muddy whether the diplomacy move came
  from the three verbs). No defense-call answers.
- No link-raise answers in conversation (capable's corpus shows
  no raise-formed links; raises are linkdrive's arm, not this one).
  Competent's own conversation fallthrough is untouched.
- No win-price, deed-gate, readiness-number, or standing-threshold
  changes. No src/js changes. No feast/devotion changes.

Counters: per-run ctx counters (`sc*`) plus module-level stats
(`resetScaleclimbStats` / `scaleclimbStats`) so the driver can
capture per-seed propose/accord/tend/counter numbers.

## What is already known (code, not guess)

- `judgeLink` (hierarchy.js): base 38 + rep standing/2 (max 20) +
  opinion/2 + allied +15 + (as-subordinate +10, or as-primary
  strength ±15/−10) + generosity +8 (subordinate only, opinion ≥ 5,
  tribute ≥ 3,000) + R()*20−10. Score ≥ 55 forms, 35–54 counters,
  < 35 declines. A counter's terms always make Haven the
  subordinate (`_stageCounter`: `asSubordinate: true`).
- `tendLink`: 1,500 kcal → +8 trust, once per week per link,
  Haven-primary links only; refuses during mourning (diplo-verb:
  37/153 tend attempts refused, all 37 on grief) and on a bare
  pantry. `answerAccord('gift')`: 2,000 kcal → +10, first link
  only. Links form at trust 30; seasoning needs trust 40+ held
  30 days (`_linkSeasoned`); diplomacy = 34 × seasoned regional+
  links (`standing.js` `villageStanding()`; LEAD needs a polity of
  ≥3 seasoned subs — `polityOf('haven')`).
- Baseline (diplo-verb band, 98801–98808, 150d): competent
  diplomacy 0 on 8/8, national 0/8, wins 0/8, median survival
  110d; capable diplomacy median 102 at the win, national 6/8,
  wins 8/8. The pilot's BEFORE leg replays competent on this base;
  it is NOT assumed identical to the diplo-verb corpus (the base
  moved) — the before leg is this run's own replay.

## Primary metric + GO bars (binding, §14)

- G1 INSTRUMENT VALIDITY — GO iff the driver captures a full
  per-day link roll on all 16 configs (8 seeds × competent /
  competent-scaleclimb-b), 0 instrument errors, EVERY diplomacy
  point on the armed leg is attributed to a named link + the verbs
  that seasoned it (0 unattributed points), and EVERY link on both
  legs is classified (seasoned-and-counted / seasoned-but-no-polity
  / broke-<reason> / never-seasoned-<bar> / still-young-at-end) —
  zero UNCLASSIFIED links. Any instrument error, unattributed
  diplomacy point, or unclassified link = NO-GO.
- G2 THE LEVER — GO iff on the armed leg, diplomacy points > 0 on
  ≥6/8 pilot seeds AND ≥2/8 seeds reach ≥3 Haven-primary seasoned
  subs (the polity bar) at the same time. Baseline: competent
  diplomacy 0, national 0/8, wins 0/8 on this band. A miss on
  either half = NO-GO, never re-scored mid-run.
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch diff
  and the proof test (`scripts/test-scaleclimb-b-20261114.js`) is
  green. Any src/js change = NO-GO.

Guardrail (§14c): villager (non-scholar) combat deaths are a
co-primary read on every seed — a lever that buys diplomacy with
a roster collapse is not a GO even if G2 passes; the evidence
reports deaths per seed and the pilot verdict names any seed
where armed deaths exceed the before leg by >50%.

## Method (staged, §§9–12, 14–15)

- STAGE 0 SMOKE (1 seed × 2 policies, 60d): does the policy load,
  do proposes/accords/tends fire, does the driver capture the link
  roll? Fix wiring, not thresholds. (The proof test also carries a
  live 60d smoke leg.)
- STAGE 1 PILOT (8 seeds × 2 policies = 16 configs, 150d
  death-aware, identical seeds): the judged run. Horizon 150d
  because the finding's band is 150d and links need 30 days to
  season after a day-10 start (a 60d horizon could not show a
  polity). Seeds (exact literals): 98801, 98802, 98803, 98804,
  98805, 98806, 98807, 98808 (the capablewinpath/diplo-verb band).
  Policies: competent verbatim vs competent-scaleclimb-b, identical
  seeds, same process shape as
  scripts/diploverb-driver-20261114.js (adapted: policies +
  per-seed filenames only).
- ENV: defaults, matching the diplo-verb reproduction run —
  COUNTER_ANSWER unset, COMPETENT_FLEE_REPAIR unset. No other env.
- CONFIRM (12–16 seeds) ONLY if the pilot is a clear GO. A
  borderline pilot (e.g. diplomacy > 0 on 6/8 but the polity bar
  on 1/8) is reported as-is and the coordinator decides; do NOT
  spend a confirm to rescue it.
- DRIVER (scripts/scaleclimb-driver-20261114.js, adapted from the
  diplo-verb driver): daily link roll, verb wrappers
  (proposeLink / answerCounter / answerAccord / tendLink /
  payTribute / hostFeast / breakLink / _formLink), `Game.say`
  capture (link/polity lines), raw standing split
  (war/diplomacy/plenty) read daily, `villageStandingTotal()` read
  ONCE at end-of-run. Per-seed JSON to
  evidence/2026-11-14/perseed-scaleclimb-b/. Zero src/js.
- ANALYZER (scripts/analyze-scaleclimb-b.js, adapted from the
  diplo-verb analyzer): per-link trajectories + classification,
  verb table (per verb: calls, trust deltas, first-crossings),
  per-seed diplomacy + polity days, wall numbers. Writes
  evidence/2026-11-14/scaleclimb-b-analysis.json.
- BALANCED PANEL (§15, methodology note — READ): the real
  `scripts/balance-panel.js` compare cannot judge a policy
  contrast: both panels must carry identical options.policies and
  identical policy/harness sources, and a modified or added policy
  file used by a panel invalidates the compare (scorecard
  comparePanels; diplo-verb prereg records the same refusal). So
  per the linkdrive precedent
  (scripts/build-linkdrive-panels-20261107.js), the §15 compare
  runs on PSEUDO-panels built from the driver's per-seed JSONs
  (pseudo-policy 'scaleclimb' in both panels; case identity is the
  seed; contract metrics mappable from the JSONs only — won,
  national, survival30/60, communityLost, villageDeaths; all
  others null, never faked). The pseudo-panel compare is the
  instrument; the pre-registered G2 bar is the judge. The driver's
  identical-seed numbers decide the verdict, not the panel.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures —
  the driver observes the policies' own play; nothing is staged.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the propose / accord-gift / tend / seasoning / polity lines
the driver captures and judge whether the courtship reads like a
played relationship or a silent meter. Read villager dialogue in
the captured lines where present; judge meaning and coherence,
never just counts.

## Evidence

- Prereg: this file.
- Policy: scripts/policies/competent-scaleclimb-b.js (new).
- Driver: scripts/scaleclimb-driver-20261114.js (new, adapted).
- Analyzer: scripts/analyze-scaleclimb-b.js (new, adapted).
- Panel builder: scripts/build-scaleclimb-panels-20261114.js (new,
  linkdrive pattern).
- Proof: scripts/test-scaleclimb-b-20261114.js (new; static + game).
- Per-seed JSON: evidence/2026-11-14/perseed-scaleclimb-b/ (16 files).
- Panel: evidence/2026-11-14/scaleclimb-panel.{json,md}
  (+ -before/-after .json.gz pair).
- Evidence: evidence/2026-11-14/sim-scaleclimb-b.md (per-seed
  tables, verb table, wall numbers, sense-testing, metric review).
- Reproduction check: the BEFORE leg's end-state columns (days,
  endReason, won, maxWave, standing, waveKills) checked against
  the diplo-verb corpus (evidence/2026-11-14/perseed-diploverb-b/)
  on the same 8 seeds; exact match is NOT required — the check is
  evidence, never the judge (the base may have moved).

## Convergence state

BUILD — the verdict is GO/NO-GO against G2 above. A GO licenses a
12–16 seed confirm (coordinator's call); a NO-GO parks the lever
with the numbers that killed it. Either way the axis line updates
from this run's numbers only.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did G1/G2/G3 measure the lever, or
did the metric prove wrong (bad proxy, blind channel)?
