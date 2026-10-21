# journey-deepening r27 — the villager-death taxonomy verdict (2026-10-21)

## Pre-register (§14 BINDING)
- **Leg question:** Does villager-vs-villager combat DEATH exist in the deepening window (days 40–100), and does it read as desperate/traumatic per the design rule — or was the standing claim from r21/r26 ("v-v combat the dominant death cause, 6–9/run") a cause-only MISREAD of villager monster-kills?
- **Interesting-finding bar:** either (a) TRUE v-vs-v deaths found and assessed vs "desperate and traumatic", or (b) the standing 6–9/run claim formally corrected as a misread with the kind-aware instrument — either closes the r26 open item.
- **D1 census (BINDING):** 4 fresh seeds (9911–9914), competent policy, DAYCAP=100, death-aware stop (+10d tail max). Kind-aware census via scripts/lib/death-census.js over the deepening window (day≥40). Report TRUE villagerVsVillager, betrayalAmbush, playerKilledVillager, villagerDiedToMonster, plus the r21Misread count. Instrument: harness wraps Game.registerDeath (single call site, corpses.js:148) to capture killerId — telemetry 'death' rows don't carry it. Wrap parity: teleDeathRows == regDeathRows on all 4 seeds (17/25/18/18).
- **D2 sense (conditional, BINDING):** TRUE v-vs-v ≥ 1 → sense-read full event beats around each; zero true v-vs-v → instead sense-read ≥2 villagerDiedToMonster events for legibility.
- **M1 winnable:** ≥3/4 villages alive at end.
- **M2 people (report-only):** ≥4 full villager transcripts sense-read (SENSE-TESTING LAW), 0 senseless expected.
- Report-only extras: wave-3 unlock/fights/hold-line per seed; regional links; plain-words census per seed.

## Results — VERDICT: (b) the standing claim was a misread. FORMAL CORRECTION.
- **TRUE villagerVsVillager: 0 on all 4 seeds** (full run AND day≥40 window). **betrayalAmbush: 0. playerKilledVillager: 0. villagerDiedToMonster in window: 0.**
- The r21Misread count (cause-only 'villager combat') on the SAME corpora: full-run 7/8/6/12, window 2/1/4/8 — i.e. **6–9/run, exactly the standing claim's magnitude**. **Every single one of the 33 'villager combat' records has kind='monster'.** They are all villagers KILLING monsters (field fights/patrols), zero villager-vs-villager.
- The r26 run note's "Deaths mostly villager-vs-villager combat (9) and monster combat (7)" was read off the telemetry death rows without kind. The instrument's regression fixture reproduces the trap on demand (r21Misread >> true count on mixed corpora).
- What person deaths DO exist in the deepening window: dehydration, contest, the night, the expedition, combat (scholar-TB fights). No person-on-person killing anywhere in 4×100 days.
- **M1: 4/4 villages alive at end → GO.**
- Interesting-finding bar met via (b): the r26 open item is closed. Zero src/js changes — the bug was in the measurement, not the game. Honest outcome.

## D2 sense reads (the real combat deaths — what the player actually sees)
1. **Hannah, seed 9911, day 18, cause 'monster' (Hushpuppy mauled her, -53hp over 2 rounds):** "◈ CRISIS — THE FIRST GRAVE. Hannah is dead. The village digs its first grave, and everyone understands at once: this place can kill you. It just did." / "Nobody's talking much. The fire feels smaller tonight." / SYSTEM: "Oh. Oh no. Was that supposed to happen? The audience is crying. I did not know they could do that." / "📖 The entry for Hannah is finished. 2 deeds recorded. No more pages." — Verdict: narrated, grieved, mechanically attributed (the missed-fights recap names the Hushpuppy mauling). Legible as a real fight with weight. GO.
2. **Carmen Zimmerman, seed 9913, day 49, cause 'combat' (THE SCHOLAR died mid-TB-fight vs Choir Toad — "You go down."):** full mantle succession fired — "The Codex turns a page: Carmen Zimmerman, 49 days. The mantle passes to Regina Kaplan." / "You wake up somebody else. Regina Kaplan, 36 — a crossing guard." / "'Carmen's gone.' Florencia looks at you for a long moment. 'You're not Carmen.' No heat in it. Just fact. You'll have to earn this face." / "The village's quarrel was with Carmen — and Carmen is dead. The sentence doesn't cross the grave." / At the grave, villagers testify for the successor. "Emberhold watches to see if Haven holds without its dead — and presses the tribute down." Verdict: desperate and traumatic, exactly the design rule — death has social, political, and mechanical consequences (treaty shake, tribute re-test, docket emptied but the village remembers). GO.

