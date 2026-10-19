# sim-trapline-census-b2 — event-tracked NPC trapper census (INSTRUMENT-ONLY diagnostic)

Arm: sim-trapline-census-b2 · run fleshout-loop-b-20261019T1030Z · loop oversight-flesh-out-loop-b
Date: 2026-10-19 · Base SHA (frozen): 6143e6cd680f37e85174ee6114f36a5bfe6c154c (verified = worktree HEAD at sweep start)

## Pre-registration

- **Type**: INSTRUMENT-ONLY diagnostic. No lever, no game-code change, zero src/js edits. Named next from #581 (sim-pitstaff-b2: pitstaff 0-for-2, do NOT re-run staffing — instrument the live NPC trapper economy). Answers #603 (join/vid-appearance events, never snapshots), #612 (learner-gate mismatch probe), #613 (learned-pit joiners).
- **PRIMARY**: 100% attribution of pit-channel state — every pit catch attributed to a holder origin (day-0 background / joiner / learned-via-apprenticeship), every knowsPit holder tracked appearance-to-departure with zero unattributed transitions. This is a diagnostic: no GO/NO-GO on a lever; the report ends in a convergence verdict on the census question itself.
- **Horizon**: 180d death-aware (never fixed-200d). Dead villages stop simulating.
- **Seeds**: 7931–7938 × {leadfeast, belongfeast} = 16 runs. Fresh: 7901–7908 were consumed by sim-cookbulk-b; 7911–7918 and 7921–7928 partially consumed; 7931–7938 verified zero genuine hits in evidence/scripts/hidden_files before sims (the single 7937 hit was a coincidental kcal/day counter inside a 59106 winloss JSON, not a seed).
- **Policies**: leadfeast / belongfeast from scripts/policies/feastscale (competent-player substrate).
- **Env**: FEASTSCALE_R13=1, SEATDRIVE=0 (explicit, pre-seat). PITKNOWLEDGE unset (channel live — this is the census of the live economy).
- **Instrument**: scripts/sweep-trapline-census-b2.js (event-tracked ledger: joins, catches, teaches, apprenticeships, holder deaths/exits, #612 teach-call probe, say-transcript capture). Proof: scripts/test-trapline-census-b2.js — 21 assertions green pre-sweep, incl. det-gate byte-identical re-run (leadfeast s7931, 25d), attribution completeness (zero unattributed, every holder with appear record + recorded departure, ledger catches == pit catches), p612 gate-split consistency.
- **Instrument design notes**: wrappers are passive (record-and-delegate); no RNG, no Date.now in the instrument, so trajectories are untouched. Holder appearances can only come from three routes — day-0 roster (background), join/rejoin events (background-trapper / learned-in-run / pre-run-learned), and the pit apprenticeship (the only in-run knowsPit write path, villager-agency.js:1149; profiles only carry knowsPit from occupation at generation, game.js:1260/1543 — no born-with path exists in code). Departures: death (authoritative death tele), exit (roster disappearance with no death event), exit-eor/survived (end of run), **scholar-succession** (a holder who inherits the scholar's mantle — the daily tick watches Game.villagerId; without this a succession misreads as an exit, found live on 7931-leadfeast: the day-0 trapper Bodhi became the scholar at d69).

## Results

16/16 runs completed (7931–7938 × {leadfeast, belongfeast}, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, base 6143e6cd680f37e85174ee6114f36a5bfe6c154c). Per-seed JSONs: evidence/2026-10-19/perseed-trapline-census-b2/.

### PRIMARY — attribution (the census question): CONVERGED, 100%

- **Unattributed transitions: 0/16 runs.** Every pit catch, pit_teach, pit_overhear, and pit_lesson resolved to a ledger holder with an appear record; every knowsPit holder (11 tracked) has a recorded departure (death / scholar-succession / survived).
- Ledger catches == pit catches on all 16 runs (cross-check in the proof test).
- The instrument's three appear routes (day-0 roster, join/rejoin events, pit apprenticeship) are exhaustive: the only in-run knowsPit write path is the apprenticeship (villager-agency.js:1149); profiles otherwise carry knowsPit only from occupation at generation (game.js:1260/1543). **No born-with path exists in code** — the task's "born-with" origin class had zero instances; origins observed were background-trapper (11/11) only.

### The live pit economy, 16 runs

- **Day-0 holders: 8** (1 each in 8 runs; 8 runs started with no trapper at all). Scholar was never a trapper occ (background pit L3: 0/16).
- **knowsPit joins: 3** — all `background-trapper` (2× hunting_guide, 1× trail_crew). **0 rejoins, 0 pre-run-learned, 0 young** in this batch (#613's learned-pit joiner did not recur — it was a 1-in-32 event in the trapjoin census).
- **Holder departures: 6 deaths, 4 scholar-successions, 1 survived.** (First sweep read the successions as 'exits'; the succession-aware re-run corrects them — a holder who inherits the scholar's mantle leaves the NPC roster without dying. The Bodhi case on 7931-leadfeast proved it; all 4 exits were in runs with exactly 1 player death.) Tenure (death/succession): median **36d**, max 115d. The #603 high-turnover finding reproduces exactly: day-0 trappers die or get promoted fast; the channel lives on whoever walks in next.
- **Holders with ≥1 catch: 3/11.** Catches: 7 (4,731 kcal, 239.3 kcal/100d). Species: 2 raccoon, 2 wild boar, 1 white-tailed deer, 2 opossum; boar 2 (1,546 kcal). **All 7 catches attributed to background-trapper origin** — the learned channel contributed nothing this batch because no apprenticeship fired.
- **pit_teach (scholar-side beat): 6** — the trapper→scholar knowledge channel works when a holder is present and trusted. **pit_overhear: 0. pit_lesson (villager→villager apprenticeship): 0/16.**

### Wall numbers (the scale-onramp report)

- Survival: median 126d, max 180d; end reasons: 3 survived / 13 village-lost.
- Wins 0/16 · national/global 7/16 · table 11/16 · wave4 10/16 · wave5 0/16 · maxArc 4 (tableWaiting).
- Deaths: 13 player + 294 villager. Buckets: violence 106, age 96, monster 59 (+named: Loud-Eyes, The Eulogy, dustboar, sweeps week, the big bastard, don't-look), disease 8, starvation 9, dehydration 4, wounds 7, contest 3, ambush 3, experiment 2, alien 1.
- Telemetry deviation check vs scale-wall.json (winseat regime): one LOUD line — wins 16→0, the predicted regime artifact (baseline note: pre-seat substrates are structurally ~0-win; mine is FEASTSCALE_R13=1/SEATDRIVE=0 pre-seat competent play). national 7 vs 12, table 11 vs 16 are regime differences below the LOUD threshold (no same-regime baseline exists); exiled 0 = 0. No same-run investigation item.

## #612 probe — the learner-gate mismatch

The teach chore picks learners at random among villagers present (`pick(here)`, villager-objectives.js:1070); the pit apprenticeship needs a hungry-or-novice learner (villager-agency.js:1136-1168). The census wrapped all 498 ambient teach-chore calls and read each learner's gate state pre-call. Result:

- **Teach-chore calls with a knowsPit teacher: 5/498 (1%).** The pit line's first bottleneck is that trappers rarely hold the teach chore at all.
- **Of the 5: 1 died at the need gate (20% mismatch)** — learner neither hungry nor novice (7933-lead d44, leo_martin → gen_hqdkrb4; teacher fell through to a plant lesson).
- **2 taught SNARE instead of pit** (7931-belong d95, 7933-lead d64). Block order in agencyTeachVillager: the SNARE block runs BEFORE the pit block with the same trust≥15 / need / 85% dials — and all three trapper occupations carry **both** knowsSnare and knowsPit (characterGen.json). A dual-knowledge teacher with a novice learner who lacks both will always spend the lesson on the snare; the pit block never runs. This is the structural starvation, bigger than the need gate.
- **2 failed outright** (7931-lead d64, 7933-lead d70; {taught:false, failed:true} — the 85% roll or the trust gate; the instrument reads hunger/novice pre-call but not trust, so these two gates can't be separated — recorded as an instrument limitation).
- **Net: 0 pit apprenticeships from 498 teach calls; 0/16 runs.** The pit line grows only through joiners, never through teaching.
- **tele-need consistency: 0 mismatches** — when pit_lesson fires, `need` always matches the learner's actual state (the computation is self-consistent). The #612 "mismatch" lives at the ATTEMPT level (random learner, need-gated), never as a mislabeled tele.

**Engine-hook verdict for #612**: the evidence for an engine-side hook is now threefold and ordered — (1) snare-before-pit block order starves the pit path for dual-knowledge teachers; (2) the random learner pick vs the need gate kills ~20% of the rare eligible attempts; (3) trust≥15 + 85% compound on top. A hook that only fixes learner matching (need-driven learner preference) addresses (2) but leaves (1) — the bigger term — intact. If the line is ever to grow on demand, the pit topic needs its own lane in the teach chore (not just a better learner pick), or the snare block needs to yield when the learner's need is pit-shaped.

## Village assessment — what the village looked like

The pit channel is a one-person line. In the 8 runs that started with a trapper, the day-0 holder worked the TRAPS purpose, taught the scholar once when trust allowed (6 pit_teach beats across 16 runs — "Your hands don't know it yet. Your eyes do."), and was gone within a median 36 days: 6 deaths (monster, violence, ambush), 4 successions-or-exits. In the 8 runs with no day-0 trapper, the channel existed only if a trapper walked in — 3 did in 16 runs (2 hunting_guide, 1 trail_crew). Five runs never had a pit at all.

Who thrived: Owen Smith (hunting_guide, joined d105 on 7931-leadfeast) — the #603 archetype. Twenty-four days of presence, 2 pit catches (white-tailed deer 455 kcal, wild boar 993 kcal), dead d130 to The Eulogy. The joiner flow sustains the line by WORKING it, exactly as the trapjoin post-mortem said.

Who died and why it mattered: Bodhi (trail_crew, 53, day-0 holder on 7931-leadfeast) taught the scholar the snare and the pit on d43 — then at d69, when the scholar Emily died, **Bodhi inherited the scholar's mantle** ("At the grave, Karl, Sam, Chinh and 3 more speak for Bodhi — 'Emily trusted them. We saw it. Give them the fire's hearing.'"). The village-as-protagonist continuity isn't a slogan: the trapper became the protagonist. The census instrument initially misread this as an 'exit' (fixed: scholar-succession watch on Game.villagerId). Across 16 runs, 4 of 11 holder-lifetimes ended in succession — the pit channel's holders don't just die, they get promoted.

What was missing: the villager-to-villager spread never happened (0 pit lessons in 16 runs, 0 in the 32-run pithear batch too). Knowledge enters through background (occupation) or not at all. The scholar-side channel (pit_teach → recipe L1) works; the peer channel is decoration on the competent substrate.

## Sense test — do the pit beats cohere?

Read the d43 teach + d105–130 Owen arc on 7931-leadfeast (deterministic replay, full say transcript).

- **The teach lands.** Bodhi comes back from a quiet pit line; the scholar watches; the snare teach and the pit teach fire on the same return: "🪤 Bodhi catches you watching the pit line. '...Want to actually SEE one?' They walk you out to it — the depth, the sharpened stakes at the bottom, where the game trail runs. 'Brush it over with leaves. And mark it well — your own pit will take you too.'" The warning ("your own pit will take you too") is the same line the pit_overhear beat uses — consistent voice, and it echoes the real own-pit death mode the pitstaff arm found. Coherent.
- **The joiner arc lands.** "🚶 Owen Smith walks in — pack light, eyes wide. Haven grows by one. (9 souls.)" Then daily work lines ("Owen heads out to check the snares. 'Wire doesn't lie.'"), catches narrated with species and kcal ("🪤 Owen is back from the pit line: Wild Boar in the pit — +993 kcal to the pantry."), quiet days ("Pit was quiet. They'll keep."). A person with a routine, not a counter. Coherent.
- **The succession lands.** Emily's death → the grave-speaking beat names the successor and the trauma system fires ("You knew Emily — not the office, the person... (+5 trauma)"). The village buries its speaker and the trapper picks up the mantle. This is the game's thesis working as designed.
- **Gap (honest):** the transcript filter that flooded on the "trust" key (600-line cap) ate the d130 window, so Owen's death narration itself wasn't verified in this pass — only the ledger fact (death d130, The Eulogy). The teach/catch/join beats verified; the trapper-death beat is unconfirmed, not disconfirmed.

## Metric review

- **PRIMARY (100% attribution): MET.** 0 unattributed transitions across 16 runs; ledger catches == pit catches on every run; all 11 holders have appear records + recorded departures. The instrument proved the census question answerable.
- **Mid-run instrument refinement (declared here per §14):** the departure taxonomy gained `scholar-succession` after the first sweep misread Bodhi's d69 succession as an 'exit' — caught only because the sense-test transcript was read (the grave-speaking line names the successor). The re-run carries the fix (Game.villagerId watch in the daily tick); the PRIMARY verdict is unchanged, the taxonomy is now honest.
- **#612 framing refinement:** the pre-registered question ("how often does pit_lesson fire for a non-hungry/non-novice learner") is structurally 0% — the need gate is hard, and tele-need consistency was 100%. The informative metric is the attempt-level mismatch (1/5 = 20%) plus the block-order discovery (snare-before-pit). Future probes should pre-register attempt-level metrics, not tele-level ones, for gated beats.
- **Seed substitution:** the brief's 7901–7908 were consumed by sim-cookbulk-b (found during freshness verification); 7931–7938 substituted after verifying zero genuine prior hits. Documented, no impact on validity.
- **Instrument limitation (open):** the teach-call wrapper reads hunger/novice pre-call but not trust(teacher), so the trust gate and the 85% roll can't be separated on failed attempts. A future probe should snapshot trust too.
- **Transcript filter limitation (open):** the SAYKEY "trust" term flooded the 600-line cap with trust-refusal spam; future sense passes should drop it.

## Named nexts

1. **#612 — engine-side learner hook, now with ordered evidence.** Bottlenecks, biggest first: (1) snare-before-pit block order starves the pit path for dual-knowledge teachers (all three trapper occs carry both); (2) random learner pick vs the need gate (~20% of the rare eligible attempts); (3) trust≥15 + 85%. A need-driven learner preference alone fixes only (2). If the line is ever to grow on demand, the pit topic needs its own lane in the teach chore — game-code work, not policy. (Policy-side was already killed twice: trapjoin-b, pithear-b.)
2. **#603 — standing instrument.** scripts/sweep-trapline-census-b2.js is now the event-tracked, succession-aware census instrument for the pit channel (joins, catches, teaches, apprenticeships, holder lifetimes, #612 probe, transcript capture). Any future pit-side work should reuse it, not the 30d snapshots.
3. **#613 — learned-pit joiners.** 0/16 this batch (was 1/32 in the trapjoin census). The origin taxonomy (background-trapper / learned-in-run / pre-run-learned) is in place; no further action until one recurs.
4. **#581 — pitstaff stays dead.** 0-for-2, do not re-run staffing. The NPC economy IS the channel; instrument it (done here), don't staff it.
5. **Instrument debt:** snapshot trust(teacher) in the teach-call wrapper (separate trust gate from 85%); drop "trust" from the transcript SAYKEY.

## Convergence verdict

**CONVERGED on the census question.** The instrument attributes 100% of pit-channel state (0 unattributed transitions, det-gate byte-identical, proof 21/21 green), and the economy is now measured: background-trapper holders + joiners, median 36d tenure, 3/11 holders ever catching, 239 kcal/100d across the batch, zero villager-to-villager spread, scholar-side teaches working. No further census runs needed. The open work is engine-side (the #612 hook, named above) — a lever question for a future arm, not a measurement question.
