# Journey Endgame r10 — Leg 4 (Endgame): feast-road table approach + table chain exercise

**Run:** 2026-10-14 · Worktree `journey-endgame` · leadfeast × seeds 11/22/33/44, 180d death-aware
**Harness:** `scripts/journey-endgame-r10-20261014.js` (r9 harness + leadfeast policy via `scripts/policies/feastscale.js`, FEASTSCALE_R13=1 hermetic; + tableDone-day tracking, arc4-day, ascensions, wave-5; convo driver stays OUT of the daily loop — r8 hang bug)

## Pre-registered question (MEASUREMENT.md §11)

On current master (Standing-bar build, #102 infinite-fight fix, feast road, succession haircuts, prodthrottle), does a competent FEAST-ROAD player reach the table / Arc IV within 180 days, and does the table chain (src/js/table.js) play end-to-end sensibly?

- **Primary metric:** runs with tableSeat() approach (seat != 'none') OR tableScene fired. **GO = ≥2/4 seeds.** NO-GO = document, still deliver people check + one blank.
- **Secondary:** wave-5 unlocks; tableScene completion in-harness; NPC ascension scores; Arc IV / table pricing lines sense-read.
- **Seeds:** 11/22/33/44 (r8/r9 comparability). **Policy:** leadfeast (leadcourt + feast layer).
- **Horizon:** 180d death-aware (+10d tail).
- **Interesting-finding bar:** a feast-road table approach with a playable finale; or a concrete dead beat in the table chain; or senseless table lines.

## Results — NO-GO on the primary (1/4), big secondary movement

| Seed | End | Wave4/Wave5 | Standing max (day) | Sources w/l/f | Seat | Scene | Notes |
|------|-----|-------------|-------------------|---------------|------|-------|-------|
| 11 | lost 151 | 70/120 | 212@120 | 2/3/3 | none | — | died d114–116 cascade; 0 survivors |
| 22 | lost 158 | 50/60 | 577@150 | 7/3/15 | **full** | **fired d65** | Arc IV d65; 6/7 paths earned; 4 living at end |
| 33 | lost 105 | 60/90 | 207@90 | 1/3/4 | none | — | 3 NPC ascensions; died d79–90 |
| 44 | lost 116 | 60/70 | 242@90 | 0/3/7 | none | — | foodDeeds filled; died d107–115; 2 survivors |

Wall: national 2/4, table 1/4, won 0/4, seatApproach **1/4**, median 151d, exiled 0/4.
Standing: wave-4 **4/4** (r9 belongseek: 0/8), wave-5 **4/4**, sceneFired 1/4, sceneCompleted 0/4, ascensions [0,0,3,0].

**The feast road moves everything it was built to move.** Wave-4 unlocks went 0/8 (r9 belongseek) → 4/4; wave-5 4/4; all three Standing sources fire (s22: war 7 / links 3 / feasts 15; s44: plenty 140 from 7 feasts — and s44's lesser-seat **food-deed rung filled**, the exact gap r8/r9 flagged). First-ever table scene in these sims (s22, d65, full seat). But the primary still misses: only s22 approached, and 3 of 4 villages died before the table could come. **The bind is survival through the endgame window, not the table chain.**

## Village assessment (plain words)

**s11 — the climbers who broke.** Reached global, wave 5, standing 212 with all three sources moving — then died in three days (d114–116): The Algorithm took one, monsters took three including Priya, sickness took Zoe Adams. Zero survivors. Nobody led it anywhere in the end; the village simply stopped. Missing: the food-deed rung (feasts=3, never filled) — the seat stayed 'none' at global rank.

**s22 — the table village.** The one that made it: wave 4 @50, wave 5 @60, Arc IV @65, and the table came on day 65 — full seat, "global standing, every wave faced, the deeds complete. The table rises when you enter." Six of seven paths earned (feared 100, beloved 100, defiant 60, assimilated 45, relay 40, indispensable 35; witness unearned — "didn't keep the list"). The scene was never answered in-harness, so the table sat unanswered 93 days under TABLE SANCTITY (ambient monster pressure suspended — a measurement artifact AND a design note: an unanswered table puts the world on hold). Combat still found them d144–150 (Ingrid Vik and two joiners fell fighting; one to a contest), and the polity dissolved at d158 with four living — Grace the fisherman, Ben the exterminator, Priya the roofer, Ines the dentist. The village died around living people; they scattered. Nobody won. The full seat went unanswered. (Oddity: integration stage read 3→0 by d130 — possibly a mantle pass; not chased this run.)

**s33 — the noticed dead.** Global by ~d90, wave 5 @90, then combat and sickness d79–90. Zero survivors — but the ledger noticed three of them anyway: **Greta Hansen, Catalina Reyes, and Jovan Milic ascended** (tableAscended = 3). Ascension works on a dying village; the audit would have priced them.

**s44 — the feasters.** Wave 4 @60, wave 5 @70 on diplomacy + plenty alone (war 0 — never killed a wave-3+ monster). Seven feasts filled the lesser-seat food-deed rung (r8/r9's binding gap, closed here), but the wave bars still bound (w3 distinct faced = 0 — Standing unlocks waves, but the seat wants waves *faced*). Died d107–115: monsters, combat, one starvation. Two survivors: Grace the nurse, Ava the street artist.

## Table chain exercise — 7/7 paths play end-to-end

`scripts/table-chain-r10-20261014.js` on the s22 full-seat end-state: reset table-scoped state per path, drive via `chooseTableOption` reading `scholar.tableChoices` like the UI would. **All 7 paths resolve (phase 'done', won=true), 5–6 steps each, zero failures, zero dead beats, zero strands, no undefined/NaN.** Per-path transcripts: `evidence/2026-10-14/journey-endgame-r10-tablechain-{feared,indispensable,beloved,witness,defiant,assimilated,relay}.txt` + summary JSON.

- **Pricing beat** reads well: "A full seat. global standing, every wave faced, the deeds complete. The table rises when you enter." Lesser-seat line also verified in the ladder data ("A lesser seat — regional standing, waves 1–3 faced (12/8/3)… The table does not rise. It prices.").
- **Branch wiring:** relay's gradient band works ("Stay both-hands. No merge, no champion." — the grey ending); feared's trial-by-combat offered as opt-in (skipped in the walk; the tbEnd wrap resumes via tableTrialResume — the fight itself is the real combat engine); dark-conscript and demand-price phases are wired in chooseTableOption (not hit on these light walks).
- **Witness** was unearned on this run but plays when driven directly (production gates the choice on earned — correct).
- **Epilogues** are path-distinct and strong (relay's "both hands", defiant's walk-away, witness's trial of the judges). Pronoun honesty holds ("Grace Vega walks out of the light alone, which is how *she* walked in"). The pods/oversight epilogue fires when the pods aren't demanded ("You did it on purpose, because you were busy.").
- **No dead beats found.** Every choice advanced the beat; every beat offered options; every finale resolved.

## People check (SENSE-TESTING LAW) — mixed

Two day-60+ probes, `scripts/convo-probe-r10-20261014.js` (outside the day loop):

1. **s22/day72, Cole** (musician, prickly, trust 20), want=`curious`: **weak** — the NPC never wants anything specific; the thread meanders (small hopes → gossip non-sequitur → "That's... pretty much all of it, honestly." → "So." fire-gazing → "Okay, that's my quota of socializing."). Ends resolved nothing, planted nothing, owed nothing (resolution=engaged is a lie). Consistent with r9's `curious`-want finding. Gossip line carried a template artifact: "Solid person. ." (double period — documented, not fixed). Also: **day 72 is a week after the table came (d65) and nobody mentions it** — the village doesn't acknowledge the table. Documented as content work, not fixed here.
2. **s11/day62, Dmitri** (nurse, dry, trust 30, mood=grieving), want=`seek_comfort`: **strong** — concrete want (grief), real engagement ("Do you ever — no. Never mind." … they want you to ask), stage advances 1→2→3, resolution=comforted, in-character beats ("I keep thinking about them. About — everyone."). **But** the comfort pool repeated verbatim back-to-back: "Thanks. ...Thanks for saying that." twice in a row → **the blank, fixed below.**

**Verdict:** villagers act like people when the want is concrete (seek_comfort); the `curious` want still meanders (r9's finding stands, unmoved).

## Blank FILLED: convoPickCycle verbatim repeat on pool reset

**Found** in the Dmitri transcript. **Root cause** (`src/js/conversation.js`, `convoPickCycle`): when a pool exhausted, the reset cleared the key's said-list outright, so the random re-pick drew from the full pool — including the exact line just spoken (~1/3 per exhaustion). **Fix:** seed the fresh said-list with the last-spoken line, so the cycle never opens with an immediate repeat. Cross-key memory untouched (one thread still never resurfaces in another).

**Proof:** `scripts/test-convo-cycle-norepeat-20261014.js` — 40 trials × 4 picks from a 3-line pool through the real key, seeded PRNG (mulberry32 before eval). **RED: 14/40 repeats pre-fix. GREEN: 40/40 clean post-fix.**

**Regressions:** test-convo-deflect-cycle-20261012 11/11, test-convo-deflect-cycle-20261012-r6 13/13, test-convo-beats-20261006 25/25. test-convo-coherence-choices and test-convo-depth-20261007 fail identically on pristine HEAD (pre-existing: their eval lists miss `resolveConsequence` / `wantBeatTag` — verified via patch round-trip, not my change).

**Documented, not fixed:** (a) post-table conversations don't acknowledge the table; (b) gossip "Solid person. ." template artifact; (c) lifetime said-memory never decays — small cycle pools eventually collapse to hardcoded fallbacks for long-lived villagers (design question about said-memory decay, not a one-line fix).

## Reachable / fun / winnable (endgame leg)

- **Reachable:** YES for waves 4–5 on the feast road (4/4 each, organic Standing unlocks); the table scene fired for the first time in sims (s22, full seat, 6/7 paths earned). The chain itself is fully playable end-to-end (7/7).
- **Fun:** the table writing is strong and path-distinct; sims can't judge fun beyond that. Design note: an unanswered table suspends the world indefinitely (sanctity) — fine as fiction, but the table probably shouldn't wait forever.
- **Winnable:** NOT YET. 0/4 wins; all four villages lost d105–158. The wall is surviving the endgame window with the polity intact, plus actually answering the table. Win-path stays blocked on survival per the tracker.

## Metric review (§14, anti-drift)

**Primary missed (1/4 < 2/4) → NO-GO, not re-scored.** The metric stands. Doubt for the NEXT run: the miss is survival-gated (3/4 villages died before the table could come), not table-gated — the feast road moved every lever it owns. Proposed: keep the primary, add a survival-conditioned secondary (seat approach among villages alive at d100+), and drive one table scene to completion in-harness (the chain exercise now covers the beats manually). No revision applied to this run.

## Telemetry deviation check

`telemetry-check.js` vs `telemetry-baselines/endgame.json` (national,table,wins,exiled,seatApproach,wave5unlocked,tableSceneFired,tableSceneCompleted,ascensions): **2 LOUD lines, both explained, baseline rolled forward.**
- `wave5unlocked` 0→4: the feast-road policy (intentional policy change vs the belongseek baseline) — wave 4/5 unlock organically on all seeds. Not a bug.
- `ascensions` 0→3: s33's three NPC ascensions — the ascension system working as designed. Not a bug.

## Files

- `scripts/journey-endgame-r10-20261014.js` — measurement harness (leadfeast, 180d)
- `scripts/convo-probe-r10-20261014.js` — standalone convo probe
- `scripts/table-chain-r10-20261014.js` — 7-path chain exercise driver
- `scripts/test-convo-cycle-norepeat-20261014.js` — proof 40/40 (RED-verified 14/40 pre-fix)
- `src/js/conversation.js` — the convoPickCycle anti-repeat fix
- `evidence/2026-10-14/journey-endgame-r10-leadfeast-s{11,22,33,44}.json` — per-seed telemetry
- `evidence/2026-10-14/journey-endgame-r10-transcript-leadfeast-s22-day72-probe.txt`, `-s11-day62-probe.txt`
- `evidence/2026-10-14/journey-endgame-r10-tablechain-{7 paths}.txt`, `-summary.json`
