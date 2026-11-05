# Flee-when-losing probe — PRE-REGISTRATION (arm sim-staypolicy-a)

Run: fleshout-20261105T0915Z (Loop A). Axis: winnability chain (wild
ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Tracker's next blank: the other half of the
finishing blank — does disengaging from a losing wild wave-4 fight
preserve fighters so the village gets more kill chances later?
Committed BEFORE any judged sim. POLICY-SIDE ONLY: one new file under
scripts/policies/, zero src/js changes, zero default-policy changes, no
gate, price, deed-gate, readyDemand, or VETSHAPE change, ever.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": wave-4 bands (anchored):
  damage 35–95, HP 850–1500, pierce 0.2–0.5 — a 4–6 round fight for a
  godhood build (~220 dmg/round). Wave 5 demands 2 LIVING villagers
  with wave-4+ kills. No canon invented here.
- Steve 2026-11-02 monster-commitment ruling (MONSTER-WAVES.md,
  fieldFights.js `mCanFlee`): monsters do NOT flee without an explicit
  flee component. It covers MONSTERS, not villagers — it is not cited
  here as covering villager flight. Wave-4 monsters carry no flee
  component, so in a wild wave-4 fight the only flee that ever happens
  is the villager's (or the scholar's).
- Steve 2026-10-09 risk-tolerance law (fieldFights.js): flee is a
  SITUATIONAL decision, not a flat roll — morale-driven, wound +
  bravery + temperament. This arm tests one situational rule (the
  50/50 trigger below) on the scholar's side only; it does not touch
  the engine's villager morale line.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-05/sim-finishhold-b.md` (band 99161–99168, 150d,
  8 seeds, competent verbatim baseline): wave-4 kill rate 11/132 =
  8.3%; TB kills 10, field kills 1; median survival 121d; field-fight
  party deaths 22. Focus fire KILLED: parties HOLD losing fights they
  would have fled — joined-fight leader deaths 5 armed vs 0 baseline;
  0 kills in 37 focus-fire fights.
- Corpus re-read for this prereg (numbers computed from
  `evidence/2026-11-05/perseed-finishhold-b/`, baseline leg only, not
  re-judged): 132 wild wave-4 fights — field 77 (flee 54 / death 22 /
  kill 1), player-TB 55 (**death 45 / kill-or-rout 10 / flee 0**). The
  scholar NEVER exits a wave-4 TB fight alive. TB kills (10) all have
  damageFrac 1.00, entry HP 29–940, rounds 3–18; TB deaths have median
  damageFrac 0.056 (max 0.964 — one fight dealt 96% and still died).
  Field fights: 0 scholar-led (fighter 'p' count 0 in 77).
- `evidence/2026-11-05/sim-secondkiller-b.md`: scholar TB fights end
  in death 24/28; field fights 0 kills in 30, median 2.7% of monster
  HP dealt in 2–3 rounds before fleeing (18) or dying (11).

## Step 1 verdict — field-fight disengage: NOT expressible policy-side

Determined from the code, before any sim (file/function names):

- `Game.fieldFight(vid, mdef, m, opts)` is called by game code only:
  `src/js/villager-agency.js:420` (wild seeker fights),
  `src/js/game.js:7940` and `:20522` (wild patrol/wanderer routers),
  `src/js/nomad-wild.js:329`, `src/js/nomad-drive.js:397`,
  `src/js/havenGrowth.js:872` (raid, `cornered: true`),
  `src/js/alienPlayers.js:2735`, `src/js/comms.js:647`,
  `src/js/contestEngine.js:383,624,653`, `src/js/corruption.js:676`.
- The flee decision is computed INSIDE `fieldFight`
  (fieldFights.js ~line 2092: `fleeAt` from the hopeless/winning
  trajectory, `vBreak` from bravery XP + temperament). The only opts
  that touch the decision are `braveryBonus` (contest cheer only),
  `noFlee` (sealed arenas only), and `allyFromStart` (aid fights
  only). None of them is a disengage knob a sim policy could set for
  wild fights.
- The competent policy (`scripts/policies/competent.js`) contains
  ZERO mentions of `fieldFight`; the sim harness
  (`scripts/sim-harness.js`) contains ZERO mentions of it. The
  policy's `fight` hook is invoked ONLY by the harness TB drive loop
  (sim-harness.js ~line 745, inside `while (Game.tbfight &&
  !Game.tbfight.over ...)`) — i.e. only for the scholar's own
  turn-based fights. No policy hook runs during a villager field
  fight, ever.
