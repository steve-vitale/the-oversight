# Journey leg: DEEPENING (days 40–80) R14 — counterwire lands + crisis tiers go honest — 2026-10-16

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14)
- **Question:** on the current tip (master@69c512be), (a) do r13's DEEPENING gains hold (M1–M7'), and (b) do the newly landed in-window systems behave sensibly — do villagers PERFORM the newly-wired w3 tricks in real field fights, does trick-aware morale fire, is raid-crisis tiering honest, is kill attribution correct, does unknown flesh reach the pantry, do mourning/healer beats read human?
- **Binding metrics:** M1 player wave-3 fights ≥2/8 (r13: 4/8). M2 seasoned link ≥1/8 (r13: 5/8). M3 'observed'-via discovery ≥2/8 (r13: 8/8). M4 knowledge compounding >0 on ≥6/8 (r13: 8/8). M5 ≥10 transcripts sense-read, 0 senseless. M6 alive at day 100 ≥4/8 (r13: 7/8), 0 mislabels. M7' win-side inert (0 table|deedgate rows, seat 'none', no Watchers staged; viewership reported). M8 'show' lately beat ≥1/8 (r13: 8/8). C1 ≥1 NEW w3 trick performed in a real field fight on ≥2/8. C2 0 flee-mid-trick on all seeds. C3 ≥1 raid aid-crisis at wave ≥2 (report). C4 ≥1 waveKillLog by=<vid> on ≥2/8; ≥1 via='companion' on ≥1/8. C5 unknown flesh on ≥1/8; granularity guardrail report.
- **Interesting-finding bar:** a villager performing a learned w3 trick; a raid crisis at honest tier; a hold-the-line beat; unknown flesh tried; multi-name mourning.
- **Seeds:** fresh 8701–8708 (pilot 8701–8704 met the bar: new-trick performances on 2/4, hold-line beats, honest crisis tiers → expanded). Policy: competent. DAYCAP=100, death-aware stop. W3TRACE=1. SEATDRIVE unset (= driver ON).
- **Canon read:** CANON.md, MONSTER-WAVES.md (wave law, gating), KNOWLEDGE.md (channels, teaching). No new canon invented.

## What ran
- Harness: `scripts/journey-deepening-r14-20261016.js` (r13 clone + pre-reg + new instruments: Game.fieldFight wrapper recording trickLog/actionKinds/hold-line beats/flee-mid-trick per field fight; Game.raiseAidCrisis wrapper recording tiers; waveKillLog attribution stats; pantry unknown-flesh + biggest-piece scan; meat/healer/mourning/hold-line text markers; multi-name mourning scan).
- Harness bugs fixed mid-run (instrument only, zero game code): (1) wrapper referenced policy `ctx` before init → module-level arrays; (2) meat marker was the at-body line, not the arrival line ('is back with strange meat'); (3) transcript filename template still said r13 (99 transcripts landed misnamed; template fixed for future runs; JSON convoFiles references match the on-disk names).
- Same-seed A/B (r13-harness vs r14-harness on 8701–8704, same tip): fightsTotal 34=34 — the new wrappers are behavior-neutral.
- Base: master@69c512be. All work in worktree journey-deepening. 1 test-harness fix landed (below); 0 game-code changes.
- Outputs: `evidence/2026-10-16/journey-deepening-r14-competent-870[1-8].json`, 99 transcripts (day45/60/80 + showprobes), pilot + expansion logs.

