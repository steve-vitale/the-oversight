# sim-rageprecheck-b — prereg: engine precheck refusing Unleash Rage re-press while live (B)

Run: fleshout-loop-b-20261114T0330Z (Loop B), arm sim-rageprecheck-b
Axis: winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat). This arm attacks the
wave-4-kills link: the competent policy (and capable's fallback into it)
burns turns re-pressing an unspent buff instead of striking.
Branch: sim-rageprecheck-b — worktree ~/workspace/worktrees/sim-rageprecheck-b
Base: master 8ab7a81c8 (branch tip at prereg time; anchor below)
Date: 2026-11-14
Anchor commit (prereg): 8ab7a81c85c80c4197a2e70b1a38d29404141baf

## Finding (arm sim-rageloop-b, evidence/2026-11-13/sim-rageloop-b.md)

Lever (A) — a POLICY-side once-per-fight guard in competent.js — worked
on competent (refresh presses 62 → 0) but the summed primary went
117 → 7 against a GO bar of 0: kill class METRIC-BROKEN, guard NOT
landed. The residual 7 are a second mechanism: capable presses rage
once through its own guard (capable.js abilityTurn ~340/363,
`I.n('rage.unleash_rage') < 1`), then competent's fallback presses it
a second time through a SEPARATE once-per-fight map (capable.js:471
fallback into competent's abilityPressPlay). Two independent per-fight
maps, one fight, two presses. The fix for the residual is this arm
(B): a single choke point in the ENGINE. (A) is NOT resurrected here —
(B) alone must zero the residual; if (B) alone does not reach 0 that
is the verdict, not a reason to add (A).

## Canon

- docs/CANON.md read. NO canon doc covers the rage ability; the
  authority is the data: src/data/abilities.json rage/unleash_rage —
  cost {turn: true, kcal: 60}, effect "Your next three strikes deal
  double damage." Canon gap noted, not invented. (docs/SYSTEMS.md
  covers abilities generally; docs/ABILITY-REFUSALS.md covers the
  refusal pattern this lever uses — see below.)
- Engine facts (verified in code, Stage 0): the engine counts STRIKES,
  not rounds (rageActive.rounds decremented per strike in
  _applyAbilityActionMods, abilityActions.js:543-547); rageActive is
  deleted at fight end (game.js:35115, BRAWLER FLAG HYGIENE); rage
  has NO engine precheck today (the key 'rage.unleash_rage' appears
  exactly once in abilityActions.js, the impl at :1619).

## Lever (B) — DESIGN DECISIONS (pinned before any judged sim)

Add `'rage.unleash_rage'` to `ABILITY_ACTION_PRECHECKS` in
src/js/abilityActions.js, in the haymaker shape
('haymaker.throw_haymaker': refuse while `haymakerReady` is loaded,
"Already wound up — swing to release it."):

1. **Refuse while rounds > 0 (any live buff)** — not only at rounds=3
   (wholly unspent). The finding says "while live": a re-press at
   rounds=2 or 1 re-arms to 3, buying at most one extra strike for a
   turn + 60 kcal while a strike is available — the same waste in a
   smaller coat. `s.rageActive && s.rageActive.rounds > 0`.
2. **A refused press must NOT charge the turn or the 60 kcal.**
   Guaranteed by placement: ABILITY_ACTION_PRECHECKS run in
   useAbility BEFORE payment (abilityActions.js ~248) and in
   activatableAbilities (button honesty, ~441) — a refused tap never
   eats the turn, per the module's own precheck_before_payment rule
   and docs/ABILITY-REFUSALS.md. The driver counts only
   successful (returned true) presses toward the primary; refused
   presses are reported separately as proof the choke point fired.
3. **The refusal surfaces honestly in the fiction**, via useAbility's
   existing pattern: `this.say(preR2.why + ' (Unleash Rage)')`.
   Why text: "The red is already down — your next strikes are
   already doubled. Strike to spend it." No new SAY-dedup needed:
   the steeple once-per-fight announce dedup in the impl stays for
   fresh presses; refreshes never reach the impl, so the line can
   never storm again. The button also goes honest via
   activatableAbilities (same precheck, same why).

Why (B) over a shared press record: the engine is the single entry
point — every caller (competent, capable, capable's fallback, the
player's own tap) goes through Game.useAbility. One choke point,
zero per-policy maps to reconcile.

## Pre-registration (MEASUREMENT §§9–12, 14–15)

- Primary metric: SUCCESSFUL wholly-unspent refresh presses per band
  = presses where Game.useAbility('rage','unleash_rage') returned
  true while rageActive rounds=3, summed over competent + capable on
  identical seeds. GO = 0 on the pilot band. (0 is reachable by
  construction: the precheck refuses every re-press while live, and
  fight-end hygiene guarantees the first press per fight is fresh.)
  Per-presser split reported separately (0130Z metric review):
  competent-run refresh-unspent, capable-run refresh-unspent, and
  within capable, capable-path vs competent-fallback-path (stack
  classification in the driver).
- Secondary: refused re-presses (count + split, proof the choke
  point fires and policies keep trying); partly-spent refreshes
  (successful presses at rounds 1–2 — must also be 0); wave-4/5
  kills, strikes landed, rage presses per fight (max), rage kcal per
  band, wave-4/5 reach.
- Guardrails: starvation ≤ control+2 on totals; median survival ≥
  0.8× control median. A GO met with a guardrail breached is NO-GO.
  Villager (non-scholar) deaths reported alongside (§14c co-primary).
- Horizon: 150d death-aware (reachability lever: waves 4–5,
  veterans). Dead villages stop simulating (+10d tail max).
- Policies: competent + capable, both legs on identical seeds.
- Seeds: 98801–98808 (pilot — the SAME band as sim-rageloop-b, so
  this arm's baseline should reproduce that arm's before-leg numbers
  on the same code shape; freshness re-verified 2026-11-14: 0
  seed-literal hits anywhere except this arm's own driver copy and a
  CSS color (#98806a)). Confirm band, if the pilot goes:
  98801–98816.
- Instrument: scripts/rageprecheck-driver-20261114.js — copied from
  scripts/rageloop-driver-20261113.js on branch sim-rageloop-b
  (NOT re-derived), adapted only: evidence dir 2026-11-14, arm label
  rageprecheck-b, primary counts successful presses only, refused
  presses counted separately, caller classified from the stack.
  Before/after secondaries run through the balanced panel
  (scripts/balance-panel.js, §15). Unlike the policy arm, (B) is a
  GAME-code change, so the panel compare should be valid; attempt it
  and report its decision.
- Baseline = current master on identical seeds (no (A) guard — it
  never landed). The before leg is run on this tree's base code
  before the fix commit; the after leg on the fix commit.

## Stages

- Stage 0 — smoke (seed 98801, both policies): does the precheck
  fire? Does the primary move?
- Stage 1 — pilot (8 seeds, competent + capable, before/after on
  identical seeds). GO only on primary = 0 AND guardrails held.
- Stage 2 — confirm (16 seeds, 98801–98816) ONLY on pilot GO.
- If the pilot fails the GO bar: KILL the lever, classify per §14a,
  document, do NOT run a confirm, do NOT add (A).

## Proof test

scripts/test-rageprecheck-b.js — RED→GREEN on the fix commit.
Static legs: precheck text present (rounds > 0), haymaker mirror
intact, impl untouched, canon cost turn + 60 kcal, prereg commit is
an ancestor. Game legs: re-press refused while live at rounds 3, 2
and 1; no turn/kcal charged on refusal; fresh press allowed after
the buff is spent; a new fight allows a fresh press; three strikes
spend rounds 3 → gone; driver legs on seed 98801 (refresh-unspent
→ 0 per policy, fighter actually struck).

## Notes

- This changes combat feel: the fix commit carries [needs-eyes].
- The steeple narration fix (sim-steeple-a, live on master) is
  untouched; the rage SAY dedup stays in the impl. Press counts
  before/after are the honest comparison.
- Kill taxonomy (§14a) applies to any kill: CONCEPT-DEAD /
  METRIC-BROKEN / SUBSTRATE-MISSING.
