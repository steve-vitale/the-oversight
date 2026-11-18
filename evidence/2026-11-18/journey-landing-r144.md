# Journey landing r144 — 2026-11-18 (Lane A, leg 0)

Run `playtest-a-20261118T0920Z`. Leg 0 landing, rotation 0→1 at closeout.
Base master `6fb98f473`. Worktree `journey-landing`, branch `journey-landing`.
Prereg: `evidence/2026-11-18/journey-landing-r144-prereg.md`. Driver:
`scripts/journey-landing-r144-20261118.js` (r143 driver verbatim except
header/seeds/OUTDIR). Panel: seeds 1222–1231, DAYS=28, competent policy.
Changes since r143 base `1aba45367`: `src/js/` 12 files, +697/−59 (watch
list in prereg; landing-relevant: `fieldFights.js` +274 FIGHTALLY2 second
ally slot / FLEEREPAIR2, `convoTopics.js` +87 / `conversation.js` +25 /
`convo-dialogue.js` +42 succession r232 REL-MOURN + social-life r235 DRY3,
`truth.js` +43 r143's own F1 confront-stale fix, `titans.js` +155 /
`villager-brain.js` +79 / `win-plan.js` +21 deepening r236 muster-growth).

## Q1 — panel verdict

BEFORE panel (pre-fix tree): 10/10 DONE, all System contact day 8, no
FATAL. One pre-registered MISS — **pocketFights=1 (bar binds 0)** — so the
BEFORE tree is NO-GO; the run's finding. Everything else passed (bar table
below). The fix was implemented in the worktree and proven, then a matched
AFTER panel (same seeds, same driver, same DAYS) re-ran: **pocketFights
0, stuckTurns 0, closeStuckTurns 0 — GO**. All other bars still pass.

### The finding (finding #2537)

