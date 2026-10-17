# Journey leg: DEEPENING (days 40–80) R15 — the execution window — 2026-10-17

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14)
- **Question:** on the new tip (master@84a1e0af), (a) do r14's DEEPENING gains hold (M1–M7', C1, C3, C4), (b) with the CORRECTED C2 bar (0 flee-mid-trick with minHpFrac > 0.25), does trick-aware morale behave?, (c) THE EXECUTION WINDOW: for field fights where villagers PERFORMED w3 tricks, what are the outcome channels (vKill / mFlee / evade / vFlee / vDie) vs no-trick fights — do performances resolve?, (d) do the newly landed conversation changes read human (succession r20 true-name mourning, crisis r19 wound-care memories, social r19 opener skip/grief pool/substance gate, prosefix-b feast voice, ambientfix-b variants)?
- **Binding metrics:** M1 player wave-3 fights ≥2/8 (r14: 4/8). M2 seasoned link ≥1/8 (r14: 6/8). M3 'observed'-via ≥2/8 (r14: 8/8). M4 knowledge compounding >0 on ≥6/8 (r14: 8/8). M5 ≥10 transcripts sense-read, 0 senseless. M6 alive at day 100 ≥4/8 (r14: 7/8), 0 mislabels. M7' win-side inert. M8 'show' lately beat ≥1/8 (r14: 7/8). C1 new-w3-trick PERFORMED on ≥2/8 (r14: 3/8). C2' 0 flee-mid-trick with minHpFrac > 0.25. C3 ≥1 raid aid-crisis at wave ≥2 (r14: observed). C4 waveKillLog by=<vid> on ≥2/8 (r14: 8/8), via='companion' ≥1/8 (r14: 3/8). C5 unknown flesh — REPORT-ONLY (competent substrate; track pantryMin). E1 execution window — outcome distribution for trick fights vs no-trick w3 fights; interesting if mFlee+vKill ≥ 50% of trick fights.
- **Interesting-finding bar:** a performed trick RESOLVING a fight; a true-name mourning beat read aloud; a wound-care memory in talk; any pantry dip < 5000 with haul behavior.
- **Seeds:** fresh 8801–8808 (name-level freshness verified; pilot 8801–8804). Policy: competent. DAYCAP=100, death-aware stop. W3TRACE unset. SEATDRIVE unset (= driver ON).
- **Canon read:** CANON.md (2026-10-17), MONSTER-WAVES.md (wave law, gating), KNOWLEDGE.md (channels). No new canon invented.

## What ran
- Harness: `scripts/journey-deepening-r15-20261017.js` (r14 clone via `scripts/build-r15-harness.js`; instrument-only, zero game code): fresh seed panel, corrected C2' bar, E1 execution-window resolution census (outcome distribution trick vs no-trick), missed-opportunity census (no-trick fights joined against trick-knowledge at fight time), pantry-min tracker, new conversation markers (wound-care exact beat text from convoTopics.js care/wound branch; succession true-name lines). Marker bug fixed mid-run ('stitched' false-positive on a world-description line; true-name "you're not " matched gossip filler) — markers tightened to exact beat text.
- Pilot 8801–8804: 0/4 seeds with ANY trick performance (15 w3 field fights, 0 performed) — the execution-window gap as the story; expanded to 8805–8808 on the strength of the question (cheap: ~90s/seed).
- Blank filled: the fleeMidTrick summary dropped `fledHopeless`/`fleeLearn` (the wrapper recorded them), making the hopeless-path vs floor-path distinction unmeasurable. Fix: carry `fledHopeless`, `fleeLearn`, `holdLine` through + `fleeMidTrickHopelessOver` (C2'' count). RED→GREEN proof: `scripts/test-r15-fleeattribution-20261017.js` (RED: flags absent in pre-fix 8805 JSON; GREEN after re-run: flags present, hopelessOver=0, determinism byte-identical on 9 key fields).
- Base: master@84a1e0af. All work in worktree journey-deepening. 0 game-code changes (harness + proof test only).
- Outputs: `evidence/2026-10-17/journey-deepening-r15-competent-880[1-8].json`, ~100 transcripts (day45/60/80 + showprobes).

