# XP coverage + synergy + gear protection + healer road — pre-registration
# Evidence: evidence/2026-11-05/xp-gear-prereg.md
# Date: 2026-11-05. Builder: build-xp-gear worktree (muse-main).
# Steve rulings 2026-11-05 07:09 + 07:22 CST (see MEMORY.md: XP, ABILITIES + GEAR;
# Healer class road — the caregiver/healer subclass was never built into a walkable road).

## Question
Does wiring XP into most everyday actions (+ a synergy bonus) + a gear-protection
retune + healing-deed credits make abilities actually reach villagers in the wild,
let fully-geared parties survive wave-4 fights, and produce recognized Healers?

## What the build changes (all in the worktree; nothing on master yet)
1. XP coverage: creditDeed/noteDeed wired into everyday actions that give nothing
   today (cook, forage, fish, craft, heal, trap, preserve, garden, + any other
   common action with a deed entry or an obvious track home). Deed entries added
   to tracks.json where an action has none. Per-day caps KEPT (decisions, not
   grinding). Data-first.
2. Synergy bonus: a small synergy table in tracks.json + a bonus path. Synergistic
   deeds grant more XP (fight won with an ability used; hunt with a party member;
   teaching a skill learned from someone else; cooking with a taught recipe;
   healing that saves someone — the care_survived shape). Bonus + reason visible
   in narration/telemetry. No silent XP.
3. Gear protection retune: raise armor/gear protection (data-first, items.json)
   so a fully-geared, tier-appropriate party SURVIVES wave-4 fights. Values set
   AFTER the baseline measurement, targeting the measured survival gap. No win
   prices, deed gates, food costs, six slots, or new tier changed.
4. Healer road: the 'healing' deed credited everywhere healing actually happens
   (departure heal check already does; add triage tents, Mending in fights,
   field_medicine use, + any other healing site). Road as designed: heal a lot
   -> craft XP -> craft level-ups -> craft kit offers include all 5 healer magic
   abilities (purify, the_touch, battlefield_grace, mending_hands, lifeline)
   -> hold 3+ caregiver magic -> recognized "Healer of the Shepherd of the
   Dead". No new class/path; no recognition-threshold or caregiver-deed change;
   triage/field_medicine stay skill-lane (teachable), never magic.

## Panel (pre-registered; run BEFORE the gameplay changes, then AFTER, identical)
- Driver: scripts/xp-gear-panel-20261105.js (single-seed, stdout JSON record) +
  analyzer scripts/analyze-xp-gear-panel-20261105.js. Policy: capable.
  Horizon: 120 days. Observer-side wrappers only (Game.fieldFight,
  Game.villagerHealCheck, Game.noteCareRescue if a method, Game._triageRun if a
  method) — pure recording, no game-behavior change, same driver both arms.
- Seeds (8, the first 8 of the standard STD16 list): 7, 42, 99, 1234, 555, 777,
  2026, 31337.
- Output: evidence/2026-11-05/xp-gear-panel-before/ (baseline, code = base
  6b516a7ea + driver only) and evidence/2026-11-05/xp-gear-panel-after/
  (after the build). Analyzer compares them.

## Bars (GO = all of A-D hold; any miss is NO-GO for that axis, never re-scored)
- A. XP ACQUISITION: mean total track XP earned per living villager per day,
  after >= 2x before. Thresholds crossed (any track level >= 1) per seed,
  after > before.
- B. ABILITY HOLDINGS: mean magic abilities held per living villager, after >
  before; distinct abilities held across the panel, after > before.
- C. RECOGNIZED HEALERS: villagers (or the player) recognized as
  caregiver/healer ("Healer of the Shepherd of the Dead"), counted from
  state.village.npcGodpath + state.scholar.godpath. Before expected ~0.
  Bar: after-panel has >= 1 recognized Healer where the before-panel had ~none.
- D. WAVE-4 SURVIVAL: mean rounds survived per wave-4 field fight, after >=
  1.25x before; fighter deaths in wave-4 fights, after < before; wave-4 kills,
  after >= before (not worse).