## Verdicts on the binding metrics
- **M1 meetings — GO (4/8).** Player wave-3 fights on 8702 (1), 8703 (4), 8704 (1), 8708 (1). (r13: 4/8.)
- **M2 seasoning — GO (6/8).** Seasoned links (age ≥30d, trust ≥40) on 8702/8704/8705/8706/8707/8708 (trust 40–61).
- **M3 counter parity — GO (8/8).** 'observed'-via discoveries on every seed (6–15/seed). The non-lethal path remains the norm.
- **M4 knowledge — GO (8/8).** Compounding markers on all seeds.
- **M5 people — GO.** 10 transcripts sense-read (below), 0 senseless flags. Wrinkles documented, none senseless.
- **M6 winnable — GO (7/8 survived; 0 mislabels).** 8701 village-lost d34 (sickness ×3, starvation ×5 — death-aware stop correct). 8703/8707 ended d86/d94 with end=survived (loop-day cap; scholar calendar lags — same as r13's 8604).
- **M7' win-side inert — GO.** seat 'none', watchers 0, 0 table|deedgate rows on all 8. Viewership 19–35 (reported only).
- **M8 show-memory — GO (7/8).** 'show' lately beats on every surviving seed (1–10 each). 8701 died d34 before any contest.
- **C1 counterwire reachability — GO (3/8).** NEW w3 tricks PERFORMED in real field fights: 8702 Ursula vs Callback ('farewell', held the line, then fled at 22% HP); 8703 Catalina/Grace vs Redactor ('wait:redactor-quiet' ×3, monster fled), Chen/Grace/Mateo vs Terms of Service ('examine' ×2, monster fled); 8708 Quinn vs Spool ('wait:spool-record' ×3), Juan/Ava vs Callback ('farewell'), Ava vs Gavel ('confess'). Knowledge→action is live.
- **C2 trick-aware morale — NO-GO by the letter (9 flee-mid-trick events on 4 seeds), DESIGN-HONEST.** Every single event is at minHpFrac ≤ 0.25 (0.15–0.25, one at exactly 0.25): the design holds the line only while HP > 25% (fieldFights.js:1429); below that normal morale applies. 8702's Ursula even fired the hold-line beat first, then fled at 22%. The system behaves exactly as specified — the metric as pre-registered was over-strict (did not encode the 25% exception). See metric review.
- **C3 crisis-tier honesty — GO (observed).** Raid aid-crises now raise at honest waves: wave-3 raids on 8702 (d93 The Callback, d100 Spool), 8703 (d49 Terms of Service, d57, d74 The Redactor, d81), 8704 (d100 The Callback); wave-2 raids on 6/8 seeds. Pre-fix (f6cecf3c) every one of these raised tier 1. The crisistier fix is live and legible.
- **C4 kill attribution — GO.** waveKillLog by=<vid> non-null on 8/8 seeds (100% of sampled entries); via='companion' on 8703 (Greta vs sanjun/The Mountain Lord, d8), 8706 (×2), 8707 (×2). The tricktag fix attributes companion killing blows correctly.
- **C5 unknown flesh — NO-GO (0/8), NO OPPORTUNITY on this substrate.** Focused diagnostic (2 seeds × 100d): mapmemHaulAt fired 0–1× per run; monsterFoodSafe marked 0–1 monster types (nearly all monster meat IS unrevealed — the opportunity exists in the world). The binding constraint is the HAUL objective gate (villager-objectives.js: `pantry < 5000 || hunger > 50`): competent villages run 35–99k pantries and never need to haul carcasses (documented rule: no_haul_without_need). The 76a40da5 unit proof stands; the sim substrate can't reach it. See metric review. NOT a game bug — do not "fix" by hauling into full pantries.
- **Granularity guardrail — EXPLAINED, not a violation.** Biggest pantry pieces are 'Tribute grain from Emberhold' at 3000–4000 kcal (hierarchy.js direct push). The 0152a2ce choke covers haul + donation deposits (all 3 callers use the 500 cap by construction); tribute/route-tariff/granary/raid-spoils push directly and are out of that commit's scope. Flagged for the food-economy workstream (below), not fixed here.

## Village assessments (plain words)
- **8701 (12→3, village-lost d34):** the collapse. Sickness took Benoit and Chloe, starvation took five, the night took Yuki. Ruth begging — "My hands shake when I try to work" — with nothing in the pantry. The death-aware stop behaved. A bad start, honestly ended.
- **8702 (12→11, survived, wave 3):** the show village. 9 show beats; Mara (army medic, trust 90) trading teaching both ways; Nancy's Taken-grief for Otto and the player's promise to ask the System about the pods. Ursula performed the Callback's farewell, held the line, and fled at 22% HP — the morale system with teeth.
- **8703 (14→9, survived, wave 3):** the trick village. 17 wave-3 field fights, 6 with performed tricks — the Redactor starved out by villagers going quiet, the Terms of Service examined into dismissal. Costly: the Heckler, a contest, and three combats took five villagers. Benoit the baker leads at 91.
- **8704 (11→7, survived, wave 3):** the costly climb. Four dead — an unclosed wound, the night, the Moderator, combat. Devon at trust 100. Mai's Arabic-only scene: the language barrier played straight, a promise without words.
- **8705 (12→11, survived, wave 3):** the quiet climb. One death (dehydration). Wave 3 unlocked but no wave-3 fight found anyone in the window — the leg breathes.
- **8706 (12→9, survived, wave 2):** the wave-2 holdout. Wave 3 never unlocked (kills short). Jada held the line vs a belltoad with 'shout' and fled at exactly 25% HP — the boundary case, behaving.
- **8707 (10→8, survived, wave 3):** the witness. 10 show beats; 13 wave-3 field fights but the village hadn't learned the tricks yet (0 performances) — knowledge lagging opportunity, honestly. Ryan's resume opener quoting the real Iron Pantry line.
- **8708 (15→10, survived, wave 3):** the grinder. 25 wave-3 field fights, 7 with tricks — Spool recorded out, the Callback farewelled twice, the Gavel confessed to. Five flee-mid-trick events, all at ≤22% HP. Leo leads at 90.

## People check (SENSE-TESTING LAW — 10 full transcripts read, 0 senseless)
Standouts: Nancy's Taken promise ("Stupid, small, beautiful plans... Even asking is more than the silence."); Mara's Blood Tithe line ("up there, on the screens, in front of everyone. I'm still turning it over."); Juan's raid memory ("I stood down tick at the treeline — it ran. Don't call it brave. Call it awake.") + NPC-initiated governance talk ("Can we talk?"); Ruth's hunger ("My hands shake when I try to work."); Elif's wind-down ("I've got things to do. People to avoid. You know."); Omar's dry close ("Do try to stay alive. The paperwork otherwise is murder."); Ryan's resume quoting the real show line; the teaching exchanges both ways (Dustboar signs for Burdock).
Wrinkles (documented, not senseless): (1) menu-return filler ("That's what I heard, anyway. What's up?") still quotable as resume memory (r13's wrinkle, still present); (2) "You want to know about that? Okay." preamble repeats 3–4× per conversation; (3) cross-villager template repetition on promise-accept lines ("I won't forget who fed me when it mattered." — r10's wrinkle persists); (4) transcript files misnamed r13 (template fixed).

## Blanks filled (1) — with RED→GREEN proof
**test-table-trial-fire harness stale head -80** (found via mandated regression run): check.js --quick showed 3 failures in `scripts/test-table-trial-fire-20261012.js` (`Game.tableTrialResume is not a function`). Root cause: today's shelter commit (4c8f7cf5) added src/js/shelter.js to index.html, pushing table-feared.js from #80 to #81 — the test's `head -80` loader silently dropped it. Fix: load the FULL index.html script list per the AGENTS.md harness standard (test-only change, zero game code). Re-ran: 18/18 pass (was: harness error + 4 FAILs). Pre-existing relative to this run (I changed no game code); fixed because the run found it.

## Telemetry deviation check
`telemetry-check.js` vs deepening.json: **LOUD: fightsTotal swung 60% (45 → 72). INVESTIGATED — EXPLAINED, not a bug.**
- Same-seed cross-harness A/B (r13-harness vs r14-harness, 8701–8704, same tip): 34 = 34 — the new wrappers are behavior-neutral.
- Same-seed cross-tip A/B (r13-harness on 8601–8604, b246df87 vs 69c512be): 33 → 36 (+9%, noise) — no game-code change in the window moves aggregate player encounter rates.
- The swing is seed-set composition: r13's set held three quiet seeds (8605/8606/8607, 2 fights each); r14's set has none (min 4). Other baselines held (w3fights 8→7, engaged.w3 21→19, fightsByWave.3 8→7 — all noise).
- Baseline NOT rolled: the deviation is seed noise, not an instrument or game change; rolling would chase noise. Metric review notes the sum-over-8-seeds fragility.

## Metric review (§14)
- **C2's bar was wrong, not the game.** All 9 flee-mid-trick events sit at/below the design's 25% HP hold-line threshold; the hold-line beat fired where it should. Proposed revision for the next run: C2 = "0 flee-mid-trick events with minHpFrac > 0.25."
- **C5 is untestable on the competent substrate.** The metric needs a hungry village (pantry < 5000) to form HAUL objectives. Proposed: run C5 against a scarcity policy, or accept the 76a40da5 unit proof (87 assertions) as the reachability evidence. No game change — hauling into a full pantry would violate no_haul_without_need.
- **fightsTotal baseline is seed-fragile.** Sum-over-8-seeds swings ±60% on seed composition. Consider per-seed median or a fixed seed panel for this metric.
- **Tribute-grain slabs (3000–4000 kcal) bypass the 0152a2ce deposit choke** — flagged for the food-economy workstream, not this leg. If Steve's "all external deposits" reading of 0152a2ce was meant to include tribute/tariff/granary/spoils, that's their call.

## Reachable / fun / winnable (deepening leg)
- **Reachable:** YES — wave 3 on 6/8 seeds, new-trick performances on 3/8, honest raid tiers on 7/8, companion attribution on 3/8, show beats on 7/8, seasoned links on 6/8.
- **Fun:** villagers now fight wave-3 monsters with the tricks they learned — going quiet to starve the Redactor, examining the Terms of Service into dismissal, saying the goodbye to the Callback. The televised world and the fire are the same world, and the village talks about both.
- **Winnable:** 7/8 survive to the window's end; wave 4 not reached on competent play (readiness-gated now, out of window). The climb past is priced in kills and standing, as designed.
