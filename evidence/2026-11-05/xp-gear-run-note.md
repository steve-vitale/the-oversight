# XP coverage + synergy + gear protection + healer road — run note
# Evidence: evidence/2026-11-05/xp-gear-run-note.md
# Date: 2026-11-05. Builder: build-xp-gear worktree (branch build-xp-gear).
# Steve rulings 2026-11-05 07:09 + 07:22 CST. Pre-registration:
# evidence/2026-11-05/xp-gear-prereg.md (amended with baseline numbers + bar C
# clarification BEFORE the after-arm runs).

## What the smoke test + baseline proved (correcting the brief's premise)
The brief said cooking, crafting, fishing, foraging, gardening, healing,
preserving, trapping, alien_fight, integration have NO call sites. MEASURED
(seed-7 30-day smoke + 8-seed 120-day baseline, capable policy): most of them
DO fire. The real dead deeds in the wild are hunting (0 in 8 seeds x 120d)
and trade (0) — their credit sites EXIST, but the actions never complete in
the capable panel (a bot/duty-assignment question, not a deed-wiring one).
NOT chased in this build; reported as a measured gap for the next job.
Fishing (350) and trapping (77) DO fire over 120d. Healing fires rarely
(100 credits vs 381 care rescues) — the Healer road's starvation point.

## Baseline (before-arm; full analysis: xp-gear-panel-before-analysis.md)
- XP/villager/day 1.56; deed XP by track: field 2620, social 3447, craft 643
  (STARVED), combat 1713, strange 880. Thresholds crossed: 74 (craft only 6).
  Holdings 3.61/living villager, 9.75 distinct. Healers: 1 (seed 7).
- Wave-4 fights: 11 total, mean rounds 1.46, outcomes vDie 6 / vFlee 4 /
  vKill 1, mean damage taken 31.91/fight.
- Healing: 364 heal checks/seed, 47.63 care rescues/seed (heal_check 180 +
  healer_rounds 201; ZERO mending_hands/lifeline saves), 12.50 healing deed
  credits/seed. Triage runs: 0 (the relief never fires in the panel).
- Guardrails: survival 92.13 days, wins 0.50/seed (4/8), deaths 55.88.

## What changed (the build)
1. SYNERGY (tracks.json + tracks.js): a `synergies` table (5 entries) +
   `creditSynergy(who, synergyId)` — bonus XP on top of the deed's n, per-day
   capped per doer, tele's 'track_synergy' + says a line for the player (no
   silent XP). The caller judges the shape at the deed's site.
   - fight_with_ability (combat +1): a kill with an ability in play
     (fieldFights.js fight_won site, rec.ffFired; TB settlement game.js, the
     new f._abilityUsed / f._abilityUsedBy flags set by useAbility and the
     villager turn handler).
   - teach_learned_skill (social +1): teaching a skill the teacher learned
     from someone else (skill-teaching.js; ledger check + codex via 'taught').
   - craft_taught_recipe (craft +1): crafting from a recipe taught by another
     villager (game.js craft(); codex recipe via 'taught'). REFRAMED from the
     brief's "cooking with a taught recipe": recipes — not cooked meat — are
     the taught-knowledge system.
   - heal_save (craft +2): healing that saves someone (godpath.js
     noteCareRescue — the care_survived shape, all four via values).
   - forage_new_plant (field +1): foraging a plant new to this ground
     (game.js forage; the site already knows isNew). REFRAMED from the
     brief's "hunt with a party member alongside": no hunt site has party
     context, so the field synergy is the knowable two-things-at-once shape.
2. HEALING DEED (the Healer road's starvation point):
   - Mending in fights (godpath.js, ally + self heal) now credits 'healing'.
   - Lifeline (godpath.js) now credits 'healing' for the holder (the save
     itself; the god deed is separate).
   - field_medicine in fights (fieldFights.js off-screen + game.js TB turn)
     now credits 'healing'.
   - Triage tents (safetynets.js _triageRun) now credit 'healing' to the camp
     healer, and record care rescues for wounded tended back from the brink.
   - Player-as-medic exclusion REMOVED (game.js villagerHealCheck +
     healer_rounds): the bearer who patches/makes rounds now earns the deed
     like any villager (creditDeed already maps the bearer's id to the player).
   - noteCareRescue (godpath.js) now credits 'healing' for battle saves
     (mending_hands, lifeline — the vias with no other credit) + the
     heal_save synergy for every save.
3. GEAR RETUNE (items.json): the mundane/craftable armor ladder x1.5
   (round-half-up), ladder order preserved: bark 10->15, leather 15->23,
   hide 20->30, riot 30->45, swat 35->53, military 40->60; small pieces
   1-6 -> 2-9. Special/loot armor UNCHANGED (alien gear, worldroot, etc. —
   rare rewards, not the tier ladder). baseEffect strings naming a number
   updated to match. Staged wave-4 proof: fully-geared (armorOf 83) vs
   reunion, same RNG: 2 rounds / 22 damage-per-round vs 1 round / 67
   damage-per-round ungeared.
4. PANEL DRIVER + ANALYZER (scripts/xp-gear-panel-20261105.js,
   scripts/analyze-xp-gear-panel-20261105.js): capable policy, 120 days,
   8 seeds (STD16 first 8). Observer-side wrappers only (fieldFight,
   villagerHealCheck, noteCareRescue, _triageRun, creditDeed) — pure
   recording, same driver both arms.

## Proof tests (all green on the build)
- scripts/test-xp-synergy-20261105.js — 18/18 (table shape, creditSynergy
  grant + per-day cap + tele, teach_learned_skill, fight_with_ability).
- scripts/test-xp-coverage-20261105.js — 8/8 (care rescue, field_medicine,
  player-as-medic, triage).
- scripts/test-gear-protection-20261105.js — 8/8 (ladder, staged wave-4
  fight geared vs ungeared).
- scripts/test-healer-road-20261105.js — 17/17 (kit holds all 5 healer
  abilities, level-2 pool contains them, healing deeds cross the first
  threshold + sheet queues, recognition names Healer of the Shepherd of the
  Dead, caregiver deed unchanged).

## Deliberately NOT changed
- Win prices, deed gates, food costs, six ability slots, recognition
  thresholds (min 3), the caregiver deed (care_survived) or capstone, the
  tracks thresholds [18,48,96,192,384], per-day deed caps, the
  systemArrived gate, the skills-vs-abilities boundary (deeds grant XP;
  the level-up sheet grants the ability — nothing grants an ability
  directly). No new system, class, or path. No new tier. Special/loot
  armor untouched. Hunting/trade dead-deed root cause (actions never
  complete in the capable panel) NOT chased — reported as a measured gap.
- The coherence spine's "armor fades by waves 4-5 by design" is overridden
  for PROTECTION by Steve's 2026-11-05 ruling (tier-appropriate gear must
  let fighters survive); the damage fade (power moves to abilities) stands.

## After-arm (to be filled in after the panel runs)
- Panel: evidence/2026-11-05/xp-gear-panel-after/ (8 seeds, same driver).
- Analysis: evidence/2026-11-05/xp-gear-panel-analysis.md (before vs after).