## Census in plain words
- **9911 (day 81, survived, wave 3 @ d56, regional):** 9 alive — Juliana the welder (stoic, current scholar), Roisin the ER nurse, Ruby the lifeguard, Nina the mechanic, Emma the vet, Fatima the paramedic, Nora the tailor, David the plumber, Sylwia the carpenter. High trust (85–90 for the core), steady moods, 25–33 plants known each. Dead: Addison Adeyemi (scholar, combat d9), Hannah (monster d18), Jada (dehydration d68 — scholar), Chloe (contest d73 — scholar), Pedro (the night d74 — scholar). The scholar mantle passed 4 times; the village held. 1 link proposed+linked, 1 accord answered. Pantry 79.6k kcal.
- **9912 (day 101, survived, wave 3 @ d32, regional):** 8 alive — Logan the line cook, Noah the tattoo artist, Yuki the librarian, Diana the paramedic, Wanjiru the wild-food forager, Lena the ER nurse, Zoltan the mushroom grower, Omar the piano tuner. 37–46 plants known — the most knowledgeable village. Dead: Cheyenne (monster d17), Simone (sickness d30), Prasit (starvation d39), Esmeralda (the expedition d96). 9 wave-3 trick fights, 7 hold-line beats. Pantry 82.9k.
- **9913 (day 101, survived, wave 2, regional):** 9 alive — Regina the crossing guard (current scholar, prickly), Florencia the arborist (Ukrainian-only), Mariam the programmer, Jorge the rancher, Ella the ESL teacher, Devon the programmer, Nathan the HVAC tech, Marcus the electrician, Miguel the dockworker. Trust 88–90 across the board — the tightest village. Dead: Angelo (monster d20), Vikram (combat d25 — scholar), Carmen (combat d49 — scholar). **Never unlocked wave 3** (engaged.w3=0): the day25+4-w2-ledger-points gate held — the village didn't earn 4 wave-2 kills. Report-only; the gate is Steve's design. Pantry 42.7k (leanest).
- **9914 (day 94, survived, wave 3 @ d59, regional):** 10 alive — Minh the fishing guide, Brianna the vet, Austin the beekeeper, Cecile the zookeeper, Sigrun the night guard, Yara the interpreter, Hannah the chef, Boris the blacksmith, Stan the exterminator, Wanjiru the forager. Dead: Molly (combat d5), Lakshmi (starvation d29). 14 wave-3 trick fights, 9 hold-line beats. Pantry 109k (richest).
- Missing everywhere: no village is short of anything structural — knowledge, pantry, and links all move. The leanest (9913) is the one that didn't unlock wave 3.

## People check (M2: 5 transcripts sense-read, 0 senseless)
- **Chloe, 9911 d45 (want: curious, fromSeed):** "Are you going to stay? With us. For real." — a real ask, engaged honestly; teaches Bulldozer behavior, Birch Sap, map landmarks; her backstory ("Columbus, Ohio is a direction, not a plan") is hers, not fabricated shared history. Want resolves engaged. Sensible.
- **Logan, 9912 d60 (want: curious, fromSeed):** a want that never establishes — "People are smiling. I forgot what that looked like." → "That's... pretty much all of it, honestly." → polite close "Don't be a stranger." Thin but coherent; not every conversation lands. Sensible.
- **Florencia, 9913 d60 + d80 (Ukrainian-only, no shared language):** both beats are non-verbal and faithful — mimed walk-to-cache invitation at d60; a guessed-at greeting at d80. The barrier persists consistently across two months; different content each time, no recycle. Sensible.
- **Minh, 9914 d80 (want: seek_taken):** "Have you ever asked? About the taken — about Liam?" The player commits to asking the System about the pods; want resolves PROMISED — an owed ending, exactly the bar (resolve/plant/owe). Ties to KIN canon. Sensible.
- No templates, no fabricated history, no filler loops found.

## Blanks filled / documented
1. **The r26 open item (v-v combat dominance) — FILLED:** formally corrected as a kind-aware misread; see Results. The correction lives in the instrument (scripts/lib/death-census.js, master 110a17926) and the r21Misread regression fixture.
2. **Betrayal-ambush path observed:** 0 'ambush' kills in 4 seeds. The code path exists (betrayal.js simNpcAmbush, 20% kill outcome) but didn't fire; rare-by-design is plausible, not a defect — documented, not filled. (TRUE v-v 'combat' cell also remains unobserved — the convention is reserved, no sightings through r27.)
3. No src/js fix was warranted. The r27 harness (scripts/journey-deepening-r27-20261021.js) retires the r26 constructed ration probe; the r26 food-carry finding stands untouched.

## Reachable / fun / winnable
- **Reachable:** wave-3 content reached on 3/4 seeds with real fights, trick performances, and hold-line beats; regional links + accords on 4/4; contests fire (a contest death on 9911). The one non-unlock (9913) is the gate doing its job.
- **Fun:** the death beats read as the game intends — grief, succession, political consequence. Scholar death doesn't end the run; the village carries on, and the mantle transfer is the run's most dramatic beat. Conversations are people-shaped.
- **Winnable:** 4/4 villages alive at end, pantries 42–109k, wave-3 kills banked. M1 GO.

## Metric review (§14)
- The D1 metric was satisfiable and satisfied. No mid-run re-scores; the D2 conditional's zero branch was followed exactly as written (sense-read ≥2 real combat deaths instead).
- Metric-review note for the NEXT run: the 'deaths' path for telemetry-check isn't in telemetry-baselines/deepening.json (baseline predates it) — every run LOUDs on it as "new appearance". Either add the metric to the baseline (coordinator's call, NOT rolled here) or accept the standing LOUD line with the canned verdict below.
- The deathReg/registerDeath-wrap instrument had 0 errors and perfect parity with telemetry rows — recommend as the standard deaths source going forward.

## Telemetry (vs hidden_files/telemetry-baselines/deepening.json)
- **LOUD: deaths newly appeared: baseline 0 → current 78 (n=4 files). VERDICT: not a real deviation** — the baseline predates the deaths metric (covers only w3fights/engaged.w3/fightsTotal/fightsByWave.3); per-seed death counts (17/25/18/18) match r26's observed volume. Baseline roll needs coordinator approval — NOT rolled.
- All baseline-covered metrics quiet: w3fights sum 7 vs 8, engaged.w3 and fightsTotal within range. No other LOUD lines.
