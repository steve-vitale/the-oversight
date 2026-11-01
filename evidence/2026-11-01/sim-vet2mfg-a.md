# sim-vet2mfg-a — Wave-4 kill manufacture: the funnel behind veterans-2

- Run: `fleshout-loop-a-20261101T1016Z`, axis scale-onramp (converging, NOT converged).
- Arm: DIAG ONLY. Zero `src/js` changes, no gate threshold moved, no existing policy file edited. New instrument files only.
- Verdict: **DIAG-GO.** Pilot passed its preregistered bar on all five items; confirm completed to 16 seeds; funnel fully classified with zero UNCLASSIFIED wave-4 encounters.
- Stack (named exactly; numbers are NEVER compared across stacks/bases): substrate `scripts/policies/tableseat-nowait.js` (`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`); recorders reused UNMODIFIED: `scripts/policies/fullseat-diag.js` (`FULLSEAT=1`), `scripts/policies/wavegate-diag.js` (`WAVEGATE=1`), `scripts/policies/vet2-diag.js` (`VET2=1`); new instrument: `scripts/policies/vet2mfg-diag.js` (`VET2MFG=1`) + `scripts/vet2mfg-a-sweep.js`, `scripts/vet2mfg-split.js`, `scripts/vet2mfg-a-analyze.js`, `scripts/vet2mfg-det-compare.js`, `scripts/test-vet2mfg-a.js`.
- Band: pilot fresh seeds 95301–95308, confirm fresh seeds 95311–95318 (16 total). Freshness verified before sims against corpus filenames and dated evidence `.md` files (zero hits for 9530x/9531x; clear of forbidden bands 73641–73648, 73671–73678, the 871xx confirm band, 78201–78208, 91401–91408).
- Horizon: `DAYS=180`, death-aware (runDays ends dead villages early). 180d justified by the substrate's own survival distribution (0615Z median 164d), never a fixed 200d.
- Corpus: `evidence/2026-11-01/perseed-vet2mfg-a/` (16 files, `s95301.json`–`s95318.json` minus the 95309/95310 gap — the band is 95301–95308 + 95311–95318 by prereg).
- Analysis: `evidence/2026-11-01/vet2mfg-a-analysis.json`.
- Preregistration: `evidence/2026-11-01/sim-vet2mfg-a-prereg.md` (commit `a2bccd5954cf3637c821cb6b4dfd709d615532e0`), plus Amendment 1 (commit `11074aa39b0fe99063dc8d91eac6b44fb3d8788e`, see below).
- Panel (MEASUREMENT.md §15): **NOT APPLICABLE** for this single-base DIAG census — declared, not fabricated. No panel, no before/after comparison; this arm classifies one stack's funnel.

## Preregistration history (read before trusting the numbers)