- GUARDRAILS (investigate, don't auto-fail, per Steve 2026-10-15): village
  survival days and wins after >= before. A drop prompts investigation, not
  an automatic verdict. No all23 weighted score; each bar judged on its own.

## Method notes
- Baseline runs FIRST (driver + analyzer only, no gameplay change) so the
  before-numbers are uncontaminated. Gameplay commits land after the baseline.
- Determinism: same seeds, same driver revision, same policy/horizon in both
  arms. The driver seeds Math.random before eval (sim-harness loadGame).
- Gear retune values are set from the measured baseline gap, not guessed up
  front; the retune commit records the before-numbers it targets.
- Proof tests: scripts/test-xp-coverage-20261105.js, scripts/test-xp-synergy-20261105.js,
  scripts/test-gear-protection-20261105.js, scripts/test-healer-road-20261105.js
  (before/after where it matters). check.js --quick must show no NEW failures
  vs the standing 279/11 profile.

## Deliberately NOT changing
- Win prices, deed gates, food costs, six ability slots, recognition thresholds
  (min 3 magic abilities of one path), the caregiver deed (care_survived) or
  its capstone, the tracks thresholds [18,48,96,192,384], per-day deed caps,
  the systemArrived gate on villager level-up sheets, the skills-vs-abilities
  boundary (skills teachable + XP-leveled; abilities System-granted only via
  level-up/combat completion — never taught, never bought, never granted by a
  deed directly).

## CORRECTION (2026-11-05 ~07:45 CST, from the seed-7 30-day smoke test)
The brief's premise "cooking, crafting, fishing, foraging, gardening, healing,
preserving, trapping, alien_fight, integration have NO call sites" is WRONG for
most of them. The driver wraps Game.creditDeed and records every credit; in 30
days (seed 7, capable) these fired: foraging 37 (player 22 + villagers 15),
cooking 14 (villagers), crafting 11 (villagers), gardening 24 (villagers),
preserving 9 (villagers), integration 4 (player), plus teaching 50,
conversation 120, discovery 22, fight_won 25, fight_survived 17. Call sites
exist (e.g. foraging game.js:6889/27348/28384/28402; cooking food.js:3251/3464/
3493 + game.js:7355; crafting game.js:3517/7398/19210; gardening game.js:6807/
7067/22423/22465; preserving food.js:939 + game.js:7280; integration
game.js:6024). The bars above do NOT change (they are outcome bars), but the
build's emphasis shifts: the REAL dead deeds in 30 days are healing (0 credits
despite 228 heal checks and 26 care rescues — the sites where healing actually
happens, Mending/lifeline/healer_rounds/triage/field_medicine, never credit
the deed), hunting (0), fishing (0), trapping (0), alien_fight (0). The 120-day
8-seed baseline will say whether hunting/fishing/trapping ever fire; the
healing gap is already proven and is the Healer road's starvation point.

## BASELINE NUMBERS (2026-11-05 ~07:50 CST, 8 seeds, capable, 120d — the
## before-arm; full analysis in evidence/2026-11-05/xp-gear-panel-before-analysis.md)
- XP/villager/day 1.56; deed XP by track: field 2620, social 3447, craft 643
  (STARVED), combat 1713, strange 880. Thresholds crossed (panel): 74
  (craft only 6). Holdings 3.61/living villager, 9.75 distinct.
- Healers: 1 total (seed 7) — so the before-panel does NOT have ~none, it has
  exactly one. BAR C IS READ AS: after > before with after >= 2 total
  (the road walked more, not just once). This clarification is made BEFORE the
  after-arm runs.
- Wave-4 fights: 11 total (1.38/seed), mean rounds 1.46, outcomes vDie 6 /
  vFlee 4 / vKill 1, mean damage taken 31.91/fight. Thin sample — the gear
  proof test (staged, controlled) carries the retune evidence; the panel is
  the wild confirmation.
- Healing: 364 heal checks/seed, 47.63 care rescues/seed (heal_check 180 +
  healer_rounds 201 panel-wide; ZERO mending_hands/lifeline saves — villagers
  rarely hold those abilities), but only 12.50 healing deed credits/seed.
  Triage runs: 0 across all 8 seeds (the relief never fires in the panel).
- Truly dead in the wild (0 in 8 seeds x 120d): hunting, trade. Their credit
  sites EXIST (hunting: encounters.js:1063/2572, game.js:6654/6733; trade:
  betrayal.js:3784) but the actions never complete in the capable panel — a
  bot/duty-assignment question, not a deed-wiring question. NOT chased in this
  build; reported as a measured gap for the next job. Fishing (350) and
  trapping (77) DO fire over 120d.
- Guardrails: survival 92.13 days, wins 0.50/seed (4/8), deaths 55.88,
  living at end 4.75.
