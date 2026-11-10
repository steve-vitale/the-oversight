# sim-wave5face-b — wave-5 facing instrument on the vetfinish band: do released villages meet wave 5, and do veterans kill it?

- Arm: sim-wave5face-b (Loop B, DIAG arm, run fleshout-loop-b-20261110T0122Z; finished + adopted by run fleshout-loop-b-20261110T0330Z after the 0122Z coordinator died mid-closeout)
- Branch: sim-wave5face-b; base anchor `74debf969` (worktree `~/workspace/worktrees/sim-wave5face-b`); master at branch start was the same SHA.
- Prereg: evidence/2026-11-09/sim-wave5face-b-prereg.md (committed `0d85eb710` BEFORE any judged computation in this run; Correction 2, the TB join-rule fix, recorded in the prereg after the judged leg, before this evidence was written — see "Dirty-diff judgment" below).
- Instruments: `scripts/wave5face-instrument-20261109.js` (facing layer on the finishersize stack), `scripts/wave5face-driver-20261109.js`, `scripts/wave5face-analyze-20261109.js`, proof `scripts/test-wave5face-b.js` (**69 passed, 0 failed** — 63/63 at commit `2d7bcf514`, +6 from the Correction 2 fixture E3).
- Verdict: **DIAG-GO — all three preregged bars hold.** The instrument classifies every release, every spawn, and the simultaneity datum on all 8 seeds. The substantive answer is stark: released villages DO meet wave 5 (25 spawns, 75 meetings on the band) and living veterans DO meet it (16 veteran meetings) — and the village kills it **0 times** while wave 5 kills **31 scholars** (25 in turn-based fights, 6 in the field). The chain binds at wave-5 facing/killing, past the veterans bar. Zero src/js changes in this arm (instrument + driver + analyzer + proof + evidence + corpus only). No gate / price / deed / readyDemand / win-price change.

## The headline (plain words)

Four of the eight villages earned the release — they stood strong enough that the game opened the wave-5 door — and held it for 29 to 55 days each. The fifth wave walked through that door: 25 of the Producers spawned, and villagers met them 75 times. Not once did anyone kill one. The best fighters the villages had — people who had already killed wave-4 beasts — met wave 5 sixteen times and lost eleven of those meetings outright, fled the other five, and killed nothing. The beasts hit for 20–50 damage a round through armor while a villager's strike takes 13–23 off a beast with 1000–1600 health. A kill would take fifty to eighty good rounds; the fighter dies in one to three. One village ground a single Cancellation down to 8 health across three fights in one day — and the scholar died all three times. The door opens, the monsters come in, and the village cannot dent them. That is where the win dies on this band.

## Dirty-diff judgment (the adoption step — read this first)

The dead 0122Z worker left the worktree dirty after the judged sweep: the prereg (+18 lines), the proof test (+23), the analyzer (+62/−17), plus the untracked 16-file corpus. I read every hunk and re-ran both analyzers before judging.

- **The TB join correction is legitimate and does NOT change the deciding bars.** The preregged join (traceDay ≤ removedDay, no same-day repeat) was wrong about the engine: `startCombat` removes the world monster when the FIRST turn-based fight starts (`src/js/game.js:35424`, "it's in the fight now, not wandering"), so later fights against the same beast are re-engagements with no new spawn — observed to +3 days on this band, with four scholars fighting one Cancellation on a single day (99641 d100). The corrected rule (same mid, spawnDay ≤ traceDay, traceDay − removedDay ≤ 3, same-day exclusion removed, re-engagements flagged `re-engage`, two+ candidates stay `ambiguous`) is recorded in the prereg as Correction 2 and in the analyzer header, with a new proof fixture (E3, 6 checks). **Verified by running the committed (old) analyzer against the new one on the identical corpus:** unmatched TB traces 15 → 0, ambiguous 0 → 7, and every spawn outcome, meeting outcome, wall number, and DIAG-GO bar is **identical** under both versions. The correction moves attribution only (15 traces from 'unmatched' to matched/ambiguous); no meeting and no outcome changes. The 7 ambiguous traces are all 99641 Cancellation (two live candidates, s2+s3) — honestly unassigned, never silently assigned.
- **The births filter is a counting bug fix, not a bar change.** The snapshot records wanderer births of ALL waves; the reconciliation previously counted all 133 births against wave-5-only casts. It now counts wave-5 births only (13). The reconciled substance is unchanged (3 births matched a spawn under both versions); only the reported births total changes (133 → 13).
- **The corpus-reader exclusion is correct.** The off (neutrality) legs carry `instrumentOff: true` and empty facing arrays; they are the neutrality demonstration, not judged evidence. The old reader would have fed 16 rows (8 empty) into the band summary. The new reader excludes them, so the judged corpus is the 8 on-legs the prereg defines.
- **Judgment: adopt the diff as written.** No deciding bar moved after the judged run; the bars are judged on the corrected analyzer. The sweep was NOT re-run — the corpus is valid (see below) and re-running would only re-measure the same seeds.
- **Corpus verification (done by the adopter, not taken on trust):** all 16 files parse; 8 seeds × 2 legs; `instrumentErrors: []` on all 16 (0 errors); anchor `2d7bcf514f66` on all 16. Neutrality per the corrected bar: on/off legs identical on all 8 seeds for days, endReason, standing, maxWave, unlockedWave, scaleRank, gameDays, waveKillLog content (JSON-equal), and fallen length. The instrument is neutral.

