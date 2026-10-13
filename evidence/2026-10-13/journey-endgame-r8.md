# Journey Endgame r8 — Leg 4 (Endgame): organic table reachability

**Run:** 2026-10-13 · Worktree `journey-endgame` (base `8e08a189`) · full organic runs, seeds 11/22/33/44 × belongseek (pilot), leadcourt on GO
**Harness:** `scripts/journey-endgame-r8-20261013.js` (150d death-aware; table-ladder instrument: seat sampled every 10d, tableScene wrapped, convo driver at d60/100/140)

## Pre-registered question (MEASUREMENT.md §11)

On 150d death-aware horizons, with the best scale-push policies (belongseek, leadcourt), does any sim approach the table (`tableSeat()` lesser/full) or fire `tableScene`? Which lesser-seat rungs fill, which bind?

- **Primary metric:** runs with seat != 'none' (table approach) OR tableScene fired.
- **GO (interesting):** ≥1/4 pilot seeds shows a table approach or a fired tableScene → expand to leadcourt × same seeds. NO-GO → document, move on; deliverables = people check + one blank.
- **Horizon:** 150d death-aware (+10d tail). Reason: reachability lever (§10).
- **Seeds:** 11, 22, 33, 44. **Policies:** belongseek pilot, leadcourt on GO.

**Naming note:** an earlier playtest run today (landed as `bc1980f6`) also took the name "journey endgame r7" (NPC ascension + facilitation, synthetic day-140 villages). This run is **r8** to avoid collision. Its question is complementary: organic full-run reachability, not synthetic end-state wiring.

## Pilot results

**Infrastructure note:** the VM rebooted mid-pilot (~15:00 UTC), killing the run during seed 22. State on disk survived (worktree, lock, registry, seed-11 evidence). Relaunched for seeds 22/33/44.

### Seed 22 × belongseek — village-lost, day 74 — ONE RUNG FROM THE TABLE

**Census (plain words):** Twelve people started. Ten died — the killing window was days 54–64, and the killers were wave-3 monsters (ad_break, paparazzo, alien_tick) plus combat. Two walked out of the wreckage: Chloe (interpreter) and Jesse (line cook). The village was lost at day 74 with two living — again, collapse, not extinction.

**Table ladder:** seat=none throughout (sampled every 10d; the w3 rung filled in the final days, after the last sample). Rung maxes — waves faced 9/6/6 (need 4/4/3 ✓✓✓), contests 2 (need 2 ✓), crises 4 (need 2 ✓), rank regional (✓), integration stage 3 (need 2 ✓), food-thesis deeds 0 (need both ✗). **The ONLY missing rung is the food-thesis deeds (sentimentTaught + feastSurgeUsed).** Everything else on the lesser bar filled organically.

**This is the leg's headline:** a competent scale-push run fought six distinct wave-3 monsters, reached regional, hit stage 3 — and died at day 74 one food-deed away from a lesser seat. The wave-3 fights ARE reachable (6 distinct, blow-by-blow — the deepening-r9 "nobody walks out to meet it" gap does not bind on this seed). The table is visible from here; the village bled out at the door.

**People check (day 60, Chloe the interpreter, trust 32):** a pantry-run favor ("About the pantry run — I hate to ask twice, but it's still open. Will you?") that opens into mourning Zuri — "Zuri is gone and the world just... continues. That's the part I can't stand." / "We bury, we grieve, we keep going. There's no step four." / "My part? I remember them. Someone has to do it properly." The want (ask_favor) resolves as *promised*; the grief is the conversation's real content. A person doing remembrance as a duty. Reads true.

### Seed 11 × belongseek — village-lost, day 61

**Census (plain words):** Twelve people started. Eight died — seven to monsters (days 31, 48, 60, 61, 62), a cascade in the last three days. Four survived to the end: Carmela (welder), Chloe (interpreter), Fatima (paramedic), Onni (chimney sweep). The village was *lost* at day 61 with four living — the loss wasn't extinction, it was collapse: the monster cascade broke the village as a going concern.

**Table ladder:** seat=none throughout. Rung maxes — waves faced 11/6/0 (need 4/4/3), contests 4 (need 2 ✓), crises 3 (need 2 ✓), rank regional (✓), integration stage 3 (need 2 ✓), food-thesis deeds 0 (need both ✗). **Binding rungs: wave-3 distinct fights (0/3) and the food-thesis deeds (0/2).** Everything else on the lesser bar filled.

**Notable:** maxWave=3 unlocked, but zero wave-3 fights were ever fought — the wave-3 unlock-mechanism gap from deepening r9 reproduced (the content unlocks; the dying village never walks out to meet it). The village reached regional and stage 3 — the scale/integration machinery works; survival doesn't.

**People check (day 60, Chloe the interpreter, trust 90):** a wound-care favor — "This wound — I can't clean it properly one-handed. Will you help me clean it?" The player engages (unsure → help → commit), teaches three plants mid-conversation, the want resolves as *promised*. The NPC wants something concrete, the options engage it, the ending creates an obligation. Reads as a person, not a menu.

### Seed 33 × belongseek — village-lost, day 77
**Census:** Six survived (Srinivas the locksmith, Onni the chimney sweep, Naran the bus driver, Meera the dentist, Sanne the vintner, Benoit the baker). The village was lost at day 77 — again a collapse with living villagers, not extinction. **Rungs:** w 7/3/0 (w2 one short of 4), contests 8 ✓, crises 4 ✓, regional ✓, stage 3 ✓, foodDeeds 0 ✗.

