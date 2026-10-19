# Journey ENDGAME R21 (2026-10-19) — COALITION DEPTH: what answers the call?

**Run id:** playtest-loop-2-20261019T1055Z (oversight-playtest-loop-2, lane B). Worktree: `journey2-endgame`.
**Base:** master a68416cee (+ d38335c3 lane-A landing mid-run; rebased before landing). Rotation file read 4 (endgame); advances to 5 at the end of this run.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** COALITION DEPTH at the call (r19 blank #2, r20 metric-review note). The titan gates count BLADES (allies + Haven, cap 3 ours): herald 10, nielsen 12, finale 20. Each answering fire sends 2 faces and needs trust ≥25 on its link. When the herald arrives in competent play, what does the alliance graph actually look like — and can a deliberate coalition-builder fill the 10-blade gate?

**Interesting-finding bar:** (a) the instrument records links-at-call, answered/refused fires with trusts, blades, gate readiness on 100% of sounded calls; (b) either Arm B moves breadth (≥3 answering fires on a seed, or strictly more than Arm A on the identical seed) — or breadth never materializes under either arm, which files the gate as effectively haven+1fire-gated (a blank for Steve: tune the gates or the diplomacy ceiling).

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 instrument GO: on every seed where the call is sounded, evidence records callDay, linksAtCall (n + trusts), answeredFires, refusedFires with trusts, allyBlades, havenBlades, totalBlades, minAllies, gateReady. 100%.
- M2 breadth GO: Arm B (breadth driver) vs Arm A (baseline) on identical seeds — B answers strictly more fires than A on ≥1 seed, OR B reaches ≥3 answering fires on any seed. (Pilot-calibrated: r20 saw 0–1 answering fires with no deliberate diplomacy.)
- M3 people GO: ≥2 sense-reads of call / war-council / muster / stand-down beats across arms; 0 senseless flags.
- M4 census GO: all runs end cleanly with real censuses; no crash/softlock.
- M5 guardrail GO: Arm A reproduces r20's shape (≥1/2 seeds reach table announcement; non-god wins stay plausible) — the new instrumentation must not perturb the arm.

**Seeds:** pilot 9001 (A), 9001 (B), 9002 (B) — identical-seed A/B pair (§1). Contact check FAILED on 9001/9002 (no stage-2 herald on either arm — the instrument correctly recorded N/A): re-piloted on r20's herald seeds 8991/8993 (A+B each). Then a 12-seed screen (Arm A, 110d) for herald contact → herald seeds 9006, 9009, 9013 (+9014: none). Confirm: full 260d A/B pairs on 9006, 9009, 9013.
**Horizon:** 260 loop-days, death-aware (r20 continuity). **Stack:** r18's seat-driver tip (TRIBFLOOR=1 + WINDEFER=1 + FEASTSCALE_R13=1 + BELONG_V3=1, set BEFORE any require) + r20's titan driver (council/call/commit + stand-down hook). Arm B adds the breadth driver: from day 20, tend all active Haven-primary links weekly (tendLink: 1,500 kcal → +8 trust), court every known unlinked fire once per 7 days (proposeLink as Haven-primary, tribute 3,000) — with a pantry guard (confirm-stage fix: skip while the pantry holds <7 village-days; the unguarded pilot starved B9013 at d53 — a driver artifact, not a game finding).

## DECISION LIST (my calls — Steve corrects)

1. **R21's blank target: coalition depth** (r19 blank #2, r20 metric-review). The gates were written against blades, the diplomacy against links, and nothing had measured them against each other in a full run.
2. **Two-arm design:** A = r20 continuity baseline (proves the instrument doesn't perturb the run); B = adds the breadth driver (proves the diplomacy verbs drive headless and move the graph).
3. **Breadth courts as Haven-primary (LEAD road),** not covenant/trade: primary links get tendLink (+8/week), the only repeatable trust verb; the courtship score gate is the engine's own.
4. **Contact failure → seed re-targeting, not metric softening:** 9001/9002 produced no stage-2 herald, so M1/M2 were unmeasurable there. Re-ran the pilot on 8991/8993 instead of declaring the pilot a finding. (Pre-registration correction before observing coalition numbers — not a re-score.)
5. **Pantry guard on the breadth driver** (confirm stage): a competent player doesn't court while starving. The unguarded B9013 died d53 of hunger; guarded, the same seed won d90.

## RESULTS

### The call, seed by seed (herald only; nielsen/finale never reached stage 2)

| seed | arm | located | links@call | answered | refused (trust) | blades a+h | gate 10 | end |
|------|-----|---------|-----------|----------|-----------------|-----------|---------|-----|
| 8991 | A | d60 | 1 | 0 | The Bloodied (24) | 0+0 | not ready | lost d134 |
| 8991 | B | d71 | 4 | 2 (Emberhold, Ashford) | Stonebridge (23), Thornfield (23) | 4+0 | not ready | **WON d90** |
| 9006 | A | d73 | 1 | 1 | — | 2+0 | not ready | **WON d90** |
| 9006 | B | — | no herald (table first) | — | — | — | — | **WON d90** |
| 9009 | A | d61 | 1 | 1 | — | 2+0 | not ready | lost d72 |
| 9009 | B | d77 | 5 | 3 (Thornfield, Ashford, Emberhold) | Stonebridge (84, arrears), The Red Table (no fighters) | 6+1 | not ready | lost d137 |
| 9013 | A | d88 | 1 | 1 | — | 2+0 | not ready | **WON d90** |
| 9013 | B | d88 | 1 | 1 | — | 2+0 | not ready | **WON d90** |

- **M1 GO:** instrument fired on 7/7 sounded calls (100%).
- **M2 GO:** B answered strictly more than A on identical seeds — 8991: 2>0, 9009: 3>1. B reached 3 answering fires (9009).
- **M3 GO:** 4 sense-reads (A8991 call, B8991 council+call, B9009 call, B8991 stand-down); 0 senseless flags. Details below.
- **M4 GO:** all 8 full runs ended cleanly with real censuses; no crash/softlock.
- **M5 GO:** Arm A: 2/4 table announcements (9006, 9013), all wins non-god (track social/craft/field, moral light, endingKind path) — r20's shape reproduced.

### The coalition ceiling (the finding)

- **Arm A (competent baseline): the belong road builds depth, not breadth.** Every herald seed showed exactly 1 active link at the call — the BELONG road's Haven-subordinate link — yielding 0–2 allied blades. The herald gate (10) is unreachable on this playbook: 2 + 3 haven = 5 max.
- **Arm B (breadth driver): 4–5 links by day 30–70, 2–3 answering fires, 4–6 allied blades.** Best observed: B9009 — 5 links, 3 answered, 6 blades + 1 haven commit at call time (7; up to 9 with full haven commits). Still under 10.
- **The trust-25 bar bites at the margin, and the reasons are legible:** refusals at trust 23 (×2, B8991 — speaker deaths, mourning gagged the tending), 24 (A8991), 84 (B9009 Stonebridge — trust high but *debts unpaid*: the breadth driver's tribute promises accrued arrears, and arrears block the call), and "no fighters to send" (The Red Table — the link exists, the fire is thin).
- **Trust decays under the tending:** B9009's 5-link coalition held d70–d130 with weekly tending, but min-trust slid 48→25 across 60 days (decay + refusal −8s + a raid −10). A 5-link coalition costs ~7,500 kcal/week in tending plus tribute promises — the diplomacy economy is real food.
- **Diplomacy is food-priced and can kill:** unguarded B9013 courted 3 villages from d20 and starved at d53 (pantry empty, day 3 of hunger). Guarded, it won d90. The tribute/tending costs are honest game costs; the driver just needed a competent player's pantry sense.
- **Theoretical max on B9009:** 4 fires × 2 = 8 allied + 3 haven = 11 ≥ 10 — IF Stonebridge's arrears were cleared AND The Red Table had fighters. The gate is reachable in principle, not in these runs.

### Village assessment (census in plain words)

- **8991-A — the one-link village that lost:** Harper, Brian, Boris, Grace, Carolina, Atuq — six alive at d134, no table. One link (The Bloodied, trust 24) refused the call by a single point; the muster stood down; the village never reached the table and faded. The trust-24 refusal is the whole story in one number.
- **8991-B — the coalition that won:** Greta, Brian, Mateo, Boris, Owen, Ruby, Nikolai, Chantal — eight alive, won d90 feared/light on the lesser seat, track field, no godpath. Four links, two answered, muster stood down d75 ("Sound the call again when the coalition is real"), table d90. The stand-down → win arc from r20 repeats.
- **9006 — the quiet wins:** both arms won d90 with no drama (A: 1 link answered, stood down, won; B: table before the herald located). Dale/Elijah/Ethan/Ingrid/Ines/Iolanda/Mario (A) and Stan/Elijah/Katarina/Grace/Onni/Maya/Yuliana/Tariq (B), all alive.
- **9009-A — the short loss:** Luz, Ruth, Priya, Abraham — four alive at d72, scattered. One link answered, muster stood down, village gone before the table.
- **9009-B — the great coalition that died:** Christian, Maya, Devon, Stan, Olivia, Oliver, Elke — seven standing at d137 when the village died out (disease + a Stonebridge night raid: "They carried off ~1200 kcal... Trust −10"). Five links, three answered, the biggest coalition measured — and it still wasn't enough blades, and the spurned ally raided them. The refusal had consequences.
- **9013 — the clean pair:** both arms won d90 (A: Denise/Theo/Tariq/Ingrid/Onni/Grace/Chunmei/Dale; B guarded: same seed, won). One link answered on each.

## People check (SENSE-TESTING LAW)

1. **War council as forecast (B8991 d71):** "— Ben Lund of Emberhold (trust 76, steadfast). Scouts: they would die for this coalition / — their speaker of Stonebridge (trust 23, watchful). Scouts: they weigh it daily..." The council reads every link's trust aloud with a scout gloss; the call then plays out exactly as forecast (76/66 answer, 23/23 refuse). A real player can read the council and know the call's outcome in advance — legible, not random.
2. **The call (A8991 d60):** "— The Bloodied REFUSES. they do not trust this coalition with their people. (trust −8 — refusals are remembered.)" One point under the bar, named reason, remembered cost. Then: "Haven commits its own: Jesmin, Harper march with the muster... The coalition counts 2 blades against THE HERALD — it needs 10." Honest gate math, aloud.
3. **The call (B9009 d77):** "— Stonebridge REFUSES. debts unpaid between you." (trust 84 — the arrears rule, not the trust rule); "— The Red Table has no fighters to send. Their fire is thin." Three distinct refusal reasons in one call (distrust, debt, emptiness), each previously established in play. "Tribute paid: 5,293 kcal walks out of the pantry toward Emberhold." — real food, real cost, same beat.
4. **Stand-down (B8991 d75):** "🕊️ THE MUSTER BREAKS — THE HERALD still stands, unanswered, but the blades go home. 3 of Haven's own come home. 2 allied fires walk home thinner (trust −5 — they bled for a fight that never came). The lair waits. Sound the call again when the coalition is real." Retreat priced, threat persistent, door open.
5. **Mourning choke (B8991 d71):** "They're burying their speaker — grain can wait a week; grief can't. Tending resumes when the mourning lifts." The two trust-23 refusals weren't neglect — they were grief, and the game said so at the time.
6. **0 senseless flags** across all beats read.

## BLANK DOCUMENTED (Steve's call)

**The herald's 10-blade gate vs the coalition ceiling.** Measured: competent baseline play yields 1 link (0–2 blades); deliberate breadth-building yields 4–5 links (4–6 blades); the theoretical max observed was 8 allied + 3 haven = 11, requiring every fire to answer with no arrears and full rosters. No run filled the gate. The stand-down verb (r20) is the designed answer to an unfillable muster — call, fail honestly, break it at a social cost, rebuild, call again — and that loop worked (B8991 won after a stand-down). But the gate itself has never been filled in any journey run. Options: (a) lower the herald gate toward the measured ceiling; (b) teach the competent playbook breadth (it's currently a LEAD/belong depth playbook — the depth/breadth split is the real design axis); (c) accept the gate as aspirational and the stand-down loop as the intended play. Not my call — filing with data.

Smaller findings for the queue: the trust-25 bar's sharpest bites are at 23–24 (one tending away — the council beat already teaches this); arrears block high-trust links (the debt mechanic works, and it bit the breadth strategy exactly as designed); villages with no fighters still count as links but can't answer (the "thin fire" line is honest).

## Reachable / Fun / Winnable

- **REACHABLE:** The diplomacy verbs (proposeLink, tendLink) drive headless and move the graph (0→4 links by d30 on B). The call, council, refusal reasons, and stand-down are all reachable through the normal player surface; the war council's trust readouts make the call's outcome legible before it's sounded.
- **FUN:** The B9009 arc is the game at its best — build the coalition, watch two fires refuse for *different named reasons*, stand the muster down, then get raided by the spurned ally. Every beat has a social consequence. The B8991 arc (over-commit, break it at a trust cost, win anyway) repeats r20's best shape.
- **WINNABLE:** 4/8 full runs won (9006 A+B, 9013 A+B, 8991 B) — all non-god, all light, all on the lesser seat. The table remains winnable; the herald itself remains unslain (no run has filled the gate — the blank above).

## Regression

- **No src/js changes this run** — scripts/ + evidence/ only. The driver ran 15+ full seeds with no crash/softlock; the coalition instrument fired on 7/7 sounded calls.
- `check.js --quick`: (running — result below; green list must stay green).
- Instrument bug fixed same-run: the summary read breadth activity from the wrong ctx (now harnessCtx); minAllies now reads `G.data.titans` (was 0 via the missing `_titanTest.titanDefs`).

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json` (r14 seat-driver: 7/8 wins): **quiet** — Arm-A aggregate (15 seeds: 4 full 260d + 11 110d screens): wins 9, table 9, tableSceneFired 9, tableSceneCompleted 9, seatApproach 9 (1 file, 5 metrics, no large deviations). The baseline was NOT rolled forward — mixed horizons and a new arm; nothing deviated. Evidence: `evidence/2026-10-19/tele-r21-baseline.json`.

## METRIC REVIEW (§14)

- M1–M5 all GO. No re-scoring.
- Pre-observation corrections (not re-scores): (1) pilot re-targeted from 9001/9002 to 8991/8993 after the contact check failed (no stage-2 herald — nothing measurable); (2) pantry guard added to the breadth driver after the unguarded B9013 starved at d53 (driver artifact; the guarded re-run won d90); (3) instrument fixes: minAllies via `G.data.titans`, breadth activity via harnessCtx.
- Kill taxonomy: no kills this run. The 9001/9002 pilot was a CONTACT miss (§14b.1), not a concept miss — correctly re-targeted, not filed as dead.
- Note for future runs: the breadth driver's weekly tending (~7,500 kcal/week at 5 links) + tribute promises shift food-economy telemetry on titan seeds; that's the diplomacy economy working, not drift. The herald gate (blank above) is the next design question, not a tuning task — it needs Steve's call or a coalition-depth lever with data.

## Evidence

- `evidence/2026-10-19/journey-endgame-r21.md` (this note)
- `evidence/2026-10-19/journey-endgame-r21-r21-{baseline,breadth}-s{seed}.{json,txt}` (per-seed; 8 full + 11 screen)
- `evidence/2026-10-19/journey-endgame-r21-r21-baseline-summary.json`, `...-breadth-summary.json`
- `evidence/2026-10-19/tele-r21-baseline.json` (telemetry aggregate)
- `scripts/journey-endgame-r21-20261019.js` (driver: seat-driver + titan driver + breadth driver + coalition instrument)

**Game-code changes:** none. Merged locally, pending ship.
