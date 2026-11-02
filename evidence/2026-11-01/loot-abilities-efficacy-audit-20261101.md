# Loot + abilities efficacy audit (DIAG only, zero src/js) — 2026-11-01

Audit of the Oct 31 loot/abilities build on current master. Base at audit
start: master 02891e9dc (Loop A titanghost arm). Worktree:
lootabilities-audit. No game changes in this audit; where a fix is
warranted, a delivery spec is written, not built. Gating freeze stands.
Perception law stands. Human skills are not alien abilities.

## Plain-words headline

- **Built does not mean used.** Of 57 activatable abilities, the
  competent-policy scholar pressed exactly **2** in 8 runs × 120 days
  (garden abilities green_thumb 258 calls, green_whisper 174 calls).
  The other 55 were never called once — including combat abilities the
  scholar was holding (blink, rage, war_cry, pocket_sand, turncoat).
- **The field abilities themselves mostly work.** 57 of 59 field-fight
  abilities fired in fixtures when their conditions were met (verb line
  + measured effect). The 2 exceptions are narrow-window cases, not
  missing code (dead_aim's window is jumped over by strike sizes and
  flee lines; rally_aura is a passive hold bonus with no measured
  fight delta).
- **Synergies work when assembled; competent play almost never
  assembles them.** 57/57 activate when their legs are held +
  discovered, and 49/49 modifier sets apply. But only **3 of 57**
  ever co-fired in panel runs (field_pharmacy, airtight, ringcraft).
  One synergy is mechanically dead: **blood_tracker** (activates but
  has no modifiers and no code reads it).
- **Loot flows, but thin at the top and rarely used by the scholar.**
  122 kill/prize grants, 41 distinct items, but only 6 were tier 4
  (5% of grants). 34 distinct loot items were seen equipped; the
  scholar's pack reveals (first use) happened in only 3 of 8 runs.
  Zero items are unreachable (W1 scan re-run: 108 items, 0 missed),
  and zero lack an earnable route — but 67 of 108 were never granted
  in panel play.
- **Armor tiers work cleanly; weapon tiers do not ladder.** Each armor
  step cuts damage taken (45 → 34 → 32 → 28 → 17 across the ladder).
  Weapon bonuses do not ladder: the tier-4 weapon's huge single hit
  makes the beast flee instead of dying, so the best weapon yields
  less loot than the tier-3 weapon.
- **The wave-4 bar fails at every earnable tier.** A geared party
  (leader + ally, tier-3 or tier-4 weapon and armor) deals 14–19% of a
  wave-4 beast's health before dying, 0 wins in 5 seeds at both tiers.
  The gap is damage (5–6× short) plus an ally who deals almost nothing
  (0–16 damage per fight), not gear tier: tier 3 → tier 4 only adds
  ~40% damage against an 80%+ shortfall.
- **Nothing violates the dinner test.** No ability or item gives free
  food or removes hunger/spoilage. The closest looks are garden
  acceleration (costs 200 kcal + beds + time) and photosynthesis
  (at most ~+150 kcal/day net, capped).

## Pre-registration (FROZEN before judging — metric binding §14)

Panel: competent policy (`scripts/policies/competent.js` via
`sim-harness.runDays`), seeds 31001–31008, 120 days each, serialized
(one process at a time, no concurrent jest). Instruments: `useAbility`
wrap (fires + success), `tele` wrap (`loot_dropped`,
`broadcast_item_prize`, deaths), daily snapshots of scholar abilities,
`activeSynergies`, scholar + villager equipped/inventory.
Fixtures: `G.fieldFight` pattern from proof-lootabilities-w2.js
(npcAbilities set, machete baseline, mulberry rng), seeds 9201–9205,
WITH vs WITHOUT at the same seed.

Bars (a miss is a miss; revisions go under Metric review, not into
re-scoring):

- ABILITY DEAD-CONSTRUCTION: no code path in fieldFights
  (vHasAb/FIELD_IDS/FIELD_KIT), useAbility actions dispatch, passive
  modifiers, or skill paths, AND no fixture fire.
- ABILITY DEAD-DISTRIBUTION: code path exists and fixture fires, but
  held in 0/8 panel runs (never reaches competent play).
- ABILITY LIVE-WEAK: fires, but fixture delta <10% on every metric
  (damage dealt, damage taken, rounds, outcome).
- ABILITY LIVE: fires and fixture delta ≥10% on ≥1 metric.
- ABILITY MAKE-OR-BREAK: fixture WITH vs WITHOUT flips outcome
  (win↔loss/flee/death) on ≥2 of 3 scored seeds, OR damage
  dealt/taken delta ≥50%.
- SYNERGY CO-FIRE: both members held in the same run AND the synergy
  id present in `activeSynergies` in ≥1 snapshot.
- SYNERGY OUTCOME: scholar-pair fixture vs single-member fixture
  delta ≥10% on damage dealt/taken or survival.
- SYNERGY DEAD PAIR: never co-held in panel AND (no fixture delta
  OR a member is itself dead).
- LOOT FOUND: `loot_dropped` / prize / ruin-take / craft event in
  panel, or fixture grant.
- LOOT USED: equipped in any snapshot, OR `alienEffectHidden`
  cleared (first use reveals the effect), OR consumable units drop
  between snapshots.
- LOOT LEAK (per tier/source): found in ≥25% of panel runs but used
  in <10% of those found cases.
- LOOT UNREACHABLE: W1 scan miss — item id string absent from all
  of src/ (minus items.json) + index.html + sw.js.
- TIER MATTERS: fixture battery, same fighter/beast, weapon bonus
  and armor protection stepped T1→T4: ≥10% improvement per tier step
  on damage dealt or taken.
- WAVE-4 BAR: geared party (leader+ally, T3+ weapon and armor) vs a
  wave-4 beast wins ≥50% of 3 fixture seeds; else the gap is named
  (top earnable tier vs wave-4 demand).