## Prereg summary

DIAG ONLY, zero src/js. Re-use of the vetfinish/grind band 99641–99648 (never claimed fresh), competent policy verbatim, 150d death-aware horizon. One judged leg (RUN=wave5face-b) + a W5_OFF=1 neutrality leg on the same 8 seeds. DIAG-GO bars: (1) every readiness-5 release classified (release class + unlock day + release-day list; never-released seeds classified by binding short bar); (2) every wave-5 spawn classified by meeting outcome or never-met reason, every wave-5 cast reconciled with the wanderer-birth cross-check; (3) the simultaneity datum (max simultaneous living veterans + day-count of 2+ living veterans) recorded for all 8 seeds. Vetfinish before-leg context on this band: 9 field wave-4 kills, up to 3 living veterans at peak, readiness-5 held up to 35 days, wave-5 unlocks 4/8, wave-5 kills 0, national 0/8, wins 0/8, median survival 116.5d.

## Verdict, judged strictly against the prereg bars

| Bar | Result |
|---|---|
| 1. Releases classified | **HOLD** — 4 released (all `released-met`, unlock days 56/74/86/106, release-day lists recorded); 4 never-released, each classified by binding short bar (see per-seed table). |
| 2. Spawns + casts classified | **HOLD** — all 25 wave-5 spawns classified (kill 0 / die 12 / flee 3 / never-met 10, every never-met with reason `no-encounter`); all 14 wave-5 casts reconciled (13 matched a same-day wave-5 wanderer birth, 1 unmatched — 99645 d94 cancellation, a feast/other draw). Wanderer-birth cross-check: 13 wave-5 births, 3 matched a spawn within 7 days, 10 never materialized. |
| 3. Simultaneity datum, all 8 seeds | **HOLD** — max simultaneous living veterans 3/1/3/2/2/1/1/0; days with 2+ living veterans 35/0/17/26/15/0/0/0; release-window days with 2+ living veterans 25/—/17/12/15. |
| **DIAG-GO** | **all three hold (analyzer `diagGo.all: true` under both the old and the corrected analyzer).** |

## Per-seed table (every release, every spawn classified)

