# Ability use, game-code follow-up — passive audit, NPC skill twins, combat-bar surfacing, choices vs gear (2026-11-03)

Steve's law, sharpened 2026-11-03 21:14 CST: abilities and choices are
supposed to be as impactful as any gear a fighter gets. Abilities are
totally underutilized today. Not all need to be active — some are just
large passive stat boosts, and those count.

## WHERE THE PRIOR ARM LEFT IT (read first, not re-litigated)

Branch `ability-use`, tip `077da81f2`. Diagnosis: selection is ~96% of
the scholar gap and ~89% of the NPC gap (fighters hold skill-lane combat
actions; the only selection machinery is built around magic abilities).
Fix leg: POLICY-ONLY widened cascade in `scripts/policies/competent.js`
(skill rows 0→55, presses/fight 0.78→2.52, rage presses 35→2, TB kills
2→4, median survival 76.5→107.5d). That fix is deploy-excluded: it
proves the BOT presses. It puts nothing in players' hands and nothing
in villagers' hands. Do NOT cite it as the abilities problem solved.

CORRECTION TO THE PRIOR DIAGNOSIS'S BUCKET LABEL (found while scoping
this arm, stated before any new measurement): the "no-npc-path 25"
bucket counted membership in tbVillagerAbility's hand-written base five
(scream_cheese, pocket_sand, fear_aura, rage, shoulder_check). It did
NOT mean no NPC path exists anywhere. `godpath.js` wraps
tbVillagerAbility: after the base five find nothing, `villagerCast`
runs, and its KIT covers six more actions for any villager holding
them — static_toss, cheese_wheel, bird_strike, turncoat, freeze_tag,
retribution — gated by pantry tier, belly kcal, plan scores, and
per-fight uses. In the diagnosis leg those kit casts fired ZERO times
(unknown-which rows 0), either because no kit ability was held in the
10 ally fights or because the gates never opened. This arm measures
kit fires explicitly in its before-leg instead of assuming. Skill
actions carry no `do` verb and no KIT entry: for them there genuinely
is no NPC path anywhere. Those are the twins.

DESIGN RULE FOR TWINS (fixed here, before implementation): twins live
inside tbVillagerAbility and set villager-fighter flags directly,
mirroring the base five. They NEVER call Game.useAbility — that charges
the SCHOLAR's kcal and sets SCHOLAR flags, which would be a silent
scholar tax and a lane violation. NPC presses therefore touch scholar
kcal not at all (dinner test unaffected by construction; verified by
code read + proof test, not by assumption). Pantry-tier gating comes
free: the foodPower wrapper around tbVillagerAbility already gates the
whole call. Perception law: every twin trigger reads only this
fighter's own position, HP, and the live monsters on its own tiles —
no roster, no global list.

## GEAR-STEP YARDSTICK (fixed here, used by audit + choices legs)

Player strike = roll([10,16]) + weapon bonus. Mundane bonuses 5–40;
loot-tier melee 25/45/60/80, ranged 35/50/120. One loot-tier step =
+15–20 flat damage per strike. Armor audit steps (damage taken per
hit): 45→34→32→28→17, i.e. tier steps of 2–11 per hit. So:
- a damage passive rivals gear iff it adds >= +15 per strike sustained;
- a defensive passive rivals gear iff it absorbs >= +4 per hit sustained
  (the smallest armor-tier step).
Player armor uses a diminishing curve, not flat subtraction:
r = prot/(prot+20); absorbed = min(final-1, round(final*r)), with
monster pierce (wave-3+ 0.1–0.75) cutting prot first. chitin_skin's
+30 prot is therefore NOT +30 per hit; the audit computes it through
the curve. Villager armor in TB fights reads ONLY t.varmor —
npcHeld armor.flat does NOT feed tbDamage for villagers (it DOES feed
fieldFights.js:618, so the field scope differs; TB scope is this arm's
scope and the report says so).

## 1. PASSIVE AUDIT — PRE-REGISTRATION (written before any judged sim)

Policy: stock `scripts/policies/competent.js` on THIS branch (master,
no widened cascade — the widened policy is not the game). Seeds
99101–99108, 140d, death-aware. Instrument:
`scripts/passiveuse-instrument-20261103.js` (startCombat + tbEnd +
tbDamage wraps, wave-4 TB only). Driver:
`scripts/passiveuse-driver-20261103.js`. OUTDIR
`perseed-abilityuse-gc-passive`, RUN `passive-gc`.