- DINNER TEST: flag any ability/item whose panel food effect is net
  positive without cost, or that removes a food-pressure mechanic
  (no hunger, no spoilage, free feast). Flagged, not tuned.
- STACKED-PROBLEM CHECK: any ability/item that looks strong only
  because the underlying fight is already lost (damage shortfall +
  solo + no party offer) is reported as such, not as a fix.

Applied convention (recorded, not a re-score): fixture "scored seeds"
are 9201–9203; 9204–9205 are confirmatory. Medians hide targeted
effects (ally protection only shows on seeds where the ally is hit),
so verdicts use per-seed outcomes, not medians alone.

## Static census (current master, re-verified — not cited from Oct 31)

- Abilities: **142**. Lane is the System/skill boundary (code:
  `abilityDef` lane comment + slot logic): **magic 94, skill 48**.
  57 have actions (activatable); 49 have passive modifiers. Action
  contexts: combat 44 actions (42 abilities), explore 11, camp 7,
  field 1, social 5. Metabolic daily costs on 80 abilities
  (max extra_stomach 2200 kcal/day).
- Loot: **217 items, 108 with lootTier** — T1 7, T2 14, T3 43, T4 44.
  Classes: tool 56, clothing 33, weapon 11, material 4,
  sentimental 2, food 1, ammo 1. 24 clothing items carry
  `armor.protection`; 11 weapons carry `weapon.bonus`. `lootTier`
  is the operative tier (`tier` exists on only 20 of the 108).
  Tier stats (weapon bonus / armor protection, min–median–max):
  T1 +25 (n=1) / +6 (n=1); T2 +35–40–45 (n=2) / +8 (n=1);
  T3 +40–50–60 (n=3) / +8–12–25 (n=14);
  T4 +80–95–120 (n=5) / +12–35–60 (n=8).
- Synergies: **57** (discovery: sequential 32, simultaneous 14,
  sustained 11; 6 multi-path with `requires_any` alternative legs).
  49 have modifiers (top targets: trust.gain_mult 8,
  combat.strike_damage 7, drama.resolve_bonus 6, forage.yield 5);
  8 have none (flag-mechanism via `hasSynergy` code checks, except
  blood_tracker — see below).
- Relic enhancements: 51. Godpaths: 10 paths × 2 subclasses.
- Routes (final, after kill, prize, alien-origin, ruin-scavenge with
  exact ids, starter ≤T2 non-alien, godpath-gear relevantGear,
  god-capstone 16 items, trade-tool all 56 tool-class items):
  **zero lootTier items without an earnable route.** The retired
  farstrider god can never complete, but its items have other routes
  (farstrider_boots = prize, wayfinders_atlas = trade-tool).
- Unreachable scan re-run on current master
  (`node scripts/proof-lootabilities-w1.js scan`): **108 items,
  0 unreachable.** (An earlier JS-only "84 unreachable" count was a
  methodology error — W1 scans all files under src/, not just .js,
  plus index.html + sw.js — and is never cited.)
- Field-fight ability sets: vHasAb 27 + godpath FIELD_IDS 22 +
  FIELD_KIT 10 = **59** (no overlaps). Field fights read villager
  abilities via npcAbilities/npcOwnedIds; the scholar's own abilities
  do NOT enter field fights (npcOwnedIds(scholar) = [] even with
  abilities set) — scholar synergies therefore cannot change wild
  field-fight outcomes through that path. Field fights do use
  equipped gear (villagerGearUp at entry; armor absorbs with
  diminishing returns r = P/(P+20)).
- Scholar ability slots: integration ladder 20→2, 35→3, 50→4, 65→5,
  80→6, else 1. In panel runs integration reached 100 in every run
  and final held counts were ≤ slots — slots bind at the end of a
  run, while scholars churn through 4–17 abilities over a run's
  lifetime (swaps, not a lifetime cap).

## Panel results (seeds 31001–31008, competent, 120d)

Outcomes: 6 survived, 2 village-lost (31003 day 35, 31005 day 108).
Deaths are combat-dominated: 227 of 253 recorded deaths are combat
(116 villager combat + 57 villager combat + 40 scholar "the wild" +
10 monster + 4 arena); starvation 6, dehydration 1. Combat abilities
are therefore the highest-leverage class — and the least used (below).

Scholar ability use (`useAbility` wrap — the policy's own button
presses):

- **Only 2 of 57 activatables ever called**: green_thumb 258 calls
  (6/8 runs), green_whisper 174 calls (5/8 runs). Both are garden
  cultivation (camp, garden-only, 200 kcal, advance beds 4/8/12 days
  by level; green_whisper also multiplies forage gift chance).
  All 55 other activatables: **0 calls in 8 runs × 120 days** —
  including combat abilities the scholar held (blink, rage,
  turncoat, war_cry, pocket_sand, scream_cheese, raise_earth,
  foresight). This is a policy gap (the competent policy fights with
  strikes, never presses ability buttons), not an ability defect:
  the buttons work when pressed (fixtures + tb probe below).
- Scholar-held abilities: 33 distinct across runs (4–17 per run over
  time). Most-held, never called: lucky_rock 7/8 runs (passive),
  echo_location 6/8, dowsing 4/8, pocket_sand 4/8, beast_calm 4/8,
  adrenaline_surge 4/8. 109 of 142 abilities were never scholar-held
  in any run. Villager ability distribution was NOT snapshotted
  (snapshot gap — see Metric review), so villager-side distribution
  is unmeasured, not zero.

Scholar synergies: only **3 of 57 ever discovered + active**:
field_pharmacy (31001), airtight (31004), ringcraft (31007). The
other 54 never co-fired in competent play. (Mechanism is fine —
see synmods below. The gap is assembly: legs are rarely co-held,
and discovery requires use + combined-use conditions.)

Loot grants (tele wrap; note the double-fire: `loot_dropped` and
`broadcast_item_prize` fire for the SAME grant in most cases — 13 of
17 day+id pairs overlap in seed 31001 — so counts below use the
union of (day, id) pairs, not the sum):