| Seed | Days | End | Standing | Rank | MaxWave | Unlock | Release days | W4 kills | W5 kills | Scholar deaths | Max vets (day) | Days 2+ vets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 99641 | 103 | lost | 300 | regional | 5 | d74 | 29 (d74–103) | 6 | 0 | 13 | 3 (d79) | 35 |
| 99642 | 150 | survived | 199 | regional | 4 | — | — (never released; short: veterans) | 2 | 0 | 4 | 1 (d89) | 0 |
| 99643 | 147 | lost | 300 | regional | 5 | d106 | 42 (d106–147) | 4 | 0 | 19 | 3 (d112) | 17 |
| 99644 | 116 | lost | 325 | regional | 5 | d86 | 31 (d86–116) | 6 | 0 | 14 | 2 (d72) | 26 |
| 99645 | 110 | lost | 335 | regional | 5 | d56 | 55 (d56–111) | 4 | 0 | 12 | 2 (d56) | 15 |
| 99646 | 150 | lost | 175 | regional | 4 | — | — (never released; short: armor, weapons, veterans) | 1 | 0 | 11 | 1 (d145) | 0 |
| 99647 | 117 | lost | 199 | regional | 4 | — | — (never released; short: armor, weapons, veterans) | 4 | 0 | 12 | 1 (d59) | 0 |
| 99648 | 68 | lost | 100 | regional | 4 | — | — (never released; short: armor, weapons, veterans) | 0 | 0 | 1 | 0 | 0 |
| **Band** | **median 116.5d** | **7/8 lost** | — | **regional 8/8** | **w4 8/8, w5 4/8** | — | **4 released** | **27** | **0** | **86** | **max 3** | — |

Notes: 99642 sat at standing 199 — one point short of the 200 gate — for the whole run and never released, its only short bar `veterans`. 99647 also ended at 199 (short: armor, weapons, veterans). Release-day lists are contiguous except for missing daily snapshot rows (99641 d96, 99645 d87 — the snapshot row is absent, not a lost release; d1/d3 rows are also absent on most seeds — a snapshot-coverage wart, see metric review). The peak ratchet holds the release once earned on this band: no release day ever drops back below wave 5 while a snapshot exists.

## Every wave-5 spawn (25) — meeting outcomes

| Seed | Spawn (day, beast, HP) | Outcome | Meetings (kind:day:outcome, veteran?) |
|---|---|---|---|
| 99641 | s1 d84 timeslot 1400 | never-met (no-encounter) | — (alive at village death d103) |
| 99641 | s2 d89 cancellation 1600 | die | field d93–99: 10 flees + 1 die (all non-vet); TB none matched (see ambiguous below) |
| 99641 | s3 d92 cancellation 1600 | die | field d100: 1 flee + 1 die (non-vet); TB d100 die (instance join) |
| 99641 | s4 d100 editor 1500 | never-met (no-encounter) | — (alive at village death) |
| 99641 | s5 d101 rerun 1200 | never-met (no-encounter) | — (alive at village death) |
| 99642 | s1 d150 nielsen 1100 | never-met (no-encounter) | spawned on the last day; village survived, never released |
| 99643 | s1 d108 spoiler 1300 | flee | field d111, d112: 2 flees (non-vet) |
| 99643 | s2 d112 cancellation 1600 | die | field d135–145: 6 flees (non-vet); TB d146: 5 die (mid-day) + d147: 1 die (re-engage) |
| 99643 | s3 d114 editor 1500 | flee | field d119: 2 flees (non-vet) |
| 99643 | s4 d124 spoiler 1300 | die | field d124–138: 6 flees (1 vet flee d124); TB d139 die (mid-day) + d140 die (re-engage) |
| 99643 | s5 d127 finale_crew 700 | never-met (no-encounter) | — |
| 99643 | s6 d131 editor 1500 | never-met (no-encounter) | — |
| 99643 | s7 d140 nielsen 1100 | never-met (no-encounter) | — |
| 99643 | s8 d141 network_note 1000 | die | field d144 flee + d145 die (non-vet) |
| 99644 | s1 d87 editor 1500 | die | TB d87 die (mid-day) |
| 99644 | s2 d105 rerun 1200 | never-met (no-encounter) | — |
| 99644 | s3 d112 finale_crew 700 | never-met (no-encounter) | — |
| 99645 | s1 d56 rerun 1200 | die | TB d65 die (mid-day) |
| 99645 | s2 d60 cancellation 1600 | die | TB d66: 2 die (mid-day) |
| 99645 | s3 d64 spoiler 1300 | die | field d70–72: 3 flees (non-vet); TB d76 die (mid-day) |
| 99645 | s4 d69 finale_crew 700 | flee | field d92: 1 flee (non-vet) |
| 99645 | s5 d75 cancellation 1600 | die | field d86–87: 2 mFlee + 2 flee + 1 die (1 vet flee d87); TB d89 flee (mid-day) |
| 99645 | s6 d86 rerun 1200 | die | field d92–107: 5 flees (2 vet) + 2 die (1 vet d95); TB d108 die (mid-day) |
| 99645 | s7 d105 spoiler 1300 | die | TB d110: 2 die (mid-day) + d111 die (re-engage) |
| 99646 | s1 d146 nielsen 1100 | never-met (no-encounter) | spawned d146; village lost d150, never released |
| 99647 | — | — | no wave-5 spawns |
| 99648 | — | — | no wave-5 spawns |

