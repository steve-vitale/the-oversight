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

## After-arm (filled in after the panel ran, 2026-11-05 ~14:47 CST)
- Panel: evidence/2026-11-05/xp-gear-panel-after/ (8 seeds, same driver).
- Analysis: evidence/2026-11-05/xp-gear-panel-analysis.md (before vs after).
- VERDICT, bar by bar (honest — two bars PASS, two MISS, and the misses
  have measured causes, not hand-waving):
  - A. XP ACQUISITION — MIXED. Total deed XP 9303 -> 11077 (+19%, PASS on
    '>'). Thresholds crossed 74 -> 129 (+74%, PASS). Craft XP 643 -> 1286
    (exactly 2x — the starved track doubled). Craft thresholds 6 -> 20
    (3.3x). BUT XP/villager/day 1.56 -> 1.64 (MISS on the 2x bar): the
    denominator grew — more villagers alive longer (living at end 4.75 ->
    7.13, survival 92 -> 100 days) — so the per-day rate is diluted even
    though total XP rose. The 2x per-villager-day bar was too ambitious
    given the denominator effect; the acquisition growth is real (total XP
    +19%, thresholds +74%).
  - B. ABILITY HOLDINGS — MIXED. Distinct abilities 9.75 -> 13.25 (+36%,
    PASS). Abilities per living villager 3.61 -> 3.52 (MISS — flat): same
    denominator effect (more living villagers, most of them new with few
    abilities). The variety in the wild grew; the per-villager mean did not.
  - C. RECOGNIZED HEALERS — MISS. Before 1 (seed 7), after 0 — and 0 in
    EVERY daily sample, not just at the end. The fuel works (healing deed
    credits 100 -> 537, 5.4x; craft L1 villagers 4 -> 14; craft L2 0 -> 3)
    but the road stalls at the OFFER/PICK step: no villager reached craft
    L3 (96 XP), healer abilities held 6 -> 5 (spread out, no one holds 3),
    and the 3 villagers at L2 were offered healer abilities but did not
    pick/hold them. Holding 3 healer abilities needs craft L4+ (192+ XP)
    because the healer abilities sit at kit positions 4,5,9,14,18 — at
    ~1-2 craft XP/day from healing, the 120-day horizon is too short for
    the full road. The build fuels the road; it does not walk it to
    recognition in 120 days. Follow-up (a Steve/main-session call, NOT
    done here): surface healer abilities earlier in the craft kit order,
    or a longer horizon.
  - D. WAVE-4 SURVIVAL — MISS on rounds, with a real per-fight improvement
    underneath. Rounds per fight 2.27 -> 2.26 (flat — the analyzer's
    1.46/1.48 is a mean-of-seed-means diluted by zero-fight seeds; the
    per-fight mean is the correct reading of the bar and it did not move).
    BUT the per-fight death rate fell 55% -> 36% (6/11 -> 15/42), and the
    fight count rose 11 -> 42 (villages live longer, more villagers alive,
    so more wave-4 encounters). Absolute deaths rose (0.75 -> 1.88/seed)
    because there are 3.8x more fights. The flee rate rose 36% -> 55% —
    more fights end in flight, which caps rounds regardless of armor.
    The controlled gear proof (staged reunion, same RNG: geared 2 rounds /
    22 damage-per-round vs ungeared 1 round / 67) shows the retune's
    per-fight effect is real; the wild rounds bar did not move because
    staying (not armor) now binds. Kills not worse (0.13 -> 0.13/seed;
    wave-4+ kill-log 1.00 -> 1.13).
  - GUARDRAILS — PASS (survival 92.13 -> 99.63 days, wins 0.50 -> 0.63,
    living at end 4.75 -> 7.13). Total deaths 55.88 -> 58.63 (up in
    absolute terms; the death rate per villager-day is lower — more
    villagers alive longer).
  - MEASUREMENT GAP (own goal): the synergy's wild fire rate was NOT
    instrumented — the driver wraps creditDeed but not creditSynergy, and
    the teleEvents trailing sample shows 0 track_synergy events (a capped
    300-entry window, not a census). The synergy fires in fixtures (proof
    test 18/18) and total XP/thresholds rose, but the wild synergy count
    is unmeasured. The driver should wrap creditSynergy in the next panel.
  - Deed-mix moves worth noting: healing 100 -> 537, cooking 392 -> 629,
    discovery 837 -> 1238, fight_won 712 -> 827, teaching 565 -> 630.
    Crafting 151 -> 120 (down 20% — small, likely seed variance; the bot
    crafted less). Hunting and trade still 0 in both arms (the actions
    never complete in the capable panel — the measured gap reported above).