Per TB wave-4 fight, at fight start, recorded:
- scholar: every held ability id (ownedAbilityIds) with its data
  modifiers[] and ability level, plus RESOLVED combat values:
  combat.strike_damage (round-1 ctx and plain ctx),
  combat.first_strike_damage, combat.heavy_damage,
  combat.dodge_chance, armor.flat (via armorBonus), health.max_add,
  combat.trade_window, combat.enemy_morale;
- each NPC ally fighter: held ids (npcOwnedIds) with data modifiers[]
  (values are data values only — the modifier pipeline collects from
  the scholar alone, so NPC modifiers do not resolve; recorded as such);
- at fight end: outcome (kill / routed / fled / fighter-died /
  unended), monster HP delta (damage dealt by humans, net), human HP
  delta, armor absorbs summed for the player from tbDamage returns
  (requested vs landed, per fighter — dodge shows as landed 0).

Verdict rules (pre-registered, §14):
- DEAD: (a) never held by the scholar or any NPC ally in any TB fight
  of the panel; OR (b) held but resolved combat value equals base on
  every fight where held; OR (c) held and resolving, but per-strike /
  per-hit contribution below one gear step AND no outcome association
  in the carried-vs-not comparison.
- LOAD-BEARING: held, and contribution >= one gear step on fights
  where held, or a carried-vs-not outcome association (kills/fight,
  survival) in the same direction.
- NPC passives are judged in TB scope only; a passive that applies in
  field fights but not TB fights is reported as field-only, not dead.
- The carried-vs-not comparison is associational (party size, monster
  kind, and weapon confound it); it is reported as association, and
  the resolved-value arithmetic is the primary contribution measure.

Static facts already established (code + data read, no sim needed):
142 abilities: 50 with neither modifiers nor actions (their effects
live in hardcoded hasAbility branches — e.g. cornered_rat in the
strike calc — or in godpath VERBS; "neither" does NOT mean dead, and
the audit does not claim it does), 35 modifiers-only (pure passives),
57 with actions (14 of those also carry modifiers). Every one of the
34 modifier targets has at least one modTarget reader in src/js.
Combat-touching passives: adrenaline_control (strike_damage x1.3,
scales x1.3^level), adrenaline_surge (dodge +0.15/level),
chitin_skin (armor.flat +30), survivor (health.max_add +10),
patient_aim (strike_damage x2, round:1 ONLY), ambush
(first_strike_damage x1.5), haymaker (heavy_damage x1.2),
trade_of_blows (trade_window +1). No data entry targets
combat.damage_taken — the defense-mods reader for it resolves to base
1 always; there is no damage-taken passive in data.

## 2. NPC SKILL TWINS — PRE-REGISTRATION

Twins live in tbVillagerAbility, after the base five, first match
spends the turn (same structure as the base five). Order follows the
fix leg's fired-row priority, skill actions first. Each twin: trigger
grounded in its player impl, once-per-fight flag unless the impl is
inherently once-per-fight, same numbers as the player (parity rule),
narrated honestly, never silent.