- Corpus confirmation: 0 of 77 baseline field fights were
  scholar-led. The nomad-drive / nomad-wild scholar-led paths
  (`fighterId || 'p'`, `vid || 'p'`) never fired in the baseline
  corpus.
- Therefore the brief's "wild wave-4 field fights" is NOT runnable
  as written policy-side. The expressible surface is the scholar's
  own wild wave-4 TURN-BASED fights — the channel where 10 of 11
  baseline kills happen and where the scholar dies in 45 of 55
  fights while fleeing 0 times. This arm tests the disengage decision
  THERE, and measures field fights as the untouched control channel
  (any movement there is spillover, never the lever). The question
  is unchanged — does disengaging from a losing wild wave-4 fight
  preserve the fighter so the village gets more kill chances later —
  asked on the channel where the kills and the deaths both live.
  (Precedent: sim-finishhold-b's prereg did the same Step 1
  determination for hold-ground / focus-fire, then ran the
  expressible lever.)

## Why the scholar never flees today (the defect the variant repairs)

Read from `scripts/policies/competent.js` `fight()` (line ~3377) and
its `flee()` closure:

- Turn 1 of a wave-4 TB fight, the legacy outmatched block fires:
  `totalMhp > 2.5 * pmax` is always true for a wave-4 monster
  (HP 850–1500 vs scholar ~100 max HP), so the policy decides to walk
  away — then on later turns it strikes while HP holds, and at
  hpPct < 0.35 the mid-fight eject calls `flee()` again.
- But the legacy `flee()` NEVER pushes through the barrier: the
  barrier push is gated on `dpsRaceOn()` (`COMPETENT_DPS_RACE=1`,
  killed at pilot 2026-10-13, default OFF). With all gates off the
  scholar walks to the nearest x-edge and then stands there pressing
  a no-op flee while the monster kills them — the exact failure the
  r1 comment records ("ten no-op 'flees' from the same edge tile").
  Corpus proof: 0 TB flees in 55 fights, 45 deaths.
- So the competent policy ALREADY decides to disengage from losing
  wave-4 TB fights; the decision exists, the exit does not. This
  variant changes ONLY the disengage: when the trigger below fires,
  the scholar disengages through the engine-honest barrier exit
  instead of walking to the edge and dying there.

## Lever picked — flee-when-losing (ONE policy variant)

**File:** `scripts/policies/flee-when-losing.js` — a wrapper around
`competent` verbatim. It overrides ONLY the `fight` hook. Every other
hook (daily, upkeep, pending, contest, ...) is the base policy's
object, unchanged. It sets NO env gates, touches NO other policy
file, and changes NO default: `competent.js` is byte-identical.

**TRIGGER (exact, frozen for this run — do not tune mid-run):** on
any player turn of a TB fight containing a LIVE wave-4 monster, if
**scholar HP fraction < 0.50 AND live wave-4 monsters' remaining HP
fraction > 0.50** (HP summed over live wave-4 fighters, fraction
against their summed max HP), the scholar disengages. Otherwise the
turn delegates to the base policy untouched.

Why 50/50, and why this shape:

- At half health the scholar has ~1–2 monster turns left (wave-4
  damage 35–95/round vs ~100 HP); a monster still above half needs
  more rounds than the scholar has. It is the "we're losing this
  one — live to fight another day" line a person would draw, and it
  is symmetric and legible with no hidden knobs.
- The monster-half condition protects winnable finishes: a monster
  already below half (wounded entry — the corpus's kills enter at
  29–940 HP) is never abandoned, however hurt the scholar is. The
  scholar-half condition protects the scholar: above half health the
  fight is still the base policy's to fight.
- The trigger fires mid-fight, not at fight start: at turn 1 the
  scholar is usually at full HP, so the base policy's turn-1
  outmatched walk-away still happens first (one step toward the
  edge), and the variant takes over the retreat only when the race
  is actually lost. Entering a wave-4 fight already below half HP
  against a fresh monster fires the trigger on turn 1 — correct: that
  fight is lost before it starts.
- Rejected alternatives: the DPS-race instrument
  (`dpsRaceAssess`) needs two lost windows (turns 3+5) and was inert
  in practice (0 fires in 50 windows, r1); wave-4 TB fights end in
  death too fast for it. A pure scholar-HP trigger (flee below X%
  regardless of monster HP) would abandon the close fights the
  corpus shows are winnable (one death fight dealt 96.4%). A pure
  monster-HP trigger (flee while the monster is above Y% after N
  rounds) ignores that the scholar sometimes survives long enough
  for companions to finish (kills with 0–4 scholar swings exist).

