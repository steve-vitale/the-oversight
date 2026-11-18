# Journey leg DEEPENING — r237 run note (2026-11-18, Lane A)

## Run
Run id `playtest-loop-a-20261118T152106Z` (scheduled Wed 2026-11-18
08:45 CST). Rotation read `2` (deepening); write `2→3` at closeout
with read-back. **Base:** local master `402726f9b` (r240 establishment).
Heartbeat loop running (9-min cadence,
`journey-deepening-hbloop-r237.sh`; restarted once after a service
restart killed it — see Gate). Pre-flight: main tree CLEAN, disk 47%.
Lock created by coordinator 2026-11-18T15:21:06Z. No push (ship loop
owns pushes).
Registration took ~90s (box load — sibling git operations contended
for REGISTRY.lock; the worktree registered cleanly).

## Pre-registered bars (r237 prereg)
Q1 GROWTH LINE, RE-JUDGED on the repaired harness (F1 upkeep move +
F2 reset; same GO bars as r236). Q2 COALITION-REACH, bar >= 6/8, with
link/trust depth reported alongside (r236 metric review). Q3 people
check (2 full transcripts). Q4 census + reachable/fun/winnable.
Carried: trick pipeline, w4fights/w4kills, banked veterans, w5
unlocked/faced/killed, slain-field watch, refusal-heard regression
watch, scholar-death standing metric (vs r236: 23 total, 16 wild).

## Pilot (seeds 104601–104603, 100d) — gate passes, no repair owed
Ran clean in ~53s: 3/3 survived to day 100–101, wave 4 on all three.
**Q1-GROWTH-LINE GO on the pilot:** poolDays=6, lineDays=5,
badLines=0, repeatLines=0, growthCalls=5, harvestMismatch=0,
havenMismatch=0. The r236 panel's one bad line is gone — every
growth-call harvested exactly the announced allied AND Haven blades.
**F2-REARM-GO on the pilot:** resets=3, rearmed=1, stale=0.
**Pilot instrument catch (analyzer, before the panel):** the new
link/trust depth read `villageStanding().links` from standingTrace —
it reads **0 on every day of the pilot**, even while musters drew
allies from 2–6 linked villages. The depth metric was re-pointed at
`musterLog.links` (linksMax) before the panel; proof case (76)
updated to pin it. See F2 below. The pilot seeds are scored in the
panel (r233/r240 precedent — no driver change followed the pilot;
the panel re-runs all 8 seeds in one process, which is the
instrument of record per r236 F3).

## Analyzer verdicts (r237 panel, seeds 104601–104608, 100d)
- **Q1 GROWTH LINE: GO — poolDays=13, lineDays=11, badLines=0,
  repeatLines=0, growthCalls=11, harvestMismatch=0,
  havenMismatch=0.** Per-seed: 104601 4 calls (announced allied 2 /
  harvested 2, Haven 3/3), 104602 1 (2/2, 0/0), 104604 3 (2/2, 2/2),
  104605 2 (0/0, 2/2), 104606 1 (3/3, 0/0); 104603/104607/104608
  no pool days. The F1 fix is proven in the wild: the line is judged
  against the dawn pool now, and the harvest is exact on both legs
  every time. The line's voice in the wild names the fire, the verb,
  and the numbers: "📯 The fires have warmed since the call —
  Ashford would send 2 more blades if the call were sounded again.
  The muster would stand at 9 of the 10 THE HERALD demands. Still
  short — but the gap is closing." (104601 d63). The Haven clause
  carries its verb: "Haven has 1 volunteer free to march — the
  commit sends them." (104601 d66).
- **Q2 COALITION-REACH: 4/8 (bar >= 6/8) — FAIL.** Reached 10:
  104602 (11), 104603 (11), 104606 (10), 104607 (11). Stuck:
  104601 max 8 (30 days at 7–9), 104604 max 9, 104605 max 7,
  104608 max 9 (longest one-short run 28 days). Depth alongside:
  linksMax 3–6, meanTrustAtEnd 67–88. Same wall as r235 (4/8) on a
  fresh band — the line moves blades on 11 calls, but the coalition
  bar is set by trust/link depth, not by the signal. See F5.
- **F2 MUSTER-RESETS: resets=6, rearmed=3, stale=0 → F2-REARM-GO.**
  104601 d64 (re-armed, commit same day), 104606 d92 (re-armed),
  104608 d62 (re-armed); 104601 d95, 104603 d83, 104607 d96 NO-NEED
  (titan slain or muster filled). The r236 shape — Haven blades
  sitting free while the muster sat short — does not recur.
