# sim-steeple-a — PREREGISTRATION (arm: narration-dedup check-first, run fleshout-20261113T1615Z, Loop A)

## Arm
CHECK-FIRST narration-dedup — sim-findings.md #2301 + #2302 (2026-11-13,
claimed by this arm, run fleshout-20261113T1615Z, scale-onramp axis).
Both were sense-filed by Loop A arm sim-applystatus-a (evidence
/2026-11-13/sim-applystatus-a.md) out of its after-leg corpus
(seed 190396, d130, Congregation fight; sense replay /tmp/sense-190396.txt
is ephemeral and gone — this arm rebuilds the replay from a fresh run on
the matched band). Each line is judged SEPARATELY, on its own trigger.

- #2301 UNLEASH RAGE: "The red comes down. Your next 3 strikes deal
  +100% damage. (Unleash Rage — hold on.)" fires 17 times identically in
  one fight (seed 190396 d130, Congregation fight).
- #2302 STEEPLE: "🔔 The steeple RINGS — the bell is the telegraph.
  ABSOLUTION falls like a beam." fires 57 times identically in one
  fight (same seed/day).

## Canon read (before any fix claim)
- docs/CANON.md (manifest) — read.
- docs/MONSTER-WAVES.md — The Congregation, wave 4 (Standing >= 100):
  "faith as a weapon — genuine absolution at the price of obedience;
  heresy is the counter". Wave-4 bands, invite-then-absolve liturgy.
  Codex "slain" text: "Absolution (the bell rings, then the strike —
  plus a geas if you accepted)". Telegraph honesty is law.
- docs/SYSTEMS.md — read; it is a systems map and carries NO
  Unleash-Rage-specific canon. No canon doc covers the rage ability.
  The authority is the data: src/data/abilities.json
  rage/unleash_rage — cost {turn: true, kcal: 60}, effect "Your next
  three strikes deal double damage." Canon gap noted, not invented.
- src/data/monsters.json, Congregation: attacks Absolution [50,70]
  (beam, windup 2, weight 3) and Excommunication [42,62] (beam,
  windup 2, weight 2, hpBelow 0.5). The data telegraph: "The steeple
  RINGS before it strikes — the bell is the telegraph."

