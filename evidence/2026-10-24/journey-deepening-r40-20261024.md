# Journey leg: DEEPENING (days 40–80) R40 — "ARMOR THE VILLAGE" — 2026-10-24

## Pre-registration
hidden_files/evidence/2026-10-24/journey-deepening-r40-prereg.md (written
BEFORE any run). Base: master@be55cfc2c. Policy: competent (pinned).
Seeds: fresh 40001–40004. DAYCAP=100, death-aware stop.

## Leg question
Under natural competent play in the deepening window, does the village
ARMOR UP — villagers/scholar wearing crafted armor (bark/hide), the
palisade rising (haven tier 2) — and does any of it change wave 2–3
fight/raid outcomes?

## What ran
- Harness: `scripts/journey-deepening-r40-20261024.js` (built from the r16
  harness; instrument-only additions, zero game code): fieldFight wrap
  scanning rec.log for "'s gear absorbs N"; havenTierUp / havenRaidTick /
  raidPillage / wornDamage wraps; armorCensus() + waveCombatReadiness(4)
  snapshots at days 50/70/85/100 + seed end; palisade/raid text markers.
- Instrument proof: scripts/test-journey-deepening-r40-instruments-20261024.js
  (smoke seed 1 × DAYCAP=45 re-run; asserts the armor block is populated;
  scratch files cleaned up).
- Smoke (seed 1, DAYCAP=45) verified all instruments fire before the main run.
- Outputs: hidden_files/evidence/2026-10-24/journey-deepening-r40-seed4000[1-4].json
  + 12 transcripts (days 45/60/80).

## Verdicts on the binding metrics
- **AR1 armor-worn — GO on the letter (4/4), with a substance caveat (see
  metric review).** 8–10 villagers armored at every checkpoint on all seeds.
  BUT the "armor" is mundane clothing (flannel 2, denim 4, rain poncho 2 —
  below the wave-4 bar) + rare finds (menders_apron 10, shelter_cloak 20,
  investigators_coat 12, wardens_cloak 25, leather_jacket 15) + alien loot
  (worldroot_plate 60, adaptive_dermis 35, alien_carapace 40). Crafted-tier
  armor worn: exactly 2 pieces in 400 village-days — 1 bark_armor (40004)
  and 1 hide_armor (40003), both occupation-lottery/starting gear. **Nobody
  crafts armor.** Only the player can craft (villagers never call .craft();
  no armor-craft duty exists); the competent policy equips armor (53/2/40/89
  equips) but never crafts it.
- **AR2 armor-working — GO (4/4).** 168/101/130/177 field-fight absorb
  events + 9 tactical "'s gear absorbs" say lines. Armor absorbs constantly;
  the narration is honest ("Caleb's gear absorbs 6."). shawlAvoids=0 (no
  Phase Shawl in play).
- **AR3 palisade — GO (4/4).** Tier 2 at days 34/27/34/41, tier 3 at
  42/30/39/84 — all four villages walled BEFORE the deepening window
  (establishment-window achievement). Raids fired 8/8/8/10 times; the
  "stakes take their toll" announcement fires with the palisade.
  Raid-difference (report-only): pillage happened only WITH the palisade
  (40001 d59/60: 1800 kcal; 40004 d42–45: 3552 kcal over 4 nights) — via
  unmet-raider lingering/gorging, which the wall doesn't stop (by design:
  Steve 2026-10-16 "Endure it"). The wall's honest effects are the 25%
  maxHp shave (havenGrowth.js:539-542) + sleeper safety.