## Verdicts on the binding metrics
- **M1 meetings — GO (3/8).** Player wave-3 fights on 8802 (1), 8805 (2), 8808 (2). (r14: 4/8.)
- **M2 seasoning — GO (8/8).** Seasoned links on every seed.
- **M3 counter parity — GO (8/8).** 'observed'-via discoveries 6–16/seed. Non-lethal path the norm.
- **M4 knowledge — GO (8/8).** Compounding markers 50–101/seed.
- **M5 people — GO.** 10 transcripts sense-read (below), 0 senseless. Wrinkles documented.
- **M6 winnable — GO (7/8 survived; 0 mislabels).** 8804 village-lost d61 (combat-heavy: ambush d10, monster kills d17–18, sickness d30/d47 — death-aware stop correct).
- **M7' win-side inert — GO.** seat 'none', watchers 0, 0 table|deedgate rows on all 8.
- **M8 show-memory — GO (8/8).** 'show' lately beats 1–8/seed.
- **C1 counterwire reachability — GO (2/8).** 8805: 13 new-trick performances (callback farewell ×5, redactor quiet ×6, chorus_line dance ×1); 8808: 1 new (redactor quiet) + 5 old (spool record ×4, buffering still ×1). Bar met exactly.
- **C2' trick-aware morale — NO-GO by the letter (4 events > 0.25), DESIGN-HONEST by mechanism.** Klaus 0.29, Aitana 0.26 (8805), Riwai 0.32 (8807, wave-1 hummice/shout), Adaeze 0.30 (8808) — ALL are vBreak-floor withdrawals, not hopeless-path breaks: the hold-line beat fired first in 3 of 4 (hopeless override engaged, then the floor broke them); Riwai never went hopeless (pure floor). 0 hopeless-path violations above 25%. The bar conflates two flee mechanisms; see metric review (C2'').
- **C3 crisis-tier honesty — GO (observed).** Raid aid-crises at wave ≥2 on 8801 (d-wave3), 8802 (waves 2,3), 8805 (wave 3).
- **C4 kill attribution — GO.** by=<vid> non-null on 8/8; via='companion' on 8802/8803/8804 (3/8).
- **C5 unknown flesh — REPORT-ONLY (0/8, as expected).** pantryMin range 360–37700. 8804 dipped to 360 (collapse seed) with 0 carcass hauls — even natural scarcity produced no haul events; the HAUL-gate opportunity itself is rare on this substrate. Queued: scarcity-substrate run (r14 metric review).
- **E1 execution window — the headline finding.** 20 trick fights (8805: 14, 8808: 6): **mFlee 8 (40%), vFlee 11 (55%), vDie 1 (5%), vKill 0.** Tricks RESOLVE non-lethally — Devon's redactor-quiet starved the Redactor out ×4 (3 rounds each), Katarina's callback farewell dismissed it, Adaeze's spool-record ran the Spool to dead air, Katarina's chorus_line dance bored it out over 15 rounds. They never kill (vKill=0 — the trick is a tactic inside a real fight, not an I-win button), and they cost HP: 11/20 ended with the villager withdrawing, 1 death (Miriam vs Callback, farewell performed, died at minHp 0.38 — the monster's real behaviors don't pause for the trick). Resolution profiles differ by trick: redactor-quiet is reliable (4/6 mFlee), callback-farewell is a coin flip, chorus_line is a marathon.
- **Actuation gap (missed-opportunity census):** on 8805, 24 of 31 no-trick fights happened when the village ALREADY knew that monster's trick (discovery-day join). Actuation given knowledge+contact ≈ 14/38 ≈ 37%. The execution window is knowledge-rich and actuation-poor — the flesh-out loop's reposition/actuation work is the right lane.

## Village assessments (plain words)
- **8801 (12→10, survived, wave 3):** the teaching village. Juan's day-counting callback, four distinct plant-teaching reactions, Vasyl's Ghost Pipe callback ("I'm seeing it everywhere now"). Hold-line beats ×2, no tricks performed — knowledge without actuation.
- **8802 (12→9, survived, wave 3):** the moral village. Enrique's "Have you ever hurt someone?" — answered honestly, received with weight. Companion kill attribution ×1. 5 show beats.
- **8803 (12→11, survived, wave 2):** the quiet village. Wave 3 never unlocked (kills short). Jack's wanderlust thread planted ("I dream about roads... Don't tell anyone") — a villager who wants to leave.
- **8804 (12→3, village-lost d61):** the collapse. Ambush took Diana d10, monsters d17–18, sickness d30/d47. Pantry hit 360 — the natural scarcity experiment: 0 carcass hauls even starving. Death-aware stop behaved.
- **8805 (12→10, survived, wave 3):** the trick village. 45 w3 field fights, 13 new-trick performances, 12 hold-line beats. Devon went quiet ×4 and the Redactor left; Katarina danced the chorus_line out over 15 rounds. Costly: Miriam died mid-farewell.
- **8806 (12→10, survived, wave 2):** the hungry village. Wave 3 never unlocked. Scott: "I haven't eaten right in days. I need food before I can't work at all." — the ask_favor lane working as designed.
- **8807 (12→9, survived, wave 3):** the witness village. Wave 3 unlocked, 0 w3 field fights found anyone. Riwai shouted at a hummice and withdrew at the floor (0.32) — the C2' pattern at wave 1.
- **8808 (12→7, survived, wave 3):** the grinder. 13 w3 field fights, 6 with tricks — Adaeze recorded the Spool out at 62% HP, then withdrew at the floor (0.30) in the rematch. 4 hold-line beats.