Band totals: 25 spawns — **kill 0, die 12, flee 3, never-met 10**. Meetings: **75** (49 field + 26 turn-based). Field outcomes: flee 40, die 6, evade 1, mFlee 2. Turn-based outcomes: die 25, flee 1. **Ambiguous TB traces: 7** (all 99641 Cancellation, d100 ×3 + d103 ×4, two live candidates s2/s3 — honestly unassigned). **Unmatched field rows: 2** (99644 network_note d96 flee Diana Osei, d99 evade Jovan Milic — `spawnSeq: null`, `entryHp: null`; the beast was never spawn-tagged, see Findings).

## Do living veterans meet wave 5? Yes — and they lose

- **Field:** 49 wave-5 field meetings; a veteran was the fighter in **5** (4 flee, 1 die, 0 kills). **11** field meetings happened on days with **zero** living veterans at all; the other 33 had veterans alive somewhere in the village but not in the fight.
- **Turn-based:** 26 wave-5 TB meetings; **11 had at least one veteran fighter** (14 of 42 fighter slots were veterans; the instrument's veteran flag cross-checks 42/42 against `waveKillLog`). Of those 11: **0 kills, 10 scholar-deaths, 1 flee.**
- **Combined veteran meetings: 16 — 0 kills, 11 deaths, 5 flees.** Veterans meet the Producers and never win. The veteran flag itself is trustworthy (42/42 agreement with the kill log); the earlier "42/42 veteran" read was a probe bug (the flag is an object, not a boolean) and is corrected here.
- **The deed feed does record wave-5 facings** (the prereg's `wavesFaced[5]` read is a shape error — `wavesFaced` is keyed by monster id, not wave; the analyzer returned null for all seeds). Wave-5 types faced per seed: 99641 [cancellation] (1), 99642 [] (0), 99643 [cancellation, editor, spoiler, network_note] (4), 99644 [editor, network_note] (2), 99645 [cancellation, rerun, spoiler, finale_crew] (4), 99646–48 [] (0). The endgame deed bar (2 distinct wave-5 types faced) is met on **3/8 seeds** — facing is not the blocker; killing is.

## Wall numbers (national / table / wins, wave 4–5, median survival)

Judged corpus (8 on-legs, current master, anchor `2d7bcf514f66`): median survival **116.5d** (range 68–150; the analyzer prints 117, the upper median — same days), won **0/8**, national **0/8** (regional 8/8), table sittings 0, wave-4 unlock **8/8**, wave-5 unlock **4/8**, wave-4 kills **27** (field 9), wave-5 kills **0**, scholar deaths **86**, instrument errors **0**. Same-band comparison (vetfinish before-leg, same seeds, same master lineage): identical wall numbers — this arm re-measures the same villages with a finer instrument, and nothing moved. The Standing ladder re-cut rank thresholds since grind-a (seed 99648 reads 'regional' at standing 100 here vs 'village' at 150 there); rank fields are not comparable across masters — standing, kills, survival are.

## Village assessment (plain words)

Eight villages, same seeds as the last three measurements, and the story is now complete through the veterans bar. The villages learned to kill wave 4 in the field (9 field kills), banked up to three living veterans at a time, and held the wave-5 release for a month or more on four seeds. Then the Producers arrived, and the villages discovered the release is a door, not a weapon. The beasts came — 25 of them — and the villages met them 75 times and killed none. The strongest village, 99645, stood at 335 standing with four wave-4 kills, released on day 56, and still lost on day 110 with seven Producers spawned and zero killed. The two seeds that never released are almost worse: 99642 and 99647 both ended at standing 199, one point short of the gate, the first held back only by the veterans bar — a village that did nearly everything right and still never got to see wave 5. The villages die the same way throughout: scholars bleed out in turn-based fights (86 dead; 25 of them to wave-5 beasts, 8 of those on 99641 in just two days, d100 and d103). No village reached national, no one sat at the table, no one won. The chain's binding link is now precise: not the release, not the veterans, not the meeting — the kill. Villagers cannot hurt wave-5 beasts fast enough to matter, and the beasts kill whoever they meet.

## Sense-test read

**99645 d87–95, Salvador vs the Cancellation and the Rerun (veteran, three meetings).** Salvador is the band's veteran — a wave-4 killer — and the fiction shows exactly what happens when he meets wave 5. "Salvador has Crude bow but no arrows — the string stays drawn, useless." Then the Walk In: "walks in open-handed — and it goes wrong. It doesn't want peace. They're exposed, off-balance." Then one hit for 40–52 damage and Salvador runs at 16–18 health, or dies in round one. The same script three times: volley, failed parley, one crushing hit, flee or die. The repeated Walk In is the robotic part — Salvador tries to parley a Producer on round one of every meeting, it fails every time, and he never learns. The bow-without-arrows line is honest and recurs across fighters (Jesse's sling, Chloe's bow, Miguel's crossbow — the same line, four fighters), which reads as a real logistics blank (fighters carrying ranged weapons with no ammunition) rather than a narration bug.

**99641 d93–103, the Cancellation saga (one beast, eleven field meetings, eight scholar deaths).** Tom Baker strikes for 20 against 1200 health while the stamp descends: "Tom is losing — shouts for help! Wei charges in!" Wei deals 47. The beast's wounds persist between meetings (1200 → 1094 → 1076 → 986 across days) — the village grinds it down over a week and never finishes it. On d103 Fatima Hassan, a veteran with a wave-4 kill on d99, fights the same Cancellation three times in one day and takes it from 402 health to 8 — and the scholar dies all three times. The beast sits at 8 health and the village still loses. The fiction is coherent and awful: the math is visible in the narration, the villagers keep coming back, and the beast outlasts them.

**99644 d96, Diana vs The Network Note.** The richest single fight in the corpus: "Diana walks straight into The Network Note. No avoiding it." Rage ("Diana's eyes go red"), field medicine mid-fight (+20 HP), and the Note's signature: "NOTE: 'THE WOLF SHOULD HAVE LASERS NOW' — and then it does. (+25%.)" The System-voice jokes land, the mechanics are legible, and Diana still flees at 42 health. The fight is fun to read and unwinnable — which is the point of this arm, stated as a finding rather than a complaint.

**The 1-HP heralds are gone; the 8-HP Cancellation remains.** Vetfinish found five 1-HP herald meetings the wall delivered to the floor. This band has the mirror image: a beast ground to 8 HP over three fights in a day that still kills the scholar. The wall delivers beasts to the floor; the village still cannot close.

## Metric review (§14)

- **Correction 2 (TB join rule) — adopted, bars unchanged.** Recorded in the prereg after the judged leg and before this evidence. The old rule left 15 TB traces unmatched; the corrected rule matches 8 and leaves 7 honestly ambiguous (99641, two live Cancellations). Spawn outcomes, meeting outcomes, wall numbers, and all three DIAG-GO bars are identical under both analyzers. The correction is a measurement fix (the engine removes the world monster at the first TB fight — verified in `src/js/game.js:35424`), not a re-score: no meeting changed outcome, no bar moved. The prereg's metric-review question is answered: yes, the mid-day join produced ambiguous matches — 7, all on one seed, all honestly counted separately.
- **Cast reconciliation — mostly explained, one loose end.** 13 of 14 casts match a same-day wave-5 wanderer birth. The one unmatched cast (99645 d94 cancellation) has no birth at all — a feast/other draw, not a wanderer. Of 13 wave-5 wanderer births, only 3 produced a spawn within 7 days; 10 never materialized (the beast gave up after the 7-day window, or the village died first). The wanderer pipeline is leaky by design (a cast is a choice, not a spawn), but 10/13 never becoming an encounter is the larger half of the "never-met" story: most wave-5 wanderers never reach the village at all. Only 3 of 25 spawns trace to a wanderer birth.
- **Release-day contiguity — answered, no drop observed.** The two apparent gaps in the release-day lists (99641 d96, 99645 d87) are missing daily snapshot rows, not lost releases — d1/d3 rows are missing on most seeds too. No snapshot ever shows `unlockedWaveSnap` dropping below 5 once earned. The peak ratchet holds the release on this band; the snapshot-coverage wart (occasional missing daily rows) should be noted for any future instrument that counts days from snapshots.
- **Prereg shape error — `wavesFaced[5]`.** The prereg says "wavesFaced[5] distinct types" but `wavesFaced` is keyed by monster id, not wave, so the analyzer's `w5facedTypes` is null on all seeds. The correct read (computed here from the raw corpus): wave-5 types faced are 1/0/4/2/4/0/0/0. Future preregs should name the mid-keyed read.
- **Veteran-flag probe correction.** An early probe read `w5fightersVeteran` values as booleans and reported 42/42 veteran slots; the values are objects (`{veteran, hadKill, alive, killDays}`) and the true count is 14/42 veteran slots, cross-checked 42/42 against `waveKillLog`. The evidence uses the corrected count.
- **Median convention.** The analyzer prints median survival 117 (upper median of 8); vetfinish reported 116.5 (mean of the middle two). Same days, same corpus — this file reports 116.5 for comparability with the sibling arm.
- **No balance panel (§15).** Not run: the panel takes no corpus input (same precedent as grind-a / finishersize-a / adopt-a / vetfinish-b); the pre-registered classification IS the comparison (identical seeds, same band as the vetfinish before-leg).

## Findings for the coordinator

- **WAVE-5 DAMAGE MISMATCH (the binding link, measured):** villagers deal ~13–23 damage/round against 1000–1600 HP Producers that hit for ~20–50/round through gear; a kill needs 50–80 rounds, a fighter dies in 1–3. 75 meetings, 0 kills, 31 scholar deaths. The release, the veterans, and the meetings all exist — the kill does not. Any next lever here is a damage/survivability question, not a gating question. Evidence: this file + corpus (99645 Salvador meetings, 99641 Cancellation saga, 99641 d103 Fatima at 8 HP).
- **REPEATED FAILED WALK-IN VS WAVE 5 (open, behavior):** fighters open wave-5 meetings with Walk In (parley) on round one and it fails every time, leaving them exposed for a crushing hit — Salvador three times in a row, Jesse and Chloe likewise. Either the policy/bot should stop offering parley against Producers, or the fiction should say why parley is hopeless here. Evidence: this file, sense-test (99645 d87/d92/d94/d95 logs).
- **RANGED WEAPONS WITHOUT AMMUNITION (open, logistics):** "has Crude bow but no arrows — the string stays drawn, useless" appears for four different fighters (Salvador, Jesse, Chloe, Miguel with a crossbow). Villagers carry ranged weapons they cannot fire into the hardest fights in the game. Evidence: this file + corpus field logs.
- **UNMATCHED FIELD MEETINGS — NETWORK_NOTE SPAWN PATH (open, instrument):** 2 of 49 wave-5 field meetings (99644 d96 Diana, d99 Jovan) carry `spawnSeq: null` and `entryHp: null` — the beast was never spawn-tagged, so no spawn is classified for them. The fights themselves are fully narrated. Either a spawn path bypasses `spawnWorldMonster` (or the tag is lost on that path), or these are re-engagements the instrument cannot see. Evidence: this file + `evidence/2026-11-09/perseed-wave5face-b/w5-s99644-wave5face-b.json`.
- **WANDERER PIPELINE LEAK (open, measurement):** 10 of 13 wave-5 wanderer births never produced a spawn within 7 days, and only 3 of 25 spawns trace to a wanderer birth. If the wanderer is meant to be a delivery channel for wave 5, it mostly does not deliver. Evidence: this file, cast reconciliation.
- **ONE POINT SHORT (open, design observation, not a ruling):** 99642 ended at standing 199 — one point short of the 200 gate, held back only by the veterans bar — and 99647 also ended at 199. Two villages did nearly everything right and never saw wave 5. Whether the gate should have a near-miss path is a Steve-call, not a lever claim. Evidence: this file, per-seed table.
- (Not re-filed: the repeated committedHold narration line — a wart, not a defect, held by vetfinish-b; the 1-HP wall floor's invisibility — held by grind-a.)

## What was NOT touched (guardrails)

- Zero src/js changes in this arm. The instrument, driver, analyzer, proof test, evidence, and corpora are scripts/evidence only.
- No gate / price / deed / readyDemand / win-price change. No new lever, no confirm leg (DIAG only). This arm does NOT edit hidden_files/ (the coordinator owns sim-findings.md and the tracker).
- `node scripts/check.js` was NOT run (zero src/js changes; the proof test + the 16-seed neutrality demonstration are the regression evidence for this arm). Stated as not run, not claimed.

## Commits (this branch)

- `0d85eb710` — prereg (this arm; committed BEFORE any judged computation)
- `2d7bcf514` — wave-5 facing instrument + driver + analyzer + proof (63/63) — DIAG, zero src/js
- (adoption commit next: Correction 2 prereg note + analyzer + proof test E3 (69/69) + corpus + this evidence file)

## Corpus

- evidence/2026-11-09/perseed-wave5face-b/w5-s9964{1..8}-wave5face-b.json (8 files, judged corpus; instrument errors 0)
- evidence/2026-11-09/perseed-wave5face-b/w5-s9964{1..8}-wave5face-off.json (8 files, neutrality legs; instrument errors 0)
- Tooling: scripts/wave5face-instrument-20261109.js, scripts/wave5face-driver-20261109.js, scripts/wave5face-analyze-20261109.js, scripts/test-wave5face-b.js (69/69 on this tip)

## Convergence state

- **Instrument: PASS (DIAG-GO, all three bars).** Every release, spawn, and cast on the band is classified; the simultaneity datum is recorded for all 8 seeds. The instrument is proven (69/69) and neutral (on/off identical on all 8 seeds).
- **The winnability chain on this band, after this arm:** wild ally-join → wave-4 kills (9 field, live) → veterans (up to 3 living, live) → readiness-5 release (4/8 seeds, 29–55 days, live) → **wave-5 facing (25 spawns, 75 meetings — live) → wave-5 kills (0 — the binding link)** → national/table (0/8 — unreached) → full seat (0/8 — unreached). The chain now binds at the wave-5 kill, not at the release, the veterans, or the meeting.
- Balance panel (§15): not run (precedent above). Telemetry: `scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-09/perseed-wave5face-b/*.json' --metrics national,table,wins,exiled` REFUSED — "refusing recorder-corpus input: all 16 --current rows carry top-level anchorCommit". Recorded as the result, same as grind-a / finishersize-a / adopt-a / vetfinish-b. The baseline was NOT reseeded.
- Blanks filled: the wave-5 facing instrument is built, proven (69/69), and has judged the release→meeting→kill chain on the vetfinish band; the 15-trace TB attribution gap the dead worker found is corrected, verified against the engine, and recorded. Blank remaining: the wave-5 kill itself — no lever in this arm touches it.

## Check status

- Proof tests on this tip: wave5face 69/69 (was 63/63 at `2d7bcf514`; +6 from Correction 2 fixture E3). Re-run after the rebase (see landing section below).
- `node scripts/check.js --quick` was NOT run (zero src/js changes; see above). Stated as not run, not claimed.

## Landing section (adopter — for the coordinator)

- Rebase base: master `1f1d3dabbc6444ec2192a8f86d8d1cf3d9cab134` (read in the main tree immediately before rebasing; master HAD moved from the brief's 03:35Z value `465802a90258c94a4471fcb12c54df69ca5edef6` — a sibling arm, sim-approachretest-b, landed in between — so the new SHA was used). Rebase replayed all 3 branch commits cleanly, no conflicts, no rebase-quirk stop. New tip `f2ed0740b`.
- Proof after rebase: `node scripts/test-wave5face-b.js` — **69 passed, 0 failed** (exact count verified, not assumed). Analyzer re-run on the rebased tip reproduces the verdict exactly (diagGo all true; wall national 0 / table 0 / wins 0 / w4 unlocks 8 / w5 unlocks 4 / w5 kills 0 / w4 kills 27; spawns never-met 10 / die 12 / flee 3).
- Ready to merge: **yes — ready to merge** (`--ff-only` onto master by the coordinator; no push, no bump, no live verification by this worker).
