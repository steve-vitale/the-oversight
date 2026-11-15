# sim-successorcaution-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261115T0621Z`, axis winnability chain, arm
sim-successorcaution-b. Branch `sim-successorcaution-b`. Base master
`b9b226430` (funeral-mend tip; FUNERALMEND default ON).

## The lever, in plain words

The fighterhold diagnosis proved the pattern: the scholar dies alone in a
wave-4/5 field fight at full health, the Codex passes to the next villager,
and the new bearer — healthy, grieving, carrying the dead bearer's office —
walks out foraging alone at a tile corner the same day and dies the same
way. Two to six scholars can die in one day. A human player who just
inherited the Codex after watching the previous bearer die would stay
home, heal, and bring friends. The competent bot sends the new scholar
out alone the same day.

This arm is door 3 of the fighterhold hand-off: **a policy variant that
stops sending the successor out alone the same day.** No game code. No
flee change. No toughness, gear, or ability tuning. No party system. The
new policy (`scripts/policies/competent-successorcaution-b.js`) wraps
`competent-answercourt-b` and adds exactly one thing: after a succession,
the new scholar stays at/near Haven for their first two days instead of
starting a solo forage trip.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/SCALE.md` — the scale ladder: national is a live relationship
  (trust-held links), not a title; scholar deaths shake every link −8
  (funeral mend now buys it back). The lever protects the polity by
  protecting the bearer.
- `docs/PARTY.md` — parties are a System unlock (cap 3 at day 7); party
  members auto-join fights even beyond the 4-square radius and travel
  with the scholar. This arm does NOT form parties (the persistent-party
  program is separate); it only withholds the solo trip. The
  "companioned" branch of the brief is not built — suppression only,
  by design (see below).
- `docs/MONSTER-WAVES.md` — waves 4–5 are the killing tier (wave-4
  mean HP ~89+ in the wave-2 table's terms; wave 4–5 monsters are
  mid/late-build fights). The fatal fights are solo wave-4/5 field
  fights at full health (fighterhold probe: 21/24 at 98–107 HP).
- Diagnosis answered: `evidence/2026-11-14/sim-fighterhold-b.md`
  (DIAG-NO-GO; door 3 is this arm) and the baseline corpus
  `evidence/2026-11-14/sim-funeral-mend-b.md` (funeral mend GO, live).

## THE RULE (frozen — do not tune)

- **Succession detection (policy-visible, no game-side signal needed):**
  track `Game.villagerId` across `daily()` calls in policy ctx. When it
  changes, a succession happened: the Codex passed to a new bearer.
  Verified in code before building: `playerDeath` (`src/js/ledger.js`)
  reassigns `this.villagerId = newId` (highest-trust living roster
  member), sets `s.insideHaven = true`, resets the successor to max
  health / 1500 kcal / trauma 10. Succession IS detectable from
  policy-visible state — the arm proceeds.
- **N = 2.** The successor's first TWO `daily()` calls are caution days
  (the day after the death day, and the next). A caution day runs a
  HAVEN DAY instead of the wrapped daily:
  1. `answerNationalBeat` (court beats still answered same-day — no
     delay to national),
  2. `scaleClimb` (proposes/tends still run — Haven verbs),
  3. haven chores, each in try/catch, in this order: `keepPromises`,
     `sortHaul`, `competentEat`, `talkRound`, `gearUp` (the successor
     checks their own kit — the dead bearer's gear stays on the corpse),
  4. if not at Haven, `goHomeStanding` (honest walk home),
  5. one voiced line via `Game.say` on the first caution day per
     succession only ("The Codex is heavy today. <name> stays by the
     fire — the wild can wait a day."), so the stay reads in the
     transcript instead of going silent.
  `upkeep` (eat/drink per part) is inherited unchanged, so the scholar
  still eats and drinks on caution days. `fight` is inherited unchanged
  — a breach fight at Haven is still fought normally (the designed
  crisis; out of scope).
- **What a caution day SKIPS:** the whole wrapped `competent.daily` —
  the solo forage trip (`forageTripSeedFirst`), `stoneRun`,
  `counterPlay`, `workTrapline`, `vinebank`. The scholar does not leave
  Haven to forage, gather, trap, or scout for two days.
- **Suppression accounting (honest):** a caution day counts as
  "trip suppressed" ONLY when `needTrip(Game, ctx)` is true that day
  (the trip would actually have happened). Days the bot wouldn't have
  tripped anyway are caution days, not suppressions.
- **Determinism:** no `Math.random` in the new policy file. The haven
  chores draw from the policy RNG stream exactly as the wrapped daily
  would — the same class of stream divergence as any policy arm.
- **Hard boundaries (fighterhold):** NO `src/js` changes; NO flee
  mechanics; NO toughness/gear/ability tuning; NO breach changes; NO
  party-formation system; do NOT edit `competent.js` or
  `competent-answercourt-b.js`.

## Why N = 2, and the ceiling (pre-sim, from the committed corpus)

Analyzer: `scripts/analyze-successorcaution-ceiling-b.js` (reads the
committed ON corpus; no sims). Deaths group into succession episodes
(a new episode starts after a gap ≥ 3 days). Within an episode, a
daily-level gate gets its first chance at the first death with gap 1–2
from its predecessor; preventing it also prevents every later death in
that episode (no new succession, no cascade followers). The ceiling is
therefore all deaths from the first gap-1/2 death to the end of each
episode:

- Control (funeral-mend ON, 16 seeds): 148 scholar `the wild` deaths,
  95 while national, 884 national-days → **P1 control = 0.1075**.
- Gap shares (all 148): same-day (gap 0) 40 (27.0%), gap 1–2: 38
  (25.7%), gap 3+: 70 (47.3%).
- Ceiling (N = 2, perfect operation incl. cascade truncation):
  preventable while-national = 25/95 → **best possible P1 = 0.0792
  = 0.737x control**. N = 3, 4, 5, 7 give the SAME ceiling (episodes
  break at gap ≥ 3 by construction, so the first chance is the same
  death) — a longer window buys nothing in first order and costs
  foraging days, so N stays 2.
- **The assigned P1 bar (0.6x = 0.0645) sits BELOW the mechanism's
  first-order ceiling (0.737x).** The bar stands as the judge — it is
  not re-written here — but the pilot is expected to land between
  0.74x and 1.0x even if the lever works perfectly, because 70 of 95
  deaths are episode starters (bearers who survived ≥ 3 days — the
  caution window has expired for them) or same-day followers before
  any daily boundary, and some gap-1/2 deaths are Haven-breach fights
  the haven day cannot prevent (fighterhold probe: 6/24 fatal fights
  started inside the hall). Second-order effects (a surviving bearer
  becoming a veteran/killer) could push P1 below the ceiling — the
  pilot measures that or it doesn't. If the pilot shows the mechanism
  working at its ceiling but P1 lands ~0.74–0.85x, the correct verdict
  is NO-GO against the assigned bar WITH the mechanism validated and a
  recommendation to re-set the bar (or to aim the next lever at the
  gap-3+ established-bearer deaths, which this lever never touches).
  This note is written BEFORE any sims so the bar cannot be moved
  post-hoc.

## Baseline (committed funeral-mend ON corpus, 16 seeds 100201–100216)

`evidence/2026-11-14/perseed-funeralmend-b-on/` — competent-answercourt-b,
150d, FUNERALMEND default ON, master `b9b226430`:
- National-ever 14/16; end-state national 14/16; median national
  held-days **63.5**; dissolutions 0; median survival **130d**;
  starvation pooled **0**; total deaths 1273; wave-5 unlocked 7/16;
  wave-4 16/16; wins 0; table 0.
- P1 control (confirm band): **0.1075** (95 while-national scholar
  `the wild` deaths / 884 national-days).
- Pilot band (100201–100208) control: P1 **0.1057** (46/435); median
  held-days 65; starvation 0; median survival 133d; national-ever 7/8.

## Pre-registered bars (judge)

- **P1 (primary):** scholar `the wild` deaths per national-day
  (while-national deaths from the `deaths` arrays joined to the series
  `nationalLive` flag, per the ceiling analyzer) — **GO ≤ 0.6x
  control** (confirm: ≤ 0.0645).
- **P2:** median national held-days **≥ control (63.5)**.
- **Cost bar:** starvation pooled **≤ control + 2** (confirm: ≤ 2)
  AND median survival **≥ 0.8x control** (confirm: ≥ 104d).
- Horizon **150d**, death-aware (dead villages stop simulating).
- Seeds: pilot 100201–100208; confirm 100201–100216.
- Policies: control `competent-answercourt-b`; armed
  `competent-successorcaution-b` (new file, wraps answercourt-b).

## Stage 0 — reproduction (before any judged sim)

1. Control leg on the pilot band with the UNMODIFIED funeralmend
   driver (`scripts/funeralmend-driver-20261114.js`, OUTDIR into
   `evidence/2026-11-15/perseed-successorcaution-b-control/`) must
   reproduce the committed ON pilot numbers exactly (held-days per
   seed, deaths, starvation, survival). Any divergence is explained
   before judging anything.
2. The NEW driver (`scripts/successorcaution-driver-20261115.js`,
   copy of the funeralmend driver + third-policy dispatch + caution
   stats capture) must reproduce Stage 0a on seeds 100201/100203/
   100212 exactly (3/3) before it runs the armed leg.

## Pilot gate (all three before any confirm spend)

- (i) Mechanism fires: every pilot seed with ≥ 1 succession has
  cautionDays ≥ 1, AND band tripsSuppressed ≥ 1 (the lever actually
  skipped at least one would-be trip).
- (ii) Cost bar clean on the pilot band (starvation ON ≤ OFF + 2 AND
  median survival ON ≥ 0.8x OFF).
- (iii) P1 moves in the GO direction (ON < OFF on the pilot band).
- Kill the lever at pilot if the gate fails — never run 12–16 seeds on
  an invisible effect.

## Proof test

`scripts/test-successorcaution-b.js` proves: succession detected
(`villagerId` change → caution window set); trip suppressed on
caution days 0–1 after succession (wrapped daily NOT called when
`needTrip` is true; haven day runs instead); normal play resumes
after N days (wrapped daily called again); court beats still answered
on caution days; no `Math.random` in the new policy file; determinism
legs (same seed twice → identical stats).

## Measurement

- Driver: `scripts/successorcaution-driver-20261115.js` (copy of the
  funeralmend driver; records the `deaths` arrays the judge needs +
  the caution stats in `capSummary`).
- Balanced-panel compare per `docs/MEASUREMENT.md` §15; attach the
  compare `.md` to the evidence file.
- Telemetry deviation check per the body (with
  `--allow-recorder-corpus` if it refuses recorder input; investigate
  any LOUD line the same run).
- Evidence: `evidence/2026-11-15/sim-successorcaution-b.md` with a
  "metric review" section. Per-seed files under
  `evidence/2026-11-15/perseed-successorcaution-b-{control,on}/`.
- Sense-testing: read the linkLines — does a grieving new bearer
  staying home read sensibly (the voiced caution line + talk/tend
  lines at Haven), or does the village go silent on caution days?

## Metric review (to be filled in the evidence file)

Pre-registered here: P1 conflates trip deaths with breach deaths and
with established-bearer deaths — the ceiling section above quantifies
exactly how much of P1 this lever can ever move. If P1 moves less
than the ceiling, the review will say whether the shortfall is breach
deaths, non-trip outings, or a window that never engaged.