## People check (SENSE-TESTING LAW — 10 full transcripts read, 0 senseless)
Standouts: Shanice's Wilhelm grief ("I keep turning over the last thing Wilhelm said to me. I can't tell if I'm remembering it right, and that's somehow the worst part."); Juan's day-counting callback; Enrique's moral question and the deflected warmth ("They hear the warmth in it. They're not ready to let it in."); Jack's planted wanderlust thread; Shanice's gossip-resume ("we wandered off it, 3 days back. 'I've got theories. Most of them are just fear with better lighting.'"); Vasyl's gossip correction ("Yue told you wrong. From Beijing, China — that's the one I know."); the true-name mourning beat live in the wild ("The fire knew Fernando before the Codex did — their name already carried weight here." — succession r20 fix confirmed on the deepening leg); Dariga's Russian-only scene (language barrier played straight).
Wrinkles (documented, not senseless): (1) "You want to know about that? Okay." preamble still repeats 3–4×/conversation (r14's wrinkle persists); (2) menu-return filler "That's what I heard, anyway. What's up?" still quotable as resume memory; (3) teaching-acceptance lines are cross-villager templates ("Huh. They turn it over in their mind. I'll remember that one." verbatim from Juan and Vasyl — r10's wrinkle persists); (4) promise-accept "I won't forget who fed me when it mattered." still shared across villagers.

## Blanks filled (1) — with RED→GREEN proof
**fleeMidTrick summary dropped fledHopeless/fleeLearn** (harness instrument gap): the wrapper recorded them, the summary mapping didn't — making the hopeless-path vs floor-path distinction (the C2'' question) unmeasurable. Fix: carry `fledHopeless`, `fleeLearn`, `holdLine` through + `fleeMidTrickHopelessOver` count. Proof: `scripts/test-r15-fleeattribution-20261017.js` — RED (flags absent in pre-fix 8805 JSON), GREEN after 8805 re-run (flags present, hopelessOver=0, 9 key fields byte-identical = deterministic). Zero game-code changes.

## Telemetry deviation check
`telemetry-check.js` vs deepening.json: **LOUD: fightsTotal swung 62% (45 → 73). INVESTIGATED — EXPLAINED, not a bug.**
- r15 sum (73) ≈ r14 sum (72) on fresh seeds; the swing is the STALE baseline (pre-r14). Per-seed: 7,10,12,5,13,6,12,8 (median 9). Other baselines held (w3fights 8→5, engaged.w3 21→19, fightsByWave.3 8→5 — all noise).
- Baseline NOT rolled (consistent with r14's decision): the deviation is baseline staleness, not a game change. Metric review notes the median as the robust statistic.

## Metric review (§14)
- **C2' was wrong in the same way C2 was.** The bar conflates the hopeless-morale path (what counterwire's hold-line governs) with the vBreak floor path (older situational-morale system, Steve 2026-10-09: "only the floor breaks them"). All 4 over-threshold events are floor-path; 0 hopeless-path violations. Proposed C2'': "0 flee-mid-trick events with fledHopeless=true and minHpFrac > 0.25" — now directly measurable via the blank fill above.
- **E1's 50% bar was ambitious.** Tricks resolved 40% non-lethally; the miss is informative (withdrawal is the modal outcome). Keep the bar for the next run — actuation work may move it.
- **fightsTotal baseline is stale AND seed-fragile.** Consider re-baselining on the r14/r15 era with per-seed median (9) instead of sum.
- **C5 queue stands:** the scarcity-substrate run (pantry < 5000 by design) is still the way to test unknown-flesh hauling. 8804's natural dip (360) produced 0 hauls — the opportunity itself may need staging, not just the need.

## Reachable / fun / winnable (deepening leg)
- **Reachable:** YES — wave 3 on 6/8 seeds, trick performances on 2/8, honest raid tiers on 3/8, companion attribution on 3/8, show beats on 8/8, seasoned links on 8/8, true-name mourning beats in the wild.
- **Fun:** villagers now FIGHT wave-3 monsters with learned tricks and the tricks RESOLVE — going quiet until the Redactor leaves, saying the goodbye until the Callback loses coherence, dancing until the chorus_line gets bored. It costs blood: most trick fights end with the villager withdrawing, one ended with Miriam dead. The trick is a tactic inside a real fight, never an I-win button — exactly the design.
- **Winnable:** 7/8 survive; wave 4 not reached on competent play (readiness-gated, out of window). The climb past is priced in kills and standing, as designed.