- **SLAIN-FIELD: GO** — 1 opportunity (104601, Herald slain in the
  field d94 by villager combat), reconciled 1/1, defect 0.
- **MARCH: MARCH-SLAIN** — 31 march days, 20 arrived, 5 on-tile, 3
  fought on march, 2 slain (104603 d82, full-health 700; 104607 d95,
  at 350/700 HP), 1 fled (104606 d91, at 525/700 HP). Held:
  blocked-at:4,4 ×5, :4,3 ×1, :5,3 ×2, tbfight ×3. See F1 (104602)
  and F3 (wounded Heralds).
- **REFUSAL-HEARD: GO** — refused 58, spoken 12, badDays 0,
  dedupeDays 8. The once-a-day dedupe holds; refusals cluster late
  (104608: 17 refused, 4 spoken).
- **LADDER: OPENS** — peak stage 3, holds, all five tracks minted
  (fight 4, forage 17, craft 13, talk 9, explore 24).
- **TRICK PIPELINE: flows 8/8** — discovered 16–35/seed, taught
  0–3, tricksHeld 0–6 (herald/congregation/ad_break held on
  several seeds).
- **WAVE 4: 34 fights, 6 kills (0.75/seed), banked2=0, w5 unlocked
  0/8.** Player (scholar-bearer) deaths 23, wild 10.
- **WAVE 5: 0/8 unlocked, 0 faced, 0 killed.** The door never
  opened on this band.