**DISENGAGE ACTION (exact):** the w4abstain-proven mechanics
(`scripts/policies/w4abstain.js` `abstainFlee`, same engine verbs,
nothing invented): walk one tile per turn toward the nearest grid
x-edge; on the edge, push THROUGH with `Game.tbBarrierExit(dx, 0)`.
Direction stays nearest-edge on purpose — directional (havenward)
flee is a separate, already-measured axis (r1/r2, fleerepair-a);
changing the direction here would confound the trigger, which is
the only experimental variable.

**STUCK / SEALED GUARDS (exact, frozen):** if a flee step moves the
scholar nowhere for 3 consecutive turns, or a barrier push is
consumed WITHOUT exiting (sealed arena, blocked far side, stasis —
detected by map position + fight still live after the push), the
fight is marked unfleeable and all later turns delegate to the base
policy — the scholar fights it out, never stands at the edge
pressing flee. This is the fleerepair-a lesson applied to the new
layer. Every guard firing is counted on ctx + module stats.

**SCOPE (exact):** wave-4 TB fights ONLY. Wave-5 TB fights, wave 1–3
fights, contest-arena fights that are not wave-4, feast draws of
other waves, and the pending hook all delegate to the base policy
unchanged. (A wave-4 fight inside a sealed arena still attempts the
disengage once — the consumed-push guard then fights it out; the
honest cost of a sealed fight, counted.) Field fights are untouched
by construction (see Step 1).

**COUNTERS (ctx + module stats, per fight and per run):**
`swlChecks` (wave-4 TB player turns evaluated), `swlTriggerFires`
(fights where the trigger fired ≥ once), `swlFleeTurns`,
`swlExits` (barrier pushes that actually exited the fight),
`swlStuckFallbacks`, `swlSealedFallbacks`, `swlEvents` (per firing:
day, monster id, player turn, scholar HP frac, monster HP frac,
result). The driver captures these per seed into the corpus JSON.

Honest expectation, stated now (not a hedge on the verdict): the
scholar dies in 45/55 baseline TB fights, so saving scholars should
be easy to see — but the kills need the scholar (or companions) to
stay in fights the trigger abandons, and the trigger fires exactly
in the fights where the scholar is losing, which is also where the
rare comeback kills (96.4%-then-died) live. The GO below is set at
the brief's bar anyway and judged strictly; if it NO-GOs, the
diagnostic intermediates (trigger fire rate, exits vs deaths
mid-retreat, TB kill channel split) decide the NEXT blank, and the
policy file is deleted unless the evidence justifies keeping it as
a measurement tool.

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 99241–99248: verified free — no `99241`…`99248` token
  in `evidence/2026-11-05/*.md`, `evidence/2026-11-04/sim-*.md`, or
  any `perseed-*` filename in `evidence/2026-11-05/` at prereg time.
  (The brief suggested 99221–99228; that band was used 2026-11-04
  by tendfloor-guard-adopt-b on 99217–99232, so the next free band
  is taken to keep attribution clean. Seeds are RNG inputs only;
  the band is fresh to this arm and identical on both legs.)
- Competent policy verbatim (`scripts/policies/competent.js`,
  `competent` export), 150d death-aware horizon (dead villages stop
  simulating, +10d tail max via runDays). 150d matches the sibling
  arms (secondkiller/finishhold) and covers the wave-4 window with
  baseline median survival ~121d.
- 8 seeds pilot, baseline FIRST on current code
  (`RUN=staypolicy-baseline`), then armed on IDENTICAL seeds
  (`RUN=staypolicy-armed`) after the variant lands. Same instrument,
  same driver, same analyzer for both legs.
- Stage 0 smoke (1 seed, 99241, to /tmp, NOT judged): instrument
  fires — per-fight records present, 0 instrument errors, field + TB
  wrappers restore cleanly (off/on neutrality leg, see Proof).
- Corpus to `evidence/2026-11-05/perseed-staypolicy-a/` (one file per
  seed per leg, `instrumentErrors` 0 required; any instrument error
  is a loud failure to fix, not to paper over).
- Confirm 12–16 seeds on a FRESH band ONLY on pilot GO. Pilot
  NO-GO ends the arm: delete the policy file (killed arms leave no
  trace) unless the evidence justifies keeping it as a measurement
  tool — say which, in the evidence.

## Per-fight record (instrument: finishhold base + staypolicy fields)

`scripts/staypolicy-instrument-20261105.js` = the finishhold
instrument verbatim (secondkiller record shape + TB scholar-vid
fix), plus per-seed `stayStats` captured by the driver (trigger
fires, flee turns, exits, stuck/sealed fallbacks, per-firing events
with day/mid/turn/HP fractions/result). Analyzer joins stay events
to fights by day + monster id (approximate join, disclosed in the
evidence). Field-fight records are unchanged (control channel).

