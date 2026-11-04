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

## PREREG AMENDMENTS (written before the after-leg; the before-leg involves no twins, so it is unaffected)

- Hogtie row: NO rope requirement. The base-five precedent governs:
  NPC abilities in tbVillagerAbility pay no player inventory costs;
  pantry-tier gating wraps the whole call. Once-per-fight flag
  (_vBound), tbPlayerBind's gate (controlled + adjacent + size <= 1),
  diminishing rounds (3 - prevBinds, min 1). The earlier "needs rope
  in the villager's own kit" wording is superseded by this amendment.
- Dead_aim row: the armor-piercing half is vacuous for villager
  strikes. tbDamage applies no monster armor to villager strikes
  (monster armor lives in tbPlayerStrike only), so there is nothing
  to pierce. The twin is x3 only. Stated, not hidden.
- Damage-setup twins (ambush, haymaker, dead_aim, patient_aim,
  trade_open, brawler_instinct) gate on nontrivial (totalMaxHp >= 40
  or 2+ monsters), the cascade's proven rule against wasting a setup
  turn on trivia. War_cry, tripwire, stare_down, walk_in, goad,
  hogtie, settle_debt carry their own triggers, not the nontrivial
  gate (settle needs _taken > 0, which already implies a real fight).
- Twin flag names, finalized at implementation (tbVillagerAbility,
  after the shove block; consumption in tbVillagerTurn's strike
  block, strike-only, harry leaves flags loaded):
  war_cry -> _warCried (SHARED with the hopeless-path cry, never
  double); tripwire -> f._tripwireSet (the player flag itself);
  intimidating_presence -> _vStared; peacemaker -> _vWalkedIn;
  come_get_some -> _vGoaded + m._goadedBy = v.key; hogtie -> _vBound
  + m._bound/_bindCount; ambush -> _vAmbushed + _vAmbushReady {mult
  2}; haymaker -> _vHaymakerPressed + _vHaymakerReady {mult 2.5}
  (pressed strike skips the automatic every-3rd-swing x2, no x4
  stack); dead_aim -> _vDeadAimed + _vDeadAim {mult 3};
  patient_aim -> _vAimed + _vAimBonus {mult 2.5} + exposedTurns 1;
  trade_of_blows open -> _vTradeOpened + _vTradeOpen {attacksLeft 3,
  bonus 0.5}; settle -> _vDebtSettled + _vSettleDebtBonus =
  round(_taken x 0.5); brawler_instinct -> _vReadFight + speed +2
  + f.orderDirty.
- Asymmetries, stated not hidden: open_trade's 10 HP player cost has
  no NPC translation (base-five precedent: no per-cast NPC costs);
  haymaker's -30% accuracy has none (no accuracy roll on the
  villager strike path); dead_aim's armor-pierce has none (above).
  The hopeless-path war cry still serves villagers above 50% HP
  (helpful flee line 70%); the twin shadows it only below 50%,
  with a stronger effect, once per fight.
- Before-leg anchor note (recorded, not a re-score): the current
  master moved since the prior arm's diagnosis (wild ally-join,
  field-fight damage+staying, goals system landed). The before-leg
  below is the baseline for the after-leg, NOT the prior arm's
  numbers. Exposure density on this band is now 26 TB fights / 8
  seeds (vs 51 in the diagnosis leg) — T1 is judged as written
  (>= 10 twin rows); if it misses on thin exposure, that is a
  NO-GO on T1 with a metric-review note, never a re-score.

## BEFORE-LEG RESULTS (twins-before + passive-gc, stock policy, 140d, seeds 99101-99108)

- Corpora: evidence/2026-11-03/perseed-abilityuse-gc-before/
  (RUN twins-before) and perseed-abilityuse-gc-passive/ (RUN
  passive-gc). Instrument errors 0 in all 16 files. One run served
  both legs (passiveuse-driver-20261103.js); seed 99107 was
  calibrated first, then the remaining 7 seeds ran after a runtime
  restart killed the first attempt mid-99102 — 99101's files were
  verified intact (full 140d, 0 errors) and only the 6 missing
  seeds re-ran (the driver refuses overwrites).