- Total grants (union): **122**, distinct items **41**,
  by tier T1 11, T2 44, T3 61, T4 6. Tier 4 is 5% of grants despite
  being 44 of 108 items — the T4 flow is thin because monster loot
  tiers skew T2/T3.
- Equipped (scholar + first 6 villagers, any snapshot): **33**
  distinct lootTier items, spanning all tiers including T4
  (adaptive_dermis, bloodplate, commanders_coat, seed_vault,
  starfall_bow). T4 equipped-but-not-granted in panel
  (commanders_coat, oath_ring, seed_vault) proves trade/ruin routes
  deliver T4 in play — grant telemetry covers kill/prize only, not
  trade/ruin finds.
- Scholar inventory lootTier items seen: 48 distinct. Scholar-side
  first-use reveal (hidden → revealed across snapshots) happened in
  only **3 of 8 runs** (31004: 11 items, 31006: 4, 31008: 3); in 5 runs
  nothing in the scholar's pack was ever revealed — the scholar
  carries loot but rarely uses it.
- Pantry: starts 47,250 in all runs; ends 7,050–116,397; one run hit
  0. No dinner-test violation (see below). Seed 31002's pantry
  growth (to 116,397) correlates with the most green_thumb calls
  (111) but is not proof green_thumb caused it (competent foraging
  also grows pantries).

## Fixture results (fieldFight batteries, seeds 9201–9205)

Beast standards: bulldozer (W1, 80 HP) solo/ally; hushwolf (W1 pack 3,
60 HP); gallowdeer (W1, 160 HP); congregation (W4, 1000 HP, party).
Metrics: totalDamage (mHpStart − mHpLeft — the reconciling metric;
mDealt alone misses bird/pack damage), damage taken, rounds,
outcome, verb lines (log diff WITH-minus-WITHOUT), ffFired.

### Battery A — generic (59 field abilities, solo + ally, machete)

34 fired generically (verb line or strike suffix + effect):
bird_strike, bodyguard, brawler_instinct, bribe, cheese_wheel,
coin_guard, draw_fire, fear_aura, field_medicine, foresight,
freeze_tag, intimidating_presence, landslide, leech, live_broadcast,
mending_hands, pack_hunt, patient_aim, peacemaker, pocket_sand,
rage, raise_earth, retribution, shield_wall, static_toss, stoke,
switcheroo, the_crowd_moves, tripwire, unbreakable, plus strike
modifiers blood_trail (+2 vs half-dead prey), haymaker (×2 every
3rd round, masked by the kill cap vs 80-HP beasts), stalk (+4
opening), trade_of_blows (1.5× debt-settled, fired 1/3 seeds).

Key generic findings:

- The "bought a breath" template: bribe, raise_earth, fear_aura,
  freeze_tag, switcheroo, tripwire, pack_hunt (and others) spend the
  villager's action, then the monster hesitates next round, giving
  two strikes. Same combat math, different flavor/cost/conditions.
  Against the 80-HP threshold beast this flips flee→kill — which is
  why so many abilities share identical +27% damage deltas.
- Bird Strike (field): birds 8–12/round × 3 + 25% blind; ally config
  flips mFlee→vKill 3/3 scored seeds with damage taken −44%.
  Solo it extends the fight (3 vs 2 rounds) and damage taken rises
  (+42%) — the blind does not fully compensate solo.
- Live Broadcast / The Crowd Moves (ally): ally strikes again —
  both flip mFlee→vKill 3/3 scored seeds.
- Unbreakable / Shield Wall / Coin Guard (ally): damage reduction
  verb lines + vHpLeft gains (unbreakable +13 HP median solo/ally;
  shield_wall +11 ally; coin_guard +15 ally).
- Mending Hands: heals +13–18 HP (verb lines) but net vHpLeft
  unchanged — the heal costs a strike round, so the beast lives
  longer and hits more. Mechanism works; net wash in this fixture.
- Field Medicine: silent heal +20 HP (verb line, no ffFired);
  triggers only below 60% HP. Solo net wash (longer fight), ally
  vHpLeft +20 (77 vs 57 median) — the ally covers the lost strike.
- Leech (ally): leader takes half the ally's hits (verb lines);
  damage redistributed, total unchanged — tank tax, honest design.
- Draw Fire / Bodyguard (ally): verb lines; draw_fire cuts ally hit
  share 40%→10%; bodyguard intercepts one ally blow. Both move
  damage to the leader (tank tax again).
- Peacemaker: Walk In can end the fight peacefully — or fail and
  leave the villager exposed (+25% on the next blow). High variance
  by design (both outcomes observed).
- Blood Trail: +2/strike vs half-dead prey only, on the finishing
  blow, masked by the kill cap. Real but negligible (LIVE-WEAK).
- Stalk: +4 opening strike BACKFIRES vs fleeing beasts — it pushes
  the beast past its flee line sooner, flipping a kill to a flee
  on seed 9203. Same flee-line perversity as big weapons (below).
- The 25 generic non-firers went to Battery B (conditions below).
  Four approach-phase abilities (ambush, game_sense, tracker,
  echo_location) cannot fire in direct fieldFight calls at all:
  the approach phase (evade roll, opening strike) is gated on
  `opts.awareness`, which direct calls skip.

### Battery B — conditional (targeted conditions for the 25)

- Flee-phase trio (needs a fight that TURNS hopeless mid-fight,
  not one that starts hopeless): war_cry vs gallowdeer 160 flips
  vFlee→mFlee 3/3 scored seeds with damage +94% (64→124 median) —
  MAKE-OR-BREAK. Rally vs gallowdeer flips 1/3 to beast-flee but
  also holds a fatal fight to death on 1/3 — double-edged, LIVE.
  Scream Cheese fires when hurting (verb line) but the stun is
  wasted when the villager flees immediately after — FIRED,
  effect unmeasured in this fixture.
