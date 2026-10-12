# Long-run sim — lever 1 r8: the village watches back (2026-10-12)

## Canon read
- `docs/CANON.md` (monster encounters are fought not rolled; contests played not RNG; "If you don't know, it doesn't show").
- `docs/MONSTER-WAVES.md` (wave law, escalation, counters; wave-3+ deliberately counter-less — signature mechanics instead; villager kills score the ledger like the player's).
- `docs/BALANCING.md` (2026-10-12: the 43–44% wave-1 loss target RETIRED by Steve — "fair, not free" is the canon; no loss-rate number replaces it).
- **No standalone trauma/combat-feel canon doc exists** for witness reactions beyond the code comment (Steve 2026-10-05). Saying so instead of inventing.

## Baseline (12 seeds × 200d, competent policy, current master)
Probe: `scripts/probe-combat-r8-20261012.js` — wraps startCombat/fieldFight/faceFeastDraw/contestResolveGroup/tbEnd/registerDeath/hurtVillager/combatWitnessReact/discoverMonsterCounter; attributes every person-death to its fight (live ctx → deferred hurtVillager → delayed wound death within 1 day); captures fight transcripts.

**Survival:** median 69–72d, max 200d, 11/12 village-lost, 1 survived. (Two runs: before median 72, after median 69 — RNG-stream shift, see lever section.)

**Player deaths (54, after-run):**
| cause | n | share |
|---|---|---|
| combat, wild w1 | 16 | 30% |
| combat, wild w2 | 10 | 19% |
| combat, wild w3 | 10 | 19% |
| starvation | 9 | 17% |
| combat, feast-draw w1 | 2 | 4% |
| contest (+delayed) | 4 | 7% |
| combat, wild delayed (wounds) | 2 | 4% |
Combat total: 45/54 = **83%**. Wave split of combat deaths: w1 41%, w2 27%, w3 24%.

**Villager deaths (60):**
| cause | n | share |
|---|---|---|
| field fight w1 | 24 (21 'monster' + 3 named) | 40% |
| field fight w2 | 6 | 10% |
| field fight w3 | 6 | 10% |
| wounds ("wouldn't close" + wound_fever) | 8 | 13% |
| starvation | 5 | 8% |
| sickness/disease | 6 | 10% |
| thirst | 2 | 3% |
| contest | 2 | 3% |
Field-combat total: 38/60 = **63%** (+13% wounds = 76% combat-adjacent).

**Field-fight outcomes (642 fights):** vFlee 43%, vKill 20%, mFlee 21%, evade 7%, vDie **6.1%**, alreadyDead 3%. Villagers flee more than they die — the 6.1% rate is sane; deaths accumulate because villagers fight constantly.

**Wave reach:** 8/12 unlock w3, 3/12 w2, 1/12 w1. Wave kills: w1 153, w2 55, w3 1. **Wave 4/5: 0 unlocks, 0 kills.** Wave-3 player fights: 21 fights → 11 deaths (52%); the village killed 1–2 wave-3 monsters all round. (Policy confound: wave 3+ is deliberately counter-less — signature mechanics the policy doesn't play. Not a tuning call on this evidence.)

**Armor:** player armored 52% of snapshots; bark_armor worn (P=10); villagers armored across P 4–42 (bark P=10 ×14 snaps among others). Armor curve proven through real tbDamage: `scripts/test-armor-curve-r8-20261012.js` **13/13** — r=P/(P+20) exact, hit-1 clamp holds (P=100 vs 3-chip still lands 1), pierce hook works (P=40 + pierce 0.25 → effP=30). MEASUREMENT CORRECTION: an early probe revision read `v.varmor` (a tbfight-only field) and reported "villagers never armored" — wrong. Field fights compute armor live via `equipment.armorOf`; corrected measurement shows villagers genuinely gear up.

**Counters:** 124 discoveries, 30 distinct, via taught 101 / trick 23. Reachable and used.

**combatWitnessReact (the r7 blank):** 251 calls / 12 runs; bystander pool non-empty only 16× (6.4%). The content is wired (5 call sites) and fires — the audience check is what starves it.

## The lever: companions watch the fight (src/js/game.js, [needs-eyes])
**Investigation verdict on the r7 blank:** it IS wired, it fires, the fiction is coherent (wilderness fights shouldn't have an audience — r7's stance stands). But one gap is real: **villagers fighting alongside you were invisible to the hook.** A companion who harries the heron beside you for 4 rounds and says nothing when it drops — or when you're bleeding — is a mannequin. Deaths already get grief/gossip/first-grave/partyDeathNotify; the *fight moments* had no participant beat.

**The change (19 lines, game.js `combatWitnessReact`):** for `kill` and `hurt` moments only, the witness pool now also includes alive villager fighters from the live tbfight. `start`/`flee` stay bystander-only (a fighter doesn't "watch" their own fight start; flee judgments come from safety). No new lines — the existing pools already fit participants ("winces. 'You're bleeding!'", "whoops. 'That's how it's done!'", "stares at the body, then at you").

**Design call for overrule:** participants join the pool for kill/hurt only. If Steve wants the watch-beat to stay purely bystander, revert is one hunk.

## Before / after (identical seeds 11,22,33,44,55,66,77,88,99,111,222,333 × 200d)
| metric | before (pristine game.js) | after | delta |
|---|---|---|---|
| witness lines said | 16 | 29 | **1.8×** |
| moments with a participant present | — | 13 | new signal |
| player deaths (combat) | 57 (40) | 54 (43) | flat (noise) |
| villager deaths (combat) | 56 (39) | 60 (39) | flat |
| median survival | 72d | 69d | flat (noise) |

The change is narration-only: death causes and survival don't move. (Note: trajectories diverge slightly because the added pool changes a shared Math.random draw — the RNG stream shifts after the first participant-witness moment. Shares are stable across both runs.)

## Sense-testing (SENSE-TESTING LAW — transcripts read)
- **The new beat lands.** Seed 11, White Noise heron, Lena fighting alongside: "Lena winces. 'You're bleeding!'" the exact round the heron hits for 22; at the kill, "Lena stares at the body, then at you." Coherent — she fought it too.
- **The old beat still lands.** Seed 77, haven-breach Highbeam Deer: "Enzo watches, jaw tight." at start, "Enzo winces. 'You're bleeding!'" mid-fight. Bystander lines fire when there's a real audience.
- **Fights are real blow-by-blow.** Highbeam Deer: beam telegraph honored ("The light touches the ground where you were standing. It has not found you yet." — the player moved), counter learned mid-fight ("MOVE, don't stare"), ally Madison "sees how this ends — and runs while running still works." Death explained: "🔥 the beam SITS on you! (60) / You go down."
- **Feast-draw fight:** FEASTED ×2.03 vs a wave-2 tick — one strike, 140. The feast weapon vs the drawn scavenger; aftermath lines human ("You came back bloody. Nobody asks. Someone saves you the good seat by the fire.").
- **Wave-3 deaths are fast and legible.** Redactor: telegraph ("POINTING… Redaction lands next round."), armor absorbs 13, 30 lands, down. No mystery, no robbery — the player didn't move.
- **Field fights are off-screen but logged:** rec.log round-by-round ("R3: … hits … for 12 (64 left)"), gear absorption lines, outcome + vTaken/mDealt. Honest records.

## Villagers act like people (transcript-verified)
Lena harries, winces, stares. Madison assesses and flees. Enzo watches jaw-tight, then winces. The dying get "💔 X is dead" via partyDeathNotify, grief dialogue via villageEvent('death'), first-grave crisis, gossip with distortion. Away-news tells the player of off-screen deaths ("died while you were gone — a wound that wouldn't close"). Nothing robotic flagged this round.

## Village assessment (plain words)
The village is a place where everything wants to kill you and mostly gets the chance: 83% of scholar-deaths are combat, 63% of villager-deaths are field fights, and wave 1 does most of the killing — animal shock, exactly as canon demands. Villagers don't die like lemmings: they flee 43% of field fights and die in 6%. They armor up (bark at P=10 among real kits), they learn counters (124 discoveries, 23 by doing the trick mid-fight), they grieve. What they didn't do — until this round — was *react in the moment* when the person next to them dropped the beast or started bleeding. Now Lena winces. The blank filled is small and human: the village watches back.

Who died and why: scholars to teeth and beams (w1 41% of combat deaths — the deer, the heron, the hushwolf), villagers to the same teeth in the field (w1 67% of their combat deaths) plus the slow bleed of wounds (13%). Wave 3 is a wall the village can see but not climb: 21 scholar-fights, 11 deaths, 1–2 kills. Starvation holds at 8–17% — the food economy isn't what's killing them; the monsters are.

## Reachability verdict
- Waves 1–3: REACHED (8/12 unlock w3). Waves 4–5: NOT REACHED (0 unlocks — scale-gated, the known on-ramp wall, not this lever's territory).
- Counters: REACHABLE (30 distinct, trick-discovery live).
- combatWitnessReact: REACHABLE — was 6.4% audience, now 1.8× the lines via participants.
- Armor curve: VERIFIED against the documented model (13/13 through real tbDamage).
- Arc/national/table/win: not measured this round (combat-focused probe); r7 measured 12×Arc III, 0 table.

## Blanks: filled / documented
**FILLED:**
1. combatWitnessReact participant pool (kill/hurt) — proof `scripts/test-witness-participants-r8-20261012.js` **6/6** (RED 4/6 on pristine: kill/hurt silent with only a participant present; GREEN 6/6 with the change; start/flee correctly stay silent; dead participants say nothing).
2. Armor-curve verification vs the AGENTS.md model — `scripts/test-armor-curve-r8-20261012.js` **13/13** (bark P=10, hide P=20, carapace P=40, P=100 clamp, pierce hook, villager varmor block).
3. Death-attribution probe — `scripts/probe-combat-r8-20261012.js`: full situation×wave attribution incl. deferred (hurtVillager) and delayed (wound) deaths, fight transcripts, armor snapshots via `equipment.armorOf`.

**DOCUMENTED (not this lever):**
1. Wave-3 wall: 52% scholar death rate in wave-3 fights, ~1 village wave-3 kill per 12 runs. Policy confound (no signature-counterplay) — not a tuning call on this evidence. A godhood-build or counterplay-capable policy would be the honest next measurement.
2. r7's "village can feel it on you" (trauma invisible to villagers) — still open, still needs-eyes territory.
3. Wound deaths 13% of villager deaths — healerRounds exists (+15/day to the worst-hurt); whether it's enough is a lever-7-adjacent question, noted not answered.

## Proof & regressions
- `scripts/test-witness-participants-r8-20261012.js`: **6/6** (RED-verified 4/6 on pristine game.js via stash).
- `scripts/test-armor-curve-r8-20261012.js`: **13/13** through real tbDamage.
- Before/after sweep: `sweep-out/combat-r8-witness-before.json` vs `sweep-out/combat-r8-witness-after.json` (identical seeds).
- Regressions: test-combat-r7-20261009 32/32; test-break-combat6 19/19 (2 pre-existing fails identical on pristine); test-combat-break8 25/28 (3 pre-existing fails identical on pristine). Ontology: 85/85 validated.
- `[needs-eyes]` in commit message: the witness change alters fight narration — a feel change Steve may want to see/hear.

## Commit
`src/js/game.js` (witness participants) + probe + 2 proof tests + 4 sweep JSONs + this evidence. Merged locally, pending ship. No version bump, no push (ship loop owns deploys).