- Panel: 42 wave-4 spawns, 26 TB fights, 18 field fights, 5 wave-4
  kills, 1/8 villages survived 140d (99101). 59 NPC ability calls,
  0 fired (base five silent on this band — consistent with the
  diagnosis era's rarity, now thinner: 26 fights vs 51).
- KIT PATH: kitDiffs EMPTY across all 59 calls — zero godpath kit
  casts (static_toss, cheese_wheel, bird_strike, turncoat,
  freeze_tag, retribution) in the before-leg. Cause, from the
  passive corpus: NO NPC ally in any of the 26 fights held a kit
  ability at all. This is a HOLDING gap, not a gate gap and not a
  missing path — the path exists (godpath villagerCast) and the
  holdings do not. Per prereg, no duplicate path is built; the
  follow-up is villager ability acquisition, flagged in the final
  report, not silently added here.
- NPC twin-eligible holdings in-panel are nearly absent: across 12
  villager fight-slots, combat-action holdings are brawler_instinct
  1, shoulder_check 1, hogtie 1, scream_cheese 1 (the last two
  already base-five). The scholar, by contrast, holds the twin
  abilities abundantly (patient_aim 25/26 fights, haymaker 26/26,
  intimidating_presence 15, peacemaker 16, tripwire 10, dead_aim 6,
  ambush 2, brawler_instinct 8, shoulder_check 16). The twins give
  villagers the same effects — but on this panel, the binding
  constraint after twins is that villagers rarely HOLD combat
  abilities at all. T1's >= 10 rows assumed diagnosis-era holding
  density; the after-leg will show what the rare holdings do.

## TWINS IMPLEMENTATION (committed a8538e12d, [needs-eyes])

- tbVillagerAbility, after the shove block: 13 twin rows in the
  preregistered order (war_cry losing, tripwire, stare_down,
  walk_in losing, goad, hogtie, ambush, haymaker, dead_aim,
  patient_aim, open_trade, settle_debt, read_fight), each with its
  own once-per-fight flag, same numbers as the player impl,
  narrated honestly, never silent. Twins NEVER call useAbility
  (scholar kcal unchanged across a twin press — proof test).
  Pantry-tier gating wraps the whole call via foodPower, same as
  the base five. Triggers read only the fighter's own position/HP
  and live monsters on its tiles (perception law).
- tbVillagerTurn strike block, strike-only (harry leaves flags
  loaded, like the player path): consumes _vAimBonus x2.5,
  _vDeadAim x3, _vAmbushReady x2, _vHaymakerReady x2.5,
  _vTradeOpen +50% per remaining attack, _vSettleDebtBonus flat;
  a pressed-haymaker strike skips the automatic every-3rd-swing
  x2 (no x4 stack). Multiplicative stacking otherwise mirrors
  _applyAbilityActionMods.
- Proof: scripts/test-abilityuse-twins-20261103.js — 31/31 (set
  per twin: flag + narration + once-gate; trivial-fight
  withholding; scholar-kcal-unchanged; consumption: flagged
  strike == round(unflagged x mult) under re-seeded RNG for all
  six damage twins + flat settle). The trivial-fight case caught
  a real test error first: startCombat spawns hummice as a pack
  of 4 (totalMaxHp 47, nontrivial) — the fixture now forces a
  single 10-HP monster for the trivial case.
- check-wired: game.js 17 unwired, none of them mine
  (combatBarAbilityActions and tbVillagerAbility are called).

## TWINS BEFORE/AFTER (identical seeds, stock policy, twins live in after)

- Before (twins-before): 42 spawns, 26 TB fights, 18 field
  fights, 5 wave-4 kills, 1/8 survived. 59 NPC ability calls, 0
  recorded fires.
- After (twins-after): IDENTICAL on every seed (42/26/18/5/1).
  59 calls, 0 recorded fires.
- True fires (flag-preset evidence — see instrument note):
  before 1 (aria_thompson scream_cheese, round 1); after 2 (the
  same scream + app_mgpsphkk753 read_fight, round 1 — the twin).
  No recorded-round fire in either leg. No routed-fight movement
  (0 routed both legs).
- Bars: T1 (>= 10 twin rows) NO-GO — recorded 0, true 1.
  T2 (kills/survival/routed up) NO-GO — no movement. G1
  (flag-set-no-effect) 0 — every twin flag consumes in proof
  tests; the panel's one twin fire (+2 speed) is a real effect.
  G2 (dinner) PASS — git diff on src/data/abilities.json empty;
  twins never call useAbility. G3 (instrument errors 0) PASS.
- METRIC REVIEW (not a re-score): T1 assumed diagnosis-era
  holding density and full-round visibility. Reality: (a)
  twin-eligible NPC holdings are ~2 slots per 26 fights
  (brawler_instinct 1, hogtie 1 — hogtie never triggered: needs
  controlled + adjacent + size-1, never staged in-panel);
  (b) the instrument misses round-1 turns: startCombat runs
  tbAdvance synchronously (node) before the exposure opens, so
  round-1 villager turns — and their ability calls and
  narration — are invisible to the call log (proven: npcTurns
  start at round 2; twinBefore.readFight true at the first
  recorded call). The prior arm shares this blind spot, so its
  "base five rarely fire" is also a lower bound. Both legs are
  affected equally; the after-leg's extra fire is real but
  small. The twins are proven by fixture (31/31); the panel
  cannot show more because villagers rarely HOLD combat
  abilities at all.
- KIT PATH (both legs): 0 casts across 59 + 59 calls. Cause,
  from the passive corpus: NO NPC ally in any of the 26 fights
  held a kit ability. Holding gap, not gate gap, not missing
  path — no duplicate path built (prereg rule).
- NEXT BOTTLENECK (flagged, not built): villager ability
  acquisition. The scholar holds twin abilities abundantly
  (patient_aim 25/26 fights, haymaker 26/26); villagers hold
  staples (tracker, game_sense, scrounger...) and almost no
  combat actions. The fix direction is the villager XP/grant
  pipeline, not more twin paths.

## PASSIVE AUDIT (26 TB fights, before-leg passive corpus; yardsticks: offensive gear step +15-20/strike; defensive >= +4 absorbed/hit)

- Scope: scholar-resolved values via modTarget at fight start +
  held census. NPC modifiers do NOT resolve in TB scope (the
  pipeline collects from the scholar only; fieldFights.js:618 is
  the field-scope armor exception) — so the NPC TB passive audit
  is empty by construction, stated not hidden. The 50 "neither
  modifiers nor actions" abilities are NOT dead by default:
  effects live in hardcoded branches (cornered_rat in the strike
  calc and dodge) or godpath VERBS; all 34 modifier targets have
  at least one reader. Non-combat passives (forage, trust,
  craft...) are out of scope for a combat audit.
- LOAD-BEARING:
  - patient_aim, strike_damage x2 round:1 — held 25/26, resolves
    2.0 (2.3 with the relic +15% below), read game.js:36445 with
    round ctx. First-round strikes doubled: +10-16+wb per strike,
    at/above one gear step on round 1 only; dead later rounds
    by design.
  - ambush, first_strike_damage x1.5 — held 2/26, resolves 1.5,
    read 36456 round:1. On its held fights (patient_aim also
    held) the marginal is +10-16+wb — at-step. Rarely held.
  - adrenaline_surge, dodge_chance +0.15/level — held 1/26,
    resolves 0.15, read tbDamage 37824. +15% dodge ~= -15%
    expected damage; on a ~30-damage hit ~= 4.5/hit, at the
    defensive yardstick. Load-bearing when held, rarely held.
- DEAD by name:
  - adrenaline_control, strike_damage x1.3^level — held 0/26.
    Dead by (a) never held. (Would apply every round if held —
    reader 36445 unconditional path — worth +3-7/strike, below
    step anyway.)
  - chitin_skin, armor.flat +30 — held 0/26. Dead by (a).
    Mechanism works (armorBonus adds flat; proof test asserts
    it): through the curve +30 prot absorbs ~60% pre-pierce,
    ~= +18 on a 30-hit — WOULD be load-bearing if held. The gap
    is acquisition, not mechanism.
  - survivor, health.max_add +10 — held 0/26. Dead by (a).
    Mechanism works (28494); +10 max HP is a +10% pool.
  - trade_of_blows, trade_window +1 — held 0/26 (scholar).
    Dead by (a). (+1 attack at +50% ~= +5-10 — below step.)
  - haymaker, heavy_damage x1.2 — held 26/26, resolves 1.2, but
    read ONLY in _applyAbilityActionMods (the haymaker press
    path); plain strikes never read it. Marginal per pressed
    strike +0.5x base = +5-10, below one gear step. Dead by
    rule (c) on its only path. (The PRESS itself is x2.5, way
    above step — the action matters, its passive leg doesn't.)
- NO WRITER: enemy_morale resolves 1.0 on all 26 fights; no
  ability in data targets it, though war_cry (1508) and monster
  morale (40880) read it. Data gap note, not a passive verdict.
- UNATTRIBUTED +15% strike_damage on 10/26 fights: no held
  ability explains it (checked: abilities, synergies,
  evolutions). Consistent with a bonded relic combat_damage
  enhancement (RELIC_MOD_MAP) — inference, not proof; the
  corpus doesn't record relics. +1.5-2.4+0.15wb/strike, below
  step per strike, persistent all rounds.
- WHAT "LARGE" MUST BE: to rival a gear step persistently needs
  ~= +15-20 flat/strike EVERY round (~x1.5-2.0 on a 20-30
  strike). Nothing held does that persistently. The closest in
  data is chitin_skin (defensive, would-be load-bearing) —
  never held. Patient_aim does it on round 1 only. Same
  conclusion as twins: the large passives are in data but not
  in hands.
- Proof: scripts/test-abilityuse-passive-20261103.js — 4/4
  (adrenaline_control x1.3^level, chitin_skin +30 + armorBonus
  inclusion, patient_aim round-1-only).

## COMBAT-BAR SURFACING

- Game: Game.combatBarAbilityActions() in game.js — one entry
  per held, uncovered, pressable combat action {aid, act, name,
  kcal, ok, why, needsTarget}. It reuses activatableAbilities()
  (ok/why straight from _actionAvailable, so a refused tap
  never costs); covered actions (scream/shove/bind/goad) are
  excluded; automatic actions excluded (the engine says they
  are not tappable buttons); legacy activatables excluded (no
  combat context). needsTarget is true exactly for
  intimidating_presence.stare_down — every other combat impl
  resolves a default target (nearest in range, first live,
  first two, loudest), verified against the IMPLS map.
- App: combatActionsHTML renders one ⚡ button per entry after
  the existing buttons (disabled state mirrors _actionAvailable
  exactly, title names the reason); wireCombatPanel gains one
  generic data-combat-ability handler (stare_down picks over
  live monsters, weakest first, via the existing enterTargeting
  picker; everything else calls useAbility directly). No cost
  changes, no new actions, no gate changes.
- Proof: scripts/test-abilityuse-bar-20261103.js — 94/94
  (each held uncovered action exactly once; covered hidden;
  ok/why match _actionAvailable exactly; needsTarget exactly
  stare_down; >= 1 pressable; kcal carried; empty out of
  combat; app.js source-text: render + generic wire + picker).
  The bar test caught one real test error first:
  trade_of_blows is magic-lane, not skill-lane — granted
  without force it hit the slot cap and vanished from the bar.
- OUTSTANDING, NEVER CLAIMED: phone/browser verification at
  390x844. Node cannot prove a tappable bar (app.js is
  DOM-only; the repo's own rule requires browser proof for UI).
  A main-session browser pass must tap a surfaced button
  (e.g. Unleash Rage, Bird Strike, Take Aim) on a phone-size
  view before this is called player-verified.
- REGRESSION CAUGHT AND FIXED: check --quick run 2 failed
  scripts/test-foodpower-20261014.js (abundant casts 8 vs
  expected 4). Cause: the test mocks npcHasAbility=true and
  counts casts; my twins legitimately add 10 once-per-fight
  casts in its fixture (war_cry, tripwire, stare_down, walk_in,
  ambush, haymaker, dead_aim, take_aim, open_trade, read_fight)
  on top of the 3 base casts + 1 bonus retry. The tier gate
  itself is intact (starving still 0, bonus still exactly 1).
  Per the house rule (design changed on purpose: update the
  test, say so), the expectation is now 14 with the
  composition documented in the test comment. Standalone:
  30/30 after the fix.

## CHOICES VS GEAR (same 8 seeds, 140d, stock policy, twins live; rates, since trajectories diverge)

- Arm A (as-is) IS the twins-after leg. Arms B and C as
  preregistered (setup strip / setup weapon swap) both proved
  VACUOUS and are reported as such, not hidden: scholars start
  with NO abilities and NO weapon on all 8 seeds
  (strippedSlots [] and startWeapon unarmed everywhere), so
  B == A and C == A exactly (26 fights, 5 kills, 201.3
  dmg/fight, 22 fighter deaths, median 105d, 1/8 survived —
  identical numbers, not similar ones). That vacuity is itself
  a finding: the early game is ability-less and weapon-less by
  construction; "choices" only exist once the scholar acquires
  things mid-run.
- Amended mechanisms (same question, fixed mechanism,
  documented here): B2 re-strips at every fight start (the
  scholar ENTERS every fight without combat abilities; the
  per-fight strip log proves it bit — e.g. 99101 day 131:
  pocket_sand + game_sense/brawler/peacemaker/come_get_some
  stripped pre-fight). C2 downgrades the carried weapon one
  tier at every fight start (same type preferred; ammo
  preserved on ranged swaps; exactly one type-change in the
  whole leg: sling 8 ranged -> sharpened_stick 5 melee, where
  no lower ranged weapon exists).
- Results (TB fights only; damage = -hpDelta to monsters):
  - A as-is: 26 fights, 5 kills, 0.192 kills/fight, 201.3
    dmg/fight, 22 fighter deaths, median 105d, 1/8 survived.
  - B2 no combat abilities in fights: 26 fights, 1 kill,
    0.038 kills/fight, 183.5 dmg/fight, 25 deaths, median 89d,
    1/8 survived.
  - C2 one gear tier worse: 27 fights, 2 kills, 0.074
    kills/fight, 153.9 dmg/fight, 26 deaths, median 92.5d,
    0/8 survived.
- Verdict (prereg rule: choices matter iff (A-B) >= half
  (A-C) on kills or survival): KILLS: (A-B2) = 0.154, (A-C2)
  = 0.118, half = 0.059 — 0.154 >= 0.059, and ability loss
  exceeds the FULL gear loss. SURVIVAL: (A-B2) = 16d,
  (A-C2) = 12.5d, half = 6.25d — 16 >= 6.25. CHOICES MATTER on
  both, and ability choices matter MORE than a gear tier on
  kills. The damage split sharpens it: gear cuts damage/fight
  more (-24% vs -9%), but abilities convert fights to kills
  (kills -80% vs -60%) — gear changes the numbers, abilities
  change the board, exactly as Steve's law predicts.
- Confounds, stated: small counts (5/1/2 kills — directional,
  not precise); B2's survival delta bundles the non-combat
  legs of stripped skills (game_sense tracking, animal_ken)
  with fight-ability loss — the kill-rate delta is the cleaner
  read; one C2 type-change (above); one TB call per arm lacks
  an exposure record (startCombat re-entered while already in
  a fight — instrumentErrors 0, not an error). B2 strips the
  SCHOLAR only; villager twins still live in all arms.
- Fix direction if choices had NOT mattered: not needed — they
  do. The open problem is not ability strength but ability
  POSSESSION (see twins section): villagers rarely hold combat
  abilities, so the scholar-side choice delta above is the
  ceiling, not the floor, for what villagers feel.

## CHECK STATUS (node scripts/check.js --quick, 290 tests, --cacheDirectory=/tmp/jest-cache-ability-use-gamecode)

- Run 1 (before the foodpower test update): 283 passed, 7
  failed in 810s (tail showed the racks-full voice gate; the
  full list was lost to tail -15).
- Run 2: 282 passed, 8 failed in 862s — named failures: the
  five standing families (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof) + establishment-r20
  (the sixth standing family) + test-foodpower-20261014
  (outdated count — fixed, see bar section) + a
  test-trust-observer-neutrality 120s timeout flake (it ran
  110s in run 1). Run-to-run flake movement of +/-1 is the
  standing pattern on this suite (prior arm 282/8 with 2
  flakes verified standalone).
- FINAL RUN (after all game + test changes): 284 passed,
  6 failed in 704s — exactly the six standing families, no
  others. Nothing in the final failure set is mine.
- Proof tests are standalone node scripts, not part of
  check.js: twins 31/31, bar 94/94, passive 4/4, foodpower
  30/30 after its update.

## LIMITS, STATED PLAINLY

- Phone/browser verification at 390x844: OUTSTANDING (bar
  section). Node cannot prove a tappable bar; a main-session
  browser pass must tap a surfaced button before this is
  called player-verified.
- The relic +15% strike_damage attribution is inference
  (consistent with a bonded relic combat_damage enhancement),
  not proof — the corpora don't record relics.
- The choices verdict is directional, not precise: 5/1/2
  kills across 26-27 fights per arm; B2's survival delta
  bundles non-combat skill legs; one TB call per B2/C2 arm
  lacks an exposure record (re-entrant startCombat, not an
  instrument error).
- The round-1 instrument blind spot (startCombat runs
  tbAdvance synchronously before the exposure opens) means
  all "recorded" NPC fire counts in both legs are lower
  bounds; true counts are derived from flag presets, not
  directly logged. Both legs share the blind spot, so the
  before/after comparison is still fair.
- The panel is 8 seeds x 140d. Villager ability holdings in
  it are thin (~2 twin-eligible slots per 26 fights); the
  twins' fixture proof (31/31) is the evidence they work, the
  panel is the evidence they rarely get a chance.
- OPEN FOLLOW-UPS (flagged, not built): (1) villager ability
  acquisition — the next bottleneck for twins, passives, and
  kit casts alike (no NPC held a kit ability in 26 fights;
  chitin_skin/adrenaline_control held 0 times); (2) the
  Drum-Belly win-rate panel (parent's list, unchanged);
  (3) phone/browser verification of the bar (above).
- NO win-plan or villager-goals files changed. NO win prices
  or deed gates changed. NO data-file cost changes (git diff
  on src/data/abilities.json empty). Six-slot cap untouched
  (bar test grants with force only in fixtures).