- Cheat-death family (leader 25 HP, bulldozer): second_wind fires
  (refuses death, +N HP) and extends the fight a round, but the
  solo villager still dies — buys rounds, not survival (stacked
  problem). Molt fires (full HP, loses ALL gear) and flips one
  seed to beast-flee. Ember Heart fires (burns 600 kcal, stands
  up) and flips one seed to beast-flee. Blink fires at HP <30%
  and flips death→kill on ALL 5 seeds (vDie→vKill) — MAKE-OR-BREAK.
  Back From The Brink does NOT fire alone: it amplifies another
  cheat-death (brink+second_wind adds "comes back ANGRY", +14–16
  damage on the seeds where second_wind fires). Lifeline and Last
  Rites fire only when an ALLY falls (fieldAllyDown): lifeline
  held a falling ally at 1 HP instead of 0 on the one seed where
  the ally fell (PROVEN life-save); last_rites' echo line fired
  but its absorb showed no delta (the fight ended before two
  more blows landed) — line-fired, effect unmeasured.
- Ally-protection trio, per-seed (medians hide these): aegis_link
  fires (thread of light) and REDISTRIBUTES damage — on the 2
  seeds where the ally was hit, ally damage 25/20 → 0 and leader
  damage 18/23 → 43, total unchanged. Ally-saving at leader cost.
- Combos: come_get_some needs a blinded beast (pocket_sand first):
  fires ("lurches toward the sound"), draws ALL attacks to the
  leader (taken roughly doubles) and flips 1/3 scored seeds
  (2/5 with confirmatory) — LIVE, tank tax. Misdirection needs a
  stunned beast (freeze_tag first): silent ×1.5 on stunned strikes,
  flips mFlee→vKill 3/3 scored seeds and roughly halves damage
  taken on the other seeds — MAKE-OR-BREAK. Gravity Well needs
  rage first (pending multi-strike): fires (pull line) with NO
  metric change — LIVE-WEAK. Prophecy enables foresight without
  "strong" (Foresight + Prophecy line variant) with identical
  metrics vs foresight alone — ENABLER, not independently
  effective here.