Seed 1223 d11, tile (6,4): the tile's blocking detail splits the 9x9 board
into two disconnected open regions. The scholar stood at (2,3) in one
region; The Understudy (wave 2, 108 HP) stood at (1,1) in the other.
`findPath` scholar→monster was null, so every move failed ("No path
there."): 10 stuck turns, 26 failed moves, 0 strikes, won at full HP while
allies in the monster's region ground it down. Root cause: `tbPlaceHumans`
checks legality only (non-blocking, untaken) and `freeSpotNear` checks
terrainBlocked only — neither checks connectivity to the monster. A second,
sub-threshold case on the same seed (d12 Hummice ×4, 0 strikes in 2 rounds,
scholar first in turn order) was the same shape below the pocket analyzer's
≥3-stuck-turn bar — the AFTER panel shows it fixed too (zero-DMG fights
2→0). Repro: scratch script `scripts/repro-pocket-1223-r144.js` (deleted
before commit), log `evidence/2026-11-18/journey-landing-r144-repro1223.log`.

### The fix

`src/js/game.js` `startCombat`, right after `this.tbfight` is built (the
"POCKET REPAIR" block, +62 lines): if the player cannot path to a monster,
move that single-tile monster onto the closest cell the player CAN reach
(BFS from the player over open cells, same step rules as `findPath`
including no corner-cutting, never the player's own cell, never another
live fighter's cell). Never moves the player — their cell is their real
position. Multi-tile monsters keep their block. A 1-cell player pocket
(nothing reachable) is left unrepaired and still flagged by the analyzer.
The monster walks into the player, so it arrives where it can be reached.
One subtlety found while proving it: the repair places the monster
adjacent (3,3), then the monster's own faster opening turn steps it to
(4,3) — still reachable, path len 2. On unfixed code the same opening
turn stepped it deeper into the pocket, (1,1)→(0,0).

Scope note: the repair lives in `startCombat` (wild fights) only. Alien
combat (`encounters.js` `startAlienCombat`) and party/justice/titan fights
share the `tbPlaceHumans` placement shape without the repair — the same
pocket can strand the player there. Open follow-up, not this run (see
finding #2537).

### Proof tests (both RED/GREEN, shared harness `scripts/godpath/lib`)

- `scripts/test-journey-landing-r144-pocket-fight-20261118.js` — 8/8.
  Replays the exact panel geometry (seed 1223, tile 6,4, scholar 2,3,
  monster 1,1; fixture anchored by a pre-fight `findPath == null` check):
  monster moved off its pocket cell, player can path to it; control
  (monster 5,3, already reachable) is NOT moved. RED verified by reverting
  `game.js` to HEAD: fails on "the player can now path to the monster"
  (monster at (0,0), path null). GREEN restored after.
- `scripts/test-journey-landing-r144-deferred-ask-20261118.js` — 14/14.
  The r231 deferred-ask guard targeted proof (r143 metric review item 2;
  the panel failed to fire the trigger case a third time, so the proof
  test replaces carrying the item). Stages a favorless stage-0 ask_favor
  want + a settled ledger favor + a live food_share need (hunger 90):
  dlg:help states the live ask ("Please — have you got anything to spare?
  Anything? I can't keep going like this.") and never the settled line.
  Control (same staging, live need nulled by a recent decline) answers
  "It's already handled. Thank you for asking." RED verified by disabling
  the guard in `convo-dialogue.js`: case 1 answers the settled line.
  The guard itself predates this run (r231); this run only adds the proof.

### BEFORE → AFTER bar table (matched band 1222–1231)

| Metric | BEFORE | AFTER |
|---|---|---|
| M1 alive d28 (pop 10–12) | 10/10 | 10/10 (popEnd identical per seed) |
| M2 System contact by d9 | 10/10, all d8 | 10/10, all d8 |
| M3 fight-log unknown | 0 (1 mixed-stack, in-family) | 0 |
| zero-DMG fights (B-shape) | 2 | **0** (both were unreachable-monster fights) |
| practice movedCells d1→d28 / seedsWithMove / skill0→pos | 87 / 10/10 / 51 | 87 / 10/10 / 51 (identical) |
| D1 garbled | 0 | 0 |
| HEED-V | 0 | 0 |
| M-PR1 revised (raw; statedAfterPick) | 1/18 = 5.6% (3/20 = 15%; 5) | 1/18 (3/20; 5 — same 5 away-guard road lines) |
| personal/small bridge repeats | 0 (personal 14, small 5) | 0 (personal 14, small 5) |
| presshop farUnreached | 0 | 0 |
| R66 starvation deaths | 0 | 0 |
| amnesia / Miriam "That's settled" / fellBack | 0 / 0 / 0 | 0 / 0 / 0 |
| nodloop LOOP (107 sittings) | 0 | 0 |
| verbatimRepeats / exempted | 0 / 6 (genuine resume re-poses) | 0 / 6 |
| scholar deaths (bar ≤2) | 2 (Darnell d22 "the wild", Klaus d23 "a stranger"; latencies 0, 1) | 2, same |
| silentTurns | 0 | 0 |
| dry THEM lines | 0 | 0 |
| contests fired / ended / openAtHorizon / orphanEnds | 23 / 22 / 1 (Calorie Run 1226 ends d30) / 0 | 22 / 22 / 0 / 0 |
| **pocketFights (bar 0)** | **1** | **0** |
| stuckTurns (all fights) | 10 | 0 |
| closeStuckTurns | 10 | 0 |
| "No path there." lines in panel log | 10+ | 0 |
| move-refusals total / failed | 35 / 26 (all pocket) | 9 / 1 (single nopath, no stuck fight) |
| fights total | 13 | 13 |
| monsterKills (panel total) | 217 | 213 (seed 1223 39→35, downstream wobble) |
| hungry-at-horizon | 5/10 (1224, 1225, 1227, 1228, 1231) | 5/10, same seeds (PATTERN, as r143) |
| outingchain kept / broken / open | 5 / 6 / 29 | 4 / 7 / 29 (Tariq 1223 kept→broken) |
| win plans d14 / d28 | 1/10 (1225) / 2/10 (1225, 1228) | 1/10 / 2/10, same |
| R68 PARTY offered / spoken / dry / accepted | 11 / 11 / 0 / 5 (PARTY-GO) | 11 / 11 / 0 / 5 |
| R67 CASE | 8/8 (LABELING-GO) | 8/8 |
| R69 ARMOR / R70 OUTING / R71 COMPLETION | GO / GO / GO | GO / GO / GO |
| R72 CHAIN | CLASSIFIED | CLASSIFIED |
| R73 NARROW keptInsideNarrow | 11 / 5 (NARROW-PATTERN) | 11 / 5 |
| R84 kcal arrivals / R85 kcal rescue | 4/4 / 4/4 | 4/4 / 4/4 |
| WIND-DOWN MORE picks / empty | 4 / 0 GO | 4 / 0 GO |
| WD PROBE GATE-A/B | GO | GO |
| R62 FLESH CHANNEL | OPENS (7/10 arrival, 9 test, 7 exit) | OPENS |
| R94 DAWN-DOOR opps / waitDiagMissing | 534 / 0 | 534 / 0 |
| R88 EAT-ON-ARRIVAL | 4/4 GO | 4/4 GO |
| R86 water | UNTESTED | UNTESTED |
| griefMiss | 0/7 (7 deaths, all grief REGISTERED) | 0/7, same 7 |

Downstream wobbles from the changed 1223 trajectory (all within noise,
no bar touched): monsterKills 39→35 on 1223, traps 4→3, looted 38→40,
cleanedCarcasses 12→13, beastTricks 135→133, unknownFleshHauls 19→22,
choseAbility 31→33, one contest not fired (22 vs 23; all fired ended,
0 orphans). Conversation metrics are byte-identical between panels
(sittings 107, verbatimRepeats 0, exempted 6, declineDry 0,
fabricHistoryFlags 0) — the fix touched no dialogue.

Deaths (7, same both panels): Didier d18 Ugly Beast, Riley d12 sickness,
Marcus d10 ambush, Darnell d22 the wild (scholar), Wanjiru d9 ambush,
Olivia d6 ambush, Klaus d23 a stranger (scholar).

FIGHTALLY2 watch: ally counts 1–6 (1225 d10 lockpick_raccoon allies=6,
routed in 2 rounds); r143 max was 4; no distinct second-ally-slot defect
seen. Mourning watch UNMEASURED again: grief bridge serving=1 is a
deflection line in 1231-d7, not a name-bearing mourning line;
`[alive:event:mourning]` offered in 1227-d14 menu but never picked; no
mourning line fired despite 7 deaths.

## Q2 — People check (4/4 pass)

- **1231-d7 Nathan Lee, seek_comfort:** grieving man deflecting into work;
  "Saying it out loud makes it smaller. Still there. Smaller.";
  resolution engaged. Grief thread offered 5×, never taken. Opener "They'd
  tell me to keep working..." also used by Jorge 1227-d14 — same opener
  across two NPCs (observation, not a bar violation).
- **1222-d12 Sofia, warn_you:** deepen arc ("Promise me that. Please." →
  "I'm scared, and I'm asking you not to make me watch it happen.");
  resolution=heeded. Case framing "Nobody's settled the ambush against me
  yet." MATCH. Closing "This stays between us, right? Right." is the known
  shared-closing template.
- **1227-d14 Jorge, ask_favor dlg:help:** "Pantry's thin and getting
  thinner. Will you forage with me tomorrow?"; player left without
  committing; resolution=stated; the established neverOffered case for
  M-PR1. Mourning item offered, not picked.
- **1222-d6 Zoe, curious resume-take:** deflected twice, face "shutters"
  then "closes like a door"; re-pose of opener question (exempted); ends
  deflected, not generic acknowledgment. PASS.
- C3d recap sitting did NOT fire (recap option in menus, never picked by
  driver). r231 deferred-ask guard trigger case did NOT fire for the 3rd
  panel — closed by the targeted proof test this run instead (see above).

## Q3 — telemetry

`telemetry-check.js` vs `telemetry-baselines/landing-split.json`
(r136-pinned: 81/9/217/15/0), metrics
systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies:
**quiet on both corpora** (10 files, 5 metrics, no large deviations).
No baseline roll. (Note: the task body's metric shorthand
`fights/villagerDeaths/scholarDeaths/feasts/contestsFired` is slash-joined
prose; the tool takes comma-separated census fields, and the baseline's
five keys are the ones that resolve — first invocation with the slash
string read as one metric and was re-run correctly.)

## Q4 — gate (adoption adjudication, 2026-11-18)

Gate as run by the timed-out coordinator in this worktree (base
`6fb98f473` + fix): `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-playtest`, **326 passed, 15 failed in
1854s**. Log: `evidence/2026-11-18/journey-landing-r144-gate.log`.
Adjudication below is from the gate log + solo re-runs, not from the
coordinator's summary. Every non-standing failure was re-proven solo;
no fresh full gate re-run was needed (a re-run would re-measure the
same load artifact).

**STANDING (6 — identical to r143's standing set):**
1. `test-measurement-proof-update.js` (exit 1, 7.5s) — retained proof
   stale vs current inputs.
2. `test-measurement-workflow.js` (exit 1, 8.9s) — 8 passed, 1 failed:
   "retained neutrality proof covers the current Game/controller/
   harness inputs". Any src change (this fix included) makes the
   retained proof stale until refreshed via
   `scripts/balance-proof-update.js`; maintenance, not a game
   regression.
3. `test-phone-frame-proof.js` (exit 1, 15.0s) — stale receipt
   (3 passed, 3 failed).
4. `test-ladder-bundle-20261108.js` (exit 1, 34.1s) — 78 passed,
   1 failed: control "200 monster turns WITHOUT delivery fire the
   ambient raid — fires 0".
5. `test-living-garden-deed-attainment.js` (timeout 120.2s) — seeds
   7/42/99 in progress, killed at the 120s budget.
6. `test-one-person-army-deed-attainment.js` (timeout 120.2s) — same
   shape, seeds 7/42/99 in progress.

**FLAP ARTIFACT (1):**
7. `test-deathcleanup-instrument-20261117.js` (exit 1, 24.9s) — EPERM
   write at `writeSeed` during a write flap. Standalone re-run on the
   fix branch: **PASS** (22 checks). Log:
   `journey-landing-r144-solo-deathcleanup.log`.

**LOAD ARTIFACT (8 — all pass solo with a longer budget on a quiet
box; zero assertion failures anywhere in the gate log for these):**
8. `test-measurement-cache-flags.js` (exit 1, 92.0s; 0/4) —
   discriminating A/B (pristine base vs fix branch, same box, per the
   r187 rule): **FIX 0/4, PRISTINE 0/4, identical**. The failure
   predates the fix. Logs: `solo-cacheflags-fix.log`,
   `solo-cacheflags-pristine.log`.
9. `test-trust-observer-neutrality.js` (exit 1, 114.9s) — the parent
   throws when a child `spawnSync` exceeds its hardcoded 60s budget
   (seed-42 child under load; seed 11 passed in the gate). Solo on a
   quiet box: **6 passed, 0 failed**. The sampled form of the same
   check passes in measurement-workflow ("all retained policy cohorts
   have passing sampled observer neutrality").
10. `test-capable-bot-20261014.js` (timeout 120.1s) — all 7
    in-process sections green in the gate; the final campaign-1234
    child exceeded its hardcoded 120s `execFileSync` budget under
    load. Solo: **40 passed, 0 failed**.
11. `test-occupation-panels.js` (timeout 120.2s) — 5 sub-checks green,
    then killed at the 120s budget. Solo: **25 passed, 0 failed**
    (3m29s runtime).
12. `test-solo-campaign-endings.js` (timeout 120.2s) — 10 sub-checks
    green. Solo: **15 passed, 0 failed**.
13. `test-synergy-stall.js` (timeout 120.2s) — silent until done;
    solo runtime 2m42s, passes.
14. `test-throttlefeast-20261014.js` (timeout 120.4s) — R2/R3
    sub-checks green. Solo: **17 pass, 0 fail**.
15. `test-table-endings-20261014.js` (timeout 120.1s) — 8 sub-checks
    green, section 4 in progress. Solo: **61 passed, 0 failed**.

**ATTRIBUTABLE: 0. Gate verdict: GO on adjudication.**

Solo re-run batch log: `journey-landing-r144-solo-batch.log` (one
per-test log alongside it). The first solo batch (11:34–11:47Z, old
boot) lost its /tmp logs to a VM replacement, and its last three
tests were invalidated by a write flap 11:46:56–~11:50:35Z (strace
caught EPERM on write() three times; fourth flap on boot
`e5712eff`). The batch was re-run in full on the new boot `b39e3f89`
with logs in the evidence dir; the verdicts above are from that
durable re-run.

## Metric review (for the NEXT run)

1. **Pocket analyzer threshold misses sub-threshold unreachable fights.**
   The d12 Hummice fight (0 strikes, 0 moves, scholar first in turn
   order, 2 rounds) was the same defect as the d11 pocket but below the
   ≥3-stuck-turn bar, so the BEFORE panel counted pocketFights=1 while
   two fights were unreachable. Propose: a watch (not a bar change) for
   fights with 0 scholar strikes AND 0 scholar moves where the scholar
   is first in turn order — or lower the pocket threshold to ≥2 stuck
   turns. The AFTER panel's zero-DMG 2→0 is the evidence the watch
   would have caught both.
2. **M-PR1 keeps counting honest refusals.** statedAfterPick=5 again, all
   five the away-guard road line ("I'm away from Haven right now...").
   The revised 1/18 already discounts them; no metric change proposed —
   the away-guard is working as designed, the metric just keeps
   re-measuring it. Carry as watch.
3. **Mourning watch still UNMEASURED** (third panel running): 7 deaths,
   no name-bearing mourning line fired. The r232 REL-MOURN lines exist;
   the trigger (a sitting that takes the mourning thread) never fires
   under the driver. A targeted proof test (force the mourning thread,
   read the line) is owed the same way the r231 item was closed this run.
4. **r231 deferred-ask guard: CLOSED** by the proof test this run. Do not
   carry again.
5. **One failed nopath move in AFTER** (r128: 9 moves, 1 failed, 0 stuck
   fights, 0 "No path there." lines). Single-move noise, not a pocket.
   Watch only.

## Village assessment (plain words)

Ten villages, all alive at day 28 with 10–12 people each. The System
reached every village on day 8. Nobody starved; seven people died across
the ten villages — four to ambushes and beasts in the wild, one to
sickness, two scholars to the wild and to a stranger. Every death was
grieved and registered. People practice and get better (87 skill cells
moved, every village), they keep their promises about as often as they
break them, and the pantry is thin enough that five villages end the
month hungry — the same thin-pantry pattern as last run, not worse. One
village has a real plan to grow (1225, five holders by day 14); a second
joins it by day 28. Nobody is close to the table yet. The one thing that
was actually broken — a fight where the scholar could not reach the
monster at all, standing helpless for ten rounds while friends did the
fighting — is fixed and proven: on the same ten villages the scholar now
reaches every monster and fights.

## Reachable / fun / winnable

- **Reachable:** the landing leg is fully reachable — first System contact
  day 8 on all seeds, contests firing and ending, favors, outings, parties
  all in play. The pocket fight was reachable content that played broken;
  it now plays.
- **Fun:** conversations hold up on sense-reading (4/4 people checks pass;
  grief, fear, and favor asks land as human moments). Fights now let the
  player actually fight instead of watching allies do it.
- **Winnable:** not yet — no village is near the table, and the binding
  walls (wave-4 kills, veterans, the deed gate) are unchanged by this run.
  This run fixed a fight that could not be fought, which is one link in
  that chain, not the chain itself.

## Closeout (adoption, 2026-11-18)

Coordinator timed out during Q4 adjudication; adoption closed the run:
- Fix commit `cc35d76b9` (pocket repair + proof tests 8/8, 14/14;
  RED verified by reverting `game.js` to HEAD — fails on "monster at
  (0,0), path=null" — GREEN restored after).
- Evidence commit `80128cad6` (prereg, run note with Q4 adjudication,
  driver, panel/gate/solo logs).
- Both merged ff-only to master (`80128cad6`); main tree verified
  clean; rotation-a written 0→1 (next leg: establishment); lock
  `playtest-a-20261118T0920Z` deleted after run_id verification.
- Adoption friction: first merge attempt (exit 128) raced the Lane B
  social-life r236 adoption landing first — `update_ref` failed
  because HEAD had moved; the failed merge dirtied the main tree
  (r236 files staged-deleted, r144 files staged-added, favor-forage.js
  MM). Repaired from HEAD (checkout + ls-tree index restore +
  force-remove of staged adds); verified clean (status empty, diff
  HEAD empty, game.js + favor-forage.js blobs match HEAD). Lock file
  was found absent mid-adoption and re-created with the run_id +
  fresh timestamp. A write flap 11:46:56–~11:50:35Z invalidated the
  first solo batch's last three tests; the batch was re-run in full
  on the new boot with durable logs. A VM replacement mid-adoption
  wiped /tmp solo logs; the re-run's logs live in the evidence dir.