| action (lane) | villager effect (same numbers as player) | trigger |
|---|---|---|
| ambush.set_ambush (skill) | v._vAmbushReady={mult:2}; next villager strike x2, consumed; skips the auto-haymaker that strike (no x4 stack) | once/fight, any live monster, villager has not struck yet this fight |
| tripwire.string (skill) | f._tripwireSet=true (the same flag the player sets; the monster-move consumer at game.js:40913 fires it) | once/fight, not already set |
| haymaker.throw_haymaker (skill, pressed) | v._vHaymakerReady={mult:2.5}; next strike x2.5, consumed; the automatic every-3rd-swing x2 (already live in tbVillagerTurn) is SKIPPED on the pressed strike so the two never stack; no accuracy roll exists on the villager strike path, so the -30% player cost has no NPC translation — stated, not hidden | once/fight, adjacent to a live monster |
| intimidating_presence.stare_down (skill) | weakest live monster courage check: 50% flat (villagers do not carry the scholar's social.intimidate mods — flat 50% is the honest number), fearless holds; success sets fled + tbEndCheck, same as player | once/fight, weakest monster not fearless |
| peacemaker.walk_in (skill) | talk check 35% flat (no scholar drama.resolve_bonus for villagers); success: all non-elder foes fled + tbEndCheck; failure: v.exposedTurns=1 (tbDamage's dodge block reads it for any fighter) | once/fight, losing (hp<50%) |
| hogtie.bind (skill) | tbPlayerBind-equivalent via the same controlled+adjacent+size-1 gate, rooted 3 rounds; needs rope in the VILLAGER's own kit — villagers carry no rope inventory, so the twin is implemented but gated off unless a rope-carrying path exists; reported as implemented-but-unreachable if the gate never opens | controlled + adjacent + size-1, once/fight |
| come_get_some.goad (skill) | blinded monster within 3 lurches toward the sound (same goad marker the player sets) | blinded monster within 3, once/fight |
| dead_aim.dead_aim_shot (skill) | v._vDeadAim={mult:3}; next strike x3, sets the same ignoreArmorNext consumption the player strike uses (villager strikes run tbDamage, which honors it) | once/fight, adjacent, non-trivial fight (totalMaxHp>=40 or 2+ monsters) |
| patient_aim.take_aim (skill) | v._vAimBonus={mult:2.5}; next strike x2.5, consumed; exposed flag set (v.exposedTurns=1) like the player | once/fight, adjacent, non-trivial fight |
| trade_of_blows.open_trade (magic) | v._vTradeOpen={attacksLeft:3,bonus:0.5}; next 3 strikes +50% | once/fight, villager has taken damage this fight (v._taken>0 — the ledger tbDamage already keeps) |
| trade_of_blows.settle_debt (magic) | v._vSettleDebtBonus=round(v._taken*0.5); next strike +flat | once/fight, v._taken>0, not already settled |
| war_cry.bellow (magic) | same as player bellow: every live foe 60% courage fail -> stunned 1 (skittish/curious non-fearless 25% of fails flee outright); shares v._warCried with the hopeless-path war cry so the two never double | once/fight, losing (hp<50%), not already war-cried |
| brawler_instinct.read_fight (skill) | v.speed+=2, orderDirty (turn order is speed-based; same as player) | once/fight, non-trivial fight |

NOT twinned, with reason: bird_strike / static_toss / turncoat /
freeze_tag / cheese_wheel / retribution — KIT path via villagerCast
already exists (measured in the before-leg; duplicated only if the
before-leg shows the kit path silent AND the silence is a missing
path rather than a gate — a gate problem gets a gate fix, not a
second path). game_sense.read_stance — info only, no NPC consumer
for a stance hint; the villager cannot act on it. animal_ken.calm_beast
— player impl refuses monsters by design. second_wind — automatic.
raise_earth — no turn-based impl (field-cast only). fear_aura —
already twinned (nearest-only hesitate; the player impl looms ALL
foes + a trust cost — the twin is weaker than the player impl, noted
as a known delta, not silently widened here).

Judged before/after legs: same 8 seeds, 140d, stock policy, prior
instrument (`scripts/abilityuse-instrument-20261103.js`, copied
verbatim from 077da81f2 plus a MARKED extension: monster-flag diffs
around tbVillagerAbility calls so kit fires are named, not lumped).
OUTDIRs `perseed-abilityuse-gc-before` (RUN `twins-before`) and
`perseed-abilityuse-gc-after` (RUN `twins-after`). Only game code
differs between legs (twins + strike-block consumption hooks).

Bars (GO needs T1 + T2 + all guardrails):
- T1 (twins fire): twin-attributed NPC fired rows >= 10 across the
  leg (from 0 — base-five rows excluded from this count).
- T2 (fights change, at least one): TB kills up vs before-leg, OR
  median survival days up vs before-leg, OR routed fights up vs
  before-leg (routing is the fix leg's proven channel; kills are the
  veteran-relevant one — both reported, neither hidden).
- G1 (no fizzle spam): twin presses that set a flag but produce no
  effect on the next strike / turn = 0 (checked in the analyzer from
  flag-set rows vs strike rows).
- G2 (dinner test holds): zero data-file cost changes (git diff on
  src/data/abilities.json empty); twins never call useAbility (code
  read + proof test asserting scholar kcal unchanged across a twin
  press).
- G3 (instrument health): instrument errors 0 in both legs.

## 3. COMBAT-BAR SURFACING — PRE-REGISTRATION

Design (fixed here): the button LIST is computed in game code, not
in the DOM layer, so it is provable in node (app.js is DOM-only and
excluded from the node harness; the repo's own app.js tests assert on
its source text). New Game function `combatBarAbilityActions()` in
game.js returns, for every combat action the scholar holds
(ownedAbilityIds + abilityActionDef, context combat) that is not
already covered by an existing button (Strike, Study, Talk, Scream,
Well, Flip, Shove, Bind, Goad, Shout, Rally, War cry, Offer, Wait,
sig buttons): {aid, act, name, kcal, ok, why, needsTarget} where
ok/why come from _actionAvailable (the same contextual discipline
as Shove/Bind/Goad — a button shows disabled with the why as its
title when unavailable). combatActionsHTML renders one button per
entry AFTER the existing buttons, and wireCombatPanel gains a generic
`data-combat-ability="aid.act"` handler. Actions whose impl resolves
a default target (bird_strike, pocket_sand, freeze_tag, static_toss,
turncoat, tripwire, walk_in, scream, rage, ambush, haymaker,
take_aim, dead_aim, open_trade, settle_debt, read_stance, read_fight)
call useAbility(aid, act) directly. Actions that NEED a target and
have no default (stare_down) use the existing enterTargeting picker
over live monsters (weakest first, mirroring the policy). No cost
changes, no new actions, no gate changes. Proof: node test on
combatBarAbilityActions() against a fixture fight (scholar holding a
spread of actions) asserting each held uncovered action appears
exactly once, ok/why match _actionAvailable exactly, and
needsTarget is true exactly for the target-needing actions; plus a
source-text assertion that app.js renders and wires
data-combat-ability. PHONE/BROWSER VERIFICATION AT 390x844 IS
OUTSTANDING — this task cannot use the live browser; the report
marks it outstanding and never claims it.

## 4. CHOICES VS GEAR — PRE-REGISTRATION

Question: does choosing one ability/kit over another swing fight
outcomes comparably to a gear-tier step, or are ability choices
decoration next to gear choices? Three arms on the SAME 8 seeds,
140d, stock policy, twins live (the game as it will be after §2):
(A) as-is; (B) scholar combat abilities stripped — sim-side mutation
after setupGame (scholar.abilities + backgroundAbilities filtered to
drop every ability with a combat action; codex skill entries for
skill-lane combat actions cleared so skillLaneEntries cannot
re-supply them; the exact strip list is written into the arm's
output header); (C) gear downgraded one tier — sim-side mutation
after setupGame (scholar's equipped weapon swapped to the next-lower
bonus weapon on the ladder 120→80→60→45→30→25→15→8→5→unarmed;
the swap mechanism is documented in the arm output; if the equipped
structure makes a clean swap impossible, the arm falls back to
reporting the panel-variance association and says so — it does not
silently substitute a different comparison).
Metrics: TB kills/fight, median survival days, damage-dealt/fight,
fighter deaths. Comparison: (A−B) = ability-choice delta,
(A−C) = gear-tier delta, both as rates (trajectories diverge; rates
are the comparable metric, same rule as the prior fix leg).
Verdict: choices matter iff (A−B) is at least half (A−C) on kills or
survival. If choices do not matter, that is a finding with a fix
direction (which abilities would need to be bigger, by the gear-step
yardstick), not a silent pass.

## PROOF AND CHECK DISCIPLINE

- Proof test per twin action (fixture TB fight: villager holding the
  action, trigger conditions staged, assert the flag/effect + the
  narration line + the once-per-fight gate).
- Proof test for bar surfacing (above).
- Proof test for the passive audit's resolved values (fixture scholar
  holding adrenaline_control + chitin_skin: assert resolved
  strike_damage and armorBonus match the pipeline arithmetic).
- node scripts/check.js --quick after changes, count reported with
  its base. Never two jest processes at once;
  --cacheDirectory=/tmp/jest-cache-ability-use-gamecode.
- Every commit [needs-eyes]. Safe-commit only. No merge, no push,
  no bump, no live verification — branch ready for main-session
  review.