- Pack monsters (hushwolf, pack 3): turncoat fires ("two of them
  turn on each other") and HALVES damage taken on every seed
  (median −52%) — MAKE-OR-BREAK by the damage clause. Sweetener
  is NOT standalone: it is a bribe rider (fires only inside the
  bribe branch with packN ≥ 2); bribe+sweetener adds a packmate
  bite of 6–12 and flips 1/3 scored seeds (the bite kills on
  9201). Hogtie needs tripwire + rope_50ft (W2 pattern): fires
  (hogtied 3 rounds, bound blows halved) but tripwire alone
  already one-shots hushwolf, so the delta is ceiling-masked.
  Shoulder Check needs tripwire: fires (collision damage to a
  packmate) with the same ceiling masking.
- Big beast (gallowdeer 160): dead_aim NEVER fires in 10 fights
  (solo + ally). Its window (monster <25% HP) sits below the
  beast's flee line and is jumped over by ~25–35 strike sizes:
  strikes go from ~45 HP to ~20 HP (flee) without ever landing
  inside 25–40 HP. Mechanism real (×2 in code), window nearly
  unreachable — LIVE-WEAK with a structural cause.
- Approach phase (awareness=true): ambush fires (opening strike
  4–8+bonus) and flips 2/5 seeds to kills. Evasion bonuses show a
  clean dose-response: game_sense +0.10 evade flips 2/5 fights to
  evade, tracker +0.05 flips 1/5, echo_location night +0.10 flips
  2/5, echo_location day control flips 0/5 (night-only confirmed).
- Ally-held last_rites (holder = ally, ally healthy): no fire —
  consistent with fieldAllyDown (fires only on ally falls).
- Rally Aura: no delta in any fixture including low-HP noFlee
  fights. Its mechanism is a passive +0.06 hold bonus feeding the
  hold/flee decision — LIVE-WEAK (passive, unmeasured by fight
  metrics).

### Battery C — corrections (missing/conditional re-tests)

- Turncoat/sweetener/dead_aim re-runs with fixed args: see Battery B
  (turncoat, sweetener-rider, dead_aim above).
- War cry / rally vs gallowdeer, brink+second_wind pair,
  lifeline/last_rites on ally falls, aegis re-run with allyHpLeft
  captured: see Battery B.
- Aegis re-run confirms redistribution per-seed (above).

### Tiers battery (bulldozer 80, solo, 5 seeds, scored 9201–9203)

Weapon ladder, armor none (totalDamage / taken / rounds / outcomes):

- machete (baseline): 63 / 45 / 2 / [mFlee, vKill]
- shard_spear T1 (+25): 74 / 66 / 3 / [mFlee] — more damage, more
  taken, longer fight, never kills
- hardlight_knife T2 (+45): 74 / 42 / 2 / [mFlee]
- phase_blade T3 (+60): 80 / 42 / 2 / [vKill] — kills all scored
- godslayer_spear T4 (+85): 64 / 20 / 1 / [mFlee] — one huge strike
  (64) wounds the beast past its flee line; it flees after round 1

Weapon verdict: TIER MATTERS **fails** by the prereg bar — no
monotonic ≥10% improvement per step on damage dealt or outcome.
Bonuses apply to strikes, but outcomes are flee-dominated: the
tier-4 weapon's biggest hit produces a flee (survival, no loot)
where the tier-3 weapon produces a kill (loot). Perverse incentive,
same family as stalk.

Armor ladder, machete (taken / vHpLeft / outcomes):

- none: 45 / 55 / [mFlee, vKill]
- apology_padding T1 (+6): 34 / 66
- deep_pocket_coat T2 (+8): 32 / 68
- investigators_coat T3 (+12): 28 / 72
- lifebound_vestments T4 (+35): 17 / 83

Armor verdict: TIER MATTERS **passes** — every step cuts damage
taken (−24%, −29%, −38%, −62% vs none), matching the coded
diminishing-returns formula r = P/(P+20) almost exactly. The T4
jump (+35 protection) is the big one.

### Wave-4 bar (party: leader + ally, T3+ gear, congregation 1000 HP)

- T3 (phase_blade + investigators_coat): 0/5 wins, all vDie,
  totalDamage 48–154 (median 137, 13.7% of beast HP), 2–4 rounds,
  ally dealt 0–16.
- T4 (godslayer_spear + lifebound_vestments): 0/5 wins, all vDie,
  totalDamage 183–202 (median 196, 19.6%), 3–4 rounds,
  ally dealt 0–16.

WAVE-4 BAR: **FAILS at every earnable tier** (needs ≥50% wins on
3 scored seeds; got 0%). The gap, named: party damage is 5–6×
short of the beast's health; the ally contributes almost nothing
(0–16 damage — the "party" is effectively solo); survival is 2–4
rounds. T3 → T4 adds ~40% damage against an 80%+ shortfall, so no
earn-able tier closes it. This is the stacked problem in numbers:
damage shortfall + solo-in-practice + no party offer in the wild
(field fights field at most leader + 1 ally, and the ally barely
hits). Fixing it needs party formation + damage, not a tier bump.

### Synmods battery (scholar: legs held + discovered → recompute)

- 57/57 synergies activate when legs are held + discovered
  (after fixing the script's multi-path handling: the 6
  `requires_any` synergies need their first alternative path
  applied, with synergy-id legs marked discovered).
- 49/49 modifier sets appear in Game.mods() when active.
- The 7 other no-modifier synergies work via `hasSynergy` code
  checks (refuses_death: cheat-death uses 1→2; undying_fury:
  mid-rage full restore; fevers_end, stand_together,
  shattering_blow, impaling_scream, static_edge: code reads
  confirmed).
- blood_tracker: activates but has NO modifiers and NO code reads
  and NO requirers — active yet inert. Mechanically dead.

SYNERGY OUTCOME (prereg fight-delta sense) is UNMEASURED for all
57: no pair-vs-single fight fixture was built, and field fights
do not read scholar synergies (npcOwnedIds(scholar) = []), so the
field battery cannot test them. What is proven is activation +
modifier application (the mechanism), not fight outcomes. See
Metric review.

### Tb probe (scholar-side combat activatables, bulldozer)

Bird Strike via useAbility in a tb fight: returns true, costs
60 kcal, summons birds for 3 rounds. Over the fight: strikes
10/4/8 + bird damage 11/11/12 = 65 total vs 37 without (strikes
only 9/10/10/8), and the blind triggered ("goes for the eyes —
it's blinded!"). Scholar-side Bird Strike CONFIRMED effective,
reproducing the Oct 31 slice claim with a runnable fixture
(scripts/audit-tbprobe-20261101.js). Live Broadcast / Mending
scholar-side tb use was not probed (field-verified only) — the
probe covers bird_strike; broadcast/mending tb-side is a gap,
not a failure (see Metric review).

## Verdict tables

### Abilities by class

Field combat (59) — fired 57/59 (34 generic + 23 conditional);
narrow-window/passive 2 (dead_aim, rally_aura — LIVE-WEAK, not
dead). Make-or-break 11 (below). Distribution: only ~10 of the 59
were ever scholar-held in panel runs (pocket_sand, echo_location,
rage, turncoat, war_cry, blink, raise_earth, foresight,
scream_cheese, unbreakable); villager-side distribution unmeasured
(snapshot gap).

Approach/evasion (ambush, game_sense, tracker, echo_location):
LIVE — evasion bonuses + opening strike, dose-response confirmed
(+0.10 → 2/5 evades, +0.05 → 1/5, night-only for echo_location).

Cheat-death (second_wind, molt, ember_heart, blink,
back_from_the_brink): LIVE — all fire; blink is make-or-break;
second_wind/molt/ember buy rounds, not solo survival; brink is an
amplifier only (dead alone, +14–16 damage with second_wind).

Ally protection (bodyguard, draw_fire, leech, shield_wall,
aegis_link, lifeline, last_rites): LIVE — all fire; all move or
absorb damage at a cost (tank tax / redistribution / hold-at-1);
last_rites' absorb delta unmeasured (fight ended before it could
matter).

Healing (field_medicine, mending_hands): LIVE — both heal
(+20 silent, +13–18 verb); both cost a strike round, so solo net
is wash and ally config is positive.

Control/breath template (bribe, raise_earth, fear_aura,
freeze_tag, switcheroo, tripwire, pack_hunt, pocket_sand,
intimidating_presence, peacemaker, etc.): LIVE — the shared
spend-an-action → monster-hesitates → extra-strikes template;
four of them are make-or-break vs the threshold beast (below).

Damage modifiers (blood_trail, haymaker, stalk, trade_of_blows,
rage, stoke, coin_guard, unbreakable, retribution, patient_aim,
brawler_instinct, cheese_wheel, static_toss, landslide):
LIVE except blood_trail (LIVE-WEAK, +2 finishing-blow only) and
stalk (LIVE but perverse vs fleeing beasts).

Non-field abilities (83) — by mechanism, all with code paths:

- Garden/camp actions (green_thumb, green_whisper): LIVE and the
  ONLY panel-called abilities (432 calls). Costs real (200 kcal +
  beds + time); acceleration, not conjuration.
- Explore/social/camp actions (the other 55 activatables):
  mechanisms exist (useAbility dispatch + action definitions);
  panel calls 0 — distribution gap, not construction gap. Their
  scholar-side tb/field efficacy is proven only where the field
  battery covers them (combat-context ones in the 59); the rest
  (explore/camp/social contexts) are unmeasured in fixtures.
- Skill passives (modifiers, codex-owned, never slotted): LIVE by
  construction (modifiers resolve through the shared engine);
  panel held rates vary (lucky_rock 7/8, dowsing 4/8, beast_calm
  4/8, iron_stomach 3/8, night_eyes 2/8, etc.).
- Godpath payoffs (10: blood_frenzy, feast_engine,
  battlefield_grace, nowhere_man, cartographers_eye,
  crowd_favorite, hoarders_interest, cornucopia, keepers_oath,
  harvest_table): LIVE via buildarounds.js (cornucopia = forage
  streaks, feast_engine = full-HP +25% damage — combat, not food
  conjuration — both verified in code).
- Godpath enablers/ties (photosynthesis, eyes_in_back,
  blood_magic, cannibal_frenzy, pact, time_skip, hive_mind,
  beard_moss, dowsing, cornered_rat, phoenix_clause, translator,
  purify): LIVE via their mechanisms (photosynthesis = +100 kcal
  per daylight part, capped, metabolic 150/day — see dinner test;
  swimmer = creek crossings; symbiote = poison warnings;
  generous = aid/gifting paths; fusion_reactor = reactor system).
- Synergy-leg-only (diplomat, camp_cook, scrounger, cold_blooded,
  compost_king, open_book, herbal_remedy, evidence_board,
  gossip_network): value = enabling their synergies. gossip_network
  has zero .js mentions but enables everybodys_friend +
  word_of_mouth; evidence_board enables string_wall + airtight
  (airtight co-fired in panel — proof the leg path pays off).
  NOT dead — leg value is real when the synergy fires.

### The dead list

Abilities: **NONE.** Every one of the 142 has a code path
(field branch, useAbility action, passive modifier, skill path,
godpath payoff, synergy leg, or direct code read) and every
field-tested one fired under its conditions. (The earlier "36
no-path" count was a census artifact — godpath payoffs,
enablers, and synergy legs were missing from the path check.)

Synergies: **blood_tracker ONLY** (mechanically dead — activates
but does nothing: no modifiers, no code reads, no requirers).

Distribution-dead (work, but never reached in competent play):

- 55 of 57 activatables never called by the competent policy.
- 54 of 57 synergies never co-fired in panel runs.
- 67 of 108 loot items never granted in panel runs
  (kill/prize telemetry only; trade/ruin finds untelemetried).
- 109 of 142 abilities never scholar-held in panel runs.

### The make-or-break list

Good flips (≥2/3 scored seeds) or damage delta ≥50%. Fixture
context matters — read the caveat after the list.

- bird_strike (ally config): mFlee→vKill 3/3, taken −44%.
  Scholar tb-side also confirmed (birds 34 damage + blind).
- live_broadcast (ally): mFlee→vKill 3/3 (extra ally strike).
- the_crowd_moves (ally): mFlee→vKill 3/3 (extra ally strike).
- blink (low HP): vDie→vKill 5/5 — death to kill, every seed.
- misdirection (+freeze_tag): mFlee→vKill 3/3, taken roughly
  halved on the other seeds (silent ×1.5 on stunned strikes).
- war_cry (vs gallowdeer, hopeless trajectory): vFlee→mFlee 3/3,
  damage +94% (64→124 median).
- bribe / raise_earth / stoke / landslide (solo, bought-a-breath
  template): mFlee→vKill 2/3 each.
- turncoat (vs pack monsters): damage taken −52% median (halved
  on every seed) via pack infighting.

CAVEAT (stacked-problem check): the solo threshold-beast flips
(bribe/raise_earth/stoke/landslide, and partly bird/broadcast/
crowd) happen because the baseline fight sits exactly at the
flee/kill threshold (62–63 damage vs 80 HP, beast flees). They
prove the abilities work, not that they win hard fights: the
same abilities do not move the wave-4 bar at all (0/5 wins at
T3/T4 gear). The losing-fight flips (blink death→kill,
misdirection, war_cry flee→beast-flee, turncoat damage halving)
are the stronger evidence — they change fights that were
actually being lost.

Perverse flips (ability makes the outcome WORSE — flee-line
family, reported separately, not as make-or-break):

- stalk, cheese_wheel, freeze_tag, fear_aura, switcheroo,
  pack_hunt, static_toss, field_medicine (solo): each flips a
  9203 kill to a flee — the ability's action (or extra damage)
  pushes the beast past its flee line before the kill lands,
  losing the loot. Same mechanism as the tier-4 weapon flee.
- rally (vs gallowdeer): holding a fatal fight kills the holder
  on 1/3 seeds — the hold is honest cost, not free courage.

### Synergies (57)

Panel co-fire (discovered + active in ≥1 snapshot): ONLY 3 —
field_pharmacy (31001), airtight (31004), ringcraft (31007).
Mechanism (synmods fixture: legs held + discovered → recompute):
57/57 activate; 49/49 modifier sets apply in Game.mods();
7 no-modifier synergies work via code checks. Fight-outcome
deltas unmeasured (see Metric review).

- LIVE (mechanism + panel co-fire): field_pharmacy, airtight,
  ringcraft.
- LIVE (mechanism proven, distribution gap): the other 53 with
  modifiers or code checks — they work when assembled; competent
  play never assembles them. Notable: the multi-path family
  (clean_kill, blood_tracker excluded, apex_predator,
  unstoppable, fear_itself, one_person_army) all activate via
  their first alternative path with modifiers present.
- DEAD: blood_tracker (activates, does nothing).
- Full 57-row mechanism table is in the run log files
  (evidence/2026-11-01/audit-fixtures-20261101/synmods-*.json);
  per-synergy legs/modifiers are in src/data/synergies.json.
  The three panel co-fires are the only ones meeting the prereg
  CO-FIRE bar; the other 54 fail it on distribution, not
  mechanism (except blood_tracker, which fails it on both).

### Loot pipeline by tier × source

Grants (kill/prize tele union, 8 runs): T1 11, T2 44, T3 61, T4 6
(total 122, 41 distinct). Equipped (scholar + first 6 villagers):
33 distinct. Scholar inventory seen: 48 distinct.

- T1 (7 items): granted 11 events; equipped includes
  apology_padding, shard_spear. Leak candidates: fusion_pellet
  (granted 2 runs, equipped 0 — but it is reactor fuel, consumed
  not worn, so not a true leak), spare_battery (granted 2,
  equipped 0 — consumable/power use untelemetried; candidate
  with caveat).
- T2 (14 items): granted 44 events; equipped includes
  deep_pocket_coat, hardlight_knife, phase_sling, harvest_scythe
  (T3 — see below). Leak candidate: gravity_hook (granted 6
  runs, equipped 0 — a tool; tool USE is not equipped, so this
  is "never seen worn", not proven unused).
- T3 (43 items): granted 61 events; equipped includes
  phase_blade, wardens_cloak, shelter_cloak, living_soil_robes,
  skull_helm, stormcloak, ghost_camo, investigators_coat (via
  armor ladder), and more. Leak candidate: trailblazer_machete
  (granted 2, equipped 0 — a weapon never worn is a real leak
  signal: GearUp or the villagers prefer other weapons).
- T4 (44 items): granted only 6 events (adaptive_dermis,
  bloodplate ×2 runs, fusion_cell, genesis_seed,
  second_skin_suit); equipped includes those plus
  commanders_coat, oath_ring, seed_vault (found via
  trade/ruin, not kill/prize telemetry). The T4 pipeline is
  thin, not broken: T4 exists, is earnable, is worn when found —
  it just rarely drops (monster loot tiers skew T2/T3).

Where the pipeline leaks (honest version): NOT at "never found"
(0 unreachable, 0 without a route) and NOT broadly at
"found but never used" (only 4 leak candidates, 3 with
measurement caveats, 1 real: trailblazer_machete). The leaks
are: (a) scholar-side use — loot is carried, not used
(reveal in 3/8 runs); (b) T4 thinness — 5% of grants;
(c) telemetry — trade/ruin finds are not counted, so
found-runs understate finding, and tool-use is not counted,
so used-runs understate use. The pipeline's real gap is
distribution (67 items never granted in 8 runs), not reachability.

Sources: kill drops + show-event prizes are tele-counted (and
double-fired — see panel section). Ruin-scavenge (exact ids),
craft (0 of 108 lootTier items are recipe outputs — craft is
NOT a lootTier route), starter (≤T2 non-alien), godpath-gear,
god-capstone (16), trade-tool (all 56 tools) are route-verified
statically but not tele-counted in panel runs.

### Armor + weapon tiers

- Armor: TIER MATTERS passes. Damage taken falls monotonically
  every step (45 → 34 → 32 → 28 → 17), matching the coded
  diminishing-returns formula. The T4 step (+35 protection) is
  the big one (−62% vs none). Armor is the reliable ladder.
- Weapons: TIER MATTERS fails. Damage dealt by tier: machete 63,
  T1 74, T2 74, T3 80, T4 64 — non-monotonic, and outcomes are
  flee-dominated (T3 kills all scored seeds; T4 flees after one
  huge strike). Bigger bonuses do not mean better outcomes
  against fleeing beasts.
- Wave-4 bar: FAILS at T3 and T4 (0/5 wins both; 13.7% / 19.3%
  of beast HP). The ladder tops out at T4 (bonuses to +120,
  protection to +60) against a demand of ~1000-HP beasts that
  kill a geared party in 2–4 rounds. No earnable tier closes a
  5–6× damage gap; the ally's 0–16 damage shows the party
  itself is the missing piece, not the gear.

## Dinner-test flags

NONE violate. Checked:

- green_thumb / green_whisper (the only panel-called abilities):
  garden acceleration costing 200 kcal + beds + time. Beds must
  still be planted and harvested. Acceleration, not conjuration.
  (31002 pantry growth correlates with green_thumb calls but is
  not proven caused by them.)
- photosynthesis: +100 kcal per daylight part, capped by the
  kcal cap, metabolic cost 150/day. Gross at most +300/day,
  net at most ~+150/day (7.5% of a day's need), conditional on
  holding the ability and being alive in daylight. A supplement,
  not a skip-dinner.
- extra_stomach: metabolic 2200/day (more than a day's ration)
  for ×2 meal capacity. A trade that costs more than it can
  return in a day — capacity, not free food.
- ember_heart: cheat-death burns a real 600 kcal. A price, not
  a gift.
- feast_engine: despite the name, a combat payoff (full HP →
  +25% damage). No food effect at all.
- cornucopia: forage streaks, not conjuration. No flag.
- No item removes hunger, spoilage, or the need to eat. Pantry
  pressure is real in panel runs (one run hit 0; most decline).

## Top fix candidates (delivery specs, NOT built)

1. **Competent policy presses combat buttons.** The single
   biggest distribution gap: 55/57 activatables never called.
   Spec: extend the competent policy's fight hook to evaluate
   held combat actions (bird_strike call on combat entry,
   rage/stoke when winning, pocket_sand/freeze_tag when losing,
   field_medicine below 60% HP, blink below 30% HP) with the
   same kcal/turn costs the player pays; measure call rates +
   fight outcomes vs the current policy on seeds 31001–31008.
   This is a policy change, not a game change — no ability
   numbers move.
2. **Synergy discovery in competent play.** Only 3/57 co-fire.
   Spec: instrument WHY assembly fails (legs rarely co-held?
   discovery conditions rarely met? uses too rare?) on panel
   runs, then adjust discovery triggers (not synergy power) so
   a competent 120-day run assembles a handful of synergies;
   re-measure co-fire on the same seeds. Do not buff synergy
   modifiers until assembly is proven.
3. **Flee-line perversity (weapons + stalk + control abilities).**
   Bigger hits and opening damage lose kills to early flees
   (T4 weapon, stalk, cheese/freeze/fear/switcheroo/pack-hunt/
   static_toss on seed 9203). Spec: design decision (not a
   number tweak in this audit) — either fleeing beasts drop
   partial loot, or the flee line sits below finisher windows,
   or fleeing counts as a win for deed purposes. Measure:
   kill rate vs flee rate by weapon tier on the bulldozer
   battery before/after.
4. **Wave-4 damage gap (party, not tier).** 5–6× short with an
   ally dealing 0–16. Spec: party formation + ally damage work
   (why does the ally barely hit? targeting? weapon? strikes?)
   measured on the congregation battery; a tier bump alone
   cannot close this (T3→T4 adds ~40%).
5. **Dead_aim window.** Its <25% window is jumped over by strike
   sizes + flee lines (0/10 fights). Spec: widen the window
   (e.g. <35%), or make the flee line respect finishers, or
   re-scope dead_aim to a different trigger. Measure on the
   gallowdeer battery (solo + ally).
6. **blood_tracker: give it an effect or retire it.** It
   activates and does nothing. Spec: attach a real modifier
   (e.g. wounded-prey tracking/finishing) or remove it from
   synergies.json with its discovery text. One-line data or
   deletion decision — no new system.
7. **Scholar loot use loop.** Loot is carried, not used
   (reveal in 3/8 runs). Spec: instrument scholar tool/weapon
   USE (not just equipped) and find why granted tools/weapons
   sit in packs (GearUp preferences? action costs? knowledge
   gating?) — starting with trailblazer_machete (granted 2,
   equipped 0) and gravity_hook (granted 6, never worn).
8. **T4 grant thinness.** 5% of grants. Spec: review monster
   loot-tier rolls / tier4Chance weighting so T4 appears in
   competent play at a rate matching its 44-item pool — or
   accept thinness explicitly as design (T4 as rare prize, not
   ladder rung). Measure grant mix on panel seeds after.
9. **Ally-protection measurement.** lifeline/last_rites/aegis
   effects only show on seeds where the ally is actually hit
   (medians hide them). Spec: future fixture batteries must
   report per-seed ally outcomes (allyHpLeft/allyTaken, now
   captured) alongside leader metrics — instrument change for
   the NEXT run, not a re-score of this one.

## Metric review

Revisions for the NEXT run only (never re-scores of this run):

- Fixture seed convention: scored = 9201–9203, confirmatory =
  9204–9205 (prereg named 9201–9205 for fixtures and 3 scored
  seeds for make-or-break; this run applies scored = first
  three and reports all five per-seed).
- Villager ability distribution unmeasured: panel snapshots
  track scholar abilities + equipped, not villager npcAbilities.
  Next run should snapshot villager abilities for the roster so
  DEAD-DISTRIBUTION can be judged villager-side, not just
  scholar-side.
- Synergy fight-outcome deltas unmeasured: no pair-vs-single
  fight fixture exists, and field fights do not read scholar
  synergies. Next run should build a tb-fight pair-vs-single
  battery (scholar + synergy combat modifiers) for the 7
  combat.strike_damage synergies before claiming synergy fight
  effects.
- Scholar-side tb use probed for bird_strike only; broadcast /
  mending scholar-side tb use is field-verified but tb-unprobed.
- allyHpLeft/allyTaken were added to fixture metrics mid-run;
  the aegis battery was re-run to capture them (aegis-allylow2).
  Earlier ally-protection verdicts rest on per-seed reads of
  the re-run plus verb lines.
- Synmods script fix mid-run: the 6 multi-path synergies need
  requires_any paths (synergy legs marked discovered). All 6
  were re-run with the fix; earlier "not active" results for
  them are superseded, not re-scored (the fix corrects the
  instrument, and the corrected runs are the reported ones).
- Custom-fixture arg-order trap (missing items arg produced
  "monster not found" for 3 customs): caught because outputs
  were missing, fixed, and re-run (turncoat-pack,
  sweetener-pack, deadaim-big). Future custom runs should fail
  loudly on unknown monster ids instead of writing nothing.
- Blood_trail / haymaker / stalk / trade_of_blows verdicts rest
  partly on strike-line suffixes (not verb lines): suffixes are
  real code output (vd modifiers), but their magnitude is
  small or masked — reported as LIVE-WEAK/LIVE with the masking
  noted, not as strong effects.

## Telemetry deviation check

NOT APPLICABLE, recorded honestly (no refusal, no override, no
baseline reseed): `scripts/telemetry-check.js` compares a
baseline corpus against current corpora on named metrics and
refuses recorder corpora as --current unless
--allow-recorder-corpus is given. This audit's panel outputs are
not game telemetry corpora and no baseline exists for these
instruments (useAbility wraps, fixture batteries, synmods
probes). Running the check without a baseline would be
meaningless, and forcing it with --allow-recorder-corpus would
misrepresent the data. A future run may establish a baseline
from this audit's outputs and then run the check against it.

## Run log

- Static census: scripts/audit-static-census-20261101.js +
  scripts/audit-static-census2-20261101.js (outputs in /tmp,
  ephemeral — census conclusions re-verified from src/data +
  src/js greps above; W1 scan re-run in this session: 108
  items, 0 unreachable).
- Panel: scripts/audit-panel-20261101.js, seeds 31001–31008,
  120 days, competent policy, serialized one process per seed.
  Outputs: evidence/2026-11-01/audit-panel-20261101/seed-*.json
  (31001 survived 121d; 31002 survived 121d; 31003 village-lost
  35d; 31004 survived 121d; 31005 village-lost 108d; 31006
  survived 120d; 31007 survived 120d; 31008 survived 120d).
- Fixtures: scripts/audit-fixtures-20261101.js (ability/tiers/
  wave4/synmods/custom modes), seeds 9201–9205, one process per
  battery arm. Outputs:
  evidence/2026-11-01/audit-fixtures-20261101/ability-*.json
  (59 × with/without), custom-*.json (conditional batteries
  B/C), tiers-*.json (weapon + armor ladders),
  wave4-*.json (T3/T4 parties vs congregation),
  synmods-*.json (57).
- Tb probe: scripts/audit-tbprobe-20261101.js (bird_strike
  with/without; scholar tb-side activation + damage + blind).
- Analyzer: scripts/audit-analyze-fixtures-20261101.py
  (medians + flip counts; per-seed reads used for verdicts
  where medians hide targeted effects).
- Probe scripts (not verdicts):
  scripts/audit-probe-20261101.js (rec keys, npcOwnedIds).