- The first pilot (95301–95308) ran with an instrument gap: 29 wave-4 events on seed 95304 classified UNCLASSIFIED. Root cause was proven on scratch probes, not guessed: `startCombat` on a titan without a complete muster is HARD-REFUSED in `src/js/titans.js` (lines 929–983, "no_solo_titans") — it returns null, creates no fight, throws nothing. The herald's monster-turn audience is refused aloud every tick while it paces. Following the vet2-a precedent (discard, don't patch), the first pilot corpus was DELETED, the prereg was amended (Amendment 1: tbStarts record refusal from the RETURN VALUE; refused starts are classified `refused` events, never fights, never UNCLASSIFIED), the instrument was fixed, and the band was re-piloted fresh. No verdict was declared on the discarded pilot, and its numbers are not cited here as judged data.
- The re-pilot reproduced the discarded pilot's per-seed summaries exactly (a good sign, not a claim — the judged numbers below are the re-pilot's own).
- Mid-run interruptions, both recovered without data loss: the VM rebooted during the re-pilot after 4 seeds (the remaining 4 were appended to the same file; all 8 lines parse and the corpus splits clean); the container EPERM write flap hit the confirm split (the splitter's resilient writer rode it out; all 8 confirm files wrote full-size and verified).

## The funnel, pooled (16 seeds, post-unlock unless noted)

| stage | count |
|---|---|
| seeds | 16 |
| wave 4 unlocked | 13 |
| wave-4 monster world-spawned (post-unlock) | 12 seeds, 84 spawns, 0 pre-unlock spawns |
| wave-4 monster fought (post-unlock) | 12 seeds, 96 fights |
| wave-4 kill made (kill-capture, both writers) | 6 seeds, 7 kills |
| seeds with ≥ 2 LIVING veterans of wave 4 (vet5 ≥ 2, any daily snapshot) | **0** |
| seeds won | 5 (3 by day 100) |
| refused wave-4 audiences (titan gate, all herald) | 36 |
| pending-instantiated player fights (no world spawn) | 52 of 53 player fights |
| orphan kills (kill joining to no fight) | 0 |
| UNCLASSIFIED wave-4 encounters | **0** |
| complete funnels | 16/16 |

Funnel rates: unlock 13/16 (81%); spawned given unlocked 12/13 (92%); fought given spawned 12/12 (100%); killed-outcome fights 6/96 (6.25%); kill-capture entries 7 per 96 fights; non-kill fight outcomes 90/96 (93.75%). First spawn follows unlock promptly on every spawned seed (0–25 days, median 4).

Tick opportunities (post-unlock, villagerMonsterTick pre-pass): 2,130 ticks, 7,806 wave-4 monster-ticks, 81 open opportunities vs **609 shelter-blocked** vs 5 rest-blocked; scholar-tile 322; roll-skipped 24.

Fights by channel: player 53, wild 34, raid 4, other-field 5, patrol 0, aid 0.
Fights by outcome: lost 55, fled 27, evade 5, monsterFled 3, killed 6.
Kills by via: player 6, companion 1.

## Per-seed funnel

unlock / firstSpawn / spawnsPost / fightsPost / killsPost / maxVet5 / endVet5 / window(days) / endDay / won / leak / unclass

| seed | unlock | spawn | spawns | fights | kills | maxVet5 | endVet5 | window | end | won | leak | unclass |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 95301 | 91 | 95 | 9 | 8 | 0 | 0 | 0 | 79 | 170 | 0 | fought-no-kill | 0 |
| 95302 | never | never | 0 | 0 | 0 | 0 | 0 | — | 181 | 0 | no-unlock | 0 |
| 95303 | 134 | 135 | 10 | 9 | 0 | 0 | 0 | 46 | 180 | 0 | fought-no-kill | 0 |
| 95304 | 119 | 123 | 8 | 8 | 0 | 0 | 0 | 62 | 181 | 0 | fought-no-kill | 0 |
| 95305 | 66 | 68 | 4 | 13 | 0 | 0 | 0 | 18 | 84 | 0 | fought-no-kill | 0 |
| 95306 | 162 | 165 | 3 | 0 | 0 | 0 | 0 | 19 | 181 | 0 | spawned-never-fought | 0 |
| 95307 | 66 | 66 | 8 | 22 | 0 | 0 | 0 | 59 | 125 | 0 | fought-no-kill | 0 |
| 95308 | 84 | never | 0 | 1 | 1 | 1 | 1 | 15 | 99 | 1 | one-kill-only | 0 |
| 95311 | 79 | 80 | 3 | 5 | 1 | 1 | 1 | 17 | 96 | 1 | one-kill-only | 0 |
| 95312 | 75 | 100 | 8 | 8 | 1 | 0 | 0 | 97 | 172 | 0 | one-kill-only | 0 |
| 95313 | 136 | 146 | 8 | 3 | 1 | 1 | 0 | 45 | 181 | 0 | one-kill-only | 0 |
| 95314 | never | never | 0 | 0 | 0 | 0 | 0 | — | 140 | 1 | no-unlock | 0 |
| 95315 | 59 | 64 | 10 | 8 | 1 | 1 | 1 | 67 | 126 | 1 | one-kill-only | 0 |
| 95316 | 83 | 96 | 1 | 1 | 0 | 0 | 0 | 13 | 96 | 1 | fought-no-kill | 0 |
| 95317 | never | never | 0 | 0 | 0 | 0 | 0 | — | 15 | 0 | no-unlock | 0 |
| 95318 | 74 | 96 | 12 | 10 | 2 | 1 | 0 | 107 | 181 | 0 | kills-made | 0 |

Leak counts: fought-no-kill 6, no-unlock 3, spawned-never-fought 1, one-kill-only 5, kills-made 1.
Windows on unlocked seeds: 13–107 days, median 59 days. The funnel had time.

## Dominant leak (mechanism statement)

The funnel leaks TWICE, and the second leak is the one that actually bars wave 5.

**Leak 1 — fights almost never kill.** 90 of 96 wave-4 fights (93.75%) end without a kill. The dominant single outcome is fought-and-LOST (55), not fled (27, about half as many), not monster-fled (3), not evaded (5). The player carries the fight count (53 of 96 fights) and still almost never kills: 6 killed-outcome fights in 96.

**Leak 2 — kills never accumulate two LIVING veterans on one seed.** The 7 kills land on 6 seeds, but never two different living killers on the same seed — so no daily snapshot on any seed ever shows vet5 ≥ 2. The kill detail is the whole story:

| seed | kill day | monster | killer | via | src | veteran record |
|---|---|---|---|---|---|---|
| 95308 | 91 | strike | scholar | player | wavekill | vet5 days 91–99 (run won day 99) |
| 95311 | 96 | strike | scholar (nina_petrova) | player | wavekill | vet5 day 96 ONLY — the kill lands on win day |
| 95312 | 165 | eater | scholar (ines_duarte) | player | **pyrrhic** | vet5 NEVER — a pyrrhic kill banks no living veteran (the killer dies in the fight) |
| 95313 | 172 | eulogy | scholar (aroha_ngata) | player | wavekill | vet5 days 172–173 only, then gone |
| 95315 | 99 | influencer | companion (nora_wilson) | companion | wavekill | vet5 from day 100, 27 days (the one durable veteran) |
| 95318 | 139 + 155 | suburb ×2 | scholar (rafael_torres) | player | wavekill | vet5 days 139–155 (17 days) — BOTH kills by the SAME person, so one veteran slot, not two; gone by end |

Note the accounting: 6 killed-outcome fights + 1 pyrrhic kill attached to a lost fight = 7 kill-capture entries. The scholar makes 6 of the 7 kills. Veterans-2 needs TWO DIFFERENT living killers on the same seed; the observed pattern gives at most one killer per seed, and that killer then dies (95313, 95318), or the run ends on kill day (95311), or the kill itself is pyrrhic (95312).

## Falsified alternatives (each tested, not assumed)

1. **Never spawned — FALSIFIED.** 84 post-unlock spawns on 12 of 13 unlocked seeds; first spawn within 0–25 days of unlock (median 4). The pool arrives; it is not absent.
2. **Shelter-filtered as the terminal leak — FALSIFIED as terminal, confirmed as upstream filter.** Shelter blocks 609 tick-opportunities against 81 open (7.5:1), and the patrol (0) and aid (0) channels are empty across 16 seeds — shelter genuinely thins the villager-encounter stream. But 96 fights still happen, and 90 end without kills. Removing shelter would deliver more fights into the same 93.75% non-kill outcome; it would not manufacture veterans.
3. **Win-censored as dominant — FALSIFIED as dominant, real on specific seeds.** 5/16 seeds won, but 11/16 ran 125–181 days with a median 59-day post-unlock window and still never reached vet5 ≥ 2. Win-censoring bites exactly twice: 95311's kill lands on win day (vet5 for one snapshot), and 95316's window is 13 days. It does not explain the zero across the 11 unwon seeds.
4. **Fled as dominant — FALSIFIED.** Fled 27 vs lost 55 (about 1:2). The village doesn't mostly run from wave 4; it mostly loses to wave 4.
5. **Never fought — FALSIFIED.** 12/12 spawned seeds fought. The only spawned-never-fought seed is 95306 (3 spawns, 0 fights, 19-day window, 14 shelter-blocked ticks, 9 scholar-tile ticks with no engagement).

## No-unlock seeds: three different shapes, not one cause

- 95302: survived 181 days, never unlocked — standing/readiness never aligned (the long-lived never-opener).
- 95314: won on day 140 (over-other) without ever unlocking — won before wave 4 opened.
- 95317: village lost on day 15 — died before the question could arise.

## Titan-gate refusal finding (the instrument fix, now a funnel fact)

- 36 refused wave-4 audiences across 16 seeds, ALL herald: 29 on 95304 (days 161–165), 7 on 95312. Refused starts are NOT fights: the titan gate in `src/js/titans.js` ("no_solo_titans") returns null without creating a fight when the muster is incomplete. The herald paces onto the player's tile and is refused, tick after tick.
- The gate is not absolute across channels: on 95304 the herald DOES fight once, via the wild router on day 180, ending in villager flight (vFlee). So the herald's 95304 story is 29 refused audiences + 1 wild fight fled. On 95312 the herald never fights (7 refusals, 0 fights).
- The refusal IS spoken in-game — `Game.say('⛔ ' + title + ' does not notice you the way prey notices a hunter. It notices you the way weather notices a field. You cannot face this alone — sound the call, muster ' + minAllies + ' allied blades (you have ' + have + '). This is not courage. This is arithmetic.')` — but it leaves NO footprint in this arm's sysSay capture even though the line contains "muster", a capture keyword, and the capture demonstrably works (RATINGS lines are captured). Filed as a recorder gap: the refusal line is not routed through the captured sysSay path. The game speaks; the instrument doesn't hear it. A future arm that wants refusal narration must capture `Game.say` directly, not the sysSay wrapper.
- Context, not a wave-4 claim: the refusal shape generalizes. Seed 95312 shows 147 refused starts for the wave-5 nielsen (wave 5 never unlocked there) — when wave 5's funnel is measured, expect the same gate shape. The non-herald single refusals (moderator, murkcap, bright_idea, living_wire) are recorded but their causes are unclassified by this instrument (it records refusal, not reason, for non-titan types).

## Pending-instantiated player channel (read "never spawned" carefully)

52 of 53 player-channel fights have `worldWave: null` — they are instantiated by species id (wanderer/pending), not lifted from a world tile, so they bypass the world-spawn stage entirely. Every player-channel kill (6, including the pyrrhic) came from a pending-instantiated fight, and the single kill on a never-world-spawned seed (95308, unlock 84, firstSpawn never) is this shape. "Never spawned" in this report means never WORLD-spawned; the player channel can fight and kill without a world spawn. The one lifted player fight in the corpus is on 95315 and ended without a kill.

## Village assessment (plain words)

Your village does reach wave 4 — the door opens on 13 of 16 villages. Wave-4 monsters do show up, usually within a few days. Most days the village hides behind the barricaded hall door while they pace outside, and the few villagers who could be met in the open mostly aren't met at all. When someone does stand and fight a wave-4 monster — usually you, the scholar — they usually lose, and about a third of the time they run. Once in a long while someone kills one. But then the killer dies, or the story ends that same day, before anyone else can do the same. So the village never has two living people who have each killed a wave-4 monster, and the road to wave 5 never opens. The blocker is not that wave 4 never arrives. It's that wave-4 fights are almost never won, and the rare wins never add up to two survivors.

## Reachability verdict for wave-5 content via the veteran bar

**NOT REACHABLE on this stack in 16 seeds.** Distance: the closest seed (95318) made 2 kills but on one person — it is not one kill away from vet5-2, it is one SURVIVING SECOND KILLER away, an outcome shape that never occurred on any seed. The next-closest seeds made exactly 1 kill each. Nothing observed is a near-miss for two living veterans; the gap is structural (fight lethality + killer survival + kill concentration on one person), not a matter of one more seed. A future arm chasing vet5-2 should measure killer survival after a first kill and second-killer emergence, not just kill counts — and should expect the titan gate to shape the wave-5 audience the same way it shapes herald's.

## Sense-test (narration where the funnel touches it)

- **awayNews wild-fight lines read well and do not lie.** Samples from the high-shelter seeds (95318, 95312) name villagers, monsters, rounds, and consequences: "Siya killed the Hummice alone — 1 round, 24 taken. Word travels fast. The village cheers." "Ruby stood down the Night Court and kept walking — 4 rounds, bloodied but breathing. It's still out there, somewhere." The wave-4 wild narration carries real stakes: "The Reunion mauled Chloe (-54 health) over 1 round. They're lucky to be breathing. — staying out of sight for the rest of the day — too hurt to meet it again" (95318, day 173). The village hears about wave-4 danger in terms that match the funnel outcome (lost/fled, hurt, hiding). No robotic counting, no fabricated shared history in these lines.
- **Muster/shelter say capture catches the TV show, not the verb.** Every muster/shelter keyword hit in sayLines is the "Extreme Burrow Makeover" show joke ("The aliens redecorate a shelter overnight. It is beautiful. It is unusable."), not narration of the village actually sheltering. The sheltering behavior itself is measured (shelteredCount/shelteredList in daily rows, 609 blocked ticks) but has no say-line footprint in this capture. That is a coverage note, not a behavior claim — the villages DO shelter; they just don't narrate it through the captured channel.
- **Hold/release beats are legible.** On 95318 the wavegate rows show standing already past the wave-4 bar (raw 102 ≥ t4 100) while readiness holds (rd4 ready=false, days 70–73), then a war point arrives day 74 (warPts 1, raw 127) and readiness flips true the same day the unlock lands. The gate holds, then releases, for visible reasons — not a silent flip.
- **The titan refusal line reads well (in code) but is unheard (in capture).** See the refusal finding above. The line itself ("This is not courage. This is arithmetic.") is characterful and legible; its absence from capture is an instrument routing gap, not a narration failure.

## Blanks filled or documented

- Filled: full per-seed funnel (unlock, spawn, channel, outcome, kill, vet5) on 16 seeds; dominant leak + 5 falsified alternatives; titan-gate refusal mechanism + count; pending-instantiated channel; pyrrhic-kill banking rule (banks zero living veterans); kill-concentration-on-scholar pattern; three no-unlock shapes.
- Documented, not filled (for later arms, not this one): the cause of non-titan refused starts (single refusals for moderator/murkcap/bright_idea/living_wire; the 147 nielsen refusals are the wave-5 gate shape, not explained here beyond the shared startCombat-null pattern); the single lifted player fight on 95315; why 95306's village never engages despite 9 scholar-tile ticks (shelter + short window is the measured part; the decision itself is uninstrumented).
- Resolution limit (see metric review): vet5 is read from DAILY snapshots, so a veteran who kills and dies between snapshots would be missed. The pyrrhic case is not such a miss (the killer dies in the fight itself), but a non-pyrrhic kill + same-day death would be.

## Metric review (mandatory)

- **Pre-registration bound the run.** The GO bar was judged exactly as written: 8 complete pilot funnels, zero UNCLASSIFIED, recorder-neutrality on 2 seeds, determinism on 1 seed (delivered on 2), a mechanism statement with falsified alternatives, proof test green. No re-scoring, no bar moved after seeing results. The pilot band rule (≥ 5/8 won by day 100 → discard) was checked: 1/8 in the pilot, 3/16 overall — band kept.
- **Amendment 1 is the one judgment call, and it was handled by discard, not patch.** The amendment changed what counts as a fight (refused starts excluded) BEFORE any verdict, and the corpus it affected was deleted and re-piloted rather than edited. If the amendment had instead been applied to judged data in place, the zero-UNCLASSIFIED result would be suspect; because the data was regenerated under the fixed instrument and reproduces the earlier shape exactly, the zero stands.
- **Doubts filed, not resolved by re-scoring.** (a) Daily vet5 snapshots can miss intraday veterans (see resolution limit above); a future arm that needs exact veteran accounting should evaluate living-veteran status at fight time, not daily. (b) Refusal is classified from the startCombat return value; for herald the titan-gate mechanism is proven, but for non-titan types the instrument records refusal without reason — the 36 refusedW4 are all herald and fully explained, but the broader refusal counts (e.g. 156 total refused starts on 95312) must not be cited as titan-gate events. (c) "Never spawned" is world-spawn only by construction (see pending-instantiated section); a future funnel that wants spawn-to-fight joins for the player channel needs a different join key than world instance identity. (d) The OFF det leg carries end fields only — the sweep's event capture is part of the mfg recorder, so OFF JSONs have empty event arrays by design; neutrality is therefore claimed on end fields exactly as preregistered, not on event streams.
- **Revisions for the NEXT run, not this one.** None to the funnel metrics themselves. If a follow-up arm measures vet5-2 pursuit directly, it should pre-register: fight-time veteran evaluation (fixing the daily-snapshot limit), `Game.say` capture (fixing the refusal-narration gap), and a second-killer-emergence stage in the funnel (killer survival after first kill, distinct-killer counting).

## Proof and legs (evidence, not assertion)

- Proof test `scripts/test-vet2mfg-a.js`: **62 passed, 0 failed, 0 skipped** on the 16-seed corpus (54 synthetic cases + 8 corpus legs re-deriving verdict gates: non-empty band, funnel records present, pooled totals reconcile, zero recorder errors, unclassified pooled = sum of per-seed, complete seeds = zero-unclassified seeds). Previously 54 passed + 1 skipped before the corpus existed.
- Recorder-neutrality det leg: ON vs OFF end fields identical on 2 seeds — 95304 (survived/181d/global, maxWave 4) and 95308 (over-other/99d/global, won) — all 8 compared fields same on both (`DET-COMPARE … -> PASS`).
- Determinism leg: ON re-runs byte-identical to judged corpus on BOTH 95304 and 95308 (`cmp` clean), stronger than the one-seed bar.
- Recorder/capture errors: 0 on all 16 judged seeds (wgErrs/vetErrs/mfgErrs/capErrs all 0 in every done line).
- Instrument commits: prereg `a2bccd5954cf3637c821cb6b4dfd709d615532e0`; instrument + Amendment 1 `11074aa39b0fe99063dc8d91eac6b44fb3d8788e`. Base anchor at prereg time `7c8745741`; every judged JSON carries its own `anchorCommit`.
- Readiness: merged locally, pending ship — NOT pushed, NOT version-bumped, NOT live-verified (the coordinator merges; the ship loop owns pushes).

## Standing question for a later arm (not a claim of this one)

Whether a 40+-day shelter from one early wave-4 sighting is intended tuning (carried from the 0615Z closeout) is a Steve design question, not a bug claim, and is not chased here. The shelter counts in this report (609 blocked vs 81 open) are the measurement such a question would start from.