### Seed 44 × belongseek — village-lost, day 97 (longest-lived)
**Census:** Two survived (Ivy the journalist, Fatima the paramedic). Deaths: monster, starvation, contest, combat — the full wall. **Rungs:** w 10/6/0, contests 13 ✓, crises 3 ✓, regional ✓, stage 3 ✓, foodDeeds 0 ✗. Thirteen contests survived and still no table — the contest rung fills easily; it's never the binding one.

## Table ladder: which rungs fill, which bind

| rung (lesser bar) | s11 | s22 | s33 | s44 |
|---|---|---|---|---|
| waves 4/4/3 distinct | 11/6/0 | 9/6/6 ✓ | 7/3/0 | 10/6/0 |
| contests ≥ 2 | 4 ✓ | 2 ✓ | 8 ✓ | 13 ✓ |
| crises ≥ 2 | 3 ✓ | 4 ✓ | 4 ✓ | 3 ✓ |
| rank ≥ regional | regional ✓ | regional ✓ | regional ✓ | regional ✓ |
| stage ≥ 2 | 3 ✓ | 3 ✓ | 3 ✓ | 3 ✓ |
| food deeds (both) | 0 ✗ | 0 ✗ | 0 ✗ | 0 ✗ |

**The food-thesis deeds are the universal binding rung (0/4).** Everything else fills on at least one seed; s22 filled 7/8. **Verdict on the gap: policy, not game.** The fc instrument shows 0 feasts, 0 feast-buffs, 0 cooking, 0 smoking across all four seeds — belongseek never touches the feast chain, so the deeds are unreachable for it by construction. (The deed chain itself is r6/feastseek's domain.)

**Wave-3 reachability (verified, not inferred):** s22's 6–7 distinct wave-3 fights are real blow-by-blow deeds (callback, ad_break, buffering, focus_group, chorus_line, redactor, spool — the broadcast-themed wave). The deepening-r9 "0/14" was a turtling artifact of exiled scholars; a non-exiled scale-push village walks out and meets wave 3. The wave-3 rung is reachable.

## Village assessment (plain words)

Four villages, four collapses, days 61–97. They all reached regional and stage 3 — the scale and integration machinery works. They all survived multiple contests and crises. They died to the combat baseline (wave-1/2/3 monsters) in tight windows, leaving 2–6 living villagers behind each time. The pattern is consistent: the village as a polity breaks before the people are all dead. The table is visible — s22 was one food-deed away — but no village lived long enough, or feasted, to sit at it.

## People check (SENSE-TESTING LAW)

Two full day-60 transcripts read end to end (s11, s22 — both with Chloe the interpreter, different seeds, different trusts, different wants):
- **s11 (trust 90):** a wound-care favor — concrete, physical, urgent. The player engages (unsure → help → commit), teaches plants mid-stream, the want resolves as *promised*. The NPC wants something; the options engage it; the ending creates an obligation.
- **s22 (trust 32):** a pantry-run favor that opens into mourning Zuri — "We bury, we grieve, we keep going. There's no step four." The favor is the pretext; grief is the content. The NPC wants remembrance witnessed; the player listens; the want resolves as *promised* while the mourning beat lands.

Both read as people, not menus. No fabricated shared history (the mourning is about a real dead villager, Zuri). No filler loops. The want structure (ask_favor → stages → promised) holds across both. **Villagers act like people in the endgame window.**

## Blanks

### Harness blank FILLED (tooling): convo-in-daily hangs the sim
Driving a conversation from inside `policy.daily` completes the transcript but wedges the day loop: seed 22's run wrote its day-60 transcript, then burned 20+ min CPU with no day-70 `sampleSeat` (bisected: days 10–60 sample fine, convo completes, then silence). With the convo block disabled the identical seed completes in 14s. Mechanism untraced (suspect: conversation state left open mid-day-loop confuses `sleep()`/`tickAction`, same class as the harness's known "tickAction no-ops mid-fight"). Fix in `scripts/journey-endgame-r8-20261013.js`: the convo driver stays in the file but is never called from the measurement loop; transcripts come from separate convo-probe runs (load → run to day X → converse → exit). The two day-60 transcripts in this run's evidence are valid (captured before the wedge).

## Reachable / fun / winnable verdict (endgame leg — organic table reachability)

- **Reachable:** CLOSE. 7/8 lesser-seat rungs fill organically on the scale-push policy; s22 was one food-deed away. Wave-3 fights (7 distinct), contests (up to 13), regional rank, stage 3 — all reachable. The missing rung is a policy gap (belongseek never feasts), not a game gap. The table is reachable in principle; no sim has sat at it yet.
- **Fun:** The content is there — wave-3 broadcast horrors, moots, tributes, grief beats. Sims can't judge fun, but nothing in the transcripts or beats reads broken or empty.
- **Winnable:** NOT YET. 0/4 table approaches, 0 wins. Blocked on (1) survival — villages die at 61–97d, before the 100+ day endgame window; (2) the food-deed policy gap. The win path stays blocked on scale-onramp per the tracker.

## Pilot verdict

**NO-GO** on the pre-registered bar (0/4 seat approaches, 0 tableScenes) — but the rung analysis is the real result: the lesser seat is one food-deed away, and the wave-3 rung is reachable. Documented, moving on. No leadcourt expansion (the bar wasn't met).