## Primary metric (binding — judge only against this)

Wave-4 kill rate per wild wave-4 fight (matched kill-log rows only,
STRICT matching: killer must be among the fight's fighters; TB "won"
is never counted as a kill without a kill-log row), baseline vs armed
on identical seeds 99241–99248. Analyzer:
`scripts/staypolicy-analyze-20261105.js` (finishhold analyzer copy,
prefix `staypolicy-s`, plus staypolicy trigger/fire-rate splits).

- **GO: armed kill rate >= 15% AND >= 3 kills on the pilot band.**
- **Guardrails (both must hold, else NO-GO even on a kill GO):**
  median survival (armed) not worse than baseline by > 10 days;
  field-fight party deaths (vDie endings, count) not up by > 25%
  relative to baseline.
- Pilot-gate rule: 8 seeds before/after before ANY confirm spend.
  Confirm 12–16 seeds on a FRESH band only on pilot GO.

## Secondary (reported, never re-scored)

- Trigger diagnostics: trigger fire rate (fights with ≥1 firing /
  wave-4 TB fights), exits vs deaths mid-retreat (exits / trigger
  firings; scholar deaths in fights where the trigger fired),
  stuck/sealed fallback counts.
- TB channel: kill rate, median damage fraction, death share, flee
  share (the lever's channel — 0 flees baseline), scholar deaths in
  TB vs out of TB (scholarDeaths inCombat flag).
- Field channel (control): kill rate, flee/death shares, party
  deaths (the guardrail count) — any movement here is spillover.
- Wall numbers every run: wins, national, table, wave 4–5 unlocks,
  wave 4–5 faced, median survival days (both legs).
- Per-seed table per leg: days, end reason, wave-4 fights, wave-4
  kills, killers ever, living killers at end.
- Village assessment in plain words and the named next blank.
- Sense-testing law: read at least one disengagement's say-lines end
  to end (death-day say lines + one fled fight's log), judged for
  meaning — do the disengagements read like people choosing to live,
  not robots — not just counts.
- Balanced panel (§15): before/after comparisons run through
  `scripts/balance-panel.js`; the compare `.md` is attached to the
  evidence file. LIMIT, stated now: the panel's
  `scripts/sweep-compare.js` POLICY_REGISTRY is hardcoded and throws
  `unknown policy` for unregistered names — a one-off probe policy
  cannot run through it without editing the shared registry, which
  is out of scope for a policy-side-only probe arm. The
  before/after in this arm runs through the shared
  instrument/driver/analyzer on identical seeds (the same discipline
  the sibling probe arms used). If the panel cannot run on this
  corpus, say so in the evidence instead of fabricating it.

## Metric review (per §14; filled at verdict time, not now)

- Whether the kill-rate GO was reachable at all for a disengage
  lever given the damage×survival product (baseline TB median
  damageFrac 0.113, deaths 0.056) — and whether a scholar-survival
  or exits-per-firing threshold would have been the honest primary
  for a flee lever.
- Whether the trigger fired where specified (firing fights vs the
  50/50 definition; any fight where it should have fired but did
  not, and why) and whether the 50/50 line was the right line.
- Whether 8 seeds / 150d gave enough wild wave-4 fights to judge
  the GO, or the band was too thin.
- Whether field-channel spillover (if any) was real or seed noise.

## Proof (committed with this prereg, before judged sims)

`scripts/test-staypolicy-20261105.js` — fixture tests on a fake Game
(trigger fires exactly at the 50/50 line incl. boundary cases:
scholar 0.49/monster 0.51 fires, scholar 0.51 does not, monster 0.49
does not; non-wave-4 delegates to base; wave-5 delegates to base;
stuck-flee 3-turn fallback; consumed-push fallback; no env gates set
by requiring the variant; base `competent.js` untouched — the variant
only wraps) + a live harness smoke (5d) + an off/on neutrality leg
(10d, seed 99241: identical days, endReason, kill-log length, 0
instrument errors) + a variant-vs-baseline neutrality leg (10d, seed
99241: identical days/endReason/kill-log — no wave-4 fights exist
before day ~40, so the variant must be byte-identical in outcome).
Instrument: `scripts/staypolicy-instrument-20261105.js` (finishhold
base + staypolicy fields). Driver:
`scripts/staypolicy-driver-20261105.js` (POLICY=baseline|staypolicy).
Analyzer: `scripts/staypolicy-analyze-20261105.js`.