- **M4 people — NO-GO (1 senseless of 12).** 10/12 clean and meaningful;
  1 senseless (40002-d80 Lorenzo: the r36/r38 dlg:more fortune-cookie loop
  recurring — 8 generic home-aphorisms, want never surfaces,
  resolution=unestablished; 3rd named instance: Wei r36, June r38, Lorenzo
  r40); 1 borderline (40003 Anthony: third identical seek_taken promise
  cycle — real want, noticeable loop); 1 cross-villager verbatim (the stew-
  bowl line shared word-for-word by Lorenzo 40002-d60 and Oliver
  40004-d60 — the r17 blank recurring, social lane's).
- **M5 winnable — GO (4/4 alive at d100/101).** Scholars died 3/3/1/1 —
  mantle continuity works; villages die FIGHTING (villager deaths: 1–3/seed).
- **STAY-GREEN:** wave-3 faucet 2/4 (d78, d76; 40002/40003 never filled the
  4-kill ledger) — 50% but not two consecutive ≤50% (r35 3/4, r38 3/4); no
  escalation. Death-honesty mislabels=0.

## HEADLINE FINDING: the armor bar is tuned for a craft nobody performs
The wave-4 readiness demand is armored=3 at armorP≥10 — tuned EXACTLY to
bark_armor (protection 10; mats 3 bark + 2 vine; recipe guaranteed by
oldCuirassBeat at the first dawn home). The intended path is clearly
"craft bark armor." But in 400 village-days: zero crafts. The bar binds on
2/4 seeds (40001 until d85, 40002 throughout: armored 0–2 vs demand 3);
the other 2 fill it via rare clothing/alien loot. Veterans binds 4/4
(0 veterans everywhere — matches the flesh-out finding). Wave 4 unlocked
0/4. The "armor the village" economy drive the alignment synthesis named
is real and measurable — and its cheapest instrument is silent.

## Village assessments (plain words)
- **40001 (8/8, wave 3 d78):** the costly one. Scholars died THREE times
  (d76/d82/d94, all combat) — the mantle passed and passed again. Two
  wave-3 fights vs The Terms of Service at haven (d82, d94), both lost;
  signature mechanics (Amendment, Clause) fired honestly with codex learns.
  Palisade d34, granary d42. 19 deaths, all fighting. Raiders lingered and
  gorged twice (1800 kcal).
- **40002 (9/9, wave 2):** the quiet one. Three scholar deaths by d35, yet
  9/9 alive at d101 — the village absorbs the mantle chain. Wave 3 never
  unlocked (ledger never filled). 8 raids, 0 pillage — defenders met every
  raid. The armor bar never filled (armored 0–1; only mundane clothes).
- **40003 (10/10, wave 2):** the steady one. One scholar death (sickness
  d18). 10/10 alive — full roster. A villager wears lottery hide_armor.
  Armor bar FILLED (armored 3–4 via shelter_cloak + adaptive_dermis); only
  veterans binds. 11 deaths, the fewest.
- **40004 (8/8, wave 3 d76):** the bloody one. 22 deaths. A villager wears
  lottery bark_armor. One raid's lingerers gorged 4 straight nights
  (d42–45, 3552 kcal) — the "Endure it" design at full volume, with the
  palisade up the whole time. Wave-3 unlocked but 0 player w3 fights
  (engagedW3=4 off-camera).

## People check (SENSE-TESTING LAW — 12 transcripts read in full)
10 meaningful, 1 senseless, 1 borderline (details in M4 above). Standouts:
Elias the pharmacist on first memory ("First memories are half real and
half the story you needed"); Miguel sleeping in shifts ("Columbus, Ohio
never taught me that. The treeline did."); Hemi the grieving mortician
("fun is watching the fire and not being afraid. It's a downgrade and an
upgrade."); Anthony's taken-kin Diego by name (KIN.md alive). The stew-bowl
verbatim (Lorenzo/Oliver) and Lorenzo's cookie loop are the two recurring
blanks, both previously handed to the dialogue/social lanes.

## Blanks filled/documented
1. **Nobody crafts armor (documented, not fixed).** Root-caused, not a bug:
   (a) villagers have no craft verb at all (no .craft() calls in
   villager-agency/objectives; no armor-craft duty) — Steve's call whether
   villagers should craft; (b) the competent policy equips but never crafts
   armor — harness gap. Named next: COMPETENT_CRAFT_ARMOR policy variant
   (env-gated, r37 pattern) measuring whether player crafting fills the
   armor bar and moves wave-4 unlocks.
2. **Fortune-cookie loop recurs (Lorenzo 40004-d80)** — 3rd named instance
   (Wei r36, June r38). Dialogue lane's; documented with the exact 8-line
   cycle.
3. **Cross-villager verbatim recurs (stew bowl)** — the r17 blank, still
   open; social lane's.
4. **Palisade timing (design note for Steve):** tier 2 lands at days 27–41
   on competent play — the deepening leg's "armor" beat is won in the
   establishment window. Is 14k kcal + 350 wood + 60 stone too easy? (r31's
   counterpoint: without it, 13 villagers died in one night raid.)

## Telemetry deviation check
vs deepening.json: 4 LOUD (w3fights 8→2, engaged.w3 18→6, fightsTotal
82→25, fightsByWave.3 8→2). Investigated same-run: EXPLAINED — the baseline
is provenance-unknown (r37: "82 matches no campaign"); current numbers are
in line with r38/r39 (r39: 26 player fights; r38: 2 w3fights); the faucet
mechanism verified working (unlocks fire d76/d78, fights happen,
engagements count). Small-n variance, not a bug. Baseline NOT rolled.

## Metric review (§14)
- **AR1's letter was too weak** — armorOf>0 is trivially met by clothing
  (flannel_shirt has armor 2). The metric measured "wearing clothes," not
  "armoring up." Proposed AR1': ≥1 villager wearing protection ≥10
  (crafted-tier: bark/hide or equivalent) on ≥2/4 seeds. Under AR1' this
  run scores 2/4 (40003 hide_armor, 40004 bark_armor — both lottery, none
  crafted). The substance is reported above regardless of the letter.
- **AR2/AR3 honest and kept.** M4's miss IS the finding (recurring blank).
- Wave-3 faucet watch continues (2/4 — one more ≤50% run escalates).

## Reachable / fun / winnable (deepening leg)
- **Reachable:** YES — palisade 4/4 (early), armor absorbing 500+ hits,
  wave 3 on 2/4, raids reactive on 4/4, the readiness gate's armor bar
  visibly binding.
- **Fun:** the armor story is loot-driven — a worldroot_plate (60) on a
  villager, adaptive_dermis, alien_carapace. The palisade announcements
  land. The 4-night gorge on 40004 is the designed pressure at full volume.
- **Winnable:** 4/4 survive to d100/101; wave 4 gated as designed (armor +
  veterans bars).