## Static findings (the trigger hypotheses, to be confirmed by the check)
- #2301 RAGE: `rage.unleash_rage` (src/js/abilityActions.js:1619)
  sets `s.rageActive = {rounds: 3, dmgMult: 2.0}` and says the line,
  unconditionally. There is NO `'rage.unleash_rage'` entry in
  ABILITY_ACTION_PRECHECKS — re-pressing while the buff is live is
  allowed, overwrites rounds to 3, and re-says the line, spending the
  turn + 60 kcal each time. (Contrast haymaker, which HAS a precheck
  refusing re-tap while wound up, with the comment "a policy that
  taps it every turn softlocked the fight".) The competent policy
  (scripts/policies/competent.js:2598, step 5) presses rage on EVERY
  winning, non-trivial player turn, with NO once-per-fight guard
  (unlike bird_strike / pocket_sand, which use `pressed.*`). The
  pocket_sand comment names "the rage-loop failure shape" — the
  policy pressing rage every turn is a known shape. So the 17 firings
  are plausibly 17 distinct ability USES, most of them REFRESHES of
  an already-live, unspent buff (pressing consumes the turn, so no
  strike ever spends the rounds). The check measures per-press
  pre-state: rageActive rounds before each press (null = fresh,
  1–3 = refresh, 3 = wholly unspent).
- #2302 STEEPLE: `sigCongregationHook` (src/js/sigW4.js:141) runs once
  per Congregation monster-turn via `mbRunPreTurn`
  (src/js/monsterBehaviors.js:208, called from tbMonsterTurn,
  src/js/game.js:43319; preTurnHooks ["sigCongregation"] in
  src/data/monsterBehaviors.json). After the invitation resolves, EVERY
  absolve-phase monster turn says the steeple line and returns false
  so the generic beam runs. The beam is NOT one per hook call: a beam
  cycle is declare (windup 2 turns) → ignition beat ("💥 Absolution!
  A ray of light lances...") → firing ticks, and the monster may pick
  Excommunication instead of Absolution below half HP. So the line is
  plausibly PER-MONSTER-TURN, not per-beam-attack — the check counts
  steeple lines vs Absolution/Excommunication IGNITION beats per
  (fight, monster). Telegraph preservation if fixed: the ignition beat
  fires once per beam cycle and names the attack, and the data
  telegraph text rides the telegraph UI — so a once-per-fight dedup
  of the hook line does not leave later cycles untelegraphed. (The
  invite line, sigW4.js:164, fires once via the C.offered guard — not
  in scope. The geas lines fire at most 2 rounds — not in scope.)

## Step 1 — CHECK (this prereg covers the check leg only)
- Anchor: **48ed1ffd753a142286e99201d68124d9aaa0de3f** (worktree
  ~/workspace/worktrees/sim-steeple-a, branch sim-steeple-a, rebased
  cleanly onto current master 48ed1ffd7 before this prereg; tree
  clean). Driver refuses to run unless `git rev-parse HEAD` ==
  the prereg commit (EXPECTED_ANCHOR env override for the after leg,
  same shape as applystatus-a). Sibling arms on this run:
  sim-strikefall-a (findings #2303/#2304, different emit sites —
  strike-after-fall ordering, square-screams line) — no file overlap
  expected; this arm's fix sites, if any, are src/js/abilityActions.js
  (rage line) and src/js/sigW4.js (steeple line).
- Policy: competent VERBATIM (scripts/policies/competent.js as on
  master; sha256 recorded per seed — no policy edits, no candidate).
- Seeds: matched band **190391–190398** (8 seeds) PLUS targeted seed
  **190407** — the exact seed family of the applystatus-a observation
  (190396 d130 is the observation day). Total 9 seeds. Reproduction
  check, not a new experiment.
- Horizon: **150d death-aware** (MEASUREMENT §10; observed day d130;
  villages stop at death).
- Instrument: scripts/steeple-check-driver-20261113.js (adapted from
  the applystatus-a driver, same harness shape) — wraps Game.say and
  captures every line matching the two regexes with day + fight id +
  live-fight context, wraps Game.useAbility to log every rage press
  with its pre-state, and counts per-cycle ignition beats
  ("💥 Absolution!"/"💥 Excommunication!") as the beam-cycle proxy.
  Controls: the freezeline-a line (after-leg total 21 across this
  band) and the applystatus-a line (after-leg total 10) — both fixes
  live on master, both totals must hold. Per-seed JSON to
  evidence/2026-11-13/perseed-steeple-a-check/ (writeRobust,
  flap-proof, refuse-overwrite). Survival numbers per seed (days,
  endReason, scaleRank, maxWave, standing, deaths) recorded
  alongside, so a step-2 fix has its before-leg on identical seeds.
- §15 note: the check is a single-leg reproduction measurement, not a
  before/after lever comparison — no balanced-panel compare applies
  to the check leg. If step 2 runs, the after-leg re-runs this same
  driver on the same seeds and the comparison is the per-seed line
  counts + survival numbers (narration-only: survival must be
  byte-identical on the same seeds).

## Primary metrics (check)
- RAGE: total count of the line across the check set; max identical
  group per (fight); per-press pre-state split (fresh vs refresh,
  rounds at press time); rage presses per worst fight.
- STEEPLE: total count of the line across the check set; max per
  (fight, monster); ignition beats per (fight, monster) for the same
  fights; live Congregation count in the worst fight.

## Decision rules (judged per line, BEFORE seeing data)
- #2301 RAGE — GO-FIX iff the worst fight shows ≥2 rage lines AND at
  least one of them is a REFRESH press (rageActive live at press
  time, rounds > 0): the repeat is a re-application repeat, same
  class as the fixed freeze lines. Fix shape: once-per-fight dedup
  of the SAY only, at the `rage.unleash_rage` emit site (flag on the
  live fight object, cf. applystatus f._seApplyAnnounced); the
  mechanic is untouched (refresh still applies, turn + 60 kcal
  still paid, press counts unchanged). GO bar: rage line ≤1 per
  fight. CHECK-NO-GO iff EVERY press in every fight is FRESH
  (rageActive absent at press time): each firing is then one honest
  announcement per distinct buff application — do NOT dedup; file
  the design question instead (policy press cadence / variant
  lines), and leave the finding [claimed] with the reason.
- #2302 STEEPLE — GO-FIX iff in the worst (fight, monster) the
  steeple count EXCEEDS the ignition-beat count for that fight (the
  line repeats within/across beam cycles: per-monster-turn, not
  per-beam). Fix shape: once-per-(fight, monster) dedup of the SAY
  only, at the `sigCongregationHook` absolve branch (flag on the
  live fight object keyed by monster key, cf. freezeline
  f._stunAnnounced); the mechanic is untouched (beam, geas,
  invitation all behave exactly as before; ignition beats unchanged
  in count — the per-cycle telegraph survives). GO bar: steeple line
  ≤1 per (fight, monster). CHECK-NO-GO iff steeple count EQUALS the
  ignition count per (fight, monster) (one firing per distinct beam
  cycle): each firing is then one honest telegraph per attack — do
  NOT dedup; file the design question instead (variant lines per
  cycle), and leave the finding [claimed] with the reason.

## After-leg GO bars (step 2, if reached — judged on identical seeds)
- (a) Each fixed line fires ≤1 per (fight, monster) — rage: ≤1 per
  fight. Verified from the after-leg per-seed JSONs (maxGroup = 1
  for every fixed line on every seed).
- (b) Telegraph/mechanic preservation: ignition-beat counts
  byte-identical per seed (steeple fix); rage press counts
  byte-identical per seed (rage fix — the mechanic still runs, only
  the repeat say is silenced). No new say-silence anywhere else.
- (c) Survival/wave numbers BYTE-IDENTICAL on all 9 seeds (days,
  gameDays, endReason, won, over, villageLost, scaleRank, maxWave,
  unlockedWave, standing, endPantryKcal, FULL deaths arrays).
- (d) Controls hold: freezeline total 21, applystatus total 10
  (unchanged — different emit sites).
- (e) Proof test scripts/test-steeple-a.js RED→GREEN (instrument
  legs + game-level legs: staged Congregation fight with N monster
  turns → 1 steeple line + N ignition beats; staged rage presses
  while active → 1 line, buff still refreshes; second fight
  re-announces once; expired-rage re-press after the fight boundary
  still announces in the new fight).
- (f) `node scripts/check.js --quick` adjudicated (pre-existing
  failures only, 0 attributable).

## Metric review
(To be written after the legs run: did the pre-registered metrics
judge the run, or did the metric prove wrong?)