## Q3 — PEOPLE CHECK: PASS (two full transcripts)
- **Natalia, 104601 day 60** (electrician, dry, trust 98): PASS.
  Opens with a secret ("I saw something in the woods I'm not
  telling anyone about") — the player's promise is kept and thanked
  ("I needed someone to know — and I needed it to stop with you.").
  The repay want carries a live thread: "About the pantry run —
  still open. That promise is dead, but the need isn't." The
  player's deflection lands with a consequence: "Okay. Your call."
  They file it away — unpaid, and counted. The ending plants an
  owe (the unpaid pantry run is counted, not forgotten) and closes
  warmly. Continuity holds across sittings.
- **Leo, 104602 day 60** (trail crew lead, restless, trust 94):
  PASS. Opens with a concrete want (water at 7 liters, can't carry
  alone, first light at the creek). The requirement is legible
  ("Stand beside your partner first — same side of the Haven door —
  then help."), the commit is answered with a real constraint ("Out
  on the road, away from Haven. A dawn meet's not something I can
  promise while I'm out — when I'm back, find me, and we'll set it
  then."). The goon leads to the betrayal-branch walk to the hollow
  — "Nothing much there — but they talk the whole way, and you learn
  the shape of them a little better." — relationship, not loot.
  Closes warmly ("...Think about it? I'll be around." / "Come back
  anytime."). The ending plants an owe (find Leo when he's back).
- Muster/march/fight voice read in the wild via the growth lines
  themselves (see Q1) and the muster outcomes — the line names real
  numbers and the real verb.

## Q4 — CENSUS (plain words)
Eight villages, 100–101 days. **All eight survived.** Last-living
pops: 7, 8, 8, 5, 10, 11, 10, 11. Standing at d100: 265, 175, 175,
175, 250, 100, 175, 190 — all regional, none national. Pantries at
end: 13,932 / 10,032 / 10,135 / 4,478 / 7,150 / 6,208 / 16,070 /
22,164 kcal.
- **104601 — the one that killed its Herald in the field.** 7 alive,
  standing 265. The Herald died d94 to villager combat, no muster,
  no ceremony. 10 fell (the wild 5, monster 2). Codex grew by 99
  (54 plants, 40 skills, 5 recipes).
- **104602 — the stranded muster (F1).** 8 alive, standing 175.
  The muster reached 11 and marched — and never fought. 4 fell (a
  stranger 2, the wild 1).
- **104603 — the march slay.** 8 alive, standing 175. The muster
  marched and slew the full-health Herald d82. 5 fell (arena 2,
  monster 1).
- **104604 — the hardest village.** 5 alive, standing 175. 13 fell
  (monster 4, starvation 3) — the thinnest pantry at end (4,478).
  Never reached 10 blades (max 9).
- **104605 — the fat one.** 10 alive, standing 250, pantry 7,150.
  7 fell (monster 2, the wild 2). Max 7 blades — the shallowest
  coalition on the panel.
- **104606 — the quiet one.** 11 alive, standing 100 (exactly the
  t4 bar), pantry 6,208. Only 1 fell (monster). The march fight fled
  d91 against a wounded Herald.
- **104607 — the late slay.** 10 alive, standing 175, pantry
  16,070. The muster marched 20 days, held 11 times, and slew the
  half-health Herald d95. 2 fell (contest 2).
- **104608 — the one-short village.** 11 alive, standing 190,
  pantry 22,164 (fattest). Sat at 9 blades for 28 straight days —
  the growth line never fired there (poolDays 0): no trust growth
  to name. 1 fell (ambush).
- **The dying:** 43 villagers fell across the eight villages (of
  394 death events — the rest are monsters the villagers killed).
  Named causes in the debriefs: the wild 8, monster 9, stranger 2,
  arena 2, starvation 3, contest 2, ambush 1 (debriefs name top
  causes only). Scholar bearers died 23 times (10 in the wild) —
  same total as r236 (23), fewer wild (16 → 10); no village lost a
  bearer chain outright.
- **What they knew:** the scholar's plant codex holds 58–99 entries
  per village at end. Wave-3 tricks: 16–35 discovered per seed,
  0–3 taught, 0–6 held.
- **What they carried:** bonds — 216 telemetry events, 105
  proposals, 30 decisions, 17 accepts (0.57; r236: 0.48). Joint
  favors are almost all forage_help (the r240 shape carries).
  Pantries end 4,478–22,164 kcal. Wave 4 reached on 8/8 seeds;
  wave-5 door never opened.
- **Social life:** wants are raised and answered; Natalia's unpaid
  pantry run and Leo's dawn meet are the game at its best — threads
  that persist across sittings with real consequences.

## New findings (for the tracker / next runs)

- **F1 — Ready muster strands when the titan leaves its lair
  (march gap, 104602).** The muster reached 11 (ready d66), marched
  twice, "arrived" at the lair both times — and no fight ever fired.
  The Herald moved tiles between the march days (lair [3,5] → [4,4])
  and then left the world census entirely after d67 (not slain —
  titanEnd.slain is empty). The march records arrival at stale
  coordinates; there is no re-chase and no "titan left" handling.
  The muster stood eating 1,000 kcal/blade/day and decayed 11 → 9
  (Haven 3 → 1) by d101. Owed to the march/titan build: chase the
  live tile (re-read the monster's position before walking), or
  stand the muster down when the titan leaves.
- **F2 — `villageStanding().links` reads 0 always (instrument).**
  The r237 depth metric first read links from standingTrace — 0 on
  every day of the pilot, even while musters drew allies from 2–6
  linked villages. The metric was re-pointed at musterLog.links
  (linksMax) before the panel; proof case (76) pins it. Whether
  standing.links is dead, mis-scoped, or counts something narrower
  is an open question for the standing build — the analyzer no
  longer uses it.
- **F3 — March fights engage already-wounded Heralds.** The two
  march slays were against Heralds at 350/700 (104607) and 700/700
  (104603); the fled fight was at 525/700 (104606). The titan takes
  field damage from villager fights before the march arrives, so
  the 2/3 march-slay rate flatters the coalition — the muster has
  not yet beaten a full-health Herald on this band except once.
  Watch, not a defect: the field damage is honest, but the
  full-strength bar should be read with it.
- **F4 — 104607's march held 11 times** (blocked-at:4,4 ×5, :4,3
  ×1, :5,3 ×2, tbfight ×3) across 20 march days; ready → fight
  latency 19 days. The march pathing through blocked tiles is the
  slow part, not the muster. (The r240 walkHome fix covers the
  walk home, not the march walk.)
- **F5 — Q2 wall stands at 4/8** (r235: 4/8, r236: 1/8, r237: 4/8 —
  band noise around the same wall). The growth line moves blades
  on 11 calls, but the coalition bar is set by trust/link depth
  (linksMax 3–6, meanTrust 67–88). The next lever is trust/link
  depth, not the signal. 104608 sat at 9 for 28 days with poolDays
  0 — no growth to name.
- **F6 — Service restart mid-gate (infra, not a write flap).** The
  first gate attempt died when the runtime service restarted
  (~16:09); the heartbeat loop died with it and was restarted by
  hand; no evidence lost; the gate re-ran clean to completion
  (1743s). The gate ran concurrently with a sibling gate
  (sim-partyquads-b) — the box ran ~2.7× slower than r236's gate,
  which explains the timeout cluster (see Gate).

## Verdicts (leg: deepening, days 40–80)
- **Reachable:** YES. Waves 3–4 fought on 8/8 seeds, regional
  links on 8/8, titans located on 8/8, musters called on 8/8,
  growth lines firing on 5/8, march slays on 2/8, a field slay on
  1/8. The deepening content is reachable.
- **Fun:** PARTLY. The coalition hunt now talks back — the growth
  line names the gap and the harvest is exact — and the march slays
  are the payoff the leg promises. But four villages sat one blade
  short for weeks (one for 28 days with nothing new to hear), a
  ready muster stranded without a fight (F1), and the Herald stood
  down or wandered off on three seeds. The line fixed the silence;
  the wall is still the 10-blade bar and the march's chase.
- **Winnable:** NOT on this band. Wave-4 kills 6 (0.75/seed),
  banked pairs 0, wave-5 door opened 0/8. The chain still binds at
  wave-4 kills and the 10-blade bar — the same wall r235/r236
  measured, now with the signal proven correct and the march gap
  named.

## Metric review (§14)
- **Q1 bar WORKS on the repaired harness.** 0 bad lines, 0
  repeats, 11/11 harvests exact on both legs. The F1 fix is proven;
  the r236 metric-review proposal is implemented — the growthWatch
  snapshot is now the dawn pool, so the existing bad-line join
  judges the line against the right comparator. No analyzer change
  was needed for Q1. Keep the bar as written.
- **Q2 bar — keep >= 6/8, read with depth.** 4/8 with linksMax
  3–6 and meanTrust 67–88 reported alongside. The bar is a property
  of the band's trust/link depth, not of the growth line — the
  depth fields now ride on the per-seed row (linksMax from
  musterLog, after the standing.links=0 catch).
- **F2 watch — REARM-GO, keep as a watch.** 6 resets, 3 rearmed
  same-day, 0 stale. The STALE detector worked (it would have
  caught the r236 shape). The reset log stays in the per-seed JSON.
- **Scholar deaths 23 total, 10 wild — WATCH, at bar.** Same total
  as r236 (23), fewer wild (16 → 10). No directional call owed.
- **Gate timeout cluster — load, not code.** 7 of the 12 gate
  failures are 120s timeouts on tests that passed in r236's gate,
  on a box running 2.7× slower with a sibling gate concurrent.
  Structural non-attribution is airtight (no src/js change; no
  failing test loads an r237 file). No quiet-box re-run — the
  proof is structural, not empirical.
- **Cache-flags 0/4 — the known load artifact** (AGENTS.md r187):
  panel completion under the spawn/timeout budget on a loaded box.
  Not a change under test.

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/deepening.json`
(metrics w3fights, engaged.w3, fightsTotal, fightsByWave.3):
**QUIET** (8 files, 4 metrics, no large deviations). Baseline not
rolled.

## Gate check
`node scripts/check.js --quick` in the worktree, log
`evidence/2026-11-18/journey-deepening-r237-gate.log` —
**330 passed, 12 failed in 1743s, 0 attributable.** The 12, each
verified pre-existing (no src/js change this run; no failing test
loads an r237 file):
- 7 load timeouts (exact 120s): living-garden-deed-attainment,
  one-person-army-deed-attainment (the standing deed-attainment
  timeout class), occupation-panels, solo-campaign-endings,
  trust-observer-neutrality, synergy-stall, capable-bot-20261014 —
  all 7 passed in r236's gate; the box ran 2.7× slower with a
  sibling gate concurrent.
- `test-measurement-proof-update.js` +
  `test-measurement-workflow.js` — the balance-proof manifest is
  STALE ("Proof source inputs are not current"). Same pair as
  r233/r236; the refresh is measurement-maintenance work, not
  this run's.
- `test-measurement-cache-flags.js` — 0/4, "both actual CLI
  configurations complete valid neutral panels" — the known
  box-load artifact (AGENTS.md r187), not a change under test.
- `test-phone-frame-proof.js` — phone-frame receipt staleness
  (same messages as r233/r236).
- `test-ladder-bundle-20261108.js` — same control fail (200
  monster turns WITHOUT delivery fire the ambient raid — fires 0).
- First gate attempt died to a service restart mid-run (log held
  only the header + dots); re-ran clean to completion. No evidence
  lost.
- Separately verified, NOT a gate failure: the r237 proof tests
  (muster 29/29, march 11/11, analyzer 75/75) all green in the
  worktree, and the r236 analyzer test still passes 70/70 on the
  r236 files (the fork regressed nothing).

## Closeout
- **Commits (branch `journey-deepening`):** (to be filled)
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 2→3 written with read-back; lock deleted at closeout
  after run_id verification.
- Worktree released (`merged`), branch deleted; final reap sweep
  clean. Main tree verified clean after the merge.
- The r237 panel corpus (per-seed JSONs + convo transcripts +
  analyzer log + gate log) lives under the goal hidden_files
  evidence dir for 2026-11-18; the repo evidence dir holds the
  prereg, this run note, and the pilot/panel/analyzer/gate logs.
